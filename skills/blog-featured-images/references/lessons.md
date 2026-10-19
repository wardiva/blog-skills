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
- When no layout free in the category fits a batch, add a variant **before** briefing Makers.
- **Finalize every delivered image** (`scripts/finalize.mjs`). Delivered images are permanent: they stay in the history and the ledger, keep counting as used in their category, and can't be re-created. Never delete the history file.
- An article that already has a delivered image is not re-imaged unless the user explicitly asks; then it gets a **different** layout than before, and the old files are backed up to `featured-images/_previous/<label>/` first.

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

- **History of the usage rule:** batches 1-2 rotated layouts site-wide ("I don't want you to repeat any illustration, only repeat if it makes actual sense": a repeat only after all 30 were used, or with a written reason); in batch 3 the user judged variety across every image seen; in batch 4 a written reason still didn't make a repeat welcome. The per-category rule below replaced all of it.

- **Four templates deleted** (the approved review, note "Delete"): the checklist on a light field (g5/sky), `versus/type` on blue, `versus/tiles` on black, `swap` on black. Their reference images (01-checklist, 19-gumloop-type-blue, 21-gumloop-tiles-black, 26-gumloop-swap-black) and example specs were archived; `references/approved/` then had 29 images (40 after batch 5's final round, sections 18–20).
- **What changed in the renderer:** the checklist is blue only. The renderer sets `"bg": "blue"` itself and refuses any other `bg` ("CHECKLIST FIELD FAILED"). It still counts as vibrant (1 in 3 per category, never neighbours), so if a neighbour is vibrant, pick another layout. Field fit: type light; tiles blue, light; swap light.
- **Versus frost:** "the icons are too big and this is why visual balance off, improve". The marks went from 60% to 48% of each glass tile. 44% and 48% were rendered side by side and 48% was picked by taste: at 44% the marks looked lost in the tile.
- **The usage rule changed.** The user: "the ones that hasnt used yet can be used now if suitable for any article and the ones that have used cant be used again unless the category is different." A layout not used yet anywhere is free for any article it suits and goes first in line; a used layout can't be used again in the same category, only in a different one. This replaces the site-wide rotation and the repeat with a reason (both gone from the code; only the user's own pick, `--user-pick` or `plan.mjs` `slug=layout!`, or `--force` skips the rule). Restated on Oct 15: "the ones that are used shouldn't be used again unless the category is different. The ones that aren't used can easily be used again because they aren't used right now, obviously".
- **Site-wide caps stay on top:** pills at most 2 images in total (the user: "max 2 times"), slash, connect and duo 5, dark 3, logotype 2. Every other layout has no site-wide cap.
- **Template Usage page** (https://claude.ai/artifact/8wxx5rif2nNTk81bzgaQ6q): one card per layout, "Used" with its categories, or "Not used yet". It is the user's own record. The orchestrator reads its database with ArtifactData (collection `usage`, docs `{code, status, cats}`), writes `references/used-layouts.json` and pushes. `scripts/usage.mjs` combines that file with the site history for render.mjs and plan.mjs.
- **The record overrides the history**, because the user knows what is live on the site. For every layout it lists, the record is the truth as of its `recordedAt` (or a layout's own `asOf`, which overrides it for that layout): a history image for a layout marked "Not used yet" never went live and doesn't count. Every image rendered (drafts too), reserved or delivered after that cutoff that isn't superseded is added on top; a layout the record doesn't list falls back to the history. What is used right now is in `references/used-layouts.json` itself, never copied here.
- `plan.mjs --brand <b> --category <c>` now prints three lists: "Not used yet (first in line)", "Used only in other categories", "Not again in <category>". `VARIETY CHECK FAILED` lists not-used-yet layouts first, then layouts used only in other categories.
- The site-wide QA sheet still matters: the user sees every image together, even though the refusal is per category.
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
- Batch 7 direction check: five variations built only from approved parts (badge, checklist, focus, window). Four approved (`versus/badges`, `versus/checks`, `spotlight`, `picks`); `versus/window` disapproved and retired.

## 18. Batch 5, rounds b8 and b9 (Oct 19 2026): new arrangements of approved parts

- After the direction check, the 4 approved layouts were rolled out to all 12 articles (3 images each). The user stopped it: "I want like the designs that I have approved. Those are fine. Now I want more designs for the rest of the URLs." Rule: **a design approved in a direction check is approved for the article it was shown on.** The other articles each get their own new design. Never fill a batch by repeating newly approved layouts; Visual QA B also warned that three badges side by side read as one template.
- Round b8: eight new layouts, each a new arrangement of an approved template: `versus/plans` (pricing cards), `versus/range` (one price track), `versus/center` (hub tiles into a blue word tile), `versus/rings` (score rings on a white card), `cloud` (logo pills), `ranges` (vertical price columns), `count` (big number plus a logo card), `grid` (logo tiles, the first one blue).
- Round b9 (2 options for each image the user commented on): range "i like the design but it is confusing", so `versus/lanes` replaced it; rings disapproved, so `versus/scores` replaced it; `versus/share` disapproved; `versus/sheet` and `versus/columns` were options never approved. `versus/plans` approved with "design can be improved"; its alternative options (`size lg`, `band`) were disapproved.
- **Verdict after b9 (history):** 12 layouts approved (`versus/badges`, `versus/checks`, `versus/plans`, `versus/lanes`, `versus/scores`, `versus/center`, `spotlight`, `picks`, `cloud`, `count`, `ranges`, `grid`), making 25 modes / 42 layouts then. Retired: `versus/range`, `versus/rings`, `versus/share`, `versus/sheet`, `versus/columns`, plus `versus/window` and the 12 props (26 retired then). The final round (section 20) retired `versus/plans` and `grid` too: now 24 modes / 40 layouts, 30 retired.
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
- Batch 5 final review (Oct 19 2026):
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
  - TheraNest vs Valant (`versus/badges`): "the heading of theranest and valant are too bold and big, visual hierrachy is not good and balanced". New spec options `nameSize`, `nameWeight`, `nameInk`, `valueSize`, `spread`; the approved set is 44 / 600 / 84 / `spread: true`. Without them the original look renders (the default is unchanged). Taste 1 (hierarchy).
  - AAPC Codify vs Find-A-Code (`versus/checks`): "checkboxes are not needed". `"checks": false` drops the check boxes; `"big": true` (with it) grows the logo tiles to 104px, the mark to 72px, the names to 36px. Taste 10.
  - Small Practice EMR (`ranges`): "bf color needs to be changed"; every new background was disapproved; then "use the previous bg, and in that dont add container for bars section". `"bare": true` drops the white card and darkens the tracks to `#E1E5EC`, and the renderer allows it only with `"bg": "white", "bgPick": true` ("BACKGROUND CHECK FAILED" otherwise). The old rule "light grey tracks need a white card" now has this one exception, on the white field only.
  - Pediatric EHR: `grid` got "7 best pediatric shouldnt be like other logos, this looks off"; both fixes (the heading moved out of the tiles) were disapproved; "for this use this glass version template" → re-delivered as approved `lineup`, which now takes 3–7 products. Taste 2 (a label tile is not a logo).
  - Oracle Health vs MEDITECH: stays `versus/scores` with the 2025 pair. The 2026 version had a number only for MEDITECH and "Lowest ranked" for Oracle: "ew revert it". `versus/scores` now refuses a non-numeric score ("CONTENT CHECK FAILED": a real number on both sides). The user: "show me reverted one and add that to not used cus i love the design". On the design: "i love the design but is the concept right?" (taste 19).
  - `versus/connect` (the Oracle connect preview): "delete these dot grid from top left and top right" → `"cornerDots": false`.
  - Spotlight: "perfect concept and design" (taste 20). Oracle scores: "i love the design but is the concept right?". The others: "its fine".
- **Retired in this round (30 in all now):** `versus/plans` ("i dont like the design, try smth else for comparison"), `versus/fit` (disapproved), `versus/spot` (QA: Appointment's spotlight under a new name), `grid` ("7 best pediatric shouldnt be like other logos, this looks off"; both fixes disapproved). Live: 24 modes / 40 layouts (`scripts/layouts.mjs`).
- **Usage:** `versus/scores` is marked unused in `references/used-layouts.json` with its own `"asOf"` (`2026-10-19T19:23:25.151Z`, after the delivered Oracle image's render at 18:08:12Z, so the record covers it) and a `"why"`. In `scripts/usage.mjs` a per-layout `asOf` overrides `recordedAt` as that layout's cutoff, so the delivered Oracle image no longer counts and the layout is free in every category; renders after the cutoff still count.
- **Integration:** approved references 36 (badges), 37 (checks) and 46 (ranges) were re-rendered from their updated example specs with the new options; 48 (`48-prompt-logos`, `examples/rxnt-vs-drfirst.prompt.json`) was added; 38 (`versus/plans`) and 47 (`grid`) and their example specs were archived to `~/.blog-featured-images/_archive/batch5-final-2026-10-20/`. Now 40 approved references and 48 examples. The code for `versus/spot`, `versus/fit`, `grid`, `versus/plans` and the word-score path of `versus/scores` was deleted from `render.mjs`.
- **Lessons:** names never outweigh the key figure; every element earns its place (check boxes, a container, corner dots); a heading never dresses as one more tile; paired figures are two real numbers; check the concept against the article before rendering; repeat what was praised. All are in `taste.md` (principles 1, 2, 4, 10, 18, 19, 20) and its Self-Critique.
- **Review (Oct 20):** the user pressed Keep on both open changes: the connect headline capped at 1080px (a touch smaller, inside the margins) and the frost marks at 48%. Both are settled; the review page's round was cleared. The old remote branch `batch-4-taste` (Oct 14, content already in main) was deleted at the user's request.
