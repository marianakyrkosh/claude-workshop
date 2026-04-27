# Platform Configuration Checklist

## iOS Configuration

### Info.plist
- Are all required `NS*UsageDescription` keys present for features the app uses (camera, microphone, location, photo library, contacts)? Missing usage descriptions cause immediate crashes on iOS when the permission is requested — and Apple rejects apps that request permissions without descriptions.
- Is the `CFBundleDisplayName` set correctly? This is what users see on the home screen.
- Is `CFBundleVersion` (build number) and `CFBundleShortVersionString` (user-facing version) set correctly and incremented? App Store Connect rejects uploads with duplicate build numbers.
- Are URL schemes (`CFBundleURLSchemes`) registered for deep linking? Are they unique enough to avoid collisions with other apps?
- Is `LSApplicationQueriesSchemes` configured if the app checks for other installed apps?
- Is App Transport Security (ATS) configured correctly? `NSAllowsArbitraryLoads = true` disables all HTTPS enforcement — acceptable during development but a security risk and potential review flag in production. If needed, use per-domain exceptions.
- Are background modes (`UIBackgroundModes`) enabled only for features the app actually uses? Apple rejects apps that declare background modes they don't use.

### Entitlements
- Is the In-App Purchase capability enabled in the entitlements file? Without it, StoreKit calls fail silently.
- Are Associated Domains configured for Universal Links (`applinks:yourdomain.com`)? Without this, deep links fall back to custom URL schemes.
- Are Push Notification entitlements configured if the app sends notifications?
- Is Keychain Sharing enabled if `flutter_secure_storage` requires sharing between app extensions?

### Xcode Project
- Is the deployment target set appropriately? Too high excludes older devices unnecessarily; too low requires extensive compatibility testing.
- Is the correct signing identity and provisioning profile used for release builds? Mismatched profiles cause build failures in CI and app-thinning issues.
- Are there any hardcoded paths in the Xcode project (e.g., absolute paths to frameworks) that would break on other machines or CI?
- Is the `Podfile` committed and up to date? `pod install` results should be reproducible.
- Are CocoaPods / Swift Package Manager dependencies at compatible versions? Version conflicts cause build failures that may only appear in CI.

### App Store Submission
- Is the privacy manifest (`PrivacyInfo.xcprivacy`) included with required API reason declarations? As of 2024, Apple requires apps to declare reasons for using certain APIs (UserDefaults, file timestamp, disk space, etc.). Missing declarations cause rejection.
- Are required device capabilities (`UIRequiredDeviceCapabilities`) set? Setting these too aggressively excludes devices unnecessarily.
- Is the launch storyboard present and correctly configured? Apps without a launch storyboard don't support all screen sizes.

## Android Configuration

### build.gradle (App Level)
- Is `minSdkVersion` set appropriately? Too high excludes users; too low requires compatibility shims. For most Flutter apps, minSdk 21 (Android 5.0) is the typical floor.
- Is `targetSdkVersion` set to the latest required by Google Play? Google Play requires targeting recent API levels — apps targeting old APIs get flagged and eventually delisted.
- Is `compileSdkVersion` at least as high as `targetSdkVersion`?
- Is code shrinking (`minifyEnabled true`), resource shrinking (`shrinkResources true`), and ProGuard/R8 enabled for the release build type? Without these, the APK is bloated and Java/Kotlin code is easily decompiled.
- Is the signing config for release builds using a keystore (not debug signing)? Debug-signed APKs can't be uploaded to the Play Store.
- Is the keystore password hardcoded in `build.gradle`? Signing credentials should be injected from environment variables or a `key.properties` file that's excluded from version control.
- Are there multiple product flavors (dev, staging, prod)? If so, are they correctly configured with different application IDs, API endpoints, and signing configs?

### build.gradle (Project Level)
- Are Gradle plugin versions up to date? The Android Gradle Plugin (AGP) and Kotlin versions must be compatible with each other and with the Flutter toolchain.
- Is the Gradle wrapper (`gradle-wrapper.properties`) committed with a known-good version? Mismatched Gradle versions cause cryptic build failures.
- Are repository URLs using HTTPS? HTTP repositories are a supply-chain attack vector.

### AndroidManifest.xml
- Are `<uses-permission>` declarations minimal? Only request permissions the app actually needs. Common over-permissions: `INTERNET` is needed (and usually already there), but `READ_EXTERNAL_STORAGE`, `CAMERA`, `ACCESS_FINE_LOCATION` should only be present if the app uses them.
- Is `android:allowBackup` set intentionally? The default (`true`) includes app data in Google Cloud backups, which can expose tokens and sensitive local data. Set to `false` or use `android:fullBackupContent` to specify what's included.
- Are intent filters for deep links (`android:scheme`, `android:host`) correctly configured? Wildcards or overly broad host patterns intercept links intended for other apps.
- Is the `android:launchMode` for the main activity appropriate? `singleTask` or `singleTop` is typical for apps with deep links — `standard` can create duplicate activity instances from deep links.
- Is `android:usesCleartextTraffic` set to `false`? The default on API 28+ is already false, but explicitly setting it prevents accidental cleartext when targeting older APIs.
- Is the `android:networkSecurityConfig` pointing to a properly configured network security file for production?

### ProGuard / R8 Rules
- Are ProGuard rules present for all dependencies that need them? Many Flutter plugins include their own ProGuard rules, but some require manual additions. Missing rules cause runtime crashes in release builds (ClassNotFoundException, NoSuchMethodError) that don't reproduce in debug.
- Are the rules tested by building a release APK and exercising all features? ProGuard issues often hide in rarely-used code paths.
- Are keep rules not too broad? `keep class ** { *; }` disables all minification and defeats the purpose of R8.

### Kotlin / Java Compatibility
- If native Android code is used (plugins, method channels): is the Kotlin version compatible with the AGP version? Kotlin-AGP version mismatches cause subtle compile errors.
- Are all plugins compatible with the target Android SDK version? Some older plugins break on newer Android versions due to deprecated APIs.

## Cross-Platform Configuration

### App Versioning
- Are `version` and `build number` in `pubspec.yaml` the source of truth for both platforms, or do iOS and Android override them independently? Inconsistent versioning causes confusion in crash reports and analytics.
- Is the version incremented systematically? Does the CI pipeline handle version bumping, or is it manual (and therefore error-prone)?

### Permissions
- For each permission the app requests: is it needed on both platforms? Are runtime permission requests handled gracefully when the user denies — does the app degrade gracefully or crash?
- Are permission rationale messages user-friendly and specific? "This app needs camera access" is less convincing to users than "Camera access is needed to scan your document."

### Signing & Release
- Are both platforms' release signing configurations documented and stored securely? Lost Android keystores mean you can never update the app. Lost iOS distribution certificates require regeneration.
- Is the iOS Team ID and Bundle ID consistent across certificates, provisioning profiles, and entitlements?
- Is the Android keystore backed up in a secure location? The keystore is required for all future updates — losing it means publishing a new app listing.

### Flavors / Environments
- Are build flavors or schemes configured for different environments (development, staging, production)? Shipping a debug build to the store, or a production build that points to a staging API, is a common and costly mistake.
- Are environment-specific values (API URLs, RevenueCat keys, analytics keys) injected at build time, not selected at runtime via an in-app toggle? Runtime toggles can be discovered and switched by users.

### CI/CD
- Does the CI pipeline build and sign release artifacts for both platforms? Manual release builds on developer machines are unreproducible and risky.
- Does the CI pipeline run tests before building release artifacts? A release build that skips tests can ship broken code.
- Are the iOS and Android build environments in CI configured with the correct Xcode, JDK, Gradle, and Flutter SDK versions? Environment drift between CI and developer machines causes "works on my machine" failures.
