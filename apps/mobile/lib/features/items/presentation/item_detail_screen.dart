import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/l10n/generated/app_localizations.dart';
import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../providers/items_provider.dart';

class ItemDetailScreen extends ConsumerWidget {
  final String id;
  const ItemDetailScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final itemAsync = ref.watch(itemProvider(id));

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.itemDetailTitle, style: AppTypography.h3),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () => context.push(AppRoutes.editItemPath(id)),
          ),
          IconButton(
            icon: Icon(Icons.delete, color: AppColors.accentRed),
            onPressed: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: Text(l10n.deleteItemTitle),
                  content: Text(l10n.deleteItemConfirmation),
                  actions: [
                    TextButton(
                      onPressed: () => ctx.pop(false),
                      child: Text(l10n.cancel),
                    ),
                    TextButton(
                      onPressed: () => ctx.pop(true),
                      child: Text(
                        l10n.delete,
                        style: TextStyle(color: AppColors.accentRed),
                      ),
                    ),
                  ],
                ),
              );
              if (confirmed == true && context.mounted) {
                try {
                  await ref.read(itemsRepositoryProvider).deleteItem(id);
                  ref.invalidate(itemsProvider);
                  if (context.mounted) context.pop();
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(l10n.errorGeneric('$e'))),
                    );
                  }
                }
              }
            },
          ),
        ],
      ),
      body: itemAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) =>
            Center(child: Text(l10n.errorGeneric('$error'))),
        data: (item) => Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(item.title, style: AppTypography.h1),
              const SizedBox(height: AppSpacing.md),
              if (item.description != null)
                Text(item.description!, style: AppTypography.body),
              const SizedBox(height: AppSpacing.xl),
              Text(
                l10n.createdDate(
                  item.createdAt.toLocal().toString().split(' ').first,
                ),
                style: AppTypography.caption,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
