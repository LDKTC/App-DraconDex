import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/relation_model.dart';
import '../../../providers/db_providers.dart';
import '../../../providers/project_provider.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';
import 'dialogs/relation_type_dialog.dart';
import 'dialogs/relation_dialog.dart';

final _relationTypesProvider = FutureProvider<List<RelationTypeModel>>((ref) async {
  final dao = ref.watch(relationDaoProvider);
  return dao.when(data: (d) => d.getRelationTypes(), loading: () => Future.value([]), error: (_, __) => Future.value([]));
});

final _relOBOBProvider = FutureProvider.family<List<RelationObObModel>, int>((ref, pid) async {
  final dao = ref.watch(relationDaoProvider);
  return dao.when(data: (d) => d.getRelationsOBOB(pid), loading: () => Future.value([]), error: (_, __) => Future.value([]));
});

final _relOBTLProvider = FutureProvider.family<List<RelationObTlModel>, int>((ref, pid) async {
  final dao = ref.watch(relationDaoProvider);
  return dao.when(data: (d) => d.getRelationsOBTL(pid), loading: () => Future.value([]), error: (_, __) => Future.value([]));
});

final _relTLTLProvider = FutureProvider.family<List<RelationTlTlModel>, int>((ref, pid) async {
  final dao = ref.watch(relationDaoProvider);
  return dao.when(data: (d) => d.getRelationsTLTL(pid), loading: () => Future.value([]), error: (_, __) => Future.value([]));
});

class RelationScreen extends ConsumerWidget {
  final int projectId;
  const RelationScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.read(activeProjectProvider.notifier).state = projectId;
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Relations'),
          bottom: const TabBar(tabs: [
            Tab(text: 'OB↔OB'),
            Tab(text: 'OB↔TL'),
            Tab(text: 'TL↔TL'),
          ]),
          actions: [
            IconButton(
              icon: const Icon(Icons.category),
              tooltip: 'Relation Types',
              onPressed: () => showDialog(context: context, builder: (_) => RelationTypeDialog())
                  .then((_) => ref.invalidate(_relationTypesProvider)),
            ),
          ],
        ),
        body: TabBarView(
          children: [
            _OBOBTab(projectId: projectId, ref: ref),
            _OBTLTab(projectId: projectId, ref: ref),
            _TLTLTab(projectId: projectId, ref: ref),
          ],
        ),
        floatingActionButton: Builder(
          builder: (ctx) => FloatingActionButton(
            onPressed: () {
              final tabIndex = DefaultTabController.of(ctx).index;
              showDialog(
                context: context,
                builder: (_) => RelationDialog(projectId: projectId, type: tabIndex),
              ).then((_) {
                ref.invalidate(_relOBOBProvider(projectId));
                ref.invalidate(_relOBTLProvider(projectId));
                ref.invalidate(_relTLTLProvider(projectId));
              });
            },
            child: const Icon(Icons.add),
          ),
        ),
      ),
    );
  }
}

class _OBOBTab extends StatelessWidget {
  final int projectId;
  final WidgetRef ref;
  const _OBOBTab({required this.projectId, required this.ref});

  @override
  Widget build(BuildContext context) {
    final relAsync = ref.watch(_relOBOBProvider(projectId));
    return relAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('$e')),
      data: (rels) {
        if (rels.isEmpty) return const Center(child: Text('No relations yet.'));
        return ListView.builder(
          itemCount: rels.length,
          itemBuilder: (ctx, i) {
            final r = rels[i];
            return ListTile(
              leading: ColorDot(colorCode: r.colorCode),
              title: Text('${r.fromName} → ${r.toName}'),
              subtitle: Text('${r.fromCat} / ${r.toCat}${r.relationName != null ? ' · ${r.relationName}' : ''}'),
              trailing: IconButton(
                icon: const Icon(Icons.delete),
                onPressed: () => showConfirmDialog(ctx, title: 'Delete relation?').then((ok) {
                  if (ok) {
                    ref.read(relationDaoProvider).whenData((d) async {
                      await d.deleteRelationOBOB(r.id);
                      ref.invalidate(_relOBOBProvider(projectId));
                    });
                  }
                }),
              ),
            );
          },
        );
      },
    );
  }
}

class _OBTLTab extends StatelessWidget {
  final int projectId;
  final WidgetRef ref;
  const _OBTLTab({required this.projectId, required this.ref});

  @override
  Widget build(BuildContext context) {
    final relAsync = ref.watch(_relOBTLProvider(projectId));
    return relAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('$e')),
      data: (rels) {
        if (rels.isEmpty) return const Center(child: Text('No relations yet.'));
        return ListView.builder(
          itemCount: rels.length,
          itemBuilder: (ctx, i) {
            final r = rels[i];
            return ListTile(
              leading: ColorDot(colorCode: r.colorCode),
              title: Text('${r.fromName} → ${r.toName}'),
              subtitle: Text('${r.fromCat} → ${r.toTimeline}${r.relationName != null ? ' · ${r.relationName}' : ''}'),
              trailing: IconButton(
                icon: const Icon(Icons.delete),
                onPressed: () => showConfirmDialog(ctx, title: 'Delete relation?').then((ok) {
                  if (ok) {
                    ref.read(relationDaoProvider).whenData((d) async {
                      await d.deleteRelationOBTL(r.id);
                      ref.invalidate(_relOBTLProvider(projectId));
                    });
                  }
                }),
              ),
            );
          },
        );
      },
    );
  }
}

class _TLTLTab extends StatelessWidget {
  final int projectId;
  final WidgetRef ref;
  const _TLTLTab({required this.projectId, required this.ref});

  @override
  Widget build(BuildContext context) {
    final relAsync = ref.watch(_relTLTLProvider(projectId));
    return relAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('$e')),
      data: (rels) {
        if (rels.isEmpty) return const Center(child: Text('No relations yet.'));
        return ListView.builder(
          itemCount: rels.length,
          itemBuilder: (ctx, i) {
            final r = rels[i];
            return ListTile(
              leading: ColorDot(colorCode: r.colorCode),
              title: Text('${r.fromName} → ${r.toName}'),
              subtitle: Text('${r.fromTimeline} → ${r.toTimeline}${r.relationName != null ? ' · ${r.relationName}' : ''}'),
              trailing: IconButton(
                icon: const Icon(Icons.delete),
                onPressed: () => showConfirmDialog(ctx, title: 'Delete relation?').then((ok) {
                  if (ok) {
                    ref.read(relationDaoProvider).whenData((d) async {
                      await d.deleteRelationTLTL(r.id);
                      ref.invalidate(_relTLTLProvider(projectId));
                    });
                  }
                }),
              ),
            );
          },
        );
      },
    );
  }
}
