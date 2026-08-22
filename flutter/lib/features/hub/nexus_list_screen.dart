import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/models/module_model.dart';
import '../../providers/module_provider.dart';
import '../../providers/update_provider.dart';
import '../../widgets/color_dot.dart';
import '../../widgets/confirm_dialog.dart';
import '../../providers/db_providers.dart';
import '../update/update_dialog.dart';
import 'dialogs/nexus_dialog.dart';

/// The app's home screen: a drill-down explorer, like a phone's file-manager
/// app. Each Nexus is a top-level "drive"; tapping one opens its module tree.
class NexusListScreen extends ConsumerStatefulWidget {
  const NexusListScreen({super.key});

  @override
  ConsumerState<NexusListScreen> createState() => _NexusListScreenState();
}

class _NexusListScreenState extends ConsumerState<NexusListScreen> {
  bool _checkedForUpdate = false;

  @override
  void initState() {
    super.initState();
    // Fire-and-forget, once per app open — never throws, so a failed or
    // offline check is silently a no-op (see UpdateService.checkForUpdate).
    WidgetsBinding.instance.addPostFrameCallback((_) => _maybeShowUpdate());
  }

  Future<void> _maybeShowUpdate() async {
    if (_checkedForUpdate) return;
    _checkedForUpdate = true;
    final result = await ref.read(updateCheckProvider.future);
    if (!mounted || !result.available || result.dismissed || result.update == null) return;
    await showDialog(context: context, builder: (_) => UpdateDialog(update: result.update!));
  }

  @override
  Widget build(BuildContext context) {
    final nexusesAsync = ref.watch(nexusesProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('DraconDex'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'Legacy modules (Projects / Worlds)',
            onPressed: () => context.push('/legacy'),
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            tooltip: 'Settings',
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: nexusesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
        data: (nexuses) {
          if (nexuses.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.workspaces_outlined, size: 64, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
                  const SizedBox(height: 16),
                  Text('No Nexus yet. Tap + to create one.', style: theme.textTheme.bodyMedium),
                ],
              ),
            );
          }
          return ListView.separated(
            itemCount: nexuses.length,
            separatorBuilder: (_, _) => const Divider(height: 1),
            itemBuilder: (_, i) => _NexusTile(nexus: nexuses[i]),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        tooltip: 'New Nexus',
        onPressed: () async {
          await showDialog(context: context, builder: (_) => const NexusDialog());
          ref.invalidate(nexusesProvider);
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _NexusTile extends ConsumerWidget {
  final NexusModel nexus;
  const _NexusTile({required this.nexus});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListTile(
      leading: nexus.colorCode != null
          ? ColorDot(colorCode: nexus.colorCode, size: 20)
          : const Icon(Icons.workspaces_outlined),
      title: Text(nexus.name),
      subtitle: nexus.memo != null && nexus.memo!.isNotEmpty ? Text(nexus.memo!) : null,
      trailing: PopupMenuButton<String>(
        onSelected: (v) async {
          if (v == 'rename') {
            await showDialog(context: context, builder: (_) => NexusDialog(existing: nexus));
            ref.invalidate(nexusesProvider);
          } else if (v == 'delete') {
            final ok = await showConfirmDialog(context,
                title: 'Delete "${nexus.name}"?',
                message: 'This deletes every module inside it. This action cannot be undone.');
            if (ok) {
              await ref.read(moduleDaoProvider).when(
                data: (d) => d.deleteNexus(nexus.id),
                loading: () async {},
                error: (_, _) async {},
              );
              ref.invalidate(nexusesProvider);
            }
          }
        },
        itemBuilder: (_) => const [
          PopupMenuItem(value: 'rename', child: Text('Rename')),
          PopupMenuItem(value: 'delete', child: Text('Delete')),
        ],
      ),
      onTap: () => context.push('/hub/${nexus.id}'),
    );
  }
}
