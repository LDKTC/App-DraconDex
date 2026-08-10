import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../providers/db_providers.dart';

/// Creates a dated event on a timeline. Pops `true` when an event was created.
class EventDialog extends ConsumerStatefulWidget {
  final int timelineId;
  const EventDialog({super.key, required this.timelineId});

  @override
  ConsumerState<EventDialog> createState() => _EventDialogState();
}

class _EventDialogState extends ConsumerState<EventDialog> {
  final _day = TextEditingController(text: '1');
  final _month = TextEditingController(text: '1');
  final _years = TextEditingController(text: '0');
  final _hour = TextEditingController(text: '0');
  final _minute = TextEditingController(text: '0');

  @override
  void dispose() {
    _day.dispose();
    _month.dispose();
    _years.dispose();
    _hour.dispose();
    _minute.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('New Event'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(children: [
              Expanded(child: _numField(_years, 'Year')),
              const SizedBox(width: 8),
              Expanded(child: _numField(_month, 'Month')),
              const SizedBox(width: 8),
              Expanded(child: _numField(_day, 'Day')),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: _numField(_hour, 'Hour')),
              const SizedBox(width: 8),
              Expanded(child: _numField(_minute, 'Minute')),
            ]),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
        FilledButton(onPressed: _save, child: const Text('Save')),
      ],
    );
  }

  Widget _numField(TextEditingController c, String label) => TextField(
        controller: c,
        keyboardType: TextInputType.number,
        decoration: InputDecoration(labelText: label),
      );

  Future<void> _save() async {
    int parse(TextEditingController c) => int.tryParse(c.text.trim()) ?? 0;
    final day = parse(_day);
    final month = parse(_month);
    final years = parse(_years);
    final hour = parse(_hour);
    final minute = parse(_minute);

    await ref.read(worldDaoProvider).when(
      data: (d) => d.createTimelineEvent(widget.timelineId, day, month, years, hour, minute),
      loading: () async {},
      error: (_, _) async {},
    );
    if (mounted) Navigator.of(context).pop(true);
  }
}
