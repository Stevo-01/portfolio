#!/usr/bin/env node
/**
 * Serves `site/dist` with the exact response headers CloudFront will send.
 *
 *   node scripts/preview-with-headers.mjs [port]
 *
 * ── WHY ───────────────────────────────────────────────────────────────────
 * `astro preview` and `npx serve` send no CSP, so the policy is completely
 * untested until it is live. And a CSP failure is silent in the worst way: the
 * server returns 200, the HTML is correct, and the browser refuses to run the
 * inline theme script, so every visitor who chose light mode gets a dark flash
 * on every navigation. Nothing in the build or the deploy notices.
 *
 * This reproduces the header set from `infra/modules/static-site/headers.tf`
 * and reads the pinned hashes straight out of the Terraform tfvars, so what is
 * served here is what will be served in production. If the hashes are stale,
 * the console fills with violations here rather than after a deploy.
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'site', 'dist');
const TFVARS = join(ROOT, 'infra', 'envs', 'prod', 'terraform.tfvars');
const PORT = Number(process.argv[2] ?? 4400);

// Read the same hashes Terraform will apply, rather than recomputing them.
// Recomputing would test the build against itself and always pass.
const tfvars = readFileSync(TFVARS, 'utf8');
const block = tfvars.match(/csp_script_hashes\s*=\s*\[([\s\S]*?)\]/);
const hashes = block ? [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];

const scriptSrc =
  hashes.length > 0 ? `script-src 'self' ${hashes.map((h) => `'${h}'`).join(' ')}; ` : '';

const CSP = [
  "default-src 'self'; ",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'; ",
  "img-src 'self' data:; ",
  "font-src 'self'; ",
  "connect-src 'self'; ",
  "frame-ancestors 'none'; ",
  "base-uri 'self'; ",
  "form-action 'self'; ",
  "object-src 'none'; ",
  'upgrade-insecure-requests',
].join('');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

/** The CloudFront Function, reimplemented so local URLs resolve identically. */
function rewrite(pathname) {
  if (pathname.endsWith('/')) return `${pathname}index.html`;
  const last = pathname.slice(pathname.lastIndexOf('/') + 1);
  return last.includes('.') ? pathname : `${pathname}/index.html`;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const filePath = join(DIST, rewrite(decodeURIComponent(url.pathname)));
  const ext = extname(filePath);

  const headers = {
    'content-type': TYPES[ext] ?? 'application/octet-stream',
    'content-security-policy': CSP,
    'strict-transport-security': 'max-age=63072000; includeSubDomains',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    // The same split the deploy applies: immutable for hashed assets,
    // must-revalidate for documents.
    'cache-control': filePath.includes('/_astro/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=0, must-revalidate',
  };

  try {
    await stat(filePath);
    res.writeHead(200, headers);
    res.end(await readFile(filePath));
  } catch {
    // Both 403 and 404 map to the 404 page in CloudFront; locally there is only
    // one path to take, but the status must still be 404.
    try {
      res.writeHead(404, { ...headers, 'content-type': TYPES['.html'] });
      res.end(await readFile(join(DIST, '404.html')));
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('404');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Serving site/dist on http://localhost:${PORT} with production headers`);
  console.log(`CSP script-src pins ${hashes.length} hash(es) from terraform.tfvars`);
});
