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
  String get moduleDirector => 'Director';

  @override
  String get moduleProjects => '프로젝트';

  @override
  String get moduleTimeline => '타임라인';

  @override
  String get moduleRelations => '관계';

  @override
  String get moduleMap => '맵';

  @override
  String get moduleTags => '프로젝트 태그';

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
  String get labelCodename => '코드명';

  @override
  String get labelMemo => '메모';

  @override
  String get labelColor => '색상';

  @override
  String get labelNote => '노트';

  @override
  String get labelFolder => '폴더';

  @override
  String get labelCategory => '카테고리';

  @override
  String get labelType => '유형';

  @override
  String get labelField => '필드';

  @override
  String get labelStory => '스토리';

  @override
  String get labelTags => '태그';

  @override
  String get labelSearch => '검색...';

  @override
  String get newFolder => '새 폴더';

  @override
  String get newProject => '새 프로젝트';

  @override
  String get newCategory => '새 카테고리';

  @override
  String get newObject => '새 캐릭터';

  @override
  String get newTimeline => '새 타임라인';

  @override
  String get newEvent => '새 이벤트';

  @override
  String get newMap => '새 맵';

  @override
  String get newArea => '새 구역';

  @override
  String get newRelation => '새 관계';

  @override
  String get newRelationType => '새 관계 유형';

  @override
  String get newHashtag => '새 태그';

  @override
  String get noProjects => '프로젝트가 없습니다. 만들어 보세요!';

  @override
  String get noObjects => '이 카테고리에 캐릭터가 없습니다.';

  @override
  String get noTimelines => '타임라인이 없습니다.';

  @override
  String get noEvents => '이 타임라인에 이벤트가 없습니다.';

  @override
  String get noMaps => '맵이 없습니다.';

  @override
  String get noAreas => '이 맵에 구역이 없습니다.';

  @override
  String get noRelations => '관계가 없습니다.';

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
  String get searchHint => '프로젝트, 캐릭터, 태그 검색...';

  @override
  String get searchProjects => '프로젝트';

  @override
  String get searchObjects => '캐릭터';

  @override
  String get searchTags => '태그';

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
  String get relOBOB => '캐릭터 ↔ 캐릭터';

  @override
  String get relOBTL => '캐릭터 ↔ 이벤트';

  @override
  String get relTLTL => '이벤트 ↔ 이벤트';

  @override
  String get startDate => '시작일';

  @override
  String get endDate => '종료일';

  @override
  String get year => '년';

  @override
  String get month => '월';

  @override
  String get day => '일';

  @override
  String get hour => '시';

  @override
  String get minute => '분';

  @override
  String get unfiledProjects => '미분류';

  @override
  String get selectColor => '색상 선택';

  @override
  String get recentColors => '최근 사용';

  @override
  String get listView => '목록 보기';

  @override
  String get tableView => '테이블 보기';

  @override
  String get fields => '필드';

  @override
  String get fromObj => '에서';

  @override
  String get toObj => '으로';

  @override
  String get relationTypeName => '관계 유형';

  @override
  String get addField => '필드 추가';

  @override
  String get objectNote => '노트';

  @override
  String get eventStory => '스토리';

  @override
  String get mapTool => '도구';

  @override
  String get mapToolMove => '이동';

  @override
  String get mapToolCreate => '포인트 추가';

  @override
  String get mapToolDelete => '포인트 삭제';

  @override
  String get version => '버전 2.1.0';
}
