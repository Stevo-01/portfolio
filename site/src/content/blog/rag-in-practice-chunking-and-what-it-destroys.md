---
title: 'Chunking, and what it destroys'
description: 'Part two of the RAG series. Fixed-size chunking is the default everywhere and it quietly breaks structured documents. What to do instead, and how to tell it is happening.'
category: llms-and-rag
series: rag-in-practice
part: 2
publishDate: 2026-08-11
draft: false
tags: ['rag', 'chunking', 'retrieval', 'embeddings']
heroGlyph: sparkles
---

Chunking gets one paragraph in most RAG tutorials and it decides more about
quality than the embedding model does.

The reason it gets one paragraph is that the default works well enough on the
corpus everyone tests with, which is prose. Split an essay every 500 tokens and
you get 500-token pieces of essay. Nothing is lost that matters.

Then you point it at a policy document and it falls apart.

## What fixed-size chunking does to a structured document

Take a clause that reads:

> 4.2 Retention. Records described in 4.1 must be retained for six years from
> the end of the financial year in which they were created.

Split on a token boundary in the wrong place and you get a chunk that says
"must be retained for six years from the end of the financial year in which
they were created" with no subject. Retrieval will find it, because it matches
a question about retention periods beautifully. The model will answer with a
six-year retention period. It will not mention that the rule applies to a
category of record the user was not asking about.

The answer is fluent, sourced, and wrong. That combination is the failure mode I
worry about most, because every surface signal says it worked.

Tables are worse. A table cut in half looks like a complete table with fewer
rows. There is nothing in the retrieved text to indicate that rows seven through
twelve exist.

## The fix is boring

Split on the boundaries the document already has. Sections, subsections, list
items, table rows. Keep tables whole. If a table is too big for one chunk,
repeat the header row in each piece so a fragment is at least self-describing.

Chunks come out wildly uneven: some 40 tokens, some 900. This feels wrong and it
is fine. Uniformity was never the goal; retrievability was.

## Carry the heading trail

The single change that helped most, and it took me embarrassingly long to think
of it: put the document's heading path into the embedded text of every chunk.

So the chunk above is not embedded as "must be retained for six years...". It is
embedded as:

```
Employee records > Retention > 4.2
Records described in 4.1 must be retained for six years from the end of
the financial year in which they were created.
```

Two things improve at once. Retrieval gets the context it needs to distinguish
this clause from the nine other retention clauses in the corpus. And the model
receives a passage that says what it is about, so a partial answer is at least a
correctly-scoped partial answer.

The cost is a few extra tokens per chunk. I have never regretted spending them.

## How to tell it is happening to you

The symptom is not low scores. Retrieval scores look healthy, because the
fragments genuinely do match the questions. The symptom is that a domain expert
reads twenty answers and says "these are all sort of right".

That phrase is the signal. When I hear it I stop looking at the model and go and
read the chunks directly. Not the retrieval results, the raw chunks in the index.
Dump fifty at random and read them as a person. Fragments with no subject,
half-tables, and orphaned list items are obvious the moment you look, and almost
invisible from any metric.

I now do this before building anything else on top. Fifty chunks, read by eye,
about twenty minutes. It has never once been a waste.

Part three is about the thing I still find hardest, which is evaluating any of
this when there is no correct answer to compare against.
