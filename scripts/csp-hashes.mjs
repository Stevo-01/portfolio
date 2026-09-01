#!/usr/bin/env node
/**
 * Computes the SHA-256 of every inline script in the built output and either
 * prints them, writes them into the Terraform tfvars, or fails if the tfvars
 * have drifted from the build.
 *
 *   node scripts/csp-hashes.mjs           # print
 *   node scripts/csp-hashes.mjs --write   # update infra/envs/prod/terraform.tfvars
 *   node scripts/csp-hashes.mjs --check   # exit 1 if the tfvars are stale (CI)
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────
 * The theme-init script is inline in every page's <head> and must run before
 * the first paint, so it cannot be moved to a file with an integrity attribute.
 * A CSP with `script-src 'self'` blocks it. The only way to allow it is to pin
 * its hash.
 *
 * The failure mode is why this is automated rather than a one-off manual step:
 * a stale hash blocks the script in the browser with NOTHING failing
 * server-side. The build succeeds, the deploy succeeds, and every visitor who
 * chose light gets a dark flash on every navigation. `--check` in CI turns that
 * silent breakage into a failed PR.
 *
 * Hashes are computed over the exact bytes between the script tags, because
 * that is what the browser hashes. A single added space invalidates the pin.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'site', 'dist');
const TFVARS = join(ROOT, 'infra', 'envs', 'prod', 'terraform.tfvars');

/** Every inline <script> body in a document, in source order. */
function inlineScripts(html) {
  const out = [];
  // Only tags with no src. An external script is covered by 'self', not a hash.
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const body = m[1];
    // A JSON-LD block is data, not script: CSP does not execute it and does not
    // need it hashed. Including it would bloat the policy for nothing.
    if (/type=["']application\/ld\+json["']/.test(m[0])) continue;
    if (body.trim()) out.push(body);
  }
  return out;
}

async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(p)));
    else if (entry.name.endsWith('.html')) found.push(p);
  }
  return found;
}

const files = await htmlFiles(DIST);
const hashes = new Set();

for (const file of files) {
  for (const body of inlineScripts(readFileSync(file, 'utf8'))) {
    hashes.add(`sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}`);
  }
}

const sorted = [...hashes].sort();
const mode = process.argv[2];

if (mode === '--write') {
  const tf = readFileSync(TFVARS, 'utf8');
  const block = `csp_script_hashes = [\n${sorted.map((h) => `  "${h}",`).join('\n')}\n]`;
  const next = tf.replace(/csp_script_hashes\s*=\s*\[[^\]]*\]/, block);
  writeFileSync(TFVARS, next);
  console.log(`Wrote ${sorted.length} hash(es) to infra/envs/prod/terraform.tfvars`);
} else if (mode === '--check') {
  const tf = readFileSync(TFVARS, 'utf8');
  const missing = sorted.filter((h) => !tf.includes(h));
  if (missing.length > 0) {
    console.error('CSP hashes in terraform.tfvars are stale. Missing:');
    for (const h of missing) console.error(`  ${h}`);
    console.error('\nRun: node scripts/csp-hashes.mjs --write');
    process.exit(1);
  }
  console.log(`CSP hashes current (${sorted.length}).`);
} else {
  console.log(`${files.length} HTML files, ${sorted.length} distinct inline script(s):\n`);
  for (const h of sorted) console.log(`  ${h}`);
}
