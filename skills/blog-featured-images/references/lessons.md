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
| Big batches (10+) | If the user asks for a workflow: `pipeline(articles, maker, qa)` so each article reaches QA as soon as it's rendered | Waiting for every Maker before QA starts |

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
- **Pair the background with the illustration:** grey-heavy → `sky`; a floating white card → `g5`; a big blue mass (hub tile) → `cream`/`paper`; an app window → `sky`; a thin timeline → `cream`.
- **The vibrant blue only carries a big white card** (checklist, versus/table, window, before-after/flow). No drop shadows on blue or black; minimal, field-tinted shadows on light fields.
- **Logos:** a logo fills ~65% of its tile and an app icon becomes the tile. Best-of hubs show logos only.
- **Grain:** heavy on blue, fine on `sky`, `paper`, `g5`; none on `cream`.
- **Minimal wins:** whitespace beats filler; 15 words is the cap.
- **Prefer a visual over a text card:** icons, logos, arrows and checked items read faster than sentences.
- **Borrow a reference's structure only where it carries real content.** Comparisons have a natural visual (two logos, one VS); that is why the headline layouts are comparison layouts.
- **Show options side by side, once.** For any style or placement change, render 2–3 options together and let the user pick.
- When asked whether an image reflects the article, answer with a table mapping every element on the image to the sentence it came from.
- Approved rules win over QA suggestions that break them; say so in the fix message.

## 5. Variety Must Be Structural

- One site-wide history per brand counts every render, wherever its folder is.
- Layout identity (mode + variant) is the rule, and QA does the visual side-by-side (pixel similarity can't tell layouts apart).
- With 26 layouts used site-wide, a layout repeats only after all 26 are used; a favourite may come back sooner only with a written reason, within its limit. When the least-used tier already has one use each, add a variant **before** briefing Makers.
- **Finalize every delivered image** (`scripts/finalize.mjs`). Delivered images are permanent: they stay in the history and the ledger, keep counting for rotation, and can't be re-created. Never delete the history file.
- An article that already has a delivered image is not re-imaged unless the user explicitly asks; then it gets a **different** layout than before, and the old files are backed up to `featured-images/_previous/<label>/` first.

## 6. What the First Real Batch Taught (17 Articles)

- **Qualifiers got dropped:** "$140/mo minimum" lost "per provider", "96% collection rate" lost "up to". Copy the article's qualifier with the figure. This is why facts have their own QA agent: a fact error hides easily behind a good-looking image.
- **A breakdown contradicted its hero** ("4–9%" hero, "3–6%" row). Rows must sit inside the hero's range.
- **A one-brand image for an X vs Y article** (dark layout) looked like an ad. Comparisons always show both products.
- **Review rounds:** an interactive review page (before | fixed, Approve / Needs change / Pick A·B, a note per image) made feedback fast; turn each note into a prompt before acting.
- **Not every QA fix is wanted:** a tighter window, a pointer callout and bigger logo badges were all rejected ("before is better"). When a fix changes the look, show it next to the original first.
- **The user dislikes `versus/logos`** (removed) and loves `versus/slash`, `versus/connect` and `versus/duo` (each may repeat up to 5 times across the site, each repeat with a reason); `versus/pills` may repeat up to 2 times. Single-product articles use `logotype` when the logo is black with strong typography (up to 2 across the site, each repeat with a reason), otherwise `dark` (up to 3).
- **Match the user's references exactly, detail by detail:** the duo and dark layouts drop the site mark (dark shows the product's own icon in `#0A0A0B` on a white tile), dark's text starts at x 120 for balance, and logotype's icon sits on a black tile. Missing one detail from a reference cost a review round each time.
- **Review fixes that stayed:** the focus card is wide (1120px) with its heading nudged 3px left to look centred; the stat number is a soft blue gradient, not navy; the prompt paints a light-blue gradient field with a strong glow (a plain field looked bland); slash's dot grid stays clear behind the names; an X vs Y table may go on the vibrant blue; one weight, Inter 500 Medium, for all text in pills, connect, duo and dark; the pills headline is all near-black, its logos always sit on white circles, and its shapes copy the reference exactly (flat outer cuts, tips 57% of the height apart, subtle gradient + fine noise; measure the reference's pixels rather than eyeballing) (pills only for brands whose logo works on white, up to 2 across the site, each repeat with a reason); the connect headline is all near-black and its tiles are the brands' own app icons in their original colours (connect only when both brands have one); slash names are always two-tone, white + the brand colour ("ADVANCED**MD**"), at their current auto-fit size (the user approved it as is).
- **Logo chain surprises:** a brand's "icon" can be a stale anniversary badge (Availity) or a pale grey wordmark (Sectra). Check every logo by eye; use the official site icon from the brand's website when needed.
- **Work in the project folder.** One batch rendered into a temporary scratch folder; delivered images must live in the project's `featured-images/` (finalize also keeps a copy in `~/.blog-featured-images/delivered/`).
- **Fix the skill, then publish:** renderer fixes made during a batch go into the skill and are pushed, never left as local patches.

## 7. Facts Come From the Raw Text

- Use the article's own wording for names and numbers; QA compares every value against the article file.
- Raw article text (agent-browser) beats a summary (WebFetch) for checking facts.
- Never invent sample values (patient names, drugs); use the article's own words.

## 8. The Gumloop layouts (Oct 2026)

- Six layouts were built from the user's Gumloop references (versus/type, versus/tiles, versus/glass, swap, badge, brandline); brandline was later retired, leaving five. Approved fields only: type light/blue, tiles blue/black/light, glass light/black, swap light/black, badge light (the renderer refuses the rest).
- The user's review notes that stayed: "vs" vertically centred between the names; patterns (dot grids, the tiles ring) kept sparse and faint ("pattern is too much"); the "+" grid is fine as is (later refined: on dark fields it is bright and crisp, only around the edges).
- Rejected: versus/type on black, badge on the blue field, brandline in any look but the glow field with a black centred headline (the tint and deep navy looks, blue headline ink, the Med Software Hub mark and name, the low headline position). Glass on the blue mesh was approved in round 2, then taken off blue in the approved-templates review (glass is light and black only).
- Inline `style="background:url("…")"` breaks on the inner double quotes: put data-URI backgrounds in a `<style>` block (the `glBg` helper).
- A per-image review page (Approve / Disapprove + a note, saved to the page's database) made the decisions fast; read them back with ArtifactData.
- First test run (6 articles, full Maker + QA flow) fixed in the renderer: swap labels capped inside x 210-1390; the pale-wordmark darkening only touches free-standing pale ink (SAP's white letters stay white); the glass bar stays inside the card; glass sizes both wordmarks by their measured lettering height (type, not icon) and refuses lockups wider than 9:1 ("GLASS LOGO CHECK FAILED"); the vibrant refusal names black layouts too.
- Glass needs wordmarks that name the products (a parent mark like SAP for SAP Business One fails Fact QA); use tiles or type for those. Badge values stay short (abbreviate thousands as K). Swap labels carry the title's subject ("Old EMR" -> "New EMR").

## 9. Batch-3 review (Oct 2026)

- The user judges variety across EVERY image they have seen, not per category: a layout they recognise from an earlier batch ("this template is already used") is rejected even in another category. Prefer layouts the user hasn't seen recently.
- versus/tiles: the batch-3 rule (filled icons only) was replaced in the approved-templates review by: both tiles filled, or both white, never one of each.
- When the user asks for a comparison layout on a duplicate-topic article, their request beats the same-topic rule: drop the "topic" and use a versus variant the first article didn't.
- Single-topic "what is X" articles may use `dark` with `panelIcon` (no product logo, no site mark).
- Stack: keep it to the title plus one lead line when the lead already carries the figure ("too much text").
- Batch-3 round 2: the user LOVES `dark` but only with a real product logo: never on a topic article with an icon ("icon is not looking good"). Save it for single-product articles.
- Nearly every layout has now been seen by the user; when the least-used set runs dry, build new originals in the same family rather than repeat (Oct 2026: `receipt` and `definition` approved in batch 3; `versus/split` and `versus/duet` built but the user passed on both, so they're out of the rotation (layouts.mjs); `versus/rows` rejected).
- Batch-3 round 5: the user disapproved `versus/rows` (both fields), `versus/table` and `versus/overlap` for Clinisys vs CompuGroup Medical, then dropped the image ("forget about it"). Don't offer `versus/rows` again unless asked. Receipt headlines are black (#0A0A0B) by the user's request, not navy.

## 10. Approved-templates review (Oct 2026)

- The user reviewed all 31 approved templates on one page (Keep / Needs change + a note): 24 kept, 7 changed. Every note became a principle in `references/taste.md`, which is now required reading with a Self-Critique for Makers and Visual QA.
- Changed: focus headline weight matches the other card headlines (semibold 600, then black in round 7); stat number capped at 150px with a bigger card; receipt headline semibold 84px; swap's "+" grid on black only frames the edges (made bright and crisp in round 7); tiles both filled or both white; glass off the blue field; brandline retired (a background with only a headline). The glow field and the blue mesh are kept in `references/fields/` for a future illustration.
- When options were needed (stat, swap, receipt), the orchestrator picked them using taste.md and showed its reasoning; the user can still overrule on the review page.
- Round 7: the focus headline went black ("not blue"); the swap grid on black was faded to invisible in round 6 when the note meant brighter: now crisp and only around the edges. Read a note in its context and fix by the amount asked (taste 11).
- Variety is site-wide (Oct 2026): "I don't want you to repeat any illustration, only repeat if it makes actual sense." The renderer and planner count every image on the site; a favourite repeats only with a written reason (`#reason` / `repeatReason`), shown in the plan.

## 11. Batch 4: fresh redo of 10 (Oct 2026)

- Approved with "wow love it, everything is perfect": `shortlist` (new; notepad on the left, black headline right, blue Rx sticker on the pad), `definition`, `versus/glass` (Clinisys wordmark vs the CGM sphere emblem), `versus/tiles` (both white, blue field), `versus/type`.
- Rejected: `folder` ("I like the background, the glass effect and the logos, but not the layout"; retired from layouts.mjs). The user's reference for lists: one centred row of square white logo tiles, a big faint shape behind it, no headline. Built as `lineup` (on the glow field with frosted glass).
- Rejected: a second `versus/pills` ("this template is already being used"), even with a written repeat reason. Favourite repeats are not welcome either: build a new layout instead (`versus/scale`, a level balance scale holding both logo tiles).
- Renderer fixes: the same-topic check ignores superseded images; glass sizes a near-square emblem at ~1.35x the wordmark's height; an empty bold badge note no longer takes a gap; the shortlist "+" grid sits under the pad.
- Batch 4, round 2: `versus/scale` (a balance scale) was rejected hard ("looks like a law illustration, the concept is so bad"): no clip-art metaphors. It is retired from layouts.mjs.
- `lineup` approved with the frosted glass bar, but the user asked to delete the faint watermark ("this rectangle shape") and didn't like the plus shape. Leave `watermark` out.
- The user likes logos on frosted glass tiles "with any other bg". `versus/frost` puts them on the approved mesh (round 3, pending a pick).
- The user preferred the earlier HIPAA badge ("Most small practices $150–$750") over the Fact-QA fix ("Dedicated HIPAA platforms"), and it was restored at their request. Fact QA's note: $750 sits $1 above $749, and the two figures come from different scopes.
- Receipt: "heading placement feels off" with a centred headline. The new options are `"place": "top" | "bottom"` (pending a pick).
- NetSuite vs SAP B1 (-guide-2): asked for type on black, then "different layout". `versus/bento` was picked for its concept ("design is okay"). From 4 finishes, light won ("looks better in light") once the "+" grid was removed ("overwhelming here"). It replaced the approved type image. `versus/chat` was shown and not picked.
- Batch 4, round 3: picked the receipt with `"place": "bottom"` (headline baseline on the total line) and `versus/frost` on the light mesh (the blue mesh was disapproved). All 10 are final.
