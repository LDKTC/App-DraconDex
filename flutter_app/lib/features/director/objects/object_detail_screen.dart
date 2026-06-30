import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/object_model.dart';
import '../../../data/models/hashtag_model.dart';
import '../../../providers/db_providers.dart';
import '../../../providers/hashtag_provider.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/hashtag_chip.dart';
import '../../../widgets/tag_selector_sheet.dart';

final _objectDetailProvider = FutureProvider.family<ObjectModel?, int>((ref, id) async {
  final dao = ref.watch(objectDaoProvider);
  return dao.when(data: (d) => d.getObject(id), loading: () => Future.value(null), error: (_, _) => Future.value(null));
});

final _objectAttrsProvider = FutureProvider.family<List<ObjectAttributeModel>, int>((ref, id) async {
  final dao = ref.watch(objectDaoProvider);
  return dao.when(data: (d) => d.getObjectAttrs(id), loading: () => Future.value([]), error: (_, _) => Future.value([]));
});

final _objectTagsProvider = FutureProvider.family<List<HashtagModel>, int>((ref, id) async {
  final dao = ref.watch(hashtagDaoProvider);
  return dao.when(data: (d) => d.getObjectTags(id), loading: () => Future.value([]), error: (_, _) => Future.value([]));
});

class ObjectDetailScreen extends ConsumerWidget {
  final int objectId;
  const ObjectDetailScreen({super.key, required this.objectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final objectAsync = ref.watch(_objectDetailProvider(objectId));
    final attrsAsync = ref.watch(_objectAttrsProvider(objectId));
    final tagsAsync = ref.watch(_objectTagsProvider(objectId));

    return Scaffold(
      appBar: AppBar(title: objectAsync.when(data: (o) => Text(o?.name ?? ''), loading: () => const Text(''), error: (_, _) => const Text(''))),
      body: objectAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (obj) {
          if (obj == null) return const Center(child: Text('Not found'));
          return _ObjectBody(obj: obj, attrsAsync: attrsAsync, tagsAsync: tagsAsync, ref: ref);
        },
      ),
    );
  }
}

class _ObjectBody extends StatelessWidget {
  final ObjectModel obj;
  final AsyncValue<List<ObjectAttributeModel>> attrsAsync;
  final AsyncValue<List<HashtagModel>> tagsAsync;
  final WidgetRef ref;

  const _ObjectBody({required this.obj, required this.attrsAsync, required this.tagsAsync, required this.ref});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(children: [
          ColorDot(colorCode: obj.colorCode, size: 20),
          const SizedBox(width: 12),
          Text(obj.name, style: theme.textTheme.titleLarge),
        ]),
        const SizedBox(height: 8),
        if (obj.categoryName != null) Text('Category: ${obj.categoryName}', style: theme.textTheme.bodySmall),
        const SizedBox(height: 16),
        const Divider(),
        const SizedBox(height: 8),
        Text('Attributes', style: theme.textTheme.titleSmall),
        const SizedBox(height: 8),
        attrsAsync.when(
          loading: () => const CircularProgressIndicator(),
          error: (_, _) => const SizedBox(),
          data: (attrs) => attrs.isEmpty
              ? const Text('No fields defined. Add fields in category settings.')
              : Column(
                  children: attrs.map((a) => _AttrField(attr: a, objectId: obj.id, ref: ref)).toList(),
                ),
        ),
        const SizedBox(height: 16),
        const Divider(),
        Text('Notes', style: theme.textTheme.titleSmall),
        const SizedBox(height: 8),
        _NoteField(objectId: obj.id, initialNote: obj.note, ref: ref),
        const SizedBox(height: 16),
        const Divider(),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Tags', style: theme.textTheme.titleSmall),
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () {
                tagsAsync.whenData((tags) {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (_) => TagSelectorSheet(
                      selectedTagIds: tags.map((t) => t.id).toList(),
                      onConfirm: (ids) {
                        ref.read(hashtagDaoProvider).whenData((d) async {
                          await d.setObjectTags(obj.id, ids);
                          ref.invalidate(_objectTagsProvider(obj.id));
                        });
                      },
                    ),
                  );
                });
              },
            ),
          ],
        ),
        tagsAsync.when(
          data: (tags) => Wrap(
            spacing: 8,
            runSpacing: 4,
            children: tags.map((t) => HashtagChip(tag: t)).toList(),
          ),
          loading: () => const SizedBox(),
          error: (_, _) => const SizedBox(),
        ),
      ],
    );
  }
}

class _AttrField extends ConsumerStatefulWidget {
  final ObjectAttributeModel attr;
  final int objectId;
  final WidgetRef ref;
  const _AttrField({required this.attr, required this.objectId, required this.ref});

  @override
  ConsumerState<_AttrField> createState() => _AttrFieldState();
}

class _AttrFieldState extends ConsumerState<_AttrField> {
  late final TextEditingController _ctrl;
  bool _dirty = false;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: widget.attr.attributeValue ?? '');
    _ctrl.addListener(() => setState(() => _dirty = true));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: _ctrl,
        decoration: InputDecoration(
          labelText: widget.attr.description,
          suffix: _dirty
              ? GestureDetector(
                  onTap: _save,
                  child: const Icon(Icons.check, size: 16),
                )
              : null,
        ),
        onEditingComplete: _save,
      ),
    );
  }

  Future<void> _save() async {
    await widget.ref.read(objectDaoProvider).when(
      data: (d) => d.upsertAttr(widget.objectId, widget.attr.id, _ctrl.text.isEmpty ? null : _ctrl.text),
      loading: () async {},
      error: (_, _) async {},
    );
    setState(() => _dirty = false);
  }
}

class _NoteField extends ConsumerStatefulWidget {
  final int objectId;
  final String? initialNote;
  final WidgetRef ref;
  const _NoteField({required this.objectId, this.initialNote, required this.ref});

  @override
  ConsumerState<_NoteField> createState() => _NoteFieldState();
}

class _NoteFieldState extends ConsumerState<_NoteField> {
  late final TextEditingController _ctrl;
  bool _dirty = false;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: widget.initialNote ?? '');
    _ctrl.addListener(() => setState(() => _dirty = true));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(controller: _ctrl, maxLines: 6, decoration: const InputDecoration(hintText: 'Write notes...')),
        if (_dirty) ...[
          const SizedBox(height: 8),
          FilledButton.icon(
            onPressed: _save,
            icon: const Icon(Icons.save, size: 16),
            label: const Text('Save Notes'),
          ),
        ],
      ],
    );
  }

  Future<void> _save() async {
    await widget.ref.read(objectDaoProvider).when(
      data: (d) => d.updateObjectNote(widget.objectId, _ctrl.text.isEmpty ? null : _ctrl.text),
      loading: () async {},
      error: (_, _) async {},
    );
    setState(() => _dirty = false);
  }
}
