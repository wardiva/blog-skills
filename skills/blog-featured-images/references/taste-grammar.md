# Taste Grammar: how to design a new featured image in the user's taste

Read this before every batch. It is for the Maker who has to invent a **new** design for each new article. On Oct 28 2026 the user ruled that the approved images are not retired templates. They are a taste library: learn from them, never copy them onto another article. Every new article gets a new skeleton, and every verdict trains the model.

The evidence is `references/taste-data.json`: 734 designs across batches 1–9 (697 the user judged, plus 37 layouts cut before they saw them, kept so the novelty check knows them). Of those, 571 count for training (approved/final against disapproved; no-verdicts, "ref" re-renders and replaced finals are left out), and 231 of the 571 were approved. The model is `scripts/taste.mjs`. Rates below read "approved / judged" over those 571 unless a batch is named. Principles (P1–P46) are in `taste.md`, the rulebook is `design-language.md`, and the layout tables are in SKILL.md.

The model is a filter, not the judge. Held-out `eval` over batches 5–9 is right 70% of the time. When it says "approve", it is right only 45% of the time, and it finds 35% of the approvals. A predicted reject is strong evidence. A predicted approve only means "worth showing". The user's eye decides.

---

## 1. The taste DNA: what the 79 approved images share

Lay the contact sheets of `references/approved/*.webp` side by side and one picture repeats:

1. **One object, at confident scale, on a calm field.** Cards and panels are about 900–1100px wide on the 1600×900 canvas, rows are 1000px, and pairs of tiles are 200–400px each. Type-led covers use names of about 120px (duel) or a two-line caps block (namehero). The whole group sits on the optical centre in about 940–1000px (P22, P26).
   - Big object: 91/162 (56%). Medium: 130/370 (35%). Small widget: 10/39 (26%). In batch 7 the small widget was the most common reason a delivered final was redone.
   - Exception: a user reference sets its own scale (`titlebox`, `highlight`, `darkpills`; P35).
2. **One element leads and everything else steps down.** One-leads: 148/306 (48%). Competing: 12/83 (14%; "4–9% looks too big", "The text hierarchy is not right."). When an object leads, the heading is 58–84px semibold and never bigger than the hero (P1).
3. **Few words.** The median final carries 8 visible words.
   - Approval by word count: 0–4 words 54/97 (56%), 5–8 words 73/153 (48%), 9–12 words 76/210 (36%), 13+ words 28/111 (25%).
   - The finals that lead with logos carry 0–5 words. Say each thing once: "delete dermatology tag" (P12, P30).
4. **Real identities.** Logos are the brand's real current marks.
   - Real wordmarks: 16/27. Lockups (mark + name at lockup scale): 12/15. Rows of logos in one object: 17/26.
   - A small mark with a typed name inside a panel: 11/70 in batch 7.
   - Lettering is ink: black on light, white on dark ("use black color for logo text"). No code, letter or symbol sits in a logo-shaped tile (P8, P31, P44).
5. **A figure lives inside an object or is absent.**
   - No figure: 150/307 (49%). Figure inside an object: 76/221 (34%). Figure alone on the field: 5/43, and all 5 are older finals (`stat`, `count`, `figures`). Batch 7 was 0 of 36.
   - A vs carries no price unless its title is about pricing: 14 of 15 batch-8 vs finals had no figure. A cost carries one figure or none (P27, P37, P41).
6. **Flat.**
   - Flat: 190/450. Decorative shapes (bursts, bubbles, Venn, rims, joins): 0/26. 3D: "we're not using 3D anymore".
   - Only small tiles (≤240px) tilt, by 8° at most. A reference's own tilt or capsule may stay, for that layout only (P29, P35).
   - No drop shadow on black or blue ("Drop shadow is not right."). On light fields shadows stay at 8% or less, tinted to the field.
7. **Inter, our ink, our blues.**
   - Headlines are Inter 500–600, tracked about −0.03em, black on light and white on dark. Headlines are never blue.
   - Blue belongs to the one anchor: a selection box, a figure in the blue gradient, the lead row, a band (P3).
   - The "vs" is a small grey word or our blue disc, never "x" or "+".
8. **Our fields only.** These approve well:
   - plain black: 30/58
   - the deep-dunes blue and the vibrant blue: 23/40
   - the faint, hairline and dotted grids: 31/61
   - white, paper and cream: 55/125
   - the glow: 31/80

   These lose:
   - pale sky: 13/54 ("you are just using same color")
   - the navy-blob black: 8/50, and none of the 8 kept
   - outside gradients: 0/3 ("the gradient looks awful")
9. **Structure from the user's library.** Since batch 7:
   - The user's own references: 58/74 (78%).
   - Their named sources (Peec, Dub, Mintlify, Databricks, Calendly, incident.io): 15/25 (60%).
   - Approved templates reused: 34/91 (37%). These are "already used", not new.
   - The session's own parts with no reference: 16/113 (14%). In batch 9 they went 0 of 4: "yukh", "I have given you thousands of references".
   - Covers from sites the user never named: 1/17 ("this is bullshit, this is AI scope").
10. **Once per page, and never again on the site** (principle 46: a used layout is not reused for a new article). A skeleton repeated on one review page: 54/174 (31%) against 177/397 (45%) unique ("done stop repeating designs now"). An approved layout reused on a new article: 58/165 ("these have already been used") (P14, P25, P36).

## 2. Per article type: what passed, what failed

Layout names are evidence of what the user's eye accepted, not templates to reuse.

**X vs Y: 115/294 (39%).**
- **What passes:** two identities and a "vs", no prices.
  - Lockups 12/15 (`versus/duel` "wow love it", `versus/wordvs`, `versus/glowmarks`).
  - Bands 8/11 (`versus/band` "this is perfect", `versus/duo`).
  - Capsules 9/15 (`versus/glass`, `versus/capsulevs`). Squares 4/4 (`versus/vssquares`). Real wordmarks 16/23.
  - Big objects 60/99 against medium 52/178.
- **Fields that pass:** black 22/38, blue 11/19, dunes 4/5, hairline grid 4/4, dotted map 4/4. Fields that fail: sky 4/26, navy-blob 5/31.
- **What fails:**
  - Figures alone (0/19), prices under a non-pricing title (BestRx ×4), a stack of cards (0/5), big numbers (0/4), discs (0/4).
  - One container for both sides ("doesnt look like comparison image"), split-canvas halves, props (0/6).
  - Pair tiles: 17/45 overall, and they win only big and close (P33).
- **The pair must read as two equal sides with the same kind of fact (P23).** Wordmarks must balance in width ("show some other whose logos width will look equal in this template").
- **A pricing title** ("Pricing and Features Compared") may carry one figure per side inside an object: `metricrows`, `versus/stacked` ("love it…").

**Best X: 51/110 (46%).**
- **What passes:** the logos inside one object.
  - A logo row in glass or a band 17/26 (`lineup`, `frostrow`, `research` "perfect", `tilerow`).
  - The `dock`, `editorcard` (a window) and `darkpanel`.
  - Logo tiles 31/58 overall. Light glass 5/5.
- **What fails:**
  - A loose strip of small tiles on a light field (`squircles` and `chiprow` in batch 8).
  - Tracks 3/11, rows 3/9, a card with mini cards 0/3, fused tiles 0/2 ("ew dont connect"), props 0/6, outside gradients 0/3.
  - A heading dressed as a tile ("7 best pediatric shouldnt be like other logos, this looks off"). Placeholder tiles.
  - Numbers on every pick ("visually cluttered").
- **Frosted logo tiles need our blue noise behind them:** "use gradient blue noise bg", then "This is fine now" (P38).
- **Picks with weak logos go as typed names** in one card (`picks`, `checkcard`).

**Cost: 37/111 (33%), the hardest type.**
- **What passes:** one fact.
  - Bands 5/8 (`bandhero`), `receipt` 4/7, `badge` 4/6, the button 3/5 (`demohero`).
  - A capsule 2/2 (`glassbar` after six failed rounds: "it's 3 cards, they are like too much. There should be some minimal way for this").
  - The figure inside an object 29/78. No figure at all 6/14 (`titlebox`). Full-bleed 5/6.
- **What fails:**
  - Lone big numbers 2/19, rows 0/9, small one-cards 4/21 (`breakdown`, `track`, `estimate`), steps and connectors ("designed by a begineer"), and too much text.
  - The light glass 0/9, the faint grid 0/7, the blue 0/6 and the navy blob 2/15 have all failed for cost.
  - Paper 6/9 and the glow 5/9 pass.
- **The figure is the article's lead answer, with its qualifier** (P1, P19). A price nobody publishes becomes a call to action (`demohero`, "Book a Demo").

**Worth it: 14/20 (70%), the friendliest type.**
- Type-only 5/6 (`namehero` from "just name of 1 product in our noise blue gradient bg"), one-card 4/6 (`strike`, "Love it"), panels 2/2.
- White 4/4, dunes 2/2, black 2/2.
- The image is either the verdict question with the product's name, or the advertised price struck through beside the real one.

**What is / how to / review / alternatives** (small samples, so lean on the nearest approved idea):
- **What is: 5/15.** `definition` passed ("wow love it, everything is perfect"). The type-only covers taken from named sources went 2/12. A term needs an object (a dictionary entry, a framed term), not type alone.
- **How to: 2/4.** `timeline` and `checklist` passed. Requirements went as `rulerows` (Peec): "I love them".
- **Alternatives: 2/3.** `darkpanel` passed: the title left, a black panel of the picks right.
- **Review** (single product): `dark` and `logotype`, the product's real identity big on its own field.

## 3. The parts library

Each part lists what it has been approved for. A new design combines parts in an arrangement the data has never seen.

**Fields** (use only these; the field is part of the design, P6, P28):

| Field | Approved for | Rate | Notes |
|---|---|---|---|
| Plain black | wordmark band, `vssquares`, `darkpills`, `glowmarks`, `demohero`, `dark`, `duo`, `slash` | 30/58 | "use full black bg"; no shadows; a pattern sits at the edges only |
| Deep-dunes blue noise | `glasspair`, `span`, `namehero`, `tilerow` | 23/40 with the vibrant blue | "our good gradient bg"; frosted logo tiles go here |
| Vibrant blue (flat) | `bluegrid` (Databricks), `versus/tiles`, big white cards (`checklist`, `table`) | as above | a big white card or a white-tile grid only |
| Faint grid, hairline grid | `duel`, `markvs`, `squircles`, `checkcard`, `rulerows`, `peecpair` | 31/61 with the dotted map | the quiet light canvas of most reference copies |
| Dotted map | `wordvs`, `titlebox`, `highlight`, `darkpanel` | 10/11 | light, with blue accent dots |
| Light glass | `research`, `dock`, `typehero` | 16/41 | lists 5/5; cost 0/9 |
| Glow | `strike`, `flatcard2`, `fan`, `stacked`, `lineup` | 31/80 | the user's most frequent pick for a white card |
| White, paper, cream | `meter`, `figures`, `receipt`, `hub`, `metricrows` | 55/125 | the white sits in its grey frame |
| Never | the navy-blob black (8/50, none kept), sky as a default (13/54), any outside or hand-mixed gradient (0/3) | | |

**Objects** (one per image; data rates are for the object type, so check the scale too):
- **Cards**, flat and white.
  - Approved: one big card (`strike`, `flatcard2`, `checkcard`, `picks`), two equal cards (`fan`, `stacked`).
  - Failed: a 600px card of small labels (one-card 21/69). Card stacks 3/11.
- **Rows** at 1000px width: `rulerows`, `metricrows`, `scores`, `spotlight`. Rows inside a small widget failed (`glassrows`, `routes`). 17/47.
- **Tiles:**
  - Pair tiles at 200–400px, nearly touching: `frost`, `glasspair`, `tiles`. 17/45.
  - Squares: `vssquares`, `squircles`, `costgrid`'s anchor. 9/15.
- **Lockups** (mark + name at about 120px): `duel`, `wordvs`, `glowmarks`, `logotype`. 12/15.
- **Wordmarks**, real and equal width: `band`, `peecpair`, `slash`. 6/11.
- **Panels:** the black panel (`darkpanel`), a faded panel (`prompt`), the frosted bar (`glassbar`). 8/13.
- **Windows:** one white app window (`editorcard`, `window`). 3/8. A browser chrome failed as a prop.
- **Docks:** one frosted dock with real app tiles, the lead raised (`dock`). 2/2.
- **Bands:** full width or a hairline band (`versus/band`, `bandhero`, `duo`). 13/20.
- **Capsules:** a frosted bar (`versus/glass`, `glassbar`). 11/18. A pill-ended panel only from a user reference (`capsulevs`).
- **Frames:** `titlebox`, `highlight`, `definition`, `inline`. 8/11.
- **Type blocks:** a name in caps (`namehero`) or two names (`versus/type`). 16/46. An invented type-only cover fails (`brandline`, `bigtype`).
- **Tracks:** to scale and clear in one glance (`span`, `lanes`, `meter`, `ranges`). 14/42. A confusing chart is retired: "i like the design but it is confusing".
- **Never:** props, devices or materials (1/19); a balance scale ("looks like a law illustration, the concept is so bad"); UI controls as the idea (slider, toggle: "this layout is borint"); trees, orbits, bursts.

**Logo treatments:**
- Real wordmarks: 16/27. Use them only when both are real text wordmarks and they balance in width.
- Mark + name at lockup scale: lockups 12/15. Small inside a panel, 11/70 in batch 7.
- Logo tiles: 48/110. They win frosted on our blue, or in one object, at a 22% radius, one size and one radius per row.
- Bare marks at lockup scale: 18/44 (`markvs`, `capsulevs`, `glasspair`).
- Logo pills (white pill, real logo and name): 5/13 (`darkpills`, on dark).
- Typed names: 24/59. Use them when the logos are weak (`picks`, `checkcard`, `versus/type`).
- Fake logos: vetoed.

**Figure homes:**
- A white card: strike, flatcard2's dashed selection.
- A track: span, meter.
- A type pair: scores, figures.
- A band: bandhero.
- A frosted bar: glassbar.
- A row's right end: stacked, metricrows.
- A button: demohero, which shows plan names with no figure.
- Never the bare field.

**Type treatments:**
- The heading mirrors the blog title, 15 words at most.
- Weights: semibold 600 on card layouts, 500 on headline layouts.
- Approved forms:
  - a mono-caps eyebrow (duel)
  - a grey kicker (`bandhero`)
  - a two-line caps name (namehero)
  - the key phrase in our blue-gradient highlight box with white type (`highlight`, `spotlight`)
  - the title in a frame with square handles and hatched ends (`titlebox`)
  - plan names in grey under a title (`demohero`)

**Accents** (each one earns its place, P10):

| Accent | Approved on |
|---|---|
| Selection box with square corner handles | `focus`, `spotlight`, `flatcard2`, `titlebox`, `highlight` |
| Collaboration cursor with a compact name tag | `flatcard2`, `editorcard` |
| Hairline guide lines in our blue | `research` ("use bg lines too like ss2 in our colors"), `peecpair`, the `vssquares` dashed guides |
| Dot band | `darkpills`, `demohero`, `band` |
| Glow | `glowmarks`' rising blue glow, `glassbar` |
| Blue "vs" disc on the seam | `fan`, `stacked`, `vssquares`, `bento` |
| Frosted pill tag | `research` |
| Blue bar on a flat button | `demohero` |

**Turned down:**
- waves ("delete the waves from bottom")
- corner dot patches ("delete these dot grid from top left and top right")
- ring markers
- connector lines (`link`, `plates`)
- check boxes on a pair ("checkboxes are not needed")
- ghost cards

## 4. How to invent a new design: the recipe

1. **Name the article's one idea in one sentence:** what it compares, ranks, prices or explains, and its one lead fact (P19).
   - vs: the two identities.
   - List: the picks.
   - Cost: the lead figure or "no published price".
   - Worth it: the verdict question.
2. **Use the user's own references first.**
   - If the user sent a reference for this batch, it is the brief (P35). Give it whole to the one article it fits best (P36), and skip the rest of this recipe for that article.
   - Otherwise, pick a structure from the library:
     - the user's refs 42–53 and the incident.io covers (`inspiration.md`)
     - their named sources: Peec, Calendly, Dub, Mintlify, incident.io, Databricks, Gumloop, Chatbase
     - the DNA in section 1
   - Never take a structure from a new site (P45).
3. **Choose a new skeleton.** The skeleton is the four axes: **object, composition, logo treatment, figure home**.
   - Novelty: the skeleton must differ on at least 2 axes from every layout, live or retired, in the data (`taste.mjs novelty`), and from every other design in the batch (`taste.mjs batch`).
   - Vetoes: none may apply (section 5).
   - Two facts shape the choice:
     - The centred and stacked space is used up. Almost every centred or stacked combination of the common logo treatments already exists. New skeletons come mostly from **full-bleed** compositions (7/8 approved: `versus/band`, `bandhero`), from **grids of cells** (7/18; the hairline grids of Peec and Databricks), and from objects that are rarely used (bands, docks, windows, frames).
     - Cost with no logos is exhausted. Every composition with logo treatment `none` and a figure inside an object is taken. A new cost design either shows no figure, types the plan names (`typed-names`), or carries the vendor's real identity.
   - Never relabel a descriptor to pass novelty. If the honest description fails, it is the same design.
   - Passing novelty is not enough. Visual QA's "repeat" call is a predicted reject (P25): `versus/spot` was `spotlight` under a new name.
4. **Fill it with the article's own facts:** real logos (`logo-check.mjs`), the article's own figure with its qualifier, the article's words. Use 8 words or fewer where you can and 15 at most, and say each thing once.
5. **Describe it** as a design descriptor (section 6) and run `node scripts/taste.mjs predict design.json`.
   - Fix every veto.
   - Read the closest approved and rejected designs and the user's words on them.
   - A predicted reject is changed before rendering.
6. **Plan the batch:** run `node scripts/taste.mjs batch plan.json` over every article. Each skeleton must be new, distinct within the batch and predicted to pass.
   - Ideas collide across article types. A vs band and a list band share three axes.
   - Plan the whole batch first, then render.
7. **Show 2–3 variations per article.** They must differ in skeleton (a different object or composition), each from a different reference. Colour-only or field-only alternatives don't count. The user picks.
   - When the field is undecided, show one design on 2–3 of our fields side by side (P40).
8. **Self-critique** against `taste.md` (Self-Critique and Predict the Verdict), then contact-sheet the whole batch before delivery (P34).

### New skeleton ideas, not yet used

Every line below passed `taste.mjs batch` on Oct 28 2026 within its own list: each one is new against every layout in the data (267 at the time), distinct within its list, and predicted to pass at 56–84% (the `source` given is the reference it borrows from).
- These are starting points, not commitments.
- Re-run `batch`, because data added later can make a line stale.
- Ideas from different lists can be twins, so plan the whole batch together.
- Axes are listed in the order object / composition / logo treatment / figure home.

**X vs Y** (no figures unless the title is about pricing):

| # | Skeleton | Design (reference, field) |
|---|---|---|
| 1 | band / full-bleed / real-wordmarks / none | One flat blue band edge to edge across a white field, both real wordmarks in white inside it, a small "vs" (`bandhero` band and the Peec partner band; white) |
| 2 | squares / grid / bare-marks / none | Databricks hairline grid on our flat blue, each mark on a big white square cell (~360px), the "vs" in the seam cell (user's Databricks ref; blue) |
| 3 | two-cards / stacked / real-wordmarks / none | Two wide flat white row cards, one real wordmark each, our blue "vs" disc on the seam, no prices (approved 54's rows; glow) |
| 4 | window / full-bleed / bare-marks / none | One white app window bleeding off the right and bottom edges, two panes split by a hairline, a big mark in each (Mintlify editor; light glass) |
| 5 | type-frame / grid / real-wordmarks / none | The `titlebox` frame (square handles, hatched ends) split into two cells, one real wordmark per cell, "vs" on the divider (user img 5; faint grid) |
| 6 | type-only / full-bleed / mark+name / none | "X VS Y" in big white caps across the canvas, each name led by its mark at cap height (user img 2; dunes) |
| 7 | panel / full-bleed / logo-pills / none | A plain black panel across the lower half, edge to edge, holding two white logo pills and a white "vs" (refs 51 and 9; paper) |
| 8 | rows / full-bleed / logo-tiles / none | Two full-width ruled rows like a ledger, each a logo tile and name at ~96px, a mono "VS" in the gutter (Peec rows, `definition` rules; paper) |
| 9 | lockups / left-right-split / logo-pills / none | The title big on the left, the two logo pills stacked on the right with a "vs" between (incident.io chip cover; faint grid) |
| 10 | two-cards / grid / real-wordmarks / in-object | Pricing title only: two flat cards in hairline cells, a wordmark on top and one figure each in the blue gradient (Peec "Powered by"; hairline grid) |
| 11 | window / stacked / real-wordmarks / in-object | Pricing title only: one app window with two plan rows, wordmark left and figure right (Mintlify, `metricrows`; glow) |

**Best X** (the logos in one object):

| # | Skeleton | Design (reference, field) |
|---|---|---|
| 1 | band / full-bleed / logo-tiles / none | The heading over one full-width blue band carrying a row of white logo tiles (`bandhero` band and `lineup`; white) |
| 2 | panel / grid / bare-marks / none | One black panel ruled into hairline cells, one real mark per cell, the title beside it (user img 9 and Databricks; paper) |
| 3 | window / left-right-split / logo-pills / none | The title left; on the right, an app window whose sidebar lists the picks as logo pills, the lead selected (Mintlify and img 9; glow) |
| 4 | logo-grid / full-bleed / real-wordmarks / none | Peec's "Powered by" wall: real wordmarks in a hairline grid edge to edge, a white pill with the title in the centre cell (Peec; hairline grid) |
| 5 | logo-cloud / stacked / real-wordmarks / none | The heading over two centred, staggered lines of real wordmarks; one tight group, never scattered (`cloud` and Peec; glow) |
| 6 | dock / full-bleed / bare-marks / none | One frosted shelf running edge to edge, the real marks standing on it, the lead raised (user img 7; light glass) |
| 7 | logo-row / grid / real-wordmarks / none | One row of real wordmarks, each in its own hairline cell, a pill tag and the heading above (Peec research cover and Powered by; hairline grid) |
| 8 | squares / full-bleed / typed-names / none | Weak logos: the picks' names typed in big white squares in a full-width row on the flat blue grid (Databricks; blue) |
| 9 | type-frame / full-bleed / mark+name / none | The title's angle in the blue `highlight` box, one full-width line of mark + name under it (user img 6; faint grid) |
| 10 | panel / full-bleed / logo-pills / none | A black band panel across the lower half holding the picks as white logo pills; the heading above on light (refs 51 and 9; paper) |

**Cost** (one figure, the lead answer, or none):

| # | Skeleton | Design (reference, field) |
|---|---|---|
| 1 | window / stacked / real-wordmarks / in-object | Single-vendor cost: an app window, the vendor's wordmark in its bar, one plan row with the figure big in a dashed selection with handles (Mintlify and `flatcard2`; glow) |
| 2 | type-frame / left-right-split / typed-names / in-object | The title left; on the right, a `titlebox` frame holding the plan or model name and its one figure (user img 5 and `receipt`'s split; faint grid) |
| 3 | one-card / grid / typed-names / in-object | One white card ruled into hairline cells, the 2–3 model names typed, and only the lead cell carrying its figure (Peec; paper) |
| 4 | window / full-bleed / none / none | Quote-based price: a big app window bleeding off the bottom edge, its tab the title, its body one flat "Request a quote" button with the blue bar (Mintlify and Peec pricing; faint grid) |
| 5 | lockups / left-right-split / real-wordmarks / in-object | The vendor's wordmark big on the left, a hairline, the one figure and its unit on the right (`duel` scale and `figures`; white) |
| 6 | band / grid / none / none | No figure: the title in one white band across the middle row of the Databricks grid (Databricks; blue) |
| 7 | pills / full-bleed / typed-names / none | Plan names but no price: the title over one full-width row of plan pills on black, the lead pill ringed in blue (Peec pricing; black) |
| 8 | chart-track / full-bleed / real-wordmarks / in-object | One full-width price track, the vendor's wordmark at the start and one marker carrying the lead figure (`span`, `bandhero`; dunes) |
| 9 | rows / full-bleed / typed-names / in-object | 2–3 full-width ruled plan rows; only the lead row carries its figure (Peec rows; paper) |
| 10 | type-frame / grid / real-wordmarks / in-object | The vendor's wordmark and its one figure in the two cells of a framed box with handles (user img 5; faint grid) |

**Worth it / single product:**

| # | Skeleton | Design (reference, field) |
|---|---|---|
| 1 | type-frame / full-bleed / real-wordmarks / none | The product's real wordmark in a `titlebox` frame running edge to edge with hatched ends, the question as a kicker (user img 5; faint grid) |
| 2 | type-only / full-bleed / mark+name / none | The name in caps across the full width, its mark at cap height, the question small above (user img 2; dunes) |
| 3 | panel / grid / real-wordmarks / none | The white wordmark in a black panel cell, the question in the next cell (img 9 and the Peec grid; paper) |
| 4 | window / left-right-split / real-wordmarks / in-object | The question left; on the right, an app window with the wordmark and its one real price (Mintlify; glow) |
| 5 | two-cards / grid / bare-marks / in-object | "Advertised vs real": a grey card with the claimed price struck through and a white card with the real one (`strike`'s idea; hairline grid) |
| 6 | chart-track / full-bleed / logo-pills / in-object | The product's logo pill placed at its real price on the market's range, one full-width track (`span`; dunes) |
| 7 | lockups / full-bleed / logo-tiles / none | The frosted app tile (~300px) and the name huge, the lockup running to the edge (`glasspair` and `namehero`; dunes) |
| 8 | panel / left-right-split / logo-pills / in-object | The question left; on the right, a black panel with the product's logo pill and its one price (img 9; paper) |
| 9 | type-frame / grid / bare-marks / none | The question with the product's name in the blue `highlight` box, the mark in the cell before it (user img 6; faint grid) |

**What is / how to / review / alternatives:**

| # | Skeleton | Design (reference, field) |
|---|---|---|
| 1 | window / grid / none / none | What is: an app window whose tab is the term, its body the term's 3–4 parts as typed labels in hairline cells (Mintlify; light glass) |
| 2 | pills / full-bleed / none / none | What is: the term in a big frosted pill on a full-width blue guide line, its full form under it (`research` pill, Peec guides; hairline grid) |
| 3 | chart-track / full-bleed / typed-names / none | How to: one full-width step track, 3–4 typed steps, the current step ringed in blue (`timeline`; cream) |
| 4 | rows / full-bleed / typed-names / in-object | How to: 2–4 full-width ruled requirement rows, the lead one carrying the article's figure (`rulerows`; paper) |
| 5 | lockups / left-right-split / logo-pills / none | Alternatives: the replaced product's lockup on the left, the alternatives as logo pills on the right (img 9; paper) |
| 6 | panel / grid / bare-marks / none | Alternatives: a black panel ruled into cells, one alternative's mark per cell (img 9 and Databricks; dotted map) |
| 7 | wordmarks / grid / real-wordmarks / in-object | Review: the product's wordmark big in one black cell, its one published rating in the next (`scores`; black) |
| 8 | band / grid / real-wordmarks / none | Review: the product's white wordmark on a blue band across the middle row of a faint grid (`versus/band`; faint grid) |

**Allowed by the axes but known to fail:**
- split-canvas halves (`versus/halves`)
- a slider or toggle as the idea
- a stack of offset cards for a pair (it reads unequal)
- letters of an abbreviation in tiles (P44)
- a cropped, bleeding logo
- empty or hatched squares standing in for products

## 5. Vetoes and soft costs, as `taste.mjs` implements them

**Hard vetoes** (`VETO`; any one means reject, whatever the score). Each comes from 0–2 approvals plus the user's own words:

| Veto | Data | The user's words |
|---|---|---|
| Props, devices, clip-art (`object` is a prop) | 0 of 17 in the veto's count | "why are you using mobile mockups" |
| A figure alone on the field (`figureHome: alone-on-field`) | 2 of 40 in the veto's count; 5/43 today, all older finals | "$20 looks so weird bec its so big there is no visula balance at all" |
| Decorative shapes (`shapes: decorative`): bursts, bubbles, Venn, rims, joins | 0 of 26 | "disgusting shapes", "ew" |
| 3D (`shapes: 3d`) | | "we're not using 3D anymore" |
| A cover from a site the user never named (`source: found-source`) | 1 of 17 | "this is bullshit, this is AI scope" |
| Another brand's gradient (`field: outside-gradient`) | 0 of 3 | "the gradient looks awful" |
| A code or letter dressed as a logo (`logoTreatment: fake-logo`) | | "why did you use these logos?" |
| Scattered pieces (`composition: scattered`) | 0 of 6 | "it looks scattered, it looks like AI slop" |

**Soft costs** are the learned weights from `taste.mjs stats` on Oct 28: logistic regression, later batches weighted more. They push the score; they don't forbid.

The biggest negatives:
- `hierarchy=competing` −0.35
- `repeatOnPage` −0.26 ("done stop repeating designs now")
- `shapes=decorative` −0.25
- over 12 words −0.24 ("too much text")
- `scale=medium` −0.21
- `figureHome=alone-on-field` −0.20
- `field=navy-blob-black` −0.17 ("change bg, this bg doesnt look good")
- `source=own-parts` −0.17 ("yukh")
- `source=template-reuse` −0.16 ("these have already been used")
- `source=found-source` −0.14
- `headingSize=small` −0.14
- `articleType=cost` −0.13
- `object=one-card` −0.12
- `composition=offset` −0.11
- `field=sky` −0.11 ("you are just using same color")
- `object=type-only` −0.10
- `scale=small-widget` −0.10
- `logoTreatment=bare-marks` −0.09
- `object=big-number` −0.09
- `shapes=pill-panel` −0.08 ("i dont like this rounded it looks weird")
- `composition=stacked` −0.08
- `logoTreatment=mark+name` −0.07
- `pair-tiles` −0.07
- the faint grid and soft fields −0.07 each

The biggest positives:
- `source=user-ref` +0.49
- `hierarchy=one-leads` +0.34
- `scale=big-object` +0.31
- `figureHome=none` +0.21
- `articleType=worthit` +0.18
- `shapes=flat` +0.17
- `object=lockups` +0.16
- `object=logo-row` +0.14
- `headingSize=big` +0.14
- `source=named-source` +0.14
- the white field and the dotted map +0.12 each

The model learned almost nothing from two flags it encodes: prices on a vs with a non-pricing title (−0.00; 28/94 in the data) and 2+ figures on a cost (−0.01; 19/63). Their cost lives in P37 and P41. Apply those yourself, because the score won't stop you.

Reusing a used layout is not scored. `usage.mjs` and `plan.mjs` refuse it anywhere on the site (principle 46), and the user's Oct 28 ruling asks for a new design per article.

## 6. The design descriptor

A descriptor is the JSON `taste.mjs` reads. It holds one design (`predict`, `novelty`), or `[{ "slug", "design" }]` for `batch`. Vocabularies match the record format in the header of `scripts/taste.mjs` and the values in section 3  | user-ref, named-source, found-source, own-parts, template-reuse |
| `field` | white, sky, paper, cream, g5, soft, glow, mesh, blue (vibrant), dunes, black (plain), navy-blob-black, faint-grid, hairline-grid, dotted-map, light-glass, outside-gradient |
| `object` | one-card, two-cards, card-stack, pair-tiles, lockups, wordmarks, logo-row, logo-grid, logo-cloud, panel, window, dock, rows, chart-track, big-number, type-only, type-frame, band, capsule, squares, pills, other:<x> |
| `logoTreatment` | real-wordmarks, mark+name, bare-marks, logo-tiles, logo-pills, typed-names, fake-logo, none |
| `figures` / `figureHome` | a count / in-object, alone-on-field, none |
| `composition` | centered, left-right-split, stacked, full-bleed, grid, offset, scattered |
| `scale` | big-object, medium, small-widget |
| `shapes` | flat, tilted-small-tiles, tilted-card, pill-panel, 3d, decorative |
| `hierarchy` | one-leads, competing, flat |
| `headingSize` | none, small, medium, big, huge |
| `words` | the visible word count |
| `repeatOnPage`, `reuseOfApproved`, `pricingTitle` | booleans; `pricingTitle` exempts a vs from the price flag |

A judged record adds `id`, `batch`, `round`, `article`, `category`, `layout` (mode/variant), `verdict` (approved, final, disapproved, no-verdict, retired-before-shown), `quote` (the user's exact words or ""), `vibrant`, `objectCount`, `effects`, `image` and `note`.

### Worked examples

These are from `taste.mjs` runs on Oct 28.

**1. Approved: DoseSpot vs RxNT, `versus/band`** ("this is perfect").

```json
{"articleType":"vs","source":"user-ref","field":"black","object":"band","logoTreatment":"real-wordmarks","figures":0,"figureHome":"none","composition":"centered","scale":"big-object","shapes":"flat","hierarchy":"one-leads","headingSize":"none","words":3,"pricingTitle":false}
```

`predict`: **APPROVE 78%**. The weights for it were user-ref +0.49, one-leads +0.34, big-object +0.31 and figure none +0.21. The closest approved designs are the band's own finals. The result was **NOVELTY FAILED** (against `versus/band`, `versus/glass` and `logotype`): a loved design is still a used one. That is the point.

**2. Rejected: SimplePractice vs TheraNest, `versus/delta`** ("$20 looks so weird bec its so big there is no visula balance at all").

```json
{"articleType":"vs","source":"own-parts","field":"faint-grid","object":"big-number","logoTreatment":"bare-marks","figures":3,"figureHome":"alone-on-field","composition":"stacked","scale":"big-object","shapes":"flat","hierarchy":"one-leads","headingSize":"small","words":14,"pricingTitle":true}
```

`predict`: **REJECT 31%**, with **VETO: a figure alone on the field**. The weights against it were own-parts −0.17, alone-on-field −0.20, over 12 words −0.24 and a small heading −0.14. The closest rejected design is itself, plus `bigtype` and `footnote` ("too much text"). It is also not new: it matches 12 layouts, the horizon and bracket family among them.

**3. A new idea: best X, the tile band** (best-of idea 1).

```json
{"articleType":"bestof","source":"user-ref","field":"white","object":"band","logoTreatment":"logo-tiles","figures":0,"figureHome":"none","composition":"full-bleed","scale":"big-object","shapes":"flat","hierarchy":"one-leads","headingSize":"big","words":6}
```

`predict`: **APPROVE 80%**. The closest approved designs are `squircles` and `research` ("perfect"). The closest rejected designs are `squircles` on Calendly's sky ("the gradient looks awful") and `gooey`. The result was **NOVELTY OK**. Next:
- Render it with real logos.
- Keep the band in our blue, flat (not tilted: only `bandhero`'s user reference earned a tilt).
- Size the tiles to one size and the 22% radius.
- Put it beside the approved sheet, then on the batch sheet.

### Commands

These run from `scripts/`. `FEATURED_TASTE_FILE` points the model at another data file for tests.
- `node taste.mjs predict design.json`: vetoes, the score and its weights, the 3 closest approved and rejected designs with the user's words, and novelty.
- `node taste.mjs novelty design.json`: the skeleton check only. Exit code 2 when it is not new.
- `node taste.mjs batch plan.json`: every design must be new, distinct within the batch and predicted to pass. Run it before any render.
- `node taste.mjs stats`: the learned weight of every feature value.
- `node taste.mjs eval`: train on the earlier batches, predict each later one, and report.
- `node taste.mjs add records.json`: learn from a review round.
- `node taste.mjs selftest`: run by `test-examples.mjs`. It checks held-out AUC above 0.62, that the vetoes fire, and that a duplicate of `versus/duel` fails novelty.

## 7. How the training continues

After every review round, the same session does all of this:

1. **One record per design the user judged.** That covers every option on the page: approved, final, disapproved, and no-verdict for an unmarked one.
   - The descriptor comes from the rendered image, not the plan.
   - The `quote` is the user's exact words.
   - Set `repeatOnPage`, `reuseOfApproved` and `pricingTitle` honestly.
   - A final the user later replaces gets a `final-replaced` record.
   - Silence is a no (P43). It is recorded as no-verdict and left out of training, so ask for references instead of guessing.
2. **Learn and re-check.** Run `node taste.mjs add round.json`, then `eval` and `stats`, then `node test-examples.mjs` (which runs `selftest`). Note in the batch lessons whether the predictions held, especially predicted approvals that the user rejected.
3. **Update this grammar when a pattern appears.**
   - A value that reaches 0–2 approvals over about 6 or more judgements, together with the user's words, becomes a veto in `taste.mjs`, with a refusal test. Add it to section 5 and to `taste.md` as a principle.
   - A newly approved skeleton enters section 2 as evidence and leaves the idea lists. Once it is in the data, `novelty` blocks it automatically.
   - Ideas that the user rejected get crossed out with their quote.
   - Update the rates in sections 1–3 when they move by 5 points or more.
4. **Keep the library growing.** Save every reference the user sends (`inspiration.md`) and the approved image (`references/approved/`). Every approval or rejection, as an image, as words or as silence, is training data. The next article's new design starts from it.
