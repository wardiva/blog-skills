# Approved Fields

The user approved these backgrounds but not the illustrations they first carried. A field is only ever used under a real illustration (a card, a figure, logos), shown to the user first; never a background with only a headline.

## In use

Since batch 5 (Oct 19 2026) the user picks each image's background on a picker page (`"bg": "<field>", "bgPick": true`; design language 3f). `soft`, `white`, `glow` and `mesh` are in the renderer's `BG_CSS` and come only from that pick; no layout's fit list offers them.

| File | Field (`bg`) | Where it is used |
| --- | --- | --- |
| `glow.webp` | `glow`: the light blue glow from the retired `brandline` (a light-blue diagonal, a blue glow bottom right) | `lineup` paints it itself (batch 4, approved; also pediatric EHR in the batch-5 final round, on lineup's own canvas: "for this use this glass version template"). Picked for TheraNest vs Valant (`versus/badges`), Oracle Health vs MEDITECH (`versus/scores`), appointment reminders (`spotlight`) and claims management (`cloud`). The user on brandline: "The bg looks good, can be used with some other illustration, but not like this with just a title heading." |
| (code only) | `mesh`: the light blurred blue mesh | `versus/frost` and light `versus/glass` paint it themselves. Picked for Office Ally vs Claim.MD (`versus/lanes`) and hospital information systems (`picks`) |
| (code only) | `soft`: a calm light-blue diagonal gradient with fine grain | Prompt's `"field": "soft"`: RXNT vs DrFirst (`prompt` with two logo rows, image 48). In the batch-5 picks it was chosen for RXNT's and pediatric EHR's first layouts (`versus/plans` and `grid`, both retired in the final round) |
| (code only) | `white`: a white rounded panel in the light-grey frame, with sparse dots | Picked for small-practice EMR (`ranges`, image 46) with `"bare": true`: no card behind the bars, tracks a step darker ("use the previous bg, and in that dont add container for bars section"). `bare` renders only on this picked white field |
| (code only) | `blue`: the vibrant deep-dunes blue | In the fit list of `checklist`, `versus/table`, `window` and `before-after/flow`; picked only where every word sits inside a white card: AAPC Codify vs Find-A-Code (`versus/checks`) |

## Awaiting an illustration

| File | Field | What the user said |
| --- | --- | --- |
| `blue-mesh.webp` | the deep blue mesh behind `versus/glass` on blue (that pairing was removed; not a renderer field) | "The gradient is good but not looking good with this illustration. Can be used in some other illustration." Tried behind `versus/frost` in batch 4 and disapproved there (frost uses the light mesh, now also the `mesh` field). |
