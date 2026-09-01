---
title: 'Evaluating without ground truth'
description: 'Part three of the RAG series. A corpus, a question, and no correct answer to compare against. What do you measure, and how few labels can you get away with?'
category: llms-and-rag
series: rag-in-practice
part: 3
publishDate: 2026-08-16
draft: false
tags: ['rag', 'evaluation', 'retrieval', 'metrics']
heroGlyph: sparkles
---

This is the part I find hardest, and the part most RAG projects skip.

You have a corpus. Someone asks a question. There is no labelled answer to
compare against, because if there were a labelled answer you would not need the
system. So what do you measure?

## Split the system before you measure it

The mistake I made first was evaluating the whole pipeline as one thing: ask a
question, read the answer, form an impression. That tells you almost nothing,
because retrieval and generation fail differently and a single impression
cannot distinguish them.

An answer can be wrong because the right passage never came back. It can be
wrong because the right passage came back and the model ignored it. It can be
right about the wrong question. Those need three different fixes, and one score
hides all three.

So measure the layers separately.

## Retrieval: did the right passage come back?

This is the one you can measure properly, and it is worth the four hours.

Write fifty questions. Real ones, the kind someone would actually type. For
each, find the passage that answers it and record its id. That is your labelled
set, and fifty is enough to catch structural problems.

Then measure recall at k: in what fraction of questions did the answering
passage appear anywhere in the top k results? If recall at 5 is 60%, no amount
of prompt engineering will save you, because two questions in five never had a
chance.

## Retrieval: was it ranked usefully?

Recall alone hides a real failure. If the right passage is present but ranked
ninth, and you only pass the top five to the model, it might as well not exist.

Mean reciprocal rank catches this: the average of 1/rank of the first correct
result. It falls off sharply when the right answer keeps landing just outside
the window, which is exactly the condition recall at a generous k is blind to.

## Generation: did the answer stay inside the passages?

Faithfulness. Take each claim in the answer and ask whether the retrieved text
supports it. A claim that is true but unsupported is still a failure here,
because the system is not supposed to be answering from memory.

This can be scored by a second model, and it is one of the few places I trust
one to judge: the question "is this sentence entailed by this paragraph" is
narrow, and the passages are right there.

## Generation: did it answer the question asked?

Separate from faithfulness, and easy to conflate. An answer can be perfectly
grounded, correctly cited, and about something adjacent to what was asked.
Retrieval brought back a passage on data retention, the question was about data
residency, and the model wrote a good paragraph on the wrong topic.

This one still needs a human reading a sample. I have not found a substitute.

## The refusal test

If I could keep only one measurement, it would be this.

Write twenty questions the corpus genuinely cannot answer. Ask them. Count how
many produce a confident answer instead of "the provided passages do not cover
this".

A system that never refuses is not grounded, whatever its faithfulness score
says. It has simply learned that answering is what it is for. And the failure
is invisible in normal testing, because normal testing uses questions the corpus
does answer.

## What good looks like

Rough targets from the systems I have built, not from a paper:

| Measure | Usable | Good |
|---|---|---|
| Recall at 5 | 80% | 95% |
| MRR | 0.6 | 0.8 |
| Faithfulness | 85% | 95% |
| Correct refusal on unanswerable | 70% | 90% |

The refusal number is always the worst of the four, and it is always the one
that improves most from a single line in the grounding prompt.

## Fifty questions is not a lot

The objection to all of this is that labelling takes time. It does: about four
hours for fifty questions on a corpus you know.

Four hours is less than the time spent guessing. Without the labelled set, every
change to chunking or retrieval or the prompt is evaluated by reading a few
answers and forming an impression, and impressions do not survive contact with
a change that improves one thing and breaks another.

Part four is about the thing evaluation keeps pointing at: the cases where
retrieval is simply the wrong tool.
