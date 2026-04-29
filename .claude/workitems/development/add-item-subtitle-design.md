---
slug: add-item-subtitle
source: docs/sprints/sprint1.md#1
related:
  - .claude/workitems/feedback/REQUEST-add-item-subtitle.md
  - .claude/workitems/planning/add-item-subtitle-checklist.md
---

# DESIGN — Item subtitle

## Goal

Add an optional, plain-text `subtitle` (max 200 chars) to `Item`. Surface it under the title on web list, web detail, mobile list, and mobile detail; expose it as a single-line input on create/edit forms in both apps. Backward-compatible additive change — existing items without a subtitle render unchanged.

## Architecture at a glance

```
Prisma (Item.subtitle String?)  ──►  CreateItemDto / UpdateItemDto (@MaxLength(200))
            │                                       │
            ▼                                       ▼
  Postgres column "subtitle" TEXT NULL    NestJS controllers (no logic change)
                                                    │
                                                    ▼
                                       JSON: { subtitle: string | null }
                              ┌────────────────────┴────────────────────┐
                              ▼                                         ▼
                     apps/web hooks/use-items.ts             apps/mobile lib/models/item.dart
                     Item.subtitle: string | null            Item.subtitle: String?
                              │                                         │
                ┌─────────────┼──────────────┐               ┌──────────┼──────────┐
                ▼             ▼              ▼               ▼          ▼          ▼
          items list   items/[id]     items/new + edit   items_screen  detail  create/edit
```

## File map

### `apps/api`

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | modify | Add `subtitle String?` to `Item`. |
| `prisma/migrations/<ts>_add_item_subtitle/migration.sql` | create (via `prisma migrate dev`) | `ALTER TABLE "Item" ADD COLUMN "subtitle" TEXT;` — nullable, no default, safe under concurrent writes. |
| `src/items/dto/create-item.dto.ts` | modify | Add `subtitle?: string` with `@IsOptional() @IsString() @MaxLength(200) @ApiPropertyOptional({ description, maxLength: 200 })`. |
| `src/items/dto/update-item.dto.ts` | no change | `PartialType(CreateItemDto)` inherits the new field automatically. |
| `src/items/items.service.ts` | no change | Service already passes `dto` straight through. |
| `src/items/items.controller.ts` | no change | Controller is a thin adapter. |
| `src/items/items.service.spec.ts` | modify | Add `subtitle` to mock fixture; extend create + update tests to include `subtitle`. |
| `src/items/items.controller.spec.ts` | modify | Same — fixture + create/update assertions. |

### `apps/web`

| File | Action | Notes |
|------|--------|-------|
| `hooks/use-items.ts` | modify | Add `subtitle: string | null` to local `Item` interface; widen `useCreateItem` / `useUpdateItem` mutation arg types to accept optional `subtitle`. |
| `app/[locale]/items/page.tsx` | modify | Render `{item.subtitle && <p className="text-sm font-medium text-muted-foreground">{item.subtitle}</p>}` between title and description. |
| `app/[locale]/items/[id]/page.tsx` | modify | Render `{item.subtitle && <p className="text-lg text-muted-foreground">{item.subtitle}</p>}` immediately under the `<h1>` title; description block remains. |
| `app/[locale]/items/new/page.tsx` | modify | Add `subtitle` `useState`, single-line `<Input>` with `maxLength={200}` between title and description; pass to `createItem.mutate({ ..., subtitle: subtitle || undefined })`. |
| `app/[locale]/items/[id]/edit/page.tsx` | modify | Mirror create form: extend `EditItemForm` props with `initialSubtitle`, add subtitle state + input, pass through to `updateItem.mutate`. Update `EditItemPage` to forward `item.subtitle ?? ''`. |
| `locales/en/items.json` | modify | Add `form.subtitleLabel` ("Subtitle") and `form.subtitlePlaceholder` ("Enter a short tagline (optional)"). |
| `__tests__/items-list.test.tsx` | modify | Add a test that pre-seeds `QueryClient` cache with `['items', 1, 20]` containing one item with a subtitle and one without; assert subtitle text appears for the first item and is absent for the second. |
| `e2e/items.spec.ts` | modify | In the existing `should create a new item` test, fill the subtitle input and assert the subtitle text is visible on the items list afterwards. |

### `apps/mobile`

| File | Action | Notes |
|------|--------|-------|
| `lib/models/constants.dart` | modify | Add `static const int subtitleMaxLength = 200;` to `ItemConstraints`. |
| `lib/models/item.dart` | modify | Add `String? subtitle,` to the Freezed `Item` factory between `title` and `description`. |
| `lib/models/item.freezed.dart` | regenerate | `dart run build_runner build --delete-conflicting-outputs`. |
| `lib/models/item.g.dart` | regenerate | same. |
| `lib/features/items/data/items_repository.dart` | modify | Add `String? subtitle` param to `createItem` and `updateItem`; emit `if (subtitle != null) 'subtitle': subtitle` in the request body. |
| `lib/features/items/presentation/items_screen.dart` | modify | Pass `subtitle: item.subtitle ?? item.description` to `AppCard` so subtitle (when present) takes precedence; otherwise current behavior unchanged. |
| `lib/features/items/presentation/item_detail_screen.dart` | modify | Insert `if (item.subtitle != null) Text(item.subtitle!, style: AppTypography.body)` between the title `Text` and the existing description block, with `AppSpacing.sm` separators. |
| `lib/features/items/presentation/create_item_screen.dart` | modify | Add `_subtitleController`, dispose it, render an `AppTextField(label: l10n.itemSubtitleLabel, maxLength: ItemConstraints.subtitleMaxLength)` between the title and description fields, and pass `subtitle:` through to the repository call. |
| `lib/features/items/presentation/edit_item_screen.dart` | modify | Mirror the create flow — initialize the controller from `item.subtitle ?? ''` in the same `_initialized` gate. |
| `lib/core/l10n/app_en.arb` | modify | Add `itemSubtitleLabel` ("Subtitle") and `itemSubtitleHint` ("Enter a short tagline (optional)") with `@`-descriptions matching the file's existing style. |
| `lib/core/l10n/generated/app_localizations*.dart` | regenerate | `flutter gen-l10n`. |
| `test/items_screen_subtitle_test.dart` | create | Minimal widget test: pump `ItemsScreen` with a stubbed `itemsProvider` overriding to deliver one item with `subtitle: 'Tagline'` and one without; assert `Tagline` appears, and the descriptionless item's title still renders. |

### `packages/types`

No change. Per planning decision, `Item` shape stays duplicated between `apps/web/hooks/use-items.ts` and `apps/mobile/lib/models/item.dart`; `@repo/types` continues to expose only pagination contracts.

## Implementation order

1. **API** — schema → migration → DTO → specs. Lock the contract first; the api can ship and remain backward-compatible to existing clients.
2. **Web** — hook type → list → detail → forms → translations → vitest → e2e. The web e2e depends on the api running with the new column.
3. **Mobile** — constants → Freezed model → `build_runner` → repository → ARB + `flutter gen-l10n` → screens → widget test → `flutter analyze` + `flutter test`.

Cross-cutting: keep `apps/api` migration committed with the source change in the same PR (single PR for the whole vertical slice).

## Data flow

- **Create**: web `useCreateItem({ title, description?, subtitle? })` → `POST /v1/items` → DTO accepts `subtitle?`, Prisma persists. Same for mobile via `ItemsRepository.createItem`.
- **Read list / detail**: API returns `subtitle: string | null` on every `Item`. Web typed via the local `Item` interface; mobile via Freezed `Item.subtitle`.
- **Update**: web `useUpdateItem(id).mutate({ subtitle?, ... })` → `PATCH /v1/items/:id` → DTO is `PartialType<CreateItemDto>`, accepts `subtitle?`. Same for mobile.

## i18n

- Web (`apps/web/locales/en/items.json`):
  ```json
  "form": {
    ...
    "subtitleLabel": "Subtitle",
    "subtitlePlaceholder": "Enter a short tagline (optional)"
  }
  ```
- Mobile (`apps/mobile/lib/core/l10n/app_en.arb`):
  ```json
  "itemSubtitleLabel": "Subtitle",
  "@itemSubtitleLabel": { "description": "Label for the subtitle input field on item create/edit screens" },
  "itemSubtitleHint": "Enter a short tagline (optional)",
  "@itemSubtitleHint": { "description": "Placeholder text for the subtitle input field" }
  ```

No other locales — starter ships English only.

## Test strategy

| Layer | Coverage | Tooling |
|-------|----------|---------|
| API service | create + update happy-path with `subtitle` set; existing tests already cover the no-subtitle case | Jest |
| API controller | thin pass-through assertions for `create` + `update` with `subtitle` | Jest |
| Web unit | items list renders `subtitle` when present, omits when null | Vitest + Testing Library + `QueryClient.setQueryData` |
| Web e2e | create flow fills subtitle → list shows subtitle | Playwright |
| Mobile widget | items_screen renders subtitle for an item that has one, falls back to description for one that doesn't | flutter_test with provider override |
| Mobile static | `flutter analyze` 0/0 | flutter analyze |

Skipped (per planning decision): explicit `@MaxLength` validation-failure spec on the api.

## Migration & rollout

- Migration name: `add_item_subtitle`. Generated SQL: `ALTER TABLE "Item" ADD COLUMN "subtitle" TEXT;` — nullable, no default, no rewrite, safe under concurrent writes.
- `npx prisma generate` runs as part of `prisma migrate dev`; commit `prisma/migrations/<ts>_add_item_subtitle/` alongside the schema change.
- Rollout is single-PR — api, web, mobile move together. Older mobile builds in the wild will continue to work because `json_serializable` ignores extra keys (`Item` is not annotated with `disallowUnrecognizedKeys: true`); they just won't display the field.

## Compatibility risks

- **Older deployed mobile clients**: subtitle silently ignored — verified by the absence of `disallowUnrecognizedKeys: true` on the Freezed model. No app-store rollback risk.
- **Older web bundles**: served from the same deployment, so they update with the api. No risk.
- **Existing rows**: column is nullable — no backfill, all existing items render unchanged.
- **Mobile list tile UX choice**: feeding `item.subtitle ?? item.description` to `AppCard.subtitle` means an item with both a subtitle *and* a description will only show the subtitle on the list tile. Description still appears on the detail screen. This is the minimum-scope choice; if we want both lines on the tile, we'd need to extend `AppCard` — out of scope for this slice.

## User-confirmed decisions

1. **`Item` does not move into `packages/types`.** Local types stay in `apps/web/hooks/use-items.ts` and `apps/mobile/lib/models/item.dart`.
2. **No explicit `@MaxLength(200)` validation-failure spec.** Trust the global `ValidationPipe`.
3. **Add a minimal mobile widget test** for `items_screen.dart` covering subtitle render.
