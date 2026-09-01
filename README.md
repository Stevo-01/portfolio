# Portfolio & engineering journal

The personal site of Stephen Adedigba, AI and machine learning engineer.
A static Astro build served from S3 behind CloudFront, deployed by GitHub
Actions over OIDC.

Two halves sharing one shell: a portfolio, and a journal about retrieval,
language models, and getting a model out of a notebook and in front of
somebody.

- Site: <https://stephen.naijora.com>
- Feed: <https://stephen.naijora.com/rss.xml>

---

## Why it is built this way

The repository is part of the argument the site makes. Someone who only trains
models does not ship a Terraform stack, an OIDC deploy pipeline and a
Lighthouse budget, and the site says that shipping end to end is the point.

So the architecture had to be defensible, which mostly meant refusing things.

### It costs about $0.55 a month

| Line | Monthly |
|---|---|
| Route 53 hosted zone | shared, already paid for the apex |
| S3 storage, ~15 MB | under $0.01 |
| S3 requests | under $0.01 |
| CloudFront, 1 M requests + 5 GB out | ~$0.50 free-tier-adjusted |
| ACM certificate | $0.00, public certs are free |
| CloudWatch alarm | $0.10 |
| **Total** | **~$0.55** |

That figure is checkable, which is the point of quoting it.

### What was rejected, and what it would have cost

**SSR on Lambda.** The content is markdown in git. There is nothing to
personalise and no session. SSR would add cold starts to a page that is
otherwise served from an edge cache, and roughly $5 a month in Lambda and API
Gateway for a slower site.

**A container.** ECS Fargate at the smallest usable task is about $9 a month to
serve files that never change between deploys, plus a load balancer at ~$16.

**A VPC.** Nothing here needs a private network. A single NAT Gateway is
**$32 a month before a byte of traffic**, which is roughly sixty times the
entire cost of this stack. CI fails the build if `aws_vpc`, `nat_gateway`,
`aws_lb`, `aws_db_instance` or `aws_instance` appears anywhere in `infra/`.

**A database.** Three content collections validated by Zod at build time. A
schema error fails the build rather than rendering a broken page at 2am.

## Stack

| | |
|---|---|
| Framework | Astro, static output, no adapter |
| Content | Markdown + YAML, Zod-validated at build |
| Styling | Plain CSS with custom properties, no framework |
| Type | Geist Sans and Geist Mono, self-hosted |
| Hosting | S3 (private) + CloudFront with Origin Access Control |
| TLS | ACM in us-east-1 |
| IaC | Terraform, S3 backend with native locking |
| CI/CD | GitHub Actions, OIDC, no long-lived keys |

## Architecture

```
                    ┌──────────────┐
   visitor ────────▶│  CloudFront  │
                    │  + function  │  viewer-request rewrites /blog/ -> /blog/index.html
                    └──────┬───────┘
                           │ OAC, SigV4
                    ┌──────▼───────┐
                    │  S3, private │  no website endpoint, no public access
                    └──────────────┘

   git push main ──▶ GitHub Actions ──OIDC──▶ site-deploy role ──▶ S3 + invalidation
```

The CloudFront Function is not optional. S3's REST endpoint, which OAC
requires, does not resolve `/blog/` to `/blog/index.html` the way the website
endpoint does. Without the rewrite every directory URL returns 403 and only the
homepage works.

## Repo layout

```
site/          the Astro project
  src/
    components/  ui, layout, home, journal, article, background, seo
    content/     blog posts, categories, series
    data/        typed portfolio content
    lib/         content queries. The draft filter lives here and only here.
    styles/      tokens.css is the only file allowed to contain a hex value
infra/         Terraform. Read infra/README.md before running anything.
scripts/       CSP hashing, header-accurate local preview
.github/       CI, deploy, infra plan/apply, monthly drift check
```

## Quick start

```bash
cd site
npm ci
npm run dev            # http://localhost:4321
npm run build
npx astro check        # types
npm run no-hex         # no stray colours outside tokens.css
```

To preview with the real production headers, including the CSP:

```bash
npm --prefix site run build
node scripts/preview-with-headers.mjs    # http://localhost:4400
```

Use that rather than `astro preview` when touching anything involving inline
scripts. `astro preview` sends no CSP, so a policy that would block the theme
script in production looks perfectly fine locally.

## Writing

Posts are markdown in `site/src/content/blog/`.

```yaml
---
title: 'A title'
description: 'Under 170 characters. Doubles as the meta description and the card dek.'
category: llms-and-rag        # one of the five slugs
publishDate: 2026-08-26
draft: false
tags: ['rag', 'evaluation']
series: rag-in-practice       # optional, but see below
part: 2                       # optional, but see below
heroGlyph: sparkles           # optional, overrides the category glyph
---
```

`series` and `part` must be set together. A Zod `.refine()` fails the build
otherwise, which is the whole reason this uses a schema instead of loose
frontmatter: a series entry with no part cannot be ordered, and a part with no
series belongs to nothing.

`minutesRead` is injected by a remark plugin from the body. Never author it.

### Adding a category

Five edits, three of which the compiler will demand:

1. `site/src/types/content.ts` — add the slug to `CATEGORY_SLUGS`
2. `site/src/content/categories/<slug>.yaml`
3. `site/src/components/journal/taxonomy.ts` — `CATEGORY_ART` entry
4. `site/src/components/ui/icon-paths.ts` — the glyph, if it is new

`CATEGORY_ART` is a total `Record`, so forgetting it is a type error rather
than an unstyled cover.

### Adding a series

`site/src/content/series/<slug>.yaml`, then set `series` and `part` on the
posts. A series with no parts yet renders an empty state rather than a blank
grid.

## Deploying

Push to `main` touching `site/**` and `site-deploy` runs: build, assume the
deploy role over OIDC, then a three-stage sync.

The order matters. A single `aws s3 sync --delete` has two failure windows:
HTML can go live referencing assets that have not uploaded yet, and `--delete`
can remove an asset a page still in someone's browser is about to request. So
hashed assets go first with a one-year immutable cache, then documents with
`max-age=0, must-revalidate`, then orphans are pruned last.

Because documents are `must-revalidate`, CloudFront revalidates by ETag and
**routine deploys need no invalidation at all**, which keeps the account inside
the 1,000 free invalidation paths a month. If blanket `/*` invalidations ever
become routine, the cache headers are wrong.

Infrastructure changes go through `infra.yml`: plan on the PR, apply behind an
approval gate on merge. See `infra/README.md`, which opens with a warning worth
reading: this AWS account also hosts an unrelated live site.

### The CSP hashes are content-derived

The theme-init script is inline in every `<head>` and must run before first
paint, so it cannot be an external file with an integrity attribute. Its
SHA-256 is pinned in the CSP:

```bash
npm --prefix site run build
node scripts/csp-hashes.mjs --write     # updates infra/envs/prod/terraform.tfvars
node scripts/csp-hashes.mjs --check     # CI: fails if stale
```

A stale hash blocks the script in the browser with nothing failing
server-side. The build passes, the deploy passes, and every visitor who chose
light mode gets a dark flash on every navigation.

## Conventions

Tokens only, never a hardcoded hex outside `tokens.css`. Dark is the default
theme and light is the override, not the other way round. Zero client
JavaScript unless a component is a declared island, currently four of them.
`prefers-reduced-motion` is honoured in every animated component, checked
before any animation loop starts rather than cancelled after.

Contributor detail is in [`AGENTS.md`](./AGENTS.md).
