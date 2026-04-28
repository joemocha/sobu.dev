import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { articleHref } from '../data/series.ts';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog')).sort((a, b) =>
    a.data.date < b.data.date ? 1 : -1
  );

  return rss({
    title: 'Samuel Obukwelu — Essays',
    description:
      'Long-form essays from Samuel Obukwelu. Developer Palate, Agent Harness, and standalone pieces.',
    site: context.site ?? 'https://sobu.dev',
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: new Date(p.data.date),
      description: p.data.summary,
      link: articleHref(p.id),
    })),
    customData: '<language>en-us</language>',
  });
}
