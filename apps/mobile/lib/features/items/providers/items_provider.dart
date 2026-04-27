import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../models/item.dart';
import '../../../models/pagination.dart';
import '../data/items_repository.dart';

final itemsRepositoryProvider = Provider<ItemsRepository>((ref) {
  return ItemsRepository(ref.watch(dioProvider));
});

final itemsProvider =
    FutureProvider<({List<Item> data, PaginationMeta meta})>((ref) {
  return ref.watch(itemsRepositoryProvider).getItems();
});

final itemProvider = FutureProvider.family<Item, String>((ref, id) {
  return ref.watch(itemsRepositoryProvider).getItem(id);
});
