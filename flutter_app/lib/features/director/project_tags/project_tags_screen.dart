import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/hashtag_model.dart';
import '../../../providers/db_providers.dart';
import '../../../providers/project_provider.dart';
import '../../../providers/hashtag_provider.dart';
import '../../../widgets/hashtag_chip.dart';
import '../../../widgets/tag_selector_sheet.dart';

final _projectUsedTagsProvider = FutureProvider.family<List<HashtagModel>, int>((ref, pid) async {
  return ref.watch(hashtagDaoProvider).when(
        data: (d) => d.getAllProjectUsedTags(pid),
        loading: () => Future.value([]),
        error: (_, __) => Future.value([]),
      );
});

class ProjectTagsScreen extends ConsumerWidget {
  final int projectId;
  const ProjectTagsScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.read(activeProjectProvider.notifier).state = projectId;
    final tagsAsync = ref.watch(_projectUsedTagsProvider(projectId));
    final projectTagsAsync = ref.watch(projectTagsProvider(projectId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Project Tags'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'Add Tag to Project',
            onPressed: () async {
              if (!context.mounted) return;
              final currentIds = (projectTagsAsync.valueOrNull ?? []).map((t) => t.id).toSet();
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (ctx) => TagSelectorSheet(
                  selectedTagIds: currentIds.toList(),
                  onConfirm: (ids) async {
                    await ref.read(hashtagDaoProvider).when(
                      data: (d) => d.setProjectTags(projectId, ids.toList()),
                      loading: () async {},
                      error: (_, __) async {},
                    );
                    ref.invalidate(projectTagsProvider(projectId));
                    ref.invalidate(_projectUsedTagsProvider(projectId));
                  },
                ),
              );
            },
          ),
        ],
      ),
      body: tagsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (tags) {
          if (tags.isEmpty) return const Center(child: Text('No tags used in this project.'));
          return ListView.builder(
            itemCount: tags.length,
            itemBuilder: (ctx, i) {
              final tag = tags[i];
              return _TagTile(tag: tag, projectId: projectId);
            },
          );
        },
      ),
    );
  }
}

class _TagTile extends ConsumerWidget {
  final HashtagModel tag;
  final int projectId;
  const _TagTile({required this.tag, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ExpansionTile(
      leading: HashtagChip(tag: tag),
      title: Text(tag.name),
      children: [
        Consumer(builder: (ctx, ref, _) {
          final objsAsync = ref.watch(_ObjsByTagProvider((_TagKey(tag.id, projectId))));
          final eventsAsync = ref.watch(_EventsByTagProvider((_TagKey(tag.id, projectId))));
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              objsAsync.when(
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => Text('$e'),
                data: (objs) => objs.isEmpty
                    ? const SizedBox()
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Padding(
                            padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
                            child: Text('Objects', style: TextStyle(fontWeight: FontWeight.w600)),
                          ),
                          ...objs.map((o) => ListTile(dense: true, title: Text(o.name ?? 'Object ${o.id}'), subtitle: Text(o.categoryName ?? ''))),
                        ],
                      ),
              ),
              eventsAsync.when(
                loading: () => const SizedBox(),
                error: (e, _) => Text('$e'),
                data: (events) => events.isEmpty
                    ? const SizedBox()
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Padding(
                            padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
                            child: Text('Events', style: TextStyle(fontWeight: FontWeight.w600)),
                          ),
                          ...events.map((e) => ListTile(dense: true, title: Text(e.name ?? 'Event ${e.id}'))),
                        ],
                      ),
              ),
            ],
          );
        }),
      ],
    );
  }
}

class _TagKey {
  final int tagId;
  final int projectId;
  const _TagKey(this.tagId, this.projectId);
  @override
  bool operator ==(Object other) => other is _TagKey && other.tagId == tagId && other.projectId == projectId;
  @override
  int get hashCode => Object.hash(tagId, projectId);
}

final _ObjsByTagProvider = FutureProvider.family((ref, _TagKey key) async {
  return ref.watch(hashtagDaoProvider).when(
        data: (d) => d.getObjectsByHashtag(key.tagId, key.projectId),
        loading: () => Future.value([]),
        error: (_, __) => Future.value([]),
      );
});

final _EventsByTagProvider = FutureProvider.family((ref, _TagKey key) async {
  return ref.watch(hashtagDaoProvider).when(
        data: (d) => d.getEventsByHashtag(key.tagId, key.projectId),
        loading: () => Future.value([]),
        error: (_, __) => Future.value([]),
      );
});
