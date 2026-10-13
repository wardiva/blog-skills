---
name: blog-featured-images
description: Generate premium, article-specific blog featured images (1600x900 plus crops) in an approved soft-pastel "card" design language with 11 modes / 15 layouts. Use when the user asks for a blog featured image, blog thumbnail, article cover, hero image or OG image for a blog post or article URL, or wants featured images for several articles or a whole category. Reads each article, plans the batch so no two related articles share a layout, writes a minimal spec (15 words max) from the article's real facts, adds real product logos, and renders with headless Chrome (free, no AI image generation). Three agents (orchestrator, makers, independent QA) work in a fast parallel batch; built-in checks block drifting headings, text-heavy images and repeated layouts.
---

# Blog featured images

> **Approved behaviour** (user sign-off, 2026-10-13). The rules in this file and in `references/design-language.md` are the standard. Keep all of them when changing the skill.

Make featured images that are **relatable to the article**, **understood in 2 seconds**, **minimal**, **never bland**, and **different from every other image in the same category**, while all of them look like one family.

Read these before your first image in a session:
- `references/design-language.md`: the rulebook (colours, type, balance, text budget, logos, anti-bland, craft spec, "rejected" lists)
- `references/spec-format.md`: the JSON spec for every layout
- `references/agents.md`: the three-agent fast-batch workflow, Maker and QA prompts, QA checklist
- `references/lessons.md`: what past sessions learned (speed, pre-flight checks, taste)

## The target look (user-finalized)
Open `references/approved/` before your first image: 6 finalized images (checklist, hub, ranked, focus, timeline, window) define the vibe:
- soft light fields with thin guide lines (no dot patches)
- one big white UI card or hero
- blue gradient only for active and anchor elements; grey for inactive
- navy headlines
- colour logos in white tiles
- ≤15 words

Their specs are in `examples/`, and the renderer's per-layout defaults already match them. See "FINAL approved look" in `references/design-language.md`.

## Work fast (user rule: "WORK FAST")
- Read all URLs at once (`scripts/read-articles.mjs`, agent-browser).
- Reserve all layouts in one command (`scripts/plan.mjs`).
- Start every Maker in one message, in the background.
- Run one QA agent on one contact sheet (`scripts/sheet.mjs`).
- Fix by SendMessage to the same agent, never by new agents.
- Run pre-flight checks before briefing (item count vs layout capacity, name lengths, title words).
- Never sit idle; deliver each passed image at once; keep updates to one line.
- For any style change or "I don't like it", show A/B/C side by side at once.

## The hard rules
0. **The heading mirrors the blog title.** Use the title's own words and meaning, just shorter (drop the year and filler). Never reword creatively. Set `"articleTitle"` in every spec; the renderer blocks headings that drift ("HEADING CHECK FAILED").
1. **Relatable.** Use only the article's own facts (numbers, names, steps, comparisons), in the article's own wording. Never invent figures, abbreviations or generic concepts.
2. **Easy to understand.** One idea, one focal point. Visual first (icon, logo, number, arrow, bars) over a text-only card. Check it at 350×250.
3. **Minimal, never text-heavy (hard-enforced).** At most **15 visible words**, and no element over 7 words (no sentences). The renderer refuses more with "TEXT CHECK FAILED". Show a secondary line (price, sub) only when it IS the story; a "best of" list shows names only. Whitespace is good; never fill space.
4. **Different every time (hard-enforced).** A **layout** (mode + variant) never repeats in a category until every layout has been used there, and same-topic articles never share a mode. The renderer checks a **site-wide history** (`~/.blog-featured-images/history-<brand>.json`) that records every image ever rendered for that brand. Layouts must also differ in **skeleton** (block arrangement), not just text.
5. **Logos where products are named.** Set `"logo": "<domain>"` on every named product (hub cards, versus sides, window rows, ranked rows). The renderer fetches it through a free chain (Brandfetch symbol → Iconify → Simple Icons → Brandfetch icon as an app tile → lettermark) in style A (original colours, small white tile). Logos stay secondary.
6. **Never bland.** One bold blue anchor, structure tied to the frame (soft dot texture or an edge-to-edge band), and a hero at least ~60% of the width. Background `sky` (crisp, texture on) or `wash` + `"texture": true` (warm), whichever balances better.
7. **Site mark only sometimes (hard-enforced).** The site mark + series tag (`"series"`, needs `"craft": true`) goes only in a natural empty slot, on at most 1 in 3 images per category and never on neighbours ("SERIES CHECK FAILED").
8. **Vibrant + subtle mix (hard-enforced).** About 1 in 3 images per category uses the vibrant brand-blue field (`"bg": "blue"`, Granola-style glow); never two neighbours ("VIBRANT CHECK FAILED"). The rest stay light and subtle.

## Layouts: 11 modes, 15 layouts
| mode | variants | Shows | Best for |
|---|---|---|---|
| `before-after` | `default`, `flow` | raw card → clean card + legend; `flow`: icon card → arrow → lifted icon card | how-to, migration; `flow` for "old way → new way" |
| `versus` | `overlap`, `table`, `logos` | tilted overlapping cards + VS badge; one comparison table; two big logo tiles + one fact chip each | X vs Y |
| `hub` | default | blue centre tile with 6–7 product cards (logos + names) and hand-drawn arrows | best-of lists, integrations |
| `focus` | default | centred headline with the key phrase in a blue selection box; UI card with skeleton rows peeking from the bottom | one key idea with 2–3 values |
| `stat` | default | one giant number, caption, breakdown card | one headline statistic |
| `ranked` | default | named bars ranked by a real metric | rankings, cheapest/fastest |
| `timeline` | default | steps on a track, one highlighted, a callout | process, "how long" |
| `checklist` | default | tilted checklist card with progress | how to choose, requirements |
| `prompt` | default | faded data panel, big headline, pill bar | cost, FAQ, "what is" |
| `stack` | `default`, `split` | one takeaway card over offset cards; `split`: two-column contrast | one key rule; definitions |
| `window` | default | app window: list pane + detail pane | vendor lists, pricing tables |

The same article type can use several layouts (a cost article: `focus`, `stat`, `prompt`, `window`, `ranked`). Use that freedom to avoid repeats. When a category's least-used tier already has one use each, **add a new variant before briefing Makers**.

**Opt-in craft kit (`"craft": true`, being trialled):** near-black ink, mono uppercase labels, grey "off" states, line-icon tiles, a clean connector with a dot terminal, and an optional site mark + series tag. See "Craft spec" in the design language.

## Three agents, always (required)
Full prompts and the QA checklist are in `references/agents.md`.
- **Orchestrator (you):** read the articles and the site history, assign each article a distinct least-used layout, fix renderer issues, start the Makers and the QA agent, loop fixes, deliver. You don't approve images yourself.
- **Makers (subagents, in parallel):** write each spec from the article file and render it. They use the assigned layout and never `--force`.
- **QA (separate subagent):** judges every image from one contact sheet: no reused layout or skeleton, 2-second scan, ≤15 words with no fact twice, not bland, balanced, true to the article, logos clean. It returns PASS or FAIL with exact fixes.
- Failed images go back to their Maker (SendMessage) and then to QA again, for up to 3 rounds. Only QA-passed images are delivered.

## Workflow (fast batch mode)
1. **Read (Orchestrator):** `node <skill-dir>/scripts/read-articles.mjs <url> <url> ... --out featured-images/articles` reads every URL in parallel into `articles/<slug>.md`. Note each article's type, core idea, 3–6 hard facts, **category** and **topic**; duplicate URLs (`…-guide`, `…-guide-2`) share one `topic`.
2. **Plan (Orchestrator):** `node <skill-dir>/scripts/plan.mjs --brand <b> --category <c>` shows layout usage. Pick the best fit from the least-used tier for each article, then reserve all of them at once with `--reserve <slug>=<mode>[/<variant>][@<topic>] ...`. Show the plan to the user when doing more than 3 images.
3. **Spec + render (Makers, in parallel):** one `specs/<slug>.json` each, following `references/spec-format.md` (always `articleTitle`, `brand`, `category`, `slug`, `topic` when shared, `logo` on named products). Then render:
   ```bash
   node "<skill-dir>/scripts/render.mjs" "featured-images/specs/<slug>.json" --out "featured-images/<slug>"
   ```
   Outputs: `master.png` (1600×900), `16x9-1200.webp` (social/OG), `7x5.webp` (theme crop), `card-350x250.png` (size check). Every render prints `layout=… words=N/15`.
4. **QA:** `node <skill-dir>/scripts/sheet.mjs --brand <b> --category <c> --out featured-images/qa-sheet.png --highlight <slugs>`, then one QA agent.
5. **Fix** only the failures, in parallel. **Deliver** QA-passed images as a contact sheet with each layout and the facts used. Ask before uploading anything to a website.

**When the renderer refuses** (never work around it with `--force` or another folder):
| Message | Fix |
|---|---|
| `HEADING CHECK FAILED` | Rewrite the heading from the title's key words |
| `TEXT CHECK FAILED` | Cut subs that aren't the point, then sentence tails, until ≤15 words and ≤7 per element |
| `VARIETY CHECK FAILED` | Use one of the layouts it lists (set `mode`, plus `variant` when not `default`) |
| `SERIES CHECK FAILED` | Remove `"series"` from this spec |

## Setup and notes
- **First-time setup:** Node 18+, Chrome or Edge (or the `CHROME` env var), `npm install` in `scripts/`, and `npm i -g agent-browser` for fast article reading. **Without agent-browser**, read the articles with WebFetch in parallel (all URLs in one message), save the text to `featured-images/articles/<slug>.md`, and continue.
- **Brandfetch client ID** (optional, free at brandfetch.com/developers): put it in `~/.blog-featured-images/config.json` as `{"brandfetchClientId": "…"}` or the `BRANDFETCH_CLIENT_ID` env var. **Never commit it.** Without it, logos still work through Iconify and Simple Icons.
- **New site:** copy `brands/_template.json` to `brands/<site>.json` and fill in the real brand colours, plus `markUrl` (the site's own icon) and `markName` for the optional site mark.
- Fonts (Inter, JetBrains Mono), icons (Phosphor) and logos load from the internet at render time.
- Variety history is per brand (`~/.blog-featured-images/history-<brand>.json`, or the `FEATURED_HISTORY_DIR` env var). Re-rendering the same `slug` replaces its entry. To drop a discarded test image, delete its entry.
