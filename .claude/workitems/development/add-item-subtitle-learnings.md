---
slug: add-item-subtitle
source: docs/sprints/sprint1.md#1
related:
  - .claude/workitems/feedback/REQUEST-add-item-subtitle.md
  - .claude/workitems/development/add-item-subtitle-design.md
  - .claude/workitems/planning/add-item-subtitle-checklist.md
---

# LEARNINGS — Item subtitle

Capture surprises, deviations from the plan, and reusable patterns as implementation proceeds. One bullet per learning. Move to the archive at the end via `/archive-feature`.

## Surprises

- API lint already had 3 pre-existing `no-explicit-any` warnings on `apps/api/src/common/dto/paginated-response.dto.ts`. They're unrelated to this slice — left as-is.
- Migration timestamp came out as `20260429190105` because the project's "current date" is set to 2026-04-29.
- `flutter gen-l10n` must be run with no CLI args because `apps/mobile/l10n.yaml` exists. Bare invocation works.
- `flutter analyze` emits info-level `use_null_aware_elements` suggestions for `if (foo != null) 'foo': foo` map literals — `items_repository.dart` already used this pattern, and adding `subtitle` propagates the same style. Not blocking under the "0 errors / 0 warnings" gate.
- Generated mobile l10n (`apps/mobile/lib/core/l10n/generated/*`) is gitignored. Only `app_en.arb` plus the Freezed/json_serializable outputs (`item.freezed.dart`, `item.g.dart`) get committed.

## Deviations from the plan

- _(none yet)_

## Reusable patterns

- _(none yet)_

## Followups

- _(none yet)_
