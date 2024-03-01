import { describe, expect, test } from 'vitest';
import { ContentParser } from '@/ContentParser.ts';
import * as path from 'node:path';
import { ItemDetailSchema, LootDetailSchema } from '../models/Schemas.ts';

const contentParser = new ContentParser(
  {
    item: ItemDetailSchema,
    loot: LootDetailSchema,
  },
  {
    root: path.dirname(__dirname) + '/example',
    debug: true,
  },
);

const result = contentParser.parseContent();

describe('Type Safety', () => {
  test('retrieve all content by type', () => {
    // Act
    const items = result.content['item'];

    // Assert
    expect(Object.values(items)).toHaveLength(2);
  });

  test('compile error on wrong type', () => {
    // Act
    // @ts-expect-error key 'items' does not exist
    const items = result.content['items'] ?? [];

    expect(Object.values(items)).toHaveLength(0);
  });
});
