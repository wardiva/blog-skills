---
name: blog-featured-images
description: Generate premium, article-specific blog featured images (1600x900 plus crops) in an approved soft-pastel "card" design language with 10 composition types. Use when the user asks for a blog featured image, blog thumbnail, article cover, hero image or OG image for a blog post or article URL, or wants featured images for several articles or a whole category. Reads each article, plans the batch so no two related articles share a composition, writes a spec from the article's real facts, and renders it with headless Chrome (free, no AI image generation). A built-in variety ledger blocks repeats.
---

# Blog featured images

> **Approved behaviour** (user sign-off, 2026-10-13). The rules in this file and in the "APPROVED" section of `references/design-language.md` are the standard. Keep all of them when changing the skill.

Make featured images that are **relatable to the article**, **understood in 2 seconds**, and **different from every other image in the same category**, while all of them look like one family.

The full rulebook (colours, type, cards, "never" list) is in `references/design-language.md`. The JSON format for every composition is in `references/spec-format.md`. Read both before your first image in a session.

## The hard rules
0. **The heading mirrors the blog title.** Use the title's own words and meaning, just shorter (drop the year and filler). Never reword creatively. Set `"articleTitle"` in every spec; the renderer blocks headings that drift ("HEADING CHECK FAILED").
1. **Relatable.** Read the full article. Use only its own facts (numbers, names, steps, comparisons). Never invent figures or use generic concepts.
2. **Easy to understand.** One idea, one focal point, short real words. Check it at 350×250.
3. **Different every time.** Never give two posts in the same category, or two articles on the same topic, the same composition. The renderer enforces this.

## The 10 compositions (`mode`)
| mode | Shows | Best for |
|---|---|---|
| `before-after` (default) | raw card → clean card, plus a legend | how-to, migration, transformation |
| `versus` | two equal cards plus a "vs" chip | X vs Y |
| `prompt` | faded data panel, big headline, pill bar with chips | cost, pricing, FAQ, "what is" |
| `hub` | blue centre tile, 6 tilted cards, hand-drawn arrows | best-of lists, integrations |
| `stack` | one takeaway card over offset cards | guides with one key rule or warning |
| `window` | full app window: list pane + detail pane | vendor lists, pricing tables, walkthroughs |
| `timeline` | steps on a track, one highlighted, a callout | process, implementation, "how long" |
| `checklist` | tilted checklist card with progress | checklists, "how to choose", requirements |
| `stat` | one giant number, caption, breakdown card | one headline statistic or cost |
| `ranked` | named bars ranked by a real metric | rankings, cheapest/fastest, market share |

**The same article type can use several modes.** A cost article can be `prompt`, `stat`, `window` or `ranked`, and a how-to can be `before-after`, `timeline`, `stack` or `checklist`. Use this freedom to avoid repeats.

## Workflow

### 1. Read every article in the request
Fetch each whole page. For each one, note the article type, core idea, 3–6 hard facts, the takeaway, its **category** (the site's blog category) and its **topic**. Articles that cover the same subject (including duplicate URLs such as `…-guide` and `…-guide-2`) share one `topic` string.

### 2. Plan the batch before rendering anything
Write a short plan table: article → mode → background → key facts. Rules:
- Within a category, no mode repeats until most of the 10 have been used. Never repeat a mode within 6 consecutive posts.
- Articles with the same `topic` get different modes and different angles (different facts, not the same facts redrawn).
- If `featured-images/.featured-ledger.json` exists, read it first. It lists what this category has already used.
- Vary the background too (`wash`, `cool`, `white`, `flat`). The renderer rotates it automatically if you leave `bg` out.

Show the plan to the user when doing more than 3 images.

### 3. Write the specs
One `<slug>.json` per article, following `references/spec-format.md`. Always set `articleTitle` (the real H1), `brand`, `category`, `slug`, and `topic` when a topic is shared. Keep text short so nothing wraps. Look at `examples/` for one approved spec per mode.

New site? Copy `brands/_template.json` to `brands/<site>.json` and fill in the site's real brand colours (check the live site).

### 4. Render
First time only: run `npm install` in the skill's `scripts` folder (installs `sharp`). Chrome or Edge must be installed; set the `CHROME` env var if it isn't found.
```bash
node "<skill-dir>/scripts/render.mjs" "<spec>.json" --out "featured-images/<slug>"
```
Outputs: `master.png` (1600×900), `7x5.webp` (theme crop), `16x9-1200.webp` (social/OG), `card-350x250.png` (size check). Each render is recorded in `featured-images/.featured-ledger.json`.

**If you see "HEADING CHECK FAILED", rewrite the heading from the title's key words.** **If you see "VARIETY CHECK FAILED", choose one of the suggested modes and rewrite the spec.** Do not use `--force` unless the user explicitly asks for a repeat.

### 5. Check, then fix
Open `master.png` and `card-350x250.png` and confirm:
- The topic is clear in 2 seconds.
- No text wraps, clips or overlaps, and nothing falls outside x 210–1390.
- Every number appears in the article.
- **Balance** (see "Visual balance rules" in `references/design-language.md`): one clear focal point at 350×250, all four corners anchored, the grid used only where it fits the vibe (on by default for stat, ranked, timeline and window only), no large empty card areas, **type balanced** (headline 56–76px and never wider than about 760px; only the stat number may be giant; see "Typography balance"), and the cursor (if any) never covering text.

Then put the batch side by side and confirm no two images look alike. Fix and re-render until all of this passes.

### 6. Deliver
Show the images, ideally as one contact sheet for a batch. For each, list the mode chosen and the article facts used. Ask before uploading anything to a website.

## Notes
- Fonts (Inter) and icons (Phosphor) load from the internet at render time.
- The ledger lives next to the output folders. Keep using the same `featured-images` folder per site so the variety history carries across sessions.
