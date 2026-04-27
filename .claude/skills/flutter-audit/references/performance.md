# Performance Checklist

## Widget Rebuild Optimization

### Unnecessary Rebuilds
- Are there widgets that rebuild on every frame or every state change when they don't need to? Use `const` constructors wherever possible — a `const` widget is never rebuilt when its parent rebuilds.
- Are large widget trees inside a single `StatefulWidget` that calls `setState()` frequently? When `setState` is called, the entire subtree of that widget rebuilds. If only a small portion needs to change, that portion should be extracted into its own widget or use a targeted state management solution.
- If using `AnimatedBuilder`, `ValueListenableBuilder`, or `StreamBuilder`: are they placed as low in the tree as possible? A `StreamBuilder` at the root of a screen rebuilds every child widget on every stream event.

### Build Method Efficiency
- Are expensive computations (sorting, filtering, complex calculations) happening inside `build()` methods? These re-execute on every rebuild. Move them to state initialization, `didChangeDependencies()`, or memoize them.
- Are new objects (lists, maps, callbacks) created inside `build()`? Creating new instances means child widgets that depend on them can't skip rebuilds via equality checks. Hoist stable objects out of build.

## Memory Management

### Leak Patterns
- Are `ScrollController`, `AnimationController`, `TextEditingController`, and `FocusNode` instances disposed in `dispose()`? Each undisposed controller is a memory leak.
- Are stream subscriptions cancelled in `dispose()`? This is the most common source of "setState called after dispose" errors and memory leaks in Flutter.
- Are `ChangeNotifier` listeners removed in `dispose()` if added manually (not via Provider/Riverpod)?
- Are images and large assets released when no longer visible? Keeping decoded images in memory for off-screen widgets consumes significant RAM.

### Platform View Memory
- If the app uses platform views (maps, camera previews, native ad widgets), are they disposed when not visible? Each platform view allocates a separate rendering surface with its own memory budget.
- On Android, is the `onRenderProcessGone` callback handled for any platform views that use a separate renderer? A memory-related crash in a platform view should trigger recovery, not a blank screen.

## App Startup Performance

### Cold Start Time
- What happens during app initialization? List every synchronous operation between `main()` and the first frame. Common culprits: Hive/SQLite initialization, RevenueCat configuration, Firebase initialization, SharedPreferences reads. If these are sequential and synchronous, they add up.
- Is the splash screen / native launch screen configured to cover the initialization period? Without it, the user sees a blank screen between tapping the icon and the first Flutter frame.
- Are heavy initializations deferred until after the first frame? Operations like RevenueCat offering fetch, analytics initialization, and remote config fetch can happen after the UI is visible.

### Lazy Loading
- Are screens and features loaded lazily, or is the entire app initialized upfront? Features the user may never visit (settings, help, IAP paywall) should be lazily imported/initialized.

## API & Network Performance

### Request Efficiency
- Are API calls deduplicated? If multiple widgets on the same screen each independently fetch the same data, the app makes redundant requests. With Riverpod, the same provider watched by multiple widgets should share a single fetch.
- Are list endpoints paginated? Unbounded list fetches are fine with 50 items and catastrophic with 50,000. Check that the app doesn't fetch all items when only showing the first page.
- Is there a caching strategy for frequently accessed, rarely changing data? Without caching, every screen navigation triggers a network request — adding latency and data usage.

## App Size

### Build Output
- What is the release APK/IPA size? Is it reasonable for the app's functionality? A native Flutter app with IAP should typically be well under 30MB. If significantly larger, investigate.
- Is the `--analyze-size` flag used during release builds to understand what contributes to the binary? Common bloat: bundled assets (fonts, images), unused native libraries, debug info in release builds.

### Asset Optimization
- Are images in the appropriate format and resolution? Include only the necessary density variants (`1x`, `2x`, `3x`) — missing variants means Flutter scales up lower-res images, but including unused densities wastes space.
- Are fonts subsetted? Custom fonts that include full Unicode ranges (CJK, Arabic, Cyrillic) when the app only uses Latin characters add megabytes.
- Are there large assets (videos, PDFs, databases) bundled in the app that could be downloaded on demand?

### Tree Shaking & Dead Code
- Is `--tree-shake-icons` enabled for release builds? Without it, the entire Material Icons font (~1MB) is included even if the app uses only a few icons.
- Are unused packages still listed in `pubspec.yaml`? Even if not imported in Dart, some packages include native binaries that inflate the build.

## Animation & Rendering

### Jank
- Are there complex animations that drop below 60fps (or 120fps on high-refresh-rate devices)? Profile with Flutter DevTools to identify frames that exceed the budget.
- Are expensive operations (image decoding, JSON parsing, database queries) running on the main isolate during animations? These should be in a separate isolate or deferred until the animation completes.
- Are list views using `ListView.builder` (lazy) instead of `ListView` (eager)? An eager ListView with hundreds of items creates all widgets upfront, causing jank on first render and high memory usage.

### Platform Views
- If the app uses platform views (maps, camera, native ad widgets), are they layered under or over other Flutter widgets that animate? Compositing platform views with animated Flutter widgets causes jank on some devices.
- On Android, are platform views using Virtual Display or Hybrid Composition? Hybrid Composition performs better for most cases but has different trade-offs for gesture handling and clipping.

## Network Performance

### Connectivity
- Is network connectivity monitored (`connectivity_plus` or similar)? API calls that silently fail without connectivity waste time and frustrate users.
- Are failed network requests retried with exponential backoff? Aggressive retry on poor connections makes things worse — it congests the network queue and can trigger rate limiting.

### Data Usage
- Is there awareness of the user's connection quality? Loading high-resolution images or large data sets on a slow mobile connection without progressive loading or low-bandwidth fallbacks leads to perceived jank and user abandonment.
