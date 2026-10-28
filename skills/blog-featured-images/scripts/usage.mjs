// Layout usage and the site history, shared by render.mjs, plan.mjs, finalize.mjs, sheet.mjs and bgpick.mjs.
// The user's rule (Oct 28 2026, replacing the per-category rule of Oct 15): every new article gets a new design. A layout already used
// on the site (any category) is not used again for a new article; only the user's own pick (--user-pick, or "slug=layout!" in plan.mjs)
// reuses one. The approved layouts stay live as the taste library the new designs are learned from (never retired for this).
// the user (Oct 28 2026): "For different articles, I want new image for each article… you don't repeat the images that has already been used, you create a new images with the taste and training that you have acquired so far".
// Usage = the site history (every rendered, reserved or delivered image that isn't superseded) plus the user's own record,
// references/used-layouts.json, kept on the Template Usage page (one card per layout: Used + categories, or Not used yet). The record
// belongs to one brand (its "brand" key) and applies only to that brand's renders and plans; other brands go by their history alone.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAYOUTS } from './layouts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// FEATURED_USED_FILE: test-examples.mjs points it at an empty record, so the fixtures render whatever the live site has used
export const USED_FILE = process.env.FEATURED_USED_FILE || path.join(HERE, '..', 'references', 'used-layouts.json');
export const ALL_LAYOUTS = Object.keys(LAYOUTS).flatMap((m) => LAYOUTS[m].map((v) => `${m}/${v}`));
export const layoutOf = (e) => e.layout || `${e.mode}/${e.variant || (LAYOUTS[e.mode] || ['default'])[0]}`;
// one spelling per category everywhere (history, record, render, plan): "Hospital & Lab Software" = "hospital-and-lab-software"
export const normCat = (c) => String(c ?? '').trim().toLowerCase().replace(/&/g, ' and ').replace(/[\s_]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
export const brandKeyOf = (b) => String(b || 'default').replace(/[^a-z0-9-]/gi, '');
export const historyDir = () => process.env.FEATURED_HISTORY_DIR || path.join(os.homedir(), '.blog-featured-images');
export const historyFileOf = (brand) => path.join(historyDir(), `history-${brandKeyOf(brand)}.json`);
export const readJson = (f, empty = []) => { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : empty; } catch { return empty; } };

// The site history (one per brand, wherever a batch's output folder is) merged with a batch folder's ledger, per slug, newest entry
// wins (a stale folder ledger must never override a newer site-history reservation). Two copies of the same render (same "at") merge;
// otherwise the newer entry replaces the older one and keeps only the lock fields (final, finalizedAt, previousFinalizedAt, stored, superseded), so an old
// "userPick" or "bgPick" never leaks onto a re-planned layout. plan.mjs has no output folder: site history only.
export function loadHistory(brand, ledgerFile = null) {
  const bySlug = new Map(), byAt = (x, y) => String(x.at).localeCompare(String(y.at));
  const LOCK = ['final', 'finalizedAt', 'previousFinalizedAt', 'stored', 'superseded'];
  // the ledger first, so for the same render (same "at") the site history's fields win (they are fixed there, e.g. "vibrant")
  for (const e of [...(ledgerFile ? readJson(ledgerFile) : []), ...readJson(historyFileOf(brand))].sort(byAt)) {
    const prev = bySlug.get(e.slug);
    if (!prev || prev.at === e.at) { bySlug.set(e.slug, { ...prev, ...e }); continue; }
    const keep = Object.fromEntries(LOCK.filter((k) => prev[k] !== undefined && e[k] === undefined).map((k) => [k, prev[k]]));
    bySlug.set(e.slug, { ...e, ...keep });
  }
  return [...bySlug.values()].sort(byAt);
}
// the entries that count: not superseded (a delivered design the user rejected and had replaced is no longer on the site) and not
// the slugs being rendered or re-planned right now
export const countable = (history, skipSlugs = []) => history.filter((e) => !e.superseded && !skipSlugs.includes(e.slug));

// Parallel renders, plans and finalizes share the history files: take the lock, re-read, write. fn must be synchronous and must not
// call process.exit (the lock would stay behind); return what the caller needs instead.
export function withLock(file, fn) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const lock = file + '.lock';
  for (let i = 0; ; i++) {
    try { fs.mkdirSync(lock); break; } catch { if (i > 300) fs.rmSync(lock, { recursive: true, force: true }); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50); }
  }
  try { return fn(); } finally { fs.rmSync(lock, { recursive: true, force: true }); }
}

// The user's record for this brand, with warnings for entries it can't apply as written.
export function userRecord(brand) {
  const none = { layouts: {}, at: '', warnings: [] };
  let j;
  try { j = JSON.parse(fs.readFileSync(USED_FILE, 'utf8')); } catch { return none; }
  if (!j.brand) return { ...none, warnings: Object.keys(j.layouts || {}).length ? [`${path.basename(USED_FILE)} has no "brand", so it applies to no brand (add "brand": "<brand>")`] : [] };
  if (brandKeyOf(j.brand) !== brandKeyOf(brand)) return none;
  const layouts = {}, warnings = [];
  for (const [l, r] of Object.entries(j.layouts || {})) {
    if (!ALL_LAYOUTS.includes(l)) { warnings.push(`the record lists "${l}", which is not a live layout (ignored)`); continue; }
    const used = !!r && r.status === 'used', cats = [...new Set(((r && r.cats) || []).map(normCat).filter(Boolean))];
    // used with no category: still used (never "not used yet"), so it is not reused for a new article; the user can tick its categories
    if (used && !cats.length) warnings.push(`the record marks "${l}" used but names no category: it counts as used (not reused for a new article); tick its categories on the Template Usage page`);
    layouts[l] = { used, cats, at: r && r.asOf ? String(r.asOf) : '' };
  }
  return { layouts, at: String(j.recordedAt || ''), warnings };
}
export const warnRecord = (rec) => { for (const w of rec.warnings) console.warn(`USED-LAYOUTS WARNING: ${w}`); };

// history: countable entries (see countable). The user's record is the truth for every layout it lists, as of recordedAt (an image in
// the history the user marked "not used yet" never went live). It covers every entry up to and including recordedAt, and entries with
// no "at"; entries after it are added on top. A layout's own "asOf" replaces recordedAt as its cutoff. Layouts the record doesn't list
// go by the history alone.
export function usage(history, record) {
  const out = {};
  for (const l of ALL_LAYOUTS) {
    const r = record.layouts[l], asOf = (r && r.at) || record.at, after = (e) => !!e.at && String(e.at) > asOf, all = history.filter((e) => layoutOf(e) === l), hits = r ? all.filter(after) : all;
    const cats = new Set(hits.map((e) => normCat(e.category)).filter(Boolean));
    let before = 0;   // images the record covers: one per recorded category at least (one if it names none), or the history's own count there
    if (r && r.used) {
      for (const c of r.cats) cats.add(c);
      before = Math.max(r.cats.length, 1, all.filter((e) => !after(e) && r.cats.includes(normCat(e.category))).length);
    }
    out[l] = { used: hits.length + before > 0, cats, count: hits.length + before, by: hits.map((e) => `${e.slug} (${normCat(e.category)})`) };
  }
  return out;
}

// why a layout can't go on a new article, or null when it can
const NEW_DESIGN = 'Every new article gets a new design: pick a layout not used yet, or design a new one from the taste (references/taste-grammar.md); only the user\'s own pick reuses a layout.';
export function blocked(u, layout, category) {
  const x = u[layout], cat = normCat(category);
  if (!x) return `unknown layout ${layout}`;
  if (x.cats.has(cat)) return `"${layout}" is already used in the "${cat}" category (${x.by.filter((b) => b.endsWith(`(${cat})`)).join(', ') || 'marked used by the user'}). ${NEW_DESIGN}`;
  if (x.used) return `"${layout}" is already used on the site (${[...x.cats].join(', ') || 'marked used by the user'}). ${NEW_DESIGN}`;
  return null;
}

// the layouts a new article can take: those not used anywhere on the site yet
export function freeFor(u, category) {
  return { fresh: ALL_LAYOUTS.filter((l) => !blocked(u, l, category)) };
}
