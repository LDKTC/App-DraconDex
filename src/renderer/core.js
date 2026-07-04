'use strict';

const I = {
  info: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
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
  sage: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  artisan: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/></svg>`
};

const UI_SETTINGS_KEY = 'novel-manager-ui-settings';
const LEFT_PANEL_COLLAPSED_KEY = 'novel-manager-left-panel-collapsed';
const UI_THEME_OPTIONS = ['daylight','moonlight','midnight','redEclipse','clearSky','clearStar','afterRain','rainbow','atDawn','atDusk','atDay','blueEclipse'];
const UI_LANGUAGE_OPTIONS = ['en','ja','ko','th','zh','vi','id','es','pt','fr','de','ru','qd'];
const UI_SIZE_MIN = 50;
const UI_SIZE_MAX = 200;
const UI_SIZE_STEP = 5;

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
  game:null, gameTab:'project', heroLevelOpen:new Set(),
  // Writer module state
  write:null, writeTab:'project', writeSeries:null, writeBook:null, writeChapter:null,
  writeWikiChapter:null, writeNote:null, writeOpenProjects:new Set(),
  // Sage module state
  sageTab:'dataSize',
  // Artisan module state
  artisanTarget:null,
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
  writer: { setter:'setWriteTab', items:[
    ['novel','relation','writeNovelLink'], ['note','story','writeChatnote'] ] },
  sage: { setter:'setSageTab', items:[
    ['dataSize','layer','sageDataSize'], ['objectAmount','table','sageObjectAmount'],
    ['linkerList','list','sageLinkerList'], ['linkerGraph','relation','sageLinkerGraph'] ] },
};

function buildModuleSubNav(){
  const rail = q('#nav-sidebar');
  if(!rail) return;
  // Insert before the Artisan shortcut (bottom of the module cluster) so the
  // create-from-template button always sits under a module's subnav icons.
  const anchor = rail.querySelector('#artisan-module-shortcut') || rail.querySelector('div[style*="flex:1"]');
  let html = '';
  for(const [mod, cfg] of Object.entries(MODULE_SUBNAV)){
    for(const [tab, icon, key] of cfg.items){
      html += `<button class="nav-btn ${mod}-sub" data-subtab="${tab}" data-i18n="${key}" style="display:none" onclick="${cfg.setter}('${tab}')">${I[icon]}</button>`;
    }
  }
  if(anchor) anchor.insertAdjacentHTML('beforebegin', html);
  else rail.insertAdjacentHTML('beforeend', html);
}

function updateModuleSubNav(){
  const show = {
    hero:      S.activeModule === 'hero'      && !!S.game,
    writer:    S.activeModule === 'writer'    && !!S.write,
    sage:      S.activeModule === 'sage',
  };
  const cur = { hero:S.gameTab, writer:S.writeTab, sage:S.sageTab };
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
    // With a project active the Writer rail button doubles as the "project"
    // submodule (series → books → chapters), mirroring Hero's rail button.
    btn.classList.toggle('active', S.activeModule === 'writer' && !!S.write && S.writeTab === 'project');
  });
  document.querySelectorAll('.nav-btn.sage-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'sage') ? '' : 'none';
  });
  document.querySelectorAll('.nav-btn.artisan-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'artisan') ? '' : 'none';
    btn.classList.toggle('active', S.activeModule === 'artisan');
  });
  // Create-from-template shortcut shown inside every project module's rail.
  const artisanFrom = ['director','navigator','hero','writer'].includes(S.activeModule);
  document.querySelectorAll('.nav-btn.artisan-shortcut').forEach(btn => {
    btn.style.display = artisanFrom ? '' : 'none';
    btn.setAttribute('title', t('artisan'));
  });
  updateModuleSubNav();
}

function returnToProjectList(){
  if (typeof closeRelNodeNote === 'function') closeRelNodeNote();
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

// Tabs stay visible across every module — closing one module's window on a
// tab used to hide the tabs of every other module, so an open project/world/
// game/write tab appeared to vanish the moment you switched modules even
// though its state (S.projectTabs / S.entityTabs) was never cleared.
function renderProjectTabs(){
  const el = q('#project-tabs');
  if(!el) return;
  const dirTabs = S.projectTabs.map(tab => `
    <button class="project-tab ${S.activeModule==='director' && S.activeProjectTabId===tab.id?'active':''}" onclick="switchProjectTab(${tab.id})" title="${x(tab.name)}">
      <span class="tab-dot" style="background:${tab.color}"></span>
      <span class="tab-name">${x(tab.name)}</span>
      <span class="tab-close" onclick="event.stopPropagation();closeProjectTab(${tab.id})" title="${t('closeTab')}">&times;</span>
    </button>
  `).join('');
  const entTabs = S.entityTabs.map(tab => `
    <button class="project-tab ${S.activeModule===tab.module && S.activeEntityTabKey===tab.key?'active':''}" onclick="switchEntityTab('${tab.key}')" title="${x(tab.name)}">
      <span class="tab-dot" style="background:${tab.color}"></span>
      <span class="tab-name">${x(tab.name)}</span>
      <span class="tab-close" onclick="event.stopPropagation();closeEntityTab('${tab.key}')" title="${t('closeTab')}">&times;</span>
    </button>
  `).join('');
  el.innerHTML = dirTabs + entTabs;
  document.title = S.project ? `${S.project.name} - DraconDex` : 'DraconDex';
}

function upsertEntityTab(entity, type, module) {
  const key = `${type}-${entity.id}`;
  const moduleColors = { world:'#22c55e', game:'#f59e0b', write:'#8b5cf6' };
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
  } else if (tab.type === 'write') {
    S.write = await api.write.getProject(tab.id);
    S.writeTab = 'project'; S.writeSeries = null; S.writeBook = null; S.writeChapter = null;
    S.writeWikiChapter = null; S.writeNote = null;
    await renderWriterView();
  } else {
    renderProjectTabs();
  }
}

async function closeEntityTab(key) {
  const idx = S.entityTabs.findIndex(t => t.key === key);
  if (idx < 0) return;
  const closing = S.entityTabs[idx];
  const wasActive = S.activeModule === closing.module && S.activeEntityTabKey === key;
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
  else if (closing.type === 'write') { S.write = null; if (S.activeModule==='writer') await renderWriterView(); }
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
  const wasActive = S.activeModule === 'director' && S.activeProjectTabId === id;
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
    else if(S.write && S.activeModule === 'writer' && typeof goToWriteList === 'function') goToWriteList();
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
  if (typeof closeRelNodeNote === 'function') closeRelNodeNote();
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
  else if (v==='artisan')         { await loadModule('src/renderer/artisan.js'); renderArtisanView(); }
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
    </div>
    <div class="module-item" onclick="selectModule('artisan')">
      <span class="module-icon">${I.artisan}</span>
      <span class="module-name">${t('artisan')}</span>
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
    S.write = null; S.writeTab = 'project'; S.writeSeries = null; S.writeBook = null;
    S.writeChapter = null; S.writeWikiChapter = null; S.writeNote = null;
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
  } else if (name === 'artisan') {
    S.view = 'artisan';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="artisan"]')?.classList.add('active');
    updateTopNavButton();
    loadModule('src/renderer/artisan.js').then(() => renderArtisanView());
  }
}

// Rail shortcut inside each project module: open Artisan with that module's
// templates preselected, so a templated project is one click away.
function openArtisanFromModule(){
  if(['director','navigator','hero','writer'].includes(S.activeModule)){
    S.artisanTarget = S.activeModule;
  }
  selectModule('artisan');
}

function returnToNexus() {
  if (typeof closeRelNodeNote === 'function') closeRelNodeNote();
  S.activeModule = null;
  S.project = null; S.category = null; S.object = null;
  S.timeline = null; S.map = null; S.mapAreaId = null;
  S.activeProjectTabId = null; S.projectHashtagId = null;
  S.world = null; S.worldChar = null; S.worldCat = null; S.worldMap = null; S.worldMapTl = null;
  S.game = null; S.gameTab = 'project';
  S.write = null; S.writeTab = 'project'; S.writeSeries = null; S.writeBook = null;
  S.writeChapter = null; S.writeWikiChapter = null; S.writeNote = null;
  S.artisanTarget = null;
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

