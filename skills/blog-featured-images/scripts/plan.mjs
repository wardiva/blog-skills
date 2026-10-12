// Batch planner: shows layout usage for a category and reserves layouts for a batch, so Makers can render in parallel.
// Usage:
//   node plan.mjs --brand <brand> --category <cat>                                # usage table + least-used order
//   node plan.mjs --brand <brand> --category <cat> --reserve <slug>=<mode>[/<variant>][@<topic>] ...
// Reservations are written to the site-wide history, so the renderer's least-used check stays correct when renders run in parallel.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LAYOUTS = { 'before-after': ['default'], versus: ['overlap', 'table'], prompt: ['default'], hub: ['default'], stack: ['default'], window: ['default'], timeline: ['default'], checklist: ['default'], stat: ['default'], ranked: ['default'] };
const ALL = Object.keys(LAYOUTS).flatMap((m) => LAYOUTS[m].map((v) => `${m}/${v}`));
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const brand = (opt('--brand') || 'default').replace(/[^a-z0-9-]/gi, ''), category = opt('--category');
if (!category) { console.error('Usage: node plan.mjs --brand <brand> --category <cat> [--reserve slug=mode/variant@topic ...]'); process.exit(1); }
const file = path.join(process.env.FEATURED_HISTORY_DIR || path.join(os.homedir(), '.blog-featured-images'), `history-${brand}.json`);
const history = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
const layoutOf = (e) => e.layout || `${e.mode}/${(LAYOUTS[e.mode] || ['default'])[0]}`;
const ri = args.indexOf('--reserve');
const reqs = ri >= 0 ? args.slice(ri + 1).filter((a) => !a.startsWith('--')) : [];
const batchSlugs = new Set(reqs.map((r) => r.split('=')[0]));
let hist = history.filter((e) => !batchSlugs.has(e.slug));   // re-planning a slug replaces its old entry
const usage = () => Object.fromEntries(ALL.map((l) => [l, hist.filter((e) => e.category === category && layoutOf(e) === l).length]));
const errors = [];
for (const r of reqs) {
  const [slug, rest] = r.split('='); const [lay, topic] = (rest || '').split('@');
  const [mode, variant = LAYOUTS[mode]?.[0]] = lay.split('/'); const layout = `${mode}/${variant}`;
  if (!ALL.includes(layout)) { errors.push(`${slug}: unknown layout ${layout}`); continue; }
  const u = usage(), min = Math.min(...Object.values(u));
  if (u[layout] > min) { errors.push(`${slug}: ${layout} used ${u[layout]}x, least-used are: ${ALL.filter((l) => u[l] === min).join(', ')}`); continue; }
  if (topic && hist.some((e) => e.topic === topic && e.mode === mode)) { errors.push(`${slug}: topic "${topic}" already has mode ${mode}`); continue; }
  hist.push({ slug, brand, category, topic: topic || null, mode, variant, layout, reserved: true, at: new Date().toISOString() });
}
if (errors.length) { console.error('PLAN REFUSED (nothing written):\n  ' + errors.join('\n  ')); process.exit(2); }
if (reqs.length) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(hist, null, 1)); console.log(`Reserved ${reqs.length} layout(s) in ${file}`); }
const u = usage(); const order = [...ALL].sort((a, b) => u[a] - u[b]);
console.log(`Layout usage in "${category}" (least-used first; assign in this order, best fit within the lowest tier):`);
for (const l of order) console.log(`  ${String(u[l]).padStart(2)}  ${l}`);
