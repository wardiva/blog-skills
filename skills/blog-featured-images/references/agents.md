# Three-agent workflow (required)

Every featured-image request runs with three roles. One agent never both makes and approves an image: the maker can't judge its own work.

| Role | Who | Does | Never does |
|---|---|---|---|
| **Orchestrator** | The main Claude running this skill | Reads the articles and the site history, plans the batch, assigns each article a distinct layout, starts the Maker and the QA agent, loops fixes, delivers | Render or approve images itself |
| **Maker** | Subagents (Agent tool), several in parallel | Writes the spec from the article file's facts, renders it, returns paths + facts used | Choose its own layout, use `--force`, render into another folder to dodge a check |
| **QA** | A separate subagent (Agent tool), fresh context | Checks every image against the QA checklist and returns PASS or FAIL with exact fixes | Edit specs or render; it only judges |

## Flow: fast batch mode (default; user rule: "work fast")

Speed comes from doing each step once, all articles at the same time.

1. **Read all URLs in parallel, once (Orchestrator, about 5–10 s for the whole batch).**
   `node <skill-dir>/scripts/read-articles.mjs <url1> <url2> ... --out <featured-images>/articles`
   It uses the agent-browser CLI (`npm i -g agent-browser`; your existing Chrome, no extra download). It writes one `articles/<slug>.md` per URL with the H1, headings, paragraphs, lists and tables. **Nobody fetches a page again.** Makers and QA read these files.
2. **Plan and reserve all layouts in one command (Orchestrator).**
   `node <skill-dir>/scripts/plan.mjs --brand <b> --category <c>` prints layout usage, least-used first. Pick the best-fitting layout per article from the lowest tier (different for every article, different modes per topic), then reserve them all at once:
   `node <skill-dir>/scripts/plan.mjs --brand <b> --category <c> --reserve <slug>=<mode>[/<variant>][@<topic>] ...`
   It refuses the whole plan if any assignment breaks the rotation. Reservations make parallel renders safe.
3. **Makers in parallel.** Start one Maker per article (or per 2–3 articles), **all in a single message**, in the background. Each gets its article file path, assigned layout and slug, so there are no web fetches. Renders run in parallel; the renderer locks the history file while it writes.
4. **One QA pass for the whole batch.** When the Makers finish, build one contact sheet:
   `node <skill-dir>/scripts/sheet.mjs --brand <b> --category <c> --out <featured-images>/qa-sheet.png --highlight <slug1,slug2,...>`
   Start **one** QA agent with the sheet, the batch's master.png paths, specs and article files. It checks every batch image against the checklist and the whole category in one look.
5. **Fix only the failures, in parallel.** Send each FAIL's fixes to its Maker (SendMessage), all at once. Renderer bugs are the Orchestrator's to fix. QA re-checks only the fixed images. Up to 3 rounds.
6. **Deliver** the QA-passed images as one contact sheet, with layouts and facts.

**Speed rules:**
- Never fetch an article twice.
- Never run Makers one after another.
- Never open images one by one when the sheet shows them.
- Give agents only the files they need (article .md, spec-format section for their mode, the Minimal rule), not the whole rulebook every time.
- Report progress in one line per step.

## Flow: details

1. **Orchestrator: plan.** Read every article (via `read-articles.mjs`). Assign each article a layout from the **least-used** tier in its category (`plan.mjs`), never the same layout twice in the batch, and never the same mode for articles on the same topic. Show the plan table to the user when there are more than 3 images.
2. **Orchestrator → Makers.** Start the Makers in parallel with the plan: per article, the article file, assigned layout, category, topic, slug and brand.
3. **Orchestrator → QA.** When the Makers return, start the QA agent with the contact sheet, image paths, specs and article files. The QA agent must not have seen the Makers' reasoning.
4. **Fix loop.** For each FAIL, send the QA agent's fixes back to that Maker (SendMessage), then re-run QA on the fixed images only. Stop after 3 rounds and tell the user what still fails. Never ship a FAIL silently.
5. **Orchestrator: deliver.** Show only images that passed QA, as a contact sheet, with each one's layout and the article facts used.

## Maker prompt (template)

```
You are the MAKER for blog featured images. Use the blog-featured-images skill at <skill-dir>.
Read SKILL.md, references/design-language.md and references/spec-format.md first.
For each article below, in order:
1. Read the article file <featured-images>/articles/<slug>.md (already fetched; do not fetch the URL). Use only its own facts.
2. Write <featured-images>/specs/<slug>.json for the ASSIGNED layout (mode + variant). Set articleTitle, brand, category, topic, slug.
   Minimal rule: one idea, at most 15 words and no sentence (max 7 words per element; the renderer enforces both). Write labels, not prose, no fact shown twice, nothing added to fill space.
   Logos: add "logo": "<official domain>" to every named product (e.g. "odoo.com", "sage.com"). Don't pick logo files; the renderer's chain does it.
3. Render it: node "<skill-dir>/scripts/render.mjs" <spec> --out "<featured-images>/<slug>". (Other Makers render in parallel; that's fine.)
   Never use --force. If a check fails, fix the spec within the assigned layout; if the layout itself is refused, stop and report it.
4. Open master.png and card-350x250.png and fix obvious wraps or clipping.
Articles: <list: article file, layout, category, topic, slug, brand>
Return, per article: slug, layout, spec path, master.png path, card path, and the facts used (each with the sentence it came from).
```

## QA prompt (template)

```
You are the QA reviewer for blog featured images. Be strict: you pass nothing that breaks a rule.
You do not edit or render anything. You judge.
Read <skill-dir>/references/design-language.md (APPROVED, Minimal rule, Variety enforcement, Visual balance, Typography balance, Heading rule, Skeleton rule).
Inputs: the category contact sheet <qa-sheet.png> (batch images framed in blue), the batch's master.png and card paths, specs, article files <featured-images>/articles/<slug>.md, and the site history <~/.blog-featured-images/history-<brand>.json>. Don't fetch the web; the article files are the source of truth.
Check every image against the QA checklist in references/agents.md. Look at the actual PNGs, not just the specs.
Return, per image: PASS or FAIL, and for each FAIL the rule broken and the exact fix (e.g. "cut bullet 3", "shorten row 2 to 'Quote only'", "layout window/default repeats emr-cost-vendor-prices: use stat/default").
```

## QA checklist (the QA agent checks all of it)

**1. Layout never used twice**
- In the site history, no other image in the same category has this layout, unless every layout has already been used (then it must be one of the least-used).
- Put this image's 350×250 card next to every other card in the category. If any two read as the same skeleton (same block arrangement), FAIL, even if the mode names differ.
- Articles on the same topic use different modes.

**2. Easy to scan**
- At 350×250 the topic is clear in 2 seconds, with one clear focal point.
- Real words only, no jargon the article doesn't use.

**3. Less text (minimal)**
- 15 words maximum, max 7 words per element, no sentences (the renderer enforces it; check `words=N/15`). FAIL any secondary line (price, sub, legend) that isn't the point of the article, even under 30.
- No fact shown twice, and nothing added just to fill space.

**4. Visually balanced**
- Headline 56–76px and no wider than about 760px. Free-standing body text is at least 32px; text inside a mock app window stays UI-sized.
- Even spacing, all four corners anchored, hero at or slightly above the centre.
- Nothing wraps, clips or overlaps, and every word is inside x 210–1390.
- Badges, cursors and chips never touch text.

**5. True to the article**
- The heading mirrors the blog title's own words, shorter.
- Every number and name appears in the article.

**5b. Logos**
- Every named product has a logo, and every logo loaded (no broken image, no stray letter tile where a real logo exists).
- Logos read as one set (style A: original colours in small white tiles; app-style tiles are fine). They stay small and never compete with the hero.

**5c. Not bland**
- Exactly one bold blue anchor; structure tied to the frame (texture or an edge-to-edge band); hero at least ~60% of the width. FAIL a pale, small, floating composition even if every other rule passes.

**5e. Visually appealing (hard gate)**
- Would a design director ship it? FAIL on too much blue (a blue-heavy illustration on a blue-ish field), unbalanced logos (a big tile around a tiny logo, or a full app icon shrunk inside a white tile), logo + name cards where logos alone would do, weak figure/ground, or uneven sizes and gaps. See "Visual appeal is a hard gate" in the design language.

**5d. Background fits the illustration**
- On the vibrant blue, only a big white card (checklist, stack, versus/table or overlap, window). FAIL floating logo tiles, a blue-heavy illustration or grey headline text on blue.
- The hero separates cleanly from the field at 350×250, and the field flatters the illustration (see "Background fit" in the design language). FAIL grey bars or skeletons on `paper`, a blue tile on `cream`, or a field whose colour competes with the hero.

**6. In the design language**
- Approved backgrounds, white cards, blue accent, warm-grey/blue labels, grain.
- No dark backgrounds, no AI-looking art, and no rejected patterns (see the "Rejected" notes).
