# Featured Image Design Language

You are judging and making images that will sit side by side in a blog grid for years. Every rule below exists because a real image broke it and the user noticed. **This file is the rulebook.** Three families and the originals share it: the **card layouts** (sections 3–5), the **headline layouts** (section 3d), and the **Gumloop layouts** and **originals** (section 3e): 24 modes / 40 layouts, listed in `scripts/layouts.mjs`. The images in `references/approved/` show the target, and their specs are in `examples/` (`references/approved/sources.json` maps each image to its spec).

**Our design language is the approved templates.** A new layout is a new arrangement of approved parts (white cards, rows, tracks, checklists, logo tiles, the selection box, the blue tile, big tight Inter type, our fields), never a prop, a device or a material. In batch 5 all 12 props and device mockups were rejected: "not a single image that you have created matches our design language… why are you using mobile mockups" (`taste.md` 17).

---

## 1. The Non-Negotiables

1. **Relatable to the article.** Read the whole article first. Show its core idea with its **own facts** (numbers, names, steps, comparisons) in its own wording. Never invent a figure, an abbreviation or a generic stock concept. Every number on the image appears in the article, **with its qualifier** ("per provider", "up to", "from", "minimum"). Figures shown together never contradict each other (a breakdown sits inside the headline range).
2. **Understood in 2 seconds** at 350×250 (blog-card size). One idea, one focal point, short real words. Prefer a visual (icon, logo, number, arrow, bars) over a text-only card.
3. **Different every time.** The reader sees every image together. A layout not used yet anywhere is free for any article it suits and goes first in line; a used layout can't be used again in the same category, only in a different one. The user: "the ones that hasnt used yet can be used now if suitable for any article and the ones that have used cant be used again unless the category is different", and again on Oct 15: "the ones that are used shouldn't be used again unless the category is different. The ones that aren't used can easily be used again because they aren't used right now, obviously". Favourites also have a site-wide cap: `versus/pills` 2, `versus/slash`, `versus/connect` and `versus/duo` 5, `dark` 3, `logotype` 2. Articles on the same topic never share a mode, a batch prefers fresh designs over reuse, and an approval is for its own article (see 9).
4. **Minimal.** At most 15 words, labels not sentences (see 7).
5. **Visually appealing.** An image that follows every other rule but doesn't look good **fails** (see 2).

---

## 2. Visual Appeal Is a Hard Gate

Passing every check is not enough. Judge every image like a design director, ideally with a taste skill (impeccable / ui-ux-pro-max) in mind, at full size and at 350×250:

1. **Blue dosage.** A big blue mass in the illustration (the hub's blue tile, a giant blue number) needs a **neutral** field (`cream`, `paper`), never `g5` or the vibrant blue. A grey-heavy illustration needs some colour behind it (`sky`).
2. **Logo balance.** A logo fills **about 60–70% of its tile** (the big frosted-glass tiles of `versus/frost`: 48%, since 60% looked too big there). A full-bleed app icon (e.g. NetSuite's dark square) **becomes the tile itself**. Wide wordmarks (SAP, Sage) fill about 65–75% of the tile's width. A wide, thin mark (NextGen's wave, Klara's wordmark) gets a bigger box with a per-card `"scale"` (`lineup`, `hub`, `versus/center`), so it carries the same weight as its neighbours: judge the weight by eye, not by fill percentage.
3. **Logos speak for themselves.** When products have recognisable logos, show **logos only**, not logo + name cards. The hub does this by default.
4. **Figure/ground.** The hero separates cleanly from the field: no grey on grey, no white on near-white without a soft shadow.
5. **Balance.** Even tile sizes, gaps and arrow lengths; the group sits on the optical centre; nothing looks too small or too big next to its neighbours (a stat number never outweighs its card).
6. **Hierarchy.** The key figure leads and the names that label it sit a step below, never as big or as bold (TheraNest vs Valant: "too bold and big, visual hierrachy is not good and balanced"; `taste.md` 1).
7. **Every element earns its place.** Remove decoration that only fills: check boxes on a pair ("checkboxes are not needed"), a container around bars on the white field ("dont add container for bars section"), corner dot patches ("delete these dot grid from top left and top right"). `taste.md` 10.
8. **Taste.** Every principle behind the user's notes, and the Self-Critique every image passes, are in `references/taste.md`.

---

## 3. Backgrounds Flatter the Illustration

The field is never decoration: it exists to lift the hero off the page.

| Kind | `bg` | Look |
|---|---|---|
| Light | `sky` | light sky, top to bottom, thin guide lines |
| Light | `paper` | cool off-white `#F1F3F6` |
| Light | `cream` | warm off-white `#F6F2EA`, warm guide lines, no grain |
| Light | `g5` | near-white at the top glowing into bright sky under the hero |
| Light, picked only | `soft` | calm light-blue diagonal gradient with fine grain (prompt's `"field": "soft"`) |
| Light, picked only | `white` | white rounded panel inset 28px in the light-grey `#F2F2F3` frame, sparse faint dots |
| Light, picked only | `glow` | `lineup`'s field: light-blue diagonal with a blue glow bottom right |
| Light, picked only | `mesh` | the light blurred blue mesh behind `versus/frost` and light `versus/glass` |
| **Vibrant** | `blue` | **"Deep dunes":** bright blue `#3D80F2` at the top melting into deep royal `#1638B0` / `#0A1E70` in soft rolling bands |

- **Grain:** heavy on the vibrant blue, fine on `sky`, `paper`, `g5` and `soft`, none on `cream`. It sits on the field only, so cards stay crisp. `"grain": false` turns off both grain layers (the field grain and the fine overlay) on a light field; the vibrant blue always keeps its grain.
- **Vibrant images** (the deep-dunes blue, the black headline layouts, and the Gumloop black and blue fields) appear on at most 1 in 3 images per category, never on neighbours ("VIBRANT CHECK FAILED").
- Only these nine fields exist ("BACKGROUND CHECK FAILED" for any other name). No layout lists `soft`, `white`, `glow` or `mesh` in its fit list: they come only from the user's pick (3f).

### 3a. Background fit: every layout has its own list
Each layout lists only the backgrounds that suit its illustration, best first. Neighbours alternate within that list. A `bg` outside it is refused ("BACKGROUND FIT FAILED").

| Layout | Fits (best first) | Why |
|---|---|---|
| checklist | blue only | a single white card on the vibrant blue; the light field was deleted in the approved review, so the renderer sets `"bg": "blue"` itself and refuses any other ("CHECKLIST FIELD FAILED") |
| stack | g5, cream | a single floating white card |
| before-after | g5, sky | white cards with a lifted "after" card |
| ranked | sky, g5 | grey bars need colour behind them |
| focus | sky, g5 | skeleton rows need colour behind them |
| window | sky, g5 | a big white app window |
| versus | sky, cream | a table or tilted cards |
| hub | cream, paper | a big blue tile needs a neutral field |
| timeline | cream, sky | a thin track and callout on a calm warm field |
| stat | paper, cream | the giant number brings the colour (a soft blue gradient by default; `"valueColor": "black"` or `"blue"` to change it) |
| prompt | its own (`bg` is refused: "BACKGROUND CHECK FAILED") | paints its own light-blue field with a strong blue glow at the bottom (`"field": "soft"` for a softer gradient) |
| versus/checks, spotlight, picks, ranges | sky, g5 | a white card with grey rows or tracks; the cool checklist card never goes on cream |
| versus/lanes | cream, sky | lanes on a white card, like the timeline |
| versus/scores | sky, paper | big type and a gradient score with no card |
| versus/center | cream, paper | a big blue tile needs a neutral field |
| cloud | g5, sky | white pills rising off the field |
| count | paper, sky | the giant gradient number brings the colour |

- Fit lists can be per layout (`BG_FIT['versus/checks']`); a layout without its own list uses its mode's.
- Cool greys never sit on cream; on cream the guide lines turn warm and the blue margin dots are hidden (automatic).
- Always check at 350×250 next to the neighbours: the hero separates cleanly, and the field never fights the illustration's colours.

### 3b. Only a big white card goes on the deep-dunes blue

| On blue? | Layouts |
|---|---|
| **Yes** | `checklist` (blue only; it always counts as vibrant), `versus/table`, `window`, `before-after/flow` |
| **No** | every other card layout (blue-heavy illustrations become one flat blob; floating tiles look weak) |

This is the `"bg": "blue"` card field. The Gumloop `versus/tiles` is separate: it paints its own approved blue field (its default, approved image 20).

The renderer refuses the rest ("VIBRANT FIT FAILED"), unless it is the user's own pick (3f). On blue, text on the field turns white, and the frame grid, margin dots and all drop shadows are off.

### 3c. Shadows follow the background, never the mood
- **Vibrant blue and black fields: no drop shadows.** Cards, tiles, icons and the cursor sit flat on the field.
- **Light backgrounds: minimal shadows, tinted to the field:** cool on `sky`/`g5`, warm on `cream`, neutral on `paper`. Short and soft (opacity at most 8%), just enough to lift the card.
- 1px edge lines are card edges, not shadows; they stay on light fields.
- The renderer applies this to every layout. Never hand-add heavy shadows.

---

## 3d. Headline Layouts: Copy the Reference Exactly
Each of these came from a reference the user shared; every detail below is measured, not approximated. Bold names or a big, tight headline carry the image, with colour in a few clean shapes. Four are for X vs Y and two for single-product articles. **None shows the site mark.**

| Layout | What you see | Best for |
|---|---|---|
| `versus/pills` | grey frame, two white panels: on top, two blue pills face each other: each runs off the panel's outer edge (a flat cut, no rounded outer end), the rounded tips sit 112px apart (57% of the 196px pill height, as in the reference), and the surface is a subtle tonal gradient toward the tip with one soft highlight and fine noise (no watercolour blotches); the two logos sit on **white circles** centred in the tips (never a solid app icon); below, the question ("A or B?") all in black `#0A0A0B`, no blue words | X vs Y, only when both products have a logo that sits on white ("PILLS LOGO CHECK FAILED" otherwise); once per category, at most 2 across the site |
| `versus/connect` | grey frame, one white panel: a centred headline all in black `#0A0A0B` (no blue words) on **one line**, centred above the divider (two lines only when the pair is too long to read on one: "2 lines look visually off") and a small sparkle divider; two big tiles, each the brand's **own app icon in its original colours, edge to edge with its own background colour** (never a mark on a white tile), linked by thin crossing strands to a white **VS** circle; small dot patches in the top corners (`"cornerDots": false` drops them: "delete these dot grid from top left and top right") | X vs Y, only when both brands have a solid app icon with its own background colour ("CONNECT LOGO CHECK FAILED" otherwise); once per category, at most 5 across the site |
| `versus/slash` | black field with a fine dot grid; the two names in heavy caps, every name is two-tone, **white + that brand's colour** (never all one colour): the first part white, the last part coloured ("CHAT**GPT**", "ADVANCED**MD**", "AI / **CHATBOT**"), at their approved auto-fit size (never enlarged); a big italic **VS** with a glowing diagonal streak | X vs Y (vibrant); once per category, at most 5 across the site |
| `versus/duo` | black field, a tag pill and a big Medium (500) white headline top-left (no site mark); two watercolour panels below, each in **that brand's own colour** (the subtle blue when the brand has no vivid colour) with the brand's mark turned white and its name. A low-resolution wordmark is replaced by the name in clean white type | X vs Y (vibrant); once per category, at most 5 across the site |
| `dark` | black field, the **product's own icon on a white rounded tile** top-left (never the site mark), always recoloured to the field's black **#0A0A0B**, a tag pill and a big Medium (500) white name; a watercolour panel in the **product's own colour** with its mark turned white and its name below | **single-product articles** (review, pricing, features, "is X worth it"); once per category, at most 3 across the site (vibrant). Never an X vs Y article |
| `logotype` | the product's **black** logo, large and centred on the cream field with a faint square grid: its icon in white on a **black rounded tile** (slightly taller than the wordmark) beside the black wordmark; an icon that is already a filled tile keeps its own. No other text: the logo's typography is the image | single-product articles whose logo is black with strong typography; once per category, at most 2 across the site. The renderer checks the logo is black ("LOGOTYPE CHECK FAILED") |

- **Type:** one weight, Inter **500 Medium**, for every text element (headline, VS, tag pill, panel names) in `versus/pills`, `versus/connect`, `versus/duo` and `dark`; headlines tracked −0.035em. Only `versus/slash` keeps its heavy Poppins caps.
- **Colour:** shapes are a near-solid vivid blue (`#0A6EF5 → #1D8BFF`) with only a faint tonal drift and fine grain. **Headlines carry no blue words:** black `#0A0A0B` on the white layouts (pills, connect), white on the black ones (duo, dark); `{{ }}` only colours part of each name in `versus/slash`.
- **White frame:** a white design always sits in a **white rounded panel inset 28px on a light-grey `#F2F2F3` frame**, so it reads as its own block on a white blog page (automatic).
- **Black fields** (`dark`, `versus/slash`, `versus/duo`, and the Gumloop black and blue fields: `versus/glass` black, `versus/tiles` blue) count as vibrant (see 3).
- **Brand colour:** when a product's logo colour is vivid and modern (e.g. Sage green), `dark` and `duo` use it for the panel (`"color": "#00C247"`); otherwise the panel is the subtle blue.
- **Single-product articles:** `logotype` when the product's logo is black with strong typography (at most 2 across the site), otherwise `dark` (at most 3 across the site); each once per category. X vs Y articles use a versus layout.
- **Sixteen ways to show X vs Y**, all showing both products: `versus/overlap`, `table`, `pills`, `connect`, `slash`, `duo`, `type`, `tiles`, `glass`, `frost`, `bento`, `badges`, `checks`, `lanes`, `scores`, `center` (and `prompt` with two logo rows, image 48, for a pair on price). **Each is used once per category; `slash`, `connect` and `duo` are favourites with a site-wide cap of 5, `pills` 2** (the user: "max 2 times"). An X vs Y image never features only one brand ("FAIRNESS CHECK FAILED").
- These layouts paint their own canvas: leave `bg` out (it is refused, "BACKGROUND CHECK FAILED"); `logotype` takes only `cream`, its default, and any other light `bg` is refused with "BACKGROUND FIT FAILED" (`blue`: "VIBRANT FIT FAILED"; a picked blue: "BACKGROUND PICK FAILED"). Headlines follow the heading rule (10). Every word stays inside x 210–1390, except `dark` (its text column starts at x 120 for balance with the panel, and its 7:5 crop shifts left to match) and `versus/duo` (its headline starts at x 96 and its panels run nearly edge to edge, so its 7:5 is the whole master padded top and bottom with its own black).

## 3e. Gumloop Layouts and the Originals

Two more sets came from the user's references and reviews (Oct 2026). Their tables are in `SKILL.md` and their specs in `spec-format.md`; the rules that keep them right:

- **Gumloop** (`versus/type`, `versus/tiles`, `versus/glass`, `swap`, `badge`): each takes only its approved `"field"` ("FIELD FIT FAILED" otherwise); the black and blue fields count as vibrant. They keep the references' composition and type scale in our family: Inter 700 for names, our blue accent, the grey frame on white. `versus/glass`, `swap` and `badge` show each brand's full wordmark; `versus/tiles` shows its app icons (or marks on white); `versus/type` shows the names only. The "vs" sits vertically centred between the names. Patterns: the sparse, faint full-canvas "+" grid (`versus/type`, `swap`) and dot field (`versus/tiles`, `badge`) on the light Gumloop fields, and the dots on the `versus/tiles` blue field, are approved as they are (images 18, 20, 22, 25, 27; the review said the "+" grid is fine as is). A pattern is never dense or dark and never competes with the content (the user rejected busy dot grids: "pattern is too much"); the tiles ring stays faint. Edge-only patterns, masked clear behind the content (`GL_EDGE_MASK`), go on `shortlist` and `lineup`, and any pattern on a dark field is edge-only too (`versus/slash` masks its dot grid clear behind the names; a full-canvas "+" grid on black was rejected). `versus/bento` has no pattern ("delete pattern from bg"). Fields: type light; tiles blue, light; glass light, black; swap light; badge light. Never `versus/type` on black or blue, `versus/tiles` on black, `swap` on black, `badge` on blue or `versus/glass` on blue (type on blue, tiles on black and swap on black were deleted in the approved review). `versus/tiles`: both tiles filled or both white, never one of each ("TILES LOGO CHECK FAILED"); `versus/glass` needs wordmarks that fit the bar ("GLASS LOGO CHECK FAILED"). `brandline` is retired (a background with only a headline); its glow field now carries `lineup`.
- **Originals** (`receipt`, `definition`; light only): `receipt` sits on its own warm cream dotted field (no frame) for cost articles, its headline black `#0A0A0B` (the user's request), every row inside the bold blue total's range; `definition` (white in the grey frame) for "what is X" articles, a one-line definition (≤ 7 words) in the article's own words.
- **Originals from batch 4** (all approved): `shortlist` (a tilted notepad of the article's picks, black headline on the right; "wow love it"), `lineup` (one centred row of 3–7 white logo tiles on a frosted glass bar over the glow field; no headline, no watermark; 7 since Pediatric EHR: "for this use this glass version template"), `versus/frost` (two frosted-glass logo tiles on the light mesh, each mark filling 48% of its tile, a glass "vs" disc; the blue mesh was disapproved), `versus/bento` (a light bento grid with a name, icon and fact cell per brand, no pattern; for pairs whose logos can't match).
- **Batch-5 layouts** (Oct 19–20 2026, ten live; images 36, 37, 39–46). Each is a new arrangement of an approved template, named in brackets:
  - `versus/badges` (badge): two columns, each the name or wordmark, its figure in a blue-tinted value box and a grey note under it; a light "vs" between. White in the grey frame with sparse dots (a canvas layout: no `field`). The figures lead: in image 36 the names are 44px at 600 and the prices up to 84px, the sides spread apart ("the heading of theranest and valant are too bold and big, visual hierrachy is not good and balanced").
  - `versus/checks` (checklist): one tilted white checklist card titled like the article, one row per product (logo tile, name, sub). The user picked the vibrant blue for it, without the check boxes and with bigger logo tiles (image 37: "checkboxes are not needed"; a checked row is for lists, not pairs).
  - `versus/lanes` (timeline): a centred headline and unit, a white card, one lane per product with its blue price stops (and the span between them) on one shared scale. It replaced `versus/range`.
  - `versus/scores` (versus/type): a small grey metric title, then two rows: logo tile, big black name, a very large blue-gradient score. No card, no chart. Both scores are real numbers (a word against a number got "ew revert it"; the renderer refuses it). The user loves the design and marked it not used.
  - `versus/center` (hub): two tilted logo tiles with names, hand-drawn arrows into one central blue tile carrying the article's angle (its own word, never a stock icon standing for it).
  - `spotlight` (focus): the headline with its angle in the blue selection box, a white card of logo rows bleeding off the bottom ("perfect concept and design": the model to repeat, `taste.md` 20).
  - `picks` (checklist): a tilted checklist card of the article's picks, names only. Siblings with `versus/checks`: never in one category.
  - `cloud` (prompt chips, lineup tiles): a headline over staggered white logo pills.
  - `count` (stat): the number of picks big in the blue gradient with the caption under it, a white card of logo rows.
  - `ranges` (ranked bars, turned upright): a headline and unit, a white card of vertical price tracks, one per pick (a bar for a range, a dot for one price, a fading bar with no solid end for an open "From" price), the logo tile under each. On the user's white field it may drop the card (`"bare": true`, tracks a step darker; image 46: "use the previous bg, and in that dont add container for bars section").
- **Prompt with two logo rows** (image 48, RXNT vs DrFirst): a panel of two rows or fewer grows on its own (104px tiles, 70px logos, 40px titles), and `"panel": { "even": true }` keeps both rows at full strength (no fade) when the products are equals.
- **Retired** (30; not in `layouts.mjs`, refused with "RETIRED LAYOUT", their code deleted from `render.mjs`): `brandline` (a background with only a headline), `folder` ("not the layout"), `versus/scale` ("looks like a law illustration": no clip-art metaphors), `versus/chat` (not picked), `versus/split` and `versus/duet` (the user passed on both twice), `versus/rows` (rejected), `versus/logos` (disliked); the batch-5 props, all rejected ("not a single image that you have created matches our design language"): `versus/compare`, `versus/search`, `versus/polaroid`, `versus/notes`, `versus/phones`, `versus/browser`, `notify`, `wallet`, `stickers`, `letterboard`, `tags`, `keycaps`; `versus/window` (disapproved); `versus/range` ("i like the design but it is confusing"; `versus/lanes` replaced it); `versus/rings` and `versus/share` (disapproved); `versus/sheet` and `versus/columns` (options never approved); from the final batch-5 round: `versus/plans` ("i dont like the design, try smth else for comparison"; approved earlier with "design can be improved"), `versus/fit` (disapproved), `versus/spot` (QA: Appointment's spotlight under a new name), `grid` ("7 best pediatric shouldnt be like other logos, this looks off"; both fixes disapproved, then "for this use this glass version template": Pediatric EHR went to `lineup`). History: `lessons.md`.

## 3f. The user picks each image's background
The user: "we have so many background why are you fixated on just one. show me 12 images and options for backgrounds and i'll selevt the bg for each". The fit lists kept nearly every image on sky or g5, so the fit list is now only the starting point.

- After the batch renders, show every image on every field it can take (picker page) and let the user pick. The pick goes in the spec: `"bg": "<field>", "bgPick": true`.
- A pick skips the fit list (BG_FIT), the blue fit (BLUE_FIT) and the canvas refusal; it never skips the vibrant check (a picked blue still counts: 1 in 3 per category, never neighbours). The history records the picked field, so the next image's neighbour check sees it.
- Card layouts take any light field. A layout that paints its own canvas takes a pick only where its canvas can step aside (`versus/badges`, `versus/type`, `versus/tiles`, `versus/bento`, `swap`, `badge`, `shortlist`): light fields only, and blue only on `versus/tiles`. The rest (`versus/pills`, `versus/connect`, `versus/slash`, `versus/duo`, `dark`, `versus/glass`, `versus/frost`, `receipt`, `definition`, `lineup`, `prompt`) refuse it ("BACKGROUND PICK FAILED").
- The vibrant blue only where every word sits inside a white card (the user picked it for `versus/checks`, image 37): the renderer refuses a picked blue on any other layout (`BLUE_PICK`: `checklist`, `versus/table`, `window`, `before-after/flow`, `versus/checks`, `picks`, `stack`, and `versus/tiles` on its own blue field).
- **Variety in backgrounds too.** In batch 5 the user picked seven different fields for 12 images (glow 4, mesh 2, soft 2, blue, cream, paper, white; after the final round the two soft picks became RXNT's `prompt` on its own soft field and Pediatric EHR's `lineup` on its own glow canvas). Never let a batch drift onto one field.
- **`ranges` "bare" is white only.** `"bare": true` (no card behind the bars, tracks `#E1E5EC`) renders only with `"bg": "white", "bgPick": true`; on any tinted field the light grey tracks need their white card ("BACKGROUND CHECK FAILED").

---

## 4. Fixed Ingredients Make One Family

| Ingredient | Spec |
|---|---|
| Canvas | 1600×900 master. All key content inside **x 210–1390** so the 7:5, 2:1 and 16:9 crops keep it |
| Type | **Inter** (Poppins only for the `versus/slash` names; JetBrains Mono only for small mono captions: the receipt title, the definition's full form and its "1.", the shortlist numbers and title, the bento tag, and in the opt-in craft kit). Card-layout headlines are all semibold 600, tracking −0.03em; every card headline is black `#0A0A0B` (the user asked four times: "black, not blue"); the focus key phrase stays white on its blue box. **Headline layouts (`versus/pills`, `versus/connect`, `versus/duo`, `dark`): every text element is Inter 500 Medium** (headline, VS, tag pill, panel names), headlines tracked −0.035em |
| Ink | Text `#141A26`; muted `#7F8794` / `#5D6675`; headlines black `#0A0A0B`, hard-coded (a brand file's `headline` is ignored unless it is `#0A0A0B`); left/"before" label warm grey `#7C7468`; right/"after" label blue `#2C5FAE` |
| Accent | Blue gradient `#3B86F0 → #0A5FD8` for the one anchor and active states; sky `#27ACF2` for carets and legend dots |
| States | **Blue = active/anchor:** checked boxes, progress bar, winning bar, highlighted row, selection box, current timeline dot. **Grey = inactive:** unchecked boxes, other bars, skeletons, empty dots |
| Cards | White, radius 20–30px, minimal tinted shadow (see 3c), real text from the article |
| Icons | Phosphor (free), one family |
| Logos | Real product logos via the logo chain (see 8) |
| Structure | Thin guide lines at x 210 / 1390 with a few tiny margin dots, **or** the faint frame grid with registration squares (stat, timeline, window; ranked gets the guide lines). Never both |

---

## 5. Every Card Layout Owns Its Skeleton

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
| versus/checks | one tilted checklist card: title, blue rule, a row per product (logo tile, name, sub), checked or (`"checks": false`) not | X vs Y, each product's strength |
| versus/lanes | centred headline + unit, a white card with one lane per product: blue price stops on a shared scale | X vs Y with several price points |
| versus/scores | small metric title, two rows: logo tile, big name, very large gradient score; no card | X vs Y with one published score |
| versus/center | two tilted logo tiles, hand-drawn arrows into one central blue tile with the angle | X vs Y for one specialty or audience |
| spotlight | centred headline with the angle in the selection box; a card of logo rows bleeding off the bottom | "best X" lists |
| picks | one tilted checklist card of the picks, names only | "best X" lists without clean logos |
| cloud | centred headline over staggered white logo pills | "best X" lists |
| count | giant gradient number + caption left, a card of logo rows right | "N best" lists |
| ranges | headline + unit, a card of vertical price tracks with a logo tile under each (no card when `bare` on white) | "best X" lists with prices |

- The same article type can use several layouts (cost: focus, stat, prompt, window, ranked; how-to: before-after, timeline, stack, checklist; best-of lists: hub, spotlight, picks, cloud, count, ranges, shortlist, lineup). Use that range so no layout comes back in the same category.
- **When adding a layout:** build it only from approved parts (see the top of this file), never a prop, a device or a material. Squint at its 350×250 card next to every other layout. If two share a skeleton, redesign one. Built from an approved template, it changes the skeleton, not only the styling (horizontal price rows were the `ranked` skeleton again; a split card with "vs" on the seam is the `versus/table` skeleton). Siblings from one approved part (`picks` and `versus/checks` are both checklist cards) never share a category. When no free layout fits an article (none not used yet, none used only in other categories), design a new variant (shown to the user first).
- **Clear in one glance.** A chart must read without study: `versus/range` was liked and still retired ("i like the design but it is confusing"). Light grey tracks sit on a white card (the one exception: `ranges` `"bare": true` on the user's white field, tracks a step darker); a callout line touches what it names; an open "From" price fades out with no solid end, because every bar end reads as a figure.

**VS badge:** a focal blue-gradient circle with a white "VS" and a white ring. On overlap cards it sits on the bottom of the seam; on the table it sits where the header line crosses the column line, with no glow. It never touches text.

---

## 6. Calm Is Good; Bland Is Not

A calm image still needs one thing that grabs the eye and a structure that holds it.

1. **One bold anchor:** exactly one high-contrast element (selection box, VS badge, blue tile, big blue number, highlighted row). Never two, never none.
2. **One hero at 55–70% of the width**, everything else secondary. The hero's mass sits at or slightly above the canvas centre.
3. **Structure tied to the frame:** the guide lines, the frame grid (stat, timeline, window by default; `"frame": false` turns it off), an edge-to-edge band, or a card bleeding off an edge. Nothing just floats.
4. **Bleed for big UI:** windows and panels may run off the bottom or right edge (`"bleed": true`), but every word stays inside x 210–1390. A bleeding card is cut just after its content.
5. **Hard alignment:** connectors hit centres, selection handles sit on the corners, gaps are even.
6. **At most one interaction cue:** a cursor (`"cursor": [x, y]`) pointing at the key fact, never covering text.
7. **Scale contrast:** one very large element against small labels.
8. **Enough content:** each layout needs enough real facts to fill its frame (window 2+ rows, hub 6–7 products, ranked, checklist and timeline 3+, stat card 2+, focus 2+ rows, shortlist 3+ items, lineup 3–7 logos, picks 3–7, spotlight and count 3–6, cloud 3–8 logos, ranges 3–6 rows plus `max`; versus/badges a `value` on both sides, versus/checks a `title`, versus/center a `label`, versus/lanes `max` and both sides' `points`, versus/scores a `title` and a real number on both sides, never a word). The renderer refuses thinner specs ("CONTENT CHECK FAILED").

---

## 7. Fifteen Words, Never More

- **Hard cap: 15 visible words per image, max 7 per text element, no sentences.** The renderer refuses more ("TEXT CHECK FAILED") and prints `words=N/15`. Logos and the site mark don't count.
- **One idea, carried by the fewest facts that prove it:** usually 3–4 rows or 2–3 bullets. Never show a fact twice.
- **Whitespace is good.** Never add bars, rows, bullets, badges or text to fill a gap.
- **Secondary lines only when they are the story:** a price belongs on a pricing image, not on a "best of" list.
- **Write labels, not prose:** "ERP on the vendor's servers", not a sentence.
- Cut in this order: secondary lines → sentence tails → extra bullets → subtitles.
- UI mockups (window, prompt panel) keep UI-sized text so they look like a real app, not a slide.

---

## 8. Logos Are the Brand's Real, Current Mark

- **Where:** wherever a real product is named: hub tiles, versus sides and table headers, window rows, ranked rows, stat rows, prompt rows and chips, and the logo rows and tiles of the batch-5 layouts. Never decorative.
- **How:** set `"logo": "<official domain>"`. The renderer's free chain finds it at render time (nothing stored): Brandfetch symbol → Iconify `logos` (the `-icon` version, then the full logo) → Simple Icons → Brandfetch icon (edge to edge as an app tile only when it really is a solid tile) → lettermark. Without a Brandfetch client ID, the Brandfetch steps are skipped and Google's favicon stands in for the icon step. A local file (`"../assets/<file>.png"`) or a full URL is used as is.
- **Brandfetch client ID:** free at brandfetch.com/developers. Keep it **local** (`~/.blog-featured-images/config.json` or `BRANDFETCH_CLIENT_ID`); never commit it.
- **Style:** original colours (`"logoStyle": "color"`, the default) in white tiles; one style per image. `mono` and `tint` exist for when colour logos would compete with the anchor.
- **Balance:** see 2. Pale grey marks are darkened automatically so they read.
- **Right mark:** check each logo is the brand's real current mark (not an anniversary or campaign badge). If the chain finds the wrong one, save the official mark from the brand's own website (its site icon or logo) to `featured-images/assets/` and use `"logo": "../assets/<file>.png"`; the renderer embeds it.

---

## 9. Variety Is Enforced, Not Hoped For

1. **One site-wide history per brand** at `~/.blog-featured-images/history-<brand>.json` records every render, wherever its output folder is.
2. **Once per category:** a layout not used yet anywhere is free for any article it suits and goes first in line; a used layout is free only in a different category ("VARIETY CHECK FAILED" lists the free ones, not-used-yet first). Usage comes from the user's own record, `references/used-layouts.json` (kept on the Template Usage page), and the site history: the user's record is the truth for every layout it lists, as of its `recordedAt` (or a layout's own `asOf`, which overrides it for that layout; a history image for a layout marked "Not used yet" never went live and doesn't count); every image rendered (drafts too), reserved or delivered after that cutoff that isn't superseded is added on top, and a layout it doesn't list falls back to the history. `scripts/usage.mjs` applies it. The record belongs to one brand (its `"brand"`: `medsoftwarehub`); category names are normalised ("Hospital & Lab Software" = `hospital-and-lab-software`), and a spec without `category` is refused ("CATEGORY MISSING"). Site-wide caps on top: `versus/pills` 2, `versus/slash`, `versus/connect` and `versus/duo` 5, `dark` 3, `logotype` 2. There is no repeat with a reason; only the user's own pick skips the rule: `--user-pick`, or a `slug=layout!` reservation in `plan.mjs`, which the renderer honours for that slug.
3. **Same topic** (e.g. duplicate URLs `…-guide` and `…-guide-2`): never the same mode, and different facts or angles.
4. Never `--force` unless the user explicitly asks, and never render into another folder to dodge a check.
5. **Fresh over reuse.** Images the user has already seen count as used, whatever the record says ("you created most of the designs that were already being used"): a batch gets new designs, never a refill of layouts the user knows (`taste.md` 14).
6. **Approval is per article.** A design approved in a direction check is approved for the article it was shown on; never roll it out across the rest of the batch (three badges side by side read as one template). Each other article gets its own design.
7. **Delivered images are permanent.** After delivery, `scripts/finalize.mjs` marks them final in the site history and the folder ledger (`featured-images/.featured-ledger.json`) and copies them to `~/.blog-featured-images/delivered/<brand>/<slug>/`. Their files stay in `featured-images/<slug>/` (in the project, never a scratch folder), they keep counting as used in their category forever, and the renderer refuses to re-create or overwrite them ("FINAL IMAGE LOCKED"). A new article always gets its own slug and folder.

---

## 10. The Heading Mirrors the Blog Title

The heading uses **the blog title's own words and meaning, just shorter**. No creative rewording.

1. Keep the subject (EMR, ERP, Dynamics 365) and the angle (cost, switch, best, vs, by practice size).
2. Drop the year, filler, "How to", "Complete guide" and brackets.
3. Keep at least 75% of the heading's key words from the title.

| Blog title | Good | Bad |
|---|---|---|
| EMR Software Cost 2026: Pricing by Practice Size | EMR Cost by Practice Size | What EMR really costs |
| How to Switch EMR Vendors Without Losing Patient Data | Switch EMR Vendors Without Losing Data | Every chart makes the move |
| 7 Best ERP Software for Small Businesses in 2026 | 7 Best ERP for Small Businesses | Seven ERPs. One right fit. |

Every spec carries `"articleTitle"`; the renderer refuses drifting headings ("HEADING CHECK FAILED"). It checks the heading wherever a layout has one, the batch-5 layouts included (`spotlight`, `cloud` and `ranges` headline, `picks` and `versus/checks` title, `count` caption, `versus/lanes` headline). A list heading keeps the title's angle ("Best Small Practice EMR", not "5 Best EMR"). Layouts without a headline (before-after, most versus variants, hub) use the title's key terms in their labels. A tile label is not a heading: the hub's blue tile may shorten to the count and category ("7 Best ERP" on approved image 02) when the tile can't fit the angle; a heading never does.

---

## 11. One Dominant Line of Type

| Role | Size (on the 1600×900 master) |
|---|---|
| Headline | 56–76px for the free-standing card headlines (`focus`, `ranked`, `timeline`, `prompt`); in-card titles keep their own sizes (`window` up to 42px, `checklist` 40px, `stack` 48px); `receipt` semibold, up to 84px; up to ~116px in headline layouts, never wider than its panel; auto-sizes down, never up |
| Names and terms (Gumloop, originals) | up to ~140–150px, Inter 700 (`versus/type` names 140, the definition term 150) |
| Badge figure | up to ~168px, in its tinted box |
| Hero number (stat) | up to 150px (the card grew to match; never outweighs it) |
| Count number, scores | `count` 250px beside its logo card, `versus/scores` 120px with no card; both in the blue gradient |
| Names over figures | a name labelling a figure sits a step below it (`versus/badges` image 36: names 44px / 600, prices up to 84px); never as big or bold as the figure (`taste.md` 1) |
| Section labels | about 50px / 500, muted |
| Card headings | 32–36px |
| Primary rows / bullets | 32–36px outside app mockups |
| Small labels, chips | 18–28px, still readable at 350×250 or cut |

- One dominant text element per image; headline-to-body ratio about 1.6–2.2:1.
- Even vertical gaps of at least 40px between blocks; faded rows never below about 45% opacity.

---

## 12. The Site Mark Is Rare

`"craft": true` + `"series": "Pricing"` adds the site's mark and a mono series tag (`PRICING`, `COMPARISON`, `GUIDE`). Use it only in a natural empty slot (above a centred headline, under a centred group), on **at most 1 in 3 images per category, never on neighbours** ("SERIES CHECK FAILED"). It doesn't count toward the word budget. The craft kit also switches labels to mono caps and ink to black; it is opt-in.

---

## 13. Never

- **Colour:** one accent family (blue); never a blue-heavy illustration on a blue field; black fields only in `dark`, `versus/slash`, `versus/duo` and the approved black field of `versus/glass`; every headline black `#0A0A0B` (white on dark fields), with no blue words; black is also the ink of `logotype`'s logo and `dark`'s top-left icon.
- **Logos:** never a tiny logo in a big tile, an app icon shrunk inside a white tile, or invented or warped logos.
- **Layouts:** never two layouts with the same skeleton; never anything added to fill space (no check boxes on a pair, no container that only frames, no corner dot patches); never a heading or count dressed as one more tile among logo tiles ("7 best pediatric shouldnt be like other logos, this looks off"); never a name that outweighs its figure; never a word against a number in a pair of figures; a white design always has the grey frame; never the site mark on a headline layout; never a one-brand image for an X vs Y article.
- **Details:** no heavy shadows, small grey VS chips, badges straddling a card edge, AI-looking 3D or art, stock photos or neon.
- **Props:** never a device, a prop or a material (phone or browser mockups, a laptop lid, keycaps, sticky notes, polaroids, a felt letter board, price tags, wallet cards). The receipt and the notepad work because they are flat white typographic cards in our palette.

## 14. Borrow Principles, Never Ornaments

The full log of the user's references, and what was taken from each, is in `references/inspiration.md`.

Granola (one colour family, white UI on a bold field, logos-only integrations), Base44 (big UI, grid with corner squares), Mintlify (skeleton rows, selection-box highlight), grainient.supply (grainy deep gradients), Chatbase (comparison layouts, the subtle vivid blue, black + brand colour, framed white panels). Borrow their principles, never their ornaments: variety comes from layout, never from palette or type. Good product blogs (Clerk, Mintlify) build their art from their own product UI and data, drawn flat; so do we.
