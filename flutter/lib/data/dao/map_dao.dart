import 'package:sqflite/sqflite.dart';
import '../models/map_model.dart';

class MapDao {
  final Database db;
  MapDao(this.db);

  Future<List<MapModel>> getMaps(int projectId) async {
    final rows = await db.rawQuery('''
      SELECT m.*, uc.color_code FROM map m
      LEFT JOIN use_color uc ON m.color=uc.id
      WHERE m.project_id=? ORDER BY m.map_name
    ''', [projectId]);
    return rows.map(MapModel.fromMap).toList();
  }

  Future<int> createMap(int projectId, String? name, int? colorId) async {
    return db.insert('map', {'map_name': name, 'project_id': projectId, 'color': colorId});
  }

  Future<void> updateMap(int id, String? name, int? colorId) async {
    await db.rawUpdate(
      "UPDATE map SET map_name=?,color=?,update_at=datetime('now') WHERE id=?",
      [name, colorId, id],
    );
  }

  Future<void> deleteMap(int id) async {
    await db.delete('map', where: 'id=?', whereArgs: [id]);
  }

  Future<List<MapAreaModel>> getMapAreas(int mapId) async {
    final rows = await db.rawQuery('''
      SELECT a.*, uc.color_code FROM map_area a
      LEFT JOIN use_color uc ON a.color=uc.id
      WHERE a.map_id=? ORDER BY a.area_name
    ''', [mapId]);
    return rows.map(MapAreaModel.fromMap).toList();
  }

  Future<int> createMapArea(int mapId, String? name, int? colorId) async {
    return db.insert('map_area', {'map_id': mapId, 'area_name': name, 'color': colorId});
  }

  Future<void> updateMapArea(int id, String? name, int? colorId) async {
    await db.rawUpdate(
      "UPDATE map_area SET area_name=?,color=?,update_at=datetime('now') WHERE id=?",
      [name, colorId, id],
    );
  }

  Future<void> deleteMapArea(int id) async {
    await db.delete('map_area', where: 'id=?', whereArgs: [id]);
  }

  Future<List<MapPointModel>> getMapAreaPoints(int areaId) async {
    final rows = await db.rawQuery(
      'SELECT id, area_id, point_order, x, y FROM map_point WHERE area_id=? ORDER BY point_order, id',
      [areaId],
    );
    return rows.map(MapPointModel.fromMap).toList();
  }

  Future<void> setMapAreaPoints(int areaId, List<MapPointModel> points) async {
    await db.transaction((txn) async {
      await txn.delete('map_point', where: 'area_id=?', whereArgs: [areaId]);
      for (int i = 0; i < points.length; i++) {
        await txn.insert('map_point', {
          'area_id': areaId,
          'point_order': i,
          'x': points[i].x,
          'y': points[i].y,
        });
      }
    });
  }
}
