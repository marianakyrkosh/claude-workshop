import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../providers/items_provider.dart';

class ItemDetailScreen extends ConsumerWidget {
  final String id;
  const ItemDetailScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itemAsync = ref.watch(itemProvider(id));

    return Scaffold(
      appBar: AppBar(
        title: Text('Item Detail', style: AppTypography.h3),
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
                  title: const Text('Delete Item'),
                  content: const Text('Are you sure you want to delete this item?'),
                  actions: [
                    TextButton(onPressed: () => ctx.pop(false), child: const Text('Cancel')),
                    TextButton(onPressed: () => ctx.pop(true), child: Text('Delete', style: TextStyle(color: AppColors.accentRed))),
                  ],
                ),
              );
              if (confirmed == true && context.mounted) {
                await ref.read(itemsRepositoryProvider).deleteItem(id);
                ref.invalidate(itemsProvider);
                if (context.mounted) context.pop();
              }
            },
          ),
        ],
      ),
      body: itemAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (item) => Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(item.title, style: AppTypography.h1),
              const SizedBox(height: 12),
              if (item.description != null)
                Text(item.description!, style: AppTypography.body),
              const SizedBox(height: 24),
              Text(
                'Created: ${item.createdAt.toLocal().toString().split(' ').first}',
                style: AppTypography.caption,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
