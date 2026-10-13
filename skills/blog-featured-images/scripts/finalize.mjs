// Finalize delivered images: marks them permanent in the site-wide history and in their folder's ledger.
// A finalized image is never re-created or overwritten (the renderer refuses with "FINAL IMAGE LOCKED"), its files stay where
// they are, and it keeps counting for layout rotation forever.
// Usage:
//   node finalize.mjs --brand <brand> <slug> [<slug> ...]      # after QA passes and the images are delivered
//   node finalize.mjs --brand <brand> --list                    # show every delivered image
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const brand = (opt('--brand') || 'default').replace(/[^a-z0-9-]/gi, '');
const slugs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--brand');
const historyDir = process.env.FEATURED_HISTORY_DIR || path.join(os.homedir(), '.blog-featured-images');
const historyFile = path.join(historyDir, `history-${brand}.json`);
const readJson = (f) => { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : []; } catch { return []; } };

if (args.includes('--list')) {
  const done = readJson(historyFile).filter((e) => e.final);
  console.log(`${done.length} delivered image(s) for "${brand}":`);
  for (const e of done) console.log(`  ${e.finalizedAt?.slice(0, 10)}  ${e.category}  ${e.layout}  ${e.slug}\n      ${e.out}`);
  process.exit(0);
}
if (!slugs.length) { console.error('Usage: node finalize.mjs --brand <brand> <slug> [<slug> ...]   |   --list'); process.exit(1); }

const lock = historyFile + '.lock';
for (let i = 0; ; i++) {
  try { fs.mkdirSync(lock); break; } catch { if (i > 300) fs.rmSync(lock, { recursive: true, force: true }); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50); }
}
try {
  const history = readJson(historyFile), at = new Date().toISOString(), missing = [];
  for (const slug of slugs) {
    const e = history.find((x) => x.slug === slug && !x.reserved);
    if (!e) { missing.push(slug); continue; }
    if (!fs.existsSync(path.join(e.out, 'master.png'))) { missing.push(`${slug} (no master.png in ${e.out})`); continue; }
    Object.assign(e, { final: true, finalizedAt: e.finalizedAt || at });
    const ledgerFile = path.join(path.dirname(e.out), '.featured-ledger.json');
    fs.writeFileSync(ledgerFile, JSON.stringify([...readJson(ledgerFile).filter((x) => x.slug !== slug), e], null, 1));
  }
  if (missing.length) { console.error('FINALIZE REFUSED (nothing written): not rendered yet:\n  ' + missing.join('\n  ')); process.exit(2); }
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 1));
  console.log(`Finalized ${slugs.length} image(s). They are permanent and can't be re-created.`);
} finally { fs.rmSync(lock, { recursive: true, force: true }); }
