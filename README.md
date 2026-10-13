# Blog Featured Images: a Claude Code skill

Turn blog article URLs into **premium, article-specific featured images** (1600×900 plus crops) in a calm, crisp card style. It's free: everything renders with headless Chrome, with **no AI image generation**.

![Example featured images](assets/examples.webp)

*The finalized reference set: six light images and one vibrant. The same 7 images ship in `references/approved/`, and the renderer's defaults reproduce this look.*

Every image:
- **mirrors the blog title** and uses **only the article's own facts**
- is **minimal**: at most 15 words, labels not sentences (enforced)
- is **never bland**: one bold blue anchor, structure tied to the frame, a big hero
- **looks different** from every other image in the same category (enforced)
- shows **real product logos** where products are named
- is **checked by an independent QA agent** before you see it

---

## Install

```bash
npx skills add https://github.com/wardiva/blog-skills --skill blog-featured-images
```

Add `-g` to install it for all your projects.

## One-time setup

| Need | Why | How |
|---|---|---|
| **Node 18+** and **Chrome or Edge** | Renders the images | Set the `CHROME` env var if Chrome isn't found automatically |
| `sharp` | Crops and exports | Run `npm install` in the skill's `scripts/` folder (Claude does this on first use) |
| **agent-browser** (recommended) | Reads every article URL in parallel, in seconds | `npm i -g agent-browser`. It uses your existing Chrome; without it, Claude falls back to WebFetch |
| **Brandfetch client ID** (optional) | Sharper official logos | Free at [brandfetch.com/developers](https://brandfetch.com/developers). Keep it **local**, never in a repo |

Save your Brandfetch client ID in `~/.blog-featured-images/config.json`:

```json
{ "brandfetchClientId": "YOUR_CLIENT_ID" }
```

or set the `BRANDFETCH_CLIENT_ID` env var. Without an ID, logos still work through the free Iconify and Simple Icons libraries.

## Use

In Claude Code:

> Make featured images for these articles: https://example.com/blog/post-1/ https://example.com/blog/post-2/

Or invoke `/blog-featured-images`. Each article gets a `featured-images/<slug>/` folder:

| File | Use |
|---|---|
| `master.png` | 1600×900 master |
| `16x9-1200.webp` | Social and OG image |
| `7x5.webp` | Theme crop |
| `card-350x250.png` | Thumbnail check |

---

## How it works

**Three agents, in one fast batch:**

1. **Orchestrator** (Claude):
   - reads every URL at once (`read-articles.mjs`)
   - picks the least-used layout per article and reserves them all (`plan.mjs`)
   - checks each layout fits the article (item count, name length, title words)
2. **Makers** (parallel subagents): write each spec from the article's facts and render it.
3. **QA** (an independent subagent): judges the whole batch on one contact sheet (`sheet.mjs`): no reused layout, 2-second scan, minimal text, not bland, balanced, true to the article, clean logos. Failures go back to their Maker; only images that pass are delivered.

**Built-in checks** (the renderer refuses to finish):

| Check | Rule |
|---|---|
| `HEADING CHECK FAILED` | The image heading must reuse the blog title's own words |
| `TEXT CHECK FAILED` | At most 15 words per image and 7 per element (no sentences) |
| `VARIETY CHECK FAILED` | A layout can't repeat in a category until every layout has been used (history per site in `~/.blog-featured-images/history-<brand>.json`) |
| `SERIES CHECK FAILED` | The optional site mark appears on at most 1 in 3 images per category, never on neighbours |
| `VIBRANT CHECK FAILED` | The vibrant blue appears on at most 1 in 3 images per category, never on neighbours |
| `BACKGROUND CHECK FAILED` | Only `sky`, `paper`, `cream`, `g5` and `blue` exist |
| `VIBRANT FIT FAILED` | Only checklist, stack, versus/table, versus/overlap and window go on the vibrant blue |
| `BACKGROUND FIT FAILED` | Each layout only takes the light backgrounds that flatter its illustration (e.g. no grey bars on grey `paper`) |

**Look:**
- **Never bland:** one bold blue anchor (a selection box, VS badge, checked box or active bar), thin guide lines on the safe edges (no busy dot patterns), and a hero at least about 60% of the width.
- **Backgrounds:** light `sky`, `paper`, `cream` or `g5` (rotating), plus the vibrant **deep-dunes blue** with grain on about 1 in 3 images (only with big-white-card layouts). `g5` has fine grain too.
- **Logos:** a free chain (Brandfetch symbol → Iconify → Simple Icons → Brandfetch icon → letter tile), loaded at render time with nothing stored. Add `"logo": "<domain>"` to any named product.
- **Optional craft kit** (`"craft": true`): near-black ink, monospace uppercase labels, grey "off" states, line-icon tiles, clean connectors, and an occasional site mark + series tag (`PRICING`, `COMPARISON`, `GUIDE`).

## Layouts (11 modes, 14 layouts)

| Mode | Variants | Best for |
|---|---|---|
| `before-after` | `default`, `flow` | How-to, migration, "old way → new way" |
| `versus` | `overlap`, `table`, `logos` | X vs Y |
| `hub` | default | "Best X" lists (6–7 product logos, logos only) |
| `focus` | default | One key idea with 2–3 values (costs by tier) |
| `stat` | default | One headline number |
| `ranked` | default | Rankings by a real metric |
| `timeline` | default | Processes, implementation |
| `checklist` | default | How to choose, requirements |
| `prompt` | default | Cost, pricing, FAQ |
| `stack` | default | One key rule; definitions |
| `window` | default | Vendor lists, pricing tables |

## Add your own site

Copy `brands/_template.json` to `brands/<site>.json`, fill in the site's colours, and optionally `markUrl` (the site's own square icon) and `markName` for the site mark. Then set `"brand": "<site>"` in specs. Variety history is kept separately per brand.

## What's inside

| Path | Contents |
|---|---|
| `SKILL.md` | Hard rules and workflow (Claude reads this first) |
| `references/approved/` | The 7 finalized reference images: the target look |
| `references/design-language.md` | The approved visual rulebook: final look, colours, type, balance, text budget, logos, anti-bland, craft spec, rejected looks |
| `references/agents.md` | Three-agent flow, Maker and QA prompts, QA checklist |
| `references/lessons.md` | What past sessions learned: speed, pre-flight checks, taste |
| `references/spec-format.md` | The JSON spec for every layout |
| `scripts/` | `render.mjs` (renderer + checks), `read-articles.mjs`, `plan.mjs`, `sheet.mjs` |
| `examples/` | Approved specs, all within the 15-word budget |

## Troubleshooting

| Problem | Fix |
|---|---|
| Chrome not found | Set `CHROME` to your Chrome or Edge executable |
| `TEXT CHECK FAILED` | Cut secondary lines first, then shorten phrases to labels |
| `VARIETY CHECK FAILED` | Use one of the listed layouts. Run `plan.mjs` to see usage; if every layout is used, add a variant |
| `SERIES CHECK FAILED` | Remove `"series"`; the mark was used on a neighbouring image |
| Logos are broken or low-res | Add a Brandfetch client ID and check your connection (logos load at render time) |
| An article URL fails to load | The reader retries once; run it again or paste the article text |

Logos are trademarks of their owners and are shown to identify products in editorial content.
