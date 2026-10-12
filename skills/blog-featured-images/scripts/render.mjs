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

// "versus": in the approved card language, structurally unlike before-after.
//   variant "table" (default): ONE comparison card, products as column headers, matched rows, the right column tinted.
//   variant "overlap": two cards tilted toward each other, overlapping at the centre with the vs chip on the overlap.
function versus() {
  const L = spec.left, R = spec.right, dims = spec.dimensions || [];
  const legend = `<div class="legend vleg"><span class="lg1"><i></i>${esc(spec.legend[0])}</span><span class="lg2"><i></i>${esc(spec.legend[1])}</span></div>`;
  if (spec.variant === 'table') {
    const n = Math.max(L.items.length, R.items.length);
    const RH = 104, top = Math.round((900 - (150 + n * RH + 46 + 40)) / 2);
    const rows = Array.from({ length: n }, (_, i) => `<div class="tr"><span class="td0">${esc(dims[i] || '')}</span><span class="td1${i === 0 ? ' a' : ''}">${esc(L.items[i] || '')}</span><span class="td2${i === 0 ? ' a' : ''}">${esc(R.items[i] || '')}</span></div>`).join('');
    return `<style>
.tcard{position:absolute;left:230px;top:${top}px;width:1140px;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 30px 70px rgba(30,60,110,.14),0 0 0 1px rgba(20,26,38,.05)}
.tcol{position:absolute;top:0;bottom:0;left:${230 + 260 + 440}px}
.th,.tr{display:grid;grid-template-columns:260px 440px 440px;align-items:center}
.th{height:150px;border-bottom:1px solid #EEF0F4}.th b{display:block;font-size:44px;font-weight:600;letter-spacing:-.02em}.th em{display:block;margin-top:6px;font-style:normal;font-size:24px;color:#8A93A5}
.th .h1c b{color:#7C7468}.th .h2c b{color:#2C5FAE}
.th>span,.tr>span{padding:0 36px}.th .h2c,.tr .td2{background:#F2F8FE;height:100%;display:flex;flex-direction:column;justify-content:center}
.tr{height:${RH}px;border-bottom:1px solid #F1F2F5}.tr:last-child{border-bottom:0}
.td0{font-size:22px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#9AA3B2}
.td1,.td2{font-size:32px;color:#5D6675;line-height:1.25}.td1.a{color:#141A26;font-weight:500}.td2.a{color:#0A5FD8;font-weight:600}
.tvs{position:absolute;left:${230 + 260 + 440 - 30}px;top:${top + 75 - 30}px;width:60px;height:60px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:21px;font-weight:500;color:#5D6675;box-shadow:0 10px 24px rgba(30,60,110,.16),0 0 0 1px rgba(20,26,38,.06)}
.vleg{left:230px;top:${top + 150 + n * RH + 46}px}
</style>
<div class="tcard"><div class="th"><span></span><span class="h1c"><b>${esc(L.label)}</b><em>${esc(L.heading)}</em></span><span class="h2c"><b>${esc(R.label)}</b><em>${esc(R.heading)}</em></span></div>${rows}</div>
<div class="tvs">vs</div>${legend}`;
  }
  const card = (d, x, rot, cls, extra = '') => `<div class="ovl ${cls}" style="left:${x}px;transform:rotate(${rot}deg)"><div class="olb">${esc(d.label)}</div><div class="oc">${extra}<h3>${esc(d.heading)}</h3><ul>${d.items.map((t, i) => `<li${i === 0 ? ' class="a"' : ''}>${esc(t)}</li>`).join('')}</ul></div></div>`;
  return `<style>
.ovl{position:absolute;top:170px;width:560px}
.olb{font-size:46px;font-weight:500;letter-spacing:-.02em;margin:0 0 22px 8px}.o1 .olb{color:#7C7468}.o2 .olb{color:#2C5FAE}
.oc{position:relative;background:#fff;border-radius:24px;padding:42px 44px;min-height:0;box-shadow:0 30px 60px rgba(30,60,110,.15),0 0 0 1px rgba(20,26,38,.05)}
.oc h3{margin:0 0 20px;font-size:30px;font-weight:500;color:#5D6675}.oc ul{margin:0;padding:0 0 0 28px;display:grid;gap:16px;font-size:32px;line-height:1.3;color:#7F8794}.oc li.a{color:#141A26}
.o2 .oc li.a{color:#0A5FD8;font-weight:500}.o2{z-index:2}
.ovs{position:absolute;left:-50px;bottom:-64px;width:96px;height:96px;border-radius:50%;background:linear-gradient(150deg,#3B86F0,#0A5FD8);display:grid;place-items:center;color:#fff;font-size:30px;font-weight:600;letter-spacing:.02em;transform:rotate(-3deg);box-shadow:0 0 0 7px #fff,0 18px 34px rgba(10,95,216,.30)}
.vleg{left:50%;transform:translateX(-50%);top:700px}
</style>
${card(L, 250, -3, 'o1')}${card(R, 790, 3, 'o2', '<div class="ovs">VS</div>')}${legend}`;
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
  const rows = spec.panel.rows.map((r, i) => `<div class="pr" style="opacity:${[1, 0.72, 0.48][i] ?? 0.35}"><i class="ph ph-file-text"></i><div><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></div></div>`).join('');
  const chips = spec.chips.map((t) => `<span class="chip"><i></i>${esc(t)}</span>`).join('');
  return `<style>
body{background:linear-gradient(160deg,#EEF6FE 0%,#DCEEFC 50%,#CDE6FB 100%)}
body:before{background:radial-gradient(45% 55% at 50% 85%,rgba(39,172,242,.38),transparent 70%),radial-gradient(35% 45% at 5% 10%,rgba(255,180,150,.18),transparent 70%)}
.panel{position:absolute;left:210px;top:-20px;width:1180px;height:810px;border-radius:0 0 48px 48px;background:linear-gradient(180deg,#FFFFFF 35%,#D9ECFC 100%);box-shadow:0 30px 60px rgba(30,60,110,.10)}
.plbl{position:absolute;left:290px;top:66px;font-size:26px;font-weight:500;color:#8A93A5;letter-spacing:.01em}
.prs{position:absolute;left:290px;top:122px;display:grid;gap:30px}
.pr{display:flex;align-items:center;gap:28px}.pr i{width:80px;height:80px;border-radius:16px;background:#F1F4F8;display:grid;place-items:center;font-size:36px;color:#8A93A5}
.pr b{display:block;font-size:36px;font-weight:500;line-height:1.2;color:#2B3245}.pr span{display:block;margin-top:4px;font-size:28px;line-height:1.25;color:#6B7487}
h1{position:absolute;left:0;right:0;top:492px;margin:0;text-align:center;font-size:${Math.min(66, Math.floor(820 / (String(spec.headline).length * 0.52)))}px;font-weight:600;letter-spacing:-.03em;color:#0E2A5C}
.bar{position:absolute;left:250px;top:620px;width:1100px;height:124px;border-radius:62px;background:rgba(255,255,255,.92);box-shadow:0 20px 50px rgba(30,60,110,.14),0 0 0 1px rgba(20,26,38,.05);display:flex;align-items:center;padding:0 22px 0 46px;gap:16px}
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

// "stack" (Granola "Brief prepared overnight"): one front card holding the takeaway over two offset cards.
function stack() {
  const lead = esc(spec.lead).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  return `<style>
.sk{position:absolute;border-radius:28px;background:#fff}
.sk1{left:390px;top:170px;width:820px;height:140px;opacity:.5;box-shadow:0 10px 30px rgba(30,60,110,.08)}
.sk2{left:330px;top:215px;width:940px;height:140px;opacity:.78;box-shadow:0 10px 30px rgba(30,60,110,.10)}
.skf{left:270px;top:265px;width:1060px;height:430px;padding:56px 64px;box-shadow:0 30px 70px rgba(30,60,110,.16),0 0 0 1px rgba(20,26,38,.05)}
.skh{display:flex;align-items:center;gap:16px;font-size:32px;color:#7F8794}.skh i{font-size:40px;color:#0A5FD8}
.skl{margin:30px 0 28px;font-size:46px;line-height:1.28;color:#141A26;letter-spacing:-.015em}.skl b{font-weight:600;color:#0A5FD8}
.sku{margin:0;padding:0 0 0 34px;display:grid;gap:14px;font-size:32px;line-height:1.35;color:#7F8794}.sku li:first-child{color:#141A26}
</style>
<div class="sk sk1"></div><div class="sk sk2"></div>
<div class="sk skf"><div class="skh"><i class="${esc(spec.icon || 'ph ph-clipboard-text')}"></i>${esc(spec.title)}</div><div class="skl">${lead}</div><ul class="sku">${spec.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
}

// "window" (Granola app-window shots): a whole macOS-style window, list pane + detail pane, real text.
function appwin() {
  const W = spec.window || {}, L = spec.list, D = spec.detail;
  const rows = L.rows.slice(0, 5).map((r) => `<div class="wr"><span class="wav">${esc((r.title || '?').trim()[0])}</span><div><b>${esc(r.title)}</b><span>${esc(r.sub || '')}</span></div><em>${esc(r.meta || '')}</em></div>`).join('');
  return `<style>
.win{position:absolute;left:${spec.bleed ? 230 : 210}px;top:${spec.bleed ? 150 : 95}px;width:${spec.bleed ? 1300 : 1180}px;height:${spec.bleed ? 820 : 720}px;border-radius:24px;background:#fff;overflow:hidden;box-shadow:0 40px 80px rgba(30,60,110,.18),0 0 0 1px rgba(20,26,38,.06)}
.wt{height:66px;display:flex;align-items:center;gap:10px;padding:0 26px;border-bottom:1px solid #EEF0F4;background:#FAFBFC}
.wt i.d{width:14px;height:14px;border-radius:50%}.wt .s{margin:0 auto;width:440px;height:38px;border-radius:10px;background:#EEF0F4;display:flex;align-items:center;justify-content:center;gap:10px;font-size:18px;color:#7F8794}
.wt .a{font-size:18px;font-weight:500;color:#141A26;background:#EEF0F4;border-radius:10px;padding:8px 16px}
.wb{display:grid;grid-template-columns:640px 1fr;height:654px}
.wl{padding:40px 44px;border-right:1px solid #EEF0F4}
.wi{width:54px;height:54px;border-radius:14px;background:#E3F0FD;display:grid;place-items:center;font-size:30px;color:#0A5FD8}
.wl h2{margin:16px 0 4px;font-size:42px;font-weight:600;letter-spacing:-.02em}.wl .ws{font-size:22px;color:#7F8794;margin-bottom:22px}
.wr{display:flex;align-items:center;gap:16px;padding:13px 0}.wr .wav{width:46px;height:46px;border-radius:50%;background:#EEF2F7;display:grid;place-items:center;font-size:20px;font-weight:600;color:#5D6675;flex:none}
.wr b{display:block;font-size:24px;font-weight:500}.wr span{font-size:19px;color:#7F8794}.wr em{margin-left:auto;font-style:normal;font-size:20px;color:#141A26;font-weight:500;white-space:nowrap}
.wd{padding:40px ${spec.bleed ? 150 : 40}px 40px 40px}.wq{margin-left:${spec.bleed ? '0' : 'auto'};width:fit-content;max-width:440px;background:#F1F4F8;border-radius:18px;padding:12px 18px;font-size:20px;color:#141A26}
.wd h3{margin:30px 0 16px;font-size:32px;font-weight:600;line-height:1.2;letter-spacing:-.015em}
.wd ul{margin:0;padding:0 0 0 24px;display:grid;gap:12px;font-size:22px;line-height:1.4;color:#5D6675}
</style>
<div class="win"><div class="wt"><i class="d" style="background:#FF5F57"></i><i class="d" style="background:#FEBC2E"></i><i class="d" style="background:#28C840"></i>
<span class="s"><i class="ph ph-magnifying-glass"></i>${esc(W.search || 'Search')}</span><span class="a">${esc(W.action || 'New')}</span></div>
<div class="wb"><div class="wl"><div class="wi"><i class="${esc(L.icon || 'ph ph-list-bullets')}"></i></div><h2>${esc(L.heading)}</h2><div class="ws">${esc(L.sub || '')}</div>${rows}</div>
<div class="wd"><div class="wq">${esc(D.question)}</div><h3>${esc(D.heading)}</h3><ul>${(D.points || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></div></div>`;
}

// "timeline": steps on a track, steps up to the highlight filled, a callout card on the highlighted step.
function timeline() {
  const n = spec.steps.length, h = spec.highlight ?? n - 1, x = (i) => 270 + i * (1060 / (n - 1));
  const cw = 440, cx = Math.min(Math.max(x(h) - cw / 2, 210), 1390 - cw);
  const steps = spec.steps.map((s, i) => `<div class="ts${i < h ? ' done' : ''}${i === h ? ' on' : ''}" style="left:${x(i)}px"><b>${esc(s.label)}</b><i></i><span>${esc(s.sub || '')}</span></div>`).join('');
  return `<style>
.th{position:absolute;left:210px;top:150px;font-size:58px;font-weight:600;letter-spacing:-.03em;color:#0E2A5C}
.tsb{position:absolute;left:212px;top:228px;font-size:28px;color:#7F8794}
.tt{position:absolute;left:270px;top:665px;width:1060px;height:8px;border-radius:4px;background:#DDE2EA}
.tf{position:absolute;left:270px;top:665px;width:${x(h) - 270}px;height:8px;border-radius:4px;background:linear-gradient(90deg,#3B86F0,#0A5FD8)}
.ts{position:absolute;top:590px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;width:240px;text-align:center}
.ts b{font-size:26px;font-weight:500;color:#5D6675;white-space:nowrap;height:40px}
.ts i{margin-top:22px;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #C9D0DB}
.ts span{margin-top:18px;font-size:21px;color:#9AA3B2;white-space:nowrap}
.ts.done i{background:#0A5FD8;border-color:#0A5FD8}.ts.done b{color:#141A26}
.ts.on i{width:46px;height:46px;margin-top:14px;background:#0A5FD8;border-color:#fff;box-shadow:0 0 0 8px rgba(10,95,216,.18)}.ts.on b{color:#0A5FD8;font-weight:600}
.tc{position:absolute;left:${cx}px;top:360px;width:${cw}px;background:#fff;border-radius:20px;padding:26px 30px;box-shadow:0 24px 50px rgba(30,60,110,.14),0 0 0 1px rgba(20,26,38,.05)}
.tc b{display:block;font-size:30px;font-weight:600;color:#141A26}.tc span{display:block;margin-top:8px;font-size:22px;line-height:1.35;color:#7F8794}
</style>
<div class="th">${esc(spec.headline)}</div><div class="tsb">${esc(spec.sub || '')}</div>
<div class="tt"></div><div class="tf"></div>${steps}
<div class="tc"><b>${esc(spec.callout.title)}</b><span>${esc(spec.callout.text)}</span></div>`;
}

// "checklist": a tilted checklist card with real items, progress pill and bar.
function checklist() {
  const done = spec.items.filter((i) => i.done).length, total = spec.items.length;
  const ch = 230 + Math.min(total, 7) * 66, ct = Math.round((900 - ch) / 2);
  const items = spec.items.slice(0, 7).map((it, i) => {
    const cur = !it.done && (i === 0 || spec.items[i - 1].done);
    return `<div class="ck${it.done ? ' ckd' : ''}${cur ? ' ckc' : ''}"><span class="bx">${it.done ? '<i class="ph-bold ph-check"></i>' : ''}</span><span>${esc(it.text)}</span></div>`;
  }).join('');
  return `<style>
.cb{position:absolute;left:480px;top:${ct + 15}px;width:680px;height:${ch - 10}px;border-radius:30px;background:#E4EFFC;transform:rotate(4deg)}
.cf{position:absolute;left:440px;top:${ct}px;width:720px;height:${ch}px;border-radius:30px;background:#fff;transform:rotate(-2deg);padding:50px 56px;box-shadow:0 30px 70px rgba(30,60,110,.16),0 0 0 1px rgba(20,26,38,.05)}
.ch{display:flex;align-items:center;justify-content:space-between}.ch b{font-size:36px;font-weight:600;letter-spacing:-.02em}
.ch span{font-size:22px;font-weight:600;color:#0A5FD8;background:#E3F0FD;border-radius:99px;padding:8px 16px}
.cp{margin:22px 0 30px;height:10px;border-radius:5px;background:#EEF2F7}.cp i{display:block;height:100%;width:${Math.round((done / total) * 100)}%;border-radius:5px;background:linear-gradient(90deg,#3B86F0,#0A5FD8)}
.ck{display:flex;align-items:center;gap:20px;font-size:29px;color:#7F8794;padding:11px 0}
.ck .bx{width:40px;height:40px;border-radius:11px;border:3px solid #CBD2DC;display:grid;place-items:center;flex:none}
.ck.ckd{color:#141A26}.ck.ckd .bx{background:#0A5FD8;border-color:#0A5FD8;color:#fff;font-size:22px}
.ck.ckc{color:#141A26;font-weight:500}.ck.ckc .bx{border-color:#0A5FD8;box-shadow:0 0 0 6px rgba(10,95,216,.15)}
</style>
<div class="cb"></div><div class="cf"><div class="ch"><b>${esc(spec.title)}</b><span>${done} of ${total}</span></div><div class="cp"><i></i></div>${items}</div>`;
}

// "stat": one giant number from the article, a caption, and a breakdown card.
function stat() {
  const max = Math.max(...spec.card.rows.map((r) => r.pct || 1));
  const rows = spec.card.rows.map((r, i) => `<div class="sr${i === 0 ? ' a' : ''}"><div><b>${esc(r.name)}</b><em>${esc(r.value)}</em></div><i><i style="width:${Math.round(((r.pct || 1) / max) * 100)}%"></i></i></div>`).join('');
  return `<style>
.sv{position:absolute;left:200px;top:230px;font-size:${Math.min(spec.valueSize || 210, Math.floor(690 / (String(spec.value).length * 0.6)))}px;font-weight:600;letter-spacing:-.055em;line-height:1;color:#0A5FD8;white-space:nowrap}
.sc{position:absolute;left:212px;top:470px;width:620px;font-size:40px;font-weight:500;line-height:1.25;color:#141A26;letter-spacing:-.015em}
.ss{position:absolute;left:212px;top:620px;width:600px;font-size:26px;line-height:1.4;color:#7F8794}
.scard{position:absolute;left:960px;top:250px;width:430px;background:#fff;border-radius:24px;padding:42px 44px;box-shadow:0 24px 50px rgba(30,60,110,.12),0 0 0 1px rgba(20,26,38,.05)}
.scard h3{margin:0 0 26px;font-size:28px;font-weight:500;color:#5D6675}
.sr{margin-bottom:24px}.sr div{display:flex;justify-content:space-between;align-items:baseline;font-size:25px;color:#7F8794}.sr b{font-weight:500}.sr em{font-style:normal;white-space:nowrap}
.sr>i{display:block;margin-top:10px;height:12px;border-radius:6px;background:#EEF2F7}.sr>i>i{display:block;height:100%;border-radius:6px;background:#CBD2DC}
.sr.a div{color:#141A26}.sr.a>i>i{background:linear-gradient(90deg,#3B86F0,#0A5FD8)}
</style>
<div class="sv">${esc(spec.value)}</div><div class="sc">${esc(spec.caption)}</div><div class="ss">${esc(spec.sub || '')}</div>
<div class="scard"><h3>${esc(spec.card.heading)}</h3>${rows}</div>`;
}

// "ranked": named bars ranked by a real metric; the winner in the accent, the rest neutral.
function ranked() {
  const max = Math.max(...spec.rows.map((r) => r.pct));
  const win = spec.winner ?? 0;
  const rows = spec.rows.slice(0, 6).map((r, i) => `<div class="rr${i === win ? ' w' : ''}"><span class="rn">${String(i + 1).padStart(2, '0')}</span><b>${esc(r.name)}</b><i><i style="width:${Math.max(4, Math.round((r.pct / max) * 100))}%"></i></i><em>${esc(r.value)}</em></div>`).join('');
  return `<style>
.rh{position:absolute;left:210px;top:120px;font-size:56px;font-weight:600;letter-spacing:-.03em;color:#0E2A5C}
.rs{position:absolute;left:212px;top:196px;font-size:28px;color:#7F8794}
.rl{position:absolute;left:210px;top:285px;width:1180px;display:grid;gap:22px}
.rr{display:grid;grid-template-columns:56px 340px 1fr 190px;align-items:center;gap:18px}
.rn{font-size:22px;font-weight:600;color:#9AA3B2}.rr b{font-size:30px;font-weight:500;color:#2B3245;white-space:nowrap}
.rr>i{height:48px;border-radius:12px;background:#E6E4DF;overflow:hidden}.rr>i>i{display:block;height:100%;border-radius:12px;background:#CFCDC6}
.rr em{font-style:normal;font-size:26px;color:#7F8794;white-space:nowrap}
.rr.w b{color:#141A26;font-weight:600}.rr.w .rn{color:#0A5FD8}.rr.w>i>i{background:linear-gradient(90deg,#3B86F0,#0A5FD8)}.rr.w em{color:#0A5FD8;font-weight:600}
</style>
<div class="rh">${esc(spec.headline)}</div><div class="rs">${esc(spec.sub || '')}</div><div class="rl">${rows}</div>`;
}


// ---- balance layer (learned from Base44): grid lines + registration squares framing the hero, an optional cursor cue ----
// Grid only where it matches the vibe: open, data-led layouts on calm fields. Card-heavy or busy layouts stay clean.
const FRAME_DEFAULT = { stat: true, ranked: true, timeline: true, window: true };
function frameLayer() {
  const on = spec.frame ?? FRAME_DEFAULT[spec.mode || 'before-after'] ?? false;
  if (!on) return '';
  let g = '';
  for (let k = 0; k <= 8; k++) { const x = 210 + k * 147.5; g += `<line x1="${x}" y1="0" x2="${x}" y2="900"/>`; }
  for (let k = 0; k <= 5; k++) { const y = 75 + k * 150; g += `<line x1="0" y1="${y}" x2="1600" y2="${y}"/>`; }
  const sq = [[210, 75], [1390, 75], [210, 825], [1390, 825], [210, 450], [1390, 450]].map(([x, y]) => `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="1"/>`).join('');
  return `<svg class="frame" viewBox="0 0 1600 900" width="1600" height="900" style="position:absolute;inset:0;pointer-events:none">
<g stroke="#141A26" stroke-opacity=".055" stroke-width="1.5">${g}</g><g fill="#141A26" fill-opacity=".8">${sq}</g></svg>`;
}
function cursorLayer() {
  if (!spec.cursor) return '';
  const [x, y] = spec.cursor;
  return `<svg viewBox="0 0 64 80" width="96" height="120" style="position:absolute;left:${x}px;top:${y}px;filter:drop-shadow(0 8px 14px rgba(20,26,38,.25))"><path d="M6 4 L6 62 L20 49 L30 72 L40 67 L30 45 L50 45 Z" fill="#141A26" stroke="#fff" stroke-width="5" stroke-linejoin="round"/></svg>`;
}
const modes = { versus, hub, prompt, stack, window: appwin, timeline, checklist, stat, ranked };


// ---- heading must mirror the blog title: same key words, same meaning, just shorter ----
const STOP = new Set('a an the and or of for to in on at by with your you our is are be how what why when which who vs versus its it this that from into without about best top guide per 2024 2025 2026 2027'.split(' '));
const stem = (w) => w.endsWith('sses') ? w.slice(0, -2) : w.endsWith('ss') ? w : w.length > 4 && /(ches|shes|xes|zes)$/.test(w) ? w.slice(0, -2) : w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w;
const words = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9+ ]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)).map(stem);
const HEADING = { prompt: spec.headline, timeline: spec.headline, ranked: spec.headline, stack: spec.title, checklist: spec.title, window: spec.list && spec.list.heading, stat: spec.caption };
const heading = HEADING[spec.mode || 'before-after'];
if (heading !== undefined && !args.includes('--force')) {
  if (!spec.articleTitle) { console.error('HEADING CHECK FAILED: add "articleTitle" (the blog post\'s real title) to the spec. The image heading must reuse its words.'); process.exit(3); }
  const tw = new Set(words(spec.articleTitle)), hw = words(heading), shared = hw.filter((w) => tw.has(w));
  const need = spec.mode === 'stat' ? shared.length >= 2 : shared.length >= 2 && shared.length / hw.length >= 0.75;
  if (!need) {
    const extra = hw.filter((w) => !tw.has(w));
    console.error(`HEADING CHECK FAILED: the image heading must use the blog title's own words (shorter, same meaning).\n  Blog title : ${spec.articleTitle}\n  Heading    : ${heading}\n  Not in title: ${extra.join(', ') || '(too few shared words)'}\nRewrite the heading from the title's key words, e.g. drop the year and filler, keep the subject and angle.`);
    process.exit(3);
  }
}
// ---- variety: backgrounds rotate, and a ledger blocks a category from repeating a recent composition ----
const MODE = spec.mode || 'before-after';
const ALL_MODES = ['before-after', 'versus', 'prompt', 'hub', 'stack', 'window', 'timeline', 'checklist', 'stat', 'ranked'];
if (!ALL_MODES.includes(MODE)) { console.error(`Unknown mode "${MODE}". Modes: ${ALL_MODES.join(', ')}`); process.exit(1); }
const DEFAULT_BG = { 'before-after': 'wash', versus: 'wash', prompt: 'cool', hub: 'flat', stack: 'wash', window: 'cool', timeline: 'flat', checklist: 'cool', stat: 'white', ranked: 'flat' };
const BGS = ['wash', 'cool', 'white', 'flat'];
const category = spec.category || spec.brand || 'default';
const ledgerFile = path.join(path.dirname(outDir), '.featured-ledger.json');
const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : [];
const prior = ledger.filter((e) => e.category === category && e.slug !== slug);
const recent = prior.slice(-6);
const topic = spec.topic || null;
const sameTopic = topic ? ledger.filter((e) => e.topic === topic && e.slug !== slug) : [];
if (sameTopic.some((e) => e.mode === MODE) && !args.includes('--force')) {
  console.error(`VARIETY CHECK FAILED: another article on topic "${topic}" (${sameTopic.filter((e) => e.mode === MODE).map((e) => e.slug).join(', ')}) already uses mode "${MODE}".
Same-topic articles must use different compositions. Used for this topic: ${sameTopic.map((e) => e.mode).join(', ')}`);
  process.exit(2);
}
if (recent.some((e) => e.mode === MODE) && !args.includes('--force')) {
  const free = ALL_MODES.filter((m) => !recent.some((e) => e.mode === m));
  console.error(`VARIETY CHECK FAILED: mode "${MODE}" was already used by a recent "${category}" post (${recent.filter((e) => e.mode === MODE).map((e) => e.slug).join(', ')}).\nRecent modes: ${recent.map((e) => e.mode).join(', ')}\nPick one of: ${free.join(', ')}  (or pass --force)`);
  process.exit(2);
}
let BG = spec.bg || DEFAULT_BG[MODE];
const prevBg = prior.length ? prior[prior.length - 1].bg : null;
if (!spec.bg && BG === prevBg) BG = BGS.find((b) => b !== prevBg && b !== DEFAULT_BG[MODE]) || BG;
const BG_CSS = {
  wash: `body{background:linear-gradient(135deg,${w.warm} 0%,${w.mid} 40%,${w.cool} 75%,${w.deep} 100%)}body:before{display:block;background:radial-gradient(40% 50% at 85% 20%,${w.pool},transparent 70%),radial-gradient(35% 45% at 10% 90%,${w.warmPool},transparent 70%)}`,
  cool: `body{background:linear-gradient(160deg,#EEF6FE 0%,#DCEEFC 50%,#CDE6FB 100%)}body:before{display:block;background:radial-gradient(45% 55% at 50% 85%,rgba(39,172,242,.38),transparent 70%),radial-gradient(35% 45% at 5% 10%,rgba(255,180,150,.18),transparent 70%)}`,
  flat: `body{background:#F1F0EC}body:before{display:none}`,
  white: `body{background:#FBFBFC}body:before{display:block;background:radial-gradient(45% 60% at 0% 100%,rgba(39,172,242,.22),transparent 70%),radial-gradient(40% 50% at 100% 0%,rgba(255,180,150,.2),transparent 70%)}`,
};
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
.grain{position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;opacity:.09;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
</style></head><body>
${frameLayer()}
${modes[spec.mode] ? modes[spec.mode]() : `<div class="lbl l1">${esc(before.label)}</div><div class="lbl l2">${esc(after.label)}</div>
<div class="c c1"><div class="raw">${before.lines.map(esc).join('<br>')}<span class="caret"></span></div></div>
<svg class="conn" viewBox="0 0 80 900"><path d="M-30 ${306 + 42 * (before.lines.length - 1)} H 40 V 440 H 80" fill="none" stroke="#9AA3B2" stroke-width="3" stroke-dasharray="9 9"/></svg>
<div class="c c2"><h3>${esc(after.heading)}</h3><ul>${after.items.map((t, i) => `<li${i === 0 ? ' class="a"' : ''}>${esc(t)}</li>`).join('')}</ul></div>
<div class="legend"><span class="lg1"><i></i>${esc(spec.legend[0])}</span><span class="lg2"><i></i>${esc(spec.legend[1])}</span></div>`}
${cursorLayer()}
<style>${BG_CSS[BG] || ''}</style>
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
const next = ledger.filter((e) => e.slug !== slug);
next.push({ slug, category, topic, mode: MODE, bg: BG, at: new Date().toISOString() });
fs.writeFileSync(ledgerFile, JSON.stringify(next, null, 1));
console.log(`${outDir}
  mode=${MODE} bg=${BG} category=${category}`);
