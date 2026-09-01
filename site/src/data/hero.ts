/**
 * Hero copy.
 *
 * Feeds: `components/home/Hero.astro` (slice 03).
 *
 * A shaped view over `profile.ts` — the name, role, lead and location are not
 * duplicated here, so editing the profile updates the hero too. Only
 * hero-specific strings live in this file.
 */

import type { HeroContent } from '../types/portfolio';
import { profile } from './profile';

export const hero = {
  availability: profile.availability,
  greeting: "Hi, I'm",
  name: profile.name,
  role: profile.role,
  lead: profile.lead,
  location: profile.location,

  // Both CTAs scroll rather than leave the page. "Request" is an ask, not a
  // download: sending someone to the contact section lets them say who they
  // are, which is the point of the wording. See `profile.resumeUrl` for why no
  // PDF is served.
  primaryCta: { label: 'View my work', href: '#projects', icon: 'arrow-right' },
  secondaryCta: { label: 'Request my resume', href: '#contact', icon: 'mail' },

  scrollCueLabel: 'Scroll to about section',
  scrollCueHref: '#about',
} satisfies HeroContent;
