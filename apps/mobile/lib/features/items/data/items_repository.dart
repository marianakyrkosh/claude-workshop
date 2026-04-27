import 'package:dio/dio.dart';
import '../../../models/item.dart';
import '../../../models/pagination.dart';

class ItemsRepository {
  final Dio _dio;
  ItemsRepository(this._dio);

  Future<({List<Item> data, PaginationMeta meta})> getItems({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dio.get(
      '/items',
      queryParameters: {'page': page, 'limit': limit},
    );
    final data = response.data as Map<String, dynamic>;
    final items = (data['data'] as List)
        .map((e) => Item.fromJson(e as Map<String, dynamic>))
        .toList();
    final meta =
        PaginationMeta.fromJson(data['meta'] as Map<String, dynamic>);
    return (data: items, meta: meta);
  }

  Future<Item> getItem(String id) async {
    final response = await _dio.get('/items/$id');
    return Item.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Item> createItem({
    required String title,
    String? description,
  }) async {
    final response = await _dio.post('/items', data: {
      'title': title,
      if (description != null) 'description': description,
    });
    return Item.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Item> updateItem(
    String id, {
    String? title,
    String? description,
  }) async {
    final response = await _dio.patch('/items/$id', data: {
      if (title != null) 'title': title,
      if (description != null) 'description': description,
    });
    return Item.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteItem(String id) async {
    await _dio.delete('/items/$id');
  }
}
