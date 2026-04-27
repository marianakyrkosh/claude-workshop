---
description: Run the full feature workflow — parse ticket, plan, branch, implement, test, review, ship
argument-hint: [feature description or backlog ID]
---

# Feature Flow

Coordinates the full lifecycle of a feature from idea to merged PR. Each stage is a separate skill that can also be run on its own; this one stitches them together.

## Stages

1. **Parse** — Run `/parse-ticket` with the description. Produces `.claude/workitems/feedback/REQUEST-[slug].md`. Stop and confirm scope with the user before continuing.
2. **Plan** — Run `/plan-feature` with the slug. Produces design + checklist + learnings scaffold under `.claude/workitems/`. The plan-feature skill has its own user gate.
3. **Branch** — Run `/branch-start` to create `feature/[slug]` from `main` and push with upstream tracking.
4. **Implement** — Run `/implement-feature` with the slug. Walk the checklist, calling `/quick-commit` between milestones. Use `/unit-tests` and `/integration-tests` for new code.
5. **Verify** — Run `/pre-pr-review`. Address findings until clean.
6. **Ship** — Run `/archive-feature` to finalize learnings and move artifacts to archive. Then `/open-pr` to push and create the PR.
7. **Iterate** — Once the PR exists, run `/address-pr-comments [PR#]` whenever new review comments arrive.

## Slug

Derive a kebab-case slug from the feature description (e.g. `add-bulk-delete`, `fix-pagination-bug`). All artifacts under `.claude/workitems/` use this slug. Branch name: `feature/[slug]`.

## Guardrails

- One feature per invocation. Don't batch unrelated work.
- Never skip the user gate after Phase 1 or 2.
- Cross-app changes: implement API contract first, then web/mobile consumers.
- Sync any shared types in `packages/types` when contracts change.
- Mobile: run `dart run build_runner build` after touching freezed models.

## Examples

```bash
/feature-flow Add bulk delete for items
/feature-flow Fix pagination off-by-one on items list
/feature-flow Add tags to items
```
