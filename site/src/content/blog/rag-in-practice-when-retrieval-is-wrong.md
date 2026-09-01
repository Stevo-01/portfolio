---
title: 'When retrieval is the wrong answer'
description: 'Part four of the RAG series. Three situations where adding retrieval makes a system worse, and what to reach for instead.'
category: llms-and-rag
series: rag-in-practice
part: 4
publishDate: 2026-08-20
draft: false
tags: ['rag', 'fine-tuning', 'architecture']
heroGlyph: sparkles
---

I have spent three parts arguing for retrieval, so here is the other side.

Retrieval is a way of getting the right facts in front of a model. If the
problem is not a facts problem, it adds latency, cost and a whole index to
maintain, and it fixes nothing.

## When the problem is behaviour

If every output has to follow a rigid structure, or sound a particular way,
that is behaviour. Behaviour lives in the weights.

Prompting gets you most of the way and drifts on long outputs, which is
frustrating precisely because it works in testing. A fine-tune holds. Retrieval
does neither: handing the model more context does not make it more consistent
about format.

## When the model cannot do the reasoning

Retrieval improves the inputs. It does not raise the ceiling.

If the task needs a chain of inference the base model genuinely cannot follow,
a longer prompt full of relevant passages produces a longer wrong answer. I have
watched a team add retrieval three times to a task that needed a different
model, each time concluding the chunking must be off.

The tell is that the model gets the facts right and the conclusion wrong.

## When the volume makes it uneconomic

Retrieval adds a round trip and inflates every prompt with retrieved text.

At low volume this is irrelevant. At a few million calls a day, a small
fine-tuned model with a short prompt can be dramatically cheaper than a large
one reading four thousand tokens of context each time. That is arithmetic, not
architecture, and it is worth doing before committing.

## The honest default

For most internal tools, over most document corpora, at the volumes those tools
actually see, retrieval is still the right first move. It is cheaper to build,
the answers are traceable, and updating means reindexing rather than retraining.

But "usually right" is not "always right", and the three cases above are
recognisable in advance if you look for them.

Part five is about the operational side: what a retrieval system needs once it
has been running for six months and the corpus has moved on.
