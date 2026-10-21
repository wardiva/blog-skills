# Taste

You are expected to make images the user would approve without asking them. This file is how: every principle below was distilled from the user's own review notes, and each one names the image that taught it. Read it before making or judging any image. When a new note arrives, add its principle here with its evidence; never let a lesson live only in a conversation.

## The Principles

There are **34 principles** (1–34), and the Self-Critique below checks every one of them. Before any image goes to the user, predict the user's verdict (the last section, "Predict the Verdict").

### 1. Balance and hierarchy: nothing outweighs its partner, and the key figure leads

Every image is a conversation between two masses: a number and its card, a headline and its illustration, a column of text and a panel. Neither may shout over the other. Inside a group, the hierarchy follows the meaning: the key figure (a price, a score, a count) leads, and the names that label it support it; a name never outweighs the figure it introduces.

- **Stat:** "4–9% looks too big, the illustration looks too small, visual balance is not right." The number is capped at 150px and the card grew (wider, 30px rows) until the two read as one composition.
- **Receipt:** "Love the illustration and bg, just the heading looks weird and makes the balance off." The headline came down to semibold 84px so the receipt stays the hero.
- **Dark:** "Left padding is too much, so the visual balance is off." The text column moved from x 210 to x 120, picked from three options.
- **Logotype:** "Without the tile, visual balance looks off." A bare icon next to a wordmark felt weightless; the black tile gives it mass.
- **Versus frost** (approved review): "the icons are too big and this is why visual balance off, improve". The marks went from 60% to 48% of each glass tile; 44% was also tried and looked lost in the tile. A logo fills its tile only as much as the tile's size allows. Kept by the user on the review page (Oct 20), so 48% is settled.
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
- **One radius, one tile for every logo in a row** (7 Best Telehealth Software for Therapists, `numbered`, batch 6 first pass): "numbers looks so weird and visually cluttered and unbalanced and corner radius of logo bg is not consistent". Some marks sat on white tiles while app icons kept their own rounded squares inside them: nested squares, two radii. Every logo in a row shares one tile size and one corner radius. A solid app icon either is the tile (`"fill": true`: edge to edge, clipped to the tile's radius) or gives way to the brand's bare mark on the tile. `numbered` was retired; `frostrow` replaced it with one row of equal frosted tiles at one radius (22% of the tile) and no numbers.

**Ask:** are any two parallel elements styled differently? Fix the odd one out, or pick a layout where they can match. Do all the tiles in a row share one size and one corner radius, with no tile nested in another? Then the other way round: does anything wear the form of an element it isn't (a heading as a tile, a word where a number belongs)?

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
- **Research** (7 Best EHR for Dermatology, batch 7): "use bg lines too like ss2 in our colors and dont use dot pattern in bottom". Peec's guide lines, drawn in our blue, frame the pill and the heading; the dot fade under the tiles went. Approved as "perfect".

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
- **Names as people say them** (7 Best Telehealth Software for Therapists, batch 6): "it should be just zoom not zoom for healthcare". On a row of logos the name under a tile is what people call the product, not the plan or edition the article titles it with. When the user names a product, use their spelling; otherwise keep the article's name, cut only to the name the brand itself uses, and let Fact QA confirm it.

**Ask:** is every logo the brand's real current mark, and every name the one people actually say?

### 9. Copy a reference exactly; measure it

When the user shares a reference, every detail is the rule: tiles behind icons, padding, the gap between shapes, flat or rounded ends, the weight of a word. Measure its pixels (the pills gap is 57% of the pill height because the reference measured that). Each missed detail cost a review round.

- **Peec checklist card** (7 Best Dental Software for Small Practices, batch 7): "ss1 exact pixel perfect design i want in…". Approved as `checkcard`: a light grey card with a grey heading line, a nested white card of blue-checked rows, on a faint grid of white rounded cards, grain off. The tick had been eyeballed, and came back: "use exact same checkboxes size and tick icon that was in its inpirsation". Measured on Peec's 4096px original: box 120, corners 35 (29%), tick `M32 59 L48.5 76.5 L91 35`, stroke 9, round caps, `#0081FF`.
- **"Exact ditto"** (the Peec partner cover, batch 7): "delete dermatology tag . this should be exact ditto like inspiration attached. the bg the logo without bg, white logo colors, logo text. so for this template use logos that has logo text too". Ditto covers the field, the logo treatment (tile or none, colour, wordmark or icon) and the sub-element geometry. What then moves to our system is principle 32.

### 10. Restraint: every element earns its place

"Before is better" came back three times: auto-sizing the window, a pointer callout on the timeline, logo badges scaled up. A QA fix that changes the look is shown next to the original first, and the user's approved look wins over a checklist suggestion.

Restraint also runs the other way: an element already in a template stays only while it carries meaning. A check box, a container or a dot patch that only fills space is removed, and the space it frees goes to the content.

- **HIPAA badge** (batch 4): Fact QA replaced the note "Most small practices $150–$750" with "Dedicated HIPAA platforms" ($750 sits $1 above the $749 figure, and the two come from different scopes). The user preferred the earlier badge and had it restored. Raise a fact concern with the user; don't let it silently undo an approved look.
- **AAPC Codify vs Find-A-Code** (`versus/checks`, batch 5 final round): "checkboxes are not needed". Two products are a pair, not a to-do list, so the blue check boxes said nothing; `"checks": false` drops them and `"big": true` gives the room to bigger logo tiles (104px, mark 72px). A checked row is for lists.
- **Small Practice EMR** (`ranges`, batch 5 final round): after every new background was disapproved, "use the previous bg, and in that dont add container for bars section". The white card behind the bars was a box inside the white panel; `"bare": true` drops it, and the tracks go a step darker (`#E1E5EC`) so they still hold. Only on the white field (the exception to principle 18's card rule).
- **Connect corner dots** (principle 4): "delete these dot grid from top left and top right".
- **Minimal means one fact** (EHR Interoperability Cost, batch 6 round 7, after six rounds): "you already have all the templates designed. I just want you to make it more visually appealing. So like the one you created, it's 3 cards, they are like too much. There should be some minimal way for this." Three tier cards still read as three things, even with two of them dimmed. The approved answer was one frosted bar on black holding one tier and its price (`glassbar`). When an article keeps failing, cut to its one figure inside one approved container.
- **AI medical scribe cost** (`meter`, batch 7): on the white field the user picked, "delete white container". The same lesson as Small Practice EMR: on white, the card is a box inside a box. `meter` is bare only now.

**Ask:** cover each element in turn (a check box, a card, a pattern patch, an icon). Does the image lose any meaning without it? If not, it goes.

### 11. Fix by the amount asked

A note names a direction, not an extreme. "Lighter" means visibly lighter, not gone; "smaller" means smaller, not tiny. Read the words in context (on black, "too dark" meant the marks were dim, so "light it" meant brighter), make the change the note asks for, and compare it with the original. Overcorrecting cost a round: the swap grid went from too dim to invisible.

### 12. Fewer words, bigger meaning

Fifteen words is a ceiling, not a target. "Too much text" (stack): keep the title plus one lead line when the lead already carries the figure.

- **Footnote** (Claims Denial Management Cost, batch 7 round 6): "too much text". A cost image is a heading, one figure and one short caption.

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
- **Variety in backgrounds too:** "we have so many background why are you fixated on just one. show me 12 images and options for backgrounds and i'll selevt the bg for each". Given the choice, the user picked seven different fields for 12 images (glow, mesh, soft, blue, cream, paper, white). Colour across a batch is principle 24.
- **Batch 6, "dont repeat the template that is already being used":** the first pass used three templates never used anywhere (`versus/tiles`, `versus/type`, `swap`), and all three were approved.
- **Batch 6, options round, "not used here" is not "new":** after six disapprovals, ten of the twelve options were approved templates not yet used in their category, and the user approved only three. Then: "the images that I have disapproved has already been used multiple times, so I wanted to create new ones. But keep in mind what you have learned, what tools you have built." A template the user has seen many times on the site reads as a repeat in any category. When the user asks for new designs, every option is a new layout built from parts the user approved, in this batch first (big blue figures from `figures`, frosted glass from `frostrow`, the blue anchor from `costgrid`).
- **Batch 7, approved templates are not "new":** asked for images "that hasnt been used before", the user chose brand-new designs for all 20. Round 2 rolled approved looks out instead (glass split ×4, stacked ×5, fan ×2) and most were rejected: "that I approved in this feature image review and in my last feature image review is fine. For the others, used a brand new layout that haven't been used before, and follow our design language." Then, with one family on several articles of one page: "done stop repeating designs now , use black bg too in some". One skeleton per page and per category is principle 25; approval that holds only once the batch is seen together is principle 34.

**Ask:** is this layout already used in this category, or has the user already seen it in this batch? Has the user seen it many times across the site? Then pick another. Is a sibling of it (built from the same approved part) already in the category? Is there a layout not used yet anywhere that suits the article? Then it goes first.

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
- **The batch-5 direction check (Oct 19 2026):** variations built only from approved parts. Approved: `versus/badges` (from the badge), `versus/checks` (from the checklist card), `spotlight` (from focus), `picks` (from the checklist). Disapproved: `versus/window` (one app-window pane per product with the VS badge on the split). Then eight more for the rest of the batch (round b8), each from one approved template: `versus/plans`, `versus/center`, `cloud`, `count`, `ranges` and `grid` approved at first; `versus/range` and `versus/rings` not, and their round-b9 replacements `versus/lanes` and `versus/scores` approved. Building from our own approved parts is the way.
- **Approved is not finished:** `versus/plans` was approved with "design can be improved", its alternative options (`size lg`, `band`) were disapproved, and at the final review it was retired: "i dont like the design, try smth else for comparison". `grid` was retired in the same round (principle 2). An approval with a reservation is a warning, not a model: never copy it, and expect it to be questioned again.
- An option offered after a disapproval changes the composition, not only the chart inside it (rings → columns kept the same title, card and label row, and neither was approved).
- Before inventing, look at good product blogs (`inspiration.md`) and at our own approved sheet, then build from our own ingredients.
- **Batch 7, references beat invention:** about 10% of the invented options were approved, while the options copied from a reference (Dub, Peec, Databricks, Calendly's tiles, the user's own screenshots) passed in one or two rounds. After two failed rounds of inventions, go to references, then translate them to our fields (principle 32).
- **Batch 6, map first** (round 4): "map all of our previous templates that you created. That is the design language you need to follow, but you can go to browser and do your research." Lay every approved image (`references/approved/`) next to the live site sheet (`scripts/sheet.mjs`), grouped by field and composition, before designing. Round 3 had invented new skeletons (a connector between system cards, selection-box annotations, prices in two corners) and every one was rejected. Every layout approved in batch 6 is an approved part in a new arrangement: `figures` (the `versus/scores` type in two columns), `costgrid` (the `versus/bento` cells with one blue anchor), `frostrow` (the `versus/frost` glass tiles in a row: the user's own "for logos bg glass bg would look better"), `glassbar` (approved 24's frosted bar on black), `versus/fan` and `versus/stacked` (white price cards and the blue "vs" disc).

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
- **Versus stacked** (symplr vs Modio Health, batch 6 round 5, approved image 54): "love it. The concept, visual , everything looks so appealing and perfect". Two wide white row cards, stacked, each tilted only slightly (−2° and −1°): logo tile and name on the left, the price big in the blue gradient on the right with its unit under it, the blue "vs" disc with its white ring on the seam. Approved on the light mesh, delivered on the glow the user picked. It came after rounds of rejected "new" skeletons (link, annotate, corners, black and blue fields: "looks like AI slop… scattered… same color"). Repeat: two clear rows that read as a pair, logo + name left and figure right, a slight tilt, one tight centred group, soft depth on a calm light field.
- **Strike** (Is Free EHR Software Worth It for Small Practices, batch 7): "Love it". One white card holds the heading, then "$0" in grey with a slanted strike through it, a blue arrow, and the real monthly cost big in the blue gradient, with the article's qualifier underneath. The whole idea of the article fits in one line. Repeat: when the article's point is "the advertised price isn't the real price", show the claim crossed out and the truth beside it.
- **Glass for logos:** the batch-4 note "I like how you have used logos with these glass bgs, we can utilize them with any other bg" became `versus/frost`; in batch 6 the user asked for it again on a list ("for logos bg glass bg would look better") and approved `frostrow`. Repeat: logo rows and pairs on frosted glass tiles over the light mesh.
- **Approved at once, no note** (batch 6 first pass): `figures` (two big blue price ranges, one hairline) and `costgrid` (one tall blue anchor card beside two white cards). Plain, big and strong beat clever: the six new layouts with more pieces were all rejected.
- **"wow love it, everything is perfect"** (batch 4): `shortlist`, `definition`, `versus/glass`, `versus/tiles`, `versus/type`. In batch 6 `versus/tiles` was approved again with "use the blue gradient bg".
- **Duel** (Vanta vs Drata for HIPAA Compliance, batch 7 redo, from the Dub research): "wow love it". Two big lockups (logo tile and name, about 120px Inter 600) with a small grey "vs" between them, the title's angle as a small mono-caps eyebrow above, on a near-white field with a faint square grid and soft lavender and blue corner glows. No figures, no card. Approved again in another category, for Nextech vs NextGen (specialty, no eyebrow). Repeat: the comparison as two big brand lockups on a quiet grid.
- **Figures inside an object** (batch 7): the strike, flatcard2's selection, the span's track, the meter and the scores pair are all led by a figure, and all were kept. What failed was a figure alone on the field (big type, bracket, horizon, blue field, delta). Repeat: principle 27.
- **Black band** (DoseSpot vs RxNT, batch 7, from the Peec partner covers): "this is perfect". Plain black, one hairline band across the full width, both brands' real wordmarks in white with no tile, sized to one width, a small grey "vs". Use it only when both brands have a text wordmark that turns white cleanly and the two balance in width (principle 31). The Nextech vs NextGen band was approved ("show some other whose logos width will look equal in this template"), then replaced by the duel after delivery ("their designs are not good"): NextGen's boxed wordmark looked small.
- **"perfect" ×2** (batch 7): EHR Implementation Cost as one flat white product card on the glow (`flatcard2`): the title, the figure big in the blue gradient inside a light dashed selection with small square corner handles, and a collaboration cursor (a blue arrow with a compact name tag carrying the qualifier) inside the card. The dermatology research cover on our light glass (`research`): a frosted pill, a black heading, frosted logo tiles in one row, thin Peec guide lines in our blue, no dot pattern. Repeat: one flat product card, wide and centred; a pill, a heading and one row of frosted tiles on light glass.
- **Research with two tilted tiles** (Solventum 360 Encompass vs Optum EncoderPro, batch 7): "just need one change everything is perfect except delete 360 encompass and encodepro text and tilt the logos from one above", then "this is fine just make logo close so they touch each other a lil bit and also incrase the sizes of them too so they look a lil bigger". No names under the tiles; tiles 230px, tilted 8°, corners just touching (gap −14). Repeat: two big tiles that nearly touch (principle 33).
- **Peec "Powered by" pair** (SimplePractice vs TheraNest, batch 7, `versus/peecpair`): "this is fine but use black color for logo text". A near-white hairline grid, a white pill with the title's angle, each brand's logo with its name in its own cell, lettering black, marks in their own colours.
- **Blue grid** (7 Best PT Software for Multi-Location Clinics, batch 7, from the user's Databricks reference): "i like this layout and design". A flat blue field, a white hairline grid edge to edge, each pick on a white tile in its own cell. Repeat: the picks as one shaped group, one per cell, on a strong field.
- **Approved and kept, no note** (batch 7): `squircles` (the picks as big frosted squircle tiles in one row on the faint grid), `versus/glasspair` (two big frosted squircles on the deep-dunes blue, after "this looks better but use our good gradient bg"), `versus/span` (each product's price range to scale on one axis, on the dunes after "change bg, this bg doesnt look good"), `typehero` (big names in one line, one frosted bar of answers), `versus/inline` (logos inside a big two-line headline), `meter` (bare, on white). What they share: one object at confident scale, on one of our strong fields.
- **Praise that was reversed** (batch 7): `versus/glasssplit` (DoseSpot, Nextech on black, McKesson, Solventum light), `glassrows` (mental health), `avatars` (mental health, "these 2 can be improved"), `capsule` (PT), `flatcard` (the first flat card with a cursor, "this can be improved") and `bigtype` (Solventum) were approved, then replaced by the user on every article. Asked whether to keep them, the user first said keep all, then "actually delete all of them": all six are retired. Two lineups in specialty (derm, PT) and the picker's `versus/center` and `versus/badges` were replaced too ("need new templates for these"). None of these is a model to repeat; principle 34.
- **"Its fine"** (`count`, `cloud`, `versus/center`, `versus/lanes`, `picks`; `versus/fan`, batch 6: "this is fine"): accepted, not praised. Use them, but don't copy them as models.

**Ask:** which praised image is closest to this article, and does this image use what made that one work?

### 21. Pro craft: it must look made by a senior designer

The user judges finish before content. An image with the right facts and parts still fails if its sizes, spacing and alignment look improvised. A senior designer's image has one hero at a confident size, generous even margins, every edge aligned to another, sizes from one scale, and nothing small, staggered or tucked in without a reason.

- **Steps** (EHR Interoperability Cost, batch 6 first pass): "it looks like this is designed by a begineer not by a pro experienced designer". Three white tier cards rose like stairs from one baseline, each with a tier name and a price, one in the blue anchor: three mid-sized cards and no hero.
- **Versus chips and versus offset** (Tebra vs Zocdoc, symplr vs Modio Health, batch 6 first pass): "painfully bad visual design". Chips put a small logo tile in front of two small blue-outline chips under a big headline; offset staggered two row cards left and right, each with a small tinted pill. Small pieces and a stagger with no reason read as amateur. The same parts done with craft were loved: `versus/stacked` is offset's two row cards aligned on the centre, tilted only slightly, with one big blue figure on each.
- **Versus halves** (Waystar vs R1 RCM, batch 6 first pass): "i dont like this it looks off and doesnt match our design vibe". A canvas split down the middle (white | light blue) is not one of our compositions; the approved `versus/duo` replaced it.
- **The EHR tier deck on the mesh** (batch 6 round 5): "thats too bad visually".
- **What the approved ones did instead:** `figures` (two big blue ranges and one hairline), `costgrid` (one blue anchor card and two white cards on one grid), `glassbar` (one frosted bar on black), `versus/stacked` (two wide rows). Pro means one hero, big type, generous space and one anchor.

**Ask:** would a senior designer sign this? Does one element lead at a confident size? Do the edges line up, are the gaps even, and do the sizes come from one scale? Is anything small, staggered or squeezed in that an approved image doesn't have?

### 22. One focal group, never scattered

Everything sits in one tight group on the optical centre, about 940–1000px wide, with even space around it. Pieces spread to the canvas edges, or one element floating outside the group, read as scattered.

- **Round 3** (batch 6: `link`, `versus/annotate`, `versus/corners`): "all of them looks too much and you are just using same color and it doesn't look visually balanced, it doesn't look visually appealing, it looks scattered, it looks like AI slop." Cards joined by a connector, labels hanging under names, and two prices in opposite corners all spread the content across the canvas. All three were retired.
- **Numbered** (7 Best Telehealth Software for Therapists): one column per pick, each a large light number over a logo tile and a name: "numbers looks so weird and visually cluttered and unbalanced". Three things per pick, repeated five times, is clutter; `frostrow` keeps only the tile and the name.
- The map of the approved set (round 4) showed what they share: a strong field and one tight centred group. QA's cuts from round 4: a lone "?" outside the group reads as scattered, and an empty band inside a white card reads as unfinished.

**Ask:** squint at the image. Is there one group, and does it sit on the centre? Does anything float on its own near an edge? Is the group within about 1000px, with even space around it?

### 23. A comparison reads as a comparison

An X vs Y image must say "two things, side by side" in one glance: two equal sides, the same kind of fact on each, and a clear "vs" between them.

- **Versus pill** (Doxy.me vs Zoom, batch 6 first pass): "doesnt look like comparison image". One long white pill holding both products read as one thing. The approved `versus/badges` (two equal columns, a "vs" between) replaced it.
- **Versus chips** (Tebra vs Zocdoc): a big headline over small logo tiles and chips made the pair a footnote; the approved `versus/fan` puts two equal price cards face to face at the "vs" disc.
- **What reads as a pair:** two equal columns (`badges`, `figures`, `scores`), two equal cards meeting at the "vs" (`fan`, `frost`, `overlap`), or two equal rows on one seam (`stacked`, `lanes`). One price per side, in one style (principle 2).

**Ask:** cover the "vs". Can you still tell there are two products being weighed against each other, with equal weight? Is each side's fact the same kind of fact?

### 24. Use our whole palette across a batch

Variety comes from layout, and colour varies across a batch too. Our fields range from black (the black canvas of `glassbar`, `dark`, `versus/duo`, `versus/slash`; plain black for `versus/band`) and the blue gradient (the deep-dunes blue, the `versus/tiles` blue, the `bluegrid` blue) to the faint grids, light glass, the light glow, mesh, white panel, sky and cream. A batch drawn from one corner of that range looks like one template.

- **Round 3** (batch 6): "you are just using same color". Every option was pale sky with blue accents. Then: "we have multiple colors, black background color, blue gradient, and then like so many other".
- **Round 7** (batch 6): "try using black background maybe, because we haven't used it for like so long." The approved `glassbar` is black.
- **Versus tiles** (DrChrono vs athenahealth, batch 6): approved with "use the blue gradient bg".
- **Batch 5 picks:** seven different fields for 12 images (principle 14).
- **Batch 6 as delivered:** black twice (`glassbar`, `versus/duo`), the blue once (`versus/tiles`), white twice (`figures`, `versus/type`), glow five times (picked), and `frostrow`'s own light mesh. The vibrant rule (1 in 3 per category, never neighbours) still holds; the user overrode it once, for Waystar's black duo.
- **Batch 7, "use black bg too in some":** black and blue were asked for, but which black and which blue matters (principle 28). Black is plain black ("use full black bg"); blue is the deep dunes. "Our good gradient" (McKesson vs PioneerRx glass pair): "this looks better but use our good gradient bg". The hand-mixed blue (sky to royal with lavender and aqua glows) was not ours; the approved one is the deep-dunes blue with grain (`"canvas": "dunes"`), and the light glow version was disapproved.
- **Batch 7, the vibrant cap against an approved black:** Solventum's black big type was approved, the 1-in-3 rule refused it, and the light substitute was later sent back with SimplePractice and Nextech: "their designs are not good". When the cap blocks an approved image, say so and offer an override or a different black or blue design; never silently downgrade to a light reuse.
- **Batch 7 as delivered:** black twice (`dark`, `versus/band`), the blue three times (`bluegrid`; `versus/span` and `versus/glasspair` on the dunes), and the light fields for the rest (faint grids, light glass, glow, white, sky).

**Ask:** lay the batch out as thumbnails. Are the strong fields (black, the blue) there as well as the light ones? Does any single field take over? Within a category, do the vibrant images stay 1 in 3 and apart?

### 25. One skeleton per review page, once per category per batch

A review page shows each skeleton once. A delivered batch uses a layout at most once per category, even when the user approved it on two articles.

- **Batch 7, every round:** a family shown on N articles of one page won at most once, often never. Round 4 put big type on 6 articles and notepad on 3; one big type won. Round 2's rollout: stacked 0 of 5, fan 0 of 2, glass split 1 of 4. The user: "done stop repeating designs now , use black bg too in some".
- **Two lineups in specialty** (derm and PT, both approved in round 2) were both flagged after delivery ("need new templates for these") and replaced. Approving both didn't make the repeat welcome.
- **Visual QA's "repeat" calls were right almost every time.** Count families by skeleton, not by name: QA flagged glass split as `versus/table`, meter as `ranked`, glassbars as `versus/stacked`.
- A loved design may come back in a different category (the duel: Vanta in compliance, then Nextech in specialty, approved), never twice in one (the user declined "Reuse the looks you loved" for the last specialty articles).

**Ask:** does any other option on this page, or any other image of this category in the batch, share this skeleton?

### 26. Big object, full stage

One object at confident scale fills the stage: duel names about 120px, tiles 200–400px, cards about 900–1100px wide. A small widget floating in a big field reads as a dashboard screenshot, not a cover.

- **Batch 7 rounds 1–3:** almost every rejection was a compact white or frosted card about 600px wide, 2–4 rows of 14–22px labels and mid-sized blue figures, centred on a gradient: `breakdown`, `track`, `toppick`, `glasstiles`, `pricebar`, `versus/routes`, `versus/profiles`. All retired.
- **The flagged finals**, the seven finals the user flagged with "need new templates for these" (EHR implementation, Vanta vs Drata, SimplePractice vs TheraNest, Nextech vs NextGen, the dermatology, physical therapy and mental health lists), had the same look: lineups as a thin strip of small icons, badges as outline chips, a cost grid in the top-left.
- **`flatcard`** (retired; improved into `flatcard2`): "increase its width and make it center aligned and increase the size of cursor". The approved `flatcard2` is wide and centred.
- **The kept finals** fill the canvas: the duel's names, the band's wordmarks, squircles and glass-pair tiles at 220–400px, the checkcard about 900px wide or more and flatcard2 (~1100px).

**Ask:** at 350×250, is there one big thing at confident scale, or a small card floating in an empty field? Are the labels big enough to read at that size?

### 27. A figure lives inside an object

A price or a score is never the lone hero on a bare field. It sits inside an object: a struck claim, a product card with a selection, a to-scale track, a type pair, a prompt panel. It stays in balance with the heading (principle 1's 150px cap).

- **Rejected, a figure alone:** big type (1 of 6 approved, then retired), `bracket`, `horizon` ×3, `bluefield`, `wordtag`, and `versus/delta`: "$20 looks so weird bec its so big there is no visula balance at all" (the $20 was about 2.4× the heading).
- **Kept, a figure inside an object:** `strike` ("Love it"), `flatcard2`'s selection ("perfect"), `versus/span`'s and `meter`'s tracks, the `versus/scores` pair (TruBridge, 7.6% vs 21.9%), and `prompt`.
- This replaces "logos and type lead, figures follow", which was written mid-batch and is too broad: figure-led images were approved whenever the figure had a home.

**Ask:** cover the field around the figure. Is the figure still inside something (a card, a track, a strike, a pair)? Is it the same weight as the heading or a step above, never a block on its own?

### 28. Black is plain black, blue is our deep dunes

Black means plain black. Blue means the deep-dunes blue with grain (or the `bluegrid` blue). Never the navy-blob black canvas, another brand's gradient or a hand-mixed blue.

- **"use full black bg"** (the Peec black covers): the approved `versus/band` is plain black, one hairline band.
- **The navy-blob black lost:** nearly every rejected black option sat on black with big navy and blue glows (rows, routes, glow tiles, big type, `heroglass`: "its too bad not visually appealing at all"; `versus/underline`: "too bad visual"). Glass rows, glass split and big type on it were all retired. Curve's span, approved on it in round 5, came back as a final: "change bg, this bg doesnt look good". Of black, the dunes and the glow, the dunes won.
- **Outside gradients:** "you can also use calendly gradient cus it matches with ours", then, on the result: "the gradient looks awful" (sky and aurora). The user's verdict on the image overrules their own suggestion.
- **Hand-mixed blue:** "this looks better but use our good gradient bg" (McKesson). Our gradient is the dunes.

**Ask:** is the black plain black? Is the blue the dunes (or the `bluegrid` blue)? Is any gradient on the image one we didn't approve?

### 29. Flat shapes: card corners, no rotation, no blobs

Big panels take card corners (about 40px), never pill ends. Cards never rotate; only small tiles (240px or less) may tilt, by 8° at most. No liquid joins, bursts, bubbles, Venn diagrams, rims, orbits or org-chart trees.

- **Capsule** (PT, the seven marks in one white pill): "i dont like this rounded it looks weird".
- **`cursorcard`** (tilted, from Peec; retired): "not tilted rectangle pls also use our bgs". Rebuilt flat as `flatcard`, approved, then improved into `flatcard2`, the one kept.
- **Gooey** (Calendly's fused squircles): "ew dont connect and the gradient looks awful".
- **Burst:** "disgusting shapes". **Bubbles:** "ew". **Horizon:** "i like the shape you used but over alll its too much., not visually apealing at all"; kept for round 7 and failed every time after (horizon2, side glow, eclipse, crescent): a liked part is not a direction.
- Disapproved with no note: `versus/venn`, `versus/bands`, `versus/butterfly`, `waffle`, `arc`, `versus/medallions`, `tree`.
- **Tilt survived once:** Solventum's two 230px tiles at 8°, corners touching.

**Ask:** is any panel pill-ended, any card rotated, any tile tilted past 8°? Is there a shape that isn't a card, a tile, a track or type?

### 30. Say each thing once

No visible string twice: no tag repeating the title, no names under tiles the heading already names, no chip and cursor tag saying the same thing, no typed name beside its own wordmark.

- **Nextech band:** "delete dermatology tag" (the title already says dermatology).
- **Solventum research:** "delete 360 encompass and encodepro text" (the heading names both).
- **`flatcard`** (now `flatcard2`): its action pill was cut because it repeated the tag. Fact QA: a wordmark next to the same typed name fails (`"wordmark": true` hides the typed name).

**Ask:** read every word on the image. Does any word or name appear twice, or say what the heading already says?

### 31. Wordmark pairs are real and equal

Layouts that show wordmarks use each brand's real text wordmark, or the mark plus its name typed in ink. The two are sized to equal width. Lettering is white on black and black on light; the marks keep their colours.

- **Band:** "the bg the logo without bg, white logo colors, logo text. so for this template use logos that has logo text too". Then: "show some other whose logos width will look equal in this template". Tecsys vs Cardinal on the band was disapproved (Cardinal's thin wordmark looked small), and Nextech's band was replaced because NextGen's boxed wordmark looked small.
- **Peecpair:** "this is fine but use black color for logo text". A brand with no wordmark of its own (TheraNest) gets its mark in colour and its name in black, not in brand colour.

**Ask:** are both wordmarks real, the same width by eye, lettered in ink (white on black, black on light), with the marks in their own colours?

### 32. A reference is a spec, translated to our system

Measure a reference on the original file (radius as a %, stroke, sizes, colours, paths) and put the numbers in the spec. Then translate only what makes it ours: our fields, our colours, our 22% tile radius and our "vs". This sharpens principle 9.

- **The checkbox had to be redone:** "use exact same checkboxes size and tick icon that was in its inpirsation" (principle 9 has the numbers).
- **Our fields:** "for this use our glass bg" (derm research), "not tilted rectangle pls also use our bgs" (`cursorcard`, retired), "for McKesson vs PioneerRx … use this ss with our bg".
- **Our colours:** "use bg lines too like ss2 in our colors".
- **Our radius:** "make the corner radius consistenty" (the glass pair tiles take frostrow's 22%, not Calendly's 30%).
- **Our grammar:** "done and i like these we have black bg template too so use that instead of + use vs".
- **References beat invention** in batch 7: about 10% of invented options were approved; the reference-led ones passed in one or two rounds. After two failed rounds of inventions, go to references (browser research of product blogs with our vibe: Dub, Peec, Calendly, Databricks), not to the approved-looks picker: of the four approved-looks picks, three were later replaced (Vanta center, SimplePractice badges, EHR implementation costgrid); only Claims Denial's prompt stayed.

**Ask:** does the spec carry the reference's measured numbers? Is everything that changed one of: field, colour, radius, "vs"?

### 33. Pairs sit close and big

A two-tile pair is at least 200px per tile and nearly touches. With a "vs", the gap is the "vs", not empty field.

- **Solventum:** "this is fine just make logo close so they touch each other a lil bit and also incrase the sizes of them too so they look a lil bigger". Tiles 180 → 230px, gap −14.
- **Kept pairs:** the glass pair (two 400px squircles on the dunes), the duel (the small grey "vs" is the gap).

**Ask:** is each tile 200px or more? Is the gap between them either nothing or the "vs"?

### 34. Approval holds only when the batch holds

An approval in a round is provisional until the user sees the whole batch together. Show the batch as a contact sheet and critique it before delivery: repeats, small widgets, the navy-blob black, one field everywhere.

- **Batch 7:** 11 of 20 approved finals were redone after delivery: "need new templates for these use /blog-featured-images" (seven at once), "these 2 can be improved i am attaching some inspirations in the next msg", "neeed designs for them, their designs are not good".
- **Designs approved and then replaced everywhere are retired.** Asked whether to keep them, the user first said keep all, then "actually delete all of them" (glass split, glass rows, avatars, capsule, flatcard, big type).
- **The best of a weak set is provisional:** the PT capsule was accepted as the only option on offer and flagged again minutes later.

**Ask:** lay the batch out as one sheet. Is there a repeat, a small widget, a navy-blob black or a field that takes over? Would the user flag any image if they saw it next to the others?

## Self-Critique (Required)

Makers run this on their own image before returning it; Visual QA runs it on every image. Look at `master.png` and `card-350x250.png`, next to two approved images from the same family. Answer in a table:

| Check | Pass when |
| --- | --- |
| Balance | The heaviest element is the one that should be; its partner holds its own (1) |
| Hierarchy | The key figure leads; names and labels sit a step below the figure they introduce, never as big or as bold (1) |
| Sameness | Parallel elements share one treatment (2) |
| Radii | Every tile in a row has one size and one corner radius; an app icon is the tile (`"fill": true`) or gives way to the bare mark, never a rounded square nested in another, except `frostrow`, where a filled icon sits at 48% inside its glass tile with the same 22% radius (2) |
| Label vs logo | Nothing wears another element's form: no heading or count dressed as a tile among logo tiles (2) |
| Real pairs | Paired figures are two real numbers on one scale; never a word or a block of text against a number (2) |
| Family | Weights, colours and ink match the approved images beside it (3) |
| Pattern | Sparse and faint, never dense, dark or competing with the content; edge-only, clear behind the content, on `shortlist`, `lineup` and dark fields; none on `versus/bento` (4) |
| Logo fill | Each logo fills 60–70% of its tile (the frosted tiles of `versus/frost` and `frostrow`: 48%); a solid app icon is the tile, edge to edge, except `frostrow`, where a filled icon sits at 48% inside its glass tile with the same 22% radius; a wide, thin mark gets a per-card `scale` until its weight matches by eye (1, 8) |
| Illustration | Removing the headline still leaves something to look at (5) |
| Field | The hero separates cleanly from the background at 350×250 (6) |
| Bold | Exactly one bold thing; it would stop a scroll (7) |
| Brands | Real current logos, original colours, no site mark on headline layouts (8) |
| Names | Each product is named as people say it ("Zoom", not "Zoom for Healthcare"); the user's spelling wins, and Fact QA confirms it (8) |
| Reference | Every detail of a shared reference is copied and measured, never eyeballed (9) |
| Restraint | Nothing added that the approved template doesn't have (10) |
| Earns its place | Every element carries meaning: no check boxes on a pair, no container that only frames, no dot patch that only fills a corner; "minimal" means one fact in one container (4, 10) |
| Amount | Each fix moves as far as the note asked, compared with the original (11) |
| Words | 15 is a ceiling, not a target; nothing reads as filler (12) |
| Optics | Centred by eye at full size and at 350×250, not by the numbers (13) |
| New | Not used in this category; layouts not used yet anywhere come first (14) |
| Headline ink | Headlines black `#0A0A0B` (white on dark fields), never blue or navy, no blue words (3) |
| Real things | The article's own logos, names and figures; no clip-art stand-in (15) |
| Fresh | The newest facts and version; nothing describes a retired layout or option (16) |
| Our parts | Built only from approved parts, checked against the map of the approved sheet; no device, prop or material (17) |
| Own skeleton | Its skeleton isn't shared with a layout already in the category, siblings from the same approved part included (14, 17) |
| Fresh batch | The batch isn't filled with reuse: no layout the user has already seen in it, no template the user has seen many times across the site offered as "new", no approved option rolled out to other articles (14) |
| Field variety | Across the batch the colour range is used: black (plain black for new designs) and the blue (the dunes) as well as the light fields, no single field taking over; the user's picks (`bgPick`) are kept; vibrant stays 1 in 3 per category (6, 14, 24) |
| One glance | Any chart reads in one glance at 350×250; grey tracks sit on a white card, or bare on the white field only (18) |
| Concept fit | The visual idea matches what the article is about, and its figure is the article's own lead figure for every product shown (19) |
| Praised parts | The closest praised image was checked, and what made it work is used where it fits (20) |
| Pro craft | It looks made by a senior designer: one hero at a confident size, aligned edges, even gaps, sizes from one scale; nothing small, staggered or squeezed in (21) |
| Not scattered | One tight group on the optical centre, about 940–1000px wide; nothing floats alone near an edge (22) |
| Reads as comparison | An X vs Y image shows two equal sides with the same kind of fact and a clear "vs"; covering the "vs" still leaves an obvious pair (23) |
| Once per page | No other option on the review page, and no other image of this category in the batch, shares this skeleton, counted by skeleton, not by name (25) |
| Full stage | One object at confident scale (names about 120px, tiles 200–400px, a card about 900–1100px wide); not a ~600px widget of 14–22px labels floating in a field (26) |
| Figure in an object | Every figure sits inside a card, a track, a struck claim, a type pair or a prompt; none stands alone on the field, and none outweighs the heading (27) |
| Our black, our blue | Black is plain black; blue is the dunes (or the `bluegrid` blue); no navy-blob black, no outside or hand-mixed gradient (28) |
| Flat shapes | No pill-ended panel, no rotated card, tile tilt only on tiles of 240px or less and at most 8°; no liquid joins, bursts, bubbles, Venn, rims, orbits or trees (29) |
| Said once | No word or name appears twice; no tag repeats the title; no names under tiles the heading already names; no typed name beside its own wordmark (30) |
| Wordmark pair | Real text wordmarks (or mark + name in ink), equal width by eye, lettering white on black and black on light, marks in their colours (31) |
| Reference numbers | The spec carries the reference's measured numbers; only the field, colour, the 22% radius and "vs" were translated to ours (9, 32) |
| Close pair | A two-tile pair is 200px or more per tile and nearly touches; with a "vs", the gap is the "vs" (33) |
| Batch view | The whole batch, seen as one contact sheet before delivery, shows no repeats, no small widgets, no navy-blob black and no single field taking over (24, 25, 26, 34) |
| Predicted verdict | Its closest match is an approved image, not a rejected pattern; the prediction is written down (Predict the Verdict) |

Any "no" is a fix before the image moves on.

## Predict the Verdict (Required)

The user should rarely have to say no. Before any image or option goes to the user, put it next to the approved images (`references/approved/`) and the site sheet (`scripts/sheet.mjs`), and next to the rejected patterns below. Name the closest match on each side, and write one line: **"Predict: approve, closest to 54 versus/stacked (two clear rows, figure right, on glow)"** or **"Predict: reject, looks like round 3 (pieces spread to the edges, pale sky only)"**. A predicted reject is fixed or replaced before the user sees it; never send an image you expect to be rejected. When the verdict comes back, compare it with the prediction, and turn a miss into a principle here.

**What the user rejects** (the pattern, the user's words, where it happened):

| Looks like | The user's words | Images |
| --- | --- | --- |
| A beginner's build: mid-sized pieces, no hero, a stagger with no reason | "it looks like this is designed by a begineer not by a pro experienced designer"; "painfully bad visual design"; "thats too bad visually" | `steps`, `versus/chips`, `versus/offset`, the EHR tier deck (batch 6) |
| Too much, scattered, one colour | "all of them looks too much and you are just using same color… it looks scattered, it looks like AI slop" | `link`, `versus/annotate`, `versus/corners` (batch 6 round 3) |
| Not a comparison | "doesnt look like comparison image" | `versus/pill` |
| Off our vibe | "i dont like this it looks off and doesnt match our design vibe" | `versus/halves` |
| Clutter and mixed shapes | "numbers looks so weird and visually cluttered and unbalanced and corner radius of logo bg is not consistent" | `numbered` |
| Many cards where one fact would do | "it's 3 cards, they are like too much. There should be some minimal way for this" | the EHR tier cards (batch 6 rounds 5–6) |
| A template the user has seen many times | "this template is already being used"; "the images that I have disapproved has already been used multiple times, so I wanted to create new ones" | a second `versus/pills` (batch 4); the batch-6 options round |
| Props, devices, materials | "why are you using mobile mockups" | the 12 batch-5 props |
| A clip-art metaphor | "looks like a law illustration, the concept is so bad" | `versus/scale` |
| A clever but confusing chart | "i like the design but it is confusing" | `versus/range` |
| A heading dressed as a tile | "7 best pediatric shouldnt be like other logos, this looks off" | `grid` |
| A background with only a headline | "can be used with some other illustration, but not like this with just a title heading" | `brandline` |
| A word against a number | "ew revert it" | Oracle vs MEDITECH 2026 scores |
| A lone hero number on a field, too big for its heading (27) | "$20 looks so weird bec its so big there is no visula balance at all"; the rest with no note | `sp-delta`; big type ×5, `impl-bracket`, `impl-bluefield`, `impl-wordtag`, `cd-contrast`, `cd-masthead` (batch 7) |
| A small widget in a big field: a ~600px card of 14–22px labels on a gradient (26) | no note; "need new templates for these" on the finals with the same look | `breakdown`, `track`, `toppick`, `glasstiles`, `pricebar`, `versus/routes`, `versus/profiles`; the seven finals the user flagged with "need new templates for these" (EHR implementation, Vanta vs Drata, SimplePractice vs TheraNest, Nextech vs NextGen, the dermatology, physical therapy and mental health lists) (batch 7) |
| The same skeleton on several articles of one page (25) | "done stop repeating designs now" | big type ×6, notepad ×3, stacked ×5, glass split ×4 (batch 7) |
| The navy-blob black: black with big navy and blue glows (28) | "its too bad not visually appealing at all"; "too bad visual"; "change bg, this bg doesnt look good"; "use full black bg" | `impl-heroglass`, `vd-underline`, Curve span on black, glow tiles, big type, rows and routes on black (batch 7) |
| An outside or hand-mixed gradient (28) | "the gradient looks awful"; "this looks better but use our good gradient bg" | `mh-squircles` and `gooey` on the Calendly sky and aurora; `mck-glass-blue` (batch 7) |
| A pill-ended panel (29) | "i dont like this rounded it looks weird" | `pt-capsule` (batch 7) |
| A rotated card (29) | "not tilted rectangle pls also use our bgs" | `impl-cursorcard`; tilted `notepad` (batch 7) |
| Liquid joins between tiles (29) | "ew dont connect and the gradient looks awful" | `mh-gooey`, `pt-gooey` (batch 7) |
| Decorative or diagrammatic geometry: bursts, sized bubbles, Venn, overlap bands, rims and horizons, orbits, an org-chart tree (15, 29) | "disgusting shapes"; "ew"; "i like the shape you used but over alll its too much., not visually apealing at all"; the rest with no note | `vd-burst`, `sp-bubbles`, `impl-horizon`, horizon2, side glow, eclipse, crescent, `nx-venn`, `nx-bands`, `vd-butterfly`, `vd-waffle`, `derm-tree` (batch 7) |
| A UI control or stationery as the idea: a slider, a toggle, crop marks, a notepad | "this layout is borint"; the rest with no note | `cd-slider`, `sp-toggle`, `impl-cropmarks`, `sol-notepad`, `vd-notepad` (batch 7) |
| Too many words on a cost image (12) | "too much text" | `cd-footnote` (batch 7) |
| Redundant text: a tag repeating the title, names under tiles the heading names (30) | "delete dermatology tag"; "delete 360 encompass and encodepro text" | `nx-band`, `sol-research` before the fix (batch 7) |
| Unequal or unreal wordmarks: one thin or boxed, typed names in brand colour (31) | "show some other whose logos width will look equal in this template"; "use black color for logo text" | `tc-band`, the Nextech band, `sp-peec` before the fix (batch 7) |
| Many small pieces in place of one object (chips, icon rows, a ladder, an app directory, a chip cloud) | no note; disapproved | `sp-tierchips`, `sp-ladder`, `impl-iconrows`, `derm-market`, `toppick` with its minis (batch 7) |
| The template being replaced, re-dressed (a lineup row with hairlines or a horizon, a logo grid) | no note; disapproved | `derm-index`, `pt-horizonrow`, `pt-tilegrid` (batch 7) |

**What the user praises** (repeat these first, principle 20): `spotlight` "perfect concept and design" (the title's angle in the selection box over a card of real products); `versus/scores` "i love the design" (two real numbers set big, no chart); `versus/stacked` "love it. The concept, visual , everything looks so appealing and perfect" (two clear rows, logo + name left, figure right, a slight tilt, on a calm light field); frosted glass for logos ("I like how you have used logos with these glass bgs", then "for logos bg glass bg would look better": `versus/frost`, `lineup`, `frostrow`); "wow love it, everything is perfect" for `shortlist`, `definition`, `versus/glass`, `versus/tiles` and `versus/type`; `figures` and `costgrid`, approved at once with no note (big blue figures, one anchor). From batch 7, only what was kept: `strike` "Love it" (the claim struck through, the truth beside it); `versus/duel` "wow love it" (two big lockups on a quiet grid); `versus/band` "this is perfect" (two white wordmarks on plain black); `flatcard2` and `research` "perfect" (one flat product card; a pill, a heading and frosted tiles on light glass with blue guide lines); `bluegrid` "i like this layout and design"; `checkcard`, `versus/peecpair` and `versus/glasspair` (copies of the user's own references on our fields). Never repeat the reversed praise listed under principle 20.

**How the predictions went in batch 6** (calibration): the plain, strong layouts (`figures`, `costgrid`) and the never-used approved templates passed at once; every layout with more pieces than an approved one failed. Of nine round-4 options, the one approved (`versus/fan`) was the closest to an approved image (the tilted card on blue, 07); the eight rejected ones had no close approved match.

**How the predictions went in batch 7** (calibration, 20 articles, about 170 verdicts, about 33 approvals):
- **Invention converted at about 10%.** Of roughly 80 skeletons invented in rounds 1–7 and the redo, only `strike`, `meter`, `versus/span`, `versus/inline` and `typehero` reached a delivered final. Rounds 6 and 7 approved nothing (15 of 15 disapproved).
- **Reference-led options passed in one or two rounds:** `versus/duel` (Dub), `bluegrid` (Databricks), `squircles` and `versus/glasspair` (Calendly's tiles), `versus/band`, `research`, `checkcard`, `versus/peecpair` and `flatcard2` (Peec and the user's screenshots). Nine of the fourteen kept layouts came from a reference.
- **What approved:** one object at confident scale, a figure only inside an object, our strong fields (plain black, the dunes, the blue grid) or a quiet light one (faint grid, light glass), real wordmarks or big tiles as the hero.
- **What didn't:** the same skeleton on several articles, a small widget in a field, a lone hero number, the navy-blob black, outside gradients, decorative geometry, UI controls as the idea, pill-ended or rotated panels.
- **Approval was not the verdict:** 11 of 20 approved finals were redone after delivery, and 6 approved layouts were retired. Predict for the batch, not the round: before delivery, check the image on the batch sheet (principle 34).
- **The picker was a miss:** Of the four approved-looks picks, three were later replaced (Vanta center, SimplePractice badges, EHR implementation costgrid); only Claims Denial's prompt stayed. After two failed rounds, predict from references, not from old templates.
- **Visual QA's "repeat" calls were right almost every time;** when they were overridden, the results were mixed. A QA "repeat" is a predicted reject.

## How to Keep Learning

Every note, reference, "this is right", "this is wrong", "love it" or "disgusting" goes through the learning loop in SKILL.md ("Keep Learning (Required)"): a prompt, a principle in this file (the note quoted, the image named; a new one also gets a Self-Critique row, named in SKILL.md's Review Checklist and in agents.md's Maker and Visual QA templates, and raises the principle count here, in SKILL.md, in the README and in memory), a lesson, a renderer check where it can be measured, with a case in `scripts/test-refusals.mjs` for every decision the renderer or `plan.mjs` can enforce (otherwise a V- or F-check in `agents.md` and a line in the Maker template), a generalisation when the same correction comes twice, the decision recorded (a rejection in `agents.md` V9 and, for a layout, `RETIRED` in `layouts.mjs`; a newly approved image as an example spec and a `sources.json` line; every count it changes (modes/layouts, retired, approved images, examples, refusal cases and steps, taste principles) updated across the skill, the README, the `scripts/render.mjs` header comment and memory), every running Maker and QA told, the inspiration log for references, refreshed approved images, and a push.

Batch 6 (Oct 20 2026) added principles 21–24 (pro craft, one focal group, a comparison that reads as one, the whole palette across a batch), grew 2 (radii), 8 (names), 10 (minimal means one fact), 14 (seen-before is not new), 17 (map first) and 20 (what was praised), and the Predict the Verdict section. The history is in `lessons.md` section 21.

Batch 7 (Oct 21–22 2026) added principles 25–34 (one skeleton per page, big object, a figure inside an object, plain black and the dunes, flat shapes, say each thing once, real and equal wordmarks, a reference as a spec, close pairs, approval that holds only with the batch), grew 4 (no dot fade), 9 (the checkcard numbers, "exact ditto"), 10 (meter bare), 12 (cost words), 14 (approved templates are not new), 17 (references beat invention), 20 (only what was kept; the reversed praise) and 24 (which black, which blue; the vibrant cap), and calibrated Predict the Verdict. The history is in `lessons.md` sections 22 and 23.
