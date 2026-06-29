'use strict';

const I = {
  book: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  projects: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  return: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>`,
  timeline: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  relation: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  map: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>`,
  hashtag: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
  import: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  export: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  colors: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg>`,
  edit: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  delete: `<svg class="icon icon-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  move: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
  folder: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  plus: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  close: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  search: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  star: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  pin: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.5A2 2 0 0 1 15 9.26V5a3 3 0 0 0-6 0v4.26a2 2 0 0 1-.78 1.24l-2.78 3.5a2 2 0 0 0-.44 1.24z"/></svg>`,
  fields: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
  settings: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  list: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  table: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="10" y1="9" x2="10" y2="21"/></svg>`,
  director: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 3.9"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>`,
  globe: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  person: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  layer: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  navigator: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  sword: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>`,
  hero: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>`,
  item: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  story: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  func: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
};

const UI_SETTINGS_KEY = 'novel-manager-ui-settings';
const LEFT_PANEL_COLLAPSED_KEY = 'novel-manager-left-panel-collapsed';
const UI_THEME_OPTIONS = ['daylight','moonlight','midnight'];
const UI_LANGUAGE_OPTIONS = ['en','ja','ko','th','zh'];
const UI_SIZE_MIN = 50;
const UI_SIZE_MAX = 200;
const UI_SIZE_STEP = 5;
const L = {
  en: {
    settings:'Settings', theme:'Theme', language:'Language', uiSize:'UI Size',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    openProject:'Open project', closeTab:'Close tab', minimize:'Minimize', maximize:'Maximize', close:'Close',
    collapsePanel:'Collapse panel', openPanel:'Open panel',
    projects:'Projects', timeline:'Timeline', relation:'Relations', map:'Mapping', hashtag:'Tags', colors:'Colors',
    importDb:'Import DB', exportDb:'Export DB', search:'Search...',
    newFolder:'New folder', newProject:'New project', createProject:'Create project',
    welcomeTitle:'Novel Manager', welcomeText:'Select a project from the list, or create a new one.',
    colorPanel:'Colors', saved:'Saved', deleted:'Deleted', created:'Created', applied:'Applied',
    nexus:'Nexus', director:'Director', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'Choose a module to get started.',
    navigator:'Navigator', world:'World', worldNew:'New World', worldChars:'Characters', worldCats:'Categories',
    worldMaps:'Maps', worldMapTimelines:'Map Timelines', worldOverview:'Overview', worldLinkedNovels:'Linked Novels',
    worldTags:'Tags', worldCharNew:'New Character', worldCatNew:'New Category', worldMapNew:'New Map',
    worldMaptlNew:'New Timeline', worldEventNew:'New Event', worldObjNew:'New Object',
    worldCharLink:'Link to Novel Object', worldCatLink:'Link to Novel Category', worldMapLink:'Link to Novel Map',
    noLink:'Not linked',
    hero:'Hero', game:'Game', gameNew:'New Game', gameChars:'Characters', gameItems:'Items',
    gameStory:'Story', gameFunctions:'Functions', gameTags:'Tags', gameOverview:'Overview',
    gameCharNew:'New Character', gameItemCatNew:'New Item Category', gameItemNew:'New Item',
    gameStoryNew:'New Story', gameFuncCatNew:'New Function Category', gameFuncNew:'New Function',
    gameStats:'Stats', gameLevelup:'Level-up', gameNovelLink:'Linked Novel',
    gameDialogue:'Dialogue', gameDialogueNew:'New Node', gameLine:'Line', gameLineNew:'New Line',
    gameCondition:'Condition', gameEffects:'Effects'
  },
  ja: {
    settings:'設定', theme:'テーマ', language:'言語', uiSize:'UIサイズ',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    openProject:'プロジェクトを開く', closeTab:'タブを閉じる', minimize:'最小化', maximize:'最大化', close:'閉じる',
    collapsePanel:'パネルを折りたたむ', openPanel:'パネルを開く',
    projects:'プロジェクト', timeline:'タイムライン', relation:'関係', map:'マッピング', hashtag:'タグ', colors:'色',
    importDb:'DBをインポート', exportDb:'DBをエクスポート', search:'検索...',
    newFolder:'新規フォルダー', newProject:'新規プロジェクト', createProject:'プロジェクト作成',
    welcomeTitle:'Novel Manager', welcomeText:'左の一覧からプロジェクトを選ぶか、新しく作成してください。',
    colorPanel:'色', saved:'保存しました', deleted:'削除しました', created:'作成しました', applied:'適用しました',
    nexus:'Nexus', director:'ディレクター', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'モジュールを選択してください。',
    navigator:'ナビゲーター', world:'ワールド', worldNew:'新規ワールド', worldChars:'キャラクター', worldCats:'カテゴリー',
    worldMaps:'マップ', worldMapTimelines:'マップタイムライン', worldOverview:'概要', worldLinkedNovels:'リンク済み小説',
    worldTags:'タグ', worldCharNew:'新規キャラクター', worldCatNew:'新規カテゴリー', worldMapNew:'新規マップ',
    worldMaptlNew:'新規タイムライン', worldEventNew:'新規イベント', worldObjNew:'新規オブジェクト',
    worldCharLink:'小説オブジェクトにリンク', worldCatLink:'小説カテゴリーにリンク', worldMapLink:'小説マップにリンク',
    noLink:'リンクなし',
    hero:'ヒーロー', game:'ゲーム', gameNew:'新規ゲーム', gameChars:'キャラクター', gameItems:'アイテム',
    gameStory:'ストーリー', gameFunctions:'機能', gameTags:'タグ', gameOverview:'概要',
    gameCharNew:'新規キャラクター', gameItemCatNew:'新規アイテムカテゴリー', gameItemNew:'新規アイテム',
    gameStoryNew:'新規ストーリー', gameFuncCatNew:'新規機能カテゴリー', gameFuncNew:'新規機能',
    gameStats:'ステータス', gameLevelup:'レベルアップ', gameNovelLink:'リンク済み小説',
    gameDialogue:'ダイアログ', gameDialogueNew:'新規ノード', gameLine:'セリフ', gameLineNew:'新規セリフ',
    gameCondition:'条件', gameEffects:'効果'
  },
  ko: {
    settings:'설정', theme:'테마', language:'언어', uiSize:'UI 크기',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    openProject:'프로젝트 열기', closeTab:'탭 닫기', minimize:'최소화', maximize:'최대화', close:'닫기',
    collapsePanel:'패널 접기', openPanel:'패널 열기',
    projects:'프로젝트', timeline:'타임라인', relation:'관계', map:'매핑', hashtag:'태그', colors:'색상',
    importDb:'DB 가져오기', exportDb:'DB 내보내기', search:'검색...',
    newFolder:'새 폴더', newProject:'새 프로젝트', createProject:'프로젝트 만들기',
    welcomeTitle:'Novel Manager', welcomeText:'왼쪽 목록에서 프로젝트를 선택하거나 새 프로젝트를 만드세요.',
    colorPanel:'색상', saved:'저장됨', deleted:'삭제됨', created:'생성됨', applied:'적용됨',
    nexus:'Nexus', director:'디렉터', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'모듈을 선택하세요.',
    navigator:'네비게이터', world:'세계', worldNew:'새 세계', worldChars:'캐릭터', worldCats:'카테고리',
    worldMaps:'맵', worldMapTimelines:'맵 타임라인', worldOverview:'개요', worldLinkedNovels:'연결된 소설',
    worldTags:'태그', worldCharNew:'새 캐릭터', worldCatNew:'새 카테고리', worldMapNew:'새 맵',
    worldMaptlNew:'새 타임라인', worldEventNew:'새 이벤트', worldObjNew:'새 오브젝트',
    worldCharLink:'소설 오브젝트에 연결', worldCatLink:'소설 카테고리에 연결', worldMapLink:'소설 맵에 연결',
    noLink:'연결 없음',
    hero:'히어로', game:'게임', gameNew:'새 게임', gameChars:'캐릭터', gameItems:'아이템',
    gameStory:'스토리', gameFunctions:'기능', gameTags:'태그', gameOverview:'개요',
    gameCharNew:'새 캐릭터', gameItemCatNew:'새 아이템 카테고리', gameItemNew:'새 아이템',
    gameStoryNew:'새 스토리', gameFuncCatNew:'새 기능 카테고리', gameFuncNew:'새 기능',
    gameStats:'스탯', gameLevelup:'레벨업', gameNovelLink:'연결된 소설',
    gameDialogue:'다이얼로그', gameDialogueNew:'새 노드', gameLine:'대사', gameLineNew:'새 대사',
    gameCondition:'조건', gameEffects:'효과'
  },
  th: {
    settings:'ตั้งค่า', theme:'ธีม', language:'ภาษา', uiSize:'ขนาด UI',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    openProject:'เปิดโปรเจกต์', closeTab:'ปิดแท็บ', minimize:'ย่อหน้าต่าง', maximize:'ขยายหน้าต่าง', close:'ปิด',
    collapsePanel:'พับ Panel', openPanel:'เปิด Panel',
    projects:'โปรเจกต์', timeline:'Timeline', relation:'ความสัมพันธ์', map:'Mapping', hashtag:'ป้ายกำกับ', colors:'สี',
    importDb:'Import DB', exportDb:'Export DB', search:'ค้นหา...',
    newFolder:'สร้างโฟลเดอร์ใหม่', newProject:'สร้างโปรเจกต์ใหม่', createProject:'สร้างโปรเจกต์ใหม่',
    welcomeTitle:'Novel Manager', welcomeText:'เลือกโปรเจกต์จากรายการทางซ้าย หรือสร้างโปรเจกต์ใหม่',
    colorPanel:'สี', saved:'บันทึกแล้ว', deleted:'ลบแล้ว', created:'สร้างแล้ว', applied:'ปรับใช้แล้ว',
    nexus:'Nexus', director:'Director', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'เลือกโมดูลที่ต้องการใช้งาน',
    navigator:'Navigator', world:'โลก', worldNew:'สร้างโลกใหม่', worldChars:'ตัวละคร', worldCats:'หมวดหมู่',
    worldMaps:'แผนที่', worldMapTimelines:'ไทม์ไลน์แผนที่', worldOverview:'ภาพรวม', worldLinkedNovels:'นิยายที่เชื่อมต่อ',
    worldTags:'แท็ก', worldCharNew:'เพิ่มตัวละคร', worldCatNew:'เพิ่มหมวดหมู่', worldMapNew:'เพิ่มแผนที่',
    worldMaptlNew:'เพิ่มไทม์ไลน์', worldEventNew:'เพิ่มเหตุการณ์', worldObjNew:'เพิ่มรายการ',
    worldCharLink:'เชื่อมกับตัวละครในนิยาย', worldCatLink:'เชื่อมกับหมวดหมู่ในนิยาย', worldMapLink:'เชื่อมกับแผนที่ในนิยาย',
    noLink:'ยังไม่เชื่อมต่อ',
    hero:'Hero', game:'เกม', gameNew:'สร้างเกมใหม่', gameChars:'ตัวละคร', gameItems:'ไอเทม',
    gameStory:'เนื้อเรื่อง', gameFunctions:'ฟังก์ชัน', gameTags:'แท็ก', gameOverview:'ภาพรวม',
    gameCharNew:'เพิ่มตัวละคร', gameItemCatNew:'เพิ่มหมวดหมู่ไอเทม', gameItemNew:'เพิ่มไอเทม',
    gameStoryNew:'เพิ่มเนื้อเรื่อง', gameFuncCatNew:'เพิ่มหมวดหมู่ฟังก์ชัน', gameFuncNew:'เพิ่มฟังก์ชัน',
    gameStats:'สถิติ', gameLevelup:'เลเวลอัพ', gameNovelLink:'นิยายที่เชื่อมต่อ',
    gameDialogue:'บทสนทนา', gameDialogueNew:'โหนดใหม่', gameLine:'บทพูด', gameLineNew:'เพิ่มบทพูด',
    gameCondition:'เงื่อนไข', gameEffects:'ผลลัพธ์'
  },
  zh: {
    settings:'设置', theme:'主题', language:'语言', uiSize:'界面大小',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    openProject:'打开项目', closeTab:'关闭标签', minimize:'最小化', maximize:'最大化', close:'关闭',
    collapsePanel:'收起面板', openPanel:'打开面板',
    projects:'项目', timeline:'时间线', relation:'关系', map:'映射', hashtag:'标签', colors:'颜色',
    importDb:'导入 DB', exportDb:'导出 DB', search:'搜索...',
    newFolder:'新建文件夹', newProject:'新建项目', createProject:'创建项目',
    welcomeTitle:'Novel Manager', welcomeText:'从左侧列表选择项目，或创建一个新项目。',
    colorPanel:'颜色', saved:'已保存', deleted:'已删除', created:'已创建', applied:'已应用',
    nexus:'Nexus', director:'Director', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'选择一个模块以开始。',
    navigator:'Navigator', world:'世界', worldNew:'新建世界', worldChars:'角色', worldCats:'类别',
    worldMaps:'地图', worldMapTimelines:'地图时间线', worldOverview:'概览', worldLinkedNovels:'关联小说',
    worldTags:'标签', worldCharNew:'新建角色', worldCatNew:'新建类别', worldMapNew:'新建地图',
    worldMaptlNew:'新建时间线', worldEventNew:'新建事件', worldObjNew:'新建对象',
    worldCharLink:'链接到小说对象', worldCatLink:'链接到小说类别', worldMapLink:'链接到小说地图',
    noLink:'未链接',
    hero:'英雄', game:'游戏', gameNew:'新建游戏', gameChars:'角色', gameItems:'物品',
    gameStory:'剧情', gameFunctions:'功能', gameTags:'标签', gameOverview:'概览',
    gameCharNew:'新建角色', gameItemCatNew:'新建物品类别', gameItemNew:'新建物品',
    gameStoryNew:'新建剧情', gameFuncCatNew:'新建功能类别', gameFuncNew:'新建功能',
    gameStats:'属性', gameLevelup:'升级', gameNovelLink:'关联小说',
    gameDialogue:'对话', gameDialogueNew:'新建节点', gameLine:'台词', gameLineNew:'新建台词',
    gameCondition:'条件', gameEffects:'效果'
  }
};
const LANGUAGE_LABELS = { en:'ENG - English', ja:'JP - 日本語', ko:'KR - 한국어', th:'TH - ไทย', zh:'CN - 中文' };
const COMMON_UI_TEXT = {
  'ยกเลิก': { en:'Cancel', ja:'キャンセル', ko:'취소', zh:'取消' },
  'บันทึก': { en:'Save', ja:'保存', ko:'저장', zh:'保存' },
  'สร้าง': { en:'Create', ja:'作成', ko:'생성', zh:'创建' },
  'ลบ': { en:'Delete', ja:'削除', ko:'삭제', zh:'删除' },
  'แก้ไข': { en:'Edit', ja:'編集', ko:'수정', zh:'编辑' },
  'เพิ่ม': { en:'Add', ja:'追加', ko:'추가', zh:'添加' },
  'จัดการ': { en:'Manage', ja:'管理', ko:'관리', zh:'管理' },
  'ชื่อ *': { en:'Name *', ja:'名前 *', ko:'이름 *', zh:'名称 *' },
  'ชื่อ': { en:'Name', ja:'名前', ko:'이름', zh:'名称' },
  'รายละเอียด': { en:'Details', ja:'詳細', ko:'상세', zh:'详情' },
  'สี': { en:'Color', ja:'色', ko:'색상', zh:'颜色' },
  'โปรเจกต์': { en:'Projects', ja:'プロジェクト', ko:'프로젝트', zh:'项目' },
  'สร้างโปรเจกต์ใหม่': { en:'New project', ja:'新規プロジェクト', ko:'새 프로젝트', zh:'新建项目' },
  'สร้างโฟลเดอร์ใหม่': { en:'New folder', ja:'新規フォルダー', ko:'새 폴더', zh:'新建文件夹' },
  'โปรเจกต์ใหม่': { en:'New project', ja:'新規プロジェクト', ko:'새 프로젝트', zh:'新建项目' },
  'โฟลเดอร์ใหม่': { en:'New folder', ja:'新規フォルダー', ko:'새 폴더', zh:'新建文件夹' },
  'ป้ายกำกับ': { en:'Tags', ja:'タグ', ko:'태그', zh:'标签' },
  'ความสัมพันธ์': { en:'Relations', ja:'関係', ko:'관계', zh:'关系' },
  'บันทึกเรียบร้อยแล้ว': { en:'Saved', ja:'保存しました', ko:'저장됨', zh:'已保存' },
  'ลบเรียบร้อยแล้ว': { en:'Deleted', ja:'削除しました', ko:'삭제됨', zh:'已删除' },
  'สร้างแล้ว': { en:'Created', ja:'作成しました', ko:'생성됨', zh:'已创建' },
  'ใช้ล่าสุด': { en:'Recently used', ja:'最近使用', ko:'최근 사용', zh:'最近使用' },
  'สีทั้งหมด': { en:'All colors', ja:'すべての色', ko:'모든 색상', zh:'所有颜色' },
  'ยังไม่มีประวัติการใช้สี': { en:'No color history', ja:'色の使用履歴なし', ko:'색상 기록 없음', zh:'无颜色记录' },
  'เพิ่มสีใหม่': { en:'Add color', ja:'色を追加', ko:'색상 추가', zh:'添加颜色' },
  'เลือกสี': { en:'Select color', ja:'色を選択', ko:'색상 선택', zh:'选择颜色' },
  'ไม่มีชื่อ': { en:'Untitled', ja:'名前なし', ko:'이름 없음', zh:'无标题' },
  'ป้ายกำกับ (Tags)': { en:'Tags', ja:'タグ', ko:'태그', zh:'标签' },
  'พิมพ์ค้นหา Tag...': { en:'Search tag...', ja:'タグを検索...', ko:'태그 검색...', zh:'搜索标签...' },
  'ไม่มี Tag ให้เลือก': { en:'No tags available', ja:'タグなし', ko:'태그 없음', zh:'无可用标签' },
  'ชื่อ Timeline *': { en:'Timeline name *', ja:'タイムライン名 *', ko:'타임라인 이름 *', zh:'时间线名称 *' },
  'วันที่เริ่มต้น *': { en:'Start date *', ja:'開始日 *', ko:'시작일 *', zh:'开始日期 *' },
  'วันที่สิ้นสุด (ไม่บังคับ)': { en:'End date (optional)', ja:'終了日（任意）', ko:'종료일 (선택)', zh:'结束日期（可选）' },
  'สตอรี่': { en:'Story', ja:'ストーリー', ko:'스토리', zh:'故事' },
  'ชื่อเหตุการณ์ *': { en:'Event name *', ja:'イベント名 *', ko:'이벤트 이름 *', zh:'事件名称 *' },
  'ชื่อ Tag *': { en:'Tag name *', ja:'タグ名 *', ko:'태그 이름 *', zh:'标签名称 *' },
  'ชื่อ (ไม่ต้องใส่ #)': { en:'Name (no # needed)', ja:'名前（#不要）', ko:'이름 (# 불필요)', zh:'名称（无需#）' },
  'ลบโปรเจกต์': { en:'Delete project', ja:'プロジェクトを削除', ko:'프로젝트 삭제', zh:'删除项目' },
  'ลบ Timeline? เหตุการณ์ทั้งหมดจะหาย': { en:'Delete Timeline? All events will be lost.', ja:'タイムラインを削除？すべてのイベントが消えます', ko:'타임라인 삭제? 모든 이벤트가 삭제됩니다', zh:'删除时间线？所有事件将丢失' },
  'ลบ Tag นี้?': { en:'Delete this tag?', ja:'このタグを削除？', ko:'이 태그를 삭제?', zh:'删除此标签？' },
  'เหตุการณ์ทั้งหมด': { en:'All Events', ja:'すべてのイベント', ko:'모든 이벤트', zh:'所有事件' },
  'เพิ่มเหตุการณ์': { en:'Add event', ja:'イベントを追加', ko:'이벤트 추가', zh:'添加事件' },
  'เขียนสตอรี่ที่เกิดขึ้นในเหตุการณ์นี้...': { en:'Write the story of this event...', ja:'このイベントのストーリーを書く...', ko:'이 이벤트의 이야기 작성...', zh:'写下这个事件的故事...' },
  'Category': { en:'Category', ja:'カテゴリー', ko:'카테고리', zh:'分类' },
  'Project Details': { en:'Project Details', ja:'プロジェクト詳細', ko:'프로젝트 상세', zh:'项目详情' },
  'New category': { en:'New category', ja:'新規カテゴリー', ko:'새 카테고리', zh:'新建分类' },
  'No categories': { en:'No categories', ja:'カテゴリーなし', ko:'카테고리 없음', zh:'无分类' },
  'No details': { en:'No details', ja:'詳細なし', ko:'상세 없음', zh:'无详情' },
  'Back to project list': { en:'Back to project list', ja:'プロジェクト一覧に戻る', ko:'프로젝트 목록으로', zh:'返回项目列表' }
};

function loadUiSettings(){
  let saved = {};
  try{ saved = JSON.parse(localStorage.getItem(UI_SETTINGS_KEY) || '{}'); }
  catch(e){ saved = {}; }
  const theme = UI_THEME_OPTIONS.includes(saved.theme) ? saved.theme : 'midnight';
  const language = UI_LANGUAGE_OPTIONS.includes(saved.language) ? saved.language : 'th';
  const savedSize = Number(saved.size);
  const size = Number.isFinite(savedSize) ? Math.min(UI_SIZE_MAX, Math.max(UI_SIZE_MIN, savedSize)) : 100;
  return { theme, language, size };
}

const S = {
  folders:[], projects:[], colors:[],
  recentColors:[],
  activeModule:null,
  project:null, category:null, object:null,
  timeline:null, relTab:0, map:null, mapAreaId:null, mapTool:'move',
  descOpen:false, openFolders:new Set(),
  view:'nexus',
  catView:'list',
  projectTabs:[],
  activeProjectTabId:null,
  projectHashtagId:null,
  settings:loadUiSettings(),
  relListHeight:null,
  leftPanelCollapsed:localStorage.getItem(LEFT_PANEL_COLLAPSED_KEY) === '1',
  // Navigator module state
  world:null, worldTab:'overview', worldChar:null, worldCat:null, worldMap:null, worldMapTl:null,
  // Hero module state
  game:null, gameTab:'overview',
};
const timelineGraphState = {};
let timelineGraphCleanup = null;
let konvaStage = null;
const mapState = { viewByMap:{}, pointsByArea:{} };

async function init() {
  applyUiSettings();
  S.colors       = await api.color.getAll();
  S.recentColors = await api.color.getRecent();
  S.folders      = await api.folder.getAll();
  S.projects     = await api.project.getAll();
  bindWindowChrome();
  bindLeftPanelToggle();
  applyLeftPanelState();
  observeUiLanguage();
  renderSettingsMenu();
  translateStaticChrome();
  renderProjectTabs();
  renderNexusHome();
  bindNav();
  bindSearch();
}

// ═══ HELPERS ═══════════════════════════════════════════
const q = (s) => document.querySelector(s);
const x = (s) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtDate = (d,m,y,hh,mm) => {
  if(d==null) return '?';
  const ts = (hh||mm) ? ` ${String(hh||0).padStart(2,'0')}:${String(mm||0).padStart(2,'0')}` : '';
  return `${d}/${m}/${y}${ts}`;
};
const fmtTimelinePoint = (ts) => {
  const d = new Date(ts);
  return `${d.getUTCDate()}/${d.getUTCMonth()+1}/${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
};

let _tt;
function toast(msg,type='') {
  const el=q('#toast'); el.textContent=msg; el.className=`show ${type}`;
  clearTimeout(_tt); _tt=setTimeout(()=>el.classList.remove('show'),2600);
}

function openModal(title,body) {
  q('#modal-title').textContent=title;
  q('#modal-body').innerHTML=body;
  const overlay = q('#modal-overlay');
  overlay.classList.remove('hidden');
  // make modal focusable and move focus to it so inputs inside become interactive
  const modalEl = q('#modal');
  if(modalEl){ modalEl.tabIndex = -1; setTimeout(()=>{ try{ modalEl.focus(); }catch(e){} }, 30); }
}
function closeModal() { q('#modal-overlay').classList.add('hidden'); }

function applyLeftPanelState(){
  q('#app')?.classList.toggle('left-panel-collapsed', S.leftPanelCollapsed);
  q('#left-panel-collapse')?.setAttribute('title', S.leftPanelCollapsed ? t('openPanel') : t('collapsePanel'));
  q('#left-panel-peek')?.setAttribute('title', t('openPanel'));
}

function setLeftPanelCollapsed(collapsed){
  S.leftPanelCollapsed = !!collapsed;
  localStorage.setItem(LEFT_PANEL_COLLAPSED_KEY, S.leftPanelCollapsed ? '1' : '0');
  applyLeftPanelState();
}

function bindLeftPanelToggle(){
  q('#left-panel-collapse')?.addEventListener('click', () => setLeftPanelCollapsed(true));
  q('#left-panel-peek')?.addEventListener('click', () => setLeftPanelCollapsed(false));
}

function t(key){
  const lang = S.settings?.language || 'th';
  return L[lang]?.[key] || L.en[key] || key;
}

function saveUiSettings(){
  localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(S.settings));
}

function applyUiSettings(){
  document.body.dataset.theme = S.settings.theme;
  document.documentElement.lang = S.settings.language;
  const scale = S.settings.size / 100;
  document.documentElement.style.setProperty('--ui-scale', String(scale));
  document.body.style.zoom = String(scale);
  if(scale !== 1){
    document.body.style.height = `${(100 / scale).toFixed(4)}vh`;
    document.body.style.width  = `${(100 / scale).toFixed(4)}vw`;
  } else {
    document.body.style.height = '';
    document.body.style.width  = '';
  }
}

function setUiSetting(key, value){
  if(key === 'theme' && !UI_THEME_OPTIONS.includes(value)) return;
  if(key === 'language' && !UI_LANGUAGE_OPTIONS.includes(value)) return;
  if(key === 'size'){
    value = Number(value);
    if(!Number.isFinite(value)) return;
    value = Math.min(UI_SIZE_MAX, Math.max(UI_SIZE_MIN, Math.round(value)));
  }
  S.settings[key] = value;
  saveUiSettings();
  applyUiSettings();
  renderSettingsMenu();
  translateStaticChrome();
  renderProjectTabs();
  if(key === 'language') switchView(S.view || 'projects');
  toast(t('applied'),'ok');
}

function setUiSizeFromSlider(value){
  const size = Math.min(UI_SIZE_MAX, Math.max(UI_SIZE_MIN, Math.round(Number(value) || 100)));
  S.settings.size = size;
  saveUiSettings();
  applyUiSettings();
  const valueEl = q('#settings-size-value');
  if(valueEl) valueEl.textContent = `${size}%`;
}

function updateUiSizeLabel(value){
  const size = Math.min(UI_SIZE_MAX, Math.max(UI_SIZE_MIN, Math.round(Number(value) || 100)));
  const valueEl = q('#settings-size-value');
  if(valueEl) valueEl.textContent = `${size}%`;
}

function renderSettingsMenu(){
  const menu = q('#settings-menu');
  if(!menu) return;
  const themeButtons = UI_THEME_OPTIONS.map(theme =>
    `<button class="settings-option ${S.settings.theme===theme?'active':''}" onclick="setUiSetting('theme','${theme}')">${t(theme)}</button>`
  ).join('');
  const languageOptions = UI_LANGUAGE_OPTIONS.map(lang =>
    `<option value="${lang}" ${S.settings.language===lang?'selected':''}>${LANGUAGE_LABELS[lang]}</option>`
  ).join('');
  menu.innerHTML = `
    <div class="settings-head">
      <span>${t('settings')}</span>
      <button class="settings-close" onclick="toggleSettingsMenu(false)" title="${t('close')}">x</button>
    </div>
    <div class="settings-group">
      <div class="settings-label">${t('theme')}</div>
      <div class="settings-options">${themeButtons}</div>
    </div>
    <div class="settings-group">
      <div class="settings-label">${t('language')}</div>
      <select class="settings-select" onchange="setUiSetting('language', this.value)">
        ${languageOptions}
      </select>
    </div>
    <div class="settings-group">
      <div class="settings-label settings-label-row">
        <span>${t('uiSize')}</span>
        <span id="settings-size-value">${S.settings.size}%</span>
      </div>
      <input class="settings-slider" type="range" min="${UI_SIZE_MIN}" max="${UI_SIZE_MAX}" step="${UI_SIZE_STEP}" value="${S.settings.size}" oninput="updateUiSizeLabel(this.value)" onchange="setUiSizeFromSlider(this.value)">
      <div class="settings-slider-scale"><span>${UI_SIZE_MIN}%</span><span>100%</span><span>${UI_SIZE_MAX}%</span></div>
    </div>
  `;
}

function toggleSettingsMenu(force){
  const menu = q('#settings-menu');
  const btn = q('#settings-menu-btn');
  if(!menu || !btn) return;
  const open = typeof force === 'boolean' ? force : menu.classList.contains('hidden');
  menu.classList.toggle('hidden', !open);
  btn.classList.toggle('active', open);
  btn.setAttribute('aria-expanded', String(open));
}

function translateStaticChrome(){
  q('#settings-menu-btn')?.setAttribute('title', t('settings'));
  q('#new-project-tab')?.setAttribute('title', t('openProject'));
  q('#win-min')?.setAttribute('title', t('minimize'));
  q('#win-max')?.setAttribute('title', t('maximize'));
  q('#win-close')?.setAttribute('title', t('close'));
  q('#search-input')?.setAttribute('placeholder', t('search'));
  document.querySelectorAll('.nav-btn[data-panel]').forEach(btn => {
    const key = btn.dataset.panel;
    if(L.en[key]) btn.setAttribute('title', t(key));
  });
  q('#btn-import-db')?.setAttribute('title', t('importDb'));
  q('#btn-export-db')?.setAttribute('title', t('exportDb'));
  applyLeftPanelState();
  updateTopNavButton();
  translateCommonUiText();
}

function translateCommonUiText(root=document){
  const lang = S.settings?.language || 'th';
  if(lang === 'th') return;
  const pick = (text) => COMMON_UI_TEXT[text]?.[lang] || null;
  const selectors = [
    'button',
    '.fg label',
    '.ph h4',
    '.empty h3',
    '.empty p',
    '.settings-label',
    '.settings-head span',
    '#modal-title'
  ].join(',');
  root.querySelectorAll(selectors).forEach(el => {
    el.childNodes.forEach(node => {
      if(node.nodeType !== Node.TEXT_NODE) return;
      const value = node.nodeValue || '';
      const trimmed = value.trim();
      const translated = pick(trimmed);
      if(!translated) return;
      const lead = value.match(/^\s*/)?.[0] || '';
      const trail = value.match(/\s*$/)?.[0] || '';
      node.nodeValue = `${lead}${translated}${trail}`;
    });
  });
  root.querySelectorAll('[placeholder],[title]').forEach(el => {
    ['placeholder','title'].forEach(attr => {
      const value = el.getAttribute(attr);
      if(!value) return;
      const translated = pick(value.trim());
      if(translated) el.setAttribute(attr, translated);
    });
  });
}

let _uiTranslateTimer = null;
function observeUiLanguage(){
  const observer = new MutationObserver(() => {
    clearTimeout(_uiTranslateTimer);
    _uiTranslateTimer = setTimeout(() => translateCommonUiText(), 0);
  });
  observer.observe(document.body, { childList:true, subtree:true });
}

function bindWindowChrome(){
  q('#win-min')?.addEventListener('click', () => api.window.minimize());
  q('#win-max')?.addEventListener('click', () => api.window.toggleMaximize());
  q('#win-close')?.addEventListener('click', () => api.window.close());
  q('#settings-menu-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSettingsMenu();
  });
  q('#settings-menu')?.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', () => toggleSettingsMenu(false));
  q('#new-project-tab')?.addEventListener('click', () => {
    returnToProjectList();
  });
}

function updateTopNavButton(){
  const logoBtn = q('#nav-logo-btn');
  const inModule = !!S.activeModule;
  if(logoBtn){
    logoBtn.innerHTML = inModule
      ? I.return
      : `<img src="Image/DraconDex-SymbolWhite.png" class="brand-img" alt="DraconDex">`;
    const title = !inModule ? 'DraconDex' : S.project ? t('Back to project list') : 'Back to Nexus';
    logoBtn.setAttribute('title', title);
    logoBtn.classList.toggle('is-return', inModule);
  }
  document.querySelectorAll('.nav-btn.nexus-only').forEach(btn => {
    btn.style.display = (!S.activeModule) ? '' : 'none';
  });
  document.querySelectorAll('.nav-btn.director-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'director') ? '' : 'none';
  });
  document.querySelectorAll('.nav-btn.project-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'director' && !!S.project) ? '' : 'none';
  });
  document.querySelectorAll('.nav-btn.navigator-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'navigator') ? '' : 'none';
  });
  document.querySelectorAll('.nav-btn.hero-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'hero') ? '' : 'none';
  });
}

function returnToProjectList(){
  S.project = null; S.category = null; S.object = null; S.timeline = null; S.map = null; S.mapAreaId = null;
  S.activeProjectTabId = null; S.projectHashtagId = null;
  S.view = 'projects';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
  q('.nav-btn[data-panel="projects"]')?.classList.add('active');
  renderProjectTabs();
  updateTopNavButton();
  renderSidebar();
  renderWelcome();
}


async function goToActiveProject(){
  if(!S.project) return;
  S.view = 'projects';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
  q('.nav-btn[data-panel="projects"]')?.classList.add('active');
  updateTopNavButton();
  await renderProject();
}

function tabFromProject(project){
  return {
    id: project.id,
    name: project.name || 'Untitled',
    codename: project.codename || '',
    color: project.color_code || '#6366f1',
  };
}

function upsertProjectTab(project){
  const next = tabFromProject(project);
  const idx = S.projectTabs.findIndex(t => t.id === next.id);
  if(idx >= 0) S.projectTabs[idx] = next;
  else S.projectTabs.push(next);
  S.activeProjectTabId = next.id;
  renderProjectTabs();
}

function renderProjectTabs(){
  const el = q('#project-tabs');
  if(!el) return;
  el.innerHTML = S.projectTabs.map(tab => `
    <button class="project-tab ${S.activeProjectTabId===tab.id?'active':''}" onclick="switchProjectTab(${tab.id})" title="${x(tab.name)}">
      <span class="tab-dot" style="background:${tab.color}"></span>
      <span class="tab-name">${x(tab.name)}</span>
      <span class="tab-close" onclick="event.stopPropagation();closeProjectTab(${tab.id})" title="${t('closeTab')}">&times;</span>
    </button>
  `).join('');
  document.title = S.project ? `${S.project.name} - DraconDex` : 'DraconDex';
}

async function switchProjectTab(id){
  const project = await api.project.get(id);
  if(!project){
    await closeProjectTab(id);
    return;
  }
  upsertProjectTab(project);
  await activateProject(project);
}

async function closeProjectTab(id){
  const idx = S.projectTabs.findIndex(t => t.id === id);
  if(idx < 0) return;
  const wasActive = S.activeProjectTabId === id;
  S.projectTabs.splice(idx, 1);
  if(!wasActive){
    renderProjectTabs();
    return;
  }
  const next = S.projectTabs[idx] || S.projectTabs[idx - 1] || null;
  if(next){
    await switchProjectTab(next.id);
    return;
  }
  S.activeProjectTabId = null;
  returnToProjectList();
}

// ═══ COLOR PICKER ══════════════════════════════════════
function buildColorSwatches(colors, selId){
  return colors.map(c =>
    `<div class="cswatch ${selId===c.id?'sel':''}" style="background:${c.color_code}" data-cid="${c.id}" onclick="pickColor(this,${c.id})"></div>`
  ).join('');
}

async function colorPicker(selId=null) {
  S.recentColors = await api.color.getRecent();
  const recent = buildColorSwatches(S.recentColors, selId);
  const all    = buildColorSwatches(S.colors, selId);
  return `<div class="cpicker-wrap">
    <div class="cpicker-row-lbl">ใช้ล่าสุด</div>
    <div class="crecent-row" id="cpicker-recent">${recent || '<span class="cpicker-empty">ยังไม่มีประวัติการใช้สี</span>'}</div>
    <div class="cpicker-row-lbl">สีทั้งหมด</div>
    <div class="cgrid" id="cpicker-grid">${all}</div>
    <div class="cpicker-custom">
      <input type="color" id="cpicker-native" value="#6366f1" oninput="onColorPickerPreview(this.value)" title="เลือกสี">
      <span class="cpicker-hex-lbl" id="cpicker-hex-lbl">#6366f1</span>
      <button class="btn btn-s" type="button" onclick="addColorFromPicker()">เพิ่มสีใหม่</button>
    </div>
    <input type="hidden" id="sel-color" value="${selId||''}">
  </div>`;
}

async function hashtagSelector(prefix, selectedIds){
  const tags = await api.hashtag.getAll();
  const selected = (selectedIds||[]).map(t=>typeof t==='object'?t.id:parseInt(t,10)).filter(Boolean);
  const selectedTags = tags.filter(t => selected.includes(t.id));
  return `<div class="fg"><label>ป้ายกำกับ (Tags)</label>
    <input id="${prefix}-tag-search" class="tag-search-input" type="text" placeholder="พิมพ์ค้นหา Tag..." oninput="renderModalTagSuggestions('${prefix}')">
    <div class="tag-add-box">
      <div class="tag-suggestions" id="${prefix}-tag-sug"></div>
      <div class="htag-row" id="${prefix}-tag-list">${selectedTags.map(t=>`<span class="htag-chip" style="border-color:${t.color_code||'#6366f1'}"><span class="hn" style="color:${t.color_code||'#6366f1'}">#${x(t.tag_name)}</span><button class="btn btn-s btn-i" type="button" onclick="removeModalTag('${prefix}',${t.id})">✕</button></span>`).join('')}</div>
    </div>
    <input type="hidden" id="${prefix}-tag-value" value="${selected.join(',')}">
  </div>`;
}

function getModalTagIds(prefix){
  const input = q(`#${prefix}-tag-value`);
  return input ? input.value.split(',').filter(Boolean).map(Number) : [];
}

function setModalTagIds(prefix, ids){
  const input = q(`#${prefix}-tag-value`);
  if(input) input.value = ids.filter(Boolean).join(',');
}

async function renderModalTagSuggestions(prefix){
  const input = q(`#${prefix}-tag-search`);
  const container = q(`#${prefix}-tag-sug`);
  if(!input || !container) return;
  const value = input.value.trim().toLowerCase();
  const tags = await api.hashtag.getAll();
  const selectedIds = new Set(getModalTagIds(prefix));
  const filtered = tags.filter(t => !selectedIds.has(t.id) && (!value || t.tag_name.toLowerCase().includes(value)));
  const recent = filtered
    .sort((a,b)=> (b.update_at||'').localeCompare(a.update_at||''))
    .slice(0,5);
  container.innerHTML = recent.length
    ? recent.map(t=>`<div class="htag-item" style="border-color:${t.color_code||'#6366f1'};cursor:pointer" onclick="addModalTag('${prefix}',${t.id})"><span class="hn" style="color:${t.color_code||'#6366f1'}">#${x(t.tag_name)}</span></div>`).join('')
    : `<div class="empty" style="padding:10px 6px;font-size:12px;color:var(--t3)">ไม่มี Tag ให้เลือก</div>`;
}

function renderModalSelectedTags(prefix){
  const ids = new Set(getModalTagIds(prefix));
  const list = q(`#${prefix}-tag-list`);
  if(!list) return;
  api.hashtag.getAll().then(tags => {
    const selectedTags = tags.filter(t => ids.has(t.id));
    list.innerHTML = selectedTags.map(t=>`<span class="htag-chip" style="border-color:${t.color_code||'#6366f1'}"><span class="hn" style="color:${t.color_code||'#6366f1'}">#${x(t.tag_name)}</span><button class="btn btn-s btn-i" type="button" onclick="removeModalTag('${prefix}',${t.id})">✕</button></span>`).join('');
  });
}

function addModalTag(prefix, tagId){
  const ids = new Set(getModalTagIds(prefix));
  ids.add(tagId);
  setModalTagIds(prefix, Array.from(ids));
  renderModalSelectedTags(prefix);
  renderModalTagSuggestions(prefix);
}

function removeModalTag(prefix, tagId){
  const ids = getModalTagIds(prefix).filter(id => id !== tagId);
  setModalTagIds(prefix, ids);
  renderModalSelectedTags(prefix);
  renderModalTagSuggestions(prefix);
}

function filterTagSelector(prefix){
  const input = q(`#${prefix}-tag-search`); if(!input) return;
  const filter = input.value.trim().toLowerCase();
  const list = q(`#${prefix}-tag-list`); if(!list) return;
  list.querySelectorAll('label').forEach(label => {
    label.style.display = !filter || label.dataset.name.includes(filter) ? 'inline-flex' : 'none';
  });
}

async function pickColor(el,id) {
  const wrap = el.closest('.cpicker-wrap');
  if (wrap) wrap.querySelectorAll('.cswatch').forEach(s=>s.classList.remove('sel'));
  el.classList.add('sel');
  q('#sel-color').value = id;
  await api.color.markUsed(id);
  S.recentColors = await api.color.getRecent();
  const rec = q('#cpicker-recent');
  if (rec) rec.innerHTML = buildColorSwatches(S.recentColors, id) || '<span class="cpicker-empty">ยังไม่มีประวัติการใช้สี</span>';
}

function onColorPickerPreview(code){
  if(!/^#[0-9a-fA-F]{6}$/.test(code)) return;
  q('#cpicker-hex-lbl').textContent = code;
}

async function addColorFromPicker(){
  const code = q('#cpicker-native')?.value?.trim() || '';
  if(!/^#[0-9a-fA-F]{6}$/.test(code)) return;
  await api.color.add(code);
  S.colors = await api.color.getAll();
  const nc = S.colors.find(c => c.color_code.toLowerCase() === code.toLowerCase());
  if (nc) await api.color.markUsed(nc.id);
  S.recentColors = await api.color.getRecent();
  const grid = q('#cpicker-grid');
  if (grid) grid.innerHTML = buildColorSwatches(S.colors, nc?.id);
  const rec = q('#cpicker-recent');
  if (rec) rec.innerHTML = buildColorSwatches(S.recentColors, nc?.id) || '<span class="cpicker-empty">ยังไม่มีประวัติการใช้สี</span>';
  if (nc) q('#sel-color').value = nc.id;
  toast('เพิ่มสีใหม่เรียบร้อย','ok');
}

// ═══ NAV & VIEW ════════════════════════════════════════
function bindNav() {
  q('#nav-logo-btn')?.addEventListener('click', () => {
    if(S.project) returnToProjectList();
    else if(S.activeModule) returnToNexus();
  });
  document.querySelectorAll('.nav-btn[data-panel]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      S.view = btn.dataset.panel;
      updateTopNavButton();
      switchView(S.view);
    });
  });
  q('#btn-import-db')?.addEventListener('click', importDatabaseFile);
  q('#btn-export-db')?.addEventListener('click', exportDatabaseFile);
  q('#modal-close').addEventListener('click', closeModal);
  q('#modal-overlay').addEventListener('click', e=>{ if(e.target===q('#modal-overlay')) closeModal(); });
}

async function exportDatabaseFile(){
  try{
    const res = await api.db.exportFile();
    if(res?.canceled) return;
    toast('Export DB สำเร็จ','ok');
  }catch(e){
    toast(`Export ไม่สำเร็จ: ${e.message}`,'err');
  }
}

async function importDatabaseFile(){
  if(!confirm('Import DB แล้วรวมข้อมูลที่ยังไม่ซ้ำกับฐานข้อมูลปัจจุบัน ใช่หรือไม่?')) return;
  try{
    const res = await api.db.importFileMerge();
    if(res?.canceled) return;
    await reloadSidebar();
    S.colors = await api.color.getAll();
    S.recentColors = await api.color.getRecent();
    if(S.project?.id) S.project = await api.project.get(S.project.id) || null;
    switchView(S.view || 'projects');
    toast('Import DB สำเร็จและรวมข้อมูลแล้ว','ok');
  }catch(e){
    toast(`Import ไม่สำเร็จ: ${e.message}`,'err');
  }
}

const _loadedModules = new Set();
function loadModule(src) {
  if (_loadedModules.has(src)) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => { _loadedModules.add(src); res(); };
    s.onerror = () => rej(new Error(`Failed to load module: ${src}`));
    document.head.appendChild(s);
  });
}

async function switchView(v) {
  if (konvaStage) {
    try { konvaStage.destroy(); } catch(e){}
    konvaStage = null;
  }
  q('#main-inner')?.classList.toggle('relation-main', v === 'relation');
  updateTopNavButton();
  if      (v==='nexus')           renderNexusHome();
  else if (v==='projects')        { if(S.project) renderProject(); else { renderSidebar(); renderWelcome(); } }
  else if (v==='timeline')        { await loadModule('src/renderer/timeline.js'); renderTimelineView(); }
  else if (v==='relation')        { await loadModule('src/renderer/relation.js'); renderRelationView(); }
  else if (v==='map')             { await loadModule('src/renderer/map.js'); renderMapView(); }
  else if (v==='hashtag')         { await loadModule('src/renderer/hashtag.js'); renderHashtagView(); }
  else if (v==='project-hashtag') { await loadModule('src/renderer/hashtag.js'); renderProjectHashtagView(); }
  else if (v==='colors')          { await loadModule('src/renderer/hashtag.js'); q('#left-panel-inner').innerHTML=`<div class="ph"><h4>${t('colorPanel')}</h4></div>`; renderColorSettings(); }
  else if (v==='navigator')       { await loadModule('src/renderer/navigator.js'); renderNavigatorView(); }
  else if (v==='hero')            { await loadModule('src/renderer/hero.js'); renderHeroView(); }
}

// ═══ NEXUS HUB ═════════════════════════════════════════
function renderNexusHome() {
  S.view = 'nexus';
  S.activeModule = null;
  if (konvaStage) { try { konvaStage.destroy(); } catch(e){} konvaStage = null; }
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
  updateTopNavButton();
  q('#left-panel-inner').innerHTML = `
    <div class="ph"><h4>${t('nexus')}</h4></div>
    <div class="module-item" onclick="selectModule('director')">
      <span class="module-icon">${I.director}</span>
      <span class="module-name">${t('director')}</span>
      <svg class="icon module-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
    <div class="module-item" onclick="selectModule('navigator')">
      <span class="module-icon">${I.navigator}</span>
      <span class="module-name">${t('navigator')}</span>
      <svg class="icon module-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
    <div class="module-item" onclick="selectModule('hero')">
      <span class="module-icon">${I.hero}</span>
      <span class="module-name">${t('hero')}</span>
      <svg class="icon module-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>`;
  q('#main-inner')?.classList.remove('relation-main');
  q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei"><img src="Image/DraconDex-SymbolWhite.png" class="brand-img" alt="DraconDex" style="height:48px;width:48px;opacity:.35"></div>
    <h3>${t('nexusWelcomeTitle')}</h3>
    <p>${t('nexusWelcomeText')}</p>
  </div>`;
}

function selectModule(name) {
  S.activeModule = name;
  if (name === 'director') {
    S.view = 'projects';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="projects"]')?.classList.add('active');
    updateTopNavButton();
    renderSidebar();
    renderWelcome();
  } else if (name === 'navigator') {
    S.view = 'navigator';
    S.world = null; S.worldChar = null; S.worldCat = null; S.worldMap = null; S.worldMapTl = null;
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="navigator"]')?.classList.add('active');
    updateTopNavButton();
    loadModule('src/renderer/navigator.js').then(() => renderNavigatorView());
  } else if (name === 'hero') {
    S.view = 'hero';
    S.game = null; S.gameTab = 'overview';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="hero"]')?.classList.add('active');
    updateTopNavButton();
    loadModule('src/renderer/hero.js').then(() => renderHeroView());
  }
}

function returnToNexus() {
  S.activeModule = null;
  S.project = null; S.category = null; S.object = null;
  S.timeline = null; S.map = null; S.mapAreaId = null;
  S.activeProjectTabId = null; S.projectHashtagId = null;
  S.world = null; S.worldChar = null; S.worldCat = null; S.worldMap = null; S.worldMapTl = null;
  S.game = null; S.gameTab = 'overview';
  S.view = 'nexus';
  renderProjectTabs();
  renderNexusHome();
}

// ═══ SIDEBAR ═══════════════════════════════════════════
async function reloadSidebar() {
  S.folders  = await api.folder.getAll();
  S.projects = await api.project.getAll();
  const byId = new Map(S.projects.map(p => [p.id, p]));
  S.projectTabs = S.projectTabs
    .filter(t => byId.has(t.id))
    .map(t => tabFromProject(byId.get(t.id)));
  if(S.activeProjectTabId && !byId.has(S.activeProjectTabId)) S.activeProjectTabId = null;
  renderProjectTabs();
  updateTopNavButton();
  if(!S.activeModule) renderNexusHome();
  else if(S.project && S.view === 'projects') await renderProjectSidebar();
  else renderSidebar();
}

function renderSidebar() {
  let h = `<div class="ph"><h4>${t('projects')}</h4>
    <button class="btn btn-g btn-i" onclick="openFolderModal()" title="${t('newFolder')}">${I.folder}</button>
    <button class="btn btn-g btn-i" onclick="openProjectModal()" title="${t('newProject')}">${I.plus}</button>
  </div>`;
  for(const f of S.folders){
    const open=S.openFolders.has(f.id), fps=S.projects.filter(p=>p.folder_id===f.id), col=f.color_code||'#6366f1';
    h += `<div class="folder-sec">
      <div class="fhead" onclick="tglFolder(${f.id})">
        <svg class="ftgl ${open?'open':''}" style="width:8px;height:8px;margin-right:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg><span style="color:${col};margin-right:6px;display:flex;align-items:center;">${I.folder}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(f.name)}</span>
        <span class="cs-count" style="margin-left:8px">${fps.length}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openFolderModal(${f.id})">${I.edit}</button>
      </div>
      ${open?`<div class="fchildren">${fps.map(projItem).join('')}</div>`:''}
    </div>`;
  }
  const unfiled = S.projects.filter(p=>!p.folder_id);
  if(unfiled.length) h += `<div class="div"></div>${unfiled.map(projItem).join('')}`;
  q('#left-panel-inner').innerHTML = h;
}

