// The single list of layouts (mode -> variants, default first). Shared by render.mjs and plan.mjs.
export const LAYOUTS = { 'before-after': ['default', 'flow'], versus: ['overlap', 'table', 'pills', 'connect', 'slash', 'duo', 'type', 'tiles', 'glass', 'frost', 'bento'], prompt: ['default'], hub: ['default'], stack: ['default'], window: ['default'], timeline: ['default'], checklist: ['default'], stat: ['default'], ranked: ['default'], focus: ['default'], dark: ['default'], logotype: ['default'], swap: ['default'], badge: ['default'], receipt: ['default'], definition: ['default'], shortlist: ['default'], lineup: ['default'] };

// A layout is used at most once per category (usage.mjs). These layouts also have a site-wide cap: at most this many images
// across all categories (the user: pills "max 2 times").
export const REPEATABLE = { 'versus/pills': 2, 'versus/slash': 5, 'versus/connect': 5, 'versus/duo': 5, 'dark/default': 3, 'logotype/default': 2 };
