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
    marginalia: z.record(z.string(), marginaliaItem).optional(),
    footnotes: z.record(z.string(), z.string()).optional(),
  }),
});

const tagsArr = z.array(z.string()).optional();

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('til'),
      date: z.string(),
      title: z.string(),
      tags: tagsArr,
    }),
    z.object({
      kind: z.literal('aside'),
      date: z.string(),
      title: z.string().optional(),
      tags: tagsArr,
    }),
    z.object({
      kind: z.literal('link'),
      date: z.string(),
      original: z.string().url(),
      title: z.string().optional(),
      tags: tagsArr,
    }),
    z.object({
      kind: z.literal('status'),
      date: z.string(),
      tags: tagsArr,
    }),
    z.object({
      kind: z.literal('quote'),
      date: z.string(),
      quote: z.string(),
      source: z.string(),
      source_url: z.string().url().optional(),
      tags: tagsArr,
    }),
  ]),
});

export const collections = { blog, notes };
