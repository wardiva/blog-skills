---
name: blog-featured-images
description: Generate premium, article-specific blog featured images (1600x900 plus crops) in two approved families - card layouts on light grainy fields (plus a vibrant deep-blue field) and Chatbase-style headline layouts (mostly X vs Y - facing pills, connected logos, black slash, black + brand colour) - 12 modes / 18 layouts. Use when the user asks for a blog featured image, blog thumbnail, article cover, hero image or OG image for a blog post or article URL, or wants featured images for several articles or a whole category. Reads each article, plans the batch so no two related articles share a layout, writes a minimal spec (15 words max) from the article's real facts, adds real product logos, picks a background that flatters each illustration, and renders with headless Chrome (free, no AI image generation). Three agents (orchestrator, makers, independent QA) work in a fast parallel batch; built-in checks block drifting headings, text-heavy images, repeated layouts and backgrounds that don't fit.
---

# Blog featured images

Make featured images that are **true to the article**, **understood in 2 seconds**, **minimal**, **visually appealing**, and **different from every other image in the same category**, while all of them look like one family.

Read these before your first image in a session:
- `references/approved/`: the finalized images (card layouts and headline layouts). This is the target look.
- `references/design-language.md`: the rulebook (visual appeal, backgrounds and fit, shadows, layouts, text budget, logos, never-do list).
- `references/spec-format.md`: the JSON spec for every layout. `examples/` holds an approved spec for each.
- `references/agents.md`: the three-agent fast-batch workflow, Maker and QA prompts, QA checklist.
- `references/lessons.md`: speed tools, pre-flight checks and gotchas.

## The target look
- **Two families:** card layouts on light fields, and four headline layouts after Chatbase (three of them for X vs Y; subtle vivid blue shapes, white designs in a grey frame, two on black).
- **Light fields** (`sky`, `paper`, `cream`, `g5`) with fine grain and thin guide lines, each chosen to flatter its illustration.
- **About 1 in 3 images on the vibrant "deep dunes" blue** (heavy grain, soft rolling bands), and only when the illustration is a big white card.
- One big white UI card or hero. Blue gradient only for the active/anchor element; grey for inactive.
- Navy headlines; real colour logos, balanced in their tiles; logos alone where they're recognisable.
- No drop shadows on the blue; minimal, field-tinted shadows on light fields.
- At most 15 words.

## The hard rules
1. **The heading mirrors the blog title:** its own words, shorter (drop the year and filler). Set `"articleTitle"` in every spec ("HEADING CHECK FAILED" otherwise).
2. **Only the article's own facts** (numbers, names, steps, comparisons) in its own wording. Never invent anything.
3. **Easy to understand:** one idea, one focal point, visual first (icon, logo, number, arrow, bars). Check it at 350×250.
4. **Minimal (enforced):** at most **15 visible words**, max 7 per element, no sentences ("TEXT CHECK FAILED"). Secondary lines only when they are the story. Never fill space.
5. **Different every time (enforced):** a layout (mode + variant) never repeats in a category until all have been used; same-topic articles never share a mode ("VARIETY CHECK FAILED"). A site-wide history per brand records every render.
6. **Logos where products are named:** `"logo": "<domain>"`; the renderer's free chain finds it. Logos fill ~65% of their tile; app icons become the tile.
7. **Background fits the illustration (enforced):** leave `bg` out and the renderer picks the layout's best light background; anything outside the layout's fit list is refused ("BACKGROUND FIT FAILED"). Blue-heavy illustrations get a neutral field.
8. **Vibrant + subtle mix (enforced):** the deep-dunes blue (`"bg": "blue"`, only for `checklist`, `versus/table`, `window`, `before-after/flow`) and the black layouts (`dark`, `versus/slash`) together appear on about 1 in 3 images per category, never neighbours ("VIBRANT CHECK FAILED", "VIBRANT FIT FAILED").
9. **Visual appeal is a hard gate:** an image that passes every check but doesn't look good fails QA (blue dosage, logo balance, logos only, figure/ground, balance).
10. **Shadows follow the background:** none on the blue; minimal and tinted on light fields (automatic).
11. **Site mark only sometimes (enforced):** `"craft": true` + `"series"` adds the site mark + series tag, in a natural empty slot, on at most 1 in 3 images, never neighbours ("SERIES CHECK FAILED").
12. **White designs sit in a grey frame:** a white rounded panel inset 28px on `#F2F2F3` (automatic in `versus/pills` and `versus/connect`).

## Layouts: 12 modes, 18 layouts

**Card layouts** (light fields, white UI cards):
| Layout | Shows | Best for | Light bg (best first) | On blue? |
|---|---|---|---|---|
| `before-after` | raw card → clean card | how-to, migration | g5, sky | no |
| `before-after/flow` | icon card → arrow → lifted icon card | "old way → new way" | g5, sky | **yes** |
| `versus/overlap` | tilted overlapping cards + VS badge | X vs Y | sky, cream | no |
| `versus/table` | one comparison table + VS badge | X vs Y, 2–3 dimensions | sky, cream | **yes** |
| `versus/logos` | two big logo tiles + one fact chip each | X vs Y, one contrast | sky, cream | no |
| `hub` | blue centre tile + 6–7 logo tiles (logos only) | "best X" lists | cream, paper | no |
| `focus` | key phrase in a blue selection box + skeleton card | one idea, 2–3 values | sky, g5 | no |
| `stat` | giant number + breakdown card | one headline number | paper, cream | no |
| `ranked` | bars ranked by a real metric | rankings | sky, g5 | no |
| `timeline` | steps on a track + callout | process, "how long" | cream, sky | no |
| `checklist` | tilted checklist card with progress | how to choose, requirements | g5, sky | **yes** |
| `prompt` | faded panel, headline, pill bar | cost, FAQ, "what is" | paper, cream | no |
| `stack` | takeaway card, two cards peeking from the top | one key rule | g5, cream | no |
| `window` | app window: list pane + detail pane | vendor lists, pricing | sky, g5 | **yes** |

**Headline layouts** (after Chatbase; they paint their own canvas, `bg` is ignored). White ones sit in a grey frame; black ones count as vibrant:

| Layout | Shows | Best for |
|---|---|---|
| `versus/pills` | two facing blue pills with the logos at the tips, the question below | X vs Y |
| `versus/connect` | centred headline, two logo tiles linked to a VS circle, dot patches | X vs Y |
| `versus/slash` | black, dot grid, heavy-caps names, italic VS with a glowing streak | X vs Y (vibrant) |
| `dark` | black, tag pill, white headline, brand-colour panel with the white logo | one vivid brand (vibrant) |

The same article type can use several layouts (cost: focus, stat, prompt, window, ranked; X vs Y: seven versus options plus `dark`). Use that range to avoid repeats. When a category's least-used tier already has one use each, add a new variant before briefing Makers.

## Three agents, always
Full prompts and the QA checklist are in `references/agents.md`.
- **Orchestrator (you):** read the articles, plan and reserve a distinct least-used layout per article (and which ones go on blue), fix renderer issues, start the Makers and the QA agent, loop fixes, deliver. You don't approve images yourself.
- **Makers (subagents, in parallel):** write each spec from the article file and render it, with the assigned layout. Never `--force`.
- **QA (separate subagent):** judges every image on one contact sheet and returns PASS or FAIL with exact fixes.
- Failed images go back to their Maker, then to QA again, for up to 3 rounds. Only QA-passed images are delivered.

## Workflow (fast batch mode)
1. **Read:** `node <skill-dir>/scripts/read-articles.mjs <url> <url> ... --out featured-images/articles` reads every URL in parallel into `articles/<slug>.md`. Note each article's type, core idea, 3–6 hard facts, **category** and **topic** (duplicate URLs such as `…-guide` and `…-guide-2` share one topic).
2. **Plan:** `node <skill-dir>/scripts/plan.mjs --brand <b> --category <c>` shows layout usage. Pick the best fit from the least-used tier for each article, choose which ~1 in 3 go on blue (only blue-fit layouts, never neighbours), then reserve all at once: `--reserve <slug>=<mode>[/<variant>][@<topic>] ...`. Show the plan when doing more than 3 images.
3. **Spec + render (Makers, in parallel):** one `specs/<slug>.json` each (always `articleTitle`, `brand`, `category`, `slug`, `topic` when shared, `logo` on named products), then:
   ```bash
   node "<skill-dir>/scripts/render.mjs" "featured-images/specs/<slug>.json" --out "featured-images/<slug>"
   ```
   Outputs: `master.png` (1600×900), `16x9-1200.webp` (social/OG), `7x5.webp` (theme crop), `card-350x250.png` (size check). Every render prints `layout=… bg=… words=N/15`.
4. **QA:** `node <skill-dir>/scripts/sheet.mjs --brand <b> --category <c> --out featured-images/qa-sheet.png --highlight <slugs>`, then one QA agent.
5. **Fix** only the failures, in parallel. **Deliver** the QA-passed images as a contact sheet with each layout and the facts used. Ask before uploading anything to a website.
6. **Style changes:** for any "I don't like it" or a new look, render 2–3 options side by side at once and let the user pick.

**When the renderer refuses** (never work around it with `--force` or another folder):
| Message | Fix |
|---|---|
| `HEADING CHECK FAILED` | Rewrite the heading from the title's key words |
| `TEXT CHECK FAILED` | Cut subs that aren't the point, then sentence tails, until ≤15 words and ≤7 per element |
| `VARIETY CHECK FAILED` | Use one of the layouts it lists (set `mode`, plus `variant` when not `default`) |
| `BACKGROUND FIT FAILED` | Remove `bg` (or use one it lists) |
| `BACKGROUND CHECK FAILED` | That background doesn't exist; use `sky`, `paper`, `cream`, `g5` or `blue` |
| `VIBRANT CHECK FAILED` | Blue was used on a neighbour; remove `"bg": "blue"` |
| `VIBRANT FIT FAILED` | This layout doesn't go on blue; remove `"bg": "blue"` |
| `SERIES CHECK FAILED` | Remove `"series"` |

## Setup
- **Needs:** Node 18+, Chrome or Edge (or the `CHROME` env var), `npm install` in `scripts/`, and `npm i -g agent-browser` for fast article reading. **Without agent-browser**, read the articles with WebFetch in parallel, save the text to `featured-images/articles/<slug>.md`, and continue.
- **Brandfetch client ID** (optional, free at brandfetch.com/developers): `~/.blog-featured-images/config.json` as `{"brandfetchClientId": "…"}` or the `BRANDFETCH_CLIENT_ID` env var. **Never commit it.** Without it, logos still work through Iconify and Simple Icons.
- **New site:** copy `brands/_template.json` to `brands/<site>.json` and fill in the brand colours, plus `markUrl` and `markName` for the optional site mark.
- Fonts (Inter), icons (Phosphor) and logos load from the internet at render time.
- History is per brand (`~/.blog-featured-images/history-<brand>.json`, or `FEATURED_HISTORY_DIR`). Re-rendering a `slug` replaces its entry; delete a discarded test image's entry by hand.
