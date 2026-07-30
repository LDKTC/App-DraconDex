# Github Extensions — Sandboxed Plugin Runtime

> สถานะ: ใช้งานได้ — เพิ่มเข้ามาในเวอร์ชัน 4.0.0 (2026-07-30)
> ดาวน์โหลด "extension" จาก GitHub repo ที่มี manifest ของตัวเอง แต่ละ extension
> มีตารางฐานข้อมูลของตัวเอง รันในหน้าต่างแยกที่ถูกจำกัดสิทธิ์อย่างจริงจัง — ไม่ใช่
> การ stub หรือรันแบบเต็มสิทธิ์

เอกสารนี้มี 2 ส่วน: **วิธีใช้งาน** สำหรับผู้ใช้ และ **หลักการทำงาน + ข้อจำกัดด้าน
ความปลอดภัย** สำหรับผู้พัฒนา — ส่วนหลังสำคัญมาก อ่านก่อนเชื่อว่าฟีเจอร์นี้
"ปลอดภัย 100%"

---

## ส่วนที่ 1 — วิธีใช้งาน

### 1.1 ติดตั้ง extension

1. เปิด **การตั้งค่า** (Setting window) → Extension → **ส่วนขยาย
   (Extension)** (2026-07-30: ย้ายจาก Preferences panel เดิม)
2. กรอกชื่อเจ้าของ repo และชื่อ repo บน GitHub ที่มีไฟล์
   `dracondex-extension.json` อยู่ที่ root ของ repo (ระบุ branch/ref ได้ ถ้าไม่
   ระบุจะใช้ `main`)
3. กด **ติดตั้ง** — แอปจะดาวน์โหลด manifest และไฟล์ที่ manifest ระบุไว้ทั้งหมด
   ตรวจสอบความถูกต้องก่อนเขียนอะไรลงดิสก์หรือฐานข้อมูล

### 1.2 เปิดใช้งาน extension

กด **เปิดใช้งาน** ที่รายการ extension ที่ติดตั้งแล้ว — จะเปิดเป็นหน้าต่างแยก
ต่างหาก **extension ไม่มีสิทธิ์เข้าถึงข้อมูลของแอปหลักเลย** — เข้าถึงได้แค่ตาราง
ของตัวเองที่ประกาศไว้ใน manifest เท่านั้น เมื่อเปิดอยู่ ปุ่มจะเปลี่ยนเป็น
**หยุด** (2026-07-30 — `extension:stop`/`extension:isRunning` ต่อ IPC ไว้
ครบตั้งแต่แรกแต่ไม่เคยมีปุ่มเรียกใช้จนตอนนี้)

### 1.2b Extension setting (2026-07-30)

หน้า **Extension setting** (Setting window → Extension) จะแสดงรายการ
extension ที่ติดตั้งไว้ทั้งหมด — ถ้า extension ไหนมีการตั้งค่าของตัวเอง จะมา
โผล่ตรงนี้ ตอนนี้ยังไม่มี extension ไหนประกาศ settings schema ใน manifest
(`dracondex-extension.json` ยังไม่มีฟิลด์นี้ — ดู §1.4) หน้านี้จึงแสดงแค่ชื่อ
extension พร้อมข้อความ "ไม่มีการตั้งค่า" ต่อรายการไปก่อน

### 1.3 ถอนการติดตั้ง

กด **ลบ** ที่รายการ extension — ต้องปิดหน้าต่าง extension นั้นก่อนถ้ากำลังเปิด
อยู่ การถอนการติดตั้งจะ**ลบไฟล์และตารางฐานข้อมูลของ extension นั้นถาวร**
ไม่สามารถย้อนกลับได้

### 1.4 สร้าง extension เอง — รูปแบบ manifest

วาง `dracondex-extension.json` ไว้ที่ root ของ repo:
```json
{
  "id": "myplugin", "name": "My Plugin", "version": "1.0.0",
  "entry": "index.html", "files": ["index.html", "app.js"],
  "tables": [{ "name": "notes", "columns": [
    { "name": "title", "type": "TEXT" }, { "name": "rating", "type": "INTEGER" }
  ]}]
}
```
- `id`: ตัวพิมพ์เล็ก a-z/0-9/_ เท่านั้น ยาวไม่เกิน 20 ตัวอักษร
- `entry`: ไฟล์ HTML ที่จะเปิดเป็นหน้าแรก ต้องอยู่ใน `files` ด้วย
- `files`: รายชื่อไฟล์ทั้งหมดที่ extension ต้องการ (ไม่เกิน 30 ไฟล์ ไฟล์ละไม่เกิน
  2MB) — แอปจะดึงทีละไฟล์ตามที่ระบุเท่านั้น ไม่เดินสำรวจ repo เอง
- `tables`: ตารางที่ extension อยากมีเป็นของตัวเอง (ไม่เกิน 10 ตาราง คอลัมน์ไม่
  เกิน 25 คอลัมน์ต่อตาราง) ชนิดคอลัมน์รองรับแค่ `TEXT`/`INTEGER`/`REAL` เท่านั้น
- ภายใน extension เรียกใช้ตารางผ่าน `window.extApi.table.query/insert/update/
  delete/getSchema('notes', ...)` — ไม่มี `window.api` ให้ใช้เลย

---

## ส่วนที่ 2 — หลักการทำงาน + ข้อจำกัดด้านความปลอดภัย (สำหรับผู้พัฒนา)

### 2.1 สถาปัตยกรรม

```
Renderer (แอปหลัก, src/renderer/extension.js)     Extension window (แยกต่างหาก)
   │ window.api.extension.*  (preload.js)            │ window.extApi.table.*
   │ install/list/uninstall/launch/stop                (preload-ext.js — ไม่มี
   ▼                                                    window.api เลย)
Main process (main.js)                            ▼
   │ createExtensionWindow() — BrowserWindow ใหม่      extapi:table:* IPC
   │   ต่อ extension ที่รัน, preload: preload-ext.js    (raw ipcMain.handle,
   │   contextIsolation:true, nodeIntegration:false,     resolve extId จาก
   │   sandbox:true (ดู §2.4 ว่าทำไมนี่คือความ            BrowserWindow.
   │   ซื่อสัตย์ ไม่ใช่การอวดอ้าง)                        fromWebContents)
   ▼
src/db/extension.js — validate manifest, install/uninstall (ไฟล์+DB),
extApiQuery/Insert/Update/Delete/GetSchema (บังคับ ownership ทุกครั้ง)
```

### 2.2 ทำไมต้องแยกระบบใหม่ทั้งหมด ไม่ใช้ของเดิม

`module.kind` มี SQL `CHECK` constraint บังคับ 15 ค่าตายตัว
(`src/db/schema/ddl.js`) — SQLite ไม่รองรับการ `ALTER` constraint นี้ extension
จึงต้องมีตาราง/registry เป็นของตัวเอง (`extension`, `extension_table`) ไม่ใช่
kind ที่ 16

### 2.3 โมเดลความปลอดภัย — identifier whitelist

ไม่มี prepared-statement parameter ตัวไหน bind ชื่อ table/column ได้ (bind ได้
แค่ค่า value) — ดังนั้นทุก identifier ที่มาจาก extension (manifest's table/
column names) ต้องผ่าน regex whitelist ที่เข้มงวดก่อนถูกนำไปประกอบ SQL เสมอ:

```js
EXT_ID_RE     = /^[a-z0-9_]{1,20}$/
EXT_TABLE_RE  = /^[a-z0-9_]{1,20}$/
EXT_COLUMN_RE = /^[a-z][a-z0-9_]{0,29}$/
FULL_TABLE_RE = /^ext_[a-z0-9_]{1,41}$/   // ตรวจซ้ำก่อน DDL ทุกครั้ง
COL_TYPES     = {'TEXT','INTEGER','REAL'}  // เท่านั้น ไม่รับ type อื่น
RESERVED_COLS = {'id','rowid','oid','_rowid_'}
```

ไม่รับ `DEFAULT`/`CHECK`/`FOREIGN KEY` จาก manifest เลย — จะเปิดช่องโหว่โดยไม่
จำเป็นสำหรับ extension ระดับ MVP

`extension_table.table_name` (เช่น `ext_myplugin_notes`) เป็น identifier
เดียวที่ระบบเก็บและนำมาใช้ตอน runtime — ทุกครั้งที่ extApi เรียก จะ lookup ผ่าน
`?`-bound query บน `(extension_ref, local_name)` ก่อนเสมอ **ไม่มีการต่อ string
จาก renderer/extension โดยตรงเป็น identifier เด็ดขาด**

### 2.4 สิ่งที่ป้องกันได้ vs สิ่งที่ป้องกันไม่ได้ (ซื่อสัตย์ ไม่ใช่โฆษณา)

**ป้องกันได้:**
- หน้าต่าง extension ไม่เคยได้รับ `preload.js` เลย — เข้าถึง `window.api.*`
  ไม่ได้เด็ดขาด (เป็นข้อเท็จจริงเชิงโครงสร้าง ไม่ใช่การเช็คแบบ runtime ที่ bypass
  ได้)
- แตะตารางของ extension อื่นหรือของแอปหลักไม่ได้ — ทุกคำสั่ง `extApi.table.*`
  resolve ownership จาก**ตัวหน้าต่างที่เรียกเอง** (`BrowserWindow.
  fromWebContents`) ไม่ใช่จาก argument ที่ extension ส่งมา
- รัน SQL เองไม่ได้เลย — ไม่มี raw-SQL passthrough ใน `extApi.*` แม้แต่จุดเดียว

**ป้องกันไม่ได้ (ยอมรับเป็นข้อจำกัดที่รู้อยู่แล้ว ไม่ใช่สิ่งที่ plan นี้อ้างว่าแก้ได้):**
- **ไม่มี OS-level Chromium sandbox จริง** — `main.js` มี
  `app.commandLine.appendSwitch('no-sandbox')` ตั้งไว้ทั้งโปรเซส (เพื่อความ
  เข้ากันได้กับ portable build) ตั้งแต่ก่อนฟีเจอร์นี้จะมีอยู่ — ทุกหน้าต่างในแอป
  รวมถึงหน้าต่าง extension ได้รับผลกระทบนี้เหมือนกันหมด Electron ไม่รองรับการ
  เปิด sandbox กลับเฉพาะบางหน้าต่างหลังตั้ง flag นี้ไปแล้ว การตั้ง
  `sandbox: true` ใน webPreferences ของหน้าต่าง extension จึงใกล้เคียง no-op
  ในตอนนี้ — ยังคงตั้งไว้เผื่ออนาคตถ้า flag นี้ถูกทบทวนใหม่ ไม่ใช่การันตีการป้องกัน
  จริงวันนี้
- JS ของ extension ที่เป็นอันตรายยังรันอยู่ใน V8/Electron process เดียวกัน
  และอาจพยายามโจมตีระดับ engine (เช่น prototype pollution) ได้ — ความเสี่ยง
  แบบเดียวกับที่ตัวแอปหลักเองก็มีอยู่แล้ว ไม่ใช่สิ่งที่ฟีเจอร์นี้เพิ่มขึ้นมาใหม่
- โค้ดจาก GitHub ถูก**เชื่อถือทันทีที่ติดตั้ง ไม่มีการตรวจสอบหรือ code review/
  signing ใดๆ** — ตรงตามที่ Plan.md ขอ ("ดาวน์โหลด extension จาก GitHub") แต่
  ไม่มีการป้องกัน supply-chain ใดๆ เพิ่มเติม

### 2.5 การดาวน์โหลด — ไม่มี zip, ไม่มี dependency ใหม่

ดึงทีละไฟล์ผ่าน `raw.githubusercontent.com/{owner}/{repo}/{ref}/{path}` (ไม่ใช่
Contents API เพราะ raw คืน bytes ตรง ไม่ต้อง decode base64 ซ้อน) buffer แล้ว
`fs.writeFileSync` ตรงตามแพทเทิร์นเดิมที่ `drive.js` ใช้อยู่แล้ว — ไม่มี octokit,
ไม่มี zip/tar library ใหม่ (`unzipper` ที่มีอยู่ใน node_modules เป็นแค่
transitive dev dependency ของ electron-builder เอง ใช้ตอน runtime ไม่ได้และไม่
ควรพึ่งพา)

### 2.6 การทดสอบ

ทดสอบ 2 ส่วนแยกกัน:
1. **Manifest validator** (`validateManifest`) — เป็น pure function ไม่พึ่ง
   Electron เลย ทดสอบตรงผ่าน plain Node ด้วย fixture หลายแบบ (ถูกต้อง, id ผิด
   รูปแบบ, column type ผิด, ชื่อ column สงวนไว้, มี SQL metacharacter, path
   traversal ใน files, ตารางเกิน limit ฯลฯ) — ผ่านครบทุกกรณี
2. **extApi bridge + ownership enforcement** — ทดสอบจริงผ่าน `run-dracondex`
   driver: seed ข้อมูล extension 2 ตัวตรงในไฟล์ฐานข้อมูล (ไม่ผ่าน network),
   เปิดหน้าต่าง extension จริง ให้ตัวมันเอง insert/query/update/getSchema บน
   ตารางของตัวเอง (สำเร็จ), พยายามแตะตารางของอีก extension (ถูกปฏิเสธด้วย
   "not an owned table"), และแตะตารางที่ไม่มีอยู่จริง (ถูกปฏิเสธเช่นกัน) —
   ยืนยันแล้วว่า `window.api` ไม่มีอยู่ในหน้าต่าง extension เลย (`hasMainApi:
   false`)
3. การติดตั้งจาก repo GitHub จริงๆ (network เต็มรูปแบบ) เป็นการทดสอบที่ทำ
   อัตโนมัติในสภาพแวดล้อมนี้ไม่ได้ — ต้องตรวจสอบด้วยมือ
