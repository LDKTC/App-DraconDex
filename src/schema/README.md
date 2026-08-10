# สัญญา SQLite schema

Electron กับ Flutter เปิดไฟล์ฐานข้อมูล **ไฟล์เดียวกัน** (`novel-manager.db`)
แต่ต่างคนต่าง implement schema ในภาษาของตัวเอง — ไม่มีการ generate จากต้นฉบับกลาง
โฟลเดอร์นี้จึงไม่มีไฟล์ DDL ของตัวเอง มีแต่กติกาว่าใครเป็นเจ้าของอะไร

## ใครถือของจริง

| ฝั่ง | ไฟล์ | สถานะ |
|---|---|---|
| Electron | [`../../electron/src/db/schema/ddl.js`](../../electron/src/db/schema/ddl.js) | **canonical** — 103 ตาราง |
| Electron | `indexes.js` · `seed.js` · `migrations.js` (โฟลเดอร์เดียวกัน) | index, ข้อมูลตั้งต้น, และ migration ตามเวอร์ชัน |
| Flutter | [`../../flutter/lib/core/database/database_schema.dart`](../../flutter/lib/core/database/database_schema.dart) | **port ที่ตามหลัง** — 40 ตาราง |

40 ตารางฝั่ง Flutter เป็น **subset แท้** ของฝั่ง Electron (ตรวจแล้ว: ไม่มีตาราง
ไหนที่ Dart มีแต่ JS ไม่มี) ส่วนที่ยังไม่ได้ port คือระบบ v3 module tree
(`module`, `module_attribute`, `module_ui`, `module_version`), Nexus, Writer,
Scribe, Sage, Artisan, wikilink, plugin และ chat

## กติกาเวลาแก้ตาราง

1. **แก้ที่ Electron ก่อนเสมอ** — `ddl.js` คือของจริง
2. ตารางใหม่หรือคอลัมน์ใหม่ที่ต้องรองรับฐานข้อมูลเดิม ต้องเพิ่ม migration ใน
   `migrations.js` ด้วย ไม่ใช่แก้แค่ `ddl.js`
3. `ddl.js` / `indexes.js` / `seed.js` คือสิ่งที่ `schemaStamp()` ใน
   [`init.js`](../../electron/src/db/schema/init.js) เอาไป hash — stamp ที่
   เปลี่ยนคือสิ่งที่ทำให้ทางลัด "ข้าม initDB ถ้า schema ตรงอยู่แล้ว" ปลอดภัย
   แก้สามไฟล์นี้แล้ว stamp ขยับเอง ไม่ต้องไปแตะมือ
4. ถ้าตารางที่แก้อยู่ใน 40 ตารางที่ Flutter port แล้ว **ต้องแก้ฝั่ง Dart ด้วย** —
   ไม่งั้นแอปสองตัวจะเขียนไฟล์เดียวกันคนละรูปแบบ
5. ถ้าเป็นตารางที่ Flutter ยังไม่ port ก็ปล่อยไว้ได้ — Dart จะไม่แตะตารางที่ไม่รู้จัก

รายละเอียดว่าตารางไหนอยู่ในระบบไหน ดู [`docs/Architec.md`](../../docs/Architec.md)
และ [`docs/SYSTEMS.md`](../../docs/SYSTEMS.md)
