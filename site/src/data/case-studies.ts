/**
 * The three pieces of work that get the roomy treatment.
 *
 * Feeds: `components/home/Projects.astro` → `CaseStudyCard.astro` (slice 03).
 *
 * problem / approach / result is the shape because it is the shape an
 * interviewer asks in: what was wrong, what did you do, what happened. A
 * summary alone answers none of those.
 *
 * `architecture` renders as a mono flow line. Keep it to the components that
 * actually existed — an invented queue or cache would be the first thing a
 * reader with the same background would notice.
 */

import type { CaseStudy } from '../types/portfolio';

export const caseStudies = [
  {
    title: 'RAG chatbot over an internal document corpus',
    company: 'UNIMAS',
    summary:
      "Retrieval-augmented generation with a demo front end, so researchers could interrogate a specific document set instead of a model's parameters.",
    problem:
      'Researchers needed answers grounded in a specific document set. A general language model produced fluent answers that were confidently wrong about a corpus it had never seen, and fluency is exactly what makes that failure hard to catch.',
    approach:
      'Retrieval-augmented generation: documents chunked and embedded, retrieval placed in front of the model, and the model asked to answer from what it was handed rather than from memory. FastAPI held retrieval and inference behind one interface; Streamlit and Gradio gave it a front end so the demo could be put in front of people the same week it worked.',
    result:
      'A working end-to-end demo used for evaluation, with answers traceable to the documents they came from. That traceability is what a bare model could not offer.',
    architecture: 'Streamlit / Gradio → FastAPI → retrieval over document index → LLM inference',
    tech: ['Python', 'FastAPI', 'Hugging Face Transformers', 'Streamlit', 'Gradio'],
  },

  {
    title: 'LLM fine-tuning dashboard',
    company: 'UNIMAS',
    summary:
      'A React front end over a custom metrics API, turning fine-tuning runs from something you read about afterwards into something you watch.',
    problem:
      'Fine-tuning runs produced metrics nobody could see while they were running. Comparing two experiments meant reading logs, which means comparison mostly did not happen.',
    approach:
      'A React front end over a custom backend exposing run state and training metrics, updating live. The design question was less about charts than about which numbers are worth interrupting someone with.',
    result:
      'Training metrics and experiment runs visible in real time rather than reconstructed after the fact, so a run that was clearly going nowhere could be stopped while it was still going nowhere.',
    architecture: 'React → custom metrics API → training run state',
    tech: ['React', 'Python', 'TensorFlow'],
  },

  {
    title: 'Face detection for SIM registration',
    company: 'Maxis Telecommunication',
    summary:
      'An OpenCV detection model fitted into a customer registration flow as a fraud control.',
    problem:
      'Identity fraud during customer SIM card registration, a compliance problem as much as a technical one, since the cost of a wrong answer falls on a real customer standing at a counter.',
    approach:
      'An OpenCV face detection model fitted into the existing registration flow, positioned as a verification step rather than a gate, so a false negative delayed a registration instead of refusing one.',
    // The honest version. The resume says "expected to reduce fraud by 85%":
    // a projection from validation, before the system was in production. It
    // ships as a projection, and saying so is a better interview answer than
    // the alternative. See CONTENT-MAP §1.
    result:
      'Projected to cut registration fraud by 85%. That figure was a projection from model validation at the time the work concluded, not a measurement from production.',
    architecture: 'registration capture → OpenCV detection → verification decision',
    tech: ['Python', 'OpenCV'],
  },
] satisfies CaseStudy[];
