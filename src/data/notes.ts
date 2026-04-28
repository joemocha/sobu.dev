export type NoteKind = 'til' | 'aside' | 'link' | 'status' | 'quote';

export const KIND_LABELS: Record<NoteKind, string> = {
  til: 'TIL',
  aside: 'ASIDE',
  link: 'LINK',
  status: 'STATUS',
  quote: 'QUOTE',
};

export function noteHref(slug: string): string {
  return `/notes/${slug}.html`;
}

export function notesIndexHref(): string {
  return '/notes.html';
}

export function fmtNoteDateShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${String(d).padStart(2, '0')}`;
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
