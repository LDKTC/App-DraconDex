// Models for the Navigator module (v2.5.2 "World") — the cross-novel
// world-building layer. These mirror the Director models in shape/conventions.

class WorldModel {
  final int id;
  final String? codename;
  final String name;
  final String? memo;
  final int? colorId;
  final String? colorCode;
  final String updatedAt;

  const WorldModel({
    required this.id,
    this.codename,
    required this.name,
    this.memo,
    this.colorId,
    this.colorCode,
    required this.updatedAt,
  });

  factory WorldModel.fromMap(Map<String, dynamic> m) => WorldModel(
        id: m['id'] as int,
        codename: m['codename'] as String?,
        name: m['name'] as String,
        memo: m['memo'] as String?,
        colorId: m['color'] as int?,
        colorCode: m['color_code'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}

/// A novel (project) linked into a world. `id` is the world_novel link id.
class WorldNovelModel {
  final int id;
  final int worldId;
  final int projectId;
  final String? codename;
  final String projectName;
  final String? colorCode;

  const WorldNovelModel({
    required this.id,
    required this.worldId,
    required this.projectId,
    this.codename,
    required this.projectName,
    this.colorCode,
  });

  factory WorldNovelModel.fromMap(Map<String, dynamic> m) => WorldNovelModel(
        id: m['id'] as int,
        worldId: m['world_ref'] as int,
        projectId: m['project_ref'] as int,
        codename: m['codename'] as String?,
        projectName: m['name'] as String? ?? '',
        colorCode: m['color_code'] as String?,
      );
}

/// A project available to link into a world (not yet linked).
class LinkableProjectModel {
  final int id;
  final String? codename;
  final String name;
  final String? colorCode;

  const LinkableProjectModel({
    required this.id,
    this.codename,
    required this.name,
    this.colorCode,
  });

  factory LinkableProjectModel.fromMap(Map<String, dynamic> m) => LinkableProjectModel(
        id: m['id'] as int,
        codename: m['codename'] as String?,
        name: m['name'] as String,
        colorCode: m['color_code'] as String?,
      );
}

class WorldCharacterModel {
  final int id;
  final int worldId;
  final String name;
  final String? symbol;
  final int? colorId;
  final String? colorCode;
  final String updatedAt;

  const WorldCharacterModel({
    required this.id,
    required this.worldId,
    required this.name,
    this.symbol,
    this.colorId,
    this.colorCode,
    required this.updatedAt,
  });

  factory WorldCharacterModel.fromMap(Map<String, dynamic> m) => WorldCharacterModel(
        id: m['id'] as int,
        worldId: m['world_ref'] as int,
        name: m['name'] as String,
        symbol: m['symbol'] as String?,
        colorId: m['color'] as int?,
        colorCode: m['color_code'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}

/// A world category — an object_category brought into the world.
/// `id` is the world_category link id; `categoryRef` the source object_category.
class WorldCategoryModel {
  final int id;
  final int worldId;
  final int categoryRef;
  final String categoryName;
  final String? projectName;
  final String? colorCode;

  const WorldCategoryModel({
    required this.id,
    required this.worldId,
    required this.categoryRef,
    required this.categoryName,
    this.projectName,
    this.colorCode,
  });

  factory WorldCategoryModel.fromMap(Map<String, dynamic> m) => WorldCategoryModel(
        id: m['id'] as int,
        worldId: m['world_ref'] as int,
        categoryRef: m['category_ref'] as int,
        categoryName: m['category_name'] as String? ?? '',
        projectName: m['project_name'] as String?,
        colorCode: m['color_code'] as String?,
      );
}

/// A world object — an object brought into a world category.
/// `id` is the world_object link id; `objectRef` the source object.
class WorldObjectModel {
  final int id;
  final int categoryRef;
  final int objectRef;
  final String objectName;
  final String? symbol;
  final String? colorCode;

  const WorldObjectModel({
    required this.id,
    required this.categoryRef,
    required this.objectRef,
    required this.objectName,
    this.symbol,
    this.colorCode,
  });

  factory WorldObjectModel.fromMap(Map<String, dynamic> m) => WorldObjectModel(
        id: m['id'] as int,
        categoryRef: m['category_ref'] as int,
        objectRef: m['object_ref'] as int,
        objectName: m['name'] as String? ?? '',
        symbol: m['symbol'] as String?,
        colorCode: m['color_code'] as String?,
      );
}

/// An object_category available to link into a world (from a linked novel).
class LinkableCategoryModel {
  final int id;
  final String categoryName;
  final String projectName;
  final String? colorCode;

  const LinkableCategoryModel({
    required this.id,
    required this.categoryName,
    required this.projectName,
    this.colorCode,
  });

  factory LinkableCategoryModel.fromMap(Map<String, dynamic> m) => LinkableCategoryModel(
        id: m['id'] as int,
        categoryName: m['category_name'] as String,
        projectName: m['name'] as String? ?? '',
        colorCode: m['color_code'] as String?,
      );
}

/// An object available to link (from a linked novel / category).
class LinkableObjectModel {
  final int id;
  final String name;
  final String? categoryName;
  final String? colorCode;

  const LinkableObjectModel({
    required this.id,
    required this.name,
    this.categoryName,
    this.colorCode,
  });

  factory LinkableObjectModel.fromMap(Map<String, dynamic> m) => LinkableObjectModel(
        id: m['id'] as int,
        name: m['name'] as String,
        categoryName: m['category_name'] as String?,
        colorCode: m['color_code'] as String?,
      );
}

class WorldMapModel {
  final int id;
  final int worldId;
  final int mapRef;
  final String mapName;
  final String? projectName;
  final String? colorCode;

  const WorldMapModel({
    required this.id,
    required this.worldId,
    required this.mapRef,
    required this.mapName,
    this.projectName,
    this.colorCode,
  });

  factory WorldMapModel.fromMap(Map<String, dynamic> m) => WorldMapModel(
        id: m['id'] as int,
        worldId: m['world_ref'] as int,
        mapRef: m['map_ref'] as int,
        mapName: m['map_name'] as String? ?? '',
        projectName: m['project_name'] as String?,
        colorCode: m['color_code'] as String?,
      );
}

/// A map available to link into a world (from a linked novel).
class LinkableMapModel {
  final int id;
  final String mapName;
  final String projectName;
  final String? colorCode;

  const LinkableMapModel({
    required this.id,
    required this.mapName,
    required this.projectName,
    this.colorCode,
  });

  factory LinkableMapModel.fromMap(Map<String, dynamic> m) => LinkableMapModel(
        id: m['id'] as int,
        mapName: m['map_name'] as String? ?? '',
        projectName: m['name'] as String? ?? '',
        colorCode: m['color_code'] as String?,
      );
}

class WorldTimelineModel {
  final int id;
  final int worldId;
  final String name;
  final int? worldMapRef;
  final String updatedAt;

  const WorldTimelineModel({
    required this.id,
    required this.worldId,
    required this.name,
    this.worldMapRef,
    required this.updatedAt,
  });

  factory WorldTimelineModel.fromMap(Map<String, dynamic> m) => WorldTimelineModel(
        id: m['id'] as int,
        worldId: m['world_ref'] as int,
        name: m['name'] as String,
        worldMapRef: m['world_map_ref'] as int?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}

/// A timeline event joined with its date fields.
class WorldTimelineEventModel {
  final int id;
  final int timelineRef;
  final int dateRef;
  final int day;
  final int month;
  final int years;
  final int hour;
  final int minute;

  const WorldTimelineEventModel({
    required this.id,
    required this.timelineRef,
    required this.dateRef,
    required this.day,
    required this.month,
    required this.years,
    required this.hour,
    required this.minute,
  });

  factory WorldTimelineEventModel.fromMap(Map<String, dynamic> m) => WorldTimelineEventModel(
        id: m['id'] as int,
        timelineRef: m['timeline_ref'] as int,
        dateRef: m['date_ref'] as int,
        day: m['day'] as int,
        month: m['month'] as int,
        years: m['years'] as int,
        hour: m['hour'] as int? ?? 0,
        minute: m['minute'] as int? ?? 0,
      );

  String get label {
    final mm = month.toString().padLeft(2, '0');
    final dd = day.toString().padLeft(2, '0');
    final hh = hour.toString().padLeft(2, '0');
    final mn = minute.toString().padLeft(2, '0');
    return '$years-$mm-$dd $hh:$mn';
  }
}

/// An object/character placed on a point within a timeline event.
class WorldTimelineObjectModel {
  final int id;
  final int eventRef;
  final int? worldObjectRef;
  final int? worldCharacterRef;
  final int? pointRef;
  final double? x;
  final double? y;
  final String label;
  final String? symbol;
  final String? colorCode;

  const WorldTimelineObjectModel({
    required this.id,
    required this.eventRef,
    this.worldObjectRef,
    this.worldCharacterRef,
    this.pointRef,
    this.x,
    this.y,
    required this.label,
    this.symbol,
    this.colorCode,
  });

  bool get isCharacter => worldCharacterRef != null;

  factory WorldTimelineObjectModel.fromMap(Map<String, dynamic> m) => WorldTimelineObjectModel(
        id: m['id'] as int,
        eventRef: m['event_ref'] as int,
        worldObjectRef: m['world_object_ref'] as int?,
        worldCharacterRef: m['world_character_ref'] as int?,
        pointRef: m['point_ref'] as int?,
        x: (m['x'] as num?)?.toDouble(),
        y: (m['y'] as num?)?.toDouble(),
        label: m['label'] as String? ?? '',
        symbol: m['symbol'] as String?,
        colorCode: m['color_code'] as String?,
      );
}
