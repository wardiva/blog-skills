// blog-featured-images renderer: one article spec -> a featured image in the approved design language.
// Usage: node render.mjs <spec.json> [--brand <brand.json>] [--out <dir>]
//   spec  : article content + "mode" (before/after default, versus, prompt, hub). See references/spec-format.md
//   brand : colour overrides (default: brands/default.json). See brands/_template.json
//   out   : output folder (default: ./featured-images/<slug>)
// Writes master.png (1600x900), 7x5.webp (theme crop), 16x9-1200.webp (social), card-350x250.png (check size), page.html
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const specFile = args.find((a, i) => !a.startsWith('--') && !['--brand', '--out'].includes(args[i - 1]));
if (!specFile || !fs.existsSync(specFile)) {
  console.error('Usage: node render.mjs <spec.json> [--brand <brand.json>] [--out <dir>]');
  process.exit(1);
}
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const brandFile = opt('--brand') || (spec.brand ? path.resolve(HERE, '..', 'brands', spec.brand + '.json') : path.resolve(HERE, '..', 'brands', 'default.json'));
const brand = JSON.parse(fs.readFileSync(brandFile, 'utf8'));
const w = brand.wash;
const slug = spec.slug || path.basename(specFile, '.json');
const outDir = path.resolve(opt('--out') || path.join('featured-images', slug));

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const c = process.platform === 'win32'
    ? ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe']
    : process.platform === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium']
      : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'];
  const hit = c.find((p) => fs.existsSync(p));
  if (!hit) throw new Error('Chrome/Edge not found. Set the CHROME environment variable to your browser path.');
  return hit;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const before = spec.before, after = spec.after;

// "versus" mode for X vs Y articles: two equal cards, a "vs" chip on the dashed connector, same wash/labels/legend.
function versus() {
  const card = (side, x, cls) => `<div class="lbl ${cls}" style="left:${x}px">${esc(side.label)}</div>
<div class="c vc" style="left:${x}px"><h3>${esc(side.heading)}</h3><ul>${side.items.map((t, i) => `<li${i === 0 ? ' class="a"' : ''}>${esc(t)}</li>`).join('')}</ul></div>`;
  return `<style>
.vc{width:555px;height:330px;padding:46px 46px}
.vc h3{margin:0 0 22px;font-size:32px;font-weight:500;color:#5D6675;letter-spacing:-.01em}
.vc ul{margin:0;padding:0 0 0 28px;display:grid;gap:12px;font-size:29px;line-height:1.3}
.vc li{color:#7F8794}.vc li.a{color:#141A26}
.lbl{top:205px}.vc{top:295px}
.vsline{position:absolute;left:765px;top:460px;width:70px;border-top:3px dashed #9AA3B2}
.vs{position:absolute;left:772px;top:432px;width:56px;height:56px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:20px;font-weight:500;color:#5D6675;box-shadow:0 10px 24px rgba(30,60,110,.14),0 0 0 1px rgba(20,26,38,.05)}
.legend{left:210px;top:695px}
</style>
${card(spec.left, 210, 'l1')}${card(spec.right, 835, 'l2')}
<div class="vsline"></div><div class="vs">vs</div>
<div class="legend"><span class="lg1"><i></i>${esc(spec.legend[0])}</span><span class="lg2"><i></i>${esc(spec.legend[1])}</span></div>`;
}
// "hub" mode (Granola integrations): a blue centre tile, tilted white cards around it, hand-drawn arrows. Flat warm background.
function hub() {
  const slots = [[215, 100, -5], [200, 360, 4], [245, 615, -3], [1095, 90, 4], [1105, 355, -4], [1085, 620, 3]];
  const CW = 280, CH = 160;
  let arrows = '', cards = '';
  spec.cards.slice(0, 6).forEach((cd, i) => {
    const [x, y, r] = slots[i], left = i < 3;
    const cy = y + CH / 2;
    const sx = left ? 630 : 970, sy = 450 + (cy - 450) * 0.45;           // start at the tile edge
    const ex = left ? x + CW + 22 : x - 22, ey = cy;                        // end just short of the card
    const qx = (sx + ex) / 2, qy = Math.min(sy, ey) - 70;                   // arc over the top
    const ang = Math.atan2(ey - qy, ex - qx), h = 26;
    const p1 = [ex - h * Math.cos(ang - 0.5), ey - h * Math.sin(ang - 0.5)], p2 = [ex - h * Math.cos(ang + 0.5), ey - h * Math.sin(ang + 0.5)];
    arrows += `<path d="M${sx} ${sy} Q ${qx} ${qy} ${ex} ${ey}"/><path d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L ${ex} ${ey} L ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}"/>`;
    cards += `<div class="hc" style="left:${x}px;top:${y}px;transform:rotate(${r}deg)"><b>${esc(cd.name)}</b><span>${esc(cd.sub)}</span></div>`;
  });
  return `<style>
body{background:#F1F0EC}body:before{display:none}
.tile{position:absolute;left:640px;top:290px;width:320px;height:320px;border-radius:64px;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;box-shadow:0 30px 60px rgba(10,95,216,.25)}
.tile i{font-size:150px;color:#fff}
.hc{position:absolute;width:${CW}px;height:${CH}px;background:#fff;border-radius:20px;border:2px solid #E3E1DC;display:flex;flex-direction:column;justify-content:center;padding:0 26px;gap:8px}
.hc b{white-space:nowrap;font-size:29px;font-weight:500;color:#141A26;letter-spacing:-.01em}.hc span{font-size:20px;color:#7F8794}
svg.arr{position:absolute;inset:0;overflow:visible}
</style>
<svg class="arr" viewBox="0 0 1600 900" width="1600" height="900"><defs><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter></defs>
<g filter="url(#rough)" fill="none" stroke="#141A26" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${arrows}</g></svg>
<div class="tile"><i class="${esc(spec.hubIcon || 'ph-fill ph-buildings')}"></i></div>${cards}`;
}

// "prompt" mode (Granola "Introducing Recipes"): a faded app panel, a big headline over it, a pill input bar with chips.
function prompt() {
  const rows = spec.panel.rows.map((r, i) => `<div class="pr" style="opacity:${[1, 0.6, 0.3][i] ?? 0.2}"><i class="ph ph-file-text"></i><div><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></div></div>`).join('');
  const chips = spec.chips.map((t) => `<span class="chip"><i></i>${esc(t)}</span>`).join('');
  return `<style>
body{background:linear-gradient(160deg,#EEF6FE 0%,#DCEEFC 50%,#CDE6FB 100%)}
body:before{background:radial-gradient(45% 55% at 50% 85%,rgba(39,172,242,.38),transparent 70%),radial-gradient(35% 45% at 5% 10%,rgba(255,180,150,.18),transparent 70%)}
.panel{position:absolute;left:210px;top:-20px;width:1180px;height:780px;border-radius:0 0 48px 48px;background:linear-gradient(180deg,#FFFFFF 35%,#D9ECFC 100%);box-shadow:0 30px 60px rgba(30,60,110,.10)}
.plbl{position:absolute;left:290px;top:62px;font-size:24px;color:#9AA3B2}
.prs{position:absolute;left:290px;top:110px;display:grid;gap:26px}
.pr{display:flex;align-items:center;gap:24px}.pr i{width:72px;height:72px;border-radius:16px;background:#F1F4F8;display:grid;place-items:center;font-size:36px;color:#8A93A5}
.pr b{display:block;font-size:34px;font-weight:500;color:#2B3245}.pr span{font-size:26px;color:#7F8794}
h1{position:absolute;left:0;right:0;top:405px;margin:0;text-align:center;font-size:102px;font-weight:600;letter-spacing:-.035em;color:#0E2A5C}
.bar{position:absolute;left:250px;top:600px;width:1100px;height:124px;border-radius:62px;background:rgba(255,255,255,.92);box-shadow:0 20px 50px rgba(30,60,110,.14),0 0 0 1px rgba(20,26,38,.05);display:flex;align-items:center;padding:0 22px 0 46px;gap:16px}
.bar .ph-txt{display:flex;align-items:center;gap:14px;font-size:36px;color:#8A93A5;margin-right:auto}
.bar .ph-txt:before{content:"";width:4px;height:52px;background:#27ACF2;border-radius:2px}
.chip{display:flex;align-items:center;gap:12px;font-size:28px;font-weight:500;color:#141A26;background:#fff;border-radius:40px;padding:16px 26px;box-shadow:0 0 0 1px rgba(20,26,38,.07)}
.chip i{width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#BFE3F8,#4F93E8)}
.go{width:92px;height:92px;border-radius:50%;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;color:#fff;font-size:42px;flex:none}
</style>
<div class="panel"></div><div class="plbl">${esc(spec.panel.label)}</div><div class="prs">${rows}</div>
<h1>${esc(spec.headline)}</h1>
<div class="bar"><span class="ph-txt">${esc(spec.placeholder)}</span>${chips}<span class="go"><i class="ph-bold ph-arrow-up"></i></span></div>`;
}

const modes = { versus, hub, prompt };
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
<style>
*{box-sizing:border-box}html,body{margin:0;width:1600px;height:900px;overflow:hidden}
body{position:relative;font-family:Inter,system-ui,sans-serif;color:#141A26;background:linear-gradient(135deg,${w.warm} 0%,${w.mid} 40%,${w.cool} 75%,${w.deep} 100%)}
body:before{content:"";position:absolute;inset:-100px;filter:blur(80px);background:radial-gradient(40% 50% at 85% 20%,${w.pool},transparent 70%),radial-gradient(35% 45% at 10% 90%,${w.warmPool},transparent 70%)}
.lbl{position:absolute;top:160px;font-size:50px;font-weight:500;letter-spacing:-.02em}
.l1{left:210px;color:#7C7468}.l2{left:710px;color:#2C5FAE}
.c{position:absolute;top:250px;background:#fff;border-radius:22px;box-shadow:0 24px 50px rgba(30,60,110,.12),0 0 0 1px rgba(20,26,38,.04)}
.c1{left:210px;width:420px;height:290px;padding:54px 40px}
.c1 .raw{font-size:29px;line-height:1.45;color:#141A26}
.caret{display:inline-block;width:3px;height:36px;background:#27ACF2;vertical-align:-6px;margin-left:4px}
.c2{left:710px;width:680px;height:410px;padding:48px 50px}
.c2 h3{margin:0 0 24px;font-size:34px;font-weight:500;color:#5D6675;letter-spacing:-.01em}
.c2 ul{margin:0;padding:0 0 0 30px;display:grid;gap:12px;font-size:30px;line-height:1.3}
.c2 li{color:#7F8794}.c2 li.a{color:#141A26}
.conn{position:absolute;left:630px;top:0;width:80px;height:900px;overflow:visible}
.legend{position:absolute;left:710px;top:700px;display:flex;gap:44px;font-size:30px;font-weight:500}
.legend span{display:flex;align-items:center;gap:14px}.legend i{width:16px;height:16px;border-radius:50%}
.lg1{color:#141A26}.lg1 i{background:#141A26}.lg2{color:#2C7BD8}.lg2 i{background:#27ACF2}
.grain{position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;opacity:.05;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
</style></head><body>
${modes[spec.mode] ? modes[spec.mode]() : `<div class="lbl l1">${esc(before.label)}</div><div class="lbl l2">${esc(after.label)}</div>
<div class="c c1"><div class="raw">${before.lines.map(esc).join('<br>')}<span class="caret"></span></div></div>
<svg class="conn" viewBox="0 0 80 900"><path d="M-30 ${306 + 42 * (before.lines.length - 1)} H 40 V 440 H 80" fill="none" stroke="#9AA3B2" stroke-width="3" stroke-dasharray="9 9"/></svg>
<div class="c c2"><h3>${esc(after.heading)}</h3><ul>${after.items.map((t, i) => `<li${i === 0 ? ' class="a"' : ''}>${esc(t)}</li>`).join('')}</ul></div>
<div class="legend"><span class="lg1"><i></i>${esc(spec.legend[0])}</span><span class="lg2"><i></i>${esc(spec.legend[1])}</span></div>`}
<div class="grain"></div></body></html>`;


// Brand colours: swap the default blue palette for the brand's.
const swaps = { '#3B86F0': brand.accentLight, '#0A5FD8': brand.accent, '#27ACF2': brand.sky, '#2C5FAE': brand.labelAfter, '#2C7BD8': brand.legendAfter, '#0E2A5C': brand.headline, '#7C7468': brand.labelBefore, '#F1F0EC': brand.flat };
let out = html;
for (const [k, v] of Object.entries(swaps)) if (v) out = out.split(k).join(v);

fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, 'page.html');
fs.writeFileSync(file, out);
const raw = path.join(outDir, 'raw.png');
execFileSync(findChrome(), ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1600,900',
  '--virtual-time-budget=8000', `--user-data-dir=${path.join(os.tmpdir(), 'bfi-chrome-profile')}`, `--screenshot=${raw}`, pathToFileURL(file).href], { stdio: 'ignore' });
const master = await sharp(raw).png().toBuffer();
fs.writeFileSync(path.join(outDir, 'master.png'), master);
const crop75 = await sharp(master).extract({ left: 170, top: 0, width: 1260, height: 900 }).toBuffer();
await sharp(crop75).resize(350, 250).png().toFile(path.join(outDir, 'card-350x250.png'));
await sharp(crop75).webp({ quality: 90 }).toFile(path.join(outDir, '7x5.webp'));
await sharp(master).resize(1200, 675).webp({ quality: 90 }).toFile(path.join(outDir, '16x9-1200.webp'));
fs.rmSync(raw);
console.log(outDir);
