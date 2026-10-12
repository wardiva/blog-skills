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
| Type | **Inter** only. Labels 50px/500, card headings 32–34px/500, bullets 29–30px, headlines 56–76px/600 with tracking −0.03em (see "Typography balance") |
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
| **Versus** | `versus` | "X vs Y" comparisons | Two **overlapping cards tilted toward each other** (−3° / +3°, right card on top), product name above each, a blue-gradient **VS badge** on the seam, plus a legend naming the key difference |
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
- balanced vertical spacing (calm whitespace is fine; never fill it with extra content; see "Minimal rule")

Then compare the batch side by side as a contact sheet, and confirm no two images look alike.

### Approved reference
The 10-composition sheet (rendered from the specs in `examples/`) is the quality bar. New images should look like they belong on that sheet.

---

## Visual balance rules (learned from base44.com/blog, 2026-10-13)

These rules make every image easy to take in at a glance. They work inside our design language and don't change it.

1. **One hero at 55–70% of the frame width.** Everything else is secondary and smaller. If two things compete for attention, make one smaller.
2. **A structure layer, used selectively.** A faint grid (lines at about 5.5% opacity) and six small dark **registration squares** at the safe-zone corners and midsides (x 210 / 1390, y 75 / 450 / 825) make empty space look intentional. **Use it only where it matches the vibe and doesn't overwhelm:**
   - **On by default:** `stat`, `ranked`, `timeline`, `window`. These are open, data-led layouts with breathing room, where the grid reads as structure.
   - **Off by default:** `before-after`, `versus`, `prompt`, `hub`, `stack`, `checklist`. These are card-heavy, tilted or busy layouts, where a grid adds noise.
   - Override per image with `"frame": true` or `"frame": false`. If the grid competes with the hero or makes the image feel crowded at 350×250, turn it off. Never add it to more than about half the images in a batch.
3. **Bleed for big UI.** Large windows or dashboards may run off the bottom or right edge (`"bleed": true` in window mode). The chrome bleeds, never the key text: all words stay inside x 210–1390.
4. **Tactile texture.** Paper grain at about 9% over everything, including cards, so nothing looks flat or digital.
5. **One interaction cue at most.** A cursor (`"cursor": [x, y]`) pointing at the key fact, a chip or a send button. It must point at something meaningful and never cover text.
6. **Scale contrast.** One very large element (number, name, headline) against small labels. Big type carries the topic; small type supports it.
7. **Calm field plus one pop.** One background field, one blue accent, nothing else saturated.
8. **Optical centre.** The hero's visual mass sits at or slightly above the canvas centre, never sagging toward the bottom. Balance a left-heavy hero with a right-side element of similar weight.

**Balance QA (add to every check):**
- Squint at the 350×250 card: one clear focal point?
- All four corners anchored by a card edge, bleed or (on grid layouts) a registration square?
- If a grid is present: does it feel calm, not overwhelming? If not, set `"frame": false`.
- Minimal? No element added just to fill space, and no fact shown twice (see "Minimal rule")
- Does the cursor, if any, cover text?

---

## Lessons learned and speed
What each session taught us (speed tools, pre-flight checks, taste, gotchas) lives in the skill's `references/lessons.md`. Read it before every batch. The top rule is to **work fast**: parallel reads, reserved layouts, parallel Makers, one QA contact sheet.

---

## Three-agent rule (user rule, 2026-10-13)

Featured images are always made by **three agents**: an **Orchestrator** (plans and assigns a distinct layout per article, runs the loop, delivers), a **Maker** (writes the spec and renders) and a separate **QA agent** (judges every image and never edits). QA checks:
- no layout used twice (history plus a visual side-by-side)
- easy to scan in 2 seconds at 350×250
- less text
- visually balanced
- true to the article

Failed images go back to the Maker, for up to 3 rounds. Only images that passed are delivered. Prompts and the checklist are in `references/agents.md` (skill folder).

---

## Variety enforcement (user rule, 2026-10-13: "make this rule forceful")

**What failed:** the Odoo vs Sage Intacct window and the EMR Software Cost window were the same thumbnail. The old check only read the ledger in its own output folder and only compared mode names, so it never saw the EMR window, which was rendered elsewhere.

**How it is enforced now (in the renderer):**
1. **One site-wide history per brand** at `~/.blog-featured-images/history-<brand>.json`. Every render is recorded there, wherever its output folder is (tests and alternates included), because anything the user has seen counts.
2. **Layout = mode + variant.** Bleed, cursor, background, colours and text do **not** make a new layout.
3. **Strict rotation:** in a category, only the **least-used** layouts are allowed. No layout repeats until every layout has been used there.
4. **Same topic:** articles on the same topic never share a mode.
5. A failure prints "VARIETY CHECK FAILED" with the allowed layouts. Use one of them. Never `--force` (unless the user asks), and never render into another folder to dodge the check.

**Cycle length = number of layouts (12 today: stack `split` was added when the cloud ERP stack image copied the EMR stack image).** A category with more posts will eventually repeat a layout, and then always the least-used one. To push repeats further apart, add **variants** (a new skeleton for an existing mode, like versus `table`). Each variant must pass the Skeleton rule against every other layout.

---

## Minimal rule: never text-heavy (user rule, 2026-10-13)

The user approved the plain Odoo vs Sage Intacct window (4 rows, a question, one heading, 3 short bullets, calm whitespace below) as **"really good, minimal"**. They called the version with extra comparison bars, bigger UI text and a bleeding window **"ugly"**.

- **One idea per image, carried by the fewest facts that prove it.** Usually 3–4 rows or 2–3 bullets, never more. Pick the strongest facts; don't put every fact from the article on the image.
- **Whitespace is good.** Empty space inside a card or window is calm and premium. **Never add bars, rows, bullets, badges or text just to fill a gap.**
- **No stacked explanations.** Don't show the same fact twice in different forms (e.g. a heading *and* bars *and* bullets for the same numbers).
- **UI mockups (window, prompt panel) keep UI-sized text:** rows about 24px, subs about 19px, bullets about 22px. They should look like a real app, not a slide. The "Body text must breathe" sizes apply to free-standing cards and lists, not to text inside a mock app window.
- **The rule of thumb is subtraction.** Before rendering, remove one element and ask whether the image still tells the story. If it does, keep it removed.
- **15 words maximum, no sentences** (renderer-enforced; see "Text budget" below).

---

### Text budget: renderer-enforced (user rules, 2026-10-13: "need to show less text… force this rule"; "this is text heavy. MAKE RULE FORCE")
- **Hard cap: 15 visible words** on the whole image, and **max 7 words per text element**. **No sentences:** labels and short phrases only. The renderer refuses either with **"TEXT CHECK FAILED"** and prints `words=N/15` on every render.
- History: 30 words was still "text heavy". The cloud ERP card at 25 words, with a one-sentence definition, was rejected. The 7 Best ERP hub (15 words, names only) was accepted.
- **Secondary lines only when they ARE the story.** A price belongs on a pricing image, but not on a "best of" list, where the names are the story. Hub cards are names only by default (`"showSubs": true` to override).
- **Write labels, not prose:** "ERP on the vendor's servers", not "ERP that runs on the vendor's servers, delivered over the internet by subscription."
- Cut in this order: secondary lines (subs, legends, extra rows) → sentence tails ("delivered over…", "which means…") → extra bullets → subtitles.

### Logos (user rule, 2026-10-13: "use Brandfetch… logos should always match the vibe")
- **Where:** product names in hub cards, versus labels and table headers, window list rows (replacing the letter avatar), and ranked rows. Only where a real product is named; never decorative.
- **Source: a free logo chain, built into the renderer and fully automatic.** Each logo is hotlinked at render time (nothing downloaded or stored):
  1. **Brandfetch symbol**: the clean mark without text (e.g. Microsoft, Acumatica, Odoo).
  2. **Iconify `logos`**: full-colour SVG (`api.iconify.design/logos/<slug>-icon.svg`, then `<slug>.svg`).
  3. **Simple Icons**: SVG in the official brand colour (`cdn.simpleicons.org/<slug>`), e.g. the transparent green Sage mark.
  4. **Brandfetch icon**: shown **edge to edge as an app-style tile** (NetSuite, Epicor), so dark squares look intentional, not like blocks.
  5. **Lettermark**: a grey tile with the first letter.
  `<slug>` comes from the domain (`sage.com` → `sage`). Without a Brandfetch ID, steps 1 and 4 are skipped and Google favicons are the last image step.
- **Why the chain:** Brandfetch alone gave unreadable square wordmarks for NetSuite, SAP and Sage. QA failed them as "dark blocks". The open SVG libraries are crisp and transparent, but don't cover niche B2B and healthcare vendors.
- **Client ID:** free from brandfetch.com/developers. Keep it **local** in `~/.blog-featured-images/config.json` (`{"brandfetchClientId": "…"}`) or the `BRANDFETCH_CLIENT_ID` env var. Never commit it to the shared repo.
- **Style (user picked A):** `logoStyle: "color"` (default): original brand colours in a small white rounded tile (46–52px) with a hairline border, beside the name. One style per image, so logos read as one set. `mono` (grey) and `tint` (soft blue) exist for images where colour logos would compete.
- **Vibe check:** logos stay small and secondary. The hero (blue tile, VS badge, big number) remains the focal point. If a logo is an unreadable wordmark squeezed into a square, it's still acceptable as a brand-colour tile, but never enlarge it.
- Logos add no words to the text budget.

## Typography balance (user rule, 2026-10-13: "font should look visually balanced")

Text supports the hero; it never shouts over it. Sizes are for the 1600×900 master.

| Role | Size | Rule |
|---|---|---|
| Headline (prompt, timeline, ranked) | **56–66px** in prompt, up to 76px in others; weight 600, tracking −0.03em | **Never wider than about 48% of the canvas (about 760px).** Auto-size down for longer lines, never up |
| Hero number (stat only) | up to 210px, auto-fit to 690px wide | The only place giant type is allowed, because the number *is* the hero |
| Section labels ("Old EMR export", "Dynamics 365") | 50px / 500 | Muted colour so they label rather than dominate |
| Card headings | 32–36px / 500–600 | |
| Bullets, rows, body | 28–36px for primary rows, 22–28px for bullets | See "Body text must breathe" |
| Small labels, subs, chips | 18–28px | Still readable at 350×250 (about 4px+), or cut them |

**Body text must breathe (user rule: body text was "too short and congested"):**
- Primary row or list text **≥ 32px** (ideally 36), secondary or price text **≥ 26px** (ideally 28), with line height ≥ 1.2.
- Space between list rows **≥ 28px**; icon tiles ≥ 72px so rows have presence.
- Faded rows never drop below about 45% opacity, so the third row is still readable.
- Vertical rhythm: the gaps between stacked blocks (label → rows → headline → bar) are even and **≥ 40px**. No block touches the next.

**Balance checks:**
- **One dominant text element per image.** If the headline and a card both feel loud, shrink the headline.
- **Headline to body ratio about 1.6–2.2:1** (e.g. 63 : 36). Above 3:1 (like the old 102px headline over 34px rows) feels oversized and makes the body look tiny.
- Headlines sit with breathing room above and below (≥ 40px) and never crowd neighbouring elements.
- Text width is under about 65% of its container. If a line runs edge to edge, the size is too big.
- At 350×250, the headline should read clearly but not fill the card. If it is the first and only thing you notice, it is too big.

---

## Heading rule: mirror the blog title (user rule, 2026-10-13)

The heading on the image must use **the blog title's own words and meaning, just shorter**. No creative rewording, puns or new angles.

**How to shorten a title:**
1. Keep the **subject** (EMR, ERP, Dynamics 365) and the **angle** (cost, switch, best, vs, by practice size).
2. Drop the year, filler words, "How to", "Complete guide", and brackets.
3. Keep at least 75% of the heading's key words straight from the title.

| Blog title | Good image heading | Bad (rewritten) |
|---|---|---|
| EMR Software Cost 2026: Pricing by Practice Size | EMR Cost by Practice Size | What EMR really costs |
| How to Switch EMR Vendors Without Losing Patient Data | Switch EMR Vendors Without Losing Data | Every chart makes the move |
| 7 Best ERP Software for Small Businesses in 2026 | Best ERP for Small Business | Seven ERPs. One right fit. |
| Microsoft Dynamics 365 vs Acumatica for Growing Businesses | Dynamics 365 vs Acumatica | Seat vs usage |

**Enforced:** every spec carries `"articleTitle"` (the real H1). The renderer fails with **"HEADING CHECK FAILED"** when the image heading (`headline` in prompt, timeline or ranked; `title` in stack or checklist; `list.heading` in window; `caption` in stat) uses too few of the title's words. Compositions without a heading (before-after, versus, hub) must use the title's key terms in their labels.

---

## Skeleton rule: compositions must differ in structure, not just content (user rule, 2026-10-13)

Two compositions that share the same **skeleton** (the arrangement of blocks) read as the same image at thumbnail size, even with different words. Example that failed: the old `versus` was before-after's skeleton again (two labels → two white cards side by side → connector → two-dot legend).

**Each composition owns a distinct skeleton:**
| mode | Skeleton (what you see at a glance) |
|---|---|
| before-after | small raw card → dashed connector → big clean card, legend below |
| versus (overlap) | **two tilted, overlapping cards** (−3° / +3°, right on top) with a 96px blue-gradient **VS** badge (white text, white ring) on the bottom of the seam. Differs from before-after by tilt, overlap and the badge. Optional `"variant":"table"` = one comparison table card |
| prompt | faded panel bleeding off the top, centred headline, pill input bar |
| hub | centre tile with 6 tilted cards around it and hand-drawn arrows |
| stack | wide takeaway card with 2 cards peeking above it |
| window | full app window, list pane plus detail pane |
| timeline | headline top-left, horizontal track with step dots |
| checklist | single tilted checklist card |
| stat | giant number left, breakdown card right |
| ranked | headline top-left, horizontal bar list |

**When adding or changing a composition:** squint at its 350×250 card next to every other mode. If two share a skeleton, redesign one (different field split, scale, depth or orientation). Never ship two modes that differ only in their text.

### Versus badge rule (approved 2026-10-13)
- The "vs" is a **focal badge, not a small grey chip**: 96px circle, blue gradient `#3B86F0 → #0A5FD8`, white "VS" at 30px/600, a 7px white ring and a soft blue shadow.
- It sits on the **bottom of the seam** where the two cards overlap and stays upright (counter-rotated). It must never touch text or a bullet.
- **Table variant:** the same blue badge at 84px, placed **where the header line crosses the column line** (user's pick, option B). **No glow:** a 6px white ring plus a barely visible neutral shadow (`0 2px 6px rgba(20,26,38,.08)`), because the blue drop shadow "seems too much". The right column's text is padded 72px from the seam so the badge never touches it. Rejected: the small grey chip, the badge straddling the card's top edge, and the heavy blue shadow.
- Rejected: the split colour field version (did not match the design language) and the small 60px grey chip (too weak, covered a bullet).
