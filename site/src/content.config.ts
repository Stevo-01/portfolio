import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Imported from `zod` directly, not re-exported from `astro:content` — that
// re-export is deprecated in Astro 7. `zod` is a declared dependency pinned to
// the same major astro resolves internally, so npm dedupes to one instance and
// the schemas astro receives are the ones it expects.
import { z } from 'zod';

import { CATEGORY_SLUGS } from './types/content';

/**
 * The three content collections, validated by Zod at build time. Owned by
 * slice 00.
 *
 * The enum is built from `CATEGORY_SLUGS` rather than spelled out again, so the
 * type and the validator can never disagree about which disciplines exist.
 */

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z
    .object({
      title: z.string(),

      // Doubles as the meta description and the card dek. Capped because a
      // longer string is silently truncated by search engines and wraps badly
      // in a three-up grid — better to fail the build than ship either.
      description: z.string().max(170),

      category: z.enum(CATEGORY_SLUGS),

      // A post joins a series by setting BOTH of these. See the refinement.
      series: z.string().optional(),
      part: z.number().int().min(1).optional(),

      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),

      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),

      // Overrides the category's default glyph on the cover art.
      heroGlyph: z.string().optional(),

      // `minutesRead` is deliberately absent. The remark plugin injects it at
      // build time from the body, so authoring it by hand would let it drift
      // from the text. Adding it here would make that drift legal.
    })
    .refine((data) => (data.series === undefined) === (data.part === undefined), {
      message:
        'A post joins a series by setting BOTH `series` and `part`. One without the other is always a mistake: a series entry with no part cannot be ordered, and a part with no series has nothing to belong to. This refinement is the entire reason this content uses a schema rather than loose frontmatter.',
      path: ['series'],
    }),
});

const categories = defineCollection({
  loader: glob({ base: './src/content/categories', pattern: '**/*.yaml' }),
  schema: z.object({
    slug: z.enum(CATEGORY_SLUGS),
    title: z.string(),
    description: z.string(),
    // Drives display order everywhere. Article counts are derived at build
    // time from the blog collection and are never stored.
    order: z.number().int(),
  }),
});

const series = defineCollection({
  loader: glob({ base: './src/content/series', pattern: '**/*.yaml' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.enum(CATEGORY_SLUGS),
    // Part count is derived from the posts, not stored here.
  }),
});

export const collections = { blog, categories, series };
