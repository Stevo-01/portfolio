/**
 * Identity and contact details — the single source of truth for who this site
 * is about.
 *
 * Nothing renders this module directly. It feeds the shaped modules the
 * homepage imports: `hero.ts`, `about.ts`, `contact.ts` and `site.ts`. Edit a
 * name, an email or a paragraph here and it propagates everywhere.
 *
 * ── EDITING ──────────────────────────────────────────────────────────────
 * Anything marked `TODO(owner):` is waiting on a real value.
 * `grep -rn "TODO(owner)" src/data` lists everything outstanding.
 *
 * ── SOURCING ─────────────────────────────────────────────────────────────
 * Every field traces to the source resume. Two rules apply to this whole
 * directory and are not style preferences:
 *
 *   1. Do not invent metrics. No rounded-up years, no numbers that cannot be
 *      pointed at a line in the resume or recomputed from the content
 *      collections.
 *   2. Do not upgrade a hedged claim. A projection ships as a projection.
 *
 * See docs/plans/CONTENT-MAP.md §1.
 */

import type { Profile } from '../types/portfolio';

export const profile = {
  name: 'Stephen Adedigba',

  /**
   * The resume leads "PhD Candidate in Artificial Intelligence", and its
   * experience is squarely engineering: RAG pipelines, a FastAPI backend, a
   * React dashboard, Airflow on GCP, a deployed OpenCV model.
   *
   * Leading a portfolio with "PhD Candidate" reads as *studying* AI. Leading
   * with this reads as *building* it, which is what the bullets actually
   * describe. The doctorate is not buried — it opens the education section and
   * it is the hero kicker. This is a deliberate resolution of that tension,
   * not an oversight.
   */
  role: 'AI & Machine Learning Engineer',

  tagline: 'Models that reach the people who need them.',

  /**
   * The UNIMAS post ended in December 2025, so there is no current role. This
   * is accurate and deliberately unembellished — "available immediately" would
   * be a claim about circumstances this file has no access to.
   */
  availability: 'Open to AI/ML engineering roles',

  lead: "I build machine learning systems that end up in someone's hands: retrieval-augmented generation pipelines, fine-tuned language models, and the FastAPI services and interfaces that make them usable by people who will never open a notebook.",

  about: [
    "I'm an AI and machine learning engineer and a PhD candidate in Artificial Intelligence at University Malaysia Sarawak, working on natural language processing, large language models, and retrieval-augmented generation.",
    'Most of my work has been the distance between a model and a working system. At UNIMAS that meant fine-tuning language models and then building the RAG pipeline, the FastAPI service, and the Streamlit and React interfaces that let researchers and non-technical reviewers actually use them. Before that, at Maxis, it meant a face detection model for SIM registration and Airflow pipelines on GCP that took 90% of the manual work out of a recurring process.',
    'I came to engineering through data analysis rather than computer science, which is probably why I keep ending up on the side of the problem where the output has to be legible to somebody. A model that only its author can evaluate is not finished.',
  ],

  location: 'Selangor, Malaysia',
  email: 'olamsteph@gmail.com',

  // Unspaced on purpose: it is the displayed string and the `tel:` href, so one
  // value serves both and they cannot drift.
  phone: '+601168746175',

  /**
   * Where a resume PDF would be served from.
   *
   * No PDF ships at this path yet, and that is deliberate rather than pending.
   * The repository is public and the source resume carries a phone number and
   * an address, which is why `.gitignore` excludes it at the root — committing
   * the same bytes into `public/` would publish exactly what that rule exists
   * to withhold.
   *
   * So the hero's secondary CTA scrolls to the contact section instead of
   * linking here: the resume is asked for rather than downloaded anonymously,
   * which is also the more useful outcome. This constant stays as the single
   * place any future link would read the path from — drop a file in and it is
   * served, no code change.
   */
  resumeUrl: '/resume.pdf',

  /**
   * TODO(owner): confirm the GitHub and LinkedIn URLs.
   *
   * The resume prints "LinkedIn" and "GitHub" as plain text. The only hyperlink
   * actually embedded in the PDF is the mailto below, so neither profile URL is
   * recoverable from the source document. `https://github.com/Stevo-01` is a
   * reasonable inference from the git remote but it is still an inference.
   *
   * An empty `href` renders as a disabled control rather than a dead link (see
   * `Button.astro`), so the contact section stays honest until these land.
   */
  socials: [
    { label: 'GitHub', href: '', icon: 'github' },
    { label: 'LinkedIn', href: '', icon: 'linkedin' },
    { label: 'Email', href: 'mailto:olamsteph@gmail.com', icon: 'mail' },
  ],
} satisfies Profile;
