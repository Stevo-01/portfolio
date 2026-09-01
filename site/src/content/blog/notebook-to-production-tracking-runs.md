---
title: 'Tracking runs with MLflow'
description: 'Part three of the MLOps series. Why a metric you read afterwards is a post-mortem, and what to record so a run six months old can still be understood.'
category: mlops
series: notebook-to-production
part: 3
publishDate: 2026-08-27
draft: false
tags: ['mlops', 'mlflow', 'experiments', 'observability']
heroGlyph: cloud-cog
---

The fine-tuning dashboard I built at UNIMAS existed because metrics nobody could
see while a run was going were metrics nobody acted on. Comparing two
experiments meant reading logs, so comparison mostly did not happen.

## A metric read afterwards is a post-mortem

A run that diverges in the third epoch and finishes forty minutes later has
wasted thirty-seven minutes of GPU and, more importantly, thirty-seven minutes
of your attention pointed at the wrong thing.

Live metrics are not a nicety. They are the difference between stopping a bad
run and writing up why it was bad.

## Record what you will need to reproduce it, not what is easy to log

Loss curves are easy and mostly useless six months later. What I actually want
from an old run is: which commit, which data snapshot, which hyperparameters,
which base model, and what it scored on the eval set that existed at the time.

That last clause matters. Eval sets change. A score without the set it was
measured against is a number, not a result.

## Log the eval set version alongside the score

The mistake that cost me most: comparing a run from March against a run from
June and concluding the June model was better. The eval set had grown by thirty
questions in between, and the easier ones were the new ones.

Tag the run with the eval set's identity. Then a comparison across time either
lines up or refuses to.

## Name runs like you will read them later

`run_47` tells you nothing. `lora-r16-lr2e4-policycorpus-v3` tells you what
changed without opening anything.

The naming convention matters more than the tool. I have used MLflow, and a
directory of JSON files with a consistent schema would have worked nearly as
well for a team of one.

## What good tracking feels like

You can answer "why is the current model the current model" without asking
anyone, and without rerunning anything.

If that question needs a conversation, the tracking is decorative.

Part four is about the step where all of this gets tested for real: deployment,
and the things it exposes that local never did.
