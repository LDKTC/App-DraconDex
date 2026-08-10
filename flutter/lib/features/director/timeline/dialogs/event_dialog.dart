import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/timeline_model.dart';
import '../../../../data/models/color_model.dart';
import '../../../../providers/db_providers.dart';
import '../../../../widgets/color_dot.dart';
import '../../../../widgets/color_picker_widget.dart';

class EventDialog extends ConsumerStatefulWidget {
  final int timelineId;
  final TimelineEventModel? existing;
  const EventDialog({super.key, required this.timelineId, this.existing});

  @override
  ConsumerState<EventDialog> createState() => _EventDialogState();
}

class _EventDialogState extends ConsumerState<EventDialog> {
  late final TextEditingController _name;
  late final TextEditingController _story;
  ColorModel? _color;

  late int _sYear, _sMonth, _sDay, _sHour, _sMin;
  int? _eYear, _eMonth, _eDay, _eHour, _eMin;
  bool _hasEnd = false;

  @override
  void initState() {
    super.initState();
    final ex = widget.existing;
    _name = TextEditingController(text: ex?.name ?? '');
    _story = TextEditingController(text: ex?.story ?? '');
    final now = DateTime.now();
    _sYear = ex?.startDate?.years ?? now.year;
    _sMonth = ex?.startDate?.month ?? now.month;
    _sDay = ex?.startDate?.day ?? now.day;
    _sHour = ex?.startDate?.hour ?? 0;
    _sMin = ex?.startDate?.minute ?? 0;
    if (ex?.endDate != null) {
      _hasEnd = true;
      _eYear = ex!.endDate!.years;
      _eMonth = ex.endDate!.month;
      _eDay = ex.endDate!.day;
      _eHour = ex.endDate!.hour;
      _eMin = ex.endDate!.minute;
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _story.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.existing == null ? 'New Event' : 'Edit Event'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'Event Name')),
            const SizedBox(height: 12),
            Text('Start Date', style: Theme.of(context).textTheme.titleSmall),
            _DateRow(
              year: _sYear, month: _sMonth, day: _sDay, hour: _sHour, minute: _sMin,
              onChanged: (y, mo, d, h, mi) => setState(() { _sYear = y; _sMonth = mo; _sDay = d; _sHour = h; _sMin = mi; }),
            ),
            const SizedBox(height: 8),
            CheckboxListTile(
              title: const Text('Has End Date'),
              value: _hasEnd,
              onChanged: (v) => setState(() { _hasEnd = v ?? false; if (!_hasEnd) { _eYear = null; } }),
              contentPadding: EdgeInsets.zero,
            ),
            if (_hasEnd) ...[
              Text('End Date', style: Theme.of(context).textTheme.titleSmall),
              _DateRow(
                year: _eYear ?? _sYear, month: _eMonth ?? _sMonth, day: _eDay ?? _sDay, hour: _eHour ?? 0, minute: _eMin ?? 0,
                onChanged: (y, mo, d, h, mi) => setState(() { _eYear = y; _eMonth = mo; _eDay = d; _eHour = h; _eMin = mi; }),
              ),
            ],
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
            const SizedBox(height: 12),
            TextField(controller: _story, decoration: const InputDecoration(labelText: 'Story'), maxLines: 3),
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
    await ref.read(timelineDaoProvider).when(
      data: (d) async {
        final startId = await d.getOrCreateDate(_sDay, _sMonth, _sYear, _sHour, _sMin);
        int? endId;
        if (_hasEnd && _eYear != null) {
          endId = await d.getOrCreateDate(_eDay!, _eMonth!, _eYear!, _eHour ?? 0, _eMin ?? 0);
        }
        final colorId = _color?.id ?? widget.existing?.colorId;
        final story = _story.text.trim().isEmpty ? null : _story.text.trim();
        final name = _name.text.trim().isEmpty ? null : _name.text.trim();
        if (widget.existing == null) {
          await d.createEvent(widget.timelineId, name, startId, endId, colorId, story);
        } else {
          await d.updateEvent(widget.existing!.id, name, startId, endId, colorId, story);
        }
      },
      loading: () async {},
      error: (_, _) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}

class _DateRow extends StatelessWidget {
  final int year, month, day, hour, minute;
  final void Function(int y, int mo, int d, int h, int mi) onChanged;

  const _DateRow({required this.year, required this.month, required this.day, required this.hour, required this.minute, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      _NumField(label: 'Y', value: year, onChanged: (v) => onChanged(v, month, day, hour, minute)),
      const SizedBox(width: 4),
      _NumField(label: 'M', value: month, min: 1, max: 12, onChanged: (v) => onChanged(year, v, day, hour, minute)),
      const SizedBox(width: 4),
      _NumField(label: 'D', value: day, min: 1, max: 31, onChanged: (v) => onChanged(year, month, v, hour, minute)),
      const SizedBox(width: 4),
      _NumField(label: 'H', value: hour, min: 0, max: 23, onChanged: (v) => onChanged(year, month, day, v, minute)),
      const SizedBox(width: 4),
      _NumField(label: 'Mi', value: minute, min: 0, max: 59, onChanged: (v) => onChanged(year, month, day, hour, v)),
    ]);
  }
}

class _NumField extends StatelessWidget {
  final String label;
  final int value;
  final int? min;
  final int? max;
  final void Function(int) onChanged;

  const _NumField({required this.label, required this.value, this.min, this.max, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: TextField(
        controller: TextEditingController(text: value.toString()),
        keyboardType: TextInputType.number,
        decoration: InputDecoration(labelText: label, isDense: true, contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8)),
        onChanged: (v) {
          final n = int.tryParse(v);
          if (n == null) return;
          if (min != null && n < min!) return;
          if (max != null && n > max!) return;
          onChanged(n);
        },
      ),
    );
  }
}
