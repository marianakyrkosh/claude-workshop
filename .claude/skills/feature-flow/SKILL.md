---
description: Run the full feature workflow — parse ticket, plan, branch, implement, test, review, ship
argument-hint: [feature description | backlog ID | path/to/sprint.md[#N]]
---

# Feature Flow

Coordinates the full lifecycle of a feature from idea to merged PR. Each stage is a separate skill that can also be run on its own; this one stitches them together.

## Input

The argument can be any of:

- **A free-text feature description** — e.g. `Add bulk delete for items`. Used as-is.
- **A backlog ID** — e.g. `WORK-42`. Look up the corresponding ticket if a backlog source is configured.
- **A path to a sprint Markdown file** — e.g. `docs/sprints/sprint1.md`. Read the file and treat its contents as a feature backlog. If the file lists more than one feature, ask the user which one to run before continuing. The sprint file is treated as a read-only input — do not modify it during the flow.
- **A path to a sprint file with an item selector** — e.g. `docs/sprints/sprint1.md#1` or `docs/sprints/sprint1.md#item-subtitle`. Pick that specific item from the file:
  - `#N` (numeric) selects the Nth top-level item heading (`## N. Title` or `## N) Title`).
  - `#slug` (text) matches the item's heading slug case-insensitively.
- If the path doesn't exist, fall back to treating the argument as a free-text description and warn the user.

In all cases, before running `/parse-ticket`, echo the resolved feature description back to the user in 1–2 lines so they can confirm the right item was picked.

## Stages

1. **Parse** — Run `/parse-ticket` with the resolved description. Produces `.claude/workitems/feedback/REQUEST-[slug].md`. Stop and confirm scope with the user before continuing.
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
/feature-flow docs/sprints/sprint1.md           # prompt to pick an item if multiple
/feature-flow docs/sprints/sprint1.md#1         # the first item in the sprint file
/feature-flow docs/sprints/sprint1.md#item-subtitle
```
