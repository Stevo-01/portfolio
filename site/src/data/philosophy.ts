/**
 * Framing copy for the "How I think and work" section.
 *
 * Feeds: `components/home/Philosophy.astro` (slice 03).
 *
 * Separate from `principles.ts` so the section's intro can change without
 * touching the principles themselves.
 */

import { principles } from './principles';
import { interests } from './reading';

export const philosophy = {
  lead: 'Five things I keep coming back to. Each one came out of a specific piece of work rather than a book, which is why they are phrased as positions rather than values.',
  principles,
  interests,
};
