/**
 * Section headings for the homepage.
 *
 * Feeds: every `<Section>` on `pages/index.astro`, via `SectionHeading.astro`.
 *
 * Each heading splits into `lead` + `accent`: `lead` renders in --text and
 * `accent` renders in the peach gradient. Splitting on the last word or two
 * usually reads best.
 *
 * `index` is the mono rail numeral beside the heading. Nothing derives these —
 * renumber by hand if sections are reordered or dropped.
 *
 * ── NO TESTIMONIALS SECTION ──────────────────────────────────────────────
 * There is deliberately no entry for one. The reference implementation carries
 * a testimonials section with an empty data array and renumbers the sections
 * after it to hide the gap, which is a workaround for content that never
 * arrived. Adding the section later is a small commit; shipping an invisible
 * one now would be a permanent oddity in the numbering.
 */

import type { SectionHeadings } from '../types/portfolio';

export const headings = {
  about: { index: '01', lead: 'About', accent: 'Me' },
  experience: { index: '02', lead: 'Work', accent: 'Experience' },
  projects: { index: '03', lead: 'Featured', accent: 'Projects' },
  skills: { index: '04', lead: 'Skills &', accent: 'Technologies' },
  philosophy: { index: '05', lead: 'How I Think &', accent: 'Work' },
  education: { index: '06', lead: 'Education &', accent: 'Credentials' },
  contact: { index: '07', lead: 'Get In', accent: 'Touch' },
} satisfies SectionHeadings;
