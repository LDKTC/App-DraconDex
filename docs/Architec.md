# DraconDex — โครงสร้าง Module / Submodule

> เอกสารนี้สรุป **สถาปัตยกรรมระดับโมดูล** ของแอป (module tree) — ใครประกอบด้วย
> อะไรบ้าง, ไฟล์ไหนรับผิดชอบส่วนไหน อ้างอิงจากโค้ด ณ วันที่ 2026-07-07
> รายละเอียดพฤติกรรมเชิงลึกดู [SYSTEMS.md](SYSTEMS.md), รายไฟล์ดู [FILES.md](FILES.md)

## ภาพรวมสแต็ก

```
┌─────────────────────────────────────────────────────────────┐
│ Electron App (โปรดักชันหลัก)                                 │
│  main.js → preload.js → src/renderer/* (UI)                 │
│  database.js → src/db/* (data layer, node-sqlite3-wasm)      │
├─────────────────────────────────────────────────────────────┤
│ flutter_app/ (Flutter port — front-end แยก, DB schema ร่วม)   │
└─────────────────────────────────────────────────────────────┘
```

ทั้งสองฝั่งอ่าน/เขียนไฟล์ `novel-manager.db` schema เดียวกัน แต่แยกโค้ด UI
กันคนละภาษา/เฟรมเวิร์กโดยสิ้นเชิง

---

## 1. Electron App — Module Tree

Nexus (vault) เป็นชั้นบนสุดที่ครอบทุกโมดูล — เปิด Nexus 1 อันแล้วจะเห็น
การ์ด 7 โมดูลหลักข้างล่างนี้:

```
Nexus (vault, src/db/nexus.js)
│
├─ 1. Director            — ฐานข้อมูลเรื่อง (โปรเจกต์นิยาย)
│   ├─ Category/Object/Field   (object_category, object_template, object)
│   ├─ Timeline                (src/renderer/timeline.js, src/db/timeline.js)
│   ├─ Relation                (src/renderer/relation.js, src/db/relation.js)
│   ├─ Map                     (src/renderer/map.js, src/db/map.js)
│   ├─ Tags (project-scope)    (src/renderer/hashtag.js, src/db/hashtag.js)
│   ├─ Colors                  (colorPicker ใน core.js, src/db/color.js)
│   └─ Search (global)         (src/renderer/search.js, searchAll ใน director.js)
│
├─ 2. Navigator            — โลก (World) ที่เชื่อมข้อมูลจาก Director
│   ├─ Original                (world_orig_category/template/object)
│   ├─ Characters & Categories (world_novel link, world_character(+link))
│   ├─ Map Timelines           (world_timeline, world_timeline_object)
│   └─ Tags                    (world tag mapping)
│   (ไฟล์เดียว src/renderer/navigator.js + src/db/navigator.js)
│
├─ 3. Hero                 — เกม (Game) ที่อิงนิยาย
│   ├─ Characters (leveled)    (game_character, game_char_template/attribute)
│   ├─ Collections             (game_collection + element/template ของตัวเอง)
│   ├─ Story (dialogue graph)  (game_story, game_dialogue, game_conversation)
│   ├─ Novel link              (game_category, game_cat_object)
│   └─ Tags
│   (src/renderer/hero.js + src/db/hero.js)
│
├─ 4. Writer               — งานเขียน
│   ├─ Series → Book → Chapter (write_project/series/book/chapter)
│   ├─ Word link (ลากคำผูก object) (write_word_link)
│   ├─ Novel link + Wiki page   (write_novel_link, write_wiki_link)
│   └─ Chat note                (write_note, write_chat)
│   (src/renderer/writer.js + src/db/writer.js)
│
├─ 5. Scribe (v2.8)        — โน้ต Markdown สไตล์ Obsidian
│   ├─ Folder tree + Notes     (note_folder, note)
│   ├─ Markdown editor (ใช้ร่วมกับ Director object note)
│   │   (src/renderer/mdeditor.js, src/renderer/markdown.js)
│   └─ Graph tab               (renderScribeGraph, reuse buildSageGraph)
│   (src/renderer/scribe.js + src/db/scribe.js)
│
├─ 6. Sage                 — สถิติ/วิเคราะห์ (read-only, 4 แท็บ)
│   ├─ ขนาดข้อมูล   (getDataSize)
│   ├─ จำนวนรายการ  (getObjectAmounts)
│   ├─ รายการเชื่อมต่อ (getLinkerList)
│   └─ กราฟเชื่อมต่อ  (getLinkerGraph)
│   (src/renderer/sage.js + src/db/sage.js)
│
└─ 7. Artisan              — สร้างจากเทมเพลต (เขียนลง Director/Navigator/Hero/Writer)
    ├─ เลือกโมดูลเป้าหมาย + เทมเพลต (ARTISAN_TARGETS ใน src/renderer/artisan.js)
    └─ สร้างข้อมูลจริงใน transaction เดียว (src/db/artisan.js)
```

### ระบบร่วม (cross-cutting — ไม่ใช่โมดูลข้อมูล แต่ทุกโมดูลพึ่งพา)

```
├─ Wikilink + Backlinks     (src/db/wiki.js) — [[Name]] resolve/index/graph
├─ IDE Shell                (Explorer, Status bar, Quick switcher Ctrl+P,
│                            Shortcuts) — src/renderer/explorer.js,
│                            quickswitch.js, updateStatusBar() ใน core.js
├─ i18n                     (src/renderer/i18n.js, 18 ภาษา)
├─ Theme + UI scale         (style.css, ตั้งค่าใน core.js)
└─ Modal/Toast/ColorPicker/SymbolPicker/HashtagSelector (คอมโพเนนต์กลาง, core.js)
```

### ชั้นระบบ (นอกโมดูล UI)

```
main.js        — Electron main process, IPC handler ทุกช่อง (namespace ตรงกับ
                 โมดูลด้านบน: project/category/... , world:, game:, write:,
                 note:, wiki:, artisan:, sage:, nexus:, window:)
preload.js     — เปิด window.api.<namespace>.<fn> (สารบัญ API)
database.js    — รวม export ของ src/db/*.js ทั้งหมด
src/db/core.js — เปิด DB, schema ~78 ตาราง, migration, export/import
```

---

## 2. Flutter Port (`flutter_app/`) — Module Tree

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
**ยังไม่มีในฝั่ง Flutter** ณ วันที่เขียนเอกสารนี้

---

## 3. สรุปการ mapping โมดูล ↔ ไฟล์ (Electron)

| โมดูล | Renderer | DB layer | IPC namespace (main.js) |
|---|---|---|---|
| Nexus (vault) | core.js (renderNexusHome ฯลฯ) | nexus.js | `nexus:` |
| Director | director.js, modals.js, search.js, timeline.js, relation.js, map.js, hashtag.js | director.js, timeline.js, relation.js, map.js, hashtag.js, color.js | `folder: project: category: template: object: color: timeline: relation: map: hashtag: search:` |
| Navigator | navigator.js | navigator.js | `world:` |
| Hero | hero.js | hero.js | `game:` |
| Writer | writer.js | writer.js | `write:` |
| Scribe | scribe.js, mdeditor.js, markdown.js | scribe.js | `note:` |
| Wikilink/Backlinks | core.js (openEntityByKey ฯลฯ), explorer.js, quickswitch.js | wiki.js | `wiki:` |
| Sage | sage.js | sage.js | `sage:` |
| Artisan | artisan.js | artisan.js | `artisan:` |
| Window chrome | core.js (bindWindowChrome) | — | `window:` |
