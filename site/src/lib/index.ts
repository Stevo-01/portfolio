/**
 * The published surface of `src/lib`. Owned by slice 00.
 *
 * Import from `../lib` rather than reaching into the individual modules, so the
 * internal file layout stays free to change without touching consumers.
 */

export {
  getPublishedPosts,
  getPostsByCategory,
  getSeriesParts,
  getRelatedPosts,
  getAdjacentInSeries,
  getCategoryCounts,
} from './posts';

export { formatDate, isoDate, ogImageUrl, railNumber, readingLabel } from './format';

export {
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  applyTheme,
  currentTheme,
  type Theme,
} from './theme';
