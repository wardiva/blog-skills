// The background picker: the user picks each image's background himself (Oct 2026: "we have so many background why are you fixated on
// just one. show me 12 images and options for backgrounds and i'll select the bg for each").
// Usage:
//   node bgpick.mjs render --brand <brand> [--out <featured-images>] [--user-pick] <spec.json> ...
//       renders each spec on every field its layout can take as a pick (render.mjs --pick-fields), into
//       <featured-images>/_previews/bg/<slug>-<field>/img/. A layout that refuses a pick gets one option, "default" (its own canvas).
//   node bgpick.mjs page --collection <name> --out <picker.html> [--images <featured-images>] <spec.json> ...
//       builds the picker page: one section per image, every rendered option as a thumbnail (<out-dir>/bg/<slug>-<field>.webp, published
//       with the page as its files), an optional note; picks save as you go to the page's db collection <name>, one doc per image (id =
//       slug): {bg, note, at}.
//   node bgpick.mjs apply --picks <picks.json> <spec.json> ...
//       picks.json maps slug -> field (or -> {bg, note}, as the db docs are); writes "bg": <field>, "bgPick": true into each spec,
//       keeping its formatting and line endings (a one-line spec stays on one line). "default" is always accepted (it removes them:
//       the layout's own background) except on ranges "bare", which is white only. A field the layout can't take is refused.
// <featured-images> is the folder the specs sit in (featured-images/specs/<slug>.json -> featured-images), unless --out / --images.
// Each option renders with its own TEMPORARY history (a copy of the site history) and ledger (a copy of the folder's), so every check
// runs as it will on the real render, while the real site history is never touched and options never replace each other's entries.
// An option the renderer refuses (e.g. a picked blue next to a vibrant neighbour) isn't offered. After apply, render each spec as usual
// into featured-images/<slug>, so the site history records the picked field.
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { brandKeyOf, historyFileOf } from './usage.mjs';
import { LAYOUTS, CANVAS_LAYOUTS, PICK_CANVAS } from './layouts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RENDER = path.join(HERE, 'render.mjs');
const [cmd, ...args] = process.argv.slice(2);
const VALUED = ['--brand', '--out', '--images', '--collection', '--picks'];
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const specs = args.filter((a, i) => !a.startsWith('--') && !VALUED.includes(args[i - 1]));
// every background, in the picker's order; "default" = the layout's own canvas (a layout that refuses a pick)
const ORDER = ['sky', 'paper', 'cream', 'g5', 'soft', 'white', 'glow', 'mesh', 'blue', 'default'];
const NAMES = { sky: 'Sky', paper: 'Paper grey', cream: 'Cream', g5: 'Bright glow', soft: 'Soft blue', white: 'White frame', glow: 'Blue glow', mesh: 'Mesh', blue: 'Vibrant blue', default: 'Its own canvas' };
const USAGE = 'Usage: node bgpick.mjs render --brand <brand> [--out <featured-images>] [--user-pick] <spec.json> ...\n'
  + '       node bgpick.mjs page --collection <name> --out <picker.html> [--images <featured-images>] <spec.json> ...\n'
  + '       node bgpick.mjs apply --picks <picks.json> <spec.json> ...';
if (!['render', 'page', 'apply'].includes(cmd) || !specs.length) { console.error(USAGE); process.exit(1); }
for (const f of specs) if (!fs.existsSync(f)) { console.error(`SPEC MISSING: ${f}`); process.exit(1); }

const readSpec = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const slugOf = (f, s) => s.slug || path.basename(f, '.json');
// the layout as the renderer names it: no variant = the mode's default variant (layouts.mjs, first listed; versus -> overlap)
const layoutOf = (s) => { const m = s.mode || 'before-after'; return `${m}/${s.variant || (LAYOUTS[m] || ['default'])[0]}`; };
const imagesDir = (f, flag) => path.resolve(flag || (path.basename(path.dirname(path.resolve(f))) === 'specs' ? path.dirname(path.dirname(path.resolve(f))) : path.dirname(path.resolve(f))));
const optionDir = (fi, slug, field) => path.join(fi, '_previews', 'bg', `${slug}-${field}`);
// the fields this spec's layout takes as a pick, from the renderer's own rule (render.mjs pickRefusal); [] = it refuses a pick
const pickFields = (f) => {
  let out;
  try { out = execFileSync(process.execPath, [RENDER, f, '--pick-fields'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { throw new Error(String(e.stderr || e.message).trim().split('\n')[0]); }
  const m = out.match(/PICK FIELDS (.*)/);
  if (!m) throw new Error(`render.mjs --pick-fields printed no fields for ${f}`);
  return m[1].trim() === 'none' ? [] : m[1].trim().split(/\s+/);
};
// the layouts whose own full canvas would hide a pick (render.mjs pickRefusal), short names for the picker page: pills, ..., prompt
const NO_PICK = CANVAS_LAYOUTS.filter((l) => !PICK_CANVAS.includes(l)).map((l) => l.replace(/^versus\//, '').replace(/\/default$/, ''));
const pool = async (items, n, fn) => { const res = []; let k = 0; await Promise.all(Array.from({ length: n }, async () => { while (k < items.length) { const i = k++; res[i] = await fn(items[i]); } })); return res; };

if (cmd === 'render') {
  const brandArg = opt('--brand') ? brandKeyOf(opt('--brand')) : null;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bfi-bgpick-'));
  const jobs = [], summary = [];
  for (const f of specs) {
    const spec = readSpec(f), slug = slugOf(f, spec), fi = imagesDir(f, opt('--out'));
    const brand = brandArg || brandKeyOf(spec.brand);
    if (spec.brand && brandKeyOf(spec.brand) !== brand) { summary.push({ slug, layout: layoutOf(spec), error: `the spec is for brand "${spec.brand}", not "${brand}"` }); continue; }
    let fields;
    try { fields = pickFields(f); } catch (e) { summary.push({ slug, layout: layoutOf(spec), error: e.message }); continue; }
    const options = fields.length ? fields : ['default'];
    // last run's options for this slug go first, so the page never shows a stale one
    for (const field of ORDER) fs.rmSync(optionDir(fi, slug, field), { recursive: true, force: true });
    const row = { slug, layout: layoutOf(spec), options, ok: [], failed: [] };
    summary.push(row);
    for (const field of options) {
      const o = { ...spec, slug, brand: spec.brand || brand };
      if (field === 'default') { delete o.bg; delete o.bgPick; } else Object.assign(o, { bg: field, bgPick: true });
      // next to the original, so the spec's relative logo paths (../assets/...) still resolve; removed after its render
      const file = path.join(path.dirname(path.resolve(f)), `.${slug}.bg-${field}.json`);
      const dir = optionDir(fi, slug, field), hist = path.join(tmp, `${slug}-${field}`);
      jobs.push({ row, field, file, o, dir, hist, brand, fi });
    }
  }
  await pool(jobs, 4, (j) => new Promise((resolve) => {
    fs.mkdirSync(path.join(j.dir, 'img'), { recursive: true }); fs.mkdirSync(j.hist, { recursive: true });
    // a temporary copy of the site history and of the folder's ledger: same checks as the real render, nothing real is written
    const realHistory = historyFileOf(j.brand), realLedger = path.join(j.fi, '.featured-ledger.json');
    if (fs.existsSync(realHistory)) fs.copyFileSync(realHistory, path.join(j.hist, path.basename(realHistory)));
    if (fs.existsSync(realLedger)) fs.copyFileSync(realLedger, path.join(j.dir, '.featured-ledger.json'));
    fs.writeFileSync(j.file, JSON.stringify(j.o, null, 2) + '\n');
    const p = spawn(process.execPath, [RENDER, j.file, '--out', path.join(j.dir, 'img'), ...(args.includes('--user-pick') ? ['--user-pick'] : [])], { env: { ...process.env, FEATURED_HISTORY_DIR: j.hist } });
    let err = '';
    p.stdout.on('data', () => {}); p.stderr.on('data', (d) => { err += d; });
    p.on('close', (code) => {
      fs.rmSync(j.file, { force: true });
      if (!code && fs.existsSync(path.join(j.dir, 'img', 'master.png'))) j.row.ok.push(j.field);
      else { j.row.failed.push(`${j.field}: ${err.trim().split('\n')[0] || `exit ${code}`}`); fs.rmSync(j.dir, { recursive: true, force: true }); }
      resolve();
    });
  }));
  fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  for (const r of summary) {
    if (r.error) { console.log(`FAIL  ${r.slug} (${r.layout}): ${r.error}`); continue; }
    const ok = ORDER.filter((x) => r.ok.includes(x));
    console.log(`${ok.length ? 'ok  ' : 'FAIL'}  ${r.slug} (${r.layout}): ${ok.length}/${r.options.length} options${ok.length ? ` - ${ok.join(', ')}` : ''}${r.options[0] === 'default' ? ' (refuses a pick: its own canvas only)' : ''}`);
    for (const x of r.failed) console.log(`        not offered: ${x}`);
  }
  const dirs = [...new Set(specs.map((f) => path.join(imagesDir(f, opt('--out')), '_previews', 'bg')))];
  console.log(`${summary.reduce((n, r) => n + (r.ok ? r.ok.length : 0), 0)} options for ${summary.length} images -> ${dirs.join(', ')}`);
  process.exitCode = summary.some((r) => r.error || !r.ok.length) ? 1 : 0;
}

if (cmd === 'page') {
  const coll = opt('--collection'), out = opt('--out');
  if (!coll || !out || !/^[A-Za-z0-9_-]+$/.test(coll)) { console.error('page needs --collection <name> (letters, digits, - and _) and --out <picker.html>'); process.exit(1); }
  const outDir = path.dirname(path.resolve(out));
  fs.mkdirSync(path.join(outDir, 'bg'), { recursive: true });
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  let sections = '', thumbs = 0;
  const ids = [];
  for (const f of specs) {
    const spec = readSpec(f), slug = slugOf(f, spec), fi = imagesDir(f, opt('--images')), title = spec.articleTitle || slug;
    const opts = [];
    for (const field of ORDER) {
      const master = path.join(optionDir(fi, slug, field), 'img', 'master.png');
      if (!fs.existsSync(master)) continue;
      const name = `${slug}-${field}.webp`;
      await sharp(master).resize(720, 405).webp({ quality: 80 }).toFile(path.join(outDir, 'bg', name));
      opts.push([field, `bg/${encodeURIComponent(name)}`]);
      thumbs++;
    }
    if (!opts.length) { console.log(`SKIP  ${slug}: no rendered options in ${path.join(fi, '_previews', 'bg')} (run bgpick.mjs render first)`); continue; }
    ids.push(slug);
    sections += `<section class="img" data-id="${esc(slug)}" aria-labelledby="h-${esc(slug)}"><header><h2 id="h-${esc(slug)}">${esc(title)}</h2><span class="lay">${esc(layoutOf(spec))}</span><span class="pick" aria-live="polite"></span></header>
<div class="opts" role="radiogroup" aria-label="Background for ${esc(title)}">${opts.map(([field, src]) => `<button type="button" class="opt" role="radio" aria-checked="false" data-bg="${field}"><img src="${src}" alt="${esc(title)} on ${NAMES[field]}" width="720" height="405" loading="lazy"><span>${NAMES[field]}</span></button>`).join('')}</div>
<label class="note"><span>Note (optional)</span><textarea rows="1" placeholder="Anything to change on this one"></textarea></label><div class="saved" aria-live="polite"></div></section>\n`;
  }
  const html = `<title>Background Picker</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">
<style>
/* One section per image: a grid of background thumbnails (radio buttons); sticky tally on top. */
:root{--bg:#F4F5F7;--surface:#FFFFFF;--ink:#14171F;--muted:#5F6673;--line:#E2E5EA;--accent:#0A5FD8;--accent-bg:#E8F0FD;--display:"Geist",system-ui,sans-serif;--mono:"Geist Mono",ui-monospace,Consolas,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0F1115;--surface:#171A21;--ink:#ECEEF2;--muted:#9AA2B0;--line:#2A2F3A;--accent:#6AA6FF;--accent-bg:#16243B;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0F1115;--surface:#171A21;--ink:#ECEEF2;--muted:#9AA2B0;--line:#2A2F3A;--accent:#6AA6FF;--accent-bg:#16243B;color-scheme:dark}
*{box-sizing:border-box}[hidden]{display:none!important}
body{background:var(--bg);color:var(--ink);font:15px/1.5 var(--display);padding-inline:16px;padding-block:0 64px;margin:0}
main{max-width:1180px;margin:0 auto}
.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);padding-block:18px 14px;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:8px 24px;align-items:baseline;justify-content:space-between}
h1{font-size:22px;font-weight:600;letter-spacing:-.02em;margin:0}
.tally{font-family:var(--mono);font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.intro{color:var(--muted);max-width:70ch;margin:18px 0 6px}.status{font-family:var(--mono);font-size:12px;color:var(--muted);margin:0 0 8px}
.img{margin-top:36px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px}
.img[data-done="1"]{border-color:var(--accent)}
.img header{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline;margin-bottom:12px}
.img h2{margin:0;font-size:18px;font-weight:600;min-width:0;overflow-wrap:anywhere}.lay{font-family:var(--mono);font-size:12px;color:var(--muted)}.pick{font-family:var(--mono);font-size:12px;color:var(--accent);margin-left:auto}
.opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.opt{display:grid;gap:6px;padding:6px;border-radius:12px;border:2px solid transparent;background:transparent;color:var(--ink);font:500 13px var(--display);cursor:pointer;text-align:left}
.opt img{display:block;width:100%;height:auto;aspect-ratio:16/9;border-radius:8px;background:var(--line);max-width:100%}
.opt:hover{border-color:var(--line)}.opt[aria-checked="true"]{border-color:var(--accent);background:var(--accent-bg)}
.opt[aria-checked="true"] span::after{content:" \\2713";color:var(--accent)}
.opt:focus-visible,textarea:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.note{display:grid;gap:4px;margin-top:12px}.note span{font-size:12px;color:var(--muted);font-family:var(--mono)}
textarea{font:14px/1.4 var(--display);color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:8px 10px;resize:vertical;width:100%}
.saved{font-family:var(--mono);font-size:12px;color:var(--muted);min-height:18px;margin-top:6px}
@media (prefers-reduced-motion:no-preference){.opt{transition:border-color .15s,background .15s}}
</style>
<main>
  <div class="top"><h1>Background Picker</h1><div class="tally" id="tally">0 of ${ids.length} picked</div></div>
  <p class="intro">Every image on every background its layout can take. Click the one you want for each image; you can change your mind any time. Picks save as you go, and Claude reads them from here. Vibrant blue is offered only where all the text sits inside a white card; a layout whose own full canvas would hide a pick (${NO_PICK.join(', ')}) shows that canvas only.</p>
  <p class="status" id="status">Connecting…</p>
${sections}</main>
<script>
(function(){
  const COLL=${JSON.stringify(coll)},secs=[...document.querySelectorAll('.img')],state={},statusEl=document.getElementById('status');let db=null,writable=true;
  const names=${JSON.stringify(NAMES)};
  const sel=(id)=>document.querySelector('.img[data-id="'+CSS.escape(id)+'"]');
  const paint=(id)=>{const sec=sel(id);if(!sec)return;const s=state[id]||{};sec.dataset.done=s.bg?'1':'';
    sec.querySelectorAll('.opt').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.bg===s.bg)));
    sec.querySelector('.pick').textContent=s.bg?('Picked: '+(names[s.bg]||s.bg)):'';const t=sec.querySelector('textarea');if(document.activeElement!==t)t.value=s.note||'';};
  const tally=()=>{document.getElementById('tally').textContent=secs.filter(s=>(state[s.dataset.id]||{}).bg).length+' of '+secs.length+' picked';};
  const local=(()=>{try{return JSON.parse(localStorage.getItem(COLL)||'{}')}catch(e){return {}}})();Object.assign(state,local);secs.forEach(s=>paint(s.dataset.id));tally();
  const save=async(id)=>{const s=state[id],msg=sel(id).querySelector('.saved');try{localStorage.setItem(COLL,JSON.stringify(state))}catch(e){}
    if(!db||!writable){msg.textContent='Not saved (this browser only)';return;}msg.textContent='Saving…';
    try{await db.doc(COLL+'/'+id).set({bg:s.bg||'',note:s.note||'',at:new Date().toISOString()});msg.textContent='Saved';}
    catch(e){if(e&&e.code==='invalid_argument'){writable=false;msg.textContent='You can view this page but not save picks';}else msg.textContent='Could not save. Try again in a moment';}};
  secs.forEach(sec=>{const id=sec.dataset.id,t=sec.querySelector('textarea');let timer=null;
    sec.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{const s=state[id]=state[id]||{};s.bg=b.dataset.bg;paint(id);tally();save(id);}));
    sec.querySelector('.opts').addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key))return;const bs=[...sec.querySelectorAll('.opt')],i=bs.indexOf(document.activeElement);if(i<0)return;e.preventDefault();bs[(i+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:bs.length-1))%bs.length].focus();});
    t.addEventListener('input',()=>{(state[id]=state[id]||{}).note=t.value;clearTimeout(timer);timer=setTimeout(()=>save(id),700);});
    t.addEventListener('blur',()=>{if(timer){clearTimeout(timer);timer=null;save(id);}});});
  (async()=>{try{db=window.claude&&await window.claude.use('db');}catch(e){db=null}
    if(!db){statusEl.textContent='Not saved: picks stay in this browser only. Tell Claude your picks in chat.';return;}
    statusEl.textContent='Picks save automatically.';
    db.collection(COLL).onSnapshot(snap=>{snap.docs.forEach(d=>{if(!d.exists)return;const x=d.data()||{};state[d.id]={bg:x.bg||'',note:x.note||''};paint(d.id);});tally();},()=>{statusEl.textContent='Live sync stopped. Reload the page to reconnect.';});})();
})();
</script>
`;
  fs.writeFileSync(out, html);
  console.log(`${ids.length} images, ${thumbs} thumbnails -> ${path.resolve(out)} (${(html.length / 1024).toFixed(0)} KB) + ${path.join(outDir, 'bg')}`);
  console.log(`Publish it with its files (bg/<slug>-<field>.webp) and the "db" capability; picks land in collection "${coll}", one doc per image (id = slug): {bg, note, at}.`);
}

if (cmd === 'apply') {
  const pf = opt('--picks');
  if (!pf || !fs.existsSync(pf)) { console.error('apply needs --picks <picks.json> (slug -> field)'); process.exit(1); }
  const picks = JSON.parse(fs.readFileSync(pf, 'utf8'));
  let bad = 0;
  for (const f of specs) {
    const text = fs.readFileSync(f, 'utf8'), spec = JSON.parse(text), slug = slugOf(f, spec), raw = picks[slug];
    const pick = raw && typeof raw === 'object' ? raw.bg : raw;
    if (!pick) { console.log(`skip  ${slug}: no pick`); continue; }
    let fields;
    try { fields = pickFields(f); } catch (e) { console.log(`FAIL  ${slug}: ${e.message}`); bad++; continue; }
    // "default" (no pick: the layout's own background) is always accepted, except on ranges "bare": white only (render.mjs refuses it
    // without its picked white)
    const offered = spec.mode === 'ranges' && spec.bare === true ? fields : [...fields, 'default'];
    if (!offered.includes(pick)) { console.log(`FAIL  ${slug}: ${layoutOf(spec)} can't take "${pick}" as a pick (it takes ${offered.join(', ')})`); bad++; continue; }
    let t = text;
    if (!/\r?\n/.test(text.trim())) {
      // a one-line spec: rebuilt from the parsed object, still on one line (the line-anchored edit below can't find its keys
      // and would leave duplicates)
      const j = { ...spec };
      delete j.bg; delete j.bgPick;
      if (pick !== 'default') Object.assign(j, { bg: pick, bgPick: true });
      t = `${text.match(/^\s*/)[0]}${JSON.stringify(j)}${text.match(/\s*$/)[0]}`;
    } else {
      // a multi-line spec: edit the text in place, same indentation, key spacing and line endings as the file
      const eol = text.includes('\r\n') ? '\r\n' : '\n', ind = (text.match(/^\{\s*?\r?\n([ \t]+)"/) || [, '  '])[1];
      const top = (k) => new RegExp(`^${ind}"${k}"\\s*:\\s*(?:"[^"\\r\\n]*"|true|false|null)[ \\t]*,?[ \\t]*\\r?\\n?`, 'm');
      for (const k of ['bg', 'bgPick']) t = t.replace(top(k), '');
      if (pick !== 'default') {
        const end = t.lastIndexOf('}'), head = t.slice(0, end).replace(/[\s,]*$/, '');
        t = `${head},${eol}${ind}"bg": "${pick}",${eol}${ind}"bgPick": true${eol}${t.slice(end)}`;
      } else t = t.replace(/,(\s*\}\s*)$/, '$1');   // "default": the pick fields are gone; no trailing comma left behind
    }
    let ok = false;
    try { const j = JSON.parse(t); ok = pick === 'default' ? j.bg === undefined && j.bgPick === undefined : j.bg === pick && j.bgPick === true; } catch {}
    if (!ok) { console.log(`FAIL  ${slug}: couldn't edit ${f} safely; set "bg": "${pick}", "bgPick": true by hand`); bad++; continue; }
    if (t !== text) fs.writeFileSync(f, t);
    console.log(`ok    ${slug}: ${pick === 'default' ? 'its default background (no "bg")' : `"bg": "${pick}", "bgPick": true`} -> ${f}`);
  }
  console.log(bad ? `${bad} pick(s) not applied` : 'Now render each spec as usual: node render.mjs <spec.json> --out featured-images/<slug>');
  process.exitCode = bad ? 1 : 0;
}
