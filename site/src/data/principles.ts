/**
 * How I think and work.
 *
 * Feeds: `components/home/Philosophy.astro` (slice 03).
 *
 * This section exists so the resume's "Soft Skills" line does not have to. Each
 * principle is earned by something in `experience.ts` or `case-studies.ts`
 * rather than asserted — "problem solving" in a grid persuades nobody, whereas
 * the reason a Flask review tool got built is an actual argument.
 *
 * Five is the right number. A sixth would dilute rather than add.
 */

import type { Principle } from '../types/portfolio';

export const principles = [
  {
    num: '01',
    title: 'A model nobody can inspect is not finished',
    body: 'The text classification review tool exists because a classifier a stakeholder cannot test is a claim rather than a result. Handing someone a confusion matrix asks them to trust the person reading it; handing them the tool asks them to check.',
  },
  {
    num: '02',
    title: 'Ground the answer',
    body: 'Retrieval before more parameters. A model asked to answer from a document it was handed can be checked against that document; one answering from memory produces the same confident tone whether it is right or not, and the tone is what makes the failure expensive.',
  },
  {
    num: '03',
    title: 'Make the run visible while it runs',
    body: 'The fine-tuning dashboard exists because a metric read afterwards is a post-mortem. Seeing a run diverge in the third epoch is worth more than a perfect chart of how it diverged.',
  },
  {
    num: '04',
    title: 'Automate the recurring thing',
    body: 'Taking 90% of the manual input out of a scheduled process at Maxis was not hard engineering. It was an unasked question, and most automation work is, which is why the habit matters more than the technique.',
  },
  {
    num: '05',
    title: 'Analysis before modelling',
    body: 'Two years reading sales data taught more about what a number actually means than any framework did. The instinct to ask what a metric would look like if it were lying comes from there, not from the doctorate.',
  },
] satisfies Principle[];
