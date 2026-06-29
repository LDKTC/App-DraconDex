import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sqflite/sqflite.dart';
import '../core/database/database_helper.dart';
import '../data/dao/color_dao.dart';
import '../data/dao/folder_dao.dart';
import '../data/dao/project_dao.dart';
import '../data/dao/category_dao.dart';
import '../data/dao/object_dao.dart';
import '../data/dao/timeline_dao.dart';
import '../data/dao/map_dao.dart';
import '../data/dao/relation_dao.dart';
import '../data/dao/hashtag_dao.dart';
import '../data/dao/search_dao.dart';

final databaseProvider = FutureProvider<Database>((ref) async {
  return DatabaseHelper.instance.database;
});

final colorDaoProvider = Provider<AsyncValue<ColorDao>>((ref) {
  return ref.watch(databaseProvider).whenData((db) => ColorDao(db));
});

final folderDaoProvider = Provider<AsyncValue<FolderDao>>((ref) {
  return ref.watch(databaseProvider).whenData((db) => FolderDao(db));
});

final projectDaoProvider = Provider<AsyncValue<ProjectDao>>((ref) {
  return ref.watch(databaseProvider).whenData((db) => ProjectDao(db));
});

final categoryDaoProvider = Provider<AsyncValue<CategoryDao>>((ref) {
  return ref.watch(databaseProvider).whenData((db) => CategoryDao(db));
});

final objectDaoProvider = Provider<AsyncValue<ObjectDao>>((ref) {
  return ref.watch(databaseProvider).whenData((db) => ObjectDao(db));
});

final timelineDaoProvider = Provider<AsyncValue<TimelineDao>>((ref) {
  return ref.watch(databaseProvider).whenData((db) => TimelineDao(db));
});

final mapDaoProvider = Provider<AsyncValue<MapDao>>((ref) {
  return ref.watch(databaseProvider).whenData((db) => MapDao(db));
});

final relationDaoProvider = Provider<AsyncValue<RelationDao>>((ref) {
  return ref.watch(databaseProvider).whenData((db) => RelationDao(db));
});

final hashtagDaoProvider = Provider<AsyncValue<HashtagDao>>((ref) {
  return ref.watch(databaseProvider).whenData((db) => HashtagDao(db));
});

final searchDaoProvider = Provider<AsyncValue<SearchDao>>((ref) {
  return ref.watch(databaseProvider).whenData((db) => SearchDao(db));
});
