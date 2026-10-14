// Layout usage, shared by render.mjs and plan.mjs.
// The user's rule (Oct 2026): a layout not used yet is free for any article it suits, and goes first in line;
// a used layout can't be used again in the same category, only in a different one.
// Usage = the site history (delivered and reserved images) plus the user's own record, references/used-layouts.json,
// which the user keeps on the Template Usage page (one card per layout: Used + categories, or Not used yet).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAYOUTS, REPEATABLE } from './layouts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const USED_FILE = path.join(HERE, '..', 'references', 'used-layouts.json');
export const ALL_LAYOUTS = Object.keys(LAYOUTS).flatMap((m) => LAYOUTS[m].map((v) => `${m}/${v}`));
export const layoutOf = (e) => e.layout || `${e.mode}/${(LAYOUTS[e.mode] || ['default'])[0]}`;

export function userRecord() {
  try { const j = JSON.parse(fs.readFileSync(USED_FILE, 'utf8')); return { layouts: j.layouts || {}, at: j.recordedAt || '' }; } catch { return { layouts: {}, at: '' }; }
}

// history: entries already filtered to the ones that count (not superseded, not this slug).
// The user's record is the truth for every layout it lists, as of when they saved it (an image in the history the user marked
// "not used yet" never went live); images delivered after that save are added on top. Layouts it doesn't list use the history.
export function usage(history, record = userRecord()) {
  const out = {};
  for (const l of ALL_LAYOUTS) {
    const r = record.layouts[l];
    const all = history.filter((e) => layoutOf(e) === l);
    const hits = r ? all.filter((e) => String(e.at) > record.at) : all;
    const cats = new Set(hits.map((e) => e.category));
    const before = r && r.status === 'used' ? Math.max(r.cats.length, all.length - hits.length) : 0;
    if (r && r.status === 'used') for (const c of r.cats || []) cats.add(c);
    out[l] = { cats, count: hits.length + before, by: hits.map((e) => `${e.slug} (${e.category})`) };
  }
  return out;
}

// why a layout can't go on an article in this category, or null when it can
export function blocked(u, layout, category) {
  const x = u[layout];
  if (!x) return `unknown layout ${layout}`;
  if (x.cats.has(category)) return `"${layout}" is already used in the "${category}" category${x.by.length ? ` (${x.by.filter((b) => b.endsWith(`(${category})`)).join(', ') || 'marked used by the user'})` : ' (marked used by the user)'}. A used layout can't be used again in the same category.`;
  if (REPEATABLE[layout] && x.count >= REPEATABLE[layout]) return `"${layout}" has reached its site-wide limit of ${REPEATABLE[layout]}.`;
  return null;
}

// free layouts for a category: never used anywhere first (first in line), then used only in other categories
export function freeFor(u, category) {
  const fresh = ALL_LAYOUTS.filter((l) => u[l].cats.size === 0);
  const elsewhere = ALL_LAYOUTS.filter((l) => u[l].cats.size > 0 && !blocked(u, l, category));
  return { fresh, elsewhere };
}
