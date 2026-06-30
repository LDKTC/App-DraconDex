import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/relation_model.dart';
import '../../../../data/models/object_model.dart';
import '../../../../data/models/timeline_model.dart';
import '../../../../data/models/color_model.dart';
import '../../../../providers/db_providers.dart';
import '../../../../widgets/color_dot.dart';
import '../../../../widgets/color_picker_widget.dart';

final _relTypesDialogProvider = FutureProvider<List<RelationTypeModel>>((ref) async {
  return ref.watch(relationDaoProvider).when(
        data: (d) => d.getRelationTypes(),
        loading: () => Future.value([]),
        error: (_, _) => Future.value([]),
      );
});

final _projObjectsDialogProvider = FutureProvider.family<List<ObjectModel>, int>((ref, pid) async {
  return ref.watch(objectDaoProvider).when(
        data: (d) => d.getProjectObjects(pid),
        loading: () => Future.value([]),
        error: (_, _) => Future.value([]),
      );
});

final _projTimelinesDialogProvider = FutureProvider.family<List<TimelineModel>, int>((ref, pid) async {
  return ref.watch(timelineDaoProvider).when(
        data: (d) => d.getTimelines(pid),
        loading: () => Future.value([]),
        error: (_, _) => Future.value([]),
      );
});

final _projEventsDialogProvider = FutureProvider.family<List<TimelineEventModel>, int>((ref, tlId) async {
  return ref.watch(timelineDaoProvider).when(
        data: (d) => d.getEvents(tlId),
        loading: () => Future.value([]),
        error: (_, _) => Future.value([]),
      );
});

/// type: 0=OBOB, 1=OBTL, 2=TLTL
class RelationDialog extends ConsumerStatefulWidget {
  final int projectId;
  final int type;
  const RelationDialog({super.key, required this.projectId, required this.type});

  @override
  ConsumerState<RelationDialog> createState() => _RelationDialogState();
}

class _RelationDialogState extends ConsumerState<RelationDialog> {
  int? _selectedType;
  ColorModel? _color;
  int? _fromId;
  int? _toId;

  @override
  Widget build(BuildContext context) {
    final typesAsync = ref.watch(_relTypesDialogProvider);
    final objectsAsync = ref.watch(_projObjectsDialogProvider(widget.projectId));

    return AlertDialog(
      title: Text(_title),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Relation type dropdown
            typesAsync.when(
              loading: () => const CircularProgressIndicator(),
              error: (e, _) => Text('$e'),
              data: (types) => DropdownButtonFormField<int?>(
                initialValue: _selectedType,
                decoration: const InputDecoration(labelText: 'Relation Type (optional)'),
                items: [
                  const DropdownMenuItem(value: null, child: Text('— None —')),
                  ...types.map((t) => DropdownMenuItem(
                        value: t.id,
                        child: Row(children: [
                          ColorDot(colorCode: t.colorCode, size: 16),
                          const SizedBox(width: 8),
                          Text(t.name),
                        ]),
                      )),
                ],
                onChanged: (v) => setState(() => _selectedType = v),
              ),
            ),
            const SizedBox(height: 12),
            Row(children: [
              const Text('Color: '),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => showColorPicker(context, ref,
                    currentColorCode: _color?.colorCode,
                    onColorSelected: (c) => setState(() => _color = c)),
                child: ColorDot(colorCode: _color?.colorCode, size: 24),
              ),
            ]),
            const SizedBox(height: 16),
            // From selector
            Text(_fromLabel, style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 4),
            if (widget.type == 0 || widget.type == 1)
              objectsAsync.when(
                loading: () => const CircularProgressIndicator(),
                error: (e, _) => Text('$e'),
                data: (objects) => _ObjectDropdown(
                  label: 'From Object',
                  objects: objects,
                  value: _fromId,
                  onChanged: (v) => setState(() => _fromId = v),
                ),
              )
            else
              _TimelineEventSelector(
                projectId: widget.projectId,
                label: 'From Event',
                selectedEventId: _fromId,
                onEventSelected: (v) => setState(() => _fromId = v),
              ),
            const SizedBox(height: 16),
            Text(_toLabel, style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 4),
            if (widget.type == 0)
              objectsAsync.when(
                loading: () => const CircularProgressIndicator(),
                error: (e, _) => Text('$e'),
                data: (objects) => _ObjectDropdown(
                  label: 'To Object',
                  objects: objects,
                  value: _toId,
                  onChanged: (v) => setState(() => _toId = v),
                ),
              )
            else
              _TimelineEventSelector(
                projectId: widget.projectId,
                label: 'To Event',
                selectedEventId: _toId,
                onEventSelected: (v) => setState(() => _toId = v),
              ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Cancel')),
        FilledButton(
          onPressed: _fromId != null && _toId != null ? _save : null,
          child: const Text('Save'),
        ),
      ],
    );
  }

  String get _title => ['OB ↔ OB Relation', 'OB ↔ TL Relation', 'TL ↔ TL Relation'][widget.type];
  String get _fromLabel => widget.type == 2 ? 'From Event' : 'From Object';
  String get _toLabel => widget.type == 0 ? 'To Object' : 'To Event';

  Future<void> _save() async {
    await ref.read(relationDaoProvider).when(
      data: (d) async {
        switch (widget.type) {
          case 0:
            await d.createRelationOBOB(widget.projectId, _selectedType, _color?.id, _fromId!, _toId!);
          case 1:
            await d.createRelationOBTL(widget.projectId, _selectedType, _color?.id, _fromId!, _toId!);
          case 2:
            await d.createRelationTLTL(widget.projectId, _selectedType, _color?.id, _fromId!, _toId!);
        }
      },
      loading: () async {},
      error: (_, _) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}

class _ObjectDropdown extends StatelessWidget {
  final String label;
  final List<ObjectModel> objects;
  final int? value;
  final void Function(int?) onChanged;
  const _ObjectDropdown({required this.label, required this.objects, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<int?>(
      initialValue: value,
      decoration: InputDecoration(labelText: label),
      items: objects
          .map((o) => DropdownMenuItem(
                value: o.id,
                child: Text('${o.name} (${o.categoryName ?? ''})'),
              ))
          .toList(),
      onChanged: onChanged,
    );
  }
}

class _TimelineEventSelector extends ConsumerStatefulWidget {
  final int projectId;
  final String label;
  final int? selectedEventId;
  final void Function(int?) onEventSelected;
  const _TimelineEventSelector({
    required this.projectId,
    required this.label,
    required this.selectedEventId,
    required this.onEventSelected,
  });

  @override
  ConsumerState<_TimelineEventSelector> createState() => _TimelineEventSelectorState();
}

class _TimelineEventSelectorState extends ConsumerState<_TimelineEventSelector> {
  int? _tlId;

  @override
  Widget build(BuildContext context) {
    final timelinesAsync = ref.watch(_projTimelinesDialogProvider(widget.projectId));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        timelinesAsync.when(
          loading: () => const CircularProgressIndicator(),
          error: (e, _) => Text('$e'),
          data: (tls) => DropdownButtonFormField<int?>(
            initialValue: _tlId,
            decoration: const InputDecoration(labelText: 'Timeline'),
            items: tls
                .map((t) => DropdownMenuItem(value: t.id, child: Text(t.name ?? 'Timeline ${t.id}')))
                .toList(),
            onChanged: (v) {
              setState(() => _tlId = v);
              widget.onEventSelected(null);
            },
          ),
        ),
        if (_tlId != null) ...[
          const SizedBox(height: 8),
          Consumer(builder: (ctx, ref, _) {
            final eventsAsync = ref.watch(_projEventsDialogProvider(_tlId!));
            return eventsAsync.when(
              loading: () => const CircularProgressIndicator(),
              error: (e, _) => Text('$e'),
              data: (events) => DropdownButtonFormField<int?>(
                initialValue: widget.selectedEventId,
                decoration: InputDecoration(labelText: widget.label),
                items: events
                    .map((e) => DropdownMenuItem(value: e.id, child: Text(e.name ?? 'Event ${e.id}')))
                    .toList(),
                onChanged: widget.onEventSelected,
              ),
            );
          }),
        ],
      ],
    );
  }
}
