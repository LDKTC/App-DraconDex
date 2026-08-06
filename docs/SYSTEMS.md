# DraconDex — เอกสารการทำงานของแต่ละระบบ

> อัปเดตล่าสุด: 2026-07-05 (อ้างอิงโค้ด ณ commit ปัจจุบัน) — พฤติกรรมทุกระบบ
> ในเอกสารนี้ผ่านการรันทดสอบจริงด้วย driver (`.claude/skills/run-dracondex/`,
> รวมถึง `web-driver.mjs` สำหรับ sandbox ที่โหลด Electron binary ไม่ได้)
>
> ⚠️ **ไม่ครอบคลุม "v3 module system"** — ตั้งแต่ 2026-07-16 แอปมีระบบ
> module tree แบบ generic เพิ่มเข้ามาอยู่ข้างๆ 7 โมดูลด้านล่างนี้ (Nexus
> nest hub, Builder split-pane, Module Inspector, 15 module kind) เอกสาร
> ฉบับนี้ (§1–§11) ยังตรงกับพฤติกรรมของ 7 โมดูลเดิมทุกจุด (โค้ดไม่ถูกแก้)
> แต่ **ยังไม่มีหัวข้ออธิบายพฤติกรรม v3** — ดูโครงสร้าง/ไฟล์ของระบบใหม่ที่
> [Architec.md](Architec.md) §1 ก่อน (ยังไม่ผ่านการรันทดสอบ behavior แบบ
> ละเอียดเหมือนหัวข้ออื่นในไฟล์นี้ — เป็นการสำรวจโค้ดสถิต)

DraconDex เป็นแอป Electron สำหรับจัดการข้อมูลโลก/ตัวละคร/เนื้อเรื่องของนิยาย
มี 7 โมดูลหลัก (Director, Navigator, Hero, Writer, **Scribe**, Sage, Artisan)
ทำงานบนฐานข้อมูล SQLite ไฟล์เดียวร่วมกัน ตั้งแต่ v2.8 ทุกอย่างถูกจัดกลุ่มเป็น
**Nexus (vault)** แบบ Obsidian พร้อมระบบ Markdown/`[[Wikilink]]`/Backlinks/
Graph view/Quick switcher (ดู §2–§2d) — ตั้งแต่ 2026-07-16 ปุ่ม nav rail ของ
Director/Navigator/Hero/Writer (4 ใน 7 นี้) ถูกซ่อนแล้ว เข้าถึงได้เฉพาะผ่าน
Artisan หรือระบบ migrate เข้า v3 (ดู Architec.md §2) — Scribe/Sage/Artisan
ยังเป็นปุ่มปกติ พฤติกรรมภายในของทั้ง 7 โมดูล (§3–§9 ด้านล่าง) ไม่เปลี่ยน

> หมายเหตุ: `flutter_app/` เป็น front-end อีกตัว (Flutter port) ที่ใช้ schema เดียวกัน
> แต่แยกโค้ดกันโดยสิ้นเชิง — เอกสารนี้ครอบคลุมเฉพาะฝั่ง Electron

---

## 1. สถาปัตยกรรมรวม

```
┌─────────────────────────────────────────────────────────────┐
│ Main process (main.js)                                      │
│  - กำหนดตำแหน่งโฟลเดอร์ข้อมูล (dev / portable / installer)     │
│  - สร้าง BrowserWindow (frameless 1280×800)                  │
│  - ลงทะเบียน IPC handler ~230 ช่อง → เรียก database.js        │
│                                                             │
│ database.js = รวม export ของ src/db/*.js (12 ไฟล์)           │
│  └─ node-sqlite3-wasm → novel-manager.db (ไฟล์เดียว)         │
└──────────────▲──────────────────────────────────────────────┘
               │ ipcRenderer.invoke (ผ่าน contextBridge)
┌──────────────┴──────────────────────────────────────────────┐
│ preload.js — expose `window.api.<namespace>.<fn>`           │
│  (db, folder, project, category, template, object, color,   │
│   timeline, relation, map, hashtag, search, world, game,    │
│   write, artisan, sage, window)                             │
├─────────────────────────────────────────────────────────────┤
│ Renderer (vanilla JS, ไม่มี framework)                       │
│  index.html = โครงเปล่า → JS สร้าง UI ทั้งหมดเป็น HTML string  │
│  โหลดตอนเปิด: i18n.js, core.js, director.js, modals.js,      │
│  search.js — โมดูลที่เหลือ lazy-load ครั้งแรกที่เข้าใช้          │
│  (core.js → loadModule()/switchView())                      │
└─────────────────────────────────────────────────────────────┘
```

หลักการสำคัญ:

- **ความปลอดภัย**: `contextIsolation: true`, `nodeIntegration: false` — renderer
  แตะ DB ได้ผ่าน `window.api` เท่านั้น
- **State ฝั่ง renderer**: object กลางชื่อ `S` (project ที่เปิดอยู่, category/tab
  ที่เลือก ฯลฯ) ทุกโมดูลอ่าน/เขียนร่วมกัน — ไม่มี state persistence นอกจาก DB
  และ `localStorage` (ธีม/ภาษา/ขนาด UI/สถานะย่อ panel)
- **UI pattern เดียวกันทุกโมดูล**: render เป็น HTML string → `innerHTML`,
  handler เป็นฟังก์ชัน global ผูกผ่าน `onclick="..."`,
  modal กลาง (`openModal`/`closeModal`), toast แจ้งผล, `uiConfirm` ก่อนลบ

### ตำแหน่งข้อมูล (main.js)

| โหมด | ตำแหน่งข้อมูล |
|---|---|
| dev (`npm start`) | `tmp-user-data/` ในรีโป (override ได้ด้วย env `DRACONDEX_DATA_DIR`) |
| portable (exe/folder) | `novel-manager-data/` ข้าง ๆ ไฟล์ exe (ตรวจจาก `PORTABLE_EXECUTABLE_DIR` หรือ `portable.flag`) |
| ติดตั้งด้วย installer | `%APPDATA%/DraconDex/novel-manager-data/` |

มี single-instance lock ผูกกับโฟลเดอร์ข้อมูล — เปิดสองหน้าต่างบนข้อมูลเดียวกันไม่ได้
แต่ instance ทดสอบ (คนละ data dir) รันคู่กับ dev ได้

### ชั้นฐานข้อมูล (src/db/core.js)

- เปิด `novel-manager.db` ด้วย `node-sqlite3-wasm`, ตั้ง `busy_timeout=5000`,
  `journal_mode=DELETE`, `foreign_keys=ON`
- `adaptDb()` ห่อ `prepare()` ให้ **prepare-แล้ว-finalize ทุกครั้งที่เรียก**
  (statement ที่ค้างจะล็อก schema ทำให้ migration DDL พัง) และเพิ่ม
  `transaction()` helper แบบ BEGIN/COMMIT/ROLLBACK
- `initDB()` สร้างตารางทั้งหมด (~75 ตาราง, `CREATE TABLE IF NOT EXISTS`) +
  migration ตามลำดับ: ล้าง schema Navigator เก่า (v2.2→v2.5.2), reshape Hero
  (v2.6), ล้าง Writer เก่า (library → write_*, v2.7), `ALTER TABLE` เติมคอลัมน์,
  seed ตาราง `symbol_collection` (~48 สัญลักษณ์), แล้ว `ensureIndexes()` สร้าง
  index ให้ทุกคอลัมน์ FK ที่ยังไม่มี
- **Export**: copy ไฟล์ DB ตรง ๆ ไปยังปลายทางที่เลือกจาก save dialog
- **Import (merge)**: เปิด DB ต้นทางแบบ read-only แล้ว `INSERT OR IGNORE`
  ทีละตารางใน transaction เดียว (ปิด FK ชั่วคราว) คืนค่า summary จำนวนแถวที่เพิ่ม

---

## 2. Nexus (Vault + หน้ารวมโมดูล) — v2.8

ตั้งแต่ v2.8 "Nexus" ไม่ใช่แค่ชื่อหน้า home แต่เป็น **vault แบบ Obsidian**:
ผู้ใช้สร้าง Nexus ได้หลายอัน แต่ละอันรวม project ของทุกโมดูล
(Director/Navigator/Hero/Writer) + โน้ต Scribe ไว้ด้วยกัน

- **หน้า home เป็น 2 ระดับ** (`renderNexusHome()` ใน core.js):
  - ยังไม่เปิด vault → vault picker (`renderNexusPicker`) — การ์ดรายชื่อ Nexus
    พร้อมสีและจำนวน project, ปุ่มสร้าง/แก้ไข/ลบผ่าน modal (`openNexusModal`)
  - เปิด vault แล้ว → การ์ด 7 โมดูล (รวม Scribe) ใต้ header ชื่อ vault
    พร้อมปุ่มสลับ vault (`closeNexus`)
- **เริ่มครั้งแรก**: เลือกสร้าง Nexus จาก welcome แล้วเปิดฟอร์มทันที พร้อม
  checkbox "แสดงทัวร์แนะนำหลังสร้าง Nexus นี้" ที่เลือกไว้ล่วงหน้า; ปิด checkbox
  ได้เพื่อข้าม coach-mark โดยไม่ต้องตอบคำถามแยกใน modal ซ้อน
- **ข้อมูลถูก scope ตาม vault**: `project`, `world_project`, `game_project`,
  `write_project` มีคอลัมน์ `nexus_ref`; ฟังก์ชัน list/create และ `searchAll`
  รับพารามิเตอร์ `nexusId` — เปิดคนละ vault เห็นคนละชุดข้อมูล
- **Migration อัตโนมัติ** (`migrateNexusV28` ใน src/db/core.js): DB เก่าที่มี
  project แต่ไม่มี vault จะได้ Nexus ชื่อ "Nexus" สร้างให้เองแล้ว adopt
  ทุก project เข้าไป — ข้อมูลเดิมไม่หาย
- **ลบ vault ถูก block** ถ้ายังมี project อยู่ (`deleteNexus` คืน
  `{blocked,count}` → toast แจ้ง)
- vault ที่เปิดล่าสุดจำใน `localStorage` (`NEXUS_ACTIVE_KEY`); สลับ/ปิด vault
  จะเคลียร์ tab ทั้งหมด (`clearWorkspaceTabs`); `selectModule` จะ no-op +
  toast ถ้ายังไม่ได้เลือก vault
- ปุ่มบนแถบ nav ด้านซ้าย (rail) จะโชว์/ซ่อนตามโมดูลและ state ปัจจุบัน
  (`updateModuleSubNav`, class เช่น `.project-only`, `.navigator-only`,
  `.hero-sub`) — เช่น tab ของ Navigator จะโผล่เมื่อเลือกโลกแล้วเท่านั้น
- ปุ่มกลับ (↩) มุมบนซ้ายพากลับ Nexus (`returnToNexus`)

## 2b. Scribe (โน้ต Markdown) — v2.8

โมดูลที่ 7 ในทุก Nexus — โน้ต markdown สไตล์ Obsidian ผูกกับ vault ที่เปิดอยู่

- **โครงสร้าง**: `note_folder` ซ้อนได้หลายชั้น + `note` (title ไม่ซ้ำกันในแต่ละ
  vault — ชนกันจะ auto-suffix "ชื่อ 2"); left panel เป็น folder tree + list
  โน้ต (`renderScribeSidebar`), main area เป็น editor กลาง (`mdeditor.js`)
- **ตัว parser markdown** (`src/renderer/markdown.js`) เขียนเอง ไม่ใช้ lib
  ภายนอก — รองรับ heading/hr/quote/fenced code/list ซ้อน/checkbox +
  bold/italic/strike/`==highlight==`/inline code/`[text](url)`/
  `[[Wikilink]]`/`[[Wikilink|alias]]`; escape ข้อความผู้ใช้ทุกจุดก่อน render
- **Editor กลาง** (`src/renderer/mdeditor.js`, `createMarkdownEditor`) reuse
  โดย Scribe และช่องโน้ตของ Director — textarea ทับ backdrop ไฮไลต์ (โทน
  `[[wikilink]]` ระหว่างพิมพ์), debounce autosave 800ms, ปุ่ม/Ctrl+E สลับ
  edit↔preview, มี autocomplete `[[` (caret-positioned, ↑/↓/Enter/Esc),
  และแผง backlinks/outgoing links พับได้ (🔗)
- **Graph tab**: ไอคอนบน subnav rail (`MODULE_SUBNAV.scribe`) สลับระหว่างรายการ
  โน้ตกับกราฟทั้ง vault (`renderScribeGraph`, ใช้ `buildSageGraph` ร่วมกับ
  Sage) — node คือทุก entity ที่ลิงก์ได้ในnexus, edge เส้นประสี accent คือ
  `[[wikilink]]`, คลิก node เปิด entity ผ่าน `openEntityByKey`

## 2c. Wikilink + Backlinks — v2.8

`[[Name]]` ที่พิมพ์ในเนื้อหา markdown ใดๆ (โน้ต Scribe, note ของ object ใน
Director, chapter ของ Writer) จะถูก parse + resolve ตอน save แล้วเก็บ index
ไว้ในตาราง `wiki_link` (`src/db/wiki.js`)

- **ลำดับการ resolve** (case-insensitive, ตายตัว): note title → object.name
  → world character/object → game character/element → writer
  chapter/note → ชื่อ project ของแต่ละโมดูล; บังคับ namespace ได้ด้วย
  `[[obj:Name]]`, `[[note:Name]]` ฯลฯ
- **Entity key** รูปแบบเดียวกับกราฟของ Sage: `note_3`, `obj_12`, `wchp_9`,
  `proj_4` ฯลฯ — `openEntityByKey(key)` ใน core.js เป็นจุดเดียวที่ใช้เปิด
  entity จาก key (wikilink click, backlinks, quick switcher, graph node
  ล้วนเรียกฟังก์ชันนี้)
- คลิกลิงก์ที่ resolve ไม่ได้ → เสนอสร้างโน้ตใหม่จากชื่อนั้นทันที
  (`uiConfirm` แล้ว `api.note.create`)
- **Rename safety**: แก้ชื่อโน้ตหรือ object ที่มีคนอื่นลิงก์มา จะถาม
  (`renameUpdateLinks`) แล้วเขียนทับ `[[ชื่อเก่า]]` → `[[ชื่อใหม่]]` ในทุก
  source ที่อ้างถึง (`wiki:renameTarget`) พร้อม reindex; สร้าง entity ใหม่ที่
  ชื่อไปตรงกับลิงก์ค้าง (unresolved) มาก่อน จะ auto-resolve ให้เอง
  (`resolveDanglingLinks`)
- Migration แรกที่สร้างตาราง `wiki_link` จะ backfill index จากเนื้อหาเดิม
  ทั้งหมดที่มีอยู่ก่อน (`rebuildWikiIndex`)
- **ลำดับของ backlink ที่แสดงผล** มาจากลำดับที่ `resolveEntityKeys` คืนค่า
  ซึ่งเท่ากับลำดับ input — Plan part2 #2.4 เปลี่ยนภายในจาก 1 query ต่อคีย์เป็น
  `IN` ต่อ entity type แล้วเรียงกลับตาม input ก่อนคืน จึงไม่กระทบลำดับที่ผู้ใช้
  เห็น (ยืนยันด้วยการเทียบผลก่อน/หลังในแอปจริง: ทั้ง `resolveKeys`,
  `backlinks`, `outgoing` และ index ทั้งชุดหลัง `rebuildWikiIndex` เหมือนเดิมทุก
  แถว รวมถึงลิงก์ค้างที่ resolve ไม่ได้ซึ่งยังถูกตัดทิ้งเหมือนเดิม)

## 2d. IDE Shell (Explorer / Status bar / Shortcuts / Quick switcher) — v2.8

- **Explorer** (`src/renderer/explorer.js`): มุมมองต้นไม้เดียวรวมทุกอย่างใน
  vault ที่เปิดอยู่ (Scribe folders/notes, Director projects→categories→
  objects, Worlds, Games, Writer series→books→chapters) ข้อมูลมาจาก IPC
  เดียว `wiki:explorerTree`; ปุ่ม rail เปิดได้ตลอดเมื่อมี vault เปิดอยู่
  ไม่ว่าอยู่โมดูลไหน — ไม่ได้แทนที่ sidebar เดิมของแต่ละโมดูล
- **Status bar** (`<footer id="status-bar">`): แสดง vault ที่เปิด/รายการที่
  เปิดอยู่/จำนวนคำ/สถานะ autosave — อัปเดตจาก `updateStatusBar()`
  ซึ่ง mdeditor.js เรียกทุกครั้งที่พิมพ์/บันทึก
- **Quick switcher (Ctrl+P)** (`src/renderer/quickswitch.js`): fuzzy
  subsequence search ข้าม entity ทุกประเภทใน vault, query ว่างโชว์รายการ
  เปิดล่าสุด (`S.recentEntities`), Enter เปิดผ่าน `openEntityByKey`
- **Shortcut อื่น**: Ctrl+E สลับ preview (fallback เมื่อ editor ไม่ได้โฟกัส),
  Ctrl+N โน้ตใหม่ (ตอนอยู่ Scribe), Ctrl+W ปิด tab ที่ใช้งาน, Ctrl+Tab/
  Shift+Ctrl+Tab วน tab

## 3. Director (ข้อมูลนิยาย)

โมดูลหลักสำหรับเก็บ "ฐานข้อมูลเรื่อง" ของนิยายแต่ละเรื่อง

**โครงสร้างข้อมูล**: `project_folder` → `project` → `object_category` →
`object` → `object_attribute` (ค่า field) โดย field นิยามที่ระดับ category
ผ่าน `object_template` (text / textarea / number) + `project_description`
(รายละเอียดโปรเจกต์เป็นคู่ชื่อ-ข้อความ)

**การทำงาน**:
- สร้างโปรเจกต์ (มี codename, memo, โฟลเดอร์, สี, แท็ก) → เปิดเป็น **แท็บบน
  title bar** (`upsertProjectTab`) สลับ/ปิดแท็บได้ ข้อมูลแท็บอยู่ในหน่วยความจำ
- เลือก category → รายการ object มี 2 มุมมอง: **รายการ** (list + detail panel)
  และ **ตาราง** (แก้ inline ได้, เลือกซ่อนคอลัมน์, sort ได้)
- detail ของ object: ค่า field ตาม template (autosave), **โน้ตเป็น markdown
  editor เต็มรูปแบบ** (v2.8 — `createMarkdownEditor` ตัวเดียวกับ Scribe รองรับ
  `[[wikilink]]`/preview/backlinks แทน textarea ธรรมดาแบบเดิม), รายการ
  relation ของ object นั้น, แท็ก
- ปุ่ม "จัดการ Fields" เปิด modal เพิ่ม/ลบ field ของ category (field ใช้ร่วมกัน
  ทุก object ใน category)

## 4. เครื่องมือระดับโปรเจกต์ (โผล่บน rail เมื่อเปิดโปรเจกต์ Director)

### 4.1 Timeline (src/renderer/timeline.js)
- หลาย timeline ต่อโปรเจกต์ เหตุการณ์ (`timeline_event`) มีวันเริ่ม/วันจบเป็น
  วันที่สมมุติ (DD/MM/YYYY HH:mm — เก็บ normalize ในตาราง `timeline_date`
  ผ่าน `getOrCreateDate`)
- แสดงเป็นกราฟ SVG (การ์ดเหตุการณ์บนเส้นเวลา คลิกเพื่อแก้) + รายการเหตุการณ์
  ด้านล่าง แต่ละเหตุการณ์มีช่อง "สตอรี่" (textarea, save ตอน change)
- ใน modal เหตุการณ์: ผูกแท็ก และเชื่อมเหตุการณ์↔เหตุการณ์ (ผ่านระบบ relation)

### 4.2 Relation (src/renderer/relation.js)
- นิยาม **ประเภทความสัมพันธ์** เอง (`relation_type` + สี)
- ความสัมพันธ์ 3 ชนิด: Object↔Object (`relation_obob`), Object↔Event
  (`relation_obtl`), Event↔Event (`relation_tltl`)
- มุมมอง whiteboard 3 แบบ (Category / Object / Project view) เป็น force-graph
  วาดด้วย Konva (โหลด lazy `ensureKonva`) — ลาก node ได้, คลิก node เปิดโน้ต,
  ปรับขนาดพื้นที่ได้, มีรายการ relation ด้านล่างพร้อมปุ่มเพิ่มทั้ง 3 ชนิด

### 4.3 Map (src/renderer/map.js)
- หลายแผนที่ต่อโปรเจกต์ → แต่ละแผนที่มีหลาย **Area** → แต่ละ area เก็บจุด
  polygon (`map_point`, บันทึกผ่าน `map:setPoints`)
- มีเครื่องมือ (เลือก/เพิ่มจุด/ย้าย) — ต้องเลือก area ก่อนใช้ tool

### 4.4 Tags / ป้ายกำกับ (src/renderer/hashtag.js)
- แท็กเป็น **global** (`hashtag` ตารางเดียวทั้งแอป) ผูกกับ project / object /
  event ผ่านตาราง mapping และโมดูลอื่นก็มี mapping ของตัวเอง
  (world, world character, game, game character, game element)
- rail มี 2 ปุ่ม: **Project Tags** (ดูแท็กที่ใช้ในโปรเจกต์ + รายการ object/event
  ที่ติดแท็ก — read-only) และ **ป้ายกำกับ global** (ล่างสุด — เพิ่ม/แก้/ลบแท็กได้)

### 4.5 จัดการสี (Colors)
- ตาราง `use_color` ใช้ร่วมทุกโมดูล — panel มี color wheel + รายการชุดสี
  เพิ่ม/ลบได้; ทุก modal ใช้ `colorPicker()` ตัวเดียวกัน (สีล่าสุด + สีทั้งหมด +
  เพิ่มสีใหม่)

### 4.6 ค้นหา (src/renderer/search.js + src/db/director.js:searchAll)
- ช่องค้นหาบน sidebar ค้นทั้งแอป: โปรเจกต์ / object / แท็ก แล้วกระโดดไปยังผลลัพธ์
- **(2026-07-25) พฤติกรรมแยกตามว่ามี Nexus เปิดอยู่หรือไม่:**
  - **มี Nexus** → ช่องค้นหา **ส่งต่อให้ Quick Switcher** (`openQuickSwitcher(seed)`)
    แล้วเคลียร์ช่องตัวเอง เดิม `renderSearchResults()` เขียนทับ `#left-panel-inner`
    ซึ่งใน v3 **คือ Nexus Nest tree** — พิมพ์ค้นหาทีเดียวต้นไม้โมดูลหายทั้งแถบ
    และ `api.search.all` ก็ค้นแต่ตาราง legacy ไม่เห็นโมดูล v3 เลย
  - **ไม่มี Nexus** (มุมมอง legacy) → ยังใช้ผลลัพธ์ inline แบบเดิมไม่เปลี่ยน
- placeholder แสดง `(Ctrl+P)` ต่อท้าย (ตั้งใน `translateStaticChrome()` เพื่อให้
  เปลี่ยนภาษาแล้วยังอยู่) — เดิม Quick Switcher ไม่มีทางเข้าที่มองเห็นได้เลย

## 5. Navigator (โลก / World)

จัดการ "โลก" ที่นิยายหลายเรื่องใช้ร่วมกัน — เชื่อมข้อมูลจาก Director เข้ามาอ้างอิง

**Tab บน rail (3 + หน้า original)**:
1. **Original** — ข้อมูลของโลกเอง: category ของโลก (`world_orig_category`) +
   field template + object + attribute (โครงเดียวกับ Director แต่แยกตาราง) และ
   "รายละเอียดโลก" (`world_description`)
2. **Characters & Categories** — (ก) เชื่อม **นิยาย** จาก Director เข้าโลก
   (`world_novel`) เปิดดู category ของนิยายและปักดาวเลือก "category ตัวละคร"
   ประจำนิยายได้ (ข) **ตัวละครของโลก** (`world_character` มีสัญลักษณ์ + สี) ซึ่ง
   เชื่อมไปยัง object ในนิยายที่ลิงก์ไว้ได้ (`world_character_link`)
3. **Map Timelines** — เลือกแผนที่จากนิยายที่เชื่อมไว้ → สร้าง timeline บนแผนที่
   (`world_timeline`) → เพิ่มเหตุการณ์ (วันที่) → วางตัวละคร/object ลงบนแผนที่
   ตามพิกัด x,y ต่อเหตุการณ์ (`world_timeline_object`)
4. **Tags** — แท็กที่ใช้ในโลกนี้ + ดูตัวละครตามแท็ก

## 6. Hero (เกม / Game)

ออกแบบข้อมูลเกมที่อิงนิยาย

- **เกม** (`game_project`) เปิดเป็นแท็บ entity บน title bar เหมือนโปรเจกต์
- **ตัวละครเกม** (`game_character`) — ลิงก์กับ object ในนิยายที่ import มา,
  มี "Fields" แบบ **มี level** (`game_char_template` levelable → ค่าเก็บต่อ level
  ใน `game_char_attribute`), ผูก element และแท็กได้, มีหน้าสถิติ
- **คอลเลกชัน** (`game_collection`) — ชุดไอเทม/สกิล ฯลฯ ภายในมี element +
  field template ของตัวเอง (โครงเดียวกับตัวละคร)
- **Story tab** — เนื้อเรื่อง (`game_story`) เป็น whiteboard ของ **โหนดบทสนทนา**
  (`game_dialogue` มีพิกัด x,y) เชื่อมกันด้วยเส้น storyline (ติดสัญลักษณ์ได้)
  แต่ละโหนดมีบทสนทนาเรียงลำดับ (`game_conversation` ผูกผู้พูดเป็นตัวละครเกม)
- **Novel link tab** — เลือกนิยาย 1 เรื่องผูกกับเกม (unique) แล้วเลือก category
  / object จากนิยายเข้ามาใช้ในเกม (`game_category`, `game_cat_object`)
- **Tags tab** — แท็กของเกม/ตัวละคร/element

## 7. Writer (งานเขียน)

- โครงสร้าง: **โปรเจกต์เขียน** (`write_project`) → **ซีรีส์** → **เล่ม (book)**
  → **ตอน (chapter)** เรียงลำดับได้ (ย้ายขึ้น/ลง)
- **Editor**: textarea ธรรมดา + backdrop ไฮไลต์คำ, **autosave อัตโนมัติหลังหยุด
  พิมพ์ 800ms** (debounce) — สถานะ "…"/"บันทึกแล้ว" มุมขวาบน; ปุ่ม "พรีวิว"
  (v2.8) สลับไปแสดงผล markdown แบบ read-only (`toggleWchapPreview`)
- **Word link (วิกิ)**: ลากเลือกคำใน editor → ปุ่มลอย "สร้างลิงก์" ผูกคำนั้นกับ
  object ในนิยายที่เชื่อมไว้ (`write_word_link`) — คำจะถูกไฮไลต์ตามสีทุกครั้งที่ปรากฏ
- **`[[Wikilink]]` (v2.8)**: อยู่ร่วมกับ word link เดิมได้ — ไฮไลต์เส้นประเฉพาะ
  ตัว, คลิกกระโดดไป entity ที่ resolve ได้ (ผ่าน `api.wiki.resolve` →
  `openEntityByKey`), index อัตโนมัติตอน autosave (`updateWriteChapterContent`
  hook เข้า `reindexWikiLinks`)
- **Novel link tab**: เลือกซีรีส์ + นิยาย (`write_novel_link`) → สร้างหน้า "วิกิ"
  ต่อตอน (`write_wiki_link`) เพื่อรวมคำลิงก์ของตอนนั้น
- **Chat note tab**: โน้ตแบบห้องแชท (`write_note` → `write_chat` ฟองข้อความ
  พร้อมเวลา, Enter เพื่อส่ง)

## 8. Sage (สถิติ / วิเคราะห์)

โมดูล read-only 4 tab (ไม่มีการเขียนข้อมูล):

| Tab | ที่มา (src/db/sage.js) | แสดง |
|---|---|---|
| ขนาดข้อมูล | `getDataSize` | จำนวนแถวรวมต่อโมดูล (การ์ด Director/Navigator/Hero/Writer) |
| จำนวนรายการ | `getObjectAmounts` | จำนวน object/entity แยกตามประเภท |
| รายการเชื่อมต่อ | `getLinkerList` | ตารางลิงก์ข้ามโมดูลทั้งหมด (จาก→ไป, ชนิด) |
| กราฟเชื่อมต่อ | `getLinkerGraph` | force-graph รวมทุกโมดูล กรองต่อโมดูลได้ (checkbox) |

## 9. Artisan (สร้างจากเทมเพลต)

- เลือกโมดูลเป้าหมาย (Director / Navigator / Hero / Writer) → เลือกเทมเพลต
  (นิยามในฝั่ง renderer เป็นฟังก์ชัน `build(name)` คืน spec เช่น
  "นิยายมาตรฐาน" = ตัวละคร/สถานที่/ไอเทม + field พื้นฐาน + ไทม์ไลน์หลัก)
- กรอกชื่อ/codename/memo/สี → ฝั่ง DB (`src/db/artisan.js`) สร้างทุกอย่างใน
  **transaction เดียว** แล้วกระโดดเข้า entity ที่สร้างในโมดูลของมันทันที
  (`artisanOpenCreated`)
- ชื่อข้อมูลในเทมเพลตถูกสร้าง **ตามภาษา UI ปัจจุบัน** (เช่น locale ไทยจะได้
  category ชื่อ "ตัวละคร", "สถานที่", "ไอเทม" ลง DB จริง)
- rail ของโมดูล Director/Navigator/Hero/Writer มีปุ่มลัด (ค้อน) เปิด Artisan
  โดย preselect โมดูลนั้น (`openArtisanFromModule`)

## 10. ระบบร่วม (cross-cutting)

### i18n (src/renderer/i18n.js + core.js)
- **18 ภาษา** (`en ja ko th zh vi id es pt fr de ru it nl pl uk tr` + `qd`
  ภาษาสมมุติ) ค่าเริ่มต้น **ไทย** เก็บใน `localStorage`
- 2 กลไก: (1) `t(key)` ดึงจากตาราง `L` ใช้กับ UI ที่เขียนใหม่ ๆ
  (2) `translateCommonUiText()` — เดิน DOM หลัง render แล้วแทนที่ text node
  ที่ตรงกับ dictionary (สำหรับ UI เก่าที่ hardcode ไทย/อังกฤษไว้ในโค้ด) ทำงานผ่าน
  MutationObserver (`observeUiLanguage`)
- ⚠️ ผลข้างเคียงที่ยืนยันแล้ว: กลไก (2) แปล **ข้อมูลผู้ใช้** ที่บังเอิญตรง key ด้วย
  (เช่น category ชื่อ "Characters" แสดงเป็น "ตัวละคร" ในบางจุด แต่บางจุดแสดงดิบ)
  — DB ไม่เสียหาย เป็นเรื่องการแสดงผลเท่านั้น

### ธีมและขนาด UI
- ธีม 32 แบบ (ครอบครัว Daylight/Moonlight/Midnight/Eclipse + sky/star/time)
  เป็นชุดตัวแปร CSS ใน `css/themes.css` เลือกจากเมนูเฟือง (มี swatch พาเลตให้ดู)
  ทุกธีมกำหนด 12 token เหมือนกัน; `--button` เป็น token **ทางเลือก** มีแค่ 13/32
  ธีมที่ประกาศ (ใช้ผ่าน `var(--button, var(--accent))` เสมอ)
- สไลเดอร์ขนาด UI + ย่อ/ขยาย left panel — ทั้งหมดเก็บ `localStorage`

### ตัวอักษรบนพื้นสี accent — `--on-accent` / `--on-button` / `--on-danger` (2026-07-25)
- เดิม `#fff` ถูก hardcode 28 จุดเป็น "สีตัวอักษรบนพื้นที่ถม `--accent`" ทั้งที่ 32
  ธีมกำหนด `--accent` ได้อิสระ — ธีมที่ accent สว่าง (เหลือง/ฟ้า/ส้ม) จึงอ่านปุ่มกับ
  แท็บไม่ออก มีแค่ `blueEclipse` ธีมเดียวที่เคยถูกแพตช์แก้ contrast แบบเฉพาะจุด
- ตอนนี้แยกเป็น 3 token (`--on-accent`, `--on-button`, `--on-danger`) ค่าเริ่มต้น
  `#fff` ใน `:root` แล้วธีมที่ contrast ต่ำกว่า WCAG 3:1 override เป็น `--ink-dark`
  (`#1a1a26`): **15 ธีมสำหรับ `--on-accent`**, **12 ธีมสำหรับ `--on-button`**
- **ต้องใช้ 2 token แยกกัน ไม่ใช่ token เดียว** — `blueEclipse` มี `--accent:#191970`
  (contrast กับขาว 14.85 = ขาวถูกแล้ว) แต่ `--button:#c9ccd4` (1.61 = ขาวอ่านไม่ออก)
  จึงต้องกำหนดคนละค่า; แพตช์เฉพาะจุดเดิมถูกลบแล้วเพราะซ้ำซ้อน
- ⚠️ ห้ามเขียน `--on-button:var(--on-accent)` ใน `:root` — จะโดนกับดัก aliasing
  เดียวกับที่คอมเมนต์ `--bg2` อธิบายไว้ (override ราย-ธีมจะไปไม่ถึง alias)
- ยังเหลือ `#fff` แบบตรง 9 จุดโดยตั้งใจ — พวกที่วาดทับ **สีที่ผู้ใช้เลือกเอง**
  หรือ hue อะไรก็ได้ (`.graph-label`, `.rel-node`, `.map-point`, วงล้อสี, `.chr-cal-ev`)

### ตัวอักษรไทย (2026-07-25)
- ภาษาเริ่มต้นของแอปคือไทย แต่ font stack เดิมไม่มีฟอนต์ไทยเลย — เพิ่ม
  `'Leelawadee UI', Tahoma` **ต่อจาก** `'Segoe UI'` (Segoe UI ครอบคลุม
  Latin/Greek/Cyrillic ครบ ตัวใหม่จึงถูกใช้เฉพาะ codepoint ไทย/ลาว
  → กลิฟ Latin ไม่เปลี่ยนเลย) และคง emoji font ไว้ 2 ลำดับแรกเหมือนเดิม
- เปลี่ยน `word-break:break-word` → `overflow-wrap:break-word` 4 จุด
  (`.dv`, `.wchat-bubble`, `.chs-bubble .chs-text`, `.chs-tr-text`) — สเปกนิยาม
  `word-break:break-word` เท่ากับ `overflow-wrap:anywhere` ซึ่ง **ปิด** ตัวตัดคำ
  ไทยของ ICU ใน Blink ทำให้ตัดกลางพยางค์ (ไทยไม่มีเว้นวรรคระหว่างคำ)
- **ไม่** ปรับ `line-height` ทั่วแอป — ตรวจแล้วว่า 13 จุดที่ใช้ `line-height:1`
  ล้วนแสดง emoji/สัญลักษณ์/ตัวเลขเท่านั้น ไม่มีจุดไหนใส่ข้อความไทยที่วรรณยุกต์ถูกตัด

### ประสิทธิภาพ IPC — จำนวน round-trip ต่อ flow (Plan part2, 2026-07-26)

Part 1 แก้ชั้นข้อมูล (statement cache/index/transaction); part 2 แก้ **ผิวสัมผัส
IPC** — จุดที่ renderer ยิงหนึ่ง round-trip ต่อหนึ่งแถว วัดจริงด้วยการ hook
`ipcMain._invokeHandlers` แล้วขับแอปด้วย `run-dracondex` บนวอลต์ตัวอย่างเดียวกัน
(12 classifier object × 4 template, 3 timeline × 4 event, 5 chapter, 4 session,
6 design node, manager 5 ลูก × 3 attribute):

| flow | ก่อน | หลัง |
|---|---|---|
| โหลด nest tree ของวอลต์ | 10 IPC · **6 full re-render** | 2 IPC · **1 render** |
| เปิดโมดูล classifier (12 object) | 34 IPC | 6 IPC (ส่วนของ classifier+inspector: 30 → 4) |
| คลิกครบ 4 แท็บ Sage Hut | 12 IPC | 3 IPC |
| เปิดโมดูล manager (5 ลูก) | 13 IPC | 6 IPC |
| เรนเดอร์ display image K รูป | K IPC (base64 ผ่าน bridge, `readFileSync` บล็อก main process) | **0 IPC** (`ddx-file://`) |
| สร้าง object 1 ตัว | 35 IPC · 3 render | 7 IPC · 2 render |
| ลบ object 1 ตัว | 35 IPC · 4 render | 7 IPC · 2 render |

พฤติกรรมที่ผู้ใช้เห็นเหมือนเดิมทุกอย่าง — ตรวจด้วยการเทียบ payload ก่อน/หลังใน
แอปจริง (รายการ nest ต่อโมดูล, `attrMap`/`privateTemplates` ของ object,
คีย์ของ `S.inspectorData`, attribute count ของ manager, ตัวเลขสถิติ Sage Hut
ทั้ง 4 ตัว, ลำดับ backlink, และ index ทั้งชุดหลัง `rebuildWikiIndex`) — ทั้งหมด
ตรงกันแบบแถวต่อแถว

**หมายเหตุ scope**: `object:getAttrsBulk/getTagsBulk`, `object:upsertAttrs` และ
world bulk ที่อยู่ในแผน part2 #2.1 **ยังไม่ได้ทำ** — ทั้งหมดอยู่ใน Director/
Navigator ซึ่งเป็นโมดูล legacy ที่ซ่อนจาก nav rail แล้ว

### รูป display image ผ่าน `ddx-file://` (Plan part2 #2.2, 2026-07-26)
- การ์ด Manager และ grid ของ Classifier แสดง "display image" ของ entity ได้ —
  เดิมแต่ละรูปคือหนึ่ง IPC (`importdock:readFile`) ที่ `await` เรียงกันทีละรูป
  และคืน base64 data URL, ฝั่ง main อ่านไฟล์ด้วย `readFileSync` (บล็อก)
- ตอนนี้ `<img src="ddx-file://<importFileId>">` ตรงๆ — ไม่มี IPC เลย, bytes ไม่
  ข้าม bridge, และ Chromium cache/revalidate ให้ผ่าน ETag ของ handler
- **แถมแก้บั๊กที่มีอยู่เดิม**: cache `S.displayImageData` ไม่เคยถูกล้าง (จุด
  invalidate ทุกจุดล้างแต่ `S.displayImageCache`) — เปลี่ยนไฟล์บนดิสก์แล้วรูปเก่า
  ค้างทั้ง session และ blob สะสมไปเรื่อยๆ ตอนนี้มี `invalidateDisplayImages()`
  ล้างทั้งคู่ และทางหลักไม่ได้เก็บ blob ไว้ใน JS อีกแล้ว
- renderer ที่ไม่มี protocol (web-driver harness ของ `run-dracondex` ซึ่ง stub
  Electron shell ทิ้ง) จะตกลงทาง `<img onerror>` → รวมทุกรูปที่ล้มเป็น
  `importdock:readFiles` **ครั้งเดียว** (ตรวจแล้ว: 3 รูป + 1 id ที่ไม่มีจริง =
  1 round-trip, id ที่ไม่มีจะขึ้น empty state ไม่ throw)

### หน้าต่าง frameless
- ไม่มีขอบ OS — title bar เป็น DOM: แท็บโปรเจกต์/entity + ปุ่ม `#win-min`,
  `#win-max`, `#win-close` เรียก IPC `window:*`; เมนู View จริงยังอยู่ (ซ่อน)
  เพื่อให้ Ctrl+Shift+I เปิด DevTools ได้

### หน้า Loading ตอนเปิดแอพ (boot splash, 2026-07-25)
- เดิมเปิดแอพแล้วเห็น "จอดำนิ่ง" — `main.js` ไม่ได้ใช้ `show:false`/`ready-to-show`
  หน้าต่างจึงโผล่ทันทีพร้อม `backgroundColor:'#050506'` แล้วค้างอยู่จนกว่า
  `<script src>` 30 ตัว (~700KB, `i18n.js` ตัวเดียว 578KB) จะ parse ครบ และ
  `init()` จะทำงานจบ ผู้ใช้แยกไม่ออกว่าแอพค้างหรือกำลังโหลด
- แก้ด้วย **overlay ในหน้าเดียว ไม่ใช่หน้าต่างที่ 2** — ไม่แตะ `main.js`/`preload.js`
  และไม่เพิ่ม IPC channel เลย (ดู `#splash` ใน docs/FILES.md → index.html)
- **progress เดินตาม checkpoint จริง ไม่ใช่ timer**: 15% หลัง `i18n.js`, 35%
  หลัง `core.js`, 50% หลัง `mod/*.js`, 55% ก่อน `search.js` (สี่จุดนี้เป็น
  inline script คั่นใน index.html) แล้ว 60% หลัง `applyUiSettings()`, **80%
  หลัง IPC wave 1** (ช่วงยาวสุด — await แรกนี้คือตัว trigger `getDB()` ให้เปิด
  ไฟล์ SQLite + รัน `initDB()` migration ครั้งแรก), 88% หลัง wave 2, 95% หลัง
  `renderNexusHome()`, แล้ว `finish()` ท้าย `init()`
- **แก้จอวาบดำของธีมสว่างไปพร้อมกัน**: `body[data-theme]` ปกติตั้งโดย
  `applyUiSettings()` ซึ่งเป็นบรรทัดแรกของ `init()` — คือ *หลัง* โหลด JS ครบแล้ว
  ผู้ใช้ธีมสว่างจึงเห็นพื้นดำตลอดช่วง boot; inline script ใน index.html อ่าน
  `localStorage` แล้วตั้งธีมให้ก่อนเฟรมแรก (รองรับ `custom:<id>` ด้วย)
  `applyUiSettings()` ยังเป็นตัวตัดสินสุดท้ายเหมือนเดิม ถ้า bootstrap เดาผิด
  ก็ถูกแก้ทับภายในไม่กี่ร้อย ms
- **ทางออกสองชั้น** (เพราะ `#splash` เป็น `position:fixed;inset:0` ถ้าค้างจะกิน
  คลิกทั้งหน้าจอ): `.catch()` รอบ `init()` ใน search.js เรียก `finish()` เมื่อ
  boot throw + watchdog `setTimeout(finish, 20000)` ในตัว controller เอง
- หน้าต่าง pop-out (`?popup=1`/`?tab=`) โหลด JS ก้อนเดียวกัน จึงโชว์ splash ด้วย
- ผลข้างเคียงที่ยอมรับ: ผู้ใช้ที่ตั้ง UI size ≠ 100% จะเห็น splash ขยับขนาด
  เล็กน้อยตอน `applyUiSettings()` ตั้ง `body.style.zoom` (bootstrap ตั้งแค่ธีม
  ไม่ตั้ง zoom/`--fsc`/lang เพื่อไม่ให้ตรรกะซ้ำซ้อนกับตัวจริงจนแยกกันเดิน)

### คอมโพเนนต์ modal ที่ใช้ร่วม (core.js)
- `openModal/closeModal`, `toast(msg,type)`, `uiConfirm(message)` (แทน confirm
  ของ browser), `colorPicker()`, `symbolPicker()`, `hashtagSelector(prefix)`
  (ช่องค้นหา+ชิปแท็ก ใช้ใน modal ของทุกโมดูล), novel picker แบบ tree
  (`buildNovelPickerHtml`)

### Library ที่ vendor ไว้ (v2.8 — `vendor/`)
- **D3** (`relation.js` force-graph) และ **Konva** (`relation.js`/`map.js`/
  `navigator.js` whiteboard) โหลดจาก `vendor/d3.min.js` / `vendor/konva.min.js`
  ก่อนเสมอ (`ensureD3`/`ensureKonva`) — CDN (`unpkg.com`) เหลือไว้เป็น fallback
  เผื่อ `vendor/` หาย ไม่ใช่เส้นทางหลักอีกต่อไป ทำให้แอปใช้งานได้แบบออฟไลน์จริง
- กราฟ SVG แบบ vanilla ของ Sage (`buildSageGraph`, ไม่พึ่ง lib ภายนอกเลย) ถูก
  ปรับให้รับ opts เพิ่ม (`container`, `colors`, `labels`, `onNodeClick`) แบบ
  backward-compatible เพื่อให้ Scribe graph view (v2.8) เรียกใช้ร่วมกันได้

### Import/Export DB (v2.8 ขยายเพิ่ม, Plan part2 เพิ่ม cross-version compat)
- `importDatabaseMerge` (src/db/core.js) นอกจากรวมข้อมูลเดิม ตอนนี้รวม
  `nexus`, `note_folder`, `note` ด้วย (จับคู่ตามชื่อ/title, แถวที่ nexus/folder
  หา match ไม่เจอจะข้าม) แล้ว **rebuild wiki_link index ใหม่ทั้งหมด** หลัง merge
  เผื่อเนื้อหาที่นำเข้ามามี `[[wikilink]]`
- โปรเจกต์ที่นำเข้ามาโดยไม่มี `nexus_ref` (จาก DB เก่ากว่า v2.8) จะถูก adopt
  เข้า vault แรกที่เจอ เหมือน migration ตอนบูต
- **ไฟล์เก่ามาก (v1.x/v2.x) ที่เป็น WAL journal mode แต่ไม่มี `-wal` sidecar
  แนบมา** จะทำให้ `node-sqlite3-wasm` ล่มทันทีตอนเปิดอ่าน — `importDatabaseMerge`
  จึงคัดลอกไฟล์ที่เลือกไปไว้ที่ temp ก่อนเสมอ (ไม่แตะไฟล์ต้นฉบับ) แล้วแก้
  header byte 18-19 กลับเป็น legacy rollback journal (เหมือนที่ `getDB()`
  ทำกับไฟล์ของแอปเองอยู่แล้ว) ก่อนเปิดอ่าน — verify แล้วกับไฟล์ตัวอย่างจริงใน
  `old_db_data/` (v1.1.0, v1.2.2) ว่า import ผ่านและ merge ข้อมูลได้ครบ
- คอลัมน์ `relation_type.color` ก็มี `hasColumn` guard เพิ่มแล้ว (schema เก่ามาก
  ไม่มีคอลัมน์นี้ — เดิม unconditional SELECT ทำให้ transaction ทั้งก้อน rollback)
- **Import DB hub** (`openImportDbHub`, src/renderer/core/router.js): เคลียร์
  `S.activeModuleNode` + เรียก `renderModuleRail()` ตอนเข้าโหมด ไม่ให้ icon
  module เดิมที่ pin ไว้ค้าง `.active` ในแถบ nav; และเพิ่ม `folder` เข้า
  `IMPORT_DB_READONLY_NS` (preload.js) เพราะ folder CRUD ของ Director ไม่เคย
  ถูกบล็อกตอน read-only mode มาก่อน

### Cloud Sync — Supabase Token Sync (2026-07-30, แทนที่ prototype เดิม)

ซิงก์ Nexus vault ขึ้นคลาวด์แบบ **snapshot ทั้ง vault, last-write-wins** —
เอกสารเต็ม (วิธีใช้ + หลักการทำงาน + ข้อจำกัด) อยู่ที่ [SYNC.md](SYNC.md)
สรุปพฤติกรรม:

- เข้าจากปุ่ม **☁** ใน vault-head (ข้าง ⇄) → หน้าต่างเดียวหลายสถานะ: ยังไม่ตั้ง
  ค่าเซิร์ฟเวอร์ → ตั้งค่าแล้วแต่ยัง**ไม่ login** (ต้อง login Google ก่อนถึงจะ
  อัปโหลดได้) → login แล้ว (รายการช่องอัปโหลดของบัญชี + push/pull/delete +
  ช่องกรอกโทเคนเพื่อดึงจากบัญชีอื่น)
- **Login** ผ่าน Supabase Auth (Google provider) — PKCE flow มาตรฐาน: เปิด
  เบราว์เซอร์ระบบไปหน้า consent ของ Google แล้วรับ redirect กลับผ่าน loopback
  HTTP server ชั่วคราวบนเครื่อง (`http://127.0.0.1:<port>/callback`); dev build
  ข้ามขั้นตอนนี้ทั้งหมดด้วยบัญชีจำลอง
- **โทเคน 16 หลัก** (`1234-5678-9012-3456`) สร้างใหม่ทุกครั้งที่ push (ไม่ใช่
  คีย์ถาวรเหมือนเดิม) — เซิร์ฟเวอร์เก็บ sha-256 เท่านั้น; รหัสผ่านต่อช่อง
  (ไม่บังคับ) จำเป็นเฉพาะเวลาบัญชีอื่น (ไม่ใช่เจ้าของ) กรอกโทเคนมาดึงข้อมูล —
  ผิด 8 ครั้งล็อกช่องนั้น 15 นาที
- **Quota ตาม tier บัญชี** (`sync_account.tier`, ยังไม่มีระบบชำระเงินเชื่อมต่อ):
  free = 1 ช่อง/10MB, pro = 3 ช่อง/20MB — เกินโควตาได้ error `quota_exceeded`;
  แต่ละช่องหมดอายุ 72 ชม.หลัง push ล่าสุด (ตรวจแบบ check-on-read)
- Push = serialize ทั้ง closure ของ vault (module tree ทุก kind + attribute/ui/
  tag + entity_relation + note) เป็น JSON ก้อนเดียว ยิงผ่าน RPC ฝั่ง main
  process; **ไม่รวม** module_version, import_file, wiki_link, legacy projects
  (ตรรกะ serialize/apply ไม่เปลี่ยนจากต้นแบบเดิม)
- Pull = ยืนยันก่อน แล้ว **ล้างเนื้อหา vault ในเครื่องและสร้างใหม่จาก snapshot**
  พร้อม remap id (`entity_relation` keys, `linker_key` ของ sketch pin /
  design node, `mapModule`/`timelineModule` ของ Wanderer) แล้ว rebuild
  wiki index; ชื่อ vault ในเครื่องคงเดิม (UNIQUE); เจ้าของบัญชีดึงช่องตัวเองได้
  โดยไม่ต้องใช้โทเคนเลย
- ฝั่งเซิร์ฟเวอร์: ตาราง RLS ล็อกสนิท — ทางเข้าเดียวคือ RPC SECURITY DEFINER
  5 ตัว (`token_sync_push/status/delete/pull_own/pull_by_token`), error ส่งกลับ
  เป็น code (`not_authenticated`/`bad_token`/`bad_password`/`locked`/
  `token_collision`/`no_upload`/`too_large`/`quota_exceeded`/`not_owner`)
  แสดงเป็น toast
- ตรวจแล้วด้วย E2E ผ่าน mock RPC ใน `sync-devserver.js` (login จำลอง 2 บัญชี):
  push→status→delete, push พร้อมรหัสผ่าน→อีกบัญชี pull ด้วยโทเคน→ถูกขอรหัสผ่าน
  →ผิดครบ 8 ครั้ง→ล็อก, ข้อมูล remap ถูกต้องหลัง pull สำเร็จ (ตรรกะ remap เดิม
  ไม่เปลี่ยน)

### Cloud Sync — Google Drive Backup (2026-07-30)

สำรอง "layout profile" (ธีม/ภาษา/ขนาด UI) และ/หรือไฟล์ฐานข้อมูล .ddx ไปยัง
โฟลเดอร์ appdata ของ Google Drive ผู้ใช้ — เอกสารเต็มอยู่ที่
[DRIVE.md](DRIVE.md) สรุปพฤติกรรม:

- **แยก login อิสระจาก Cloud Sync (Supabase) โดยเจตนา** — คุย
  `accounts.google.com`/`oauth2.googleapis.com` ตรงๆ ไม่ผ่าน Supabase เลย
  เพราะ Supabase Auth ไม่รีเฟรช provider token ให้อยู่ดี การขอ scope
  `drive.appdata` ผ่าน relay จึงไม่ประหยัดอะไร แต่จะบังคับผู้ใช้ Cloud Sync
  ทุกคนยินยอมสิทธิ์ Drive ที่ไม่ได้ขอ
- เข้าจากหน้า **BackupData** ใน Setting window (Appdata section — ดูหัวข้อ
  "Setting Window" ด้านล่าง) — เดิมอยู่ใน Preferences panel เก่า
  (`PREFS_SECTIONS`) ซึ่งถูกแทนที่ทั้งหมดแล้ว (2026-07-30, ดูหัวข้อ Setting
  Window)
- มีลิสต์ **ประวัติการสำรองข้อมูล** (backup history, ล่าสุด 20 รายการ) ต่อจาก
  สถานะ Drive เดิม — อ่านจาก `app_setting['drive:backupLog']` ที่เขียนไว้อยู่
  แล้วแต่ไม่เคยมีใครอ่านกลับมาก่อนหน้านี้ (`driveGetBackupLog()`)
- เชื่อมต่อครั้งเดียว (PKCE + loopback redirect, ใช้ helper ร่วมกับ Cloud Sync
  จาก `src/db/oauth-loopback.js`) → เลือกอย่างน้อย 1 อย่าง (layout profile
  และ/หรือ .ddx เป็น opt-in อิสระตามคำที่ Plan.md ใช้ "หากผู้ใช้ต้องการ") →
  สำรองด้วยมือหรือเปิด auto-backup ทุก 1 ชั่วโมง (timer อยู่ฝั่ง renderer
  เพราะ layout profile มีอยู่ใน localStorage เท่านั้น)
- .ddx backup/restore **reuse** `exportDatabaseTo`/`importDatabaseMerge` เดิม
  ทั้งหมด ไม่มีกลไกใหม่ — กู้คืนเป็นการ **ผสาน (merge)** ไม่ใช่ล้างข้อมูลเดิม
  (ต่างจาก Cloud Sync's pull-by-token ที่ล้างข้อมูลปลายทาง)
- แถบสถานะพื้นที่ Drive เตือนที่ ≥90% (near_full) และบล็อกการสำรองข้อมูลที่
  100% (full) ก่อนเรียก API อัปโหลดใดๆ
- ตรวจแล้วด้วย E2E ผ่าน mock ใน `drive-devserver.js`: เชื่อมต่อ→เช็กโควตา
  (บังคับ near_full/full ผ่าน env var `DDX_DEV_DRIVE_QUOTA_PCT`)→สำรอง
  layout+ .ddx→กู้คืน layout (ตรงกัน)→กู้คืนฐานข้อมูลจริงครบวงจร (export→
  upload multipart→download→importDatabaseMerge, ตรวจด้วย `nexus.getAll()`
  ก่อน/หลัง)

### Cloud Sync — Firebase Version Notice (2026-07-30)

แจ้งเตือนเมื่อมีเวอร์ชันใหม่ **ไม่ใช่ auto-updater** — เอกสารเต็มที่
[UPDATE.md](UPDATE.md) สรุปพฤติกรรม:

- อ่านเอกสาร Firestore สาธารณะ 1 ชิ้นเดียว
  (`public_config/latest_version` — version/notes/url) ผ่าน REST ตรงๆ
  ไม่มี firebase SDK, ไม่ต้องใช้ credential (rule เป็น public-read)
- แสดงเฉพาะผู้ใช้ที่ login เข้า Cloud Sync (Supabase) **หรือ** Google Drive
  Backup อย่างใดอย่างหนึ่ง (ยังไม่มีระบบบัญชีรวมศูนย์)
- `checkForUpdate()` ไม่ throw เด็ดขาด — เน็ตล่ม/ยังไม่ตั้งโปรเจกต์ Firebase
  จะไม่มี error toast ทุกครั้งที่เปิดแอป
- กด "ดาวน์โหลด" แค่เปิดเบราว์เซอร์ไปหน้าดาวน์โหลด ไม่ติดตั้งอัตโนมัติ; กด
  "เตือนภายหลัง" จะจำเวอร์ชันนั้นไว้ไม่ให้เตือนซ้ำ (`app_setting['update:
  seenVersion']`)
- ตรวจแล้วด้วย E2E ผ่าน env var `DDX_DEV_UPDATE_VERSION` บังคับเวอร์ชัน
  "ล่าสุด" จำลอง: ยังไม่ login→ไม่แจ้ง, login แล้ว→แจ้ง, กดเตือนภายหลัง→ไม่
  แจ้งซ้ำสำหรับเวอร์ชันเดิม

### Plugins — เดิม Github Sandboxed Extensions (2026-07-30, เปลี่ยนชื่อ + ติดตั้งจากลิงก์ 2026-08-06)

ดาวน์โหลด "ปลั๊กอิน" จาก git repo ที่ประกาศตารางฐานข้อมูลของตัวเอง รันใน
หน้าต่างแยกที่ถูกจำกัดสิทธิ์จริงจัง (ไม่ใช่ stub) — เอกสารเต็มที่
[PLUGINS.md](PLUGINS.md) สรุปพฤติกรรม:

- แต่ละปลั๊กอินมี manifest (`dracondex-plugin.json`, fallback
  `dracondex-extension.json`) ประกาศไฟล์และตาราง (คอลัมน์ TEXT/INTEGER/REAL
  เท่านั้น) — ตรวจสอบเข้มงวดก่อนเขียนอะไรลงดิสก์/ฐานข้อมูล (identifier
  whitelist ทั้งชุด เพราะไม่มี prepared-statement parameter ตัวไหน bind ชื่อ
  table/column ได้)
- **ติดตั้งด้วยการวางลิงก์ `.git` ลิงก์เดียว (2026-08-06)** — `parseRepoUrl()`
  รับ https/ssh/scp/ไม่มี scheme/`owner/repo` ย่อ/`/tree/<branch>` และ GitLab
  nested group; ถ้าไม่ระบุ branch จะลอง `main` แล้ว `master` ให้เอง; รองรับ
  เฉพาะ github.com และ gitlab.com (self-hosted → `unsupported_host`)
- **พรีวิวก่อนยืนยัน** — วางลิงก์แล้วระบบดึง manifest มาแสดง (ชื่อ/เวอร์ชัน/id,
  host+owner/repo@ref, entry, ไฟล์ที่จะโหลด, ตารางที่จะสร้าง) แบบ debounce
  400ms โดยไม่แตะดิสก์และไม่แตะ DB เลย. **พรีวิวไม่ใช่ trust boundary** —
  `pluginInstall(url)` รับ URL ตัวเดียวแล้ว resolve + validate ใหม่หมดเอง ไม่รับ
  manifest/owner/repo/ref จาก renderer; ฝั่ง renderer ทุกฟิลด์ของ manifest
  ผ่าน `x()` ก่อนวาด เพราะเป็นข้อความจากอินเทอร์เน็ตล้วนๆ
- รันในหน้าต่าง `BrowserWindow` แยก ได้ preload คนละไฟล์
  (`preload-plugin.js`) **ไม่มี `window.api` เลย** — เข้าถึงข้อมูลได้แค่
  `window.pluginApi.table.*` ที่ผูก ownership กับตัวหน้าต่างเอง
  (`BrowserWindow.fromWebContents`) ไม่ใช่จาก argument ที่ปลั๊กอินส่งมา ไม่มี
  raw-SQL passthrough ใดๆ (`window.extApi` ยังอยู่เป็น alias ให้ของเก่า)
- **ข้อจำกัดที่ยอมรับไว้ตรงๆ**: ไม่มี OS-level Chromium sandbox จริง เพราะ
  `main.js` ตั้ง `--no-sandbox` ทั้งโปรเซสไว้ก่อนหน้านี้แล้ว (เพื่อ portable
  build) — ทุกหน้าต่างรวมถึงหน้าต่างปลั๊กอินได้รับผลกระทบเหมือนกัน; โค้ดจาก repo
  ถูกเชื่อถือทันทีที่ติดตั้ง ไม่มี code review/signing และพรีวิวเป็นแค่การแจ้งให้
  ทราบว่าจะติดตั้งอะไร ไม่ได้ตรวจว่าโค้ดข้างในทำอะไร
- ดาวน์โหลดทีละไฟล์ผ่าน raw URL ของแต่ละโฮสต์ (`raw.githubusercontent.com` /
  `gitlab.com/.../-/raw/...`) ไม่ใช่ zip, ไม่มี dependency ใหม่ — ตรงตาม
  แพทเทิร์น buffer-then-write ที่ `drive.js` ใช้อยู่แล้ว
- **การเปลี่ยนชื่อ v4.1→v4.2 migrate อัตโนมัติ** — `migratePluginV42()` ใน
  `schema/migrations.js` เปลี่ยน `extension`→`plugin`, `ext_key`→`plugin_key`,
  `extension_table`→`plugin_table`, `extension_ref`→`plugin_ref` และ rename
  ตารางของแต่ละปลั๊กอิน `ext_<id>_<name>`→`plg_<id>_<name>`; ฝั่งดิสก์
  `migratePluginDir()` ย้าย `extensions/`→`plugins/`. migration นี้ต้องรัน
  **ก่อน** `db.exec(DDL_SQL)` (ไม่งั้น `CREATE TABLE IF NOT EXISTS plugin`
  สร้างตารางเปล่าข้างๆ ข้อมูลเก่า) และต้องอยู่ใน `parts[]` ของ `schemaStamp()`
  (ไม่งั้น DB เดิมข้าม initDB ทั้งก้อนแบบไม่มี error ให้เห็น)
- ตรวจแล้วด้วย E2E จริง: migration บน DB v4.1 (แถว/ข้อมูลในตาราง/FK cascade
  รอดครบ, รันซ้ำไม่เปลี่ยนอะไร), เส้นทางอัปเกรดเต็ม (บูต `database.js` จริงบน
  data dir เก่า แล้ว `pluginApiQuery` ยังอ่านข้อมูลเดิมได้ + ไฟล์ย้ายไป
  `plugins/`), preview/install ด้วย fetch ที่ stub เป็น repo ปลอม (preview ไม่
  เขียนอะไร, install เขียนไฟล์+แถว+ตาราง, ติดตั้งซ้ำถูกปฏิเสธ, uninstall ลบครบ),
  ownership ของ `pluginApi` (ตารางตัวเองผ่าน / ของตัวอื่น + คอลัมน์ที่ไม่ได้
  ประกาศถูกปฏิเสธ), และ `rawUrl` ของทั้ง GitHub/GitLab ยิงโดนไฟล์จริงบนเน็ต
- ปุ่ม **Stop** (2026-07-30) — `plugin:stop`/`plugin:isRunning` ถูกต่อ IPC ครบ
  วงจรตั้งแต่แรกแต่ไม่มีใครเรียกใช้; หน้าปลั๊กอินใน Setting window เช็ก
  `isRunning` ต่อแถวแล้วสลับปุ่ม Launch/Stop ให้ตรงสถานะจริง — **2026-08-06**
  แก้บั๊กที่ทำให้สลับผิด: `extensionBodyHtml(list, running)` ถูกประกาศเป็น
  `(list)` แล้ว `list.map(extensionRowHtml)` ส่ง index เข้าไปเป็น `isRunning`
  ทำให้แถวแรกโชว์ Launch เสมอและแถวที่เหลือโชว์ Stop เสมอ

### Setting Window (2026-07-30)

แทนที่ Preferences panel เดิมทั้งหมด — เอกสารพฤติกรรมเก่าที่อ้าง
`PREFS_SECTIONS`/`openPreferencesPanel` ในหัวข้อ Cloud Sync ด้านบนไม่ตรงกับ
โค้ดปัจจุบันแล้ว โครงสร้างใหม่คือ 2 ชั้น (group → page):

- **Quick Setting popup** (`renderSettingsMenu`, `src/renderer/core/
  settings.js`) ถูกตัดให้เหลือแค่ 4 อย่างตาม Plan.md: เปลี่ยนภาษา, สลับโหมด
  ชื่อโมดูล (Unique/Classic), ขนาด UI, ปุ่ม "เปิดการตั้งค่า" — ธีม/ขนาดตัวอักษร/
  version limit/help ย้ายไป Setting window แล้ว ผู้ใช้เลือกเปิดกลับมาแสดงใน
  popup ได้ผ่านหน้า Tool toggle (ดูล่าง)
- **Setting window** (`src/renderer/core/setting-window.js`, floating panel
  แทนที่ `#prefs-panel` เดิม) — sidebar 2 ชั้น: **Workspace** (Theme/
  Text&Size/Tool toggle) → **User** (Account/User profile) → **Appdata**
  (TokenSync/Database/BackupData) → **Plugin** (ปลั๊กอิน/ตั้งค่าปลั๊กอิน)
  แต่ละหน้าลงทะเบียนตัวเองผ่าน `registerSettingPage(group, page, fn)`
  จากไฟล์เจ้าของฟีเจอร์นั้น (เหมือนที่ `drive.js`/`plugin.js` เคยทำกับ
  Preferences panel เดิม) ไม่รวมศูนย์ไว้ที่ไฟล์เดียว
- **Text&Size** รวมเปลี่ยนภาษา + ขนาด UI + ขนาดตัวอักษรไว้หน้าเดียว, ปุ่ม
  Advanced เพิ่มตัวเลื่อนขนาดแยกตามพื้นที่ (left panel/nav sidebar/builder) —
  ทำโดย override ตัวแปร CSS `--fsc` เฉพาะจุด (element ของพื้นที่นั้นเอง) ซึ่ง
  กฎ `calc(Npx * var(--fsc,1))` กว่า 300 จุดในโปรเจกต์ใช้อยู่แล้วรับผลอัตโนมัติ
  โดยไม่ต้องแก้ CSS ที่อื่นเพิ่ม; Advanced เดียวกันนี้ยังเก็บ version limit และ
  ปุ่ม shortcuts/replay tour ที่ย้ายมาจาก popup เดิมด้วย
- **Tool toggle** — คุมว่าอะไรโชว์ที่ไหนใน 3 จุด: popup extras (theme/account
  status/user profile — ปิดไว้เป็น default), ปุ่มด่วน nav sidebar (import/
  export/hashtag/colors — เปิดเป็น default, ซ่อนด้วย class `.tool-toggle-
  hidden`), รายการใน status bar (ชื่อ vault/breadcrumb/word count/save state
  — เปิดเป็น default) ทั้งหมดเก็บใน `S.settings.{quickExtras,navToggles,
  statusToggles}` (localStorage, เทียบชั้นเดียวกับ theme/nameMode)
- **Account** อ่านสถานะ login ของ Cloud Sync (Supabase) ตรงๆ ไม่สร้างระบบ
  บัญชีรวมศูนย์ใหม่ — badge ระดับบัญชีอ่านจาก `sync_account.tier` จริง (มีแค่
  free/pro ในฐานข้อมูล ยังไม่มี "Team-Subscriber" ตามที่ Plan.md เขียนไว้ —
  ข้อความส่วนนั้นคือเป้าหมายอนาคต ไม่ใช่ของที่มีจริงตอนนี้)
- **User profile** — layout slot ตั้งชื่อได้ไม่จำกัดจำนวน เก็บใน Google Drive
  appdata คนละไฟล์กับ auto-backup เดิม (`dracondex-layout-slots.json` แยกจาก
  `dracondex-layout-profile.json`) เพื่อไม่ให้ auto-backup รายชั่วโมงเขียนทับ
  รายการ slot ที่ผู้ใช้ตั้งชื่อไว้
- **TokenSync** ในนี้เป็นแค่ทางลัด (แสดงชื่อ Nexus ที่เปิดอยู่ + ปุ่มเปิด
  modal เดิมของ Cloud Sync) ไม่ได้ย้าย logic ทั้งหมดมาไว้ในหน้านี้ เพราะ Token
  Sync ผูกกับ `S.nexus.id` แต่ Setting window ไม่ผูกกับ nexus ที่เปิดอยู่
- **Database** — list Nexus ทั้งหมด, export/import ได้ทั้งระดับ Nexus และ
  ระดับ module เดี่ยว (subtree) ใช้ snapshot format เดียวกับ Token Sync
  (`serializeVault`/`applySnapshot` ใน `src/db/sync.js`, ขยาย
  `moduleIds` param ใหม่ให้ scope ลงเฉพาะ module ได้) — import ระดับ module
  เป็นการ**เพิ่มเข้าไป**เท่านั้น ไม่ล้าง Nexus ปลายทางเหมือน import ระดับ
  Nexus (มี unit test คุมพฤติกรรมนี้ที่ `test/module-transfer.test.mjs`)
- **ตั้งค่าปลั๊กอิน** — แสดงลิสต์ปลั๊กอินที่ติดตั้งพร้อมข้อความ "ไม่มี
  การตั้งค่า" ต่อรายการ เพราะ manifest (`dracondex-plugin.json`) ยังไม่มี
  ฟิลด์ประกาศ settings schema — เตรียมช่องไว้ให้ ยังไม่สร้าง UI จริงสำหรับ
  schema ที่ยังไม่มีอยู่

### Workspace Styles — Wyvern/Drake/Dragon ครบทั้ง 3 (2026-07-31, part2 #New Workspace จบรอบ)

Plan.md part 2 (v4.1.0) ต้องการ 3 workspace style ที่ผู้ใช้เลือกได้: **Wyvern**
(newcomer/simple, สเปกใน `featureplan.md` ที่ root repo — ทำในรอบก่อนหน้า),
**Drake** (=UI ปัจจุบันทั้งหมด ไม่มีโค้ดใหม่ เป็น default อยู่แล้ว), **Dragon**
(expert/sandbox — ทิศทางที่เลือกกับผู้ใช้คือ "freeform spatial canvas": การ์ด
module ที่ลากจัดวางเองได้ ใกล้เคียง `mod/designer.js` มากที่สุด) — รอบนี้ทำ
Dragon + หน้า Setting "Workspace Style" ให้เสร็จ ครบทั้ง 3 style แล้ว
(checkbox ทั้งหมดใน Plan.md ส่วน New Workspace ติ๊กแล้ว):

- **สลับด้วย** `S.settings.workspaceStyle` (`'drake'` default/`'wyvern'`/
  `'dragon'`, เก็บใน localStorage เทียบชั้นเดียวกับ theme) หรือ query param
  `?workspace=` สำหรับทดสอบ (override ใน memory เท่านั้น ไม่เขียนทับ
  localStorage เหมือน `?nexus=` เดิม) **หรือผ่าน Setting window → Workspace →
  หน้า "Workspace Style" ใหม่** (`src/renderer/core/workspace-style.js`) —
  3 mockup card วาดด้วย CSS (ไม่ใช้รูปภาพ), คลิกแค่ stage ตัวเลือกไว้ใน
  `S.settingPendingWorkspace` ยังไม่ apply ทันที ต้องกดปุ่ม "Apply & Restart"
  (ยืนยันผ่าน `uiConfirm()` ก่อน) ถึงจะเขียนลง `S.settings.workspaceStyle`
  แล้ว `location.reload()` — เพราะสลับ chrome ต้องรีบูตหน้าใหม่ ไม่ใช่ apply
  สดแบบ theme/language

#### Wyvern

- **Chrome**: ซ่อน nav-sidebar/left-panel (Nexus Nest tree)/legacy tab
  strip/split-layout picker/hub-toggle/titlebar vault name ทั้งหมด (มิเรอร์
  `.popup-mode` เดิมใน `css/titlebar.css` แต่**คงปุ่ม Settings และ status bar
  ไว้** ต่างจาก popup window) — แทนที่ด้วย toolbar แนวตั้งบางๆ ทางซ้าย
  (`#workspace-toolbar`, `src/renderer/wyvern.js`)
- **Toolbar**: ปุ่ม "Views" (popup 4 ตัวเลือก: Nexus Nest/Sage Hut/Import
  Dock/Import DB — Import Dock เป็นหน้าเดี่ยวใหม่ `goToImportDockPage()`,
  มิเรอร์ `goToKindBrowserHub()` เดิม), Import DB, Export DB, Hashtag, Color,
  และปุ่ม "+สร้าง module" (โชว์เฉพาะตอนเรียกดู Nexus Nest เท่านั้น) — ทุกปุ่ม
  เรียกฟังก์ชันเดิมของ Drake ตรงๆ ไม่มี logic ใหม่ซ้ำซ้อน
- **Drill-down navigation แทน left-panel tree**: breadcrumb ด้านบน + card
  grid ด้านล่าง (`buildWyvernBrowseHtml`) — module ที่มีลูกจะ "เจาะลึก" เข้าไป
  เมื่อคลิก (breadcrumb โตขึ้น 1 ระดับ), module ที่ไม่มีลูกเปิดหน้ารายละเอียด
  จริงทันที; right-click ยังเปิด context menu ปกติ (ไม่มี "เปิดใน pane ใหม่"
  เพราะ Wyvern ไม่มี split pane)
- ตรวจแล้วด้วย E2E จริงผ่าน `run-dracondex`: chrome ถูกซ่อน/โชว์ถูกต้อง,
  toolbar ทำงานครบทุกปุ่ม, drill-down + breadcrumb กลับ root ถูกต้อง, เปิด
  module ซ้อนกันไม่สร้าง tab ใหม่, ไม่มีปุ่ม split ที่ไหนเลย

#### Drake

ไม่มีโค้ดพฤติกรรมใหม่เลย — nav-sidebar + left-panel Nest tree + split-pane
Builder เหมือนเดิมทุกจุด ทุก guard ที่เพิ่มให้ Wyvern/Dragon (ดูหัวข้อ "ไม่มี
split pane" ด้านล่าง) เขียนเป็น `workspaceStyle !== 'drake'` เสมอ ดังนั้น Drake
falls through ทุกจุดโดยอัตโนมัติ งานรอบนี้คือทำให้เลือกได้จริงผ่านหน้า Setting
ใหม่ (ก่อนหน้านี้เป็น default อยู่แล้วแต่ไม่มี "ตัวเลือก" ให้เห็นเทียบกับอีก 2
style)

#### Dragon

- **Chrome**: **คง nav-sidebar ไว้** (import/export/hashtag/color ครบตามที่
  Plan.md ระบุ "แสดง tool ตามเดิม") — ต่างจาก Wyvern ที่ซ่อน nav-sidebar
  ไปเลย จุดที่ซ่อนมีแค่ left-panel (Nest tree)/left-panel-resize/builder-tabs/
  layout-menu-wrap ไม่มี toolbar เป็นของตัวเอง (`src/renderer/dragon.js` ไม่มี
  `render*Toolbar()` แบบ Wyvern)
- **บอร์ดอิสระแทน left-panel tree**: `buildDragonCanvasHtml()` วาด module
  ระดับปัจจุบันเป็นการ์ด absolute-positioned บน `#dragon-stage` ภายใน
  `.dragon-board` (scroll ธรรมชาติ ไม่มี custom pan/zoom ในเวอร์ชันนี้ —
  จงใจตัดออกเพื่อความง่าย ถ้าต้องการทีหลังค่อยเพิ่ม) `mountDragonBoard()`
  ผูก `pointerdown`/`pointermove`/`pointerup` ต่อการ์ด มิเรอร์วิธีของ
  `mod/designer.js`'s free-drag ทุกจุด (ไม่ใช้ HTML5 dragstart/drop เพราะ
  ไม่เหมาะกับตำแหน่ง x/y อิสระ) — ลากแล้วปล่อยเก็บตำแหน่งจริง ถ้าไม่ขยับถือ
  เป็นคลิก (เจาะลึก/เปิด module)
- **ตำแหน่งการ์ด — client-only โดยตั้งใจ**: เก็บใน
  `S.settings.dragonLayout[nexusId][parentKey][moduleId] = {x,y}`
  (localStorage ชั้นเดียวกับ theme) ไม่ใช่ DB table แบบ `designer_node` ของ
  `mod/designer.js` — เพราะไม่มีใครขอ sync ข้ามเครื่อง ถ้าต้องการทีหลัง
  อัปเกรดเป็น DB + IPC ได้โดยมิเรอร์ของ designer.js ได้เลย โมดูลที่ยังไม่เคย
  ลากจะได้ตำแหน่ง grid อัตโนมัติจาก `dragonNodePosition()` (ไม่ทับกันเป็นกอง
  ที่ 0,0)
- **Drill-down เหมือน Wyvern แต่ render เป็นบอร์ด**: `S.dragonBrowsePath`
  (array เดียวกับ `S.wyvernBrowsePath` ทุกจุด รีเซ็ตพร้อมกันทุกที่ที่
  `wyvernBrowsePath` ถูกรีเซ็ต) — เพราะ module kind `collector` ไม่มีหน้า
  detail ของตัวเอง (`hub/open.js`'s `openModuleNode` แค่ toggle left-panel
  tree ให้) Dragon เลยต้องมีกลไกเจาะลึกเป็นของตัวเองเหมือน Wyvern ถึงจะเข้าถึง
  ลูกของ collector ได้ — สิ่งที่ทำให้ไม่ใช่ Wyvern ซ้ำคือ **การ render แต่ละ
  ระดับเป็นบอร์ดลากอิสระ ไม่ใช่ grid ตายตัว**
  ไม่มี edge/เส้นเชื่อมให้ผู้ใช้ลากวาดเอง (ต่างจาก `designer.js`'s
  click-to-connect) — เพราะความสัมพันธ์ parent/child มีอยู่แล้วจาก module
  tree, เพิ่ม edge ที่แก้ไขเองได้จะซ้ำกับฟีเจอร์ reparent-by-drag ของ Nest
  tree เดิมโดยไม่มีใครขอ
- **ไม่มี split pane, ไม่ auto-tab เหมือน Wyvern**: guard เดิมใน
  `builder.js`/`hub/menus.js` ที่เคยเช็กแค่ `workspaceStyle === 'wyvern'`
  ขยายเป็น `workspaceStyle !== 'drake'` แทนการก็อปเช็ก `'dragon'` เพิ่มอีกชุด
- ตรวจแล้วด้วย E2E จริงผ่าน `run-dracondex`: nav-sidebar ยังอยู่, left-panel/
  builder-tabs หายไป, บอร์ดวาดการ์ดถูกต้อง, ลากการ์ดแล้ว reload ตำแหน่ง
  ยังอยู่ (ยืนยันแล้วว่า `S.settings.dragonLayout` persist ผ่าน localStorage
  จริง), คลิก collector เจาะลึกถูกต้อง breadcrumb อัปเดต, คลิก module ปกติ
  เปิดหน้า detail/builder ปกติแล้วกลับบอร์ดผ่านปุ่ม home ได้, right-click มีแค่
  "เปิดในหน้าต่างใหม่" ไม่มี "เปิดใน pane ใหม่", **และยืนยันว่า Drake/Wyvern
  ไม่มี regression จาก guard ที่ขยายออกเป็น `!== 'drake'`** (สลับกลับ Drake
  แล้ว pane tab strip/context menu "เปิดใน pane ใหม่" กลับมาปกติทุกจุด)

---

## 11. บั๊ก/จุดอ่อนที่รู้แล้ว (จากการรันทดสอบ 2026-07-04)

1. **Crash แฝง** — [`src/renderer/modals.js:159`](../src/renderer/modals.js#L159)
   `openObjectModal()` ที่ถูกเรียกโดยไม่มี `catId` ในโปรเจกต์ที่ไม่มี category จะ
   throw `Cannot read properties of null (reading 'id')` (ปุ่มใน UI ปัจจุบันส่ง
   `catId` เสมอเลยยังไม่แสดงอาการ) — ควร guard `S.category?.id`
2. **Auto-translate กินชื่อข้อมูลผู้ใช้** — ดูหัวข้อ i18n ข้างบน
3. **i18n ตกหล่น** — locale ไทยมีข้อความอังกฤษปนใน Navigator (banner คำอธิบาย
   ตัวละครโลก, "No novels linked", "No timelines yet on this map.") และ Sage
   ("N รายการ total")

### แก้แล้วในรอบ UI/UX pass 2026-07-25
- ~~`toast(msg,'error')` 20 จุดไม่มีกฎ CSS~~ → `toast()` map `'error'→'err'`,
  `'success'→'ok'` ให้แล้วในตัวฟังก์ชัน (เดิมข้อความ error เป็นสีเทากลาง ๆ
  แยกจาก success ไม่ออก)
- ~~modal หลักไม่มี Escape~~ → `bindModalEscape()` ปิดได้แล้ว โดยกันไว้ไม่ให้
  ปิดทับ `#confirm-overlay`/`#qs-overlay`/`#guide-overlay` และไม่ปิด welcome modal
  (ที่ซ่อนปุ่ม ✕ ไว้เพราะบังคับให้เลือก)
- ~~`uiConfirm` ไม่ `stopPropagation()`~~ → เดิมกด Escape ครั้งเดียวปิด **ทั้ง**
  confirm และ modal ที่อยู่ข้างล่าง เพราะ `finish()` ลบ overlay ทันที
  ทำให้ guard ของ `bindModalEscape` มองไม่เห็นแล้ว (guide.js/quickswitch.js
  หยุด event ของตัวเองอยู่แล้ว — `uiConfirm` เป็นตัวเดียวที่ตกหล่น)
- ~~`prompt()` ที่ `importCustomPalette`~~ → `uiPrompt()` (คู่แฝดของ `uiConfirm`
  แบบรับข้อความ) — native dialog คือบั๊ก renderer ค้างที่ `uiConfirm` เกิดมาแก้
- ~~ลบแบบไม่ถาม 7 จุด~~ → ใส่ `uiConfirm()` แล้ว (custom theme, สีใน swatch,
  word link, char link, event object, game conversation, hero attr level)
  — **ยกเว้น** เครื่องมือ delete บนแผนที่ ที่ลบด้วยคลิกเดียวโดยตั้งใจ
- ~~`importDatabaseFile` ถามยืนยันก่อนเลือกไฟล์~~ → แยก IPC เป็น
  `db:pickImportFile` + `db:importMergeFile` เพราะเดิมช่องเดียวเปิด dialog
  **แล้ว merge เลยในคอลเดียว** จะยืนยันทีหลังไม่ทันแล้ว
- ~~ไม่มี loading feedback เลยทั้งแอป~~ → `setBusy(el,on)` + `.busy-veil`
  ใช้ที่ `openModuleNode` และ `chooseImportAsNexusNest`
- ~~ไม่มีที่ไหนบอก keyboard shortcut / เล่นทัวร์ซ้ำไม่ได้~~ → เมนูเฟืองมีหมวด
  "ช่วยเหลือ" (`openShortcutsModal()`, `replayGuideTour()`)
- ~~120+ `font-size:Npx` แบบ inline ไม่ขยายตามสเกลฟอนต์~~ → sweep เป็น
  `calc(Npx * var(--fsc,1))` 126 จุดใน 16 ไฟล์ (attribute `font-size="…"` ของ SVG
  เป็นแบบไม่มีหน่วย regex จึงไม่แตะ)
