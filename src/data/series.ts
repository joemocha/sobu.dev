// Series metadata + per-slug overrides. Used by the article route to
// render the series ladder, prev/next cards, and the masthead "Issue".
//
// `slug` is the .mdx filename stem.

export type Rung = { n: number; title: string; slug: string };

export type SeriesInfo = {
  series: string | null;
  part: number | null;
  partsTotal: number | null;
  ladder: Rung[] | null;
  issue: string;
};

const HARNESS: Rung[] = [
  { n: 1, title: 'I Was Supposed to Be a Simple Repo Harness', slug: 'i-thought-i-was-building-a-simple' },
  { n: 2, title: 'My First Breath and Why the Rules Showed Up Fast', slug: 'the-first-working-harness-was-already' },
  { n: 3, title: 'When I Stopped Being a Script and Became a Runtime', slug: 'part-3-when-i-stopped-being-a-script' },
  { n: 4, title: 'How I Learned to See Myself', slug: 'part-4-how-i-learned-to-see-myself' },
  { n: 5, title: 'Drawing the Lines That Bind', slug: 'part-5-drawing-the-lines-that-bind' },
];

const PALATE: Rung[] = [
  { n: 1, title: "The Spaghetti Test — Why AI Can't Taste Your Code", slug: 'developer-palate-series-part-1-the-spaghetti-test' },
  { n: 2, title: 'From Recipe Follower to Menu Creator', slug: 'developer-palate-series-part-2-of' },
  { n: 3, title: 'The Burnt Garlic Theory of Learning', slug: 'developer-palate-series-part-3-of' },
  { n: 4, title: 'Dinner Rush Decisions', slug: 'developer-palate-series-part-4-dinner' },
  { n: 5, title: 'Your Signature Dish', slug: 'developer-palate-series-part-5-your' },
];

const SERIES_BY_SLUG: Record<string, SeriesInfo> = {
  'i-thought-i-was-building-a-simple': { series: 'Agent Harness', part: 1, partsTotal: 5, ladder: HARNESS, issue: '009' },
  'the-first-working-harness-was-already': { series: 'Agent Harness', part: 2, partsTotal: 5, ladder: HARNESS, issue: '010' },
  'part-3-when-i-stopped-being-a-script': { series: 'Agent Harness', part: 3, partsTotal: 5, ladder: HARNESS, issue: '011' },
  'part-4-how-i-learned-to-see-myself': { series: 'Agent Harness', part: 4, partsTotal: 5, ladder: HARNESS, issue: '012' },
  'part-5-drawing-the-lines-that-bind': { series: 'Agent Harness', part: 5, partsTotal: 5, ladder: HARNESS, issue: '013' },
  'developer-palate-series-part-1-the-spaghetti-test': { series: 'Developer Palate', part: 1, partsTotal: 5, ladder: PALATE, issue: '001' },
  'developer-palate-series-part-2-of': { series: 'Developer Palate', part: 2, partsTotal: 5, ladder: PALATE, issue: '002' },
  'developer-palate-series-part-3-of': { series: 'Developer Palate', part: 3, partsTotal: 5, ladder: PALATE, issue: '003' },
  'developer-palate-series-part-4-dinner': { series: 'Developer Palate', part: 4, partsTotal: 5, ladder: PALATE, issue: '004' },
  'developer-palate-series-part-5-your': { series: 'Developer Palate', part: 5, partsTotal: 5, ladder: PALATE, issue: '005' },
  'an-odd-lesson-on-the-way-to-creating': { series: null, part: null, partsTotal: null, ladder: null, issue: '008' },
  'ooda-loops-and-git-worktrees-nine': { series: null, part: null, partsTotal: null, ladder: null, issue: '007' },
};

export function seriesFor(slug: string): SeriesInfo {
  return SERIES_BY_SLUG[slug] ?? { series: null, part: null, partsTotal: null, ladder: null, issue: '099' };
}

export function articleHref(slug: string): string {
  // Harness Pt 1 keeps its bespoke route at /article.html; everything else
  // lives under /articles/<slug>.html.
  if (slug === 'i-thought-i-was-building-a-simple') return '/article.html';
  return `/articles/${slug}.html`;
}

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${String(d).padStart(2, '0')}, ${y}`;
}

export function readTime(words: number): string {
  return `${Math.max(1, Math.round(words / 230))} min`;
}
