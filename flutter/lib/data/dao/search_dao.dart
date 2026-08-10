import 'package:sqflite/sqflite.dart';
import '../models/project_model.dart';
import '../models/object_model.dart';
import '../models/hashtag_model.dart';

class SearchResult {
  final List<ProjectModel> projects;
  final List<ObjectModel> objects;
  final List<HashtagModel> hashtags;

  const SearchResult({
    required this.projects,
    required this.objects,
    required this.hashtags,
  });
}

class SearchDao {
  final Database db;
  SearchDao(this.db);

  Future<SearchResult> searchAll(String query) async {
    final q = '%$query%';

    final projectRows = await db.rawQuery('''
      SELECT p.*, uc.color_code
      FROM project p
      LEFT JOIN use_color uc ON p.project_color = uc.id
      WHERE p.name LIKE ? OR p.codename LIKE ?
      ORDER BY p.name
    ''', [q, q]);

    final objectRows = await db.rawQuery('''
      SELECT DISTINCT o.*, uc.color_code, oc.category_name, p.name AS project_name
      FROM object o
      JOIN object_category oc ON o.category_id = oc.id
      JOIN project p ON o.project_id = p.id
      LEFT JOIN use_color uc ON o.color = uc.id
      LEFT JOIN object_hashtag oh ON oh.object_id = o.id
      LEFT JOIN hashtag h ON h.id = oh.hashtag_id
      WHERE o.name LIKE ? OR h.tag_name LIKE ?
      ORDER BY o.name
    ''', [q, q]);

    final hashtagRows = await db.rawQuery('''
      SELECT h.*, uc.color_code
      FROM hashtag h
      LEFT JOIN use_color uc ON h.tag_color = uc.id
      WHERE h.tag_name LIKE ?
      ORDER BY h.tag_name
    ''', [q]);

    return SearchResult(
      projects: projectRows.map(ProjectModel.fromMap).toList(),
      objects: objectRows.map(ObjectModel.fromMap).toList(),
      hashtags: hashtagRows.map(HashtagModel.fromMap).toList(),
    );
  }
}
