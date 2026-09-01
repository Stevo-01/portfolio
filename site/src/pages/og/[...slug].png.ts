import type { APIContext, GetStaticPaths } from 'astro';
import sharp from 'sharp';

import { CATEGORY_ART } from '../../components/journal/taxonomy';
import { getPublishedPosts } from '../../lib';
import { profile } from '../../data/profile';
import { OG_BG, OG_INK, OG_MUTED, esc, paletteFor, truncate, wrap } from './_recipe';
import type { Post } from '../../types/content';

/**
 * Build-time Open Graph images, one per published post. Owned by slice 06.
 *
 * ── WHY SHARP AND NOT astro-og-canvas ────────────────────────────────────
 * The brief names `astro-og-canvas` as the primary approach with a satori or
 * sharp endpoint as the documented fallback. This takes the fallback, for two
 * reasons worth recording:
 *
 *   1. `astro-og-canvas` pulls `canvaskit-wasm`, roughly 10 MB of WebAssembly
 *      loaded on every build, to draw four rectangles and some text.
 *   2. `sharp` is already a dependency (Astro's image pipeline uses it) and
 *      already renders SVG to PNG here -- the same path that produced
 *      `public/og-default.png`.
 *
 * The cost is font fidelity: sharp rasterises SVG through librsvg, which
 * resolves fonts from the system rather than from the site's self-hosted Geist.
 * For a card that is only ever seen at thumbnail size inside someone else's
 * chrome, a system grotesque is an acceptable trade for dropping 10 MB from the
 * build. Recorded here so the decision is visible rather than inferred.
 */

const WIDTH = 1200;
const HEIGHT = 630;

export const getStaticPaths = (async () => {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}) satisfies GetStaticPaths;

function card(post: Post): string {
  const art = CATEGORY_ART[post.data.category];
  const palette = paletteFor(art.rotate);

  // Truncate first, then wrap: wrapping a 200-character title into three lines
  // would drop the tail silently.
  const lines = wrap(truncate(post.data.title), 30, 3);
  const titleSize = lines.length >= 3 ? 58 : 66;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="wash" x1="0.1" y1="1" x2="0.95" y2="0.05">
      <stop offset="0" stop-color="${palette.from}"/>
      <stop offset="0.55" stop-color="${palette.via}"/>
      <stop offset="1" stop-color="${palette.to}"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${OG_BG}"/>

  <!-- The same lens-from-below focal point the on-page cover art uses. -->
  <circle cx="1010" cy="640" r="430" fill="url(#wash)" opacity="0.92"/>
  <circle cx="1010" cy="640" r="300" fill="none" stroke="#FFFFFF" stroke-opacity="0.10" stroke-width="1.5"/>
  <circle cx="1010" cy="640" r="380" fill="none" stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="1.5"/>

  <text x="72" y="104" font-family="ui-monospace, monospace" font-size="22"
        letter-spacing="3" fill="${palette.to}">${esc(art.title.toUpperCase())}</text>

  ${lines
    .map(
      (line, i) =>
        `<text x="72" y="${232 + i * (titleSize + 14)}" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" ` +
        `font-size="${titleSize}" font-weight="700" letter-spacing="-2.5" fill="${OG_INK}">${esc(line)}</text>`,
    )
    .join('\n  ')}

  <text x="72" y="${HEIGHT - 76}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26"
        fill="${OG_MUTED}">${esc(profile.name)}</text>
  <text x="72" y="${HEIGHT - 42}" font-family="ui-monospace, monospace" font-size="20"
        letter-spacing="1.5" fill="${palette.to}">THE ENGINEERING JOURNAL</text>
</svg>`;
}

export async function GET({ props }: APIContext) {
  const { post } = props as { post: Post };
  const png = await sharp(Buffer.from(card(post))).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}
