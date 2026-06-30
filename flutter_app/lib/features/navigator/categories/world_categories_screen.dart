import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/dao/world_dao.dart';
import '../../../data/models/world_model.dart';
import '../../../providers/world_provider.dart';
import '../../../providers/db_providers.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';

/// World categories (object_category rows brought into the world) and the
/// world objects placed inside them.
class WorldCategoriesScreen extends ConsumerWidget {
  final int worldId;
  const WorldCategoriesScreen({super.key, required this.worldId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(worldCategoriesProvider(worldId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('World Objects'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_link),
            tooltip: 'Add Category',
            onPressed: () => _addCategory(context, ref),
          ),
        ],
      ),
      body: categoriesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
        data: (categories) {
          if (categories.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.category, size: 64, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
                  const SizedBox(height: 16),
                  Text('No categories yet.\nLink novels first, then add their categories.',
                      textAlign: TextAlign.center, style: theme.textTheme.bodyMedium),
                ],
              ),
            );
          }
          return ListView(
            children: categories.map((c) => _CategoryTile(worldId: worldId, category: c)).toList(),
          );
        },
      ),
    );
  }

  Future<void> _addCategory(BuildContext context, WidgetRef ref) async {
    final dao = ref.read(worldDaoProvider).value;
    if (dao == null) return;
    final linkable = await dao.getLinkableCategories(worldId);
    if (!context.mounted) return;
    if (linkable.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No more categories available from linked novels.')),
      );
      return;
    }
    await showModalBottomSheet(
      context: context,
      builder: (ctx) => ListView(
        children: linkable.map((LinkableCategoryModel cat) => ListTile(
          leading: ColorDot(colorCode: cat.colorCode),
          title: Text(cat.categoryName),
          subtitle: Text(cat.projectName),
          onTap: () async {
            await dao.addWorldCategory(worldId, cat.id);
            ref.invalidate(worldCategoriesProvider(worldId));
            if (ctx.mounted) Navigator.of(ctx).pop();
          },
        )).toList(),
      ),
    );
  }
}

class _CategoryTile extends ConsumerStatefulWidget {
  final int worldId;
  final WorldCategoryModel category;
  const _CategoryTile({required this.worldId, required this.category});

  @override
  ConsumerState<_CategoryTile> createState() => _CategoryTileState();
}

class _CategoryTileState extends ConsumerState<_CategoryTile> {
  bool _expanded = false;
  List<WorldObjectModel>? _objects;

  WorldDao? get _dao => ref.read(worldDaoProvider).value;

  Future<void> _reload() async {
    final objs = await _dao?.getWorldObjects(widget.category.id);
    if (mounted) setState(() => _objects = objs);
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.category;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListTile(
          leading: Row(mainAxisSize: MainAxisSize.min, children: [
            ColorDot(colorCode: c.colorCode, size: 10),
            const SizedBox(width: 8),
            Icon(_expanded ? Icons.expand_less : Icons.expand_more),
          ]),
          title: Text(c.categoryName, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: c.projectName != null ? Text(c.projectName!) : null,
          onTap: () {
            setState(() => _expanded = !_expanded);
            if (_expanded && _objects == null) _reload();
          },
          trailing: PopupMenuButton<String>(
            onSelected: (v) async {
              if (v == 'add') {
                await _addObject();
              } else if (v == 'remove') {
                final ok = await showConfirmDialog(context, title: 'Remove "${c.categoryName}" from world?');
                if (!ok) return;
                await _dao?.removeWorldCategory(c.id);
                ref.invalidate(worldCategoriesProvider(widget.worldId));
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'add', child: Text('Add object')),
              PopupMenuItem(value: 'remove', child: Text('Remove category')),
            ],
          ),
        ),
        if (_expanded)
          ...(_objects ?? []).map((o) => Padding(
                padding: const EdgeInsets.only(left: 32),
                child: ListTile(
                  dense: true,
                  leading: ColorDot(colorCode: o.colorCode, size: 12),
                  title: Text(o.objectName),
                  subtitle: o.symbol != null && o.symbol!.isNotEmpty ? Text('Symbol: ${o.symbol}') : null,
                  trailing: IconButton(
                    icon: const Icon(Icons.remove_circle_outline, size: 20),
                    onPressed: () async {
                      await _dao?.removeWorldObject(o.id);
                      _reload();
                    },
                  ),
                ),
              )),
        if (_expanded && (_objects?.isEmpty ?? false))
          const Padding(
            padding: EdgeInsets.only(left: 40, bottom: 8),
            child: Text('No objects — use the menu to add.'),
          ),
      ],
    );
  }

  Future<void> _addObject() async {
    final dao = _dao;
    if (dao == null) return;
    final linkable = await dao.getLinkableObjects(widget.category.id);
    if (!mounted) return;
    if (linkable.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No more objects available in this category.')),
      );
      return;
    }
    if (!mounted) return;
    await showModalBottomSheet(
      context: context,
      builder: (ctx) => ListView(
        children: linkable.map((LinkableObjectModel o) => ListTile(
          leading: ColorDot(colorCode: o.colorCode),
          title: Text(o.name),
          onTap: () async {
            await dao.addWorldObject(widget.category.id, o.id, null);
            if (ctx.mounted) Navigator.of(ctx).pop();
            if (!_expanded) setState(() => _expanded = true);
            _reload();
          },
        )).toList(),
      ),
    );
  }
}
