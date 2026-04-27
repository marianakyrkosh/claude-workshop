import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../providers/items_provider.dart';

class ItemsScreen extends ConsumerWidget {
  const ItemsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itemsAsync = ref.watch(itemsProvider);

    return Scaffold(
      appBar: AppBar(title: Text('Items', style: AppTypography.h2)),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push(AppRoutes.createItem),
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: itemsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Text('Error: $error', style: TextStyle(color: AppColors.accentRed)),
        ),
        data: (result) {
          if (result.data.isEmpty) {
            return Center(
              child: Text(
                'No items yet. Tap + to create one!',
                style: AppTypography.bodySmall,
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(itemsProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: result.data.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = result.data[index];
                return Card(
                  child: ListTile(
                    title: Text(item.title, style: AppTypography.body.copyWith(fontWeight: FontWeight.w600)),
                    subtitle: item.description != null
                        ? Text(item.description!, style: AppTypography.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis)
                        : null,
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push(AppRoutes.itemDetailPath(item.id)),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
