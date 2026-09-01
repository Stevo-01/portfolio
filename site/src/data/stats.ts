/**
 * The stat readout in the About section.
 *
 * Feeds: `components/home/About.astro` (slice 03).
 *
 * ⚠️ EVERY FIGURE HERE CARRIES ITS DERIVATION. That is not documentation
 * politeness — a stat whose provenance is one comment away is a stat the owner
 * can defend when an interviewer asks how it was measured. A number nobody can
 * source is worse than no number.
 *
 * There are four entries. If the grid looks better with three, change the grid;
 * do not invent a fifth to balance it.
 *
 * The article count is deliberately absent: it is derived at build time from the
 * published collection by whichever component wants it, not stored.
 */

import type { Stat } from '../types/portfolio';

export const stats = [
  {
    value: '6 yrs',
    label: 'Professional experience',
    // Nov 2019 (Ruby Heritage, contract) → Dec 2025 (UNIMAS). The full span the
    // resume covers, including the analyst years — those are where the analysis
    // instinct in `profile.about` paragraph three comes from, so cutting them
    // would tell a shorter story than the true one.
    note: 'Nov 2019 – Dec 2025, across analysis and engineering roles',
  },
  {
    value: '3 yrs',
    label: 'In ML and AI',
    // Apr 2022 (Maxis, ML Engineer Intern) → Dec 2025. Stated separately from
    // the six rather than folded into it: conflating them would be the kind of
    // quiet rounding-up this file exists to prevent.
    note: 'Apr 2022 – Dec 2025, from the first ML engineering role',
  },
  {
    value: '3',
    label: 'Degrees',
    // PhD in Artificial Intelligence (in view), MSc Data Science, BA E-Business.
    note: 'PhD in view, MSc, BA. See the education section',
  },
  {
    value: '6',
    label: 'Certifications',
    // Duke, DeepLearning.AI, U Michigan, Maven Analytics, Ligency, Tim Buchalka.
    note: 'Counted from `education.ts`',
  },
] satisfies Stat[];
