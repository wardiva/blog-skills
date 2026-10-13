# Spec format

One JSON file per article. Top-level fields shared by all modes:

| Field | Required | Meaning |
|---|---|---|
| `articleTitle` | yes | The blog post's real title (H1). The image heading must reuse its words, shorter. See "Heading rule" in design-language.md |
| `brand` | no | Brand file name in `brands/` (e.g. `"medsoftwarehub"`). Defaults to `default` |
| `category` | yes | The site's blog category. The variety ledger never repeats a recent mode within it |
| `topic` | when shared | Same string for articles on the same subject (e.g. duplicate URLs). They can never share a mode |
| `slug` | yes | Output folder name and ledger key (unique per article) |
| `mode` | no | `before-after` (default), `versus`, `prompt`, `hub`, `stack`, `window`, `timeline`, `checklist`, `stat`, `ranked` |
| `variant` | no | Layout variant of the mode. Today `versus` has `overlap` (default), `table` and `logos`; `stack` has `default` and `split`; `before-after` has `default` and `flow`. The variety check counts mode + variant as one layout |
| `logo` (per item) | no | The product's domain, e.g. `"odoo.com"`, on hub `cards[]`, versus `left`/`right`, window `list.rows[]`, ranked `rows[]` and stat `card.rows[]`. Renders the logo beside the name via the free logo chain (Brandfetch symbol → Iconify → Simple Icons → Brandfetch icon → lettermark) |
| `logoStyle` | no | `color` (default, user-approved), `mono` or `tint`. One style for the whole image |
| `bg` | no | `blue` (vibrant near-flat brand blue; at most 1 in 3 per category), `sky` (B, crisp, texture on), `wash` (A, approved warm wash), `cool`, `white`, `flat`. Leave it out to auto-rotate |
| `texture` | no | Anti-bland structure layer (dot patches, guide lines at x 210/1390, accent dots). On by default for `sky`; set `true` to add it to `wash` (option A). Never with the frame grid |
| `craft` | no | `true` = the craft kit: near-black ink, mono caps labels, grey off-states, line-icon tiles, clean connector |
| `series` | no | With `craft`: the site mark + mono series tag (e.g. `"Pricing"`). Only on some images: at most 1 in 3 per category, never on neighbours ("SERIES CHECK FAILED") |
| `dots` | no | Texture dot patches: `none` (default, user-approved), `subtle`, `full`. The guide lines and margin dots stay either way |
| `anchor` | no | Colour of the one bold element (e.g. the focus selection box): `blue` (default, blue gradient + white text) or `navy` |
| `frame` | no | Faint grid plus registration squares. On by default only for `stat`, `ranked`, `timeline` and `window`; off for the rest. `true` or `false` overrides. Use it only where it fits the vibe |
| `cursor` | no | `[x, y]`: a pointer cue at that position. It must point at the key fact and never cover text |
| `bleed` | no | `window` mode only: the window runs off the bottom and right edge, Base44 style |

**Text budget: 15 visible words per image and max 7 words per element, enforced by the renderer ("TEXT CHECK FAILED").** **Text limits keep things readable at 350×250.** Bullets up to ~32 characters, labels up to ~18, headlines up to ~24. If a line wraps in the render, shorten it.

---

## Before → After (default; how-to, migration, transformation)
```json
{ "brand": "medsoftwarehub",
  "before": { "label": "Old EMR export", "lines": ["ALVAREZ, M · 1968", "PCN · METF 500"] },
  "after":  { "label": "New EMR", "heading": "Maria Alvarez · Patient overview",
              "items": ["Allergy: Penicillin", "Medication: Metformin 500 mg", "Last A1C: 6.9%, verified"] },
  "legend": ["From your old EMR", "Mapped and verified"] }
```
- `before.lines`: 1–3 short, "raw" lines (the messy starting state).
- `after.items`: 2–4 bullets. The first bullet is dark (the key point) and the rest are muted.
- **Variant `"flow"`** (old way → new way, e.g. on-premise → cloud): a muted dashed "before" card with an icon → hand-drawn arrow → a lifted "after" card with a blue icon tile and checked items. Add `before.icon` and `after.icon` (Phosphor classes, e.g. `"ph ph-hard-drives"`, `"ph-fill ph-cloud"`). `before.lines`: 1–2 short caps; `after.items`: 2 short items. Icons carry the meaning, so keep text tiny. User-approved (cloud ERP, 2026-10-13).

## Versus (`"mode": "versus"`; X vs Y)
```json
{ "brand": "medsoftwarehub", "mode": "versus",
  "dimensions": ["Pricing", "Users", "Strength"],
  "left":  { "label": "Dynamics 365", "heading": "Business Central",
             "items": ["$80 per user / month", "Paid per seat", "Teams and Outlook"] },
  "right": { "label": "Acumatica", "heading": "Cloud ERP",
             "items": ["From $6,396 per year", "Unlimited users", "Low-code, open APIs"] },
  "legend": ["Priced per seat", "Priced by transactions"] }
```
- Renders as **two tilted, overlapping cards** with a blue **VS** badge on the seam. `label` is the product name above each card, `heading` the plan line, and `items` 2–3 facts (up to ~22 characters each so nothing wraps). `items[0]` is the key fact (dark on the left, blue on the right). Use the same dimensions on both sides, in the same order.
- `legend[0]` and `legend[1]` name the key difference.
- `"variant": "logos"` (Mintlify-style "A × B" lockup): two large logo tiles, the VS badge, the names, and one fact chip each: `"left": {"label": "NetSuite", "logo": "netsuite.com", "fact": "$999/mo base fee"}`. One contrast only, about 11 words. Badge-style logos are scaled down so both tiles carry similar weight.
- `"variant": "table"` renders one comparison table card instead: `dimensions` become its row labels (up to ~12 characters, e.g. "Per user/mo"), and `legend` is optional. Leave the legend out when it would repeat a row (minimal rule).

## Focus (`"mode": "focus"`; one key idea + a few values; Mintlify-inspired)
```json
{ "mode": "focus", "headline": "EMR cost by {{practice size}}", "label": "Year one", "highlight": 1,
  "rows": [ { "name": "Solo", "value": "$15K–$30K", "pct": 30 }, { "name": "2–5", "value": "$40K–$150K", "pct": 150 },
            { "name": "26+", "value": "$100K–$500K+", "pct": 500 } ] }
```
- A centred, light-weight headline (the title's words). `{{ }}` puts the key phrase in a blue **selection box** with corner handles.
- Below it, a UI card running off the bottom edge: up to 3 real rows (`name` ≤ ~6 characters, `value` ≤ ~12, `pct` = bar length) plus 3 faded **skeleton rows** that add zero words. `highlight` is the blue row.

## Prompt (`"mode": "prompt"`; cost, pricing, "what is", FAQ)
```json
{ "brand": "medsoftwarehub", "mode": "prompt",
  "panel": { "label": "Year-one EMR cost", "rows": [
    { "title": "Solo provider", "sub": "$15,000 to $30,000" },
    { "title": "2 to 5 providers", "sub": "$40,000 to $150,000" },
    { "title": "26+ providers", "sub": "$100,000 to $500,000+" } ] },
  "headline": "EMR Cost by Practice Size",
  "placeholder": "Your practice size",
  "chips": ["Solo", "2 to 5 providers"] }
```
- `panel.rows`: exactly 3 rows (they fade from top to bottom). `chips`: 1–2 short options.
- `headline` is auto-sized (max 76px, about 760px wide). Keep it to about 24 characters so it stays large enough to read.

## Hub (`"mode": "hub"`; "best X" lists, integrations, ecosystems)
```json
{ "brand": "medsoftwarehub", "mode": "hub", "hubIcon": "ph-fill ph-storefront",
  "cards": [
    { "name": "NetSuite", "sub": "$999/mo base" }, { "name": "SAP Business One", "sub": "From $95/user" },
    { "name": "Dynamics 365", "sub": "$80/user/mo" }, { "name": "Acumatica", "sub": "From $6,396/yr" },
    { "name": "Odoo", "sub": "$24.90/user/mo" }, { "name": "Sage Intacct", "sub": "From $15K/yr" } ] }
```
- 6 or 7 cards (use 7 for a "7 best" list, so the image matches the title): names up to ~17 characters. **Cards show names only.** `sub` is ignored unless `"showSubs": true`, which you set only when the second line is the article's point.
- Optional `"hubLabel": { "big": "7", "small": "Best ERP" }` replaces the icon on the blue tile. Use it to carry the title's key words (the hub has no headline).
- `hubIcon` is any Phosphor class (https://phosphoricons.com), e.g. `ph-fill ph-heartbeat`, `ph-fill ph-graduation-cap`, `ph-fill ph-shield-check`.

## Stack (`"mode": "stack"`; one key rule or warning)
```json
{ "mode": "stack", "icon": "ph ph-shield-check", "title": "Before you switch EMR vendors",
  "lead": "Extract and **validate every record** before you cut off the old system.",
  "items": ["Keep read-only legacy access for 6 to 12 months", "Scanned documents may not transfer cleanly"] }
```
- `lead` is up to ~80 characters. `**bold**` marks the key phrase (shown in blue). `items` holds 1–3 bullets.
- **Variant `"split"`** (definitions, "what is X", who-does-what): instead of `items`, set `"split": [{"label": "You", "text": "Log in through a browser"}, {"label": "Vendor", "text": "Patches and backups"}]`. The card's bottom half becomes two columns (the right one tinted blue), and the back cards fan to the lower right. Column text up to ~22 characters. Add `"logo": "<domain>"` to a column when it names a product (e.g. NetSuite | SAP Business One); prefer this over a text-only split.

## Window (`"mode": "window"`; vendor lists, pricing tables)
```json
{ "mode": "window", "window": { "search": "Search EMR vendors", "action": "Compare" },
  "list": { "icon": "ph ph-currency-dollar", "heading": "EMR pricing", "sub": "Per provider, per month",
            "rows": [ { "title": "DrChrono", "sub": "Base tier", "meta": "$30" } ] },
  "detail": { "question": "What does a 2 to 5 provider practice pay?", "heading": "$40K to $150K in year one",
              "points": ["Implementation: $5K to $20K", "Training: $1K to $5K"] } }
```
- `rows` holds up to 5 items. `points` holds 2–4 items.
- A row without a product takes `"icon": "<Phosphor class>"` (e.g. `ph ph-hard-drives`) instead of the letter avatar; it adds no words. `"highlight": <row index>` inside `list` renders that row as the blue-gradient anchor (white text). Use one highlight when the window has no other blue element.
- Keep it minimal: 3–4 `rows` and 2–3 short `points` (see "Minimal rule"). `bleed` is optional and keeps detail text inside x 1390.

## Timeline (`"mode": "timeline"`; processes, implementation, durations)
```json
{ "mode": "timeline", "headline": "Six steps to a safe EMR switch", "sub": "No record leaves the old system until it is validated",
  "steps": [ { "label": "Audit", "sub": "Count records" }, { "label": "Validate", "sub": "Spot-check charts" }, { "label": "Go live", "sub": "Decommission" } ],
  "highlight": 1, "callout": { "title": "6 to 12 weeks", "text": "Typical migration, planning to completion" } }
```
- `steps` holds 3–6 items, each label up to ~14 characters. `highlight` is the index of the step to emphasise.

## Checklist (`"mode": "checklist"`; how to choose, requirements)
```json
{ "mode": "checklist", "title": "Small business ERP check",
  "items": [ { "text": "Cost per user vs volume", "done": true }, { "text": "Core modules you need today", "done": false } ] }
```
- `items` holds 3–7 entries, each up to ~32 characters. Set `"total": 8` when the article has more points than you show (the pill then reads "3 of 8" with only 4 rows). The first unchecked item is shown as "current".

## Stat (`"mode": "stat"`; one headline number)
```json
{ "mode": "stat", "value": "$48,000", "caption": "a year to license 50 users on Business Central",
  "sub": "Before implementation, which adds $25,000 to $80,000",
  "card": { "heading": "Starting price", "rows": [ { "name": "Dynamics 365", "value": "$48,000/yr", "pct": 48000 },
                                                 { "name": "Acumatica base", "value": "$6,396/yr", "pct": 6396 } ] } }
```
- `value` is up to ~8 characters and is auto-sized. `card.highlight` picks the blue row (default 0); set it to `null` when no card row is the hero's subject, so the hero stays the only accent. Card `rows` holds 2–4 items; `pct` is the raw number used to size the bars.

## Ranked (`"mode": "ranked"`; rankings by a real metric)
```json
{ "mode": "ranked", "headline": "Cheapest EMRs per provider", "sub": "Published monthly prices, 2026", "winner": 0,
  "rows": [ { "name": "DrChrono", "value": "$30/mo", "pct": 30 }, { "name": "SimplePractice", "value": "$49+/mo", "pct": 49 } ] }
```
- `rows` holds 3–6 items, names up to ~16 characters. `pct` sets bar length. `winner` is the highlighted row.
