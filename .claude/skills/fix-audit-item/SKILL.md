---
description: End-to-end fix lifecycle for a audit-2026-04-13.md item
argument-hint: [#N item number (optional — auto-selects next highest-priority open item)]
---

# Fix Audit Item Command

Purpose: Orchestrate the full fix lifecycle for a single audit-2026-04-13.md item — from selection through PR and audit update.

## Phase 1: SELECT

1. Read `.claude/skills/fullstack-audit/outputs/audit-2026-04-13.md`.
2. Parse all items from the CRITICAL, HIGH, MEDIUM, and LOW tables.
3. If an argument `#N` is provided, select that item. If it is already `✅ FIXED`, warn and stop.
4. If no argument, auto-select the next open (`❌ OPEN`) item by priority: CRITICAL > HIGH > MEDIUM > LOW, lowest `#` first within each tier.
5. Display the selected item to the user: number, severity, area, issue summary, and location.
6. **Ask the user to confirm** before proceeding. If declined, stop.

## Phase 2: SETUP

1. Derive a slug from the item (e.g., `audit-15-static-query-key`).
2. Create a feature branch: `fix/audit-[#]-[short-slug]` from `main`.
3. Generate a change request file at `.claude/workitems/feedback/CHANGE-REQUEST-audit-[#]-2026-04-03.md` with:
   - Title from the audit issue description
   - Severity and area from the audit table
   - Location (file paths) from the audit table
   - Acceptance criteria: item marked `✅ FIXED`, tests pass, no regressions
4. Create folders if missing (`.claude/workitems/feedback/`, etc.).

## Phase 3: PLAN

1. Run the `/design-plan` workflow using the slug from Phase 2.
   - This reads the change request and produces: design doc, checklist, learnings scaffold.
   - `/design-plan` includes its own user approval gate — wait for that before continuing.

## Phase 4: BUILD

1. Run `/implement` using the slug — iterate through the checklist.
2. Run `/unit-test` for impacted code.
3. Run `/integration-test` for impacted flows.
4. Verify tests pass before proceeding. If failures, fix and re-run.

## Phase 5: VERIFY

1. Run `/review` scoped to the current changes.
2. If findings are reported:
   - Fix issues found by the review.
   - Re-run `/review` until clean or only residual risks remain.
3. Confirm all quality gates: lint, type-check, tests.

## Phase 6: SHIP

1. Run `/commit-and-pr` to commit, push, and open a PR to `main`. Include the audit item number in the PR title (e.g., `fix(audit-#N): short description`).
2. Update `.claude/skills/fullstack-audit/outputs/audit-2026-04-13.md`:
   - Change the item's checkbox from `- [ ]` to `- [x]` and append a brief fix summary.
   - Add a Change Log entry row: `| [today's date] | #[N] | **FULLY FIXED** — [one-line summary of the fix] |`
   - If the fix is non-trivial, add a Detailed Notes subsection following the existing format (Original state / Fix / Operational requirements / Residual gaps).
   - Update the Test Infrastructure section if new tests were added (suite counts, total).
   - Update the Recommended Priority Order section if the item was listed there.
3. Amend the PR commit with the audit update, or add a follow-up commit.
4. Run `/capture-learnings` to finalize documentation and archive artifacts.

## Guardrails

- One item per invocation — do not batch multiple items.
- Never skip the user confirmation gate in Phase 1.
- Follow all standards from `.claude/CLAUDE.md` and app-specific CLAUDE.md files.
- If the item requires a Prisma migration, include it in the checklist and test it.
- If the item spans both `api` and `web`, implement API changes first per cross-app contract rules.
