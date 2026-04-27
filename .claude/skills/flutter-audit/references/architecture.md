# Architecture & Code Quality Checklist

## Project Structure

### Folder Organization
- Is the `lib/` folder organized by feature (e.g., `features/auth/`, `features/iap/`, `features/events/`) or by layer (e.g., `models/`, `services/`, `widgets/`)? Feature-based scales better for apps with distinct functional areas.
- Is there a clear separation between feature modules and cross-cutting infrastructure (networking, auth, storage)? If these are tangled together, changes to one break the other.
- Are platform-specific utilities (permissions, biometrics, connectivity checks) isolated from business logic?
- Is there a shared or core directory for cross-cutting concerns (theming, constants, routing, error handling)?

### Dependency Direction
- Do feature modules depend on a core/shared layer, or do they import directly from each other? Feature-to-feature imports create circular dependencies and make features impossible to modify in isolation.
- Is the IAP module self-contained, or does it reach into other feature modules (and vice versa)? Features should communicate through well-defined interfaces or events, not direct calls.

## State Management

### Consistency
- Is a single state management approach used consistently, or are multiple paradigms mixed (e.g., Provider in some screens, setState in others, Riverpod in yet others)? Mixing paradigms makes state flow unpredictable and onboarding harder.
- If using Riverpod: are providers properly scoped and disposed? Global providers that hold user-specific state (auth tokens, purchase status) persist across logouts if not explicitly invalidated.
- If using Bloc: are Blocs properly closed when their widgets are disposed? Unclosed Blocs leak memory and can emit events to dead widgets.
- If using Provider: are ChangeNotifiers disposed? Are there ChangeNotifiers that rebuild large subtrees when only a small piece of state changes?

### Auth State
- Is there a single source of truth for authentication state? Auth state can exist in secure storage, in a state management object, and implicitly in API interceptors — if these disagree, the user sees broken UI or gets logged out unexpectedly.
- Is auth state reactive? When the user logs in or out, does the entire app update immediately (route guards, data providers, UI) or only on next screen navigation?
- Is IAP entitlement state kept in sync with auth state? When a user logs out, are their cached entitlements cleared?

## Dart Code Quality

### Type Safety
- Is `analysis_options.yaml` configured with strict rules? At minimum: `strict-casts: true`, `strict-raw-types: true`, `strict-inference: true`. Without these, Dart silently permits unsafe type operations.
- Are `dynamic` types used anywhere outside of JSON deserialization boundaries? Each `dynamic` is a runtime crash waiting to happen.
- Are there type casts (`as SomeType`) without prior type checks? These throw at runtime if the type doesn't match.

### Null Safety
- Is the project fully null-safe (no `// @dart=2.x` opt-outs, no legacy dependencies without null-safe versions)?
- Are there force-unwrap operators (`!`) used on nullable values? Each one is an assertion that could throw `Null check operator used on a null value` — one of the most common Flutter crash reports.
- Are nullable fields from JSON deserialization or platform channels handled defensively?

### Async Patterns
- Are there `async` functions where the `Future` return value is silently discarded (fire-and-forget without error handling)? Unhandled Future errors crash the app or silently swallow failures.
- Is `await` missing on Futures that should complete before the next line executes? This causes race conditions — particularly dangerous in IAP flows where purchase state and UI state can desync.
- Are Streams properly cancelled in `dispose()`? Uncancelled stream subscriptions are a memory leak and can cause `setState called after dispose` errors.

### Error Handling
- Is there a global error handler (`FlutterError.onError`, `PlatformDispatcher.instance.onError`, `runZonedGuarded`)? Without one, unhandled exceptions crash the app silently — no logging, no crash reporting, no user feedback.
- Are errors caught at the right granularity? Broad `catch (e)` blocks that swallow all exceptions hide bugs. Specific exception types should be caught where they can be handled meaningfully.
- Are error messages user-facing or developer-facing? Stack traces shown to users are both confusing and a security leak.

### Dead Code & Dependencies
- Are there unused imports, unreferenced classes, or commented-out code blocks? These add noise and maintenance burden.
- Are there dependencies in `pubspec.yaml` that aren't actually used in the codebase? Each unused dependency adds to app size and attack surface.
- Are dependency versions pinned or using open ranges? Open ranges (`^x.y.z`) can pull in breaking changes on `flutter pub get`.

## Widget Design

### Decomposition
- Are there widget `build()` methods longer than ~100 lines? Long build methods are hard to maintain and cause unnecessary rebuilds of the entire subtree.
- Are there "god widgets" that manage state, make API calls, handle navigation, AND render UI? Widgets should do one thing — either manage state or render UI, not both.
- Are reusable UI components extracted into their own widget classes, or is the same UI code copy-pasted across screens?

### Keys
- Are `Key`s used correctly in lists and dynamically generated widgets? Missing keys in `ListView.builder` or `AnimatedList` cause incorrect state preservation, flickering, and reorder bugs.
- Are `GlobalKey`s overused? Each GlobalKey is a singleton reference that prevents widget reuse and can cause "Multiple widgets used the same GlobalKey" crashes.

## Routing & Navigation

- Is there a defined routing strategy (GoRouter, auto_route, Navigator 2.0, etc.), or is navigation done ad-hoc with `Navigator.push`?
- Does the routing handle deep links? Is the mapping between deep link paths and app screens clear and maintainable?
- Are route guards implemented for authenticated-only screens? Can a user navigate to a premium feature screen without a valid subscription?
- Is the back button behavior correct on both platforms? On Android, does the back button navigate through the route stack correctly before exiting the app?
