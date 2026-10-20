# Spec Format

You write one JSON file per article, from the article's own facts. Start from the closest spec in `examples/` (complete and renderable); the snippets below show only each layout's own fields. Top-level fields shared by all layouts:

| Field | Required | Meaning |
|---|---|---|
| `articleTitle` | yes | The blog post's real title (H1). The image heading must reuse its words, shorter ("HEADING CHECK FAILED" otherwise) |
| `brand` | no | Brand file in `brands/` (e.g. `"medsoftwarehub"`). Defaults to `default` |
| `category` | yes | The site's blog category. A spec without one is refused ("CATEGORY MISSING"); the spelling is normalised ("Hospital & Lab Software" = `hospital-and-lab-software`). A layout is used once per category (the usage rule: `SKILL.md`, Layout Decision Framework step 3); the category also drives the vibrant mix and the site mark (1 in 3, never neighbours) |
| `topic` | when shared | Same string for articles on the same subject (e.g. duplicate URLs). They never share a mode |
| `slug` | yes | Output folder name and history key (unique per article) |
| `mode` | no | Card layouts: `before-after` (default), `versus`, `hub`, `focus`, `stat`, `ranked`, `timeline`, `checklist`, `prompt`, `stack`, `window`. Headline layouts: `dark`, `logotype`. Gumloop: `swap`, `badge` (plus the versus variants below). Originals: `receipt`, `definition`, `shortlist`, `lineup`. Batch-5 layouts for best-of lists: `spotlight`, `picks`, `cloud`, `count`, `ranges`. Batch-6 layouts: `figures`, `costgrid`, `glassbar` (cost), `frostrow` (best-of) |
| `variant` | no | `before-after`: `default`, `flow`. `versus`: `overlap` (default), `table`, the headline variants `pills`, `connect`, `slash`, `duo`, the Gumloop variants `type`, `tiles`, `glass`, the originals `frost`, `bento`, the batch-5 variants `badges`, `checks`, `lanes`, `scores`, `center`, and the batch-6 variants `fan`, `stacked`. Mode + variant = one layout |
| `bg` | no | Leave it out: the renderer picks the layout's best-fitting background (the batch-6 card layouts lead with the field the user picked for their delivered image: `figures` white, `costgrid`, `versus/fan` and `versus/stacked` glow). Light: `sky`, `paper`, `cream`, `g5`, but only those in the layout's fit list ("Background fit" in the design language); `soft`, `white`, `glow` and `mesh` as the user's pick (`bgPick`) or where a batch-6 fit list names them. Vibrant: `"blue"` on at most 1 in 3 images (counting the black layouts), only for `checklist`, `versus/table`, `window`, `before-after/flow`, `versus/fan`. The checklist is blue only: the renderer sets it, and any other `bg` is refused ("CHECKLIST FIELD FAILED"). Refused on every layout that paints its own canvas (`prompt`, the headline layouts except `logotype`, which takes only `cream`, and the Gumloop and original layouts: "BACKGROUND CHECK FAILED"); prompt's calmer field is `"field": "soft"` |
| `bgPick` | no | `true` = the user picked this `bg` on the picker page (it needs a `bg`; only `true` is valid). It skips the fit list, the blue fit and the canvas refusal, never the vibrant check. Canvas layouts take a pick only on `versus/badges`, `versus/type`, `versus/tiles`, `versus/bento`, `swap`, `badge` and `shortlist` (light fields; blue only on `versus/tiles`); every other canvas layout refuses it ("BACKGROUND PICK FAILED"), and so does `frostrow` (its own mesh covers the canvas). A picked `blue` only on layouts whose text all sits in a white card (`checklist`, `versus/table`, `window`, `before-after/flow`, `versus/checks`, `picks`, `stack`, `versus/fan`, `versus/tiles`). Set by `scripts/bgpick.mjs apply`. Design language 3f |
| `grain` | no | Field grain, on by default for `sky`, `paper`, `g5` and always on `blue`; never on `cream`. `false` turns off both grain layers (field grain and fine overlay) on a light field |
| `logo` (per item) | no | The product's official domain (e.g. `"odoo.com"`) on hub `cards[]`, versus `left`/`right`, window `list.rows[]`, ranked `rows[]`, stat `card.rows[]`, prompt `panel.rows[]` and `chips[]`, and the `items[]`/`rows[]`/`left`/`right` of the batch-5 and batch-6 layouts. The renderer finds the logo itself. When it finds the wrong mark, use a file instead: `"../assets/<file>.png"` (relative to the spec; the official mark saved from the brand's website). `"icon:<domain>"` asks for the brand's square app icon (Brandfetch icon, edge to edge) |
| `scale` (per item) | no | How much of its tile a logo fills, for a wide, thin mark that needs a bigger box to carry equal weight (judge by eye): `lineup` `cards[]` 0.5–0.8 (default 0.7), `hub` logo tiles 0.5–0.8 (default about 0.65), `versus/center` `left`/`right` 0.45–0.8 (default 0.66), `frostrow` `items[]` (default 0.48), `versus/fan` and `versus/stacked` `left`/`right` (default 0.64) |
| `fill` (per item) | no | `true` = the logo is a solid app icon that becomes the tile itself, edge to edge, clipped to the tile's radius (never an icon's own rounded square inside a white tile: "corner radius of logo bg is not consistent"). On `lineup` `cards[]`, `versus/center` and `versus/fan`/`versus/stacked` `left`/`right`; on `frostrow` `items[]` the icon is clipped to the tile's 22% radius at 48% of the glass tile |
| `logoStyle` | no | `color` (default), `mono` or `tint`. One style per image |
| `frame` | no | Faint grid + registration squares. On by default for `stat`, `timeline`, `window` (never on blue; `ranked` gets the guide-line texture instead). `true`/`false` overrides |
| `texture` | no | Thin guide lines at x 210/1390 + a few margin dots. On by default for sky/paper fields and for checklist, ranked, focus, versus, before-after and stack; off where the frame grid is on (never both). `true`/`false` overrides |
| `cursor` | no | `[x, y]`: one pointer cue aimed at the key fact; never covers text |
| `bleed` | no | `window` only: the window runs off the bottom and right edge; words stay inside x 210–1390 |
| `craft`, `series` | no | Opt-in site mark + mono series tag (`"craft": true, "series": "Pricing"`). At most 1 in 3 images per category, never neighbours |

**Text budget: 15 visible words per image, max 7 per element, no sentences** (renderer-enforced). Bullets up to ~32 characters, labels up to ~18, headlines up to ~24. If a line wraps in the render, shorten it.

The specs in `examples/` are complete, approved examples of every layout. Start from the closest one.

---

## Before → After (default; how-to, migration)
```json
{ "before": { "label": "Old EMR", "lines": ["Allergies", "Medications"] },
  "after":  { "label": "New EMR", "heading": "Patient chart", "items": ["Mapped and verified", "CCDA imported"] } }
```
- `before.lines`: 1–3 short raw lines. `after.items`: 2–4 bullets; the first is dark (the key point). An optional `legend` (two short labels) counts toward the 15 words.
- Use the article's own words; never invent sample patients or values.
- **`"variant": "flow"`** (old way → new way, e.g. on-premise → cloud): muted dashed icon card → hand-drawn arrow → lifted card with a blue icon tile and checked items. Add `before.icon` and `after.icon` (Phosphor classes, e.g. `"ph ph-hard-drives"`, `"ph-fill ph-cloud"`). `before.lines`: 1–2 short caps; `after.items`: 2 items. Works on the vibrant blue. Example: `examples/what-is-cloud-erp.before-after-flow.json`.

## Versus (`"mode": "versus"`; X vs Y)
```json
{ "mode": "versus", "variant": "table", "dimensions": ["Per user/mo", "Pricing"],
  "left":  { "label": "Odoo", "logo": "odoo.com", "items": ["$24.90", "Published"] },
  "right": { "label": "Sage Intacct", "logo": "sage.com", "items": ["$150 to $400", "Quote only"] } }
```
- **`table`**: one comparison card; `dimensions` are row labels (up to ~12 characters). Works on the vibrant blue.
- **`overlap`** (default): two tilted overlapping cards; `label` above each card, `heading` the plan line, `items` 2–3 facts (up to ~22 characters), `items[0]` the key fact. Optional `legend`.

## Hub (`"mode": "hub"`; "best X" lists, integrations)
```json
{ "mode": "hub", "hubLabel": { "big": "7", "small": "Best ERP" },
  "cards": [ { "name": "NetSuite", "logo": "netsuite.com" }, { "name": "SAP Business One", "logo": "sap.com" },
             { "name": "Dynamics 365", "logo": "microsoft.com" }, { "name": "Acumatica", "logo": "acumatica.com" },
             { "name": "Odoo", "logo": "odoo.com" }, { "name": "Sage Intacct", "logo": "sage.com" },
             { "name": "Epicor Kinetic", "logo": "epicor.com" } ] }
```
- **Logos only** (the default when every card has a `logo`): square logo tiles around the blue centre tile, no names. `"showNames": true` brings back name cards, only for products without recognisable logos.
- 6 or 7 cards; use 7 for a "7 best" list so the image matches the title. On name cards (`showNames`), `"showSubs": true` adds each card's `sub` under its name; logo tiles never show it.
- `hubLabel` puts the title's key words on the blue tile (the hub has no headline). Without it, `hubIcon` (any Phosphor class) is shown.
- Background: `cream` or `paper` (the blue tile needs a neutral field).

## Focus (`"mode": "focus"`; one key idea + a few values)
```json
{ "mode": "focus", "headline": "EMR cost by {{practice size}}", "label": "Year one", "highlight": 1,
  "rows": [ { "name": "Solo", "value": "$15K–$30K", "pct": 30 }, { "name": "2–5", "value": "$40K–$150K", "pct": 150 },
            { "name": "26+", "value": "$100K–$500K+", "pct": 500 } ] }
```
- `{{ }}` puts the key phrase in the blue selection box. Up to 3 real rows (`name` ≤ ~6 characters, `value` ≤ ~12, `pct` = bar length) plus faded skeleton rows that add no words. `highlight` is the blue row.

## Stat (`"mode": "stat"`; one headline number)
```json
{ "mode": "stat", "value": "$48,000", "caption": "a year for 50 Dynamics 365 users",
  "card": { "heading": "Starting price", "rows": [ { "name": "Dynamics 365", "logo": "microsoft.com", "value": "$48,000/yr", "pct": 48000 },
                                                 { "name": "Acumatica", "logo": "acumatica.com", "value": "$6,396/yr", "pct": 6396 } ] } }
```
- `value` up to ~8 characters (auto-sized, at most 150px so it never outweighs the card), in a soft blue gradient (`"valueColor": "black"` or `"blue"` to change it). Optional `sub`: a small line under the caption. Card `rows`: 2–4, all in the same unit, and inside the hero's range (a row outside it reads as an error). `card.highlight` picks the blue row; `null` when no row is the hero's subject.

## Ranked (`"mode": "ranked"`; rankings by a real metric)
```json
{ "mode": "ranked", "headline": "How Long ERP Implementation Takes", "winner": 0,
  "rows": [ { "name": "Small business", "value": "2-4 months", "pct": 4 }, { "name": "Mid-market", "value": "4-9 months", "pct": 9 },
            { "name": "Enterprise", "value": "12-24+ months", "pct": 24 } ] }
```
- `rows`: 3–6, names up to ~16 characters. `pct` sets bar length; `winner` is the blue row. Optional `sub`: a line under the headline.

## Timeline (`"mode": "timeline"`; processes, durations)
```json
{ "mode": "timeline", "headline": "Switch EMR Vendors Without Losing Data",
  "steps": [ { "label": "Audit" }, { "label": "Extract" }, { "label": "Validate" }, { "label": "Go live" } ],
  "highlight": 2, "callout": { "title": "6 to 12 weeks" } }
```
- `steps`: 3–6, labels up to ~14 characters. `highlight` is the current step. Optional: `sub` under the headline, a step's `sub` under its label, `callout.text` as the callout's second line (`"Legacy read-only"` in the approved timeline).

## Checklist (`"mode": "checklist"`; how to choose, requirements)
```json
{ "mode": "checklist", "title": "8-Point ERP Checklist", "total": 8,
  "items": [ { "text": "Problems to solve", "done": true }, { "text": "Budget", "done": true },
             { "text": "Deployment model", "done": false }, { "text": "Integrations", "done": false } ] }
```
- `items`: 3–7, each up to ~32 characters. `total` sets the pill ("2 of 8") when the article has more points than you show. Blue only: leave `bg` out (the renderer sets `"blue"`; the light field was deleted in review). It counts as vibrant.

## Prompt (`"mode": "prompt"`; cost, "what is", FAQ)
```json
{ "mode": "prompt", "headline": "EMR Cost by Practice Size", "placeholder": "Practice size", "chips": [],
  "panel": { "label": "Year one", "rows": [
    { "title": "Solo", "sub": "$15K–$30K" }, { "title": "2–5", "sub": "$40K–$150K" }, { "title": "26+", "sub": "$100K–$500K+" } ] } }
```
- `panel.rows`: 3 (they fade, 100% / 72% / 48%), or 2 for a pair. The layout paints its own light-blue field with a strong glow, so `bg` is refused ("BACKGROUND CHECK FAILED"; a `bgPick` too); `"field": "soft"` for a softer one. `chips`: 0–2 (they count toward the 15 words). Headline about 24 characters.
- A row that names a product takes `"logo"`: its real mark in the white 80px tile, in place of the file icon (file icons beside product names read as files). A chip is a string, `{ "label": "…", "logo": "…" }`, or logo-only `{ "logo": "…" }` (the wordmark, 40px tall); never the logo beside the same name.
- **Two big logo rows** (X vs Y on price; RXNT vs DrFirst, image 48, `examples/rxnt-vs-drfirst.prompt.json`): a panel of 2 rows or fewer grows on its own (104px tiles, 70px logos, 40px titles, 30px subs) so it never reads as a missing row. `"even": true` in `panel` keeps every row at full strength (no fade): use it when the rows are equals, like two products.
```json
{ "mode": "prompt", "field": "soft", "headline": "Which Platform Fits?", "placeholder": "E-prescribing price", "chips": [],
  "panel": { "label": "", "even": true, "rows": [
    { "logo": "rxnt.com", "title": "RXNT", "sub": "$665/provider/year" },
    { "logo": "../assets/drfirst-icon.png", "title": "DrFirst", "sub": "From $799/feature/year" } ] } }
```

## Stack (`"mode": "stack"`; one key rule or warning)
```json
{ "mode": "stack", "icon": "ph ph-shield-check", "title": "Switch EMR without losing data",
  "lead": "**Validate every record** before cutover", "items": ["Keep legacy access 6–12 months"] }
```
- The front card fits its text; two cards peek from the top. `**bold**` marks the key phrase. `items`: 1–3 bullets. Light backgrounds by default (`"bg": "blue"` alone is refused: VIBRANT FIT FAILED); the vibrant blue only as the user's pick (`"bg": "blue", "bgPick": true`), since all its text sits in its white card.

## Window (`"mode": "window"`; vendor lists, pricing tables)
```json
{ "mode": "window",
  "list": { "icon": "ph ph-currency-dollar", "heading": "Dynamics 365 vs Acumatica",
            "rows": [ { "title": "Per user", "logo": "microsoft.com" }, { "title": "Unlimited users", "logo": "acumatica.com" } ] },
  "detail": { "question": "50 users, yearly?", "heading": "$48,000 vs $6,396" },
  "bleed": true, "cursor": [1215, 372] }
```
- `rows`: 2–4 (max 5; fewer than 2 is refused with "CONTENT CHECK FAILED"); `detail.points`: 2–3 short ones, or none. A row without a product takes `"icon"` instead of `"logo"`. `"highlight": <row index>` in `list` makes that row the blue anchor. Optional: `list.sub` under the list heading; a row's `sub` under its title and `meta` on its right (e.g. a price, as in `emr-cost-vendor-prices.window.json`); `"window": { "search": "…", "action": "…" }` fills the title bar's search box and button. Works on the vibrant blue (the grid is removed there).

---

# Headline layouts
Six layouts: `versus/pills`, `versus/connect`, `versus/slash`, `versus/duo`, `dark` and `logotype`. They paint their own canvas (leave `bg` out; it is refused, except `logotype`, which takes only `cream`, its default); white ones sit in a grey frame automatically, and none shows the site mark. All their text is Inter 500 Medium (`versus/slash` names: Poppins caps); nothing to set. In every `headline`, `\n` breaks the line; headlines carry no blue words (black on the white layouts, white on the black ones), so don't use `{{ }}` there (it only colours the `versus/slash` names). Keep headlines to the title's own words.

## Versus pills (`"mode": "versus", "variant": "pills"`)
```json
{ "mode": "versus", "variant": "pills", "headline": "Dynamics 365 or\nAcumatica?",
  "left": { "label": "Dynamics 365", "logo": "microsoft.com" }, "right": { "label": "Acumatica", "logo": "acumatica.com" } }
```
- The headline is all black (no `{{ }}` blue). The pills are always the site blue (there is no `color`). Each logo sits on a white circle, so both products need a mark that works on white: a product whose only logo is a solid app tile (e.g. NetSuite) is refused ("PILLS LOGO CHECK FAILED"); use another versus layout. Once per category, at most 2 across the site.

## Versus connect (`"mode": "versus", "variant": "connect"`)
```json
{ "mode": "versus", "variant": "connect", "headline": "NetSuite vs Sage Intacct",
  "left": { "label": "NetSuite", "logo": "netsuite.com" }, "right": { "label": "Sage Intacct", "logo": "sage.com" } }
```
- The headline is all black (no `{{ }}` blue) and sits on one line, sized to fit within 1080px and centred above the divider; a `\n` in it is ignored there. Only a pair too long to read on one line at 72px or more breaks onto two (at your `\n`, or after "vs"), sized within 900px. Each tile is the brand's own app icon in its original colours, filling the tile: the renderer fetches it (Brandfetch icon, so a client ID is needed) or uses a local square icon. A brand without a solid app icon (e.g. SAP, Microsoft, athenahealth) is refused ("CONNECT LOGO CHECK FAILED"); use another versus layout. Check the icon is the brand's current one (Availity's is a stale "25" anniversary badge).
- `"cornerDots": false` drops the two small dot patches in the top corners (the user on the Oracle Health vs MEDITECH connect: "delete these dot grid from top left and top right"). Without it they stay, as in the approved image 10.

## Versus slash (`"mode": "versus", "variant": "slash"`; black, counts as vibrant)
```json
{ "mode": "versus", "variant": "slash",
  "left": { "label": "AdvancedMD", "color": "#FF6A13" }, "right": { "label": "CureMD", "color": "#1E88D6" } }
```
- Every name is **two-tone: white + that side's `color`**, never all one colour. The renderer splits it: several words → the last word is coloured (on its own line); one word → split at its last capital break (`AdvancedMD` → ADVANCED + **MD**, `CureMD` → CURE + **MD**, `NetSuite` → NET + **SUITE**) or before its digits; or mark the coloured part yourself with `{{ }}` (some of the name must stay white). A `\n` in a marked name breaks it at the colour split (`"eClinical\n{{Works}}"`, `"Dynamics\n{{365}}"`) when one line would set it well below the approved size; that is not "made bigger". A one-word name with no capital break (`Acumatica`, `SAP`) is refused ("SLASH NAME CHECK FAILED"): mark it (`"Acu{{matica}}"`) or use the article's fuller name (`"SAP Business One"`).
- `color`: the brand's own colour. Names in caps, auto-sized to fit (the approved size; nothing to set). Short names read best (≤ 10 letters per line).

## Versus duo (`"mode": "versus", "variant": "duo"`; black, counts as vibrant)
```json
{ "mode": "versus", "variant": "duo", "tag": "Imaging comparison", "headline": "Sectra vs Intelerad\nfor Imaging Centers",
  "left": { "label": "Sectra", "logo": "sectra.com" }, "right": { "label": "Intelerad", "logo": "intelerad.com", "color": "#7A1233" } }
```
- Each side's `color` is that brand's own colour (taken from its website or logo); leave it out for the subtle blue. The logo is turned white automatically; a small wordmark is replaced by the name.

## Dark (`"mode": "dark"`; single-product articles; black, counts as vibrant)
```json
{ "mode": "dark", "tag": "ERP review", "headline": "Sage Intacct\nReview", "product": "Sage Intacct", "color": "#00C247", "panelLogo": "sage.com" }
```
- The layout for articles about **one product** (review, pricing, features, "is X worth it"); once per category, at most 3 across the site. An X vs Y title is refused ("FAIRNESS CHECK FAILED").
- `color`: the product's own brand colour when it's vivid and modern; otherwise leave it out (subtle blue). `panelLogo` is the product's domain (or `"../assets/<file>.png"`); it fills both spots automatically: white on the panel, and black `#0A0A0B` on the white tile top-left (the site mark is never shown). `product` is the name shown under the mark.
- `dark` needs a real product logo; never for a topic article (an icon in its place was rejected: "icon is not looking good").

## Logotype (`"mode": "logotype"`; single product with a black logo)
```json
{ "mode": "logotype", "product": "Notion", "logotype": "notion.com" }
```
- Only for a single-product article whose logo is **black** (icon and wordmark) with strong typography; once per category, at most 2 across the site. Coloured logos use `dark`.
- `logotype`: the product's domain (the renderer fetches its full lockup and keeps the black version) or `"../assets/<file>.png"`. The renderer splits the lockup: the icon goes in white on a black rounded tile beside the wordmark (an icon that is already a tile keeps its own); a logo with no separate icon is refused. No other text appears; the heading rule doesn't apply.

---

# Gumloop layouts (user references, approved Oct 2026)
Five layouts after the user's Gumloop references. They paint their own canvas (leave `bg` out; it is refused, except the user's own pick on `versus/type`, `versus/tiles`, `swap` and `badge`, and below on `versus/bento` and `shortlist`: `bgPick`); `"field"` picks the canvas from the layout's approved list (first = default), anything else is refused ("FIELD FIT FAILED"). The Gumloop layouts, `versus/frost` and `versus/bento` take their approved fields; prompt takes only `"soft"`; every other layout takes no `field` (refused). `black` and `blue` count as vibrant (1 in 3, never neighbours). `light` is white in the grey frame (the light mesh on `versus/glass` and `versus/frost`). `versus/glass`, `swap` and `badge` show each brand's full wordmark; `versus/tiles` shows its app icons (or marks on white); `versus/type` shows the names only. The renderer fetches a wordmark (Brandfetch `logo`, both themes, darkest ink kept; a white background is keyed out; pale near-white wordmark text is darkened so it reads), or uses `"../assets/<file>.png"`. A brand without a wordmark is typeset in bold Inter. Previews and approved specs: `examples/*.gumloop-*.json`, `references/approved/18-*.webp` to `27-*.webp`.

## Versus type (`"mode": "versus", "variant": "type"`; field: light)
```json
{ "mode": "versus", "variant": "type", "field": "light", "left": { "label": "Odoo" }, "right": { "label": "Sage Intacct" } }
```
- The names exactly as the article writes them, big and bold; a small "vs" centred between them (`"separator"` replaces the word, here and in glass, frost and bento); the right name takes the accent (`right.color` for a brand colour on the light field). Long pairs stack (name / vs / name). No headline, so the heading rule doesn't apply; the names carry the title. Rejected: the black field; the blue field was deleted in the approved review.

## Versus tiles (`"mode": "versus", "variant": "tiles"`; fields: blue, light)
```json
{ "mode": "versus", "variant": "tiles", "field": "blue", "headline": "AdvancedMD vs athenahealth", "sub": "for Multi-Location Practices",
  "left": { "label": "AdvancedMD", "logo": "advancedmd.com" }, "right": { "label": "athenahealth", "logo": "athenahealth.com" } }
```
- Both tiles share one treatment (user): **both filled** with their brand colour when both brands have a filled app icon (Brandfetch icon or a square app icon in `../assets/`), otherwise **both white** with each brand's mark, which needs both logos to sit on white. A pair that can't match (one brand with only a filled tile, the other with no filled icon) is refused ("TILES LOGO CHECK FAILED"): use versus/type, versus/slash or versus/duo, or versus/glass if both have product wordmarks. `headline` follows the heading rule; `sub` is the title's own angle (optional). Sparse dot field and a faint ring: keep the pattern quiet. The black field was deleted in the approved review.

## Versus glass (`"mode": "versus", "variant": "glass"`; fields: light, black)
```json
{ "mode": "versus", "variant": "glass", "field": "light", "left": { "label": "athenahealth", "logo": "athenahealth.com" }, "right": { "label": "eClinicalWorks", "logo": "../assets/eclinicalworks-wordmark.png" } }
```
- Both wordmarks in their original colours on a frosted bar over a mesh gradient. Best when both brands have strong wordmarks; check each one reads on the light bar. Not on the blue field: the gradient is approved, but not with this illustration.
- The wordmarks must **name the products**: a parent-brand mark alone (SAP for SAP Business One, Microsoft for Dynamics 365, Sage for Sage Intacct) fails Fact QA, so use another versus layout for those. An ultra-wide lockup (over 9:1, e.g. Oracle NetSuite at ~13:1) is refused ("GLASS LOGO CHECK FAILED"): save a compact lockup to assets or use another versus layout. The renderer measures each wordmark's lettering (type, not icon) and sizes both so their lettering matches, inside the bar.

## Swap (`"mode": "swap"`; field: light)
```json
{ "mode": "swap", "field": "light", "left": { "label": "On-premise" }, "right": { "label": "Cloud ERP" } }
```
- Old → new: `left` is the old thing, `right` the new one (soft glow behind it, `right.color` tints the glow). Each side is a wordmark (`logo`) or the article's own words (labels over ~11 characters break onto two lines). For switch/migration, "what is X" (old way → X) and "is X worth it" (in-house → outsourced).
- The labels carry the title's subject ("Old EMR" → "New EMR", not "Old system" → "New system"): swap has no headline.
- Light only: the black field was deleted in the approved review.

## Badge (`"mode": "badge"`; field: light)
```json
{ "mode": "badge", "title": "HIPAA Compliance Software Cost", "value": "$99–$749/mo", "note": { "muted": "Most practices", "strong": "$150–$750" } }
```
- `title` (heading rule applies) or `logo` (a product's wordmark) on top; `value` = the key figure with its unit/qualifier (one figure or range, ≤ ~14 characters); `note` = a muted label + a bold value (or `note.logo`), optional. The figures must agree (F3). `color` tints the box (default blue). Rejected: the blue field.
- Keep `value` to about 12 characters so it stays the dominant line: abbreviate thousands as K ("$15K–$30K"), and keep the qualifier in `note` ("Solo provider" / "First year").

# Originals (Oct 2026, built after the user had seen every other layout)

## Receipt (`"mode": "receipt"`; approved) — cost and pricing articles
```json
{ "mode": "receipt", "headline": "Dermatology\nEMR Cost", "title": "Per provider / month",
  "rows": [ { "name": "Nextech", "value": "$300–$399" }, { "name": "eClinicalWorks", "value": "$499–$599" } ],
  "total": { "label": "Typical", "value": "$250–$900" }, "place": "bottom" }
```
- Headline left (heading rule; semibold 600 black, at most 84px so the receipt stays the hero), a tilted white receipt with a zigzag tear on the right. The bold blue `total` reads as the receipt's summary, so every row must sit INSIDE the total's range (Fact QA F3). Row type auto-fits the longest row. `title` carries the unit. `"place": "bottom"` sets the headline on the total line (the user's pick in batch 4; centred felt off), and `"top"` aligns it with the receipt's top.

## Definition (`"mode": "definition"`; approved) — "what is X" articles
```json
{ "mode": "definition", "term": "EMR Software", "label": "electronic medical record", "definition": "Digital version of a patient's paper chart" }
```
- A dictionary entry on ruled lines (white in the grey frame): `term` (heading rule), `label` = the full form, a blue rule, a numbered one-line `definition` (≤ 7 words, the article's own words). The text is snapped onto the rules. No icon, no logo.

## Shortlist (`"mode": "shortlist"`; approved batch 4) — "best X" lists
```json
{ "mode": "shortlist", "headline": "Best Standalone\nE-Prescribing", "icon": "ph-fill ph-prescription",
  "items": [ { "name": "DrFirst Rcopia" }, { "name": "DoseSpot" }, { "name": "RXNT" } ] }
```
- A tilted notepad on the LEFT (mirrored so it never echoes the receipt), the black semibold headline on the right (heading rule). 3–8 `items` in the article's own order and spelling, numbered 01, 02…; the optional `icon` (Phosphor) sits on a blue sticker fully ON the pad (never over its edge) and is the one blue anchor. Optional `title` = a mono caption at the top of the pad. Item `logo`s only if every item has a clean real mark (taste 2). The "+" grid is under the pad, at the edges only.

## Lineup (`"mode": "lineup"`; approved batch 4) — "best X" lists
```json
{ "mode": "lineup", "cards": [ { "name": "eClinicalWorks", "logo": "../assets/eclinicalworks-folder-mark.png" }, { "name": "DrChrono", "logo": "../assets/drchrono-folder-mark.png" } ] }
```
- The user's reference: one centred row of square white logo tiles (gap ~38% of a tile, logo ~70% of its tile) on a frosted glass bar over the glow field. No headline (no heading check). 3–7 `cards` in one row (7 since Pediatric EHR: "for this use this glass version template"; tiles shrink to fit), logos only, an optional per-card `scale` (0.5–0.8, default 0.7) for a wide, thin mark, every mark the same treatment (open marks on white, trimmed to the same size; never an app tile shrunk into a tile).

## Versus frost (`"mode": "versus", "variant": "frost"`; field: light; approved batch 4)
```json
{ "mode": "versus", "variant": "frost", "left": { "label": "Practice Fusion", "logo": "../assets/practicefusion-mark.png" }, "right": { "label": "athenahealth", "logo": "athenahealth.com" } }
```
- Two 340px frosted-glass tiles on the light mesh, a glass "vs" disc between them, each `label` under its tile in black. No headline. Each mark fills 48% of its tile (was 60%: "the icons are too big and this is why visual balance off"). Each mark must be transparent (a mark with its own white box shows as a white rectangle on glass: cut it from the official transparent lockup) and balanced against its partner by eye (the old 60% matched the Practice Fusion cube to the athenahealth sprout, but both read too big in their tiles). The blue mesh (`"field": "blue"`) was disapproved.

## Versus bento (`"mode": "versus", "variant": "bento"`; field: light; approved batch 4)
```json
{ "mode": "versus", "variant": "bento", "field": "light",
  "left": { "label": "NetSuite", "tag": "Oracle", "icon": "ph ph-cloud", "fact": "Cloud-only" },
  "right": { "label": "SAP Business One", "tag": "SAP", "icon": "ph ph-hard-drives", "fact": "Cloud, on-premise or hybrid" } }
```
- A product-page bento grid: per brand a big name cell (`label`, with an optional mono `tag`, e.g. the owner, from the article), an icon cell (Phosphor `icon` standing for the fact) and a fact cell (`fact`, the article's own words; the same kind of fact for both sides). Both names share one size and both facts share one size. The blue "vs" disc on the seam is the one anchor. Light cells in the white frame with NO pattern ("delete pattern from bg, it looks overwhelming here"). Light only. Use it when the two brands' logos can't match.

# Batch-5 layouts (approved Oct 19–20 2026)
Ten live layouts, each a new arrangement of an approved template (named in brackets), built after the user rejected every prop and device mockup (`versus/plans` and `grid` were retired in the final round). Approved images 36, 37 and 39–46; their specs are in `examples/` (`references/approved/sources.json`). Logos follow the logo chain; leave `bg` out (each card layout has its fit list) unless the user picked one (`bgPick`). A design approved for one article is not rolled out across a batch: each article gets its own design.

## Versus badges (`"mode": "versus", "variant": "badges"`; from badge; image 36)
```json
{ "mode": "versus", "variant": "badges",
  "left": { "label": "TheraNest", "value": "$29–$89/mo", "note": "per therapist" },
  "right": { "label": "Valant", "value": "$100–$300/mo", "note": "per provider" } }
```
- Two columns: each `label` (or its wordmark, with `logo`) on top, its `value` in a blue-tinted value box (one tint for both), the `note` in grey under it (the qualifier); a light "vs" between (`"separator"` replaces the word). `value` on both sides is required ("CONTENT CHECK FAILED"). Keep both values the same kind of figure, with their qualifiers.
- It paints its own canvas (white in the grey frame, sparse dots): no `bg` and no `field`, except the user's pick (light fields only).
- **Hierarchy** (TheraNest vs Valant, image 36: "the heading of theranest and valant are too bold and big, visual hierrachy is not good and balanced"): the approved hierarchy is the default, so the figures lead and the names support them. `nameSize` caps the names (px; default 44), `nameWeight` sets their weight (default 600), `nameInk` their colour (default `#0A0A0B`), `valueSize` caps the figures (px; default 84), and `spread` (default true) moves the two sides out (centres 490 / 1110) with the "vs" centred in the gap between the value boxes; `"spread": false` puts them back at 520 / 1080 with the "vs" at the centre. Leave them out: the options only override the approved look (the old 72 / 700 / 72 look was rejected). Image 36 sets the defaults explicitly:
```json
{ "mode": "versus", "variant": "badges", "bg": "glow", "bgPick": true,
  "nameSize": 44, "nameWeight": 600, "valueSize": 84, "spread": true,
  "left": { "label": "TheraNest", "value": "$29–$89/mo", "note": "per therapist" },
  "right": { "label": "Valant", "value": "$100–$300/mo", "note": "per provider" } }
```

## Versus checks (`"mode": "versus", "variant": "checks"`; from checklist; image 37)
```json
{ "mode": "versus", "variant": "checks", "title": "AAPC Codify vs Find-A-Code",
  "left": { "label": "AAPC Codify", "logo": "aapc.com", "sub": "Certification content" },
  "right": { "label": "Find-A-Code", "logo": "../assets/findacode-mark.png", "sub": "Reimbursement accuracy" } }
```
- A tilted white checklist card: the `title` (required; heading rule), a blue rule, one row per product (logo tile, `label`, `sub` in grey: its strength in the article's words), a tinted card behind. Fits: sky, g5 (never cream). The user picked the vibrant blue for image 37 (`"bg": "blue", "bgPick": true`). Never in the same category as `picks` (both are checklist cards).
- No check boxes by default (image 37, AAPC Codify vs Find-A-Code: "checkboxes are not needed"; a pair is not a to-do list), with the big rows: logo tiles at 104px (mark 72px), names at 36px. Only an explicit `"checks": true` brings the blue check boxes (and the smaller rows) back; `"big": false` keeps the rows small without them. Image 37 sets the defaults explicitly (`"checks": false, "big": true`):
```json
{ "mode": "versus", "variant": "checks", "title": "AAPC Codify vs Find-A-Code", "bg": "blue", "bgPick": true, "checks": false, "big": true,
  "left": { "label": "AAPC Codify", "logo": "aapc.com", "sub": "Certification content" },
  "right": { "label": "Find-A-Code", "logo": "../assets/findacode-mark.png", "sub": "Reimbursement accuracy" } }
```

## Versus lanes (`"mode": "versus", "variant": "lanes"`; from timeline; image 39)
```json
{ "mode": "versus", "variant": "lanes", "headline": "Office Ally vs Claim.MD", "sub": "Starting price per month", "min": 0, "max": 120,
  "left": { "label": "Office Ally", "logo": "../assets/officeally-lineup-mark.png", "points": [0] },
  "right": { "label": "Claim.MD", "logo": "../assets/claimmd-lineup-mark.png", "points": [30, 60, 120] } }
```
- The `headline` (heading rule) and the unit (`sub`) centred on top; a white card with one lane per product: logo tile and `label` on the left, a grey track on one shared scale (`min`, default 0, to `max`, required), a blue stop per price in `points` (required on both sides), a blue span from the lowest to the highest, each stop labelled above it with `prefix` (default `$`) and the number. Fits: cream, sky. It replaced `versus/range` ("i like the design but it is confusing").

## Versus scores (`"mode": "versus", "variant": "scores"`; from versus/type; image 40)
```json
{ "mode": "versus", "variant": "scores", "title": "2025 Best in KLAS overall score",
  "left": { "label": "Oracle Health", "logo": "oracle.com", "score": 64.7 },
  "right": { "label": "MEDITECH", "logo": "../assets/meditech-m-mark.png", "score": 76.3 } }
```
- The metric small and grey on top (`title`, required: it names the source and the measure), then two rows split by a hairline: logo tile, `label` big in black, `score` (required on both sides) very large in the blue gradient. No card and no chart. Fits: sky, paper.
- Both scores must be real numbers (digits, with an optional leading `~`, `$`, `€` or `£` and `.`, `,` or `%`); a word is refused ("CONTENT CHECK FAILED"). The 2026 version had a number only for MEDITECH and "Lowest ranked" for Oracle, and got "ew revert it". When the year the user asks for has no number for both sides, change the metric or keep the year that has both, and say so before rendering.
- Before using it, check the concept: the score must be the article's own lead metric and the one figure it gives for both products ("i love the design but is the concept right?", `taste.md` 19).

## Versus center (`"mode": "versus", "variant": "center"`; from hub; image 41)
```json
{ "mode": "versus", "variant": "center", "label": "Dermatology",
  "left": { "label": "ModMed", "logo": "../assets/modmed-folder-mark.png" },
  "right": { "label": "eClinicalWorks", "logo": "../assets/eclinicalworks-folder-mark.png" } }
```
- Two tilted logo tiles with their names under them; hand-drawn arrows run into one central blue tile carrying `label` (required): the article's angle in its own word (a specialty, an audience). An optional Phosphor `icon` sits above the label; never a stock icon standing for the word (a stethoscope for "dermatology" is clip-art). Per-side `scale` (default 0.66). Fits: cream, paper.

## Spotlight (`"mode": "spotlight"`; from focus; image 42) — "best X" lists
```json
{ "mode": "spotlight", "headline": "Best {{Appointment Reminder}} Software",
  "items": [ { "name": "Weave", "logo": "getweave.com" }, { "name": "Solutionreach", "logo": "../assets/solutionreach-mark.png" },
             { "name": "Luma Health", "logo": "../assets/luma-health-mark.png" } ] }
```
- The centred `headline` (heading rule) with the title's angle in `{{ }}`: the blue selection box with corner handles. Below, a white card bleeding off the bottom with one row per item (logo tile, `name`, and an optional `value` such as a price on the right; without it, a grey skeleton bar), the later rows fading. 3–6 `items`. Fits: sky, g5.

## Picks (`"mode": "picks"`; from checklist; image 43) — "best X" lists
```json
{ "mode": "picks", "title": "Best Systems for Small Hospitals",
  "items": [ { "name": "MEDITECH Expanse" }, { "name": "TruBridge" }, { "name": "Oracle Health" }, { "name": "Epic" } ] }
```
- A tilted white checklist card titled with the heading (`title`, heading rule; it keeps the title's angle), a blue rule, every pick as a checked row in the article's order and spelling, names only; a tinted card behind. 3–7 `items`. Fits: sky, g5. For lists whose logos aren't clean. Never in the same category as `versus/checks`.

## Cloud (`"mode": "cloud"`; from the prompt chips and lineup tiles; image 44) — "best X" lists
```json
{ "mode": "cloud", "headline": "Best Claims Management Software",
  "items": [ { "name": "Waystar", "logo": "../assets/waystar-lineup-mark.png" }, { "name": "Availity", "logo": "../assets/availity-lineup-mark.png" },
             { "name": "Office Ally", "logo": "../assets/officeally-lineup-mark.png" } ] }
```
- The centred `headline` (heading rule), then white logo pills (logo + `name`) in staggered centred rows (two rows for 4–6, three for 7–8). 3–8 `items` with logos. Fits: g5, sky.

## Count (`"mode": "count"`; from stat; image 45) — "N best" lists
```json
{ "mode": "count", "value": "4", "caption": "Best Dermatology Practice Management Software",
  "items": [ { "name": "ModMed", "logo": "../assets/modmed-folder-mark.png" }, { "name": "Nextech", "logo": "../assets/nextech-folder-mark.png" },
             { "name": "eClinicalWorks", "logo": "../assets/eclinicalworks-folder-mark.png" } ] }
```
- The number of picks (`value`, default the number of items) at 250px in the blue gradient on the left, the `caption` (heading rule) under it; a white card on the right with one row per pick (logo tile + `name`). 3–6 `items`. Fits: paper, sky.

## Ranges (`"mode": "ranges"`; from ranked; image 46) — "best X" lists with prices
```json
{ "mode": "ranges", "headline": "Small Practice EMR", "sub": "per provider/month", "max": 1100,
  "rows": [ { "name": "athenahealth", "logo": "../assets/athenahealth-folder-mark.png", "lo": 140, "open": true, "label": "From $140\n+ fee" },
            { "name": "Tebra", "logo": "../assets/tebra-folder-mark.png", "lo": 49, "hi": 799, "label": "$49–799" },
            { "name": "DrChrono", "logo": "../assets/drchrono-folder-mark.png", "lo": 199, "label": "~$199" } ] }
```
- The `headline` (heading rule) and its unit (`sub`) centred on top; a white card of vertical price tracks on one $0–`max` scale (`max` required), one per row, its logo tile under it and its `label` (the price as the article writes it; `\n` breaks it) above it. `lo` + `hi`: a blue bar; `lo` alone: a dot; `"open": true`: a "From" price that fades upward with no solid end (every bar end reads as a figure). 3–6 `rows`. Fits: sky, g5.
- `"bare": true` drops the white card behind the bars and darkens the tracks a step (`#E1E5EC`) so they hold on the field (Small Practice EMR, image 46: "use the previous bg, and in that dont add container for bars section"). Only with the user's white pick, `"bg": "white", "bgPick": true`; anywhere else it is refused ("BACKGROUND CHECK FAILED"), because light grey tracks need their white card on a tinted field. Image 46 (`examples/small-practice-emr.ranges.json`, 5 rows) adds `"bg": "white", "bgPick": true, "bare": true`.

# Batch-6 layouts (approved and delivered Oct 20 2026)
Six live layouts, each an approved part in a new arrangement, approved after the user rejected a beginner look, scattered pieces and one colour everywhere ("it looks like this is designed by a begineer not by a pro experienced designer"; "it looks scattered, it looks like AI slop"). Approved images 49–54; their specs are in `examples/` (`references/approved/sources.json`). Each heading follows the heading rule. Keep the type big and the group tight: these were approved for their restraint (`taste.md` 21–23).

## Glassbar (`"mode": "glassbar"`; approved 24's frosted bar; image 49) — cost: one fact
```json
{ "mode": "glassbar", "headline": "Small Practice EHR Interoperability Cost",
  "label": "Basic integration", "value": "$5K–$15K", "caption": "one-time, one API connection" }
```
- Its own black canvas with a blue glow: the white `headline` (Inter 500), one frosted bar holding `label` (the tier, black) | `value` (its price, in the blue gradient), and the `caption` (the qualifier, optional) in dimmed white under it. `label` and `value` are required ("CONTENT CHECK FAILED"). Approved in round 7 for EHR interoperability cost: "There should be some minimal way for this. Also try using black background".
- It paints its own canvas: no `bg`, no `bgPick`, no `field` (refused). It counts as vibrant (1 in 3 per category, never neighbours).
- One tier only: three tiers (even with two dimmed) were "too much". Keep `value` short (abbreviate thousands as K) so it sets large.

## Figures (`"mode": "figures"`; the versus/scores type; image 50) — cost: two price ranges
```json
{ "mode": "figures", "headline": "E-Prescribing Software Cost", "sub": "per provider per month",
  "rows": [ { "label": "Standalone", "value": "$30–$200" }, { "label": "EMR-bundled", "value": "$200–$600" } ] }
```
- The `headline` and its unit (`sub`) centred on top, then two centred columns, each a `value` large in the blue gradient over its `label` in black, one hairline between. `rows`: 2, each with a `label` and a `value` (fewer is refused, "CONTENT CHECK FAILED"; only the first two are drawn). Both values share one size and one unit.
- Fits: white, sky, paper (white is the default: image 50 was delivered on the white panel the user picked, `"bg": "white", "bgPick": true`).

## Frostrow (`"mode": "frostrow"`; the versus/frost glass tiles; image 51) — "best X" lists with clean logos
```json
{ "mode": "frostrow", "headline": "Best Telehealth for Therapists",
  "items": [ { "name": "Doxy.me", "logo": "doxy.me", "fill": true },
             { "name": "SimplePractice", "logo": "../assets/simplepractice-app-icon.png", "fill": true },
             { "name": "Zoom", "logo": "zoom.us", "fill": true },
             { "name": "VSee", "logo": "../assets/vsee-v-mark.png" }, { "name": "Amwell", "logo": "amwell.com" } ] }
```
- Its own light mesh, the `headline` centred on top, one row of equal frosted glass tiles (one size, one radius) with each `name` under its tile. No numbers ("numbers looks so weird and visually cluttered and unbalanced and corner radius of logo bg is not consistent"). 3–6 `items` with logos ("CONTENT CHECK FAILED" under 3); tiles shrink for 5 and 6.
- `"fill": true` clips a solid app icon to the tile's 22% radius at 48% of the glass tile (approved 51); an open mark sits at 48% of the tile (`scale` to adjust by eye). Name each product as people say it ("it should be just zoom not zoom for healthcare").
- It paints its own mesh over the whole canvas (recorded as "canvas"), so leave `bg` out: a `bg` is refused ("BACKGROUND CHECK FAILED"), and so is a pick ("BACKGROUND PICK FAILED").

## Costgrid (`"mode": "costgrid"`; the bento cells and the blue anchor; image 52) — cost by pricing model
```json
{ "mode": "costgrid", "headline": "Billing Software Cost",
  "cells": [ { "label": "Cloud-based", "value": "$200–$2,000", "unit": "per month" },
             { "label": "On-premise", "value": "$10,000–$100,000", "unit": "upfront" },
             { "label": "Outsourced RCM", "value": "4%–9%", "unit": "of collections" } ] }
```
- The `headline` top-left; the first cell is the tall card in the blue anchor (the article's main model), the next two are white cards stacked beside it, each with its `label`, its `value` big and its `unit` (optional). `cells`: 3, each with a `label` and a `value` ("CONTENT CHECK FAILED" under 3).
- Fits: glow, paper, sky (glow is the default: image 52 was delivered on the glow the user picked).

## Versus fan (`"mode": "versus", "variant": "fan"`; the tilted white card and the "vs" disc; image 53)
```json
{ "mode": "versus", "variant": "fan",
  "left":  { "label": "Tebra", "logo": "../assets/tebra-folder-mark.png", "value": "~$49–$799", "unit": "per provider/month" },
  "right": { "label": "Zocdoc", "logo": "zocdoc.com", "value": "~$35–$100", "unit": "per new patient booking" } }
```
- Two white price cards tilted −4° and +4°, meeting at the blue "vs" disc on the seam; each card its logo tile and `label`, its `value` in the blue gradient right under the name, its `unit` under that. A `value` on both sides is required ("CONTENT CHECK FAILED"); both figures share one size. No headline: the names carry the title. Per side: `fill` for a solid app icon, `scale` (default 0.64).
- Fits: glow, sky, paper, and the vibrant blue (approved on the blue in round 4, BLUE_FIT; no shadows there, and the logo tiles keep a hairline border). Glow is the default: image 53 was delivered on the glow the user picked. "this is fine".

## Versus stacked (`"mode": "versus", "variant": "stacked"`; the fan's parts, stacked; image 54)
```json
{ "mode": "versus", "variant": "stacked",
  "left":  { "label": "symplr", "logo": "../assets/symplr-mark.png", "value": "$50K–$200K+", "unit": "per year" },
  "right": { "label": "Modio Health", "logo": "modiohealth.com", "value": "$50–$125", "unit": "est., per provider/month" } }
```
- Two wide white row cards, one above the other, tilted −2° and −1°; each row its logo tile and `label` on the left, its `value` in the blue gradient with its `unit` right-aligned; the "vs" disc with its white ring on the seam. A `value` on both sides is required ("CONTENT CHECK FAILED"). It handles prices of different scales (a yearly contract against a per-provider fee). No headline. Per side: `fill`, `scale` (default 0.64). Image 54 sets `"texture": false`.
- Fits: glow, mesh, sky (glow is the default: approved on the light mesh, delivered on the glow the user picked). "love it. The concept, visual , everything looks so appealing and perfect": the model to repeat for a pair on price (`taste.md` 20).

Retired (42; listed in `RETIRED` in `layouts.mjs`, not in `LAYOUTS`, refused with "RETIRED LAYOUT", their code and options gone): brandline, folder, versus/scale, versus/chat, versus/split, versus/duet, versus/rows, versus/logos; the batch-5 props versus/compare, versus/search, versus/polaroid, versus/notes, versus/phones, versus/browser, notify, wallet, stickers, letterboard, tags, keycaps; versus/window, versus/range, versus/rings, versus/share, versus/sheet, versus/columns; from the final batch-5 round versus/plans ("i dont like the design, try smth else for comparison"), versus/fit (disapproved), versus/spot (QA: Appointment's spotlight under a new name) and grid ("7 best pediatric shouldnt be like other logos, this looks off"; Pediatric EHR went to `lineup`); from batch 6 steps ("it looks like this is designed by a begineer not by a pro experienced designer"), numbered ("numbers looks so weird and visually cluttered and unbalanced"), versus/pill ("doesnt look like comparison image"), versus/chips and versus/offset ("painfully bad visual design"), versus/halves ("i dont like this it looks off and doesnt match our design vibe"), link, versus/annotate and versus/corners ("it looks scattered, it looks like AI slop"), and poster, versus/glasscards and versus/figures (QA-cut, never shown; the `figures` mode is live). History: `lessons.md`.

## Overrides
- The user's own pick skips ONLY the usage rule (once per category, site-wide caps); every other check still runs, the same-topic rule too. Per slug: reserve it with `!` in `plan.mjs` (`--reserve <slug>=<mode>/<variant>!`), and `render.mjs` honours that reservation for that slug and layout. For a whole call: `--user-pick` (render.mjs and plan.mjs).
- `plan.mjs --brand <brand> --release <slug> ...` drops reservations that were never rendered (rendered and delivered images stay).
- Internal fields (`receiptX`, `seriesPos`, `panelLogoUrl`, and `valueSize` outside `versus/badges`) exist for fine-tuning in the renderer; leave them out of specs.
- Records of delivered designs the user rejected and had replaced carry `"superseded": true` and don't count as used.
