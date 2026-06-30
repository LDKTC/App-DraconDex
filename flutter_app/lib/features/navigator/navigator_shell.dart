import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/world_provider.dart';

/// Shell for the Navigator ("World") module — mirrors DirectorShell but is
/// driven by the active *world* instead of the active project.
class NavigatorShell extends ConsumerWidget {
  final Widget child;
  const NavigatorShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeWorldId = ref.watch(activeWorldProvider);
    final isWide = MediaQuery.of(context).size.width >= 600;

    final navItems = _buildNavItems(activeWorldId);

    if (isWide) {
      return Scaffold(
        body: Row(
          children: [
            _SideRail(items: navItems),
            const VerticalDivider(width: 1),
            Expanded(child: child),
          ],
        ),
      );
    }

    return Scaffold(
      drawer: Drawer(
        child: SafeArea(child: _NavList(items: navItems)),
      ),
      appBar: AppBar(
        leading: Builder(
          builder: (ctx) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(ctx).openDrawer(),
          ),
        ),
        title: const Text('DraconDex · Navigator'),
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

  List<_NavItem> _buildNavItems(int? activeWorldId) {
    final items = <_NavItem>[
      _NavItem(icon: Icons.home, label: 'Home', path: '/'),
      _NavItem(icon: Icons.public, label: 'Worlds', path: '/worlds'),
    ];
    if (activeWorldId != null) {
      items.addAll([
        _NavItem(icon: Icons.menu_book, label: 'Novels', path: '/world/$activeWorldId/novels'),
        _NavItem(icon: Icons.people, label: 'Chars', path: '/world/$activeWorldId/characters'),
        _NavItem(icon: Icons.category, label: 'Objects', path: '/world/$activeWorldId/categories'),
        _NavItem(icon: Icons.map, label: 'Maps', path: '/world/$activeWorldId/maps'),
        _NavItem(icon: Icons.timeline, label: 'Timeline', path: '/world/$activeWorldId/timeline'),
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
  const _SideRail({required this.items});

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
                                  color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.15),
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
                                    : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                item.label,
                                style: TextStyle(
                                  fontSize: 9,
                                  color: selected
                                      ? Theme.of(context).colorScheme.primary
                                      : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
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
  const _NavList({required this.items});

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
