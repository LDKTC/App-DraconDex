import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/dao/world_dao.dart';
import '../../../data/models/world_model.dart';
import '../../../providers/world_provider.dart';
import '../../../providers/db_providers.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';
import 'dialogs/timeline_dialog.dart';
import 'dialogs/event_dialog.dart';
import 'dialogs/place_object_dialog.dart';

/// World timelines: dated events, each holding objects/characters positioned at
/// (x,y) points — optionally over an anchored world map.
class WorldTimelineScreen extends ConsumerWidget {
  final int worldId;
  const WorldTimelineScreen({super.key, required this.worldId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final timelinesAsync = ref.watch(worldTimelinesProvider(worldId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('World Timeline'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'New Timeline',
            onPressed: () => _editTimeline(context, ref, null),
          ),
        ],
      ),
      body: timelinesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
        data: (timelines) {
          if (timelines.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.timeline, size: 64, color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
                  const SizedBox(height: 16),
                  Text('No timelines yet. Tap + to create one.', style: theme.textTheme.bodyMedium),
                ],
              ),
            );
          }
          return ListView(
            children: timelines.map((t) => _TimelineTile(worldId: worldId, timeline: t)).toList(),
          );
        },
      ),
    );
  }

  Future<void> _editTimeline(BuildContext context, WidgetRef ref, WorldTimelineModel? existing) async {
    await showDialog(context: context, builder: (_) => TimelineDialog(worldId: worldId, existing: existing));
    ref.invalidate(worldTimelinesProvider(worldId));
  }
}

class _TimelineTile extends ConsumerStatefulWidget {
  final int worldId;
  final WorldTimelineModel timeline;
  const _TimelineTile({required this.worldId, required this.timeline});

  @override
  ConsumerState<_TimelineTile> createState() => _TimelineTileState();
}

class _TimelineTileState extends ConsumerState<_TimelineTile> {
  bool _expanded = false;
  List<WorldTimelineEventModel>? _events;

  WorldDao? get _dao => ref.read(worldDaoProvider).value;

  Future<void> _reload() async {
    final events = await _dao?.getTimelineEvents(widget.timeline.id);
    if (mounted) setState(() => _events = events);
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.timeline;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListTile(
          leading: Icon(_expanded ? Icons.expand_less : Icons.expand_more),
          title: Text(t.name, style: const TextStyle(fontWeight: FontWeight.bold)),
          onTap: () {
            setState(() => _expanded = !_expanded);
            if (_expanded && _events == null) _reload();
          },
          trailing: PopupMenuButton<String>(
            onSelected: (v) async {
              if (v == 'event') {
                await _addEvent();
              } else if (v == 'edit') {
                await showDialog(context: context, builder: (_) => TimelineDialog(worldId: widget.worldId, existing: t));
                ref.invalidate(worldTimelinesProvider(widget.worldId));
              } else if (v == 'delete') {
                final ok = await showConfirmDialog(context, title: 'Delete "${t.name}"?');
                if (!ok) return;
                await _dao?.deleteWorldTimeline(t.id);
                ref.invalidate(worldTimelinesProvider(widget.worldId));
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'event', child: Text('Add event')),
              PopupMenuItem(value: 'edit', child: Text('Edit')),
              PopupMenuItem(value: 'delete', child: Text('Delete')),
            ],
          ),
        ),
        if (_expanded)
          ...(_events ?? []).map((e) => Padding(
                padding: const EdgeInsets.only(left: 24),
                child: ListTile(
                  dense: true,
                  leading: const Icon(Icons.event, size: 20),
                  title: Text(e.label),
                  onTap: () => _manageEventObjects(e),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline, size: 20),
                    onPressed: () async {
                      await _dao?.deleteTimelineEvent(e.id);
                      _reload();
                    },
                  ),
                ),
              )),
        if (_expanded && (_events?.isEmpty ?? false))
          const Padding(
            padding: EdgeInsets.only(left: 32, bottom: 8),
            child: Text('No events — use the menu to add.'),
          ),
      ],
    );
  }

  Future<void> _addEvent() async {
    final created = await showDialog<bool>(
      context: context,
      builder: (_) => EventDialog(timelineId: widget.timeline.id),
    );
    if (created == true) {
      if (!_expanded) setState(() => _expanded = true);
      _reload();
    }
  }

  Future<void> _manageEventObjects(WorldTimelineEventModel event) async {
    final dao = _dao;
    if (dao == null) return;
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _EventObjectsSheet(worldId: widget.worldId, event: event, dao: dao),
    );
  }
}

/// Lists objects/characters placed within an event and allows adding/removing.
class _EventObjectsSheet extends StatefulWidget {
  final int worldId;
  final WorldTimelineEventModel event;
  final WorldDao dao;
  const _EventObjectsSheet({required this.worldId, required this.event, required this.dao});

  @override
  State<_EventObjectsSheet> createState() => _EventObjectsSheetState();
}

class _EventObjectsSheetState extends State<_EventObjectsSheet> {
  List<WorldTimelineObjectModel> _placed = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final placed = await widget.dao.getEventObjects(widget.event.id);
    if (mounted) {
      setState(() {
        _placed = placed;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      builder: (ctx, scroll) => _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              controller: scroll,
              padding: const EdgeInsets.all(16),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text('Event · ${widget.event.label}',
                          style: Theme.of(context).textTheme.titleMedium),
                    ),
                    IconButton(
                      icon: const Icon(Icons.add_location_alt),
                      tooltip: 'Place object',
                      onPressed: _place,
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (_placed.isEmpty) const Padding(padding: EdgeInsets.all(8), child: Text('Nothing placed yet.')),
                ..._placed.map((p) => ListTile(
                      dense: true,
                      leading: ColorDot(colorCode: p.colorCode),
                      title: Text(p.label),
                      subtitle: Text(
                        '${p.isCharacter ? 'Character' : 'Object'}'
                        '${p.x != null ? '  ·  (${p.x!.toStringAsFixed(1)}, ${p.y!.toStringAsFixed(1)})' : ''}',
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.remove_circle_outline),
                        onPressed: () async {
                          await widget.dao.removeEventObject(p.id);
                          _load();
                        },
                      ),
                    )),
              ],
            ),
    );
  }

  Future<void> _place() async {
    final placed = await showDialog<bool>(
      context: context,
      builder: (_) => PlaceObjectDialog(worldId: widget.worldId, eventId: widget.event.id, dao: widget.dao),
    );
    if (placed == true) _load();
  }
}
