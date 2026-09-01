/**
 * The theme contract. Dark is the default; light is an opt-in override.
 *
 * `prefers-color-scheme: light` is deliberately NOT honoured. Visitors get dark
 * until they toggle, and the toggle persists. To honour the OS preference
 * instead, the single change needed is marked below.
 */

export const THEME_STORAGE_KEY = 'theme';

export type Theme = 'dark' | 'light';

/**
 * Inlined synchronously into <head> by every layout, BEFORE any stylesheet.
 *
 * Two constraints, both load-bearing:
 *
 * 1. It must be synchronous and first. Deferred, or after a stylesheet, and the
 *    page paints light before the attribute lands — a white flash on every
 *    navigation for anyone using the light theme.
 *
 * 2. Its SHA-256 gets pinned in the Content-Security-Policy (slice 4.3). The
 *    hash is derived from these exact bytes, so reformatting this string — even
 *    adding a space — invalidates the pin and the browser silently refuses to
 *    run it, with nothing failing server-side to tell you. Treat it as frozen.
 *
 * Dark is expressed as the ABSENCE of the attribute rather than
 * data-theme="dark", so the default costs no DOM write and matches how
 * tokens.css is authored (dark on :root, light as the override).
 *
 * try/catch is not defensive padding: reading localStorage throws outright in
 * Safari private browsing, and an uncaught throw here would abort the script
 * before the rest of the head parses.
 *
 * To honour the OS preference instead, change the condition to:
 *   if(t==='light'||(!t&&matchMedia('(prefers-color-scheme: light)').matches))
 */
export const THEME_INIT_SCRIPT =
  "try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.dataset.theme='light'}catch(e){}";

/** Applies a theme and persists it. Used by the toggle island (slice 01). */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  if (theme === 'light') {
    root.dataset.theme = 'light';
  } else {
    delete root.dataset.theme;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private browsing. The theme still applies for this page view; it just
    // will not survive a reload. Failing silently is correct here — there is
    // nothing the visitor could do about it.
  }
}

/** The theme currently in effect, read from the DOM rather than storage. */
export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}
