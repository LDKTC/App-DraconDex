# Vault files — `app.ddx` + หนึ่ง `.ddx` ต่อหนึ่ง Nexus (v4.9.0)

เอกสารนี้อธิบายการแยกฐานข้อมูลเดี่ยวออกเป็นไฟล์ระดับแอปหนึ่งไฟล์ กับไฟล์ของ
แต่ละ Nexus อีกไฟล์ละหนึ่งอัน — เป็นการเปลี่ยนสถาปัตยกรรมที่ใหญ่ที่สุดตั้งแต่
v3 ดังนั้นอ่านไฟล์นี้ก่อนแตะอะไรใน `electron/src/db/`

---

## 1. ทำไมต้องแยก

ก่อน v4.9.0 ทุก Nexus อยู่ในไฟล์เดียวกัน (`novel-manager.ddx`) ผลคือ:

- เอาโลกใบเดียวใส่ USB ไปเขียนต่อที่อื่นไม่ได้
- เก็บงานคนละโปรเจกต์ไว้คนละโฟลเดอร์ไม่ได้
- ส่ง Nexus ให้เพื่อนหนึ่งอัน = ส่งทุกอย่างที่มีในแอปให้ไปด้วย **รวมทั้ง
  refresh token ของ Google Drive ที่อยู่ใน `app_setting`**

หลัง v4.9.0 ไฟล์ vault หนึ่งไฟล์ = โลกหนึ่งใบ แบบพอตัวเอง (self-contained)
ส่งต่อได้ และ**ไม่มี** credential ของผู้ใช้ติดไปด้วย

## 2. อะไรอยู่ไฟล์ไหน

```
<dataDir>/
  app.ddx                     ← ระดับ "การติดตั้ง" (7 ตาราง)
  vaults/<slug>-<id>.ddx      ← หนึ่งไฟล์ต่อหนึ่ง Nexus (~101 ตาราง)
  novel-manager.ddx.bak       ← ไฟล์เดิมก่อนแยก เก็บไว้ตลอด ไม่ลบ
```

| ไฟล์ | ตาราง |
|---|---|
| `app.ddx` | `app_setting`, `nexus_file`, `plugin`, `plugin_table`, `plugin_dependency`, `plg_*`, `use_color` |
| vault `.ddx` | ที่เหลือทั้งหมด — `nexus` (แถวเดียว), `module`, `note`, `import_file`, `entity_relation`, ตระกูล legacy `project`/`world_*`/`game_*`/`write_*`, `use_color` |

`use_color` อยู่**ทั้งสองฝั่ง**โดยตั้งใจ: ทุกตารางใน vault มี
`color INTEGER REFERENCES use_color(id)` จึงต้องมีสำเนาของตัวเอง; และหน้าต่าง
Welcome ยังไม่ได้เปิด vault ใดเลย แต่ต้องวาดสีของ vault และเรียก `colorPicker()`
ตอนสร้าง Nexus ใหม่ได้ seed เป็นลิสต์ลำดับตายตัวชุดเดียวกัน สีพื้นฐาน 16 สีจึงได้
`id` ตรงกันทั้งสองฝั่ง — และเวลาสีต้อง**ข้ามไฟล์** จะส่งเป็น *code* ไม่ใช่ *id*
(`vaultColorId()` ใน `src/db/nexus.js`)

## 3. ข้อตกลงสำคัญที่สุด

```
nexus_file.id  ==  id ของแถว `nexus` แถวเดียวในไฟล์ vault นั้น
```

`id` ที่ renderer ส่งไปมาอยู่แล้ว (`?nexus=<id>`, MRU list, `window:openNexus`)
จึงมีความหมายเดิมทุกประการ, `WHERE nexus_ref = ?` ยังตรงเหมือนเดิมภายใน vault,
และ migration ตอนแยกเป็นแค่ "copy แล้ว prune" ไม่ใช่ "renumber ทั้งฐาน"

`nexus_file` ใช้ `AUTOINCREMENT` เพื่อไม่ให้ id ถูก**ใช้ซ้ำ**หลังลบ — id ที่ถูก
ใช้ซ้ำจะไปชนกับไฟล์ vault เก่าที่ผู้ใช้เอากลับมา register ทีหลัง

## 4. การหา connection — `src/db/conn.js`

| ฟังก์ชัน | ใช้เมื่อ |
|---|---|
| `getAppDB()` | ตาราง app-level เท่านั้น และ **ทุกอย่างที่ต้องทำงานได้โดยไม่มี vault เปิด** (รวมทุกอย่างที่ main.js แตะนอก IPC handler) |
| `getVaultDB(nexusId)` | ระบุ vault ตรงๆ — ใช้เมื่อฟังก์ชันรับ `nexusId` มาอยู่แล้ว |
| `getDB()` | ตัวเดิมที่ ~464 จุดใน `src/db/` เรียกอยู่ — resolve vault จาก context (ดู §5) |

- `openDdx(filePath, {kind, create, register})` คือขั้นตอนเปิดไฟล์ร่วมของทุกไฟล์
  `create` ค่าเริ่มต้นคือ **false** และโยน `VaultFileMissingError` —
  `new Database(path)` จะ**สร้างไฟล์เปล่าเงียบๆ** แล้ว init จะเติมตารางลงไป
  ผู้ใช้ที่ย้ายไฟล์ vault ไปจะเปิดเจอ vault ว่างเปล่าแทนโลกของตัวเอง โดยไม่มี
  error ที่ไหนเลย
- `register` ถูกเรียก**ก่อน** init path — เพราะ `initVaultDB` มี wiki backfill
  ที่เรียก `rebuildWikiIndex()` ซึ่ง resolve connection ของตัวเองผ่าน `getDB()`
  ถ้ายังไม่ publish connection นี้ มันจะเปิด handle ที่ **สอง** ไปที่ไฟล์เดียวกัน
- LRU เปิดพร้อมกันได้ 4 vault; vault ที่มีหน้าต่างถืออยู่ถูก pin ไม่มีวันถูกปิด

## 5. วาง vault ให้ถูกตัว — `src/db/vault-context.js`

สองหน้าต่างเปิดคนละ vault อยู่ใน process เดียว event loop เดียว การใช้ตัวแปร
"active vault" ธรรมดาจึงผิด และผิดแบบ **fail-open** (เขียนผิด vault เงียบๆ):

```
sync:push  ของหน้าต่าง A -> setActive(1) -> await ensureAccessToken()   [ยอม yield]
note:get   ของหน้าต่าง B -> setActive(2) -> return         [active กลายเป็น 2]
                             ...token มาถึง A ทำต่อ -> getDB() -> VAULT 2
```

มี 10 handler ที่ `await` ก่อนแตะฐานข้อมูล (dialog เลือกไฟล์, network) และบางตัว
เรียก `applySnapshot` ซึ่ง **ล้าง nexus ทั้งอัน** จึงใช้ `AsyncLocalStorage`:
`main.js` ห่อทุก handler ใน `h()` ด้วย `runWithVault(nexusId, …)` โดย `nexusId`
มาจาก `windowNexus` (BrowserWindow.id → nexus id) ที่ `createWindow` ลงทะเบียนไว้

`requireNexusId()` **fail closed** — โค้ด app-level ที่ลืมใช้ `getAppDB()` จะโยน
`NoVaultError` แทนที่จะไปอ่าน/เขียน vault ที่บังเอิญเปิดอยู่

**`ddx-file://` เป็นข้อยกเว้น**: มันไม่ใช่ IPC handler ได้รับแค่ `Request`
เปล่าๆ และทุกหน้าต่างแอปใช้ session เดียวกัน จึงไม่มีหน้าต่างให้อนุมาน vault
URL จึงต้องบอกเอง — `ddx-file://<nexusId>-<importFileId>`

## 6. Migration ครั้งเดียว — `src/db/split-migrate.js`

ทำงานจาก `getAppDB()` เมื่อ **ไม่มี `app.ddx` แต่มี `novel-manager.ddx`**
สร้างทุกอย่างใน `.ddx-split-tmp/` แล้วค่อย rename เข้าที่ — **ไฟล์ vault ก่อน,
`app.ddx` ทีหลังสุด** เพราะการมีอยู่ของ `app.ddx` คือ commit marker

ไม่ได้สร้างบน `serializeVault()` เพราะ snapshot นั้นเก็บแค่ข้อมูล module v3 กับ
note และจะ**ทิ้ง**ตระกูล legacy project ทั้งหมดกับทุกแถว `import_file` เงียบๆ
วิธี copy-แล้ว-prune เก็บทุกอย่างโดยโครงสร้าง รวมถึงตารางที่ไม่มีใครนึกถึง

**ลำดับที่ห้ามสลับ** (สองข้อนี้คือจุดที่ทำข้อมูลหายได้จริง):

1. **ลบแถว legacy project ก่อน แล้วค่อยลบแถว `nexus`** — `nexus_ref` ของ 4 ตาราง
   นั้นเป็น `ON DELETE SET NULL` ไม่ใช่ CASCADE ถ้าลบ `nexus` ก่อน ทุกแถวของ
   vault อื่นจะกลายเป็น `nexus_ref = NULL` และ**ข้อมูลว่าเคยอยู่ vault ไหนหายไป
   ตลอดกาล** จากนั้น query ตามหลังจะไม่ match อะไรเลย ผลคือไฟล์ vault ทุกไฟล์
   แบกข้อมูลของ vault อื่นทั้งหมดติดไปด้วย
2. **`PRAGMA foreign_keys` ต้องสั่งนอก transaction** — ในนั้นมันเป็น no-op
   ถ้าปิดอยู่ cascade จะไม่ทำงานเลยสักอัน ได้ไฟล์ที่ไม่มี nexus แต่เต็มไปด้วย
   orphan และดูเผินๆ เหมือนปกติ

ที่เหลือ: adoption pre-pass สำหรับ `nexus_ref IS NULL` (`!= N` ไม่เคย match NULL),
`defer_foreign_keys` + orphan sweep สำหรับ `relation_obob`/`relation_obtl`/
`relation_tltl` ที่ประกาศแบบ NO ACTION (แถวเดียวที่ข้ามโปรเจกต์ทำให้ delete ทั้ง
ก้อน abort), `PRAGMA foreign_key_check` เป็นด่านสุดท้าย, เช็คพื้นที่ว่าง, และ
drop list ของ `app.ddx` ได้มาจากการ**ลบออก**จาก `sqlite_master` ไม่ใช่ลิสต์ตายตัว
— ตารางที่ลืมนึกถึงจะถูกจับได้เอง แทนที่จะถูก copy ไปทุก vault

`sqlite_sequence` ถูกปล่อยไว้เฉยๆ โดยตั้งใจ — สำเนาได้ค่า AUTOINCREMENT
high-water mark ที่ถูกต้องมาแล้ว การที่ id ของแต่ละไฟล์ต่างกันไม่มีผล เพราะไม่มี
query ไหน join ข้ามไฟล์

## 7. ผู้ใช้เลือกที่เก็บได้ (ทุก build รวม dev)

- ฟอร์มสร้าง Nexus โชว์**โฟลเดอร์**ปลายทาง (ไม่ใช่ชื่อไฟล์ — ชื่อไฟล์มี id อยู่
  ข้างใน ซึ่งยังไม่เกิดจนกว่าจะ insert แถว registry)
- **dialog จะไม่เปิดเลยจนกว่าผู้ใช้จะกด "เปลี่ยน"** — เป็นกฎที่ทำให้ driver ยัง
  ใช้งานได้: `showSaveDialog` จริงจะ block driver ค้างตลอดกาล และ
  `web-driver.mjs` stub dialog เป็น `{canceled:true}`
- path ที่ renderer ส่งมาจะถูกยอมรับ**ก็ต่อเมื่อ dialog เป็นคนคืนมา** — กฎเดียว
  กับ `pickedImportDbPaths` / `pickedImportRoots` ที่มีอยู่แล้ว
- ไฟล์ที่หายไป (ย้าย/เปลี่ยนชื่อ/ถอดไดรฟ์) ทำให้แถวนั้นขึ้นสถานะ missing และมี
  ปุ่ม **ระบุตำแหน่ง** — `relinkNexusFile()` ตรวจก่อนรับว่าไฟล์นั้นมีรูปร่างเป็น
  vault จริง (`openVaultProbe()` เปิดแบบอ่านอย่างเดียว **ไม่รัน init path** —
  การ probe ไฟล์ที่ผู้ใช้เลือกต้องไม่เขียนอะไรลงไป โดยเฉพาะการสร้างตาราง)

## 8. จำนวนที่ cache ไว้

`nexus_file.project_count` คือค่าที่หน้า Welcome แสดง refresh เมื่อ:
เปิด vault, ปิดหน้าต่างของ vault, duplicate, และตอน `getNexuses()` สำหรับ vault
ที่**มี connection เปิดอยู่แล้ว** (ฟรี ไม่ต้องเปิดไฟล์)

จงใจ**ไม่** hook `createModule`/`deleteModule` — พวกนั้นเป็น hot path และ
"จำนวน ณ ตอนที่ vault เปิดอยู่ล่าสุด" ถูกต้องทันทีที่หน้าต่างนั้นปิด
และจงใจ**ไม่**เปิดทุก vault ตอนวาดรายการ

## 9. พฤติกรรมที่เปลี่ยนไป (ต้องรู้)

- `hashtag`, `use_color`, `symbol_collection`, `project_folder`, `relation_type`,
  `timeline_date` ไม่มี `nexus_ref` — เดิมเป็น global ทั้งแอป ตอนนี้กลายเป็น
  **per-vault** (แต่ละไฟล์มีสำเนาของตัวเอง) นี่คือสิ่งที่ทำให้ไฟล์ vault
  self-contained แต่แปลว่า tag หรือ folder ที่สร้างใน vault A จะไม่ไปโผล่ใน B
- `import_file` เก็บ **path ไม่ใช่ blob** — vault ที่ยกไปเครื่องอื่นจะมี path
  ที่ชี้ไปไหนไม่ถึง และ `ddx-file://` จะคืน 404 (เป็นข้อจำกัดที่ต้องบอกผู้ใช้
  ไม่ใช่บั๊กของ migration)
- `nexus.name UNIQUE` ไม่มีความหมายข้าม vault แล้ว (แต่ละไฟล์มีแถวเดียว) —
  ความไม่ซ้ำของชื่อบังคับที่ registry แทน
- Google Drive backup อัปโหลดเป็น `dracondex-backup-<vault>-<id>.ddx` ต่อ vault
  และ **ไม่อัปโหลด `app.ddx`** เพราะในนั้นมี refresh token ที่เข้าถึง Drive
  บัญชีนั้นเอง — backup ที่กู้ credential ของตัวเองขึ้นมาบนเครื่องอื่นได้เป็น
  คำสัญญาที่ใหญ่กว่าคำว่า "backup"
