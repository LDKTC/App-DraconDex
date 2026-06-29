import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../data/models/category_model.dart';
import '../../../data/models/object_model.dart';
import '../../../providers/db_providers.dart';
import '../../../providers/project_provider.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';
import 'dialogs/category_dialog.dart';
import 'dialogs/object_dialog.dart';
import 'dialogs/template_dialog.dart';

final _categoriesProvider = FutureProvider.family<List<CategoryModel>, int>((ref, projectId) async {
  final dao = ref.watch(categoryDaoProvider);
  return dao.when(data: (d) => d.getCategories(projectId), loading: () => Future.value([]), error: (_, __) => Future.value([]));
});

final _objectsProvider = FutureProvider.family<List<ObjectModel>, int>((ref, catId) async {
  final dao = ref.watch(objectDaoProvider);
  return dao.when(data: (d) => d.getObjects(catId), loading: () => Future.value([]), error: (_, __) => Future.value([]));
});

class ObjectsScreen extends ConsumerStatefulWidget {
  final int projectId;
  const ObjectsScreen({super.key, required this.projectId});

  @override
  ConsumerState<ObjectsScreen> createState() => _ObjectsScreenState();
}

class _ObjectsScreenState extends ConsumerState<ObjectsScreen> {
  int? _selectedCatId;

  @override
  Widget build(BuildContext context) {
    final catsAsync = ref.watch(_categoriesProvider(widget.projectId));
    ref.read(activeProjectProvider.notifier).state = widget.projectId;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Objects'),
        actions: [
          IconButton(
            icon: const Icon(Icons.category),
            tooltip: 'New Category',
            onPressed: () => _showCategoryDialog(),
          ),
          if (_selectedCatId != null)
            IconButton(
              icon: const Icon(Icons.add),
              tooltip: 'New Object',
              onPressed: () => _showObjectDialog(),
            ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth >= 600) {
            return Row(
              children: [
                SizedBox(
                  width: 200,
                  child: _CategoryList(
                    projectId: widget.projectId,
                    selectedId: _selectedCatId,
                    onSelect: (id) => setState(() => _selectedCatId = id),
                    ref: ref,
                  ),
                ),
                const VerticalDivider(width: 1),
                Expanded(
                  child: _selectedCatId != null
                      ? _ObjectList(catId: _selectedCatId!, projectId: widget.projectId, ref: ref)
                      : const Center(child: Text('Select a category')),
                ),
              ],
            );
          }
          return catsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, s) => Center(child: Text('Error: $e')),
            data: (cats) => _selectedCatId == null
                ? _CategoryList(projectId: widget.projectId, selectedId: null, onSelect: (id) => setState(() => _selectedCatId = id), ref: ref)
                : Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.arrow_back),
                        title: Text(cats.firstWhere((c) => c.id == _selectedCatId, orElse: () => cats.first).name),
                        onTap: () => setState(() => _selectedCatId = null),
                      ),
                      const Divider(height: 1),
                      Expanded(child: _ObjectList(catId: _selectedCatId!, projectId: widget.projectId, ref: ref)),
                    ],
                  ),
          );
        },
      ),
    );
  }

  Future<void> _showCategoryDialog([CategoryModel? cat]) async {
    await showDialog(context: context, builder: (_) => CategoryDialog(projectId: widget.projectId, existing: cat));
    ref.invalidate(_categoriesProvider(widget.projectId));
  }

  Future<void> _showObjectDialog([ObjectModel? obj]) async {
    if (_selectedCatId == null) return;
    await showDialog(context: context, builder: (_) => ObjectDialog(projectId: widget.projectId, categoryId: _selectedCatId!, existing: obj));
    ref.invalidate(_objectsProvider(_selectedCatId!));
  }
}

class _CategoryList extends StatelessWidget {
  final int projectId;
  final int? selectedId;
  final void Function(int id) onSelect;
  final WidgetRef ref;

  const _CategoryList({required this.projectId, required this.selectedId, required this.onSelect, required this.ref});

  @override
  Widget build(BuildContext context) {
    final catsAsync = ref.watch(_categoriesProvider(projectId));
    return catsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Error: $e')),
      data: (cats) {
        if (cats.isEmpty) {
          return const Center(child: Text('No categories.\nTap category icon to add.', textAlign: TextAlign.center));
        }
        return ListView.builder(
          itemCount: cats.length,
          itemBuilder: (ctx, i) {
            final cat = cats[i];
            return ListTile(
              selected: cat.id == selectedId,
              leading: ColorDot(colorCode: cat.colorCode),
              title: Text(cat.name),
              onTap: () => onSelect(cat.id),
              trailing: PopupMenuButton<String>(
                onSelected: (v) {
                  if (v == 'edit') {
                    showDialog(context: ctx, builder: (_) => CategoryDialog(projectId: projectId, existing: cat))
                        .then((_) => ref.invalidate(_categoriesProvider(projectId)));
                  } else if (v == 'templates') {
                    showDialog(context: ctx, builder: (_) => TemplateDialog(category: cat));
                  } else if (v == 'delete') {
                    showConfirmDialog(ctx, title: 'Delete "${cat.name}"?').then((ok) {
                      if (ok) {
                        ref.read(categoryDaoProvider).whenData((d) async {
                          await d.deleteCategory(cat.id);
                          ref.invalidate(_categoriesProvider(projectId));
                        });
                      }
                    });
                  }
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'edit', child: Text('Edit')),
                  PopupMenuItem(value: 'templates', child: Text('Fields')),
                  PopupMenuItem(value: 'delete', child: Text('Delete')),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _ObjectList extends StatelessWidget {
  final int catId;
  final int projectId;
  final WidgetRef ref;
  const _ObjectList({required this.catId, required this.projectId, required this.ref});

  @override
  Widget build(BuildContext context) {
    final objectsAsync = ref.watch(_objectsProvider(catId));
    return objectsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Error: $e')),
      data: (objects) {
        if (objects.isEmpty) {
          return const Center(child: Text('No objects yet.'));
        }
        return ListView.builder(
          itemCount: objects.length,
          itemBuilder: (ctx, i) {
            final obj = objects[i];
            return ListTile(
              leading: ColorDot(colorCode: obj.colorCode),
              title: Text(obj.name),
              onTap: () => context.go('/project/$projectId/objects/detail/${obj.id}'),
              trailing: PopupMenuButton<String>(
                onSelected: (v) {
                  if (v == 'edit') {
                    showDialog(context: ctx, builder: (_) => ObjectDialog(projectId: projectId, categoryId: catId, existing: obj))
                        .then((_) => ref.invalidate(_objectsProvider(catId)));
                  } else if (v == 'delete') {
                    showConfirmDialog(ctx, title: 'Delete "${obj.name}"?').then((ok) {
                      if (ok) {
                        ref.read(objectDaoProvider).whenData((d) async {
                          await d.deleteObject(obj.id);
                          ref.invalidate(_objectsProvider(catId));
                        });
                      }
                    });
                  }
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'edit', child: Text('Edit')),
                  PopupMenuItem(value: 'delete', child: Text('Delete')),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
