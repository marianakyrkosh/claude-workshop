import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop_mobile/core/l10n/generated/app_localizations.dart';
import 'package:workshop_mobile/features/home/presentation/home_screen.dart';

void main() {
  testWidgets('HomeScreen displays title and button', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: HomeScreen(),
        ),
      ),
    );

    expect(find.text('Workshop Starter'), findsOneWidget);
    expect(find.text('View Items'), findsOneWidget);
  });
}
