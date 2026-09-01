import { getCollection } from 'astro:content';

import type { CategorySlug } from '../../types/content';
import type { IconName } from '../../types/icons';

/**
 * Presentation metadata for the five disciplines. Owned by slice 04.
 *
 * `glyph` and `rotate` are cover-art decisions, not content, so they live here
 * rather than in the YAML slice 07 owns. `title` is only a fallback: every
 * consumer resolves the real title from the `categories` collection, so a
 * rename in content never leaves stale type on the artwork.
 *
 * Typed as a total Record. Adding a CategorySlug without adding it here is a
 * compile error rather than a silently unstyled cover.
 *
 * The rotations come from docs/plans/DESIGN-DELTA.md §5 and are deliberately
 * spread: two categories a few degrees apart produce covers nobody can tell
 * apart in a grid. All five stay inside the warm half of the wheel, because a
 * cover that rotates into green stops belonging to this site.
 */
export const CATEGORY_ART: Record<
  CategorySlug,
  { title: string; glyph: IconName; rotate: string }
> = {
  'machine-learning': { title: 'Machine Learning', glyph: 'brain', rotate: '0deg' },
  'llms-and-rag': { title: 'LLMs & RAG', glyph: 'sparkles', rotate: '-22deg' },
  mlops: { title: 'MLOps', glyph: 'cloud-cog', rotate: '18deg' },
  'data-science': { title: 'Data Science', glyph: 'bar-chart', rotate: '36deg' },
  'computer-vision': { title: 'Computer Vision', glyph: 'eye', rotate: '-42deg' },
};

/** Every category, ordered by its `order` field. */
export async function getOrderedCategories() {
  const cats = await getCollection('categories');
  return [...cats].sort((a, b) => a.data.order - b.data.order);
}

/** Display title for a slug, resolved from content with a design-side fallback. */
export async function categoryTitle(slug: CategorySlug): Promise<string> {
  const cats = await getCollection('categories');
  return cats.find((c) => c.data.slug === slug)?.data.title ?? CATEGORY_ART[slug].title;
}

/** The `series` entry matching a post's `series` slug, if any. */
export async function findSeries(slug: string | undefined) {
  if (!slug) return undefined;
  const all = await getCollection('series');
  return all.find((s) => s.data.slug === slug);
}

/** One entry in a RowGrid: the series shelf and the discipline grid share it. */
export interface Row {
  href: string;
  title: string;
  description: string;
  meta: string;
}
