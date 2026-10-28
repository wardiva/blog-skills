# Lessons Learned

Read this before every batch. Each lesson cost a real batch or a review round; you don't have to pay for it again.

## 1. Speed Is the Top Priority

| Job | Fast way | Slow way (don't) |
|---|---|---|
| Read articles | `scripts/read-articles.mjs` (agent-browser, all URLs in parallel, full raw text in seconds) | WebFetch one URL at a time (slow, and it summarises, so facts get lost) |
| Pick layouts | `scripts/plan.mjs` (usage table, then reserve the whole batch in one command) | Render, get "VARIETY CHECK FAILED", re-plan, render again |
| Logo-dependent layouts | `scripts/logo-check.mjs <domains>` before reserving pills, connect, glass, tiles or logotype | Reserve, let the Maker hit a PILLS / CONNECT / GLASS / TILES / LOGOTYPE refusal, re-plan |
| Make images | All Makers started in one message, in the background | Makers one after another |
| QA | Visual QA on one `scripts/sheet.mjs` contact sheet **and** Fact QA on the specs + articles, started in one message | One QA agent doing looks and facts, or QA opening every image one by one |
| Fixes | One merged `SendMessage` per Maker; re-check only by the QA agent that failed it | A new agent that has to re-read everything; re-running both QA agents on everything |
| Big batches (10+) | If the user asks for a workflow: `pipeline(articles, maker, factQA)` so each article's facts are checked as soon as it's rendered (Visual QA still judges the whole sheet) | Waiting for every Maker before QA starts |

- Never sit idle while agents run; prepare the next step. Deliver each image as soon as it passes. One-line progress updates.
- Give agents only what they need: the article file, the spec-format section for their layout, the approved images.

## 2. Tool Gotchas

- Long Python or JS inside a bash heredoc breaks on quotes. Write a script file and run it.
- Paths with spaces: never pass them through a shell. Call `node <tool>.js` directly or use an env var such as `AGENT_BROWSER_EXECUTABLE_PATH`.
- agent-browser's daemon keeps child pipes open; finish on process **exit**, not pipe close.
- Parallel headless Chrome renders crash if they share one `--user-data-dir`. The renderer uses one profile per process, and its cleanup retries (on Windows, Chrome can hold the folder for a moment after exit).
- Brandfetch's logo CDN needs a client ID, must be hotlinked, and blocks the "HeadlessChrome" user agent (the renderer sends a normal one). Some brands (NetSuite, SAP, Sage, Epicor) have no symbol, only an icon; the chain handles it.
- A message sent to an agent just as it finishes may be dropped. If no reply comes, send it again.

## 3. Pre-Flight Before Briefing Makers

- **Count:** does the layout hold as many items as the article has (a "7 best" article needs 7 hub tiles)?
- **Names:** will the article's own product names fit? Never abbreviate a name the article doesn't.
- **Title words:** headline-less layouts (hub, before-after, most versus variants) carry the title's key words. A heading keeps the title's angle; a tile label is not a heading, so the hub's blue tile may shorten to the count and category ("7 Best ERP" on approved image 02) when the tile can't fit the angle.
- **Logos:** pills needs a logo that sits on white, connect a solid app icon, glass a compact wordmark, tiles two matching tiles (both filled or both white), logotype a black logo with a separate icon. Check with `scripts/logo-check.mjs` while planning, never after rendering.
- **Renderer bugs are the Orchestrator's job.** Fix the code once so every future image benefits; Makers only change specs.

## 4. Taste Decides

- **Visual appeal decides.** An image that passes every check can still fail. Judge it with a taste skill (impeccable) before sending.
- **Fields, shadows, logo fill and grain** are rules in `design-language.md` (sections 2 and 3); they were learned from batches 1-3 here.
- **Minimal wins:** whitespace beats filler; 15 words is the cap.
- **Prefer a visual over a text card:** icons, logos, arrows and checked items read faster than sentences.
- **Borrow a reference's structure only where it carries real content.** Comparisons have a natural visual (two logos, one VS); that is why the headline layouts are comparison layouts.
- **Show options side by side, once.** For any style or placement change, render 2–3 options together and let the user pick.
- When asked whether an image reflects the article, answer with a table mapping every element on the image to the sentence it came from.
- Approved rules win over QA suggestions that break them; say so in the fix message.

## 5. Variety Must Be Structural

- One site-wide history per brand counts every render, wherever its folder is.
- Layout identity (mode + variant) is the rule, and QA does the visual side-by-side (pixel similarity can't tell layouts apart).
- Every new article gets a new design (since Oct 28 2026; the last section): plan and register each new layout **before** briefing Makers.
- **Finalize every delivered image** (`scripts/finalize.mjs`). Delivered images are permanent: they stay in the history and the ledger, keep counting as used on the site, and can't be re-created, except by a redo the user asks for (`render.mjs --redo`, then finalize again). Never delete the history file.
- An article that already has a delivered image is not re-imaged unless the user explicitly asks; then it may keep its layout (a redo in the same layout and category is the same image, not a second use) or take a new design, the old files are backed up to `featured-images/_previous/<label>/` first, and it renders with `--redo`, never `--force`.

## 6. What the First Real Batch Taught (17 Articles)

- **Qualifiers got dropped:** "$140/mo minimum" lost "per provider", "96% collection rate" lost "up to". Copy the article's qualifier with the figure. This is why facts have their own QA agent: a fact error hides easily behind a good-looking image.
- **A breakdown contradicted its hero** ("4–9%" hero, "3–6%" row). Rows must sit inside the hero's range.
- **A one-brand image for an X vs Y article** (dark layout) looked like an ad. Comparisons always show both products.
- **Review rounds:** an interactive review page (before | fixed, Approve / Needs change / Pick A·B, a note per image) made feedback fast; turn each note into a prompt before acting.
- **Not every QA fix is wanted:** a tighter window, a pointer callout and bigger logo badges were all rejected ("before is better"). When a fix changes the look, show it next to the original first.
- **The user dislikes `versus/logos` (retired) and loves `versus/slash`, `versus/connect` and `versus/duo`.** Single-product articles use `logotype` when the logo is black with strong typography, otherwise `dark`. Their site-wide caps: section 13.
- **Match the user's references exactly, detail by detail:** the duo and dark layouts drop the site mark (dark shows the product's own icon in `#0A0A0B` on a white tile), dark's text starts at x 120 for balance, and logotype's icon sits on a black tile. Missing one detail from a reference cost a review round each time.
- **Review fixes that stayed** (the wide focus card and its 3px nudge, the stat gradient, prompt's own glow field, slash's clear dot grid, the vibrant table, Inter 500 in the headline layouts, the pills geometry, connect's app icons, slash's two-tone names) are rules now: `design-language.md` 3d and `taste.md`.
- **Logo chain surprises:** a brand's "icon" can be a stale anniversary badge (Availity) or a pale grey wordmark (Sectra). Check every logo by eye; use the official site icon from the brand's website when needed.
- **Work in the project folder.** One batch rendered into a temporary scratch folder; delivered images must live in the project's `featured-images/` (finalize also keeps a copy in `~/.blog-featured-images/delivered/`).
- **Fix the skill, then publish:** renderer fixes made during a batch go into the skill and are pushed, never left as local patches.

## 7. Facts Come From the Raw Text

- Use the article's own wording for names and numbers; QA compares every value against the article file.
- Raw article text (agent-browser) beats a summary (WebFetch) for checking facts.
- Never invent sample values (patient names, drugs); use the article's own words.

## 8. The Gumloop layouts (Oct 2026)

- Six layouts were built from the user's Gumloop references (versus/type, versus/tiles, versus/glass, swap, badge, brandline); brandline was later retired, leaving five. Approved fields only (the renderer refuses the rest). Narrowed in the approved review (section 13) to: type light; tiles blue, light; glass light, black; swap light; badge light.
- The user's review notes that stayed: "vs" vertically centred between the names; patterns (dot grids, the tiles ring) kept sparse and faint ("pattern is too much"); the "+" grid is fine as is (later refined: on dark fields it is bright and crisp, only around the edges).
- Rejected: versus/type on black, badge on the blue field. Glass on the blue mesh was approved in round 2, then taken off blue in the approved-templates review (glass is light and black only).
- Inline `style="background:url("…")"` breaks on the inner double quotes: put data-URI backgrounds in a `<style>` block (the `glBg` helper).
- A per-image review page (Approve / Disapprove + a note, saved to the page's database) made the decisions fast; read them back with ArtifactData.
- First test run (6 articles, full Maker + QA flow) fixed in the renderer: swap labels capped inside x 210-1390; the pale-wordmark darkening only touches free-standing pale ink (SAP's white letters stay white); the glass bar stays inside the card; glass sizes both wordmarks by their measured lettering height (type, not icon) and refuses lockups wider than 9:1 ("GLASS LOGO CHECK FAILED"); the vibrant refusal names black layouts too.
- Glass needs wordmarks that name the products (a parent mark like SAP for SAP Business One fails Fact QA); use tiles or type for those. Badge values stay short (abbreviate thousands as K). Swap labels carry the title's subject ("Old EMR" -> "New EMR").

## 9. Batch-3 review (Oct 2026)

- The user rejected a layout recognised from an earlier batch ("this template is already used"), even in another category (history: section 13 has the rule now).
- versus/tiles: the batch-3 rule (filled icons only) was replaced in the approved-templates review by: both tiles filled, or both white, never one of each.
- When the user asks for a comparison layout on a duplicate-topic article, their request beats the same-topic rule: drop the "topic" and use a versus variant the first article didn't.
- Stack: keep it to the title plus one lead line when the lead already carries the figure ("too much text").
- Batch-3 round 2: the user LOVES `dark` but only with a real product logo: never on a topic article with an icon ("icon is not looking good"). Save it for single-product articles.
- When no layout free in the category fits, build new originals in the same family rather than repeat (Oct 2026: `receipt` and `definition` approved in batch 3; `versus/split` and `versus/duet` built but the user passed on both, so they're retired; `versus/rows` rejected).
- Batch-3 round 5: the user disapproved `versus/rows` (both fields), `versus/table` and `versus/overlap` for Clinisys vs CompuGroup Medical, then dropped the image ("forget about it"). Don't offer `versus/rows` again unless asked. Receipt headlines are black (#0A0A0B) by the user's request, not navy.

## 10. Approved-templates review (Oct 2026)

- The user reviewed all 31 approved templates on one page (Keep / Needs change + a note): 24 kept, 7 changed. Every note became a principle in `references/taste.md`, which is now required reading with a Self-Critique for Makers and Visual QA.
- Changed: focus headline weight matches the other card headlines (semibold 600, then black in round 7); stat number capped at 150px with a bigger card; receipt headline semibold 84px; swap's "+" grid on black only frames the edges (made bright and crisp in round 7); tiles both filled or both white; glass off the blue field; brandline retired (a background with only a headline). The glow field now carries `lineup`; the blue mesh is kept in `references/fields/`.
- When options were needed (stat, swap, receipt), the orchestrator picked them using taste.md and showed its reasoning; the user can still overrule on the review page.
- Round 7: the focus headline went black ("not blue"); the swap grid on black was faded to invisible in round 6 when the note meant brighter: now crisp and only around the edges. Read a note in its context and fix by the amount asked (taste 11).

## 11. Batch 4: fresh redo of 10 (Oct 2026)

- Approved with "wow love it, everything is perfect": `shortlist` (new; notepad on the left, black headline right, blue Rx sticker on the pad), `definition`, `versus/glass` (Clinisys wordmark vs the CGM sphere emblem), `versus/tiles` (both white, blue field), `versus/type`.
- Rejected: `folder` ("I like the background, the glass effect and the logos, but not the layout"; retired from layouts.mjs). The user's reference for lists: one centred row of square white logo tiles, a big faint shape behind it, no headline. Built as `lineup` (on the glow field with frosted glass).
- Rejected: a second `versus/pills` ("this template is already being used"), even with a written repeat reason. Favourite repeats are not welcome either: build a new layout instead (`versus/scale`, a level balance scale holding both logo tiles).
- Renderer fixes: the same-topic check ignores superseded images; glass sizes a near-square emblem at ~1.35x the wordmark's height; an empty bold badge note no longer takes a gap; the shortlist "+" grid sits under the pad.
- Batch 4, round 2: `versus/scale` (a balance scale) was rejected hard ("looks like a law illustration, the concept is so bad"): no clip-art metaphors. It is retired from layouts.mjs.
- `lineup` approved with the frosted glass bar, but the user asked to delete the faint watermark ("this rectangle shape") and didn't like the plus shape. Both are gone from the code.
- The user likes logos on frosted glass tiles "with any other bg". `versus/frost` puts them on the approved mesh (round 3: the light mesh was picked).
- The user preferred the earlier HIPAA badge ("Most small practices $150–$750") over the Fact-QA fix ("Dedicated HIPAA platforms"), and it was restored at their request. Fact QA's note: $750 sits $1 above $749, and the two figures come from different scopes.
- Receipt: "heading placement feels off" with a centred headline. The new options are `"place": "top" | "bottom"` (round 3: bottom was picked).
- NetSuite vs SAP B1 (-guide-2): asked for type on black, then "different layout". `versus/bento` was picked for its concept ("design is okay"). From 4 finishes, light won ("looks better in light") once the "+" grid was removed ("overwhelming here"). It replaced the approved type image. `versus/chat` was shown and not picked.
- Batch 4, round 3: picked the receipt with `"place": "bottom"` (headline baseline on the total line) and `versus/frost` on the light mesh (the blue mesh was disapproved). All 10 are final.
- Stat: a spec with an empty card heading no longer leaves a gap above the first row (the heading is only drawn when set); found by the Self-Critique on the RCM re-render.
- Headlines (Oct 2026): after "the heading color should be black" on ranked (the fourth such note), every headline went black, covering ranked, timeline and prompt too (first via the brands' `headline` colour; now hard-coded `#0A0A0B` in render.mjs, and a brand file's `headline` is ignored). Lesson: when the same correction comes twice, apply it to the whole family.
- Connect (Oct 2026): "decrease the font size so the heading comes in one line, 2 lines look visually off": the headline now always sits on one line, centred above the divider; only a pair too long to read on one line (under 72px) breaks onto two, also centred.

## 12. Keeping Everything Current (Oct 2026)

- The user asked that nothing ever be stale and that every piece of feedback be learned, so it never has to be repeated. The learning loop is now a required section of SKILL.md ("Keep Learning").
- Tests built: `scripts/test-examples.mjs` renders every example (regression) and, with `--refresh`, rebuilds every approved reference image from `references/approved/sources.json`. All checks and the feedback behind each are in `references/checks.md`; every inspiration is in `references/inspiration.md`.
- The first full refresh caught a regression: swap's two text labels had drifted to different sizes. They now share one size.
- When the user asks for an image, give the newest finalized version (check `finalizedAt` across archives); a first-batch version was called "stale".
- The refresh itself had a bug: all renders shared one history and ledger, so a card layout without a pinned `bg` got a different field depending on render order. Each example now renders in isolation; two refreshes in a row match exactly. If an approved look depends on a field, the renderer's default for that layout must produce it, or the example pins `bg`.

## 13. Template Usage and the Approved Review (Oct 2026)

- **History of the usage rule:** batches 1-2 rotated layouts site-wide ("I don't want you to repeat any illustration, only repeat if it makes actual sense": a repeat only after all 30 were used, or with a written reason); in batch 3 the user judged variety across every image seen; in batch 4 a written reason still didn't make a repeat welcome. The per-category rule below replaced all of it, and was itself superseded on Oct 28 2026 by the no-reuse rule (the last section).

- **Four templates deleted** (the approved review, note "Delete"): the checklist on a light field (g5/sky), `versus/type` on blue, `versus/tiles` on black, `swap` on black. Their reference images (01-checklist, 19-gumloop-type-blue, 21-gumloop-tiles-black, 26-gumloop-swap-black) and example specs were archived; `references/approved/` then had 29 images (40 after batch 5's final round, sections 18–20; 46 after batch 6, section 21; 61 after batch 7, section 23; 77 after batch 8, section 25).
- **What changed in the renderer:** the checklist is blue only. The renderer sets `"bg": "blue"` itself and refuses any other `bg` ("CHECKLIST FIELD FAILED"). It still counts as vibrant (1 in 3 per category, never neighbours), so if a neighbour is vibrant, pick another layout. Field fit: type light; tiles blue, light; swap light.
- **Versus frost:** "the icons are too big and this is why visual balance off, improve". The marks went from 60% to 48% of each glass tile. 44% and 48% were rendered side by side and 48% was picked by taste: at 44% the marks looked lost in the tile.
- **The usage rule changed** (history: superseded on Oct 28 2026 by the no-reuse rule, the last section). The user: "the ones that hasnt used yet can be used now if suitable for any article and the ones that have used cant be used again unless the category is different." A layout not used yet anywhere is free for any article it suits and goes first in line; a used layout can't be used again in the same category, only in a different one. This replaces the site-wide rotation and the repeat with a reason (both gone from the code; only the user's own pick, `--user-pick` or `plan.mjs` `slug=layout!`, skips the rule; `--force` is never used). Restated on Oct 15: "the ones that are used shouldn't be used again unless the category is different. The ones that aren't used can easily be used again because they aren't used right now, obviously".
- **Site-wide caps on top** (history: removed on Oct 28 2026 with the per-category rule; no reuse covers them): pills at most 2 images in total (the user: "max 2 times"), slash, connect and duo 5, dark 3, logotype 2. Every other layout had no site-wide cap.
- **Template Usage page** (https://claude.ai/artifact/8wxx5rif2nNTk81bzgaQ6q): one card per layout, "Used" with its categories, or "Not used yet". It is the user's own record. The orchestrator reads its database with ArtifactData (collection `usage`, docs `{code, status, cats}`), writes `references/used-layouts.json` and pushes. `scripts/usage.mjs` combines that file with the site history for render.mjs and plan.mjs.
- **The record overrides the history**, because the user knows what is live on the site. For every layout it lists, the record is the truth as of its `recordedAt` (or a layout's own `asOf`, which overrides it for that layout): a history image for a layout marked "Not used yet" never went live and doesn't count. Every image rendered (drafts too), reserved or delivered after that cutoff that isn't superseded is added on top; a layout the record doesn't list falls back to the history. What is used right now is in `references/used-layouts.json` itself, never copied here.
- `plan.mjs --brand <b> --category <c>` printed three lists then: "Not used yet (first in line)", "Used only in other categories", "Not again in <category>" (history; since Oct 28 2026 it prints the layouts not used yet and how many are used).
- The site-wide QA sheet still matters: the user sees every image together.
- **Testing gotcha:** `render.mjs --check-only` stops after the logo checks. The retired-layout, category, `field`, `bg`-on-canvas and heading checks run before it; it can't test usage (variety), vibrant, background fit, the checklist field, content or text checks. Test those with a real render against a copied history (`FEATURED_HISTORY_DIR` pointing at a scratch copy, `FEATURED_USED_FILE` at a scratch record), never the real ones.

## 14. Clean-up (Oct 15)

- The user: "no stale data", "delete unnecessary stale data" (taste 16). Four independent auditors checked every file of the skill against the code.
- Dead code for the retired layouts (brandline, folder, versus/scale, versus/chat, versus/split, versus/duet, versus/rows, versus/logos) was removed from render.mjs (~90 lines); they are refused before any other check ("RETIRED LAYOUT").
- Usage bugs fixed: category spellings are normalised everywhere; a layout marked used with no category still counts as used; the user's record is brand-scoped (`"brand": "medsoftwarehub"`); parallel plans and renders share the history under a lock; `plan.mjs --release` drops unrendered reservations; a `slug=layout!` reservation is honoured by the renderer.
- Options that did nothing were removed (type `glow`, bento `finish`, chat `question`/`typing`, pills `color`, lineup `glass` and `watermark`, `brandfetchClientId` in brand files, stat's `"navy"` alias for `valueColor`); `bg` on a layout that paints its own canvas (`prompt` included: it paints its full field, so `bg` did nothing; its calmer field is `"field": "soft"`), `field` outside the Gumloop layouts, `versus/frost` and `versus/bento` (prompt takes only `"soft"`) and a spec without `category` are refused.
- `test-examples.mjs` now runs every real check (no `--force`) with an empty usage record. Dead keys were removed from the examples (no approved image changed), the Gumloop examples got real categories and slugs, and three stale examples (a duplicate timeline with old facts, a duplicate stat, a duplicate prompt with no slug) were archived to `~/.blog-featured-images/_archive/retired-examples-2026-10-15/`.
- Stale files were archived, never deleted: script backups, history backups, the old prototype, old review rounds and stale files in `~/.agents/skills/blog-featured-images`.
- A second audit lined the rules up with the code and the approved images: the craft kit no longer drops the focus headline to 500 (it stays 600, taste 3); the pattern rule now matches approved images 18, 20, 22, 25 and 27 (sparse, faint full-canvas grids and dots on the light Gumloop fields and the tiles blue field; edge-only on shortlist, lineup and dark fields; none on bento); refusal messages only offer what the layout can take; two unused logo files went to `~/.blog-featured-images/_archive/unused-assets-2026-10-15/`.

## 15. Publishing

- Push approved work only, never work in progress.
- Never leave backups in `scripts/`: batch 5's session left 9 `.bak-pre-*` copies of `render.mjs` and `layouts.mjs` there, archived to `~/.blog-featured-images/_archive/script-backups-2026-10-19/`. Back up into the archive, or rely on git.
- Never commit backups (`*.bak-*`), `node_modules` or secrets. The Brandfetch client ID lives only in `~/.blog-featured-images/config.json` (or `BRANDFETCH_CLIENT_ID`); `git grep` for it before every push.
- Commit as wardiva: `git -c user.name=wardiva -c user.email=wardiva@users.noreply.github.com commit ...`. Never force-push.
- An independent audit of every changed file before every push.
- Run `node scripts/test-examples.mjs` before every push: it renders every example and then runs `scripts/test-refusals.mjs` (the user's decisions as refusal cases). Both must pass; a failing refusal means a rule the user decided is no longer enforced.
- Mirror the skill into the repo (`publish/blog-skills/skills/blog-featured-images`) and into `~/.agents/skills/blog-featured-images` (a separate npx install: keep its `scripts/node_modules`).
- Archive, never delete, user data.

## 16. Batch 5 (Oct 19 2026): 12 articles, 5 categories, first round

- Renderer changes from QA (still in the code, except `grid`'s, deleted with the layout in section 20):
  - Per-card `"scale"` on `lineup` (0.5–0.8, default 0.7) and on `hub` logo tiles (0.5–0.8), later on `grid` (retired) and `versus/center` (default 0.66), so a wide, thin mark (NextGen's wave, Phreesia's or Klara's wordmark) carries equal weight. Judge the weight by eye, not by fill percentage alone.
  - `prompt` rows with `"logo"` show the brand's real mark in their white 80px tile (no more file icons beside product names). A chip may be `{"label","logo"}`, or logo-only `{"logo"}` (the wordmark, 40px tall). Chips go logo-only: never the logo beside the same name.
  - `versus/connect`'s one-line headline is capped at 1080px wide (1200 ran past x 210–1390); a pair under 72px on one line goes to two lines within 900px. The user kept the smaller headline on the review page (Oct 20).
- Fact rules from QA:
  - A parent's mark may stand in for a product only when the article says the product is now sold as the parent's (Change Healthcare → Optum), or the parent's name is in the product name on the image (AAPC Codify, Oracle Health). Klara ≠ ModMed: use Klara's own mark.
  - A figure lifted from a "Starting Price" column needs "From".
  - A list heading keeps the title's angle ("Best Small Practice EMR", not "5 Best EMR").
  - One dash style per image (en dash).
- Logos: a mark that is just a plain shape (Phreesia's orange disc) isn't recognisable on a logos-only layout: use the brand's wordmark lockup. Crop app avatars with even padding that matches the partner tile.
- A slash name may break onto two lines at its colour split when the one-line auto-fit falls well below the approved size: the spec writes the break (`"eClinical\n{{Works}}"`, 40px → 63px). Visual QA ruled this is not "made bigger".

## 17. Batch 5, new versions (Oct 19 2026): the props batch (history: all rejected and retired)

- The user: "you created most of the designs that were already being used. So I want you to create a new version of them." The record's "free" is not enough: images the user has seen count as used. Every image got a brand-new layout (taste 14, fresh over reuse).
- The 12 new layouts were real objects or devices: versus/compare (a product-compare page), versus/search (a search field + results), versus/polaroid (instant photos), versus/notes (taped sticky notes), versus/phones (phone splash screens), versus/browser (a split-view browser), notify (notification cards on the glow field), wallet (stacked wallet cards), stickers (logo stickers on a laptop lid), letterboard (a felt letter board), tags (price tags on a string), keycaps (a two-row keyboard). **All 12 rejected:** "not a single image that you have created matches our design language… why are you using mobile mockups". All are in `RETIRED` and their code is gone. Lesson: never a prop, a device or a material (taste 17).
- QA lessons that still hold:
  - A new layout must not share a skeleton with an existing one at 350×250 (keycaps first read as lineup, notify as wallet).
  - One tint recipe for brand-coloured surfaces.
  - In a row of parallel objects, an extra line goes below the shared line, which never moves.
  - The blue "vs" disc shouldn't appear on every versus layout.
- The batch-5 direction check (Oct 19 2026): five variations built only from approved parts (badge, checklist, focus, window). Four approved (`versus/badges`, `versus/checks`, `spotlight`, `picks`); `versus/window` disapproved and retired.

## 18. Batch 5, rounds b8 and b9 (Oct 19 2026): new arrangements of approved parts

- After the direction check, the 4 approved layouts were rolled out to all 12 articles (3 images each). The user stopped it: "I want like the designs that I have approved. Those are fine. Now I want more designs for the rest of the URLs." Rule: **a design approved in a direction check is approved for the article it was shown on.** The other articles each get their own new design. Never fill a batch by repeating newly approved layouts; Visual QA B also warned that three badges side by side read as one template.
- Round b8: eight new layouts, each a new arrangement of an approved template: `versus/plans` (pricing cards), `versus/range` (one price track), `versus/center` (hub tiles into a blue word tile), `versus/rings` (score rings on a white card), `cloud` (logo pills), `ranges` (vertical price columns), `count` (big number plus a logo card), `grid` (logo tiles, the first one blue).
- Round b9 (2 options for each image the user commented on): range "i like the design but it is confusing", so `versus/lanes` replaced it; rings disapproved, so `versus/scores` replaced it; `versus/share` disapproved; `versus/sheet` and `versus/columns` were options never approved. `versus/plans` approved with "design can be improved"; its alternative options (`size lg`, `band`) were disapproved.
- **Verdict after b9 (history):** 12 layouts approved (`versus/badges`, `versus/checks`, `versus/plans`, `versus/lanes`, `versus/scores`, `versus/center`, `spotlight`, `picks`, `cloud`, `count`, `ranges`, `grid`), making 25 modes / 42 layouts then. Retired: `versus/range`, `versus/rings`, `versus/share`, `versus/sheet`, `versus/columns`, plus `versus/window` and the 12 props (26 retired then). The final round (section 20) retired `versus/plans` and `grid` too: 24 modes / 40 layouts and 30 retired after batch 5 (batch 6: section 21).
- QA lessons that became rules:
  - A layout "built from" an approved template must change its skeleton, not only its styling. Horizontal range rows were the `ranked` skeleton again in a category that already had ranked.
  - Siblings from one approved part (checks and picks are both checklist cards) never share a category.
  - Light grey chart tracks need a white card behind them. One exception since the final round (section 20): `ranges` with `"bare": true` on the user's white field (no card, tracks a step darker, `#E1E5EC`).
  - Callout lines touch what they name: a dot, or a bracket spanning a range.
  - A hub-style blue tile carries the article's own word, never a stock icon (a stethoscope for "dermatology" is clip-art).
  - An open "From" price fades out with no solid end, because every bar end reads as a figure.
  - Fit lists can be per layout (`BG_FIT['versus/checks']`); the cool checklist card never goes on cream.
  - Badges was proposed twice by Visual QA as a replacement and declined: it belongs to TheraNest, the article it was approved on. An option offered after a disapproval changes the composition, not only the chart inside it (rings → columns kept the same title, card and label row). A split card with "vs" on the seam is the `versus/table` skeleton. A "vs" disc between two cards needs about 20px clear on each side. When the article gives two measures (hospitals vs beds), the title names which one its figures use.
- Gotcha: `String.replace(a, b)` treats `$'` and `$&` in `b` as patterns. Apply scripts that insert renderer code must use `replace(a, () => b)` or `split/join`.

## 19. Batch 5, backgrounds (Oct 19 2026): the user picks

- The user: "we have so many background why are you fixated on just one. show me 12 images and options for backgrounds and i'll selevt the bg for each". The renderer kept choosing from each layout's 2-field fit list, so nearly everything landed on sky or g5. Rule: **the user picks each image's background.** Render every image on every field it can take (sky, paper, cream, g5, soft, white, glow, mesh; the vibrant blue only where every word sits inside a white card) and show a per-image picker page.
- The picks: TheraNest glow, AAPC blue, RXNT soft, Office Ally mesh, Oracle glow, ModMed cream, appointment reminders glow, hospital information systems mesh, claims management glow, dermatology PM paper, small-practice EMR white, pediatric EHR soft. Seven fields across 12 images: the user wants variety in backgrounds across a batch, too.
- The pick goes in the spec as `"bg": "<field>", "bgPick": true`. It skips the fit list, the blue fit and the canvas refusal, never the vibrant check. The new fields `soft`, `white`, `glow` and `mesh` are in `BG_CSS` and come only from a pick.
- Tightened in the integration: a canvas layout takes a pick only where its canvas can step aside (`versus/badges`, `versus/type`, `versus/tiles`, `versus/bento`, `swap`, `badge`, `shortlist`), light fields only and blue only on `versus/tiles`; every other canvas layout refuses it ("BACKGROUND PICK FAILED"), as does `bgPick` without a `bg`. The history records the picked field (with `bgPick: true`), not "canvas", so the next image's neighbour check sees it.
- The picker is now a tool, `scripts/bgpick.mjs` (render, page, apply; each option renders on a temporary copy of the history, so the real one is never written). A picked blue is limited to layouts whose text all sits in a white card (`BLUE_PICK`; `logotype` and the open layouts are refused), and the `versus/center` side `scale` is clamped to 0.45–0.8 like the others.
- Integration: the 12 approved images became examples and approved images 36–47 (`references/approved/sources.json`); the code for every retired layout and for plans' `size lg` and `band` was deleted. (Final round, section 20: 38 and 47 were archived with `versus/plans` and `grid`, and 48 was added.)
- Batch 5 review notes (Oct 19 2026):
  - Loved: `spotlight` ("perfect concept and design").
  - "Its fine": `count`, `cloud`, `versus/center`, `versus/lanes`, `picks`.
  - Rules from the notes:
    - Checkboxes on a two-row comparison card are noise ("checkboxes are not needed"). A checked row is for lists, not pairs.
    - On `versus/badges`, the names must support the figures ("too bold and big, visual hierarchy is not good and balanced"). Names stay around 40–48px at 500–600, and the tinted figures lead.
    - A heading never sits as a tile among logo tiles ("7 best pediatric shouldnt be like other logos, this looks off"). Both headline-above-the-grid fixes were then disapproved and `grid` was retired (section 20).
    - The user picked a background for every image. The white frame on `ranges` was then sent back ("bf color needs to be changed").
    - Pricing cards (`versus/plans`) were rejected for RXNT after two improvement rounds ("i dont like the design, try smth else for comparison"), and the layout was retired (section 20).
  - On "is the concept right?" (Oracle KLAS scores): check that the image's figure is the article's own lead metric and the only one given for both products, then answer with the article's words before changing anything.
- Batch 5 options round (Oct 20 2026):
  - Picks: RXNT took the prompt panel (2 rows scaled up), AAPC the card without checkboxes and with bigger logos, TheraNest the lighter names and bigger prices.
  - Pediatric: the user disapproved both headline grids and chose approved `lineup` ("use this glass version template"). Lineup now takes up to 7 logos in one row.
  - EMR: "use the previous bg, and in that dont add container for bars section". `ranges` now takes `"bare": true` (no card, slightly darker tracks).
  - The user asked for the very first `versus/connect` render of Oracle vs MEDITECH as a file. Keep `_previous/` renders, because the user may come back for an earlier version.
- Oracle vs MEDITECH, 2026 data (Oct 20 2026): the user asked for 2026 scores. The article has a number only for MEDITECH (77.1), and Oracle is just "Lowest ranked". That version (one number against a word block) got "ew revert it", so the 2025 pair (64.7 vs 76.3) stays. Rule: in a paired-figure layout, show two real numbers or change the metric. A number against words looks broken even when it's true. When the requested year has no figure for both sides, say so and offer to keep the paired year before rendering.

## 20. Batch 5, final round (Oct 20 2026): verdicts, retirements and the integration

- **Verdicts and the options chosen:**
  - RXNT vs DrFirst: `versus/plans` got "i dont like the design, try smth else for comparison"; `versus/fit` was disapproved; `versus/spot` was rejected by QA as Appointment's `spotlight` under a new name. Delivered as `prompt` with two big logo rows (image 48, `48-prompt-logos`): a panel of 2 rows or fewer grows on its own (104px tiles, 70px logo, 40px titles), and `"panel": { "even": true }` keeps both rows at full strength (no fade), because the two products are equals.
  - TheraNest vs Valant (`versus/badges`): "the heading of theranest and valant are too bold and big, visual hierrachy is not good and balanced". New spec options `nameSize`, `nameWeight`, `nameInk`, `valueSize`, `spread`; the approved set is 44 / 600 / 84 / `spread: true`. The audit after this round made the approved set the renderer default (the old 72 / 700 / 72 look was the rejected one); the options only override it. Taste 1 (hierarchy).
  - AAPC Codify vs Find-A-Code (`versus/checks`): "checkboxes are not needed". `"checks": false` drops the check boxes; `"big": true` (with it) grows the logo tiles to 104px, the mark to 72px, the names to 36px. The audit made both the renderer default; only an explicit `"checks": true` brings the boxes back. Taste 10.
  - Small Practice EMR (`ranges`): "bf color needs to be changed"; every new background was disapproved; then "use the previous bg, and in that dont add container for bars section". `"bare": true` drops the white card and darkens the tracks to `#E1E5EC`, and the renderer allows it only with `"bg": "white", "bgPick": true` ("BACKGROUND CHECK FAILED" otherwise). The old rule "light grey tracks need a white card" now has this one exception, on the white field only.
  - Pediatric EHR: `grid` got "7 best pediatric shouldnt be like other logos, this looks off"; both fixes (the heading moved out of the tiles) were disapproved; "for this use this glass version template" → re-delivered as approved `lineup`, which now takes 3–7 products. Taste 2 (a label tile is not a logo).
  - Oracle Health vs MEDITECH: stays `versus/scores` with the 2025 pair. The 2026 version had a number only for MEDITECH and "Lowest ranked" for Oracle: "ew revert it". `versus/scores` now refuses a non-numeric score ("CONTENT CHECK FAILED": a real number on both sides). The user: "show me reverted one and add that to not used cus i love the design". On the design: "i love the design but is the concept right?" (taste 19).
  - `versus/connect` (the Oracle connect preview): "delete these dot grid from top left and top right" → `"cornerDots": false`.
  - Spotlight: "perfect concept and design" (taste 20). Oracle scores: "i love the design but is the concept right?". The others: "its fine".
- **Retired in this round (30 in all then):** `versus/plans` ("i dont like the design, try smth else for comparison"), `versus/fit` (disapproved), `versus/spot` (QA: Appointment's spotlight under a new name), `grid` ("7 best pediatric shouldnt be like other logos, this looks off"; both fixes disapproved). Live then: 24 modes / 40 layouts (28 / 46 and 42 retired after batch 6: section 21; 36 / 60 and 134 retired after batch 7: section 23; 45 / 76 and 156 retired after batch 8: section 25).
- **Usage:** `versus/scores` was marked unused in `references/used-layouts.json` with its own `"asOf"` (`2026-10-19T19:23:25.151Z`, after the delivered Oracle image's render at 18:08:12Z, so the record covers it) and a `"why"` (both dropped by the Oct 20 full save; it is still unused). In `scripts/usage.mjs` a per-layout `asOf` overrides `recordedAt` as that layout's cutoff, so the delivered Oracle image no longer counts and the layout is free in every category; renders after the cutoff still count.
- **Usage sync (audit, Oct 20):** the user changes the Template Usage page without saying "done with usage". On Oct 19 at 20:09 they marked `versus/frost` used in clinical-software on the page, and it reached `references/used-layouts.json` only when the audit synced it. Rule: before planning any batch, read the page's `usage` collection (ArtifactData) and sync every doc whose `updatedAt` is later than the record (`recordedAt`, or that layout's `asOf`) into the record as that layout's entry with `"asOf": <updatedAt>`. When the user pressed Save all & finish (`usage-meta/done.at` later than `recordedAt`), the whole record is rewritten with `recordedAt = done.at` and no per-layout `asOf` (SKILL.md, Workflow step 2).
- **Integration:** approved references 36 (badges), 37 (checks) and 46 (ranges) were re-rendered from their updated example specs with the new options; 48 (`48-prompt-logos`, `examples/rxnt-vs-drfirst.prompt.json`) was added; 38 (`versus/plans`) and 47 (`grid`) and their example specs were archived to `~/.blog-featured-images/_archive/batch5-final-2026-10-20/`. 40 approved references and 48 examples then (46 and 54 after batch 6; 61 and 69 after batch 7; 77 and 85 after batch 8). The code for `versus/spot`, `versus/fit`, `grid`, `versus/plans` and the word-score path of `versus/scores` was deleted from `render.mjs`.
- **Lessons:** names never outweigh the key figure; every element earns its place (check boxes, a container, corner dots); a heading never dresses as one more tile; paired figures are two real numbers; check the concept against the article before rendering; repeat what was praised. All are in `taste.md` (principles 1, 2, 4, 10, 18, 19, 20) and its Self-Critique.
- **Review (Oct 20):** the user pressed Keep on both open changes: the connect headline capped at 1080px (a touch smaller, inside the margins) and the frost marks at 48%. Both are settled; the review page's round was cleared. The old remote branch `batch-4-taste` (Oct 14, content already in main) was deleted at the user's request.

## 21. Batch 6 (Oct 20 2026): 11 articles, seven review rounds, six new layouts

The user: "now generate images for following urls… dont repeat the template that is already being used". 11 articles in three categories: clinical-software 7, practice-management-software 2, medical-billing 2. Every verdict came from the review page (Approve / Disapprove + a note, read with ArtifactData), then a background picker, then "finalize all 11".

### First pass: 5 of 11 approved
- **Approved:** three templates never used anywhere, `versus/tiles` (DrChrono vs athenahealth: "use the blue gradient bg"), `versus/type` (NextGen vs AdvancedMD) and `swap` (AI clinical decision support); and two of the eight brand-new layouts, `figures` (E-Prescribing Software Cost: two price ranges as big blue type, the `versus/scores` type in columns) and `costgrid` (Medical Billing Software Cost: one tall blue anchor card beside two white cards). Both new ones were approved with no note.
- **Disapproved, with the user's words** (all six retired):
  - `steps` (EHR interoperability cost): "it looks like this is designed by a begineer not by a pro experienced designer"
  - `numbered` (7 Best Telehealth Software for Therapists): "numbers looks so weird and visually cluttered and unbalanced and corner radius of logo bg is not consistent and it should be just zoom not zoom for healthcare i think for logos bg glass bg would look better"
  - `versus/pill` (Doxy.me vs Zoom): "doesnt look like comparison image"
  - `versus/chips` (Tebra vs Zocdoc) and `versus/offset` (symplr vs Modio Health): "painfully bad visual design"
  - `versus/halves` (Waystar vs R1 RCM): "i dont like this it looks off and doesnt match our design vibe"
- **Rules learned** (taste 2, 8, 21, 23):
  - **First pass only (superseded in the options round below):** the approved templates passed and the weak inventions failed. A new layout is an approved part in a new arrangement, never an untested invention; approved templates are not a substitute when the user asks for new designs (taste 14).
  - **A comparison must read as a comparison at a glance:** two equal sides with a clear "vs". A bar holding both, or stacked chips, does not.
  - **One radius and one tile treatment for every logo in a row.** A solid app icon either is the tile (`"fill": true`, edge to edge) or gives way to the brand's bare mark on white. Never nested squares.
  - **Names as the user says them** ("Zoom", not "Zoom for Healthcare"); Fact QA confirms.
- Renderer changes in this pass: `"fill": true` on a logo item makes a solid app icon the tile itself, edge to edge (today on `lineup`, `versus/center`, `versus/fan` and `versus/stacked`; on `frostrow` it sits at 48% inside its glass tile with the same 22% radius); the `"icon:<domain>"` logo (Brandfetch's square icon, edge to edge); O8_CSS makes a `.lg.full` icon fill its tile; width estimates for Inter 600–700 use 0.62 per character.
- Brandfetch serves an HTML page to non-browser fetches. Don't fetch its images outside the renderer; let the logo chain load them in Chrome.

### The options round: 3 of 12 approved
- Two options per disapproved image, ten of them approved templates not yet used in their category. Approved: `versus/badges` (Doxy.me vs Zoom), the new `frostrow` (telehealth: frosted logo tiles in a row, the user's own "for logos bg glass bg would look better"; Zoom named Zoom), and `versus/duo` (Waystar vs R1 RCM). The rest were disapproved with no notes.
- The user: "the images that I have disapproved has already been used multiple times, so I wanted to create new ones. But keep in mind what you have learned, what tools you have built. If you need to rerun the skill, then do it so you know what changes have been done to the skill."
- Rule: **"not used in this category" is not "new" to this user** (taste 14). A template seen many times on the site reads as a repeat. When the user asks for new designs, every option is a new layout built from parts the user approved, in this batch first (big blue figures from `figures`, frosted glass from `frostrow`, the blue anchor from `costgrid`). Approved templates are a fallback only when the user asks for one.

### Round 3: new skeletons, all rejected
- Options: `link` (EHR: "Your EHR" and another system card joined by a blue connector with the price pill; a branched version to Lab and E-prescribing), `versus/annotate` (Tebra, symplr: each name in the blue selection box, its price on a label under it) and `versus/corners` (the two prices large in opposite corners, a "vs" disc between). QA cut `poster` (one giant blue figure: a badge without its box), `versus/glasscards` (frosted cards with figures: the retired plans' columns in glass) and `versus/figures` (a restyle of the scores type) before the user saw them.
- QA lessons that still hold:
  - **The skeleton is where the blocks sit:** side-by-side columns, stacked rows, a diagonal stagger, one inline headline, or a split canvas. Cards, boxes, glass or finish never make a layout new. `versus/glasscards` (columns, like the retired plans) and `versus/corners` (offset without its cards) failed for this reason. Check the placement against used and rejected layouts before building.
  - **Connectors are one stroked SVG path** with round caps, round joins, radiused elbows and one solid blue; assembled `<i>` bars left square corners and an overshoot.
  - **A price on a shared trunk covers every branch:** the caption comes from the sentence that prices that many connections ("for 1–3 connections", not "per basic connection").
  - **A selection box in a headline needs at least 30px** between its handles and the next word. Units under a big figure use normal tracking (−0.01em), never the headline's.
- **The verdict on all of them:** "all of them looks too much and you are just using same color and it doesn't look visually balanced, it doesn't look visually appealing, it looks scattered, it looks like AI slop. map all of our previous templates that you created. That is the design language you need to follow, but you can go to browser and do your research. And you know, we have multiple colors, black background color, blue gradient, and then like so many other. And for layout, you can go to browser, you can do your research, you can try variations." `link`, `versus/annotate` and `versus/corners` were retired (taste 22, 24).

### Round 4: map, research, variations
- **Map the approved set first:** one contact sheet of the 40 approved images and the 34 live ones. The approved images use strong fields (deep blue, black with a blue glow, cream, the white panel) and **one tight centred group**. Round 3 was all pale sky, with pieces spread to the canvas edges.
- **Research:** Raycast puts one oversized UI element on black with one glow; Linear puts one small card centred on near-black; Clerk sets one real UI component beside its headline. Each image is one object on a strong field. Dribbble's comparison covers were low quality and gave nothing (`inspiration.md`).
- **Prototype in a sandbox** (plain HTML at 1600×900, screenshotted with headless Chrome): 16 variations on black, the deep blue, cream and white; QA cut seven, and only the user's pick is ported into render.mjs.
- **QA's cuts:** cream and white panels lose to black and blue for these; a lone "?" outside the group reads as scattered; an empty band inside a white card reads as unfinished; generic system icons need a label; nothing on a dark field gets a drop shadow; keep a centred group within about 940–1000px, not edge to edge.
- **Verdict:** of nine options, only **tebra-fan-blue** was approved: two white price cards tilted ±4° on the deep blue, meeting at the "vs" disc, modelled on the tilted card on blue (07). Every annotate, every black version and the EHR connector ideas were disapproved with no notes; `versus/annotate` was disapproved on black and on blue.

### Rounds 5 and 6: build from the approved one
- When the user approves one design and rejects the rest, build the other open articles from that design's parts: EHR got three tier cards fanned, symplr the fan's cards stacked (the same parts in the other direction).
- **Round 5:** symplr's stack on the light mesh: "love it. The concept, visual , everything looks so appealing and perfect" (`versus/stacked`, taste 20). Tebra's fan, now rendered by the skill: "this is fine" (`versus/fan`). The EHR tier deck was disapproved on the blue and on the mesh ("thats too bad visually"), and the symplr stack on the blue.
- **Round 6:** the symplr stack as rendered by the skill was approved (it matches the prototype); the EHR tier rows (one blue tier, two muted, on the mesh or sky) were disapproved.
- Rules:
  - **One price leads in one product's tier set** (the EHR tier deck): exactly one tier's figure is in the blue gradient and the rest are black. Two products are a pair: both figures share the blue gradient at one size (taste 2, 23).
  - **Category before style.** A tilted card with a rule and rows is the checklist (07); QA cut those options. Check that a layout is free in the category before borrowing its look.
  - On the blue, every box-shadow and drop-shadow is stripped (checks.md), so a white logo tile on a white card vanishes: `versus/fan`'s `.o14t` tile keeps a hairline border (O8_CSS would otherwise clear a tile whose logo loads as a full icon).
  - `versus/stacked` keeps the prototype's shadows exactly, as drop-shadow filters (softShadow would flatten them to the light-field minimum).

### Round 7: "minimal… try black"
- The user, after six EHR rounds: "Okay, so you already have all the templates designed. I just want you to make it more visually appealing. So like the one you created, it's 3 cards, they are like too much. There should be some minimal way for this. Also try using black background maybe, because we haven't used it for like so long."
  - For a cost article that keeps failing, start from an approved template and show one fact in one container: the glass bar on black (24) or the scores type rows (40).
  - Black hadn't been used for a while, so it was the field to offer (taste 24).
- **QA on black:** muted text is reduced-opacity white, never grey hex (it turns muddy over a coloured glow); headlines on black are Inter 500; "minimal" means one figure, since three dimmed tiers still read as three things.
- **Approved:** the glass bar on black, now `glassbar` (headline, label, value, caption). It paints its own canvas and counts as vibrant. The scores rows on black and the big type alone were disapproved.

### Backgrounds, finalize, delivery
- The picker page: Doxy.me glow, DrChrono blue, medical billing glow, AI CDS glow, NextGen white, symplr glow, Tebra glow; e-prescribing cost white (the user's answer in chat). `frostrow` paints its own mesh and `glassbar` and `versus/duo` their own black, so they had no choice. Tebra moved off the deep blue and symplr off the mesh: both were delivered on the glow, so `versus/fan` and `versus/stacked` default to it (BG_FIT).
- Waystar's black duo was blocked by the vibrant rule (AAPC Codify on the blue and the cost grid before it in medical-billing). The user kept the duo, and the rule was overridden for that one image only.
- The finals were rendered in an order that kept the two bold clinical images apart (EHR black, DrChrono blue). Then "finalize all 11": all are final in the history and copied to `~/.blog-featured-images/delivered/medsoftwarehub/`. Delivered: `glassbar` (black), `figures` (white), `versus/type` (white), `versus/tiles` (blue), `swap` (glow), `frostrow` (its own mesh), `versus/badges` (glow), `costgrid` (glow), `versus/duo` (black), `versus/fan` (glow), `versus/stacked` (glow).

### The six new layouts and the twelve retired
- **Live (28 modes / 46 layouts after batch 6):** `figures`, `costgrid`, `frostrow`, `glassbar`, `versus/fan`, `versus/stacked`. Their specs and rules are in `spec-format.md` (Batch-6 layouts) and `design-language.md` 3e.
- **Retired (42 in all after batch 6):** `steps`, `numbered`, `versus/pill`, `versus/chips`, `versus/offset`, `versus/halves` (first pass); `link`, `versus/annotate`, `versus/corners` (round 3, "looks like AI slop"); `poster`, `versus/glasscards`, `versus/figures` (QA-cut, never shown). Not the `figures` mode, which is live.

### Integration (Oct 20 2026)
- The six delivered specs became examples and approved references 49–54 (`49-glassbar`, `50-figures`, `51-frostrow`, `52-costgrid`, `53-versus-fan`, `54-versus-stacked` in `references/approved/sources.json`): 54 examples and 46 approved references after batch 6.
- The code of all twelve retired layouts was deleted from `render.mjs`; `layouts.mjs` `RETIRED` names each with the user's words.
- **`scripts/test-refusals.mjs`**, new: the user's decisions as 73 refusal cases then (81 steps; 151 cases after the batch-6 audits, checks.md has the current count), each a spec built from an example with one change, run on its own temp history, record and output folder: every retired layout (render and plan), the deleted fields and backgrounds, the content minimums (the batch-6 layouts included), the heading and word checks, and the usage rule (a used layout in its category, the same layout in another, a user pick re-rendered, a re-planned slug, a per-layout `asOf`). A mutation check proved it bites: with the old `loadHistory` merge put back, "re-planned slug does not inherit userPick" fails (a slug re-planned without `!` kept its old render's `userPick`), which is the bug fixed in `usage.mjs`. `test-examples.mjs` now runs it after the examples (`--examples-only` skips it).
- **BG_FIT leads with the picked field** for the batch-6 card layouts: `figures` white, `costgrid` glow, `versus/fan` glow, `versus/stacked` glow (each delivered on that pick), so a re-render without `bg` looks like the delivered image. `versus/fan` is also in BLUE_FIT and BLUE_PICK (approved on the blue in round 4).
- **`versus/type` uses the 0.62 width estimate** for its names, like the other Inter 600–700 auto-fits; the names in approved reference 18 came out about 10% smaller when it was refreshed.
- **Review and usage (Oct 20):** on the review page the user pressed Keep on all 17 batch-5 and batch-6 templates (36–54); none needed a change. On the Template Usage page they pressed Save all & finish for all 46 layouts, so `references/used-layouts.json` was fully re-synced (recordedAt 2026-10-20T01:09:54Z; per-layout `asOf` entries dropped, since the full save supersedes them). 42 used, 4 not used yet (before-after/default, versus/scores, dark, logotype).

## 22. Batch 7 (Oct 21 2026): the rounds, in order

Written as the batch ran. Rules that later turned out wrong are kept for the history and marked **Superseded**; the outcome and the rules that hold are in section 23.

### Batch 7 (Oct 21 2026): 20 articles, brand-new designs for all
- **Scope:** "create blog images that hasnt been used before". Only 4 layouts were never used anywhere (before-after, versus/scores, dark, logotype), so I asked. The user chose "brand-new designs for all".
- **Articles came as Google Docs.** The `/export?format=txt` URL reads them; the title is the doc name (`<title>`, with any "Done " prefix dropped). The categories are on the live site's category menu (medsoftwarehub.com: clinical, practice-management, medical-billing, specialty, hospital-and-lab, compliance-and-analytics).
- **Facts:** 4 agents in parallel, each writing `_review/facts-b7/<slug>.json` with verbatim sources.
- **New families** in render.mjs (b7*):
  - versus: glasssplit, medallions, profiles, routes;
  - modes: meter, arc, glassrows, track, strike, rating, breakdown, typelist, toppick;
  - also orbit and mosaic, which QA cut (orbit scattered; mosaic = the rejected pediatric grid).
- **QA's restyle flags:** glasssplit = versus/table, meter = ranked, profiles = the fan without tilt, typelist = glassrows without logos. Count families by skeleton, not by name.
- **Logos:**
  - `icon:<domain>` (Brandfetch square icon) fixed most weak marks.
  - A wordmark beside the same typed name fails Fact QA. Use the symbol cut from the brand's own logo, or `"wordmark": true` (no typed name).
  - Brandfetch serves images only in a browser. The cut was done in headless Chrome (`--disable-web-security`, fetches in parallel), then split with sharp.
  - Thin bare marks (Cardinal Health) fail at 350×250; use the filled mark.
- **Facts:**
  - "Top pick" needs the article's own verdict, not first place in the list.
  - Two ranges for one item: use the one that agrees with every sentence.
  - A spread of starting prices takes "from".
- **Gotcha:** a `//` comment added mid-line in a spec script silently disabled every entry after it on that line.
- **Batch 7, rounds 2–3:**
  - The user approved 12 of 20 across two rounds:
    - glasssplit ×3 (DoseSpot; Nextech on black after the light version was disapproved; McKesson on light);
    - strike ("Love it");
    - glassrows (mental health);
    - meter (AI scribe);
    - scores (TruBridge);
    - dark (PioneerRx, its first use);
    - shortlist (dental);
    - lineup ×3 (PT, derm, HIPAA).
  - **Superseded (Oct 21):** two lineups in specialty (PT, derm) broke the once-per-category rule of the time even though the user approved both; both were flagged after delivery ("need new templates for these") and replaced (PT → `bluegrid`, derm → `research`). Only the HIPAA lineup (compliance) stayed. Every glass split and the glass rows were replaced too, and both layouts are retired (section 23).
  - For the last 8, "used a brand new layout that haven't been used before, and follow our design language": the new families glasstiles, glowtiles, typehero and spectrum.
  - QA cut glassbars as stacked restyled (and webpt-stacked was already rejected for that very article).
  - Two frosted panels with a "vs" count as the glasssplit skeleton per category, even when they're separate tiles.

### Batch 7, round 5 (Oct 21 2026): "done stop repeating designs now , use black bg too in some"
- Round 4 offered the same new layout (big type, notepad) to several articles at once. The user approved only 2 of 7 and asked to stop repeating. In a review round, each option is its own design, used once on the page.
- A new layout name is not a new design. QA cut gauges (= retired versus/rings), a diagonal card staircase (= retired steps), a white/black canvas split (= retired versus/halves) and corner-bleed logos (= retired versus/corners). Before rendering, compare every new idea with the RETIRED list in layouts.mjs, not just its name. The renderer also refuses retired names (steps, poster).
- "Use black too": spend black where the category's vibrant budget has room (compliance, clinical). Count black and blue per category first.
  **Clarified (Oct 21):** "black" means plain black ("use full black bg") or the deep-dunes blue, never the black canvas with navy and blue glows that rounds 4–7 used (taste 28).
- Approved in round 4: Solventum big type (black, billing) and WebPT inline (light, specialty).

### Batch 7, round 6 notes (Oct 21 2026): all 8 disapproved; the user's words
- cd-footnote "too much text"; cd-slider "this layout is borint"; impl-heroglass "its too bad not visually appealing at all";
  impl-horizon "i like the shape you used but over alll its too much., not visually apealing at all"; sp-bubbles "ew";
  sp-delta "$20 looks so weird bec its so big there is no visula balance at all"; vd-burst "disgusting shapes"; vd-underline "too bad visual".
- Rules taken: cost images carry a heading, one figure and one caption (about 7–10 words). No UI controls (sliders) as the idea. No
  decorative line bursts or sized bubbles. No oversized hero numbers: a figure stays in balance with the heading. The rim-lit planet edge
  (horizon) is a liked shape; round 7 keeps it as the only visual, with the soft blue haze, and strips everything else.
  **Superseded (Oct 21):** the horizon failed every time after (horizon2, side glow, eclipse, crescent, `pt-horizonrow`) and is retired. A liked part is not a direction (taste 29).
- Six rounds with no notes cost far more than asking: after two blank rejections of the same article, ask for notes.
  **Superseded (Oct 21, 16:17):** never ask for notes. The user: "You should know why I have disapproved something. You have all the information, all the all of my past feedback. You have built a learn .md. You have the taste.md. You should know why if I'm disapproving something." Diagnose each disapproval from taste.md (the rejects table) and act.

### Batch 7 close (Oct 21 2026): the last 4 went to approved looks
- Rounds 4–7 of new designs (big type, notepad, logo bar, inline, bracket, contrast, waffle, toggle, slider, horizon, eclipse…) won only
  Solventum big type, WebPT inline and Curve price span. Round 7, rebuilt from the user's notes, was still all disapproved.
- The user chose "Pick from approved looks": each article shown in every approved design that fits, with the pick overriding the
  category rule. Picked: Claims Denial → prompt (the clearinghouse look), Vanta vs Drata → versus/center ("HIPAA Compliance"),
  SimplePractice vs TheraNest → versus/badges (as TheraNest vs Valant), EHR implementation → costgrid.
- Rule: after two rounds of rejected new designs for the same article, offer the approved-looks picker instead of a third round of
  inventions. The approved library is what the user trusts; new layouts are a bonus, not the default.
- **Superseded (Oct 21):** of the four approved-looks picks, three were later replaced (Vanta center, SimplePractice badges, EHR implementation costgrid); only Claims Denial's prompt stayed. All three were among the seven finals flagged at 16:02 ("need new templates for these"). At 16:37 the user chose "Keep trying new designs" over reusing loved looks. What worked was references: after two failed rounds of inventions, go to browser research of product blogs with our vibe (Dub, Peec, Calendly, Databricks) or the user's references, not to the approved-looks picker (taste 32).

### Batch 7 redo of seven finalized images (Oct 21 2026): "need new templates for these"
- 14 new options. Approved only mh-avatars (an overlapping stack of round logo chips under a big centred heading, names in one grey line, light glow).
- Disapproved with no notes: impl bluefield and iconrows, vd butterfly, sp tierchips and ladder, nx bands and venn, derm index, pt horizonrow and tilegrid. Visual QA had predicted most of these (repeats of rejected skeletons).
- The user then said they won't explain disapprovals: "You should know why I have disapproved something. You have… learn .md… taste.md." From now on, diagnose every disapproval from taste.md, write the table and act. The diagnoses are in taste.md's "What the user rejects" table.
- Voice notes on the review page (Web Speech API) didn't work inside the artifact; the user said "forget about it". The Speak button was removed.
- Redo round 3 (from Dub, Cal.com, Ramp): vd-duel approved, "wow love it" (two lockups, small vs, mono eyebrow, faint grid with pastel glows). Disapproved: impl-estimate (one figure in a UI card), nx-lockups (black price pills), sp-titlecard (title card with prices), derm-market (seven small app cards). Inferred: logos and type lead and figures follow, and many small cards are clutter.
  **Superseded (Oct 21):** "figures follow" was too broad. `strike`, `flatcard2`, `versus/span`, `meter` and `versus/scores` are figure-led and kept. The rule is taste 27: a figure lives inside an object, never alone on the field.
- pt-capsule (the seven marks fused into one white pill): "i dont like this rounded it looks weird". Big panels take card corners (about 40px), never full pill ends. Pills stay for small tags and chips.
- Lists from the user's references (Oct 21 2026): pt-bluegrid (Databricks: blue field, white hairline grid, each logo on a white tile in its own cell) was approved: "i like this layout and design". Calendly's fused squircles: "ew dont connect". My copies of the Calendly aurora and sky gradients: "the gradient looks awful". Never join tiles with liquid necks. Don't imitate an outside gradient; use our own fields.
- mh-squircles (separate frosted squircle tiles) approved on the faint grid field (B15), not on the glow.
- Peec round (Oct 21 2026): impl-cursorcard (a tilted card with a dashed selection and a cursor): "not tilted rectangle pls also use our bgs". Keep cards flat, and put them on our fields, not the reference's grey. derm-tree was disapproved (an org chart of small chips).
- The user then shared Peec covers with "i like these we have black bg template too so use that instead of + use vs": partner covers (two lockups in a hairline band on black), the dark research cover (a pill tag, a white heading, dark app tiles), and white UI covers (ranked rows with a "You" chip, chips running from Negative to Positive, a checklist card). Became versus/band (lockups with "vs", on our black canvas, then plain black: next bullet) and research (its black version was rejected: "for this use our glass bg").
- Then "use full black bg": the Peec-style black covers go on plain black (a soft centre lift, a vignette), not our black canvas with blue glows.
- Dermatology research on glass: "use bg lines too like ss2 in our colors and dont use dot pattern in bottom". Peec guide lines in our blue (rules above and below the pill and the heading, margin verticals clear of the tiles), and no dot pattern on the glow.
- **Oct 21 2026, dental + McKesson:**
  - Render final specs from `featured-images/` (the renderer writes `<cwd>/featured-images/<slug>` when there is no `--out`). Run from inside it and the output lands in `featured-images/featured-images/<slug>`, the history records that path, and the project folder keeps the old image. After finalize, check the delivered master, not just the exit code.
  - finalize.mjs doesn't refresh `delivered/<slug>/spec.json` on a re-finalize; copy the new spec there. Superseded (Oct 22): finalize.mjs copies `specs/<slug>.json` next to the output folder on every finalize, and a redo now goes through `render.mjs --redo`.
  - Bare marks cut from an app icon carry the icon's crop: the PioneerRx ring was cut flat by the tile edge. Cut the mark from the full logo instead (orange ring + the blue P only, by colour and column).
  - A tall image in `.lg` (inline-grid) ignores `height:100%` and overflows the square box, where `overflow:hidden` cuts it. Make the box flex with `max-width/max-height:100%` (done in glasspair).
  - Brandfetch serves images only to a browser-like request; send the renderer's user agent (`UA`).
  - Review builder: rename EVERY use of the collection (the save path `'<collection>/'+id` too), or verdicts land in the old round's collection.
  - "use exact same checkboxes size and tick icon that was in its inpirsation": I had eyeballed the tick. Measure every part of a reference control on the original file (Peec's cover from peec.ai/blog at 4096px): box 120, corners 35 (29%), tick M32 59 L48.5 76.5 L91 35 in a 120 box, stroke 9, round ends, #0081FF. Now in `checkcard`.
  - The glass pair tiles take frostrow's 22% corner radius ("make the corner radius consistenty"), not Calendly's 30%.
- **Oct 21 2026, redo of three (SimplePractice, Nextech, Solventum):**
  - Approved: Nextech vs NextGen as the duel (icons in tiles + big names, no eyebrow); Curve Dental's span on the deep-dunes blue (black and light glow were disapproved).
  - Solventum research approved with "delete 360 encompass and encodepro text": with two picks, no names under the tiles.
  - SimplePractice: the prompt price card was disapproved for the user's Peec "Powered by" cover, copied as `versus/peecpair` (near-white hairline grid, white pill, logo with name per cell). A brand with no wordmark of its own (TheraNest, now part of Ensora Health) gets its mark with the name set in its brand colour.
    **Superseded (Oct 21, 18:35):** "this is fine but use black color for logo text". The name is set in black ink; only the mark keeps its brand colour (taste 31).
  - Review collections: use a name never used before (`reviews-batch7-redo3` already held an older round's verdicts).

## 23. Batch 7 outcome (Oct 21–22 2026): 20 finals, 14 kept layouts, 92 retired

Batch 7 ran 7 option rounds, an approved-looks picker, a redo of 7 finalized images and about 12 reference rounds: about 170 verdicts, about 33 approvals. 11 of the 20 approved finals were redone after delivery; 9 kept their first delivered design. What follows is the state the integration left (Oct 22).

### The 20 finals

| # | Article (slug) | Category | Layout | Field |
|---|---|---|---|---|
| 1 | webpt-vs-jane-app-which-physical-therapy-software-wins | specialty-software | `versus/inline` | its light canvas |
| 2 | is-free-ehr-software-worth-it-for-small-practices-in-2026 | clinical-software | `strike` | glow (picked) |
| 3 | how-much-does-an-ai-medical-scribe-cost-in-2026 | clinical-software | `meter` (bare) | white (picked) |
| 4 | is-pioneerrx-worth-it-for-independent-pharmacies-in-2026 | hospital-and-lab-software | `dark` (its first use) | its black canvas |
| 5 | trubridge-vs-oracle-health-which-fits-rural-hospitals-in-2026 | hospital-and-lab-software | `versus/scores` (`"suffix": "%"`) | sky (picked) |
| 6 | 7-best-hipaa-training-software-options-for-small-practices-2026 | compliance-and-analytics-software | `lineup` | its canvas |
| 7 | tecsys-vs-cardinal-health-hospital-supply-chain-software-compared | compliance-and-analytics-software | `typehero` | its light glass |
| 8 | how-much-does-claims-denial-management-software-cost-in-2026 | medical-billing | `prompt` (the user's pick overrode the category rule) | its own field |
| 9 | vanta-vs-drata-for-hipaa-compliance-which-wins-in-2026 | compliance-and-analytics-software | `versus/duel` | faint grid with corner glows |
| 10 | 7-best-physical-therapy-software-for-multi-location-clinics | specialty-software | `bluegrid` | its blue (vibrant) |
| 11 | 7-best-mental-health-ehrs-for-group-therapy-practices-in-2026 | specialty-software | `squircles` | the faint grid (`"canvas": "grid"`) |
| 12 | dosespot-vs-rxnt-which-e-prescribing-platform-fits-in-2026 | clinical-software | `versus/band` | plain black (vibrant) |
| 13 | how-much-does-ehr-implementation-cost-in-2026 | clinical-software | `flatcard2` | glow |
| 14 | 7-best-ehr-software-options-for-dermatology-practices-in-2026 | specialty-software | `research` | light glass with blue guide lines |
| 15 | mckesson-vs-pioneerrx-which-fits-retail-pharmacy-chains-in-2026 | hospital-and-lab-software | `versus/glasspair` | deep dunes (vibrant) |
| 16 | 7-best-dental-software-options-for-small-practices-in-2026 | specialty-software | `checkcard` | faint grid of white cards, no grain |
| 17 | curve-dental-vs-denticon-which-cloud-dental-software-wins-in-2026 | specialty-software | `versus/span` | deep dunes (vibrant) |
| 18 | nextech-vs-nextgen-for-dermatology-practices-2026-comparison | specialty-software | `versus/duel` (no eyebrow) | faint grid with corner glows |
| 19 | solventum-360-encompass-vs-optum-encoderpro-which-wins-in-2026 | medical-billing | `research` (two tiles: tilt 8, 230px, gap −14, no names) | light glass |
| 20 | simplepractice-vs-theranest-pricing-and-features-compared-2026 | specialty-software | `versus/peecpair` | near-white hairline grid, no grain |

Replaced along the way (all after the user had approved them): dental shortlist; derm lineup; mental health glass rows, then avatars; PT lineup, then capsule; Curve span on black; DoseSpot glass split; EHR cost grid, then flatcard; McKesson glass split; Nextech glass split, then band; SimplePractice badges; Solventum glass split; Vanta center.

### The 14 kept layouts (each in a delivered final, an example and an approved reference, 55–69)

| Layout | Approved field (only) | Where it came from | The user's words |
|---|---|---|---|
| `checkcard` | faint grid of white cards, no grain (default) | the user's Peec checklist ("ss1") | "ss1 exact pixel perfect design i want in…"; "use exact same checkboxes size and tick icon that was in its inpirsation" |
| `flatcard2` | the light glow | Peec agent cards + the user's cursor screenshot | "perfect" |
| `research` | light glass only (`"glass": true` or omitted); not vibrant | Peec research cover + ss2 guide lines | "use frosted glass for dermatology tag bg and logos bg"; "perfect"; Solventum: "make logo close so they touch each other a lil bit…" |
| `squircles` | the faint grid only (`"canvas": "grid"` or omitted) | the user's Calendly tile reference | approved on the grid, no note (Calendly sky: "the gradient looks awful"; glow disapproved) |
| `bluegrid` | its blue; vibrant | Databricks partner cover | "i like this layout and design" |
| `typehero` | its light glass | invented (round 3) | approved, no note |
| `strike` | glow or sky (`BG_FIT`); never blue | invented (round 1) | "Love it" |
| `meter` | white only, bare (no card) | invented (round 1) | "delete white container" |
| `versus/peecpair` | its near-white grid, no grain (default) | the user's Peec "Powered by" screenshot | "use this attached ss design ditto for this…"; "this is fine but use black color for logo text" |
| `versus/inline` | its light canvas | invented (round 4) | approved, no note |
| `versus/span` | the deep dunes only (`"canvas": "dunes"` or omitted); vibrant | invented (round 5) | black: "change bg, this bg doesnt look good"; glow disapproved |
| `versus/duel` | its faint-grid canvas | Dub comparison covers | "wow love it" |
| `versus/band` | plain black; vibrant; only for two text wordmarks that turn white cleanly and balance in width | Peec partner covers | "use full black bg"; "this is perfect" |
| `versus/glasspair` | the deep dunes only; vibrant | the user's Calendly screenshot for McKesson | "this looks better but use our good gradient bg"; "make the corner radius consistenty" |

Older layouts used in finals, with no code change: `dark` (PioneerRx), `versus/scores` (TruBridge, with the new `"prefix"` / `"suffix"` option), `lineup` (HIPAA), `prompt` (Claims Denial).

### The 92 retired (in `RETIRED` in `layouts.mjs`, code deleted)

- **With the user's words (11):** `versus/burst` "disgusting shapes", `versus/underline` "too bad visual", `versus/bubbles` "ew", `versus/delta` "$20 looks so weird bec its so big there is no visula balance at all", `slider` "this layout is borint", `footnote` "too much text", `heroglass` "its too bad not visually appealing at all", `horizon` "i like the shape you used but over alll its too much., not visually apealing at all", `gooey` "ew dont connect and the gradient looks awful", `capsule` "i dont like this rounded it looks weird", `cursorcard` "not tilted rectangle pls also use our bgs".
- **Disapproved with no note (50):** tree, bigword, sidecolumn, wordtag, market, estimate, index, horizonrow, tilegrid, iconrows, bluefield, horizon2, sideglow, eclipse, crescent, masthead, cropmarks, bracket, contrast, waffle, notepad, pricebar, spectrum, glowtiles, glasstiles, breakdown, typelist, toppick, arc, track, rating, versus/medallions, profiles, routes, logobar, outline, gap, toggle, eclipses, pricepair, butterfly, venn, bands, ladder, tierchips, lockups, titlecard, sidetiles, aura, iconbadge.
- **Approved once, then replaced by the user on every article (5, plus `capsule` above):** `flatcard` (improved into `flatcard2`), `avatars`, `glassrows`, `versus/glasssplit`, `bigtype`. Asked whether to keep them, the user first said keep all, then "actually delete all of them".
- **Never shown (26):** QA cut them as repeats of retired or rejected designs, or the user interrupted the round: lockupwall, blueprint, plus, aurarow, byline, gridcells, collection, eyebrow, pillstat, `fan` (the mode, not `versus/fan`), `bento` (the mode, not `versus/bento`), editorial, cascade, glassbars, orbit, mosaic, versus/gauges, segbar, pairchips, chipfigures, pillrows, pillduel, vstack, overlap2, tiltcards, chipcloud.

### Code changes in the integration (render.mjs, layouts.mjs)

- **One field per kept layout** (`CANVAS_ONLY`): `versus/span` and `versus/glasspair` take only `"dunes"`, `squircles` only `"grid"`, `research` only `"glass": true`. Any other `"canvas"` or `"glass"`, or `"canvas"` on any other layout, is refused ("FIELD FIT FAILED").
- `meter` is bare only (the card is gone); `BG_FIT` meter `[white]`, strike `[glow, sky]`. `strike`, `track`, `breakdown` and `profiles` came out of `BLUE_PICK` / `BLUE_FIT` (never approved on blue).
- **VIVID:** `bluegrid`, `versus/band`, `versus/span` and `versus/glasspair` count as vibrant; `research` does not (it had wrongly counted). The history was fixed to match: two research entries set to `vibrant: false`, glasspair to `true` (backup in `~/.blog-featured-images/_archive/history-backups-2026-10-22`).
- No grain by default on `versus/peecpair` and `checkcard`.
- Small fixes kept from the batch session: `versus/scores` `"prefix"` / `"suffix"` (TruBridge 7.6% vs 21.9%, approved); a typed name hidden beside a wordmark on `cloud`, `versus/fan` and `versus/stacked` (a Fact QA rule); `cloud` with 7 items splits 2/3/2 (no lone tile); the `versus/lanes` track moves right only when a name is too long for 640 (the approved Office Ally image is unchanged).
- All 20 finals re-render pixel-identical with the cleaned code and pass every check without `--force`. The batch session had re-finalized them with `--force`, which skipped the heading, word, usage, vibrant, field-fit and delivered checks.

### Process rules that hold (agents.md, SKILL.md workflow)

- **Never ask the user for notes on a disapproval.** Diagnose it from taste.md (the rejects table) and act. This replaces section 22's "after two blank rejections ask for notes".
- **"This can be improved" with no detail:** diagnose against the reference and the craft rules, then show A (the fixes) and B (the fixes plus one idea). `flatcard` went this way and came back as `flatcard2`, "perfect".
- **An ambiguous note:** render each reading as an option; don't ask ("tilt the logos from one above" → `sol-tilt` and `sol-up`, and the user picked). Asking about "use glass bg" lost a round: the user's answer lost to their own earlier approval.
- **Background undecided:** show the same design on 2–3 of our fields (the user chose the dunes for Curve and McKesson, the grid for squircles).
- **One skeleton per review page** (taste 25). Visual QA's "repeat" calls were right almost every time.
- **A contact sheet of the whole batch, with a batch-level critique, before delivery** (taste 34): repeats, small widgets, the navy-blob black, one field everywhere.
- **After two failed rounds of inventions, go to references** (browser research or the user's own), not to the approved-looks picker. This replaces section 22's picker rule.
- **No voice-note button** on review pages: it didn't work inside the artifact ("forget about it"). Don't ship untested features.
- **Hand-off:** separate files per image; a link page with a Copy button per row (title → Google Doc → file) and "Copy all"; Before/After tables for each change. Every delivered file maps to its article at a glance ("this is for what url?").
  **Superseded (Oct 25):** a copy-only link page isn't enough ("how am i supposed to download images from here", "i need to be able to copy images", batch 8). Each row now has Copy link, Copy image (the full 1600×900 PNG) and Download, the header "Copy all N" (N counted from the rows) and "Download all" (.zip), and the preview is the full PNG shown small. Section 25.
- **Ops:** a brand-new review collection name each round, renamed everywhere in the builder; render finals from the project root, not inside `featured-images/`; redo a delivered image with `render.mjs --redo` and finalize it again, never `--force`; cut bare marks from the full logo, not the app icon; read Google Docs via `/export?format=txt`; Brandfetch images need the renderer's browser user agent.
- **The 1-in-3 vibrant cap:** when it blocks an approved image, say so and offer an override or a different black or blue design. "Use black too" means plain black or the dunes.

### Counts after batch 7 (snapshot, Oct 22 2026)

- 36 modes / 60 layouts live (28 / 46 after batch 6); 134 retired (42 after batch 6).
- 69 examples (54 after batch 6); 61 approved reference images (46 after batch 6; new: 55–69).
- Refusal suite: 277 cases / 296 steps (155 / 174 before); `test-examples`: 69 of 69 render.
- Taste: 34 principles (24 before; 25–34 are from this batch).

## 24. Batch 8 (Oct 24 2026): the rounds, in order

25 Google-Doc articles, 5 per category. Rounds are numbered as on the review page (collections `reviews-b8-oct24-r1` … `r8`). The bullets below were written during the batch; where a later finding changed them, a **Superseded (Oct 25)** line says so. The outcome is section 25.

### Start and round 1: approved looks rolled out
- **Oct 24 2026, batch 8 start:** the folder ledger (`featured-images/.featured-ledger.json`) and the site history must agree on `vibrant`. Three finals re-rendered with `--force` in batch 7 left the ledger wrong (Dermatology and Solventum research marked vibrant, McKesson glasspair not), and the renderer merges the ledger over the history, so a light image blocked the next vibrant one in its category ("VIBRANT CHECK FAILED" naming a research image). Fixed by copying the history's flag into the ledger; never use `--force` (use `--redo`).
- **Batch 8 (Oct 24 2026, 25 articles, one family each):**
  - Renderer fixes from QA: `versus/duel` fits the whole row inside the 7:5 card crop when a long name (athenahealth) would drop below 80px; `cloud` with ≤4 picks scales pills 1.15 and takes a two-line heading up to 68px (heading-to-name ≥1.7:1; at 1.3 the names read level with the heading); `versus/center` breaks a long label onto two lines at ~52px; `flatcard2` takes `"valueSize"` (≥50px clear inside the selection); `versus/peecpair` sides take `"width"` (size by optical weight: PHILIPS 350 vs GE HealthCare 480); `meter` keeps a figure label inside its track, its right edge on the track end when it can't start at its bar; `versus/duo` shows a logo-less side as its name alone at 72px.
    **Superseded (Oct 25):** the `cloud`, `versus/center` and `flatcard2` changes were reverted: their only uses (Telehealth platforms, MEDITECH vs TruBridge, ModMed) were disapproved, so the user never approved them. Kept, because their images were approved: the duel row fit, peecpair's per-side `"width"`, the meter label clamp and duo's name-only side.
  - Content twin: a best-of in a category whose picks repeat a delivered image's picks in a sibling tile-row skeleton (research, frostrow, squircles, lineup) is a repeat; pick a skeleton that isn't a tile row (`cloud`, `ranges`).
    **Superseded (Oct 25):** both replacements (`cloud`, `ranges`) were disapproved anyway. Lists passed in batch 8 only as copies of the user's references, with the logos in one object (taste 41).
  - `versus/band` needs two wide text wordmarks (about 4.2:1 or wider); a compact one (Availity 3.25:1) can't reach the shared width.
  - A best-of drops picks only from the end, never the middle; look for a product's own mark on its provider site before giving up (TriZetto's triangle lives on trizettoprovider.com).
  - Duo: a light brand colour (Zocdoc yellow) can't carry white: leave `color` out for the duo blue; a plain-shape mark (Phreesia's disc) goes name-only, as Sectra on approved 13.
  - Folder ledger and history must agree on `vibrant`; batch 7's `--force` finals left them out of sync.
  - Makers share the scratchpad: each keeps its helpers in its own subfolder.
- **Batch 8 review (Oct 24 2026): 7 approved, 18 disapproved with no note**, then "The ones that I have disapproved, I want you to create new layout for them. And the ones that I have approved are fine."
  - Approved: versus/band (athenahealth vs Waystar), versus/duel (MyChart vs athenahealth), versus/peecpair (GE vs Philips), meter (RCM worth it), badge (telehealth worth it), versus/glass (Valant vs ICANotes), versus/duo (Zocdoc vs Phreesia).
  - Disapproved: every image that reused a layout approved on another article in batch 7 (checkcard, squircles, glasspair, span, inline, flatcard2, research→cloud, frostrow→ranges, typehero) and the older templates the user has seen (spotlight, tiles, table, center, bento, type, costgrid, figures, frost). Diagnosis: the plan rolled approved designs out across the batch, which SKILL §3 forbids ("A design approved in a direction check is approved for the article it was shown on"). The reuse rule must hold for batch-7 finals too: a layout approved on one article is not a template for the next batch.
    **Superseded (Oct 25):** this reuse diagnosis is wrong (the correction below says why). The round-1 lesson is fit to the new article: judge each look against the new article's type, logos and facts, never "it was approved before" (taste 34 calibration). The 18 disapproved older layouts were not retired; the user approved each on its own article, and they stay live.
  - Redo: 18 brand-new layouts from Peec and Dub covers not used before (chiprow, rankrows, darkbars, darkhbars, logodialog, sourcetable, trio, optioncards; versus/pillvs, markvs, planstack, headpeek, splitchart, twocards, stackpair, blackmarks, linkcard, pillpair), each translated to our fields, radius and "vs". A first render read as small widgets; everything was scaled ~20–30% before the Makers started (taste 26).
  - **Correction (same day):** the "reuse" diagnosis above was wrong. All 7 approved images also reused earlier families (band, duel, peecpair, glass, duo, meter, badge), so the disapprovals were about each image's look, not reuse. What the approved set shares: big names or real wordmarks as the object (band, duel, peecpair, glass, duo) or one simple figure in one object (meter, badge). What failed: small card widgets, logo-tile rows, charts inside cards, marks without names.
    **Superseded (Oct 25):** "marks without names" is not a failure signal. `versus/markvs` (eClinicalWorks vs NextGen: two bare marks, no names, approved in round 2) and `versus/capsulevs` (Medallion vs symplr: marks only, names in the heading, approved in round 3) passed; `versus/glasspair` (eClinicalWorks in round 1) and `versus/tiltpair` (Isabel, reordered) showed marks only and failed. The difference is closer to "a faithful copy of the reference at its own scale" than to names. What separated the passes: a vs with no price unless the title is about pricing (14 of 15 approved vs finals carry no figure; taste 37), and lists and costs that copy one of the user's references (taste 41).
  - QA predictions are not the user's verdict: both QA agents passed all 25 and the user disapproved 18; on the redesigns Visual QA failed 13 of 18 as re-dresses. Fix the measurable defects QA finds (fields, crop, empty bands, hierarchy) and let the user judge the rest.
    Added Oct 25: QA's *repeat* calls are the exception. In round 3 Visual QA called every repeat on the page, the session overrode it, and every repeat lost.

### Batch 8, rounds 2 and 3 (Oct 24 2026): the user's own references (added Oct 25)
- Round 2 (18 layouts from Peec and Dub covers the session found): the user marked one, `versus/markvs` (eClinicalWorks vs NextGen), approve. The other 17 got no verdict. A round left almost blank is a rejection of the direction (taste 43).
- The user answered with nine references of their own (refs 42–50) and a note per image: "img 1 can be used for comparison / vs", "img 2 can be used for just name of 1 product in our noise blue gradient bg", "img 3 can be used for comparison / vs , replace x with vs", "img 4 can also be used for comparison / vs", "img 5 and img6 can be used for anything just write product name", "img 7 can be used for no of products for example 7 products or whatever, use glass", "img 8 can be used for pricing comparison", "img 9 can be used for any template that fits in this", "use our colors obv". Each note says which article type a reference is eligible for; it is not a quota.
- Round 3 (17 copies of the nine references): 11 approved (darkpanel, highlight, dock, vssquares ×2, wordvs ×2, metricrows, titlebox, namehero, capsulevs), 3 disapproved, 3 unmarked. Every failure was a second or third use of a family on the page (next section). Several references were used on 2–3 articles, and Visual QA's "once per page" was overridden.
- Hit rate by source: the user's references 11 of 17 here, then 3 of 4 (round 4) and 2 of 2 (round 8); the covers the session found itself 1 of 18 (taste 35).

### Batch 8, round 4 (Oct 24 2026): "the ones that i have disapproved are repeating the layouts/templates/design"
- The user's diagnosis: each disapproved image repeated a family already on the page (dock twice, metricrows three times, capsulevs twice, highlight twice). Before every review page, list each family on the page and allow it once (V15).
  **Superseded (Oct 25):** `capsulevs` was on the page three times (Medallion, Clinisys, Isabel), not twice. And vssquares (MEDITECH, Availity) and wordvs (Luma, EncoderPro) were repeats too, and all four were approved. The user kept the best instance of each family; vssquares and wordvs passed twice only because each copy was the reference's exact form in a different category. That is not a licence: one family and one reference per page, each reference on its best-fit article (taste 36).
- The round-4 designs came from four incident.io covers the user sent mid-turn at 18:15, as attachments with no text, and from two Mintlify covers the session picked. (Added Oct 25: the incident.io covers were the user's own references, but they were never saved to disk; save every reference the user sends, with its intended use.)
- Two references from one source ("tiles above a heading", incident.io refs 2 and 4) are one skeleton when used together. Separate them by order, scale and field (tiltpair went onto the dunes with the heading above the tiles).
  **Superseded (Oct 25):** separating them didn't work. The reordered `tiltpair` got no verdict in four rounds, was replaced by `versus/darkpills` and is retired. Don't use two sibling skeletons from one source in one batch; copy the one that fits, whole (taste 35).
- A reference that is "a chip plus words" uses one chip. Two chips that each hold a logo and a name make the wordvs/duel family again.
- A tilted colour band is full-bleed with square ends. A rotated rounded box under 1600px wide is a rotated card (taste 29), and it also reads as the approved highlight.
- Brand marks keep their colours unless the reference itself is monochrome. Recolouring both sides white on identical blue tiles erases the pair.
- Including a pick depends on the heading around it. Amwell was fine as one of "the article's seven", but wrong under "for Small Practices", which the article tells small practices to skip. If the count changes, re-check the picks.
- A one-figure cost layout (bandhero, glassbar) shows the article's own lead answer ("Most clinics pay $250–$800 per provider per month").
- A row of logo cards with the first one highlighted repeats darkpanel. Two price ranges on one axis repeat meter/metricrows, whatever the dressing.
- Round 4 verdicts: CDS (editorcard), Clinisys (chipvs), Telehealth (tilerow) and Online Booking (bandhero) approved. Two notes came with them:
  - Telehealth: "use bg in which frosted glass bg can be used for logos bg". Logo tiles go on frosted glass over the light glow field, with the logos in their real colours (tilerow `"frosted": true`). Solid coloured tiles with recoloured marks were not the look.
    **Superseded (Oct 25):** not the light glow. The next two rounds put the frosted tiles on our blue noise gradient ("use gradient blue noise bg", then "This is fine now"). `tilerow` is blue only and refuses `"frosted"` and `"blue": false` (taste 38).
  - Online Booking: "delete the waves from bottom". The reference's waves came out; with `"waves": false` the block re-centres vertically. Don't add decorative shapes just because a reference has them.
    **Superseded (Oct 25):** the waves code is deleted; `bandhero` refuses `"waves": true`.
- Round 5 notes:
  - Telehealth tilerow: "use gradient blue noise bg". The frosted tiles went onto our noisy blue gradient (`"blue": true`, vibrant). Frosted glass needs colour behind it, and the user's pick for that is the blue gradient, not the light glow.
  - Online Booking bandhero: "use black bg". Plain black with white type and the blue band (`"dark": true`, vibrant).
    **Superseded (Oct 25):** reversed a round later ("dont use black bg"). `bandhero` is light with the blue band only and refuses `"dark"` and `"bandInk"` (taste 40).
  - Isabel's tiltpair moved from the dunes to the light glow field, so Telehealth could take the vibrant slot in clinical (never two vibrant neighbours in a category).
- Round 6/7 verdicts:
  - Online Booking: after "use black bg" the black field was rejected ("dont use black bg"). A black band on the light field was disapproved too. The blue band on the light field was approved. A one-line field note can be reversed once the user sees it, so offer both readings as options.
  - Isabel vs UpToDate and BestRx vs PrimeRx went four rounds with no verdict. Asking directly ("approve as is?") brought the answer "I'll provide inspirations". When images sit unmarked, ask in chat instead of re-listing them.
- Round 8: both references (darkpills, glowmarks) were approved on black, as in the references, over the light versions. The user chose the reference's own dark field even though it put two vibrant images side by side in clinical (Telehealth) and hospital (MEDITECH). When the reference is dark, show the dark version alongside a light one, rendered with --force for review only, and let the user decide.
  **Superseded (Oct 25):** not "for review only": the Isabel and BestRx finals were rendered with `--force` too, which skipped every check. The light versions were disapproved and their code is deleted, so the dark version is the design (taste 39). A knowing vibrant neighbour now renders with `--vibrant-pick`, which lifts only the VIBRANT CHECK and records `"vibrantPick": true`; never `--force`. The history was corrected (section 25).
- Batch 8 was finalized Oct 24 2026: 25 images in `_delivery/batch8`, with a link page.
  **Superseded (Oct 25):** the first link page had only a Copy button per row and a stale "Copy all 20" for 25 rows. After "how am i supposed to download images from here" and "i need to be able to copy images" it got Download per row, Download all (.zip), Copy image per row and full-size previews. After delivery the user had `versus/vssquares`' corner ring markers and the black square's grey stroke removed; MEDITECH vs TruBridge and Availity vs Office Ally were re-finalized with `--redo`.

### After delivery (Oct 24–25 2026): `versus/vssquares` (added Oct 25)
- The user's requests on the two vssquares finals (MEDITECH vs TruBridge, Availity vs Office Ally): the corner ring markers removed, the black square's grey stroke replaced by a dashed edge (top, left, bottom) in the guide lines' style so it doesn't blend into the black field, and "lighter" dots.
- "Lighter" was misread: the batch session made the dots brighter, and the user meant subtler, "very subtle" (white dots at 12% opacity). On a dark field "lighter" can mean brighter or fainter: ask which, or show both readings (taste 40).
- Final look: no corner ring markers, a dashed edge on the black square, very subtle dots. Both finals were re-finalized with `--redo`.

## 25. Batch 8 outcome (Oct 24–25 2026): 25 finals, 16 kept layouts, 22 retired

Batch 8 ran eight review rounds on 25 Google-Doc articles in one day. Round 1 rolled batch-7 approved looks out to the new articles: 7 of 25 approved, 18 disapproved with no notes. Round 2 offered 18 layouts taken from Peec and Dub covers the session found itself: the user marked one (`versus/markvs`) and sent nine references of their own instead. From round 3 on, the designs were copies of the user's references: 11 of 17, then 3 of 4 (the incident.io covers the user sent mid-turn), then 2 of 2 (refs 51 and 52, after "i'll provide inspirations"). What follows is the state the integration left (Oct 25).

### The rounds

| Round | Shown | Result |
|---|---|---|
| 1 | 25 images on existing layouts | 7 approved, 18 disapproved, no notes |
| 2 | 18 layouts from Peec and Dub covers the session found | 1 approved (`versus/markvs`), 17 unmarked; the user sent refs 42–50 |
| 3 | 17 copies of the user's nine references, several used 2–3 times | 11 approved, 3 disapproved, 3 unmarked: "done the ones that i have disapproved are repeating the layouts/templates/design" |
| 4 | 4 from the user's incident.io covers, 2 from Mintlify covers | `editorcard`, `versus/chipvs`, `tilerow`, `bandhero` approved (two with notes); `versus/tiltpair`, `versus/dimension` unmarked |
| 5–7 | `tilerow` and `bandhero` field notes; Isabel and BestRx again | "use gradient blue noise bg", "This is fine now"; "use black bg", "dont use black bg", blue band approved; Isabel and BestRx unmarked, then "i'll provide inspirations" |
| 8 | Isabel and BestRx from refs 51 and 52, dark and light | both dark approved, both light disapproved |
| Hand-off | the link page | "how am i supposed to download images from here", "i need to be able to copy images" |

### The 25 finals

| # | Article (slug) | Category | Layout | Field |
|---|---|---|---|---|
| 1 | is-telehealth-software-worth-it-for-small-practices-in-2026 | clinical-software | `badge` | light |
| 2 | athenahealth-vs-waystar-which-rcm-platform-fits-in-2026 | medical-billing | `versus/band` | plain black (vibrant) |
| 3 | epic-mychart-vs-athenahealth-patient-portal-which-fits-multi-location-practices | clinical-software | `versus/duel` | its faint grid |
| 4 | valant-vs-icanotes-which-ehr-fits-psychiatric-practices-in-2026 | specialty-software | `versus/glass` | light |
| 5 | zocdoc-vs-phreesia-which-scheduling-platform-wins-in-2026 | practice-management-software | `versus/duo` | black (vibrant) |
| 6 | ge-healthcare-vs-philips-pacs-pricing-and-features-in-2026 | hospital-and-lab-software | `versus/peecpair` | its near-white hairline grid |
| 7 | is-rcm-software-worth-it-for-small-practices-in-2026 | medical-billing | `meter` | white |
| 8 | eclinicalworks-vs-nextgen-for-dermatology-practices-in-2026 | specialty-software | `versus/markvs` | faint grid |
| 9 | 7-best-hospital-management-software-for-multi-hospital-systems | hospital-and-lab-software | `highlight` | light dotted map |
| 10 | how-much-does-primary-source-verification-software-cost-in-2026 | practice-management-software | `titlebox` | light dotted map |
| 11 | 6-best-change-healthcare-alternatives-for-claims-in-2026 | medical-billing | `darkpanel` | light dotted map, black panel |
| 12 | optum-encoderpro-vs-aapc-codify-which-coding-tool-wins-in-2026 | medical-billing | `versus/wordvs` | light dotted map |
| 13 | 7-best-therapy-practice-management-tools-for-solo-therapists-in-2026 | specialty-software | `dock` | light glass |
| 14 | medallion-vs-symplr-which-credentialing-platform-wins-in-2026 | practice-management-software | `versus/capsulevs` | light |
| 15 | is-modmed-worth-it-for-solo-dermatology-practices-in-2026 | specialty-software | `namehero` | deep-dunes blue noise (vibrant) |
| 16 | luma-health-vs-phreesia-which-patient-engagement-platform-wins-in-2026 | practice-management-software | `versus/wordvs` | light dotted map |
| 17 | eaglesoft-vs-dentrix-pricing-and-features-compared-2026 | specialty-software | `metricrows` | framed light page |
| 18 | clinisys-vs-epic-beaker-which-lis-fits-hospital-labs-in-2026 | hospital-and-lab-software | `versus/chipvs` | light glow |
| 19 | 7-best-clinical-decision-support-tools-for-hospitals-in-2026 | clinical-software | `editorcard` | light |
| 20 | 7-best-telehealth-platforms-for-small-practices-in-2026 | clinical-software | `tilerow` | blue noise gradient (vibrant) |
| 21 | how-much-does-online-booking-software-cost-for-clinics-in-2026 | practice-management-software | `bandhero` | light, blue band |
| 22 | isabel-vs-uptodate-which-diagnostic-support-tool-fits-in-2026 | clinical-software | `versus/darkpills` | dark grey (vibrant; `vibrantPick`) |
| 23 | bestrx-vs-primerx-which-pharmacy-software-wins-in-2026 | hospital-and-lab-software | `versus/glowmarks` | black with our blue glow (vibrant; `vibrantPick`) |
| 24 | meditech-vs-trubridge-which-fits-rural-hospitals-in-2026 | hospital-and-lab-software | `versus/vssquares` | plain black (vibrant; `vibrantPick`; redone after delivery) |
| 25 | availity-vs-office-ally-which-clearinghouse-fits-in-2026 | medical-billing | `versus/vssquares` | plain black (vibrant; redone after delivery) |

8 of 25 are vibrant. The user knowingly kept two vibrant neighbours, in clinical (Telehealth, Isabel) and hospital (MEDITECH, BestRx), to keep the dark references dark. The delivered Telehealth final carries a camera mark the batch session drew itself in place of Zoom's logo; the `tilerow` example uses the real Zoom icon (`"icon:zoom.us"`). Never draw a brand logo.

### The 16 kept layouts (each in a delivered final, an example and an approved reference, 70–85)

| Layout | Final (category) | Source | Approved look (only) | The user's words |
|---|---|---|---|---|
| `versus/markvs` | eClinicalWorks vs NextGen (specialty) | Dub "Rebrandly vs" cover | two bare marks (no names) at lockup scale, small "vs", faint grid | approved, no note (round 2) |
| `versus/vssquares` | MEDITECH vs TruBridge (hospital); Availity vs Office Ally (billing) | user img 1 | plain black, dot grid, dashed guides; a black square (white mark) beside a white square (black mark), "vs" disc on the seam, names under the marks; no corner ring markers, a dashed edge (top, left, bottom) on the black square, very subtle dots (white, 12% opacity); vibrant | "img 1 can be used for comparison / vs"; after delivery, "lighter" dots, meaning "very subtle" |
| `namehero` | Is ModMed Worth It (specialty) | user img 2 | "IS IT WORTH IT? / MODMED" in big white caps on our deep-dunes blue noise; vibrant | "img 2 can be used for just name of 1 product in our noise blue gradient bg" |
| `versus/wordvs` | Luma Health vs Phreesia (PM); Optum EncoderPro vs AAPC Codify (billing) | user img 3 | two mark + name lockups in brand colours, a black "vs", the light dotted-map field with blue accent dots | "replace x with vs" |
| `versus/capsulevs` | Medallion vs symplr (PM) | user img 4 | heading on top, one white capsule holding two circles with the real marks, grey "vs" for the "+" | "img 4 can also be used for comparison / vs" |
| `titlebox` | Primary Source Verification cost (PM) | user img 5 | the title alone in a long box with our blue border, square corner handles and hatched ends; no figure | "img 5 and img6 can be used for anything just write product name" |
| `highlight` | Hospital management for multi-hospital systems (hospital) | user img 6 | the title with its key phrase in our blue-gradient box with square handles, white type; title only | as img 5 |
| `dock` | Therapy PM for solo therapists (specialty) | user img 7 | heading, one frosted dock with one real app tile per pick, the lead raised; light glass; no placeholder tiles | "use glass" |
| `metricrows` | Eaglesoft vs Dentrix pricing (specialty) | user img 8 | a framed light page: title, two rows each a label, a split bar (always on) and a big blue figure with unit | "img 8 can be used for pricing comparison" |
| `darkpanel` | Change Healthcare alternatives for claims (billing) | user img 9 | a big two-line title left, a plain black panel right listing the picks (logo + name), fading out | "img 9 can be used for any template that fits in this" |
| `editorcard` | Clinical decision support for hospitals (clinical) | Mintlify editor cover | one white app window holding a row of 4 logo tiles, a cursor on the lead | approved, no note |
| `versus/chipvs` | Clinisys vs Epic Beaker (hospital) | the user's incident.io cover | one tilted white chip holding both real marks and a "vs", the names as a big title beside it, light glow | approved, no note |
| `tilerow` | Telehealth platforms for small practices (clinical) | the user's incident.io cover | overlapping frosted tiles with real-colour logos above a big white heading, on our blue noise gradient only; vibrant | "use bg in which frosted glass bg can be used for logos bg"; "use gradient blue noise bg"; "This is fine now" |
| `bandhero` | Online booking cost (PM) | the user's incident.io "PagerDuty" cover | a kicker, one big word and one figure on a full-bleed tilted blue band, light field only | "delete the waves from bottom"; "use black bg", then "dont use black bg"; the black band disapproved |
| `versus/darkpills` | Isabel vs UpToDate (clinical) | user ref 51 ("ChatGPT vs Google") | two white pills (real logo + name) with dark rings, a white "vs", dark grey with a faint grid and a band of small squares; dark only; vibrant | "i'll provide inspirations"; light version disapproved |
| `versus/glowmarks` | BestRx vs PrimeRx (hospital) | user ref 52 ("Lovable \| Microsoft") | real marks, white names and a "vs" on black with our blue glow rising from the bottom edge in two humps; dark only; vibrant | "I'll provide inspirations"; light version disapproved |

Older layouts in batch-8 finals (round 1, approved again on new articles): `badge` (telehealth worth it), `versus/band` (athenahealth vs Waystar), `versus/duel` (MyChart vs athenahealth; long names fit the row), `versus/glass` (Valant vs ICANotes), `versus/duo` (Zocdoc vs Phreesia; a side without a logo shows its name), `versus/peecpair` (GE vs Philips; per-side `"width"`), `meter` (RCM worth it; a long figure label stops at the track end).

### The 22 retired (in `RETIRED` in `layouts.mjs`, code deleted)

- **Round-2 layouts from Peec and Dub covers, never marked (17):** the user sent their own references instead. `chiprow`, `rankrows`, `darkbars`, `darkhbars`, `logodialog`, `sourcetable`, `trio`, `optioncards`, `versus/pillvs`, `planstack`, `headpeek`, `splitchart`, `twocards`, `stackpair`, `blackmarks`, `linkcard`, `pillpair` (the last eight are `versus/` variants).
- **No verdict for four rounds, then "i'll provide inspirations" (2):** `versus/tiltpair` (the user's incident.io cover, reordered), `versus/dimension` (a Mintlify drawing with two prices).
- **Never shown (3):** `steptiles`, `versus/filecard`, `versus/bandcard`.

### Not retired: the 18 older layouts disapproved in round 1

`cloud`, `checkcard`, `inline`, `glasspair`, `ranges`, `type`, `flatcard2`, `squircles`, `table` on blue, `span`, `center`, `spotlight`, `tiles`, `bento`, `costgrid`, `figures`, `typehero`, `frost`. The user approved each on its own article; round 1 failed on fit to the new articles (lists, costs, priced vs), not on the layouts. They stay live. The lesson: judge a look against the new article (type, logos, facts), never "it was approved before" (taste 34 calibration).

### Code changes in the integration (render.mjs, layouts.mjs, usage.mjs)

- **`LAYOUTS` order restored:** the published order first, new entries appended. A versus spec without `"variant"` is `versus/overlap` again; the batch session had put its new variants first, and the suite's "versus with no variant is overlap" case caught it.
- **Approved looks only** ("FIELD FIT FAILED" for a turned-down option): `tilerow` refuses `"frosted"` and `"blue": false`; `bandhero` refuses `"waves": true`, `"dark"` and `"bandInk"` (the waves code is deleted); `versus/darkpills` and `versus/glowmarks` refuse `"light"` (light code deleted); `metricrows` refuses `"bars"` (bars always on); `dock` refuses a `"count"` different from its items (placeholder code deleted).
- **CONTENT minimums** (`thin8`): markvs, vssquares, wordvs, chipvs, darkpills and glowmarks need both logos; capsulevs both logos and the headline; titlebox the headline; highlight `"lead"` and `"phrase"`; dock 3–7 items; darkpanel 3–6; editorcard 3–4; tilerow 3–6; metricrows 2 rows, each with a label, a display and a numeric amount; bandhero `"name"` and `"band"`. namehero without its name fails the heading check.
- **VIVID:** namehero, tilerow, versus/vssquares, darkpills and glowmarks count as vibrant.
- **New flag `--vibrant-pick`:** for the user's knowing choice of a vibrant image beside a vibrant neighbour. It lifts only the VIBRANT CHECK and records `"vibrantPick": true` in the history. Isabel vs UpToDate, BestRx vs PrimeRx and MEDITECH vs TruBridge are recorded with it (they had been forced with `--force`).
- **`usage.mjs` loadHistory:** for the same render (same `"at"`), the site history's fields win over a stale batch-folder ledger (batch 7's forced finals had left a wrong ledger `"vibrant"` flag that refused a batch-8 render).
- **Reverted:** the unapproved changes to `cloud` (≤4-pick scaling), `versus/center` (two-line labels) and `flatcard2` (`"valueSize"`). Kept: the duel row fit, peecpair's per-side `"width"`, the meter label clamp and duo's name-only side.
- `versus/vssquares`: no corner ring markers; the black square has a dashed edge on its top, left and bottom sides (the guide lines' dashed style); the dot grid is very subtle (white dots at 12% opacity). The user's post-delivery requests; both finals re-finalized with `--redo`.
- The console line prints `bg=canvas` for canvas layouts (it printed the unused light field).
- All 25 finals re-render pixel-identical with every check on (the two vssquares against their redone finals).

### Process rules that hold (agents.md, SKILL.md workflow)

- **One family and one reference per review page.** Assign each reference to its single best-fit article first (taste 36). Visual QA's repeat calls are right: don't override them to fill a page.
- **The user's own references beat covers the session finds** (11 of 17, 3 of 4, 2 of 2 against 1 of 18; taste 35). Copy them whole; translate only colour, type and "vs"; drop ornaments.
- **When a round comes back nearly blank, or an image is unmarked twice, ask for references** (offer "send a reference" as an option); don't invent another round (taste 43).
- **Save every reference the user sends**, mid-turn attachments included, to the batch's refs folder with its intended use, so later sessions can see it (the four incident.io covers were never saved).
- **Never draw a brand logo:** a missing mark is fetched (`icon:<domain>`), cut from the brand's own logo, or left out (the typed name).
- **`--vibrant-pick`** for the user's knowing vibrant neighbour; `--redo` for a delivered image the user asks to change; never `--force`.
- **A field note gets both readings (A/B)** before committing; on a dark field, "lighter" is asked about or shown both ways (brighter / fainter) (taste 40).
- **Hand-off link page:** per row the title, the Google Doc link, the filename, Copy link, Copy image (the full 1600×900 PNG) and Download; the header "Copy all N", with N computed from the rows, and "Download all" (.zip); the preview is the full PNG shown small, so right-click → Copy image works. Test it in the claude.ai viewer before handing over.
- **Restate each message as a prompt;** Before/After tables for fixes.
- **Another session may be editing the skill at the same time:** re-read a file right before writing it, keep the other session's changes, and tell it what you changed.

### Counts after batch 8 (snapshot, Oct 25 2026)

- 45 modes / 76 layouts live (36 / 60 after batch 7); 156 retired (134 after batch 7).
- 85 examples (69 after batch 7); 77 approved reference images (61 after batch 7; new: 70–85).
- Refusal suite: 335 cases / 354 steps (277 / 296 before); `test-examples`: 85 of 85 render; a SKILL.md frontmatter check.
- Taste: 43 principles (34 before; 35–43 are from this batch).

## Batch 9 (Oct 27 2026): PT Billing Software for Medicare, WebPT Cost

- The user: "no repeated design", then "All of the templates that we have created already been used". Every one of the 76 live layouts is now on the site, so the usage rule of the time left only layouts used in other categories (`checkcard` in medical-billing and `titlebox` in specialty-software passed both QA agents in round 0 and were the predicted approvals; the user's answer was "these have already been used").
- Asked how to source new designs, the user first chose "I'll send references", then said "you create". Browser research found two Clerk blog covers; they became `plates` (three linked white cards: 40 timed min → 8-minute rule → 3 units) and `statuscard` (logo top-left, a toast card with ghost cards, the title bottom-left). Both QA agents passed them after fixes. The user: "this is bullshit, this is AI scope. Look at the images, then we finalized this is impossible, bro." Both are rejected and never built into the renderer.
- Diagnosis (taste 21, 22, 35; Predict the Verdict): `plates` is the retired `link` (cards joined by a connector) in new clothes; `statuscard` spreads logo, card and title to three corners, uses a UI toast as the idea and empty ghost cards as filler. Both are the generic SaaS-blog look, not our finalized language (one confident object, big type or real logos, our fields). A found cover from a site with a different design language is not a reference; QA passing is not a predicted approval.
- Rule of the time (superseded on Oct 28 2026: no approved look is offered for a new article; the last section): when every layout is used, offer the strongest approved look free in the category first, then ask for the user's own reference. Still true: don't invent from found SaaS covers.
- Round 2 (same day), four inventions from our own parts, centred, one object each: `pt-modifiers` (GP / CQ / KX as big type tiles, KX blue), `pt-units` ("40 timed minutes = 3 billable units" on one white card), `wp-logoword` (the WebPT wordmark as the headline's first word, "Cost" beside it), `wp-hidden` (three plans with blurred prices). The user: "yukh". All four rejected; I had predicted three approvals. Two failed invention rounds in one batch: per taste 43 and SKILL.md §3, the next step is the user's own reference, not a third round.
- Round 3, two covers from peec.ai/blog (the user's own source, "go to https://peec.ai/blog and take inspirations and design ours", and "I have given you thousands of references"): "AI search reranks sources" became `pt-peecrows` (a big title over three white row cards, the first ringed in blue with a pill) and "Less Cost. More Value." (Peec's pricing update) became `wp-peecplans` (WebPT's three plans as plan cards on black, each price a blank bar, each ending in "Book a Demo"). The user: "I really like these two images… I love them, honestly." Two fixes: (1) the plan cards were laid in an isometric plane with a ghost stack: "it looks 3D and we're not using 3D anymore", so they now sit flat and straight in one row; (2) the rows had icon tiles ("8", "GP", "KX") standing in for Peec's favicons: "why did you use these logos? 8-minute rule why what is this?", so the tiles are gone and the rows say the rules in the article's words.
- Rules: no 3D (no perspective, isometric planes or stacked ghost copies) even when the reference has it; a tile shaped like an app icon means a real brand logo, so never fill one with a code or a letter. When the user asks for new designs, the user's named sources (peec.ai/blog, calendly.com/blog) come before any site the session finds.
- Round 4, variations: "The text hierarchy is not right. Drop shadow is not right. ... Make another variation. Make multiple variations. According to our taste." The user picked PT billing "C" (the faint grid, a one-line title: `rulerows`) and WebPT "A" (the dark button with the blue bar: `demohero`). Both approved after 4 rounds.
- **Principles taken (taste.md):** 44 "Real logos only" (an icon or logo tile holds a real brand logo, never a code, letter, number or symbol; terms stay typed words) and 45 "Your library first, several variations" (with no reference, take each structure from the user's references, their named sources (Peec, Calendly, Dub, Mintlify, incident.io) or the approved set, never a new site or our own parts; 2–3 variations per article in round 1). Evidence added to 1 (one element leads: "The text hierarchy is not right"), 28 (no drop shadow on black: "Drop shadow is not right") and 29 (no 3D: "it looks 3D and we're not using 3D anymore"). Self-Critique rows "Real logos" and "Library first"; V34 and V35 in agents.md; Predict the Verdict calibrated (QA passed round 1, round 2 was predicted 3 approvals and got 0; only reference-led passed).
- **Counts after batch 9 (Oct 27 2026):** 47 modes / 78 layouts live (45 / 76 after batch 8); 156 retired; 87 examples; 79 approved reference images (new: 86–87); refusal suite 343 cases / 362 steps; taste 45 principles (43 before; 44–45 are from this batch).

## Oct 28 2026: no reuse, and the taste training

The user (Oct 28 2026): "So you need to understand the approved images are not retired, I love those images and I want you to learn and build your taste from those images. So that you can create new images and don't repeat the images again and again and again. Because now what the skill does, it repeats the layout template design. For different articles, I want new image for each article. Do you get my point? And for that, I want you to train yourself. So if you need to orchestrate multiple agents work, do it, but you have to train yourself with each feedback I give you, with each image that approves, with each image that disapproves, so that you can, so that when I share for example 20 URL articles with you, you don't repeat the images that has already been used, you create a new images with the taste and training that you have acquired so far."

### The no-reuse rule

- **What changed:** a layout already used on the site, in any category, is not used again for a new article; only the user's own pick reuses one (`render.mjs --user-pick`, or `plan.mjs` "slug=layout!"). A `--redo` of a delivered image is unchanged (the same image, not a reuse).
- **What it replaced (now history):** the per-category rule of Oct 15 ("the ones that have used cant be used again unless the category is different") and the site-wide caps (pills 2, slash/connect/duo 5, dark 3, logotype 2). Sections 13 and "Batch 9" keep them, marked superseded.
- **What it doesn't do:** retire anything. The 79 approved images and their layouts stay live as the taste library, the examples every new design is learned from, and for the user's own picks.
- **Why:** the per-category rule kept rolling the same skeletons across the site. Batch 8 round 1 rolled approved looks out to 25 new articles and 7 passed; batch 9's round 0 offered `checkcard` and `titlebox` from other categories and got "these have already been used".
- **Code:** `scripts/usage.mjs` (`blocked` refuses any used layout, `freeFor` returns only the layouts not used yet), `plan.mjs` (prints the not-used-yet list and the used count), `render.mjs` (VARIETY CHECK FAILED names where the layout is used and lists the ones not used yet); `REPEATABLE` and the caps were removed from `layouts.mjs`. The refusal suite went from 343 cases / 362 steps to 339 / 353 (the cap cases removed, the usage cases rewritten for no reuse).
- **Where it stands:** only 2 layouts are still unused on the site (`before-after/default`, `logotype/default`), so nearly every new article needs a new layout, built as a new mode or variant with its own example.
- Taste principle 46 "Every article a new design; the approved images are the library"; V36 in agents.md; Self-Critique row "New design".

### The taste training

- **The data:** `references/taste-data.json`, 734 designs across batches 1–9 (697 the user judged, 37 cut before they saw them): 181 approved, 97 final, 355 disapproved, 64 no-verdict, 37 retired before they were shown. Each has its features (article type, source, field, object, logo treatment, figures and their home, composition, scale, shapes, hierarchy, heading size, words) and the user's words. 571 count for training (approved or final against disapproved; no-verdicts, "ref" re-renders and replaced finals are left out).
- **The model:** `scripts/taste.mjs`. `predict <design.json>` applies 8 vetoes the user (almost) never approved (props, devices or clip-art; a figure alone on the field; decorative shapes; 3D; a cover from a site the user never named; another brand's gradient; a code dressed as a logo tile; scattered pieces) and 2 current rules (no prices on a vs unless the title is about pricing, principle 37; at most one figure on a cost image, principle 41), gives a learned logistic score (one weight per feature value, newer batches weigh more), names the closest approved and rejected designs with the user's words, and runs the novelty check. `novelty`: a new skeleton must differ from every live and retired layout on at least 2 of the 4 axes (object, composition, logo treatment, figure home). `batch <plan.json>`: every design in a batch new, distinct within the batch, and predicted to pass. `eval`, `add <records.json>`, `stats`, `selftest` (run by `test-examples.mjs`).
- **The grammar:** `references/taste-grammar.md`, read fully before every batch: the taste DNA with approval rates, per article type, the parts library, the recipe for inventing a new design, 48 starting skeleton ideas, the vetoes, the descriptor format, and how the training continues.
- **How good it is, honestly:** `eval` trains on earlier batches and predicts each later one. Held-out ranking AUC 0.693; 70% right over 382 held-out verdicts (batch 5 58%, batch 6 71%, batch 7 78%, batch 8 63%, batch 9 54%). When it predicts approve it is right 45% of the time, against a 28% base rate, and it finds 35% of the approvals. It is a filter and a ranker, not a judge: a veto or a predicted reject is strong evidence; a predicted approve only means "worth showing".
- **What it can't judge:** it reads a descriptor, not pixels, so it can't see craft (balance, spacing, scale, a radius off), how faithfully a reference was copied, whether the concept fits the article, or a wrong fact; and a design honestly described differently from how it looks fools it. The Self-Critique, both QA agents and the user's eye still decide. Its weakest batches (5 and 9) were the ones where the user's taste moved (props, then found covers and inventions).
- **The learning loop:** after every review round, every judged option (approved, disapproved, unmarked) becomes a record and goes in with `taste.mjs add`; then `taste.mjs eval`, and a note in the batch lessons on whether the predictions held. Rejected new layouts are retired, approved ones kept; a pattern that reaches 0–2 approvals over about 6 judgements becomes a veto with a refusal case and a principle (SKILL.md, Keep Learning step 4; agents.md, the Learner step).
- **Counts (Oct 28 2026):** 47 modes / 78 layouts; 156 retired; 87 examples; 79 approved; refusal suite 339 cases / 353 steps; taste 46 principles; taste data 734 designs.
