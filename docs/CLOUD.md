# Cloud storage — ช่องเสียบ provider (v4.9.0)

**สถานะ: ยังไม่มีการต่อ backend ใหม่ใดๆ ทั้งสิ้น** Google Drive backup ทำงาน
เหมือนเดิมทุกประการ (`docs/DRIVE.md`) และ `electron/src/db/drive.js` ไม่ถูกแตะ
เอกสารนี้อธิบาย *สัญญา* ที่เขียนไว้รอ ไม่ใช่ feature ที่ใช้ได้แล้ว

---

## 1. ทำไมต้องมี registry ทั้งที่ตอนนี้มี provider ที่ใช้ได้จริงตัวเดียว

คำสัญญาของแอปเรื่องข้อมูลคือ "ข้อมูลเป็นของคุณ อยู่บนดิสก์ของคุณ" (ดู
`docs/VAULTS.md` — หนึ่ง Nexus หนึ่งไฟล์) ครึ่งที่เป็น cloud ของคำสัญญานั้นต้อง
แปลว่า **"บัญชีที่เก็บของคุณ, credential ของคุณ"** การ hard-code Google ไว้
ไม่ผิดตอนที่ Drive เป็นตัวเลือกเดียว แต่เป็นรูปร่างที่ผิดสำหรับผู้ใช้ที่อยาก
ชี้แอปไปที่ Dropbox / OneDrive / WebDAV server / S3 bucket ของตัวเอง

เขียนสัญญาไว้ตอนนี้ = การเพิ่ม backend จริงในอนาคตคือ "เขียนไฟล์
`cloud-<id>.js` หนึ่งไฟล์ + เพิ่มหนึ่งบรรทัดใน `PROVIDERS`" ไม่ใช่การรื้อทุก
call site

## 2. สัญญา (`electron/src/db/cloud.js`)

```js
{
  id,             // /^[a-z0-9_]+$/ — เป็น prefix ของ app_setting key ด้วย
  labelKey,       // i18n key ไม่ใช่ string ตรงๆ
  availability,   // 'available' | 'planned'
  capabilities,   // { backup: boolean, sync: boolean }
  needsConfig,    // ผู้ใช้ต้องวาง client credential เองไหม

  getConfig(), setConfig(cfg), connect(), disconnect(), status(),
}
```

> **ชื่อ `availability` ไม่ใช่ `status`** — object literal ที่ประกาศทั้ง
> `status: 'available'` และเมธอด `status()` จะเหลือแค่ตัวหลัง เงียบๆ
> (เจอตอนรันจริง ไม่ใช่ตอนอ่านโค้ด)

ทุกเมธอดคืนรูปแบบ `{ ok:true, … }` / `{ ok:false, code }` เหมือนที่ทั้งโค้ดเบส
ใช้อยู่ และทุก failure code ถูก map เป็น i18n key ที่ `cloudErrToast()` ใน
`src/renderer/cloud.js` — error string ดิบต้องไม่โผล่ถึง UI

provider **ไม่** เป็นเจ้าของ OAuth plumbing ของตัวเอง:
`electron/src/db/oauth-loopback.js` (`makePkcePair` / `makeState` /
`runOAuthLoopback`) เป็น provider-agnostic อยู่แล้ว และเป็นตัวเดียวกับที่
`drive.js`, `sync.js` และ `pluginOAuthAuthorize` ใช้ — provider ใหม่แค่ส่ง
callback `buildAuthUrl` เข้าไป

## 3. ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `electron/src/db/cloud.js` | registry + สัญญา + per-provider preference |
| `electron/src/db/cloud-drive.js` | **adapter** ครอบ `drive.js` เดิม — ไม่ย้ายโค้ดสักบรรทัด |
| `electron/src/db/cloud-planned.js` | dropbox / onedrive / webdav / s3 — ตอบ `not_implemented` ทุกเมธอด |
| `electron/src/renderer/cloud.js` | หน้า Setting → ข้อมูลแอป → พื้นที่เก็บข้อมูลบนคลาวด์ |

ชื่อไฟล์แบนราบมี hyphen ตามที่ `src/db/` ใช้อยู่แล้ว (`plugin-manifest.js`,
`oauth-loopback.js`, `db-transfer.js`, `import-merge.js`) — ไม่ได้ทำเป็นโฟลเดอร์
ย่อย เพราะ `dracondex-file-arch` เช็คว่าไฟล์ใน `src/db/` ต้องอยู่ชั้นเดียว

## 4. Settings key

| key | เก็บที่ไหน |
|---|---|
| `cloud:provider` | `app_setting` — provider ที่เลือกใช้อยู่ |
| `cloud:<id>:enabled` | `app_setting` |
| `cloud:<id>:role` | `app_setting` — `backup` \| `sync` \| `both` |
| `cloud:<id>:clientId` \| `clientSecret` \| `refreshToken` \| `token` \| `password` \| `secretKey` | **secret** (เข้ารหัสผ่าน `secret-store.js`) |

credential ของ provider ระบุด้วย provider id จึงเอาไปใส่ `SECRET_KEYS` แบบ
enumerate ไม่ได้ (จะต้องรู้จักทุก provider ที่จะมีในอนาคต) — `isSecretKey()`
จับด้วย **รูปแบบ** แทน โดยจงใจไม่ match key ที่ไม่ใช่ความลับอย่าง
`cloud:webdav:role`

`setting:get`/`setting:set` ใน main.js ตอนนี้กรองสองชั้น: allowlist เดิม **และ**
`isSecretKey()` — เป็นด่านหลังเผื่อวันหนึ่งมีคนขยาย allowlist โดยไม่ทันสังเกตว่า
เพิ่งยื่น refresh token ให้ renderer

## 5. กติกาของหน้า Settings

- ดึง `status()` **เฉพาะ provider ที่ active** — ถ้าดึงทุกตัวจะเป็น network
  round trip ต่อ provider ทุกครั้งที่เปิดหน้า สำหรับ backend ที่ผู้ใช้ไม่ได้ใช้
- provider ที่ `availability: 'planned'` ตั้งเป็น active **ไม่ได้** (registry
  ปฏิเสธ) — ไม่งั้นส่วนอื่นของแอปจะเริ่ม route backup เข้า stub
- role ที่ provider ไม่ได้ประกาศว่ารองรับ ถูกปฏิเสธด้วย `unsupported_role`
  ค่าที่เก็บไว้จึงเป็นค่าที่ implementation ในอนาคตทำตามได้เสมอ

## 6. เพิ่ม provider จริงต้องทำอะไร

1. เขียน `electron/src/db/cloud-<id>.js` ตามสัญญาใน §2 — ใช้
   `oauth-loopback.js` สำหรับ OAuth และ `getSecret`/`setSecret` สำหรับ credential
2. `require` มันใน `cloud.js` แล้วใส่ใน `PROVIDERS`
3. ลบ spec ของมันออกจาก `PLANNED_SPECS` ใน `cloud-planned.js`
4. เพิ่ม i18n key ของชื่อ (ถ้ายังไม่มี) ครบทั้ง 18 ภาษา

ไม่ต้องแตะหน้า Settings, IPC, หรือ preload — ทั้งสามอย่างวิ่งตาม registry อยู่แล้ว
