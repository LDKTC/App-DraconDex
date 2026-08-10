import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../data/models/world_model.dart';
import '../../../providers/world_provider.dart';
import '../../../providers/db_providers.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';
import 'dialogs/world_dialog.dart';

class WorldListScreen extends ConsumerWidget {
  const WorldListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final worldsAsync = ref.watch(worldsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Worlds'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'New World',
            onPressed: () => _showWorldDialog(context, ref),
          ),
        ],
      ),
      body: worldsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
        data: (worlds) {
          if (worlds.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.public, size: 64, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
                  const SizedBox(height: 16),
                  Text('No worlds yet. Tap + to create one.', style: theme.textTheme.bodyMedium),
                ],
              ),
            );
          }
          return ListView(
            children: worlds.map((w) => _WorldTile(world: w, ref: ref)).toList(),
          );
        },
      ),
    );
  }

  Future<void> _showWorldDialog(BuildContext context, WidgetRef ref, [WorldModel? world]) async {
    await showDialog(context: context, builder: (_) => WorldDialog(existing: world));
    ref.invalidate(worldsProvider);
  }
}

class _WorldTile extends StatelessWidget {
  final WorldModel world;
  final WidgetRef ref;
  const _WorldTile({required this.world, required this.ref});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: ColorDot(colorCode: world.colorCode),
      title: Text(world.name),
      subtitle: world.codename != null ? Text(world.codename!) : null,
      onTap: () {
        ref.read(activeWorldProvider.notifier).state = world.id;
        context.go('/world/${world.id}/novels');
      },
      trailing: PopupMenuButton<String>(
        onSelected: (v) {
          if (v == 'edit') {
            showDialog(context: context, builder: (_) => WorldDialog(existing: world))
                .then((_) => ref.invalidate(worldsProvider));
          } else if (v == 'delete') {
            showConfirmDialog(context, title: 'Delete "${world.name}"?').then((ok) {
              if (ok) {
                ref.read(worldDaoProvider).whenData((d) async {
                  await d.deleteWorld(world.id);
                  ref.invalidate(worldsProvider);
                  if (ref.read(activeWorldProvider) == world.id) {
                    ref.read(activeWorldProvider.notifier).state = null;
                  }
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
  }
}
