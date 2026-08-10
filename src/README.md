# `src/` — ของที่ใช้ร่วมกันระหว่าง Electron กับ Flutter

repo นี้มีแอปสองตัวที่เขียนคนละภาษาแต่ทำงานบนข้อมูลชุดเดียวกัน:

| โฟลเดอร์ | คืออะไร |
|---|---|
| [`../electron/`](../electron/) | แอปเดสก์ท็อป Electron (JS) — ตัวหลัก |
| [`../flutter/`](../flutter/) | Flutter port (Dart) — schema เดียวกัน แต่ตามหลังอยู่ |
| **`src/`** | **ของกลาง** — ไฟล์ที่ทั้งสองฝั่งใช้ร่วมกัน หรือที่ทั้งสองฝั่งต้องตกลงให้ตรงกัน |

`src/` **ไม่มีโค้ดของแอป** โค้ด Electron อยู่ที่ `electron/src/`, โค้ด Flutter อยู่ที่
`flutter/lib/` — ที่นี่มีแต่ resource กับ "สัญญา" ระหว่างสองฝั่ง

## มีอะไรบ้าง

| ที่อยู่ | คืออะไร | ใครกิน |
|---|---|---|
| `assets/brand/` | โลโก้/ไอคอนชุด Electron (`.png`, `.ico`) | Electron อ่านตรง ๆ ผ่าน relative path |
| `assets/flutter/` | โลโก้ชุดที่ Flutter ใช้ (export คนละขนาด/ชื่อ) | Flutter — ผ่าน mirror ดูหัวข้อล่าง |
| `assets/fonts/` | NotoSans (Regular/Bold) + `OFL.txt` | Flutter — ผ่าน mirror |
| [`design/`](design/) | design tokens ที่สกัดจาก `electron/css/` (`/design-sync` tokens-only) | ยังไม่มีใครกินอัตโนมัติ — ใช้อ้างอิงตอนทำ theme |
| [`schema/`](schema/) | สัญญาของ SQLite schema — ตารางเดียวกัน implement คนละภาษา | อ่านก่อนแก้ตาราง ดู [`schema/README.md`](schema/README.md) |
| [`supabase/`](supabase/) | migration ฝั่งเซิร์ฟเวอร์ของ Cloud Sync (ปิดใช้อยู่ตั้งแต่ v4.5.0) | ทั้งสองฝั่ง ถ้าเปิดฟีเจอร์กลับมา |
| `sync-assets.mjs` | สคริปต์ mirror asset ลง `flutter/assets/` | คนและ CI |

## เรื่อง asset: ต้นฉบับอยู่ที่นี่ สำเนาอยู่ที่ Flutter

`pubspec.yaml` ประกาศ asset ที่อยู่ **นอก** โฟลเดอร์ package ตัวเองไม่ได้ —
`flutter/assets/` จึงต้องมีไฟล์จริงอยู่ตรงนั้น ทางออกคือ:

```
src/assets/flutter/  ──(สำเนา)──>  flutter/assets/images/
src/assets/fonts/    ──(สำเนา)──>  flutter/assets/fonts/
```

**`src/assets/` คือต้นฉบับ `flutter/assets/` คือสำเนา — แก้ที่ต้นฉบับเสมอ**
สำเนาถูก commit ไว้ด้วย เพื่อให้ `flutter pub get && flutter build` ทำงานได้ทันที
บน clone ใหม่โดยไม่ต้องรันสคริปต์ก่อน (git เก็บไฟล์ที่เนื้อหาเหมือนกันเป็น blob
เดียว สำเนาจึงแทบไม่กิน history)

```bash
node src/sync-assets.mjs           # คัดลอกต้นฉบับทับสำเนา
node src/sync-assets.mjs --check   # เทียบอย่างเดียว เพี้ยนเมื่อไหร่ exit 1
```

`--check` ถูกเรียกใน `.github/workflows/build-apk.yml` ก่อน `flutter pub get` —
ถ้าใครเผลอไปแก้ฝั่งสำเนา build จะแดงทันทีแทนที่จะเงียบ

ฝั่ง Electron ไม่ต้อง mirror: `electron/index.html` กับ `electron/css/` อ้าง
`../src/assets/brand/…` และ `../../src/assets/brand/…` ตรง ๆ และ
`package.json` → `build.files` ก็ ship `src/assets/**/*` เข้า asar ให้แล้ว
