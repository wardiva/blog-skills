// Finalize delivered images: marks them permanent in the site-wide history and in their folder's ledger.
// A finalized image is never re-created or overwritten (the renderer refuses with "FINAL IMAGE LOCKED") unless the user asks for that image
// to be redone (render.mjs --redo, then finalize it again: a new finalizedAt, the earlier ones in "previousFinalizedAt"); its files stay where
// they are, a copy goes to ~/.blog-featured-images/delivered/<brand>/<slug>/, and it keeps counting as used on the site (unless
// the user's record, references/used-layouts.json, says otherwise; see usage.mjs).
// Usage:
//   node finalize.mjs --brand <brand> <slug> [<slug> ...]      # after QA passes and the images are delivered
//   node finalize.mjs --brand <brand> --list                    # show every delivered image
import fs from 'node:fs';
import path from 'node:path';
import { brandKeyOf, historyDir as historyDirOf, historyFileOf, readJson, withLock } from './usage.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const brand = brandKeyOf(opt('--brand'));
const slugs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--brand');
const historyDir = historyDirOf(), historyFile = historyFileOf(brand);

if (args.includes('--list')) {
  const done = readJson(historyFile).filter((e) => e.final);
  console.log(`${done.length} delivered image(s) for "${brand}":`);
  for (const e of done) console.log(`  ${e.finalizedAt?.slice(0, 10)}  ${e.category}  ${e.layout}  ${e.slug}\n      ${e.stored || e.out}`);
  process.exit(0);
}
if (!slugs.length) { console.error('Usage: node finalize.mjs --brand <brand> <slug> [<slug> ...]   |   --list'); process.exit(1); }

// the same lock as render.mjs and plan.mjs: re-read, then write, so a parallel render's entry is never lost
const missing = withLock(historyFile, () => {
  const history = readJson(historyFile), at = new Date().toISOString(), miss = [], ledgers = [];
  for (const slug of slugs) {
    const e = history.find((x) => x.slug === slug && !x.reserved);
    if (!e) { miss.push(slug); continue; }
    if (!fs.existsSync(path.join(e.out, 'master.png'))) { miss.push(`${slug} (no master.png in ${e.out})`); continue; }
    ledgers.push(e);
  }
  if (miss.length) return miss;   // nothing written
  for (const e of ledgers) {
    // durable copy: ~/.blog-featured-images/delivered/<brand>/<slug>/ (master, crops, spec), whatever folder the batch ran in
    const store = path.join(historyDir, 'delivered', brand, e.slug);
    fs.mkdirSync(store, { recursive: true });
    for (const name of fs.readdirSync(e.out)) if (/\.(png|webp|json)$/i.test(name)) fs.copyFileSync(path.join(e.out, name), path.join(store, name));
    const specPath = path.join(path.dirname(e.out), 'specs', `${e.slug}.json`);
    if (fs.existsSync(specPath)) fs.copyFileSync(specPath, path.join(store, 'spec.json'));
    // a redo (render.mjs --redo) re-rendered it after its last finalize: the new image gets today's date, the earlier dates are kept
    const redone = e.finalizedAt && String(e.at) > String(e.finalizedAt);
    if (redone) e.previousFinalizedAt = [...(e.previousFinalizedAt || []), e.finalizedAt];
    Object.assign(e, { final: true, finalizedAt: e.finalizedAt && !redone ? e.finalizedAt : at, stored: store });
    const ledgerFile = path.join(path.dirname(e.out), '.featured-ledger.json');
    fs.writeFileSync(ledgerFile, JSON.stringify([...readJson(ledgerFile).filter((x) => x.slug !== e.slug), e], null, 1));
  }
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 1));
  return [];
});
if (missing.length) { console.error('FINALIZE REFUSED (nothing written): not rendered yet:\n  ' + missing.join('\n  ')); process.exit(2); }
console.log(`Finalized ${slugs.length} image(s). They are permanent: only a redo the user asks for (render.mjs --redo) replaces one.`);
