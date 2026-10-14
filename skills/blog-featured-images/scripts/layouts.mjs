// The single list of layouts (mode -> variants, default first). Shared by render.mjs and plan.mjs.
export const LAYOUTS = { 'before-after': ['default', 'flow'], versus: ['overlap', 'table', 'pills', 'connect', 'slash', 'duo', 'type', 'tiles', 'glass'], prompt: ['default'], hub: ['default'], stack: ['default'], window: ['default'], timeline: ['default'], checklist: ['default'], stat: ['default'], ranked: ['default'], focus: ['default'], dark: ['default'], logotype: ['default'], swap: ['default'], badge: ['default'], brandline: ['default'], receipt: ['default'], definition: ['default'] };

// Favourite layouts may repeat in a category (up to this many uses) instead of waiting for the rotation.
export const REPEATABLE = { 'versus/pills': 2, 'versus/slash': 5, 'versus/connect': 5, 'versus/duo': 5, 'dark/default': 3, 'logotype/default': 2 };
