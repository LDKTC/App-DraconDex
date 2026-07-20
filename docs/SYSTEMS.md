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
- ธีม 30+ แบบ (ครอบครัว Daylight/Moonlight/Midnight/Eclipse + sky/star/time)
  เป็นชุดตัวแปร CSS ใน `style.css` เลือกจากเมนูเฟือง (มี swatch พาเลตให้ดู)
- สไลเดอร์ขนาด UI + ย่อ/ขยาย left panel — ทั้งหมดเก็บ `localStorage`

### หน้าต่าง frameless
- ไม่มีขอบ OS — title bar เป็น DOM: แท็บโปรเจกต์/entity + ปุ่ม `#win-min`,
  `#win-max`, `#win-close` เรียก IPC `window:*`; เมนู View จริงยังอยู่ (ซ่อน)
  เพื่อให้ Ctrl+Shift+I เปิด DevTools ได้

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
- **Import DB hub** (`openImportDbHub`, src/renderer/core.js): เคลียร์
  `S.activeModuleNode` + เรียก `renderModuleRail()` ตอนเข้าโหมด ไม่ให้ icon
  module เดิมที่ pin ไว้ค้าง `.active` ในแถบ nav; และเพิ่ม `folder` เข้า
  `IMPORT_DB_READONLY_NS` (preload.js) เพราะ folder CRUD ของ Director ไม่เคย
  ถูกบล็อกตอน read-only mode มาก่อน

### Cloud Sync — Supabase (prototype, 2026-07-17)

ซิงก์ Nexus vault ขึ้นคลาวด์แบบ **snapshot ทั้ง vault, last-write-wins** —
เอกสารเต็ม (วิธีใช้ + หลักการทำงาน + ข้อจำกัด) อยู่ที่ [SYNC.md](SYNC.md)
สรุปพฤติกรรม:

- เข้าจากปุ่ม **☁** ใน vault-head (ข้าง ⇄) → หน้าต่างเดียว 3 สถานะ:
  ตั้งค่าเซิร์ฟเวอร์ (URL + anon key, เก็บใน `app_setting`) → ยังไม่เชื่อม
  (Push ครั้งแรก หรือกรอกคีย์เชื่อม vault บนคลาวด์ที่มีอยู่) → เชื่อมแล้ว
  (สถานะ role/เวลาซิงก์, Push/Pull/สร้างคีย์อ่านอย่างเดียว/ยกเลิกการเชื่อม)
- **คีย์เข้าถึง** รูปแบบ `Xxxx-Xxxx-Xxxx-Xxxx` (4×4 alphanumeric ≈95 bit)
  สร้างฝั่งเครื่อง แสดงครั้งเดียว; เซิร์ฟเวอร์เก็บ sha-256 เท่านั้น;
  role `owner` = push+pull, `read` = pull อย่างเดียว (push โดน `not_owner`)
- Push = serialize ทั้ง closure ของ vault (module tree ทุก kind + attribute/ui/
  tag + entity_relation + note) เป็น JSON ก้อนเดียว ยิงผ่าน RPC ฝั่ง main
  process; **ไม่รวม** module_version, import_file, wiki_link, legacy projects
- Pull = ยืนยันก่อน แล้ว **ล้างเนื้อหา vault ในเครื่องและสร้างใหม่จาก snapshot**
  พร้อม remap id (`entity_relation` keys, `linker_key` ของ sketch pin /
  design node, `mapModule`/`timelineModule` ของ Wanderer) แล้ว rebuild
  wiki index; ชื่อ vault ในเครื่องคงเดิม (UNIQUE)
- ฝั่งเซิร์ฟเวอร์: ตาราง RLS ล็อกสนิท — ทางเข้าเดียวคือ RPC SECURITY DEFINER
  5 ตัว, error ส่งกลับเป็น code (`bad_key`/`not_owner`/`too_large`) แสดงเป็น toast
- ตรวจแล้วด้วย E2E (web-driver + mock RPC ครบ 5 ตัว): push→link→pull ข้อมูล
  ครบและ remap ถูก, คีย์ read ถูกกัน push, คีย์ผิด/ฟอร์แมตผิดถูกปฏิเสธ

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
