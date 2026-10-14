# Blog Featured Images: a Claude Code skill

Turn blog article URLs into **premium, article-specific featured images** (1600×900 plus crops) in three families plus two originals: calm card layouts on grainy light backgrounds (plus a vibrant deep-blue field), Chatbase-style headline layouts for comparisons (facing pills, connected logos, black slash, black duo panels) and single products (black + brand colour, or a black logo on cream), Gumloop-style layouts (bold type vs, tilted app-icon tiles, a frosted wordmark bar, a switch arrow, a figure badge), and two originals (a receipt for costs, a dictionary entry for "what is"). It's free: everything renders with headless Chrome, with **no AI image generation**.

![Example featured images](assets/examples.webp)

*A selection from the finalized reference set: card layouts (top), the six headline layouts (middle) and the Gumloop layouts (bottom). The same images ship in `references/approved/`, and the renderer's defaults reproduce this look.*

Every image:
- **mirrors the blog title** and uses **only the article's own facts**
- is **minimal**: at most 15 words, labels not sentences (enforced)
- sits on a **background chosen to flatter its illustration** (enforced)
- **looks different** from every other image on the site; an illustration repeats only when nothing unused fits, with the reason written down (enforced)
- shows **real, balanced product logos** where products are named
- is **checked by two independent QA agents** side by side, one for looks (visual appeal is a hard gate) and one for facts

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

**Four roles, in one fast batch** (an agent never both makes and approves an image):

1. **Orchestrator** (Claude): reads every URL at once (`read-articles.mjs`), checks which logo-dependent layouts each brand can use (`logo-check.mjs`), picks the least-used layout per article and which ones go on the vibrant blue, and reserves them all (`plan.mjs`).
2. **Makers** (parallel subagents): write each spec from the article's facts and render it.
3. **Visual QA** (an independent subagent): judges the whole batch on one contact sheet (`sheet.mjs`): visually appealing, background fits, no reused layout, 2-second scan, minimal, balanced, clean logos.
4. **Fact QA** (an independent subagent, running at the same time): checks every word and number against the article text: the heading mirrors the title, every figure keeps its qualifier, nothing contradicts or is invented.

Failures go back to their own Maker and are re-checked only by the QA agent that failed them; an image is delivered only when both pass.

5. **Finalize** (`finalize.mjs`): delivered images become permanent. They stay stored (plus a copy in `~/.blog-featured-images/delivered/`), keep counting for layout rotation, and can never be re-created or overwritten.

**Built-in checks** (the renderer refuses to finish):

| Check | Rule |
|---|---|
| `HEADING CHECK FAILED` | The image heading must reuse the blog title's own words |
| `TEXT CHECK FAILED` | At most 15 words per image and 7 per element (no sentences) |
| `VARIETY CHECK FAILED` | A layout can't repeat anywhere on the site until every layout has been used; a favourite may come back earlier only with a written reason, within its limit |
| `BACKGROUND FIT FAILED` | Each layout only takes the light backgrounds that flatter its illustration |
| `BACKGROUND CHECK FAILED` | Only `sky`, `paper`, `cream`, `g5` and `blue` exist |
| `VIBRANT CHECK FAILED` | Vibrant images (the deep-dunes blue and the black layouts) appear on at most 1 in 3 images per category, never on neighbours |
| `CONNECT LOGO CHECK FAILED` | `versus/connect` needs each brand's own app icon (with its background colour); otherwise use another versus layout |
| `SLASH NAME CHECK FAILED` | A `versus/slash` name must be white + its brand colour; a one-word name with no capital break needs its coloured part marked |
| `PILLS LOGO CHECK FAILED` | `versus/pills` needs logos that sit on white; a brand with only a solid app icon uses another versus layout |
| `LOGOTYPE CHECK FAILED` | `logotype` needs a black logo with a separate icon; coloured logos use `dark` |
| `VIBRANT FIT FAILED` | Only checklist, versus/table, window and before-after/flow go on the vibrant blue |
| `SERIES CHECK FAILED` | The optional site mark appears on at most 1 in 3 images per category, never on neighbours |
| `FIELD FIT FAILED` | A Gumloop layout only takes its approved fields |
| `TILES LOGO CHECK FAILED` / `GLASS LOGO CHECK FAILED` | `versus/tiles` needs two tiles that match (both filled or both white); `versus/glass` needs wordmarks that fit the bar |
| `LOGO FILE MISSING` | A logo file named in the spec isn't in `featured-images/assets/` |
| `FINAL IMAGE LOCKED` | A delivered image is permanent: it can't be re-created or overwritten |
| `CONTENT CHECK FAILED` | Each layout needs enough real facts to fill its frame |
| `FAIRNESS CHECK FAILED` | An X vs Y article always shows both products |

**The look:**
- **Backgrounds:** light `sky`, `paper`, `cream`, `g5`, each picked to flatter its illustration (e.g. a big blue tile gets a neutral field, grey bars get sky), plus the vibrant **"deep dunes" blue**, only behind a big white card (blue and black images together on at most 1 in 3 per category).
- **Grain:** heavy on the blue, fine on `sky`, `paper` and `g5`; `cream` stays clean, with no grain.
- **Shadows follow the background:** none on the blue or black, minimal and tinted on light fields.
- **One bold blue anchor**, white UI cards, semibold card headlines (black on focus and receipt, navy on the others; near-black or white on headline layouts, Inter Medium), a hero at 55–70% of the width.
- **Logos:** a free chain (Brandfetch symbol → Iconify → Simple Icons → Brandfetch icon → letter tile), loaded at render time. Logos fill ~65% of their tile, app icons fill the tile, pale marks are darkened, and "best of" hubs show logos only. A wrong mark can be replaced by the official file in `featured-images/assets/`.

## Layouts (17 modes, 26 layouts)

**Card layouts:**

| Mode | Variants | Best for | On the vibrant blue |
|---|---|---|---|
| `before-after` | `default`, `flow` | How-to, migration, "old way → new way" | `flow` only |
| `versus` | `overlap`, `table` | X vs Y | `table` only |
| `hub` | default | "Best X" lists (6–7 product logos, logos only) | no |
| `focus` | default | One key idea with 2–3 values | no |
| `stat` | default | One headline number | no |
| `ranked` | default | Rankings by a real metric | no |
| `timeline` | default | Processes, implementation | no |
| `checklist` | default | How to choose, requirements | yes |
| `prompt` | default | Cost, pricing, FAQ | no |
| `stack` | default | One key rule | no |
| `window` | default | Vendor lists, pricing tables | yes |

**Headline layouts** (after Chatbase: Inter Medium type, subtle vivid blue shapes, white designs in a grey frame, three on black, one on cream; no site mark):

| Layout | Best for |
|---|---|
| `versus/pills` | X vs Y: two facing pills (flat outer cuts, subtle gradient with fine noise) with the logos on white circles, the question below in black; only when both logos work on white; up to 2 across the site, each repeat with a reason |
| `versus/connect` | X vs Y: each brand's own app icon in its original colours, linked to a VS circle, black headline; only when both brands have an app icon (a favourite: may repeat up to 5 times across the site, each repeat with a reason) |
| `versus/slash` | X vs Y on black: bold names, each white + its brand colour, italic VS (a favourite: may repeat up to 5 times across the site, each repeat with a reason) |
| `versus/duo` | X vs Y on black: two panels in each brand's colour with white logos (a favourite: may repeat up to 5 times across the site, each repeat with a reason) |
| `dark` | Single-product articles (review, pricing, features): the product's icon in black on a white tile top-left, its colour as the panel, white logo; up to 3 across the site, each repeat with a reason |
| `logotype` | Single-product articles with a black logo: icon on a black tile beside the wordmark, on cream with a faint grid; up to 2 across the site, each repeat with a reason |

**Gumloop layouts** (after the user's Gumloop references; each has its own approved fields, set with `"field"`; black and blue fields count as vibrant; logos are each brand's full wordmark):

| Layout | Best for | Fields |
|---|---|---|
| `versus/type` | X vs Y as big bold names with a small centred "vs" on a faint "+" grid | light, blue |
| `versus/tiles` | X vs Y with two tilted tiles, both filled with brand colour or both white, above the headline | blue, black, light |
| `versus/glass` | X vs Y with both full wordmarks on a frosted glass bar over a mesh gradient | light, black |
| `swap` | Switch, migration, "old way → new way": old → dashed loop arrow → new | light, black |
| `badge` | Cost and stat articles: the key figure in a tinted rounded box | light |

**Originals** (light, white in the grey frame):

| Layout | Best for |
|---|---|
| `receipt` | Cost and pricing articles: a big headline and a tilted receipt listing the article's prices with a bold total |
| `definition` | "What is X" articles: a dictionary entry with the term, its full form and a one-line definition |

## Add your own site

Copy `brands/_template.json` to `brands/<site>.json`, fill in the site's colours, and optionally `markUrl` (the site's own square icon) and `markName` for the site mark (card layouts only). Then set `"brand": "<site>"` in specs. Variety history is kept separately per brand.

## What's inside

| Path | Contents |
|---|---|
| `SKILL.md` | Hard rules, layouts and workflow (Claude reads this first) |
| `references/approved/` | The finalized reference images: the target look |
| `references/design-language.md` | The rulebook: visual appeal, backgrounds and fit, shadows, layouts, text budget, logos, guardrails |
| `references/spec-format.md` | The JSON spec for every layout (snippets show each layout's own fields; `examples/` has complete, renderable specs) |
| `references/agents.md` | The four roles (job, steps, prompt, limits), the fast-batch flow, the Visual and Fact checklists |
| `references/taste.md` | The user's taste as principles (each tied to the note that taught it) and the Self-Critique every image passes |
| `references/lessons.md` | Speed tools, gotchas, pre-flight checks |
| `scripts/` | `render.mjs` (renderer + checks), `layouts.mjs` (the layout list), `read-articles.mjs`, `plan.mjs`, `logo-check.mjs` (which logo-dependent layouts each brand can use), `sheet.mjs`, `finalize.mjs` (locks delivered images) |
| `examples/` | Approved specs for every layout |
| `assets/` | Logo files a few examples use |

## Troubleshooting

| Problem | Fix |
|---|---|
| Chrome not found | Set `CHROME` to your Chrome or Edge executable |
| `TEXT CHECK FAILED` | Cut secondary lines first, then shorten phrases to labels |
| `VARIETY CHECK FAILED` | Use one of the listed layouts. Run `plan.mjs` to see usage; if every layout is used, add a variant |
| `BACKGROUND FIT FAILED` / `VIBRANT FIT FAILED` | Remove `bg` from the spec; the renderer picks the best background |
| Logos are broken or low-res | Add a Brandfetch client ID and check your connection (logos load at render time) |
| An article URL fails to load | The reader retries once; run it again or paste the article text |

Logos are trademarks of their owners and are shown to identify products in editorial content.
