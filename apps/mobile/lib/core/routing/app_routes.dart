class AppRoutes {
  static const home = '/';
  static const items = '/items';
  static const itemDetail = '/items/:id';
  static const createItem = '/items/create';
  static const editItem = '/items/:id/edit';

  static String itemDetailPath(String id) => '/items/$id';
  static String editItemPath(String id) => '/items/$id/edit';
}
