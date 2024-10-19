import { describe, expect, test } from 'vitest';
import { ContentParser } from '@/ContentParser.ts';
import * as path from 'node:path';
import { ItemDetailSchema, LootDetailSchema } from '../models/Schemas.ts';
import { ContentErrorType } from '@/ContentError.ts';

const parser = new ContentParser({
  item: ItemDetailSchema,
  loot: LootDetailSchema,
});

describe('Invalid content parsing', () => {
  test('detects missing type', () => {
    // Arrange
    const result = parser.parse({
      root: path.dirname(__dirname) + '/errors',
    });

    // Act
    const contentTypeErrors = result.errors.filter((e) => e.type === ContentErrorType.UnrecognizedContentType);

    // Assert
    expect(result.success).toBeFalsy();
    expect(contentTypeErrors).toHaveLength(1);
  });

  test('detects missing field', () => {
    // Arrange
    const result = parser.parse({
      root: path.dirname(__dirname) + '/errors',
    });

    console.log(result);
    // Act
    const contentTypeErrors = result.errors.filter((e) => e.type === ContentErrorType.ZodValidationFailed);

    // Assert
    expect(result.success).toBeFalsy();
    expect(contentTypeErrors).toHaveLength(1);
  });
});
