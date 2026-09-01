---
title: 'Face detection in a compliance flow'
description: 'What changes when a computer vision model is not a demo but a step between a customer and a service they are trying to buy.'
category: computer-vision
publishDate: 2026-08-08
draft: false
tags: ['computer-vision', 'opencv', 'fraud', 'product']
heroGlyph: eye
---

At Maxis I built a face detection model for SIM card registration, aimed at
identity fraud. It was projected to cut registration fraud by about 85%.

That figure is a projection from validation, before the system was in
production. I state it that way because the difference matters, and because the
more interesting part of the work was not the accuracy.

## The false positive has a face

In a notebook, a false positive is a cell in a confusion matrix. In a
registration flow it is a real person at a counter being told they cannot buy a
SIM card, in front of a queue, with no idea why.

That reframing changed the design more than any hyperparameter did.

## Verification, not a gate

The model was positioned as a verification step rather than a hard block. A
failed check slowed a registration and routed it to a human. It did not refuse
one.

That costs some fraud prevention on paper. It also means the worst case of a
model error is a delay rather than a denial of service to a legitimate customer,
which is the right trade when the model is new and the base rate of fraud is
low.

## The threshold is a policy, not a parameter

Choosing where to set the decision threshold looks like a modelling decision and
is not. It is a statement about how many legitimate customers you are willing to
inconvenience to catch one fraudulent registration.

Somebody has to own that number, and it should not be the person who trained the
model. The most useful thing I did was present the trade-off as a curve and ask
for a decision, rather than picking a threshold and reporting an F1.

## Conditions the sample did not have

Counter lighting is not sample lighting. Phone cameras vary enormously. People
wear glasses, hold the device at an angle, and stand in front of a window.

Most of the accuracy gap between validation and the real world was environmental,
not algorithmic, and the fixes were mostly about capture guidance rather than the
model.

## What I would do differently

Instrument the rejections from day one. Knowing which cases the model declined,
and being able to look at them, is worth more than another point of validation
accuracy. Without it you are optimising against a distribution you can only
guess at.
