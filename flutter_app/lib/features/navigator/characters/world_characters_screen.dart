import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/dao/world_dao.dart';
import '../../../data/models/world_model.dart';
import '../../../providers/world_provider.dart';
import '../../../providers/db_providers.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';
import 'dialogs/character_dialog.dart';

/// World characters: cross-novel personas that can be linked to concrete novel
/// objects (drawn from the world's enabled character categories).
class WorldCharactersScreen extends ConsumerWidget {
  final int worldId;
  const WorldCharactersScreen({super.key, required this.worldId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final charsAsync = ref.watch(worldCharactersProvider(worldId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('World Characters'),
        actions: [
          IconButton(
            icon: const Icon(Icons.category),
            tooltip: 'Character Categories',
            onPressed: () => _manageCategories(context, ref),
          ),
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'New Character',
            onPressed: () => _editCharacter(context, ref, null),
          ),
        ],
      ),
      body: charsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
        data: (chars) {
          if (chars.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.people, size: 64, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
                  const SizedBox(height: 16),
                  Text('No characters yet. Tap + to create one.', style: theme.textTheme.bodyMedium),
                ],
              ),
            );
          }
          return ListView(
            children: chars.map((c) => ListTile(
              leading: ColorDot(colorCode: c.colorCode),
              title: Text(c.name),
              subtitle: c.symbol != null && c.symbol!.isNotEmpty ? Text('Symbol: ${c.symbol}') : null,
              onTap: () => _manageLinks(context, ref, c),
              trailing: PopupMenuButton<String>(
                onSelected: (v) async {
                  if (v == 'edit') {
                    await _editCharacter(context, ref, c);
                  } else if (v == 'links') {
                    if (context.mounted) await _manageLinks(context, ref, c);
                  } else if (v == 'delete') {
                    final ok = await showConfirmDialog(context, title: 'Delete "${c.name}"?');
                    if (!ok) return;
                    await ref.read(worldDaoProvider).value?.deleteWorldCharacter(c.id);
                    ref.invalidate(worldCharactersProvider(worldId));
                  }
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'edit', child: Text('Edit')),
                  PopupMenuItem(value: 'links', child: Text('Object links')),
                  PopupMenuItem(value: 'delete', child: Text('Delete')),
                ],
              ),
            )).toList(),
          );
        },
      ),
    );
  }

  Future<void> _editCharacter(BuildContext context, WidgetRef ref, WorldCharacterModel? existing) async {
    await showDialog(context: context, builder: (_) => CharacterDialog(worldId: worldId, existing: existing));
    ref.invalidate(worldCharactersProvider(worldId));
  }

  Future<void> _manageCategories(BuildContext context, WidgetRef ref) async {
    final dao = ref.read(worldDaoProvider).value;
    if (dao == null) return;
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _CategoryManagerSheet(worldId: worldId, dao: dao),
    );
  }

  Future<void> _manageLinks(BuildContext context, WidgetRef ref, WorldCharacterModel character) async {
    final dao = ref.read(worldDaoProvider).value;
    if (dao == null) return;
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _LinkManagerSheet(worldId: worldId, character: character, dao: dao),
    );
  }
}

/// Enables/disables which object_categories (from linked novels) may be used to
/// link character objects.
class _CategoryManagerSheet extends StatefulWidget {
  final int worldId;
  final WorldDao dao;
  const _CategoryManagerSheet({required this.worldId, required this.dao});

  @override
  State<_CategoryManagerSheet> createState() => _CategoryManagerSheetState();
}

class _CategoryManagerSheetState extends State<_CategoryManagerSheet> {
  List<WorldCategoryModel> _enabled = [];
  List<LinkableCategoryModel> _available = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final enabled = await widget.dao.getCharacterCategories(widget.worldId);
    final available = await widget.dao.getLinkableCategories(widget.worldId, forCharacters: true);
    if (mounted) {
      setState(() {
        _enabled = enabled;
        _available = available;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      builder: (ctx, scroll) => _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              controller: scroll,
              padding: const EdgeInsets.all(16),
              children: [
                Text('Character Categories', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                if (_enabled.isNotEmpty) ...[
                  const Text('Enabled', style: TextStyle(fontWeight: FontWeight.bold)),
                  ..._enabled.map((c) => ListTile(
                        dense: true,
                        leading: ColorDot(colorCode: c.colorCode),
                        title: Text(c.categoryName),
                        subtitle: c.projectName != null ? Text(c.projectName!) : null,
                        trailing: IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: () async {
                            await widget.dao.removeCharacterCategory(c.id);
                            _load();
                          },
                        ),
                      )),
                  const Divider(),
                ],
                const Text('Available', style: TextStyle(fontWeight: FontWeight.bold)),
                if (_available.isEmpty) const Padding(padding: EdgeInsets.all(8), child: Text('None — link more novels.')),
                ..._available.map((c) => ListTile(
                      dense: true,
                      leading: ColorDot(colorCode: c.colorCode),
                      title: Text(c.categoryName),
                      subtitle: Text(c.projectName),
                      trailing: IconButton(
                        icon: const Icon(Icons.add_circle_outline),
                        onPressed: () async {
                          await widget.dao.addCharacterCategory(widget.worldId, c.id);
                          _load();
                        },
                      ),
                    )),
              ],
            ),
    );
  }
}

/// Links concrete novel objects to a character.
class _LinkManagerSheet extends StatefulWidget {
  final int worldId;
  final WorldCharacterModel character;
  final WorldDao dao;
  const _LinkManagerSheet({required this.worldId, required this.character, required this.dao});

  @override
  State<_LinkManagerSheet> createState() => _LinkManagerSheetState();
}

class _LinkManagerSheetState extends State<_LinkManagerSheet> {
  List<LinkableObjectModel> _linked = [];
  List<LinkableObjectModel> _available = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final linked = await widget.dao.getCharacterLinks(widget.character.id);
    final available = await widget.dao.getLinkableCharacterObjects(widget.worldId, widget.character.id);
    if (mounted) {
      setState(() {
        _linked = linked;
        _available = available;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      builder: (ctx, scroll) => _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              controller: scroll,
              padding: const EdgeInsets.all(16),
              children: [
                Text('Links · ${widget.character.name}', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                if (_linked.isNotEmpty) ...[
                  const Text('Linked objects', style: TextStyle(fontWeight: FontWeight.bold)),
                  ..._linked.map((o) => ListTile(
                        dense: true,
                        leading: ColorDot(colorCode: o.colorCode),
                        title: Text(o.name),
                        subtitle: o.categoryName != null ? Text(o.categoryName!) : null,
                        trailing: IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: () async {
                            await widget.dao.removeCharacterLink(o.id);
                            _load();
                          },
                        ),
                      )),
                  const Divider(),
                ],
                const Text('Available objects', style: TextStyle(fontWeight: FontWeight.bold)),
                if (_available.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(8),
                    child: Text('None — enable character categories that contain objects.'),
                  ),
                ..._available.map((o) => ListTile(
                      dense: true,
                      leading: ColorDot(colorCode: o.colorCode),
                      title: Text(o.name),
                      subtitle: o.categoryName != null ? Text(o.categoryName!) : null,
                      trailing: IconButton(
                        icon: const Icon(Icons.add_circle_outline),
                        onPressed: () async {
                          await widget.dao.addCharacterLink(widget.character.id, o.id);
                          _load();
                        },
                      ),
                    )),
              ],
            ),
    );
  }
}
