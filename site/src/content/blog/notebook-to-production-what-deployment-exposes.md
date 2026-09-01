---
title: 'What deployment exposes'
description: 'Part four of the MLOps series. The failures that only appear once a model is behind a request, and why most of them are not model failures.'
category: mlops
series: notebook-to-production
part: 4
publishDate: 2026-08-29
draft: false
tags: ['mlops', 'deployment', 'fastapi', 'monitoring']
heroGlyph: cloud-cog
---

A model that works in a notebook and fails in production usually has not
changed. What changed is everything around it.

## Cold start is a product decision

Loading weights takes seconds. If the process loads them per request, the first
user of every idle period waits, and on a lightly used internal tool that is
most users.

Load at startup, hold in memory, and accept that the container is now stateful
in the only way that matters. If the deployment target cannot keep a warm
instance, that constrains the model size more than accuracy does.

## The input distribution is different and nobody told you

Training data is curated by definition: somebody chose it. Production input is
whatever arrives.

Empty strings. Text in another language. A field that was always populated in
the sample and is null in 4% of real traffic. The model does not error on any of
these, it just produces something.

Validate at the boundary, with a schema, and reject rather than guess. A 422
with a clear message is a better answer than a confident prediction on garbage.

## Preprocessing skew shows up here or never

If training normalised one way and serving normalises another, the model sees a
distribution it never trained on and quietly degrades. No exception, no alert,
slightly worse answers.

This is the argument for shipping the transform inside the package rather than
reimplementing it in the service, and it is the failure I check for first when a
deployed model underperforms its evaluation.

## Log the inputs you are allowed to log

Not to debug today's request. To answer, in a month, "what does the traffic
actually look like", because it will not look like the sample.

What is permissible depends on the data, and for anything touching a customer
the answer is usually "shapes and distributions, not contents". Even that is
enough to notice drift.

## Health checks that mean something

`GET /health` returning 200 because the web framework started tells you the web
framework started.

A useful check runs a known input through the loaded model and compares the
output to a known value. It catches a corrupted artefact, a half-loaded model,
and a dependency that resolved differently on this host, none of which the
trivial check sees.

## The thing that actually breaks

In my experience it is almost never the model. It is a version, a null, a
timeout, or a preprocessing step that lives in two places.

Which is the argument this whole series has been making: the modelling is the
part that is already done when you start.
