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
