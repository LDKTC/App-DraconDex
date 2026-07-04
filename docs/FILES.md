# DraconDex — เอกสารรายไฟล์ (มีอะไร ทำงานยังไง)

> คู่กับ [SYSTEMS.md](SYSTEMS.md) ซึ่งอธิบายภาพรวมของแต่ละระบบ — ไฟล์นี้ไล่ทีละไฟล์
> ตัวเลขจำนวนบรรทัดเป็นค่าโดยประมาณ ณ 2026-07-04

## โครงสร้างรีโป

```
App-NovelManager/
├─ main.js            ← Electron main process + IPC handlers ทั้งหมด
├─ preload.js         ← สะพาน window.api (contextBridge)
├─ database.js        ← รวม export ของ src/db/*
├─ index.html         ← โครง HTML เปล่า + โหลดสคริปต์เริ่มต้น 5 ตัว
├─ style.css          ← สไตล์ทั้งแอป + ธีมทั้งหมด
├─ start.js           ← ตัวรัน npm start
├─ ensure-electron.js ← ตรวจ/ซ่อม Electron binary (postinstall)
├─ src/
│  ├─ db/             ← ชั้นฐานข้อมูล (main process) 12 ไฟล์
│  └─ renderer/       ← ชั้น UI (renderer) 14 ไฟล์
├─ scripts/finish-portable.mjs
├─ Image/             ← ไอคอน/โลโก้
├─ flutter_app/       ← Flutter port (front-end แยก ใช้ schema เดียวกัน)
├─ tmp-user-data/     ← ข้อมูล dev จริง (npm start)
└─ tmp-driver-data/   ← ข้อมูล scratch ของ driver ทดสอบ (gitignored)
```

---

## ไฟล์ระดับ root

### main.js (~450 บรรทัด) — Main process
- **บรรทัด 1–41**: เลือกโฟลเดอร์ข้อมูลตาม build flavor (dev → `tmp-user-data/`
  หรือ `DRACONDEX_DATA_DIR`; portable → ข้าง exe; installer → appData) แล้วตั้ง
  `userData` + single-instance lock ต่อ data dir
- **บรรทัด 43–71**: สร้างหน้าต่าง frameless 1280×800 (`contextIsolation`,
  preload) + เมนู View (ซ่อนอยู่ แต่คง accelerator DevTools)
- **บรรทัด 73 เป็นต้นไป**: helper `h(channel, fn)` ลงทะเบียน `ipcMain.handle`
  พร้อม log error แล้วประกาศ handler ทุกช่องแบบบรรทัดเดียวจบ เรียงตาม namespace:
  `db:` (export/import ผ่าน dialog), `folder: project: category: template:
  object: color: timeline: relation: map: hashtag: search:` (Director),
  `world:` (Navigator), `game:` (Hero), `write:` (Writer), `artisan:`,
  `sage:`, `window:` (ปุ่มย่อ/ขยาย/ปิดของ title bar)
- ไม่มี business logic ในไฟล์นี้ — ทุก handler ส่งต่อ `db.<fn>()` ทันที

### preload.js (~340 บรรทัด) — สะพาน IPC
- `contextBridge.exposeInMainWorld('api', {...})` — mapping 1:1 กับช่อง IPC
  ใน main.js จัดกลุ่มเป็น namespace (`api.project.create(...)` →
  `invoke('project:create', ...)`)
- เป็น "สารบัญ API" ที่ดีที่สุดของแอป: อยากรู้ว่า renderer ทำอะไรกับ DB ได้บ้าง
  ให้เปิดไฟล์นี้

### database.js (29 บรรทัด)
- require `src/db/*` ทั้ง 12 ไฟล์แล้ว spread รวมเป็น object เดียว export ให้
  main.js ใช้

### index.html (~235 บรรทัด)
- โครงคงที่: `#nav-sidebar` (ปุ่ม rail ทุกโมดูล — ส่วนใหญ่ `display:none`
  รอ JS เปิดตาม state), `#left-panel` (+ ปุ่มย่อ), `#main-area`,
  `#modal-overlay/#modal`, `#toast`, `#search-bar` (`#search-input`)
- ท้ายไฟล์โหลดแค่ 5 สคริปต์: `i18n.js → core.js → director.js → modals.js →
  search.js` (ลำดับสำคัญ: i18n ต้องมาก่อน) — โมดูลอื่น lazy-load
- เนื้อหาเกือบทั้งหมดของหน้าถูกสร้างด้วย JS ตอนรัน — grep hendler จาก
  `src/renderer/*.js` ไม่ใช่จากไฟล์นี้

### style.css (~85KB)
- สไตล์ทั้งแอป + นิยามธีมทั้งหมดเป็นชุดตัวแปร CSS (`--bg --t1 --accent ...`)
  ต่อธีม, คลาสคอมโพเนนต์กลาง (`.btn .btn-p/.btn-s/.btn-g/.btn-d`, `.li`,
  `.fg`, `.ph`, `.empty`, `.module-item`, `.artisan-card`, `.wchap-*` ฯลฯ)

### start.js (31 บรรทัด)
- `npm start` → ตรวจ Electron binary ผ่าน `ensure-electron.js` แล้ว spawn
  Electron ด้วยรีโปเป็น app path (ลบ env `ELECTRON_RUN_AS_NODE` ก่อน)

### ensure-electron.js (~100 บรรทัด)
- หา/ตรวจความครบของ `node_modules/electron/dist/electron.exe` — ถ้าเสีย/หาย
  จะรัน installer ของแพ็กเกจ electron ใหม่; ใช้เป็น `postinstall` และถูก driver
  ทดสอบใช้ด้วย

### scripts/finish-portable.mjs
- ขั้นตอนท้าย `npm run build:portable`: เปลี่ยนชื่อ `win-unpacked` →
  `DraconDex-<version>` แล้วพิมพ์ขนาด/วิธีใช้

### package.json
- v2.7.1, dependency runtime ตัวเดียวคือ `node-sqlite3-wasm` (dev:
  electron, electron-builder, playwright-core สำหรับ driver)
- config `build` ของ electron-builder: asar, ไฟล์ที่ pack, target `dir` /
  `portable` / `nsis` (สคริปต์ `build:portable` / `build:exe` /
  `build:installer`)

### ไฟล์ note อื่น ๆ
- `Plan.md`, `Install-Guide.txt`, `cmd-note.txt` — โน้ตผู้พัฒนา/วิธีติดตั้ง
- `.claude/skills/run-dracondex/` — driver อัตโนมัติ (Playwright `_electron`)
  ใช้รัน/ทดสอบแอปกับ data dir แยก

---

## src/db/ — ชั้นฐานข้อมูล (รันใน main process)

ทุกไฟล์ pattern เดียวกัน: `getDB()` จาก core แล้ว export ฟังก์ชัน query ตรง ๆ
(prepared statement ต่อครั้ง) — ชื่อฟังก์ชันตรงกับ handler ใน main.js

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `core.js` | 1238 | เปิด/adapt DB, **schema ทั้งหมด ~75 ตาราง**, migrations (legacy Navigator, Hero v2.6, Writer v2.7), seed สัญลักษณ์, `ensureIndexes()`, export/import-merge |
| `director.js` | 146 | folder / project / project_description / category / template / object / attribute + `searchAll` (ค้นหา global) |
| `color.js` | 27 | ตาราง `use_color`: getAll/add/markUsed/getRecent/delete |
| `timeline.js` | 68 | timeline / `getOrCreateDate` (normalize วันที่สมมุติ) / event CRUD + story |
| `map.js` | 34 | map / area / จุด polygon (`setPoints` ลบ-แทรกใหม่ทั้งชุด) |
| `relation.js` | 126 | relation_type + relation 3 ชนิด (OBOB/OBTL/TLTL) + query รวม object/event ของโปรเจกต์ + ลิงก์ของ event |
| `hashtag.js` | 67 | ตาราง hashtag + mapping project/object/event + query "ใครใช้แท็กนี้" |
| `navigator.js` | 445 | ทุกอย่างของ World: world CRUD, เชื่อมนิยาย, ตัวละครโลก+ลิงก์, category/object/template/attr ของโลก (orig_*), world description, world tags, map timeline + การวาง object บนแผนที่ต่อเหตุการณ์, symbol collection |
| `hero.js` | 388 | ทุกอย่างของ Game: เกม, novel link (unique ต่อนิยาย), import category/object, ตัวละคร+template มี level+attr+element, collection+element+template+attr, story/dialogue/conversation/storyline, แท็กเกม |
| `writer.js` | 196 | write project / series / book / chapter (+เนื้อหา+ลำดับ) / novel link / wiki / word link / note / chat |
| `sage.js` | 200 | query สถิติ read-only 4 ชุด: dataSize, objectAmounts, linkerList, linkerGraph (nodes+edges ข้ามโมดูล) |
| `artisan.js` | 82 | `artisanCreateNovel/World/Game/Write` — รับ `base` (ชื่อ ฯลฯ) + `spec` (โครงจากเทมเพลต) สร้างทุกแถวใน transaction เดียว |

---

## src/renderer/ — ชั้น UI

ทุกไฟล์เป็น global function (ไม่มี module system) เรียก DB ผ่าน `window.api`
render เป็น HTML string ลง `#left-panel-inner` / `#main-inner`

### i18n.js (1580 บรรทัด) — โหลดก่อนทุกไฟล์
- ตาราง `L` แปล UI key 18 ภาษา + รายชื่อภาษาใน picker + ตาราง `TX`
  (dictionary แปลข้อความ hardcode ไทย/อังกฤษ → ภาษาอื่น รวมภาษาสมมุติ `qd`)
- ไม่มี logic — logic การแปลอยู่ใน core.js (`t()`, `tr()`,
  `translateCommonUiText()`)

### core.js (1253 บรรทัด) — โครงหลักของ renderer
- **State**: object `S` (view, activeModule, project/category/object,
  world/game/write state, แท็บ, settings) + `loadUiSettings/saveUiSettings`
  (localStorage: ธีม, ภาษา, ขนาด UI)
- **บูต**: `init()` (DOMContentLoaded) → โหลด settings/สี → `bindNav`,
  `bindWindowChrome` (ปุ่ม min/max/close), `renderNexusHome`
- **Routing**: `selectModule()` / `switchView()` + `loadModule()` (lazy-load
  สคริปต์โมดูล), การโชว์/ซ่อนปุ่ม rail (`updateModuleSubNav`,
  `MODULE_SUBNAV` = subtab ของ hero/writer/sage)
- **แท็บ title bar**: `upsertProjectTab/upsertEntityTab/switchProjectTab/
  switchEntityTab/close*` (Director เปิดเป็น project tab; Hero/Writer เปิดเป็น
  entity tab)
- **คอมโพเนนต์กลาง**: `openModal/closeModal`, `toast`, `uiConfirm`,
  `colorPicker` (+wheel `pickColor/addColorFromPicker`), `symbolPicker`,
  `hashtagSelector` + ฟังก์ชันชิปแท็กใน modal, novel picker แบบ tree
- **i18n runtime**: `t()`, `tr()`, `translateStaticChrome`,
  `translateCommonUiText`, `observeUiLanguage` (MutationObserver)
- **เมนูตั้งค่า**: `renderSettingsMenu/setUiSetting` (ธีม+swatch, ภาษา,
  สไลเดอร์ขนาด), `exportDatabaseFile/importDatabaseFile`
- `renderNexusHome()` การ์ด 6 โมดูล, `reloadSidebar/renderSidebar`

### director.js (644 บรรทัด)
- sidebar โปรเจกต์ (`renderProjectSidebar`, โฟลเดอร์พับได้ `tglFolder`),
  `selectProject/activateProject`, `renderProject`
- body ของ category: `renderCatBody` มุมมองรายการ/ตาราง, inline edit
  (`bindTableInlineEditors`), ซ่อนคอลัมน์ (`openColumnVisibilityModal`),
  `sortTable`
- detail ของ object: `buildDetail/renderDetail` — field autosave
  (`saveAttrs`, `bindDetailAutoSave`), โน้ต (`saveNote`), relation ของ object
  (`getObjectRelationRows`), แท็ก (`openObjectTagsModal`)

### modals.js (461 บรรทัด)
- modal + create/save/delete ของฝั่ง Director ทั้งหมด: folder (`#fn`),
  project (`#pn`), description (`#dn/#dt`), category (`#cn`),
  template/Fields (`#tnew`), object (`#on`), timeline (`#tn`),
  event (`#ev-n`, วันที่ `#ev-s-*`/`#ev-e-*`, `#ev-story`, ลิงก์ event↔event),
  relation type (`#rt-n`), relation 3 ชนิด (`#rel-from/#rel-to/#rel-type`),
  hashtag (`#ht-n`)
- `dateInputsHTML(prefix,...)` สร้างช่องวันที่ DD/MM/YYYY HH:mm ที่ใช้ร่วม

### search.js (55 บรรทัด)
- ผูก `#search-input` → `api.search.all(q)` → render ผลแยกกลุ่ม (โปรเจกต์ /
  object / แท็ก) คลิกแล้วกระโดดไป (`selectSearchProject/Object/Hashtag`)

### timeline.js (343 บรรทัด)
- sidebar รายการ timeline (`selectTimeline`), กราฟ SVG การ์ดเหตุการณ์
  (`renderTimelineDetail` — จุด/เส้น/foreignObject คลิกได้), รายการเหตุการณ์ +
  textarea สตอรี่ (`saveEventStory`), zoom/scroll บนแกนเวลา

### relation.js (602 บรรทัด)
- `renderForceGraph` (force simulation เอง + Konva canvas, `ensureKonva`
  โหลด Konva ครั้งแรก), whiteboard 3 มุมมอง (`renderCategoryWhiteboard/
  renderObjectWhiteboard/renderProjectWhiteboard` + `switchRelViewMode`),
  ลาก node (`startNodeDrag`), โน้ตของ node (`showRelationNodeNote`),
  รายการ relation ด้านล่าง + ปรับความสูง (`startRelListResize`)

### map.js (382 บรรทัด)
- `renderMapView` — sidebar รายชื่อแผนที่, canvas พื้นที่ polygon ต่อ area,
  เครื่องมือ (`setMapTool` เลือก/เพิ่มจุด/ลบ), modal map/area, บันทึกจุดผ่าน
  `api.map.setPoints`

### hashtag.js (140 บรรทัด)
- หน้าแท็ก global (`renderHashtagView` — เพิ่ม/แก้), หน้า Project Tags
  (`renderProjectHashtagView` — เลือกแท็กเพื่อดู object/event ที่ใช้) และหน้า
  จัดการสี (`renderColorSettings` — wheel + ลบสี)

### navigator.js (1803 บรรทัด — ใหญ่สุด)
- `renderNavigatorView` (รายชื่อโลก) / `selectWorld` / `renderWorldSidebar`
  + `renderWorldMain` ตาม `S.worldTab` (original / chars-cats /
  maps-timeline / tags)
- world CRUD (`openWorldModal/saveWorld`), เชื่อมนิยาย
  (`openAddNovelModal/addWorldNovel`, ปักดาว char-category
  `toggleNovelCharCat`), category/object/field ของโลก (`*WorldOrig*`),
  world description, ตัวละครโลก (`openWorldCharModal/saveWorldChar`,
  สัญลักษณ์ `saveCharSymbol`, ลิงก์ object `addCharLink`), map timeline
  (สร้าง timeline บนแผนที่นิยาย, เพิ่มเหตุการณ์, ลากวางตัวละคร/object เป็นจุดบน
  แผนที่), แท็กของโลก

### hero.js (1086 บรรทัด)
- `renderHeroView` (รายชื่อเกม) / `selectGame` / `setGameTab`
- หน้า project: ตัวละคร (`openCharModal`), Fields มี level
  (`openHeroTemplatesModal`, `saveHeroAttr`), element ต่อตัวละคร
  (`openCharElementsModal`), คอลเลกชัน+element (`openCollectionModal/
  openElementModal`), หน้าสถิติ
- หน้า story: whiteboard โหนดบทสนทนา (ลากได้ บันทึกพิกัด), เส้น storyline +
  สัญลักษณ์ (`openStorylineIconModal`), บทสนทนาในโหนด (`saveGameConv`,
  เรียงลำดับ)
- หน้า novel link (import category/object จากนิยาย), หน้า tags

### writer.js (786 บรรทัด)
- โครงสร้าง 3 ชั้น: `renderWriteProjectList` (โปรเจกต์+ซีรีส์ พับได้) →
  `renderWriteProject`/`renderWriteBookGrid` (เล่ม) → `renderWriteBookPage`
  (รายการตอน + editor)
- editor: `renderWriteChapterEditor` — textarea `#wchap-text` + backdrop
  ไฮไลต์ word link, autosave debounce 800ms, ลากเลือกคำ → ปุ่มลอยสร้างลิงก์
  (`openCreateLinkModal/createWlinkForObject`)
- tab novel link/วิกิ (`renderWriteNovelLink`, `openWriteWikiModal`),
  tab chat note (`renderWriteChatnote`, `submitWriteChat`)
- modal ทั้งหมดของโมดูล (project `#wp-name`, series `#ws-name`, book
  `#wb-name`, chapter `#wc-name`, note `#wn-name`)

### sage.js (375 บรรทัด)
- `renderSageView/setSageTab` + หน้าละฟังก์ชัน: `renderSageDataSize` (การ์ด),
  `renderSageObjectAmount` (ตาราง), `renderSageLinkerList` (ตารางลิงก์),
  `renderSageLinkerGraph` + `buildSageGraph` (force-graph + checkbox กรองโมดูล)

### artisan.js (258 บรรทัด)
- `ARTISAN_TARGETS` + `artisanTemplates(target)` — นิยามเทมเพลตทั้งหมด
  (ชื่อ/คำอธิบาย/preview chip/ฟังก์ชัน `build(name)` คืน spec) โดยดึงข้อความผ่าน
  `t()` → **สร้างข้อมูลตามภาษา UI ปัจจุบัน**
- `renderArtisanView` (เลือกเป้าหมาย) → `renderArtisanMain` (การ์ดเทมเพลต) →
  `openArtisanCreateModal` (`#art-name/#art-code/#art-memo`) →
  `createFromArtisanTemplate` เรียก `api.artisan.createX` →
  `artisanOpenCreated` พาเข้า entity ที่เพิ่งสร้าง
