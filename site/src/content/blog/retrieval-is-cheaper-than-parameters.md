---
title: 'Retrieval is cheaper than parameters'
description: 'When to reach for RAG and when to fine-tune, what chunking actually costs you, and how to evaluate a retrieval system that has no ground truth to check against.'
category: llms-and-rag
publishDate: 2026-08-26
draft: false
tags: ['rag', 'retrieval', 'fine-tuning', 'evaluation', 'embeddings']
heroGlyph: sparkles
---

The question I get asked, almost word for word, is "should we fine-tune it on
our documents?" The answer is usually no, and the reason has nothing to do with
how good fine-tuning is.

Fine-tuning teaches a model how to behave. Retrieval tells it what is true right
now. Those are different problems, and the second one is the one most teams
actually have.

## What fine-tuning changes

A fine-tune adjusts weights. You are moving the model's default behaviour:
tone, output format, the shape of an answer, a domain vocabulary it kept
fumbling. It is very good at that.

What it does badly is facts. A fact you trained in has no address. You cannot
point at it, you cannot update it without another training run, and you cannot
tell whether an answer came from your document or from something the base model
absorbed in 2023. When the document changes, the model does not.

I have watched a team fine-tune on a policy manual, ship it, and then discover
the manual had been revised twice during the training window. There was no way
to find out which version the model believed. They had to start over.

## What retrieval changes

Retrieval leaves the weights alone and changes the input. You find the relevant
passage, hand it to the model, and ask it to answer from what it was given.

The useful property is not accuracy. It is that the answer has a provenance. You
can show a reviewer the passage the model was working from, and the reviewer can
disagree with the model. That is the whole thing. A wrong answer you can trace is
a bug report; a wrong answer you cannot trace is a mystery.

Updating means reindexing a document. It takes seconds.

## Chunking is where most of the quality goes

Everyone talks about the embedding model. Almost nobody talks about chunking,
and chunking is where I have lost the most time.

A chunk is the unit you retrieve. Get it wrong and no embedding model saves you,
because the right answer is split across two chunks and neither one looks
relevant on its own.

### Fixed-size chunks

Split every 500 tokens with a 50-token overlap. This is the default in every
tutorial and it works until it does not.

It fails on structured documents. A table gets cut in half. A clause gets
separated from the definition it depends on. A procedure loses step four. The
retrieval looks fine, the scores look reasonable, and the answers are subtly
wrong in a way that takes a domain expert to notice.

### Structure-aware chunks

Split on the document's own boundaries: sections, list items, table rows,
whatever the source actually uses. Chunks come out uneven, which offends the
tidy-minded, and it is worth it.

```python
def chunk_by_section(doc: Document) -> list[Chunk]:
    """Split on the document's own headings, keeping the heading trail.

    The heading trail matters more than it looks. A chunk that says
    "must be retained for six years" is useless without knowing that the
    section above it was "Employee records". The trail goes into the
    embedded text, not just the metadata, so retrieval can match on it.
    """
    chunks = []
    for section in doc.sections:
        trail = " > ".join(section.heading_path)
        for block in section.blocks:
            if block.kind == "table":
                # Tables go whole or not at all. Half a table is worse
                # than no table, because it looks complete.
                chunks.append(Chunk(text=f"{trail}\n\n{block.render()}"))
            else:
                chunks.append(Chunk(text=f"{trail}\n\n{block.text}"))
    return chunks
```

The heading trail trick is the single change that has helped me most. Retrieval
quality on a policy corpus went from unusable to acceptable on that alone.

## Embedding is a lossy index, not a search engine

An embedding is a compression of meaning into a few hundred numbers. Compression
loses things.

What it loses, specifically, is precision on rare tokens. Product codes, version
numbers, surnames, statute references. Ask a vector index for "clause 7.3.2" and
it will cheerfully return clause 7.3.1 and clause 8.2, because those are
extremely close in embedding space and completely different in meaning.

So I run keyword search alongside it and merge. Hybrid retrieval is not elegant
and it fixes a category of failure that no amount of embedding-model shopping
will.

> The first RAG system I built returned confidently wrong answers about a
> specific document version for two weeks before anyone noticed. It was
> retrieving the right section from the wrong revision, and every answer
> was fluent, plausible, and about a document that had been superseded.

## The grounding prompt does more work than it looks like

The instruction you wrap the retrieved passages in is load-bearing. "Answer from
the context below" is not enough, because the model will happily blend the
context with what it already believes and you cannot see the seam.

What has worked for me is explicit permission to fail:

```
Answer using only the passages provided. If the passages do not contain
enough to answer, say so and stop. Do not fill gaps from prior knowledge.
Quote the passage you relied on.
```

The "say so and stop" clause is the important one. Without it the model treats an
unanswerable question as a challenge. With it, "the provided passages do not
cover this" becomes a valid output, which is exactly the signal you want, because
it tells you the retrieval failed rather than hiding it behind prose.

Asking for the quotation is cheap and it makes review possible. A reviewer can
check one sentence.

## Where retrieval stops helping

I have argued for retrieval throughout, so here is the other side. Three
situations where I would fine-tune instead.

### Format and tone

If you need every output to follow a rigid structure, or to sound like your
organisation, retrieval cannot help. That is behaviour, and behaviour lives in
the weights. Prompting gets you most of the way and drifts on long outputs. A
fine-tune holds.

### Reasoning the model cannot do

If the task needs a chain of inference the base model genuinely cannot follow,
handing it more context does not create the capability. Retrieval gives a model
better inputs. It does not make it smarter.

### Latency and cost at high volume

Retrieval adds a round trip and inflates every prompt with retrieved text. At
low volume this is irrelevant. At millions of calls a day, a small fine-tuned
model with a short prompt can be dramatically cheaper than a large model reading
4,000 tokens of context each time. Do the arithmetic before assuming.

## Evaluating a system with no ground truth

This is the part I find genuinely hard, and I have not seen it solved well
anywhere.

You have a corpus and a question. There is no labelled answer. So what do you
measure?

Splitting evaluation into two layers is what made it tractable for me. Retrieval
and generation fail differently and mixing them tells you nothing.

| Layer | What you measure | How | What a failure looks like |
|---|---|---|---|
| Retrieval | Did the right passage come back? | Hand-label 50 questions with the passage that answers them. Measure recall at k. | Answer is wrong because the model never saw the fact |
| Retrieval | Is the top result actually the best one? | Mean reciprocal rank over the same set | Right passage present but ranked ninth, so it fell outside the context window |
| Generation | Did the answer stay inside the passages? | Faithfulness check: for each claim, is it supported by the retrieved text? | Fluent answer containing a fact from nowhere |
| Generation | Did it answer the question asked? | Human read of a sample | Correct, sourced, and about something else |
| System | Does it refuse when it should? | Ask 20 questions the corpus cannot answer | Confident invention instead of "not covered" |

Fifty hand-labelled questions sounds like a small number and it is enough to
catch structural problems. It is also about four hours of work, which is why
people skip it and then spend a fortnight guessing.

The refusal test in the last row is the one I would keep if I could only keep
one. A system that never says "I do not know" is not grounded, whatever its
faithfulness score says.

## What I would build first

If I were starting tomorrow on a corpus of a few thousand documents:

1. Structure-aware chunking with the heading trail in the embedded text.
2. Hybrid retrieval, vectors and keywords, merged.
3. A grounding prompt with explicit permission to refuse.
4. Fifty hand-labelled questions before writing any front end.
5. A front end that shows the retrieved passage next to the answer.

Point five is not a nice-to-have. It is what turns the system into something a
non-technical reviewer can validate, and until someone outside the team can
validate it, you do not know whether it works. You know that it runs.
