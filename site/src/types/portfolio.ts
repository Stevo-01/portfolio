import type { IconName } from './icons';

/**
 * Every shape the portfolio half of the site renders. Owned by slice 00; no
 * other slice may redefine or widen these.
 *
 * The data modules under `src/data/` declare their exports with `satisfies`
 * against these interfaces, so a missing field is a compile error rather than
 * an `undefined` that renders as a blank card.
 *
 * ── WHY THE SHAPED TYPES LIVE HERE ────────────────────────────────────────
 * `HeroContent` and `SectionHeadings` describe content, not components, so they
 * belong to the contract layer. The reference implementation put them in
 * `components/home/types.ts` — inside the homepage slice's territory — which
 * meant `data/hero.ts` had to import upward out of `src/data` into a component
 * directory, and made the data slice depend on the homepage slice being built
 * first. Moving them here is what lets content land second instead of eighth.
 * See docs/plans/BUILD-PLAN.md §9, change 3.
 *
 * Arrays are plain rather than `readonly` so they stay assignable to the
 * mutable props the consuming components declare.
 */

/* --- Identity ------------------------------------------------------------- */

export interface ProfileSocial {
  label: string;
  href: string;
  icon: IconName;
}

export interface Profile {
  name: string;
  /** Mono kicker under the hero H1. */
  role: string;
  /** Short descriptor, used in the footer note and the OG subtitle. */
  tagline: string;
  /** Text inside the hero availability pill. */
  availability: string;
  /** Hero lead paragraph, held near 40 words at a ~62ch measure. */
  lead: string;
  /** About section body — one entry per paragraph. */
  about: string[];
  location: string;
  email: string;
  phone: string;
  /**
   * Where the published resume is served from: `public/resume.pdf`. Replace
   * the file, not this string.
   */
  resumeUrl: string;
  socials: ProfileSocial[];
}

/* --- Homepage sections ---------------------------------------------------- */

export interface Stat {
  label: string;
  value: string;
  /** How the figure was derived. Every stat carries one — see CONTENT-MAP §9. */
  note?: string;
}

export interface CtaLink {
  label: string;
  href: string;
  icon: IconName;
}

export interface HeroContent {
  availability: string;
  greeting: string;
  name: string;
  role: string;
  lead: string;
  location: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  scrollCueLabel: string;
  scrollCueHref: string;
}

/**
 * A heading splits into `lead` (rendered in --text) and `accent` (rendered in
 * the peach gradient). `index` is the mono rail numeral; nothing derives it, so
 * renumber by hand if sections are reordered.
 */
export interface SectionHeading {
  index: string;
  lead: string;
  accent: string;
}

export type SectionKey =
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'philosophy'
  | 'education'
  | 'contact';

export type SectionHeadings = Record<SectionKey, SectionHeading>;

/* --- Experience ----------------------------------------------------------- */

export interface JobBlock {
  heading: string;
  bullets: string[];
}

export interface Job {
  role: string;
  company: string;
  location: string;
  start: string;
  /** `'Present'` is permitted. */
  end: string;
  blocks: JobBlock[];
  tech: string[];
}

/* --- Work ----------------------------------------------------------------- */

export interface CaseStudy {
  title: string;
  company: string;
  summary: string;
  problem: string;
  approach: string;
  result: string;
  /** Rendered as a mono flow line, e.g. `A → B → C`. */
  architecture: string;
  tech: string[];
}

export interface Project {
  title: string;
  company: string;
  summary: string;
  highlights: string[];
  tech: string[];
}

/* --- Skills and stack ----------------------------------------------------- */

export interface SkillGroup {
  title: string;
  icon: IconName;
  items: string[];
}

export interface StackItem {
  name: string;
  icon: IconName;
}

/* --- How I work ----------------------------------------------------------- */

export interface Principle {
  num: string;
  title: string;
  body: string;
}

/* --- Credentials ---------------------------------------------------------- */

export interface Degree {
  /** May be empty: the source resume dates no degree. Never invent one. */
  period: string;
  location: string;
  qualification: string;
  institution: string;
  notes: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  /** Empty renders as unlinked text rather than a dead link. */
  url: string;
}

/* --- Contact -------------------------------------------------------------- */

export interface ContactChannel {
  label: string;
  value: string;
  /** Empty renders as a disabled control rather than a dead link. */
  href: string;
  icon: IconName;
}

/* --- Document head ------------------------------------------------------- */

export interface SiteMeta {
  title: string;
  description: string;
}
