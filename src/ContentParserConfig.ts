import { z } from 'zod';

export const contentParserConfigSchema = z
  .object({
    root: z.string().describe('The root path of your content files'),
    debug: z.boolean().default(false).describe('Prints some debug logs'),
    idKey: z.string().default('hrid').describe('The global id key that all content must have'),
  })
  .strict();

export type ContentParserConfigInput = z.input<typeof contentParserConfigSchema>;
export type ContentParserConfig = z.output<typeof contentParserConfigSchema>;
