#!/usr/bin/env node
// Planning aid: which logo-dependent layouts each brand can use, using the renderer's own checks (render.mjs --check-only).
//   node logo-check.mjs <domain> [<domain> ...]
//   pills    = has a logo that sits on a white circle (not only a solid app tile)
//   connect  = has a solid app icon with its own background colour (needs a Brandfetch client ID)
//   logotype = has a black logo lockup with a separate icon (single-product articles)
// An X vs Y pair can use pills or connect only when BOTH brands pass. Check every icon by eye too: a stale badge still passes.
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const domains = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!domains.length) { console.error('Usage: node logo-check.mjs <domain> [<domain> ...]'); process.exit(1); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bfi-logo-check-'));
const run = (spec, name) => new Promise((resolve) => {
  const f = path.join(tmp, `${name}.json`);
  fs.writeFileSync(f, JSON.stringify({ brand: 'default', category: 'logo-check', slug: name, ...spec }));
  execFile(process.execPath, [path.join(here, 'render.mjs'), f, '--out', path.join(tmp, name), '--check-only'],
    { env: { ...process.env, FEATURED_HISTORY_DIR: tmp } }, (err, out) => resolve(/CHECKS PASSED/.test(out || '')));
});
// a few domains at a time, so the logo services aren't flooded
const pool = async (items, n, fn) => { const out = []; let k = 0; await Promise.all(Array.from({ length: n }, async () => { while (k < items.length) { const j = k++; out[j] = await fn(items[j], j); } })); return out; };
const rows = await pool(domains, 3, async (d, i) => {
  const name = d.split('.')[0], side = { label: name, logo: d };
  const [pills, connect, logotype] = await Promise.all([
    run({ articleTitle: `${name} vs ${name}`, mode: 'versus', variant: 'pills', left: side, right: side }, `p${i}`),
    run({ articleTitle: `${name} vs ${name}`, mode: 'versus', variant: 'connect', left: side, right: side }, `c${i}`),
    run({ articleTitle: `${name} review`, mode: 'logotype', product: name, logotype: d }, `l${i}`),
  ]);
  return { d, pills, connect, logotype };
});
fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
const yn = (b) => (b ? 'yes' : ' - ');
console.log('domain'.padEnd(28) + 'pills  connect  logotype');
for (const r of rows) console.log(r.d.padEnd(28) + yn(r.pills).padEnd(7) + yn(r.connect).padEnd(9) + yn(r.logotype));
