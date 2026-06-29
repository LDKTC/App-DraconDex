import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/nexus/nexus_screen.dart';
import '../../features/director/director_shell.dart';
import '../../features/director/projects/project_list_screen.dart';
import '../../features/director/projects/project_detail_screen.dart';
import '../../features/director/objects/objects_screen.dart';
import '../../features/director/objects/object_detail_screen.dart';
import '../../features/director/timeline/timeline_screen.dart';
import '../../features/director/relations/relation_screen.dart';
import '../../features/director/map/map_screen.dart';
import '../../features/director/project_tags/project_tags_screen.dart';
import '../../features/tags/tags_screen.dart';
import '../../features/colors/colors_screen.dart';
import '../../features/search/search_screen.dart';
import '../../features/settings/settings_screen.dart';

final _rootKey = GlobalKey<NavigatorState>();
final _shellKey = GlobalKey<NavigatorState>();

final appRouter = GoRouter(
  navigatorKey: _rootKey,
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (ctx, state) => const NexusScreen(),
    ),
    ShellRoute(
      navigatorKey: _shellKey,
      builder: (ctx, state, child) => DirectorShell(child: child),
      routes: [
        GoRoute(
          path: '/projects',
          builder: (ctx, state) => const ProjectListScreen(),
          routes: [
            GoRoute(
              path: ':projectId',
              builder: (ctx, state) => ProjectDetailScreen(
                projectId: int.parse(state.pathParameters['projectId']!),
              ),
            ),
          ],
        ),
        GoRoute(
          path: '/project/:projectId/objects',
          builder: (ctx, state) => ObjectsScreen(
            projectId: int.parse(state.pathParameters['projectId']!),
          ),
          routes: [
            GoRoute(
              path: 'detail/:objectId',
              builder: (ctx, state) => ObjectDetailScreen(
                objectId: int.parse(state.pathParameters['objectId']!),
              ),
            ),
          ],
        ),
        GoRoute(
          path: '/project/:projectId/timeline',
          builder: (ctx, state) => TimelineScreen(
            projectId: int.parse(state.pathParameters['projectId']!),
          ),
        ),
        GoRoute(
          path: '/project/:projectId/relations',
          builder: (ctx, state) => RelationScreen(
            projectId: int.parse(state.pathParameters['projectId']!),
          ),
        ),
        GoRoute(
          path: '/project/:projectId/map',
          builder: (ctx, state) => MapScreen(
            projectId: int.parse(state.pathParameters['projectId']!),
          ),
        ),
        GoRoute(
          path: '/project/:projectId/tags',
          builder: (ctx, state) => ProjectTagsScreen(
            projectId: int.parse(state.pathParameters['projectId']!),
          ),
        ),
        GoRoute(
          path: '/tags',
          builder: (ctx, state) => const TagsScreen(),
        ),
        GoRoute(
          path: '/colors',
          builder: (ctx, state) => const ColorsScreen(),
        ),
        GoRoute(
          path: '/search',
          builder: (ctx, state) => const SearchScreen(),
        ),
        GoRoute(
          path: '/settings',
          builder: (ctx, state) => const SettingsScreen(),
        ),
      ],
    ),
  ],
);
