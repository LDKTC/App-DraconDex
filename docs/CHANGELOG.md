# DraconDex — Doc Changelog

บันทึกทุกครั้งที่ Claude แก้โค้ดแล้วมีผลต่อพฤติกรรมของระบบ — เขียนโดยสกิล
`write-docs` (`.claude/skills/write-docs/`) แต่ละรายการอ้างอิง commit/ช่วงเวลา
พร้อมสรุปว่า **เปลี่ยนอะไร**, **ทำไม**, และ **ต้องแก้ doc ไหนบ้าง**

รูปแบบต่อรายการ:

```
## YYYY-MM-DD — หัวข้อสั้น ๆ
- commit: <sha หรือ "uncommitted">
- ไฟล์ที่แก้: path/to/file.js, path/to/other.js
- อะไรเปลี่ยน: ...
- ทำไม: ...
- Doc ที่อัปเดต: docs/SYSTEMS.md §X, docs/FILES.md §Y (หรือ "ไม่กระทบ doc")
```

รายการใหม่เพิ่มไว้ **บนสุด** (ใหม่ไปเก่า)

---

## 2026-08-21 — Restore Tags page + Builder tab-move backward-fill (Process 6 part 2)
- commit: `uncommitted`
- ไฟล์ที่แก้: `electron/src/renderer/core/views.js`, `electron/src/renderer/builder.js`
- อะไรเปลี่ยน:
  1. **Tags page** — `switchView()` เดิมลบ branch `'hashtag'` ไปพร้อมกับ
     `'project-hashtag'` ตอนลบ legacy Director/Navigator/Hero/Writer ทิ้ง
     (v.4.10.0) ทั้งที่คนละเรื่อง — `renderHashtagView()`/backend
     (`api.hashtag.*`) ไม่เคยถูกลบเลย มีแค่ทางเข้าหายไป กดปุ่ม nav-sidebar
     "ป้ายกำกับ" แล้วไม่มีอะไรเกิดขึ้นเงียบๆ มาตลอด — เพิ่ม branch กลับเข้าไป
     เหมือนเดิม (มีรูปแบบเดียวกับ branch `'colors'` — ไม่มี tab bar,
     ไม่ผ่าน Builder grid)
  2. **Builder tab-move-to-new-pane** — `builderMoveTabTo()` แยกพฤติกรรมออก
     จาก `builderCloseTab()` แล้ว 2 จุด: fallback ของ active tab ใน source
     pane เปลี่ยนจากสูตรตำแหน่ง (`tabs[idx]??tabs[idx-1]`) เป็น
     `pickBackwardActiveTab()` ใหม่ — ไล่ `pane.history` (back/forward log
     เดิม) ย้อนหลังหา tab ที่เพิ่งดูล่าสุดที่ยังอยู่จริง; และ source pane ที่
     ว่างเปล่าหลังย้าย tab ออกไม่ปิด pane อัตโนมัติอีกต่อไป (เดิมเรียก
     `builderCloseIfEmpty` เหมือนปิด tab) — ปล่อยให้ว่างอยู่แล้วเติม
     `builderEmptyPaneHtml()` (helper ใหม่ ดึงมาจาก `buildBuilderPageHtml()`
     เดิม) เข้า `.bpane-body` ตรงๆ ทันที ส่วนปิด tab สุดท้ายจริงๆ ยังปิด pane
     เหมือนเดิมไม่แตะ
- ทำไม: Process 6 part 2 ใน Plan.md — ข้อ 1 เป็นของหายจากการลบ legacy รอบก่อน,
  ข้อ 2 เป็นพฤติกรรมที่ผู้ใช้อยากให้แยกจาก "ปิด tab" ให้ชัดเจน (ย้าย ≠ ปิด)
- Doc ที่อัปเดต: `docs/SYSTEMS.md` §4.4, `docs/Architec.md` §1.4,
  `docs/FILES.md` หัวข้อ "Process 6 part 2" + คีย์ `hashtag.js`/`builder.js`

---

## 2026-08-21 — Nav rail pin/resize/horizontal-layout/pinned-click fixes + themed scrollbar (Process 6 part 1)
- commit: `uncommitted`
- ไฟล์ที่แก้: `electron/index.html`, `electron/css/{base,nav-hub,workspace}.css`,
  `electron/src/renderer/i18n.js`,
  `electron/src/renderer/hub/{kinds,menus,open}.js`,
  `electron/src/renderer/core/{state,ui,boot,workspace-style}.js`
- อะไรเปลี่ยน:
  1. **pin feature** — `renderModuleRail()`/`buildNavPinListHtml()` เดิมอ่านแค่
     `S.moduleTree` (root-level array) ตรงๆ ทำให้ module ที่ pin ไว้ลึกกว่า
     top-level (pin ได้ทุก depth มาตั้งแต่ Process 3 part 2) ไม่ขึ้น btn บน rail
     เลย — เปลี่ยนเป็น walk ทั้งต้นไม้ผ่าน `flattenModuleTree` (helper เดิม)
  2. **navbar resize Y-axis** — `#nav-sidebar.nav-expanded .nav-btn` padding
     แนวตั้งเดิมผูกกับ `calc(var(--nav)*.07)` (บั๊กจาก Process 4 part 2) ทำให้
     ลาก resize rail กว้างขึ้นแล้วปุ่มบวมในแกน Y ทั้งที่ลากแค่แกน X — เปลี่ยนเป็น
     ค่าคงที่ `6px`; เพิ่ม toggle "แสดงป้ายชื่อเสมอ" ใหม่ใน Setting → Workspace
     (เฉพาะ orientation vertical) — `S.settings.navVerticalAlwaysLabel`
  3. **horizontal navbar** — เดิม `width:auto` (แคบแค่พอรับปุ่ม ไม่ยืดเต็ม
     window) เปลี่ยนเป็น `width:100%`; เพิ่ม resize handle ของตัวเอง
     (`#nav-toolbar-h-resize` ลาก drag ปรับ `--navh`) เหมือน vertical rail มี;
     `.rail-sep`/`.nav-btn.active::after` เพิ่ม override ให้เข้ากับ row layout
     (เดิม `.rail-sep` กลายเป็นเส้น 0 ความสูงที่มองไม่เห็นในโหมดนี้)
  4. **pinned rail button click** — เดิมใช้ `openModuleNode` ตรงๆ (สำหรับ
     collector คือ toggle เฉยๆ, module ที่ซ้อนลึกเป็น no-op เพราะ
     `if(m.parent_id==null)` gate) — เปลี่ยนเป็น `openPinnedRailModule` ใหม่:
     เปิด Hub section "Nest" เสมอ, ยุบทุก root branch อื่นเหลือแค่ branch ของ
     module ที่ pin (only-one-list-open), focus ไปที่ module นั้น แล้วเปิด
     builder ต่อถ้าไม่ใช่ kind `collector`
  5. **scrollbar** — เพิ่ม `*::-webkit-scrollbar` default ใน `base.css` (เดิมมี
     rule เฉพาะจุดแค่ 2-3 ที่ ที่เหลือ fallback เป็น scrollbar ขาวของ Chromium
     ทันทีที่ content ยาวเกิน viewport)
- ทำไม: Process 6 part 1 ใน Plan.md — พฤติกรรมทั้ง 5 ข้อเป็นบั๊ก/ของขาดที่ผู้ใช้
  รายงานจากการใช้งานจริงหลัง Process 4-5
- Doc ที่อัปเดต: `docs/SYSTEMS.md` (nav rail note ใต้หัวเอกสาร), `docs/FILES.md`
  หัวข้อ "Process 6 part 1" + แก้ตัวเลขบรรทัด `hub/`/`base.css`/`nav-hub.css`

---

## 2026-08-21 — Workspace nav orientation + .mdx module export/import target choice (Process 5)
- commit: `uncommitted`
- ไฟล์ที่แก้: `electron/index.html`, `electron/main.js`, `electron/preload.js`,
  `electron/css/workspace.css`, `electron/src/db/import-merge.js`,
  `electron/src/renderer/i18n.js`, `electron/src/renderer/wyvern.js`,
  `electron/src/renderer/core/{state,boot,views,workspace-style}.js`
- อะไรเปลี่ยน:
  1. **part 1 (setting)** — Setting → Workspace หน้า "Workspace Style" เปลี่ยน
     ชื่อเป็น "Workspace" เฉยๆ (ค่า i18n key `settingPageWorkspaceStyle` เท่ากับ
     `settingGroupWorkspace` ทุก locale แล้ว) เพราะหน้านี้ตอนนี้มีมากกว่าแค่เลือก
     สไตล์ — เพิ่ม layout controls ใหม่: nav orientation ต่อ workspace style
     (vertical/horizontal, default Drake=vertical, Wyvern=horizontal,
     Dragon=vertical, override ได้แบบ live ไม่ต้อง restart) และเมื่อ horizontal
     เลือกได้เพิ่มว่าจะโชว์ icon/label/ทั้งคู่ — กลไกเบื้องหลังคือ
     `applyNavOrientation()` (boot.js) **ย้าย parent** ของ `#nav-sidebar`/
     `#workspace-toolbar` ระหว่าง `#app` row เดิมกับ `#nav-toolbar-h` (mount ใหม่
     ใต้ title bar) — element/onclick เดิมทั้งหมด ไม่มีการ re-render ใหม่
  2. **part 2 (file database)** — module export เปลี่ยนนามสกุลจาก `.json` เป็น
     `.mdx` (เดิมชนกับ nexus snapshot export ที่เป็น `.json` เหมือนกัน แยกไม่ออก),
     import `.ddx`/`.mdx` ตอนนี้ถามก่อนว่าจะนำเข้าสู่ Nexus ที่เปิดอยู่ หรือสร้าง
     Nexus ใหม่แล้วนำเข้าเข้าไปแทน (เดิม merge เข้า vault ที่เปิดอยู่เสมอ ไม่มีทาง
     เลือก) — "สร้างใหม่" คือสร้าง nexus เปล่าจริงๆ ก่อน (ชื่อจากชื่อไฟล์) แล้ว
     import เข้า id นั้นตรงๆ ผ่าน `getVaultDB(targetNexusId)` แทน `getDB()` ambient
     เดิม ไม่ใช่ adopt ไฟล์ภายนอกเป็น vault file จริง (ไม่มี mechanism รองรับ)
  3. bug fix ที่เจอระหว่างทำ: `#workspace-toolbar` (Wyvern) ไม่เคยมี
     `display:flex` เลยตั้งแต่สร้างขึ้นมา — `flex-direction`/`align-items`/`gap`
     เป็น no-op มาตลอด เดิมไม่มีใครสังเกตเพราะ vertical mode ปุ่มยัง stack ตาม
     block flow ปกติอยู่ดี แต่ horizontal mode ใหม่พังทันทีถ้าไม่แก้
- ทำไม: Plan.md "Procress 5" ทั้ง 2 part
- Doc ที่อัปเดต: `docs/FILES.md` (ย่อหน้าใหม่ "Process 5 part 1"/"Process 5
  part 2"), `docs/SYSTEMS.md` §1 (หมายเหตุ nav orientation)

---

## 2026-08-21 — Nav rail quick-menu toggle + navbar/left-panel resize fixes (Process 4 part 2)
- commit: `uncommitted`
- ไฟล์ที่แก้: `electron/src/renderer/hub/kinds.js`, `electron/src/renderer/hub/menus.js`,
  `electron/src/renderer/core/state.js`, `electron/src/renderer/core/ui.js`,
  `electron/css/nav-hub.css`, `electron/css/layout.css`
- อะไรเปลี่ยน:
  1. Nav rail เพิ่มปุ่มลัด Sage Hut/Import Dock ต่อจาก Kind Browser เดิม
     (เดิมเข้าได้แค่ผ่าน Hub accordion header) พร้อม context menu (คลิกขวา)
     ใหม่ให้สลับซ่อน/แสดงทีละปุ่มในสาม — Nexus Nest เป็นปุ่ม home ไม่รวมอยู่
     ในลิสต์ตามที่ระบุใน Plan.md — สถานะเก็บใน `S.settings.hubQuickToggles`
     (localStorage tier เดียวกับ `navToggles`)
  2. `#nav-sidebar.nav-expanded .nav-btn` (nav-hub.css) เปลี่ยน padding แนวตั้ง
     จาก `0` ตายตัวเป็น `calc(var(--nav) * .07)` — เดิม resize navbar กว้างขึ้น
     แล้วปุ่มไม่ขยายในแกน Y เพราะ padding แนวตั้งไม่เคยผูกกับความกว้าง rail เลย
  3. `#left-panel` (layout.css) เดิมมี `transition:width var(--ease)` ค้างอยู่
     ระหว่างลาก resize ทุก mousemove ที่ set `--sidebar` ใหม่จะไป restart
     animation 150ms เดิม ทำให้ panel กระตุก/ไล่ตามเมาส์ไม่ทัน — แก้ด้วยคลาส
     `panel-resizing` (`transition:none`) toggle ระหว่างลากจริงเท่านั้น พร้อม
     เพิ่ม `body.resize-drag-active{user-select:none}` กัน text-selection
     กระพริบ และขยาย clamp บนสุดจาก 480 เป็น 560px
- ทำไม: Plan.md "Process 4 / part 2 : add and fix" ทั้ง 3 ข้อ
- Doc ที่อัปเดต: `docs/FILES.md` (ตาราง `hub/` line count + ย่อหน้าใหม่ท้าย
  หัวข้อ Wyvern/Dragon), `docs/SYSTEMS.md` §1 (หมายเหตุ nav rail quick-menu)

---

## 2026-08-20 — คืนค่า `.icon`/search-bar CSS ที่หายไปตอนลบ legacy modules (Process 4 part 1)
- commit: `uncommitted`
- ไฟล์ที่แก้: `electron/css/components.css`, `electron/css/nav-hub.css`,
  `electron/css/layout.css`, `electron/css/shared-carryover.css`
- อะไรเปลี่ยน: v.4.10.0 (`c72411e`, ลบ Director/Navigator/Hero/Writer แบบ
  physical) ลบไฟล์ `electron/css/legacy-tables.css` ทิ้งทั้งไฟล์ — แต่ไฟล์นั้น
  ถือกฎ `.icon` แบบ generic ที่ทุก `<svg class="icon">` ในแอปพึ่งพาอยู่
  (`width/height:1em`, `stroke:currentColor`, …) กับกฎ `#search-bar`/
  `#search-input` ของกล่องค้นหาบน left panel ไว้ด้วย ไม่ใช่ rule เฉพาะโมดูล
  legacy อย่างที่คิดตอนลบ — ผลคือ icon ทุกตัวในแอปพัง (ไม่มี width/height
  กำหนดจาก CSS เลย ทำให้ browser fallback ไปใช้ขนาด replaced-element เริ่มต้น
  ที่ใหญ่กว่าเดิมมาก) และกล่องค้นหากลายเป็น input เปล่าไม่มี style เพิ่ม
  กลับมาแล้ว: `.icon` base rule + `.btn .icon`/`.btn-i .icon`
  (`components.css`), `.ph .icon`/`.fhead .icon` (`layout.css`),
  `.htag-item .icon` (`shared-carryover.css`), `.nav-logo-btn .icon`/
  `.nav-btn .icon`/`.nav-btn .kicon-img-icon`/`.nav-btn:hover .icon`
  (`nav-hub.css`), และ `#search-bar`/`#search-input`/`#search-input:focus`
  (`nav-hub.css`). ตั้งใจไม่คืน `.nav-btn.active .icon{color:var(--on-accent)}`
  เดิม — ขัดกับดีไซน์ active-state แบบ left-bar อย่างเดียวที่ทำไปหลังจากนั้น
  (nav-hub.css คอมเมนต์ process2 part1 #1) — และไม่คืน rule เฉพาะโมดูล legacy
  จริง ๆ (`.series-card-icon .icon`, `.sage-card-icon .icon` ฯลฯ) เพราะไม่มี
  ใครเรียกใช้แล้ว
- ทำไม: Plan.md Process 4 part 1 — บั๊กที่ผู้ใช้รายงานหลังอัปเดตแอป (navbar
  label/pinned-module icon หาย, icon ใหญ่เกินจน layout เละ, search box ไม่มี
  style) ทั้งหมดสืบไปที่ root cause เดียวกันคือ `.icon` base rule หาย —
  ยืนยันด้วยการรันแอปจริงผ่าน `web-driver.mjs` (สร้าง Nexus + pin module):
  ก่อนแก้ icon ทุกตัวจะเรนเดอร์โดยไม่มีขนาดกำกับ หลังแก้ nav rail ขยายแล้ว
  แสดง label/icon ของ pinned module ถูกต้อง และกล่องค้นหามี border/background
  ตามธีมแล้ว
- Doc ที่อัปเดต: ไม่กระทบ doc อื่น (CSS-only, ไม่มี IPC/behavior ใหม่)

## 2026-08-20 — Hub context-menu overhaul (Process 3 part 2)
- commit: `uncommitted`
- ไฟล์ที่แก้: `electron/src/renderer/hub/menus.js`, `electron/src/renderer/hub/popups.js`,
  `electron/src/renderer/hub/tree.js`, `electron/src/renderer/core/views.js`,
  `electron/src/renderer/mod/fileviewer.js`, `electron/src/renderer/i18n.js`
- อะไรเปลี่ยน: module context menu (`buildModuleContextMenuHtml`) เอา `isMajor`
  gate เดิม (`parent_id==null`, ความหมาย pre-Process-3-Part-1 ของ "Major") ออก
  ทั้งหมด — Create/Import module/Export module/Pin ตอนนี้ขึ้นทุก module ไม่ว่า
  จะลึกแค่ไหน. เพิ่มแถว "Edit module" ใหม่, ลบแถว "Add Minor module" ออก (Create
  ทำหน้าที่แทนแล้ว, auto-parent เป็น child ของ module ที่เปิดเมนูอยู่แล้วจากรอบ
  ก่อน), ย้าย Collector เข้าไปใน Create submenu เป็นแถวแรกสุด label ใหม่ "create
  folder" (`createFolder`, i18n key ใหม่ 18 locale — คีย์ใหม่คีย์เดียวของรอบนี้).
  "Move to" เปลี่ยนจาก click-swap-in-place (`openMoveToListInPlace`, ลบทิ้ง) เป็น
  hover flyout เหมือน Create (`openMoveToSubmenu`, ใช้ `buildMoveToListHtml`/
  `positionSubmenuNear` เดิม). แถว Delete ได้ class `.kli-danger` (โทนแดงเดียวกับ
  `core/nexus-options.js`'s delete row). ลบปุ่ม hover +/pencil บนแถว Nest tree
  ออก (`.acts` span ใน `buildNestRow`) และลบ right-click popup สร้าง module บน
  พื้นที่ว่างของ Hub (`onHubBackgroundContextMenu`, ปุ่ม + ที่ header ของ Nest
  section กับปุ่ม CTA ตอน tree ว่างยังอยู่เหมือนเดิม). Import Dock file row เพิ่ม
  right-click menu ของตัวเอง — แถวเดียว "ลบ" เรียก `deleteImportFileRow` เดิม
  (unlink metadata, ไม่แตะไฟล์บนดิสก์); folder row ไม่ทำในรอบนี้ (ไม่มี
  bulk-delete backend). Import/Export module ใช้ i18n key ที่มีอยู่แล้ว
  (`settingDbImportModule`/`settingDbExportModule`) ผ่าน wrapper ใหม่
  `ctxImportModule`/`ctxExportModule` ใน `hub/menus.js` (เรียก
  `api.db.exportModuleFile`/`importModuleFile` ตรง ไม่ผ่าน Settings-page cache).
- ทำไม: Process 3 Part 1 เปลี่ยนความหมาย "Major module" เป็นทุก module ไม่ว่า
  ความลึก แต่ context menu ยังใช้ gate แบบเก่าอยู่ — ตามด้วยการปรับ workflow
  สร้าง/ย้าย/ลบ module ให้เข้าถึงง่ายขึ้นจาก context menu เดียว แทนที่ปุ่มแยก
  กระจายอยู่หลายที่ (Plan.md Process 3 part 2)
- Doc ที่อัปเดต: `docs/Architec.md` §1.2 (Context menu — คำอธิบาย gate/แถวเมนู
  ใหม่ทั้งหมด), `docs/FILES.md` (`mod/fileviewer.js` entry)

## 2026-08-19 — Plugin recommend list กรองด้วย `.dracondex` marker (Process 1 part 2)
- commit: `uncommitted`
- ไฟล์ที่แก้: `electron/src/db/plugin.js`
- อะไรเปลี่ยน: `pluginListOrgRepos()` (รายการ "install from @LDKTC" บนหน้า
  Setting → ปลั๊กอิน) เดิมกรองแค่ `is_template`/`archived` ตอนนี้เพิ่มสองเงื่อนไข —
  (1) ตัด `DraconDex-Plugin-Template` ออกด้วยชื่อ repo เสมอ และ (2) เหลือเฉพาะ
  repo ที่มีไฟล์ `.dracondex` อยู่ที่ root จริง (เช็คผ่าน GitHub Contents API
  ฟังก์ชันใหม่ `repoHasDracondexMarker()`) — เพิ่ม `.dracondex` marker file ให้
  `DraconDex-Plugin-Template` และปลั๊กอินทั้ง 4 ตัวในบัญชี (`-Native`, `-Claude`,
  `-Codex`, `-Ollama`) แล้วเป็นส่วนหนึ่งของงานนี้
- ทำไม: Plan.md Process 1 part 2 — กันไม่ให้ repo สาธารณะอื่นที่ไม่เกี่ยวกับ
  DraconDex เลยโผล่ในรายการแนะนำ และกันตัว template เองไม่ให้แนะนำกลับมาที่ผู้ใช้
- Doc ที่อัปเดต: `docs/PLUGINS.md` §1.1b (ใหม่)

## 2026-08-14 — หนึ่ง Nexus = หนึ่งไฟล์ .ddx, dependency ปลั๊กอินบล็อกการเปิดใช้งาน, เมนู ⋯ ของ Nexus, ช่องเสียบ cloud storage (v4.9.0)
- commit: `25b5be8`..`b04e90e` (9 commits)
- ไฟล์ที่แก้: `electron/src/db/conn.js`, `electron/src/db/vault-context.js` (ใหม่),
  `electron/src/db/vaults.js` (ใหม่), `electron/src/db/split-migrate.js` (ใหม่),
  `electron/src/db/nexus.js`, `electron/src/db/color.js`, `electron/src/db/plugin.js`,
  `electron/src/db/versions.js`, `electron/src/db/import-merge.js`, `electron/src/db/drive.js`,
  `electron/src/db/sync.js`, `electron/src/db/secret-store.js`,
  `electron/src/db/cloud.js` / `cloud-drive.js` / `cloud-planned.js` (ใหม่),
  `electron/src/db/schema/ddl.js`, `electron/src/db/schema/init.js`,
  `electron/main.js`, `electron/preload.js`, `electron/database.js`, `electron/index.html`,
  `electron/src/renderer/core/nexus.js`, `core/nexus-options.js` (ใหม่), `core/welcome.js`,
  `core/boot.js`, `core/setting-window.js`, `electron/src/renderer/cloud.js` (ใหม่),
  `electron/src/renderer/plugin.js`, `pluginpanel.js`, `drive.js`, `mod/fileviewer.js`,
  `electron/src/renderer/i18n.js`, `electron/css/components.css`, `builder.css`, `inspector.css`,
  `electron/test/schema-split.test.mjs` (ใหม่)

- **อะไรเปลี่ยน (1) — ฐานข้อมูลแยกเป็น `app.ddx` + หนึ่ง `.ddx` ต่อหนึ่ง Nexus**
  เดิมทุก vault อยู่ไฟล์เดียว ตอนนี้ระดับแอป (preference, credential, ปลั๊กอิน,
  ทะเบียน vault) อยู่ `app.ddx` ส่วนแต่ละ Nexus เป็นไฟล์ของตัวเองใน `vaults/`
  ที่ผู้ใช้เลือกที่เก็บได้ทุก build. `getDB()` ยังเป็นตัวเดิมที่ ~464 จุดเรียก
  โดย resolve vault ผ่าน `AsyncLocalStorage` ที่ `h()` ใน main.js ตั้งให้ต่อ
  IPC call. migration ครั้งเดียวเป็น copy-แล้ว-prune, สร้างใน temp แล้ว rename
  เข้าที่ (vault ก่อน, `app.ddx` ทีหลังสุดในฐานะ commit marker), เก็บไฟล์เดิมไว้
  เป็น `novel-manager.ddx.bak`
- **ทำไม:** เอาโลกใบเดียวใส่ USB / ส่งให้เพื่อน / แยกโฟลเดอร์ไม่ได้เลยตอนไฟล์
  เดียว และการส่ง Nexus หนึ่งอันเท่ากับส่ง refresh token ของ Google Drive ไปด้วย

- **อะไรเปลี่ยน (2) — dependency ปลั๊กอินที่ยังขาด บล็อก "เปิดใช้งาน" แทน "ติดตั้ง"**
  ปลั๊กอินติดตั้งสำเร็จเสมอ, ผลของ dependency ถูกบันทึกในตาราง
  `plugin_dependency` ใหม่, แถวในหน้า Setting ขึ้นบล็อกแดงพร้อมปุ่ม **ดาวน์โหลด**
  ต่อ dependency หนึ่งตัว และ `plugin:launch` ปฏิเสธด้วย `missing_dependency`
- **ทำไม:** ของเดิม abort ทั้งก้อนเพราะเน็ตหลุดชั่วคราวก็ได้ และไม่ช่วยอะไรเลย
  กับกรณีผู้ใช้ถอน dependency ทีหลัง

- **อะไรเปลี่ยน (3) — เมนู ⋯ ต่อ Nexus บนหน้า Welcome**
  ทำสำเนา / ส่งออก / แชร์ / เปิดในตัวจัดการไฟล์ / ลบ — เป็น file operation จริง
  ได้เพราะข้อ (1). แถมแก้บั๊ก: ตัวปิด popup เมื่อคลิกนอกพื้นที่ถูกลงทะเบียนที่
  ท้าย `init()` ซึ่งหน้าต่าง Welcome ไม่เคยไปถึง

- **อะไรเปลี่ยน (4) — ช่องเสียบ cloud storage (ยังไม่ต่อของใหม่)**
  registry + contract ใน `src/db/cloud.js`, หน้า Setting → ข้อมูลแอป →
  พื้นที่เก็บข้อมูลบนคลาวด์, Google Drive เข้ามาผ่าน adapter (โค้ดเดิมไม่ถูกแตะ),
  Dropbox/OneDrive/WebDAV/S3 เป็น stub ที่ตอบ `not_implemented`
- **ทำไม:** "ข้อมูลเป็นของคุณ" ครึ่งที่เป็น cloud ต้องแปลว่า "บัญชีของคุณ,
  credential ของคุณ" — hard-code Google ไว้เป็นรูปร่างที่ผิดสำหรับเรื่องนั้น

- **แก้บั๊กที่เจอจากการรันจริง:** backtick ใน SQL comment ปิด template literal
  ของ `DDL_SQL` (เจอสองครั้ง — มี test กันไว้แล้ว), contract ของ cloud provider
  ประกาศทั้ง `status: 'available'` และ `status()` แล้วเมธอดชนะเงียบๆ,
  `.btn:disabled` ไม่มี style เลยทำให้ปุ่มที่ disable ดูเหมือนใช้ได้,
  `sqlite_sequence` ไม่มี UNIQUE บน `name` จึง upsert ไม่ได้,
  และ `openDdx` ที่ publish connection หลัง init ทำให้ wiki backfill เปิด handle
  ที่สองไปไฟล์เดียวกัน

- Doc ที่อัปเดต: `docs/VAULTS.md` (ใหม่ — สถาปัตยกรรมการแยกไฟล์ทั้งหมด),
  `docs/PLUGINS.md` §1.8, `docs/CLOUD.md` (ใหม่), `docs/FILES.md`,
  `docs/Architec.md`, `docs/DRIVE.md`

---

## 2026-08-13 — Security hardening: ปิด chain RCE→ขโมย credential + ชั้นจำกัดความเสียหาย (v4.7.6)
- commit: uncommitted
- ไฟล์ที่แก้: `electron/main.js`, `electron/index.html`,
  `electron/src/db/update.js`, `electron/src/db/secret-store.js` (ใหม่),
  `electron/src/db/drive.js`, `electron/src/db/sync.js`, `electron/src/db/plugin.js`,
  `electron/src/renderer/sanitize.js` (ใหม่), `electron/src/renderer/core/ui.js`,
  `electron/src/renderer/update.js`, `electron/src/renderer/mod/author.js`,
  + 14 ไฟล์ renderer ที่แปลง inline handler มาใช้ `xj()`,
  `electron/src/renderer/i18n.js`, `electron/test/update-release.test.mjs` (ใหม่),
  `docs/UPDATE.md`, `docs/SYSTEMS.md`, `docs/FILES.md`
- อะไรเปลี่ยน:
  - **update notice ย้ายจาก Firebase Firestore ไป GitHub Releases** — ของเดิม
    ชี้ไปโปรเจกต์ `dracondex-app` ที่ในซอร์สเขียนกำกับไว้เองว่า
    `TODO(maintainer): real Firebase project id` `parseGithubRelease()` ตรวจทุก
    field: tag ต้องตรง `/^\d+(\.\d+){0,3}$/`, `html_url` ต้องอยู่ใต้
    `https://github.com/LDKTC/App-DraconDex/releases/` (ตรึงทั้ง host และ path),
    notes ตัดที่ 4000 ตัว; `openUpdateDownload()` ตรวจ prefix เดิมซ้ำแทน
    `^https?://` เปล่าๆ
  - **`x()` escape `'` เพิ่ม + เพิ่ม `xj()`** สำหรับค่าที่ส่งเป็น argument ของ
    inline handler (`onclick="f(${xj(v)})"` ไม่มี quote ล้อม) — การ escape `'`
    อย่างเดียวแก้เคสนี้ไม่ได้เพราะ HTML parser decode entity ก่อน JS parser อ่าน
    แปลง ~30 จุดที่รับข้อมูลจาก network/ไฟล์ import/ข้อความอิสระ **รวม 3 จุดที่
    เดิมแก้ด้วยมือแบบ `.replace(/'/g,"\\'")` ซึ่งจะพังใหม่ถ้าไม่แปลงพร้อมกัน**
  - **`setting:get`/`setting:set` เป็น allowlist** เหลือ key เดียวที่ renderer
    ใช้จริง (`versionLimit`) — เดิมเป็นช่อง K/V ทั่วไปที่อ่าน
    `drive:refreshToken`/`drive:clientSecret`/`google:refreshToken`/`sync:anonKey` ได้
  - **`sanitize.js` ใหม่** — Author เป็นที่เดียวที่เอา HTML ดิบที่เก็บไว้ไปใส่
    `innerHTML` (เนื้อหามาจาก `.db` ที่ import หรือ vault ที่ sync มาได้)
    กรองด้วย allowlist บน `DOMParser` normalize `tagName` เป็นตัวใหญ่ก่อนเทียบ
    เพราะ SVG/MathML เป็น foreign content ที่ `tagName` เป็นตัวเล็ก
  - **ชั้นจำกัดความเสียหาย** — `app.on('web-contents-created')` ใส่
    `setWindowOpenHandler` (ปฏิเสธทุกกรณี) + `will-navigate` ให้ทุกหน้าต่าง
    (เดิมมีแค่ webview guest ทำให้หน้าต่าง plugin ย้ายไป origin ระยะไกลแล้วยัง
    ถือ `pluginApi` ได้), หน้าต่าง plugin ได้ `partition` แยกเหมือน panel,
    ปฏิเสธ permission ทุกชนิด, และเพิ่ม CSP `<meta>` (ต้องเป็น meta tag เพราะ
    หน้าโหลดแบบ `file://`) ที่ `connect-src 'none'` ตัดทางส่งข้อมูลออก
  - **path/URL จาก renderer** — `importdock:add` รับเฉพาะ path ใต้ root ที่ผู้ใช้
    เลือกผ่าน dialog จริง และคำนวณ `file_type` จากนามสกุลจริงฝั่ง main;
    `db:importMergeFile` ผูกกับ path ที่ `db:pickImportFile` คืนมา;
    `sync:setConfig` ต้องเป็น https (หรือ http เฉพาะ loopback)
  - **`secret-store.js` ใหม่** — ห่อ credential ใน `app_setting` ด้วย
    `safeStorage` (`enc:v1:` prefix) ค่าเก่าที่เป็น plaintext อ่านได้ปกติแล้ว
    เขียนทับเป็นแบบเข้ารหัสเอง ไม่ต้อง login ใหม่ ถ้า OS ไม่มี keyring จะ
    fallback เป็น plaintext แทนที่จะ login ไม่ได้
  - i18n: เพิ่ม `syncErrBadUrl` ครบ 18 locale
- ทำไม: รอบตรวจความปลอดภัยพบ chain ที่ต่อกันได้จริง — endpoint อัปเดตที่ไม่มี
  เจ้าของ → แทรกโค้ดผ่าน inline handler → renderer ที่ถือ `window.api` ทั้งชุด →
  อ่าน refresh token ของ Google ที่เก็บเป็น plaintext โดยไม่มี CSP หรือ
  navigation guard คอยจำกัดผล ส่วนที่เหลือของแอปแน่นอยู่แล้ว (contextIsolation,
  contextBridge ระบุครบ, SQL ผูก parameter, ไม่มี credential ในซอร์ส)
- ยังไม่แก้ (ตั้งใจ): `--no-sandbox` ระดับ process, `clientSecret` ที่ยังส่งไป
  ให้ renderer, งาน CI/workflow, inline handler ที่เหลืออีก ~58 จุด,
  และการเซ็น/ปักหมุด hash ของโค้ด plugin
- Doc ที่อัปเดต: `docs/UPDATE.md` (เขียนใหม่ทั้งไฟล์), `docs/SYSTEMS.md` §10.9 (ใหม่),
  `docs/FILES.md` (`sanitize.js`, `secret-store.js`)

## 2026-08-12 — Plugin `dependencies` — ปลั๊กอินติดตั้งปลั๊กอินอื่นไปด้วยกัน (v4.8.0)
- commit: uncommitted
- ไฟล์ที่แก้: `electron/src/db/plugin-manifest.js`, `electron/src/db/plugin.js`,
  `electron/src/renderer/plugin.js`, `electron/src/renderer/i18n.js`,
  `electron/test/plugin-url.test.mjs`, `docs/PLUGINS.md`, `docs/FILES.md`
- อะไรเปลี่ยน:
  - manifest เพิ่มฟิลด์ optional `dependencies` — array ของ repo URL (รูปแบบ
    เดียวกับช่องติดตั้ง §1.1 ทุกแบบ) ไม่เกิน 5 รายการ ห้ามซ้ำ repo กัน
    (`validateDependencies`/`MAX_DEPENDENCIES` ใน `plugin-manifest.js`) +
    `manifestDependencies()` อ่านกลับ
  - `pluginPreview()` resolve dependency แต่ละตัวด้วย (`previewDependency()`)
    แล้วคืนใน `manifest.dependencies[]` — บอกชื่อ/id/ติดตั้งแล้วหรือยัง หรือ
    error code ถ้า resolve ไม่ได้ — พรีวิวการ์ดโชว์เป็นบล็อก **"ติดตั้งมาด้วย"**
    แยกจาก panels/net (`pluginPreviewDepsHtml()` ใน renderer)
  - `pluginInstall()` ติดตั้ง dependency ที่ยังไม่มีก่อนตัวปลั๊กอินหลัก
    (`installDependencyIfMissing()`, ข้ามเงียบๆ ถ้าติดตั้งแล้ว) แล้วค่อยติดตั้ง
    ปลั๊กอินที่ผู้ใช้ขอจริง — แยก `installResolvedPlugin()` ออกมาจากโค้ดเดิมให้
    เรียกซ้ำได้ทั้งสองทาง ลึกแค่ชั้นเดียวโดยตั้งใจ (ไม่มองเข้า `dependencies`
    ของ dependency เอง จึงไม่มี cycle), ปฏิเสธ dependency ที่ id ชนกับตัวเอง,
    dependency ล้มเหลว = หยุดทั้งก้อนก่อนแตะปลั๊กอินหลัก แต่ dependency ที่ติดตั้ง
    สำเร็จไปก่อนหน้าไม่ถูกถอนกลับ (ดูเหตุผลใน `docs/PLUGINS.md` §1.8)
  - **ไม่มี API ใหม่ให้ปลั๊กอินที่กำลังรันสั่งติดตั้งปลั๊กอินอื่นเองตอน
    runtime** — ทั้งหมดผ่าน install flow เดิม (preview→confirm) ที่มีอยู่แล้ว
    เท่านั้น ตั้งใจไม่เพิ่ม capability ให้หน้าต่างปลั๊กอินที่ sandbox ไม่ได้ให้
  - เพิ่ม i18n key ใหม่ 4 ตัวครบทั้ง 18 locale: `pluginPreviewDepsLabel`,
    `pluginPreviewDepAlready`, `pluginPreviewDepsWarn`, `pluginErrDependencyFailed`
  - เทสต์ใหม่ 2 รายการใน `plugin-url.test.mjs` (validateManifest กับ
    dependencies ผิดรูปแบบ/เกิน limit/ซ้ำ, `manifestDependencies` อ่านกลับ) —
    รวมทั้งไฟล์ 17/17 ผ่าน; ตัว `pluginInstall`/`pluginPreview` เองต้อง
    `require('electron')` จึงทดสอบอัตโนมัติแบบเต็มไม่ได้ — **ตรวจด้วยมือจริง
    ผ่าน `run-dracondex` web-driver ต่อ repo สาธารณะบน GitHub 3 ตัวแล้ว**
    (`DraconDex-Plugin-Claude`/`-Ollama` branch `claude/dracodex-ai-native-
    plugin-o1c3l5` ที่ประกาศ `dependencies` ชี้ `DraconDex-Plugin-Native`):
    พรีวิวโชว์บล็อก "ติดตั้งมาด้วย" ถูกต้อง (ชื่อ/id/`alreadyInstalled`),
    ยืนยันครั้งเดียวติดตั้งทั้งปลั๊กอินหลักและ dependency, ติดตั้งปลั๊กอิน AI ตัว
    ที่สองแล้ว dependency ที่มีอยู่แล้วถูกข้ามจริงไม่มีแถวซ้ำ (ดู §2.7 ข้อ 7 ที่
    อัปเดต)
- ทำไม: DraconDex-Plugin-Claude/-Ollama/-Codex (ปลั๊กอินแชท AI 3 ตัว) ต้องการ
  "auto pull" ปลั๊กอิน AI Native (DraconDex-Plugin-Native ที่ปรับปรุงใหม่ให้
  เป็นคลัง `catalog.json` สาธารณะของฟีเจอร์/เครื่องมือของแอป) ตอนติดตั้งครั้งแรก
  แต่สถาปัตยกรรม sandbox เดิมไม่มีทางให้ปลั๊กอินสั่งติดตั้งปลั๊กอินอื่นเองได้เลย
  (ไม่มีปลั๊กินไหนแตะข้อมูล/API ของปลั๊กอินอื่นได้) ทางแก้ที่ไม่เพิ่มรูรั่วคือ
  ประกาศไว้ใน manifest แล้วให้ install flow ที่ผู้ใช้กดยืนยันอยู่แล้วจัดการให้
  ทั้งหมดในทีเดียว — ผู้ใช้เห็นและอนุมัติครั้งเดียวเหมือน panels/net เดิม
- Doc ที่อัปเดต: `docs/PLUGINS.md` §1.8 (ใหม่), §2.7 ข้อ 1 และ 7,
  `docs/FILES.md` (3 บรรทัดของ plugin-manifest.js/plugin.js/renderer/plugin.js)

---

## 2026-08-11 — Plan.md procress1 part3: Setting window checkmark/ภาษาค้าง — แก้ที่ dead `#prefs-panel` guard
- commit: uncommitted
- ไฟล์ที่แก้: electron/src/renderer/core/settings.js, electron/src/renderer/core/theme.js, electron/src/renderer/core/setting-window.js, Plan.md
- อะไรเปลี่ยน:
  - `setUiSetting()` (settings.js) — เดิมมี `if(q('#prefs-panel')) renderPreferencesPanel();`
    ซึ่งเป็นโค้ดตายตั้งแต่ Setting window มาแทน Preferences panel เดิม
    (`#prefs-panel` ไม่มีอยู่ใน DOM แล้ว, `renderPreferencesPanel` ไม่มี
    definition เหลืออยู่เลย — grep เจอแค่ 3 จุดเรียก ไม่มีจุดประกาศ) เปลี่ยนเป็น
    เรียก `renderSettingWindow()` ตรงๆ (ฟังก์ชันรีเฟรช panel ตัวจริงที่มีอยู่
    แล้ว และ no-op เองถ้า panel ไม่ได้เปิดอยู่) — แก้ปัญหา checkmark
    (theme/language) ค้างค่าเก่าและข้อความ Setting window ไม่เปลี่ยนภาษาทันที
  - `deleteCustomTheme()`/`duplicateTheme()` (theme.js) — dead guard ตัวเดียวกัน
    เปลี่ยนเป็น `renderSettingWindow()` เหมือนกัน — theme grid รีเฟรชทันทีหลัง
    ลบ/ทำสำเนา custom theme
  - `renderSettingWindow()` (setting-window.js) — เพิ่มรีเฟรช `.fp-head span`
    (title ของ floating panel เอง มี `data-no-i18n` เลยพ้น auto-translate DOM
    pass) ไม่ใช่แค่ `.fp-body` — พบระหว่าง verify สด: เปลี่ยนภาษาแล้วเนื้อหาใน
    panel เปลี่ยนทันทีแต่ title bar ("การตั้งค่า"/"Setting") ยังค้างภาษาเดิม
- ทำไม: Plan.md "procress 1, part 3 : setting" — ผู้ใช้รายงานว่าคลิกเลือกค่า
  setting แล้ว checkmark ยังค้างอยู่ list เก่า และเปลี่ยนภาษาใน setting แล้ว
  ข้อความไม่เปลี่ยนทันที ต้องสลับหน้าถึงจะอัปเดต — root cause เดียวกันทั้งคู่
  (panel ไม่เคยถูกสั่ง re-render หลัง `setUiSetting()`) — verify ผ่าน
  run-dracondex driver จริง (เปลี่ยนภาษา TH→EN เห็น checkmark ย้ายทันที + ทุก
  label ในหน้าต่างเปลี่ยนภาษาทันทีรวม title bar, คลิก theme ใหม่เห็น ✓ ย้าย
  ทันที, duplicate/delete custom theme เห็นจำนวน cell เปลี่ยนทันที)
- Doc ที่อัปเดต: docs/FILES.md (แถว `settings.js`/`theme.js` ในตาราง
  `core/`, ย่อหน้า `setting-window.js`)

---

## 2026-08-11 — Plan.md procress1 part2: Builder tab เปลี่ยนเป็น replace-on-open + split/close pane ย้ายเข้า context menu
- commit: uncommitted
- ไฟล์ที่แก้: electron/src/renderer/builder.js, electron/src/renderer/hub/menus.js, electron/src/renderer/i18n.js, Plan.md
- อะไรเปลี่ยน:
  - `builderNavigate()`: เปิด module/file/item ปกติ (คลิกจาก nest tree ฯลฯ)
    **แทนที่แท็บ active เดิมในตำแหน่งเดิม** แทนการ push แท็บใหม่ต่อท้ายเสมอ
    เหมือนก่อนหน้านี้ — ใช้ trick เดียวกับ branch ของ Sage Hut sub-view ที่มี
    replace-in-place อยู่แล้ว ตรรกะ back/forward/switch-tab/drag-reorder/
    multi-pane เดิมไม่กระทบเพราะไม่มีจุดไหน push เข้า `pane.tabs` เอง
  - เพิ่ม `openModuleInNewTab(id)` (hub/menus.js) เป็นทางออกให้ยังสะสมหลายแท็บ
    ใน pane เดียวได้ตามต้องการ — push key เข้า `pane.tabs` เองก่อนเรียก
    `openModuleNode` ทำให้ตกไป branch "มีอยู่แล้ว" ของ `builderNavigate` แทน
    branch replace ปรากฏเป็นรายการ "เปิดในแท็บใหม่" ใน context menu ของ
    module (ข้าง "เปิดในหน้าต่างใหม่"/"เปิดใน Pane ใหม่")
  - ปุ่ม split/close pane แบบ inline (◫/⬓/×) ใน `builderPaneHeadHtml` ถูกถอด
    ออกทั้งหมด ย้ายไปเป็น right-click context menu บน pane header แทน —
    `openBuilderPaneContextMenu`/`buildBuilderPaneContextMenuHtml`/
    `openBuilderSeparateSubmenu` ลอกแพทเทิร์น submenu ที่มีอยู่แล้ว
    (`openPaneDirectionSubmenu`/hub/popups.js ปลั๊กปลั๊ก) — เมนู "แยกส่วน
    Pane ▸" ซ้อน split-horizontal/split-vertical, "ปิด pane" เป็นรายการ
    top-level แยกต่างหาก (โผล่เฉพาะตอน pane ถูก split แล้ว) ผูก
    `oncontextmenu` ครั้งเดียวใน `ensureNodeElement` เหมือน ResizeObserver เดิม
  - `builderCloseTab()`: ปิดแท็บสุดท้ายของ pane เดี่ยว (ปิดเหลือ pane เดี่ยว
    แล้วไม่มี parent split ให้ merge) เรียก `builderOpenPage(null)` แทนการ
    เซ็ต `pane.active=null` แล้ว `renderNexusHome()` ตรงๆ เหมือนเดิม — ของเดิม
    ไม่ได้เคลียร์ `S.activeModuleNode`/`filePreview`/`sageHut`/`activeItemNode`
    ทำให้เนื้อหาโมดูลที่เพิ่งปิดค้างอยู่ใน pane body ทั้งที่แท็บว่างแล้ว
  - i18n key ใหม่ 2 คีย์ครบ 18 locale: `openInNewTab`, `separatePane`
    (`splitPane`/`closePane` เดิมนำมาใช้ซ้ำเป็น label ของแถวใน submenu)
- ทำไม: Plan.md "procress 1, part 2 : builder changes" — ผู้ใช้ต้องการให้
  เปิดโมดูลจาก nest tree เปลี่ยนเนื้อหาแท็บเดิมแทนการสะสมแท็บอัตโนมัติ
  (พร้อมทางเลือกเปิดแท็บใหม่แบบตั้งใจ), ปุ่ม split/close ที่เคยอยู่บน pane
  header แบบถาวรรกไป ย้ายเข้า context menu, และปิดแท็บสุดท้ายของ pane ต้องขึ้น
  "ไม่มีอะไรเปิดอยู่" แทนเนื้อหาเก่าที่ค้าง — verify ผ่าน run-dracondex driver
  จริง (เปิด 2 โมดูลติดกันเห็นแท็บเดียว, คลิก "เปิดในแท็บใหม่" เห็น 2 แท็บ,
  right-click pane header เห็นเมนูใหม่ครบ, split แล้ว "ปิด pane" โผล่, ปิด
  แท็บสุดท้ายเห็น welcome placeholder ของ vault แทนเนื้อหาเก่า)
- Doc ที่อัปเดต: docs/FILES.md (`builder.js` entry, ย่อหน้า `hub.js` — เพิ่ม
  "เปิดในแท็บใหม่"/`openModuleInNewTab`)

---



---

## 2026-08-10 — แยก repo เป็น electron/ · flutter/ · src/ (shared resource)
- commit: uncommitted
- ไฟล์ที่แก้: ย้ายไฟล์ทั้ง repo (ดูรายละเอียดด้านล่าง) + `package.json`,
  `.github/workflows/{build-electron,build-apk,publish-package}.yml`,
  `.gitignore`, `.claude/skills/dracondex-file-arch/check-arch.mjs`,
  `.claude/skills/dracondex-module-style/check.mjs`,
  `.claude/skills/run-dracondex/{driver,web-driver}.mjs`, docs ทั้งชุด
- อะไรเปลี่ยน:
  - **root เหลือ 3 โฟลเดอร์โค้ด**: `electron/` (แอป Electron ทั้งหมด),
    `flutter/` (เดิม `flutter_app/`), `src/` (**ของกลางที่สองฝั่งใช้ร่วมกัน —
    ไม่มีโค้ดแอป**) ส่วน `package.json`, `docs/`, `.claude/`, `.github/`
    ยังอยู่ root เพราะเป็นของทั้งโปรเจกต์
  - ย้ายเข้า `electron/`: `main.js`, `preload.js`, `preload-plugin.js`,
    `database.js`, `index.html`, `start.js`, `ensure-electron.js`, `css/`,
    `src/db/`, `src/renderer/`, `vendor/`, `scripts/`, `test/` —
    **คงชื่อ `src/` ข้างในไว้** relative path ภายในจึงไม่ต้องแก้เลย
    (`<script src>` 59 บรรทัดใน `index.html` และ `require()` 32 บรรทัดใน
    `database.js` ไม่ขยับสักบรรทัด)
  - ย้ายเข้า `src/` (ของกลาง): `Image/` → `src/assets/brand/`,
    `flutter_app/assets/images` → `src/assets/flutter/`,
    `flutter_app/assets/fonts` → `src/assets/fonts/`, `ds-bundle/` →
    `src/design/`, `supabase/` → `src/supabase/`
  - ไฟล์ใหม่: `src/README.md` (อะไร shared / ใครกิน / ทิศทางของ truth),
    `src/schema/README.md` (สัญญา SQLite — `electron/src/db/schema/ddl.js`
    103 ตารางเป็นของจริง, Dart 40 ตารางเป็น subset แท้),
    `src/sync-assets.mjs` (mirror asset ลง `flutter/assets/`, มี `--check`)
  - path ที่ต้องแก้จริงในโค้ด: `main.js` (dev data dir เป็น
    `__dirname/../tmp-user-data` — ถ้าไม่แก้ DB dev เดิมเหมือนหาย, icon 3 จุด
    ชี้ `../src/assets/brand/`, `loadFile` ใช้ `path.join(__dirname,…)` ให้ไม่
    ขึ้นกับ cwd), `ensure-electron.js` (`node_modules` อยู่ root → `../`),
    `scripts/finish-portable.mjs` (root ขึ้นอีกชั้น), `css/nav-hub.css` 34 จุด
    (`../Image/` → `../../src/assets/brand/`), renderer 4 ไฟล์ + `index.html`
    (`Image/` → `../src/assets/brand/`), `docs/mockups/*` 79 จุด
  - `package.json`: `main` → `electron/main.js`; `files`/`build.files` เหลือ
    `electron/**` (ตัด `test/`, `scripts/`) + `src/assets/brand/**` — tarball
    ลดจาก 9.3 MB เหลือ 3.0 MB เพราะเลิก ship asset ฝั่ง Flutter
  - checker/driver ทั้ง 4 ตัวอัปเดต prefix แล้ว: `check-arch.mjs` เพิ่ม
    `APP_DIR` + matcher ของ `build.files` ที่เข้าใจ glob/negation,
    `check.mjs` อ่านผ่าน `app()`, `web-driver.mjs` ชี้ `electron/*`
- ทำไม: เดิม root ปนกันหมด — ไฟล์ Electron นั่งระดับเดียวกับ `flutter_app/`,
  `supabase/`, `ds-bundle/` มองไม่ออกว่าอะไรเป็นของฝั่งไหน อะไรใช้ร่วมกัน
  ตอนนี้ชื่อโฟลเดอร์บอกได้เองว่าแก้ที่นี่แล้วกระทบใคร และ `src/` บังคับให้
  "ของกลาง" มีที่อยู่ชัดเจนแทนที่จะกระจายตามราก
  - `flutter/assets/` ยังต้องมีไฟล์จริง เพราะ `pubspec.yaml` อ้าง asset นอก
    package ตัวเองไม่ได้ — จึงใช้ `src/assets/` เป็นต้นฉบับแล้ว commit สำเนา
    ไว้ (git เก็บ blob เดียวเพราะเนื้อหาเหมือนกัน) `build-apk.yml` เรียก
    `--check` ก่อน `pub get` กันคนแก้ผิดฝั่ง
- ตรวจแล้ว: `check-arch.mjs` 0 error / `check.mjs` 0 error 56 warning (เท่า
  HEAD เดิมเป๊ะ ต่างแค่ข้อความ path — baseline ใน CLAUDE.md ที่เขียนไว้ 55
  นั้นเก่าไปหนึ่ง จึงแก้เป็น 56), `node --test 'electron/test/*.test.mjs'`
  ผ่าน 15/15, `npm install` (postinstall หา Electron เจอ), driver จริงใต้
  xvfb + web-driver บูตติดทั้งคู่ — screenshot ยืนยันว่า CSS/ธีม/ภาษาไทย/
  โลโก้จาก `src/assets/brand/` ขึ้นครบ, `npm pack --dry-run` เห็น
  `electron/**` + `src/assets/brand/**` ครบและไม่มี path เก่า
- Doc ที่อัปเดต: `CLAUDE.md` (Repo layout เขียนใหม่ + กฎ path),
  `README.md` (Project structure), `docs/FILES.md`, `docs/Architec.md`,
  `docs/SYSTEMS.md`, `docs/PLUGINS.md`, `docs/SYNC.md`, `docs/DRIVE.md`,
  `docs/UPDATE.md`, skill ทั้ง 5 ตัว, `.design-sync/`, `Install-Guide.txt`,
  `cmd-note.txt` — รายการเก่าใน CHANGELOG/procress.md ปล่อยไว้ตามเดิมเพราะ
  เป็นบันทึกของสภาพ ณ เวลานั้น

---

## 2026-08-09 — Newcomer customize: ตัด left panel, ย่อหน้าต่าง, ลิสต์ชื่อ module เทียบซ้าย-ขวา
- commit: uncommitted
- ไฟล์ที่แก้: `main.js` (ขนาดหน้าต่าง Welcome), `src/renderer/core/welcome.js`,
  `css/welcome.css`, `src/renderer/i18n.js` (`wzRecommended` ครบ 18 locale),
  `.claude/skills/run-dracondex/driver.mjs`
- อะไรเปลี่ยน:
  - หน้าต่าง Welcome/wizard ย่อจาก `940×620` เหลือ **`760×560`** (~ครึ่งหนึ่ง
    ของหน้าต่างแอพ `1280×800`), min เหลือ `640×480`; left panel ของหน้าเลือก
    vault แคบลงเป็น 220px ให้ได้สัดส่วน
  - wizard **ไม่มี left panel** อีกแล้ว (`body.welcome-wizard-mode`) —
    เป็นคอลัมน์เดียวจัดกึ่งกลาง ความคืบหน้าเป็นจุดใต้หัวข้อ คลิกย้อน step ได้
  - **ปุ่มข้ามรายขั้น**: ธีม / Layout / บัญชี ข้ามได้ (ใช้ค่า default ต่อ)
    ภาษากับชื่อ module ไม่มี เพราะตัดสินว่าทุก label ในแอพอ่านว่าอะไร
  - step **ชื่อ module** เปลี่ยนจากชิป 4 ตัว เป็น **สองลิสต์เทียบกัน ครบ 15
    kind สูง 5 แถว เลื่อนพร้อมกันสองฝั่ง** (`welcomeSyncNameScroll` เทียบ
    `scrollTop` ก่อนเขียน — รอบที่ event ย้อนกลับมาเห็นค่าเท่ากันแล้วจบเอง
    ไม่ต้องมี flag ที่ต้องรอ reset ข้าม frame) สองคอลัมน์ไล่จาก
    `Object.keys(KIND_CLASSIC_KEY)` ชุดเดียว แถวจึงหลุดตรงกันไม่ได้
  - step **ธีม** ครอบด้วยกล่องสูง 3 แถว (ย่อ `.ctm-preview.mini` เหลือ 56px
    เฉพาะใน wizard — ที่ 80px เดิม 3 แถวไม่พอดีหน้าต่างใหม่) ยังเลื่อนเห็นครบ 32
  - step **Layout** ติดป้าย "แนะนำ" ที่ Wyvern
  - ทุก step มีบรรทัดเตือนว่าแก้ทีหลังได้ที่ Setting (`.welcome-wizard-note`)
  - driver: `READY_SELECTOR` เพิ่ม `.welcome-wizard` — wizard ไม่เขียนอะไรลง
    `#left-panel-inner` แล้ว ตัวรอเดิมจึง timeout
- ทำไม: wizard รอบแรกยืมโครงสองคอลัมน์ของหน้า Welcome มาใช้ ทำให้ step list
  กินพื้นที่และดึงสายตาออกจากตัวเลือกจริง, หน้าต่างใหญ่เกินความจำเป็น, step ธีม
  ยาว 32 การ์ดต้องเลื่อนเยอะ, step ชื่อ module โชว์แค่ 4 kind เทียบไม่ครบ และ
  ทุก step บังคับให้กด "ถัดไป" อย่างเดียว ไม่มีทางบอกว่า "ไม่เลือก ใช้ default"
- Doc ที่อัปเดต: docs/SYSTEMS.md §Setup wizard, docs/FILES.md (core/welcome.js)

## 2026-08-09 — Setup wizard ครั้งแรกในหน้าต่าง Welcome (ภาษา/ธีม/Layout/ชื่อ module/ล็อกอิน)
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/core/welcome.js` (+~180 บรรทัด),
  `src/renderer/core/boot.js`, `src/renderer/core/state.js`,
  `src/renderer/core/setting-window.js` (`settingThemeGridCellHtml` รับ option
  `onclick`/`tools`), `css/welcome.css`, `src/renderer/i18n.js`
  (`wzTitle`/`wzIntro`/`wzAccountHint` ครบ 18 locale),
  `.claude/skills/run-dracondex/driver.mjs`
- อะไรเปลี่ยน:
  - DB ที่ยังไม่มี vault เลย → หน้าต่าง Welcome เปิดที่ **setup wizard 5 step**
    (ภาษา → ธีม → Layout → ชื่อ module → บัญชี) แทนรายการ vault เปล่า ๆ
    แถบซ้ายเป็น progress คลิกย้อน step ได้ + ปุ่มข้ามทั้งชุด
  - ทุก step ขับ `setUiSetting()`/`saveUiSettings()` ตัวเดียวกับ Setting
    window จึงไม่มี state ซ้อน และแก้ทีหลังที่ Setting ได้ตามปกติ
  - นำของเดิมมาใช้ซ้ำเกือบทั้งหมด: `LANGUAGE_LABELS` + `settingLangPreviewHtml`,
    `getThemePalettes` + `settingThemeGridCellHtml`, `workspaceStylePreviewHtml`,
    `KIND_LABEL`/`KIND_CLASSIC_KEY`, `api.drive.connect()/status()`
  - step Layout ไม่เรียก `applyWorkspaceStyleChoice()` (uiConfirm + reload)
    เพราะหน้าต่าง Welcome ไม่ได้ render chrome ของ workspace style อยู่แล้ว
  - **บั๊กที่เจอตอนขับแอพจริง**: ตั้ง `body.dataset.workspace` ในหน้าต่าง
    Welcome ทำให้กฎ wyvern/dragon ใน `css/workspace.css` ซ่อน `#left-panel`
    ซึ่งคือรายการ vault / ขั้นตอน wizard เอง → หน้าต่างเหลือคอลัมน์เดียว
    แก้โดยไม่แตะ attribute ตอนเลือก และปัก `drake` ไว้ใน boot branch ของ
    หน้าต่างนี้ (ค่า setting ที่บันทึกไม่ถูกแตะ หน้าต่างแอพยังเปิดตามที่เลือก)
  - driver: ready-selector เดิมรอเนื้อใน `#left-panel` ซึ่ง wyvern/dragon ซ่อน
    ทิ้ง ทำให้ `nextwindow` timeout เมื่อ vault ใช้ layout อื่น — เพิ่ม
    `.wyvern-breadcrumb` เข้าไปใน `READY_SELECTOR`
- ทำไม: ค่าที่กำหนดรูปลักษณ์ทั้งแอพถูกซ่อนใน Setting window ผู้ใช้ใหม่จึงได้
  ค่า default (ไทย + midnight + drake + unique) โดยไม่รู้ว่าเปลี่ยนได้ และ
  Google Drive ซึ่งเป็นทางเดียวที่มี backup ก็อยู่ลึกอีกชั้น
- Doc ที่อัปเดต: docs/SYSTEMS.md §Nexus vault, docs/FILES.md (core/welcome.js)

## 2026-08-09 — Welcome screen เป็นหน้าต่างของตัวเอง + เปิดทุกครั้งที่เปิดแอพ
- commit: uncommitted
- ไฟล์ที่แก้: `main.js` (`createWelcomeWindow`, `window:openWelcome`,
  `window:openNexusReplace`), `preload.js`, `index.html`,
  `src/renderer/core/welcome.js` (ใหม่), `css/welcome.css` (ใหม่),
  `src/renderer/core/nexus.js`, `src/renderer/core/boot.js`,
  `src/renderer/core/views.js`, `src/renderer/core/state.js`,
  `src/renderer/guide.js`, `src/renderer/i18n.js` (`wmRecent`/`wmChangeNexus`/
  `wmOpenNexus` ครบ 18 locale), `css/nav-hub.css`,
  `test/onboarding-tour.test.mjs`, `.claude/skills/run-dracondex/*`
- อะไรเปลี่ยน:
  - Welcome ไม่ใช่ modal ทับ picker อีกแล้ว แต่เป็น **หน้าต่าง Electron แยก**
    (`index.html?welcome=1`, `body.welcome-mode`) ที่ `app.whenReady` เปิดแทน
    หน้าต่างแอพ — ซ้ายเป็นรายการ Nexus ทั้งหมด ขวาเป็นการ์ด "ล่าสุด" 3 อัน
    พร้อมปุ่มสร้าง/นำเข้า
  - เลิก restore vault ที่ค้างไว้ตอน boot — `?nexus=<id>` เป็นทางเดียวที่
    หน้าต่างแอพจะได้ vault ทำให้เปิดแอพทุกครั้งเจอ Welcome เสมอ
  - dropdown บนชื่อ vault โชว์แค่ **3 อันล่าสุด** (จาก MRU ใน localStorage
    `NEXUS_RECENT_KEY`) แถวสุดท้าย "เปลี่ยน Nexus…" พาไปหน้าต่าง Welcome
    เหมือนปุ่ม ⇄ — `closeNexus()` ที่เคยพากลับไป picker ในhub ถูกถอดออก
  - ทัวร์แนะนำหลังสร้าง Nexus ย้ายไปเริ่มที่หน้าต่างใหม่ผ่าน
    `NEXUS_PENDING_GUIDE_KEY` (หน้าต่าง Welcome ปิดตัวเองก่อนทัวร์จะทันวิ่ง)
  - driver ได้คำสั่ง `nextwindow` และ web-driver ได้ `--query` เพราะ
    `app.firstWindow()` ตอนนี้คือหน้าต่าง Welcome ไม่ใช่หน้าต่างแอพ
- ทำไม: เดิม Welcome เป็น first-run gate โดยผลข้างเคียง (เงื่อนไขเดียวคือ
  `!S.nexuses.length`) ผู้ใช้ที่มี vault แล้วจึงไม่มีจุดเริ่มต้นสำหรับเลือก/
  สลับ vault และ picker ในhub ก็ซ้ำซ้อนกับ Welcome; แยกเป็นหน้าต่างเดียวจบ
  ทำให้มีทางเข้าเดียวและ dropdown ในแอพสั้นลงเหลือแค่ของที่ใช้จริง
- Doc ที่อัปเดต: docs/SYSTEMS.md §Nexus vault + §UI/UX pass,
  docs/FILES.md (core/welcome.js, core/nexus.js),
  .claude/skills/run-dracondex/SKILL.md

## 2026-08-09 — ปิด Cloud Sync (Supabase) เหลือสำรองข้อมูลผ่าน Google Drive OAuth อย่างเดียว
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/core/state.js` (`CLOUD_SYNC_ENABLED` ใหม่),
  `src/renderer/core/views.js`, `src/renderer/core/setting-window.js`,
  `src/renderer/core/account.js`, `src/renderer/drive.js`,
  `src/renderer/i18n.js` (คีย์ `driveDevServer` ครบ 18 locale),
  `README.md`, `supabase/README.md` (ใหม่), `docs/SYNC.md`, `docs/DRIVE.md`,
  `docs/SYSTEMS.md`, `docs/FILES.md`
- อะไรเปลี่ยน:
  - เพิ่มค่าคงที่ `CLOUD_SYNC_ENABLED = false` ใน `state.js` (ไฟล์แรกที่
    `index.html` โหลด) เป็นสวิตช์จุดเดียวของฟีเจอร์ Cloud Sync
  - ตัดทางเข้า UI 2 จุดที่เรียก Cloud Sync: ปุ่ม ☁ ใน vault-head
    (`views.js`) และหน้า Setting → App-data → Token Sync (ถอด `'tokensync'`
    ออกจาก `SETTING_GROUPS.appdata` ใน `setting-window.js`) — กลุ่ม App-data
    เหลือ 2 หน้า (ฐานข้อมูล, สำรองข้อมูล)
  - หน้า Setting → User → Account ย้ายจากการอ่าน login ของ Supabase
    (`api.sync.authStatus/status` + badge tier free/pro) มาอ่าน
    `api.drive.status()` แทน — 3 สถานะ: ยังไม่ตั้ง client id/secret →
    ลิงก์ไปหน้า BackupData, ตั้งแล้วยังไม่เชื่อมต่อ → ปุ่มเชื่อมต่อ Google
    Drive, เชื่อมต่อแล้ว → อีเมล + ปุ่มยกเลิกการเชื่อมต่อ; `quickAccountExtra`
    ในเมนูตั้งค่าด่วนก็ตามไปด้วย
  - ป้าย dev-mode ในหน้า BackupData เปลี่ยนจากคีย์ `syncDevServer`
    ("ไม่ต้องมี Supabase" — ข้อความของ sync-devserver) มาใช้คีย์ใหม่
    `driveDevServer` ที่พูดถึง mock Drive server ตรงตัว
  - **ไม่มีการลบโค้ด**: `src/db/sync.js`, `src/db/sync-devserver.js`,
    `src/renderer/sync.js`, IPC `sync:*`, `api.sync` และ migration ทั้ง 2
    ไฟล์ยังอยู่ครบและยังลงทะเบียนตามเดิม (ตรวจแล้วด้วย driver:
    `typeof window.api.sync.push === 'function'` และ `SETTING_PAGE_RENDERERS`
    ยังมี `appdata.tokensync`)
- ทำไม: repo เปิดเป็น open source แล้ว การบังคับให้ผู้ใช้/ผู้ fork ทุกคนต้อง
  ตั้ง Supabase project เอง (รัน migration 2 ไฟล์ + ตั้ง Google provider +
  กรอก URL/anon key) เป็นกำแพงที่ไม่คุ้ม ในเมื่อ Google Drive Backup ทำงานได้
  ครบและคุยกับ Google ตรง ๆ ไม่ต้องพึ่งเซิร์ฟเวอร์ของใคร เลือก "ซ่อน" แทน
  "ลบ" เพราะเปิดกลับได้ด้วยการแก้ค่าเดียว และเพราะ `src/db/sync.js` ยังเป็น
  ที่อยู่ของ snapshot engine ที่การส่งออก/นำเข้าไฟล์ Nexus/module
  (`src/db/db-transfer.js`, ระบบออฟไลน์) เรียกใช้อยู่จริง
- Doc ที่อัปเดต: `docs/SYNC.md` (หัวเอกสาร — สถานะปิดใช้ + วิธีเปิดกลับ +
  คำเตือนเรื่อง snapshot engine), `docs/DRIVE.md` (หัวเอกสาร + §2.1),
  `docs/SYSTEMS.md` §Cloud Sync / §Firebase Version Notice / §Setting window
  (Account, TokenSync), `docs/FILES.md` §Cloud Sync (+ ตารางไฟล์ที่แตะรอบนี้,
  แถว `core/account.js`, แถว `supabase/README.md`), `README.md` §Features,
  `supabase/README.md` (ใหม่)

## 2026-08-07 — GitHub Packages: เผยแพร่แพ็กเกจ npm `@ldktc/dracondex`
- commit: uncommitted
- ไฟล์ที่แก้: `.github/workflows/publish-package.yml` (ใหม่), `package.json`
  (`name`, `productName`, `files`, `publishConfig`), `package-lock.json`
  (ชื่อให้ตรงกัน), `ensure-electron.js` (postinstall), `README.md`
- อะไรเปลี่ยน:
  - เพิ่ม workflow **"Publish package (GitHub Packages)"** — ทำงานเองเมื่อมีการ
    publish GitHub release (และสั่งมือได้ พร้อมโหมด *dry run* ที่ pack อย่างเดียว)
    ขั้นตอน: `npm ci --ignore-scripts` → รัน regression test → เช็กว่า tag ของ
    release ตรงกับ `version` (ไม่ตรง = fail) → `npm pack` → `npm publish` ไปที่
    `https://npm.pkg.github.com` ถ้าเวอร์ชันนั้นถูก publish ไปแล้วจะ **ข้าม**
    แทนที่จะพังด้วย 409 ตอน re-run
  - `package.json`: เปลี่ยน `name` เป็น `@ldktc/dracondex` เพราะ GitHub Packages
    บังคับให้ scope ตรงกับเจ้าของ repo และ npm ไม่รับชื่อที่มีตัวพิมพ์ใหญ่ —
    พร้อมเพิ่ม `productName: "DraconDex"` ระดับบนสุดไว้ล็อกชื่อแอปฝั่ง Electron
    ไม่ให้เปลี่ยนตาม `name`, เพิ่ม `files` (tarball เหลือ ~3 MB / 164 ไฟล์ —
    ไม่มี `flutter_app/`, `docs/`, `test/`, `old_db_data/` ติดไปด้วย) และ
    `publishConfig.registry`
  - `ensure-electron.js`: hook `postinstall` เดิม **พังทั้ง install** เมื่อแพ็กเกจ
    ถูกติดตั้งเป็น dependency (`npm i @ldktc/dracondex`) เพราะ electron เป็น
    devDependency จึงไม่ถูกดึงมาด้วย แล้วสคริปต์หา `node_modules/electron/install.js`
    ไม่เจอ → throw + exit 1 ตอนนี้ถ้าไม่มีโฟลเดอร์ `node_modules/electron` เลย
    จะข้ามการตรวจและ exit 0 (`npm start` ยังรายงานเหมือนเดิมผ่าน `start.js`)
- ทำไม: repo มีแค่ release asset ฝั่ง Windows ยังไม่มีอะไรใน GitHub Packages —
  งานนี้ทำให้ publish ได้จริงและผูกกับ release เดิมโดยไม่ต้องทำมือ
- Doc ที่อัปเดต: `README.md` §Releases → หัวข้อย่อย "GitHub Packages (npm)"
  (รวมข้อจำกัดว่าแพ็กเกจ npm บน GitHub Packages ต้องใช้ token แม้เป็น public);
  `docs/FILES.md` ไม่กระทบ (ไม่ได้ครอบคลุมไฟล์ `.github/`)

## 2026-08-07 — i18n (v4.4.2): `COMMON_UI_TEXT` ครบ 18 locale + checker บังคับ parity
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/i18n.js` (`COMMON_UI_TEXT` 400 → 415 entry,
  เติม `it`/`nl`/`pl`/`uk`/`tr` ครบทุก entry),
  `.claude/skills/dracondex-module-style/check.mjs`
  (`parseCommonUiText()` + global check ใหม่), `docs/SYSTEMS.md` §11,
  `docs/FILES.md` (หัวข้อ i18n.js), `package.json` + `package-lock.json`
  (4.4.1 → 4.4.2)
- อะไรเปลี่ยน:
  - **บั๊กหลัก**: `it`/`nl`/`pl`/`uk`/`tr` เลือกได้ใน picker และมีครบใน
    ตาราง `L` (715 key) แต่ **ไม่มีใน `COMMON_UI_TEXT` เลยแม้แต่ entry เดียว**
    จาก 400 entry ผลคือ `tr()` และ `translateCommonUiText()` ตกกลับไปเป็น
    อังกฤษเงียบ ๆ ผู้ใช้ 5 ภาษานี้เห็น UI ครึ่งภาษาตัวเอง (ข้อความที่ผ่าน
    `t()`) ครึ่งอังกฤษ (ข้อความที่ผ่าน `tr()`) — ยืนยันสด: ก่อนแก้
    `t('settings')` = "Impostazioni" แต่ `tr('ยกเลิก')` = "Cancel"
    หลังแก้ = "Annulla" เติมครบแล้ว 400 entry × 5 locale = 2,000 ข้อความ
  - **เก็บตกจาก SYSTEMS.md §11 ข้อ 3**: กวาด `src/renderer/navigator/` +
    `sage.js` หาข้อความที่เรนเดอร์เป็น literal แต่ไม่มีคีย์ใน dictionary
    เจอ 15 จุด (เช่น `"No timelines yet on this map."` ซึ่งเป็นคนละสตริงกับ
    `"No timelines yet."` ที่มีอยู่ — dictionary จับแบบ exact-match)
    เพิ่มเป็น entry ใหม่ครบ 18 locale ทั้งหมด ของเดิมสองข้อในรายงานนั้น
    (`"No novels linked"` และ Sage `"N รายการ total"`) ตรวจแล้วไม่ใช่บั๊ก —
    อันแรกแปลได้อยู่แล้ว อันหลังไม่มีในโค้ดแล้ว
  - `'Note'` / `'+ Add'` ที่ `origcat.js` เรนเดอร์เป็นอังกฤษ ใช้ค่าแปลจาก
    entry คีย์ไทยตัวเดิม (`'หมายเหตุ'`/`'+ เพิ่ม'`) ตรง ๆ ไม่แปลใหม่ซ้อน
    เพื่อไม่ให้สองชุดค่อย ๆ เพี้ยนออกจากกัน
  - **กันหลุดซ้ำ**: `check.mjs` เพิ่ม `parseCommonUiText()` + global check
    "i18n parity (COMMON_UI_TEXT fallback dict)" — locale ที่ขาดขึ้นเป็น
    **ERROR** ระดับเดียวกับ `t()` key ที่หาย เดิม checker ตรวจแค่ตาราง `L`
    ช่องโหว่นี้จึงมองไม่เห็นมาตลอด กฎที่ใช้: คีย์ของ entry คือข้อความต้นทาง
    อยู่แล้ว → locale ของภาษานั้นไม่ต้องมีฟิลด์ (คีย์ไทยไม่ต้องมี `th:`,
    คีย์อังกฤษไม่ต้องมี `en:`) ที่เหลือต้องครบ
- ทำไม: ภาษาที่ปล่อยให้เลือกได้ควรแปลจริงทั้งแอป ไม่ใช่ครึ่งเดียว และ
  ช่องโหว่นี้เงียบสนิท (ไม่ error, ไม่ warning) จนกว่าจะมีคนใช้ภาษานั้นจริง
  จึงต้องมี checker บังคับ ไม่ใช่แค่เติมข้อมูลรอบเดียวแล้วจบ
- ตรวจแล้ว: `node --test 'test/*.test.mjs'` 15/15 ผ่าน, check-arch 0 error,
  style sweep 0 error / 56 warning (เท่าเดิม ไม่มี warning ใหม่),
  และรันแอปจริงผ่าน `run-dracondex` web-driver — บูตเป็นภาษาอิตาลีทั้งแอป
  (`"Benvenuto in DraconDex"`, Hub = `"NIDO DEL NEXUS"`), `tr()` คืนค่าถูกทั้ง
  5 ภาษาใหม่, และ `translateCommonUiText()` แปล DOM node จริงได้ถูกต้อง
- Doc ที่อัปเดต: docs/SYSTEMS.md §11, docs/FILES.md (i18n.js)

## 2026-08-07 — CI: build ทั้ง 3 แบบของ Electron แล้วปล่อยเป็น GitHub Releases
- commit: uncommitted
- ไฟล์ที่แก้: `.github/workflows/build-electron.yml` (ใหม่), `package.json`
  (สคริปต์ build + `build.portable.artifactName`), `README.md`
- อะไรเปลี่ยน:
  - **workflow ใหม่ "Build Electron (Windows)"** รันบน `windows-latest`
    สร้าง build ครบทั้ง 3 แบบในงานเดียว แล้วอัปโหลดเป็น asset ของ
    GitHub Release:
    - `build:installer` → `DraconDex-Setup-<version>.exe`
    - `build:exe` → `DraconDex-Portable-<version>.exe`
    - `build:portable` → บีบโฟลเดอร์เป็น `DraconDex-<version>-win-x64.zip`
    - บวก `checksums-sha256.txt` (SHA-256 ของทั้งสามไฟล์)
  - **ลำดับ build สำคัญ** — `build:portable` เปลี่ยนชื่อ
    `DraconDexPortable/win-unpacked` เป็น `DraconDex-<version>` ผ่าน
    `scripts/finish-portable.mjs` จึงต้องรัน **หลัง** target อื่นที่ยัง
    สร้าง `win-unpacked` เป็นของกลางทาง ไม่งั้นโฟลเดอร์จะถูกเขียนทับ
  - **ทริกเกอร์** — push tag `v*` = ปล่อย release จริง (โน้ตอัตโนมัติจาก
    `--generate-notes`), `workflow_dispatch` = ปล่อยได้เหมือนกันแต่ default
    เป็น draft และรับ tag/prerelease เป็น input, ส่วน pull request ที่แตะ
    ไฟล์แอป/บิลด์จะ build + อัปโหลดเป็น workflow artifact เฉย ๆ ไม่ปล่อย
    release
  - **`artifactName` ของ target `portable`** ถูกกำหนดเป็น
    `DraconDex-Portable-${version}.${ext}` (เดิมใช้ default ที่มีช่องว่างใน
    ชื่อไฟล์ — `DraconDex 4.4.0.exe`) ให้ชื่อ asset สม่ำเสมอกับตัว installer
  - **สคริปต์ build ทั้งสามตัวใส่ `--publish never`** — กันไม่ให้
    electron-builder เดาว่าจะ publish เองเมื่อเจอ tag + token บน CI การ
    ปล่อย release เป็นหน้าที่ของ step `gh release` step เดียวเท่านั้น (และ
    มีแค่ step นั้นที่ได้ `GH_TOKEN`)
- ทำไม: เดิมมี workflow เฉพาะฝั่ง Flutter (`build-apk.yml`) ส่วนฝั่ง Electron
  ต้อง build เองบนเครื่อง Windows ทุกครั้ง ทำให้ไม่มีไฟล์ให้ผู้ใช้ดาวน์โหลด
  จากหน้า Releases เลย
- Doc ที่อัปเดต: `README.md` §Building → หัวข้อย่อย "Releases" (ตาราง asset
  + วิธี tag เพื่อปล่อยเวอร์ชัน); ไม่กระทบ `docs/SYSTEMS.md` / `docs/FILES.md`
  เพราะไม่ได้แตะโค้ดแอป

## 2026-08-07 — Security audit หลัง repo เปิด public: ปิดช่อง CDN, บังคับ OAuth state, เพิ่ม LICENSE
- commit: uncommitted
- ไฟล์ที่แก้: `package.json` (build.files + `vendor/**/*`, เพิ่ม
  `license`/`author`/`repository`), `LICENSE` (ใหม่, MIT),
  `src/renderer/relation.js` + `src/renderer/core/views.js` (ตัด CDN fallback),
  `src/db/oauth-loopback.js` (`makeState`, ตรวจ `state` บน callback),
  `src/db/drive.js`, `src/db/plugin.js` (ส่ง+บังคับ `state`),
  `src/db/sync.js` (คอมเมนต์อธิบายว่าทำไมไม่ใส่ `state`),
  `src/db/update.js` (โน้ตสำหรับคนที่ fork), `.gitignore`,
  เลิก track `.idea/` และ gitlink กำพร้า `.flutter_sdk/flutter`
- อะไรเปลี่ยน:
  - **CDN fallback ถูกตัดออก** — `build.files` ไม่เคยมี `vendor/**` แปลว่าใน
    build ที่แพ็กแล้ว `vendor/d3.min.js` หาย → `onerror` ยิง → โหลด D3/Konva
    จาก unpkg โดยไม่มี SRI เข้ามาใน renderer หลักที่ถือ `window.api` ทั้งชุด
    ตอนนี้ `vendor/**/*` อยู่ใน `build.files` แล้ว และ loader โหลดเฉพาะไฟล์
    ในเครื่อง
  - **`state` ถูกตรวจจริง** — เดิม `plugin.js` สร้าง nonce แล้วส่งไป แต่
    `runOAuthLoopback` อ่านแค่ `code`/`error` ไม่เคยเทียบกลับ ตอนนี้
    `runOAuthLoopback` รับ `state` แล้ว reject เป็น `state_mismatch`
    ใส่ให้ `drive.js` (Google echo `state` กลับตาม RFC 6749) และ `plugin.js`
    **ไม่ใส่ให้ `sync.js`** เพราะ GoTrue `/auth/v1/authorize` ไม่ส่ง custom
    state กลับ — ใส่แล้ว login จะพังทุกครั้ง (มีคอมเมนต์อธิบายไว้ในไฟล์)
  - **เพิ่ม LICENSE (MIT)** — ก่อนหน้านี้ไม่มี license เลย แปลว่าตามกฎหมาย
    ไม่มีใคร fork/redistribute ได้ ทั้งที่ repo เปิด public แล้ว
  - `.gitignore` เพิ่มกฎ `*.db` / `-wal` / `-shm` / `.env` / คีย์ / `.idea/`
  - `.flutter_sdk/flutter` เป็น gitlink (mode 160000) ที่ไม่มี `.gitmodules`
    → clone แล้วได้โฟลเดอร์ว่างและ submodule update พัง; CI ใช้
    `subosito/flutter-action` อยู่แล้ว ไม่มีอะไรอ้างถึงมัน จึงเอาออก
- ทำไม: repo เปิด public แล้ว ตรวจทั้ง working tree และ history ทั้ง 63 commit
  **ไม่พบ secret จริงหลุดเลย** (credential ทุกตัวผู้ใช้กรอกเองตอน runtime เก็บใน
  `app_setting` ไม่เคยอยู่ใน source) แต่พบปัญหาอื่นตามข้างบน
- ค้างไว้ (แยก PR): ฐานข้อมูลนิยายจริง `old_db_data/*.db` ยังอยู่ใน history
  ตั้งแต่ `5ed92c7` ต้อง `git filter-repo` + force-push `main` แยกต่างหาก
- Doc ที่อัปเดต: docs/CHANGELOG.md (รายการนี้)

---

## 2026-08-06 — permissions.net (v4.4.0): อนุญาต http:// บน loopback ที่ระบุ port
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/plugin-manifest.js` (`normalizeNetOrigin`,
  `netOriginAllowed` เพิ่ม `isLoopbackOrigin`/`netSchemeAllowed`),
  `test/plugin-url.test.mjs` (2 เทสต์ใหม่: manifest + runtime),
  `docs/PLUGINS.md` §1.6, §2.4, `docs/SYSTEMS.md` §Plugins,
  `package.json` (4.3.0 → 4.4.0)
- อะไรเปลี่ยน:
  - `permissions.net` เดิมรับเฉพาะ origin `https://` ล้วน ๆ ตอนนี้รับ `http://`
    ได้เพิ่มหนึ่งกรณี: host เป็น `localhost`/`127.0.0.1`/`[::1]` **และมี port
    ระบุชัดเจน** เท่านั้น — `http://localhost` (ไม่มี port) ยังไม่ผ่าน เพราะ
    เท่ากับขอสิทธิ์ port 80 ทั้งพอร์ต ไม่ใช่ service เดียวที่ตั้งใจประกาศ
  - ตรวจ 2 จุดเหมือนเดิม (install-time ใน `normalizeNetOrigin`, runtime ใน
    `netOriginAllowed`) เพราะ `netOriginAllowed` re-validate จาก
    `manifest_json` ทุกครั้ง ไม่เชื่อว่าแถวที่เก็บไว้เคยผ่าน rule ปัจจุบันแล้ว
  - host อื่นที่ไม่ใช่ loopback ยังถูกปฏิเสธเหมือนเดิมทุกกรณี (ยังคง downgrade
    เป็น plaintext + เปิดช่อง SSRF เข้า LAN ถ้าอนุญาต) — ข้อยกเว้นนี้แคบมาก
    โดยตั้งใจ
  - ปลั๊กอินที่ต้องใช้ข้อยกเว้นนี้ตัวแรกคือ DraconDex-Plugin-Ollama ซึ่งประกาศ
    `http://localhost:11434` และ `http://127.0.0.1:11434` — Ollama ไม่มี https
    ให้ใช้เพราะรันบนเครื่องผู้ใช้เอง
- ทำไม: manifest เดิมปฏิเสธ `http://localhost:11434` ตั้งแต่ตอนติดตั้ง ทำให้
  ปลั๊กอินที่คุยกับ local model server (Ollama ฯลฯ) ใช้ `permissions.net` ไม่ได้
  เลยแม้แต่กรณีเดียว ทางเลือกที่เหลือ (หน้าปลั๊กอินยิง `fetch()` เอง) ก็ติด CORS
  เพราะหน้า `file://` ส่ง `Origin: null` ซึ่งไม่อยู่ใน allowlist ดีฟอลต์ของ
  Ollama — loopback เป็นกรณีเดียวที่ปลอดภัยพอจะอนุญาต plaintext เพราะ byte
  ไม่ออกนอกเครื่องเลย
- Doc ที่อัปเดต: `docs/PLUGINS.md` §1.6 (กติกา manifest), §2.4 (โจทย์เดียวกับ
  ที่ `pluginApi.net.*` มีอยู่แล้ว — นี่คือการเพิ่มสิทธิ์จริง ไม่ใช่แค่ความสะดวก),
  `docs/SYSTEMS.md` §Plugins

---

## 2026-08-06 — Plugin Panel API (v4.3.0): ปลั๊กอินฝังหน้าตัวเองแทน Module Inspector ได้
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/plugin-manifest.js` (ฟิลด์ `panels`/`permissions` +
  `manifestPanels`/`manifestNetOrigins`/`manifestContextKinds`/`netOriginAllowed`),
  `src/db/plugin.js` (`pluginList` คืน `dir`/`panels`/`netOrigins`/`contextKinds`,
  `pluginPreview` คืน 3 ฟิลด์ใหม่, `pluginByPanelPath`, `pluginNetAllowed`,
  `pluginNetFetch`, `pluginNetStream`, `pluginOAuthAuthorize`),
  `main.js` (`webviewTag:true` + `hardenWebviewAttach`, `pluginPanelContents`,
  `callerPluginId` หา 2 ทาง, `pluginapi:net:fetch`,
  `pluginapi:net:stream:start`/`:abort`, `pluginapi:oauth:authorize`),
  `preload-plugin.js` (`net`/`oauth`/`panel`), `src/renderer/pluginpanel.js` (ใหม่),
  `src/renderer/inspector.js` (guard), `src/renderer/builder.js` (ปุ่มใน pane head),
  `src/renderer/core/state.js` (`pluginPanels`/`pluginPanel`),
  `src/renderer/core/views.js` (mount hook), `src/renderer/core/boot.js` (โหลดตอน init),
  `src/renderer/hub/open.js` (ปิด panel เมื่อสลับโมดูล),
  `src/renderer/plugin.js` (พรีวิวโชว์ panels/net + refresh contributions),
  `index.html`, `css/builder.css` (`.plugin-panel`), `src/renderer/i18n.js` (5 คีย์ × 18 locale),
  `test/plugin-url.test.mjs` (5 เทสต์ใหม่), `package.json` (4.2.0 → 4.3.0)
- อะไรเปลี่ยน:
  - ปลั๊กอินประกาศ `panels[]` ใน manifest ได้ → ได้ปุ่มข้างปุ่ม toggle Module
    Inspector (แสดงเฉพาะตอนเปิดโมดูล) กดแล้วหน้าปลั๊กอินเข้าแทน inspector dock
    ผ่าน `<webview>` ที่ยังได้ `preload-plugin.js` และไม่มี `window.api`
  - ปลั๊กอินประกาศ `permissions.net` (origin `https://` ล้วน) แล้วเรียก
    `pluginApi.net.fetch/stream` ให้ main process ยิงแทนได้ — อ่าน response ข้าม
    origin ได้ ซึ่งเป็นการเพิ่ม capability จริง จึงบังคับ allowlist + โชว์ในพรีวิว
  - `pluginApi.oauth.authorize` ใช้ `src/db/oauth-loopback.js` ตัวเดิมที่ Drive/
    Supabase ใช้อยู่ ทำ PKCE + ดัก redirect ให้ ปลั๊กอินแลก token เอง
  - **ไม่มี DB migration** — `manifest_json` เก็บ manifest ทั้งก้อนอยู่แล้ว จึง
    อ่านฟิลด์ใหม่กลับออกมาได้เลย และปลั๊กอินเก่าไม่ต้องแก้อะไร
- ทำไม: ผู้ใช้ต้องการปลั๊กอินแชทที่เปิดแทน Module Inspector แต่ runtime เดิม
  เปิดปลั๊กอินได้ทางเดียวคือหน้าต่างแยกและไม่มีทางแทรก UI เข้าหน้าต่างหลักเลย
  จึงทำเป็นจุดต่อขยายกลางที่ปลั๊กอินตัวไหนก็ใช้ได้ แทนที่จะฮาร์ดโค้ดให้ตัวเดียว
- Doc ที่อัปเดต: `docs/PLUGINS.md` §1.5–1.7 (ใหม่) + §2.4 (ความซื่อสัตย์เรื่อง
  `net.*` และ credential plaintext), `docs/SYSTEMS.md` §Plugins, `docs/FILES.md` §Plugins

---

## 2026-08-06 — Extension → Plugin ทั้งระบบ + ติดตั้งจากลิงก์ `.git` ลิงก์เดียว
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/plugin-manifest.js` (ใหม่ — logic ล้วนๆ ไม่พึ่ง electron:
  `validateManifest`/`parseRepoUrl`/`rawUrl` + regex whitelist ทั้งชุด),
  `test/plugin-url.test.mjs` (ใหม่), `src/db/extension.js` →
  `src/db/plugin.js` (เพิ่ม `resolveRepo`/`pluginPreview`,
  `pluginInstall(url)` รับ URL ตัวเดียว, `migratePluginDir()`),
  `src/renderer/extension.js` → `src/renderer/plugin.js` (UI ช่อง URL
  ช่องเดียว + การ์ดพรีวิว), `preload-ext.js` → `preload-plugin.js`
  (`window.pluginApi` + alias `window.extApi`), `docs/EXTENSIONS.md` →
  `docs/PLUGINS.md`, `main.js` (`createPluginWindow`/`pluginWindows`,
  `plugin:*` + `plugin:preview`, `pluginapi:table:*`, เรียก
  `migratePluginDir()` ที่ `whenReady`), `preload.js` (namespace `plugin`),
  `database.js`, `index.html`, `package.json` (`build.files`),
  `css/builder.css` (`.plugin-preview*`), `src/db/schema/ddl.js` (ตาราง
  `plugin`/`plugin_table` + คอลัมน์ `repo_host`),
  `src/db/schema/migrations.js` (`migratePluginV42`),
  `src/db/schema/init.js` (เรียก migration ก่อน DDL + ใส่ใน `schemaStamp`),
  `src/renderer/core/setting-window.js`, `src/renderer/i18n.js` (18 locale)
- อะไรเปลี่ยน:
  1. **เปลี่ยนชื่อทั้งระบบ extension → plugin** ลงลึกถึงชั้น DB และดิสก์ —
     ไฟล์/ฟังก์ชัน/IPC (`plugin:*`, `pluginapi:table:*`)/ตาราง
     (`extension`→`plugin`, `ext_key`→`plugin_key`,
     `extension_table`→`plugin_table`, `extension_ref`→`plugin_ref`,
     `ext_<id>_<name>`→`plg_<id>_<name>`)/โฟลเดอร์
     (`extensions/`→`plugins/`)/i18n ครบ 18 locale. migrate อัตโนมัติและ
     idempotent ทั้ง DB (`migratePluginV42`) และดิสก์ (`migratePluginDir`)
     ของเดิมยังใช้ได้: `window.extApi` เป็น alias และ
     `dracondex-extension.json` เป็นชื่อ manifest สำรอง
  2. **ติดตั้งจากลิงก์ `.git` ลิงก์เดียว** แทนฟอร์ม 3 ช่อง (owner/repo/ref)
     — `parseRepoUrl` รับ https/ssh/scp/ไม่มี scheme/`owner/repo` ย่อ/
     `/tree/<branch>`/GitLab nested group; ไม่ระบุ branch ก็ลอง
     `main`→`master` ให้เอง; รองรับ github.com + gitlab.com
  3. **พรีวิวก่อนยืนยัน** — วางลิงก์แล้วดึง manifest มาแสดงอัตโนมัติ
     (debounce 400ms) ว่าจะติดตั้งไฟล์อะไรและสร้างตารางอะไรบ้าง โดยไม่แตะ
     ดิสก์/DB เลย; ตอนกดยืนยัน `pluginInstall(url)` resolve + validate ใหม่
     ทั้งหมดเอง ไม่เชื่อค่าจากพรีวิว
  4. **แก้บั๊ก** ปุ่ม Launch/Stop สลับผิดทุกแถว —
     `extensionBodyHtml(list, running)` ถูกประกาศเป็น `(list)` แล้ว
     `list.map(extensionRowHtml)` ส่ง **index** เข้าไปเป็น `isRunning`
  5. คอลัมน์ใหม่ `plugin.repo_host` เก็บว่ามาจาก github หรือ gitlab
- ทำไม: ชื่อเดิมไม่ตรงกับสิ่งที่มันเป็น (เอกสารของตัวเองยังเรียกว่า "Sandboxed
  Plugin Runtime" อยู่แล้ว) และการติดตั้งเดิมบังคับให้ผู้ใช้แกะลิงก์ GitHub
  เป็น owner/repo/branch ด้วยตัวเองก่อน ทั้งที่สิ่งที่ผู้ใช้มีอยู่ในมือคือ
  ลิงก์ repo ลิงก์เดียว
- Doc ที่อัปเดต: `docs/PLUGINS.md` (เขียนใหม่ทั้งฉบับ + §2.3b พรีวิวไม่ใช่
  trust boundary + §2.6 ตารางการเปลี่ยนชื่อ v4.1→v4.2),
  `docs/SYSTEMS.md` §Plugins + §Setting Window, `docs/FILES.md` §Plugins

---

## 2026-07-31 — Part 2 v4.1.0 (จบรอบ): Workspace Styles — Dragon + Setting page, ครบทั้ง 3 style
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/dragon.js` (ใหม่ — ทั้งฟีเจอร์ Dragon),
  `src/renderer/core/workspace-style.js` (ใหม่ — Setting window → Workspace
  → หน้า "Workspace Style"), `css/workspace.css` (เพิ่ม
  `body[data-workspace="dragon"]`/`.dragon-board`/`.dragon-card`/`.wsp-*`),
  `index.html` (script tag `dragon.js`/`workspace-style.js` ใหม่),
  `src/renderer/core/state.js` (`S.dragonBrowsePath`/
  `S.settingPendingWorkspace` ใหม่, `loadUiSettings()` เพิ่ม `dragonLayout`),
  `src/renderer/core/views.js` (`renderNexusHome()` เพิ่ม branch
  `workspaceStyle==='dragon'`, `runBuilderMounts()` เรียก
  `mountDragonBoard()`), `src/renderer/builder.js` (3 guard เดิมที่เช็กแค่
  `==='wyvern'` ขยายเป็น `!=='drake'` ให้ Dragon ได้ no-tab/no-split/no-
  drag-split แบบเดียวกันโดยไม่ก็อปโค้ดซ้ำ), `src/renderer/hub/menus.js`
  (guard "เปิดใน pane ใหม่" ขยายแบบเดียวกัน), `src/renderer/core/
  setting-window.js` (`SETTING_GROUPS.workspace` เพิ่ม `'style'`),
  `src/renderer/hub/kinds.js`/`src/renderer/core/nexus.js` (clear
  `S.dragonBrowsePath` ทุกจุดที่ clear `wyvernBrowsePath` อยู่แล้ว),
  `src/renderer/i18n.js` (คีย์ใหม่ `settingPageWorkspaceStyle`/
  `workspaceStyleDrakeDesc`/`workspaceStyleWyvernDesc`/
  `workspaceStyleDragonDesc`/`settingWorkspaceApply`/
  `settingWorkspaceApplyConfirm` ครบ 18 locale), `Plan.md` (ติ๊ก 3 checkbox
  ที่เหลือของ #New Workspace ทั้งหมด)
- อะไรเปลี่ยน: เพิ่ม **Dragon** — workspace style ที่ 3 (expert/sandbox,
  ทิศทางที่ตกลงกับผู้ใช้คือ "freeform spatial canvas") คงปุ่มเครื่องมือ
  nav-sidebar ปกติไว้ (ต่างจาก Wyvern ที่ซ่อนหมด) แต่แทน left-panel Nest
  tree + split-pane Builder ด้วยบอร์ดที่ลากจัดวางการ์ด module ได้อิสระ —
  ตำแหน่งเก็บ client-only ใน `S.settings.dragonLayout` (ตัดสินใจไม่ทำ DB
  table ใหม่แบบ `designer_node` เพราะไม่มีใครขอ sync ข้ามเครื่อง) ใช้กลไก
  drill-down เดียวกับ Wyvern (`S.dragonBrowsePath`) สำหรับเจาะเข้า module
  kind `collector` ที่ไม่มีหน้า detail ของตัวเอง แต่ render แต่ละระดับเป็น
  บอร์ดลากอิสระแทน grid ตายตัว ไม่มี edge ให้ผู้ใช้ลากวาดเอง (ความสัมพันธ์
  parent/child มาจาก module tree อยู่แล้ว) เพิ่มหน้า Setting window ใหม่
  "Workspace Style" (3 mockup card วาดด้วย CSS ไม่ใช้รูป, เลือกแล้วต้องกด
  "Apply & Restart" เพราะสลับ chrome ต้องรีบูตหน้า ไม่ใช่ apply สดแบบ
  theme/language) — ทำให้ทั้ง 3 style (Drake/Wyvern/Dragon) เลือกได้จริงเป็น
  ครั้งแรก ก่อนหน้านี้มีแค่ query param `?workspace=` เท่านั้น
- ทำไม: Plan.md ส่วน `### part 2 version.4.1.0 #### New Workspace` — Wyvern
  เสร็จไปแล้วรอบก่อน เหลือ Drake ให้เลือกได้จริง/Dragon/หน้า Setting
  "workspace" ที่ยังไม่ทำ รอบนี้ปิดครบทั้ง 3 checkbox ที่เหลือ
- Doc ที่อัปเดต: docs/SYSTEMS.md §Workspace Styles (ขยายเป็น Wyvern/Drake/
  Dragon ครบ 3 style), docs/FILES.md §Workspace Styles (ตารางไฟล์ใหม่ +
  ไฟล์เดิมที่แตะ)

## 2026-07-31 — Part 2 v4.1.0 (เริ่มแรก): Workspace Styles — Wyvern
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/wyvern.js` (ใหม่), `css/workspace.css` (ใหม่),
  `index.html` (splash script อ่าน `?workspace=`, `#workspace-toolbar` div,
  script/link tag ใหม่), `src/renderer/core/state.js`
  (`WORKSPACE_STYLE_OPTIONS`, `loadUiSettings()` เพิ่ม `workspaceStyle`/
  `wyvernToolbarOrientation`, `S.wyvernBrowsePath`/`S.importDockPage` ใหม่),
  `src/renderer/core/boot.js` (`applyWorkspaceStyle()` ใหม่), `src/renderer/
  core/views.js` (`renderNexusHome()` branch ใหม่, `buildBuilderPageHtml()`
  เพิ่ม `importDockPage`), `src/renderer/builder.js` (`builderNavigate()`/
  `builderPaneHeadHtml()`/`onBodyDrop()` เพิ่ม guard เฉพาะ Wyvern),
  `src/renderer/hub/menus.js` (ซ่อน "เปิดใน pane ใหม่" ใน Wyvern),
  `src/renderer/hub/sections.js` (`goToImportDockPage()`/
  `buildImportDockPageHtml()` ใหม่), `src/renderer/hub/kinds.js`,
  `src/renderer/hub/open.js`, `src/renderer/core/nexus.js`, `src/renderer/
  mod/{fileviewer,item,sagehut}.js` (clear `S.importDockPage` ที่จุดเดิม),
  `src/renderer/i18n.js` (คีย์ `wyvernViewSet` ใหม่ครบ 18 locale), `Plan.md`
  (ติ๊ก "Standard workspace: Wyvern")
- อะไรเปลี่ยน: เพิ่ม workspace style ใหม่ **Wyvern** (newcomer/simple —
  toolbar แนวตั้ง + drill-down browsing แทน left-panel tree, ไม่มี split
  pane, ไม่ auto-tab) เลือกได้ผ่าน `S.settings.workspaceStyle`/`?workspace=`
  — ยังไม่มี UI จริงให้กด (รอ Setting window "workspace" page รอบถัดไป)
  Drake (ค่าเริ่มต้น) ยืนยันแล้วว่าไม่มี regression จากการเพิ่ม guard นี้
- ทำไม: Plan.md ส่วน `### part 2 version.4.1.0 #### New Workspace` — 1 ใน 3
  workspace style ที่ต้องการ, สเปกจาก `featureplan.md` ที่เขียนไว้ก่อนหน้า
- Doc ที่อัปเดต: docs/SYSTEMS.md §Workspace Styles — Wyvern (ใหม่),
  docs/FILES.md §Workspace Styles (ใหม่)

## 2026-07-30 — Part 1 v4.0.0: Setting (Quick Setting popup + Setting window เต็มรูปแบบ)
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/core/settings.js` (ตัด `renderSettingsMenu()`
  เหลือ 4 อย่าง, ลบ `PREFS_SECTIONS`/`openPreferencesPanel`/`prefsBodyHtml`/
  theme-grid/language-preview/ui-size-advanced ทั้งหมด), `src/renderer/core/
  setting-window.js` (ใหม่ — เชลล์ Setting window 2 ชั้น + หน้า
  Theme/Text&Size), `src/renderer/core/tool-toggle.js` (ใหม่ — หน้า Tool
  toggle + `applyNavToggles()`), `src/renderer/core/account.js` (ใหม่ — หน้า
  Account/User profile), `src/renderer/core/db-transfer.js` (ใหม่ — หน้า
  Database), `src/db/db-transfer.js` (ใหม่ — export/import ระดับ
  nexus/module), `src/db/sync.js` (`serializeVault` เพิ่ม param `moduleIds`,
  `collectModuleSubtreeIds` ใหม่, แยก `applySnapshotCore` ออกจาก
  `applySnapshot` แล้วเพิ่ม `importModuleSnapshot` ใหม่), `src/db/drive.js`
  (layout-slot ops ใหม่ 4 ตัว + `driveGetBackupLog()`), `src/renderer/
  drive.js` (`prefsBackupSectionHtml`→`settingBackupPageHtml` + ประวัติการ
  สำรองข้อมูล), `src/renderer/extension.js`
  (`prefsExtensionSectionHtml`→`settingExtensionPageHtml` + ปุ่ม Stop + หน้า
  Extension setting), `src/renderer/sync.js` (`settingTokenSyncPageHtml`
  ใหม่), `src/renderer/core/state.js` (`loadUiSettings()` เพิ่ม default
  `quickExtras`/`navToggles`/`statusToggles`), `src/renderer/core/boot.js`
  (`applyNavToggles()`/`applyAreaScales()`), `src/renderer/core/router.js`
  (`updateStatusBar()` gate ด้วย `statusToggles`), `main.js`/`preload.js`
  (`db:export/importNexusFile`/`export/importModuleFile`,
  `drive:listLayoutSlots`/`saveLayoutSlot`/`restoreLayoutSlot`/
  `deleteLayoutSlot`/`getBackupLog`), `database.js`, `index.html` (script tag
  4 ไฟล์ใหม่), `css/nav-hub.css` (`.tool-toggle-hidden`), `css/
  components.css` (`.setting-shell`/`.setting-sidebar`/`.setting-nav-*`),
  `src/renderer/i18n.js` (คีย์ `setting*` ใหม่ 51 คีย์ครบ 18 locale),
  `test/module-transfer.test.mjs` (ใหม่), `Plan.md` (ติ๊ก checkbox หมวด
  Setting ทั้งหมด)
- อะไรเปลี่ยน: Quick Setting popup ตัดเหลือแค่ 4 อย่างตาม Plan.md (ภาษา/
  name-mode/ขนาด UI/ปุ่มเปิดการตั้งค่า) แทนที่ Preferences panel เดิมด้วย
  Setting window เต็มรูปแบบ 2 ชั้น (Workspace/User/Appdata/Extension × หน้า
  ย่อย) — Tool toggle คุมว่าอะไรโชว์กลับมาที่ popup/nav sidebar/status bar
  ได้ Account/User profile ใหม่ (layout slot หลายอันเก็บใน Drive appdata
  แยกไฟล์จาก auto-backup) Database ใหม่ (export/import ทั้งระดับ nexus และ
  ระดับ module เดี่ยว reuse snapshot format จาก Token Sync)
- ทำไม: Plan.md ส่วน `#### Setting` (Part 1 v4.0.0) — Cloud Sync Function
  เสร็จแล้วก่อนหน้านี้ Setting เป็นรายการถัดไปที่ยังไม่ทำ
- Doc ที่อัปเดต: docs/SYSTEMS.md §Setting Window (ใหม่) + แก้อ้างอิง
  Preferences panel เดิมในหัวข้อ Google Drive Backup, docs/FILES.md
  §Setting Window (ใหม่) + แก้แถว `sync.js`/`drive.js` + แก้ "ไฟล์เดิมที่แตะ"
  ของ Drive/Extension, docs/DRIVE.md (§1.3b layout slot ใหม่, §2.5 แก้),
  docs/EXTENSIONS.md (§1.2 ปุ่ม Stop, §1.2b Extension setting ใหม่)

## 2026-07-30 — Part 1 v4.0.0: Cloud Sync Function — Github (sandboxed extensions)
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/extension.js` (ใหม่), `preload-ext.js` (ใหม่, repo root),
  `src/db/schema/ddl.js` (ตาราง `extension`/`extension_table`), `main.js`
  (createExtensionWindow, extensionWindows map, `extension:*` +
  `extapi:table:*` IPC), `preload.js` (`extension:*` เท่านั้น — ไม่แตะ
  `extApi`), `database.js`, `src/renderer/extension.js` (ใหม่),
  `src/renderer/core/settings.js` (`PREFS_SECTIONS` +`'extension'`),
  `package.json` (`build.files` +`preload-ext.js`), `src/renderer/i18n.js`
  (18 locale), `.claude/skills/dracondex-file-arch/check-arch.mjs`
  (`ROOT_FILES` +`preload-ext.js`)
- อะไรเปลี่ยน: เพิ่มระบบดาวน์โหลด "extension" จาก GitHub repo (ต้องมี
  `dracondex-extension.json` manifest ที่ root) — แต่ละ extension ประกาศตาราง
  ฐานข้อมูลของตัวเอง (`ext_<id>_<name>`, คอลัมน์ TEXT/INTEGER/REAL เท่านั้น)
  และรันในหน้าต่าง `BrowserWindow` แยกต่างหากที่ได้ preload คนละไฟล์
  (`preload-ext.js`) ไม่มี `window.api` เลย — เข้าถึงข้อมูลได้แค่ผ่าน
  `window.extApi.table.*` ที่ผูก ownership กับตัวหน้าต่างเอง (ไม่ใช่จาก argument)
  ก่อนรัน SQL ทุกครั้ง ไม่มี raw-SQL passthrough ใดๆ; ระบุ identifier
  whitelist ใหม่ทั้งหมด (ไม่มี pattern เดิมให้ใช้ซ้ำ) เพราะไม่มี prepared-
  statement parameter ตัวไหน bind ชื่อ table/column ได้
- ทำไม: Plan.md part 1 v4.0.0 "Cloud Sync Function > Github" ระบุให้ดาวน์โหลด
  extension จาก GitHub ที่ขยายตาราง database ของตัวเองได้ — ผู้ใช้เลือกทำแบบ
  sandboxed plugin runtime จริงจัง (ไม่ใช่ stub, ไม่ใช่รันแบบเต็มสิทธิ์) หลังจาก
  พบว่า `contextIsolation` ของหน้าต่างหลักป้องกันแค่การเข้าถึง Node/Electron
  โดยตรง ไม่ได้ sandbox สคริปต์หนึ่งจากอีกสคริปต์ในหน้าเดียวกัน — extension ที่
  โหลดแบบไม่แยกหน้าต่างจะมีสิทธิ์เท่ากับตัวแอปเอง (อ่าน/เขียน/ลบได้ทุก Nexus)
- ข้อจำกัดที่ยอมรับไว้ (ไม่ใช่สิ่งที่ plan นี้อ้างว่าแก้): ไม่มี OS-level Chromium
  sandbox จริง เพราะ `main.js` ตั้ง `--no-sandbox` ทั้งโปรเซสไว้ก่อนหน้านี้แล้ว
  (เพื่อ portable build) — ทุกหน้าต่างรวมถึงหน้าต่าง extension ได้รับผลกระทบ
  เหมือนกัน; ไม่มีการตรวจสอบ/code review โค้ดจาก GitHub ก่อนติดตั้ง
- Doc ที่อัปเดต: docs/EXTENSIONS.md (ใหม่ทั้งไฟล์)

---

## 2026-07-30 — Part 1 v4.0.0: Cloud Sync Function — Firebase (version notice)
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/update.js` (ใหม่), `main.js`, `preload.js`,
  `database.js`, `src/renderer/update.js` (ใหม่),
  `src/renderer/core/boot.js`, `index.html`, `src/renderer/i18n.js`
  (18 locale)
- อะไรเปลี่ยน: เพิ่มการแจ้งเตือนเมื่อมีเวอร์ชันใหม่ — อ่านเอกสาร Firestore
  สาธารณะ 1 ชิ้น (`public_config/latest_version`, ไม่ต้องใช้ credential)
  เทียบเวอร์ชันแบบง่าย (ตัด `-n` suffix ก่อนเทียบ) ให้เฉพาะผู้ใช้ที่ login เข้า
  Cloud Sync (Supabase) หรือ Google Drive Backup อย่างใดอย่างหนึ่ง — **ไม่ใช่
  auto-updater** ไม่มีการติดตั้งอัตโนมัติ แค่แจ้งเตือน + ปุ่มเปิดหน้าดาวน์โหลด
  ในเบราว์เซอร์; จำ "เวอร์ชันที่เพิ่งเตือนไปแล้ว" ไว้ไม่ให้เตือนซ้ำ
- ทำไม: Plan.md part 1 v4.0.0 "Cloud Sync Function > Firebase" ระบุสเปกนี้
  ตรงๆ — ขอบเขตจำกัดเฉพาะแจ้งเตือน+ลิงก์ดาวน์โหลดตามที่ผู้ใช้ยืนยัน เพราะแอปนี้
  ไม่มี publish/release pipeline อยู่แล้ว (ไม่มี electron-updater, ไม่มี
  GitHub Releases/tag ใช้งานจริง)
- Doc ที่อัปเดต: docs/UPDATE.md (ใหม่ทั้งไฟล์)

---

## 2026-07-30 — Part 1 v4.0.0: Cloud Sync Function — Google Drive Backup
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/oauth-loopback.js` (ใหม่, ดึงออกจาก `sync.js`),
  `src/db/drive.js` (ใหม่), `src/db/drive-devserver.js` (ใหม่),
  `src/db/sync.js` (refactor ใช้ helper ร่วม, ไม่เปลี่ยนพฤติกรรม), `main.js`,
  `preload.js`, `database.js`, `index.html`, `src/renderer/drive.js` (ใหม่),
  `src/renderer/core/settings.js`, `src/renderer/core/boot.js`,
  `css/builder.css`, `src/renderer/i18n.js` (18 locale)
- อะไรเปลี่ยน: เพิ่มฟีเจอร์สำรองข้อมูลผ่าน Google Drive appdata folder — สำรอง
  "layout profile" (ธีม/ภาษา/ขนาด UI จาก localStorage) และ/หรือไฟล์ฐานข้อมูล
  .ddx (reuse `exportDatabaseTo`/`importDatabaseMerge` เดิมทั้งหมด) แบบ opt-in
  อิสระต่อกัน; login Google **แยกอิสระ** จาก Cloud Sync (Supabase) — คุย
  Google โดยตรง ไม่ผ่าน Supabase relay; auto-backup ทุก 1 ชั่วโมง (timer อยู่
  ฝั่ง renderer); แถบสถานะพื้นที่ Drive เตือน/บล็อกเมื่อใกล้เต็ม/เต็ม; เพิ่มแท็บ
  "สำรองข้อมูล" ใหม่ใน Preferences panel เดิม (ไม่ได้สร้าง Settings Window
  เต็มรูปแบบ — ส่วนนั้นยังไม่ทำในรอบนี้)
- ทำไม: Plan.md part 1 v4.0.0 "Cloud Sync Function > Google" ระบุสเปกนี้ตรงๆ
  (backup ผ่าน Drive appdata, layout profile, .ddx, ทั้งคู่ "หากผู้ใช้ต้องการ")
  — ขอบเขตจำกัดเฉพาะ Google Drive ตามที่ผู้ใช้ยืนยัน (Firebase update-check /
  GitHub extension เป็นแผนแยกในอนาคต); เลือก login แยกจาก Supabase เพราะวิจัย
  พบว่า Supabase Auth ไม่รีเฟรช provider token ให้เอง ทำให้การ bundle เข้ากับ
  login เดิมไม่ได้ประหยัดอะไรแต่กลับบังคับผู้ใช้ Cloud Sync ทุกคนยินยอมสิทธิ์
  Drive ที่ไม่ได้ขอ
- Doc ที่อัปเดต: docs/DRIVE.md (ใหม่ทั้งไฟล์), docs/SYSTEMS.md §Cloud Sync —
  Google Drive Backup, docs/FILES.md §Google Drive Backup

---

## 2026-07-30 — Part 1 v4.0.0: Cloud Sync → Token Sync (Supabase)
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/sync.js`, `src/db/sync-devserver.js`,
  `supabase/migrations/20260730000000_dracondex_token_sync.sql` (ใหม่),
  `src/renderer/sync.js`, `main.js`, `preload.js`, `css/builder.css`,
  `src/renderer/i18n.js` (18 locale)
- อะไรเปลี่ยน: แทนที่ระบบคีย์เข้าถึงถาวรเดิม (access-key prototype, v3.8.0)
  ด้วยระบบโทเคน 16 หลักที่สร้างใหม่ทุกครั้งที่ push; เพิ่ม login Google
  ผ่าน Supabase Auth (PKCE + loopback redirect) เป็นเงื่อนไขก่อนอัปโหลดได้;
  เพิ่ม quota ช่องอัปโหลดตาม tier บัญชี (`sync_account.tier`: free 1 ช่อง/
  10MB, pro 3 ช่อง/20MB — ระหว่างทำแผนผู้ใช้เปลี่ยนสเปกจาก "20MB ทุกบัญชี"
  เป็นสองระดับนี้กลางคัน); เพิ่มรหัสผ่านต่อช่องอัปโหลด (ไม่บังคับ, แฮชด้วย
  `pgcrypto`, ข้ามได้เมื่อบัญชีที่ดึงตรงกับบัญชีที่อัปโหลด, ผิด 8 ครั้งล็อก
  15 นาที); เพิ่มวันหมดอายุ 72 ชม.ต่อช่อง (ตรวจแบบ check-on-read); ยกเลิก
  โมเดล owner/read-key เดิมทั้งหมด (ตาราง `sync_key` + RPC ที่เกี่ยวข้องถูก
  drop) เพราะบัญชี Google ทำหน้าที่ยืนยันตัวตนแทน
- ทำไม: Plan.md part 1 v4.0.0 "Cloud Sync Function > Supabase" ระบุสเปกนี้
  ตรง ๆ (โทเคนใหม่ทุกครั้ง, ขนาด/อายุจำกัด, ต้อง login ก่อนอัปโหลด, quota
  ต่อบัญชี, รหัสผ่านล็อก) — ขอบเขตจำกัดเฉพาะ Supabase ตามที่ผู้ใช้ยืนยัน
  (Google Drive backup/Firebase update-check/GitHub extension เป็นแผนแยก
  ในอนาคต)
- Doc ที่อัปเดต: docs/SYNC.md (เขียนใหม่ทั้งไฟล์), docs/SYSTEMS.md
  §Cloud Sync, docs/FILES.md §Cloud Sync (Supabase)

---

## 2026-07-26 — Part 1 (Plan ใหม่): Re-architecture แยกไฟล์ + สกิล dracondex-file-arch
- commit: d0b74d6, 81c3a12, 4884e87, bd51eb4
- ไฟล์ที่แก้: `style.css` → `css/` 14 ไฟล์, `src/renderer/core.js` → `core/` 12 ไฟล์,
  `src/db/core.js` → `conn.js` + `schema/` 5 ไฟล์ + `import-merge.js` + façade,
  `src/renderer/hub.js` → `hub/` 7 ไฟล์, `navigator.js` → `navigator/` 9 ไฟล์,
  `hero.js` → `hero/` 6 ไฟล์, `index.html`, `package.json`,
  `src/renderer/{map,relation,mod/viewer}.js`, `test/onboarding-tour.test.mjs`,
  `.claude/skills/dracondex-module-style/check.mjs`,
  `.claude/skills/dracondex-file-arch/` (ใหม่)
- อะไรเปลี่ยน:
  - แยกไฟล์ใหญ่ 6 ไฟล์ (3159/2642/2532/1807/1301/1088 บรรทัด) ตามเกณฑ์ใน
    `Plan.md` **ทุกไฟล์ใหม่เป็นการตัดช่วงบรรทัดต่อเนื่องแบบคำต่อคำ** และเรียง
    ลำดับโหลดตามเดิม → ต่อกลับได้ byte ต่อ byte (พิสูจน์ด้วยสคริปต์) ลำดับ
    cascade ของ CSS และลำดับ evaluate ของ classic script จึงไม่เปลี่ยน
  - `src/db/core.js` เหลือเป็น façade re-export 5 ชื่อเดิม (ไฟล์อื่น ~29 ไฟล์
    ที่ `require('./core')` ไม่ต้องแก้), `initDB()` → `initDB(db)`,
    แก้ byte NUL/`\x01` จริงในซอร์สเป็น escape (git เคยมองไฟล์นี้เป็น binary),
    CRLF → LF
  - `navigator/` + `hero/` โหลดแบบกลุ่มผ่าน `LAZY_GROUPS` + `loadGroup()`
    (`core/views.js`) เพราะ `<script>` ที่แทรกทีหลังเป็น async ไม่มีลำดับ
  - สกิลใหม่ `dracondex-file-arch` (SKILL.md + `check-arch.mjs`): รายงานแถบ
    ขนาดไฟล์ตาม Plan.md + สัญญาณ "หลายหน้าที่", และ **error** เมื่อ wiring พัง
    (ไฟล์ renderer ที่ไม่มีใครโหลด, ชื่อ top-level ซ้ำข้ามไฟล์, CSS ที่ไม่ถูก
    `<link>` / `url()` ที่ลืม `../`, `build.files` ไม่ครอบคลุม, ไฟล์ db ที่
    `database.js` เข้าไม่ถึง)
  - `check.mjs` เดิมถูกชี้ไปที่ layout ใหม่ (รวม `css/*.css`, รวม
    `core/*.js`, และ **เดินโฟลเดอร์แบบ recursive** — เดิมข้าม `mod/` ทั้งหมด
    จึงเป็นเหตุผลที่ warning ขยับ 31 → 55 โดยไม่ใช่โค้ดใหม่)
- บั๊กที่เจอและแก้ระหว่างทาง (ทั้งหมดมีอยู่ก่อนแล้ว ยกเว้นข้อแรก):
  - `url('Image/…')` ใน CSS ที่ย้ายเข้า `css/` กลายเป็น 404 (url อ้างจากตัวไฟล์
    CSS ไม่ใช่จาก `index.html`) — แก้เป็น `../Image/…` ทั้ง 33 จุด
  - `flattenModuleTree` ถูกประกาศ**คนละแบบ** ใน `hub/menus.js` (recursive, 3
    args) กับ `mod/viewer.js` (flat, 0 args) — viewer โหลดทีหลังจึงชนะ ทำให้
    เมนู "ย้ายไปยัง…" ของ Nest row โยน TypeError (ยืนยันจริงในแอปก่อน/หลังแก้);
    เปลี่ยนชื่อฝั่ง viewer เป็น `flattenModulesForFilter`
  - `ensureKonva` ถูกก็อปทั้งก้อนไว้ทั้ง `map.js` และ `relation.js` ทั้งที่มี
    อีก 4 โมดูล lazy เรียกใช้ — ย้ายไปไว้ที่เดียวแบบ eager ใน `core/views.js`
  - `autoExpand` ซ้ำใน `map.js` (ไม่มีใครเรียก — dead code) กับ `timeline.js`
- ทำไม: `Plan.md` part 1 — ไฟล์ใหญ่หลายไฟล์ถือหลายหน้าที่พร้อมกัน หาโค้ดยาก
  และแก้ทีหนึ่งเสี่ยงชนกันเอง; ต้องมีตัวตรวจถาวรกันไม่ให้ย้อนกลับไปโตแบบเดิม
- Doc ที่อัปเดต: docs/FILES.md (§Re-architecture ใหม่ + ตัวชี้ที่ core/navigator/
  hero), docs/Architec.md §1.2/§ชั้นระบบ/§4, docs/SYSTEMS.md (path ธีม +
  openImportDbHub), CLAUDE.md (repo layout, ตารางสกิล, คำสั่งตรวจ)

## 2026-07-26 — Part 2: backend efficiency (ผิวสัมผัส IPC + call site ฝั่ง renderer)
- commit: uncommitted
- ไฟล์ที่แก้: `main.js`, `preload.js`, `src/db/module.js`,
  `src/db/classifier.js`, `src/db/sage.js`, `src/db/wiki.js`,
  `src/renderer/core.js`, `src/renderer/hub.js`, `src/renderer/inspector.js`,
  `src/renderer/mod/classifier.js`, `src/renderer/mod/manager.js`,
  `src/renderer/mod/sagehut.js`, `src/renderer/mod/fileviewer.js`
- อะไรเปลี่ยน:
  - **#2.1 batch IPC** — `classifier:getObjectsFull` รวม object+template+
    attribute+private template ของทั้งโมดูลเป็นคำเรียกเดียว (เดิม 4+2N โดย N =
    จำนวน object: `getAttrs`+`getObjectTemplates` ต่อ object) และประกอบ
    `attrMap`/`conditionMap`/`privateTemplates` ให้เสร็จฝั่ง db;
    `module:getInspector` รวม 4 read ของ Inspector เป็นก้อนเดียว (คีย์
    `{attrs,tags,links,ui}` เท่าเดิม เพราะมีที่อื่นอ่าน/แก้ `S.inspectorData`
    ตรงๆ); `module:getAttrCounts` นับ attribute ของ Minor ทุกตัวด้วย GROUP BY
    เดียว (เดิม Manager ดึง attribute เต็มของลูกทุกตัวมาเพื่ออ่าน `.length`)
  - **#2.2 `ddx-file://`** — display image ชี้ `<img src>` ไป protocol ตรงๆ
    (0 IPC) แทน base64 ผ่าน bridge; handler พก **row id ไม่ใช่ path** และเสิร์ฟ
    เฉพาะ row ที่เป็นรูปจริง (ไฟล์ import ไม่ถูกคัดลอกเข้า data dir จึงไม่มี
    prefix ให้ sandbox); ทางสำรอง `<img onerror>` รวมเป็น `importdock:readFiles`
    ครั้งเดียวสำหรับ renderer ที่ไม่มี protocol
  - **#2.3 Sage Hut** — ดึงเฉพาะ payload ที่แท็บนั้นใช้ + memo ต่อ nexus
    (`S.sageHutCache`); ยุบ query `LENGTH(description)` ต่อโมดูลที่ `prepare()`
    ซ้ำใน loop เข้าไปเป็นคอลัมน์ของคิวรีรายชื่อโมดูลที่ดึงอยู่แล้ว
  - **#2.4 `wiki.js`** — `rebuildWikiIndex`/`resolveDanglingLinks` ห่อ
    transaction เดียว (เดิม R แถว = R BEGIN/COMMIT); memo `resolveWikiName`
    เฉพาะช่วง bulk; `resolveEntityKeys` เปลี่ยนเป็น `IN` ต่อ entity type
    (arity คงที่ 64 + pad ด้วย id ซ้ำ เพื่อไม่ให้ statement cache แตกเป็นหลายรูป)
    โดยยังรักษาลำดับ input ที่ UI ใช้แสดง backlink
  - **#2.5 nest render storm** — `module:getNestItems` คืน content item ของทุก
    โมดูลในวอลต์ในคำเรียกเดียว (แถวบางเฉพาะคอลัมน์ที่ `nameOf` ใช้) เติมเข้า
    `S.nestItems` ตั้งแต่ตอนโหลด tree ทั้งใน `reloadModuleTree`, boot wave และ
    `selectNexus` — จึงไม่มี lazy fetch + full re-render ทีละโมดูลอีก;
    `scheduleNestRender()` รวบ re-render จาก path async เป็นครั้งเดียวต่อ
    microtask; `module:getItemCounts`/`getContentItemCounts`/`S.moduleItemCounts`
    ถูกลบเพราะนับจาก `.length` ได้แล้ว
- ทำไม: part 1 แก้ชั้นข้อมูลไปแล้ว แต่ renderer ยังยิงหนึ่ง IPC round-trip ต่อ
  หนึ่งแถวในหลาย hot path — แต่ละ round-trip เสียทั้ง structured-clone hop และ
  lock cycle ของ statement ฝั่ง main. วัดจริงด้วยการ hook `ipcMain` แล้วขับแอป
  บนวอลต์ตัวอย่างเดียวกันก่อน/หลัง: โหลด nest tree 10 IPC + 6 render → 2 + 1,
  เปิด classifier 12 object 34 → 6, คลิกครบ 4 แท็บ Sage Hut 12 → 3, รูป display
  image K รูป K → 0, สร้าง/ลบ object 35 IPC → 7
- แถมที่แก้ระหว่างทาง (บั๊กจริง ไม่ใช่แค่ perf): `S.displayImageData` ไม่เคยถูก
  ล้าง (จุด invalidate ล้างแต่ `S.displayImageCache`) ทำให้รูปที่ถูกแทนที่บน
  ดิสก์ค้างทั้ง session + blob สะสม; และ guard `if (protocol)` ใน `main.js`
  เพราะ web-driver harness โหลดไฟล์นี้โดย stub Electron shell ทิ้ง — ถ้าไม่ guard
  เครื่องมือ verify ทั้งตัวจะพังทันที
- Doc ที่อัปเดต: docs/SYSTEMS.md §2c, §10 (หัวข้อใหม่ "ประสิทธิภาพ IPC" +
  "รูป display image ผ่าน ddx-file://"), docs/FILES.md (main.js, src/db/module.js,
  classifier.js, sage.js, wiki.js, src/renderer/hub.js, inspector.js,
  mod/sagehut.js, mod/fileviewer.js)

## 2026-07-25 — หน้า Loading (boot splash) + progress bar ตอนเปิดแอพ
- commit: uncommitted
- ไฟล์ที่แก้: `index.html`, `style.css`, `src/renderer/core.js`,
  `src/renderer/search.js`
- อะไรเปลี่ยน:
  - **`index.html`** — เพิ่ม `#splash` (logo + `#splash-track`/`#splash-fill` +
    `#splash-pct`) เป็นบล็อกแรกใน `<body>` พร้อม inline `<script>` ที่ (ก) ตั้ง
    `body[data-theme]` จาก `localStorage` ทันทีก่อนเฟรมแรก (ข) นิยาม
    `window.__splash` = `set(pct)`/`finish()` + watchdog 20 วิ; แทรก
    `__splash.set(N)` คั่นระหว่าง `<script src>` ที่ 15/35/50/55%
  - **`style.css`** — บล็อก `#splash*` ใหม่ (วางถัดจาก `.busy-veil`) ใช้ token
    ล้วน: `--bg`, `--raised`, `var(--button, var(--accent))`, `--t3`, `--rs`,
    `--sp-7`, `--fs-xs`; `z-index:2000` เหนือทุก overlay (สูงสุดเดิมคือ
    `#guide-overlay` ที่ 1200); มี `prefers-reduced-motion` ปิด transition
  - **`core.js`** — `__splash?.set()` 4 จุดใน `init()` (60/80/88/95) แล้ว
    `finish()` ท้ายสุดหลัง `bindSearch()`
  - **`search.js`** — `init()` → `init().catch(...)` เรียก `finish()` เมื่อ throw
  - logo ใช้คลาส `.brand-img` เดิมซ้ำ จึงได้ภาพสลับตามธีมทั้ง 32 ธีมฟรี
    ไม่ต้องเพิ่มไฟล์ภาพใหม่ และไม่มีข้อความแปลภาษาบน splash เลย (มีแค่ logo/
    แถบ/ตัวเลข %) จึงไม่ต้องเพิ่ม key ใน 18 locale
- ทำไม: เปิดแอพแล้วเห็นจอดำนิ่งหลายวินาที แยกไม่ออกว่าค้างหรือกำลังโหลด —
  ต้นเหตุคือหน้าต่างโผล่ทันที (ไม่มี `show:false`/`ready-to-show`) แต่กว่า
  `<script src>` 30 ตัว (~700KB) จะ parse ครบและ `init()` จะเปิด SQLite +
  รัน migration เสร็จ ก็กินเวลาจริง; ผู้ใช้ธีมสว่างยังโดนจอวาบดำเพิ่มเพราะ
  `applyUiSettings()` (ตัวตั้งธีม) รันหลังโหลด JS ครบแล้วเท่านั้น
- ตรวจสอบแล้ว (ขับแอพจริงด้วย `run-dracondex`): splash เรนเดอร์กลางจอถูกต้อง
  และถูก `remove()` ออกจาก DOM หลังโหลดเสร็จ (`getElementById('splash')` → `null`);
  ธีม `daylight` — พิสูจน์แยกว่า inline bootstrap เป็นตัวตั้งธีมจริง โดยปิด
  บรรทัด `data-theme` ใน `applyUiSettings()` ชั่วคราวแล้วยังได้พื้น `#f4f6fb`
  + logo สลับเป็น `WhiteIn.png`; ทดสอบให้ `init()` throw กลางคัน → splash ยัง
  ถูกปลดและหน้าจอคลิกได้; `check.mjs` = 0 error และไม่มี warning ใหม่
- Doc ที่อัปเดต: docs/SYSTEMS.md §10 (หัวข้อใหม่ "หน้า Loading ตอนเปิดแอพ"),
  docs/FILES.md (index.html, search.js)

## 2026-07-25 — UI/UX pass: แก้ข้อบกพร่องการโต้ตอบ + วางระบบ design token / ตัวอักษรไทย
- commit: uncommitted
- ไฟล์ที่แก้: `style.css`, `src/renderer/core.js`, `src/renderer/search.js`,
  `src/renderer/quickswitch.js`, `src/renderer/hub.js`, `src/renderer/i18n.js`,
  `main.js`, `preload.js`, `index.html`, + 15 ไฟล์ renderer ที่โดน `--fsc` sweep
- อะไรเปลี่ยน:
  - **Part 1 — ข้อบกพร่องการโต้ตอบ**
    - `toast()`: map `'error'→'err'`, `'success'→'ok'` — 20 จุดที่ส่ง `'error'`
      ไม่เคยตรงกฎ CSS ไหนเลย ข้อความ error จึงแสดงเป็นสีเทาแยกจาก success ไม่ออก;
      `#toast` เพิ่ม `role=status`/`aria-live`
    - `bindModalEscape()`: modal หลักปิดด้วย Escape ได้แล้ว (เป็น overlay เดียว
      ในแอปที่ไม่มี) มี guard กัน `#confirm-overlay`/`#qs-overlay`/`#guide-overlay`
      และกัน welcome modal ที่บังคับให้เลือก; `openModal()` โฟกัส field แรกให้เอง
    - **บั๊กที่เจอตอนทดสอบจริง**: `uiConfirm` ไม่ได้ `stopPropagation()` ทำให้กด
      Escape ครั้งเดียวปิดทั้ง confirm และ modal ข้างล่าง (เพราะ `finish()` ลบ
      overlay ทันที guard เลยมองไม่เห็น) — แก้ที่ต้นเหตุให้เหมือน guide/quickswitch
    - `uiPrompt()` แทน native `prompt()` ที่ `importCustomPalette` (บั๊ก renderer
      ค้างแบบเดียวกับที่ `uiConfirm` เกิดมาแก้) — สร้างบน `#confirm-overlay`
      เพราะ `#modal-overlay` z-index 100 ต่ำกว่า `.floating-panel` 150
    - ใส่ `uiConfirm()` ให้การลบ 7 จุดที่เดิมลบทันที (ยกเว้นเครื่องมือ delete
      บนแผนที่ ที่คลิกเดียวลบโดยตั้งใจ)
    - ช่องค้นหา sidebar: เมื่อมี Nexus เปิดอยู่ให้ส่งต่อ `openQuickSwitcher(seed)`
      แทน — เดิมเขียนทับ `#left-panel-inner` ซึ่ง**คือ Nexus Nest tree** พิมพ์
      ค้นหาทีเดียวต้นไม้โมดูลหายทั้งแถบ และยังค้นไม่เจอโมดูล v3 เลย;
      placeholder เพิ่ม `(Ctrl+P)` (Quick Switcher เดิมไม่มีทางเข้าที่มองเห็นได้)
    - เมนูเฟืองเพิ่มหมวด "ช่วยเหลือ": ตารางคีย์ลัด + เล่นทัวร์ซ้ำ
    - empty state ของ Nest/kind-browser มีปุ่มสร้าง Major module แล้ว
    - `setBusy()` + `.busy-veil` ที่ `openModuleNode`, `chooseImportAsNexusNest`
    - แยก IPC `db:importFileMerge` → `db:pickImportFile` + `db:importMergeFile`
      เพื่อให้ถามยืนยัน**หลัง**เลือกไฟล์ได้จริง (เดิมช่องเดียว merge จบไปแล้ว)
  - **Part 2 — ระบบภาพ (surgical, หน้าตาเดิม)**
    - `:root` เพิ่ม `--fsc` (ถูกอ้าง 300+ ครั้งแต่ไม่เคยประกาศ), token สเกลใหม่
      (`--sp-*`, `--fs-*`, `--lh-*`, `--shadow-*`, `--mono`) สำหรับโค้ดใหม่
      **ไม่ retrofit** px เดิม ~2,200 จุด; ลบ `--bg3` ที่ไม่มีใครใช้
    - แทน `box-shadow` ที่ซ้ำเป๊ะ 12 จุดด้วย token (เว้น 4 จุดที่ค่าใกล้แต่ไม่ตรง
      — รวมเข้าไปจะเป็นการเปลี่ยนหน้าตา)
    - `--on-accent`/`--on-button`/`--on-danger`: แทน `#fff` ที่ hardcode 28 จุด
      (ค่า default `#fff` → คำนวณแล้วเหมือนเดิมทุกธีม) แล้ว override เป็น
      `--ink-dark` ใน 15 ธีม (accent) / 12 ธีม (button) ตาม WCAG 3:1;
      2 จุดเป็น**บั๊กจริง** (ตัวอักษรขาวบนพื้น `var(--hover)` มองไม่เห็นใน 8 ธีมสว่าง);
      ลบแพตช์เฉพาะจุดของ `blueEclipse` ที่ซ้ำซ้อนแล้ว
    - ตัวอักษรไทย: เพิ่ม `'Leelawadee UI', Tahoma` ต่อจาก `'Segoe UI'`,
      เปลี่ยน `word-break:break-word` → `overflow-wrap:break-word` 4 จุด
      (ตัวแรกเท่ากับ `anywhere` ซึ่งปิดตัวตัดคำไทยของ ICU → ตัดกลางพยางค์)
    - ลบ compat CSS ที่ไม่มีใครใช้ 12 คลาส + บล็อกที่นิยามซ้ำคำต่อคำ
    - sweep `font-size:Npx` แบบ inline 126 จุดใน 16 ไฟล์ →
      `calc(Npx * var(--fsc,1))` เดิมไม่ขยายตามสเกลฟอนต์เลย
- ทำไม: ผู้ใช้ขอ "improve my UI/UX" — เลือกทำ UX ก่อนแล้วค่อยงานภาพ, แบบ
  surgical (แก้เฉพาะที่ผิดจริง ไม่จัดหน้าตาใหม่), รวมงานตัวอักษรไทยด้วย
- ตรวจสอบ: `check.mjs` คง 0 error / 31 warning (เท่า baseline) ตลอดทุกขั้น;
  รันแอปจริงผ่าน `run-dracondex` ยืนยันทีละข้อ — Escape ซ้อนชั้น, toast แดงจริง
  (`rgb(239,68,68)`), tree ไม่หายตอนค้นหา, และวัด contrast ที่คำนวณจริงครบ 32 ธีม
  (**ไม่มีธีมไหนต่ำกว่า 3:1 แล้ว**; แย่สุด 1.61→3.19 ปุ่ม, 1.67→3.53 nav)
  พร้อมทดสอบสเกลฟอนต์ 80/100/130%
- Doc ที่อัปเดต: docs/SYSTEMS.md §4.6, §10 (ธีม + 2 หัวข้อใหม่), §11;
  docs/FILES.md (style.css, preload.js, core.js)

## 2026-07-24 — Plan.md part5 เสร็จสมบูรณ์: Designer link-filter/scroll-zoom/arrow-trim, Connector scroll-zoom, Drafter export + toolbar
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/mod/designer.js`, `src/renderer/mod/connector.js`, `src/renderer/mod/drafter.js`, `src/renderer/mdeditor.js`, `main.js`, `preload.js`, `src/renderer/i18n.js`, `Plan.md`
- อะไรเปลี่ยน:
  - **Designer**: scroll-wheel ซูมตรงๆ ไม่ต้องกด Ctrl แล้ว (ลบ `ctrlKey` gate); node-edge arrow trim เดิมใช้ radius เดา (`rA/rB` hardcode) ทำให้ node ที่ label ยาวมี gap ระหว่างเส้นกับขอบ node — แก้เป็นวัดขนาดจริงจาก DOM (`data-node` attr ใหม่บน node div + `dgBoundaryPoint()` คำนวณจุดตัดขอบจริง: ellipse formula สำหรับ circle, rectangle-ray intersection สำหรับ box/diamond/pin/text) พร้อมแก้บั๊กลำดับเรียก `drawEdges()` เดิมที่ถูกเรียกก่อน node DOM element จะถูกสร้าง (ใช้ได้เพราะ radius เดิมไม่พึ่ง DOM เลย แต่จะพังทันทีถ้าไม่ย้ายมาเรียกหลัง node loop); เพิ่ม type-filter สำหรับ module-link picker (`designerLinkFilter` ใน module_ui, มิเรอร์ pattern เดียวกับ Narrator's `narratorLinkFilter`)
  - **Connector**: scroll-wheel ซูมตรงๆ เช่นกัน (ลบ `ctrlKey` gate); hint text เดิมใช้ `narratorPanHint` ร่วมกับ Narrator (ซึ่งยังคง Ctrl-gated) — แยกเป็น `connectorPanHint` ของตัวเองแทนที่จะแก้ key ที่ใช้ร่วมกัน
  - **Drafter**: ปุ่ม Export ใหม่เขียนไฟล์ .md/.txt ตรงๆ (`drafter:exportFile` IPC, โมเดลจาก `author:exportDoc` แต่เขียน string ธรรมดาไม่ต้องห่อ HTML) — save dialog มี filter group ทั้ง Markdown/.md และ Text/.txt ให้เลือกในตัว; เพิ่ม 3 ปุ่ม toolbar shortcut (checkbox/hr/code-block) ใน `FMT_ACTIONS` ที่ใช้ร่วมกับ editor อื่นๆ (แต่ปัจจุบันมีแค่ Drafter ที่เปิด `toolbar:true`) — `mdRender()` รองรับ syntax พวกนี้อยู่แล้ว ไม่ได้แก้ rendering
  - เพิ่ม i18n key ใหม่ `connectorPanHint`, `narratorLinkFilter`(ใช้ซ้ำ), `exportFile` ครบ 18 locale, แก้ `designerHint` ให้ตรงกับพฤติกรรมใหม่ (ไม่มี "Ctrl+" แล้ว)
- ทำไม: `Plan.md` part5 หมวด Designer/Connector/Drafter (6 checklist items สุดท้าย) — ปิด part5 ครบทุกข้อ (part6 ยังเหลืองานอยู่)
- Doc ที่อัปเดต: `docs/FILES.md` (`mod/designer.js`, `mod/connector.js`, `mod/drafter.js` — เพิ่มแถวใหม่ที่หายไปเดิม, `mdeditor.js` section เพิ่ม FMT_ACTIONS ใหม่); `docs/SYSTEMS.md` **ไม่แตะ** — v3 module kinds เหล่านี้ยังไม่มี section เฉพาะเหมือนเดิม (gap ที่ระบุไว้แล้วใน `CLAUDE.md`)

## 2026-07-24 — Plan.md part5: Locator area-drag/centroid fix, Chronicler compare-by-module/calendar/event-icon, Wanderer link redesign + Area view
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/map.js`, `src/renderer/timeline.js`, `src/renderer/mod/chronicler.js`, `src/renderer/mod/wanderer.js`, `src/renderer/inspector.js`, `src/renderer/core.js`, `src/db/core.js`, `src/db/timeline.js`, `src/db/wanderer.js`, `main.js`, `preload.js`, `style.css`, `Plan.md`
- อะไรเปลี่ยน:
  - **Locator (L1/L2)**: area label เดิมใช้ vertex-average เป็น centroid (เอียงไปทางขอบที่มี point เยอะ) — เปลี่ยนเป็น shoelace-formula area-weighted centroid บน hull จริง (`polygonCentroid()` ใหม่ใน `map.js`); เพิ่ม whole-area drag — ลากในพื้นที่ fill (ไม่ใช่แค่ vertex dot) ย้ายทั้งชิ้น โดย poly เป็น `draggable` ใหม่ อ่าน delta จาก `poly.position()` แต่ละ tick แล้วเลื่อนทุกจุดใน `pts` พร้อมกัน
  - **Chronicler (C1-C4)**: ruler ของ oneline view เปลี่ยนจากชื่อเดือน (`Jan`/`Feb`) เป็นเลขเดือนล้วน; จำกัด 1 timeline line/module (ปุ่ม add line ซ่อนเมื่อมี line แล้ว), Compare view เปลี่ยนจากเลือก line อื่นในโมดูลเดียวกัน เป็นเลือก **chronicler module อื่น** ในทรี (ใช้ `modulesOfKind()` ตัวใหม่ที่ hoist ไปไว้ที่ `core.js` แทนการก็อปจาก `wanderer.js` เดิม เพราะ `chronicler.js` โหลดก่อน `wanderer.js` ใน `index.html`); เพิ่ม view ใหม่ `calendar` (ปฏิทิน raw year/month/day, ตั้งค่า days/week·days/month·months/year·ชื่อวัน-เดือนได้ผ่าน `module_ui.calendarConfig` JSON — เหมือน pattern `filterDef` เดิม); คลิก dot ของ event เปิด icon-picker popup (`openChroniclerEventIconPopup`, ก็อปจาก `hub.js`'s `openModuleIconPopup` — คนละอันกับ classifier ที่มีแค่ inline form ไม่มี popup) แทน color swatch เดิมในฟอร์ม — เพิ่มคอลัมน์ `timeline_event.icon TEXT` (additive) + `updateEventIcon(id,icon,color)`
  - **Wanderer (W1-W5)**: เอา placeholder "เลือก Locator"/"เลือก Chronicler" ออกจาก select; area บนแผนที่กลายเป็น terrain เฉย ๆ ไม่ react ต่อคลิก/vertex dot ไม่ render อีกต่อไป (กัน `S.mapAreaId` ซึ่งเป็น global ข้าม kind รั่วไปโผล่ที่ Locator), คลิกบน area shape ตรง ๆ ในโหมด placing เปิด modal สร้าง link ได้เลย (พร้อม `areaId` ที่คลิกโดนถูก capture อัตโนมัติ — ต้องเพิ่ม `areaId: area.id` ให้ Konva.Line ของ poly ด้วย ไม่งั้น area_ref จะว่างเสมอ); ระบบ link เปลี่ยนจาก label ข้อความอิสระ+ผูก event เป็นเลือก **vault entity ใดก็ได้** (`api.wiki.quickIndex`/`resolveKeys` — ครอบคลุมกว่าที่คิดไว้ตอนแรก ไม่ใช่แค่ classifier object/element/character แต่รวม module/chapter/note/ฯลฯ ด้วย) ผูกกับ event (วันที่) — คอลัมน์ใหม่ `map_event.linker_key TEXT` (additive, `label` เดิมยังอยู่แต่เลิกอ่าน/เขียน); เอา view `dual` ออก เพิ่ม view `area` ใหม่ (Map + Area List ข้างกัน + oneline timeline ด้านล่าง, เปิดได้ทีละ area ผ่าน `S.wandererData.openAreaId`)
  - **บั๊กที่เจอระหว่างตรวจสอบสดผ่าน `run-dracondex`**: `mountWandererBoard()` เรียก `buildChroniclerOneLineHtml()` (เป็น `async function`) โดยไม่มี `await` มาตั้งแต่เดิม — เรนเดอร์ literal string `"[object Promise]"` แทน SVG จริงมาตลอด (เพิ่งโผล่ชัดตอนต้องเทสต์ view `area` ใหม่); และ `inspector.js`'s view-label fallback ของ `wanderer` ยังเป็น `'Dual'` ค้างอยู่ — แก้เป็น `'Area'` ให้ตรงกับ `WANDERER_VIEWS[0]` ใหม่
- ทำไม: `Plan.md` part5 หมวด Locator/Chronicler/Wanderer (11 checklist items) — งานตามที่ user ระบุไว้ใน Plan
- Doc ที่อัปเดต: `docs/FILES.md` (`src/db/wanderer.js`, `src/db/timeline.js`, `src/db/core.js`, `src/renderer/map.js`, `src/renderer/timeline.js`, `src/renderer/mod/chronicler.js`, `src/renderer/mod/locator.js`, `src/renderer/mod/wanderer.js` — บรรทัด/ฟังก์ชัน/คอลัมน์ใหม่); `docs/SYSTEMS.md` **ไม่แตะ** — v3 module kinds (locator/chronicler/wanderer) ยังไม่มี section เฉพาะเลย ตามที่ระบุไว้แล้วใน `CLAUDE.md` §"Known rough edges" (gap เดิมก่อนรอบนี้ ใหญ่กว่า scope ของงานที่ทำวันนี้)

## 2026-07-22 — แก้ Hub 5 จุด: guideline/icon alignment, resizable page view, context menu open-in-new-window/pane, Sage Hut header icon (Plan.md Part 1)
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/hub.js`, `src/renderer/core.js`, `src/renderer/mod/sagehut.js`, `src/renderer/mod/fileviewer.js`, `src/renderer/i18n.js`, `style.css`, `Plan.md`
- อะไรเปลี่ยน:
  - **#1+#5 Nest tree — guideline กับ icon column ไม่ตรงกัน**: `buildNestRow`/`buildNestItemRow` เดิมปล่อย chevron เป็น string ว่างเมื่อแถวไม่มี child (ไม่ใช่ placeholder) ทำให้ `.kicon` เลื่อนซ้ายกว่าแถวข้างเคียงที่มี chevron จริง — เพิ่ม `<span class="tree-chev-spacer">` ขนาดเท่า `.tree-chev` (9×9px) แทนที่ string ว่าง แก้ `.li.indentN::after` guideline ให้คำนวณตำแหน่งจากจุดกึ่งกลาง chevron จริง (`paddingLeft(N)+4.5`) แทนค่าคงที่เดิม (`paddingLeft(N)-6`) ที่ไม่ตรงกับตำแหน่งจริงของ chevron เลย
    - **บั๊กที่เจอระหว่างตรวจสอบสด (live-verified ผ่าน `run-dracondex`'s `web-driver.mjs`)**: `.tree-chev{width:9px;height:9px}` ถูก `.icon{width:1em;height:1em}` (ทีหลังในไฟล์ specificity เท่ากัน) ทับค่าจริงโดยไม่รู้ตัว — วัดจาก `getBoundingClientRect()` สด พบ chevron จริงกว้างเกิน spacer ~4.5px ทำให้เลขคำนวณ alignment ผิดไปด้วย แก้ด้วย compound selector `.icon.tree-chev{...}` (specificity สูงกว่า `.icon` เฉย ๆ แน่นอน ไม่พึ่ง source order) ยืนยันซ้ำหลังแก้: chevron/spacer ทั้งคู่ 9px ตรงกันเป๊ะทุก indent depth
  - **#2 Hub page — resizable page view**: หน้า Sage Hut/Import Dock file-preview/Kind Browser (ไม่มี resize lever เดิมเหมือน Module Detail ที่มี `#inspector-resize` อยู่แล้ว) ห่อด้วย `wrapPageView()` ใหม่ (`hub.js`) ให้ resize handle (`#page-view-resize`, reuse `.panel-resize-handle`) — `startPageViewResize`/`S.pageViewWidth` (`core.js`) ตาม pattern เดียวกับ `startLeftPanelResize`/`startInspectorResize` เดิม clamp 480px–ความกว้าง pane จริง persist ผ่าน localStorage
  - **#3 Context menu — "เปิดในหน้าต่างใหม่"/"เปิดใน Pane ใหม่ ▸"**: เพิ่มใน `buildModuleContextMenuHtml` เฉพาะ module ที่ `kind !== 'collector'` (มี Builder page เอง) — `openModuleInNewWindow` (เรียก `api.window.openBuilderTab` เดิมตรง ๆ), `openModuleInNewPane`/`openPaneDirectionSubmenu`/`buildPaneDirectionListHtml` (submenu ซ้าย/ขวา/บน/ล่าง reuse hover-submenu pattern เดียวกับ "Create" submenu เดิม, เรียก `builderSplitPane`+`builderFocusPane` เดิมตรง ๆ) — ไม่ต้องแก้ main.js/preload.js เลย ทุกอย่าง wire ไว้แล้วจาก Builder pop-out/split-pane เดิม
  - **#4 Sage Hut header ไม่มี icon**: `buildSageHutHtml`'s `<h2>` เพิ่ม `display:flex;align-items:center;gap:8px` + `<span class="kicon">${I.sage}</span>` (icon เดิมที่ใช้กับ Sage Hut builder-tab badge อยู่แล้ว) ให้ header สูงเท่า Nexus Nest module detail header
- ทำไม: `Plan.md` Part 1 (5 checklist items) — งานปรับแต่ง Hub เล็ก ๆ ตามที่ user เขียนไว้
- Doc ที่อัปเดต: `docs/FILES.md` (`hub.js`/`mod/sagehut.js`/`mod/fileviewer.js`/`core.js` renderer section — เลขบรรทัด+ฟังก์ชันใหม่); `docs/SYSTEMS.md` **ไม่แตะ** — ยังไม่มี section เฉพาะของ v3 Hub/Builder system เลย (gap เดิมที่ถูก flag ไว้ตั้งแต่รอบก่อน ๆ ใน `procress.md`, ยังคงเป็น scope ที่ใหญ่กว่ารอบนี้)

## 2026-07-20 — Import DB: รองรับไฟล์ .db เก่ามาก (v1.x/v2.x), แก้ icon ค้าง, ปิดช่อง write (Plan part2)
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/core.js`, `src/renderer/core.js`, `preload.js`
- อะไรเปลี่ยน:
  - **แก้ bug บล็อกทั้งหมด**: ไฟล์ตัวอย่างจริงใน `old_db_data/` (v1.1.0,
    v1.2.2) เป็น WAL journal mode แต่ไม่มี `-wal` sidecar แนบมา —
    `node-sqlite3-wasm` ล่มทันทีตอน `importDatabaseMerge` เปิดอ่าน (reproduce
    แล้วตรง ๆ ด้วย scratch copy) เพิ่ม `forceLegacyJournalMode()` (ดึงมาจาก
    logic เดิมใน `getDB()`) แล้วให้ `importDatabaseMerge` คัดลอกไฟล์ที่เลือกไป
    temp ก่อนเสมอ (ไม่แตะไฟล์ต้นฉบับ), copy `-wal`/`-shm` มาด้วยถ้ามี, ไม่งั้น
    patch header แทน แล้วค่อยเปิดอ่านจาก temp — ลบ temp ทิ้งหลัง merge เสร็จ
    (finally block, ครอบ `source.close()` ด้วย)
  - **แก้ bug column-mismatch**: `relation_type` merge block เดิม
    `SELECT relation_name, color FROM relation_type` แบบ unconditional — ไฟล์
    v1.1.0 ไม่มีคอลัมน์ `color` เลย ทำให้ transaction ทั้งก้อน rollback (ไม่ใช่
    แค่แถว relation_type) เพิ่ม `hasColumn` guard เหมือน pattern เดิมที่ใช้กับ
    `timeline_event.story`/`hashtag.tag_color`
  - **แก้ bug icon ค้าง**: `openImportDbHub()` ไม่เคยเคลียร์
    `S.activeModuleNode` หรือเรียก `renderModuleRail()` — module v3 ที่ pin
    ไว้แล้วเปิดอยู่ก่อนหน้าจะค้าง `.active` ในแถบ nav ทั้งที่กำลังดู Director
    legacy panel อยู่ เพิ่มทั้งสองบรรทัดตาม pattern เดียวกับ
    `selectNexus`/`closeNexus`
  - **ปิดช่อง write**: `IMPORT_DB_READONLY_NS` (preload.js) ไม่มี `folder`
    (project-folder CRUD ของ Director) มาก่อน — สามารถสร้าง/แก้/ลบโฟลเดอร์ได้
    ทั้งที่อยู่ใน Import DB read-only mode เพิ่ม `folder` เข้า set
  - Verify ทั้งหมดด้วย `run-dracondex`'s `web-driver.mjs`: import ไฟล์
    v1.1.0/v1.2.2 จริงสำเร็จทั้งคู่ (unit-test `importDatabaseMerge` ตรง ๆ ผ่าน
    stub `electron`), migrate เข้า Nexus Nest ได้ module tree จริงจาก
    v1.1.0 (120 projects), เข้า Import DB mode แล้ว icon ไม่ค้าง, และยืนยันว่า
    `folder.create`/`project.create` ถูก reject ขณะ read ยังทำงานปกติ
- ทำไม: ผู้ใช้มี DraconDex เวอร์ชันเก่าเก็บเป็น branch บน GitHub
  (`v.2.1.1-dracondex`, `v.2.7.3-dracondex`) และไฟล์ตัวอย่าง v1.1.0/v1.2.2 —
  ต้องการให้ main เวอร์ชันล่าสุด import ไฟล์เก่าเหล่านั้นได้ แล้วเลือกได้ว่าจะ
  เปิดแบบ read-only (Import DB) หรือ merge เข้า Nexus Nest จริง — โครงสร้าง
  ทั้งสองทางเลือกมีอยู่แล้ว (v.3.11.0) ปัญหาคือไฟล์เก่าจริงยัง import ไม่ผ่าน
- Doc ที่อัปเดต: `docs/SYSTEMS.md` §Import/Export DB, `docs/CHANGELOG.md`
  (รายการนี้)

## 2026-07-20 — Nexus Nest tree: แก้ hover ขยาย box, rename autofocus, guide line ชิด icon (Plan part1)
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/hub.js`, `style.css`,
  `.claude/skills/run-dracondex/web-driver.mjs`
- อะไรเปลี่ยน:
  - **แก้ bug #1**: `.li:hover .acts{display:flex}` เผยปุ่ม `.btn-i` ขนาด
    28px ซึ่งสูงกว่าความสูงปกติของแถว (~22px) — เพราะ `.li` เป็น
    `display:flex;align-items:center` ไม่มี height คงที่ จึงยืดตัวสูงขึ้นทุกครั้งที่
    hover แถวใน Nest tree แทนที่จะแค่ไฮไลต์ เพิ่ม `.li .acts .btn-i{width:18px;
    height:18px}` ให้พอดีกับความสูงเดิม ไม่ยืด
  - **เพิ่ม #2**: `quickCreateModule()` (สร้าง module ใหม่แล้วเข้าโหมด rename
    อัตโนมัติ) ไม่เคย `.focus()/.select()` input ต่างจาก `startRenameModule()`
    (double-click เพื่อ rename เดิม) ที่ทำอยู่แล้ว — ดึง logic นั้นออกเป็นฟังก์ชัน
    ร่วม `focusRenameInput(id)` แล้วเรียกจากทั้งสองจุด ทำให้ module ที่เพิ่งสร้าง
    ได้ cursor + select-all guideword name ทันที พิมพ์ทับได้เลย
  - **ตรวจสอบ #3**: click นอก input ระหว่าง rename มีอยู่แล้ว (blur handler +
    `body.renaming-lock` CSS lock) — ทดสอบจริงผ่าน `run-dracondex` แล้วยืนยันว่า
    บันทึกชื่อและออกจากโหมดถูกต้อง ไม่ต้องแก้โค้ด
  - **แก้ #4**: เส้น guide line ของ nest tree (`.li.indentN::after`) เคยอยู่ที่
    `background-position` เท่ากับ `padding-left` ของแถวพอดี (26/42/58/74/90px)
    ทำให้แนบชิด icon จนดูเหมือนทับกัน ขยับออกมา 6px (20/36/52/68/84px) ให้มีช่องว่างเล็กน้อย
  - เพิ่มเครื่องมือ `web-driver.mjs`: stub `BrowserWindow.fromWebContents`,
    `ipcRenderer.on`, และคำสั่ง `hover` ที่ยังขาดอยู่ — แอปเดิมบูตไม่ผ่านใน
    web-driver เพราะ `window:getId` handler อ่าน `event.sender` จาก event ที่
    เป็น `null`
- ทำไม: ผู้ใช้รายงานว่าแถวใน Nest tree "ขยาย" เวลา hover, module ใหม่ต้องคลิก
  ก่อนถึงจะพิมพ์ชื่อได้, และเส้นแนวตั้งบอกลำดับชั้นไปชนกับ icon หลังจาก commit
  ก่อนหน้าขยับตำแหน่งเข้ามาใกล้เกินไป
- Doc ที่อัปเดต: `docs/CHANGELOG.md` (รายการนี้) — ไม่กระทบโครงสร้างใน
  `docs/SYSTEMS.md`/`docs/FILES.md` (การแก้เป็น CSS/behavior เล็กน้อยในฟังก์ชัน
  เดิมที่มีอยู่แล้ว)

## 2026-07-20 — ลดขั้นตอนเริ่มสร้าง Nexus
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/core.js`, `src/renderer/i18n.js`, `style.css`,
  `test/onboarding-tour.test.mjs`
- อะไรเปลี่ยน: ปุ่มสร้าง Nexus ใน welcome เปิดฟอร์มโดยตรง; เพิ่ม checkbox
  เลือกเปิด coach-mark หลังสร้าง และแก้ CSS ของ checkbox ใน form ไม่ให้ยืดเต็มบรรทัด
- ทำไม: ลด modal ซ้อนและคำถามที่ไม่อธิบายผลลัพธ์ แต่ยังคงให้ผู้ใช้เลือกทัวร์ได้
- Doc ที่อัปเดต: `docs/SYSTEMS.md` §2, `docs/FILES.md` core.js

## 2026-07-18 — Chronicler: แก้ bug zoom ของ Oneline view + เพิ่ม event inspector แบบ autosave (Plan part3)
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/mod/chronicler.js`, `src/renderer/timeline.js`,
  `src/renderer/modals.js`, `style.css`
- อะไรเปลี่ยน:
  - **แก้ bug #1**: ใน Oneline view เดิม เมื่อ zoom (wheel) กราฟ,
    `updateTimelineGraphX()` reposition เฉพาะจุด `[data-event-dot]`
    เท่านั้น — เส้น tick connector กับ text ชื่อ/วันที่ของแต่ละ event
    ไม่มี `data-*` attribute ใด ๆ เลยจึงค้างอยู่ตำแหน่งเดิม ทำให้จุดวงกลม
    เลื่อนหนีจาก label ของตัวเอง เพิ่ม `data-event-tick`/
    `data-event-label`/`data-event-date` (คีย์ `data-start-ts` เดียวกับจุด)
    แล้วให้ `updateTimelineGraphX()` reposition ทั้งกลุ่มพร้อมกัน
  - **เพิ่ม event inspector**: คลิกจุด event บนกราฟ (Oneline) หรือแถวใน
    event list (Downline) ไม่เปิด modal เดิมอีกต่อไป — เรียก
    `toggleChroniclerInspector(tlid, evId)` แสดงแผง inspector inline
    แก้ไขได้ (ชื่อ/วันเริ่ม-สิ้นสุด/สี/story) แบบ autosave (onchange +
    delegated click สำหรับ color picker) แทน — Oneline แสดงใต้กราฟ,
    Downline แสดงเป็น dropdown ใต้แถวที่กด
  - **เปิดได้ทีละอัน**: เก็บ event ที่เปิดอยู่เป็นค่าเดียว
    `chroniclerData.inspectorEventId` (ไม่ใช่ Set) — เปิดอันใหม่จะปิด
    อันเก่าอัตโนมัติ เพราะ `colorPicker()` ใช้ id ซ้ำ (`#sel-color`,
    `#cpicker-grid`, …) เปิดพร้อมกันสองอันจะชนกัน
  - `dateInputsHTML()` (modals.js) เพิ่ม param เสริม `onchangeFn` (default
    `''`, backward-compatible) สำหรับผูก autosave กับ input วันที่
  - CSS ใหม่: `.chr-insp-row`, `.chr-insp-body` (style.css)
- ทำไม: ตาม Plan.md part3 #1/#2/#2.1/#2.2 ที่ user กำหนด
- ตรวจสอบ: ขับแอปจริงผ่าน run-dracondex driver — สร้าง module kind
  chronicler + timeline + 5 events ช่วงปี 1000-2000, ยืนยัน zoom ไม่ทำให้
  tick/label หลุดจากจุดแล้ว (ภาพก่อน/หลัง), เปิด/แก้/ปิด inspector ทั้ง
  Oneline และ Downline สำเร็จพร้อม toast บันทึก + ยืนยันข้อมูลจริงใน DB
  ผ่าน `eval window.api.timeline.getEvents(...)`, ยืนยันเปิดได้ทีละแถวใน
  Downline (querySelectorAll('.chr-insp-row.open') เหลืออันเดียวเสมอ);
  `check.mjs` ไม่มี warning ใหม่จากไฟล์ที่แก้
- Doc ที่อัปเดต: docs/CHANGELOG.md (รายการนี้) — ไม่กระทบ
  docs/SYSTEMS.md/docs/FILES.md/docs/Architec.md เพราะ mapping
  kind↔file↔IPC เดิมไม่เปลี่ยน มีแค่พฤติกรรมภายใน chronicler.js/
  timeline.js ที่แก้

---

## 2026-07-17 — Cloud Sync: แยก backend ตามชนิด build (Supabase จริงเฉพาะ build ติดตั้ง, dev ใช้เซิร์ฟเวอร์ต้นแบบในเครื่อง)
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/sync-devserver.js` (ใหม่), `src/db/sync.js`,
  `src/renderer/sync.js`, `src/renderer/i18n.js`, `docs/SYNC.md`
- อะไรเปลี่ยน:
  - build ติดตั้ง/portable (`app.isPackaged`) ใช้ Supabase จริงตามเดิม;
    build dev (`npm start`/driver) ถูกปักหมุดไปที่เซิร์ฟเวอร์ต้นแบบ
    in-process ตัวใหม่ (`sync-devserver.js`) — endpoint/auth/error body
    เหมือน migration ทุกอย่าง, loopback + port สุ่ม, state เก็บเป็น
    `dev-sync-server.json` ในโฟลเดอร์ข้อมูล dev
  - โหมด dev ไม่อ่าน/ไม่ต้องตั้ง `sync:url`/`sync:anonKey` — หน้าต่างซิงก์
    ข้ามหน้าตั้งค่าเซิร์ฟเวอร์ ซ่อนปุ่มตั้งค่า และแสดงป้าย "เวอร์ชัน dev"
    (i18n คีย์ใหม่ `syncDevServer` ครบ 18 locale)
- ทำไม: ตามที่ user กำหนด — sync จริงใช้กับตัวติดตั้งเท่านั้น ส่วนเวอร์ชัน
  dev ให้มี prototype sync ทดสอบ flow ได้ครบโดยไม่ต้องมีโปรเจกต์ Supabase
- ตรวจสอบ: E2E dev-mode ผ่าน web-driver — server เริ่มเอง, push→link→pull
  ครบ, สถานะ/ป้าย dev แสดงถูก (screenshot), ไฟล์ state ถูกเขียน; check.mjs
  0 warning ใหม่
- Doc ที่อัปเดต: docs/SYNC.md (ตาราง build mode + ไดอะแกรม §2.1),
  docs/FILES.md (แถว sync-devserver.js)

## 2026-07-17 — Cloud Sync (Supabase) prototype: ซิงก์ Nexus vault + คีย์เข้าถึง
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/sync.js` (ใหม่), `src/renderer/sync.js` (ใหม่),
  `supabase/migrations/20260717000000_dracondex_sync_prototype.sql` (ใหม่),
  `docs/SYNC.md` (ใหม่), `main.js`, `preload.js`, `database.js`, `index.html`,
  `src/renderer/core.js`, `src/renderer/i18n.js`, `style.css`
- อะไรเปลี่ยน:
  - ฟีเจอร์ซิงก์ vault ขึ้น Supabase แบบ snapshot ทั้งก้อน (last-write-wins):
    ปุ่ม ☁ ใน vault-head เปิดหน้าต่างซิงก์ 3 สถานะ (ตั้งค่าเซิร์ฟเวอร์ /
    Push ครั้งแรก+เชื่อมด้วยคีย์ / เชื่อมแล้ว Push-Pull-สร้างคีย์-ยกเลิก)
  - คีย์เข้าถึงรูปแบบ `Xxxx-Xxxx-Xxxx-Xxxx` (4 กลุ่ม × 4 alphanumeric)
    สร้างฝั่งเครื่อง แสดงครั้งเดียว เซิร์ฟเวอร์เก็บ sha-256; role
    owner (push+pull) / read (pull อย่างเดียว)
  - ฝั่งเซิร์ฟเวอร์เป็น migration SQL ไฟล์เดียว: ตาราง `sync_vault`/`sync_key`
    RLS ล็อกไม่มี policy + RPC SECURITY DEFINER 5 ตัวเป็นทางเข้าเดียว
  - `src/db/sync.js`: serializeVault (lookup FK → natural key),
    applySnapshot (wipe-and-rebuild + id remap ใน transaction แล้ว rebuild
    wiki index), fetch ทั้งหมดอยู่ main process — จุดแรกของแอปที่มี network call
  - i18n เพิ่ม 41 คีย์ `sync*` ครบ 18 locale; CSS block `.sync-*`
- ทำไม: ต้นแบบ (prototype) แชร์/สำรอง vault ข้ามเครื่องผ่านคลาวด์ ตามแผน
  ที่ user กำหนด — จำกัดขอบเขตไว้ที่ snapshot sync ไม่มี merge/conflict UI
- ตรวจสอบ: `check.mjs` ผ่าน (0 warning ใหม่, i18n parity ครบ), E2E ผ่าน
  web-driver + mock RPC (push→link→pull ครบ, id remap ถูก, read key ถูกกัน
  push, คีย์ผิดถูกปฏิเสธ) — migration จริงยังไม่ได้ apply ขึ้น Supabase
  (user เลือกข้ามการใช้ MCP; รัน SQL เองได้ตาม docs/SYNC.md §1.1)
- Doc ที่อัปเดต: docs/SYNC.md (ใหม่ทั้งไฟล์), docs/SYSTEMS.md §10 (หัวข้อ
  Cloud Sync), docs/FILES.md (ตาราง "Cloud Sync — ไฟล์ใหม่")

## 2026-07-17 — Nexus Nest hub: reparent drag-drop, Create submenu, home button, hub scroll fixes
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/hub.js`, `src/renderer/builder.js`,
  `src/renderer/core.js`, `style.css`, `.claude/skills/run-dracondex/web-driver.mjs`,
  `Plan.md`
- อะไรเปลี่ยน:
  - `onNestDrop` (hub.js) เอาข้อจำกัด `isLockedToParent` ออก — โมดูลที่มี
    parent อยู่แล้วเคยลาก reorder ได้แค่ในกลุ่มพี่น้องเดิม ตอนนี้ลากออกไป
    top-level หรือไปเป็นลูกของโมดูลอื่นได้เหมือน top-level module (กันแค่
    ลากเข้า subtree ตัวเอง ผ่าน `isSelfOrDescendant` เดิม)
  - `buildModuleContextMenuHtml` (hub.js): เปลี่ยน kind-list แบนราบบนสุดเมนู
    (เฉพาะ Major module) เป็นปุ่ม "Create" เดียวที่เปิด hover submenu แทน
    (`openCreateSubmenu`/`positionSubmenuNear`/`scheduleCtxSubmenuClose`,
    CSS ใหม่ `.kli-submenu-parent`/`.kli-arrow`/`.ctx-submenu`)
  - เพิ่มปุ่ม home บน nav rail (`goToNexusNestHub`, ไอคอนใหม่ `I.home` ใน
    core.js) กลับไปหน้า welcome ของ Hub จากตรงไหนก็ได้ — ต่างจาก
    `#nav-logo-btn` ที่ "return" เฉพาะตอนอยู่ในโมดูลเดิมแบบเต็มหน้า
    (`S.activeModule`) ไม่ครอบคลุม v3 module node ที่โฟกัสอยู่ใน Builder
  - **บั๊ก**: เปิด legacy view (เช่น Scribe, หรือ Nexus picker ตอนยังไม่มี
    nexus) แล้วกลับมา Nexus home จะเห็น pane ของ view เดิมค้างอยู่ใต้
    Builder pane ปิดไม่ได้ — root cause: `pruneStaleLayoutElements`
    (builder.js) กวาดแค่ `.bpane`/`.bsplit` ที่ stale จาก layout tree เดิม
    ไม่เคยกวาด child อื่นของ `#main-inner` ที่ legacy view เขียนทับ
    `innerHTML` ตรงๆ ทิ้งไว้ — แก้โดยกวาด child ที่ไม่ใช่
    `.bpane`/`.bsplit` ออกทุกครั้งก่อน re-render grid
  - Hub accordion (Nest/Sage Hut/Import Dock) แต่ละ section ได้ scrollbar
    ของตัวเอง — `#hub-body` เป็น flex column, `.acc-body` ที่เปิดอยู่ได้
    `flex:1 1 0;overflow-y:auto` แชร์พื้นที่เท่าๆ กัน แทนที่จะ scroll รวม
    กันเป็นหน้าเดียวผ่าน `#left-panel-inner` เหมือนเดิม (ลำดับ section เอง
    ตรวจสอบซ้ำแล้วว่าถูกต้องอยู่แล้วจาก fix รอบก่อน ไม่ได้แก้เพิ่ม)
  - `web-driver.mjs`: พอร์ต `dragto`/`rclick` มาจาก `driver.mjs` (mouse
    down/move/up จริง ไม่ใช่ synthetic dispatchEvent) — ต้องใช้ยืนยัน
    drag-reparent กับ context-menu submenu ข้างต้นตอน Electron binary
    โหลดไม่ได้ใน sandbox นี้
- ทำไม: `Plan.md` รอบใหม่ (แยกจาก "Plan.md rollout complete" รอบก่อน) ขอ
  ฟีเจอร์/บั๊กฟิกซ์ 6 อย่างนี้บน Nexus Nest hub
- Doc ที่อัปเดต: `docs/Architec.md` §1.2 (Hub) และ §1.4 (Builder),
  `docs/FILES.md` (แถว `hub.js`/`builder.js`/`web-driver.mjs`) —
  `docs/SYSTEMS.md` ยังไม่มีหัวข้อ v3 Hub/Builder เลย (ช่องว่างเดิมจากรอบ
  ก่อน ไม่ใช่งานรอบนี้ ยังไม่ได้ backfill)

## 2026-07-16 — เอกสารสถาปัตยกรรม v3 module system (Architec.md rewrite)
- commit: 17be1d6..f3fe2f9 (ครอบคลุม 93a4187, 5aeb175, และก่อนหน้า — "Phase 1"
  ถึง "Phase 24" + "Part 1"/"Part 2" ทั้งหมด, git log เต็มอยู่ใน
  `.claude/skills/write-docs/docs-diff.sh` output ของรอบนี้), doc เอง: uncommitted
- ไฟล์ที่แก้: `docs/Architec.md` (เขียนใหม่ทั้งไฟล์), `docs/FILES.md`
  (เพิ่มหัวข้อ "v3 Module System — ไฟล์ใหม่"), `docs/SYSTEMS.md` (เพิ่ม
  หมายเหตุชี้ไป Architec.md ในหัวไฟล์และย่อหน้าเปิด) — **ไม่มีการแก้โค้ดแอป**
  ในรอบนี้ เป็นการซิงก์เอกสารให้ตรงกับโค้ดที่เปลี่ยนไปแล้วในรอบก่อนหน้า
- อะไรเปลี่ยน (ในแอป, สำรวจย้อนหลัง — ไม่ใช่งานที่ทำรอบนี้): เพิ่มระบบ
  "v3 module system" ทั้งชุดอยู่ข้างๆ 7 โมดูลเดิมแบบ additive — Nexus
  module tree แบบ generic (ตาราง `module`, ซ้อนได้ไม่จำกัดชั้น, 15 kind:
  collector/manager/inspector/classifier/locator/chronicler/wanderer/
  narrator/author/scribe/drafter/viewer/connector/sketcher/designer),
  Hub (nest tree + accordion Nest/Sage Hut/Import Dock + pin + context
  menu), Builder (split-pane 1/2/4 พร้อมประวัติต่อ pane), Module Inspector
  (แอตทริบิวต์/แท็ก/ลิงก์/version history), Icon picker, Import Dock,
  legacy migration (`migrate_v3.js` — ไม่แตะข้อมูลเดิม), Artisan เปลี่ยนจาก
  one-shot template เป็น wizard ประกอบ module v3 ทีละหน้า, ปุ่ม nav rail
  ของ Director/Navigator/Hero/Writer ถูกซ่อน (เข้าถึงผ่าน Artisan/migrate
  เท่านั้น) ส่วน Scribe/Sage/Artisan ยังเป็นปุ่มปกติ; โค้ด/DB/IPC เดิมของ
  ทั้ง 7 โมดูลไม่ถูกลบหรือแก้ ยังทำงานได้ครบ
- ทำไม: ผู้ใช้ขอ "update architec in doc" — `docs/Architec.md` เดิมอ้างอิง
  โค้ด ณ 2026-07-07 ก่อนรอบ v3 ทั้งหมด ทำให้ตกยุคไป 24 phase; `procress.md`
  เองก็ทิ้งธงไว้ว่า `docs/SYSTEMS.md`/`docs/FILES.md` ไม่ครอบคลุม v3 เลย
- ขอบเขตของรอบนี้: `docs/Architec.md` ได้รับการเขียนใหม่แบบละเอียด (kind
  ↔ ไฟล์ ↔ IPC ครบทุกตัว, สำรวจโค้ดจริงทุกไฟล์ที่เกี่ยวข้อง); `docs/FILES.md`
  และ `docs/SYSTEMS.md` ได้แค่หมายเหตุชี้ทาง + ตารางไฟล์ใหม่ระดับสรุป — ยัง
  **ไม่ได้** ขยายทุกหัวข้อพฤติกรรม (§3–§9 ของ SYSTEMS.md) ให้ครอบคลุม v3
  แบบละเอียดเท่าโมดูลเดิม เพราะเป็นงานใหญ่เกินขอบเขตคำขอนี้ (24 phase) และ
  ต้องรันแอปจริงยืนยันพฤติกรรมทีละ kind ตามหลักของสกิลนี้ — ทิ้งเป็นงาน
  ต่อยอดถ้าต้องการ
- ทดสอบ: อ่านโค้ดจริงทุกไฟล์ที่อ้างถึงใน Architec.md (schema ใน core.js,
  module.js, migrate_v3.js, hub.js, builder.js, inspector.js, mod/*.js
  ทุกไฟล์, IPC ใน main.js/preload.js) ไม่ได้รันแอปยืนยัน UI เพราะเป็นงาน
  เอกสารเชิงโครงสร้างไม่ใช่พฤติกรรม
- Doc ที่อัปเดต: docs/Architec.md (เขียนใหม่ทั้งไฟล์), docs/FILES.md
  (หัวข้อใหม่ก่อน src/db/), docs/SYSTEMS.md (หมายเหตุหัวไฟล์)

---

## 2026-07-05 — Obsidian-like rework: Nexus vault, Scribe, Wikilink/Backlinks, IDE shell, Quick switcher, Graph view
- commit: 167782c, bab5474, ddccdd7, 5426685, 17be1d6 + งาน hardening เป็น uncommitted
- ไฟล์ที่แก้/เพิ่ม: `src/db/core.js` (schema+migration v2.8+import-merge), `src/db/nexus.js` `src/db/scribe.js` `src/db/wiki.js` (ใหม่), `src/db/director.js` `src/db/navigator.js` `src/db/hero.js` `src/db/writer.js` (nexus scoping + wiki hooks), `main.js` `preload.js` `database.js` (namespace ใหม่ `nexus:` `note:` `wiki:`), `index.html` (script tag ใหม่, ปุ่ม rail Explorer/Scribe, `#status-bar`), `src/renderer/core.js` (nexus home 2 ระดับ, openEntityByKey, explorer/status bar/shortcuts), `src/renderer/markdown.js` `src/renderer/mdeditor.js` `src/renderer/scribe.js` `src/renderer/explorer.js` `src/renderer/quickswitch.js` (ใหม่), `src/renderer/director.js` `src/renderer/writer.js` `src/renderer/sage.js` `src/renderer/relation.js` `src/renderer/map.js` `src/renderer/modals.js` (ปรับ), `src/renderer/i18n.js` (+~65 key × 18 ภาษา), `style.css`, `vendor/` (ใหม่ — d3.min.js, konva.min.js), `.claude/skills/run-dracondex/web-driver.mjs` (ใหม่)
- อะไรเปลี่ยน:
  1. **Nexus vault** — ตาราง `nexus` + `nexus_ref` ใน 4 ตาราง project-root, migration adopt ข้อมูลเก่าเข้า vault เริ่มต้นอัตโนมัติ, หน้า home เป็น vault picker → การ์ด 7 โมดูล, ทุกโมดูล scope ตาม vault ที่เปิด
  2. **Scribe** — โมดูลโน้ต markdown ใหม่ (note_folder ซ้อนได้ + note unique ต่อ vault), parser markdown เขียนเอง, editor กลาง (`createMarkdownEditor`) มี autosave/preview/backlinks/`[[` autocomplete
  3. **Wikilink + Backlinks** — ตาราง `wiki_link` index `[[Name]]` ที่ resolve ตอน save (ลำดับ precedence ตายตัว), `openEntityByKey` เป็นจุดเดียวที่นำทางไป entity, อัปเกรดโน้ตของ Director object และ chapter ของ Writer ให้รองรับ wikilink/preview
  4. **IDE shell** — explorer tree รวมทุกโมดูล, status bar, shortcut (Ctrl+P/E/N/W/Tab)
  5. **Quick switcher (Ctrl+P)** — fuzzy subsequence search ข้าม entity ทั้ง vault
  6. **Graph view** — `wiki:getGraph` ต่อยอด `buildSageGraph` เดิมของ Sage ให้ Scribe ใช้ร่วมกัน (opts ใหม่แบบ backward-compatible)
  7. **Hardening** — vendor D3/Konva ไว้ใน repo (CDN เหลือเป็น fallback), ขยาย import-merge ให้รวม nexus/note + rebuild wiki index, rename safety (เขียนทับ `[[ชื่อเก่า]]`→`[[ใหม่]]` ในทุก source ที่อ้างถึง + auto-resolve ลิงก์ค้างเมื่อสร้าง entity ชื่อตรงกัน)
- ทำไม: ผู้ใช้ขอให้ DraconDex มีความสามารถแบบ Obsidian — vault, IDE-like UI,
  markdown editor, wikilink/backlinks, graph, quick switcher — ตามแผนที่วางไว้ที่
  `/root/.claude/plans/obsidian-tingly-dusk.md`
- ทดสอบ: ทุก phase ผ่าน `.claude/skills/run-dracondex/web-driver.mjs` (Electron
  binary โหลดไม่ได้ใน sandbox นี้ — proxy บล็อก GitHub releases) รวมถึง DB-layer
  harness แยกสำหรับ migration/CRUD/wiki-resolve/import-merge
- Doc ที่อัปเดต: docs/SYSTEMS.md §2 (Nexus ขยาย), §2b–§2d (ใหม่: Scribe, Wikilink,
  IDE shell), §3/§7/§10 (Director note, Writer chapter, vendor libs, import-merge),
  docs/FILES.md (root files, src/db/, src/renderer/ ทั้งหมด)

---

## 2026-07-04 — เขียน doc ระบบ + รายไฟล์ครั้งแรก, สร้างสกิล write-docs
- commit: ff258d6 (ฐานที่ใช้สำรวจ) + งานเอกสารเป็น uncommitted
- ไฟล์ที่แก้/เพิ่ม: `docs/SYSTEMS.md` (ใหม่), `docs/FILES.md` (ใหม่), `docs/CHANGELOG.md` (ใหม่),
  `.claude/skills/write-docs/` (ใหม่ — SKILL.md, docs-diff.sh, mark-synced.sh)
- อะไรเปลี่ยน: ไม่มีการแก้โค้ดแอป — เป็นการสำรวจโค้ดทั้งหมด (main.js, preload.js,
  database.js, src/db/*.js ทั้ง 12 ไฟล์, src/renderer/*.js ทั้ง 14 ไฟล์) แล้วรันแอปจริง
  ผ่าน `.claude/skills/run-dracondex/driver.mjs` ไล่ทดสอบทั้ง 6 โมดูล เพื่อยืนยัน
  พฤติกรรมก่อนเขียนลง doc
- ทำไม: ผู้ใช้ขอเอกสารอธิบายการทำงานของแต่ละระบบและแต่ละไฟล์ ทั้งเก่าและใหม่ ให้ตรงกับ
  โค้ดจริง (memory ของโปรเจกต์ที่มีอยู่เดิมอ้างเวอร์ชัน/ไฟล์ที่เก่าไปแล้ว)
- Doc ที่อัปเดต: สร้างใหม่ทั้งหมด (SYSTEMS.md, FILES.md, CHANGELOG.md) — เป็น baseline
  ให้รายการถัดไปอ้างอิง diff จากจุดนี้
- บั๊กที่พบระหว่างทดสอบ (บันทึกไว้ใน SYSTEMS.md §11 ด้วย): crash แฝงใน
  `openObjectModal()` เมื่อไม่มี category (modals.js:159), auto-translate
  ทับชื่อข้อมูลผู้ใช้ที่ตรงกับ i18n key, ข้อความ UI ภาษาไทยตกหล่นบางจุดใน
  Navigator/Sage
