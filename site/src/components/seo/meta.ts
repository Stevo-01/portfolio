import { profile } from '../../data/profile';

/**
 * Shared head constants. Owned by slice 06.
 *
 * Kept out of the component so the RSS endpoint and the OG generator can read
 * the same values without importing an `.astro` file.
 */

export const SITE_NAME = `${profile.name} | The Engineering Journal`;

/** Shown after a page title, except where the page supplies its own full title. */
export const TITLE_SUFFIX = profile.name;

export const DEFAULT_OG_IMAGE = '/og-default.png';

/**
 * `theme-color` per scheme, so mobile browser chrome matches the page instead
 * of sitting as a pale bar above a dark site. These are the only two hex values
 * outside tokens.css, and they are unavoidable: `<meta>` content cannot read a
 * CSS custom property, and the browser needs the value before any stylesheet
 * has been parsed.
 *
 * They must stay in step with --bg in tokens.css. If that changes, change these.
 */
export const THEME_COLOR_DARK = '#191210';
export const THEME_COLOR_LIGHT = '#fffcfa';

/**
 * Builds an absolute URL. Crawlers and social scrapers reject relative
 * `og:image` and `canonical` values, and the failure is invisible in local
 * testing because a browser resolves them happily.
 */
export function absoluteUrl(path: string, site: URL | undefined): string {
  return new URL(path, site ?? 'https://example.invalid').href;
}
