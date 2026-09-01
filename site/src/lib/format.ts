/**
 * Presentation helpers. Owned by slice 00.
 *
 * Locale is pinned to `en-GB` rather than left to the visitor's browser. Dates
 * on a static site are baked at build time, so a floating locale would produce
 * whatever the *build machine* happened to be set to — and then serve that one
 * rendering to everybody. Pinning it makes the output deterministic and the
 * choice visible.
 */

const LOCALE = 'en-GB';

const LONG = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const SHORT = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** `'long'` → 14 March 2026. `'short'` → 14 Mar 2026. */
export function formatDate(date: Date, style: 'long' | 'short' = 'long'): string {
  return (style === 'long' ? LONG : SHORT).format(date);
}

/** Machine-readable form for a `<time datetime="…">` attribute. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Where the build-time Open Graph image for a post lives.
 *
 * The endpoint that answers this path is slice 06's (`pages/og/[...slug].ts`).
 * The path shape is fixed here so every consumer agrees on it before that
 * endpoint exists.
 */
export function ogImageUrl(slug: string): string {
  return `/og/${slug}.png`;
}

/** Zero-padded rail numeral: 1 → "01", 10 → "10". */
export function railNumber(n: number): string {
  // padStart, not `'0' + n`. The naive form renders 10 as "010", and it only
  // shows up once a page has ten of something — which is late enough that the
  // reference implementation shipped it. See AGENTS.md gotcha 6.
  return String(n).padStart(2, '0');
}

/** "5 min read", from the value the remark plugin injected. */
export function readingLabel(minutesRead: number | undefined): string {
  return `${minutesRead ?? 1} min read`;
}
