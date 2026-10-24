# Featured Image Design Language

You are judging and making images that will sit side by side in a blog grid for years. Every rule below exists because a real image broke it and the user noticed. **This file is the rulebook.** Three families and the originals share it: the **card layouts** (sections 3–5), the **headline layouts** (section 3d), and the **Gumloop layouts**, **originals** and the batch-5, batch-6, batch-7 and batch-8 arrangements (section 3e): 45 modes / 76 layouts, listed in `scripts/layouts.mjs` (156 more are retired). The images in `references/approved/` show the target, and their specs are in `examples/` (`references/approved/sources.json` maps each image to its spec).

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

### 2a. Pro craft and colour across a batch (batch 6)

- **Pro craft:** one hero at a confident size, aligned edges, even gaps, sizes from one scale; nothing small, staggered or squeezed in ("it looks like this is designed by a begineer not by a pro experienced designer"; "painfully bad visual design"). `taste.md` 21.
- **One focal group:** one tight centred group about 940–1000px wide, never pieces spread to the edges ("it looks scattered, it looks like AI slop"). `taste.md` 22.
- **A comparison reads as one:** two equal sides, the same kind of fact, a clear "vs" ("doesnt look like comparison image"). `taste.md` 23.
- **Consistent shapes:** every tile in a row has one size and one radius ("corner radius of logo bg is not consistent"). `taste.md` 2.
- **Colour variety across a batch:** use the range (the black canvas, the blue gradient, glow, mesh, the white panel, sky, cream), never one colour for a whole batch ("you are just using same color"; "we have multiple colors, black background color, blue gradient"). `taste.md` 24.
- **Predict the verdict** against the approved sheet and the rejected patterns before the user sees an image (`taste.md`, Predict the Verdict).

### 2b. Scale, shapes and pairs (batch 7)

- **One skeleton per review page:** every family at most once on a page, and once per category per batch ("stop repeating designs now"). `taste.md` 25.
- **Big object, full stage:** one object at a confident scale (duel names ~120px, tiles 200–400px, cards ~900–1100px wide); never a small widget (a ~600px card, 14–22px labels) floating on a gradient. `taste.md` 26.
- **A figure lives inside an object:** `strike`'s card, `flatcard2`'s selection, the `versus/span` and `meter` tracks, the `versus/scores` type pair, `prompt`; never a lone hero number on a field (`bigtype`, `bracket`, `horizon`, `bluefield`, `versus/delta`, all retired). `taste.md` 27.
- **Flat shapes:** big panels take card corners (~40px), never pill ends ("i dont like this rounded it looks weird"); cards never rotate ("not tilted rectangle pls"); only small tiles (≤240px) may tilt, at most 8°. No liquid joins ("ew dont connect"), bursts ("disgusting shapes"), bubbles ("ew"), Venn diagrams, rims, orbits or org-chart trees. `taste.md` 29.
- **Our tile radius is 22%** of the tile (`frostrow`, `versus/glasspair`: "make the corner radius consistenty"); a new frosted tile uses it. (`squircles` keeps the rounder squircle it was approved with.)
- **Say each thing once:** no tag repeating the title ("delete dermatology tag"), no names under tiles the title already names ("delete 360 encompass and encodepro text"), no typed name beside its own wordmark. `taste.md` 30.
- **Wordmark pairs are real and equal:** real text wordmarks (or a mark with its name typed in ink), one width ("show some other whose logos width will look equal"), lettering white on black and black on light ("use black color for logo text"), marks in their colours. `taste.md` 31.
- **A reference is a spec:** measure it on the original file ("use exact same checkboxes size and tick icon that was in its inpirsation"), then translate only the field, the colours ("in our colors"), the tile radius and the "vs" ("instead of + use vs"). `taste.md` 32.
- **Pairs sit close and big:** a two-tile pair is ≥200px per tile and nearly touches; with a "vs", the gap is the "vs". `taste.md` 33.
- **Approval holds only when the batch holds:** critique the whole batch on one contact sheet before delivery; a design approved and then replaced on every article is retired ("actually delete all of them"). `taste.md` 34.

### 2c. The user's references, identities and one thing (batch 8)

- **The user's reference is the brief:** copy its structure, order, scale and field tone; translate only colour, type and "vs"; drop its ornaments (waves, lifebuoys: "delete the waves from bottom"). A user reference sets its own scale (over 2b's numbers) and may use a pill capsule or a tilt (over "Flat shapes"), only for that layout: `versus/capsulevs`'s capsule and `bandhero`'s tilted band were approved. The user's references passed 11 of 17, 3 of 4 and 2 of 2; covers the session found itself, 1 of 18. `taste.md` 35.
- **One family and one reference per review page:** a family used 2–3 times on a page kept only its best instance ("done the ones that i have disapproved are repeating the layouts/templates/design"). `taste.md` 36.
- **A comparison is two identities:** an X vs Y image shows the two products (a real wordmark, a mark + name, or two bare marks at lockup scale) and a "vs", no prices unless the title is about pricing. 14 of 15 approved batch-8 vs finals carry no figure; `metricrows` (Eaglesoft vs Dentrix: "Pricing and Features Compared") is the one priced vs. `taste.md` 37.
- **Frosted logo tiles sit on our blue:** real-colour logos on frosted glass need our blue noise gradient behind them ("use bg in which frosted glass bg can be used for logos bg", "use gradient blue noise bg", "This is fine now"): `tilerow` renders only so. `taste.md` 38.
- **A dark reference stays dark:** `versus/darkpills` and `versus/glowmarks` are dark only (their light versions were disapproved); the user accepted vibrant neighbours for them, recorded with `--vibrant-pick`. `taste.md` 39.
- **A field note is a question:** "use black bg" then "dont use black bg" a round later; show both readings (the whole field, the element) as A/B. "Lighter" dots on a black field meant subtler ("very subtle"), not brighter. `taste.md` 40.
- **Cost shows one figure, a list one object:** a cost image shows the lead figure (`bandhero`) or none (`titlebox`); a list puts its logos in one object (a window, a dock, a dark panel, frosted tiles on blue), never a loose strip of small tiles on a light field, never placeholder tiles. `taste.md` 41.
- **Type can be the image:** a title in a frame (`titlebox`), a highlighted phrase (`highlight`) or a name in big caps (`namehero`) is a whole cover when it copies the user's typographic reference; "a real illustration on every background" doesn't apply to these. `taste.md` 42.
- **Silence is a no:** a nearly blank round, or an image unmarked twice, is a rejection; ask the user for references ("i'll provide inspirations"). `taste.md` 43.
- **Never draw a brand logo:** fetch it (`icon:<domain>`), cut it from the brand's own logo, or type the name (8).

---

## 3. Backgrounds Flatter the Illustration

The field is never decoration: it exists to lift the hero off the page.

| Kind | `bg` | Look |
|---|---|---|
| Light | `sky` | light sky, top to bottom, thin guide lines |
| Light | `paper` | cool off-white `#F1F3F6` |
| Light | `cream` | warm off-white `#F6F2EA`, warm guide lines, no grain |
| Light | `g5` | near-white at the top glowing into bright sky under the hero |
| Light, picked | `soft` | calm light-blue diagonal gradient with fine grain (prompt's `"field": "soft"`) |
| Light, picked or a batch-6/7 fit list | `white` | white rounded panel inset 28px in the light-grey `#F2F2F3` frame, sparse faint dots |
| Light, picked or a batch-6/7 fit list | `glow` | `lineup`'s field: light-blue diagonal with a blue glow bottom right |
| Light, picked or a batch-6/7 fit list | `mesh` | the light blurred blue mesh behind `versus/frost` and light `versus/glass` |
| **Vibrant** | `blue` | **"Deep dunes":** bright blue `#3D80F2` at the top melting into deep royal `#1638B0` / `#0A1E70` in soft rolling bands |

- **Grain:** heavy on the vibrant blue, fine on `sky`, `paper`, `g5` and `soft`, none on `cream`. It sits on the field only, so cards stay crisp. `"grain": false` turns off both grain layers (the field grain and the fine overlay) on a light field; the vibrant blue always keeps its grain.
- **Vibrant images** (the deep-dunes blue, the black headline layouts and `glassbar`, the Gumloop black and blue fields, and the batch-7 `bluegrid`, `versus/band`, `versus/span` and `versus/glasspair`; batch 8: `namehero`, `tilerow`, `versus/vssquares`, `versus/darkpills` and `versus/glowmarks`) appear on at most 1 in 3 images per category, never on neighbours ("VIBRANT CHECK FAILED"). `research` and `dock` are light glass and do not count. When the cap blocks an image the user approved, say so and offer a different black or blue design; when the user knowingly picks the vibrant image anyway, render it with `--vibrant-pick` (it lifts only this check and records `"vibrantPick": true`), never `--force`.
- **Our fields only (batch 7).** Black is **plain black** ("use full black bg"), blue is **our deep dunes** (or `bluegrid`'s flat blue), and the light canvases are the **faint grid** and **our light glass** (plus the fields in this table). Never another brand's gradient or a hand-mixed blue ("the gradient looks awful"; "use our good gradient bg"), even after the user said Calendly's "matches"; no new design on the **navy-blob black** (black with navy glows: `glassrows`, `versus/glasssplit` and `bigtype` lost on it and are retired; "change bg, this bg doesnt look good"). "use black too" means plain black or the dunes. `taste.md` 28. Frosted logo tiles go on our blue noise gradient, never on a light field (`tilerow`; `taste.md` 38).
- **Background undecided:** show the same design on 2–3 of our fields side by side (the user chose the dunes for Curve Dental and McKesson, the grid for `squircles`).
- Only these nine fields exist ("BACKGROUND CHECK FAILED" for any other name). `soft`, `white`, `glow` and `mesh` come from the user's pick (3f); the only fit lists that name them are the batch-6/7 layouts', which lead with the field the user picked for the delivered image (`figures` white, `costgrid`, `versus/fan` and `versus/stacked` glow; `versus/stacked` also takes `mesh`; batch 7: `strike` glow, sky; `meter` white only).

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
| figures | white, sky, paper | big blue figures and black labels with no card; delivered on the white the user picked (image 50) |
| costgrid | glow, paper, sky | a blue anchor card and two white cards; delivered on the glow the user picked (image 52) |
| versus/fan | glow, sky, paper (and the vibrant blue) | two white price cards; approved on the blue (round 4), delivered on the glow the user picked (image 53) |
| versus/stacked | glow, mesh, sky | two white row cards; approved on the mesh, delivered on the glow the user picked (image 54) |
| frostrow | its own light mesh (a `bg` is refused: "BACKGROUND CHECK FAILED"; a pick: "BACKGROUND PICK FAILED") | frosted tiles need the mesh behind them; the history records it as `canvas` |
| glassbar | its own black canvas (`bg` is refused: "BACKGROUND CHECK FAILED") | the frosted bar on black with a blue glow; counts as vibrant |
| strike | glow, sky (never the blue) | one white card; delivered on the glow the user picked (image 62) |
| meter | white only | no card: the two tracks hold only on white (image 63, "delete white container") |
| the twelve batch-7 canvas layouts | their one approved field (3e; a `bg` is refused: "BACKGROUND CHECK FAILED"; a pick: "BACKGROUND PICK FAILED") | `versus/span` and `versus/glasspair` take only `"canvas": "dunes"`, `squircles` only `"canvas": "grid"`, `research` only `"glass": true`; any other `canvas` or `glass` is "FIELD FIT FAILED" |
| the 16 batch-8 layouts | their one approved look (3e; a `bg` is refused: "BACKGROUND CHECK FAILED"; a pick: "BACKGROUND PICK FAILED") | each option the user turned down is "FIELD FIT FAILED": `tilerow` `"frosted"` or `"blue": false`, `bandhero` `"waves"`, `"dark"` or `"bandInk"`, `versus/darkpills` and `versus/glowmarks` `"light"`, `metricrows` `"bars"`, `dock` a `"count"` other than its items |

- Fit lists can be per layout (`BG_FIT['versus/checks']`); a layout without its own list uses its mode's.
- Cool greys never sit on cream; on cream the guide lines turn warm and the blue margin dots are hidden (automatic).
- Always check at 350×250 next to the neighbours: the hero separates cleanly, and the field never fights the illustration's colours.

### 3b. Only a big white card goes on the deep-dunes blue

| On blue? | Layouts |
|---|---|
| **Yes** | `checklist` (blue only; it always counts as vibrant), `versus/table`, `window`, `before-after/flow`, `versus/fan` (approved on the blue in batch 6; its cards lose their shadows there, and the logo tiles keep a hairline border) |
| **No** | every other card layout (blue-heavy illustrations become one flat blob; floating tiles look weak), `strike` and `meter` included (never approved on blue; a picked blue is refused too) |

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
- **Black fields** (`dark`, `versus/slash`, `versus/duo`, `glassbar`, `versus/band`, and the Gumloop black and blue fields: `versus/glass` black, `versus/tiles` blue) count as vibrant (see 3), and so do the batch-7 blue canvases (`bluegrid`, `versus/span`, `versus/glasspair`) and the batch-8 black and blue looks (`versus/vssquares`, `versus/darkpills`, `versus/glowmarks`; `namehero`, `tilerow`).
- **Brand colour:** when a product's logo colour is vivid and modern (e.g. Sage green), `dark` and `duo` use it for the panel (`"color": "#00C247"`); otherwise the panel is the subtle blue.
- **Single-product articles:** `logotype` when the product's logo is black with strong typography (at most 2 across the site), otherwise `dark` (at most 3 across the site); each once per category. X vs Y articles use a versus layout.
- **Thirty-one ways to show X vs Y**, all showing both products: `versus/overlap`, `table`, `pills`, `connect`, `slash`, `duo`, `type`, `tiles`, `glass`, `frost`, `bento`, `badges`, `checks`, `lanes`, `scores`, `center`, `fan`, `stacked`, from batch 7 `peecpair`, `inline`, `span`, `duel`, `band`, `glasspair`, and from batch 8 `markvs`, `vssquares`, `wordvs`, `capsulevs`, `chipvs`, `darkpills`, `glowmarks` (plus `typehero`, `research` with two tiles, image 58, `prompt` with two logo rows, image 48, and `metricrows`, image 78, for a pair on price). A comparison is two identities: no figure unless the title is about pricing (2c). Each must read as a comparison at a glance: two equal sides and a clear "vs" ("doesnt look like comparison image", `taste.md` 23). **Each is used once per category; `slash`, `connect` and `duo` are favourites with a site-wide cap of 5, `pills` 2** (the user: "max 2 times"). An X vs Y image never features only one brand ("FAIRNESS CHECK FAILED").
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
- **Batch-6 layouts** (Oct 20 2026, six live; images 49–54). Each is an approved part in a new arrangement, named in brackets; all six were delivered:
  - `glassbar` (approved 24's frosted bar; image 49, EHR interoperability cost): its own black canvas with a blue glow, the white heading above (Inter 500, the rule on black), one frosted bar holding the tier `label` | its `value` in the blue gradient, the qualifier under it in dimmed white (reduced-opacity white, never grey hex over a glow). One fact for a cost article. Vibrant. Approved in round 7 after "it looks like this is designed by a begineer not by a pro experienced designer" and three more rejected EHR rounds: "There should be some minimal way for this. Also try using black background".
  - `figures` (the `versus/scores` type; image 50, E-Prescribing Software Cost): the heading and unit centred on top, then two centred columns, each a price range large in the blue gradient over its label in black, one hairline between. Two price ranges of one product type. Delivered on the white panel the user picked (its default).
  - `frostrow` (the `versus/frost` glass tiles; image 51, 7 Best Telehealth Software for Therapists): its own light mesh, the heading centred on top, one row of 3–6 equal frosted logo tiles (one size, one radius), each name under its tile, no numbers. For "best X" lists with clean logos. The user: "for logos bg glass bg would look better", and "it should be just zoom not zoom for healthcare". A picked `bg` is refused (the mesh would hide it).
  - `costgrid` (the `versus/bento` cells and the blue anchor; image 52, Medical Billing Software Cost): the heading top-left, one tall card in the blue anchor for the main pricing model and two white cards stacked beside it, each with the model, its figure big and its unit. Cost by pricing model. Delivered on the glow the user picked (its default).
  - `versus/fan` (the tilted white card and the "vs" disc; image 53, Tebra vs Zocdoc): two white price cards tilted −4° and +4°, meeting at the blue "vs" disc on the seam; each card its logo tile and name, its figure in the blue gradient, its unit. One price each, the same size. "this is fine". Approved on the deep blue (no shadows there; the logo tiles keep a hairline border), delivered on the glow the user picked (its default); the blue is allowed.
  - `versus/stacked` (the fan's parts, stacked; image 54, symplr vs Modio Health): two wide white row cards one above the other, tilted −2° and −1°, logo tile and name on the left, the figure in the blue gradient with its unit right-aligned, the "vs" disc on the seam. Prices of different scales (a yearly contract against a per-provider fee) still read as a pair. "love it. The concept, visual , everything looks so appealing and perfect". Approved on the light mesh, delivered on the glow the user picked (its default; `mesh` fits too).
- **Batch-7 layouts** (Oct 21–22 2026, fourteen live; images 55–69). Twenty articles got brand-new designs; the kept ones were led by the user's references and browser research (Peec, Dub, Calendly, Databricks), measured and translated to our system. Each paints **one approved field** (the twelve canvas layouts refuse a `bg` and a pick; `strike` and `meter` sit on a field). The parts, the fields, and which field each takes:
  - `checkcard` (the user's Peec checklist, copied pixel for pixel: "ss1 exact pixel perfect"; image 55, 7 Best Dental Software for Small Practices): a light grey card with a grey heading line, a nested white card of rows, each a blue checked box and a pick's name. The checkbox as measured on the original: box 120, radius 35 (29%), tick M32 59 L48.5 76.5 L91 35, stroke 9, round caps, `#0081FF`. **Field:** a faint grid of white rounded cards on near-white, no grain (the default).
  - `flatcard2` (`flatcard`, refined; image 56, How Much Does EHR Implementation Cost): one flat white card, the title, the figure big in the blue gradient inside a light dashed selection with small square handles (`"handles": true`), and a collaboration cursor (blue arrow, compact name tag holding the qualifier) inside the card ("perfect"). **Field:** the light glow.
  - `research` (Peec's research cover; images 57 and 58, 7 Best EHR for Dermatology and Solventum 360 Encompass vs Optum EncoderPro): a frosted pill tag, the black heading, frosted white squircle tiles in one row, Peec's guide lines in our blue, no dot pattern ("perfect"). Two or three picks get bigger tiles; `tilt`, `tileSize`, `gap` and `"names": false` give Solventum's two tilted tiles that just touch ("make logo close so they touch each other a lil bit and also incrase the sizes"). **Field:** our light glass only (`"glass": true` or left out; the black version got "for this use our glass bg"). Not vibrant.
  - `squircles` (the user's Calendly tile reference; image 59, 7 Best Mental Health EHRs for Group Therapy): the picks as big frosted squircle tiles (220px) in one row, marks in colour, the black heading above. **Field:** the faint grid only (`"canvas": "grid"` or left out; Calendly's sky: "the gradient looks awful"; the glow was disapproved).
  - `bluegrid` (Databricks' partner cover; image 60, 7 Best PT Software for Multi-Location Clinics): a flat blue field, white hairline grid lines edge to edge, each pick on a white tile in its own cell, the heading in white ("i like this layout and design"). **Field:** its own blue. Vibrant.
  - `typehero` (big Inter type and the frosted bar; image 61, Tecsys vs Cardinal Health): the two names big in one line with a light grey "vs", one frosted bar under them holding both answers (logo tile, value, unit), split by a hairline. **Field:** its light glass canvas.
  - `strike` (a white card and the blue gradient; image 62, Is Free EHR Software Worth It): one white card, the heading, "$0" grey with a slanted strike, a blue arrow, the real monthly cost big in the blue gradient, the qualifier under it ("Love it"). **Field:** glow (the user's pick) or sky; never the blue.
  - `meter` (the tracks; image 63, How Much Does an AI Medical Scribe Cost): two rows on one true-scale track, the lead row in blue, no card ("delete white container": bare is now its only look). **Field:** white only.
  - `versus/peecpair` (the user's Peec "Powered by" cover; image 64, SimplePractice vs TheraNest): a near-white field cut by grey hairlines into cells, a white pill with the title's angle, each brand's logo with its name in its own cell, lettering black ("use black color for logo text"), marks in colour. **Field:** its near-white grid, no grain (the default).
  - `versus/inline` (big type with logos; image 65, WebPT vs Jane App): the logos set inside a big two-line headline (with wordmark-like tiles, the tiles are the names and the title's angle sits under them), both figures under a hairline. **Field:** its light canvas (the white panel with a faint "+" grid).
  - `versus/span` (the lanes, turned into one axis; image 66, Curve Dental vs Denticon): one price axis; each product's range a white capsule placed to scale on its own lane, its tile, name, figure and unit above it; the axis ends under it. **Field:** the deep-dunes blue only (`"canvas": "dunes"` or left out; black: "change bg, this bg doesnt look good"; the glow was disapproved). Vibrant.
  - `versus/duel` (Dub's "X vs Y" covers; image 67, Vanta vs Drata, also Nextech vs NextGen): two big lockups (logo tile and name, ~120px Inter 600), a small grey "vs", an optional mono-caps eyebrow. **Field:** a faint square grid with soft lavender and blue corner glows ("wow love it").
  - `versus/band` (Peec's partner cover; image 68, DoseSpot vs RxNT): plain black, one hairline band full width, both real wordmarks in white with no tile, sized to one width (`"equal": true`), a small grey "vs" ("this is perfect"). Only when both brands have a text wordmark that turns white cleanly. **Field:** plain black ("use full black bg"). Vibrant.
  - `versus/glasspair` (the user's Calendly screenshot; image 69, McKesson vs PioneerRx): two big frosted white squircle tiles (400px, 22% radius like `frostrow`: "make the corner radius consistenty"), marks in colour, no text. **Field:** the deep-dunes blue only (`"canvas": "dunes"` or left out; "use our good gradient bg"; the glow was disapproved). Vibrant.
- **Batch-8 layouts** (Oct 24 2026, sixteen live; images 70–85). Of 25 Google-Doc articles, round 1's approved looks passed on 7; the session's own Peec and Dub covers passed 1 of 18; then the user sent nine references of their own with their uses ("img 1 can be used for comparison / vs …"), four incident.io covers mid-turn and refs 51 and 52. The kept ones are those references copied whole (2c), each in our colours, Inter and "vs". Each paints **one approved look**: a `bg` and a pick are refused, and every option the user turned down is "FIELD FIT FAILED" (3a). The approved look of each:
  - **Typographic covers** (the type is the image; `taste.md` 42):
    - `titlebox` (user img 5; image 75, Primary Source Verification Cost): the title alone in a long box with our blue border, square corner handles and hatched ends, on the light dotted-map field. No figure.
    - `highlight` (user img 6; image 76, 7 Best Hospital Management Software for Multi-Hospital Systems): the title, its key phrase in our blue-gradient box with square handles and white type, the rest in black, on the light dotted-map field. Title only.
    - `namehero` (user img 2, "just name of 1 product in our noise blue gradient bg"; image 72, Is ModMed Worth It): "IS IT WORTH IT? / MODMED", the kicker and the name in big white caps on our deep-dunes blue noise. Vibrant.
  - **Comparisons as two identities** (`taste.md` 37):
    - `versus/markvs` (Dub's "Rebrandly vs" cover; image 70, eClinicalWorks vs NextGen): two bare marks (no names) at lockup scale, a small "vs", a faint grid.
    - `versus/vssquares` (user img 1; image 71, MEDITECH vs TruBridge, also Availity vs Office Ally): plain black with a very subtle dot grid (white dots at 12%) and dashed guides; a black square (its mark in white) beside a white square (its mark in black), the black square edged with a dashed line on its top, left and bottom in the guides' style so it doesn't blend into the field, a "vs" disc on the seam, the names under the marks; no corner ring markers (the user's requests after delivery). Vibrant.
    - `versus/wordvs` (user img 3, "replace x with vs"; image 73, Luma Health vs Phreesia, also Optum EncoderPro vs AAPC Codify): two mark + name lockups in brand colours and a black "vs" on the light dotted-map field with blue accent dots.
    - `versus/capsulevs` (user img 4; image 74, Medallion vs symplr): the heading on top, one white capsule holding two circles with the real marks, a grey "vs" (the reference's "+" replaced). The capsule's pill ends are the reference's own (`taste.md` 35).
    - `versus/chipvs` (incident.io; image 81, Clinisys vs Epic Beaker): one tilted white chip holding both real marks and a "vs", the names as a big title beside it, a light glow.
    - `versus/darkpills` (ref 51, "ChatGPT vs Google"; image 84, Isabel vs UpToDate): two white pills (real logo + name) with dark rings and a white "vs" on dark grey with a faint grid and a band of small squares. Dark only. Vibrant.
    - `versus/glowmarks` (ref 52, "Lovable | Microsoft"; image 85, BestRx vs PrimeRx): real marks with white names and a "vs" on black, our blue glow rising from the bottom edge in two humps. Dark only. Vibrant.
  - **A pricing comparison:** `metricrows` (user img 8, "pricing comparison"; image 78, Eaglesoft vs Dentrix): a framed light page, the title, two rows each a label, a split bar (always drawn) and a big blue figure with its unit.
  - **Lists in one object** (`taste.md` 41):
    - `dock` (user img 7, "use glass"; image 77, 7 Best Therapy PM Tools for Solo Therapists): the heading, one frosted dock with one real app tile per pick, the lead raised. Our light glass. No placeholder tiles.
    - `darkpanel` (user img 9, "any template that fits … use our colors obv"; image 79, 6 Best Change Healthcare Alternatives for Claims): a big two-line title on the left, a plain black panel on the right listing the picks (logo + name) fading out.
    - `editorcard` (Mintlify's editor cover; image 80, 7 Best Clinical Decision Support Tools for Hospitals): one white app window holding a row of 4 logo tiles, a cursor on the lead.
    - `tilerow` (incident.io; image 82, 7 Best Telehealth Platforms for Small Practices): overlapping frosted tiles with real-colour logos above a big white heading, on our blue noise gradient only (`taste.md` 38). Vibrant.
  - **Cost with one figure:** `bandhero` (incident.io "PagerDuty"; image 83, How Much Does Online Booking Software Cost): a kicker, one big word and one figure on a full-bleed tilted blue band, on the light field only ("delete the waves from bottom"; "use black bg", then "dont use black bg": the black band was disapproved).
  - Older layouts approved again on batch-8 articles: `badge`, `versus/band`, `versus/duel` (long names fit the row), `versus/glass`, `versus/duo` (a side without a logo shows its name), `versus/peecpair` (per-side `"width"`), `meter` (a long figure label stops at the track end). The 18 older layouts disapproved in round 1 stay live: the user approved each on its own article, and the lesson is fit to the new article, never "it was approved before".
- **Retired** (156; listed in `RETIRED` in `layouts.mjs`, not in `LAYOUTS`, refused with "RETIRED LAYOUT", their code deleted from `render.mjs`):
  - Before batch 5: `brandline` (a background with only a headline), `folder` ("not the layout"), `versus/scale` ("looks like a law illustration": no clip-art metaphors), `versus/chat` (not picked), `versus/split` and `versus/duet` (the user passed on both twice), `versus/rows` (rejected), `versus/logos` (disliked).
  - The batch-5 props, all rejected ("not a single image that you have created matches our design language"): `versus/compare`, `versus/search`, `versus/polaroid`, `versus/notes`, `versus/phones`, `versus/browser`, `notify`, `wallet`, `stickers`, `letterboard`, `tags`, `keycaps`.
  - Batch 5, later rounds: `versus/window` (disapproved in an Oct 19 direction check); `versus/range` ("i like the design but it is confusing"; `versus/lanes` replaced it); `versus/rings` and `versus/share` (disapproved); `versus/sheet` and `versus/columns` (options never approved); from the final round: `versus/plans` ("i dont like the design, try smth else for comparison"; approved earlier with "design can be improved"), `versus/fit` (disapproved), `versus/spot` (QA: Appointment's spotlight under a new name), `grid` ("7 best pediatric shouldnt be like other logos, this looks off"; both fixes disapproved, then "for this use this glass version template": Pediatric EHR went to `lineup`).
  - Batch 6, first pass: `steps` ("it looks like this is designed by a begineer not by a pro experienced designer"), `numbered` ("numbers looks so weird and visually cluttered and unbalanced and corner radius of logo bg is not consistent"; `frostrow` replaced it), `versus/pill` ("doesnt look like comparison image"; `versus/badges` replaced it), `versus/chips` and `versus/offset` ("painfully bad visual design"; `versus/fan` and `versus/stacked` replaced them), `versus/halves` ("i dont like this it looks off and doesnt match our design vibe"; `versus/duo` replaced it).
  - Batch 6, round 3: `link`, `versus/annotate` and `versus/corners` ("all of them looks too much and you are just using same color and it doesn't look visually balanced, it doesn't look visually appealing, it looks scattered, it looks like AI slop"; annotate was disapproved again on black and on blue).
  - Batch 6, cut by QA and never shown: `poster` (a badge without its box), `versus/glasscards` (the retired plans' columns in glass), `versus/figures` (a restyle of the scores type). Not the `figures` mode, which is live.
  - Batch 7, in the user's words (11): `versus/burst` ("disgusting shapes"), `versus/underline` ("too bad visual"), `versus/bubbles` ("ew"), `versus/delta` ("$20 looks so weird bec its so big there is no visula balance at all"), `slider` ("this layout is borint"), `footnote` ("too much text"), `heroglass` ("its too bad not visually appealing at all"), `horizon` ("i like the shape you used but over alll its too much., not visually apealing at all"), `gooey` ("ew dont connect and the gradient looks awful"), `capsule` ("i dont like this rounded it looks weird"), `cursorcard` ("not tilted rectangle pls also use our bgs").
  - Batch 7, disapproved with no note (50; diagnosed in `taste.md`: a lone hero number, a stock diagram, many small pieces, a small card floating on a gradient, black with navy glows, a replaced template re-dressed): `tree`, `bigword`, `sidecolumn`, `wordtag`, `market`, `estimate`, `index`, `horizonrow`, `tilegrid`, `iconrows`, `bluefield`, `horizon2`, `sideglow`, `eclipse`, `crescent`, `masthead`, `cropmarks`, `bracket`, `contrast`, `waffle`, `notepad`, `pricebar`, `spectrum`, `glowtiles`, `glasstiles`, `breakdown`, `typelist`, `toppick`, `arc`, `track`, `rating`, `versus/medallions`, `versus/profiles`, `versus/routes`, `versus/logobar`, `versus/outline`, `versus/gap`, `versus/toggle`, `versus/eclipses`, `versus/pricepair`, `versus/butterfly`, `versus/venn`, `versus/bands`, `versus/ladder`, `versus/tierchips`, `versus/lockups`, `versus/titlecard`, `versus/sidetiles`, `versus/aura`, `versus/iconbadge`.
  - Batch 7, approved once and then replaced by the user on every article (5): `flatcard` (improved into `flatcard2`), `avatars`, `glassrows`, `versus/glasssplit`, `bigtype`. Asked whether to keep them, the user first said keep all, then "actually delete all of them".
  - Batch 7, never shown (26; QA cut them as repeats of retired or rejected designs, or the user interrupted the round): `lockupwall`, `blueprint`, `plus`, `aurarow`, `byline`, `gridcells`, `collection`, `eyebrow`, `pillstat`, `fan` and `bento` (modes; not the live `versus/fan` and `versus/bento`), `editorial`, `cascade`, `glassbars`, `orbit`, `mosaic`, `versus/gauges`, `versus/segbar`, `versus/pairchips`, `versus/chipfigures`, `versus/pillrows`, `versus/pillduel`, `versus/vstack`, `versus/overlap2`, `versus/tiltcards`, `versus/chipcloud`.
  - Batch 8, round-2 layouts from Peec and Dub covers the user never marked (they sent their own references instead) (17): `chiprow`, `rankrows`, `darkbars`, `darkhbars`, `logodialog`, `sourcetable`, `trio`, `optioncards`, `versus/pillvs`, `versus/planstack`, `versus/headpeek`, `versus/splitchart`, `versus/twocards`, `versus/stackpair`, `versus/blackmarks`, `versus/linkcard`, `versus/pillpair`.
  - Batch 8, no verdict for four rounds, then "i'll provide inspirations" (2): `versus/tiltpair`, `versus/dimension`.
  - Batch 8, never shown (3): `steptiles`, `versus/filecard`, `versus/bandcard`.
  - History: `lessons.md`.

## 3f. The user picks each image's background
The user: "we have so many background why are you fixated on just one. show me 12 images and options for backgrounds and i'll selevt the bg for each". The fit lists kept nearly every image on sky or g5, so the fit list is now only the starting point.

- After the batch renders, show every image on every field it can take (picker page) and let the user pick. The pick goes in the spec: `"bg": "<field>", "bgPick": true`.
- A pick skips the fit list (BG_FIT), the blue fit (BLUE_FIT) and the canvas refusal; it never skips the vibrant check (a picked blue still counts: 1 in 3 per category, never neighbours). The history records the picked field, so the next image's neighbour check sees it.
- Card layouts take any light field. A layout that paints its own canvas takes a pick only where its canvas can step aside (`versus/badges`, `versus/type`, `versus/tiles`, `versus/bento`, `swap`, `badge`, `shortlist`): light fields only, and blue only on `versus/tiles`. The rest (`versus/pills`, `versus/connect`, `versus/slash`, `versus/duo`, `dark`, `glassbar`, `versus/glass`, `versus/frost`, `receipt`, `definition`, `lineup`, `prompt`) refuse it ("BACKGROUND PICK FAILED"), and so do `frostrow`, which paints its own light mesh over the whole canvas, the twelve batch-7 canvas layouts and the 16 batch-8 layouts (3e). `strike` takes a light pick like any card layout; `meter` takes white only, also as a pick ("BACKGROUND PICK FAILED: meter has no card behind its tracks"); neither takes the blue.
- The vibrant blue only where every word sits inside a white card (the user picked it for `versus/checks`, image 37): the renderer refuses a picked blue on any other layout (`BLUE_PICK`: `checklist`, `versus/table`, `window`, `before-after/flow`, `versus/checks`, `picks`, `stack`, `versus/fan`, and `versus/tiles` on its own blue field).
- **Variety in backgrounds too.** In batch 5 the user picked seven different fields for 12 images (glow 4, mesh 2, soft 2, blue, cream, paper, white; after the final round the two soft picks became RXNT's `prompt` on its own soft field and Pediatric EHR's `lineup` on its own glow canvas). In batch 6: glow 5 (`versus/badges`, `swap`, `costgrid`, `versus/fan`, `versus/stacked`), white 2 (`figures`, `versus/type`), blue 1 (`versus/tiles`: "use the blue gradient bg"), with `glassbar` and `versus/duo` on their own black and `frostrow` on its own mesh. Never let a batch drift onto one field (2a, `taste.md` 24).
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
| Cards | White, radius 20–30px (big panels up to ~40px, never pill ends), flat (never rotated) (except the capsule or tilt of the user's own reference: `versus/capsulevs`, `versus/chipvs`, `bandhero`; 2c), minimal tinted shadow (see 3c), real text from the article |
| Tiles | One size and one radius per set; frosted tiles at 22% of the tile (`frostrow`, `versus/glasspair`); only tiles of 240px or less may tilt, at most 8° (except the capsule or tilt of the user's own reference: `versus/capsulevs`, `versus/chipvs`, `bandhero`; 2c) |
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
| versus/checks | one tilted checklist card: title, blue rule, a row per product (logo tile, name, sub), no check boxes by default (`"checks": true` adds them) | X vs Y, each product's strength |
| versus/lanes | centred headline + unit, a white card with one lane per product: blue price stops on a shared scale | X vs Y with several price points |
| versus/scores | small metric title, two rows: logo tile, big name, very large gradient score; no card | X vs Y with one published score |
| versus/center | two tilted logo tiles, hand-drawn arrows into one central blue tile with the angle | X vs Y for one specialty or audience |
| spotlight | centred headline with the angle in the selection box; a card of logo rows bleeding off the bottom | "best X" lists |
| picks | one tilted checklist card of the picks, names only | "best X" lists without clean logos |
| cloud | centred headline over staggered white logo pills | "best X" lists |
| count | giant gradient number + caption left, a card of logo rows right | "N best" lists |
| ranges | headline + unit, a card of vertical price tracks with a logo tile under each (no card when `bare` on white) | "best X" lists with prices |
| figures | centred headline + unit, two centred columns of a big gradient figure over its label, one hairline between | cost: two price ranges |
| costgrid | headline top-left, one tall blue anchor card beside two stacked white cards (model, figure, unit) | cost by pricing model |
| frostrow | centred headline over one row of 3–6 equal frosted logo tiles with names, on its own mesh | "best X" lists with clean logos |
| glassbar | white headline over one frosted bar (label \| figure) and a dimmed caption, on its own black | cost: one fact |
| versus/fan | two white price cards tilted ±4°, side by side, meeting at the "vs" disc | X vs Y, one price each |
| versus/stacked | two wide white row cards stacked, tilted −2°/−1°, logo + name left, figure right, the "vs" disc on the seam | X vs Y, prices of different scales |
| checkcard | a light grey card, grey heading line, a nested white card of blue-checked rows, among white cards cropped at the edges | "best X" lists, names only |
| flatcard2 | one flat white card: title, the figure in a dashed selection with handles, a cursor with a name tag | cost: one figure and its qualifier |
| research | frosted pill tag, centred heading, one row of frosted squircle tiles between blue guide lines | "best X" lists; a pair as two tilted tiles |
| squircles | centred heading over one row of big frosted squircle tiles | "best X" lists with real marks |
| bluegrid | white heading over one band of grid cells, a white logo tile per cell | "best X" lists (vibrant) |
| typehero | "A vs B" in one big line over one frosted bar with both answers | X vs Y, one short answer each |
| strike | one white card: heading, struck-through price → arrow → real price, qualifier | "is free X worth it" |
| meter | centred heading + unit, two rows on one true-scale track, no card | cost: two options on one scale |
| versus/peecpair | a white pill over a hairline grid, one wordmark per middle cell | X vs Y with real wordmarks |
| versus/inline | a two-line headline with the logos set in it, two figures under a hairline | X vs Y, a figure each |
| versus/span | two lanes on one price axis, each range a white capsule to scale | X vs Y, a price range each |
| versus/duel | eyebrow over two big lockups and a small "vs" | X vs Y, names that carry the pair |
| versus/band | one full-width hairline band on black, two white wordmarks and a small "vs" | X vs Y with clean text wordmarks (vibrant) |
| versus/glasspair | two big frosted squircle tiles side by side, no text | X vs Y with strong marks (vibrant) |
| versus/markvs | two bare marks at lockup scale, a small "vs", a faint grid | X vs Y with strong marks |
| versus/vssquares | a black square and a white square on plain black, a "vs" disc on the seam, names under the marks | X vs Y (vibrant) |
| versus/wordvs | two mark + name lockups in one line with a black "vs" | X vs Y |
| versus/capsulevs | heading over one white capsule holding two circled marks and a grey "vs" | X vs Y |
| versus/chipvs | one tilted white chip of both marks beside the names as a big title | X vs Y |
| versus/darkpills | two white logo + name pills with dark rings and a "vs", on dark grey | X vs Y (vibrant) |
| versus/glowmarks | two mark + name lockups and a "vs" over a two-hump blue glow on black | X vs Y (vibrant) |
| metricrows | framed page: title, two rows of label, split bar and big blue figure | X vs Y about pricing |
| namehero | kicker and name in big white caps, centred | one product, "is X worth it" (vibrant) |
| titlebox | the title alone in one long bordered box with handles and hatched ends | any article; cost with no figure |
| highlight | the title with its key phrase in a blue box | any article with a key phrase |
| dock | heading over one frosted dock of app tiles, the lead raised | "best X" lists |
| darkpanel | big title left, a black panel of picks right, fading | "best X" or alternatives lists |
| editorcard | one white app window with a row of logo tiles and a cursor | "best X" lists with 3–4 picks |
| tilerow | overlapping frosted tiles over a big white heading on our blue | "best X" lists (vibrant) |
| bandhero | kicker, one big word, one figure on a full-bleed tilted band | cost: one lead figure |

- The same article type can use several layouts (cost: focus, stat, prompt, window, ranked, receipt, badge, figures, costgrid, glassbar, flatcard2, meter, strike, titlebox, bandhero; how-to: before-after, timeline, stack, checklist; best-of lists: hub, spotlight, picks, cloud, count, ranges, shortlist, lineup, frostrow, checkcard, research, squircles, bluegrid, dock, darkpanel, editorcard, tilerow, highlight). Use that range so no layout comes back in the same category.
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
8. **Enough content:** each layout needs enough real facts to fill its frame (window 2+ rows, hub 6–7 products, ranked, checklist and timeline 3+, stat card 2+, focus 2+ rows, shortlist 3+ items, lineup 3–7 logos, picks 3–7, spotlight and count 3–6, cloud 3–8 logos, ranges 3–6 rows plus `max`; versus/badges a `value` on both sides, versus/checks a `title`, versus/center a `label`, versus/lanes `max` and both sides' `points`, versus/scores a `title` and a real number on both sides, never a word; frostrow 3–6 logos, figures 2 rows, costgrid 3 cells, glassbar a `label` and a `value`, versus/fan and versus/stacked a `value` on both sides; batch 8: both logos on markvs, vssquares, wordvs, chipvs, darkpills and glowmarks, capsulevs both logos and the `headline`, titlebox the `headline`, highlight the `lead` and the `phrase`, dock 3–7 items, darkpanel 3-6, editorcard 3–4, tilerow 3–6, metricrows 2 rows each with `label`, `display` and a numeric `amount`, bandhero the `name` and the `band`). The renderer refuses thinner specs ("CONTENT CHECK FAILED").

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

- **Where:** wherever a real product is named: hub tiles, versus sides and table headers, window rows, ranked rows, stat rows, prompt rows and chips, and the logo rows and tiles of the batch-5 and batch-6 layouts. Never decorative.
- **One tile per row:** every logo in a row shares one tile size and one radius ("corner radius of logo bg is not consistent"). A solid app icon is the tile itself with `"fill": true` (edge to edge, clipped to the tile: `lineup`, `versus/center`, `versus/fan`, `versus/stacked`; on `frostrow` it sits at 48% inside its glass tile with the same 22% radius), or gives way to the brand's bare mark on the tile. `"logo": "icon:<domain>"` asks for the brand's square app icon.
- **Names as people say them** under a logo ("just zoom not zoom for healthcare"); the user's spelling wins.
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
4. Never `--force`, and never render into another folder to dodge a check. A redo the user asks for goes with `render.mjs --redo`, then finalize again (SKILL.md Workflow step 9).
5. **Fresh over reuse.** Images the user has already seen count as used, whatever the record says ("you created most of the designs that were already being used"): a batch gets new designs, never a refill of layouts the user knows (`taste.md` 14).
6. **Approval is per article.** A design approved in a direction check is approved for the article it was shown on; never roll it out across the rest of the batch (three badges side by side read as one template). Each other article gets its own design.
7. **Delivered images are permanent.** After delivery, `scripts/finalize.mjs` marks them final in the site history and the folder ledger (`featured-images/.featured-ledger.json`) and copies them to `~/.blog-featured-images/delivered/<brand>/<slug>/`. Their files stay in `featured-images/<slug>/` (in the project, never a scratch folder), they keep counting as used in their category forever, and the renderer refuses to re-create or overwrite them ("FINAL IMAGE LOCKED"), except when the user asks for that image to be redone: `render.mjs --redo` lifts only this lock, for the slug's own image in its own folder (every other check runs), and finalize.mjs then gives it a new `finalizedAt`, the earlier dates kept in `previousFinalizedAt`; never `--force`. A new article always gets its own slug and folder.

---

## 10. The Heading Mirrors the Blog Title

The heading uses **the blog title's own words and meaning, just shorter**. No creative rewording.

1. Keep the subject (EMR, ERP, Dynamics 365) and the angle (cost, switch, best, vs, by practice size).
2. Drop the year, filler, "How to", "Complete guide" and brackets.
3. Keep at least 75% of the heading's key words from the title (`stat`'s caption needs only 2 shared words).

| Blog title | Good | Bad |
|---|---|---|
| EMR Software Cost 2026: Pricing by Practice Size | EMR Cost by Practice Size | What EMR really costs |
| How to Switch EMR Vendors Without Losing Patient Data | Switch EMR Vendors Without Losing Data | Every chart makes the move |
| 7 Best ERP Software for Small Businesses in 2026 | 7 Best ERP for Small Businesses | Seven ERPs. One right fit. |

Every spec carries `"articleTitle"`; the renderer refuses drifting headings ("HEADING CHECK FAILED"). It checks the heading wherever a layout has one, the batch-5, batch-6 and batch-7 layouts included (`spotlight`, `cloud`, `ranges`, `figures`, `costgrid`, `frostrow` and `glassbar` headline, `picks` and `versus/checks` title, `count` caption, `versus/lanes` headline; the `checkcard`, `flatcard2`, `research`, `squircles`, `bluegrid`, `strike`, `meter` and `versus/peecpair` headline, `typehero`'s "A vs B", and `versus/inline`'s headline, or its "A vs B" when the logos aren't wordmarks; batch 8: the `titlebox`, `dock`, `darkpanel`, `editorcard`, `tilerow`, `metricrows` and `versus/capsulevs` headline, `highlight`'s lead and phrase, `bandhero`'s kicker and name, and `namehero`'s kicker and name, so a `namehero` without its name fails here). A list heading keeps the title's angle ("Best Small Practice EMR", not "5 Best EMR"). Layouts without a headline (before-after, most versus variants, hub) use the title's key terms in their labels. A tile label is not a heading: the hub's blue tile may shorten to the count and category ("7 Best ERP" on approved image 02) when the tile can't fit the angle; a heading never does.

---

## 11. One Dominant Line of Type

| Role | Size (on the 1600×900 master) |
|---|---|
| Headline | 56–76px for the free-standing card headlines (`focus`, `ranked`, `timeline`, `prompt`); in-card titles keep their own sizes (`window` up to 42px, `checklist` 40px, `stack` 48px); `receipt` semibold, up to 84px; up to ~116px in headline layouts, never wider than its panel; auto-sizes down, never up |
| Names and terms (Gumloop, originals) | up to ~140–150px, Inter 700 (`versus/type` names 140, the definition term 150) |
| Badge figure | up to ~168px, in its tinted box |
| Hero number (stat) | up to 150px (the card grew to match; never outweighs it) |
| Count number, scores | `count` 250px beside its logo card, `versus/scores` 120px with no card; both in the blue gradient |
| Price figures (batch 6) | in the blue gradient, auto-fit: `figures` up to 110px, `glassbar` and `versus/fan` up to 92px, `versus/stacked` up to 80px, `costgrid` up to 64px on the anchor and 50px on the white cards; the two figures of a pair share one size |
| Batch-7 objects | big and confident: `versus/duel` names ~120px, `versus/inline` headline up to 132px, `flatcard2` and `strike` figures up to 172px and 128px; tiles 200–400px (`squircles` 220, `versus/glasspair` 400), cards ~900–1100px wide (`taste.md` 26) |
| Batch-8 covers | the user's reference sets the scale (`taste.md` 35): `namehero` names up to 200px caps, `bandhero`'s word up to 120px and band figure up to 112px, `metricrows` figures 104px, `versus/wordvs` and `versus/glowmarks` names up to ~116px and 100px, `versus/vssquares` squares 540px |
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

- **Colour:** one accent family (blue); never a blue-heavy illustration on a blue field; never one field for a whole batch ("you are just using same color"); black fields only in `dark`, `versus/slash`, `versus/duo`, `glassbar`, `versus/band`, `versus/vssquares`, `versus/darkpills`, `versus/glowmarks` (plain black or dark grey) and the approved black field of `versus/glass` (a black panel on a light field: `darkpanel`); never a light version of a dark reference, and never frosted logo tiles on a light field (2c); never another brand's gradient, a hand-mixed blue or a navy-blob black for a new design (3); every headline black `#0A0A0B` (white on dark fields), with no blue words; black is also the ink of `logotype`'s logo and `dark`'s top-left icon.
- **Logos:** never a tiny logo in a big tile, an app icon shrunk inside a white tile, or invented, hand-drawn or warped logos (a missing mark is fetched with `icon:<domain>`, cut from the brand's own logo, or left out for the typed name).
- **Comparisons and lists:** never prices on an X vs Y image whose title isn't about pricing; never more than one figure on a cost image; never a loose strip of small logo tiles or a placeholder tile (2c).
- **Layouts:** never two layouts with the same skeleton; never pieces scattered to the edges, a stagger with no reason, or small chips where a big figure belongs ("it looks scattered, it looks like AI slop"; "painfully bad visual design"); never an X vs Y image that doesn't read as a pair ("doesnt look like comparison image"); never anything added to fill space (no check boxes on a pair, no container that only frames, no corner dot patches); never a heading or count dressed as one more tile among logo tiles ("7 best pediatric shouldnt be like other logos, this looks off"); never a name that outweighs its figure; never a word against a number in a pair of figures; a white design always has the grey frame; never the site mark on a headline layout; never a one-brand image for an X vs Y article; never a small widget floating on a gradient or a lone hero number on a field; never a pill-ended panel, a rotated card, a liquid join, a burst, bubbles, a Venn diagram, a rim, an orbit or an org-chart tree (2b) (except the capsule or tilt of the user's own reference: `versus/capsulevs`, `versus/chipvs`, `bandhero`; taste 35).
- **Details:** no heavy shadows, small grey VS chips, badges straddling a card edge, AI-looking 3D or art, stock photos or neon.
- **Props:** never a device, a prop or a material (phone or browser mockups, a laptop lid, keycaps, sticky notes, polaroids, a felt letter board, price tags, wallet cards). The receipt and the notepad work because they are flat white typographic cards in our palette.

## 14. Borrow Principles, Never Ornaments

The full log of the user's references, and what was taken from each, is in `references/inspiration.md`.

Granola (one colour family, white UI on a bold field, logos-only integrations), Base44 (big UI, grid with corner squares), Mintlify (skeleton rows, selection-box highlight), grainient.supply (grainy deep gradients), Chatbase (comparison layouts, the subtle vivid blue, black + brand colour, framed white panels). Borrow their principles, never their ornaments: variety comes from layout, never from palette or type. Good product blogs (Clerk, Mintlify) build their art from their own product UI and data, drawn flat (except the capsule or tilt of the user's own reference: `versus/capsulevs`, `versus/chipvs`, `bandhero`; 2c); so do we. Raycast and Linear (batch 6) put one object on a strong field, often black with one glow: one focal group, never scattered pieces. Batch 7's kept layouts came from Peec (the checklist, the research cover, the "Powered by" pair, the partner band), Dub (the duel), Calendly (the frosted squircle tiles) and Databricks (the blue grid): about one invented option in ten was approved, against one or two rounds for a reference-led one. After two failed rounds of inventions, go to references; measure them, then translate them to our fields, colours, 22% tile radius and "vs". Batch 8 went further: the user's own references (nine with their uses, refs 51 and 52, and four incident.io covers) passed 11 of 17, 3 of 4 and 2 of 2, against 1 of 18 for the Peec and Dub covers the session chose itself. The user's reference is the brief (2c), and its ornaments (waves, lifebuoys) stay behind.
