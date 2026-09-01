---
title: 'What a fine-tuning run actually costs'
description: 'The GPU bill is the small part. An honest accounting of where the time goes when you fine-tune a language model, based on runs that mostly did not work.'
category: machine-learning
publishDate: 2026-08-18
draft: false
tags: ['fine-tuning', 'cost', 'evaluation']
---

The GPU hours are the cheapest part of a fine-tune and the only part anyone
estimates.

Here is where my time actually went on a run that produced a usable model, and
on the four before it that did not.

Building the dataset took about three days. Not collecting it, building it:
deciding what a good example looked like, writing 200 of them by hand, finding
that half were inconsistent with each other, and rewriting those. The
inconsistency was mine. I had changed my mind about the output format around
example 90 and had not gone back.

The training run took forty minutes and cost less than a takeaway.

Evaluating it took another two days, because I had not built the evaluation set
before training. So I trained, looked at some outputs, thought "that seems
better", and had no way to know. Building the eval set afterwards meant I could
not compare against the base model on the same questions without rerunning
everything.

That is the actual lesson, and it took four wasted runs to learn: write the
evaluation set first. Before the training data. It forces you to say what
"better" means while you can still change what you are optimising for, and it
costs you nothing you were not going to spend anyway.

The four failed runs were not failures of the model. Two were dataset format
errors I would have caught with ten minutes of reading. One was a learning rate
I copied from a tutorial aimed at a model an order of magnitude smaller. One
worked fine and I could not tell, because of the evaluation problem above.

So the real budget for a fine-tune, in my experience, is roughly one week of a
person and one hour of a GPU. If someone quotes you the GPU number, they have
not done it.
