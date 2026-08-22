// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Korean (`ko`).
class AppLocalizationsKo extends AppLocalizations {
  AppLocalizationsKo([String locale = 'ko']) : super(locale);

  @override
  String get appName => 'DraconDex';

  @override
  String get nexusTitle => 'DraconDex';

  @override
  String get nexusSubtitle => '소설 데이터 관리';

  @override
  String get moduleGlobalTags => '태그';

  @override
  String get moduleColors => '색상';

  @override
  String get moduleSettings => '설정';

  @override
  String get btnNew => '새로 만들기';

  @override
  String get btnSave => '저장';

  @override
  String get btnCancel => '취소';

  @override
  String get btnDelete => '삭제';

  @override
  String get btnEdit => '편집';

  @override
  String get btnClose => '닫기';

  @override
  String get btnAdd => '추가';

  @override
  String get btnImport => 'DB 가져오기';

  @override
  String get btnExport => 'DB 내보내기';

  @override
  String get labelName => '이름';

  @override
  String get labelMemo => '메모';

  @override
  String get labelColor => '색상';

  @override
  String get labelNote => '노트';

  @override
  String get labelTags => '태그';

  @override
  String get labelSearch => '검색...';

  @override
  String get newHashtag => '새 태그';

  @override
  String get noTags => '태그가 없습니다.';

  @override
  String get noColors => '색상 팔레트가 비어 있습니다.';

  @override
  String get noResults => '결과를 찾을 수 없습니다.';

  @override
  String get confirmDeleteTitle => '삭제 확인';

  @override
  String get confirmDeleteMessage => '이 작업은 되돌릴 수 없습니다.';

  @override
  String get colorInUse => '이 색상은 사용 중이므로 삭제할 수 없습니다.';

  @override
  String get themeLabel => '테마';

  @override
  String get themeMidnight => 'Midnight';

  @override
  String get themeMoonlight => 'Moonlight';

  @override
  String get themeDaylight => 'Daylight';

  @override
  String get languageLabel => '언어';

  @override
  String get uiScaleLabel => 'UI 크기';

  @override
  String get importSuccess => '데이터베이스를 가져왔습니다.';

  @override
  String get importFailed => '가져오기 실패. 파일을 확인해 주세요.';

  @override
  String get exportSuccess => '데이터베이스를 내보냈습니다.';

  @override
  String get selectColor => '색상 선택';

  @override
  String get recentColors => '최근 사용';

  @override
  String get version => '버전 2.1.0';

  @override
  String get btnRename => '이름 바꾸기';

  @override
  String get btnPin => '고정';

  @override
  String get btnUnpin => '고정 해제';

  @override
  String get newNexusTitle => '새 Nexus';

  @override
  String get renameNexusTitle => 'Nexus 이름 바꾸기';

  @override
  String get newModuleTitle => '새 모듈';

  @override
  String get renameModuleTitle => '모듈 이름 바꾸기';

  @override
  String get newModuleTooltip => '새 모듈';

  @override
  String get newNexusTooltip => '새 Nexus';

  @override
  String get emptyNexusMessage => '아직 Nexus가 없습니다. +를 눌러 만들어보세요.';

  @override
  String get emptyModuleMessage => '비어 있습니다. +를 눌러 모듈을 추가하세요.';

  @override
  String get deleteNexusMessage => '내부의 모든 모듈이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.';

  @override
  String get deleteModuleMessage => '내부에 중첩된 모든 모듈도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.';

  @override
  String get labelKind => '종류';

  @override
  String get kindContentUnavailable => '이 모듈 종류는 모바일에서 아직 완전히 지원되지 않습니다 — 아래 공용 메모 필드를 대신 사용합니다.';

  @override
  String get notesHint => '이 모듈에 대한 메모…';

  @override
  String get settingsAppearance => '화면';

  @override
  String get settingsData => '데이터';

  @override
  String get settingsAbout => '정보';

  @override
  String get exportDbTitle => '데이터베이스 내보내기';

  @override
  String get exportDbSubtitle => '.db 파일을 공유하여 PC나 다른 기기로 데이터를 옮기세요';

  @override
  String get importDbTitle => '데이터베이스 가져오기';

  @override
  String get importDbSubtitle => 'DraconDex .db 파일에서 데이터를 병합합니다';

  @override
  String get checkUpdatesTitle => '업데이트 확인';

  @override
  String get checkUpdatesSubtitle => '이 프로젝트의 GitHub Releases를 확인합니다 — 자동으로 설치되지 않습니다';

  @override
  String get upToDateMessage => '최신 버전을 사용 중입니다.';

  @override
  String get importingMessage => '가져오는 중…';

  @override
  String get importCompleteMessage => '가져오기 완료.';

  @override
  String get importFailedMessage => '가져오기 실패.';

  @override
  String get exportFailedMessage => '내보내기 실패.';

  @override
  String get addColorTitle => '색상 추가';

  @override
  String get colorPaletteTitle => '색상 팔레트';

  @override
  String get hashtagsTitle => '태그';

  @override
  String get editHashtagTitle => '태그 편집';

  @override
  String get tagNameLabel => '태그 이름';

  @override
  String get removeColorConfirmTitle => '색상을 삭제할까요?';

  @override
  String get deleteHashtagConfirmTitle => '태그를 삭제할까요?';
}
