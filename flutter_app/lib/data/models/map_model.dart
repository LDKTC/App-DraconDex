class MapModel {
  final int id;
  final String? name;
  final int projectId;
  final int? colorId;
  final String? colorCode;
  final String updatedAt;

  const MapModel({
    required this.id,
    this.name,
    required this.projectId,
    this.colorId,
    this.colorCode,
    required this.updatedAt,
  });

  factory MapModel.fromMap(Map<String, dynamic> m) => MapModel(
        id: m['id'] as int,
        name: m['map_name'] as String?,
        projectId: m['project_id'] as int,
        colorId: m['color'] as int?,
        colorCode: m['color_code'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}

class MapAreaModel {
  final int id;
  final int mapId;
  final String? name;
  final int? colorId;
  final String? colorCode;
  final String updatedAt;

  const MapAreaModel({
    required this.id,
    required this.mapId,
    this.name,
    this.colorId,
    this.colorCode,
    required this.updatedAt,
  });

  factory MapAreaModel.fromMap(Map<String, dynamic> m) => MapAreaModel(
        id: m['id'] as int,
        mapId: m['map_id'] as int,
        name: m['area_name'] as String?,
        colorId: m['color'] as int?,
        colorCode: m['color_code'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}

class MapPointModel {
  final int id;
  final int areaId;
  final int pointOrder;
  final double x;
  final double y;

  const MapPointModel({
    required this.id,
    required this.areaId,
    required this.pointOrder,
    required this.x,
    required this.y,
  });

  factory MapPointModel.fromMap(Map<String, dynamic> m) => MapPointModel(
        id: m['id'] as int,
        areaId: m['area_id'] as int,
        pointOrder: m['point_order'] as int? ?? 0,
        x: (m['x'] as num).toDouble(),
        y: (m['y'] as num).toDouble(),
      );
}
