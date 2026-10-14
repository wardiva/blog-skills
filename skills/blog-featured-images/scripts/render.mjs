// blog-featured-images renderer: one article spec -> a featured image in the approved design language.
// Usage: node render.mjs <spec.json> [--brand <brand.json>] [--out <dir>]
//   spec  : article content + "mode" (before/after default, versus, prompt, hub). See references/spec-format.md
//   brand : colour overrides (default: brands/default.json). See brands/_template.json
//   out   : output folder (default: ./featured-images/<slug>)
// Writes master.png (1600x900), 7x5.webp (theme crop), 16x9-1200.webp (social), card-350x250.png (check size), page.html
import { LAYOUTS, REPEATABLE } from './layouts.mjs';
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
// Needs a free client ID (brandfetch.com/developers): env BRANDFETCH_CLIENT_ID or "brandfetchClientId" in the brand file.
// Without one, previews fall back to Google's favicon service. One treatment per image ("logoStyle") keeps logos on-vibe.
const LOCAL_CFG = (() => { try { return JSON.parse(fs.readFileSync(path.join(os.homedir(), '.blog-featured-images', 'config.json'), 'utf8')); } catch { return {}; } })();
const BF_CLIENT = process.env.BRANDFETCH_CLIENT_ID || LOCAL_CFG.brandfetchClientId || brand.brandfetchClientId || '';
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
const logoChain = (d, slug) => localLogo(d) ? [[localLogo(d), '']] : /^https?:/.test(d) ? [[d, '']] : [   // a URL is used as is (e.g. a mark cut from the official icon)
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
//   variant "table" (default): ONE comparison card, products as column headers, matched rows, the right column tinted.
//   variant "overlap": two cards tilted toward each other, overlapping at the centre with the vs chip on the overlap.
function versus() {
  if (spec.variant === 'pills') return cbVersusPills();
  if (spec.variant === 'connect') return cbVersusConnect();
  if (spec.variant === 'slash') return cbVersusSlash();
  if (spec.variant === 'duo') return cbVersusDuo();
  const L = spec.left, R = spec.right, dims = spec.dimensions || [];
  const legend = spec.legend ? `<div class="legend vleg"><span class="lg1"><i></i>${esc(spec.legend[0])}</span><span class="lg2"><i></i>${esc(spec.legend[1])}</span></div>` : '';
  if (spec.variant === 'logos') {
    const LG_TOP = Math.round((900 - (240 + 30 + 53 + 18 + 58)) / 2);   // optically centred group: tiles + names + chips
    // "logos" (Mintlify "A x B" lockup): two large logo tiles, the VS badge between them, the names, one fact chip each.
    const side = (d, cls) => `<div class="lgs ${cls}"><div class="lgt">${logo(d.logo, 156, d.label)}</div><b>${esc(d.label)}</b>${d.fact ? `<span>${esc(d.fact)}</span>` : ''}</div>`;
    return `<style>
.lgband{position:absolute;left:0;right:0;top:${LG_TOP - 14}px;height:268px;border-top:1px solid rgba(59,134,240,.35);border-bottom:1px solid rgba(59,134,240,.35);background:repeating-linear-gradient(135deg,rgba(59,134,240,.12) 0 2px,transparent 2px 16px)}
.lgw{position:absolute;left:50%;top:${LG_TOP}px;transform:translateX(-50%);display:flex;align-items:flex-start;gap:120px}
.lgs{width:440px;display:flex;flex-direction:column;align-items:center;text-align:center}
.lgt{width:240px;height:240px;border-radius:56px;background:#fff;display:grid;place-items:center;box-shadow:0 30px 70px rgba(30,60,110,.14),0 0 0 1px rgba(20,26,38,.05)}
.lgt .lg{box-shadow:none;background:transparent;padding:0}.lgt .lg:not(.full){border-radius:0;overflow:visible}.lgt:has(.lg.full){background:transparent}.lgt .lg.full{width:240px!important;height:240px!important;border-radius:56px}
.lgs b{margin-top:30px;font-size:44px;font-weight:600;letter-spacing:-.02em;white-space:nowrap;color:#0E2A5C}.l1 b,.l2 b{color:#0E2A5C}
.lgs > span{margin-top:18px;width:340px;box-sizing:border-box;padding:12px 0;border-radius:999px;background:#fff;box-shadow:0 0 0 1px rgba(20,26,38,.07),0 8px 20px rgba(30,60,110,.06);font-size:28px;color:#5D6675;white-space:nowrap;text-align:center}
.lgv{position:absolute;left:50%;top:120px;transform:translate(-50%,-50%);width:84px;height:84px;border-radius:50%;background:linear-gradient(150deg,#3B86F0,#0A5FD8);display:grid;place-items:center;color:#fff;font-size:27px;font-weight:600;box-shadow:0 0 0 6px #fff,0 2px 6px rgba(20,26,38,.08)}
</style>
${spec.band === false ? '' : '<div class="lgband"></div>'}<div class="lgw">${side(L, 'l1')}${side(R, 'l2')}<div class="lgv">VS</div></div>`;
  }
  if (spec.variant === 'table') {
    const n = Math.max(L.items.length, R.items.length);
    const RH = 104, top = Math.round((900 - (150 + n * RH + (spec.legend ? 86 : 0))) / 2);
    const rows = Array.from({ length: n }, (_, i) => `<div class="tr"><span class="td0">${esc(dims[i] || '')}</span><span class="td1${i === 0 ? ' a' : ''}">${esc(L.items[i] || '')}</span><span class="td2${i === 0 ? ' a' : ''}">${esc(R.items[i] || '')}</span></div>`).join('');
    return `<style>
.tcard{position:absolute;left:230px;top:${top}px;width:1140px;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 30px 70px rgba(30,60,110,.14),0 0 0 1px rgba(20,26,38,.05)}
.tcol{position:absolute;top:0;bottom:0;left:${230 + 260 + 440}px}
.th,.tr{display:grid;grid-template-columns:260px 440px 440px;align-items:center}
.th{height:150px;border-bottom:1px solid #EEF0F4}.th b{display:block;font-size:44px;font-weight:600;letter-spacing:-.02em}.th em{display:block;margin-top:6px;font-style:normal;font-size:24px;color:#8A93A5}
.th .h1c b{color:#7C7468}.th .h2c b{color:#2C5FAE}
.th>span,.tr>span{padding:0 36px}.th .h2c,.tr .td2{padding-left:72px}.th .h2c,.tr .td2{background:#F2F8FE;height:100%;display:flex;flex-direction:column;justify-content:center}
.tr{height:${RH}px;border-bottom:1px solid #F1F2F5}.tr:last-child{border-bottom:0}
.td0{font-size:22px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#9AA3B2}
.td1,.td2{font-size:32px;color:#5D6675;line-height:1.25}.td1.a{color:#141A26;font-weight:500}.td2.a{color:#0A5FD8;font-weight:600}
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
      tiles += `<div class="hq" style="left:${cx - S / 2}px;top:${cy - S / 2}px;transform:rotate(${r}deg)">${logo(cd.logo, L, cd.name)}</div>`;
    });
    return `<style>
.tile{position:absolute;left:640px;top:${T - 160}px;width:320px;height:320px;border-radius:64px;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;box-shadow:0 30px 60px rgba(10,95,216,.25)}
.tile i{font-size:150px;color:#fff}.tl{display:flex;flex-direction:column;align-items:center;color:#fff}.tl b{font-size:150px;font-weight:600;line-height:1;letter-spacing:-.04em}.tl span{margin-top:8px;font-size:34px;font-weight:500;opacity:.92;white-space:nowrap}
.hq{position:absolute;width:${S}px;height:${S}px;border-radius:38px;background:#fff;display:grid;place-items:center;box-shadow:0 18px 40px rgba(30,60,110,.12),0 0 0 1px rgba(20,26,38,.05)}
.hq .lg{box-shadow:none;background:transparent;padding:0}.hq .lg:not(.full){border-radius:0;overflow:visible}
.hq:has(.lg.full){background:transparent}.hq .lg.full{width:${S}px!important;height:${S}px!important;border-radius:38px}
svg.arr{position:absolute;inset:0;overflow:visible}
</style>
<svg class="arr" viewBox="0 0 1600 900" width="1600" height="900"><defs><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter></defs>
<g filter="url(#rough)" fill="none" stroke="#141A26" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${arrows}</g></svg>
<div class="tile">${spec.hubLabel ? `<div class="tl"><b>${esc(spec.hubLabel.big)}</b><span>${esc(spec.hubLabel.small || '')}</span></div>` : `<i class="${esc(spec.hubIcon || 'ph-fill ph-buildings')}"></i>`}</div>${tiles}`;
  }
  const slots = [[215, 100, -5], [214, 360, 4], [245, 615, -3], [1055, 90, 4], [1060, 355, -4], [1045, 620, 3], [640, 705, 2]];
  const LOGOS = spec.cards.some((c) => c.logo), CW = LOGOS ? 345 : 320, CH = spec.showSubs ? 160 : 112;
  if (LOGOS) slots.forEach((sl, i) => { if (i >= 3 && i < 6) sl[0] -= 25; if (i === 6) sl[0] -= 12; });   // wider cards: keep the right column inside x 1390   // 320 wide so full product names (e.g. "SAP Business One") fit at 29px
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
.tile i{font-size:150px;color:#fff}.tl{display:flex;flex-direction:column;align-items:center;color:#fff}.tl b{font-size:150px;font-weight:600;line-height:1;letter-spacing:-.04em}.tl span{margin-top:8px;font-size:34px;font-weight:500;opacity:.92;white-space:nowrap}
.hc{position:absolute;width:${CW}px;height:${CH}px;background:#fff;border-radius:20px;border:2px solid #E3E1DC;display:flex;flex-direction:column;justify-content:center;padding:0 26px;gap:8px}
.hc.hl{flex-direction:row;align-items:center;justify-content:flex-start;gap:18px;padding:0 22px}.ht{display:flex;flex-direction:column;gap:8px;min-width:0}.hl .ht b{font-size:28px}
.hc b{white-space:nowrap;font-size:30px;font-weight:500;color:#141A26;letter-spacing:-.01em}.hc span{font-size:20px;color:#7F8794}
svg.arr{position:absolute;inset:0;overflow:visible}
</style>
<svg class="arr" viewBox="0 0 1600 900" width="1600" height="900"><defs><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter></defs>
<g filter="url(#rough)" fill="none" stroke="#141A26" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${arrows}</g></svg>
<div class="tile">${spec.hubLabel ? `<div class="tl"><b>${esc(spec.hubLabel.big)}</b><span>${esc(spec.hubLabel.small || '')}</span></div>` : `<i class="${esc(spec.hubIcon || 'ph-fill ph-buildings')}"></i>`}</div>${cards}`;
}

// "prompt" mode (Granola "Introducing Recipes"): a faded app panel, a big headline over it, a pill input bar with chips.
function prompt() {
  const rows = spec.panel.rows.map((r, i) => `<div class="pr" style="opacity:${[1, 0.72, 0.48][i] ?? 0.35}"><i class="ph ph-file-text"></i><div><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></div></div>`).join('');
  const chips = spec.chips.map((t) => `<span class="chip"><i></i>${esc(t)}</span>`).join('');
  return `<style>
</style><div style="position:absolute;inset:0;background:${spec.field !== 'soft' ? 'linear-gradient(180deg,#F7FBFF 0%,#EAF5FE 38%,#A9DCFB 78%,#7CC8F8 100%)' : 'linear-gradient(160deg,#EEF6FE 0%,#D6EAFC 50%,#BFDDFA 100%)'}"></div><style>
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
.skf .skh{padding-right:200px;font-size:48px;font-weight:600;color:#141A26;letter-spacing:-.02em}.skf .skl,.skf .sku{max-width:740px}.skf .skl{font-size:40px;color:#5D6675}.skf .skl b{color:#141A26}
.skit{position:absolute;right:64px;top:56px;width:156px;height:156px;border-radius:40px;background:linear-gradient(160deg,#3B86F0,#0A5FD8);display:grid;place-items:center;font-size:92px;color:#fff;box-shadow:0 14px 30px rgba(10,95,216,.22)}
.skw{position:absolute;left:270px;top:50%;width:1060px;transform:translateY(-42%)}.skw .sk{position:absolute;left:0;right:0;top:auto;width:auto;height:auto}
.skw .sk1{left:120px;right:120px;top:-90px;bottom:90px}.skw .sk2{left:60px;right:60px;top:-45px;bottom:45px}.skw .skf{position:relative;height:auto;padding-bottom:64px}
</style>
<div class="skw"><div class="sk sk1"></div><div class="sk sk2"></div>
<div class="sk skf"><div class="skit"><i class="${esc(spec.icon || 'ph ph-clipboard-text')}"></i></div><div class="skh">${esc(spec.title)}</div><div class="skl">${lead}</div><ul class="sku">${spec.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div></div>`;
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
.wl h2{margin:16px 0 4px;white-space:nowrap;font-size:${Math.min(42, Math.floor(552 / (String(spec.list.heading || "").length * 0.56 || 1)))}px;font-weight:600;letter-spacing:-.02em}.wl .ws{font-size:22px;color:#7F8794;margin-bottom:22px}
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
.ch{display:flex;align-items:center;justify-content:space-between}.ch b{font-size:40px;font-weight:600;letter-spacing:-.02em}
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
  const rows = spec.card.rows.map((r, i) => `<div class="sr${i === (spec.card.highlight === undefined ? 0 : spec.card.highlight) ? ' a' : ''}"><div><b>${logo(r.logo, 40)}${esc(r.name)}</b><em>${esc(r.value)}</em></div><i><i style="width:${Math.round(((r.pct || 1) / max) * 100)}%"></i></i></div>`).join('');
  return `<style>
.sv{position:absolute;left:205px;top:230px;font-size:${Math.min(spec.valueSize || 210, Math.floor(690 / (String(spec.value).length * 0.6)))}px;font-weight:600;letter-spacing:-.055em;line-height:1;color:#0A5FD8;${spec.valueColor === 'navy' ? 'color:#0E2A5C;' : spec.valueColor !== 'blue' ? 'background:linear-gradient(180deg,#4E9BF7,#1F6FE8);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:12px;' : ''};white-space:nowrap}
.sc{position:absolute;left:212px;top:470px;width:620px;font-size:40px;font-weight:500;line-height:1.25;color:#141A26;letter-spacing:-.015em}
.ss{position:absolute;left:212px;top:620px;width:600px;font-size:26px;line-height:1.4;color:#7F8794}
.scard{position:absolute;right:210px;top:250px;width:max-content;min-width:430px;max-width:490px;box-sizing:border-box;background:#fff;border-radius:24px;padding:42px 44px;box-shadow:0 24px 50px rgba(30,60,110,.12),0 0 0 1px rgba(20,26,38,.05)}
.scard h3{margin:0 0 26px;font-size:28px;font-weight:500;color:#5D6675}
.sr{margin-bottom:24px}.sr div{display:flex;justify-content:space-between;align-items:baseline;font-size:25px;color:#7F8794}.sr b{font-weight:500;white-space:nowrap;display:flex;align-items:center;margin-right:24px}.sr em{font-style:normal;white-space:nowrap}
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
  const list = spec.rows.slice(0, 6);
  const rows = list.map((r, i) => `<div class="rr${i === win ? ' w' : ''}"><span class="rn">${String(i + 1).padStart(2, '0')}</span><b>${logo(r.logo, 40)}${esc(r.name)}</b><i><i style="width:${Math.max(4, Math.round((r.pct / max) * 100))}%"></i></i><em>${esc(r.value)}</em></div>`).join('');
  // Rows sit in a white card and the whole block (headline + card) is centred vertically, slightly above centre,
  // so 3 rows don't leave the bottom half empty. Fewer rows get taller bars and more air.
  const n = list.length, barH = n <= 3 ? 60 : n <= 4 ? 52 : 44, gap = n <= 3 ? 34 : n <= 4 ? 28 : 20;
  const headH = spec.sub ? 130 : 76, cardH = 2 * 52 + n * barH + (n - 1) * gap;
  const top = Math.max(70, Math.round((900 - (headH + 48 + cardH)) / 2) - 16);
  return `<style>
.rh{position:absolute;left:210px;top:${top}px;font-size:56px;font-weight:600;letter-spacing:-.03em;color:#0E2A5C;line-height:1.2}
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
.fh{position:absolute;left:50%;top:176px;transform:translateX(calc(-50% - 3px));width:1120px;text-align:center;font-size:64px;font-weight:300;line-height:1.12;letter-spacing:-.035em;color:#3D4A5C}
.sel{position:relative;display:inline-block;padding:2px 18px 8px;margin:0 0 0 4px;font-weight:400;${ANCHOR}}
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
// ---- Headline layouts (after Chatbase): versus/pills, versus/connect, versus/slash, dark ----
// Bold names or a big tight headline (key phrase in blue via {{ }}); colour in a few clean shapes.
// Shapes use a near-solid vivid blue with a faint tonal drift and fine grain; "color" swaps in a brand hex.
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
// headline markup: {{key phrase}} = blue gradient text, "\n" = line break
const cbHl = (t) => esc(t).replace(/\{\{([\s\S]+?)\}\}/g, '<span class="bt">$1</span>').replace(/\n/g, '<br>');
const cbFs = (t, max, width) => { const lines = String(t).replace(/\{\{|\}\}/g, '').split('\n'); const long = Math.max(...lines.map((l) => l.length)); return Math.min(max, Math.floor(width / (Math.max(long, lines.length > 1 ? 1 : long / 2.4) * 0.5))); };
const CB_CSS = `<style>.cbf{position:absolute;inset:0}.cbh{position:absolute;font-weight:700;letter-spacing:-.045em;line-height:1.02;color:#0A0A0B}
.bt{background:linear-gradient(180deg,#1E88F5,#0F6FE0);-webkit-background-clip:text;background-clip:text;color:transparent}
.ct{position:absolute;background:#fff;display:grid;place-items:center;overflow:hidden}.ct .lg{background:transparent;box-shadow:none;padding:0}.ct .lg:not(.full){border-radius:0;overflow:visible}
.ct:has(.lg.full) .lg{width:100%!important;height:100%!important;border-radius:0}
.cbm{position:absolute;left:210px;top:90px;width:96px;height:96px;border-radius:24px}</style>`;
const cbTile = (d, S, x, y, round = 0.22, label = '') => `<div class="ct" style="left:${x}px;top:${y}px;width:${S}px;height:${S}px;border-radius:${Math.round(S * round)}px;box-shadow:0 10px 26px rgba(10,40,120,.12)">${logo(d, Math.round(S * 0.62), label)}</div>`;
// White frame: a white design always sits in a white rounded panel inset 28px on a light-grey frame,
// so the featured image reads as its own block on a white blog page. Inner content keeps canvas coordinates.
const cbFramed = (inner, right = 28) => `<div class="cbf" style="background:#F2F2F3"></div><div style="position:absolute;left:28px;top:28px;right:${right}px;bottom:28px;border-radius:28px;background:#fff;overflow:hidden"><div style="position:absolute;left:-28px;top:-28px;width:1600px;height:900px">${inner}</div></div>`;
const cbMark = () => brand.markUrl ? `<img class="cbm" src="${brand.markUrl}" alt="">` : '';

// "versus/pills": grey canvas, two white panels; two blue pills face each other with the logos at the tips; the question below
function cbVersusPills() {
  const L = spec.left, R = spec.right, P = cbPal(spec.color), Pr = { ...P, stops: [...P.stops].reverse() };
  const head = spec.headline || `${L.label} or\n{{${R.label}?}}`, fs = cbFs(head, 108, 1300);
  return `${CB_CSS}<div class="cbf" style="background:#F2F2F3"></div>
<div style="position:absolute;left:28px;right:28px;top:28px;height:380px;border-radius:28px;background:#fff;overflow:hidden">
<svg width="1544" height="380" style="position:absolute;inset:0"><defs>${wcDefs('va', Pr, 6, [0, 0, 1, 0])}${wcDefs('vb', P, 11, [0, 0, 1, 0])}</defs>
<rect x="-60" y="80" width="760" height="210" rx="105" fill="url(#vag)" filter="url(#vaf)"/><rect x="844" y="80" width="760" height="210" rx="105" fill="url(#vbg)" filter="url(#vbf)"/></svg>
${cbTile(L.logo, 150, 520, 110, 0.5, L.label)}${cbTile(R.logo, 150, 874, 110, 0.5, R.label)}</div>
<div style="position:absolute;left:28px;right:28px;top:436px;bottom:28px;border-radius:28px;background:#fff;display:grid;place-items:center">
<div class="cbh" style="position:static;font-size:${fs}px;text-align:center">${cbHl(head)}</div></div>`;
}

// "dark": black field, site mark, tag pill, white headline; right = a panel in the brand colour with the white logo
function cbDark() {
  const P = cbPal(spec.color || '#2A74FB'), fs = cbFs(spec.headline, 112, 620), d = spec.panelLogoUrl || spec.panelLogo;
  return `${CB_CSS}<div class="cbf" style="background:#0A0A0B"></div>${cbMark()}
<div style="position:absolute;left:210px;bottom:110px;width:620px">
${spec.tag ? `<div style="display:inline-flex;align-items:center;gap:14px;padding:16px 30px;border-radius:999px;border:1.5px solid #2A2A2E;color:#D4D4D8;font-size:30px;margin-bottom:36px"><i style="width:14px;height:14px;border-radius:50%;background:${P.stops[2]};display:block"></i>${esc(spec.tag)}</div>` : ''}
<div class="cbh" style="position:static;font-size:${fs}px;font-weight:500;letter-spacing:-.035em;color:#fff">${cbHl(spec.headline)}</div></div>
<div style="position:absolute;left:860px;top:28px;right:28px;bottom:28px;border-radius:28px;overflow:hidden">
<svg width="712" height="844" style="position:absolute;inset:0"><defs>${wcDefs('dk', P, 5, [0, 0, 1, 1])}</defs><rect width="712" height="844" fill="url(#dkg)" filter="url(#dkf)"/></svg>
<div style="position:absolute;inset:0;display:grid;place-items:center">${d ? whiteMark(d, spec.product || '', 190) : ''}</div></div>${WM_CSS}${WHITE_MARK_JS}`;
}


// "versus/connect": centred headline with a gradient phrase, a divider
// with a sparkle, two big logo tiles linked by thin wavy strands to a white VS circle; small dot patches top-left and top-right.
function cbVersusConnect() {
  const L = spec.left, R = spec.right, head = spec.headline || `{{${L.label} vs}}\n${R.label}`, fs = cbFs(head, 104, 900);   // bold display type runs wide: 900 keeps a long first line clear of the corner dot patches
  const S = 240, cy = 620, lx = 330, rx = 1270, cr = 74;
  const dots = (x0) => { let d = ''; for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) d += `<circle cx="${x0 + c * 22}" cy="${70 + r * 22}" r="2.6"/>`; return d; };
  const wave = (x1, x2, a, ph) => { const k = (x2 - x1) * 0.42; return `M${x1} ${cy} C ${x1 + k} ${cy - a * ph}, ${x2 - k} ${cy + a * ph}, ${x2} ${cy}`; };   // one long gentle S per strand; the pair crosses mid-way
  const le = lx + S / 2 + 10, re = rx - S / 2 - 10;
  const strands = [wave(le, 800 - cr, 34, 1), wave(le, 800 - cr, 34, -1), wave(800 + cr, re, 34, 1), wave(800 + cr, re, 34, -1)].map((d) => `<path d="${d}"/>`).join('');
  return `${CB_CSS}<style>.bt2{background:linear-gradient(90deg,#1E88F5,#0F6FE0 60%,#2E6BFF);-webkit-background-clip:text;background-clip:text;color:transparent}</style>
${cbFramed(`<div style="position:absolute;inset:0;background:radial-gradient(60% 45% at 50% 82%,rgba(47,123,255,.09),transparent 70%)"></div>
<svg width="1600" height="900" style="position:absolute;inset:0"><defs><linearGradient id="fdL" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="fdm" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="dmk"><rect width="1600" height="900" fill="url(#fdm)"/></mask></defs>
<g fill="#C3CAD8">${dots(96)}${dots(1350)}</g>
<g stroke="#9DB8F2" stroke-width="2" fill="none" stroke-linecap="round">${strands}</g>
<g fill="#fff" stroke="#9DB8F2" stroke-width="2.5"><circle cx="${le}" cy="${cy}" r="8"/><circle cx="${re}" cy="${cy}" r="8"/></g>
<g stroke="#9DB8F2" stroke-width="2"><line x1="590" y1="372" x2="770" y2="372"/><line x1="830" y1="372" x2="1010" y2="372"/></g>
<path d="M800 356 C802 368 804 370 816 372 C804 374 802 376 800 388 C798 376 796 374 784 372 C796 370 798 368 800 356Z" fill="#2F6BFF"/></svg>
<div class="cbh" style="left:0;right:0;top:118px;text-align:center;font-size:${fs}px">${cbHl(head).replace(/class="bt"/g, 'class="bt2"')}</div>
${cbTile(L.logo, S, lx - S / 2, cy - S / 2, 0.24, L.label)}${cbTile(R.logo, S, rx - S / 2, cy - S / 2, 0.24, R.label)}
<div style="position:absolute;left:${800 - cr}px;top:${cy - cr}px;width:${cr * 2}px;height:${cr * 2}px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 12px 30px rgba(47,90,200,.16),0 0 0 1px rgba(47,90,200,.08)"><b class="bt2" style="font-size:46px;font-weight:800;letter-spacing:-.03em">VS</b></div>`)}`;
}

// "versus/slash": black field with a fine dot grid, the two names in heavy caps
// (a coloured part each), a big italic VS with a glowing diagonal streak. The {{ }} part of each label takes that side's colour.
function cbVersusSlash() {
  const L = spec.left, R = spec.right;
  const split = (t) => /\{\{/.test(t) ? t : (t.trim().includes(' ') ? t.trim().replace(/^(.*)\s(\S+)$/, '$1\n{{$2}}') : `{{${t}}}`);
  const name = (t, col) => esc(split(t)).replace(/\{\{([\s\S]+?)\}\}/g, `<span style="color:${col}">$1</span>`).replace(/\n/g, '<br>');
  const longest = Math.max(...[L.label, R.label].flatMap((t) => split(t).replace(/\{\{|\}\}/g, '').split('\n')).map((l) => l.length));
  const fs = Math.min(104, Math.floor(500 / (longest * 0.88)));   // Poppins 800 caps ~0.88em per letter; names stay inside x 210-1390   // Poppins 800 caps run ~0.9em per letter
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
// turn each panel mark white: estimate the background from the corners, keep the ink as alpha
function duoWhite(img){if(img.dataset.done)return;img.dataset.done=1;try{const w=img.naturalWidth,h=img.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(img,0,0);
const id=x.getImageData(0,0,w,h),d=id.data,px=(a,b)=>(b*w+a)*4,cs=[[1,1],[w-2,1],[1,h-2],[w-2,h-2]].map(([a,b])=>d.subarray(px(a,b),px(a,b)+4));
const opaque=cs.every((p)=>p[3]>200),bg=opaque?[0,1,2].map((k)=>cs.reduce((s,p)=>s+p[k],0)/4):null;
for(let i=0;i<d.length;i+=4){let a=d[i+3]/255;if(bg){const dist=(Math.hypot(d[i]-bg[0],d[i+1]-bg[1],d[i+2]-bg[2])-45)/110;a=Math.max(0,Math.min(1,dist))*a;}else{const lum=(d[i]+d[i+1]+d[i+2])/765;a=a*(lum>0.92?0:1);}
d[i]=d[i+1]=d[i+2]=255;d[i+3]=Math.round(a*255);}
x.putImageData(id,0,0);let x0=w,y0=h,x1=-1,y1=-1;for(let b=0;b<h;b++)for(let a=0;a<w;a++)if(d[(b*w+a)*4+3]>40){if(a<x0)x0=a;if(a>x1)x1=a;if(b<y0)y0=b;if(b>y1)y1=b;}
if(x1<0){img.src=c.toDataURL('image/png');return;}const cw=x1-x0+1,ch=y1-y0+1,o=document.createElement('canvas');o.width=cw;o.height=ch;o.getContext('2d').drawImage(c,x0,y0,cw,ch,0,0,cw,ch);img.src=o.toDataURL('image/png');
if(cw/ch>2.2&&cw<300){const box=img.closest('.wm');box.style.display='none';const nm=box.nextElementSibling;if(nm){nm.style.fontSize='88px';nm.style.fontWeight='700';nm.style.letterSpacing='-.03em';}return;}
if(cw/ch>2.2){const box=img.closest('.wm');box.style.width='380px';img.style.maxWidth='380px';img.style.width='360px';img.style.height='auto';img.style.maxHeight='120px';const nm=box.nextElementSibling;if(nm)nm.style.display='none';}}catch(e){}}
document.querySelectorAll('img[data-white]').forEach((im)=>{const go=()=>duoWhite(im);if(im.complete&&im.naturalWidth)go();else im.addEventListener('load',go,{once:true});});
</script>`;
const WM_CSS = `<style>.wm .lg{background:transparent!important;box-shadow:none!important;padding:0!important;width:auto!important;height:110px!important;overflow:visible}.wm .lg img{width:auto;max-width:200px;height:110px;object-fit:contain}.wm .lg.full{border-radius:0}</style>`;
const whiteMark = (d, label, size = 110) => `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px"><span class="wm" style="width:200px;height:${size + 10}px;display:grid;place-items:center">${logo(d, size, label).replace('<img ', '<img data-white="1" ')}</span><b style="font-size:46px;font-weight:600;letter-spacing:-.02em;color:#fff">${esc(label)}</b></div>`;
// "versus/duo" (user reference, Chatbase "Zendesk and Zendesk Sunshine"): black field, tag pill and a big light-weight white
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
<b style="font-size:46px;font-weight:600;letter-spacing:-.02em;color:#fff">${esc(d.label)}</b></div></div>`;
  };
  return `${CB_CSS}<style>.wm .lg{background:transparent!important;box-shadow:none!important;padding:0!important;width:auto!important;height:110px!important;overflow:visible}.wm .lg img{width:auto;max-width:200px;height:110px;object-fit:contain}.wm .lg.full{border-radius:0}</style>
<div class="cbf" style="background:#0A0A0B"></div>
${spec.tag ? `<div style="position:absolute;left:96px;top:90px;display:inline-flex;align-items:center;gap:14px;padding:14px 28px;border-radius:999px;border:1.5px solid #2A2A2E;color:#D4D4D8;font-size:30px"><i style="width:14px;height:14px;border-radius:50%;background:#F472B6;display:block"></i>${esc(spec.tag)}</div>` : ''}
<div class="cbh" style="left:96px;top:${spec.tag ? 190 : 110}px;width:1180px;font-size:${fs}px;font-weight:500;letter-spacing:-.035em;color:#fff">${cbHl(head).replace(/class="bt"/g, 'style="color:#fff"')}</div>
${panel(L, 0, 28)}${panel(R, 1, 816)}
${WHITE_MARK_JS}`;
}

const modes = { versus, hub, prompt, stack, window: appwin, timeline, checklist, stat, ranked, focus, dark: cbDark };


// ---- heading must mirror the blog title: same key words, same meaning, just shorter ----
const STOP = new Set('a an the and or of for to in on at by with your you our is are be how what why when which who vs versus its it this that from into without about best top guide per 2024 2025 2026 2027'.split(' '));
const stem = (w) => w.endsWith('sses') ? w.slice(0, -2) : w.endsWith('ss') ? w : w.length > 4 && /(ches|shes|xes|zes)$/.test(w) ? w.slice(0, -2) : w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w;
const words = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9+ ]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)).map(stem);
const HEADING = { dark: spec.headline, versus: ['pills', 'connect', 'duo'].includes(spec.variant) ? spec.headline : undefined, prompt: spec.headline, timeline: spec.headline, ranked: spec.headline, stack: spec.title, checklist: spec.title, window: spec.list && spec.list.heading, stat: spec.caption };
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
// ---- variety (forceful): every render is recorded in ONE site-wide history (per brand), wherever its output folder is.
// A layout (mode + variant) never repeats in a category until every layout has been used there; same-topic articles never share a mode.
const MODE = spec.mode || 'before-after';
const ALL_MODES = Object.keys(LAYOUTS);
if (!ALL_MODES.includes(MODE)) { console.error(`Unknown mode "${MODE}". Modes: ${ALL_MODES.join(', ')}`); process.exit(1); }
const VARIANT = spec.variant || LAYOUTS[MODE][0];
if (!LAYOUTS[MODE].includes(VARIANT)) { console.error(`Unknown variant "${VARIANT}" for ${MODE}. Variants: ${LAYOUTS[MODE].join(', ')}`); process.exit(1); }
const LAYOUT = `${MODE}/${VARIANT}`;
const ALL_LAYOUTS = ALL_MODES.flatMap((m) => LAYOUTS[m].map((v) => `${m}/${v}`));
const layoutOf = (e) => e.layout || `${e.mode}/${(LAYOUTS[e.mode] || ['default'])[0]}`;
// defaults match the reference set (references/approved/)
// Backgrounds: light = sky, paper, cream, g5; vibrant = blue (about 1 in 3, shared with the black headline layouts).
// Background fit: each layout lists only the backgrounds that flatter its illustration, best first.
// Judged on figure/ground contrast, temperature harmony and colour dosage:
//  - grey-heavy illustrations (bars, skeletons, unchecked boxes) need colour behind them: sky or g5
//  - illustrations that already carry colour (giant number, pill bar) sit well on a quiet neutral: paper or cream
//  - big white app windows sit on sky; cool greys never go on cream
//  - blue dosage: a big blue mass (hub tile) gets a neutral field (cream/paper), never g5
//  - g5 lifts a single floating white card with light rising under it
const BG_FIT = { checklist: ['g5', 'sky'], hub: ['cream', 'paper'], ranked: ['sky', 'g5'], focus: ['sky', 'g5'], timeline: ['cream', 'sky'], window: ['sky', 'g5'], stat: ['paper', 'cream'], prompt: ['paper', 'sky'], stack: ['g5', 'cream'], 'before-after': ['g5', 'sky'], versus: ['sky', 'cream'] };
// Chatbase-style layouts paint their own canvas (white in a grey frame, or black); 'dark' counts as vibrant
const CB_LAYOUT = MODE === 'dark' || ['versus/pills', 'versus/connect', 'versus/slash', 'versus/duo'].includes(LAYOUT);
const VIVID = MODE === 'dark' || ['versus/slash', 'versus/duo'].includes(LAYOUT);   // black fields count as vibrant (1 in 3, never neighbours)
Object.assign(BG_FIT, { dark: ['paper'] });
const DEFAULT_BG = Object.fromEntries(Object.entries(BG_FIT).map(([m, l]) => [m, l[0]]));
const BGS = ['sky', 'paper', 'cream', 'g5'];
const BG_OK = [...BGS, 'blue'];
if (spec.bg && !BG_OK.includes(spec.bg)) {
  console.error(`BACKGROUND CHECK FAILED: "${spec.bg}" is not a background. Use a light background (${BGS.join(', ')}) or the vibrant "blue".`);
  process.exit(2);
}
const category = spec.category || spec.brand || 'default';
const brandKey = (spec.brand || 'default').replace(/[^a-z0-9-]/gi, '');
const ledgerFile = path.join(path.dirname(outDir), '.featured-ledger.json');
const historyDir = process.env.FEATURED_HISTORY_DIR || path.join(os.homedir(), '.blog-featured-images');
const historyFile = path.join(historyDir, `history-${brandKey}.json`);
const readJson = (f) => { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : []; } catch { return []; } };
const ledger = readJson(ledgerFile), siteHistory = readJson(historyFile);
const bySlug = new Map();
// Merge per slug, newest entry wins (a stale folder ledger must never override a newer site-history reservation).
for (const e of [...siteHistory, ...ledger].sort((x, y) => String(x.at).localeCompare(String(y.at)))) bySlug.set(e.slug, { ...bySlug.get(e.slug), ...e });
const history = [...bySlug.values()].sort((x, y) => String(x.at).localeCompare(String(y.at)));
const prior = history.filter((e) => e.category === category && e.slug !== slug);
const force = args.includes('--force');
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
const sameTopic = topic ? history.filter((e) => e.topic === topic && e.slug !== slug) : [];
if (sameTopic.some((e) => e.mode === MODE) && !force) {
  console.error(`VARIETY CHECK FAILED: another article on topic "${topic}" (${sameTopic.filter((e) => e.mode === MODE).map((e) => e.slug).join(', ')}) already uses mode "${MODE}".
Same-topic articles must use different compositions. Used for this topic: ${sameTopic.map((e) => e.mode).join(', ')}`);
  process.exit(2);
}
const uses = Object.fromEntries(ALL_LAYOUTS.map((l) => [l, prior.filter((e) => layoutOf(e) === l).length]));
const minUse = Math.min(...ALL_LAYOUTS.filter((l) => !REPEATABLE[l]).map((l) => uses[l]));
const allowed = ALL_LAYOUTS.filter((l) => (uses[l] === minUse || (REPEATABLE[l] && uses[l] < REPEATABLE[l])) && !sameTopic.some((e) => l.startsWith(e.mode + '/')));
if (uses[LAYOUT] > minUse && !(REPEATABLE[LAYOUT] && uses[LAYOUT] < REPEATABLE[LAYOUT]) && !force) {
  const users = prior.filter((e) => layoutOf(e) === LAYOUT).map((e) => e.slug);
  console.error(`VARIETY CHECK FAILED: layout "${LAYOUT}" is already used in "${category}" by: ${users.join(', ')}.
A layout may not repeat in a category until every layout has been used there (site-wide history: ${historyFile}).
Pick one of: ${allowed.join(', ')}  (set "mode", and "variant" when it is not "default")`);
  process.exit(2);
}
// vibrant images (deep-dunes blue, black headline layouts): at most 1 in 3 per category, never two neighbours
if ((spec.bg === 'blue' || VIVID) && !force) {
  const lastTwo = prior.filter((e) => !e.reserved).slice(-2);
  if (lastTwo.some((e) => e.vibrant || e.bg === 'blue')) {
    console.error(`VIBRANT CHECK FAILED: a recent "${category}" image already uses the vibrant blue field (${lastTwo.filter((e) => e.vibrant || e.bg === 'blue').map((e) => e.slug).join(', ')}).
Mix vibrant with subtle: at most 1 in 3 images, never on neighbours. Use a light background (sky, paper, cream, g5) for this one.`);
    process.exit(2);
  }
}
// site mark + series tag: some images, never all. At most 1 in 3 per category, never on two neighbours.
if (spec.craft === true && spec.series && !force) {
  const lastTwo = prior.filter((e) => !e.reserved).slice(-2);
  if (lastTwo.some((e) => e.series)) {
    console.error(`SERIES CHECK FAILED: the site mark was used on a recent "${category}" image (${lastTwo.filter((e) => e.series).map((e) => e.slug).join(', ')}).
Use it on at most 1 in 3 images and never on neighbours. Remove "series" from this spec.`);
    process.exit(2);
  }
}
let BG = spec.bg || (CB_LAYOUT ? 'paper' : DEFAULT_BG[MODE]);
const prevBg = prior.length ? prior[prior.length - 1].bg : null; // history is sorted by time
const FIT = CB_LAYOUT ? ['paper'] : BG_FIT[MODE] || ['sky', 'g5'];
// Vibrant fit: the deep-dunes blue flatters only illustrations built on a big white card.
// Blue-heavy illustrations and floating logo tiles never go on blue.
const BLUE_FIT = ['checklist', 'versus/table', 'window', 'before-after/flow'];
if (spec.bg === 'blue' && !BLUE_FIT.includes(MODE) && !BLUE_FIT.includes(LAYOUT) && !force) {
  console.error(`VIBRANT FIT FAILED: the ${LAYOUT} illustration doesn't look good on the vibrant blue. Use blue only with: ${BLUE_FIT.join(', ')}.`);
  process.exit(2);
}
if (!spec.bg && BG === prevBg) BG = FIT.find((b) => b !== prevBg) || BG;   // neighbours differ, but only within the layout's fitting backgrounds
if (spec.bg && spec.bg !== 'blue' && !FIT.includes(spec.bg) && !force) {
  console.error(`BACKGROUND FIT FAILED: "${spec.bg}" doesn't flatter the ${MODE} illustration. Use ${FIT.map((b) => `"${b}"`).join(' or ')} (or the vibrant "blue").`);
  process.exit(2);
}
// texture (edge guide lines + a few margin accent dots) = the anti-bland structure layer. On by default for 'sky'/'paper'
// backgrounds; opt in elsewhere with "texture": true. Off when the frame grid is on (never both).
const FRAME_ON = spec.bg !== 'blue' && (spec.frame ?? FRAME_DEFAULT[MODE] ?? false);
const TEX = !FRAME_ON && !CB_LAYOUT && (spec.texture ?? (['sky', 'paper'].includes(BG) || ['checklist', 'ranked', 'focus', 'versus', 'before-after', 'stack'].includes(MODE)));
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
const CRAFT = spec.craft === true;
// text and structure that sit directly on a saturated field turn white
const FIELD_CSS = `body.fd .fleg span,body.fd .fleg .f1,body.fd .fleg .f2{color:#fff}body.fd .fleg i{background:#fff !important}body.fd .fleg .f1{opacity:.75}
body.fd .lgs b,body.fd .l1 b,body.fd .l2 b{color:#fff}body.fd .lgs > span{background:rgba(255,255,255,.16);color:#fff;box-shadow:0 0 0 1px rgba(255,255,255,.28)}
body.fd .lgv{box-shadow:0 0 0 6px rgba(255,255,255,.9)}body.fd .lgband{border-color:rgba(255,255,255,.3);background:repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 2px,transparent 2px 16px)}
body.fd .tex .acc{display:none}body.fd .tex{background:linear-gradient(rgba(255,255,255,.22),rgba(255,255,255,.22)) 210px 0/1px 100% no-repeat,linear-gradient(rgba(255,255,255,.22),rgba(255,255,255,.22)) 1389px 0/1px 100% no-repeat}body.fd .tex .acc{filter:brightness(0) invert(1);opacity:.7}
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
/* focus */
.fh{color:#141A26;font-weight:500;letter-spacing:-.03em}
.fct{font-family:${MONO};text-transform:uppercase;letter-spacing:.08em;font-size:20px;color:#7F8794}
.fr b{font-family:${MONO};font-size:26px;font-weight:500;color:#141A26;text-transform:uppercase}.fr.on b{color:#0A5FD8}
.fr em{color:#141A26}.fr.on em{color:#0A5FD8}
.fr>i{height:22px;border-radius:11px;background:#EEF1F5}.fr>i>i{border-radius:11px;background:#D3D9E2}
.fr.gh>i>i,.fr.gh s{background:#E3E7EE}
/* versus logos */
.lgs.l1 b,.lgs.l2 b{color:#141A26}
.lgs > span{font-family:${MONO};text-transform:uppercase;letter-spacing:.06em;font-size:24px;color:#5D6675;background:#fff}
/* before-after flow */
.fb{background:#fff;border:2px dashed #D3D9E2;box-shadow:none}
.fb .fi{background:#fff;color:#141A26;box-shadow:0 0 0 2px #E3E7EE}.fb b{color:#141A26;font-weight:500}.fb span{font-family:${MONO};color:#8A93A5}
.fa b{color:#141A26;font-weight:600}.fa li{color:#141A26}
.fleg{font-family:${MONO};text-transform:uppercase;font-size:22px;letter-spacing:.06em}.fleg .f1{color:#7F8794}.fleg .f2{color:#0A5FD8}
`;
// field grain: heavy on blue, fine on sky/paper/g5 (multiply, since overlay barely shows on near-white); none on cream.
// "grain": false turns it off on a light field.
const GRAIN = BG === 'blue' || (spec.grain !== false && BG !== 'cream');
const LIGHT_GRAIN = `.bgn{position:absolute;inset:0;pointer-events:none;background-image:${NOISE};background-size:320px;mix-blend-mode:multiply;opacity:.2}`;
const BG_CSS = {
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
${MODE === 'before-after' && spec.variant === 'flow' ? baFlow() : modes[spec.mode] ? modes[spec.mode]() : `<div class="lbl l1" style="top:${baTop}px">${esc(before.label)}</div><div class="lbl l2" style="top:${baTop}px">${esc(after.label)}</div>
<div class="c c1" style="top:${baTop + 90}px"><div class="raw">${before.lines.map(esc).join('<br>')}<span class="caret"></span></div></div>
<svg class="conn" viewBox="0 0 80 900" style="transform:translateY(${baTop + 90 - 250}px)"><path d="M0 ${306 + 42 * (before.lines.length - 1)} H 40 V 440 H 80" fill="none" stroke="#9AA3B2" stroke-width="3" stroke-dasharray="9 9"/></svg>
<div class="c c2" style="top:${baTop + 90}px;height:${baH}px"><h3>${esc(after.heading)}</h3><ul>${after.items.map((t, i) => `<li${i === 0 ? ' class="a"' : ''}>${esc(t)}</li>`).join('')}</ul></div>
${spec.legend ? `<div class="legend" style="top:${baTop + 90 + baH + 64}px"><span class="lg1"><i></i>${esc(spec.legend[0])}</span><span class="lg2"><i></i>${esc(spec.legend[1])}</span></div>` : ''}`}
${cursorLayer()}
<style>${BG_CSS[BG] || ''}</style>
${CRAFT ? `<style>${CRAFT_CSS}</style>${seriesMark}` : ''}${BG === 'cream' ? '' : '<div class="grain"></div>'}</body></html>`;


// Brand colours: swap the default blue palette for the brand's.
const swaps = { '#3B86F0': brand.accentLight, '#0A5FD8': brand.accent, '#27ACF2': brand.sky, '#2C5FAE': brand.labelAfter, '#2C7BD8': brand.legendAfter, '#0E2A5C': brand.headline, '#7C7468': brand.labelBefore };
let out = html;
for (const [k, v] of Object.entries(swaps)) if (v) out = out.split(k).join(v);
// Shadows: none on the vibrant blue; minimal and tinted to the field on light backgrounds.
// 1px "ring" shadows (0 0 0 Npx) are card edges, not drop shadows, and are kept on light fields.
const SHADOW_TINT = { sky: '30,60,110', g5: '30,80,140', paper: '20,26,38', cream: '90,70,40' }[BG] || '30,60,110';
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
fs.rmSync(PROFILE, { recursive: true, force: true });
const master = await sharp(raw).png().toBuffer();
fs.writeFileSync(path.join(outDir, 'master.png'), master);
const crop75 = await sharp(master).extract({ left: 170, top: 0, width: 1260, height: 900 }).toBuffer();
await sharp(crop75).resize(350, 250).png().toFile(path.join(outDir, 'card-350x250.png'));
await sharp(crop75).webp({ quality: 90 }).toFile(path.join(outDir, '7x5.webp'));
await sharp(master).resize(1200, 675).webp({ quality: 90 }).toFile(path.join(outDir, '16x9-1200.webp'));
fs.rmSync(raw);
const entry = { slug, brand: brandKey, category, topic, mode: MODE, variant: VARIANT, layout: LAYOUT, bg: BG, series: !!(CRAFT && spec.series), vibrant: BG === 'blue' || VIVID, out: path.resolve(outDir), at: new Date().toISOString() };
// Parallel renders share these files: take a lock, re-read, then write, so no entry is lost.
fs.mkdirSync(historyDir, { recursive: true });
const lock = historyFile + '.lock';
for (let i = 0; ; i++) {
  try { fs.mkdirSync(lock); break; } catch { if (i > 300) { fs.rmSync(lock, { recursive: true, force: true }); } Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50); }
}
try {
  fs.writeFileSync(ledgerFile, JSON.stringify([...readJson(ledgerFile).filter((e) => e.slug !== slug), entry], null, 1));
  fs.writeFileSync(historyFile, JSON.stringify([...readJson(historyFile).filter((e) => e.slug !== slug), entry], null, 1));
} finally { fs.rmSync(lock, { recursive: true, force: true }); }
console.log(`${outDir}
  layout=${LAYOUT} bg=${BG} category=${category} words=${WORDS}/${MAX_WORDS}`);
