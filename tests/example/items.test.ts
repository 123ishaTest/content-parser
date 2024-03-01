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

describe('Basic content parsing', () => {
  test('finds a target item', () => {
    // Arrange
    const targetHrid = '/items/orange';

    // Act
    const items = result.content.item;
    const item = items[targetHrid];

    // Assert
    expect(item.hrid).toBe(targetHrid);
  });
});
