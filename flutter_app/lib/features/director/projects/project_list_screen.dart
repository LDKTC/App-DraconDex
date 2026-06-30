import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../data/models/folder_model.dart';
import '../../../data/models/project_model.dart';
import '../../../providers/project_provider.dart';
import '../../../providers/db_providers.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';
import '../../../widgets/color_picker_widget.dart';
import 'dialogs/folder_dialog.dart';
import 'dialogs/project_dialog.dart';

class ProjectListScreen extends ConsumerWidget {
  const ProjectListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final foldersAsync = ref.watch(foldersProvider);
    final projectsAsync = ref.watch(projectsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Projects'),
        actions: [
          IconButton(
            icon: const Icon(Icons.create_new_folder),
            tooltip: 'New Folder',
            onPressed: () => _showFolderDialog(context, ref),
          ),
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'New Project',
            onPressed: () => _showProjectDialog(context, ref),
          ),
        ],
      ),
      body: foldersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
        data: (folders) => projectsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, s) => Center(child: Text('Error: $e')),
          data: (projects) => _buildList(context, ref, folders, projects, theme),
        ),
      ),
    );
  }

  Widget _buildList(BuildContext context, WidgetRef ref, List<FolderModel> folders, List<ProjectModel> projects, ThemeData theme) {
    final unfiled = projects.where((p) => p.folderId == null).toList();

    if (folders.isEmpty && projects.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.folder_open, size: 64, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
            const SizedBox(height: 16),
            Text('No projects yet. Tap + to create one.', style: theme.textTheme.bodyMedium),
          ],
        ),
      );
    }

    final items = <Widget>[];
    for (final folder in folders) {
      final folderProjects = projects.where((p) => p.folderId == folder.id).toList();
      items.add(_FolderTile(folder: folder, projects: folderProjects, ref: ref));
    }
    if (unfiled.isNotEmpty) {
      items.add(Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        child: Text('Unfiled', style: theme.textTheme.titleSmall),
      ));
      for (final p in unfiled) {
        items.add(_ProjectTile(project: p, ref: ref));
      }
    }
    return ListView(children: items);
  }

  Future<void> _showFolderDialog(BuildContext context, WidgetRef ref, [FolderModel? folder]) async {
    await showDialog(
      context: context,
      builder: (_) => FolderDialog(existing: folder),
    );
    ref.invalidate(foldersProvider);
  }

  Future<void> _showProjectDialog(BuildContext context, WidgetRef ref, [ProjectModel? project]) async {
    await showDialog(
      context: context,
      builder: (_) => ProjectDialog(existing: project),
    );
    ref.invalidate(projectsProvider);
  }
}

class _FolderTile extends StatefulWidget {
  final FolderModel folder;
  final List<ProjectModel> projects;
  final WidgetRef ref;
  const _FolderTile({required this.folder, required this.projects, required this.ref});

  @override
  State<_FolderTile> createState() => _FolderTileState();
}

class _FolderTileState extends State<_FolderTile> {
  bool _expanded = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListTile(
          leading: Row(mainAxisSize: MainAxisSize.min, children: [
            ColorDot(colorCode: widget.folder.colorCode, size: 10),
            const SizedBox(width: 8),
            Icon(_expanded ? Icons.expand_less : Icons.expand_more),
          ]),
          title: Text(widget.folder.name, style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
          onTap: () => setState(() => _expanded = !_expanded),
          trailing: PopupMenuButton<String>(
            onSelected: (v) {
              if (v == 'edit') {
                showDialog(context: context, builder: (_) => FolderDialog(existing: widget.folder))
                    .then((_) => widget.ref.invalidate(foldersProvider));
              } else if (v == 'delete') {
                showConfirmDialog(context, title: 'Delete Folder').then((ok) {
                  if (ok) {
                    widget.ref.read(folderDaoProvider).whenData((d) async {
                      await d.deleteFolder(widget.folder.id);
                      widget.ref.invalidate(foldersProvider);
                      widget.ref.invalidate(projectsProvider);
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
        ),
        if (_expanded)
          ...widget.projects.map((p) => Padding(
                padding: const EdgeInsets.only(left: 24),
                child: _ProjectTile(project: p, ref: widget.ref),
              )),
        if (_expanded && widget.projects.isEmpty)
          Padding(
            padding: const EdgeInsets.only(left: 32, bottom: 4),
            child: Text('Empty folder', style: Theme.of(context).textTheme.bodySmall),
          ),
      ],
    );
  }
}

class _ProjectTile extends StatelessWidget {
  final ProjectModel project;
  final WidgetRef ref;
  const _ProjectTile({required this.project, required this.ref});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: ColorDot(colorCode: project.colorCode),
      title: Text(project.name),
      subtitle: project.codename != null ? Text(project.codename!) : null,
      onTap: () {
        ref.read(activeProjectProvider.notifier).state = project.id;
        context.go('/project/${project.id}/objects');
      },
      trailing: PopupMenuButton<String>(
        onSelected: (v) {
          if (v == 'edit') {
            showDialog(context: context, builder: (_) => ProjectDialog(existing: project))
                .then((_) => ref.invalidate(projectsProvider));
          } else if (v == 'delete') {
            showConfirmDialog(context, title: 'Delete "${project.name}"?').then((ok) {
              if (ok) {
                ref.read(projectDaoProvider).whenData((d) async {
                  await d.deleteProject(project.id);
                  ref.invalidate(projectsProvider);
                  if (ref.read(activeProjectProvider) == project.id) {
                    ref.read(activeProjectProvider.notifier).state = null;
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
