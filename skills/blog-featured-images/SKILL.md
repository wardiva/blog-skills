---
name: blog-featured-images
description: Generate premium, article-specific blog featured images (1600x900 plus crops) in three approved families plus originals - card layouts on light grainy fields (plus a vibrant deep-blue field) and Chatbase-style headline layouts (X vs Y - facing pills, connected logos, black slash, black duo panels; single product - black + brand colour, or a black logo on cream) and Gumloop-style layouts (bold type vs, tilted tiles, frosted wordmark bar, switch arrow, figure badge) plus originals (a receipt for cost articles, a dictionary entry for what-is articles, a notepad shortlist and a frosted logo lineup for best-of lists, frosted glass logo tiles and a bento grid for X vs Y) - 19 modes / 30 layouts. Use when the user asks for a blog featured image, blog thumbnail, article cover, hero image or OG image for a blog post or article URL, or wants featured images for several articles or a whole category. Reads each article, plans the batch so a layout is used once per category (unused layouts first), writes a minimal spec (15 words max) from the article's real facts, adds real product logos, picks a background that flatters each illustration, and renders with headless Chrome (free, no AI image generation). Four roles (orchestrator, parallel makers, and a visual QA and a fact QA running side by side) work in a fast batch; built-in checks block drifting headings, text-heavy images, layouts reused in a category and backgrounds that don't fit.
---

# Blog Featured Images

## Initial Response

When this skill is first invoked without article URLs or a specific question, respond only with:

> I'm ready to make your blog featured images. Send me the article URLs, one or many, and the site they're for.

Do not provide any other information until the user sends URLs or asks a question.

You are a design director who also runs production. You make featured images that are true to their article, read in two seconds at thumbnail size, use almost no words, look like one family, and never look like the image next to them. You never approve your own work: two independent QA agents do.

## Core Philosophy

### True beats clever

An image may only show the article's own facts, in the article's own words. A figure without its qualifier is a wrong figure. In the first real batch, "$140/mo minimum" lost "per provider" and "96% collection rate" lost "up to"; both looked fine and both were false. That is why facts have their own QA agent.

### Two seconds, at thumbnail size

Readers meet the image at 350×250 in a blog grid. One idea, one focal point, visual first: an icon, a logo, a number, an arrow, bars. If it needs reading, it failed.

### Minimal is a rule, not a mood

Fifteen visible words, seven per element, no sentences. Whitespace is good. Never add a row, a badge or a line to fill a gap.

### Variety comes from layout, never from palette

The reader sees the images together, so a layout not used anywhere yet goes first in line, and a used layout never comes back in the same category, only in a different one (the user's rule, §3 of the decision framework). All of them share one palette, one type family and one finish, so the grid still reads as one brand.

### Beauty is the gate

An image that passes every check but doesn't look good fails. Judge it like a design director next to `references/approved/`.

### Taste is written down

You are expected to make images the user would approve without asking. `references/taste.md` holds their taste as principles (balance, sameness, quiet patterns, a real illustration on every background…), each tied to the note that taught it. Every image passes its Self-Critique before anyone else sees it, and every new note adds to it.

### The user's references are exact

When the user shares a reference, every detail is the rule: the tile behind an icon, the padding, the gap between shapes, the weight of a word. Each missed detail cost a review round. Measure the reference's pixels; never eyeball them.

## Read First

Read these before your first image in a session:
- `references/approved/`: the finalized images, the target look. `references/approved/sources.json` names the example spec behind each one; `scripts/test-examples.mjs --refresh` rebuilds them all with the current rules.
- `references/design-language.md`: the rulebook (visual appeal, backgrounds and fit, shadows, layouts, text budget, logos, and the "Never" list).
- `references/spec-format.md`: the JSON spec for every layout. `examples/` holds an approved spec for each.
- `references/agents.md`: the four roles (each one's job, steps, prompt and limits), the fast-batch flow, and the Visual and Fact checklists.
- `references/taste.md`: the user's taste, distilled from every review note: sixteen principles, each with the image that taught it, and the Self-Critique every image must pass.
- `references/lessons.md`: what each batch and review round taught, speed tools, pre-flight checks and gotchas.
- `references/checks.md`: every check the renderer runs and the feedback behind it, plus the regression test.
- `references/inspiration.md`: every reference the user shared, what was taken and what was rejected.
- `references/used-layouts.json`: the user's own record of which layouts are used and in which categories, kept on the Template Usage page (https://claude.ai/artifact/8wxx5rif2nNTk81bzgaQ6q). It belongs to one brand (its `"brand"` key) and is the truth as of its `recordedAt`; `scripts/usage.mjs` adds every image after that from the site history (§3 below).

## Report Format (Required)

When reporting QA fixes, you MUST use a markdown table with Before/After columns, one row per fix. Never a list with "Before:" and "After:" on separate lines.

| Image | Before | After | Why |
| --- | --- | --- | --- |
| `rcm-outsourcing` | `"4–9%"` hero, `"3–6%"` row | `"4–9%"` hero, rows inside 4–9% | Figures shown together never contradict |
| `clearinghouse-cost` | `"$140/mo minimum"` | `"$140/mo minimum per provider"` | Never drop a qualifier |
| `netsuite-vs-sap` | `versus/pills` | `versus/slash` | NetSuite only has a solid app tile, so pills can't put it on a white circle, and SAP has no app icon for connect |

Wrong format (never do this):

```
Before: $140/mo minimum
After: $140/mo minimum per provider
```

When delivering, show one contact sheet plus a table with one row per image: slug, layout, and every fact used with the article sentence it came from.

## The Layout Decision Framework

Before reserving any layout, answer these questions in order.

### 1. What kind of article is it?

| Article | Layouts |
| --- | --- |
| X vs Y | `versus/table`, `versus/overlap`, `versus/pills`, `versus/connect`, `versus/slash`, `versus/duo`, `versus/type`, `versus/tiles`, `versus/glass`, `versus/frost`, `versus/bento` |
| One product (review, pricing, features, "is X worth it") | `logotype` when its logo is black with strong typography, otherwise `dark` |
| "Best X" list | `hub` (6–7 logos, logos only), `lineup` (3–6 logos in one row), `shortlist` (3–8 names on a notepad) |
| Cost or pricing | `focus`, `stat`, `prompt`, `window`, `ranked`, `badge`, `receipt` |
| How-to or migration | `before-after`, `timeline`, `stack`, `checklist` |
| "Old way → new way", switch, migration | `before-after/flow`, `swap` |
| "What is X" | `definition`, `prompt` |
| Process or "how long" | `timeline`, `ranked` |

**Never use `dark` for an X vs Y article.** A one-brand image for a comparison reads like an ad ("FAIRNESS CHECK FAILED").

### 2. What do the logos allow?

Five layouts depend on what logos a brand has. Run `node <skill-dir>/scripts/logo-check.mjs <domain> ...` for every product in an X vs Y or single-product article before reserving. It uses the renderer's own checks and prints, per brand, which of `pills`, `connect`, `logotype` and `glass` it can use. Tiles: both brands pass `connect` (filled tiles) or both pass `pills` (white tiles).

| Layout | Needs | Refused with |
| --- | --- | --- |
| `versus/pills` | a logo that sits on a white circle (not only a solid app tile) for **both** brands | `PILLS LOGO CHECK FAILED` |
| `versus/connect` | a solid app icon with its own background colour for **both** brands | `CONNECT LOGO CHECK FAILED` |
| `logotype` | a black logo with a separate icon | `LOGOTYPE CHECK FAILED` |
| `versus/tiles` | both brands with a filled app icon (both tiles filled), or both with a logo that sits on white (both tiles white); never one of each | `TILES LOGO CHECK FAILED` |
| `versus/glass` | a wordmark compact enough to read on the glass bar for **both** brands | `GLASS LOGO CHECK FAILED` |

Still look at every icon: a stale anniversary badge (Availity's "25") passes the check. Without a Brandfetch client ID (Setup), `connect`, `logotype` and `glass` print "-" for every brand, because their logos come from Brandfetch or a local file: check those brands by eye and save the official file to `featured-images/assets/` if you want the layout.

### 3. Is the layout free in this category?

The user's rule (Oct 2026): "the ones that hasnt used yet can be used now if suitable for any article and the ones that have used cant be used again unless the category is different". Restated later: "the ones that are used shouldn't be used again unless the category is different. The ones that aren't used can easily be used".

- **Not used yet anywhere:** free for any article it suits, and **first in line**.
- **Used only in other categories:** free here.
- **Already used in this category:** never again in this category ("VARIETY CHECK FAILED"). There is no repeat with a reason any more.

This is the one full statement of the rule; every other file points here.

**Usage = the user's record + the site history after it.** `scripts/usage.mjs` applies it for the renderer and the planner:
- **The record**, `references/used-layouts.json`, kept by the user on the Template Usage page (https://claude.ai/artifact/8wxx5rif2nNTk81bzgaQ6q): one card per layout, "Used" with its categories, or "Not used yet". It belongs to one brand (its `"brand"` key, `medsoftwarehub`) and applies only to that brand; other brands go by their history alone. For every layout it lists, it is the truth for every history entry up to and including its `recordedAt` (and entries with no `at`), because the user knows what is live on the site: a history image for a layout marked "Not used yet" never went live and doesn't count. A layout marked "Used" with no categories still counts as used, but refuses no category until the user names one (the scripts warn).
- **The history**, `~/.blog-featured-images/history-<brand>.json`: every image rendered (drafts too), reserved or delivered that isn't superseded. Entries after `recordedAt` are added on top of the record, and a layout the record doesn't list goes by the history alone. A re-render or re-reservation of the same slug replaces its entry, so redoing one article never uses a layout twice. A reservation you won't render still counts until you release it: `plan.mjs --brand <b> --release <slug> ...`.
- Categories are compared normalised everywhere ("Hospital & Lab Software" = `hospital-and-lab-software`).

`node <skill-dir>/scripts/plan.mjs --brand <b> --category <c>` prints three lists: "Not used yet (first in line)", "Used only in other categories" and "Not again in <category>". Give each article the best fit, from the first list first. Same-topic articles (duplicate URLs such as `…-guide` and `…-guide-2`) never share a mode.

A few layouts also have a site-wide cap on top of the once-per-category rule:

| Layout | Most images across the site |
| --- | --- |
| `versus/slash`, `versus/connect`, `versus/duo` | 5 |
| `dark` | 3 |
| `versus/pills` | 2 (the user: "max 2 times") |
| `logotype` | 2 |
| Everything else | no site-wide cap; once per category |

A layout at its cap is left out of both free lists. The user still sees every image together, so the site-wide QA sheet still matters.

**The user's own pick** skips the category rule and the cap (never the same-topic rule):
- `plan.mjs ... --reserve <slug>=<layout>!` marks that one slug as the user's pick. The reservation stores it, and the renderer honours it for that slug and layout, so the Maker needs nothing extra.
- `--user-pick` on a `plan.mjs` call covers every reservation in that call (on a render, that one render).

Nothing else skips it (`--force` is only for a redo the user explicitly asks for). When nothing free fits an article, design a new variant in the family (shown to the user first).

### 4. Should it be vibrant?

| Vibrant | Allowed on |
| --- | --- |
| The deep-dunes blue (`"bg": "blue"`, card layouts) | only `checklist` (always blue), `versus/table`, `window`, `before-after/flow` (a big white card); separately, the Gumloop `versus/tiles` paints its own approved blue field (its default) |
| The black and blue layouts | `dark`, `versus/slash`, `versus/duo`, `versus/glass` on its black field, `versus/tiles` on its blue field |

**Rule: at most 1 in 3 images per category is vibrant (blue and black together), never neighbours** ("VIBRANT CHECK FAILED"); a layout that can't go on the blue is refused with "VIBRANT FIT FAILED". `checklist` goes on the blue only (its light field was deleted in the approved review), so it always counts as vibrant: if a neighbour is vibrant, pick another layout.

### 5. Which background?

Leave `bg` out. The renderer picks the layout's best-fitting light field (`sky`, `paper`, `cream`, `g5`; the checklist always gets the blue), and refuses one that doesn't flatter the illustration ("BACKGROUND FIT FAILED"). A blue-heavy illustration gets a neutral field. `prompt`, the headline layouts (except `logotype`, which only takes `cream`), the Gumloop layouts and the originals paint their own canvas, so `bg` on them is refused ("BACKGROUND CHECK FAILED: … paints its own canvas"); the Gumloop layouts, `versus/frost` and `versus/bento` pick their canvas with `field` instead (leave it out for the default), prompt takes only `"field": "soft"` (its calmer glow), and every other layout takes no `field` (refused).

## Layouts: 19 modes, 30 layouts

**Card layouts** (light fields, white UI cards):

| Layout | Shows | Best for | Light bg (best first) | On blue? |
| --- | --- | --- | --- | --- |
| `before-after` | raw card → clean card | how-to, migration | g5, sky | no |
| `before-after/flow` | icon card → arrow → lifted icon card | "old way → new way" | g5, sky | **yes** |
| `versus/overlap` | tilted overlapping cards + VS badge | X vs Y | sky, cream | no |
| `versus/table` | one comparison table + VS badge | X vs Y, 2–3 dimensions | sky, cream | **yes** |
| `hub` | blue centre tile + 6–7 logo tiles (logos only) | "best X" lists | cream, paper | no |
| `focus` | key phrase in a blue selection box + skeleton card | one idea, 2–3 values | sky, g5 | no |
| `stat` | giant number + breakdown card | one headline number | paper, cream | no |
| `ranked` | bars ranked by a real metric | rankings | sky, g5 | no |
| `timeline` | steps on a track + callout | process, "how long" | cream, sky | no |
| `checklist` | tilted checklist card with progress | how to choose, requirements | none (the light field was deleted) | **blue only** (the renderer sets it) |
| `prompt` | faded panel, headline, pill bar | cost, FAQ, "what is" | its own light-blue gradient field (`bg` is refused; `"field": "soft"` for a calmer one) | no |
| `stack` | takeaway card, two cards peeking from the top | one key rule | g5, cream | no |
| `window` | app window: list pane + detail pane | vendor lists, pricing | sky, g5 | **yes** |

**Headline layouts** (after Chatbase; they paint their own canvas, so leave `bg` out: it is refused; `logotype` only takes its own `cream`). White ones sit in a grey frame, `logotype` sits on cream, black ones count as vibrant. None shows the site mark:

| Layout | Shows | Best for |
| --- | --- | --- |
| `versus/pills` | two facing blue pills (flat cuts at the outer edges, rounded tips a little over half a pill's height apart, a subtle gradient with fine noise) with the logos on **white circles** at the tips, the question below in black | X vs Y, only when both products have a logo that sits on white; once per category, at most 2 across the site |
| `versus/connect` | a centred black headline **on one line** (two lines only when a pair is too long to read on one), each brand's **own app icon in its original colours** filling its tile, linked to a VS circle, dot patches | X vs Y, only when both brands have a solid app icon; once per category, at most 5 across the site |
| `versus/slash` | black, dot grid, heavy-caps names, every name two-tone, **white + that brand's colour** (never all one colour), italic VS with a glowing streak | X vs Y (vibrant); once per category, at most 5 across the site |
| `versus/duo` | black, tag pill, big white headline; two watercolour panels in each brand's colour with its white logo | X vs Y (vibrant); once per category, at most 5 across the site |
| `dark` | black, the product's icon in black (#0A0A0B) on a white tile top-left, tag pill, big white name, a watercolour panel in the product's own colour with its logo in white | single-product articles; never X vs Y (vibrant); once per category, at most 3 across the site |
| `logotype` | the product's black logo: its icon in white on a black rounded tile beside the black wordmark, large and centred on cream with a faint grid; no other text | single-product articles whose logo is **black** with strong typography; once per category, at most 2 across the site |

**Gumloop layouts** (user references, approved Oct 2026; they paint their own canvas, so leave `bg` out: it is refused). Leave `"field"` out for the default, or set one of the layout's approved fields (first = default); anything else is refused ("FIELD FIT FAILED"). The black and blue fields count as vibrant. Logos: `versus/glass`, `swap` and `badge` show each brand's full **wordmark** (icon + typography), fetched automatically (a brand without one is typeset in Inter); `versus/tiles` shows the brands' app icons (filled tiles) or their marks on white; `versus/type` shows the names only:

| Layout | Shows | Best for | Fields (default first) |
| --- | --- | --- | --- |
| `versus/type` | the two names set big and bold, a small centred "vs", the second name in the accent, on a faint "+" grid | X vs Y (names, no logos) | light |
| `versus/tiles` | two tilted tiles with the brands' logos, above a big "A vs B" headline and the title's angle as a subline, sparse dot field, faint ring. Both tiles share one treatment: **both filled** with their brand colour, or **both white** with the brand's mark | X vs Y; both brands with a filled app icon (both tiles filled), or both with a logo that sits on white (both tiles white); never one of each | blue, light |
| `versus/glass` | both full wordmarks in their own colours on a frosted glass bar over a mesh gradient | X vs Y, brands with strong wordmarks | light, black |
| `swap` | the old thing → a dashed loop arrow → the new thing with a soft glow, "+" grid | switch, migration, "is X worth it", "old way → new way" | light |
| `badge` | a title (or logo), the key figure in a tinted rounded box, a muted + bold line under it, sparse dots | cost and stat articles | light |

**Retired** (refused with "RETIRED LAYOUT" before any other check; they never come back): `brandline`, `folder`, `versus/scale`, `versus/chat`, `versus/split`, `versus/duet`, `versus/rows`, `versus/logos`. `brandline` was a background with only a headline ("the bg looks good, but not like this with just a title"); its glow field now carries `lineup`, and the blue mesh behind glass still has no layout with a real illustration (`references/fields/`).

**Originals** (built after the user had seen every other layout; approved in batches 3 and 4; light only):

| Layout | Shows | Best for |
| --- | --- | --- |
| `receipt` | a big black headline on the left (semibold, at most 84px), a tilted white receipt with a zigzag tear on the right: the article's rows and a bold blue total | cost and pricing articles; every row sits inside the total's range; the headline sits on the total line (`"place": "bottom"`) |
| `definition` | a dictionary entry on ruled lines: the term, its full form, a blue rule and a numbered one-line definition in the article's own words | "what is X" articles |
| `shortlist` | a tilted white notepad on the left (punched top band, margin rule, numbered names on ruled lines, a blue icon sticker on the pad) and the black headline on the right | "best X" lists, the article's own picks in its order ("wow love it", batch 4) |
| `lineup` | one centred row of square white logo tiles on a frosted glass bar over the glow field; no headline, no watermark (the user's own reference) | "best X" lists with 3–6 real logos |
| `versus/frost` | two big frosted-glass logo tiles on the light mesh, a glass "vs" disc between them, each name under its tile; no headline | X vs Y, any pair with real marks (light mesh only; the blue mesh was disapproved) |
| `versus/bento` | a light bento grid in the white frame, no pattern: per brand a name cell with a mono owner tag, an icon cell and a fact cell; a blue "vs" disc on the seam | X vs Y whose logos can't match (e.g. NetSuite's solid tile vs SAP's wordmark); one parallel fact per side |

## The Rules

### The heading mirrors the blog title

Use the title's own words and meaning, shorter: keep the subject and the angle, drop the year and filler. Every spec sets `"articleTitle"`; the renderer refuses drifting headings ("HEADING CHECK FAILED").

| Blog title | Good | Bad |
| --- | --- | --- |
| EMR Software Cost 2026: Pricing by Practice Size | EMR Cost by Practice Size | What EMR really costs |
| 7 Best ERP Software for Small Businesses in 2026 | 7 Best ERP | Seven ERPs. One right fit. |

### Never invent, never drop a qualifier

Only the article's own facts (numbers, names, steps, comparisons), in its own wording. Every figure keeps its qualifier ("per provider", "up to", "from", "minimum"). Figures shown together never contradict each other.

```jsonc
// Bad
{ "value": "$140/mo" }
// Good
{ "value": "$140/mo", "caption": "minimum per provider" }
```

### Never more than 15 words

At most 15 visible words, 7 per element, no sentences ("TEXT CHECK FAILED"). Secondary lines only when they are the story. Cut subs first, then sentence tails.

### Every image has enough real content

Each layout needs enough real facts to fill its frame ("CONTENT CHECK FAILED"): window 2+ rows, hub 6–7 products, ranked, checklist, timeline and shortlist 3+, stat card and focus 2+ rows, lineup 3–6 logos. Pick a layout that suits fewer facts rather than padding one.

### Logos are the brand's real, current mark

Set `"logo": "<domain>"` wherever a product is named; the renderer's free chain finds it and darkens pale grey marks. The chain, in order: a local file (relative to the spec) or a URL is used as is; otherwise the Brandfetch symbol (with a client ID) → Iconify `logos` (icon, then full logo) → Simple Icons → the Brandfetch square icon (with an ID; edge to edge only when it is a solid app tile) or, without an ID, Google's favicon → a letter tile. The wordmarks on glass, swap and badge and the logotype lockup come from Brandfetch or a local file only. Check every logo by eye: an anniversary or campaign badge is wrong. If the chain finds the wrong mark, save the official one from the brand's own website to `featured-images/assets/` and use `"logo": "../assets/<file>.png"`.

### One family, one finish

- Light fields (`sky`, `paper`, `cream`, `g5`) carry thin guide lines and fine grain (no grain on `cream`); the vibrant blue carries heavy grain in soft rolling bands.
- One big white UI card or hero. The blue gradient marks only the active/anchor element; inactive things are grey.
- Real logos in their original colours, balanced in their tiles; logos alone (no name cards) where they're recognisable.
- Every headline is black `#0A0A0B` (white on the black and blue fields), on every layout and every brand. The renderer hard-codes it: a brand file's `headline` other than `#0A0A0B` is ignored with a warning. Card-layout headlines are semibold 600.

### Shadows follow the background

None on blue or black. Minimal and tinted to the field on light backgrounds. The renderer applies this; never hand-add a heavy shadow.

### White designs sit in a grey frame

A white design always sits in a white rounded panel inset 28px on `#F2F2F3`, so it reads as its own block on a white blog page (automatic in `versus/pills`, `versus/connect`, `versus/type`, `versus/tiles` on light, `swap`, `badge`, `definition`, `shortlist` and `versus/bento`). No frame on the rest: `receipt` paints its own warm cream dotted field, and `versus/glass`, `versus/frost` and `lineup` paint their own mesh or glow.

### Headline layouts speak in one voice

Every word in pills, connect, duo and dark is Inter 500 Medium; only `versus/slash` keeps its heavy Poppins caps. Headlines carry no blue words (black on pills and connect, white on duo and dark; see "One family, one finish").

### Never the site mark on a headline layout

`"craft": true` + `"series"` adds the site mark and a series tag to a **card** layout only, in a natural empty slot, on at most 1 in 3 images, never neighbours ("SERIES CHECK FAILED"). `dark` shows the product's own icon instead.

### Delivered images are permanent

Once QA passes and the user has the images, finalize them (`scripts/finalize.mjs`). A finalized image keeps its files in `featured-images/<slug>/`, stays in the site history and the folder ledger forever, keeps counting as used in its category, and is never re-created or overwritten ("FINAL IMAGE LOCKED"). Redo one only when the user explicitly asks.

### Show options, don't argue

For any "I don't like it" or a new look, render 2–3 options side by side at once and let the user pick. Never bring back anything listed as rejected in `references/agents.md` (Visual checklist, V9).

## Keep Learning (Required)

The user's goal is images made without their guidance, and never having to repeat feedback. Everything they say is a lesson: a note, a reference, "this is right", "this is wrong", "love it", "disgusting". Treat each one the same way, in this order, before the next image:

1. **Prompt:** rewrite it as a clear prompt, show it, then act on it.
2. **Principle:** add it to `references/taste.md` with the user's words quoted and the image named (as evidence under an existing principle, or a new one). Praise is evidence too: what they love is a rule to keep.
3. **Lesson:** add what happened to `references/lessons.md`.
4. **Check:** if it can be measured (a size, a colour, a count, a match), make the renderer enforce it and list it in `references/checks.md`, so it can't come back.
5. **Generalise:** when the same correction comes twice, apply it to the whole family (black headlines went from one layout to all).
6. **Decide:** a rejection goes into `references/agents.md` V9 ("Decided, never re-opened") and, for a layout, into `RETIRED` in `scripts/layouts.mjs` (its code deleted from `render.mjs`, its specs archived to `~/.blog-featured-images/_archive/`). A newly approved image gets an example spec in `examples/` and a line in `references/approved/sources.json`.
7. **Tell:** tell every running Maker and QA agent about the new rule before their next image.
8. **Reference:** a shared inspiration goes into `references/inspiration.md` (what was taken, what was rejected) before building.
9. **Refresh and test:** `node <skill-dir>/scripts/test-examples.mjs --refresh` rebuilds every approved image with the new rule; compare old and new and fix any unintended change.
10. **Publish:** update every file that mentions the rule, run the regression (`references/checks.md`), then push approved work only (`references/lessons.md`, "Publishing").

A lesson that lives only in a conversation is a lesson lost: the next session, and every agent, only knows what is written in these files.

## Four Roles, Always

Each role's job, steps, prompt template and limits are in `references/agents.md`; follow them exactly. An agent never both makes and approves an image.

| Role | How many | Does | Never |
| --- | --- | --- | --- |
| **Orchestrator** (you) | 1 | Reads the articles, checks logos, plans and reserves layouts, pre-flights, briefs all Makers in one message, starts both QA agents in one message, routes fixes, fixes renderer bugs in the skill, delivers and finalizes | Approves an image |
| **Makers** | 1 per article (1 per 2–3 when the batch is over 12), in parallel | Write each spec from the article's own facts for the assigned layout, render it, return the paths plus every fact with its source sentence | Pick a layout; use `--force` |
| **Visual QA** | 1 per batch; 1 per category for 12+ images | Judges looks on the contact sheet and PNGs (Visual checklist) | Checks facts; edits |
| **Fact QA** | 1 per batch; 1 per ~15 articles | Checks every word and number against the article text (Fact checklist); needs no images, so it runs alongside Visual QA | Judges looks; edits |

An image ships only when **both** QA agents pass it. Failures go back to their own Maker (both agents' fixes merged) and are re-checked only by the QA agent that failed them, for up to 3 rounds.

## Workflow (Fast Batch Mode)

1. **Read:** `node <skill-dir>/scripts/read-articles.mjs <url> <url> ... --out featured-images/articles` reads every URL in parallel into `articles/<slug>.md`. Note each article's type, core idea, 3–6 hard facts, **category** and **topic**.
2. **Plan:** answer the decision framework above for every article (logo checks included; usage as in §3, which `plan.mjs` applies), then reserve once per category, every article of that category in one command (`--category` applies to every slug in it):
   ```bash
   node "<skill-dir>/scripts/plan.mjs" --brand <b> --category <c> --reserve <slug>=<mode>[/<variant>][!][@<topic>] ...
   ```
   `!` marks the user's own pick for that slug (§3). The list stops at the next `--flag`. Release a reservation you won't render: `plan.mjs --brand <b> --release <slug> ...` (only unrendered ones). Show the plan when doing more than 3 images.
   - **When the user updates the Template Usage page** (https://claude.ai/artifact/8wxx5rif2nNTk81bzgaQ6q), sync it before planning:
     1. Read the page's database with ArtifactData: collection `usage` (one doc per layout, `{code, status: "used" | "unused", cats}`) and the doc `done` in collection `usage-meta` (written when the user presses Save all & finish).
     2. Write `references/used-layouts.json` as `{_note, source, brand, recordedAt: <done.at>, updatedAt, layouts: {<code>: {status, cats}}}`, keeping `brand` (`medsoftwarehub`) and the `_note`'s wording (the record is the truth as of `recordedAt`; every image rendered (drafts too), reserved or delivered after `recordedAt` that isn't superseded is added on top).
     3. Check it: `plan.mjs --brand <b> --category <c>` for each category the user named, and read any `USED-LAYOUTS WARNING`.
     4. Push.
3. **Spec + render (Makers, in parallel):** one `specs/<slug>.json` each (always `articleTitle`, `brand` (the site's file in `brands/`; without it the neutral `default` brand is used), `category`, `slug`, `topic` when shared, `logo` on named products), then:
   ```bash
   node "<skill-dir>/scripts/render.mjs" "featured-images/specs/<slug>.json" --out "featured-images/<slug>"
   ```
   `featured-images/` lives in the user's project folder, never in a temporary or scratch folder. Outputs: `master.png` (1600×900), `16x9-1200.webp` (social/OG), `7x5.webp` (theme crop), `card-350x250.png` (size check). Every render prints its output folder, then `layout=<mode>/<variant> bg=<field> category=<category> words=N/15` (`field=<field>` in place of `bg=` on the Gumloop layouts and the originals).
4. **QA, both at once:** the moment the last Maker returns, build the sheet of the whole site (`node <skill-dir>/scripts/sheet.mjs --brand <b> --out featured-images/qa-sheet.png --highlight <slug1>,<slug2>,...`), then start **Visual QA and Fact QA in one message**.
5. **Fix** only the failures, in parallel. **Deliver** each image as soon as both QA agents pass it (Report Format above). Ask before uploading anything to a website. Fix renderer problems in the skill itself, and say so in the delivery note.
6. **After any change to the skill**, run `node <skill-dir>/scripts/test-examples.mjs` (and `--refresh` when an approved look changed) before pushing.
7. **Finalize** the delivered images:
   ```bash
   node "<skill-dir>/scripts/finalize.mjs" --brand <b> <slug> <slug> ...
   ```
   It also copies each image and its spec to `~/.blog-featured-images/delivered/<brand>/<slug>/`. `--list` shows every delivered image.

## When the Renderer Refuses

Never work around a refusal with `--force` or another folder.

The renderer checks in this order: retired layout, unknown mode or variant, missing category, `field` (`FIELD FIT`), `bg` on a layout that paints its own canvas (`BACKGROUND CHECK`), the heading; then the logo checks (`LOGOTYPE`, `PILLS LOGO`, `CONNECT LOGO`, `TILES LOGO`, `SLASH NAME`, `GLASS LOGO`; `--check-only` stops here); then `CHECKLIST FIELD`, a `bg` that doesn't exist (`BACKGROUND CHECK`), `CONTENT`, `FAIRNESS`, `FINAL IMAGE LOCKED`, `VARIETY` (same topic, then the category and the site-wide cap), `VIBRANT CHECK`, `SERIES`, `VIBRANT FIT`, `BACKGROUND FIT`; and `TEXT` last, once the page is built. `LOGO FILE MISSING` fires wherever a local logo file is first read (in the logo checks, or when the page is built).

| Message | Fix |
| --- | --- |
| `RETIRED LAYOUT` | That layout was retired by the user and never comes back: pick a live one (`plan.mjs` lists them) |
| `Unknown mode` / `Unknown variant` | A typo or a layout that doesn't exist: use a mode and variant from `scripts/layouts.mjs` (the message lists them) |
| `CATEGORY MISSING` | Add `"category"` (the article's blog category). There is no fallback: a layout is used once per category |
| `HEADING CHECK FAILED` | Rewrite the heading from the title's key words |
| `TEXT CHECK FAILED` | Cut subs that aren't the point, then sentence tails, until ≤15 words and ≤7 per element |
| `VARIETY CHECK FAILED` | That layout is already used in this category (or has hit its site-wide cap): use one it lists, not-used-yet layouts first, then layouts used only in other categories (set `mode`, plus `variant` when not `default`). Only the user's own pick (`<slug>=<layout>!` or `--user-pick`, §3) skips it. It also fires when a same-topic article already uses this mode; nothing skips that one, the user's pick included: use another mode |
| `BACKGROUND FIT FAILED` | Remove `bg` (or use one it lists) |
| `BACKGROUND CHECK FAILED` | That background doesn't exist (use `sky`, `paper`, `cream`, `g5` or `blue`), or "… paints its own canvas": the layout paints its own, so remove `bg` (use `field` where the layout has one) |
| `VIBRANT CHECK FAILED` | A neighbour is already vibrant (blue or black). On a card layout, use a light background; on a layout that paints its own canvas (`bg` is refused there), pick a light layout, or `"field": "light"` for `versus/tiles` and `versus/glass`; a checklist is blue only, so pick another layout |
| `VIBRANT FIT FAILED` | This layout doesn't go on the blue; remove `"bg": "blue"` |
| `CHECKLIST FIELD FAILED` | The checklist goes on the blue only (its light field was deleted in review): remove `bg`. If a neighbour is already vibrant, pick another layout |
| `SERIES CHECK FAILED` | Remove `"series"` |
| `CONNECT LOGO CHECK FAILED` | A brand has no solid app icon with its own background colour: use `versus/pills`, `versus/slash` or `versus/duo` (or save the brand's square app icon to `featured-images/assets/`) |
| `SLASH NAME CHECK FAILED` | A one-word name with no capital break (e.g. Acumatica) can't be split into white + colour: mark the coloured part with `{{ }}` ("Acu{{matica}}") or use the article's fuller product name |
| `PILLS LOGO CHECK FAILED` | A product's only logo is a solid app tile, which can't sit on the white circle: use `versus/connect`, `versus/slash` or `versus/duo` (or save the brand's transparent logo to `featured-images/assets/`) |
| `LOGOTYPE CHECK FAILED` | The product's logo isn't black, or has no separate icon for the black tile: use `dark` (or, if the brand has a black lockup, save it to `featured-images/assets/` and set `"logotype"` to it) |
| `CONTENT CHECK FAILED` | Add the article's own facts to fill the layout (e.g. 2+ window rows); if it has no more, pick a layout that suits fewer facts. Never pad |
| `FAIRNESS CHECK FAILED` | `dark` on an article whose title says "vs" or "versus": use a versus layout that shows both products |
| `LOGO FILE MISSING` | The local file named in the spec isn't at that path (relative to the spec): put it in `featured-images/assets/` and reference it as `../assets/<file>` |
| `FIELD FIT FAILED` | That Gumloop layout doesn't use this field: use one it lists, or leave `field` out for its default. On a layout with no `field` option (everything but the Gumloop layouts, frost, bento and prompt's `"soft"`), remove it |
| `GLASS LOGO CHECK FAILED` | A wordmark is too wide for the glass bar: save a compact lockup (4:1 or narrower) to `featured-images/assets/`, or use another versus layout |
| `TILES LOGO CHECK FAILED` | The two tiles can't match: one brand only has a filled app tile and the other has no filled icon. Use `versus/type`, `versus/glass`, `versus/slash` or `versus/duo` |
| `FINAL IMAGE LOCKED` | That article's image was already delivered and is permanent. Don't re-create it; a new article needs its own slug and folder. Redo it only if the user explicitly asks (`--force`) |

## Setup

- **Needs:** Node 18+, Chrome or Edge (or the `CHROME` env var), `npm install` in `scripts/`, and `npm i -g agent-browser` for fast article reading. **Without agent-browser**, read the articles with WebFetch in parallel, save the text to `featured-images/articles/<slug>.md`, and continue.
- **Brandfetch client ID** (optional, free at brandfetch.com/developers): `~/.blog-featured-images/config.json` as `{"brandfetchClientId": "…"}` or the `BRANDFETCH_CLIENT_ID` env var. **Never commit it, and never put it in a brand file.** Without it, logos still work through Iconify, Simple Icons and Google's favicon; then `versus/connect` needs each brand's square app icon and `logotype` its black lockup saved to `featured-images/assets/`, and glass, swap and badge typeset names in Inter unless a wordmark file is saved there.
- **New site:** copy `brands/_template.json` to `brands/<site>.json` and fill in the brand colours, plus `markUrl` and `markName` for the optional site mark (the headline stays `#0A0A0B`). The user's record (`references/used-layouts.json`) belongs to `medsoftwarehub`, so a new site has no record until the user keeps one for it: its usage is its own history alone.
- Fonts (Inter, Poppins, JetBrains Mono), icons (Phosphor) and logos load from the internet at render time.
- History is per brand (`~/.blog-featured-images/history-<brand>.json`, or `FEATURED_HISTORY_DIR`). It holds every rendered, reserved and delivered image, so never delete it. A re-render or re-reservation of a slug that isn't delivered yet replaces its entry. Parallel renders, plans and finalizes share it under a lock.

## Review Checklist

The QA agents check every image against the Visual and Fact checklists in `references/agents.md`, and the renderer refuses what it can measure (the table above). Before delivering, also check what only taste catches:

| Issue | Fix |
| --- | --- |
| One element outweighs its partner (a giant number, a heavy headline) | Rebalance until both read as one composition (taste 1) |
| Two parallel elements styled differently (one filled tile, one white) | Give them one treatment, or pick a layout where they can match (taste 2) |
| A pattern you notice before the content (dense, dark or competing with it), or one you can't find | Sparse and faint; edge-only, clear behind the content, on `shortlist`, `lineup` and dark fields; none on `versus/bento` (taste 4) |
| A background with only a headline | Add a real illustration or use another layout (taste 5) |
| Self-Critique not run | Run it (`references/taste.md`) and fix every "no" |
