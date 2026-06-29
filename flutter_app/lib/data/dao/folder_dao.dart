import 'package:sqflite/sqflite.dart';
import '../models/folder_model.dart';

class FolderDao {
  final Database db;
  FolderDao(this.db);

  Future<List<FolderModel>> getFolders() async {
    final rows = await db.rawQuery('''
      SELECT pf.*, uc.color_code FROM project_folder pf
      LEFT JOIN use_color uc ON pf.folder_color = uc.id ORDER BY pf.name
    ''');
    return rows.map(FolderModel.fromMap).toList();
  }

  Future<int> createFolder(String name, String? memo, int? colorId) async {
    return db.insert('project_folder', {
      'name': name,
      'folder_memo': memo,
      'folder_color': colorId,
    });
  }

  Future<void> updateFolder(int id, String name, String? memo, int? colorId) async {
    await db.rawUpdate(
      "UPDATE project_folder SET name=?,folder_memo=?,folder_color=?,update_at=datetime('now') WHERE id=?",
      [name, memo, colorId, id],
    );
  }

  Future<void> deleteFolder(int id) async {
    await db.delete('project_folder', where: 'id=?', whereArgs: [id]);
  }
}
