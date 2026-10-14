# Checks and Tests

Every check below exists because the user caught a real image breaking the rule. When a new note can be measured, it becomes a check here, so the user never has to give it twice. Run the regression after every change.

## The Regression Test (Required After Every Change)

```bash
node <skill-dir>/scripts/test-examples.mjs            # render every example with the current rules
node <skill-dir>/scripts/test-examples.mjs --refresh  # also re-render every approved reference image
```

- It renders every `examples/*.json` into a temporary folder **without `--force`**, so every check that needs no history runs: retired layout, category, field and background (`FIELD FIT`, `BACKGROUND CHECK`/`FIT`, `VIBRANT FIT`, `CHECKLIST FIELD`), heading, text, content, fairness, the logo checks and logo files. An example the rules refuse fails here, and a failing example means a change broke a layout. The real site history, the user's record and delivered images are never touched.
- Each example renders with its own empty history and ledger and an empty usage record (`FEATURED_USED_FILE`), so the result is the same on every run and the live site's used layouts never refuse a fixture (with a shared history, the renderer's "neighbours differ" background rule made the field depend on which parallel render finished first). Run `--refresh` twice and compare if you change the harness: the two runs must match exactly.
- The checks that need a history (`VARIETY`, `VIBRANT CHECK`, `SERIES`, `FINAL IMAGE LOCKED`) can't fire on an empty one: test them with a real render against a copied history (`FEATURED_HISTORY_DIR` pointing at a scratch copy), never with `render.mjs --check-only`, which stops after the logo checks.
- `--refresh` rebuilds every image in `references/approved/` from the example named in `references/approved/sources.json`. Run it whenever a rule changes how an approved layout looks, then compare old and new side by side: a difference you didn't intend is a regression (the swap labels drifted apart this way and were caught).
- A new approved image always gets an example spec and a line in `sources.json`, so it can never go stale.

## Refusals (the renderer stops and says why)

The renderer checks in this order: retired layout, unknown mode or variant, missing category, `field` (`FIELD FIT`), `bg` on a layout that paints its own canvas (`BACKGROUND CHECK`), the heading; then the logo checks (`LOGOTYPE`, `PILLS LOGO`, `CONNECT LOGO`, `TILES LOGO`, `SLASH NAME`, `GLASS LOGO`; `--check-only` stops here); then `CHECKLIST FIELD`, a `bg` that doesn't exist (`BACKGROUND CHECK`), `CONTENT`, `FAIRNESS`, `FINAL IMAGE LOCKED`, `VARIETY` (same topic, then the category and the site-wide cap), `VIBRANT CHECK`, `SERIES`, `VIBRANT FIT`, `BACKGROUND FIT`; and `TEXT` last, once the page is built. `LOGO FILE MISSING` fires wherever a local logo file is first read (in the logo checks, or when the page is built).

| Check | What it enforces | The feedback behind it |
| --- | --- | --- |
| `RETIRED LAYOUT` | `brandline`, `folder`, `versus/scale`, `versus/chat`, `versus/split`, `versus/duet`, `versus/rows`, `versus/logos` never come back (render.mjs and plan.mjs, before any other check) | Each was rejected in review ("the bg looks good, but not like this with just a title"; clip-art metaphors; disapproved versus variants) |
| `Unknown mode` / `Unknown variant` | Only the 19 modes / 30 layouts in `scripts/layouts.mjs` | A typo must never render some other layout |
| `CATEGORY MISSING` | Every spec names its category; there is no fallback (the brand name is no stand-in) | A layout is used once per category, so the check needs one |
| `HEADING CHECK FAILED` | The heading reuses the blog title's own words, shorter | Creative headings drifted from the article |
| `TEXT CHECK FAILED` | ≤ 15 words, ≤ 7 per element, no sentences | "Minimal"; "too much text" |
| `VARIETY CHECK FAILED` | Once per category, not-used-yet first; usage = `used-layouts.json` + every image rendered (drafts too), reserved or delivered after its `recordedAt` that isn't superseded (SKILL.md §3). Site-wide caps on top: slash, connect, duo 5; dark 3; pills, logotype 2. Only the user's pick (`<slug>=<layout>!` in plan.mjs, honoured at render, or `--user-pick`) skips it. It also refuses a mode a same-topic article already uses, and nothing skips that | The user's rule (Oct 2026, SKILL.md §3); pills "max 2 times" |
| `BACKGROUND FIT FAILED` / `BACKGROUND CHECK FAILED` | Each card layout only takes the fields that flatter its illustration; a background that doesn't exist is refused, and so is any `bg` on a layout that paints its own canvas ("… paints its own canvas") | Fields that fought the illustration; a `bg` that silently did nothing |
| `VIBRANT CHECK FAILED` / `VIBRANT FIT FAILED` | At most 1 in 3 vibrant per category, never neighbours; the blue only behind a big white card | Blue-heavy illustrations on blue became a blob |
| `SERIES CHECK FAILED` | The site mark appears rarely, card layouts only | "Delete the medhub logo" on headline layouts |
| `CONTENT CHECK FAILED` | Enough real facts to fill the frame | Empty-looking windows and cards |
| `FAIRNESS CHECK FAILED` | `dark` is refused when the title contains "vs" or "versus": an X vs Y article shows both products | A one-brand image "looks like an ad" |
| `PILLS LOGO CHECK FAILED` | Both logos sit on white circles | "Logo bg should always be white" |
| `CONNECT LOGO CHECK FAILED` | Both tiles are the brands' own app icons | "Logo should always be its original colour" |
| `TILES LOGO CHECK FAILED` | Both tiles filled, or both white, never one of each | "Either both white or both with logo colour" |
| `GLASS LOGO CHECK FAILED` | Wordmarks compact enough to read on the bar | NetSuite's 13:1 lockup was unreadable |
| `SLASH NAME CHECK FAILED` | Every name two-tone, white + brand colour | "Two colours, one white compulsory" |
| `LOGOTYPE CHECK FAILED` | A black logo with a separate icon for the black tile | "Without the tile the balance is off" |
| `FIELD FIT FAILED` | Gumloop layouts only on their approved fields (type light; tiles blue, light; glass light, black; swap light; badge light; frost and bento light); `field` on any other layout is refused (prompt takes only `"soft"`) | Type on black, badge on blue, glass on blue were rejected; type on blue, tiles on black and swap on black were deleted in the approved review ("Delete") |
| `CHECKLIST FIELD FAILED` | The checklist goes on the vibrant blue only; the renderer sets `bg: "blue"` itself and refuses any other `bg`. It still counts as vibrant (1 in 3, never neighbours) | "Delete" on the checklist on a light field (approved review, Oct 2026) |
| `LOGO FILE MISSING` | A local logo file named in the spec exists at that path (relative to the spec) | Examples that broke for other installers |
| `FINAL IMAGE LOCKED` | Delivered images are never re-created | "Those exact ones can't be created again" |

## Built-in Rules (applied automatically, no refusal)

| Rule | The feedback behind it |
| --- | --- |
| Every headline black `#0A0A0B` (white on the black and blue fields), hard-coded for every brand; a brand file's `headline` other than `#0A0A0B` is ignored with a warning | "Black, not blue", asked four times |
| Headline layouts (pills, connect, duo, dark) set every word in Inter 500 Medium | "Use same font weight 500 medium everywhere" |
| Connect headline on one line, centred above the divider | "2 lines look visually off" |
| Stat number capped at 150px; the card grows to match; no gap for an empty card heading | "4–9% too big, illustration too small" |
| Receipt headline semibold, at most 84px | "The heading makes the balance off" |
| Swap: both text labels share one size | Sameness within an image (caught by the regression) |
| Edge-only patterns (`shortlist` "+" grid, `lineup` dots) are masked clear behind the content (`GL_EDGE_MASK`); `versus/slash` masks its dot grid on black the same way | "Too dark, light it, not in the whole image"; then "not visible"; "should not be in all area" |
| Dot grids, rings and patterns stay sparse and faint, never dense or dark; `versus/bento` has none | "Pattern is too much"; "delete pattern from bg" (bento) |
| Dark: text at x 120; the product's icon in `#0A0A0B` on a white tile top-left | "Left padding is too much"; "should be the product's logo" |
| Pills: flat outer cuts, tips 112px apart, subtle gradient + noise | The user's reference, measured |
| Slash names keep their auto-fit size | "Perfect", never enlarge |
| No shadows on blue or black fields | Shadows looked heavy on vibrant fields |
| Frost: each mark fills 48% of its glass tile (was 60%) | "The icons are too big and this is why visual balance off, improve" |

## Planning Tools

| Tool | Use |
| --- | --- |
| `scripts/logo-check.mjs <domains>` | Before reserving pills, connect, glass, tiles or logotype: which layouts each brand's logos allow (same checks as the renderer) |
| `scripts/plan.mjs` | Per category: "Not used yet (first in line)", "Used only in other categories", "Not again in <category>"; reserves one category's articles with `--reserve <slug>=<mode>[/<variant>][!][@<topic>] ...` (`!` = the user's pick for that slug); `--release <slug> ...` drops unrendered reservations. Refuses with "PLAN REFUSED" or "RELEASE REFUSED" (nothing written) |
| `scripts/usage.mjs` | The shared usage rule for render.mjs and plan.mjs (SKILL.md §3): the site history, the user's brand-scoped record, normalised categories, and the lock that parallel renders, plans and finalizes share. Prints "USED-LAYOUTS WARNING" for record entries it can't apply as written |
| `references/used-layouts.json` | The user's own record, kept on the Template Usage page (https://claude.ai/artifact/8wxx5rif2nNTk81bzgaQ6q), for one brand (`"brand"`). Sync it as in SKILL.md, Workflow step 2, then push |
| `scripts/sheet.mjs` | QA contact sheet of the whole site (or one category); `--highlight <slug1>,<slug2>` frames the batch. The user sees every image together, so a look-alike anywhere is visible |
| `scripts/finalize.mjs` | Locks delivered images and stores a copy |
| `scripts/test-examples.mjs` | The regression above |
