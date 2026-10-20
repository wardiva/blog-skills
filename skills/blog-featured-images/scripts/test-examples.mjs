#!/usr/bin/env node
// Regression test for the skill, and the way to keep the approved reference images current.
//   node test-examples.mjs              render every examples/*.json with the current rules; report any that fail
//   node test-examples.mjs --refresh    also re-render every approved reference image from references/approved/sources.json
//   node test-examples.mjs --examples-only   skip the refusal suite
// Then it runs test-refusals.mjs (the user's rules as refusal cases, on temp history and record) and fails if either part fails.
// Renders go to a temporary folder, each example with its own empty history, ledger and usage record, so results are the same every
// run and the real site history, the user's record and delivered images are never touched. No --force: every real check runs (heading,
// text, logo, field and background fit), so an example the rules refuse fails here.
// Run it after every change to render.mjs, layouts.mjs, a brand file or an example; a failing example means the change broke a layout.
import { execFile, spawnSync } from 'node:child_process';
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
const emptyRecord = path.join(tmp, 'used-layouts.json');
fs.writeFileSync(emptyRecord, JSON.stringify({ layouts: {} }));

const render = (file) => new Promise((resolve) => {
  // own parent folder too: the renderer reads a ledger from the output's parent folder
  const name = path.basename(file, '.json'), out = path.join(tmp, 'out', name, 'img');
  execFile(process.execPath, [path.join(here, 'render.mjs'), path.join(skill, 'examples', file), '--out', out],
    // Each example gets its own empty history and ledger: the renderer avoids the previous image's background,
    // so a shared one made the result depend on which parallel render finished first. The empty usage record keeps the
    // live site's used layouts (references/used-layouts.json) from refusing the fixtures.
    { env: { ...process.env, FEATURED_HISTORY_DIR: path.join(tmp, 'history', name), FEATURED_USED_FILE: emptyRecord } },
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
// SKILL.md frontmatter: the description is how the skill is found. Over 1024 characters, or an unquoted value holding ": ", it fails
// to load and the skill shows only its title (Oct 20: it grew to 1070 characters and stopped being discoverable).
{
  const md = fs.readFileSync(path.join(skill, 'SKILL.md'), 'utf8'), fm = (md.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
  const line = fm.split(/\r?\n/).find((l) => l.startsWith('description:')) || '', raw = line.slice(12).trim();
  const quoted = /^"[^"]*"$/.test(raw), desc = quoted ? raw.slice(1, -1) : raw;
  const bad = !fm.includes('name: blog-featured-images') ? 'no name' : !desc ? 'no description' : desc.length > 1024 ? `description is ${desc.length} characters (max 1024)` : !quoted && /: /.test(desc) ? 'unquoted description holds ": "' : '';
  if (bad) { console.log(`FAIL  SKILL.md frontmatter: ${bad}`); failed.push({ file: 'SKILL.md' }); } else console.log(`SKILL.md frontmatter ok (description ${desc.length}/1024)`);
}
// the refusal suite: every rule the user decided, each a spec that must be refused (or must render)
const refusals = process.argv.includes('--examples-only') ? 0 : spawnSync(process.execPath, [path.join(here, 'test-refusals.mjs')], { stdio: 'inherit' }).status;
process.exitCode = failed.length || refusals ? 1 : 0;
