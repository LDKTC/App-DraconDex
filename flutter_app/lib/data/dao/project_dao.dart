import 'package:sqflite/sqflite.dart';
import '../models/project_model.dart';

class ProjectDao {
  final Database db;
  ProjectDao(this.db);

  Future<List<ProjectModel>> getProjects({int? folderId}) async {
    final base = 'SELECT p.*, uc.color_code FROM project p LEFT JOIN use_color uc ON p.project_color = uc.id';
    List<Map<String, dynamic>> rows;
    if (folderId != null) {
      rows = await db.rawQuery('$base WHERE p.folder_id=? ORDER BY p.name', [folderId]);
    } else {
      rows = await db.rawQuery('$base ORDER BY p.name');
    }
    return rows.map(ProjectModel.fromMap).toList();
  }

  Future<ProjectModel?> getProject(int id) async {
    final rows = await db.rawQuery(
      'SELECT p.*, uc.color_code FROM project p LEFT JOIN use_color uc ON p.project_color = uc.id WHERE p.id=?',
      [id],
    );
    if (rows.isEmpty) return null;
    return ProjectModel.fromMap(rows.first);
  }

  Future<int> createProject({
    String? codename,
    required String name,
    String? memo,
    int? folderId,
    int? colorId,
  }) async {
    return db.insert('project', {
      'codename': codename,
      'name': name,
      'project_memo': memo,
      'folder_id': folderId,
      'project_color': colorId,
    });
  }

  Future<void> updateProject(int id, {
    String? codename,
    required String name,
    String? memo,
    int? folderId,
    int? colorId,
  }) async {
    await db.rawUpdate(
      "UPDATE project SET codename=?,name=?,project_memo=?,folder_id=?,project_color=?,update_at=datetime('now') WHERE id=?",
      [codename, name, memo, folderId, colorId, id],
    );
  }

  Future<void> deleteProject(int id) async {
    await db.delete('project', where: 'id=?', whereArgs: [id]);
  }

  Future<List<ProjectDescModel>> getProjectDesc(int projectId) async {
    final rows = await db.rawQuery(
      'SELECT * FROM project_description WHERE project_id=? ORDER BY id',
      [projectId],
    );
    return rows.map(ProjectDescModel.fromMap).toList();
  }

  Future<int> addProjectDesc(int projectId, String? name, String? text) async {
    return db.insert('project_description', {
      'project_id': projectId,
      'attribute_name': name,
      'attribute_text': text,
    });
  }

  Future<void> updateProjectDesc(int id, String? name, String? text) async {
    await db.rawUpdate(
      "UPDATE project_description SET attribute_name=?,attribute_text=?,update_at=datetime('now') WHERE id=?",
      [name, text, id],
    );
  }

  Future<void> deleteProjectDesc(int id) async {
    await db.delete('project_description', where: 'id=?', whereArgs: [id]);
  }
}
