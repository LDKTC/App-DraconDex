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
  String get labelMemo => 'メモ';

  @override
  String get labelColor => 'カラー';

  @override
  String get labelNote => 'ノート';

  @override
  String get labelTags => 'タグ';

  @override
  String get labelSearch => '検索...';

  @override
  String get newHashtag => '新しいタグ';

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
  String get selectColor => 'カラーを選択';

  @override
  String get recentColors => '最近使用';

  @override
  String get version => 'バージョン 2.1.0';

  @override
  String get btnRename => '名前を変更';

  @override
  String get btnPin => 'ピン留め';

  @override
  String get btnUnpin => 'ピン留め解除';

  @override
  String get newNexusTitle => '新しいNexus';

  @override
  String get renameNexusTitle => 'Nexus名を変更';

  @override
  String get newModuleTitle => '新しいモジュール';

  @override
  String get renameModuleTitle => 'モジュール名を変更';

  @override
  String get newModuleTooltip => '新しいモジュール';

  @override
  String get newNexusTooltip => '新しいNexus';

  @override
  String get emptyNexusMessage => 'まだNexusがありません。+をタップして作成しましょう。';

  @override
  String get emptyModuleMessage => '空です。+をタップしてモジュールを追加してください。';

  @override
  String get deleteNexusMessage => '内部のすべてのモジュールも削除されます。この操作は取り消せません。';

  @override
  String get deleteModuleMessage => 'その中に入れ子になっているモジュールもすべて削除されます。この操作は取り消せません。';

  @override
  String get labelKind => '種類';

  @override
  String get kindContentUnavailable => 'このモジュール種類はモバイルではまだ完全に対応していません — 下の共有メモ欄を使用します。';

  @override
  String get notesHint => 'このモジュールのメモ…';

  @override
  String get settingsAppearance => '外観';

  @override
  String get settingsData => 'データ';

  @override
  String get settingsAbout => '情報';

  @override
  String get exportDbTitle => 'データベースをエクスポート';

  @override
  String get exportDbSubtitle => '.dbファイルを共有してPCや他の端末にデータを移動します';

  @override
  String get importDbTitle => 'データベースをインポート';

  @override
  String get importDbSubtitle => 'DraconDexの.dbファイルからデータを統合します';

  @override
  String get checkUpdatesTitle => 'アップデートを確認';

  @override
  String get checkUpdatesSubtitle => 'このプロジェクトのGitHub Releasesを確認します — 自動的にインストールされることはありません';

  @override
  String get upToDateMessage => '最新バージョンです。';

  @override
  String get importingMessage => 'インポート中…';

  @override
  String get importCompleteMessage => 'インポートが完了しました。';

  @override
  String get importFailedMessage => 'インポートに失敗しました。';

  @override
  String get exportFailedMessage => 'エクスポートに失敗しました。';

  @override
  String get addColorTitle => '色を追加';

  @override
  String get colorPaletteTitle => 'カラーパレット';

  @override
  String get hashtagsTitle => 'タグ';

  @override
  String get editHashtagTitle => 'タグを編集';

  @override
  String get tagNameLabel => 'タグ名';

  @override
  String get removeColorConfirmTitle => 'この色を削除しますか?';

  @override
  String get deleteHashtagConfirmTitle => 'このタグを削除しますか?';
}
