# AGENTS.md

> **Single source of truth** for this repo — how it's built, the conventions that hold it together, and the traps that will cost you an evening. Every contributor reads this, human or AI.
>
> What the project *is* and why it's built this way belongs in **`README.md`** once it exists. Claude Code's own wiring lives in **[`CLAUDE.md`](./CLAUDE.md)**. Don't duplicate project facts into either.

---

## 🎯 The constraint that shapes everything

**The repo is the portfolio argument.** The owner is an AI and machine learning engineer and a PhD candidate whose actual differentiator is not the modelling — it is that the model reaches somebody. The resume says this outright: a RAG chatbot with a Streamlit front end over a FastAPI backend, a Flask review tool built so non-technical stakeholders could validate output themselves, a React dashboard showing training metrics live. The line in the resume's skills section reads *"rapid prototyping for AI/ML demos, translating model outputs into usable interfaces for non-technical stakeholders."* That is the thesis.

So the site has to be a working, deployed, measured thing — not a notebook export and not a template. Someone who only trains models does not ship a Terraform stack with OIDC deploys and a Lighthouse budget. **The repository is the evidence for the claim the homepage makes.**

> ⚠️ **Do not borrow the reference site's argument.** The reference implementation at `../../portfolio` belongs to a backend and cloud engineer, so it leads with cost optimisation and operational simplicity — $0.55 a month, no NAT Gateway, nothing that needs a private network. That framing is *his* pitch. It is true of this architecture too, but it is not what this owner is selling, and a portfolio that argues someone else's case reads as borrowed. Static hosting is still the right call here; the reason is shipping discipline, not the invoice.

## 🚦 Current state — read this first

**Nothing is built.** The tracked tree holds this file, `CLAUDE.md`, `.mcp.json`, `.claude/` wiring, and `docs/plans/`. There is no `site/`, no `infra/`, no `scripts/`.

The build is specified end to end in **[`docs/plans/`](./docs/plans/README.md)** — start at its `README.md`. `BUILD-PLAN.md` is the commit ladder; nothing gets built outside a step in it.

The site domain and the AWS account are **undecided** — see `docs/plans/DECISIONS.md` D1 and D2. They block the infrastructure slice and nothing else. Do not invent a hostname to unblock yourself; `https://example.invalid` is the documented placeholder.

Do not assume any other file exists, and do not invent paths.

## 🏗️ Architecture

**Static output only.** No SSR, no adapter, no Lambda, no containers, and **no VPC** — nothing here needs a private network. Content lives as markdown in git; there is no database and no CMS.

**Two top-level concerns, deliberately separated** — `site/` and `infra/` — so npm and Terraform never compete for root config, and so CI can path-filter. A blog post edit must never trigger `terraform plan`.

**Regions.** Origin and state buckets in `ap-southeast-1`; the ACM certificate **must** be in `us-east-1`, which is why the Terraform modules take two provider aliases.

## 🧩 The build model

Fourteen work commits across five phases, **sequential**, one slice at a time. `docs/plans/BUILD-PLAN.md` §2 has the branch topology and §11 the tracker.

The slice definitions come from nine group briefs at `../../grouped/plans/` — read `PLAN.md` there before any individual brief. Those briefs were written for a nine-agent parallel run; this build does the same work in one lane, in a different order (content second, not eighth).

Three rules survive the change from parallel to sequential, and they are the reason the slices stay clean:

1. **Disjoint file ownership.** Every slice owns an exclusive set of paths (`PLAN.md` §3). Working sequentially makes it trivially easy to reach two slices over and "just fix" something. Don't. If slice 05 needs a token, that is a commit against slice 00's file with its own message, not a silent edit buried in an unrelated diff.
2. **Slice 00 owns all shared config.** It installs every dependency and registers every Astro integration up front. Nothing else touches `package.json` or `astro.config.mjs`.
3. **Contracts are frozen before anything consumes them.** Tokens, types, component props, and library signatures are fixed in `PLAN.md` §4–§6, as amended by `docs/plans/DESIGN-DELTA.md`. Slice 00 ships a typed stub for every cross-slice component; later slices replace the body and **never** the signature.

> **Re-derive, don't copy.** `../../portfolio` is a working reference for the same architecture. Read it to understand *how* S3 + OAC serves a directory URL or *what shape* a `SkillGroup` is. Never `cp` from it. The palette, the content, and the prose are all different here, and a file that arrives by copy carries the wrong three.

## 🎨 Design system

Decided and locked in **[`docs/plans/DESIGN-DELTA.md`](./docs/plans/DESIGN-DELTA.md)**, which supersedes `PLAN.md` §4.1–4.3 and §4.8 completely. These are project facts, not preferences — don't renegotiate them mid-build.

**Dark is the default theme.** Author dark on `:root` and treat light as the override. A stored preference wins; otherwise dark. `prefers-color-scheme: light` is deliberately *not* auto-honoured.

**Palette** — espresso base, peach coral accent. Warm, lifestyle, welcoming. Dark mode clears WCAG AA everywhere on `#191210`: body text 15.52:1, accent 8.17:1, muted 7.18:1. Full tables and every measured ratio are in `DESIGN-DELTA.md` §1–§2.

> ⚠️ **Two colour rules, and both are silent failures if you get them wrong.**
>
> **1. `#FB923C` scores 2.22:1 on the light background** and fails AA badly. In light mode the accent remaps to `#C2410C` (5.07:1). The raw peach and apricot are permitted in light mode *only* for large decorative fills — aurora, cover art — never for text, icons, borders, or focus rings.
>
> **2. `--on-accent` inverts between themes.** White on the peach CTA fill is **2.26:1 — a hard fail**. It is `#1A0E05` in dark (8.37:1) and `#FFFFFF` in light (5.18:1). Any component that hardcodes either one breaks in the other theme, and dark mode will look perfect while it does.

**Typography** — a single family, **Geist Sans** plus **Geist Mono**, self-hosted via `@fontsource-variable`. No serif anywhere, and no Google Fonts CDN (that keeps `font-src 'self'` in the CSP and removes two origins from the critical path).

Dropping the serif has a consequence worth understanding: it was the only thing separating the journal from the portfolio. That separation now has to come from **layout** — a masthead at a scale nothing on the portfolio uses, a peach gradient accent word, a denser grid, cover art as the signature, and its own footer.

**Motion** — the house style is a hover lift with a peach glow, gradient CTAs, glass surfaces with backdrop saturation, and scroll reveals that fire once. Specifics in `PLAN.md` §4.6, which still applies.

> ⚠️ `prefers-reduced-motion: reduce` is **mandatory in every animated component**. Under it the aurora freezes, icons stop, the marquee stops, and reveals render in final state immediately. Check the preference *before* starting work — don't start a rAF loop and then cancel it.

## 📚 Content model

Three collections, validated by Zod at build time: `blog` (markdown posts, schema in `PLAN.md` §5.2), `categories`, and `series` (ordered reading paths).

**Five disciplines**, fixed in slice 00 and listed in `docs/plans/CONTENT-MAP.md` §6: `machine-learning`, `llms-and-rag`, `mlops`, `data-science`, `computer-vision`. Adding one later means four coordinated edits — the `CATEGORY_SLUGS` tuple, a YAML file, `CATEGORY_ART`, and the OG recipe. Three of those are total `Record`s keyed on `CategorySlug`, so a miss is a type error rather than an unstyled cover. Decide the set once.

Two invariants the schema enforces or the code depends on:

- **`series` and `part` must be set together.** A `.refine()` fails the build otherwise. This is the entire reason for using a schema rather than loose frontmatter.
- **The draft filter exists in exactly one place** — `getPublishedPosts()` in `src/lib`. Never call `getCollection('blog')` directly from a page or component, or drafts leak into production. A hook flags this on write.

`minutesRead` is injected by a remark plugin at build time. It is never authored and never part of the schema.

Portfolio content — experience, projects, skills, education — has no markdown body, so it lives as typed TypeScript modules under `src/data/` with `satisfies` so a missing field is a compile error. Every string in them comes from `docs/plans/CONTENT-MAP.md`.

> ⚠️ **Two content rules that are not style preferences.**
>
> **Do not invent metrics.** Every number on this site traces to a line in the resume or to a build-time derivation. No invented accuracies, no rounded-up years, no fourth stat added to balance a grid.
>
> **Do not upgrade a hedged claim.** The resume says a face-detection model was *"expected to reduce fraud by 85%"*. That is a projection and it ships as one. `CONTENT-MAP.md` §1 carries the exact wording for each of the three quantified claims. The difference matters the moment someone asks how a figure was measured.

## ⚙️ Commands

The audit set — these catch the mistakes this project is prone to:

```bash
# stray hex outside the token file
grep -rEn '#[0-9a-fA-F]{3,8}' site/src --include=*.astro --include=*.css | grep -v tokens.css

# anyone bypassing the draft filter
grep -rn "getCollection('blog')" site/src --include=*.astro | grep -v src/lib

# expensive AWS resources that must never appear
grep -rn "aws_vpc\|nat_gateway\|aws_lb\|aws_db_instance" infra/
```

Use `npm ci` in preference to `npm install` — slice 00 owns the lockfile, and a stray install rewrites peer entries nobody asked to change. There is one Terraform environment, `infra/envs/prod`; plans run on PRs, applies wait on the `infra-prod` approval gate.

## 🤝 Working in this repo

### Git safety

- ❌ **Never `git commit` or `git push` automatically.** Commits are the developer's call.
- ❌ **Never `--force`, `reset --hard`, or anything destructive** unless explicitly asked.
- ✅ Fine without asking: `status`, `diff`, `log`, `show`, `branch`, `checkout -b`, `switch`, `stash`.
- 📋 Run `git diff` before the developer commits so they can review.
- 🔑 **`.env` in this repo root holds a live GitHub token.** It is gitignored. Never stage it, never print it, never pass it to a subprocess that logs its arguments.

### Workflow

Restate the requirement, produce a plan covering files touched and risks, and wait for approval before any non-trivial change. Execute one task at a time; for five or more, keep a visible checklist. Verify after each with `npm run build` and `npx astro check`, then state plainly what you could *not* verify — visual regressions, real-device rendering, and anything behind a deployed URL need a human or a browser tool.

If you're executing a build step, its **gate** in `BUILD-PLAN.md` §8 is the definition of done. Work it literally. No step starts until the previous step's gate passes.

When finishing a step, report: files created, contracts published, measured sizes against budget, and — most importantly — **anything you needed but could not own**.

## 🧭 Conventions

**Styling**
- Tokens only. **Never hardcode a hex value** outside `tokens.css`. A missing token is a request against slice 00, not a local constant. A hook flags this on write.
- Scoped `<style>` blocks by default. Something belongs in `global.css` only if two unrelated slices need it — and then slice 00 owns it.

**JavaScript**
- Zero client JS unless the component is a declared island. Currently only: the theme toggle, the animated background, the scroll-reveal wrapper, and an optional TOC scroll-spy.
- Homepage budget is **9 KB gz** (raised from 5 KB specifically to fund the animated background). Other routes: 3 KB.

**Accessibility** — not negotiable
- One `<h1>` per page, no skipped heading levels.
- Visible focus on every interactive element; never remove the ring.
- Decorative SVG gets `aria-hidden`; meaningful icons get a label.
- Landmarks plus a skip-link to `#main`.
- Target AA. The dark palette already clears it — don't introduce new colours.

**Performance** — LCP < 1.8s, CLS < 0.05, Lighthouse Perf ≥ 95, and 100 on A11y / Best Practices / SEO.

**Infrastructure** — no VPC, NAT Gateway, ALB, RDS, or EC2. Nothing here needs a private network, and a NAT Gateway alone would cost more than the rest of the stack combined. If you find yourself writing `aws_vpc`, stop and ask why. Guardrails set on day one: an AWS Budget alert, a CloudWatch alarm on CloudFront 5xx above 1%, and a scheduled monthly `terraform plan` to catch console drift.

**One environment, `prod`.** The reference build carried a `staging` environment for a while and then deleted it — a second CloudFront distribution for a personal site is cost with no reader. Do not create it.

## ⚠️ Gotchas

The first two are the most common way this exact architecture fails.

**1. S3 + OAC does not serve index documents.** The S3 *website* endpoint resolves `/blog/` to `/blog/index.html`. The *REST* endpoint — which OAC requires — does not. Without a CloudFront Function on `viewer-request` rewriting the URI, every directory URL returns 403. Use a CloudFront Function, not Lambda@Edge.

**2. Missing objects return 403, not 404.** Because the bucket is private, S3 answers `AccessDenied` for a key that doesn't exist. **Both** 403 and 404 must map to `/404.html` with a 404 status, or the custom 404 page never appears.

**3. CloudFront applies are slow.** Five to fifteen minutes to deploy or update, and a distribution must be disabled before it can be destroyed. Read the docs and apply once rather than iterating by trial and error.

**4. Empty Route 53 hosted zones still bill.** Deleting records isn't enough — delete the zone.

**5. OIDC subject claims are immutable and keyed on numeric ids.** A trust policy written against an `owner/repo` string fails. Get the ids from `gh api repos/<owner>/<repo> --jq '{repo_id: .id, owner_id: .owner.id}'`.

**6. Zero-pad the TOC.** Naive `'0' + index` renders `010` past the ninth heading. Use `padStart(2, '0')`. The long fixture post crosses that boundary on purpose so the bug surfaces in development.

**7. Timeline card headers need a grid, not flex-wrap.** With flex, a long institution name pushes the date and location onto their own row instead of holding them top-right. Use `grid-template-columns: minmax(0,1fr) auto`. "University Malaysia Sarawak (UNIMAS)" is long enough to trigger it.

**8. HTML cache headers remove the need for invalidations.** Serving HTML as `max-age=0, must-revalidate` means CloudFront revalidates via ETag, so routine deploys need no invalidation at all — which keeps you inside the free tier of 1,000 paths per month. If blanket `/*` invalidations become routine, the cache headers are wrong.

**9. ACM SANs are immutable.** A wildcard matches exactly one label, so `www.sub.example.com` is not covered by `*.example.com`. Covering a name the wildcard doesn't match means a new certificate, not an edit. Decide the name set before requesting.

**10. An empty category renders an empty state, not a broken grid.** With five disciplines and a staged content rollout, at least one category *will* be empty the first time the journal builds.

---

## 🗂️ The documents you must know

1. **[`docs/plans/README.md`](./docs/plans/README.md)** — entry point, source list, precedence order.
2. **[`docs/plans/BUILD-PLAN.md`](./docs/plans/BUILD-PLAN.md)** — the commit ladder and the gate. Nothing gets built outside a step in it.
3. **[`docs/plans/DESIGN-DELTA.md`](./docs/plans/DESIGN-DELTA.md)** — the espresso and peach coral contract, both themes, contrast-verified.
4. **[`docs/plans/CONTENT-MAP.md`](./docs/plans/CONTENT-MAP.md)** — every string, traced to the resume.
5. **[`docs/plans/DECISIONS.md`](./docs/plans/DECISIONS.md)** — the seven open inputs and what each one blocks.
6. **`../../grouped/plans/PLAN.md`** — contracts, ownership matrix, component signatures. Read before any group brief.
7. **`../../astro.md`** — architecture reference. Authoritative for AWS, Terraform, CI/CD, caching, and headers (§8–§15).
8. **`../../mockup-*.html`** — rendered reference for every page template. Take **structure** from these; take colour and type from `DESIGN-DELTA.md`. Where they conflict, `DESIGN-DELTA.md` wins — the mockups predate two palette changes.
9. **[`CLAUDE.md`](./CLAUDE.md)** — Claude Code wiring and how to run a build step.
