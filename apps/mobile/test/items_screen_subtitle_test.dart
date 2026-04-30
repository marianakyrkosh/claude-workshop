import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop_mobile/core/l10n/generated/app_localizations.dart';
import 'package:workshop_mobile/features/items/presentation/items_screen.dart';
import 'package:workshop_mobile/features/items/providers/items_provider.dart';
import 'package:workshop_mobile/models/item.dart';
import 'package:workshop_mobile/models/pagination.dart';

void main() {
  testWidgets(
    'ItemsScreen renders subtitle when present and falls back to description otherwise',
    (tester) async {
      final fixedDate = DateTime.utc(2026, 1, 1);
      final items = <Item>[
        Item(
          id: 'a',
          title: 'With subtitle',
          subtitle: 'A neat tagline',
          description: 'Body A',
          createdAt: fixedDate,
          updatedAt: fixedDate,
        ),
        Item(
          id: 'b',
          title: 'No subtitle',
          subtitle: null,
          description: 'Body B',
          createdAt: fixedDate,
          updatedAt: fixedDate,
        ),
      ];
      final meta = PaginationMeta(total: 2, page: 1, limit: 20, totalPages: 1);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            itemsProvider.overrideWith(
              (ref) => Future.value((data: items, meta: meta)),
            ),
          ],
          child: MaterialApp(
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
            home: const ItemsScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('With subtitle'), findsOneWidget);
      expect(find.text('No subtitle'), findsOneWidget);
      expect(find.text('A neat tagline'), findsOneWidget);
      expect(find.text('Body B'), findsOneWidget);
      expect(find.text('Body A'), findsNothing);
    },
  );
}
