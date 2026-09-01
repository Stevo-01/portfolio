---
title: 'The pipeline'
description: 'Part two of the MLOps series. Turning a sequence of manual steps into something that runs on a schedule and tells you when it did not.'
category: mlops
series: notebook-to-production
part: 2
publishDate: 2026-08-25
draft: false
tags: ['mlops', 'airflow', 'pipelines', 'gcp']
heroGlyph: cloud-cog
---

At Maxis I replaced a recurring manual process with scheduled Airflow DAGs and
took about 90% of the manual input out of it. The engineering was not hard. The
hard part was that nobody had asked whether it needed doing by hand.

That is most automation work.

## A pipeline is a set of promises

Not a script that runs on a timer. The promises are: each step runs after the
one it depends on, a failure stops the ones downstream, a rerun of a step
produces the same result, and somebody finds out when it breaks.

A cron job gives you the timer and none of the rest.

## Idempotence is the property that matters

Every task has to be safe to run twice. Not because you plan to, but because
you will: a retry, a backfill, a partial failure someone reruns by hand at
eleven at night.

In practice that means writing to a deterministic location keyed on the run
date, and replacing rather than appending. Append is where duplicate rows come
from, and duplicates in a training set are hard to spot and expensive to
inherit.

## Check the data, not just the exit code

A step that completes successfully having processed zero rows is a failure
wearing a green tick.

The checks worth having are unglamorous. Did the expected number of rows arrive,
within a tolerance. Are the columns the shape they were yesterday. Is the
freshest record actually fresh. That last one caught more real problems than the
other two combined: at Maxis it meant checking the timeliness of predictions
written to the shared table, and a late upstream job surfaced as a failed check
instead of as quietly stale numbers.

## Fail loudly, in one place

Every task should report to the same channel in the same format, and the message
should say which run, which step, and what the check saw. "Task failed" sends
someone to a log; "expected ~12,000 rows, got 41, for 2026-08-25" does not.

## Do not schedule what nobody reads

The last question, and the one that saves the most work: does the output of this
pipeline change a decision.

If a report runs nightly and nobody has opened it in three months, automating it
faster is not the improvement available.

Part three is about tracking, which is what makes the difference between a
pipeline you trust and one you re-verify by hand every time.
