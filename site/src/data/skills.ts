/**
 * Skill groups.
 *
 * Feeds: `components/home/Skills.astro` → `SkillCard.astro` (slice 03).
 *
 * Grouped by what the work is, not by the resume's own headings — the resume
 * splits "Frontend Development" from "UI/UX" from "Frameworks", which scatters
 * one coherent story (building interfaces over models) across three cards.
 *
 * ── TWO DELIBERATE OMISSIONS ─────────────────────────────────────────────
 *
 * 1. The resume's "Soft Skills" line — problem solving, critical thinking,
 *    time management, communication, analytical research, collaboration — has
 *    no card here. Unevidenced adjectives in a grid are the weakest thing on
 *    any portfolio. Those claims live in `principles.ts`, where each one has to
 *    be attached to something that actually happened.
 *
 * 2. The resume's "UI/UX" line is not a chip either. "Translating model outputs
 *    into usable interfaces for non-technical stakeholders" is the site's
 *    thesis, so it is prose in the hero and the about section rather than a
 *    three-word tag nobody reads.
 *
 * Every item below appears in the resume. Nothing is added for symmetry.
 */

import type { SkillGroup } from '../types/portfolio';

export const skillGroups = [
  {
    title: 'Machine Learning & Deep Learning',
    icon: 'brain',
    items: ['TensorFlow', 'Keras', 'Scikit-learn', 'FastAI', 'Pandas'],
  },
  {
    title: 'LLMs & NLP',
    icon: 'sparkles',
    items: [
      'Hugging Face Transformers',
      'LLM fine-tuning',
      'Retrieval-augmented generation',
      'Text classification',
      'Text generation',
      'NLTK',
    ],
  },
  {
    title: 'Computer Vision',
    icon: 'eye',
    items: ['OpenCV', 'Face detection'],
  },
  {
    title: 'Backend & APIs',
    icon: 'server',
    items: ['FastAPI', 'Flask', 'REST APIs'],
  },
  {
    title: 'Demo & Product Interfaces',
    icon: 'code',
    items: [
      'Streamlit',
      'Gradio',
      'React',
      'Next.js',
      'Vue.js',
      'Angular',
      'Flutter',
      'HTML/CSS',
      'Figma',
    ],
  },
  {
    title: 'Languages',
    icon: 'terminal',
    items: ['Python', 'SQL', 'R', 'MATLAB', 'JavaScript', 'TypeScript', 'C++'],
  },
  {
    title: 'Data & Storage',
    icon: 'database',
    items: ['MySQL', 'MSSQL', 'PostgreSQL', 'MongoDB', 'Redis'],
  },
  {
    title: 'Visualisation & BI',
    icon: 'bar-chart',
    items: ['Tableau', 'Power BI', 'Matplotlib', 'Seaborn', 'Plotly'],
  },
  {
    title: 'MLOps & Delivery',
    icon: 'cloud-cog',
    items: [
      'Docker',
      'Kubernetes',
      'MLflow',
      'CI/CD',
      'Apache Airflow',
      'Git',
      'Bitbucket',
      'JupyterLab',
    ],
  },
  {
    title: 'Cloud',
    icon: 'cloud',
    items: ['GCP', 'AWS', 'Azure'],
  },
] satisfies SkillGroup[];
