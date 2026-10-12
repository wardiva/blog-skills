# Featured image design language (APPROVED, 2026-10-13)

This is the approved look for blog featured images, first set for medsoftwarehub.com. Follow it for every new featured image.
This file is the rulebook.

---

## The three non-negotiable rules

1. **Relatable to the article. This is mandatory.**
   - Read the *whole* article first.
   - The image must show the article's core idea using its **own facts**: its numbers, names, steps and comparisons.
   - Never use generic stock concepts. Never invent figures. Every number on the image must appear in the article.
2. **Easy to understand at a glance.**
   - A reader should get the topic in about 2 seconds at **350×250** (blog-card size).
   - One idea per image, one focal point, and short real words in big type.
   - If you have to explain the image, it has failed.
3. **Every image looks different, especially within the same category.**
   - Same ingredients, different **composition**.
   - Never use the same composition archetype for two posts in the same category that sit next to each other or near each other.
   - Before choosing, check which archetypes the category's latest posts used, and pick a different one.

---

## Fixed ingredients (these never change; they make it one family)

| Ingredient | Spec |
|---|---|
| Background, wash variant | Soft pastel wash: peach `#FDEFE8` → `#F4F6FB` → sky `#DCEEFC` → `#CBE6FA` (135°), with a blurred sky pool `rgba(39,172,242,.35)` top-right and a warm pool bottom-left |
| Background, flat variant | Warm off-white `#F1F0EC` (used for alternation, e.g. the hub) |
| Background, cool variant | `#EEF6FE` → `#DCEEFC` → `#CDE6FB` with a sky pool at the bottom (prompt) |
| Type | **Inter** only. Labels 50px/500, card headings 32–34px/500, bullets 29–30px, headlines 96–104px/600 with tracking −0.035em |
| Ink colors | Primary text `#141A26`; muted `#7F8794` / `#5D6675`; left/"before" label warm grey `#7C7468`; right/"after" label blue `#2C5FAE` |
| Accent | Blue gradient `#3B86F0 → #0A5FD8` (tiles, buttons); sky `#27ACF2` (carets, legend dots) |
| Cards | White, radius 20–22px, shadow `0 24px 50px rgba(30,60,110,.12)` plus a 1px hairline. Contents are **real text** from the article, never grey placeholder bars |
| Details | Dashed connectors `#9AA3B2`; dot legends (black = before/left, sky = after/right); text caret; Phosphor icons (free) |
| Texture | Fine grain overlay, about 5% multiply |
| Canvas | 1600×900 master. All key content inside **x 210–1390** so the theme's 7:5 crop (and 2:1, 16:9) keeps it |
| Never | Text-free abstract shapes, fake AI 3D, glows or neon, gradient text, stock photos of laptops, vendor logos invented or warped, dark backgrounds |

---

## Composition archetypes (rotate these)

Rendered by `scripts/render.mjs`, selected with `"mode"` in the article spec.

| Archetype | `mode` | Best for | What it shows |
|---|---|---|---|
| **Before → After** | *(default)* | How-to, migration, "without losing…", transformations | A raw "before" card with a caret → dashed connector → a clean "after" card with heading and bullets, plus a 2-dot legend |
| **Versus** | `versus` | "X vs Y" comparisons | Two equal cards (name, plan, 3 key facts) with a "vs" chip, plus a legend naming the key difference |
| **Prompt** | `prompt` | Cost, pricing, "what is", FAQ-style articles | A faded app panel listing the article's figures, a big headline, and a pill input bar with chips and a blue send button |
| **Hub** | `hub` | "Best X" listicles, integrations, ecosystems | A blue center tile (Phosphor icon), six tilted white cards (name + one fact), hand-drawn arrows, flat warm background |
| **Stack** | `stack` | Guides with one key rule or warning | One front card holding the takeaway over 2 offset cards |
| **Window** | `window` | Vendor lists, pricing tables, walkthroughs | A whole app window: list pane + detail pane, real text |
| **Timeline** | `timeline` | Processes, implementation, "how long" | Steps on a track, one highlighted, plus a callout card |
| **Checklist** | `checklist` | How to choose, requirements | A tilted checklist card with progress |
| **Stat** | `stat` | One headline number | A giant number, caption, and breakdown card |
| **Ranked** | `ranked` | Rankings by a real metric | Named bars, winner in the accent |

### Picking an archetype
1. Match the article type (table above).
2. Check the same category's recent posts (the renderer's ledger blocks a mode used within the last 6 posts, and any mode already used by an article on the same `topic`). If the natural archetype was used by a neighbour, choose the next-best one and **vary the background** (wash, flat or cool).
3. Vary scale and depth too: a tight crop of one element vs. a whole window; flat vs. stacked.

---

## Workflow for every new article

1. **Read the full article.** List its core idea, 3–6 hard facts (numbers, names, steps) and the one takeaway.
2. **Pick the archetype** using the rules above, different from the category's neighbours.
3. **Write the spec** a spec JSON (see `references/spec-format.md`) using only facts from the article. Keep bullets short so nothing wraps.
4. **Render:** `node scripts/render.mjs <spec.json>`
5. **Check** `card-350x250.png`. Is it understood in 2 seconds? Is there no wrapping or clipping? Is it different from its category neighbours? Fix and re-render.
6. **Export** what the render produces: `master.png` (1600×900), `7x5.webp`, `16x9-1200.webp` (social), and the card preview.

---

## Approved examples (Clinical Software, medsoftwarehub)

| Article | Archetype | Built from the article |
|---|---|---|
| How to Switch EMR Vendors Without Losing Patient Data | Before → After | Raw old-EMR export → verified patient chart, "Mapped and verified" |
| Microsoft Dynamics 365 vs Acumatica (2026) | Versus | $80/user/mo per seat vs unlimited users, usage-based, from $6,396/yr |
| EMR Software Cost 2026 | Prompt | Year-one cost: solo $15K–$30K, 2–5 providers $40K–$150K, 26+ $100K–$500K+ |
| 7 Best ERP Software for Small Businesses (2026) | Hub | Six ERPs on tilted cards with each one's starting price |

Example specs for all four are in `examples/`.

---

## APPROVED: how the skill must work (user sign-off, 2026-10-13: "i really love it")

This is the approved behaviour. Keep it. Any future change must keep all of the following true.

### 1. Ten compositions, one family
`before-after`, `versus`, `prompt`, `hub`, `stack`, `window`, `timeline`, `checklist`, `stat`, `ranked`.
All of them share the same ingredients:
- the pastel backgrounds
- Inter type
- white rounded cards with real text
- the blue accent gradient
- grain
- the crop-safe zone x 210–1390

The **composition** is what makes each image different. The ingredients make the set one family.

### 2. Variety is enforced, not hoped for
- **Category rule:** a composition can't be reused within the **last 6 posts** of the same category.
- **Topic rule:** articles on the same subject (including duplicate URLs such as `…-guide` and `…-guide-2`) share a `topic` and can **never** use the same composition. They must also show different facts or angles.
- **Backgrounds auto-rotate** (`wash`, `cool`, `white`, `flat`), so neighbours never share a background unless one is set explicitly.
- The renderer records every image in `featured-images/.featured-ledger.json` and refuses a repeat with **"VARIETY CHECK FAILED"**, listing the unused compositions. Never use `--force` unless the user explicitly asks.

### 3. Batch planning before rendering
For more than one article:
1. Read **every** article in full.
2. Write a plan table (article → composition → background → facts) and show it to the user when there are more than 3 articles.
3. Then render.

The same article type can map to several compositions:
- cost → `prompt`, `stat`, `window` or `ranked`
- how-to → `before-after`, `timeline`, `stack` or `checklist`

Use this range to avoid repeats.

### 4. Every image is about its article
- Only facts that appear in the article: numbers, names, steps, comparisons.
- Nothing invented and nothing generic.
- It must be readable in 2 seconds at 350×250.

### 5. Visual QA before delivering
Check `master.png` and `card-350x250.png` for:
- no wrapping, clipping or overlapping text
- nothing outside the crop-safe zone
- balanced vertical spacing, with no big empty card areas

Then compare the batch side by side as a contact sheet, and confirm no two images look alike.

### Approved reference
The 10-composition sheet (rendered from the specs in `examples/`) is the quality bar. New images should look like they belong on that sheet.
