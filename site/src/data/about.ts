/**
 * About section body.
 *
 * Feeds: `components/home/About.astro` (slice 03).
 *
 * Purely a re-export of `profile.about`. It exists so the component imports
 * `about` rather than reaching into the profile for one field — if the section
 * later needs its own copy, only this file changes.
 */

import { profile } from './profile';

export const about = {
  paragraphs: profile.about,
  /**
   * The resume's UI/UX line — "rapid prototyping for AI/ML demos, translating
   * model outputs into usable interfaces for non-technical stakeholders" — is
   * the single best sentence in the document and the site's whole thesis. It
   * belongs in prose, not in a skills chip, which is why it is echoed in the
   * hero lead and paragraph two above rather than listed in `skills.ts`.
   */
  pullQuote: 'A model that only its author can evaluate is not finished.',
};
