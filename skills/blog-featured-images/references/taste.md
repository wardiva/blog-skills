# Taste

You are expected to make images the user would approve without asking them. This file is how: every principle below was distilled from the user's own review notes, and each one names the image that taught it. Read it before making or judging any image. When a new note arrives, add its principle here with its evidence; never let a lesson live only in a conversation.

## The Principles

There are **20 principles** (1–20), and the Self-Critique below checks every one of them.

### 1. Balance and hierarchy: nothing outweighs its partner, and the key figure leads

Every image is a conversation between two masses: a number and its card, a headline and its illustration, a column of text and a panel. Neither may shout over the other. Inside a group, the hierarchy follows the meaning: the key figure (a price, a score, a count) leads, and the names that label it support it; a name never outweighs the figure it introduces.

- **Stat:** "4–9% looks too big, the illustration looks too small, visual balance is not right." The number is capped at 150px and the card grew (wider, 30px rows) until the two read as one composition.
- **Receipt:** "Love the illustration and bg, just the heading looks weird and makes the balance off." The headline came down to semibold 84px so the receipt stays the hero.
- **Dark:** "Left padding is too much, so the visual balance is off." The text column moved from x 210 to x 120, picked from three options.
- **Logotype:** "Without the tile, visual balance looks off." A bare icon next to a wordmark felt weightless; the black tile gives it mass.
- **Versus frost** (approved review): "the icons are too big and this is why visual balance off, improve". The marks went from 60% to 48% of each glass tile; 44% was also tried and looked lost in the tile. A logo fills its tile only as much as the tile's size allows.
- **Connect:** "Decrease the font size of the heading so it comes in one line, because 2 lines look visually off." A short pair like "Waystar vs Availity" reads as one phrase; split over two big lines it outweighed the tiles. It now sits on one line, centred above the divider.
- **Receipt** (batch 4): "heading placement feels off" with the headline centred beside the receipt. From top and bottom options, bottom was picked: the headline now sits on the total line (`"place": "bottom"`).
- **TheraNest vs Valant** (`versus/badges`, batch 5 final round): "the heading of theranest and valant are too bold and big, visual hierrachy is not good and balanced". The names were 72px bold black, as heavy as the prices they label. The approved fix turned the hierarchy round: names 44px at 600, prices up to 84px, the two sides spread apart (`nameSize`, `nameWeight`, `valueSize`, `spread`). The figures lead; the names say whose they are.

**Ask:** what is the heaviest thing in the image, and should it be? Squint: does one side of the canvas feel emptier or heavier than the other? Read the image in the order the eye takes it: is the key figure first, and does every name sit a step below the figure it labels?

### 2. Same role, same form; different role, different form

Things that play the same role get the same treatment, and things that play different roles never wear the same one.

- **Tiles:** "Either both logo backgrounds white, or both with the logo colour." Never one filled tile and one white tile; the renderer enforces it.
- **Slash:** both names are two-tone, white + brand colour, never one name in a single colour.
- **Swap:** the two text labels share one size ("Outsourced RCM" had drifted smaller than "In-house billing"; the regression caught it).
- **Pills / connect:** both logos sit on white circles (pills) or are both full app icons (connect).
- **Paired figures are real numbers** (Oracle Health vs MEDITECH, `versus/scores`, batch 5 final round). Asked for 2026 data, the article had a number only for MEDITECH (77.1) and only "Lowest ranked" for Oracle. One big number against a block of words: "ew revert it". Two scores play one role, so both must be numbers on one scale; a word against a number looks broken even when it's true. The 2025 pair (64.7 vs 76.3) stayed, and `versus/scores` now refuses a non-numeric score. When the year asked for has no figure for both sides, say so and keep a year that has both.
- **A label tile is not a logo** (7 Best Pediatric EHR, `grid`, batch 5 final round). The count and the heading sat in the first tile of a grid of logo tiles: "7 best pediatric shouldnt be like other logos, this looks off". A heading dressed as one more tile reads as one more product. Both fixes of the grid were disapproved, the user chose "for this use this glass version template" (`lineup`, logos only, no heading), and `grid` was retired.

**Ask:** are any two parallel elements styled differently? Fix the odd one out, or pick a layout where they can match. Then the other way round: does anything wear the form of an element it isn't (a heading as a tile, a word where a number belongs)?

### 3. Sameness across a family

Every image in a family uses the same weights, colours and ink, so the blog grid reads as one brand.

- **Focus:** "Make heading font weight consistent with others." Card-layout headlines are all semibold 600, tracked −0.03em; the focus headline was light 300 and stood out.
- **Headline layouts:** "Use same font weight 500 medium everywhere": every word in pills, connect, duo and dark is Inter 500.
- **Receipt:** its headline is black, and semibold like the other card headlines.
- **Headlines are black, not blue.** The user asked for black on receipt, pills, connect, focus and then ranked ("the heading color should be black"): navy reads as blue next to a blue accent. Every headline is now black (white on dark fields); blue belongs to the anchor (a selection box, a number, a winning bar), never to headline ink. When the user corrects the same thing twice, apply it to the whole family instead of waiting for the next note.

**Ask:** put the image next to two approved ones from its family. Does any text look lighter, heavier or a different colour?

### 4. Patterns are seasoning, never the meal

Dot grids, "+" grids and rings add texture; they never compete with the content. They are always sparse and faint, never dense or dark. A sparse, faint grid or dot field may cover the whole canvas on the light Gumloop fields (`versus/type`, `versus/tiles`, `swap`, `badge`) and the `versus/tiles` blue field: approved images 18, 20, 22, 25 and 27 (the review said the "+" grid is fine as is). On `shortlist` and `lineup`, and on any dark field, the pattern is edge-only: masked clear behind the content (`GL_EDGE_MASK`; `versus/slash` masks its dot grid on black the same way). `versus/bento` has none.

- **Dynamics 365 vs Acumatica (slash):** "The pattern should not be in all area": the dot grid is masked clear behind the names.
- **Tiles:** "Pattern is too much": the ring and dots stay sparse and faint.
- **Swap on black:** "Pattern is too dark, light it, and it shouldn't be in the whole image." On a black field "too dark" meant dim and murky, so the marks became **brighter and crisper**, and only around the edges. Fading them instead made them "literally not visible". (The black swap itself was later deleted in the approved review; swap is light only now. The lesson about patterns on dark fields stays.)
- **Bento** (batch 4): "delete pattern from bg, it looks overwhelming here". The grid of cells is texture enough; it has no pattern.
- **Lineup** (batch 4): the user asked to delete the faint watermark behind the row ("this rectangle shape") and didn't like the "+" shape. The row sits on the glow field with faint dots at the edges only.
- **Connect** (Oracle Health vs MEDITECH, batch 5 final round): "delete these dot grid from top left and top right". The two corner dot patches only filled the corners; `"cornerDots": false` drops them. Decoration has to earn its place (principle 10).

**Ask:** is the pattern sparse and faint, and does the content read first? On `shortlist`, `lineup` or a dark field, is it clear behind the content? If you notice it before the content, it's too strong; if you can't find it, it's gone, which is just as wrong.

### 5. A background is not an image

A beautiful field still needs a real illustration on it: a card, a figure, logos, an arrow.

- **Brandline:** "The bg looks good, can be used with some other illustration, but not like this with just a title heading." Retired as a layout; its glow field now carries `lineup`, a real row of logos.
- **Glass on the blue mesh:** "The gradient is good but not with this illustration." The pairing failed, not the gradient; glass stays on light and black, and the blue mesh is kept in `references/fields/` for a better partner (behind `versus/frost` it was disapproved too).
- **Folder** (batch 4): "I like the background, the glass effect and the logos, but not the layout." A liked piece can live on in a new layout: the frosted glass and the logos became `lineup` and `versus/frost`.

**Ask:** remove the headline. Is there still something to look at?

### 6. The field must flatter the illustration

The background exists to lift the hero off the page, and each layout has the fields that do that.

- **Hub:** a big blue tile on blue melts; it goes on cream.
- **The vibrant blue** (the card field) only carries a big white card; a floating card tile or a blue-heavy illustration on it becomes one flat blob. The Gumloop tiles on their own blue field are the approved exception (image 20).
- **Prompt:** "Both backgrounds are making this bland": it paints its own light-blue gradient with a glow.
- **Approved review (Oct 2026), "Delete" on four field pairings:** the checklist on a light field, `versus/type` on blue, `versus/tiles` on black and `swap` on black. Each field was fine elsewhere; the pairing wasn't. The checklist is now blue only, type and swap are light only, and tiles is blue or light.
- **Batch 5, backgrounds:** the fit lists are a starting point, not a cage. The user picks each image's field on a picker page (`"bg"` + `"bgPick": true`), and the pick wins over the fit list; it chose the vibrant blue for `versus/checks` because every word sits inside its white card. Variety across a batch: principle 14.

**Ask:** does the hero separate cleanly from the field at 350×250?

### 7. Bland fails as surely as broken

Calm is good; bland is not. A safe composition with no anchor, contrast or colour is a failure.

- **AdvancedMD vs CureMD:** "I don't like this layout, it looks bland" → the black slash, which became a favourite.
- **AdvancedMD vs athenahealth:** "Use our vibrant blue grain gradient": a comparison table may go vibrant.

**Ask:** would this stop a scroll? Is there exactly one bold thing?

### 8. Brands as they really are

- Real, current logos in their original colours; a stale anniversary badge (Availity's "25") is wrong even when it passes a check.
- Logos alone where they're recognisable; never logo + name cards.
- Never the site's own mark on a headline layout ("delete the medhub logo"); `dark` shows the product's own icon.
- `dark` needs a real product logo. On a topic article ("What is EMR software") an icon stood in, and the user said "icon is not looking good"; `dark` is for single-product articles only.
- A one-brand image for an X vs Y article "looks like an ad".

### 9. Copy a reference exactly; measure it

When the user shares a reference, every detail is the rule: tiles behind icons, padding, the gap between shapes, flat or rounded ends, the weight of a word. Measure its pixels (the pills gap is 57% of the pill height because the reference measured that). Each missed detail cost a review round.

### 10. Restraint: every element earns its place

"Before is better" came back three times: auto-sizing the window, a pointer callout on the timeline, logo badges scaled up. A QA fix that changes the look is shown next to the original first, and the user's approved look wins over a checklist suggestion.

Restraint also runs the other way: an element already in a template stays only while it carries meaning. A check box, a container or a dot patch that only fills space is removed, and the space it frees goes to the content.

- **HIPAA badge** (batch 4): Fact QA replaced the note "Most small practices $150–$750" with "Dedicated HIPAA platforms" ($750 sits $1 above the $749 figure, and the two come from different scopes). The user preferred the earlier badge and had it restored. Raise a fact concern with the user; don't let it silently undo an approved look.
- **AAPC Codify vs Find-A-Code** (`versus/checks`, batch 5 final round): "checkboxes are not needed". Two products are a pair, not a to-do list, so the blue check boxes said nothing; `"checks": false` drops them and `"big": true` gives the room to bigger logo tiles (104px, mark 72px). A checked row is for lists.
- **Small Practice EMR** (`ranges`, batch 5 final round): after every new background was disapproved, "use the previous bg, and in that dont add container for bars section". The white card behind the bars was a box inside the white panel; `"bare": true` drops it, and the tracks go a step darker (`#E1E5EC`) so they still hold. Only on the white field (the exception to principle 18's card rule).
- **Connect corner dots** (principle 4): "delete these dot grid from top left and top right".

**Ask:** cover each element in turn (a check box, a card, a pattern patch, an icon). Does the image lose any meaning without it? If not, it goes.

### 11. Fix by the amount asked

A note names a direction, not an extreme. "Lighter" means visibly lighter, not gone; "smaller" means smaller, not tiny. Read the words in context (on black, "too dark" meant the marks were dim, so "light it" meant brighter), make the change the note asks for, and compare it with the original. Overcorrecting cost a round: the swap grid went from too dim to invisible.

### 12. Fewer words, bigger meaning

Fifteen words is a ceiling, not a target. "Too much text" (stack): keep the title plus one lead line when the lead already carries the figure.

### 13. Optical, not mathematical

"It doesn't look centred, it should be 2–3px back": the focus heading is nudged 3px left because the selection box makes it look off-centre. The "vs" sits vertically centred between names by eye. Trust the eye at full size and at 350×250.

### 14. Every image is new

The user sees every image together, across categories and batches, so a layout used twice in one category reads as lazy. A layout not used yet goes first; a used one may come back only in a different category (the current rule, last bullet).

- **Batch 3:** "This template is already used": a layout recognised from an earlier batch was rejected in a different category (history, from before the per-category rule).
- "I don't want you to repeat any illustration, only repeat if it makes actual sense." (History: this made layouts rotate across the whole site, with a favourite allowed back only with a written reason. Replaced below.)
- **Batch 4:** a second pills image came back with a written reason and was still rejected: "this template is already being used". A written reason didn't make a repeat welcome.
- **Template Usage (Oct 2026):** "the ones that hasnt used yet can be used now if suitable for any article and the ones that have used cant be used again unless the category is different." A layout not used yet anywhere is free for any article it suits and goes first; a used layout never comes back in the same category, only in a different one. There is no repeat with a reason any more. The user marks what is used on the Template Usage page (`references/used-layouts.json`), and that record is the truth over the history, since the user knows what is live; pills stays at "max 2 times" across the site.
- **Restated on Oct 15, the current rule:** "the ones that are used shouldn't be used again unless the category is different. The ones that aren't used can easily be used again because they aren't used right now, obviously".
- **Batch 5, fresh over reuse (the current refinement):** "you created most of the designs that were already being used. So I want you to create a new version of them." The record's "free" is not enough: a layout the user has already seen reads as used. A batch gets new designs, not a refill of known ones.
- **Batch 5, round b8, approval is per article:** after four layouts were approved in a direction check, they were rolled out to all 12 articles. The user: "I want like the designs that I have approved. Those are fine. Now I want more designs for the rest of the URLs." A design approved for one article is approved for that article; three badges side by side read as one template.
- **Siblings are one template:** `picks` and `versus/checks` grow from the same checklist card, so they never share a category, and a new layout never shares a skeleton with one already in the category (horizontal price rows were `ranked` again).
- **A new name is not a new design** (batch 5 final round): `versus/spot`, offered for RXNT, was rejected by QA as Appointment's `spotlight` under a new name, and retired before the user saw it.
- **Variety in backgrounds too:** "we have so many background why are you fixated on just one. show me 12 images and options for backgrounds and i'll selevt the bg for each". Given the choice, the user picked seven different fields for 12 images (glow, mesh, soft, blue, cream, paper, white).

**Ask:** is this layout already used in this category, or has the user already seen it in this batch? Then pick another. Is a sibling of it (built from the same approved part) already in the category? Is there a layout not used yet anywhere that suits the article? Then it goes first. Across the batch, do the backgrounds vary?

### 15. No clip-art metaphors

Show the article's own things (logos, names, figures), never a symbol standing in for the idea.

- **Versus scale** (batch 4): a balance scale holding both logos was rejected hard: "looks like a law illustration, the concept is so bad". Retired.

**Ask:** could this image be read as a stock illustration of something else?

### 16. Nothing stale

The user asked twice for "no stale data" and to "delete unnecessary stale data": every file the skill reads must describe what the code does today.

- A first-batch timeline sent again was called "stale": give the newest finalized version (check `finalizedAt` across archives).
- Update every file the moment a rule changes (references, examples, approved images, the usage record), in the same change, never later.
- Retired layouts leave no live trace: their code, options and examples go, and their story stays only as history in `lessons.md`.
- Archive, never delete, user data: old examples, history backups and review rounds move to `~/.blog-featured-images/_archive/`.

**Ask:** does any file still describe a layout, option or rule the code no longer has?

### 17. Stay inside our design language: product UI and type, never props or devices

Our language is the approved templates: flat product UI (white cards, tables, app windows, checklists, input bars, bars, tracks), real logos on tiles, big tight Inter type, the vivid blue grain field or black with a brand-colour panel, frosted glass, and faint guide lines or "+" grids. A new design is a new arrangement of those ingredients, never a new world.

- **Batch 5, new versions (Oct 19 2026), all 12 rejected:** "not a single image that you have created matches our design language… these are bullshit… why are you using mobile mockups? … doesn't even match our design language and it looks so bad." The rejected set: phone mockups, a laptop lid with stickers, a keyboard of keycaps, sticky notes, polaroids, a felt letter board, hanging price tags, wallet cards, notification cards, a browser chrome window, a search box, and a product-compare page. All retired.
- "Real objects" was the wrong lesson from the receipt and the notepad. Those two worked because they are flat, white, typographic cards in our palette. The rejected batch drew physical things: devices, wood, felt, kraft paper, plastic keys, tape.
- **Batch 7 direction check (Oct 19 2026):** variations built only from approved parts. Approved: `versus/badges` (from the badge), `versus/checks` (from the checklist card), `spotlight` (from focus), `picks` (from the checklist). Disapproved: `versus/window` (one app-window pane per product with the VS badge on the split). Then eight more for the rest of the batch (round b8), each from one approved template: `versus/plans`, `versus/center`, `cloud`, `count`, `ranges` and `grid` approved at first; `versus/range` and `versus/rings` not, and their round-b9 replacements `versus/lanes` and `versus/scores` approved. Building from our own approved parts is the way.
- **Approved is not finished:** `versus/plans` was approved with "design can be improved", its alternative options (`size lg`, `band`) were disapproved, and at the final review it was retired: "i dont like the design, try smth else for comparison". `grid` was retired in the same round (principle 2). An approval with a reservation is a warning, not a model: never copy it, and expect it to be questioned again.
- An option offered after a disapproval changes the composition, not only the chart inside it (rings → columns kept the same title, card and label row, and neither was approved).
- Before inventing, look at good product blogs (`inspiration.md`) and at our own approved sheet, then build from our own ingredients.

**Ask:** put the new image in the middle of the approved sheet. Does it look like it was made by the same designer, with the same parts? If it shows a device, a prop or a material (wood, felt, paper, plastic), it fails.

### 18. Clear in one glance

A chart or diagram must read in one glance at 350×250; clever but confusing fails.

- **Versus range** (batch 5, b8 review): "i like the design but it is confusing". One price track for two products was liked and still retired; `versus/lanes` gives each product its own lane, with every stop labelled right above it.
- The QA rules that keep a chart clear: light grey tracks sit on a white card (one exception: on the user's white field, `ranges` `"bare": true` drops the card and darkens the tracks a step, approved for Small Practice EMR: principle 10); a callout line touches what it names (a dot, or a bracket spanning the range); an open "From" price fades out with no solid end, because every bar end reads as a figure; when the article gives two measures (hospitals vs beds), the title names which one the figures use.

**Ask:** can someone who hasn't read the article say what the chart compares, in two seconds?

### 19. The concept fits the article

A design can be loved and still be wrong for its article. Before rendering, ask whether the visual idea matches what the article is about: what it compares, ranks or explains, and by which measure.

- **Oracle Health vs MEDITECH** (`versus/scores`, batch 5 final round): "i love the design but is the concept right?". The image shows one published score per product. The concept is right only when that score is the article's own lead metric and the one figure it gives for both products; check that, then answer with the article's words before changing anything. Asked for 2026 data, the concept broke (one side had no number: principle 2), so the 2025 pair stayed. The user then marked `versus/scores` not used ("add that to not used cus i love the design"), so it is free again in every category.
- **Versus scale** (principle 15) is the same lesson from the other side: a metaphor that isn't the article's idea reads as another subject ("looks like a law illustration, the concept is so bad").

**Ask:** say the article's point in one sentence, then the image's in one sentence. Do they match? Is the figure on the image the article's own lead figure, for every product shown?

### 20. Repeat what was praised

Praise is a rule too. When the user loves an image, name what made it work and reach for that first.

- **Spotlight** (Best Appointment Reminder Software, batch 5): "perfect concept and design". The title's own angle sits in the blue selection box, and the article's real products are the rows of the card under it: the headline and the evidence are one picture. Repeat: one selection box on the title's angle, real products as the rows.
- **Versus scores** (Oracle Health vs MEDITECH): "i love the design". Big type and two real numbers carry it, with no card and no chart. Repeat: when a single published figure decides a comparison, set it big; don't draw a chart around it.
- **"Its fine"** (`count`, `cloud`, `versus/center`, `versus/lanes`, `picks`): accepted, not praised. Use them, but don't copy them as models.

**Ask:** which praised image is closest to this article, and does this image use what made that one work?

## Self-Critique (Required)

Makers run this on their own image before returning it; Visual QA runs it on every image. Look at `master.png` and `card-350x250.png`, next to two approved images from the same family. Answer in a table:

| Check | Pass when |
| --- | --- |
| Balance | The heaviest element is the one that should be; its partner holds its own (1) |
| Hierarchy | The key figure leads; names and labels sit a step below the figure they introduce, never as big or as bold (1) |
| Sameness | Parallel elements share one treatment (2) |
| Label vs logo | Nothing wears another element's form: no heading or count dressed as a tile among logo tiles (2) |
| Real pairs | Paired figures are two real numbers on one scale; never a word or a block of text against a number (2) |
| Family | Weights, colours and ink match the approved images beside it (3) |
| Pattern | Sparse and faint, never dense, dark or competing with the content; edge-only, clear behind the content, on `shortlist`, `lineup` and dark fields; none on `versus/bento` (4) |
| Logo fill | Each logo fills 60–70% of its tile (`versus/frost` 48%); a solid app icon is the tile, edge to edge; a wide, thin mark gets a per-card `scale` until its weight matches by eye (1, 8) |
| Illustration | Removing the headline still leaves something to look at (5) |
| Field | The hero separates cleanly from the background at 350×250 (6) |
| Bold | Exactly one bold thing; it would stop a scroll (7) |
| Brands | Real current logos, original colours, no site mark on headline layouts (8) |
| Reference | Every detail of a shared reference is copied and measured, never eyeballed (9) |
| Restraint | Nothing added that the approved template doesn't have (10) |
| Earns its place | Every element carries meaning: no check boxes on a pair, no container that only frames, no dot patch that only fills a corner (4, 10) |
| Amount | Each fix moves as far as the note asked, compared with the original (11) |
| Words | 15 is a ceiling, not a target; nothing reads as filler (12) |
| Optics | Centred by eye at full size and at 350×250, not by the numbers (13) |
| New | Not used in this category; layouts not used yet anywhere come first (14) |
| Headline ink | Headlines black `#0A0A0B` (white on dark fields), never blue or navy, no blue words (3) |
| Real things | The article's own logos, names and figures; no clip-art stand-in (15) |
| Fresh | The newest facts and version; nothing describes a retired layout or option (16) |
| Our parts | Built only from approved parts; no device, prop or material (17) |
| Own skeleton | Its skeleton isn't shared with a layout already in the category, siblings from the same approved part included (14, 17) |
| Fresh batch | The batch isn't filled with reuse: no layout the user has already seen in it, no approved option rolled out to other articles (14) |
| Background mix | Across the batch the fields vary; the user's picks (`bgPick`) are kept (6, 14) |
| One glance | Any chart reads in one glance at 350×250; grey tracks sit on a white card, or bare on the white field only (18) |
| Concept fit | The visual idea matches what the article is about, and its figure is the article's own lead figure for every product shown (19) |
| Praised parts | The closest praised image was checked, and what made it work is used where it fits (20) |

Any "no" is a fix before the image moves on.

## How to Keep Learning

Every note, reference, "this is right", "this is wrong", "love it" or "disgusting" goes through the learning loop in SKILL.md ("Keep Learning (Required)"): a prompt, a principle in this file (the note quoted, the image named), a lesson, a renderer check where it can be measured (otherwise a V- or F-check in `agents.md` and a line in the Maker template), a generalisation when the same correction comes twice, the decision recorded (a rejection in `agents.md` V9 and, for a layout, `RETIRED` in `layouts.mjs`; a newly approved image as an example spec and a `sources.json` line), every running Maker and QA told, the inspiration log for references, refreshed approved images, and a push.
