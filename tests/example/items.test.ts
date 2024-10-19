import { describe, expect, test } from 'vitest';
import { ContentParser } from '@/ContentParser.ts';
import * as path from 'node:path';
import { ItemDetailSchema, LootDetailSchema } from '../models/Schemas.ts';

const parser = new ContentParser({
  item: ItemDetailSchema,
  loot: LootDetailSchema,
});

const result = parser.parse({
  root: path.dirname(__dirname) + '/example',
  debug: true,
});

describe('Basic content parsing', () => {
  test('finds a target item', () => {
    // Arrange
    const targetHrid = '/items/orange';

    // Act
    const items = parser.getContent('item');
    const item = items[targetHrid];

    // Assert
    expect(result.success).toBe(true);
    expect(item.hrid).toBe(targetHrid);
    expect(item.description).toBe('What is round and orange?');
  });
});
