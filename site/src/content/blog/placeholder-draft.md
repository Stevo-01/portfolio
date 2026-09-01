---
title: 'This draft must never appear in a build'
description: 'PLACEHOLDER fixture with draft: true. If this title shows up in dist/, the sitemap or the RSS feed, the draft filter has been bypassed somewhere.'
category: mlops
publishDate: 2026-08-25
draft: true
---

**PLACEHOLDER, and deliberately a draft.**

This is a live test of the one rule that cannot be checked by reading code: the
draft filter lives only in `getPublishedPosts()`, and anything calling
`getCollection('blog')` directly will leak this post into production. Slice 07
keeps a draft fixture for exactly this reason — do not delete the concept, only
this file's contents.
