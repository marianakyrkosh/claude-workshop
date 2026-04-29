---
slug: add-item-subtitle
source: docs/sprints/sprint1.md#1
related:
  - .claude/workitems/feedback/REQUEST-add-item-subtitle.md
  - .claude/workitems/development/add-item-subtitle-design.md
---

# CHECKLIST — Item subtitle

Order matters: API → Web → Mobile. Each `[ ]` is a single concrete action with a verifiable outcome.

## [API] apps/api

- [x] Add `subtitle String?` to the `Item` model in `apps/api/prisma/schema.prisma` (between `title` and `description`). — done in `prisma/schema.prisma`.
- [x] From `apps/api`, run `npx prisma migrate dev --name add_item_subtitle`. — created `prisma/migrations/20260429190105_add_item_subtitle/migration.sql` with `ALTER TABLE "Item" ADD COLUMN "subtitle" TEXT;`; `prisma generate` ran clean.
- [x] Add `subtitle?: string` to `CreateItemDto` with `@IsOptional`/`@IsString`/`@MaxLength(200)`/`@ApiPropertyOptional`. — done in `dto/create-item.dto.ts`.
- [x] Confirm `UpdateItemDto` still extends `PartialType(CreateItemDto)`. — verified, no change.
- [x] Update `mockItem` in `items.service.spec.ts` to include `subtitle: null`; extend create test for subtitle round-trip. — added `should create an item with a subtitle`.
- [x] Add `update` test in `items.service.spec.ts` for `subtitle`-only update. — added `should update only the subtitle`.
- [x] Update `mockItem` in `items.controller.spec.ts`; extend create + update tests with subtitle. — added `should create an item with a subtitle` and `should update an item with a subtitle`.
- [x] `npm run lint` — 0 errors (3 pre-existing warnings on `paginated-response.dto.ts`, untouched).
- [x] `npm run test` — 20/20 pass (3 suites).
- [x] `npx tsc --noEmit` — 0 errors.
- [ ] Optional manual check via `npm run dev` + `/docs` — deferred to pre-PR review.

## [Web] apps/web

- [x] Add `subtitle: string | null` to the `Item` interface in `hooks/use-items.ts`.
- [x] Widen `useCreateItem` mutationFn arg with optional `subtitle?: string`.
- [x] Widen `useUpdateItem` mutationFn arg with optional `subtitle?: string`.
- [x] List page: render `{item.subtitle && <p className="text-sm font-medium text-muted-foreground">{item.subtitle}</p>}` between title and description.
- [x] Detail page: render `{item.subtitle && <p className="text-lg text-muted-foreground">{item.subtitle}</p>}` after title row.
- [x] New form: subtitle state + `<Input maxLength={200}>` between title and description; pass to mutation.
- [x] Edit form: extend `ItemFormProps` with `initialSubtitle`, mirror subtitle Input, forward `item.subtitle ?? ''` from `EditItemPage`.
- [x] `items.json` form group gains `subtitleLabel` ("Subtitle") and `subtitlePlaceholder` ("Enter a short tagline (optional)").
- [x] `__tests__/items-list.test.tsx` — second test pre-seeds `['items', 1, 20]` cache with one subtitled and one non-subtitled item; asserts presence and absence.
- [x] `e2e/items.spec.ts` — fills subtitle in create flow, asserts it on the list afterwards.
- [x] `npm run lint` — clean.
- [x] `npx tsc --noEmit` — clean.
- [x] `npx vitest run` — 2/2 pass.
- [ ] `npx playwright test e2e/items.spec.ts` — deferred to pre-PR review (requires api + web dev servers running).

## [Mobile] apps/mobile

- [x] `ItemConstraints.subtitleMaxLength = 200` added to `lib/models/constants.dart`.
- [x] `String? subtitle` added to `Item` Freezed factory in `lib/models/item.dart`.
- [x] `dart run build_runner build --delete-conflicting-outputs` — regenerated `item.freezed.dart` and `item.g.dart` successfully.
- [x] `items_repository.dart`: added `String? subtitle` param to `createItem` and `updateItem`; emits `if (subtitle != null) 'subtitle': subtitle` in both bodies.
- [x] `items_screen.dart` — `AppCard.subtitle` now `item.subtitle ?? item.description`.
- [x] `item_detail_screen.dart` — subtitle Text inserted with `AppSpacing.sm` separator above the existing description block.
- [x] `create_item_screen.dart` — added `_subtitleController` (declare + dispose), inserted `AppTextField` between title and description, passes `subtitle:` to `createItem`.
- [x] `edit_item_screen.dart` — same as create; initializes from `item.subtitle ?? ''` inside the `_initialized` gate.
- [x] `app_en.arb` gains `itemSubtitleLabel` and `itemSubtitleHint` with `@`-descriptions.
- [x] `flutter gen-l10n` ran via `l10n.yaml`; generated `AppLocalizations` exposes both keys.
- [x] `test/items_screen_subtitle_test.dart` created — overrides `itemsProvider` with two items, asserts subtitle/description fallback behavior.
- [x] `flutter analyze` — 0 errors / 0 warnings (11 info-level style suggestions, mostly pre-existing patterns).
- [x] `flutter test` — 2/2 pass (`widget_test.dart` + `items_screen_subtitle_test.dart`).

## [Shared] release hygiene

- [x] Prisma migration `20260429190105_add_item_subtitle/` committed in the API milestone commit.
- [x] `apps/mobile/lib/models/item.freezed.dart` and `item.g.dart` will be staged in the mobile commit. `apps/mobile/lib/core/l10n/generated/*` is gitignored — confirmed via `git check-ignore`.
- [x] No hardcoded English in feature code — all new strings live in `items.json` (web) and `app_en.arb` (mobile).
- [x] No hardcoded visual values — subtitle uses Tailwind tokens on web (`text-sm`/`text-lg`/`text-muted-foreground`) and `AppTypography`/`AppSpacing` on mobile.
- [x] Surprises captured in `add-item-subtitle-learnings.md`.
