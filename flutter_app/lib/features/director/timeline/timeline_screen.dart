import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/timeline_model.dart';
import '../../../providers/db_providers.dart';
import '../../../providers/project_provider.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';
import '../../../widgets/color_picker_widget.dart';
import 'dialogs/timeline_dialog.dart';
import 'dialogs/event_dialog.dart';
import 'timeline_graph_painter.dart';

final _timelinesProvider = FutureProvider.family<List<TimelineModel>, int>((ref, pid) async {
  final dao = ref.watch(timelineDaoProvider);
  return dao.when(data: (d) => d.getTimelines(pid), loading: () => Future.value([]), error: (_, _) => Future.value([]));
});

final _eventsProvider = FutureProvider.family<List<TimelineEventModel>, int>((ref, tlId) async {
  final dao = ref.watch(timelineDaoProvider);
  return dao.when(data: (d) => d.getEvents(tlId), loading: () => Future.value([]), error: (_, _) => Future.value([]));
});

class TimelineScreen extends ConsumerStatefulWidget {
  final int projectId;
  const TimelineScreen({super.key, required this.projectId});

  @override
  ConsumerState<TimelineScreen> createState() => _TimelineScreenState();
}

class _TimelineScreenState extends ConsumerState<TimelineScreen> {
  int? _selectedTlId;

  @override
  Widget build(BuildContext context) {
    final timelinesAsync = ref.watch(_timelinesProvider(widget.projectId));
    ref.read(activeProjectProvider.notifier).state = widget.projectId;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Timeline'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_chart),
            tooltip: 'New Timeline',
            onPressed: () => _showTimelineDialog(),
          ),
          if (_selectedTlId != null)
            IconButton(
              icon: const Icon(Icons.add),
              tooltip: 'New Event',
              onPressed: () => _showEventDialog(),
            ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth >= 600) {
            return Row(
              children: [
                SizedBox(
                  width: 200,
                  child: _TimelineList(projectId: widget.projectId, selectedId: _selectedTlId, onSelect: (id) => setState(() => _selectedTlId = id), ref: ref),
                ),
                const VerticalDivider(width: 1),
                Expanded(
                  child: _selectedTlId != null
                      ? _EventPanel(timelineId: _selectedTlId!, ref: ref)
                      : const Center(child: Text('Select a timeline')),
                ),
              ],
            );
          }
          if (_selectedTlId == null) {
            return _TimelineList(projectId: widget.projectId, selectedId: null, onSelect: (id) => setState(() => _selectedTlId = id), ref: ref);
          }
          return Column(
            children: [
              timelinesAsync.when(
                data: (tls) {
                  final tl = tls.firstWhere((t) => t.id == _selectedTlId, orElse: () => tls.first);
                  return ListTile(
                    leading: const Icon(Icons.arrow_back),
                    title: Text(tl.name ?? 'Timeline'),
                    onTap: () => setState(() => _selectedTlId = null),
                  );
                },
                loading: () => const SizedBox(),
                error: (_, _) => const SizedBox(),
              ),
              const Divider(height: 1),
              Expanded(child: _EventPanel(timelineId: _selectedTlId!, ref: ref)),
            ],
          );
        },
      ),
    );
  }

  Future<void> _showTimelineDialog([TimelineModel? tl]) async {
    await showDialog(context: context, builder: (_) => TimelineDialog(projectId: widget.projectId, existing: tl));
    ref.invalidate(_timelinesProvider(widget.projectId));
  }

  Future<void> _showEventDialog([TimelineEventModel? ev]) async {
    if (_selectedTlId == null) return;
    await showDialog(context: context, builder: (_) => EventDialog(timelineId: _selectedTlId!, existing: ev));
    ref.invalidate(_eventsProvider(_selectedTlId!));
  }
}

class _TimelineList extends StatelessWidget {
  final int projectId;
  final int? selectedId;
  final void Function(int id) onSelect;
  final WidgetRef ref;
  const _TimelineList({required this.projectId, required this.selectedId, required this.onSelect, required this.ref});

  @override
  Widget build(BuildContext context) {
    final timelinesAsync = ref.watch(_timelinesProvider(projectId));
    return timelinesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
      data: (timelines) {
        if (timelines.isEmpty) return const Center(child: Text('No timelines yet.'));
        return ListView.builder(
          itemCount: timelines.length,
          itemBuilder: (ctx, i) {
            final tl = timelines[i];
            return ListTile(
              selected: tl.id == selectedId,
              leading: ColorDot(colorCode: tl.colorCode),
              title: Text(tl.name ?? 'Timeline ${tl.id}'),
              onTap: () => onSelect(tl.id),
              trailing: PopupMenuButton<String>(
                onSelected: (v) {
                  if (v == 'edit') {
                    showDialog(context: ctx, builder: (_) => TimelineDialog(projectId: projectId, existing: tl))
                        .then((_) => ref.invalidate(_timelinesProvider(projectId)));
                  } else if (v == 'delete') {
                    showConfirmDialog(ctx, title: 'Delete timeline?').then((ok) {
                      if (ok) {
                        ref.read(timelineDaoProvider).whenData((d) async {
                          await d.deleteTimeline(tl.id);
                          ref.invalidate(_timelinesProvider(projectId));
                        });
                      }
                    });
                  }
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'edit', child: Text('Edit')),
                  PopupMenuItem(value: 'delete', child: Text('Delete')),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _EventPanel extends StatelessWidget {
  final int timelineId;
  final WidgetRef ref;
  const _EventPanel({required this.timelineId, required this.ref});

  @override
  Widget build(BuildContext context) {
    final eventsAsync = ref.watch(_eventsProvider(timelineId));
    final theme = Theme.of(context);
    return eventsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
      data: (events) {
        if (events.isEmpty) {
          return const Center(child: Text('No events yet.'));
        }
        return Column(
          children: [
            SizedBox(
              height: 200,
              child: CustomPaint(
                painter: TimelineGraphPainter(events: events, theme: theme),
                child: Container(),
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView.builder(
                itemCount: events.length,
                itemBuilder: (ctx, i) {
                  final ev = events[i];
                  return ListTile(
                    leading: ColorDot(colorCode: ev.colorCode),
                    title: Text(ev.name ?? 'Event ${ev.id}'),
                    subtitle: ev.startDate != null ? Text(ev.startDate!.display) : null,
                    onTap: () => _showEventDetail(ctx, ref, ev),
                    trailing: PopupMenuButton<String>(
                      onSelected: (v) {
                        if (v == 'edit') {
                          showDialog(context: ctx, builder: (_) => EventDialog(timelineId: timelineId, existing: ev))
                              .then((_) => ref.invalidate(_eventsProvider(timelineId)));
                        } else if (v == 'delete') {
                          showConfirmDialog(ctx, title: 'Delete event?').then((ok) {
                            if (ok) {
                              ref.read(timelineDaoProvider).whenData((d) async {
                                await d.deleteEvent(ev.id);
                                ref.invalidate(_eventsProvider(timelineId));
                              });
                            }
                          });
                        }
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'edit', child: Text('Edit')),
                        PopupMenuItem(value: 'delete', child: Text('Delete')),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }

  void _showEventDetail(BuildContext context, WidgetRef ref, TimelineEventModel ev) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => _EventDetailSheet(event: ev, ref: ref, timelineId: timelineId),
    );
  }
}

class _EventDetailSheet extends ConsumerStatefulWidget {
  final TimelineEventModel event;
  final WidgetRef ref;
  final int timelineId;
  const _EventDetailSheet({required this.event, required this.ref, required this.timelineId});

  @override
  ConsumerState<_EventDetailSheet> createState() => _EventDetailSheetState();
}

class _EventDetailSheetState extends ConsumerState<_EventDetailSheet> {
  late final TextEditingController _storyCtrl;
  bool _dirty = false;

  @override
  void initState() {
    super.initState();
    _storyCtrl = TextEditingController(text: widget.event.story ?? '');
    _storyCtrl.addListener(() => setState(() => _dirty = true));
  }

  @override
  void dispose() {
    _storyCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      builder: (ctx, scroll) => Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          children: [
            Container(width: 40, height: 4, margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(color: theme.colorScheme.outline, borderRadius: BorderRadius.circular(2))),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.event.name ?? 'Event', style: theme.textTheme.titleMedium),
                      if (widget.event.startDate != null) Text(widget.event.startDate!.display, style: theme.textTheme.bodySmall),
                    ],
                  )),
                  if (_dirty) FilledButton(
                    onPressed: _save,
                    child: const Text('Save'),
                  ),
                ],
              ),
            ),
            const Divider(),
            Expanded(child: Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _storyCtrl,
                maxLines: null,
                expands: true,
                textAlignVertical: TextAlignVertical.top,
                decoration: const InputDecoration(hintText: 'Write story...', border: InputBorder.none),
              ),
            )),
          ],
        ),
      ),
    );
  }

  Future<void> _save() async {
    await widget.ref.read(timelineDaoProvider).when(
      data: (d) => d.updateEventStory(widget.event.id, _storyCtrl.text.isEmpty ? null : _storyCtrl.text),
      loading: () async {},
      error: (_, _) async {},
    );
    widget.ref.invalidate(_eventsProvider(widget.timelineId));
    setState(() => _dirty = false);
  }
}
