# Blog Featured Images skill

A Claude Code skill that makes premium, article-specific blog featured images (1600×900 plus crops) in a soft-pastel card design language. It reads the article, picks a composition that differs from its category neighbours, fills it with the article's real facts, and renders it for free with headless Chrome. No AI image generation is involved.

## Install

```bash
npx skills add https://github.com/wardiva/blog-skills --skill blog-featured-images
```

One-time setup for rendering (needs Node 18+ and Chrome or Edge):

```bash
cd ~/.claude/skills/blog-featured-images/scripts && npm install
```

## Use

In Claude Code:

> Make a featured image for https://example.com/blog/your-article/

Or invoke it directly with `/blog-featured-images`.

## What's inside

- `SKILL.md`: workflow and the three hard rules (relatable, easy to understand, different every time)
- `references/design-language.md`: colours, type, cards and composition archetypes
- `references/spec-format.md`: spec format for each composition (before/after, versus, prompt, hub)
- `scripts/render.mjs`: the renderer
- `brands/`: brand colour files, with `_template.json` for new sites
- `examples/`: four sample specs
