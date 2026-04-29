# workshop_mobile

Flutter app for the Workshop Starter monorepo. See `.claude/CLAUDE.md` for implementation rules.

## Run the App

```bash
flutter clean
flutter pub get
flutter run --dart-define-from-file=.env


flutter gen-l10n
flutter build apk --dart-define-from-file=.env
```

## Running on iOS Simulator

```bash
# List available simulators
xcrun simctl list devices available

# Open the Simulator app (boots the default device)
open -a Simulator

# Run the app on the booted simulator
flutter run --dart-define-from-file=.env

# Clean all
xcrun simctl shutdown all && xcrun simctl erase all


# Reset location permissions if needed
xcrun simctl privacy booted reset location com.kroogom.app
```
