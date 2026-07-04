# DraconDex — เอกสารการทำงานของแต่ละระบบ

> อัปเดตล่าสุด: 2026-07-04 (อ้างอิงโค้ด ณ commit ปัจจุบัน, เวอร์ชันใน `package.json` = 2.7.1
> โค้ดมีถึง Artisan v2.8 แล้ว) — พฤติกรรมทุกระบบในเอกสารนี้ผ่านการรันทดสอบจริงด้วย driver
> (`.claude/skills/run-dracondex/`)

DraconDex เป็นแอป Electron สำหรับจัดการข้อมูลโลก/ตัวละคร/เนื้อเรื่องของนิยาย
มี 6 โมดูลหลัก (Director, Navigator, Hero, Writer, Sage, Artisan) ทำงานบนฐานข้อมูล
SQLite ไฟล์เดียวร่วมกัน

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

## 2. Nexus (หน้ารวมโมดูล)

- หน้าแรกหลังบูต (`renderNexusHome()` ใน core.js) — sidebar เป็นการ์ด 6 โมดูล
  คลิกแล้ว `selectModule(name)` จะ lazy-load สคริปต์ของโมดูล (ถ้ายังไม่โหลด)
  แล้ว render view ของโมดูลนั้น
- ปุ่มบนแถบ nav ด้านซ้าย (rail) จะโชว์/ซ่อนตามโมดูลและ state ปัจจุบัน
  (`updateModuleSubNav`, class เช่น `.project-only`, `.navigator-only`,
  `.hero-sub`) — เช่น tab ของ Navigator จะโผล่เมื่อเลือกโลกแล้วเท่านั้น
- ปุ่มกลับ (↩) มุมบนซ้ายพากลับ Nexus (`returnToNexus`)

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
- detail ของ object: ค่า field ตาม template (autosave), โน้ต (autosave),
  รายการ relation ของ object นั้น, แท็ก
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
  พิมพ์ 800ms** (debounce) — สถานะ "…"/"บันทึกแล้ว" มุมขวาบน
- **Word link (วิกิ)**: ลากเลือกคำใน editor → ปุ่มลอย "สร้างลิงก์" ผูกคำนั้นกับ
  object ในนิยายที่เชื่อมไว้ (`write_word_link`) — คำจะถูกไฮไลต์ตามสีทุกครั้งที่ปรากฏ
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
