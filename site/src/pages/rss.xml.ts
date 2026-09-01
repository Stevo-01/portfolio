import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

import { SITE_NAME } from '../components/seo/meta';
import { CATEGORY_ART } from '../components/journal/taxonomy';
import { getPublishedPosts } from '../lib';
import { profile } from '../data/profile';

/**
 * The RSS feed. Owned by slice 06.
 *
 * Built from getPublishedPosts(), which is the only place the draft filter
 * lives. A feed is the one surface where a leaked draft is unrecoverable:
 * readers' clients cache it, so unpublishing does not un-send it.
 */
export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: SITE_NAME,
    description:
      'Notes on retrieval-augmented generation, language models, MLOps and getting a model out of a notebook and in front of somebody.',
    // Absolute, from Astro.site. Relative links in a feed resolve against the
    // reader's client, which is to say nowhere useful.
    site: context.site ?? 'https://example.invalid',
    trailingSlash: true,

    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/blog/${post.id}/`,
      categories: [CATEGORY_ART[post.data.category].title, ...post.data.tags],
      author: `${profile.email} (${profile.name})`,
      // Deliberately no content:encoded. Rendering every post body would mean
      // resolving each one through render(), and the descriptions are written
      // as standalone summaries. A feed that sends readers to the site is also
      // the behaviour the site wants.
    })),

    customData: '<language>en-GB</language>',
  });
}
