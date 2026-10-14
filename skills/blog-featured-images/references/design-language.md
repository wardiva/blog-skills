# Featured image design language

The approved look for blog featured images. **This file is the rulebook.** Two families share it: the **card layouts** (sections 3–5) and the **headline layouts** (section 3d). The images in `references/approved/` show the target, and their specs are in `examples/`.

---

## 1. The non-negotiable rules

1. **Relatable to the article.** Read the whole article first. Show its core idea with its **own facts** (numbers, names, steps, comparisons) in its own wording. Never invent a figure, an abbreviation or a generic stock concept. Every number on the image appears in the article, **with its qualifier** ("per provider", "up to", "from", "minimum"). Figures shown together never contradict each other (a breakdown sits inside the headline range).
2. **Understood in 2 seconds** at 350×250 (blog-card size). One idea, one focal point, short real words. Prefer a visual (icon, logo, number, arrow, bars) over a text-only card.
3. **Different every time.** No layout repeats in a category until every layout has been used, and articles on the same topic never share a mode (see 9).
4. **Minimal.** At most 15 words, labels not sentences (see 7).
5. **Visually appealing.** An image that follows every other rule but doesn't look good **fails** (see 2).

---

## 2. Visual appeal is a hard gate

Judge every image like a design director, ideally with a taste skill (impeccable / ui-ux-pro-max) in mind, at full size and at 350×250:

1. **Blue dosage.** A big blue mass in the illustration (the hub's blue tile, a giant blue number, a blue selection box) needs a **neutral** field (`cream`, `paper`), never `g5` or the vibrant blue. A grey-heavy illustration needs some colour behind it (`sky`).
2. **Logo balance.** A logo fills **about 60–70% of its tile**. A full-bleed app icon (e.g. NetSuite's dark square) **becomes the tile itself**. Wide wordmarks (SAP, Sage) fill about 65–75% of the tile's width.
3. **Logos speak for themselves.** When products have recognisable logos, show **logos only**, not logo + name cards. The hub does this by default.
4. **Figure/ground.** The hero separates cleanly from the field: no grey on grey, no white on near-white without a soft shadow.
5. **Balance.** Even tile sizes, gaps and arrow lengths; the group sits on the optical centre; nothing looks too small or too big next to its neighbours.

---

## 3. Backgrounds

| Kind | `bg` | Look |
|---|---|---|
| Light | `sky` | light sky, top to bottom, thin guide lines |
| Light | `paper` | cool off-white `#F1F3F6` |
| Light | `cream` | warm off-white `#F6F2EA`, warm guide lines, no grain |
| Light | `g5` | near-white at the top glowing into bright sky under the hero |
| **Vibrant** | `blue` | **"Deep dunes":** bright blue `#3D80F2` at the top melting into deep royal `#1638B0` / `#0A1E70` in soft rolling bands |

- **Grain:** heavy on the vibrant blue, fine on `sky`, `paper` and `g5`, none on `cream`. It sits on the field only, so cards stay crisp. `"grain": false` turns it off on a light field.
- **Vibrant images** (the deep-dunes blue and the black headline layouts) appear on about 1 in 3 images per category, never on neighbours ("VIBRANT CHECK FAILED").
- Only these five backgrounds exist ("BACKGROUND CHECK FAILED" for any other name).

### 3a. Background fit: the background must flatter the illustration
Each layout lists only the backgrounds that suit its illustration, best first. Neighbours alternate within that list. A `bg` outside it is refused ("BACKGROUND FIT FAILED").

| Layout | Fits (best first) | Why |
|---|---|---|
| checklist | g5, sky | a single floating white card; light rising under it lifts it |
| stack | g5, cream | a single floating white card |
| before-after | g5, sky | white cards with a lifted "after" card |
| ranked | sky, g5 | grey bars need colour behind them |
| focus | sky, g5 | skeleton rows need colour behind them |
| window | sky, g5 | a big white app window |
| versus | sky, cream | a table or tilted cards |
| hub | cream, paper | a big blue tile needs a neutral field |
| timeline | cream, sky | a thin track and callout on a calm warm field |
| stat | paper, cream | the giant number brings the colour (a soft blue gradient by default; `"valueColor": "navy"` or `"blue"` to change it) |
| prompt | its own | paints its own light-blue field with a strong blue glow at the bottom (`"field": "soft"` for a softer gradient) |

- Cool greys never sit on cream; on cream the guide lines turn warm and the blue margin dots are hidden (automatic).
- Always check at 350×250 next to the neighbours: the hero separates cleanly, and the field never fights the illustration's colours.

### 3b. Vibrant fit: only a big white card goes on the blue

| On blue? | Layouts |
|---|---|
| **Yes** | `checklist`, `versus/table`, `window`, `before-after/flow` |
| **No** | everything else (blue-heavy illustrations become one flat blob; floating tiles look weak) |

The renderer refuses the rest ("VIBRANT FIT FAILED"). On blue, text on the field turns white, and the frame grid, margin dots and all drop shadows are off.

### 3c. Shadows follow the background
- **Vibrant blue and black fields: no drop shadows.** Cards, tiles, icons and the cursor sit flat on the field.
- **Light backgrounds: minimal shadows, tinted to the field:** cool on `sky`/`g5`, warm on `cream`, neutral on `paper`. Short and soft (opacity at most 8%), just enough to lift the card.
- 1px edge lines are card edges, not shadows; they stay on light fields.
- The renderer applies this to every layout. Never hand-add heavy shadows.

---

## 3d. Headline layouts
Bold names or a big, tight headline carry the image, with colour in a few clean shapes. Three are for X vs Y:

| Layout | What you see | Best for |
|---|---|---|
| `versus/pills` | grey frame, two white panels: on top, two blue pills face each other with the two logos at the tips; below, the question ("A or {{B?}}") | X vs Y |
| `versus/connect` | grey frame, one white panel: a centred headline with a blue phrase and a small sparkle divider; two big logo tiles linked by thin crossing strands to a white **VS** circle; small dot patches in the top corners | X vs Y |
| `versus/slash` | black field with a fine dot grid; the two names in heavy caps (a coloured part each); a big italic **VS** with a glowing diagonal streak | X vs Y (vibrant) |
| `versus/duo` | black field, a tag pill and a big light-weight white headline top-left (no site mark); two watercolour panels below, each in **that brand's own colour** (the subtle blue when the brand has no vivid colour) with the brand's mark turned white and its name. A low-resolution wordmark is replaced by the name in clean white type | X vs Y (vibrant) |
| `dark` | black field, the **product's own icon on a white rounded tile** top-left (never the site mark), a tag pill and a big medium-weight white name; a watercolour panel in the **product's own colour** with its mark turned white and its name below | **single-product articles** (review, pricing, features, "is X worth it"); may repeat up to 3 times per category (vibrant). Never an X vs Y article |
| `logotype` | the product's **black** logo, large and centred on the cream field with a faint square grid: its icon in white on a **black rounded tile** (slightly taller than the wordmark) beside the black wordmark; an icon that is already a filled tile keeps its own. No other text: the logo's typography is the image | single-product articles whose logo is black with strong typography; may repeat up to 2 times per category. The renderer checks the logo is black ("LOGOTYPE CHECK FAILED") |

- **Colour:** shapes are a near-solid vivid blue (`#0A6EF5 → #1D8BFF`) with only a faint tonal drift and fine grain. Headline key phrases use `{{ }}` and render in the same blue.
- **White frame:** a white design always sits in a **white rounded panel inset 28px on a light-grey `#F2F2F3` frame**, so it reads as its own block on a white blog page (automatic).
- **Black fields** (`dark`, `versus/slash`, `versus/duo`) count as vibrant (see 3).
- **Brand colour:** when a product's logo colour is vivid and modern (e.g. Sage green), `dark` and `duo` use it for the panel (`"color": "#00C247"`); otherwise the panel is the subtle blue.
- **Single-product articles:** `logotype` when the product's logo is black with strong typography (up to 2 per category), otherwise `dark` (up to 3 per category). X vs Y articles use a versus layout.
- **Six ways to show X vs Y**, all showing both products: `versus/overlap`, `table`, `pills`, `connect`, `slash`, `duo`. **`slash`, `connect` and `duo` are favourites: each may repeat up to 5 times per category** (the rotation lets them through). An X vs Y image never features only one brand ("FAIRNESS CHECK FAILED").
- These layouts paint their own canvas; `bg` is ignored. Headlines follow the heading rule (10). Every word stays inside x 210–1390, except `dark`: its text column starts at x 120 for balance with the panel, and its 7:5 crop shifts left to match.

---

## 4. Fixed ingredients (they make every image one family)

| Ingredient | Spec |
|---|---|
| Canvas | 1600×900 master. All key content inside **x 210–1390** so the 7:5, 2:1 and 16:9 crops keep it |
| Type | **Inter** (Poppins only for the `versus/slash` names; JetBrains Mono only in the opt-in craft kit). Headlines weight 600–700, tracking −0.03em |
| Ink | Text `#141A26`; muted `#7F8794` / `#5D6675`; headlines navy `#0E2A5C`; left/"before" label warm grey `#7C7468`; right/"after" label blue `#2C5FAE` |
| Accent | Blue gradient `#3B86F0 → #0A5FD8` for the one anchor and active states; sky `#27ACF2` for carets and legend dots |
| States | **Blue = active/anchor:** checked boxes, progress bar, winning bar, highlighted row, selection box, current timeline dot. **Grey = inactive:** unchecked boxes, other bars, skeletons, empty dots |
| Cards | White, radius 20–30px, minimal tinted shadow (see 3c), real text from the article |
| Icons | Phosphor (free), one family |
| Logos | Real product logos via the logo chain (see 8) |
| Structure | Thin guide lines at x 210 / 1390 with a few tiny margin dots, **or** the faint frame grid with registration squares (stat, ranked, timeline, window). Never both |

---

## 5. Card layouts and their skeletons

Two layouts that share a skeleton (block arrangement) read as the same image at thumbnail size, so each owns a distinct one. **Layout = mode + variant**; background, colours, bleed and text don't make a new layout.

| Layout | Skeleton | Best for |
|---|---|---|
| before-after | small raw card → dashed connector → big clean card, legend below | how-to, migration |
| before-after/flow | muted icon card → hand-drawn arrow → lifted blue-icon card, legend | "old way → new way" |
| versus/overlap | two tilted, overlapping cards (−3° / +3°) with a VS badge on the seam | X vs Y |
| versus/table | one comparison table card, VS badge where the header line crosses the column line | X vs Y with 2–3 dimensions |
| hub | blue centre tile with 6–7 **logo tiles (logos only)** and hand-drawn arrows | "best X" lists, integrations |
| focus | centred headline with the key phrase in a blue selection box; UI card with skeleton rows bleeding off the bottom | one key idea with 2–3 values |
| stat | giant number left, breakdown card right | one headline number |
| ranked | headline top-left, bar list in a card | rankings by a real metric |
| timeline | headline top-left, horizontal track with step dots, a callout | process, "how long" |
| checklist | one tilted checklist card with a progress bar | how to choose, requirements |
| prompt | faded panel bleeding off the top, centred headline, pill input bar | cost, FAQ, "what is" |
| stack | a takeaway card sized to its text, two cards peeking from the top | one key rule or warning |
| window | full app window: list pane + detail pane | vendor lists, pricing tables |

- The same article type can use several layouts (cost: focus, stat, prompt, window, ranked; how-to: before-after, timeline, stack, checklist). Use that range to avoid repeats.
- **When adding a layout:** squint at its 350×250 card next to every other layout. If two share a skeleton, redesign one. When a category's least-used tier already has one use each, add a new variant before briefing Makers.

**VS badge:** a focal blue-gradient circle with a white "VS" and a white ring. On overlap cards it sits on the bottom of the seam; on the table it sits where the header line crosses the column line, with no glow. It never touches text.

---

## 6. Balance and anti-bland

Calm is good; bland is not.

1. **One bold anchor:** exactly one high-contrast element (selection box, VS badge, blue tile, big blue number, highlighted row). Never two, never none.
2. **One hero at 55–70% of the width**, everything else secondary. The hero's mass sits at or slightly above the canvas centre.
3. **Structure tied to the frame:** the guide lines, the frame grid (stat, ranked, timeline, window by default; `"frame": false` turns it off), an edge-to-edge band, or a card bleeding off an edge. Nothing just floats.
4. **Bleed for big UI:** windows and panels may run off the bottom or right edge (`"bleed": true`), but every word stays inside x 210–1390. A bleeding card is cut just after its content.
5. **Hard alignment:** connectors hit centres, selection handles sit on the corners, gaps are even.
6. **At most one interaction cue:** a cursor (`"cursor": [x, y]`) pointing at the key fact, never covering text.
7. **Scale contrast:** one very large element against small labels.
8. **Enough content:** each layout needs enough real facts to fill its frame (window 2+ rows, hub 6+ products, ranked/checklist/timeline 3+, stat card 2+). The renderer refuses thinner specs ("CONTENT CHECK FAILED").

---

## 7. Minimal rule and text budget

- **Hard cap: 15 visible words per image, max 7 per text element, no sentences.** The renderer refuses more ("TEXT CHECK FAILED") and prints `words=N/15`. Logos and the site mark don't count.
- **One idea, carried by the fewest facts that prove it:** usually 3–4 rows or 2–3 bullets. Never show a fact twice.
- **Whitespace is good.** Never add bars, rows, bullets, badges or text to fill a gap.
- **Secondary lines only when they are the story:** a price belongs on a pricing image, not on a "best of" list.
- **Write labels, not prose:** "ERP on the vendor's servers", not a sentence.
- Cut in this order: secondary lines → sentence tails → extra bullets → subtitles.
- UI mockups (window, prompt panel) keep UI-sized text so they look like a real app, not a slide.

---

## 8. Logos

- **Where:** wherever a real product is named: hub tiles, versus sides and table headers, window rows, ranked rows, stat rows. Never decorative.
- **How:** set `"logo": "<official domain>"`. The renderer's free chain finds it at render time (nothing stored): Brandfetch symbol → Iconify `logos` → Simple Icons → Brandfetch icon (used as an app tile) → lettermark. Without a Brandfetch client ID, the Brandfetch steps are skipped.
- **Brandfetch client ID:** free at brandfetch.com/developers. Keep it **local** (`~/.blog-featured-images/config.json` or `BRANDFETCH_CLIENT_ID`); never commit it.
- **Style:** original colours (`"logoStyle": "color"`, the default) in white tiles; one style per image. `mono` and `tint` exist for when colour logos would compete with the anchor.
- **Balance:** see 2. Pale grey marks are darkened automatically so they read.
- **Right mark:** check each logo is the brand's real current mark (not an anniversary or campaign badge). If the chain finds the wrong one, save the official mark from the brand's own website (its site icon or logo) to `featured-images/assets/` and use `"logo": "../assets/<file>.png"`; the renderer embeds it.

---

## 9. Variety enforcement

1. **One site-wide history per brand** at `~/.blog-featured-images/history-<brand>.json` records every render, wherever its output folder is.
2. **Strict rotation:** in a category, only the least-used layouts are allowed ("VARIETY CHECK FAILED" lists them).
3. **Same topic** (e.g. duplicate URLs `…-guide` and `…-guide-2`): never the same mode, and different facts or angles.
4. Never `--force` unless the user explicitly asks, and never render into another folder to dodge a check.
5. **Delivered images are permanent.** After delivery, `scripts/finalize.mjs` marks them final in the site history and the folder ledger (`featured-images/.featured-ledger.json`) and copies them to `~/.blog-featured-images/delivered/<brand>/<slug>/`. Their files stay in `featured-images/<slug>/` (in the project, never a scratch folder), they keep counting for rotation forever, and the renderer refuses to re-create or overwrite them ("FINAL IMAGE LOCKED"). A new article always gets its own slug and folder.

---

## 10. Heading rule: mirror the blog title

The heading uses **the blog title's own words and meaning, just shorter**. No creative rewording.

1. Keep the subject (EMR, ERP, Dynamics 365) and the angle (cost, switch, best, vs, by practice size).
2. Drop the year, filler, "How to", "Complete guide" and brackets.
3. Keep at least 75% of the heading's key words from the title.

| Blog title | Good | Bad |
|---|---|---|
| EMR Software Cost 2026: Pricing by Practice Size | EMR Cost by Practice Size | What EMR really costs |
| How to Switch EMR Vendors Without Losing Patient Data | Switch EMR Vendors Without Losing Data | Every chart makes the move |
| 7 Best ERP Software for Small Businesses in 2026 | 7 Best ERP | Seven ERPs. One right fit. |

Every spec carries `"articleTitle"`; the renderer refuses drifting headings ("HEADING CHECK FAILED"). Layouts without a headline (before-after, most versus variants, hub) use the title's key terms in their labels (e.g. the hub tile "7 Best ERP").

---

## 11. Typography balance

| Role | Size (on the 1600×900 master) |
|---|---|
| Headline | 56–76px in card layouts (up to ~110px in headline layouts), never wider than its panel; auto-sizes down, never up |
| Hero number (stat) | up to 210px |
| Section labels | about 50px / 500, muted |
| Card headings | 32–36px |
| Primary rows / bullets | 32–36px outside app mockups |
| Small labels, chips | 18–28px, still readable at 350×250 or cut |

- One dominant text element per image; headline-to-body ratio about 1.6–2.2:1.
- Even vertical gaps of at least 40px between blocks; faded rows never below about 45% opacity.

---

## 12. Site mark (optional, some images only)

`"craft": true` + `"series": "Pricing"` adds the site's mark and a mono series tag (`PRICING`, `COMPARISON`, `GUIDE`). Use it only in a natural empty slot (above a centred headline, under a centred group), on **at most 1 in 3 images per category, never on neighbours** ("SERIES CHECK FAILED"). It doesn't count toward the word budget. The craft kit also switches labels to mono caps and ink to near-black; it is opt-in.

---

## 13. Guardrails

- **Colour:** one accent family (blue); never a blue-heavy illustration on a blue field; black only in `dark` and `versus/slash`.
- **Logos:** never a tiny logo in a big tile, an app icon shrunk inside a white tile, or invented or warped logos.
- **Layouts:** never two layouts with the same skeleton; never anything added to fill space; a white design always has the grey frame.
- **Details:** no heavy shadows, small grey VS chips, badges straddling a card edge, AI-looking 3D or art, stock photos or neon.

## 14. Inspiration

Granola (one colour family, white UI on a bold field, logos-only integrations), Base44 (big UI, grid with corner squares), Mintlify (skeleton rows, selection-box highlight), grainient.supply (grainy deep gradients), Chatbase (comparison layouts, the subtle vivid blue, black + brand colour, framed white panels). Borrow their principles, never their ornaments: variety comes from layout, never from palette or type.
