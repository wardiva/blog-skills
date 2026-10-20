// The single list of layouts (mode -> variants, default first). Shared by render.mjs, plan.mjs, usage.mjs and bgpick.mjs.
export const LAYOUTS = { glassbar: ['default'], 'before-after': ['default', 'flow'], versus: ['overlap', 'table', 'pills', 'connect', 'slash', 'duo', 'type', 'tiles', 'glass', 'frost', 'bento', 'badges', 'checks', 'center', 'lanes', 'scores', 'fan', 'stacked'], prompt: ['default'], hub: ['default'], stack: ['default'], window: ['default'], timeline: ['default'], checklist: ['default'], stat: ['default'], ranked: ['default'], focus: ['default'], dark: ['default'], logotype: ['default'], swap: ['default'], badge: ['default'], receipt: ['default'], definition: ['default'], shortlist: ['default'], lineup: ['default'], spotlight: ['default'], picks: ['default'], frostrow: ['default'], figures: ['default'], costgrid: ['default'], cloud: ['default'], ranges: ['default'], count: ['default'] };

// A layout is used at most once per category (usage.mjs). These layouts also have a site-wide cap: at most this many images
// across all categories (the user: pills "max 2 times").
export const REPEATABLE = { 'versus/pills': 2, 'versus/slash': 5, 'versus/connect': 5, 'versus/duo': 5, 'dark/default': 3, 'logotype/default': 2 };

// Retired by the user: these never come back (render.mjs and plan.mjs refuse them with "RETIRED LAYOUT", before any other check).
export const RETIRED = ['brandline', 'folder', 'versus/scale', 'versus/chat', 'versus/split', 'versus/duet', 'versus/rows', 'versus/logos',
  // batch 5 'new versions' (Oct 19 2026), all rejected: 'not a single image matches our design language… why are you using mobile mockups'
  'versus/compare', 'versus/search', 'versus/polaroid', 'versus/notes', 'versus/phones', 'versus/browser', 'notify', 'wallet', 'stickers', 'letterboard', 'tags', 'keycaps',
  // batch 7 direction check (Oct 19 2026): disapproved
  'versus/window',
  // batch 8/9 review (Oct 19 2026): range 'i like the design but it is confusing' (lanes replaced it); rings and share disapproved; sheet and columns (options) never approved
  'versus/range', 'versus/rings', 'versus/share', 'versus/sheet', 'versus/columns',
  // batch 5 final review (Oct 20 2026): plans 'i dont like the design, try smth else for comparison'; fit disapproved; spot was QA-rejected (Appointment's design under a new name)
  'versus/plans', 'versus/fit', 'versus/spot',
  // batch 5 final review (Oct 20 2026): grid on Pediatric EHR, '7 best pediatric shouldnt be like other logos, this looks off', both fixes
  // disapproved, then 'for this use this glass version template' (re-delivered as lineup): no approved look left
  'grid',
  // batch 6 first pass (Oct 20 2026), each re-done with another layout: steps (EHR interoperability cost) 'it looks like this is designed by
  // a begineer not by a pro experienced designer'; numbered (telehealth for therapists) 'numbers looks so weird and visually cluttered and
  // unbalanced' (frostrow replaced it); versus/pill (Doxy.me vs Zoom) 'doesnt look like comparison image' (badges replaced it);
  // versus/chips (Tebra) and versus/offset (symplr) 'painfully bad visual design' (fan and stacked replaced them); versus/halves
  // (Waystar vs R1) 'i dont like this it looks off and doesnt match our design vibe' (duo replaced it)
  'steps', 'numbered', 'versus/pill', 'versus/chips', 'versus/offset', 'versus/halves',
  // batch 6 round 3: link (the EHR connector) and versus/annotate and versus/corners (Tebra, symplr), all disapproved: 'all of them looks too
  // much… it looks scattered, it looks like AI slop'; annotate again disapproved on black and on blue in round 4
  'link', 'versus/annotate', 'versus/corners',
  // batch 6 round 3, never shown (QA cut them): poster (a badge skeleton), versus/glasscards (a cramped "vs"; the retired plans' columns in
  // glass) and versus/figures (a restyle of the scores type). Not the "figures" mode, which is live.
  'poster', 'versus/glasscards', 'versus/figures'];
export const retiredOf = (mode, variant) => RETIRED.find((r) => r === mode || r === `${mode}/${variant}`) || null;
export const retiredMsg = (x) => `RETIRED LAYOUT: ${x} was retired by the user and never comes back. Pick a live layout (layouts.mjs).`;

// The layouts that paint their own full canvas (render.mjs CANVAS; shared with bgpick.mjs, whose picker page names the ones that
// refuse a pick). The Gumloop layouts and the Originals (receipt, definition, shortlist, lineup) are GL_LAYOUTS; with the Chatbase
// headline layouts (white in a grey frame, or black) they are CB_LAYOUTS; prompt paints its own full field too, and frostrow its own light
// mesh (recorded as "canvas"; a bg or a pick is refused there).
export const GL_LAYOUTS = ['versus/badges', 'versus/type', 'versus/tiles', 'versus/glass', 'versus/frost', 'versus/bento', 'swap/default', 'badge/default', 'receipt/default', 'definition/default', 'shortlist/default', 'lineup/default'];
export const CB_LAYOUTS = ['glassbar/default', 'versus/pills', 'versus/connect', 'versus/slash', 'versus/duo', 'dark/default', ...GL_LAYOUTS];
export const CANVAS_LAYOUTS = [...CB_LAYOUTS, 'prompt/default', 'frostrow/default'];
// a picked bg shows only where the canvas can step aside (glCanvas layouts); the others paint a full canvas of their own over it
export const PICK_CANVAS = ['versus/badges', 'versus/type', 'versus/tiles', 'versus/bento', 'swap/default', 'badge/default', 'shortlist/default'];
