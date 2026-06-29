import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/folder_model.dart';
import '../../../../data/models/color_model.dart';
import '../../../../providers/db_providers.dart';
import '../../../../widgets/color_dot.dart';
import '../../../../widgets/color_picker_widget.dart';

class FolderDialog extends ConsumerStatefulWidget {
  final FolderModel? existing;
  const FolderDialog({super.key, this.existing});

  @override
  ConsumerState<FolderDialog> createState() => _FolderDialogState();
}

class _FolderDialogState extends ConsumerState<FolderDialog> {
  late final TextEditingController _name;
  late final TextEditingController _memo;
  ColorModel? _color;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.existing?.name ?? '');
    _memo = TextEditingController(text: widget.existing?.memo ?? '');
  }

  @override
  void dispose() {
    _name.dispose();
    _memo.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.existing == null ? 'New Folder' : 'Edit Folder'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(controller: _name, decoration: const InputDecoration(labelText: 'Name')),
          const SizedBox(height: 12),
          TextField(controller: _memo, decoration: const InputDecoration(labelText: 'Memo'), maxLines: 2),
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
        FilledButton(
          onPressed: _save,
          child: const Text('Save'),
        ),
      ],
    );
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    if (name.isEmpty) return;
    final colorId = _color?.id ?? (widget.existing?.colorId);
    final dao = ref.read(folderDaoProvider);
    await dao.when(
      data: (d) async {
        if (widget.existing == null) {
          await d.createFolder(name, _memo.text.trim().isEmpty ? null : _memo.text.trim(), colorId);
        } else {
          await d.updateFolder(widget.existing!.id, name, _memo.text.trim().isEmpty ? null : _memo.text.trim(), colorId);
        }
      },
      loading: () async {},
      error: (_, __) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}
