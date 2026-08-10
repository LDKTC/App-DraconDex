import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/project_provider.dart';
import '../../../data/models/project_model.dart';
import '../../../widgets/color_dot.dart';
import 'dialogs/project_dialog.dart';

class ProjectDetailScreen extends ConsumerWidget {
  final int projectId;
  const ProjectDetailScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectAsync = ref.watch(projectProvider(projectId));

    return projectAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, s) => Scaffold(body: Center(child: Text('Error: $e'))),
      data: (project) {
        if (project == null) return const Scaffold(body: Center(child: Text('Project not found')));
        return _ProjectDetail(project: project);
      },
    );
  }
}

class _ProjectDetail extends ConsumerWidget {
  final ProjectModel project;
  const _ProjectDetail({required this.project});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(project.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () => showDialog(
              context: context,
              builder: (_) => ProjectDialog(existing: project),
            ).then((_) {
              ref.invalidate(projectProvider(project.id));
              ref.invalidate(projectsProvider);
            }),
          ),
          IconButton(
            icon: const Icon(Icons.people),
            tooltip: 'Objects',
            onPressed: () {
              ref.read(activeProjectProvider.notifier).state = project.id;
              context.go('/project/${project.id}/objects');
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(children: [
            ColorDot(colorCode: project.colorCode, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(project.name, style: theme.textTheme.titleLarge),
                if (project.codename != null)
                  Text(project.codename!, style: theme.textTheme.bodySmall),
              ]),
            ),
          ]),
          if (project.memo != null) ...[
            const SizedBox(height: 16),
            Text(project.memo!, style: theme.textTheme.bodyMedium),
          ],
          const SizedBox(height: 24),
          Text('Modules', style: theme.textTheme.titleMedium),
          const SizedBox(height: 8),
          _ModuleButton(icon: Icons.people, label: 'Objects', onTap: () => context.go('/project/${project.id}/objects')),
          _ModuleButton(icon: Icons.timeline, label: 'Timeline', onTap: () => context.go('/project/${project.id}/timeline')),
          _ModuleButton(icon: Icons.account_tree, label: 'Relations', onTap: () => context.go('/project/${project.id}/relations')),
          _ModuleButton(icon: Icons.map, label: 'Map', onTap: () => context.go('/project/${project.id}/map')),
          _ModuleButton(icon: Icons.label, label: 'Tags', onTap: () => context.go('/project/${project.id}/tags')),
        ],
      ),
    );
  }
}

class _ModuleButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ModuleButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(label),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
