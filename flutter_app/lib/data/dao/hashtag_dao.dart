import 'package:sqflite/sqflite.dart';
import '../models/hashtag_model.dart';
import '../models/object_model.dart';
import '../models/timeline_model.dart';

class HashtagDao {
  final Database db;
  HashtagDao(this.db);

  Future<List<HashtagModel>> getHashtags() async {
    final rows = await db.rawQuery('''
      SELECT h.*, uc.color_code FROM hashtag h
      LEFT JOIN use_color uc ON h.tag_color=uc.id ORDER BY h.tag_name
    ''');
    return rows.map(HashtagModel.fromMap).toList();
  }

  Future<int> createHashtag(String name, int? colorId) async {
    return db.insert('hashtag', {'tag_name': name, 'tag_color': colorId});
  }

  Future<void> updateHashtag(int id, String name, int? colorId) async {
    await db.rawUpdate(
      "UPDATE hashtag SET tag_name=?,tag_color=?,update_at=datetime('now') WHERE id=?",
      [name, colorId, id],
    );
  }

  Future<void> deleteHashtag(int id) async {
    await db.delete('hashtag', where: 'id=?', whereArgs: [id]);
  }

  Future<List<HashtagModel>> getProjectTags(int projectId) async {
    final rows = await db.rawQuery('''
      SELECT h.*, uc.color_code FROM hashtag h
      LEFT JOIN use_color uc ON h.tag_color=uc.id
      JOIN project_hashtag ph ON h.id=ph.hashtag_id
      WHERE ph.project_id=? ORDER BY h.tag_name
    ''', [projectId]);
    return rows.map(HashtagModel.fromMap).toList();
  }

  Future<void> setProjectTags(int projectId, List<int> tagIds) async {
    await db.delete('project_hashtag', where: 'project_id=?', whereArgs: [projectId]);
    for (final t in tagIds) {
      await db.rawInsert('INSERT OR IGNORE INTO project_hashtag (project_id,hashtag_id) VALUES (?,?)', [projectId, t]);
    }
  }

  Future<void> addProjectTag(int projectId, int tagId) async {
    await db.rawInsert('INSERT OR IGNORE INTO project_hashtag (project_id,hashtag_id) VALUES (?,?)', [projectId, tagId]);
  }

  Future<void> removeProjectTag(int projectId, int tagId) async {
    await db.rawDelete('DELETE FROM project_hashtag WHERE project_id=? AND hashtag_id=?', [projectId, tagId]);
  }

  Future<List<HashtagModel>> getObjectTags(int objectId) async {
    final rows = await db.rawQuery('''
      SELECT h.*, uc.color_code FROM hashtag h
      LEFT JOIN use_color uc ON h.tag_color=uc.id
      JOIN object_hashtag oh ON h.id=oh.hashtag_id
      WHERE oh.object_id=? ORDER BY h.tag_name
    ''', [objectId]);
    return rows.map(HashtagModel.fromMap).toList();
  }

  Future<void> setObjectTags(int objectId, List<int> tagIds) async {
    await db.delete('object_hashtag', where: 'object_id=?', whereArgs: [objectId]);
    for (final t in tagIds) {
      await db.rawInsert('INSERT OR IGNORE INTO object_hashtag (object_id,hashtag_id) VALUES (?,?)', [objectId, t]);
    }
  }

  Future<void> addObjectTag(int objectId, int tagId) async {
    await db.rawInsert('INSERT OR IGNORE INTO object_hashtag (object_id,hashtag_id) VALUES (?,?)', [objectId, tagId]);
  }

  Future<void> removeObjectTag(int objectId, int tagId) async {
    await db.rawDelete('DELETE FROM object_hashtag WHERE object_id=? AND hashtag_id=?', [objectId, tagId]);
  }

  Future<List<HashtagModel>> getEventTags(int eventId) async {
    final rows = await db.rawQuery('''
      SELECT h.*, uc.color_code FROM hashtag h
      LEFT JOIN use_color uc ON h.tag_color=uc.id
      JOIN event_hashtag eh ON h.id=eh.hashtag_id
      WHERE eh.event_id=? ORDER BY h.tag_name
    ''', [eventId]);
    return rows.map(HashtagModel.fromMap).toList();
  }

  Future<void> setEventTags(int eventId, List<int> tagIds) async {
    await db.delete('event_hashtag', where: 'event_id=?', whereArgs: [eventId]);
    for (final t in tagIds) {
      await db.rawInsert('INSERT OR IGNORE INTO event_hashtag (event_id,hashtag_id) VALUES (?,?)', [eventId, t]);
    }
  }

  Future<List<HashtagModel>> getAllProjectUsedTags(int projectId) async {
    final rows = await db.rawQuery('''
      SELECT DISTINCT h.id, h.tag_name, h.tag_color, h.update_at, uc.color_code
      FROM hashtag h
      LEFT JOIN use_color uc ON h.tag_color = uc.id
      WHERE h.id IN (
        SELECT hashtag_id FROM project_hashtag WHERE project_id = ?
        UNION
        SELECT oh.hashtag_id FROM object_hashtag oh
        JOIN object o ON oh.object_id = o.id WHERE o.project_id = ?
        UNION
        SELECT eh.hashtag_id FROM event_hashtag eh
        JOIN timeline_event te ON eh.event_id = te.id
        JOIN timeline tl ON te.timeline_id = tl.id WHERE tl.project_id = ?
      )
      ORDER BY h.tag_name
    ''', [projectId, projectId, projectId]);
    return rows.map(HashtagModel.fromMap).toList();
  }

  Future<List<ObjectModel>> getObjectsByHashtag(int tagId, int projectId) async {
    final rows = await db.rawQuery('''
      SELECT o.*, oc.category_name, uc.color_code
      FROM object o
      JOIN object_hashtag oh ON oh.object_id = o.id
      JOIN object_category oc ON o.category_id = oc.id
      LEFT JOIN use_color uc ON o.color = uc.id
      WHERE oh.hashtag_id = ? AND o.project_id = ?
      ORDER BY oc.category_name, o.name
    ''', [tagId, projectId]);
    return rows.map(ObjectModel.fromMap).toList();
  }

  Future<List<TimelineEventModel>> getEventsByHashtag(int tagId, int projectId) async {
    final rows = await db.rawQuery('''
      SELECT te.id, te.event_name, te.timeline_id, te.start_at, te.end_at, te.color, te.story, te.update_at,
        uc.color_code
      FROM timeline_event te
      JOIN event_hashtag eh ON eh.event_id = te.id
      JOIN timeline tl ON te.timeline_id = tl.id
      LEFT JOIN use_color uc ON te.color = uc.id
      WHERE eh.hashtag_id = ? AND tl.project_id = ?
      ORDER BY tl.line_name, te.event_name
    ''', [tagId, projectId]);
    return rows.map(TimelineEventModel.fromMap).toList();
  }
}
