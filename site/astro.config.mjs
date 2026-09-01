// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';

import { remarkReadingTime } from './plugins/remark-reading-time.mjs';

/**
 * Owned by slice 00, and by slice 00 only.
 *
 * Every integration the whole build will need is registered here up front. The
 * reason is ownership rather than tidiness: this file is a single point of
 * contention, so registering late — when slice 06 wants a sitemap, say — would
 * mean a second slice editing a file it does not own. Add integrations here or
 * report the need; never reach in from another slice.
 */
export default defineConfig({
  // Placeholder. The real hostname is undecided — see docs/plans/DECISIONS.md
  // D1 — and slice 09 sets it once that resolves. `example.invalid` is reserved
  // by RFC 2606 and can never be registered, so a stray absolute URL that
  // escapes into the built output fails loudly instead of resolving to somebody
  // else's site.
  site: 'https://example.invalid',

  output: 'static',

  trailingSlash: 'always',

  build: {
    // `format` and `trailingSlash` must agree. Together they mean every route
    // is emitted as `<route>/index.html` and every internal link ends in a
    // slash — which is exactly the shape the CloudFront viewer-request function
    // rewrites for. S3 behind OAC does not resolve directory URLs on its own
    // (AGENTS.md gotcha 1), so a mismatch here surfaces as a 403 on every page
    // but the homepage, and only once it is deployed.
    format: 'directory',
  },

  integrations: [sitemap()],

  markdown: {
    // Astro 7 ships Sätteri as the default markdown processor, and Sätteri does
    // not run remark plugins. Passing `markdown.remarkPlugins` still works but
    // is deprecated, and it silently does nothing if a processor that ignores
    // them is active. Declaring the `unified` processor explicitly is what
    // makes the reading-time plugin actually run — and it needs
    // `@astrojs/markdown-remark` as a direct dependency, which is no longer
    // installed by default. Neither of those is in PLAN.md §7; both are
    // reported back to the plan.
    processor: unified({
      remarkPlugins: [remarkReadingTime],
    }),

    shikiConfig: {
      // Dual themes emit CSS variables for both, so code blocks follow the
      // site theme with no JavaScript and no second stylesheet. A single theme
      // here would need a JS re-highlight on toggle.
      themes: {
        light: 'github-light',
        dark: 'github-dark-default',
      },
      wrap: false,
    },
  },
});
