/**
 * The marquee strip.
 *
 * Feeds: `components/home/SkillMarquee.astro` (slice 03) and the drift layer in
 * `components/background/` (slice 02).
 *
 * A subset of `skills.ts`, chosen for the ones with a distinguishable glyph in
 * the icon registry. A marquee is decoration that happens to be informative —
 * fifteen items reads as a stack, forty reads as a word cloud.
 *
 * Every `icon` must exist in `components/ui/icon-paths.ts` or this file will not
 * compile, which is the point of `IconName` being a literal union.
 */

import type { StackItem } from '../types/portfolio';

export const stack = [
  { name: 'Python', icon: 'python' },
  { name: 'TensorFlow', icon: 'tensorflow' },
  { name: 'Hugging Face', icon: 'huggingface' },
  { name: 'FastAPI', icon: 'fastapi' },
  { name: 'Flask', icon: 'flask' },
  { name: 'React', icon: 'react' },
  { name: 'Docker', icon: 'docker' },
  { name: 'Kubernetes', icon: 'kubernetes' },
  { name: 'PostgreSQL', icon: 'postgres' },
  { name: 'MongoDB', icon: 'mongodb' },
  { name: 'Redis', icon: 'redis' },
  { name: 'Airflow', icon: 'airflow' },
  { name: 'MLflow', icon: 'mlflow' },
  { name: 'GCP', icon: 'gcp' },
  { name: 'AWS', icon: 'aws' },
  { name: 'Git', icon: 'git-branch' },
] satisfies StackItem[];
