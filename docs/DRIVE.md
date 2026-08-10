# Google Drive Backup

> สถานะ: ใช้งานได้ — เพิ่มเข้ามาในเวอร์ชัน 4.0.0 (2026-07-30)
> เก็บ "layout profile" (ธีม/ภาษา/ขนาด UI ฯลฯ) และ/หรือไฟล์ฐานข้อมูล .ddx
> ไว้ในโฟลเดอร์ appdata ของ Google Drive ผู้ใช้ (พื้นที่ซ่อน แอปอื่นมองไม่เห็น)
>
> **ตั้งแต่ v4.5.0 นี่คือฟีเจอร์คลาวด์เดียวของแอป** — Cloud Sync (Supabase Token
> Sync) ถูกปิดไปแล้ว (ดู [SYNC.md](SYNC.md)) ดังนั้น Google login ของ Drive
> จึงเป็น **บัญชี Google เดียวของทั้งแอป** และหน้า **การตั้งค่า → User →
> Account** ก็ผูกกับการเชื่อมต่อนี้ (แสดงอีเมล + ปุ่มเชื่อมต่อ/ยกเลิก) แทน
> การอ่าน login ของ Supabase แบบเดิม

เอกสารนี้มี 2 ส่วน: **วิธีใช้งาน** สำหรับผู้ใช้ และ **หลักการทำงาน** สำหรับผู้พัฒนา

**สำคัญ (บริบทเชิงประวัติ)**: ฟีเจอร์นี้ถูกออกแบบให้ **แยกอิสระ** จากระบบ login
Google ของ Cloud Sync (Supabase Token Sync, ดู [SYNC.md](SYNC.md)) — คนละการ
login, คนละ token, คนละ scope ดูเหตุผลที่ §2.1 (การแยกนั้นเป็นเหตุผลว่าทำไม
การปิด Cloud Sync จึงไม่กระทบฟีเจอร์นี้เลย)

### โหมดตามชนิด build

| Build | Backend ที่ใช้ |
|---|---|
| ติดตั้ง (installer) / portable | Google Drive จริง — ต้องตั้งค่า Google OAuth client (§1.1) |
| dev (`npm start` / driver) | **เซิร์ฟเวอร์ต้นแบบในเครื่อง** (`electron/src/db/drive-devserver.js`) เริ่มเองอัตโนมัติ ไม่ต้องมีบัญชี Google จริง — "เชื่อมต่อ" จะได้บัญชีจำลอง `dev-drive@local.test` ทันที |

---

## ส่วนที่ 1 — วิธีใช้งาน

### 1.1 เตรียม Google OAuth Client (ทำครั้งเดียว — เฉพาะ build ติดตั้ง/portable)

1. สร้างโปรเจกต์ใน [Google Cloud Console](https://console.cloud.google.com) →
   สร้าง OAuth client แบบ **Desktop app** (ไม่ใช่ Web application)
2. เปิดใช้ Google Drive API ในโปรเจกต์นั้น
3. จดค่า **Client ID** และ **Client Secret** ของ client ที่สร้าง
   (Google ถือว่า client secret ของแอป desktop ไม่ใช่ความลับจริง — PKCE
   ต่างหากที่เป็นตัวป้องกันความปลอดภัยจริง ดู §2.1)

### 1.2 ตั้งค่าในแอป

1. เปิด **การตั้งค่า** (Setting window) → Appdata → **สำรองข้อมูล
   (BackupData)** (2026-07-30: ย้ายจาก Preferences panel เดิม)
2. ครั้งแรกจะเจอฟอร์มใส่ Client ID/Secret — กรอกแล้วกด บันทึก
3. กด **เชื่อมต่อ Google Drive** — ระบบเปิดเบราว์เซอร์เริ่มต้นของเครื่องไปหน้า
   ยินยอมสิทธิ์ของ Google (ขอสิทธิ์เฉพาะ `drive.appdata` — แอปนี้มองไม่เห็น
   ไฟล์อื่นในไดรฟ์ของคุณเลย) แล้วรับ session อัตโนมัติเมื่อกดยินยอม

### 1.3 สำรองข้อมูล

- เลือกอย่างน้อย 1 อย่าง: **รวม layout profile** (ธีม/ภาษา/ขนาด UI ปัจจุบัน)
  และ/หรือ **รวมฐานข้อมูล (.ddx)** — ไม่บังคับทั้งคู่ตามที่ระบุไว้ ("หากผู้ใช้
  ต้องการ")
- กด **สำรองข้อมูลตอนนี้** เพื่อสำรองทันที หรือเปิด **สำรองข้อมูลอัตโนมัติทุก
  ชั่วโมง** ให้ทำงานเองขณะแอปเปิดอยู่ (ทำครั้งแรกทันทีที่เปิดแอป แล้วทุก 1
  ชั่วโมงหลังจากนั้น)
- แต่ละอย่างมีที่เก็บเพียง **1 ช่อง** บน Drive (เขียนทับของเดิมทุกครั้ง ไม่มี
  ประวัติหลายเวอร์ชัน) — ดู §1.3b สำหรับ layout **slot** ที่ตั้งชื่อได้หลายอัน
  (คนละกลไกกับ auto-backup นี้)
- หน้า BackupData มีลิสต์ **ประวัติการสำรองข้อมูล** ล่าสุด 20 รายการ
  (เวลา + สำเร็จ/ล้มเหลว + รวม layout/.ddx หรือไม่) ต่อจากแถบสถานะ Drive

### 1.3b Layout slot (2026-07-30) — หลายรูปแบบ ไม่ใช่แค่ 1 ช่อง

ต่างจาก auto-backup ด้านบน (ช่องเดียว เขียนทับทุกครั้ง) หน้า **การตั้งค่า →
User → User profile** ให้บันทึก layout ปัจจุบันเป็น **slot ตั้งชื่อได้ไม่จำกัด
จำนวน** แยกกัน — กด "บันทึก Layout ปัจจุบัน" ตั้งชื่อ แล้วกู้คืน/ลบ slot ไหนก็ได้
ทีหลัง โดยไม่กระทบ slot อื่น หรือกระทบ auto-backup ช่องเดียวด้านบนเลย (เก็บคน
ละไฟล์ appdata กัน — ดู §2.5)

### 1.4 พื้นที่ Drive เต็ม

- แถบแสดงพื้นที่ใช้งานจะเตือน (สีเหลือง) เมื่อใกล้เต็ม (≥90%) และบล็อกการ
  สำรองข้อมูล (สีแดง) เมื่อเต็มจริง (100%) — ต้องลบไฟล์อื่นในไดรฟ์เพื่อเพิ่ม
  พื้นที่ว่างก่อนจึงจะสำรองได้อีกครั้ง
- บัญชีที่ไม่มีเพดานพื้นที่ (เช่น Google Workspace บางแผน) จะไม่แสดงเปอร์เซ็นต์
  และไม่ถูกบล็อก

### 1.5 การกู้คืน — ข้อควรระวัง

- **กู้คืน layout profile**: แทนที่ธีม/ภาษา/ขนาด UI ปัจจุบันทั้งหมด แล้ว
  รีโหลดแอป
- **กู้คืนฐานข้อมูล**: เป็นการ **ผสาน (merge)** ข้อมูลจาก Drive เข้ากับข้อมูล
  ปัจจุบันโดยจับคู่ชื่อที่ตรงกัน **ไม่ใช่การเขียนทับ/ลบข้อมูลเดิม** (ต่างจาก
  Cloud Sync ที่ pull แล้วล้างข้อมูลปลายทางทั้งหมด) — ใช้กลไกเดียวกับเมนู
  "นำเข้าฐานข้อมูล" (Import Database) ที่มีอยู่แล้ว แล้วรีโหลดแอป

### 1.6 ยกเลิกการเชื่อมต่อ

กด **ยกเลิกการเชื่อมต่อ** — ไฟล์สำรองที่มีอยู่บน Drive ยังอยู่เหมือนเดิม
(ลบเฉพาะสิทธิ์การเข้าถึงในเครื่องนี้) เชื่อมต่อใหม่ได้ทุกเมื่อ

---

## ส่วนที่ 2 — หลักการทำงาน (สำหรับผู้พัฒนา)

### 2.1 ทำไมแยก login จาก Cloud Sync

> ตั้งแต่ v4.5.0 Cloud Sync ถูกปิดไปแล้ว การแยกนี้จึงเหลือความสำคัญแค่ในแง่
> "ทำไมโค้ดถึงเป็นแบบนี้" — ผลพลอยได้คือ Drive ไม่ได้พึ่ง Supabase เลยแม้แต่
> จุดเดียว การปิด Cloud Sync จึงไม่ต้องแก้อะไรในไฟล์ `drive.js` ทั้งฝั่ง main
> และ renderer

Supabase Auth (ที่ Cloud Sync ใช้ login Google) **ไม่รีเฟรช provider token ให้
เอง** — เอกสาร Supabase ระบุตรงๆ ว่าแอปต้องเรียก Google เองเพื่อรีเฟรช ดังนั้น
การจะขอ Drive scope ผ่าน Supabase relay ก็ยังต้องคุยกับ Google โดยตรงอยู่ดีตอน
รีเฟรช — ไม่ได้ประหยัดอะไร แต่กลับบังคับให้ผู้ใช้ Cloud Sync ทุกคนต้องยินยอม
สิทธิ์ Drive ที่ไม่ได้ขอ จึงเลือกทำเป็นระบบ login แยกอิสระ คุย
`accounts.google.com`/`oauth2.googleapis.com` ตรงๆ ไม่ผ่าน Supabase เลย

### 2.2 สถาปัตยกรรม

```
Renderer (electron/src/renderer/drive.js — หน้า "BackupData" ใน Setting window
          (electron/src/renderer/core/setting-window.js), electron/src/renderer/core/
          account.js — หน้า "User profile" (layout slot),
          + ตัวจับเวลา auto-backup รายชั่วโมง — อยู่ฝั่ง renderer เพราะ
          layout profile มีอยู่ใน localStorage เท่านั้น main อ่านไม่ได้)
   │ window.api.drive.*  (preload.js)
   ▼
Main process IPC 'drive:*' (electron/main.js) → electron/src/db/drive.js
   │ exportDatabaseTo / importDatabaseMerge  (src/db/import-merge.js, reuse เดิม)
   │ PKCE + loopback http server ชั่วคราว (src/db/oauth-loopback.js,
   │   ใช้ร่วมกับ src/db/sync.js)
   ▼
build ติดตั้ง/portable:                    build dev (`!app.isPackaged`):
Google OAuth + Drive API v3 โดยตรง         เซิร์ฟเวอร์จำลอง in-process
(accounts.google.com,                      (drive-devserver.js, loopback,
 oauth2.googleapis.com,                     เชื่อมต่อจำลองทันที ไม่ผ่าน OAuth จริง)
 www.googleapis.com/drive/v3)
```

### 2.3 โมเดล token

- **Login**: PKCE มาตรฐาน ตรงกับ Google — `driveConnect()` เปิดเบราว์เซอร์ไป
  `accounts.google.com/o/oauth2/v2/auth` (scope `drive.appdata email`,
  `access_type=offline&prompt=consent` — จำเป็นเพื่อให้ได้ refresh token
  กลับมาทุกครั้ง) รอ redirect กลับที่ loopback server ชั่วคราว แล้วแลก code
  เป็น token ที่ `oauth2.googleapis.com/token` โดยตรง (ไม่ผ่าน Supabase)
- **Refresh**: เรียก `oauth2.googleapis.com/token` (`grant_type=refresh_token`)
  โดยตรงเช่นกัน ต้องใช้ client_id/secret ที่ผู้ใช้กรอกไว้ (§1.1) — ต่างจาก
  ฝั่ง Supabase (GoTrue หมุน refresh token ให้ทุกครั้ง) **Google ปกติไม่คืน
  refresh token ใหม่ตอนรีเฟรช** — โค้ดจะเขียนทับค่าเดิมเฉพาะเมื่อ response
  มีค่าใหม่จริงๆ เท่านั้น
- เก็บใน `app_setting`: `drive:clientId`, `drive:clientSecret` (ตั้งค่าโดย
  ผู้ใช้), `drive:refreshToken` (ของ Google จริง — คนละตัวกับ
  `google:refreshToken` ของ Supabase), `drive:email`, `drive:autoBackup`,
  `drive:backupLayout`, `drive:backupDdx`, `drive:backupLog` (JSON, ล่าสุด
  20 รายการ), `drive:lastBackupAt`
- ยกเลิกสิทธิ์จากฝั่ง Google ระหว่างใช้งาน → รีเฟรชครั้งถัดไปได้ `invalid_grant`
  → ล้าง `drive:refreshToken` ในเครื่อง, สถานะกลับเป็น "ยังไม่เชื่อมต่อ" โดย
  ไม่มีการบังคับ re-login กลางคัน; เครือข่ายล่มชั่วคราวไม่ทำให้ถูกตัดการ
  เชื่อมต่อ (เหมือนพฤติกรรมของ electron/src/db/sync.js)

### 2.4 Drive API ที่ใช้ (appDataFolder เท่านั้น)

- `GET drive/v3/about?fields=storageQuota` — เช็กโควตา (`limit` ไม่มี =
  ไม่จำกัด เช่นบัญชี Workspace บางแผน)
- `GET drive/v3/files?spaces=appDataFolder&q=name='...'` — หาไฟล์เดิมด้วยชื่อ
- `POST upload/drive/v3/files?uploadType=multipart` — สร้างไฟล์ใหม่
  (multipart/related ตาม RFC 2387 — ใช้ฟอร์แมตเดียวกันทั้ง dev mock และของจริง
  เพื่อให้ mock ตรวจ wire format จริงที่โค้ด production ส่งออกไป)
- `PATCH upload/drive/v3/files/{id}?uploadType=media` — เขียนทับไฟล์เดิม
- `GET drive/v3/files/{id}?alt=media` — ดาวน์โหลด
- ไฟล์คงที่ 2 ชื่อ ไม่มีเวอร์ชันย้อนหลัง: `dracondex-layout-profile.json`,
  `dracondex-backup.ddx`
- เพดานเตือน: `usage/limit >= 0.9` = near_full (เตือน), `>= 1` = full
  (บล็อกการสำรองข้อมูลตั้งแต่ต้น ก่อนเรียก API อัปโหลดใดๆ)

### 2.5 Layout profile และ .ddx — reuse ของเดิม ไม่สร้างกลไกใหม่

"Layout profile" คือ blob เดิมที่มีอยู่แล้วใน renderer
`localStorage['novel-manager-ui-settings']` (theme/language/size/fontScale/
customThemes/... — ดู `electron/src/renderer/core/state.js`) serialize ทั้งก้อนแบบ
ไม่มีการแก้ schema ใหม่ — auto-backup เก็บ blob เดี่ยวนี้ที่ไฟล์ appdata ชื่อ
`dracondex-layout-profile.json` (`LAYOUT_FILE`) เขียนทับทุกครั้ง main
process อ่าน localStorage ไม่ได้เอง จึง renderer เป็นฝ่ายส่ง blob นี้ไปกับ
IPC ทุกครั้งที่ backup

.ddx ใช้ `exportDatabaseTo`/`importDatabaseMerge`/`getDatabasePath` จาก
`electron/src/db/import-merge.js` โดยตรง — ฟังก์ชันเดียวกับเมนู "ส่งออก/นำเข้า
ฐานข้อมูล" ที่มีอยู่แล้ว ไม่เขียนกลไกใหม่

**Layout slot (2026-07-30)** — `driveListLayoutSlots`/`driveSaveLayoutSlot`/
`driveRestoreLayoutSlot`/`driveDeleteLayoutSlot` (`electron/src/db/drive.js`) เก็บ
หลาย slot ตั้งชื่อได้ใน appdata ไฟล์**คนละไฟล์**จาก auto-backup ด้านบน —
`dracondex-layout-slots.json` (`LAYOUT_SLOTS_FILE`) เก็บเป็น
`{slots: [{id, name, updatedAt, json}]}` อ่าน-แก้-เขียนทับทั้งไฟล์ทุกครั้ง
(ไม่มี Drive `files.list` แยกต่อ slot — "เก็บได้หลายรูปแบบ" ไม่ได้แปลว่าต้อง
เป็นไฟล์ Drive แยกกันจริงๆ) เจตนาแยกไฟล์จาก `LAYOUT_FILE` ตรงๆ: auto-backup
รายชั่วโมงเขียนทับ `LAYOUT_FILE` เสมอ ถ้าใช้ไฟล์เดียวกันจะทำให้รายการ slot ที่
ตั้งชื่อไว้หายไปทุกชั่วโมง

### 2.6 Auto-backup timer

อยู่ฝั่ง renderer (`initDriveAutoBackup()`, เรียกจาก `boot.js`'s `init()`,
ข้ามถ้าเป็น popup window) ไม่ใช่ main process — เพราะ layout profile มีอยู่
เฉพาะใน renderer, และแอปนี้ไม่มี lifecycle แบบ background/headless อยู่แล้ว
`setInterval` ทุก 1 ชั่วโมงตามที่ Plan.md ระบุ; เปิด/ปิด toggle จะ arm/clear
interval ทันทีฝั่ง renderer, ฝั่ง main เป็นแค่ตัวรับคำสั่ง (reactive) ไม่มี
timer ของตัวเอง

### 2.7 การทดสอบ

ทดสอบผ่าน `run-dracondex` driver กับ mock ใน `drive-devserver.js`: เชื่อมต่อ
(บัญชีจำลอง) → เช็กโควตา (บังคับ near_full/full ผ่าน env var
`DDX_DEV_DRIVE_QUOTA_PCT`) → สำรอง layout profile + .ddx → กู้คืน layout
profile (ตรวจว่าค่าตรงกัน) → กู้คืนฐานข้อมูลจริง (export→upload→download→
importDatabaseMerge ครบวงจร ตรวจด้วย `nexus.getAll()` ก่อน/หลัง) — การ
multipart-encode/-parse ไบต์ .ddx จริง (ไม่ใช่แค่ข้อความ) ผ่านการทดสอบนี้ด้วย
