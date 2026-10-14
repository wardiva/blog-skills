#!/usr/bin/env node
// Regression test for the skill, and the way to keep the approved reference images current.
//   node test-examples.mjs              render every examples/*.json with the current rules; report any that fail
//   node test-examples.mjs --refresh    also re-render every approved reference image from references/approved/sources.json
// Renders go to a temporary folder, each with its own scratch history (--force), so results are the same every run, so the real site history and delivered images are never touched.
// Run it after every change to render.mjs, layouts.mjs, a brand file or an example; a failing example means the change broke a layout.
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const skill = path.dirname(here);
const examples = fs.readdirSync(path.join(skill, 'examples')).filter((f) => f.endsWith('.json')).sort();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bfi-test-'));
const refresh = process.argv.includes('--refresh');

const render = (file) => new Promise((resolve) => {
  // own parent folder too: the renderer reads a ledger from the output's parent folder
  const name = path.basename(file, '.json'), out = path.join(tmp, 'out', name, 'img');
  execFile(process.execPath, [path.join(here, 'render.mjs'), path.join(skill, 'examples', file), '--out', out, '--force'],
    // Each example gets its own empty history and ledger: the renderer avoids the previous image's background,
    // so a shared one made the result depend on which parallel render finished first.
    { env: { ...process.env, FEATURED_HISTORY_DIR: path.join(tmp, 'history', name) } },
    (err, stdout, stderr) => {
      const ok = /layout=/.test(stdout || '') && fs.existsSync(path.join(out, 'master.png'));
      resolve({ file, out, ok, msg: ok ? (stdout.match(/layout=\S+/) || [''])[0] : String(stderr || stdout || err).trim().split('\n')[0] });
    });
});
const pool = async (items, n, fn) => { const res = []; let k = 0; await Promise.all(Array.from({ length: n }, async () => { while (k < items.length) { const i = k++; res[i] = await fn(items[i]); } })); return res; };

const results = await pool(examples, 6, render);
const failed = results.filter((r) => !r.ok);
for (const r of failed) console.log(`FAIL  ${r.file}: ${r.msg}`);
console.log(`examples: ${results.length - failed.length} / ${results.length} render`);

if (refresh) {
  const sources = JSON.parse(fs.readFileSync(path.join(skill, 'references', 'approved', 'sources.json'), 'utf8'));
  const byFile = Object.fromEntries(results.map((r) => [r.file, r]));
  let n = 0;
  for (const [image, example] of Object.entries(sources)) {
    if (image.startsWith('_')) continue;
    const r = byFile[example];
    if (!r || !r.ok) { console.log(`SKIP  ${image}: its example ${example} did not render`); continue; }
    await sharp(path.join(r.out, 'master.png')).resize(1200, 675).webp({ quality: 88 }).toFile(path.join(skill, 'references', 'approved', `${image}.webp`));
    n++;
  }
  const orphans = fs.readdirSync(path.join(skill, 'references', 'approved')).filter((f) => f.endsWith('.webp') && !sources[f.replace('.webp', '')]);
  console.log(`approved references refreshed: ${n}${orphans.length ? `; with no source in sources.json: ${orphans.join(', ')}` : ''}`);
}
fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
process.exitCode = failed.length ? 1 : 0;
