import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const marginaliaItem = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('note'), who: z.string(), body: z.string() }),
  z.object({ kind: z.literal('gloss'), body: z.string() }),
  z.object({ kind: z.literal('redaction'), label: z.string(), reveal: z.string() }),
]);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    summary: z.string(),
    original: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    marginalia: z.record(z.string(), marginaliaItem).optional(),
    footnotes: z.record(z.string(), z.string()).optional(),
  }),
});

export const collections = { blog };
