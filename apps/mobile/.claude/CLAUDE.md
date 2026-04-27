# Mobile — Claude Guide

Implementation rules for `apps/mobile`. See root `.claude/CLAUDE.md` for cross-app policy.

## Stack

- Flutter (latest stable) + Dart
- Riverpod 2.x (plain providers — no `@riverpod` annotation)
- GoRouter 14.x
- Dio 5.x
- Freezed + json_serializable for models
- Google Fonts (Nunito Sans)
- flutter_localizations for i18n via `.arb` files

## Layout

Feature-first with a shared `core/`:

```
lib/
  main.dart                  ProviderScope, MaterialApp.router, locale delegates
  core/
    env/env.dart             --dart-define config (API_BASE_URL)
    network/
      api_client.dart        Dio + dioProvider, error interceptor → AppException
      api_exception.dart     sealed AppException hierarchy
    routing/
      app_routes.dart        path constants + helpers
      app_router.dart        GoRouter with appRouterProvider
    theme/
      app_colors.dart        primaryBlue, accents, surface, border
      app_typography.dart    Nunito Sans text styles
      app_spacing.dart       AppSpacing, AppRadius, AppSizes
      app_theme.dart         Material 3 light theme
    l10n/
      app_en.arb             user-facing strings
      generated/             auto-generated AppLocalizations (gitignored)
    widgets/
      app_card.dart          generic Card + ListTile
      app_form_fields.dart   AppTextField with themed border + label
  models/
    constants.dart           ItemConstraints (titleMaxLength, etc.)
    item.dart                Freezed model
    pagination.dart          Freezed PaginationMeta
  features/
    home/presentation/home_screen.dart
    items/
      data/items_repository.dart
      providers/items_provider.dart
      presentation/
        items_screen.dart
        item_detail_screen.dart
        create_item_screen.dart
        edit_item_screen.dart
test/
  widget_test.dart           HomeScreen smoke test
```

## Implementation rules

1. **All data models use Freezed** — `abstract class X with _$X { ... }` (Freezed 3 syntax).
2. **Providers are plain `Provider` / `FutureProvider` / `AsyncNotifierProvider`** — no annotations or generators.
3. **All HTTP calls go through a repository.** UI never imports Dio directly.
4. **Every user-visible string is in `app_en.arb`.** Access via `AppLocalizations.of(context)!`. Run `flutter gen-l10n` after editing.
5. **Use `GoRouter`** — `context.push()`, `context.go()`, `context.pop()`. No `Navigator.push`.
6. **Handle loading/error/empty states** for every async screen — `AsyncValue.when` is the standard pattern.
7. **No hardcoded visual values.** Spacing → `AppSpacing.*`, colors → `AppColors.*`, text styles → `AppTypography.*`, radii → `AppRadius.*`, sizes → `AppSizes.*`.
8. **No hardcoded numeric limits** in feature code — define them in `models/constants.dart` (e.g. `ItemConstraints.titleMaxLength`).
9. **Reuse `core/widgets/`** — `AppCard`, `AppTextField` exist for any feature, not just Items. Add new shared widgets there.
10. **Import order**: `dart:` → `package:` → relative.
11. **Mounted checks** — after any `await` followed by `BuildContext` use, check `context.mounted` before touching it.
12. **Error mapping** — the interceptor sets the typed `AppException` on `DioException.error`. Catch `DioException` and read `e.error` (a single field, e.g. `if (e.error is NotFoundException)`) to access the typed exception.

## API integration

- Base URL via `Env.apiBaseUrl` (`--dart-define-from-file=.env`)
- All routes prefixed `/v1` (already in the base URL by default)
- Pagination response maps to a record `({List<T> data, PaginationMeta meta})` in repositories — repositories don't return raw maps

## Adding a new feature

1. Create `lib/features/<name>/` with `data/`, `providers/`, `presentation/`
2. Add Freezed models to `lib/models/` if they're shared across features
3. Add domain constants (max lengths, etc.) to `lib/models/constants.dart`
4. Add `AppRoutes.<name>` constants and register routes in `app_router.dart`
5. Add l10n keys to `app_en.arb`, run `flutter gen-l10n`
6. Use existing `core/widgets/` (`AppCard`, `AppTextField`) — only build new ones if reusable elsewhere

## Quality gates

```bash
flutter analyze   # 0 errors, 0 warnings
flutter test      # all pass
flutter gen-l10n  # after .arb edits
dart run build_runner build --delete-conflicting-outputs  # after model/provider changes
```

## Naming

- Files: `snake_case.dart`
- Classes: `PascalCase`
- Variables/functions: `camelCase`
- Providers: `<name>Provider` (e.g. `itemsProvider`)
- Routes: `AppRoutes.<name>` (kebab-case path strings)
