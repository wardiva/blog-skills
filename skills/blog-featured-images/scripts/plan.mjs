// Batch planner: shows which layouts are free for a category and reserves layouts for a batch, so Makers can render in parallel.
// The user's rule: a layout not used yet is free for any article it suits (first in line); a used layout can't be used again in the
// same category, only in a different one. Usage = site history + the user's record (references/used-layouts.json), see usage.mjs.
// Usage:
//   node plan.mjs --brand <brand> --category <cat>                                        # free layouts for this category
//   node plan.mjs --brand <brand> --category <cat> --reserve <slug>=<mode>[/<variant>][!][@<topic>] ...
//   node plan.mjs --brand <brand> --release <slug> ...                                     # drop reservations that were never rendered
// A reservation list stops at the next --flag. "!" after the layout means the user picked it for that slug: it skips the category rule
// and the site-wide cap (never the same-topic rule), and render.mjs honours it for that slug; --user-pick does the same for every
// reservation in the call. Reservations are written to the site-wide history under its lock, so the renderer's check stays correct
// when renders run in parallel.
import fs from 'node:fs';
import { LAYOUTS, retiredOf, retiredMsg } from './layouts.mjs';
import { ALL_LAYOUTS as ALL, usage, blocked, freeFor, normCat, brandKeyOf, historyFileOf, readJson, loadHistory, countable, userRecord, warnRecord, withLock } from './usage.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const listAfter = (k) => { const i = args.indexOf(k), out = []; if (i < 0) return out; for (const a of args.slice(i + 1)) { if (a.startsWith('--')) break; out.push(a); } return out; };
const brand = brandKeyOf(opt('--brand')), category = opt('--category') ? normCat(opt('--category')) : '';
const reqs = listAfter('--reserve'), releases = listAfter('--release');
if (!category && !releases.length || reqs.length && !category) {
  console.error('Usage: node plan.mjs --brand <brand> --category <cat> [--reserve slug=mode/variant[!][@topic] ...]   |   --release <slug> ...');
  process.exit(1);
}
const file = historyFileOf(brand);
const rec = userRecord(brand);
warnRecord(rec);

if (releases.length) {
  // only a reservation that was never rendered can go: a rendered or delivered image is a real image on the site
  const errors = withLock(file, () => {
    const h = readJson(file), errs = [];
    for (const s of releases) {
      const mine = h.filter((e) => e.slug === s);
      if (!mine.length) errs.push(`${s}: no reservation in ${file}`);
      else if (mine.some((e) => e.final)) errs.push(`${s}: delivered (final); delivered images are permanent`);
      else if (mine.some((e) => !e.reserved)) errs.push(`${s}: already rendered; only unrendered reservations can be released`);
    }
    if (!errs.length) fs.writeFileSync(file, JSON.stringify(h.filter((e) => !releases.includes(e.slug)), null, 1));
    return errs;
  });
  if (errors.length) { console.error('RELEASE REFUSED (nothing written):\n  ' + errors.join('\n  ')); process.exit(2); }
  console.log(`Released ${releases.length} reservation(s) in ${file}`);
}

if (reqs.length) {
  const errors = withLock(file, () => {
    const history = readJson(file), errs = [];   // re-read under the lock: a parallel plan or render may have written since
    const batchSlugs = new Set(reqs.map((r) => r.split('=')[0]));
    const hist = history.filter((e) => e.final || !batchSlugs.has(e.slug));   // re-planning replaces a slug's old entry; delivered entries always stay
    for (const r of reqs) {
      const [slug, rest = ''] = r.split('='), [lay0, topic] = rest.split('@');
      // the old "slug=layout#reason" syntax; a "#" inside a topic (after "@") is fine
      if (lay0.includes('#')) { errs.push(`${r}: the "#reason" suffix is gone: drop it (for the user's own choice write ${slug}=${lay0.split('#')[0]}!)`); continue; }
      const pick = lay0.endsWith('!') || args.includes('--user-pick'), lay = lay0.replace(/!$/, '');
      const [mode, variant = LAYOUTS[mode]?.[0]] = lay.split('/');
      const ret = retiredOf(mode, variant);
      if (ret) { errs.push(`${slug}: ${retiredMsg(ret)}`); continue; }
      const layout = `${mode}/${variant}`;
      if (!ALL.includes(layout)) { errs.push(`${slug}: unknown layout ${layout}`); continue; }
      if (history.some((e) => e.slug === slug && e.final)) { errs.push(`${slug}: already delivered (final); delivered images can't be re-created`); continue; }
      const live = countable(hist, [slug]);
      const why = pick ? null : blocked(usage(live, rec), layout, category);   // the user's pick skips the category rule and the cap
      if (why) { const f = freeFor(usage(live, rec), category); errs.push(`${slug}: ${why} Not used yet: ${f.fresh.join(', ') || 'none'}. Used only in other categories: ${f.elsewhere.join(', ') || 'none'}`); continue; }
      if (topic && live.some((e) => e.topic === topic && e.mode === mode)) { errs.push(`${slug}: topic "${topic}" already has mode ${mode}`); continue; }
      hist.push({ slug, brand, category, topic: topic || null, mode, variant, layout, reserved: true, ...(pick ? { userPick: true } : {}), at: new Date().toISOString() });
    }
    if (!errs.length) fs.writeFileSync(file, JSON.stringify(hist, null, 1));
    return errs;
  });
  if (errors.length) { console.error('PLAN REFUSED (nothing written):\n  ' + errors.join('\n  ')); process.exit(2); }
  console.log(`Reserved ${reqs.length} layout(s) in ${file}`);
}

if (category) {
  const u = usage(countable(loadHistory(brand)), rec), f = freeFor(u, category);
  console.log(`Layouts for "${category}" (give each article the best fit; not-used-yet layouts go first):`);
  console.log(`  Not used yet (first in line): ${f.fresh.join(', ') || 'none'}`);
  console.log(`  Used only in other categories: ${f.elsewhere.join(', ') || 'none'}`);
  console.log(`  Not again in "${category}": ${ALL.filter((l) => blocked(u, l, category)).join(', ') || 'none'}`);
}
