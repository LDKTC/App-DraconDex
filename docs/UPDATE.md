# Firebase Version-Update Notice

> สถานะ: ใช้งานได้ — เพิ่มเข้ามาในเวอร์ชัน 4.0.0 (2026-07-30)
> **ไม่ใช่ auto-updater** — แค่แจ้งเตือนว่ามีเวอร์ชันใหม่ + ปุ่มเปิดหน้าดาวน์โหลด
> ในเบราว์เซอร์ ไม่มีการติดตั้งอัตโนมัติ ไม่มี silent update

เอกสารนี้มี 2 ส่วน: **วิธีใช้งาน** สำหรับผู้ใช้ และ **หลักการทำงาน** สำหรับผู้พัฒนา

---

## ส่วนที่ 1 — วิธีใช้งาน

### 1.1 เมื่อไหร่จะเห็นการแจ้งเตือน

- ต้อง **login แล้ว** — login เข้า Cloud Sync (Supabase) **หรือ** Google Drive
  Backup อย่างใดอย่างหนึ่งก็พอ (แอปนี้ยังไม่มีระบบบัญชีรวมศูนย์ ถือว่า login
  เข้าอันใดอันหนึ่งคือ "login แล้ว")
- ทุกครั้งที่เปิดแอป ระบบเช็กเวอร์ชันล่าสุดจาก Firebase เงียบๆ — ถ้าเน็ตล่ม หรือ
  ยังไม่ login จะไม่มีอะไรเกิดขึ้น ไม่มี error แสดง
- ถ้ามีเวอร์ชันใหม่กว่าที่ใช้อยู่ **และยังไม่เคยกด "เตือนภายหลัง" สำหรับ
  เวอร์ชันนั้น** จะขึ้นหน้าต่างแจ้งเตือน แสดงเลขเวอร์ชันใหม่ + release notes
- กด **ดาวน์โหลด** — เปิดเบราว์เซอร์ไปหน้าดาวน์โหลด (ไม่ติดตั้งให้อัตโนมัติ)
- กด **เตือนภายหลัง** — ปิดหน้าต่าง จะไม่เตือนซ้ำสำหรับเวอร์ชันนั้นอีก (แต่ถ้ามี
  เวอร์ชันใหม่กว่านั้นออกมาอีก จะเตือนใหม่)

---

## ส่วนที่ 2 — หลักการทำงาน (สำหรับผู้พัฒนา)

### 2.1 สถาปัตยกรรม

```
Renderer (electron/src/renderer/update.js — initVersionCheck() เรียกจาก boot.js
          ครั้งเดียวตอนเปิดแอป, แบบ fire-and-forget)
   │ window.api.update.*  (preload.js)
   ▼
Main process IPC 'update:*' (electron/main.js) → electron/src/db/update.js
   │ syncAuthStatus() (sync.js) + driveStatus() (drive.js) — เช็ก login
   │ fetch() ตรงไปที่ Firestore REST API — ไม่มี firebase SDK
   ▼
Firestore (โปรเจกต์เดียว ของผู้ดูแลแอปเอง):
GET /v1/projects/{id}/databases/(default)/documents/public_config/latest_version
(ไม่ต้องใช้ credential ใดๆ — เอกสารนี้ตั้งเป็น public read เท่านั้น)
```

### 2.2 ทำไม Project ID เป็นค่าคงที่ ไม่ใช่ app_setting

ต่างจาก Supabase (`sync:url`/`sync:anonKey`) และ Google Drive
(`drive:clientId`/`drive:clientSecret`) ที่เป็นค่าที่ operator ของแต่ละ
deployment ต้องตั้งเอง (เพราะแต่ละที่อาจต่อ backend คนละอันกัน) — โปรเจกต์
Firebase นี้มีเพียง**อันเดียว**ที่ทุกเครื่องที่ติดตั้งแอปนี้อ่านค่าเดียวกันหมด
ไม่มีอะไรให้ operator ตั้งค่าเอง จึงเก็บเป็น `const FIRESTORE_PROJECT_ID` ใน
`electron/src/db/update.js` แทนที่จะเป็น setting ที่แก้ได้ตอน runtime

### 2.3 เอกสาร Firestore + Security Rule (ตั้งค่าครั้งเดียวโดยผู้ดูแลแอป)

Path: `public_config/latest_version`, fields: `version` (string), `notes`
(string, release notes ภาษาเดียว ไม่รองรับหลายภาษา — YAGNI), `url` (string,
ลิงก์ดาวน์โหลด)

Firestore Security Rule ที่ path นี้:
```
allow read: if true;
allow write: if false;
```
ทำให้ REST GET ไม่ต้องใช้ API key/credential ใดๆ เลย — แต่ **ต้องแก้ค่าผ่าน
Firebase Console เท่านั้น** (ไม่มี write path ที่แอปหรือใครเข้าถึงได้)

Response shape ของ Firestore REST เป็นแบบ wrapped:
`{fields: {version: {stringValue: "..."}}, ...}` — parse ผ่าน
`json.fields.<name>.stringValue`

### 2.4 การเปรียบเทียบเวอร์ชัน

ตัดส่วนหลัง `-` ทิ้งก่อนเทียบ (suffix `-n` มีไว้เฉพาะระหว่างพัฒนา ไม่ควรมีใน
build ที่ปล่อยจริง) แล้วเทียบทีละ segment ตัวเลขจาก `.` แพดด้วย 0 — ไม่ใช้
package semver เพราะ logic สั้นพอที่จะเขียนเองได้ใน ~10 บรรทัด
(`isNewerVersion` ใน `electron/src/db/update.js`)

### 2.5 ทนต่อความล้มเหลว

`checkForUpdate()` **ไม่ throw เด็ดขาด** — เน็ตล่ม, response ไม่ใช่ 200, JSON
parse ไม่ได้, field ขาด, หรือแม้แต่ error ตอนเช็ก login ก็ตกไปที่
`{ok:true, available:false}` ทั้งหมด ตรงตาม convention เดิมของ
`sync.js`/`drive.js` ("public function ไม่ throw") — ผู้ใช้ที่ไม่มีเน็ตหรือ
ยังไม่ตั้งโปรเจกต์ Firebase จะไม่เห็น error toast ทุกครั้งที่เปิดแอป

### 2.6 โหมด dev — ไม่มี mock server แยก

ต่างจาก `sync-devserver.js`/`drive-devserver.js` (endpoint หลายตัว มี
auth/state ต้องจำลอง) ฟีเจอร์นี้มีแค่ endpoint เดียว อ่านอย่างเดียว ไม่มี
state — จึงไม่คุ้มที่จะสร้างเซิร์ฟเวอร์จำลองแยก โหมด dev (`IS_DEV`) แค่คืนค่า
doc ปลอมในหน่วยความจำ; ตัวแปรแวดล้อม `DDX_DEV_UPDATE_VERSION` บังคับเลข
เวอร์ชัน "ล่าสุด" สำหรับทดสอบ (รูปแบบเดียวกับ `DDX_DEV_DRIVE_QUOTA_PCT` ที่ใช้
กับ Google Drive) — ถ้าไม่ตั้งค่า จะ default เป็นเวอร์ชันของแอปที่รันอยู่เอง
(ผลลัพธ์ "ไม่มีอัปเดต" แบบ deterministic)

### 2.7 การทดสอบ

ทดสอบผ่าน `run-dracondex` driver: บังคับ `DDX_DEV_UPDATE_VERSION=99.0.0` +
fake-login (`api.sync.googleLogin()`) → `api.update.check()` ต้องได้
`available:true` → เปิด modal → screenshot → กด "เตือนภายหลัง" → เช็กซ้ำต้อง
ได้ `dismissed:true` สำหรับเวอร์ชันเดิม; และยืนยันว่า launch ปกติ (ไม่ตั้ง
env var, ไม่ login) จะไม่มี modal ขึ้นเลย
