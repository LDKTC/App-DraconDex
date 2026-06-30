import 'package:sqflite/sqflite.dart';
import '../models/world_model.dart';

/// Data access for the Navigator module (v2.5.2 "World").
/// Worlds aggregate data from linked novels (`project` rows): characters,
/// categories/objects, maps and a dated timeline.
class WorldDao {
  final Database db;
  WorldDao(this.db);

  // ---- World CRUD --------------------------------------------------------

  Future<List<WorldModel>> getWorlds() async {
    final rows = await db.rawQuery('''
      SELECT w.*, uc.color_code FROM world_project w
      LEFT JOIN use_color uc ON w.color=uc.id
      ORDER BY w.name
    ''');
    return rows.map(WorldModel.fromMap).toList();
  }

  Future<WorldModel?> getWorld(int id) async {
    final rows = await db.rawQuery('''
      SELECT w.*, uc.color_code FROM world_project w
      LEFT JOIN use_color uc ON w.color=uc.id WHERE w.id=?
    ''', [id]);
    if (rows.isEmpty) return null;
    return WorldModel.fromMap(rows.first);
  }

  Future<int> createWorld({String? codename, required String name, String? memo, int? colorId}) async {
    return db.insert('world_project', {
      'codename': codename,
      'name': name,
      'memo': memo,
      'color': colorId,
    });
  }

  Future<void> updateWorld(int id, {String? codename, required String name, String? memo, int? colorId}) async {
    await db.rawUpdate(
      "UPDATE world_project SET codename=?,name=?,memo=?,color=?,update_at=datetime('now') WHERE id=?",
      [codename, name, memo, colorId, id],
    );
  }

  Future<void> deleteWorld(int id) async {
    await db.delete('world_project', where: 'id=?', whereArgs: [id]);
  }

  // ---- Novels ------------------------------------------------------------

  Future<List<WorldNovelModel>> getWorldNovels(int worldId) async {
    final rows = await db.rawQuery('''
      SELECT wn.id, wn.world_ref, wn.project_ref, p.codename, p.name, uc.color_code
      FROM world_novel wn JOIN project p ON wn.project_ref=p.id
      LEFT JOIN use_color uc ON p.project_color=uc.id
      WHERE wn.world_ref=? ORDER BY p.name
    ''', [worldId]);
    return rows.map(WorldNovelModel.fromMap).toList();
  }

  Future<List<LinkableProjectModel>> getLinkableProjects(int worldId) async {
    final rows = await db.rawQuery('''
      SELECT p.id, p.codename, p.name, uc.color_code FROM project p
      LEFT JOIN use_color uc ON p.project_color=uc.id
      WHERE p.id NOT IN (SELECT project_ref FROM world_novel WHERE world_ref=?)
      ORDER BY p.name
    ''', [worldId]);
    return rows.map(LinkableProjectModel.fromMap).toList();
  }

  Future<void> addWorldNovel(int worldId, int projectId) async {
    await db.rawInsert(
      'INSERT OR IGNORE INTO world_novel (world_ref, project_ref) VALUES (?,?)',
      [worldId, projectId],
    );
  }

  Future<void> removeWorldNovel(int linkId) async {
    await db.delete('world_novel', where: 'id=?', whereArgs: [linkId]);
  }

  // ---- Characters --------------------------------------------------------

  Future<List<WorldCharacterModel>> getWorldCharacters(int worldId) async {
    final rows = await db.rawQuery('''
      SELECT c.*, uc.color_code FROM world_character c
      LEFT JOIN use_color uc ON c.color=uc.id
      WHERE c.world_ref=? ORDER BY c.name
    ''', [worldId]);
    return rows.map(WorldCharacterModel.fromMap).toList();
  }

  Future<int> createWorldCharacter(int worldId, String name, String? symbol, int? colorId) async {
    return db.insert('world_character', {
      'world_ref': worldId,
      'name': name,
      'symbol': symbol,
      'color': colorId,
    });
  }

  Future<void> updateWorldCharacter(int id, String name, String? symbol, int? colorId) async {
    await db.rawUpdate(
      "UPDATE world_character SET name=?,symbol=?,color=?,update_at=datetime('now') WHERE id=?",
      [name, symbol, colorId, id],
    );
  }

  Future<void> deleteWorldCharacter(int id) async {
    await db.delete('world_character', where: 'id=?', whereArgs: [id]);
  }

  /// object_category rows enabled as character categories for this world.
  Future<List<WorldCategoryModel>> getCharacterCategories(int worldId) async {
    final rows = await db.rawQuery('''
      SELECT wcc.id, wcc.world_ref, wcc.category_ref, oc.category_name, p.name AS project_name, uc.color_code
      FROM world_character_category wcc
      JOIN object_category oc ON wcc.category_ref=oc.id
      JOIN project p ON oc.project_id=p.id
      LEFT JOIN use_color uc ON oc.color=uc.id
      WHERE wcc.world_ref=? ORDER BY p.name, oc.category_name
    ''', [worldId]);
    return rows.map(WorldCategoryModel.fromMap).toList();
  }

  Future<void> addCharacterCategory(int worldId, int categoryRef) async {
    await db.rawInsert(
      'INSERT OR IGNORE INTO world_character_category (world_ref, category_ref) VALUES (?,?)',
      [worldId, categoryRef],
    );
  }

  Future<void> removeCharacterCategory(int id) async {
    await db.delete('world_character_category', where: 'id=?', whereArgs: [id]);
  }

  /// Concrete objects linked to a character (from enabled character categories).
  Future<List<LinkableObjectModel>> getCharacterLinks(int characterId) async {
    final rows = await db.rawQuery('''
      SELECT wcl.id, o.name, oc.category_name, uc.color_code, wcl.object_ref
      FROM world_character_link wcl
      JOIN object o ON wcl.object_ref=o.id
      JOIN object_category oc ON o.category_id=oc.id
      LEFT JOIN use_color uc ON o.color=uc.id
      WHERE wcl.character_ref=? ORDER BY oc.category_name, o.name
    ''', [characterId]);
    // `id` here is the link id (for removal); keep object_ref accessible too.
    return rows.map(LinkableObjectModel.fromMap).toList();
  }

  /// Objects available to link to a character: objects in the world's enabled
  /// character categories, not yet linked to this character.
  Future<List<LinkableObjectModel>> getLinkableCharacterObjects(int worldId, int characterId) async {
    final rows = await db.rawQuery('''
      SELECT o.id, o.name, oc.category_name, uc.color_code
      FROM object o
      JOIN object_category oc ON o.category_id=oc.id
      LEFT JOIN use_color uc ON o.color=uc.id
      WHERE oc.id IN (SELECT category_ref FROM world_character_category WHERE world_ref=?)
        AND o.id NOT IN (SELECT object_ref FROM world_character_link WHERE character_ref=?)
      ORDER BY oc.category_name, o.name
    ''', [worldId, characterId]);
    return rows.map(LinkableObjectModel.fromMap).toList();
  }

  Future<void> addCharacterLink(int characterId, int objectRef) async {
    await db.rawInsert(
      'INSERT OR IGNORE INTO world_character_link (character_ref, object_ref) VALUES (?,?)',
      [characterId, objectRef],
    );
  }

  Future<void> removeCharacterLink(int linkId) async {
    await db.delete('world_character_link', where: 'id=?', whereArgs: [linkId]);
  }

  // ---- Categories / Objects ---------------------------------------------

  Future<List<WorldCategoryModel>> getWorldCategories(int worldId) async {
    final rows = await db.rawQuery('''
      SELECT wc.id, wc.world_ref, wc.category_ref, oc.category_name, p.name AS project_name, uc.color_code
      FROM world_category wc
      JOIN object_category oc ON wc.category_ref=oc.id
      JOIN project p ON oc.project_id=p.id
      LEFT JOIN use_color uc ON oc.color=uc.id
      WHERE wc.world_ref=? ORDER BY p.name, oc.category_name
    ''', [worldId]);
    return rows.map(WorldCategoryModel.fromMap).toList();
  }

  /// object_category rows from the world's linked novels, not yet added.
  /// Used both for world categories and (with the same source) character categories.
  Future<List<LinkableCategoryModel>> getLinkableCategories(int worldId, {bool forCharacters = false}) async {
    final targetTable = forCharacters ? 'world_character_category' : 'world_category';
    final rows = await db.rawQuery('''
      SELECT oc.id, oc.category_name, p.name, uc.color_code
      FROM object_category oc
      JOIN project p ON oc.project_id=p.id
      LEFT JOIN use_color uc ON oc.color=uc.id
      WHERE oc.project_id IN (SELECT project_ref FROM world_novel WHERE world_ref=?)
        AND oc.id NOT IN (SELECT category_ref FROM $targetTable WHERE world_ref=?)
      ORDER BY p.name, oc.category_name
    ''', [worldId, worldId]);
    return rows.map(LinkableCategoryModel.fromMap).toList();
  }

  Future<void> addWorldCategory(int worldId, int categoryRef) async {
    await db.rawInsert(
      'INSERT OR IGNORE INTO world_category (world_ref, category_ref) VALUES (?,?)',
      [worldId, categoryRef],
    );
  }

  Future<void> removeWorldCategory(int id) async {
    await db.delete('world_category', where: 'id=?', whereArgs: [id]);
  }

  Future<List<WorldObjectModel>> getWorldObjects(int worldCategoryId) async {
    final rows = await db.rawQuery('''
      SELECT wo.id, wo.category_ref, wo.object_ref, wo.symbol, o.name, uc.color_code
      FROM world_object wo
      JOIN object o ON wo.object_ref=o.id
      LEFT JOIN use_color uc ON o.color=uc.id
      WHERE wo.category_ref=? ORDER BY o.name
    ''', [worldCategoryId]);
    return rows.map(WorldObjectModel.fromMap).toList();
  }

  /// Objects in the source object_category not yet added to this world category.
  Future<List<LinkableObjectModel>> getLinkableObjects(int worldCategoryId) async {
    final rows = await db.rawQuery('''
      SELECT o.id, o.name, oc.category_name, uc.color_code
      FROM object o
      JOIN object_category oc ON o.category_id=oc.id
      LEFT JOIN use_color uc ON o.color=uc.id
      WHERE o.category_id = (SELECT category_ref FROM world_category WHERE id=?)
        AND o.id NOT IN (SELECT object_ref FROM world_object WHERE category_ref=?)
      ORDER BY o.name
    ''', [worldCategoryId, worldCategoryId]);
    return rows.map(LinkableObjectModel.fromMap).toList();
  }

  Future<void> addWorldObject(int worldCategoryId, int objectRef, String? symbol) async {
    await db.rawInsert(
      'INSERT OR IGNORE INTO world_object (category_ref, object_ref, symbol) VALUES (?,?,?)',
      [worldCategoryId, objectRef, symbol],
    );
  }

  Future<void> updateWorldObjectSymbol(int id, String? symbol) async {
    await db.rawUpdate(
      "UPDATE world_object SET symbol=?,update_at=datetime('now') WHERE id=?",
      [symbol, id],
    );
  }

  Future<void> removeWorldObject(int id) async {
    await db.delete('world_object', where: 'id=?', whereArgs: [id]);
  }

  // ---- Maps --------------------------------------------------------------

  Future<List<WorldMapModel>> getWorldMaps(int worldId) async {
    final rows = await db.rawQuery('''
      SELECT wm.id, wm.world_ref, wm.map_ref, m.map_name, p.name AS project_name, uc.color_code
      FROM world_map wm
      JOIN map m ON wm.map_ref=m.id
      JOIN project p ON m.project_id=p.id
      LEFT JOIN use_color uc ON m.color=uc.id
      WHERE wm.world_ref=? ORDER BY p.name, m.map_name
    ''', [worldId]);
    return rows.map(WorldMapModel.fromMap).toList();
  }

  Future<List<LinkableMapModel>> getLinkableMaps(int worldId) async {
    final rows = await db.rawQuery('''
      SELECT m.id, m.map_name, p.name, uc.color_code
      FROM map m
      JOIN project p ON m.project_id=p.id
      LEFT JOIN use_color uc ON m.color=uc.id
      WHERE m.project_id IN (SELECT project_ref FROM world_novel WHERE world_ref=?)
        AND m.id NOT IN (SELECT map_ref FROM world_map WHERE world_ref=?)
      ORDER BY p.name, m.map_name
    ''', [worldId, worldId]);
    return rows.map(LinkableMapModel.fromMap).toList();
  }

  Future<void> addWorldMap(int worldId, int mapRef) async {
    await db.rawInsert(
      'INSERT OR IGNORE INTO world_map (world_ref, map_ref) VALUES (?,?)',
      [worldId, mapRef],
    );
  }

  Future<void> removeWorldMap(int id) async {
    await db.delete('world_map', where: 'id=?', whereArgs: [id]);
  }

  // ---- Timeline ----------------------------------------------------------

  Future<List<WorldTimelineModel>> getWorldTimelines(int worldId) async {
    final rows = await db.rawQuery(
      'SELECT * FROM world_timeline WHERE world_ref=? ORDER BY name',
      [worldId],
    );
    return rows.map(WorldTimelineModel.fromMap).toList();
  }

  Future<int> createWorldTimeline(int worldId, String name, int? worldMapRef) async {
    return db.insert('world_timeline', {
      'world_ref': worldId,
      'name': name,
      'world_map_ref': worldMapRef,
    });
  }

  Future<void> updateWorldTimeline(int id, String name, int? worldMapRef) async {
    await db.rawUpdate(
      "UPDATE world_timeline SET name=?,world_map_ref=?,update_at=datetime('now') WHERE id=?",
      [name, worldMapRef, id],
    );
  }

  Future<void> deleteWorldTimeline(int id) async {
    await db.delete('world_timeline', where: 'id=?', whereArgs: [id]);
  }

  Future<List<WorldTimelineEventModel>> getTimelineEvents(int timelineId) async {
    final rows = await db.rawQuery('''
      SELECT e.id, e.timeline_ref, e.date_ref, d.day, d.month, d.years, d.hour, d.minute
      FROM world_timeline_event e
      JOIN world_timeline_date d ON e.date_ref=d.id
      WHERE e.timeline_ref=?
      ORDER BY d.years, d.month, d.day, d.hour, d.minute
    ''', [timelineId]);
    return rows.map(WorldTimelineEventModel.fromMap).toList();
  }

  /// Get-or-create a date, then create an event for it on the timeline.
  Future<int> createTimelineEvent(int timelineId, int day, int month, int years, int hour, int minute) async {
    return db.transaction((txn) async {
      await txn.rawInsert(
        'INSERT OR IGNORE INTO world_timeline_date (day, month, years, hour, minute) VALUES (?,?,?,?,?)',
        [day, month, years, hour, minute],
      );
      final dateRows = await txn.rawQuery(
        'SELECT id FROM world_timeline_date WHERE day=? AND month=? AND years=? AND hour=? AND minute=?',
        [day, month, years, hour, minute],
      );
      final dateId = dateRows.first['id'] as int;
      return txn.rawInsert(
        'INSERT OR IGNORE INTO world_timeline_event (timeline_ref, date_ref) VALUES (?,?)',
        [timelineId, dateId],
      );
    });
  }

  Future<void> deleteTimelineEvent(int id) async {
    await db.delete('world_timeline_event', where: 'id=?', whereArgs: [id]);
  }

  /// Objects/characters placed within an event, with their point coordinates.
  Future<List<WorldTimelineObjectModel>> getEventObjects(int eventId) async {
    final rows = await db.rawQuery('''
      SELECT t.id, t.event_ref, t.world_object_ref, t.world_character_ref, t.point_ref,
             pt.x, pt.y,
             COALESCE(oo.name, wc.name) AS label,
             COALESCE(wo.symbol, wc.symbol) AS symbol,
             COALESCE(ucc.color_code, uco.color_code) AS color_code
      FROM world_timeline_object t
      LEFT JOIN world_timeline_point pt ON t.point_ref=pt.id
      LEFT JOIN world_object wo ON t.world_object_ref=wo.id
      LEFT JOIN object oo ON wo.object_ref=oo.id
      LEFT JOIN use_color uco ON oo.color=uco.id
      LEFT JOIN world_character wc ON t.world_character_ref=wc.id
      LEFT JOIN use_color ucc ON wc.color=ucc.id
      WHERE t.event_ref=? ORDER BY label
    ''', [eventId]);
    return rows.map(WorldTimelineObjectModel.fromMap).toList();
  }

  /// World objects available to place (with display label).
  Future<List<LinkableObjectModel>> getPlaceableObjects(int worldId) async {
    final rows = await db.rawQuery('''
      SELECT wo.id, o.name, oc.category_name, uc.color_code
      FROM world_object wo
      JOIN world_category wcat ON wo.category_ref=wcat.id
      JOIN object o ON wo.object_ref=o.id
      JOIN object_category oc ON o.category_id=oc.id
      LEFT JOIN use_color uc ON o.color=uc.id
      WHERE wcat.world_ref=? ORDER BY o.name
    ''', [worldId]);
    return rows.map(LinkableObjectModel.fromMap).toList();
  }

  /// World characters available to place (with display label).
  Future<List<LinkableObjectModel>> getPlaceableCharacters(int worldId) async {
    final rows = await db.rawQuery('''
      SELECT c.id, c.name, NULL AS category_name, uc.color_code
      FROM world_character c
      LEFT JOIN use_color uc ON c.color=uc.id
      WHERE c.world_ref=? ORDER BY c.name
    ''', [worldId]);
    return rows.map(LinkableObjectModel.fromMap).toList();
  }

  /// Place a world object or character on a new point within an event.
  Future<void> addEventObject(int eventId, {int? worldObjectRef, int? worldCharacterRef, required double x, required double y}) async {
    await db.transaction((txn) async {
      final pointId = await txn.insert('world_timeline_point', {'x': x, 'y': y});
      await txn.insert('world_timeline_object', {
        'event_ref': eventId,
        'world_object_ref': worldObjectRef,
        'world_character_ref': worldCharacterRef,
        'point_ref': pointId,
      });
    });
  }

  Future<void> updateEventObjectPoint(int timelineObjectId, double x, double y) async {
    await db.rawUpdate('''
      UPDATE world_timeline_point SET x=?, y=?, update_at=datetime('now')
      WHERE id = (SELECT point_ref FROM world_timeline_object WHERE id=?)
    ''', [x, y, timelineObjectId]);
  }

  Future<void> removeEventObject(int id) async {
    await db.transaction((txn) async {
      final rows = await txn.rawQuery('SELECT point_ref FROM world_timeline_object WHERE id=?', [id]);
      await txn.delete('world_timeline_object', where: 'id=?', whereArgs: [id]);
      if (rows.isNotEmpty && rows.first['point_ref'] != null) {
        await txn.delete('world_timeline_point', where: 'id=?', whereArgs: [rows.first['point_ref']]);
      }
    });
  }
}
