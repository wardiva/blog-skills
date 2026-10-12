# Three-agent workflow (required)

Every featured-image request runs with three roles. One agent never both makes and approves an image: the maker can't judge its own work.

| Role | Who | Does | Never does |
|---|---|---|---|
| **Orchestrator** | The main Claude running this skill | Reads the articles and the site history, plans the batch, assigns each article a distinct layout, starts the Maker and the QA agent, loops fixes, delivers | Render or approve images itself |
| **Maker** | Subagent (Agent tool) | Writes the spec from the article's facts, renders it, returns paths + facts used | Choose its own layout, use `--force`, render into another folder to dodge a check |
| **QA** | A separate subagent (Agent tool), fresh context | Checks every image against the QA checklist and returns PASS or FAIL with exact fixes | Edit specs or render; it only judges |

## Flow

1. **Orchestrator: plan.** Read every article (the full page). Read `~/.blog-featured-images/history-<brand>.json`. Assign each article a layout (mode + variant) from the **least-used** layouts in its category, never the same layout twice in the batch, and never the same mode for articles on the same topic. Show the plan table to the user when there are more than 3 images.
2. **Orchestrator → Maker.** Start one Maker with the plan: per article, the URL, assigned layout, category, topic, slug and brand. The Maker renders **one image at a time** (the history file is shared, so parallel renders could overwrite each other).
3. **Orchestrator → QA.** When the Maker returns, start the QA agent with the image paths, specs, article URLs and history file. The QA agent must not have seen the Maker's reasoning.
4. **Fix loop.** For each FAIL, send the QA agent's fixes back to the Maker (same agent via SendMessage, or a new one), then re-run QA on the fixed images only. Stop after 3 rounds and tell the user what still fails. Never ship a FAIL silently.
5. **Orchestrator: deliver.** Show only images that passed QA, as a contact sheet, with each one's layout and the article facts used.

## Maker prompt (template)

```
You are the MAKER for blog featured images. Use the blog-featured-images skill at <skill-dir>.
Read SKILL.md, references/design-language.md and references/spec-format.md first.
For each article below, in order:
1. Read the full article at the URL. Use only its own facts.
2. Write <featured-images>/specs/<slug>.json for the ASSIGNED layout (mode + variant). Set articleTitle, brand, category, topic, slug.
   Minimal rule: one idea, 3–4 rows or 2–3 bullets, about 60 words max, no fact shown twice, nothing added to fill space.
3. Render it: node "<skill-dir>/scripts/render.mjs" <spec> --out "<featured-images>/<slug>". One render at a time.
   Never use --force. If a check fails, fix the spec within the assigned layout; if the layout itself is refused, stop and report it.
4. Open master.png and card-350x250.png and fix obvious wraps or clipping.
Articles: <list: url, layout, category, topic, slug, brand>
Return, per article: slug, layout, spec path, master.png path, card path, and the facts used (each with the sentence it came from).
```

## QA prompt (template)

```
You are the QA reviewer for blog featured images. Be strict: you pass nothing that breaks a rule.
You do not edit or render anything. You judge.
Read <skill-dir>/references/design-language.md (APPROVED, Minimal rule, Variety enforcement, Visual balance, Typography balance, Heading rule, Skeleton rule).
Inputs: image folders <paths>, specs <paths>, article URLs <urls>, site history <~/.blog-featured-images/history-<brand>.json>, and the folders of every other image in the same category <paths>.
Check every image against the QA checklist in references/agents.md. Look at the actual PNGs, not just the specs.
Return, per image: PASS or FAIL, and for each FAIL the rule broken and the exact fix (e.g. "cut bullet 3", "shorten row 2 to 'Quote only'", "layout window/default repeats emr-cost-vendor-prices: use stat/default").
```

## QA checklist (the QA agent checks all of it)

**1. Layout never used twice**
- In the site history, no other image in the same category has this layout, unless every layout has already been used (then it must be one of the least-used).
- Put this image's 350×250 card next to every other card in the category. If any two read as the same skeleton (same block arrangement), FAIL, even if the mode names differ.
- Articles on the same topic use different modes.

**2. Easy to scan**
- At 350×250 the topic is clear in 2 seconds, with one clear focal point.
- Real words only, no jargon the article doesn't use.

**3. Less text (minimal)**
- About 60 words or fewer on the whole image, 3–4 rows or 2–3 bullets at most.
- No fact shown twice, and nothing added just to fill space.

**4. Visually balanced**
- Headline 56–76px and no wider than about 760px. Free-standing body text is at least 32px; text inside a mock app window stays UI-sized.
- Even spacing, all four corners anchored, hero at or slightly above the centre.
- Nothing wraps, clips or overlaps, and every word is inside x 210–1390.
- Badges, cursors and chips never touch text.

**5. True to the article**
- The heading mirrors the blog title's own words, shorter.
- Every number and name appears in the article.

**6. In the design language**
- Approved backgrounds, white cards, blue accent, warm-grey/blue labels, grain.
- No dark backgrounds, no AI-looking art, and no rejected patterns (see the "Rejected" notes).
