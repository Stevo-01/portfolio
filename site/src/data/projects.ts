/**
 * Smaller pieces of work, rendered as cards beside the case studies.
 *
 * Feeds: `components/home/Projects.astro` → `ProjectCard.astro` (slice 03).
 *
 * The split from `case-studies.ts` is about how much there is to say, not about
 * importance. These two were real and shipped; they just do not need four
 * paragraphs each.
 */

import type { Project } from '../types/portfolio';

export const projects = [
  {
    title: 'Text classification review tool',
    company: 'UNIMAS',
    summary:
      'A Flask backend with a plain HTML and CSS front end that let non-technical stakeholders test, review and validate classifier output directly.',
    highlights: [
      'Replaced the pattern where a data scientist reads results aloud in a meeting with one where reviewers try their own inputs.',
      'Deliberately plain front end, no framework, because the point was to exist quickly and be understood rather than impressive.',
      'The tool that made the case for the whole approach: a classifier a stakeholder cannot test is a claim, not a result.',
    ],
    tech: ['Python', 'Flask', 'HTML', 'CSS', 'Scikit-learn'],
  },

  {
    title: 'Airflow automation on GCP',
    company: 'Maxis Telecommunication',
    summary:
      'Scheduled Airflow DAGs on Google Cloud Platform replacing a recurring manual process, with data quality checks on prediction timeliness.',
    highlights: [
      'Cut manual input by 90% on a process that ran on a schedule and had always been done by hand.',
      'Added timeliness checks on predictions written to the shared prediction table, so a late pipeline surfaced as a failure rather than as stale numbers.',
      'Not a hard engineering problem. It was an unasked question, which is most of what automation work turns out to be.',
    ],
    tech: ['Apache Airflow', 'GCP', 'Python', 'SQL'],
  },
] satisfies Project[];
