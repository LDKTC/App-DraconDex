import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/map_model.dart';
import '../../../../data/models/color_model.dart';
import '../../../../providers/db_providers.dart';
import '../../../../widgets/color_dot.dart';
import '../../../../widgets/color_picker_widget.dart';

class MapDialog extends ConsumerStatefulWidget {
  final int projectId;
  final MapModel? existing;
  const MapDialog({super.key, required this.projectId, this.existing});

  @override
  ConsumerState<MapDialog> createState() => _MapDialogState();
}

class _MapDialogState extends ConsumerState<MapDialog> {
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
      title: Text(widget.existing == null ? 'New Map' : 'Edit Map'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(controller: _name, decoration: const InputDecoration(labelText: 'Map Name')),
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
    final name = _name.text.trim().isEmpty ? null : _name.text.trim();
    final colorId = _color?.id ?? widget.existing?.colorId;
    await ref.read(mapDaoProvider).when(
      data: (d) async {
        if (widget.existing == null) {
          await d.createMap(widget.projectId, name, colorId);
        } else {
          await d.updateMap(widget.existing!.id, name, colorId);
        }
      },
      loading: () async {},
      error: (_, _) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}
