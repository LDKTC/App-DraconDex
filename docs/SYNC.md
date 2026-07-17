# Cloud Sync (Supabase) — ต้นแบบซิงก์ Nexus vault

> สถานะ: **prototype** — ซิงก์แบบ snapshot ทั้ง vault (last-write-wins) ไม่มีการ merge
> เพิ่มเข้ามาในเวอร์ชัน 3.8.0

เอกสารนี้มี 2 ส่วน: **วิธีใช้งาน** สำหรับผู้ใช้ และ **หลักการทำงาน** สำหรับผู้พัฒนา

---

## ส่วนที่ 1 — วิธีใช้งาน

### 1.1 เตรียมเซิร์ฟเวอร์ (ทำครั้งเดียว)

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com) (แผนฟรีใช้ได้)
2. เปิด SQL Editor ในแดชบอร์ด แล้วรันไฟล์
   `supabase/migrations/20260717000000_dracondex_sync_prototype.sql` ทั้งไฟล์
   (หรือใช้ Supabase CLI: `supabase db push`)
3. จดค่า 2 ตัวจากหน้า Project Settings → API:
   - **Project URL** เช่น `https://abcdefgh.supabase.co`
   - **Publishable (anon) key**

> คีย์ anon เป็นคีย์สาธารณะโดยธรรมชาติของ Supabase — ความปลอดภัยของข้อมูล
> อยู่ที่คีย์เข้าถึง (access key) ต่อ vault ไม่ใช่ที่คีย์ anon

### 1.2 ตั้งค่าในแอป

1. เปิด vault ที่ต้องการ → กดปุ่ม **☁** ที่มุมล่างของแผงซ้าย (ข้างปุ่ม ⇄)
2. ครั้งแรกจะเจอหน้า **ตั้งค่าเซิร์ฟเวอร์** — กรอก Project URL และคีย์ anon แล้วบันทึก
3. การตั้งค่านี้เก็บระดับแอป (ทุก vault ใช้เซิร์ฟเวอร์เดียวกัน) แก้ได้ทีหลังจากปุ่ม
   "ตั้งค่าเซิร์ฟเวอร์" ในหน้าต่างซิงก์

### 1.3 อัปโหลด vault ครั้งแรก (Push)

1. กด **อัปโหลด** ในหน้าต่างซิงก์
2. ระบบจะสร้าง **คีย์เจ้าของ** รูปแบบ `Xxxx-Xxxx-Xxxx-Xxxx` (เช่น `Ertt-3fu6-Dd5t-Fd34`)
   และแสดง **เพียงครั้งเดียว** — กดคัดลอกและเก็บไว้ให้ดี
   - เซิร์ฟเวอร์เก็บเฉพาะแฮชของคีย์ (sha-256) กู้คืนคีย์ไม่ได้
   - คีย์เจ้าของทำได้ทั้งอัปโหลดและดึงข้อมูล
3. อัปโหลดครั้งถัด ๆ ไปคือกดปุ่มเดิม — สำเนาบนคลาวด์ถูกเขียนทับทั้งก้อน

### 1.4 แชร์ vault ให้คนอื่น (คีย์อ่านอย่างเดียว)

1. เจ้าของกด **สร้างคีย์อ่านอย่างเดียว** — ได้คีย์ใหม่ แสดงครั้งเดียวเช่นกัน
2. ส่งคีย์นั้นให้ผู้รับ (ช่องทางที่ปลอดภัย)
3. ฝั่งผู้รับ: สร้าง vault เปล่า (หรือใช้ vault ที่ยอมให้ถูกเขียนทับ) → กด ☁ →
   กรอกคีย์ในช่อง **เชื่อมด้วยคีย์เข้าถึง** → กดเชื่อม → กด **ดึงข้อมูล**
4. คีย์อ่านอย่างเดียวดึงข้อมูลได้อย่างเดียว — กดอัปโหลดจะถูกปฏิเสธ (`not_owner`)

### 1.5 การดึงข้อมูล (Pull) — ข้อควรระวัง

- Pull **เขียนทับเนื้อหา vault ในเครื่องทั้งหมด** ด้วยสำเนาบนคลาวด์
  (มีกล่องยืนยันก่อนเสมอ) — ประวัติเวอร์ชัน (Version History) ของโมดูลใน vault
  นั้นถูกล้างไปด้วย
- ชื่อ vault ในเครื่อง **ไม่ถูกเปลี่ยน** (ชื่อซ้ำกันข้าม vault ไม่ได้) —
  ชื่อบนคลาวด์แสดงเป็นข้อมูลประกอบในหน้าต่างซิงก์
- **ยกเลิกการเชื่อม** แค่ตัดลิงก์ในเครื่อง — สำเนาบนคลาวด์ยังอยู่ เชื่อมใหม่ได้ด้วยคีย์เดิม

### 1.6 ความหมายของข้อความผิดพลาด

| ข้อความ | สาเหตุ |
|---|---|
| กรุณาตั้งค่าเซิร์ฟเวอร์ก่อน | ยังไม่ได้กรอก URL/คีย์ anon |
| คีย์เข้าถึงไม่ถูกต้อง | คีย์ไม่มีในระบบ (พิมพ์ผิด/ถูกลบ) |
| รูปแบบคีย์ต้องเป็น Xxxx-Xxxx-Xxxx-Xxxx | รูปแบบคีย์ผิด |
| คีย์นี้อ่านอย่างเดียว — อัปโหลดไม่ได้ | ใช้คีย์อ่านอย่างเดียวกดอัปโหลด |
| เครือข่ายผิดพลาด | ต่ออินเทอร์เน็ต/URL ไม่ได้ |
| เซิร์ฟเวอร์ปฏิเสธคีย์ API | คีย์ anon ผิด |
| Vault ใหญ่เกินไปสำหรับซิงก์ | snapshot เกิน 10 MB |

---

## ส่วนที่ 2 — หลักการทำงาน (สำหรับผู้พัฒนา)

### 2.1 สถาปัตยกรรม

```
Renderer (src/renderer/sync.js — หน้าต่างซิงก์ 3 สถานะ)
   │ window.api.sync.*  (preload.js)
   ▼
Main process IPC 'sync:*' (main.js) → src/db/sync.js
   │ serializeVault / applySnapshot  (SQLite ผ่าน src/db/core.js)
   │ fetch (Node 18+, main process เท่านั้น — renderer ไม่แตะเครือข่าย)
   ▼
Supabase PostgREST  POST /rest/v1/rpc/<fn>   (header: apikey + Bearer anon key)
   ▼
Postgres: ตาราง sync_vault / sync_key + ฟังก์ชัน SECURITY DEFINER 5 ตัว
```

ฝั่งเซิร์ฟเวอร์อยู่ในไฟล์เดียว:
`supabase/migrations/20260717000000_dracondex_sync_prototype.sql`

- `sync_vault(id, name, snapshot jsonb, snapshot_at)` — 1 แถว = 1 vault บนคลาวด์
  (snapshot ทับทั้งก้อนทุกครั้งที่ push)
- `sync_key(vault_id, key_hash, role owner|read)` — เก็บเฉพาะ sha-256 ของคีย์
- RLS เปิดทั้งสองตารางแบบ **ไม่มี policy** + revoke สิทธิ์ anon —
  ทางเข้าเดียวคือ RPC ทั้ง 5: `sync_create_vault`, `sync_push_vault`,
  `sync_pull_vault`, `sync_create_read_key`, `sync_vault_status`
- ข้อผิดพลาดส่งกลับเป็น `raise exception '<code>'` → HTTP 400
  `{"message":"bad_key" | "not_owner" | "too_large"}` ให้ไคลเอนต์ map เป็น toast

### 2.2 Snapshot model

`serializeVault(nexusId)` (src/db/sync.js) อ่านทั้ง closure ของ vault เป็น JSON
ก้อนเดียว (`format: dracondex-vault-snapshot`, `version: 1`):

- **รวม**: แถว nexus (memo/สี), ต้นไม้ module ทั้ง 15 kind + ตารางลูกทุกตัว
  (classifier_*, map/map_area/map_point, timeline/timeline_event, map_event,
  story_*, book_chapter, chat_*, sketch_*, design_*), module_attribute /
  module_ui / module_hashtag, entity_relation, note/note_folder
- **ไม่รวม**: module_version (ประวัติ), import_file (path ในเครื่อง),
  wiki_link (สร้างใหม่ได้), และต้นไม้ legacy project ทั้งหมด
- FK ไปตาราง lookup ถูกแปลงเป็น natural key ตอน export:
  `use_color.id → color_code`, `hashtag.id → tag_name`,
  `timeline_date.id → "day|month|years|hour|minute"`

`applySnapshot(nexusId, payload)` ตอน pull ทำงานใน transaction เดียว:

1. ลบเนื้อหาเดิมของ vault (`DELETE FROM module WHERE nexus_ref=?` — CASCADE
   เก็บตารางลูกทั้งหมด) + entity_relation/note/note_folder/wiki_link
2. `INSERT OR IGNORE` lookup ด้วย natural key แล้วสร้าง map code→id
3. ใส่ module แบบ parent-มาก่อน สร้าง `modMap: oldId→newId` แล้วใส่ตารางลูก
   ตามลำดับ dependency (แต่ละตารางสร้าง map ของตัวเอง)
4. remap id ที่ฝังในข้อมูล: `entity_relation.from_key/to_key`
   (`module_<id>`, `cobj_<id>`, `bchp_<id>`, `chss_<id>`, `note_<id>`),
   `sketch_pin.linker_key` / `design_node.linker_key`, และ `module_ui`
   คีย์ `mapModule`/`timelineModule` ของ Wanderer — ตัวที่ map ไม่ได้ถูก
   ตัดทิ้งและนับไว้ใน summary (`droppedRelations`/`droppedPins`)
5. หลัง commit เรียก `rebuildWikiIndex()` สร้างดัชนี `[[wikilink]]` ใหม่
   (ลิงก์อิงชื่อ ไม่อิง id จึงไม่ต้อง remap)

### 2.3 โมเดลคีย์และสิทธิ์

- คีย์ = ตัวอักษร/ตัวเลข 4 กลุ่ม กลุ่มละ 4 (charset 62 ตัว ≈ 95 bit)
  สร้างฝั่งไคลเอนต์ด้วย `crypto.randomInt` (src/db/sync.js `generateAccessKey`)
- ส่ง plaintext ผ่าน TLS ครั้งเดียวตอนสร้าง — เซิร์ฟเวอร์เก็บ sha-256 เท่านั้น
- role: `owner` (push+pull, สร้างคีย์ read ได้) / `read` (pull เท่านั้น)
- ฝั่งเครื่อง: การตั้งค่าอยู่ใน `app_setting` — `sync:url`, `sync:anonKey`,
  และสถานะต่อ vault `sync:nexus:<id>` (JSON: vaultId, accessKey, role,
  cloudName, lastPushAt, lastPullAt) — **accessKey เก็บ plaintext ในเครื่อง**

### 2.4 ข้อจำกัดของต้นแบบ (ตั้งใจ)

- snapshot ทั้งก้อน last-write-wins — ไม่มี merge/conflict UI; pull ล้าง
  version history ของ vault ปลายทาง
- id ที่ฝังในค่าอื่น (filterDef ของ Viewer/Connector, id ในข้อความอิสระ)
  ไม่ถูก remap — ค้างเป็นค่าเก่าหลัง pull
- legacy project (Director/Navigator/Hero/Writer) และไฟล์ Import Dock ไม่ซิงก์;
  relation ที่ชี้ไป key แบบ legacy ถูกตัดทิ้ง (นับใน summary)
- ไม่มี UI จัดการ/เพิกถอนคีย์รายตัว (สถานะบอกจำนวนคีย์รวมเท่านั้น)
- snapshot เก็บบน Postgres แบบไม่เข้ารหัส; จำกัดขนาด 10 MB ต่อ vault
- `rebuildWikiIndex()` หลัง pull ทำงานทั้งฐาน (ทุก vault) — ยอมรับได้ที่สเกลต้นแบบ

### 2.5 การทดสอบ

ทดสอบ end-to-end ด้วย web-driver (renderer + preload + db จริง) กับ mock ของ
RPC ทั้ง 5 (พฤติกรรม/error body เหมือน migration): สร้าง vault ที่มีข้อมูลครบทุกกลุ่ม
→ push (ได้คีย์เจ้าของ) → สร้าง vault ใหม่ → link ด้วยคีย์ → pull → ตรวจว่า
ข้อมูลครบและ id ถูก remap (relation, wanderer refs, map_event) → สร้างคีย์ read
→ ตรวจว่า push ถูกปฏิเสธ / pull ผ่าน / คีย์ผิดถูกปฏิเสธ
