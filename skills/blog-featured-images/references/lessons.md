# Lessons learned (user sessions, 2026-10-13)

Read this before every batch. Each lesson cost at least one extra round with the user; don't repeat them.

## 1. Speed (the user's top priority: "WORK FAST", "do anything to complete the task as fast as possible")

**Use the fast tools, always:**

| Job | Fast way | Slow way (don't) |
|---|---|---|
| Read articles | `scripts/read-articles.mjs` (agent-browser, all URLs in parallel, full raw text in about 3 s per batch) | WebFetch one URL at a time (slow, and it summarises, so facts get lost) |
| Pick layouts | `scripts/plan.mjs` (usage table, then reserve the whole batch in one command) | Render, get "VARIETY CHECK FAILED", re-plan, render again |
| Make images | All Makers started **in one message**, in the background | One Maker for many articles, or Makers one after another |
| QA | **One** QA agent on one `scripts/sheet.mjs` contact sheet | QA opening 16+ images one by one (one review took 226 s) |
| Fixes | `SendMessage` to the same Maker or QA agent (it keeps its context) | A new agent that has to re-read everything |
| Big batches (10+) | If the user asks for a workflow, the **Workflow** tool: `pipeline(articles, maker, qa)` so each article goes to QA as soon as it's rendered | Waiting for every Maker before any QA starts |

**Work habits:**
- **Never sit idle while agents run.** Prepare the next step (contact sheet, docs, the next batch's plan) in the meantime.
- **Deliver as soon as an image passes.** Send it right away, then keep working.
- **One-line progress updates.** No long explanations mid-task.
- **Give agents only what they need:** the article file, the spec-format section for their mode, and the Minimal rule. Reading every rulebook in full costs minutes.
- Mechanical Maker work can run at lower effort; QA is the step that needs care.

**Windows and tool gotchas** (each one wasted a round):
- Long Python or JS inside a bash heredoc breaks on quotes. Write a script file and run it.
- Paths with spaces ("Program Files"): never pass them through a shell. Call `node <tool>.js` directly, or use an env var such as `AGENT_BROWSER_EXECUTABLE_PATH`.
- agent-browser's daemon keeps child pipes open. Finish on process **exit**, not pipe close, or the call hangs.
- A message sent to an agent just as it finishes may be dropped. If no reply comes, send it again.
- Parallel headless Chrome renders crash (exit 21) if they share one `--user-data-dir`. The renderer now uses one profile per process, so 3 renders take about 4 s in parallel.
- Brandfetch's logo CDN needs a client ID (`?c=`) and must be hotlinked, not downloaded. Without an ID it redirects to its guidelines.

## 2. Pre-flight before briefing Makers (prevents most QA failures)

QA failures in the test traced back to things the Orchestrator could have checked first:
- **Count:** does the layout hold as many items as the article has? (The hub held 6; the article had 7 products.) If not, extend the renderer first.
- **Name length:** will the article's own product names fit? (At 29px, "SAP Business One" needed 320px cards.) Never abbreviate a name the article doesn't abbreviate.
- **Title words:** layouts without a headline (hub, before-after, versus) need the title's key words somewhere, such as the hub tile label "7 Best ERP".
- **Renderer bugs are the Orchestrator's job.** Makers only change specs. Fix the code once, so every future image benefits.

## 3. Taste (what the user approved and rejected)

- **Minimal wins.** The plain window with whitespace was "really good minimal". The same window with bars added to fill the space was "ugly". Never fill space.
- **Show options side by side, once.** The VS badge position took 3 rounds of one-at-a-time changes. One A/B/C sheet up front would have taken 1. When a change is about placement or style, render 2–3 options together and let the user pick.
- **Approved VS badge:** blue gradient, white "VS". On overlap cards it sits on the seam. On the table it sits where the header line crosses the column line, with **no glow** (white ring and a faint neutral shadow).
- **Rejected:** split colour fields, small grey chips, badges straddling a card edge, heavy blue shadows, dark backgrounds, AI-looking art.

- **Less text is forced.** At most 30 words (renderer-enforced). The 7 Best ERP hub failed the user's eye with prices under every name: on a "best of" list the names are the story. Ask of every line: "is this the point of the article?" If not, cut it.

## 4. Variety must be structural

- Two images were "exact same" because the old check only knew one output folder. Now one site-wide history per brand counts every render (`~/.blog-featured-images/history-<brand>.json`).
- Pixel-similarity hashing was tested and **doesn't work** here: the same window layout scored 0.11 because background and position swamp the structure. Layout identity (mode + variant) is the rule, and QA does the visual side-by-side.
- With 11 layouts, a category repeats after 11 images. Add variants before a category gets there.

## 5. Facts

- Use the article's own wording for names and numbers. QA compares every value against the article file.
- Raw article text (agent-browser) beats a summary (WebFetch) for checking facts.
