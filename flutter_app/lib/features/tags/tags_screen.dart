import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/hashtag_model.dart';
import '../../data/models/color_model.dart';
import '../../providers/db_providers.dart';
import '../../providers/hashtag_provider.dart';
import '../../widgets/color_dot.dart';
import '../../widgets/color_picker_widget.dart';
import '../../widgets/confirm_dialog.dart';

class TagsScreen extends ConsumerWidget {
  const TagsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tagsAsync = ref.watch(hashtagsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Hashtags')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => showDialog(context: context, builder: (_) => const _TagFormDialog())
            .then((_) => ref.invalidate(hashtagsProvider)),
        child: const Icon(Icons.add),
      ),
      body: tagsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (tags) {
          if (tags.isEmpty) return const Center(child: Text('No hashtags yet.'));
          return ListView.builder(
            itemCount: tags.length,
            itemBuilder: (ctx, i) {
              final t = tags[i];
              return ListTile(
                leading: ColorDot(colorCode: t.colorCode),
                title: Text('#${t.name}'),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () => showDialog(context: context, builder: (_) => _TagFormDialog(existing: t))
                          .then((_) => ref.invalidate(hashtagsProvider)),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete),
                      onPressed: () => showConfirmDialog(ctx, title: 'Delete hashtag?').then((ok) {
                        if (ok) {
                          ref.read(hashtagDaoProvider).whenData((d) async {
                            await d.deleteHashtag(t.id);
                            ref.invalidate(hashtagsProvider);
                          });
                        }
                      }),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _TagFormDialog extends ConsumerStatefulWidget {
  final HashtagModel? existing;
  const _TagFormDialog({this.existing});

  @override
  ConsumerState<_TagFormDialog> createState() => _TagFormDialogState();
}

class _TagFormDialogState extends ConsumerState<_TagFormDialog> {
  late final TextEditingController _name;
  ColorModel? _color;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.existing?.name ?? '');
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.existing == null ? 'New Hashtag' : 'Edit Hashtag'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _name,
            decoration: const InputDecoration(labelText: 'Tag Name', prefixText: '#'),
          ),
          const SizedBox(height: 12),
          Row(children: [
            const Text('Color: '),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => showColorPicker(context, ref,
                  currentColorCode: _color?.colorCode ?? widget.existing?.colorCode,
                  onColorSelected: (c) => setState(() => _color = c)),
              child: ColorDot(colorCode: _color?.colorCode ?? widget.existing?.colorCode, size: 24),
            ),
          ]),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Cancel')),
        FilledButton(onPressed: _save, child: const Text('Save')),
      ],
    );
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    if (name.isEmpty) return;
    final colorId = _color?.id ?? widget.existing?.colorId;
    await ref.read(hashtagDaoProvider).when(
      data: (d) async {
        if (widget.existing == null) {
          await d.createHashtag(name, colorId);
        } else {
          await d.updateHashtag(widget.existing!.id, name, colorId);
        }
      },
      loading: () async {},
      error: (_, _) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}
