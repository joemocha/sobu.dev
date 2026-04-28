import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { KIND_LABELS, noteHref, hostnameOf } from '../data/notes.ts';

function descriptionFor(note: Awaited<ReturnType<typeof getCollection<'notes'>>>[number]): string {
  const d = note.data;
  const body = (note.body ?? '').replace(/\s+/g, ' ').trim();
  switch (d.kind) {
    case 'status':
      return body;
    case 'til':
      return body || d.title;
    case 'aside':
      return body || d.title || '';
    case 'link':
      return `${hostnameOf(d.original)} — ${body}`.trim();
    case 'quote':
      return `"${d.quote}" — ${d.source}${body ? ` // ${body}` : ''}`;
  }
}

function titleFor(note: Awaited<ReturnType<typeof getCollection<'notes'>>>[number]): string {
  const d = note.data;
  const kindLabel = KIND_LABELS[d.kind];
  switch (d.kind) {
    case 'til':
      return `${kindLabel}: ${d.title}`;
    case 'aside':
      return d.title ? `${kindLabel}: ${d.title}` : `${kindLabel} · ${d.date}`;
    case 'link':
      return d.title ? `${kindLabel}: ${d.title}` : `${kindLabel}: ${hostnameOf(d.original)}`;
    case 'quote':
      return `${kindLabel}: ${d.source}`;
    case 'status':
      return `${kindLabel} · ${d.date}`;
  }
}

export async function GET(context: APIContext) {
  const notes = (await getCollection('notes')).sort((a, b) =>
    a.data.date < b.data.date ? 1 : -1
  );

  return rss({
    title: 'Samuel Obukwelu — Notes',
    description:
      'Short notes from Samuel Obukwelu — TILs, links, status updates, quotes, off-cuts.',
    site: context.site ?? 'https://sobu.dev',
    items: notes.map((n) => ({
      title: titleFor(n),
      pubDate: new Date(n.data.date),
      description: descriptionFor(n),
      link: noteHref(n.id),
    })),
    customData: '<language>en-us</language>',
  });
}
