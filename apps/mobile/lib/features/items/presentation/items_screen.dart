import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/l10n/generated/app_localizations.dart';
import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';
import '../providers/items_provider.dart';

class ItemsScreen extends ConsumerWidget {
  const ItemsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final itemsAsync = ref.watch(itemsProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.itemsTitle, style: AppTypography.h2)),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push(AppRoutes.createItem),
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: itemsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Text(
            l10n.errorGeneric('$error'),
            style: TextStyle(color: AppColors.accentRed),
          ),
        ),
        data: (result) {
          if (result.data.isEmpty) {
            return Center(
              child: Text(
                l10n.itemsEmpty,
                style: AppTypography.bodySmall,
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(itemsProvider);
              await ref.read(itemsProvider.future);
            },
            child: ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: result.data.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) {
                final item = result.data[index];
                return AppCard(
                  title: item.title,
                  subtitle: item.subtitle ?? item.description,
                  onTap: () =>
                      context.push(AppRoutes.itemDetailPath(item.id)),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
