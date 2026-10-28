#!/usr/bin/env node
// The taste model: what the user approved and disapproved, learned from every design they judged (references/taste-data.json), used
// to predict the verdict on a new design and to keep every new article's design new.
// The user (Oct 28 2026): "train yourself with each feedback I give you, with each image that approves, with each image that
// disapproves, so that when I share for example 20 URL articles with you, you don't repeat the images that has already been used, you
// create a new images with the taste and training that you have acquired so far."
//
//   node taste.mjs predict <design.json>     score a planned design (a "design" object, see below): vetoes, learned score, the
//                                            nearest approved and rejected designs with the user's words, and the novelty check
//   node taste.mjs novelty <design.json>     only the novelty check: is this skeleton new (vs every live and retired layout)?
//   node taste.mjs batch <plan.json>         a batch plan [{ slug, design }]: every design new, distinct within the batch, and predicted
//                                            to pass, before anything is rendered
//   node taste.mjs eval                      honest training check: learn from earlier batches, predict each later batch, report
//   node taste.mjs add <records.json>        learn: append judged designs (the user's verdicts from a review round) to the data
//   node taste.mjs stats                     the learned weight of every feature value (what the model has learned)
//   node taste.mjs selftest                  run by test-examples.mjs: held-out ranking better than chance, the learned weights point
//                                            the right way, every veto and rule fires, novelty and batch twins are caught
//
// A design (and every record in taste-data.json) is described by its features (vocabularies in references/taste-grammar.md):
//   { articleType, source, field, object, logoTreatment, figures, figureHome, composition, scale, shapes, hierarchy, headingSize,
//     words, repeatOnPage, reuseOfApproved, layout? }
// A record adds { id, batch, round, article, verdict: approved | final | disapproved | no-verdict | retired-before-shown, quote }.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = process.env.FEATURED_TASTE_FILE || path.join(here, '..', 'references', 'taste-data.json');
const load = () => JSON.parse(fs.readFileSync(DATA, 'utf8'));
const FEATS = ['articleType', 'source', 'field', 'object', 'logoTreatment', 'figureHome', 'composition', 'scale', 'shapes', 'hierarchy', 'headingSize'];
const SKELETON = ['object', 'composition', 'logoTreatment', 'figureHome'];   // what makes two designs "the same design"
const pos = (r) => r.verdict === 'approved' || r.verdict === 'final';
const neg = (r) => r.verdict === 'disapproved';
// a no-verdict is weak evidence, and the approved references (round "ref") repeat a final: both are left out of training
const judged = (r) => (pos(r) || neg(r)) && r.round !== 'final-replaced' && r.round !== 'ref';
const PROPS = ['folder', 'balance-scale', 'chat', 'compare-page', 'notification-cards', 'search-field', 'polaroids', 'wallet-cards', 'sticky-notes', 'phones', 'laptop-stickers', 'letterboard', 'price-tags', 'keycaps', 'notepad'].map((x) => `other:${x}`);

// Hard vetoes: patterns the user (almost) never approved, in the data and in their own words. Each is a rule, not a weight. Patterns
// the user approved sometimes (competing elements, the navy-blob black, prices on a vs, 2+ figures on a cost image) are learned
// weights below, so the newest batches decide how much they cost (`stats` shows them). Reusing a used layout is not a taste signal:
// the usage rule refuses it (usage.mjs).
const VETO = [
  [(d) => PROPS.includes(d.object), 'props, devices or clip-art ("why are you using mobile mockups"; principle 17)'],
  [(d) => d.figureHome === 'alone-on-field', 'a figure alone on the field (principle 27: a figure lives inside an object)'],
  [(d) => d.shapes === 'decorative', 'decorative shapes: bursts, bubbles, Venn, rims, joins ("disgusting shapes", "ew"; principle 29)'],
  [(d) => d.shapes === '3d', '3D ("we\'re not using 3D anymore"; principle 29)'],
  [(d) => d.source === 'found-source', 'a cover from a site the user never named ("this is bullshit, this is AI scope"; principle 45)'],
  [(d) => d.field === 'outside-gradient', 'another brand\'s gradient ("the gradient looks awful"; principle 28)'],
  [(d) => d.logoTreatment === 'fake-logo', 'a code or letter dressed as a logo tile ("why did you use these logos?"; principle 44)'],
  [(d) => d.composition === 'scattered', 'scattered pieces ("it looks scattered, it looks like AI slop"; principle 22)'],
];

// Learned weights: a logistic regression over the features (one weight per feature value, plus page repeat, word count, prices on a
// vs and 2+ figures on a cost image), fitted to the judged records by gradient descent with an L2 penalty (the data is small, so the
// weights stay modest). Later batches weigh more (the user's taste moves): weight 1 + batch/newest, so about 1.1 for batches 1-4 and 2
// for the newest.
const enc = (d) => [...FEATS.map((k) => `${k}=${d[k]}`), ...(d.repeatOnPage ? ['repeatOnPage'] : []), ...(d.words > 12 ? ['wordy'] : []),
  ...(d.articleType === 'vs' && d.figures > 0 && !d.pricingTitle ? ['vsPrices'] : []), ...(d.articleType === 'cost' && d.figures > 1 ? ['costFigures'] : [])];
function train(records) {
  const tr = records.filter(judged), N = tr.length, P = tr.filter(pos).length, base = (P + 1) / (N + 2);
  const newest = Math.max(...tr.map((r) => parseFloat(r.batch) || 1)), age = (r) => 1 + (parseFloat(r.batch) || 1) / newest;
  const w = {}, X = tr.map(enc), y = tr.map((r) => (pos(r) ? 1 : 0)), sw = tr.map(age);
  let b = Math.log(base / (1 - base));
  for (let it = 0; it < 400; it++) {
    const g = {}; let gb = 0;
    X.forEach((xs, i) => { const z = b + xs.reduce((s, f) => s + (w[f] || 0), 0), e = (1 / (1 + Math.exp(-z)) - y[i]) * sw[i]; gb += e; for (const f of xs) g[f] = (g[f] || 0) + e; });
    const lr = 0.6 / N, L2 = 0.08;
    b -= lr * gb;
    for (const f of new Set([...Object.keys(g), ...Object.keys(w)])) w[f] = (w[f] || 0) - lr * ((g[f] || 0) + L2 * N * (w[f] || 0));
  }
  return { w, b, base, n: N };
}
function score(model, d) {
  const xs = enc(d), parts = xs.filter((f) => model.w[f] != null).map((f) => [f.split('=')[0], f.split('=')[1] ?? true, model.w[f]]);
  const z = model.b + xs.reduce((s, f) => s + (model.w[f] || 0), 0);
  return { p: 1 / (1 + Math.exp(-z)), parts };
}
const vetoes = (d) => VETO.filter(([f]) => f(d)).map(([, why]) => why);
const predict = (model, d) => { const v = vetoes(d), { p, parts } = score(model, d); return { verdict: v.length ? 'reject' : p >= 0.5 ? 'approve' : 'reject', p, vetoes: v, parts }; };
const near = (records, d, ok, n = 3) => records.filter((r) => (ok ? pos(r) : neg(r)) && r.round !== 'final-replaced')
  .map((r) => [FEATS.filter((k) => String(r[k]) === String(d[k])).length + SKELETON.filter((k) => String(r[k]) === String(d[k])).length, r])
  .sort((a, b) => b[0] - a[0]).slice(0, n).map(([sim, r]) => `${r.id} (${r.layout}, ${sim} shared${r.quote ? `; "${String(r.quote).slice(0, 90)}"` : ''})`);

// The user's current rules (batch 8, principles 37 and 41): the history before them approved some of these, so the model learns
// little from them; they are applied to every new design instead (predict and batch), and left out of the eval of past batches.
const RULES = [
  [(d) => d.articleType === 'vs' && d.figures > 0 && !d.pricingTitle, 'prices on an X vs Y image whose title is not about pricing (principle 37: 14 of 15 approved vs finals in batch 8 show no figure)'],
  [(d) => d.articleType === 'cost' && d.figures > 1, 'more than one figure on a cost image (principle 41: one figure, the lead answer, or none)'],
];
const rulesBroken = (d) => RULES.filter(([f]) => f(d)).map(([, why]) => why);
// Novelty: a new design's skeleton (object, composition, logo treatment, figure home) must differ from every layout's skeleton,
// live or retired, on at least two of the four (3 or 4 the same = the same design).
const sameSkeleton = (a, b) => SKELETON.filter((k) => String(a[k]) === String(b[k])).length >= SKELETON.length - 1;
function novelty(records, d) {
  const seen = new Map();
  for (const r of records) if (r.layout && !seen.has(r.layout)) seen.set(r.layout, r);
  const close = [...seen.values()].map((r) => [SKELETON.filter((k) => String(r[k]) === String(d[k])).length, r]).filter(([same]) => same >= SKELETON.length - 1);
  return { isNew: !close.length, close: close.map(([same, r]) => `${r.layout} (${same}/4 the same: ${SKELETON.filter((k) => String(r[k]) === String(d[k])).join(', ')}; ${pos(r) ? 'approved' : neg(r) ? 'rejected' : 'unjudged'})`) };
}

const cmd = process.argv[2], arg = process.argv[3];
const readDesign = (f) => { const j = JSON.parse(fs.readFileSync(f, 'utf8')); return j.design || j; };
if (cmd === 'predict' || cmd === 'novelty') {
  const recs = load(), d = readDesign(arg), nv = novelty(recs, d);
  if (cmd === 'predict') {
    const r = predict(train(recs), d), rb = rulesBroken(d);
    console.log(`PREDICT ${rb.length ? 'REJECT' : r.verdict.toUpperCase()} (approval ${(r.p * 100).toFixed(0)}%)`);
    for (const v of r.vetoes) console.log(`  VETO: ${v}`);
    for (const v of rb) console.log(`  RULE: ${v}`);
    console.log(`  weighs: ${r.parts.map(([k, v, x]) => `${k}=${v} ${x >= 0 ? '+' : ''}${x.toFixed(2)}`).join(', ')}`);
    console.log(`  closest approved: ${near(recs, d, true).join(' | ') || 'none'}`);
    console.log(`  closest rejected: ${near(recs, d, false).join(' | ') || 'none'}`);
  }
  console.log(nv.isNew ? 'NOVELTY OK: a new skeleton' : `NOVELTY FAILED: the same design as ${nv.close.join('; ')}. Change at least two of object, composition, logo treatment, figure home.`);
  // exit 2 when the design is not new, or (predict) predicted to fail; 0 when it can go ahead
  process.exitCode = !nv.isNew || (cmd === 'predict' && (predict(train(recs), d).verdict !== 'approve' || rulesBroken(d).length)) ? 2 : 0;
} else if (cmd === 'batch') {
  // a whole batch plan: [{ slug, design }, …]. Each design must be new (vs the data) and differ from every other design in the batch
  const recs = load(), model = train(recs), plan = JSON.parse(fs.readFileSync(arg, 'utf8'));
  let bad = 0;
  plan.forEach((it, i) => {
    const d = it.design || it, r = predict(model, d), nv = novelty(recs, d);
    const twins = plan.filter((o, j) => j !== i && sameSkeleton(o.design || o, d)).map((o) => o.slug);
    const rb = rulesBroken(d), ok = r.verdict === 'approve' && !rb.length && nv.isNew && !twins.length;
    if (!ok) bad++;
    if (rb.length) r.vetoes.push(...rb.map((x) => `RULE ${x}`));
    console.log(`${ok ? 'OK  ' : 'FIX '} ${String(it.slug).padEnd(48)} ${r.verdict} ${(r.p * 100).toFixed(0)}%${r.vetoes.length ? ` · VETO ${r.vetoes.join('; ')}` : ''}${nv.isNew ? '' : ` · NOT NEW: ${nv.close.join('; ')}`}${twins.length ? ` · SAME SKELETON AS ${twins.join(', ')} in this batch` : ''}`);
  });
  console.log(bad ? `${bad} of ${plan.length} designs need another idea before rendering` : `all ${plan.length} designs are new, distinct and predicted to pass`);
  process.exitCode = bad ? 2 : 0;
} else if (cmd === 'selftest') {
  // run by test-examples.mjs: the model trains, ranks held-out batches better than chance (its learned score alone too, before the
  // vetoes), its learned weights point the right way, every veto and rule fires, a near-twin of an existing layout fails novelty, and
  // batch twins are caught
  const recs = load(), batches = [...new Set(recs.map((r) => r.batch))].sort((a, b) => parseFloat(a) - parseFloat(b)), sc = [];
  for (const b of batches.slice(1)) { const m = train(recs.filter((r) => parseFloat(r.batch) < parseFloat(b))); for (const r of recs.filter((r) => r.batch === b && judged(r) && r.round !== 'final')) { const p = predict(m, r); sc.push([p.vetoes.length ? 0 : p.p, p.p, pos(r)]); } }
  const auc = (i) => { const P = sc.filter((x) => x[2]), N = sc.filter((x) => !x[2]); let w = 0; for (const a of P) for (const b of N) w += a[i] > b[i] ? 1 : a[i] === b[i] ? 0.5 : 0; return w / P.length / N.length; };
  const full = auc(0), raw = auc(1), model = train(recs), fails = [];
  if (!(full > 0.66)) fails.push(`held-out ranking AUC ${full.toFixed(3)} (needs > 0.66)`);
  if (!(raw > 0.55)) fails.push(`held-out ranking AUC of the learned score alone ${raw.toFixed(3)} (needs > 0.55)`);
  const W = (f) => model.w[f] || 0;
  if (!(W('source=user-ref') > 0)) fails.push("the user's own references don't raise the score");
  if (!(W('source=own-parts') < 0)) fails.push("designs from our own parts don't lower the score");
  if (!(W('hierarchy=competing') < 0)) fails.push("competing elements don't lower the score");
  if (!(W('hierarchy=one-leads') > W('hierarchy=competing'))) fails.push("one element leading doesn't beat competing elements");
  const base = { articleType: 'bestof', source: 'user-ref', field: 'white', object: 'one-card', logoTreatment: 'logo-tiles', figures: 0, figureHome: 'none', composition: 'centered', scale: 'big-object', shapes: 'flat', hierarchy: 'one-leads', headingSize: 'medium', words: 5 };
  if (vetoes(base).length || rulesBroken(base).length) fails.push('a clean design is vetoed');
  const probes = [{ object: PROPS[0] }, { figureHome: 'alone-on-field', figures: 1 }, { shapes: 'decorative' }, { shapes: '3d' }, { source: 'found-source' }, { field: 'outside-gradient' }, { logoTreatment: 'fake-logo' }, { composition: 'scattered' }];
  if (probes.length !== VETO.length) fails.push('a veto has no selftest probe');
  probes.forEach((p, i) => { if (VETO[i] && !VETO[i][0]({ ...base, ...p })) fails.push(`veto ${i + 1} doesn't fire on its probe ${JSON.stringify(p)}`); });
  if (!rulesBroken({ ...base, articleType: 'vs', figures: 2, figureHome: 'in-object', pricingTitle: false }).length) fails.push('prices on a non-pricing vs pass the rules');
  if (!rulesBroken({ ...base, articleType: 'cost', figures: 2, figureHome: 'in-object' }).length) fails.push('2 figures on a cost image pass the rules');
  const duel = recs.find((r) => r.layout === 'versus/duel' && pos(r));
  if (!duel) fails.push('versus/duel is missing from the data');
  else {
    if (novelty(recs, duel).isNew) fails.push('the skeleton of versus/duel passes the novelty check');
    const twin = { ...duel, layout: undefined, logoTreatment: duel.logoTreatment === 'bare-marks' ? 'logo-tiles' : 'bare-marks' };   // 3 of 4 axes the same
    if (novelty(recs, twin).isNew) fails.push('a near-twin of versus/duel (3 of 4 axes the same) passes the novelty check');
    if (!sameSkeleton(duel, twin)) fails.push('batch twins (3 of 4 axes the same) are not caught');
  }
  console.log(fails.length ? `TASTE SELFTEST FAILED: ${fails.join('; ')}` : `taste model ok (${recs.length} designs, held-out ranking AUC ${full.toFixed(3)}, learned score alone ${raw.toFixed(3)})`);
  process.exitCode = fails.length ? 1 : 0;
} else if (cmd === 'eval') {
  const recs = load(), batches = [...new Set(recs.map((r) => r.batch))].sort((a, b) => parseFloat(a) - parseFloat(b));
  let tot = 0, hit = 0, tp = 0, fp = 0, fn = 0;
  for (const b of batches.slice(1)) {
    const train_ = recs.filter((r) => parseFloat(r.batch) < parseFloat(b)), test = recs.filter((r) => r.batch === b && judged(r) && r.round !== 'final');
    if (!test.length || !train_.filter(judged).length) continue;
    const m = train(train_);
    let h = 0, p1 = 0, f1 = 0, m1 = 0;
    for (const r of test) { const pr = predict(m, r).verdict === 'approve', ac = pos(r); if (pr === ac) h++; if (pr && ac) p1++; if (pr && !ac) f1++; if (!pr && ac) m1++; }
    tot += test.length; hit += h; tp += p1; fp += f1; fn += m1;
    console.log(`batch ${b}: trained on ${m.n} earlier verdicts, predicted ${test.length}: ${(100 * h / test.length).toFixed(0)}% right (approve predicted right ${p1}, wrong ${f1}; approvals missed ${m1})`);
  }
  console.log(`overall: ${(100 * hit / tot).toFixed(0)}% right over ${tot} verdicts; when it predicts approve it is right ${tp + fp ? (100 * tp / (tp + fp)).toFixed(0) : 0}% of the time; it finds ${(tp + fn) ? (100 * tp / (tp + fn)).toFixed(0) : 0}% of the approvals`);
} else if (cmd === 'add') {
  const recs = load(), add = JSON.parse(fs.readFileSync(arg, 'utf8')), ids = new Set(recs.map((r) => r.id));
  const VERDICTS = ['approved', 'final', 'disapproved', 'no-verdict', 'retired-before-shown'];
  const invalid = add.filter((r) => !r.id || !r.batch || !VERDICTS.includes(r.verdict) || FEATS.some((k) => r[k] == null));
  if (invalid.length) { console.error(`ADD REFUSED (nothing written): ${invalid.length} record(s) without an id, a batch, a verdict (${VERDICTS.join(' | ')}) or every feature (${FEATS.join(', ')}): ${invalid.map((r) => r.id || '(no id)').join(', ')}`); process.exit(2); }
  const fresh = [...new Map(add.filter((r) => !ids.has(r.id)).map((r) => [r.id, r])).values()];
  fs.writeFileSync(DATA, JSON.stringify([...recs, ...fresh], null, 1));
  console.log(`learned ${fresh.length} new judged designs (${add.length - fresh.length} already known or repeated); ${recs.length + fresh.length} in all`);
} else if (cmd === 'stats') {
  const recs = load(), m = train(recs);
  console.log(`${m.n} judged designs; base approval ${(m.base * 100).toFixed(0)}%`);
  for (const k of FEATS) console.log(`${k}: ${Object.entries(m.w).filter(([f]) => f.startsWith(k + '=')).sort((a, b) => b[1] - a[1]).map(([f, x]) => `${f.slice(k.length + 1)} ${x >= 0 ? '+' : ''}${x.toFixed(2)}`).join(' | ')}`);
  console.log(`repeatOnPage ${(m.w.repeatOnPage || 0).toFixed(2)} | over 12 words ${(m.w.wordy || 0).toFixed(2)} | prices on a vs ${(m.w.vsPrices || 0).toFixed(2)} | 2+ figures on cost ${(m.w.costFigures || 0).toFixed(2)}`);
} else {
  console.log('Usage: node taste.mjs predict|novelty <design.json> | batch <plan.json> | eval | add <records.json> | stats | selftest');
  process.exitCode = 1;
}
