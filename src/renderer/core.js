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
  artisan: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/></svg>`,
  scribe: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10.5 12.5 3 3L9 20l-3 1 1-3z"/></svg>`,
  manager: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  narrator: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>`,
  sketcher: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
  wanderer: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="12 7 14 12 12 17 10 12 12 7"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/></svg>`
};

const UI_SETTINGS_KEY = 'novel-manager-ui-settings';
const LEFT_PANEL_COLLAPSED_KEY = 'novel-manager-left-panel-collapsed';
const NEXUS_ACTIVE_KEY = 'novel-manager-active-nexus';
const HUB_OPEN_KEY = 'novel-manager-hub-open';

function loadHubOpen(){
  try { return { nest:true, sage:false, dock:false, ...JSON.parse(localStorage.getItem(HUB_OPEN_KEY) || '{}') }; }
  catch(e){ return { nest:true, sage:false, dock:false }; }
}
const UI_THEME_OPTIONS = ['daylight','moonlight','midnight','redEclipse','clearSky','clearStar','afterRain','rainbow','atDawn','atDusk','atDay','blueEclipse','clearAurora','atTwilight','atSunset','clearComet','atDaybreak','afterSunset','atSunrise','atNight','atNoon','clearDusk','atMidnight','clearMoon','clearGalaxy','clearNebula','afterStorm','afterSnow','atMorning','clearSun','atEvening','clearMeteor'];
const UI_LANGUAGE_OPTIONS = ['en','ja','ko','th','zh','vi','id','es','pt','fr','de','ru','it','nl','pl','uk','tr','qd'];
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
  nexus:null, nexuses:[],
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
  // Scribe module state
  scribeNote:null, scribeFolders:[], scribeNotes:[], scribeOpenFolders:new Set(), scribeTab:'notes',
  // Wiki navigation state
  recentEntities:[],
  // Explorer state
  explorerOpen:new Set(['sec_scribe','sec_director','sec_navigator','sec_hero','sec_writer']),
  explorerTree:null,
  // v3 module system state (Nexus nest hub — progress.md Phases 1-3). Additive
  // alongside the legacy Director/Navigator/Hero/Writer/Scribe/Sage/Artisan
  // modules; see progress.md Section C for the scoping decision.
  moduleTree:[], activeModuleNode:null, inspectorData:null,
  moduleTabs:[],
  classifierData:null, classifierView:'table', classifierSelectedObject:null,
  managerData:null, managerView:'cards',
  locatorAreas:null,
  chroniclerData:null,
  hubOpen:loadHubOpen(),
  moduleCollapsed:new Set(),
  dragMajorId:null,
};
const timelineGraphState = {};
let timelineGraphCleanup = null;
let konvaStage = null;
const mapState = { viewByMap:{}, pointsByArea:{} };

async function init() {
  applyUiSettings();
  S.colors       = await api.color.getAll();
  S.recentColors = await api.color.getRecent();
  S.nexuses      = await api.nexus.getAll();
  const savedNexusId = Number(localStorage.getItem(NEXUS_ACTIVE_KEY));
  S.nexus        = S.nexuses.find(n => n.id === savedNexusId) || null;
  S.folders      = await api.folder.getAll();
  S.projects     = await api.project.getAll(null, S.nexus?.id ?? null);
  S.moduleTree   = S.nexus ? await api.module.getTree(S.nexus.id) : [];
  bindWindowChrome();
  bindLeftPanelToggle();
  bindHubToggle();
  applyLeftPanelState();
  observeUiLanguage();
  removeLegacyDirectorProjectButton();
  buildModuleSubNav();
  renderModuleRail();
  renderSettingsMenu();
  translateStaticChrome();
  renderProjectTabs();
  renderNexusHome();
  bindNav();
  bindWikilinkClicks();
  bindGlobalShortcuts();
  updateStatusBar();
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
  q('#hub-toggle-btn')?.classList.toggle('active', !S.leftPanelCollapsed);
  q('#hub-toggle-btn')?.setAttribute('title', t('toggleHub'));
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

function bindHubToggle(){
  q('#hub-toggle-btn')?.addEventListener('click', () => setLeftPanelCollapsed(!S.leftPanelCollapsed));
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

// Read each theme's live palette straight from the CSS variables so the
// settings picker never drifts from style.css. We briefly swap body's
// data-theme to sample the computed vars, then restore it — all synchronous,
// so the browser never paints an intermediate theme. Result is cached.
let THEME_PALETTE_CACHE = null;
const THEME_SWATCH_VARS = ['--bg','--raised','--accent','--accentH','--t1'];
function getThemePalettes(){
  if(THEME_PALETTE_CACHE) return THEME_PALETTE_CACHE;
  const body = document.body;
  const prev = body.dataset.theme;
  const cache = {};
  for(const theme of UI_THEME_OPTIONS){
    body.dataset.theme = theme;
    const cs = getComputedStyle(body);
    cache[theme] = THEME_SWATCH_VARS.map(v => cs.getPropertyValue(v).trim());
  }
  if(prev === undefined) delete body.dataset.theme; else body.dataset.theme = prev;
  THEME_PALETTE_CACHE = cache;
  return cache;
}

function renderSettingsMenu(){
  const menu = q('#settings-menu');
  if(!menu) return;
  const palettes = getThemePalettes();
  const themeOptions = UI_THEME_OPTIONS.map(theme => {
    const active = S.settings.theme === theme;
    const swatches = (palettes[theme] || []).map(c =>
      `<i style="background:${c}"></i>`
    ).join('');
    return `<button type="button" class="theme-item${active?' active':''}" onclick="setUiSetting('theme','${theme}')" title="${t(theme)}">
        <span class="theme-swatches">${swatches}</span>
        <span class="theme-name">${t(theme)}</span>
        ${active?'<span class="theme-check">✓</span>':''}
      </button>`;
  }).join('');
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
      <div class="theme-list">
        ${themeOptions}
      </div>
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
    // View-pattern names, kind badges and other locale-invariant labels opt
    // out of auto-translation (progress.md A.3 — unique names are fixed).
    if(el.closest('[data-no-i18n],.viewbar')) return;
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
  scribe: { setter:'setScribeTab', items:[
    ['graph','relation','graphView'] ] },
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
    scribe:    S.activeModule === 'scribe',
  };
  const cur = { hero:S.gameTab, writer:S.writeTab, sage:S.sageTab, scribe:S.scribeTab };
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
    // Phase 1 (progress.md Section A): the rail's pinned tools are only
    // Scribe / Sage / Artisan (+ Import Dock) — the four legacy fixed
    // modules leave the rail and live in the hub's Legacy section until
    // their Phase 23 migration into Artisan templates.
    const oc = btn.getAttribute('onclick') || '';
    if (/selectModule\('(director|navigator|hero|writer)'\)/.test(oc)) { btn.style.display = 'none'; return; }
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
  document.querySelectorAll('.nav-btn.scribe-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'scribe') ? '' : 'none';
    btn.classList.toggle('active', S.activeModule === 'scribe');
  });
  // Explorer is available whenever a vault is open, regardless of module.
  document.querySelectorAll('.nav-btn.explorer-btn').forEach(btn => {
    btn.style.display = S.nexus ? '' : 'none';
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
// The tab strip lives in the builder (#builder-tabs at the top of
// #main-area), not the title bar — progress.md decision (o) / mockup 01.
// It merges legacy Director project tabs, legacy entity tabs and v3 module
// tabs; the title bar only carries the vault label + hub toggle.
function renderProjectTabs(){
  updateTitlebarVault();
  const el = q('#builder-tabs');
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
  const modTabs = S.moduleTabs.map(id => {
    const m = typeof findModuleNode === 'function' ? findModuleNode(id) : null;
    if(!m) return '';
    const active = !S.activeModule && S.activeModuleNode?.id === id;
    return `
    <button class="project-tab module-tab ${active?'active':''}" onclick="openModuleNode(${m.id})" title="${x(m.name)}">
      <span class="tab-dot" style="background:${x(m.color_code || '#6366f1')}"></span>
      <span class="tab-name">${x(m.name)}</span>
      <span class="ek" data-no-i18n>${x(KIND_LABEL?.[m.kind] || m.kind)}</span>
      <span class="tab-close" onclick="event.stopPropagation();closeModuleTab(${m.id})" title="${t('closeTab')}">&times;</span>
    </button>`;
  }).join('');
  el.innerHTML = dirTabs + entTabs + modTabs;
  el.classList.toggle('empty', !el.innerHTML.trim());
  document.title = S.project ? `${S.project.name} - DraconDex` : 'DraconDex';
}

function updateTitlebarVault(){
  const el = q('#titlebar-vault');
  if(el) el.textContent = S.nexus ? `${S.nexus.name} — DraconDex` : 'DraconDex';
}

// v3 module tabs (minimal builder tab strip — the visual part of Phase 19;
// ◀/▶ history and split panes stay in Phase 19 proper).
function upsertModuleTab(id){
  if(!S.moduleTabs.includes(id)) S.moduleTabs.push(id);
  renderProjectTabs();
}

async function closeModuleTab(id){
  const idx = S.moduleTabs.indexOf(id);
  if(idx < 0) return;
  S.moduleTabs.splice(idx, 1);
  if(S.activeModuleNode?.id === id && !S.activeModule){
    const next = S.moduleTabs[idx] ?? S.moduleTabs[idx - 1];
    if(next != null){ await openModuleNode(next); return; }
    S.activeModuleNode = null;
    renderModuleRail();
    renderNexusHome();
    updateStatusBar({ item: null, words: null, saveState: null });
  }
  renderProjectTabs();
}

function upsertEntityTab(entity, type, module) {
  const key = `${type}-${entity.id}`;
  const moduleColors = { world:'#22c55e', game:'#f59e0b', write:'#8b5cf6', note:'#0ea5e9' };
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
  } else if (tab.type === 'note') {
    S.activeModule = 'scribe';
    S.view = 'scribe';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="scribe"]')?.classList.add('active');
    updateTopNavButton();
    await loadModule('src/renderer/scribe.js');
    S.scribeNote = await api.note.get(tab.id);
    await renderScribeView();
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
  else if (closing.type === 'note') { S.scribeNote = null; if (S.activeModule==='scribe') await renderScribeView(); }
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
  else if (v==='scribe')          { await loadModule('src/renderer/scribe.js'); renderScribeView(); }
}

// ═══ NEXUS HUB ═════════════════════════════════════════
// Two-level home: no vault open → vault picker; vault open → module cards.
function renderNexusHome() {
  S.view = 'nexus';
  S.activeModule = null;
  if (konvaStage) { try { konvaStage.destroy(); } catch(e){} konvaStage = null; }
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
  updateTopNavButton();
  q('#main-inner')?.classList.remove('relation-main');
  if (!S.nexus) { renderNexusPicker(); return; }

  q('#left-panel-inner').innerHTML = `
    <div class="ph nexus-vault-head">
      <h4><span class="nexus-vault-dot" style="${S.nexus.color_code ? `background:${x(S.nexus.color_code)}` : ''}"></span>${x(S.nexus.name)}</h4>
      <button class="btn btn-s btn-sm" onclick="closeNexus()" title="${t('nexusSwitch')}">⇄</button>
    </div>
    ${buildHubHtml()}`;
  q('#main-inner').innerHTML = S.activeModuleNode ? buildModuleDetailHtml(S.activeModuleNode) : `<div class="empty" style="margin-top:80px">
    <div class="ei"><img src="Image/DraconDex-SymbolWhite.png" class="brand-img" alt="DraconDex" style="height:48px;width:48px;opacity:.35"></div>
    <h3>${x(S.nexus.name)}</h3>
    <p>${S.nexus.memo ? x(S.nexus.memo) : t('nexusWelcomeText')}</p>
  </div>`;
  if (S.activeModuleNode?.kind === 'inspector' && typeof mountDetailEditor === 'function') mountDetailEditor(S.activeModuleNode);
  if (S.activeModuleNode?.kind === 'locator' && typeof mountLocatorBoard === 'function') mountLocatorBoard();
  if (S.activeModuleNode?.kind === 'chronicler' && typeof mountChroniclerGraph === 'function') mountChroniclerGraph();
}

function renderNexusPicker() {
  q('#left-panel-inner').innerHTML = `
    <div class="ph"><h4>${t('nexus')}</h4>
      <button class="btn btn-p btn-sm" onclick="openNexusModal()">+ ${t('nexusNew')}</button>
    </div>
    ${S.nexuses.length ? S.nexuses.map(n => `
      <div class="module-item nexus-item" onclick="selectNexus(${n.id})">
        <span class="nexus-vault-dot" style="${n.color_code ? `background:${x(n.color_code)}` : ''}"></span>
        <span class="module-name">${x(n.name)}</span>
        <span class="nexus-count">${n.project_count}</span>
        <button class="btn-icon" onclick="event.stopPropagation();openNexusModal(${n.id})" title="${t('edit')}">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        </button>
      </div>`).join('') : `<div class="empty"><p>${t('nexusEmpty')}</p></div>`}`;
  q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei"><img src="Image/DraconDex-SymbolWhite.png" class="brand-img" alt="DraconDex" style="height:48px;width:48px;opacity:.35"></div>
    <h3>${t('nexusWelcomeTitle')}</h3>
    <p>${t('nexusSelect')}</p>
  </div>`;
}

async function reloadNexuses() {
  S.nexuses = await api.nexus.getAll();
  if (S.nexus) S.nexus = S.nexuses.find(n => n.id === S.nexus.id) || null;
}

function clearWorkspaceTabs() {
  S.projectTabs = []; S.activeProjectTabId = null;
  S.entityTabs = []; S.activeEntityTabKey = null;
  S.project = null; S.category = null; S.object = null;
  S.timeline = null; S.map = null; S.mapAreaId = null;
  S.world = null; S.game = null; S.write = null;
  S.scribeNote = null; S.scribeOpenFolders = new Set();
  S.moduleTree = []; S.activeModuleNode = null; S.moduleTabs = [];
  renderProjectTabs();
}

async function selectNexus(id) {
  await reloadNexuses();
  S.nexus = S.nexuses.find(n => n.id === id) || null;
  if (!S.nexus) return;
  localStorage.setItem(NEXUS_ACTIVE_KEY, String(id));
  clearWorkspaceTabs();
  S.projects = await api.project.getAll(null, S.nexus.id);
  S.moduleTree = await api.module.getTree(S.nexus.id);
  renderNexusHome();
  renderModuleRail();
  updateStatusBar({ item: null, words: null, saveState: null });
}

function closeNexus() {
  S.nexus = null;
  localStorage.removeItem(NEXUS_ACTIVE_KEY);
  clearWorkspaceTabs();
  renderNexusHome();
  renderModuleRail();
  updateStatusBar({ item: null, words: null, saveState: null });
}

async function openNexusModal(id = null) {
  await reloadNexuses();
  const n = id ? S.nexuses.find(v => v.id === id) : null;
  openModal(n ? `✏️ ${t('nexusEdit')}` : `🗄️ ${t('nexusNew')}`, `
    <div class="fg"><label>${t('name')} *</label><input id="nx-name" value="${x(n?.name || '')}"></div>
    <div class="fg"><label>${t('memo')}</label><textarea id="nx-memo">${x(n?.memo || '')}</textarea></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(n?.color)}</div>
    <div class="mfoot">
      ${n ? `<button class="btn btn-d" onclick="delNexus(${id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="${n ? `saveNexus(${id})` : 'createNexusSubmit()'}">${n ? t('save') : t('create')}</button>
    </div>`);
  setTimeout(() => q('#nx-name').focus(), 60);
}

async function createNexusSubmit() {
  const name = q('#nx-name').value.trim(); if (!name) return;
  try {
    const newId = await api.nexus.create(name, q('#nx-memo').value.trim(), q('#sel-color').value || null);
    closeModal();
    await reloadNexuses();
    toast(t('nexusCreated'), 'ok');
    await selectNexus(newId);
  } catch (e) { toast(t('nexusNameTaken'), 'error'); }
}

async function saveNexus(id) {
  const name = q('#nx-name').value.trim(); if (!name) return;
  try {
    await api.nexus.update(id, name, q('#nx-memo').value.trim(), q('#sel-color').value || null);
    closeModal();
    await reloadNexuses();
    toast(t('saved'), 'ok');
    renderNexusHome();
  } catch (e) { toast(t('nexusNameTaken'), 'error'); }
}

async function delNexus(id) {
  if (!await uiConfirm(t('nexusDeleteConfirm'))) return;
  const r = await api.nexus.delete(id);
  if (r?.blocked) { toast(t('nexusDeleteBlocked'), 'error'); return; }
  closeModal();
  if (S.nexus?.id === id) { S.nexus = null; localStorage.removeItem(NEXUS_ACTIVE_KEY); clearWorkspaceTabs(); }
  await reloadNexuses();
  toast(t('deleted'), 'ok');
  renderNexusHome();
}

function selectModule(name) {
  if (!S.nexus) { toast(t('nexusSelectFirst'), 'error'); renderNexusHome(); return; }
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
  } else if (name === 'scribe') {
    S.view = 'scribe';
    S.scribeNote = null; S.scribeTab = 'notes';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="scribe"]')?.classList.add('active');
    updateTopNavButton();
    loadModule('src/renderer/scribe.js').then(() => renderScribeView());
  }
}

// ═══ ENTITY NAVIGATION ════════════════════════════════════
// Central dispatcher: open any entity from its wiki key ('note_3', 'obj_12',
// 'wchp_9', …). Used by wikilink clicks, backlinks, quick switcher and graph.
async function openEntityByKey(key) {
  if (!key) return;
  const p = await api.wiki.entityPath(key);
  if (!p) { toast(t('unresolvedLink'), 'error'); return; }
  if (p.kind === 'note') {
    S.activeModule = 'scribe'; S.view = 'scribe';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="scribe"]')?.classList.add('active');
    updateTopNavButton();
    await loadModule('src/renderer/scribe.js');
    await selectNote(p.noteId);
  } else if (p.kind === 'obj' || p.kind === 'proj') {
    S.activeModule = 'director'; S.view = 'projects';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="projects"]')?.classList.add('active');
    updateTopNavButton();
    await selectProject(p.projectId);
    if (p.kind === 'obj') { await selectCategory(p.categoryId); await selectObject(p.objectId); }
  } else if (p.kind === 'world') {
    const tabEntity = await api.world.get(p.worldId);
    if (!tabEntity) return;
    upsertEntityTab(tabEntity, 'world', 'navigator');
    S.activeModule = 'navigator';
    await switchEntityTab(`world-${p.worldId}`);
  } else if (p.kind === 'game') {
    const tabEntity = await api.game.get(p.gameId);
    if (!tabEntity) return;
    upsertEntityTab(tabEntity, 'game', 'hero');
    S.activeModule = 'hero';
    await switchEntityTab(`game-${p.gameId}`);
  } else if (p.kind === 'write' || p.kind === 'wchp') {
    const w = await api.write.getProject(p.writeId);
    if (!w) return;
    upsertEntityTab({ id: w.id, name: w.project_name, color_code: w.color_code }, 'write', 'writer');
    S.activeModule = 'writer';
    await switchEntityTab(`write-${p.writeId}`);
    if (p.kind === 'wchp') {
      S.writeSeries = p.seriesId; S.writeBook = p.bookId; S.writeChapter = p.chapterId;
      await renderWriterView();
    }
  } else if (p.kind === 'module') {
    S.activeModule = null; S.view = 'nexus';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    updateTopNavButton();
    await openModuleNode(p.moduleId);
  }
  trackRecentEntity(key);
}

// Recently opened entities feed the quick switcher's empty-query list.
function trackRecentEntity(key) {
  S.recentEntities = (S.recentEntities || []).filter(k => k !== key);
  S.recentEntities.unshift(key);
  if (S.recentEntities.length > 20) S.recentEntities.length = 20;
}

// Clicking a rendered [[wikilink]] anywhere in the main area navigates to the
// target; an unresolved one offers to create a note with that name.
function bindWikilinkClicks() {
  q('#main-inner')?.addEventListener('click', async (e) => {
    const a = e.target.closest('.wikilink');
    if (!a) return;
    e.preventDefault();
    const key = a.dataset.key;
    if (key) { await openEntityByKey(key); return; }
    const name = a.dataset.name;
    if (!name || !S.nexus) return;
    if (!await uiConfirm(t('createNoteFromLink') + ` "${name}"?`, { danger: false })) return;
    const newId = await api.note.create(S.nexus.id, name, null, null);
    await openEntityByKey(`note_${newId}`);
  });
}

async function openExplorer() {
  if (!S.nexus) { toast(t('nexusSelectFirst'), 'error'); return; }
  await loadModule('src/renderer/explorer.js');
  await openExplorerPanel();
}

// ═══ STATUS BAR ═══════════════════════════════════════════
// IDE-style footer: active vault · open item · word count · save state.
const _statusState = {};
function updateStatusBar(patch = {}) {
  Object.assign(_statusState, patch);
  const el = q('#status-bar');
  if (!el) return;
  const parts = [];
  if (S.nexus) parts.push(`<span class="sb-item sb-nexus" onclick="renderNexusHome()"><span class="nexus-vault-dot" style="${S.nexus.color_code ? `background:${x(S.nexus.color_code)}` : ''}"></span>${x(S.nexus.name)}</span>`);
  // Breadcrumb + module-type badge for the focused v3 module (mockups /
  // Section A status-bar spec): `Major › Minor` + `Major|Minor · Kind`.
  const mNode = (!S.activeModule && S.activeModuleNode) ? S.activeModuleNode : null;
  if (mNode) {
    const major = mNode.parent_id != null && typeof findModuleNode === 'function' ? findModuleNode(mNode.parent_id) : null;
    const crumb = major ? `${x(major.name)} › <b>${x(mNode.name)}</b>` : `<b>${x(mNode.name)}</b>`;
    parts.push(`<span class="sb-item sb-crumb">${crumb}</span>`);
    parts.push(`<span class="sb-badge" data-no-i18n>${mNode.parent_id != null ? 'Minor' : 'Major'} · ${x(KIND_LABEL?.[mNode.kind] || mNode.kind)}</span>`);
  }
  if (_statusState.item) parts.push(`<span class="sb-item">${x(_statusState.item)}</span>`);
  const right = [];
  if (_statusState.words != null) right.push(`<span class="sb-item">${_statusState.words} ${t('words')}</span>`);
  if (_statusState.saveState) right.push(`<span class="sb-item sb-save">${x(_statusState.saveState)}</span>`);
  el.innerHTML = `<div class="sb-left">${parts.join('')}</div><div class="sb-right">${right.join('')}</div>`;
}

// ═══ GLOBAL SHORTCUTS ═════════════════════════════════════
function bindGlobalShortcuts() {
  document.addEventListener('keydown', async (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const key = e.key.toLowerCase();
    const modalOpen = !q('#modal-overlay')?.classList.contains('hidden') || q('#confirm-overlay');
    const inInput = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    if (key === 'p') { // quick switcher — always available
      e.preventDefault();
      try {
        if (typeof openQuickSwitcher !== 'function') await loadModule('src/renderer/quickswitch.js');
        openQuickSwitcher();
      } catch (_) {}
      return;
    }
    if (modalOpen) return;
    if (key === 'w') { // close active tab
      e.preventDefault();
      if (S.activeEntityTabKey) await closeEntityTab(S.activeEntityTabKey);
      else if (S.activeProjectTabId != null && S.activeModule === 'director') await closeProjectTab(S.activeProjectTabId);
      return;
    }
    if (key === 'tab') { // cycle tabs (project tabs then entity tabs)
      e.preventDefault();
      const ring = [
        ...S.projectTabs.map(tb => ({ kind: 'proj', id: tb.id })),
        ...S.entityTabs.map(tb => ({ kind: 'ent', key: tb.key })),
      ];
      if (!ring.length) return;
      const cur = ring.findIndex(r => (r.kind === 'proj' && S.activeModule === 'director' && r.id === S.activeProjectTabId) ||
                                      (r.kind === 'ent' && r.key === S.activeEntityTabKey));
      const next = ring[(cur + (e.shiftKey ? -1 : 1) + ring.length) % ring.length];
      if (next.kind === 'proj') await switchProjectTab(next.id);
      else await switchEntityTab(next.key);
      return;
    }
    if (inInput && !['e', 'n'].includes(key)) return;
    if (key === 'n' && S.activeModule === 'scribe' && S.nexus) { // new note
      e.preventDefault();
      openNoteModal();
      return;
    }
    // Ctrl+E is handled by the focused editor itself (mdeditor.js); this is
    // the fallback when focus is outside it.
    if (key === 'e' && typeof _mdActive?.toggleMode === 'function' && !inInput) {
      e.preventDefault();
      _mdActive.toggleMode();
    }
  });
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
  S.projects = await api.project.getAll(null, S.nexus?.id ?? null);
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

