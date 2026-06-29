import 'package:sqflite/sqflite.dart';
import '../models/category_model.dart';

class CategoryDao {
  final Database db;
  CategoryDao(this.db);

  Future<List<CategoryModel>> getCategories(int projectId) async {
    final rows = await db.rawQuery('''
      SELECT oc.*, uc.color_code FROM object_category oc
      LEFT JOIN use_color uc ON oc.color = uc.id
      WHERE oc.project_id=? ORDER BY oc.category_name
    ''', [projectId]);
    return rows.map(CategoryModel.fromMap).toList();
  }

  Future<int> createCategory(int projectId, String name, int? colorId) async {
    return db.insert('object_category', {
      'category_name': name,
      'project_id': projectId,
      'color': colorId,
    });
  }

  Future<void> updateCategory(int id, String name, int? colorId) async {
    await db.rawUpdate(
      "UPDATE object_category SET category_name=?,color=?,update_at=datetime('now') WHERE id=?",
      [name, colorId, id],
    );
  }

  Future<void> deleteCategory(int id) async {
    await db.transaction((txn) async {
      await txn.rawDelete('''
        DELETE FROM relation WHERE id IN (
          SELECT ro.relation_id FROM relation_obob ro
          JOIN object o1 ON ro.object_from = o1.id WHERE o1.category_id = ?
          UNION
          SELECT ro.relation_id FROM relation_obob ro
          JOIN object o2 ON ro.object_to = o2.id WHERE o2.category_id = ?
          UNION
          SELECT rt.relation_id FROM relation_obtl rt
          JOIN object o ON rt.object_from = o.id WHERE o.category_id = ?
        )
      ''', [id, id, id]);
      await txn.delete('object_category', where: 'id=?', whereArgs: [id]);
    });
  }

  Future<List<TemplateModel>> getTemplates(int categoryId) async {
    final rows = await db.rawQuery(
      'SELECT * FROM object_template WHERE category_id=? ORDER BY display_order, id',
      [categoryId],
    );
    return rows.map(TemplateModel.fromMap).toList();
  }

  Future<int> createTemplate(int categoryId, String description, String type) async {
    return db.insert('object_template', {
      'category_id': categoryId,
      'description': description,
      'attribute_type': type,
    });
  }

  Future<void> updateTemplate(int id, String description, String type) async {
    await db.rawUpdate(
      "UPDATE object_template SET description=?,attribute_type=?,update_at=datetime('now') WHERE id=?",
      [description, type, id],
    );
  }

  Future<void> deleteTemplate(int id) async {
    await db.delete('object_template', where: 'id=?', whereArgs: [id]);
  }
}
