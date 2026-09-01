#!/usr/bin/env node
/**
 * Measures the gzipped JavaScript and CSS every route ships and fails if any
 * route is over budget.
 *
 *   node scripts/budgets.mjs           # report
 *   node scripts/budgets.mjs --check   # exit 1 on a breach (CI)
 *
 * ── WHY GZIP AND NOT RAW ──────────────────────────────────────────────────
 * Raw bytes are the number that is easy to measure and not the number anyone
 * downloads. CloudFront compresses, so gzip is what crosses the wire and what
 * the budget should be expressed in.
 *
 * Inline scripts count. Astro inlines small module scripts directly into the
 * HTML rather than emitting a file, so a check that only walked `dist/**\/*.js`
 * would report zero JavaScript on a page carrying four islands.
 */

import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const DIST = resolve(import.meta.dirname, '..', 'site', 'dist');

/** Budgets in gzipped bytes, from docs/plans/BUILD-PLAN.md §4.3. */
const BUDGETS = {
  '/': { js: 9216, css: 18432 },
  default: { js: 3072, css: 18432 },
};

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const gz = (buf) => gzipSync(buf, { level: 9 }).length;

const files = await walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));

const rows = [];

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const route = (file.replace(DIST, '').replace(/\/index\.html$/, '') || '/').replace(
    /\.html$/,
    '',
  );

  // Inline module scripts.
  let js = 0;
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    if (/application\/ld\+json/.test(m[0])) continue; // data, not code
    if (m[1].trim()) js += gz(Buffer.from(m[1], 'utf8'));
  }

  // External assets this page actually references. Summing every file in
  // dist/_astro would charge each route for assets it never loads.
  const refs = new Set();
  for (const m of html.matchAll(/(?:src|href)="(\/_astro\/[^"]+)"/g)) refs.add(m[1]);

  let css = 0;
  for (const ref of refs) {
    const p = join(DIST, ref);
    const buf = await readFile(p).catch(() => null);
    if (!buf) continue;
    if (ref.endsWith('.js')) js += gz(buf);
    else if (ref.endsWith('.css')) css += gz(buf);
  }

  const budget = BUDGETS[route] ?? BUDGETS.default;
  rows.push({ route, js, css, budget });
}

rows.sort((a, b) => b.js - a.js);

const breaches = [];
console.log('route'.padEnd(52) + 'JS gz'.padStart(10) + 'CSS gz'.padStart(10));
console.log('-'.repeat(72));

for (const r of rows) {
  const jsOver = r.js > r.budget.js;
  const cssOver = r.css > r.budget.css;
  if (jsOver) breaches.push(`${r.route}: JS ${r.js} B gz over ${r.budget.js} B`);
  if (cssOver) breaches.push(`${r.route}: CSS ${r.css} B gz over ${r.budget.css} B`);
  const mark = jsOver || cssOver ? ' !!' : '';
  console.log(
    r.route.slice(0, 50).padEnd(52) +
      String(r.js).padStart(10) +
      String(r.css).padStart(10) +
      mark,
  );
}

console.log('-'.repeat(72));
console.log(`${rows.length} routes. Budgets: / 9216 B JS, others 3072 B, CSS 18432 B.`);

if (breaches.length > 0) {
  console.error('\nOver budget:');
  // With a number, always. "Homepage JS is 11.2 KB against a 9 KB budget" is
  // actionable; "should be fine" is not.
  for (const b of breaches) console.error(`  ${b}`);
  if (process.argv[2] === '--check') process.exit(1);
} else {
  console.log('All routes within budget.');
}
