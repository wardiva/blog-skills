# Three-agent workflow (required)

Every featured-image request runs with three roles. One agent never both makes and approves an image.

| Role | Who | Does | Never does |
|---|---|---|---|
| **Orchestrator** | The main Claude running this skill | Reads the articles and the site history, plans the batch (layout per article, which ones go on blue), starts the Makers and the QA agent, loops fixes, delivers | Approve images itself |
| **Maker** | Subagents, several in parallel | Writes the spec from the article file's facts, renders it, returns paths + facts used | Choose its own layout, use `--force`, render into another folder to dodge a check |
| **QA** | A separate subagent, fresh context | Checks every image against the checklist below and returns PASS or FAIL with exact fixes | Edit specs or render |

## Fast batch flow (default; the user's rule is "work fast")

1. **Read all URLs in parallel, once** (Orchestrator):
   `node <skill-dir>/scripts/read-articles.mjs <url1> <url2> ... --out <featured-images>/articles`
   It writes one `articles/<slug>.md` per URL (H1, headings, paragraphs, lists, tables) using agent-browser and your existing Chrome. Nobody fetches a page again; Makers and QA read these files.
2. **Plan and reserve all layouts in one command** (Orchestrator):
   `node <skill-dir>/scripts/plan.mjs --brand <b> --category <c>` prints layout usage, least-used first. Pick the best-fitting layout per article from the lowest tier (all different; different modes per topic). Choose about 1 in 3 for the vibrant blue, only from `checklist`, `versus/table`, `window`, `before-after/flow`, never two neighbours. Then reserve them all:
   `node <skill-dir>/scripts/plan.mjs --brand <b> --category <c> --reserve <slug>=<mode>[/<variant>][@<topic>] ...`
3. **Pre-flight before briefing:** does the layout hold as many items as the article has? Will the article's product names fit? Does a headline-less layout (hub, before-after, versus) carry the title's key words? Fix the renderer first if not.
4. **Makers in parallel:** one Maker per article (or per 2–3), all started in one message, in the background, each with its article file, layout, slug and `bg` decision.
5. **One QA pass:** `node <skill-dir>/scripts/sheet.mjs --brand <b> --category <c> --out <featured-images>/qa-sheet.png --highlight <slug1,slug2,...>`, then **one** QA agent with the sheet, the master.png paths, specs and article files.
6. **Fix only the failures, in parallel:** send each FAIL's fixes to its Maker (SendMessage). QA re-checks only those. Up to 3 rounds; never ship a FAIL silently.
7. **Deliver** the QA-passed images as one contact sheet, with layouts and the facts used.
8. **Finalize** them right after delivery: `node <skill-dir>/scripts/finalize.mjs --brand <b> <slug> ...`. They become permanent: stored, counted for rotation forever, and never re-created ("FINAL IMAGE LOCKED").

**Speed rules:** never fetch an article twice, never run Makers one after another, never open images one by one when the sheet shows them, give agents only the files they need, and report progress in one line per step.

## Maker prompt (template)

```
You are the MAKER for blog featured images. Use the blog-featured-images skill at <skill-dir>.
Read SKILL.md, references/spec-format.md (the section for your layout) and look at references/approved/.
For each article below:
1. Read <featured-images>/articles/<slug>.md (already fetched; don't fetch the URL). Use only its own facts, in its own wording.
2. Write <featured-images>/specs/<slug>.json for the ASSIGNED layout. Set articleTitle, brand, category, topic, slug.
   - At most 15 words, max 7 per element, labels not sentences, no fact twice, nothing added to fill space.
   - Keep each figure's qualifier (per provider, up to, from, minimum). An X vs Y article shows both products.
   - "logo": "<official domain>" on every named product. Hub: logos only.
   - bg: leave it out (the renderer picks the best light field), unless the plan says "blue".
3. Render: node "<skill-dir>/scripts/render.mjs" <spec> --out "<featured-images>/<slug>". Never use --force.
   If a check fails, fix the spec within the assigned layout; if the layout itself is refused, or you see FINAL IMAGE LOCKED, stop and report it.
4. Open master.png and card-350x250.png; fix wraps, clipping or anything that doesn't look good.
Articles: <list: article file, layout, bg decision, category, topic, slug, brand>
Return per article: slug, layout, bg, spec path, master.png path, card path, and the facts used (each with the sentence it came from).
```

## QA prompt (template)

```
You are the QA reviewer for blog featured images. Be strict: you pass nothing that breaks a rule, and nothing that doesn't look good.
You do not edit or render anything. You judge.
Read <skill-dir>/references/design-language.md and compare against <skill-dir>/references/approved/.
Inputs: the contact sheet <qa-sheet.png> (batch images framed in blue), the batch's master.png and card paths, specs, article files
<featured-images>/articles/<slug>.md, and the site history <~/.blog-featured-images/history-<brand>.json>. Don't fetch the web.
Check every image against the QA checklist in references/agents.md, looking at the actual PNGs.
Return per image: PASS or FAIL, and for each FAIL the rule broken and the exact fix
(e.g. "cut bullet 3", "hub on g5 is too much blue: remove bg", "layout window/default repeats emr-cost-vendor-prices: use stat/default").
```

## QA checklist

**1. Visually appealing (hard gate).** Would a design director ship it next to `references/approved/`? FAIL:
- too much blue (a blue-heavy illustration on a blue-ish field)
- unbalanced logos (a big tile around a tiny logo, an app icon shrunk inside a white tile), or logo + name cards where logos alone would do
- weak figure/ground (grey bars on `paper`, a hero that melts into the field)
- uneven sizes, gaps or arrows; a small, pale, floating composition

**2. Background fits.** The field flatters the illustration (the layout's fit list). On the vibrant blue: only checklist, versus/table, window or before-after/flow, with no drop shadows. On light fields: minimal, field-tinted shadows; grain on `sky`, `paper`, `g5`, none on `cream`.

**2b. Headline layouts** (`versus/pills`, `versus/connect`, `versus/slash`, `versus/duo`, `dark`). Blue shapes are the subtle near-solid blue; a white design sits in the grey frame; black designs count as vibrant; every word stays inside x 210–1390 (`dark`'s text column starts at x 120, and its top-left tile is the product's own icon in #0A0A0B black, not the site mark).

**2c. Logotype.** The article is about one product and its logo is black (icon and wordmark) with strong typography; the icon sits in white on a black rounded tile beside the wordmark (or keeps its own tile), sharp, large and centred on cream; no other text; at most 2 per category (coloured logos use `dark`).

**3. Layout never used twice.** No other image in the category has this layout unless every layout has been used (then it's one of the least-used). Next to every other 350×250 card in the category, no two read as the same skeleton. Same-topic articles use different modes.

**4. Easy to scan.** The topic is clear in 2 seconds at 350×250, with one focal point and one bold blue anchor.

**5. Minimal.** ≤15 words, ≤7 per element, no sentences (`words=N/15`). No secondary line that isn't the point, no fact twice, nothing filling space.

**6. Balanced.** Headline 56–76px and under ~760px wide; hero at 55–70% of the width, at or slightly above the centre; nothing wraps, clips or overlaps; every word inside x 210–1390; badges and cursors never touch text.

**7. True to the article.** The heading mirrors the blog title's own words; every number and name appears in the article **with its qualifier** (per provider, up to, from, minimum); figures shown together don't contradict each other. An X vs Y image shows both products.

**8. Logos.** Every named product has its real, current mark (not an anniversary or campaign badge, not a generic parent-company mark when the product has its own), loaded, legible at 350×250, and balanced against the other logos.

**9. Guardrails respected** (design language, section 13).
