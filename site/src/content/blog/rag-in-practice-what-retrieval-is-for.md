---
title: 'What retrieval is for'
description: 'Part one of a series on building RAG systems that hold up. Starting with the question that decides everything downstream: what problem is retrieval solving here?'
category: llms-and-rag
series: rag-in-practice
part: 1
publishDate: 2026-08-06
draft: false
tags: ['rag', 'retrieval', 'architecture']
heroGlyph: sparkles
---

Most RAG systems I have seen were built because RAG was the thing to build, not
because someone had stated the problem. They usually work in a demo and disappoint
in use, and the reason is visible in the first design decision.

So this series starts with the boring question. What is retrieval for?

## Three problems that look the same

Someone says "the model does not know about our documents". That sentence covers
at least three different situations, and they want different systems.

The first is a lookup problem. A user has a specific question with a specific
answer sitting in one place in one document. What is the retention period for
employee records? There is a clause. Find it, quote it, stop. This is the case
RAG is genuinely excellent at, and it is the case people under-invest in because
it feels too simple to be interesting.

The second is a synthesis problem. The answer is spread across nine documents and
the user needs it combined. What is our position on data residency? Nobody wrote
that down in one place; it is implied by a policy, two contracts, and an
architecture decision record. RAG can help here and it is much harder, because
"retrieve the relevant passage" now means retrieving nine of them and the model
has to reconcile things that partly contradict each other.

The third is not a retrieval problem at all. The user wants an answer the
documents do not contain, and what they actually need is for someone to make a
decision and write it down. No amount of retrieval fixes an organisation that has
not decided something. I have built systems that surfaced this, and it was the
most useful thing they did, though nobody thanked me for it.

## Why the distinction changes the build

If it is a lookup problem, precision is everything and you should optimise for
returning one correct passage. Chunk small, retrieve few, refuse readily. A system
that answers 80% of questions exactly and says "not covered" for the rest is a
good system.

If it is synthesis, recall matters more than precision, because a missing document
means a wrong conclusion rather than a missing answer. You retrieve more, you
accept noise, and you spend your effort on the prompt that has to reconcile
sources. You also need to show the user every source you used, because they will
need to check the reasoning and not just the facts.

Those two systems have different chunk sizes, different k, different prompts, and
different evaluation criteria. Building one and hoping it covers both is how you
get something that demos well.

## The question to ask first

Before any of the architecture, I now ask whoever wants the system to give me ten
real questions they would type into it. Not example questions. Actual ones, the
kind they would ask on a Tuesday.

Two things happen. Sometimes the ten questions are all lookups, and the system
gets much simpler than anyone expected. Sometimes three of them turn out to be
the third category, the ones no document answers, and that conversation is worth
more than the system.

Either way you learn what you are building before you build it, which in my
experience is the difference between a RAG system that gets used and one that gets
demoed once.

Part two takes the lookup case and goes into chunking, which is where I have
wasted the most time and learned the most.
