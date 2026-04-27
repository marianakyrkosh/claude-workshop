---
description: Turn a change request into an implementation design, checklist, and learnings scaffold
argument-hint: [feature slug]
---

# Plan Feature

Convert a parsed change request into an actionable plan. Calls out dependencies between layers so the implementation order is unambiguous.

## Inputs

- `.claude/workitems/feedback/REQUEST-[slug].md`
- Root `CLAUDE.md` and the per-app guides (`apps/api/.claude/CLAUDE.md`, `apps/web/.claude/CLAUDE.md`, `apps/mobile/.claude/CLAUDE.md`)
- Existing UI mocks in `.claude/mocks/` if any apply

## Outputs

- `.claude/workitems/development/[slug]-design.md` — architecture, file map, data flow
- `.claude/workitems/planning/[slug]-checklist.md` — ordered, action-oriented tasks
- `.claude/workitems/development/[slug]-learnings.md` — empty scaffold for capturing notes during implementation

Create directories if missing.

## Design must include

- File-by-file map: which files to create, modify, or delete in each app
- Implementation order (API first if contracts change)
- Test strategy split by layer
- Migration & rollout notes if data changes
- Compatibility risks (breaking changes, deprecations)

## Checklist style

- Each item is a single concrete action with a verifiable outcome
- Group by app: `[API]`, `[Web]`, `[Mobile]`, `[Shared]`
- Include verification steps inline (run tests, check lint, etc.)

## User gate

Show the design summary to the user and wait for explicit approval before considering the plan finalized.
