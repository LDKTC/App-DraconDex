# DraconDex — โครงสร้าง Module / Submodule

> เอกสารนี้สรุป **สถาปัตยกรรมระดับโมดูล** ของแอป (module tree) — ใครประกอบด้วย
> อะไรบ้าง, ไฟล์ไหนรับผิดชอบส่วนไหน อ้างอิงจากโค้ด ณ วันที่ 2026-07-17
> (หลังการรื้อใหญ่ "v3 module system", git history Phase 1–24 + Part 1–4 +
> Nest hub round 2)
> รายละเอียดพฤติกรรมเชิงลึกดู [SYSTEMS.md](SYSTEMS.md), รายไฟล์ดู [FILES.md](FILES.md)

## ภาพรวมสแต็ก

```
┌─────────────────────────────────────────────────────────────┐
│ Electron App (โปรดักชันหลัก)                                 │
│  electron/main.js → preload.js → src/renderer/* (UI)        │
│  electron/database.js → src/db/* (node-sqlite3-wasm)        │
│  v4.9.0: app.ddx + หนึ่ง .ddx ต่อหนึ่ง Nexus — ดู docs/VAULTS.md │
├─────────────────────────────────────────────────────────────┤
│ flutter/ (Flutter port — front-end แยก, DB schema ร่วม)      │
└─────────────────────────────────────────────────────────────┘
```

ทั้งสองฝั่งอ่าน/เขียนไฟล์ `novel-manager.db` schema เดียวกัน แต่แยกโค้ด UI
กันคนละภาษา/เฟรมเวิร์กโดยสิ้นเชิง

**การเปลี่ยนแปลงสำคัญที่สุดนับจากเอกสารฉบับก่อน (2026-07-07):** เดิม Nexus
ครอบ **7 โมดูลตายตัว** (Director/Navigator/Hero/Writer/Scribe/Sage/Artisan)
ตอนนี้ Nexus ครอบ **module tree แบบ generic** ที่ผู้ใช้สร้างเองได้ไม่จำกัด —
แต่ละ node เลือก "kind" จาก 15 แบบที่มีอยู่ ("v3 module system", ดู §1)
โมดูลตายตัวเดิมทั้ง 4 (Director/Navigator/Hero/Writer) **ยังอยู่ในโค้ดครบ
ทำงานได้ปกติ** แต่ถูกซ่อนออกจาก nav rail แล้ว — เข้าถึงได้เฉพาะผ่าน Artisan
(สร้างใหม่จากเทมเพลต v3) หรือผ่านระบบ migrate ข้อมูลเก่าเข้า v3 (ดู §2)
Scribe/Sage/Artisan ยังเป็นปุ่มบน rail ตามปกติ

---

## 1. v3 Module System — Nexus nest tree (ระบบหลักปัจจุบัน)

Nexus (vault) เก็บ **module tree** เดียว ไม่ใช่การ์ด 7 โมดูลตายตัวอีกต่อไป —
node ซ้อนลึกได้ไม่จำกัดชั้น (ต่างจาก Major/Minor 2 ชั้นตายตัวของ Phase แรกๆ)

```
nexus (vault, electron/src/db/nexus.js — เหลือแค่ชั้นบางๆ: CRUD vault + นับจำนวน
        project/module รวมกันเพื่อ block การลบ)
│
└─ module tree (electron/src/db/module.js, ตาราง `module`)
   parent_id ชี้ตัวเอง (ซ้อนได้ไม่จำกัดชั้น), แต่ละ node มี:
     kind        — 1 ใน 15 แบบ (ตารางด้านล่าง, มี CHECK constraint ที่ DB)
     icon/color  — จาก iconpicker.js (svg:.../sym:.../img:data:...)
     description — markdown มี [[wikilink]], reindex ทุกครั้งที่ save
     pinned      — เฉพาะ node บนสุด (Major) ปักหมุดขึ้น module rail ได้
   ตารางร่วม: module_attribute (แอตทริบิวต์อิสระ), module_ui (state ต่อ
   module เช่น activeView), module_hashtag (แท็ก), module_version (ประวัติ,
   §1.5) — ลิงก์/backlink ใช้ wiki_link index ร่วมกับทั้งแอป คีย์ `module_<id>`
```

### 1.1 15 module kinds — kind ↔ renderer ↔ db layer

| kind | ความหมาย | renderer (`electron/src/renderer/mod/*.js`) | db backend |
|---|---|---|---|
| `collector` | โฟลเดอร์เปล่า จัดกลุ่ม children เท่านั้น ไม่มีเนื้อหา คลิกแค่ expand/collapse | *(ไม่มี — hub/tree.js render ตรง)* | *(ไม่มี)* |
| `manager` | คอนเทนเนอร์แสดง children ของ Major (4 มุมมอง: Cards/List/Table/Recent) | `manager.js` | *(ใช้ module.js เท่านั้น)* |
| `inspector` | เอกสารโน้ตเดียว ("Detail") ผูก markdown editor กลางกับฟิลด์ description | `detail.js` | *(ใช้ module.js เท่านั้น)* |
| `classifier` | ระบบ category/object/field แบบตารางเดียวกัน (Director เดิม) แยก `cat_type` (object/character/element) | `classifier.js` | `electron/src/db/classifier.js` |
| `locator` | แผนที่แบบ Konva canvas, area เป็น polygon (รียูส Director Map เดิม) | `locator.js` | `electron/src/db/map.js` |
| `chronicler` | ไทม์ไลน์เหตุการณ์ตามวันสมมุติ (รียูส Director Timeline เดิม) | `chronicler.js` | `electron/src/db/timeline.js` |
| `wanderer` | "TimeMap" — เข็มหมุดเหตุการณ์บนแผนที่ของ Locator ผูกเวลาเข้ากับ Chronicler | `wanderer.js` | `electron/src/db/wanderer.js` (+ตาราง `map_event`) |
| `narrator` | กราฟบทสนทนาแบบโหนด+เส้น (route board) | `narrator.js` | `electron/src/db/narrator.js` (`story_dialogue/story_talk/story_edge`) |
| `author` | หนังสือ/ตอน — คอลัมน์บทซ้าย + markdown editor (Outline/Reading) | `author.js` | `electron/src/db/author.js` |
| `scribe` | โน้ตแชทต่อโมดูล (ฟองข้อความ+เวลา, ไม่ใช่ Scribe เดิมทั้งแอป) | `chatscribe.js` | `electron/src/db/chatscribe.js` |
| `drafter` | หน้า markdown เปล่า (ใช้ฟิลด์ description ของ module เอง ไม่มีตารางแยก) | *(mount ตรงผ่าน `mountDrafterEditor` ใน mod/drafter.js)* | *(ไม่มี)* |
| `viewer` | เลนส์ read-only เหนือ saved filter (Table/Cards/Board) | `viewer.js` | `electron/src/db/viewer.js` |
| `connector` | กราฟความสัมพันธ์เหนือ saved filter (node=item, edge=relation/wikilink) | `connector.js` | `electron/src/db/viewer.js` |
| `sketcher` | แคนวาสวาดฟรีแฮนด์ (ปากกา/ยางลบ, หลายหน้า, export PNG) | `sketcher.js` | `electron/src/db/sketcher.js` |
| `designer` | ผังไดอะแกรมอิสระ (shape/edge/label, drag จัดตำแหน่ง) | `designer.js` | `electron/src/db/designer.js` |

`hub/open.js` มี registry `KIND_MAIN_BUILDER` (kind → `build<Kind>MainHtml`) และ
dispatch ใน `openModuleNode` (kind → `load<Kind>Data`) เป็นจุดต่อ kind เข้า
ไฟล์ renderer จริง ทุกไฟล์ใน `electron/src/renderer/mod/*.js` ถูก script-tag ตรงใน
`electron/index.html` (ไม่ lazy-load เหมือนโมดูลเดิม)

มี 2 ไฟล์ใน `mod/` ที่**ไม่ใช่ module kind** แต่เป็นหน้า section ของ Hub เอง:
`sagehut.js` (สถิติวอลต์ในหน้า hub accordion, ใช้ `electron/src/db/sage.js`'s
`sageHutStats`/`sageHutLinkerList`) และ `fileviewer.js` (ตัวดู Import Dock)

### 1.2 Hub (`electron/src/renderer/hub/` — 7 ไฟล์, เดิม `hub.js` 1301 บรรทัด)

หน้า home ของ vault ที่เปิดอยู่ — accordion 3 ส่วนเท่านั้น: **Nest** (module
tree), **Sage Hut**, **Import Dock** (ไม่มี section โมดูลเดิมแล้ว — Legacy
เข้าถึงผ่าน Artisan เท่านั้น)

- **Module rail**: ปุ่ม home (`goToNexusNestHub` — กลับมาหน้า welcome ของ
  Hub จากที่ไหนก็ได้ ต่างจาก `#nav-logo-btn`'s "return" ที่ทำงานเฉพาะโมดูล
  เดิมแบบเต็มหน้า ไม่ใช่ v3 module node) → ปุ่ม +สร้าง → Major module ที่
  ปักหมุด (`pinned`) → shortcut Import Dock
- **Nest tree**: render ต้นไม้แบบ recursive, ลาก reorder/reparent — **โมดูล
  ไหนก็ reparent ข้าม parent ได้ ไม่ล็อกเฉพาะ top-level แล้ว** (`onNestDrop`,
  เดิมโมดูลที่มี parent อยู่แล้วจะ reorder ได้แค่ในกลุ่มพี่น้องเดิม ตอนนี้ลาก
  ออกไปเป็น top-level หรือไปเป็นลูกของโมดูลอื่นได้เหมือนกันหมด กันแค่ลากเข้า
  subtree ตัวเอง), inline rename, expand/collapse, chip ไอคอน+ป้าย kind
- **สร้าง node ใหม่**: popup เลือก kind จากทั้ง 15 (`openKindPopup`) →
  `quickCreateModule` (classifier ต้องเลือก `cat_type` เพิ่มอีกขั้น)
- **Context menu**: ปุ่ม **"Create" เปิด hover submenu** แสดง kind-list เดียว
  กันแทนที่จะแบนราบอยู่บนสุดเมนูเหมือนเดิม (`openCreateSubmenu`/
  `positionSubmenuNear`, Major เท่านั้น) / rename / duplicate (clone ทั้ง
  subtree, reset pinned เป็น 0) / move to… / delete / pin-unpin (Major
  เท่านั้น)
- **ไอคอน/สี**: popup แบบ live-save ผ่าน `iconpicker.js`
- **หน้า detail ของ module** (`buildModuleDetailHtml`): header (ชื่อ/kind
  chip/แท็ก/จำนวนลิงก์) + เนื้อหาตาม kind (`KIND_MAIN_BUILDER`) + Module
  Inspector dock (§1.3)
- **แต่ละ accordion section เลื่อนแยกกันเอง**: `#hub-body` เป็น flex column
  (electron/css/nav-hub.css), section ที่เปิดอยู่แชร์พื้นที่แนวตั้งที่เหลือเท่าๆ กัน
  (`flex:1` ต่อ `.acc-body`) และมี scrollbar ของตัวเอง ไม่ใช่หน้าเดียวยาว
  scroll รวมกันทั้ง Nest/Sage Hut/Import Dock เหมือนเดิม; ลำดับ section
  ยังเป็น stable sort เดิม (`buildHubHtml`) — section ที่เปิดขึ้นบนสุดตาม
  ลำดับเดิม, ที่ปิดจมลงล่างสุดตามลำดับเดิม, ตัวล่างสุดจะติดกับแถบ
  nexus-vault-head พอดี (`#left-panel-foot` เป็น flex sibling คงที่ใต้
  `#left-panel-inner`)

### 1.3 Module Inspector (`electron/src/renderer/inspector.js`, 148 บรรทัด — Phase 4)

Dock ขวาของ module ที่โฟกัสอยู่: kind (read-only) + description (markdown
มี wikilink), แท็ก, แอตทริบิวต์อิสระ (`module_attribute`), ลิงก์
ขาออก/backlink (ผ่าน `wiki_link` คีย์ `module_<id>`), ปุ่ม **Version
History** (§1.5) ที่สลับทั้ง dock ไปแสดงประวัติแทน

### 1.4 Builder (`electron/src/renderer/builder.js`, 618 บรรทัด — Phase 19, ขยายใหญ่
ใน Part 4 เป็น recursive split-layout tree แทน grid 1/2/4 ตายตัวเดิม)

Editor-group shell สไตล์ VS Code สำหรับพื้นที่หลัก — split ได้ตามใจ (แนวนอน/
แนวตั้ง ซ้อนได้ไม่จำกัดชั้น ผ่าน `builderSplitPane`/`builderClosePane`) แต่ละ
pane มีแท็บของตัวเอง + ประวัติ ◀/▶ แบบเบราว์เซอร์ ลาก tab reorder/ย้ายข้าม
pane/pop-out เป็นหน้าต่างแยกได้ (Part 3)

- "page" 1 หน้า = `{kind:'module',id}` หรือ `{kind:'file',id}` (Import
  Dock viewer) หรือ `{kind:'sagehut',tab}`
- re-render เฉพาะ pane ที่โฟกัส — pane อื่นคง DOM เดิมไว้ (listener ไม่หลุด)
  โดย "neutralize" id ธาตุกันชนกับ pane ที่โฟกัส
- แท็บ/หน้าต่างของโมดูลเดิม (Director project, Hero/Writer/Scribe entity)
  ยังอยู่แถบ `#builder-tabs` เดิมบน title bar แยกจาก grid นี้โดยเจตนา —
  ระบบ split-pane เป็นของ v3 เท่านั้น
- **`pruneStaleLayoutElements`** (เรียกทุกครั้งก่อน re-render grid ใน
  `renderBuilderPanes`) กวาด child ของ `#main-inner` ที่ไม่ใช่
  `.bpane`/`.bsplit` ทิ้งด้วย — ไม่ใช่แค่ prune node ที่ stale จาก layout
  tree เดิมเท่านั้น เพราะ legacy view (Scribe, Director, Nexus picker ฯลฯ)
  เขียนทับ `#main-inner.innerHTML` ตรงๆ เวลาเข้า view นั้น แล้วพอกลับมา
  Nexus home `ensureNodeElement` จะ `appendChild` โหนด `.bpane` ใหม่ทับ
  ลงไปโดยไม่เคลียร์ของเก่าออกก่อน — เดิมทำให้ content ของ legacy view
  ค้างอยู่ใต้ Builder pane ปิดไม่ได้ (บั๊กที่เจอชัดกับ Scribe)

### 1.5 ระบบร่วมของ v3

- **Version history** (`electron/src/db/versions.js` + `electron/src/renderer/versions.js`,
  Phase 21) — ทุก mutation (description, attribute, tag, classifier
  object/attr/template, author chapter ฯลฯ) บันทึกลง `module_version`
  พร้อม before-state, restore แล้วนับเป็นเวอร์ชันใหม่เสมอ (ไม่เขียนทับ
  ประวัติ), จำกัดจำนวนต่อ module ได้ (`app_setting.versionLimit`,
  ดีฟอลต์ 50)
- **Icon Collection picker** (`electron/src/renderer/iconpicker.js`, Phase 5) —
  3 แท็บ: ไอคอนในตัวแอป / symbol collection เดิม / รูปอัปโหลดเอง (crop
  วงกลมบน canvas) เก็บเป็น `svg:<key>` / `sym:<glyph>` / `img:<dataURI>`
- **Import Dock** (`electron/src/db/importdock.js` + `electron/src/renderer/mod/fileviewer.js`,
  Phase 18) — นำเข้าไฟล์จากโฟลเดอร์ (path จริงอยู่บนดิสก์ เก็บแค่ metadata),
  ผูกไฟล์กับ entity ใดก็ได้ผ่าน `linker_key`, ตั้งรูปเป็น "ภาพประจำตัว" ได้,
  เปิดดูแบบ read-only ใน Builder (รูป/markdown/text)
- **Search-link overlay (Ctrl+P)** (`electron/src/renderer/quickswitch.js`,
  Phase 20 — สืบต่อจาก quick switcher เดิม) — ค้นทุกอย่างทั้ง v3+legacy
  พร้อม scope chip (ทั้ง vault / ระดับ / subtree ของ module ที่โฟกัส),
  filter ตาม kind, Enter เปิด, Ctrl+Enter แทรก `[[wikilink]]`, Alt+Enter
  ปักหมุดลง canvas ของ Sketcher/Designer ที่เปิดอยู่
- **First-run guide** (`electron/src/renderer/guide.js`) — coach-mark สปอตไลต์
  หลังสร้าง Nexus แรกของผู้ใช้ ชี้ปุ่มสร้างโมดูล, section Nest/Sage,
  ปุ่ม export/import DB, ปุ่มสลับ vault — ข้ามขั้นที่หา DOM target ไม่เจอ
- **Artisan v3** (`electron/src/renderer/artisan.js`, `electron/src/db/artisan.js` ปัจจุบัน
  เหลือแค่ stub ว่าง) — เดิมมี transaction สร้างเองเฉพาะทาง ตอนนี้เปลี่ยนเป็น
  wizard ทีละขั้น เรียก IPC `module:create` / `classifier:createTemplate` /
  `author:createChapter` / `module:updateDescription` ตรงๆ ประกอบเทมเพลต
  (Manager Major + Minor หลาย kind) ให้ผู้ใช้ทีละหน้า, ไม่มี backend เฉพาะ
  แล้ว — Artisan ยังเป็นจุดเดียวที่เข้าถึงโมดูลเดิม 4 ตัวได้ (สร้างใหม่)
- **Legacy migration** (`electron/src/db/migrate_v3.js`, Phase 24 — เข้าถึงจากลิสต์
  legacy ใน Artisan) — `migrateLegacy(nexusId, target, legacyId)` map
  ข้อมูลเก่า 1 โปรเจกต์ (director/navigator/hero/writer) เป็น Manager Major
  + Minor ที่ kind เหมาะสม (classifier/chronicler/locator/narrator/author/
  drafter) ในทรานแซกชันเดียว **ไม่แตะข้อมูลต้นทางเลย** (non-destructive,
  lazy) — ผู้ใช้ลบของเก่าเองทีหลังถ้าพอใจผลลัพธ์

---

## 2. โมดูลเดิม (Director / Navigator / Hero / Writer / Scribe / Sage) — ยังอยู่ครบ

โค้ดและ IPC ของ 4 โมดูลตายตัวเดิม (Director/Navigator/Hero/Writer) **ไม่ได้
ถูกลบ** — ไฟล์ `electron/src/renderer/{director,navigator,hero,writer}.js` และ
`electron/src/db/{director,navigator,hero,writer}.js` เดิมทำงานปกติทุกอย่าง แต่ปุ่ม
บน nav rail ของทั้ง 4 ถูกซ่อนด้วย regex filter ใน `core/nav.js`
(`updateTopNavButton`) ตั้งแต่ Phase 1 — เข้าถึงได้เฉพาะทาง **Artisan**
(สร้างใหม่จากเทมเพลต v3) หรือ **migrate_v3.js** (นำเข้าของเก่าเข้า v3)
เท่านั้น ปุ่ม **Scribe, Sage, Artisan เองยังอยู่บน rail ตามปกติ** ไม่ถูกซ่อน

> ⚠️ ชื่อชนกัน: Scribe/Sage เดิม (โมดูลเต็มรูปแบบ, `electron/src/renderer/scribe.js`
> + `electron/src/db/scribe.js`, `electron/src/renderer/sage.js` + `electron/src/db/sage.js`) คนละตัว
> กับ **Sage Hut** (section ในหน้า Hub, `mod/sagehut.js`, ใช้ฟังก์ชันจาก
> `db/sage.js` บางส่วน) และ **kind `scribe`/ChatScribe** (โน้ตแชทต่อโมดูล,
> `mod/chatscribe.js` + `db/chatscribe.js`) — สามระบบแยกกันเด็ดขาด

```
Nexus (vault, electron/src/db/nexus.js)
│
├─ 1. Director            — ฐานข้อมูลเรื่อง (โปรเจกต์นิยาย) [เดิม, ผ่าน Artisan/migrate เท่านั้น]
├─ 2. Navigator            — โลก (World) [เดิม, ผ่าน Artisan/migrate เท่านั้น]
├─ 3. Hero                 — เกม (Game) [เดิม, ผ่าน Artisan/migrate เท่านั้น]
├─ 4. Writer               — งานเขียน [เดิม, ผ่าน Artisan/migrate เท่านั้น]
├─ 5. Scribe                — โน้ต Markdown สไตล์ Obsidian ทั้ง vault [rail ปกติ]
├─ 6. Sage                  — สถิติ/วิเคราะห์ read-only 4 แท็บ [rail ปกติ]
└─ 7. Artisan               — สร้างจากเทมเพลต v3 + migrate ของเก่า [rail ปกติ]
```

โครงสร้างข้อมูล/พฤติกรรมภายในของทั้ง 7 นี้ไม่เปลี่ยนจากเอกสารก่อนหน้า
(หัวข้อ Category/Object/Field ของ Director, Original/Characters/Map
Timelines ของ Navigator ฯลฯ) — ดู `docs/SYSTEMS.md` §3–§9 (ยังอ้างอิงโค้ด
เดิมได้ตรง เพราะไฟล์เหล่านี้ไม่ถูกแตะในรอบ v3)

### ระบบร่วม (cross-cutting — ไม่ใช่โมดูลข้อมูล แต่ทุกโมดูลพึ่งพา)

```
├─ Wikilink + Backlinks     (src/db/wiki.js) — [[Name]] resolve/index/graph
│                            คีย์ entity รวม module_<id> ของ v3 ด้วยแล้ว
├─ IDE Shell                (Explorer ครอบทั้ง v3+legacy ผ่าน wiki:explorerTree,
│                            Status bar, Search-link overlay Ctrl+P — §1.5)
├─ i18n                     (src/renderer/i18n.js, 18 ภาษา)
├─ Theme + UI scale         (css/tokens.css + css/themes.css,
│                            ตั้งค่าใน core/settings.js + core/theme.js)
└─ Modal/Toast/ColorPicker/SymbolPicker/HashtagSelector
                            (คอมโพเนนต์กลาง, core/ui.js + core/pickers.js)
```

### ชั้นระบบ (นอกโมดูล UI)

```
electron/main.js        — Electron main process, IPC handler ทุกช่อง namespace v3
                 (module: classifier: locator: chronicler: wanderer:
                 narrator: author: scribe→chatscribe: drafter: viewer:
                 connector: sketcher: designer: importdock: sagehut:
                 migrate: versions:) + namespace เดิม (project/category/...,
                 world:, game:, write:, note:, wiki:, sage:, nexus:, window:)
electron/preload.js     — เปิด window.api.<namespace>.<fn> (สารบัญ API, 1:1 กับ electron/main.js)
electron/database.js    — รวม export ของ electron/src/db/*.js ทั้งหมด
electron/src/db/core.js — façade 18 บรรทัด re-export 5 ชื่อเดิม; ตัวจริงแยกเป็น
                 conn.js (เปิด DB + statement cache),
                 schema/{ddl,indexes,seed}.js (SQL ล้วน — รวม module/
                 module_attribute/module_ui/module_hashtag/module_version
                 + CHECK ของ kind), schema/init.js (schemaStamp + initDB),
                 schema/migrations.js, import-merge.js (export/import)
```

---

## 3. Flutter Port (`flutter/`) — Module Tree

พอร์ตนี้ยังไม่ครบทุกโมดูลของฝั่ง Electron (ใช้ schema DB เดียวกันแต่พัฒนาแยก
progress ต่างกัน) โครงสร้างตาม `lib/features/`:

```
lib/
├─ core/           — database, i18n, providers (Riverpod), router, theme
├─ data/           — dao, models, services (data layer กลาง)
├─ providers/       — color/hashtag/project/world providers
├─ widgets/         — คอมโพเนนต์ใช้ร่วม (color picker, hashtag chip, confirm dialog)
└─ features/
   ├─ nexus/        — vault picker/home (เทียบเท่า Nexus ฝั่ง Electron)
   ├─ director/      — โมดูล Director
   ├─ navigator/     — โมดูล Navigator (World)
   ├─ colors/        — จัดการสี
   ├─ tags/          — จัดการแท็ก
   ├─ search/        — ค้นหา global
   └─ settings/      — ตั้งค่า (ธีม/ภาษา)
```

โมดูล Hero, Writer, Scribe, Sage, Artisan, Wikilink/Backlinks, IDE shell —
**ยังไม่มีในฝั่ง Flutter** และ **v3 module system (Nest/Hub/Builder/kind
ทั้ง 15) ก็ยังไม่มีในฝั่ง Flutter เช่นกัน** ณ วันที่เขียนเอกสารนี้ — ฝั่ง
Flutter ไม่มีตาราง `module` เลย (`procress.md` บันทึกไว้ว่าเป็นช่องว่างเดิม
ที่ยังไม่ต้องแก้)

---

## 4. สรุปการ mapping โมดูล ↔ ไฟล์ (Electron)

### v3 module kinds

| kind | Renderer (`electron/src/renderer/mod/`) | DB layer | IPC namespace |
|---|---|---|---|
| collector | *(hub/tree.js)* | *(module.js)* | `module:` |
| manager | manager.js | *(module.js)* | `module:` |
| inspector | detail.js | *(module.js)* | `module:` |
| classifier | classifier.js | classifier.js | `classifier:` |
| locator | locator.js | map.js | `module: map:` |
| chronicler | chronicler.js | timeline.js | `module: timeline:` |
| wanderer | wanderer.js | wanderer.js | `wanderer:` |
| narrator | narrator.js | narrator.js | `narrator:` |
| author | author.js | author.js | `author:` |
| scribe (ChatScribe) | chatscribe.js | chatscribe.js | `chatscribe:` |
| drafter | *(mod/drafter.js mountDrafterEditor)* | *(module.js)* | `module:` |
| viewer | viewer.js | viewer.js | `viewer:` |
| connector | connector.js | viewer.js | `viewer: wiki:` |
| sketcher | sketcher.js | sketcher.js | `sketcher:` |
| designer | designer.js | designer.js | `designer:` |
| *(Hub section)* sagehut | sagehut.js | sage.js | `sagehut:` |
| *(Hub section)* Import Dock | fileviewer.js | importdock.js | `importdock:` |

โครง Hub/Builder/Inspector เอง: `hub/`, `builder.js`, `inspector.js`,
`iconpicker.js`, `versions.js`/`electron/src/db/versions.js`, `guide.js` —
ไม่มี IPC namespace ของตัวเอง (เรียกผ่าน `module:`/`versions:`/`migrate:`)

### โมดูลเดิม (ผ่าน Artisan/migrate เท่านั้น)

| โมดูล | Renderer | DB layer | IPC namespace (electron/main.js) |
|---|---|---|---|
| Nexus (vault) | core/views.js (renderNexusHome) + hub/ | nexus.js | `nexus:` |
| Director | director.js, modals.js, search.js, timeline.js, relation.js, map.js, hashtag.js | director.js, timeline.js, relation.js, map.js, hashtag.js, color.js | `folder: project: category: template: object: color: timeline: relation: map: hashtag: search:` |
| Navigator | navigator.js | navigator.js | `world:` |
| Hero | hero.js | hero.js | `game:` |
| Writer | writer.js | writer.js | `write:` |
| Scribe (เดิม, ทั้ง vault) | scribe.js, mdeditor.js | scribe.js | `note:` |
| Wikilink/Backlinks | core/router.js (openEntityByKey ฯลฯ), quickswitch.js | wiki.js | `wiki:` |
| Sage (เดิม, ทั้ง vault) | sage.js | sage.js | `sage:` |
| Artisan | artisan.js | *(stub — ประกอบผ่าน module:/classifier:/author: ตรงๆ)* | `module: classifier: author: migrate:` |
| Window chrome | core/chrome.js (bindWindowChrome) | — | `window:` |
