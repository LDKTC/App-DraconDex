import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/hub/nexus_list_screen.dart';
import '../../features/hub/module_explorer_screen.dart';
import '../../features/tags/tags_screen.dart';
import '../../features/colors/colors_screen.dart';
import '../../features/settings/settings_screen.dart';

final _rootKey = GlobalKey<NavigatorState>();

final appRouter = GoRouter(
  navigatorKey: _rootKey,
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (ctx, state) => const NexusListScreen(),
    ),
    GoRoute(
      path: '/hub/:nexusId',
      builder: (ctx, state) => ModuleExplorerScreen(
        nexusId: int.parse(state.pathParameters['nexusId']!),
      ),
    ),
    GoRoute(
      path: '/hub/:nexusId/module/:moduleId',
      builder: (ctx, state) => ModuleExplorerScreen(
        nexusId: int.parse(state.pathParameters['nexusId']!),
        moduleId: int.parse(state.pathParameters['moduleId']!),
      ),
    ),
    GoRoute(
      path: '/settings',
      builder: (ctx, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: '/colors',
      builder: (ctx, state) => const ColorsScreen(),
    ),
    GoRoute(
      path: '/tags',
      builder: (ctx, state) => const TagsScreen(),
    ),
  ],
);
