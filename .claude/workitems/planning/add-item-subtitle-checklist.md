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

- [ ] Add `subtitle String?` to the `Item` model in `apps/api/prisma/schema.prisma` (between `title` and `description`).
- [ ] From `apps/api`, run `npx prisma migrate dev --name add_item_subtitle`. Verify the new file under `prisma/migrations/<ts>_add_item_subtitle/migration.sql` contains `ALTER TABLE "Item" ADD COLUMN "subtitle" TEXT;` and that `prisma generate` runs cleanly.
- [ ] Add `subtitle?: string` to `CreateItemDto` (`apps/api/src/items/dto/create-item.dto.ts`) with decorators `@IsOptional()`, `@IsString()`, `@MaxLength(200)`, and `@ApiPropertyOptional({ description: 'Item subtitle / tagline', maxLength: 200 })`.
- [ ] Confirm `UpdateItemDto` still extends `PartialType(CreateItemDto)` — no change required; verify with a quick read.
- [ ] Update the `mockItem` fixture in `apps/api/src/items/items.service.spec.ts` to include `subtitle: null`. Extend the existing `create` test to pass a `subtitle` and assert it round-trips through `prisma.item.create`.
- [ ] Add a new `update` test in `items.service.spec.ts` that updates only `subtitle` and asserts `prisma.item.update` was called with `data: { subtitle: ... }`.
- [ ] Update the `mockItem` fixture in `apps/api/src/items/items.controller.spec.ts` to include `subtitle: null`. Extend the existing `should create an item` and `should update an item` tests to pass `subtitle` and assert it propagates.
- [ ] From `apps/api`, run `npm run lint` and confirm zero errors.
- [ ] From `apps/api`, run `npm run test` and confirm all suites pass (Items service + controller, plus Health).
- [ ] From `apps/api`, run `npx tsc --noEmit` and confirm zero errors.
- [ ] Optional manual check: start `npm run dev`, hit `POST /v1/items` with a `subtitle`, confirm response includes it; visit `/docs` and confirm Swagger lists `subtitle` as optional with `maxLength: 200`.

## [Web] apps/web

- [ ] In `apps/web/hooks/use-items.ts`, add `subtitle: string | null` to the `Item` interface (after `description`).
- [ ] Widen the `useCreateItem` `mutationFn` arg type from `{ title: string; description?: string }` to `{ title: string; description?: string; subtitle?: string }`.
- [ ] Widen the `useUpdateItem` `mutationFn` arg type from `{ title?: string; description?: string }` to `{ title?: string; description?: string; subtitle?: string }`.
- [ ] In `apps/web/app/[locale]/items/page.tsx`, after the `<h2>{item.title}</h2>` line in the list card, insert `{item.subtitle && <p className="text-sm font-medium text-muted-foreground">{item.subtitle}</p>}` (before the existing description paragraph).
- [ ] In `apps/web/app/[locale]/items/[id]/page.tsx`, after the title/actions row and before the description paragraph, insert `{item.subtitle && <p className="text-lg text-muted-foreground">{item.subtitle}</p>}`.
- [ ] In `apps/web/app/[locale]/items/new/page.tsx`:
  - Add `const [subtitle, setSubtitle] = useState('')`.
  - Add a `<div className="space-y-2">` block between the title field and the description field with a `<Label htmlFor="subtitle">{t('form.subtitleLabel')}</Label>` and an `<Input id="subtitle" value={subtitle} onChange={...} maxLength={200} placeholder={t('form.subtitlePlaceholder')} />`.
  - In the `createItem.mutate` payload, add `subtitle: subtitle || undefined`.
- [ ] In `apps/web/app/[locale]/items/[id]/edit/page.tsx`:
  - Extend the `ItemFormProps` interface with `initialSubtitle: string`.
  - In `EditItemForm`, add `const [subtitle, setSubtitle] = useState(initialSubtitle)`.
  - Render the same subtitle `<Input>` block (mirroring the new-item page) between the title and description fields.
  - Add `subtitle: subtitle || undefined` to the `updateItem.mutate` payload.
  - In `EditItemPage`, pass `initialSubtitle={item.subtitle ?? ''}` to `<EditItemForm>`.
- [ ] In `apps/web/locales/en/items.json`, add `"subtitleLabel": "Subtitle"` and `"subtitlePlaceholder": "Enter a short tagline (optional)"` inside the `form` object (placed between the title and description groups).
- [ ] In `apps/web/__tests__/items-list.test.tsx`, add a second test that pre-seeds the `QueryClient` cache with `queryClient.setQueryData(['items', 1, 20], { data: [...one item with subtitle, one without...], meta: {...} })`, renders the page, and asserts (a) the subtitle text appears for the first item, (b) it does not appear for the second, (c) both titles are visible.
- [ ] In `apps/web/e2e/items.spec.ts`, in the `should create a new item` test, fill the subtitle field after the title (e.g. `await page.getByLabel('Subtitle').fill('A neat tagline')`) and assert the tagline is visible on the items list afterwards.
- [ ] From `apps/web`, run `npm run lint` and confirm zero errors.
- [ ] From `apps/web`, run `npx tsc --noEmit` and confirm zero errors.
- [ ] From `apps/web`, run `npx vitest run` and confirm all tests pass.
- [ ] From `apps/web`, run `npx playwright test e2e/items.spec.ts` (with the api running) and confirm the create flow + new subtitle assertion pass.

## [Mobile] apps/mobile

- [ ] In `apps/mobile/lib/models/constants.dart`, add `static const int subtitleMaxLength = 200;` inside `ItemConstraints` (after `descriptionMaxLength`).
- [ ] In `apps/mobile/lib/models/item.dart`, add `String? subtitle,` to the `Item` Freezed factory between `title` and `description`.
- [ ] From `apps/mobile`, run `dart run build_runner build --delete-conflicting-outputs`. Confirm `lib/models/item.freezed.dart` and `lib/models/item.g.dart` regenerate without errors.
- [ ] In `apps/mobile/lib/features/items/data/items_repository.dart`:
  - Add `String? subtitle` parameter to `createItem` (between `title` and `description`).
  - Add `if (subtitle != null) 'subtitle': subtitle` to the `_dio.post` body.
  - Add `String? subtitle` parameter to `updateItem`.
  - Add `if (subtitle != null) 'subtitle': subtitle` to the `_dio.patch` body.
- [ ] In `apps/mobile/lib/features/items/presentation/items_screen.dart`, change `subtitle: item.description` on the `AppCard` call to `subtitle: item.subtitle ?? item.description`.
- [ ] In `apps/mobile/lib/features/items/presentation/item_detail_screen.dart`, between the title `Text(item.title, ...)` and the existing `if (item.description != null) ...` block, insert:
  - `if (item.subtitle != null) ...[const SizedBox(height: AppSpacing.sm), Text(item.subtitle!, style: AppTypography.body)]`.
  - Adjust spacing so there's no double-gap when subtitle is present.
- [ ] In `apps/mobile/lib/features/items/presentation/create_item_screen.dart`:
  - Declare `final _subtitleController = TextEditingController();`.
  - Dispose it in `dispose()`.
  - Add an `AppTextField` between title and description with `label: l10n.itemSubtitleLabel`, `maxLength: ItemConstraints.subtitleMaxLength`, and an `AppSpacing.lg` `SizedBox` separator after it.
  - In `_submit`, pass `subtitle: _subtitleController.text.trim().isNotEmpty ? _subtitleController.text.trim() : null` to `createItem`.
- [ ] In `apps/mobile/lib/features/items/presentation/edit_item_screen.dart`:
  - Declare and dispose `_subtitleController`.
  - In the `_initialized` gate inside `data: (item)`, set `_subtitleController.text = item.subtitle ?? ''`.
  - Render the same `AppTextField` between title and description.
  - In `_submit`, pass `subtitle: _subtitleController.text.trim().isNotEmpty ? _subtitleController.text.trim() : null` to `updateItem`.
- [ ] In `apps/mobile/lib/core/l10n/app_en.arb`, add `itemSubtitleLabel` ("Subtitle") and `itemSubtitleHint` ("Enter a short tagline (optional)") with `@`-descriptions matching the file's existing style.
- [ ] From `apps/mobile`, run `flutter gen-l10n` and confirm the generated `AppLocalizations` exposes `itemSubtitleLabel` and `itemSubtitleHint`.
- [ ] Create `apps/mobile/test/items_screen_subtitle_test.dart`:
  - Pump `ProviderScope` with `itemsProvider` overridden to deliver `({data: [Item(... subtitle: 'Tagline'), Item(... subtitle: null, description: 'Desc')], meta: ...})`.
  - Wrap in `MaterialApp` with `localizationsDelegates: AppLocalizations.localizationsDelegates`, `supportedLocales: AppLocalizations.supportedLocales`.
  - Assert `find.text('Tagline')` finds one widget.
  - Assert `find.text('Desc')` finds one widget.
- [ ] From `apps/mobile`, run `flutter analyze`. Confirm 0 errors / 0 warnings.
- [ ] From `apps/mobile`, run `flutter test`. Confirm all tests pass (existing `widget_test.dart` + new subtitle test).

## [Shared] release hygiene

- [ ] Confirm the Prisma migration directory is staged and committed (do not regenerate later or it'll diverge).
- [ ] Confirm `apps/mobile/lib/models/item.freezed.dart`, `apps/mobile/lib/models/item.g.dart`, and any updated files under `apps/mobile/lib/core/l10n/generated/` are committed if not gitignored. (Check `.gitignore` first; if generated l10n is gitignored, skip those.)
- [ ] Confirm no hardcoded English remains in the new web/mobile feature code (grep for the literal labels you added — they should appear only in `items.json` and `app_en.arb`).
- [ ] Confirm no hardcoded visual values (px, hex, font literals) appear in the new code.
- [ ] Capture any surprises in `.claude/workitems/development/add-item-subtitle-learnings.md`.
