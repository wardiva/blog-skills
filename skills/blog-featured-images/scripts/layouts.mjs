// The single list of layouts (mode -> variants, default first). Shared by render.mjs and plan.mjs.
export const LAYOUTS = { 'before-after': ['default', 'flow'], versus: ['overlap', 'table', 'pills', 'connect', 'slash', 'duo', 'type', 'tiles', 'glass', 'frost', 'bento'], prompt: ['default'], hub: ['default'], stack: ['default'], window: ['default'], timeline: ['default'], checklist: ['default'], stat: ['default'], ranked: ['default'], focus: ['default'], dark: ['default'], logotype: ['default'], swap: ['default'], badge: ['default'], receipt: ['default'], definition: ['default'], shortlist: ['default'], lineup: ['default'] };

// A layout is used at most once per category (usage.mjs). These layouts also have a site-wide cap: at most this many images
// across all categories (the user: pills "max 2 times").
export const REPEATABLE = { 'versus/pills': 2, 'versus/slash': 5, 'versus/connect': 5, 'versus/duo': 5, 'dark/default': 3, 'logotype/default': 2 };

// Retired by the user: these never come back (render.mjs and plan.mjs refuse them with "RETIRED LAYOUT", before any other check).
export const RETIRED = ['brandline', 'folder', 'versus/scale', 'versus/chat', 'versus/split', 'versus/duet', 'versus/rows', 'versus/logos'];
export const retiredOf = (mode, variant) => RETIRED.find((r) => r === mode || r === `${mode}/${variant}`) || null;
export const retiredMsg = (x) => `RETIRED LAYOUT: ${x} was retired by the user and never comes back. Pick a live layout (layouts.mjs).`;
