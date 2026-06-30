import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/dao/search_dao.dart';
import '../../providers/db_providers.dart';
import '../../widgets/color_dot.dart';
import '../../widgets/hashtag_chip.dart';

final _searchResultProvider = FutureProvider.family<SearchResult?, String>((ref, query) async {
  if (query.isEmpty) return null;
  return ref.watch(searchDaoProvider).when(
        data: (d) => d.searchAll(query),
        loading: () => null,
        error: (_, _) => null,
      );
});

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _ctrl = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final resultAsync = ref.watch(_searchResultProvider(_query));
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _ctrl,
          autofocus: true,
          decoration: const InputDecoration(hintText: 'Search…', border: InputBorder.none),
          onChanged: (v) => setState(() => _query = v.trim()),
        ),
        actions: [
          if (_query.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _ctrl.clear();
                setState(() => _query = '');
              },
            ),
        ],
      ),
      body: _query.isEmpty
          ? const Center(child: Text('Type to search across projects, objects, and tags.'))
          : resultAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('$e')),
              data: (result) {
                if (result == null) return const Center(child: CircularProgressIndicator());
                final empty = result.projects.isEmpty && result.objects.isEmpty && result.hashtags.isEmpty;
                if (empty) return Center(child: Text('No results for "$_query".'));
                return ListView(
                  children: [
                    if (result.projects.isNotEmpty) ...[
                      _SectionHeader('Projects (${result.projects.length})'),
                      ...result.projects.map((p) => ListTile(
                            leading: ColorDot(colorCode: p.colorCode),
                            title: Text(p.name),
                            subtitle: p.codename != null ? Text(p.codename!) : null,
                          )),
                    ],
                    if (result.objects.isNotEmpty) ...[
                      _SectionHeader('Objects (${result.objects.length})'),
                      ...result.objects.map((o) => ListTile(
                            leading: ColorDot(colorCode: o.colorCode),
                            title: Text(o.name),
                            subtitle: Text(o.categoryName ?? ''),
                          )),
                    ],
                    if (result.hashtags.isNotEmpty) ...[
                      _SectionHeader('Hashtags (${result.hashtags.length})'),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          children: result.hashtags.map((t) => HashtagChip(tag: t)).toList(),
                        ),
                      ),
                    ],
                  ],
                );
              },
            ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String text;
  const _SectionHeader(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(text, style: Theme.of(context).textTheme.titleSmall?.copyWith(color: Theme.of(context).colorScheme.primary)),
    );
  }
}
