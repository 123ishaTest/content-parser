# Content Parser

> A utility library that parses YAML files based on Zod schemas
>
> The perfect way to manage your game content :)

## Usage

Create a content type with a [Zod](https://zod.dev) schema.

```ts
export const ItemDetailSchema = z.object({
  hrid: z.string(),
  name: z.string(),
  description: z.string(),
}).strict();
```

Create your content in YAML files.

```yaml
# fish.item.yaml
hrid: /items/fish
name: Regular Fish
description: Goes blub
```

And use the `ContentParser` to grab it.

```ts
const parser = new ContentParser({
  // The name of the key here determines the file.<name>.yaml that is searched.
  item: ItemDetailSchema,
});

const result = parser.parse({
  root: '/path/to/content',
  debug: true,
  idKey: 'hrid',
});

// Enjoy your content!
const items = parser.getContent('item');
const fish = items['/items/fish'];
const description = fish.description;

// Full TS support!
parser.getContent('wrongType'); // TS2345: Argument of type 'wrongType' is not assignable to parameter of type 'item'
fish.invalidAttribute; // TS2339: Property invalidAttribute does not exist on type ItemDetail
```

## Development

If you want to contribute to this project,
