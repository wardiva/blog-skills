// Batch planner: shows which layouts are free for a category and reserves layouts for a batch, so Makers can render in parallel.
// The user's rule: a layout not used yet is free for any article it suits (first in line); a used layout can't be used again in the
// same category, only in a different one. Usage = site history + the user's record (references/used-layouts.json), see usage.mjs.
// Usage:
//   node plan.mjs --brand <brand> --category <cat>                                # free layouts for this category
//   node plan.mjs --brand <brand> --category <cat> --reserve <slug>=<mode>[/<variant>][@<topic>] ...
// Reservations are written to the site-wide history, so the renderer's check stays correct when renders run in parallel.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { LAYOUTS } from './layouts.mjs';
import { ALL_LAYOUTS as ALL, usage, blocked, freeFor } from './usage.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const brand = (opt('--brand') || 'default').replace(/[^a-z0-9-]/gi, ''), category = opt('--category');
if (!category) { console.error('Usage: node plan.mjs --brand <brand> --category <cat> [--reserve slug=mode/variant@topic ...]'); process.exit(1); }
const file = path.join(process.env.FEATURED_HISTORY_DIR || path.join(os.homedir(), '.blog-featured-images'), `history-${brand}.json`);
const history = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
const ri = args.indexOf('--reserve');
const reqs = ri >= 0 ? args.slice(ri + 1).filter((a) => !a.startsWith('--')) : [];
const batchSlugs = new Set(reqs.map((r) => r.split('=')[0]));
let hist = history.filter((e) => e.final || !batchSlugs.has(e.slug));   // re-planning replaces a slug's old entry; delivered entries always stay
const live = () => hist.filter((e) => !e.superseded);   // superseded = a delivered design the user rejected and had replaced
const errors = [];
for (const r of reqs) {
  if (r.includes('#')) { errors.push(`${r}: the "#reason" suffix is gone; a used layout can't repeat in its category (only --user-pick skips that)`); continue; }
  const [slug, rest] = r.split('='); const [lay, topic] = (rest || '').split('@');
  const [mode, variant = LAYOUTS[mode]?.[0]] = lay.split('/'); const layout = `${mode}/${variant}`;
  if (!ALL.includes(layout)) { errors.push(`${slug}: unknown layout ${layout}`); continue; }
  if (history.some((e) => e.slug === slug && e.final)) { errors.push(`${slug}: already delivered (final); delivered images can't be re-created`); continue; }
  const why = args.includes('--user-pick') ? null : blocked(usage(live()), layout, category);
  if (why) { const f = freeFor(usage(live()), category); errors.push(`${slug}: ${why} Not used yet: ${f.fresh.join(', ') || 'none'}. Used only in other categories: ${f.elsewhere.join(', ') || 'none'}`); continue; }
  if (topic && live().some((e) => e.topic === topic && e.mode === mode)) { errors.push(`${slug}: topic "${topic}" already has mode ${mode}`); continue; }
  hist.push({ slug, brand, category, topic: topic || null, mode, variant, layout, reserved: true, at: new Date().toISOString() });
}
if (errors.length) { console.error('PLAN REFUSED (nothing written):\n  ' + errors.join('\n  ')); process.exit(2); }
if (reqs.length) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(hist, null, 1)); console.log(`Reserved ${reqs.length} layout(s) in ${file}`); }
const u = usage(live()), f = freeFor(u, category);
console.log(`Layouts for "${category}" (give each article the best fit; not-used-yet layouts go first):`);
console.log(`  Not used yet (first in line): ${f.fresh.join(', ') || 'none'}`);
console.log(`  Used only in other categories: ${f.elsewhere.join(', ') || 'none'}`);
console.log(`  Not again in "${category}": ${ALL.filter((l) => blocked(u, l, category)).join(', ') || 'none'}`);
