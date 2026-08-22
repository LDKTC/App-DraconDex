import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/module_model.dart';
import '../../../providers/db_providers.dart';

class NexusDialog extends ConsumerStatefulWidget {
  final NexusModel? existing;
  const NexusDialog({super.key, this.existing});

  @override
  ConsumerState<NexusDialog> createState() => _NexusDialogState();
}

class _NexusDialogState extends ConsumerState<NexusDialog> {
  late final TextEditingController _name;
  late final TextEditingController _memo;

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
      title: Text(widget.existing == null ? 'New Nexus' : 'Rename Nexus'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(controller: _name, autofocus: true, decoration: const InputDecoration(labelText: 'Name *')),
          const SizedBox(height: 12),
          TextField(controller: _memo, decoration: const InputDecoration(labelText: 'Memo'), maxLines: 2),
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
    final memo = _memo.text.trim().isEmpty ? null : _memo.text.trim();
    await ref.read(moduleDaoProvider).when(
      data: (d) async {
        if (widget.existing == null) {
          await d.createNexus(name: name, memo: memo);
        } else {
          await d.updateNexus(widget.existing!.id, name: name, memo: memo, colorId: widget.existing!.colorId);
        }
      },
      loading: () async {},
      error: (_, _) async {},
    );
    if (mounted) Navigator.of(context).pop();
  }
}
