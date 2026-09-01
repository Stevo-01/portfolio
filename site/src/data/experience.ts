/**
 * Work history, most recent first.
 *
 * Feeds: `components/home/Experience.astro` → `JobCard.astro` (slice 03).
 *
 * Each role uses `blocks` — a heading plus bullets — rather than one flat list,
 * because a role with several distinct strands reads as a wall of text
 * otherwise. The UNIMAS post in particular splits cleanly into the modelling
 * work and the work of making it usable, and that split is the point the whole
 * site is making.
 *
 * `tech` lists only what the resume names for that role. Nothing is added
 * because it would look good beside the others.
 */

import type { Job } from '../types/portfolio';

export const jobs = [
  {
    role: 'Research Assistant Associate',
    company: 'University Malaysia Sarawak (UNIMAS)',
    location: 'Sarawak, Malaysia',
    start: 'Oct 2023',
    end: 'Dec 2025',
    blocks: [
      {
        heading: 'Language models and retrieval',
        bullets: [
          'Built NLP systems on Hugging Face Transformers for text generation and classification.',
          'Explored and fine-tuned large language models for downstream tasks, improving natural language understanding and generation quality.',
          'Implemented retrieval-augmented generation to ground model output in a document corpus rather than in parameters alone.',
        ],
      },
      {
        heading: 'Shipping the models as systems',
        bullets: [
          'Designed and deployed a full-stack RAG chatbot: a Streamlit and Gradio front end over a FastAPI backend handling document retrieval and LLM inference.',
          'Built a text classification tool on a Flask backend with an HTML and CSS front end, so non-technical stakeholders could test, review and validate model output themselves.',
          'Built an LLM fine-tuning dashboard in React against a custom backend, showing training metrics and experiment runs in real time.',
        ],
      },
    ],
    tech: [
      'Python',
      'Hugging Face Transformers',
      'TensorFlow',
      'FastAPI',
      'Flask',
      'Streamlit',
      'Gradio',
      'React',
      'NLTK',
    ],
  },

  {
    role: 'ML Engineer Intern',
    company: 'Maxis Telecommunication',
    location: 'Malaysia',
    start: 'Apr 2022',
    end: 'Nov 2022',
    blocks: [
      {
        heading: 'Computer vision in a compliance flow',
        bullets: [
          // "projected to", not "reduced". The resume says "expected to reduce
          // fraud by 85%" — that is a projection from before the system shipped,
          // and it stays one. See CONTENT-MAP §1.
          'Developed a face detection model with OpenCV for customer SIM card registration, projected to cut registration fraud by 85%.',
        ],
      },
      {
        heading: 'Pipelines and data quality',
        bullets: [
          'Automated recurring manual processes with Apache Airflow on Google Cloud Platform, cutting manual input by 90%.',
          'Ran data quality checks on the timeliness of predictions written to the shared prediction table on GCP.',
          "Designed a learning pathway for the team around Stanford's machine learning in production material, as part of a team development initiative.",
        ],
      },
    ],
    tech: ['Python', 'OpenCV', 'Apache Airflow', 'GCP', 'SQL'],
  },

  {
    role: 'Sales Analyst (Contract)',
    company: 'Ruby Heritage Global Enterprises',
    location: 'Malaysia',
    start: 'Nov 2019',
    end: 'Dec 2021',
    blocks: [
      {
        heading: 'Analysis and reporting',
        bullets: [
          'Filtered and sorted sales data in Excel to analyse large volumes and identify trends.',
          // "Contributed to", per the resume. Not "drove".
          'Contributed to a 15% lift in overall sales by developing sales plans, strategies and objectives.',
          'Tracked and evaluated competitive activity, customer behaviour and market trends.',
          'Collected and organised sales data to inform decision-making.',
        ],
      },
    ],
    tech: ['Microsoft Excel', 'Data Analysis'],
  },
] satisfies Job[];
