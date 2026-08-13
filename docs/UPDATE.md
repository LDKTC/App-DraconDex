# GitHub Releases Version-Update Notice

> สถานะ: ใช้งานได้ — เพิ่มเข้ามาในเวอร์ชัน 4.0.0 (2026-07-30),
> ย้ายจาก Firebase Firestore มาเป็น GitHub Releases ในเวอร์ชัน 4.7.6 (2026-08-13)
> **ไม่ใช่ auto-updater** — แค่แจ้งเตือนว่ามีเวอร์ชันใหม่ + ปุ่มเปิดหน้าดาวน์โหลด
> ในเบราว์เซอร์ ไม่มีการติดตั้งอัตโนมัติ ไม่มี silent update

เอกสารนี้มี 2 ส่วน: **วิธีใช้งาน** สำหรับผู้ใช้ และ **หลักการทำงาน** สำหรับผู้พัฒนา

---

## ส่วนที่ 1 — วิธีใช้งาน

### 1.1 เมื่อไหร่จะเห็นการแจ้งเตือน

- ต้อง **login แล้ว** — login เข้า Cloud Sync (Supabase) **หรือ** Google Drive
  Backup อย่างใดอย่างหนึ่งก็พอ (แอปนี้ยังไม่มีระบบบัญชีรวมศูนย์ ถือว่า login
  เข้าอันใดอันหนึ่งคือ "login แล้ว")
- ทุกครั้งที่เปิดแอป ระบบเช็ก release ล่าสุดจาก GitHub เงียบๆ — ถ้าเน็ตล่ม หรือ
  ยังไม่ login จะไม่มีอะไรเกิดขึ้น ไม่มี error แสดง
- ถ้ามีเวอร์ชันใหม่กว่าที่ใช้อยู่ **และยังไม่เคยกด "เตือนภายหลัง" สำหรับ
  เวอร์ชันนั้น** จะขึ้นหน้าต่างแจ้งเตือน แสดงเลขเวอร์ชันใหม่ + release notes
- กด **ดาวน์โหลด** — เปิดเบราว์เซอร์ไปหน้า release บน GitHub (ไม่ติดตั้งให้อัตโนมัติ)
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
   │ fetch() ตรงไปที่ GitHub REST API — ไม่มี SDK
   ▼
GET https://api.github.com/repos/LDKTC/App-DraconDex/releases/latest
(ไม่ต้องใช้ credential — repo เป็น public; /releases/latest ข้าม draft
 และ prerelease ให้อยู่แล้ว)
```

### 2.2 ทำไมย้ายจาก Firestore มา GitHub Releases

โค้ดเดิมอ่าน Firestore doc ของโปรเจกต์ `dracondex-app` ซึ่งในซอร์สมีคอมเมนต์
กำกับไว้ว่า `TODO(maintainer): real Firebase project id` — คือ **ยังไม่ได้
จดทะเบียนจริง** ปัญหาคือ Firebase project id เป็น namespace ระดับโลกแบบ
ใครจดก่อนได้ก่อน ถ้า id นั้นไม่ได้เป็นของผู้ดูแลแอปจริง ใครก็ตามที่ไปจดชื่อนี้
จะกลายเป็นคนกำหนดค่า `version` / `notes` / `url` ที่ทุกเครื่องที่ติดตั้งแอปนี้
เชื่อถือ — และ `url` นั้นถูกส่งต่อไปยัง `shell.openExternal()`

GitHub Releases ย้าย trust root มาอยู่ที่ repo ที่โปรเจกต์เป็นเจ้าของอยู่แล้ว
ไม่ต้องดูแล backend เพิ่ม และ release ที่ตัดผ่าน `build-release-git` skill
ก็กลายเป็นแหล่งข้อมูลเดียวกันโดยอัตโนมัติ

`REPO` ยังคงเป็นค่าคงที่ในซอร์ส (ไม่ใช่ app_setting) ด้วยเหตุผลเดิม — ต่างจาก
`sync:url`/`drive:clientId` ที่ operator แต่ละ deployment ต้องตั้งเอง
โปรเจกต์นี้มี repo เดียวที่ทุกเครื่องอ่านค่าเดียวกันหมด **ผู้ที่ fork ต้องแก้
ค่านี้เป็น repo ของตัวเอง** ไม่งั้นจะได้รับแจ้งเตือน release ของ upstream

### 2.3 ไม่เชื่อ response — ตรวจทุก field

`parseGithubRelease()` ถือว่า response เป็นข้อมูลจากภายนอกทั้งหมด:

| field | ที่มา | การตรวจ |
|---|---|---|
| `version` | `tag_name` ตัด `v` นำหน้า | ต้องตรงกับ `/^\d+(\.\d+){0,3}$/` ไม่งั้นคืน `null` (= ไม่มีอัปเดต) |
| `url` | `html_url` | ต้องขึ้นต้นด้วย `https://github.com/LDKTC/App-DraconDex/releases/` ไม่งั้นตกกลับไปใช้ prefix นั้นตรงๆ |
| `notes` | `body` | ตัดที่ 4000 ตัวอักษร |

ที่ต้องตรึง **ทั้ง host และ path prefix** เพราะตรึงแต่ host ไม่พอ —
`https://github.com/evil/repo/releases/...` ก็ยังเป็น github.com

`openUpdateDownload()` ตรวจ prefix เดิมซ้ำอีกรอบก่อน `shell.openExternal()`
เพราะ URL เดินทางผ่าน renderer ไปกลับ — เดิมเช็กแค่ `^https?://` ซึ่งแปลว่า
renderer ที่ถูกยึดสามารถสั่งเปิดเว็บอะไรก็ได้

ฝั่ง renderer (`electron/src/renderer/update.js`) **ไม่เอาค่าจาก network ไปแทรก
ใน inline handler อีกแล้ว** — เดิมเป็น `onclick="updateDownloadClick('${x(r.url)}')"`
ซึ่ง `x()` ไม่ escape `'` จึงหลุดออกจาก JS string literal ได้ ตอนนี้เก็บ release
ไว้ในตัวแปรระดับโมดูล (`_pendingUpdate`) แล้วปุ่มเรียกฟังก์ชันแบบไม่มี argument

### 2.4 การเปรียบเทียบเวอร์ชัน

ตัดส่วนหลัง `-` ทิ้งก่อนเทียบ (suffix `-n` มีไว้เฉพาะระหว่างพัฒนา ไม่ควรมีใน
build ที่ปล่อยจริง) แล้วเทียบทีละ segment ตัวเลขจาก `.` แพดด้วย 0 — ไม่ใช้
package semver เพราะ logic สั้นพอที่จะเขียนเองได้ใน ~10 บรรทัด
(`isNewerVersion` ใน `electron/src/db/update.js`)

### 2.5 ทนต่อความล้มเหลว

`checkForUpdate()` **ไม่ throw เด็ดขาด** — เน็ตล่ม, response ไม่ใช่ 200, JSON
parse ไม่ได้, field ขาด, tag รูปแบบผิด, หรือแม้แต่ error ตอนเช็ก login ก็ตกไปที่
`{ok:true, available:false}` ทั้งหมด ตรงตาม convention เดิมของ
`sync.js`/`drive.js` ("public function ไม่ throw") — ผู้ใช้ที่ไม่มีเน็ตจะไม่เห็น
error toast ทุกครั้งที่เปิดแอป

หมายเหตุ: GitHub API แบบไม่ใส่ token จำกัดที่ 60 request/ชั่วโมง/IP ซึ่งเหลือ
เฟือสำหรับการเช็กครั้งเดียวต่อการเปิดแอป และถ้าโดน rate limit ก็ตกไปที่
"ไม่มีอัปเดต" ตามปกติ request ต้องมี `User-Agent` ไม่งั้น GitHub ปฏิเสธ

### 2.6 โหมด dev — ไม่มี mock server แยก

ต่างจาก `sync-devserver.js`/`drive-devserver.js` (endpoint หลายตัว มี
auth/state ต้องจำลอง) ฟีเจอร์นี้มีแค่ endpoint เดียว อ่านอย่างเดียว ไม่มี
state — จึงไม่คุ้มที่จะสร้างเซิร์ฟเวอร์จำลองแยก โหมด dev (`IS_DEV`) แค่คืนค่า
doc ปลอมในหน่วยความจำ; ตัวแปรแวดล้อม `DDX_DEV_UPDATE_VERSION` บังคับเลข
เวอร์ชัน "ล่าสุด" สำหรับทดสอบ (รูปแบบเดียวกับ `DDX_DEV_DRIVE_QUOTA_PCT` ที่ใช้
กับ Google Drive) — ถ้าไม่ตั้งค่า จะ default เป็นเวอร์ชันของแอปที่รันอยู่เอง
(ผลลัพธ์ "ไม่มีอัปเดต" แบบ deterministic)

### 2.7 การทดสอบ

`electron/test/update-release.test.mjs` ครอบส่วน parse ทั้งหมด — payload จริงจาก
GitHub, tag ที่รูปแบบผิด, `html_url` ที่ชี้ออกนอก repo (รวม
`https://github.com.evil.example/...`), การตัดความยาว notes, และกันไม่ให้
endpoint Firestore เดิมกลับมา

ทดสอบ end-to-end ผ่าน `run-dracondex` driver: บังคับ `DDX_DEV_UPDATE_VERSION=99.0.0`
+ fake-login (`api.sync.googleLogin()`) → `api.update.check()` ต้องได้
`available:true` → เปิด modal → screenshot → กด "เตือนภายหลัง" → เช็กซ้ำต้อง
ได้ `dismissed:true` สำหรับเวอร์ชันเดิม; และยืนยันว่า launch ปกติ (ไม่ตั้ง
env var, ไม่ login) จะไม่มี modal ขึ้นเลย
