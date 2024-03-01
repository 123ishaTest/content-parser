import { ContentParserConfig, ContentParserConfigInput, contentParserConfigSchema } from '@/ContentParserConfig.ts';
import { glob } from 'glob';
import * as fs from 'fs';
import { parse } from 'yaml';
import { z } from 'zod';
import { ParseResult } from '@/ParseResult.ts';
import { ContentError, ContentErrorType } from '@/ContentError.ts';
import { fromZodError } from 'zod-validation-error';

export class ContentParser<const T extends Record<string, S>, S extends z.AnyZodObject> {
  types: T;
  config: ContentParserConfig;

  constructor(types: T, config: ContentParserConfigInput) {
    const parsedConfig = contentParserConfigSchema.safeParse(config);
    if (!parsedConfig.success) {
      throw Error(fromZodError(parsedConfig.error).toString());
    }
    this.config = parsedConfig.data;
    this.types = types;
  }

  private getEmptyContent(): Record<keyof T, Record<string, z.infer<T[keyof T]>>> {
    // TODO(@Isha): Clean this instantiation and clearing up
    // @ts-ignore
    const content = {};
    Object.keys(this.types).map((type) => {
      // @ts-ignore
      content[type] = {};
    });
    // @ts-ignore
    return content;
  }

  public parseContent(): ParseResult<Record<keyof T, Record<string, z.infer<T[keyof T]>>>> {
    const content = this.getEmptyContent();
    const errors: ContentError[] = [];

    const filePaths = glob.sync(`${this.config.root}/**/*.yml`);
    this.debug(`Reading ${filePaths.length} files from`, this.config.root);

    const parsedYaml = filePaths.flatMap((filePath) => {
      const extension = filePath.replace('.yml', '').split('.').pop() as string;
      const fileName = filePath.replace(this.config.root, '');

      try {
        const parsedData = parse(fs.readFileSync(filePath, 'utf8'));
        return [
          {
            file: fileName,
            type: extension,
            data: parsedData,
          },
        ];
      } catch (e) {
        errors.push({
          file: filePath,
          type: ContentErrorType.InvalidYaml,
          message: `Could not parse file '${fileName}'. Is it valid yaml?`,
        });
      }
      return [];
    });

    parsedYaml.forEach((yaml) => {
      const schema = this.types[yaml.type];
      if (!schema) {
        errors.push({
          file: yaml.file,
          type: ContentErrorType.UnrecognizedContentType,
          message: `Unrecognized contentType '${yaml.type}'`,
        });
        return;
      }

      const zodResult = schema.safeParse(yaml.data);
      if (!zodResult.success) {
        const validationError = fromZodError(zodResult.error);

        errors.push({
          file: yaml.file,
          type: ContentErrorType.ZodValidationFailed,
          message: validationError.toString(),
        });
        return;
      }

      const id = yaml.data[this.config.idKey];
      if (!id) {
        errors.push({
          file: yaml.file,
          type: ContentErrorType.MissingGlobalIdKey,
          message: `Content does not seem to have the global idKey '${this.config.idKey}'`,
        });
        return;
      }

      if (content[yaml.type][id]) {
        errors.push({
          file: yaml.file,
          type: ContentErrorType.DuplicateId,
          message: `Duplicate id '${id}'`,
        });
        return;
      }
      content[yaml.type][id] = zodResult.data as z.infer<S>;
    });

    return {
      content: content,
      errors: errors,
      success: errors.length === 0,
    };
  }

  private debug(...args: any[]) {
    if (this.config.debug) {
      console.log(...args);
    }
  }
}
