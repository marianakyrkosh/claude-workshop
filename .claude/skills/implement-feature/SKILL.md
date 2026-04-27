---
description: Walk the planned checklist and build the feature with Workshop conventions
argument-hint: [feature slug (optional)]
---

# Implement Feature

Execute the plan. The goal is to ship complete, tested checklist items — not partial fragments.

## Inputs

- `.claude/workitems/planning/[slug]-checklist.md` — the source of truth for what to build
- `.claude/workitems/development/[slug]-design.md` — the architectural context
- `.claude/workitems/development/[slug]-learnings.md` — append notes here as you go
- `.claude/mocks/INDEX.md` if a UI mock exists for the feature
- (Optional) Figma node IDs from the design doc — if the Figma MCP is configured, call `get_design_context` or `get_screenshot` when you need to verify a visual detail mid-implementation

## Loop

1. Pick the next unchecked item from the checklist
2. Implement it end-to-end (code + tests for that slice)
3. Mark the item `[x]` and add a one-line note (file path, key decision)
4. Append a learnings entry whenever you hit something non-obvious
5. Use `/quick-commit` between checklist items so progress is preserved
6. Repeat until the checklist is complete or you're blocked

## Conventions

- TypeScript on web and api, Dart on mobile — no `any`/`dynamic` unless temporarily justified
- Follow existing folder structure in each app
- API changes ship before frontend consumers in the same checklist
- i18n: keep `apps/web/locales/en/*.json` and `apps/mobile/lib/core/l10n/app_en.arb` in sync for any new user-visible string
- Mobile: run `dart run build_runner build` after model or generator changes
- No hardcoded visual values — use theme tokens (`AppSpacing`, `AppColors`, Tailwind tokens, CSS variables)
- Pull from existing shared widgets/components before building new ones

## Done means

- All checklist items marked `[x]`
- No outstanding contract mismatches between layers
- Validation commands listed in the checklist have been run
