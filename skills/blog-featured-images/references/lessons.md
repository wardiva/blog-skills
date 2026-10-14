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
- **Title words:** headline-less layouts (hub, before-after, most versus variants) carry the title's key words, e.g. the hub tile "7 Best ERP".
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

- **Four templates deleted** (the approved review, note "Delete"): the checklist on a light field (g5/sky), `versus/type` on blue, `versus/tiles` on black, `swap` on black. Their reference images (01-checklist, 19-gumloop-type-blue, 21-gumloop-tiles-black, 26-gumloop-swap-black) and example specs were archived; `references/approved/` now has 29 images.
- **What changed in the renderer:** the checklist is blue only. The renderer sets `"bg": "blue"` itself and refuses any other `bg` ("CHECKLIST FIELD FAILED"). It still counts as vibrant (1 in 3 per category, never neighbours), so if a neighbour is vibrant, pick another layout. Field fit: type light; tiles blue, light; swap light.
- **Versus frost:** "the icons are too big and this is why visual balance off, improve". The marks went from 60% to 48% of each glass tile. 44% and 48% were rendered side by side and 48% was picked by taste: at 44% the marks looked lost in the tile.
- **The usage rule changed.** The user: "the ones that hasnt used yet can be used now if suitable for any article and the ones that have used cant be used again unless the category is different." A layout not used yet anywhere is free for any article it suits and goes first in line; a used layout can't be used again in the same category, only in a different one. This replaces the site-wide rotation and the repeat with a reason (both gone from the code; only the user's own pick, `--user-pick` or `plan.mjs` `slug=layout!`, or `--force` skips the rule). Restated on Oct 15: "the ones that are used shouldn't be used again unless the category is different. The ones that aren't used can easily be used again because they aren't used right now, obviously".
- **Site-wide caps stay on top:** pills at most 2 images in total (the user: "max 2 times"), slash, connect and duo 5, dark 3, logotype 2. Every other layout has no site-wide cap.
- **Template Usage page** (https://claude.ai/artifact/8wxx5rif2nNTk81bzgaQ6q): one card per layout, "Used" with its categories, or "Not used yet". It is the user's own record. The orchestrator reads its database with ArtifactData (collection `usage`, docs `{code, status, cats}`), writes `references/used-layouts.json` and pushes. `scripts/usage.mjs` combines that file with the site history for render.mjs and plan.mjs.
- **The record overrides the history**, because the user knows what is live on the site. For every layout it lists, the record is the truth as of its `recordedAt`: a history image for a layout marked "Not used yet" never went live and doesn't count. Every image rendered (drafts too), reserved or delivered after `recordedAt` that isn't superseded is added on top; a layout the record doesn't list falls back to the history. What is used right now is in `references/used-layouts.json` itself, never copied here.
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
- Never commit backups (`*.bak-*`), `node_modules` or secrets. The Brandfetch client ID lives only in `~/.blog-featured-images/config.json` (or `BRANDFETCH_CLIENT_ID`); `git grep` for it before every push.
- Commit as wardiva: `git -c user.name=wardiva -c user.email=wardiva@users.noreply.github.com commit ...`. Never force-push.
- An independent audit of every changed file before every push.
- Mirror the skill into the repo (`publish/blog-skills/skills/blog-featured-images`) and into `~/.agents/skills/blog-featured-images` (a separate npx install: keep its `scripts/node_modules`).
- Archive, never delete, user data.
