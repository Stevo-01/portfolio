---
title: 'This draft must never appear in a build'
description: 'A permanent fixture with draft: true. If this title reaches dist/, the sitemap or the RSS feed, something bypassed the draft filter.'
category: mlops
publishDate: 2026-08-28
draft: true
tags: ['fixture']
---

This post exists to be excluded, and it should stay in the repository
permanently.

The draft filter lives in exactly one function, `getPublishedPosts()` in
`src/lib/posts.ts`. Any page or component that calls `getCollection('blog')`
directly bypasses it, and the failure is silent: the build succeeds, the page
renders, and an unfinished post is live in `dist/`, the sitemap and the feed.

A PostToolUse hook flags a direct call at write time, and a hook only catches
what someone writes while the hook is installed. This file catches it at build
time instead, which covers the cases the hook does not: a dependency change, a
refactor of the library, a new route added in a hurry.

The check is one line, and it belongs in CI:

```bash
grep -rl "This draft must never appear" dist/ && exit 1
```

If that grep matches, a real draft is public somewhere. Do not fix it by
deleting this file.
