#!/usr/bin/env bun
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

type Kind = 'til' | 'aside' | 'link' | 'status' | 'quote';
const KINDS: readonly Kind[] = ['til', 'aside', 'link', 'status', 'quote'] as const;

const NOTES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'notes');

function usage(): never {
  console.error(`Usage:
  bun note <kind> [args...]

Kinds:
  bun note status                            # title-less, body in editor
  bun note til    "Astro globs are lazy"
  bun note aside  ["optional title"]
  bun note link   "https://..." ["optional title"]
  bun note quote  "..." --source "Author, Book" [--source-url ...]
`);
  process.exit(1);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'note';
}

function takeFlag(args: string[], name: string): string | undefined {
  const idx = args.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (idx === -1) return undefined;
  const tok = args[idx];
  if (tok.includes('=')) {
    args.splice(idx, 1);
    return tok.slice(tok.indexOf('=') + 1);
  }
  const val = args[idx + 1];
  args.splice(idx, 2);
  return val;
}

function yamlEscape(s: string): string {
  // Wrap any string we write in double quotes; escape \ and " inside.
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function buildFrontmatter(fields: Record<string, string | string[] | undefined>): string {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      lines.push(`${k}: [${v.map(yamlEscape).join(', ')}]`);
    } else {
      lines.push(`${k}: ${yamlEscape(v)}`);
    }
  }
  lines.push('---', '', '');
  return lines.join('\n');
}

function writeAndOpen(filename: string, body: string) {
  if (!existsSync(NOTES_DIR)) mkdirSync(NOTES_DIR, { recursive: true });
  const path = join(NOTES_DIR, filename);
  if (existsSync(path)) {
    console.error(`Refusing to overwrite existing file: ${path}`);
    process.exit(1);
  }
  writeFileSync(path, body, 'utf8');
  console.log(`Created ${path}`);
  const editor = process.env.EDITOR || 'vi';
  const r = spawnSync(editor, [path], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`Editor exited with status ${r.status}. File is at ${path}.`);
  }
}

function makeFilename(date: string, slug: string): string {
  return `${date}-${slug}.mdx`;
}

const argv = process.argv.slice(2);
if (argv.length === 0) usage();

const kind = argv.shift() as Kind;
if (!KINDS.includes(kind)) {
  console.error(`Unknown kind: ${kind}`);
  usage();
}

const date = takeFlag(argv, 'date') ?? todayIso();

switch (kind) {
  case 'status': {
    const slugSeed = argv.join(' ').trim() || 'status';
    const filename = makeFilename(date, slugify(slugSeed));
    const body = buildFrontmatter({ kind, date }) + '\n';
    writeAndOpen(filename, body);
    break;
  }
  case 'til': {
    const tags = takeFlag(argv, 'tags');
    const title = argv.join(' ').trim();
    if (!title) {
      console.error('til requires a title: bun note til "your insight"');
      process.exit(1);
    }
    const filename = makeFilename(date, slugify(title));
    const body = buildFrontmatter({
      kind,
      date,
      title,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    }) + '\n';
    writeAndOpen(filename, body);
    break;
  }
  case 'aside': {
    const title = argv.join(' ').trim() || undefined;
    const slugSeed = title ?? 'aside';
    const filename = makeFilename(date, slugify(slugSeed));
    const body = buildFrontmatter({ kind, date, title }) + '\n';
    writeAndOpen(filename, body);
    break;
  }
  case 'link': {
    const original = argv.shift();
    if (!original || !/^https?:\/\//.test(original)) {
      console.error('link requires a URL as the first arg: bun note link "https://..." [title]');
      process.exit(1);
    }
    const title = argv.join(' ').trim() || undefined;
    const slugSeed = title ?? new URL(original).hostname.replace(/^www\./, '');
    const filename = makeFilename(date, slugify(slugSeed));
    const body = buildFrontmatter({ kind, date, original, title }) + '\n';
    writeAndOpen(filename, body);
    break;
  }
  case 'quote': {
    const source = takeFlag(argv, 'source');
    const sourceUrl = takeFlag(argv, 'source-url');
    const quote = argv.join(' ').trim();
    if (!quote) {
      console.error('quote requires the quote text: bun note quote "..." --source "Author"');
      process.exit(1);
    }
    if (!source) {
      console.error('quote requires --source "Author, Title"');
      process.exit(1);
    }
    const slugSeed = quote.slice(0, 50);
    const filename = makeFilename(date, slugify(slugSeed));
    const body = buildFrontmatter({
      kind,
      date,
      quote,
      source,
      source_url: sourceUrl,
    }) + '\n';
    writeAndOpen(filename, body);
    break;
  }
}
