import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/world_model.dart';
import '../../../../data/models/color_model.dart';
import '../../../../providers/db_providers.dart';
import '../../../../widgets/color_dot.dart';
import '../../../../widgets/color_picker_widget.dart';

class WorldDialog extends ConsumerStatefulWidget {
  final WorldModel? existing;
  const WorldDialog({super.key, this.existing});

  @override
  ConsumerState<WorldDialog> createState() => _WorldDialogState();
}

class _WorldDialogState extends ConsumerState<WorldDialog> {
  late final TextEditingController _name;
  late final TextEditingController _codename;
  late final TextEditingController _memo;
  ColorModel? _color;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.existing?.name ?? '');
    _codename = TextEditingController(text: widget.existing?.codename ?? '');
    _memo = TextEditingController(text: widget.existing?.memo ?? '');
  }

  @override
  void dispose() {
    _name.dispose();
    _codename.dispose();
    _memo.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.existing == null ? 'New World' : 'Edit World'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'Name *')),
            const SizedBox(height: 12),
            TextField(controller: _codename, decoration: const InputDecoration(labelText: 'Codename')),
            const SizedBox(height: 12),
            TextField(controller: _memo, decoration: const InputDecoration(labelText: 'Memo'), maxLines: 3),
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
    final codename = _codename.text.trim().isEmpty ? null : _codename.text.trim();
    final memo = _memo.text.trim().isEmpty ? null : _memo.text.trim();

    await ref.read(worldDaoProvider).when(
      data: (d) async {
        if (widget.existing == null) {
          await d.createWorld(name: name, codename: codename, memo: memo, colorId: colorId);
        } else {
          await d.updateWorld(widget.existing!.id, name: name, codename: codename, memo: memo, colorId: colorId);
        }
      },
      loading: () async {},
      error: (_, _) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}
