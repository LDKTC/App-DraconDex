import 'package:sqflite/sqflite.dart';
import '../models/object_model.dart';

class ObjectDao {
  final Database db;
  ObjectDao(this.db);

  Future<List<ObjectModel>> getObjects(int categoryId) async {
    final rows = await db.rawQuery('''
      SELECT o.*, uc.color_code FROM object o
      LEFT JOIN use_color uc ON o.color = uc.id
      WHERE o.category_id=? ORDER BY o.name
    ''', [categoryId]);
    return rows.map(ObjectModel.fromMap).toList();
  }

  Future<ObjectModel?> getObject(int id) async {
    final rows = await db.rawQuery('''
      SELECT o.*, uc.color_code FROM object o
      LEFT JOIN use_color uc ON o.color = uc.id WHERE o.id=?
    ''', [id]);
    if (rows.isEmpty) return null;
    return ObjectModel.fromMap(rows.first);
  }

  Future<List<ObjectModel>> getProjectObjects(int projectId) async {
    final rows = await db.rawQuery('''
      SELECT o.id, o.name, o.project_id, o.category_id, o.color, o.note, o.update_at,
        oc.category_name, uc.color_code
      FROM object o JOIN object_category oc ON o.category_id=oc.id
      LEFT JOIN use_color uc ON o.color=uc.id
      WHERE o.project_id=? ORDER BY oc.category_name, o.name
    ''', [projectId]);
    return rows.map(ObjectModel.fromMap).toList();
  }

  Future<int> createObject(int projectId, int categoryId, String name, int? colorId) async {
    return db.insert('object', {
      'name': name,
      'project_id': projectId,
      'category_id': categoryId,
      'color': colorId,
    });
  }

  Future<void> updateObject(int id, String name, int? colorId) async {
    await db.rawUpdate(
      "UPDATE object SET name=?,color=?,update_at=datetime('now') WHERE id=?",
      [name, colorId, id],
    );
  }

  Future<void> updateObjectNote(int id, String? note) async {
    await db.rawUpdate(
      "UPDATE object SET note=?,update_at=datetime('now') WHERE id=?",
      [note, id],
    );
  }

  Future<void> deleteObject(int id) async {
    await db.transaction((txn) async {
      await txn.rawDelete('''
        DELETE FROM relation WHERE id IN (
          SELECT relation_id FROM relation_obob WHERE object_from=? OR object_to=?
          UNION
          SELECT relation_id FROM relation_obtl WHERE object_from=?
        )
      ''', [id, id, id]);
      await txn.delete('object', where: 'id=?', whereArgs: [id]);
    });
  }

  Future<List<ObjectAttributeModel>> getObjectAttrs(int objectId) async {
    final rows = await db.rawQuery('''
      SELECT ot.id, ot.description, ot.attribute_type, oa.attribute_value
      FROM object_template ot
      LEFT JOIN object_attribute oa ON oa.template_id = ot.id AND oa.object_id = ?
      WHERE ot.category_id = (SELECT category_id FROM object WHERE id = ?)
      ORDER BY ot.display_order, ot.id
    ''', [objectId, objectId]);
    return rows.map(ObjectAttributeModel.fromMap).toList();
  }

  Future<void> upsertAttr(int objectId, int templateId, String? value) async {
    await db.rawInsert('''
      INSERT INTO object_attribute (object_id, template_id, attribute_value)
      VALUES (?,?,?)
      ON CONFLICT(object_id, template_id)
      DO UPDATE SET attribute_value=excluded.attribute_value, update_at=datetime('now')
    ''', [objectId, templateId, value]);
  }
}
