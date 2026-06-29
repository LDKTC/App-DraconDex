// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Japanese (`ja`).
class AppLocalizationsJa extends AppLocalizations {
  AppLocalizationsJa([String locale = 'ja']) : super(locale);

  @override
  String get appName => 'DraconDex';

  @override
  String get nexusTitle => 'DraconDex';

  @override
  String get nexusSubtitle => '小説データ管理';

  @override
  String get moduleDirector => 'Director';

  @override
  String get moduleProjects => 'プロジェクト';

  @override
  String get moduleTimeline => 'タイムライン';

  @override
  String get moduleRelations => '関係';

  @override
  String get moduleMap => 'マップ';

  @override
  String get moduleTags => 'プロジェクトタグ';

  @override
  String get moduleGlobalTags => 'タグ';

  @override
  String get moduleColors => 'カラー';

  @override
  String get moduleSettings => '設定';

  @override
  String get btnNew => '新規';

  @override
  String get btnSave => '保存';

  @override
  String get btnCancel => 'キャンセル';

  @override
  String get btnDelete => '削除';

  @override
  String get btnEdit => '編集';

  @override
  String get btnClose => '閉じる';

  @override
  String get btnAdd => '追加';

  @override
  String get btnImport => 'DBインポート';

  @override
  String get btnExport => 'DBエクスポート';

  @override
  String get labelName => '名前';

  @override
  String get labelCodename => 'コードネーム';

  @override
  String get labelMemo => 'メモ';

  @override
  String get labelColor => 'カラー';

  @override
  String get labelNote => 'ノート';

  @override
  String get labelFolder => 'フォルダー';

  @override
  String get labelCategory => 'カテゴリ';

  @override
  String get labelType => 'タイプ';

  @override
  String get labelField => 'フィールド';

  @override
  String get labelStory => 'ストーリー';

  @override
  String get labelTags => 'タグ';

  @override
  String get labelSearch => '検索...';

  @override
  String get newFolder => '新しいフォルダー';

  @override
  String get newProject => '新しいプロジェクト';

  @override
  String get newCategory => '新しいカテゴリ';

  @override
  String get newObject => '新しいキャラクター';

  @override
  String get newTimeline => '新しいタイムライン';

  @override
  String get newEvent => '新しいイベント';

  @override
  String get newMap => '新しいマップ';

  @override
  String get newArea => '新しいエリア';

  @override
  String get newRelation => '新しい関係';

  @override
  String get newRelationType => '新しい関係タイプ';

  @override
  String get newHashtag => '新しいタグ';

  @override
  String get noProjects => 'プロジェクトがありません。作成してください。';

  @override
  String get noObjects => 'このカテゴリにキャラクターがいません。';

  @override
  String get noTimelines => 'タイムラインがありません。';

  @override
  String get noEvents => 'このタイムラインにイベントがありません。';

  @override
  String get noMaps => 'マップがありません。';

  @override
  String get noAreas => 'このマップにエリアがありません。';

  @override
  String get noRelations => '関係がありません。';

  @override
  String get noTags => 'タグがありません。';

  @override
  String get noColors => 'カラーパレットが空です。';

  @override
  String get noResults => '結果が見つかりません。';

  @override
  String get confirmDeleteTitle => '削除の確認';

  @override
  String get confirmDeleteMessage => 'この操作は元に戻せません。';

  @override
  String get colorInUse => 'このカラーは使用中のため削除できません。';

  @override
  String get searchHint => 'プロジェクト、キャラクター、タグを検索...';

  @override
  String get searchProjects => 'プロジェクト';

  @override
  String get searchObjects => 'キャラクター';

  @override
  String get searchTags => 'タグ';

  @override
  String get themeLabel => 'テーマ';

  @override
  String get themeMidnight => 'Midnight';

  @override
  String get themeMoonlight => 'Moonlight';

  @override
  String get themeDaylight => 'Daylight';

  @override
  String get languageLabel => '言語';

  @override
  String get uiScaleLabel => 'UIスケール';

  @override
  String get importSuccess => 'データベースをインポートしました。';

  @override
  String get importFailed => 'インポートに失敗しました。ファイルを確認してください。';

  @override
  String get exportSuccess => 'データベースをエクスポートしました。';

  @override
  String get relOBOB => 'キャラクター ↔ キャラクター';

  @override
  String get relOBTL => 'キャラクター ↔ イベント';

  @override
  String get relTLTL => 'イベント ↔ イベント';

  @override
  String get startDate => '開始日';

  @override
  String get endDate => '終了日';

  @override
  String get year => '年';

  @override
  String get month => '月';

  @override
  String get day => '日';

  @override
  String get hour => '時間';

  @override
  String get minute => '分';

  @override
  String get unfiledProjects => '未分類';

  @override
  String get selectColor => 'カラーを選択';

  @override
  String get recentColors => '最近使用';

  @override
  String get listView => 'リスト表示';

  @override
  String get tableView => 'テーブル表示';

  @override
  String get fields => 'フィールド';

  @override
  String get fromObj => 'から';

  @override
  String get toObj => 'へ';

  @override
  String get relationTypeName => '関係タイプ';

  @override
  String get addField => 'フィールドを追加';

  @override
  String get objectNote => 'ノート';

  @override
  String get eventStory => 'ストーリー';

  @override
  String get mapTool => 'ツール';

  @override
  String get mapToolMove => '移動';

  @override
  String get mapToolCreate => 'ポイント追加';

  @override
  String get mapToolDelete => 'ポイント削除';

  @override
  String get version => 'バージョン 2.1.0';
}
