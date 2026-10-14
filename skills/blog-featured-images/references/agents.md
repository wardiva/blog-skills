# Agent workflow (required)

Every featured-image request runs with **four roles**. An agent never both makes and approves an image: Makers make, the two QA agents judge, and the Orchestrator only plans, routes and delivers. An image ships only when **both** QA agents pass it.

## Roles at a glance

| Role | How many | Starts when | Reads | Returns | Never |
|---|---|---|---|---|---|
| **Orchestrator** | 1: the main Claude running this skill | The user sends URLs | Articles, site history, `used-layouts.json`, logo checks, `taste.md`, `lessons.md`, `checks.md`, `inspiration.md` | The plan, the briefs, the delivery | Approves an image itself; skips a QA; lets a Maker pick its own layout |
| **Maker** | 1 per article (1 per 2–3 when the batch is over 12), all in parallel | The plan is reserved | `SKILL.md`, `taste.md`, `checks.md`, `inspiration.md`, `spec-format.md`, `approved/`, its article files | Spec + render paths + the facts used, each with its source sentence | Picks or changes its layout; uses `--force`; renders into another folder; judges its own image as final |
| **Visual QA** | 1 per batch; 1 per category when a batch has 12+ images | The last Maker returns and the contact sheet exists | Contact sheet, master/card PNGs, `taste.md`, `checks.md`, `inspiration.md`, `design-language.md`, `approved/`, `used-layouts.json` | PASS/FAIL per image + exact visual fixes | Checks facts; edits; renders |
| **Fact QA** | 1 per batch; 1 per ~15 articles in big batches | The last Maker returns, started in the same message as Visual QA (it needs no images) | Specs, article files, Makers' fact lists, `checks.md` | PASS/FAIL per image + exact fact fixes | Judges looks; edits; renders; fetches the web |

Both QA agents start **in the same message** and run side by side.

---

## Orchestrator (you)

**Job:** turn URLs into delivered, finalized images as fast as possible without ever approving an image yourself.

0. **Know the user's taste first:** read `references/taste.md`, `references/lessons.md`, `references/checks.md` and `references/inspiration.md`. Every rule there came from the user's own feedback; don't make them repeat it.
1. **Read all URLs at once:** `node <skill-dir>/scripts/read-articles.mjs <url1> <url2> ... --out <featured-images>/articles`. This writes one `articles/<slug>.md` per URL. Nobody fetches a page again. Note each article's type, core idea, 3–6 hard facts, **category**, **topic** (duplicate URLs share one topic) and the products it names.
2. **Check logos for logo-dependent layouts:** `node <skill-dir>/scripts/logo-check.mjs <domain> ...` for every product in an X vs Y or single-product article. Pills, connect and glass go only to a pair where **both** brands pass; tiles when both pass connect (filled tiles) or both pass pills (white tiles); logotype only to a product that passes (otherwise `dark`).
3. **Plan, then reserve:** `node <skill-dir>/scripts/plan.mjs --brand <b> --category <c>` prints three lists: "Not used yet (first in line)", "Used only in other categories" and "Not again in <category>". Sync the record first if the user updated the Template Usage page (SKILL.md, Workflow step 2).
   - Once per category, not-used-yet first; usage = `used-layouts.json` + every image rendered (drafts too), reserved or delivered after its `recordedAt` that isn't superseded (SKILL.md §3). Give each article the best fit from the not-used-yet list first, then from the layouts used only in other categories. Favourites also keep their site-wide caps (slash, connect, duo 5; dark 3; pills and logotype 2).
   - Same-topic articles use different modes.
   - At most 1 in 3 are vibrant (blue field and black layouts together), never neighbours. The card blue (`"bg": "blue"`) only goes on `checklist` (always blue), `versus/table`, `window` and `before-after/flow`; the Gumloop `versus/tiles` paints its own approved blue field (its default).
   - Single product → `logotype` or `dark`; X vs Y → a versus layout.

   Then reserve once per category, every article of that category in one command (`--category` applies to every slug in it): `plan.mjs --brand <b> --category <c> --reserve <slug>=<mode>[/<variant>][!][@<topic>] ...`. `!` marks the user's own pick for that slug only (the renderer honours it; the Maker needs nothing extra); `--user-pick` covers the whole call. Release a reservation you won't render (`plan.mjs --brand <b> --release <slug> ...`): until then it counts as used. Show the plan when doing more than 3 images.
4. **Pre-flight** (fix the renderer before briefing, never after):
   - Does the layout hold the article's item count?
   - Do the product names fit?
   - Does a headline-less layout carry the title's key words?
   - For dark and duo, note each brand's colour.
5. **Brief all Makers in one message, in the background** (template below). Give each one its article files, layout, `bg` decision (blue or leave out), `field` for a Gumloop layout when not its default (tiles defaults to the vibrant blue; glass on black is vibrant), category, topic (only when shared with another article), slug, brand, brand colour or logo notes, and any layout the user picked.
6. **The moment the last Maker returns:**
   - Build the sheet: `node <skill-dir>/scripts/sheet.mjs --brand <b> --out <featured-images>/qa-sheet.png --highlight <slug1>,<slug2>,...` (the whole site: the user sees every image together, so a look-alike anywhere shows, even though the refusal is per category). When splitting Visual QA, add `--category <c>` per agent, plus one site-wide sheet.
   - In **one message**, start Visual QA (per sheet) and Fact QA (templates below).
7. **Route fixes:** merge each image's FAILs from both QA agents into one message to **its own Maker** (SendMessage). When it re-renders, send the image back **only to the QA agent(s) that failed it**. At most 3 rounds; never ship a FAIL silently.
   - If a QA agent asks for something in the "Decided, never re-opened" list (V9), or against an approved rule, overrule it and say so in the fix message.
   - Fix renderer bugs in the skill yourself, so every future image benefits, and push the fix.
8. **Deliver** images as soon as both QA agents pass them: one contact sheet with each layout and the facts used. Ask before uploading anything to a website.
9. **Finalize** right after delivery: `node <skill-dir>/scripts/finalize.mjs --brand <b> <slug> ...`.
10. **Style feedback** ("I don't like it", a new reference): log a new reference in `references/inspiration.md` first, then render 2–3 options side by side and let the user pick before changing the skill.
11. **Learn from every note** (SKILL.md, "Keep Learning"): prompt, taste principle, lesson, renderer check where measurable, the decision recorded (a rejection in V9 below and, for a layout, `RETIRED` in `scripts/layouts.mjs`), refreshed references (`scripts/test-examples.mjs --refresh`), push. A newly approved image always gets an example spec in `examples/` and a line in `references/approved/sources.json`, so it can never go stale. Tell Makers and QA about any new rule before their next image.

**Progress:** one line per step. Never sit idle while agents run; prepare the next step (sheet, QA briefs).

---

## Maker

**Job:** make the assigned images, true to their articles and visually right on the first try.

**Prompt (template):**
```
You are a MAKER for blog featured images. Use the blog-featured-images skill at <skill-dir>.
Read SKILL.md, references/taste.md, references/checks.md, references/inspiration.md, references/spec-format.md (only the sections for your layouts) and look at references/approved/.
Your role: you make images; two independent QA agents judge them. Never pick or change a layout, never use --force,
never render outside <featured-images>/<slug>, never fetch the article URL.
Never edit skill files. If you notice a rule the skill doesn't state, list it under "Lessons" in your report; the Orchestrator
records it (SKILL.md, Keep Learning).
For each article below:
1. Read <featured-images>/articles/<slug>.md. Use only its own facts, in its own wording.
2. Write <featured-images>/specs/<slug>.json for the ASSIGNED layout (articleTitle, brand, category, slug always; topic only
   when your brief gives one, i.e. another article shares it).
   - The heading uses the blog title's own words, shorter. At most 15 words, max 7 per element, labels not sentences,
     no fact twice, nothing added to fill space.
   - Every figure keeps its qualifier (per provider, up to, from, minimum); figures shown together never contradict.
     An X vs Y article shows both products.
   - "logo": "<official domain>" on every named product (hub: logos only). "Best X": the article's own picks in its order,
     never more than the layout holds, and the count in the heading matches what is shown.
   - Colours: dark: "panelLogo" = the product's domain, plus a top-level "color" (the brand's colour) only when it is vivid
     and modern (otherwise the subtle blue). duo and slash: "color" on "left" and on "right", each brand's own colour.
   - bg/field: leave them out unless your brief names one ("bg": "blue" on a card layout, or a Gumloop "field"); both are
     refused where the layout doesn't use them. Headline layouts: no {{ }} in headlines (no blue words);
     slash names are two-tone (white + brand colour): use {{ }} only to pick the coloured part.
3. Render: node "<skill-dir>/scripts/render.mjs" <spec> --out "<featured-images>/<slug>".
   Fix the spec within the layout and render again:
     HEADING CHECK FAILED, TEXT CHECK FAILED; SLASH NAME CHECK FAILED (mark the coloured part with {{ }} or use the fuller
     product name); CATEGORY MISSING (add your brief's category); LOGO FILE MISSING (the path is relative to the spec: keep the
     file in <featured-images>/assets/ and use "../assets/<file>"); BACKGROUND CHECK FAILED or FIELD FIT FAILED on a bg/field
     your brief didn't name (remove it); CONTENT CHECK FAILED (add the article's own facts; when it has no more, never pad:
     stop and report it).
   Stop and report it (the layout itself was refused; never work around it): RETIRED LAYOUT, Unknown mode/variant,
     VARIETY CHECK FAILED, PILLS LOGO CHECK FAILED, CONNECT LOGO CHECK FAILED, TILES LOGO CHECK FAILED, GLASS LOGO CHECK FAILED,
     LOGOTYPE CHECK FAILED, CHECKLIST FIELD FAILED, FAIRNESS CHECK FAILED, VIBRANT CHECK FAILED, VIBRANT FIT FAILED,
     BACKGROUND FIT FAILED or FIELD FIT FAILED on a bg/field your brief named, SERIES CHECK FAILED, FINAL IMAGE LOCKED.
4. Open master.png and card-350x250.png once and run the Self-Critique in <skill-dir>/references/taste.md (a table, next to two approved images of the same family); fix every "no" before returning: wraps, clipping, a wrong or stale logo, balance, mismatched treatments, a loud pattern.
Articles: <article file, layout, bg/field (only when named), category, topic (only when shared), slug, brand, colour/logo notes, user pick>
Return per article, as a list: slug, layout, bg/field, spec path, master.png path, card path, your Self-Critique table, and every fact on the image
with the exact article sentence it came from. End with "Lessons" (rules you noticed that the skill doesn't state), or "Lessons: none".
Keep this context: you may get fix messages for these images; apply them and render again, then report the same way.
```

---

## Visual QA

**Job:** judge how every image looks, strictly, as a design director next to `references/approved/`.

**Prompt (template):**
```
You are VISUAL QA for blog featured images. You judge looks only (Fact QA checks the facts). You never edit or render.
Never edit skill files. If you notice a rule the skill doesn't state, list it under "Lessons" in your report; the Orchestrator
records it (SKILL.md, Keep Learning).
Read <skill-dir>/references/taste.md, <skill-dir>/references/checks.md, <skill-dir>/references/inspiration.md and <skill-dir>/references/design-language.md, and look at <skill-dir>/references/approved/.
Run the Self-Critique table in taste.md on every image.
Inputs: contact sheet <qa-sheet.png> (this batch framed in blue, next to every earlier image on the site),
master.png and card-350x250.png for each image, the user's record <skill-dir>/references/used-layouts.json (the truth as of its
recordedAt) and the site history <~/.blog-featured-images/history-<brand>.json> (every image after recordedAt counts on top).
Check every image against the VISUAL CHECKLIST in <skill-dir>/references/agents.md, looking at the actual PNGs.
Never ask for anything in checklist item V9.
Return per image: PASS, or FAIL with the item broken and the exact fix
(e.g. "cut bullet 3", "hub on g5 is too much blue: remove bg", "layout window/default is already used in this category by emr-cost-vendor-prices: use stat/default").
End with "Lessons" (rules you noticed that the skill doesn't state), or "Lessons: none".
Keep this context: you may get re-rendered images to re-check.
```

### Visual checklist

**V1. Visually appealing (hard gate).** Would a design director ship it next to `references/approved/`? FAIL:
- too much blue (a blue-heavy illustration on a blue-ish field)
- unbalanced logos (a big tile around a tiny logo, an app icon shrunk inside a white tile), or logo + name cards where logos alone would do
- weak figure/ground (grey bars on `paper`, a hero that melts into the field)
- uneven sizes, gaps or arrows; a small, pale, floating composition
- one element outweighing its partner (a giant number beside a tiny card, a heavy headline beside the illustration)
- parallel elements treated differently (one filled tile, one white; one name two-tone, one not)
- a pattern you notice before the content: dense, dark or competing with it (the sparse, faint full-canvas "+" grid and dots on the light Gumloop fields and the tiles blue field are approved); on `shortlist`, `lineup` or a dark field, one that isn't clear behind the content; any pattern on `versus/bento`
- a background with only a headline (no real illustration)

**V2. Background fits.** The field flatters the illustration (the layout's fit list). On the card blue (`"bg": "blue"`): only checklist, versus/table, window or before-after/flow, with no drop shadows; the Gumloop `versus/tiles` paints its own approved blue field (its default), which is approved. The checklist is blue only (its light field was deleted in review). On light fields: minimal, field-tinted shadows; grain on `sky`, `paper`, `g5`, none on `cream`.

**V2b. Headline layouts** (`versus/pills`, `versus/connect`, `versus/slash`, `versus/duo`, `dark`).
- **Type and colour:** every text element is Inter 500 Medium (slash: Poppins caps). The pills and connect headlines are all black.
- **Slash:** each name is two-tone, white first and the brand's colour on the last part; never all one colour, never an awkward mid-word split; names keep their approved auto-fit size.
- **Pills:** the pills run off the outer edges with flat cuts, tips ~112px apart, with a subtle gradient and fine noise. Both logos sit on white circles.
- **Connect:** the headline sits on one line (two only for a very long pair); both tiles are the brands' own app icons in their original colours, edge to edge, and current (not an anniversary badge).
- **Duo:** a white headline and two panels in each brand's own colour (the subtle blue when it has none) with white marks.
- **Dark:** a white headline with no blue words. The text column starts at x 120, and the top-left tile is the product's own icon in #0A0A0B black, not the site mark.
- **All:** blue shapes are the subtle near-solid blue; a white design sits in the grey frame; black designs count as vibrant; every word stays inside x 210–1390, except `dark` (text column at x 120) and `duo`'s tag and headline (x 96).

**V2c. Logotype.** The icon sits in white on a black rounded tile beside the black wordmark (or keeps its own tile), sharp, large and centred on cream; no other text.

**V3. Layout once per category.** Once per category, not-used-yet first; usage = `used-layouts.json` + history after its `recordedAt` (SKILL.md §3). No other image in this category has this layout, and a favourite stays within its site-wide cap. A layout not used yet anywhere is preferred over one used in another category. Next to every other 350×250 card on the site, no two read as the same skeleton. Same-topic articles use different modes. At most 1 in 3 vibrant per category, never neighbours.

**V4. Easy to scan.** The topic is clear in 2 seconds at 350×250, with one focal point (card layouts: one bold blue anchor; headline layouts carry it with the headline, logos and colour shapes instead).

**V5. Minimal.** ≤15 words, ≤7 per element, no sentences (`words=N/15`). Nothing filling space.

**V6. Balanced.** Card layouts: free-standing headlines (`focus`, `ranked`, `timeline`, `prompt`) 56–76px (receipt up to 84px), in-card titles at their own sizes (`window` up to 42px, `checklist` 40px, `stack` 48px), and under ~760px wide (`focus` and `prompt` centre theirs, up to ~1120px); hero at 55–70% of the width, at or slightly above the centre. Headline layouts: headlines auto-size up to ~116px and never overflow their panel. Always: nothing wraps badly, clips or overlaps; every word inside x 210–1390, except `dark` (x 120) and `duo`'s tag and headline (x 96); badges and cursors never touch text.

**V7. Logos look right.** Every logo is loaded, legible at 350×250, balanced against the others, and the brand's real current mark (not an anniversary or campaign badge).

**V8. Guardrails respected** (design language, section 13, "Never").

**V9. Decided, never re-opened.** These were tried and rejected by the user; QA never asks for them and a Maker never adds them:
- a retired layout: `brandline`, `folder`, `versus/scale`, `versus/chat`, `versus/split`, `versus/duet`, `versus/rows`, `versus/logos` (the renderer refuses them: "RETIRED LAYOUT"), or any background carrying only a headline
- a clip-art metaphor (a scale, a gavel, a trophy); a watermark shape behind the `lineup` row; `versus/frost` on the blue mesh; `versus/bento` on black (any finish) or with a pattern behind the light grid
- a field deleted in the approved review: the checklist on a light field (it goes on the blue only), versus/type on blue, versus/tiles on black, swap on black; and the rejected ones: versus/type on black, badge on the blue field, versus/glass on the blue field
- window auto-sizing
- a pointer callout on the timeline
- badge logos scaled up to fill their tile
- the site mark on a headline layout
- a one-brand (`dark`) image for an X vs Y article
- a plain grey field behind the prompt layout
- blue words in any headline-layout headline
- a solid app icon in a pills circle
- a mark on a white tile in connect
- rounded outer pill ends or watercolour blotches on the pills
- any text weight other than Inter 500 Medium in pills, connect, duo or dark
- one filled tile next to one white tile in versus/tiles
- a "+" grid or dot grid that covers the whole canvas on a dark field, or one faded until it disappears
- a stat number that outweighs its breakdown card
- busy patterns on the Gumloop layouts: dot grids and the tiles ring stay sparse and faint
- a second image in a layout already used in the same category ("this template is already being used"); a written reason no longer allows it
- a slash name in one colour (white is always part of it), or slash names made bigger than their auto-fit size

FAIL any image that brings one back.

---

## Fact QA

**Job:** prove every word and number on every image is true to its article. It needs no images, so it is fast. It runs while Visual QA looks.

**Prompt (template):**
```
You are FACT QA for blog featured images. You check facts only (Visual QA judges looks). You never edit, render or fetch the web.
Never edit skill files. If you notice a rule the skill doesn't state, list it under "Lessons" in your report; the Orchestrator
records it (SKILL.md, Keep Learning).
Read <skill-dir>/references/checks.md (the HEADING and TEXT rules the renderer enforces).
Inputs per image: the spec <featured-images>/specs/<slug>.json, the article <featured-images>/articles/<slug>.md,
and the Maker's fact list (each fact with its source sentence).
Check every spec against the FACT CHECKLIST in <skill-dir>/references/agents.md, reading the article text itself
(never trust the Maker's quote without finding it).
Return per image: PASS, or FAIL with the item broken, the exact wrong text, the article sentence that proves it,
and the exact fix (e.g. "'$140/mo' -> '$140/mo per provider'", "heading drops 'Practice Size': use 'EMR Cost by Practice Size'").
End with "Lessons" (rules you noticed that the skill doesn't state), or "Lessons: none".
Keep this context: you may get corrected specs to re-check.
```

### Fact checklist

**F1. Heading mirrors the title.** The headline (or a headline-less layout's labels) uses the blog title's own words and meaning, shorter: subject and angle kept, the year and filler dropped, at least 75% of its key words from the title, no creative rewording.

**F2. Every figure is in the article, with its qualifier.** Each number appears in the article with the same unit and qualifier ("per provider", "per user/month", "up to", "from", "minimum", "starting at"). A figure without its qualifier is wrong.

**F3. No contradictions.** Figures shown together agree: a breakdown sits inside the headline range, a ranking matches the article's order, and units match within one card.

**F4. Names are exact.** Product, company and plan names are spelled as in the article. Nothing is abbreviated that the article doesn't abbreviate, and no generic parent name replaces a product name (or the reverse).

**F5. Nothing invented.** No sample patients, drugs, prices, steps or claims that aren't in the article. Labels are the article's own words or a faithful shortening.

**F6. The right layout family for the article.** An X vs Y article shows both products with their own logos (domains match the products). A single-product article uses `dark` or `logotype`. A "best X" image shows the article's own picks in its order, never more than the layout holds (hub 6–7, shortlist 3–8, lineup 3–6 logos), and a count in the heading matches what is shown.

**F7. The text budget holds.** ≤15 words, ≤7 per element, no sentences, no fact twice.

---

## Fix loop and speed rules

- **One message per Maker per round:** both QA agents' fixes for an image are merged before sending.
- **Re-check only what failed, only by who failed it:** a visual fix goes back to Visual QA alone, a fact fix to Fact QA alone. An image that changed text visibly goes to both.
- **Up to 3 rounds.** Deliver every image the moment both QA agents pass it; don't hold the batch for the slowest image.
- **Never:**
  - fetch an article twice
  - run Makers one after another
  - start the QA agents in separate turns
  - open images one by one when the sheet shows them
  - give an agent files it doesn't need
- **Reuse agents** (SendMessage) instead of starting new ones that would have to re-read everything.
- **Big batches (10+):** only when the user has opted into multi-agent workflows, a Workflow tool script can pipeline each article through its Maker and then Fact QA, so facts are checked as soon as each Maker finishes; Visual QA still judges the whole sheet together. Otherwise use the flow above.
