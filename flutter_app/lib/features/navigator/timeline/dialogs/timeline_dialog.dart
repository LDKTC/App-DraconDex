import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/world_model.dart';
import '../../../../providers/world_provider.dart';
import '../../../../providers/db_providers.dart';

class TimelineDialog extends ConsumerStatefulWidget {
  final int worldId;
  final WorldTimelineModel? existing;
  const TimelineDialog({super.key, required this.worldId, this.existing});

  @override
  ConsumerState<TimelineDialog> createState() => _TimelineDialogState();
}

class _TimelineDialogState extends ConsumerState<TimelineDialog> {
  late final TextEditingController _name;
  int? _worldMapRef;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.existing?.name ?? '');
    _worldMapRef = widget.existing?.worldMapRef;
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mapsAsync = ref.watch(worldMapsProvider(widget.worldId));
    return AlertDialog(
      title: Text(widget.existing == null ? 'New Timeline' : 'Edit Timeline'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'Name *')),
            const SizedBox(height: 12),
            mapsAsync.when(
              data: (maps) => DropdownButtonFormField<int?>(
                initialValue: _worldMapRef,
                decoration: const InputDecoration(labelText: 'Anchor map (optional)'),
                items: [
                  const DropdownMenuItem(value: null, child: Text('No map')),
                  ...maps.map((WorldMapModel m) => DropdownMenuItem(
                        value: m.id,
                        child: Text(m.mapName.isEmpty ? '(untitled map)' : m.mapName),
                      )),
                ],
                onChanged: (v) => setState(() => _worldMapRef = v),
              ),
              loading: () => const SizedBox(),
              error: (_, _) => const SizedBox(),
            ),
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
    await ref.read(worldDaoProvider).when(
      data: (d) async {
        if (widget.existing == null) {
          await d.createWorldTimeline(widget.worldId, name, _worldMapRef);
        } else {
          await d.updateWorldTimeline(widget.existing!.id, name, _worldMapRef);
        }
      },
      loading: () async {},
      error: (_, _) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}
