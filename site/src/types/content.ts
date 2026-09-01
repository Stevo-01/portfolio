import type { CollectionEntry } from 'astro:content';

/**
 * The disciplines the journal is organised around. Declared as a const tuple so
 * `content.config.ts` builds its Zod enum from the same values this type is
 * derived from — one list, no drift.
 *
 * Adding a slug here is only the first of four edits. The category also needs a
 * YAML entry in `content/categories/`, a `CATEGORY_ART` entry in
 * `components/journal/taxonomy.ts` (slice 04), and a hue and glyph in
 * `pages/og/_recipe.ts` (slice 06). The last three are total `Record`s keyed on
 * this type, so forgetting one is a compile error rather than an unstyled
 * cover.
 *
 * Which is the reason the set is fixed here, now, rather than grown later: the
 * reference implementation added two categories after the fact and each
 * addition rippled through four files. See docs/plans/CONTENT-MAP.md §6.
 */
export const CATEGORY_SLUGS = [
  'machine-learning',
  'llms-and-rag',
  'mlops',
  'data-science',
  'computer-vision',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface Category {
  slug: CategorySlug;
  title: string;
  description: string;
  order: number;
}

export interface Series {
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
}

/**
 * A published blog entry. Every `src/lib` query returns these; no page or
 * component should be handling a raw `getCollection('blog')` result — that
 * bypasses the draft filter. A hook flags it on write.
 */
export type Post = CollectionEntry<'blog'>;
