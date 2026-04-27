import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'app_routes.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/items/presentation/items_screen.dart';
import '../../features/items/presentation/item_detail_screen.dart';
import '../../features/items/presentation/create_item_screen.dart';
import '../../features/items/presentation/edit_item_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.home,
    routes: [
      GoRoute(
        path: AppRoutes.home,
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: AppRoutes.items,
        builder: (context, state) => const ItemsScreen(),
      ),
      GoRoute(
        path: AppRoutes.createItem,
        builder: (context, state) => const CreateItemScreen(),
      ),
      GoRoute(
        path: AppRoutes.itemDetail,
        builder: (context, state) =>
            ItemDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: AppRoutes.editItem,
        builder: (context, state) =>
            EditItemScreen(id: state.pathParameters['id']!),
      ),
    ],
  );
});
