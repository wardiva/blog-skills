// Contact sheet of every card in a category (from the site-wide history), so QA reviews ONE image instead of many.
// Usage: node sheet.mjs --brand <brand> --category <cat> --out <sheet.png> [--highlight slug1,slug2]
// Highlighted slugs (the batch under review) get a blue frame; the rest are the existing images to compare against.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const brand = (opt('--brand') || 'default').replace(/[^a-z0-9-]/gi, ''), category = opt('--category'), out = opt('--out') || 'sheet.png';
const hi = new Set((opt('--highlight') || '').split(',').filter(Boolean));
const file = path.join(process.env.FEATURED_HISTORY_DIR || path.join(os.homedir(), '.blog-featured-images'), `history-${brand}.json`);
const items = JSON.parse(fs.readFileSync(file, 'utf8')).filter((e) => e.category === category && e.out && fs.existsSync(path.join(e.out, 'card-350x250.png')));
items.sort((a, b) => (hi.has(b.slug) - hi.has(a.slug)) || String(a.at).localeCompare(String(b.at)));
const W = 350, H = 250, LBL = 40, G = 16, COLS = 5, rows = Math.ceil(items.length / COLS);
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const comp = [];
for (const [i, e] of items.entries()) {
  const x = G + (i % COLS) * (W + G), y = G + Math.floor(i / COLS) * (H + LBL + G);
  if (hi.has(e.slug)) comp.push({ input: Buffer.from(`<svg width="${W + 8}" height="${H + 8}"><rect width="100%" height="100%" rx="6" fill="#0A5FD8"/></svg>`), left: x - 4, top: y - 4 });
  comp.push({ input: path.join(e.out, 'card-350x250.png'), left: x, top: y });
  comp.push({ input: Buffer.from(`<svg width="${W}" height="${LBL}"><text x="0" y="16" font-family="Arial" font-size="13" font-weight="700" fill="${hi.has(e.slug) ? '#0A5FD8' : '#141A26'}">${esc(e.layout || e.mode)}</text><text x="0" y="33" font-family="Arial" font-size="12" fill="#5D6675">${esc(e.slug.slice(0, 52))}</text></svg>`), left: x, top: y + H + 4 });
}
await sharp({ create: { width: G + COLS * (W + G), height: G + rows * (H + LBL + G), channels: 3, background: '#ffffff' } }).composite(comp).png().toFile(out);
console.log(`${items.length} cards (${hi.size} highlighted) -> ${path.resolve(out)}`);
