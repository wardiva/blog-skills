# Agent workflow (required)

Every featured-image request runs with **four roles**. An agent never both makes and approves an image: Makers make, the two QA agents judge, and the Orchestrator only plans, routes and delivers. An image ships only when **both** QA agents pass it.

## Roles at a glance

| Role | How many | Starts when | Reads | Returns | Never |
|---|---|---|---|---|---|
| **Orchestrator** | 1: the main Claude running this skill | The user sends URLs | Articles, site history, `used-layouts.json`, logo checks, `taste.md`, `lessons.md`, `checks.md`, `inspiration.md` | The plan (with new-design options when needed), the briefs, the background picker, the batch critique, the delivery and its link page | Approves an image itself; skips a QA; lets a Maker pick its own layout; picks a background for the user; asks the user for notes on a disapproval |
| **Maker** | 1 per article (1 per 2–3 when the batch is over 12), all in parallel | The plan is reserved | `SKILL.md`, `taste.md`, `checks.md`, `inspiration.md`, `spec-format.md`, `approved/`, its article files | Spec + render paths + the facts used, each with its source sentence | Picks or changes its layout or background; sets `bgPick` unless its brief names the user's pick; uses `--force`; renders into another folder; judges its own image as final |
| **Visual QA** | 1 per batch; 1 per category when a batch has 12+ images | The last Maker returns and the contact sheet exists | Contact sheet, master/card PNGs, `taste.md`, `checks.md`, `inspiration.md`, `design-language.md`, `approved/`, `used-layouts.json` | PASS/FAIL per image + exact visual fixes | Checks facts; edits; renders |
| **Fact QA** | 1 per batch; 1 per ~15 articles in big batches | The last Maker returns, started in the same message as Visual QA (it needs no images) | Specs, article files, Makers' fact lists, `checks.md` | PASS/FAIL per image + exact fact fixes | Judges looks; edits; renders; fetches the web |

Both QA agents start **in the same message** and run side by side.

---

## Orchestrator (you)

**Job:** turn URLs into delivered, finalized images as fast as possible without ever approving an image yourself.

0. **Know the user's taste first, before every batch:** re-read `SKILL.md`, `references/taste.md`, `references/lessons.md`, `references/checks.md` and `references/inspiration.md`, and look at the approved sheet (`references/approved/`), even when the batch redoes images the user disapproved. Every rule there came from the user's own feedback; don't make them repeat it. Batch 6: "the images that I have disapproved has already been used multiple times, so I wanted to create new ones. But keep in mind what you have learned, what tools you have built. If you need to rerun the skill, then do it." A first pass that leans on templates already used site-wide gets rejected. **Never ask the user for notes:** a disapproval with no note is diagnosed from `taste.md` (its rejected patterns) and acted on. The user, batch 7: "You should know why I have disapproved something. You have… learn .md… taste.md".
1. **Read all URLs at once:** `node <skill-dir>/scripts/read-articles.mjs <url1> <url2> ... --out <featured-images>/articles`. This writes one `articles/<slug>.md` per URL. Nobody fetches a page again. Note each article's type, core idea, 3–6 hard facts, **category**, **topic** (duplicate URLs share one topic) and the products it names. A Google Doc reads as text through its `/export?format=txt` URL.
2. **Check logos for logo-dependent layouts:** `node <skill-dir>/scripts/logo-check.mjs <domain> ...` for every product in an X vs Y or single-product article. Pills, connect and glass go only to a pair where **both** brands pass; tiles when both pass connect (filled tiles) or both pass pills (white tiles); logotype only to a product that passes (otherwise `dark`).
3. **Plan, then reserve:** `node <skill-dir>/scripts/plan.mjs --brand <b> --category <c>` prints three lists: "Not used yet (first in line)", "Used only in other categories" and "Not again in <category>". Before planning any batch, sync the record from the Template Usage page (SKILL.md, Workflow step 2): read its `usage` collection (ArtifactData) and write every doc whose `updatedAt` is later than the record (`recordedAt`, or that layout's `asOf`) into `references/used-layouts.json` as that layout's entry with `"asOf": <updatedAt>`. When the doc `done` in collection `usage-meta` has `at` later than `recordedAt` (the user pressed Save all & finish), write the whole record instead (`recordedAt: <done.at>`, keep `brand` and the `_note`, no per-layout `asOf`). Then run `plan.mjs --brand <b> --category <c>` for each category, read any USED-LAYOUTS WARNING, and push (SKILL.md, Workflow step 2). The user may change the page without saying "done with usage" (Oct 19, 20:09: `versus/frost` marked used in clinical-software never reached the record).
   - Once per category, not-used-yet first; usage = `used-layouts.json` + every image rendered (drafts too), reserved or delivered after its `recordedAt` (or a layout's own `asOf`) that isn't superseded (SKILL.md §3). Give each article the best fit from the not-used-yet list first, then from the layouts used only in other categories. Favourites also keep their site-wide caps (slash, connect, duo 5; dark 3; pills and logotype 2).
   - **The rule is the floor.** "you created most of the designs that were already being used… So I want you to create a new version of them." When the plan would mostly reuse templates already on the site, design new layouts from approved parts (SKILL.md, "New designs are built from approved parts"; never props, devices or materials; a new skeleton, not a restyle) and show the options to the user before briefing anyone.
   - **Map, research, then invent.** "map all of our previous templates… That is the design language you need to follow, but you can go to browser and do your research". First list what each approved image is built from (its parts, its field, its type), then look at good product blogs in the browser (`inspiration.md`), then draw. Show at least 2 options that differ in composition (the skeleton), not only in colour or field.
   - **References beat invention.** In batch 7 about one invented option in ten was approved; reference-led options (Dub, Peec, Calendly, Databricks) passed in one or two rounds. After two failed rounds of inventions, the next round is reference-led: browser research of product blogs with our vibe, each reference measured on the original and translated to our fields, colours, 22% tile radius and "vs". Not the approved-looks picker: of the four approved-looks picks, three were later replaced (Vanta center, SimplePractice badges, EHR implementation costgrid); only Claims Denial's prompt stayed.
   - **One skeleton per review page:** every family at most once on a page of N articles, and once per category per batch ("stop repeating designs now"; two lineups in specialty were both replaced later). Each review round gets a brand-new collection name, renamed everywhere in the page builder; no voice-note button (it didn't work in the artifact: "forget about it").
   - **Vary the fields across the batch:** "we have multiple colors, black background color, blue gradient, and then like so many other". Mix the black canvas layouts (`glassbar`, `dark`, slash, duo, glass on black, `versus/band`), the blue gradient (`versus/span`, `versus/glasspair`, `bluegrid`), glow, mesh, white and the light fields (the faint grid, our light glass), within the vibrant rule; never one colour for everything ("you are just using same color"). "use black too" means plain black or the dunes: never another brand's gradient, a hand-mixed blue or the navy-blob black (`taste.md` 28).
   - **An approved option belongs to its article.** "I want like the designs that I have approved. Those are fine. Now I want more designs for the rest of the URLs." Never roll a newly approved layout out across the batch.
   - **Siblings never share a category:** layouts built from one approved part (`versus/checks` and `picks`, both checklist cards) never go in the same category.
   - Same-topic articles use different modes.
   - At most 1 in 3 are vibrant (blue field and black layouts together), never neighbours. The card blue (`"bg": "blue"`) only goes on `checklist` (always blue), `versus/table`, `window`, `before-after/flow` and `versus/fan`, and, when the user picks it (`bgPick`), on `versus/checks`, `picks` and `stack` (all their text in a white card); the Gumloop `versus/tiles` paints its own approved blue field (its default), and `glassbar` is always black (vibrant); so are `versus/band` (plain black), `bluegrid`, `versus/span` and `versus/glasspair` (blue); `research` (light glass) is not. When the cap blocks an image the user approved, tell them and offer an override or a different black or blue design.
   - Single product → `logotype` or `dark`; X vs Y → a versus layout, chosen by the fact the article gives (SKILL.md §1); best-of and cost → by their logos and facts (SKILL.md §1).

   Then reserve once per category, every article of that category in one command (`--category` applies to every slug in it): `plan.mjs --brand <b> --category <c> --reserve <slug>=<mode>[/<variant>][!][@<topic>] ...`. `!` marks the user's own pick for that slug only (the renderer honours it; the Maker needs nothing extra); `--user-pick` covers the whole call. Release a reservation you won't render (`plan.mjs --brand <b> --release <slug> ...`): until then it counts as used. Show the plan when doing more than 3 images.
4. **Pre-flight** (fix the renderer before briefing, never after):
   - Does the layout hold the article's item count?
   - Do the product names fit?
   - Does a headline-less layout carry the title's key words?
   - For dark and duo, note each brand's colour.
   - Does each logo carry its weight? A plain-shape mark needs its wordmark; a thin or wide one needs a per-card `scale` (lineup, hub, versus/center).
   - For a new design: does it share a skeleton with an approved layout at 350×250, or a sibling with another image in the category?
   - Is it the right concept for this article ("i love the design but is the concept right?")? A paired-figure layout (`versus/scores`, `versus/badges`, `versus/fan`, `versus/stacked`) needs a real number on both sides from one source and year. Does an X vs Y image read as a comparison at a glance ("doesnt look like comparison image")?
   - For a new design: would a senior designer ship it? Balanced, not scattered, not "too much", one corner radius across its tiles.
   - Is every product name the one people use ("it should be just zoom not zoom for healthcare")?
   - Is it one big object on a full stage (names ~120px, tiles 200–400px, cards ~900–1100px), with every figure inside an object, never a small widget on a gradient or a lone number on a field (`taste.md` 26, 27)?
   - For `versus/band` and `versus/peecpair`: do both brands have a real text wordmark (or a clean mark for its name to sit beside), and will the pair read one width (`taste.md` 31)? `versus/band` only when both turn white cleanly.
   - For a reference-led design: is the reference measured on the original file, and only the field, colours, tile radius and "vs" translated (`taste.md` 32)?
5. **Brief all Makers in one message, in the background** (template below). Give each one its article files, layout, `bg` decision (blue, the user's pick, or leave out), `field` for a Gumloop layout when not its default (tiles defaults to the vibrant blue; glass on black is vibrant), category, topic (only when shared with another article), slug, brand, brand colour or logo notes, and any layout the user picked. Name a background as "the user's pick" only when the user picked it; only then does the Maker add `"bgPick": true`. The batch-7 canvas layouts take no `bg`: `versus/span` and `versus/glasspair` may say `"canvas": "dunes"`, `squircles` `"canvas": "grid"`, `research` `"glass": true`, and nothing else. When the background is undecided, brief the same design on 2–3 of our fields as options (the user chose the dunes for Curve Dental and McKesson, the grid for squircles).
6. **The moment the last Maker returns:**
   - Build the sheet: `node <skill-dir>/scripts/sheet.mjs --brand <b> --out <featured-images>/qa-sheet.png --highlight <slug1>,<slug2>,...` (the whole site: the user sees every image together, so a look-alike anywhere shows, even though the refusal is per category). When splitting Visual QA, add `--category <c>` per agent, plus one site-wide sheet.
   - In **one message**, start Visual QA (per sheet) and Fact QA (templates below).
7. **Route fixes:** merge each image's FAILs from both QA agents into one message to **its own Maker** (SendMessage). When it re-renders, send the image back **only to the QA agent(s) that failed it**. At most 3 rounds; never ship a FAIL silently.
   - If a QA agent asks for something in the "Decided, never re-opened" list (V9), or against an approved rule, overrule it and say so in the fix message.
   - Fix renderer bugs in the skill yourself, so every future image benefits, and push the fix.
8. **The user picks the backgrounds** (SKILL.md §5 and Workflow step 6): "we have so many background why are you fixated on just one. show me 12 images and options for backgrounds and i'll select the bg for each". Once both QA agents pass an image's design, run `scripts/bgpick.mjs` (Workflow step 6): `render` renders each image on every field its layout can take, each option with a temporary copy of the history so the real one is never written; `page` builds the picker page (publish it with its `bg/` thumbnails and the `db` capability), and you wait for the user's picks; then read the collection and run `apply --picks picks.json`, which writes `"bg": "<field>", "bgPick": true` into each spec and refuses a field the layout can't take (`default`, the layout's own background, is always accepted except on `ranges` bare, which is white only). Render each spec into its own folder last. Layouts that refuse a pick (pills, connect, slash, duo, dark, glassbar, glass, frost, frostrow, receipt, definition, lineup, prompt, and the twelve batch-7 canvas layouts: checkcard, flatcard2, research, squircles, bluegrid, typehero, peecpair, inline, span, duel, band, glasspair) get one option: their own canvas; `ranges` with `"bare": true` gets one: `white`. Never choose for the user. Then send each picked render to Visual QA for clipping and legibility only (never field fit) before delivering.
9. **Critique the batch, then deliver.** Before delivery, build one contact sheet of the whole batch and critique it as a set: a repeated skeleton, a small widget on a gradient, navy-blob black, one field everywhere (`taste.md` 34: 11 of batch 7's 20 approved finals were redone after delivery, "need new templates for these"). Fix what it finds, then deliver images once their backgrounds are picked: one contact sheet with each layout and the facts used, fixes in Before/After tables, separate files per image and a link page with a Copy button per row (title → Google Doc → file). Ask before uploading anything to a website.
10. **Finalize** right after delivery: `node <skill-dir>/scripts/finalize.mjs --brand <b> <slug> ...`. Render finals from the project root, never from inside `featured-images/`. A redo the user asks for is rendered with `--redo` (lifts only the delivered lock; every other check runs) and finalized again (new `finalizedAt`, earlier ones kept in `previousFinalizedAt`), never with `--force` (it skipped the heading, word, usage, vibrant, field-fit and delivered checks when batch 7 was first re-finalized).
11. **Style feedback** ("I don't like it", a new reference): log a new reference in `references/inspiration.md` first, then render 2–3 options side by side and let the user pick before changing the skill. At least 2 options change the composition (what goes where), not only the colour, the field or the chart inside the same frame: batch 6's round 3 was disapproved as a set ("all of them looks too much and you are just using same color"). Before inventing a new design, map the approved sheet and research the product blogs in `inspiration.md` (Clerk, Mintlify; Dub, Peec, Calendly, Databricks) in the browser. Never ask for notes:
    - **A disapproval with no note:** diagnose it from `taste.md` (the rejected patterns) and act.
    - **"This can be improved", no detail:** diagnose it against the reference and the craft rules; show A (the fixes) and B (the fixes plus one idea).
    - **An ambiguous note:** render each reading as an option; don't ask.
    - **The background is undecided:** the same design on 2–3 of our fields.
    - **Two failed rounds of inventions:** the next round is reference-led (step 3).
12. **Learn from every note** (SKILL.md, "Keep Learning", 10 steps): prompt, taste principle (a new one also gets a Self-Critique row and raises the principle count), lesson, renderer check where measurable, with a case in `scripts/test-refusals.mjs` for every decision the renderer or `plan.mjs` can enforce (otherwise a V- or F-check below, and a line in the Maker template), generalise a repeated correction to the whole family, the decision recorded (a rejection in V9 below and, for a layout, `RETIRED` in `scripts/layouts.mjs`; every count it changes (modes/layouts, retired, approved images, examples, refusal cases and steps, taste principles; after batch 7: 36/60, 134, 61, 69, 277 cases / 296 steps, 34) updated in SKILL.md (its frontmatter description included), design-language.md, checks.md, spec-format.md, V9, the README, the `scripts/render.mjs` header comment and memory), Makers and QA told about any new rule before their next image, a shared inspiration logged in `references/inspiration.md`, refreshed references and the refusal suite (`scripts/test-examples.mjs --refresh` runs both), push. A newly approved image always gets an example spec in `examples/` and a line in `references/approved/sources.json`, so it can never go stale.

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
     A figure from a "Starting Price" column needs "From" (a prompt row's sub: "From $799/feature/year"; ranges: "open": true).
     Paired figures (versus/scores, versus/badges, versus/fan, versus/stacked) are two real numbers from one source and year, never a number against
     words ("ew revert it"): when the article has the newer figure for one side only, keep the year that has both.
     One dash style per image (the en dash). An X vs Y article shows both products.
   - A list heading keeps the title's angle ("Best Small Practice EMR", not "5 Best EMR").
   - "logo": "<official domain>" on every named product (hub: logos only). "Best X": the article's own picks in its order,
     never more than the layout holds, and the count in the heading matches what is shown.
   - Names as people say them: the short name people use, not the long official form ("it should be just zoom not zoom for
     healthcare").
   - Logos: a parent's mark only when the article says the product is now sold as the parent's, or the parent's name is in
     the product name; a plain-shape mark gets its wordmark lockup; a thin or wide mark gets "scale" (lineup and hub 0.5-0.8,
     versus/center sides default 0.66). versus/center's "label" is the article's own word, never a stock icon.
   - Hierarchy and decoration: names never outweigh the key figure (versus/badges renders the approved hierarchy by default:
     leave out "nameSize", "nameWeight", "valueSize" and "spread"); nothing that adds nothing (versus/checks has no check boxes
     by default: never add "checks": true; ranges "bare" only together with "bg": "white", "bgPick": true (after the user's
     pick); versus/connect "cornerDots": false when your brief names it).
   - Colours: dark: "panelLogo" = the product's domain, plus a top-level "color" (the brand's colour) only when it is vivid
     and modern (otherwise the subtle blue). duo and slash: "color" on "left" and on "right", each brand's own colour.
   - bg/field: leave them out unless your brief names one ("bg": "blue" on a card layout, or a Gumloop "field"); both are
     refused where the layout doesn't use them. The batch-7 canvas layouts paint one approved field: "canvas" only "dunes" on
     versus/span and versus/glasspair, "grid" on squircles; "glass" only true on research; never anything else.
   - Batch-7 craft: one big object on a full stage (names ~120px, tiles 200-400px, cards ~900-1100px), every figure inside an
     object, flat shapes (card corners, no rotated card, only tiles of 240px or less tilt, at most 8 degrees), each thing said
     once (no tag repeating the title, no names under tiles the title already names, no typed name beside its own wordmark),
     wordmark pairs real and one width, lettering white on black and black on light, a two-tile pair 200px+ per tile and
     nearly touching. When the brief names the user's background pick, write "bg": "<field>",
     "bgPick": true; never add "bgPick" otherwise (the user picks backgrounds, not you).
   - Headline layouts: no {{ }} in headlines (no blue words); slash names are two-tone (white + brand colour): use {{ }}
     only to pick the coloured part. spotlight and focus are the only places {{ }} marks a phrase: the title's key phrase or angle in the blue selection box.
   - Never draw a prop, a device or a material; use the layout as approved.
   - Craft like a senior designer: balanced, not scattered, never "too much"; one corner radius across a set of tiles
     ("corner radius of logo bg is not consistent"); an X vs Y image reads as a comparison at a glance ("doesnt look like
     comparison image").
3. Render from the project root (never from inside <featured-images>/): node "<skill-dir>/scripts/render.mjs" <spec> --out "<featured-images>/<slug>".
   A bare mark is cut from the brand's full logo, not from its app icon; Brandfetch image URLs need the renderer's browser user agent.
   Fix the spec within the layout and render again:
     HEADING CHECK FAILED, TEXT CHECK FAILED; SLASH NAME CHECK FAILED (mark the coloured part with {{ }} or use the fuller
     product name); CATEGORY MISSING (add your brief's category); LOGO FILE MISSING (the path is relative to the spec: keep the
     file in <featured-images>/assets/ and use "../assets/<file>"); BACKGROUND CHECK FAILED or FIELD FIT FAILED on a bg/field/`bare`
     your brief didn't name (remove it); CONTENT CHECK FAILED (add the article's own facts; when it has no more, never pad:
     stop and report it).
   Stop and report it (the layout itself was refused; never work around it): RETIRED LAYOUT, Unknown mode/variant,
     VARIETY CHECK FAILED, PILLS LOGO CHECK FAILED, CONNECT LOGO CHECK FAILED, TILES LOGO CHECK FAILED, GLASS LOGO CHECK FAILED,
     LOGOTYPE CHECK FAILED, CHECKLIST FIELD FAILED, FAIRNESS CHECK FAILED, VIBRANT CHECK FAILED, VIBRANT FIT FAILED,
     BACKGROUND CHECK FAILED, BACKGROUND FIT FAILED or FIELD FIT FAILED on a bg/field/`bare` your brief named,
     BACKGROUND PICK FAILED, SERIES CHECK FAILED, FINAL IMAGE LOCKED.
4. Open master.png and card-350x250.png once and run the Self-Critique in <skill-dir>/references/taste.md (a table, next to two approved images of the same family); fix every "no" before returning: wraps, clipping, a wrong or stale logo, balance, mismatched treatments, a loud pattern, a prop or device (Our parts), a borrowed skeleton (Own skeleton), a chart that doesn't read in one glance (One glance), a name heavier than its figure (Hierarchy), a box or dot patch that adds nothing (Earns its place), a heading or count dressed as a logo tile (Label vs logo), a long official product name (Names), a template the user has seen many times offered as new (Fresh batch), a field that makes the batch one colour (Field variety: report it; the Orchestrator plans fields), a number against words (Real pairs), a concept that doesn't fit the article (Concept fit), a praised pattern not used where it fits (Praised parts: spotlight's selection box on the title's angle over the article's own logos; big type for one published figure per side), and anything a senior designer wouldn't ship: scattered, "too much", mixed corner radii, a comparison that doesn't read as one (Pro craft, Not scattered, Radii, Reads as comparison; V10–V14 below); and the batch-7 rows (V15–V24 below): a small widget on a gradient (Full stage), a lone number on a field (Figure in an object), navy-blob black or an outside gradient (Our black, our blue), a pill-ended panel or a rotated card (Flat shapes), a tag or name said twice (Said once), an unequal wordmark pair (Wordmark pair), a reference eyeballed (Reference numbers), a pair far apart or small (Close pair); Once per page and Batch view are the Orchestrator's, but report a repeat you notice. Then write the predicted verdict (taste.md, "Predict the Verdict": the closest approved image and the closest rejected pattern); a predicted reject is fixed before you return.
Articles: <article file, layout, bg/field (only when named; say "the user's pick" when it is), category, topic (only when shared), slug, brand, colour/logo notes, user pick>
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
Run the Self-Critique table in taste.md on every image (Radii, Names, Our parts, Own skeleton, Fresh batch, Field variety, One glance,
Hierarchy, Earns its place, Label vs logo, Real pairs, Concept fit, Praised parts, Pro craft, Not scattered, Reads as comparison,
Once per page, Full stage, Figure in an object, Our black, our blue, Flat shapes, Said once, Wordmark pair, Reference numbers,
Close pair, Batch view and Predicted verdict included), and compare each image with the rejected patterns in taste.md's "Predict the Verdict".
Ask of every image: "is this the right concept for this article?" (does the metric or picture show what the article is about),
not only "does it look good" (the user, on a design they loved: "i love the design but is the concept right?").
Ask too: "would a senior designer ship it?" (batch 6: "it looks like this is designed by a begineer not by a pro experienced
designer"; "it looks scattered, it looks like AI slop"). Judge the batch as a set: its fields vary, never one colour for everything,
and no skeleton appears twice on a review page or in a category (batch 7: your "repeat" calls were right almost every time).
Inputs: contact sheet <qa-sheet.png> (this batch framed in blue, next to every earlier image on the site),
master.png and card-350x250.png for each image, the user's record <skill-dir>/references/used-layouts.json (the truth as of its
recordedAt, or a layout's own asOf, which overrides it for that layout) and the site history
<~/.blog-featured-images/history-<brand>.json> (every image after that cutoff counts on top).
Check every image against the VISUAL CHECKLIST in <skill-dir>/references/agents.md (V1–V24), looking at the actual PNGs.
Never ask for anything in checklist item V9. A spec with "bgPick": true carries the user's own background: never fail its field.
Never propose a layout that was approved on another article as a replacement (an approved option belongs to its article).
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
- names outweighing the key figure they label: the figure leads the hierarchy (TheraNest vs Valant: "the heading of theranest and valant are too bold and big, visual hierrachy is not good and balanced"; fixed with `versus/badges` `nameSize` 44, `nameWeight` 600, `valueSize` 84, `spread`; taste 1)
- decoration that doesn't earn its place: check boxes, containers or dot patches that add nothing ("checkboxes are not needed" on `versus/checks`; "dont add container for bars section" on `ranges`; "delete these dot grid from top left and top right" on `versus/connect`; taste 10)
- a count or label tile among logo tiles that reads as one more logo tile ("7 best pediatric shouldnt be like other logos, this looks off": `grid` was retired; taste 2)
- parallel elements treated differently (one filled tile, one white; one name two-tone, one not)
- a pattern you notice before the content: dense, dark or competing with it (the sparse, faint full-canvas "+" grid and dots on the light Gumloop fields and the tiles blue field are approved); on `shortlist`, `lineup` or a dark field, one that isn't clear behind the content; any pattern on `versus/bento`
- a background with only a headline (no real illustration)
- a prop, a device or a material of any kind (a phone, a laptop, keycaps, sticky notes, a polaroid, a price tag, wood, felt, kraft paper): "not a single image that you have created matches our design language… why are you using mobile mockups?" Put it on the approved sheet: same designer, same parts? If not, FAIL (taste 17)

What the user praised is the bar to repeat: `spotlight` on Appointment Reminders ("perfect concept and design": the title's angle in the selection box over the article's own logos) and the `versus/scores` design ("i love the design"). A new design that copies a praised one under a new name is not new (`versus/spot` was rejected for exactly that). (taste 20)

**V2. Background fits.** The field flatters the illustration (the layout's fit list). On the card blue (`"bg": "blue"`): only checklist, versus/table, window, before-after/flow or versus/fan, with no drop shadows; the Gumloop `versus/tiles` paints its own approved blue field (its default), which is approved. The checklist is blue only (its light field was deleted in review). On light fields: minimal, field-tinted shadows; grain on `sky`, `paper`, `g5`, none on `cream`.
- **A field the user picked** (`"bgPick": true` in the spec, `bg=<field> (picked)` in the render line) is the user's choice: never FAIL it for fit, never ask for another field. Check only that nothing clips or loses legibility on it.
- **The batch-7 layouts** each sit on their one approved field (design language 3e): plain black (`versus/band`), the deep dunes (`versus/span`, `versus/glasspair`), `bluegrid`'s flat blue, the faint grid (`squircles`, `versus/duel`, `checkcard`, `versus/peecpair`), our light glass (`research`, `typehero`), the light glow (`flatcard2`), the light canvas (`versus/inline`); `strike` on glow or sky, `meter` on white. Never ask for another field on them.

**V2b. Headline layouts** (`versus/pills`, `versus/connect`, `versus/slash`, `versus/duo`, `dark`).
- **Type and colour:** every text element is Inter 500 Medium (slash: Poppins caps). The pills and connect headlines are all black.
- **Slash:** each name is two-tone, white first and the brand's colour on the last part; never all one colour, never an awkward mid-word split; names keep their approved auto-fit size. The split: several words colour the last word, on its own line; one word splits at its last capital break (AdvancedMD → Advanced + MD); `{{ }}` marks it by hand and must leave some white. A name may break onto two lines at its colour split when the one-line fit falls well below the approved size (eClinical / WORKS, 40px → 63px): that is not "made bigger".
- **Pills:** the pills run off the outer edges with flat cuts, tips ~112px apart, with a subtle gradient and fine noise. Both logos sit on white circles.
- **Connect:** the headline sits on one line when it reads at 72px or more within 1080px wide; only a longer pair breaks onto two lines, within 900px, clear of the corner dot patches; both tiles are the brands' own app icons in their original colours, edge to edge, and current (not an anniversary badge).
- **Duo:** a white headline and two panels in each brand's own colour (the subtle blue when it has none) with white marks.
- **Dark:** a white headline with no blue words. The text column starts at x 120, and the top-left tile is the product's own icon in #0A0A0B black, not the site mark.
- **All:** blue shapes are the subtle near-solid blue; a white design sits in the grey frame; black designs count as vibrant; every word stays inside x 210–1390, except `dark` (text column at x 120) and `duo`'s tag and headline (x 96).

**V2c. Logotype.** The icon sits in white on a black rounded tile beside the black wordmark (or keeps its own tile), sharp, large and centred on cream; no other text.

**V2d. Approved-parts layouts** (`versus/badges`, `versus/checks`, `versus/lanes`, `versus/scores`, `versus/center`, `spotlight`, `picks`, `cloud`, `ranges`, `count`) and any new design built like them:
- light grey tracks sit on a white card, never straight on the field; the one exception is `ranges` `"bare"` on the user's white pick ("use the previous bg, and in that dont add container for bars section"), whose tracks darken a step to hold on white
- callout lines touch what they name (a dot, or a bracket spanning a range)
- a blue tile carries the article's own word, never a stock icon (a stethoscope for "dermatology" is clip-art)
- an open "From" price fades out with no solid end (every bar end reads as a figure)
- a "vs" disc between two cards has about 20px clear on each side
- both sides of a two-product layout share one treatment (names, tiles, value boxes, price sizes)
- paired figures are two real numbers: a score or figure in words against a number looks broken ("ew revert it" on Oracle Health vs MEDITECH; the renderer refuses it on `versus/scores`; taste 2)
- every chart reads in one glance at 350×250: someone who hasn't read the article can say what it compares in two seconds (taste 18: "i like the design but it is confusing" retired `versus/range`)

**V2e. Batch-6 layouts** (`glassbar`, `figures`, `frostrow`, `costgrid`, `versus/fan`, `versus/stacked`), as approved (images 49–54):
- `glassbar`: the heading in white Inter 500 on the black canvas, one near-white frosted bar (label | hairline | value in the blue gradient), the caption in dimmed white, never grey hex over a glow; it counts as vibrant
- `frostrow`: every tile one size and one radius, on its own light mesh; names under the tiles, no numbers; the names people use ("just zoom")
- `figures`: two centred columns, value over label, one hairline between; `costgrid`: one blue anchor card and two white cards, labels, values and units aligned
- `versus/fan` and `versus/stacked`: both figures one size, the "vs" disc with its white ring on the seam, both logo tiles one treatment

**V2f. Batch-7 layouts** (`checkcard`, `flatcard2`, `research`, `squircles`, `bluegrid`, `typehero`, `strike`, `meter`, `versus/peecpair`, `versus/inline`, `versus/span`, `versus/duel`, `versus/band`, `versus/glasspair`), as approved (images 55–69):
- `checkcard`: Peec's checkbox exactly (box 120, radius 35, tick stroke 9, round caps, `#0081FF`), the grey card and the nested white card as measured; no grain
- `flatcard2`: one flat card; the figure inside the dashed selection; the cursor's tip on the selection's corner and its name tag (the qualifier) inside the card
- `research`: the frosted tag, black heading and one row of equal frosted tiles; blue guide lines, no dot pattern; a pair's tiles tilt at most 8° and just touch
- `squircles`, `versus/glasspair`: big frosted tiles (220px, 400px), marks in colour; glasspair's tiles at 22% radius, no text
- `bluegrid`: hairlines edge to edge, one pick per cell, every tile one size and radius, white heading
- `typehero`, `versus/inline`, `versus/duel`: big type that carries the pair (duel names ~120px); the "vs" small and grey
- `strike`, `meter`, `versus/span`: the figure inside its object (the card, the track, the lane); both sides of a pair on one true scale
- `versus/peecpair`, `versus/band`: real wordmarks, one width; lettering black on the light grid, white on black; marks in colour; `versus/band` only when both wordmarks turn white cleanly

**V3. Layout once per category.** Once per category, not-used-yet first; usage = `used-layouts.json` + history after its `recordedAt` (or a layout's own `asOf`, which overrides it for that layout; SKILL.md §3). No other image in this category has this layout, and a favourite stays within its site-wide cap. A layout not used yet anywhere is preferred over one used in another category. Next to every other 350×250 card on the site, no two read as the same skeleton. Same-topic articles use different modes. At most 1 in 3 vibrant per category, never neighbours. Also FAIL:
- a layout "built from" an approved one that changed only the styling, not the skeleton (horizontal range rows were the `ranked` skeleton again; a split card with "vs" on the seam is `versus/table`); an option offered after a disapproval that changed only the chart inside the same title, card and label row
- siblings from one approved part in one category (`versus/checks` and `picks` are both checklist cards)
- a batch filled mostly with templates already on the site, or one newly approved layout repeated across the batch ("I want like the designs that I have approved… Now I want more designs for the rest of the URLs"); three badges side by side read as one template. Never propose a layout approved on another article as a replacement

**V4. Easy to scan.** The topic is clear in 2 seconds at 350×250, with one focal point (card layouts: one bold blue anchor; headline layouts carry it with the headline, logos and colour shapes instead).

**V4b. The right concept for the article.** Ask "is this the right concept for this article?": does the metric, the chart or the picture show what the article is about, not just something true from it? A design the user loves can still be the wrong concept ("i love the design but is the concept right?", Oracle Health vs MEDITECH scores). FAIL a concept that only fits a side fact (taste 19).

**V5. Minimal.** ≤15 words, ≤7 per element, no sentences (`words=N/15`). Nothing filling space.

**V6. Balanced.** Card layouts: free-standing headlines (`focus`, `ranked`, `timeline`, `prompt`) 56–76px (receipt up to 84px), in-card titles at their own sizes (`window` up to 42px, `checklist` 40px, `stack` 48px), and under ~760px wide (`focus` and `prompt` centre theirs, up to ~1120px); hero at 55–70% of the width, at or slightly above the centre. Headline layouts: headlines auto-size up to ~116px and never overflow their panel. Always: nothing wraps badly, clips or overlaps; every word inside x 210–1390, except `dark` (x 120) and `duo`'s tag and headline (x 96); badges and cursors never touch text.

**V7. Logos look right.** Every logo is loaded, legible at 350×250, balanced against the others, and the brand's real current mark (not an anniversary or campaign badge). A mark that is only a plain shape (Phreesia's orange disc) on a logos-only layout needs its wordmark lockup; a thin or wide mark that looks lighter than its neighbours needs a per-card `scale` (judge the weight by eye, not by fill percentage).

**V8. Guardrails respected** (design language, section 13, "Never").

**V9. Decided, never re-opened.** These were tried and rejected by the user; QA never asks for them and a Maker never adds them:
- a retired layout, all 134 (the renderer refuses them: "RETIRED LAYOUT"): `brandline`, `folder`, `versus/scale`, `versus/chat`, `versus/split`, `versus/duet`, `versus/rows`, `versus/logos`; the batch-5 props layouts `versus/compare`, `versus/search`, `versus/polaroid`, `versus/notes`, `versus/phones`, `versus/browser`, `notify`, `wallet`, `stickers`, `letterboard`, `tags`, `keycaps`; `versus/window` (disapproved); `versus/range` ("i like the design but it is confusing"; lanes replaced it), `versus/rings`, `versus/share` (disapproved), `versus/sheet`, `versus/columns` (never approved); `versus/plans` ("i dont like the design, try smth else for comparison"), `versus/fit` (disapproved), `versus/spot` (Appointment's spotlight under a new name), `grid` ("7 best pediatric shouldnt be like other logos, this looks off"; both fixes disapproved; Pediatric went to `lineup`: "for this use this glass version template"); batch 6: `steps` ("it looks like this is designed by a begineer not by a pro experienced designer"), `numbered` ("numbers looks so weird and visually cluttered and unbalanced and corner radius of logo bg is not consistent…"), `versus/pill` ("doesnt look like comparison image"), `versus/chips` and `versus/offset` ("painfully bad visual design"), `versus/halves` ("i dont like this it looks off and doesnt match our design vibe"), `link`, `versus/annotate`, `versus/corners` ("all of them looks too much and you are just using same color… it looks scattered, it looks like AI slop"), `poster`, `versus/glasscards`, `versus/figures` (cut by QA, never shown; not the live `figures` mode); batch 7 (92): `versus/burst` ("disgusting shapes"), `versus/underline` ("too bad visual"), `versus/bubbles` ("ew"), `versus/delta` ("$20 looks so weird bec its so big there is no visula balance at all"), `slider` ("this layout is borint"), `footnote` ("too much text"), `heroglass` ("its too bad not visually appealing at all"), `horizon` ("i like the shape you used but over alll its too much., not visually apealing at all"), `gooey` ("ew dont connect and the gradient looks awful"), `capsule` ("i dont like this rounded it looks weird"), `cursorcard` ("not tilted rectangle pls also use our bgs"); disapproved with no note: `tree`, `bigword`, `sidecolumn`, `wordtag`, `market`, `estimate`, `index`, `horizonrow`, `tilegrid`, `iconrows`, `bluefield`, `horizon2`, `sideglow`, `eclipse`, `crescent`, `masthead`, `cropmarks`, `bracket`, `contrast`, `waffle`, `notepad`, `pricebar`, `spectrum`, `glowtiles`, `glasstiles`, `breakdown`, `typelist`, `toppick`, `arc`, `track`, `rating`, `versus/medallions`, `versus/profiles`, `versus/routes`, `versus/logobar`, `versus/outline`, `versus/gap`, `versus/toggle`, `versus/eclipses`, `versus/pricepair`, `versus/butterfly`, `versus/venn`, `versus/bands`, `versus/ladder`, `versus/tierchips`, `versus/lockups`, `versus/titlecard`, `versus/sidetiles`, `versus/aura`, `versus/iconbadge`; approved once, then replaced on every article and deleted ("actually delete all of them"): `flatcard` (improved into `flatcard2`), `avatars`, `glassrows`, `versus/glasssplit`, `bigtype`; never shown: `lockupwall`, `blueprint`, `plus`, `aurarow`, `byline`, `gridcells`, `collection`, `eyebrow`, `pillstat`, `fan` and `bento` (modes, not the live `versus/fan` and `versus/bento`), `editorial`, `cascade`, `glassbars`, `orbit`, `mosaic`, `versus/gauges`, `versus/segbar`, `versus/pairchips`, `versus/chipfigures`, `versus/pillrows`, `versus/pillduel`, `versus/vstack`, `versus/overlap2`, `versus/tiltcards`, `versus/chipcloud`. Also any background carrying only a headline
- a batch-7 layout on a field it wasn't approved on (span on black: "change bg, this bg doesnt look good"; glasspair on a hand-mixed blue: "use our good gradient bg"; squircles on Calendly's sky: "the gradient looks awful"; research on black: "for this use our glass bg"; span, glasspair or squircles on the glow, which was disapproved), `strike` or `meter` on the blue, a card under `meter` ("delete white container")
- the navy-blob black (black with navy glows) or another brand's gradient for a new design; pill-ended panels, rotated cards, liquid joins, bursts, bubbles, Venn diagrams, rims, orbits, org-chart trees
- asking the user for notes on a disapproval, or sending them to the approved-looks picker after failed rounds
- a score in words against a number (`versus/scores` with a 2026 figure for one side only: "ew revert it")
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
- device mockups, physical props or materials of any kind (phones, laptops, keyboards, sticky notes, polaroids, letter boards, price tags, wallets, notification stacks, browser chrome, wood, felt, kraft paper): all 12 batch-5 "new versions" were rejected ("not a single image that you have created matches our design language… why are you using mobile mockups?"), and their layouts are retired (above)
- a background the user didn't pick swapped in for one they did
- a long official product name where people use a short one ("it should be just zoom not zoom for healthcare")
- a batch in one colour, or options after a rejection that change only the colour ("you are just using same color")

FAIL any image that brings one back.

**Batch-6 craft checks** (V10–V14). Batch 6 retired 12 layouts on these; judge every image, and the batch as a set:

**V10. Pro craft.** Would a senior designer ship it next to `references/approved/`? FAIL anything that looks made by a beginner: uneven spacing, mismatched sizes, weights or alignments, a composition with no clear structure ("it looks like this is designed by a begineer not by a pro experienced designer"; taste 21).

**V11. Reads as a comparison.** An X vs Y image shows two matched sides with the pairing visible at 350×250 in one glance. FAIL one that reads as a list, a single card or a decoration ("doesnt look like comparison image"; taste 23).

**V12. Consistent radii.** Every tile, card and logo background in a set shares one corner radius (and one size, unless the size carries meaning). FAIL mixed radii ("corner radius of logo bg is not consistent"; taste 2).

**V13. Field variety across the batch.** Next to the batch's other images on the sheet, the fields vary: the black canvas layouts, the blue gradient, glow, mesh, white and the light fields. FAIL a batch where nearly everything sits on one colour ("you are just using same color"; "we have multiple colors, black background color, blue gradient, and then like so many other"; taste 24). A field the user picked is never failed.

**V14. Not scattered.** One composition, elements grouped and aligned, nothing "too much". FAIL arrows, labels, tiles or annotations strewn across the canvas ("all of them looks too much… it doesn't look visually balanced… it looks scattered, it looks like AI slop"; taste 22).

**Batch-7 checks** (V15–V24, taste 25–34). Batch 7 retired 92 layouts on these; judge every image, every review page and the batch as a set:

**V15. Once per page.** No other option on the review page, and no other image of this category in the batch, shares this skeleton, counted by skeleton, not by name. FAIL a repeat ("stop repeating designs now"; two lineups in specialty were both replaced; taste 25).

**V16. Full stage.** One object at a confident scale: names ~120px, tiles 200–400px, cards ~900–1100px wide. FAIL a small widget (a ~600px card, 14–22px labels) floating on a gradient (taste 26).

**V17. Figure in an object.** Every figure sits inside a card, a selection, a track, a struck claim, a type pair or a prompt. FAIL a lone hero number on a field (`bigtype`, `bracket`, `horizon`, `bluefield`, `versus/delta`: "$20 looks so weird bec its so big there is no visula balance at all"; taste 27).

**V18. Our black, our blue.** Black is plain black ("use full black bg"); blue is the deep dunes (or `bluegrid`'s blue). FAIL the navy-blob black, another brand's gradient or a hand-mixed blue ("change bg, this bg doesnt look good"; "the gradient looks awful"; "use our good gradient bg"), even when the user once said a gradient "matches" (taste 28).

**V19. Flat shapes.** Big panels take card corners (~40px); cards stay straight; only tiles of 240px or less tilt, at most 8°. FAIL a pill-ended panel ("i dont like this rounded it looks weird"), a rotated card ("not tilted rectangle pls"), a liquid join ("ew dont connect"), a burst ("disgusting shapes"), bubbles ("ew"), a Venn diagram, a rim, an orbit or an org-chart tree (taste 29).

**V20. Said once.** FAIL a tag that repeats the title ("delete dermatology tag"), names under tiles the title already names ("delete 360 encompass and encodepro text") or a typed name beside its own wordmark (taste 30).

**V21. Wordmark pair.** Real text wordmarks (or a mark with its name typed in ink), equal width by eye ("show some other whose logos width will look equal"), lettering white on black and black on light ("use black color for logo text"), marks in their colours. FAIL an unequal pair or coloured lettering on a cover that asks for ink (taste 31).

**V22. Reference numbers.** A reference-led design carries the reference's measured numbers; only the field, the colours, the 22% tile radius and the "vs" are translated to ours. FAIL a reference copied by eye ("use exact same checkboxes size and tick icon that was in its inpirsation") or one that kept its own colours, radius or "+" ("in our colors"; "make the corner radius consistenty"; "instead of + use vs"; taste 32).

**V23. Close pair.** A two-tile pair is 200px or more per tile and nearly touches; with a "vs", the gap is the "vs". FAIL a small pair or two tiles adrift (taste 33).

**V24. Batch view.** The whole batch, on one contact sheet before delivery, shows no repeats, no small widgets, no navy-blob black and no single field taking over. FAIL the batch, not one image, when it doesn't hold: 11 of batch 7's 20 approved finals were redone after delivery ("need new templates for these"; "these 2 can be improved"; "their designs are not good"; taste 34).

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

**F1. Heading mirrors the title.** The headline (or a headline-less layout's labels) uses the blog title's own words and meaning, shorter: subject and angle kept, the year and filler dropped, at least 75% of its key words from the title, no creative rewording. A list heading keeps the title's angle ("Best Small Practice EMR", not "5 Best EMR"). A tile label is not a heading: the hub's blue tile may shorten to the count and category ("7 Best ERP" on approved image 02) when the tile can't fit the angle. When the article gives two measures (hospitals vs beds), the title or metric names which one the figures use.

**F2. Every figure is in the article, with its qualifier.** Each number appears in the article with the same unit and qualifier ("per provider", "per user/month", "up to", "from", "minimum", "starting at"). A figure without its qualifier is wrong. A figure lifted from a "Starting Price" column needs "From" (in a `prompt` row's sub, an open `ranges` row); a score names its source and year as the article does ("2025 Best in KLAS overall score"). Paired figures are two real numbers from the same source and year: when the article gives the newer figure for one side only, keep the year that has both (never a number against words).

**F3. No contradictions.** Figures shown together agree: a breakdown sits inside the headline range, a ranking matches the article's order, and units match within one card.

**F4. Names and marks are exact.** Product, company and plan names are spelled as in the article. Nothing is abbreviated that the article doesn't abbreviate, and no generic parent name replaces a product name (or the reverse). A parent's logo stands in for a product only when the article says the product is now sold as the parent's (Change Healthcare → Optum) or the parent's name is in the product name on the image (AAPC Codify, Oracle Health); Klara is not ModMed, so Klara gets its own mark. Each `logo` domain or file matches its product. A name is the one people use when the article uses it too, not the long official form ("it should be just zoom not zoom for healthcare"). A name is never typed beside its own wordmark (the renderer hides it in `cloud`, `versus/fan` and `versus/stacked`; on `versus/peecpair` a side is a wordmark or a mark with its name, never both), and never repeated under a tile the title already names ("delete 360 encompass and encodepro text").

**F5. Nothing invented.** No sample patients, drugs, prices, steps or claims that aren't in the article. Labels are the article's own words or a faithful shortening.

**F6. The right layout family for the article.** An X vs Y article shows both products with their own logos (domains match the products). A single-product article uses `dark` or `logotype`. A "best X" image shows the article's own picks in its order, never more than the layout holds (hub 6–7, shortlist 3–8, lineup 3–7 logos, picks 3–7, spotlight, count and frostrow 3–6, cloud 3–8, ranges 3–6), and a count in the heading or the `count` number matches what is shown. A cost image shows the article's own tiers: `glassbar` one tier and its price, `figures` two, `costgrid` three pricing models with the main one first; `flatcard2` one figure with its qualifier on the cursor's tag; `strike` the advertised price, the real one and its qualifier; `meter` two options on one true scale (each `display` as the article writes it, `low`/`high` matching it). `checkcard` draws only its first `max` items (default 4): the heading never promises more than is shown. A `versus/center` tile carries the article's own word for its angle. A `research`, `peecpair` or `duel` tag or eyebrow is the title's angle, never the title again.

**F7. The text budget holds.** ≤15 words, ≤7 per element, no sentences, no fact twice, one dash style per image (the en dash: "$29–$89/mo").

---

## Fix loop and speed rules

- **One message per Maker per round:** both QA agents' fixes for an image are merged before sending.
- **Re-check only what failed, only by who failed it:** a visual fix goes back to Visual QA alone, a fact fix to Fact QA alone. An image that changed text visibly goes to both.
- **Up to 3 rounds.** Deliver every image the moment both QA agents pass it and the batch critique (Orchestrator step 9) holds; don't hold the batch for the slowest image.
- **Never:**
  - fetch an article twice
  - run Makers one after another
  - start the QA agents in separate turns
  - open images one by one when the sheet shows them
  - give an agent files it doesn't need
- **Reuse agents** (SendMessage) instead of starting new ones that would have to re-read everything.
- **Big batches (10+):** only when the user has opted into multi-agent workflows, a Workflow tool script can pipeline each article through its Maker and then Fact QA, so facts are checked as soon as each Maker finishes; Visual QA still judges the whole sheet together. Otherwise use the flow above.
