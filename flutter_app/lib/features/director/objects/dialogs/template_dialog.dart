import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/models/category_model.dart';
import '../../../../providers/db_providers.dart';

final _templatesProvider = FutureProvider.family<List<TemplateModel>, int>((ref, catId) async {
  final dao = ref.watch(categoryDaoProvider);
  return dao.when(data: (d) => d.getTemplates(catId), loading: () => Future.value([]), error: (_, __) => Future.value([]));
});

class TemplateDialog extends ConsumerStatefulWidget {
  final CategoryModel category;
  const TemplateDialog({super.key, required this.category});

  @override
  ConsumerState<TemplateDialog> createState() => _TemplateDialogState();
}

class _TemplateDialogState extends ConsumerState<TemplateDialog> {
  final _newNameCtrl = TextEditingController();

  @override
  void dispose() {
    _newNameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final templatesAsync = ref.watch(_templatesProvider(widget.category.id));

    return AlertDialog(
      title: Text('Fields: ${widget.category.name}'),
      content: SizedBox(
        width: 360,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            templatesAsync.when(
              loading: () => const CircularProgressIndicator(),
              error: (_, __) => const SizedBox(),
              data: (templates) => templates.isEmpty
                  ? const Text('No fields yet.')
                  : Column(
                      children: templates.map((t) => ListTile(
                        title: Text(t.description),
                        subtitle: Text(t.attributeType),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete),
                          onPressed: () async {
                            await ref.read(categoryDaoProvider).when(
                              data: (d) => d.deleteTemplate(t.id),
                              loading: () async {},
                              error: (_, __) async {},
                            );
                            ref.invalidate(_templatesProvider(widget.category.id));
                          },
                        ),
                      )).toList(),
                    ),
            ),
            const Divider(),
            Row(children: [
              Expanded(child: TextField(controller: _newNameCtrl, decoration: const InputDecoration(hintText: 'Field name'))),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.add),
                onPressed: () async {
                  final name = _newNameCtrl.text.trim();
                  if (name.isEmpty) return;
                  await ref.read(categoryDaoProvider).when(
                    data: (d) => d.createTemplate(widget.category.id, name, 'text'),
                    loading: () async {},
                    error: (_, __) async {},
                  );
                  _newNameCtrl.clear();
                  ref.invalidate(_templatesProvider(widget.category.id));
                },
              ),
            ]),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Done')),
      ],
    );
  }
}
