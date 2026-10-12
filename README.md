# Blog Featured Images: a Claude Code skill

Turn blog article URLs into **premium, article-specific featured images** (1600×900 plus crops) in a calm, soft-pastel card style. It's free: everything is rendered with headless Chrome, with **no AI image generation**.

![Example featured images](assets/examples.webp)

Every image:

- **mirrors the blog title** and uses **only the article's own facts**
- is **minimal**: at most 15 words, labels not sentences (enforced)
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
| `sharp` | Image crops and exports | Run `npm install` in the skill's `scripts/` folder (Claude does this on first use) |
| **agent-browser** (recommended) | Reads all article URLs in parallel, in seconds | `npm i -g agent-browser`. It uses your existing Chrome, with no extra browser download |
| **Brandfetch client ID** (optional) | Sharper official logos | Free at [brandfetch.com/developers](https://brandfetch.com/developers). Save it **locally**, never in a repo (see below) |

Save your Brandfetch client ID in `~/.blog-featured-images/config.json`:

```json
{ "brandfetchClientId": "YOUR_CLIENT_ID" }
```

or set the `BRANDFETCH_CLIENT_ID` env var. Without an ID, logos still work through the free Iconify and Simple Icons libraries.

## Use

In Claude Code:

> Make featured images for these articles: https://example.com/blog/post-1/ https://example.com/blog/post-2/

Or invoke `/blog-featured-images` directly. The outputs for each article land in `featured-images/<slug>/`:

| File | Use |
|---|---|
| `master.png` | 1600×900 master |
| `16x9-1200.webp` | Social and OG image |
| `7x5.webp` | Theme crop |
| `card-350x250.png` | Thumbnail check |

---

## How it works

**Three agents, in a fast batch:**

1. **Orchestrator** (Claude):
   - reads every URL at once (`read-articles.mjs`)
   - picks the least-used layout per article and reserves them all (`plan.mjs`)
   - checks each layout can show the article (item count, name length, title words)
2. **Makers** (parallel subagents): write each spec from the article's facts and render it.
3. **QA** (an independent subagent): judges every image on **one contact sheet** of the whole category (`sheet.mjs`): no reused layout, 2-second scan, minimal text, balance, true to the article, logos. Failures go back to their Maker; only images that pass are delivered.

**Built-in guards (the renderer refuses to finish):**

| Check | Rule |
|---|---|
| `HEADING CHECK FAILED` | The image heading must reuse the blog title's own words |
| `TEXT CHECK FAILED` | At most 15 words per image, at most 7 per element (no sentences) |
| `VARIETY CHECK FAILED` | A layout can't repeat in a category until every layout has been used. History is kept per site in `~/.blog-featured-images/history-<brand>.json` |

**Logos** come from a free chain: Brandfetch symbol → Iconify → Simple Icons → Brandfetch icon → letter tile. They're loaded at render time (nothing is downloaded or stored). Add `"logo": "<domain>"` to any named product.

## Layouts (13)

| Mode | Variants | Best for |
|---|---|---|
| `before-after` | `default`, `flow` | How-to, migration, "old way → new way" |
| `versus` | `overlap`, `table` | X vs Y |
| `hub` | default | "Best X" lists (6–7 products with logos) |
| `stat` | default | One headline number |
| `ranked` | default | Rankings by a real metric |
| `timeline` | default | Processes, implementation |
| `checklist` | default | How to choose, requirements |
| `prompt` | default | Cost, pricing, FAQ |
| `stack` | `default`, `split` | One key rule; definitions |
| `window` | default | Vendor lists, pricing tables |

## Add your own site

Copy `brands/_template.json` to `brands/<site>.json` and fill in the site's colours. Then set `"brand": "<site>"` in specs. Variety history is kept separately per brand.

## What's inside

| Path | Contents |
|---|---|
| `SKILL.md` | Hard rules and workflow (Claude reads this first) |
| `references/design-language.md` | The approved visual rulebook: colours, type, balance, text budget, logos, variety |
| `references/agents.md` | Three-agent flow, Maker and QA prompts, QA checklist |
| `references/lessons.md` | What past sessions learned: speed, pre-flight checks, taste |
| `references/spec-format.md` | The JSON spec for every layout |
| `scripts/` | `render.mjs` (renderer + guards), `read-articles.mjs`, `plan.mjs`, `sheet.mjs` |
| `examples/` | One approved spec per layout, all within the 15-word budget |

## Troubleshooting

| Problem | Fix |
|---|---|
| Chrome not found | Set `CHROME` to your Chrome or Edge executable |
| `TEXT CHECK FAILED` | Cut secondary lines first, then shorten phrases to labels |
| `VARIETY CHECK FAILED` | Use one of the layouts it lists. Run `plan.mjs` to see usage |
| Logos are broken or low-res | Add a Brandfetch client ID; check your internet connection (logos load at render time) |
| Parallel renders crash | Update to the latest version (each render now uses its own Chrome profile) |

Logos are trademarks of their owners. They're shown here to identify products in editorial content.
