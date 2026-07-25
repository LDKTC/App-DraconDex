> สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
---
> หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-----
part 1 — Backend efficiency: data layer + boot (src/db, main process)
- [x] 1.0 perf instrumentation (env DDX_PERF) + เก็บ baseline boot เย็น/อุ่น ก่อนแตะอะไร
- [x] 1.1a prep refactor: hoist DDL_SQL / INDEX_SQL / SEED_SYMBOLS, แยก migrateInlineColumns() (ย้ายข้อความล้วน ไม่เปลี่ยนพฤติกรรม)
- [x] 1.1b schema-version stamp ผ่าน PRAGMA user_version (hash จาก DDL+index+migration) + PRAGMA cache_size/temp_store + ห่อ symbol seed 48 แถวใน transaction
- [x] 1.2 renderer boot: 7 await เรียงกัน -> 2 คลื่น Promise.all
- [x] 1.3 statement cache ใน adaptDb (ใช้ _reset(), gate cacheOn ปิดตลอด initDB, LRU 256, flush ตอน close/DDL)
- [x] 1.4 เพิ่ม index ที่ขาด ~18 ตัว รวม composite module_version(module_ref,seq) และ import_file(nexus_ref,file_path)
- [x] 1.5 sqlscope.js + แก้ 4 closure หลัก (quickIndex/getGraph/viewerIndex/sageHutStats) และ site เดี่ยว ~20 จุด ให้ sargable
- [x] 1.6 ห่อ write loop ที่ยังไม่มี transaction; syncWorldCategoryObjects ให้ no-op เมื่อ diff ว่าง
- [x] 1.7 แก้บั๊ก PRAGMA foreign_keys=OFF ที่อยู่ใน transaction ของ importDatabaseMerge (ไม่มีผลจริง)
- [x] verify part 1: check.mjs (0 err / 31 warn) + boot profile + regression DDL-lock + EXPLAIN QUERY PLAN
-----
part 2 — Backend efficiency: IPC surface + renderer call sites
- [ ] 2.1 batch IPC: classifier:getObjectsFull (4+2N -> 4), object:getAttrsBulk/getTagsBulk, object:upsertAttrs, module:getInspector, world bulk (handler+preload+call site พร้อมกัน)
- [ ] 2.2 display image ผ่าน protocol ddx-file:// (fallback: importdock:readFiles แบบ batch + fs.promises)
- [ ] 2.3 Sage Hut: ดึงตาม tab + cache ต่อ (nexusId,tab); ยุบ query description ต่อ module ใน sage.js
- [ ] 2.4 wiki.js: rebuildWikiIndex เป็น transaction เดียว + memo resolveWikiName; resolveEntityKeys ใช้ IN แบบ chunk (คง order ของ getBacklinks)
- [ ] 2.5 nest render storm: รวมเป็น module:getNestItems + รวบ re-render เป็นครั้งเดียว
- [ ] verify part 2: check.mjs + นับ IPC round-trip จริง (คาด 304 -> 4) + ขับแอปจริงครบ flow
-----
