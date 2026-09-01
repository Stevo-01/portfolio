import { getCollection } from 'astro:content';

import type { CategorySlug, Post } from '../types/content';
import { CATEGORY_SLUGS } from '../types/content';

/**
 * Every query the site makes against the blog collection. Owned by slice 00.
 *
 * ⚠️ THE DRAFT FILTER EXISTS IN EXACTLY ONE PLACE — `getPublishedPosts()`,
 * below. It is the only function in this codebase permitted to call
 * `getCollection('blog')`.
 *
 * No page and no component may query the collection directly. Doing so bypasses
 * the filter and publishes drafts, and it does so silently: the build succeeds,
 * the page renders, and the unfinished post is live in `dist/`, the sitemap and
 * the RSS feed. A PostToolUse hook flags a direct call on write, but the hook is
 * a safety net rather than the rule. The rule is: go through these helpers.
 */

/**
 * Published posts, newest first. Drafts removed.
 *
 * The date sort is explicit rather than relying on filesystem or glob order,
 * which is neither stable across platforms nor meaningful.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const all = await getCollection('blog');

  return all
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

/** Published posts in one discipline, newest first. */
export async function getPostsByCategory(slug: CategorySlug): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.category === slug);
}

/**
 * The parts of one series, in reading order.
 *
 * Sorted by `part` ascending, NOT by date — a series is a reading path, and
 * part 3 written before part 2 must still come after it. The schema guarantees
 * `part` is present whenever `series` is, so the non-null assertions here are
 * backed by the refinement in `content.config.ts` rather than by hope.
 */
export async function getSeriesParts(slug: string): Promise<Post[]> {
  const posts = await getPublishedPosts();

  return posts
    .filter((post) => post.data.series === slug)
    .sort((a, b) => (a.data.part ?? 0) - (b.data.part ?? 0));
}

/**
 * Up to `n` posts related to this one, best match first.
 *
 * Ranked by shared tags, with same-category posts preferred as a tiebreak. Tags
 * are a stronger relatedness signal than category — two posts both filed under
 * `mlops` may have nothing to do with each other, whereas two sharing
 * `retrieval` and `evaluation` almost certainly do.
 *
 * Falls back to filling from the same category, then from anything recent, so a
 * sparsely tagged post still gets a full related strip rather than a gap.
 */
export async function getRelatedPosts(post: Post, n = 3): Promise<Post[]> {
  const posts = await getPublishedPosts();
  const others = posts.filter((candidate) => candidate.id !== post.id);

  const tags = new Set(post.data.tags);

  const scored = others
    .map((candidate) => {
      const shared = candidate.data.tags.filter((tag) => tags.has(tag)).length;
      const sameCategory = candidate.data.category === post.data.category ? 1 : 0;
      return { candidate, score: shared * 2 + sameCategory };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.candidate.data.publishDate.valueOf() - a.candidate.data.publishDate.valueOf(),
    )
    .map((entry) => entry.candidate);

  if (scored.length >= n) return scored.slice(0, n);

  // Top up with recent posts not already chosen, so the strip is never short.
  const chosen = new Set(scored.map((candidate) => candidate.id));
  const filler = others.filter((candidate) => !chosen.has(candidate.id));

  return [...scored, ...filler].slice(0, n);
}

/** The previous and next parts around this post within its series. */
export async function getAdjacentInSeries(
  post: Post,
): Promise<{ prev?: Post; next?: Post }> {
  if (!post.data.series) return {};

  const parts = await getSeriesParts(post.data.series);
  const index = parts.findIndex((candidate) => candidate.id === post.id);

  if (index === -1) return {};

  return {
    prev: parts[index - 1],
    next: parts[index + 1],
  };
}

/**
 * Published post count per discipline.
 *
 * Returns a total `Record`, so every category is present with at least 0. A
 * sparse object here would make an empty category render as `undefined` in the
 * tab strip rather than as a zero, and the empty state would never fire.
 */
export async function getCategoryCounts(): Promise<Record<CategorySlug, number>> {
  const posts = await getPublishedPosts();

  const counts = Object.fromEntries(
    CATEGORY_SLUGS.map((slug) => [slug, 0]),
  ) as Record<CategorySlug, number>;

  for (const post of posts) {
    counts[post.data.category] += 1;
  }

  return counts;
}
