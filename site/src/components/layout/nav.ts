import type { IconName } from '../../types/icons';

/**
 * The primary navigation. Owned by slice 01.
 *
 * Section links are absolute (`/#about`) rather than bare fragments so they
 * work from the journal as well as the homepage. A bare `#about` on
 * `/blog/some-post/` scrolls to nothing and silently does nothing, which is the
 * kind of bug nobody reports because it looks like the link is just slow.
 */

export type NavKey =
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'blog';

export interface NavItem {
  key: NavKey;
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'about', label: 'About', href: '/#about' },
  { key: 'experience', label: 'Experience', href: '/#experience' },
  { key: 'projects', label: 'Projects', href: '/#projects' },
  { key: 'skills', label: 'Skills', href: '/#skills' },
  { key: 'education', label: 'Education', href: '/#education' },
  { key: 'blog', label: 'Journal', href: '/blog/' },
];

/** The contact pill, kept out of NAV_ITEMS because it renders differently. */
export const CONTACT_LINK: { label: string; href: string; icon: IconName } = {
  label: 'Contact',
  href: '/#contact',
  icon: 'mail',
};
