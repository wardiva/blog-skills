// Fast parallel article reader (uses the agent-browser CLI: npm i -g agent-browser).
// Usage: node read-articles.mjs <url> [<url> ...] [--out <featured-images>/articles] [--chrome <path>]
// Each URL opens in its own agent-browser session, in parallel. Writes <out>/<slug>.md with the H1,
// headings, paragraphs, lists and tables of the article body, so the Maker and QA agents read a local
// file instead of fetching the page again.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const urls = args.filter((a, i) => /^https?:\/\//.test(a) && !['--out', '--chrome'].includes(args[i - 1]));
if (!urls.length) { console.error('Usage: node read-articles.mjs <url> [<url> ...] [--out <dir>] [--chrome <path>]'); process.exit(1); }
const outDir = path.resolve(opt('--out') || 'featured-images/articles');
fs.mkdirSync(outDir, { recursive: true });
const chrome = opt('--chrome') || process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium',
].find((p) => fs.existsSync(p));

// Runs in the page: pick the element with the most paragraph text (the post body), then serialise it.
const EXTRACT = `(() => {
  const cands = [...document.querySelectorAll('.entry-content, .post-content, [itemprop=articleBody], article, main')];
  const score = (el) => [...el.querySelectorAll('p')].reduce((n, p) => n + p.innerText.length, 0);
  const body = cands.sort((a, b) => score(b) - score(a))[0] || document.body;
  const out = [];
  for (const el of body.querySelectorAll('h2, h3, h4, p, li, table')) {
    if (el.closest('table') && el.tagName !== 'TABLE') continue;
    const t = el.innerText.trim(); if (!t) continue;
    if (el.tagName === 'TABLE') out.push('\\n' + [...el.rows].map((r) => '| ' + [...r.cells].map((c) => c.innerText.trim().replace(/\\s+/g, ' ')).join(' | ') + ' |').join('\\n') + '\\n');
    else if (/^H/.test(el.tagName)) out.push('\\n' + '#'.repeat(+el.tagName[1]) + ' ' + t);
    else if (el.tagName === 'LI') out.push('- ' + t);
    else out.push(t);
  }
  const h1 = (document.querySelector('h1') || {}).innerText || document.title;
  return JSON.stringify({ h1: h1.trim(), body: out.join('\\n') });
})()`;

// Call agent-browser's launcher with node directly (no shell), so paths with spaces survive on Windows.
const abJs = path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'agent-browser', 'bin', 'agent-browser.js');
if (!fs.existsSync(abJs)) { console.error('agent-browser not found. Install it: npm i -g agent-browser'); process.exit(1); }
const env = { ...process.env, ...(chrome ? { AGENT_BROWSER_EXECUTABLE_PATH: chrome } : {}) };
// Resolve on process exit, not pipe close: the agent-browser daemon inherits the pipes and keeps them open.
const run = (session, cmd, input) => new Promise((resolve, reject) => {
  const p = spawn(process.execPath, [abJs, '--session', session, ...cmd], { env, stdio: ['pipe', 'pipe', 'pipe'] });
  let so = '', se = '';
  p.stdout.on('data', (d) => (so += d)); p.stderr.on('data', (d) => (se += d));
  p.on('exit', (code) => setTimeout(() => (code ? reject(new Error(se || so || `exit ${code}`)) : resolve(so)), 50));
  p.stdin.end(input || '');
});

const slugOf = (u) => new URL(u).pathname.split('/').filter(Boolean).pop();
const t0 = Date.now();
const results = await Promise.all(urls.map(async (url, i) => {
  const session = `bfi-read-${process.pid}-${i}`;
  try {
    // one retry for transient network errors (e.g. ERR_QUIC_PROTOCOL_ERROR, timeouts)
    try { await run(session, ['open', url]); } catch (e) { await new Promise((r) => setTimeout(r, 1500)); await run(session, ['open', url]); }
    let raw = (await run(session, ['eval', '--stdin'], EXTRACT)).trim();
    let data = JSON.parse(raw); if (typeof data === 'string') data = JSON.parse(data);
    const file = path.join(outDir, `${slugOf(url)}.md`);
    fs.writeFileSync(file, `# ${data.h1}\n\nSource: ${url}\n\n${data.body}\n`);
    return `ok   ${slugOf(url)}  (${data.body.split(/\s+/).length} words) -> ${file}`;
  } catch (e) {
    return `FAIL ${url}: ${String(e.message).split('\n')[0]}`;
  } finally {
    await run(session, ['close']).catch(() => {});
  }
}));
console.log(results.join('\n'));
console.log(`${urls.length} article(s) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
