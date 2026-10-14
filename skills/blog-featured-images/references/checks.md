# Checks and Tests

Every check below exists because the user caught a real image breaking the rule. When a new note can be measured, it becomes a check here, so the user never has to give it twice. Run the regression after every change.

## The Regression Test (Required After Every Change)

```bash
node <skill-dir>/scripts/test-examples.mjs            # render every example with the current rules
node <skill-dir>/scripts/test-examples.mjs --refresh  # also re-render every approved reference image
```

- It renders every `examples/*.json` into a temporary folder with a scratch history, so the real site history and delivered images are never touched. A failing example means a change broke a layout. It renders with `--force`, so it does not test the refusals (variety, field fit, checklist field): test a refusal with a real render against a copied history (`FEATURED_HISTORY_DIR`), never `--check-only`, which stops after the logo checks.
- Each example renders with its own empty history and ledger, so the result is the same on every run (with a shared one, the renderer's "neighbours differ" background rule made the field depend on which parallel render finished first). Run `--refresh` twice and compare if you change the harness: the two runs must match exactly.
- `--refresh` rebuilds every image in `references/approved/` from the example named in `references/approved/sources.json`. Run it whenever a rule changes how an approved layout looks, then compare old and new side by side: a difference you didn't intend is a regression (the swap labels drifted apart this way and were caught).
- A new approved image always gets an example spec and a line in `sources.json`, so it can never go stale.
- `render.mjs --check-only` stops after the logo checks, so it can't test the variety or field rules. Test those with a real render against a copied history (`FEATURED_HISTORY_DIR` pointing at a scratch copy).

## Refusals (the renderer stops and says why)

| Check | What it enforces | The feedback behind it |
| --- | --- | --- |
| `HEADING CHECK FAILED` | The heading reuses the blog title's own words, shorter | Creative headings drifted from the article |
| `TEXT CHECK FAILED` | ≤ 15 words, ≤ 7 per element, no sentences | "Minimal"; "too much text" |
| `VARIETY CHECK FAILED` | A layout is used once per category: one not used yet anywhere is free for any article it suits and goes first; a used one is free only in a different category. Usage = `references/used-layouts.json` (the truth for every layout it lists, as of its `recordedAt`) + images delivered or reserved after it; unlisted layouts use the history. Site-wide caps on top: slash, connect, duo 5; dark 3; pills, logotype 2. No repeat with a reason; only `--user-pick` or `--force` skips it | "The ones that hasnt used yet can be used now if suitable for any article and the ones that have used cant be used again unless the category is different" (Oct 2026, replacing the site-wide rotation); pills "max 2 times" |
| `BACKGROUND FIT FAILED` / `BACKGROUND CHECK FAILED` | Each layout only takes the fields that flatter its illustration | Fields that fought the illustration |
| `VIBRANT CHECK FAILED` / `VIBRANT FIT FAILED` | At most 1 in 3 vibrant per category, never neighbours; the blue only behind a big white card | Blue-heavy illustrations on blue became a blob |
| `SERIES CHECK FAILED` | The site mark appears rarely, card layouts only | "Delete the medhub logo" on headline layouts |
| `CONTENT CHECK FAILED` | Enough real facts to fill the frame | Empty-looking windows and cards |
| `FAIRNESS CHECK FAILED` | An X vs Y article shows both products | A one-brand image "looks like an ad" |
| `PILLS LOGO CHECK FAILED` | Both logos sit on white circles | "Logo bg should always be white" |
| `CONNECT LOGO CHECK FAILED` | Both tiles are the brands' own app icons | "Logo should always be its original colour" |
| `TILES LOGO CHECK FAILED` | Both tiles filled, or both white, never one of each | "Either both white or both with logo colour" |
| `GLASS LOGO CHECK FAILED` | Wordmarks compact enough to read on the bar | NetSuite's 13:1 lockup was unreadable |
| `SLASH NAME CHECK FAILED` | Every name two-tone, white + brand colour | "Two colours, one white compulsory" |
| `LOGOTYPE CHECK FAILED` | A black logo with a separate icon for the black tile | "Without the tile the balance is off" |
| `FIELD FIT FAILED` | Gumloop layouts only on their approved fields (type light; tiles blue, light; glass light, black; swap light; badge light; frost and bento light) | Type on black, badge on blue, glass on blue were rejected; type on blue, tiles on black and swap on black were deleted in the approved review ("Delete") |
| `CHECKLIST FIELD FAILED` | The checklist goes on the vibrant blue only; the renderer sets `bg: "blue"` itself and refuses any other `bg`. It still counts as vibrant (1 in 3, never neighbours) | "Delete" on the checklist on a light field (approved review, Oct 2026) |
| `LOGO FILE MISSING` | Local logo files exist where the spec says | Examples that broke for other installers |
| `FINAL IMAGE LOCKED` | Delivered images are never re-created | "Those exact ones can't be created again" |

## Built-in Rules (applied automatically, no refusal)

| Rule | The feedback behind it |
| --- | --- |
| Every headline black `#0A0A0B` via the brand's `headline` colour (white on dark fields) | "Black, not blue", asked four times |
| Headline layouts (pills, connect, duo, dark) set every word in Inter 500 Medium | "Use same font weight 500 medium everywhere" |
| Connect headline on one line, centred above the divider | "2 lines look visually off" |
| Stat number capped at 150px; the card grows to match; no gap for an empty card heading | "4–9% too big, illustration too small" |
| Receipt headline semibold, at most 84px | "The heading makes the balance off" |
| Swap: both text labels share one size | Sameness within an image (caught by the regression) |
| "+" grid on dark fields bright but only around the edges | "Too dark, light it, not in the whole image"; then "not visible" |
| Dot grids, rings and patterns stay sparse and faint | "Pattern is too much"; "should not be in all area" |
| Dark: text at x 120; the product's icon in `#0A0A0B` on a white tile top-left | "Left padding is too much"; "should be the product's logo" |
| Pills: flat outer cuts, tips 112px apart, subtle gradient + noise | The user's reference, measured |
| Slash names keep their auto-fit size | "Perfect", never enlarge |
| No shadows on blue or black fields | Shadows looked heavy on vibrant fields |
| Frost: each mark fills 48% of its glass tile (was 60%) | "The icons are too big and this is why visual balance off, improve" |

## Planning Tools

| Tool | Use |
| --- | --- |
| `scripts/logo-check.mjs <domains>` | Before reserving pills, connect, glass, tiles or logotype: which layouts each brand's logos allow (same checks as the renderer) |
| `scripts/plan.mjs` | Per category: "Not used yet (first in line)", "Used only in other categories", "Not again in <category>"; reserves a batch with `<slug>=<mode>[/<variant>][@<topic>]` |
| `scripts/usage.mjs` | The shared usage rule (render.mjs and plan.mjs): the user's record is the truth for every layout it lists, as of its `recordedAt` (a history image for a layout marked "Not used yet" never went live and doesn't count); images delivered or reserved after `recordedAt` are added on top, and a layout it doesn't list falls back to the history |
| `references/used-layouts.json` | The user's own record of used layouts and their categories, kept on the Template Usage page (https://claude.ai/artifact/8wxx5rif2nNTk81bzgaQ6q). It overrides the history as of its `recordedAt`, because the user knows what is live on the site. Sync it from the page's `usage` collection with ArtifactData, then push |
| `scripts/sheet.mjs` | QA contact sheet of the whole site (or one category): the user sees every image together, so a look-alike anywhere is visible |
| `scripts/finalize.mjs` | Locks delivered images and stores a copy |
| `scripts/test-examples.mjs` | The regression above |
