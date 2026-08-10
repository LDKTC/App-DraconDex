'use strict';
// Assembles the v3 mockup screens from shared chrome partials.
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
const LOGO = '../../src/assets/brand/DraconDex-SymbolWhite.png'; // relative to docs/mockups

const ic = {
  plus: '<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  globe: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  sword: '<svg class="icon" viewBox="0 0 24 24"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>',
  book: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  chat: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  chart: '<svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
  importD: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  artisan: '<svg class="icon" viewBox="0 0 24 24"><path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="M21.5 11.5 19.586 9.586A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/></svg>',
  folder: '<svg class="icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  layer: '<svg class="icon" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  map: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>',
  timeline: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  person: '<svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  doc: '<svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  relation: '<svg class="icon" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  move: '<svg class="icon" viewBox="0 0 24 24"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>',
  edit: '<svg class="icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  chevD: '<svg class="icon chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
  chevR: '<svg class="icon chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>',
  tchevD: '<svg class="icon tree-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
  tchevR: '<svg class="icon tree-chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>',
  search: '<svg class="icon sm" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  projects: '<svg class="icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  story: '<svg class="icon" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>',
  list: '<svg class="icon" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  pen: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
  eraser: '<svg class="icon" viewBox="0 0 24 24"><path d="M20 20H7l-5-5 9-9 7 7-6 7"/><path d="M6 12l6 6"/></svg>',
};

// Tree-row icon: module-kind icon tinted with the item's color (replaces the
// plain color dot per user feedback).
const ki = (kind, color) =>
  `<span class="kicon" style="color:${color}">${ic[kind]}</span>`;

// multi-view pattern switcher: every module offers selectable views
const viewbar = (items, act) => `<div class="viewbar"><span class="vlbl">View:</span>${items.map((v, i) =>
  `<span class="vitem${i === act ? ' act' : ''}">${v}</span>`).join('')}</div>`;
const CLS_VIEWS = ['Table', 'List + Detail', 'Relation in Cat', 'Grid Collection'];
const TL_VIEWS = ['One-line', 'Down-line + List', 'Compare Parallel'];
const VIEWER_VIEWS = ['Table', 'Cards', 'Board'];

const icPanel = '<svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>';
const titlebar = `
<div id="titlebar">
  <img class="brand" src="${LOGO}">
  <span class="hubtoggle active" title="เปิด/ปิด hub panel (แบบ Obsidian)">${icPanel}</span>
  <span style="font-size:12px;color:var(--t3);margin-left:6px">MyVault — DraconDex</span>
  <div class="tspace"></div>
  <div class="winbtn">⚙</div><div class="winbtn">–</div><div class="winbtn">▢</div><div class="winbtn">✕</div>
</div>`;

// Dynamic module toolbar (Phase 1): create tool + auto-populated Majors + pinned tools
function rail(active) {
  const majors = [
    ['world', ic.globe, '#22c55e', 'เอเธเรีย (โลก)'],
    ['game', ic.sword, '#f59e0b', 'ศึกมังกร (เกม)'],
    ['novel', ic.book, '#ec4899', 'นิยายหลัก'],
  ];
  return `
<nav id="rail">
  <img class="brand" src="${LOGO}" style="margin:2px 0 8px">
  <div class="nav-btn create" title="สร้าง Major module">${ic.plus}</div>
  <div class="rail-sep"></div>
  ${majors.map(([k, icon, col]) =>
    `<div class="nav-btn${active === k ? ' active' : ''}">${icon}<span class="mdot" style="background:${col}"></span></div>`).join('')}
  <div class="rail-sep"></div>
  <div class="nav-btn${active === 'scribe' ? ' active' : ''}" title="Scribe">${ic.chat}</div>
  <div class="nav-btn" title="Sage Hut">${ic.chart}</div>
  <div class="nav-btn" title="Import Dock">${ic.importD}</div>
  <div class="nav-btn" title="Artisan">${ic.artisan}</div>
  <div class="rail-flex"></div>
  <div class="nav-btn">${ic.edit}</div>
</nav>`;
}

// Hub panel (Phase 2+3): 3 accordion sections, Nexus nest expanded w/ Major/Minor tree
function hub(sel) {
  const row = (cls, html, extra) => `<div class="li ${cls || ''}" ${extra || ''}>${html}</div>`;
  return `
<aside id="hub">
  <div id="searchbar"><input placeholder="ค้นหา...  (Ctrl+P)"><span style="color:var(--t3)">‹</span></div>
  <div class="acc-head">${ic.chevD} Nexus nest <span class="act">${ic.folder}${ic.plus}</span></div>
  <div class="acc-body" style="flex:1">
    ${row(sel === 'world' ? 'sel' : '', `<span class="grip">⠿</span>${ic.tchevD}${ki('projects', '#22c55e')}<b>เอเธเรีย</b><span class="kind">Manager</span>`)}
    ${row('indent1' + (sel === 'chars' ? ' sel' : ''), `${ic.tchevD}${ki('layer', '#38bdf8')}ตัวละคร<span class="kind">Classifier</span>`)}
    ${row('indent2' + (sel === 'obj' ? ' sel' : ''), `${ki('person', '#818cf8')}อาริน`)}
    ${row('indent2', `${ki('person', '#f472b6')}เซลีน`)}
    ${row('indent1' + (sel === 'map' ? ' sel' : ''), `${ki('map', '#34d399')}แผนที่ทวีป<span class="kind">Locator</span>`)}
    ${row('indent1' + (sel === 'tl' ? ' sel' : ''), `${ki('timeline', '#fbbf24')}ยุคแห่งไฟ<span class="kind">Chronicler</span>`)}
    ${row('indent1', `${ki('story', '#c084fc')}เส้นทางเนื้อเรื่อง<span class="kind">Narrator</span>`)}
    ${row('indent1' + (sel === 'designer' ? ' sel' : ''), `${ki('relation', '#2dd4bf')}ผังระบบเวท<span class="kind">Designer</span>`)}
    ${row('indent1' + (sel === 'note' ? ' sel' : ''), `${ki('doc', '#94a3b8')}โน้ตเบื้องหลัง<span class="kind">Inspector</span>`)}
    ${row('', `<span class="grip">⠿</span>${ic.tchevR}${ki('projects', '#f59e0b')}<b>ศึกมังกร</b><span class="kind">Manager</span>`)}
    ${row(sel === 'sketch' ? 'sel' : '', `<span class="grip">⠿</span>${ki('pen', '#e879f9')}<b>สมุดวาด</b><span class="kind">Sketcher</span>`)}
    ${row('', `<span class="grip">⠿</span>${ic.tchevD}${ki('folder', '#ec4899')}<b>นิยายหลัก</b><span class="kind">Collector</span>`)}
    ${row('indent1' + (sel === 'bookm' ? ' sel' : ''), `${ki('book', '#f43f5e')}เล่ม 1 — จุดเริ่มต้น<span class="kind">Author</span>`)}
    ${row('indent1', `${ki('chat', '#0ea5e9')}แชตไอเดีย<span class="kind">Scribe</span>`)}
    ${row('indent1', `${ki('list', '#a3e635')}รวมฉากสำคัญ<span class="kind">Viewer</span>`)}
  </div>
  <div class="acc-head acc-collapsed">${ic.chevR} Sage Hut <span class="cnt">4 tabs</span></div>
  <div class="acc-head acc-collapsed">${ic.chevR} Import Dock <span class="cnt">12 files</span></div>
</aside>`;
}

function etabs(list) {
  return `<div id="etabs"><div class="navhist" title="ย้อน/ไปหน้า builder ที่เคยเปิด"><span class="hbtn">◀</span><span class="hbtn dim">▶</span></div>${list.map(([n, k, a]) =>
    `<div class="etab${a ? ' active' : ''}"><span>${n}</span><span class="ek">${k}</span><span class="tclose">×</span></div>`).join('')}</div>`;
}

function statusbar(crumb, badge, right) {
  return `
<div id="statusbar">
  <span><span class="vdot"></span>MyVault</span>
  <span class="sb-crumb">${crumb}</span>
  <span class="sb-badge">${badge}</span>
  <div class="sb-right">${right || '<span>2,410 words</span><span style="color:var(--success)">✓ saved</span>'}</div>
</div>`;
}

function page(title, active, sel, tabs, contentHtml, crumb, badge, overlay) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail(active)}
${hub(sel)}
<main id="main">
${etabs(tabs)}
<div id="content">${contentHtml}</div>
</main>
</div>
${statusbar(crumb, badge)}
</div>
${overlay || ''}
</body></html>`;
}

/* ── screen 1: shell + nest tree + category table ── */
const catContent = `
<div class="detail-head" style="border-color:#38bdf8">
  <h2>ตัวละคร <span class="chip" style="margin-left:6px">Classifier · Object</span></h2>
  <div class="sub">Template: 6 attributes · 14 objects · ใน เอเธเรีย</div>
  <div class="mtags"><span class="htag" style="border-color:#38bdf8;color:#38bdf8">#ตัวละคร</span><span class="htag" style="border-color:#818cf8;color:#818cf8">#หลัก</span><span class="htag lk">🔗 3 links</span></div>
</div>
<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center">
  <div class="btn btn-p">${ic.plus} เพิ่ม Object</div>
  <div class="btn btn-s">${ic.edit} แก้ไข Template</div>
  ${viewbar(CLS_VIEWS, 0)}
</div>
<table class="mock">
<tr><th>ชื่อ</th><th>เผ่า</th><th>อายุ</th><th>บทบาท</th><th>สังกัด</th><th>Tags</th></tr>
<tr><td><span class="dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#818cf8;margin-right:7px"></span>อาริน</td><td>มนุษย์</td><td>19</td><td>ตัวเอก</td><td>ภาคีนักเวท</td><td><span class="chip">#หลัก</span></td></tr>
<tr><td><span class="dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f472b6;margin-right:7px"></span>เซลีน</td><td>เอลฟ์</td><td>112</td><td>คู่หู</td><td>ป่าตะวันตก</td><td><span class="chip">#หลัก</span></td></tr>
<tr><td><span class="dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#fb923c;margin-right:7px"></span>ท่านเคียร์</td><td>มังกร</td><td>800+</td><td>ผู้พิทักษ์</td><td>หุบเขาเหนือ</td><td><span class="chip">#ตำนาน</span></td></tr>
<tr><td><span class="dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#a78bfa;margin-right:7px"></span>มอร์แกน</td><td>มนุษย์</td><td>45</td><td>ศัตรู</td><td>จักรวรรดิ</td><td><span class="chip">#ศัตรู</span></td></tr>
</table>`;
fs.writeFileSync(path.join(OUT, '01-shell.html'),
  page('shell', 'world', 'chars',
    [['ตัวละคร', 'Classifier', 1], ['แผนที่ทวีป', 'Locator', 0], ['เล่ม 1 — จุดเริ่มต้น', 'Author', 0]],
    catContent, 'เอเธเรีย <b>›</b> ตัวละคร', 'Major › Minor · Classifier'));

/* ── screen 2: Classifier modal ── */
const modal = `
<div id="overlay"><div id="modal">
<div id="modal-head"><span>🗂️ สร้าง Classifier</span><span style="color:var(--t3)">✕</span></div>
<div id="modal-body">
  <div class="fg"><label>ชื่อ Category *</label><input value="ตัวละคร"></div>
  <div class="fg"><label>Template แกนหลัก (จาก Artisan)</label>
    <select><option>Character sheet — จาก Director template</option></select></div>
  <div class="fg"><label>ประเภทข้อมูล (เลือก 1 ต่อ Category)</label>
    <div class="typegrid">
      <div class="typecard"><h5>${ic.layer} Object</h5><p>ค่าเริ่มต้น — สร้าง Attribute จาก template ได้</p></div>
      <div class="typecard"><h5>${ic.relation} Element</h5><p>เหมือน Object + เลือกได้ว่า attribute <b>Levelable</b> / มี <b>Condition</b></p>
        <div class="togglerow"><span class="tg on"></span>Levelable</div>
        <div class="togglerow"><span class="tg"></span>Condition</div></div>
      <div class="typecard sel"><h5>${ic.person} Character</h5><p>เหมือน Object + เพิ่ม <b>custom Attribute</b> เฉพาะตัวละครนั้นได้ 1 รายการ</p></div>
    </div></div>
</div>
<div class="mfoot"><div class="btn btn-s">ยกเลิก</div><div class="btn btn-p">สร้าง</div></div>
</div></div>`;
fs.writeFileSync(path.join(OUT, '02-classifier.html'),
  page('classifier', 'world', 'world',
    [['ตัวละคร', 'Classifier', 1]],
    catContent, 'เอเธเรีย', 'Major · Manager', modal));

/* ── screen 3: Locator ── */
// 1 Area = multiple nodes joined into a shape; the area's info stays on the shape.
const AREAS = [
  ['นครหลวงเวรีเดียน', '#34d399', 'rgba(52,211,153,.12)', [[520, 150], [660, 120], [740, 210], [670, 300], [540, 270]], 'x: 420 · y: 180'],
  ['ทะเลทรายแดง', '#fbbf24', 'rgba(251,191,36,.10)', [[880, 330], [1080, 300], [1160, 420], [1030, 500], [900, 450]], 'x: 980 · y: 410'],
  ['ท่าเรือมูนเบย์', '#38bdf8', 'rgba(56,189,248,.12)', [[420, 480], [560, 460], [600, 570], [470, 610]], 'x: 660 · y: 640'],
  ['หุบเขามังกรเหนือ', '#f472b6', 'rgba(244,114,182,.12)', [[960, 90], [1120, 70], [1180, 160], [1060, 220]], 'x: 1240 · y: 150'],
];
const centroid = (pts) => pts.reduce(([cx, cy], [px, py]) => [cx + px / pts.length, cy + py / pts.length], [0, 0]);
const mapContent = `
<div class="canvas">
  <div class="ctoolbar">
    <div class="ctool active">${ic.move}</div><div class="ctool">${ic.plus}</div>
    <div class="ctool">${ic.edit}</div><div class="ctool">${ic.map}</div>
  </div>
  <div class="cmtags"><span class="htag" style="border-color:#34d399;color:#34d399">#ภูมิศาสตร์</span><span class="htag" style="border-color:#818cf8;color:#818cf8">#ทวีปหลัก</span><span class="htag lk">🔗 2 links</span></div>
  <svg style="position:absolute;inset:0;width:100%;height:100%">
    ${AREAS.map(([, col, fill, pts]) => `
    <polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}" stroke="${col}" stroke-width="1.6"/>
    ${pts.map(([px, py]) => `<circle cx="${px}" cy="${py}" r="4.5" fill="var(--surface)" stroke="${col}" stroke-width="2"/>`).join('')}`).join('')}
  </svg>
  ${AREAS.map(([name, col, , pts, xy]) => {
    const [cx, cy] = centroid(pts);
    return `<div class="alabel" style="left:${cx}px;top:${cy}px;color:${col}">${name}<span class="axy">${xy} · ${pts.length} nodes</span></div>`;
  }).join('')}
  <div class="chint">🖱 คลิกขวาค้างลาก = เลื่อนกราฟ · Scroll = ซูม</div>
  <div class="czoom"><span class="zbtn">−</span><span class="zlvl">100%</span><span class="zbtn">+</span><span class="zsep"></span>grid 24px = 10 km</div>
</div>`;
fs.writeFileSync(path.join(OUT, '03-locator.html'),
  page('locator', 'world', 'map',
    [['ตัวละคร', 'Classifier', 0], ['แผนที่ทวีป', 'Locator', 1]],
    mapContent, 'เอเธเรีย <b>›</b> แผนที่ทวีป', 'Minor · Locator',));

/* ── screen 4: Chronicler ── */
const tlContent = `
<div class="detail-head" style="border-color:#fbbf24">
  <h2>ยุคแห่งไฟ <span class="chip" style="margin-left:6px">Chronicler</span></h2>
  <div class="sub">Event เก็บ date (d/m/y) + time (h:min) · วางบนเส้นตรง</div>
  <div class="mtags"><span class="htag" style="border-color:#fbbf24;color:#fbbf24">#ประวัติศาสตร์</span><span class="htag" style="border-color:#818cf8;color:#818cf8">#ทวีปหลัก</span><span class="htag lk">🔗 2 links</span>${viewbar(TL_VIEWS, 0)}</div>
</div>
<div style="position:relative;height:420px;margin-top:70px">
  <div style="position:absolute;left:20px;right:20px;top:200px;height:2px;background:var(--border)"></div>
  ${/* month ruler ticks — the axis is a real time scale */''}
  ${[['ม.ค. 1024', 70], ['เม.ย. 1024', 293], ['ก.ค. 1024', 516], ['ต.ค. 1024', 741], ['ม.ค. 1025', 964]].map(([lb, x]) => `
  <div style="position:absolute;left:${x}px;top:194px;width:1px;height:14px;background:var(--t3);opacity:.55"></div>
  <div style="position:absolute;left:${x - 40}px;top:288px;width:80px;text-align:center;font-size:9.5px;color:var(--t3)">${lb}</div>`).join('')}
  ${/* node spacing is proportional to the actual time gaps (days since first event × px/day) */''}
  ${[
    ['วันล่มสลายของหอคอย', '3/1/1024 09:00', 0, -1, '#f87171'],
    ['อารินพบเซลีน', '17/4/1024 18:30', 105, 1, '#818cf8'],
    ['สัตยาบันหุบเขาเหนือ', '2/9/1024 12:00', 243, -1, '#34d399'],
    ['ศึกทะเลทรายแดง', '21/11/1024 05:45', 323, 1, '#fbbf24'],
    ['ราชาภิเษกครั้งใหม่', '6/2/1025 10:00', 400, -1, '#c084fc'],
  ].map(([n, d, days, side, col]) => { const x = Math.round(70 + days * 2.45); return `
  <div style="position:absolute;left:${x - 5}px;top:${196}px;width:10px;height:10px;border-radius:50%;background:${col};box-shadow:0 0 0 4px rgba(0,0,0,.35)"></div>
  <div style="position:absolute;left:${x - 75}px;top:${side < 0 ? 128 : 232}px;width:150px;text-align:center">
    <div style="font-size:12px;color:var(--t1)">${n}</div><div style="font-size:10px;color:var(--t3)">${d}</div>
  </div>
  <div style="position:absolute;left:${x}px;top:${side < 0 ? 168 : 206}px;width:1px;height:28px;background:var(--border)"></div>`; }).join('')}
  <div style="position:absolute;left:70px;top:330px;font-size:10px;color:var(--t3)">ระยะห่างของ node = อัตราส่วนเวลาจริง (2.45px/วัน ที่ซูม 100%)</div>
  <div class="chint" style="left:0;bottom:0">🖱 คลิกขวาค้างลาก = เลื่อนกราฟ · Scroll = ซูม</div>
  <div class="czoom" style="right:0;bottom:0"><span class="zbtn">−</span><span class="zlvl">100%</span><span class="zbtn">+</span><span class="zsep"></span>2.45px / วัน</div>
</div>`;
fs.writeFileSync(path.join(OUT, '04-chronicler.html'),
  page('chronicler', 'world', 'tl',
    [['แผนที่ทวีป', 'Locator', 0], ['ยุคแห่งไฟ', 'Chronicler', 1]],
    tlContent, 'เอเธเรีย <b>›</b> ยุคแห่งไฟ', 'Minor · Chronicler'));

/* ── screen 5: inspector (+ / :) ── */
const inspPage = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>inspector</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail('world')}
${hub('map')}
<main id="main">
${etabs([['แผนที่ทวีป', 'Locator', 1]])}
<div style="display:flex;flex:1;min-height:0">
<div id="content" style="flex:1">${mapContent}</div>
<div id="inspector">
  <div class="insp-head">${ic.doc} Module Inspector — แผนที่ทวีป</div>
  <div class="insp-head" style="border-top:1px solid var(--border);background:var(--raised)">Module detail spec</div>
  <div class="prop"><span class="pk">ชนิด</span><span class="pv">Locator</span></div>
  <div class="prop"><span class="pk">คำอธิบาย</span><span class="pv">แผนที่ทวีปหลักของเอเธเรีย</span></div>
  <div class="prop"><span class="pk">สเกล grid</span><span class="pv">24px = 10 km</span></div>
  <div class="prop"><span class="pk">เชื่อมกับ</span><span class="pv">ยุคแห่งไฟ (Timeline)</span></div>
  <div class="prop"><span class="pk">Tag link</span><span style="display:flex;gap:5px;flex-wrap:wrap"><span class="htag" style="border-color:#34d399;color:#34d399">#ภูมิศาสตร์</span><span class="htag" style="border-color:#818cf8;color:#818cf8">#ทวีปหลัก</span><span class="htag" style="border-color:var(--border);color:var(--t3)">+</span></span></div>
  <div class="prop"><span class="pk">เพิ่ม detail</span><span class="pv ghost">เพิ่มรายละเอียด…</span></div>
  <div class="insp-head" style="border-top:1px solid var(--border);background:var(--raised)">Module attribute</div>
  <div class="prop"><span class="pk">ภูมิอากาศ</span><span class="pv">อบอุ่น ลมทะเลตะวันตก</span></div>
  <div class="prop"><span class="pk">ประชากรรวม</span><span class="pv">~2.1 ล้านคน</span></div>
  <div class="prop"><span class="pk">เพิ่ม attribute</span><span class="pv ghost">+ สร้างอิสระ ไม่ต้องใช้ template…</span></div>
  <div class="insp-head" style="border-top:1px solid var(--border);background:var(--raised)">Module link</div>
  <div class="prop"><span class="pk">Outgoing</span><span style="display:flex;gap:5px;flex-wrap:wrap"><span class="htag" style="border-color:var(--accent);color:var(--accentH)">[[ยุคแห่งไฟ]]</span><span class="htag" style="border-color:var(--accent);color:var(--accentH)">[[อาริน]]</span></span></div>
  <div class="prop"><span class="pk">Backlinks</span><span style="display:flex;gap:5px;flex-wrap:wrap"><span class="htag">แผนที่+เวลา</span><span class="htag">เล่ม 1 — จุดเริ่มต้น</span></span></div>
  <div class="insp-head" style="border-top:1px solid var(--border);background:var(--raised)">Module UI spec</div>
  <div class="prop"><span class="pk">มุมมอง</span><span class="pv">Canvas + grid BG</span></div>
  <div class="prop"><span class="pk">แสดงพิกัด</span><span class="pv">เปิด (x,y บนการ์ด Area)</span></div>
  <div class="prop"><span class="pk">สี Area</span><span class="pv">ตามสีของ item</span></div>
  <div class="prop"><span class="pk">เพิ่ม UI spec</span><span class="pv ghost">กำหนดการแสดงผล…</span></div>
</div>
</div>
</main>
</div>
${statusbar('เอเธเรีย <b>›</b> แผนที่ทวีป', 'Minor · Locator')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '05-inspector.html'), inspPage);

/* ── screen 6: Chat "Scribe" ── */
const chatContent = `
<div class="detail-head" style="border-color:#0ea5e9">
  <h2>แชตไอเดีย <span class="chip" style="margin-left:6px">Scribe · 1 session = 1 note</span></h2>
  <div class="sub">จดข้อความเป็น bubble ตามเวลา</div>
  <div class="mtags"><span class="htag" style="border-color:#0ea5e9;color:#0ea5e9">#ไอเดีย</span><span class="htag" style="border-color:#f43f5e;color:#f43f5e">#เล่ม2</span><span class="htag lk">🔗 1 link</span></div>
</div>
<div style="max-width:720px;display:flex;flex-direction:column;gap:10px;margin-top:18px">
  ${[
    ['ไอเดีย: ให้เคียร์เป็นมังกรตัวสุดท้ายที่จำสงครามเก่าได้', '09:14'],
    ['ฉากเปิดเล่ม 2 — อารินกลับไปที่หอคอยที่พังแล้ว', '09:16'],
    ['เช็ก timeline: ศึกทะเลทรายแดงต้องมาก่อนราชาภิเษก', '09:21'],
    ['ชื่อบท: "เถ้าถ่านของเวรีเดียน" ?', '10:02'],
  ].map(([m, t]) => `<div style="align-self:flex-end;max-width:78%;background:var(--accent);color:#fff;border-radius:14px 14px 4px 14px;padding:9px 13px;font-size:12.5px">${m}<div style="font-size:9.5px;opacity:.7;text-align:right;margin-top:3px">${t}</div></div>`).join('')}
  <div style="align-self:flex-end;color:var(--t3);font-size:10px">วันนี้ · session: แชตไอเดีย</div>
</div>
<div style="position:absolute;left:22px;right:22px;bottom:16px;display:flex;gap:8px">
  <input style="flex:1;background:var(--raised);border:1px solid var(--border);border-radius:18px;padding:9px 14px;color:var(--t3);font-size:12.5px" placeholder="พิมพ์โน้ต…">
  <div class="btn btn-p" style="border-radius:18px">ส่ง</div>
</div>`;
fs.writeFileSync(path.join(OUT, '06-scribe-chat.html'),
  page('scribe-chat', 'scribe', 'bookm',
    [['เล่ม 1 — จุดเริ่มต้น', 'Author', 0], ['แชตไอเดีย', 'Scribe', 1]],
    chatContent, 'นิยายหลัก <b>›</b> แชตไอเดีย', 'Minor · Scribe'));

/* ── screen 7: Settings — module name display mode (classic ↔ unique) ── */
const settingsOverlay = `
<div style="position:absolute;top:42px;right:12px;width:320px;background:var(--surface);border:1px solid var(--border);border-radius:var(--rl);box-shadow:0 18px 60px rgba(0,0,0,.55);z-index:20">
  <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 15px;border-bottom:1px solid var(--border);font-weight:650;font-size:13.5px">Settings <span style="color:var(--t3)">✕</span></div>
  <div style="padding:11px 15px;border-bottom:1px solid var(--border)">
    <div style="font-size:11px;color:var(--t2);font-weight:600;margin-bottom:7px">ชื่อที่แสดงของโมดูล · Module names</div>
    <div style="display:flex;border:1px solid var(--border);border-radius:var(--rs);overflow:hidden;font-size:12px;text-align:center">
      <div style="flex:1;padding:6px 0;color:var(--t2)">Classic</div>
      <div style="flex:1;padding:6px 0;background:var(--accent);color:#fff;font-weight:600">Unique</div>
    </div>
    <table style="width:100%;margin-top:8px;font-size:10.5px;color:var(--t3);border-collapse:collapse">
      <tr><td style="padding:1px 0">Classic:</td><td>Category · Map · Timeline · Chat · Doc</td></tr>
      <tr><td style="padding:1px 0;color:var(--accentH)">Unique:</td><td style="color:var(--accentH)">Classifier · Locator · Chronicler · Scribe · Drafter</td></tr>
    </table>
  </div>
  <div style="padding:11px 15px;border-bottom:1px solid var(--border)">
    <div style="font-size:11px;color:var(--t2);font-weight:600;margin-bottom:7px">Version control</div>
    <div style="display:flex;align-items:center;gap:8px;font-size:12px">
      <span style="color:var(--t2)">เก็บสูงสุด</span>
      <span style="background:var(--raised);border:1px solid var(--border);border-radius:var(--rs);padding:4px 12px;font-weight:600">50</span>
      <span style="color:var(--t2)">versions / module</span>
    </div>
    <div style="font-size:10.5px;color:var(--t3);margin-top:6px">บันทึกทุกการแก้ไข ย้อนกลับได้จาก Version History · เกิน limit จะลบ version เก่าสุด</div>
  </div>
  <div style="padding:11px 15px;border-bottom:1px solid var(--border)">
    <div style="font-size:11px;color:var(--t2);font-weight:600;margin-bottom:7px;display:flex;justify-content:space-between">ขนาดฟอนต์ · Font size <span style="color:var(--accentH)">110%</span></div>
    <div style="height:4px;background:var(--raised);border-radius:2px;position:relative"><div style="width:55%;height:100%;background:var(--accent);border-radius:2px"></div><i style="position:absolute;left:55%;top:-4px;width:12px;height:12px;border-radius:50%;background:#fff"></i></div>
    <div style="font-size:10px;color:var(--t3);margin-top:5px">เปลี่ยนเฉพาะขนาดตัวอักษร ไม่กระทบ layout/ไอคอน</div>
  </div>
  <div style="padding:11px 15px;border-bottom:1px solid var(--border)">
    <div style="font-size:11px;color:var(--t2);font-weight:600;margin-bottom:7px;display:flex;justify-content:space-between">ขนาด UI · UI size <span style="color:var(--accentH)">100%</span></div>
    <div style="height:4px;background:var(--raised);border-radius:2px;position:relative"><div style="width:50%;height:100%;background:var(--accent);border-radius:2px"></div><i style="position:absolute;left:50%;top:-4px;width:12px;height:12px;border-radius:50%;background:#fff"></i></div>
    <div style="font-size:10px;color:var(--t3);margin-top:5px">สเกลทั้ง UI (50–200%) เหมือนเดิม</div>
  </div>
  <div style="padding:11px 15px;border-bottom:1px solid var(--border)">
    <div style="font-size:11px;color:var(--t2);font-weight:600;margin-bottom:7px;display:flex;justify-content:space-between">ธีม · Theme <span style="color:var(--accentH)">+ สร้างธีมเอง</span></div>
    ${[['midnight',1],['daylight',0],['มังกรราตรี (custom)',0]].map(([n,a]) => `
    <div style="display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:var(--rs);font-size:12px;${a?'background:var(--raised)':''};color:${a?'var(--t1)':'var(--t2)'}">
      <span style="display:flex;gap:2px">${['#0f0f13','#22222d','#6366f1'].map(c=>`<i style="width:9px;height:9px;border-radius:2px;background:${c};display:inline-block"></i>`).join('')}</span>
      ${n} ${a?'<span style="margin-left:auto;color:var(--accentH)">✓</span>':''}
    </div>`).join('')}
  </div>
  <div style="padding:11px 15px 14px">
    <div style="font-size:11px;color:var(--t2);font-weight:600;margin-bottom:7px">ภาษา · Language</div>
    <div style="background:var(--raised);border:1px solid var(--border);border-radius:var(--rs);padding:6px 10px;font-size:12px">ไทย (th) ▾</div>
  </div>
</div>`;
fs.writeFileSync(path.join(OUT, '07-settings.html'),
  page('settings', 'world', 'chars',
    [['ตัวละคร', 'Classifier', 1], ['แผนที่ทวีป', 'Locator', 0]],
    catContent, 'เอเธเรีย <b>›</b> ตัวละคร', 'Major › Minor · Classifier', settingsOverlay));
/* ══ additional module screens + split builder ══ */

// ── 08 Manager (Project) — opens to browse its contents ──
const managerContent = `
<div class="detail-head" style="border-color:#22c55e">
  <h2>เอเธเรีย <span class="chip" style="margin-left:6px">Manager</span></h2>
  <div class="sub">Major module · เปิดดูเนื้อหาภายในได้ · 6 modules</div>
  <div class="mtags"><span class="htag" style="border-color:#22c55e;color:#22c55e">#โลกหลัก</span><span class="htag" style="border-color:#818cf8;color:#818cf8">#เนื้อเรื่องหลัก</span><span class="htag lk">🔗 5 links</span></div>
</div>
<div style="display:flex;gap:8px;margin-bottom:16px">
  <div class="btn btn-p">${ic.plus} สร้าง Minor module</div>
  <div class="btn btn-s">${ic.edit} แก้ไข</div>
</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:980px">
  ${[
    ['ตัวละคร', 'Classifier', 'layer', '#38bdf8', '14 objects'],
    ['แผนที่ทวีป', 'Locator', 'map', '#34d399', '4 areas'],
    ['ยุคแห่งไฟ', 'Chronicler', 'timeline', '#fbbf24', '5 events'],
    ['เส้นทางเนื้อเรื่อง', 'Narrator', 'story', '#c084fc', '7 dialogues'],
    ['โน้ตเบื้องหลัง', 'Inspector', 'doc', '#94a3b8', 'note'],
    ['แผนที่+เวลา', 'Wanderer', 'relation', '#f97316', '1 map · 1 timeline'],
  ].map(([n, k, icn, col, meta]) => `
  <div style="border:1px solid var(--border);border-radius:var(--r);padding:13px;background:var(--surface)">
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:6px">
      <span class="kicon" style="color:${col}">${ic[icn]}</span>
      <b style="font-size:13px">${n}</b>
      <span class="kind" style="margin-left:auto;font-size:9.5px;color:var(--t3);border:1px solid var(--border);border-radius:3px;padding:0 4px">${k}</span>
    </div>
    <div style="font-size:11px;color:var(--t3)">${meta}</div>
  </div>`).join('')}
</div>`;
fs.writeFileSync(path.join(OUT, '08-manager.html'),
  page('manager', 'world', 'world', [['เอเธเรีย', 'Manager', 1]],
    managerContent, '<b>เอเธเรีย</b>', 'Major · Manager'));

// ── 09 Detail (Inspector) — small note field ──
const detailContent = `
<div class="detail-head" style="border-color:#94a3b8">
  <h2>โน้ตเบื้องหลัง <span class="chip" style="margin-left:6px">Inspector</span></h2>
  <div class="sub">โน้ตสั้นสำหรับรายละเอียดเล็กๆ น้อยๆ</div>
  <div class="mtags"><span class="htag" style="border-color:#94a3b8;color:#94a3b8">#เบื้องหลัง</span><span class="htag lk">🔗 2 links</span></div>
</div>
<div style="max-width:680px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;font-size:13px;line-height:1.8;color:var(--t2)">
ระบบเวทในเอเธเรียดึงพลังจาก "กระแสธาร" ใต้ดิน — เมืองที่อยู่ใกล้กระแสธารจะเจริญกว่า
<br>ตระกูลของ<span style="color:var(--accentH)">[[อาริน]]</span>เคยเป็นผู้เฝ้าหอคอยมาก่อนเหตุการณ์<span style="color:var(--accentH)">[[วันล่มสลายของหอคอย]]</span>
<br><span style="color:var(--t3)">แก้ไขล่าสุด 2 ชม.ที่แล้ว · 84 คำ</span>
</div>`;
fs.writeFileSync(path.join(OUT, '09-detail.html'),
  page('detail', 'world', 'note', [['โน้ตเบื้องหลัง', 'Inspector', 1]],
    detailContent, 'เอเธเรีย <b>›</b> โน้ตเบื้องหลัง', 'Minor · Inspector'));

// ── shared mini fragments for composed views ──
const miniMap = (h) => `
<div class="canvas">
  <svg style="position:absolute;inset:0;width:100%;height:100%">
    <polygon points="140,60 260,40 320,110 260,180 150,160" fill="rgba(52,211,153,.12)" stroke="#34d399" stroke-width="1.5"/>
    ${[[140,60],[260,40],[320,110],[260,180],[150,160]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="var(--surface)" stroke="#34d399" stroke-width="2"/>`).join('')}
    <polygon points="420,150 540,130 580,220 470,250" fill="rgba(56,189,248,.12)" stroke="#38bdf8" stroke-width="1.5"/>
    ${[[420,150],[540,130],[580,220],[470,250]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="var(--surface)" stroke="#38bdf8" stroke-width="2"/>`).join('')}
    ${h ? `<circle cx="230" cy="110" r="9" fill="#f97316" stroke="#fff" stroke-width="2"/>` : ''}
  </svg>
  <div class="alabel" style="left:225px;top:112px;color:#34d399">นครหลวงเวรีเดียน<span class="axy">x: 420 · y: 180 · 5 nodes</span></div>
  <div class="alabel" style="left:500px;top:190px;color:#38bdf8">ท่าเรือมูนเบย์<span class="axy">x: 660 · y: 640 · 4 nodes</span></div>
  ${h ? `<div class="alabel" style="left:230px;top:76px;color:#f97316">Link: กองทัพมาถึง<span class="axy">เวลา: 21/11/1024 05:45</span></div>` : ''}
  <div class="czoom" style="right:10px;bottom:10px"><span class="zbtn">−</span><span class="zlvl">100%</span><span class="zbtn">+</span></div>
</div>`;
const miniTl = (hl) => `
<div style="position:absolute;inset:0;background:var(--bg)">
  <div style="position:absolute;left:24px;right:24px;top:56%;height:2px;background:var(--border)"></div>
  ${[['3/1/1024', 6, '#f87171', 0], ['17/4/1024', 26, '#818cf8', 0], ['2/9/1024', 52, '#34d399', 0], ['21/11/1024', 68, '#fbbf24', 1], ['6/2/1025', 84, '#c084fc', 0]]
    .map(([d, x, col, h]) => `
    <div style="position:absolute;left:calc(${x}% - 5px);top:calc(56% - 4px);width:10px;height:10px;border-radius:50%;background:${col};${h && hl ? 'box-shadow:0 0 0 5px rgba(251,191,36,.25)' : ''}"></div>
    <div style="position:absolute;left:calc(${x}% - 40px);top:calc(56% + 14px);width:80px;text-align:center;font-size:9.5px;color:${h && hl ? col : 'var(--t3)'}">${d}</div>`).join('')}
  ${hl ? `<div style="position:absolute;left:calc(68% - 30px);top:calc(56% - 44px);font-size:11px;color:#fbbf24">ศึกทะเลทรายแดง ◂ เลือกเวลาให้ Link</div>` : ''}
  <div class="czoom" style="right:10px;bottom:8px"><span class="zbtn">−</span><span class="zlvl">100%</span><span class="zbtn">+</span></div>
</div>`;

// ── 10 Wanderer (TimeMap) — dual graph: map pane + timeline pane ──
const wandererContent = `
<div style="position:absolute;inset:0;display:flex;flex-direction:column">
  <div style="padding:12px 18px 10px;border-bottom:1px solid var(--border)">
    <div style="display:flex;align-items:center;gap:8px">
      <b style="font-size:15px">แผนที่+เวลา</b><span class="chip">Wanderer</span>
      <span style="font-size:11px;color:var(--t3)">อ้างอิง: แผนที่ทวีป (Locator) + ยุคแห่งไฟ (Chronicler)</span>
      <span class="htag" style="margin-left:auto;border-color:#f97316;color:#f97316">#การเดินทัพ</span>
    </div>
  </div>
  <div style="flex:1.35;position:relative;border-bottom:1px solid var(--border)">${miniMap(true)}</div>
  <div style="flex:1;position:relative">${miniTl(true)}</div>
</div>`;
const wandererPage = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>wanderer</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail('world')}
${hub('world')}
<main id="main">
${etabs([['แผนที่+เวลา', 'Wanderer', 1]])}
<div id="content" style="padding:0">${wandererContent}</div>
</main>
</div>
${statusbar('เอเธเรีย <b>›</b> แผนที่+เวลา', 'Minor · Wanderer')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '10-wanderer.html'), wandererPage);

// ── 11 Narrator (Story) — graph board with Dialogue nodes ──
const dlg = (x, y, col, name, txt, sel) => `
<div style="position:absolute;left:${x}px;top:${y}px;width:170px;border:1.5px solid ${col};border-radius:var(--r);background:rgba(24,24,31,.92);padding:9px 12px;${sel ? 'box-shadow:0 0 0 3px rgba(99,102,241,.3)' : ''}">
  <div style="font-size:12px;font-weight:650;color:${col}">${name}</div>
  <div style="font-size:10.5px;color:var(--t2);margin-top:3px;line-height:1.5">${txt}</div>
</div>`;
const narratorContent = `
<div class="canvas">
  <div class="cmtags"><span class="htag" style="border-color:#c084fc;color:#c084fc">#บทที่1</span></div>
  <svg style="position:absolute;inset:0;width:100%;height:100%">
    <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#5a5a72"/></marker></defs>
    <line x1="235" y1="255" x2="335" y2="140" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#arr)"/>
    <line x1="235" y1="285" x2="335" y2="370" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#arr)"/>
    <line x1="515" y1="135" x2="615" y2="245" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#arr)"/>
    <line x1="515" y1="375" x2="615" y2="280" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#arr)"/>
    <line x1="795" y1="260" x2="872" y2="260" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#arr)"/>
  </svg>
  ${dlg(60, 230, '#c084fc', 'เปิดเรื่อง', 'อาริน: "หอคอยนั่น…มันเคยเป็นบ้านของข้า"', false)}
  ${dlg(340, 90, '#34d399', 'ช่วยหมู่บ้าน', 'เซลีน: "ได้ยินเสียงร้องจากหมู่บ้านทางเหนือ!"', true)}
  ${dlg(340, 330, '#fbbf24', 'เดินทางต่อ', 'อาริน: "เวลาของเราไม่พอ… ต้องไปต่อ"', false)}
  ${dlg(620, 220, '#38bdf8', 'พบท่านเคียร์', 'เคียร์: "เจ้ามาช้ากว่าที่ข้าคาด มนุษย์น้อย"', false)}
  ${dlg(875, 220, '#f87171', 'จบบทที่ 1', 'Conversation ถูกบันทึกไว้ในแต่ละ node', false)}
  <div class="chint">🖱 คลิกขวาค้างลาก = เลื่อนกราฟ · Scroll = ซูม · ลาก node เพื่อจัด Route</div>
  <div class="czoom"><span class="zbtn">−</span><span class="zlvl">100%</span><span class="zbtn">+</span><span class="zsep"></span>Route: 2 ทางแยก</div>
</div>`;
fs.writeFileSync(path.join(OUT, '11-narrator.html'),
  page('narrator', 'world', 'world', [['เส้นทางเนื้อเรื่อง', 'Narrator', 1]],
    narratorContent, 'เอเธเรีย <b>›</b> เส้นทางเนื้อเรื่อง', 'Minor · Narrator'));

// ── 12 Author (Book) — chapters + long-form content ──
const authorContent = `
<div style="position:absolute;inset:0;display:flex">
  <div style="width:230px;border-right:1px solid var(--border);background:var(--surface);padding:10px 0">
    <div style="padding:0 14px 8px;font-size:11px;font-weight:700;letter-spacing:.05em;color:var(--t2)">CHAPTERS · เล่ม 1</div>
    ${[['1. เถ้าถ่านของเวรีเดียน', 1], ['2. เสียงจากป่าตะวันตก', 0], ['3. สัญญาบนหุบเขา', 0], ['4. ก่อนพายุทราย', 0]]
      .map(([n, a]) => `<div class="li ${a ? 'sel' : ''}" style="margin:0 6px">${n}</div>`).join('')}
    <div class="li" style="margin:0 6px;color:var(--t3)">+ เพิ่ม Chapter</div>
  </div>
  <div style="flex:1;padding:22px 34px;overflow:auto">
    <div class="detail-head" style="border-color:#f43f5e">
      <h2>เล่ม 1 — จุดเริ่มต้น <span class="chip" style="margin-left:6px">Author</span></h2>
      <div class="sub">Chapter 1 · เถ้าถ่านของเวรีเดียน</div>
      <div class="mtags"><span class="htag" style="border-color:#f43f5e;color:#f43f5e">#ต้นฉบับ</span><span class="htag lk">🔗 4 links</span></div>
    </div>
    <div style="max-width:660px;font-size:13.5px;line-height:2;color:var(--t2)">
      ควันยังไม่จางจากขอบฟ้าทางเหนือ เมื่อ<span style="color:var(--accentH)">[[อาริน]]</span>ก้าวข้ามซากประตูเมือง
      หินอ่อนที่เคยขาวสะอาดบัดนี้ดำเป็นเถ้า…<br>
      "เจ้ายังจำทางเข้าหอสมุดได้ไหม" <span style="color:var(--accentH)">[[เซลีน]]</span>ถามเบาๆ
      เสียงของนางกลืนหายไปกับลมที่พัดผ่านซากเมือง<br>
      <span style="color:var(--t3)">▌</span>
    </div>
  </div>
</div>`;
const authorPage = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>author</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail('novel')}
${hub('bookm')}
<main id="main">
${etabs([['เล่ม 1 — จุดเริ่มต้น', 'Author', 1]])}
<div id="content" style="padding:0">${authorContent}</div>
</main>
</div>
${statusbar('นิยายหลัก <b>›</b> เล่ม 1 <b>›</b> บทที่ 1', 'Minor · Author', '<span>1,204 words</span><span style="color:var(--success)">✓ saved</span>')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '12-author.html'), authorPage);

// ── 13 Drafter (Doc) — blank markdown page ──
const drafterContent = `
<div class="detail-head" style="border-color:#818cf8">
  <h2>ไอเดียระบบเวท <span class="chip" style="margin-left:6px">Drafter</span></h2>
  <div class="sub">กระดาษเปล่าแบบ .md · Ctrl+E สลับโหมดแก้ไข/อ่าน</div>
  <div class="mtags"><span class="htag" style="border-color:#818cf8;color:#818cf8">#เวทมนตร์</span><span class="htag" style="border-color:#34d399;color:#34d399">#ดราฟต์</span><span class="htag lk">🔗 2 links</span></div>
</div>
<div style="display:flex;gap:5px;margin-bottom:12px;color:var(--t3)">
  ${['B', 'I', 'H1', 'H2', '❝', '¶', '• —', '[[ ]]'].map(b => `<span style="border:1px solid var(--border);border-radius:4px;padding:2px 9px;font-size:11px;background:var(--raised)">${b}</span>`).join('')}
</div>
<div style="max-width:700px;font-size:13.5px;line-height:1.9;color:var(--t2)">
  <div style="font-size:19px;font-weight:700;color:var(--t1);margin-bottom:6px"># ระบบเวทกระแสธาร</div>
  เวทมนตร์ทุกสายดึงพลังจาก<b>กระแสธาร</b>ใต้ดิน แบ่งเป็น 3 ระดับ:<br>
  <span style="color:var(--t3)">-</span> ระดับผิว — ใช้ได้ทั่วไป เสื่อมเร็ว<br>
  <span style="color:var(--t3)">-</span> ระดับกลาง — ต้องผ่านพิธี เชื่อมกับ <span style="color:var(--accentH)">[[ภาคีนักเวท]]</span><br>
  <span style="color:var(--t3)">-</span> ระดับลึก — ต้องห้าม เกี่ยวข้องกับ <span style="color:var(--accentH)">[[วันล่มสลายของหอคอย]]</span><br>
  <span style="border-left:3px solid var(--border);padding-left:10px;color:var(--t3);display:inline-block;margin-top:6px">โน้ต: มังกรไม่ใช้กระแสธาร — พวกเขา "เป็น" กระแสธารเอง</span>
</div>`;
fs.writeFileSync(path.join(OUT, '13-drafter.html'),
  page('drafter', 'scribe', 'note', [['ไอเดียระบบเวท', 'Drafter', 1]],
    drafterContent, 'เอเธเรีย <b>›</b> ไอเดียระบบเวท', 'Minor · Drafter'));

// ── 14 Viewer (Analys) — result of a saved filter ──
const viewerContent = `
<div class="detail-head" style="border-color:#a3e635">
  <h2>รวมฉากสำคัญ <span class="chip" style="margin-left:6px">Viewer · read-only</span></h2>
  <div class="sub">แสดงผลของ list ที่ filter ไว้ · อัปเดตอัตโนมัติเมื่อข้อมูลต้นทางเปลี่ยน</div>
  <div class="mtags"><span class="htag" style="border-color:#a3e635;color:#a3e635">#สรุป</span><span class="htag lk">🔗 3 links</span>${viewbar(VIEWER_VIEWS, 0)}</div>
</div>
<div style="display:flex;gap:7px;margin-bottom:14px;align-items:center;font-size:11.5px">
  <span style="color:var(--t3)">Filter:</span>
  ${['ชนิด = Event + Dialogue', 'tag = #หลัก', 'ช่วงเวลา = ปี 1024', 'เรียงตามเวลา'].map(f => `<span class="chip" style="border-color:var(--accent);color:var(--accentH)">${f}</span>`).join('')}
  <span class="btn btn-s btn-i" style="margin-left:auto">${ic.edit}</span>
</div>
<table class="mock">
<tr><th>ชื่อ</th><th>มาจาก module</th><th>ชนิด</th><th>เวลา</th><th>Tags</th></tr>
<tr><td>วันล่มสลายของหอคอย</td><td>ยุคแห่งไฟ</td><td>Event</td><td>3/1/1024 09:00</td><td><span class="chip">#หลัก</span></td></tr>
<tr><td>อารินพบเซลีน</td><td>ยุคแห่งไฟ</td><td>Event</td><td>17/4/1024 18:30</td><td><span class="chip">#หลัก</span></td></tr>
<tr><td>ช่วยหมู่บ้าน</td><td>เส้นทางเนื้อเรื่อง</td><td>Dialogue</td><td>บทที่ 1</td><td><span class="chip">#หลัก</span></td></tr>
<tr><td>ศึกทะเลทรายแดง</td><td>ยุคแห่งไฟ</td><td>Event</td><td>21/11/1024 05:45</td><td><span class="chip">#หลัก</span></td></tr>
</table>`;
fs.writeFileSync(path.join(OUT, '14-viewer.html'),
  page('viewer', 'world', 'world', [['รวมฉากสำคัญ', 'Viewer', 1]],
    viewerContent, 'เอเธเรีย <b>›</b> รวมฉากสำคัญ', 'Minor · Viewer'));

// ── 15 Connector (Relation) — relation graph of a filtered list ──
const cnode = (x, y, col, name) => `
<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);text-align:center">
  <div style="width:46px;height:46px;border-radius:50%;border:2px solid ${col};background:rgba(24,24,31,.92);margin:0 auto;display:flex;align-items:center;justify-content:center;color:${col}">${ic.person}</div>
  <div style="font-size:11px;color:var(--t1);margin-top:4px;text-shadow:0 1px 6px rgba(0,0,0,.8)">${name}</div>
</div>`;
const elbl = (x, y, txt, col) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);font-size:9.5px;color:${col};background:var(--bg);padding:0 5px;border:1px solid var(--border);border-radius:7px">${txt}</div>`;
const connectorContent = `
<div class="canvas">
  <div class="cmtags"><span class="chip" style="border-color:var(--accent);color:var(--accentH)">Filter: ตัวละคร · tag #หลัก</span></div>
  <svg style="position:absolute;inset:0;width:100%;height:100%">
    <line x1="420" y1="260" x2="700" y2="180" stroke="#34d399" stroke-width="1.6"/>
    <line x1="420" y1="260" x2="640" y2="420" stroke="#818cf8" stroke-width="1.6"/>
    <line x1="700" y1="180" x2="920" y2="330" stroke="#fbbf24" stroke-width="1.6"/>
    <line x1="640" y1="420" x2="920" y2="330" stroke="#f87171" stroke-width="1.6" stroke-dasharray="5 4"/>
  </svg>
  ${cnode(420, 260, '#818cf8', 'อาริน')}
  ${cnode(700, 180, '#f472b6', 'เซลีน')}
  ${cnode(640, 420, '#fb923c', 'ท่านเคียร์')}
  ${cnode(920, 330, '#a78bfa', 'มอร์แกน')}
  ${elbl(560, 218, 'เพื่อนร่วมทาง', '#34d399')}
  ${elbl(520, 345, 'ผู้พิทักษ์', '#818cf8')}
  ${elbl(815, 252, 'ศัตรู', '#fbbf24')}
  ${elbl(780, 382, 'เคยปะทะ', '#f87171')}
  <div class="chint">🖱 คลิกขวาค้างลาก = เลื่อนกราฟ · Scroll = ซูม</div>
  <div class="czoom"><span class="zbtn">−</span><span class="zlvl">100%</span><span class="zbtn">+</span><span class="zsep"></span>4 nodes · 4 relations</div>
</div>`;
fs.writeFileSync(path.join(OUT, '15-connector.html'),
  page('connector', 'world', 'world', [['ผังความสัมพันธ์', 'Connector', 1]],
    connectorContent, 'เอเธเรีย <b>›</b> ผังความสัมพันธ์', 'Minor · Connector'));

// ── split builder ──
const pane = (tabName, kind, inner, pad) => `
<div class="pane">
  <div id="etabs"><div class="navhist"><span class="hbtn">◀</span><span class="hbtn dim">▶</span></div><div class="etab active"><span>${tabName}</span><span class="ek">${kind}</span><span class="tclose">×</span></div></div>
  <div class="pcontent" style="${pad ? '' : 'padding:0'}">${inner}</div>
</div>`;
const miniCat = `
<div style="font-weight:650;font-size:13px;margin-bottom:8px">ตัวละคร <span class="chip">Classifier</span></div>
<table class="mock" style="font-size:11.5px">
<tr><th>ชื่อ</th><th>เผ่า</th><th>บทบาท</th></tr>
<tr><td>อาริน</td><td>มนุษย์</td><td>ตัวเอก</td></tr>
<tr><td>เซลีน</td><td>เอลฟ์</td><td>คู่หู</td></tr>
<tr><td>ท่านเคียร์</td><td>มังกร</td><td>ผู้พิทักษ์</td></tr>
</table>`;
const miniChat = `
<div style="position:absolute;inset:0;display:flex;flex-direction:column;padding:12px">
  <div style="flex:1;display:flex;flex-direction:column;gap:8px;justify-content:flex-end">
    <div style="align-self:flex-end;max-width:85%;background:var(--accent);color:#fff;border-radius:12px 12px 4px 12px;padding:7px 11px;font-size:11.5px">ฉากเปิดเล่ม 2 — อารินกลับไปที่หอคอย<div style="font-size:9px;opacity:.7;text-align:right">09:16</div></div>
    <div style="align-self:flex-end;max-width:85%;background:var(--accent);color:#fff;border-radius:12px 12px 4px 12px;padding:7px 11px;font-size:11.5px">ชื่อบท: "เถ้าถ่านของเวรีเดียน" ?<div style="font-size:9px;opacity:.7;text-align:right">10:02</div></div>
  </div>
  <div style="display:flex;gap:6px;margin-top:10px">
    <div style="flex:1;background:var(--raised);border:1px solid var(--border);border-radius:14px;padding:6px 12px;font-size:11px;color:var(--t3)">พิมพ์โน้ต…</div>
    <div class="btn btn-p" style="border-radius:14px;font-size:11px">ส่ง</div>
  </div>
</div>`;
const miniDocPane = `
<div style="font-weight:650;font-size:13px;margin-bottom:8px">บทที่ 1 · เถ้าถ่านของเวรีเดียน <span class="chip">Author</span></div>
<div style="font-size:12px;line-height:1.9;color:var(--t2)">ควันยังไม่จางจากขอบฟ้าทางเหนือ เมื่อ<span style="color:var(--accentH)">[[อาริน]]</span>ก้าวข้ามซากประตูเมือง หินอ่อนที่เคยขาวสะอาดบัดนี้ดำเป็นเถ้า…<br>"เจ้ายังจำทางเข้าหอสมุดได้ไหม" <span style="color:var(--accentH)">[[เซลีน]]</span>ถามเบาๆ<br><span style="color:var(--t3)">▌</span></div>`;

const split2Page = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>split2</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail('novel')}
${hub('bookm')}
<main id="main">
<div class="split2">
${pane('เล่ม 1 — จุดเริ่มต้น', 'Author', miniDocPane, true)}
${pane('แผนที่ทวีป', 'Locator', miniMap(false), false)}
</div>
</main>
</div>
${statusbar('นิยายหลัก <b>›</b> เล่ม 1', 'Split 2 · Author + Locator')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '16-split2.html'), split2Page);

const split4Page = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>split4</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail('world')}
${hub('world')}
<main id="main">
<div class="split4">
${pane('ตัวละคร', 'Classifier', miniCat, true)}
${pane('แผนที่ทวีป', 'Locator', miniMap(false), false)}
${pane('ยุคแห่งไฟ', 'Chronicler', miniTl(false), false)}
${pane('แชตไอเดีย', 'Scribe', miniChat, false)}
</div>
</main>
</div>
${statusbar('เอเธเรีย', 'Split 4 · Classifier + Locator + Chronicler + Scribe')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '17-split4.html'), split4Page);
/* ══ 18: final state after ALL phases — everything live at once ══ */

// hub with all three sections expanded (Nexus nest + Sage Hut + Import Dock)
const hubFull = `
<aside id="hub">
  <div id="searchbar"><input placeholder="ค้นหา...  (Ctrl+P)"><span style="color:var(--t3)">‹</span></div>
  <div class="acc-head">${ic.chevD} Nexus nest <span class="act">${ic.folder}${ic.plus}</span></div>
  <div class="acc-body" style="flex:1.5">
    <div class="li sel"><span class="grip">⠿</span>${ic.tchevD}${ki('projects', '#22c55e')}<b>เอเธเรีย</b><span class="kind">Manager</span></div>
    <div class="li indent1">${ic.tchevR}${ki('layer', '#38bdf8')}ตัวละคร<span class="kind">Classifier</span></div>
    <div class="li indent1">${ki('map', '#34d399')}แผนที่ทวีป<span class="kind">Locator</span></div>
    <div class="li indent1">${ki('timeline', '#fbbf24')}ยุคแห่งไฟ<span class="kind">Chronicler</span></div>
    <div class="li indent1">${ki('relation', '#f97316')}แผนที่+เวลา<span class="kind">Wanderer</span></div>
    <div class="li indent1">${ki('story', '#c084fc')}เส้นทางเนื้อเรื่อง<span class="kind">Narrator</span></div>
    <div class="li"><span class="grip">⠿</span>${ic.tchevR}${ki('projects', '#f59e0b')}<b>ศึกมังกร</b><span class="kind">Manager</span></div>
    <div class="li"><span class="grip">⠿</span>${ic.tchevD}${ki('folder', '#ec4899')}<b>นิยายหลัก</b><span class="kind">Collector</span></div>
    <div class="li indent1">${ki('book', '#f43f5e')}เล่ม 1 — จุดเริ่มต้น<span class="kind">Author</span></div>
    <div class="li indent1">${ki('chat', '#0ea5e9')}แชตไอเดีย<span class="kind">Scribe</span></div>
    <div class="li indent1">${ki('doc', '#818cf8')}ไอเดียระบบเวท<span class="kind">Drafter</span></div>
    <div class="li indent1">${ki('list', '#a3e635')}รวมฉากสำคัญ<span class="kind">Viewer</span></div>
    <div class="li indent1">${ki('relation', '#f472b6')}ผังความสัมพันธ์<span class="kind">Connector</span></div>
  </div>
  <div class="acc-head">${ic.chevD} Sage Hut</div>
  <div class="acc-body" style="flex:.75">
    <div class="li">${ki('layer', '#818cf8')}Data size <span class="kind">3.2 MB</span></div>
    <div class="li sel">${ki('list', '#34d399')}Object amount <span class="kind">128</span></div>
    <div class="li">${ki('list', '#fbbf24')}Linker list <span class="kind">46</span></div>
    <div class="li">${ki('relation', '#f472b6')}Linker graph</div>
  </div>
  <div class="acc-head">${ic.chevD} Import Dock <span class="act">${ic.importD}</span></div>
  <div class="acc-body" style="flex:.9">
    <div class="li">${ki('folder', '#94a3b8')}assets/ <span class="kind">12 files</span></div>
    <div class="li indent1">${ki('doc', '#38bdf8')}dragon-ref.png <span class="kind">→ เคียร์</span></div>
    <div class="li indent1">${ki('doc', '#34d399')}world-notes.md <span class="kind">→ เอเธเรีย</span></div>
    <div class="li indent1">${ki('doc', '#fbbf24')}old-draft.docx <span class="kind">→ เล่ม 1</span></div>
  </div>
</aside>`;

const wandererPane = `
<div style="position:absolute;inset:0;display:flex;flex-direction:column">
  <div style="flex:1.3;position:relative;border-bottom:1px solid var(--border)">${miniMap(true)}</div>
  <div style="flex:1;position:relative">${miniTl(true)}</div>
</div>`;

const finalPage = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>final</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail('world')}
${hubFull}
<main id="main">
<div class="split2">
${pane('แผนที่+เวลา', 'Wanderer', wandererPane, false)}
${pane('เล่ม 1 — จุดเริ่มต้น', 'Author', miniDocPane, true)}
</div>
</main>
</div>
${statusbar('เอเธเรีย <b>›</b> แผนที่+เวลา', 'Split 2 · Wanderer + Author', '<span>1,204 words</span><span style="color:var(--success)">✓ saved</span>')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '18-final.html'), finalPage);

/* ══ multi-view pattern examples ══ */

// 20: Classifier — view 2: List + Detail
const clsListDetail = `
<div class="detail-head" style="border-color:#38bdf8">
  <h2>ตัวละคร <span class="chip" style="margin-left:6px">Classifier · Object</span></h2>
  <div class="mtags"><span class="htag" style="border-color:#38bdf8;color:#38bdf8">#ตัวละคร</span><span class="htag lk">🔗 3 links</span>${viewbar(CLS_VIEWS, 1)}</div>
</div>
<div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;height:560px">
  <div style="width:240px;border-right:1px solid var(--border);background:var(--surface);padding:8px 0">
    ${[['อาริน', '#818cf8', 1], ['เซลีน', '#f472b6', 0], ['ท่านเคียร์', '#fb923c', 0], ['มอร์แกน', '#a78bfa', 0]]
      .map(([n, c, a]) => `<div class="li ${a ? 'sel' : ''}" style="margin:0 6px">${ki('person', c)}${n}</div>`).join('')}
    <div class="li" style="margin:0 6px;color:var(--t3)">+ เพิ่ม Object</div>
  </div>
  <div style="flex:1;padding:18px 22px;overflow:auto">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      ${ki('person', '#818cf8')}<b style="font-size:16px">อาริน</b>
      <span class="htag" style="border-color:#818cf8;color:#818cf8">#หลัก</span>
      <span class="htag lk">🔗 4 links</span>
    </div>
    ${[['เผ่า', 'มนุษย์'], ['อายุ', '19'], ['บทบาท', 'ตัวเอก'], ['สังกัด', 'ภาคีนักเวท'], ['อาวุธ', 'ดาบสั้นคู่'], ['ปม', 'ตระกูลผู้เฝ้าหอคอย']]
      .map(([k, v]) => `<div class="prop" style="padding:6px 0"><span class="pk" style="width:110px">${k}</span><span class="pv">${v}</span></div>`).join('')}
    <div style="font-size:11px;color:var(--t3);margin-top:12px">Note: เชื่อมกับ <span style="color:var(--accentH)">[[วันล่มสลายของหอคอย]]</span> · <span style="color:var(--accentH)">[[นครหลวงเวรีเดียน]]</span></div>
  </div>
</div>`;
fs.writeFileSync(path.join(OUT, '20-classifier-listdetail.html'),
  page('cls-listdetail', 'world', 'chars', [['ตัวละคร', 'Classifier', 1]],
    clsListDetail, 'เอเธเรีย <b>›</b> ตัวละคร <b>›</b> อาริน', 'Classifier · View: List + Detail'));

// 21: Classifier — view 4: Grid Collection
const clsGrid = `
<div class="detail-head" style="border-color:#38bdf8">
  <h2>ตัวละคร <span class="chip" style="margin-left:6px">Classifier · Object</span></h2>
  <div class="mtags"><span class="htag" style="border-color:#38bdf8;color:#38bdf8">#ตัวละคร</span><span class="htag lk">🔗 3 links</span>${viewbar(CLS_VIEWS, 3)}</div>
</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:1020px">
  ${[['อาริน', '#818cf8', 'มนุษย์ · 19', 'ตัวเอก'], ['เซลีน', '#f472b6', 'เอลฟ์ · 112', 'คู่หู'],
     ['ท่านเคียร์', '#fb923c', 'มังกร · 800+', 'ผู้พิทักษ์'], ['มอร์แกน', '#a78bfa', 'มนุษย์ · 45', 'ศัตรู'],
     ['ร้อยเอกดารา', '#34d399', 'มนุษย์ · 31', 'พันธมิตร'], ['เวสเปอร์', '#fbbf24', 'ครึ่งเอลฟ์ · 24', 'พ่อค้า'],
     ['แม่มดเถ้า', '#f87171', 'ไม่ทราบ', 'ปริศนา'], ['+', 'var(--border)', '', 'เพิ่ม Object']]
    .map(([n, c, meta, role]) => n === '+'
      ? `<div style="border:1px dashed var(--border);border-radius:var(--r);display:flex;align-items:center;justify-content:center;min-height:118px;color:var(--t3);font-size:12px">+ เพิ่ม Object</div>`
      : `<div style="border:1px solid var(--border);border-top:3px solid ${c};border-radius:var(--r);background:var(--surface);padding:12px">
      <div style="display:flex;align-items:center;gap:8px"><span style="width:34px;height:34px;border-radius:50%;border:2px solid ${c};display:flex;align-items:center;justify-content:center;color:${c}">${ic.person}</span><b style="font-size:13px">${n}</b></div>
      <div style="font-size:10.5px;color:var(--t3);margin-top:8px">${meta}</div>
      <div style="font-size:11px;color:var(--t2)">${role}</div>
    </div>`).join('')}
</div>`;
fs.writeFileSync(path.join(OUT, '21-classifier-grid.html'),
  page('cls-grid', 'world', 'chars', [['ตัวละคร', 'Classifier', 1]],
    clsGrid, 'เอเธเรีย <b>›</b> ตัวละคร', 'Classifier · View: Grid Collection'));

// 22: Chronicler — view 2: Down-line graph + event list
const tlDownline = `
<div class="detail-head" style="border-color:#fbbf24">
  <h2>ยุคแห่งไฟ <span class="chip" style="margin-left:6px">Chronicler</span></h2>
  <div class="mtags"><span class="htag" style="border-color:#fbbf24;color:#fbbf24">#ประวัติศาสตร์</span><span class="htag lk">🔗 2 links</span>${viewbar(TL_VIEWS, 1)}</div>
</div>
<div style="display:flex;gap:20px">
  <div style="width:360px;position:relative;height:540px">
    <div style="position:absolute;left:40px;top:10px;bottom:10px;width:2px;background:var(--border)"></div>
    ${[['วันล่มสลายของหอคอย', '3/1/1024', '#f87171', 20], ['อารินพบเซลีน', '17/4/1024', '#818cf8', 150],
       ['สัตยาบันหุบเขาเหนือ', '2/9/1024', '#34d399', 330], ['ศึกทะเลทรายแดง', '21/11/1024', '#fbbf24', 435],
       ['ราชาภิเษกครั้งใหม่', '6/2/1025', '#c084fc', 505]]
      .map(([n, d, c, y]) => `
      <div style="position:absolute;left:35px;top:${y}px;width:12px;height:12px;border-radius:50%;background:${c}"></div>
      <div style="position:absolute;left:60px;top:${y - 6}px"><div style="font-size:12px;color:var(--t1)">${n}</div><div style="font-size:10px;color:var(--t3)">${d}</div></div>`).join('')}
    <div style="position:absolute;left:0;bottom:-6px;font-size:10px;color:var(--t3)">ระยะห่างตามสัดส่วนเวลาจริง (แนวดิ่ง)</div>
  </div>
  <div style="flex:1">
    <table class="mock">
      <tr><th>Event</th><th>วันที่·เวลา</th><th>Tags</th><th>Links</th></tr>
      <tr style="background:var(--raised)"><td>ศึกทะเลทรายแดง</td><td>21/11/1024 05:45</td><td><span class="chip">#หลัก</span></td><td><span class="htag lk">🔗 2</span></td></tr>
      <tr><td>วันล่มสลายของหอคอย</td><td>3/1/1024 09:00</td><td><span class="chip">#หลัก</span></td><td><span class="htag lk">🔗 3</span></td></tr>
      <tr><td>อารินพบเซลีน</td><td>17/4/1024 18:30</td><td><span class="chip">#ตัวละคร</span></td><td><span class="htag lk">🔗 1</span></td></tr>
      <tr><td>สัตยาบันหุบเขาเหนือ</td><td>2/9/1024 12:00</td><td><span class="chip">#การเมือง</span></td><td>—</td></tr>
      <tr><td>ราชาภิเษกครั้งใหม่</td><td>6/2/1025 10:00</td><td><span class="chip">#การเมือง</span></td><td>—</td></tr>
    </table>
    <div style="font-size:11px;color:var(--t3);margin-top:10px">เลือกแถวเพื่อ highlight ตำแหน่งบน down-line graph</div>
  </div>
</div>`;
fs.writeFileSync(path.join(OUT, '22-chronicler-downline.html'),
  page('tl-downline', 'world', 'tl', [['ยุคแห่งไฟ', 'Chronicler', 1]],
    tlDownline, 'เอเธเรีย <b>›</b> ยุคแห่งไฟ', 'Chronicler · View: Down-line + List'));

// 23: Chronicler — view 3: Compare Parallel (two timelines, shared events joined)
const cmpEv = (x, y, c, big) => `<div style="position:absolute;left:${x - 5}px;top:${y - 5}px;width:${big ? 12 : 10}px;height:${big ? 12 : 10}px;border-radius:50%;background:${c};${big ? 'box-shadow:0 0 0 4px rgba(99,102,241,.25)' : ''}"></div>`;
const tlCompare = `
<div class="detail-head" style="border-color:#fbbf24">
  <h2>ยุคแห่งไฟ <span class="chip" style="margin-left:6px">Chronicler</span></h2>
  <div class="mtags"><span class="htag lk">🔗 2 links</span>${viewbar(TL_VIEWS, 2)}
    <span style="font-size:10.5px;color:var(--t3);margin-left:8px">เทียบกับ: <span class="chip" style="border-color:#f59e0b;color:#f59e0b">เนื้อเรื่องศึกมังกร ▾</span></span></div>
</div>
<div style="position:relative;height:520px">
  <div style="position:absolute;left:120px;top:60px;font-size:12px;color:#fbbf24;font-weight:600">ยุคแห่งไฟ (เอเธเรีย)</div>
  <div style="position:absolute;left:60px;right:40px;top:120px;height:2px;background:var(--border)"></div>
  <div style="position:absolute;left:120px;top:330px;font-size:12px;color:#f59e0b;font-weight:600">เนื้อเรื่องศึกมังกร (เกม)</div>
  <div style="position:absolute;left:60px;right:40px;top:390px;height:2px;background:var(--border)"></div>
  ${/* shared events joined across both lines */''}
  ${[[190, 'วันล่มสลายของหอคอย', '3/1/1024', '#f87171'], [700, 'ศึกทะเลทรายแดง', '21/11/1024', '#fbbf24']]
    .map(([x, n, d, c]) => `
    ${cmpEv(x, 120, c, true)}${cmpEv(x, 390, c, true)}
    <div style="position:absolute;left:${x}px;top:126px;width:1px;height:264px;border-left:2px dashed rgba(129,140,248,.55)"></div>
    <div style="position:absolute;left:${x - 70}px;top:78px;width:150px;text-align:center"><div style="font-size:11.5px;color:var(--t1)">${n}</div><div style="font-size:9.5px;color:var(--t3)">${d}</div></div>
    <div style="position:absolute;left:${x - 70}px;top:400px;width:150px;text-align:center;font-size:9.5px;color:var(--t3)">event เดียวกัน</div>`).join('')}
  ${/* events only on the upper timeline */''}
  ${[[380, 'อารินพบเซลีน', '#818cf8'], [560, 'สัตยาบันหุบเขาเหนือ', '#34d399'], [880, 'ราชาภิเษกครั้งใหม่', '#c084fc']]
    .map(([x, n, c]) => `${cmpEv(x, 120, c, false)}<div style="position:absolute;left:${x - 60}px;top:136px;width:130px;text-align:center;font-size:10px;color:var(--t3)">${n}</div>`).join('')}
  ${/* events only on the lower timeline */''}
  ${[[300, 'เควสต์เปิดเกม', '#38bdf8'], [520, 'บอสกลางเกม', '#f472b6'], [960, 'ฉากจบเส้นทาง A', '#a3e635']]
    .map(([x, n, c]) => `${cmpEv(x, 390, c, false)}<div style="position:absolute;left:${x - 60}px;top:406px;width:130px;text-align:center;font-size:10px;color:var(--t3)">${n}</div>`).join('')}
  <div style="position:absolute;left:60px;bottom:14px;font-size:10.5px;color:var(--t3)">เส้นประ = event เดียวกันที่อยู่ทั้งสอง timeline · จุดที่ไม่มีเส้น = event เฉพาะของ timeline นั้น</div>
  <div class="czoom" style="position:absolute;right:0;bottom:8px"><span class="zbtn">−</span><span class="zlvl">100%</span><span class="zbtn">+</span></div>
</div>`;
fs.writeFileSync(path.join(OUT, '23-chronicler-compare.html'),
  page('tl-compare', 'world', 'tl', [['ยุคแห่งไฟ', 'Chronicler', 1]],
    tlCompare, 'เอเธเรีย <b>›</b> ยุคแห่งไฟ', 'Chronicler · View: Compare Parallel'));

/* ══ 24: Search Link — overlay popup, search everything + scope filter ══ */
const srow = (icn, col, name, path, kind, sel, extra) => `
<div class="sr${sel ? ' sel' : ''}">
  ${ki(icn, col)}
  <span class="srname">${name}${extra || ''}</span>
  <span class="srpath">${path}</span>
  <span class="kind">${kind}</span>
</div>`;
const searchOverlay = `
<div style="position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:15;display:flex;justify-content:center;align-items:flex-start;padding-top:90px">
<div style="width:640px;background:var(--surface);border:1px solid var(--border);border-radius:var(--rl);box-shadow:0 22px 70px rgba(0,0,0,.6);overflow:hidden">
  <div style="display:flex;align-items:center;gap:9px;padding:13px 16px;border-bottom:1px solid var(--border)">
    ${ic.search}<input style="flex:1;background:transparent;border:none;outline:none;color:var(--t1);font-size:14px" value="อาริน">
    <span style="font-size:10px;color:var(--t3);border:1px solid var(--border);border-radius:3px;padding:1px 6px">Ctrl+P</span>
  </div>
  <div style="display:flex;gap:6px;padding:9px 16px;border-bottom:1px solid var(--border);font-size:10.5px;align-items:center">
    <span style="color:var(--t3)">ขอบเขต:</span>
    <span class="chip">ทั้ง Vault</span>
    <span class="chip" style="border-color:var(--accent);color:#fff;background:var(--accent)">Folder เดียวกัน · level เดียวกัน</span>
    <span class="chip">ต่ำกว่า (ทั้ง subtree)</span>
    <span style="color:var(--t3);margin-left:10px">ชนิด:</span>
    <span class="chip" style="border-color:var(--accentH);color:var(--accentH)">ทั้งหมด ▾</span>
  </div>
  <div style="padding:6px 8px">
    ${srow('person', '#818cf8', 'อาริน', 'เอเธเรีย › ตัวละคร', 'Object', true, ' <span class="htag lk" style="font-size:9px">🔗 4</span>')}
    ${srow('timeline', '#fbbf24', 'อารินพบเซลีน', 'เอเธเรีย › ยุคแห่งไฟ', 'Event', false)}
    ${srow('story', '#c084fc', 'เปิดเรื่อง — "หอคอยนั่น…"', 'เอเธเรีย › เส้นทางเนื้อเรื่อง', 'Dialogue', false)}
    ${srow('doc', '#94a3b8', 'โน้ตเบื้องหลัง — ตระกูลของอาริน…', 'เอเธเรีย › โน้ตเบื้องหลัง', 'Inspector', false)}
    ${srow('book', '#f43f5e', 'บทที่ 1 — "…เมื่ออารินก้าวข้าม…"', 'นิยายหลัก › เล่ม 1', 'Chapter', false)}
  </div>
  <div style="display:flex;gap:16px;padding:9px 16px;border-top:1px solid var(--border);font-size:10.5px;color:var(--t3)">
    <span><b style="color:var(--t2)">↑↓</b> เลือก</span>
    <span><b style="color:var(--t2)">Enter</b> เปิดใน builder</span>
    <span><b style="color:var(--t2)">Ctrl+Enter</b> แทรกเป็น [[link]]</span>
    <span><b style="color:var(--t2)">Tab</b> สลับขอบเขต</span>
    <span style="margin-left:auto">5 ผลลัพธ์</span>
  </div>
</div>
</div>`;
fs.writeFileSync(path.join(OUT, '24-searchlink.html'),
  page('searchlink', 'world', 'chars', [['ตัวละคร', 'Classifier', 1]],
    catContent, 'เอเธเรีย <b>›</b> ตัวละคร', 'Search Link · scope: same folder/level', searchOverlay));

/* ══ 25: Sage Hut — global analytics ══ */
const SAGE_VIEWS = ['Data size', 'Object amount', 'Linker list', 'Linker graph'];
const bar = (name, icn, col, n, pct) => `
<div style="display:flex;align-items:center;gap:10px;margin-bottom:9px">
  <span style="width:190px;display:flex;align-items:center;gap:7px;font-size:12px">${ki(icn, col)}${name}</span>
  <div style="flex:1;height:16px;background:var(--raised);border-radius:4px;overflow:hidden">
    <div style="width:${pct}%;height:100%;background:${col};opacity:.75"></div>
  </div>
  <span style="width:52px;text-align:right;font-size:11.5px;color:var(--t2)">${n}</span>
</div>`;
const hubSage = `
<aside id="hub">
  <div id="searchbar"><input placeholder="ค้นหา...  (Ctrl+P)"><span style="color:var(--t3)">‹</span></div>
  <div class="acc-head">${ic.chevR} Nexus nest <span class="cnt">13 modules</span></div>
  <div class="acc-head">${ic.chevD} Sage Hut</div>
  <div class="acc-body" style="flex:1">
    <div class="li">${ki('layer', '#818cf8')}Data size <span class="kind">3.2 MB</span></div>
    <div class="li sel">${ki('list', '#34d399')}Object amount <span class="kind">128</span></div>
    <div class="li">${ki('list', '#fbbf24')}Linker list <span class="kind">46</span></div>
    <div class="li">${ki('relation', '#f472b6')}Linker graph</div>
  </div>
  <div class="acc-head acc-collapsed">${ic.chevR} Import Dock <span class="cnt">12 files</span></div>
</aside>`;
const sageContent = `
<div class="detail-head" style="border-color:#34d399">
  <h2>Sage Hut <span class="chip" style="margin-left:6px">Analytics · ทั้ง Vault</span></h2>
  <div class="sub">สถิติรวมของข้อมูลทุก module ใน MyVault</div>
  <div class="mtags">${viewbar(SAGE_VIEWS, 1)}</div>
</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:940px;margin-bottom:22px">
  ${[['Objects ทั้งหมด', '128', '#34d399'], ['Modules', '13', '#818cf8'], ['Links', '46', '#fbbf24'], ['Data size', '3.2 MB', '#f472b6']]
    .map(([k, v, c]) => `<div style="border:1px solid var(--border);border-top:3px solid ${c};border-radius:var(--r);background:var(--surface);padding:12px">
      <div style="font-size:10.5px;color:var(--t3)">${k}</div><div style="font-size:22px;font-weight:700;margin-top:2px">${v}</div>
    </div>`).join('')}
</div>
<div style="max-width:940px">
  <div style="font-size:11px;font-weight:700;letter-spacing:.05em;color:var(--t2);margin-bottom:10px">OBJECT AMOUNT ต่อ MODULE</div>
  ${bar('ตัวละคร (Classifier)', 'layer', '#38bdf8', 14, 100)}
  ${bar('ยุคแห่งไฟ (Chronicler)', 'timeline', '#fbbf24', 5, 36)}
  ${bar('แผนที่ทวีป (Locator)', 'map', '#34d399', 4, 29)}
  ${bar('เส้นทางเนื้อเรื่อง (Narrator)', 'story', '#c084fc', 7, 50)}
  ${bar('เล่ม 1 (Author)', 'book', '#f43f5e', 4, 29)}
  ${bar('แชตไอเดีย (Scribe)', 'chat', '#0ea5e9', 12, 86)}
  ${bar('ศึกมังกร (Manager)', 'projects', '#f59e0b', 38, 90)}
  <div style="font-size:10.5px;color:var(--t3);margin-top:12px">คลิกแถวเพื่อเจาะดูรายละเอียด · มุมมองอื่น: Data size (ขนาดต่อ module) · Linker list (ตาราง link ทั้งหมด) · Linker graph (กราฟรวมทั้ง vault)</div>
</div>`;
const sagePage = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>sagehut</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail('world')}
${hubSage}
<main id="main">
${etabs([['Sage Hut · Object amount', 'Sage', 1]])}
<div id="content">${sageContent}</div>
</main>
</div>
${statusbar('MyVault <b>›</b> Sage Hut', 'Sage · View: Object amount')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '25-sagehut.html'), sagePage);

/* ══ 26: Version History — record edits, roll back (default 50, set in Settings) ══ */
const vrow = (t, who, what, detail, cur) => `
<div style="border-left:2px solid ${cur ? 'var(--accent)' : 'var(--border)'};padding:8px 12px;margin-bottom:2px;${cur ? 'background:rgba(99,102,241,.07)' : ''}">
  <div style="display:flex;align-items:center;gap:8px;font-size:11.5px">
    <b style="color:var(--t1)">${what}</b>
    ${cur ? '<span class="chip" style="border-color:var(--accent);color:var(--accentH)">ปัจจุบัน</span>' : `<span class="btn btn-s" style="margin-left:auto;font-size:10px;padding:2px 9px">↩ Restore</span>`}
  </div>
  <div style="font-size:10.5px;color:var(--t2);margin-top:2px">${detail}</div>
  <div style="font-size:9.5px;color:var(--t3);margin-top:2px">${t}</div>
</div>`;
const versPage = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>versions</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail('world')}
${hub('chars')}
<main id="main">
${etabs([['ตัวละคร', 'Classifier', 1]])}
<div style="display:flex;flex:1;min-height:0">
<div id="content" style="flex:1">${catContent}</div>
<div id="inspector" style="width:310px">
  <div class="insp-head">${ic.timeline} Version History — ตัวละคร <span style="margin-left:auto;font-size:9.5px;color:var(--t3)">14 / 50</span></div>
  <div style="overflow-y:auto;padding:8px 6px">
    ${vrow('วันนี้ 14:22', '', 'v14 — แก้ attribute', 'อาริน: อายุ 19 → 20', true)}
    ${vrow('วันนี้ 11:05', '', 'v13 — เพิ่ม Object', 'เพิ่ม "แม่มดเถ้า" + 3 attributes', false)}
    ${vrow('เมื่อวาน 22:41', '', 'v12 — แก้ Template', 'เพิ่มช่อง "อาวุธ" (text)', false)}
    ${vrow('เมื่อวาน 20:14', '', 'v11 — ลบ Object', 'ลบ "ทหารนิรนาม" (กู้คืนได้จาก version นี้)', false)}
    ${vrow('7/7/2026 09:30', '', 'v10 — แก้ note', 'อาริน: เพิ่ม [[นครหลวงเวรีเดียน]]', false)}
    ${vrow('6/7/2026 18:02', '', 'v9 — เปลี่ยน tag', 'เพิ่ม #หลัก ให้ เซลีน', false)}
  </div>
  <div style="padding:9px 14px;border-top:1px solid var(--border);font-size:10px;color:var(--t3)">เก็บสูงสุด 50 versions (ปรับได้ใน Settings) · Restore สร้าง version ใหม่ ไม่ทับของเดิม</div>
</div>
</div>
</main>
</div>
${statusbar('เอเธเรีย <b>›</b> ตัวละคร', 'Classifier · Version History')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '26-versions.html'), versPage);


/* theme variant shells (palettes copied from style.css) */
const THEME_VARS = {"daylight": ["#f4f6fb", "#ffffff", "#eef1f7", "#e2e7f0", "#ccd3df", "#172033", "#596274", "#8a94a6", "#2563eb", "#3b82f6"], "moonlight": ["#101620", "#182231", "#223044", "#2d3b52", "#334258", "#edf4ff", "#a6b3c7", "#66758c", "#7c9cff", "#9bb5ff"], "redEclipse": ["#0a0808", "#150f0f", "#201616", "#2b1e1e", "#3a2624", "#f6ece4", "#bb9a8a", "#7c5f52", "#b8703c", "#dc2626"], "clearSky": ["#e8f3ff", "#ffffff", "#d8ebff", "#c4ddfb", "#aacbee", "#22306e", "#4f61a3", "#8497c4", "#00bfff", "#4169e1"], "atDusk": ["#1a0f2e", "#241640", "#2f1d52", "#3a2563", "#46296e", "#f3e8ff", "#c4a8dd", "#8870a8", "#b24bf3", "#c9748a"], "clearAurora": ["#071a17", "#0c2621", "#123430", "#18423c", "#1f524a", "#e6fff6", "#8fc7ba", "#557a72", "#2dd4bf", "#e879f9"], "rainbow": ["#fdf3fb", "#ffffff", "#fbecf7", "#f6e0f2", "#ecd2e9", "#3a2b46", "#6d5b7c", "#a493b3", "#d6249f", "#7c3aed"]};
const RAINBOW_EXTRA = `
  /* mirrors style.css rainbow rules: rainbow frame + rainbow-colored controls, white surfaces stay white */
  .frame{background:linear-gradient(135deg,#ffb3ba,#ffdfba,#fdffb6,#baffc9,#bae1ff,#d5baff,#ffbaf2)}
  #main,#content{background:transparent}
  #rail,#hub{background:rgba(255,255,255,.72);backdrop-filter:blur(6px)}
  #titlebar,#statusbar,#etabs{background:rgba(255,255,255,.6);backdrop-filter:blur(6px)}
  .btn-p,.nav-btn.active,.nav-btn.create,.viewbar .vitem.act,.etab.active{
    background:linear-gradient(120deg,#f5515f,#f7a531,#3fd07f,#38a3f1,#9b5cf6)!important;
    border-color:transparent!important;color:#fff!important;box-shadow:none}
  .etab.active{color:#fff}
  .sb-badge{background:linear-gradient(120deg,#f5515f,#f7a531,#3fd07f,#38a3f1,#9b5cf6);color:#fff;border-color:transparent}
  .htag.lk{background:linear-gradient(120deg,rgba(245,81,95,.15),rgba(56,163,241,.15))}
  table.mock td,table.mock th{border-color:rgba(58,43,70,.18)}
  .li.sel{background:rgba(255,255,255,.9)}
`;
for (const [name, v] of Object.entries(THEME_VARS)) {
  const ov = `<style>:root{--bg:${v[0]};--surface:${v[1]};--raised:${v[2]};--hover:${v[3]};--border:${v[4]};--t1:${v[5]};--t2:${v[6]};--t3:${v[7]};--accent:${v[8]};--accentH:${v[9]}}
  body{background:var(--bg)}${name === 'rainbow' ? RAINBOW_EXTRA : ''}</style><div style="position:absolute;right:16px;bottom:34px;z-index:9;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:5px 12px;font-size:11px;color:var(--t2)">theme: <b style="color:var(--accentH)">${name}</b></div>`;
  fs.writeFileSync(path.join(OUT, `theme-${name}.html`),
    page(`theme-${name}`, 'world', 'chars',
      [['ตัวละคร', 'Classifier', 1], ['แผนที่ทวีป', 'Locator', 0]],
      catContent, 'เอเธเรีย <b>›</b> ตัวละคร', 'Major › Minor · Classifier', ov));
}

/* ══ 27: Custom theme editor — user builds & names a palette ══ */
const crow = (name, col, light) => `
<div style="display:flex;align-items:center;gap:9px;margin-bottom:7px;font-size:11.5px">
  <span style="width:86px;color:var(--t2)">${name}</span>
  <span style="width:26px;height:18px;border-radius:4px;background:${col};border:1px solid var(--border)"></span>
  <span style="color:var(--t3);font-size:10.5px">${col}</span>
  <span style="margin-left:auto;color:var(--t3);font-size:10px">แก้ ▾</span>
</div>`;
const cthemeOverlay = `
<div id="overlay"><div id="modal" style="width:620px">
<div id="modal-head"><span>🎨 Custom Theme — สร้างธีมของคุณเอง</span><span style="color:var(--t3)">✕</span></div>
<div id="modal-body" style="display:flex;gap:18px">
  <div style="flex:1">
    <div class="fg"><label>ชื่อธีม *</label><input value="มังกรราตรี"></div>
    <div style="font-size:11px;color:var(--t2);font-weight:600;margin-bottom:8px">Palette (10 สี)</div>
    ${crow('--bg', '#0d1117')}${crow('--surface', '#161b22')}${crow('--raised', '#21262d')}${crow('--hover', '#30363d')}${crow('--border', '#3d444d')}
    ${crow('--t1', '#e6edf3')}${crow('--t2', '#9198a1')}${crow('--t3', '#656c76')}${crow('--accent', '#2ea043')}${crow('--accentH', '#3fb950')}
  </div>
  <div style="width:230px">
    <div style="font-size:11px;color:var(--t2);font-weight:600;margin-bottom:8px">Preview สด</div>
    <div style="border:1px solid #3d444d;border-radius:8px;overflow:hidden;background:#0d1117">
      <div style="height:20px;background:#0d1117;border-bottom:1px solid #3d444d"></div>
      <div style="display:flex;height:120px">
        <div style="width:16px;background:#0d1117;border-right:1px solid #3d444d"></div>
        <div style="width:64px;background:#161b22;border-right:1px solid #3d444d;padding:5px 4px">
          <div style="height:6px;background:#21262d;border-radius:2px;margin-bottom:4px"></div>
          <div style="height:6px;background:#2ea043;border-radius:2px;margin-bottom:4px"></div>
          <div style="height:6px;background:#21262d;border-radius:2px"></div>
        </div>
        <div style="flex:1;padding:7px">
          <div style="height:8px;width:70%;background:#e6edf3;opacity:.85;border-radius:2px;margin-bottom:5px"></div>
          <div style="height:6px;width:90%;background:#9198a1;opacity:.6;border-radius:2px;margin-bottom:4px"></div>
          <div style="height:6px;width:80%;background:#656c76;opacity:.6;border-radius:2px;margin-bottom:8px"></div>
          <div style="display:inline-block;height:12px;width:44px;background:#2ea043;border-radius:3px"></div>
        </div>
      </div>
    </div>
    <div style="font-size:10.5px;color:var(--t3);margin-top:10px">บันทึกแล้วธีมจะไปโผล่ในรายการ Theme ของ Settings ใช้ชื่อที่ตั้งเอง · แก้/ลบ/ส่งออกได้</div>
  </div>
</div>
<div class="mfoot"><div class="btn btn-s">ยกเลิก</div><div class="btn btn-s">Import palette</div><div class="btn btn-p">บันทึกธีม "มังกรราตรี"</div></div>
</div></div>`;
fs.writeFileSync(path.join(OUT, '27-customtheme.html'),
  page('customtheme', 'world', 'chars', [['ตัวละคร', 'Classifier', 1]],
    catContent, 'เอเธเรีย <b>›</b> ตัวละคร', 'Settings · Custom Theme', cthemeOverlay));

/* ══ 28: Drawing "Sketcher" — canvas, pen/eraser, image export, module-link nodes ══ */
const SK_VIEWS = ['Canvas', 'Pages', 'Gallery'];
const sketcherContent = `
<div style="position:absolute;inset:0;background:var(--bg);background-image:radial-gradient(rgba(46,46,63,.5) 1px,transparent 1px);background-size:22px 22px">
  <div class="ctoolbar" style="gap:4px">
    <div class="ctool active" title="ปากกา">${ic.pen}</div>
    <div class="ctool" title="ยางลบ">${ic.eraser}</div>
    <span class="zsep" style="height:18px;margin:0 3px"></span>
    ${['#e879f9', '#fbbf24', '#38bdf8', '#e8e8f0'].map((c, i) => `<span style="width:16px;height:16px;border-radius:50%;background:${c};margin:0 2px;${i === 0 ? 'box-shadow:0 0 0 2px var(--bg),0 0 0 3.5px ' + c : ''}"></span>`).join('')}
    <span class="zsep" style="height:18px;margin:0 3px"></span>
    ${[2, 4, 8].map((w, i) => `<span style="width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:4px;${i === 1 ? 'background:var(--raised)' : ''}"><i style="width:12px;height:${w}px;border-radius:2px;background:var(--t2);display:block"></i></span>`).join('')}
    <span class="zsep" style="height:18px;margin:0 3px"></span>
    <div class="ctool" title="แปะ link module">${ic.relation}</div>
  </div>
  <div style="position:absolute;top:12px;right:14px;display:flex;gap:6px;z-index:3">
    <span class="htag" style="border-color:#e879f9;color:#e879f9">#สตอรี่บอร์ด</span><span class="htag lk">🔗 2 links</span>
    <div class="btn btn-p" style="font-size:11px"><svg class="icon sm" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Export PNG</div>
  </div>
  <svg style="position:absolute;inset:0;width:100%;height:100%" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M170 210 C 230 130, 320 130, 360 200 C 400 270, 330 330, 265 315 C 200 300, 150 270, 170 210 Z" stroke="#e879f9" stroke-width="3.5"/>
    <path d="M245 235 q 12 -22 25 0 M300 232 q 12 -22 25 0" stroke="#e879f9" stroke-width="3"/>
    <path d="M255 285 q 30 24 62 -2" stroke="#e879f9" stroke-width="3.5"/>
    <path d="M355 175 q 45 -55 110 -28" stroke="#fbbf24" stroke-width="3"/>
    <path d="M470 145 l -14 -4 m 14 4 l -4 13" stroke="#fbbf24" stroke-width="3"/>
    <path d="M150 430 q 60 -34 120 0 t 130 6 q 40 4 66 -18" stroke="#38bdf8" stroke-width="3"/>
    <path d="M560 385 c 24 -60 96 -60 120 -6 c 40 -14 74 26 54 58 c 30 26 -4 66 -40 56 l -140 0 c -40 -6 -30 -80 6 -108 Z" stroke="#e8e8f0" stroke-width="3" stroke-dasharray="1 0"/>
    <text x="595" y="470" fill="#e8e8f0" font-size="15" style="font-family:'Noto Sans Thai',sans-serif">ปราสาทลอยฟ้า?</text>
    <path d="M905 505 q 40 -70 60 -6 q 16 52 52 8" stroke="#fbbf24" stroke-width="3"/>
    <rect x="835" y="330" width="150" height="60" rx="10" stroke="var(--t3)" stroke-width="1.5" stroke-dasharray="5 4" fill="rgba(24,24,31,.4)"/>
  </svg>
  <div style="position:absolute;left:848px;top:341px;font-size:10px;color:var(--t3)">พื้นที่ถูกยางลบ<br>(ลบเฉพาะเส้น)</div>
  ${/* module links pinned as nodes on the canvas */''}
  <div style="position:absolute;left:465px;top:95px;display:flex;align-items:center;gap:7px;background:var(--surface);border:1.5px solid #818cf8;border-radius:var(--r);padding:7px 11px;box-shadow:0 4px 16px rgba(0,0,0,.35)">
    ${ki('person', '#818cf8')}<span style="font-size:12px;color:var(--t1)">[[อาริน]]</span><span class="kind">Object</span>
  </div>
  <div style="position:absolute;left:120px;top:470px;display:flex;align-items:center;gap:7px;background:var(--surface);border:1.5px solid #34d399;border-radius:var(--r);padding:7px 11px;box-shadow:0 4px 16px rgba(0,0,0,.35)">
    ${ki('map', '#34d399')}<span style="font-size:12px;color:var(--t1)">[[แผนที่ทวีป]]</span><span class="kind">Locator</span>
  </div>
  <div class="chint">🖱 ขวาค้างลาก = เลื่อน · Scroll = ซูม · ลากจาก Search Link มาแปะเป็น node ได้</div>
  <div class="czoom"><span class="zbtn">−</span><span class="zlvl">100%</span><span class="zbtn">+</span><span class="zsep"></span>หน้า 1/3</div>
</div>`;
const sketcherPage = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>sketcher</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail('world')}
${hub('sketch')}
<main id="main">
${etabs([['สมุดวาด · หน้า 1', 'Sketcher', 1]])}
<div id="content" style="padding:0">${sketcherContent}</div>
</main>
</div>
${statusbar('<b>สมุดวาด</b> › หน้า 1', 'Major · Sketcher · View: Canvas')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '28-sketcher.html'), sketcherPage);

/* ══ 29: Import Dock — file↔item linking, image display, open files in builder ══ */
const hubDock = `
<aside id="hub">
  <div id="searchbar"><input placeholder="ค้นหา...  (Ctrl+P)"><span style="color:var(--t3)">‹</span></div>
  <div class="acc-head">${ic.chevR} Nexus nest <span class="cnt">14 modules</span></div>
  <div class="acc-head acc-collapsed">${ic.chevR} Sage Hut <span class="cnt">4 tabs</span></div>
  <div class="acc-head">${ic.chevD} Import Dock <span class="act">${ic.importD}${ic.plus}</span></div>
  <div class="acc-body" style="flex:1">
    <div class="li">${ki('folder', '#94a3b8')}assets/ <span class="kind">12 files</span></div>
    <div class="li indent1 sel">${ki('doc', '#38bdf8')}dragon-ref.png <span class="kind">→ ท่านเคียร์</span></div>
    <div class="li indent1">${ki('doc', '#818cf8')}arin-portrait.png <span class="kind">→ อาริน</span></div>
    <div class="li indent1">${ki('doc', '#34d399')}world-notes.md <span class="kind">→ เอเธเรีย</span></div>
    <div class="li indent1">${ki('doc', '#fbbf24')}old-draft.docx <span class="kind">→ เล่ม 1</span></div>
    <div class="li indent1">${ki('doc', '#f472b6')}map-scan.jpg <span class="kind">ยังไม่ผูก</span></div>
    <div class="li" style="color:var(--t3)">+ นำเข้าโฟลเดอร์</div>
  </div>
</aside>`;
const imgPane = `
<div style="position:absolute;inset:0;display:flex;flex-direction:column;background:var(--bg)">
  <div style="flex:1;display:flex;align-items:center;justify-content:center;background:repeating-conic-gradient(var(--raised) 0% 25%, var(--bg) 0% 50%) 50%/28px 28px">
    <div style="width:300px;height:300px;border-radius:14px;background:radial-gradient(circle at 40% 35%, #2b3550, #131722 70%);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 50px rgba(0,0,0,.55)">
      <img src="${LOGO}" style="width:190px;height:190px;opacity:.95">
    </div>
  </div>
  <div style="border-top:1px solid var(--border);background:var(--surface);padding:10px 14px;font-size:11.5px;display:flex;flex-direction:column;gap:5px">
    <div style="display:flex;gap:8px;align-items:center"><b>dragon-ref.png</b><span class="kind">1.2 MB · 1024×1024</span>
      <span style="margin-left:auto" class="btn btn-s" title="zoom">−</span><span style="color:var(--t2);font-size:11px">100%</span><span class="btn btn-s">+</span></div>
    <div style="display:flex;gap:6px;align-items:center;color:var(--t2)">ผูกกับ:
      <span class="htag" style="border-color:#fb923c;color:#fb923c">${'[[ท่านเคียร์]]'}</span>
      <span style="color:var(--t3);font-size:10.5px">· แสดงเป็นรูปประจำ Object (การ์ด/List+Detail/Grid)</span>
      <span class="btn btn-s" style="margin-left:auto;font-size:10px">เปลี่ยน linker</span>
    </div>
  </div>
</div>`;
const docPane = `
<div style="font-weight:650;font-size:13px;margin-bottom:2px;display:flex;gap:8px;align-items:center">world-notes.md <span class="kind">อ่านจากไฟล์</span></div>
<div style="font-size:10.5px;color:var(--t3);margin-bottom:10px">ผูกกับ [[เอเธเรีย]] · เปิดอ่านใน builder · แก้ไข = import เข้าเป็น Drafter</div>
<div style="font-size:12.5px;line-height:1.9;color:var(--t2)">
  <div style="font-size:15px;font-weight:700;color:var(--t1)"># โน้ตโลกเก่า (นำเข้า)</div>
  แนวคิดแรกของทวีป: สามอาณาจักรล้อมทะเลใน แต่ละแห่งถือ "เศษกระแสธาร" คนละชิ้น<br>
  - เวรีเดียน = ศูนย์กลางเวท<br>
  - ทะเลทรายแดง = แดนต้องห้าม<br>
  - หุบเขาเหนือ = ที่อยู่มังกร<br>
  <span style="border-left:3px solid var(--border);padding-left:10px;color:var(--t3);display:inline-block;margin-top:6px">TODO: ผูกหน้านี้กับ Chronicler ยุคก่อตั้ง</span>
</div>`;
const dockPage = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>importdock</title>
<link rel="stylesheet" href="mock.css"></head><body>
<div class="frame">
${titlebar}
<div id="app">
${rail('world')}
${hubDock}
<main id="main">
<div class="split2">
${pane('dragon-ref.png', 'File', imgPane, false)}
${pane('world-notes.md', 'File', docPane, true)}
</div>
</main>
</div>
${statusbar('Import Dock <b>›</b> assets', 'Split 2 · Image viewer + Document reader')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '29-importdock.html'), dockPage);

/* ══ 30: Icon Collection picker — choose a module's icon ══ */
const ICON_KEYS = ['globe','sword','book','chat','chart','importD','artisan','folder','layer','map','timeline','person','doc','relation','move','edit','search','projects','story','list','pen','eraser','plus','chevD'];
const GLYPHS = ['⚔','🛡','🏰','🐉','🔥','❄','🌙','☀','⭐','🗝','⚗','📜','🪶','💎','🧭','⚓','🌊','🍃','⛰','👑','🎭','🔮','🕯','🗡'];
const iconPickOverlay = `
<div id="overlay"><div id="modal" style="width:600px">
<div id="modal-head"><span>🎯 Icon Collection — เลือก icon ของ module</span><span style="color:var(--t3)">✕</span></div>
<div id="modal-body">
  <div style="display:flex;gap:6px;margin-bottom:12px;align-items:center">
    <div style="flex:1;display:flex;align-items:center;gap:7px;background:var(--raised);border:1px solid var(--border);border-radius:var(--rs);padding:6px 10px;color:var(--t3);font-size:12px">${ic.search} ค้นหา icon…</div>
    <span class="chip" style="border-color:var(--accent);color:#fff;background:var(--accent)">Icons</span>
    <span class="chip">Symbols</span>
    <span class="chip">อัปโหลดเอง</span>
  </div>
  <div style="font-size:10.5px;color:var(--t3);margin-bottom:7px">ICONS (SVG · เปลี่ยนสีตามที่เลือก)</div>
  <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:6px;margin-bottom:14px">
    ${ICON_KEYS.map((k, i) => `<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;border:1.5px solid ${i === 20 ? 'var(--accent)' : 'var(--border)'};border-radius:var(--r);color:${i === 20 ? '#e879f9' : 'var(--t2)'};background:${i === 20 ? 'rgba(99,102,241,.1)' : 'var(--surface)'}">${ic[k]}</div>`).join('')}
  </div>
  <div style="font-size:10.5px;color:var(--t3);margin-bottom:7px">SYMBOLS (จาก symbol collection เดิม + เพิ่มเองได้)</div>
  <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:6px;margin-bottom:14px">
    ${GLYPHS.map(g => `<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--border);border-radius:var(--r);font-size:17px;background:var(--surface)">${g}</div>`).join('')}
  </div>
  <div style="display:flex;align-items:center;gap:10px">
    <span style="font-size:10.5px;color:var(--t3)">สี icon:</span>
    ${['#e879f9','#22c55e','#f59e0b','#38bdf8','#f43f5e','#a3e635','#818cf8','#f472b6'].map((c, i) => `<span style="width:18px;height:18px;border-radius:50%;background:${c};${i === 0 ? 'box-shadow:0 0 0 2px var(--surface),0 0 0 4px ' + c : ''}"></span>`).join('')}
    <span style="margin-left:auto;font-size:10.5px;color:var(--t3)">Preview:</span>
    <span style="display:flex;align-items:center;gap:7px;border:1px solid var(--border);border-radius:var(--rs);padding:5px 10px;background:var(--surface);font-size:12px">${ki('pen', '#e879f9')}สมุดวาด<span class="kind">Sketcher</span></span>
  </div>
</div>
<div class="mfoot"><div class="btn btn-s">ยกเลิก</div><div class="btn btn-p">ใช้ icon นี้</div></div>
</div></div>`;
fs.writeFileSync(path.join(OUT, '30-iconpicker.html'),
  page('iconpicker', 'world', 'sketch', [['สมุดวาด · หน้า 1', 'Sketcher', 1]],
    managerContent, '<b>สมุดวาด</b>', 'แก้ไข module · Icon Collection', iconPickOverlay));

/* ══ 31: Graph "Designer" — free-form diagram builder ══ */
const DS_VIEWS = ['Canvas', 'Outline', 'Matrix'];
const dnode = (x, y, w, col, txt, shape) => shape === 'circle'
  ? `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w}px;border-radius:50%;border:2px solid ${col};background:rgba(24,24,31,.92);display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;color:${col};font-weight:650;box-shadow:0 6px 22px rgba(0,0,0,.4)">${txt}</div>`
  : shape === 'diamond'
  ? `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w}px;border:2px solid ${col};background:rgba(24,24,31,.92);transform:rotate(45deg);border-radius:8px"></div><div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w}px;display:flex;align-items:center;justify-content:center;font-size:11px;color:${col};text-align:center">${txt}</div>`
  : `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;border:2px solid ${col};background:rgba(24,24,31,.92);border-radius:var(--r);padding:9px 12px;font-size:12px;color:var(--t1);text-align:center;box-shadow:0 6px 22px rgba(0,0,0,.4)"><b style="color:${col}">${txt}</b></div>`;
const dlab = (x, y, txt) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);font-size:9.5px;color:var(--t3);background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:0 6px">${txt}</div>`;
const designerContent = `
<div class="canvas">
  <div class="ctoolbar" style="gap:4px">
    <div class="ctool active">${ic.move}</div>
    <span class="zsep" style="height:18px;margin:0 3px"></span>
    <div class="ctool" title="กล่อง" style="font-size:13px">▭</div>
    <div class="ctool" title="วงกลม" style="font-size:13px">◯</div>
    <div class="ctool" title="เงื่อนไข" style="font-size:12px">◇</div>
    <div class="ctool" title="ข้อความ" style="font-size:12px;font-weight:700">T</div>
    <span class="zsep" style="height:18px;margin:0 3px"></span>
    <div class="ctool" title="เส้นเชื่อม">${ic.relation}</div>
    <div class="ctool" title="แปะ link module">${ic.search}</div>
  </div>
  <div style="position:absolute;top:12px;right:14px;display:flex;gap:6px;z-index:3;align-items:center">
    <span class="htag" style="border-color:#2dd4bf;color:#2dd4bf">#ระบบเวท</span><span class="htag lk">🔗 3 links</span>
    ${viewbar(DS_VIEWS, 0)}
  </div>
  <svg style="position:absolute;inset:0;width:100%;height:100%">
    <defs><marker id="da" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#5a5a72"/></marker></defs>
    <line x1="560" y1="205" x2="360" y2="290" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#da)"/>
    <line x1="620" y1="235" x2="620" y2="330" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#da)"/>
    <line x1="680" y1="205" x2="880" y2="290" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#da)"/>
    <line x1="620" y1="415" x2="620" y2="480" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#da)"/>
    <line x1="300 " y1="360" x2="300" y2="480" stroke="#5a5a72" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#da)"/>
    <line x1="920" y1="360" x2="920" y2="470" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#da)"/>
    <line x1="540" y1="520" x2="390" y2="520" stroke="#5a5a72" stroke-width="1.6" marker-end="url(#da)"/>
  </svg>
  ${dnode(545, 120, 150, '#2dd4bf', 'กระแสธาร', 'circle')}
  ${dnode(220, 290, 160, '#38bdf8', 'ระดับผิว', 'rect')}
  ${dnode(545, 330, 150, '#fbbf24', 'ผ่านพิธี?', 'diamond')}
  ${dnode(840, 290, 160, '#f87171', 'ระดับลึก (ต้องห้าม)', 'rect')}
  ${dnode(540, 490, 160, '#c084fc', 'ระดับกลาง', 'rect')}
  ${dlab(455, 250, 'ใช้ได้ทั่วไป')}
  ${dlab(790, 250, 'อันตราย')}
  ${dlab(640, 452, 'ผ่าน')}
  ${dlab(465, 505, 'ไม่ผ่าน')}
  ${/* module links pinned as graph nodes */''}
  <div style="position:absolute;left:225px;top:500px;display:flex;align-items:center;gap:7px;background:var(--surface);border:1.5px solid #818cf8;border-radius:var(--r);padding:7px 11px;box-shadow:0 4px 16px rgba(0,0,0,.35)">
    ${ki('layer', '#818cf8')}<span style="font-size:12px;color:var(--t1)">[[ภาคีนักเวท]]</span><span class="kind">Object</span>
  </div>
  <div style="position:absolute;left:845px;top:490px;display:flex;align-items:center;gap:7px;background:var(--surface);border:1.5px solid #fb923c;border-radius:var(--r);padding:7px 11px;box-shadow:0 4px 16px rgba(0,0,0,.35)">
    ${ki('person', '#fb923c')}<span style="font-size:12px;color:var(--t1)">[[ท่านเคียร์]]</span><span class="kind">Character</span>
  </div>
  <div class="chint">🖱 ขวาค้างลาก = เลื่อน · Scroll = ซูม · ลาก node จัดผังอิสระ · ดับเบิลคลิกแก้ข้อความ</div>
  <div class="czoom"><span class="zbtn">−</span><span class="zlvl">100%</span><span class="zbtn">+</span><span class="zsep"></span>7 nodes · 7 edges</div>
</div>`;
fs.writeFileSync(path.join(OUT, '31-designer.html'),
  page('designer', 'world', 'designer', [['ผังระบบเวท', 'Designer', 1]],
    designerContent, 'เอเธเรีย <b>›</b> ผังระบบเวท', 'Minor · Graph "Designer"'));

/* ══ 32/33: Viewer — Cards & Board views ══ */
const vFilterBar = `
<div style="display:flex;gap:7px;margin-bottom:14px;align-items:center;font-size:11.5px">
  <span style="color:var(--t3)">Filter:</span>
  ${['ชนิด = Event + Dialogue', 'tag = #หลัก', 'ช่วงเวลา = ปี 1024', 'เรียงตามเวลา'].map(f => `<span class="chip" style="border-color:var(--accent);color:var(--accentH)">${f}</span>`).join('')}
  <span class="btn btn-s btn-i" style="margin-left:auto">${ic.edit}</span>
</div>`;
const vHead = (act) => `
<div class="detail-head" style="border-color:#a3e635">
  <h2>รวมฉากสำคัญ <span class="chip" style="margin-left:6px">Viewer · read-only</span></h2>
  <div class="sub">แสดงผลของ list ที่ filter ไว้ · อัปเดตอัตโนมัติเมื่อข้อมูลต้นทางเปลี่ยน</div>
  <div class="mtags"><span class="htag" style="border-color:#a3e635;color:#a3e635">#สรุป</span><span class="htag lk">🔗 3 links</span>${viewbar(VIEWER_VIEWS, act)}</div>
</div>${vFilterBar}`;
const VITEMS = [
  ['วันล่มสลายของหอคอย', 'ยุคแห่งไฟ', 'Event', '3/1/1024 09:00', '#f87171', 'timeline'],
  ['อารินพบเซลีน', 'ยุคแห่งไฟ', 'Event', '17/4/1024 18:30', '#818cf8', 'timeline'],
  ['ช่วยหมู่บ้าน', 'เส้นทางเนื้อเรื่อง', 'Dialogue', 'บทที่ 1', '#34d399', 'story'],
  ['เดินทางต่อ', 'เส้นทางเนื้อเรื่อง', 'Dialogue', 'บทที่ 1', '#fbbf24', 'story'],
  ['ศึกทะเลทรายแดง', 'ยุคแห่งไฟ', 'Event', '21/11/1024 05:45', '#fb923c', 'timeline'],
  ['พบท่านเคียร์', 'เส้นทางเนื้อเรื่อง', 'Dialogue', 'บทที่ 1', '#38bdf8', 'story'],
];
// Cards view
const vCards = vHead(1) + `
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:1020px">
  ${VITEMS.map(([n, src, kind, t, col, icn]) => `
  <div style="border:1px solid var(--border);border-top:3px solid ${col};border-radius:var(--r);background:var(--surface);padding:13px">
    <div style="display:flex;align-items:center;gap:8px">${ki(icn, col)}<b style="font-size:13px">${n}</b><span class="kind" style="margin-left:auto">${kind}</span></div>
    <div style="font-size:10.5px;color:var(--t3);margin-top:7px">มาจาก: ${src}</div>
    <div style="font-size:11px;color:var(--t2)">${t}</div>
    <div style="margin-top:8px"><span class="chip">#หลัก</span></div>
  </div>`).join('')}
</div>`;
fs.writeFileSync(path.join(OUT, '32-viewer-cards.html'),
  page('viewer-cards', 'world', 'world', [['รวมฉากสำคัญ', 'Viewer', 1]],
    vCards, 'เอเธเรีย <b>›</b> รวมฉากสำคัญ', 'Viewer · View: Cards'));
// Board view (grouped by source module)
const vcol = (title, col, items) => `
<div style="flex:1;min-width:0;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:10px">
  <div style="display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:700;color:${col};margin-bottom:9px">${title}<span class="kind" style="margin-left:auto">${items.length}</span></div>
  ${items.map(([n, kind, t, c, icn]) => `
  <div style="border:1px solid var(--border);border-left:3px solid ${c};border-radius:var(--rs);background:var(--raised);padding:8px 10px;margin-bottom:7px">
    <div style="display:flex;align-items:center;gap:7px;font-size:12px">${ki(icn, c)}${n}</div>
    <div style="font-size:10px;color:var(--t3);margin-top:3px">${kind} · ${t}</div>
  </div>`).join('')}
</div>`;
const vBoard = vHead(2) + `
<div style="display:flex;gap:14px;max-width:1020px;align-items:flex-start">
  ${vcol('ยุคแห่งไฟ (Chronicler)', '#fbbf24', [
    ['วันล่มสลายของหอคอย', 'Event', '3/1/1024', '#f87171', 'timeline'],
    ['อารินพบเซลีน', 'Event', '17/4/1024', '#818cf8', 'timeline'],
    ['ศึกทะเลทรายแดง', 'Event', '21/11/1024', '#fb923c', 'timeline']])}
  ${vcol('เส้นทางเนื้อเรื่อง (Narrator)', '#c084fc', [
    ['ช่วยหมู่บ้าน', 'Dialogue', 'บทที่ 1', '#34d399', 'story'],
    ['เดินทางต่อ', 'Dialogue', 'บทที่ 1', '#fbbf24', 'story'],
    ['พบท่านเคียร์', 'Dialogue', 'บทที่ 1', '#38bdf8', 'story']])}
  ${vcol('เล่ม 1 (Author)', '#f43f5e', [
    ['บทที่ 1 — เถ้าถ่านของเวรีเดียน', 'Chapter', '1,204 คำ', '#f43f5e', 'book']])}
</div>
<div style="font-size:10.5px;color:var(--t3);margin-top:12px">Group by: module ต้นทาง ▾ (สลับเป็น group by tag / ชนิด ได้)</div>`;
fs.writeFileSync(path.join(OUT, '33-viewer-board.html'),
  page('viewer-board', 'world', 'world', [['รวมฉากสำคัญ', 'Viewer', 1]],
    vBoard, 'เอเธเรีย <b>›</b> รวมฉากสำคัญ', 'Viewer · View: Board'));

/* ══ 19: overview montage of every screen ══ */
const shots = [
  ['01-shell.png', '01 Shell — toolbar + hub + tree + tabs'], ['02-classifier.png', '02 สร้าง Classifier'],
  ['03-locator.png', '03 Locator — map หลาย node/รูปทรง'], ['04-chronicler.png', '04 Chronicler — สเกลเวลาจริง'],
  ['05-inspector.png', '05 Module Inspector + link'], ['06-scribe-chat.png', '06 Scribe — chat note'],
  ['07-settings.png', '07 Settings — ชื่อ Classic/Unique'], ['08-manager.png', '08 Manager — เปิดดูเนื้อหา'],
  ['09-detail.png', '09 Inspector — โน้ตสั้น'], ['10-wanderer.png', '10 Wanderer — Map+Timeline'],
  ['11-narrator.png', '11 Narrator — dialogue route'], ['12-author.png', '12 Author — หนังสือ+บท'],
  ['13-drafter.png', '13 Drafter — markdown'], ['14-viewer.png', '14 Viewer — ผล filter'],
  ['15-connector.png', '15 Connector — กราฟสัมพันธ์'], ['16-split2.png', '16 Builder split 2'],
  ['17-split4.png', '17 Builder split 4'], ['18-final.png', '18 สถานะสุดท้าย — ทุกระบบพร้อมกัน'],
  ['20-classifier-listdetail.png', '20 Classifier view: List + Detail'], ['21-classifier-grid.png', '21 Classifier view: Grid Collection'],
  ['22-chronicler-downline.png', '22 Chronicler view: Down-line + List'], ['23-chronicler-compare.png', '23 Chronicler view: Compare Parallel'],
  ['24-searchlink.png', '24 Search Link — overlay + scope filter'], ['25-sagehut.png', '25 Sage Hut — analytics'], ['26-versions.png', '26 Version History + ปุ่มย้อน builder'], ['27-customtheme.png', '27 Custom Theme editor'], ['28-sketcher.png', '28 Sketcher — วาด/จด + link node'], ['29-importdock.png', '29 Import Dock — ผูกไฟล์/เปิดอ่าน'], ['30-iconpicker.png', '30 Icon Collection picker'], ['31-designer.png', '31 Graph Designer — ผังอิสระ'], ['32-viewer-cards.png', '32 Viewer view: Cards'], ['33-viewer-board.png', '33 Viewer view: Board'],
  ['theme-daylight.png', 'ธีม daylight'], ['theme-rainbow.png', 'ธีม rainbow'],
];
const overview = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>overview</title>
<link rel="stylesheet" href="mock.css"><style>
body{width:100vw;height:auto;overflow:visible;padding:26px 26px 12px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 16px}
.cell img{width:100%;border:1px solid var(--border);border-radius:8px;display:block}
.cell .cap{font-size:11px;color:var(--t2);margin-top:5px;text-align:center}
h1{font-size:17px;margin-bottom:4px}
.subt{font-size:11.5px;color:var(--t3);margin-bottom:16px}
</style></head><body>
<h1>DraconDex v3 — ภาพรวมหลังทำครบทุก phase (17 phases)</h1>
<div class="subt">Nexus nest · Dynamic toolbar · Classifier/Manager/Collector/Inspector · Locator/Chronicler/Wanderer/Narrator · Author/Scribe/Drafter · Viewer/Connector · Sage Hut · Import Dock · Split builder · Tag & Link ทุก module</div>
<div class="grid">
${shots.map(([f, cap]) => `<div class="cell"><img src="${f}"><div class="cap">${cap}</div></div>`).join('')}
</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, '19-overview.html'), overview);
console.log('built', fs.readdirSync(OUT).filter(f => f.endsWith('.html')).join(', '));
