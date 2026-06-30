import 'package:flutter/material.dart';
import '../../../../data/dao/world_dao.dart';
import '../../../../data/models/world_model.dart';
import '../../../../widgets/color_dot.dart';

/// Places a world object or character at an (x,y) point within an event.
/// Pops `true` when something was placed.
class PlaceObjectDialog extends StatefulWidget {
  final int worldId;
  final int eventId;
  final WorldDao dao;
  const PlaceObjectDialog({super.key, required this.worldId, required this.eventId, required this.dao});

  @override
  State<PlaceObjectDialog> createState() => _PlaceObjectDialogState();
}

class _PlaceObjectDialogState extends State<PlaceObjectDialog> {
  bool _loading = true;
  bool _asCharacter = false;
  List<LinkableObjectModel> _objects = [];
  List<LinkableObjectModel> _characters = [];
  int? _selectedId;
  final _x = TextEditingController(text: '0');
  final _y = TextEditingController(text: '0');

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final objects = await widget.dao.getPlaceableObjects(widget.worldId);
    final characters = await widget.dao.getPlaceableCharacters(widget.worldId);
    if (mounted) {
      setState(() {
        _objects = objects;
        _characters = characters;
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _x.dispose();
    _y.dispose();
    super.dispose();
  }

  List<LinkableObjectModel> get _current => _asCharacter ? _characters : _objects;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Place on Timeline'),
      content: _loading
          ? const SizedBox(height: 80, child: Center(child: CircularProgressIndicator()))
          : SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SegmentedButton<bool>(
                    segments: const [
                      ButtonSegment(value: false, label: Text('Object')),
                      ButtonSegment(value: true, label: Text('Character')),
                    ],
                    selected: {_asCharacter},
                    onSelectionChanged: (s) => setState(() {
                      _asCharacter = s.first;
                      _selectedId = null;
                    }),
                  ),
                  const SizedBox(height: 12),
                  if (_current.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Text('None available. Add world objects/characters first.'),
                    )
                  else
                    DropdownButtonFormField<int>(
                      initialValue: _selectedId,
                      isExpanded: true,
                      decoration: const InputDecoration(labelText: 'Entity *'),
                      items: _current
                          .map((e) => DropdownMenuItem(
                                value: e.id,
                                child: Row(children: [
                                  ColorDot(colorCode: e.colorCode, size: 12),
                                  const SizedBox(width: 8),
                                  Flexible(child: Text(e.name, overflow: TextOverflow.ellipsis)),
                                ]),
                              ))
                          .toList(),
                      onChanged: (v) => setState(() => _selectedId = v),
                    ),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(
                      child: TextField(
                        controller: _x,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                        decoration: const InputDecoration(labelText: 'X'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _y,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                        decoration: const InputDecoration(labelText: 'Y'),
                      ),
                    ),
                  ]),
                ],
              ),
            ),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
        FilledButton(onPressed: _selectedId == null ? null : _save, child: const Text('Place')),
      ],
    );
  }

  Future<void> _save() async {
    final id = _selectedId;
    if (id == null) return;
    final x = double.tryParse(_x.text.trim()) ?? 0;
    final y = double.tryParse(_y.text.trim()) ?? 0;
    await widget.dao.addEventObject(
      widget.eventId,
      worldObjectRef: _asCharacter ? null : id,
      worldCharacterRef: _asCharacter ? id : null,
      x: x,
      y: y,
    );
    if (mounted) Navigator.of(context).pop(true);
  }
}
