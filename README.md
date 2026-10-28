# Blog Featured Images: a Claude Code skill

Turn blog article URLs into **premium, article-specific featured images** (1600×900 plus crops) in three families plus originals: calm card layouts on grainy light backgrounds (plus a vibrant deep-blue field), Chatbase-style headline layouts for comparisons (facing pills, connected logos, black slash, black duo panels) and single products (black + brand colour, or a black logo on cream), Gumloop-style layouts (bold type vs, tilted app-icon tiles, a frosted wordmark bar, a switch arrow, a figure badge), and originals (a receipt for costs, a dictionary entry for "what is"; for costs also a frosted glass bar on black, two big figures and a cost grid; for best-of lists a notepad shortlist, a frosted logo lineup, a row of frosted-glass logo tiles, a selection-box spotlight, a checked picks card, a logo cloud, price-range tracks and a big count; for X vs Y frosted glass logo tiles, a bento grid, figure badges, a checked card, price lanes, big scores, a centre tile, and two price cards fanned or stacked), plus covers led by product-blog references (Peec, Dub, Calendly, Databricks): a measured checklist card, frosted squircle tiles, a blue grid, a struck-through price, a true-scale meter, a price axis, big name lockups, white wordmarks on plain black and two frosted tiles on the deep blue, and covers copied from the user's own references (two marks and a "vs" in many forms, a title in a box, a highlighted phrase, a name in big caps, a frosted dock, a dark panel of picks, a tilted price band, ranked rule rows, a dark "Book a Demo" hero). 47 modes, 78 layouts. It's free: everything renders with headless Chrome, with **no AI image generation**.

![Example featured images](assets/examples.webp)

*A selection from the finalized reference set: card layouts (top), the six headline layouts (middle), and Gumloop layouts with the newest originals (bottom). The same images ship in `references/approved/`, and the renderer's defaults reproduce this look.*

Every image:
- **mirrors the blog title** and uses **only the article's own facts**
- is **minimal**: at most 15 words, labels not sentences (enforced)
- sits on a **background chosen to flatter its illustration** (enforced), and **you pick the final background** for each image on a picker page
- **is a new design for its article**: a layout already used on the site, in any category, is never used again for a new article, unless you pick it yourself (enforced); new designs are learned from your approved images and every verdict you give (the taste training below)
- shows **real, balanced product logos** where products are named
- is built from **the approved parts** (white cards, rows, tracks, checklists, logo tiles, big type), never props or device mockups, and crafted like a senior designer would: balanced, not scattered, one corner radius per set; a comparison reads as one at a glance and shows two identities and a "vs", with no prices unless the title is about pricing
- comes in a batch whose **backgrounds vary** (plain black, the deep-dunes blue, glow, mesh, white, the faint grid, light glass and the light fields), never one colour for everything and never another brand's gradient
- is **one big object on a full stage**, never a small widget floating on a gradient, and a batch is critiqued as a whole on one contact sheet before delivery
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

1. **Orchestrator** (Claude): reads every URL at once (`read-articles.mjs`), checks which logo-dependent layouts each brand can use (`logo-check.mjs`), plans a new design for every article (a design descriptor each, from `references/taste-grammar.md`, checked with `taste.mjs batch`: new against every live and retired layout, distinct within the batch, predicted to pass), decides which go on the vibrant blue, and reserves them (`plan.mjs`). Each new design takes its structure from your library (your references, the sources you named, the approved images) and you see 2–3 variations per article that differ in composition, not only in colour (one skeleton per review page; after two failed rounds of inventions, the next round is led by references). It never asks you for notes: a disapproval is diagnosed from the written taste.
2. **Makers** (parallel subagents): build each new design as a new layout in the renderer, write each spec from the article's facts and render it.
3. **Visual QA** (an independent subagent): judges the whole batch on one contact sheet (`sheet.mjs`): visually appealing, crafted like a senior designer would (not scattered, one corner radius per set), a comparison that reads as one, backgrounds varied across the batch, background fits, no layout reused on a new article, 2-second scan, minimal, balanced, clean logos; it runs the taste model on each design (a veto or a predicted reject is a FAIL).
4. **Fact QA** (an independent subagent, running at the same time): checks every word and number against the article text: the heading mirrors the title, every figure keeps its qualifier, nothing contradicts or is invented.

Failures go back to their own Maker and are re-checked only by the QA agent that failed them; an image is delivered only when both pass.

5. **Background picker** (`bgpick.mjs`): `render` renders every image on every background its layout can take (each option on a temporary copy of the history, so the real one is never written), `page` builds a picker page where you pick one per image (picks save as you click), and `apply` writes your pick into the spec as `"bg": "<field>", "bgPick": true`; the image is then rendered last with it.
6. **Deliver** after a batch critique on one contact sheet: separate files per image and a link page with Copy link, Copy image and Download per row, plus "Copy all N" and "Download all".
7. **Finalize** (`finalize.mjs`): delivered images become permanent. They stay stored (plus a copy in `~/.blog-featured-images/delivered/`), keep counting as used on the site, and can never be re-created or overwritten, except when you ask for an image to be redone: `render.mjs --redo` (every other check still runs; never `--force`), then finalize it again.

8. **Learn** after every review round: every option you judged (approved, disapproved or left unmarked) goes into the taste data (`taste.mjs add`), and the model is re-checked (`taste.mjs eval`); rejected new layouts are retired, approved ones kept.

**Which layouts are free.** The user's rule (Oct 28 2026): "the approved images are not retired, I love those images and I want you to learn and build your taste from those images… For different articles, I want new image for each article". So a layout already used on the site, in any category, is not used again for a new article; only your own pick reuses one, and a redo of a delivered image is the same image. The approved layouts are never retired for this: they are the library new designs learn from. Only 2 layouts are still unused on the site, so nearly every new article gets a new layout. (This replaced the earlier per-category rule and the site-wide caps.) Usage is kept per brand: every image rendered (drafts too), reserved or delivered, plus your own record, `references/used-layouts.json`, which is the truth for its brand up to its `recordedAt` (or up to a layout's own `asOf`, when you change one layout later: a design you love can go back to "not used"). A re-render of the same article replaces its entry, and `plan.mjs --release` frees a reservation you won't use. To pick a layout yourself for one article, reserve it as `<slug>=<layout>!` (or render with `--user-pick`). A design you approve on one article stays with that article rather than being rolled out across the batch.

**Taste training.** The skill learns your taste from every verdict, so a batch of 20 articles gets 20 new designs instead of repeats:
- `references/taste-data.json`: 734 designs you judged across batches 1–9 (approved, final, disapproved, no verdict, retired before shown), each with its features and your words.
- `references/taste-grammar.md`: the design grammar learned from them: what your approved images share (with approval rates), what passed per article type, the parts library, the recipe for a new design, 48 starting skeleton ideas, the vetoes and the descriptor format.
- `scripts/taste.mjs`: `predict` (8 vetoes you (almost) never approved, such as props, a figure alone on the field, 3D or a cover from a site you never named; a learned score; the closest approved and rejected designs with your words; the novelty check), `novelty` (a new skeleton differs from every live and retired layout on at least 2 of 4 axes: object, composition, logo treatment, figure home), `batch` (a whole batch: every design new, distinct, predicted to pass), `eval`, `add` (after every review round), `stats`, `selftest`.
- How good it is: trained on earlier batches and tested on later ones, it ranks held-out designs with an AUC of 0.693 and is right 70% of the time; when it predicts "approve" it is right 45% of the time against a 28% base rate. It is a filter and a ranker, not a judge: it reads a description, not the pixels, so your eye and the two QA agents still decide.

**Built-in checks** (the renderer refuses to finish):

| Check | Rule |
|---|---|
| `HEADING CHECK FAILED` | The image heading must reuse the blog title's own words |
| `TEXT CHECK FAILED` | At most 15 words per image and 7 per element (no sentences) |
| `VARIETY CHECK FAILED` | A layout already used on the site is not used again for a new article, unless you pick it (see "Which layouts are free"); same-topic articles never share a mode |
| `BACKGROUND FIT FAILED` | Each layout only takes the light backgrounds that flatter its illustration, unless you picked the background (`bgPick`) |
| `BACKGROUND CHECK FAILED` | Only `sky`, `paper`, `cream`, `g5`, `soft`, `white`, `glow`, `mesh` and `blue` exist, and a layout that paints its own canvas takes no `bg` unless you picked it; `ranges` without its card (`"bare"`) goes only on your `white` pick |
| `BACKGROUND PICK FAILED` | `"bgPick": true` needs a `bg`; a layout whose own full canvas would hide the pick (pills, connect, slash, duo, dark, glassbar, glass, frost, frostrow, receipt, definition, lineup, prompt, the twelve batch-7 canvas layouts, the 16 batch-8 layouts and the 2 batch-9 layouts) refuses it, and a picked blue is refused unless all the layout's text sits in a white card (`checklist`, `versus/table`, `window`, `before-after/flow`, `versus/checks`, `picks`, `stack`, `versus/fan`, plus `versus/tiles` on its own blue field); `meter` takes white only, also as a pick |
| `VIBRANT CHECK FAILED` | Vibrant images (the deep-dunes blue and the black layouts, `glassbar`, `versus/band`, `bluegrid`, `versus/span`, `versus/glasspair`, `namehero`, `tilerow`, `versus/vssquares`, `versus/darkpills`, `versus/glowmarks` and `demohero` included) appear on at most 1 in 3 images per category, never on neighbours; only `--vibrant-pick`, your knowing choice of a vibrant image next to a vibrant neighbour, lifts it |
| `CONNECT LOGO CHECK FAILED` | `versus/connect` needs each brand's own app icon (with its background colour); otherwise use another versus layout |
| `SLASH NAME CHECK FAILED` | A `versus/slash` name must be white + its brand colour; a one-word name with no capital break needs its coloured part marked |
| `PILLS LOGO CHECK FAILED` | `versus/pills` needs logos that sit on white; a brand with only a solid app icon uses another versus layout |
| `LOGOTYPE CHECK FAILED` | `logotype` needs a black logo with a separate icon; coloured logos use `dark` |
| `VIBRANT FIT FAILED` | Only checklist, versus/table, window, before-after/flow and versus/fan go on the vibrant blue, unless you picked the blue for `versus/checks`, `picks` or `stack`, whose text all sits in a white card (a picked blue still counts as vibrant) |
| `CHECKLIST FIELD FAILED` | The checklist goes on the vibrant blue only (the renderer sets it) |
| `SERIES CHECK FAILED` | The optional site mark appears on at most 1 in 3 images per category, never on neighbours |
| `FIELD FIT FAILED` | Gumloop layouts, `versus/frost` and `versus/bento` take their approved fields; prompt takes only `"soft"`; every other layout takes no `field`. Batch-7 layouts paint one approved field: `"canvas"` only `"dunes"` on `versus/span` and `versus/glasspair` and `"grid"` on `squircles`, `"glass"` only `true` on `research`. Batch-8 layouts render only their approved look: an option you turned down (`tilerow` off the blue, `bandhero` with waves or on black, light `darkpills` or `glowmarks`, `metricrows` without bars, `dock` placeholder tiles) is refused |
| `TILES LOGO CHECK FAILED` / `GLASS LOGO CHECK FAILED` | `versus/tiles` needs two tiles that match (both filled or both white); `versus/glass` needs wordmarks that fit the bar |
| `LOGO FILE MISSING` | The local logo file named in the spec doesn't exist at that path (relative to the spec) |
| `REDO REFUSED` | `--redo` only redoes a slug's own delivered image, in its own folder: refused for a slug never delivered or for another slug's delivered folder |
| `FINAL IMAGE LOCKED` | A delivered image is permanent: it can't be re-created or overwritten, except by `--redo` when you ask for that image to be redone (it lifts only this lock) |
| `CONTENT CHECK FAILED` | Each layout needs enough real facts to fill its frame (e.g. window 2+ rows, hub 6–7 logos, picks 3–7, cloud 3–8 logos, frostrow 3–6 logos, ranges 3–6 rows plus a scale, figures 2 rows, costgrid 3 cells, glassbar a label and a value, a figure or score on both sides of a two-product layout; `versus/scores` needs a real number on both sides, never a number against words; the batch-7 layouts too, e.g. meter 2+ rows and a `max`, strike `from` and `to`, both logos on the versus pairs; batch 8: dock 3–7 items, metricrows 2 rows with amounts, both logos on its vs layouts; batch 9: demohero a button and 2–4 plan names, rulerows 2–4 rows) |
| `FAIRNESS CHECK FAILED` | `dark` is refused when the title says "vs" or "versus": an X vs Y article always shows both products |
| `RETIRED LAYOUT` | 156 layouts were retired by the user and never come back. Batch 8 retired 22: 17 round-2 layouts the user never marked (they sent their own references instead), `versus/tiltpair` and `versus/dimension` (no verdict for four rounds, then "i'll provide inspirations"), and 3 never shown. Batch 7 retired 92 (all listed in `scripts/layouts.mjs`): 11 in the user's words, among them `versus/burst` ("disgusting shapes"), `capsule` ("i dont like this rounded it looks weird") and `cursorcard` ("not tilted rectangle pls also use our bgs"); 50 disapproved with no note; 5 approved once and then replaced on every article ("actually delete all of them"); 26 never shown. Before that: `brandline`, `folder`, `versus/scale`, `versus/chat`, `versus/split`, `versus/duet`, `versus/rows`, `versus/logos`; the batch-5 props layouts (`versus/compare`, `versus/search`, `versus/polaroid`, `versus/notes`, `versus/phones`, `versus/browser`, `notify`, `wallet`, `stickers`, `letterboard`, `tags`, `keycaps`); `versus/window`, `versus/range`, `versus/rings`, `versus/share`, `versus/sheet`, `versus/columns`; and from the batch-5 final review `versus/plans` ("i dont like the design, try smth else for comparison"), `versus/fit`, `versus/spot` and `grid` ("7 best pediatric shouldnt be like other logos, this looks off"); and from batch 6 `steps` ("it looks like this is designed by a begineer not by a pro experienced designer"), `numbered`, `versus/pill` ("doesnt look like comparison image"), `versus/chips`, `versus/offset` ("painfully bad visual design"), `versus/halves`, `link`, `versus/annotate`, `versus/corners` ("it looks scattered, it looks like AI slop"), `poster`, `versus/glasscards` and `versus/figures` |
| `CATEGORY MISSING` | Every spec names its blog category (the site history and the vibrant mix are kept per category) |

**The look:**
- **Backgrounds:** light `sky`, `paper`, `cream`, `g5` by default (the batch-6 layouts default to `white` or `glow`), each chosen to flatter its illustration (e.g. a big blue tile gets a neutral field, grey bars get sky), plus the vibrant **"deep dunes" blue**, only behind a big white card (the Gumloop tiles have their own blue field) (blue and black images together on at most 1 in 3 per category). The final background is **your pick**: the picker also offers `soft`, `white`, `glow` and `mesh`, on every card layout and on the canvas layouts that can step aside (`versus/badges`, `versus/type`, `versus/tiles`, `versus/bento`, `swap`, `badge`, `shortlist`).
- **Grain:** heavy on the blue, fine on `sky`, `paper` and `g5`; `cream` stays clean, with no grain.
- **Shadows follow the background:** none on the blue or black, minimal and tinted on light fields.
- **One bold blue anchor**, white UI cards, black `#0A0A0B` headlines on every layout and brand (white on the black and blue fields; semibold on card layouts, Inter Medium on headline layouts), a hero at 55–70% of the width.
- **Logos:** a free chain, loaded at render time: a local file or URL in the spec first; then Brandfetch symbol (with a client ID) → Iconify → Simple Icons → Brandfetch square icon (with an ID; Google's favicon without one) → letter tile. Logos fill ~65% of their tile, app icons fill the tile, pale marks are darkened, and "best of" hubs show logos only. A wrong mark can be replaced by the official file in `featured-images/assets/`.

## Layouts (47 modes, 78 layouts)

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
| `prompt` | default | Cost, FAQ, "what is"; an X vs Y price per product as two big logo rows (two rows or fewer grow; `"panel": {"even": true}` for no fade) | no |
| `stack` | default | One key rule | no |
| `window` | default | Vendor lists, pricing tables | yes |

**Headline layouts** (after Chatbase: Inter Medium type, subtle vivid blue shapes, white designs in a grey frame, three on black, one on cream; no site mark):

| Layout | Best for |
|---|---|
| `versus/pills` | X vs Y: two facing pills (flat outer cuts, subtle gradient with fine noise) with the logos on white circles, the question below in black; only when both logos work on white |
| `versus/connect` | X vs Y: each brand's own app icon in its original colours, linked to a VS circle, black headline; only when both brands have an app icon; `"cornerDots": false` drops the corner dot patches |
| `versus/slash` | X vs Y on black: bold names, each white + its brand colour, italic VS |
| `versus/duo` | X vs Y on black: two panels in each brand's colour with white logos |
| `dark` | Single-product articles (review, pricing, features): the product's icon in black on a white tile top-left, its colour as the panel, white logo |
| `logotype` | Single-product articles with a black logo: icon on a black tile beside the wordmark, on cream with a faint grid |

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
| `lineup` | "Best X" lists with 3–7 real logos: one row of white logo tiles on a frosted glass bar |
| `versus/frost` | X vs Y: two frosted-glass logo tiles on a light mesh with a glass "vs" disc |
| `versus/bento` | X vs Y whose logos can't match: a light bento grid with a name, icon and fact per brand |

**Approved-parts layouts** (batch 5: new arrangements of the approved parts, after a batch of props and device mockups was rejected; each approved on one article). Card layouts on a light field, except `versus/badges`, which paints its own white canvas in the grey frame:

| Layout | Best for | Fields (best first; any field you pick goes) |
|---|---|---|
| `versus/badges` | X vs Y with one headline figure each: names over blue-tinted value boxes, a grey note, a light "vs"; the figure leads the names by default (the approved hierarchy); `nameSize`/`nameWeight`/`valueSize`/`spread` only override it | its own canvas |
| `versus/checks` | Which-fits comparisons: a tilted checklist card, one row per product with logo and sub; no check boxes and big rows by default (the approved look); `"checks": true` brings the boxes back | sky, g5 |
| `versus/lanes` | Price tiers on one scale: one lane per product with blue price stops on a white card | cream, sky |
| `versus/scores` | Rating comparisons: the metric small, then each product's name big and its score very large in the blue gradient; a real number on both sides | sky, paper |
| `versus/center` | X vs Y for one specialty: two tilted logo tiles with hand-drawn arrows into a central blue tile carrying the angle | cream, paper |
| `spotlight` | Best-of lists with an angle: the headline's phrase in the blue selection box, a card of logo rows bleeding off the bottom | sky, g5 |
| `picks` | Best-of lists with weak logos: a tilted checklist card of the picks, names only | sky, g5 |
| `cloud` | Best-of lists with recognisable logos: the headline over staggered white logo pills | g5, sky |
| `ranges` | Best-of lists with price ranges: vertical price tracks on a shared scale in a white card (`"bare": true` drops the card, on the white field only) | sky, g5 |
| `count` | Best-of lists with 3–6 picks: the count big in the blue gradient, a white card of logo rows | paper, sky |

**Batch-6 layouts** (new designs for articles whose first pass leaned on templates already used across the site; each approved on one article):

| Layout | Best for | Fields (default first) |
|---|---|---|
| `glassbar` | A cost article reduced to one fact: a black canvas with blue glows, the heading in white, one frosted bar with the tier's label and its price in the blue gradient, the qualifier under it | its own black canvas (vibrant; no `bg`, no pick) |
| `figures` | Two price ranges: the heading and unit centred, two columns of a big figure over its label, a hairline between | white, sky, paper |
| `frostrow` | Best-of lists with real logos: the heading over one row of 3–6 equal frosted-glass logo tiles, names under | its own light mesh (no `bg`, no pick) |
| `costgrid` | Cost by pricing model: a tall blue card for the main model and two white cards for the others, each with its label, figure and unit | glow, paper, sky |
| `versus/fan` | X vs Y with one price each: two white cards tilted toward a blue "vs" disc, each with logo tile, name, price and unit | glow, sky, paper; the blue too |
| `versus/stacked` | X vs Y with prices on different scales: two wide tilted row cards, logo and name left, price and unit right, the "vs" disc on the seam | glow, mesh, sky |

**Batch-7 layouts** (20 articles redesigned, led by the user's references and product-blog research: Peec, Dub, Calendly, Databricks; 14 kept, each in a delivered final). Each takes one approved field only:

| Layout | Best for | Its one field |
|---|---|---|
| `checkcard` | Best-of lists, names only: a pixel copy of the user's Peec checklist, with its measured checkbox | a faint grid of white cards, no grain |
| `flatcard2` | One cost figure: the figure in a dashed selection with handles, a cursor whose tag holds the qualifier | the light glow |
| `research` | Best-of lists (and a pair) as frosted squircle tiles under a frosted tag and the heading, from Peec's research cover | our light glass |
| `squircles` | Best-of lists with real marks: big frosted squircle tiles in one row | the faint grid |
| `bluegrid` | Best-of lists: each pick on a white tile in its own cell of a blue grid, from Databricks | its blue field (vibrant) |
| `typehero` | X vs Y with one short answer each: the names big in one line, both answers on one frosted bar | its light glass |
| `strike` | "Is free X worth it": "$0" struck through, an arrow, the real monthly cost | glow, sky |
| `meter` | Two cost options on one true-scale track, no card | white |
| `versus/peecpair` | X vs Y with real wordmarks on a near-white hairline grid, from the user's Peec cover | its near-white grid, no grain |
| `versus/inline` | X vs Y with a figure each: the logos set inside a big headline | its light canvas |
| `versus/span` | X vs Y with a price range each: two capsules to scale on one price axis | the deep-dunes blue (vibrant) |
| `versus/duel` | X vs Y as two big name lockups and a small "vs", from Dub | a faint grid with soft corner glows |
| `versus/band` | X vs Y with clean text wordmarks: both in white on one hairline band | plain black (vibrant) |
| `versus/glasspair` | X vs Y with strong marks: two big frosted tiles, no text | the deep-dunes blue (vibrant) |

**Batch-8 layouts** (25 articles; the user's own references beat the covers the session found itself, 11 of 17 against 1 of 18; 16 kept, each in a delivered final). Each paints one approved look; a `bg`, a pick and every option the user turned down are refused:

| Layout | Best for | Its look |
|---|---|---|
| `versus/markvs` | X vs Y with strong marks | two bare marks and a small "vs" on a faint grid, from Dub |
| `versus/vssquares` | X vs Y | a black and a white square on plain black, a "vs" disc on the seam, names under the marks (vibrant) |
| `namehero` | One product, "is X worth it" | the name in big white caps on the deep-dunes blue (vibrant) |
| `versus/wordvs` | X vs Y | two mark + name lockups and a black "vs" on a light dotted field |
| `versus/capsulevs` | X vs Y | the heading over one white capsule with both marks and a grey "vs" |
| `titlebox` | Any title; cost with no figure | the title alone in a long box with a blue border and hatched ends |
| `highlight` | A title with a key phrase | the key phrase in a blue-gradient box |
| `dock` | Best-of lists with app icons | one frosted dock of real app tiles, the lead raised, on light glass |
| `metricrows` | X vs Y about pricing | two rows: label, split bar, a big blue figure |
| `darkpanel` | Best-of and alternatives lists | a big title beside a black panel of picks |
| `editorcard` | Best-of lists with 3–4 logos | one white app window with logo tiles and a cursor, from Mintlify |
| `versus/chipvs` | X vs Y | one tilted white chip of both marks beside the names, from incident.io |
| `tilerow` | Best-of lists with real logos | overlapping frosted tiles over a white heading on our blue noise (vibrant) |
| `bandhero` | Cost with one lead figure | a big word and the figure on a tilted blue band, light field |
| `versus/darkpills` | X vs Y | two white logo pills and a "vs" on dark grey; dark only (vibrant) |
| `versus/glowmarks` | X vs Y | marks and white names over a two-hump blue glow on black; dark only (vibrant) |

**Batch-9 layouts** (2 articles; both copied from Peec blog covers, the user's own named source, after found covers and inventions failed). Each paints one approved look; a `bg` and a pick are refused:

| Layout | Use it for | Shows |
| --- | --- | --- |
| `rulerows` | Requirements, rules or ranked items | a one-line title over 2–4 white row cards on the faint grid, the lead ringed in blue with a pill |
| `demohero` | Cost with plan names and no published price | near-black: the title, the plan names in grey, one big flat "Book a Demo" button (vibrant) |

## Add your own site

Copy `brands/_template.json` to `brands/<site>.json`, fill in the site's colours, and optionally `markUrl` (the site's own square icon) and `markName` for the site mark (card layouts only). Then set `"brand": "<site>"` in specs. Usage history is kept separately per brand, and the user's record in `references/used-layouts.json` belongs to one brand (its `"brand"` key), so a new site has no record until you keep one for it: until then its own history decides.

## What's inside

Paths are inside `skills/blog-featured-images/`.

| Path | Contents |
|---|---|
| `SKILL.md` | Hard rules, layouts and workflow (Claude reads this first); the required "Keep Learning" loop |
| `references/approved/` | The 79 finalized reference images: the target look; `sources.json` names the example spec behind each |
| `references/design-language.md` | The rulebook: visual appeal, backgrounds and fit, shadows, layouts, text budget, logos, guardrails |
| `references/spec-format.md` | The JSON spec for every layout (snippets show each layout's own fields; `examples/` has complete, renderable specs) |
| `references/agents.md` | The four roles (job, steps, prompt, limits), the fast-batch flow, the Visual and Fact checklists |
| `references/taste.md` | The user's taste as 46 principles (each tied to the note that taught it), the Self-Critique every image passes, and the approved and rejected patterns every image is compared with before you see it |
| `references/lessons.md` | What each batch and review taught, speed tools, gotchas, pre-flight checks |
| `references/checks.md` | Every renderer check and the feedback behind it, plus the regression test and the refusal suite |
| `references/inspiration.md` | Every reference the user shared and what was taken from it, plus the product blogs studied before inventing (Clerk, Mintlify; Dub, Peec, Calendly, Databricks; batch 8: the user's own references and incident.io covers; batch 9: Peec covers, with the rejected Clerk covers and inventions) |
| `references/taste-grammar.md` | The design grammar for inventing a new design in the user's taste (taste DNA, per article type, parts, recipe, 48 skeleton ideas, vetoes, descriptor format, how training continues) |
| `references/taste-data.json` | The training data: 734 designs (697 the user judged) across batches 1–9, with features and the user's words |
| `references/used-layouts.json` | The user's own record of which layouts are used and in which categories, for one brand, kept on a Template Usage page; the truth up to its `recordedAt` (or a layout's own `asOf`, which overrides it for that layout) |
| `references/fields/` | Approved backgrounds (the glow field `lineup` uses, and the blue mesh still without a layout) |
| `scripts/` | `render.mjs` (renderer + checks), `layouts.mjs` (the layout list), `read-articles.mjs`, `plan.mjs` (the layouts not used yet, reservations, `--release`), `taste.mjs` (the taste model: `predict`, `novelty`, `batch`, `eval`, `add`, `stats`, `selftest`), `usage.mjs` (the shared usage rule: the site history, the user's record, and the lock parallel renders share), `logo-check.mjs` (which logo-dependent layouts each brand can use), `test-examples.mjs` (regression test: renders every example, checks the taste model, then runs the refusal suite; `--refresh` rebuilds the approved images, `--examples-only` skips the refusals), `test-refusals.mjs` (the user's rules as 339 refusal cases, 353 steps, on a temporary history and record; `node test-refusals.mjs <filter>` runs a subset), `sheet.mjs`, `bgpick.mjs` (the background picker: renders the options, builds the picker page, applies your picks), `finalize.mjs` (locks delivered images) |
| `brands/` | Brand files: `default.json`, `medsoftwarehub.json`, and `_template.json` for a new site |
| `examples/` | 87 approved specs, at least one for every layout |
| `assets/` | Logo files a few examples use |

## Troubleshooting

| Problem | Fix |
|---|---|
| Chrome not found | Set `CHROME` to your Chrome or Edge executable |
| `TEXT CHECK FAILED` | Cut secondary lines first, then shorten phrases to labels |
| `VARIETY CHECK FAILED` | The layout is already used in this category: use one of the listed layouts (not used yet first). Run `plan.mjs` to see what's free; if nothing fits, add a variant |
| `BACKGROUND FIT FAILED` / `VIBRANT FIT FAILED` | Remove `bg` from the spec; the renderer picks the best background. If you picked that background yourself, add `"bgPick": true` |
| Logos are broken or low-res | Add a Brandfetch client ID and check your connection (logos load at render time) |
| An article URL fails to load | The reader retries once; run it again or paste the article text |

Logos are trademarks of their owners and are shown to identify products in editorial content.
