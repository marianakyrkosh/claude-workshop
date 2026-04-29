---
slug: add-item-subtitle
source: docs/sprints/sprint1.md#1
title: Item subtitle
---

# REQUEST — Item subtitle

## Summary

Add an optional `subtitle` field to the `Item` model so users can give an item a short tagline rendered below the title. Plain string, max 200 chars, optional everywhere; surfaced across api, web, and mobile.

## In scope

- `apps/api`
  - `Item.subtitle String?` in `prisma/schema.prisma` + migration `add_item_subtitle`.
  - `subtitle?: string` on `CreateItemDto` (class-validator: `@IsOptional`, `@IsString`, `@MaxLength(200)`; `@ApiPropertyOptional`). `UpdateItemDto` inherits via `PartialType` — no change needed there.
  - Service/controller already use `dto` directly, so no logic change beyond DTO. Confirm Swagger renders the new optional field.
  - Extend `items.service.spec.ts` and `items.controller.spec.ts` to cover create + update with `subtitle`.
- `apps/web`
  - Surface `subtitle` (when present) in:
    - `app/[locale]/items/page.tsx` — under the title in each card.
    - `app/[locale]/items/[id]/page.tsx` — under the heading on the detail page.
    - `app/[locale]/items/new/page.tsx` and `app/[locale]/items/[id]/edit/page.tsx` — single-line `<Input>` below the title with `maxLength={200}`.
  - Update `hooks/use-items.ts`:
    - Add `subtitle: string | null` to the local `Item` interface.
    - Extend the param types of `useCreateItem` / `useUpdateItem` mutations to accept optional `subtitle`.
  - Add translation keys to `apps/web/locales/en/items.json`:
    - `form.subtitleLabel` → "Subtitle"
    - `form.subtitlePlaceholder` → "Enter a short tagline (optional)"
  - Existing items render unchanged when `subtitle` is `null`.
- `apps/mobile`
  - Add `String? subtitle` to the `Item` Freezed model at `lib/models/item.dart`. Run `dart run build_runner build --delete-conflicting-outputs` to regenerate `item.freezed.dart` / `item.g.dart`.
  - Add `static const int subtitleMaxLength = 200;` to `lib/models/constants.dart` (`ItemConstraints`).
  - Update `lib/features/items/data/items_repository.dart` to send `subtitle` in `createItem` / `updateItem` and rely on Freezed for receive (json key matches model).
  - Surface `subtitle` in:
    - `items_screen.dart` — under the title in each list tile (only when non-null).
    - `item_detail_screen.dart` — under the title heading (only when non-null).
    - `create_item_screen.dart` and `edit_item_screen.dart` — additional `AppTextField` below the title; honor `ItemConstraints.subtitleMaxLength`.
  - Add ARB keys to `lib/core/l10n/app_en.arb`:
    - `itemSubtitleLabel` → "Subtitle"
    - `itemSubtitleHint` → "Enter a short tagline (optional)"
  - Run `flutter gen-l10n` and consume via `AppLocalizations.of(context)!`.
  - Reuse `AppTextField` / `AppCard` / theme tokens — no hardcoded visual values.

## Out of scope

- Search / filter on subtitle.
- Markdown / rich-text rendering of subtitle (plain string only).
- iOS/Android platform-specific validation beyond shared model rules.
- Backfill of subtitle on existing rows (column is nullable, no default needed).

## Impacted layers

- DB schema (`apps/api/prisma/schema.prisma` + new migration)
- `apps/api` (DTOs, Swagger, specs)
- `apps/web` (hook types, list/detail/forms, i18n)
- `apps/mobile` (Freezed model, repository, presentation screens, i18n)
- `packages/types` — see Open question below; default is **no change** (current `Item` shape is duplicated in web hook + mobile Freezed model and not exported from `@repo/types`).

## API contract impact

- No new routes. Same paths: `POST /v1/items`, `PATCH /v1/items/:id`, `GET /v1/items[/:id]`.
- Request shapes: `CreateItemDto` and `UpdateItemDto` gain optional `subtitle: string` (≤ 200 chars).
- Response shape: every `Item` returned by api now includes `subtitle: string | null`.
- Backward-compatible additive change — existing clients that ignore unknown fields stay green. Older mobile builds without the model field will throw on `Item.fromJson` only if the JSON parser is strict; current Freezed setup uses `json_serializable` defaults which tolerate extra keys, so old builds keep working (subtitle just won't be visible).

## Data model impact

- `Item` gains `subtitle String?` (nullable, no default).
- Migration: `npx prisma migrate dev --name add_item_subtitle`. Prisma will generate `ALTER TABLE "Item" ADD COLUMN "subtitle" TEXT;` — safe under concurrent writes (nullable add, no default).
- Run `npx prisma generate` (handled automatically by `migrate dev`).
- No new indexes needed — subtitle is not queried.

## i18n impact

- Web — add to `apps/web/locales/en/items.json` under `form`:
  - `subtitleLabel`
  - `subtitlePlaceholder`
- Mobile — add to `apps/mobile/lib/core/l10n/app_en.arb`:
  - `itemSubtitleLabel`
  - `itemSubtitleHint`

  Both with descriptions, then run `flutter gen-l10n`.

- Other locales: starter ships English only; no other ARB / locale JSON files to update.

## Test plan

- `apps/api`
  - `items.service.spec.ts` — extend `create` test to include `subtitle`; add `update` partial test that sets only `subtitle`.
  - `items.controller.spec.ts` — extend `create` and `update` cases to pass `subtitle` through.
  - DTO validation — covered transitively by the bootstrap `ValidationPipe`; rely on existing global config (no new spec needed unless we want explicit `@MaxLength` coverage — see Open question).
- `apps/web`
  - `__tests__/items-list.test.tsx` — render an item with a `subtitle` and assert it appears under the title; render one without and assert no extra node.
  - `e2e/items.spec.ts` — extend the create flow to fill the subtitle input and assert it shows on the list afterward.
- `apps/mobile`
  - No existing item widget tests — only `test/widget_test.dart` (HomeScreen smoke test). Plan: add a minimal widget test for `items_screen.dart` (or a focused render of the item list tile) that asserts the subtitle line shows when present and is absent when null. See Open question.
  - `flutter analyze` (0 / 0) and `flutter test` must pass.

## Risks & assumptions

- **Risk — older mobile builds in the wild**: assumes `json_serializable`'s default `disallowUnrecognizedKeys: false` (no key allowlist). Verified: current `Item` has no `@JsonSerializable(disallowUnrecognizedKeys: true)`, so old builds will silently ignore `subtitle`.
- **Risk — duplicated `Item` shape drift**: web hook and mobile Freezed model each define their own `Item`. Adding `subtitle` requires editing both. Open question proposes consolidating into `@repo/types` — left as planning-time decision.
- **Assumption — single-line subtitle is enough**: spec says "single-line input" for web, `AppTextField` for mobile (default single-line). No multi-line support.
- **Assumption — Swagger annotation is `@ApiPropertyOptional({ description, maxLength: 200 })`** matching the existing `description` field pattern.
- **Assumption — no need to update seed/fixture data**; current starter doesn't seed items.

## Open questions

1. **Should `Item` move into `packages/types` now?** The sprint says "if the team agrees during planning." Moving consolidates web + future mobile/api consumers (api would still use Prisma's generated type, but DTOs/responses can reference `@repo/types`). Recommendation: defer to plan stage; default to **leave duplicated** to keep this PR scoped.
2. **Should the API spec add an explicit `@MaxLength(200)` failure case?** Current specs don't exercise validation pipe failures. Recommendation: skip — global `ValidationPipe` is already covered by NestJS, and no other DTO has a max-length spec here.
3. **Mobile widget test scope** — given there are no existing item widget tests, do we add one for the new field, or accept analyze-only coverage on mobile? Recommendation: add one minimal widget test for `items_screen.dart` rendering subtitle (low cost, prevents regression). Confirm at plan stage.

## Acceptance criteria

- [ ] `subtitle` is optional everywhere — items with `subtitle = null` render unchanged on web list, web detail, mobile list, and mobile detail.
- [ ] Max length is enforced on web (`maxLength={200}`) and mobile (`AppTextField` `maxLength`) and api (`@MaxLength(200)`).
- [ ] Every new user-visible string is in `locales/en/items.json` (web) or `app_en.arb` (mobile); no hardcoded English in feature code.
- [ ] `npm run lint`, `npm run test`, and `npx tsc --noEmit` pass for both `apps/api` and `apps/web`.
- [ ] `flutter analyze` (0 errors / 0 warnings) and `flutter test` pass for `apps/mobile`.
- [ ] Prisma migration is committed and named `add_item_subtitle`.
- [ ] Generated mobile files (`item.freezed.dart`, `item.g.dart`, l10n outputs if not gitignored) are committed alongside the source.
- [ ] Swagger at `/docs` lists `subtitle` as an optional property on the create/update item schemas with `maxLength: 200`.
- [ ] Web e2e create flow can fill subtitle and observe it on the list.
