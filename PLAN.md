# Notes on sobu.dev — Plan

Status: Stage 1 shipped · Stage 2 shipped · pagination deferred until needed

## Purpose

A single notes system that handles five jobs: TILs, linkblog posts, status/microblog, quotes-with-gloss, and essay off-cuts. One stream, kind-discriminated, not five separate streams.

## Data model

- New collection: `src/content/notes/`, MDX files.
- Schema: `z.discriminatedUnion('kind', [...])` with five branches: `til | aside | link | status | quote`. Each branch carries only the fields its kind needs.
  - `til`: `date`, `title` (required), `tags?`
  - `aside`: `date`, `title?`, `tags?`
  - `link`: `date`, `original` (URL, required), `title?`, `tags?`
  - `status`: `date`, `tags?` (no title)
  - `quote`: `date`, `quote` (required), `source` (required), `source_url?`, `tags?`
- Slugs derive from filename: `2026-04-28-astro-glob-is-lazy.mdx` → `astro-glob-is-lazy`.
- Plain MDX bodies. **No** marginalia, **no** footnotes — those stay essay-only.

## Authoring

- `bun note <kind> [title-or-first-words]` creates the file, pre-fills frontmatter, opens `$EDITOR`.
- Kind-driven prompts/args:
  - `bun note status` — title-less, opens editor with body cursor
  - `bun note link "https://..." "Optional title"` — `original` required as first arg
  - `bun note quote "..." --source "Author, Book" [--source-url ...]`
  - `bun note til "Astro globs are lazy"`
  - `bun note aside "Two notes on naming"`
- **No auto-commit. No drafts.** Working tree is the draft state. You commit and push when ready.

## Routing & rendering

- `src/pages/notes/[slug].astro` — every note gets a permalink, including `status`. Renderer branches on `kind` via discriminated union narrowing.
- `src/pages/notes/index.astro` — archive in **inline full-content feed** form, kind-styled. Pagination at ~25 entries (deferred until needed).
- Per-kind visual treatment:
  - `status` — date · body · permalink dot. No title, no chrome.
  - `link` — source domain prominent above body; body is your commentary; "↗ original" link.
  - `quote` — left-rule blockquote · attribution line · your gloss below.
  - `til` — title · body · tags. Most essay-shaped of the kinds.
  - `aside` — optional title · body. Informal essay-shape.
- URL shape: flat `/notes/[slug]` (no `/YYYY/MM/` nesting).

## Homepage IA reorder

New section order:

1. Hero
2. HarnessTicker
3. §01 — Hats
4. §02 — TaskFast case study
5. §03 — Tactics
6. **§04 — Notes** *(new)*
7. **§05 — Writing** *(was §05)*
8. **§06 — Work / Resume** *(moved down from earlier in page)*
9. Contact

Notes strip (§04) shows the latest 5 notes regardless of kind:

```
§ 04 — Notes                  See all notes →

Apr 28  STATUS  Shipped TaskFast invoicing tonight. ·
Apr 27  TIL     Astro's glob loader is lazy until you call getCollection. ·
Apr 25  LINK    Simon Willison on prompt caching → simonwillison.net ·
Apr 24  QUOTE   "Make it work, then make it right..." — Kent Beck ·
Apr 22  ASIDE   The harness has a tell when it's about to crash. ·
```

Each row: date · KIND tag · one-line teaser · permalink dot. Whole row clickable to `/notes/[slug]`. "See all notes →" links to `/notes`.

## Syndication

- `/feed.xml` — essays only, full content (new; site has no RSS today).
- `/notes.xml` — notes only, full content.
- No combined firehose. Two distinct audiences.

## Cross-references

Use plain MDX links between essays and notes. No special component, no automated backlinks. Deferred.

## Cleanup

Prune the dead `tags` field from the `blog` schema in `src/content.config.ts`. It's declared but used by zero pages. Either commit to building `/tags/[tag]` for both collections, or remove the field. We're not building tag pages, so remove it.

## Launch — two stages

### Stage 1 (this PR)

- `notes` collection definition added to `src/content.config.ts`
- `src/content/notes/` directory + at least one seed note per kind
- `bun note` CLI script (with `package.json` script entry)
- `src/pages/notes/[slug].astro` (kind-aware renderer)
- `src/pages/notes/index.astro` (inline-feed archive)
- `src/components/NotesStrip.astro` (homepage §04 component)
- Homepage IA reorder in `src/pages/index.astro`:
  - Move work-history section below Writing as §06
  - Insert NotesStrip as §04
  - Renumber sections accordingly

### Stage 2 (shipped)

- `/feed.xml` (essays) via `@astrojs/rss` — `src/pages/feed.xml.ts`
- `/notes.xml` (notes) — `src/pages/notes.xml.ts`, kind-aware title and description builders
- Feed autodiscovery `<link rel="alternate">` tags added to `SiteLayout.astro`
- Inline tag rendering already present on archive (`.note-item-tags`) and permalink (`.note-tags`) from Stage 1
- Pruned `tags` field from blog schema in `src/content.config.ts`
- Removed `tags:` lines from all 12 existing blog `.mdx` files
- Pagination deferred — archive currently holds ~6 notes, kicks in past ~25

## Decisions log (with rationale)

| # | Decision | Rationale |
|---|----------|-----------|
| Q1 | Notes cover all 5 jobs | Maximum flexibility; one stream serves all |
| Q2 | One collection, kind-discriminated | Single sort, one feed, one route family; same pattern as marginalia |
| Q3 | Homepage strip + `/notes` archive (placement revised in Q12) | Notes need visibility without burying essays |
| Q4 | Local CLI for v1 | (a) is the trap; (b) cuts ~80% friction; (c) is premature |
| Q5 | Discriminated union schema | Build-time validation; consistent with existing pattern |
| Q6 | Permalink for every note | Linkability is the point; one route, one renderer |
| Q7 | Two feeds | Essay readers and note readers are different audiences |
| Q8 | Inline full content on archive | Notes are short; reader expects feed, not directory |
| Q9 | Plain MDX | Marginalia needs body to anchor; constraint is an authoring signal |
| Q10 | Manual commit, no drafts | Working tree IS draft state; auto-commit kills thinking |
| Q11 | Tags inline only on notes; prune dead blog tags | Don't carry phantom fields; kind already classifies |
| Q12 | Notes §04 above Writing; Resume moves below | Lead with thinking, then writing, then receipts |
| Q13 | Two-stage launch | Splits along publishing-vs-syndication seam |
