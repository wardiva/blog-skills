---
name: blog-featured-images
description: Generate premium, article-specific blog featured images (1600x900 plus crops) in an approved soft-pastel "card" design language. Use when the user asks for a blog featured image, blog thumbnail, article cover, hero image or OG image for a blog post or article URL, or wants featured images for several articles or a whole category. Reads the article, picks a composition that differs from its category neighbours, writes a spec from the article's real facts, and renders it with headless Chrome (free, no AI image generation).
---

# Blog featured images

Make featured images that are **relatable to the article**, **understood in 2 seconds**, and **different from every other image in the same category**, while all of them look like one family.

The full rulebook (colours, type, cards, archetypes and the "never" list) is in `references/design-language.md`. Read it before your first image in a session.

## The three hard rules
1. **Relatable.** Read the full article. Use only its own facts (numbers, names, steps, comparisons). Never invent figures or use generic concepts.
2. **Easy to understand.** One idea, one focal point, short real words. Check it at 350×250.
3. **Different every time.** Same ingredients, but rotate the composition. Never give two posts in the same category, near each other, the same `mode`.

## Workflow

### 1. Read the article
Fetch the whole page, not just the intro. Note the article type (how-to, X vs Y, cost, best-of list, guide), its core idea, 3–6 hard facts, and the one takeaway.

### 2. Pick a composition (`mode`)
| Article type | Default mode | Alternative when a neighbour already used it |
|---|---|---|
| How-to / migration / transformation | before/after (omit `mode`) | `prompt` |
| X vs Y | `versus` | before/after ("what you'd choose → why") |
| Cost / pricing / FAQ / "what is" | `prompt` | before/after ("advertised → real cost") |
| Best-of list / integrations | `hub` | `versus` (the top 2) |

If you're making several images for one category, plan them together and give neighbours different modes.

### 3. Write the spec
Create `<slug>.json` following `references/spec-format.md`, with `"brand"` set to the site's brand file. Keep text short so nothing wraps. Look at `examples/` for approved specs.

New site? Copy `brands/_template.json` to `brands/<site>.json` and fill in the site's brand colours (check the live site; don't guess).

### 4. Render
Install once, from the skill's `scripts` folder: `npm install` (it installs `sharp`). Chrome or Edge must be installed; set the `CHROME` environment variable if it isn't found automatically.
```bash
node "<skill-dir>/scripts/render.mjs" "<path-to-spec>.json" --out "featured-images/<slug>"
```
Outputs: `master.png` (1600×900), `7x5.webp` (theme crop), `16x9-1200.webp` (social/OG), `card-350x250.png` (size check), `page.html`.

### 5. Check, then fix
Open `master.png` and `card-350x250.png` and confirm:
- The topic is clear in 2 seconds at card size.
- No text wraps or clips, and nothing falls outside x 210–1390 (the crop-safe zone).
- Every number appears in the article.
- The composition differs from its category neighbours.

Fix the spec and re-render until all of these pass.

### 6. Deliver
Show the user the master and the card preview. Say which composition you chose and why, and which article facts it shows. Ask before uploading anything to a website.

## Notes
- Fonts (Inter) and icons (Phosphor) load from Google Fonts and unpkg at render time, so rendering needs internet.
- Stack, window and split archetypes are planned but not built yet. If an article clearly needs one, say so and use the closest existing mode.
