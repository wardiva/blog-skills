// Layout usage and the site history, shared by render.mjs, plan.mjs, finalize.mjs and sheet.mjs.
// The user's rule (Oct 2026): "the ones that are used shouldn't be used again unless the category is different. The ones that aren't
// used can easily be used". So a layout not used yet is free for any article it suits and goes first in line; a used layout is refused
// only in a category it was already used in. REPEATABLE (layouts.mjs) adds a site-wide cap for a few layouts.
// Usage = the site history (every rendered, reserved or delivered image that isn't superseded) plus the user's own record,
// references/used-layouts.json, kept on the Template Usage page (one card per layout: Used + categories, or Not used yet). The record
// belongs to one brand (its "brand" key) and applies only to that brand's renders and plans; other brands go by their history alone.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAYOUTS, REPEATABLE } from './layouts.mjs';

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
// wins (a stale folder ledger must never override a newer site-history reservation). plan.mjs has no output folder: site history only.
export function loadHistory(brand, ledgerFile = null) {
  const bySlug = new Map(), byAt = (x, y) => String(x.at).localeCompare(String(y.at));
  for (const e of [...readJson(historyFileOf(brand)), ...(ledgerFile ? readJson(ledgerFile) : [])].sort(byAt)) bySlug.set(e.slug, { ...bySlug.get(e.slug), ...e });
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
    // used with no category: still used (never "not used yet"), refused in no category until the user names one
    if (used && !cats.length) warnings.push(`the record marks "${l}" used but names no category: it counts as used, and no category refuses it`);
    layouts[l] = { used, cats };
  }
  return { layouts, at: String(j.recordedAt || ''), warnings };
}
export const warnRecord = (rec) => { for (const w of rec.warnings) console.warn(`USED-LAYOUTS WARNING: ${w}`); };

// history: countable entries (see countable). The user's record is the truth for every layout it lists, as of recordedAt (an image in
// the history the user marked "not used yet" never went live). It covers every entry up to and including recordedAt, and entries with
// no "at"; entries after it are added on top. Layouts the record doesn't list go by the history alone.
export function usage(history, record) {
  const out = {}, after = (e) => !!e.at && String(e.at) > record.at;
  for (const l of ALL_LAYOUTS) {
    const r = record.layouts[l], all = history.filter((e) => layoutOf(e) === l), hits = r ? all.filter(after) : all;
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

// why a layout can't go on an article in this category, or null when it can
export function blocked(u, layout, category) {
  const x = u[layout], cat = normCat(category);
  if (!x) return `unknown layout ${layout}`;
  if (x.cats.has(cat)) return `"${layout}" is already used in the "${cat}" category (${x.by.filter((b) => b.endsWith(`(${cat})`)).join(', ') || 'marked used by the user'}). A used layout can't be used again in the same category.`;
  if (REPEATABLE[layout] && x.count >= REPEATABLE[layout]) return `"${layout}" has reached its site-wide limit of ${REPEATABLE[layout]}.`;
  return null;
}

// free layouts for a category: never used anywhere first (first in line), then used only in other categories; capped ones in neither
export function freeFor(u, category) {
  const ok = ALL_LAYOUTS.filter((l) => !blocked(u, l, category));
  return { fresh: ok.filter((l) => !u[l].used), elsewhere: ok.filter((l) => u[l].used) };
}
