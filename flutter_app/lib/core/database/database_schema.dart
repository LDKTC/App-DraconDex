const String createUseColor = '''
CREATE TABLE IF NOT EXISTS use_color (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  color_code TEXT UNIQUE NOT NULL,
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createProjectFolder = '''
CREATE TABLE IF NOT EXISTS project_folder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  folder_memo TEXT,
  folder_color INTEGER REFERENCES use_color(id),
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createProject = '''
CREATE TABLE IF NOT EXISTS project (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codename TEXT UNIQUE,
  name TEXT NOT NULL,
  project_memo TEXT,
  folder_id INTEGER REFERENCES project_folder(id) ON DELETE SET NULL,
  project_color INTEGER REFERENCES use_color(id),
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createProjectDescription = '''
CREATE TABLE IF NOT EXISTS project_description (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
  attribute_name TEXT,
  attribute_text TEXT,
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createObjectCategory = '''
CREATE TABLE IF NOT EXISTS object_category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT NOT NULL,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  color INTEGER REFERENCES use_color(id),
  update_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(category_name, project_id)
)''';

const String createObjectTemplate = '''
CREATE TABLE IF NOT EXISTS object_template (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES object_category(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  attribute_type TEXT DEFAULT 'text',
  display_order INTEGER DEFAULT 0,
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createObject = '''
CREATE TABLE IF NOT EXISTS object (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES object_category(id) ON DELETE CASCADE,
  color INTEGER REFERENCES use_color(id),
  note TEXT,
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createObjectAttribute = '''
CREATE TABLE IF NOT EXISTS object_attribute (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id INTEGER NOT NULL REFERENCES object(id) ON DELETE CASCADE,
  template_id INTEGER NOT NULL REFERENCES object_template(id) ON DELETE CASCADE,
  attribute_value TEXT,
  update_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(object_id, template_id)
)''';

const String createTimeline = '''
CREATE TABLE IF NOT EXISTS timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_name TEXT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  color INTEGER REFERENCES use_color(id),
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createTimelineDate = '''
CREATE TABLE IF NOT EXISTS timeline_date (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day INTEGER NOT NULL,
  month INTEGER NOT NULL,
  years INTEGER NOT NULL,
  hour INTEGER NOT NULL DEFAULT 0,
  minute INTEGER NOT NULL DEFAULT 0,
  UNIQUE(day,month,years,hour,minute)
)''';

const String createTimelineEvent = '''
CREATE TABLE IF NOT EXISTS timeline_event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timeline_id INTEGER NOT NULL REFERENCES timeline(id) ON DELETE CASCADE,
  event_name TEXT,
  start_at INTEGER NOT NULL REFERENCES timeline_date(id),
  end_at INTEGER REFERENCES timeline_date(id),
  color INTEGER REFERENCES use_color(id),
  story TEXT,
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createMap = '''
CREATE TABLE IF NOT EXISTS map (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  map_name TEXT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  color INTEGER REFERENCES use_color(id),
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createMapArea = '''
CREATE TABLE IF NOT EXISTS map_area (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  map_id INTEGER NOT NULL REFERENCES map(id) ON DELETE CASCADE,
  area_name TEXT,
  color INTEGER REFERENCES use_color(id),
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createMapPoint = '''
CREATE TABLE IF NOT EXISTS map_point (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_id INTEGER NOT NULL REFERENCES map_area(id) ON DELETE CASCADE,
  point_order INTEGER NOT NULL DEFAULT 0,
  x REAL NOT NULL,
  y REAL NOT NULL,
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createRelationType = '''
CREATE TABLE IF NOT EXISTS relation_type (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relation_name TEXT NOT NULL UNIQUE,
  color INTEGER REFERENCES use_color(id),
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createRelation = '''
CREATE TABLE IF NOT EXISTS relation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  relation_type INTEGER REFERENCES relation_type(id),
  color INTEGER REFERENCES use_color(id),
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createRelationObOb = '''
CREATE TABLE IF NOT EXISTS relation_obob (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relation_id INTEGER NOT NULL REFERENCES relation(id) ON DELETE CASCADE,
  object_from INTEGER NOT NULL REFERENCES object(id),
  object_to INTEGER NOT NULL REFERENCES object(id)
)''';

const String createRelationObTl = '''
CREATE TABLE IF NOT EXISTS relation_obtl (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relation_id INTEGER NOT NULL REFERENCES relation(id) ON DELETE CASCADE,
  object_from INTEGER NOT NULL REFERENCES object(id),
  timeline_to INTEGER NOT NULL REFERENCES timeline_event(id)
)''';

const String createRelationTlTl = '''
CREATE TABLE IF NOT EXISTS relation_tltl (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relation_id INTEGER NOT NULL REFERENCES relation(id) ON DELETE CASCADE,
  timeline_from INTEGER NOT NULL REFERENCES timeline_event(id),
  timeline_to INTEGER NOT NULL REFERENCES timeline_event(id)
)''';

const String createHashtag = '''
CREATE TABLE IF NOT EXISTS hashtag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_name TEXT NOT NULL UNIQUE,
  tag_color INTEGER REFERENCES use_color(id),
  update_at TEXT NOT NULL DEFAULT (datetime('now'))
)''';

const String createProjectHashtag = '''
CREATE TABLE IF NOT EXISTS project_hashtag (
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
  UNIQUE(project_id, hashtag_id)
)''';

const String createObjectHashtag = '''
CREATE TABLE IF NOT EXISTS object_hashtag (
  object_id INTEGER NOT NULL REFERENCES object(id) ON DELETE CASCADE,
  hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
  UNIQUE(object_id, hashtag_id)
)''';

const String createEventHashtag = '''
CREATE TABLE IF NOT EXISTS event_hashtag (
  event_id INTEGER NOT NULL REFERENCES timeline_event(id) ON DELETE CASCADE,
  hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
  UNIQUE(event_id, hashtag_id)
)''';

const List<String> defaultColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#64748b', '#a78bfa', '#34d399',
  '#fb923c', '#f472b6', '#38bdf8', '#a3e635',
];

const List<String> allCreateStatements = [
  createUseColor,
  createProjectFolder,
  createProject,
  createProjectDescription,
  createObjectCategory,
  createObjectTemplate,
  createObject,
  createObjectAttribute,
  createTimeline,
  createTimelineDate,
  createTimelineEvent,
  createMap,
  createMapArea,
  createMapPoint,
  createRelationType,
  createRelation,
  createRelationObOb,
  createRelationObTl,
  createRelationTlTl,
  createHashtag,
  createProjectHashtag,
  createObjectHashtag,
  createEventHashtag,
];
