// blog-featured-images renderer: one article spec -> a featured image in the approved design language.
// Usage: node render.mjs <spec.json> [--brand <brand.json>] [--out <dir>]
//   spec  : article content + "mode" (28 modes / 46 layouts, listed in layouts.mjs). See references/spec-format.md
//   brand : colour overrides (default: brands/default.json). See brands/_template.json
//   out   : output folder (default: ./featured-images/<slug>)
// Writes master.png (1600x900), 7x5.webp (theme crop), 16x9-1200.webp (social), card-350x250.png (check size), page.html
import { LAYOUTS, retiredOf, retiredMsg, GL_LAYOUTS, CB_LAYOUTS, CANVAS_LAYOUTS, PICK_CANVAS } from './layouts.mjs';
import { usage as usageOf, blocked, freeFor, layoutOf, normCat, brandKeyOf, historyFileOf, readJson, loadHistory, countable, userRecord, warnRecord, withLock } from './usage.mjs';
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
const force = args.includes('--force');
// ---- the layout first: a retired or unknown layout is refused before any other check ----
const MODE = spec.mode || 'before-after';
const RETIRED_HIT = retiredOf(MODE, spec.variant);
if (RETIRED_HIT) { console.error(retiredMsg(RETIRED_HIT)); process.exit(2); }
const ALL_MODES = Object.keys(LAYOUTS);
if (!ALL_MODES.includes(MODE)) { console.error(`Unknown mode "${MODE}". Modes: ${ALL_MODES.join(', ')}`); process.exit(1); }
const VARIANT = spec.variant || LAYOUTS[MODE][0];
if (!LAYOUTS[MODE].includes(VARIANT)) { console.error(`Unknown variant "${VARIANT}" for ${MODE}. Variants: ${LAYOUTS[MODE].join(', ')}`); process.exit(1); }
const LAYOUT = `${MODE}/${VARIANT}`;
// the article's category: a layout is used once per category, so a spec without one is refused (the brand name is no stand-in)
const category = normCat(spec.category);
if (!category) { console.error('CATEGORY MISSING: add "category" (the article\'s blog category, e.g. "clinical-software") to the spec. A layout is used once per category, so the renderer needs it.'); process.exit(2); }
const brandFile = opt('--brand') || (spec.brand ? path.resolve(HERE, '..', 'brands', spec.brand + '.json') : path.resolve(HERE, '..', 'brands', 'default.json'));
const brand = JSON.parse(fs.readFileSync(brandFile, 'utf8'));
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
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');   // a missing optional field renders as nothing, never "undefined"
// ---- logos: Brandfetch Logo API, hotlinked at render time (Brandfetch's guidelines: hotlink, don't re-host) ----
// Needs a free client ID (brandfetch.com/developers): env BRANDFETCH_CLIENT_ID or "brandfetchClientId" in
// ~/.blog-featured-images/config.json; never in a brand file (brand files are shared and committed).
// Without one, previews fall back to Google's favicon service. One treatment per image ("logoStyle") keeps logos on-vibe.
const LOCAL_CFG = (() => { try { return JSON.parse(fs.readFileSync(path.join(os.homedir(), '.blog-featured-images', 'config.json'), 'utf8')); } catch { return {}; } })();
const BF_CLIENT = process.env.BRANDFETCH_CLIENT_ID || LOCAL_CFG.brandfetchClientId || '';
const LOGO_STYLE = ['color', 'mono', 'tint'].includes(spec.logoStyle) ? spec.logoStyle : 'color';   // original colours by default
// Logo chain (all free): Brandfetch symbol -> Iconify "logos" colour icon -> Simple Icons in brand colour -> Brandfetch square icon
// (shown edge to edge, like an app icon, so dark tiles look intentional) -> lettermark. Without a Brandfetch ID, the Brandfetch steps are skipped.
const bf = (d, type, fb) => `https://cdn.brandfetch.io/${encodeURIComponent(d)}/w/256/h/256/fallback/${fb}/type/${type}?c=${encodeURIComponent(BF_CLIENT)}`;
const slugOfDomain = (d) => String(d).toLowerCase().replace(/^www\./, '').split('.')[0].replace(/[^a-z0-9]/g, '');
const localLogo = (d) => {
  if (/^https?:/.test(d)) return null;
  const f = d.startsWith('file:') ? fileURLToPath(d) : path.resolve(path.dirname(specFile), d);
  if (!/\.(png|svg|webp|jpe?g)$/i.test(f)) return null;
  if (!fs.existsSync(f)) { console.error(`LOGO FILE MISSING: ${d} (looked for ${f}). Keep custom logos in featured-images/assets/ and reference them relative to the spec.`); process.exit(2); }
  const ext = path.extname(f).slice(1).toLowerCase(), mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${fs.readFileSync(f).toString('base64')}`;
};
const logoChain = (d, slug) => /^icon:/.test(d) ? (BF_CLIENT ? [[bf(d.slice(5), 'icon', 'lettermark'), 'full']] : [[`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d.slice(5))}&sz=128`, '']]) : localLogo(d) ? [[localLogo(d), '']] : /^https?:/.test(d) ? [[d, '']] : [   // a URL is used as is (e.g. a mark cut from the official icon)
  ...(BF_CLIENT ? [[bf(d, 'symbol', '404'), '']] : []),
  [`https://api.iconify.design/logos/${slug}-icon.svg`, ''],
  [`https://api.iconify.design/logos/${slug}.svg`, ''],
  [`https://cdn.simpleicons.org/${slug}`, ''],
  ...(BF_CLIENT ? [[bf(d, 'icon', 'lettermark'), 'full']] : [[`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`, '']]),
];
// The square-icon step is only edge to edge when the icon really is a solid app tile (opaque, non-white corners).
// A white or transparent square with a small or wide mark inside is cropped to the mark and sits in a normal white tile.
const LOGO_JS = `<script>function lgNext(img){const c=JSON.parse(img.dataset.chain);const k=+(img.dataset.k||0)+1;if(k>=c.length){img.onerror=null;img.parentNode.classList.add('lgx');img.parentNode.textContent=img.dataset.l;return;}img.dataset.k=k;if(c[k][1]==='full')img.dataset.full='1';else if(c[k][1])img.parentNode.classList.add(c[k][1]);img.src=c[k][0];}
function lgFit(img){if(img.dataset.full!=='1')return;img.dataset.full='done';const sp=img.parentNode;try{const w=img.naturalWidth,h=img.naturalHeight,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,w,h).data;const at=(a,b)=>d.subarray((b*w+a)*4,(b*w+a)*4+4);
const ink=(p)=>p[3]>40&&!(p[0]>232&&p[1]>232&&p[2]>232);const cs=[[2,2],[w-3,2],[2,h-3],[w-3,h-3]].map(([a,b])=>at(a,b));
if(cs.every((p)=>p[3]>200&&ink(p))){sp.classList.add('full');return;}
let x0=w,y0=h,x1=-1,y1=-1;for(let b=0;b<h;b++)for(let a=0;a<w;a++)if(ink(at(a,b))){if(a<x0)x0=a;if(a>x1)x1=a;if(b<y0)y0=b;if(b>y1)y1=b;}
if(x1<0){sp.classList.add('full');return;}let ink2=0,tot=0,lum=0,sat=0;for(let b=y0;b<=y1;b+=2)for(let a=x0;a<=x1;a+=2){tot++;const p=at(a,b);if(ink(p)){ink2++;const mx=Math.max(p[0],p[1],p[2]),mn=Math.min(p[0],p[1],p[2]);lum+=(p[0]+p[1]+p[2])/3;sat+=mx?(mx-mn)/mx:0;}}
const pale=ink2&&sat/ink2<0.15&&lum/ink2>125;const m=Math.round(Math.max(x1-x0,y1-y0)*0.03),cw=x1-x0+1+2*m,ch=y1-y0+1+2*m,o=document.createElement('canvas');o.width=cw;o.height=ch;const ox=o.getContext('2d');
ox.drawImage(cv,x0,y0,x1-x0+1,y1-y0+1,m,m,x1-x0+1,y1-y0+1);if(pale){const id=ox.getImageData(0,0,cw,ch),q=id.data;for(let k=0;k<q.length;k+=4){for(let c=0;c<3;c++)q[k+c]=Math.round(255*Math.pow(q[k+c]/255,3));}ox.putImageData(id,0,0);}img.src=o.toDataURL('image/png');}catch(e){sp.classList.add('full');}}</script>`;
const logo = (d, size = 48, label = '') => {
  if (!d) return '';
  const chain = logoChain(d, slugOfDomain(d));
  return `<span class="lg lg-${LOGO_STYLE}" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.46)}px"><img src="${chain[0][0]}" data-chain='${JSON.stringify(chain).replace(/'/g, '&#39;')}' data-l="${esc(((label || slugOfDomain(d) || "?")[0] || "?").toUpperCase())}" onerror="lgNext(this)" onload="lgFit(this)" alt=""></span>`;
};
const LOGO_CSS = `.lg{display:inline-grid;place-items:center;flex:none;border-radius:14px;overflow:hidden;box-sizing:border-box}.lg img{width:100%;height:100%;object-fit:contain;display:block}
.lg-color{background:#fff;padding:7px;box-shadow:0 0 0 1px rgba(20,26,38,.08)}

.lg.full{padding:0}.lg.full img{border-radius:inherit}.lg.lgx{font-weight:600;color:#5D6675;background:#EEF2F7}
.lg-mono{background:#F1F3F6;padding:9px}.lg-mono img{filter:grayscale(1) contrast(1.15);opacity:.8;mix-blend-mode:multiply}
.lg-tint{background:#E3F0FD;padding:9px}.lg-tint img{filter:grayscale(1) contrast(1.2);mix-blend-mode:luminosity;opacity:.75}`;

const before = spec.before, after = spec.after;
// before-after default: the 'after' card fits its content and the whole group is centred vertically (no empty card areas)
const baH = after ? Math.max(290, 160 + (after.items || []).length * 51) : 290;
const baTop = Math.round((900 - (baH + 190)) / 2);

// "versus": in the approved card language, structurally unlike before-after.
//   variant "overlap" (default): two cards tilted toward each other, overlapping at the centre with the vs chip on the overlap.
//   variant "table": ONE comparison card, products as column headers, matched rows, the right column tinted.
// The other variants are the headline layouts (pills, connect, slash, duo), the Gumloop-style ones (type, tiles, glass, frost, bento)
// and the arrangements of approved parts (badges, checks, center, lanes, scores, fan, stacked).
function versus() {
  if (spec.variant === 'pills') return cbVersusPills();
  if (spec.variant === 'connect') return cbVersusConnect();
  if (spec.variant === 'slash') return cbVersusSlash();
  if (spec.variant === 'duo') return cbVersusDuo();
  if (spec.variant === 'type') return glType();
  if (spec.variant === 'tiles') return glTiles();
  if (spec.variant === 'glass') return glGlass();
  if (spec.variant === 'frost') return glFrost();
  if (spec.variant === 'bento') return glBento();
  if (spec.variant === 'badges') return o7Badges();
  if (spec.variant === 'checks') return o7Checks();
  if (spec.variant === 'center') return o8Center();
  if (spec.variant === 'lanes') return o9Lanes();
  if (spec.variant === 'scores') return o9Scores();
  if (spec.variant === 'fan') return o14Fan();
  if (spec.variant === 'stacked') return o14Stacked();
  const L = spec.left, R = spec.right, dims = spec.dimensions || [];
  const legend = spec.legend ? `<div class="legend vleg"><span class="lg1"><i></i>${esc(spec.legend[0])}</span><span class="lg2"><i></i>${esc(spec.legend[1])}</span></div>` : '';
  if (spec.variant === 'table') {
    const n = Math.max(L.items.length, R.items.length);
    // every value cell shares one size, the largest that keeps the longest on one line (Visual QA, batch 6: a wrapped cell made the row uneven)
    const tfs = Math.min(32, Math.floor(350 / (Math.max(...[...L.items, ...R.items].map((t) => String(t).length)) * 0.56)));
    const RH = 104, top = Math.round((900 - (150 + n * RH + (spec.legend ? 86 : 0))) / 2);
    const rows = Array.from({ length: n }, (_, i) => `<div class="tr"><span class="td0">${esc(dims[i] || '')}</span><span class="td1${i === 0 ? ' a' : ''}">${esc(L.items[i] || '')}</span><span class="td2${i === 0 ? ' a' : ''}">${esc(R.items[i] || '')}</span></div>`).join('');
    return `<style>
.tcard{position:absolute;left:230px;top:${top}px;width:1140px;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 30px 70px rgba(30,60,110,.14),0 0 0 1px rgba(20,26,38,.05)}
.th,.tr{display:grid;grid-template-columns:260px 440px 440px;align-items:center}
.th{height:150px;border-bottom:1px solid #EEF0F4}.th b{display:block;font-size:44px;font-weight:600;letter-spacing:-.02em}.th em{display:block;margin-top:6px;font-style:normal;font-size:24px;color:#8A93A5}
.th .h1c b{color:#7C7468}.th .h2c b{color:#2C5FAE}
.th>span,.tr>span{padding:0 36px}.th .h2c,.tr .td2{padding-left:72px}.th .h2c,.tr .td2{background:#F2F8FE;height:100%;display:flex;flex-direction:column;justify-content:center}
.tr{height:${RH}px;border-bottom:1px solid #F1F2F5}.tr:last-child{border-bottom:0}
.td0{font-size:22px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#9AA3B2}
.td1,.td2{font-size:${tfs}px;white-space:nowrap;color:#5D6675;line-height:1.25}.td1.a{color:#141A26;font-weight:500}.td2.a{color:#0A5FD8;font-weight:600}
.tvs{position:absolute;z-index:2;left:${230 + 260 + 440 - 42}px;top:${top + 150 - 42}px;width:84px;height:84px;border-radius:50%;background:linear-gradient(150deg,#3B86F0,#0A5FD8);display:grid;place-items:center;color:#fff;font-size:27px;font-weight:600;letter-spacing:.02em;box-shadow:0 0 0 6px #fff,0 2px 6px rgba(20,26,38,.08)}
.vleg{left:230px;top:${top + 150 + n * RH + 46}px}
</style>
<div class="tcard"><div class="th"><span></span><span class="h1c"><b>${logo(L.logo, 46)}${esc(L.label)}</b><em>${esc(L.heading)}</em></span><span class="h2c"><b>${logo(R.logo, 46)}${esc(R.label)}</b><em>${esc(R.heading)}</em></span></div>${rows}</div>
<div class="tvs">VS</div>${legend}`;
  }
  const card = (d, x, rot, cls, extra = '') => `<div class="ovl ${cls}" style="left:${x}px;transform:rotate(${rot}deg)"><div class="olb">${logo(d.logo, 50)}${esc(d.label)}</div><div class="oc">${extra}<h3>${esc(d.heading)}</h3><ul>${d.items.map((t, i) => `<li${i === 0 ? ' class="a"' : ''}>${esc(t)}</li>`).join('')}</ul></div></div>`;
  return `<style>
.ovl{position:absolute;top:${spec.legend ? 170 : 255}px;width:560px}
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
  const n = Math.min(spec.cards.length, 7), T = n === 7 ? 390 : 450;
  const LOGOS_ONLY = spec.cards.slice(0, n).every((c) => c.logo) && !spec.showNames;
  if (LOGOS_ONLY) {
    // Logos only: square white logo tiles orbit the blue centre tile, no names.
    // Balance rule: the logo fills ~65% of its tile; full-bleed app icons become the tile themselves.
    const S = 156, L = 102, HX = 800, HY = T;
    const pos = [[420, 190, -5], [360, 420, 4], [430, 650, -3], [1180, 190, 4], [1240, 420, -4], [1170, 650, 3], [800, 735, 2]].slice(0, n);
    let arrows = '', tiles = '';
    spec.cards.slice(0, n).forEach((cd, i) => {
      const [cx, cy, r] = pos[i];
      const dx = cx - HX, dy = cy - HY, m = Math.max(Math.abs(dx), Math.abs(dy));
      const sx = HX + dx / m * 180, sy = HY + dy / m * 180, ex = cx - dx / m * (S / 2 + 26), ey = cy - dy / m * (S / 2 + 26);
      const len = Math.hypot(ex - sx, ey - sy), qx = (sx + ex) / 2 - (ey - sy) / len * 26, qy = (sy + ey) / 2 + (ex - sx) / len * 26;
      const ang = Math.atan2(ey - qy, ex - qx), h = 24;
      const p1 = [ex - h * Math.cos(ang - 0.5), ey - h * Math.sin(ang - 0.5)], p2 = [ex - h * Math.cos(ang + 0.5), ey - h * Math.sin(ang + 0.5)];
      arrows += `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}"/><path d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)} L ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}"/>`;
      tiles += `<div class="hq" style="left:${cx - S / 2}px;top:${cy - S / 2}px;transform:rotate(${r}deg)">${logo(cd.logo, cd.scale ? Math.round(S * Math.min(0.8, Math.max(0.5, Number(cd.scale)))) : L, cd.name)}</div>`;   // optional per-card "scale" (0.5-0.8 of the tile) for a wide, light lockup (QA, batch 5)
    });
    return `<style>
.tile{position:absolute;left:640px;top:${T - 160}px;width:320px;height:320px;border-radius:64px;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;box-shadow:0 30px 60px rgba(10,95,216,.25)}
.tile i{font-size:150px;color:#fff}.tl{display:flex;flex-direction:column;align-items:center;color:#fff}.tl b{font-size:150px;font-weight:600;line-height:1;letter-spacing:-.04em}.tl span{margin-top:8px;font-size:34px;font-weight:500;opacity:.92;white-space:nowrap;text-align:center;line-height:1.15}
.hq{position:absolute;width:${S}px;height:${S}px;border-radius:38px;background:#fff;display:grid;place-items:center;box-shadow:0 18px 40px rgba(30,60,110,.12),0 0 0 1px rgba(20,26,38,.05)}
.hq .lg{box-shadow:none;background:transparent;padding:0}.hq .lg:not(.full){border-radius:0;overflow:visible}
.hq:has(.lg.full){background:transparent}.hq .lg.full{width:${S}px!important;height:${S}px!important;border-radius:38px}
svg.arr{position:absolute;inset:0;overflow:visible}
</style>
<svg class="arr" viewBox="0 0 1600 900" width="1600" height="900"><defs><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter></defs>
<g filter="url(#rough)" fill="none" stroke="#141A26" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${arrows}</g></svg>
<div class="tile">${spec.hubLabel ? `<div class="tl"><b>${esc(spec.hubLabel.big)}</b><span>${esc(spec.hubLabel.small || '').replace(/\n/g, '<br>')}</span></div>` : `<i class="${esc(spec.hubIcon || 'ph-fill ph-buildings')}"></i>`}</div>${tiles}`;
  }
  const slots = [[215, 100, -5], [214, 360, 4], [245, 615, -3], [1055, 90, 4], [1060, 355, -4], [1045, 620, 3], [640, 705, 2]];
  const LOGOS = spec.cards.some((c) => c.logo), CW = LOGOS ? 345 : 320, CH = spec.showSubs ? 160 : 112;
  if (LOGOS) slots.forEach((sl, i) => { if (i >= 3 && i < 6) sl[0] -= 25; if (i === 6) sl[0] -= 12; });   // logo cards are 345 wide, so the right column moves left to stay inside x 1390 (name-only cards are 320 wide: "SAP Business One" fits)
  let arrows = '', cards = '';
  spec.cards.slice(0, n).forEach((cd, i) => {
    const [x, y, r] = slots[i], left = i < 3;
    const cy = y + CH / 2;
    let sx = left ? 630 : 970, sy = T + (cy - T) * 0.45;                   // start at the tile edge
    let ex = left ? x + CW + 24 : x - 24, ey = cy;                          // end just short of the card
    let qx = sx, qy = ey + (ey < sy ? 20 : -20);                            // leave the tile vertically, bend into the card's inner edge
    if (i === 6) { sx = 800; sy = T + 172; ex = 806; ey = y - 18; qx = 850; qy = (sy + ey) / 2; } // short arc down to the bottom card
    const ang = Math.atan2(ey - qy, ex - qx), h = 26;
    const p1 = [ex - h * Math.cos(ang - 0.5), ey - h * Math.sin(ang - 0.5)], p2 = [ex - h * Math.cos(ang + 0.5), ey - h * Math.sin(ang + 0.5)];
    arrows += `<path d="M${sx} ${sy} Q ${qx} ${qy} ${ex} ${ey}"/><path d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L ${ex} ${ey} L ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}"/>`;
    cards += `<div class="hc${cd.logo ? ' hl' : ''}" style="left:${x}px;top:${y}px;transform:rotate(${r}deg)">${logo(cd.logo, 46)}<div class="ht"><b>${esc(cd.name)}</b>${spec.showSubs && cd.sub ? `<span>${esc(cd.sub)}</span>` : ''}</div></div>`;
  });
  return `<style>
.tile{position:absolute;left:640px;top:${T - 160}px;width:320px;height:320px;border-radius:64px;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;box-shadow:0 30px 60px rgba(10,95,216,.25)}
.tile i{font-size:150px;color:#fff}.tl{display:flex;flex-direction:column;align-items:center;color:#fff}.tl b{font-size:150px;font-weight:600;line-height:1;letter-spacing:-.04em}.tl span{margin-top:8px;font-size:34px;font-weight:500;opacity:.92;white-space:nowrap;text-align:center;line-height:1.15}
.hc{position:absolute;width:${CW}px;height:${CH}px;background:#fff;border-radius:20px;border:2px solid #E3E1DC;display:flex;flex-direction:column;justify-content:center;padding:0 26px;gap:8px}
.hc.hl{flex-direction:row;align-items:center;justify-content:flex-start;gap:18px;padding:0 22px}.ht{display:flex;flex-direction:column;gap:8px;min-width:0}.hl .ht b{font-size:28px}
.hc b{white-space:nowrap;font-size:30px;font-weight:500;color:#141A26;letter-spacing:-.01em}.hc span{font-size:20px;color:#7F8794}
svg.arr{position:absolute;inset:0;overflow:visible}
</style>
<svg class="arr" viewBox="0 0 1600 900" width="1600" height="900"><defs><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter></defs>
<g filter="url(#rough)" fill="none" stroke="#141A26" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${arrows}</g></svg>
<div class="tile">${spec.hubLabel ? `<div class="tl"><b>${esc(spec.hubLabel.big)}</b><span>${esc(spec.hubLabel.small || '').replace(/\n/g, '<br>')}</span></div>` : `<i class="${esc(spec.hubIcon || 'ph-fill ph-buildings')}"></i>`}</div>${cards}`;
}

// "prompt" mode (Granola "Introducing Recipes"): a faded app panel, a big headline over it, a pill input bar with chips.
function prompt() {
  // "panel.even": true keeps every row at full strength (no fade), for rows that are equals (RXNT vs DrFirst, option C, Oct 20 2026)
  const BIGP = spec.panel.rows.length <= 2;   // two rows grow to fill the panel (Visual QA, b10: a half-empty panel reads as a missing row)
  // a row or chip that names a product shows its real logo (QA, batch 5: file icons beside product names read as files)
  const rows = spec.panel.rows.map((r, i) => `<div class="pr" style="opacity:${spec.panel.even ? 1 : [1, 0.72, 0.48][i] ?? 0.35}">${r.logo ? `<span class="plg">${logo(r.logo, BIGP ? 70 : 54, r.title)}</span>` : '<i class="ph ph-file-text"></i>'}<div><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></div></div>`).join('');
  const chips = (spec.chips || []).map((t) => typeof t === 'object' ? (t.logo && !t.label ? `<span class="chip lo">${logo(t.logo, 40, '')}</span>` : `<span class="chip">${t.logo ? logo(t.logo, 30, t.label) : '<i></i>'}${esc(t.label || '')}</span>`) : `<span class="chip"><i></i>${esc(t)}</span>`).join('');
  return `<div style="position:absolute;inset:0;background:${spec.field !== 'soft' ? 'linear-gradient(180deg,#F7FBFF 0%,#EAF5FE 38%,#A9DCFB 78%,#7CC8F8 100%)' : 'linear-gradient(160deg,#EEF6FE 0%,#D6EAFC 50%,#BFDDFA 100%)'}"></div><style>
.panel{position:absolute;left:210px;top:-20px;width:1180px;height:810px;border-radius:0 0 48px 48px;background:linear-gradient(180deg,#FFFFFF 35%,#D9ECFC 100%);box-shadow:0 30px 60px rgba(30,60,110,.10)}
.plbl{position:absolute;left:290px;top:66px;font-size:26px;font-weight:500;color:#8A93A5;letter-spacing:.01em}
.prs{position:absolute;left:290px;top:${BIGP ? 182 : 122}px;display:grid;gap:30px}
.pr{display:flex;align-items:center;gap:28px}.pr i{width:80px;height:80px;border-radius:16px;background:#F1F4F8;display:grid;place-items:center;font-size:36px;color:#8A93A5}
.pr b{display:block;font-size:36px;font-weight:500;line-height:1.2;color:#2B3245}.pr span{display:block;margin-top:4px;font-size:28px;line-height:1.25;color:#6B7487}
h1{position:absolute;left:0;right:0;top:492px;margin:0;text-align:center;font-size:${Math.min(66, Math.floor(820 / (String(spec.headline).length * 0.52)))}px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B}
${BIGP ? ".prs{gap:40px}.prs .plg{width:104px;height:104px;border-radius:22px}.pr b{font-size:40px}.pr span{font-size:30px}" : ""}
.bar{position:absolute;left:250px;top:620px;width:1100px;height:124px;border-radius:62px;background:rgba(255,255,255,.92);box-shadow:0 20px 50px rgba(30,60,110,.14),0 0 0 1px rgba(20,26,38,.05);display:flex;align-items:center;padding:0 22px 0 46px;gap:16px}
.bar .ph-txt{display:flex;align-items:center;gap:14px;font-size:36px;color:#8A93A5;margin-right:auto}
.bar .ph-txt:before{content:"";width:4px;height:52px;background:#27ACF2;border-radius:2px}
.chip{display:flex;align-items:center;gap:12px;font-size:28px;font-weight:500;color:#141A26;background:#fff;border-radius:40px;padding:16px 26px;box-shadow:0 0 0 1px rgba(20,26,38,.07)}
.chip i{width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#BFE3F8,#4F93E8)}
.plg{width:80px;height:80px;border-radius:16px;background:#fff;box-shadow:0 0 0 1px rgba(20,26,38,.07);display:grid;place-items:center;flex:none}.plg .lg,.chip .lg{box-shadow:none;background:transparent;padding:0}.chip.lo{padding:12px 26px}.chip.lo .lg{width:auto!important;height:40px!important;max-width:200px;border-radius:0}.chip.lo .lg img{width:auto;height:40px;max-width:200px}
.go{width:92px;height:92px;border-radius:50%;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;color:#fff;font-size:42px;flex:none}
</style>
<div class="panel"></div><div class="plbl">${esc(spec.panel.label)}</div><div class="prs">${rows}</div>
<h1>${esc(spec.headline)}</h1>
<div class="bar"><span class="ph-txt">${esc(spec.placeholder)}</span>${chips}<span class="go"><i class="ph-bold ph-arrow-up"></i></span></div>`;
}

// "stack" (Granola "Brief prepared overnight"): one front card holding the takeaway, two offset cards peeking from the top.
// The front card fits its content; the whole stack is centred.
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
.skf .skh{padding-right:200px;font-size:48px;font-weight:600;color:#0A0A0B;letter-spacing:-.02em}.skf .skl,.skf .sku{max-width:740px}.skf .skl{font-size:40px;color:#5D6675}.skf .skl b{color:#141A26}
.skit{position:absolute;right:64px;top:56px;width:156px;height:156px;border-radius:40px;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;font-size:92px;color:#fff;box-shadow:0 14px 30px rgba(10,95,216,.22)}
.skw{position:absolute;left:270px;top:50%;width:1060px;transform:translateY(-42%)}.skw .sk{position:absolute;left:0;right:0;top:auto;width:auto;height:auto}
.skw .sk1{left:120px;right:120px;top:-90px;bottom:90px}.skw .sk2{left:60px;right:60px;top:-45px;bottom:45px}.skw .skf{position:relative;height:auto;padding-bottom:64px}
</style>
<div class="skw"><div class="sk sk1"></div><div class="sk sk2"></div>
<div class="sk skf"><div class="skit"><i class="${esc(spec.icon || 'ph ph-clipboard-text')}"></i></div><div class="skh">${esc(spec.title)}</div><div class="skl"${(spec.items || []).length ? '' : ' style="margin-bottom:0"'}>${lead}</div>${(spec.items || []).length ? `<ul class="sku">${spec.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div></div>`;   // no items: no empty list, no extra bottom space
}

// "window" (Granola app-window shots): a whole macOS-style window, list pane + detail pane, real text.
function appwin() {
  const W = spec.window || {}, L = spec.list, D = spec.detail;
  const BLEED = !!spec.bleed, H = 720, WT = BLEED ? 150 : 95;
  const rows = L.rows.slice(0, 5).map((r, i) => `<div class="wr${i === L.highlight ? " wh" : ""}">${r.logo ? logo(r.logo, 46) : r.icon ? `<span class="wav"><i class="${esc(r.icon)}" aria-hidden="true"></i></span>` : `<span class="wav">${esc((r.title || '?').trim()[0])}</span>`}<div><b>${esc(r.title)}</b><span>${esc(r.sub || '')}</span></div><em>${esc(r.meta || '')}</em></div>`).join('');
  return `<style>
.win{position:absolute;left:${BLEED ? 230 : 210}px;top:${WT}px;width:${BLEED ? 1300 : 1180}px;height:${BLEED ? 820 : H}px;border-radius:24px;background:#fff;overflow:hidden;box-shadow:0 40px 80px rgba(30,60,110,.18),0 0 0 1px rgba(20,26,38,.06)}
.wt{height:66px;display:flex;align-items:center;gap:10px;padding:0 26px;border-bottom:1px solid #EEF0F4;background:#FAFBFC}
.wt i.d{width:14px;height:14px;border-radius:50%}.wt .s{margin:0 auto;width:440px;height:38px;border-radius:10px;background:#EEF0F4;display:flex;align-items:center;justify-content:center;gap:10px;font-size:18px;color:#7F8794}
.wt .a{font-size:18px;font-weight:500;color:#141A26;background:#EEF0F4;border-radius:10px;padding:8px 16px}
.wb{display:grid;grid-template-columns:640px 1fr;height:${(BLEED ? 820 : H) - 66}px}
.wl{padding:40px 44px;border-right:1px solid #EEF0F4}
.wi{width:54px;height:54px;border-radius:14px;background:#E3F0FD;display:grid;place-items:center;font-size:30px;color:#0A5FD8}
.wl h2{margin:16px 0 4px;color:#0A0A0B;white-space:nowrap;font-size:${Math.min(42, Math.floor(552 / (String(spec.list.heading || "").length * 0.56 || 1)))}px;font-weight:600;letter-spacing:-.02em}.wl .ws{font-size:22px;color:#7F8794;margin-bottom:22px}
.wr{display:flex;align-items:center;gap:16px;padding:13px 0}.wr .wav{width:46px;height:46px;border-radius:50%;background:#EEF2F7;display:grid;place-items:center;font-size:20px;font-weight:600;color:#5D6675;flex:none}
.wr.wh{margin:0 -18px;padding:13px 18px;border-radius:16px;background:linear-gradient(90deg,#3B86F0,#0A5FD8);color:#fff}.wr.wh .wav{background:rgba(255,255,255,.2);color:#fff}.wr.wh span,.wr.wh em{color:rgba(255,255,255,.85)}.wr b{display:block;font-size:24px;font-weight:500}.wr span{font-size:19px;color:#7F8794}.wr em{margin-left:auto;font-style:normal;font-size:20px;color:#141A26;font-weight:500;white-space:nowrap}
.wd{padding:40px ${BLEED ? 150 : 40}px 40px 40px}.wq{margin-left:${BLEED ? '0' : 'auto'};width:fit-content;max-width:440px;background:#F1F4F8;border-radius:18px;padding:12px 18px;font-size:20px;color:#141A26}
.wd h3{margin:30px 0 16px;font-size:32px;font-weight:600;line-height:1.2;letter-spacing:-.015em}
.wd ul{margin:0;padding:0 0 0 24px;display:grid;gap:12px;font-size:22px;line-height:1.4;color:#5D6675}
</style>
<div class="win"><div class="wt"><i class="d" style="background:#FF5F57"></i><i class="d" style="background:#FEBC2E"></i><i class="d" style="background:#28C840"></i>
<span class="s"><i class="ph ph-magnifying-glass"></i>${esc(W.search || '')}</span>${W.action ? `<span class="a">${esc(W.action)}</span>` : ''}</div>
<div class="wb"><div class="wl"><div class="wi"><i class="${esc(L.icon || 'ph ph-list-bullets')}"></i></div><h2>${esc(L.heading)}</h2><div class="ws">${esc(L.sub || '')}</div>${rows}</div>
<div class="wd"><div class="wq">${esc(D.question)}</div><h3>${esc(D.heading)}</h3><ul>${(D.points || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></div></div>`;
}

// "timeline": steps on a track, steps up to the highlight filled, a callout card on the highlighted step.
function timeline() {
  const n = spec.steps.length, h = spec.highlight ?? n - 1, x = (i) => 270 + i * (1060 / (n - 1));
  const cw = 440, cx = Math.min(Math.max(x(h) - cw / 2, 210), 1390 - cw);
  const steps = spec.steps.map((s, i) => `<div class="ts${i < h ? ' done' : ''}${i === h ? ' on' : ''}" style="left:${x(i)}px"><b>${esc(s.label)}</b><i></i><span>${esc(s.sub || '')}</span></div>`).join('');
  return `<style>
.th{position:absolute;left:210px;top:150px;font-size:58px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B}
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
<div class="tc"><b>${esc(spec.callout.title)}</b>${spec.callout.text ? `<span>${esc(spec.callout.text)}</span>` : ''}</div>`;
}

// "checklist": a tilted checklist card with real items, progress pill and bar.
function checklist() {
  const done = spec.items.filter((i) => i.done).length, total = Number(spec.total) || spec.items.length;   // "total": the article's full count (e.g. 8-point list shown as 4 rows)
  const ch = 230 + Math.min(spec.items.length, 7) * 66, ct = Math.round((900 - ch) / 2);
  const items = spec.items.slice(0, 7).map((it, i) => {
    const cur = !it.done && (i === 0 || spec.items[i - 1].done);
    return `<div class="ck${it.done ? ' ckd' : ''}${cur ? ' ckc' : ''}"><span class="bx">${it.done ? '<i class="ph-bold ph-check"></i>' : ''}</span><span>${esc(it.text)}</span></div>`;
  }).join('');
  return `<style>
.cb{position:absolute;left:360px;top:${ct + 15}px;width:920px;height:${ch - 10}px;border-radius:30px;background:#E4EFFC;transform:rotate(4deg)}
.cf{position:absolute;left:320px;top:${ct}px;width:960px;height:${ch}px;border-radius:30px;background:#fff;transform:rotate(-2deg);padding:50px 56px;box-shadow:0 30px 70px rgba(30,60,110,.16),0 0 0 1px rgba(20,26,38,.05)}
.ch{display:flex;align-items:center;justify-content:space-between}.ch b{font-size:40px;font-weight:600;letter-spacing:-.02em;color:#0A0A0B}
.ch span{font-size:24px;font-weight:600;color:#fff;background:linear-gradient(90deg,#3B86F0,#0A5FD8);border-radius:99px;padding:10px 22px;box-shadow:0 8px 20px rgba(10,95,216,.25)}
.cp{margin:22px 0 30px;height:10px;border-radius:5px;background:#EEF2F7}.cp i{display:block;height:100%;width:${Math.round((done / total) * 100)}%;border-radius:5px;background:linear-gradient(90deg,#3B86F0,#0A5FD8)}
.ck{display:flex;align-items:center;gap:22px;font-size:32px;color:#7F8794;padding:11px 0}
.ck .bx{width:40px;height:40px;border-radius:11px;border:3px solid #CBD2DC;display:grid;place-items:center;flex:none}
.ck.ckd{color:#141A26}.ck.ckd .bx{background:#0A5FD8;border-color:#0A5FD8;color:#fff;font-size:22px}
.ck.ckc{color:#141A26;font-weight:500}.ck.ckc .bx{border-color:#0A5FD8;box-shadow:0 0 0 6px rgba(10,95,216,.15)}
</style>
<div class="cb"></div><div class="cf"><div class="ch"><b>${esc(spec.title)}</b><span>${done} of ${total}</span></div><div class="cp"><i></i></div>${items}</div>`;
}

// "stat": one giant number from the article, a caption, and a breakdown card.
function stat() {
  const max = Math.max(...spec.card.rows.map((r) => r.pct || 1));
  const rows = spec.card.rows.map((r, i) => `<div class="sr${i === (spec.card.highlight === undefined ? 0 : spec.card.highlight) ? ' a' : ''}"><div><b>${logo(r.logo, 44)}${esc(r.name)}</b><em>${esc(r.value)}</em></div><i><i style="width:${Math.round(((r.pct || 1) / max) * 100)}%"></i></i></div>`).join('');
  // a long value auto-shrinks; the caption hangs right under it and the number+caption block centres on the card
  const vfs = Math.min(150, spec.valueSize || 150, Math.floor(600 / (String(spec.value).length * 0.6)));   // 150 max: the number never outweighs the card (user)
  // "valueColor": "black" (the headline ink), "blue" (solid), or the blue gradient by default
  const svTop = Math.round(440 - (vfs + 44 + 50) / 2), scTop = svTop + vfs + 44;
  return `<style>
.sv{position:absolute;left:205px;top:${svTop}px;font-size:${vfs}px;font-weight:600;letter-spacing:-.055em;line-height:1;color:#0A5FD8;${spec.valueColor === 'black' ? 'color:#0A0A0B;' : spec.valueColor !== 'blue' ? 'background:linear-gradient(180deg,#4E9BF7,#1F6FE8);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:12px;' : ''};white-space:nowrap}
.sc{position:absolute;left:212px;top:${scTop}px;width:620px;font-size:40px;font-weight:500;line-height:1.25;color:#0A0A0B;letter-spacing:-.015em}
.ss{position:absolute;left:212px;top:620px;width:600px;font-size:26px;line-height:1.4;color:#7F8794}
.scard{position:absolute;right:210px;top:450px;transform:translateY(-50%);width:max-content;min-width:560px;max-width:640px;box-sizing:border-box;background:#fff;border-radius:26px;padding:50px 52px 26px;box-shadow:0 24px 50px rgba(30,60,110,.12),0 0 0 1px rgba(20,26,38,.05)}
.scard h3{margin:0 0 30px;font-size:32px;font-weight:500;color:#5D6675}
.sr{margin-bottom:30px}.sr div{display:flex;justify-content:space-between;align-items:baseline;font-size:30px;color:#7F8794}.sr b{font-weight:500;white-space:nowrap;display:flex;align-items:center;margin-right:24px}.sr em{font-style:normal;white-space:nowrap}
.sr>i{display:block;margin-top:12px;height:14px;border-radius:7px;background:#EEF2F7}.sr>i>i{display:block;height:100%;border-radius:6px;background:#CBD2DC}
.sr.a div{color:#141A26}.sr.a>i>i{background:linear-gradient(90deg,#3B86F0,#0A5FD8)}
</style>
<div class="sv">${esc(spec.value)}</div><div class="sc">${esc(spec.caption)}</div><div class="ss">${esc(spec.sub || '')}</div>
<div class="scard">${spec.card.heading ? `<h3>${esc(spec.card.heading)}</h3>` : ''}${rows}</div>`;
}

// "ranked": named bars ranked by a real metric; the winner in the accent, the rest neutral.
function ranked() {
  const max = Math.max(...spec.rows.map((r) => r.pct));
  const win = spec.winner ?? 0;
  const list = spec.rows.slice(0, 6);
  const rows = list.map((r, i) => `<div class="rr${i === win ? ' w' : ''}"><span class="rn">${String(i + 1).padStart(2, '0')}</span><b>${logo(r.logo, 40)}${esc(r.name)}</b><i><i style="width:${Math.max(4, Math.round((r.pct / max) * 100))}%"></i></i><em>${esc(r.value)}</em></div>`).join('');
  // Rows sit in a white card and the whole block (headline + card) is centred vertically, slightly above centre,
  // so 3 rows don't leave the bottom half empty. Fewer rows get taller bars and more air.
  const n = list.length, barH = n <= 3 ? 60 : n <= 4 ? 52 : 44, gap = n <= 3 ? 34 : n <= 4 ? 28 : 20;
  const headH = spec.sub ? 130 : 76, cardH = 2 * 52 + n * barH + (n - 1) * gap;
  const top = Math.max(70, Math.round((900 - (headH + 48 + cardH)) / 2) - 16);
  return `<style>
.rh{position:absolute;left:210px;top:${top}px;font-size:56px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B;line-height:1.2}
.rs{position:absolute;left:212px;top:${top + 78}px;font-size:28px;color:#7F8794}
.rl{position:absolute;left:210px;top:${top + headH + 48}px;width:1180px;box-sizing:border-box;padding:52px 56px;display:grid;gap:${gap}px;background:#fff;border-radius:28px;box-shadow:0 24px 50px rgba(30,60,110,.12),0 0 0 1px rgba(20,26,38,.05)}
.rr{display:grid;grid-template-columns:48px 310px 1fr 220px;align-items:center;gap:18px}
.rn{font-size:22px;font-weight:600;color:#9AA3B2}.rr b{font-size:30px;font-weight:500;color:#2B3245;white-space:nowrap}
.rr>i{height:${barH}px;border-radius:12px;background:#EEF0F3;overflow:hidden}.rr>i>i{display:block;height:100%;border-radius:12px;background:#CBD2DC}
.rr em{font-style:normal;font-size:28px;color:#7F8794;white-space:nowrap;text-align:right}
.rr.w b{color:#141A26;font-weight:600}.rr.w .rn{color:#0A5FD8}.rr.w>i>i{background:linear-gradient(90deg,#3B86F0,#0A5FD8)}.rr.w em{color:#0A5FD8;font-weight:600}
</style>
<div class="rh">${esc(spec.headline)}</div><div class="rs">${esc(spec.sub || '')}</div><div class="rl">${rows}</div>`;
}


// ---- balance layer (learned from Base44): grid lines + registration squares framing the hero, an optional cursor cue ----
// Grid only where it matches the vibe: open, data-led layouts on calm fields. Card-heavy or busy layouts stay clean.
const FRAME_DEFAULT = { stat: true, timeline: true, window: true };   // ranked uses the texture instead
function frameLayer() {
  const on = spec.bg !== 'blue' && (spec.frame ?? FRAME_DEFAULT[spec.mode || 'before-after'] ?? false);   // no grid on the vibrant blue (the dark squares looked off)
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
// "before-after" variant "flow": a muted "before" card with an icon -> hand-drawn arrow -> a lifted "after" card with a blue icon tile
// and checked items. Icons carry the meaning, so the text stays short.
function baFlow() {
  const B = spec.before, A = spec.after;
  return `<style>
.fb{position:absolute;left:240px;top:265px;width:370px;padding:44px 44px 48px;border-radius:26px;background:#F7F7F5;border:2px dashed #D9D6CF;box-sizing:border-box}
.fb .fi{width:92px;height:92px;border-radius:22px;background:#ECEAE5;display:grid;place-items:center;font-size:54px;color:#8B857A}
.fb b{display:block;margin-top:26px;font-size:40px;font-weight:500;color:#7C7468;letter-spacing:-.01em}
.fb span{display:block;margin-top:12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:28px;letter-spacing:.03em;color:#8F897D}
.fa{position:absolute;left:880px;top:215px;width:480px;padding:52px 52px 56px;border-radius:30px;background:#fff;box-sizing:border-box;box-shadow:0 34px 80px rgba(30,60,110,.18),0 0 0 1px rgba(20,26,38,.05)}
.fa .fi{width:112px;height:112px;border-radius:28px;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;font-size:66px;color:#fff;box-shadow:0 14px 28px rgba(10,95,216,.25)}
.fa b{display:block;margin-top:28px;font-size:50px;font-weight:600;color:#2C5FAE;letter-spacing:-.02em}
.fa ul{margin:22px 0 0;padding:0;list-style:none;display:grid;gap:16px}.fa li{display:flex;align-items:center;gap:14px;font-size:32px;color:#141A26}
.fa li i{font-size:34px;color:#0A5FD8}
svg.fl{position:absolute;inset:0;overflow:visible}
.fleg{position:absolute;left:50%;transform:translateX(-50%);top:745px;display:flex;gap:44px;font-size:28px;font-weight:500}
.fleg span{display:flex;align-items:center;gap:12px;white-space:nowrap}.fleg i{width:12px;height:12px;border-radius:50%}
.fleg .f1{color:#7C7468}.fleg .f1 i{background:#B7B1A6}.fleg .f2{color:#2C5FAE}.fleg .f2 i{background:#27ACF2}
</style>
<div class="fb"><div class="fi"><i class="${esc(B.icon || 'ph ph-hard-drives')}"></i></div><b>${esc(B.label)}</b>${(B.lines || []).map((l) => `<span>${esc(l)}</span>`).join('')}</div>
${CRAFT ? `<svg class="fl" viewBox="0 0 1600 900" width="1600" height="900"><g fill="none" stroke="#3B86F0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M632 440 C 712 440 760 440 842 440"/><path d="M824 426 L 844 440 L 824 454"/></g><circle cx="632" cy="440" r="7" fill="#3B86F0"/></svg>` : `<svg class="fl" viewBox="0 0 1600 900" width="1600" height="900"><defs><filter id="rgh"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter></defs>
<g filter="url(#rgh)" fill="none" stroke="#141A26" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M640 470 Q 745 380 838 452"/><path d="M808 428 L 842 455 L 804 476"/></g></svg>`}
<div class="fa"><div class="fi"><i class="${esc(A.icon || 'ph-fill ph-cloud')}"></i></div><b>${esc(A.label)}</b><ul>${(A.items || []).map((t) => `<li><i class="ph-fill ph-check-circle"></i>${esc(t)}</li>`).join('')}</ul></div>
${spec.legend ? `<div class="fleg"><span class="f1"><i></i>${esc(spec.legend[0])}</span><span class="f2"><i></i>${esc(spec.legend[1])}</span></div>` : ''}`;
}
// "focus" (Mintlify-inspired): a large light-weight headline whose key phrase sits in a blue selection box with corner
// handles, beside a small UI card: up to 3 real rows (label + value + bar) and faded skeleton rows that add zero words.
function focus() {
  const head = esc(spec.headline).replace(/\{\{(.+?)\}\}/g, '<span class="sel">$1<i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i></span>');
  const rows = spec.rows || [], max = Math.max(1, ...rows.map((r) => r.pct || 1)), hi = spec.highlight ?? -1;
  const real = rows.slice(0, 3).map((r, i) => `<div class="fr${i === hi ? ' on' : ''}"><b>${esc(r.name)}</b><i><i style="width:${Math.max(8, Math.round(((r.pct || 1) / max) * 100))}%"></i></i><em>${esc(r.value)}</em></div>`).join('');
  const ghosts = [62, 44, 30].map((w) => `<div class="fr gh"><b><s style="width:70px"></s></b><i><i style="width:${w}%"></i></i><em><s style="width:80px"></s></em></div>`).join('');
  return `<style>
.fh{position:absolute;left:50%;top:176px;transform:translateX(calc(-50% - 3px));width:1120px;text-align:center;font-size:64px;font-weight:600;line-height:1.12;letter-spacing:-.03em;color:#0A0A0B}
.sel{position:relative;display:inline-block;padding:2px 18px 8px;margin:0 0 0 4px;font-weight:600;${ANCHOR}}
.sel i{position:absolute;width:16px;height:16px;background:#3B86F0}
.sel .h1{left:-20px;top:-20px}.sel .h2{right:-20px;top:-20px}.sel .h3{left:-20px;bottom:-20px}.sel .h4{right:-20px;bottom:-20px}
.fc{position:absolute;left:50%;top:330px;transform:translateX(-50%);width:1120px;height:620px;padding:42px 52px 30px;border-radius:24px;background:#fff;box-sizing:border-box;box-shadow:0 30px 70px rgba(30,60,110,.15),0 0 0 1px rgba(20,26,38,.05)}
.fct{display:flex;align-items:center;gap:12px;margin-bottom:22px;font-size:22px;font-weight:500;color:#7F8794}.fct s{display:block;height:10px;width:90px;border-radius:5px;background:#EEF0F4;margin-left:auto}
.fr{display:grid;grid-template-columns:170px 1fr 280px;align-items:center;gap:16px;padding:14px 0}
.fr b{font-size:32px;font-weight:500;color:#141A26;white-space:nowrap}.fr em{font-style:normal;font-size:30px;color:#5D6675;text-align:right;white-space:nowrap}
.fr>i{height:18px;border-radius:9px;background:#EEF0F4;overflow:hidden}.fr>i>i{display:block;height:100%;border-radius:7px;background:#C9D3E0}
.fr.on b{color:#0A5FD8}.fr.on em{color:#0A5FD8;font-weight:600}.fr.on>i>i{background:linear-gradient(90deg,#3B86F0,#0A5FD8)}
.fr.gh{opacity:.45}.fr.gh s{display:inline-block;height:12px;border-radius:6px;background:#E3E7EE}.fr.gh em{display:flex;justify-content:flex-end}
</style>
<div class="fh">${head}</div>
<div class="fc"><div class="fct">${esc(spec.label || '')}<s></s></div>${real}${ghosts}</div>`;
}
// ---- Headline layouts (after Chatbase): versus/pills, versus/connect, versus/slash, versus/duo, dark ----
// Bold names or a big tight headline, all black #0A0A0B (white on the black fields); colour in a few clean shapes.
// Shapes use a near-solid vivid blue with a faint tonal drift and fine grain; dark's "color" (and duo's per-side "color") swaps in a brand hex.
const CB_BLUE = { stops: ['#0A6EF5', '#0F7DFF', '#1D8BFF', '#0B74FA'], light: '#45A2FF', dark: '#065FE0' };
const hexMix = (h, t, w) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - w) + parseInt(t.slice(i, i + 2), 16) * w).toString(16).padStart(2, '0')).join('');
const cbPal = (hex) => /^#[0-9a-f]{6}$/i.test(hex || '') ? { stops: [hexMix(hex, '#000000', 0.06), hex, hexMix(hex, '#ffffff', 0.1), hexMix(hex, '#000000', 0.04)], light: hexMix(hex, '#ffffff', 0.28), dark: hexMix(hex, '#000000', 0.14) } : CB_BLUE;
const cbRgb = (h) => [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));
// shape fill: smooth gradient + very soft light patches + faint ink veins + fine grain, clipped to the shape
const wcDefs = (id, P, seed = 3, ang = [0, 1, 1, 0]) => {
  const [lr, lg, lb] = cbRgb(P.light), [dr, dg, db] = cbRgb(P.dark);
  return `<linearGradient id="${id}g" x1="${ang[0]}" y1="${ang[1]}" x2="${ang[2]}" y2="${ang[3]}">${P.stops.map((c, i) => `<stop offset="${i / (P.stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>
<filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%">
<feTurbulence type="fractalNoise" baseFrequency=".0032 .0055" numOctaves="3" seed="${seed}" result="t1"/><feColorMatrix in="t1" type="matrix" values="0 0 0 0 ${lr}  0 0 0 0 ${lg}  0 0 0 0 ${lb}  0 0 0 -0.5 0.3" result="l"/><feComposite in="l" in2="SourceGraphic" operator="in" result="lm"/>
<feTurbulence type="fractalNoise" baseFrequency=".004 .006" numOctaves="3" seed="${seed + 7}" result="t2"/><feColorMatrix in="t2" type="matrix" values="0 0 0 0 ${dr}  0 0 0 0 ${dg}  0 0 0 0 ${db}  0 0 0 1.1 -0.62" result="d"/><feComposite in="d" in2="SourceGraphic" operator="in" result="dm"/>
<feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="9" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .14 0" result="ga"/><feComposite in="ga" in2="SourceGraphic" operator="in" result="gm"/>
<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="lm"/><feMergeNode in="dm"/><feMergeNode in="gm"/></feMerge></filter>`;
};
// headline markup: "\n" = line break. Headlines are all black (user), so old specs' {{key phrase}} marks are dropped, never styled
const cbHl = (t) => esc(t).replace(/\{\{|\}\}/g, '').replace(/\n/g, '<br>');
const cbFs = (t, max, width) => { const lines = String(t).replace(/\{\{|\}\}/g, '').split('\n'); const long = Math.max(...lines.map((l) => l.length)); return Math.min(max, Math.floor(width / (Math.max(long, lines.length > 1 ? 1 : long / 2.4) * 0.5))); };
const CB_CSS = `<style>.cbf{position:absolute;inset:0}.cbh{position:absolute;font-weight:500;letter-spacing:-.035em;line-height:1.02;color:#0A0A0B}
.ct{position:absolute;background:#fff;display:grid;place-items:center;overflow:hidden}.ct .lg{background:transparent;box-shadow:none;padding:0}.ct .lg:not(.full){border-radius:0;overflow:visible}
.ct:has(.lg.full) .lg{width:100%!important;height:100%!important;border-radius:0}</style>`;
const cbTile = (d, S, x, y, round = 0.22, label = '') => `<div class="ct" style="left:${x}px;top:${y}px;width:${S}px;height:${S}px;border-radius:${Math.round(S * round)}px;box-shadow:0 10px 26px rgba(10,40,120,.12)">${logo(d, Math.round(S * 0.62), label)}</div>`;
// White frame: a white design always sits in a white rounded panel inset 28px on a light-grey frame,
// so the featured image reads as its own block on a white blog page. Inner content keeps canvas coordinates.
const cbFramed = (inner) => `<div class="cbf" style="background:#F2F2F3"></div><div style="position:absolute;left:28px;top:28px;right:28px;bottom:28px;border-radius:28px;background:#fff;overflow:hidden"><div style="position:absolute;left:-28px;top:-28px;width:1600px;height:900px">${inner}</div></div>`;

// "versus/pills": grey canvas, two white panels; two blue pills face each other with the logos at the tips; the headline below
// (a question by default). The pills are always the site blue (design rule), never a brand colour.
// pills surface (user reference): a smooth tonal gradient toward the tip, one soft highlight and fine noise; no watercolour blotches
const pillDefs = (id, P, flip) => `<linearGradient id="${id}g" x1="${flip ? 1 : 0}" y1="0" x2="${flip ? 0 : 1}" y2="0"><stop offset="0" stop-color="${P.dark}"/><stop offset=".6" stop-color="${P.stops[1]}"/><stop offset="1" stop-color="${P.stops[2]}"/></linearGradient>
<radialGradient id="${id}h" cx="${flip ? 0.32 : 0.68}" cy=".18" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.17"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
function cbVersusPills() {
  const L = spec.left, R = spec.right, P = CB_BLUE;   // as measured on the user's reference: pills bleed off the outer edges (flat cuts), 196px tall, rounded tips 112px apart (57% of the height); logos centred in the tips
  const head = spec.headline || `${L.label} or\n${R.label}?`, fs = cbFs(head, 108, 1300);   // the headline is all black, no blue phrase (user)
  return `${CB_CSS}<div class="cbf" style="background:#F2F2F3"></div>
<div style="position:absolute;left:28px;right:28px;top:28px;height:380px;border-radius:28px;background:#fff;overflow:hidden">
<svg width="1544" height="380" style="position:absolute;inset:0"><defs>${pillDefs('va', P, false)}${pillDefs('vb', P, true)}</defs>
${[['va', -240], ['vb', 828]].map(([k, x]) => ['g', 'h'].map((f) => `<rect x="${x}" y="92" width="956" height="196" rx="98" fill="url(#${k}${f})"/>`).join('') + `<rect x="${x}" y="92" width="956" height="196" rx="98" fill="#fff" filter="url(#${k}n)"/>`).join('')}</svg>
${cbTile(L.logo, 140, 548, 120, 0.5, L.label)}${cbTile(R.logo, 140, 856, 120, 0.5, R.label)}</div>
<div style="position:absolute;left:28px;right:28px;top:436px;bottom:28px;border-radius:28px;background:#fff;display:grid;place-items:center">
<div class="cbh" style="position:static;font-size:${fs}px;text-align:center">${cbHl(head)}</div></div>`;
}

// "dark": black field; top-left the product's own icon recoloured to #0A0A0B on a white tile (never the site mark), tag pill, white headline; right = a panel in the brand colour with the white logo
function cbDark() {
  // top-left: the product's own icon on a white tile (user reference), never the site mark; the icon is recoloured to the field's black #0A0A0B
  // Inter 500 runs ~0.56em per character: size so the longest line fits the 620px column (cbFs underestimated it and lines wrapped)
  const longest = Math.max(...String(spec.headline).replace(/\{\{|\}\}/g, '').split('\n').map((l) => l.length));
  const P = cbPal(spec.color || '#2A74FB'), fs = Math.min(112, Math.floor(620 / (longest * 0.56))), d = spec.panelLogoUrl || spec.panelLogo;
  return `${CB_CSS}<div class="cbf" style="background:#0A0A0B"></div>${d ? cbTile(d, 96, 120, 90, 0.24, spec.product || '').replace(/box-shadow:[^"]*/, 'box-shadow:none').replace('<img ', '<img data-white="#0A0A0B" ') : ''}
<div style="position:absolute;left:120px;bottom:110px;width:620px">
${spec.tag ? `<div style="display:inline-flex;align-items:center;gap:14px;padding:16px 30px;border-radius:999px;border:1.5px solid #2A2A2E;color:#D4D4D8;font-size:30px;font-weight:500;margin-bottom:36px"><i style="width:14px;height:14px;border-radius:50%;background:${P.stops[2]};display:block"></i>${esc(spec.tag)}</div>` : ''}
<div class="cbh" style="position:static;font-size:${fs}px;font-weight:500;letter-spacing:-.035em;color:#fff">${cbHl(spec.headline)}</div></div>
<div style="position:absolute;left:860px;top:28px;right:28px;bottom:28px;border-radius:28px;overflow:hidden">
<svg width="712" height="844" style="position:absolute;inset:0"><defs>${wcDefs('dk', P, 5, [0, 0, 1, 1])}</defs><rect width="712" height="844" fill="url(#dkg)" filter="url(#dkf)"/></svg>
<div style="position:absolute;inset:0;display:grid;place-items:center">${d ? whiteMark(d, spec.product || '', 190) : ''}</div></div>${WM_CSS}${WHITE_MARK_JS}`;
}


// "versus/connect": a centred black headline, a divider with a sparkle, two tiles that are each brand's own app icon (original colours,
// edge to edge) linked by thin wavy strands to a white VS circle; small dot patches top-left and top-right.
function cbVersusConnect() {
  // the headline sits on ONE line (user: "2 lines looks visually off"), centred above the divider; only a pair too long to read
  // on one line (under 72px) breaks onto two, which then sits at the top and stays clear of the corner dot patches (900 wide)
  const L = spec.left, R = spec.right, head0 = spec.headline || `${L.label} vs ${R.label}`, one = head0.replace(/\s*\n\s*/g, ' ');
  const fs1 = cbFs(one, 96, 1080), single = fs1 >= 72;   // 1080 wide at most, the approved headline's width (QA: 1200 ran past x 210-1390)
  const head = single ? one : (head0.includes('\n') ? head0 : `${L.label} vs\n${R.label}`), fs = single ? fs1 : cbFs(head, 104, 900);
  const hTop = Math.round(245 - (single ? 1 : 2) * fs * 0.51);   // centred above the divider either way
  const S = 240, cy = 620, lx = 330, rx = 1270, cr = 74;
  const dots = (x0) => { let d = ''; for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) d += `<circle cx="${x0 + c * 22}" cy="${70 + r * 22}" r="2.6"/>`; return d; };
  const wave = (x1, x2, a, ph) => { const k = (x2 - x1) * 0.42; return `M${x1} ${cy} C ${x1 + k} ${cy - a * ph}, ${x2 - k} ${cy + a * ph}, ${x2} ${cy}`; };   // one long gentle S per strand; the pair crosses mid-way
  const le = lx + S / 2 + 10, re = rx - S / 2 - 10;
  // the headline is all black; each tile is the brand's own app icon, edge to edge (falls back to a white tile only under --force)
  const iconTile = (k, d, x, y) => CONNECT_ICON[k] ? `<div class="ct" style="left:${x}px;top:${y}px;width:${S}px;height:${S}px;border-radius:${Math.round(S * 0.24)}px;box-shadow:0 10px 26px rgba(10,40,120,.12)"><img src="${CONNECT_ICON[k]}" alt="${esc(d.label)}" style="width:100%;height:100%;object-fit:cover;display:block"></div>` : cbTile(d.logo, S, x, y, 0.24, d.label);
  const strands = [wave(le, 800 - cr, 34, 1), wave(le, 800 - cr, 34, -1), wave(800 + cr, re, 34, 1), wave(800 + cr, re, 34, -1)].map((d) => `<path d="${d}"/>`).join('');
  return `${CB_CSS}<style>.bt2{background:linear-gradient(90deg,#1E88F5,#0F6FE0 60%,#2E6BFF);-webkit-background-clip:text;background-clip:text;color:transparent}</style>
${cbFramed(`<div style="position:absolute;inset:0;background:radial-gradient(60% 45% at 50% 82%,rgba(47,123,255,.09),transparent 70%)"></div>
<svg width="1600" height="900" style="position:absolute;inset:0">
${spec.cornerDots === false ? '' : `<g fill="#C3CAD8">${dots(96)}${dots(1350)}</g>`}
<g stroke="#9DB8F2" stroke-width="2" fill="none" stroke-linecap="round">${strands}</g>
<g fill="#fff" stroke="#9DB8F2" stroke-width="2.5"><circle cx="${le}" cy="${cy}" r="8"/><circle cx="${re}" cy="${cy}" r="8"/></g>
<g stroke="#9DB8F2" stroke-width="2"><line x1="590" y1="372" x2="770" y2="372"/><line x1="830" y1="372" x2="1010" y2="372"/></g>
<path d="M800 356 C802 368 804 370 816 372 C804 374 802 376 800 388 C798 376 796 374 784 372 C796 370 798 368 800 356Z" fill="#2F6BFF"/></svg>
<div class="cbh" style="left:0;right:0;top:${hTop}px;text-align:center;font-size:${fs}px${single ? ';white-space:nowrap' : ''}">${cbHl(head)}</div>
${iconTile('left', L, lx - S / 2, cy - S / 2)}${iconTile('right', R, rx - S / 2, cy - S / 2)}
<div style="position:absolute;left:${800 - cr}px;top:${cy - cr}px;width:${cr * 2}px;height:${cr * 2}px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 12px 30px rgba(47,90,200,.16),0 0 0 1px rgba(47,90,200,.08)"><b class="bt2" style="font-size:46px;font-weight:500;letter-spacing:-.03em">VS</b></div>`)}`;
}

// "versus/slash": black field with a fine dot grid, the two names in heavy caps
// (a coloured part each), a big italic VS with a glowing diagonal streak. The {{ }} part of each label takes that side's colour.
// versus/slash names are always two-tone, white + the brand colour (user reference). Returns the name with the coloured part
// in {{ }}, or null when it can't be split without guessing: {{ }} given (some white must remain) -> as given;
// several words -> the last word coloured, on its own line; one word -> split at its last capital break (AdvancedMD -> Advanced{{MD}}).
const slashSplit = (t) => {
  const s = String(t || '').trim();
  if (/\{\{/.test(s)) return s.replace(/\{\{[\s\S]*?\}\}/g, '').replace(/\s/g, '') ? s : null;
  if (/\s/.test(s)) return s.replace(/^([\s\S]*\S)\s+(\S+)$/, '$1\n{{$2}}');
  const m = s.match(/^(.*[a-z0-9])([A-Z][\s\S]*)$/) || s.match(/^(.*[A-Za-z])(\d[\s\S]*)$/);
  return m ? `${m[1]}{{${m[2]}}}` : null;
};
function cbVersusSlash() {
  const L = spec.left, R = spec.right;
  const split = (t) => slashSplit(t) || `{{${t}}}`;   // null only under --force (refused before rendering otherwise)
  const name = (t, col) => esc(split(t)).replace(/\{\{([\s\S]+?)\}\}/g, `<span style="color:${col}">$1</span>`).replace(/\n/g, '<br>');
  const longest = Math.max(...[L.label, R.label].flatMap((t) => split(t).replace(/\{\{|\}\}/g, '').split('\n')).map((l) => l.length));
  const fs = Math.min(104, Math.floor(500 / (longest * 0.88)));   // Poppins 800 caps run ~0.88em per letter; names stay inside x 210-1390
  const lc = L.color || '#3D5BFF', rc = R.color || '#2BB673';
  return `<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,800;1,800&display=swap" rel="stylesheet">
<div style="position:absolute;inset:0;background:#050507"></div>
<div style="position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.22) 1.4px,transparent 1.9px);background-size:26px 26px;-webkit-mask-image:radial-gradient(62% 70% at 50% 50%,transparent 38%,#000 100%);mask-image:radial-gradient(62% 70% at 50% 50%,transparent 38%,#000 100%)"></div>
<svg width="1600" height="900" style="position:absolute;inset:0"><defs><linearGradient id="sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7B4DFF" stop-opacity="0"/><stop offset=".5" stop-color="#8F6BFF"/><stop offset="1" stop-color="#3D5BFF" stop-opacity="0"/></linearGradient>
<filter id="gl"><feGaussianBlur stdDeviation="6"/></filter></defs>
<line x1="880" y1="250" x2="720" y2="650" stroke="url(#sl)" stroke-width="10" filter="url(#gl)"/><line x1="880" y1="250" x2="720" y2="650" stroke="url(#sl)" stroke-width="3"/></svg>
<div style="position:absolute;left:800px;top:450px;transform:translate(-50%,-50%) skewX(-10deg);font:italic 800 132px/1 Poppins,Inter,sans-serif;color:#fff;letter-spacing:-.06em">VS</div>
<div style="position:absolute;left:210px;width:520px;top:450px;transform:translateY(-50%);text-align:center;font:800 ${fs}px/1.02 Poppins,Inter,sans-serif;color:#fff;text-transform:uppercase;letter-spacing:-.01em">${name(L.label, lc)}</div>
<div style="position:absolute;left:870px;width:520px;top:450px;transform:translateY(-50%);text-align:center;font:800 ${fs}px/1.02 Poppins,Inter,sans-serif;color:#fff;text-transform:uppercase;letter-spacing:-.01em">${name(R.label, rc)}</div>`;
}

// shared: turn panel marks white (used by versus/duo and dark)
const WHITE_MARK_JS = `<script>
// recolour each mark (white, or the hex in data-white): estimate the background from the corners, keep the ink as alpha
function duoWhite(img){if(img.dataset.done)return;img.dataset.done=1;try{const hx=img.dataset.white,C=hx[0]==='#'?[1,3,5].map((k)=>parseInt(hx.slice(k,k+2),16)):[255,255,255];const w=img.naturalWidth,h=img.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(img,0,0);
const id=x.getImageData(0,0,w,h),d=id.data,px=(a,b)=>(b*w+a)*4,cs=[[1,1],[w-2,1],[1,h-2],[w-2,h-2]].map(([a,b])=>d.subarray(px(a,b),px(a,b)+4));
const opaque=cs.every((p)=>p[3]>200),bg=opaque?[0,1,2].map((k)=>cs.reduce((s,p)=>s+p[k],0)/4):null;
for(let i=0;i<d.length;i+=4){let a=d[i+3]/255;if(bg){const dist=(Math.hypot(d[i]-bg[0],d[i+1]-bg[1],d[i+2]-bg[2])-45)/110;a=Math.max(0,Math.min(1,dist))*a;}else{const lum=(d[i]+d[i+1]+d[i+2])/765;a=a*(lum>0.92?0:1);}
d[i]=C[0];d[i+1]=C[1];d[i+2]=C[2];d[i+3]=Math.round(a*255);}
x.putImageData(id,0,0);let x0=w,y0=h,x1=-1,y1=-1;for(let b=0;b<h;b++)for(let a=0;a<w;a++)if(d[(b*w+a)*4+3]>40){if(a<x0)x0=a;if(a>x1)x1=a;if(b<y0)y0=b;if(b>y1)y1=b;}
if(x1<0){img.src=c.toDataURL('image/png');return;}const cw=x1-x0+1,ch=y1-y0+1,o=document.createElement('canvas');o.width=cw;o.height=ch;o.getContext('2d').drawImage(c,x0,y0,cw,ch,0,0,cw,ch);img.src=o.toDataURL('image/png');if(!img.closest('.wm'))return;
if(cw/ch>2.2&&cw<300){const box=img.closest('.wm');box.style.display='none';const nm=box.nextElementSibling;if(nm){nm.style.fontSize='88px';nm.style.fontWeight='500';nm.style.letterSpacing='-.03em';}return;}
if(cw/ch>2.2){const box=img.closest('.wm');box.style.width='380px';img.style.maxWidth='380px';img.style.width='360px';img.style.height='auto';img.style.maxHeight='120px';const nm=box.nextElementSibling;if(nm)nm.style.display='none';}}catch(e){}}
document.querySelectorAll('img[data-white]').forEach((im)=>{const go=()=>duoWhite(im);if(im.complete&&im.naturalWidth)go();else im.addEventListener('load',go,{once:true});});
</script>`;
const WM_CSS = `<style>.wm .lg{background:transparent!important;box-shadow:none!important;padding:0!important;width:auto!important;height:110px!important;overflow:visible}.wm .lg img{width:auto;max-width:200px;height:110px;object-fit:contain}.wm .lg.full{border-radius:0}</style>`;
const whiteMark = (d, label, size = 110) => `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px"><span class="wm" style="width:200px;height:${size + 10}px;display:grid;place-items:center">${logo(d, size, label).replace('<img ', '<img data-white="1" ')}</span><b style="font-size:46px;font-weight:500;letter-spacing:-.02em;color:#fff">${esc(label)}</b></div>`;
// "versus/duo" (user reference, Chatbase "Zendesk and Zendesk Sunshine"): black field, tag pill and a big Inter 500 Medium white
// headline top-left (no site mark); two watercolour panels below, each in that brand's own colour (or the subtle blue),
// carrying the brand's mark in white plus its name. The mark is turned white in the page: background removed, ink kept as alpha.
function cbVersusDuo() {
  const L = spec.left, R = spec.right, head = spec.headline || `${L.label} vs\n${R.label}`, fs = cbFs(head, 116, 1100);
  const panel = (d, i, x) => {
    const P = d.color ? cbPal(d.color) : CB_BLUE;
    return `<div style="position:absolute;left:${x}px;top:520px;width:756px;height:352px;border-radius:24px;overflow:hidden">
<svg width="756" height="352" style="position:absolute;inset:0"><defs>${wcDefs('du' + i, P, 5 + i * 6, [0, 0, 1, 1])}</defs><rect width="756" height="352" fill="url(#du${i}g)" filter="url(#du${i}f)"/></svg>
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px">
<span class="wm" style="width:200px;height:120px;display:grid;place-items:center">${logo(d.logo, 110, d.label).replace('<img ', '<img data-white="1" ')}</span>
<b style="font-size:46px;font-weight:500;letter-spacing:-.02em;color:#fff">${esc(d.label)}</b></div></div>`;
  };
  return `${CB_CSS}<style>.wm .lg{background:transparent!important;box-shadow:none!important;padding:0!important;width:auto!important;height:110px!important;overflow:visible}.wm .lg img{width:auto;max-width:200px;height:110px;object-fit:contain}.wm .lg.full{border-radius:0}</style>
<div class="cbf" style="background:#0A0A0B"></div>
${spec.tag ? `<div style="position:absolute;left:96px;top:90px;display:inline-flex;align-items:center;gap:14px;padding:14px 28px;border-radius:999px;border:1.5px solid #2A2A2E;color:#D4D4D8;font-size:30px;font-weight:500"><i style="width:14px;height:14px;border-radius:50%;background:#F472B6;display:block"></i>${esc(spec.tag)}</div>` : ''}
<div class="cbh" style="left:96px;top:${spec.tag ? 190 : 110}px;width:1180px;font-size:${fs}px;font-weight:500;letter-spacing:-.035em;color:#fff">${cbHl(head)}</div>
${panel(L, 0, 28)}${panel(R, 1, 816)}
${WHITE_MARK_JS}`;
}

// "logotype" (user reference: the Grok lockup): a single product's full BLACK logo lockup (icon + wordmark), large and centred on
// the cream field with a faint square grid. No other text: the logo's own typography is the image. Only for black logos with strong
// typography ("LOGOTYPE CHECK FAILED" otherwise); single-product articles with a coloured logo use "dark".
function logotype() {
  const L = LOGOTYPE, grid = `<style>.lgt-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(60,50,40,.10) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(60,50,40,.10) 1.5px,transparent 1.5px);background-size:120px 120px;background-position:-20px -10px}</style><div class="lgt-grid"></div>`;
  if (L.lockup) return `${grid}<img src="${L.lockup}" alt="${esc(spec.product || '')}" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:1120px;max-height:380px">`;
  // the icon sits on a black rounded tile slightly taller than the wordmark (an icon that is already a tile keeps its own)
  const hw = Math.min(240, 1040 / (1.1 * 1.32 + L.aspect)), t = Math.round(hw * 1.1);
  const tile = L.tile ? `<img src="${L.icon}" alt="" style="height:${t}px;width:auto;display:block">`
    : `<div style="width:${t}px;height:${t}px;border-radius:${Math.round(t * 0.22)}px;background:#0A0A0A;display:grid;place-items:center"><img src="${L.icon}" alt="" style="max-width:${Math.round(t * 0.62)}px;max-height:${Math.round(t * 0.62)}px;display:block"></div>`;
  return `${grid}<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:${Math.round(t * 0.32)}px">${tile}<img src="${L.word}" alt="${esc(spec.product || '')}" style="height:${Math.round(hw)}px;width:auto;display:block"></div>`;
}

// ---- Gumloop-style layouts (user references, Oct 2026) ----
// Comparison: versus/type (big bold names, small "vs", the second name in the accent), versus/tiles (two tilted app tiles over a big
// "A vs B" headline), versus/glass (wordmark vs wordmark on a frosted bar over a mesh gradient); versus/frost and versus/bento are below.
// Content: swap (A, dashed loop arrow, B with a soft glow), badge (logo or title, a big figure in a tinted box, a muted + bold line).
// "field": "light" (white in the grey frame), "black" or "blue" (deep dunes), only where the user approved it (GL_FIELD_FIT);
// black and blue count as vibrant.
// Logos are the brand's full wordmark (icon + typography) where it has one; a brand without one is typeset in Inter.
// Fields the user approved per layout (review, Oct 2026), default first. Anything else is refused ("FIELD FIT FAILED").
// Deleted in the approved review (Oct 2026): type on blue, tiles on black, swap on black.
// Rejected: badge on blue, glass on blue, versus/type on black (asked for once in batch 4, then "different layout"), versus/frost on the
// blue mesh, versus/bento on black (light won).
const GL_FIELD_FIT = { 'versus/bento': ['light'], 'versus/frost': ['light'], 'versus/type': ['light'], 'versus/tiles': ['blue', 'light'], 'versus/glass': ['light', 'black'], 'swap/default': ['light'], 'badge/default': ['light'] };
const GL_FIT = GL_FIELD_FIT[LAYOUT];
// "bgPick": true = the user picked this image's background ("bg") himself (the bg-picks review, Oct 2026): it skips the background fit
// checks (BG_FIT, BLUE_FIT and the canvas refusal; a picked "blue" has its own list, BLUE_PICK), and a layout that draws its canvas
// with glCanvas drops that canvas so the picked field shows (its ink follows the field: light, or white on "blue").
// Light fields: sky, paper, cream, g5, soft, white, glow, mesh; vibrant: blue.
const BG_PICK = spec.bgPick === true && spec.bg != null;
const GL_FIELD = BG_PICK ? (spec.bg === 'blue' ? 'blue' : 'light') : GL_FIT && GL_FIT.includes(spec.field) ? spec.field : GL_FIT ? GL_FIT[0] : 'light';
// The Gumloop layouts and the Originals (receipt, definition, shortlist, lineup) paint their own canvas (GL_LAYOUTS), and so do the
// Chatbase headline layouts (white in a grey frame, or black): CB_LAYOUT (lists in layouts.mjs). 'dark' counts as vibrant.
const CB_LAYOUT = MODE === 'dark' || CB_LAYOUTS.includes(LAYOUT);
// "field" picks a Gumloop layout's canvas, and prompt takes "soft" (its calmer glow); anywhere else it would do nothing, so it is refused
if (spec.field != null && !(GL_FIT ? GL_FIT.includes(spec.field) : LAYOUT === 'prompt/default' && spec.field === 'soft') && !force) {
  console.error(GL_FIT ? `FIELD FIT FAILED: ${LAYOUT} doesn't use the "${spec.field}" field. Use ${GL_FIT.map((f) => `"${f}"`).join(' or ')}, or leave "field" out.`
    : LAYOUT === 'prompt/default' ? `FIELD FIT FAILED: prompt takes only "field": "soft" (or no "field").`
    : `FIELD FIT FAILED: ${LAYOUT} has no "field" option (only ${Object.keys(GL_FIELD_FIT).join(', ')} have one, and prompt's "soft"). Remove "field".`);
  process.exit(2);
}
// "bg" sets the card layouts' field; a layout that paints its own canvas would ignore it, so it is refused there. prompt paints its
// own full field too (its calmer glow is "field": "soft"), and frostrow its own light mesh, so they count as a canvas here: CANVAS
// (CANVAS_LAYOUTS in layouts.mjs)
const CANVAS = CANVAS_LAYOUTS.includes(LAYOUT);
// The backgrounds: light = BGS, vibrant = "blue" (the deep dunes).
const BGS = ['sky', 'paper', 'cream', 'g5', 'soft', 'white', 'glow', 'mesh'];
// a picked bg shows only where the canvas can step aside (glCanvas layouts, PICK_CANVAS in layouts.mjs); the others paint a full
// canvas of their own over it
// a picked "blue" only behind layouts whose text all sits in a white card: the approved blue layouts (BLUE_FIT below), versus/checks,
// picks and stack (every word in their white card), and versus/tiles, whose own approved field is blue. Anywhere else (logotype
// included) text sits straight on the field, where the blue drowns it.
const BLUE_PICK = ['checklist/default', 'versus/table', 'window/default', 'before-after/flow', 'versus/checks', 'versus/tiles', 'picks/default', 'stack/default', 'versus/fan'];
// why this layout can't take "bg" as a pick (null = it can); the picker (scripts/bgpick.mjs) asks for the list with --pick-fields
const pickRefusal = (bg) => CANVAS && !PICK_CANVAS.includes(LAYOUT) ? `${LAYOUT} paints its own full canvas, so a picked "bg" would never show. Remove "bg" and "bgPick" (a picked field works on the card layouts and on ${PICK_CANVAS.join(', ')}).`
  : bg === 'blue' && !BLUE_PICK.includes(LAYOUT) ? `blue only behind layouts whose text all sits in a white card (${BLUE_PICK.join(', ')}). Pick a light field (${BGS.join(', ')}).`
  : MODE === 'checklist' && bg !== 'blue' ? 'the checklist goes on the vibrant "blue" only (its light field was deleted in review).'
  : MODE === 'ranges' && spec.bare === true && bg !== 'white' ? 'ranges "bare" (no card behind the bars) goes on the white field only: light grey tracks need a white card on any tinted field (drop "bare" for another field).'
  : null;
// --pick-fields: print the fields this spec's layout takes as a pick and stop (nothing is checked further, rendered or recorded)
if (args.includes('--pick-fields')) { console.log(`PICK FIELDS ${[...BGS, 'blue'].filter((b) => !pickRefusal(b)).join(' ') || 'none'}`); process.exit(0); }
const pickWhy = spec.bgPick == null || force ? null
  : spec.bgPick !== true || spec.bg == null ? `"bgPick": true marks the user's own pick of "bg", so it needs a "bg" (and only true is valid).`
  : pickRefusal(spec.bg);
if (pickWhy) { console.error(`BACKGROUND PICK FAILED: ${pickWhy}`); process.exit(2); }
// ranges "bare" drops the white card behind the bars (the user, Oct 20 2026: "dont add container for bars section"), approved on the
// white field only; on a tinted field the light grey tracks still need their white card (Visual QA, b8)
if (MODE === 'ranges' && spec.bare === true && !(BG_PICK && spec.bg === 'white') && !force) { console.error('BACKGROUND CHECK FAILED: ranges "bare" (no card behind the bars) goes on the white field only: add "bg": "white", "bgPick": true, or drop "bare" (the light grey tracks need their white card on any tinted field).'); process.exit(2); }
if (spec.bg != null && CANVAS && !force && !BG_PICK) {
  console.error(`BACKGROUND CHECK FAILED: ${LAYOUT} paints its own canvas, so "bg" does nothing here. Remove "bg"${GL_FIT && GL_FIT.length > 1 ? ` (its canvas is picked with "field": ${GL_FIT.map((f) => `"${f}"`).join(' or ')})` : LAYOUT === 'prompt/default' ? ' (its calmer field is picked with "field": "soft")' : ''}.`);
  process.exit(2);
}
// patterns stay faint (user: "pattern is too much"): the dot grid is sparse and light; the "+" grid is approved as is.
// Palettes for the fields glCanvas paints: light, and blue (versus/tiles). versus/glass paints its own mesh, black included.
const glPal = () => ({
  light: { bg: '#FFFFFF', ink: '#0A0A0B', mute: '#8A8F98', mark: 'rgba(20,26,38,.20)', dot: 'rgba(20,26,38,.10)', acc: 'linear-gradient(180deg,#3B86F0,#0A5FD8)', glow: 'rgba(47,123,255,.20)' },
  blue: { bg: `${BLUE_GLOW} center/cover`, ink: '#FFFFFF', mute: 'rgba(255,255,255,.72)', mark: 'rgba(255,255,255,.30)', dot: 'rgba(255,255,255,.13)', acc: 'linear-gradient(180deg,#FFFFFF,#BFE0FF)', glow: 'rgba(255,255,255,.26)' },
})[GL_FIELD];
const glPlus = (c, step = 180, ox = 70, oy = 45, mask = '') => { let p = ''; for (let y = oy; y < 900; y += step) for (let x = ox; x < 1600; x += step) p += `M${x - 8} ${y}h16M${x} ${y - 8}v16`; return `<svg width="1600" height="900" style="position:absolute;inset:0;${mask}"><path d="${p}" stroke="${c}" stroke-width="2"/></svg>`; };
// an edge-only pattern: visible around the edges, clear behind the content (shortlist's "+" grid, lineup's dots; first learned on the
// dark fields: "too dark, light it, shouldn't be in the whole image", then "literally not visible" when it was faded instead of brightened)
const GL_EDGE_MASK = '-webkit-mask-image:radial-gradient(70% 75% at 50% 50%,transparent 35%,#000 100%);mask-image:radial-gradient(70% 75% at 50% 50%,transparent 35%,#000 100%)';
const glDots = (c, step = 26, r = 1.7) => `<div class="cbf" style="background-image:radial-gradient(circle,${c} ${r}px,transparent ${r + 0.6}px);background-size:${step}px ${step}px;background-position:${step / 2}px ${step / 2}px"></div>`;
let glN = 0;
const glBg = (css) => { const k = 'glb' + (++glN); return `<style>.${k}{${css}}</style><div class="cbf ${k}"></div>`; };
const glCanvas = (inner, pattern = 'plus') => {
  const P = glPal(), pat = pattern === 'plus' ? glPlus(P.mark) : pattern === 'dots' ? glDots(P.dot, 36, 1.4) : '';
  if (BG_PICK) return `${CB_CSS}${inner}`;   // the user's chosen field shows through (BG_CSS)
  if (GL_FIELD === 'light') return `${CB_CSS}${cbFramed(`${pat}${inner}`)}`;
  // the vibrant blue field (versus/tiles), with heavy grain
  return `${CB_CSS}${glBg(`background:${P.bg}`)}${glBg(`background-image:${NOISE};background-size:320px;mix-blend-mode:overlay;opacity:.85`)}${pat}${inner}`;
};
// the type size a label gets on its own (glMark); swap passes the smaller of its two labels so both sides always match
const glTextFs = (label, maxW, maxH) => { const t = glBreak(label); return Math.min(t.includes('\n') ? 112 : maxH * 0.86, Math.floor(maxW / (Math.max(...t.split('\n').map((l) => l.length)) * 0.56))); };
// a wordmark sized by visual area so two marks of different shapes balance, in its original colours; a brand without one is typeset
// in Inter, in the field's ink (or "ink": versus/glass always sets it black on its white bar)
const glMark = (side, area, maxW, maxH, fsShared = 0, ink = '') => {
  const W = WORDMARK[side.logo || ''];
  if (!W) { const t = glBreak(side.label), fs = fsShared || glTextFs(side.label, maxW, maxH); return `<span style="font-size:${Math.round(fs)}px;font-weight:700;letter-spacing:-.045em;line-height:1.02;text-align:center;white-space:nowrap;color:${ink || glPal().ink}">${esc(t).replace(/\n/g, '<br>')}</span>`; }
  let h = Math.sqrt(area / W.aspect), w = W.aspect * h;
  if (w > maxW) { w = maxW; h = w / W.aspect; }
  if (h > maxH) { h = maxH; w = h * W.aspect; }
  return `<img src="${W.uri}" alt="" style="width:${Math.round(w)}px;height:${Math.round(h)}px;display:block;flex:none">`;
};
const glBreak = (t) => { t = String(t); if (t.length <= 11 || !/\s/.test(t)) return t; const sp = [...t.matchAll(/\s/g)].map((m) => m.index); const i = sp.reduce((b, k) => Math.abs(k - t.length / 2) < Math.abs(b - t.length / 2) ? k : b); return t.slice(0, i) + '\n' + t.slice(i + 1); };
const glFs = (t, max, width, k = 0.56) => Math.min(max, Math.floor(width / (Math.max(...String(t).split('\n').map((l) => l.length)) * k)));

function glType() {
  const L = spec.left, R = spec.right, P = glPal(), sep = spec.separator || 'vs';
  const ll = L.label.length, rl = R.label.length;
  let fs = Math.min(140, Math.floor(1020 / ((ll + rl) * 0.62)));
  const stacked = fs < 88;
  if (stacked) fs = Math.min(128, Math.floor(1080 / (Math.max(ll, rl) * 0.62)));
  const acc = R.color ? `color:${R.color}` : `background:${P.acc};-webkit-background-clip:text;background-clip:text;color:transparent`;
  const name = (t, st) => `<span style="font-size:${fs}px;font-weight:700;letter-spacing:-.045em;line-height:1.08;white-space:nowrap;${st}">${esc(t)}</span>`;
  const vs = `<span style="font-size:${Math.round(fs * 0.48)}px;font-weight:400;letter-spacing:-.01em;color:${P.ink};opacity:.85">${esc(sep)}</span>`;
  const flow = stacked ? `flex-direction:column;align-items:center;gap:${Math.round(fs * 0.1)}px` : `align-items:center;gap:${Math.round(fs * 0.5)}px`;
  return glCanvas(`<div style="position:absolute;left:210px;right:210px;top:0;bottom:0;display:flex;justify-content:center;${stacked ? 'flex-direction:column;align-items:center' : 'align-items:center'}"><div style="display:flex;${flow}">${name(L.label, `color:${P.ink}`)}${vs}${name(R.label, acc)}</div></div>`, 'plus');
}

function glTiles() {
  const L = spec.left, R = spec.right, P = glPal(), S = 236;
  const head = spec.headline || `${L.label} vs ${R.label}`, fs = glFs(head, 116, 1180, 0.55);
  const light = GL_FIELD === 'light';
  // each tile is the brand's own app icon in its brand colour, edge to edge (user); a white tile with a mark only under --force
  const tile = (d, x, rot, k) => `<div class="ct" style="left:${x}px;top:${spec.sub ? 128 : 150}px;width:${S}px;height:${S}px;border-radius:46px;transform:rotate(${rot}deg);box-shadow:${light ? '0 18px 40px rgba(20,40,90,.14)' : 'none'};outline:${light ? '0' : '7px solid rgba(255,255,255,.22)'}">${CONNECT_ICON[k] ? `<img src="${CONNECT_ICON[k]}" alt="${esc(d.label)}" style="width:100%;height:100%;object-fit:cover;display:block">` : logo(d.logo, Math.round(S * 0.6), d.label)}</div>`;
  const ring = `<div style="position:absolute;left:50%;top:52%;width:1240px;height:1240px;transform:translate(-50%,-50%);border-radius:50%;border:2px solid ${P.dot};background:radial-gradient(circle,${light ? 'rgba(47,123,255,.05)' : 'rgba(255,255,255,.07)'},transparent 70%)"></div>`;
  const top = spec.sub ? 448 : 480;
  return glCanvas(`${ring}${tile(L, 800 - S - 34, -9, 'left')}${tile(R, 834, 8, 'right')}
<div class="cbh" style="left:0;right:0;top:${top}px;text-align:center;font-size:${fs}px;font-weight:600;letter-spacing:-.035em;color:${P.ink}">${esc(head).replace(/\n/g, '<br>')}</div>
${spec.sub ? `<div style="position:absolute;left:0;right:0;top:${top + fs * 1.18 + 34}px;text-align:center;font-size:40px;font-weight:500;letter-spacing:-.01em;color:${P.ink};opacity:.85">${esc(spec.sub)}</div>` : ''}`, 'dots');
}

function glGlass() {
  const L = spec.left, R = spec.right;
  // balance (test round 3): match the LETTERING height of the two wordmarks (the type, not the icon: AdvancedMD's hummingbird is
  // twice its type), inside the ~790px the bar leaves after its padding, gaps and "vs", so the group stays centred in the bar
  // a near-square emblem with the name inside (e.g. CGM's sphere) is sized as an emblem, not as lettering: its letters are only ~half
  // its height, so it stands ~1.35x as tall as the wordmark (batch 4: tiny at lettering height, too heavy at 1.8x)
  const wm = (s) => { const w = WORDMARK[s.logo || ''] || { aspect: String(s.label).length * 0.6, text: 0.72 }; return w.aspect < 1.6 ? { ...w, text: 0.7 } : w; };
  const t = Math.min(96, 790 / (wm(L).aspect / wm(L).text + wm(R).aspect / wm(R).text), 150 * wm(L).text, 150 * wm(R).text);
  const hL = t / wm(L).text, hR = t / wm(R).text, H = Math.max(hL, hR);
  const areaL = wm(L).aspect * hL * hL, areaR = wm(R).aspect * hR * hR;
  const mesh = {
    black: `<rect width='1600' height='900' fill='#0A0A0B'/><g filter='url(#b)'><circle cx='240' cy='240' r='360' fill='#1D4ED8' fill-opacity='.75'/><circle cx='1380' cy='700' r='380' fill='#2F7BFF' fill-opacity='.55'/><circle cx='1180' cy='120' r='220' fill='#7CC8F8' fill-opacity='.35'/></g>`,
    light: `<rect width='1600' height='900' fill='#EEF5FF'/><g filter='url(#b)'><circle cx='160' cy='200' r='420' fill='#9CC6FF'/><circle cx='1480' cy='760' r='420' fill='#BFE6FF'/><circle cx='1300' cy='140' r='300' fill='#E4E8FF'/><circle cx='420' cy='820' r='300' fill='#DCEBFF'/></g>`,
  }[GL_FIELD];
  return `${CB_CSS}${glBg(`background:${svgBg(mesh, 110)} center/cover`)}${glBg(`background-image:${NOISE};background-size:320px;mix-blend-mode:overlay;opacity:${GL_FIELD === 'light' ? 0.35 : 0.7}`)}
<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:60px;padding:72px 84px;max-width:1180px;border-radius:48px;background:rgba(255,255,255,${{ light: 0.62, black: 0.93 }[GL_FIELD]});border:2px solid rgba(255,255,255,.75);backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);white-space:nowrap">
${glMark(L, areaL, 790, hL + 0.5, 0, '#0A0A0B')}<span style="font-size:92px;font-weight:300;color:#0A0A0B;line-height:1">${esc(spec.separator || 'vs')}</span>${glMark(R, areaR, 790, hR + 0.5, 0, '#0A0A0B')}</div>`;   // the bar stays inside x 210-1390 so the 7:5 card keeps its rounded ends
}

function glSwap() {
  const L = spec.left, R = spec.right, P = glPal();
  const glow = R.color ? `rgba(${[1, 3, 5].map((i) => parseInt(R.color.slice(i, i + 2), 16)).join(',')},0.22)` : P.glow;
  // both text labels share one size (user taste: parallel things get the same treatment); 520 wide keeps them inside x 210-1390
  const fsShared = !WORDMARK[L.logo || ''] && !WORDMARK[R.logo || ''] ? Math.min(glTextFs(L.label, 520, 150), glTextFs(R.label, 520, 150)) : 0;
  const item = (d, cx) => `<div style="position:absolute;left:${cx - 300}px;width:600px;top:470px;height:240px;display:grid;place-items:center">${glMark(d, 48000, 520, 150, fsShared)}</div>`;
  const arrow = `<svg width="1600" height="900" style="position:absolute;inset:0;overflow:visible"><defs><marker id="ah" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="5.4" markerHeight="5.4" orient="auto"><path d="M1 1 L11 6 L1 11 C3.5 7.5 3.5 4.5 1 1Z" fill="${P.ink}"/></marker></defs>
<path d="M596 452 C 622 384, 690 352, 742 364 C 800 378, 806 452, 764 458 C 718 465, 714 388, 776 340 C 850 284, 972 296, 1030 418" fill="none" stroke="${P.ink}" stroke-width="9" stroke-linecap="round" stroke-dasharray="20 17" marker-end="url(#ah)"/></svg>`;
  return glCanvas(`<div style="position:absolute;left:${1130 - 380}px;top:${575 - 330}px;width:760px;height:660px;border-radius:50%;background:radial-gradient(closest-side,${glow},transparent);filter:blur(16px)"></div>
${arrow}${item(L, 470)}${item(R, 1130)}`, 'plus');
}

function glBadge() {
  const P = glPal(), c = spec.color || '#2F7BFF';
  const box = { bg: hexMix(c, '#ffffff', 0.9), bd: hexMix(c, '#ffffff', 0.5), tx: hexMix(c, '#ffffff', 0.28) };   // the figure's box, tinted from "color"
  const top = spec.logo ? glMark({ logo: spec.logo, label: spec.title || '' }, 44000, 560, 130) : `<div style="font-size:${glFs(spec.title, 92, 1100, 0.55)}px;font-weight:700;letter-spacing:-.04em;line-height:1.05;color:${P.ink};text-align:center">${esc(spec.title)}</div>`;
  const vfs = glFs(spec.value, 168, 860, 0.6);
  const N = spec.note || {};
  // the note never runs wider than the value box (it would compete with the figure): its type shrinks to fit
  const valueW = String(spec.value).length * 0.6 * vfs + 128, noteChars = String(N.muted || '').length + String(N.strong || '').length + 1;
  const nfs = Math.max(40, Math.min(72, Math.floor((valueW * 0.92) / (noteChars * 0.55))));
  const note = N.muted || N.strong || N.logo ? `<div style="display:flex;align-items:center;gap:26px;font-size:${N.logo ? 72 : nfs}px;line-height:1"><span style="color:${P.mute};font-weight:400;letter-spacing:-.02em">${esc(N.muted || '')}</span>${N.logo ? glMark({ logo: N.logo, label: N.strong || '' }, 30000, 460, 100) : N.strong ? `<b style="font-weight:700;letter-spacing:-.045em;color:${P.ink}">${esc(N.strong)}</b>` : ''}</div>` : '';   // no empty <b>: it would take the gap and push a muted-only note off centre
  return glCanvas(`<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:68px">
${top}<div style="padding:22px 64px 30px;border-radius:44px;background:${box.bg};border:3px solid ${box.bd};font-size:${vfs}px;font-weight:600;letter-spacing:-.02em;line-height:1.1;color:${box.tx};white-space:nowrap">${esc(spec.value)}</div>${note}</div>`, 'dots');
}

// ---- Originals (Oct 2026, built on the user's approved taste: Inter, the site blue, brand colours, quiet patterns) ----
// receipt: a big headline on the left and a tilted white receipt on the right (zigzag tear at the bottom) listing the article's
// figures, with a bold "total" line. For cost and pricing articles.
function receipt() {
  const rows = spec.rows || [], T = spec.total || {}, fs = glFs(spec.headline, 84, 560, 0.55);   // 84 max, semibold: the receipt stays the hero (user)
  // row type fits the longest row (name + leader + value) inside the receipt with even margins
  const rfs = Math.min(36, Math.floor(430 / (Math.max(1, ...rows.map((r) => String(r.name).length + String(r.value).length)) * 0.56)));
  const zig = Array.from({ length: 21 }, (_, i) => `${i * 24},${i % 2 ? 0 : 18}`).join(' ');
  return `${CB_CSS}${glBg('background:#F4F1EA')}${glDots('rgba(90,70,40,.09)', 30, 1.3)}
<div class="cbh" style="left:210px;width:${(spec.receiptX || 800) - 240}px;${spec.place === 'top' ? 'top:236px' : spec.place === 'bottom' ? 'bottom:296px' : 'top:50%;transform:translateY(-50%)'};font-size:${fs}px;font-weight:600;letter-spacing:-.03em;line-height:1.08;color:#0A0A0B">${esc(spec.headline).replace(/\n/g, '<br>')}</div>
<div style="position:absolute;left:${spec.receiptX || 800}px;top:50%;width:${1390 - (spec.receiptX || 800)}px;transform:translateY(-50%) rotate(3deg)">
<div style="background:#fff;padding:56px 52px 40px;box-shadow:0 30px 60px rgba(90,70,40,.10)">
${spec.title ? `<div style="font-family:${MONO};font-size:26px;letter-spacing:.08em;text-transform:uppercase;color:#7F8794;text-align:center">${esc(spec.title)}</div><div style="border-top:2px dashed #D9D4CA;margin:26px 0"></div>` : ''}
${rows.map((r, ri) => `<div style="display:flex;align-items:baseline;gap:14px;font-size:${rfs}px;color:#3D4A5C;margin:0 0 24px"><span style="white-space:nowrap">${esc(r.name)}</span><i style="flex:1;min-width:48px;border-bottom:2px dotted #D9D4CA;transform:translateY(-6px)"></i><b style="font-weight:${spec.highlight === ri ? 700 : 600};color:${spec.highlight === ri ? '#0A5FD8' : '#141A26'};${spec.highlight === ri ? `font-size:${rfs + 6}px;` : ''}white-space:nowrap">${esc(r.value)}</b></div>`).join('')}
${T.value ? `<div style="border-top:2px dashed #D9D4CA;margin:26px 0 22px"></div><div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px"><span style="font-size:36px;font-weight:600;color:#141A26">${esc(T.label || '')}</span><b style="font-size:${Math.min(58, Math.floor(330 / (String(T.value).length * 0.62)))}px;font-weight:700;letter-spacing:-.02em;color:#0A5FD8;white-space:nowrap">${esc(T.value)}</b></div>` : ''}
</div><svg width="560" height="18" viewBox="0 0 480 18" preserveAspectRatio="none" style="display:block"><polygon points="0,0 ${zig} 480,0" fill="#fff"/></svg></div>`;
}
// definition: a dictionary-style entry for "what is" articles: the term in bold, its full form in mono, a short blue rule and a
// numbered one-line definition in the article's own words. White in the grey frame, with faint ruled lines.
function definition() {
  // the text sits ON the ruled lines, like writing on lined paper (QA: a rule through the x-height read as strikethrough). Every
  // block is a whole number of 64px rows; Inter's baseline sits ~52px into a 64px row (and on the 2nd rule of the 128px term row),
  // so the rules are drawn at blockTop + 52 + 64k.
  const fs = glFs(spec.term, 150, 1100, 0.56), R = 64;
  const rows = 2 + (spec.label ? 1 : 0) + 1 + 1, top = Math.round(450 - (rows * R) / 2), phase = (top + 52) % R;
  const ruled = `<div class="cbf" style="background-image:linear-gradient(rgba(20,26,38,.06) 2px,transparent 2px);background-size:100% ${R}px;background-position:0 ${phase}px"></div>`;
  return `${CB_CSS}${cbFramed(`${ruled}<div style="position:absolute;left:210px;right:210px;top:${top}px">
<div style="height:${2 * R}px;font-size:${fs}px;font-weight:700;letter-spacing:-.045em;line-height:${2 * R}px;color:#0A0A0B;white-space:nowrap">${esc(spec.term)}</div>
${spec.label ? `<div style="height:${R}px;line-height:${R}px;font-family:${MONO};font-size:30px;color:#7F8794">${esc(spec.label)}</div>` : ''}
<div style="height:${R}px;display:flex;align-items:center"><i style="display:block;width:120px;height:8px;border-radius:4px;background:linear-gradient(90deg,#3B86F0,#0A5FD8)"></i></div>
<div style="display:flex;gap:26px;align-items:baseline;max-width:1080px;line-height:${R}px"><b style="font-family:${MONO};font-size:34px;font-weight:500;color:#0A5FD8">1.</b><span style="font-size:52px;font-weight:400;letter-spacing:-.015em;color:#3D4A5C">${esc(spec.definition)}</span></div></div>`)}`;
}
// shortlist ("best X" lists, Oct 2026): a tilted white notepad on the LEFT (mirrored so it never echoes receipt), the headline on the right; punched top band, a faint
// margin rule) listing the products on ruled lines with mono numbers; an optional Phosphor "icon" on a blue sticker tile at the pad's
// bottom-right corner is the one blue anchor. The "+" grid only frames the edges (taste 4).
function shortlist() {
  const items = (spec.items || []).slice(0, 8), fs = glFs(spec.headline, 88, 510, 0.55);
  const longest = Math.max(...items.map((i) => String(i.name || i).length)), rfs = Math.min(40, Math.floor(330 / (longest * 0.56)));
  const holes = Array.from({ length: 9 }, () => '<i style="width:18px;height:18px;border-radius:50%;background:#F2F2F3;box-shadow:inset 0 2px 3px rgba(20,26,38,.18)"></i>').join('');
  const row = (it, k) => `<div style="height:66px;display:flex;align-items:center;gap:26px;border-bottom:2px solid #E8ECF2"><b style="font-family:${MONO};font-size:24px;font-weight:500;color:#9AA3B2;width:44px;flex:none">${String(k + 1).padStart(2, '0')}</b><span style="font-size:${rfs}px;font-weight:500;letter-spacing:-.02em;color:#141A26;white-space:nowrap">${esc(it.name || it)}</span>${it.logo ? `<span style="margin-left:auto">${logo(it.logo, 44, it.name)}</span>` : ''}</div>`;
  return glCanvas(`${glPlus('rgba(20,26,38,.20)', 180, 70, 45, GL_EDGE_MASK)}<div class="cbh" style="left:880px;width:510px;top:50%;transform:translateY(-50%);font-size:${fs}px;font-weight:600;letter-spacing:-.03em;line-height:1.06;color:#0A0A0B">${esc(spec.headline).replace(/\n/g, '<br>')}</div>
<div style="position:absolute;left:230px;top:50%;width:520px;transform:translateY(-50%) rotate(3deg);background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 30px 64px rgba(20,40,90,.13),0 0 0 1px rgba(20,26,38,.05)">
<div style="height:44px;background:#EEF1F6;display:flex;align-items:center;justify-content:space-around;padding:0 30px">${holes}</div>
<div style="position:relative;padding:22px 40px 34px 40px"><i style="position:absolute;left:92px;top:0;bottom:0;width:2px;background:rgba(10,95,216,.18)"></i>
${spec.title ? `<div style="height:86px;display:flex;align-items:center;gap:22px;border-bottom:2px solid #E8ECF2"><span style="font-family:${MONO};font-size:24px;letter-spacing:.08em;text-transform:uppercase;color:#7F8794">${esc(spec.title)}</span></div>` : ''}
${items.map(row).join('')}</div>${spec.icon ? `<div style="position:absolute;right:34px;bottom:40px;width:104px;height:104px;border-radius:30px;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;transform:rotate(8deg);box-shadow:0 14px 28px rgba(10,95,216,.26)"><i class="${esc(spec.icon)}" style="font-size:58px;color:#fff"></i></div>` : ''}</div>`, 'none');
}

// lineup ("best X" lists, user reference Oct 2026): one centred row of square logo tiles, evenly spaced (gap ~38% of a tile, logo ~70%
// of its tile, measured from the reference), white tiles on one frosted bar, on the approved glow field. No headline (the reference has
// none). 3-7 products (7 since the pediatric delivery, Oct 2026). (Each tile frosted, "glass": "tiles", and a watermark icon behind the row were rejected by the user.)
function lineup() {
  const items = (spec.cards || []).filter((c) => c.logo).slice(0, 7), n = items.length;
  const T = Math.min(180, Math.floor(1096 / (n + (n - 1) * 0.38))), G = Math.round(T * 0.38), PAD = Math.round(T * 0.26);
  const tile = (c) => `<div class="lut${c.fill ? ' fill' : ''}" style="width:${T}px;height:${T}px;border-radius:${Math.round(T * 0.09)}px;overflow:hidden;display:grid;place-items:center;flex:none;background:#fff;box-shadow:0 10px 24px rgba(20,50,120,.10)">${c.fill ? logo(c.logo, T, c.name) : logo(c.logo, Math.round(T * Math.min(0.8, Math.max(0.5, Number(c.scale) || 0.7))), c.name)}</div>`;   // "scale" (0.5-0.8, default 0.7): a wide, thin mark (a wave, a short wordmark) needs a bigger box to carry equal weight (QA, batch 5)
  const row = items.map(tile).join('');
  return `${CB_CSS}<style>.lu .lg{box-shadow:none;background:transparent;padding:0}.lu .lg:not(.full){border-radius:0;overflow:visible}.lu .lut:has(.lg.full){background:transparent}.lu .lut .lg.full,.lu .lut.fill .lg{width:130%!important;height:130%!important;margin:-15%;padding:0!important;border-radius:0;background:transparent!important}.lu .lut .lg.full img{border-radius:0}</style>
${glBg('background:linear-gradient(135deg,#F4F8FF 0%,#DFECFF 55%,#C2DAFF 100%)')}${glBg('background:radial-gradient(42% 55% at 88% 92%,rgba(47,123,255,.32),transparent 70%)')}
<div class="cbf" style="background-image:radial-gradient(circle,rgba(10,58,140,.10) 1.2px,transparent 1.8px);background-size:22px 22px;${GL_EDGE_MASK}"></div>
<div class="lu" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:${G}px;padding:${PAD}px;border-radius:${Math.round(T * 0.3)}px;background:rgba(255,255,255,.42);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:inset 0 0 0 2px rgba(255,255,255,.9),0 30px 70px rgba(30,80,170,.16)">${row}</div>`;
}
// versus/frost (Oct 2026): the user's liked pieces together: two big frosted-glass logo tiles ("I like how you have used logos with
// these glass bgs, we can utilize them with any other bg") on the approved mesh gradient that was waiting for an illustration, a glass
// "vs" disc between them and each brand's name under its tile. No headline (like versus/glass). Light mesh only.
// Marks fill 48% of the tile (was 60%: "the icons are too big and this is why visual balance off", approved review).
function glFrost() {
  const L = spec.left, R = spec.right, T = 340;
  const mesh = `<rect width='1600' height='900' fill='#EEF5FF'/><g filter='url(#b)'><circle cx='160' cy='200' r='420' fill='#9CC6FF'/><circle cx='1480' cy='760' r='420' fill='#BFE6FF'/><circle cx='1300' cy='140' r='300' fill='#E4E8FF'/><circle cx='420' cy='820' r='300' fill='#DCEBFF'/></g>`;
  const glass = 'background:rgba(255,255,255,0.55);backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);box-shadow:inset 0 0 0 2px rgba(255,255,255,.95),0 24px 60px rgba(30,80,170,.16)';
  const ink = '#0A0A0B', top = 450 - T / 2 - 40;
  const side = (s, cx) => `<div class="ct" style="left:${cx - T / 2}px;top:${top}px;width:${T}px;height:${T}px;border-radius:72px;${glass}">${logo(s.logo, Math.round(T * 0.48), s.label)}</div>
<div style="position:absolute;left:${cx - 300}px;width:600px;top:${top + T + 34}px;text-align:center;font-size:50px;font-weight:600;letter-spacing:-.03em;color:${ink};white-space:nowrap">${esc(s.label)}</div>`;
  return `${CB_CSS}<style>.fr .lg{box-shadow:none;background:transparent;padding:0}.fr .lg:not(.full){border-radius:0;overflow:visible}</style>${glBg(`background:${svgBg(mesh, 110)} center/cover`)}${glBg(`background-image:${NOISE};background-size:320px;mix-blend-mode:overlay;opacity:0.35`)}
<div class="fr">${side(L, 530)}${side(R, 1070)}
<div style="position:absolute;left:735px;top:${top + T / 2 - 65}px;width:130px;height:130px;border-radius:50%;display:grid;place-items:center;${glass}"><b style="font-size:46px;font-weight:500;letter-spacing:-.02em;color:#0A0A0B">${esc(spec.separator || 'vs')}</b></div></div>`;
}

// versus/bento (Oct 2026): a bento grid like a product page: per brand a big name cell, an icon cell and a fact cell (the
// article's own fact); a blue "vs" disc on the seam is the one blue anchor. Light cells in the grey frame only (the black field and its
// "finish" options lost). For pairs whose logos can't match.
function glBento() {
  const L = spec.left, R = spec.right, W = 560, G = 40, x0 = 800 - W - G / 2, top = 175, H1 = 290, H2 = 220, IC = 140;   // icon cells narrow, fact cells wide (QA: a 3-line fact cell looked crammed)
  // both names share one size and both facts share one size (taste 2: parallel elements, one treatment)
  const NF = Math.min(88, Math.floor((W - 96) / (Math.max(String(L.label).length, String(R.label).length) * 0.56)));
  // the longer fact fits in two lines (QA: three ragged lines looked crammed next to a one-line partner)
  const BR = /\n/.test(String(L.fact || '') + String(R.fact || '')), longest = (f) => Math.max(...String(f || '').split('\n').map((x) => x.length));
  const FF = BR ? Math.min(34, Math.floor((W - IC - G - 76) / (Math.max(longest(L.fact), longest(R.fact)) * 0.62))) : Math.min(38, Math.floor((W - IC - G - 76) * 2 / (Math.max(String(L.fact || '').length, String(R.fact || '').length) * 0.7)));
  // a fact of 4+ words keeps its first two and its last two words together, so it sets as two even lines
  const tie = (t) => { const w = t.split(' '); return w.length >= 4 ? [w.slice(0, 2).join('\u00a0'), ...w.slice(2, -2), w.slice(-2).join('\u00a0')].join(' ') : t.replace(/ (\S+)$/, '\u00a0$1'); };
  const C = { cell: 'background:#F3F4F6;box-shadow:inset 0 0 0 2px rgba(20,26,38,.05)', ink: '#0A0A0B', fact: '#3D4A5C', tag: '#5D6675' };
  const cell = (x, y, w, h, inner) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:34px;overflow:hidden;${C.cell}">${inner}</div>`;
  const icon = (s) => `<i class="${esc(s.icon || 'ph ph-cloud')}" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:96px;color:${C.ink};opacity:.92"></i>`;
  const side = (s, x) => cell(x, top, W, H1, `<b style="position:absolute;left:48px;bottom:40px;font-size:${NF}px;font-weight:600;letter-spacing:-.04em;line-height:1;color:${C.ink};white-space:nowrap">${esc(s.label)}</b>${s.tag ? `<span style="position:absolute;left:48px;top:40px;font-family:${MONO};font-size:26px;letter-spacing:.08em;text-transform:uppercase;color:${C.tag}">${esc(s.tag)}</span>` : ''}`)
    + cell(x, top + H1 + G, IC, H2, icon(s))
    + cell(x + IC + G, top + H1 + G, W - IC - G, H2, `<span style="position:absolute;left:40px;right:36px;top:50%;transform:translateY(-50%);font-size:${FF}px;font-weight:500;letter-spacing:-.02em;line-height:1.2;color:${C.fact};${BR ? 'white-space:pre-line;' : ''}">${BR ? esc(s.fact || '').replace(/-/g, '\u2011') : tie(esc(s.fact || '').replace(/-/g, '\u2011'))}</span>`);   // no hyphen breaks, no word left alone
  const vs = `<div style="position:absolute;left:${800 - 58}px;top:${top + H1 / 2 - 58}px;width:116px;height:116px;border-radius:50%;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;box-shadow:0 0 0 12px #fff"><b style="font-size:44px;font-weight:600;letter-spacing:-.02em;color:#fff">${esc(spec.separator || 'vs')}</b></div>`;
  // no pattern (user, batch 4: "delete pattern from bg, it looks overwhelming here"): the grid of cells is texture enough
  return glCanvas(`${side(L, x0)}${side(R, x0 + W + G)}${vs}`, 'none');
}
// ---- Batch 7 options (Oct 19 2026): new arrangements built only from approved parts (the user: "design using our design
// language"; all props and device mockups were rejected). Each names the approved template it is made from. ----

// versus/badges: from the approved badge. Each side: its name (or wordmark) on top, its key figure in the tinted value box,
// a muted qualifier under it; a light "vs" between. One blue tint for both boxes. White in the grey frame, sparse dots.
// The approved hierarchy is the default (TheraNest vs Valant, option B approved Oct 20 2026: the names were "too bold and big, visual
// hierrachy is not good"): names 44px at 600, figures up to 84px, the sides spread out (490/1110) with the "vs" centred in the gap
// between the two value boxes. Options still override: "nameSize" / "nameWeight" / "nameInk" for the names, "valueSize" for the
// figures, "spread": false for the old centres (520/1080, "vs" at 800).
function o7Badges() {
  const L = spec.left, R = spec.right, c = '#2F7BFF';
  const NS = spec.nameSize || 44, NW = spec.nameWeight || 600, VS = spec.valueSize || 84, SPREAD = spec.spread !== false;
  const box = { bg: hexMix(c, '#ffffff', 0.9), bd: hexMix(c, '#ffffff', 0.5), tx: hexMix(c, '#ffffff', 0.28) };
  const vfs = Math.min(VS, Math.floor(VS * 4.6 / (Math.max(String(L.value).length, String(R.value).length) * 0.6)));
  const nfs = Math.min(NS, Math.floor(440 / (Math.max(String(L.label).length, String(R.label).length) * 0.56)));
  const side = (s, cx) => `<div style="position:absolute;left:${cx - 270}px;width:540px;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:42px">
<div style="height:${Math.round(nfs * 1.2)}px;display:flex;align-items:center">${s.logo ? glMark(s, 30000, 420, nfs * 1.2) : `<b style="font-size:${nfs}px;font-weight:${NW};letter-spacing:-.025em;color:${spec.nameInk || '#0A0A0B'};white-space:nowrap">${esc(s.label)}</b>`}</div>
<div style="padding:20px 46px 26px;border-radius:40px;background:${box.bg};border:3px solid ${box.bd};font-size:${vfs}px;font-weight:600;letter-spacing:-.02em;line-height:1.1;color:${box.tx};white-space:nowrap">${esc(s.value)}</div>
${s.note ? `<div style="font-size:40px;font-weight:400;letter-spacing:-.02em;color:#8A8F98;white-space:nowrap">${esc(s.note)}</div>` : ''}</div>`;
  const [cl, cr] = SPREAD ? [490, 1110] : [520, 1080], bw = (v) => String(v).length * vfs * 0.58 + 98, vx = SPREAD ? Math.round(((cl + bw(L.value) / 2) + (cr - bw(R.value) / 2)) / 2) : 800;
  return glCanvas(`${side(L, cl)}${side(R, cr)}<span style="position:absolute;left:${vx - 60}px;width:120px;top:${450 - 30}px;text-align:center;font-size:52px;font-weight:300;color:#0A0A0B">${esc(spec.separator || 'vs')}</span>`, 'dots');
}
// versus/checks: from the approved checklist card. A tilted white card with the title, a thin blue rule, and one row
// per product (its logo tile, its name, its strength in the article's words); the tinted back card behind.
// The approved look is the default (AAPC vs Find-A-Code, option B approved Oct 20 2026: "checkboxes are not needed"): no check boxes,
// bigger logo tiles (104, mark 72) and spacing. Only an explicit "checks": true brings the blue check boxes (and the smaller rows)
// back; "big": false keeps the rows small without the boxes.
function o7Checks() {
  const rows = [spec.left, spec.right];
  const tfs = Math.min(44, Math.floor(820 / (String(spec.title).length * 0.55)));
  const NOCHK = spec.checks !== true, BIGR = NOCHK && spec.big !== false;
  const row = (s) => `<div style="display:flex;align-items:center;gap:${BIGR ? 30 : 24}px;padding:${BIGR ? 24 : 26}px 0;border-top:2px solid #F1F3F6">${NOCHK ? '' : '<span style="width:46px;height:46px;border-radius:12px;background:#0A5FD8;display:grid;place-items:center;color:#fff;font-size:26px;flex:none"><i class="ph-bold ph-check"></i></span>'}<span style="width:${BIGR ? 104 : 84}px;height:${BIGR ? 104 : 84}px;border-radius:22px;background:#fff;box-shadow:0 0 0 2px #EEF0F4;display:grid;place-items:center;flex:none">${logo(s.logo, BIGR ? 72 : 58, s.label)}</span><div><b style="display:block;font-size:${BIGR ? 36 : 38}px;font-weight:600;letter-spacing:-.02em;color:#141A26;white-space:nowrap">${esc(s.label)}</b>${s.sub ? `<span style="display:block;margin-top:4px;font-size:28px;color:#7F8794;white-space:nowrap">${esc(s.sub)}</span>` : ''}</div></div>`;
  return `<style>.o7c .lg{box-shadow:none;background:transparent;padding:0}</style><div class="o7c"><div style="position:absolute;left:350px;top:200px;width:920px;height:520px;border-radius:30px;background:#E4EFFC;transform:rotate(4deg)"></div>
<div style="position:absolute;left:310px;top:185px;width:980px;height:530px;box-sizing:border-box;border-radius:30px;background:#fff;transform:rotate(-2deg);padding:54px 60px;box-shadow:0 30px 70px rgba(30,60,110,.16),0 0 0 1px rgba(20,26,38,.05)">
<b style="display:block;font-size:${tfs}px;font-weight:600;letter-spacing:-.02em;color:#0A0A0B;white-space:nowrap">${esc(spec.title)}</b><i style="display:block;margin:24px 0 10px;height:10px;border-radius:5px;background:linear-gradient(90deg,#3B86F0,#0A5FD8)"></i>${rows.map(row).join('')}</div></div>`;
}
// spotlight: from the approved focus. The centred headline with its angle phrase in the blue selection box ({{ }}), and a white
// UI card below bleeding off the bottom with one row per product (logo tile + name), the last rows fading.
function o7Spotlight() {
  const head = esc(spec.headline).replace(/\{\{(.+?)\}\}/g, '<span class="sel">$1<i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i></span>');
  const items = (spec.items || []).slice(0, 6);
  const rows = items.map((it, i) => `<div style="display:flex;align-items:center;gap:22px;padding:18px 0;border-top:${i ? '2px solid #F1F3F6' : '0'};opacity:${[1, 1, 0.85, 0.7, 0.55, 0.45][i]}"><span style="width:64px;height:64px;border-radius:18px;background:#fff;box-shadow:0 0 0 2px #EEF0F4;display:grid;place-items:center;flex:none">${logo(it.logo, 44, it.name)}</span><b style="font-size:32px;font-weight:500;color:#141A26;white-space:nowrap">${esc(it.name)}</b>${it.value ? `<span style="margin-left:auto;font-size:30px;font-weight:500;color:#5D6675;white-space:nowrap">${esc(it.value)}</span>` : `<i style="margin-left:auto;width:${[180, 140, 160, 120, 150, 110][i]}px;height:14px;border-radius:7px;background:#EEF0F4"></i>`}</div>`).join('');   // an optional "value" (e.g. a price) replaces the skeleton bar
  return `<style>
.o7s .lg{box-shadow:none;background:transparent;padding:0}
.o7s .fh{position:absolute;left:50%;top:150px;transform:translateX(calc(-50% - 3px));width:1180px;text-align:center;font-size:${Math.min(64, Math.floor(1100 / (String(spec.headline).replace(/\{\{|\}\}/g, '').length * 0.52)))}px;font-weight:600;line-height:1.12;letter-spacing:-.03em;color:#0A0A0B}
.o7s .sel{position:relative;display:inline-block;padding:2px 18px 8px;margin:0 0 0 4px;font-weight:600;${ANCHOR}}
.o7s .sel i{position:absolute;width:16px;height:16px;background:#3B86F0}
.o7s .h1{left:-20px;top:-20px}.o7s .h2{right:-20px;top:-20px}.o7s .h3{left:-20px;bottom:-20px}.o7s .h4{right:-20px;bottom:-20px}
</style><div class="o7s"><div class="fh">${head}</div>
<div style="position:absolute;left:50%;top:310px;transform:translateX(-50%);width:1000px;height:640px;padding:30px 56px;border-radius:24px;background:#fff;box-sizing:border-box;box-shadow:0 30px 70px rgba(30,60,110,.15),0 0 0 1px rgba(20,26,38,.05)">${rows}</div></div>`;
}
// picks: from the approved checklist. A tilted white card titled with the heading, every pick of the article as a checked row
// (names only, in its order), the tinted back card behind. On a light field.
function o7Picks() {
  const items = (spec.items || []).slice(0, 7), n = items.length, RH = n > 6 ? 58 : 64, ch = 170 + n * RH, ct = Math.round((900 - ch) / 2);
  const tfs = Math.min(42, Math.floor(820 / (String(spec.title).length * 0.55)));
  const ifs = n > 6 ? 30 : 32;
  return `<div style="position:absolute;left:360px;top:${ct + 15}px;width:900px;height:${ch - 10}px;border-radius:30px;background:#E4EFFC;transform:rotate(4deg)"></div>
<div style="position:absolute;left:330px;top:${ct}px;width:940px;height:${ch}px;box-sizing:border-box;border-radius:30px;background:#fff;transform:rotate(-2deg);padding:46px 56px;box-shadow:0 30px 70px rgba(30,60,110,.16),0 0 0 1px rgba(20,26,38,.05)">
<b style="display:block;font-size:${tfs}px;font-weight:600;letter-spacing:-.02em;color:#0A0A0B;white-space:nowrap">${esc(spec.title)}</b><i style="display:block;margin:20px 0 14px;height:10px;border-radius:5px;background:linear-gradient(90deg,#3B86F0,#0A5FD8)"></i>
${items.map((it) => `<div style="display:flex;align-items:center;gap:22px;height:${RH}px;font-size:${ifs}px;color:#141A26"><span style="width:38px;height:38px;border-radius:10px;background:#0A5FD8;display:grid;place-items:center;color:#fff;font-size:22px;flex:none"><i class="ph-bold ph-check"></i></span>${esc(it.name || it)}</div>`).join('')}</div>`;
}

// ---- Batch 8 (Oct 19 2026): four arrangements of approved parts (the others from this batch were retired), one per remaining batch-5 article (the user: "I want like the
// designs that I have approved… now I want more designs for the rest"). Each names the approved template it grows from. ----
const O8_CARD = 'background:#fff;border-radius:28px;box-shadow:0 24px 50px rgba(30,60,110,.12),0 0 0 1px rgba(20,26,38,.05)';
const o8Tile = (s, r) => `width:${s}px;height:${s}px;border-radius:${r}px;background:#fff;box-shadow:0 0 0 2px #EEF0F4;display:grid;place-items:center;flex:none`;
const O8_CSS = '<style>.o8 .lg{box-shadow:none;background:transparent;padding:0}.o8 span:has(> .lg.full){background:transparent!important;box-shadow:none!important}.o8 span > .lg.full{width:100%!important;height:100%!important;border-radius:inherit}.o8fill .lg{padding:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important}</style>';

// versus/center: from the approved hub. Both products' logo tiles (names under them) point into one blue tile: the article's angle.
function o8Center() {
  const S = 210, ty = 380, T = { x: 650, y: 330, s: 300 };
  const pos = [[350, ty, -4], [1250, ty, 4]];
  const tile = (s, [cx, cy, r]) => `<div style="position:absolute;left:${cx - S / 2}px;top:${cy - S / 2}px;width:${S}px;display:flex;flex-direction:column;align-items:center;gap:30px">${s.fill ? `<span class="o8fill" style="width:${S}px;height:${S}px;flex:none;display:grid;place-items:center;filter:drop-shadow(0 18px 30px rgba(30,60,110,.14));transform:rotate(${r}deg)">${logo(s.logo, S, s.label)}</span>` : `<span style="${o8Tile(S, 48)};box-shadow:0 18px 40px rgba(30,60,110,.12),0 0 0 1px rgba(20,26,38,.05);transform:rotate(${r}deg)">${logo(s.logo, Math.round(S * Math.min(0.8, Math.max(0.45, Number(s.scale) || 0.66))), s.label)}</span>`}<b style="font-size:38px;font-weight:600;letter-spacing:-.02em;color:#0A0A0B;white-space:nowrap">${esc(s.label)}</b></div>`;
  // rough black hand-drawn arrows from each tile into the centre tile, as on the approved hub
  const arr = (sx, sy, ex, ey, bend) => { const qx = (sx + ex) / 2, qy = Math.min(sy, ey) - bend, ang = Math.atan2(ey - qy, ex - qx), h = 24;
    const p1 = [ex - h * Math.cos(ang - 0.5), ey - h * Math.sin(ang - 0.5)], p2 = [ex - h * Math.cos(ang + 0.5), ey - h * Math.sin(ang + 0.5)];
    return `<path d="M${sx} ${sy} Q ${qx} ${qy} ${ex} ${ey}"/><path d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L ${ex} ${ey} L ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}"/>`; };
  const arrows = arr(350 + S / 2 + 26, ty - 30, T.x - 26, T.y + 120, 60) + arr(1250 - S / 2 - 26, ty - 30, T.x + T.s + 26, T.y + 120, 60);
  return `${O8_CSS}<div class="o8"><svg viewBox="0 0 1600 900" width="1600" height="900" style="position:absolute;inset:0;overflow:visible"><defs><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter></defs><g filter="url(#rough)" fill="none" stroke="#141A26" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${arrows}</g></svg>
<div style="position:absolute;left:${T.x}px;top:${T.y}px;width:${T.s}px;height:${T.s}px;border-radius:64px;background:linear-gradient(160deg,#3B86F0,#0A5FD8);box-shadow:0 30px 60px rgba(10,95,216,.25);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:#fff">${spec.icon ? `<i class="${esc(spec.icon)}" style="font-size:120px"></i>` : ''}<span style="font-size:${spec.icon ? 36 : Math.min(52, Math.floor(260 / (String(spec.label).length * 0.56)))}px;font-weight:600;letter-spacing:-.02em;white-space:nowrap">${esc(spec.label)}</span></div>
${tile(spec.left, pos[0])}${tile(spec.right, pos[1])}</div>`;
}

// cloud: from the approved prompt chips and lineup tiles. The heading, then the article's picks as white logo pills (logo + name) in
// staggered centred rows, like a logo cloud on a product site.
function o8Cloud() {
  const items = (spec.items || []).slice(0, 8), per = items.length > 6 ? [3, 3, 2] : items.length > 3 ? [Math.ceil(items.length / 2), Math.floor(items.length / 2)] : [items.length];
  let k = 0;
  const rows = per.map((m) => items.slice(k, (k += m)));
  const pill = (it) => `<span style="display:inline-flex;align-items:center;gap:20px;height:108px;box-sizing:border-box;padding:0 40px 0 22px;border-radius:54px;${O8_CARD};border-radius:54px"><span style="${o8Tile(68, 34)};box-shadow:none">${logo(it.logo, 50, it.name)}</span><b style="font-size:34px;font-weight:500;letter-spacing:-.015em;color:#141A26;white-space:nowrap">${esc(it.name)}</b></span>`;
  const hfs = Math.min(64, Math.floor(1100 / (String(spec.headline).length * 0.52)));
  return `${O8_CSS}<div class="o8"><div style="position:absolute;left:0;right:0;top:${rows.length > 2 ? 150 : 230}px;text-align:center;font-size:${hfs}px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B;white-space:nowrap">${esc(spec.headline)}</div>
<div style="position:absolute;left:150px;right:150px;top:${rows.length > 2 ? 300 : 400}px;display:grid;gap:34px;justify-items:center">${rows.map((r) => `<div style="display:flex;gap:30px">${r.map(pill).join('')}</div>`).join('')}</div></div>`;
}

// ranges: from the approved ranked bars, as upright columns (see below). The heading and its unit, then a white card with one column
// per pick: its logo tile, a track with its price range in the blue anchor (a dot for a single price, a bar that fades upward for an
// open "From" price), and the price as written.
function o8Ranges() {
  // vertical columns (Visual QA, b8: horizontal rows were the ranked skeleton, already used in clinical): one track per pick on a
  // shared $0–max scale, its price range as a blue bar (a dot for one price, a bar that fades upward with no solid end for an open
  // "From" price), the price above, its logo tile below; the heading and its unit centred on top.
  // "bare": true (Small Practice EMR, Oct 20 2026: "use the previous bg, and in that dont add container for bars section") drops the
  // white card and darkens the tracks a step (#E1E5EC) so they hold on the white field; white only (BACKGROUND CHECK above).
  const rows = (spec.rows || []).slice(0, 6), max = spec.max, n = rows.length;
  const CL = 300, CT = 250, CW = 1000, CH = 590, top = 92, bot = CH - 132, TH = bot - top;
  const y = (v) => bot - (v / max) * TH, colX = (i) => Math.round(110 + i * ((CW - 220) / Math.max(1, n - 1)));
  const col = (r, i) => { const x = colX(i), yl = y(r.lo), yh = r.open ? Math.max(top + 30, yl - 150) : y(r.hi ?? r.lo), single = !r.open && (r.hi == null || r.hi === r.lo);
    const mark = single ? `<i style="position:absolute;left:${x - 14}px;top:${yl - 14}px;width:28px;height:28px;border-radius:50%;background:#0A5FD8;box-shadow:0 0 0 6px #fff"></i>`
      : r.open ? `<i style="position:absolute;left:${x - 11}px;top:${yh}px;width:22px;height:${yl - yh}px;border-radius:11px;background:linear-gradient(0deg,#1F6FE8,rgba(59,134,240,0))"></i><i style="position:absolute;left:${x - 14}px;top:${yl - 14}px;width:28px;height:28px;border-radius:50%;background:#0A5FD8;box-shadow:0 0 0 6px #fff"></i>`
      : `<i style="position:absolute;left:${x - 11}px;top:${yh}px;width:22px;height:${Math.max(22, yl - yh)}px;border-radius:11px;${ANCHOR}"></i>`;
    const lt = (single ? yl - 14 : yh) - 14;   // an open "From" price fades upward with no solid end (Fact QA, b8: every bar end reads as a figure)
    return `<i style="position:absolute;left:${x - 3}px;top:${top}px;width:6px;height:${TH}px;border-radius:3px;background:${spec.bare ? '#E1E5EC' : '#EEF0F4'}"></i>${mark}
<div style="position:absolute;left:${x - 95}px;width:190px;bottom:${CH - lt}px;text-align:center;font-size:27px;font-weight:600;line-height:1.15;letter-spacing:-.01em;color:#141A26;white-space:pre-line">${esc(r.label)}</div>
<span style="position:absolute;left:${x - 34}px;top:${bot + 38}px;${o8Tile(68, 18)}">${logo(r.logo, 46, r.name)}</span>`; };
  return `${O8_CSS}<div class="o8"><div style="position:absolute;left:0;right:0;top:92px;text-align:center;font-size:56px;font-weight:600;letter-spacing:-.03em;line-height:1.1;color:#0A0A0B;white-space:nowrap">${esc(spec.headline)}</div>
<div style="position:absolute;left:0;right:0;top:166px;text-align:center;font-size:28px;color:#7F8794;white-space:nowrap">${esc(spec.sub || '')}</div>
<div style="position:absolute;left:${CL}px;top:${CT}px;width:${CW}px;height:${CH}px;${spec.bare ? '' : O8_CARD}">${rows.map(col).join('')}</div></div>`;
}

// count: from the approved stat. The number of picks large in the blue gradient with the heading under it; a white card with one row
// per pick (logo tile + name), in the article's order.
function o8Count() {
  const items = (spec.items || []).slice(0, 6), n = items.length, RH = n > 4 ? 84 : 96, ch = 2 * 40 + n * RH;
  return `${O8_CSS}<div class="o8"><div style="position:absolute;left:205px;top:${450 - 200}px;font-size:250px;font-weight:600;letter-spacing:-.06em;line-height:1;background:linear-gradient(180deg,#4E9BF7,#1F6FE8);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:10px">${esc(String(spec.value ?? n))}</div>
<div style="position:absolute;left:212px;top:${450 + 80}px;width:520px;font-size:42px;font-weight:600;line-height:1.2;letter-spacing:-.02em;color:#0A0A0B">${esc(spec.caption)}</div>
<div style="position:absolute;left:790px;top:${Math.round(450 - ch / 2)}px;width:600px;box-sizing:border-box;padding:40px 46px;${O8_CARD}">${items.map((it, i) => `<div style="display:flex;align-items:center;gap:24px;height:${RH}px;border-top:${i ? '2px solid #F1F3F6' : '0'}"><span style="${o8Tile(64, 18)}">${logo(it.logo, 44, it.name)}</span><b style="font-size:34px;font-weight:500;letter-spacing:-.015em;color:#141A26;white-space:nowrap">${esc(it.name)}</b></div>`).join('')}</div></div>`;
}

// ---- Batch 6 (Oct 20 2026): the new layouts the user approved and that were delivered: figures, costgrid, frostrow, glassbar, versus/fan,
// versus/stacked. The batch's other new layouts (steps, numbered, link, poster and the versus halves, offset, chips, pill, glasscards,
// figures, annotate, corners) were disapproved or never shown, and are retired (layouts.mjs RETIRED). ----

// figures (cost; approved, batch 6: E-Prescribing Software Cost, on the white field the user picked, its default): the versus/scores type
// the user loves ("i love the design"), for two cost options. Spec: "headline", "sub" (the unit), "rows": two { label, value } (only the
// first two are drawn).
function o11Figures() {
  // two centred columns (Visual QA, batch 6: stacked rows read as versus/scores without its logos, a template already in use): the range
  // on top, large in the blue gradient, its label under it in black, one hairline between the columns; the heading and unit centred above
  const rows = (spec.rows || []).slice(0, 2), xs = [540, 1060];
  const vfs = Math.min(110, Math.floor(460 / (Math.max(...rows.map((r) => String(r.value).length)) * 0.58)));
  const col = (r, cx) => `<div style="position:absolute;left:${cx - 260}px;width:520px;top:430px;text-align:center"><div style="font-size:${vfs}px;font-weight:600;letter-spacing:-.05em;line-height:1;background:linear-gradient(180deg,#4E9BF7,#1F6FE8);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:8px;white-space:nowrap">${esc(r.value)}</div><b style="display:block;margin-top:26px;font-size:42px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B;white-space:nowrap">${esc(r.label)}</b></div>`;
  return `${O8_CSS}<div class="o8"><div style="position:absolute;left:0;right:0;top:190px;text-align:center;font-size:56px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B;white-space:nowrap">${esc(spec.headline)}</div>
<div style="position:absolute;left:0;right:0;top:268px;text-align:center;font-size:30px;color:#7F8794;white-space:nowrap">${esc(spec.sub || '')}</div>
<i style="position:absolute;left:799px;top:420px;width:2px;height:240px;background:rgba(20,26,38,.10)"></i>${rows.map((r, i) => col(r, xs[i])).join('')}</div>`;
}

// costgrid (cost by model; approved, batch 6: Medical Billing Software Cost, on the glow the user picked, its default): from the approved
// bento cells. The heading top-left; one tall card in the blue anchor for the main model and
// two stacked white cards for the others, each with the model's name, its figure big and its unit.
function o11CostGrid() {
  const [A, B, C] = spec.cells || [], L = 210, T = 260, H = 500, W1 = 560, G = 30, W2 = 1180 - W1 - G, h2 = (H - G) / 2;
  const cell = (c, x, y, w, h, on) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;box-sizing:border-box;padding:${on ? '48px 50px' : '34px 44px'};border-radius:28px;display:flex;flex-direction:column;justify-content:${on ? 'flex-end' : 'center'};${on ? ANCHOR + ';box-shadow:0 24px 50px rgba(10,95,216,.25)' : O8_CARD}">
<span style="font-size:${on ? 32 : 28}px;font-weight:500;color:${on ? 'rgba(255,255,255,.85)' : '#5D6675'};white-space:nowrap">${esc(c.label)}</span>
<b style="margin-top:${on ? 14 : 8}px;font-size:${Math.min(on ? 64 : 50, Math.floor((w - 100) / (String(c.value).length * 0.56)))}px;font-weight:600;letter-spacing:-.03em;line-height:1.05;color:${on ? '#fff' : '#0A0A0B'};white-space:nowrap">${esc(c.value)}</b>
${c.unit ? `<span style="margin-top:8px;font-size:${on ? 30 : 26}px;color:${on ? 'rgba(255,255,255,.85)' : '#7F8794'};white-space:nowrap">${esc(c.unit)}</span>` : ''}</div>`;
  return `${O8_CSS}<div class="o8"><div style="position:absolute;left:${L}px;top:140px;font-size:56px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B;white-space:nowrap">${esc(spec.headline)}</div>
${A ? cell(A, L, T, W1, H, true) : ''}${B ? cell(B, L + W1 + G, T, W2, h2, false) : ''}${C ? cell(C, L + W1 + G, T + h2 + G, W2, h2, false) : ''}</div>`;
}

// frostrow (best-of; approved, batch 6: 7 Best Telehealth Software for Therapists): versus/frost's frosted-glass tiles for a list (the user:
// "for logos bg glass bg would look better"). Paints its own light mesh (a canvas layout, CANVAS_LAYOUTS), so a "bg" or a pick is refused.
// The heading centred on top, then one row of equal frosted tiles on frost's light mesh (one size, one radius), each pick's name under
// its tile; no numbers.
function o12FrostRow() {
  const items = (spec.items || []).slice(0, 6), n = items.length, T = n > 5 ? 170 : n > 4 ? 196 : 220, G = n > 5 ? 30 : 44, x0 = Math.round(800 - (n * T + (n - 1) * G) / 2), top = 330;
  const mesh = `<rect width='1600' height='900' fill='#EEF5FF'/><g filter='url(#b)'><circle cx='160' cy='200' r='420' fill='#9CC6FF'/><circle cx='1480' cy='760' r='420' fill='#BFE6FF'/><circle cx='1300' cy='140' r='300' fill='#E4E8FF'/><circle cx='420' cy='820' r='300' fill='#DCEBFF'/></g>`;
  const glass = 'background:rgba(255,255,255,0.55);backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);box-shadow:inset 0 0 0 2px rgba(255,255,255,.95),0 24px 60px rgba(30,80,170,.16)';
  const tile = (it, i) => `<div style="position:absolute;left:${x0 + i * (T + G)}px;top:${top}px;width:${T}px;height:${T}px;border-radius:${Math.round(T * 0.22)}px;display:grid;place-items:center;${glass}">${it.fill ? `<span class="frf" style="width:${Math.round(T * 0.48)}px;height:${Math.round(T * 0.48)}px">${logo(it.logo, Math.round(T * 0.48), it.name)}</span>` : logo(it.logo, Math.round(T * (Number(it.scale) || 0.48)), it.name)}</div>
<div style="position:absolute;left:${x0 + i * (T + G) - 30}px;width:${T + 60}px;top:${top + T + 30}px;text-align:center;font-size:${n > 5 ? 30 : 34}px;font-weight:600;letter-spacing:-.02em;color:#0A0A0B;white-space:nowrap">${esc(it.name)}</div>`;
  return `${CB_CSS}<style>.fr .lg{box-shadow:none;background:transparent;padding:0}.fr .lg:not(.full){border-radius:0;overflow:visible}.fr .lg.full{border-radius:22%;overflow:hidden}.fr .lg:not(.full) img{mix-blend-mode:multiply}.fr .frf{border-radius:22%;overflow:hidden;display:grid;place-items:center}.fr .frf .lg{padding:0!important;border-radius:0!important;width:118%!important;height:118%!important;margin:-9%}.fr .frf .lg img{border-radius:0}</style>${glBg(`background:${svgBg(mesh, 110)} center/cover`)}${glBg(`background-image:${NOISE};background-size:320px;mix-blend-mode:overlay;opacity:0.35`)}
<div class="fr"><div style="position:absolute;left:0;right:0;top:170px;text-align:center;font-size:${Math.min(64, Math.floor(1100 / (String(spec.headline).length * 0.55)))}px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B;white-space:nowrap">${esc(spec.headline)}</div>${items.map(tile).join('')}</div>`;
}

// glassbar (approved, batch 6 round 7: EHR interoperability cost, after "make it more visually appealing… some minimal way… try using
// black background"): approved 24's frosted bar on its black mesh, holding one fact: the tier's label | its price in the blue gradient.
// The heading above in white Inter 500 (the rule on black), the qualifier under it in dimmed white (never grey hex over a glow).
// Paints its own canvas (black, vibrant). Spec: "headline", "label", "value", "caption".
function o15GlassBar() {
  const mesh = `<rect width='1600' height='900' fill='#0A0A0B'/><g filter='url(#b)'><circle cx='240' cy='240' r='360' fill='#1D4ED8' fill-opacity='.75'/><circle cx='1380' cy='700' r='380' fill='#2F7BFF' fill-opacity='.55'/><circle cx='1180' cy='120' r='220' fill='#7CC8F8' fill-opacity='.35'/></g>`;
  const lfs = Math.min(46, Math.floor(470 / (String(spec.label).length * 0.56))), vfs = Math.min(92, Math.floor(470 / (String(spec.value).length * 0.6)));
  return `${CB_CSS}${glBg(`background:${svgBg(mesh, 110)} center/cover`)}${glBg(`background-image:${NOISE};background-size:320px;mix-blend-mode:overlay;opacity:0.6`)}
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:46px">
<div style="font-size:${Math.min(52, Math.floor(1100 / (String(spec.headline).length * 0.55)))}px;font-weight:500;letter-spacing:-.03em;color:#fff;white-space:nowrap">${esc(spec.headline)}</div>
<div style="display:flex;align-items:center;justify-content:center;gap:44px;width:1080px;box-sizing:border-box;padding:56px 40px;border-radius:48px;background:rgba(255,255,255,.93);border:2px solid rgba(255,255,255,.75)"><b style="font-size:${lfs}px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B;white-space:nowrap">${esc(spec.label)}</b><i style="width:2px;align-self:stretch;margin:-24px 0;background:rgba(20,26,38,.12)"></i><span style="font-size:${vfs}px;font-weight:600;letter-spacing:-.05em;line-height:1;background:linear-gradient(180deg,#4E9BF7,#1F6FE8);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:6px;white-space:nowrap">${esc(spec.value)}</span></div>
${spec.caption ? `<div style="font-size:34px;font-weight:500;color:rgba(255,255,255,.62);white-space:nowrap">${esc(spec.caption)}</div>` : ''}</div>`;
}

// versus/fan (approved, batch 6 round 4: Tebra vs Zocdoc): two white price cards tilted -4/+4 degrees, meeting at the centre with the
// blue "vs" disc on the seam; each card its logo tile and name, its figure in the blue gradient right under the name (no empty band:
// Visual QA), its unit. No shadows on the blue (checks.md), so each logo tile keeps a hairline border to stay visible on its white card
// (O8_CSS clears a tile whose logo loads as a full icon); the disc ring is a border. Approved on the deep-dunes blue (round 4, "bg": "blue", BLUE_FIT), then delivered on the glow the user picked
// (its default). Both figures share one size.
function o14Fan() {
  const L = spec.left, R = spec.right, W = 560, H = 360, dx = 292;
  const vfs = Math.min(92, Math.floor(450 / (Math.max(String(L.value).length, String(R.value).length) * 0.6)));
  const nfs = Math.min(46, Math.floor(330 / (Math.max(String(L.label).length, String(R.label).length) * 0.58)));
  const tile = (s) => s.fill ? `<span class="o8fill" style="width:96px;height:96px;flex:none;border-radius:24px;overflow:hidden;display:grid;place-items:center">${logo(s.logo, 96, s.label)}</span>` : `<span class="o14t" style="${o8Tile(96, 24)}">${logo(s.logo, Math.round(96 * (Number(s.scale) || 0.64)), s.label)}</span>`;
  const card = (s, rot, x, z) => `<div style="position:absolute;left:${x}px;top:${450 - H / 2}px;width:${W}px;height:${H}px;transform:rotate(${rot}deg);z-index:${z};box-sizing:border-box;padding:46px 48px;display:flex;flex-direction:column;${O8_CARD}">
<div style="display:flex;align-items:center;gap:20px">${tile(s)}<b style="font-size:${nfs}px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B;white-space:nowrap">${esc(s.label)}</b></div>
<div style="margin-top:44px;font-size:${vfs}px;font-weight:600;letter-spacing:-.05em;line-height:1;background:linear-gradient(180deg,#4E9BF7,#1F6FE8);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:8px;white-space:nowrap">${esc(s.value)}</div>
<div style="margin-top:12px;font-size:28px;font-weight:500;color:#5D6675;white-space:nowrap">${esc(s.unit || '')}</div></div>`;
  return `${O8_CSS}<style>.o8fill .lg{padding:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;width:118%!important;height:118%!important;margin:-9%}.o8 .o14t{background:#fff!important;border:1px solid rgba(20,26,38,.08)}.o8 .o14t > .lg.full{width:64%!important;height:64%!important;border-radius:0}</style><div class="o8">
${card(L, -4, 800 - W / 2 - dx, 1)}${card(R, 4, 800 - W / 2 + dx, 2)}
<div style="position:absolute;z-index:3;left:752px;top:402px;width:96px;height:96px;border-radius:50%;${ANCHOR};display:grid;place-items:center;box-sizing:content-box;border:8px solid #fff;margin:-8px 0 0 -8px"><b style="font-size:36px;font-weight:600">vs</b></div></div>`;
}

// versus/stacked (approved, batch 6 round 5: symplr vs Modio Health, "love it. The concept, visual, everything looks so appealing and
// perfect"): the fan's parts stacked. Two wide white row cards, one above the other, tilted -2 and -1 degrees so the seam reads as
// intentional; each row its logo tile and name on the left, its figure in the blue gradient and its unit right-aligned; the blue "vs"
// disc with its white ring on the seam. Approved on the light mesh, then delivered on the glow the user picked (its default; "mesh" fits too). The approved prototype's shadows are kept
// exactly as drop-shadow filters (softShadow would flatten them to the minimal light-field shadow).
function o14Stacked() {
  const L = spec.left, R = spec.right, W = 1000, H = 190;
  const vfs = Math.min(80, Math.floor(560 / (Math.max(String(L.value).length, String(R.value).length) * 0.6)));
  const nfs = Math.min(52, Math.floor(400 / (Math.max(String(L.label).length, String(R.label).length) * 0.58)));
  const tile = (s) => s.fill ? `<span class="o8fill" style="width:104px;height:104px;flex:none;border-radius:26px;overflow:hidden;display:grid;place-items:center">${logo(s.logo, 104, s.label)}</span>` : `<span class="o14t" style="${o8Tile(104, 26)}">${logo(s.logo, Math.round(104 * (Number(s.scale) || 0.64)), s.label)}</span>`;
  const card = (s, rot, y, z) => `<div style="position:absolute;left:${800 - W / 2}px;top:${y}px;width:${W}px;height:${H}px;transform:rotate(${rot}deg);z-index:${z};box-sizing:border-box;padding:0 56px;display:flex;align-items:center;gap:28px;background:#fff;border-radius:28px;border:1px solid rgba(20,26,38,.05);filter:drop-shadow(0 22px 24px rgba(10,30,80,.15))">${tile(s)}
<b style="font-size:${nfs}px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B;white-space:nowrap">${esc(s.label)}</b><span style="margin-left:auto;display:flex;flex-direction:column;align-items:flex-end"><span style="font-size:${vfs}px;font-weight:600;letter-spacing:-.05em;line-height:1;background:linear-gradient(180deg,#4E9BF7,#1F6FE8);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:6px;white-space:nowrap">${esc(s.value)}</span><em style="font-style:normal;margin-top:4px;font-size:28px;font-weight:500;color:#5D6675;white-space:nowrap">${esc(s.unit || '')}</em></span></div>`;
  return `${O8_CSS}<style>.o8fill .lg{padding:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;width:118%!important;height:118%!important;margin:-9%}.o8 .o14t{background:#fff!important;border:1px solid rgba(20,26,38,.05);filter:drop-shadow(0 10px 12px rgba(10,30,80,.13))}.o8 .o14t > .lg.full{width:64%!important;height:64%!important;border-radius:0}</style><div class="o8">
${card(L, -2, 450 - H - 10, 1)}${card(R, -1, 462, 2)}
<div style="position:absolute;z-index:3;left:744px;top:394px;width:96px;height:96px;border-radius:50%;${ANCHOR};display:grid;place-items:center;box-sizing:content-box;border:8px solid #fff;filter:drop-shadow(0 16px 18px rgba(10,60,200,.3))"><b style="font-size:36px;font-weight:600">vs</b></div></div>`;
}

// ---- Batch 9 (Oct 19 2026): the user's b8 review. Office Ally range "i like the design but it is confusing" (lanes replaced it),
// Oracle rings disapproved (scores replaced it). ----

// versus/scores: from the approved type layout (18). No card and no chart: the metric small on top, then one row per product with its
// logo tile and name large in black and its score large in the blue gradient, a hairline between the rows.
function o9Scores() {
  const row = (s, y) => `<div style="position:absolute;left:300px;width:1000px;top:${y}px;height:150px;display:flex;align-items:center;gap:30px"><span style="${o8Tile(104, 26)};box-shadow:0 12px 30px rgba(30,60,110,.10),0 0 0 1px rgba(20,26,38,.05)">${logo(s.logo, 70, s.label)}</span><b style="font-size:68px;font-weight:600;letter-spacing:-.035em;color:#0A0A0B;white-space:nowrap">${esc(s.label)}</b><span style="margin-left:auto;text-align:right;font-size:120px;font-weight:600;letter-spacing:-.05em;line-height:1;background:linear-gradient(180deg,#4E9BF7,#1F6FE8);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:8px;white-space:nowrap">${esc(String(s.score))}</span></div>`;
  return `${O8_CSS}<div class="o8"><div style="position:absolute;left:300px;top:235px;font-size:40px;font-weight:600;letter-spacing:-.02em;color:#5D6675;white-space:nowrap">${esc(spec.title)}</div>
${row(spec.left, 315)}<i style="position:absolute;left:300px;width:1000px;top:495px;height:2px;background:rgba(20,26,38,.10)"></i>${row(spec.right, 525)}</div>`;
}

// versus/lanes: from the approved timeline, made explicit. One lane per product (its logo tile and name on the left), its own price
// stops labelled right above them on a shared scale; the comparison as the heading, the unit under it.
function o9Lanes() {
  const t0 = 640, t1 = 1290, min = spec.min ?? 0, max = spec.max, x = (v) => t0 + (v - min) / (max - min) * (t1 - t0);
  const fmt = (v) => `${spec.prefix ?? '$'}${v.toLocaleString('en-US')}`;
  const lane = (s, y) => { const p = [...s.points].sort((a, b) => a - b), a = x(p[0]), b = x(p[p.length - 1]);
    return `<div style="position:absolute;left:270px;top:${y - 48}px;display:flex;align-items:center;gap:24px"><span style="${o8Tile(96, 24)}">${logo(s.logo, 66, s.label)}</span><b style="font-size:42px;font-weight:600;letter-spacing:-.025em;color:#0A0A0B;white-space:nowrap">${esc(s.label)}</b></div>
<i style="position:absolute;left:${t0}px;top:${y - 4}px;width:${t1 - t0}px;height:8px;border-radius:4px;background:#EEF0F4"></i>
${p.length > 1 ? `<i style="position:absolute;left:${a}px;top:${y - 9}px;width:${b - a}px;height:18px;border-radius:9px;${ANCHOR}"></i>` : ''}
${p.map((v) => `<i style="position:absolute;left:${x(v) - 17}px;top:${y - 17}px;width:34px;height:34px;border-radius:50%;background:#0A5FD8;box-shadow:0 0 0 7px #fff"></i><span style="position:absolute;left:${x(v)}px;top:${y - 82}px;transform:translateX(-50%);font-size:34px;font-weight:600;letter-spacing:-.02em;color:#0A0A0B;white-space:nowrap">${esc(fmt(v))}</span>`).join('')}`; };
  return `${O8_CSS}<div class="o8"><div style="position:absolute;left:0;right:0;top:110px;text-align:center;font-size:58px;font-weight:600;letter-spacing:-.03em;color:#0A0A0B;white-space:nowrap">${esc(spec.headline)}</div>
<div style="position:absolute;left:0;right:0;top:186px;text-align:center;font-size:30px;color:#7F8794;white-space:nowrap">${esc(spec.sub || '')}</div>
<div style="position:absolute;left:210px;top:280px;width:1180px;height:470px;${O8_CARD}"></div>${lane(spec.left, 440)}${lane(spec.right, 630)}</div>`;
}

const modes = { glassbar: o15GlassBar, frostrow: o12FrostRow, figures: o11Figures, costgrid: o11CostGrid, cloud: o8Cloud, ranges: o8Ranges, count: o8Count, spotlight: o7Spotlight, picks: o7Picks, lineup, shortlist, versus, hub, prompt, stack, window: appwin, timeline, checklist, stat, ranked, focus, dark: cbDark, logotype, swap: glSwap, badge: glBadge, receipt, definition };


// ---- heading must mirror the blog title: same key words, same meaning, just shorter. Every headline is black #0A0A0B (user). ----
const STOP = new Set('a an the and or of for to in on at by with your you our is are be how what why when which who vs versus its it this that from into without about best top guide per 2024 2025 2026 2027'.split(' '));
const stem = (w) => w.endsWith('sses') ? w.slice(0, -2) : w.endsWith('ss') ? w : w.length > 4 && /(ches|shes|xes|zes)$/.test(w) ? w.slice(0, -2) : w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w;
const words = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9+ ]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)).map(stem);
const HEADING = { glassbar: spec.headline, frostrow: spec.headline, figures: spec.headline, costgrid: spec.headline, focus: spec.headline && spec.headline.replace(/\{\{|\}\}/g, ''), cloud: spec.headline, ranges: spec.headline, count: spec.caption, spotlight: spec.headline && spec.headline.replace(/\{\{|\}\}/g, ''), picks: spec.title, dark: spec.headline, versus: ['pills', 'connect', 'duo', 'tiles', 'lanes'].includes(VARIANT) ? spec.headline : VARIANT === 'checks' ? spec.title : undefined, receipt: spec.headline, shortlist: spec.headline, definition: spec.term, badge: spec.logo ? undefined : spec.title, prompt: spec.headline, timeline: spec.headline, ranked: spec.headline, stack: spec.title, checklist: spec.title, window: spec.list && spec.list.heading, stat: spec.caption };
const heading = HEADING[MODE];
if (heading !== undefined && !force) {
  if (!spec.articleTitle) { console.error('HEADING CHECK FAILED: add "articleTitle" (the blog post\'s real title) to the spec. The image heading must reuse its words.'); process.exit(3); }
  const tw = new Set(words(spec.articleTitle)), hw = words(heading), shared = hw.filter((w) => tw.has(w));
  const need = spec.mode === 'stat' ? shared.length >= 2 : shared.length >= 2 && shared.length / hw.length >= 0.75;
  if (!need) {
    const extra = hw.filter((w) => !tw.has(w));
    console.error(`HEADING CHECK FAILED: the image heading must use the blog title's own words (shorter, same meaning).\n  Blog title : ${spec.articleTitle}\n  Heading    : ${heading}\n  Not in title: ${extra.join(', ') || '(too few shared words)'}\nRewrite the heading from the title's key words, e.g. drop the year and filler, keep the subject and angle.`);
    process.exit(3);
  }
}
// ---- variety (forceful): every render is recorded in ONE site-wide history (per brand), wherever its output folder is.
// A used layout is refused only in a category it was already used in (layouts not used anywhere go first; see usage.mjs); same-topic
// articles never share a mode.
// defaults match the reference set (references/approved/), except the batch-5 layouts whose reference carries the user's pick
// (versus/checks, versus/scores, versus/lanes, spotlight, picks, cloud, ranges; and versus/badges, whose default is its own canvas)
// Backgrounds (the card layouts): light = sky, paper, cream, g5, soft, white, glow, mesh (BGS); vibrant = blue (about 1 in 3, shared
// with the black headline layouts).
// Background fit: each layout lists only the backgrounds that flatter its illustration, best first.
// Judged on figure/ground contrast, temperature harmony and colour dosage:
//  - grey-heavy illustrations (bars, skeletons) need colour behind them: sky or g5 (the checklist goes on the vibrant blue only)
//  - illustrations that already carry colour (giant number) sit well on a quiet neutral: paper or cream
//  - prompt paints its own full field (CANVAS), so it has no entry here
//  - big white app windows sit on sky; cool greys never go on cream
//  - blue dosage: a big blue mass (hub tile) gets a neutral field (cream/paper), never g5
//  - g5 lifts a single floating white card with light rising under it
//  - batch 6: figures, costgrid, versus/fan and versus/stacked lead with the field the user picked for the delivered image (white, glow)
const BG_FIT = { 'versus/fan': ['glow', 'sky', 'paper'], 'versus/stacked': ['glow', 'mesh', 'sky'], figures: ['white', 'sky', 'paper'], costgrid: ['glow', 'paper', 'sky'], 'versus/scores': ['sky', 'paper'], 'versus/lanes': ['cream', 'sky'], 'versus/checks': ['sky', 'g5'], 'versus/center': ['cream', 'paper'], cloud: ['g5', 'sky'], ranges: ['sky', 'g5'], count: ['paper', 'sky'], spotlight: ['sky', 'g5'], picks: ['sky', 'g5'], hub: ['cream', 'paper'], ranked: ['sky', 'g5'], focus: ['sky', 'g5'], timeline: ['cream', 'sky'], window: ['sky', 'g5'], stat: ['paper', 'cream'], stack: ['g5', 'cream'], 'before-after': ['g5', 'sky'], versus: ['sky', 'cream'] };
// crop to the visible ink (sharp's trim keeps transparent rows)
async function inkCrop(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 20) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return x1 < 0 ? buf : sharp(buf).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).png().toBuffer();
}
// logotype: split a black lockup into its icon and wordmark at the widest clear gap; a bare icon is turned white for the black tile
async function splitLockup(buf) {
  const src = await sharp(buf).trim().ensureAlpha().png().toBuffer();
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, ink = (i) => data[i + 3] > 60 && (data[i] + data[i + 1] + data[i + 2]) / 3 < 160;
  const col = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = 0; y < H; y++) if (ink((y * W + x) * 4)) n++; return n; });
  let best = null;
  for (let x = 0; x < W;) {
    if (col[x]) { x++; continue; }
    let e = x; while (e < W && !col[e]) e++;
    if (x > W * 0.06 && x < W * 0.45 && e - x >= W * 0.02 && (!best || e - x > best[1] - best[0])) best = [x, e];
    x = e;
  }
  if (!best) return null;
  const icon = await inkCrop(await sharp(src).extract({ left: 0, top: 0, width: best[0], height: H }).png().toBuffer());
  const word = await inkCrop(await sharp(src).extract({ left: best[1], top: 0, width: W - best[1], height: H }).png().toBuffer());
  const im = await sharp(icon).raw().toBuffer({ resolveWithObject: true }), d = im.data;
  let op = 0, dark = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 60) { op++; if ((d[i] + d[i + 1] + d[i + 2]) / 3 < 160) dark++; }
  const px = d.length / 4, tile = op / px > 0.8 && dark / px > 0.08;
  let out = icon;
  if (!tile) {
    const o = Buffer.from(d);
    for (let i = 0; i < o.length; i += 4) { const k = (o[i + 3] / 255) * Math.max(0, Math.min(1, (180 - (o[i] + o[i + 1] + o[i + 2]) / 3) / 130)); o[i] = o[i + 1] = o[i + 2] = 255; o[i + 3] = Math.round(k * 255); }
    out = await inkCrop(await sharp(o, { raw: im.info }).png().toBuffer());
  }
  const uri = (b) => `data:image/png;base64,${b.toString('base64')}`, wm = await sharp(word).metadata();
  return { icon: uri(out), tile, word: uri(word), aspect: wm.width / wm.height };
}
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
// logo fetches for the pre-render checks: retry network errors, rate limits and 5xx (a real 404 is an answer, not a failure)
const fetchRetry = async (url) => {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA } });
      if ((r.status === 429 || r.status >= 500) && i < 3) throw new Error(String(r.status));
      return r;
    } catch (e) { if (i >= 3) throw e; await new Promise((res) => setTimeout(res, 400 * (i + 1))); }
  }
};
// exit only after sharp's worker threads settle: an immediate process.exit can crash Node on Windows (exit 127 instead of 2)
const settleExit = async (code) => { await new Promise((r) => setTimeout(r, 200)); process.exit(code); };
const refuse = async (msg) => { console.error(msg); await settleExit(2); };
// logotype: fetch the product's full logo lockup (both Brandfetch themes, or a local file), keep the version whose ink is black
let LOGOTYPE = null;
if (MODE === 'logotype') {
  const inkOf = async (buf) => {
    const { data, info } = await sharp(buf).ensureAlpha().resize(600, 600, { fit: 'inside' }).raw().toBuffer({ resolveWithObject: true });
    let n = 0, lum = 0, sat = 0, col = 0;
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 60 || (r > 225 && g > 225 && b > 225)) continue;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sa = mx ? (mx - mn) / mx : 0;
      n++; lum += (r + g + b) / 3; sat += sa; if (sa > 0.3 && mx > 60) col++;
    }
    return n ? { lum: lum / n, sat: sat / n, colour: col / n, n } : null;
  };
  const sources = [];
  const ref = spec.logotype || spec.logo;
  if (ref && /\.(png|svg|webp|jpe?g)$/i.test(ref)) sources.push(['file', ref]);
  else if (ref && BF_CLIENT) for (const th of ['dark', 'light']) sources.push(['url', `https://cdn.brandfetch.io/${encodeURIComponent(ref)}/w/1600/h/600/theme/${th}/fallback/404/type/logo?c=${encodeURIComponent(BF_CLIENT)}`]);
  if (sources[0]?.[0] === 'file') {
    const f = ref.startsWith('file:') ? fileURLToPath(ref) : path.resolve(path.dirname(specFile), ref);
    if (!fs.existsSync(f)) await refuse(`LOGO FILE MISSING: ${ref} (looked for ${f}). Keep custom logos in featured-images/assets/ and reference them relative to the spec.`);
  }
  const tried = [];
  for (const [kind, src] of sources) {
    try {
      const buf = kind === 'file' ? fs.readFileSync(src.startsWith('file:') ? fileURLToPath(src) : path.resolve(path.dirname(specFile), src))
        : Buffer.from(await (await fetchRetry(src)).arrayBuffer());
      const ink = await inkOf(buf); tried.push(ink);
      if (ink && ink.lum < 90 && ink.sat < 0.25 && ink.colour < 0.06) {
        LOGOTYPE = (await splitLockup(buf)) || (args.includes('--force') ? { lockup: `data:image/png;base64,${(await sharp(buf).trim().png().toBuffer()).toString('base64')}` } : null);
        if (!LOGOTYPE) { await refuse(`LOGOTYPE CHECK FAILED: the logo for "${ref}" has no separate icon to put on the black tile. Use "dark" for this product.`); }
        break;
      }
    } catch { tried.push(null); }
  }
  // even --force can't draw a logotype without a logo
  if (!LOGOTYPE) {
    await refuse(`LOGOTYPE CHECK FAILED: no black logo lockup found for "${ref}". This layout needs a black logo (icon and wordmark). Use "dark" for this product, or save its black logo to featured-images/assets/ and set "logotype": "../assets/<file>.png".`);
  }
}
const CHECK_ONLY = args.includes('--check-only');
// versus/pills: each logo sits on a white circle, so both products need a mark that works on white. Resolve the logo chain the
// way the page does; a product whose only logo is a solid app tile (e.g. NetSuite's dark square) is refused.
const solidTile = async (buf) => {   // an app icon that fills its square: opaque, non-white corners
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, at = (x, y) => data.subarray((y * W + x) * 4, (y * W + x) * 4 + 4);
  return [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]].every(([x, y]) => { const q = at(x, y); return q[3] > 200 && !(q[0] > 232 && q[1] > 232 && q[2] > 232); });
};
// true: the brand has a logo that sits on white; false: its only logo is a solid app tile; null: no logo found
// (under --check-only, Brandfetch's generated lettermark doesn't count as a logo, so logo-check.mjs never says "yes" for a brand
// with no real logo)
const sitsOnWhite = async (d) => {
  for (const [url0, kind] of logoChain(d, slugOfDomain(d))) {
    const url = CHECK_ONLY ? url0.replace('/fallback/lettermark/', '/fallback/404/') : url0;
    try {
      let buf;
      if (url.startsWith('data:')) buf = Buffer.from(url.split(',')[1], 'base64');
      else {
        const r = await fetchRetry(url);
        if (!r.ok) continue;
        buf = Buffer.from(await r.arrayBuffer());
      }
      return kind === 'full' || url.startsWith('data:') ? !(await solidTile(buf)) : true;
    } catch { continue; }
  }
  return null;
};
if (LAYOUT === 'versus/pills' && !args.includes('--force')) {
  for (const side of [spec.left, spec.right]) {
    if (!side || !side.logo) continue;
    const onWhite = await sitsOnWhite(side.logo);
    if (CHECK_ONLY) console.log(`ONWHITE ${side.logo} ${onWhite}`);   // logo-check.mjs: "yes" only when a logo was found and sits on white
    if (onWhite === false) {
      await refuse(`PILLS LOGO CHECK FAILED: ${side.label}'s only logo is a solid app tile, and versus/pills needs a logo on a white circle. Use versus/connect, versus/slash or versus/duo, or save the brand's transparent logo to featured-images/assets/ and set "logo": "../assets/<file>.png".`);
    }
  }
}
// versus/connect: each tile is the brand's own app icon in its original colours, filling the tile edge to edge with its own
// background colour (user). Both brands need a solid app icon (Brandfetch icon or a local file); otherwise the layout is refused.
const CONNECT_ICON = {};
// versus/tiles: both tiles filled with brand colour when both brands have a filled app icon; otherwise both white (handled after
// this loop, which refuses a pair that can't match: "TILES LOGO CHECK FAILED")
if (LAYOUT === 'versus/connect' || LAYOUT === 'versus/tiles') {
  for (const [k, side] of [['left', spec.left], ['right', spec.right]]) {
    const d = side && side.logo;
    let buf = null;
    try {
      if (d && localLogo(d)) buf = Buffer.from(localLogo(d).split(',')[1], 'base64');
      else if (d && BF_CLIENT) { const r = await fetchRetry(bf(d, 'icon', '404')); if (r.ok) buf = Buffer.from(await r.arrayBuffer()); }
    } catch { buf = null; }
    if (buf && await solidTile(buf).catch(() => false)) CONNECT_ICON[k] = `data:image/png;base64,${(await sharp(buf).png().toBuffer()).toString('base64')}`;
    else if (LAYOUT === 'versus/tiles') { CONNECT_ICON.mixed = true; continue; }
    else if (!args.includes('--force')) {
      await refuse(`CONNECT LOGO CHECK FAILED: no app icon with its own background colour found for ${side ? side.label : k}${BF_CLIENT ? '' : ' (no Brandfetch client ID set)'}. versus/connect shows each brand's app icon in its original colours. Use versus/pills, versus/slash or versus/duo, or save the brand's square app icon to featured-images/assets/ and set "logo": "../assets/<file>.png".`);
    }
  }
}
// versus/tiles: both tiles share one treatment (user): both filled when both brands have a filled app icon, otherwise both
// white, which needs both logos to sit on white; a brand whose only logo is a filled tile can't go white, so that pair is refused
if (LAYOUT === 'versus/tiles' && CONNECT_ICON.mixed) {
  delete CONNECT_ICON.left; delete CONNECT_ICON.right;
  if (!args.includes('--force')) for (const side of [spec.left, spec.right]) if (side && side.logo && (await sitsOnWhite(side.logo)) === false)
    await refuse(`TILES LOGO CHECK FAILED: both tiles must match (both filled with brand colour, or both white). ${side.label}'s only logo is a filled app tile and the other brand has no filled icon, so they can't match. Use versus/connect only if both have app icons, or versus/type, versus/glass, versus/slash or versus/duo.`);
}
if (LAYOUT === 'versus/slash' && !args.includes('--force')) {
  for (const side of [spec.left, spec.right]) if (side && !slashSplit(side.label))
    await refuse(`SLASH NAME CHECK FAILED: "${side.label}" can't be shown in two colours (white + the brand colour) without guessing. Mark the coloured part with {{ }} (e.g. "Acu{{matica}}"), or use the article's fuller product name (e.g. "SAP Business One"). Some of the name must stay white.`);
}
// vibrant (at most 1 in 3 per category, never neighbours): the black headline layouts (dark, versus/slash, versus/duo), glassbar (black
// canvas) and the Gumloop layouts on the black or blue field (glass on black, tiles on blue); the Originals and every light field are calm
const VIVID = MODE === 'dark' || MODE === 'glassbar' || ['versus/slash', 'versus/duo'].includes(LAYOUT) || (GL_LAYOUTS.includes(LAYOUT) && GL_FIELD !== 'light');
// Gumloop layouts: fetch each brand's full wordmark (icon + typography) before rendering. Both Brandfetch themes are tried and the
// darkest-ink version kept (shown in its original colours); a white background is keyed out; a solid tile is not a
// wordmark, and a brand without one is typeset in Inter instead.
const WORDMARK = {};
if (GL_LAYOUTS.includes(LAYOUT)) {
  const inkStats = async (buf) => {
    const { data } = await sharp(buf).ensureAlpha().resize(400, 400, { fit: 'inside' }).raw().toBuffer({ resolveWithObject: true });
    let n = 0, lum = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 60) { n++; lum += (data[i] + data[i + 1] + data[i + 2]) / 3; }
    return n ? lum / n : null;
  };
  const cleanMark = async (buf) => {
    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height, at = (x, y) => data.subarray((y * W + x) * 4, (y * W + x) * 4 + 4);
    const cs = [[1, 1], [W - 2, 1], [1, H - 2], [W - 2, H - 2]].map(([x, y]) => at(x, y));
    const white = cs.every((p) => p[3] > 200 && p[0] > 235 && p[1] > 235 && p[2] > 235);
    if (cs.every((p) => p[3] > 200) && !white) return null;   // a solid tile, not a wordmark
    if (white) for (let i = 0; i < data.length; i += 4) data[i + 3] = Math.round(Math.min(1, (765 - data[i] - data[i + 1] - data[i + 2]) / 90) * data[i + 3]);
    return inkCrop(await sharp(Buffer.from(data), { raw: info }).png().toBuffer());
  };
  const want = [spec.left, spec.right].filter(Boolean).map((s) => s.logo).concat(spec.logo, spec.note && spec.note.logo).filter(Boolean);
  for (const d of new Set(want)) {
    const bufs = [];
    try {
      if (localLogo(d)) bufs.push(Buffer.from(localLogo(d).split(',')[1], 'base64'));
      else if (/^https?:/.test(d)) { const r = await fetchRetry(d); if (r.ok) bufs.push(Buffer.from(await r.arrayBuffer())); }
      else if (BF_CLIENT) for (const th of ['light', 'dark']) { const r = await fetchRetry(`https://cdn.brandfetch.io/${encodeURIComponent(d)}/w/1200/h/400/theme/${th}/fallback/404/type/logo?c=${encodeURIComponent(BF_CLIENT)}`); if (r.ok) bufs.push(Buffer.from(await r.arrayBuffer())); }
    } catch {}
    let best = null;
    for (const b of bufs) {
      try { const m = await cleanMark(b); if (!m) continue; const lum = await inkStats(m); if (lum !== null && (!best || lum < best.lum)) best = { buf: m, lum }; } catch {}
    }
    if (best) {
      const { data, info } = await sharp(best.buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      // darken pale (near-white) wordmark text so it reads on the light bar, but only FREE-STANDING pale ink (letters next to
      // transparency, e.g. Availity's white "Availity"); pale ink knocked out of a solid shape (SAP's white letters in its blue
      // block) is part of the mark and stays white
      const W = info.width, H = info.height, isPale = (i) => { const mx = Math.max(data[i], data[i + 1], data[i + 2]), mn = Math.min(data[i], data[i + 1], data[i + 2]); return data[i + 3] > 60 && mx > 200 && (mx - mn) / mx < 0.15; };
      const nearClear = (x, y) => [[4, 0], [-4, 0], [0, 4], [0, -4]].some(([dx, dy]) => { const a = x + dx, b = y + dy; return a < 0 || b < 0 || a >= W || b >= H || data[(b * W + a) * 4 + 3] < 40; });
      let ink = 0, pale = 0, free = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (data[i + 3] > 60) { ink++; if (isPale(i)) { pale++; if (nearClear(x, y)) free++; } } }
      if (ink && pale / ink > 0.25 && free / pale > 0.3) { for (let i = 0; i < data.length; i += 4) if (isPale(i)) { data[i] = 20; data[i + 1] = 26; data[i + 2] = 38; } best.buf = await sharp(Buffer.from(data), { raw: info }).png().toBuffer(); }
      const md = await sharp(best.buf).metadata();
      // lettering height as a share of the mark's height: the ink in the right 55% of a lockup is type (an icon sits on the
      // left, and may overlap the type, e.g. AdvancedMD's hummingbird), so its vertical extent is the type's height
      let text = 1;
      try {
        const r = await sharp(best.buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true }), Wd = r.info.width, Hd = r.info.height, px = r.data;
        let y0 = Hd, y1 = -1;
        for (let y = 0; y < Hd; y++) for (let x = Math.floor(Wd * 0.45); x < Wd; x++) if (px[(y * Wd + x) * 4 + 3] > 60) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; }
        if (y1 >= y0) text = Math.max(0.3, (y1 - y0 + 1) / Hd);
      } catch {}
      WORDMARK[d] = { uri: `data:image/png;base64,${best.buf.toString('base64')}`, aspect: md.width / md.height, text }; }
  }
  // versus/glass: each mark gets ~400px of the bar, so an ultra-wide lockup (e.g. Oracle NetSuite's ~13:1) renders too thin to read
  if (LAYOUT === 'versus/glass' && !args.includes('--force')) for (const side of [spec.left, spec.right]) {
    const W = side && WORDMARK[side.logo || ''];
    if (CHECK_ONLY && side) console.log(`WORDMARK ${side.logo} ${W ? W.aspect.toFixed(2) : 'none'}`);   // logo-check.mjs: "yes" only with a compact wordmark
    if (W && W.aspect > 9) await refuse(`GLASS LOGO CHECK FAILED: ${side.label}'s wordmark is too wide (${W.aspect.toFixed(1)}:1) to read on the glass bar. Save a compact lockup (4:1 or narrower) to featured-images/assets/ and set "logo": "../assets/<file>.png", or use versus/tiles, versus/type or another versus layout.`);
  }
}
// --check-only: stop after the logo checks (used by logo-check.mjs while planning; nothing is rendered or recorded)
if (CHECK_ONLY) { console.log('CHECKS PASSED'); await settleExit(0); }
Object.assign(BG_FIT, { logotype: ['cream'] });
const DEFAULT_BG = Object.fromEntries(Object.entries(BG_FIT).map(([m, l]) => [m, l[0]]));
// The checklist on a light field was deleted in the approved review (Oct 2026): a checklist goes on the vibrant blue only.
if (MODE === 'checklist') {
  if (spec.bg && spec.bg !== 'blue' && !args.includes('--force')) {
    console.error(`CHECKLIST FIELD FAILED: the checklist on a light field was deleted in review; it goes on the vibrant "blue" only. Remove "bg".`);
    process.exit(2);
  }
  spec.bg = 'blue';
}
const BG_OK = [...BGS, 'blue'];
if (spec.bg && !BG_OK.includes(spec.bg)) {
  console.error(`BACKGROUND CHECK FAILED: "${spec.bg}" is not a background. Use a light background (${BGS.join(', ')}) or the vibrant "blue".`);
  process.exit(2);
}
const brandKey = brandKeyOf(spec.brand);
const ledgerFile = path.join(path.dirname(outDir), '.featured-ledger.json');
const historyFile = historyFileOf(brandKey);
// the site history merged with this folder's ledger (usage.mjs loadHistory; plan.mjs reads the same site history, it has no folder)
const history = loadHistory(brandKey, ledgerFile);
// what counts: not superseded (a design the user rejected and had replaced is no longer on the site), and not this slug's old entry
const priorSite = countable(history, [slug]);
// this category's images, for the neighbour checks (vibrant, series mark, background); a reservation isn't an image yet, so it is skipped
const prior = priorSite.filter((e) => normCat(e.category) === category && !e.reserved);
// ---- content check: each layout needs enough real content to fill its frame (a sparse window or hub looks unfinished) ----
const n = (a) => (Array.isArray(a) ? a.length : 0);
const thin = {
  window: () => n(spec.list?.rows) < 2 && 'window needs 2+ list rows',
  hub: () => n(spec.cards) < 6 && 'hub needs 6–7 products',
  ranked: () => n(spec.rows) < 3 && 'ranked needs 3+ rows',
  checklist: () => n(spec.items) < 3 && 'checklist needs 3+ items',
  timeline: () => n(spec.steps) < 3 && 'timeline needs 3+ steps',
  stat: () => n(spec.card?.rows) < 2 && 'stat card needs 2+ rows',
  focus: () => n(spec.rows) < 2 && 'focus needs 2+ rows',
  shortlist: () => n(spec.items) < 3 && 'shortlist needs 3+ items',
  picks: () => n(spec.items) < 3 && 'picks needs 3-7 items',
  spotlight: () => n(spec.items) < 3 && 'spotlight needs 3-6 items',
  count: () => n(spec.items) < 3 && 'count needs 3-6 items',
  frostrow: () => n((spec.items || []).filter((c) => c.logo)) < 3 && 'frostrow needs 3-6 products with logos',
  figures: () => n(spec.rows) < 2 && 'figures needs 2 rows, each with a label and a value',
  glassbar: () => !(spec.label && spec.value) && 'glassbar needs "label" (the tier) and "value" (its price) for its one bar',
  costgrid: () => n(spec.cells) < 3 && 'costgrid needs 3 cells (the main one first), each with a label and a value',
  cloud: () => n((spec.items || []).filter((c) => c.logo)) < 3 && 'cloud needs 3-8 products with logos',
  ranges: () => n(spec.rows) < 3 ? 'ranges needs 3-6 rows' : !(Number(spec.max) > 0) && 'ranges needs "max" (the top of its price scale)',
  // the two-product arrangements: both sides need the fact the layout is built on
  versus: () => {
    const both = (k) => [spec.left, spec.right].every((s) => s && s[k] != null && s[k] !== '');
    return {
      badges: () => !both('value') && 'versus/badges needs a "value" on both sides',
      fan: () => !both('value') && 'versus/fan needs a "value" (and its "unit") on both sides',
      stacked: () => !both('value') && 'versus/stacked needs a "value" (and its "unit") on both sides',
      checks: () => !spec.title && 'versus/checks needs "title"',
      center: () => !spec.label && 'versus/center needs "label" (the angle on the blue tile)',
      lanes: () => (![spec.left, spec.right].every((s) => s && n(s.points)) || !(Number(spec.max) > 0)) && 'versus/lanes needs "max" and "points" on both sides',
      // two real numbers: a score in words against a number got "ew revert it" (Oracle vs MEDITECH 2026)
      scores: () => ((!both('score') || !spec.title) && 'versus/scores needs "title" (the metric) and a "score" on both sides') || ([spec.left, spec.right].some((s) => !/^[~$€£]?[0-9][0-9.,%]*$/.test(String(s?.score))) && 'versus/scores needs a real number on both sides (a word against a number looked broken); change the metric or the year'),
    }[VARIANT]?.();
  },
  lineup: () => n((spec.cards || []).filter((c) => c.logo)) < 3 && 'lineup needs 3-7 products with logos',
  // a Phosphor icon in place of the product logo was rejected ("icon is not looking good"): dark needs the real logo
  dark: () => !(spec.panelLogo || spec.panelLogoUrl) && 'dark needs the product\'s own logo ("panelLogo")',
}[MODE]?.();
if (thin && !force) { console.error(`CONTENT CHECK FAILED: ${thin}. Use the article's facts to fill it, or pick a layout that suits fewer facts.`); process.exit(2); }
// ---- comparison fairness: an "X vs Y" article shows both products (dark features one brand, so it is for single-brand articles) ----
if (MODE === 'dark' && /\bvs\.?\b|\bversus\b/i.test(spec.articleTitle || '') && !force) {
  console.error('FAIRNESS CHECK FAILED: "dark" features one brand, but this is an X vs Y article. Use a versus layout so both products are shown.');
  process.exit(2);
}
// Delivered images are permanent: a finalized image is never re-created or overwritten (only if the user explicitly asks: --force).
const deliveredHere = history.find((e) => e.final && (e.slug === slug || path.resolve(e.out || '') === path.resolve(outDir)));
if (deliveredHere && !force) {
  console.error(`FINAL IMAGE LOCKED: "${deliveredHere.slug}" was delivered on ${String(deliveredHere.finalizedAt).slice(0, 10)} (${deliveredHere.out}).
Delivered images are permanent and can't be re-created or overwritten. Use a new slug and output folder for a new article.`);
  process.exit(2);
}
const topic = spec.topic || null;
const sameTopic = topic ? history.filter((e) => e.topic === topic && e.slug !== slug && !e.superseded) : [];
if (sameTopic.some((e) => e.mode === MODE) && !force) {
  console.error(`VARIETY CHECK FAILED: another article on topic "${topic}" (${sameTopic.filter((e) => e.mode === MODE).map((e) => e.slug).join(', ')}) already uses mode "${MODE}".
Same-topic articles must use different compositions. Used for this topic: ${sameTopic.map((e) => e.mode).join(', ')}`);
  process.exit(2);
}
// Layout usage (the user's rule, Oct 2026): a layout not used yet is free for any article it suits; a used layout can't be used again
// in the same category, only in a different one. Usage = site history + the user's record (references/used-layouts.json), see usage.mjs.
const REC = userRecord(brandKey);
warnRecord(REC);
const USE = usageOf(priorSite, REC);
// the user's own pick skips the category rule and the site-wide cap (never the same-topic check above): --user-pick, or this slug's
// reservation made as a user pick in plan.mjs ("slug=layout!") for this same layout. The render entry keeps "userPick" but not
// "reserved", so re-renders (QA fixes, the final render after a bgpick apply, bgpick's options) go by either
const myRes = history.find((e) => e.slug === slug && (e.reserved || e.userPick));
const USER_PICK = args.includes('--user-pick') || !!(myRes && myRes.userPick && layoutOf(myRes) === LAYOUT);
const usedHere = force || USER_PICK ? null : blocked(USE, LAYOUT, category);
if (usedHere) {
  const free = freeFor(USE, category);
  console.error(`VARIETY CHECK FAILED: ${usedHere}
Not used yet (first in line): ${free.fresh.join(', ') || 'none'}
Used only in other categories (free here): ${free.elsewhere.join(', ') || 'none'}
(set "mode", and "variant" when it is not "default")`);
  process.exit(2);
}
// vibrant images (deep-dunes blue, black headline layouts): at most 1 in 3 per category, never two neighbours
if ((spec.bg === 'blue' || VIVID) && !force) {
  const lastTwo = prior.slice(-2);
  if (lastTwo.some((e) => e.vibrant || e.bg === 'blue')) {
    console.error(`VIBRANT CHECK FAILED: a recent "${category}" image already uses a vibrant field (the deep-dunes blue or a black layout) (${lastTwo.filter((e) => e.vibrant || e.bg === 'blue').map((e) => e.slug).join(', ')}).
Mix vibrant with subtle: at most 1 in 3 images, never on neighbours. ${MODE === 'checklist' ? 'A checklist is blue only, so pick another layout for this article.' : CANVAS ? 'This layout paints its own canvas ("bg" is refused here): pick a light layout, or "field": "light" for versus/tiles and versus/glass.' : 'Use a light background (sky, paper, cream, g5) for this one.'}`);
    process.exit(2);
  }
}
// site mark + series tag: some images, never all. At most 1 in 3 per category, never on two neighbours.
if (spec.craft === true && spec.series && !force) {
  const lastTwo = prior.slice(-2);
  if (lastTwo.some((e) => e.series)) {
    console.error(`SERIES CHECK FAILED: the site mark was used on a recent "${category}" image (${lastTwo.filter((e) => e.series).map((e) => e.slug).join(', ')}).
Use it on at most 1 in 3 images and never on neighbours. Remove "series" from this spec.`);
    process.exit(2);
  }
}
// a layout that paints its own canvas (prompt and frostrow too) still sits on a page under it, hidden by the canvas: 'paper', or 'sky'
// under frostrow (its tile shadows are tinted to the page, as in the approved image 51); either way it is recorded as 'canvas'; the fine
// overlay grain sits on top
const CANVAS_PAGE = LAYOUT === 'frostrow/default' ? 'sky' : 'paper';
let BG = spec.bg || (CANVAS ? CANVAS_PAGE : DEFAULT_BG[LAYOUT] || DEFAULT_BG[MODE]);
const prevBg = prior.length ? prior[prior.length - 1].bg : null;   // the category's last rendered image (history is sorted by time)
const FIT = CANVAS ? [CANVAS_PAGE] : BG_FIT[LAYOUT] || BG_FIT[MODE] || ['sky', 'g5'];
// Vibrant fit: the deep-dunes blue flatters only illustrations built on a big white card.
// Blue-heavy illustrations and floating logo tiles never go on blue.
const BLUE_FIT = ['checklist', 'versus/table', 'window', 'before-after/flow', 'versus/fan'];   // versus/fan: approved on the blue (batch 6)
if (spec.bg === 'blue' && !BLUE_FIT.includes(MODE) && !BLUE_FIT.includes(LAYOUT) && !force && !BG_PICK) {
  console.error(`VIBRANT FIT FAILED: the ${LAYOUT} illustration doesn't look good on the vibrant blue. Use blue only with: ${BLUE_FIT.join(', ')}.`);
  process.exit(2);
}
if (!spec.bg && BG === prevBg) BG = FIT.find((b) => b !== prevBg) || BG;   // neighbours differ, but only within the layout's fitting backgrounds
if (spec.bg && spec.bg !== 'blue' && !FIT.includes(spec.bg) && !force && !BG_PICK) {
  console.error(`BACKGROUND FIT FAILED: "${spec.bg}" doesn't flatter the ${MODE} illustration. Use ${FIT.map((b) => `"${b}"`).join(' or ')}${BLUE_FIT.includes(MODE) || BLUE_FIT.includes(LAYOUT) ? ' (or the vibrant "blue")' : ''}.`);
  process.exit(2);
}
// texture (edge guide lines + a few margin accent dots) = the anti-bland structure layer. On by default for 'sky'/'paper'
// backgrounds, and by default for checklist, ranked, focus, versus, before-after and stack on any field; opt in elsewhere with
// "texture": true ("texture": false turns it off). Off when the frame grid is on (never both), and never on the canvas (CB) layouts
// or logotype.
const FRAME_ON = spec.bg !== 'blue' && (spec.frame ?? FRAME_DEFAULT[MODE] ?? false);
const TEX = !FRAME_ON && !CB_LAYOUT && MODE !== 'logotype' && (spec.texture ?? (['sky', 'paper'].includes(BG) || ['checklist', 'ranked', 'focus', 'versus', 'before-after', 'stack'].includes(MODE)));
const texRand = (() => { let h = 2166136261; for (const c of String(slug)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; })();
const pt = (x, y) => [Math.round(x), Math.round(y)];
const accDots = [0, 1, 2, 3, 4].map((i) => {     // outer margins only: never near text or cards
  const zone = i % 4, r = texRand();
  return zone === 0 ? pt(60 + r * 130, 90 + texRand() * 720) : zone === 1 ? pt(1410 + r * 130, 90 + texRand() * 720)
    : zone === 2 ? pt(240 + r * 1120, 26 + texRand() * 40) : pt(240 + r * 1120, 846 + texRand() * 34);
});
const acc = accDots.map(([x, y], i) => `radial-gradient(circle,${i % 2 ? '#27ACF2' : '#3B86F0'} 3px,transparent 3.6px) ${x}px ${y}px/12px 12px no-repeat`).join(',');
const TEX_CSS = `.tex{position:absolute;inset:0;pointer-events:none;background:linear-gradient(rgba(59,134,240,.22),rgba(59,134,240,.22)) 210px 0/1px 100% no-repeat,linear-gradient(rgba(59,134,240,.22),rgba(59,134,240,.22)) 1389px 0/1px 100% no-repeat}
.tex i{position:absolute;inset:0}
.tex .acc{background:${acc}}${BG === 'cream' ? `.tex{background:linear-gradient(rgba(150,120,80,.18),rgba(150,120,80,.18)) 210px 0/1px 100% no-repeat,linear-gradient(rgba(150,120,80,.18),rgba(150,120,80,.18)) 1389px 0/1px 100% no-repeat}.tex .acc{display:none}` : ''}`;
// anchor (the one high-contrast element): the approved blue gradient
const ANCHOR = 'background:linear-gradient(150deg,#3B86F0,#0A5FD8);color:#fff';
const svgBg = (inner, blur = 0) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900' preserveAspectRatio='none'><defs><filter id='b' x='-30%' y='-30%' width='160%' height='160%'><feGaussianBlur stdDeviation='${blur}'/></filter></defs>${inner}</svg>`)}")`;
// Vibrant blue = "deep dunes": bright blue #3D80F2 at the top melting into deep royal #1638B0 / #0A1E70
// in soft rolling bands, with heavy grain on the field (cards stay crisp).
const BLUE_GLOW = svgBg(`<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#3D80F2'/><stop offset='1' stop-color='#2C68E6'/></linearGradient></defs><rect width='1600' height='900' fill='url(#g)'/><g filter='url(#b)'><path d='M-200 560 C 350 450 800 690 1200 540 S 1650 450 1850 490 L1850 1100 L-200 1100Z' fill='#1638B0'/><path d='M-200 820 C 450 690 950 940 1850 730 L1850 1100 L-200 1100Z' fill='#0A1E70'/></g>`, 40);
const NOISE = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='1.6' intercept='-.3'/><feFuncG type='linear' slope='1.6' intercept='-.3'/><feFuncB type='linear' slope='1.6' intercept='-.3'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`)}")`;
const CRAFT = spec.craft === true && !CB_LAYOUT && MODE !== 'logotype';   // the site mark is for card layouts only
// text and structure that sit directly on a saturated field turn white
const FIELD_CSS = `body.fd .fleg span,body.fd .fleg .f1,body.fd .fleg .f2{color:#fff}body.fd .fleg i{background:#fff !important}body.fd .fleg .f1{opacity:.75}
body.fd .tex .acc{display:none}body.fd .tex{background:linear-gradient(rgba(255,255,255,.22),rgba(255,255,255,.22)) 210px 0/1px 100% no-repeat,linear-gradient(rgba(255,255,255,.22),rgba(255,255,255,.22)) 1389px 0/1px 100% no-repeat}
body.fd svg.fl g{stroke:#fff}body.fd .fb{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.45)}body.fd .fb b{color:#fff}body.fd .fb span{color:rgba(255,255,255,.8)}body.fd .fb .fi{background:rgba(255,255,255,.2);color:#fff}
body.fd .grain{opacity:.06;mix-blend-mode:soft-light}`;
const MONO = "'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace";
const SERIES_POS = spec.seriesPos || { focus: 'top', versus: 'bottom', 'before-after': 'tl' }[MODE] || 'bottom';
const seriesMark = CRAFT && spec.series ? `<!--smark--><div class="smark sm-${SERIES_POS}">${brand.markUrl ? `<img src="${brand.markUrl}" alt="">` : ''}<b>${esc(brand.markName || brand.name || '')}</b><span>${esc(spec.series)}</span></div><!--/smark-->` : '';
const CRAFT_CSS = `
.smark{position:absolute;z-index:3;display:flex;align-items:center;gap:12px;white-space:nowrap}
.smark img{width:40px;height:40px;border-radius:10px}.smark b{font-size:26px;font-weight:600;color:#141A26;letter-spacing:-.01em}
.smark span{font-family:${MONO};font-size:22px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#0A5FD8}
.sm-top{left:50%;top:84px;transform:translateX(-50%)}.sm-bottom{left:50%;bottom:72px;transform:translateX(-50%)}.sm-tl{left:240px;top:96px}
/* focus (the headline keeps its black and its 600 weight, taste 3) */
.fct{font-family:${MONO};text-transform:uppercase;letter-spacing:.08em;font-size:20px;color:#7F8794}
.fr b{font-family:${MONO};font-size:26px;font-weight:500;color:#141A26;text-transform:uppercase}.fr.on b{color:#0A5FD8}
.fr em{color:#141A26}.fr.on em{color:#0A5FD8}
.fr>i{height:22px;border-radius:11px;background:#EEF1F5}.fr>i>i{border-radius:11px;background:#D3D9E2}
.fr.gh>i>i,.fr.gh s{background:#E3E7EE}
/* before-after flow */
.fb{background:#fff;border:2px dashed #D3D9E2;box-shadow:none}
.fb .fi{background:#fff;color:#141A26;box-shadow:0 0 0 2px #E3E7EE}.fb b{color:#141A26;font-weight:500}.fb span{font-family:${MONO};color:#8A93A5}
.fa b{color:#141A26;font-weight:600}.fa li{color:#141A26}
.fleg{font-family:${MONO};text-transform:uppercase;font-size:22px;letter-spacing:.06em}.fleg .f1{color:#7F8794}.fleg .f2{color:#0A5FD8}
`;
// field grain (.bgn), as BG_CSS sets it per field: heavy on blue (overlay, .85), medium on g5 (overlay, .6), fine on sky, paper and
// soft (LIGHT_GRAIN: multiply .2, since overlay barely shows on near-white); none on white, glow and mesh (no .bgn rule, the empty div
// shows nothing) or cream (no div). The fine overlay (.grain: multiply .09; soft-light .06 on blue) sits on every field but cream.
// "grain": false turns it off on a light field: both layers, the field grain (.bgn) and the fine overlay (.grain).
const NO_GRAIN = spec.grain === false && BG !== 'blue';
const GRAIN = !NO_GRAIN && BG !== 'cream';
const LIGHT_GRAIN = `.bgn{position:absolute;inset:0;pointer-events:none;background-image:${NOISE};background-size:320px;mix-blend-mode:multiply;opacity:.2}`;
const BG_CSS = {
  soft: `body{background:linear-gradient(160deg,#EEF6FE 0%,#D6EAFC 50%,#BFDDFA 100%)}body:before{display:none}${LIGHT_GRAIN}`,
  white: `body{background:#F2F2F3}body:before{display:block;inset:28px;border-radius:28px;background:radial-gradient(circle,rgba(20,26,38,.10) 1.4px,transparent 2px) 18px 18px/36px 36px,#fff}`,
  glow: `body{background:linear-gradient(135deg,#F4F8FF 0%,#DFECFF 55%,#C2DAFF 100%)}body:before{display:block;inset:0;background:radial-gradient(42% 55% at 88% 92%,rgba(47,123,255,.32),transparent 70%)}`,
  mesh: `body{background:${svgBg("<rect width='1600' height='900' fill='#EEF5FF'/><g filter='url(#b)'><circle cx='160' cy='200' r='420' fill='#9CC6FF'/><circle cx='1480' cy='760' r='420' fill='#BFE6FF'/><circle cx='1300' cy='140' r='300' fill='#E4E8FF'/><circle cx='420' cy='820' r='300' fill='#DCEBFF'/></g>", 90)} center/cover}body:before{display:none}`,
  blue: `body{background:${BLUE_GLOW};background-size:cover}body:before{display:none}.bgn{position:absolute;inset:0;pointer-events:none;background-image:${NOISE};background-size:320px;mix-blend-mode:overlay;opacity:.85}`,
  cream: `body{background:#F6F2EA}body:before{display:none}`,
  // Granola #5 in blue: near-white top, a bright clear sky glowing up from under the hero card
  g5: `body{background:linear-gradient(180deg,#F7FBFF 0%,#EAF5FE 38%,#A9DCFB 78%,#7CC8F8 100%)}body:before{display:block;inset:0;filter:blur(30px);background:radial-gradient(60% 45% at 62% 100%,rgba(70,175,245,.55),transparent 70%)}.bgn{position:absolute;inset:0;pointer-events:none;background-image:${NOISE};background-size:320px;mix-blend-mode:overlay;opacity:.6}`,
  paper: `body{background:#F1F3F6}body:before{display:none}${LIGHT_GRAIN}`,
  sky: `body{background:linear-gradient(180deg,#F3F8FE 0%,#E6F1FC 100%)}body:before{display:none}${LIGHT_GRAIN}`,
};
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
${LOGO_JS}
<style>
${LOGO_CSS}
${FIELD_CSS}
${TEX ? TEX_CSS : ''}
.sr b .lg{margin-right:12px}.th b .lg,.olb .lg,.rr b .lg{vertical-align:middle;margin-right:14px;position:relative;top:-3px}.olb{display:flex;align-items:center}
*{box-sizing:border-box}html,body{margin:0;width:1600px;height:900px;overflow:hidden}
body{position:relative;font-family:Inter,system-ui,sans-serif;color:#141A26;background:#F3F8FE}
body:before{content:"";position:absolute;inset:-100px;display:none}
.lbl{position:absolute;top:160px;font-size:50px;font-weight:500;letter-spacing:-.02em}
.l1{left:210px;color:#7C7468}.l2{left:710px;color:#2C5FAE}
.c{position:absolute;top:250px;background:#fff;border-radius:22px;box-shadow:0 24px 50px rgba(30,60,110,.12),0 0 0 1px rgba(20,26,38,.04)}
.c1{left:210px;width:420px;height:290px;padding:54px 40px;box-sizing:border-box}
.c1 .raw{font-size:29px;line-height:1.45;color:#141A26}
.caret{display:inline-block;width:3px;height:36px;background:#27ACF2;vertical-align:-6px;margin-left:4px}
.c2{left:710px;width:680px;padding:48px 50px;box-sizing:border-box}
.c2 h3{margin:0 0 24px;font-size:34px;font-weight:500;color:#5D6675;letter-spacing:-.01em}
.c2 ul{margin:0;padding:0 0 0 30px;display:grid;gap:12px;font-size:30px;line-height:1.3}
.c2 li{color:#7F8794}.c2 li.a{color:#141A26}
.conn{position:absolute;left:630px;top:0;width:80px;height:900px;overflow:visible}
.legend{position:absolute;left:710px;top:700px;display:flex;gap:44px;font-size:30px;font-weight:500}
.legend span{display:flex;align-items:center;gap:14px}.legend i{width:16px;height:16px;border-radius:50%}
.lg1{color:#141A26}.lg1 i{background:#141A26}.lg2{color:#2C7BD8}.lg2 i{background:#27ACF2}
.grain{position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;opacity:.09;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
</style></head><body class="${BG === 'blue' ? 'fd' : ''}">${GRAIN ? '<div class="bgn"></div>' : ''}
${TEX ? '<div class="tex"><i class="acc"></i></div>' : ''}${frameLayer()}
${LAYOUT === 'before-after/flow' ? baFlow() : modes[MODE] ? modes[MODE]() : `<div class="lbl l1" style="top:${baTop}px">${esc(before.label)}</div><div class="lbl l2" style="top:${baTop}px">${esc(after.label)}</div>
<div class="c c1" style="top:${baTop + 90}px"><div class="raw">${before.lines.map(esc).join('<br>')}<span class="caret"></span></div></div>
<svg class="conn" viewBox="0 0 80 900" style="transform:translateY(${baTop + 90 - 250}px)"><path d="M0 ${306 + 42 * (before.lines.length - 1)} H 40 V 440 H 80" fill="none" stroke="#9AA3B2" stroke-width="3" stroke-dasharray="9 9"/></svg>
<div class="c c2" style="top:${baTop + 90}px;height:${baH}px"><h3>${esc(after.heading)}</h3><ul>${after.items.map((t, i) => `<li${i === 0 ? ' class="a"' : ''}>${esc(t)}</li>`).join('')}</ul></div>
${spec.legend ? `<div class="legend" style="top:${baTop + 90 + baH + 64}px"><span class="lg1"><i></i>${esc(spec.legend[0])}</span><span class="lg2"><i></i>${esc(spec.legend[1])}</span></div>` : ''}`}
${cursorLayer()}
<style>${BG_CSS[BG] || ''}</style>
${CRAFT ? `<style>${CRAFT_CSS}</style>${seriesMark}` : ''}${BG === 'cream' || NO_GRAIN ? '' : '<div class="grain"></div>'}</body></html>`;


// Brand colours: swap the default blue palette for the brand's. Headlines are always black #0A0A0B (user), so a brand file's
// "headline" (default #0A0A0B) recolours nothing; anything else is reported.
if (brand.headline && brand.headline.toUpperCase() !== '#0A0A0B') console.warn(`BRAND NOTE: "headline": "${brand.headline}" in ${path.basename(brandFile)} is ignored; headlines are always black #0A0A0B.`);
const swaps = { '#3B86F0': brand.accentLight, '#0A5FD8': brand.accent, '#27ACF2': brand.sky, '#2C5FAE': brand.labelAfter, '#2C7BD8': brand.legendAfter, '#7C7468': brand.labelBefore };
let out = html;
for (const [k, v] of Object.entries(swaps)) if (v) out = out.split(k).join(v);
// Shadows: none on the vibrant blue; minimal and tinted to the field on light backgrounds.
// 1px "ring" shadows (0 0 0 Npx) are card edges, not drop shadows, and are kept on light fields.
const SHADOW_TINT = { sky: '30,60,110', g5: '30,80,140', paper: '20,26,38', cream: '90,70,40', soft: '30,70,140', white: '20,26,38', glow: '30,80,170', mesh: '30,80,170' }[BG] || '30,60,110';
const softShadow = (decl) => decl.split(/,(?![^(]*\))/).map((sh) => {
  const m = sh.trim().match(/^(inset\s+)?(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)(?:px)?(\s+-?[\d.]+(?:px)?)?\s+(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}|[a-z]+)$/);
  if (!m) return sh;
  const [, inset, x, y, blur, spread, col] = m;
  if (+blur === 0) return BG === 'blue' ? null : sh;                         // ring/edge line
  if (BG === 'blue') return null;                                           // no drop shadows on the vibrant blue
  const a = (col.match(/rgba?\([^)]*,\s*([\d.]+)\)/) || [])[1];
  const alpha = Math.min(0.08, (a ? +a : 0.1) * 0.55);
  return `${inset || ''}${(+x * 0.4).toFixed(1)}px ${(+y * 0.35).toFixed(1)}px ${(+blur * 0.45).toFixed(1)}px${spread || ''} rgba(${SHADOW_TINT},${alpha.toFixed(3)})`;
}).filter(Boolean).join(',') || 'none';
out = out.replace(/box-shadow:\s*([^;}"!]+)(!important)?/g, (all, v, imp) => v.trim() === 'none' ? all : `box-shadow:${softShadow(v)}${imp || ''}`);
if (BG === 'blue') out = out.replace(/filter:\s*drop-shadow\([^;"]*\)/g, 'filter:none');

fs.mkdirSync(outDir, { recursive: true });
// ---- text budget: count every visible word and refuse text-heavy images ----
const MAX_WORDS = 15, MAX_RUN = 7;   // whole image / any single text element (no sentences)
const bodyHtml = html.slice(html.indexOf('<body')).replace(/<(style|script|svg)[\s\S]*?<\/\1>/g, ' ').replace(/<!--smark-->[\s\S]*?<!--\/smark-->/g, ' ').replace(/<\/?b>/g, '');   // <b> is inline emphasis; the series mark is branding, not copy
const runs = bodyHtml.split(/<[^>]+>/).map((t) => t.replace(/&[a-z#0-9]+;/gi, ' ').trim()).filter(Boolean);
const wc = (t) => (t.match(/[A-Za-z0-9$€£%][^\s]*/g) || []).filter((w) => !/^0\d$/.test(w)).length;   // rank numbers (01, 02…) are decoration
const WORDS = runs.reduce((n, t) => n + wc(t), 0);
const longRuns = runs.filter((t) => wc(t) > MAX_RUN);
if ((WORDS > MAX_WORDS || longRuns.length) && !args.includes('--force')) {
  console.error(`TEXT CHECK FAILED: ${WORDS} words on the image (max ${MAX_WORDS})${longRuns.length ? `; sentence-like text (max ${MAX_RUN} words per element): ${longRuns.map((t) => `"${t}"`).join(', ')}` : ''}.
Use labels, not sentences. Cut secondary lines first (subs, legends, extra rows), then shorten every phrase to its key words.`);
  process.exit(2);
}
const file = path.join(outDir, 'page.html');
fs.writeFileSync(file, out);
const raw = path.join(outDir, 'raw.png');
const PROFILE = path.join(os.tmpdir(), `bfi-chrome-${process.pid}`); // one profile per render, so parallel renders never collide
execFileSync(findChrome(), ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1600,900',
  '--virtual-time-budget=8000', '--disable-web-security', `--user-data-dir=${PROFILE}`, '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', `--screenshot=${raw}`, pathToFileURL(file).href], { stdio: 'ignore' });
// Windows: Chrome can still hold the profile for a moment after exit; retry, and never fail a finished render over a temp folder
try { fs.rmSync(PROFILE, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); } catch {}
const master = await sharp(raw).png().toBuffer();
fs.writeFileSync(path.join(outDir, 'master.png'), master);
// 7:5 crop (1260 x 900): x 170-1430 holds the content column (x 210-1390). dark's text column starts at x 120, so its crop shifts left
// (x 100-1360 keeps the text and the panel's name). duo spans the full width (headline at x ~96, panels to x ~1572), so no 1260px
// window holds it: its 7:5 is the whole master padded top and bottom with its own black field.
const crop75 = LAYOUT === 'versus/duo'
  ? await sharp(master).extend({ top: 121, bottom: 122, left: 0, right: 0, background: '#0A0A0B' }).toBuffer()
  : await sharp(master).extract({ left: MODE === 'dark' ? 100 : 170, top: 0, width: 1260, height: 900 }).toBuffer();
await sharp(crop75).resize(350, 250).png().toFile(path.join(outDir, 'card-350x250.png'));
await sharp(crop75).webp({ quality: 90 }).toFile(path.join(outDir, '7x5.webp'));
await sharp(master).resize(1200, 675).webp({ quality: 90 }).toFile(path.join(outDir, '16x9-1200.webp'));
fs.rmSync(raw);
// bg = what the image is painted on: the card layouts' field, or "canvas" for a layout that paints its own, prompt included (plus its
// "field" when it has a choice); a picked bg (bgPick) is recorded as itself, canvas layouts included, so the next card's background
// check compares like with like
const entry = { slug, brand: brandKey, category, topic, mode: MODE, variant: VARIANT, layout: LAYOUT, bg: CANVAS && !BG_PICK ? 'canvas' : BG, ...(BG_PICK ? { bgPick: true } : {}), ...(GL_FIT && !BG_PICK ? { field: GL_FIELD } : {}), series: !!(CRAFT && spec.series), vibrant: BG === 'blue' || VIVID, ...(USER_PICK ? { userPick: true } : {}), out: path.resolve(outDir), at: new Date().toISOString() };
// Parallel renders share these files: take the lock (usage.mjs), re-read, then write, so no entry is lost. A re-render replaces the
// slug's entry but keeps what finalize.mjs and the user set on it.
const KEEP = ['final', 'finalizedAt', 'stored', 'superseded'];
withLock(historyFile, () => {
  const L = readJson(ledgerFile), H = readJson(historyFile), old = { ...L.find((e) => e.slug === slug), ...H.find((e) => e.slug === slug) };
  const e = { ...entry };
  for (const k of KEEP) if (old[k] !== undefined) e[k] = old[k];
  fs.writeFileSync(ledgerFile, JSON.stringify([...L.filter((x) => x.slug !== slug), e], null, 1));
  fs.writeFileSync(historyFile, JSON.stringify([...H.filter((x) => x.slug !== slug), e], null, 1));
});
console.log(`${outDir}
  layout=${LAYOUT} ${GL_LAYOUTS.includes(LAYOUT) && !BG_PICK ? `field=${GL_FIELD}` : `bg=${BG}${BG_PICK ? ' (picked)' : ''}`} category=${category} words=${WORDS}/${MAX_WORDS}`);
