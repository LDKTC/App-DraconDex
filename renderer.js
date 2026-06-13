'use strict';

const I = {
  book: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  projects: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  timeline: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  relation: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  map: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>`,
  hashtag: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
  import: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  export: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  colors: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.52 22 22 17.52 22 12S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm0-18a8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8z"/><circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"/><circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="14.5" r="1.5" fill="currentColor"/></svg>`,
  edit: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  delete: `<svg class="icon icon-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  folder: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  plus: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  close: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  search: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  star: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  pin: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.5A2 2 0 0 1 15 9.26V5a3 3 0 0 0-6 0v4.26a2 2 0 0 1-.78 1.24l-2.78 3.5a2 2 0 0 0-.44 1.24z"/></svg>`,
  fields: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
  settings: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  list: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  table: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="10" y1="9" x2="10" y2="21"/></svg>`
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
    colorPanel:'Colors', saved:'Saved', deleted:'Deleted', created:'Created', applied:'Applied'
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
    colorPanel:'色', saved:'保存しました', deleted:'削除しました', created:'作成しました', applied:'適用しました'
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
    colorPanel:'색상', saved:'저장됨', deleted:'삭제됨', created:'생성됨', applied:'적용됨'
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
    colorPanel:'สี', saved:'บันทึกแล้ว', deleted:'ลบแล้ว', created:'สร้างแล้ว', applied:'ปรับใช้แล้ว'
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
    colorPanel:'颜色', saved:'已保存', deleted:'已删除', created:'已创建', applied:'已应用'
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
  'สร้างแล้ว': { en:'Created', ja:'作成しました', ko:'생성됨', zh:'已创建' }
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
  project:null, category:null, object:null,
  timeline:null, relTab:0, map:null, mapAreaId:null, mapTool:'move',
  descOpen:false, openFolders:new Set(),
  view:'projects',
  catView:'list',
  projectTabs:[],
  activeProjectTabId:null,
  settings:loadUiSettings(),
  relListHeight:null,
  leftPanelCollapsed:localStorage.getItem(LEFT_PANEL_COLLAPSED_KEY) === '1',
};
const timelineGraphState = {};
let timelineGraphCleanup = null;
let konvaStage = null;

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
  renderSidebar();
  renderWelcome();
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
  document.documentElement.style.setProperty('--ui-scale', String(S.settings.size / 100));
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
    S.project = null; S.category = null; S.object = null; S.timeline = null; S.map = null; S.mapAreaId = null;
    S.activeProjectTabId = null;
    S.view = 'projects';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
    q('.nav-btn[data-panel="projects"]')?.classList.add('active');
    renderProjectTabs();
    renderSidebar();
    renderWelcome();
  });
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
  document.title = S.project ? `${S.project.name} - Novel Manager` : 'Novel Manager';
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
  S.project = null; S.category = null; S.object = null; S.timeline = null; S.map = null; S.mapAreaId = null;
  S.view = 'projects';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
  q('.nav-btn[data-panel="projects"]')?.classList.add('active');
  renderProjectTabs();
  renderSidebar();
  renderWelcome();
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
  document.querySelectorAll('.nav-btn[data-panel]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      S.view = btn.dataset.panel;
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

function switchView(v) {
  if (konvaStage) {
    try { konvaStage.destroy(); } catch(e){}
    konvaStage = null;
  }
  q('#main-inner')?.classList.toggle('relation-main', v === 'relation');
  if      (v==='projects') { renderSidebar(); if(S.project) renderProject(); else renderWelcome(); }
  else if (v==='timeline') renderTimelineView();
  else if (v==='relation') renderRelationView();
  else if (v==='map')      renderMapView();
  else if (v==='hashtag')  renderHashtagView();
  else if (v==='colors')   { q('#left-panel-inner').innerHTML=`<div class="ph"><h4>${t('colorPanel')}</h4></div>`; renderColorSettings(); }
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
  renderSidebar();
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

function projItem(p){
  const act=S.project?.id===p.id, col=p.color_code||'#6366f1';
  return `<div class="li ${act?'active':''}" onclick="selectProject(${p.id})">
    <div class="dot" style="background:${col}"></div><span class="name">${x(p.name)}</span>
    <div class="acts">
      <button class="btn btn-g btn-i" onclick="event.stopPropagation();openProjectModal(${p.id})">${I.edit}</button>
      <button class="btn btn-g btn-i" onclick="event.stopPropagation();delProject(${p.id})" style="color:var(--danger)">${I.delete}</button>
    </div>
  </div>`;
}

function tglFolder(id){ S.openFolders.has(id)?S.openFolders.delete(id):S.openFolders.add(id); renderSidebar(); }

// ═══ WELCOME ═══════════════════════════════════════════
function renderWelcome() {
  q('#main-inner')?.classList.remove('relation-main');
  q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei">${I.book}</div><h3>${t('welcomeTitle')}</h3>
    <p>${t('welcomeText')}</p>
    <button class="btn btn-p" onclick="openProjectModal()">${I.plus} ${t('createProject')}</button>
  </div>`;
}

function renderRelList(relations){
  const list = q('#rel-list');
  if(!list) return;
  list.innerHTML = '';
  if(!relations.length){
    list.innerHTML = `<div class="empty" style="padding:18px 10px"><p>ยังไม่มีความสัมพันธ์ที่แสดงอยู่</p></div>`;
    return;
  }
  for(const rel of relations){
    const card = document.createElement('div'); card.className='rel-card';
    const badge = document.createElement('span'); badge.className='rel-type-badge';
    badge.style.borderColor = rel.color_code || 'transparent';
    badge.style.color = rel.color_code || 'var(--t1)';
    badge.textContent = rel.relation_name || 'ไม่ระบุ';

    const body = document.createElement('div'); body.className='rel-card-content';
    const title = document.createElement('div');
    title.textContent = rel.kind==='obtl' ? `${rel.from_cat} / ${rel.from_name} → ${rel.to_tl} / ${rel.to_name}` : rel.kind==='tltl' ? `${rel.from_tl} / ${rel.from_name} → ${rel.to_tl} / ${rel.to_name}` : `${rel.from_cat} / ${rel.from_name} → ${rel.to_cat} / ${rel.to_name}`;
    const subtitle = document.createElement('span'); subtitle.className='rel-cat';
    subtitle.textContent = rel.kind==='obtl' ? 'Object ↔ Event' : rel.kind==='tltl' ? 'Event ↔ Event' : 'Object ↔ Object';
    body.appendChild(title);
    body.appendChild(subtitle);

    const actions = document.createElement('div'); actions.className='rel-card-actions';
    const editBtn = document.createElement('button'); editBtn.className='btn btn-s btn-i'; editBtn.innerHTML=I.edit;
    editBtn.onclick = () => openRelModal(rel.kind, rel);
    const deleteBtn = document.createElement('button'); deleteBtn.className='btn btn-s btn-i'; deleteBtn.innerHTML=I.delete;
    deleteBtn.onclick = () => delRel(rel.id, rel.kind);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(badge);
    card.appendChild(body);
    card.appendChild(actions);
    list.appendChild(card);
  }
}

// ═══ PROJECT VIEW ══════════════════════════════════════
async function selectProject(id) {
  const project = await api.project.get(id);
  if(!project) return;
  upsertProjectTab(project);
  await activateProject(project);
}

async function activateProject(project) {
  S.project = project; S.object=null; S.timeline=null; S.map=null; S.mapAreaId=null;
  S.activeProjectTabId = project.id;
  const cats = await api.category.getAll(project.id); S.category=cats[0]||null;
  S.view = 'projects';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
  q('.nav-btn[data-panel="projects"]').classList.add('active');
  renderProjectTabs();
  renderSidebar(); await renderProject();
}

async function renderProject(){
  q('#main-inner')?.classList.remove('relation-main');
  const p=S.project, col=p.color_code||'#6366f1';
  const cats  = await api.category.getAll(p.id);
  const descs = await api.project.getDesc(p.id);

  let h = `<div class="ch">
    <div class="cdot" style="background:${col}"></div><h2>${x(p.name)}</h2>
    ${p.codename?`<span class="tag">${x(p.codename)}</span>`:''}
    <button class="btn btn-s btn-i" onclick="openProjectModal(${p.id})">${I.edit}</button>
    <button class="btn btn-p" onclick="openCategoryModal()" style="padding:6px 12px;font-size:12.5px">${I.plus} Category</button>
  </div>`;

  h += `<div class="desc-sec">
    <div class="desc-hd" onclick="tglDesc()">
      <svg class="ftgl ${S.descOpen?'open':''}" style="width:8px;height:8px;margin-right:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      <span style="flex:1;display:flex;align-items:center;gap:6px;"><span class="icon" style="color:var(--accent);">${I.star}</span> รายละเอียดโปรเจกต์</span>
      <button class="btn btn-g btn-i" onclick="event.stopPropagation();openDescModal()" title="เพิ่ม">${I.plus}</button>
    </div>
    ${S.descOpen ? `<div class="desc-body">${
      !descs.length
        ? `<p style="font-size:12px;color:var(--t3);padding:10px 14px">ยังไม่มีรายละเอียด</p>`
        : descs.map(d=>`<div class="desc-row">
            <span class="dk">${x(d.attribute_name||'--')}</span>
            <span class="dv">${x(d.attribute_text||'')}</span>
            <button class="btn btn-g btn-i" onclick="openDescModal(${d.id})" title="แก้ไข">${I.edit}</button>
            <button class="btn btn-g btn-i" onclick="delDesc(${d.id})" style="color:var(--danger)" title="ลบ">${I.delete}</button>
          </div>`).join('')
    }</div>` : ''}
  </div>`;

  h += `<div class="ctabs">`;
  for(const c of cats){
    const cc=c.color_code||'#6366f1', act=S.category?.id===c.id;
    h += `<button class="ctab ${act?'active':''}" onclick="selectCategory(${c.id})">
      <span class="cdot2" style="${act?'':'background:'+cc}"></span>${x(c.category_name)}
      <span class="tedit" onclick="event.stopPropagation();openCategoryModal(${c.id})">${I.edit}</span>
    </button>`;
  }
  h += `</div>`;

  if(!cats.length){
    h += `<div class="empty"><div class="ei">${I.pin}</div><h3>ยังไม่มี Category</h3>
      <p>เพิ่ม Category เช่น ตัวละคร, อาวุธ</p>
      <button class="btn btn-p" onclick="openCategoryModal()">${I.plus} เพิ่ม Category</button></div>`;
  } else {
    h += `<div id="cat-body"></div>`;
  }
  q('#main-inner').innerHTML = h;
  if(S.category) await renderCatBody(S.category.id);
}

function tglDesc(){ S.descOpen=!S.descOpen; renderProject(); }

async function selectCategory(id){
  const cats = await api.category.getAll(S.project.id);
  S.category = cats.find(c=>c.id===id)||null; S.object=null;
  await renderProject();
}

function setCatView(view){ S.catView=view; if(S.category) renderCatBody(S.category.id); }

async function renderCatBody(catId){
  const el=q('#cat-body'); if(!el) return;
  const objs = await api.object.getAll(catId);

  let h = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div class="view-toggles" style="display:flex;background:var(--surface);padding:3px;border-radius:var(--r);border:1px solid var(--border)">
      <button class="btn btn-g ${S.catView==='list'?'active':''}" style="padding:4px 10px;font-size:12px;border-radius:var(--rs);display:flex;align-items:center;gap:4px" onclick="setCatView('list')">${I.list} List</button>
      <button class="btn btn-g ${S.catView==='table'?'active':''}" style="padding:4px 10px;font-size:12px;border-radius:var(--rs);display:flex;align-items:center;gap:4px" onclick="setCatView('table')">${I.table} Table</button>
    </div>
    <span style="font-size:11px;color:var(--t3);flex:1">${objs.length} รายการ</span>
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openObjectModal(${catId})">${I.plus} เพิ่ม</button>
    <button class="btn btn-s btn-i" onclick="openTemplateModal(${catId})" title="จัดการ Fields">${I.fields}</button>
  </div>`;

  if(S.catView === 'table'){
    const tmpls   = await api.template.getAll(catId);
    const attrMap = {};
    for(const o of objs){
      const attrs = await api.object.getAttrs(o.id);
      attrMap[o.id] = {};
      for(const a of attrs) attrMap[o.id][a.id] = a.attribute_value ?? '';
    }
    
    // Initialize visible columns state
    const visColKey = `visibleCols_${catId}`;
    let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
    if(Object.keys(visibleCols).length === 0) {
      visibleCols = tmpls.reduce((acc, t) => ({...acc, [t.id]: true}), {});
    }
    
    h += `<div style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">
      <button class="btn btn-s" style="display:flex;align-items:center;gap:4px" onclick="openColumnVisibilityModal(${catId})">${I.settings} เลือกคอลัมน์ที่แสดง</button>
    </div>`;
    
    h += `<div class="table-container">`;
    if(!objs.length){
      h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.star}</div><p>ยังไม่มีข้อมูล</p></div>`;
    } else {
      h += `<div class="table-wrapper"><table class="dark-table"><thead><tr><th onclick="sortTable(${catId},'name')"><div class="sortable-header">ชื่อ <span class="sort-indicator">▲</span></div></th>`;
      for(const t of tmpls) {
        const visible = visibleCols[t.id] ? '' : 'display:none';
        h += `<th style="${visible}" onclick="sortTable(${catId},${t.id})" data-template-id="${t.id}"><div class="sortable-header">${x(t.description)} <span class="sort-indicator">▲</span></div></th>`;
      }
      h += `<th style="width:80px;text-align:center">จัดการ</th></tr></thead><tbody>`;
      for(const o of objs){
        const col=o.color_code||'#6366f1', act=S.object?.id===o.id;
        h += `<tr class="objrow ${act?'active':''}" id="row-${o.id}" onclick="selectObject(${o.id})" data-sort-name="${x(o.name).toLowerCase()}">
          <td><div style="display:flex;align-items:center;gap:8px">
            <div class="odot" style="background:${col}"></div>
            <input class="table-inline-input table-name-input" data-oid="${o.id}" data-color="${o.color_id??o.color??''}" value="${x(o.name)}">
          </div></td>`;
        for(const t of tmpls){
          const val = attrMap[o.id]?.[t.id] ?? '';
          const visible = visibleCols[t.id] ? '' : 'display:none';
          h += `<td style="${visible}" data-template-id="${t.id}" data-sort-value="${x(val).toLowerCase()}"><input class="table-inline-input table-attr-input" data-oid="${o.id}" data-tid="${t.id}" value="${x(val)}"></td>`;
        }
        h += `<td><div style="display:flex;gap:4px;justify-content:center" onclick="event.stopPropagation()">
          <button class="btn btn-g btn-i" onclick="openObjectModal(null,${o.id})">${I.edit}</button>
          <button class="btn btn-g btn-i" onclick="delObject(${o.id})" style="color:var(--danger)">${I.delete}</button>
        </div></td></tr>`;
      }
      h += `</tbody></table></div>`;
    }
    h += `</div>`;
  } else {
    h += `<div class="split"><div><div class="objlist" id="objlist">`;
    if(!objs.length){
      h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.star}</div><p>ยังไม่มีข้อมูล</p></div>`;
    } else {
      for(const o of objs){
        const col=o.color_code||'#6366f1', act=S.object?.id===o.id;
        h += `<div class="objrow ${act?'active':''}" id="row-${o.id}" onclick="selectObject(${o.id})">
          <div class="odot" style="background:${col}"></div><span class="oname">${x(o.name)}</span>
        </div>`;
      }
    }
    h += `</div></div><div id="detail-panel">${S.object?'':emptyDetail()}</div></div>`;
  }

  el.innerHTML = h;
  if(S.catView==='table') bindTableInlineEditors();
  else if(S.object) await renderDetail(S.object.id);
}

function flashSaved(el){
  if(!el) return;
  el.classList.remove('saved-flash'); void el.offsetWidth; el.classList.add('saved-flash');
}

function bindTableInlineEditors(){
  const onEnterBlur = (input, saveFn) => {
    input.dataset.prev = input.value.trim();
    const commit = async () => {
      const newVal = input.value.trim();
      if(newVal === input.dataset.prev) return;
      await saveFn(newVal);
      input.dataset.prev = newVal;
      flashSaved(input);
    };
    input.addEventListener('blur', ()=>commit().catch(()=>toast('บันทึกข้อมูลไม่สำเร็จ','err')));
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); input.blur(); } });
  };
  document.querySelectorAll('.table-name-input').forEach(input=>{
    input.addEventListener('click', e=>e.stopPropagation());
    onEnterBlur(input, async newName=>{
      const oid=+input.dataset.oid, color=input.dataset.color?+input.dataset.color:null;
      if(!newName) return;
      await api.object.update(oid, newName, color);
    });
  });
  document.querySelectorAll('.table-attr-input').forEach(input=>{
    input.addEventListener('click', e=>e.stopPropagation());
    onEnterBlur(input, async newVal=>{
      await api.object.upsertAttr(+input.dataset.oid, +input.dataset.tid, newVal);
    });
  });
}

async function openColumnVisibilityModal(catId) {
  const tmpls = await api.template.getAll(catId);
  const visColKey = `visibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
  
  // Setup defaults if not exist
  let hasDiff = false;
  for (const t of tmpls) {
    if (visibleCols[t.id] === undefined) {
      visibleCols[t.id] = true;
      hasDiff = true;
    }
  }
  if (hasDiff) {
    localStorage.setItem(visColKey, JSON.stringify(visibleCols));
  }
  
  let html = `<div style="display:flex; flex-direction:column; gap:10px;">`;
  
  const allChecked = tmpls.every(t => visibleCols[t.id] !== false);
  html += `
    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; padding:6px 0;">
      <input type="checkbox" id="col-vis-all" ${allChecked ? 'checked' : ''} onchange="toggleAllColumnsFromModal(${catId}, this.checked)">
      <strong>แสดงทั้งหมด</strong>
    </label>
    <div style="height:1px; background:var(--border); margin:4px 0;"></div>
  `;

  for(const t of tmpls) {
    const isChecked = visibleCols[t.id] !== false;
    html += `
      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; padding:4px 0;">
        <input type="checkbox" class="col-vis-check" data-tid="${t.id}" ${isChecked ? 'checked' : ''} onchange="toggleColumnVisibilityFromModal(${catId}, ${t.id}, this.checked)">
        <span>${x(t.description)}</span>
      </label>
    `;
  }
  
  html += `</div>`;
  html += `<div class="mfoot">
    <button class="btn btn-p" onclick="closeModal()">ตกลง</button>
  </div>`;
  
  openModal('เลือกคอลัมน์ที่แสดง', html);
}

function toggleColumnVisibilityFromModal(catId, templateId, isChecked) {
  const visColKey = `visibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
  visibleCols[templateId] = isChecked;
  localStorage.setItem(visColKey, JSON.stringify(visibleCols));

  // Update "all" checkbox state inside modal
  const allCheckbox = q('#col-vis-all');
  if (allCheckbox) {
    const checkboxes = document.querySelectorAll('.col-vis-check');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    allCheckbox.checked = allChecked;
  }

  // Toggle column visibility in-place without re-rendering the whole table
  _applyColumnVisibility(templateId, isChecked);
}

function toggleAllColumnsFromModal(catId, isChecked) {
  const visColKey = `visibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');

  const checkboxes = document.querySelectorAll('.col-vis-check');
  checkboxes.forEach(cb => {
    cb.checked = isChecked;
    const tid = cb.dataset.tid;
    visibleCols[tid] = isChecked;
    _applyColumnVisibility(tid, isChecked);
  });

  localStorage.setItem(visColKey, JSON.stringify(visibleCols));
}

// Apply show/hide to all th/td with a given template id without touching the modal
function _applyColumnVisibility(templateId, isVisible) {
  const disp = isVisible ? '' : 'none';
  document.querySelectorAll(`[data-template-id="${templateId}"]`).forEach(el => {
    el.style.display = disp;
  });
}

function sortTable(catId, sortBy) {
  const table = q('.dark-table');
  if(!table) return;
  
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // Determine sort direction
  const th = table.querySelector(`th[data-template-id="${sortBy}"]`) || table.querySelector('th:first-child');
  const header = th?.querySelector('.sortable-header');
  const currentSort = header?.className || '';
  const isAscending = currentSort.includes('sort-asc');
  
  // Sort rows
  rows.sort((a, b) => {
    let aVal, bVal;
    if(sortBy === 'name') {
      aVal = a.dataset.sortName || '';
      bVal = b.dataset.sortName || '';
    } else {
      const aCell = a.querySelector(`td[data-template-id="${sortBy}"]`);
      const bCell = b.querySelector(`td[data-template-id="${sortBy}"]`);
      aVal = aCell?.dataset.sortValue || '';
      bVal = bCell?.dataset.sortValue || '';
    }
    
    const comparison = aVal.localeCompare(bVal, 'th');
    return isAscending ? -comparison : comparison;
  });
  
  // Update header classes
  table.querySelectorAll('.sortable-header').forEach(h => {
    h.classList.remove('sort-asc', 'sort-desc');
  });
  header?.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
  
  // Re-append sorted rows
  rows.forEach(row => tbody.appendChild(row));
}

function emptyDetail(){ return `<div class="empty" style="padding:50px 20px"><div class="ei">${I.search}</div><p>เลือกรายการเพื่อดูรายละเอียด</p></div>`; }

async function selectObject(id){
  S.object = await api.object.get(id);
  document.querySelectorAll('.objrow').forEach(r=>r.classList.remove('active'));
  const row=q(`#row-${id}`); if(row) row.classList.add('active');
  await renderDetail(id);
}

async function buildDetail(oid){
  const obj=await api.object.get(oid), attrs=await api.object.getAttrs(oid);
  const tags = await api.object.getTags(oid);
  const relationRows = await getObjectRelationRows(oid);
  const col=obj.color_code||'#6366f1';
  const objNote = obj.note || '';
  let h = `<div class="odetail">
    <div class="dhead">
      <div class="odot" style="background:${col};width:11px;height:11px"></div>
      <span class="dtitle">${x(obj.name)}</span>
      <button class="btn btn-g btn-i" onclick="openObjectModal(null,${obj.id})">${I.edit}</button>
      <button class="btn btn-g btn-i" onclick="delObject(${obj.id})" style="color:var(--danger)">${I.delete}</button>
    </div>
    <div class="detail-content">
    <div class="attrs" id="af-${oid}">`;
  if(!attrs.length){
    h += `<div class="empty" style="padding:24px 0"><p style="font-size:12px">ยังไม่มี Field</p>
      <button class="btn btn-s" style="display:flex;align-items:center;gap:4px" onclick="openTemplateModal(${S.category.id})">${I.fields} จัดการ Fields</button></div>`;
  } else {
    for(const a of attrs){
      const val=a.attribute_value||'', uid=`ai-${oid}-${a.id}`;
      h += `<div class="aitem"><label>${x(a.description)}</label>`;
      if(a.attribute_type==='textarea') h += `<textarea id="${uid}" data-tid="${a.id}" data-oid="${oid}" class="auto-expand detail-attr-field" oninput="autoExpandTextarea(this)">${x(val)}</textarea>`;
      else h += `<input type="${a.attribute_type==='number'?'number':'text'}" id="${uid}" data-tid="${a.id}" data-oid="${oid}" class="detail-attr-field" value="${x(val)}">`;
      h += `</div>`;
    }
  }
  h += `</div>
    <div class="note-section">
      <label style="display:flex;align-items:center;gap:4px"><span class="icon" style="width:12px;height:12px">${I.edit}</span> โน็ต (Note)</label>
      <textarea class="note-textarea auto-expand detail-note-field" id="note-${oid}" data-oid="${oid}" placeholder="เพิ่มหมายเหตุเพิ่มเติมสำหรับรายการนี้..." oninput="autoExpandTextarea(this)">${x(objNote)}</textarea>
    </div>
    <div class="detail-relations">
      <div class="tags-head"><span>ความสัมพันธ์ของรายการนี้</span></div>
      <div class="relation-mini-list">${renderObjectRelationRows(relationRows)}</div>
    </div>
    <div class="detail-tags">
      <div class="tags-head">
        <span>ป้ายกำกับของรายการ</span>
        <div class="tag-add-box">
          <input id="tag-search-${oid}" class="tag-search-input" type="text" placeholder="พิมพ์ค้นหา Tag เพื่อเพิ่ม" oninput="renderTagSuggestions(${oid})">
          <div class="tag-suggestions" id="tag-sug-${oid}"></div>
        </div>
      </div>
      <div class="htags-grid" id="tag-list-${oid}">${tags.map(t=>`<span class="htag-item" style="border-color:${t.color_code||'#6366f1'}"><span class="hn" style="color:${t.color_code||'#6366f1'}">#${x(t.tag_name)}</span><button class="btn btn-s btn-i" title="ลบ Tag" onclick="removeObjectTag(${oid},${t.id})">${I.close}</button></span>`).join('')}</div>
    </div>
    </div>
  </div>`;
  return h;
}

async function getObjectRelationRows(oid){
  if(!S.project?.id) return [];
  const [allObjs, obob, obtl] = await Promise.all([
    api.relation.getProjectObjects(S.project.id),
    api.relation.getOBOB(S.project.id),
    api.relation.getOBTL(S.project.id),
  ]);
  const selected = allObjs.find(o=>o.id===oid);
  if(!selected) return [];

  const selectedKey = `${selected.category_name}::${selected.name}`;
  const rows = [];

  for(const r of obob){
    if(r.from_cat===selected.category_name && r.from_name===selected.name){
      rows.push({
        kind: 'Object',
        relation: r.relation_name || 'สัมพันธ์',
        target: `${r.to_cat} / ${r.to_name}`,
        color: r.color_code || '#8b9',
      });
    } else if(r.to_cat===selected.category_name && r.to_name===selected.name){
      rows.push({
        kind: 'Object',
        relation: r.relation_name || 'สัมพันธ์',
        target: `${r.from_cat} / ${r.from_name}`,
        color: r.color_code || '#8b9',
      });
    }
  }

  for(const r of obtl){
    const fromKey = `${r.from_cat}::${r.from_name}`;
    if(fromKey!==selectedKey) continue;
    rows.push({
      kind: 'Event',
      relation: r.relation_name || 'สัมพันธ์',
      target: `${r.to_tl} / ${r.to_name}${r.s_years ? ` (${fmtDate(r.s_day,r.s_month,r.s_years,0,0)})` : ''}`,
      color: r.color_code || '#8b9',
    });
  }
  return rows;
}

function renderObjectRelationRows(rows){
  if(!rows.length) return `<div class="empty" style="padding:12px 0;font-size:12px">ยังไม่มี Relation</div>`;
  return rows.map(r=>`<div class="mini-rel-item">
    <span class="mini-rel-dot" style="background:${x(r.color)}"></span>
    <span class="mini-rel-kind">${x(r.kind)}</span>
    <span class="mini-rel-rel">${x(r.relation)}</span>
    <span class="mini-rel-to">${x(r.target)}</span>
  </div>`).join('');
}

async function renderTagSuggestions(oid){
  const input = q(`#tag-search-${oid}`);
  const container = q(`#tag-sug-${oid}`);
  const current = await api.object.getTags(oid);
  if(!input || !container) return;
  const value = input.value.trim().toLowerCase();
  const tags = await api.hashtag.getAll();
  const selectedIds = new Set(current.map(t=>t.id));
  const filtered = tags.filter(t => !selectedIds.has(t.id) && (!value || t.tag_name.toLowerCase().includes(value)));
  const recent = filtered
    .sort((a,b)=> (b.update_at||'').localeCompare(a.update_at||''))
    .slice(0,10);
  container.innerHTML = recent.length
    ? recent.map(t=>`<div class="htag-item" style="border-color:${t.color_code||'#6366f1'};cursor:pointer" onclick="addObjectTag(${oid},${t.id})"><span class="hn" style="color:${t.color_code||'#6366f1'}">#${x(t.tag_name)}</span></div>`).join('')
    : `<div class="empty" style="padding:10px 6px;font-size:12px;color:var(--t3)">ไม่มี Tag ให้เลือก</div>`;
}

async function addObjectTag(oid, tagId){
  await api.object.addTag(oid, tagId);
  await renderDetail(oid);
}

async function removeObjectTag(oid, tagId){
  await api.object.removeTag(oid, tagId);
  await renderDetail(oid);
}

async function saveAttrs(oid){
  const form=q(`#af-${oid}`); if(!form) return;
  for(const inp of form.querySelectorAll('[data-tid]')) await api.object.upsertAttr(oid,+inp.dataset.tid,inp.value);
  toast('บันทึกสำเร็จ','ok');
  if(S.catView==='table') await renderCatBody(S.category.id);
}

function autoExpandTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';
}

async function saveNote(oid) {
  const noteEl = q(`#note-${oid}`);
  if(!noteEl) return;
  const noteText = noteEl.value.trim();
  await api.object.updateNote(oid, noteText);
  toast('บันทึกสำเร็จ','ok');
}

function bindDetailAutoSave(oid) {
  const onBlurSave = (el, saveFn) => {
    el.dataset.prev = el.value;
    const commit = async () => {
      if(el.value === el.dataset.prev) return;
      await saveFn(el.value);
      el.dataset.prev = el.value;
      flashSaved(el);
    };
    el.addEventListener('blur', () => commit().catch(() => toast('บันทึกข้อมูลไม่สำเร็จ', 'err')));
    el.addEventListener('keydown', e => { if(e.key === 'Enter' && el.tagName !== 'TEXTAREA') { e.preventDefault(); el.blur(); } });
  };
  document.querySelectorAll('.detail-attr-field').forEach(el => {
    onBlurSave(el, async newVal => {
      await api.object.upsertAttr(+el.dataset.oid, +el.dataset.tid, newVal);
    });
  });
  const noteEl = q(`.detail-note-field`);
  if(noteEl) {
    onBlurSave(noteEl, async newVal => {
      await api.object.updateNote(+noteEl.dataset.oid, newVal.trim());
    });
  }
}

async function renderDetail(oid){
  const panel=q('#detail-panel'); if(!panel) return;
  panel.innerHTML = await buildDetail(oid);
  // Auto-expand all textareas
  setTimeout(() => {
    panel.querySelectorAll('.auto-expand').forEach(ta => {
      autoExpandTextarea(ta);
    });
  }, 0);
  bindDetailAutoSave(oid);
  renderTagSuggestions(oid);
}

// ═══ TIMELINE VIEW ═════════════════════════════════════
async function renderTimelineView(){
  if(!S.project){
    q('#left-panel-inner').innerHTML=`<div class="empty" style="padding:40px 10px"><div class="ei">${I.timeline}</div><p style="text-align:center">กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    q('#main-inner').innerHTML=`<div class="empty" style="margin-top:80px"><div class="ei">${I.timeline}</div><h3>Timeline</h3><p>กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    return;
  }
  const tls = await api.timeline.getAll(S.project.id);
  let lh = `<div class="ph"><h4>Timeline</h4><button class="btn btn-g btn-i" onclick="openTimelineModal()">${I.plus}</button></div>`;
  for(const t of tls){
    const col=t.color_code||'#06b6d4', act=S.timeline?.id===t.id;
    lh += `<div class="li ${act?'active':''}" onclick="selectTimeline(${t.id})">
      <div class="dot" style="background:${col}"></div>
      <span class="name">${x(t.line_name||'ไม่มีชื่อ')}</span>
      <div class="acts">
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openTimelineModal(${t.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();delTimeline(${t.id})" style="color:var(--danger)">${I.delete}</button>
      </div>
    </div>`;
  }
  q('#left-panel-inner').innerHTML = lh;
  if(!S.timeline){
    q('#main-inner').innerHTML = tls.length
      ? `<div class="empty" style="margin-top:80px"><div class="ei">${I.timeline}</div><h3>เลือก Timeline จากรายการ</h3></div>`
      : `<div class="empty" style="margin-top:80px"><div class="ei">${I.timeline}</div><h3>ยังไม่มี Timeline</h3><button class="btn btn-p" onclick="openTimelineModal()">${I.plus} สร้าง Timeline</button></div>`;
    return;
  }
  await renderTimelineDetail(S.timeline.id);
}

async function selectTimeline(id){
  const tls = await api.timeline.getAll(S.project.id);
  S.timeline = tls.find(t=>t.id===id)||null;
  await renderTimelineView();
}

async function renderTimelineDetail(tlid){
  const tl=S.timeline, col=tl.color_code||'#06b6d4';
  const allEvs = await api.timeline.getEvents(tlid);
  const evs = allEvs.slice().sort((a,b)=>{
    const ka=(a.s_years||0)*10000+(a.s_month||0)*100+(a.s_day||0);
    const kb=(b.s_years||0)*10000+(b.s_month||0)*100+(b.s_day||0);
    return ka-kb;
  });

  let h = `<div class="ch">
    <div class="cdot" style="background:${col}"></div><h2>${x(tl.line_name||'ไม่มีชื่อ')}</h2>
    <button class="btn btn-s btn-i" onclick="openTimelineModal(${tl.id})">${I.edit}</button>
    <button class="btn btn-p" onclick="openEventModal(${tlid})" style="padding:6px 12px;font-size:12.5px">${I.plus} เพิ่มเหตุการณ์</button>
  </div>`;

  if(!evs.length){
    h += `<div class="empty"><div class="ei">${I.timeline}</div><h3>ยังไม่มีเหตุการณ์</h3>
      <button class="btn btn-p" onclick="openEventModal(${tlid})">${I.plus} เพิ่มเหตุการณ์</button></div>`;
  } else {
    const MARGIN=80, LINE_Y=180, CARD_W=96, SVG_H=400;
    const n=evs.length;
    const hostW=q('#main-inner')?.offsetWidth||900;
    const trackW=Math.max(hostW, 900);
    const usable=trackW-(2*MARGIN);
    const graphState = timelineGraphState[tlid] ||= { scale:1, tx:0, yOffsets:{} };

    const toTs = (d,m,y,h,min)=>{
      if(!d||!m||!y) return null;
      return Date.UTC(Number(y), Number(m)-1, Number(d), Number(h||0), Number(min||0), 0, 0);
    };
    const startTs = evs.map(ev=>toTs(ev.s_day,ev.s_month,ev.s_years,ev.s_hour,ev.s_minute));
    const endTs = evs.map(ev=>toTs(ev.e_day,ev.e_month,ev.e_years,ev.e_hour,ev.e_minute));
    const allTs = [];
    for(let i=0;i<n;i++){
      if(startTs[i]!==null) allTs.push(startTs[i]);
      if(endTs[i]!==null) allTs.push(endTs[i]);
    }
    const minTs = allTs.length ? Math.min(...allTs) : 0;
    const maxTs = allTs.length ? Math.max(...allTs) : 1;
    const spanTs = Math.max(1, maxTs-minTs);
    const xFromTs = (ts)=>{
      if(ts===null) return MARGIN;
      const ratio = (ts-minTs)/spanTs;
      return MARGIN + (ratio*usable*graphState.scale);
    };
    const xs=evs.map((_,i)=>xFromTs(startTs[i]));

    let svg = `<svg id="timeline-graph-svg" xmlns="http://www.w3.org/2000/svg" width="100%" height="${SVG_H}" viewBox="0 0 ${trackW} ${SVG_H}" data-min-ts="${minTs}" data-span-ts="${spanTs}" data-usable="${usable}" data-margin="${MARGIN}" data-line-y="${LINE_Y}" data-card-w="${CARD_W}" data-tlid="${tlid}">
      <g id="timeline-graph-content" transform="translate(${graphState.tx},0)">
      <line id="timeline-axis-line" x1="${MARGIN}" y1="${LINE_Y}" x2="${MARGIN + usable*graphState.scale}" y2="${LINE_Y}" stroke="var(--border)" stroke-width="8" stroke-linecap="round" opacity="0.75" style="cursor:crosshair"/>`;
    for(let i=0;i<n;i++){
      const ev=evs[i], ec=ev.color_code||col, xi=xs[i];
      const up=i%2===0, defaultBy=up?(LINE_Y-120):(LINE_Y+120);
      const by=Math.max(36, Math.min(SVG_H-36, graphState.yOffsets[ev.id] ?? defaultBy));
      const cardY=up?(by-62):(by+8);
      const sTxt=fmtDate(ev.s_day,ev.s_month,ev.s_years,ev.s_hour,ev.s_minute);
      const hasEnd=!!(ev.e_day&&ev.e_month&&ev.e_years);
      const eTxt=hasEnd?fmtDate(ev.e_day,ev.e_month,ev.e_years,ev.e_hour,ev.e_minute):'';
      const dateTxt=hasEnd?`${sTxt} - ${eTxt}`:sTxt;
      let rangeSvg = '';
      if(hasEnd){
        let xe = xFromTs(endTs[i]);
        let xStart = xi, xEnd = xe;
        if(xEnd<xStart){ const t=xStart; xStart=xEnd; xEnd=t; }
        const rw=Math.max(2, xEnd-xStart);
        rangeSvg = `<rect data-event-range="${ev.id}" data-start-ts="${startTs[i]||''}" data-end-ts="${endTs[i]||''}" x="${xStart}" y="${LINE_Y-4}" width="${rw}" height="8" rx="4" fill="${ec}" opacity="0.28" style="pointer-events:none"/>`;
      }
      svg += `
        ${rangeSvg}
        <line data-event-stem="${ev.id}" data-start-ts="${startTs[i]||''}" x1="${xi}" y1="${LINE_Y}" x2="${xi}" y2="${by}" stroke="${ec}" stroke-width="2"/>
        <circle data-event-dot="${ev.id}" data-start-ts="${startTs[i]||''}" cx="${xi}" cy="${LINE_Y}" r="5" fill="${ec}"/>
        <circle data-event-node="${ev.id}" data-start-ts="${startTs[i]||''}" data-card-up="${up?'1':'0'}" cx="${xi}" cy="${by}" r="8" fill="${ec}" style="cursor:ns-resize"/>
        <foreignObject data-event-card="${ev.id}" data-start-ts="${startTs[i]||''}" x="${xi-(CARD_W/2)}" y="${cardY}" width="${CARD_W}" height="58" style="cursor:pointer" onclick="openEventModal(${tlid},${ev.id})">
          <div xmlns="http://www.w3.org/1999/xhtml" style="background:var(--surface);border:1px solid var(--border);border-left:3px solid ${ec};border-radius:8px;padding:4px 6px;font-size:10px;line-height:1.25;overflow:hidden">
            <div style="font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x(ev.event_name||'ไม่มีชื่อ')}</div>
            <div style="color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x(dateTxt)}</div>
          </div>
        </foreignObject>`;
    }
    svg += `</g></svg>`;
    h += `<div class="timeline-graph-board" id="timeline-graph-board">${svg}<div id="timeline-axis-tip" class="timeline-axis-tip hidden"></div></div>`;

    h += `<div style="margin-top:24px">
      <div class="ph"><h4>เหตุการณ์ทั้งหมด</h4><button class="btn btn-p" style="padding:6px 12px;font-size:12.5px" onclick="openEventModal(${tlid})">${I.plus} เพิ่มเหตุการณ์</button></div>
      <div class="objlist">`;
    for(const ev of evs){
      const ec=ev.color_code||col;
      const sTxt=fmtDate(ev.s_day,ev.s_month,ev.s_years,ev.s_hour,ev.s_minute);
      const hasEnd=!!(ev.e_day&&ev.e_month&&ev.e_years);
      const eTxt=hasEnd?fmtDate(ev.e_day,ev.e_month,ev.e_years,ev.e_hour,ev.e_minute):'';
      const dateTxt=hasEnd?`${sTxt} - ${eTxt}`:sTxt;
      h += `<div class="objrow" onclick="openEventModal(${tlid},${ev.id})">
        <div class="odot" style="background:${ec}"></div>
        <div style="flex:1;min-width:0">
          <div class="oname">${x(ev.event_name||'ไม่มีชื่อ')}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x(dateTxt)}</div>
        </div>
        <div class="acts">
          <button class="btn btn-g btn-i" onclick="event.stopPropagation();openEventModal(${tlid},${ev.id})">${I.edit}</button>
          <button class="btn btn-g btn-i" onclick="event.stopPropagation();delEvent(${ev.id},${tlid})" style="color:var(--danger)">${I.delete}</button>
        </div>
      </div>
      <div class="objrow-story">
        <textarea id="ev-story-${ev.id}" class="tl-story" placeholder="เขียนสตอรี่ที่เกิดขึ้นในเหตุการณ์นี้..." onclick="event.stopPropagation()" onchange="saveEventStory(${ev.id})">${x(ev.story||'')}</textarea>
      </div>`;
    }
    h += `</div></div>`;
  }
  q('#main-inner').innerHTML = h;
  if(evs.length) bindTimelineGraphInteractions(tlid);
}

function applyTimelineGraphTransform(tlid){
  const st = timelineGraphState[tlid];
  const g = q('#timeline-graph-content');
  if(!st || !g) return;
  g.setAttribute('transform', `translate(${st.tx},0)`);
}

function bindTimelineGraphInteractions(tlid){
  if(timelineGraphCleanup) timelineGraphCleanup();
  const board = q('#timeline-graph-board');
  const svg = q('#timeline-graph-svg');
  const tip = q('#timeline-axis-tip');
  const axis = q('#timeline-axis-line');
  if(!board || !svg) return;
  const st = timelineGraphState[tlid] ||= { scale:1, tx:0, yOffsets:{} };
  let pan = null;
  let nodeDrag = null;
  let movedNode = false;
  const controller = new AbortController();
  timelineGraphCleanup = () => controller.abort();

  const svgX = (clientX) => {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return ((clientX - rect.left) / rect.width) * vb.width;
  };
  const svgY = (clientY) => {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return ((clientY - rect.top) / rect.height) * vb.height;
  };
  const margin = Number(svg.dataset.margin||80);
  const usable = Number(svg.dataset.usable||1);
  const cardW = Number(svg.dataset.cardW||96);
  const minTs = Number(svg.dataset.minTs||0);
  const spanTs = Number(svg.dataset.spanTs||1);
  const clampTx = () => {
    const width = svg.viewBox.baseVal.width;
    const minTx = Math.min(0, width - margin - (margin + usable) * st.scale);
    st.tx = Math.max(minTx - 80, Math.min(80, st.tx));
  };
  const xFromTs = (ts) => {
    if(ts===null || ts==='') return margin;
    const ratio = (ts - minTs)/spanTs;
    return margin + (ratio*usable*st.scale);
  };
  const updateTimelineGraphX = () => {
    const axisLine = q('#timeline-axis-line');
    if(axisLine) axisLine.setAttribute('x2', String(margin + usable * st.scale));
    svg.querySelectorAll('[data-event-range]').forEach(rect => {
      const s = Number(rect.dataset.startTs||'');
      const e = Number(rect.dataset.endTs||'');
      if(isNaN(s) || isNaN(e)) return;
      let xStart = xFromTs(s);
      let xEnd = xFromTs(e);
      if(xEnd < xStart){ const t = xStart; xStart = xEnd; xEnd = t; }
      rect.setAttribute('x', xStart);
      rect.setAttribute('width', Math.max(2, xEnd - xStart));
    });
    svg.querySelectorAll('[data-event-stem]').forEach(stem => {
      const s = Number(stem.dataset.startTs||'');
      if(isNaN(s)) return;
      const x = xFromTs(s);
      stem.setAttribute('x1', x);
      stem.setAttribute('x2', x);
    });
    svg.querySelectorAll('[data-event-dot]').forEach(dot => {
      const s = Number(dot.dataset.startTs||'');
      if(isNaN(s)) return;
      dot.setAttribute('cx', xFromTs(s));
    });
    svg.querySelectorAll('[data-event-node]').forEach(node => {
      const s = Number(node.dataset.startTs||'');
      if(isNaN(s)) return;
      node.setAttribute('cx', xFromTs(s));
    });
    svg.querySelectorAll('[data-event-card]').forEach(card => {
      const s = Number(card.dataset.startTs||'');
      if(isNaN(s)) return;
      card.setAttribute('x', xFromTs(s) - (cardW / 2));
    });
  };

  board.oncontextmenu = (e) => e.preventDefault();
  board.onwheel = (e) => {
    e.preventDefault();
    const mx = svgX(e.clientX);
    const oldScale = st.scale || 1;
    const nextScale = Math.max(0.5, Math.min(8, oldScale * (e.deltaY < 0 ? 1.12 : 0.88)));
    const worldX = (mx - st.tx) / oldScale;
    st.scale = nextScale;
    st.tx = mx - worldX * nextScale;
    clampTx();
    applyTimelineGraphTransform(tlid);
    updateTimelineGraphX();
  };
  board.onmousedown = (e) => {
    if(e.button !== 2) return;
    e.preventDefault();
    pan = { x:e.clientX, tx:st.tx };
    board.classList.add('is-panning');
  };
  document.addEventListener('mousemove', onMove, { signal: controller.signal });
  document.addEventListener('mouseup', onUp, { signal: controller.signal });

  function onMove(e){
    if(pan){
      const rect = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      st.tx = pan.tx + ((e.clientX - pan.x) / rect.width) * vb.width;
      clampTx();
      applyTimelineGraphTransform(tlid);
    }
    if(nodeDrag){
      movedNode = true;
      const y = Math.max(34, Math.min(svg.viewBox.baseVal.height - 34, svgY(e.clientY)));
      const id = nodeDrag.id;
      st.yOffsets[id] = y;
      const node = q(`[data-event-node="${id}"]`);
      const stem = q(`[data-event-stem="${id}"]`);
      const card = q(`[data-event-card="${id}"]`);
      if(node) node.setAttribute('cy', y);
      if(stem) stem.setAttribute('y2', y);
      if(card){
        const up = node?.dataset.cardUp === '1';
        card.setAttribute('y', up ? y - 66 : y + 10);
      }
    }
  }
  function onUp(){
    pan = null;
    nodeDrag = null;
    board.classList.remove('is-panning');
    setTimeout(()=>{ movedNode = false; }, 0);
  }

  svg.querySelectorAll('[data-event-node]').forEach(node => {
    node.addEventListener('mousedown', e => {
      if(e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      nodeDrag = { id: node.dataset.eventNode };
      movedNode = false;
    });
    node.addEventListener('click', e => {
      e.stopPropagation();
      if(movedNode) return;
      openEventModal(tlid, Number(node.dataset.eventNode));
    });
  });
  svg.querySelectorAll('[data-event-card]').forEach(card => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      openEventModal(tlid, Number(card.dataset.eventCard));
    });
  });

  if(axis && tip){
    axis.addEventListener('mousemove', e => {
      const xWorld = svgX(e.clientX) - st.tx;
      const ratio = Math.max(0, Math.min(1, (xWorld - margin) / (usable * st.scale)));
      tip.textContent = fmtTimelinePoint(minTs + ratio * spanTs);
      tip.style.left = `${e.clientX - board.getBoundingClientRect().left + 10}px`;
      tip.style.top = `${e.clientY - board.getBoundingClientRect().top - 28}px`;
      tip.classList.remove('hidden');
    });
    axis.addEventListener('mouseleave', () => tip.classList.add('hidden'));
  }
}

// ═══ RELATION VIEW ═════════════════════════════════════
const nodeState = {catView:{}, objView:{}, projectView:{}}; 
const wbViewState = {catView:{}, objView:{}, projectView:{}};

// Graph render helpers
async function renderForceGraph(graphData, opts={}){
  const c = q('#wb-container');
  if(!c) return;
  c.innerHTML = `<div id="react-graph"></div><div class="rel-resize-handle" title="Drag to resize graph"></div>`;
  await ensureD3();
  await renderForceGraphWithD3(graphData, opts);
}

// D3 loader + renderer
function ensureD3(){
  if(window.d3) return Promise.resolve();
  if(window.__d3Loading) return new Promise(resolve=>{ const iv=setInterval(()=>{ if(window.d3){ clearInterval(iv); resolve(); } },50); });
  window.__d3Loading = true;
  return new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/d3@7/dist/d3.min.js';
    s.onload = ()=>{ window.__d3Loading = false; resolve(); };
    s.onerror = ()=>{ window.__d3Loading = false; reject(new Error('Failed to load d3')); };
    document.head.appendChild(s);
  });
}

async function renderForceGraphWithD3(graphData, opts={}){
  const el = document.getElementById('react-graph');
  el.innerHTML = '';
  const width = el.clientWidth || 800;
  const height = el.clientHeight || 420;
  const svg = window.d3.create('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'transparent')
    .style('cursor', 'grab');
  const g = svg.append('g');
  const link = g.append('g').attr('stroke', '#999').attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(graphData.links)
    .join('line')
    .attr('stroke-width', d=>d.width||2)
    .style('stroke', d=>d.color||'#999')
    .style('stroke-dasharray', d=>d.dashed?'4 2':null);
  const node = g.append('g').attr('stroke', '#fff').attr('stroke-width', 1.2)
    .selectAll('circle')
    .data(graphData.nodes)
    .join('circle')
    .attr('r', d=>d.size?d.size:10)
    .attr('fill', d=>d.color||'#6366f1')
    .style('cursor', 'pointer');
  const label = g.append('g').selectAll('text').data(graphData.nodes).join('text')
    .attr('class', 'graph-label')
    .attr('font-size', 12)
    .attr('dy', -12)
    .attr('text-anchor', 'middle')
    .text(d=>d.name);

  const zoom = window.d3.zoom()
    .filter(event=> event.type === 'wheel' || event.type === 'mousedown' || event.type === 'mousemove' || event.type === 'mouseup')
    .scaleExtent([0.4, 3])
    .on('zoom', (event)=>{
      g.attr('transform', event.transform);
    });
  svg.call(zoom).on('dblclick.zoom', null).on('contextmenu', (event)=>event.preventDefault());

  function ticked(){
    link.attr('x1', d=>d.source.x)
      .attr('y1', d=>d.source.y)
      .attr('x2', d=>d.target.x)
      .attr('y2', d=>d.target.y);
    node.attr('cx', d=>d.x).attr('cy', d=>d.y);
    label.attr('x', d=>d.x).attr('y', d=>d.y - (d.size?d.size:10) - 4);
  }

  const simulation = window.d3.forceSimulation(graphData.nodes)
    .force('link', window.d3.forceLink(graphData.links).id(d=>d.id).distance(70).strength(0.9))
    .force('charge', window.d3.forceManyBody().strength(-110))
    .force('center', window.d3.forceCenter(width/2, height/2))
    .force('collide', window.d3.forceCollide().radius(d=>Math.max(14, (d.size||10) + 8)).strength(0.9))
    .force('x', window.d3.forceX(width/2).strength(0.05))
    .force('y', window.d3.forceY(height/2).strength(0.05))
    .on('tick', ticked);

  simulation.alpha(1).restart();

  function dragstarted(event,d){
    if(!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event,d){ d.fx = event.x; d.fy = event.y; }
  function dragended(event,d){
    if(!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  node.call(window.d3.drag()
    .filter(event=> event.button === 0)
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended));

  node.on('mouseover', function(event,d){
    window.d3.select(this).attr('stroke-width', 2.4);
    label.filter(l=>l.id === d.id).style('opacity', 1);
  });
  node.on('mouseout', function(event,d){
    window.d3.select(this).attr('stroke-width', 1.2);
    label.filter(l=>l.id === d.id).style('opacity', 0);
  });
  node.on('click', (event,d)=>{ if(opts.onNodeClick) opts.onNodeClick(d); });

  el.appendChild(svg.node());
}

async function renderRelationView(){
  q('#main-inner')?.classList.add('relation-main');
  if(!S.project){
    q('#left-panel-inner').innerHTML=`<div class="empty" style="padding:40px 10px"><div class="ei">${I.relation}</div><p style="text-align:center">เลือกโปรเจกต์ก่อน</p></div>`;
    q('#main-inner').innerHTML=`<div class="empty" style="margin-top:80px"><div class="ei">${I.relation}</div><h3>Relations</h3><p>กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    return;
  }
  const types = await api.relation.getTypes();
  let lh = `<div class="ph"><h4>ประเภทความสัมพันธ์</h4><button class="btn btn-g btn-i" onclick="openRelTypeModal()">${I.plus}</button></div>`;
  if(!types.length) lh += `<p style="font-size:12px;color:var(--t3);padding:10px 12px">ยังไม่มีประเภท</p>`;
  for(const t of types){
    const color = t.color_code || '#6366f1';
    lh += `<div class="li" onclick="openRelTypeModal(${t.id})">
      <span class="dot" style="background:${color}"></span>
      <span class="name">${x(t.relation_name)}</span>
      <div class="acts"><button class="btn btn-g btn-i" onclick="event.stopPropagation();openRelTypeModal(${t.id})">${I.edit}</button><button class="btn btn-g btn-i" onclick="event.stopPropagation();delRelType(${t.id})" style="color:var(--danger)">${I.delete}</button></div>
    </div>`;
  }
  q('#left-panel-inner').innerHTML = lh;

  const viewMode = S.relTab||0;
  let h = `<div class="ch">
    <h2>Node Whiteboard</h2>
    <div class="rel-view-btns">
      <button class="btn ${viewMode===0?'btn-p':'btn-s'}" onclick="switchRelViewMode(0)">Category View</button>
      <button class="btn ${viewMode===1?'btn-p':'btn-s'}" onclick="switchRelViewMode(1)">Object View</button>
      <button class="btn ${viewMode===2?'btn-p':'btn-s'}" onclick="switchRelViewMode(2)">Project View</button>
    </div>
  </div>`;

  if(viewMode===0){
    const cats = await api.category.getAll(S.project.id);
    const selCatId = cats.find(c=>c.id===S.relCatId)?.id || cats[0]?.id;
    S.relCatId = selCatId || null;
    const catOpts = cats.map(c=>`<option value="${c.id}" ${c.id===selCatId?'selected':''}>${x(c.category_name)}</option>`).join('');
    h += `<div class="rel-toolbar">
      <select id="rel-cat-select" onchange="updateRelCategoryView(this.value)">
        ${catOpts || '<option value="">-- ยังไม่มี Category --</option>'}
      </select>
      <button class="btn btn-p" style="padding:6px 12px;font-size:12.5px" onclick="openRelModal(0)">${I.plus} เพิ่มความสัมพันธ์</button>
    </div>
    <div id="wb-container" class="rel-whiteboard">
      <svg id="wb-svg" class="rel-svg"></svg>
      <div id="wb-nodes" class="rel-nodes"></div>
    </div>
    <div class="rel-list-slider" onmousedown="startRelListResize(event)" title="Drag to resize relation list"></div>
    <div class="rel-underboard">
      <div class="ph">
        <h4>ความสัมพันธ์ที่กำลังแสดงอยู่</h4>
        <div class="acts">
          <button class="btn btn-g" onclick="openRelModal(0)">${I.plus} Object ↔ Object</button>
          <button class="btn btn-g" onclick="openRelModal(1)">${I.plus} Object ↔ Event</button>
          <button class="btn btn-g" onclick="openRelModal(2)">${I.plus} Event ↔ Event</button>
        </div>
      </div>
      <div id="rel-list" class="rel-list"></div>
    </div>`;
    if(selCatId) setTimeout(async()=>{ await renderCategoryWhiteboard(selCatId); },10);
  } else if(viewMode===1) {
    const objs = await api.relation.getProjectObjects(S.project.id);
    const objOpts = objs.map(o=>`<option value="${o.id}">${x(o.category_name)} / ${x(o.name)}</option>`).join('');
    const selObjId = S.relObjId||objs[0]?.id;
    h += `<div class="rel-toolbar">
      <select id="obj-select" onchange="updateRelObjectView(this.value)">
        <option value="">-- เลือก Object --</option>${objOpts}
      </select>
      <button class="btn btn-p" style="padding:6px 12px;font-size:12.5px" onclick="openRelModal(0)">${I.plus} เพิ่มความสัมพันธ์</button>
    </div>
    <div id="wb-container" class="rel-whiteboard">
      <svg id="wb-svg" class="rel-svg"></svg>
      <div id="wb-nodes" class="rel-nodes"></div>
    </div>
    <div class="rel-list-slider" onmousedown="startRelListResize(event)" title="Drag to resize relation list"></div>
    <div class="rel-underboard">
      <div class="ph">
        <h4>ความสัมพันธ์ที่กำลังแสดงอยู่</h4>
        <div class="acts">
          <button class="btn btn-g" onclick="openRelModal(0)">${I.plus} Object ↔ Object</button>
          <button class="btn btn-g" onclick="openRelModal(1)">${I.plus} Object ↔ Event</button>
          <button class="btn btn-g" onclick="openRelModal(2)">${I.plus} Event ↔ Event</button>
        </div>
      </div>
      <div id="rel-list" class="rel-list"></div>
    </div>`;
    if(selObjId) setTimeout(async()=>{ await renderObjectWhiteboard(selObjId); q('#obj-select').value=selObjId; },10);
  } else {
    h += `<div class="rel-toolbar">
      <div style="font-size:12.5px;color:var(--t2)">แสดง Object ทั้งหมดในโปรเจกต์: <b>${x(S.project.name||'')}</b></div>
      <button class="btn btn-p" style="padding:6px 12px;font-size:12.5px" onclick="openRelModal(0)">${I.plus} เพิ่มความสัมพันธ์</button>
    </div>
    <div id="wb-container" class="rel-whiteboard">
      <svg id="wb-svg" class="rel-svg"></svg>
      <div id="wb-nodes" class="rel-nodes"></div>
    </div>
    <div class="rel-list-slider" onmousedown="startRelListResize(event)" title="Drag to resize relation list"></div>
    <div class="rel-underboard">
      <div class="ph">
        <h4>ความสัมพันธ์ที่กำลังแสดงอยู่</h4>
        <div class="acts">
          <button class="btn btn-g" onclick="openRelModal(0)">${I.plus} Object ↔ Object</button>
          <button class="btn btn-g" onclick="openRelModal(1)">${I.plus} Object ↔ Event</button>
          <button class="btn btn-g" onclick="openRelModal(2)">${I.plus} Event ↔ Event</button>
        </div>
      </div>
      <div id="rel-list" class="rel-list"></div>
    </div>`;
    setTimeout(async()=>{ await renderProjectWhiteboard(S.project.id); },10);
  }
  q('#main-inner').innerHTML = h;
  applyRelListHeight();
}

async function renderCategoryWhiteboard(catId){
  const selectedCatId = parseInt(catId,10);
  S.relCatId = selectedCatId;
  const objs = await api.object.getAll(selectedCatId);
  const rels = await api.relation.getOBOB(S.project.id);
  const projectObjs = await api.relation.getProjectObjects(S.project.id);
  const byKey = new Map(projectObjs.map(o=>[`${o.category_name}::${o.name}`,o.id]));
  const objIdSet = new Set(objs.map(o=>o.id));
  if(!nodeState.catView[selectedCatId]) nodeState.catView[selectedCatId]={};
  const positions = nodeState.catView[selectedCatId];
  const radius=150, cx=300, cy=200, anglePerNode=Math.PI*2/Math.max(objs.length,1);
  objs.forEach((o,i)=>{ if(!positions[o.id]) positions[o.id]={x:cx+Math.cos(i*anglePerNode)*radius, y:cy+Math.sin(i*anglePerNode)*radius}; });
  // Build graph data for React Force Graph
  const nodes = objs.map(o=>({ id: `obj-${o.id}`, origId:o.id, name: x(o.name), color: o.color_code||o.category_color_code||'#6366f1' }));
  const nodeIdSet = new Set(nodes.map(n=>n.id));
  const links = [];
  for(const rel of rels){
    const fromId=byKey.get(`${rel.from_cat}::${rel.from_name}`), toId=byKey.get(`${rel.to_cat}::${rel.to_name}`);
    if(!objIdSet.has(fromId)||!objIdSet.has(toId)) continue;
    const src = `obj-${fromId}`, dst = `obj-${toId}`;
    if(!nodeIdSet.has(src) || !nodeIdSet.has(dst)) continue;
    links.push({ source: src, target: dst, name: rel.relation_name||'', color: rel.color_code||'#999' });
  }
  await renderForceGraph({ nodes, links }, { onNodeClick: n => openObjectModal(null, n.origId) });
  renderRelList(rels.filter(rel=>{
    const fromId=byKey.get(`${rel.from_cat}::${rel.from_name}`);
    const toId=byKey.get(`${rel.to_cat}::${rel.to_name}`);
    return objIdSet.has(fromId) && objIdSet.has(toId);
  }).map(r=>({ ...r, kind:'obob' })));
  ensureWbViewState('cat', selectedCatId);
  bindWhiteboardInteractions('cat', selectedCatId);
}

async function renderObjectWhiteboard(objId){
  const selectedObjId = parseInt(objId,10); S.relObjId=selectedObjId;
  const allObjs = await api.relation.getProjectObjects(S.project.id);
  const selObj  = allObjs.find(o=>o.id===selectedObjId);
  const rels    = await api.relation.getOBOB(S.project.id);
  const tlRels  = await api.relation.getOBTL(S.project.id);
  const objByKey= new Map(allObjs.map(o=>[`${o.category_name}::${o.name}`,o]));
  const connected = rels.filter(r=>{
    const from=objByKey.get(`${r.from_cat}::${r.from_name}`), to=objByKey.get(`${r.to_cat}::${r.to_name}`);
    return from?.id===selectedObjId||to?.id===selectedObjId;
  });
  const relObjMap=new Map();
  for(const r of connected){
    const from=objByKey.get(`${r.from_cat}::${r.from_name}`), to=objByKey.get(`${r.to_cat}::${r.to_name}`);
    const peer=from?.id===selectedObjId?to:from;
    if(peer) relObjMap.set(peer.id, peer);
  }
  const relObjs  = Array.from(relObjMap.values());
  const myTlRels = tlRels.filter(r=>{ const from=objByKey.get(`${r.from_cat}::${r.from_name}`); return from?.id===selectedObjId; });
  const tlNodes  = myTlRels.map((r,i)=>({ id:`tl-${i}-${r.id}`, name:r.to_name||'Event', type:'timeline', color_code:r.color_code||'#06b6d4', relation_name:r.relation_name||'', date_text:fmtDate(r.s_day,r.s_month,r.s_years,0,0) }));
  if(!nodeState.objView[selectedObjId]) nodeState.objView[selectedObjId]={};
  const positions = nodeState.objView[selectedObjId];
  if(!positions[selectedObjId]) positions[selectedObjId]={x:300,y:200};
  const radius=120, cx=300, cy=200;
  const aroundNodes=[...relObjs,...tlNodes];
  const anglePerNode=(2*Math.PI)/Math.max(aroundNodes.length,1);
  aroundNodes.forEach((o,i)=>{ if(!positions[o.id]) positions[o.id]={x:cx+Math.cos(i*anglePerNode)*radius, y:cy+Math.sin(i*anglePerNode)*radius}; });
  // Build graph data for React Force Graph (center node + peers + timeline nodes)
  const nodes = [];
  const centerId = `obj-${selectedObjId}`;
  nodes.push({ id: centerId, origId: selectedObjId, name: x(selObj?.name||''), color: selObj?.category_color_code||'#6366f1', size: 12 });
  for(const o of relObjs){ nodes.push({ id: `obj-${o.id}`, origId:o.id, name: x(o.name), color: o.category_color_code||'#6366f1', size:8 }); }
  for(const t of tlNodes){ nodes.push({ id: t.id, origId:null, name: t.name, color: t.color_code||'#06b6d4', size:8 }); }
  const nodeIdSet = new Set(nodes.map(n=>n.id));
  const links = [];
  for(const r of connected){
    const from=objByKey.get(`${r.from_cat}::${r.from_name}`), to=objByKey.get(`${r.to_cat}::${r.to_name}`);
    const peer = from?.id===selectedObjId?to:from; if(!peer) continue;
    const src = centerId, dst = `obj-${peer.id}`; if(!nodeIdSet.has(dst)) continue;
    links.push({ source: src, target: dst, name: r.relation_name||'', color: r.color_code||'#999' });
  }
  for(const r of myTlRels){
    const tlNode = tlNodes.find(t=>t.name===r.to_name&&t.relation_name===r.relation_name); if(!tlNode) continue;
    const dst = tlNode.id; if(!nodeIdSet.has(dst)) continue;
    links.push({ source: centerId, target: dst, name: r.relation_name||'', color: r.color_code||'#06b6d4', dashed:true });
  }
  await renderForceGraph({ nodes, links }, { onNodeClick: n => { if(n.origId) openObjectModal(null, n.origId); } });
  renderRelList([
    ...connected.map(r=>({ ...r, kind:'obob' })),
    ...myTlRels.map(r=>({ ...r, kind:'obtl' }))
  ]);
  ensureWbViewState('obj', selectedObjId);
  bindWhiteboardInteractions('obj', selectedObjId);
}

async function renderProjectWhiteboard(projectId){
  const allObjs = await api.relation.getProjectObjects(projectId);
  const rels = await api.relation.getOBOB(projectId);
  const objByKey = new Map(allObjs.map(o=>[`${o.category_name}::${o.name}`, o]));
  const objIdSet = new Set(allObjs.map(o=>o.id));
  if(!nodeState.projectView[projectId]) nodeState.projectView[projectId]={};
  const positions = nodeState.projectView[projectId];
  const radius=170, cx=300, cy=200, anglePerNode=(2*Math.PI)/Math.max(allObjs.length,1);
  allObjs.forEach((o,i)=>{
    if(!positions[o.id]) positions[o.id]={ x:cx+Math.cos(i*anglePerNode)*radius, y:cy+Math.sin(i*anglePerNode)*radius };
  });
  // Build graph data for project view
  const nodes = allObjs.map(o=>({ id:`obj-${o.id}`, origId:o.id, name:x(o.name), color:o.category_color_code||'#6366f1' }));
  const nodeIdSet = new Set(nodes.map(n=>n.id));
  const links = [];
  for(const r of rels){
    const from=objByKey.get(`${r.from_cat}::${r.from_name}`);
    const to=objByKey.get(`${r.to_cat}::${r.to_name}`);
    if(!from || !to || !objIdSet.has(from.id) || !objIdSet.has(to.id)) continue;
    const src=`obj-${from.id}`, dst=`obj-${to.id}`; if(!nodeIdSet.has(src) || !nodeIdSet.has(dst)) continue;
    links.push({ source: src, target: dst, name: r.relation_name||'', color: r.color_code||'#999' });
  }
  await renderForceGraph({ nodes, links }, { onNodeClick: n => openObjectModal(null, n.origId) });
  renderRelList(rels.map(r=>({ ...r, kind:'obob' })));
  ensureWbViewState('proj', projectId);
  bindWhiteboardInteractions('proj', projectId);
}

let dragState=null;
let panState=null;
let wbResizeState=null;
let relListResizeState=null;

function applyRelListHeight(){
  const listPanel = q('.relation-main .rel-underboard');
  if(!listPanel) return;
  if(S.relListHeight){
    listPanel.style.flex = `0 0 ${S.relListHeight}px`;
    listPanel.style.height = `${S.relListHeight}px`;
  } else {
    listPanel.style.flex = '';
    listPanel.style.height = '';
  }
}

function startRelListResize(e){
  if(e.button !== 0) return;
  const listPanel = q('.relation-main .rel-underboard');
  const graphPanel = q('#wb-container');
  if(!listPanel || !graphPanel) return;
  e.preventDefault();
  const listRect = listPanel.getBoundingClientRect();
  const graphRect = graphPanel.getBoundingClientRect();
  q('#main-inner')?.classList.add('is-rel-list-resizing');
  relListResizeState = {
    startY:e.clientY,
    startListH:listRect.height,
    startGraphH:graphRect.height,
  };
}

function getWbViewStore(viewType){
  if(viewType==='cat') return wbViewState.catView;
  if(viewType==='obj') return wbViewState.objView;
  return wbViewState.projectView;
}
function ensureWbViewState(viewType,viewId){
  const store = getWbViewStore(viewType);
  if(!store[viewId]) store[viewId] = { scale:1, tx:0, ty:0, width:null, height:null };
  return store[viewId];
}
function applyWhiteboardSize(viewType,viewId){
  const c = q('#wb-container');
  if(!c) return;
  const t = ensureWbViewState(viewType, viewId);
  c.style.flex = t.width || t.height ? '0 0 auto' : '';
  c.style.width = t.width ? `${t.width}px` : '';
  c.style.height = t.height ? `${t.height}px` : '';
}
function applyWhiteboardTransform(viewType,viewId){
  const t = ensureWbViewState(viewType, viewId);
  const svg = q('#wb-svg');
  const nodes = q('#wb-nodes');
  if(!svg || !nodes) return;
  const transform = `translate(${t.tx}px, ${t.ty}px) scale(${t.scale})`;
  svg.style.transformOrigin = '0 0';
  nodes.style.transformOrigin = '0 0';
  svg.style.transform = transform;
  nodes.style.transform = transform;
}
function bindWhiteboardInteractions(viewType,viewId){
  const c = q('#wb-container');
  if(!c) return;
  applyWhiteboardSize(viewType, viewId);
  c.oncontextmenu = (e)=>e.preventDefault();
  c.onwheel = (e)=>{
    e.preventDefault();
    const t = ensureWbViewState(viewType, viewId);
    const rect = c.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const oldScale = t.scale;
    const step = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.3, Math.min(3, oldScale * step));
    const worldX = (px - t.tx) / oldScale;
    const worldY = (py - t.ty) / oldScale;
    t.scale = newScale;
    t.tx = px - worldX * newScale;
    t.ty = py - worldY * newScale;
    applyWhiteboardTransform(viewType, viewId);
  };
  c.onmousedown = (e)=>{
    if(e.button!==2) return;
    e.preventDefault();
    c.classList.add('is-panning');
    panState = { viewType, viewId, startX:e.clientX, startY:e.clientY };
  };
  const resizeHandle = c.querySelector('.rel-resize-handle');
  if(resizeHandle){
    resizeHandle.onmousedown = (e)=>{
      if(e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = c.getBoundingClientRect();
      c.classList.add('is-resizing');
      wbResizeState = {
        viewType,
        viewId,
        startX:e.clientX,
        startY:e.clientY,
        startW:rect.width,
        startH:rect.height,
        maxW:Math.max(420, c.parentElement?.clientWidth || rect.width),
      };
    };
  }
}

function startNodeDrag(e,objId,viewType,viewId){
  if(e.button!==0) return;
  e.preventDefault();
  dragState={objId,viewType,viewId,startX:e.clientX,startY:e.clientY};
}
document.addEventListener('mousemove',function(e){
  if(relListResizeState){
    const listPanel = q('.relation-main .rel-underboard');
    const graphPanel = q('#wb-container');
    if(listPanel && graphPanel){
      const delta = relListResizeState.startY - e.clientY;
      const nextListH = Math.max(180, Math.min(760, relListResizeState.startListH + delta));
      const nextGraphH = Math.max(220, relListResizeState.startGraphH - delta);
      S.relListHeight = Math.round(nextListH);
      listPanel.style.flex = `0 0 ${S.relListHeight}px`;
      listPanel.style.height = `${S.relListHeight}px`;
      graphPanel.style.flex = '0 0 auto';
      graphPanel.style.height = `${Math.round(nextGraphH)}px`;
    }
    return;
  }
  if(wbResizeState){
    const c = q('#wb-container');
    if(c){
      const t = ensureWbViewState(wbResizeState.viewType, wbResizeState.viewId);
      const nextW = Math.max(360, Math.min(wbResizeState.maxW, wbResizeState.startW + e.clientX - wbResizeState.startX));
      const nextH = Math.max(260, Math.min(1000, wbResizeState.startH + e.clientY - wbResizeState.startY));
      t.width = Math.round(nextW);
      t.height = Math.round(nextH);
      applyWhiteboardSize(wbResizeState.viewType, wbResizeState.viewId);
    }
    return;
  }
  if(panState){
    const t = ensureWbViewState(panState.viewType, panState.viewId);
    t.tx += e.clientX - panState.startX;
    t.ty += e.clientY - panState.startY;
    panState.startX = e.clientX; panState.startY = e.clientY;
    applyWhiteboardTransform(panState.viewType, panState.viewId);
  }
  if(dragState){
    const viewKey = dragState.viewType==='cat' ? 'catView' : (dragState.viewType==='obj' ? 'objView' : 'projectView');
    const pos=nodeState[viewKey][dragState.viewId]||{};
    if(!pos[dragState.objId]) pos[dragState.objId]={x:0,y:0};
    const t = ensureWbViewState(dragState.viewType, dragState.viewId);
    const scale = t.scale || 1;
    pos[dragState.objId].x+=(e.clientX-dragState.startX)/scale;
    pos[dragState.objId].y+=(e.clientY-dragState.startY)/scale;
    dragState.startX=e.clientX; dragState.startY=e.clientY;
    const node=q(`[data-obj-id="${dragState.objId}"]`);
    if(node){
      node.style.left=pos[dragState.objId].x+'px'; node.style.top=pos[dragState.objId].y+'px';
    }
    const { viewType, viewId } = dragState;
    if(viewType==='cat') setTimeout(()=>renderCategoryWhiteboard(viewId),0);
    else if(viewType==='obj') setTimeout(()=>renderObjectWhiteboard(viewId),0);
    else setTimeout(()=>renderProjectWhiteboard(viewId),0);
  }
});
document.addEventListener('mouseup',function(){
  if(relListResizeState){
    relListResizeState = null;
    q('#main-inner')?.classList.remove('is-rel-list-resizing');
    return;
  }
  if(wbResizeState){
    const { viewType, viewId } = wbResizeState;
    wbResizeState = null;
    q('#wb-container')?.classList.remove('is-resizing');
    if(viewType==='cat') setTimeout(()=>renderCategoryWhiteboard(viewId),0);
    else if(viewType==='obj') setTimeout(()=>renderObjectWhiteboard(viewId),0);
    else setTimeout(()=>renderProjectWhiteboard(viewId),0);
    return;
  }
  dragState=null;
});

async function selectMap(id){
  const maps = await api.map.getAll(S.project.id);
  S.map = maps.find(m => m.id === id) || null;
  S.mapAreaId = null;
  await renderMapView();
}
function selectMapArea(id){ S.mapAreaId=id; renderMapView(); }
function setMapTool(tool){ S.mapTool=tool; renderMapView(); }

function ensureKonva(){
  if(window.Konva) return Promise.resolve();
  if(window.__konvaLoading) return new Promise(resolve=>{ const iv=setInterval(()=>{ if(window.Konva){ clearInterval(iv); resolve(); } },50); });
  window.__konvaLoading = true;
  return new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/konva@9/konva.min.js';
    s.onload = ()=>{ window.__konvaLoading = false; resolve(); };
    s.onerror = ()=>{ window.__konvaLoading = false; reject(new Error('Failed to load Konva')); };
    document.body.appendChild(s);
  });
}

async function renderMapView(){
  if(!S.project){
    q('#left-panel-inner').innerHTML=`<div class="empty" style="padding:40px 10px"><div class="ei">${I.map}</div><p style="text-align:center">กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    q('#main-inner').innerHTML=`<div class="empty" style="margin-top:80px"><div class="ei">${I.map}</div><h3>Mapping</h3><p>กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    return;
  }
  await ensureKonva();
  const maps = await api.map.getAll(S.project.id);
  let lh = `<div class="ph"><h4>Map</h4><button class="btn btn-g btn-i" onclick="openMapModal()">${I.plus}</button></div>`;
  for(const m of maps){
    const col=m.color_code||'#06b6d4', act=S.map?.id===m.id;
    lh += `<div class="li ${act?'active':''}" onclick="selectMap(${m.id})"><div class="dot" style="background:${col}"></div><span class="name">${x(m.map_name||'ไม่มีชื่อ')}</span><div class="acts"><button class="btn btn-g btn-i" onclick="event.stopPropagation();openMapModal(${m.id})">${I.edit}</button><button class="btn btn-g btn-i" onclick="event.stopPropagation();delMap(${m.id})" style="color:var(--danger)">${I.delete}</button></div></div>`;
  }
  if(!maps.length) lh += `<p style="font-size:12px;color:var(--t3);padding:10px 12px">ยังไม่มี Map</p>`;
  q('#left-panel-inner').innerHTML = lh;

  if(!S.map){
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px"><div class="ei">${I.map}</div><h3>ยังไม่มี Map</h3><button class="btn btn-p" onclick="openMapModal()">${I.plus} สร้าง Map</button></div>`;
    return;
  }
  const areas = await api.map.getAreas(S.map.id);
  if(S.mapAreaId && !areas.find(a=>a.id===S.mapAreaId)) S.mapAreaId = null;
  let h = `<div class="ch"><h2>${x(S.map.map_name||'Map')}</h2><button class="btn btn-s btn-i" onclick="openMapModal(${S.map.id})">${I.edit}</button></div>
  <div class="rel-toolbar">
    <button class="btn ${S.mapTool==='create'?'btn-p':'btn-s'}" onclick="setMapTool('create')">Create</button>
    <button class="btn ${S.mapTool==='delete'?'btn-p':'btn-s'}" onclick="setMapTool('delete')">Delete</button>
    <button class="btn ${S.mapTool==='move'?'btn-p':'btn-s'}" onclick="setMapTool('move')">Move</button>
    <span style="font-size:12px;color:var(--t3)">ต้องเลือก Area ก่อนใช้ Tool</span>
  </div>
  <div id="map-board" class="map-whiteboard">
    <div id="map-konva-container" style="width:100%; height:100%;"></div>
  </div>
  <div class="rel-underboard">
    <div class="ph"><h4>Area</h4><div class="acts"><button class="btn btn-g" onclick="openMapAreaModal()">${I.plus} เพิ่ม Area</button></div></div>
    <div class="map-area-list">${renderAreaList(areas)}</div>
  </div>`;
  q('#main-inner').innerHTML = h;
  await renderMapBoard();
}

function getMapViewState(mapId){
  if(!mapState.viewByMap[mapId]) mapState.viewByMap[mapId] = { scale:1, tx:0, ty:0 };
  return mapState.viewByMap[mapId];
}

async function renderMapBoard(){
  if(!S.map) return;
  const areas = await api.map.getAreas(S.map.id);
  for(const a of areas) mapState.pointsByArea[a.id] = await api.map.getPoints(a.id);
  
  const container = q('#map-konva-container');
  if(!container) return;

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 540;
  
  const v = getMapViewState(S.map.id);
  
  if (konvaStage) {
    try { konvaStage.destroy(); } catch(e){}
  }

  const boardEl = q('#map-board');
  if (boardEl) {
    boardEl.oncontextmenu = (e)=>e.preventDefault();
  }

  konvaStage = new Konva.Stage({
    container: 'map-konva-container',
    width: width,
    height: height,
  });

  const layer = new Konva.Layer();
  konvaStage.add(layer);

  konvaStage.scale({ x: v.scale, y: v.scale });
  konvaStage.position({ x: v.tx, y: v.ty });

  for(const area of areas){
    const pts = mapState.pointsByArea[area.id] || [];
    const color = area.color_code || '#06b6d4';
    const isActiveArea = S.mapAreaId === area.id;

    let poly = null;
    if(pts.length >= 2){
      poly = new Konva.Line({
        points: pts.map(p => [p.x, p.y]).flat(),
        fill: pts.length >= 3 ? color : 'transparent',
        opacity: pts.length >= 3 ? 0.18 : 0,
        stroke: color,
        strokeWidth: 2 / v.scale,
        closed: true,
      });
      poly.on('click tap', (e) => {
        if(e.evt.button === 0){
          e.cancelBubble = true;
          selectMapArea(area.id);
        }
      });
      layer.add(poly);
    }

    for(const p of pts){
      const circle = new Konva.Circle({
        x: p.x,
        y: p.y,
        radius: (isActiveArea ? 7 : 5) / v.scale,
        fill: isActiveArea ? '#ffffff' : color,
        stroke: color,
        strokeWidth: 2 / v.scale,
        draggable: S.mapTool === 'move' && isActiveArea,
        areaId: area.id,
      });

      circle.on('dragmove', (e) => {
        const newPos = circle.position();
        p.x = newPos.x;
        p.y = newPos.y;
        if(poly) {
          poly.points(pts.map(pt => [pt.x, pt.y]).flat());
        }
        layer.batchDraw();
      });

      circle.on('dragend', () => {
        api.map.setPoints(area.id, pts).then(() => {
          const list = q('.map-area-list');
          if(list) list.innerHTML = renderAreaList(areas);
        });
      });

      circle.on('click tap', (e) => {
        if(e.evt.button === 0){
          e.cancelBubble = true;
          if(S.mapTool === 'delete'){
            const idx = pts.indexOf(p);
            if(idx >= 0){
              pts.splice(idx, 1);
              api.map.setPoints(area.id, pts).then(renderMapBoard);
            }
          } else {
            selectMapArea(area.id);
          }
        }
      });

      layer.add(circle);
    }
  }

  let isPanning = false;
  let startPos = { x: 0, y: 0 };

  konvaStage.on('mousedown', (e) => {
    if (e.evt.button === 2) {
      isPanning = true;
      startPos = { x: e.evt.clientX, y: e.evt.clientY };
      q('#map-board')?.classList.add('is-panning');
    }
  });

  konvaStage.on('mousemove', (e) => {
    if (isPanning) {
      const dx = e.evt.clientX - startPos.x;
      const dy = e.evt.clientY - startPos.y;
      startPos = { x: e.evt.clientX, y: e.evt.clientY };
      const newPos = {
        x: konvaStage.x() + dx,
        y: konvaStage.y() + dy,
      };
      konvaStage.position(newPos);
      v.tx = newPos.x;
      v.ty = newPos.y;
      layer.batchDraw();
    }
  });

  konvaStage.on('click tap', (e) => {
    if (e.evt.button !== 0) return;
    if (e.target === konvaStage) {
      if (!S.mapAreaId) {
        toast('เลือก Area ก่อนใช้งาน Tool', 'err');
        return;
      }
      const pointer = konvaStage.getPointerPosition();
      const wx = (pointer.x - konvaStage.x()) / konvaStage.scaleX();
      const wy = (pointer.y - konvaStage.y()) / konvaStage.scaleX();
      const points = mapState.pointsByArea[S.mapAreaId] || [];

      if (S.mapTool === 'create') {
        points.push({ x: wx, y: wy });
        mapState.pointsByArea[S.mapAreaId] = points;
        api.map.setPoints(S.mapAreaId, points).then(renderMapBoard);
      }
    }
  });

  konvaStage.on('wheel', (e) => {
    e.evt.preventDefault();
    const oldScale = konvaStage.scaleX();
    const pointer = konvaStage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - konvaStage.x()) / oldScale,
      y: (pointer.y - konvaStage.y()) / oldScale,
    };

    const step = e.evt.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.3, Math.min(4, oldScale * step));

    konvaStage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    konvaStage.position(newPos);
    v.scale = newScale;
    v.tx = newPos.x;
    v.ty = newPos.y;

    layer.getChildren().forEach((node) => {
      if (node instanceof Konva.Circle) {
        const isActive = S.mapAreaId === node.attrs.areaId;
        node.radius((isActive ? 7 : 5) / newScale);
        node.strokeWidth(2 / newScale);
      } else if (node instanceof Konva.Line) {
        node.strokeWidth(2 / newScale);
      }
    });

    layer.batchDraw();
  });

  const cleanupPan = () => {
    if (isPanning) {
      isPanning = false;
      q('#map-board')?.classList.remove('is-panning');
    }
  };
  window.removeEventListener('mouseup', cleanupPan);
  window.addEventListener('mouseup', cleanupPan);

  layer.batchDraw();
}

async function openMapModal(id=null){
  let m=null;
  if(id){ const maps=await api.map.getAll(S.project.id); m=maps.find(t=>t.id===id); }
  openModal(m?'✏️ แก้ไข Map':'🧭 Map ใหม่',`
    <div class="fg"><label>ชื่อ Map *</label><input id="map-n" value="${x(m?.map_name||'')}"></div>
    <div class="fg"><label>สี</label>${await colorPicker(m?.color)}</div>
    <div class="mfoot">${m?`<button class="btn btn-d" onclick="delMap(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${m?'saveMap('+id+')':'createMap()'}">${m?'บันทึก':'สร้าง'}</button></div>`);
}
async function createMap(){ const n=q('#map-n').value.trim(); if(!n) return; const r=await api.map.create(S.project.id,n,q('#sel-color').value||null); closeModal(); const maps=await api.map.getAll(S.project.id); S.map=maps.find(t=>t.id===r.lastInsertRowid)||null; await renderMapView(); toast('สร้าง Map แล้ว','ok'); }
async function saveMap(id){ const n=q('#map-n').value.trim(); if(!n) return; await api.map.update(id,n,q('#sel-color').value||null); closeModal(); const maps=await api.map.getAll(S.project.id); S.map=maps.find(t=>t.id===id)||null; await renderMapView(); toast('บันทึกแล้ว','ok'); }
async function delMap(id){ if(!confirm('ลบ Map นี้?')) return; await api.map.delete(id); closeModal(); if(S.map?.id===id) S.map=null; S.mapAreaId=null; await renderMapView(); toast('ลบเรียบร้อยแล้ว'); }

async function openMapAreaModal(id=null){
  if(!S.map) return;
  const areas = await api.map.getAreas(S.map.id);
  const a = id ? areas.find(v=>v.id===id) : null;
  openModal(a?'✏️ แก้ไข Area':'🧩 Area ใหม่',`
    <div class="fg"><label>ชื่อ Area *</label><input id="area-n" value="${x(a?.area_name||'')}"></div>
    <div class="fg"><label>สี</label>${await colorPicker(a?.color)}</div>
    <div class="mfoot">${a?`<button class="btn btn-d" onclick="delMapArea(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${a?'saveMapArea('+id+')':'createMapArea()'}">${a?'บันทึก':'สร้าง'}</button></div>`);
}
async function createMapArea(){ const n=q('#area-n').value.trim(); if(!n || !S.map) return; const r=await api.map.createArea(S.map.id,n,q('#sel-color').value||null); closeModal(); S.mapAreaId=r.lastInsertRowid; mapState.pointsByArea[S.mapAreaId]=[]; await renderMapView(); toast('สร้าง Area แล้ว','ok'); }
async function saveMapArea(id){ const n=q('#area-n').value.trim(); if(!n) return; await api.map.updateArea(id,n,q('#sel-color').value||null); closeModal(); await renderMapView(); toast('บันทึกแล้ว','ok'); }
async function delMapArea(id){ if(!confirm('ลบ Area นี้?')) return; await api.map.deleteArea(id); closeModal(); if(S.mapAreaId===id) S.mapAreaId=null; delete mapState.pointsByArea[id]; await renderMapView(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ HASHTAG VIEW ══════════════════════════════════════
async function renderHashtagView(){
  q('#left-panel-inner').innerHTML=`<div class="ph"><h4>ป้ายกำกับ</h4></div><div class="empty" style="padding:30px 10px"><div class="ei" style="font-size:28px;opacity:.3">🏷️</div></div>`;
  const tags=await api.hashtag.getAll();
  let h=`<div class="ch"><h2>🏷️ ป้ายกำกับ</h2><button class="btn btn-p" onclick="openHashtagModal()">+ เพิ่ม Tag</button></div>`;
  if(!tags.length){ h+=`<div class="empty"><div class="ei">🏷️</div><h3>ยังไม่มี Tag</h3></div>`; }
  else {
    h+=`<div class="htags-grid">`;
    for(const t of tags){
      const col=t.color_code||'#6366f1';
      h+=`<div class="htag-item" id="tag-item-${t.id}" style="--tc:${col}"><span class="hn">#${x(t.tag_name)}</span><button class="btn btn-g btn-i" onclick="openHashtagModal(${t.id})" style="opacity:.6;color:var(--tc)">✏️</button></div>`;
    }
    h+=`</div>`;
  }
  q('#main-inner').innerHTML=h;
}

// ═══ COLOR SETTINGS ════════════════════════════════════
let _wheelHue=239, _wheelSat=86, _wheelLight=67, _wheelDragging=false;
function hslToRgb(h,s,l){ s/=100;l/=100; const c=(1-Math.abs(2*l-1))*s,xc=c*(1-Math.abs((h/60)%2-1)),m=l-c/2; let r,g,b; if(h<60){r=c;g=xc;b=0;}else if(h<120){r=xc;g=c;b=0;}else if(h<180){r=0;g=c;b=xc;}else if(h<240){r=0;g=xc;b=c;}else if(h<300){r=xc;g=0;b=c;}else{r=c;g=0;b=xc;} return[Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)]; }
function rgbToHex(r,g,b){ return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''); }
function rgbToHsl(r,g,b){ r/=255;g/=255;b/=255; const max=Math.max(r,g,b),min=Math.min(r,g,b); let h=0,s=0,l=(max+min)/2; if(max!==min){ const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min); if(max===r)h=((g-b)/d+(g<b?6:0))*60; else if(max===g)h=((b-r)/d+2)*60; else h=((r-g)/d+4)*60; } return[h,Math.round(s*100),Math.round(l*100)]; }

async function renderColorSettings(){
  S.colors = await api.color.getAll();
  const paletteHTML = S.colors.map(c=>`<div class="palette-item">
    <div class="palette-swatch" style="background:${c.color_code}"></div>
    <span class="palette-code">${c.color_code}</span>
    <button class="btn btn-g btn-i" onclick="deleteColorSwatch(${c.id})" style="color:var(--danger)" title="ลบสีนี้">❌</button>
  </div>`).join('');
  q('#main-inner').innerHTML=`<div class="ch"><h2>🎨 จัดการสี</h2></div>
    <div class="color-settings-grid">
      <div class="cwheel-section">
        <h3 class="cs-title">Color Wheel</h3>
        <div class="cwheel-wrap">
          <canvas id="color-wheel" width="220" height="220"></canvas>
          <div class="cwheel-indicator" id="wheel-indicator"></div>
        </div>
        <div class="cwheel-preview">
          <div class="cpreview-swatch" id="cpreview-swatch"></div>
          <input id="cpreview-hex" value="#6366f1" spellcheck="false" oninput="onHexInput(this.value)">
          <input type="color" id="cnative-picker" value="#6366f1" oninput="onNativePick(this.value)" title="ตัวเลือกสีระบบ">
        </div>
        <button class="btn btn-p" onclick="addColorFromWheel()" style="width:100%">+ เพิ่มลงพาเลท</button>
      </div>
      <div class="cpalette-section">
        <h3 class="cs-title">ชุดสีทั้งหมด <span class="cs-count">${S.colors.length}</span></h3>
        <div class="palette-grid" id="palette-grid">${paletteHTML}</div>
      </div>
    </div>`;
  initColorWheel(); updateWheelPreview();
}

function initColorWheel(){ const canvas=q('#color-wheel'); if(!canvas) return; drawWheel(canvas); canvas.addEventListener('pointerdown',e=>{_wheelDragging=true;pickFromWheel(e);}); canvas.addEventListener('pointermove',e=>{if(_wheelDragging)pickFromWheel(e);}); canvas.addEventListener('pointerup',()=>{_wheelDragging=false;}); canvas.addEventListener('pointerleave',()=>{_wheelDragging=false;}); }
function drawWheel(canvas){ const ctx=canvas.getContext('2d'),size=canvas.width,cx=size/2,cy=size/2,radius=size/2-6; ctx.clearRect(0,0,size,size); const img=ctx.createImageData(size,size); for(let py=0;py<size;py++){for(let px=0;px<size;px++){const dx=px-cx,dy=py-cy,dist=Math.sqrt(dx*dx+dy*dy); if(dist<=radius){const ang=((Math.atan2(dy,dx)*180/Math.PI)+360)%360,sat=(dist/radius)*100,[r,g,b]=hslToRgb(ang,sat,_wheelLight),i=(py*size+px)*4;img.data[i]=r;img.data[i+1]=g;img.data[i+2]=b;img.data[i+3]=255;}}} ctx.putImageData(img,0,0); ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1.5;ctx.stroke(); positionWheelIndicator(); }
function positionWheelIndicator(){ const ind=q('#wheel-indicator'),canvas=q('#color-wheel'); if(!ind||!canvas) return; const size=canvas.width,cx=size/2,cy=size/2,radius=size/2-6,rad=_wheelHue*Math.PI/180,dist=(_wheelSat/100)*radius; ind.style.left=(cx+Math.cos(rad)*dist)+'px'; ind.style.top=(cy+Math.sin(rad)*dist)+'px'; }
function pickFromWheel(e){ const canvas=q('#color-wheel'),rect=canvas.getBoundingClientRect(),sx=canvas.width/rect.width,sy=canvas.height/rect.height,px=(e.clientX-rect.left)*sx,py=(e.clientY-rect.top)*sy,cx=canvas.width/2,cy=canvas.height/2,radius=canvas.width/2-6,dx=px-cx,dy=py-cy; let dist=Math.sqrt(dx*dx+dy*dy); if(dist>radius)dist=radius; _wheelHue=((Math.atan2(dy,dx)*180/Math.PI)+360)%360; _wheelSat=(dist/radius)*100; updateWheelPreview(); positionWheelIndicator(); }
function updateWheelPreview(){ const [r,g,b]=hslToRgb(_wheelHue,_wheelSat,_wheelLight),hex=rgbToHex(r,g,b); const sw=q('#cpreview-swatch');if(sw){sw.style.background=hex;sw.style.boxShadow=`0 0 16px ${hex}40`;} const hi=q('#cpreview-hex');if(hi)hi.value=hex; const np=q('#cnative-picker');if(np)np.value=hex; }
function onHexInput(val){ if(/^#[0-9a-fA-F]{6}$/.test(val)){const r=parseInt(val.substr(1,2),16),g=parseInt(val.substr(3,2),16),b=parseInt(val.substr(5,2),16),[h,s,l]=rgbToHsl(r,g,b);_wheelHue=h;_wheelSat=s;_wheelLight=l; const canvas=q('#color-wheel');if(canvas)drawWheel(canvas); const sw=q('#cpreview-swatch');if(sw){sw.style.background=val;sw.style.boxShadow=`0 0 16px ${val}40`;} const np=q('#cnative-picker');if(np)np.value=val;} }
function onNativePick(val){ const hi=q('#cpreview-hex');if(hi)hi.value=val; onHexInput(val); }
async function addColorFromWheel(){ const code=q('#cpreview-hex').value.trim(); if(!/^#[0-9a-fA-F]{6}$/.test(code)){toast('รูปแบบสีไม่ถูกต้อง','err');return;} await api.color.add(code); S.colors=await api.color.getAll(); renderColorSettings(); toast('เพิ่มสีเรียบร้อยแล้ว','ok'); }
async function deleteColorSwatch(id){ const result=await api.color.delete(id); if(!result){toast('ไม่สามารถลบได้ -- สีนี้ถูกใช้งานอยู่','err');return;} S.colors=await api.color.getAll(); renderColorSettings(); toast('ลบสีแล้ว','ok'); }

// ═══ MODALS: FOLDER ════════════════════════════════════
async function openFolderModal(id=null){
  const f=id?S.folders.find(f=>f.id===id):null;
  openModal(f?'✏️ แก้ไขโฟลเดอร์':'📁 โฟลเดอร์ใหม่',`
    <div class="fg"><label>ชื่อ *</label><input id="fn" value="${x(f?.name||'')}"></div>
    <div class="fg"><label>รายละเอียด</label><textarea id="fm">${x(f?.folder_memo||'')}</textarea></div>
    <div class="fg"><label>สี</label>${await colorPicker(f?.folder_color)}</div>
    <div class="mfoot">${f?`<button class="btn btn-d" onclick="delFolder(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${f?'saveFolder('+id+')':'createFolder()'}">${f?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#fn').focus(),60);
}
async function createFolder(){ const n=q('#fn').value.trim(); if(!n) return; await api.folder.create(n,q('#fm').value.trim(),q('#sel-color').value||null); closeModal(); await reloadSidebar(); toast('สร้างโฟลเดอร์เรียบร้อยแล้ว','ok'); }
async function saveFolder(id){ const n=q('#fn').value.trim(); if(!n) return; await api.folder.update(id,n,q('#fm').value.trim(),q('#sel-color').value||null); closeModal(); await reloadSidebar(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delFolder(id){ if(!confirm('ลบโฟลเดอร์?')) return; await api.folder.delete(id); closeModal(); await reloadSidebar(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: PROJECT ═══════════════════════════════════
async function openProjectModal(id=null){
  const p=id?await api.project.get(id):null;
  const pTags = p?await api.project.getTags(p.id):[];
  openModal(p?'✏️ แก้ไขโปรเจกต์':'📖 โปรเจกต์ใหม่',`
    <div class="fg"><label>ชื่อนิยาย *</label><input id="pn" value="${x(p?.name||'')}"></div>
    <div class="fg"><label>Codename</label><input id="pc" value="${x(p?.codename||'')}" placeholder="เช่น AAA"></div>
    <div class="fg"><label>รายละเอียด</label><textarea id="pm">${x(p?.project_memo||'')}</textarea></div>
    <div class="fg"><label>โฟลเดอร์</label><select id="pf"><option value="">-- ไม่ระบุ --</option>${S.folders.map(f=>`<option value="${f.id}" ${p?.folder_id===f.id?'selected':''}>${x(f.name)}</option>`).join('')}</select></div>
    <div class="fg"><label>สี</label>${await colorPicker(p?.project_color)}</div>
    ${await hashtagSelector('proj', pTags)}
    <div class="mfoot">${p?`<button class="btn btn-d" onclick="delProject(${id})">ลบโปรเจกต์</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${p?'saveProject('+id+')':'createProject()'}">${p?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#pn').focus(),60);
}
async function createProject(){
  const n=q('#pn').value.trim(); if(!n) return;
  const r=await api.project.create({name:n,codename:q('#pc').value.trim()||null,memo:q('#pm').value.trim(),folderId:q('#pf').value||null,colorId:q('#sel-color').value||null});
  // set tags
  const tags = Array.from(document.querySelectorAll('[id^="proj-tag-"]:checked')).map(i=>parseInt(i.value,10));
  if(r?.lastInsertRowid) await api.project.setTags(r.lastInsertRowid,tags);
  closeModal(); await reloadSidebar(); await selectProject(r.lastInsertRowid); toast('สร้างโปรเจกต์แล้ว','ok');
}
async function saveProject(id){
  const n=q('#pn').value.trim(); if(!n) return;
  await api.project.update(id,{name:n,codename:q('#pc').value.trim()||null,memo:q('#pm').value.trim(),folderId:q('#pf').value||null,colorId:q('#sel-color').value||null});
  const tags = Array.from(document.querySelectorAll('[id^="proj-tag-"]:checked')).map(i=>parseInt(i.value,10));
  await api.project.setTags(id,tags);
  closeModal();
  const updated = await api.project.get(id);
  if(updated){
    const idx = S.projectTabs.findIndex(t => t.id === id);
    if(idx >= 0) S.projectTabs[idx] = tabFromProject(updated);
    if(S.project?.id === id) S.project = updated;
  }
  await reloadSidebar();
  if(S.project?.id === id) await renderProject();
  toast('บันทึกเรียบร้อยแล้ว','ok');
}
async function delProject(id){
  if(!confirm('ลบโปรเจกต์? ข้อมูลทั้งหมดจะหาย')) return;
  const wasActive = S.project?.id === id;
  await api.project.delete(id);
  closeModal();
  S.projectTabs = S.projectTabs.filter(t => t.id !== id);
  await reloadSidebar();
  if(wasActive){
    S.project=null; S.category=null; S.object=null; S.timeline=null; S.map=null; S.mapAreaId=null;
    const next = S.projectTabs[0] || null;
    if(next) await switchProjectTab(next.id);
    else {
      S.activeProjectTabId = null;
      renderProjectTabs();
      renderWelcome();
    }
  } else {
    renderProjectTabs();
  }
  toast('ลบเรียบร้อยแล้ว');
}

// ═══ MODALS: PROJECT DESCRIPTION ═══════════════════════
async function openDescModal(id=null){
  let d=null;
  if(id){ const descs=await api.project.getDesc(S.project.id); d=descs.find(dd=>dd.id===id); }
  openModal(d?'✏️ แก้ไขรายละเอียด':'⭐ เพิ่มรายละเอียด',`
    <div class="fg"><label>ชื่อ Attribute</label><input id="dn" value="${x(d?.attribute_name||'')}" placeholder="เช่น แนวคิด, แรงบันดาลใจ"></div>
    <div class="fg"><label>ข้อความ</label><textarea id="dt" rows="4">${x(d?.attribute_text||'')}</textarea></div>
    <div class="mfoot">${d?`<button class="btn btn-d" onclick="delDesc(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${d?'saveDesc('+id+')':'addDesc()'}">${d?'บันทึก':'เพิ่ม'}</button></div>`);
  setTimeout(()=>q('#dn').focus(),60);
}
async function addDesc(){ const n=q('#dn').value.trim(),t=q('#dt').value.trim(); await api.project.addDesc(S.project.id,n,t); closeModal(); S.descOpen=true; await renderProject(); toast('เพิ่มเรียบร้อยแล้ว','ok'); }
async function saveDesc(id){ const n=q('#dn').value.trim(),t=q('#dt').value.trim(); await api.project.updDesc(id,n,t); closeModal(); await renderProject(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delDesc(id){ if(!confirm('ลบรายละเอียดนี้?')) return; await api.project.delDesc(id); closeModal(); await renderProject(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: CATEGORY ══════════════════════════════════
async function openCategoryModal(id=null){
  if(!S.project) return;
  let cat=null;
  if(id){ const cats=await api.category.getAll(S.project.id); cat=cats.find(c=>c.id===id); }
  openModal(cat?'✏️ แก้ไข Category':'📌 Category ใหม่',`
    <div class="fg"><label>ชื่อ *</label><input id="cn" value="${x(cat?.category_name||'')}"></div>
    <div class="fg"><label>สี</label>${await colorPicker(cat?.color)}</div>
    <div class="mfoot">${cat?`<button class="btn btn-d" onclick="delCategory(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${cat?'saveCategory('+id+')':'createCategory()'}">${cat?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#cn').focus(),60);
}
async function createCategory(){ const n=q('#cn').value.trim(); if(!n) return; await api.category.create(S.project.id,n,q('#sel-color').value||null); closeModal(); const cats=await api.category.getAll(S.project.id); S.category=cats[cats.length-1]; await renderProject(); toast('สร้าง Category เรียบร้อยแล้ว','ok'); }
async function saveCategory(id){ const n=q('#cn').value.trim(); if(!n) return; await api.category.update(id,n,q('#sel-color').value||null); closeModal(); const cats=await api.category.getAll(S.project.id); S.category=cats.find(c=>c.id===id)||cats[0]||null; await renderProject(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delCategory(id){ if(!confirm('ลบ Category? Objects ทั้งหมดจะหายด้วย')) return; await api.category.delete(id); closeModal(); const cats=await api.category.getAll(S.project.id); S.category=cats[0]||null; S.object=null; await renderProject(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: TEMPLATE ══════════════════════════════════
async function openTemplateModal(catId){
  const safeCatId=parseInt(catId,10);
  if(!safeCatId){ toast('Category ไม่ถูกต้อง','err'); return; }
  const tmpls=await api.template.getAll(safeCatId);
  openModal('🧩 จัดการ Fields',`
    <p style="font-size:11.5px;color:var(--t3);margin-bottom:10px">Fields ใช้กับทุก Object ใน Category นี้</p>
    <div class="tlist" id="tlist">${tmpls.map(t=>`<div class="titem" id="tmpl-${t.id}"><span class="tname">${x(t.description)}</span><span class="ttype">${t.attribute_type}</span><button class="btn btn-g btn-i" onclick="delTemplate(${t.id},${safeCatId})" style="color:var(--danger)">❌</button></div>`).join('')||'<p style="color:var(--t3);text-align:center;padding:18px;font-size:12px">ยังไม่มี Field</p>'}</div>
    <div class="div"></div>
    <div style="display:flex;gap:8px;align-items:flex-end">
      <div class="fg" style="flex:1;margin:0"><label>ชื่อ Field</label><input id="tnew" placeholder="เช่น อายุ, พลังพิเศษ"></div>
      <div class="fg" style="margin:0"><label>ประเภท</label><select id="ttype"><option value="text">text</option><option value="textarea">textarea</option><option value="number">number</option></select></div>
      <button class="btn btn-p" onclick="addTemplate(${safeCatId})">+ เพิ่ม</button>
    </div>`);
  setTimeout(()=>q('#tnew').focus(),60);
}
async function addTemplate(catId){
  try{
    const n=q('#tnew').value.trim(); if(!n) return;
    await api.template.create(catId,n,q('#ttype').value);
    q('#tnew').value='';
    const tmpls=await api.template.getAll(catId);
    q('#tlist').innerHTML=tmpls.map(t=>`<div class="titem" id="tmpl-${t.id}"><span class="tname">${x(t.description)}</span><span class="ttype">${t.attribute_type}</span><button class="btn btn-g btn-i" onclick="delTemplate(${t.id},${catId})" style="color:var(--danger)">❌</button></div>`).join('');
    toast('เพิ่ม Field เรียบร้อยแล้ว','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}
async function delTemplate(id,catId){
  try{
    if(!confirm('ลบ Field? ค่าทั้งหมดใน Field นี้จะหาย')) return;
    await api.template.delete(id);
    // Re-fetch templates and re-render list to keep UI consistent
    const tmpls = await api.template.getAll(catId);
    q('#tlist').innerHTML = tmpls.map(t=>`<div class="titem" id="tmpl-${t.id}"><span class="tname">${x(t.description)}</span><span class="ttype">${t.attribute_type}</span><button class="btn btn-g btn-i" onclick="delTemplate(${t.id},${catId})" style="color:var(--danger)">❌</button></div>`).join('') || '<p style="color:var(--t3);text-align:center;padding:18px;font-size:12px">ยังไม่มี Field</p>';
    // restore focus to the new-field input so user can continue adding — try multiple strategies
    setTimeout(()=>{
      const t=q('#tnew'); const modalEl=q('#modal');
      if(modalEl){ try{ modalEl.focus(); }catch(e){} }
      if(t){ try{ t.focus(); t.click(); if(typeof t.setSelectionRange==='function') t.setSelectionRange(t.value.length, t.value.length); }catch(e){} }
      // as a fallback, try focusing the window then the input
      try{ window.focus(); }catch(e){}
    },60);
    toast('ลบเรียบร้อยแล้ว');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

// ═══ MODALS: OBJECT ════════════════════════════════════
async function openObjectModal(catId=null,objId=null){
  const obj=objId?await api.object.get(objId):null;
  const objTags = objId?await api.object.getTags(objId):[];
  openModal(obj?'✏️ แก้ไขรายการ':'⭐ เพิ่มรายการ',`
    <div class="fg"><label>ชื่อ *</label><input id="on" value="${x(obj?.name||'')}"></div>
    <div class="fg"><label>สี</label>${await colorPicker(obj?.color)}</div>
    ${await hashtagSelector('obj', objTags)}
    <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${obj?'saveObject('+objId+')':'createObject('+(catId||S.category.id)+')'}">${obj?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>{
    q('#on')?.focus();
    renderModalTagSuggestions('obj');
  },60);
}
async function createObject(catId){
  const n=q('#on').value.trim(); if(!n) return;
  const r=await api.object.create(S.project.id,catId,n,q('#sel-color').value||null);
  const tags = q('#obj-tag-value')?.value.split(',').filter(Boolean).map(Number) || [];
  if(r?.lastInsertRowid) await api.object.setTags(r.lastInsertRowid,tags);
  closeModal(); S.object=await api.object.get(r.lastInsertRowid); await renderCatBody(catId); toast('เพิ่มรายการเรียบร้อยแล้ว','ok');
}
async function saveObject(id){
  const n=q('#on').value.trim(); if(!n) return;
  await api.object.update(id,n,q('#sel-color').value||null);
  const tags = q('#obj-tag-value')?.value.split(',').filter(Boolean).map(Number) || [];
  await api.object.setTags(id,tags);
  closeModal(); S.object=await api.object.get(id); await renderCatBody(S.category.id); toast('บันทึกเรียบร้อยแล้ว','ok');
}
async function delObject(id){ if(!confirm('ลบรายการนี้?')) return; await api.object.delete(id); closeModal(); if(S.object?.id===id) S.object=null; await renderCatBody(S.category.id); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: TIMELINE ══════════════════════════════════
async function openTimelineModal(id=null){
  let tl=null;
  if(id){ const tls=await api.timeline.getAll(S.project.id); tl=tls.find(t=>t.id===id); }
  openModal(tl?'✏️ แก้ไข Timeline':'📅 Timeline ใหม่',`
    <div class="fg"><label>ชื่อ Timeline *</label><input id="tn" value="${x(tl?.line_name||'')}"></div>
    <div class="fg"><label>สี</label>${await colorPicker(tl?.color)}</div>
    <div class="mfoot">${tl?`<button class="btn btn-d" onclick="delTimeline(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${tl?'saveTimeline('+id+')':'createTimeline()'}">${tl?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#tn').focus(),60);
}
async function createTimeline(){ const n=q('#tn').value.trim(); if(!n) return; const r=await api.timeline.create(S.project.id,n,q('#sel-color').value||null); closeModal(); const tls=await api.timeline.getAll(S.project.id); S.timeline=tls.find(t=>t.id===r.lastInsertRowid)||null; await renderTimelineView(); toast('สร้าง Timeline เรียบร้อยแล้ว','ok'); }
async function saveTimeline(id){ const n=q('#tn').value.trim(); if(!n) return; await api.timeline.update(id,n,q('#sel-color').value||null); closeModal(); const tls=await api.timeline.getAll(S.project.id); S.timeline=tls.find(t=>t.id===id)||null; await renderTimelineView(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delTimeline(id){ if(!confirm('ลบ Timeline? เหตุการณ์ทั้งหมดจะหาย')) return; await api.timeline.delete(id); closeModal(); if(S.timeline?.id===id) S.timeline=null; await renderTimelineView(); toast('ลบเรียบร้อยแล้ว'); }

function dateInputsHTML(prefix,ev,dayKey,mKey,yKey,hKey,minKey){
  return `<div class="date-row">
    <input id="${prefix}-d" type="number" placeholder="วัน"   min="1"  value="${ev?ev[dayKey]||'':''}">
    <input id="${prefix}-m" type="number" placeholder="เดือน" min="1"  value="${ev?ev[mKey]  ||'':''}">
    <input id="${prefix}-y" type="number" placeholder="ปี"           value="${ev?ev[yKey]  ||'':''}">
    <input id="${prefix}-h" type="number" placeholder="ชม."   min="0" max="23" value="${ev?ev[hKey]  ||0:0}">
    <input id="${prefix}-min" type="number" placeholder="น."  min="0" max="59" value="${ev?ev[minKey]||0:0}">
  </div>
  <div class="date-labels"><span>วัน</span><span>เดือน</span><span>ปี</span><span>ชั่วโมง</span><span>นาที</span></div>`;
}

async function openEventModal(tlid,evId=null){
  let ev=null;
  if(evId){ const evs=await api.timeline.getEvents(tlid); ev=evs.find(e=>e.id===evId); }
  const evTags = evId?await api.timeline.getEventTags(evId):[];
  openModal(ev?'✏️ แก้ไขเหตุการณ์':'📅 เพิ่มเหตุการณ์',`
    <div class="fg"><label>ชื่อเหตุการณ์ *</label><input id="ev-n" value="${x(ev?.event_name||'')}"></div>
    <div class="fg"><label>วันที่เริ่มต้น *</label>${dateInputsHTML('ev-s',ev,'s_day','s_month','s_years','s_hour','s_minute')}</div>
    <div class="fg"><label>วันที่สิ้นสุด (ไม่บังคับ)</label>${dateInputsHTML('ev-e',ev,'e_day','e_month','e_years','e_hour','e_minute')}</div>
    <div class="fg"><label>สี</label>${await colorPicker(ev?.color)}</div>
    <div class="fg"><label>สตอรี่</label><textarea id="ev-story" placeholder="เขียนสตอรี่ที่เกิดขึ้นในเหตุการณ์นี้...">${x(ev?.story||'')}</textarea></div>
    ${await hashtagSelector('ev', evTags)}
    <div class="mfoot">${ev?`<button class="btn btn-d" onclick="delEvent(${evId},${tlid})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${ev?`saveEvent(${evId},${tlid})`:`createTimelineEvent(${tlid})`}">${ev?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#ev-n').focus(),60);
}

async function getDateFromInputs(prefix){
  const d=parseInt(q(`#${prefix}-d`).value)||0, m=parseInt(q(`#${prefix}-m`).value)||0, y=parseInt(q(`#${prefix}-y`).value)||0;
  if(!d||!m||!y) return null;
  const h=parseInt(q(`#${prefix}-h`).value)||0, min=parseInt(q(`#${prefix}-min`).value)||0;
  return await api.timeline.getOrCreateDate(d,m,y,h,min);
}

async function createTimelineEvent(tlid){
  try{
    const n=q('#ev-n').value.trim(); if(!n){ toast('กรอกชื่อเหตุการณ์','err'); return; }
    const sid=await getDateFromInputs('ev-s'); if(!sid){ toast('กรอกวันที่เริ่มต้น','err'); return; }
    const eid=await getDateFromInputs('ev-e');
    const story=q('#ev-story')?.value.trim()||'';
    const r = await api.timeline.createEvent(tlid,n,sid,eid,q('#sel-color').value||null,story);
    const tags = Array.from(document.querySelectorAll('[id^="ev-tag-"]:checked')).map(i=>parseInt(i.value,10));
    if(r?.lastInsertRowid) await api.timeline.setEventTags(r.lastInsertRowid,tags);
    closeModal(); await renderTimelineDetail(tlid); toast('เพิ่มเหตุการณ์แล้ว','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

async function saveEvent(evId,tlid){
  try{
    const n=q('#ev-n').value.trim(); if(!n){ toast('กรอกชื่อเหตุการณ์','err'); return; }
    const sid=await getDateFromInputs('ev-s'); if(!sid){ toast('กรอกวันที่เริ่มต้น','err'); return; }
    const eid=await getDateFromInputs('ev-e');
    const story=q('#ev-story')?.value.trim()||'';
    await api.timeline.updateEvent(evId,n,sid,eid,q('#sel-color').value||null,story);
    const tags = Array.from(document.querySelectorAll('[id^="ev-tag-"]:checked')).map(i=>parseInt(i.value,10));
    await api.timeline.setEventTags(evId,tags);
    closeModal(); await renderTimelineDetail(tlid); toast('บันทึกเรียบร้อยแล้ว','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

async function saveEventStory(evId){
  const el=q(`#ev-story-${evId}`);
  if(!el) return;
  try{
    await api.timeline.updateEventStory(evId,el.value.trim());
    toast('บันทึกสตอรี่เรียบร้อย','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

async function delEvent(evId,tlid){ if(!confirm('ลบเหตุการณ์นี้?')) return; await api.timeline.deleteEvent(evId); closeModal(); await renderTimelineDetail(tlid); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: RELATION TYPE ═════════════════════════════
async function openRelTypeModal(id=null){
  const types = await api.relation.getTypes();
  const relType = id ? types.find(t=>t.id===id) : null;
  openModal(relType ? '✏️ แก้ไขประเภทความสัมพันธ์' : '🏷️ ประเภทความสัมพันธ์ใหม่',`
    <div class="fg"><label>ชื่อ *</label><input id="rt-n" value="${x(relType?.relation_name||'')}" placeholder="เช่น เพื่อน, ศัตรู, ครอบครัว"></div>
    <div class="fg"><label>สี</label>${await colorPicker(relType?.color)}</div>
    <div class="mfoot">${relType?`<button class="btn btn-d" onclick="delRelType(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${relType?`updateRelType(${id})`:'createRelType()'}">${relType?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#rt-n').focus(),60);
}
async function createRelType(){ const n=q('#rt-n').value.trim(); if(!n) return; await api.relation.createType(n,q('#sel-color').value||null); closeModal(); await renderRelationView(); toast('สร้างประเภทแล้ว','ok'); }
async function updateRelType(id){ const n=q('#rt-n').value.trim(); if(!n) return; await api.relation.updateType(id,n,q('#sel-color').value||null); closeModal(); await renderRelationView(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delRelType(id){ if(!confirm('ลบประเภทนี้?')) return; await api.relation.deleteType(id); await renderRelationView(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: RELATION ══════════════════════════════════
function groupByKey(arr,key){ const g={}; arr.forEach(i=>{ const k=i[key]; if(!g[k])g[k]=[]; g[k].push(i); }); return g; }
function objOptions(objs){ const g=groupByKey(objs,'category_name'); return Object.entries(g).map(([cat,items])=>`<optgroup label="${x(cat)}">${items.map(o=>{ const col=o.color_code||o.category_color_code||'#6366f1'; return `<option value="${o.id}" data-color="${col}" style="color:${col}">● ${x(o.name)}</option>`; }).join('')}</optgroup>`).join(''); }
function evtOptions(evts){ const g=groupByKey(evts,'line_name'); return Object.entries(g).map(([tl,items])=>`<optgroup label="${x(tl)}">${items.map(e=>{ const col=e.color_code||e.timeline_color_code||'#06b6d4'; return `<option value="${e.id}" data-color="${col}" style="color:${col}">● ${x(e.event_name||'ไม่มีชื่อ')} (${fmtDate(e.s_day,e.s_month,e.s_years,0,0)})</option>`; }).join('')}</optgroup>`).join(''); }
function coloredSelect(label,id,options){
  return `<div class="fg"><label>${label}</label><select id="${id}" onchange="updateSelectColorLabel('${id}')">${options}</select><div class="select-color-label" id="${id}-color-label"></div></div>`;
}
function updateSelectColorLabel(id){
  const sel=q(`#${id}`), label=q(`#${id}-color-label`);
  if(!sel || !label) return;
  const opt=sel.options[sel.selectedIndex];
  const col=opt?.dataset?.color || '#6366f1';
  const txt=(opt?.textContent||'').replace(/^●\s*/,'');
  label.innerHTML = `<span class="select-color-dot" style="background:${col}"></span><span>${x(txt)}</span>`;
}
function initColoredSelects(...ids){ setTimeout(()=>ids.forEach(updateSelectColorLabel), 30); }

async function openRelModal(tab, rel=null){
  if(!S.project) return;
  const types = await api.relation.getTypes();
  const typeOpts = `<option value="">-- ไม่ระบุ --</option>${types.map(t=>`<option value="${t.id}" ${rel?.relation_type===t.id?'selected':''} style="${t.color_code?`color:${t.color_code}`:''}">${t.color_code?'● ':''}${x(t.relation_name)}</option>`).join('')}`;
  const typeRow  = `<div class="fg"><label>ประเภทความสัมพันธ์</label><select id="rel-type">${typeOpts}</select></div>`;
  if(rel){
    openModal('✏️ ปรับแต่งความสัมพันธ์',`${typeRow}<div class="mfoot"><button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="saveRel(${rel.rel_id})">บันทึก</button></div>`);
    return;
  }
  if(tab===0){
    const oo=objOptions(await api.relation.getProjectObjects(S.project.id));
    openModal('🔗 Object ↔ Object',`${typeRow}${coloredSelect('จาก Object','rel-from',oo)}${coloredSelect('ไปยัง Object','rel-to',oo)}<div class="mfoot"><button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="createRelOBOB()">สร้าง</button></div>`);
    initColoredSelects('rel-from','rel-to');
  } else if(tab===1){
    const oo=objOptions(await api.relation.getProjectObjects(S.project.id));
    const eo=evtOptions(await api.relation.getProjectEvents(S.project.id));
    openModal('🔗 Object ↔ Event',`${typeRow}${coloredSelect('Object','rel-from',oo)}${coloredSelect('เหตุการณ์','rel-to',eo)}<div class="mfoot"><button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="createRelOBTL()">สร้าง</button></div>`);
    initColoredSelects('rel-from','rel-to');
  } else {
    const eo=evtOptions(await api.relation.getProjectEvents(S.project.id));
    openModal('🔗 Event ↔ Event',`${typeRow}${coloredSelect('เหตุการณ์ที่ 1','rel-from',eo)}${coloredSelect('เหตุการณ์ที่ 2','rel-to',eo)}<div class="mfoot"><button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="createRelTLTL()">สร้าง</button></div>`);
    initColoredSelects('rel-from','rel-to');
  }
}

async function createRelOBOB(){
  try{ const fid=parseInt(q('#rel-from').value),tid=parseInt(q('#rel-to').value); if(fid===tid){toast('เลือก Object ที่ต่างกัน','err');return;} await api.relation.createOBOB(S.project.id,q('#rel-type').value||null,null,fid,tid); closeModal(); S.relTab=0; await renderRelationView(); toast('เพิ่มความสัมพันธ์แล้ว','ok'); }
  catch(e){ toast(e.message,'err'); console.error(e); }
}
async function createRelOBTL(){
  try{ await api.relation.createOBTL(S.project.id,q('#rel-type').value||null,null,parseInt(q('#rel-from').value),parseInt(q('#rel-to').value)); closeModal(); S.relTab=1; await renderRelationView(); toast('เพิ่มความสัมพันธ์แล้ว','ok'); }
  catch(e){ toast(e.message,'err'); console.error(e); }
}
async function createRelTLTL(){
  try{ const fid=parseInt(q('#rel-from').value),tid=parseInt(q('#rel-to').value); if(fid===tid){toast('เลือกเหตุการณ์ที่ต่างกัน','err');return;} await api.relation.createTLTL(S.project.id,q('#rel-type').value||null,null,fid,tid); closeModal(); await renderRelationView(); toast('เพิ่มความสัมพันธ์แล้ว','ok'); }
  catch(e){ toast(e.message,'err'); console.error(e); }
}
async function delRel(id,type){ if(!confirm('ลบความสัมพันธ์?')) return; if(type==='obob') await api.relation.deleteOBOB(id); else if(type==='obtl') await api.relation.deleteOBTL(id); else await api.relation.deleteTLTL(id); await renderRelationView(); toast('ลบเรียบร้อยแล้ว'); }
async function saveRel(relId){
  try{
    await api.relation.update(relId, q('#rel-type').value||null, null);
    closeModal();
    await renderRelationView();
    toast('บันทึกความสัมพันธ์แล้ว','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

// ═══ MODALS: HASHTAG ═══════════════════════════════════
async function openHashtagModal(id=null){
  const tag=id?(await api.hashtag.getAll()).find(t=>t.id===id):null;
  openModal(tag?'✏️ แก้ไข Tag':'🏷️ Tag ใหม่',`
    <div class="fg"><label>ชื่อ Tag *</label><input id="ht-n" value="${x(tag?.tag_name||'')}" placeholder="ชื่อ (ไม่ต้องใส่ #)"></div>
    <div class="fg"><label>สี</label>${await colorPicker(tag?.tag_color)}</div>
    <div class="mfoot">${tag?`<button class="btn btn-d" onclick="delHashtag(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${tag?'saveHashtag('+id+')':'createHashtag()'}">${tag?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#ht-n').focus(),60);
}
async function createHashtag(){ const n=q('#ht-n').value.trim(); if(!n) return; await api.hashtag.create(n,q('#sel-color').value||null); closeModal(); await renderHashtagView(); toast('สร้าง Tag เรียบร้อยแล้ว','ok'); }
async function saveHashtag(id){ const n=q('#ht-n').value.trim(); if(!n) return; await api.hashtag.update(id,n,q('#sel-color').value||null); closeModal(); await renderHashtagView(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delHashtag(id){ if(!confirm('ลบ Tag นี้?')) return; await api.hashtag.delete(id); closeModal(); await renderHashtagView(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ GLOBAL SEARCH ═════════════════════════════════════
let _searchTimeout;
function bindSearch() {
  const inp=q('#search-input'); if(!inp) return;
  inp.addEventListener('input',()=>{
    clearTimeout(_searchTimeout);
    _searchTimeout=setTimeout(async()=>{
      const val=inp.value.trim();
      if(!val) switchView(S.view);
      else { const results=await api.search.all(val); renderSearchResults(results,val); }
    },300);
  });
}

function renderSearchResults(res,query){
  const el=q('#left-panel-inner'); if(!el) return;
  let h=`<div class="ph"><h4>ผลการค้นหา "${x(query)}"</h4></div>`;
  if(res.projects?.length){
    h+=`<div class="search-sec"><div class="search-sec-hd">📁 โปรเจกต์</div>`;
    for(const p of res.projects){ const col=p.color_code||'#6366f1'; h+=`<div class="li search-res-item" onclick="selectSearchProject(${p.id})"><div class="dot" style="background:${col}"></div><span class="name">${x(p.name)} ${p.codename?`<span class="tag" style="margin-left:4px">${x(p.codename)}</span>`:''}</span></div>`; }
    h+=`</div>`;
  }
  if(res.objects?.length){
    h+=`<div class="search-sec"><div class="search-sec-hd">⭐ รายการ (Objects)</div>`;
    for(const o of res.objects){ const col=o.color_code||'#6366f1'; h+=`<div class="li search-res-item" onclick="selectSearchObject(${o.project_id},${o.category_id},${o.id})" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:8px 10px"><div style="display:flex;align-items:center;gap:8px;width:100%"><div class="dot" style="background:${col}"></div><span class="name" style="font-weight:500;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(o.name)}</span></div><span style="font-size:10px;color:var(--t3);margin-left:16px">${x(o.project_name)} / ${x(o.category_name)}</span></div>`; }
    h+=`</div>`;
  }
  if(res.hashtags?.length){
    h+=`<div class="search-sec"><div class="search-sec-hd">🏷️ ป้ายกำกับ (Hashtags)</div>`;
    for(const t of res.hashtags){ const col=t.color_code||'#6366f1'; h+=`<div class="li search-res-item" onclick="selectSearchHashtag(${t.id})"><span class="hn" style="color:${col};font-weight:700">#${x(t.tag_name)}</span></div>`; }
    h+=`</div>`;
  }
  if(!res.projects?.length&&!res.objects?.length&&!res.hashtags?.length){
    h+=`<div class="empty" style="padding:40px 10px"><div class="ei" style="font-size:28px">🔍</div><p>ไม่พบผลลัพธ์การค้นหา</p></div>`;
  }
  el.innerHTML=h;
}

async function selectSearchProject(id){ const inp=q('#search-input'); if(inp) inp.value=''; await selectProject(id); }
async function selectSearchObject(pid,cid,oid){ const inp=q('#search-input'); if(inp) inp.value=''; await selectProject(pid); await selectCategory(cid); await selectObject(oid); }
async function selectSearchHashtag(tid){
  const inp=q('#search-input'); if(inp) inp.value='';
  S.view='hashtag';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
  q('.nav-btn[data-panel="hashtag"]').classList.add('active');
  await renderHashtagView();
  const el=q(`#tag-item-${tid}`);
  if(el){ el.scrollIntoView({behavior:'smooth',block:'center'}); el.style.boxShadow='0 0 12px var(--tc)'; el.style.transform='scale(1.05)'; setTimeout(()=>{ el.style.boxShadow=''; el.style.transform=''; },1800); }
}

Object.assign(window, {
  setUiSetting, setUiSizeFromSlider, toggleSettingsMenu, startRelListResize,
  openTemplateModal, addTemplate, delTemplate,
  openRelModal, createRelOBOB, createRelOBTL, createRelTLTL,
  updateSelectColorLabel,
  openEventModal, createTimelineEvent, saveEvent,
  openTimelineModal, createTimeline, saveTimeline,
  openMapModal, createMap, saveMap, delMap,
  selectMap, selectMapArea, setMapTool,
  openMapAreaModal, createMapArea, saveMapArea, delMapArea,
  // Object modal functions (exported so inline onclick handlers can call them)
  openObjectModal, createObject, saveObject, delObject,
  // Object selection
  selectObject,
});

// ═══ START ═════════════════════════════════════════════
init();
