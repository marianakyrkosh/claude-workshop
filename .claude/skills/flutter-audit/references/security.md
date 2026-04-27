# Security Checklist

## Secure Storage

### Sensitive Data
- Where are auth tokens stored? `SharedPreferences` (Android) and `UserDefaults` (iOS) are NOT secure — they're plaintext files readable from backups and by other apps on rooted/jailbroken devices. Tokens, API keys, and session data must use `flutter_secure_storage` (which maps to Android Keystore and iOS Keychain).
- Are any sensitive values (tokens, user PII, payment info) stored in app state that gets serialized to disk (e.g., Hive, SQLite, or a state persistence library)? If so, is the storage encrypted?
- Is there data at rest that should be cleared on logout? Search for all writes to SharedPreferences, secure storage, local databases, and file system — verify each is cleaned up on sign-out.

### Data in Transit
- Are all API calls using HTTPS? Search for hardcoded `http://` URLs in the codebase (excluding `localhost` for dev).
- Is certificate pinning implemented for sensitive endpoints (auth, payment, user data)? Without pinning, a compromised CA or man-in-the-middle proxy can intercept all traffic. This is especially important for IAP receipt validation and auth token exchange.
- Are API requests including auth tokens in headers (not URL query parameters)? Tokens in URLs leak to server logs, browser history, and proxy logs.

## API Keys & Secrets

### Hardcoded Secrets
- Search the entire codebase (including native files) for hardcoded API keys, secrets, and credentials. Common hiding spots: Dart constants files, `android/app/build.gradle` (signing config), `ios/Runner/Info.plist`, `.env` files committed to git, `AndroidManifest.xml` (meta-data tags).
- Is the RevenueCat API key hardcoded in the Dart source? While RevenueCat public API keys are designed to be client-side, they should still be stored securely — not in a plaintext constants file that's trivially decompiled.
- Are Firebase, analytics, or third-party SDK keys committed to the repository? These should be excluded from version control and injected at build time.

### Build-Time Secrets
- Are secrets injected via `--dart-define`, environment variables, or a build configuration system — not compiled into the binary?
- Is `.env` in `.gitignore`? Is there an `.env.example` with placeholder values?
- For CI/CD: are secrets stored in the CI system's secret manager (GitHub Secrets, Bitrise Secrets, etc.) and injected during the build, not baked into the repository?

## Deep Links & URL Schemes

### Custom URL Schemes
- Does the app register a custom URL scheme (e.g., `myapp://`)? If so, are the incoming URLs validated? Custom URL schemes are not unique — any app can register the same scheme and intercept links. On Android, this is a well-known attack vector for OAuth redirect hijacking.
- Are deep link parameters sanitized before use? If a deep link like `myapp://open?screen=settings&id=<script>` passes parameters directly to navigation or data fetching without validation, it can trigger unintended behavior.

### Universal Links / App Links
- Are Universal Links (iOS) and App Links (Android) configured with proper domain verification? Without verification, the OS falls back to custom URL schemes, which are less secure.
- Is the `apple-app-site-association` file served correctly from the web domain? Is the `assetlinks.json` file served for Android?
- Are the associated domains entitlement (iOS) and intent filters (Android) correctly configured?

### Deep Link Routing
- Do deep links that navigate to specific screens validate parameters against an allowlist before using them? A deep link that passes arbitrary route paths or IDs to navigation can expose screens the user shouldn't access.
- Are deep links handled when the app is cold-started (not just when it's already running)? On both platforms, initial deep links require different handling than in-app deep links.

## Obfuscation & Reverse Engineering

### Dart Obfuscation
- Is Dart code obfuscation enabled for release builds (`--obfuscate` with `--split-debug-info`)? Without obfuscation, the compiled Dart code retains class and method names, making reverse engineering trivial.
- Are the split debug info symbols stored securely and used for crash report symbolication?

### Android-Specific
- Is ProGuard/R8 enabled for release builds? Without it, Java/Kotlin code (including native plugin code) retains full class and method names.
- Are ProGuard rules configured correctly for all dependencies? Missing keep rules cause crashes in release builds that don't reproduce in debug — a classic hard-to-diagnose issue.
- Is the app using `android:debuggable="false"` in the release manifest? A debuggable release APK can be attached to a debugger by any user.

### iOS-Specific
- Is Bitcode enabled/disabled intentionally? (Note: Bitcode is deprecated as of Xcode 14, but legacy projects may still reference it.)
- Are debug symbols stripped in release builds?

## Data Leakage

### Logging
- Are there `print()` or `debugPrint()` statements in release builds that output sensitive data (tokens, user info, payment details)? On Android, these go to logcat, which other apps can read on older OS versions.
- Is crash reporting (Sentry, Firebase Crashlytics, etc.) configured to scrub PII from error reports? Stack traces that contain user emails or tokens in local variables can end up in third-party dashboards.

### Screenshots & App Switcher
- On iOS, is sensitive screen content obscured when the app enters the background (app switcher thumbnail)? Financial or personal data visible in the app switcher thumbnail is a privacy concern.
- On Android, is `FLAG_SECURE` set on screens that display sensitive information (payment screens, account details)? Without it, the screen can be captured by screenshot or screen recording apps.

### Clipboard
- If the app copies sensitive data to the clipboard (OTP codes, tokens), is the clipboard cleared after a timeout? Clipboard data persists and can be read by other apps.

### Backup
- Is app data excluded from cloud backups where appropriate? On Android, `android:allowBackup="true"` (the default) includes SharedPreferences and local databases in backups — potentially exposing tokens and user data.
- On iOS, are sensitive files marked with `NSURLIsExcludedFromBackupKey` to prevent iCloud backup?

## Network Security

### Certificate Transparency
- Are network security config files (`network_security_config.xml` on Android) configured for production? Development configs that trust user-installed certificates must not ship in release builds.
- Is TLS version pinned to 1.2+ minimum? Older TLS versions have known vulnerabilities.

### API Security
- Are API responses validated for expected structure before parsing? Malformed responses from a compromised or man-in-the-middle server can cause crashes or unexpected behavior if parsed blindly.
- Is retry logic implemented with exponential backoff? Aggressive retry on auth failures can trigger rate limiting or account lockouts.
