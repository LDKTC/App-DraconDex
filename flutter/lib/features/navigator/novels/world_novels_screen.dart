import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/world_model.dart';
import '../../../providers/world_provider.dart';
import '../../../providers/db_providers.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';

/// Links novels (projects) into a world. The pool of novels feeds every other
/// Navigator sub-module (their categories, objects and maps become linkable).
class WorldNovelsScreen extends ConsumerWidget {
  final int worldId;
  const WorldNovelsScreen({super.key, required this.worldId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final novelsAsync = ref.watch(worldNovelsProvider(worldId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('World Novels'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_link),
            tooltip: 'Link Novel',
            onPressed: () => _showAddSheet(context, ref),
          ),
        ],
      ),
      body: novelsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
        data: (novels) {
          if (novels.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.menu_book, size: 64, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
                  const SizedBox(height: 16),
                  Text('No novels linked. Tap the link icon to add.', style: theme.textTheme.bodyMedium),
                ],
              ),
            );
          }
          return ListView(
            children: novels.map((n) => ListTile(
              leading: ColorDot(colorCode: n.colorCode),
              title: Text(n.projectName),
              subtitle: n.codename != null ? Text(n.codename!) : null,
              trailing: IconButton(
                icon: const Icon(Icons.link_off),
                tooltip: 'Unlink',
                onPressed: () async {
                  final ok = await showConfirmDialog(context,
                      title: 'Unlink "${n.projectName}"?',
                      message: 'The novel stays intact; only its link to this world is removed.');
                  if (!ok) return;
                  await ref.read(worldDaoProvider).value?.removeWorldNovel(n.id);
                  ref.invalidate(worldNovelsProvider(worldId));
                },
              ),
            )).toList(),
          );
        },
      ),
    );
  }

  Future<void> _showAddSheet(BuildContext context, WidgetRef ref) async {
    final dao = ref.read(worldDaoProvider).value;
    if (dao == null) return;
    final linkable = await dao.getLinkableProjects(worldId);
    if (!context.mounted) return;
    if (linkable.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All novels are already linked.')),
      );
      return;
    }
    await showModalBottomSheet(
      context: context,
      builder: (ctx) => ListView(
        children: linkable.map((LinkableProjectModel p) => ListTile(
          leading: ColorDot(colorCode: p.colorCode),
          title: Text(p.name),
          subtitle: p.codename != null ? Text(p.codename!) : null,
          onTap: () async {
            await dao.addWorldNovel(worldId, p.id);
            ref.invalidate(worldNovelsProvider(worldId));
            if (ctx.mounted) Navigator.of(ctx).pop();
          },
        )).toList(),
      ),
    );
  }
}
