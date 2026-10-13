# Lessons learned

Read this before every batch. Each lesson cost at least one extra round with the user; don't repeat them.

## 1. Speed (the user's top priority: "WORK FAST")

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

## 2. Tool gotchas (each one wasted a round)

- Long Python or JS inside a bash heredoc breaks on quotes. Write a script file and run it.
- Paths with spaces: never pass them through a shell. Call `node <tool>.js` directly or use an env var such as `AGENT_BROWSER_EXECUTABLE_PATH`.
- agent-browser's daemon keeps child pipes open; finish on process **exit**, not pipe close.
- Parallel headless Chrome renders crash if they share one `--user-data-dir`. The renderer uses one profile per process.
- Brandfetch's logo CDN needs a client ID, must be hotlinked, and blocks the "HeadlessChrome" user agent (the renderer sends a normal one). Some brands (NetSuite, SAP, Sage, Epicor) have no symbol, only an icon; the chain handles it.
- A message sent to an agent just as it finishes may be dropped. If no reply comes, send it again.

## 3. Pre-flight before briefing Makers

- **Count:** does the layout hold as many items as the article has (a "7 best" article needs 7 hub tiles)?
- **Names:** will the article's own product names fit? Never abbreviate a name the article doesn't.
- **Title words:** headline-less layouts (hub, before-after, versus) carry the title's key words, e.g. the hub tile "7 Best ERP".
- **Renderer bugs are the Orchestrator's job.** Fix the code once so every future image benefits; Makers only change specs.

## 4. Taste: what the user approved and rejected

- **Visual appeal decides.** An image that passes every check can still fail. Judge with a taste skill (impeccable) before sending.
- **Pair the background with the illustration.** Grey-heavy → `sky`; a floating white card → `g5`; a big blue mass (hub tile) → `cream`/`paper`; an app window → `sky`; a thin timeline → `cream`. The hub on `g5` was "too much blue".
- **Vibrant blue only carries a big white card** (checklist, versus/table, window, before-after/flow). Stack failed (big blue icon = too much blue); versus/logos "doesn't look good" on blue even with balanced logos.
- **No drop shadows on the blue;** minimal, field-tinted shadows on light fields.
- **Logos:** an app icon shrunk inside a white tile looked "so weird". A logo fills ~65% of its tile and an app icon becomes the tile. Best-of hubs show **logos only** ("really really good").
- **Grain** heavy on blue, fine on `sky`, `paper`, `g5`; **none on `cream`** (the user wants it clean).
- **Minimal wins.** A plain window with whitespace was "really good minimal"; the same window with bars filling the space was "ugly". 30 words was still "text heavy"; 15 is the cap.
- **Prefer a visual over a text card.** A plain text card (the old stack/split) got "I DONT LIKE IT"; icons + arrow + 2 checked items won.
- **Copy a reference's structure only when it carries the article's real content.** From Chatbase, the user kept the four comparison layouts (facing pills, connected logos, black slash, black + brand colour) and deleted the decorative ones (pills beside a title, fluted panel with a card, giant number), even after two rounds of refinement. Comparisons have a natural visual (two logos, one VS); generic titles don't.
- **Headline layouts (Chatbase) were loved for comparisons;** the Gumloop-style tile/band/orbit layouts were all rejected, and so was a royal-blue field with diamonds ("doesn't look premium"). Chatbase's blue is subtle and near-solid: cloudy watercolour looked "too much and too bad". White designs need the grey frame.
- **Show options side by side, once.** For any "I don't like it" or a placement/style change, render 2–3 options together. One-at-a-time changes took 3 rounds where one sheet took 1.
- When the user asks "does it reflect the article?", answer with a table mapping every element on the image to the sentence it came from.
- Approved rules win over QA suggestions that break them; say so in the fix message.

## 5. Variety must be structural

- One site-wide history per brand counts every render, wherever its folder is.
- Pixel-similarity hashing doesn't work here (background and position swamp the structure). Layout identity (mode + variant) is the rule, and QA does the visual side-by-side.
- With 14 layouts, a category repeats after 14 images. When the least-used tier already has one use each, add a variant **before** briefing Makers.
- When the user finalizes images, record them in both the site history and the local ledger (`featured-images/.featured-ledger.json`).
- Re-running a batch on already-imaged articles: back up the old folders to `featured-images/_previous/<label>/` first, then give each article a **different** layout than last time.

## 6. Facts

- Use the article's own wording for names and numbers; QA compares every value against the article file.
- Raw article text (agent-browser) beats a summary (WebFetch) for checking facts.
- Never invent sample values (patient names, drugs) even if they look illustrative; use the article's own words.
