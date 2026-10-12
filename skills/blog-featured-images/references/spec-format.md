# Spec format

One JSON file per article. Top-level fields shared by all modes:

| Field | Required | Meaning |
|---|---|---|
| `brand` | no | Brand file name in `brands/` (e.g. `"medsoftwarehub"`). Defaults to `default` |
| `slug` | no | Output folder name. Defaults to the spec file name |
| `mode` | no | Composition: omit for **before/after**, or `"versus"`, `"prompt"`, `"hub"` |

**Text limits keep things readable at 350×250.** Bullets up to ~32 characters, labels up to ~18, headlines up to ~24. If a line wraps in the render, shorten it.

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

## Versus (`"mode": "versus"`; X vs Y)
```json
{ "brand": "medsoftwarehub", "mode": "versus",
  "left":  { "label": "Dynamics 365", "heading": "Business Central",
             "items": ["$80 per user / month", "Native Teams and Outlook", "Up to 200 companies"] },
  "right": { "label": "Acumatica", "heading": "Cloud ERP",
             "items": ["Unlimited users, usage-based", "From $6,396 per year", "Low-code, open APIs"] },
  "legend": ["Priced per seat", "Priced by transactions"] }
```
- Use the same 3 dimensions on both sides, in the same order. The legend names the core difference.

## Prompt (`"mode": "prompt"`; cost, pricing, "what is", FAQ)
```json
{ "brand": "medsoftwarehub", "mode": "prompt",
  "panel": { "label": "Year-one EMR cost", "rows": [
    { "title": "Solo provider", "sub": "$15,000 to $30,000" },
    { "title": "2 to 5 providers", "sub": "$40,000 to $150,000" },
    { "title": "26+ providers", "sub": "$100,000 to $500,000+" } ] },
  "headline": "What EMR really costs",
  "placeholder": "Your practice size",
  "chips": ["Solo", "2 to 5 providers"] }
```
- `panel.rows`: exactly 3 rows (they fade from top to bottom). `chips`: 1–2 short options.

## Hub (`"mode": "hub"`; "best X" lists, integrations, ecosystems)
```json
{ "brand": "medsoftwarehub", "mode": "hub", "hubIcon": "ph-fill ph-storefront",
  "cards": [
    { "name": "NetSuite", "sub": "$999/mo base" }, { "name": "SAP Business One", "sub": "From $95/user" },
    { "name": "Dynamics 365", "sub": "$80/user/mo" }, { "name": "Acumatica", "sub": "From $6,396/yr" },
    { "name": "Odoo", "sub": "$24.90/user/mo" }, { "name": "Sage Intacct", "sub": "From $15K/yr" } ] }
```
- Exactly 6 cards: names up to ~17 characters, `sub` is one fact.
- `hubIcon` is any Phosphor class (https://phosphoricons.com), e.g. `ph-fill ph-heartbeat`, `ph-fill ph-graduation-cap`, `ph-fill ph-shield-check`.
