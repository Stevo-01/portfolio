---
title: 'Packaging the model'
description: 'Part one of the MLOps series. A notebook is not an artefact. What has to be pinned, captured and versioned before anyone but its author can run a model.'
category: mlops
series: notebook-to-production
part: 1
publishDate: 2026-08-22
draft: false
tags: ['mlops', 'packaging', 'reproducibility', 'docker']
heroGlyph: cloud-cog
---

The gap between a model that works and a model somebody else can run is wider
than it looks, and almost none of it is machine learning.

## The notebook is not the artefact

A notebook is a record of what you did in the order you happened to do it. Cells
run out of order, variables persist from experiments you deleted, and the
install that made it work happened in a terminal three days ago.

The test is simple and most notebooks fail it: restart the kernel, run all
cells, and see whether the same model comes out. If it does not, there is no
artefact yet, only a session.

## What a package has to carry

Four things, and the model weights are the least interesting of them.

The weights themselves. The code that turns an input into the shape the model
expects. The exact dependency versions. And enough metadata to answer "which
model is this and where did it come from" six months later, when the answer
matters and nobody remembers.

## Pin the dependencies, properly

`requirements.txt` with unpinned versions is not a dependency spec, it is a
wish. `torch` means whatever torch resolves to today, and a minor release of a
tokeniser has changed my outputs before.

Lock everything, transitively. Whatever tool you use, the property that matters
is that installing from the lock file two months from now produces byte-identical
packages.

## Separate the interface from the model

The thing that loads weights and calls `predict` should not be the thing that
parses a request. Keep a plain function that takes typed inputs and returns typed
outputs, with no knowledge of HTTP.

That boundary is what lets the same model sit behind a FastAPI service, a batch
job, and a notebook cell during debugging, without three copies of the
preprocessing drifting apart. It is also the only version you can unit test.

## Preprocessing belongs in the package

The most common production bug I have seen is not a bad model. It is a
preprocessing mismatch: training normalised one way, serving normalised another,
and the model receives inputs from a distribution it never saw.

It produces confident, plausible, wrong output, and it is invisible in every
metric except the one nobody is watching.

If the transform runs at training time, it ships with the model. Not
reimplemented alongside it.

## Version the artefact, not the file

`model_final_v2_actually_final.pkl` is a real filename I have seen on a real
project.

Give the artefact an id, and record what produced it: the code commit, the data
snapshot, the hyperparameters, the metrics it scored. MLflow does this well; so
does a JSON file next to the weights, if the alternative is nothing.

## The container is the easy part

Once the package is right, containerising it is a short Dockerfile:

```dockerfile
FROM python:3.12-slim

# Dependencies first, in their own layer. Code changes far more often than the
# lock file, so ordering it this way means a code edit rebuilds one small layer
# instead of reinstalling torch.
COPY requirements.lock .
RUN pip install --no-cache-dir -r requirements.lock

COPY src/ ./src/
COPY artifacts/model/ ./artifacts/model/

# Not root. The process needs to read weights and answer requests; it has no
# business being able to write to the image.
RUN useradd --create-home app && chown -R app /app
USER app

CMD ["uvicorn", "src.serve:app", "--host", "0.0.0.0", "--port", "8000"]
```

Most of the difficulty people attribute to containers is actually the packaging
problems above, surfacing at the point where they become undeniable.

## Keep the image small, but not obsessively

`python:3.12-slim` over the full image is worth it. Chasing further, to alpine,
usually is not: musl breaks wheels for half the scientific stack and you end up
compiling numpy from source to save a hundred megabytes that get cached after
the first pull anyway.

## Test the package, not the model

Model quality is an evaluation question. Packaging has its own tests, and they
are boring in a good way.

Does the artefact load from a clean environment. Does a known input produce a
known output. Does the container start and answer a health check. Do the pinned
versions still resolve.

That last one catches supply-chain breakage before a deploy does.

## What this buys you

Every one of these is unglamorous, and together they are the difference between
a model that one person can run and a model that a system can run.

The measure I use: could someone who has never seen this project take the
artefact and get the same prediction as me, with no help. Until the answer is
yes, it is not packaged, it is just saved.

Part two takes the packaged artefact and puts a pipeline around it.
