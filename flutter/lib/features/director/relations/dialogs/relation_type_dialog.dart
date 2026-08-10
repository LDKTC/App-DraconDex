import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/relation_model.dart';
import '../../../../data/models/color_model.dart';
import '../../../../providers/db_providers.dart';
import '../../../../widgets/color_dot.dart';
import '../../../../widgets/color_picker_widget.dart';
import '../../../../widgets/confirm_dialog.dart';

final _rtListProvider = FutureProvider<List<RelationTypeModel>>((ref) async {
  final dao = ref.watch(relationDaoProvider);
  return dao.when(data: (d) => d.getRelationTypes(), loading: () => Future.value([]), error: (_, _) => Future.value([]));
});

class RelationTypeDialog extends ConsumerWidget {
  const RelationTypeDialog({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final typesAsync = ref.watch(_rtListProvider);
    return AlertDialog(
      title: const Text('Relation Types'),
      content: SizedBox(
        width: 320,
        child: typesAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Text('$e'),
          data: (types) => types.isEmpty
              ? const Text('No types yet.')
              : ListView.builder(
                  shrinkWrap: true,
                  itemCount: types.length,
                  itemBuilder: (ctx, i) {
                    final t = types[i];
                    return ListTile(
                      dense: true,
                      leading: ColorDot(colorCode: t.colorCode),
                      title: Text(t.name),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.edit, size: 18),
                            onPressed: () => showDialog(
                              context: context,
                              builder: (_) => _RelationTypeFormDialog(existing: t),
                            ).then((_) => ref.invalidate(_rtListProvider)),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete, size: 18),
                            onPressed: () => showConfirmDialog(ctx, title: 'Delete type?').then((ok) {
                              if (ok) {
                                ref.read(relationDaoProvider).whenData((d) async {
                                  await d.deleteRelationType(t.id);
                                  ref.invalidate(_rtListProvider);
                                });
                              }
                            }),
                          ),
                        ],
                      ),
                    );
                  },
                ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => showDialog(
            context: context,
            builder: (_) => const _RelationTypeFormDialog(),
          ).then((_) => ref.invalidate(_rtListProvider)),
          child: const Text('Add Type'),
        ),
        TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Close')),
      ],
    );
  }
}

class _RelationTypeFormDialog extends ConsumerStatefulWidget {
  final RelationTypeModel? existing;
  const _RelationTypeFormDialog({this.existing});

  @override
  ConsumerState<_RelationTypeFormDialog> createState() => _RelationTypeFormDialogState();
}

class _RelationTypeFormDialogState extends ConsumerState<_RelationTypeFormDialog> {
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
      title: Text(widget.existing == null ? 'New Type' : 'Edit Type'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(controller: _name, decoration: const InputDecoration(labelText: 'Type Name')),
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
    await ref.read(relationDaoProvider).when(
      data: (d) async {
        if (widget.existing == null) {
          await d.createRelationType(name, colorId);
        } else {
          await d.updateRelationType(widget.existing!.id, name, colorId);
        }
      },
      loading: () async {},
      error: (_, _) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}
