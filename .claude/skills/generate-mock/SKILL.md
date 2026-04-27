---
description: Create or refine an indexed HTML UI mock under .claude/mocks
argument-hint: [component or page description]
---

# Generate Mock

Produce a quick HTML/Tailwind mock to align on visuals before writing real code. Mocks live in `.claude/mocks/` and are tracked in `INDEX.md`.

## Storage

- `.claude/mocks/INDEX.md` — table of all mocks
- `.claude/mocks/[index]-[component-name]-mock.html` — the file itself

Create folder if missing.

## Figma source

If a Figma URL is provided, call the Figma MCP `get_design_context` (or `get_screenshot`) to pull the visual reference, then translate it into Tailwind. Capture the source node ID in a comment block at the top of the HTML file so the mock can be regenerated later if the design changes.

## Naming

- 3-digit zero-padded index: `001`, `002`, ..., `099`
- Kebab-case component name
- One file per component or page; refining an existing mock keeps the same index and overwrites the file

## Process

1. Parse the requested component or page
2. Decide: new mock (next available index) or refinement (existing index)
3. Write a self-contained HTML file using Tailwind via CDN — single page, no build step
4. Update `INDEX.md` with a new or modified row

## INDEX.md columns

`# | Name | File | Status | Created | Target`

- **Status**: `Mock only`, `In progress`, `Implemented`
- **Target**: where this is intended to land (e.g. `apps/web/components/items/item-card.tsx`)

## Conventions

- Use Tailwind utility classes — no inline styles, no custom CSS unless absolutely needed
- Match the workshop's design tokens: `bg-primary`, `text-muted-foreground`, etc.
- Add a comment block at the top noting responsive breakpoints and any i18n keys the real implementation will need
- The mock targets Next.js + shadcn/ui. Mobile mocks (Flutter) are usually handled directly in code instead of HTML mocks.
