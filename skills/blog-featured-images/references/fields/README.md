# Approved Fields

The user approved these backgrounds but not the illustrations they first carried. A field is only ever used under a real illustration (a card, a figure, logos), shown to the user first; never a background with only a headline.

## In use

Since batch 5 (Oct 19 2026) the user picks each image's background on a picker page (`"bg": "<field>", "bgPick": true`; design language 3f). `soft`, `white`, `glow` and `mesh` are in the renderer's `BG_CSS` and come from that pick; the only fit lists that name them are the batch-6 layouts', which lead with the field the user picked for the delivered image (`figures` white; `costgrid`, `versus/fan`, `versus/stacked` glow). Across a batch, use the whole range, the strong fields too ("you are just using same color"; "we have multiple colors, black background color, blue gradient": `taste.md` 24).

| File | Field (`bg`) | Where it is used |
| --- | --- | --- |
| `glow.webp` | `glow`: the light blue glow from the retired `brandline` (a light-blue diagonal, a blue glow bottom right) | `lineup` paints it itself (batch 4, approved; also pediatric EHR in the batch-5 final round, on lineup's own canvas: "for this use this glass version template"). Batch 5 picks: TheraNest vs Valant (`versus/badges`), Oracle Health vs MEDITECH (`versus/scores`), appointment reminders (`spotlight`), claims management (`cloud`). Batch 6 picks: Doxy.me vs Zoom (`versus/badges`), AI clinical decision support (`swap`), medical billing cost (`costgrid`, image 52), Tebra vs Zocdoc (`versus/fan`, image 53), symplr vs Modio Health (`versus/stacked`, image 54); the default of those three layouts now. The user on brandline: "The bg looks good, can be used with some other illustration, but not like this with just a title heading." |
| (code only) | `mesh`: the light blurred blue mesh | `versus/frost`, light `versus/glass` and `frostrow` (batch 6, image 51: "for logos bg glass bg would look better") paint it themselves; `frostrow` refuses a picked `bg`. Picked for Office Ally vs Claim.MD (`versus/lanes`) and hospital information systems (`picks`). `versus/stacked` was approved on it ("love it. The concept, visual , everything looks so appealing and perfect") before the user picked the glow, and keeps it in its fit list |
| (code only) | `soft`: a calm light-blue diagonal gradient with fine grain | Prompt's `"field": "soft"`: RXNT vs DrFirst (`prompt` with two logo rows, image 48). In the batch-5 picks it was chosen for RXNT's and pediatric EHR's first layouts (`versus/plans` and `grid`, both retired in the final round) |
| (code only) | `white`: a white rounded panel in the light-grey frame, with sparse dots | Picked for small-practice EMR (`ranges`, image 46) with `"bare": true`: no card behind the bars, tracks a step darker ("use the previous bg, and in that dont add container for bars section"); `bare` renders only on this picked white field. Batch 6 picks: e-prescribing cost (`figures`, image 50; its default now) and NextGen vs AdvancedMD (`versus/type`) |
| (code only) | `blue`: the vibrant deep-dunes blue | In the fit list of `checklist`, `versus/table`, `window`, `before-after/flow` and `versus/fan` (approved on it in batch 6 round 4); picked only where every word sits inside a white card: AAPC Codify vs Find-A-Code (`versus/checks`). `versus/tiles` paints its own blue field: picked for DrChrono vs athenahealth in batch 6 ("use the blue gradient bg") |
| (code only) | the black canvas (not a `bg`: the layouts paint it; `glassbar` adds a blue glow) | `glassbar` (batch 6, image 49: "try using black background maybe, because we haven't used it for like so long"), `versus/duo` (Waystar vs R1 RCM, batch 6), `dark`, `versus/slash`, black `versus/glass`. Counts as vibrant |

## Awaiting an illustration

| File | Field | What the user said |
| --- | --- | --- |
| `blue-mesh.webp` | the deep blue mesh behind `versus/glass` on blue (that pairing was removed; not a renderer field) | "The gradient is good but not looking good with this illustration. Can be used in some other illustration." Tried behind `versus/frost` in batch 4 and disapproved there (frost uses the light mesh, now also the `mesh` field). |
