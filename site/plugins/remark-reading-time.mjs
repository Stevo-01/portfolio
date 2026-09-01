/**
 * Injects `minutesRead` into every markdown file's frontmatter at build time.
 *
 * This is deliberately NOT part of the Zod schema in `src/content.config.ts`.
 * Reading time is derived from the body, so authoring it by hand would let it
 * drift from the text it describes the moment a paragraph is edited. Nothing
 * writes it; nothing validates it; it simply exists by the time a page renders.
 *
 * Registered in `astro.config.mjs` under `markdown.remarkPlugins`. Owned by
 * slice 00 — no other slice touches that config file.
 */

import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
  return function (tree, file) {
    // toString() flattens the whole mdast tree, so code blocks and table cells
    // count toward the estimate. That is intended: a post that is half code
    // still takes time to read.
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);

    // Rounded to a whole number. `reading-time` returns fractional minutes and
    // "4.31 min read" reads like a measurement rather than an estimate.
    file.data.astro.frontmatter.minutesRead = Math.max(
      1,
      Math.round(readingTime.minutes),
    );
  };
}
