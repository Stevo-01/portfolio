---
title: 'Keeping an index honest'
description: 'Part five of the RAG series. What happens to a retrieval system six months in, when the corpus has changed and nobody reindexed.'
category: llms-and-rag
series: rag-in-practice
part: 5
publishDate: 2026-08-24
draft: false
tags: ['rag', 'operations', 'retrieval']
heroGlyph: sparkles
---

The first RAG system I built returned confidently wrong answers for two weeks
before anyone noticed. It was retrieving the right section from a superseded
revision of the document. Every answer was fluent, sourced, and about a policy
that had been replaced.

Nothing was broken. That is the problem.

## Staleness has no error message

A retrieval system that is out of date does not fail. It succeeds against an
old world. Scores look healthy, latency is fine, the citations resolve, and the
answers describe a document that no longer says that.

Compare that with an application database, where a stale read usually surfaces
as something visibly odd. Here the output is prose, and prose absorbs anything.

## Index the version, not just the text

The fix that mattered most was cheap: store the source document's revision and
last-modified date in the chunk metadata, and surface them with the answer.

A reader who sees "from Employee records, revision 4, March 2026" can tell at a
glance whether that is current. A reader who sees a paragraph cannot.

## Reindex on the document, not on a schedule

A nightly full reindex is simple and wasteful, and it still leaves a window.
Watching the source and reindexing the documents that changed is not much more
work, and it closes the window to minutes.

If the corpus lives somewhere with no change feed, a checksum sweep is a decent
substitute. What matters is that the trigger is the document changing rather
than the clock reaching a number.

## Delete properly

Removing a document from the source and leaving its chunks in the index is the
worst state available: the system will confidently cite something that no longer
exists, and there is no way for a reader to check.

Deletion has to propagate. It is the least interesting part of the pipeline and
the one most likely to be skipped.

## Watch the refusal rate

The most useful operational metric I have found is the proportion of questions
the system declines to answer.

If it drifts down, either the corpus got better or the grounding got looser, and
it is usually the second. If it spikes, something upstream broke and the index
is returning nothing useful. Either way it moves before anyone complains, which
is more than the retrieval scores do.
