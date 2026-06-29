import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/hashtag_model.dart';
import '../providers/hashtag_provider.dart';
import 'color_dot.dart';

class TagSelectorSheet extends ConsumerStatefulWidget {
  final List<int> selectedTagIds;
  final void Function(List<int> tagIds) onConfirm;

  const TagSelectorSheet({
    super.key,
    required this.selectedTagIds,
    required this.onConfirm,
  });

  @override
  ConsumerState<TagSelectorSheet> createState() => _TagSelectorSheetState();
}

class _TagSelectorSheetState extends ConsumerState<TagSelectorSheet> {
  late Set<int> _selected;

  @override
  void initState() {
    super.initState();
    _selected = Set.from(widget.selectedTagIds);
  }

  @override
  Widget build(BuildContext context) {
    final tagsAsync = ref.watch(hashtagsProvider);
    final theme = Theme.of(context);

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.5,
      builder: (ctx, scroll) => Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          children: [
            Container(
              width: 40, height: 4,
              margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(color: theme.colorScheme.outline, borderRadius: BorderRadius.circular(2)),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Select Tags', style: theme.textTheme.titleMedium),
                  FilledButton(
                    onPressed: () {
                      widget.onConfirm(_selected.toList());
                      Navigator.of(context).pop();
                    },
                    child: const Text('Done'),
                  ),
                ],
              ),
            ),
            const Divider(),
            Expanded(
              child: tagsAsync.when(
                data: (tags) => ListView.builder(
                  controller: scroll,
                  itemCount: tags.length,
                  itemBuilder: (ctx, i) {
                    final tag = tags[i];
                    final sel = _selected.contains(tag.id);
                    return CheckboxListTile(
                      value: sel,
                      onChanged: (v) => setState(() {
                        if (v == true) _selected.add(tag.id);
                        else _selected.remove(tag.id);
                      }),
                      title: Row(children: [
                        if (tag.colorCode != null) ...[
                          ColorDot(colorCode: tag.colorCode),
                          const SizedBox(width: 8),
                        ],
                        Text('#${tag.name}'),
                      ]),
                    );
                  },
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (_, __) => const SizedBox(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
