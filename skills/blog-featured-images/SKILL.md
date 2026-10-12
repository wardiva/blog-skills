---
name: blog-featured-images
description: Generate premium, article-specific blog featured images (1600x900 plus crops) in an approved soft-pastel "card" design language with 10 composition types. Use when the user asks for a blog featured image, blog thumbnail, article cover, hero image or OG image for a blog post or article URL, or wants featured images for several articles or a whole category. Reads each article, plans the batch so no two related articles share a composition, writes a spec from the article's real facts, and renders it with headless Chrome (free, no AI image generation). A built-in variety ledger blocks repeats.
---

# Blog featured images

> **Approved behaviour** (user sign-off, 2026-10-13). The rules in this file and in the "APPROVED" section of `references/design-language.md` are the standard. Keep all of them when changing the skill.

Make featured images that are **relatable to the article**, **understood in 2 seconds**, and **different from every other image in the same category**, while all of them look like one family.

The full rulebook (colours, type, cards, "never" list) is in `references/design-language.md`. The JSON format for every composition is in `references/spec-format.md`. The three-agent workflow is in `references/agents.md` and the lessons learned are in `references/lessons.md`. Read them before your first image in a session.

## Work fast (user rule: "WORK FAST")
Read `references/lessons.md` first. In short:
- Read all URLs at once (`scripts/read-articles.mjs`, agent-browser).
- Reserve all layouts in one command (`scripts/plan.mjs`).
- Start every Maker in one message, in the background.
- Run one QA agent on one contact sheet (`scripts/sheet.mjs`).
- Fix by SendMessage, never by new agents.
- Run pre-flight checks before briefing (item count, name lengths, title words).
- Never sit idle, deliver each passed image at once, and keep updates to one line.
- For style changes, show A/B/C side by side.

## The hard rules
0. **The heading mirrors the blog title.** Use the title's own words and meaning, just shorter (drop the year and filler). Never reword creatively. Set `"articleTitle"` in every spec; the renderer blocks headings that drift ("HEADING CHECK FAILED").
1. **Relatable.** Read the full article. Use only its own facts (numbers, names, steps, comparisons). Never invent figures or use generic concepts.
2. **Easy to understand.** One idea, one focal point, short real words. Check it at 350×250.
3. **Minimal, never text-heavy.** One idea, the fewest facts that prove it (3–4 rows or 2–3 bullets), about 60 words max. Whitespace is good; never add elements just to fill space. See "Minimal rule" in `references/design-language.md`.
4. **Different every time (hard-enforced).** A **layout** (mode + variant) never repeats in a category until every layout has been used there, and same-topic articles never share a mode. The renderer checks a **site-wide history** (`~/.blog-featured-images/history-<brand>.json`) that records every image ever rendered for that brand, whatever folder it went to, so test renders and alternates count too. Compositions must also differ in **skeleton** (block arrangement), not just text; see "Skeleton rule".

## The 10 compositions (`mode`)
| mode | Shows | Best for |
|---|---|---|
| `before-after` (default) | raw card → clean card, plus a legend | how-to, migration, transformation |
| `versus` | `overlap` (default): two tilted overlapping cards, blue VS badge, legend. `table`: one comparison table card | X vs Y |
| `prompt` | faded data panel, big headline, pill bar with chips | cost, pricing, FAQ, "what is" |
| `hub` | blue centre tile, 6 tilted cards, hand-drawn arrows | best-of lists, integrations |
| `stack` | one takeaway card over offset cards | guides with one key rule or warning |
| `window` | full app window: list pane + detail pane | vendor lists, pricing tables, walkthroughs |
| `timeline` | steps on a track, one highlighted, a callout | process, implementation, "how long" |
| `checklist` | tilted checklist card with progress | checklists, "how to choose", requirements |
| `stat` | one giant number, caption, breakdown card | one headline statistic or cost |
| `ranked` | named bars ranked by a real metric | rankings, cheapest/fastest, market share |

**The same article type can use several modes.** A cost article can be `prompt`, `stat`, `window` or `ranked`, and a how-to can be `before-after`, `timeline`, `stack` or `checklist`. Use this freedom to avoid repeats.

## Three agents, always (required)
Every request runs with three roles. Full prompts and the QA checklist are in `references/agents.md`.
- **Orchestrator (you):** read the articles and the site history, assign each article a distinct least-used layout, start the Maker and the QA agent, loop fixes, deliver. You don't render or approve images yourself.
- **Makers (subagents, in parallel):** write each spec from the article file's facts and render it. They use the assigned layout and never `--force`.
- **QA (separate subagent):** checks every image: **no layout used twice** (history plus a side-by-side look at every card in the category), **easy to scan** in 2 seconds at 350×250, **little text** (about 60 words max, no fact twice), **visually balanced**, heading and facts true to the article. It returns PASS or FAIL with exact fixes.
- Failed images go back to their Maker, then to QA again, for up to 3 rounds. Only images that passed are shown to the user.

**Fast batch mode (default):** read all URLs in parallel once (`scripts/read-articles.mjs`, agent-browser), plan and reserve every layout in one command (`scripts/plan.mjs`), run all Makers at once, run **one** QA pass over a single contact sheet (`scripts/sheet.mjs`), and fix only the failures, in parallel. Exact commands are in `references/agents.md`. One-time setup: `npm i -g agent-browser`, plus `npm install` in `scripts/`.

## Workflow

### 1. Read every article in the request (Orchestrator)
Fetch each whole page. For each one, note the article type, core idea, 3–6 hard facts, the takeaway, its **category** (the site's blog category) and its **topic**. Articles that cover the same subject (including duplicate URLs such as `…-guide` and `…-guide-2`) share one `topic` string.

### 2. Plan the batch before rendering anything (Orchestrator)
Write a short plan table: article → mode → background → key facts. Rules:
- Within a category, no mode repeats until most of the 10 have been used. Never repeat a mode within 6 consecutive posts.
- Articles with the same `topic` get different modes and different angles (different facts, not the same facts redrawn).
- Read the site-wide history `~/.blog-featured-images/history-<brand>.json` first. It lists every layout this category has already used, and only the **least-used** layouts are allowed.
- Vary the background too (`wash`, `cool`, `white`, `flat`). The renderer rotates it automatically if you leave `bg` out.

Show the plan to the user when doing more than 3 images.

### 3. Write the specs (Maker)
One `<slug>.json` per article, following `references/spec-format.md`. Always set `articleTitle` (the real H1), `brand`, `category`, `slug`, and `topic` when a topic is shared. Keep text short so nothing wraps. Look at `examples/` for one approved spec per mode.

New site? Copy `brands/_template.json` to `brands/<site>.json` and fill in the site's real brand colours (check the live site).

### 4. Render (Maker)
First time only: run `npm install` in the skill's `scripts` folder (installs `sharp`). Chrome or Edge must be installed; set the `CHROME` env var if it isn't found.
```bash
node "<skill-dir>/scripts/render.mjs" "<spec>.json" --out "featured-images/<slug>"
```
Outputs: `master.png` (1600×900), `7x5.webp` (theme crop), `16x9-1200.webp` (social/OG), `card-350x250.png` (size check). Each render is recorded in the local `featured-images/.featured-ledger.json` **and** the site-wide history.

**If you see "HEADING CHECK FAILED", rewrite the heading from the title's key words.** **If you see "VARIETY CHECK FAILED", use one of the layouts it lists (set `mode`, plus `variant` when it is not `default`) and rewrite the spec.** Never use `--force` unless the user explicitly asks for a repeat, and never work around the check by rendering into a different folder. Bleed, cursor, background or different text do **not** make a different layout.

### 5. Check, then fix (QA agent, then Maker)
Open `master.png` and `card-350x250.png` and confirm:
- The topic is clear in 2 seconds.
- No text wraps, clips or overlaps, and nothing falls outside x 210–1390.
- Every number appears in the article.
- **Balance** (see "Visual balance rules" in `references/design-language.md`): one clear focal point at 350×250, all four corners anchored, the grid used only where it fits the vibe (on by default for stat, ranked, timeline and window only), minimal (nothing added to fill space), **type balanced** (headline 56–76px and never wider than about 760px; body rows ≥ 32px with ≥ 28px gaps, never cramped, except text inside mock app windows, which stays UI-sized; headline about 2× the body, not more; only the stat number may be giant; see "Typography balance"), and the cursor (if any) never covering text.

Then put the batch side by side and confirm no two images look alike. Fix and re-render until all of this passes.

### 6. Deliver (Orchestrator, QA-passed images only)
Show the images, ideally as one contact sheet for a batch. For each, list the mode chosen and the article facts used. Ask before uploading anything to a website.

## Notes
- Fonts (Inter) and icons (Phosphor) load from the internet at render time.
- Variety history is site-wide per brand (`~/.blog-featured-images/history-<brand>.json`, or the `FEATURED_HISTORY_DIR` env var). Re-rendering the same `slug` replaces its entry. To drop a discarded test image, delete its entry from that file.
- Layouts available today: 11 (versus has `overlap` and `table`; every other mode has one). A category with more posts than layouts will cycle, always to the least-used layout. Add variants to lengthen the cycle.
