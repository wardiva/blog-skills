// The single list of layouts (mode -> variants, default first). Shared by render.mjs and plan.mjs.
export const LAYOUTS = { 'before-after': ['default', 'flow'], versus: ['overlap', 'table', 'pills', 'connect', 'slash', 'duo'], prompt: ['default'], hub: ['default'], stack: ['default'], window: ['default'], timeline: ['default'], checklist: ['default'], stat: ['default'], ranked: ['default'], focus: ['default'], dark: ['default'] };

// Favourite layouts may repeat in a category (up to this many uses) instead of waiting for the rotation.
export const REPEATABLE = { 'versus/slash': 5, 'versus/connect': 5, 'versus/duo': 5 };
