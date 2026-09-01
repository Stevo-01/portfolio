/**
 * Site-level metadata for the homepage document head.
 *
 * Feeds: `pages/index.astro` → `PortfolioLayout title/description`.
 *
 * Derived from `profile.ts` so the name and role are written once. Other routes
 * set their own title; this is the homepage's only.
 */

import type { SiteMeta } from '../types/portfolio';
import { profile } from './profile';

export const meta = {
  title: `${profile.name} | ${profile.role}`,
  description:
    'AI and machine learning engineering portfolio, plus an engineering journal on retrieval-augmented generation, LLMs, MLOps and getting models out of notebooks.',
} satisfies SiteMeta;
