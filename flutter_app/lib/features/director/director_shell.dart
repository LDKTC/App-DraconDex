import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/project_provider.dart';

class DirectorShell extends ConsumerWidget {
  final Widget child;
  const DirectorShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeProjectId = ref.watch(activeProjectProvider);
    final isWide = MediaQuery.of(context).size.width >= 600;

    final navItems = _buildNavItems(activeProjectId);

    if (isWide) {
      return Scaffold(
        body: Row(
          children: [
            _SideRail(items: navItems, activeProjectId: activeProjectId),
            const VerticalDivider(width: 1),
            Expanded(child: child),
          ],
        ),
      );
    }

    return Scaffold(
      drawer: Drawer(
        child: SafeArea(
          child: _NavList(items: navItems, activeProjectId: activeProjectId),
        ),
      ),
      appBar: AppBar(
        leading: Builder(
          builder: (ctx) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(ctx).openDrawer(),
          ),
        ),
        title: const Text('DraconDex'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.go('/search'),
          ),
        ],
      ),
      body: child,
    );
  }

  List<_NavItem> _buildNavItems(int? activeProjectId) {
    final items = <_NavItem>[
      _NavItem(icon: Icons.home, label: 'Home', path: '/'),
      _NavItem(icon: Icons.folder_open, label: 'Projects', path: '/projects'),
    ];
    if (activeProjectId != null) {
      items.addAll([
        _NavItem(icon: Icons.people, label: 'Objects', path: '/project/$activeProjectId/objects'),
        _NavItem(icon: Icons.timeline, label: 'Timeline', path: '/project/$activeProjectId/timeline'),
        _NavItem(icon: Icons.account_tree, label: 'Relations', path: '/project/$activeProjectId/relations'),
        _NavItem(icon: Icons.map, label: 'Map', path: '/project/$activeProjectId/map'),
        _NavItem(icon: Icons.label, label: 'Proj Tags', path: '/project/$activeProjectId/tags'),
      ]);
    }
    items.addAll([
      _NavItem(icon: Icons.tag, label: 'Tags', path: '/tags'),
      _NavItem(icon: Icons.palette, label: 'Colors', path: '/colors'),
      _NavItem(icon: Icons.settings, label: 'Settings', path: '/settings'),
    ]);
    return items;
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final String path;
  const _NavItem({required this.icon, required this.label, required this.path});
}

class _SideRail extends StatelessWidget {
  final List<_NavItem> items;
  final int? activeProjectId;
  const _SideRail({required this.items, this.activeProjectId});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    return SizedBox(
      width: 72,
      child: Container(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 8),
              Expanded(
                child: ListView(
                  children: items.map((item) {
                    final selected = location == item.path || (item.path != '/' && location.startsWith(item.path));
                    return Tooltip(
                      message: item.label,
                      child: InkWell(
                        onTap: () => context.go(item.path),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: selected
                              ? BoxDecoration(
                                  color: Theme.of(context).colorScheme.primary.withOpacity(0.15),
                                  border: Border(
                                    left: BorderSide(color: Theme.of(context).colorScheme.primary, width: 3),
                                  ),
                                )
                              : null,
                          child: Column(
                            children: [
                              Icon(
                                item.icon,
                                color: selected
                                    ? Theme.of(context).colorScheme.primary
                                    : Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                item.label,
                                style: TextStyle(
                                  fontSize: 9,
                                  color: selected
                                      ? Theme.of(context).colorScheme.primary
                                      : Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                                ),
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavList extends StatelessWidget {
  final List<_NavItem> items;
  final int? activeProjectId;
  const _NavList({required this.items, this.activeProjectId});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    return ListView(
      children: items.map((item) {
        final selected = location == item.path || (item.path != '/' && location.startsWith(item.path));
        return ListTile(
          leading: Icon(item.icon),
          title: Text(item.label),
          selected: selected,
          onTap: () {
            Navigator.of(context).pop();
            context.go(item.path);
          },
        );
      }).toList(),
    );
  }
}
