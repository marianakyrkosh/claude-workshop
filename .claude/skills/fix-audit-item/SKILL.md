---
description: End-to-end fix lifecycle for a single item from a fullstack-audit / flutter-audit report
argument-hint: [audit-file path] [#N item number (optional — auto-selects next highest-priority open item)]
---

# Fix Audit Item

Take one finding from an audit report through the full feature workflow — branch, plan, fix, test, review, and ship — and update the audit report itself when the item is closed.

## Inputs

- Audit file argument. If not provided, find the most recent file under `.claude/skills/fullstack-audit/outputs/` or `docs/audit/mobile/` (use `ls -t` and pick the newest matching `audit-*.md`).
- Optional `#N` to target a specific item; otherwise auto-pick the next open one.

## Phase 1: SELECT

1. Read the audit file determined above. If it doesn't exist, stop and tell the user no audit report was found.
2. Parse all findings from the Critical, High, Medium, and Low sections.
3. If `#N` is given, select that item. If it's already marked `✅ FIXED`, warn and stop.
4. If no `#N`, auto-select the next `❌ OPEN` item by priority (Critical > High > Medium > Low; lowest `#` first within each tier).
5. Show the selected item — number, severity, domain, issue summary, file location.
6. **Wait for the user to confirm** before continuing.

## Phase 2: BRANCH AND CHANGE REQUEST

1. Derive a slug: `audit-<#>-<short-kebab-summary>` (e.g. `audit-12-missing-pagination-index`).
2. Run `/branch-start audit-<#>-<short-kebab-summary>` to cut the branch.
3. Write the change request to `.claude/workitems/feedback/REQUEST-audit-<#>-<slug>.md`:
   - Title pulled from the audit issue
   - Severity and domain
   - File locations
   - Acceptance criteria: item marked `✅ FIXED`, tests pass, no regressions
4. Acceptance criteria specifically include: "the audit report is updated when this item closes."

## Phase 3: PLAN

Run `/plan-feature audit-<#>-<slug>`. The skill produces design + checklist + learnings scaffold and has its own user gate — wait for approval.

## Phase 4: BUILD

1. `/implement-feature audit-<#>-<slug>` — walk the checklist.
2. `/unit-tests` for new code paths.
3. `/integration-tests` if the fix crosses layers.
4. All tests green before the next phase.

## Phase 5: REVIEW

1. `/pre-pr-review` against the current changes.
2. Address findings until the review is clean.
3. Quality gates pass: lint, type check, tests, build.

## Phase 6: SHIP

1. Update the audit file (the same one read in Phase 1):
   - Flip the item's `❌ OPEN` to `✅ FIXED` and append a one-line summary.
   - If the report has a Change Log section, add a row: `| YYYY-MM-DD | #N | FIXED — <summary> |`.
   - If the fix is non-trivial, add a Detailed Notes block: original state / fix / operational requirements / residual gaps.
2. Commit the audit update on the same branch.
3. `/open-pr` with title `fix(audit-#<N>): <summary>`.
4. `/archive-feature audit-<#>-<slug>` once the PR is open.

## Guardrails

- One item per invocation — do not batch.
- Never skip the user confirmation in Phase 1.
- Follow `.claude/CLAUDE.md` and the per-app guides for all code changes.
- API contract changes ship before consumer changes in the same PR.
- The audit file is the single source of truth — every fix updates it before the PR merges.
