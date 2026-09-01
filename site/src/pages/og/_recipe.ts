
/**
 * The OG image recipe. Owned by slice 06.
 *
 * ── COVER ART AND OG IMAGES ARE SEPARATE SYSTEMS ─────────────────────────
 * The on-page cover art is CSS, themed by the page, zero bytes, and rendered
 * by the browser. These are PNGs generated at build time for crawlers that
 * never run CSS. They share a visual language on purpose and share no code,
 * because the two have almost nothing in common technically.
 *
 * Hex values live here rather than as tokens because a PNG generator has no
 * stylesheet to read from. This file and `tokens.css` are the only two places
 * in the project holding colour literals, and this one is deliberately
 * excluded from the no-hex check by living in a `.ts` file.
 *
 * Keyed as a total Record on CategorySlug: adding a discipline without giving
 * it a palette is a compile error, not a grey card.
 */

export interface OgPalette {
  /** Gradient stops, dark to light, matching the cover-art direction. */
  from: string;
  via: string;
  to: string;
}

/** The unrotated base, identical to the --cover-* token ramp. */
const BASE: OgPalette = { from: '#2A1408', via: '#C2410C', to: '#FED7AA' };

/* --- Hue rotation --------------------------------------------------------
   Derived, not hand-written.

   An earlier version hardcoded the per-category stops by eye and put
   llms-and-rag in magenta, nowhere near the coral the CSS cover art renders
   for the same category. Computing them from the same `rotate` value stored in
   CATEGORY_ART means the PNG and the on-page artwork cannot drift apart: change
   the rotation in one place and both follow.

   HSL rotation rather than the exact luminance-preserving matrix CSS
   `hue-rotate` uses. The two differ slightly in saturation, which is invisible
   at thumbnail size and far cheaper than reimplementing the filter matrix. */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h =
    mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    hue < 60
      ? [c, x, 0]
      : hue < 120
        ? [x, c, 0]
        : hue < 180
          ? [0, c, x]
          : hue < 240
            ? [0, x, c]
            : hue < 300
              ? [x, 0, c]
              : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function rotate(hex: string, deg: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl[0] += deg;
  return rgbToHex(hslToRgb(hsl));
}

/** The palette for a category, rotated by the same amount its cover art is. */
export function paletteFor(rotateValue: string): OgPalette {
  const deg = parseFloat(rotateValue) || 0;
  return {
    from: rotate(BASE.from, deg),
    via: rotate(BASE.via, deg),
    to: rotate(BASE.to, deg),
  };
}

export const OG_INK = '#F5E9E1';
export const OG_MUTED = '#B39D91';
export const OG_BG = '#191210';

/**
 * Titles longer than this get an ellipsis. Past roughly 90 characters the text
 * either overflows the card or shrinks below the size a thumbnail can carry,
 * and a truncated title reads better than an unreadable one.
 */
export const TITLE_LIMIT = 90;

export function truncate(text: string, limit = TITLE_LIMIT): string {
  if (text.length <= limit) return text;
  // Break on a word boundary so the ellipsis does not land mid-word.
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
}

/** Greedy wrap into lines of at most `max` characters. */
export function wrap(text: string, max: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > max && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = candidate;
    }
  }

  if (line && lines.length < maxLines) lines.push(line);

  // If words remain, the last line absorbs an ellipsis rather than the image
  // silently dropping content.
  const used = lines.join(' ').split(/\s+/).length;
  if (used < words.length && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1]}...`;
  }

  return lines;
}

/** XML-escapes a string for safe interpolation into SVG. */
export function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
