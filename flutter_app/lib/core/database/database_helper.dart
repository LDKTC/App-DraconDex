import 'dart:io';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'database_schema.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._();
  static Database? _db;

  DatabaseHelper._();

  Future<Database> get database async {
    _db ??= await _open();
    return _db!;
  }

  Future<String> get databasePath async {
    final dir = await getApplicationDocumentsDirectory();
    return join(dir.path, 'novel-manager.db');
  }

  Future<Database> _open() async {
    final path = await databasePath;
    return openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
      onConfigure: _onConfigure,
      onOpen: _onOpen,
    );
  }

  // Runs on every open (fresh or existing). Idempotent ensure-step for tables
  // added after the initial schema — notably the Navigator (v2.5.2 "World")
  // module — since the DB version is pinned at 1 and onCreate won't re-run.
  Future<void> _onOpen(Database db) async {
    for (final sql in worldCreateStatements) {
      await db.execute(sql);
    }
  }

  Future<void> _onConfigure(Database db) async {
    await db.execute('PRAGMA foreign_keys = ON');
    await db.execute('PRAGMA journal_mode = WAL');
    await db.execute('PRAGMA busy_timeout = 5000');
  }

  Future<void> _onCreate(Database db, int version) async {
    for (final sql in allCreateStatements) {
      await db.execute(sql);
    }
    await _seedDefaultColors(db);
    await _runMigrations(db);
  }

  Future<void> _seedDefaultColors(Database db) async {
    for (final code in defaultColors) {
      await db.execute(
        'INSERT OR IGNORE INTO use_color (color_code) VALUES (?)',
        [code],
      );
    }
  }

  Future<void> _runMigrations(Database db) async {
    final cols = await db.rawQuery('PRAGMA table_info(relation_type)');
    final hasColor = cols.any((c) => c['name'] == 'color');
    if (!hasColor) {
      try {
        await db.execute('ALTER TABLE relation_type ADD COLUMN color INTEGER REFERENCES use_color(id)');
      } catch (_) {}
    }

    final eventCols = await db.rawQuery('PRAGMA table_info(timeline_event)');
    final hasStory = eventCols.any((c) => c['name'] == 'story');
    if (!hasStory) {
      await db.execute('ALTER TABLE timeline_event ADD COLUMN story TEXT');
    }

    final objCols = await db.rawQuery('PRAGMA table_info(object)');
    final hasNote = objCols.any((c) => c['name'] == 'note');
    if (!hasNote) {
      try {
        await db.execute('ALTER TABLE object ADD COLUMN note TEXT');
      } catch (_) {}
    }
  }

  Future<void> close() async {
    final db = _db;
    if (db != null) {
      await db.close();
      _db = null;
    }
  }

  Future<void> checkpoint() async {
    final db = await database;
    await db.rawQuery('PRAGMA wal_checkpoint(FULL)');
  }

  Future<String> exportToTemp() async {
    await checkpoint();
    final dbPath = await databasePath;
    final tempDir = await getTemporaryDirectory();
    final now = DateTime.now();
    final stamp = '${now.year}-${now.month.toString().padLeft(2,'0')}-${now.day.toString().padLeft(2,'0')}';
    final exportPath = join(tempDir.path, 'dracondex-backup-$stamp.db');
    await File(dbPath).copy(exportPath);
    return exportPath;
  }
}
