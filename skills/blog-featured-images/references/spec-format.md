# Spec format

One JSON file per article. Top-level fields shared by all layouts:

| Field | Required | Meaning |
|---|---|---|
| `articleTitle` | yes | The blog post's real title (H1). The image heading must reuse its words, shorter ("HEADING CHECK FAILED" otherwise) |
| `brand` | no | Brand file in `brands/` (e.g. `"medsoftwarehub"`). Defaults to `default` |
| `category` | yes | The site's blog category; layouts rotate within it |
| `topic` | when shared | Same string for articles on the same subject (e.g. duplicate URLs). They never share a mode |
| `slug` | yes | Output folder name and history key (unique per article) |
| `mode` | no | Card layouts: `before-after` (default), `versus`, `hub`, `focus`, `stat`, `ranked`, `timeline`, `checklist`, `prompt`, `stack`, `window`. Headline layout: `dark` |
| `variant` | no | `before-after`: `default`, `flow`. `versus`: `overlap` (default), `table`, `logos`, and the headline variants `pills`, `connect`, `slash`. Mode + variant = one layout |
| `bg` | no | Leave it out: the renderer picks the layout's best-fitting light background. Light: `sky`, `paper`, `cream`, `g5`, but only those in the layout's fit list ("Background fit" in the design language). Vibrant: `"blue"` on about 1 in 3 images, only for `checklist`, `versus/table`, `window`, `before-after/flow` |
| `grain` | no | Field grain, on everywhere by default. `false` turns it off on a light field (never on blue) |
| `logo` (per item) | no | The product's official domain (e.g. `"odoo.com"`) on hub `cards[]`, versus `left`/`right`, window `list.rows[]`, ranked `rows[]`, stat `card.rows[]`. The renderer finds the logo itself |
| `logoStyle` | no | `color` (default), `mono` or `tint`. One style per image |
| `frame` | no | Faint grid + registration squares. On by default for `stat`, `ranked`, `timeline`, `window` (never on blue). `true`/`false` overrides |
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
- **`logos`**: two large logo tiles, the VS badge, the names and one fact chip each: `"left": {"label": "NetSuite", "logo": "netsuite.com", "fact": "$999/mo base fee"}`. One contrast, about 11 words. Light backgrounds only.

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
- `value` up to ~8 characters (auto-sized). Card `rows`: 2–4, all in the same unit. `card.highlight` picks the blue row; `null` when no row is the hero's subject.

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
- `panel.rows`: exactly 3 (they fade). `chips`: 0–2 (they count toward the 15 words). Headline about 24 characters.

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
  "bleed": true, "cursor": [1400, 470] }
```
- `rows`: 3–4 (max 5); `detail.points`: 2–3 short ones, or none. A row without a product takes `"icon"` instead of `"logo"`. `"highlight": <row index>` in `list` makes that row the blue anchor. Works on the vibrant blue (the grid is removed there).

---

# Headline layouts (after Chatbase)
Four layouts: `versus/pills`, `versus/connect`, `versus/slash` and `dark`. They paint their own canvas (`bg` is ignored); white ones sit in a grey frame automatically. In every `headline`, `{{ }}` marks the key phrase (blue) and `\n` breaks the line. Keep headlines to the title's own words.


## Versus pills (`"mode": "versus", "variant": "pills"`)
```json
{ "mode": "versus", "variant": "pills", "headline": "NetSuite or\n{{SAP Business One?}}",
  "left": { "label": "NetSuite", "logo": "netsuite.com" }, "right": { "label": "SAP Business One", "logo": "sap.com" } }
```

## Versus connect (`"mode": "versus", "variant": "connect"`)
```json
{ "mode": "versus", "variant": "connect", "headline": "{{NetSuite vs}}\nSAP Business One",
  "left": { "label": "NetSuite", "logo": "netsuite.com" }, "right": { "label": "SAP Business One", "logo": "sap.com" } }
```

## Versus slash (`"mode": "versus", "variant": "slash"`; black, counts as vibrant)
```json
{ "mode": "versus", "variant": "slash",
  "left": { "label": "Dynamics\n{{365}}", "color": "#3D7BFF" }, "right": { "label": "Acumatica", "color": "#36C5F0" } }
```
- Names in caps; the `{{ }}` part takes that side's `color` (without markup: the last word, or the whole single word). Short names read best (≤ 10 letters per line).


## Dark (`"mode": "dark"`; black, counts as vibrant)
```json
{ "mode": "dark", "tag": "ERP comparison", "headline": "Odoo vs\nSage Intacct", "color": "#00C247", "panelLogo": "sage.com" }
```
- `color`: the product's own brand colour when it's vivid and modern; otherwise leave it out (subtle blue). The panel logo is shown in white (Simple Icons); set `panelLogoUrl` for a brand Simple Icons lacks.
