# Lessons learned

Read this before every batch.

## 1. Speed (the top priority)

| Job | Fast way | Slow way (don't) |
|---|---|---|
| Read articles | `scripts/read-articles.mjs` (agent-browser, all URLs in parallel, full raw text in seconds) | WebFetch one URL at a time (slow, and it summarises, so facts get lost) |
| Pick layouts | `scripts/plan.mjs` (usage table, then reserve the whole batch in one command) | Render, get "VARIETY CHECK FAILED", re-plan, render again |
| Make images | All Makers started in one message, in the background | Makers one after another |
| QA | One QA agent on one `scripts/sheet.mjs` contact sheet | QA opening every image one by one |
| Fixes | `SendMessage` to the same Maker or QA agent | A new agent that has to re-read everything |
| Big batches (10+) | If the user asks for a workflow: `pipeline(articles, maker, qa)` so each article reaches QA as soon as it's rendered | Waiting for every Maker before QA starts |

- Never sit idle while agents run; prepare the next step. Deliver each image as soon as it passes. One-line progress updates.
- Give agents only what they need: the article file, the spec-format section for their layout, the approved images.

## 2. Tool gotchas

- Long Python or JS inside a bash heredoc breaks on quotes. Write a script file and run it.
- Paths with spaces: never pass them through a shell. Call `node <tool>.js` directly or use an env var such as `AGENT_BROWSER_EXECUTABLE_PATH`.
- agent-browser's daemon keeps child pipes open; finish on process **exit**, not pipe close.
- Parallel headless Chrome renders crash if they share one `--user-data-dir`. The renderer uses one profile per process.
- Brandfetch's logo CDN needs a client ID, must be hotlinked, and blocks the "HeadlessChrome" user agent (the renderer sends a normal one). Some brands (NetSuite, SAP, Sage, Epicor) have no symbol, only an icon; the chain handles it.
- A message sent to an agent just as it finishes may be dropped. If no reply comes, send it again.

## 3. Pre-flight before briefing Makers

- **Count:** does the layout hold as many items as the article has (a "7 best" article needs 7 hub tiles)?
- **Names:** will the article's own product names fit? Never abbreviate a name the article doesn't.
- **Title words:** headline-less layouts (hub, before-after, most versus variants) carry the title's key words, e.g. the hub tile "7 Best ERP".
- **Renderer bugs are the Orchestrator's job.** Fix the code once so every future image benefits; Makers only change specs.

## 4. Taste

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

## 5. Variety must be structural

- One site-wide history per brand counts every render, wherever its folder is.
- Layout identity (mode + variant) is the rule, and QA does the visual side-by-side (pixel similarity can't tell layouts apart).
- With 19 layouts, a category repeats after about 17 images (more with the repeatable favourites). When the least-used tier already has one use each, add a variant **before** briefing Makers.
- **Finalize every delivered image** (`scripts/finalize.mjs`). Delivered images are permanent: they stay in the history and the ledger, keep counting for rotation, and can't be re-created. Never delete the history file.
- An article that already has a delivered image is not re-imaged unless the user explicitly asks; then it gets a **different** layout than before, and the old files are backed up to `featured-images/_previous/<label>/` first.

## 6. First real batch (17 articles)

- **Qualifiers got dropped:** "$140/mo minimum" lost "per provider", "96% collection rate" lost "up to". Copy the article's qualifier with the figure.
- **A breakdown contradicted its hero** ("4–9%" hero, "3–6%" row). Rows must sit inside the hero's range.
- **A one-brand image for an X vs Y article** (dark layout) looked like an ad. Comparisons always show both products.
- **Review rounds:** an interactive review page (before | fixed, Approve / Needs change / Pick A·B, a note per image) made feedback fast; turn each note into a prompt before acting.
- **Not every QA fix is wanted:** a tighter window, a pointer callout and bigger logo badges were all rejected ("before is better"). When a fix changes the look, show it next to the original first.
- **The user dislikes `versus/logos`** (removed) and loves `versus/slash`, `versus/connect` and `versus/duo` (each may repeat up to 5 times per category; duo has no site mark). Single-product articles use `logotype` when the logo is black with strong typography (up to 2 per category), otherwise `dark` (up to 3).
- **Logo chain surprises:** a brand's "icon" can be a stale anniversary badge (Availity) or a pale grey wordmark (Sectra). Check every logo by eye; use the official site icon from the brand's website when needed.
- **Work in the project folder.** One batch rendered into a temporary scratch folder; delivered images must live in the project's `featured-images/` (finalize also keeps a copy in `~/.blog-featured-images/delivered/`).
- **Fix the skill, then publish:** renderer fixes made during a batch go into the skill and are pushed, never left as local patches.

## 7. Facts

- Use the article's own wording for names and numbers; QA compares every value against the article file.
- Raw article text (agent-browser) beats a summary (WebFetch) for checking facts.
- Never invent sample values (patient names, drugs); use the article's own words.
