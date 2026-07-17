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
