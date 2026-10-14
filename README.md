# Blog Featured Images: a Claude Code skill

Turn blog article URLs into **premium, article-specific featured images** (1600×900 plus crops) in three families plus originals: calm card layouts on grainy light backgrounds (plus a vibrant deep-blue field), Chatbase-style headline layouts for comparisons (facing pills, connected logos, black slash, black duo panels) and single products (black + brand colour, or a black logo on cream), Gumloop-style layouts (bold type vs, tilted app-icon tiles, a frosted wordmark bar, a switch arrow, a figure badge), and originals (a receipt for costs, a dictionary entry for "what is", a notepad shortlist and a frosted logo lineup for best-of lists, frosted glass logo tiles and a bento grid for X vs Y). It's free: everything renders with headless Chrome, with **no AI image generation**.

![Example featured images](assets/examples.webp)

*A selection from the finalized reference set: card layouts (top), the six headline layouts (middle), and Gumloop layouts with the newest originals (bottom). The same images ship in `references/approved/`, and the renderer's defaults reproduce this look.*

Every image:
- **mirrors the blog title** and uses **only the article's own facts**
- is **minimal**: at most 15 words, labels not sentences (enforced)
- sits on a **background chosen to flatter its illustration** (enforced)
- **looks different**: a layout not used yet goes first, and a used layout never comes back in the same category, only in a different one (enforced)
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

1. **Orchestrator** (Claude): reads every URL at once (`read-articles.mjs`), checks which logo-dependent layouts each brand can use (`logo-check.mjs`), picks the best free layout per article (not used yet first, then used only in other categories) and which ones go on the vibrant blue, and reserves them all (`plan.mjs`).
2. **Makers** (parallel subagents): write each spec from the article's facts and render it.
3. **Visual QA** (an independent subagent): judges the whole batch on one contact sheet (`sheet.mjs`): visually appealing, background fits, no layout reused in a category, 2-second scan, minimal, balanced, clean logos.
4. **Fact QA** (an independent subagent, running at the same time): checks every word and number against the article text: the heading mirrors the title, every figure keeps its qualifier, nothing contradicts or is invented.

Failures go back to their own Maker and are re-checked only by the QA agent that failed them; an image is delivered only when both pass.

5. **Finalize** (`finalize.mjs`): delivered images become permanent. They stay stored (plus a copy in `~/.blog-featured-images/delivered/`), keep counting as used in their category, and can never be re-created or overwritten.

**Which layouts are free.** The user's rule: "the ones that are used shouldn't be used again unless the category is different. The ones that aren't used can easily be used". So a layout not used yet goes first, and a used layout comes back only in a different category. Usage is kept per brand: every image rendered (drafts too), reserved or delivered, plus your own record, `references/used-layouts.json`, which is the truth for its brand up to its `recordedAt`. A re-render of the same article replaces its entry, and `plan.mjs --release` frees a reservation you won't use. To pick a layout yourself for one article, reserve it as `<slug>=<layout>!`.

**Built-in checks** (the renderer refuses to finish):

| Check | Rule |
|---|---|
| `HEADING CHECK FAILED` | The image heading must reuse the blog title's own words |
| `TEXT CHECK FAILED` | At most 15 words per image and 7 per element (no sentences) |
| `VARIETY CHECK FAILED` | A layout is used once per category (see "Which layouts are free"); favourites also have a site-wide cap (slash, connect, duo 5; dark 3; pills, logotype 2); same-topic articles never share a mode |
| `BACKGROUND FIT FAILED` | Each layout only takes the light backgrounds that flatter its illustration |
| `BACKGROUND CHECK FAILED` | Only `sky`, `paper`, `cream`, `g5` and `blue` exist, and a layout that paints its own canvas takes no `bg` at all |
| `VIBRANT CHECK FAILED` | Vibrant images (the deep-dunes blue and the black layouts) appear on at most 1 in 3 images per category, never on neighbours |
| `CONNECT LOGO CHECK FAILED` | `versus/connect` needs each brand's own app icon (with its background colour); otherwise use another versus layout |
| `SLASH NAME CHECK FAILED` | A `versus/slash` name must be white + its brand colour; a one-word name with no capital break needs its coloured part marked |
| `PILLS LOGO CHECK FAILED` | `versus/pills` needs logos that sit on white; a brand with only a solid app icon uses another versus layout |
| `LOGOTYPE CHECK FAILED` | `logotype` needs a black logo with a separate icon; coloured logos use `dark` |
| `VIBRANT FIT FAILED` | Only checklist, versus/table, window and before-after/flow go on the vibrant blue |
| `CHECKLIST FIELD FAILED` | The checklist goes on the vibrant blue only (the renderer sets it) |
| `SERIES CHECK FAILED` | The optional site mark appears on at most 1 in 3 images per category, never on neighbours |
| `FIELD FIT FAILED` | Gumloop layouts, `versus/frost` and `versus/bento` take their approved fields; prompt takes only `"soft"`; every other layout takes no `field` |
| `TILES LOGO CHECK FAILED` / `GLASS LOGO CHECK FAILED` | `versus/tiles` needs two tiles that match (both filled or both white); `versus/glass` needs wordmarks that fit the bar |
| `LOGO FILE MISSING` | The local logo file named in the spec doesn't exist at that path (relative to the spec) |
| `FINAL IMAGE LOCKED` | A delivered image is permanent: it can't be re-created or overwritten |
| `CONTENT CHECK FAILED` | Each layout needs enough real facts to fill its frame |
| `FAIRNESS CHECK FAILED` | `dark` is refused when the title says "vs" or "versus": an X vs Y article always shows both products |
| `RETIRED LAYOUT` | `brandline`, `folder`, `versus/scale`, `versus/chat`, `versus/split`, `versus/duet`, `versus/rows` and `versus/logos` were retired by the user and never come back |
| `CATEGORY MISSING` | Every spec names its blog category (a layout is used once per category) |

**The look:**
- **Backgrounds:** light `sky`, `paper`, `cream`, `g5`, each picked to flatter its illustration (e.g. a big blue tile gets a neutral field, grey bars get sky), plus the vibrant **"deep dunes" blue**, only behind a big white card (the Gumloop tiles have their own blue field) (blue and black images together on at most 1 in 3 per category).
- **Grain:** heavy on the blue, fine on `sky`, `paper` and `g5`; `cream` stays clean, with no grain.
- **Shadows follow the background:** none on the blue or black, minimal and tinted on light fields.
- **One bold blue anchor**, white UI cards, black `#0A0A0B` headlines on every layout and brand (white on the black and blue fields; semibold on card layouts, Inter Medium on headline layouts), a hero at 55–70% of the width.
- **Logos:** a free chain, loaded at render time: a local file or URL in the spec first; then Brandfetch symbol (with a client ID) → Iconify → Simple Icons → Brandfetch square icon (with an ID; Google's favicon without one) → letter tile. Logos fill ~65% of their tile, app icons fill the tile, pale marks are darkened, and "best of" hubs show logos only. A wrong mark can be replaced by the official file in `featured-images/assets/`.

## Layouts (19 modes, 30 layouts)

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
| `checklist` | default | How to choose, requirements | blue only |
| `prompt` | default | Cost, FAQ, "what is" | no |
| `stack` | default | One key rule | no |
| `window` | default | Vendor lists, pricing tables | yes |

**Headline layouts** (after Chatbase: Inter Medium type, subtle vivid blue shapes, white designs in a grey frame, three on black, one on cream; no site mark):

| Layout | Best for |
|---|---|
| `versus/pills` | X vs Y: two facing pills (flat outer cuts, subtle gradient with fine noise) with the logos on white circles, the question below in black; only when both logos work on white; once per category, at most 2 across the site |
| `versus/connect` | X vs Y: each brand's own app icon in its original colours, linked to a VS circle, black headline; only when both brands have an app icon (a favourite: once per category, at most 5 across the site) |
| `versus/slash` | X vs Y on black: bold names, each white + its brand colour, italic VS (a favourite: once per category, at most 5 across the site) |
| `versus/duo` | X vs Y on black: two panels in each brand's colour with white logos (a favourite: once per category, at most 5 across the site) |
| `dark` | Single-product articles (review, pricing, features): the product's icon in black on a white tile top-left, its colour as the panel, white logo; once per category, at most 3 across the site |
| `logotype` | Single-product articles with a black logo: icon on a black tile beside the wordmark, on cream with a faint grid; once per category, at most 2 across the site |

**Gumloop layouts** (after the user's Gumloop references; each has its own approved fields, set with `"field"`; black and blue fields count as vibrant; glass, swap and badge show each brand's full wordmark, tiles its app icon or mark, type the names only):

| Layout | Best for | Fields |
|---|---|---|
| `versus/type` | X vs Y as big bold names with a small centred "vs" on a faint "+" grid | light |
| `versus/tiles` | X vs Y with two tilted tiles, both filled with brand colour or both white, above the headline | blue, light |
| `versus/glass` | X vs Y with both full wordmarks on a frosted glass bar over a mesh gradient | light, black |
| `swap` | Switch, migration, "old way → new way": old → dashed loop arrow → new | light |
| `badge` | Cost and stat articles: the key figure in a tinted rounded box | light |

**Originals** (built from the user's reviews):

| Layout | Best for |
|---|---|
| `receipt` | Cost and pricing articles: a big headline and a tilted receipt listing the article's prices with a bold total |
| `definition` | "What is X" articles: a dictionary entry with the term, its full form and a one-line definition |
| `shortlist` | "Best X" lists: a tilted notepad of the article's picks with a black headline |
| `lineup` | "Best X" lists with 3–6 real logos: one row of white logo tiles on a frosted glass bar |
| `versus/frost` | X vs Y: two frosted-glass logo tiles on a light mesh with a glass "vs" disc |
| `versus/bento` | X vs Y whose logos can't match: a light bento grid with a name, icon and fact per brand |

## Add your own site

Copy `brands/_template.json` to `brands/<site>.json`, fill in the site's colours, and optionally `markUrl` (the site's own square icon) and `markName` for the site mark (card layouts only). Then set `"brand": "<site>"` in specs. Usage history is kept separately per brand, and the user's record in `references/used-layouts.json` belongs to one brand (its `"brand"` key), so a new site has no record until you keep one for it: until then its own history decides.

## What's inside

Paths are inside `skills/blog-featured-images/`.

| Path | Contents |
|---|---|
| `SKILL.md` | Hard rules, layouts and workflow (Claude reads this first); the required "Keep Learning" loop |
| `references/approved/` | The finalized reference images: the target look; `sources.json` names the example spec behind each |
| `references/design-language.md` | The rulebook: visual appeal, backgrounds and fit, shadows, layouts, text budget, logos, guardrails |
| `references/spec-format.md` | The JSON spec for every layout (snippets show each layout's own fields; `examples/` has complete, renderable specs) |
| `references/agents.md` | The four roles (job, steps, prompt, limits), the fast-batch flow, the Visual and Fact checklists |
| `references/taste.md` | The user's taste as principles (each tied to the note that taught it) and the Self-Critique every image passes |
| `references/lessons.md` | What each batch and review taught, speed tools, gotchas, pre-flight checks |
| `references/checks.md` | Every renderer check and the feedback behind it, plus the regression test |
| `references/inspiration.md` | Every reference the user shared and what was taken from it |
| `references/used-layouts.json` | The user's own record of which layouts are used and in which categories, for one brand, kept on a Template Usage page; the truth up to its `recordedAt` |
| `references/fields/` | Approved backgrounds (the glow field `lineup` uses, and the blue mesh still without a layout) |
| `scripts/` | `render.mjs` (renderer + checks), `layouts.mjs` (the layout list), `read-articles.mjs`, `plan.mjs` (free layouts per category, reservations, `--release`), `usage.mjs` (the shared usage rule: the site history, the user's record, and the lock parallel renders share), `logo-check.mjs` (which logo-dependent layouts each brand can use), `test-examples.mjs` (regression test; `--refresh` rebuilds the approved images), `sheet.mjs`, `finalize.mjs` (locks delivered images) |
| `brands/` | Brand files: `default.json`, `medsoftwarehub.json`, and `_template.json` for a new site |
| `examples/` | Approved specs for every layout |
| `assets/` | Logo files a few examples use |

## Troubleshooting

| Problem | Fix |
|---|---|
| Chrome not found | Set `CHROME` to your Chrome or Edge executable |
| `TEXT CHECK FAILED` | Cut secondary lines first, then shorten phrases to labels |
| `VARIETY CHECK FAILED` | The layout is already used in this category: use one of the listed layouts (not used yet first). Run `plan.mjs` to see what's free; if nothing fits, add a variant |
| `BACKGROUND FIT FAILED` / `VIBRANT FIT FAILED` | Remove `bg` from the spec; the renderer picks the best background |
| Logos are broken or low-res | Add a Brandfetch client ID and check your connection (logos load at render time) |
| An article URL fails to load | The reader retries once; run it again or paste the article text |

Logos are trademarks of their owners and are shown to identify products in editorial content.
