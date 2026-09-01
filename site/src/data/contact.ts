/**
 * Contact section.
 *
 * Feeds: `components/home/Contact.astro` (slice 03).
 *
 * An empty `href` renders as a disabled control rather than a dead link, which
 * is how the section stays honest while the social URLs are unconfirmed — see
 * the TODO in `profile.ts`.
 */

import type { ContactChannel } from '../types/portfolio';
import { profile } from './profile';

export const contact = {
  heading: 'Open to AI/ML engineering roles',
  lead: 'If you are building something where a model has to reach real users, I would like to hear about it. Email is the fastest way to reach me.',

  channels: [
    {
      label: 'Email',
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: 'mail',
    },
    {
      label: 'Phone',
      value: profile.phone,
      // Same unspaced value serves the display string and the tel: href.
      href: `tel:${profile.phone}`,
      icon: 'phone',
    },
    {
      label: 'Location',
      value: profile.location,
      href: '',
      icon: 'map-pin',
    },
  ] satisfies ContactChannel[],

  socials: profile.socials,
};
