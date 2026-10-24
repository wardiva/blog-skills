# Spec Format

You write one JSON file per article, from the article's own facts. Start from the closest spec in `examples/` (complete and renderable); the snippets below show only each layout's own fields. Top-level fields shared by all layouts:

| Field | Required | Meaning |
|---|---|---|
| `articleTitle` | yes | The blog post's real title (H1). The image heading must reuse its words, shorter ("HEADING CHECK FAILED" otherwise) |
| `brand` | no | Brand file in `brands/` (e.g. `"medsoftwarehub"`). Defaults to `default` |
| `category` | yes | The site's blog category. A spec without one is refused ("CATEGORY MISSING"); the spelling is normalised ("Hospital & Lab Software" = `hospital-and-lab-software`). A layout is used once per category (the usage rule: `SKILL.md`, Layout Decision Framework step 3); the category also drives the vibrant mix and the site mark (1 in 3, never neighbours) |
| `topic` | when shared | Same string for articles on the same subject (e.g. duplicate URLs). They never share a mode |
| `slug` | yes | Output folder name and history key (unique per article) |
| `mode` | no | Card layouts: `before-after` (default), `versus`, `hub`, `focus`, `stat`, `ranked`, `timeline`, `checklist`, `prompt`, `stack`, `window`. Headline layouts: `dark`, `logotype`. Gumloop: `swap`, `badge` (plus the versus variants below). Originals: `receipt`, `definition`, `shortlist`, `lineup`. Batch-5 layouts for best-of lists: `spotlight`, `picks`, `cloud`, `count`, `ranges`. Batch-6 layouts: `figures`, `costgrid`, `glassbar` (cost), `frostrow` (best-of). Batch-7 layouts: `checkcard`, `research`, `squircles`, `bluegrid` (best-of), `flatcard2`, `strike`, `meter` (cost), `typehero` (X vs Y). Batch-8 layouts: `dock`, `darkpanel`, `editorcard`, `tilerow`, `highlight` (best-of), `titlebox`, `bandhero` (cost), `namehero` (one product), `metricrows` (X vs Y on price) |
| `variant` | no | `before-after`: `default`, `flow`. `versus`: `overlap` (default), `table`, the headline variants `pills`, `connect`, `slash`, `duo`, the Gumloop variants `type`, `tiles`, `glass`, the originals `frost`, `bento`, the batch-5 variants `badges`, `checks`, `lanes`, `scores`, `center`, the batch-6 variants `fan`, `stacked`, the batch-7 variants `peecpair`, `inline`, `span`, `duel`, `band`, `glasspair`, and the batch-8 variants `markvs`, `vssquares`, `wordvs`, `capsulevs`, `chipvs`, `darkpills`, `glowmarks`. A `versus` spec without `variant` is `overlap`, so always name the variant. Mode + variant = one layout |
| `bg` | no | Leave it out: the renderer picks the layout's best-fitting background (the batch-6 card layouts lead with the field the user picked for their delivered image: `figures` white, `costgrid`, `versus/fan` and `versus/stacked` glow). Light: `sky`, `paper`, `cream`, `g5`, but only those in the layout's fit list ("Background fit" in the design language); `soft`, `white`, `glow` and `mesh` as the user's pick (`bgPick`) or where a batch-6/7 fit list names them. Vibrant: `"blue"` on at most 1 in 3 images (counting the black layouts), only for `checklist`, `versus/table`, `window`, `before-after/flow`, `versus/fan`. The checklist is blue only: the renderer sets it, and any other `bg` is refused ("CHECKLIST FIELD FAILED"). Refused on every layout that paints its own canvas (`prompt`, the headline layouts except `logotype`, which takes only `cream`, the Gumloop and original layouts, the twelve batch-7 canvas layouts and the 16 batch-8 layouts: "BACKGROUND CHECK FAILED"); prompt's calmer field is `"field": "soft"`. Of the batch-7 card layouts, `strike` fits `glow`, `sky` and `meter` `white` only; neither goes on the blue |
| `canvas` | no | Batch 7 only, and only the one approved field: `versus/span` and `versus/glasspair` `"dunes"` (the deep-dunes blue), `squircles` `"grid"` (the faint grid). Leaving it out paints the same field. Any other value, or `canvas` on any other layout, is refused ("FIELD FIT FAILED": span on black was "change bg, this bg doesnt look good", glasspair on a hand-mixed blue "use our good gradient bg", squircles on Calendly's sky "the gradient looks awful") |
| `glass` | no | `research` only, and only `true` (our light glass; the same as leaving it out). `false`, or `glass` on any other layout, is refused ("FIELD FIT FAILED"; the black version was "for this use our glass bg") |
| `bgPick` | no | `true` = the user picked this `bg` on the picker page (it needs a `bg`; only `true` is valid). It skips the fit list, the blue fit and the canvas refusal, never the vibrant check. Canvas layouts take a pick only on `versus/badges`, `versus/type`, `versus/tiles`, `versus/bento`, `swap`, `badge` and `shortlist` (light fields; blue only on `versus/tiles`); every other canvas layout refuses it ("BACKGROUND PICK FAILED"), and so do `frostrow` (its own mesh covers the canvas), the twelve batch-7 canvas layouts and the 16 batch-8 layouts; `strike` takes a light pick and `meter` white only, also as a pick ("BACKGROUND PICK FAILED: meter has no card behind its tracks"); neither takes the blue. A picked `blue` only on layouts whose text all sits in a white card (`checklist`, `versus/table`, `window`, `before-after/flow`, `versus/checks`, `picks`, `stack`, `versus/fan`, `versus/tiles`). Set by `scripts/bgpick.mjs apply`. Design language 3f |
| `grain` | no | Field grain, on by default for `sky`, `paper`, `g5` and always on `blue`; never on `cream`. `false` turns off both grain layers (field grain and fine overlay) on a light field. Off by default on `versus/peecpair` and `checkcard` (the Peec copies were approved without grain; their examples still say `"grain": false`) |
| `logo` (per item) | no | The product's official domain (e.g. `"odoo.com"`) on hub `cards[]`, versus `left`/`right`, window `list.rows[]`, ranked `rows[]`, stat `card.rows[]`, prompt `panel.rows[]` and `chips[]`, and the `items[]`/`cards[]`/`rows[]`/`left`/`right` of the batch-5, batch-6, batch-7 and batch-8 layouts. The renderer finds the logo itself. Never draw a brand logo: fetch it, cut it from the brand's own logo, or leave it out. When it finds the wrong mark, use a file instead: `"../assets/<file>.png"` (relative to the spec; the official mark saved from the brand's website). `"icon:<domain>"` asks for the brand's square app icon (Brandfetch icon, edge to edge) |
| `scale` (per item) | no | How much of its tile a logo fills, for a wide, thin mark that needs a bigger box to carry equal weight (judge by eye): `lineup` `cards[]` 0.5–0.8 (default 0.7), `hub` logo tiles 0.5–0.8 (default about 0.65), `versus/center` `left`/`right` 0.45–0.8 (default 0.66), `frostrow` `items[]` (default 0.48), `versus/fan` and `versus/stacked` `left`/`right` (default 0.64); batch 7: `research` `cards[]` (default 0.56), `squircles` `items[]` (default 0.52), `versus/glasspair` `left`/`right` (default 0.5) |
| `fill` (per item) | no | `true` = the logo is a solid app icon that becomes the tile itself, edge to edge, clipped to the tile's radius (never an icon's own rounded square inside a white tile: "corner radius of logo bg is not consistent"). On `lineup` `cards[]`, `versus/center` and `versus/fan`/`versus/stacked` `left`/`right`; on `frostrow` `items[]` the icon is clipped to the tile's 22% radius at 48% of the glass tile; batch 7: `research` `cards[]`, `squircles` `items[]`, `bluegrid` `cards[]`, and `typehero`, `versus/inline` and `versus/glasspair` `left`/`right` (inside a frosted tile the icon sits at about half its size) |
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
- `"prefix"` and `"suffix"` (optional) set a unit before or after both scores, so the number stays a plain number: TruBridge in batch 7 used `"suffix": "%"` (7.6% / 21.9%, approved).
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

# Batch-7 layouts (approved and delivered Oct 21–22 2026)
Fourteen live layouts, each in a delivered final (approved images 55–69; their specs are in `examples/`, `references/approved/sources.json`). Most were led by the user's references and browser research (Peec, Dub, Calendly, Databricks), measured and translated to our fields, colours, 22% tile radius and "vs". **Each takes one approved field only**: the twelve canvas layouts refuse `bg` and `bgPick` ("BACKGROUND CHECK FAILED" / "BACKGROUND PICK FAILED") and a `field`; three of them may name their field with `canvas`, and `research` with `glass` (top table); `strike` and `meter` sit on a field. Leave out what the snippet doesn't show. Big object, full stage: keep the type and tiles as big as the snippets render them (`taste.md` 26).

## Checkcard (`"mode": "checkcard"`; the user's Peec checklist; image 55) — "best X" lists, names only
```json
{ "mode": "checkcard", "headline": "Best dental software for small practices",
  "items": [ { "name": "Open Dental" }, { "name": "Curve Dental" }, { "name": "Dentrix" }, { "name": "Eaglesoft" }, { "name": "Denticon" } ],
  "grain": false }
```
- A copy of the user's reference, pixel for pixel ("ss1 exact pixel perfect"): a light grey card with the `headline` (heading rule) as its grey heading line, a nested white card with one row per item (a blue checked box and the `name`), among white rounded cards cropped at the canvas edges. The checkbox is Peec's, measured on the original: box 120, radius 35 (29%), tick M32 59 L48.5 76.5 L91 35, stroke 9, round caps, `#0081FF` ("use exact same checkboxes size and tick icon that was in its inpirsation"). Only the first `max` items are drawn (default 4): image 55 lists five and shows four.
- Its field: the faint grid of white cards on near-white, no grain (the default now; `"grain": false` is kept in the example).

## Flatcard2 (`"mode": "flatcard2"`; the flat card, refined; image 56) — cost: one figure and its qualifier
```json
{ "mode": "flatcard2", "headline": "EHR Implementation Cost", "tag": "Small practice, year one", "value": "$15K–$65K", "handles": true }
```
- One flat white card (~1100px): the `headline` (heading rule), the `value` big in the blue gradient inside a light dashed selection, and a collaboration cursor (blue arrow) whose compact name tag holds `tag`, the figure's qualifier, inside the card ("perfect"). `"handles": true` adds small square handles at the selection's corners, as in a design tool. Keep `value` short (thousands as K).
- Its field: the light glow (its own canvas).

## Research (`"mode": "research"`; Peec's research cover; images 57 and 58) — "best X" lists; a pair
```json
{ "mode": "research", "tag": "Dermatology", "headline": "Best EHR Software\nfor Dermatology Practices",
  "cards": [ { "name": "ModMed EMA", "logo": "../assets/modmed-icon.png" }, { "name": "Nextech", "logo": "../assets/nextech-icon.png" },
             { "name": "Ezderm", "logo": "ezderm.com" }, { "name": "Pabau", "logo": "icon:pabau.com" } ],
  "glass": true }
```
```json
{ "mode": "research", "tag": "Medical Coding", "headline": "Solventum vs Optum",
  "cards": [ { "name": "360 Encompass", "logo": "icon:solventum.com" }, { "name": "EncoderPro", "logo": "../assets/optum-o-mark.png" } ],
  "glass": true, "names": false, "tilt": 8, "tilesTop": 478, "tileSize": 230, "gap": -14 }
```
- A frosted pill with `tag`, the black `headline` (heading rule; `\n` breaks it), one row of frosted white squircle tiles (`cards[]`: `name`, `logo`, `fill`, `scale`), Peec's guide lines in our blue, no dot pattern ("perfect"). Image 57 shows seven picks (150px tiles).
- Two or three cards get bigger tiles (180px) with each name under its tile. For a pair the title already names, `"names": false` drops those names ("delete 360 encompass and encodepro text"), and `tilt` (degrees, alternating, at most 8), `tileSize` (px), `gap` (px; negative overlaps) and `tilesTop` (px from the top) place two tilted tiles that just touch ("make logo close so they touch each other a lil bit and also incrase the sizes"; image 58).
- Its field: our light glass only (`"glass": true` or left out; "for this use our glass bg"). Not vibrant.

## Squircles (`"mode": "squircles"`; the user's Calendly tiles; image 59) — "best X" lists with real marks
```json
{ "mode": "squircles", "headline": "Best Mental Health EHRs\nfor Group Therapy",
  "items": [ { "label": "TherapyNotes", "logo": "../assets/therapynotes-icon.png" },
             { "label": "SimplePractice", "logo": "../assets/simplepractice-app-icon.png", "fill": true },
             { "label": "Valant", "logo": "icon:valant.io", "fill": false, "scale": 0.82 } ],
  "canvas": "grid" }
```
- The black `headline` (heading rule; `\n` breaks it) over one row of big frosted squircle tiles (220px), each mark in its colours (`fill` for a solid app icon, `scale` default 0.52). Five tiles fill the width (image 59); no names.
- Its field: the faint grid only (`"canvas": "grid"` or left out; Calendly's sky: "the gradient looks awful"; the glow was disapproved).

## Bluegrid (`"mode": "bluegrid"`; Databricks' partner cover; image 60) — "best X" lists, vibrant
```json
{ "mode": "bluegrid", "headline": "Best Physical Therapy Software\nfor Multi-Location Clinics",
  "cards": [ { "name": "Raintree", "logo": "icon:raintreeinc.com" }, { "name": "WebPT", "logo": "icon:webpt.com", "fill": true },
             { "name": "Prompt Health", "logo": "promptemr.com" }, { "name": "Jane", "logo": "icon:jane.app", "fill": true } ] }
```
- A flat blue field crossed by white hairline grid lines edge to edge, the `headline` (heading rule) in white, one band of cells, each pick on a white logo tile in its own cell ("i like this layout and design"). Image 60 shows seven.
- Its field: its own blue. Vibrant (1 in 3 per category, never neighbours).

## Typehero (`"mode": "typehero"`; big type and the frosted bar; image 61) — X vs Y, one short answer each
```json
{ "mode": "typehero",
  "left": { "label": "Tecsys", "logo": "tecsys.com", "value": "Multi-hospital", "unit": "networks" },
  "right": { "label": "Cardinal Health", "logo": "icon:cardinalhealth.com", "fill": true, "value": "High-turn", "unit": "supply tracking" } }
```
- "`left.label` vs `right.label`" big in one line (it is the heading, checked against the title), a light grey "vs", then one frosted bar holding each side's logo tile, `value` (blue gradient) and `unit`, split by a hairline. No `headline` key.
- Its field: its light glass canvas.

## Strike (`"mode": "strike"`; image 62) — an advertised price against the real one
```json
{ "mode": "strike", "headline": "Free EHR for Small Practices: Worth It?", "from": "$0", "to": "$100–$500/mo",
  "caption": "typically, with hosting, IT and add-ons", "bg": "glow", "bgPick": true }
```
- One white card: the `headline` (heading rule), `from` in grey with a slanted strike, a blue arrow, `to` big in the blue gradient, and the `caption` (the qualifier) under them ("Love it"). The figure lives in the card (`taste.md` 27).
- Fits: glow (the user's pick for image 62), sky. Never the blue: a `"bg": "blue"` is "VIBRANT FIT FAILED", a picked blue "BACKGROUND PICK FAILED".

## Meter (`"mode": "meter"`; image 63) — cost: two options on one scale
```json
{ "mode": "meter", "headline": "AI Medical Scribe Cost", "sub": "per provider per month", "max": 3000, "lead": 0,
  "rows": [ { "label": "AI scribe", "low": 99, "high": 830, "display": "$99–$830" },
            { "label": "Human scribe", "low": 1000, "high": 3000, "display": "$1,000–$3,000" } ],
  "bg": "white", "bgPick": true }
```
- The `headline` (heading rule) and its unit (`sub`) centred, then one row per option on a shared track from 0 to `max`: its `label` (and a logo tile with `logo`) on the left, a bar from `low` to `high` (a single `low` is a bar from 0), the figure as written (`display`) at the bar. The `lead` row (by index) is the blue gradient, the other muted; without `lead` both bars are blue.
- No card: "delete white container" made bare its only look, so the card is gone from the code and there is no `"bare"` key.
- Fits: white only, also as a pick (an unpicked `bg` of another field is "BACKGROUND FIT FAILED", a picked one "BACKGROUND PICK FAILED: meter has no card behind its tracks"). Never the blue.

## Versus peecpair (`"mode": "versus", "variant": "peecpair"`; the user's Peec "Powered by" cover; image 64)
```json
{ "mode": "versus", "variant": "peecpair", "grain": false, "headline": "Pricing and Features Compared",
  "left": { "label": "SimplePractice", "logo": "../assets/simplepractice-wordmark-black.png" },
  "right": { "label": "TheraNest", "mark": "../assets/ensora-mark.svg", "ink": "#0A0A0B" } }
```
- A near-white field cut by grey hairlines into cells, a white pill on top holding the `headline` (the title's angle; heading rule), and in the middle row each brand's lockup centred on its cell. A side is a full wordmark file (`logo`) or a `mark` with its `label` typed beside it in `ink`, black ("use black color for logo text"); marks keep their colours. `logoWidth` (default 470) sizes the wordmarks; the two lockups read one width ("show some other whose logos width will look equal"; `taste.md` 31). Never a typed name beside its own wordmark.
- Its field: its near-white grid, no grain (the default now).

## Versus inline (`"mode": "versus", "variant": "inline"`; image 65)
```json
{ "mode": "versus", "variant": "inline", "headline": "Which Physical Therapy Software Wins?",
  "left": { "label": "WebPT", "logo": "icon:webpt.com", "fill": true, "wordmark": true, "value": "$99", "unit": "from, per provider/month" },
  "right": { "label": "Jane", "logo": "icon:jane.app", "fill": true, "wordmark": true, "value": "CAD $54", "unit": "from, per month, solo" } }
```
- With `"wordmark": true` (the logo tiles read as the names): the two tiles big at the top, the `headline` (the title's angle; heading rule) in big type under them. Without it: a two-line headline, "[tile] A" and "vs [tile] B", which is then the heading. Under a hairline, each side's `value` in the blue gradient with its `unit`, which keeps the qualifier ("from, per provider/month").
- Its field: its light canvas (the white panel, a faint "+" grid).

## Versus span (`"mode": "versus", "variant": "span"`; image 66) — vibrant
```json
{ "mode": "versus", "variant": "span", "min": 0, "max": 800,
  "left": { "label": "Curve Dental", "logo": "../assets/curve-dental-symbol.png", "value": "$200–$399", "unit": "from, per user/month", "lo": 200, "hi": 399 },
  "right": { "label": "Denticon", "logo": "denticon.com", "value": "$750–$795", "unit": "from, flat rate/month", "lo": 750, "hi": 795 },
  "canvas": "dunes" }
```
- One price axis from `min` (default 0) to `max`; each side on its own lane: logo tile, `label`, `value` and `unit` on one line, its range (`lo` to `hi`) as a white capsule to scale. The axis ends are labelled with `prefix` (default `$`). Only the two ends are drawn (no tick marks). No headline.
- Its field: the deep-dunes blue only (`"canvas": "dunes"` or left out). Vibrant.

## Versus duel (`"mode": "versus", "variant": "duel"`; from Dub; image 67)
```json
{ "mode": "versus", "variant": "duel", "eyebrow": "HIPAA Compliance",
  "left": { "label": "Vanta", "logo": "vanta.com" }, "right": { "label": "Drata", "logo": "drata.com" } }
```
- Two big lockups (logo tile and `label`, up to 120px Inter 600) with a small grey "vs" between, centred; the `eyebrow` (optional: the title's angle) in small mono caps above. Per side: `fill`, `scale`. No headline ("wow love it").
- Its field: a faint square grid with soft lavender and blue corner glows.

## Versus band (`"mode": "versus", "variant": "band"`; Peec's partner cover; image 68) — vibrant
```json
{ "mode": "versus", "variant": "band", "equal": true,
  "left": { "label": "DoseSpot", "logo": "dosespot.com" }, "right": { "label": "RxNT", "logo": "rxnt.com" } }
```
- Plain black, one hairline band full width, both real wordmarks in white with no tile, a small grey "vs" between ("this is perfect"). `"equal": true` sizes the two wordmarks to one width. The wordmarks come from Brandfetch or a local file, as on the Gumloop layouts; a brand without one gets its mark in white beside its typed name. Use it only when both brands have a text wordmark that turns white cleanly. No headline.
- Its field: plain black ("use full black bg"). Vibrant.

## Versus glasspair (`"mode": "versus", "variant": "glasspair"`; the user's Calendly screenshot; image 69) — vibrant
```json
{ "mode": "versus", "variant": "glasspair",
  "left": { "label": "McKesson", "logo": "../assets/mckesson-mark.png", "scale": 0.6 },
  "right": { "label": "PioneerRx", "logo": "../assets/pioneerrx-mark.png", "scale": 0.64 },
  "canvas": "dunes" }
```
- Two big frosted white squircle tiles (400px, 22% radius like `frostrow`: "make the corner radius consistenty"), a small gap between, each mark in its colours (`scale` default 0.5; `fill` for a solid app icon); no text, no headline.
- Its field: the deep-dunes blue only (`"canvas": "dunes"` or left out; "use our good gradient bg"). Vibrant.

# Batch-8 layouts (approved and delivered Oct 24 2026)
Sixteen live layouts, each copied from a reference (the user's own nine, refs 51 and 52, four incident.io covers, one Dub and one Mintlify cover) and approved on one article (images 70–85; the examples are those specs). Each paints **its one approved look**: a `bg` is refused ("BACKGROUND CHECK FAILED"), a pick too ("BACKGROUND PICK FAILED"), and every option the user turned down is refused with "FIELD FIT FAILED" (listed under each layout). The snippets show each layout's own keys; add `articleTitle`, `brand`, `category` and `slug` as in the examples. A comparison shows the two products and a "vs", no figure unless the title is about pricing (`taste.md` 37).

## Versus markvs (`"mode": "versus", "variant": "markvs"`; Dub's "Rebrandly vs" cover; image 70)
```json
{ "mode": "versus", "variant": "markvs",
  "left": { "label": "eClinicalWorks", "logo": "../assets/eclinicalworks-folder-mark.png", "scale": 0.86 },
  "right": { "label": "NextGen", "logo": "../assets/nextgen-folder-mark.png", "scale": 1 } }
```
- Two bare marks (no names on the image; `label` only names the side) at lockup scale with a small "vs" between, on a faint grid. `box` (default 300) sizes each mark's box; `scale` (default 0.9) balances a wide or thin mark. No headline.
- Content: both logos ("CONTENT CHECK FAILED").

## Versus vssquares (`"mode": "versus", "variant": "vssquares"`; the user's img 1; image 71) — vibrant
```json
{ "mode": "versus", "variant": "vssquares",
  "left": { "label": "MEDITECH", "logo": "../assets/meditech-m-mark.png", "scale": 0.8 },
  "right": { "label": "TruBridge", "logo": "../assets/trubridge-bridge-mark.png", "scale": 0.9 } }
```
- Plain black with a very subtle dot grid (white dots at 12%) and dashed guide lines; two 540px squares side by side, the left black with its mark turned white, the right white with its mark turned black, each `label` under its mark, a "vs" disc on the seam. The black square has a dashed edge on its top, left and bottom in the guides' style, so it doesn't blend into the field; no corner ring markers (the user's requests after delivery). Use marks that read as one colour. No headline.
- Content: both logos. Vibrant.

## Namehero (`"mode": "namehero"`; the user's img 2; image 72) — one product, vibrant
```json
{ "mode": "namehero", "kicker": "Is it worth it?", "name": "ModMed" }
```
- The `kicker` and the product's `name` centred in big white caps (the name up to 200px, the kicker about 0.62 of it) on our deep-dunes blue noise ("just name of 1 product in our noise blue gradient bg"). Type is the image (`taste.md` 42). The heading is the kicker and the name together (heading rule), so a spec without `name` is "HEADING CHECK FAILED".
- Vibrant.

## Versus wordvs (`"mode": "versus", "variant": "wordvs"`; the user's img 3; image 73)
```json
{ "mode": "versus", "variant": "wordvs",
  "left": { "label": "Luma Health", "logo": "../assets/luma-health-color-mark.png", "scale": 0.85 },
  "right": { "label": "Phreesia", "logo": "../assets/phreesia-circle.png", "scale": 0.7 } }
```
- Each side as one lockup, its mark in brand colours and its `label` in black, a black "vs" between ("replace x with vs"), on the light dotted-map field with a few blue accent dots. A side with a real wordmark file takes `"wordmark": "<file>"` in place of the mark + name. Names auto-fit (up to ~116px). No headline.
- Content: both logos.

## Versus capsulevs (`"mode": "versus", "variant": "capsulevs"`; the user's img 4; image 74)
```json
{ "mode": "versus", "variant": "capsulevs", "headline": "Medallion vs symplr",
  "left": { "label": "Medallion", "logo": "../assets/medallion-symbol.png" },
  "right": { "label": "symplr", "logo": "../assets/symplr-mark.png" } }
```
- The `headline` on top (heading rule), then one white capsule holding two pale circles with the real marks and a grey "vs" (the reference's "+" replaced). The capsule's pill ends are the reference's own (`taste.md` 35). `scale` per side (default 0.9).
- Content: both logos and the `headline`.

## Titlebox (`"mode": "titlebox"`; the user's img 5; image 75) — any article; cost with no figure
```json
{ "mode": "titlebox", "headline": "Primary Source Verification Cost" }
```
- The `headline` (heading rule) alone, in one long box with our blue border, square corner handles, blue hatching beyond both ends and dotted guides down the sides, on the light dotted-map field. No figure (`taste.md` 41, 42).
- Content: the `headline`.

## Highlight (`"mode": "highlight"`; the user's img 6; image 76) — a title with a key phrase
```json
{ "mode": "highlight", "lead": "Hospital Management Software for", "phrase": "Multi-Hospital Systems" }
```
- The `lead` in black and the `phrase` in our blue-gradient box with square handles and white type, in one line, or two when they are long; on the light dotted-map field. Title only. The heading is `lead` + `phrase` (heading rule).
- Content: the `lead` and the `phrase`.

## Dock (`"mode": "dock"`; the user's img 7, "use glass"; image 77) — "best X" lists
```json
{ "mode": "dock", "headline": "Best Practice Management\nfor Solo Therapists", "count": 7, "lead": 0,
  "items": [ { "name": "SimplePractice", "logo": "../assets/simplepractice-mark.png" }, { "name": "TherapyNotes", "logo": "../assets/therapynotes-mark.png" },
             { "name": "TheraNest", "logo": "../assets/ensora-mark.svg" }, { "name": "ICANotes", "logo": "../assets/icanotes-icon.png" },
             { "name": "Valant", "logo": "../assets/valant-symbol.png" }, { "name": "Sessions Health", "logo": "../assets/sessionshealth-mark.png" },
             { "name": "Jane", "logo": "jane.app" } ] }
```
- The `headline` (heading rule; `\n` breaks it) over one frosted dock holding one real app tile per item, the `lead` tile (by index, default 0) raised and bigger; `fill` for a solid app icon. Our light glass; not vibrant.
- Refused ("FIELD FIT FAILED"): a `count` other than the number of items (the placeholder tiles were never approved; leave `count` out or make it equal).
- Content: 3–7 items.

## Metricrows (`"mode": "metricrows"`; the user's img 8, "pricing comparison"; image 78) — X vs Y on price
```json
{ "mode": "metricrows", "headline": "Eaglesoft vs Dentrix", "max": 400,
  "rows": [ { "label": "Eaglesoft, single user", "amount": 200, "display": "From $200", "unit": "/month" },
            { "label": "Dentrix, single user", "amount": 300, "display": "From $300", "unit": "/month" } ] }
```
- A framed light page: the `headline` (heading rule) over a hairline, then two rows, each its `label` (and a logo tile with `logo`), a split bar (`amount` of `max` in our blue, the rest pale) and the figure as written (`display`, with its qualifier) big in blue with its `unit`. Only for a title about pricing (Eaglesoft vs Dentrix: "Pricing and Features Compared").
- Refused ("FIELD FIT FAILED"): `bars` (the bars are always drawn; the bar-less rows were never approved).
- Content: exactly 2 rows, each with `label`, `display` and a numeric `amount`.

## Darkpanel (`"mode": "darkpanel"`; the user's img 9; image 79) — "best X" and alternatives lists
```json
{ "mode": "darkpanel", "headline": "Change\nHealthcare\nAlternatives", "label": "Best for claims",
  "items": [ { "name": "Waystar", "logo": "../assets/waystar-lineup-mark.png" }, { "name": "Availity", "logo": "../assets/availity-lineup-mark.png" },
             { "name": "Office Ally", "logo": "../assets/officeally-lineup-mark.png" }, { "name": "Claim.MD", "logo": "../assets/claimmd-lineup-mark.png" },
             { "name": "TriZetto", "logo": "../assets/trizetto-mark.png" }, { "name": "Optum", "logo": "../assets/optum-o-mark.png" } ] }
```
- The `headline` (heading rule) big on the left of a light dotted field; a plain black panel bleeding off the right and bottom edges: a blue check with the `label`, then 3–6 picks as rows (logo tile + name) fading downward.
- Content: 3–6 items.

## Editorcard (`"mode": "editorcard"`; Mintlify's editor cover; image 80) — "best X" lists
```json
{ "mode": "editorcard", "headline": "Clinical Decision Support Tools for Hospitals", "lead": 0,
  "items": [ { "name": "Epic", "logo": "../assets/epic-icon.png" }, { "name": "UpToDate", "logo": "../assets/uptodate-mark.png" },
             { "name": "DynaMed", "logo": "../assets/dynamed-d-icon.png" }, { "name": "VisualDx", "logo": "../assets/visualdx-mark.png" } ] }
```
- One white app window on our light field: a title bar with three dots and the `headline` (heading rule) as its tab, then the picks as logo tiles with names in one row; the `lead` tile (by index) in a blue selection with our cursor.
- Content: 3–4 items.

## Versus chipvs (`"mode": "versus", "variant": "chipvs"`; an incident.io cover; image 81)
```json
{ "mode": "versus", "variant": "chipvs",
  "left": { "label": "Clinisys", "logo": "../assets/clinisys-c-mark.png" },
  "right": { "label": "Epic Beaker", "logo": "../assets/epic-icon.png" } }
```
- One white chip tilted −2.5° on a pale lip, holding both real marks and a grey "vs", with a light blue glow behind it; the names as a big two-line title beside it ("A vs" / "B"). `scale` per side (default 0.9). The tilt is the reference's own (`taste.md` 35).
- Content: both logos.

## Tilerow (`"mode": "tilerow"`; an incident.io cover; image 82) — "best X" lists, vibrant
```json
{ "mode": "tilerow", "headline": "Best Telehealth Platforms\nfor Small Practices",
  "items": [ { "name": "Doxy.me", "logo": "../assets/doxyme-mark.png" }, { "name": "SimplePractice", "logo": "../assets/simplepractice-mark.png" },
             { "name": "Zoom", "logo": "icon:zoom.us" }, { "name": "VSee", "logo": "../assets/vsee-v-mark.png" } ] }
```
- Up to 6 frosted tiles (180px, 22% radius), each laid a little over the last, real-colour logos (`fill` for a solid app icon), above the big white `headline` (heading rule; `\n` breaks it), on our blue noise gradient ("use gradient blue noise bg"; `taste.md` 38). The Zoom mark is fetched (`icon:zoom.us`), never drawn.
- Refused ("FIELD FIT FAILED"): `frosted` and `"blue": false` (the light-field versions were turned down).
- Content: 3–6 items. Vibrant.

## Bandhero (`"mode": "bandhero"`; incident.io's "PagerDuty" cover; image 83) — cost: one lead figure
```json
{ "mode": "bandhero", "kicker": "Online Booking Software Cost", "name": "Subscription", "band": "$250–$800", "unit": "/provider/mo" }
```
- The `kicker` small, one big word (`name`), then a full-bleed band in our blue gradient tilted uphill holding the figure (`band`) in white with its `unit`, on the light field. One figure, the article's lead answer (`taste.md` 41). The heading is `kicker` + `name` (heading rule).
- Refused ("FIELD FIT FAILED"): `"waves": true` ("delete the waves from bottom"), `dark` and `bandInk` ("dont use black bg"; the black band was disapproved).
- Content: the `name` and the `band`.

## Versus darkpills (`"mode": "versus", "variant": "darkpills"`; the user's ref 51; image 84) — vibrant
```json
{ "mode": "versus", "variant": "darkpills",
  "left": { "label": "Isabel", "logo": "../assets/isabel-tick-mark.png" },
  "right": { "label": "UpToDate", "logo": "../assets/uptodate-mark.png" } }
```
- Two white pills (real logo + `label` in black) in dark rings, a white "vs" between, on dark grey with faint large grid lines and a band of small squares across the middle. `scale` per side. No headline.
- Refused ("FIELD FIT FAILED"): `light` (the light version was disapproved; a dark reference stays dark, `taste.md` 39). A vibrant neighbour the user knowingly accepts goes with `render.mjs --vibrant-pick`.
- Content: both logos. Vibrant.

## Versus glowmarks (`"mode": "versus", "variant": "glowmarks"`; the user's ref 52; image 85) — vibrant
```json
{ "mode": "versus", "variant": "glowmarks",
  "left": { "label": "BestRx", "logo": "../assets/bestrx-mark.png" },
  "right": { "label": "PrimeRx", "logo": "../assets/primerx-mark.png" } }
```
- Each side its real mark in colour and its `label` in heavy white type, a "vs" between, on black with our blue glow rising from the bottom edge in two humps. `scale` per side. No headline and no prices (BestRx failed four times with prices and passed with none).
- Refused ("FIELD FIT FAILED"): `light` (disapproved). `--vibrant-pick` as for darkpills.
- Content: both logos. Vibrant.

Retired (156; listed in `RETIRED` in `layouts.mjs`, not in `LAYOUTS`, refused with "RETIRED LAYOUT", their code and options gone): brandline, folder, versus/scale, versus/chat, versus/split, versus/duet, versus/rows, versus/logos; the batch-5 props versus/compare, versus/search, versus/polaroid, versus/notes, versus/phones, versus/browser, notify, wallet, stickers, letterboard, tags, keycaps; versus/window, versus/range, versus/rings, versus/share, versus/sheet, versus/columns; from the final batch-5 round versus/plans ("i dont like the design, try smth else for comparison"), versus/fit (disapproved), versus/spot (QA: Appointment's spotlight under a new name) and grid ("7 best pediatric shouldnt be like other logos, this looks off"; Pediatric EHR went to `lineup`); from batch 6 steps ("it looks like this is designed by a begineer not by a pro experienced designer"), numbered ("numbers looks so weird and visually cluttered and unbalanced"), versus/pill ("doesnt look like comparison image"), versus/chips and versus/offset ("painfully bad visual design"), versus/halves ("i dont like this it looks off and doesnt match our design vibe"), link, versus/annotate and versus/corners ("it looks scattered, it looks like AI slop"), and poster, versus/glasscards and versus/figures (QA-cut, never shown; the `figures` mode is live); and from batch 7 (92): in the user's words versus/burst ("disgusting shapes"), versus/underline ("too bad visual"), versus/bubbles ("ew"), versus/delta ("$20 looks so weird bec its so big there is no visula balance at all"), slider ("this layout is borint"), footnote ("too much text"), heroglass ("its too bad not visually appealing at all"), horizon ("i like the shape you used but over alll its too much., not visually apealing at all"), gooey ("ew dont connect and the gradient looks awful"), capsule ("i dont like this rounded it looks weird"), cursorcard ("not tilted rectangle pls also use our bgs"); disapproved with no note (50) tree, bigword, sidecolumn, wordtag, market, estimate, index, horizonrow, tilegrid, iconrows, bluefield, horizon2, sideglow, eclipse, crescent, masthead, cropmarks, bracket, contrast, waffle, notepad, pricebar, spectrum, glowtiles, glasstiles, breakdown, typelist, toppick, arc, track, rating, versus/medallions, versus/profiles, versus/routes, versus/logobar, versus/outline, versus/gap, versus/toggle, versus/eclipses, versus/pricepair, versus/butterfly, versus/venn, versus/bands, versus/ladder, versus/tierchips, versus/lockups, versus/titlecard, versus/sidetiles, versus/aura, versus/iconbadge; approved once and then replaced on every article ("actually delete all of them") flatcard (improved into `flatcard2`), avatars, glassrows, versus/glasssplit, bigtype; and never shown (26) lockupwall, blueprint, plus, aurarow, byline, gridcells, collection, eyebrow, pillstat, fan and bento (modes; `versus/fan` and `versus/bento` are live), editorial, cascade, glassbars, orbit, mosaic, versus/gauges, versus/segbar, versus/pairchips, versus/chipfigures, versus/pillrows, versus/pillduel, versus/vstack, versus/overlap2, versus/tiltcards, versus/chipcloud; and from batch 8 (22): the round-2 Peec and Dub layouts the user never marked chiprow, rankrows, darkbars, darkhbars, logodialog, sourcetable, trio, optioncards, versus/pillvs, versus/planstack, versus/headpeek, versus/splitchart, versus/twocards, versus/stackpair, versus/blackmarks, versus/linkcard, versus/pillpair; with no verdict for four rounds, then "i'll provide inspirations", versus/tiltpair and versus/dimension; and never shown steptiles, versus/filecard, versus/bandcard. History: `lessons.md`.

## Overrides
- The user's own pick skips ONLY the usage rule (once per category, site-wide caps); every other check still runs, the same-topic rule too. Per slug: reserve it with `!` in `plan.mjs` (`--reserve <slug>=<mode>/<variant>!`), and `render.mjs` honours that reservation for that slug and layout. For a whole call: `--user-pick` (render.mjs and plan.mjs).
- A delivered image is redone only when the user asks for it: `render.mjs --redo` lifts only FINAL IMAGE LOCKED, and only for the slug's own delivered image in its own folder ("REDO REFUSED" for a slug never delivered, or another slug's delivered folder); every other check runs, and a redo in the same layout and category is the same image, not a second use. Then finalize it again: a new `finalizedAt`, the earlier dates kept in `previousFinalizedAt`. Never `--force`.
- The user's knowing choice of a vibrant image next to a vibrant neighbour (batch 8: the dark versions of refs 51 and 52): `render.mjs --vibrant-pick` lifts only the VIBRANT CHECK and records `"vibrantPick": true` in the history; every other check runs. It goes on the command, never in the spec. Never `--force`.
- `plan.mjs --brand <brand> --release <slug> ...` drops reservations that were never rendered (rendered and delivered images stay).
- Internal fields (`receiptX`, `seriesPos`, `panelLogoUrl`, and `valueSize` outside `versus/badges`) exist for fine-tuning in the renderer; leave them out of specs.
- Records of delivered designs the user rejected and had replaced carry `"superseded": true` and don't count as used.
