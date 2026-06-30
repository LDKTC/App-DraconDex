import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/world_model.dart';
import '../../../../data/models/color_model.dart';
import '../../../../providers/db_providers.dart';
import '../../../../widgets/color_dot.dart';
import '../../../../widgets/color_picker_widget.dart';

class CharacterDialog extends ConsumerStatefulWidget {
  final int worldId;
  final WorldCharacterModel? existing;
  const CharacterDialog({super.key, required this.worldId, this.existing});

  @override
  ConsumerState<CharacterDialog> createState() => _CharacterDialogState();
}

class _CharacterDialogState extends ConsumerState<CharacterDialog> {
  late final TextEditingController _name;
  late final TextEditingController _symbol;
  ColorModel? _color;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.existing?.name ?? '');
    _symbol = TextEditingController(text: widget.existing?.symbol ?? '');
  }

  @override
  void dispose() {
    _name.dispose();
    _symbol.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.existing == null ? 'New Character' : 'Edit Character'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'Name *')),
            const SizedBox(height: 12),
            TextField(controller: _symbol, decoration: const InputDecoration(labelText: 'Symbol')),
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
    final symbol = _symbol.text.trim().isEmpty ? null : _symbol.text.trim();

    await ref.read(worldDaoProvider).when(
      data: (d) async {
        if (widget.existing == null) {
          await d.createWorldCharacter(widget.worldId, name, symbol, colorId);
        } else {
          await d.updateWorldCharacter(widget.existing!.id, name, symbol, colorId);
        }
      },
      loading: () async {},
      error: (_, _) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}
