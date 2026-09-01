---
title: 'The chart that changed a mind'
description: 'Two years reading sales data taught me more about what a number means than any framework did. Mostly it taught me that the chart is the argument.'
category: data-science
publishDate: 2026-08-12
draft: false
tags: ['data-science', 'visualisation', 'communication']
heroGlyph: bar-chart
---

Before any of the machine learning, I spent two years as an analyst filtering
sales data in Excel. It is the least impressive line on my CV and probably the
most useful.

## The number was never the hard part

Working out that sales were down in a region took an afternoon. Getting anyone
to act on it took three weeks and four different charts.

The first three were correct. They showed the decline, they were accurate, and
they changed nothing. The fourth worked because it put the region next to two
comparable ones on the same axis, and the gap did the arguing.

## A chart is not a report of a finding

It is the finding, arranged so somebody else reaches it.

That sounds like presentation advice and it is actually an analysis constraint.
If the point cannot survive being put on one pair of axes, the point is probably
not as clear as the analysis felt.

## What I stopped doing

Plotting everything I had. A chart with seven series is a table with extra
steps, and the reader picks whichever line supports what they already thought.

Starting the y-axis wherever the data happened to sit. A truncated axis makes
noise look like a trend, and once someone notices, they stop trusting the rest
of your work.

Using colour to distinguish things that are not different.

## What I kept

Comparison. Almost every useful chart is one thing against another: this region
against similar regions, this month against the same month last year, actual
against forecast. A single line has no argument in it.

Annotation. If there is one thing to notice, write it on the chart. The reader
should not have to reverse-engineer the point from the shape.

## Why this ended up mattering for models

A model output is a number that has to change somebody's decision, which is the
same problem.

The Flask review tool I built at UNIMAS came directly from this: a classifier
that only its author can evaluate is a claim, not a result. Putting the outputs
in front of the people who understood the domain was the same move as the fourth
chart, and it worked for the same reason.
