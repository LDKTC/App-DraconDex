import 'package:sqflite/sqflite.dart';
import '../models/timeline_model.dart';

class TimelineDao {
  final Database db;
  TimelineDao(this.db);

  Future<List<TimelineModel>> getTimelines(int projectId) async {
    final rows = await db.rawQuery('''
      SELECT t.*, uc.color_code FROM timeline t
      LEFT JOIN use_color uc ON t.color=uc.id
      WHERE t.project_id=? ORDER BY t.line_name
    ''', [projectId]);
    return rows.map(TimelineModel.fromMap).toList();
  }

  Future<int> createTimeline(int projectId, String? name, int? colorId) async {
    return db.insert('timeline', {'line_name': name, 'project_id': projectId, 'color': colorId});
  }

  Future<void> updateTimeline(int id, String? name, int? colorId) async {
    await db.rawUpdate(
      "UPDATE timeline SET line_name=?,color=?,update_at=datetime('now') WHERE id=?",
      [name, colorId, id],
    );
  }

  Future<void> deleteTimeline(int id) async {
    await db.delete('timeline', where: 'id=?', whereArgs: [id]);
  }

  Future<int> getOrCreateDate(int day, int month, int years, int hour, int minute) async {
    await db.rawInsert(
      'INSERT OR IGNORE INTO timeline_date (day,month,years,hour,minute) VALUES (?,?,?,?,?)',
      [day, month, years, hour, minute],
    );
    final rows = await db.rawQuery(
      'SELECT id FROM timeline_date WHERE day=? AND month=? AND years=? AND hour=? AND minute=?',
      [day, month, years, hour, minute],
    );
    return rows.first['id'] as int;
  }

  Future<List<TimelineEventModel>> getEvents(int timelineId) async {
    final rows = await db.rawQuery('''
      SELECT te.*, te.story, uc.color_code,
        s.day s_day, s.month s_month, s.years s_years, s.hour s_hour, s.minute s_minute,
        e.day e_day, e.month e_month, e.years e_years, e.hour e_hour, e.minute e_minute
      FROM timeline_event te
      LEFT JOIN use_color uc ON te.color=uc.id
      LEFT JOIN timeline_date s ON te.start_at=s.id
      LEFT JOIN timeline_date e ON te.end_at=e.id
      WHERE te.timeline_id=?
      ORDER BY s.years,s.month,s.day,s.hour,s.minute
    ''', [timelineId]);
    return rows.map(TimelineEventModel.fromMap).toList();
  }

  Future<int> createEvent(int timelineId, String? name, int startId, int? endId, int? colorId, String? story) async {
    return db.insert('timeline_event', {
      'timeline_id': timelineId,
      'event_name': name,
      'start_at': startId,
      'end_at': endId,
      'color': colorId,
      'story': story,
    });
  }

  Future<void> updateEvent(int id, String? name, int startId, int? endId, int? colorId, String? story) async {
    await db.rawUpdate(
      "UPDATE timeline_event SET event_name=?,start_at=?,end_at=?,color=?,story=?,update_at=datetime('now') WHERE id=?",
      [name, startId, endId, colorId, story, id],
    );
  }

  Future<void> updateEventStory(int id, String? story) async {
    await db.rawUpdate(
      "UPDATE timeline_event SET story=?,update_at=datetime('now') WHERE id=?",
      [story, id],
    );
  }

  Future<void> deleteEvent(int id) async {
    await db.delete('timeline_event', where: 'id=?', whereArgs: [id]);
  }

  Future<List<TimelineEventModel>> getProjectEvents(int projectId) async {
    final rows = await db.rawQuery('''
      SELECT te.id, te.event_name, te.timeline_id, te.start_at, te.end_at, te.color, te.story, te.update_at,
        t.line_name,
        s.day s_day, s.month s_month, s.years s_years,
        uc.color_code, tlc.color_code AS timeline_color_code
      FROM timeline_event te
      JOIN timeline t ON te.timeline_id=t.id
      LEFT JOIN use_color uc ON te.color=uc.id
      LEFT JOIN use_color tlc ON t.color=tlc.id
      LEFT JOIN timeline_date s ON te.start_at=s.id
      WHERE t.project_id=?
      ORDER BY t.line_name,s.years,s.month,s.day
    ''', [projectId]);
    return rows.map(TimelineEventModel.fromMap).toList();
  }
}
