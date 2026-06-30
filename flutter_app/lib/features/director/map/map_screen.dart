import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/map_model.dart';
import '../../../providers/db_providers.dart';
import '../../../providers/project_provider.dart';
import '../../../widgets/color_dot.dart';
import '../../../widgets/confirm_dialog.dart';
import 'dialogs/map_dialog.dart';
import 'dialogs/map_area_dialog.dart';
import 'map_canvas_painter.dart';

final _mapsProvider = FutureProvider.family<List<MapModel>, int>((ref, pid) async {
  return ref.watch(mapDaoProvider).when(
        data: (d) => d.getMaps(pid),
        loading: () => Future.value([]),
        error: (_, _) => Future.value([]),
      );
});

final _areasProvider = FutureProvider.family<List<MapAreaModel>, int>((ref, mapId) async {
  return ref.watch(mapDaoProvider).when(
        data: (d) => d.getMapAreas(mapId),
        loading: () => Future.value([]),
        error: (_, _) => Future.value([]),
      );
});

final _pointsProvider = FutureProvider.family<List<MapPointModel>, int>((ref, areaId) async {
  return ref.watch(mapDaoProvider).when(
        data: (d) => d.getMapAreaPoints(areaId),
        loading: () => Future.value([]),
        error: (_, _) => Future.value([]),
      );
});

class MapScreen extends ConsumerStatefulWidget {
  final int projectId;
  const MapScreen({super.key, required this.projectId});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  int? _selectedMapId;
  int? _selectedAreaId;
  final List<MapPointModel> _pendingPoints = [];
  bool _drawMode = false;

  @override
  Widget build(BuildContext context) {
    ref.read(activeProjectProvider.notifier).state = widget.projectId;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Map'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_location_alt),
            tooltip: 'New Map',
            onPressed: () => showDialog(
              context: context,
              builder: (_) => MapDialog(projectId: widget.projectId),
            ).then((_) => ref.invalidate(_mapsProvider(widget.projectId))),
          ),
          if (_selectedMapId != null) ...[
            IconButton(
              icon: const Icon(Icons.layers),
              tooltip: 'New Area',
              onPressed: () => showDialog(
                context: context,
                builder: (_) => MapAreaDialog(mapId: _selectedMapId!),
              ).then((_) => ref.invalidate(_areasProvider(_selectedMapId!))),
            ),
            IconButton(
              icon: Icon(_drawMode ? Icons.done : Icons.edit),
              tooltip: _drawMode ? 'Stop Drawing' : 'Draw Points',
              onPressed: () => setState(() {
                if (_drawMode && _selectedAreaId != null && _pendingPoints.isNotEmpty) {
                  _savePoints();
                }
                _drawMode = !_drawMode;
                _pendingPoints.clear();
              }),
            ),
          ],
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth >= 600) {
            return Row(
              children: [
                SizedBox(width: 220, child: _MapSidebar(projectId: widget.projectId, selectedMapId: _selectedMapId, onSelectMap: _selectMap)),
                const VerticalDivider(width: 1),
                Expanded(child: _buildCanvas(context)),
              ],
            );
          }
          if (_selectedMapId == null) {
            return _MapSidebar(projectId: widget.projectId, selectedMapId: null, onSelectMap: _selectMap);
          }
          return _buildCanvas(context);
        },
      ),
    );
  }

  void _selectMap(int id) {
    setState(() {
      _selectedMapId = id;
      _selectedAreaId = null;
      _pendingPoints.clear();
      _drawMode = false;
    });
  }

  Widget _buildCanvas(BuildContext context) {
    if (_selectedMapId == null) return const Center(child: Text('Select a map'));
    final areasAsync = ref.watch(_areasProvider(_selectedMapId!));
    return areasAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('$e')),
      data: (areas) => Column(
        children: [
          Expanded(child: _MapCanvas(
            areas: areas,
            selectedAreaId: _selectedAreaId,
            drawMode: _drawMode,
            pendingPoints: _pendingPoints,
            onTap: _handleTap,
          )),
          _AreaPanel(
            mapId: _selectedMapId!,
            areas: areas,
            selectedId: _selectedAreaId,
            onSelect: (id) => setState(() { _selectedAreaId = id; _pendingPoints.clear(); }),
            onChanged: () => ref.invalidate(_areasProvider(_selectedMapId!)),
          ),
        ],
      ),
    );
  }

  void _handleTap(Offset localPos) {
    if (!_drawMode || _selectedAreaId == null) return;
    setState(() {
      _pendingPoints.add(MapPointModel(
        id: 0,
        areaId: _selectedAreaId!,
        pointOrder: _pendingPoints.length,
        x: localPos.dx,
        y: localPos.dy,
      ));
    });
  }

  Future<void> _savePoints() async {
    if (_selectedAreaId == null || _pendingPoints.isEmpty) return;
    await ref.read(mapDaoProvider).when(
      data: (d) => d.setMapAreaPoints(_selectedAreaId!, _pendingPoints),
      loading: () async {},
      error: (_, _) async {},
    );
    ref.invalidate(_pointsProvider(_selectedAreaId!));
  }
}

class _MapCanvas extends ConsumerWidget {
  final List<MapAreaModel> areas;
  final int? selectedAreaId;
  final bool drawMode;
  final List<MapPointModel> pendingPoints;
  final void Function(Offset) onTap;

  const _MapCanvas({
    required this.areas,
    required this.selectedAreaId,
    required this.drawMode,
    required this.pendingPoints,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    return InteractiveViewer(
      child: GestureDetector(
        onTapDown: drawMode ? (d) => onTap(d.localPosition) : null,
        child: _AreaPainterWidget(areas: areas, selectedAreaId: selectedAreaId, pendingPoints: pendingPoints, theme: theme),
      ),
    );
  }
}

class _AreaPainterWidget extends ConsumerWidget {
  final List<MapAreaModel> areas;
  final int? selectedAreaId;
  final List<MapPointModel> pendingPoints;
  final ThemeData theme;

  const _AreaPainterWidget({required this.areas, required this.selectedAreaId, required this.pendingPoints, required this.theme});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final Map<int, List<MapPointModel>> allPoints = {};
    for (final area in areas) {
      final pointsAsync = ref.watch(_pointsProvider(area.id));
      allPoints[area.id] = pointsAsync.valueOrNull ?? [];
    }
    if (selectedAreaId != null && pendingPoints.isNotEmpty) {
      allPoints[selectedAreaId!] = pendingPoints;
    }

    return CustomPaint(
      painter: MapCanvasPainter(areas: areas, pointsByArea: allPoints, selectedAreaId: selectedAreaId, theme: theme),
      child: ConstrainedBox(constraints: const BoxConstraints(minWidth: 600, minHeight: 400)),
    );
  }
}

class _MapSidebar extends ConsumerWidget {
  final int projectId;
  final int? selectedMapId;
  final void Function(int) onSelectMap;
  const _MapSidebar({required this.projectId, required this.selectedMapId, required this.onSelectMap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mapsAsync = ref.watch(_mapsProvider(projectId));
    return mapsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('$e')),
      data: (maps) {
        if (maps.isEmpty) return const Center(child: Text('No maps yet.'));
        return ListView.builder(
          itemCount: maps.length,
          itemBuilder: (ctx, i) {
            final m = maps[i];
            return ListTile(
              selected: m.id == selectedMapId,
              leading: ColorDot(colorCode: m.colorCode),
              title: Text(m.name ?? 'Map ${m.id}'),
              onTap: () => onSelectMap(m.id),
              trailing: PopupMenuButton<String>(
                onSelected: (v) {
                  if (v == 'edit') {
                    showDialog(context: ctx, builder: (_) => MapDialog(projectId: projectId, existing: m))
                        .then((_) => ref.invalidate(_mapsProvider(projectId)));
                  } else if (v == 'delete') {
                    showConfirmDialog(ctx, title: 'Delete map?').then((ok) {
                      if (ok) {
                        ref.read(mapDaoProvider).whenData((d) async {
                          await d.deleteMap(m.id);
                          ref.invalidate(_mapsProvider(projectId));
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

class _AreaPanel extends ConsumerWidget {
  final int mapId;
  final List<MapAreaModel> areas;
  final int? selectedId;
  final void Function(int) onSelect;
  final VoidCallback onChanged;
  const _AreaPanel({required this.mapId, required this.areas, required this.selectedId, required this.onSelect, required this.onChanged});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      height: 120,
      decoration: BoxDecoration(border: Border(top: BorderSide(color: Theme.of(context).dividerColor))),
      child: areas.isEmpty
          ? const Center(child: Text('No areas. Add one with the layers button.'))
          : ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: areas.length,
              itemBuilder: (ctx, i) {
                final a = areas[i];
                return Padding(
                  padding: const EdgeInsets.all(8),
                  child: GestureDetector(
                    onTap: () => onSelect(a.id),
                    child: Container(
                      width: 100,
                      decoration: BoxDecoration(
                        border: Border.all(color: a.id == selectedId ? Theme.of(context).colorScheme.primary : Theme.of(context).dividerColor, width: a.id == selectedId ? 2 : 1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          ColorDot(colorCode: a.colorCode),
                          const SizedBox(height: 4),
                          Text(a.name ?? 'Area ${a.id}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 12)),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit, size: 16),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                onPressed: () => showDialog(context: ctx, builder: (_) => MapAreaDialog(mapId: mapId, existing: a)).then((_) => onChanged()),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, size: 16),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                onPressed: () => showConfirmDialog(ctx, title: 'Delete area?').then((ok) {
                                  if (ok) {
                                    ref.read(mapDaoProvider).whenData((d) async {
                                      await d.deleteMapArea(a.id);
                                      onChanged();
                                    });
                                  }
                                }),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
