import { test } from 'vitest';
import { z } from 'zod';
import { ContentParser } from '@/ContentParser.ts';
import * as path from 'node:path';

const ItemDetailSchema = z
  .object({
    hrid: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
  })
  .strict();

const LootDetailSchema = z
  .object({
    hrid: z.string(),
    items: z.array(
      z.object({
        // TODO(@Isha): Make ids reference each other
        hrid: z.string(),
        weight: z.number().min(1),
      }),
    ),
  })
  .strict();

const contentParser = new ContentParser(
  {
    item: ItemDetailSchema,
    loot: LootDetailSchema,
  },
  {
    path: path.dirname(__dirname) + '/tests/content',
    idKey: 'hrid',
    debug: true,
  },
);

test('adds 1 + 2 to equal 3', () => {
  contentParser.parseAllYamlFiles();
  const content = contentParser.getContent('loot');
  const loot = content['/items/orange'];
  console.log(loot.items);
});
