import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/world_model.dart';
import '../../../providers/world_provider.dart';
import '../../../providers/db_providers.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';

/// Maps brought into a world from its linked novels. World timelines can be
/// anchored to one of these maps to position objects over time.
class WorldMapsScreen extends ConsumerWidget {
  final int worldId;
  const WorldMapsScreen({super.key, required this.worldId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mapsAsync = ref.watch(worldMapsProvider(worldId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('World Maps'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_link),
            tooltip: 'Add Map',
            onPressed: () => _addMap(context, ref),
          ),
        ],
      ),
      body: mapsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
        data: (maps) {
          if (maps.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.map, size: 64, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
                  const SizedBox(height: 16),
                  Text('No maps yet.\nLink novels first, then add their maps.',
                      textAlign: TextAlign.center, style: theme.textTheme.bodyMedium),
                ],
              ),
            );
          }
          return ListView(
            children: maps.map((m) => ListTile(
              leading: ColorDot(colorCode: m.colorCode),
              title: Text(m.mapName.isEmpty ? '(untitled map)' : m.mapName),
              subtitle: m.projectName != null ? Text(m.projectName!) : null,
              trailing: IconButton(
                icon: const Icon(Icons.link_off),
                tooltip: 'Remove',
                onPressed: () async {
                  final ok = await showConfirmDialog(context, title: 'Remove "${m.mapName}" from world?');
                  if (!ok) return;
                  await ref.read(worldDaoProvider).value?.removeWorldMap(m.id);
                  ref.invalidate(worldMapsProvider(worldId));
                },
              ),
            )).toList(),
          );
        },
      ),
    );
  }

  Future<void> _addMap(BuildContext context, WidgetRef ref) async {
    final dao = ref.read(worldDaoProvider).value;
    if (dao == null) return;
    final linkable = await dao.getLinkableMaps(worldId);
    if (!context.mounted) return;
    if (linkable.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No more maps available from linked novels.')),
      );
      return;
    }
    await showModalBottomSheet(
      context: context,
      builder: (ctx) => ListView(
        children: linkable.map((LinkableMapModel m) => ListTile(
          leading: ColorDot(colorCode: m.colorCode),
          title: Text(m.mapName.isEmpty ? '(untitled map)' : m.mapName),
          subtitle: Text(m.projectName),
          onTap: () async {
            await dao.addWorldMap(worldId, m.id);
            ref.invalidate(worldMapsProvider(worldId));
            if (ctx.mounted) Navigator.of(ctx).pop();
          },
        )).toList(),
      ),
    );
  }
}
