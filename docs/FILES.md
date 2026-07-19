# DraconDex — เอกสารรายไฟล์ (มีอะไร ทำงานยังไง)

> คู่กับ [SYSTEMS.md](SYSTEMS.md) ซึ่งอธิบายภาพรวมของแต่ละระบบ — ไฟล์นี้ไล่ทีละไฟล์
> ตัวเลขจำนวนบรรทัดเป็นค่าโดยประมาณ ณ 2026-07-05 (หลัง Obsidian-like rework v2.8)
>
> ⚠️ **ส่วน root/src/db/src/renderer เดิมด้านล่างนี้ยังตรงกับโค้ด** (ไฟล์เดิม
> ไม่ได้ถูกแก้ในรอบ v3) **แต่ยังไม่ครอบคลุมไฟล์ใหม่ทั้งหมดของ "v3 module
> system"** (git history Phase 1–24 + Part 1–2, ณ 2026-07-16) — ดูตาราง
> ไฟล์ใหม่ในหัวข้อ [v3 Module System — ไฟล์ใหม่](#v3-module-system--ไฟล์ใหม่-2026-07-16)
> ด้านล่าง และดูภาพรวมสถาปัตยกรรมที่ [Architec.md](Architec.md)

## โครงสร้างรีโป

```
App-NovelManager/
├─ main.js            ← Electron main process + IPC handlers ทั้งหมด
├─ preload.js         ← สะพาน window.api (contextBridge)
├─ database.js        ← รวม export ของ src/db/*
├─ index.html         ← โครง HTML เปล่า + โหลดสคริปต์เริ่มต้น 7 ตัว
├─ style.css          ← สไตล์ทั้งแอป + ธีมทั้งหมด
├─ start.js           ← ตัวรัน npm start
├─ ensure-electron.js ← ตรวจ/ซ่อม Electron binary (postinstall)
├─ vendor/            ← D3 + Konva ที่ vendor ไว้ใช้ออฟไลน์ (v2.8)
├─ src/
│  ├─ db/             ← ชั้นฐานข้อมูล (main process) 15 ไฟล์
│  └─ renderer/       ← ชั้น UI (renderer) 19 ไฟล์
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
  `db:` (export/import ผ่าน dialog), `nexus:` (v2.8 vault CRUD),
  `folder: project: category: template: object: color: timeline: relation:
  map: hashtag: search:` (Director), `world:` (Navigator), `game:` (Hero),
  `write:` (Writer), `note:` (v2.8 Scribe), `wiki:` (v2.8 wikilink/backlinks/
  graph/explorer/quick-switcher), `artisan:`, `sage:`, `window:`
  (ปุ่มย่อ/ขยาย/ปิดของ title bar)
- ไม่มี business logic ในไฟล์นี้ — ทุก handler ส่งต่อ `db.<fn>()` ทันที
- ฟังก์ชัน list หลายตัว (`project:getAll`, `world:getAll`, `game:getAll`,
  `write:getProjects`, `search:all`) รับพารามิเตอร์ `nexusId` เพิ่ม (v2.8)
  เพื่อ scope ผลลัพธ์ตาม vault ที่เปิดอยู่

### preload.js (~380 บรรทัด) — สะพาน IPC
- `contextBridge.exposeInMainWorld('api', {...})` — mapping 1:1 กับช่อง IPC
  ใน main.js จัดกลุ่มเป็น namespace (`api.project.create(...)` →
  `invoke('project:create', ...)`)
- เป็น "สารบัญ API" ที่ดีที่สุดของแอป: อยากรู้ว่า renderer ทำอะไรกับ DB ได้บ้าง
  ให้เปิดไฟล์นี้
- v2.8 เพิ่ม namespace `api.nexus.*`, `api.note.*`, `api.wiki.*`
  (resolve/backlinks/outgoing/quickIndex/entityPath/explorerTree/getGraph/
  renameTarget/rebuild)

### database.js (~32 บรรทัด)
- require `src/db/*` ทั้ง 15 ไฟล์ (v2.8 เพิ่ม `nexus.js`, `scribe.js`,
  `wiki.js`) แล้ว spread รวมเป็น object เดียว export ให้ main.js ใช้

### index.html (~270 บรรทัด)
- โครงคงที่: `#nav-sidebar` (ปุ่ม rail ทุกโมดูล รวม Explorer/Scribe ที่เพิ่มใน
  v2.8 — ส่วนใหญ่ `display:none` รอ JS เปิดตาม state), `#left-panel`
  (+ ปุ่มย่อ), `#main-area`, `#status-bar` (v2.8 — IDE-style footer),
  `#modal-overlay/#modal`, `#toast`, `#search-bar` (`#search-input`)
- ท้ายไฟล์โหลด 7 สคริปต์: `i18n.js → markdown.js → mdeditor.js → core.js →
  director.js → modals.js → search.js` (ลำดับสำคัญ: i18n ก่อน, markdown/
  mdeditor ก่อน core เพราะ core เรียก `createMarkdownEditor` โดยตรงในบาง
  จุด) — โมดูลอื่น lazy-load
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

### vendor/ (v2.8)
- `d3.min.js` + `d3.LICENSE`, `konva.min.js` + `konva.LICENSE` — ก้อน npm
  pack ตรงจาก `d3@7`/`konva@9` ให้แอปใช้งานได้แบบออฟไลน์ (`ensureD3`/
  `ensureKonva` ใน relation.js/map.js ลองไฟล์นี้ก่อน แล้วค่อย fallback ไป
  CDN unpkg)

### ไฟล์ note อื่น ๆ
- `Plan.md`, `Install-Guide.txt`, `cmd-note.txt` — โน้ตผู้พัฒนา/วิธีติดตั้ง
- `.claude/skills/run-dracondex/` — driver อัตโนมัติ (Playwright `_electron`)
  ใช้รัน/ทดสอบแอปกับ data dir แยก; v2.8 เพิ่ม `web-driver.mjs` — รัน renderer/
  preload/db จริงใน Playwright **Chromium** (stub เฉพาะ Electron shell) สำหรับ
  sandbox ที่โหลด Electron binary ไม่ได้ (เช่น proxy บล็อก GitHub releases);
  `web-driver.mjs` เพิ่มคำสั่ง `dragto`/`rclick` (พอร์ตจาก `driver.mjs` — mouse
  down/move/up จริง ไม่ใช่ synthetic dispatchEvent) ให้ตรงกับ vocabulary เดิม

---

## v3 Module System — ไฟล์ใหม่ (2026-07-16)

ระบบใหม่ทั้งหมด (Nexus nest tree, Hub, Builder, Module Inspector, 15
module kinds) เพิ่มเข้ามาแบบ **additive** ควบคู่กับโค้ดเดิมทุกไฟล์ด้านล่างนี้
(ไม่มีไฟล์เดิมถูกลบ) ดูภาพรวมสถาปัตยกรรมเต็มที่ [Architec.md](Architec.md) §1

### src/db/ (ใหม่)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `module.js` | 194 | แกน module tree: `getTree/getModule/createModule/updateModule/deleteModule`, `duplicateModule`/`cloneModuleSubtree` (clone ทั้ง subtree), `moveModule` (reorder/reparent), Module Inspector helpers (`*ModuleAttr*`, `*ModuleUi*`, `*ModuleTags*`, `getModuleLinks`) |
| `classifier.js` | 135 | ระบบ category/object/template ของ kind `classifier` (แยกตารางจาก Director เดิม) |
| `author.js` | 55 | หนังสือ/บทของ kind `author` (`createBookChapter`/`updateBookChapterContent`) |
| `narrator.js` | 75 | กราฟบทสนทนาของ kind `narrator` (`story_dialogue/story_talk/story_edge`) |
| `chatscribe.js` | 82 | โน้ตแชทของ kind `scribe` (ChatScribe) |
| `wanderer.js` | 30 | เข็มหมุด TimeMap ของ kind `wanderer` (`map_event`) |
| `sketcher.js` | 68 | หน้าวาดฟรีแฮนด์ของ kind `sketcher` |
| `designer.js` | 40 | ไดอะแกรมของ kind `designer` |
| `viewer.js` | 90 | saved-filter lens ของ kind `viewer`/`connector` |
| `importdock.js` | 55 | ตาราง `import_file` — ไฟล์นำเข้า + `linker_key` ผูก entity |
| `versions.js` | 89 | `module_version`: `recordVersion`/`restoreVersion` (whitelist `RESTORE_OPS`), retention ตาม `app_setting.versionLimit` |
| `migrate_v3.js` | 223 | `migrateLegacy(nexusId,target,legacyId)` — map โปรเจกต์เก่า 1 อันเป็น Manager Major + Minor ที่ kind เหมาะสม แบบไม่แตะข้อมูลต้นทาง; `listLegacyProjects` ป้อนลิสต์ migrate ของ Artisan |
| `nexus.js` (แก้ไข ไม่ใช่ไฟล์ใหม่) | 43 (เดิม ~41) | เหลือแค่ CRUD vault — logic module tree ทั้งหมดย้ายไป `module.js` แล้ว; `getNexuses`/`deleteNexus` นับรวมทั้ง project เดิม + module ระดับบนสุด |
| `artisan.js` (แก้ไข) | ~7 | ฟังก์ชันสร้างจากเทมเพลตแบบ transaction เดียวเดิมถูกลบทิ้ง เหลือ `module.exports = {}` — wizard ใหม่เรียก `module:`/`classifier:`/`author:` ตรงๆ แทน |

### src/renderer/ (ใหม่)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `hub.js` | 781 | Nexus nest hub: module rail (+ `goToNexusNestHub` home button, ปุ่มแรกในแถบ ก่อน "+create"), accordion (Nest/Sage Hut/Import Dock — แต่ละ section มี `.acc-body` เลื่อนแยกกันเองผ่าน `#hub-body` flex layout, ดู style.css), nest tree drag-drop (โมดูลไหนก็ reparent ข้าม parent ได้ ไม่ล็อกเฉพาะ top-level แล้ว — `onNestDrop`), context menu (ปุ่ม "Create" เปิด hover submenu แทนการแสดง kind-list แบนราบเดิม — `openCreateSubmenu`/`positionSubmenuNear`)/rename/duplicate/move-to/pin, icon popup, `buildModuleDetailHtml` |
| `builder.js` | 618 | Editor-group shell — recursive split-pane layout tree (`builderSplitPane`/`builderClosePane`, ซ้อนได้ไม่จำกัดชั้น, Part 4), tab drag-reorder/cross-pane move/pop-out เป็นหน้าต่างแยก, toggle Module Inspector dock, auto-split เมื่อลาก tab ไปวางขอบ pane; `pruneStaleLayoutElements` กวาด DOM ที่หลงเหลือจาก legacy view (เช่น Scribe, Nexus picker — เขียนทับ `#main-inner.innerHTML` ตรงๆ) ออกก่อน re-render grid ทุกครั้ง กัน pane ค้างที่ปิดไม่ได้ |
| `inspector.js` | 148 | Module Inspector dock: description/แท็ก/แอตทริบิวต์/ลิงก์/ปุ่ม Version History |
| `iconpicker.js` | 266 | Icon/Color picker ฝัง (ไอคอนแอป/symbol เดิม/อัปโหลด+crop วงกลม) |
| `versions.js` | 78 | แผง Version History (แทน Inspector dock ชั่วคราวตอนเปิด) |
| `guide.js` | 105 | Coach-mark แนะนำหลังสร้าง Nexus แรก (`GUIDE_STEPS`, ข้าม step ที่หา DOM เป้าหมายไม่เจอ) |
| `artisan.js` (แก้ไข) | 258 | เปลี่ยนจากเทมเพลตแบบ one-shot เป็น wizard ทีละหน้าประกอบ module v3 + ส่วน migrate ของเก่า (`fillArtisanMigrateList`/`runArtisanMigration`) |
| `quickswitch.js` (แก้ไข) | ~110+ | ขยายจาก quick switcher เดิมเป็น search-link overlay: scope chip, kind filter, Ctrl+Enter แทรก wikilink, Alt+Enter ปักหมุดลง canvas |
| `mod/manager.js` | — | UI ของ kind `manager` |
| `mod/detail.js` | — | UI ของ kind `inspector` ("Detail") |
| `mod/classifier.js` | — | UI ของ kind `classifier` |
| `mod/locator.js` | — | UI ของ kind `locator` (รียูส `map.js` เดิม) |
| `mod/chronicler.js` | — | UI ของ kind `chronicler` (รียูส `timeline.js` เดิม) |
| `mod/wanderer.js` | — | UI ของ kind `wanderer` |
| `mod/narrator.js` | — | UI ของ kind `narrator` |
| `mod/author.js` | — | UI ของ kind `author` |
| `mod/chatscribe.js` | — | UI ของ kind `scribe` (ChatScribe) |
| `mod/viewer.js` | — | UI ของ kind `viewer` |
| `mod/connector.js` | — | UI ของ kind `connector` |
| `mod/sketcher.js` | — | UI ของ kind `sketcher` |
| `mod/designer.js` | — | UI ของ kind `designer` |
| `mod/sagehut.js` | 134 | Hub section: สถิติวอลต์ (ใช้ `db/sage.js` บางฟังก์ชัน) |
| `mod/fileviewer.js` | 249 | Hub section: Import Dock — list/link ไฟล์ + viewer read-only ใน Builder |

`vendor/` เพิ่ม konva/d3 เดิมยังใช้ร่วม (ไม่มีไฟล์ vendor ใหม่ในรอบนี้)

## Cloud Sync (Supabase) — ไฟล์ใหม่ (2026-07-17)

ต้นแบบซิงก์ Nexus vault ขึ้น Supabase แบบ snapshot + คีย์เข้าถึงต่อ vault
(`Xxxx-Xxxx-Xxxx-Xxxx`) — ดูรายละเอียดพฤติกรรม/วิธีใช้ที่ [SYNC.md](SYNC.md)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `src/db/sync.js` | ~560 | ทั้งฟีเจอร์ฝั่ง main: `generateAccessKey` (crypto, 4×4 alphanumeric), config ใน `app_setting` (`sync:url`/`sync:anonKey`/`sync:nexus:<id>`), `rpc()` fetch wrapper (PostgREST, error taxonomy `{ok,code,error}` ไม่ throw), `serializeVault` (vault → JSON snapshot, lookup FK → natural key), `applySnapshot` (wipe-and-rebuild + id remap ใน transaction เดียว แล้ว `rebuildWikiIndex()`), ops: `syncStatus/syncPushVault/syncPullVault/syncLinkVault/syncCreateReadKey/unlinkVault` |
| `src/renderer/sync.js` | ~210 | หน้าต่างซิงก์ 3 สถานะ (ตั้งค่าเซิร์ฟเวอร์ / ยังไม่เชื่อม / เชื่อมแล้ว), แผงคีย์แบบแสดงครั้งเดียว + คัดลอก, `syncErrToast` map error code → i18n toast; เข้าจากปุ่ม ☁ ใน vault-head (core.js); โหมด dev ข้ามหน้าตั้งค่าและแสดงป้าย dev server |
| `src/db/sync-devserver.js` | ~140 | เซิร์ฟเวอร์ซิงก์ต้นแบบสำหรับ build dev (`!app.isPackaged`): HTTP in-process บน loopback, endpoint/กติกา auth/error body เหมือน migration ทุกอย่าง, เก็บ state เป็น `dev-sync-server.json` ข้าง novel-manager.db; `ensureDevSyncServer()` เริ่ม lazy ครั้งเดียวต่อโปรเซส |
| `supabase/migrations/20260717000000_dracondex_sync_prototype.sql` | ~200 | ฝั่งเซิร์ฟเวอร์ทั้งหมด: ตาราง `sync_vault`/`sync_key` (เก็บ sha-256 ของคีย์), RLS ล็อกไม่มี policy, RPC SECURITY DEFINER 5 ตัว (`sync_create_vault/push/pull/create_read_key/vault_status`) |
| `docs/SYNC.md` | — | คู่มือวิธีใช้ + หลักการทำงานของฟีเจอร์นี้ |

ไฟล์เดิมที่แตะ: `main.js` (+8 handler `sync:*`), `preload.js` (+namespace
`api.sync`), `database.js` (re-export `src/db/sync.js`), `index.html`
(script tag `src/renderer/sync.js`), `src/renderer/core.js` (ปุ่ม ☁ ใน
vault-head), `src/renderer/i18n.js` (+41 คีย์ `sync*` ครบ 18 locale),
`style.css` (block `.sync-*`)

---

## src/db/ — ชั้นฐานข้อมูล (รันใน main process)

ทุกไฟล์ pattern เดียวกัน: `getDB()` จาก core แล้ว export ฟังก์ชัน query ตรง ๆ
(prepared statement ต่อครั้ง) — ชื่อฟังก์ชันตรงกับ handler ใน main.js

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `core.js` | ~1400 | เปิด/adapt DB, **schema ทั้งหมด ~78 ตาราง** (v2.8 เพิ่ม `nexus`, `note_folder`, `note`, `wiki_link`), migrations (legacy Navigator, Hero v2.6, Writer v2.7, **Nexus v2.8** `migrateNexusV28` — adopt project เก่าเข้า vault เริ่มต้น + backfill `wiki_link` ครั้งแรก), seed สัญลักษณ์, `ensureIndexes()`, export/import-merge (v2.8 รวม nexus/note ด้วย แล้ว `rebuildWikiIndex()` หลัง merge) |
| `nexus.js` | 41 | (v2.8) CRUD ของ Nexus vault: `getNexuses` (พร้อมนับ project ต่อ vault), `getNexus/createNexus/updateNexus`, `deleteNexus` (คืน `{blocked,count}` ถ้ายังมี project อยู่) |
| `director.js` | ~155 | folder / project / project_description / category / template / object / attribute + `searchAll` (ค้นหา global) — v2.8: `getProjects/searchAll` รับ `nexusId`, `createProject` เซ็ต `nexus_ref`, `createObject/updateObject/updateObjectNote` hook เข้า wiki reindex/resolve |
| `color.js` | 27 | ตาราง `use_color`: getAll/add/markUsed/getRecent/delete |
| `timeline.js` | 68 | timeline / `getOrCreateDate` (normalize วันที่สมมุติ) / event CRUD + story |
| `map.js` | 34 | map / area / จุด polygon (`setPoints` ลบ-แทรกใหม่ทั้งชุด) |
| `relation.js` | 126 | relation_type + relation 3 ชนิด (OBOB/OBTL/TLTL) + query รวม object/event ของโปรเจกต์ + ลิงก์ของ event |
| `hashtag.js` | 67 | ตาราง hashtag + mapping project/object/event + query "ใครใช้แท็กนี้" |
| `navigator.js` | ~450 | ทุกอย่างของ World: world CRUD (v2.8: `getWorlds/createWorld` รับ `nexusId`), เชื่อมนิยาย, ตัวละครโลก+ลิงก์, category/object/template/attr ของโลก (orig_*), world description, world tags, map timeline + การวาง object บนแผนที่ต่อเหตุการณ์, symbol collection |
| `hero.js` | ~390 | ทุกอย่างของ Game: เกม (v2.8: `getGames/createGame` รับ `nexusId`), novel link (unique ต่อนิยาย), import category/object, ตัวละคร+template มี level+attr+element, collection+element+template+attr, story/dialogue/conversation/storyline, แท็กเกม |
| `writer.js` | ~200 | write project (v2.8: `getWriteProjects/createWriteProject` รับ `nexusId`) / series / book / chapter (+เนื้อหา+ลำดับ, v2.8: `updateWriteChapterContent` hook เข้า wiki reindex) / novel link / wiki / word link / note / chat |
| `scribe.js` | 78 | (v2.8) note_folder + note CRUD ผูก `nexus_ref`, `UNIQUE(nexus_ref,title)`; `createNote` auto-suffix ชื่อชนกัน + resolve dangling wikilink; `updateNoteContent/updateNote` hook เข้า wiki reindex |
| `wiki.js` | ~400 | (v2.8) แกน wikilink ทั้งหมด: `resolveWikiName` (ลำดับ precedence ตายตัว + namespace escape), `reindexWikiLinks`, `rebuildWikiIndex` (backfill/หลัง import), `getBacklinks/getOutgoingLinks/resolveEntityKeys`, `quickIndex` (ป้อน quick switcher + `[[` autocomplete), `getEntityPath` (นำทางลึกถึง entity), `explorerTree` (โครงต้นไม้ทั้ง vault), `getGraph` (node/edge ทั้ง vault รวม wiki_link), `renameWikiTarget`/`resolveDanglingLinks` (rename safety) |
| `sage.js` | 200 | query สถิติ read-only 4 ชุด: dataSize, objectAmounts, linkerList, linkerGraph (nodes+edges ข้ามโมดูล) |
| `artisan.js` | 82 | `artisanCreateNovel/World/Game/Write` — รับ `base` (ชื่อ ฯลฯ) + `spec` (โครงจากเทมเพลต) สร้างทุกแถวใน transaction เดียว |

---

## src/renderer/ — ชั้น UI

ทุกไฟล์เป็น global function (ไม่มี module system) เรียก DB ผ่าน `window.api`
render เป็น HTML string ลง `#left-panel-inner` / `#main-inner`

### i18n.js (~1780 บรรทัด) — โหลดก่อนทุกไฟล์
- ตาราง `L` แปล UI key 18 ภาษา + รายชื่อภาษาใน picker + ตาราง `TX`
  (dictionary แปลข้อความ hardcode ไทย/อังกฤษ → ภาษาอื่น รวมภาษาสมมุติ `qd`)
- v2.8 เพิ่ม ~40 key (nexus/scribe/wiki/explorer/quick-switcher/graph/rename)
  ครบทั้ง 18 ภาษา
- ไม่มี logic — logic การแปลอยู่ใน core.js (`t()`, `tr()`,
  `translateCommonUiText()`)

### markdown.js (130 บรรทัด, v2.8) — โหลดก่อน core.js
- Markdown parser เขียนเอง ไม่มี dependency ภายนอก: `mdRender(text,{resolveLink})`
  → HTML (heading/hr/quote/fenced code/list ซ้อน+task/bold/italic/strike/
  `==highlight==`/inline code/`[text](url)`/`[[Wikilink]]`/`[[Wikilink|alias]]`)
  escape ข้อความผู้ใช้ทุกจุดก่อนแปะ HTML
- `mdExtractWikilinks(text)` → `[{name,alias,start,end}]` — regex เดียวกับ
  `WIKILINK_RE` ใน `src/db/wiki.js` (คอมเมนต์ทั้งสองฝั่งเตือนให้ sync กัน)

### mdeditor.js (267 บรรทัด, v2.8) — โหลดก่อน core.js
- `createMarkdownEditor(container, opts)` — คอมโพเนนต์ editor กลาง reuse โดย
  Scribe และช่องโน้ตของ Director object: textarea ทับ backdrop ไฮไลต์
  `[[wikilink]]`, debounce autosave 800ms, ปุ่ม/Ctrl+E สลับ edit↔preview,
  แผง backlinks/outgoing links พับได้ (เรียก `api.wiki.backlinks/outgoing`),
  `[[` autocomplete (caret-positioned floating list, ↑/↓/Enter/Esc/Tab)
- cache ชื่อ entity ทั้ง vault (`refreshWikiCache/resolveWikiNameCached`) ให้
  `mdRender` resolve ลิงก์แบบ synchronous ได้ตอน preview
- รายงาน word count/สถานะ save เข้า `updateStatusBar()` ของ core.js

### core.js (~1700 บรรทัด) — โครงหลักของ renderer
- **State**: object `S` (view, activeModule, project/category/object,
  world/game/write/scribe state, nexus ที่เปิดอยู่, แท็บ, settings,
  `recentEntities`, `explorerOpen`) + `loadUiSettings/saveUiSettings`
  (localStorage: ธีม, ภาษา, ขนาด UI, **nexus ล่าสุด** v2.8)
- **บูต**: `init()` (DOMContentLoaded) → โหลด settings/สี/nexus ล่าสุด →
  `bindNav`, `bindWindowChrome` (ปุ่ม min/max/close), `bindWikilinkClicks`,
  `bindGlobalShortcuts` (v2.8), `renderNexusHome`
- **Routing**: `selectModule()` / `switchView()` + `loadModule()` (lazy-load
  สคริปต์โมดูล), การโชว์/ซ่อนปุ่ม rail (`updateModuleSubNav`,
  `MODULE_SUBNAV` = subtab ของ hero/writer/sage/**scribe**)
- **แท็บ title bar**: `upsertProjectTab/upsertEntityTab/switchProjectTab/
  switchEntityTab/close*` (Director เปิดเป็น project tab; Hero/Writer/**Scribe**
  เปิดเป็น entity tab)
- **คอมโพเนนต์กลาง**: `openModal/closeModal`, `toast`, `uiConfirm`,
  `colorPicker` (+wheel `pickColor/addColorFromPicker`), `symbolPicker`,
  `hashtagSelector` + ฟังก์ชันชิปแท็กใน modal, novel picker แบบ tree
- **i18n runtime**: `t()`, `tr()`, `translateStaticChrome`,
  `translateCommonUiText`, `observeUiLanguage` (MutationObserver)
- **เมนูตั้งค่า**: `renderSettingsMenu/setUiSetting` (ธีม+swatch, ภาษา,
  สไลเดอร์ขนาด), `exportDatabaseFile/importDatabaseFile`
- **Nexus vault (v2.8)**: `renderNexusHome()` (2 ระดับ — picker/การ์ด 7 โมดูล),
  `renderNexusPicker/welcomeCreateNexus/openNexusModal/createNexusSubmit/saveNexus/delNexus`
  (ฟอร์มเริ่มครั้งแรกมี checkbox เลือก coach-mark),
  `selectNexus/closeNexus/clearWorkspaceTabs`, `reloadSidebar/renderSidebar`
- **Wiki navigation (v2.8)**: `openEntityByKey(key)` (จุดเดียวที่เปิด entity
  จาก key ทุกที่ — wikilink click/backlinks/quick switcher/graph node),
  `bindWikilinkClicks` (event delegation บน `#main-inner`),
  `trackRecentEntity`
- **IDE shell (v2.8)**: `updateStatusBar()` (footer: vault/item/word count/
  save state), `bindGlobalShortcuts()` (Ctrl+P/E/N/W/Tab), `openExplorer()`

### director.js (~650 บรรทัด)
- sidebar โปรเจกต์ (`renderProjectSidebar`, โฟลเดอร์พับได้ `tglFolder`),
  `selectProject/activateProject`, `renderProject`
- body ของ category: `renderCatBody` มุมมองรายการ/ตาราง, inline edit
  (`bindTableInlineEditors`), ซ่อนคอลัมน์ (`openColumnVisibilityModal`),
  `sortTable`
- detail ของ object: `buildDetail/renderDetail` — field autosave
  (`saveAttrs`, `bindDetailAutoSave`), **โน้ตเป็น markdown editor** (v2.8 —
  `createMarkdownEditor` แทน textarea เดิม, ฟังก์ชัน `saveNote` แบบเก่าถูกลบ),
  relation ของ object (`getObjectRelationRows`), แท็ก (`openObjectTagsModal`)

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

### relation.js (~610 บรรทัด)
- `renderForceGraph` (D3 force simulation, `ensureD3` โหลด D3 ครั้งแรก —
  v2.8: ลอง `vendor/d3.min.js` ก่อน แล้วค่อย fallback ไป unpkg CDN),
  whiteboard 3 มุมมอง (`renderCategoryWhiteboard/renderObjectWhiteboard/
  renderProjectWhiteboard` + `switchRelViewMode`, ใช้ Konva — `ensureKonva`
  v2.8 เช่นกันลอง `vendor/konva.min.js` ก่อน), ลาก node (`startNodeDrag`),
  โน้ตของ node (`showRelationNodeNote`), รายการ relation ด้านล่าง +
  ปรับความสูง (`startRelListResize`)

### map.js (~390 บรรทัด)
- `renderMapView` — sidebar รายชื่อแผนที่, canvas พื้นที่ polygon ต่อ area
  (Konva ผ่าน `ensureKonva` — v2.8 vendor-first เหมือน relation.js),
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

### writer.js (~850 บรรทัด)
- โครงสร้าง 3 ชั้น: `renderWriteProjectList` (โปรเจกต์+ซีรีส์ พับได้ — v2.8:
  รับ `nexusId`) → `renderWriteProject`/`renderWriteBookGrid` (เล่ม) →
  `renderWriteBookPage` (รายการตอน + editor)
- editor: `renderWriteChapterEditor` — textarea `#wchap-text` + backdrop
  ไฮไลต์ word link **+ `[[wikilink]]`** (v2.8, เส้นประแยกจาก word link),
  autosave debounce 800ms, ลากเลือกคำ → ปุ่มลอยสร้างลิงก์
  (`openCreateLinkModal/createWlinkForObject`), คลิก `[[wikilink]]` →
  `openEntityByKey` ผ่าน `api.wiki.resolve`, ปุ่ม "พรีวิว" (v2.8 —
  `toggleWchapPreview`, ใช้ `mdRender`/`resolveWikiNameCached`)
- tab novel link/วิกิ (`renderWriteNovelLink`, `openWriteWikiModal`),
  tab chat note (`renderWriteChatnote`, `submitWriteChat`)
- modal ทั้งหมดของโมดูล (project `#wp-name`, series `#ws-name`, book
  `#wb-name`, chapter `#wc-name`, note `#wn-name`)

### scribe.js (236 บรรทัด, v2.8) — โมดูลที่ 7
- `renderScribeView/renderScribeSidebar` (folder tree ซ้อนได้ + รายการโน้ต) /
  `renderScribeMain` (editor ผ่าน `createMarkdownEditor`)
- โน้ต/โฟลเดอร์ CRUD ผ่าน modal (`openNoteModal/createNoteSubmit/
  saveNoteMeta` — เตือน rename ที่มีคนลิงก์มา, `openNoteFolderModal`)
- `setScribeTab('graph')` สลับไปกราฟทั้ง vault: `renderScribeGraph` +
  `tglScribeGraphModule` (reuse `buildSageGraph` จาก sage.js ผ่าน opts ใหม่)

### sage.js (~390 บรรทัด)
- `renderSageView/setSageTab` + หน้าละฟังก์ชัน: `renderSageDataSize` (การ์ด),
  `renderSageObjectAmount` (ตาราง), `renderSageLinkerList` (ตารางลิงก์),
  `renderSageLinkerGraph` + `buildSageGraph` (SVG force-graph มือเขียนเอง
  ไม่พึ่ง lib — v2.8 เพิ่ม opts `container/colors/labels/onNodeClick` แบบ
  backward-compatible ให้ Scribe graph view เรียกใช้ร่วมกันได้, edge ที่มาจาก
  `wiki_link` วาดเส้นประสี accent)

### artisan.js (258 บรรทัด)
- `ARTISAN_TARGETS` + `artisanTemplates(target)` — นิยามเทมเพลตทั้งหมด

### markdown.js / mdeditor.js / scribe.js / explorer.js / quickswitch.js
ดูรายละเอียดด้านบน (markdown.js, mdeditor.js อยู่ก่อน core.js ตามลำดับโหลด;
scribe.js/explorer.js/quickswitch.js lazy-load เหมือนโมดูลอื่น)

### explorer.js (73 บรรทัด, v2.8)
- `renderNexusExplorer()` — ต้นไม้เดียวรวมทุกอย่างใน vault (ข้อมูลจาก
  `api.wiki.explorerTree`), `tglExplorerNode` พับ/กาง, แถวคลิกแล้ว
  `openEntityByKey`; ปุ่ม rail `openExplorerPanel/openExplorer` เปิดได้ตลอด
  เมื่อมี vault เปิดอยู่ ไม่ผูกกับโมดูลใดโมดูลหนึ่ง

### quickswitch.js (110 บรรทัด, v2.8)
- `openQuickSwitcher()` (Ctrl+P) — overlay + input, ดึง `api.wiki.quickIndex`
  ครั้งเดียวตอนเปิด, `fuzzyScore` (subsequence, โบนัสต้นคำ/ตัวติดกัน),
  ↑/↓/Enter/Esc, query ว่างโชว์ `S.recentEntities`
  (ชื่อ/คำอธิบาย/preview chip/ฟังก์ชัน `build(name)` คืน spec) โดยดึงข้อความผ่าน
  `t()` → **สร้างข้อมูลตามภาษา UI ปัจจุบัน**
- `renderArtisanView` (เลือกเป้าหมาย) → `renderArtisanMain` (การ์ดเทมเพลต) →
  `openArtisanCreateModal` (`#art-name/#art-code/#art-memo`) →
  `createFromArtisanTemplate` เรียก `api.artisan.createX` →
  `artisanOpenCreated` พาเข้า entity ที่เพิ่งสร้าง
