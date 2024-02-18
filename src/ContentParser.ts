import { ContentParserConfig } from '@/ContentParserConfig.ts';
import { glob } from 'glob';
import * as fs from 'fs';
import { parse } from 'yaml';
import { ParsedContent } from '@/ParsedContent.ts';
import { z } from 'zod';

export class ContentParser<const T extends Record<string, S>, S extends z.AnyZodObject> {
  types: T;
  config: ContentParserConfig;

  // TODO(@Isha): Clean this instantiation and clearing up
  content!: Record<keyof T, Record<string, z.infer<T[keyof T]>>>;

  constructor(types: T, config: ContentParserConfig) {
    this.types = types;
    this.config = config;

    this.clearContent();
  }

  public getAllYmlFiles(): string[] {
    // TODO(@Isha): Add include and exclude
    return glob.sync(`${this.config.path}/**/*.yml`);
  }

  public getAllYmlData(): ParsedContent[] {
    const filePaths = this.getAllYmlFiles();

    this.debug(`Reading ${filePaths.length} files from`, this.config.path);

    return filePaths.map((filePath) => {
      const extension = filePath.replace('.yml', '').split('.').pop() as string;
      const fileName = filePath.replace(this.config.path, '');

      try {
        const parsedData = parse(fs.readFileSync(filePath, 'utf8'));
        return {
          file: fileName,
          type: extension,
          data: parsedData,
        };
      } catch (e) {
        const message = `Could not parse file '${fileName}'. Is it valid yaml?`;
        console.error(message);
        throw new Error(message);
      }
    });
  }

  public parseAllYamlFiles(): void {
    this.clearContent();

    const parsedContent = this.getAllYmlData();
    parsedContent.forEach((content) => {
      const schema = this.types[content.type];
      if (!schema) {
        throw new Error(`Unrecognized contentType '${content.type}' in file '${content.file}'`);
      }

      const zodResult = schema.safeParse(content.data);
      if (!zodResult.success) {
        console.error(zodResult.error);
        console.error(`Could not load file '${content.file}'`);
        throw new Error(zodResult.error.toString());
      }

      const id = content.data[this.config.idKey];
      if (!id) {
        const message = `Content does not seem to have the global idKey '${this.config.idKey}' in file ${content.file}`;
        console.error(message);
        throw new Error(message);
      }

      if (this.content[content.type][id]) {
        console.error(`Duplicate id '${id}'`);
      }
      this.content[content.type][id] = zodResult.data as z.infer<S>;
    });
  }

  public getContent<const K extends keyof T>(key: K): Record<string, z.infer<T[K]>> {
    return this.content[key];
  }

  private clearContent(): void {
    // @ts-ignore
    this.content = {};
    Object.keys(this.types).map((type) => {
      // @ts-ignore
      this.content[type] = {};
    });
  }

  private debug(...args: any[]) {
    if (this.config.debug) {
      console.log(...args);
    }
  }
}
