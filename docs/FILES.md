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
├─ index.html         ← โครง HTML เปล่า + <link> css/ 14 ไฟล์ + <script> ตามลำดับ
├─ start.js           ← ตัวรัน npm start
├─ ensure-electron.js ← ตรวจ/ซ่อม Electron binary (postinstall)
├─ css/               ← สไตล์ทั้งแอป 14 ไฟล์ (แยกจาก style.css เดิม — Plan part1)
├─ vendor/            ← D3 + Konva ที่ vendor ไว้ใช้ออฟไลน์ (v2.8)
├─ src/
│  ├─ db/             ← ชั้นฐานข้อมูล (main process) 37 ไฟล์ (รวม schema/ 5 ไฟล์)
│  └─ renderer/       ← ชั้น UI (renderer) 72 ไฟล์ (รวม core/ hub/ navigator/ hero/ mod/)
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
- **protocol `ddx-file://` (Plan part2 #2.2)**: `registerSchemesAsPrivileged`
  ตอน module load (ต้องก่อน app ready) + `registerDisplayImageProtocol()` ที่
  เรียกใน `whenReady` ก่อน `createWindow()` — เสิร์ฟไฟล์รูป display image ให้
  `<img src>` ตรงๆ แทนการ base64 ผ่าน IPC. จงใจ**ไม่ใช้** `standard: true`:
  `index.html` โหลดด้วย `loadFile` (origin เป็น `file://`) และ Chromium ปฏิเสธ
  ไม่โหลด custom scheme แบบ standard เป็น subresource ของหน้า `file://`
  (ทดสอบแล้ว — request ไม่ถึง handler เลย `<img>` ยิง onerror ทันที) — scheme
  แบบ non-standard เป็น opaque origin เหมือน `data:`/`blob:` จึงโหลดได้.
  URL พก **row id เท่านั้น ไม่ใช่ path** (`ddx-file://<importFileId>`) เพราะ
  `import_file.file_path` คือ path เดิมของผู้ใช้ที่อยู่ตรงไหนก็ได้บนดิสก์
  (ไฟล์ import ไม่ถูกคัดลอกเข้า data dir) — ถ้ารับ path ตรงๆ จะกลายเป็นช่อง
  อ่านไฟล์ใดก็ได้; handler เสิร์ฟเฉพาะเมื่อ row นั้นมีจริงและ `file_type` อยู่
  ใน `IMAGE_EXTS` เท่านั้น + ส่ง ETag (mtime+size) กับ `Cache-Control: no-cache`
  เพื่อให้เบราว์เซอร์ revalidate (ไฟล์ที่ถูกแทนที่บนดิสก์เห็นผลทันที).
  ทั้ง 2 จุดมี guard `if (protocol)` เพราะ web-driver harness โหลด main.js
  โดย stub Electron shell ไว้ (ไม่มี `protocol`) — ที่นั่นใช้ทาง fallback
  `<img onerror>` → `importdock:readFiles` แทน
- `importdock:readFile` เปลี่ยนเป็น async (`fs.promises`) และ**ไม่ส่ง base64 ของ
  รูปแล้ว** (คืน `{kind:'image'}` เฉยๆ — viewer ชี้ไป `ddx-file://` เอง);
  `importdock:readFiles(ids)` เป็นตัวใหม่สำหรับ batch fallback
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
- **2026-07-25**: `api.db.importFileMerge()` ถูกแทนที่ด้วย 2 ช่องแยกกัน
  `api.db.pickImportFile()` (เปิด dialog อย่างเดียว คืน `{canceled, filePath}`)
  และ `api.db.importMergeFile(path)` (merge จริง) — เพื่อให้ renderer แทรก
  หน้าต่างยืนยัน **ระหว่างกลาง** ได้ ตอนรวมเป็นช่องเดียว merge จบไปแล้วตั้งแต่
  ก่อนจะมีอะไรให้ยืนยัน (namespace `db` ไม่อยู่ในรายการ read-only guard
  จึงไม่ต้องแก้ `IMPORT_DB_READONLY_NS`)

### database.js (~32 บรรทัด)
- require `src/db/*` ทั้ง 15 ไฟล์ (v2.8 เพิ่ม `nexus.js`, `scribe.js`,
  `wiki.js`) แล้ว spread รวมเป็น object เดียว export ให้ main.js ใช้

### index.html (~330 บรรทัด)
- โครงคงที่: `#nav-sidebar` (ปุ่ม rail ทุกโมดูล รวม Explorer/Scribe ที่เพิ่มใน
  v2.8 — ส่วนใหญ่ `display:none` รอ JS เปิดตาม state), `#left-panel`
  (+ ปุ่มย่อ), `#main-area`, `#status-bar` (v2.8 — IDE-style footer),
  `#modal-overlay/#modal`, `#toast`, `#search-bar` (`#search-input`)
- **`#splash` + inline boot script (เพิ่ม 2026-07-25)** — บล็อกแรกสุดใน `<body>`
  ก่อน `#window-frame` เพราะต้องมีอยู่ก่อนสคริปต์แอปทั้งก้อนจะ parse:
  - markup: `.splash-logo` (ใช้คลาส `.brand-img` ร่วม จึงได้ logo สลับตามธีม
    จาก `content:url()` ใน style.css ฟรี), `#splash-track`/`#splash-fill`,
    `#splash-pct`
  - inline `<script>` ทำ 2 อย่าง: (ก) อ่าน `localStorage['novel-manager-ui-settings']`
    แล้วตั้ง `body[data-theme]` ทันที (สำเนาย่อของ `applyUiSettings()` เฉพาะธีม —
    กันจอวาบดำ เพราะตัวจริงรันหลังโหลด JS ครบ ~700KB); (ข) นิยาม
    `window.__splash` = `set(pct)` / `finish()` (min-display 500ms → fade →
    `remove()`) + watchdog 20 วิ กัน overlay ค้างทับแอป
  - `<script>__splash.set(N)</script>` แทรกคั่นระหว่าง `<script src>` ที่
    15/35/50/55% — จุด tick ที่เหลือ (60–100%) อยู่ใน `init()` ของ core.js
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
- **`:root` (อัปเดต 2026-07-25)** — นอกจาก token สี/รัศมีเดิม ตอนนี้มี:
  - `--fsc:1` ตัวคูณสเกลฟอนต์ (core.js เขียนทับแบบ inline บน documentElement)
    เดิมถูกอ้าง 300+ ครั้งแบบ `var(--fsc,1)` แต่ไม่เคยประกาศไว้ที่ไหนเลย
  - `--on-accent`/`--on-button`/`--on-danger`/`--ink-dark` — สีตัวอักษรบนพื้นถม
    (ดู SYSTEMS.md §10) ต้องเป็นค่า literal 3 ตัวแยกกัน **ห้าม** alias ถึงกัน
  - สเกลใหม่สำหรับโค้ดใหม่เท่านั้น (ไม่ retrofit ของเดิม): `--sp-0..7`,
    `--fs-micro..xl` (ห่อ `calc(… * var(--fsc,1))` มาให้แล้ว), `--lh-*`,
    `--shadow-pop/float/menu/modal`, `--mono`
- `--bg2` ประกาศบน `body` (ไม่ใช่ `:root`) มีคอมเมนต์อธิบายกับดัก aliasing ไว้
  — `--bg3` ถูกลบแล้ว (ไม่มีใครอ้างถึงเลย)
- compat layer ท้ายไฟล์: ลบคลาสที่ไม่มีใครใช้ 12 ตัว (`.panel-item`, `.ph-add`,
  `.detail-header`, `.detail-actions`, `.section-head`, `.desc-card/-title/
  -content/-actions`, `.tag-picker`, `.btn-xs`, `.modal-actions`) และบล็อกที่
  นิยามซ้ำคำต่อคำ (`.empty h3/p`, `.tag`, `#toast`, scrollbar)
  — ⚠️ `.btn-xs` เคยใช้ selector list ร่วมกับ `.btn-sm` (มีคนใช้ 20 จุด)
    จึงต้อง **แก้ selector** ไม่ใช่ลบทั้งบรรทัด
- คลาสใหม่: `.busy-veil`/`.busy-spin`/`.busy-text` (ตัวบอกสถานะโหลดตัวเดียวของแอป),
  `#confirm-box.wide` + `#confirm-box .fg` (ใช้โดย `uiPrompt()`)

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

## Re-architecture — การแยกไฟล์ (Plan part1, 2026-07-26)

ไฟล์ใหญ่ 6 ไฟล์ถูกแยกเป็นโฟลเดอร์ตามเกณฑ์ใน `Plan.md` (หนึ่งไฟล์ = หนึ่งหน้าที่
หลัก; จำนวนบรรทัดเป็น "สัญญาณ" ไม่ใช่ "กฎ") **ทุกไฟล์ใหม่เป็นการตัดช่วงบรรทัด
ต่อเนื่องของไฟล์เดิมแบบคำต่อคำ** และเรียงลำดับโหลดตามเดิม — เอาไฟล์ใหม่มาต่อกัน
แล้วได้ไฟล์เดิมกลับมาแบบ byte ต่อ byte (พิสูจน์ด้วยสคริปต์ตอนแยก) ดังนั้น
ลำดับ CSS cascade และลำดับ evaluate ของ classic script ไม่เปลี่ยนโดยโครงสร้าง

เกณฑ์/ขั้นตอน/ตัวตรวจอยู่ในสกิลใหม่ `.claude/skills/dracondex-file-arch/`

### css/ — แยกจาก `style.css` (3159 บรรทัด → 14 ไฟล์)

`index.html` มี `<link>` 14 ตัว **เรียงตามลำดับเดิมของกฎ** (ห้ามสลับ — ลำดับคือ
พฤติกรรมของ cascade)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `tokens.css` | 78 | `html`, `:root` custom properties ทั้งหมด |
| `themes.css` | 569 | 32 ธีม (`body[data-theme=…]`) + สลับโลโก้ต่อธีม (**data file**) |
| `base.css` | 39 | typography, การตัดบรรทัดภาษาไทย, `select`, ตัวคูณ UI scale |
| `titlebar.css` | 148 | `#window-frame`, title/tab bar, เมนูตั้งค่า, ปุ่มหน้าต่าง |
| `nav-hub.css` | 195 | nav rail, module rail, vault picker, Hub accordion, Nest tree |
| `inspector.css` | 225 | Module Inspector + icon/kind picker + Classifier/Manager/Locator |
| `editor.css` | 119 | mdeditor, markdown preview, quick switcher, status bar, Scribe graph |
| `layout.css` | 224 | `#left-panel`, `#main-area`, `.ph`, `.li`, folder, project sidebar |
| `components.css` | 265 | ปุ่ม, ฟอร์ม, color grid, modal, floating panel, Preferences, splash |
| `legacy-views.css` | 310 | หน้าเดิม Director/Navigator/Hero/Writer (การ์ด, แท็บ, timeline, relation, map) |
| `legacy-tables.css` | 290 | table view, search bar, SVG icon sizing, Writer editor, Sage เดิม |
| `compat.css` | 169 | ชั้น alias ที่ map คลาสเดิมเข้าโทเคน `.li`/`.ph`/`.btn` + Artisan |
| `kinds.css` | 372 | CSS ของ 15 v3 module kinds + Sage Hut + Import Dock |
| `builder.css` | 165 | Builder split-tree, tab strip, layout picker, overlay panels |

> ⚠️ `url()` ใน CSS อ้างอิงจาก**ตัวไฟล์ CSS** ไม่ใช่จาก `index.html` — รูปใน
> `css/nav-hub.css` จึงเป็น `../Image/…` (ตอนแยกครั้งแรกลืมจุดนี้ → รูปโลโก้
> 404 ทั้งชุด; ตัวตรวจ `check-arch.mjs` จับกรณีนี้แล้ว)

### src/renderer/core/ — แยกจาก `core.js` (2642 บรรทัด → 12 ไฟล์)

โหลดด้วย `<script>` 12 ตัวเรียงตามเดิม — `state.js` **ต้องมาก่อน** เพราะ
top-level `const` ข้ามสคริปต์อยู่ใน TDZ จนกว่าไฟล์นั้นจะถูก evaluate

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `state.js` | 223 | `I` (ไอคอน), storage keys, `UI_*`, `S` (state กลาง), `kindLabel` |
| `boot.js` | 105 | `init()` (เรียกจาก `search.js` ตัวสุดท้าย) + splash handoff |
| `ui.js` | 295 | `q`/`x`, `toast`, `setBusy`, modal, floating panel, `uiConfirm`/`uiPrompt`, resize |
| `settings.js` | 379 | `t()`/`tr()`, UI settings, เมนูเฟือง, shortcuts modal, Preferences |
| `theme.js` | 217 | ตัวแก้ธีมกำหนดเอง (gradient, ctm*, import/export palette) |
| `chrome.js` | 122 | i18n DOM pass (`translateStaticChrome`/`translateCommonUiText`), window chrome |
| `nav.js` | 311 | `MODULE_SUBNAV`, `updateTopNavButton`, tab strip (project/module/entity) |
| `pickers.js` | 325 | novel picker, color/symbol picker, `hashtagSelector` |
| `views.js` | 199 | `loadModule`/`loadGroup`/`LAZY_GROUPS`, `ensureKonva`, `switchView`, `renderNexusHome` |
| `nexus.js` | 196 | vault switcher/picker/CRUD + welcome modal |
| `router.js` | 167 | `selectModule()`, Import-DB hub, `openEntityByKey`, status bar |
| `shortcuts.js` | 125 | คีย์ลัดรวม, `returnToNexus`, sidebar ของ Director |

### src/renderer/{hub,navigator,hero}/ — 3 โมดูลใหญ่

| โฟลเดอร์ | เดิม | ไฟล์ใหม่ | โหลดแบบ |
|---|---|---|---|
| `hub/` | 1301 | `kinds.js` 164 · `sections.js` 220 · `tree.js` 277 · `popups.js` 112 · `menus.js` 277 · `edit.js` 159 · `open.js` 93 | eager (`<script>` 7 ตัว, `kinds.js` ก่อน) |
| `navigator/` | 1807 | `shell.js` 78 · `sidebar.js` 138 · `main.js` 144 · `world.js` 80 · `origcat.js` 358 · `chars.js` 253 · `cats.js` 97 · `maps.js` 293 · `board.js` 367 | lazy ผ่าน `loadGroup('navigator')` |
| `hero/` | 1088 | `shell.js` 61 · `project.js` 255 · `novel.js` 76 · `story.js` 311 · `tags.js` 63 · `modals.js` 323 | lazy ผ่าน `loadGroup('hero')` |

> ⚠️ `loadModule()` แทรก `<script>` เข้า `<head>` ซึ่งเป็น **async** — ไฟล์ใน
> กลุ่ม lazy ไม่มีลำดับที่รับประกัน จึงต้องประกาศใน `LAZY_GROUPS`
> (`core/views.js`) แล้วเรียก `loadGroup(name)` ที่ `await` ครบทุกไฟล์ก่อน
> render และห้ามไฟล์ในกลุ่มอ่าน binding ของอีกไฟล์ที่ระดับ top level

### src/db/ — แยกจาก `core.js` (2532 บรรทัด → 7 ไฟล์ + façade)

`src/db/core.js` เหลือ 18 บรรทัดเป็น **façade** re-export ชื่อเดิมทั้ง 5
(`getDB`, `adaptDb`, `exportDatabaseTo`, `importDatabaseMerge`, `perfLog`) —
ไฟล์อื่นอีก ~29 ไฟล์ที่ `require('./core')` และ `database.js` จึงไม่ต้องแก้เลย

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `conn.js` | 266 | `adaptDb` (statement cache, `readTx`, transaction ซ้อนได้), `getDB`, `has*()` |
| `schema/ddl.js` | 965 | `DDL_SQL` — CREATE TABLE ทั้งหมด (**data file**) |
| `schema/indexes.js` | 142 | `INDEX_SQL` (**data file**) |
| `schema/seed.js` | 21 | `SEED_SYMBOLS` (**data file**) |
| `schema/init.js` | 123 | `schemaStamp()` + `initDB(db)` |
| `schema/migrations.js` | 277 | migration เพิ่มคอลัมน์ 6 ตัว + `ensureIndexes` |
| `import-merge.js` | 762 | `exportDatabaseTo`, `importDatabaseMerge` (merge ไฟล์ .ddx เข้าฐานปัจจุบัน) |

การเปลี่ยนแปลงจริง 3 อย่าง (นอกเหนือจากการย้าย):
- `initDB()` → `initDB(db)` รับ connection เป็นพารามิเตอร์แทนการปิดทับตัวแปร
  `db` ระดับโมดูล (migration ทุกตัวข้างๆ ก็รับแบบนี้อยู่แล้ว) — ทำให้
  `String(initDB)` เปลี่ยน → `schemaStamp()` เปลี่ยน → ฐานข้อมูลเดิมจะรัน
  init path (idempotent) อีกครั้งหนึ่งครั้งเดียวแล้วประทับ stamp ใหม่
  (วัดจริง: 131ms ครั้งเดียว จากนั้นเข้า fast path "skipped, stamp match")
- ตัวคั่นใน `schemaStamp()` เดิมเป็น **byte NUL/`\x01` จริงในซอร์ส** ทำให้ git
  มองไฟล์เป็น binary และไม่แสดง diff — เปลี่ยนเป็น escape `'\x00'`/`'\x01'`
- แปลง CRLF → LF (เป็นไฟล์เดียวในรีโปที่ยังเป็น CRLF)

---

## v3 Module System — ไฟล์ใหม่ (2026-07-16)

ระบบใหม่ทั้งหมด (Nexus nest tree, Hub, Builder, Module Inspector, 15
module kinds) เพิ่มเข้ามาแบบ **additive** ควบคู่กับโค้ดเดิมทุกไฟล์ด้านล่างนี้
(ไม่มีไฟล์เดิมถูกลบ) ดูภาพรวมสถาปัตยกรรมเต็มที่ [Architec.md](Architec.md) §1

### src/db/ (ใหม่)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `module.js` | 288 | แกน module tree: `getTree/getModule/createModule/updateModule/deleteModule`, `duplicateModule`/`cloneModuleSubtree` (clone ทั้ง subtree), `moveModule` (reorder/reparent), Module Inspector helpers (`*ModuleAttr*`, `*ModuleUi*`, `*ModuleTags*`, `getModuleLinks`); **Plan part2 #2.1/#2.5** — `getModuleInspector(id)` รวม 4 read ของ Inspector เป็นก้อนเดียว (`{attrs,tags,links,ui}`), `getChildAttrCounts(parentId)` นับ attribute ของ Minor ทุกตัวด้วย GROUP BY เดียว, `getNestItems(nexusRef)` คืนรายการ content item ของทุกโมดูลในวอลต์ในคำเรียกเดียว (แถวบางเฉพาะคอลัมน์ที่ `nameOf` ใช้ — ไม่ดึง `chapter_content`/`story`/`last_message`); `getContentItemCounts` ถูกลบ (นับจาก `.length` แทน) |
| `classifier.js` | 195 | ระบบ category/object/template ของ kind `classifier` (แยกตารางจาก Director เดิม); `getObjectsFull(moduleRef)` (**Plan part2 #2.1**) รวม object+template+attribute+private template ของทั้งโมดูลใน `readTx` เดียว พร้อมประกอบ `attrMap`/`conditionMap`/`privateTemplates` ให้เสร็จฝั่ง db แทนที่ renderer จะยิง `getAttrs`+`getObjectTemplates` ต่อ object |
| `author.js` | 55 | หนังสือ/บทของ kind `author` (`createBookChapter`/`updateBookChapterContent`) |
| `narrator.js` | 75 | กราฟบทสนทนาของ kind `narrator` (`story_dialogue/story_talk/story_edge`) |
| `chatscribe.js` | 82 | โน้ตแชทของ kind `scribe` (ChatScribe) |
| `wanderer.js` | ~35 | เข็มหมุด TimeMap ของ kind `wanderer` (`map_event`) — pin อ้างอิง vault entity ใดก็ได้ผ่านคอลัมน์ `linker_key` (เหมือน `sketch_pin`/`import_file`/`design_node`) แทน `label` เดิม (คอลัมน์เก่ายังอยู่ แต่ไม่อ่าน/เขียนแล้ว); `createMapEvent`/`updateMapEvent` รับ `area_ref` ด้วย (Plan part5 W4) |
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
| `hub.js` | ~1240 (เดิมเอกสารว่า 781 — ตัวเลขนี้ตกค้างมาหลายรอบ ยังไม่ได้ sync เต็ม) | Nexus nest hub: module rail (+ `goToNexusNestHub` home button, ปุ่มแรกในแถบ ก่อน "+create"), accordion (Nest/Sage Hut/Import Dock — แต่ละ section มี `.acc-body` เลื่อนแยกกันเองผ่าน `#hub-body` flex layout, ดู style.css), nest tree drag-drop (โมดูลไหนก็ reparent ข้าม parent ได้ ไม่ล็อกเฉพาะ top-level แล้ว — `onNestDrop`), `buildNestRow`/`buildNestItemRow` เรนเดอร์ `.tree-chev-spacer` แทนที่ chevron ว่างเปล่าเมื่อแถวไม่มี child (Plan part1 #5 — กัน `.kicon` เลื่อนซ้ายไม่ตรงคอลัมน์กับแถวข้างเคียง), context menu (ปุ่ม "Create" เปิด hover submenu แทนการแสดง kind-list แบนราบเดิม — `openCreateSubmenu`/`positionSubmenuNear`)/rename/duplicate/move-to/pin/**"เปิดในหน้าต่างใหม่"**+**"เปิดใน Pane ใหม่ ▸"** (เฉพาะ module ที่มี Builder page เอง คือไม่ใช่ `collector` — `openModuleInNewWindow`/`openModuleInNewPane`/`openPaneDirectionSubmenu`/`buildPaneDirectionListHtml`, Plan part1 #3), icon popup, `buildModuleDetailHtml`, `wrapPageView` (ห่อ Sage Hut/Import Dock file-preview/Kind Browser ด้วย resize handle — Plan part1 #2). **Plan part2 #2.5**: `reloadModuleTree` ดึง `module:getNestItems` คู่กับ `getTree` แล้วเติมทั้ง `S.nestItems` ผ่าน `seedNestItems`/`seedNestItemsFor` (ทุกโมดูล content kind ได้ entry เสมอ — โมดูลว่างได้ `[]` — จึงไม่มีการ fetch lazy ทีละโมดูลตอนเรนเดอร์แรกอีก); `scheduleNestRender()` รวบ re-render ที่มาจาก path async (`ensureNestItemsLoaded`/`invalidateNestItems`/`closeStaleItemTabs`) เป็นครั้งเดียวต่อ microtask — `renderNexusHome()` เองยังเป็น sync ตามเดิม; `invalidateNestItems` ดึงลิสต์ครั้งเดียวแล้วส่งต่อให้ `closeStaleItemTabs` (เดิมดึงซ้ำ 2-3 รอบ) และเคลียร์ `S.sageHutCache` |
| `builder.js` | 618 | Editor-group shell — recursive split-pane layout tree (`builderSplitPane`/`builderClosePane`, ซ้อนได้ไม่จำกัดชั้น, Part 4), tab drag-reorder/cross-pane move/pop-out เป็นหน้าต่างแยก, toggle Module Inspector dock, auto-split เมื่อลาก tab ไปวางขอบ pane; `pruneStaleLayoutElements` กวาด DOM ที่หลงเหลือจาก legacy view (เช่น Scribe, Nexus picker — เขียนทับ `#main-inner.innerHTML` ตรงๆ) ออกก่อน re-render grid ทุกครั้ง กัน pane ค้างที่ปิดไม่ได้ |
| `inspector.js` | 212 | Module Inspector dock: description/แท็ก/แอตทริบิวต์/ลิงก์/ปุ่ม Version History; `loadInspectorData` เรียก `module:getInspector` ครั้งเดียวแทน 4 call ขนาน (Plan part2 #2.1) — คีย์ `{attrs,tags,links,ui}` เหมือนเดิมเพราะ hub.js/mod/classifier.js/mod/manager.js อ่าน (และแก้) `S.inspectorData` ตรงๆ |
| `iconpicker.js` | 266 | Icon/Color picker ฝัง (ไอคอนแอป/symbol เดิม/อัปโหลด+crop วงกลม) |
| `versions.js` | 78 | แผง Version History (แทน Inspector dock ชั่วคราวตอนเปิด) |
| `guide.js` | 105 | Coach-mark แนะนำหลังสร้าง Nexus แรก (`GUIDE_STEPS`, ข้าม step ที่หา DOM เป้าหมายไม่เจอ) |
| `artisan.js` (แก้ไข) | 258 | เปลี่ยนจากเทมเพลตแบบ one-shot เป็น wizard ทีละหน้าประกอบ module v3 + ส่วน migrate ของเก่า (`fillArtisanMigrateList`/`runArtisanMigration`) |
| `quickswitch.js` (แก้ไข) | ~110+ | ขยายจาก quick switcher เดิมเป็น search-link overlay: scope chip, kind filter, Ctrl+Enter แทรก wikilink, Alt+Enter ปักหมุดลง canvas |
| `mod/manager.js` | — | UI ของ kind `manager` |
| `mod/detail.js` | — | UI ของ kind `inspector` ("Detail") |
| `mod/classifier.js` | — | UI ของ kind `classifier` |
| `mod/locator.js` | — | UI ของ kind `locator` (รียูส `map.js` เดิม — area label ใช้ shoelace centroid จาก hull จริงแทน vertex-average เดิม, ลาก area ทั้งชิ้นได้จากการลากใน fill โดยตรง ไม่ใช่แค่ vertex, Plan part5 L1/L2) |
| `mod/chronicler.js` | ~600 | UI ของ kind `chronicler` (รียูส `timeline.js` เดิม) — จำกัด 1 timeline line/module, Compare view เลือก chronicler module อื่นแทน line อื่น (`modulesOfKind('chronicler')`, core.js); view ใหม่ `calendar` (ปฏิทิน raw year/month/day, ตั้งค่า days/week·days/month·months/year·ชื่อวัน-เดือนได้ผ่าน `module_ui.calendarConfig`); คลิก dot ของ event เปิด icon-picker popup แทน color swatch เดิม (`openChroniclerEventIconPopup`) |
| `mod/wanderer.js` | ~270 | UI ของ kind `wanderer` — view `dual` เดิมถูกแทนที่ด้วย `area` (Map + Area List ข้างกัน + oneline timeline ด้านล่าง, `S.wandererData.openAreaId` เปิดได้ทีละ area); area บนแผนที่เป็น terrain เฉยๆ ไม่ react ต่อคลิกอีกต่อไป, คลิกบน area ในโหมด placing เปิด modal สร้าง link ได้เลย (ไม่ต้องคลิกที่ว่าง); link modal เลือก vault entity ใดก็ได้ผ่าน `api.wiki.quickIndex` (ไม่ใช่แค่ classifier object/element/character) แทน label ข้อความอิสระเดิม (Plan part5 W1-W5) |
| `mod/narrator.js` | — | UI ของ kind `narrator` |
| `mod/author.js` | — | UI ของ kind `author` |
| `mod/chatscribe.js` | — | UI ของ kind `scribe` (ChatScribe) |
| `mod/viewer.js` | — | UI ของ kind `viewer` |
| `mod/drafter.js` | — | UI ของ kind `drafter` — blank markdown page; export button (`exportDrafterFile`) เขียนไฟล์ .md/.txt ผ่าน `api.drafter.exportFile` (Plan part5) |
| `mod/connector.js` | — | UI ของ kind `connector` — scroll-wheel ซูมได้ตรงๆ ไม่ต้องกด Ctrl แล้ว, hint text แยกเป็น `connectorPanHint` ของตัวเอง (Plan part5) |
| `mod/sketcher.js` | — | UI ของ kind `sketcher` |
| `mod/designer.js` | — | UI ของ kind `designer` — scroll-wheel ซูมตรงๆ, node-edge arrow ใช้ขนาด DOM จริง (`data-node` attr) แทน radius เดา, link picker มี type-filter (`designerLinkFilter`, module_ui) (Plan part5) |
| `mod/sagehut.js` | 160 | Hub section: สถิติวอลต์ (ใช้ `db/sage.js` บางฟังก์ชัน); header มีไอคอน `I.sage` แล้ว (Plan part1 #4, เดิมไม่มีไอคอนทำให้ header สูงไม่เท่า Nexus Nest); `buildSageHutHtml` ห่อด้วย `wrapPageView` (Plan part1 #2); **Plan part2 #2.3** — `openSageTab` ดึงเฉพาะ payload ที่แท็บนั้นใช้ และ memo ไว้ที่ `S.sageHutCache` ต่อ nexus ผ่าน `sageHutCached()` (เดิมยิงครบ 3 ก้อนทุกครั้งที่คลิกแท็บ รวม `wiki:getGraph` ที่แพงสุด) |
| `mod/fileviewer.js` | 335 | Hub section: Import Dock — list/link ไฟล์ + viewer read-only ใน Builder; `buildFileViewerHtml` ห่อด้วย `wrapPageView` (Plan part1 #2); **Plan part2 #2.2** — `hydrateDisplayImages` ชี้ `<img src>` ไปที่ `ddx-file://<importFileId>` ตรงๆ (ไม่มี IPC เลย) แทนการ await `importdock:readFile` ทีละรูป, `queueDisplayImageFallback`/`flushDisplayImageFallback` เป็นทาง fallback ผ่าน `onerror` (รวมทุกรูปที่ล้มเป็น `importdock:readFiles` ครั้งเดียว) สำหรับ renderer ที่ไม่มี protocol เช่น web-driver harness, `invalidateDisplayImages()` เคลียร์ทั้ง `S.displayImageCache` และ `S.displayImageData` (เดิมตัวหลังไม่เคยถูกล้างเลย → ไฟล์ที่ถูกแทนที่บนดิสก์ค้างเก่าทั้ง session) |

`vendor/` เพิ่ม konva/d3 เดิมยังใช้ร่วม (ไม่มีไฟล์ vendor ใหม่ในรอบนี้)

## Cloud Sync (Supabase) — ไฟล์ใหม่ (2026-07-17), เปลี่ยนเป็น Token Sync (2026-07-30)

ซิงก์ Nexus vault ขึ้น Supabase แบบ snapshot + โทเคน 16 หลักต่อการ push
(`1234-5678-9012-3456`, สร้างใหม่ทุกครั้ง) + login Google (Supabase Auth) +
quota ตาม tier บัญชี — ดูรายละเอียดพฤติกรรม/วิธีใช้ที่ [SYNC.md](SYNC.md)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `src/db/sync.js` | ~1005 | ทั้งฟีเจอร์ฝั่ง main: config ใน `app_setting` (`sync:url`/`sync:anonKey`/`google:refreshToken`/`sync:slotMap`), Google login (`syncGoogleLogin/Logout/AuthStatus` — PKCE + loopback ผ่าน `src/db/oauth-loopback.js` ที่ใช้ร่วมกับ Google Drive Backup, access-token refresh อัตโนมัติ), `generateToken` (crypto, 16 หลัก), `rpc()` fetch wrapper (แนบ Bearer access-token เมื่อ login แล้ว, error taxonomy `{ok,code,error}` ไม่ throw), `serializeVault(nexusId, moduleIds?)` (2026-07-30: เพิ่ม `moduleIds` optional — scope ทุกคิวรีจาก `m.nexus_ref=?` เป็น `m.id IN (...)`, ตารางระดับ vault-global อย่าง relations/notes ถูกข้ามเมื่อ scope ผ่าน `allGlobal()`), `collectModuleSubtreeIds(nexusId, moduleId)` (เดินต้นไม้ `parent_id` ในหน่วยความจำ ไม่ใช้ SQL recursive CTE), `applySnapshotCore(nexusId, payload, {wipe, updateNexusMeta, reparentRootTo})` (แกนกลางที่ `applySnapshot`/`importModuleSnapshot` เรียกใช้ร่วมกัน), `applySnapshot` (wipe-and-rebuild ทั้ง nexus เหมือนเดิม, เรียก core ด้วย `wipe:true`), `importModuleSnapshot(nexusId, parentModuleId, payload)` (ใหม่ — merge module subtree เข้า nexus แบบเพิ่มเข้าไปเท่านั้น ไม่ล้างของเดิม, ใช้โดย `src/db/db-transfer.js`), ops: `syncStatus/syncPushVault/syncPullVault/syncPullByToken/syncDeleteUpload` (คืนรายการ "ช่องอัปโหลด" ของบัญชี ไม่ใช่ช่องเดียวอีกต่อไป) |
| `src/renderer/sync.js` | ~230 | หน้าต่างซิงก์หลายสถานะ (ตั้งค่าเซิร์ฟเวอร์ / ยังไม่ login / login แล้ว—รายการช่องอัปโหลด), แผงโทเคนแบบแสดงครั้งเดียว + คัดลอก, ช่องกรอกโทเคนพร้อม sub-flow เผยรหัสผ่านเมื่อเจอ `bad_password`, `syncErrToast` map error code → i18n toast; เข้าจากปุ่ม ☁ ใน vault-head (core.js); โหมด dev ข้ามหน้าตั้งค่าและแสดงป้าย dev server |
| `src/db/sync-devserver.js` | ~230 | เซิร์ฟเวอร์ซิงก์จำลองสำหรับ build dev (`!app.isPackaged`): HTTP in-process บน loopback, endpoint/กติกา auth/tier-quota/expiry/lockout เหมือน migration ใหม่ทุกอย่าง, bearer token รูปแบบ `<uid>:<tier>` (login จำลองฝั่ง `sync.js` ไม่ผ่าน `/auth/*` จริง), เก็บ state เป็น `dev-sync-server.json` ข้าง novel-manager.db; `ensureDevSyncServer()` เริ่ม lazy ครั้งเดียวต่อโปรเซส |
| `supabase/migrations/20260717000000_dracondex_sync_prototype.sql` | ~200 | migration เดิม (ตาราง/ฟังก์ชันคีย์ถาวรถูก `drop` ทิ้งทั้งหมดโดย migration ถัดไป — คงไฟล์นี้ไว้เพราะเคย apply แล้ว ห้ามแก้ไข) |
| `supabase/migrations/20260730000000_dracondex_token_sync.sql` | ~250 | Token Sync จริง: ตาราง `sync_account(owner_id, tier)`, คอลัมน์ใหม่บน `sync_vault` (`owner_id`/`token_hash`/`password_hash`/`expires_at`/`pull_fail_count`/`pull_locked_until`, ไม่ unique ต่อ owner อีกต่อไป — หลายแถวต่อบัญชีได้ตาม quota), RPC SECURITY DEFINER 5 ตัว (`token_sync_push/status/delete/pull_own/pull_by_token`), helper `_sync_tier/_sync_max_bytes/_sync_max_slots` (free 1 ช่อง/10MB, pro 3 ช่อง/20MB) |
| `docs/SYNC.md` | — | คู่มือวิธีใช้ + หลักการทำงานของฟีเจอร์นี้ |

ไฟล์เดิมที่แตะ: `main.js` (`sync:*` handler เปลี่ยนชุด — เพิ่ม
`googleLogin/googleLogout/authStatus/pullByToken/deleteUpload`, ตัด
`link/createReadKey/unlink`), `preload.js` (`api.sync` namespace ตามชุดใหม่),
`css/builder.css` (เพิ่ม `.sync-upload-row`/`.sync-upload-actions`/
`.sync-tag-chip`), `src/renderer/i18n.js` (คีย์ `sync*` ชุดใหม่ครบ 18 locale
แทนที่ชุดคีย์ระบบคีย์ถาวรเดิม)

## Google Drive Backup — ไฟล์ใหม่ (2026-07-30)

สำรอง layout profile และ/หรือไฟล์ฐานข้อมูล .ddx ไปยังโฟลเดอร์ appdata ของ
Google Drive ผู้ใช้ — login แยกอิสระจาก Cloud Sync — ดูรายละเอียดที่
[DRIVE.md](DRIVE.md)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `src/db/oauth-loopback.js` | ~55 | ดึงออกจาก `src/db/sync.js` (ไม่มีการเปลี่ยนพฤติกรรม): `makePkcePair()` + `runOAuthLoopback(buildAuthUrl, {timeoutMs})` — เซิร์ฟเวอร์ loopback ชั่วคราวบน `127.0.0.1` ที่รับ redirect ของ authorization code, คืน `{code, redirectUri}`; ใช้ร่วมกันทั้ง Cloud Sync (`sync.js`) และ Google Drive Backup (`drive.js`) |
| `src/db/drive.js` | ~450 | ทั้งฟีเจอร์ฝั่ง main: config ใน `app_setting` (`drive:clientId`/`drive:clientSecret`/`drive:refreshToken`/`drive:email`/`drive:autoBackup`/`drive:backupLayout`/`drive:backupDdx`/`drive:backupLog`/`drive:lastBackupAt`), Google OAuth ตรงกับ Google (ไม่ผ่าน Supabase) ผ่าน `oauth-loopback.js`, token refresh ตรงที่ `oauth2.googleapis.com`, Drive API v3 บน `appDataFolder` เท่านั้น (`driveFindFile`/`driveUpsertFile`/`driveDownloadFile`/`driveGetQuota`, multipart upload ตาม RFC 2387), ops: `driveBackupNow`/`driveRestoreLayoutProfile`/`driveRestoreDatabase` (reuse `exportDatabaseTo`/`importDatabaseMerge` จาก `import-merge.js` โดยตรง), `driveGetBackupLog()` (2026-07-30, ใหม่ — getter ตัวแรกของ `drive:backupLog` ที่เขียนไว้อยู่แล้วแต่ไม่เคยมีใครอ่านกลับ), layout-slot ops (2026-07-30, ใหม่ — Setting window User profile): `driveListLayoutSlots`/`driveSaveLayoutSlot`/`driveRestoreLayoutSlot`/`driveDeleteLayoutSlot` เก็บลง appdata **คนละไฟล์** กับ auto-backup (`LAYOUT_SLOTS_FILE = 'dracondex-layout-slots.json'` แยกจาก `LAYOUT_FILE` เดิม) เพื่อไม่ให้ auto-backup รายชั่วโมงเขียนทับรายการ slot ที่ตั้งชื่อไว้ |
| `src/db/drive-devserver.js` | ~200 | เซิร์ฟเวอร์ Drive จำลองสำหรับ build dev: HTTP in-process บน loopback, endpoint รูปแบบเดียวกับ Drive API v3 จริง (about/files list/create/update/get) รวมถึง multipart parsing ด้วย Buffer (ไม่ใช่ string) เพื่อไม่ทำลายไฟล์ .ddx ไบนารี, จำลองโควตาผ่าน env var `DDX_DEV_DRIVE_QUOTA_PCT`, เก็บ state เป็น `dev-drive-server.json` ข้าง novel-manager.db |
| `docs/DRIVE.md` | — | คู่มือวิธีใช้ + หลักการทำงานของฟีเจอร์นี้ |

ไฟล์เดิมที่แตะ: `main.js`/`preload.js` (namespace `drive:*`/`api.drive` ใหม่
+ layout-slot/backup-log channels ใหม่ 2026-07-30), `database.js`
(re-export `src/db/drive.js`), `index.html` (script tag
`src/renderer/drive.js`), `src/renderer/core/boot.js`
(`initDriveAutoBackup()` ใน `init()`), `css/builder.css` (เพิ่ม
`.drive-bar`/`.drive-bar-fill`), `src/renderer/i18n.js` (คีย์
`drive*`/`prefs_backup` ใหม่ครบ 18 locale). **2026-07-30**: หน้าตั้งค่านี้
ย้ายจาก Preferences panel (`PREFS_SECTIONS`+`'backup'`) ไปเป็นหน้า
**BackupData** ใน Setting window ใหม่ — `prefsBackupSectionHtml()` ถูก
เปลี่ยนชื่อเป็น `settingBackupPageHtml()` ลงทะเบียนผ่าน
`registerSettingPage('appdata','backup', ...)` แทน (ดูหัวข้อ "Setting
Window" ด้านล่าง)

## Firebase Version Notice — ไฟล์ใหม่ (2026-07-30)

แจ้งเตือนเมื่อมีเวอร์ชันใหม่ (ไม่ใช่ auto-updater) — ดูรายละเอียดที่
[UPDATE.md](UPDATE.md)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `src/db/update.js` | ~90 | `checkForUpdate()` (อ่าน Firestore REST doc สาธารณะ 1 ชิ้น, เช็ก login ผ่าน `syncAuthStatus()`/`driveStatus()`, เปรียบเทียบเวอร์ชันแบบ semver-ย่อ, ไม่ throw เด็ดขาด), `dismissUpdate`/`openUpdateDownload`; โหมด dev ไม่มี mock server แยก — ใช้ env var `DDX_DEV_UPDATE_VERSION` บังคับเวอร์ชัน "ล่าสุด" จำลอง |
| `src/renderer/update.js` | ~30 | `initVersionCheck()` (เรียกจาก boot.js ครั้งเดียว, fire-and-forget) + modal แสดงเวอร์ชันใหม่/release notes/ปุ่มดาวน์โหลด+เตือนภายหลัง |
| `docs/UPDATE.md` | — | คู่มือวิธีใช้ + หลักการทำงานของฟีเจอร์นี้ |

ไฟล์เดิมที่แตะ: `main.js`/`preload.js`/`database.js` (namespace `update:*`
ใหม่), `index.html` (script tag `src/renderer/update.js`),
`src/renderer/core/boot.js` (`initVersionCheck()` ใน `init()`),
`src/renderer/i18n.js` (คีย์ `update*` ใหม่ครบ 18 locale)

## Plugins (เดิม Github Sandboxed Extensions) — (2026-07-30, เปลี่ยนชื่อ 2026-08-06)

ดาวน์โหลดปลั๊กอินจาก git repo ที่ประกาศตารางฐานข้อมูลของตัวเอง รันใน
หน้าต่างแยกที่ถูกจำกัดสิทธิ์ — ดูรายละเอียดที่ [PLUGINS.md](PLUGINS.md)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `src/db/plugin-manifest.js` | ~285 | **ใหม่ 2026-08-06** — logic ล้วนๆ ไม่ `require` electron/db เลย จึงเทสต์ด้วย `node --test` ตรงได้: identifier whitelist ทั้งชุด (`PLUGIN_ID_RE`/`PLUGIN_TABLE_RE`/`PLUGIN_COLUMN_RE`/`FULL_TABLE_RE` = `plg_*`/`REPO_SEG_RE`, ชนิดคอลัมน์แค่ TEXT/INTEGER/REAL), `validateManifest()`, `parseRepoUrl()` (แกะลิงก์ git ทุกรูปแบบ: https/ssh/scp/ไม่มี scheme/`owner/repo` ย่อ/`/tree/<ref>`/GitLab nested group), `rawUrl()` (raw URL ของ GitHub และ GitLab), `MANIFEST_NAMES`/`REF_CANDIDATES`. **v4.3.0** — กฎของ `panels[]` (`PANEL_ID_RE`, entry ต้องเป็น HTML และอยู่ใน `files`) กับ `permissions` (`net` = origin `https://` ล้วน, `context` = `module`) + ตัวอ่านกลับ `manifestPanels`/`manifestNetOrigins`/`manifestContextKinds` และ `netOriginAllowed()` (เทียบ origin ไม่ใช่ prefix) |
| `src/db/plugin.js` | ~490 | `resolveRepo()` (ไล่ ref `main`→`master` × manifest `dracondex-plugin.json`→`dracondex-extension.json`), `pluginPreview()` (dry run อ่านอย่างเดียว ไม่แตะดิสก์/DB), `pluginInstall(url)` (รับ URL ตัวเดียวแล้ว resolve ใหม่เอง ไม่เชื่อพรีวิว — ดาวน์โหลดทีละไฟล์, เขียนไฟล์+DB แบบ transaction, ล้างทิ้งถ้าล้มเหลวกลางทาง), `pluginUninstall`/`pluginList`/`pluginGetById`, `migratePluginDir()` (ย้าย `extensions/`→`plugins/` บนดิสก์), `pluginApiQuery/Insert/Update/Delete/GetSchema` (ผูก ownership จาก `(plugin_ref, local_name)` เสมอ ไม่มี raw-SQL passthrough). **v4.3.0** — `pluginList()` คืน `dir`/`panels`/`netOrigins`/`contextKinds` (อ่านกลับจาก `manifest_json` ไม่ต้อง migration), `pluginByPanelPath()` (main.js ใช้ตรวจ src ของ `<webview>`), `pluginNetAllowed`/`pluginNetFetch`/`pluginNetStream` (จำกัด method/header/ขนาด/redirect), `pluginOAuthAuthorize()` (PKCE + loopback ผ่าน `oauth-loopback.js` ตัวเดิม) |
| `src/renderer/plugin.js` | ~245 | หน้า Setting → ปลั๊กอิน: ช่อง URL ช่องเดียว (`#plugin-url`) + auto-preview แบบ debounce 400ms + ปุ่มตรวจสอบ, `pluginPreviewHtml()` (การ์ดพรีวิว — ทุกฟิลด์ผ่าน `x()` เพราะเป็นข้อความจากอินเทอร์เน็ต), `pluginInstallClick()` (ส่งแค่ URL), รายการปลั๊กอิน + Launch/Stop/ลบ, หน้า Plugin setting (placeholder), `pluginPreviewGrantsHtml()` (v4.3.0 — โชว์ panels + net origins ก่อนติดตั้ง) |
| `preload-plugin.js` (repo root) | ~90 | preload แยกต่างหากสำหรับหน้าต่างปลั๊กอิน **และ panel** เท่านั้น — expose `window.pluginApi.table.*` (+ `window.extApi` เป็น alias ให้ของเก่า), ไม่มี `window.api` เลย. **v4.3.0** — เพิ่ม `net.fetch`/`net.stream` (buffer chunk ที่มาก่อน id จะ resolve), `oauth.authorize`, `panel.onMessage/send/close` (บน `sendToHost`, ไม่ผ่าน main process) |
| `src/renderer/pluginpanel.js` | ~150 | **ใหม่ v4.3.0** — จุดต่อขยาย Plugin panel: `loadPluginPanels()` (cache `S.pluginPanels` จาก `api.plugin.list()`), `openPluginPanel`/`closePluginPanel`/`togglePluginPanel`, `pluginPanelButtonsHtml()` (ปุ่มใน pane head, self-guard บน `S.activeModuleNode`), `buildPluginPanelHtml()` (`<aside class="module-inspector plugin-panel">` + `<webview>`), `mountPluginPanel()` (ผูก `ipc-message` และส่ง module context ตาม `permissions.context`) |
| `test/plugin-url.test.mjs` | ~250 | เทสต์ `parseRepoUrl`/`rawUrl`/`validateManifest` — ลิงก์ทุกรูปแบบที่ต้องผ่าน, โฮสต์อื่น/path traversal/percent-encoding ที่ต้องถูกปฏิเสธ, manifest fixture ที่ต้องไม่ผ่าน. **v4.3.0** — panels/permissions ที่ต้องผ่านและไม่ผ่าน, `netOriginAllowed` เทียบ origin ไม่ใช่ prefix, ตัวอ่านกลับที่ต้องทิ้งของเสียแทนที่จะเชื่อแถวที่เก็บไว้ |
| `docs/PLUGINS.md` | — | คู่มือวิธีใช้ + หลักการทำงาน + ข้อจำกัดด้านความปลอดภัยแบบตรงไปตรงมา + ตารางการเปลี่ยนชื่อ v4.1→v4.2 |

ไฟล์เดิมที่แตะ: `src/db/schema/ddl.js` (ตาราง `plugin`/`plugin_table` +
คอลัมน์ `repo_host`), `src/db/schema/migrations.js` (`migratePluginV42()`),
`src/db/schema/init.js` (เรียก `migratePluginV42` **ก่อน** `db.exec(DDL_SQL)`
+ ใส่ใน `parts[]` ของ `schemaStamp()`), `main.js`
(`createPluginWindow`/`pluginWindows` map, namespace `plugin:*` ผ่าน `h()`
ปกติ + `pluginapi:table:*` ผ่าน raw `ipcMain.handle` เพราะต้องอ่าน
`event.sender`, เรียก `db.migratePluginDir()` ที่ `app.whenReady()`),
`preload.js` (namespace `plugin` + ช่องใหม่ `plugin:preview` —
**ไม่แตะ** `pluginApi`), `database.js`, `index.html` (script tag),
`package.json` (`build.files` `preload-ext.js`→`preload-plugin.js`),
`css/builder.css` (`.plugin-preview*`), `src/renderer/i18n.js` (คีย์
`plugin*`/`prefs_plugin`/`settingGroupPlugin`/`settingPagePluginSettings`/
`settingPluginNoSettings` ครบ 18 locale),
`src/renderer/core/setting-window.js` (group `extension`→`plugin`,
pages `plugin`/`pluginsettings`).

**2026-07-30**: หน้าฟอร์มติดตั้งย้ายจาก Preferences panel
(`PREFS_SECTIONS`+`'extension'`) ไปเป็นหน้าใน Setting window ใหม่
(ลงทะเบียนผ่าน `registerSettingPage(...)`) พร้อมปุ่ม Stop ใหม่ที่เรียก
`extension:stop`/`extension:isRunning` ที่มีอยู่แล้วแต่ไม่เคยถูกเรียก และหน้า
setting placeholder รอ manifest ประกาศ settings schema

**2026-08-06 (v4.2.0)**: เปลี่ยนชื่อทั้งระบบ extension → plugin ลงลึกถึงชั้น
DB/ดิสก์ (`extension`→`plugin`, `ext_key`→`plugin_key`,
`extension_table`→`plugin_table`, `extension_ref`→`plugin_ref`,
`ext_<id>_<name>`→`plg_<id>_<name>`, `extensions/`→`plugins/`) โดย migrate
อัตโนมัติและ idempotent — ของเก่ายังใช้ได้ทั้ง `window.extApi` (alias) และ
`dracondex-extension.json` (fallback). เพิ่มการติดตั้งจากลิงก์ `.git`
ลิงก์เดียวพร้อมพรีวิวก่อนยืนยัน + รองรับ GitLab + เดา branch `main`→`master`
อัตโนมัติ. แก้บั๊กเดิม: `extensionBodyHtml(list, running)` ถูกประกาศเป็น
`(list)` แล้ว `list.map(extensionRowHtml)` ส่ง **index** เข้าไปเป็น
`isRunning` ทำให้แถวแรกโชว์ "เปิดใช้งาน" เสมอและแถวที่เหลือโชว์ "หยุด" เสมอ

## Setting Window — แทนที่ Preferences panel เดิม (2026-07-30)

Quick Setting popup ถูกตัดให้เหลือแค่ 4 อย่างตาม Plan.md + Setting window
เต็มรูปแบบ 2 ชั้น (group → page) แทนที่ `PREFS_SECTIONS`/
`openPreferencesPanel`/`prefsBodyHtml` เดิมทั้งหมด — พฤติกรรมละเอียดที่
[SYSTEMS.md §Setting Window](SYSTEMS.md)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `src/renderer/core/settings.js` | ~300 | (เปลี่ยน) `renderSettingsMenu()` ตัดเหลือ 4 อย่าง (ภาษา/name-mode/UI size/ปุ่มเปิด Setting window) + `quickThemeExtraHtml()`/`uiSizeOnlySliderHtml()` ใหม่; เก็บ `t/tr`, `setUiSetting()` (จุดเดียวที่ mutate `S.settings`), slider helper, theme-palette cache, `SHORTCUT_HELP`/`openShortcutsModal`/`replayGuideTour`/`setVersionLimit` (ย้ายไปแสดงใน Text&Size's Advanced reveal แทน) ไว้เหมือนเดิมเพราะ Setting window เรียกใช้ร่วม; ลบ `PREFS_SECTIONS`/`openPreferencesPanel`/`prefsBodyHtml`/theme-grid/language-preview/ui-size-advanced ทั้งหมด (ย้ายไป `setting-window.js`) |
| `src/renderer/core/setting-window.js` | ~200 | ใหม่ — เชลล์ของ Setting window: `SETTING_GROUPS`/`registerSettingPage(group,page,fn)`/`openSettingWindow()`/`selectSettingPage()`/`renderSettingWindow()` (แทนที่ `PREFS_SECTIONS`/`selectPrefsSection`/`renderPreferencesPanel` เดิม), หน้า Workspace→Theme (ย้ายจาก `prefsThemeSectionHtml`) และ Workspace→Text&Size (รวมภาษา+ขนาด UI+ขนาดตัวอักษร, `applyAreaScales()`/`setAreaScale()` — override `--fsc` เฉพาะ container ของแต่ละพื้นที่) |
| `src/renderer/core/tool-toggle.js` | ~85 | ใหม่ — หน้า Workspace→Tool toggle + gating จริง: `applyNavToggles()` (ซ่อน/โชว์ 4 ปุ่ม nav sidebar ผ่าน class `.tool-toggle-hidden`), `toggleNavSetting/toggleStatusSetting/toggleQuickExtra` (mutate `S.settings.{navToggles,statusToggles,quickExtras}`) |
| `src/renderer/core/account.js` | ~140 | ใหม่ — หน้า User→Account (อ่าน `api.sync.authStatus/status` ตรงๆ ไม่มี backend ใหม่) และ User→User profile (layout slot manager เรียก `api.drive.*LayoutSlot*` ใหม่) |
| `src/renderer/core/db-transfer.js` | ~110 | ใหม่ — หน้า Appdata→Database: list Nexus (`api.nexus.getAll`), module tree ต่อ Nexus แบบ expand (`api.module.getTree`), ปุ่ม export/import ทั้งระดับ Nexus และระดับ module เดี่ยว เรียก `api.db.export/importNexusFile`/`export/importModuleFile` ใหม่ — onclick ทุกจุดส่งแค่ id ไม่ฝัง name (กัน quote-escaping กรณีชื่อมี `'`) |
| `src/db/db-transfer.js` | ~40 | ใหม่ — ห่อ `serializeVault`/`applySnapshot`/`collectModuleSubtreeIds`/`importModuleSnapshot` (จาก `src/db/sync.js`) ด้วย file I/O: `exportNexusFile`/`importNexusFile`/`exportModuleFile`/`importModuleFile` |
| `test/module-transfer.test.mjs` | ~35 | ใหม่ — source-inspection test (แพทเทิร์นเดียวกับ `onboarding-tour.test.mjs` เพราะ `getDB()` ต้องการ Electron `app` จริง รันใน `node --test` ตรงๆ ไม่ได้) ยืนยันว่า `importModuleSnapshot` ไม่มีทาง wipe nexus ปลายทาง |

ไฟล์เดิมที่แตะ: `index.html` (script tag ใหม่ 4 ไฟล์ข้างต้น + ลำดับหลัง
`settings.js`), `src/renderer/core/state.js` (`loadUiSettings()` เพิ่ม
default `quickExtras`/`navToggles`/`statusToggles`), `src/renderer/core/
boot.js` (`applyNavToggles()`/`applyAreaScales()` เรียกครั้งเดียวหลัง
`renderModuleRail()`), `src/renderer/core/router.js` (`updateStatusBar()`
gate ทุก segment ด้วย `S.settings.statusToggles`), `src/renderer/sync.js`
(`settingTokenSyncPageHtml()` ใหม่ — หน้า Appdata→TokenSync เป็นแค่ทางลัดเปิด
`openSyncModal()` เดิม), `main.js`/`preload.js` (`db:export/importNexusFile`/
`export/importModuleFile`, `drive:listLayoutSlots`/`saveLayoutSlot`/
`restoreLayoutSlot`/`deleteLayoutSlot`/`getBackupLog` ใหม่), `database.js`
(re-export `src/db/db-transfer.js`), `css/nav-hub.css` (`.tool-toggle-hidden`),
`css/components.css` (`.setting-shell`/`.setting-sidebar`/`.setting-nav-*`/
`.setting-content` ใหม่ — `.prefs-*` เดิมยังอยู่เพราะ Theme/Text&Size page
reuse), `src/renderer/i18n.js` (คีย์ `setting*` ใหม่ 51 คีย์ครบ 18 locale)

## Workspace Styles — Wyvern/Drake/Dragon ครบทั้ง 3 (2026-07-31, part2 #New Workspace จบรอบ)

3 workspace style ตาม Plan.md (Wyvern/Drake/Dragon) ครบแล้วทั้ง 3
พฤติกรรมละเอียดที่ [SYSTEMS.md §Workspace Styles](SYSTEMS.md)

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `src/renderer/wyvern.js` | ~140 | Wyvern (เซสชันก่อนหน้า): `renderWyvernToolbar()` (toolbar ปุ่ม Views/Import/Export/Hashtag/Color/Create-module ทุกปุ่มเรียกฟังก์ชันเดิมของ Drake), `openWyvernViewSetMenu()` (popup 4 ตัวเลือก: Nexus Nest/Sage Hut/Import Dock/Import DB), `buildWyvernBrowseHtml()`/`wyvernDrillInto()`/`wyvernDrillUp()` (drill-down card-grid browser แทน left-panel tree), `renderWyvernHome()`/`buildWyvernPageHtml()` (`renderNexusHome()` override), `buildWyvernNexusPickerHtml()` (มิเรอร์ nexus picker list เข้า `#main-inner`, Dragon เรียกใช้ซ้ำตัวนี้ด้วย) |
| `src/renderer/dragon.js` | ~175 | ใหม่ — ทั้งฟีเจอร์ Dragon (freeform spatial canvas): `dragonLayoutFor()`/`dragonNodePosition()` (ตำแหน่งการ์ดต่อ nexus+parent เก็บใน `S.settings.dragonLayout`, client-only ไม่ผ่าน DB), `dragonBrowseCurrentList()`/`dragonDrillInto()`/`dragonDrillUp()` (drill-down เหมือน Wyvern แต่ render เป็นบอร์ดอิสระ), `buildDragonCanvasHtml()`/`mountDragonBoard()` (วาดการ์ด + ผูก pointerdown/move/up drag มิเรอร์ `mod/designer.js`), `renderDragonHome()`/`buildDragonPageHtml()` (`renderNexusHome()` override, ไม่มี toolbar ของตัวเอง) |
| `src/renderer/core/workspace-style.js` | ~65 | ใหม่ — Setting window → Workspace → หน้า "Workspace Style": `settingWorkspaceStylePageHtml()` (3 มockup card แบบ CSS wireframe, ไม่ apply ทันที), `selectPendingWorkspaceStyle()`/`applyWorkspaceStyleChoice()` (stage แล้วค่อย apply ผ่านปุ่ม "Apply & Restart" + `uiConfirm()` + `location.reload()`) |
| `css/workspace.css` | ~70 | stylesheet ที่ 15 (โหลดหลังสุด): เดิม (Wyvern) + เพิ่ม `body[data-workspace="dragon"]` (ซ่อนแค่ left-panel/builder-tabs/layout-menu-wrap, **คง nav-sidebar**), `.dragon-board`/`.dragon-card`, และ `.wsp-*` (mockup preview บนหน้า Setting) |

ไฟล์เดิมที่แตะ (รอบ Wyvern เดิม + รอบ Dragon/Setting page นี้รวมกัน):
`index.html` (splash script อ่าน `?workspace=`/`saved.workspaceStyle`,
`#workspace-toolbar` div, script tag ใหม่ 3 ไฟล์: `dragon.js`/
`workspace-style.js` เพิ่มจากรอบนี้), `src/renderer/core/state.js`
(`WORKSPACE_STYLE_OPTIONS`, `loadUiSettings()` เพิ่ม `workspaceStyle`/
`wyvernToolbarOrientation`/`dragonLayout`, `S.wyvernBrowsePath`/
`S.dragonBrowsePath`/`S.settingPendingWorkspace`/`S.importDockPage` ใหม่),
`src/renderer/core/boot.js` (`applyWorkspaceStyle()` — อ่าน `?workspace=`
override ใน memory เท่านั้น แล้วเรียกหลัง `applyUiSettings()`), `src/renderer/
core/views.js` (`renderNexusHome()` เพิ่ม branch เช็ก `workspaceStyle==='wyvern'`
และ `==='dragon'`, `runBuilderMounts()` เรียก `mountDragonBoard()` ท้ายสุด,
`buildBuilderPageHtml()` เพิ่ม `S.importDockPage` เข้า precedence chain),
`src/renderer/builder.js` (`builderNavigate()`/`builderPaneHeadHtml()`/
`onBodyDrop()` guard เดิมจาก `workspaceStyle==='wyvern'` ขยายเป็น
`workspaceStyle!=='drake'` ให้ Dragon ได้ no-tab/no-split/no-drag-split
แบบเดียวกันโดยไม่ก็อปโค้ดซ้ำ, ยืนยันแล้วว่า Drake ไม่กระทบ), `src/renderer/
hub/menus.js` (guard "เปิดใน pane ใหม่" ขยายจาก `==='wyvern'` เป็น
`!=='drake'` เหมือนกัน), `src/renderer/core/setting-window.js`
(`SETTING_GROUPS.workspace` เพิ่ม `'style'`, `SETTING_PAGE_LABEL_KEY.style`),
`src/renderer/hub/sections.js` (`goToImportDockPage()`/`buildImportDockPageHtml()`
— หน้า Import Dock แบบเดี่ยว มิเรอร์ `goToKindBrowserHub()`), `src/renderer/
hub/kinds.js` (`goToNexusNestHub()`/`atHubHome` clear `importDockPage`/
`wyvernBrowsePath`/`dragonBrowsePath`), `src/renderer/core/nexus.js`
(`clearWorkspaceTabs()` clear `wyvernBrowsePath`/`dragonBrowsePath`),
`src/renderer/hub/open.js`/`src/renderer/mod/fileviewer.js`/`item.js`/
`sagehut.js` (clear `S.importDockPage` ที่จุดเดิมทุกจุดที่ clear
`S.kindBrowserPage` อยู่แล้ว), `src/renderer/i18n.js` (คีย์ `wyvernViewSet`
เดิม + คีย์ใหม่รอบนี้ `settingPageWorkspaceStyle`/`workspaceStyleDrakeDesc`/
`workspaceStyleWyvernDesc`/`workspaceStyleDragonDesc`/`settingWorkspaceApply`/
`settingWorkspaceApplyConfirm` ครบ 18 locale)

---

## src/db/ — ชั้นฐานข้อมูล (รันใน main process)

ทุกไฟล์ pattern เดียวกัน: `getDB()` จาก core แล้ว export ฟังก์ชัน query ตรง ๆ
(prepared statement ต่อครั้ง) — ชื่อฟังก์ชันตรงกับ handler ใน main.js

| ไฟล์ | บรรทัด | รับผิดชอบ |
|---|---|---|
| `core.js` | ~1400 | เปิด/adapt DB, **schema ทั้งหมด ~78 ตาราง** (v2.8 เพิ่ม `nexus`, `note_folder`, `note`, `wiki_link`), migrations (legacy Navigator, Hero v2.6, Writer v2.7, **Nexus v2.8** `migrateNexusV28` — adopt project เก่าเข้า vault เริ่มต้น + backfill `wiki_link` ครั้งแรก), seed สัญลักษณ์, `ensureIndexes()`, export/import-merge (v2.8 รวม nexus/note ด้วย แล้ว `rebuildWikiIndex()` หลัง merge); Plan part5: additive columns `timeline_event.icon TEXT`, `map_event.linker_key TEXT` (`map_event.label` เดิมยังอยู่แต่เลิกใช้แล้ว) |
| `nexus.js` | 41 | (v2.8) CRUD ของ Nexus vault: `getNexuses` (พร้อมนับ project ต่อ vault), `getNexus/createNexus/updateNexus`, `deleteNexus` (คืน `{blocked,count}` ถ้ายังมี project อยู่) |
| `director.js` | ~155 | folder / project / project_description / category / template / object / attribute + `searchAll` (ค้นหา global) — v2.8: `getProjects/searchAll` รับ `nexusId`, `createProject` เซ็ต `nexus_ref`, `createObject/updateObject/updateObjectNote` hook เข้า wiki reindex/resolve |
| `color.js` | 27 | ตาราง `use_color`: getAll/add/markUsed/getRecent/delete |
| `timeline.js` | ~70 | timeline / `getOrCreateDate` (normalize วันที่สมมุติ) / event CRUD + story; `timeline_event.icon TEXT` คอลัมน์ใหม่ (additive), `updateEventIcon(id,icon,color)` เซฟ icon+color พร้อมกันจาก event dot popup (Plan part5 C4) |
| `map.js` | 34 | map / area / จุด polygon (`setPoints` ลบ-แทรกใหม่ทั้งชุด) |
| `relation.js` | 126 | relation_type + relation 3 ชนิด (OBOB/OBTL/TLTL) + query รวม object/event ของโปรเจกต์ + ลิงก์ของ event |
| `hashtag.js` | 67 | ตาราง hashtag + mapping project/object/event + query "ใครใช้แท็กนี้" |
| `navigator.js` | ~450 | ทุกอย่างของ World: world CRUD (v2.8: `getWorlds/createWorld` รับ `nexusId`), เชื่อมนิยาย, ตัวละครโลก+ลิงก์, category/object/template/attr ของโลก (orig_*), world description, world tags, map timeline + การวาง object บนแผนที่ต่อเหตุการณ์, symbol collection |
| `hero.js` | ~390 | ทุกอย่างของ Game: เกม (v2.8: `getGames/createGame` รับ `nexusId`), novel link (unique ต่อนิยาย), import category/object, ตัวละคร+template มี level+attr+element, collection+element+template+attr, story/dialogue/conversation/storyline, แท็กเกม |
| `writer.js` | ~200 | write project (v2.8: `getWriteProjects/createWriteProject` รับ `nexusId`) / series / book / chapter (+เนื้อหา+ลำดับ, v2.8: `updateWriteChapterContent` hook เข้า wiki reindex) / novel link / wiki / word link / note / chat |
| `scribe.js` | 78 | (v2.8) note_folder + note CRUD ผูก `nexus_ref`, `UNIQUE(nexus_ref,title)`; `createNote` auto-suffix ชื่อชนกัน + resolve dangling wikilink; `updateNoteContent/updateNote` hook เข้า wiki reindex |
| `wiki.js` | 516 | (v2.8) แกน wikilink ทั้งหมด: `resolveWikiName` (ลำดับ precedence ตายตัว + namespace escape), `reindexWikiLinks`, `rebuildWikiIndex` (backfill/หลัง import), `getBacklinks/getOutgoingLinks/resolveEntityKeys`, `quickIndex` (ป้อน quick switcher + `[[` autocomplete), `getEntityPath` (นำทางลึกถึง entity), `explorerTree` (โครงต้นไม้ทั้ง vault), `getGraph` (node/edge ทั้ง vault รวม wiki_link), `renameWikiTarget`/`resolveDanglingLinks` (rename safety). **Plan part2 #2.4**: `rebuildWikiIndex`/`resolveDanglingLinks` ห่อ transaction เดียว (`reindexWikiLinks` ที่ซ้อนอยู่กลายเป็น no-op เพราะ `db.transaction` reentrant) — สำคัญสุดกับ backfill ใน `initDB` ที่รันก่อน `setStatementCache(true)`; `withResolveMemo()` memo `resolveWikiName` **เฉพาะช่วง bulk เท่านั้น ไม่ใช่ตลอด process** (การสร้าง entity ใหม่ทำให้ชื่อที่เคย resolve เป็น null กลายเป็นไม่ null — คือเหตุผลที่ `resolveDanglingLinks` มีอยู่); `resolveEntityKeys` เปลี่ยนจาก 1 query/คีย์ เป็น `IN` ต่อ prefix (`KEY_IN_SQL`, arity คงที่ 64 + pad ด้วย id ซ้ำ เพื่อไม่ให้ statement cache ของ core.js ที่คีย์ด้วยสตริง SQL แตกเป็นหลายรูป) โดยยัง**รักษาลำดับ input** ไว้ (UI แสดง backlink ตามลำดับนี้ตรงๆ) และยังตัดคีย์ที่ resolve ไม่ได้ทิ้งเหมือนเดิม |
| `sage.js` | 114 | query สถิติ read-only ของ Sage Hut: `sageHutStats` (9 aggregate scan ใน `readTx` เดียว — Plan part2 #2.3 ย้าย `LENGTH(description)` ต่อโมดูลจาก loop ที่ `prepare()` ซ้ำทุกรอบ ไปเป็นคอลัมน์ `desc_bytes` ในคิวรีรายชื่อโมดูลที่ดึงอยู่แล้ว), `sageHutLinkerList` (ห่อ `readTx` แล้วเช่นกัน) |
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
- `FMT_ACTIONS` (toolbar เมื่อ `opts.toolbar:true`, ปัจจุบันมีแค่ Drafter ที่เปิดใช้)
  เพิ่ม 3 ปุ่มใหม่ (Plan part5 Drafter #2): checkbox (`- [ ] `, line-prefix),
  hr (`\n---\n`, line-prefix), code block (` ``` ` wrap-selection) — เป็น
  shortcut แทรก syntax ที่ `mdRender()` (markdown.js) รองรับอยู่แล้ว ไม่ได้
  แก้ rendering ใดๆ

### core.js — โครงหลักของ renderer

> 📁 **แยกเป็น `src/renderer/core/` 12 ไฟล์แล้ว (Plan part1)** — ดูตารางไฟล์ที่
> [Re-architecture](#re-architecture--การแยกไฟล์-plan-part1-2026-07-26)
> รายละเอียดพฤติกรรมด้านล่างยังถูกต้อง เพียงกระจายอยู่คนละไฟล์
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
- **คอมโพเนนต์ร่วม (อัปเดต 2026-07-25)**:
  - `toast(msg,type)` + ตาราง `TOAST_CLS` — map `'error'→'err'`, `'success'→'ok'`
  - `openModal()` โฟกัส field แรกใน `#modal-body` ให้เอง (fallback เป็น `#modal`)
  - `bindModalEscape()` — Escape ปิด modal หลัก (bubble phase, มี guard กัน
    overlay ที่ซ้อนอยู่ด้านบนและกัน welcome modal)
  - `uiPrompt(msg,opts)` — คู่แฝดรับข้อความของ `uiConfirm` แทน native `prompt()`
    คืน `Promise<string|null>`; Esc = ยกเลิก, Ctrl+Enter = ตกลง
  - `setBusy(el,on)` — ครอบ spinner `.busy-veil` + ตั้ง `aria-busy`
  - `openShortcutsModal()` / `replayGuideTour()` + ตาราง `SHORTCUT_HELP`
    (หมวด "ช่วยเหลือ" ในเมนูเฟือง)
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
- **Drag-to-resize handles** (mousedown → document-level mousemove/mouseup →
  localStorage-persist, ค่า clamp คนละช่วง): `startLeftPanelResize`
  (sidebar), `startPageViewResize` (Sage Hut/Import Dock file-preview/Kind
  Browser page — `S.pageViewWidth`, clamp 480px–ความกว้าง pane จริง, Plan
  part1 #2) — คู่กับ `startInspectorResize` ใน `inspector.js`

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

### search.js (58 บรรทัด)
- ผูก `#search-input` → `api.search.all(q)` → render ผลแยกกลุ่ม (โปรเจกต์ /
  object / แท็ก) คลิกแล้วกระโดดไป (`selectSearchProject/Object/Hashtag`)
- ท้ายไฟล์คือจุด START ของทั้งแอป: `init().catch(...)` — `.catch` เพิ่ม
  2026-07-25 เพราะ `init()` จบด้วย `__splash.finish()` ถ้า throw ระหว่างทาง
  splash เต็มจอจะทับแอปจนกว่า watchdog 20 วิจะทำงาน

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

### navigator.js — Navigator (World)

> 📁 **แยกเป็น `src/renderer/navigator/` 9 ไฟล์แล้ว (Plan part1)**, โหลดเป็นกลุ่ม
> ผ่าน `loadGroup('navigator')`
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

### hero.js — Hero (Game)

> 📁 **แยกเป็น `src/renderer/hero/` 6 ไฟล์แล้ว (Plan part1)**, โหลดเป็นกลุ่ม
> ผ่าน `loadGroup('hero')`
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
