# CLAUDE.md

> **Claude-Code-specific configuration.** Everything about the project itself — architecture, design contracts, content model, conventions, gotchas — lives in **[`AGENTS.md`](./AGENTS.md)**. Read that first.
>
> This file covers only what's specific to Claude Code here: what's already wired up, how to run a build step, and how to keep context clean.

---

## What's wired up

| Path | Does |
|---|---|
| `.mcp.json` | Playwright, AWS Knowledge, Context7 — all enabled in `.claude/settings.json` |
| `.claude/hooks/check-draft-filter.sh` | PostToolUse/Edit\|Write. Blocks `getCollection('blog')` outside `src/lib` |
| `.claude/hooks/check-hex-literal.sh` | PostToolUse/Edit\|Write. Blocks a hex literal in `*.astro` or `*.css` outside `tokens.css` |

Both hooks need `jq` on `PATH`. They exit silently on a file that does not exist yet, so they are harmless before `site/` is created.

**There is no npm-install blocker, deliberately.** The reference repo had one — slice 00 owns the lockfile, so no other slice was allowed to install. It was deleted in that project's integration PR, in the same commit as *"Repair lockfile peer entries"*, because it blocked the repair. Its rationale was seven concurrent agents colliding on one `package.json`; this build has one lane. Prefer `npm ci`, but you are trusted with the exception.

**The hex-literal hook is the one worth having here.** The palette is warm and low-contrast between adjacent surfaces, so a stray `#FB923C` in a component is nearly invisible in review and breaks light mode silently. See `AGENTS.md` § Design system for both colour rules.

`.github/`, `scripts/`, `site/`, and `infra/` do not exist yet and belong to specific build steps. Don't pre-empt them.

**Playwright** is the highest-value server here: the site is visual, and screenshots are the only way to verify rendering rather than assume it. It cannot open `file://` — serve the build first (`npx serve dist`) and navigate to localhost.

---

## Running a build step

The build is a ladder, not a backlog. **[`docs/plans/BUILD-PLAN.md`](./docs/plans/BUILD-PLAN.md)** §11 tracks position; §8 is the gate every step closes with.

1. Read `docs/plans/README.md` for the precedence order, then the step in `BUILD-PLAN.md`.
2. Read the matching group brief at `../../grouped/plans/`, and `PLAN.md` there before it.
3. Write **only** within the step's owned paths. Something outside them is a separate commit, not a silent edit.
4. Close the gate. Then commit, merge `--no-ff`, and report what you verified *and what you could not*.

One step per session where you can. The slices are unrelated; carrying slice 03's context into slice 04 costs more than re-reading a brief.

### The rule that matters most

> **Re-derive every file. Do not copy any file.**

`../../portfolio` is a working reference for this exact architecture. Use it to understand how S3 + OAC serves a directory URL, or what shape a `SkillGroup` is. Never `cp` out of it. The palette is different, the content is a different person's, and the prose is written for this project. A file that arrives by copy carries all three wrong.

If a file you're about to write would be byte-identical to the reference, check whether it should be. A Terraform module wrapping a CloudFront function legitimately is. A `profile.ts` is not.

### Before slice 00 is merged

Everything downstream builds against contracts frozen there, so confirm it actually delivered:

- `npm ci && npm run build && npx astro check` all clean from an empty `node_modules`
- Every cross-slice component exists as an implementation or a typed stub with the published signature
- Dark renders by default with `localStorage` cleared
- `npm run no-hex` passes

---

## Verification loop

Claude cannot see the site. Prove rendering rather than asserting it:

1. `npm run build && npx astro check`
2. Serve `dist/` and screenshot the affected routes with Playwright
3. Toggle the theme and screenshot again — **both** themes, every time, and look at the light one properly
4. Emulate `prefers-reduced-motion: reduce` and confirm animation genuinely stops, not that the media query is present in the CSS
5. Widths 375, 900, 1000, 1440
6. Report what you verified *and* what you couldn't

Light mode is where this palette fails, and it fails legibly rather than obviously — peach on off-white looks fine on a bright screen and measures 2.22:1. A dark-only screenshot pass will not catch it.

When something fails a budget, say so with the number. "Homepage JS is 11.2 KB against a 9 KB budget" is actionable; "should be fine" is not.

---

## Context hygiene

This file loads every session — keep it under ~150 lines. Project facts go in `AGENTS.md`; build instructions go in `docs/plans/`.

- `/clear` at step boundaries.
- `/compact Prioritize keeping the design tokens, type contracts, and component signatures` past roughly 50 messages.
- Name files and functions in prompts instead of asking Claude to go exploring.
- Don't paste whole mockup files into context — they're 40–70 KB each. Point at a section or a `../../reference-screenshots/*.png`.
- A `.claudeignore` should exclude `node_modules/`, `dist/`, `.astro/`, `infra/.terraform/`, and `*.tfstate*`.

Skills that map to this repo: `frontend-design` for the UI slices, `code-review` before merging a slice, `security-review` after the infra slice lands IAM and headers, `humanize-writing` for any prose that ships — the journal posts especially.

---

## Secrets

`.env` in this repo root holds a live GitHub token and is gitignored. Never stage it, never print it, and never pass it to a subprocess that logs its arguments. If it reaches a terminal, rotate it rather than reasoning about who saw it.
