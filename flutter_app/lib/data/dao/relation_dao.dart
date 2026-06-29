import 'package:sqflite/sqflite.dart';
import '../models/relation_model.dart';

class RelationDao {
  final Database db;
  RelationDao(this.db);

  Future<List<RelationTypeModel>> getRelationTypes() async {
    final rows = await db.rawQuery('''
      SELECT rt.*, uc.color_code FROM relation_type rt
      LEFT JOIN use_color uc ON rt.color = uc.id ORDER BY rt.relation_name
    ''');
    return rows.map(RelationTypeModel.fromMap).toList();
  }

  Future<int> createRelationType(String name, int? colorId) async {
    return db.insert('relation_type', {'relation_name': name, 'color': colorId});
  }

  Future<void> updateRelationType(int id, String name, int? colorId) async {
    await db.rawUpdate(
      "UPDATE relation_type SET relation_name=?,color=?,update_at=datetime('now') WHERE id=?",
      [name, colorId, id],
    );
  }

  Future<void> deleteRelationType(int id) async {
    await db.delete('relation_type', where: 'id=?', whereArgs: [id]);
  }

  Future<List<RelationObObModel>> getRelationsOBOB(int projectId) async {
    final rows = await db.rawQuery('''
      SELECT ro.id, r.id rel_id, rt.relation_name,
        rtc.color_code AS color_code,
        r.relation_type, r.color,
        o1.name from_name, oc1.category_name from_cat,
        o2.name to_name, oc2.category_name to_cat
      FROM relation_obob ro
      JOIN relation r ON ro.relation_id=r.id
      LEFT JOIN relation_type rt ON r.relation_type=rt.id
      LEFT JOIN use_color uc ON r.color=uc.id
      LEFT JOIN use_color rtc ON rt.color=rtc.id
      JOIN object o1 ON ro.object_from=o1.id JOIN object_category oc1 ON o1.category_id=oc1.id
      JOIN object o2 ON ro.object_to=o2.id JOIN object_category oc2 ON o2.category_id=oc2.id
      WHERE r.project_id=? ORDER BY rt.relation_name,o1.name
    ''', [projectId]);
    return rows.map(RelationObObModel.fromMap).toList();
  }

  Future<void> createRelationOBOB(int projectId, int? typeId, int? colorId, int from, int to) async {
    final relId = await db.insert('relation', {
      'project_id': projectId,
      'relation_type': typeId,
      'color': colorId,
    });
    await db.insert('relation_obob', {'relation_id': relId, 'object_from': from, 'object_to': to});
  }

  Future<void> deleteRelationOBOB(int id) async {
    final rows = await db.rawQuery('SELECT relation_id FROM relation_obob WHERE id=?', [id]);
    await db.delete('relation_obob', where: 'id=?', whereArgs: [id]);
    if (rows.isNotEmpty) {
      await db.delete('relation', where: 'id=?', whereArgs: [rows.first['relation_id']]);
    }
  }

  Future<List<RelationObTlModel>> getRelationsOBTL(int projectId) async {
    final rows = await db.rawQuery('''
      SELECT ro.id, r.id rel_id, rt.relation_name,
        rtc.color_code AS color_code,
        r.relation_type, r.color,
        o.name from_name, oc.category_name from_cat,
        te.event_name to_name, t.line_name to_tl,
        s.day s_day, s.month s_month, s.years s_years
      FROM relation_obtl ro
      JOIN relation r ON ro.relation_id=r.id
      LEFT JOIN relation_type rt ON r.relation_type=rt.id
      LEFT JOIN use_color uc ON r.color=uc.id
      LEFT JOIN use_color rtc ON rt.color=rtc.id
      JOIN object o ON ro.object_from=o.id JOIN object_category oc ON o.category_id=oc.id
      JOIN timeline_event te ON ro.timeline_to=te.id JOIN timeline t ON te.timeline_id=t.id
      LEFT JOIN timeline_date s ON te.start_at=s.id
      WHERE r.project_id=? ORDER BY rt.relation_name,o.name
    ''', [projectId]);
    return rows.map(RelationObTlModel.fromMap).toList();
  }

  Future<void> createRelationOBTL(int projectId, int? typeId, int? colorId, int from, int to) async {
    final relId = await db.insert('relation', {
      'project_id': projectId,
      'relation_type': typeId,
      'color': colorId,
    });
    await db.insert('relation_obtl', {'relation_id': relId, 'object_from': from, 'timeline_to': to});
  }

  Future<void> deleteRelationOBTL(int id) async {
    final rows = await db.rawQuery('SELECT relation_id FROM relation_obtl WHERE id=?', [id]);
    await db.delete('relation_obtl', where: 'id=?', whereArgs: [id]);
    if (rows.isNotEmpty) {
      await db.delete('relation', where: 'id=?', whereArgs: [rows.first['relation_id']]);
    }
  }

  Future<List<RelationTlTlModel>> getRelationsTLTL(int projectId) async {
    final rows = await db.rawQuery('''
      SELECT ro.id, r.id rel_id, rt.relation_name,
        rtc.color_code AS color_code,
        r.relation_type, r.color,
        te1.event_name from_name, t1.line_name from_tl,
        te2.event_name to_name, t2.line_name to_tl
      FROM relation_tltl ro
      JOIN relation r ON ro.relation_id=r.id
      LEFT JOIN relation_type rt ON r.relation_type=rt.id
      LEFT JOIN use_color uc ON r.color=uc.id
      LEFT JOIN use_color rtc ON rt.color=rtc.id
      JOIN timeline_event te1 ON ro.timeline_from=te1.id JOIN timeline t1 ON te1.timeline_id=t1.id
      JOIN timeline_event te2 ON ro.timeline_to=te2.id JOIN timeline t2 ON te2.timeline_id=t2.id
      WHERE r.project_id=? ORDER BY rt.relation_name
    ''', [projectId]);
    return rows.map(RelationTlTlModel.fromMap).toList();
  }

  Future<void> createRelationTLTL(int projectId, int? typeId, int? colorId, int from, int to) async {
    final relId = await db.insert('relation', {
      'project_id': projectId,
      'relation_type': typeId,
      'color': colorId,
    });
    await db.insert('relation_tltl', {'relation_id': relId, 'timeline_from': from, 'timeline_to': to});
  }

  Future<void> deleteRelationTLTL(int id) async {
    final rows = await db.rawQuery('SELECT relation_id FROM relation_tltl WHERE id=?', [id]);
    await db.delete('relation_tltl', where: 'id=?', whereArgs: [id]);
    if (rows.isNotEmpty) {
      await db.delete('relation', where: 'id=?', whereArgs: [rows.first['relation_id']]);
    }
  }

  Future<void> updateRelation(int id, int? relationType, int? colorId) async {
    await db.rawUpdate(
      'UPDATE relation SET relation_type=?,color=? WHERE id=?',
      [relationType, colorId, id],
    );
  }
}
