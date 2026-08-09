# Cloud Sync (Supabase) — Token Sync

> ## ⛔ สถานะ: **ปิดใช้งานตั้งแต่ v4.5.0 (2026-08-09) — ไม่มีทางเข้าใน UI**
>
> repo เปิดเป็น open source แล้ว การบังคับให้ผู้ใช้/ผู้ fork ทุกคนต้องไปตั้ง
> Supabase project ของตัวเองก่อน (รัน migration 2 ไฟล์ + ตั้ง Google provider +
> กรอก Project URL/anon key) เป็นกำแพงที่ไม่คุ้ม ในเมื่อ **Google Drive Backup**
> ([DRIVE.md](DRIVE.md)) ครอบคลุมงานสำรอง/กู้คืนข้อมูลได้อยู่แล้ว โดยคุยกับ
> Google ตรง ๆ ไม่ต้องพึ่งเซิร์ฟเวอร์ของใครเลย — ฟีเจอร์คลาวด์ของแอปนี้จึง
> **เหลือทางเดียวคือ Google Drive** ไปก่อน
>
> **ไม่มีการลบโค้ดใด ๆ** — `src/renderer/sync.js`, `src/db/sync.js`,
> `src/db/sync-devserver.js`, IPC `sync:*` ใน `main.js`, `api.sync` ใน
> `preload.js` และ migration ทั้ง 2 ไฟล์ยังอยู่ครบและยังลงทะเบียนตามเดิม
> สิ่งที่ตัดไปคือ **ทางเข้า UI 2 จุด** เท่านั้น:
>
> - ปุ่ม ☁ ที่มุมล่างของแผงซ้าย (`src/renderer/core/views.js`)
> - หน้า **การตั้งค่า → App-data → Token Sync** (`SETTING_GROUPS.appdata`
>   ใน `src/renderer/core/setting-window.js` — ตัวหน้ายัง
>   `registerSettingPage()` ไว้เหมือนเดิม แค่ไม่ถูกลิสต์ใน nav)
>
> ทั้งสองจุดคุมด้วยค่าเดียวคือ **`CLOUD_SYNC_ENABLED`** ใน
> `src/renderer/core/state.js` — **เปิดฟีเจอร์กลับ = เปลี่ยนค่านั้นเป็น `true`**
> แล้วทำตาม §1.1–1.2 ตามปกติ เนื้อหาที่เหลือของเอกสารนี้ยังถูกต้องทั้งหมด
>
> ⚠️ **`src/db/sync.js` ยังทำงานอยู่จริงแม้ปิดฟีเจอร์นี้** — snapshot engine
> ในไฟล์นั้น (`serializeVault` / `applySnapshot` / `importModuleSnapshot` /
> `collectModuleSubtreeIds`) คือกลไกเบื้องหลังของ **การตั้งค่า → App-data →
> ฐานข้อมูล** (ส่งออก/นำเข้าไฟล์ Nexus และ module, `src/db/db-transfer.js`)
> ซึ่งเป็นระบบออฟไลน์ล้วน ไม่เกี่ยวกับ Supabase — อย่าลบไฟล์นี้ทิ้งเวลาเก็บกวาด
>
> สถานะเดิมก่อนถูกปิด: **token sync** — แทนที่ระบบคีย์ถาวรเดิม (access-key
> prototype, v3.8.0) ด้วยระบบโทเคน 16 หลักที่สร้างใหม่ทุกครั้งที่ push, ต้อง
> login Google, และมี quota ตาม tier บัญชี — เพิ่มเข้ามาในเวอร์ชัน 4.0.0
> (2026-07-30)

เอกสารนี้มี 2 ส่วน: **วิธีใช้งาน** สำหรับผู้ใช้ และ **หลักการทำงาน** สำหรับผู้พัฒนา
(ทั้งสองส่วนอธิบายพฤติกรรมเมื่อ `CLOUD_SYNC_ENABLED = true`)

### โหมดตามชนิด build

| Build | Backend ที่ใช้ |
|---|---|
| ติดตั้ง (installer) / portable | Supabase จริง — ตั้งค่า URL + anon key เอง (§1.1–1.2), login ด้วย Google จริงผ่านเบราว์เซอร์ระบบ |
| dev (`npm start` / driver) | **เซิร์ฟเวอร์ต้นแบบในเครื่อง** (`src/db/sync-devserver.js`) เริ่มเองอัตโนมัติ ไม่ต้องตั้งค่าใด ๆ — login เป็นบัญชีจำลอง (ไม่ต้องมีบัญชี Google จริง) หน้าต่างซิงก์ข้ามหน้าตั้งค่าเซิร์ฟเวอร์และแสดงป้าย "เวอร์ชัน dev" |

ในโหมด dev ขั้นตอน §1.1–1.2 ไม่จำเป็น — กด ☁ แล้ว login (จำลอง) แล้ว Push
ได้เลย ข้อมูล "คลาวด์" เก็บเป็นไฟล์ `dev-sync-server.json` ในโฟลเดอร์ข้อมูล
dev (ลบไฟล์ = ล้างคลาวด์จำลอง)

---

## ส่วนที่ 1 — วิธีใช้งาน

### 1.1 เตรียมเซิร์ฟเวอร์ (ทำครั้งเดียว — เฉพาะ build ติดตั้ง/portable)

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com) (แผนฟรีใช้ได้)
2. เปิด SQL Editor ในแดชบอร์ด แล้วรันไฟล์
   `supabase/migrations/20260717000000_dracondex_sync_prototype.sql` ตามด้วย
   `supabase/migrations/20260730000000_dracondex_token_sync.sql` ตามลำดับ
   (หรือใช้ Supabase CLI: `supabase db push`)
3. เปิดใช้ Google เป็น OAuth provider: Authentication → Providers → Google
   ในแดชบอร์ด ใส่ Client ID/Secret ของ Google Cloud OAuth client ที่ตั้งค่า
   redirect URI เป็น `https://<project-ref>.supabase.co/auth/v1/callback`
   และเพิ่ม `http://127.0.0.1:*` ในรายการ Redirect URL ที่อนุญาต (ไว้รับ
   loopback ตอน login จากแอปเดสก์ท็อป)
4. จดค่า 2 ตัวจากหน้า Project Settings → API:
   - **Project URL** เช่น `https://abcdefgh.supabase.co`
   - **Publishable (anon) key**

> คีย์ anon เป็นคีย์สาธารณะโดยธรรมชาติของ Supabase — ความปลอดภัยของข้อมูล
> อยู่ที่การ login Google (auth.uid()) และโทเคนต่อการอัปโหลด ไม่ใช่ที่คีย์ anon

### 1.2 ตั้งค่าในแอป

1. เปิด vault (Nexus) ที่ต้องการ → กดปุ่ม **☁** ที่มุมล่างของแผงซ้าย
2. ครั้งแรกจะเจอหน้า **ตั้งค่าเซิร์ฟเวอร์** — กรอก Project URL และคีย์ anon แล้วบันทึก
3. การตั้งค่านี้เก็บระดับแอป (ทุก Nexus ใช้เซิร์ฟเวอร์เดียวกัน) แก้ได้ทีหลังจากปุ่ม
   "ตั้งค่าเซิร์ฟเวอร์" ในหน้าต่างซิงก์
4. กด **เข้าสู่ระบบด้วย Google** — ระบบเปิดเบราว์เซอร์เริ่มต้นของเครื่องไปหน้า
   login ของ Google ผ่าน Supabase Auth เมื่อ login สำเร็จเบราว์เซอร์จะ redirect
   กลับมาที่เซิร์ฟเวอร์ loopback ชั่วคราวบนเครื่อง แอปจะรับ session อัตโนมัติ

### 1.3 อัปโหลด Nexus (Push)

1. หลัง login แล้ว กด **อัปโหลด** ในหน้าต่างซิงก์ (ใส่รหัสผ่านป้องกันได้ ไม่บังคับ)
2. ระบบจะสร้าง **โทเคน 16 หลัก** รูปแบบ `1234-5678-9012-3456` **ใหม่ทุกครั้ง**
   ที่กด อัปโหลด และแสดง **เพียงครั้งเดียว** — กดคัดลอกและเก็บไว้ให้ดี
   (เซิร์ฟเวอร์เก็บเฉพาะแฮชของโทเคน กู้คืนค่าเดิมไม่ได้)
3. บัญชีของคุณมี **ช่องอัปโหลดจำกัดตาม tier**:

   | Tier | ช่องอัปโหลด | ขนาดสูงสุดต่อช่อง | อายุ |
   |---|---|---|---|
   | Free (ค่าเริ่มต้น) | 1 ช่อง | 10 MB | 72 ชม. หลัง push ล่าสุด |
   | Pro | 3 ช่อง | 20 MB | 72 ชม. หลัง push ล่าสุด |

   (Tier เป็นค่าที่ตั้งฝั่งเซิร์ฟเวอร์ — ยังไม่มีระบบชำระเงินในแอปนี้)
4. อัปโหลด Nexus เดิมซ้ำ = เขียนทับช่องเดิม (โทเคนใหม่ทุกครั้ง); อัปโหลด
   Nexus อื่นที่ยังไม่เคย push = ขอช่องใหม่ (ถ้าช่องเต็มจะได้ error
   `ช่องอัปโหลดเต็มแล้ว` — ต้องลบช่องใดช่องหนึ่งก่อน)

### 1.4 จัดการอัปโหลดของตัวเอง

หน้าต่างซิงก์แสดงรายการช่องอัปโหลดทั้งหมดของบัญชี (ชื่อ Nexus ตอน push,
ขนาด, วันหมดอายุ, มีรหัสผ่านหรือไม่) — ต่อรายการมีปุ่ม:

- **ดึงลงเครื่องนี้** — ดึงข้อมูลช่องนั้นมาทับ Nexus ที่เปิดอยู่ ไม่ต้องใช้
  โทเคน (login บัญชีเดียวกันพอ)
- **ลบ** — ลบช่องนั้นออกจากคลาวด์ถาวร (ไม่สามารถย้อนกลับได้)

### 1.5 รับข้อมูลจากอีกเครื่อง/อีกบัญชี (กรอกโทเคน)

1. ฝั่งที่จะรับ: สร้าง/เปิด Nexus เปล่า (หรือ Nexus ที่ยอมให้ถูกเขียนทับ) → กด ☁
2. กรอกโทเคน 16 หลักที่ได้รับมาในช่อง **กรอกโทเคน** → กด **ดึงข้อมูล**
3. ถ้าคุณ login คนละบัญชี Google กับผู้ที่อัปโหลด **และ** ผู้ที่อัปโหลด
   ตั้งรหัสผ่านไว้ ระบบจะขอรหัสผ่านเพิ่ม — กรอกให้ถูกแล้วกดอีกครั้ง
4. ใส่รหัสผ่านผิดสะสม 8 ครั้ง ช่องนั้นจะถูกล็อกชั่วคราว 15 นาที

### 1.6 การดึงข้อมูล (Pull) — ข้อควรระวัง

- Pull **เขียนทับเนื้อหา Nexus ในเครื่องทั้งหมด** ด้วยสำเนาบนคลาวด์
  (มีกล่องยืนยันก่อนเสมอ) — ประวัติเวอร์ชัน (Version History) ของโมดูลใน Nexus
  นั้นถูกล้างไปด้วย
- ชื่อ Nexus ในเครื่อง **ไม่ถูกเปลี่ยน** (ชื่อซ้ำกันข้าม Nexus ไม่ได้) —
  ชื่อบนคลาวด์แสดงเป็นข้อมูลประกอบในหน้าต่างซิงก์

### 1.7 ความหมายของข้อความผิดพลาด

| ข้อความ | สาเหตุ |
|---|---|
| กรุณาตั้งค่าเซิร์ฟเวอร์ก่อน | ยังไม่ได้กรอก URL/คีย์ anon |
| กรุณาเข้าสู่ระบบด้วย Google ก่อน | ยังไม่ได้ login |
| โทเคนไม่ถูกต้องหรือหมดอายุ | พิมพ์ผิด / เกิน 72 ชม. / ถูกอัปโหลดทับไปแล้ว |
| รหัสผ่านไม่ถูกต้อง | รหัสผ่านผิด (ต้องใช้เมื่อ login คนละบัญชีกับผู้อัปโหลด) |
| ลองผิดหลายครั้งเกินไป | ใส่รหัสผ่านผิดครบ 8 ครั้ง ช่องถูกล็อก 15 นาที |
| อัปโหลดไม่พบ | ช่องนั้นถูกลบ/หมดอายุไปแล้ว |
| Nexus ใหญ่เกินขีดจำกัดของบัญชีนี้ | เกินขนาดตาม tier (10 MB free / 20 MB pro) |
| ช่องอัปโหลดเต็มแล้ว | ใช้ครบโควตา tier แล้ว — ลบช่องใดช่องหนึ่งก่อน |
| เครือข่ายผิดพลาด | ต่ออินเทอร์เน็ต/URL ไม่ได้ |

---

## ส่วนที่ 2 — หลักการทำงาน (สำหรับผู้พัฒนา)

### 2.1 สถาปัตยกรรม

```
Renderer (src/renderer/sync.js — login/รายการช่องอัปโหลด/push/pull-by-token)
   │ window.api.sync.*  (preload.js)
   ▼
Main process IPC 'sync:*' (main.js) → src/db/sync.js
   │ serializeVault / applySnapshot  (SQLite ผ่าน src/db/core.js)
   │ fetch (Node/Electron built-in, main process เท่านั้น — renderer ไม่แตะเครือข่าย)
   │ Google login: PKCE + loopback http server (127.0.0.1 ชั่วคราว) → shell.openExternal
   ▼
build ติดตั้ง/portable:                       build dev (`!app.isPackaged`):
Supabase Auth (GoTrue) + PostgREST            เซิร์ฟเวอร์ต้นแบบ in-process
POST /auth/v1/... , /rest/v1/rpc/<fn>         (sync-devserver.js, loopback,
(apikey + Bearer access-token หรือ anon key)  endpoint/พฤติกรรมเหมือนกันทุกอย่าง,
   ▼                                          login เป็นบัญชีจำลอง <uid>:<tier>)
Postgres: sync_vault/sync_account + RPC 5 ตัว JSON ไฟล์ dev-sync-server.json
```

การสลับ backend อยู่ที่ `IS_DEV = !app.isPackaged` ใน src/db/sync.js —
โหมด dev บังคับ config เป็น URL ของเซิร์ฟเวอร์ในเครื่อง (เริ่ม lazy ตอนเรียก
ซิงก์ครั้งแรก, port สุ่ม, ไม่ persist URL), ข้าม OAuth จริงทั้งหมด, และไม่อ่าน/
ไม่ต้องมี `sync:url`/`sync:anonKey` ใน `app_setting`

ฝั่งเซิร์ฟเวอร์อยู่ใน 2 ไฟล์ migration เรียงตามลำดับ:
`supabase/migrations/20260717000000_dracondex_sync_prototype.sql` (ตารางเดิม)
แล้วตามด้วย `supabase/migrations/20260730000000_dracondex_token_sync.sql`
(drop ตาราง/ฟังก์ชันคีย์ถาวรเดิมทั้งหมด, เพิ่ม owner/token/tier)

- `sync_vault(id, owner_id, name, snapshot jsonb, snapshot_at, token_hash,
  password_hash, expires_at, pull_fail_count, pull_locked_until)` — 1 แถว =
  1 ช่องอัปโหลด (ไม่ unique ต่อ owner_id อีกต่อไป — 1 บัญชีมีได้หลายแถวตาม
  quota ของ tier ตนเอง; token_hash unique ทั้งตาราง)
- `sync_account(owner_id, tier)` — `free` (ค่าเริ่มต้น) หรือ `pro`; ยังไม่มี
  ระบบชำระเงินเชื่อมต่อ — ปรับ tier ด้วยมือในฐานข้อมูลก่อนมี billing จริง
- RLS เปิดทั้งสองตารางแบบ **ไม่มี policy** + revoke สิทธิ์ anon/authenticated —
  ทางเข้าเดียวคือ RPC ทั้ง 5: `token_sync_push`, `token_sync_status`,
  `token_sync_delete`, `token_sync_pull_own`, `token_sync_pull_by_token`
- ข้อผิดพลาดส่งกลับเป็น `raise exception '<code>'` → HTTP 400
  `{"message":"not_authenticated" | "bad_token" | "bad_password" | "locked" |
  "token_collision" | "no_upload" | "too_large" | "quota_exceeded" |
  "not_owner"}` ให้ไคลเอนต์ map เป็น toast

### 2.2 Snapshot model (ไม่เปลี่ยนจากต้นแบบเดิม)

`serializeVault(nexusId)` (src/db/sync.js) อ่านทั้ง closure ของ Nexus เป็น JSON
ก้อนเดียว (`format: dracondex-vault-snapshot`, `version: 1`) — รวม/ไม่รวมอะไร
และ `applySnapshot(nexusId, payload)` ตอน pull ทำงานอย่างไร **เหมือนเดิมทุก
ประการ** กับต้นแบบเดิม (ดูรายละเอียดในซอร์ส — ฟังก์ชันทั้งสองไม่ถูกแก้ในรอบนี้)
สิ่งที่เปลี่ยนคือชั้นบัญชี/โทเคน/quota ที่ห่ออยู่รอบนอกเท่านั้น

### 2.3 โมเดล login และโทเคน

- **Login**: PKCE flow มาตรฐานผ่าน Supabase Auth (GoTrue) —
  `syncGoogleLogin()` สร้าง code_verifier/code_challenge, เปิดเบราว์เซอร์
  ระบบไปที่ `/auth/v1/authorize?provider=google&redirect_to=http://127.0.0.1:<port>/callback`,
  รอ redirect กลับที่ loopback server ชั่วคราว, แลก code เป็น
  access/refresh token ที่ `/auth/v1/token?grant_type=pkce` — refresh token
  เก็บใน `app_setting['google:refreshToken']`, access token อยู่ในหน่วยความจำ
  เท่านั้นและ refresh อัตโนมัติเมื่อใกล้หมดอายุ (เครือข่ายล่มชั่วคราวจะไม่ทำให้
  ถูก logout — เฉพาะ 400/401 จาก grant ที่ตายแล้วเท่านั้นที่ล้าง refresh token)
- **โทเคน** = ตัวเลข 16 หลัก (`generateToken()`, `crypto.randomInt` — ไม่ใช่
  `Math.random()`) สร้างใหม่ทุกครั้งที่ push, ส่ง plaintext ผ่าน TLS ครั้งเดียว
  ตอนสร้าง — เซิร์ฟเวอร์เก็บ sha-256 เท่านั้น (เอนโทรปี ~53 บิต — ต่ำกว่าคีย์
  ต้นแบบเดิม ~95 บิต แต่ Plan.md ระบุรูปแบบ 16 หลักไว้ตรง ๆ; ยังคำนวณแล้วว่า
  brute-force ทั้ง 10^16 ไม่คุ้มค่าในทางปฏิบัติ)
- **รหัสผ่าน** (ไม่บังคับ ต่อช่องอัปโหลด) แฮชด้วย `pgcrypto`
  (`crypt()`/`gen_salt('bf')`) ไม่เก็บ/เทียบ plaintext เลย — เจ้าของบัญชี
  (auth.uid() ตรงกับ owner_id) ข้ามการตรวจรหัสผ่านเสมอ ไม่ว่าตั้งไว้หรือไม่
- ฝั่งเครื่อง: การตั้งค่าอยู่ใน `app_setting` — `sync:url`, `sync:anonKey`,
  `google:refreshToken`, และ map ท้องถิ่น `sync:slotMap` (JSON
  `{nexusId: vaultId}`) ที่จำแบบ best-effort ว่า Nexus ไหน push ไปช่องไหนล่าสุด
  (ไม่ใช่ความจริงสูงสุด — รายการช่องจากเซิร์ฟเวอร์เท่านั้นที่เชื่อถือได้)

### 2.4 ข้อจำกัดที่ตั้งใจ (ยังไม่แก้ในรอบนี้)

- snapshot ทั้งก้อน last-write-wins — ไม่มี merge/conflict UI; pull ล้าง
  version history ของ Nexus ปลายทาง
- id ที่ฝังในค่าอื่น (filterDef ของ Viewer/Connector, id ในข้อความอิสระ)
  ไม่ถูก remap — ค้างเป็นค่าเก่าหลัง pull
- legacy project (Director/Navigator/Hero/Writer) และไฟล์ Import Dock ไม่ซิงก์
- หมดอายุ (72 ชม.) ตรวจแบบ check-on-read เท่านั้น ไม่มี `pg_cron` —
  แถวที่ถูกทิ้งร้าง (เจ้าของไม่กลับมาใช้อีกเลย) จะค้างอยู่จนกว่าจะมีคนอ่านแถว
  นั้นอีกครั้ง (ผลกระทบจำกัดแค่ 1 แถวต่อบัญชีที่ทิ้งร้าง)
- tier (`free`/`pro`) เป็น flag ในตาราง `sync_account` เท่านั้น — ยังไม่มี
  ระบบชำระเงิน/subscription เชื่อมต่อในแอปนี้
- ไม่มี rate-limit ต่อ IP สำหรับการเดาโทเคน (พึ่งเอนโทรปีของโทเคน +
  การจำกัดอัตราระดับแพลตฟอร์มของ Supabase เอง)
- snapshot เก็บบน Postgres แบบไม่เข้ารหัส

### 2.5 การทดสอบ

ทดสอบ end-to-end ด้วย web-driver (renderer + preload + db จริง) กับ mock ของ
RPC ทั้ง 5 ใน `sync-devserver.js` (พฤติกรรม/error body เหมือน migration ใหม่):
login บัญชีจำลอง → push (ได้โทเคน) → status (เห็นช่องตัวเอง) → delete;
push พร้อมรหัสผ่าน → login บัญชีจำลองที่สอง → pull ด้วยโทเคน → ถูกขอรหัสผ่าน →
ใส่รหัสผ่านผิดครบ 8 ครั้ง → ช่องถูกล็อก 15 นาที → ตรวจว่าข้อมูลครบและ id ถูก
remap เหมือนต้นแบบเดิมหลัง pull สำเร็จ
