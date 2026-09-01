/**
 * `IconName` is derived from the icon registry, not hand-maintained.
 *
 * The registry itself lives at `components/ui/icon-paths.ts` because an
 * `.astro` file cannot export values. Import `IconName` from here — this is the
 * published contract; the registry module is an implementation detail of
 * slice 00.
 *
 * Because it is a literal union rather than `string`, a typo in an icon name is
 * a compile error at the call site instead of a blank 24×24 square that nobody
 * notices until the page is deployed.
 */
export type { IconName } from '../components/ui/icon-paths';
export { isIconName } from '../components/ui/icon-paths';
