/**
 * Degrees and certifications.
 *
 * Feeds: `components/home/Education.astro` (slice 03).
 *
 * ── NO DATES ON THE DEGREES ──────────────────────────────────────────────
 * The source resume dates none of them, and the PhD is marked "In View". So
 * `period` is empty for two of the three and carries the honest string
 * "In view" for the doctorate. The component omits an empty period rather than
 * rendering a gap.
 *
 * Filling these in would mean inventing them. If the owner supplies real dates,
 * they go here — they are not to be inferred from the work history.
 */

import type { Certification, Degree } from '../types/portfolio';

export const degrees = [
  {
    period: 'In view',
    location: 'Sarawak, Malaysia',
    qualification: 'PhD in Artificial Intelligence',
    institution: 'University Malaysia Sarawak',
    notes: [
      'Research in natural language processing, large language models, and retrieval-augmented generation.',
      'Ran alongside the research assistant post in the same faculty.',
    ],
  },
  {
    period: '',
    location: 'Kuala Lumpur, Malaysia',
    qualification: 'Master of Data Science',
    institution: 'University Malaya',
    notes: [],
  },
  {
    period: '',
    location: 'Kuala Lumpur, Malaysia',
    qualification: 'Bachelor of Arts in E-Business with Honours',
    institution: 'Kuala Lumpur Metropolitan University College',
    notes: [
      // Worth stating plainly rather than leaving as an odd-looking entry. The
      // route in through business and analysis is a differentiator, not a gap —
      // see `profile.about` paragraph three.
      'The route in was analysis rather than computer science.',
    ],
  },
] satisfies Degree[];

/**
 * TODO(owner): certificate URLs.
 *
 * None are in the source resume. An empty `url` renders as unlinked text rather
 * than a dead link, so the list is accurate as it stands — a verifiable link is
 * simply stronger than an unverifiable claim, and worth adding when available.
 */
export const certifications = [
  {
    title: 'Machine Learning Engineering and MLOps',
    issuer: 'Duke University',
    url: '',
  },
  {
    title: 'Machine Learning in Production Specialisation',
    issuer: 'DeepLearning.AI',
    url: '',
  },
  {
    title: 'Data Collection and Processing with Python',
    issuer: 'University of Michigan',
    url: '',
  },
  {
    title: 'Microsoft Power BI Desktop',
    issuer: 'Maven Analytics',
    url: '',
  },
  {
    title: 'Tableau Training for Data Science',
    issuer: 'Ligency',
    url: '',
  },
  {
    title: 'SQL and Database Design',
    issuer: "Tim Buchalka's Learn Programming Academy",
    url: '',
  },
] satisfies Certification[];
