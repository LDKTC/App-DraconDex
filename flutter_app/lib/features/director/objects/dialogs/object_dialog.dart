import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/object_model.dart';
import '../../../../data/models/color_model.dart';
import '../../../../providers/db_providers.dart';
import '../../../../widgets/color_dot.dart';
import '../../../../widgets/color_picker_widget.dart';

class ObjectDialog extends ConsumerStatefulWidget {
  final int projectId;
  final int categoryId;
  final ObjectModel? existing;
  const ObjectDialog({super.key, required this.projectId, required this.categoryId, this.existing});

  @override
  ConsumerState<ObjectDialog> createState() => _ObjectDialogState();
}

class _ObjectDialogState extends ConsumerState<ObjectDialog> {
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
      title: Text(widget.existing == null ? 'New Object' : 'Edit Object'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(controller: _name, decoration: const InputDecoration(labelText: 'Name')),
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
    await ref.read(objectDaoProvider).when(
      data: (d) async {
        if (widget.existing == null) {
          await d.createObject(widget.projectId, widget.categoryId, name, colorId);
        } else {
          await d.updateObject(widget.existing!.id, name, colorId);
        }
      },
      loading: () async {},
      error: (_, __) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}
