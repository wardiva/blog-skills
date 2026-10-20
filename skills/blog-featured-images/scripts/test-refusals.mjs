#!/usr/bin/env node
// Refusal test suite: the user's decisions, encoded as rules render.mjs and plan.mjs must enforce.
//   node test-refusals.mjs            run every case; prints a pass/fail table, exits 1 on any failure
//   node test-refusals.mjs <filter>   only the cases whose name contains <filter>
// Each case is a small spec built from an existing examples/*.json with one change, and the refusal it must get (or OK = it renders).
// Every case runs on its own temporary site history (FEATURED_HISTORY_DIR), usage record (FEATURED_USED_FILE) and output folder, so the
// real history, the user's record (references/used-layouts.json) and delivered images are never read or touched. Scenarios run their
// steps in order on one shared temp history (plan.mjs reservations, re-renders, other slugs).
// Run it after every change to render.mjs, plan.mjs, usage.mjs or layouts.mjs (test-examples.mjs runs it after the examples).
// The groups (numbered below as in the code):
//   1. Retired layouts      every RETIRED layout, refused by render.mjs and by plan.mjs
//   2. Fields, backgrounds  deleted fields, "field" where a layout has none, picks (bgPick) and where they're refused, unknown, vibrant
//                           and unfit backgrounds, a bg on a layout that paints its own canvas
//   3. Content              the facts a layout is built on, and every minimum in render.mjs "thin" (one row per layout, from a table)
//   4. Heading and text     the heading reuses the blog title's words (and needs "articleTitle"), 2+ shared and 75% of its words;
//                           the 15-word budget and the 7-word element limit, each on its own
//   5. Usage                a layout once per category, every site-wide cap (and the record's own images toward it), the user's
//                           pick (for its own layout only; --user-pick in render and plan), the record per brand and its "asOf",
//                           superseded images
//   6. Neighbours           vibrant and series mark at most 1 in 3 in a category (a neighbour or two back); a reservation is none
//   7. Locks and plan.mjs   the spec's category, delivered images (by slug and output folder; render, plan, --release), same-topic
//                           (superseded ones aside), "#reason", unknown layouts and variants
//   8. Logos (offline)      local logo files only: a missing file, and the pills/connect/tiles/glass/logotype/slash checks
// Every case runs offline up to its refusal (no logo is fetched before it); an OK case renders with headless Chrome.
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { RETIRED } from './layouts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const skill = path.dirname(here);
const assets = path.join(skill, 'assets');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bfi-refusals-'));
const filter = process.argv.slice(2).find((a) => !a.startsWith('--'));
const BRAND = 'medsoftwarehub';

// ---- building blocks ----
const example = (f) => JSON.parse(fs.readFileSync(path.join(skill, 'examples', f), 'utf8'));
// the spec is written to a temp folder, so "../assets/x.png" logos are pointed at the skill's assets folder
const fixLogos = (v) => typeof v === 'string' ? (v.startsWith('../assets/') ? path.join(assets, v.slice(10)) : v)
  : Array.isArray(v) ? v.map(fixLogos) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fixLogos(x)])) : v;
const spec = (base, change = () => {}) => { const s = fixLogos(example(base)); change(s); return s; };
const record = (layouts = {}, extra = {}) => ({ brand: BRAND, recordedAt: '2026-01-01T00:00:00.000Z', layouts, ...extra });
const used = (cats) => ({ status: 'used', cats });

const BADGES = 'theranest-vs-valant.versus-badges.json';   // specialty-software, no logos: fast to refuse
const FOCUS = 'emr-cost.focus.json';                         // clinical-software, topic "emr-cost", bg sky
const SP = '../assets/simplepractice-app-icon.png', FAC = '../assets/findacode-mark.png';   // a solid app tile; a transparent mark
// a past image in a case's temp site history (default: rendered, calm, clinical-software)
const past = (slug, layout, category = 'clinical-software', extra = {}) => {
  const [mode, variant = 'default'] = layout.split('/');
  return { slug, brand: BRAND, category, topic: null, mode, variant, layout, bg: 'sky', series: false, vibrant: false, out: path.join(tmp, 'nowhere', slug), at: '2026-10-01T00:00:00.000Z', ...extra };
};
// local logo fixtures the assets folder doesn't have: an ultra-wide wordmark (18:1), a black square with no separate icon, and a black
// lockup (an icon, a clear gap, a wordmark) that passes the logotype check offline
const WIDE = path.join(tmp, 'wide-wordmark.png'), BLOCK = path.join(tmp, 'black-block.png'), LOCKUP = path.join(tmp, 'black-lockup.png');
await sharp({ create: { width: 1900, height: 200, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: { create: { width: 1800, height: 100, channels: 4, background: { r: 20, g: 26, b: 38, alpha: 1 } } }, left: 50, top: 50 }]).png().toFile(WIDE);
await sharp({ create: { width: 400, height: 400, channels: 4, background: { r: 10, g: 10, b: 10, alpha: 1 } } }).png().toFile(BLOCK);
const ink = (width, height) => ({ create: { width, height, channels: 4, background: { r: 10, g: 10, b: 10, alpha: 1 } } });
await sharp({ create: { width: 1000, height: 200, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: ink(160, 160), left: 20, top: 20 }, { input: ink(740, 80), left: 240, top: 60 }]).png().toFile(LOCKUP);
const run = (args, env) => new Promise((resolve) => execFile(process.execPath, args, { env: { ...process.env, ...env }, timeout: 180000 },
  (err, stdout, stderr) => resolve({ code: err ? (typeof err.code === 'number' ? err.code : 1) : 0, out: String(stdout || ''), err: String(stderr || '') })));

// one render or plan step in a case's sandbox
async function step(box, st) {
  const env = { FEATURED_HISTORY_DIR: box.hist, FEATURED_USED_FILE: box.rec };
  if (st.plan) return run([path.join(here, 'plan.mjs'), '--brand', st.brand || BRAND, ...st.plan], env);
  const s = { ...st.spec, ...(st.slug ? { slug: st.slug } : {}) };
  const file = path.join(box.dir, `spec-${box.n++}.json`);
  fs.writeFileSync(file, JSON.stringify(s, null, 1));
  const out = st.out || path.join(box.dir, 'batch', s.slug);   // one batch folder per case: its ledger is shared by the case's steps
  const r = await run([path.join(here, 'render.mjs'), file, '--out', out, ...(st.args || [])], env);
  r.rendered = fs.existsSync(path.join(out, 'master.png'));
  if (r.rendered) fs.rmSync(path.join(out, 'master.png'));   // a re-render in the same case must make its own
  return r;
}
// what a step got: OK, or the refusal's first line
const got = (r, st) => {
  if (r.code === 0 && (st.plan || r.rendered)) return 'OK';
  const line = (r.err + '\n' + r.out).split('\n').map((l) => l.trim()).find((l) => /[A-Z]{3,}( [A-Z]+)* (FAILED|LAYOUT|LOCKED|REFUSED|MISSING)/.test(l)) || (r.err || r.out).trim().split('\n')[0] || `exit ${r.code}`;
  return line.replace(/^USED-LAYOUTS WARNING.*$/, '').slice(0, 110);
};
const passed = (r, st) => st.expect === 'OK' ? r.code === 0 && (st.plan || r.rendered)
  : r.code !== 0 && !r.rendered && (r.err + r.out).includes(st.expect) && (!st.count || (r.err + r.out).split(st.expect).length - 1 === st.count);

// ---- the cases: { name, steps: [{ spec | plan, expect, slug?, args?, out?, count? }], record?, history? } ----
const C = [];
const one = (name, s, expect, { args, ...opts } = {}) => C.push({ name, steps: [{ spec: s, expect, ...(args ? { args } : {}) }], ...opts });

// 1. every retired layout is refused first, by render.mjs and by plan.mjs
for (const r of RETIRED) {
  const [mode, variant] = r.split('/');
  one(`retired ${r}`, spec(BADGES, (s) => { s.mode = mode; if (variant) s.variant = variant; else delete s.variant; }), 'RETIRED LAYOUT');
}
C.push({ name: `plan refuses all ${RETIRED.length} retired layouts`, steps: [{ plan: ['--category', 'clinical-software', '--reserve', ...RETIRED.map((r, i) => `retired-${i}=${r}`)], expect: 'RETIRED LAYOUT', count: RETIRED.length }] });

// 2. fields and backgrounds the user deleted or never approved
one('checklist on a light bg', spec('erp-checklist.blue.json', (s) => { s.bg = 'sky'; }), 'CHECKLIST FIELD FAILED');
one('versus/type on the black field', spec('01-type-light.gumloop-type-light.json', (s) => { s.field = 'black'; }), 'FIELD FIT FAILED');
one('versus/tiles on the black field', spec('04-tiles-blue.gumloop-tiles-blue.json', (s) => { s.field = 'black'; }), 'FIELD FIT FAILED');
one('swap on the black field', spec('10-swap-light.gumloop-swap-light.json', (s) => { s.field = 'black'; }), 'FIELD FIT FAILED');
one('ranges bare, white not picked', spec('small-practice-emr.ranges.json', (s) => { delete s.bgPick; }), 'BACKGROUND CHECK FAILED');
one('ranges bare, picked sky', spec('small-practice-emr.ranges.json', (s) => { s.bg = 'sky'; }), 'BACKGROUND PICK FAILED');
one('picked blue on versus/badges', spec(BADGES, (s) => { s.bg = 'blue'; }), 'BACKGROUND PICK FAILED');
one('picked bg on frostrow', spec('telehealth-for-therapists.frostrow.json', (s) => { s.bg = 'glow'; s.bgPick = true; }), 'BACKGROUND PICK FAILED');
one('bg on glassbar (canvas)', spec('ehr-interoperability-cost.glassbar.json', (s) => { s.bg = 'sky'; }), 'BACKGROUND CHECK FAILED');
one('bg on versus/duo (canvas)', spec('sectra-vs-intelerad.versus-duo.json', (s) => { s.bg = 'paper'; }), 'BACKGROUND CHECK FAILED');
one('picked blue on versus/fan (BLUE_PICK)', spec('tebra-vs-zocdoc.versus-fan.json', (s) => { s.bg = 'blue'; s.bgPick = true; }), 'OK');
one('field on a layout with no field (focus)', spec(FOCUS, (s) => { s.field = 'light'; }), 'FIELD FIT FAILED: focus/default has no "field" option');
one('prompt with a field other than soft', spec('clearinghouse-cost.prompt.json', (s) => { s.field = 'light'; }), 'FIELD FIT FAILED: prompt takes only "field": "soft"');
one('bgPick without a bg', spec(FOCUS, (s) => { delete s.bg; s.bgPick = true; }), 'BACKGROUND PICK FAILED: "bgPick": true marks the user\'s own pick');
one('bgPick not true', spec(FOCUS, (s) => { s.bgPick = 'yes'; }), 'BACKGROUND PICK FAILED: "bgPick": true marks the user\'s own pick');
one('picked sky on a canvas layout (dark)', spec('sage-intacct-review.dark.json', (s) => { s.bg = 'sky'; s.bgPick = true; }), 'BACKGROUND PICK FAILED: dark/default paints its own full canvas');
one('picked light field on the checklist', spec('erp-checklist.blue.json', (s) => { s.bg = 'sky'; s.bgPick = true; }), 'BACKGROUND PICK FAILED: the checklist goes on the vibrant "blue" only');
one('bg on frostrow (canvas)', spec('telehealth-for-therapists.frostrow.json', (s) => { s.bg = 'sky'; }), 'BACKGROUND CHECK FAILED: frostrow/default paints its own canvas');
one('unknown bg name', spec(FOCUS, (s) => { s.bg = 'teal'; }), 'BACKGROUND CHECK FAILED: "teal" is not a background');
one('blue on stat, not picked', spec('rcm-outsourcing.stat.json', (s) => { s.bg = 'blue'; }), 'VIBRANT FIT FAILED');
one('cream on ranked', spec('erp-implementation.ranked.json', (s) => { s.bg = 'cream'; }), 'BACKGROUND FIT FAILED: "cream" doesn\'t flatter the ranked');

// 3. content each layout is built on
one('versus/scores with a word score', spec('oracle-health-vs-meditech.versus-scores.json', (s) => { s.left.score = 'High'; }), 'CONTENT CHECK FAILED');
one('dark without panelLogo', spec('sage-intacct-review.dark.json', (s) => { delete s.panelLogo; delete s.panelLogoUrl; }), 'CONTENT CHECK FAILED');
one('glassbar without a value', spec('ehr-interoperability-cost.glassbar.json', (s) => { delete s.value; }), 'CONTENT CHECK FAILED');
one('versus/fan without a right value', spec('tebra-vs-zocdoc.versus-fan.json', (s) => { delete s.right.value; }), 'CONTENT CHECK FAILED');
one('versus/stacked without a left value', spec('symplr-vs-modio-health.versus-stacked.json', (s) => { delete s.left.value; }), 'CONTENT CHECK FAILED');
// every minimum in render.mjs "thin": each layout's example with its required content removed or cut short
const THIN = [
  ['window', 'dynamics-vs-acumatica.window.json', (s) => { s.list.rows = s.list.rows.slice(0, 1); }, 'window needs 2+ list rows'],
  ['hub', '7-best-erp-software-for-small-businesses-in-2026.json', (s) => { s.cards = s.cards.slice(0, 5); }, 'hub needs 6–7 products'],
  ['ranked', 'emr-monthly-price-ranked.ranked.json', (s) => { s.rows = s.rows.slice(0, 2); }, 'ranked needs 3+ rows'],
  ['checklist', 'erp-checklist.blue.json', (s) => { s.items = s.items.slice(0, 2); }, 'checklist needs 3+ items'],
  ['timeline', 'switch-emr-vendors.timeline-final.json', (s) => { s.steps = s.steps.slice(0, 2); s.highlight = 1; }, 'timeline needs 3+ steps'],
  ['stat', 'rcm-outsourcing.stat.json', (s) => { s.card.rows = s.card.rows.slice(0, 1); }, 'stat card needs 2+ rows'],
  ['focus', FOCUS, (s) => { s.rows = s.rows.slice(0, 1); s.highlight = 0; }, 'focus needs 2+ rows'],
  ['shortlist', 'e-prescribing.shortlist.json', (s) => { s.items = s.items.slice(0, 2); }, 'shortlist needs 3+ items'],
  ['picks', 'hospital-information-systems.picks.json', (s) => { s.items = s.items.slice(0, 2); }, 'picks needs 3-7 items'],
  ['spotlight', 'appointment-reminder.spotlight.json', (s) => { s.items = s.items.slice(0, 2); }, 'spotlight needs 3-6 items'],
  ['count', 'dermatology-pm.count.json', (s) => { s.items = s.items.slice(0, 2); }, 'count needs 3-6 items'],
  ['frostrow', 'telehealth-for-therapists.frostrow.json', (s) => { s.items = s.items.slice(0, 2); }, 'frostrow needs 3-6 products with logos'],
  ['figures', 'e-prescribing-cost.figures.json', (s) => { s.rows = s.rows.slice(0, 1); }, 'figures needs 2 rows, each with a label and a value'],
  ['costgrid', 'medical-billing-cost.costgrid.json', (s) => { s.cells = s.cells.slice(0, 2); }, 'costgrid needs 3 cells'],
  ['cloud', 'claims-management.cloud.json', (s) => { s.items = s.items.slice(0, 2); }, 'cloud needs 3-8 products with logos'],
  ['ranges rows', 'small-practice-emr.ranges.json', (s) => { s.rows = s.rows.slice(0, 2); }, 'ranges needs 3-6 rows'],
  ['ranges max', 'small-practice-emr.ranges.json', (s) => { delete s.max; }, 'ranges needs "max"'],
  ['lineup', 'urgent-care-emrs.lineup.json', (s) => { s.cards = s.cards.slice(0, 2); }, 'lineup needs 3-7 products with logos'],
  ['versus/badges', BADGES, (s) => { delete s.right.value; }, 'versus/badges needs a "value" on both sides'],
  ['versus/checks', 'aapc-codify-vs-find-a-code.versus-checks.json', (s) => { delete s.title; }, 'versus/checks needs "title"'],
  ['versus/center', 'modmed-vs-eclinicalworks.versus-center.json', (s) => { delete s.label; }, 'versus/center needs "label"'],
  ['versus/lanes max', 'office-ally-vs-claim-md.versus-lanes.json', (s) => { delete s.max; }, 'versus/lanes needs "max" and "points" on both sides'],
  ['versus/lanes points', 'office-ally-vs-claim-md.versus-lanes.json', (s) => { delete s.right.points; }, 'versus/lanes needs "max" and "points" on both sides'],
];
for (const [name, base, cut, msg] of THIN) one(`thin ${name}`, spec(base, cut), `CONTENT CHECK FAILED: ${msg}`);
one('thin versus/scores without a title', spec('oracle-health-vs-meditech.versus-scores.json', (s) => { delete s.title; }), 'CONTENT CHECK FAILED: versus/scores needs "title"');
one('dark spec for a "vs" title', spec('sage-intacct-review.dark.json', (s) => { s.articleTitle = 'Sage Intacct vs NetSuite Review for Small Businesses (2026)'; }), 'FAIRNESS CHECK FAILED');

// 4. the heading reuses the blog title's words; text stays labels
one('focus heading not in the title', spec('emr-cost.focus.json', (s) => { s.headline = 'Hidden {{vendor fees}}'; }), 'HEADING CHECK FAILED');
one('ranked heading not in the title', spec('erp-implementation.ranked.json', (s) => { s.headline = 'Rollout Speed Leaders'; }), 'HEADING CHECK FAILED');
one('glassbar heading not in the title', spec('ehr-interoperability-cost.glassbar.json', (s) => { s.headline = 'Hospital Integration Budget'; }), 'HEADING CHECK FAILED');
one('figures heading not in the title', spec('e-prescribing-cost.figures.json', (s) => { s.headline = 'Prescription Tool Prices'; }), 'HEADING CHECK FAILED');
one('costgrid heading not in the title', spec('medical-billing-cost.costgrid.json', (s) => { s.headline = 'Claims Platform Pricing'; }), 'HEADING CHECK FAILED');
one('frostrow heading not in the title', spec('telehealth-for-therapists.frostrow.json', (s) => { s.headline = 'Top Video Visit Apps'; }), 'HEADING CHECK FAILED');
one('heading without articleTitle', spec(FOCUS, (s) => { delete s.articleTitle; }), 'HEADING CHECK FAILED: add "articleTitle"');
// the threshold (every heading but stat's): 2+ shared words and at least 75% of the heading's words. FOCUS's title words are emr,
// software, cost, pricing, practice, size
one('heading 2 shared words, under 75%', spec(FOCUS, (s) => { s.headline = 'EMR cost for rural {{clinic teams}}'; }), 'HEADING CHECK FAILED');   // 2 of 5
one('heading with one shared word', spec(FOCUS, (s) => { s.headline = '{{Pricing}}'; }), 'HEADING CHECK FAILED');                          // 1 of 1
one('heading at exactly 75%', spec(FOCUS, (s) => { s.headline = 'EMR cost by practice {{tier}}'; }), 'OK');                               // 3 of 4
// the two text rules, each on its own: over 15 words with no element over 7 ("(max 15)." = no sentence-like element), and one
// element over 7 words with 15 in all
one('more than 15 words, no long element', spec('e-prescribing-cost.figures.json', (s) => { s.sub = 'per provider per month for small practices'; s.rows[0].label = 'Standalone e-prescribing tool'; s.rows[1].label = 'Bundled with your EMR'; }), 'words on the image (max 15).');
one('one element over 7 words, 15 in all', spec('e-prescribing-cost.figures.json', (s) => { s.sub = 'per provider per month for small independent practices'; }), 'sentence-like text (max 7 words per element)');

// 5. usage: a used layout once per category (the user's record + the site history)
one('used layout in its category', spec(BADGES), 'VARIETY CHECK FAILED', { record: record({ 'versus/badges': used(['specialty-software']) }) });
one('same layout in another category', spec(BADGES, (s) => { s.category = 'medical-billing'; }), 'OK', { record: record({ 'versus/badges': used(['specialty-software']) }) });
// the user's pick ("slug=layout!" in plan.mjs) skips the category rule for that slug only, re-renders included
C.push({ name: 'user pick: plan, render, re-render; another slug refused', record: record({ 'versus/badges': used(['specialty-software']) }), steps: [
  { plan: ['--category', 'specialty-software', '--reserve', 'pick-a=versus/badges!'], expect: 'OK' },
  { spec: spec(BADGES), slug: 'pick-a', expect: 'OK' },
  { spec: spec(BADGES), slug: 'pick-a', expect: 'OK' },
  { spec: spec(BADGES), slug: 'pick-b', expect: 'VARIETY CHECK FAILED' },
] });
// a slug re-planned without "!" doesn't inherit its old render's userPick (the folder ledger still holds that render)
C.push({ name: 're-planned slug does not inherit userPick', steps: [
  { plan: ['--category', 'specialty-software', '--reserve', 'pick-c=versus/badges!'], expect: 'OK' },
  { spec: spec(BADGES), slug: 'pick-c', expect: 'OK' },
  { plan: ['--category', 'specialty-software', '--reserve', 'pick-c=versus/badges'], expect: 'OK' },   // free: only pick-c used it
  { plan: ['--category', 'specialty-software', '--reserve', 'pick-d=versus/badges!'], expect: 'OK' },
  { spec: spec(BADGES), slug: 'pick-d', expect: 'OK' },
  { spec: spec(BADGES), slug: 'pick-c', expect: 'VARIETY CHECK FAILED' },   // pick-d now uses it here, and pick-c is no pick
] });
// a layout's own "asOf" moves its cutoff: versus/scores, delivered on Oracle vs MEDITECH, then marked not used by the user
const ORACLE = { slug: 'oracle-health-vs-meditech-which-hospital-ehr-fits-in-2026', brand: BRAND, category: 'hospital-and-lab-software', mode: 'versus', variant: 'scores', layout: 'versus/scores', final: true, at: '2026-10-19T18:08:00.000Z', out: path.join(tmp, 'nowhere') };
const SCORES = spec('oracle-health-vs-meditech.versus-scores.json', (s) => { s.slug = 'scores-again'; });
one('per-layout asOf (scores marked unused)', SCORES, 'OK', { history: [ORACLE], record: record({ 'versus/scores': { status: 'unused', cats: [], asOf: '2026-10-19T19:23:25.151Z' } }, { recordedAt: '2026-10-14T19:46:04.294Z' }) });
one('no asOf: the delivered scores counts', SCORES, 'VARIETY CHECK FAILED', { history: [ORACLE], record: record({ 'versus/scores': { status: 'unused', cats: [] } }, { recordedAt: '2026-10-14T19:46:04.294Z' }) });
// the record belongs to one brand: medsoftwarehub's "used" doesn't block another brand's render
one('record of another brand does not apply', spec(BADGES, (s) => { s.brand = 'default'; }), 'OK', { record: record({ 'versus/badges': used(['specialty-software']) }) });
// the site-wide cap (REPEATABLE: versus/pills 2): two pills in other categories refuse a third anywhere; the user's pick skips the cap
const PILLS = spec('dynamics-vs-acumatica.versus-pills.json', (s) => { delete s.left.logo; delete s.right.logo; });   // no logos: no logo fetch
C.push({ name: 'pills cap: render, plan; a user pick skips it', history: [past('pills-1', 'versus/pills', 'medical-billing'), past('pills-2', 'versus/pills', 'specialty-software', { at: '2026-10-02T00:00:00.000Z' })], steps: [
  { spec: PILLS, expect: 'has reached its site-wide limit of 2' },
  { plan: ['--category', 'clinical-software', '--reserve', 'pills-3=versus/pills'], expect: 'has reached its site-wide limit of 2' },
  { plan: ['--category', 'clinical-software', '--reserve', 'pills-4=versus/pills!'], expect: 'OK' },
] });
// the record's own images count toward the cap: pills used in one recorded category, where the history holds 2 images from before the
// record's cutoff, counts as 2, so a third (in another category) is refused
one('record with 2 pre-cutoff images reaches the pills cap', PILLS, 'has reached its site-wide limit of 2', { record: record({ 'versus/pills': used(['medical-billing']) }),
  history: [past('pills-old-1', 'versus/pills', 'medical-billing', { at: '2025-12-01T00:00:00.000Z' }), past('pills-old-2', 'versus/pills', 'medical-billing', { at: '2025-12-02T00:00:00.000Z' })] });
// every other site-wide cap (REPEATABLE): the cap's count of images in other categories refuses one more, render and plan
const CAPS = [
  ['dark/default', 3, spec('sage-intacct-review.dark.json')],
  ['logotype/default', 2, spec('notion-review.logotype.json', (s) => { s.logotype = LOCKUP; })],   // a local black lockup: no logo fetch
  ['versus/slash', 5, spec('advancedmd-vs-curemd.versus-slash.json')],
  ['versus/connect', 5, spec('netsuite-vs-sage-intacct.versus-connect.json', (s) => { s.left.logo = fixLogos(SP); s.right.logo = fixLogos(SP); })],   // local app icons: no logo fetch
  ['versus/duo', 5, spec('sectra-vs-intelerad.versus-duo.json')],
];
for (const [layout, cap, s] of CAPS) C.push({ name: `${layout} cap ${cap}`, history: Array.from({ length: cap }, (_, i) => past(`cap-${i}`, layout, `other-${i}`, { at: `2026-10-0${i + 1}T00:00:00.000Z` })), steps: [
  { spec: s, expect: `has reached its site-wide limit of ${cap}` },
  { plan: ['--category', s.category, '--reserve', `cap-next=${layout}`], expect: `has reached its site-wide limit of ${cap}` },
] });
// a user pick is for its own layout only: a slug reserved as a pick for versus/checks can't render versus/badges where it is used
C.push({ name: 'user pick is for its own layout only', record: record({ 'versus/badges': used(['specialty-software']) }), steps: [
  { plan: ['--category', 'specialty-software', '--reserve', 'pick-x=versus/checks!'], expect: 'OK' },
  { spec: spec(BADGES), slug: 'pick-x', expect: 'VARIETY CHECK FAILED' },
] });
one('render --user-pick skips the category rule', spec(BADGES), 'OK', { record: record({ 'versus/badges': used(['specialty-software']) }), args: ['--user-pick'] });
C.push({ name: 'plan --user-pick skips the category rule', record: record({ 'versus/badges': used(['specialty-software']) }), steps: [{ plan: ['--category', 'specialty-software', '--reserve', 'pick-y=versus/badges', '--user-pick'], expect: 'OK' }] });
// a superseded image (rejected and replaced) is no longer on the site: its layout is free in its category again
one('superseded image does not count', spec(BADGES), 'OK', { history: [past('old-badges', 'versus/badges', 'specialty-software', { superseded: true })] });

// 6. neighbours: vibrant (blue or a black layout) and the series mark, at most 1 in 3 per category, never on neighbours
one('vibrant after a vibrant neighbour', spec('ehr-interoperability-cost.glassbar.json'), 'VIBRANT CHECK FAILED', { history: [past('blue-before', 'checklist/default', 'clinical-software', { bg: 'blue', vibrant: true })] });
one('series mark after a series neighbour', spec(FOCUS, (s) => { s.craft = true; s.series = 'EMR COST'; }), 'SERIES CHECK FAILED', { history: [past('series-before', 'stat/default', 'clinical-software', { series: true })] });
// 1 in 3: two images back counts too (a calm image between doesn't make room)
one('vibrant two back (1 in 3)', spec('ehr-interoperability-cost.glassbar.json'), 'VIBRANT CHECK FAILED', { history: [past('blue-2back', 'checklist/default', 'clinical-software', { bg: 'blue', vibrant: true }), past('calm-1back', 'stat/default', 'clinical-software', { at: '2026-10-02T00:00:00.000Z' })] });
one('series two back (1 in 3)', spec(FOCUS, (s) => { s.craft = true; s.series = 'EMR COST'; }), 'SERIES CHECK FAILED', { history: [past('series-2back', 'stat/default', 'clinical-software', { series: true }), past('calm-1back', 'ranked/default', 'clinical-software', { at: '2026-10-02T00:00:00.000Z' })] });
// a reservation isn't an image yet, so it is no neighbour
one('a reservation is not a neighbour', spec('ehr-interoperability-cost.glassbar.json'), 'OK', { history: [past('res-blue', 'checklist/default', 'clinical-software', { bg: 'blue', vibrant: true, reserved: true })] });

// 7. the spec's category, delivered images, same-topic, plan.mjs syntax
one('no category', spec(BADGES, (s) => { delete s.category; }), 'CATEGORY MISSING');
C.push({ name: 'delivered slug is locked (render)', history: [past('locked-a', 'versus/badges', 'medical-billing', { final: true, finalizedAt: '2026-10-02T00:00:00.000Z' })], steps: [{ spec: spec(BADGES), slug: 'locked-a', expect: 'FINAL IMAGE LOCKED' }] });
// the lock also goes by output folder: another slug can't render into a delivered image's folder
const LOCKED_OUT = path.join(tmp, 'delivered', 'locked-folder');
C.push({ name: 'delivered output folder is locked (render)', history: [past('locked-f', 'focus/default', 'medical-billing', { final: true, finalizedAt: '2026-10-02T00:00:00.000Z', out: LOCKED_OUT })], steps: [{ spec: spec(BADGES), slug: 'other-slug', out: LOCKED_OUT, expect: 'FINAL IMAGE LOCKED' }] });
C.push({ name: 'plan refuses a delivered slug', history: [past('locked-b', 'focus/default', 'medical-billing', { final: true, finalizedAt: '2026-10-02T00:00:00.000Z' })], steps: [{ plan: ['--category', 'specialty-software', '--reserve', 'locked-b=versus/checks'], expect: 'locked-b: already delivered (final)' }] });
C.push({ name: 'plan --release refuses a rendered slug', history: [past('rendered-c', 'focus/default')], steps: [{ plan: ['--release', 'rendered-c'], expect: 'rendered-c: already rendered' }] });
C.push({ name: 'plan --release refuses a delivered slug', history: [past('locked-d', 'focus/default', 'clinical-software', { final: true, finalizedAt: '2026-10-02T00:00:00.000Z' })], steps: [{ plan: ['--release', 'locked-d'], expect: 'locked-d: delivered (final)' }] });
C.push({ name: 'plan --release: a reservation goes, once', steps: [
  { plan: ['--category', 'specialty-software', '--reserve', 'res-e=versus/checks'], expect: 'OK' },
  { plan: ['--release', 'res-e'], expect: 'OK' },
  { plan: ['--release', 'res-e'], expect: 'res-e: no reservation' },
] });
one('same topic, same mode (render)', spec(FOCUS), 'VARIETY CHECK FAILED: another article on topic "emr-cost"', { history: [past('emr-cost-other', 'focus/default', 'medical-billing', { topic: 'emr-cost' })] });
one('superseded same-topic image does not count', spec(FOCUS), 'OK', { history: [past('emr-cost-old', 'focus/default', 'medical-billing', { topic: 'emr-cost', superseded: true })] });
// plan.mjs: same topic and mode refused even for the user's pick (it skips the category rule and the cap, never the topic rule)
C.push({ name: 'same topic, same mode (plan, even a pick)', steps: [
  { plan: ['--category', 'medical-billing', '--reserve', 'topic-a=focus@emr-cost'], expect: 'OK' },
  { plan: ['--category', 'clinical-software', '--reserve', 'topic-b=focus!@emr-cost'], expect: 'topic "emr-cost" already has mode focus' },
] });
C.push({ name: 'plan refuses the old "#reason" syntax', steps: [{ plan: ['--category', 'clinical-software', '--reserve', 'reason-a=focus#fits'], expect: 'the "#reason" suffix is gone' }] });
C.push({ name: 'plan refuses an unknown layout', steps: [{ plan: ['--category', 'clinical-software', '--reserve', 'unknown-a=versus/nope'], expect: 'unknown layout versus/nope' }] });
one('render refuses an unknown variant', spec(BADGES, (s) => { s.variant = 'nope'; }), 'Unknown variant "nope"');

// 8. logos, offline (local files only: assets/ and the generated fixtures above)
one('local logo file missing', spec('dynamics-vs-acumatica.window.json', (s) => { s.list.rows[0].logo = fixLogos('../assets/no-such-logo.png'); }), 'LOGO FILE MISSING');
one('logotype file missing', spec('notion-review.logotype.json', (s) => { s.logotype = fixLogos('../assets/no-such-logo.png'); }), 'LOGO FILE MISSING');
one('pills with a solid app tile', spec('dynamics-vs-acumatica.versus-pills.json', (s) => { s.left.logo = fixLogos(SP); s.right.logo = fixLogos(FAC); }), 'PILLS LOGO CHECK FAILED');
one('connect without an app icon', spec('netsuite-vs-sage-intacct.versus-connect.json', (s) => { s.left.logo = fixLogos(FAC); s.right.logo = fixLogos(SP); }), 'CONNECT LOGO CHECK FAILED');
one('tiles that cannot match', spec('04-tiles-blue.gumloop-tiles-blue.json', (s) => { s.left.logo = fixLogos(SP); s.right.logo = fixLogos(FAC); }), 'TILES LOGO CHECK FAILED');
one('glass with an ultra-wide wordmark', spec('08-glass-light.gumloop-glass-light.json', (s) => { s.left.logo = WIDE; }), 'GLASS LOGO CHECK FAILED');
one('logotype with a coloured logo', spec('notion-review.logotype.json', (s) => { s.logotype = fixLogos('../assets/tebra-folder-mark.png'); }), 'LOGOTYPE CHECK FAILED: no black logo lockup');
one('logotype without a separate icon', spec('notion-review.logotype.json', (s) => { s.logotype = BLOCK; }), 'LOGOTYPE CHECK FAILED: the logo for');
one('slash with a name it cannot split', spec('advancedmd-vs-curemd.versus-slash.json', (s) => { s.left.label = 'zocdoc'; }), 'SLASH NAME CHECK FAILED');

// ---- run ----
const cases = C.filter((c) => !filter || c.name.includes(filter));
const runCase = async (c, i) => {
  const box = { dir: path.join(tmp, `c${i}`), hist: path.join(tmp, `c${i}`, 'history'), rec: path.join(tmp, `c${i}`, 'used-layouts.json'), n: 0 };
  fs.mkdirSync(box.hist, { recursive: true });
  fs.writeFileSync(box.rec, JSON.stringify(c.record || { layouts: {} }));
  if (c.history) fs.writeFileSync(path.join(box.hist, `history-${BRAND}.json`), JSON.stringify(c.history));
  const rows = [];
  for (const [k, st] of c.steps.entries()) {
    const r = await step(box, st), ok = passed(r, st);
    rows.push({ name: c.steps.length > 1 ? `${c.name} [${k + 1}${st.plan ? ' plan' : st.slug ? ' ' + st.slug : ''}]` : c.name, expect: st.expect, got: got(r, st), ok });
    if (!ok) break;   // later steps depend on this one
  }
  return rows;
};
const pool = async (items, n, fn) => { const res = []; let k = 0; await Promise.all(Array.from({ length: n }, async () => { while (k < items.length) { const i = k++; res[i] = await fn(items[i], i); } })); return res; };
const rows = (await pool(cases, 6, runCase)).flat();
const w = Math.min(64, Math.max(...rows.map((r) => r.name.length)));
const we = Math.max(...rows.map((r) => r.expect.length));
console.log(`${'case'.padEnd(w)}  ${'expect'.padEnd(we)}  result`);
for (const r of rows) console.log(`${r.name.slice(0, w).padEnd(w)}  ${r.expect.padEnd(we)}  ${r.ok ? 'PASS' : `FAIL  got: ${r.got}`}`);
const failed = rows.filter((r) => !r.ok).length;
console.log(`refusals: ${rows.length - failed} / ${rows.length} pass (${cases.length} cases)`);
fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
process.exitCode = failed ? 1 : 0;
