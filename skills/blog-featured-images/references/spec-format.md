# Spec Format

You write one JSON file per article, from the article's own facts. Start from the closest spec in `examples/` (complete and renderable); the snippets below show only each layout's own fields. Top-level fields shared by all layouts:

| Field | Required | Meaning |
|---|---|---|
| `articleTitle` | yes | The blog post's real title (H1). The image heading must reuse its words, shorter ("HEADING CHECK FAILED" otherwise) |
| `brand` | no | Brand file in `brands/` (e.g. `"medsoftwarehub"`). Defaults to `default` |
| `category` | yes | The site's blog category, used for the vibrant mix and the site mark (1 in 3, never neighbours). Layout rotation is site-wide |
| `topic` | when shared | Same string for articles on the same subject (e.g. duplicate URLs). They never share a mode |
| `slug` | yes | Output folder name and history key (unique per article) |
| `mode` | no | Card layouts: `before-after` (default), `versus`, `hub`, `focus`, `stat`, `ranked`, `timeline`, `checklist`, `prompt`, `stack`, `window`. Headline layouts: `dark`, `logotype`. Gumloop: `swap`, `badge` (plus the versus variants below). Originals: `receipt`, `definition` |
| `variant` | no | `before-after`: `default`, `flow`. `versus`: `overlap` (default), `table`, the headline variants `pills`, `connect`, `slash`, `duo`, and the Gumloop variants `type`, `tiles`, `glass`. Mode + variant = one layout |
| `bg` | no | Leave it out: the renderer picks the layout's best-fitting light background. Light: `sky`, `paper`, `cream`, `g5`, but only those in the layout's fit list ("Background fit" in the design language). Vibrant: `"blue"` on at most 1 in 3 images (counting the black layouts), only for `checklist`, `versus/table`, `window`, `before-after/flow` |
| `grain` | no | Field grain, on by default for `sky`, `paper`, `g5` and always on `blue`; never on `cream`. `false` turns it off on a light field |
| `logo` (per item) | no | The product's official domain (e.g. `"odoo.com"`) on hub `cards[]`, versus `left`/`right`, window `list.rows[]`, ranked `rows[]`, stat `card.rows[]`. The renderer finds the logo itself. When it finds the wrong mark, use a file instead: `"../assets/<file>.png"` (relative to the spec; the official mark saved from the brand's website) |
| `logoStyle` | no | `color` (default), `mono` or `tint`. One style per image |
| `frame` | no | Faint grid + registration squares. On by default for `stat`, `ranked`, `timeline`, `window` (never on blue). `true`/`false` overrides |
| `texture` | no | Thin guide lines at x 210/1390 + a few margin dots. On by default for sky/paper fields and for checklist, ranked, focus, versus, before-after and stack; off where the frame grid is on (never both). `true`/`false` overrides |
| `cursor` | no | `[x, y]`: one pointer cue aimed at the key fact; never covers text |
| `bleed` | no | `window` only: the window runs off the bottom and right edge; words stay inside x 210–1390 |
| `repeatReason` | only for a repeat | Why no unused layout fits this article, when a favourite comes back before every layout has been used (at least 20 characters). Usually set by the orchestrator when reserving (`#reason`); without it a repeat is refused ("VARIETY CHECK FAILED") |
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
- 6 or 7 cards; use 7 for a "7 best" list so the image matches the title.
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
- `value` up to ~8 characters (auto-sized, at most 150px so it never outweighs the card), in a soft blue gradient (`"valueColor": "navy"` or `"blue"` to change it). Card `rows`: 2–4, all in the same unit, and inside the hero's range (a row outside it reads as an error). `card.highlight` picks the blue row; `null` when no row is the hero's subject.

## Ranked (`"mode": "ranked"`; rankings by a real metric)
```json
{ "mode": "ranked", "headline": "How Long ERP Implementation Takes", "winner": 0,
  "rows": [ { "name": "Small business", "value": "2-4 months", "pct": 4 }, { "name": "Mid-market", "value": "4-9 months", "pct": 9 },
            { "name": "Enterprise", "value": "12-24+ months", "pct": 24 } ] }
```
- `rows`: 3–6, names up to ~16 characters. `pct` sets bar length; `winner` is the blue row.

## Timeline (`"mode": "timeline"`; processes, durations)
```json
{ "mode": "timeline", "headline": "Switch EMR Vendors Without Losing Data",
  "steps": [ { "label": "Audit" }, { "label": "Extract" }, { "label": "Validate" }, { "label": "Go live" } ],
  "highlight": 2, "callout": { "title": "6 to 12 weeks" } }
```
- `steps`: 3–6, labels up to ~14 characters. `highlight` is the current step.

## Checklist (`"mode": "checklist"`; how to choose, requirements)
```json
{ "mode": "checklist", "title": "8-Point ERP Checklist", "total": 8,
  "items": [ { "text": "Problems to solve", "done": true }, { "text": "Budget", "done": true },
             { "text": "Deployment model", "done": false }, { "text": "Integrations", "done": false } ] }
```
- `items`: 3–7, each up to ~32 characters. `total` sets the pill ("2 of 8") when the article has more points than you show. Works on the vibrant blue.

## Prompt (`"mode": "prompt"`; cost, "what is", FAQ)
```json
{ "mode": "prompt", "headline": "EMR Cost by Practice Size", "placeholder": "Practice size", "chips": [],
  "panel": { "label": "Year one", "rows": [
    { "title": "Solo", "sub": "$15K–$30K" }, { "title": "2–5", "sub": "$40K–$150K" }, { "title": "26+", "sub": "$100K–$500K+" } ] } }
```
- `panel.rows`: exactly 3 (they fade). The layout paints its own light-blue field with a strong glow; `"field": "soft"` for a softer one. `chips`: 0–2 (they count toward the 15 words). Headline about 24 characters.

## Stack (`"mode": "stack"`; one key rule or warning)
```json
{ "mode": "stack", "icon": "ph ph-shield-check", "title": "Switch EMR without losing data",
  "lead": "**Validate every record** before cutover", "items": ["Keep legacy access 6–12 months"] }
```
- The front card fits its text; two cards peek from the top. `**bold**` marks the key phrase. `items`: 1–3 bullets. Light backgrounds only (its blue icon tile is too much blue on the vibrant field).

## Window (`"mode": "window"`; vendor lists, pricing tables)
```json
{ "mode": "window",
  "list": { "icon": "ph ph-currency-dollar", "heading": "Dynamics 365 vs Acumatica",
            "rows": [ { "title": "Per user", "logo": "microsoft.com" }, { "title": "Unlimited users", "logo": "acumatica.com" } ] },
  "detail": { "question": "50 users, yearly?", "heading": "$48,000 vs $6,396" },
  "bleed": true, "cursor": [1215, 372] }
```
- `rows`: 2–4 (max 5; fewer than 2 is refused with "CONTENT CHECK FAILED"); `detail.points`: 2–3 short ones, or none. A row without a product takes `"icon"` instead of `"logo"`. `"highlight": <row index>` in `list` makes that row the blue anchor. Works on the vibrant blue (the grid is removed there).

---

# Headline layouts
Six layouts: `versus/pills`, `versus/connect`, `versus/slash`, `versus/duo`, `dark` and `logotype`. They paint their own canvas (`bg` is ignored); white ones sit in a grey frame automatically, and none shows the site mark. All their text is Inter 500 Medium (`versus/slash` names: Poppins caps); nothing to set. In every `headline`, `\n` breaks the line; headlines carry no blue words (near-black on the white layouts, white on the black ones), so don't use `{{ }}` there (it only colours the `versus/slash` names). Keep headlines to the title's own words.

## Versus pills (`"mode": "versus", "variant": "pills"`)
```json
{ "mode": "versus", "variant": "pills", "headline": "Dynamics 365 or\nAcumatica?",
  "left": { "label": "Dynamics 365", "logo": "microsoft.com" }, "right": { "label": "Acumatica", "logo": "acumatica.com" } }
```
- The headline is all near-black (no `{{ }}` blue). Each logo sits on a white circle, so both products need a mark that works on white: a product whose only logo is a solid app tile (e.g. NetSuite) is refused ("PILLS LOGO CHECK FAILED"); use another versus layout. May repeat up to 2 times across the site, each repeat with a reason.

## Versus connect (`"mode": "versus", "variant": "connect"`)
```json
{ "mode": "versus", "variant": "connect", "headline": "NetSuite vs\nSage Intacct",
  "left": { "label": "NetSuite", "logo": "netsuite.com" }, "right": { "label": "Sage Intacct", "logo": "sage.com" } }
```
- The headline is all near-black (no `{{ }}` blue). Each tile is the brand's own app icon in its original colours, filling the tile: the renderer fetches it (Brandfetch icon, so a client ID is needed) or uses a local square icon. A brand without a solid app icon (e.g. SAP, Microsoft, athenahealth) is refused ("CONNECT LOGO CHECK FAILED"); use another versus layout. Check the icon is the brand's current one (Availity's is a stale "25" anniversary badge).

## Versus slash (`"mode": "versus", "variant": "slash"`; black, counts as vibrant)
```json
{ "mode": "versus", "variant": "slash",
  "left": { "label": "AdvancedMD", "color": "#FF6A13" }, "right": { "label": "CureMD", "color": "#1E88D6" } }
```
- Every name is **two-tone: white + that side's `color`**, never all one colour. The renderer splits it: several words → the last word is coloured (on its own line); one word → split at its last capital break (`AdvancedMD` → ADVANCED + **MD**, `CureMD` → CURE + **MD**, `NetSuite` → NET + **SUITE**); or mark the coloured part yourself with `{{ }}` (some of the name must stay white). A one-word name with no capital break (`Acumatica`, `SAP`) is refused ("SLASH NAME CHECK FAILED"): mark it (`"Acu{{matica}}"`) or use the article's fuller name (`"SAP Business One"`).
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
- The layout for articles about **one product** (review, pricing, features, "is X worth it"); may repeat up to 3 times across the site, each repeat with a reason. An X vs Y title is refused ("FAIRNESS CHECK FAILED").
- `color`: the product's own brand colour when it's vivid and modern; otherwise leave it out (subtle blue). `panelLogo` is the product's domain (or `"../assets/<file>.png"`); it fills both spots automatically: white on the panel, and black `#0A0A0B` on the white tile top-left (the site mark is never shown). `product` is the name shown under the mark.

- A topic article with no single product (e.g. "What is EMR software") uses `"panelIcon": "ph ph-file-text"` (any Phosphor class) instead of `panelLogo`: black on the white tile top-left, large and white on the panel, in the site blue unless `color` is set. Never the site mark.
## Logotype (`"mode": "logotype"`; single product with a black logo)
```json
{ "mode": "logotype", "product": "Notion", "logotype": "notion.com" }
```
- Only for a single-product article whose logo is **black** (icon and wordmark) with strong typography; may repeat up to 2 times across the site, each repeat with a reason. Coloured logos use `dark`.
- `logotype`: the product's domain (the renderer fetches its full lockup and keeps the black version) or `"../assets/<file>.png"`. The renderer splits the lockup: the icon goes in white on a black rounded tile beside the wordmark (an icon that is already a tile keeps its own); a logo with no separate icon is refused. No other text appears; the heading rule doesn't apply.

---

# Gumloop layouts (user references, approved Oct 2026)
Five layouts after the user's Gumloop references. They paint their own canvas (`bg` is ignored); `"field"` picks the canvas from the layout's approved list (first = default), anything else is refused ("FIELD FIT FAILED"). `black` and `blue` count as vibrant (1 in 3, never neighbours). `light` is white in the grey frame. Logos are each brand's full **wordmark** (icon + typography): the renderer fetches it (Brandfetch `logo`, both themes, darkest ink kept; a white background is keyed out; pale near-white wordmark text is darkened so it reads), or uses `"../assets/<file>.png"`. A brand without a wordmark is typeset in bold Inter. Previews and approved specs: `examples/*.gumloop-*.json`, `references/approved/18-*.webp` to `27-*.webp`.

## Versus type (`"mode": "versus", "variant": "type"`; fields: light, blue)
```json
{ "mode": "versus", "variant": "type", "field": "light", "left": { "label": "Odoo" }, "right": { "label": "Sage Intacct" } }
```
- The names exactly as the article writes them, big and bold; a small "vs" centred between them; the right name takes the accent (`right.color` for a brand colour on the light field). Long pairs stack (name / vs / name). No headline, so the heading rule doesn't apply; the names carry the title. Rejected: the black field.

## Versus tiles (`"mode": "versus", "variant": "tiles"`; fields: blue, black, light)
```json
{ "mode": "versus", "variant": "tiles", "field": "blue", "headline": "AdvancedMD vs athenahealth", "sub": "for Multi-Location Practices",
  "left": { "label": "AdvancedMD", "logo": "advancedmd.com" }, "right": { "label": "athenahealth", "logo": "athenahealth.com" } }
```
- Both tiles share one treatment (user): **both filled** with their brand colour when both brands have a filled app icon (Brandfetch icon or a square app icon in `../assets/`), otherwise **both white** with each brand's mark, which needs both logos to sit on white. A pair that can't match (one brand with only a filled tile, the other with no filled icon) is refused ("TILES LOGO CHECK FAILED"): use versus/type, versus/glass, versus/slash or versus/duo. `headline` follows the heading rule; `sub` is the title's own angle (optional). Sparse dot field and a faint ring: keep the pattern quiet.

## Versus glass (`"mode": "versus", "variant": "glass"`; fields: light, black)
```json
{ "mode": "versus", "variant": "glass", "field": "light", "left": { "label": "athenahealth", "logo": "athenahealth.com" }, "right": { "label": "eClinicalWorks", "logo": "../assets/eclinicalworks-wordmark.png" } }
```
- Both wordmarks in their original colours on a frosted bar over a mesh gradient. Best when both brands have strong wordmarks; check each one reads on the light bar. Not on the blue field: the gradient is approved, but not with this illustration.
- The wordmarks must **name the products**: a parent-brand mark alone (SAP for SAP Business One, Microsoft for Dynamics 365, Sage for Sage Intacct) fails Fact QA, so use another versus layout for those. An ultra-wide lockup (over 9:1, e.g. Oracle NetSuite at ~13:1) is refused ("GLASS LOGO CHECK FAILED"): save a compact lockup to assets or use another versus layout. The renderer measures each wordmark's lettering (type, not icon) and sizes both so their lettering matches, inside the bar.

## Swap (`"mode": "swap"`; fields: light, black)
```json
{ "mode": "swap", "field": "black", "left": { "label": "On-premise" }, "right": { "label": "Cloud ERP" } }
```
- Old → new: `left` is the old thing, `right` the new one (soft glow behind it, `right.color` tints the glow). Each side is a wordmark (`logo`) or the article's own words (labels over ~11 characters break onto two lines). For switch/migration, "what is X" (old way → X) and "is X worth it" (in-house → outsourced).
- The labels carry the title's subject ("Old EMR" → "New EMR", not "Old system" → "New system"): swap has no headline.

## Badge (`"mode": "badge"`; field: light)
```json
{ "mode": "badge", "title": "HIPAA Compliance Software Cost", "value": "$99–$749/mo", "note": { "muted": "Most practices", "strong": "$150–$750" } }
```
- `title` (heading rule applies) or `logo` (a product's wordmark) on top; `value` = the key figure with its unit/qualifier (one figure or range, ≤ ~14 characters); `note` = a muted label + a bold value (or `note.logo`), optional. The figures must agree (F3). `color` tints the box (default blue). Rejected: the blue field.
- Keep `value` to about 12 characters so it stays the dominant line: abbreviate thousands as K ("$15K–$30K"), and keep the qualifier in `note` ("Solo provider" / "First year").

## Brandline (retired)
The user rejected a background with only a headline. The mode is not in `layouts.mjs`; its glow field waits for a layout with a real illustration.

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
{ "mode": "lineup", "glass": "bar", "cards": [ { "name": "eClinicalWorks", "logo": "../assets/eclinicalworks-folder-mark.png" }, { "name": "DrChrono", "logo": "../assets/drchrono-folder-mark.png" } ] }
```
- The user's reference: one centred row of square white logo tiles (gap ~38% of a tile, logo ~70% of its tile) on a frosted glass bar over the glow field. No headline (no heading check). 3–6 `cards`, logos only, every mark the same treatment (open marks on white, trimmed to the same size; never an app tile shrunk into a tile). `"glass": "tiles"` (each tile frosted) exists but wasn't picked. Never set `watermark`: the user asked to delete the faint shape behind the row.

## Versus frost (`"mode": "versus", "variant": "frost"`; field: light; approved batch 4)
```json
{ "mode": "versus", "variant": "frost", "left": { "label": "Practice Fusion", "logo": "../assets/practicefusion-mark.png" }, "right": { "label": "athenahealth", "logo": "athenahealth.com" } }
```
- Two 340px frosted-glass tiles on the light mesh, a glass "vs" disc between them, each `label` under its tile in black. No headline. Each mark must be transparent (a mark with its own white box shows as a white rectangle on glass: cut it from the official transparent lockup) and balanced against its partner by eye (the Practice Fusion cube needed ~60% of the tile width to match the athenahealth sprout). The blue mesh (`"field": "blue"`) was disapproved.

## Retired in batch 4
- `folder` (an app folder of logo tiles): "I like the background, the glass effect and the logos, but not the layout". Its pieces live on in `lineup`.
- `versus/scale` (a balance scale holding both logos): "looks like a law illustration, the concept is so bad". No clip-art metaphors.
- Both stay in render.mjs for reference, but they're not in `layouts.mjs`, so they can't be planned.

## Versus split / duet (built, out of the rotation)
The user passed on both twice, so they're not in `layouts.mjs` and the renderer refuses them. Re-enable only if the user asks:
- split: the canvas split into the two brands' colours (`left.color`, `right.color`), white wordmarks or names, a white "vs" seal; counts as vibrant.
- duet: two soft brand-tinted halves, each with a white card holding the full-colour wordmark (or the name); light.
- The user passed on both for NetSuite vs SAP and for Clinisys vs CGM: don't offer them unless the user asks.

## Overrides
- `--user-pick` (render.mjs and plan.mjs): the user chose this layout for this article; skips ONLY the rotation rule. Every other check still runs.
- Records of delivered designs the user rejected and had replaced carry `"superseded": true` and don't count toward rotation.
