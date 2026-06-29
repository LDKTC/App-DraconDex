import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NexusScreen extends StatelessWidget {
  const NexusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  Image.asset('assets/images/DraconDex-SymbolColor.png', height: 40, errorBuilder: (_, __, ___) => const SizedBox(width: 40)),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('DraconDex', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                      Text('Novel Data Management', style: theme.textTheme.bodySmall),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                padding: const EdgeInsets.all(20),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                children: [
                  _ModuleTile(
                    icon: Icons.folder_open,
                    label: 'Projects',
                    onTap: () => context.go('/projects'),
                  ),
                  _ModuleTile(
                    icon: Icons.search,
                    label: 'Search',
                    onTap: () => context.go('/search'),
                  ),
                  _ModuleTile(
                    icon: Icons.tag,
                    label: 'Tags',
                    onTap: () => context.go('/tags'),
                  ),
                  _ModuleTile(
                    icon: Icons.palette,
                    label: 'Colors',
                    onTap: () => context.go('/colors'),
                  ),
                  _ModuleTile(
                    icon: Icons.settings,
                    label: 'Settings',
                    onTap: () => context.go('/settings'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ModuleTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ModuleTile({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      color: theme.colorScheme.surfaceContainerHighest,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: theme.colorScheme.primary),
            const SizedBox(height: 12),
            Text(label, style: theme.textTheme.titleMedium),
          ],
        ),
      ),
    );
  }
}
