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
  func: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  book: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  writer: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  series: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  document: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  chart: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  sage: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`
};

const UI_SETTINGS_KEY = 'novel-manager-ui-settings';
const LEFT_PANEL_COLLAPSED_KEY = 'novel-manager-left-panel-collapsed';
const UI_THEME_OPTIONS = ['daylight','moonlight','midnight','redEclipse','clearSky','clearStar','afterRain','rainbow','atDawn','atDusk','atDay','blueEclipse'];
const UI_LANGUAGE_OPTIONS = ['en','ja','ko','th','zh','vi','id','es','pt','fr','de','ru','qd'];
const UI_SIZE_MIN = 50;
const UI_SIZE_MAX = 200;
const UI_SIZE_STEP = 5;
const L = {
  en: {
    settings:'Settings', theme:'Theme', language:'Language', uiSize:'UI Size', cancel:'Cancel',
    gameCollections:'Collections', gameCollectionNew:'New Collection', gameElementNew:'New Element',
    gameConversations:'Conversations', gameConvNew:'Add Conversation', gameAddEdge:'Link Dialogue',
    gameSelectNovel:'Select Novel', gameImportObj:'Add to game', gameFields:'Fields', gameLevel:'Level',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'Open project', closeTab:'Close tab', minimize:'Minimize', maximize:'Maximize', close:'Close',
    collapsePanel:'Collapse panel', openPanel:'Open panel',
    projects:'Projects', timeline:'Timeline', relation:'Relations', map:'Mapping', hashtag:'Tags', colors:'Colors',
    importDb:'Import DB', exportDb:'Export DB', search:'Search...',
    newFolder:'New folder', newProject:'New project', createProject:'Create project',
    welcomeTitle:'Novel Manager', welcomeText:'Select a project from the list, or create a new one.',
    colorPanel:'Colors', saved:'Saved', deleted:'Deleted', created:'Created', applied:'Applied',
    edit:'Edit', delete:'Delete', add:'Add', remove:'Remove', save:'Save', name:'Name', memo:'Memo', color:'Color', title:'Title', content:'Content',
    nexus:'Nexus', director:'Director', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'Choose a module to get started.',
    navigator:'Navigator', world:'World', worldNew:'New World', worldChars:'Characters', worldCats:'Categories', worldCharsCats:'Characters & Categories',
    worldMaps:'Maps', worldMapTimelines:'Map Timelines', worldTimeline:'Timeline', worldOverview:'Overview', worldOrig:'Original', worldLinkedNovels:'Linked Novels', worldOrigCats:'Original Categories', worldDetails:'World Details',
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
    gameCondition:'Condition', gameEffects:'Effects',
    writer:'Writer', library:'Library', libraryNew:'New Library', libraryOverview:'Overview',
    librarySeries:'Series', libraryTags:'Tags', libraryLinkedWorlds:'Linked Worlds',
    seriesNew:'New Series', seriesOverview:'Overview', seriesDocs:'Documents', seriesChars:'Characters',
    seriesObjects:'Objects', seriesTags:'Tags', docNew:'New Document', docEditor:'Document Editor',
    exportPdf:'Export PDF', exportDocx:'Export DOCX', addChar:'Add Character',
    addObject:'Add Object', addNovel:'Add Novel', addWorld:'Add World',
    sage:'Sage', sageDataSize:'Data Size', sageObjectAmount:'Object Amount',
    sageLinkerList:'Linker List', sageLinkerGraph:'Linker Graph', sageRows:'rows',
    sageModule:'Module', sageFrom:'From', sageTo:'To', sageType:'Type'
  },
  ja: {
    settings:'設定', theme:'テーマ', language:'言語', uiSize:'UIサイズ', cancel:'キャンセル',
    gameCollections:'コレクション', gameCollectionNew:'新規コレクション', gameElementNew:'新規エレメント',
    gameConversations:'会話', gameConvNew:'会話を追加', gameAddEdge:'ダイアログを接続',
    gameSelectNovel:'小説を選択', gameImportObj:'ゲームに追加', gameFields:'フィールド', gameLevel:'レベル',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'プロジェクトを開く', closeTab:'タブを閉じる', minimize:'最小化', maximize:'最大化', close:'閉じる',
    collapsePanel:'パネルを折りたたむ', openPanel:'パネルを開く',
    projects:'プロジェクト', timeline:'タイムライン', relation:'関係', map:'マッピング', hashtag:'タグ', colors:'色',
    importDb:'DBをインポート', exportDb:'DBをエクスポート', search:'検索...',
    newFolder:'新規フォルダー', newProject:'新規プロジェクト', createProject:'プロジェクト作成',
    welcomeTitle:'Novel Manager', welcomeText:'左の一覧からプロジェクトを選ぶか、新しく作成してください。',
    colorPanel:'色', saved:'保存しました', deleted:'削除しました', created:'作成しました', applied:'適用しました',
    edit:'編集', delete:'削除', add:'追加', remove:'削除', save:'保存', name:'名前', memo:'メモ', color:'色', title:'タイトル', content:'内容',
    nexus:'Nexus', director:'ディレクター', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'モジュールを選択してください。',
    navigator:'ナビゲーター', world:'ワールド', worldNew:'新規ワールド', worldChars:'キャラクター', worldCats:'カテゴリー', worldCharsCats:'キャラクター・カテゴリー',
    worldMaps:'マップ', worldMapTimelines:'マップタイムライン', worldTimeline:'タイムライン', worldOverview:'概要', worldOrig:'オリジナル', worldLinkedNovels:'リンク済み小説', worldOrigCats:'オリジナルカテゴリー', worldDetails:'ワールド詳細',
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
    gameCondition:'条件', gameEffects:'効果',
    writer:'ライター', library:'ライブラリ', libraryNew:'新規ライブラリ', libraryOverview:'概要',
    librarySeries:'シリーズ', libraryTags:'タグ', libraryLinkedWorlds:'リンク済みワールド',
    seriesNew:'新規シリーズ', seriesOverview:'概要', seriesDocs:'ドキュメント', seriesChars:'キャラクター',
    seriesObjects:'オブジェクト', seriesTags:'タグ', docNew:'新規ドキュメント', docEditor:'ドキュメントエディタ',
    exportPdf:'PDFエクスポート', exportDocx:'DOCXエクスポート', addChar:'キャラクター追加',
    addObject:'オブジェクト追加', addNovel:'小説追加', addWorld:'ワールド追加',
    sage:'Sage', sageDataSize:'データサイズ', sageObjectAmount:'オブジェクト数',
    sageLinkerList:'リンク一覧', sageLinkerGraph:'リンクグラフ', sageRows:'件',
    sageModule:'モジュール', sageFrom:'元', sageTo:'先', sageType:'種類'
  },
  ko: {
    settings:'설정', theme:'테마', language:'언어', uiSize:'UI 크기', cancel:'취소',
    gameCollections:'컬렉션', gameCollectionNew:'새 컬렉션', gameElementNew:'새 엘리먼트',
    gameConversations:'대화', gameConvNew:'대화 추가', gameAddEdge:'다이얼로그 연결',
    gameSelectNovel:'소설 선택', gameImportObj:'게임에 추가', gameFields:'필드', gameLevel:'레벨',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'프로젝트 열기', closeTab:'탭 닫기', minimize:'최소화', maximize:'최대화', close:'닫기',
    collapsePanel:'패널 접기', openPanel:'패널 열기',
    projects:'프로젝트', timeline:'타임라인', relation:'관계', map:'매핑', hashtag:'태그', colors:'색상',
    importDb:'DB 가져오기', exportDb:'DB 내보내기', search:'검색...',
    newFolder:'새 폴더', newProject:'새 프로젝트', createProject:'프로젝트 만들기',
    welcomeTitle:'Novel Manager', welcomeText:'왼쪽 목록에서 프로젝트를 선택하거나 새 프로젝트를 만드세요.',
    colorPanel:'색상', saved:'저장됨', deleted:'삭제됨', created:'생성됨', applied:'적용됨',
    edit:'수정', delete:'삭제', add:'추가', remove:'제거', save:'저장', name:'이름', memo:'메모', color:'색상', title:'제목', content:'내용',
    nexus:'Nexus', director:'디렉터', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'모듈을 선택하세요.',
    navigator:'네비게이터', world:'세계', worldNew:'새 세계', worldChars:'캐릭터', worldCats:'카테고리', worldCharsCats:'캐릭터 및 카테고리',
    worldMaps:'맵', worldMapTimelines:'맵 타임라인', worldTimeline:'타임라인', worldOverview:'개요', worldOrig:'오리지널', worldLinkedNovels:'연결된 소설', worldOrigCats:'오리지널 카테고리', worldDetails:'세계 상세',
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
    gameCondition:'조건', gameEffects:'효과',
    writer:'라이터', library:'라이브러리', libraryNew:'새 라이브러리', libraryOverview:'개요',
    librarySeries:'시리즈', libraryTags:'태그', libraryLinkedWorlds:'연결된 세계',
    seriesNew:'새 시리즈', seriesOverview:'개요', seriesDocs:'문서', seriesChars:'캐릭터',
    seriesObjects:'오브젝트', seriesTags:'태그', docNew:'새 문서', docEditor:'문서 편집기',
    exportPdf:'PDF 내보내기', exportDocx:'DOCX 내보내기', addChar:'캐릭터 추가',
    addObject:'오브젝트 추가', addNovel:'소설 추가', addWorld:'세계 추가',
    sage:'Sage', sageDataSize:'데이터 크기', sageObjectAmount:'오브젝트 수',
    sageLinkerList:'링커 목록', sageLinkerGraph:'링커 그래프', sageRows:'개',
    sageModule:'모듈', sageFrom:'출처', sageTo:'대상', sageType:'유형'
  },
  th: {
    settings:'ตั้งค่า', theme:'ธีม', language:'ภาษา', uiSize:'ขนาด UI', cancel:'ยกเลิก',
    gameCollections:'คอลเลกชัน', gameCollectionNew:'คอลเลกชันใหม่', gameElementNew:'เพิ่ม Element',
    gameConversations:'บทสนทนา', gameConvNew:'เพิ่มบทสนทนา', gameAddEdge:'เชื่อม Dialogue',
    gameSelectNovel:'เลือกนิยาย', gameImportObj:'เพิ่มเข้าเกม', gameFields:'Fields', gameLevel:'เลเวล',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'เปิดโปรเจกต์', closeTab:'ปิดแท็บ', minimize:'ย่อหน้าต่าง', maximize:'ขยายหน้าต่าง', close:'ปิด',
    collapsePanel:'พับ Panel', openPanel:'เปิด Panel',
    projects:'โปรเจกต์', timeline:'Timeline', relation:'ความสัมพันธ์', map:'Mapping', hashtag:'ป้ายกำกับ', colors:'สี',
    importDb:'Import DB', exportDb:'Export DB', search:'ค้นหา...',
    newFolder:'สร้างโฟลเดอร์ใหม่', newProject:'สร้างโปรเจกต์ใหม่', createProject:'สร้างโปรเจกต์ใหม่',
    welcomeTitle:'Novel Manager', welcomeText:'เลือกโปรเจกต์จากรายการทางซ้าย หรือสร้างโปรเจกต์ใหม่',
    colorPanel:'สี', saved:'บันทึกแล้ว', deleted:'ลบแล้ว', created:'สร้างแล้ว', applied:'ปรับใช้แล้ว',
    edit:'แก้ไข', delete:'ลบ', add:'เพิ่ม', remove:'นำออก', save:'บันทึก', name:'ชื่อ', memo:'บันทึกย่อ', color:'สี', title:'หัวข้อ', content:'เนื้อหา',
    nexus:'Nexus', director:'Director', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'เลือกโมดูลที่ต้องการใช้งาน',
    navigator:'Navigator', world:'โลก', worldNew:'สร้างโลกใหม่', worldChars:'ตัวละคร', worldCats:'หมวดหมู่', worldCharsCats:'ตัวละครและหมวดหมู่',
    worldMaps:'แผนที่', worldMapTimelines:'ไทม์ไลน์แผนที่', worldTimeline:'ไทม์ไลน์', worldOverview:'ภาพรวม', worldOrig:'หมวดหมู่ของโลก', worldLinkedNovels:'นิยายที่เชื่อมต่อ', worldOrigCats:'หมวดหมู่ของโลก', worldDetails:'รายละเอียดโลก',
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
    gameCondition:'เงื่อนไข', gameEffects:'ผลลัพธ์',
    writer:'Writer', library:'ไลบรารี', libraryNew:'สร้างไลบรารีใหม่', libraryOverview:'ภาพรวม',
    librarySeries:'ซีรีส์', libraryTags:'แท็ก', libraryLinkedWorlds:'โลกที่เชื่อมต่อ',
    seriesNew:'เพิ่มซีรีส์', seriesOverview:'ภาพรวม', seriesDocs:'เอกสาร', seriesChars:'ตัวละคร',
    seriesObjects:'รายการ', seriesTags:'แท็ก', docNew:'เพิ่มเอกสาร', docEditor:'แก้ไขเอกสาร',
    exportPdf:'ส่งออก PDF', exportDocx:'ส่งออก DOCX', addChar:'เพิ่มตัวละคร',
    addObject:'เพิ่มรายการ', addNovel:'เพิ่มนิยาย', addWorld:'เพิ่มโลก',
    sage:'Sage', sageDataSize:'ขนาดข้อมูล', sageObjectAmount:'จำนวนรายการ',
    sageLinkerList:'รายการเชื่อมต่อ', sageLinkerGraph:'กราฟเชื่อมต่อ', sageRows:'รายการ',
    sageModule:'โมดูล', sageFrom:'แหล่ง', sageTo:'ปลายทาง', sageType:'ประเภท'
  },
  zh: {
    settings:'设置', theme:'主题', language:'语言', uiSize:'界面大小', cancel:'取消',
    gameCollections:'收藏集', gameCollectionNew:'新建收藏集', gameElementNew:'新建元素',
    gameConversations:'对话', gameConvNew:'添加对话', gameAddEdge:'连接对话节点',
    gameSelectNovel:'选择小说', gameImportObj:'添加到游戏', gameFields:'字段', gameLevel:'等级',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'打开项目', closeTab:'关闭标签', minimize:'最小化', maximize:'最大化', close:'关闭',
    collapsePanel:'收起面板', openPanel:'打开面板',
    projects:'项目', timeline:'时间线', relation:'关系', map:'映射', hashtag:'标签', colors:'颜色',
    importDb:'导入 DB', exportDb:'导出 DB', search:'搜索...',
    newFolder:'新建文件夹', newProject:'新建项目', createProject:'创建项目',
    welcomeTitle:'Novel Manager', welcomeText:'从左侧列表选择项目，或创建一个新项目。',
    colorPanel:'颜色', saved:'已保存', deleted:'已删除', created:'已创建', applied:'已应用',
    edit:'编辑', delete:'删除', add:'添加', remove:'移除', save:'保存', name:'名称', memo:'备注', color:'颜色', title:'标题', content:'内容',
    nexus:'Nexus', director:'Director', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'选择一个模块以开始。',
    navigator:'Navigator', world:'世界', worldNew:'新建世界', worldChars:'角色', worldCats:'类别', worldCharsCats:'角色与类别',
    worldMaps:'地图', worldMapTimelines:'地图时间线', worldTimeline:'时间线', worldOverview:'概览', worldOrig:'原创', worldLinkedNovels:'关联小说', worldOrigCats:'原创类别', worldDetails:'世界详情',
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
    gameCondition:'条件', gameEffects:'效果',
    writer:'Writer', library:'图书馆', libraryNew:'新建图书馆', libraryOverview:'概览',
    librarySeries:'系列', libraryTags:'标签', libraryLinkedWorlds:'关联世界',
    seriesNew:'新建系列', seriesOverview:'概览', seriesDocs:'文档', seriesChars:'角色',
    seriesObjects:'对象', seriesTags:'标签', docNew:'新建文档', docEditor:'文档编辑器',
    exportPdf:'导出 PDF', exportDocx:'导出 DOCX', addChar:'添加角色',
    addObject:'添加对象', addNovel:'添加小说', addWorld:'添加世界',
    sage:'Sage', sageDataSize:'数据大小', sageObjectAmount:'对象数量',
    sageLinkerList:'链接列表', sageLinkerGraph:'链接图', sageRows:'条',
    sageModule:'模块', sageFrom:'来源', sageTo:'目标', sageType:'类型'
  },
  vi: {
    settings:'Cài đặt', theme:'Giao diện', language:'Ngôn ngữ', uiSize:'Kích thước UI', cancel:'Hủy',
    gameCollections:'Bộ sưu tập', gameCollectionNew:'Bộ sưu tập mới', gameElementNew:'Element mới',
    gameConversations:'Hội thoại', gameConvNew:'Thêm hội thoại', gameAddEdge:'Nối Dialogue',
    gameSelectNovel:'Chọn tiểu thuyết', gameImportObj:'Thêm vào game', gameFields:'Trường', gameLevel:'Cấp độ',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'Mở dự án', closeTab:'Đóng tab', minimize:'Thu nhỏ', maximize:'Phóng to', close:'Đóng',
    collapsePanel:'Thu gọn bảng', openPanel:'Mở bảng',
    projects:'Dự án', timeline:'Dòng thời gian', relation:'Quan hệ', map:'Bản đồ', hashtag:'Thẻ', colors:'Màu sắc',
    importDb:'Nhập DB', exportDb:'Xuất DB', search:'Tìm kiếm...',
    newFolder:'Thư mục mới', newProject:'Dự án mới', createProject:'Tạo dự án',
    welcomeTitle:'Novel Manager', welcomeText:'Chọn một dự án từ danh sách, hoặc tạo một dự án mới.',
    colorPanel:'Màu sắc', saved:'Đã lưu', deleted:'Đã xóa', created:'Đã tạo', applied:'Đã áp dụng',
    edit:'Sửa', delete:'Xóa', add:'Thêm', remove:'Gỡ bỏ', save:'Lưu', name:'Tên', memo:'Ghi chú', color:'Màu', title:'Tiêu đề', content:'Nội dung',
    nexus:'Nexus', director:'Đạo diễn', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'Chọn một module để bắt đầu.',
    navigator:'Điều hướng', world:'Thế giới', worldNew:'Thế giới mới', worldChars:'Nhân vật', worldCats:'Danh mục', worldCharsCats:'Nhân vật & Danh mục',
    worldMaps:'Bản đồ', worldMapTimelines:'Dòng thời gian bản đồ', worldTimeline:'Dòng thời gian', worldOverview:'Tổng quan', worldOrig:'Gốc', worldLinkedNovels:'Tiểu thuyết liên kết', worldOrigCats:'Danh mục gốc', worldDetails:'Chi tiết thế giới',
    worldTags:'Thẻ', worldCharNew:'Nhân vật mới', worldCatNew:'Danh mục mới', worldMapNew:'Bản đồ mới',
    worldMaptlNew:'Dòng thời gian mới', worldEventNew:'Sự kiện mới', worldObjNew:'Đối tượng mới',
    worldCharLink:'Liên kết với đối tượng tiểu thuyết', worldCatLink:'Liên kết với danh mục tiểu thuyết', worldMapLink:'Liên kết với bản đồ tiểu thuyết',
    noLink:'Chưa liên kết',
    hero:'Anh hùng', game:'Trò chơi', gameNew:'Trò chơi mới', gameChars:'Nhân vật', gameItems:'Vật phẩm',
    gameStory:'Cốt truyện', gameFunctions:'Chức năng', gameTags:'Thẻ', gameOverview:'Tổng quan',
    gameCharNew:'Nhân vật mới', gameItemCatNew:'Danh mục vật phẩm mới', gameItemNew:'Vật phẩm mới',
    gameStoryNew:'Cốt truyện mới', gameFuncCatNew:'Danh mục chức năng mới', gameFuncNew:'Chức năng mới',
    gameStats:'Chỉ số', gameLevelup:'Lên cấp', gameNovelLink:'Tiểu thuyết liên kết',
    gameDialogue:'Hội thoại', gameDialogueNew:'Nút mới', gameLine:'Lời thoại', gameLineNew:'Lời thoại mới',
    gameCondition:'Điều kiện', gameEffects:'Hiệu ứng',
    writer:'Writer', library:'Thư viện', libraryNew:'Thư viện mới', libraryOverview:'Tổng quan',
    librarySeries:'Bộ truyện', libraryTags:'Thẻ', libraryLinkedWorlds:'Thế giới liên kết',
    seriesNew:'Bộ truyện mới', seriesOverview:'Tổng quan', seriesDocs:'Tài liệu', seriesChars:'Nhân vật',
    seriesObjects:'Đối tượng', seriesTags:'Thẻ', docNew:'Tài liệu mới', docEditor:'Trình soạn thảo tài liệu',
    exportPdf:'Xuất PDF', exportDocx:'Xuất DOCX', addChar:'Thêm nhân vật',
    addObject:'Thêm đối tượng', addNovel:'Thêm tiểu thuyết', addWorld:'Thêm thế giới',
    sage:'Sage', sageDataSize:'Kích thước dữ liệu', sageObjectAmount:'Số lượng đối tượng',
    sageLinkerList:'Danh sách liên kết', sageLinkerGraph:'Sơ đồ liên kết', sageRows:'dòng',
    sageModule:'Module', sageFrom:'Từ', sageTo:'Đến', sageType:'Loại'
  },
  id: {
    settings:'Pengaturan', theme:'Tema', language:'Bahasa', uiSize:'Ukuran UI', cancel:'Batal',
    gameCollections:'Koleksi', gameCollectionNew:'Koleksi Baru', gameElementNew:'Elemen Baru',
    gameConversations:'Percakapan', gameConvNew:'Tambah Percakapan', gameAddEdge:'Hubungkan Dialog',
    gameSelectNovel:'Pilih Novel', gameImportObj:'Tambah ke game', gameFields:'Bidang', gameLevel:'Level',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'Buka proyek', closeTab:'Tutup tab', minimize:'Perkecil', maximize:'Perbesar', close:'Tutup',
    collapsePanel:'Ciutkan panel', openPanel:'Buka panel',
    projects:'Proyek', timeline:'Linimasa', relation:'Relasi', map:'Pemetaan', hashtag:'Tag', colors:'Warna',
    importDb:'Impor DB', exportDb:'Ekspor DB', search:'Cari...',
    newFolder:'Folder baru', newProject:'Proyek baru', createProject:'Buat proyek',
    welcomeTitle:'Novel Manager', welcomeText:'Pilih proyek dari daftar, atau buat yang baru.',
    colorPanel:'Warna', saved:'Tersimpan', deleted:'Terhapus', created:'Dibuat', applied:'Diterapkan',
    edit:'Edit', delete:'Hapus', add:'Tambah', remove:'Hapus', save:'Simpan', name:'Nama', memo:'Memo', color:'Warna', title:'Judul', content:'Konten',
    nexus:'Nexus', director:'Direktur', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'Pilih modul untuk memulai.',
    navigator:'Navigasi', world:'Dunia', worldNew:'Dunia baru', worldChars:'Karakter', worldCats:'Kategori', worldCharsCats:'Karakter & Kategori',
    worldMaps:'Peta', worldMapTimelines:'Linimasa peta', worldTimeline:'Linimasa', worldOverview:'Ikhtisar', worldOrig:'Asli', worldLinkedNovels:'Novel terhubung', worldOrigCats:'Kategori asli', worldDetails:'Detail dunia',
    worldTags:'Tag', worldCharNew:'Karakter baru', worldCatNew:'Kategori baru', worldMapNew:'Peta baru',
    worldMaptlNew:'Linimasa baru', worldEventNew:'Peristiwa baru', worldObjNew:'Objek baru',
    worldCharLink:'Tautkan ke objek novel', worldCatLink:'Tautkan ke kategori novel', worldMapLink:'Tautkan ke peta novel',
    noLink:'Belum tertaut',
    hero:'Pahlawan', game:'Game', gameNew:'Game baru', gameChars:'Karakter', gameItems:'Item',
    gameStory:'Cerita', gameFunctions:'Fungsi', gameTags:'Tag', gameOverview:'Ikhtisar',
    gameCharNew:'Karakter baru', gameItemCatNew:'Kategori item baru', gameItemNew:'Item baru',
    gameStoryNew:'Cerita baru', gameFuncCatNew:'Kategori fungsi baru', gameFuncNew:'Fungsi baru',
    gameStats:'Statistik', gameLevelup:'Naik level', gameNovelLink:'Novel terhubung',
    gameDialogue:'Dialog', gameDialogueNew:'Node baru', gameLine:'Baris', gameLineNew:'Baris baru',
    gameCondition:'Kondisi', gameEffects:'Efek',
    writer:'Writer', library:'Perpustakaan', libraryNew:'Perpustakaan baru', libraryOverview:'Ikhtisar',
    librarySeries:'Seri', libraryTags:'Tag', libraryLinkedWorlds:'Dunia terhubung',
    seriesNew:'Seri baru', seriesOverview:'Ikhtisar', seriesDocs:'Dokumen', seriesChars:'Karakter',
    seriesObjects:'Objek', seriesTags:'Tag', docNew:'Dokumen baru', docEditor:'Editor dokumen',
    exportPdf:'Ekspor PDF', exportDocx:'Ekspor DOCX', addChar:'Tambah karakter',
    addObject:'Tambah objek', addNovel:'Tambah novel', addWorld:'Tambah dunia',
    sage:'Sage', sageDataSize:'Ukuran data', sageObjectAmount:'Jumlah objek',
    sageLinkerList:'Daftar tautan', sageLinkerGraph:'Grafik tautan', sageRows:'baris',
    sageModule:'Modul', sageFrom:'Dari', sageTo:'Ke', sageType:'Jenis'
  },
  es: {
    settings:'Ajustes', theme:'Tema', language:'Idioma', uiSize:'Tamaño de la interfaz', cancel:'Cancelar',
    gameCollections:'Colecciones', gameCollectionNew:'Nueva colección', gameElementNew:'Nuevo elemento',
    gameConversations:'Conversaciones', gameConvNew:'Añadir conversación', gameAddEdge:'Enlazar diálogo',
    gameSelectNovel:'Elegir novela', gameImportObj:'Añadir al juego', gameFields:'Campos', gameLevel:'Nivel',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'Abrir proyecto', closeTab:'Cerrar pestaña', minimize:'Minimizar', maximize:'Maximizar', close:'Cerrar',
    collapsePanel:'Contraer panel', openPanel:'Abrir panel',
    projects:'Proyectos', timeline:'Cronología', relation:'Relaciones', map:'Mapeo', hashtag:'Etiquetas', colors:'Colores',
    importDb:'Importar BD', exportDb:'Exportar BD', search:'Buscar...',
    newFolder:'Nueva carpeta', newProject:'Nuevo proyecto', createProject:'Crear proyecto',
    welcomeTitle:'Novel Manager', welcomeText:'Selecciona un proyecto de la lista, o crea uno nuevo.',
    colorPanel:'Colores', saved:'Guardado', deleted:'Eliminado', created:'Creado', applied:'Aplicado',
    edit:'Editar', delete:'Eliminar', add:'Añadir', remove:'Quitar', save:'Guardar', name:'Nombre', memo:'Nota', color:'Color', title:'Título', content:'Contenido',
    nexus:'Nexus', director:'Director', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'Elige un módulo para empezar.',
    navigator:'Navegador', world:'Mundo', worldNew:'Nuevo mundo', worldChars:'Personajes', worldCats:'Categorías', worldCharsCats:'Personajes y Categorías',
    worldMaps:'Mapas', worldMapTimelines:'Cronologías del mapa', worldTimeline:'Cronología', worldOverview:'Resumen', worldOrig:'Original', worldLinkedNovels:'Novelas vinculadas', worldOrigCats:'Categorías originales', worldDetails:'Detalles del mundo',
    worldTags:'Etiquetas', worldCharNew:'Nuevo personaje', worldCatNew:'Nueva categoría', worldMapNew:'Nuevo mapa',
    worldMaptlNew:'Nueva cronología', worldEventNew:'Nuevo evento', worldObjNew:'Nuevo objeto',
    worldCharLink:'Vincular a objeto de la novela', worldCatLink:'Vincular a categoría de la novela', worldMapLink:'Vincular a mapa de la novela',
    noLink:'Sin vincular',
    hero:'Héroe', game:'Juego', gameNew:'Nuevo juego', gameChars:'Personajes', gameItems:'Objetos',
    gameStory:'Historia', gameFunctions:'Funciones', gameTags:'Etiquetas', gameOverview:'Resumen',
    gameCharNew:'Nuevo personaje', gameItemCatNew:'Nueva categoría de objetos', gameItemNew:'Nuevo objeto',
    gameStoryNew:'Nueva historia', gameFuncCatNew:'Nueva categoría de funciones', gameFuncNew:'Nueva función',
    gameStats:'Estadísticas', gameLevelup:'Subir de nivel', gameNovelLink:'Novela vinculada',
    gameDialogue:'Diálogo', gameDialogueNew:'Nuevo nodo', gameLine:'Línea', gameLineNew:'Nueva línea',
    gameCondition:'Condición', gameEffects:'Efectos',
    writer:'Writer', library:'Biblioteca', libraryNew:'Nueva biblioteca', libraryOverview:'Resumen',
    librarySeries:'Series', libraryTags:'Etiquetas', libraryLinkedWorlds:'Mundos vinculados',
    seriesNew:'Nueva serie', seriesOverview:'Resumen', seriesDocs:'Documentos', seriesChars:'Personajes',
    seriesObjects:'Objetos', seriesTags:'Etiquetas', docNew:'Nuevo documento', docEditor:'Editor de documentos',
    exportPdf:'Exportar PDF', exportDocx:'Exportar DOCX', addChar:'Añadir personaje',
    addObject:'Añadir objeto', addNovel:'Añadir novela', addWorld:'Añadir mundo',
    sage:'Sage', sageDataSize:'Tamaño de datos', sageObjectAmount:'Cantidad de objetos',
    sageLinkerList:'Lista de enlaces', sageLinkerGraph:'Gráfico de enlaces', sageRows:'filas',
    sageModule:'Módulo', sageFrom:'Desde', sageTo:'Hasta', sageType:'Tipo'
  },
  pt: {
    settings:'Configurações', theme:'Tema', language:'Idioma', uiSize:'Tamanho da interface', cancel:'Cancelar',
    gameCollections:'Coleções', gameCollectionNew:'Nova coleção', gameElementNew:'Novo elemento',
    gameConversations:'Conversas', gameConvNew:'Adicionar conversa', gameAddEdge:'Ligar diálogo',
    gameSelectNovel:'Escolher romance', gameImportObj:'Adicionar ao jogo', gameFields:'Campos', gameLevel:'Nível',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'Abrir projeto', closeTab:'Fechar aba', minimize:'Minimizar', maximize:'Maximizar', close:'Fechar',
    collapsePanel:'Recolher painel', openPanel:'Abrir painel',
    projects:'Projetos', timeline:'Linha do tempo', relation:'Relações', map:'Mapeamento', hashtag:'Tags', colors:'Cores',
    importDb:'Importar BD', exportDb:'Exportar BD', search:'Buscar...',
    newFolder:'Nova pasta', newProject:'Novo projeto', createProject:'Criar projeto',
    welcomeTitle:'Novel Manager', welcomeText:'Selecione um projeto da lista, ou crie um novo.',
    colorPanel:'Cores', saved:'Salvo', deleted:'Excluído', created:'Criado', applied:'Aplicado',
    edit:'Editar', delete:'Excluir', add:'Adicionar', remove:'Remover', save:'Salvar', name:'Nome', memo:'Memorando', color:'Cor', title:'Título', content:'Conteúdo',
    nexus:'Nexus', director:'Diretor', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'Escolha um módulo para começar.',
    navigator:'Navegador', world:'Mundo', worldNew:'Novo mundo', worldChars:'Personagens', worldCats:'Categorias', worldCharsCats:'Personagens e Categorias',
    worldMaps:'Mapas', worldMapTimelines:'Linhas do tempo do mapa', worldTimeline:'Linha do tempo', worldOverview:'Visão geral', worldOrig:'Original', worldLinkedNovels:'Romances vinculados', worldOrigCats:'Categorias originais', worldDetails:'Detalhes do mundo',
    worldTags:'Tags', worldCharNew:'Novo personagem', worldCatNew:'Nova categoria', worldMapNew:'Novo mapa',
    worldMaptlNew:'Nova linha do tempo', worldEventNew:'Novo evento', worldObjNew:'Novo objeto',
    worldCharLink:'Vincular a objeto do romance', worldCatLink:'Vincular a categoria do romance', worldMapLink:'Vincular a mapa do romance',
    noLink:'Não vinculado',
    hero:'Herói', game:'Jogo', gameNew:'Novo jogo', gameChars:'Personagens', gameItems:'Itens',
    gameStory:'História', gameFunctions:'Funções', gameTags:'Tags', gameOverview:'Visão geral',
    gameCharNew:'Novo personagem', gameItemCatNew:'Nova categoria de itens', gameItemNew:'Novo item',
    gameStoryNew:'Nova história', gameFuncCatNew:'Nova categoria de funções', gameFuncNew:'Nova função',
    gameStats:'Estatísticas', gameLevelup:'Subir de nível', gameNovelLink:'Romance vinculado',
    gameDialogue:'Diálogo', gameDialogueNew:'Novo nó', gameLine:'Linha', gameLineNew:'Nova linha',
    gameCondition:'Condição', gameEffects:'Efeitos',
    writer:'Writer', library:'Biblioteca', libraryNew:'Nova biblioteca', libraryOverview:'Visão geral',
    librarySeries:'Séries', libraryTags:'Tags', libraryLinkedWorlds:'Mundos vinculados',
    seriesNew:'Nova série', seriesOverview:'Visão geral', seriesDocs:'Documentos', seriesChars:'Personagens',
    seriesObjects:'Objetos', seriesTags:'Tags', docNew:'Novo documento', docEditor:'Editor de documentos',
    exportPdf:'Exportar PDF', exportDocx:'Exportar DOCX', addChar:'Adicionar personagem',
    addObject:'Adicionar objeto', addNovel:'Adicionar romance', addWorld:'Adicionar mundo',
    sage:'Sage', sageDataSize:'Tamanho dos dados', sageObjectAmount:'Quantidade de objetos',
    sageLinkerList:'Lista de vínculos', sageLinkerGraph:'Gráfico de vínculos', sageRows:'linhas',
    sageModule:'Módulo', sageFrom:'De', sageTo:'Para', sageType:'Tipo'
  },
  fr: {
    settings:'Paramètres', theme:'Thème', language:'Langue', uiSize:'Taille de l\'Interface', cancel:'Annuler',
    gameCollections:'Collections', gameCollectionNew:'Nouvelle collection', gameElementNew:'Nouvel élément',
    gameConversations:'Conversations', gameConvNew:'Ajouter une conversation', gameAddEdge:'Lier le dialogue',
    gameSelectNovel:'Choisir un roman', gameImportObj:'Ajouter au jeu', gameFields:'Champs', gameLevel:'Niveau',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'Ouvrir le projet', closeTab:'Fermer l\'onglet', minimize:'Réduire', maximize:'Agrandir', close:'Fermer',
    collapsePanel:'Réduire le panneau', openPanel:'Ouvrir le panneau',
    projects:'Projets', timeline:'Chronologie', relation:'Relations', map:'Cartographie', hashtag:'Tags', colors:'Couleurs',
    importDb:'Importer la BD', exportDb:'Exporter la BD', search:'Rechercher...',
    newFolder:'Nouveau dossier', newProject:'Nouveau projet', createProject:'Créer un projet',
    welcomeTitle:'Novel Manager', welcomeText:'Sélectionnez un projet dans la liste, ou créez-en un nouveau.',
    colorPanel:'Couleurs', saved:'Enregistré', deleted:'Supprimé', created:'Créé', applied:'Appliqué',
    edit:'Modifier', delete:'Supprimer', add:'Ajouter', remove:'Retirer', save:'Enregistrer', name:'Nom', memo:'Mémo', color:'Couleur', title:'Titre', content:'Contenu',
    nexus:'Nexus', director:'Directeur', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'Choisissez un module pour commencer.',
    navigator:'Navigateur', world:'Monde', worldNew:'Nouveau monde', worldChars:'Personnages', worldCats:'Catégories', worldCharsCats:'Personnages et Catégories',
    worldMaps:'Cartes', worldMapTimelines:'Chronologies de carte', worldTimeline:'Chronologie', worldOverview:'Aperçu', worldOrig:'Original', worldLinkedNovels:'Romans liés', worldOrigCats:'Catégories originales', worldDetails:'Détails du monde',
    worldTags:'Tags', worldCharNew:'Nouveau personnage', worldCatNew:'Nouvelle catégorie', worldMapNew:'Nouvelle carte',
    worldMaptlNew:'Nouvelle chronologie', worldEventNew:'Nouvel événement', worldObjNew:'Nouvel objet',
    worldCharLink:'Lier à un objet du roman', worldCatLink:'Lier à une catégorie du roman', worldMapLink:'Lier à une carte du roman',
    noLink:'Non lié',
    hero:'Héros', game:'Jeu', gameNew:'Nouveau jeu', gameChars:'Personnages', gameItems:'Objets',
    gameStory:'Histoire', gameFunctions:'Fonctions', gameTags:'Tags', gameOverview:'Aperçu',
    gameCharNew:'Nouveau personnage', gameItemCatNew:'Nouvelle catégorie d\'objets', gameItemNew:'Nouvel objet',
    gameStoryNew:'Nouvelle histoire', gameFuncCatNew:'Nouvelle catégorie de fonctions', gameFuncNew:'Nouvelle fonction',
    gameStats:'Statistiques', gameLevelup:'Montée de niveau', gameNovelLink:'Roman lié',
    gameDialogue:'Dialogue', gameDialogueNew:'Nouveau nœud', gameLine:'Réplique', gameLineNew:'Nouvelle réplique',
    gameCondition:'Condition', gameEffects:'Effets',
    writer:'Writer', library:'Bibliothèque', libraryNew:'Nouvelle bibliothèque', libraryOverview:'Aperçu',
    librarySeries:'Séries', libraryTags:'Tags', libraryLinkedWorlds:'Mondes liés',
    seriesNew:'Nouvelle série', seriesOverview:'Aperçu', seriesDocs:'Documents', seriesChars:'Personnages',
    seriesObjects:'Objets', seriesTags:'Tags', docNew:'Nouveau document', docEditor:'Éditeur de document',
    exportPdf:'Exporter en PDF', exportDocx:'Exporter en DOCX', addChar:'Ajouter un personnage',
    addObject:'Ajouter un objet', addNovel:'Ajouter un roman', addWorld:'Ajouter un monde',
    sage:'Sage', sageDataSize:'Taille des données', sageObjectAmount:'Quantité d\'objets',
    sageLinkerList:'Liste des liens', sageLinkerGraph:'Graphe des liens', sageRows:'lignes',
    sageModule:'Module', sageFrom:'De', sageTo:'À', sageType:'Type'
  },
  de: {
    settings:'Einstellungen', theme:'Design', language:'Sprache', uiSize:'UI-Größe', cancel:'Abbrechen',
    gameCollections:'Sammlungen', gameCollectionNew:'Neue Sammlung', gameElementNew:'Neues Element',
    gameConversations:'Gespräche', gameConvNew:'Gespräch hinzufügen', gameAddEdge:'Dialog verbinden',
    gameSelectNovel:'Roman wählen', gameImportObj:'Zum Spiel hinzufügen', gameFields:'Felder', gameLevel:'Stufe',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'Projekt öffnen', closeTab:'Tab schließen', minimize:'Minimieren', maximize:'Maximieren', close:'Schließen',
    collapsePanel:'Panel einklappen', openPanel:'Panel öffnen',
    projects:'Projekte', timeline:'Zeitleiste', relation:'Beziehungen', map:'Kartierung', hashtag:'Tags', colors:'Farben',
    importDb:'DB importieren', exportDb:'DB exportieren', search:'Suchen...',
    newFolder:'Neuer Ordner', newProject:'Neues Projekt', createProject:'Projekt erstellen',
    welcomeTitle:'Novel Manager', welcomeText:'Wähle ein Projekt aus der Liste oder erstelle ein neues.',
    colorPanel:'Farben', saved:'Gespeichert', deleted:'Gelöscht', created:'Erstellt', applied:'Angewendet',
    edit:'Bearbeiten', delete:'Löschen', add:'Hinzufügen', remove:'Entfernen', save:'Speichern', name:'Name', memo:'Memo', color:'Farbe', title:'Titel', content:'Inhalt',
    nexus:'Nexus', director:'Regisseur', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'Wähle ein Modul, um zu beginnen.',
    navigator:'Navigator', world:'Welt', worldNew:'Neue Welt', worldChars:'Charaktere', worldCats:'Kategorien', worldCharsCats:'Charaktere & Kategorien',
    worldMaps:'Karten', worldMapTimelines:'Karten-Zeitleisten', worldTimeline:'Zeitleiste', worldOverview:'Übersicht', worldOrig:'Original', worldLinkedNovels:'Verknüpfte Romane', worldOrigCats:'Originalkategorien', worldDetails:'Weltdetails',
    worldTags:'Tags', worldCharNew:'Neuer Charakter', worldCatNew:'Neue Kategorie', worldMapNew:'Neue Karte',
    worldMaptlNew:'Neue Zeitleiste', worldEventNew:'Neues Ereignis', worldObjNew:'Neues Objekt',
    worldCharLink:'Mit Romanobjekt verknüpfen', worldCatLink:'Mit Romankategorie verknüpfen', worldMapLink:'Mit Romankarte verknüpfen',
    noLink:'Nicht verknüpft',
    hero:'Held', game:'Spiel', gameNew:'Neues Spiel', gameChars:'Charaktere', gameItems:'Gegenstände',
    gameStory:'Geschichte', gameFunctions:'Funktionen', gameTags:'Tags', gameOverview:'Übersicht',
    gameCharNew:'Neuer Charakter', gameItemCatNew:'Neue Gegenstandskategorie', gameItemNew:'Neuer Gegenstand',
    gameStoryNew:'Neue Geschichte', gameFuncCatNew:'Neue Funktionskategorie', gameFuncNew:'Neue Funktion',
    gameStats:'Statistiken', gameLevelup:'Levelaufstieg', gameNovelLink:'Verknüpfter Roman',
    gameDialogue:'Dialog', gameDialogueNew:'Neuer Knoten', gameLine:'Zeile', gameLineNew:'Neue Zeile',
    gameCondition:'Bedingung', gameEffects:'Effekte',
    writer:'Writer', library:'Bibliothek', libraryNew:'Neue Bibliothek', libraryOverview:'Übersicht',
    librarySeries:'Serien', libraryTags:'Tags', libraryLinkedWorlds:'Verknüpfte Welten',
    seriesNew:'Neue Serie', seriesOverview:'Übersicht', seriesDocs:'Dokumente', seriesChars:'Charaktere',
    seriesObjects:'Objekte', seriesTags:'Tags', docNew:'Neues Dokument', docEditor:'Dokumenteditor',
    exportPdf:'PDF exportieren', exportDocx:'DOCX exportieren', addChar:'Charakter hinzufügen',
    addObject:'Objekt hinzufügen', addNovel:'Roman hinzufügen', addWorld:'Welt hinzufügen',
    sage:'Sage', sageDataSize:'Datengröße', sageObjectAmount:'Objektanzahl',
    sageLinkerList:'Verknüpfungsliste', sageLinkerGraph:'Verknüpfungsgraf', sageRows:'Zeilen',
    sageModule:'Modul', sageFrom:'Von', sageTo:'Zu', sageType:'Typ'
  },
  ru: {
    settings:'Настройки', theme:'Тема', language:'Язык', uiSize:'Размер интерфейса', cancel:'Отмена',
    gameCollections:'Коллекции', gameCollectionNew:'Новая коллекция', gameElementNew:'Новый элемент',
    gameConversations:'Разговоры', gameConvNew:'Добавить разговор', gameAddEdge:'Связать диалог',
    gameSelectNovel:'Выбрать роман', gameImportObj:'Добавить в игру', gameFields:'Поля', gameLevel:'Уровень',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'Открыть проект', closeTab:'Закрыть вкладку', minimize:'Свернуть', maximize:'Развернуть', close:'Закрыть',
    collapsePanel:'Свернуть панель', openPanel:'Открыть панель',
    projects:'Проекты', timeline:'Хронология', relation:'Отношения', map:'Картография', hashtag:'Теги', colors:'Цвета',
    importDb:'Импорт БД', exportDb:'Экспорт БД', search:'Поиск...',
    newFolder:'Новая папка', newProject:'Новый проект', createProject:'Создать проект',
    welcomeTitle:'Novel Manager', welcomeText:'Выберите проект из списка или создайте новый.',
    colorPanel:'Цвета', saved:'Сохранено', deleted:'Удалено', created:'Создано', applied:'Применено',
    edit:'Редактировать', delete:'Удалить', add:'Добавить', remove:'Убрать', save:'Сохранить', name:'Имя', memo:'Заметка', color:'Цвет', title:'Заголовок', content:'Содержание',
    nexus:'Nexus', director:'Директор', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'Выберите модуль, чтобы начать.',
    navigator:'Навигатор', world:'Мир', worldNew:'Новый мир', worldChars:'Персонажи', worldCats:'Категории', worldCharsCats:'Персонажи и категории',
    worldMaps:'Карты', worldMapTimelines:'Хронологии карты', worldTimeline:'Хронология', worldOverview:'Обзор', worldOrig:'Оригинал', worldLinkedNovels:'Связанные романы', worldOrigCats:'Оригинальные категории', worldDetails:'Детали мира',
    worldTags:'Теги', worldCharNew:'Новый персонаж', worldCatNew:'Новая категория', worldMapNew:'Новая карта',
    worldMaptlNew:'Новая хронология', worldEventNew:'Новое событие', worldObjNew:'Новый объект',
    worldCharLink:'Связать с объектом романа', worldCatLink:'Связать с категорией романа', worldMapLink:'Связать с картой романа',
    noLink:'Не связано',
    hero:'Герой', game:'Игра', gameNew:'Новая игра', gameChars:'Персонажи', gameItems:'Предметы',
    gameStory:'История', gameFunctions:'Функции', gameTags:'Теги', gameOverview:'Обзор',
    gameCharNew:'Новый персонаж', gameItemCatNew:'Новая категория предметов', gameItemNew:'Новый предмет',
    gameStoryNew:'Новая история', gameFuncCatNew:'Новая категория функций', gameFuncNew:'Новая функция',
    gameStats:'Статистика', gameLevelup:'Повышение уровня', gameNovelLink:'Связанный роман',
    gameDialogue:'Диалог', gameDialogueNew:'Новый узел', gameLine:'Реплика', gameLineNew:'Новая реплика',
    gameCondition:'Условие', gameEffects:'Эффекты',
    writer:'Writer', library:'Библиотека', libraryNew:'Новая библиотека', libraryOverview:'Обзор',
    librarySeries:'Серии', libraryTags:'Теги', libraryLinkedWorlds:'Связанные миры',
    seriesNew:'Новая серия', seriesOverview:'Обзор', seriesDocs:'Документы', seriesChars:'Персонажи',
    seriesObjects:'Объекты', seriesTags:'Теги', docNew:'Новый документ', docEditor:'Редактор документов',
    exportPdf:'Экспорт в PDF', exportDocx:'Экспорт в DOCX', addChar:'Добавить персонажа',
    addObject:'Добавить объект', addNovel:'Добавить роман', addWorld:'Добавить мир',
    sage:'Sage', sageDataSize:'Размер данных', sageObjectAmount:'Количество объектов',
    sageLinkerList:'Список связей', sageLinkerGraph:'Граф связей', sageRows:'строк',
    sageModule:'Модуль', sageFrom:'Из', sageTo:'В', sageType:'Тип'
  },
  qd: {
    settings:'Vharokk', theme:'Skalith', language:'Zhorvex', uiSize:'Skaal Draav', cancel:'Vokhal',
    gameCollections:'Kolvexa', gameCollectionNew:'Kolvexa Nyr', gameElementNew:'Elym Nyr',
    gameConversations:'Vorlakks', gameConvNew:'Vorlakk Zenn', gameAddEdge:'Dialyth Vynk',
    gameSelectNovel:'Novyth Choozz', gameImportObj:'Zenn ta Gamyth', gameFields:'Feldyra', gameLevel:'Skaalyth',
    daylight:'Daylight', moonlight:'Moonlight', midnight:'Midnight',
    redEclipse:'RedEclipse', clearSky:'ClearSky', clearStar:'ClearStar', afterRain:'AfterRain', rainbow:'Rainbow',
    atDawn:'AtDawn', atDusk:'AtDusk', atDay:'AtDay', blueEclipse:'BlueEclipse',
    openProject:'Vaskorra Vorqu', closeTab:'Klemuur Tabyx', minimize:'Krynshu', maximize:'Draznorr', close:'Klemuur',
    collapsePanel:'Foldra Panylx', openPanel:'Vaskorra Panylx',
    projects:'Vorquenn', timeline:'Khronofang', relation:'Kynshall', map:'Territhramapp', hashtag:'Markiss', colors:'Chroniss',
    importDb:'Ingurath DB', exportDb:'Outhgurath DB', search:'Zharra...',
    newFolder:'Esshka Nestrum', newProject:'Esshka Vorqu', createProject:'Forge Vorqu',
    welcomeTitle:'Novel Manager', welcomeText:'Choozz a vorqu fromm thy hoard-lystyx, orr forge a nu onya.',
    colorPanel:'Chroniss', saved:'Korvath\'d', deleted:'Vhoreth\'d', created:'Forg\'d', applied:'Bestow\'d',
    edit:'Zhakrii', delete:'Vhoreth', add:'Grothul', remove:'Ejyra', save:'Korvath', name:'Yssira', memo:'Skrivath', color:'Chroniss', title:'Titheryn', content:'Innorath',
    nexus:'Nexus', director:'Ovirwyrm', nexusWelcomeTitle:'DraconDex', nexusWelcomeText:'Choozz a modyule to begynn thy questhra.',
    navigator:'Skywatchyr', world:'Realmyx', worldNew:'Esshka Realmyx', worldChars:'Beingraxae', worldCats:'Klavossae', worldCharsCats:'Beingraxae ee Klavossae',
    worldMaps:'Territhrae', worldMapTimelines:'Territhra Khronofangae', worldTimeline:'Khronofang', worldOverview:'Skorvyu', worldOrig:'Primoryx', worldLinkedNovels:'Bondrath Vorquenn', worldOrigCats:'Primoryx Klavossae', worldDetails:'Realmyx Detharai',
    worldTags:'Markiss', worldCharNew:'Esshka Beingrax', worldCatNew:'Esshka Klavoss', worldMapNew:'Esshka Territhra',
    worldMaptlNew:'Esshka Khronofang', worldEventNew:'Esshka Chronoshard', worldObjNew:'Esshka Artifyx',
    worldCharLink:'Bondra to Vorqu Artifyx', worldCatLink:'Bondra to Vorqu Klavoss', worldMapLink:'Bondra to Vorqu Territhra',
    noLink:'Unbondrath',
    hero:'Valorwyrm', game:'Playthyrm', gameNew:'Esshka Playthyrm', gameChars:'Beingraxae', gameItems:'Trinkyx',
    gameStory:'Sagaal', gameFunctions:'Runemyx', gameTags:'Markiss', gameOverview:'Skorvyu',
    gameCharNew:'Esshka Beingrax', gameItemCatNew:'Esshka Trinkyx Klavoss', gameItemNew:'Esshka Trinkyx',
    gameStoryNew:'Esshka Sagaal', gameFuncCatNew:'Esshka Runemyx Klavoss', gameFuncNew:'Esshka Runemyx',
    gameStats:'Vitharai', gameLevelup:'Ascendrath', gameNovelLink:'Bondrath Vorqu',
    gameDialogue:'Whispyrn', gameDialogueNew:'Esshka Nodyx', gameLine:'Versyx', gameLineNew:'Esshka Versyx',
    gameCondition:'Omenyx', gameEffects:'Emberyx',
    writer:'Writer', library:'Archivyx', libraryNew:'Esshka Archivyx', libraryOverview:'Skorvyu',
    librarySeries:'Sagachain', libraryTags:'Markiss', libraryLinkedWorlds:'Bondrath Realmyx',
    seriesNew:'Esshka Sagachain', seriesOverview:'Skorvyu', seriesDocs:'Scrollyx', seriesChars:'Beingraxae',
    seriesObjects:'Artifyx', seriesTags:'Markiss', docNew:'Esshka Scroll', docEditor:'Scroll Zhakriitor',
    exportPdf:'Outhgurath PDF', exportDocx:'Outhgurath DOCX', addChar:'Grothul Beingrax',
    addObject:'Grothul Artifyx', addNovel:'Grothul Vorqu', addWorld:'Grothul Realmyx',
    sage:'Sage', sageDataSize:'Hoardweight', sageObjectAmount:'Artifyx Tallyx',
    sageLinkerList:'Bondra Lystyx', sageLinkerGraph:'Bondra Webgraf', sageRows:'rowyx',
    sageModule:'Modryx', sageFrom:'Fravorn', sageTo:'Tovorn', sageType:'Formyx'
  },
};
const LANGUAGE_LABELS = { en:'ENG - English', ja:'JP - 日本語', ko:'KR - 한국어', th:'TH - ไทย', zh:'CN - 中文', vi:'VI - Tiếng Việt', id:'ID - Bahasa Indonesia', es:'ES - Español', pt:'PT - Português (Brasil)', fr:'FR - Français', de:'DE - Deutsch', ru:'RU - Русский', qd:'🐉 Draconic' };
const COMMON_UI_TEXT = {
  'ยกเลิก': { en:'Cancel', ja:'キャンセル', ko:'취소', zh:'取消' , vi:'Hủy', id:'Batal', es:'Cancelar', pt:'Cancelar' , fr:'Annuler', de:'Abbrechen', ru:'Отмена', qd:'Nyshaa' },
  'บันทึก': { en:'Save', ja:'保存', ko:'저장', zh:'保存' , vi:'Lưu', id:'Simpan', es:'Guardar', pt:'Salvar' , fr:'Enregistrer', de:'Speichern', ru:'Сохранить', qd:'Korvath' },
  'สร้าง': { en:'Create', ja:'作成', ko:'생성', zh:'创建' , vi:'Tạo', id:'Buat', es:'Crear', pt:'Criar' , fr:'Créer', de:'Erstellen', ru:'Создать', qd:'Forge' },
  'ลบ': { en:'Delete', ja:'削除', ko:'삭제', zh:'删除' , vi:'Xóa', id:'Hapus', es:'Eliminar', pt:'Excluir' , fr:'Supprimer', de:'Löschen', ru:'Удалить', qd:'Vhoreth' },
  'แก้ไข': { en:'Edit', ja:'編集', ko:'수정', zh:'编辑' , vi:'Sửa', id:'Edit', es:'Editar', pt:'Editar' , fr:'Modifier', de:'Bearbeiten', ru:'Редактировать', qd:'Zhakrii' },
  'เพิ่ม': { en:'Add', ja:'追加', ko:'추가', zh:'添加' , vi:'Thêm', id:'Tambah', es:'Añadir', pt:'Adicionar' , fr:'Ajouter', de:'Hinzufügen', ru:'Добавить', qd:'Grothul' },
  'จัดการ': { en:'Manage', ja:'管理', ko:'관리', zh:'管理' , vi:'Quản lý', id:'Kelola', es:'Gestionar', pt:'Gerenciar' , fr:'Gérer', de:'Verwalten', ru:'Управлять', qd:'Wardenn' },
  'ชื่อ *': { en:'Name *', ja:'名前 *', ko:'이름 *', zh:'名称 *' , vi:'Tên *', id:'Nama *', es:'Nombre *', pt:'Nome *' , fr:'Nom *', de:'Name *', ru:'Имя *', qd:'Yssira *' },
  'ชื่อ': { en:'Name', ja:'名前', ko:'이름', zh:'名称' , vi:'Tên', id:'Nama', es:'Nombre', pt:'Nome' , fr:'Nom', de:'Name', ru:'Имя', qd:'Yssira' },
  'รายละเอียด': { en:'Details', ja:'詳細', ko:'상세', zh:'详情' , vi:'Chi tiết', id:'Detail', es:'Detalles', pt:'Detalhes' , fr:'Détails', de:'Details', ru:'Подробности', qd:'Detharai' },
  'สี': { en:'Color', ja:'色', ko:'색상', zh:'颜色' , vi:'Màu', id:'Warna', es:'Color', pt:'Cor' , fr:'Couleur', de:'Farbe', ru:'Цвет', qd:'Chroniss' },
  'โปรเจกต์': { en:'Projects', ja:'プロジェクト', ko:'프로젝트', zh:'项目' , vi:'Dự án', id:'Proyek', es:'Proyectos', pt:'Projetos' , fr:'Projets', de:'Projekte', ru:'Проекты', qd:'Vorquenn' },
  'สร้างโปรเจกต์ใหม่': { en:'New project', ja:'新規プロジェクト', ko:'새 프로젝트', zh:'新建项目' , vi:'Dự án mới', id:'Proyek baru', es:'Nuevo proyecto', pt:'Novo projeto' , fr:'Nouveau projet', de:'Neues Projekt', ru:'Новый проект', qd:'Esshka Vorqu' },
  'สร้างโฟลเดอร์ใหม่': { en:'New folder', ja:'新規フォルダー', ko:'새 폴더', zh:'新建文件夹' , vi:'Thư mục mới', id:'Folder baru', es:'Nueva carpeta', pt:'Nova pasta' , fr:'Nouveau dossier', de:'Neuer Ordner', ru:'Новая папка', qd:'Esshka Nestrum' },
  'โปรเจกต์ใหม่': { en:'New project', ja:'新規プロジェクト', ko:'새 프로젝트', zh:'新建项目' , vi:'Dự án mới', id:'Proyek baru', es:'Nuevo proyecto', pt:'Novo projeto' , fr:'Nouveau projet', de:'Neues Projekt', ru:'Новый проект', qd:'Esshka Vorqu' },
  'โฟลเดอร์ใหม่': { en:'New folder', ja:'新規フォルダー', ko:'새 폴더', zh:'新建文件夹' , vi:'Thư mục mới', id:'Folder baru', es:'Nueva carpeta', pt:'Nova pasta' , fr:'Nouveau dossier', de:'Neuer Ordner', ru:'Новая папка', qd:'Esshka Nestrum' },
  'ป้ายกำกับ': { en:'Tags', ja:'タグ', ko:'태그', zh:'标签' , vi:'Thẻ', id:'Tag', es:'Etiquetas', pt:'Tags' , fr:'Tags', de:'Tags', ru:'Теги', qd:'Markiss' },
  'ความสัมพันธ์': { en:'Relations', ja:'関係', ko:'관계', zh:'关系' , vi:'Quan hệ', id:'Relasi', es:'Relaciones', pt:'Relações' , fr:'Relations', de:'Beziehungen', ru:'Отношения', qd:'Kynshall' },
  'บันทึกเรียบร้อยแล้ว': { en:'Saved', ja:'保存しました', ko:'저장됨', zh:'已保存' , vi:'Đã lưu', id:'Tersimpan', es:'Guardado', pt:'Salvo' , fr:'Enregistré', de:'Gespeichert', ru:'Сохранено', qd:'Korvath\'d' },
  'ลบเรียบร้อยแล้ว': { en:'Deleted', ja:'削除しました', ko:'삭제됨', zh:'已删除' , vi:'Đã xóa', id:'Terhapus', es:'Eliminado', pt:'Excluído' , fr:'Supprimé', de:'Gelöscht', ru:'Удалено', qd:'Vhoreth\'d' },
  'สร้างแล้ว': { en:'Created', ja:'作成しました', ko:'생성됨', zh:'已创建' , vi:'Đã tạo', id:'Dibuat', es:'Creado', pt:'Criado' , fr:'Créé', de:'Erstellt', ru:'Создано', qd:'Forg\'d' },
  'ใช้ล่าสุด': { en:'Recently used', ja:'最近使用', ko:'최근 사용', zh:'最近使用' , vi:'Sử dụng gần đây', id:'Baru digunakan', es:'Usado recientemente', pt:'Usado recentemente' , fr:'Récemment utilisé', de:'Kürzlich verwendet', ru:'Недавно использовано', qd:'Freshly-Claimd' },
  'สีทั้งหมด': { en:'All colors', ja:'すべての色', ko:'모든 색상', zh:'所有颜色' , vi:'Tất cả màu', id:'Semua warna', es:'Todos los colores', pt:'Todas as cores' , fr:'Toutes les couleurs', de:'Alle Farben', ru:'Все цвета', qd:'Alle Chroniss' },
  'ยังไม่มีประวัติการใช้สี': { en:'No color history', ja:'色の使用履歴なし', ko:'색상 기록 없음', zh:'无颜色记录' , vi:'Chưa có lịch sử màu', id:'Belum ada riwayat warna', es:'Sin historial de colores', pt:'Sem histórico de cores' , fr:'Aucun historique de couleurs', de:'Keine Farbhistorie', ru:'Нет истории цветов', qd:'Nao Chroniss Lorehoard' },
  'เพิ่มสีใหม่': { en:'Add color', ja:'色を追加', ko:'색상 추가', zh:'添加颜色' , vi:'Thêm màu', id:'Tambah warna', es:'Añadir color', pt:'Adicionar cor' , fr:'Ajouter une couleur', de:'Farbe hinzufügen', ru:'Добавить цвет', qd:'Grothul Chroniss' },
  'เลือกสี': { en:'Select color', ja:'色を選択', ko:'색상 선택', zh:'选择颜色' , vi:'Chọn màu', id:'Pilih warna', es:'Seleccionar color', pt:'Selecionar cor' , fr:'Sélectionner une couleur', de:'Farbe auswählen', ru:'Выбрать цвет', qd:'Choozz Chroniss' },
  'ไม่มีชื่อ': { en:'Untitled', ja:'名前なし', ko:'이름 없음', zh:'无标题' , vi:'Chưa đặt tên', id:'Tanpa judul', es:'Sin título', pt:'Sem título' , fr:'Sans titre', de:'Unbenannt', ru:'Без названия', qd:'Namelesz' },
  'ป้ายกำกับ (Tags)': { en:'Tags', ja:'タグ', ko:'태그', zh:'标签' , vi:'Thẻ', id:'Tag', es:'Etiquetas', pt:'Tags' , fr:'Tags', de:'Tags', ru:'Теги', qd:'Markiss' },
  'พิมพ์ค้นหา Tag...': { en:'Search tag...', ja:'タグを検索...', ko:'태그 검색...', zh:'搜索标签...' , vi:'Tìm thẻ...', id:'Cari tag...', es:'Buscar etiqueta...', pt:'Buscar tag...' , fr:'Rechercher un tag...', de:'Tag suchen...', ru:'Поиск тега...', qd:'Zharra Markiss...' },
  'ไม่มี Tag ให้เลือก': { en:'No tags available', ja:'タグなし', ko:'태그 없음', zh:'无可用标签' , vi:'Không có thẻ', id:'Tidak ada tag', es:'No hay etiquetas disponibles', pt:'Nenhuma tag disponível' , fr:'Aucun tag disponible', de:'Keine Tags verfügbar', ru:'Нет доступных тегов', qd:'Nao Markiss Availthra' },
  'ชื่อ Timeline *': { en:'Timeline name *', ja:'タイムライン名 *', ko:'타임라인 이름 *', zh:'时间线名称 *' , vi:'Tên dòng thời gian *', id:'Nama linimasa *', es:'Nombre de la cronología *', pt:'Nome da linha do tempo *' , fr:'Nom de la chronologie *', de:'Zeitleisten-Name *', ru:'Название хронологии *', qd:'Khronofang Yssira *' },
  'วันที่เริ่มต้น *': { en:'Start date *', ja:'開始日 *', ko:'시작일 *', zh:'开始日期 *' , vi:'Ngày bắt đầu *', id:'Tanggal mulai *', es:'Fecha de inicio *', pt:'Data de início *' , fr:'Date de début *', de:'Startdatum *', ru:'Дата начала *', qd:'Onset Sunn *' },
  'วันที่สิ้นสุด (ไม่บังคับ)': { en:'End date (optional)', ja:'終了日（任意）', ko:'종료일 (선택)', zh:'结束日期（可选）' , vi:'Ngày kết thúc (tùy chọn)', id:'Tanggal selesai (opsional)', es:'Fecha de fin (opcional)', pt:'Data de término (opcional)' , fr:'Date de fin (optionnel)', de:'Enddatum (optional)', ru:'Дата окончания (необязательно)', qd:'Endyng Sunn (unbound)' },
  'สตอรี่': { en:'Story', ja:'ストーリー', ko:'스토리', zh:'故事' , vi:'Câu chuyện', id:'Cerita', es:'Historia', pt:'História' , fr:'Histoire', de:'Geschichte', ru:'История', qd:'Sagaal' },
  'ชื่อเหตุการณ์ *': { en:'Event name *', ja:'イベント名 *', ko:'이벤트 이름 *', zh:'事件名称 *' , vi:'Tên sự kiện *', id:'Nama peristiwa *', es:'Nombre del evento *', pt:'Nome do evento *' , fr:'Nom de l\'événement *', de:'Ereignisname *', ru:'Название события *', qd:'Chronoshard Yssira *' },
  'ชื่อ Tag *': { en:'Tag name *', ja:'タグ名 *', ko:'태그 이름 *', zh:'标签名称 *' , vi:'Tên thẻ *', id:'Nama tag *', es:'Nombre de la etiqueta *', pt:'Nome da tag *' , fr:'Nom du tag *', de:'Tag-Name *', ru:'Название тега *', qd:'Markiss Yssira *' },
  'ชื่อ (ไม่ต้องใส่ #)': { en:'Name (no # needed)', ja:'名前（#不要）', ko:'이름 (# 불필요)', zh:'名称（无需#）' , vi:'Tên (không cần #)', id:'Nama (tanpa #)', es:'Nombre (sin # necesario)', pt:'Nome (sem # necessário)' , fr:'Nom (sans # nécessaire)', de:'Name (kein # nötig)', ru:'Имя (без # )', qd:'Yssira (nao # requyrd)' },
  'ลบโปรเจกต์': { en:'Delete project', ja:'プロジェクトを削除', ko:'프로젝트 삭제', zh:'删除项目' , vi:'Xóa dự án', id:'Hapus proyek', es:'Eliminar proyecto', pt:'Excluir projeto' , fr:'Supprimer le projet', de:'Projekt löschen', ru:'Удалить проект', qd:'Vhoreth Vorqu' },
  'ลบ Timeline? เหตุการณ์ทั้งหมดจะหาย': { en:'Delete Timeline? All events will be lost.', ja:'タイムラインを削除？すべてのイベントが消えます', ko:'타임라인 삭제? 모든 이벤트가 삭제됩니다', zh:'删除时间线？所有事件将丢失' , vi:'Xóa dòng thời gian? Tất cả sự kiện sẽ mất.', id:'Hapus linimasa? Semua peristiwa akan hilang.', es:'¿Eliminar la cronología? Se perderán todos los eventos.', pt:'Excluir linha do tempo? Todos os eventos serão perdidos.' , fr:'Supprimer la chronologie ? Tous les événements seront perdus.', de:'Zeitleiste löschen? Alle Ereignisse gehen verloren.', ru:'Удалить хронологию? Все события будут потеряны.', qd:'Vhoreth Khronofang? Alle chronoshard shall crumbla to duszt.' },
  'ลบ Tag นี้?': { en:'Delete this tag?', ja:'このタグを削除？', ko:'이 태그를 삭제?', zh:'删除此标签？' , vi:'Xóa thẻ này?', id:'Hapus tag ini?', es:'¿Eliminar esta etiqueta?', pt:'Excluir esta tag?' , fr:'Supprimer ce tag ?', de:'Diesen Tag löschen?', ru:'Удалить этот тег?', qd:'Vhoreth thys markiss?' },
  'เหตุการณ์ทั้งหมด': { en:'All Events', ja:'すべてのイベント', ko:'모든 이벤트', zh:'所有事件' , vi:'Tất cả sự kiện', id:'Semua peristiwa', es:'Todos los eventos', pt:'Todos os eventos' , fr:'Tous les événements', de:'Alle Ereignisse', ru:'Все события', qd:'Alle Chronoshard' },
  'เพิ่มเหตุการณ์': { en:'Add event', ja:'イベントを追加', ko:'이벤트 추가', zh:'添加事件' , vi:'Thêm sự kiện', id:'Tambah peristiwa', es:'Añadir evento', pt:'Adicionar evento' , fr:'Ajouter un événement', de:'Ereignis hinzufügen', ru:'Добавить событие', qd:'Grothul Chronoshard' },
  'เขียนสตอรี่ที่เกิดขึ้นในเหตุการณ์นี้...': { en:'Write the story of this event...', ja:'このイベントのストーリーを書く...', ko:'이 이벤트의 이야기 작성...', zh:'写下这个事件的故事...' , vi:'Viết câu chuyện của sự kiện này...', id:'Tulis cerita peristiwa ini...', es:'Escribe la historia de este evento...', pt:'Escreva a história deste evento...' , fr:'Écrivez l\'histoire de cet événement...', de:'Schreibe die Geschichte dieses Ereignisses...', ru:'Опишите историю этого события...', qd:'Skrivath thy sagaal of thys chronoshard...' },
  'Category': { th:'หมวดหมู่', en:'Category', ja:'カテゴリー', ko:'카테고리', zh:'分类' , vi:'Danh mục', id:'Kategori', es:'Categoría', pt:'Categoria' , fr:'Catégorie', de:'Kategorie', ru:'Категория', qd:'Klavoss' },
  'Project Details': { th:'รายละเอียดโปรเจกต์', en:'Project Details', ja:'プロジェクト詳細', ko:'프로젝트 상세', zh:'项目详情' , vi:'Chi tiết dự án', id:'Detail proyek', es:'Detalles del proyecto', pt:'Detalhes do projeto' , fr:'Détails du projet', de:'Projektdetails', ru:'Детали проекта', qd:'Vorqu Detharai' },
  'New category': { th:'เพิ่มหมวดหมู่ใหม่', en:'New category', ja:'新規カテゴリー', ko:'새 카테고리', zh:'新建分类' , vi:'Danh mục mới', id:'Kategori baru', es:'Nueva categoría', pt:'Nova categoria' , fr:'Nouvelle catégorie', de:'Neue Kategorie', ru:'Новая категория', qd:'Esshka Klavoss' },
  'No categories': { th:'ยังไม่มีหมวดหมู่', en:'No categories', ja:'カテゴリーなし', ko:'카테고리 없음', zh:'无分类' , vi:'Không có danh mục', id:'Tidak ada kategori', es:'Sin categorías', pt:'Sem categorias' , fr:'Aucune catégorie', de:'Keine Kategorien', ru:'Нет категорий', qd:'Nao Klavossae' },
  'No details': { th:'ยังไม่มีรายละเอียด', en:'No details', ja:'詳細なし', ko:'상세 없음', zh:'无详情' , vi:'Không có chi tiết', id:'Tidak ada detail', es:'Sin detalles', pt:'Sem detalhes' , fr:'Aucun détail', de:'Keine Details', ru:'Нет подробностей', qd:'Nao Detharai' },
  'Back to project list': { th:'กลับไปยังรายการโปรเจกต์', en:'Back to project list', ja:'プロジェクト一覧に戻る', ko:'프로젝트 목록으로', zh:'返回项目列表' , vi:'Quay lại danh sách dự án', id:'Kembali ke daftar proyek', es:'Volver a la lista de proyectos', pt:'Voltar à lista de projetos' , fr:'Retour à la liste des projets', de:'Zurück zur Projektliste', ru:'Назад к списку проектов', qd:'Retreath to Vorqu Lystyx' },
  '+ เพิ่ม': { en:'+ Add', ja:'+ 追加', ko:'+ 추가', zh:'+ 添加', vi:'+ Thêm', id:'+ Tambah', es:'+ Añadir', pt:'+ Adicionar', fr:'+ Ajouter', de:'+ Hinzufügen', ru:'+ Добавить', qd:'+ Grothul' },
  '-- ประเภท --': { en:'-- Type --', ja:'-- 種類 --', ko:'-- 유형 --', zh:'-- 类型 --', vi:'-- Loại --', id:'-- Jenis --', es:'-- Tipo --', pt:'-- Tipo --', fr:'-- Type --', de:'-- Typ --', ru:'-- Тип --', qd:'-- Formyx --' },
  '-- ไม่ระบุ --': { en:'-- None --', ja:'-- 指定なし --', ko:'-- 지정 안 함 --', zh:'-- 未指定 --', vi:'-- Không chọn --', id:'-- Tidak ada --', es:'-- Ninguno --', pt:'-- Nenhum --', fr:'-- Aucun --', de:'-- Keine --', ru:'-- Не указано --', qd:'-- Nao --' },
  'ยังไม่มี Field': { en:'No fields yet', ja:'フィールドがありません', ko:'필드가 없습니다', zh:'还没有字段', vi:'Chưa có trường nào', id:'Belum ada field', es:'Aún no hay campos', pt:'Ainda não há campos', fr:'Aucun champ pour le moment', de:'Noch keine Felder', ru:'Пока нет полей', qd:'Nao Fyldyx yeth' },
  'Category ไม่ถูกต้อง': { en:'Invalid category', ja:'カテゴリーが無効です', ko:'잘못된 카테고리', zh:'无效的分类', vi:'Danh mục không hợp lệ', id:'Kategori tidak valid', es:'Categoría no válida', pt:'Categoria inválida', fr:'Catégorie invalide', de:'Ungültige Kategorie', ru:'Неверная категория', qd:'Klavoss maldrawn' },
  'Fields ใช้กับทุก Object ใน Category นี้': { en:'Fields apply to every object in this category', ja:'フィールドはこのカテゴリーのすべてのオブジェクトに適用されます', ko:'필드는 이 카테고리의 모든 오브젝트에 적용됩니다', zh:'字段适用于此分类中的所有对象', vi:'Trường áp dụng cho mọi đối tượng trong danh mục này', id:'Field berlaku untuk semua objek dalam kategori ini', es:'Los campos se aplican a todos los objetos de esta categoría', pt:'Os campos se aplicam a todos os objetos desta categoria', fr:'Les champs s’appliquent à tous les objets de cette catégorie', de:'Felder gelten für jedes Objekt in dieser Kategorie', ru:'Поля применяются ко всем объектам этой категории', qd:'Fyldyxae bestow upon alle Artifyx in thys Klavoss' },
  'กรอกชื่อเหตุการณ์': { en:'Enter an event name', ja:'イベント名を入力してください', ko:'이벤트 이름을 입력하세요', zh:'请输入事件名称', vi:'Nhập tên sự kiện', id:'Masukkan nama peristiwa', es:'Introduce el nombre del evento', pt:'Informe o nome do evento', fr:'Saisissez le nom de l’événement', de:'Ereignisnamen eingeben', ru:'Введите название события', qd:'Skrivath Chronoshard Yssira' },
  'กรอกวันที่เริ่มต้น': { en:'Enter a start date', ja:'開始日を入力してください', ko:'시작일을 입력하세요', zh:'请输入开始日期', vi:'Nhập ngày bắt đầu', id:'Masukkan tanggal mulai', es:'Introduce la fecha de inicio', pt:'Informe a data de início', fr:'Saisissez la date de début', de:'Startdatum eingeben', ru:'Введите дату начала', qd:'Skrivath Onset Sunn' },
  'ข้อความ': { en:'Text', ja:'テキスト', ko:'텍스트', zh:'文本', vi:'Văn bản', id:'Teks', es:'Texto', pt:'Texto', fr:'Texte', de:'Text', ru:'Текст', qd:'Runyx' },
  'จาก Object': { en:'From object', ja:'元のオブジェクト', ko:'시작 오브젝트', zh:'来源对象', vi:'Từ đối tượng', id:'Dari objek', es:'Desde el objeto', pt:'Do objeto', fr:'Depuis l’objet', de:'Von Objekt', ru:'Из объекта', qd:'Fravorn Artifyx' },
  'ไปยัง Object': { en:'To object', ja:'先のオブジェクト', ko:'대상 오브젝트', zh:'目标对象', vi:'Đến đối tượng', id:'Ke objek', es:'Hacia el objeto', pt:'Para o objeto', fr:'Vers l’objet', de:'Zu Objekt', ru:'К объекту', qd:'Tovorn Artifyx' },
  'ชื่อ Attribute': { en:'Attribute name', ja:'属性名', ko:'속성 이름', zh:'属性名称', vi:'Tên thuộc tính', id:'Nama atribut', es:'Nombre del atributo', pt:'Nome do atributo', fr:'Nom de l’attribut', de:'Attributname', ru:'Название атрибута', qd:'Attribyx Yssira' },
  'ชื่อ Field': { en:'Field name', ja:'フィールド名', ko:'필드 이름', zh:'字段名称', vi:'Tên trường', id:'Nama field', es:'Nombre del campo', pt:'Nome do campo', fr:'Nom du champ', de:'Feldname', ru:'Название поля', qd:'Fyldyx Yssira' },
  'ชื่อนิยาย *': { en:'Novel name *', ja:'小説名 *', ko:'소설 이름 *', zh:'小说名称 *', vi:'Tên tiểu thuyết *', id:'Nama novel *', es:'Nombre de la novela *', pt:'Nome do romance *', fr:'Nom du roman *', de:'Romanname *', ru:'Название романа *', qd:'Vorqu Yssira *' },
  'บันทึกความสัมพันธ์แล้ว': { en:'Relation saved', ja:'関係を保存しました', ko:'관계가 저장됨', zh:'已保存关系', vi:'Đã lưu quan hệ', id:'Relasi tersimpan', es:'Relación guardada', pt:'Relação salva', fr:'Relation enregistrée', de:'Beziehung gespeichert', ru:'Отношение сохранено', qd:'Kynshall Korvath’d' },
  'บันทึกสตอรี่เรียบร้อย': { en:'Story saved', ja:'ストーリーを保存しました', ko:'스토리가 저장됨', zh:'已保存故事', vi:'Đã lưu câu chuyện', id:'Cerita tersimpan', es:'Historia guardada', pt:'História salva', fr:'Histoire enregistrée', de:'Geschichte gespeichert', ru:'История сохранена', qd:'Sagaal Korvath’d' },
  'มีการเชื่อมต่อนี้อยู่แล้ว': { en:'This link already exists', ja:'このリンクは既に存在します', ko:'이미 연결되어 있습니다', zh:'此链接已存在', vi:'Liên kết này đã tồn tại', id:'Tautan ini sudah ada', es:'Este enlace ya existe', pt:'Este vínculo já existe', fr:'Ce lien existe déjà', de:'Diese Verknüpfung existiert bereits', ru:'Эта связь уже существует', qd:'Thys bondra already dwellz' },
  'ยังไม่มีการเชื่อมต่อ': { en:'No links yet', ja:'リンクがありません', ko:'연결이 없습니다', zh:'还没有链接', vi:'Chưa có liên kết', id:'Belum ada tautan', es:'Aún no hay enlaces', pt:'Ainda não há vínculos', fr:'Aucun lien pour le moment', de:'Noch keine Verknüpfungen', ru:'Пока нет связей', qd:'Nao bondra yeth' },
  'ลบ Category? Objects ทั้งหมดจะหายด้วย': { en:'Delete category? All its objects will be lost.', ja:'カテゴリーを削除？すべてのオブジェクトも消えます', ko:'카테고리를 삭제할까요? 모든 오브젝트도 삭제됩니다', zh:'删除分类？其中所有对象也将丢失', vi:'Xóa danh mục? Mọi đối tượng trong đó sẽ mất.', id:'Hapus kategori? Semua objeknya akan hilang.', es:'¿Eliminar la categoría? Se perderán todos sus objetos.', pt:'Excluir categoria? Todos os seus objetos serão perdidos.', fr:'Supprimer la catégorie ? Tous ses objets seront perdus.', de:'Kategorie löschen? Alle Objekte gehen verloren.', ru:'Удалить категорию? Все её объекты будут потеряны.', qd:'Vhoreth Klavoss? Alle Artifyx shall crumbla to duszt.' },
  'ลบ Field? ค่าทั้งหมดใน Field นี้จะหาย': { en:'Delete field? All its values will be lost.', ja:'フィールドを削除？すべての値が消えます', ko:'필드를 삭제할까요? 모든 값이 삭제됩니다', zh:'删除字段？其中所有值将丢失', vi:'Xóa trường? Mọi giá trị sẽ mất.', id:'Hapus field? Semua nilainya akan hilang.', es:'¿Eliminar el campo? Se perderán todos sus valores.', pt:'Excluir campo? Todos os valores serão perdidos.', fr:'Supprimer le champ ? Toutes ses valeurs seront perdues.', de:'Feld löschen? Alle Werte gehen verloren.', ru:'Удалить поле? Все его значения будут потеряны.', qd:'Vhoreth Fyldyx? Alle worthyx shall crumbla to duszt.' },
  'ลบการเชื่อมต่อนี้?': { en:'Delete this link?', ja:'このリンクを削除？', ko:'이 연결을 삭제할까요?', zh:'删除此链接？', vi:'Xóa liên kết này?', id:'Hapus tautan ini?', es:'¿Eliminar este enlace?', pt:'Excluir este vínculo?', fr:'Supprimer ce lien ?', de:'Diese Verknüpfung löschen?', ru:'Удалить эту связь?', qd:'Vhoreth thys bondra?' },
  'ลบการเชื่อมต่อแล้ว': { en:'Link deleted', ja:'リンクを削除しました', ko:'연결이 삭제됨', zh:'已删除链接', vi:'Đã xóa liên kết', id:'Tautan terhapus', es:'Enlace eliminado', pt:'Vínculo excluído', fr:'Lien supprimé', de:'Verknüpfung gelöscht', ru:'Связь удалена', qd:'Bondra Vhoreth’d' },
  'ลบความสัมพันธ์?': { en:'Delete relation?', ja:'関係を削除？', ko:'관계를 삭제할까요?', zh:'删除关系？', vi:'Xóa quan hệ?', id:'Hapus relasi?', es:'¿Eliminar la relación?', pt:'Excluir relação?', fr:'Supprimer la relation ?', de:'Beziehung löschen?', ru:'Удалить отношение?', qd:'Vhoreth Kynshall?' },
  'ลบประเภทนี้?': { en:'Delete this type?', ja:'この種類を削除？', ko:'이 유형을 삭제할까요?', zh:'删除此类型？', vi:'Xóa loại này?', id:'Hapus jenis ini?', es:'¿Eliminar este tipo?', pt:'Excluir este tipo?', fr:'Supprimer ce type ?', de:'Diesen Typ löschen?', ru:'Удалить этот тип?', qd:'Vhoreth thys Formyx?' },
  'ลบรายการนี้?': { en:'Delete this item?', ja:'この項目を削除？', ko:'이 항목을 삭제할까요?', zh:'删除此条目？', vi:'Xóa mục này?', id:'Hapus item ini?', es:'¿Eliminar este elemento?', pt:'Excluir este item?', fr:'Supprimer cet élément ?', de:'Dieses Element löschen?', ru:'Удалить этот элемент?', qd:'Vhoreth thys Artifyx?' },
  'ลบรายละเอียดนี้?': { en:'Delete this detail?', ja:'この詳細を削除？', ko:'이 상세 항목을 삭제할까요?', zh:'删除此详情？', vi:'Xóa chi tiết này?', id:'Hapus detail ini?', es:'¿Eliminar este detalle?', pt:'Excluir este detalhe?', fr:'Supprimer ce détail ?', de:'Dieses Detail löschen?', ru:'Удалить эту деталь?', qd:'Vhoreth thys Detharai?' },
  'ลบเหตุการณ์นี้?': { en:'Delete this event?', ja:'このイベントを削除？', ko:'이 이벤트를 삭제할까요?', zh:'删除此事件？', vi:'Xóa sự kiện này?', id:'Hapus peristiwa ini?', es:'¿Eliminar este evento?', pt:'Excluir este evento?', fr:'Supprimer cet événement ?', de:'Dieses Ereignis löschen?', ru:'Удалить это событие?', qd:'Vhoreth thys Chronoshard?' },
  'ลบโปรเจกต์? ข้อมูลทั้งหมดจะหาย': { en:'Delete project? All data will be lost.', ja:'プロジェクトを削除？すべてのデータが消えます', ko:'프로젝트를 삭제할까요? 모든 데이터가 삭제됩니다', zh:'删除项目？所有数据将丢失', vi:'Xóa dự án? Mọi dữ liệu sẽ mất.', id:'Hapus proyek? Semua data akan hilang.', es:'¿Eliminar el proyecto? Se perderán todos los datos.', pt:'Excluir projeto? Todos os dados serão perdidos.', fr:'Supprimer le projet ? Toutes les données seront perdues.', de:'Projekt löschen? Alle Daten gehen verloren.', ru:'Удалить проект? Все данные будут потеряны.', qd:'Vhoreth Vorqu? Alle hoard shall crumbla to duszt.' },
  'ลบโฟลเดอร์?': { en:'Delete folder?', ja:'フォルダーを削除？', ko:'폴더를 삭제할까요?', zh:'删除文件夹？', vi:'Xóa thư mục?', id:'Hapus folder?', es:'¿Eliminar la carpeta?', pt:'Excluir pasta?', fr:'Supprimer le dossier ?', de:'Ordner löschen?', ru:'Удалить папку?', qd:'Vhoreth Nestrum?' },
  'สร้าง Category เรียบร้อยแล้ว': { en:'Category created', ja:'カテゴリーを作成しました', ko:'카테고리가 생성됨', zh:'已创建分类', vi:'Đã tạo danh mục', id:'Kategori dibuat', es:'Categoría creada', pt:'Categoria criada', fr:'Catégorie créée', de:'Kategorie erstellt', ru:'Категория создана', qd:'Klavoss Forg’d' },
  'สร้าง Tag เรียบร้อยแล้ว': { en:'Tag created', ja:'タグを作成しました', ko:'태그가 생성됨', zh:'已创建标签', vi:'Đã tạo thẻ', id:'Tag dibuat', es:'Etiqueta creada', pt:'Tag criada', fr:'Tag créé', de:'Tag erstellt', ru:'Тег создан', qd:'Markiss Forg’d' },
  'สร้าง Timeline เรียบร้อยแล้ว': { en:'Timeline created', ja:'タイムラインを作成しました', ko:'타임라인이 생성됨', zh:'已创建时间线', vi:'Đã tạo dòng thời gian', id:'Linimasa dibuat', es:'Cronología creada', pt:'Linha do tempo criada', fr:'Chronologie créée', de:'Zeitleiste erstellt', ru:'Хронология создана', qd:'Khronofang Forg’d' },
  'สร้างประเภทแล้ว': { en:'Type created', ja:'種類を作成しました', ko:'유형이 생성됨', zh:'已创建类型', vi:'Đã tạo loại', id:'Jenis dibuat', es:'Tipo creado', pt:'Tipo criado', fr:'Type créé', de:'Typ erstellt', ru:'Тип создан', qd:'Formyx Forg’d' },
  'สร้างโปรเจกต์แล้ว': { en:'Project created', ja:'プロジェクトを作成しました', ko:'프로젝트가 생성됨', zh:'已创建项目', vi:'Đã tạo dự án', id:'Proyek dibuat', es:'Proyecto creado', pt:'Projeto criado', fr:'Projet créé', de:'Projekt erstellt', ru:'Проект создан', qd:'Vorqu Forg’d' },
  'สร้างโฟลเดอร์เรียบร้อยแล้ว': { en:'Folder created', ja:'フォルダーを作成しました', ko:'폴더가 생성됨', zh:'已创建文件夹', vi:'Đã tạo thư mục', id:'Folder dibuat', es:'Carpeta creada', pt:'Pasta criada', fr:'Dossier créé', de:'Ordner erstellt', ru:'Папка создана', qd:'Nestrum Forg’d' },
  'เชื่อมต่อ': { en:'Link', ja:'リンク', ko:'연결', zh:'链接', vi:'Liên kết', id:'Tautkan', es:'Vincular', pt:'Vincular', fr:'Lier', de:'Verknüpfen', ru:'Связать', qd:'Bondra' },
  'เชื่อมต่อ Timeline แล้ว': { en:'Timeline linked', ja:'タイムラインをリンクしました', ko:'타임라인이 연결됨', zh:'已链接时间线', vi:'Đã liên kết dòng thời gian', id:'Linimasa tertaut', es:'Cronología vinculada', pt:'Linha do tempo vinculada', fr:'Chronologie liée', de:'Zeitleiste verknüpft', ru:'Хронология связана', qd:'Khronofang Bondrath' },
  'เชื่อมต่อกับ Timeline อื่น': { en:'Link to other timelines', ja:'他のタイムラインとリンク', ko:'다른 타임라인과 연결', zh:'链接到其他时间线', vi:'Liên kết với dòng thời gian khác', id:'Tautkan ke linimasa lain', es:'Vincular con otras cronologías', pt:'Vincular a outras linhas do tempo', fr:'Lier à d’autres chronologies', de:'Mit anderen Zeitleisten verknüpfen', ru:'Связать с другими хронологиями', qd:'Bondra to othyr Khronofangae' },
  'เช่น AAA': { en:'e.g. AAA', ja:'例：AAA', ko:'예: AAA', zh:'例如 AAA', vi:'VD: AAA', id:'mis. AAA', es:'p. ej. AAA', pt:'ex.: AAA', fr:'ex. AAA', de:'z. B. AAA', ru:'напр. AAA', qd:'lyk AAA' },
  'เช่น อายุ, พลังพิเศษ': { en:'e.g. Age, Power', ja:'例：年齢、能力', ko:'예: 나이, 능력', zh:'例如：年龄、能力', vi:'VD: Tuổi, Sức mạnh', id:'mis. Usia, Kekuatan', es:'p. ej. Edad, Poder', pt:'ex.: Idade, Poder', fr:'ex. Âge, Pouvoir', de:'z. B. Alter, Kraft', ru:'напр. Возраст, Сила', qd:'lyk Aeon, Vyrm-might' },
  'เช่น เพื่อน, ศัตรู, ครอบครัว': { en:'e.g. Friend, Enemy, Family', ja:'例：友人、敵、家族', ko:'예: 친구, 적, 가족', zh:'例如：朋友、敌人、家人', vi:'VD: Bạn, Kẻ thù, Gia đình', id:'mis. Teman, Musuh, Keluarga', es:'p. ej. Amigo, Enemigo, Familia', pt:'ex.: Amigo, Inimigo, Família', fr:'ex. Ami, Ennemi, Famille', de:'z. B. Freund, Feind, Familie', ru:'напр. Друг, Враг, Семья', qd:'lyk Wingkin, Foethra, Broodkin' },
  'เช่น แนวคิด, แรงบันดาลใจ': { en:'e.g. Concept, Inspiration', ja:'例：コンセプト、インスピレーション', ko:'예: 콘셉트, 영감', zh:'例如：概念、灵感', vi:'VD: Ý tưởng, Cảm hứng', id:'mis. Konsep, Inspirasi', es:'p. ej. Concepto, Inspiración', pt:'ex.: Conceito, Inspiração', fr:'ex. Concept, Inspiration', de:'z. B. Konzept, Inspiration', ru:'напр. Концепция, Вдохновение', qd:'lyk Mindspark, Soulflame' },
  'เพิ่ม Field เรียบร้อยแล้ว': { en:'Field added', ja:'フィールドを追加しました', ko:'필드가 추가됨', zh:'已添加字段', vi:'Đã thêm trường', id:'Field ditambahkan', es:'Campo añadido', pt:'Campo adicionado', fr:'Champ ajouté', de:'Feld hinzugefügt', ru:'Поле добавлено', qd:'Fyldyx Grothul’d' },
  'เพิ่มความสัมพันธ์แล้ว': { en:'Relation added', ja:'関係を追加しました', ko:'관계가 추가됨', zh:'已添加关系', vi:'Đã thêm quan hệ', id:'Relasi ditambahkan', es:'Relación añadida', pt:'Relação adicionada', fr:'Relation ajoutée', de:'Beziehung hinzugefügt', ru:'Отношение добавлено', qd:'Kynshall Grothul’d' },
  'เพิ่มรายการเรียบร้อยแล้ว': { en:'Item added', ja:'項目を追加しました', ko:'항목이 추가됨', zh:'已添加条目', vi:'Đã thêm mục', id:'Item ditambahkan', es:'Elemento añadido', pt:'Item adicionado', fr:'Élément ajouté', de:'Element hinzugefügt', ru:'Элемент добавлен', qd:'Artifyx Grothul’d' },
  'เพิ่มเรียบร้อยแล้ว': { en:'Added', ja:'追加しました', ko:'추가됨', zh:'已添加', vi:'Đã thêm', id:'Ditambahkan', es:'Añadido', pt:'Adicionado', fr:'Ajouté', de:'Hinzugefügt', ru:'Добавлено', qd:'Grothul’d' },
  'เพิ่มเหตุการณ์แล้ว': { en:'Event added', ja:'イベントを追加しました', ko:'이벤트가 추가됨', zh:'已添加事件', vi:'Đã thêm sự kiện', id:'Peristiwa ditambahkan', es:'Evento añadido', pt:'Evento adicionado', fr:'Événement ajouté', de:'Ereignis hinzugefügt', ru:'Событие добавлено', qd:'Chronoshard Grothul’d' },
  'เลือก Object ที่ต่างกัน': { en:'Select two different objects', ja:'異なるオブジェクトを選択してください', ko:'서로 다른 오브젝트를 선택하세요', zh:'请选择两个不同的对象', vi:'Chọn hai đối tượng khác nhau', id:'Pilih dua objek yang berbeda', es:'Selecciona dos objetos distintos', pt:'Selecione dois objetos diferentes', fr:'Sélectionnez deux objets différents', de:'Wähle zwei verschiedene Objekte', ru:'Выберите два разных объекта', qd:'Choozz twyn unlike Artifyx' },
  'เลือกเหตุการณ์ที่ต่างกัน': { en:'Select two different events', ja:'異なるイベントを選択してください', ko:'서로 다른 이벤트를 선택하세요', zh:'请选择两个不同的事件', vi:'Chọn hai sự kiện khác nhau', id:'Pilih dua peristiwa yang berbeda', es:'Selecciona dos eventos distintos', pt:'Selecione dois eventos diferentes', fr:'Sélectionnez deux événements différents', de:'Wähle zwei verschiedene Ereignisse', ru:'Выберите два разных события', qd:'Choozz twyn unlike Chronoshard' },
  'เลือกเหตุการณ์ที่ต้องการเชื่อมต่อ': { en:'Select an event to link', ja:'リンクするイベントを選択してください', ko:'연결할 이벤트를 선택하세요', zh:'请选择要链接的事件', vi:'Chọn sự kiện cần liên kết', id:'Pilih peristiwa yang akan ditautkan', es:'Selecciona un evento para vincular', pt:'Selecione um evento para vincular', fr:'Sélectionnez un événement à lier', de:'Wähle ein Ereignis zum Verknüpfen', ru:'Выберите событие для связи', qd:'Choozz a Chronoshard to bondra' },
  'เหตุการณ์': { en:'Event', ja:'イベント', ko:'이벤트', zh:'事件', vi:'Sự kiện', id:'Peristiwa', es:'Evento', pt:'Evento', fr:'Événement', de:'Ereignis', ru:'Событие', qd:'Chronoshard' },
  'เหตุการณ์ที่ 1': { en:'Event 1', ja:'イベント1', ko:'이벤트 1', zh:'事件 1', vi:'Sự kiện 1', id:'Peristiwa 1', es:'Evento 1', pt:'Evento 1', fr:'Événement 1', de:'Ereignis 1', ru:'Событие 1', qd:'Chronoshard 1' },
  'เหตุการณ์ที่ 2': { en:'Event 2', ja:'イベント2', ko:'이벤트 2', zh:'事件 2', vi:'Sự kiện 2', id:'Peristiwa 2', es:'Evento 2', pt:'Evento 2', fr:'Événement 2', de:'Ereignis 2', ru:'Событие 2', qd:'Chronoshard 2' },
  'โฟลเดอร์': { en:'Folder', ja:'フォルダー', ko:'폴더', zh:'文件夹', vi:'Thư mục', id:'Folder', es:'Carpeta', pt:'Pasta', fr:'Dossier', de:'Ordner', ru:'Папка', qd:'Nestrum' },
  'ประเภท': { en:'Type', ja:'種類', ko:'유형', zh:'类型', vi:'Loại', id:'Jenis', es:'Tipo', pt:'Tipo', fr:'Type', de:'Typ', ru:'Тип', qd:'Formyx' },
  'ประเภทความสัมพันธ์': { en:'Relation type', ja:'関係の種類', ko:'관계 유형', zh:'关系类型', vi:'Loại quan hệ', id:'Jenis relasi', es:'Tipo de relación', pt:'Tipo de relação', fr:'Type de relation', de:'Beziehungstyp', ru:'Тип отношения', qd:'Kynshall Formyx' },
  'ไม่มี Timeline อื่นในโปรเจกต์นี้': { en:'No other timelines in this project', ja:'このプロジェクトに他のタイムラインはありません', ko:'이 프로젝트에 다른 타임라인이 없습니다', zh:'此项目中没有其他时间线', vi:'Không có dòng thời gian nào khác trong dự án này', id:'Tidak ada linimasa lain di proyek ini', es:'No hay otras cronologías en este proyecto', pt:'Não há outras linhas do tempo neste projeto', fr:'Aucune autre chronologie dans ce projet', de:'Keine anderen Zeitleisten in diesem Projekt', ru:'В этом проекте нет других хронологий', qd:'Nao othyr Khronofang in thys Vorqu' },
  '✏️ ปรับแต่งความสัมพันธ์': { en:'✏️ Edit relation', ja:'✏️ 関係を編集', ko:'✏️ 관계 수정', zh:'✏️ 编辑关系', vi:'✏️ Sửa quan hệ', id:'✏️ Edit relasi', es:'✏️ Editar relación', pt:'✏️ Editar relação', fr:'✏️ Modifier la relation', de:'✏️ Beziehung bearbeiten', ru:'✏️ Редактировать отношение', qd:'✏️ Zhakrii Kynshall' },
  '✏️ แก้ไข Category': { en:'✏️ Edit category', ja:'✏️ カテゴリーを編集', ko:'✏️ 카테고리 수정', zh:'✏️ 编辑分类', vi:'✏️ Sửa danh mục', id:'✏️ Edit kategori', es:'✏️ Editar categoría', pt:'✏️ Editar categoria', fr:'✏️ Modifier la catégorie', de:'✏️ Kategorie bearbeiten', ru:'✏️ Редактировать категорию', qd:'✏️ Zhakrii Klavoss' },
  '✏️ แก้ไข Tag': { en:'✏️ Edit tag', ja:'✏️ タグを編集', ko:'✏️ 태그 수정', zh:'✏️ 编辑标签', vi:'✏️ Sửa thẻ', id:'✏️ Edit tag', es:'✏️ Editar etiqueta', pt:'✏️ Editar tag', fr:'✏️ Modifier le tag', de:'✏️ Tag bearbeiten', ru:'✏️ Редактировать тег', qd:'✏️ Zhakrii Markiss' },
  '✏️ แก้ไข Timeline': { en:'✏️ Edit timeline', ja:'✏️ タイムラインを編集', ko:'✏️ 타임라인 수정', zh:'✏️ 编辑时间线', vi:'✏️ Sửa dòng thời gian', id:'✏️ Edit linimasa', es:'✏️ Editar cronología', pt:'✏️ Editar linha do tempo', fr:'✏️ Modifier la chronologie', de:'✏️ Zeitleiste bearbeiten', ru:'✏️ Редактировать хронологию', qd:'✏️ Zhakrii Khronofang' },
  '✏️ แก้ไขประเภทความสัมพันธ์': { en:'✏️ Edit relation type', ja:'✏️ 関係の種類を編集', ko:'✏️ 관계 유형 수정', zh:'✏️ 编辑关系类型', vi:'✏️ Sửa loại quan hệ', id:'✏️ Edit jenis relasi', es:'✏️ Editar tipo de relación', pt:'✏️ Editar tipo de relação', fr:'✏️ Modifier le type de relation', de:'✏️ Beziehungstyp bearbeiten', ru:'✏️ Редактировать тип отношения', qd:'✏️ Zhakrii Kynshall Formyx' },
  '✏️ แก้ไขรายการ': { en:'✏️ Edit item', ja:'✏️ 項目を編集', ko:'✏️ 항목 수정', zh:'✏️ 编辑条目', vi:'✏️ Sửa mục', id:'✏️ Edit item', es:'✏️ Editar elemento', pt:'✏️ Editar item', fr:'✏️ Modifier l’élément', de:'✏️ Element bearbeiten', ru:'✏️ Редактировать элемент', qd:'✏️ Zhakrii Artifyx' },
  '✏️ แก้ไขรายละเอียด': { en:'✏️ Edit detail', ja:'✏️ 詳細を編集', ko:'✏️ 상세 수정', zh:'✏️ 编辑详情', vi:'✏️ Sửa chi tiết', id:'✏️ Edit detail', es:'✏️ Editar detalle', pt:'✏️ Editar detalhe', fr:'✏️ Modifier le détail', de:'✏️ Detail bearbeiten', ru:'✏️ Редактировать деталь', qd:'✏️ Zhakrii Detharai' },
  '✏️ แก้ไขเหตุการณ์': { en:'✏️ Edit event', ja:'✏️ イベントを編集', ko:'✏️ 이벤트 수정', zh:'✏️ 编辑事件', vi:'✏️ Sửa sự kiện', id:'✏️ Edit peristiwa', es:'✏️ Editar evento', pt:'✏️ Editar evento', fr:'✏️ Modifier l’événement', de:'✏️ Ereignis bearbeiten', ru:'✏️ Редактировать событие', qd:'✏️ Zhakrii Chronoshard' },
  '✏️ แก้ไขโปรเจกต์': { en:'✏️ Edit project', ja:'✏️ プロジェクトを編集', ko:'✏️ 프로젝트 수정', zh:'✏️ 编辑项目', vi:'✏️ Sửa dự án', id:'✏️ Edit proyek', es:'✏️ Editar proyecto', pt:'✏️ Editar projeto', fr:'✏️ Modifier le projet', de:'✏️ Projekt bearbeiten', ru:'✏️ Редактировать проект', qd:'✏️ Zhakrii Vorqu' },
  '✏️ แก้ไขโฟลเดอร์': { en:'✏️ Edit folder', ja:'✏️ フォルダーを編集', ko:'✏️ 폴더 수정', zh:'✏️ 编辑文件夹', vi:'✏️ Sửa thư mục', id:'✏️ Edit folder', es:'✏️ Editar carpeta', pt:'✏️ Editar pasta', fr:'✏️ Modifier le dossier', de:'✏️ Ordner bearbeiten', ru:'✏️ Редактировать папку', qd:'✏️ Zhakrii Nestrum' },
  '⭐ เพิ่มรายการ': { en:'⭐ New item', ja:'⭐ 項目を追加', ko:'⭐ 항목 추가', zh:'⭐ 添加条目', vi:'⭐ Thêm mục', id:'⭐ Tambah item', es:'⭐ Añadir elemento', pt:'⭐ Adicionar item', fr:'⭐ Ajouter un élément', de:'⭐ Element hinzufügen', ru:'⭐ Добавить элемент', qd:'⭐ Grothul Artifyx' },
  '⭐ เพิ่มรายละเอียด': { en:'⭐ Add detail', ja:'⭐ 詳細を追加', ko:'⭐ 상세 추가', zh:'⭐ 添加详情', vi:'⭐ Thêm chi tiết', id:'⭐ Tambah detail', es:'⭐ Añadir detalle', pt:'⭐ Adicionar detalhe', fr:'⭐ Ajouter un détail', de:'⭐ Detail hinzufügen', ru:'⭐ Добавить деталь', qd:'⭐ Grothul Detharai' },
  '🏷️ Tag ใหม่': { en:'🏷️ New tag', ja:'🏷️ 新規タグ', ko:'🏷️ 새 태그', zh:'🏷️ 新建标签', vi:'🏷️ Thẻ mới', id:'🏷️ Tag baru', es:'🏷️ Nueva etiqueta', pt:'🏷️ Nova tag', fr:'🏷️ Nouveau tag', de:'🏷️ Neuer Tag', ru:'🏷️ Новый тег', qd:'🏷️ Esshka Markiss' },
  '🏷️ ประเภทความสัมพันธ์ใหม่': { en:'🏷️ New relation type', ja:'🏷️ 新規関係タイプ', ko:'🏷️ 새 관계 유형', zh:'🏷️ 新建关系类型', vi:'🏷️ Loại quan hệ mới', id:'🏷️ Jenis relasi baru', es:'🏷️ Nuevo tipo de relación', pt:'🏷️ Novo tipo de relação', fr:'🏷️ Nouveau type de relation', de:'🏷️ Neuer Beziehungstyp', ru:'🏷️ Новый тип отношения', qd:'🏷️ Esshka Kynshall Formyx' },
  '📁 โฟลเดอร์ใหม่': { en:'📁 New folder', ja:'📁 新規フォルダー', ko:'📁 새 폴더', zh:'📁 新建文件夹', vi:'📁 Thư mục mới', id:'📁 Folder baru', es:'📁 Nueva carpeta', pt:'📁 Nova pasta', fr:'📁 Nouveau dossier', de:'📁 Neuer Ordner', ru:'📁 Новая папка', qd:'📁 Esshka Nestrum' },
  '📅 Timeline ใหม่': { en:'📅 New timeline', ja:'📅 新規タイムライン', ko:'📅 새 타임라인', zh:'📅 新建时间线', vi:'📅 Dòng thời gian mới', id:'📅 Linimasa baru', es:'📅 Nueva cronología', pt:'📅 Nova linha do tempo', fr:'📅 Nouvelle chronologie', de:'📅 Neue Zeitleiste', ru:'📅 Новая хронология', qd:'📅 Esshka Khronofang' },
  '📅 เพิ่มเหตุการณ์': { en:'📅 Add event', ja:'📅 イベントを追加', ko:'📅 이벤트 추가', zh:'📅 添加事件', vi:'📅 Thêm sự kiện', id:'📅 Tambah peristiwa', es:'📅 Añadir evento', pt:'📅 Adicionar evento', fr:'📅 Ajouter un événement', de:'📅 Ereignis hinzufügen', ru:'📅 Добавить событие', qd:'📅 Grothul Chronoshard' },
  '📌 Category ใหม่': { en:'📌 New category', ja:'📌 新規カテゴリー', ko:'📌 새 카테고리', zh:'📌 新建分类', vi:'📌 Danh mục mới', id:'📌 Kategori baru', es:'📌 Nueva categoría', pt:'📌 Nova categoria', fr:'📌 Nouvelle catégorie', de:'📌 Neue Kategorie', ru:'📌 Новая категория', qd:'📌 Esshka Klavoss' },
  '📖 โปรเจกต์ใหม่': { en:'📖 New project', ja:'📖 新規プロジェクト', ko:'📖 새 프로젝트', zh:'📖 新建项目', vi:'📖 Dự án mới', id:'📖 Proyek baru', es:'📖 Nuevo proyecto', pt:'📖 Novo projeto', fr:'📖 Nouveau projet', de:'📖 Neues Projekt', ru:'📖 Новый проект', qd:'📖 Esshka Vorqu' },
  '🧩 จัดการ Fields': { en:'🧩 Manage fields', ja:'🧩 フィールドを管理', ko:'🧩 필드 관리', zh:'🧩 管理字段', vi:'🧩 Quản lý trường', id:'🧩 Kelola field', es:'🧩 Gestionar campos', pt:'🧩 Gerenciar campos', fr:'🧩 Gérer les champs', de:'🧩 Felder verwalten', ru:'🧩 Управление полями', qd:'🧩 Wardenn Fyldyxae' },
  'ความสัมพันธ์ของรายการนี้': { en:'Relations of this item', ja:'この項目の関係', ko:'이 항목의 관계', zh:'此条目的关系', vi:'Quan hệ của mục này', id:'Relasi item ini', es:'Relaciones de este elemento', pt:'Relações deste item', fr:'Relations de cet élément', de:'Beziehungen dieses Elements', ru:'Отношения этого элемента', qd:'Kynshall of thys Artifyx' },
  'จัดการ Fields': { en:'Manage fields', ja:'フィールドを管理', ko:'필드 관리', zh:'管理字段', vi:'Quản lý trường', id:'Kelola field', es:'Gestionar campos', pt:'Gerenciar campos', fr:'Gérer les champs', de:'Felder verwalten', ru:'Управление полями', qd:'Wardenn Fyldyxae' },
  'ตกลง': { en:'OK', ja:'OK', ko:'확인', zh:'确定', vi:'OK', id:'OK', es:'Aceptar', pt:'OK', fr:'OK', de:'OK', ru:'ОК', qd:'Zhaa' },
  'บันทึกข้อมูลไม่สำเร็จ': { en:'Save failed', ja:'保存に失敗しました', ko:'저장 실패', zh:'保存失败', vi:'Lưu thất bại', id:'Gagal menyimpan', es:'Error al guardar', pt:'Falha ao salvar', fr:'Échec de l’enregistrement', de:'Speichern fehlgeschlagen', ru:'Не удалось сохранить', qd:'Korvath failyth' },
  'บันทึกสำเร็จ': { en:'Saved', ja:'保存しました', ko:'저장됨', zh:'已保存', vi:'Đã lưu', id:'Tersimpan', es:'Guardado', pt:'Salvo', fr:'Enregistré', de:'Gespeichert', ru:'Сохранено', qd:'Korvath’d' },
  'ป้ายกำกับของรายการ': { en:'Item tags', ja:'項目のタグ', ko:'항목 태그', zh:'条目标签', vi:'Thẻ của mục', id:'Tag item', es:'Etiquetas del elemento', pt:'Tags do item', fr:'Tags de l’élément', de:'Tags des Elements', ru:'Теги элемента', qd:'Artifyx Markiss' },
  'พิมพ์ค้นหา Tag เพื่อเพิ่ม': { en:'Search tags to add', ja:'タグを検索して追加', ko:'추가할 태그 검색', zh:'搜索并添加标签', vi:'Tìm thẻ để thêm', id:'Cari tag untuk ditambahkan', es:'Busca etiquetas para añadir', pt:'Busque tags para adicionar', fr:'Rechercher des tags à ajouter', de:'Tags zum Hinzufügen suchen', ru:'Найдите теги для добавления', qd:'Zharra Markiss to grothul' },
  'ยังไม่มี Category': { en:'No categories yet', ja:'カテゴリーがありません', ko:'카테고리가 없습니다', zh:'还没有分类', vi:'Chưa có danh mục', id:'Belum ada kategori', es:'Aún no hay categorías', pt:'Ainda não há categorias', fr:'Aucune catégorie pour le moment', de:'Noch keine Kategorien', ru:'Пока нет категорий', qd:'Nao Klavossae yeth' },
  'ยังไม่มี Relation': { en:'No relations yet', ja:'関係がありません', ko:'관계가 없습니다', zh:'还没有关系', vi:'Chưa có quan hệ', id:'Belum ada relasi', es:'Aún no hay relaciones', pt:'Ainda não há relações', fr:'Aucune relation pour le moment', de:'Noch keine Beziehungen', ru:'Пока нет отношений', qd:'Nao Kynshall yeth' },
  'ยังไม่มีข้อมูล': { en:'No data yet', ja:'データがありません', ko:'데이터가 없습니다', zh:'还没有数据', vi:'Chưa có dữ liệu', id:'Belum ada data', es:'Aún no hay datos', pt:'Ainda não há dados', fr:'Aucune donnée pour le moment', de:'Noch keine Daten', ru:'Пока нет данных', qd:'Nao hoard yeth' },
  'ยังไม่มีความสัมพันธ์ที่แสดงอยู่': { en:'No relations to show', ja:'表示する関係がありません', ko:'표시할 관계가 없습니다', zh:'没有可显示的关系', vi:'Không có quan hệ nào để hiển thị', id:'Tidak ada relasi untuk ditampilkan', es:'No hay relaciones que mostrar', pt:'Não há relações para mostrar', fr:'Aucune relation à afficher', de:'Keine Beziehungen anzuzeigen', ru:'Нет отношений для отображения', qd:'Nao Kynshall to beholdra' },
  'ลบ Tag': { en:'Remove tag', ja:'タグを削除', ko:'태그 제거', zh:'移除标签', vi:'Gỡ thẻ', id:'Hapus tag', es:'Quitar etiqueta', pt:'Remover tag', fr:'Retirer le tag', de:'Tag entfernen', ru:'Убрать тег', qd:'Ejyra Markiss' },
  'สัมพันธ์': { en:'Related', ja:'関係', ko:'관계', zh:'关联', vi:'Liên quan', id:'Terkait', es:'Relacionado', pt:'Relacionado', fr:'Lié', de:'Verbunden', ru:'Связано', qd:'Kynshall' },
  'เพิ่ม Category เช่น ตัวละคร, อาวุธ': { en:'Add categories such as Characters or Weapons', ja:'キャラクターや武器などのカテゴリーを追加', ko:'캐릭터, 무기 같은 카테고리를 추가하세요', zh:'添加分类，例如角色、武器', vi:'Thêm danh mục như Nhân vật, Vũ khí', id:'Tambah kategori seperti Karakter, Senjata', es:'Añade categorías como Personajes o Armas', pt:'Adicione categorias como Personagens ou Armas', fr:'Ajoutez des catégories comme Personnages ou Armes', de:'Füge Kategorien wie Charaktere oder Waffen hinzu', ru:'Добавьте категории, например Персонажи или Оружие', qd:'Grothul Klavossae lyk Beingraxae orr Wyrmblades' },
  'เพิ่ม Category': { en:'Add category', ja:'カテゴリーを追加', ko:'카테고리 추가', zh:'添加分类', vi:'Thêm danh mục', id:'Tambah kategori', es:'Añadir categoría', pt:'Adicionar categoria', fr:'Ajouter une catégorie', de:'Kategorie hinzufügen', ru:'Добавить категорию', qd:'Grothul Klavoss' },
  'เพิ่มหมายเหตุเพิ่มเติมสำหรับรายการนี้...': { en:'Add extra notes for this item...', ja:'この項目に補足メモを追加...', ko:'이 항목에 대한 추가 메모...', zh:'为此条目添加补充备注...', vi:'Thêm ghi chú cho mục này...', id:'Tambahkan catatan untuk item ini...', es:'Añade notas adicionales para este elemento...', pt:'Adicione notas extras para este item...', fr:'Ajoutez des notes supplémentaires pour cet élément...', de:'Zusätzliche Notizen zu diesem Element...', ru:'Дополнительные заметки к этому элементу...', qd:'Skrivath moar lorenotes fyr thys Artifyx...' },
  'เลือกคอลัมน์ที่แสดง': { en:'Choose visible columns', ja:'表示する列を選択', ko:'표시할 열 선택', zh:'选择显示的列', vi:'Chọn cột hiển thị', id:'Pilih kolom yang ditampilkan', es:'Elegir columnas visibles', pt:'Escolher colunas visíveis', fr:'Choisir les colonnes visibles', de:'Sichtbare Spalten wählen', ru:'Выбрать отображаемые столбцы', qd:'Choozz beholdra columnyx' },
  'เลือกรายการเพื่อดูรายละเอียด': { en:'Select an item to view details', ja:'項目を選択して詳細を表示', ko:'항목을 선택하면 상세가 표시됩니다', zh:'选择条目以查看详情', vi:'Chọn một mục để xem chi tiết', id:'Pilih item untuk melihat detail', es:'Selecciona un elemento para ver los detalles', pt:'Selecione um item para ver os detalhes', fr:'Sélectionnez un élément pour voir les détails', de:'Wähle ein Element, um Details zu sehen', ru:'Выберите элемент для просмотра деталей', qd:'Choozz an Artifyx to beholdra Detharai' },
  'แสดงทั้งหมด': { en:'Show all', ja:'すべて表示', ko:'모두 표시', zh:'显示全部', vi:'Hiện tất cả', id:'Tampilkan semua', es:'Mostrar todo', pt:'Mostrar tudo', fr:'Tout afficher', de:'Alle anzeigen', ru:'Показать все', qd:'Beholdra alle' },
  'โน็ต (Note)': { en:'Note', ja:'メモ', ko:'노트', zh:'备注', vi:'Ghi chú', id:'Catatan', es:'Nota', pt:'Nota', fr:'Note', de:'Notiz', ru:'Заметка', qd:'Lorenote' },
  'ไม่ระบุ': { en:'Unspecified', ja:'指定なし', ko:'지정 안 함', zh:'未指定', vi:'Không xác định', id:'Tidak ditentukan', es:'Sin especificar', pt:'Não especificado', fr:'Non spécifié', de:'Nicht angegeben', ru:'Не указано', qd:'Unnamyth' },
  'รายการ': { en:'items', ja:'件', ko:'개', zh:'项', vi:'mục', id:'item', es:'elementos', pt:'itens', fr:'éléments', de:'Einträge', ru:'элементов', qd:'artifyx' },
  '+ เพิ่ม Tag': { en:'+ Add tag', ja:'+ タグを追加', ko:'+ 태그 추가', zh:'+ 添加标签', vi:'+ Thêm thẻ', id:'+ Tambah tag', es:'+ Añadir etiqueta', pt:'+ Adicionar tag', fr:'+ Ajouter un tag', de:'+ Tag hinzufügen', ru:'+ Добавить тег', qd:'+ Grothul Markiss' },
  '+ เพิ่มลงพาเลท': { en:'+ Add to palette', ja:'+ パレットに追加', ko:'+ 팔레트에 추가', zh:'+ 添加到调色板', vi:'+ Thêm vào bảng màu', id:'+ Tambah ke palet', es:'+ Añadir a la paleta', pt:'+ Adicionar à paleta', fr:'+ Ajouter à la palette', de:'+ Zur Palette hinzufügen', ru:'+ Добавить в палитру', qd:'+ Grothul to Chroniss-hoard' },
  'กรุณาเลือกโปรเจกต์ก่อน': { en:'Select a project first', ja:'先にプロジェクトを選択してください', ko:'먼저 프로젝트를 선택하세요', zh:'请先选择项目', vi:'Hãy chọn dự án trước', id:'Pilih proyek terlebih dahulu', es:'Selecciona primero un proyecto', pt:'Selecione um projeto primeiro', fr:'Sélectionnez d’abord un projet', de:'Wähle zuerst ein Projekt', ru:'Сначала выберите проект', qd:'Choozz a Vorqu fyrst' },
  'ชุดสีทั้งหมด': { en:'All color palettes', ja:'すべてのカラーパレット', ko:'전체 색상 팔레트', zh:'所有调色板', vi:'Tất cả bảng màu', id:'Semua palet warna', es:'Todas las paletas de colores', pt:'Todas as paletas de cores', fr:'Toutes les palettes de couleurs', de:'Alle Farbpaletten', ru:'Все палитры цветов', qd:'Alle Chroniss-hoardyx' },
  'ตัวเลือกสีระบบ': { en:'System color options', ja:'システムカラー', ko:'시스템 색상', zh:'系统颜色选项', vi:'Màu hệ thống', id:'Warna sistem', es:'Colores del sistema', pt:'Cores do sistema', fr:'Couleurs du système', de:'Systemfarben', ru:'Системные цвета', qd:'Systemyx Chroniss' },
  'ยังไม่มี Object หรือ Event ใช้ Tag นี้': { en:'No objects or events use this tag yet', ja:'このタグを使うオブジェクトやイベントはありません', ko:'이 태그를 사용하는 오브젝트나 이벤트가 없습니다', zh:'还没有对象或事件使用此标签', vi:'Chưa có đối tượng hoặc sự kiện nào dùng thẻ này', id:'Belum ada objek atau peristiwa yang memakai tag ini', es:'Ningún objeto o evento usa esta etiqueta todavía', pt:'Nenhum objeto ou evento usa esta tag ainda', fr:'Aucun objet ou événement n’utilise encore ce tag', de:'Noch keine Objekte oder Ereignisse mit diesem Tag', ru:'Пока ни один объект или событие не использует этот тег', qd:'Nao Artifyx nor Chronoshard wieldz thys Markiss yeth' },
  'ยังไม่มี Tag': { en:'No tags yet', ja:'タグがありません', ko:'태그가 없습니다', zh:'还没有标签', vi:'Chưa có thẻ', id:'Belum ada tag', es:'Aún no hay etiquetas', pt:'Ainda não há tags', fr:'Aucun tag pour le moment', de:'Noch keine Tags', ru:'Пока нет тегов', qd:'Nao Markiss yeth' },
  'ยังไม่มี Tag ในโปรเจกต์นี้': { en:'No tags in this project yet', ja:'このプロジェクトにタグはありません', ko:'이 프로젝트에 태그가 없습니다', zh:'此项目中还没有标签', vi:'Dự án này chưa có thẻ', id:'Belum ada tag di proyek ini', es:'Aún no hay etiquetas en este proyecto', pt:'Ainda não há tags neste projeto', fr:'Aucun tag dans ce projet pour le moment', de:'Noch keine Tags in diesem Projekt', ru:'В этом проекте пока нет тегов', qd:'Nao Markiss in thys Vorqu yeth' },
  'รูปแบบสีไม่ถูกต้อง': { en:'Invalid color format', ja:'色形式が無効です', ko:'잘못된 색상 형식', zh:'颜色格式无效', vi:'Định dạng màu không hợp lệ', id:'Format warna tidak valid', es:'Formato de color no válido', pt:'Formato de cor inválido', fr:'Format de couleur invalide', de:'Ungültiges Farbformat', ru:'Неверный формат цвета', qd:'Chroniss formyx maldrawn' },
  'ลบสีนี้': { en:'Delete this color', ja:'この色を削除', ko:'이 색상 삭제', zh:'删除此颜色', vi:'Xóa màu này', id:'Hapus warna ini', es:'Eliminar este color', pt:'Excluir esta cor', fr:'Supprimer cette couleur', de:'Diese Farbe löschen', ru:'Удалить этот цвет', qd:'Vhoreth thys Chroniss' },
  'ลบสีแล้ว': { en:'Color deleted', ja:'色を削除しました', ko:'색상이 삭제됨', zh:'已删除颜色', vi:'Đã xóa màu', id:'Warna terhapus', es:'Color eliminado', pt:'Cor excluída', fr:'Couleur supprimée', de:'Farbe gelöscht', ru:'Цвет удалён', qd:'Chroniss Vhoreth’d' },
  'เพิ่มสีเรียบร้อยแล้ว': { en:'Color added', ja:'色を追加しました', ko:'색상이 추가됨', zh:'已添加颜色', vi:'Đã thêm màu', id:'Warna ditambahkan', es:'Color añadido', pt:'Cor adicionada', fr:'Couleur ajoutée', de:'Farbe hinzugefügt', ru:'Цвет добавлен', qd:'Chroniss Grothul’d' },
  'เลือก Tag เพื่อดูรายการ Object และ Event ที่ใช้ Tag นี้': { en:'Select a tag to see the objects and events using it', ja:'タグを選択すると使用中のオブジェクトとイベントが表示されます', ko:'태그를 선택하면 사용 중인 오브젝트와 이벤트가 표시됩니다', zh:'选择标签以查看使用它的对象和事件', vi:'Chọn thẻ để xem các đối tượng và sự kiện dùng thẻ đó', id:'Pilih tag untuk melihat objek dan peristiwa yang memakainya', es:'Selecciona una etiqueta para ver los objetos y eventos que la usan', pt:'Selecione uma tag para ver os objetos e eventos que a usam', fr:'Sélectionnez un tag pour voir les objets et événements qui l’utilisent', de:'Wähle einen Tag, um zugehörige Objekte und Ereignisse zu sehen', ru:'Выберите тег, чтобы увидеть использующие его объекты и события', qd:'Choozz a Markiss to beholdra Artifyx ee Chronoshard wieldyng it' },
  'ไม่สามารถลบได้ -- สีนี้ถูกใช้งานอยู่': { en:'Cannot delete -- this color is in use', ja:'削除できません -- この色は使用中です', ko:'삭제할 수 없습니다 -- 사용 중인 색상입니다', zh:'无法删除 -- 此颜色正在使用中', vi:'Không thể xóa -- màu này đang được dùng', id:'Tidak bisa dihapus -- warna ini sedang dipakai', es:'No se puede eliminar: este color está en uso', pt:'Não é possível excluir -- esta cor está em uso', fr:'Suppression impossible -- cette couleur est utilisée', de:'Löschen nicht möglich -- diese Farbe wird verwendet', ru:'Нельзя удалить -- этот цвет используется', qd:'Nyshaa vhoreth -- thys Chroniss stylle wieldyth' },
  '🎨 จัดการสี': { en:'🎨 Manage colors', ja:'🎨 色を管理', ko:'🎨 색상 관리', zh:'🎨 管理颜色', vi:'🎨 Quản lý màu', id:'🎨 Kelola warna', es:'🎨 Gestionar colores', pt:'🎨 Gerenciar cores', fr:'🎨 Gérer les couleurs', de:'🎨 Farben verwalten', ru:'🎨 Управление цветами', qd:'🎨 Wardenn Chroniss' },
  '🏷️ ป้ายกำกับ': { en:'🏷️ Tags', ja:'🏷️ タグ', ko:'🏷️ 태그', zh:'🏷️ 标签', vi:'🏷️ Thẻ', id:'🏷️ Tag', es:'🏷️ Etiquetas', pt:'🏷️ Tags', fr:'🏷️ Tags', de:'🏷️ Tags', ru:'🏷️ Теги', qd:'🏷️ Markiss' },
  'ชื่อ Area *': { en:'Area name *', ja:'エリア名 *', ko:'구역 이름 *', zh:'区域名称 *', vi:'Tên khu vực *', id:'Nama area *', es:'Nombre del área *', pt:'Nome da área *', fr:'Nom de la zone *', de:'Bereichsname *', ru:'Название области *', qd:'Zonyx Yssira *' },
  'ชื่อ Map *': { en:'Map name *', ja:'マップ名 *', ko:'맵 이름 *', zh:'地图名称 *', vi:'Tên bản đồ *', id:'Nama peta *', es:'Nombre del mapa *', pt:'Nome do mapa *', fr:'Nom de la carte *', de:'Kartenname *', ru:'Название карты *', qd:'Territhra Yssira *' },
  'ต้องเลือก Area ก่อนใช้ Tool': { en:'Select an area before using this tool', ja:'ツールを使う前にエリアを選択してください', ko:'도구를 사용하기 전에 구역을 선택하세요', zh:'使用工具前请先选择区域', vi:'Chọn khu vực trước khi dùng công cụ', id:'Pilih area sebelum memakai alat', es:'Selecciona un área antes de usar la herramienta', pt:'Selecione uma área antes de usar a ferramenta', fr:'Sélectionnez une zone avant d’utiliser l’outil', de:'Wähle zuerst einen Bereich, bevor du das Werkzeug nutzt', ru:'Сначала выберите область, затем используйте инструмент', qd:'Choozz a Zonyx ere wieldyng thys tooly' },
  'เลือก Area ก่อนใช้งาน Tool': { en:'Select an area before using this tool', ja:'ツールを使う前にエリアを選択してください', ko:'도구를 사용하기 전에 구역을 선택하세요', zh:'使用工具前请先选择区域', vi:'Chọn khu vực trước khi dùng công cụ', id:'Pilih area sebelum memakai alat', es:'Selecciona un área antes de usar la herramienta', pt:'Selecione uma área antes de usar a ferramenta', fr:'Sélectionnez une zone avant d’utiliser l’outil', de:'Wähle zuerst einen Bereich, bevor du das Werkzeug nutzt', ru:'Сначала выберите область, затем используйте инструмент', qd:'Choozz a Zonyx ere wieldyng thys tooly' },
  'ยังไม่มี Area': { en:'No areas yet', ja:'エリアがありません', ko:'구역이 없습니다', zh:'还没有区域', vi:'Chưa có khu vực', id:'Belum ada area', es:'Aún no hay áreas', pt:'Ainda não há áreas', fr:'Aucune zone pour le moment', de:'Noch keine Bereiche', ru:'Пока нет областей', qd:'Nao Zonyx yeth' },
  'ยังไม่มี Map': { en:'No maps yet', ja:'マップがありません', ko:'맵이 없습니다', zh:'还没有地图', vi:'Chưa có bản đồ', id:'Belum ada peta', es:'Aún no hay mapas', pt:'Ainda não há mapas', fr:'Aucune carte pour le moment', de:'Noch keine Karten', ru:'Пока нет карт', qd:'Nao Territhrae yeth' },
  'ลบ Area นี้?': { en:'Delete this area?', ja:'このエリアを削除？', ko:'이 구역을 삭제할까요?', zh:'删除此区域？', vi:'Xóa khu vực này?', id:'Hapus area ini?', es:'¿Eliminar esta área?', pt:'Excluir esta área?', fr:'Supprimer cette zone ?', de:'Diesen Bereich löschen?', ru:'Удалить эту область?', qd:'Vhoreth thys Zonyx?' },
  'ลบ Map นี้?': { en:'Delete this map?', ja:'このマップを削除？', ko:'이 맵을 삭제할까요?', zh:'删除此地图？', vi:'Xóa bản đồ này?', id:'Hapus peta ini?', es:'¿Eliminar este mapa?', pt:'Excluir este mapa?', fr:'Supprimer cette carte ?', de:'Diese Karte löschen?', ru:'Удалить эту карту?', qd:'Vhoreth thys Territhra?' },
  'สร้าง Area แล้ว': { en:'Area created', ja:'エリアを作成しました', ko:'구역이 생성됨', zh:'已创建区域', vi:'Đã tạo khu vực', id:'Area dibuat', es:'Área creada', pt:'Área criada', fr:'Zone créée', de:'Bereich erstellt', ru:'Область создана', qd:'Zonyx Forg’d' },
  'สร้าง Map แล้ว': { en:'Map created', ja:'マップを作成しました', ko:'맵이 생성됨', zh:'已创建地图', vi:'Đã tạo bản đồ', id:'Peta dibuat', es:'Mapa creado', pt:'Mapa criado', fr:'Carte créée', de:'Karte erstellt', ru:'Карта создана', qd:'Territhra Forg’d' },
  '✏️ แก้ไข Area': { en:'✏️ Edit area', ja:'✏️ エリアを編集', ko:'✏️ 구역 수정', zh:'✏️ 编辑区域', vi:'✏️ Sửa khu vực', id:'✏️ Edit area', es:'✏️ Editar área', pt:'✏️ Editar área', fr:'✏️ Modifier la zone', de:'✏️ Bereich bearbeiten', ru:'✏️ Редактировать область', qd:'✏️ Zhakrii Zonyx' },
  '✏️ แก้ไข Map': { en:'✏️ Edit map', ja:'✏️ マップを編集', ko:'✏️ 맵 수정', zh:'✏️ 编辑地图', vi:'✏️ Sửa bản đồ', id:'✏️ Edit peta', es:'✏️ Editar mapa', pt:'✏️ Editar mapa', fr:'✏️ Modifier la carte', de:'✏️ Karte bearbeiten', ru:'✏️ Редактировать карту', qd:'✏️ Zhakrii Territhra' },
  '🧩 Area ใหม่': { en:'🧩 New area', ja:'🧩 新規エリア', ko:'🧩 새 구역', zh:'🧩 新建区域', vi:'🧩 Khu vực mới', id:'🧩 Area baru', es:'🧩 Nueva área', pt:'🧩 Nova área', fr:'🧩 Nouvelle zone', de:'🧩 Neuer Bereich', ru:'🧩 Новая область', qd:'🧩 Esshka Zonyx' },
  '🧭 Map ใหม่': { en:'🧭 New map', ja:'🧭 新規マップ', ko:'🧭 새 맵', zh:'🧭 新建地图', vi:'🧭 Bản đồ mới', id:'🧭 Peta baru', es:'🧭 Nuevo mapa', pt:'🧭 Novo mapa', fr:'🧭 Nouvelle carte', de:'🧭 Neue Karte', ru:'🧭 Новая карта', qd:'🧭 Esshka Territhra' },
  '-- ยังไม่มี Category --': { en:'-- No categories --', ja:'-- カテゴリーなし --', ko:'-- 카테고리 없음 --', zh:'-- 无分类 --', vi:'-- Chưa có danh mục --', id:'-- Belum ada kategori --', es:'-- Sin categorías --', pt:'-- Sem categorias --', fr:'-- Aucune catégorie --', de:'-- Keine Kategorien --', ru:'-- Нет категорий --', qd:'-- Nao Klavossae --' },
  '-- เลือก Object --': { en:'-- Select object --', ja:'-- オブジェクトを選択 --', ko:'-- 오브젝트 선택 --', zh:'-- 选择对象 --', vi:'-- Chọn đối tượng --', id:'-- Pilih objek --', es:'-- Seleccionar objeto --', pt:'-- Selecionar objeto --', fr:'-- Sélectionner un objet --', de:'-- Objekt wählen --', ru:'-- Выберите объект --', qd:'-- Choozz Artifyx --' },
  'ความสัมพันธ์ที่กำลังแสดงอยู่': { en:'Relations currently shown', ja:'表示中の関係', ko:'현재 표시된 관계', zh:'当前显示的关系', vi:'Quan hệ đang hiển thị', id:'Relasi yang ditampilkan', es:'Relaciones mostradas', pt:'Relações exibidas', fr:'Relations affichées', de:'Angezeigte Beziehungen', ru:'Отображаемые отношения', qd:'Kynshall now beholdrath' },
  'ยังไม่มีประเภท': { en:'No types yet', ja:'種類がありません', ko:'유형이 없습니다', zh:'还没有类型', vi:'Chưa có loại', id:'Belum ada jenis', es:'Aún no hay tipos', pt:'Ainda não há tipos', fr:'Aucun type pour le moment', de:'Noch keine Typen', ru:'Пока нет типов', qd:'Nao Formyx yeth' },
  'เลือกโปรเจกต์ก่อน': { en:'Select a project first', ja:'先にプロジェクトを選択してください', ko:'먼저 프로젝트를 선택하세요', zh:'请先选择项目', vi:'Hãy chọn dự án trước', id:'Pilih proyek terlebih dahulu', es:'Selecciona primero un proyecto', pt:'Selecione um projeto primeiro', fr:'Sélectionnez d’abord un projet', de:'Wähle zuerst ein Projekt', ru:'Сначала выберите проект', qd:'Choozz a Vorqu fyrst' },
  'แสดง Object ทั้งหมดในโปรเจกต์:': { en:'Show all objects in project:', ja:'プロジェクト内のすべてのオブジェクトを表示：', ko:'프로젝트의 모든 오브젝트 표시:', zh:'显示项目中的所有对象：', vi:'Hiện tất cả đối tượng trong dự án:', id:'Tampilkan semua objek di proyek:', es:'Mostrar todos los objetos del proyecto:', pt:'Mostrar todos os objetos do projeto:', fr:'Afficher tous les objets du projet :', de:'Alle Objekte im Projekt anzeigen:', ru:'Показать все объекты проекта:', qd:'Beholdra alle Artifyx in Vorqu:' },
  'ยังไม่มี Timeline': { en:'No timelines yet', ja:'タイムラインがありません', ko:'타임라인이 없습니다', zh:'还没有时间线', vi:'Chưa có dòng thời gian', id:'Belum ada linimasa', es:'Aún no hay cronologías', pt:'Ainda não há linhas do tempo', fr:'Aucune chronologie pour le moment', de:'Noch keine Zeitleisten', ru:'Пока нет хронологий', qd:'Nao Khronofang yeth' },
  'ยังไม่มีเหตุการณ์': { en:'No events yet', ja:'イベントがありません', ko:'이벤트가 없습니다', zh:'还没有事件', vi:'Chưa có sự kiện', id:'Belum ada peristiwa', es:'Aún no hay eventos', pt:'Ainda não há eventos', fr:'Aucun événement pour le moment', de:'Noch keine Ereignisse', ru:'Пока нет событий', qd:'Nao Chronoshard yeth' },
  'เลือก Timeline จากรายการ': { en:'Select a timeline from the list', ja:'一覧からタイムラインを選択', ko:'목록에서 타임라인을 선택하세요', zh:'从列表中选择时间线', vi:'Chọn dòng thời gian từ danh sách', id:'Pilih linimasa dari daftar', es:'Selecciona una cronología de la lista', pt:'Selecione uma linha do tempo da lista', fr:'Sélectionnez une chronologie dans la liste', de:'Wähle eine Zeitleiste aus der Liste', ru:'Выберите хронологию из списка', qd:'Choozz a Khronofang fromm thy lystyx' },
  'ผลการค้นหา': { en:'Search results', ja:'検索結果', ko:'검색 결과', zh:'搜索结果', vi:'Kết quả tìm kiếm', id:'Hasil pencarian', es:'Resultados de búsqueda', pt:'Resultados da busca', fr:'Résultats de recherche', de:'Suchergebnisse', ru:'Результаты поиска', qd:'Zharra bountyx' },
  'ไม่พบผลลัพธ์การค้นหา': { en:'No search results', ja:'検索結果がありません', ko:'검색 결과가 없습니다', zh:'未找到搜索结果', vi:'Không tìm thấy kết quả', id:'Tidak ada hasil pencarian', es:'Sin resultados de búsqueda', pt:'Nenhum resultado encontrado', fr:'Aucun résultat de recherche', de:'Keine Suchergebnisse', ru:'Ничего не найдено', qd:'Nao Zharra bountyx' },
  '⭐ รายการ (Objects)': { en:'⭐ Objects', ja:'⭐ オブジェクト', ko:'⭐ 오브젝트', zh:'⭐ 对象', vi:'⭐ Đối tượng', id:'⭐ Objek', es:'⭐ Objetos', pt:'⭐ Objetos', fr:'⭐ Objets', de:'⭐ Objekte', ru:'⭐ Объекты', qd:'⭐ Artifyx' },
  '🏷️ ป้ายกำกับ (Hashtags)': { en:'🏷️ Tags', ja:'🏷️ タグ', ko:'🏷️ 태그', zh:'🏷️ 标签', vi:'🏷️ Thẻ', id:'🏷️ Tag', es:'🏷️ Etiquetas', pt:'🏷️ Tags', fr:'🏷️ Tags', de:'🏷️ Tags', ru:'🏷️ Теги', qd:'🏷️ Markiss' },
  '📁 โปรเจกต์': { en:'📁 Projects', ja:'📁 プロジェクト', ko:'📁 프로젝트', zh:'📁 项目', vi:'📁 Dự án', id:'📁 Proyek', es:'📁 Proyectos', pt:'📁 Projetos', fr:'📁 Projets', de:'📁 Projekte', ru:'📁 Проекты', qd:'📁 Vorquenn' },
  'Export DB สำเร็จ': { en:'Database exported', ja:'DBをエクスポートしました', ko:'DB 내보내기 완료', zh:'数据库导出成功', vi:'Đã xuất cơ sở dữ liệu', id:'Database berhasil diekspor', es:'Base de datos exportada', pt:'Banco de dados exportado', fr:'Base de données exportée', de:'Datenbank exportiert', ru:'База данных экспортирована', qd:'DB Outhgurath’d' },
  'Import DB สำเร็จและรวมข้อมูลแล้ว': { en:'Database imported and merged', ja:'DBをインポートして統合しました', ko:'DB 가져오기 및 병합 완료', zh:'数据库已导入并合并', vi:'Đã nhập và gộp cơ sở dữ liệu', id:'Database diimpor dan digabungkan', es:'Base de datos importada y combinada', pt:'Banco de dados importado e mesclado', fr:'Base de données importée et fusionnée', de:'Datenbank importiert und zusammengeführt', ru:'База данных импортирована и объединена', qd:'DB Ingurath’d ee merg’d' },
  'Import DB แล้วรวมข้อมูลที่ยังไม่ซ้ำกับฐานข้อมูลปัจจุบัน ใช่หรือไม่?': { en:'Import a DB file and merge new data into the current database?', ja:'DBをインポートして現在のデータベースに未重複データを統合しますか？', ko:'DB를 가져와 현재 데이터베이스에 새 데이터를 병합할까요?', zh:'导入数据库并将不重复的数据合并到当前数据库？', vi:'Nhập DB và gộp dữ liệu mới vào cơ sở dữ liệu hiện tại?', id:'Impor DB dan gabungkan data baru ke database saat ini?', es:'¿Importar una BD y combinar los datos nuevos con la base actual?', pt:'Importar um BD e mesclar os novos dados no banco atual?', fr:'Importer une BD et fusionner les nouvelles données dans la base actuelle ?', de:'DB importieren und neue Daten in die aktuelle Datenbank übernehmen?', ru:'Импортировать БД и объединить новые данные с текущей базой?', qd:'Ingurath a DB ee merga esshka hoard into thy dwellyng DB?' },
  'เพิ่มสีใหม่เรียบร้อย': { en:'Color added', ja:'色を追加しました', ko:'색상이 추가됨', zh:'已添加颜色', vi:'Đã thêm màu', id:'Warna ditambahkan', es:'Color añadido', pt:'Cor adicionada', fr:'Couleur ajoutée', de:'Farbe hinzugefügt', ru:'Цвет добавлен', qd:'Chroniss Grothul’d' },
  'Export ไม่สำเร็จ': { en:'Export failed', ja:'エクスポートに失敗しました', ko:'내보내기 실패', zh:'导出失败', vi:'Xuất thất bại', id:'Ekspor gagal', es:'Error al exportar', pt:'Falha na exportação', fr:'Échec de l’exportation', de:'Export fehlgeschlagen', ru:'Не удалось экспортировать', qd:'Outhgurath failyth' },
  'Import ไม่สำเร็จ': { en:'Import failed', ja:'インポートに失敗しました', ko:'가져오기 실패', zh:'导入失败', vi:'Nhập thất bại', id:'Impor gagal', es:'Error al importar', pt:'Falha na importação', fr:'Échec de l’importation', de:'Import fehlgeschlagen', ru:'Не удалось импортировать', qd:'Ingurath failyth' },
  'OK': { th:'ตกลง', en:'OK', ja:'OK', ko:'확인', zh:'确定', vi:'OK', id:'OK', es:'Aceptar', pt:'OK', fr:'OK', de:'OK', ru:'ОК', qd:'Zhaa' },
  'Cancel': { th:'ยกเลิก', en:'Cancel', ja:'キャンセル', ko:'취소', zh:'取消', vi:'Hủy', id:'Batal', es:'Cancelar', pt:'Cancelar', fr:'Annuler', de:'Abbrechen', ru:'Отмена', qd:'Nyshaa' },
  'Add': { th:'เพิ่ม', en:'Add', ja:'追加', ko:'추가', zh:'添加', vi:'Thêm', id:'Tambah', es:'Añadir', pt:'Adicionar', fr:'Ajouter', de:'Hinzufügen', ru:'Добавить', qd:'Grothul' },
  'Edit': { th:'แก้ไข', en:'Edit', ja:'編集', ko:'수정', zh:'编辑', vi:'Sửa', id:'Edit', es:'Editar', pt:'Editar', fr:'Modifier', de:'Bearbeiten', ru:'Редактировать', qd:'Zhakrii' },
  'Delete': { th:'ลบ', en:'Delete', ja:'削除', ko:'삭제', zh:'删除', vi:'Xóa', id:'Hapus', es:'Eliminar', pt:'Excluir', fr:'Supprimer', de:'Löschen', ru:'Удалить', qd:'Vhoreth' },
  'Create': { th:'สร้าง', en:'Create', ja:'作成', ko:'생성', zh:'创建', vi:'Tạo', id:'Buat', es:'Crear', pt:'Criar', fr:'Créer', de:'Erstellen', ru:'Создать', qd:'Forge' },
  'Save': { th:'บันทึก', en:'Save', ja:'保存', ko:'저장', zh:'保存', vi:'Lưu', id:'Simpan', es:'Guardar', pt:'Salvar', fr:'Enregistrer', de:'Speichern', ru:'Сохранить', qd:'Korvath' },
  'Close': { th:'ปิด', en:'Close', ja:'閉じる', ko:'닫기', zh:'关闭', vi:'Đóng', id:'Tutup', es:'Cerrar', pt:'Fechar', fr:'Fermer', de:'Schließen', ru:'Закрыть', qd:'Klemuur' },
  'Remove': { th:'นำออก', en:'Remove', ja:'削除', ko:'제거', zh:'移除', vi:'Gỡ bỏ', id:'Hapus', es:'Quitar', pt:'Remover', fr:'Retirer', de:'Entfernen', ru:'Убрать', qd:'Ejyra' },
  'Manage': { th:'จัดการ', en:'Manage', ja:'管理', ko:'관리', zh:'管理', vi:'Quản lý', id:'Kelola', es:'Gestionar', pt:'Gerenciar', fr:'Gérer', de:'Verwalten', ru:'Управлять', qd:'Wardenn' },
  'Link': { th:'เชื่อมต่อ', en:'Link', ja:'リンク', ko:'연결', zh:'链接', vi:'Liên kết', id:'Tautkan', es:'Vincular', pt:'Vincular', fr:'Lier', de:'Verknüpfen', ru:'Связать', qd:'Bondra' },
  'Unlink': { th:'ยกเลิกการเชื่อมต่อ', en:'Unlink', ja:'リンク解除', ko:'연결 해제', zh:'取消链接', vi:'Hủy liên kết', id:'Batalkan tautan', es:'Desvincular', pt:'Desvincular', fr:'Délier', de:'Verknüpfung lösen', ru:'Отвязать', qd:'Unbondra' },
  'Done': { th:'เสร็จสิ้น', en:'Done', ja:'完了', ko:'완료', zh:'完成', vi:'Xong', id:'Selesai', es:'Hecho', pt:'Concluído', fr:'Terminé', de:'Fertig', ru:'Готово', qd:'Wrought' },
  'Name': { th:'ชื่อ', en:'Name', ja:'名前', ko:'이름', zh:'名称', vi:'Tên', id:'Nama', es:'Nombre', pt:'Nome', fr:'Nom', de:'Name', ru:'Имя', qd:'Yssira' },
  'Name *': { th:'ชื่อ *', en:'Name *', ja:'名前 *', ko:'이름 *', zh:'名称 *', vi:'Tên *', id:'Nama *', es:'Nombre *', pt:'Nome *', fr:'Nom *', de:'Name *', ru:'Имя *', qd:'Yssira *' },
  'Memo': { th:'บันทึกย่อ', en:'Memo', ja:'メモ', ko:'메모', zh:'备注', vi:'Ghi chú', id:'Memo', es:'Nota', pt:'Memorando', fr:'Mémo', de:'Memo', ru:'Заметка', qd:'Skrivath' },
  'Color': { th:'สี', en:'Color', ja:'色', ko:'색상', zh:'颜色', vi:'Màu', id:'Warna', es:'Color', pt:'Cor', fr:'Couleur', de:'Farbe', ru:'Цвет', qd:'Chroniss' },
  'Type': { th:'ประเภท', en:'Type', ja:'種類', ko:'유형', zh:'类型', vi:'Loại', id:'Jenis', es:'Tipo', pt:'Tipo', fr:'Type', de:'Typ', ru:'Тип', qd:'Formyx' },
  'Text': { th:'ข้อความ', en:'Text', ja:'テキスト', ko:'텍스트', zh:'文本', vi:'Văn bản', id:'Teks', es:'Texto', pt:'Texto', fr:'Texte', de:'Text', ru:'Текст', qd:'Runyx' },
  'Title': { th:'หัวข้อ', en:'Title', ja:'タイトル', ko:'제목', zh:'标题', vi:'Tiêu đề', id:'Judul', es:'Título', pt:'Título', fr:'Titre', de:'Titel', ru:'Заголовок', qd:'Titheryn' },
  'Content': { th:'เนื้อหา', en:'Content', ja:'内容', ko:'내용', zh:'内容', vi:'Nội dung', id:'Konten', es:'Contenido', pt:'Conteúdo', fr:'Contenu', de:'Inhalt', ru:'Содержание', qd:'Innorath' },
  'Object': { th:'รายการ', en:'Object', ja:'オブジェクト', ko:'오브젝트', zh:'对象', vi:'Đối tượng', id:'Objek', es:'Objeto', pt:'Objeto', fr:'Objet', de:'Objekt', ru:'Объект', qd:'Artifyx' },
  'Objects': { th:'รายการ', en:'Objects', ja:'オブジェクト', ko:'오브젝트', zh:'对象', vi:'Đối tượng', id:'Objek', es:'Objetos', pt:'Objetos', fr:'Objets', de:'Objekte', ru:'Объекты', qd:'Artifyx' },
  'Novel': { th:'นิยาย', en:'Novel', ja:'小説', ko:'소설', zh:'小说', vi:'Tiểu thuyết', id:'Novel', es:'Novela', pt:'Romance', fr:'Roman', de:'Roman', ru:'Роман', qd:'Vorqu' },
  'Entity': { th:'เอนทิตี', en:'Entity', ja:'エンティティ', ko:'엔티티', zh:'实体', vi:'Thực thể', id:'Entitas', es:'Entidad', pt:'Entidade', fr:'Entité', de:'Entität', ru:'Сущность', qd:'Beingyx' },
  'Symbol': { th:'สัญลักษณ์', en:'Symbol', ja:'シンボル', ko:'기호', zh:'符号', vi:'Ký hiệu', id:'Simbol', es:'Símbolo', pt:'Símbolo', fr:'Symbole', de:'Symbol', ru:'Символ', qd:'Glyphyx' },
  'Characters': { th:'ตัวละคร', en:'Characters', ja:'キャラクター', ko:'캐릭터', zh:'角色', vi:'Nhân vật', id:'Karakter', es:'Personajes', pt:'Personagens', fr:'Personnages', de:'Charaktere', ru:'Персонажи', qd:'Beingraxae' },
  'Codename': { th:'โค้ดเนม', en:'Codename', ja:'コードネーム', ko:'코드네임', zh:'代号', vi:'Mật danh', id:'Nama kode', es:'Nombre en clave', pt:'Codinome', fr:'Nom de code', de:'Codename', ru:'Кодовое имя', qd:'Shadowyssira' },
  'Day': { th:'วัน', en:'Day', ja:'日', ko:'일', zh:'日', vi:'Ngày', id:'Hari', es:'Día', pt:'Dia', fr:'Jour', de:'Tag', ru:'День', qd:'Sunn' },
  'Month': { th:'เดือน', en:'Month', ja:'月', ko:'월', zh:'月', vi:'Tháng', id:'Bulan', es:'Mes', pt:'Mês', fr:'Mois', de:'Monat', ru:'Месяц', qd:'Moonyx' },
  'Year': { th:'ปี', en:'Year', ja:'年', ko:'년', zh:'年', vi:'Năm', id:'Tahun', es:'Año', pt:'Ano', fr:'Année', de:'Jahr', ru:'Год', qd:'Aeon' },
  'Hour': { th:'ชั่วโมง', en:'Hour', ja:'時', ko:'시', zh:'时', vi:'Giờ', id:'Jam', es:'Hora', pt:'Hora', fr:'Heure', de:'Stunde', ru:'Час', qd:'Houryx' },
  'Minute': { th:'นาที', en:'Minute', ja:'分', ko:'분', zh:'分', vi:'Phút', id:'Menit', es:'Minuto', pt:'Minuto', fr:'Minute', de:'Minute', ru:'Минута', qd:'Minythe' },
  'List': { th:'รายการ', en:'List', ja:'リスト', ko:'목록', zh:'列表', vi:'Danh sách', id:'Daftar', es:'Lista', pt:'Lista', fr:'Liste', de:'Liste', ru:'Список', qd:'Lystyx' },
  'Table': { th:'ตาราง', en:'Table', ja:'テーブル', ko:'표', zh:'表格', vi:'Bảng', id:'Tabel', es:'Tabla', pt:'Tabela', fr:'Tableau', de:'Tabelle', ru:'Таблица', qd:'Gridyx' },
  'Untitled': { th:'ไม่มีชื่อ', en:'Untitled', ja:'名前なし', ko:'이름 없음', zh:'无标题', vi:'Chưa đặt tên', id:'Tanpa judul', es:'Sin título', pt:'Sem título', fr:'Sans titre', de:'Unbenannt', ru:'Без названия', qd:'Namelesz' },
  'Detail': { th:'รายละเอียด', en:'Detail', ja:'詳細', ko:'상세', zh:'详情', vi:'Chi tiết', id:'Detail', es:'Detalle', pt:'Detalhe', fr:'Détail', de:'Detail', ru:'Деталь', qd:'Detharai' },
  'Area': { th:'Area', en:'Area', ja:'エリア', ko:'구역', zh:'区域', vi:'Khu vực', id:'Area', es:'Área', pt:'Área', fr:'Zone', de:'Bereich', ru:'Область', qd:'Zonyx' },
  'Map': { th:'Map', en:'Map', ja:'マップ', ko:'맵', zh:'地图', vi:'Bản đồ', id:'Peta', es:'Mapa', pt:'Mapa', fr:'Carte', de:'Karte', ru:'Карта', qd:'Territhra' },
  'Mapping': { th:'Mapping', en:'Mapping', ja:'マッピング', ko:'매핑', zh:'映射', vi:'Bản đồ', id:'Pemetaan', es:'Mapeo', pt:'Mapeamento', fr:'Cartographie', de:'Kartierung', ru:'Картография', qd:'Territhramapp' },
  'Timeline': { th:'Timeline', en:'Timeline', ja:'タイムライン', ko:'타임라인', zh:'时间线', vi:'Dòng thời gian', id:'Linimasa', es:'Cronología', pt:'Linha do tempo', fr:'Chronologie', de:'Zeitleiste', ru:'Хронология', qd:'Khronofang' },
  'Relations': { th:'ความสัมพันธ์', en:'Relations', ja:'関係', ko:'관계', zh:'关系', vi:'Quan hệ', id:'Relasi', es:'Relaciones', pt:'Relações', fr:'Relations', de:'Beziehungen', ru:'Отношения', qd:'Kynshall' },
  'Project Tags': { th:'ป้ายกำกับโปรเจกต์', en:'Project Tags', ja:'プロジェクトタグ', ko:'프로젝트 태그', zh:'项目标签', vi:'Thẻ dự án', id:'Tag proyek', es:'Etiquetas del proyecto', pt:'Tags do projeto', fr:'Tags du projet', de:'Projekt-Tags', ru:'Теги проекта', qd:'Vorqu Markiss' },
  'Edit project': { th:'แก้ไขโปรเจกต์', en:'Edit project', ja:'プロジェクトを編集', ko:'프로젝트 수정', zh:'编辑项目', vi:'Sửa dự án', id:'Edit proyek', es:'Editar proyecto', pt:'Editar projeto', fr:'Modifier le projet', de:'Projekt bearbeiten', ru:'Редактировать проект', qd:'Zhakrii Vorqu' },
  'Add detail': { th:'เพิ่มรายละเอียด', en:'Add detail', ja:'詳細を追加', ko:'상세 추가', zh:'添加详情', vi:'Thêm chi tiết', id:'Tambah detail', es:'Añadir detalle', pt:'Adicionar detalhe', fr:'Ajouter un détail', de:'Detail hinzufügen', ru:'Добавить деталь', qd:'Grothul Detharai' },
  'Add Detail': { th:'เพิ่มรายละเอียด', en:'Add Detail', ja:'詳細を追加', ko:'상세 추가', zh:'添加详情', vi:'Thêm chi tiết', id:'Tambah detail', es:'Añadir detalle', pt:'Adicionar detalhe', fr:'Ajouter un détail', de:'Detail hinzufügen', ru:'Добавить деталь', qd:'Grothul Detharai' },
  'Edit Detail': { th:'แก้ไขรายละเอียด', en:'Edit Detail', ja:'詳細を編集', ko:'상세 수정', zh:'编辑详情', vi:'Sửa chi tiết', id:'Edit detail', es:'Editar detalle', pt:'Editar detalhe', fr:'Modifier le détail', de:'Detail bearbeiten', ru:'Редактировать деталь', qd:'Zhakrii Detharai' },
  'Back to Nexus': { th:'กลับไปยัง Nexus', en:'Back to Nexus', ja:'Nexusに戻る', ko:'Nexus로 돌아가기', zh:'返回 Nexus', vi:'Quay lại Nexus', id:'Kembali ke Nexus', es:'Volver al Nexus', pt:'Voltar ao Nexus', fr:'Retour au Nexus', de:'Zurück zum Nexus', ru:'Назад к Nexus', qd:'Retreath to Nexus' },
  'Back to world list': { th:'กลับไปยังรายการโลก', en:'Back to world list', ja:'ワールド一覧に戻る', ko:'세계 목록으로', zh:'返回世界列表', vi:'Quay lại danh sách thế giới', id:'Kembali ke daftar dunia', es:'Volver a la lista de mundos', pt:'Voltar à lista de mundos', fr:'Retour à la liste des mondes', de:'Zurück zur Weltliste', ru:'Назад к списку миров', qd:'Retreath to Realmyx Lystyx' },
  '— select novel —': { th:'— เลือกนิยาย —', en:'— select novel —', ja:'— 小説を選択 —', ko:'— 소설 선택 —', zh:'— 选择小说 —', vi:'— chọn tiểu thuyết —', id:'— pilih novel —', es:'— seleccionar novela —', pt:'— selecionar romance —', fr:'— sélectionner un roman —', de:'— Roman wählen —', ru:'— выберите роман —', qd:'— choozz vorqu —' },
  'No novels available': { th:'ไม่มีนิยายให้เลือก', en:'No novels available', ja:'小説がありません', ko:'소설이 없습니다', zh:'没有可用的小说', vi:'Không có tiểu thuyết', id:'Tidak ada novel', es:'No hay novelas disponibles', pt:'Nenhum romance disponível', fr:'Aucun roman disponible', de:'Keine Romane verfügbar', ru:'Нет доступных романов', qd:'Nao Vorquenn availthra' },
  'No linked novels': { th:'ยังไม่มีนิยายที่เชื่อมต่อ', en:'No linked novels', ja:'リンク済みの小説はありません', ko:'연결된 소설이 없습니다', zh:'没有关联小说', vi:'Chưa có tiểu thuyết liên kết', id:'Belum ada novel tertaut', es:'No hay novelas vinculadas', pt:'Nenhum romance vinculado', fr:'Aucun roman lié', de:'Keine verknüpften Romane', ru:'Нет связанных романов', qd:'Nao Bondrath Vorquenn' },
  'No symbols available': { th:'ไม่มีสัญลักษณ์ให้เลือก', en:'No symbols available', ja:'シンボルがありません', ko:'기호가 없습니다', zh:'没有可用符号', vi:'Không có ký hiệu', id:'Tidak ada simbol', es:'No hay símbolos disponibles', pt:'Nenhum símbolo disponível', fr:'Aucun symbole disponible', de:'Keine Symbole verfügbar', ru:'Нет доступных символов', qd:'Nao Glyphyx availthra' },
  'Name required': { th:'กรุณากรอกชื่อ', en:'Name required', ja:'名前は必須です', ko:'이름을 입력하세요', zh:'请输入名称', vi:'Cần nhập tên', id:'Nama wajib diisi', es:'El nombre es obligatorio', pt:'Nome obrigatório', fr:'Nom requis', de:'Name erforderlich', ru:'Требуется имя', qd:'Yssira requyrd' },
  'Saved': { th:'บันทึกแล้ว', en:'Saved', ja:'保存しました', ko:'저장됨', zh:'已保存', vi:'Đã lưu', id:'Tersimpan', es:'Guardado', pt:'Salvo', fr:'Enregistré', de:'Gespeichert', ru:'Сохранено', qd:'Korvath’d' },
  'Deleted': { th:'ลบแล้ว', en:'Deleted', ja:'削除しました', ko:'삭제됨', zh:'已删除', vi:'Đã xóa', id:'Terhapus', es:'Eliminado', pt:'Excluído', fr:'Supprimé', de:'Gelöscht', ru:'Удалено', qd:'Vhoreth’d' },
  'Added': { th:'เพิ่มแล้ว', en:'Added', ja:'追加しました', ko:'추가됨', zh:'已添加', vi:'Đã thêm', id:'Ditambahkan', es:'Añadido', pt:'Adicionado', fr:'Ajouté', de:'Hinzugefügt', ru:'Добавлено', qd:'Grothul’d' },
  'Placed': { th:'วางแล้ว', en:'Placed', ja:'配置しました', ko:'배치됨', zh:'已放置', vi:'Đã đặt', id:'Ditempatkan', es:'Colocado', pt:'Posicionado', fr:'Placé', de:'Platziert', ru:'Размещено', qd:'Placyth’d' },
  'Save failed': { th:'บันทึกข้อมูลไม่สำเร็จ', en:'Save failed', ja:'保存に失敗しました', ko:'저장 실패', zh:'保存失败', vi:'Lưu thất bại', id:'Gagal menyimpan', es:'Error al guardar', pt:'Falha ao salvar', fr:'Échec de l’enregistrement', de:'Speichern fehlgeschlagen', ru:'Не удалось сохранить', qd:'Korvath failyth' },
  'Invalid category': { th:'Category ไม่ถูกต้อง', en:'Invalid category', ja:'カテゴリーが無効です', ko:'잘못된 카테고리', zh:'无效的分类', vi:'Danh mục không hợp lệ', id:'Kategori tidak valid', es:'Categoría no válida', pt:'Categoria inválida', fr:'Catégorie invalide', de:'Ungültige Kategorie', ru:'Неверная категория', qd:'Klavoss maldrawn' },
  'Category created': { th:'สร้าง Category เรียบร้อยแล้ว', en:'Category created', ja:'カテゴリーを作成しました', ko:'카테고리가 생성됨', zh:'已创建分类', vi:'Đã tạo danh mục', id:'Kategori dibuat', es:'Categoría creada', pt:'Categoria criada', fr:'Catégorie créée', de:'Kategorie erstellt', ru:'Категория создана', qd:'Klavoss Forg’d' },
  'Field added': { th:'เพิ่ม Field เรียบร้อยแล้ว', en:'Field added', ja:'フィールドを追加しました', ko:'필드가 추가됨', zh:'已添加字段', vi:'Đã thêm trường', id:'Field ditambahkan', es:'Campo añadido', pt:'Campo adicionado', fr:'Champ ajouté', de:'Feld hinzugefügt', ru:'Поле добавлено', qd:'Fyldyx Grothul’d' },
  'Item added': { th:'เพิ่มรายการเรียบร้อยแล้ว', en:'Item added', ja:'項目を追加しました', ko:'항목이 추가됨', zh:'已添加条目', vi:'Đã thêm mục', id:'Item ditambahkan', es:'Elemento añadido', pt:'Item adicionado', fr:'Élément ajouté', de:'Element hinzugefügt', ru:'Элемент добавлен', qd:'Artifyx Grothul’d' },
  'All novels are already linked': { th:'นิยายทั้งหมดถูกเชื่อมต่อแล้ว', en:'All novels are already linked', ja:'すべての小説はリンク済みです', ko:'모든 소설이 이미 연결되었습니다', zh:'所有小说都已关联', vi:'Tất cả tiểu thuyết đã được liên kết', id:'Semua novel sudah tertaut', es:'Todas las novelas ya están vinculadas', pt:'Todos os romances já estão vinculados', fr:'Tous les romans sont déjà liés', de:'Alle Romane sind bereits verknüpft', ru:'Все романы уже связаны', qd:'Alle Vorquenn already bondrath' },
  'Select a novel': { th:'เลือกนิยาย', en:'Select a novel', ja:'小説を選択してください', ko:'소설을 선택하세요', zh:'请选择小说', vi:'Chọn tiểu thuyết', id:'Pilih novel', es:'Selecciona una novela', pt:'Selecione um romance', fr:'Sélectionnez un roman', de:'Wähle einen Roman', ru:'Выберите роман', qd:'Choozz a Vorqu' },
  'No categories available from linked novels': { th:'ไม่มีหมวดหมู่จากนิยายที่เชื่อมต่อ', en:'No categories available from linked novels', ja:'リンク済みの小説にカテゴリーがありません', ko:'연결된 소설에 카테고리가 없습니다', zh:'关联小说中没有可用分类', vi:'Không có danh mục từ tiểu thuyết liên kết', id:'Tidak ada kategori dari novel tertaut', es:'No hay categorías disponibles de las novelas vinculadas', pt:'Nenhuma categoria disponível dos romances vinculados', fr:'Aucune catégorie disponible depuis les romans liés', de:'Keine Kategorien aus verknüpften Romanen verfügbar', ru:'Нет категорий из связанных романов', qd:'Nao Klavossae fromm bondrath Vorquenn' },
  'No maps available from linked novels': { th:'ไม่มีแผนที่จากนิยายที่เชื่อมต่อ', en:'No maps available from linked novels', ja:'リンク済みの小説にマップがありません', ko:'연결된 소설에 맵이 없습니다', zh:'关联小说中没有可用地图', vi:'Không có bản đồ từ tiểu thuyết liên kết', id:'Tidak ada peta dari novel tertaut', es:'No hay mapas disponibles de las novelas vinculadas', pt:'Nenhum mapa disponível dos romances vinculados', fr:'Aucune carte disponible depuis les romans liés', de:'Keine Karten aus verknüpften Romanen verfügbar', ru:'Нет карт из связанных романов', qd:'Nao Territhrae fromm bondrath Vorquenn' },
  'Pick an object or character first': { th:'เลือกรายการหรือตัวละครก่อน', en:'Pick an object or character first', ja:'先にオブジェクトかキャラクターを選択してください', ko:'먼저 오브젝트나 캐릭터를 선택하세요', zh:'请先选择对象或角色', vi:'Hãy chọn đối tượng hoặc nhân vật trước', id:'Pilih objek atau karakter dulu', es:'Elige primero un objeto o personaje', pt:'Escolha primeiro um objeto ou personagem', fr:'Choisissez d’abord un objet ou un personnage', de:'Wähle zuerst ein Objekt oder einen Charakter', ru:'Сначала выберите объект или персонажа', qd:'Choozz an Artifyx orr Beingrax fyrst' },
  'Add world objects/characters first': { th:'เพิ่มรายการหรือตัวละครของโลกก่อน', en:'Add world objects/characters first', ja:'先にワールドのオブジェクト/キャラクターを追加してください', ko:'먼저 세계의 오브젝트/캐릭터를 추가하세요', zh:'请先添加世界对象/角色', vi:'Hãy thêm đối tượng/nhân vật của thế giới trước', id:'Tambahkan objek/karakter dunia dulu', es:'Añade primero objetos/personajes del mundo', pt:'Adicione primeiro objetos/personagens do mundo', fr:'Ajoutez d’abord des objets/personnages du monde', de:'Füge zuerst Weltobjekte/-charaktere hinzu', ru:'Сначала добавьте объекты/персонажей мира', qd:'Grothul Realmyx Artifyx/Beingraxae fyrst' },
  'Select a date on the timeline first': { th:'เลือกวันที่บนไทม์ไลน์ก่อน', en:'Select a date on the timeline first', ja:'先にタイムライン上の日付を選択してください', ko:'먼저 타임라인에서 날짜를 선택하세요', zh:'请先在时间线上选择日期', vi:'Hãy chọn ngày trên dòng thời gian trước', id:'Pilih tanggal di linimasa dulu', es:'Selecciona primero una fecha en la cronología', pt:'Selecione primeiro uma data na linha do tempo', fr:'Sélectionnez d’abord une date sur la chronologie', de:'Wähle zuerst ein Datum auf der Zeitleiste', ru:'Сначала выберите дату на хронологии', qd:'Choozz a Sunn on thy Khronofang fyrst' },
  'Delete this world and all its data?': { th:'ลบโลกนี้และข้อมูลทั้งหมด?', en:'Delete this world and all its data?', ja:'このワールドとすべてのデータを削除？', ko:'이 세계와 모든 데이터를 삭제할까요?', zh:'删除此世界及其所有数据？', vi:'Xóa thế giới này và mọi dữ liệu?', id:'Hapus dunia ini beserta semua datanya?', es:'¿Eliminar este mundo y todos sus datos?', pt:'Excluir este mundo e todos os seus dados?', fr:'Supprimer ce monde et toutes ses données ?', de:'Diese Welt und alle ihre Daten löschen?', ru:'Удалить этот мир и все его данные?', qd:'Vhoreth thys Realmyx ee alle hoard?' },
  'Unlink this novel from the world?': { th:'ยกเลิกการเชื่อมต่อนิยายนี้กับโลก?', en:'Unlink this novel from the world?', ja:'この小説とワールドのリンクを解除？', ko:'이 소설의 세계 연결을 해제할까요?', zh:'取消此小说与世界的关联？', vi:'Hủy liên kết tiểu thuyết này khỏi thế giới?', id:'Batalkan tautan novel ini dari dunia?', es:'¿Desvincular esta novela del mundo?', pt:'Desvincular este romance do mundo?', fr:'Délier ce roman du monde ?', de:'Diesen Roman von der Welt trennen?', ru:'Отвязать этот роман от мира?', qd:'Unbondra thys Vorqu fromm thy Realmyx?' },
  'Delete category? All its objects will be removed.': { th:'ลบ Category? Objects ทั้งหมดจะหายด้วย', en:'Delete category? All its objects will be removed.', ja:'カテゴリーを削除？すべてのオブジェクトも消えます', ko:'카테고리를 삭제할까요? 모든 오브젝트가 제거됩니다', zh:'删除分类？其中所有对象将被移除', vi:'Xóa danh mục? Mọi đối tượng sẽ bị xóa.', id:'Hapus kategori? Semua objeknya akan dihapus.', es:'¿Eliminar la categoría? Se eliminarán todos sus objetos.', pt:'Excluir categoria? Todos os seus objetos serão removidos.', fr:'Supprimer la catégorie ? Tous ses objets seront supprimés.', de:'Kategorie löschen? Alle Objekte werden entfernt.', ru:'Удалить категорию? Все её объекты будут удалены.', qd:'Vhoreth Klavoss? Alle Artifyx shall crumbla to duszt.' },
  'Delete field? All its values will be lost': { th:'ลบ Field? ค่าทั้งหมดใน Field นี้จะหาย', en:'Delete field? All its values will be lost', ja:'フィールドを削除？すべての値が消えます', ko:'필드를 삭제할까요? 모든 값이 삭제됩니다', zh:'删除字段？其中所有值将丢失', vi:'Xóa trường? Mọi giá trị sẽ mất', id:'Hapus field? Semua nilainya akan hilang', es:'¿Eliminar el campo? Se perderán todos sus valores', pt:'Excluir campo? Todos os valores serão perdidos', fr:'Supprimer le champ ? Toutes ses valeurs seront perdues', de:'Feld löschen? Alle Werte gehen verloren', ru:'Удалить поле? Все его значения будут потеряны', qd:'Vhoreth Fyldyx? Alle worthyx shall crumbla to duszt' },
  'Delete this item?': { th:'ลบรายการนี้?', en:'Delete this item?', ja:'この項目を削除？', ko:'이 항목을 삭제할까요?', zh:'删除此条目？', vi:'Xóa mục này?', id:'Hapus item ini?', es:'¿Eliminar este elemento?', pt:'Excluir este item?', fr:'Supprimer cet élément ?', de:'Dieses Element löschen?', ru:'Удалить этот элемент?', qd:'Vhoreth thys Artifyx?' },
  'Delete this detail?': { th:'ลบรายละเอียดนี้?', en:'Delete this detail?', ja:'この詳細を削除？', ko:'이 상세 항목을 삭제할까요?', zh:'删除此详情？', vi:'Xóa chi tiết này?', id:'Hapus detail ini?', es:'¿Eliminar este detalle?', pt:'Excluir este detalhe?', fr:'Supprimer ce détail ?', de:'Dieses Detail löschen?', ru:'Удалить эту деталь?', qd:'Vhoreth thys Detharai?' },
  'Delete this character?': { th:'ลบตัวละครนี้?', en:'Delete this character?', ja:'このキャラクターを削除？', ko:'이 캐릭터를 삭제할까요?', zh:'删除此角色？', vi:'Xóa nhân vật này?', id:'Hapus karakter ini?', es:'¿Eliminar este personaje?', pt:'Excluir este personagem?', fr:'Supprimer ce personnage ?', de:'Diesen Charakter löschen?', ru:'Удалить этого персонажа?', qd:'Vhoreth thys Beingrax?' },
  'Remove this category from the world?': { th:'นำหมวดหมู่นี้ออกจากโลก?', en:'Remove this category from the world?', ja:'このカテゴリーをワールドから削除？', ko:'이 카테고리를 세계에서 제거할까요?', zh:'从世界中移除此分类？', vi:'Gỡ danh mục này khỏi thế giới?', id:'Hapus kategori ini dari dunia?', es:'¿Quitar esta categoría del mundo?', pt:'Remover esta categoria do mundo?', fr:'Retirer cette catégorie du monde ?', de:'Diese Kategorie aus der Welt entfernen?', ru:'Убрать эту категорию из мира?', qd:'Ejyra thys Klavoss fromm thy Realmyx?' },
  'Remove this map from the world?': { th:'นำแผนที่นี้ออกจากโลก?', en:'Remove this map from the world?', ja:'このマップをワールドから削除？', ko:'이 맵을 세계에서 제거할까요?', zh:'从世界中移除此地图？', vi:'Gỡ bản đồ này khỏi thế giới?', id:'Hapus peta ini dari dunia?', es:'¿Quitar este mapa del mundo?', pt:'Remover este mapa do mundo?', fr:'Retirer cette carte du monde ?', de:'Diese Karte aus der Welt entfernen?', ru:'Убрать эту карту из мира?', qd:'Ejyra thys Territhra fromm thy Realmyx?' },
  'Delete this timeline and its events?': { th:'ลบไทม์ไลน์นี้และเหตุการณ์ทั้งหมด?', en:'Delete this timeline and its events?', ja:'このタイムラインとイベントを削除？', ko:'이 타임라인과 이벤트를 삭제할까요?', zh:'删除此时间线及其事件？', vi:'Xóa dòng thời gian này và các sự kiện?', id:'Hapus linimasa ini beserta peristiwanya?', es:'¿Eliminar esta cronología y sus eventos?', pt:'Excluir esta linha do tempo e seus eventos?', fr:'Supprimer cette chronologie et ses événements ?', de:'Diese Zeitleiste und ihre Ereignisse löschen?', ru:'Удалить эту хронологию и её события?', qd:'Vhoreth thys Khronofang ee alle Chronoshard?' },
  'Delete this event?': { th:'ลบเหตุการณ์นี้?', en:'Delete this event?', ja:'このイベントを削除？', ko:'이 이벤트를 삭제할까요?', zh:'删除此事件？', vi:'Xóa sự kiện này?', id:'Hapus peristiwa ini?', es:'¿Eliminar este evento?', pt:'Excluir este evento?', fr:'Supprimer cet événement ?', de:'Dieses Ereignis löschen?', ru:'Удалить это событие?', qd:'Vhoreth thys Chronoshard?' },
  'Delete this game and all its data?': { th:'ลบเกมนี้และข้อมูลทั้งหมด?', en:'Delete this game and all its data?', ja:'このゲームとすべてのデータを削除？', ko:'이 게임과 모든 데이터를 삭제할까요?', zh:'删除此游戏及其所有数据？', vi:'Xóa trò chơi này và mọi dữ liệu?', id:'Hapus game ini beserta semua datanya?', es:'¿Eliminar este juego y todos sus datos?', pt:'Excluir este jogo e todos os seus dados?', fr:'Supprimer ce jeu et toutes ses données ?', de:'Dieses Spiel und alle seine Daten löschen?', ru:'Удалить эту игру и все её данные?', qd:'Vhoreth thys Playthyrm ee alle hoard?' },
  'Delete this description?': { th:'ลบคำอธิบายนี้?', en:'Delete this description?', ja:'この説明を削除？', ko:'이 설명을 삭제할까요?', zh:'删除此描述？', vi:'Xóa mô tả này?', id:'Hapus deskripsi ini?', es:'¿Eliminar esta descripción?', pt:'Excluir esta descrição?', fr:'Supprimer cette description ?', de:'Diese Beschreibung löschen?', ru:'Удалить это описание?', qd:'Vhoreth thys loretelling?' },
  'Delete this stat?': { th:'ลบสถิตินี้?', en:'Delete this stat?', ja:'このステータスを削除？', ko:'이 스탯을 삭제할까요?', zh:'删除此属性？', vi:'Xóa chỉ số này?', id:'Hapus statistik ini?', es:'¿Eliminar esta estadística?', pt:'Excluir esta estatística?', fr:'Supprimer cette statistique ?', de:'Diesen Wert löschen?', ru:'Удалить эту характеристику?', qd:'Vhoreth thys Vitharai?' },
  'Delete this item category?': { th:'ลบหมวดหมู่ไอเทมนี้?', en:'Delete this item category?', ja:'このアイテムカテゴリーを削除？', ko:'이 아이템 카테고리를 삭제할까요?', zh:'删除此物品分类？', vi:'Xóa danh mục vật phẩm này?', id:'Hapus kategori item ini?', es:'¿Eliminar esta categoría de objetos?', pt:'Excluir esta categoria de itens?', fr:'Supprimer cette catégorie d’objets ?', de:'Diese Gegenstandskategorie löschen?', ru:'Удалить эту категорию предметов?', qd:'Vhoreth thys Trinkyx Klavoss?' },
  'Delete this story?': { th:'ลบเนื้อเรื่องนี้?', en:'Delete this story?', ja:'このストーリーを削除？', ko:'이 스토리를 삭제할까요?', zh:'删除此剧情？', vi:'Xóa cốt truyện này?', id:'Hapus cerita ini?', es:'¿Eliminar esta historia?', pt:'Excluir esta história?', fr:'Supprimer cette histoire ?', de:'Diese Geschichte löschen?', ru:'Удалить эту историю?', qd:'Vhoreth thys Sagaal?' },
  'Delete this dialogue node?': { th:'ลบโหนดบทสนทนานี้?', en:'Delete this dialogue node?', ja:'このダイアログノードを削除？', ko:'이 다이얼로그 노드를 삭제할까요?', zh:'删除此对话节点？', vi:'Xóa nút hội thoại này?', id:'Hapus node dialog ini?', es:'¿Eliminar este nodo de diálogo?', pt:'Excluir este nó de diálogo?', fr:'Supprimer ce nœud de dialogue ?', de:'Diesen Dialogknoten löschen?', ru:'Удалить этот узел диалога?', qd:'Vhoreth thys Whispyrn Nodyx?' },
  'Delete this function category?': { th:'ลบหมวดหมู่ฟังก์ชันนี้?', en:'Delete this function category?', ja:'この機能カテゴリーを削除？', ko:'이 기능 카테고리를 삭제할까요?', zh:'删除此功能分类？', vi:'Xóa danh mục chức năng này?', id:'Hapus kategori fungsi ini?', es:'¿Eliminar esta categoría de funciones?', pt:'Excluir esta categoria de funções?', fr:'Supprimer cette catégorie de fonctions ?', de:'Diese Funktionskategorie löschen?', ru:'Удалить эту категорию функций?', qd:'Vhoreth thys Runemyx Klavoss?' },
  'Delete this function?': { th:'ลบฟังก์ชันนี้?', en:'Delete this function?', ja:'この機能を削除？', ko:'이 기능을 삭제할까요?', zh:'删除此功能？', vi:'Xóa chức năng này?', id:'Hapus fungsi ini?', es:'¿Eliminar esta función?', pt:'Excluir esta função?', fr:'Supprimer cette fonction ?', de:'Diese Funktion löschen?', ru:'Удалить эту функцию?', qd:'Vhoreth thys Runemyx?' },
  'Select different from/to nodes': { th:'เลือกโหนดต้นทาง/ปลายทางที่ต่างกัน', en:'Select different from/to nodes', ja:'異なる始点/終点ノードを選択してください', ko:'서로 다른 시작/대상 노드를 선택하세요', zh:'请选择不同的起点/终点节点', vi:'Chọn nút đầu/cuối khác nhau', id:'Pilih node asal/tujuan yang berbeda', es:'Selecciona nodos de origen/destino distintos', pt:'Selecione nós de origem/destino diferentes', fr:'Sélectionnez des nœuds source/cible différents', de:'Wähle unterschiedliche Start-/Zielknoten', ru:'Выберите разные узлы «из»/«в»', qd:'Choozz unlike Fravorn/Tovorn Nodyx' },
  'New World': { th:'สร้างโลกใหม่', en:'New World', ja:'新規ワールド', ko:'새 세계', zh:'新建世界', vi:'Thế giới mới', id:'Dunia baru', es:'Nuevo mundo', pt:'Novo mundo', fr:'Nouveau monde', de:'Neue Welt', ru:'Новый мир', qd:'Esshka Realmyx' },
  'Edit World': { th:'แก้ไขโลก', en:'Edit World', ja:'ワールドを編集', ko:'세계 수정', zh:'编辑世界', vi:'Sửa thế giới', id:'Edit dunia', es:'Editar mundo', pt:'Editar mundo', fr:'Modifier le monde', de:'Welt bearbeiten', ru:'Редактировать мир', qd:'Zhakrii Realmyx' },
  'Edit world': { th:'แก้ไขโลก', en:'Edit world', ja:'ワールドを編集', ko:'세계 수정', zh:'编辑世界', vi:'Sửa thế giới', id:'Edit dunia', es:'Editar mundo', pt:'Editar mundo', fr:'Modifier le monde', de:'Welt bearbeiten', ru:'Редактировать мир', qd:'Zhakrii Realmyx' },
  'Delete World': { th:'ลบโลก', en:'Delete World', ja:'ワールドを削除', ko:'세계 삭제', zh:'删除世界', vi:'Xóa thế giới', id:'Hapus dunia', es:'Eliminar mundo', pt:'Excluir mundo', fr:'Supprimer le monde', de:'Welt löschen', ru:'Удалить мир', qd:'Vhoreth Realmyx' },
  'World name': { th:'ชื่อโลก', en:'World name', ja:'ワールド名', ko:'세계 이름', zh:'世界名称', vi:'Tên thế giới', id:'Nama dunia', es:'Nombre del mundo', pt:'Nome do mundo', fr:'Nom du monde', de:'Weltname', ru:'Название мира', qd:'Realmyx Yssira' },
  'Link Novel': { th:'เชื่อมต่อนิยาย', en:'Link Novel', ja:'小説をリンク', ko:'소설 연결', zh:'关联小说', vi:'Liên kết tiểu thuyết', id:'Tautkan novel', es:'Vincular novela', pt:'Vincular romance', fr:'Lier un roman', de:'Roman verknüpfen', ru:'Связать роман', qd:'Bondra Vorqu' },
  'Link novel': { th:'เชื่อมต่อนิยาย', en:'Link novel', ja:'小説をリンク', ko:'소설 연결', zh:'关联小说', vi:'Liên kết tiểu thuyết', id:'Tautkan novel', es:'Vincular novela', pt:'Vincular romance', fr:'Lier un roman', de:'Roman verknüpfen', ru:'Связать роман', qd:'Bondra Vorqu' },
  'Link Object': { th:'เชื่อมต่อรายการ', en:'Link Object', ja:'オブジェクトをリンク', ko:'오브젝트 연결', zh:'链接对象', vi:'Liên kết đối tượng', id:'Tautkan objek', es:'Vincular objeto', pt:'Vincular objeto', fr:'Lier un objet', de:'Objekt verknüpfen', ru:'Связать объект', qd:'Bondra Artifyx' },
  'Link object': { th:'เชื่อมต่อรายการ', en:'Link object', ja:'オブジェクトをリンク', ko:'오브젝트 연결', zh:'链接对象', vi:'Liên kết đối tượng', id:'Tautkan objek', es:'Vincular objeto', pt:'Vincular objeto', fr:'Lier un objet', de:'Objekt verknüpfen', ru:'Связать объект', qd:'Bondra Artifyx' },
  'No novels linked': { th:'ยังไม่มีนิยายที่เชื่อมต่อ', en:'No novels linked', ja:'リンク済みの小説はありません', ko:'연결된 소설이 없습니다', zh:'没有关联小说', vi:'Chưa có tiểu thuyết liên kết', id:'Belum ada novel tertaut', es:'No hay novelas vinculadas', pt:'Nenhum romance vinculado', fr:'Aucun roman lié', de:'Keine verknüpften Romane', ru:'Нет связанных романов', qd:'Nao Bondrath Vorquenn' },
  'Set as the character category for this novel': { th:'ตั้งเป็นหมวดหมู่ตัวละครของนิยายนี้', en:'Set as the character category for this novel', ja:'この小説のキャラクターカテゴリーに設定', ko:'이 소설의 캐릭터 카테고리로 설정', zh:'设为此小说的角色分类', vi:'Đặt làm danh mục nhân vật của tiểu thuyết này', id:'Jadikan kategori karakter untuk novel ini', es:'Establecer como la categoría de personajes de esta novela', pt:'Definir como a categoria de personagens deste romance', fr:'Définir comme catégorie de personnages de ce roman', de:'Als Charakterkategorie für diesen Roman festlegen', ru:'Сделать категорией персонажей этого романа', qd:'Bestow as Beingrax Klavoss fyr thys Vorqu' },
  'Add an original category for this world': { th:'เพิ่มหมวดหมู่ของโลกนี้', en:'Add an original category for this world', ja:'このワールドのオリジナルカテゴリーを追加', ko:'이 세계의 오리지널 카테고리를 추가', zh:'为此世界添加原创分类', vi:'Thêm danh mục gốc cho thế giới này', id:'Tambahkan kategori asli untuk dunia ini', es:'Añade una categoría original para este mundo', pt:'Adicione uma categoria original para este mundo', fr:'Ajoutez une catégorie originale pour ce monde', de:'Füge eine Originalkategorie für diese Welt hinzu', ru:'Добавьте оригинальную категорию для этого мира', qd:'Grothul a Primoryx Klavoss fyr thys Realmyx' },
  'No categories yet. Link novels, then add their categories.': { th:'ยังไม่มีหมวดหมู่ เชื่อมต่อนิยายแล้วเพิ่มหมวดหมู่ของนิยาย', en:'No categories yet. Link novels, then add their categories.', ja:'カテゴリーがありません。小説をリンクしてからカテゴリーを追加してください', ko:'카테고리가 없습니다. 소설을 연결한 뒤 카테고리를 추가하세요', zh:'还没有分类。请先关联小说，再添加其分类', vi:'Chưa có danh mục. Hãy liên kết tiểu thuyết rồi thêm danh mục của chúng.', id:'Belum ada kategori. Tautkan novel, lalu tambahkan kategorinya.', es:'Aún no hay categorías. Vincula novelas y luego añade sus categorías.', pt:'Ainda não há categorias. Vincule romances e depois adicione suas categorias.', fr:'Aucune catégorie. Liez des romans, puis ajoutez leurs catégories.', de:'Noch keine Kategorien. Verknüpfe Romane und füge dann ihre Kategorien hinzu.', ru:'Пока нет категорий. Свяжите романы, затем добавьте их категории.', qd:'Nao Klavossae yeth. Bondra Vorquenn, thenn grothul thyr Klavossae.' },
  'No maps yet. Link novels, then add their maps.': { th:'ยังไม่มีแผนที่ เชื่อมต่อนิยายแล้วเพิ่มแผนที่ของนิยาย', en:'No maps yet. Link novels, then add their maps.', ja:'マップがありません。小説をリンクしてからマップを追加してください', ko:'맵이 없습니다. 소설을 연결한 뒤 맵을 추가하세요', zh:'还没有地图。请先关联小说，再添加其地图', vi:'Chưa có bản đồ. Hãy liên kết tiểu thuyết rồi thêm bản đồ của chúng.', id:'Belum ada peta. Tautkan novel, lalu tambahkan petanya.', es:'Aún no hay mapas. Vincula novelas y luego añade sus mapas.', pt:'Ainda não há mapas. Vincule romances e depois adicione seus mapas.', fr:'Aucune carte. Liez des romans, puis ajoutez leurs cartes.', de:'Noch keine Karten. Verknüpfe Romane und füge dann ihre Karten hinzu.', ru:'Пока нет карт. Свяжите романы, затем добавьте их карты.', qd:'Nao Territhrae yeth. Bondra Vorquenn, thenn grothul thyr Territhrae.' },
  'No characters yet.': { th:'ยังไม่มีตัวละคร', en:'No characters yet.', ja:'キャラクターがいません', ko:'캐릭터가 없습니다', zh:'还没有角色', vi:'Chưa có nhân vật', id:'Belum ada karakter', es:'Aún no hay personajes', pt:'Ainda não há personagens', fr:'Aucun personnage pour le moment', de:'Noch keine Charaktere', ru:'Пока нет персонажей', qd:'Nao Beingraxae yeth.' },
  'No data': { th:'ยังไม่มีข้อมูล', en:'No data', ja:'データがありません', ko:'데이터가 없습니다', zh:'没有数据', vi:'Chưa có dữ liệu', id:'Belum ada data', es:'Sin datos', pt:'Sem dados', fr:'Aucune donnée', de:'Keine Daten', ru:'Нет данных', qd:'Nao hoard' },
  'No events yet.': { th:'ยังไม่มีเหตุการณ์', en:'No events yet.', ja:'イベントがありません', ko:'이벤트가 없습니다', zh:'还没有事件', vi:'Chưa có sự kiện', id:'Belum ada peristiwa', es:'Aún no hay eventos', pt:'Ainda não há eventos', fr:'Aucun événement pour le moment', de:'Noch keine Ereignisse', ru:'Пока нет событий', qd:'Nao Chronoshard yeth.' },
  'No fields': { th:'ยังไม่มี Field', en:'No fields', ja:'フィールドがありません', ko:'필드가 없습니다', zh:'没有字段', vi:'Chưa có trường', id:'Belum ada field', es:'Sin campos', pt:'Sem campos', fr:'Aucun champ', de:'Keine Felder', ru:'Нет полей', qd:'Nao Fyldyx' },
  'No objects available': { th:'ไม่มีรายการให้เลือก', en:'No objects available', ja:'オブジェクトがありません', ko:'오브젝트가 없습니다', zh:'没有可用对象', vi:'Không có đối tượng', id:'Tidak ada objek', es:'No hay objetos disponibles', pt:'Nenhum objeto disponível', fr:'Aucun objet disponible', de:'Keine Objekte verfügbar', ru:'Нет доступных объектов', qd:'Nao Artifyx availthra' },
  'No objects.': { th:'ยังไม่มีรายการ', en:'No objects.', ja:'オブジェクトがありません', ko:'오브젝트가 없습니다', zh:'没有对象', vi:'Chưa có đối tượng', id:'Belum ada objek', es:'Sin objetos', pt:'Sem objetos', fr:'Aucun objet', de:'Keine Objekte', ru:'Нет объектов', qd:'Nao Artifyx.' },
  'No timelines yet.': { th:'ยังไม่มีไทม์ไลน์', en:'No timelines yet.', ja:'タイムラインがありません', ko:'타임라인이 없습니다', zh:'还没有时间线', vi:'Chưa có dòng thời gian', id:'Belum ada linimasa', es:'Aún no hay cronologías', pt:'Ainda não há linhas do tempo', fr:'Aucune chronologie pour le moment', de:'Noch keine Zeitleisten', ru:'Пока нет хронологий', qd:'Nao Khronofang yeth.' },
  'Nothing placed yet. Use the Add tool on the map to place one.': { th:'ยังไม่มีการวางบนแผนที่ ใช้เครื่องมือ Add บนแผนที่เพื่อวาง', en:'Nothing placed yet. Use the Add tool on the map to place one.', ja:'まだ何も配置されていません。マップのAddツールで配置してください', ko:'아직 배치된 것이 없습니다. 맵의 추가 도구로 배치하세요', zh:'还没有放置任何内容。请使用地图上的添加工具放置', vi:'Chưa đặt gì cả. Dùng công cụ Thêm trên bản đồ để đặt.', id:'Belum ada yang ditempatkan. Gunakan alat Tambah di peta.', es:'Nada colocado todavía. Usa la herramienta Añadir en el mapa.', pt:'Nada posicionado ainda. Use a ferramenta Adicionar no mapa.', fr:'Rien n’est encore placé. Utilisez l’outil Ajouter sur la carte.', de:'Noch nichts platziert. Nutze das Hinzufügen-Werkzeug auf der Karte.', ru:'Пока ничего не размещено. Используйте инструмент добавления на карте.', qd:'Naught placyth yeth. Wield thy Grothul tooly on thy Territhra.' },
  'Pick a map from the left panel, then one of its timelines.': { th:'เลือกแผนที่จากแผงด้านซ้าย แล้วเลือกไทม์ไลน์ของแผนที่นั้น', en:'Pick a map from the left panel, then one of its timelines.', ja:'左パネルからマップを選び、そのタイムラインを選択してください', ko:'왼쪽 패널에서 맵을 고른 뒤 타임라인을 선택하세요', zh:'从左侧面板选择地图，再选择其时间线', vi:'Chọn bản đồ ở bảng bên trái, rồi chọn dòng thời gian của nó.', id:'Pilih peta dari panel kiri, lalu salah satu linimasanya.', es:'Elige un mapa en el panel izquierdo y luego una de sus cronologías.', pt:'Escolha um mapa no painel esquerdo e depois uma de suas linhas do tempo.', fr:'Choisissez une carte dans le panneau de gauche, puis une de ses chronologies.', de:'Wähle links eine Karte und dann eine ihrer Zeitleisten.', ru:'Выберите карту на левой панели, затем одну из её хронологий.', qd:'Choozz a Territhra fromm thy left panylx, thenn onya Khronofang.' },
  'This timeline has no anchor map.': { th:'ไทม์ไลน์นี้ยังไม่มีแผนที่หลัก', en:'This timeline has no anchor map.', ja:'このタイムラインにはアンカーマップがありません', ko:'이 타임라인에는 기준 맵이 없습니다', zh:'此时间线没有锚点地图', vi:'Dòng thời gian này chưa có bản đồ neo.', id:'Linimasa ini tidak punya peta jangkar.', es:'Esta cronología no tiene mapa ancla.', pt:'Esta linha do tempo não tem mapa âncora.', fr:'Cette chronologie n’a pas de carte d’ancrage.', de:'Diese Zeitleiste hat keine Ankerkarte.', ru:'У этой хронологии нет опорной карты.', qd:'Thys Khronofang holdz nao anchyr Territhra.' },
  'Anchor map (optional)': { th:'แผนที่หลัก (ไม่บังคับ)', en:'Anchor map (optional)', ja:'アンカーマップ（任意）', ko:'기준 맵 (선택)', zh:'锚点地图（可选）', vi:'Bản đồ neo (tùy chọn)', id:'Peta jangkar (opsional)', es:'Mapa ancla (opcional)', pt:'Mapa âncora (opcional)', fr:'Carte d’ancrage (optionnel)', de:'Ankerkarte (optional)', ru:'Опорная карта (необязательно)', qd:'Anchyr Territhra (unbound)' },
  'Select a timeline': { th:'เลือกไทม์ไลน์', en:'Select a timeline', ja:'タイムラインを選択', ko:'타임라인을 선택하세요', zh:'选择时间线', vi:'Chọn dòng thời gian', id:'Pilih linimasa', es:'Selecciona una cronología', pt:'Selecione uma linha do tempo', fr:'Sélectionnez une chronologie', de:'Wähle eine Zeitleiste', ru:'Выберите хронологию', qd:'Choozz a Khronofang' },
  'Select an item to view details': { th:'เลือกรายการเพื่อดูรายละเอียด', en:'Select an item to view details', ja:'項目を選択して詳細を表示', ko:'항목을 선택하면 상세가 표시됩니다', zh:'选择条目以查看详情', vi:'Chọn một mục để xem chi tiết', id:'Pilih item untuk melihat detail', es:'Selecciona un elemento para ver los detalles', pt:'Selecione um item para ver os detalhes', fr:'Sélectionnez un élément pour voir les détails', de:'Wähle ein Element, um Details zu sehen', ru:'Выберите элемент для просмотра деталей', qd:'Choozz an Artifyx to beholdra Detharai' },
  'Show all': { th:'แสดงทั้งหมด', en:'Show all', ja:'すべて表示', ko:'모두 표시', zh:'显示全部', vi:'Hiện tất cả', id:'Tampilkan semua', es:'Mostrar todo', pt:'Mostrar tudo', fr:'Tout afficher', de:'Alle anzeigen', ru:'Показать все', qd:'Beholdra alle' },
  'New Category': { th:'เพิ่มหมวดหมู่ใหม่', en:'New Category', ja:'新規カテゴリー', ko:'새 카테고리', zh:'新建分类', vi:'Danh mục mới', id:'Kategori baru', es:'Nueva categoría', pt:'Nova categoria', fr:'Nouvelle catégorie', de:'Neue Kategorie', ru:'Новая категория', qd:'Esshka Klavoss' },
  'Edit Category': { th:'แก้ไขหมวดหมู่', en:'Edit Category', ja:'カテゴリーを編集', ko:'카테고리 수정', zh:'编辑分类', vi:'Sửa danh mục', id:'Edit kategori', es:'Editar categoría', pt:'Editar categoria', fr:'Modifier la catégorie', de:'Kategorie bearbeiten', ru:'Редактировать категорию', qd:'Zhakrii Klavoss' },
  'Add Category': { th:'เพิ่มหมวดหมู่', en:'Add Category', ja:'カテゴリーを追加', ko:'카테고리 추가', zh:'添加分类', vi:'Thêm danh mục', id:'Tambah kategori', es:'Añadir categoría', pt:'Adicionar categoria', fr:'Ajouter une catégorie', de:'Kategorie hinzufügen', ru:'Добавить категорию', qd:'Grothul Klavoss' },
  'Remove category': { th:'นำหมวดหมู่ออก', en:'Remove category', ja:'カテゴリーを削除', ko:'카테고리 제거', zh:'移除分类', vi:'Gỡ danh mục', id:'Hapus kategori', es:'Quitar categoría', pt:'Remover categoria', fr:'Retirer la catégorie', de:'Kategorie entfernen', ru:'Убрать категорию', qd:'Ejyra Klavoss' },
  'Add Map': { th:'เพิ่มแผนที่', en:'Add Map', ja:'マップを追加', ko:'맵 추가', zh:'添加地图', vi:'Thêm bản đồ', id:'Tambah peta', es:'Añadir mapa', pt:'Adicionar mapa', fr:'Ajouter une carte', de:'Karte hinzufügen', ru:'Добавить карту', qd:'Grothul Territhra' },
  'Add map': { th:'เพิ่มแผนที่', en:'Add map', ja:'マップを追加', ko:'맵 추가', zh:'添加地图', vi:'Thêm bản đồ', id:'Tambah peta', es:'Añadir mapa', pt:'Adicionar mapa', fr:'Ajouter une carte', de:'Karte hinzufügen', ru:'Добавить карту', qd:'Grothul Territhra' },
  'Remove map': { th:'นำแผนที่ออก', en:'Remove map', ja:'マップを削除', ko:'맵 제거', zh:'移除地图', vi:'Gỡ bản đồ', id:'Hapus peta', es:'Quitar mapa', pt:'Remover mapa', fr:'Retirer la carte', de:'Karte entfernen', ru:'Убрать карту', qd:'Ejyra Territhra' },
  'Add object': { th:'เพิ่มรายการ', en:'Add object', ja:'オブジェクトを追加', ko:'오브젝트 추가', zh:'添加对象', vi:'Thêm đối tượng', id:'Tambah objek', es:'Añadir objeto', pt:'Adicionar objeto', fr:'Ajouter un objet', de:'Objekt hinzufügen', ru:'Добавить объект', qd:'Grothul Artifyx' },
  'Delete object': { th:'ลบรายการ', en:'Delete object', ja:'オブジェクトを削除', ko:'오브젝트 삭제', zh:'删除对象', vi:'Xóa đối tượng', id:'Hapus objek', es:'Eliminar objeto', pt:'Excluir objeto', fr:'Supprimer l’objet', de:'Objekt löschen', ru:'Удалить объект', qd:'Vhoreth Artifyx' },
  'Move object': { th:'ย้ายรายการ', en:'Move object', ja:'オブジェクトを移動', ko:'오브젝트 이동', zh:'移动对象', vi:'Di chuyển đối tượng', id:'Pindahkan objek', es:'Mover objeto', pt:'Mover objeto', fr:'Déplacer l’objet', de:'Objekt verschieben', ru:'Переместить объект', qd:'Shyft Artifyx' },
  'Place Object': { th:'วางรายการ', en:'Place Object', ja:'オブジェクトを配置', ko:'오브젝트 배치', zh:'放置对象', vi:'Đặt đối tượng', id:'Tempatkan objek', es:'Colocar objeto', pt:'Posicionar objeto', fr:'Placer l’objet', de:'Objekt platzieren', ru:'Разместить объект', qd:'Placyth Artifyx' },
  'Place': { th:'วาง', en:'Place', ja:'配置', ko:'배치', zh:'放置', vi:'Đặt', id:'Tempatkan', es:'Colocar', pt:'Posicionar', fr:'Placer', de:'Platzieren', ru:'Разместить', qd:'Placyth' },
  'Event Objects': { th:'รายการในเหตุการณ์', en:'Event Objects', ja:'イベントのオブジェクト', ko:'이벤트 오브젝트', zh:'事件对象', vi:'Đối tượng của sự kiện', id:'Objek peristiwa', es:'Objetos del evento', pt:'Objetos do evento', fr:'Objets de l’événement', de:'Ereignisobjekte', ru:'Объекты события', qd:'Chronoshard Artifyx' },
  'New Event': { th:'เพิ่มเหตุการณ์ใหม่', en:'New Event', ja:'新規イベント', ko:'새 이벤트', zh:'新建事件', vi:'Sự kiện mới', id:'Peristiwa baru', es:'Nuevo evento', pt:'Novo evento', fr:'Nouvel événement', de:'Neues Ereignis', ru:'Новое событие', qd:'Esshka Chronoshard' },
  'New timeline': { th:'เพิ่มไทม์ไลน์ใหม่', en:'New timeline', ja:'新規タイムライン', ko:'새 타임라인', zh:'新建时间线', vi:'Dòng thời gian mới', id:'Linimasa baru', es:'Nueva cronología', pt:'Nova linha do tempo', fr:'Nouvelle chronologie', de:'Neue Zeitleiste', ru:'Новая хронология', qd:'Esshka Khronofang' },
  'New Timeline': { th:'เพิ่มไทม์ไลน์ใหม่', en:'New Timeline', ja:'新規タイムライン', ko:'새 타임라인', zh:'新建时间线', vi:'Dòng thời gian mới', id:'Linimasa baru', es:'Nueva cronología', pt:'Nova linha do tempo', fr:'Nouvelle chronologie', de:'Neue Zeitleiste', ru:'Новая хронология', qd:'Esshka Khronofang' },
  'Edit Timeline': { th:'แก้ไขไทม์ไลน์', en:'Edit Timeline', ja:'タイムラインを編集', ko:'타임라인 수정', zh:'编辑时间线', vi:'Sửa dòng thời gian', id:'Edit linimasa', es:'Editar cronología', pt:'Editar linha do tempo', fr:'Modifier la chronologie', de:'Zeitleiste bearbeiten', ru:'Редактировать хронологию', qd:'Zhakrii Khronofang' },
  'New Character': { th:'เพิ่มตัวละครใหม่', en:'New Character', ja:'新規キャラクター', ko:'새 캐릭터', zh:'新建角色', vi:'Nhân vật mới', id:'Karakter baru', es:'Nuevo personaje', pt:'Novo personagem', fr:'Nouveau personnage', de:'Neuer Charakter', ru:'Новый персонаж', qd:'Esshka Beingrax' },
  'Edit Character': { th:'แก้ไขตัวละคร', en:'Edit Character', ja:'キャラクターを編集', ko:'캐릭터 수정', zh:'编辑角色', vi:'Sửa nhân vật', id:'Edit karakter', es:'Editar personaje', pt:'Editar personagem', fr:'Modifier le personnage', de:'Charakter bearbeiten', ru:'Редактировать персонажа', qd:'Zhakrii Beingrax' },
  'Choose symbol': { th:'เลือกสัญลักษณ์', en:'Choose symbol', ja:'シンボルを選択', ko:'기호 선택', zh:'选择符号', vi:'Chọn ký hiệu', id:'Pilih simbol', es:'Elegir símbolo', pt:'Escolher símbolo', fr:'Choisir un symbole', de:'Symbol wählen', ru:'Выбрать символ', qd:'Choozz Glyphyx' },
  'Choose Symbol': { th:'เลือกสัญลักษณ์', en:'Choose Symbol', ja:'シンボルを選択', ko:'기호 선택', zh:'选择符号', vi:'Chọn ký hiệu', id:'Pilih simbol', es:'Elegir símbolo', pt:'Escolher símbolo', fr:'Choisir un symbole', de:'Symbol wählen', ru:'Выбрать символ', qd:'Choozz Glyphyx' },
  'Type a custom symbol...': { th:'พิมพ์สัญลักษณ์ที่ต้องการ...', en:'Type a custom symbol...', ja:'カスタムシンボルを入力...', ko:'원하는 기호 입력...', zh:'输入自定义符号...', vi:'Nhập ký hiệu tùy ý...', id:'Ketik simbol khusus...', es:'Escribe un símbolo personalizado...', pt:'Digite um símbolo personalizado...', fr:'Saisissez un symbole personnalisé...', de:'Eigenes Symbol eingeben...', ru:'Введите свой символ...', qd:'Skrivath thy own Glyphyx...' },
  'Manage Fields': { th:'จัดการ Fields', en:'Manage Fields', ja:'フィールドを管理', ko:'필드 관리', zh:'管理字段', vi:'Quản lý trường', id:'Kelola field', es:'Gestionar campos', pt:'Gerenciar campos', fr:'Gérer les champs', de:'Felder verwalten', ru:'Управление полями', qd:'Wardenn Fyldyxae' },
  'Manage Item Fields': { th:'จัดการ Fields ของไอเทม', en:'Manage Item Fields', ja:'アイテムフィールドを管理', ko:'아이템 필드 관리', zh:'管理物品字段', vi:'Quản lý trường vật phẩm', id:'Kelola field item', es:'Gestionar campos de objetos', pt:'Gerenciar campos de itens', fr:'Gérer les champs d’objets', de:'Gegenstandsfelder verwalten', ru:'Управление полями предметов', qd:'Wardenn Trinkyx Fyldyxae' },
  'Field name': { th:'ชื่อ Field', en:'Field name', ja:'フィールド名', ko:'필드 이름', zh:'字段名称', vi:'Tên trường', id:'Nama field', es:'Nombre del campo', pt:'Nome do campo', fr:'Nom du champ', de:'Feldname', ru:'Название поля', qd:'Fyldyx Yssira' },
  'Attribute name': { th:'ชื่อ Attribute', en:'Attribute name', ja:'属性名', ko:'속성 이름', zh:'属性名称', vi:'Tên thuộc tính', id:'Nama atribut', es:'Nombre del atributo', pt:'Nome do atributo', fr:'Nom de l’attribut', de:'Attributname', ru:'Название атрибута', qd:'Attribyx Yssira' },
  'Fields apply to every object in this category': { th:'Fields ใช้กับทุก Object ใน Category นี้', en:'Fields apply to every object in this category', ja:'フィールドはこのカテゴリーのすべてのオブジェクトに適用されます', ko:'필드는 이 카테고리의 모든 오브젝트에 적용됩니다', zh:'字段适用于此分类中的所有对象', vi:'Trường áp dụng cho mọi đối tượng trong danh mục này', id:'Field berlaku untuk semua objek dalam kategori ini', es:'Los campos se aplican a todos los objetos de esta categoría', pt:'Os campos se aplicam a todos os objetos desta categoria', fr:'Les champs s’appliquent à tous les objets de cette catégorie', de:'Felder gelten für jedes Objekt in dieser Kategorie', ru:'Поля применяются ко всем объектам этой категории', qd:'Fyldyxae bestow upon alle Artifyx in thys Klavoss' },
  'Additional notes for this item...': { th:'เพิ่มหมายเหตุเพิ่มเติมสำหรับรายการนี้...', en:'Additional notes for this item...', ja:'この項目に補足メモを追加...', ko:'이 항목에 대한 추가 메모...', zh:'为此条目添加补充备注...', vi:'Thêm ghi chú cho mục này...', id:'Catatan tambahan untuk item ini...', es:'Notas adicionales para este elemento...', pt:'Notas adicionais para este item...', fr:'Notes supplémentaires pour cet élément...', de:'Zusätzliche Notizen zu diesem Element...', ru:'Дополнительные заметки к этому элементу...', qd:'Skrivath moar lorenotes fyr thys Artifyx...' },
  'e.g. AAA': { th:'เช่น AAA', en:'e.g. AAA', ja:'例：AAA', ko:'예: AAA', zh:'例如 AAA', vi:'VD: AAA', id:'mis. AAA', es:'p. ej. AAA', pt:'ex.: AAA', fr:'ex. AAA', de:'z. B. AAA', ru:'напр. AAA', qd:'lyk AAA' },
  'e.g. Age, Power': { th:'เช่น อายุ, พลังพิเศษ', en:'e.g. Age, Power', ja:'例：年齢、能力', ko:'예: 나이, 능력', zh:'例如：年龄、能力', vi:'VD: Tuổi, Sức mạnh', id:'mis. Usia, Kekuatan', es:'p. ej. Edad, Poder', pt:'ex.: Idade, Poder', fr:'ex. Âge, Pouvoir', de:'z. B. Alter, Kraft', ru:'напр. Возраст, Сила', qd:'lyk Aeon, Vyrm-might' },
  'e.g. Concept, Theme': { th:'เช่น แนวคิด, ธีม', en:'e.g. Concept, Theme', ja:'例：コンセプト、テーマ', ko:'예: 콘셉트, 테마', zh:'例如：概念、主题', vi:'VD: Ý tưởng, Chủ đề', id:'mis. Konsep, Tema', es:'p. ej. Concepto, Tema', pt:'ex.: Conceito, Tema', fr:'ex. Concept, Thème', de:'z. B. Konzept, Thema', ru:'напр. Концепция, Тема', qd:'lyk Mindspark, Soulthread' },
  'e.g. ⚔️': { th:'เช่น ⚔️', en:'e.g. ⚔️', ja:'例：⚔️', ko:'예: ⚔️', zh:'例如 ⚔️', vi:'VD: ⚔️', id:'mis. ⚔️', es:'p. ej. ⚔️', pt:'ex.: ⚔️', fr:'ex. ⚔️', de:'z. B. ⚔️', ru:'напр. ⚔️', qd:'lyk ⚔️' },
  'text': { th:'ข้อความ', en:'text', ja:'テキスト', ko:'텍스트', zh:'文本', vi:'văn bản', id:'teks', es:'texto', pt:'texto', fr:'texte', de:'Text', ru:'текст', qd:'runyx' },
  'textarea': { th:'ข้อความยาว', en:'textarea', ja:'テキストエリア', ko:'텍스트 영역', zh:'多行文本', vi:'văn bản dài', id:'teks panjang', es:'texto largo', pt:'texto longo', fr:'texte long', de:'Textbereich', ru:'многострочный текст', qd:'longrunyx' },
  'number': { th:'ตัวเลข', en:'number', ja:'数値', ko:'숫자', zh:'数字', vi:'số', id:'angka', es:'número', pt:'número', fr:'nombre', de:'Zahl', ru:'число', qd:'tallyx' },
  'New Game': { th:'สร้างเกมใหม่', en:'New Game', ja:'新規ゲーム', ko:'새 게임', zh:'新建游戏', vi:'Trò chơi mới', id:'Game baru', es:'Nuevo juego', pt:'Novo jogo', fr:'Nouveau jeu', de:'Neues Spiel', ru:'Новая игра', qd:'Esshka Playthyrm' },
  'Edit Game': { th:'แก้ไขเกม', en:'Edit Game', ja:'ゲームを編集', ko:'게임 수정', zh:'编辑游戏', vi:'Sửa trò chơi', id:'Edit game', es:'Editar juego', pt:'Editar jogo', fr:'Modifier le jeu', de:'Spiel bearbeiten', ru:'Редактировать игру', qd:'Zhakrii Playthyrm' },
  'Delete Game': { th:'ลบเกม', en:'Delete Game', ja:'ゲームを削除', ko:'게임 삭제', zh:'删除游戏', vi:'Xóa trò chơi', id:'Hapus game', es:'Eliminar juego', pt:'Excluir jogo', fr:'Supprimer le jeu', de:'Spiel löschen', ru:'Удалить игру', qd:'Vhoreth Playthyrm' },
  'Descriptions': { th:'คำอธิบาย', en:'Descriptions', ja:'説明', ko:'설명', zh:'描述', vi:'Mô tả', id:'Deskripsi', es:'Descripciones', pt:'Descrições', fr:'Descriptions', de:'Beschreibungen', ru:'Описания', qd:'Loretellings' },
  'No descriptions yet.': { th:'ยังไม่มีคำอธิบาย', en:'No descriptions yet.', ja:'説明がありません', ko:'설명이 없습니다', zh:'还没有描述', vi:'Chưa có mô tả', id:'Belum ada deskripsi', es:'Aún no hay descripciones', pt:'Ainda não há descrições', fr:'Aucune description pour le moment', de:'Noch keine Beschreibungen', ru:'Пока нет описаний', qd:'Nao loretellings yeth.' },
  'Add Description': { th:'เพิ่มคำอธิบาย', en:'Add Description', ja:'説明を追加', ko:'설명 추가', zh:'添加描述', vi:'Thêm mô tả', id:'Tambah deskripsi', es:'Añadir descripción', pt:'Adicionar descrição', fr:'Ajouter une description', de:'Beschreibung hinzufügen', ru:'Добавить описание', qd:'Grothul loretelling' },
  'Edit Description': { th:'แก้ไขคำอธิบาย', en:'Edit Description', ja:'説明を編集', ko:'설명 수정', zh:'编辑描述', vi:'Sửa mô tả', id:'Edit deskripsi', es:'Editar descripción', pt:'Editar descrição', fr:'Modifier la description', de:'Beschreibung bearbeiten', ru:'Редактировать описание', qd:'Zhakrii loretelling' },
  'Section title': { th:'ชื่อหัวข้อ', en:'Section title', ja:'セクションのタイトル', ko:'섹션 제목', zh:'小节标题', vi:'Tiêu đề mục', id:'Judul bagian', es:'Título de la sección', pt:'Título da seção', fr:'Titre de la section', de:'Abschnittstitel', ru:'Заголовок раздела', qd:'Sectyx Titheryn' },
  'Add Stat': { th:'เพิ่มสถิติ', en:'Add Stat', ja:'ステータスを追加', ko:'스탯 추가', zh:'添加属性', vi:'Thêm chỉ số', id:'Tambah statistik', es:'Añadir estadística', pt:'Adicionar estatística', fr:'Ajouter une statistique', de:'Wert hinzufügen', ru:'Добавить характеристику', qd:'Grothul Vitharai' },
  'Stat': { th:'สถิติ', en:'Stat', ja:'ステータス', ko:'스탯', zh:'属性', vi:'Chỉ số', id:'Statistik', es:'Estadística', pt:'Estatística', fr:'Statistique', de:'Wert', ru:'Характеристика', qd:'Vitharai' },
  'Stat Name *': { th:'ชื่อสถิติ *', en:'Stat Name *', ja:'ステータス名 *', ko:'스탯 이름 *', zh:'属性名称 *', vi:'Tên chỉ số *', id:'Nama statistik *', es:'Nombre de la estadística *', pt:'Nome da estatística *', fr:'Nom de la statistique *', de:'Wertname *', ru:'Название характеристики *', qd:'Vitharai Yssira *' },
  'HP, ATK, DEF...': { th:'HP, ATK, DEF...', en:'HP, ATK, DEF...', ja:'HP、ATK、DEF...', ko:'HP, ATK, DEF...', zh:'HP、ATK、DEF...', vi:'HP, ATK, DEF...', id:'HP, ATK, DEF...', es:'HP, ATK, DEF...', pt:'HP, ATK, DEF...', fr:'HP, ATK, DEF...', de:'HP, ATK, DEF...', ru:'HP, ATK, DEF...', qd:'HP, ATK, DEF...' },
  'Number': { th:'ตัวเลข', en:'Number', ja:'数値', ko:'숫자', zh:'数字', vi:'Số', id:'Angka', es:'Número', pt:'Número', fr:'Nombre', de:'Zahl', ru:'Число', qd:'Tallyx' },
  'Percent': { th:'เปอร์เซ็นต์', en:'Percent', ja:'パーセント', ko:'퍼센트', zh:'百分比', vi:'Phần trăm', id:'Persen', es:'Porcentaje', pt:'Porcentagem', fr:'Pourcentage', de:'Prozent', ru:'Процент', qd:'Centyx' },
  'Yes/No': { th:'ใช่/ไม่ใช่', en:'Yes/No', ja:'はい/いいえ', ko:'예/아니오', zh:'是/否', vi:'Có/Không', id:'Ya/Tidak', es:'Sí/No', pt:'Sim/Não', fr:'Oui/Non', de:'Ja/Nein', ru:'Да/Нет', qd:'Aye/Nay' },
  'Template': { th:'เทมเพลต', en:'Template', ja:'テンプレート', ko:'템플릿', zh:'模板', vi:'Mẫu', id:'Templat', es:'Plantilla', pt:'Modelo', fr:'Modèle', de:'Vorlage', ru:'Шаблон', qd:'Formshape' },
  'Symbol / Icon': { th:'สัญลักษณ์ / ไอคอน', en:'Symbol / Icon', ja:'シンボル / アイコン', ko:'기호 / 아이콘', zh:'符号 / 图标', vi:'Ký hiệu / Biểu tượng', id:'Simbol / Ikon', es:'Símbolo / Icono', pt:'Símbolo / Ícone', fr:'Symbole / Icône', de:'Symbol / Icon', ru:'Символ / Значок', qd:'Glyphyx / Iconyx' },
  'New Item': { th:'เพิ่มไอเทมใหม่', en:'New Item', ja:'新規アイテム', ko:'새 아이템', zh:'新建物品', vi:'Vật phẩm mới', id:'Item baru', es:'Nuevo objeto', pt:'Novo item', fr:'Nouvel objet', de:'Neuer Gegenstand', ru:'Новый предмет', qd:'Esshka Trinkyx' },
  'Edit Item': { th:'แก้ไขไอเทม', en:'Edit Item', ja:'アイテムを編集', ko:'아이템 수정', zh:'编辑物品', vi:'Sửa vật phẩm', id:'Edit item', es:'Editar objeto', pt:'Editar item', fr:'Modifier l’objet', de:'Gegenstand bearbeiten', ru:'Редактировать предмет', qd:'Zhakrii Trinkyx' },
  'Add Item': { th:'เพิ่มไอเทม', en:'Add Item', ja:'アイテムを追加', ko:'아이템 추가', zh:'添加物品', vi:'Thêm vật phẩm', id:'Tambah item', es:'Añadir objeto', pt:'Adicionar item', fr:'Ajouter un objet', de:'Gegenstand hinzufügen', ru:'Добавить предмет', qd:'Grothul Trinkyx' },
  'New Item Category': { th:'เพิ่มหมวดหมู่ไอเทมใหม่', en:'New Item Category', ja:'新規アイテムカテゴリー', ko:'새 아이템 카테고리', zh:'新建物品分类', vi:'Danh mục vật phẩm mới', id:'Kategori item baru', es:'Nueva categoría de objetos', pt:'Nova categoria de itens', fr:'Nouvelle catégorie d’objets', de:'Neue Gegenstandskategorie', ru:'Новая категория предметов', qd:'Esshka Trinkyx Klavoss' },
  'Edit Item Category': { th:'แก้ไขหมวดหมู่ไอเทม', en:'Edit Item Category', ja:'アイテムカテゴリーを編集', ko:'아이템 카테고리 수정', zh:'编辑物品分类', vi:'Sửa danh mục vật phẩm', id:'Edit kategori item', es:'Editar categoría de objetos', pt:'Editar categoria de itens', fr:'Modifier la catégorie d’objets', de:'Gegenstandskategorie bearbeiten', ru:'Редактировать категорию предметов', qd:'Zhakrii Trinkyx Klavoss' },
  'New Story': { th:'เพิ่มเนื้อเรื่องใหม่', en:'New Story', ja:'新規ストーリー', ko:'새 스토리', zh:'新建剧情', vi:'Cốt truyện mới', id:'Cerita baru', es:'Nueva historia', pt:'Nova história', fr:'Nouvelle histoire', de:'Neue Geschichte', ru:'Новая история', qd:'Esshka Sagaal' },
  'Edit Story': { th:'แก้ไขเนื้อเรื่อง', en:'Edit Story', ja:'ストーリーを編集', ko:'스토리 수정', zh:'编辑剧情', vi:'Sửa cốt truyện', id:'Edit cerita', es:'Editar historia', pt:'Editar história', fr:'Modifier l’histoire', de:'Geschichte bearbeiten', ru:'Редактировать историю', qd:'Zhakrii Sagaal' },
  'New Dialogue Node': { th:'เพิ่มโหนดบทสนทนาใหม่', en:'New Dialogue Node', ja:'新規ダイアログノード', ko:'새 다이얼로그 노드', zh:'新建对话节点', vi:'Nút hội thoại mới', id:'Node dialog baru', es:'Nuevo nodo de diálogo', pt:'Novo nó de diálogo', fr:'Nouveau nœud de dialogue', de:'Neuer Dialogknoten', ru:'Новый узел диалога', qd:'Esshka Whispyrn Nodyx' },
  'Edit Dialogue Node': { th:'แก้ไขโหนดบทสนทนา', en:'Edit Dialogue Node', ja:'ダイアログノードを編集', ko:'다이얼로그 노드 수정', zh:'编辑对话节点', vi:'Sửa nút hội thoại', id:'Edit node dialog', es:'Editar nodo de diálogo', pt:'Editar nó de diálogo', fr:'Modifier le nœud de dialogue', de:'Dialogknoten bearbeiten', ru:'Редактировать узел диалога', qd:'Zhakrii Whispyrn Nodyx' },
  'Dialogue Lines': { th:'บทพูดในบทสนทนา', en:'Dialogue Lines', ja:'ダイアログのセリフ', ko:'다이얼로그 대사', zh:'对话台词', vi:'Lời thoại', id:'Baris dialog', es:'Líneas de diálogo', pt:'Falas do diálogo', fr:'Répliques du dialogue', de:'Dialogzeilen', ru:'Реплики диалога', qd:'Whispyrn Versyx' },
  'Line text...': { th:'ข้อความบทพูด...', en:'Line text...', ja:'セリフのテキスト...', ko:'대사 텍스트...', zh:'台词文本...', vi:'Nội dung lời thoại...', id:'Teks baris...', es:'Texto de la línea...', pt:'Texto da fala...', fr:'Texte de la réplique...', de:'Zeilentext...', ru:'Текст реплики...', qd:'Versyx runyx...' },
  'Add Dialogue Edge': { th:'เพิ่มเส้นเชื่อมบทสนทนา', en:'Add Dialogue Edge', ja:'ダイアログエッジを追加', ko:'다이얼로그 엣지 추가', zh:'添加对话连线', vi:'Thêm cạnh hội thoại', id:'Tambah edge dialog', es:'Añadir conexión de diálogo', pt:'Adicionar conexão de diálogo', fr:'Ajouter une liaison de dialogue', de:'Dialogkante hinzufügen', ru:'Добавить связь диалога', qd:'Grothul Whispyrn bondra' },
  'From': { th:'จาก', en:'From', ja:'元', ko:'시작', zh:'从', vi:'Từ', id:'Dari', es:'Desde', pt:'De', fr:'De', de:'Von', ru:'Из', qd:'Fravorn' },
  'To': { th:'ไปยัง', en:'To', ja:'先', ko:'대상', zh:'到', vi:'Đến', id:'Ke', es:'Hasta', pt:'Para', fr:'Vers', de:'Zu', ru:'В', qd:'Tovorn' },
  'Condition': { th:'เงื่อนไข', en:'Condition', ja:'条件', ko:'조건', zh:'条件', vi:'Điều kiện', id:'Kondisi', es:'Condición', pt:'Condição', fr:'Condition', de:'Bedingung', ru:'Условие', qd:'Omenyx' },
  'Conditions (JSON)': { th:'เงื่อนไข (JSON)', en:'Conditions (JSON)', ja:'条件（JSON）', ko:'조건 (JSON)', zh:'条件（JSON）', vi:'Điều kiện (JSON)', id:'Kondisi (JSON)', es:'Condiciones (JSON)', pt:'Condições (JSON)', fr:'Conditions (JSON)', de:'Bedingungen (JSON)', ru:'Условия (JSON)', qd:'Omenyx (JSON)' },
  'Effects (JSON)': { th:'ผลลัพธ์ (JSON)', en:'Effects (JSON)', ja:'効果（JSON）', ko:'효과 (JSON)', zh:'效果（JSON）', vi:'Hiệu ứng (JSON)', id:'Efek (JSON)', es:'Efectos (JSON)', pt:'Efeitos (JSON)', fr:'Effets (JSON)', de:'Effekte (JSON)', ru:'Эффекты (JSON)', qd:'Emberyx (JSON)' },
  'e.g. choice==1': { th:'เช่น choice==1', en:'e.g. choice==1', ja:'例：choice==1', ko:'예: choice==1', zh:'例如 choice==1', vi:'VD: choice==1', id:'mis. choice==1', es:'p. ej. choice==1', pt:'ex.: choice==1', fr:'ex. choice==1', de:'z. B. choice==1', ru:'напр. choice==1', qd:'lyk choice==1' },
  'New Function': { th:'เพิ่มฟังก์ชันใหม่', en:'New Function', ja:'新規機能', ko:'새 기능', zh:'新建功能', vi:'Chức năng mới', id:'Fungsi baru', es:'Nueva función', pt:'Nova função', fr:'Nouvelle fonction', de:'Neue Funktion', ru:'Новая функция', qd:'Esshka Runemyx' },
  'Edit Function': { th:'แก้ไขฟังก์ชัน', en:'Edit Function', ja:'機能を編集', ko:'기능 수정', zh:'编辑功能', vi:'Sửa chức năng', id:'Edit fungsi', es:'Editar función', pt:'Editar função', fr:'Modifier la fonction', de:'Funktion bearbeiten', ru:'Редактировать функцию', qd:'Zhakrii Runemyx' },
  'New Function Category': { th:'เพิ่มหมวดหมู่ฟังก์ชันใหม่', en:'New Function Category', ja:'新規機能カテゴリー', ko:'새 기능 카테고리', zh:'新建功能分类', vi:'Danh mục chức năng mới', id:'Kategori fungsi baru', es:'Nueva categoría de funciones', pt:'Nova categoria de funções', fr:'Nouvelle catégorie de fonctions', de:'Neue Funktionskategorie', ru:'Новая категория функций', qd:'Esshka Runemyx Klavoss' },
  'Edit Function Category': { th:'แก้ไขหมวดหมู่ฟังก์ชัน', en:'Edit Function Category', ja:'機能カテゴリーを編集', ko:'기능 카테고리 수정', zh:'编辑功能分类', vi:'Sửa danh mục chức năng', id:'Edit kategori fungsi', es:'Editar categoría de funciones', pt:'Editar categoria de funções', fr:'Modifier la catégorie de fonctions', de:'Funktionskategorie bearbeiten', ru:'Редактировать категорию функций', qd:'Zhakrii Runemyx Klavoss' },
  'Function signature / pseudo-code': { th:'ลายเซ็นฟังก์ชัน / รหัสเทียม', en:'Function signature / pseudo-code', ja:'関数シグネチャ / 擬似コード', ko:'함수 시그니처 / 의사코드', zh:'函数签名 / 伪代码', vi:'Chữ ký hàm / mã giả', id:'Tanda tangan fungsi / pseudo-code', es:'Firma de la función / pseudocódigo', pt:'Assinatura da função / pseudocódigo', fr:'Signature de fonction / pseudo-code', de:'Funktionssignatur / Pseudocode', ru:'Сигнатура функции / псевдокод', qd:'Runemyx sygnyx / runescript' },
  'general, trigger, action...': { th:'เช่น general, trigger, action...', en:'general, trigger, action...', ja:'general、trigger、action...', ko:'general, trigger, action...', zh:'general、trigger、action...', vi:'general, trigger, action...', id:'general, trigger, action...', es:'general, trigger, action...', pt:'general, trigger, action...', fr:'general, trigger, action...', de:'general, trigger, action...', ru:'general, trigger, action...', qd:'general, trigger, action...' },
  'Link to Novel Object': { th:'เชื่อมกับรายการในนิยาย', en:'Link to Novel Object', ja:'小説オブジェクトにリンク', ko:'소설 오브젝트에 연결', zh:'链接到小说对象', vi:'Liên kết với đối tượng tiểu thuyết', id:'Tautkan ke objek novel', es:'Vincular a objeto de la novela', pt:'Vincular a objeto do romance', fr:'Lier à un objet du roman', de:'Mit Romanobjekt verknüpfen', ru:'Связать с объектом романа', qd:'Bondra to Vorqu Artifyx' },
  'Bold': { th:'ตัวหนา', en:'Bold', ja:'太字', ko:'굵게', zh:'加粗', vi:'Đậm', id:'Tebal', es:'Negrita', pt:'Negrito', fr:'Gras', de:'Fett', ru:'Жирный', qd:'Thickscript' },
  'Italic': { th:'ตัวเอียง', en:'Italic', ja:'斜体', ko:'기울임', zh:'斜体', vi:'Nghiêng', id:'Miring', es:'Cursiva', pt:'Itálico', fr:'Italique', de:'Kursiv', ru:'Курсив', qd:'Leanscript' },
  'Insert mention': { th:'แทรกการอ้างอิง', en:'Insert mention', ja:'メンションを挿入', ko:'멘션 삽입', zh:'插入提及', vi:'Chèn nhắc đến', id:'Sisipkan sebutan', es:'Insertar mención', pt:'Inserir menção', fr:'Insérer une mention', de:'Erwähnung einfügen', ru:'Вставить упоминание', qd:'Weavith a namecall' },
  'Library-level tags not implemented yet.': { th:'แท็กระดับไลบรารียังไม่พร้อมใช้งาน', en:'Library-level tags not implemented yet.', ja:'ライブラリレベルのタグは未実装です', ko:'라이브러리 수준 태그는 아직 지원되지 않습니다', zh:'图书馆级标签尚未实现', vi:'Thẻ cấp thư viện chưa được hỗ trợ.', id:'Tag tingkat perpustakaan belum tersedia.', es:'Las etiquetas a nivel de biblioteca aún no están disponibles.', pt:'Tags no nível da biblioteca ainda não foram implementadas.', fr:'Les tags au niveau de la bibliothèque ne sont pas encore disponibles.', de:'Tags auf Bibliotheksebene sind noch nicht verfügbar.', ru:'Теги уровня библиотеки пока не реализованы.', qd:'Archivyx Markiss nay wrought yeth.' },
  'Select columns': { th:'เลือกคอลัมน์', en:'Select columns', ja:'列を選択', ko:'열 선택', zh:'选择列', vi:'Chọn cột', id:'Pilih kolom', es:'Seleccionar columnas', pt:'Selecionar colunas', fr:'Sélectionner les colonnes', de:'Spalten wählen', ru:'Выбрать столбцы', qd:'Choozz columnyx' },
  'No linked data yet': { th:'ยังไม่มีข้อมูลที่เชื่อมต่อ', en:'No linked data yet', ja:'リンクされたデータがありません', ko:'연결된 데이터가 없습니다', zh:'还没有关联数据', vi:'Chưa có dữ liệu liên kết', id:'Belum ada data tertaut', es:'Aún no hay datos vinculados', pt:'Ainda não há dados vinculados', fr:'Aucune donnée liée pour le moment', de:'Noch keine verknüpften Daten', ru:'Пока нет связанных данных', qd:'Nao bondrath hoard yeth' },
  'No links yet': { th:'ยังไม่มีการเชื่อมต่อ', en:'No links yet', ja:'リンクがありません', ko:'연결이 없습니다', zh:'还没有链接', vi:'Chưa có liên kết', id:'Belum ada tautan', es:'Aún no hay enlaces', pt:'Ainda não há vínculos', fr:'Aucun lien pour le moment', de:'Noch keine Verknüpfungen', ru:'Пока нет связей', qd:'Nao bondra yeth' },
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
  entityTabs:[],
  activeEntityTabKey:null,
  npOpenFolders:new Set(),
  projectHashtagId:null,
  settings:loadUiSettings(),
  relListHeight:null,
  leftPanelCollapsed:localStorage.getItem(LEFT_PANEL_COLLAPSED_KEY) === '1',
  // Navigator module state
  world:null, worldTab:'original', worldChar:null, worldCat:null, worldMap:null, worldMapTl:null, worldHashtagId:null,
  worldOrigCat:null, worldOrigObject:null, worldOrigCatView:'list', worldNovelOpen:new Set(),
  worldCharCatFilter:{}, worldCatOpen:new Set(), worldMapTool:null,
  // Hero module state
  game:null, gameTab:'project',
  // Writer module state
  library:null, libraryTab:'overview', librarySeries:null, librarySeriesTab:'docs', libraryDoc:null,
  // Sage module state
  sageTab:'dataSize',
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
  removeLegacyDirectorProjectButton();
  buildModuleSubNav();
  renderSettingsMenu();
  translateStaticChrome();
  renderProjectTabs();
  renderNexusHome();
  bindNav();
  document.addEventListener('click', () => {
    document.querySelectorAll('.np-dropdown').forEach(d => d.style.display = 'none');
  });
  bindSearch();
}

// ═══ HELPERS ═══════════════════════════════════════════
function removeLegacyDirectorProjectButton(){
  q('#nav-sidebar > .nav-btn.director-only[data-panel="projects"]')?.remove();
}

const q = (s) => document.querySelector(s);
const x = (s) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// `esc` is an alias for `x` used by the Writer/Sage modules.
const esc = x;
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
  const el=q('#toast'); el.textContent=tr(msg); el.className=`show ${type}`;
  clearTimeout(_tt); _tt=setTimeout(()=>el.classList.remove('show'),2600);
}

function openModal(title,body) {
  q('#modal-title').textContent=tr(title);
  q('#modal-body').innerHTML=body;
  const overlay = q('#modal-overlay');
  overlay.classList.remove('hidden');
  // make modal focusable and move focus to it so inputs inside become interactive
  const modalEl = q('#modal');
  if(modalEl){ modalEl.tabIndex = -1; setTimeout(()=>{ try{ modalEl.focus(); }catch(e){} }, 30); }
}
function closeModal() { q('#modal-overlay').classList.add('hidden'); }

// Custom in-app confirm dialog. Replaces native window.confirm(), which on
// Electron leaves the renderer unable to receive mouse input until the window
// is re-focused (or DevTools is opened) — the long-standing "UI frozen after
// delete" bug. Returns a Promise<boolean>; call sites use `await uiConfirm(...)`.
function uiConfirm(message, opts = {}) {
  const { okText = 'OK', cancelText = 'Cancel', danger = true } = opts;
  return new Promise(resolve => {
    document.getElementById('confirm-overlay')?.remove();
    const ov = document.createElement('div');
    ov.id = 'confirm-overlay';
    const box = document.createElement('div');
    box.id = 'confirm-box';
    const msg = document.createElement('div');
    msg.className = 'confirm-msg';
    msg.textContent = tr(message);
    const actions = document.createElement('div');
    actions.className = 'confirm-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-s';
    cancelBtn.textContent = tr(cancelText);
    const okBtn = document.createElement('button');
    okBtn.className = 'btn ' + (danger ? 'btn-d' : 'btn-p');
    okBtn.textContent = tr(okText);
    actions.append(cancelBtn, okBtn);
    box.append(msg, actions);
    ov.append(box);
    document.body.append(ov);
    const finish = (val) => {
      document.removeEventListener('keydown', onKey, true);
      ov.remove();
      resolve(val);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); finish(false); }
      else if (e.key === 'Enter') { e.preventDefault(); finish(true); }
    };
    okBtn.addEventListener('click', () => finish(true));
    cancelBtn.addEventListener('click', () => finish(false));
    ov.addEventListener('mousedown', (e) => { if (e.target === ov) finish(false); });
    document.addEventListener('keydown', onKey, true);
    setTimeout(() => { try { okBtn.focus(); } catch (e) {} }, 20);
  });
}

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

// Translate a source UI string (Thai or English) through COMMON_UI_TEXT.
// Used for strings rendered outside the DOM observer's reach (toasts,
// confirm dialogs, modal titles) so they translate immediately.
function tr(text){
  const lang = S.settings?.language || 'th';
  const entry = COMMON_UI_TEXT[String(text)];
  if(!entry) return text;
  return entry[lang] || (lang === 'th' ? text : (entry.en || text));
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
  const themeOptions = UI_THEME_OPTIONS.map(theme =>
    `<option value="${theme}" ${S.settings.theme===theme?'selected':''}>${t(theme)}</option>`
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
      <select class="settings-select" onchange="setUiSetting('theme', this.value)">
        ${themeOptions}
      </select>
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
  const worldTabTitleKeys = { 'original':'navigator', 'chars-cats':'worldCharsCats', 'maps-timeline':'worldMapTimelines', 'tags':'worldTags' };
  document.querySelectorAll('.nav-btn[data-panel]').forEach(btn => {
    if(btn.dataset.worldtab){
      btn.setAttribute('title', t(worldTabTitleKeys[btn.dataset.worldtab] || 'navigator'));
      return;
    }
    const key = btn.dataset.panel === 'project-hashtag' ? 'hashtag' : btn.dataset.panel;
    if(L.en[key]) btn.setAttribute('title', t(key));
  });
  q('#director-project-shortcut')?.setAttribute('title', t('projects'));
  q('#btn-import-db')?.setAttribute('title', t('importDb'));
  q('#btn-export-db')?.setAttribute('title', t('exportDb'));
  applyLeftPanelState();
  updateTopNavButton();
  translateCommonUiText();
}

function translateCommonUiText(root=document){
  const lang = S.settings?.language || 'th';
  // Note: no early return for 'th' — several modules render English source
  // strings that must be translated into Thai as well.
  const pick = (text) => {
    const entry = COMMON_UI_TEXT[text];
    if(!entry) return null;
    return entry[lang] || (lang === 'th' ? null : entry.en) || null;
  };
  const selectors = [
    'button',
    'label',
    'option',
    'th',
    'h1','h2','h3','h4',
    'p',
    'span',
    'div',
    '.settings-label',
    '.settings-head span',
    '#modal-title',
    '.confirm-msg'
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

// Submodule symbols shown on the nav rail when a module's project/entity is active,
// mirroring Director's project-only icons (Timeline / Relation / Map / Tags).
// Navigator's 3 world tabs are plain static `.navigator-only` buttons in index.html
// (each carries a `data-worldtab`) rather than a MODULE_SUBNAV-driven row, since there
// are only 3 of them and the first one doubles as the module's main nav-rail button.
const MODULE_SUBNAV = {
  hero: { setter:'setGameTab', items:[
    ['novel','relation','gameNovelLink'], ['story','story','gameStory'],
    ['tags','hashtag','gameTags'] ] },
  writer: { setter:'setLibraryTab', items:[
    ['overview','list','libraryOverview'], ['series','series','librarySeries'],
    ['tags','hashtag','libraryTags'] ] },
  sage: { setter:'setSageTab', items:[
    ['dataSize','layer','sageDataSize'], ['objectAmount','table','sageObjectAmount'],
    ['linkerList','list','sageLinkerList'], ['linkerGraph','relation','sageLinkerGraph'] ] },
};

function buildModuleSubNav(){
  const rail = q('#nav-sidebar');
  if(!rail) return;
  const spacer = rail.querySelector('div[style*="flex:1"]');
  let html = '';
  for(const [mod, cfg] of Object.entries(MODULE_SUBNAV)){
    for(const [tab, icon, key] of cfg.items){
      html += `<button class="nav-btn ${mod}-sub" data-subtab="${tab}" data-i18n="${key}" style="display:none" onclick="${cfg.setter}('${tab}')">${I[icon]}</button>`;
    }
  }
  if(spacer) spacer.insertAdjacentHTML('beforebegin', html);
  else rail.insertAdjacentHTML('beforeend', html);
}

function updateModuleSubNav(){
  const show = {
    hero:      S.activeModule === 'hero'      && !!S.game,
    writer:    S.activeModule === 'writer'    && !!S.library,
    sage:      S.activeModule === 'sage',
  };
  const cur = { hero:S.gameTab, writer:S.libraryTab, sage:S.sageTab };
  for(const mod of Object.keys(MODULE_SUBNAV)){
    document.querySelectorAll(`.nav-btn.${mod}-sub`).forEach(btn => {
      btn.style.display = show[mod] ? '' : 'none';
      btn.classList.toggle('active', !!show[mod] && btn.dataset.subtab === cur[mod]);
      if(btn.dataset.i18n) btn.setAttribute('title', t(btn.dataset.i18n));
    });
  }
}


function updateTopNavButton(){
  const logoBtn = q('#nav-logo-btn');
  const inModule = !!S.activeModule;
  if(logoBtn){
    logoBtn.innerHTML = inModule
      ? I.return
      : `<img src="Image/DraconDex-SymbolWhite.png" class="brand-img" alt="DraconDex">`;
    const title = !inModule ? 'DraconDex' : S.project ? tr('Back to project list') : S.world ? tr('Back to world list') : tr('Back to Nexus');
    logoBtn.setAttribute('title', title);
    logoBtn.classList.toggle('is-return', inModule);
  }
  document.querySelectorAll('.nav-btn.nexus-only').forEach(btn => {
    btn.style.display = (!S.activeModule) ? '' : 'none';
  });
  document.querySelectorAll('.nav-btn.director-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'director') ? 'flex' : 'none';
  });
  q('#director-project-shortcut')?.classList.toggle('active', S.activeModule === 'director' && S.view === 'projects');
  document.querySelectorAll('.nav-btn.project-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'director' && !!S.project) ? '' : 'none';
  });
  document.querySelectorAll('.nav-btn.navigator-only').forEach(btn => {
    const isMain = btn.dataset.worldtab === 'original';
    btn.style.display = (S.activeModule === 'navigator' && (isMain || !!S.world)) ? '' : 'none';
    btn.classList.toggle('active', S.activeModule === 'navigator' && !!S.world && btn.dataset.worldtab === S.worldTab);
  });
  document.querySelectorAll('.nav-btn.hero-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'hero') ? '' : 'none';
    // With a game active the Hero rail button doubles as the "project"
    // submodule (characters + collections), mirroring Navigator's first tab.
    btn.classList.toggle('active', S.activeModule === 'hero' && !!S.game && S.gameTab === 'project');
  });
  document.querySelectorAll('.nav-btn.writer-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'writer') ? '' : 'none';
  });
  document.querySelectorAll('.nav-btn.sage-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'sage') ? '' : 'none';
  });
  updateModuleSubNav();
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
  S.view = 'projects';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
  q('.nav-btn[data-panel="projects"]')?.classList.add('active');
  updateTopNavButton();
  if(S.project) await renderProject();
  else { renderSidebar(); renderWelcome(); }
}

async function openDirectorProjectShortcut(){
  if(S.activeModule !== 'director') S.activeModule = 'director';
  await goToActiveProject();
}

// Navigator equivalent of returnToProjectList: deselect the active world and
// show the world ("navi project") list in the left panel.
async function goToNavigatorList(){
  S.world = null;
  S.view = 'navigator';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
  q('.nav-btn[data-panel="navigator"]')?.classList.add('active');
  updateTopNavButton();
  await loadModule('src/renderer/navigator.js');
  renderNavigatorView();
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
  let html = '';
  if (S.activeModule === 'director') {
    html = S.projectTabs.map(tab => `
      <button class="project-tab ${S.activeProjectTabId===tab.id?'active':''}" onclick="switchProjectTab(${tab.id})" title="${x(tab.name)}">
        <span class="tab-dot" style="background:${tab.color}"></span>
        <span class="tab-name">${x(tab.name)}</span>
        <span class="tab-close" onclick="event.stopPropagation();closeProjectTab(${tab.id})" title="${t('closeTab')}">&times;</span>
      </button>
    `).join('');
  } else {
    const typeMap = { navigator:'world', hero:'game', writer:'library' };
    const type = typeMap[S.activeModule];
    const tabs = type ? S.entityTabs.filter(t => t.type === type) : [];
    html = tabs.map(tab => `
      <button class="project-tab ${S.activeEntityTabKey===tab.key?'active':''}" onclick="switchEntityTab('${tab.key}')" title="${x(tab.name)}">
        <span class="tab-dot" style="background:${tab.color}"></span>
        <span class="tab-name">${x(tab.name)}</span>
        <span class="tab-close" onclick="event.stopPropagation();closeEntityTab('${tab.key}')" title="${t('closeTab')}">&times;</span>
      </button>
    `).join('');
  }
  el.innerHTML = html;
  document.title = S.project ? `${S.project.name} - DraconDex` : 'DraconDex';
}

function upsertEntityTab(entity, type, module) {
  const key = `${type}-${entity.id}`;
  const moduleColors = { world:'#22c55e', game:'#f59e0b', library:'#8b5cf6' };
  const tab = { key, id:entity.id, type, module, name:entity.name, color: entity.color_code || moduleColors[type] || '#6366f1' };
  const idx = S.entityTabs.findIndex(t => t.key === key);
  if (idx >= 0) S.entityTabs[idx] = tab;
  else S.entityTabs.push(tab);
  S.activeEntityTabKey = key;
  renderProjectTabs();
}

async function switchEntityTab(key) {
  const tab = S.entityTabs.find(t => t.key === key);
  if (!tab) return;
  S.activeEntityTabKey = key;
  if (tab.type === 'world') {
    S.world = await api.world.get(tab.id);
    S.worldTab = S.worldTab || 'original';
    S.worldChar = null; S.worldCat = null; S.worldMap = null; S.worldMapTl = null;
    const ocats = await api.world.origCat.getAll(tab.id);
    S.worldOrigCat = ocats[0] || null; S.worldOrigObject = null;
    await renderNavigatorView();
  } else if (tab.type === 'game') {
    S.game = await api.game.get(tab.id);
    S.gameTab = S.gameTab || 'project';
    await renderHeroView();
  } else if (tab.type === 'library') {
    S.library = tab.id;
    S.libraryTab = 'overview'; S.librarySeries = null; S.libraryDoc = null;
    await renderWriterView();
  } else {
    renderProjectTabs();
  }
}

async function closeEntityTab(key) {
  const idx = S.entityTabs.findIndex(t => t.key === key);
  if (idx < 0) return;
  const closing = S.entityTabs[idx];
  const wasActive = S.activeEntityTabKey === key;
  S.entityTabs.splice(idx, 1);
  if (!wasActive) { renderProjectTabs(); return; }
  const sameMod = S.entityTabs.filter(t => t.module === closing.module);
  if (sameMod.length > 0) {
    await switchEntityTab(sameMod[Math.min(idx, sameMod.length - 1)].key);
    return;
  }
  S.activeEntityTabKey = null;
  if (closing.type === 'world') { S.world = null; if (S.activeModule==='navigator') await renderNavigatorView(); }
  else if (closing.type === 'game') { S.game = null; if (S.activeModule==='hero') await renderHeroView(); }
  else if (closing.type === 'library') { S.library = null; if (S.activeModule==='writer') await renderWriterView(); }
  renderProjectTabs();
}

// ═══ NOVEL PICKER ════════════════════════════════════════
function buildNovelPickerHtml(pickId, currentName, excludeIds) {
  const label = currentName || '— select novel —';
  const exStr = excludeIds ? [...excludeIds].join(',') : '';
  return `<div class="novel-picker" id="np-wrap-${pickId}" data-selected-id="" data-exclude-ids="${exStr}">
    <button class="np-btn" onclick="event.stopPropagation();toggleNovelPicker('${pickId}')" type="button">
      <span id="np-label-${pickId}" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(label)}</span>
      <svg style="width:10px;height:10px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="np-dropdown" id="np-drop-${pickId}" style="display:none">
      ${buildNpTree(pickId, excludeIds)}
    </div>
  </div>`;
}

function buildNpTree(pickId, excludeIds) {
  const ex = excludeIds || new Set();
  let html = '';
  for (const f of (S.folders || [])) {
    const open = S.npOpenFolders.has(f.id);
    const fps = (S.projects || []).filter(p => p.folder_id === f.id && !ex.has(p.id));
    const col = f.color_code || '#6366f1';
    html += `<div class="np-folder">
      <div class="np-folder-head" onclick="event.stopPropagation();toggleNpFolder('${pickId}',${f.id})">
        <svg style="width:8px;height:8px;flex-shrink:0;transform:rotate(${open?90:0}deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style="color:${col};line-height:1;display:flex;align-items:center">${I.folder}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(f.name)}</span>
        <span style="color:var(--t3);font-size:11px">${fps.length}</span>
      </div>
      ${open ? fps.map(p => `<div class="np-item" onclick="event.stopPropagation();selectNovelFromPicker('${pickId}',${p.id},'${x(p.name)}')">${x(p.name)}</div>`).join('') : ''}
    </div>`;
  }
  const unfiled = (S.projects || []).filter(p => !p.folder_id && !ex.has(p.id));
  if (unfiled.length) {
    if ((S.folders||[]).length) html += `<div style="border-top:1px solid var(--border);margin:4px 0"></div>`;
    html += unfiled.map(p => `<div class="np-item np-unfiled" onclick="event.stopPropagation();selectNovelFromPicker('${pickId}',${p.id},'${x(p.name)}')">${x(p.name)}</div>`).join('');
  }
  if (!html) html = `<div style="padding:10px 12px;color:var(--t3);font-size:13px">No novels available</div>`;
  return html;
}

function buildLinkedNovelPicker(pickId, linkedProjects, currentName, onSelectCb) {
  const label = currentName || '— select novel —';
  const ids = new Set((linkedProjects || []).map(p => p.id));
  let html = '';
  for (const f of (S.folders || [])) {
    const fps = (linkedProjects || []).filter(p => p.folder_id === f.id);
    if (!fps.length) continue;
    const open = S.npOpenFolders.has(f.id);
    const col = f.color_code || '#6366f1';
    html += `<div class="np-folder">
      <div class="np-folder-head" onclick="event.stopPropagation();toggleNpFolder('${pickId}',${f.id})">
        <svg style="width:8px;height:8px;flex-shrink:0;transform:rotate(${open?90:0}deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style="color:${col};line-height:1;display:flex;align-items:center">${I.folder}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(f.name)}</span>
        <span style="color:var(--t3);font-size:11px">${fps.length}</span>
      </div>
      ${open ? fps.map(p => `<div class="np-item" onclick="event.stopPropagation();selectNovelFromPicker('${pickId}',${p.id},'${x(p.name)}')">${x(p.name)}</div>`).join('') : ''}
    </div>`;
  }
  const unfiled = (linkedProjects || []).filter(p => !p.folder_id);
  if (unfiled.length) {
    if ((S.folders||[]).length && html) html += `<div style="border-top:1px solid var(--border);margin:4px 0"></div>`;
    html += unfiled.map(p => `<div class="np-item np-unfiled" onclick="event.stopPropagation();selectNovelFromPicker('${pickId}',${p.id},'${x(p.name)}')">${x(p.name)}</div>`).join('');
  }
  if (!html) html = `<div style="padding:10px 12px;color:var(--t3);font-size:13px">No linked novels</div>`;
  const cbAttr = onSelectCb ? ` data-on-select="${x(onSelectCb)}"` : '';
  return `<div class="novel-picker" id="np-wrap-${pickId}" data-selected-id=""${cbAttr}>
    <button class="np-btn" onclick="event.stopPropagation();toggleNovelPicker('${pickId}')" type="button">
      <span id="np-label-${pickId}" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(label)}</span>
      <svg style="width:10px;height:10px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="np-dropdown" id="np-drop-${pickId}" style="display:none">${html}</div>
  </div>`;
}

function toggleNovelPicker(pickId) {
  const drop = q(`#np-drop-${pickId}`);
  if (!drop) return;
  const isOpen = drop.style.display !== 'none';
  document.querySelectorAll('.np-dropdown').forEach(d => d.style.display = 'none');
  if (!isOpen) drop.style.display = '';
}

function toggleNpFolder(pickId, folderId) {
  if (S.npOpenFolders.has(folderId)) S.npOpenFolders.delete(folderId);
  else S.npOpenFolders.add(folderId);
  const drop = q(`#np-drop-${pickId}`);
  if (!drop) return;
  const wrap = q(`#np-wrap-${pickId}`);
  const exStr = wrap?.dataset.excludeIds || '';
  const ex = new Set(exStr.split(',').filter(Boolean).map(Number));
  drop.innerHTML = buildNpTree(pickId, ex);
}

function selectNovelFromPicker(pickId, projId, name) {
  const lbl = q(`#np-label-${pickId}`);
  if (lbl) lbl.textContent = name;
  const drop = q(`#np-drop-${pickId}`);
  if (drop) drop.style.display = 'none';
  const wrap = q(`#np-wrap-${pickId}`);
  if (wrap) {
    wrap.dataset.selectedId = projId;
    const cb = wrap.dataset.onSelect;
    if (cb && typeof window[cb] === 'function') window[cb](projId);
  }
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

// #cpicker-grid always lists every color sorted by hex code, independent of use/recency order.
const sortColorsByHex = (colors) => [...(colors||[])].sort((a,b) => a.color_code.localeCompare(b.color_code));

async function colorPicker(selId=null) {
  S.recentColors = await api.color.getRecent();
  const recent = buildColorSwatches(S.recentColors, selId);
  const all    = buildColorSwatches(sortColorsByHex(S.colors), selId);
  const selColor = (S.colors || []).find(c => c.id === selId) || (S.recentColors || []).find(c => c.id === selId);
  const nativeVal = selColor?.color_code || '#6366f1';
  return `<div class="cpicker-wrap">
    <div class="cpicker-custom">
      <input type="color" id="cpicker-native" value="${nativeVal}" oninput="onColorPickerPreview(this.value)" title="เลือกสี">
      <span class="cpicker-hex-lbl" id="cpicker-hex-lbl">${nativeVal}</span>
      <button class="btn btn-s" type="button" onclick="addColorFromPicker()">เพิ่มสีใหม่</button>
    </div>
    <div class="cpicker-row-lbl">ใช้ล่าสุด</div>
    <div class="crecent-row" id="cpicker-recent">${recent || '<span class="cpicker-empty">ยังไม่มีประวัติการใช้สี</span>'}</div>
    <div class="cpicker-row-lbl">สีทั้งหมด</div>
    <div class="cgrid" id="cpicker-grid">${all}</div>
    <input type="hidden" id="sel-color" value="${selId||''}">
  </div>`;
}

// ═══ SYMBOL PICKER ═════════════════════════════════════
function buildSymbolSwatches(symbols, selId, hiddenInputId, previewId, customInputId){
  return symbols.map(s =>
    `<button type="button" class="symswatch ${selId===s.id?'sel':''}" title="${x(s.label||'')}" onclick="pickSymbol('${hiddenInputId}','${previewId||''}','${customInputId||''}',this,${s.id},'${x(s.glyph).replace(/'/g,"\\'")}')">${x(s.glyph)}</button>`
  ).join('');
}

async function symbolPicker(hiddenInputId, selId=null, previewId=null, customInputId=null) {
  const symbols = await api.world.getSymbolCollection();
  return `<div class="cpicker-wrap">
    <div class="cgrid">${buildSymbolSwatches(symbols, selId, hiddenInputId, previewId, customInputId) || '<span class="cpicker-empty">No symbols available</span>'}</div>
    <input type="hidden" id="${hiddenInputId}" value="${selId||''}">
  </div>`;
}

function pickSymbol(hiddenInputId, previewId, customInputId, el, id, glyph){
  const input = q(`#${hiddenInputId}`);
  if (input) input.value = id;
  el.parentElement.querySelectorAll('.symswatch').forEach(n => n.classList.remove('sel'));
  el.classList.add('sel');
  if (previewId) { const p = q(`#${previewId}`); if (p) p.textContent = glyph || '+'; }
  if (customInputId) { const c = q(`#${customInputId}`); if (c) c.value = glyph || ''; }
}

// Typing a custom glyph deselects any picked collection symbol — the two are mutually exclusive.
function onSymbolCustomInput(hiddenInputId, previewId, value){
  const preview = q(`#${previewId}`);
  if (preview) preview.textContent = value || '+';
  const input = q(`#${hiddenInputId}`);
  if (input) {
    input.value = '';
    input.closest('.cpicker-wrap')?.querySelectorAll('.symswatch').forEach(n => n.classList.remove('sel'));
  }
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
  const code = (S.colors||[]).find(c=>c.id===id)?.color_code || (S.recentColors||[]).find(c=>c.id===id)?.color_code;
  if (code) {
    const native = q('#cpicker-native'); if (native) native.value = code;
    const lbl = q('#cpicker-hex-lbl'); if (lbl) lbl.textContent = code;
  }
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
  if (grid) grid.innerHTML = buildColorSwatches(sortColorsByHex(S.colors), nc?.id);
  const rec = q('#cpicker-recent');
  if (rec) rec.innerHTML = buildColorSwatches(S.recentColors, nc?.id) || '<span class="cpicker-empty">ยังไม่มีประวัติการใช้สี</span>';
  if (nc) q('#sel-color').value = nc.id;
  toast('เพิ่มสีใหม่เรียบร้อย','ok');
}

// ═══ NAV & VIEW ════════════════════════════════════════
function bindNav() {
  q('#nav-logo-btn')?.addEventListener('click', () => {
    if(S.project) returnToProjectList();
    else if(S.world) goToNavigatorList();
    else if(S.game && S.activeModule === 'hero' && typeof goToGameList === 'function') goToGameList();
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
    toast(`${tr('Export ไม่สำเร็จ')}: ${e.message}`,'err');
  }
}

async function importDatabaseFile(){
  if(!await uiConfirm('Import DB แล้วรวมข้อมูลที่ยังไม่ซ้ำกับฐานข้อมูลปัจจุบัน ใช่หรือไม่?')) return;
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
    toast(`${tr('Import ไม่สำเร็จ')}: ${e.message}`,'err');
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
  else if (v==='writer')          { await loadModule('src/renderer/writer.js'); renderWriterView(); }
  else if (v==='sage')            { await loadModule('src/renderer/sage.js'); renderSageView(); }
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
    </div>
    <div class="module-item" onclick="selectModule('writer')">
      <span class="module-icon">${I.writer}</span>
      <span class="module-name">${t('writer')}</span>
      <svg class="icon module-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
    <div class="module-item" onclick="selectModule('sage')">
      <span class="module-icon">${I.sage}</span>
      <span class="module-name">${t('sage')}</span>
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
    S.game = null; S.gameTab = 'project';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="hero"]')?.classList.add('active');
    updateTopNavButton();
    loadModule('src/renderer/hero.js').then(() => renderHeroView());
  } else if (name === 'writer') {
    S.view = 'writer';
    S.library = null; S.libraryTab = 'overview'; S.librarySeries = null; S.librarySeriesTab = 'docs'; S.libraryDoc = null;
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="writer"]')?.classList.add('active');
    updateTopNavButton();
    loadModule('src/renderer/writer.js').then(() => renderWriterView());
  } else if (name === 'sage') {
    S.view = 'sage';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="sage"]')?.classList.add('active');
    updateTopNavButton();
    loadModule('src/renderer/sage.js').then(() => renderSageView());
  }
}

function returnToNexus() {
  S.activeModule = null;
  S.project = null; S.category = null; S.object = null;
  S.timeline = null; S.map = null; S.mapAreaId = null;
  S.activeProjectTabId = null; S.projectHashtagId = null;
  S.world = null; S.worldChar = null; S.worldCat = null; S.worldMap = null; S.worldMapTl = null;
  S.game = null; S.gameTab = 'project';
  S.library = null; S.libraryTab = 'overview'; S.librarySeries = null; S.librarySeriesTab = 'docs'; S.libraryDoc = null;
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

