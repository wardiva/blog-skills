// The single list of layouts (mode -> variants, default first). Shared by render.mjs and plan.mjs.
export const LAYOUTS = { 'before-after': ['default', 'flow'], versus: ['overlap', 'table', 'pills', 'connect', 'slash', 'duo', 'type', 'tiles', 'glass', 'frost', 'bento', 'badges', 'checks', 'center', 'lanes', 'scores'], prompt: ['default'], hub: ['default'], stack: ['default'], window: ['default'], timeline: ['default'], checklist: ['default'], stat: ['default'], ranked: ['default'], focus: ['default'], dark: ['default'], logotype: ['default'], swap: ['default'], badge: ['default'], receipt: ['default'], definition: ['default'], shortlist: ['default'], lineup: ['default'], spotlight: ['default'], picks: ['default'], cloud: ['default'], ranges: ['default'], count: ['default'] };

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
  'grid'];
export const retiredOf = (mode, variant) => RETIRED.find((r) => r === mode || r === `${mode}/${variant}`) || null;
export const retiredMsg = (x) => `RETIRED LAYOUT: ${x} was retired by the user and never comes back. Pick a live layout (layouts.mjs).`;
