/**
 * The icon registry — the single source of every glyph on the site.
 *
 * Lives in a `.ts` module rather than inside `Icon.astro` because an `.astro`
 * file cannot export values, and `IconName` has to be derivable from the keys.
 * Import the type from `types/icons.ts`; that is the published contract, and
 * this module is an implementation detail of slice 00.
 *
 * Every path is drawn on a 24×24 grid for `stroke="currentColor"`,
 * `stroke-width="2"`, round caps and joins. Nothing here carries a fill or a
 * colour — the consumer's `color` decides, which is what lets one registry
 * serve both themes.
 *
 * The set is fixed up front on purpose. `IconName` is a literal union, so a
 * later slice that wants a glyph which is not here gets a compile error rather
 * than a blank square — and reaching into this file from another slice is the
 * exact ownership violation the path matrix exists to prevent. The full
 * intended set is listed in docs/plans/CONTENT-MAP.md §8.
 */

export const ICON_PATHS = {
  /* --- Navigation and chrome --------------------------------------------- */
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5M11 18l-6-6 6-6',
  'arrow-down': 'M12 5v14M6 13l6 6 6-6',
  'arrow-up-right': 'M7 17 17 7M7 7h10v10',
  menu: 'M4 6h16M4 12h16M4 18h16',
  x: 'M18 6 6 18M6 6l12 12',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  'external-link': 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  rss: 'M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',

  /* --- Contact and identity ---------------------------------------------- */
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM22 7l-10 6L2 7',
  phone:
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z',
  'map-pin': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  'message-circle':
    'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z',
  github:
    'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
  linkedin:
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM6 9H2v12h4V9ZM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',

  /* --- Meta -------------------------------------------------------------- */
  calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM16 2v4M8 2v4M3 10h18',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  briefcase:
    'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2ZM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  'graduation-cap': 'M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5',
  award: 'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM8.2 13.9 7 22l5-3 5 3-1.2-8.1',
  'book-open': 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3ZM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3Z',
  'book-check': 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2ZM9 12l2 2 4-4',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  languages: 'M5 8h9M9 4v4c0 4-2 7-5 8M12 20c3-1 5-4 5-8M14 14l4 8 4-8M15.5 19h5',

  /* --- Disciplines: the five journal categories -------------------------- */
  brain:
    'M12 5a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3 3 0 0 0 6 16a3 3 0 0 0 3 3 3 3 0 0 0 3-3V5ZM12 5a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1 2 5.2A3 3 0 0 1 18 16a3 3 0 0 1-3 3 3 3 0 0 1-3-3',
  sparkles: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z',
  'cloud-cog': 'M18 15a4 4 0 0 0-.7-7.95 6 6 0 0 0-11.6 1.7A3.5 3.5 0 0 0 6 15M12 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 16v-1M12 23v-1M8.6 18l.9.5M14.5 21.5l.9.5M8.6 21.5l.9-.5M14.5 18.5l.9-.5',
  'bar-chart': 'M3 21h18M7 21V11M12 21V4M17 21v-7',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',

  /* --- Engineering ------------------------------------------------------- */
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  terminal: 'M4 17l6-5-6-5M12 19h8',
  server: 'M20 3H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1ZM20 14H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1ZM7 7h.01M7 17h.01',
  layers: 'M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5',
  database: 'M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3ZM21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  cloud: 'M18 18a4 4 0 0 0-.7-7.95 6 6 0 0 0-11.6 1.7A3.5 3.5 0 0 0 6.5 18H18Z',
  'git-branch': 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15 9a9 9 0 0 1-9 9',

  /* --- Stack marks --------------------------------------------------------
     Geometric glyphs rather than vendor logos. A recognisable brand mark is
     usually trademarked, and shipping one for the sake of a decorative marquee
     is not a licence question worth having. These read as the technology in
     context — labelled, in a stack list — without reproducing anyone's mark. */
  python: 'M12 2c-3 0-3 2-3 2v2h6V5M9 6H6s-2 0-2 3v3s0 3 2 3h3M12 22c3 0 3-2 3-2v-2H9v1M15 18h3s2 0 2-3v-3s0-3-2-3h-3M9.5 4.5h.01M14.5 19.5h.01',
  tensorflow: 'M12 2 3 7v10l9 5 9-5V7l-9-5ZM12 7v10M12 7l7 4M12 12l-7-4',
  huggingface: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 10h.01M15.5 10h.01M8 14.5c1 1.5 2.4 2 4 2s3-.5 4-2',
  fastapi: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM13 7l-4 6h4l-1 4 4-6h-4l1-4Z',
  flask: 'M9 2h6M10 2v6.5L4.5 18A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3L14 8.5V2M7.5 14h9',
  react: 'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 5c5 0 9 1.8 9 4s-4 4-9 4-9-1.8-9-4 4-4 9-4ZM8.1 6.9c2.5-4.3 5.6-6.9 7.5-5.8s1.4 5.4-1.1 9.7-5.6 6.9-7.5 5.8-1.4-5.4 1.1-9.7ZM8.1 17.1c-2.5-4.3-3-8.6-1.1-9.7s5 1.5 7.5 5.8 3 8.6 1.1 9.7-5-1.5-7.5-5.8Z',
  docker: 'M3 12h18M4 12V9h3v3M8 12V9h3v3M12 12V9h3v3M8 9V6h3v3M21 13a5 5 0 0 1-5 4H7a4 4 0 0 1-4-4',
  kubernetes: 'M12 2 4 6.5v9L12 20l8-4.5v-9L12 2ZM12 8.5 8 11v3l4 2.5 4-2.5v-3l-4-2.5ZM12 2v6.5M4 6.5 8 11M20 6.5 16 11M12 20v-3.5',
  postgres: 'M12 2c4.4 0 8 1.6 8 3.5v13c0 1-1 2-2.5 2s-2-1-2-2v-3M12 2C7.6 2 4 3.6 4 5.5v13c0 1 1 2 2.5 2s2-1 2-2v-3M9 9h.01M15 9h.01M9.5 14c.8.7 1.6 1 2.5 1s1.7-.3 2.5-1',
  mongodb: 'M12 2c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10ZM12 17v5',
  redis: 'M12 5 3 8.5 12 12l9-3.5L12 5ZM3 12.5 12 16l9-3.5M3 16.5 12 20l9-3.5',
  gcp: 'M12 3 4 7.5v9L12 21l8-4.5v-9L12 3ZM16 12a4 4 0 1 1-1.2-2.8M16 9.2V12h-2.8',
  aws: 'M4 10c1.4 1.3 4.4 2.2 8 2.2s6.6-.9 8-2.2M3 15c2 2 5.4 3 9 3s7-1 9-3M6 6.5c.8.6 3 1.2 6 1.2s5.2-.6 6-1.2',
  airflow: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM6 15c4-1 6-4 6-9M12 15c2-.5 3-2 3-4.5',
  mlflow: 'M12 3 3 18h18L12 3ZM12 10l-4 7h8l-4-7Z',
} as const;

export type IconName = keyof typeof ICON_PATHS;

/** Runtime guard, for the rare case a name arrives as an unchecked string. */
export function isIconName(value: string): value is IconName {
  return Object.hasOwn(ICON_PATHS, value);
}
