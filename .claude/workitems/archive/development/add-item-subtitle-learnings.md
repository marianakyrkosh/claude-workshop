---
slug: add-item-subtitle
source: docs/sprints/sprint1.md#1
related:
  - .claude/workitems/archive/feedback/REQUEST-add-item-subtitle.md
  - .claude/workitems/archive/development/add-item-subtitle-design.md
  - .claude/workitems/archive/planning/add-item-subtitle-checklist.md
---

# LEARNINGS — Item subtitle

## Surprises

- API lint already had 3 pre-existing `no-explicit-any` warnings on `apps/api/src/common/dto/paginated-response.dto.ts`. Unrelated to this slice — left as-is.
- Migration timestamp came out as `20260429190105` because the project's "current date" is set to 2026-04-29.
- `flutter gen-l10n` must be run with no CLI args because `apps/mobile/l10n.yaml` exists.
- `flutter analyze` emits info-level `use_null_aware_elements` suggestions for `if (foo != null) 'foo': foo` map literals — `items_repository.dart` already used this pattern, and adding `subtitle` propagates the same style. Not blocking under the "0 errors / 0 warnings" gate.
- Generated mobile l10n (`apps/mobile/lib/core/l10n/generated/*`) is gitignored. Only `app_en.arb` plus the Freezed/json_serializable outputs (`item.freezed.dart`, `item.g.dart`) get committed.
- Pre-PR review caught a vacuous vitest assertion (`queryByText('Subtitle for B')` — string never seeded). Worth re-reading test code for **string literals that don't appear elsewhere in the test** before considering an assertion meaningful.

## Deviations from the plan

- The mobile list tile keeps the existing `AppCard.subtitle` slot but coalesces with `item.subtitle ?? item.description`. Plan documented this explicitly; decision recorded under Decisions below.
- Vitest test grew a fourth commit (`1681549`) on top of the web milestone after pre-PR review tightened the negative assertion.

## Decisions

- **Keep `Item` shape duplicated** between `apps/web/hooks/use-items.ts` and `apps/mobile/lib/models/item.dart`. Reason: scoping — moving it into `@repo/types` is a refactor that affects more than this slice. Defer.
- **No `@MaxLength` validation-failure spec on the API.** The global `ValidationPipe` is covered by NestJS itself; no other DTO in the codebase has one.
- **Mobile widget test added.** No existing item widget tests, but cheap to add and prevents a regression.
- **Mobile list tile shows `subtitle ?? description`.** Single-line tile preserved; description still visible on detail. Avoids extending shared `AppCard` for one feature.

## Tradeoffs / deferred

- **Cannot clear an existing subtitle via the UI.** Both web (`subtitle: subtitle || undefined`) and mobile (`if (subtitle != null) ...`) omit the key on empty input, so the PATCH never carries `subtitle: null`. Matches the existing `description` behavior — pre-existing pattern, not a regression. A future tri-state input + explicit "clear" affordance would fix it.
- **API accepts empty string `""` as subtitle.** Allowed by `@IsOptional + @IsString + @MaxLength(200)`. Our clients never send `""`; only matters for direct API consumers.
- **Playwright e2e** for the new subtitle flow added but **not executed** before merge — needs api + web dev servers running. The spec change mirrors the existing description fill above it. Recommend running it during PR review.
- **Swagger `/docs` not visually verified.** Annotation `@ApiPropertyOptional({ description, maxLength: 200 })` mirrors the existing `description` annotation pattern.

## Verification

| Layer | Command | Result |
|-------|---------|--------|
| API   | `npm run lint` | 0 errors (3 pre-existing warnings) |
| API   | `npx tsc --noEmit` | clean |
| API   | `npm run test` | 20/20 jest (3 suites) |
| API   | `npx prisma migrate dev --name add_item_subtitle` | applied; `prisma generate` clean |
| Web   | `npx eslint .` | clean |
| Web   | `npx tsc --noEmit` | clean |
| Web   | `npx vitest run` | 2/2 |
| Mobile | `dart run build_runner build --delete-conflicting-outputs` | regenerated `item.freezed.dart` / `item.g.dart` |
| Mobile | `flutter gen-l10n` | regenerated AppLocalizations exposing the new keys |
| Mobile | `flutter analyze` | 0 errors / 0 warnings (11 info-level) |
| Mobile | `flutter test` | 2/2 |

## Delivery summary

- Branch: `feature/add-item-subtitle`
- Commits (4):
  - `e42364b feat(api): add optional subtitle field to Item`
  - `4c452a3 feat(web): surface optional subtitle field on Item`
  - `b627e96 feat(mobile): surface optional subtitle field on Item`
  - `1681549 test(web): tighten items-list subtitle assertions`
- PR: pending — to be opened by `/open-pr`.
- Files touched: 28 (+623 / −32). Migration file `prisma/migrations/20260429190105_add_item_subtitle/migration.sql`.
- Source: `docs/sprints/sprint1.md#1`.

## Followups

- Consider moving `Item` into `packages/types` so a single source of truth feeds web + future api/mobile consumers. Out of scope here; queue for a follow-up refactor PR.
- Decide product-level whether users should be able to clear `subtitle` (and `description`) from the edit form. Today the UI cannot send `subtitle: null`; either adopt a tri-state input or accept an explicit "clear" action.
- Consider tightening api DTO with `@IsNotEmpty()` on `subtitle` (or trimming whitespace server-side) to forbid `""` for direct API consumers.
- Run Playwright e2e (`npx playwright test apps/web/e2e/items.spec.ts`) once api + web are running locally to confirm the new subtitle fill + assertion pass.
- Sanity-check Swagger at `/docs` to confirm the `subtitle` field renders as optional with `maxLength: 200`.
