# Plugins — Sandboxed Plugin Runtime

> สถานะ: ใช้งานได้ — เพิ่มเข้ามาในเวอร์ชัน 4.0.0 (2026-07-30) ในชื่อ
> "Github Extensions" และเปลี่ยนชื่อทั้งระบบเป็น **Plugin** ในเวอร์ชัน 4.2.0
> (2026-08-06) พร้อมเพิ่มการติดตั้งด้วยการวางลิงก์ `.git` ลิงก์เดียว
>
> ดาวน์โหลด "ปลั๊กอิน" จาก git repo ที่มี manifest ของตัวเอง แต่ละปลั๊กอินมี
> ตารางฐานข้อมูลของตัวเอง รันในหน้าต่างแยกที่ถูกจำกัดสิทธิ์อย่างจริงจัง — ไม่ใช่
> การ stub หรือรันแบบเต็มสิทธิ์

เอกสารนี้มี 2 ส่วน: **วิธีใช้งาน** สำหรับผู้ใช้ และ **หลักการทำงาน + ข้อจำกัดด้าน
ความปลอดภัย** สำหรับผู้พัฒนา — ส่วนหลังสำคัญมาก อ่านก่อนเชื่อว่าฟีเจอร์นี้
"ปลอดภัย 100%"

---

## ส่วนที่ 1 — วิธีใช้งาน

### 1.1 ติดตั้งปลั๊กอิน (v4.2.0: วางลิงก์ลิงก์เดียว)

1. เปิด **การตั้งค่า** (Setting window) → ปลั๊กอิน → **ปลั๊กอิน**
2. **วางลิงก์ `.git` ของ repo** ลงในช่องเดียว — ไม่ต้องแยกกรอก owner/repo/ref
   เหมือนก่อน v4.2.0 อีกแล้ว รูปแบบที่รองรับ:

   | รูปแบบ | ตัวอย่าง |
   |---|---|
   | HTTPS + `.git` | `https://github.com/acme/my-plugin.git` |
   | HTTPS ธรรมดา | `https://github.com/acme/my-plugin` |
   | SSH / scp | `git@github.com:acme/my-plugin.git`, `ssh://git@github.com/acme/my-plugin.git` |
   | ไม่มี scheme | `github.com/acme/my-plugin` |
   | ย่อสุด | `acme/my-plugin` (ถือว่าเป็น GitHub) |
   | ระบุ branch | `https://github.com/acme/my-plugin/tree/dev` (branch มี `/` ได้ เช่น `feat/x`) |
   | GitLab | `https://gitlab.com/acme/team/my-plugin.git`, `.../-/tree/dev` (กลุ่มซ้อนกันได้ถึง 5 ชั้น) |

   - **ถ้าลิงก์ไม่ได้ระบุ branch** ระบบจะลอง `main` แล้วค่อย `master` ให้เอง
   - **ชื่อไฟล์ manifest** จะลอง `dracondex-plugin.json` ก่อน แล้วค่อย
     `dracondex-extension.json` (ของเก่ายังใช้ได้)
   - รองรับเฉพาะ **github.com** และ **gitlab.com** เท่านั้น — self-hosted
     GitLab / Bitbucket / โฮสต์อื่นจะถูกปฏิเสธด้วย `unsupported_host`
3. พอวางลิงก์เสร็จ แอปจะ **ดึง manifest มาแสดงพรีวิวให้อัตโนมัติ** (หน่วง ~400ms
   หลังหยุดพิมพ์ ไม่ต้องกดปุ่ม — ปุ่ม **ตรวจสอบ** มีไว้กดซ้ำหรือกรณีพิมพ์เอง)
   พรีวิวจะบอกว่า: ชื่อ/เวอร์ชัน/`id` ของปลั๊กอิน, host + owner/repo@ref,
   ไฟล์ entry, ไฟล์ทั้งหมดที่จะดาวน์โหลด, ตารางฐานข้อมูลที่จะถูกสร้างพร้อมชนิด
   คอลัมน์ และคำเตือนว่าโค้ดนี้มาจากอินเทอร์เน็ต
4. กด **ยืนยันการติดตั้ง** — แอปจะดึงไฟล์ทั้งหมดที่ manifest ระบุ ตรวจสอบความ
   ถูกต้องอีกครั้ง แล้วจึงเขียนลงดิสก์และฐานข้อมูล

   **พรีวิวไม่แตะดิสก์และไม่แตะฐานข้อมูลเลย** และตอนกดยืนยัน ตัวติดตั้งจะ
   resolve + validate ใหม่ทั้งหมดเอง ไม่เชื่อค่าที่พรีวิวส่งกลับมา (ดู §2.3b)

### 1.2 เปิดใช้งานปลั๊กอิน

กด **เปิดใช้งาน** ที่รายการปลั๊กอินที่ติดตั้งแล้ว — จะเปิดเป็นหน้าต่างแยก
ต่างหาก **ปลั๊กอินไม่มีสิทธิ์เข้าถึงข้อมูลของแอปหลักเลย** — เข้าถึงได้แค่ตาราง
ของตัวเองที่ประกาศไว้ใน manifest เท่านั้น เมื่อเปิดอยู่ ปุ่มจะเปลี่ยนเป็น **หยุด**

### 1.2b Plugin setting

หน้า **ตั้งค่าปลั๊กอิน** (Setting window → ปลั๊กอิน) จะแสดงรายการปลั๊กอินที่
ติดตั้งไว้ทั้งหมด — ถ้าปลั๊กอินไหนมีการตั้งค่าของตัวเอง จะมาโผล่ตรงนี้ ตอนนี้ยัง
ไม่มีปลั๊กอินไหนประกาศ settings schema ใน manifest (`dracondex-plugin.json`
ยังไม่มีฟิลด์นี้ — ดู §1.4) หน้านี้จึงแสดงแค่ชื่อปลั๊กอินพร้อมข้อความ
"ไม่มีการตั้งค่า" ต่อรายการไปก่อน

### 1.3 ถอนการติดตั้ง

กด **ลบ** ที่รายการปลั๊กอิน — ต้องปิดหน้าต่างปลั๊กอินนั้นก่อนถ้ากำลังเปิดอยู่
การถอนการติดตั้งจะ**ลบไฟล์และตารางฐานข้อมูลของปลั๊กอินนั้นถาวร**
ไม่สามารถย้อนกลับได้

### 1.4 สร้างปลั๊กอินเอง — รูปแบบ manifest

วาง `dracondex-plugin.json` ไว้ที่ root ของ repo:
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
- `files`: รายชื่อไฟล์ทั้งหมดที่ปลั๊กอินต้องการ (ไม่เกิน 30 ไฟล์ ไฟล์ละไม่เกิน
  2MB) — แอปจะดึงทีละไฟล์ตามที่ระบุเท่านั้น ไม่เดินสำรวจ repo เอง
- `tables`: ตารางที่ปลั๊กอินอยากมีเป็นของตัวเอง (ไม่เกิน 10 ตาราง คอลัมน์ไม่
  เกิน 25 คอลัมน์ต่อตาราง) ชนิดคอลัมน์รองรับแค่ `TEXT`/`INTEGER`/`REAL` เท่านั้น
- ภายในปลั๊กอินเรียกใช้ตารางผ่าน `window.pluginApi.table.query/insert/update/
  delete/getSchema('notes', ...)` — ไม่มี `window.api` ให้ใช้เลย
  (`window.extApi` ยังมีอยู่เป็น alias ชี้ไปที่ object เดียวกัน เพื่อไม่ให้
  ปลั๊กอินที่เขียนไว้ก่อน v4.2.0 พัง)
- ชื่อไฟล์ `dracondex-extension.json` ยังใช้ได้ ระบบจะหาไฟล์นี้เป็นตัวสำรอง

---

## ส่วนที่ 2 — หลักการทำงาน + ข้อจำกัดด้านความปลอดภัย (สำหรับผู้พัฒนา)

### 2.1 สถาปัตยกรรม

```
Renderer (แอปหลัก, src/renderer/plugin.js)        Plugin window (แยกต่างหาก)
   │ window.api.plugin.*  (preload.js)               │ window.pluginApi.table.*
   │ preview/install/list/uninstall/launch/stop        (preload-plugin.js —
   ▼                                                    ไม่มี window.api เลย)
Main process (main.js)                            ▼
   │ createPluginWindow() — BrowserWindow ใหม่         pluginapi:table:* IPC
   │   ต่อปลั๊กอินที่รัน, preload: preload-plugin.js,    (raw ipcMain.handle,
   │   contextIsolation:true, nodeIntegration:false,     resolve pluginId จาก
   │   sandbox:true (ดู §2.4 ว่าทำไมนี่คือความ            BrowserWindow.
   │   ซื่อสัตย์ ไม่ใช่การอวดอ้าง)                        fromWebContents)
   ▼
src/db/plugin.js       — resolveRepo/preview/install/uninstall (ไฟล์+DB),
                         pluginApiQuery/Insert/Update/Delete/GetSchema
                         (บังคับ ownership ทุกครั้ง)
src/db/plugin-manifest.js — logic ล้วนๆ ไม่ require electron/db เลย:
                         validateManifest, parseRepoUrl, rawUrl
                         (แยกออกมาเพื่อให้ `node --test` เรียกตรงได้ —
                          test/plugin-url.test.mjs)
```

### 2.2 ทำไมต้องแยกระบบใหม่ทั้งหมด ไม่ใช้ของเดิม

`module.kind` มี SQL `CHECK` constraint บังคับ 15 ค่าตายตัว
(`src/db/schema/ddl.js`) — SQLite ไม่รองรับการ `ALTER` constraint นี้ ปลั๊กอิน
จึงต้องมีตาราง/registry เป็นของตัวเอง (`plugin`, `plugin_table`) ไม่ใช่
kind ที่ 16

### 2.3 โมเดลความปลอดภัย — identifier whitelist

ไม่มี prepared-statement parameter ตัวไหน bind ชื่อ table/column ได้ (bind ได้
แค่ค่า value) — ดังนั้นทุก identifier ที่มาจากปลั๊กอิน (manifest's table/
column names) ต้องผ่าน regex whitelist ที่เข้มงวดก่อนถูกนำไปประกอบ SQL เสมอ
regex ทั้งชุดอยู่ใน `src/db/plugin-manifest.js`:

```js
PLUGIN_ID_RE     = /^[a-z0-9_]{1,20}$/
PLUGIN_TABLE_RE  = /^[a-z0-9_]{1,20}$/
PLUGIN_COLUMN_RE = /^[a-z][a-z0-9_]{0,29}$/
FULL_TABLE_RE    = /^plg_[a-z0-9_]{1,41}$/   // ตรวจซ้ำก่อน DDL ทุกครั้ง
REPO_SEG_RE      = /^[A-Za-z0-9._-]{1,100}$/ // ทุก segment ของ URL
COL_TYPES        = {'TEXT','INTEGER','REAL'}  // เท่านั้น ไม่รับ type อื่น
RESERVED_COLS    = {'id','rowid','oid','_rowid_'}
```

ไม่รับ `DEFAULT`/`CHECK`/`FOREIGN KEY` จาก manifest เลย — จะเปิดช่องโหว่โดยไม่
จำเป็นสำหรับปลั๊กอินระดับ MVP

`plugin_table.table_name` (เช่น `plg_myplugin_notes`) เป็น identifier
เดียวที่ระบบเก็บและนำมาใช้ตอน runtime — ทุกครั้งที่ pluginApi เรียก จะ lookup ผ่าน
`?`-bound query บน `(plugin_ref, local_name)` ก่อนเสมอ **ไม่มีการต่อ string
จาก renderer/ปลั๊กอินโดยตรงเป็น identifier เด็ดขาด**

### 2.3b พรีวิวไม่ใช่ trust boundary

`pluginPreview(url)` เป็น dry run แบบอ่านอย่างเดียว มีไว้บอกผู้ใช้ว่ากำลังจะติดตั้ง
อะไร — **ไม่ใช่การตรวจสอบความปลอดภัยและไม่ใช่ input ของตัวติดตั้ง**
`pluginInstall(url)` รับ URL ตัวเดียวแล้ว resolve + fetch + `validateManifest`
ใหม่หมดด้วยตัวเอง ไม่รับ manifest / owner / repo / ref จาก renderer เลย
พรีวิวที่ค้างอยู่หรือถูกแก้ในหน้าเว็บจึงขยายสิ่งที่ถูกติดตั้งไม่ได้

ฝั่ง renderer: ทุกฟิลด์ของ manifest ที่เอามาวาดในการ์ดพรีวิวผ่าน `x()` ทุกจุด
(`pluginPreviewHtml` ใน `src/renderer/plugin.js`) — นี่เป็นที่เดียวในแอปที่
ข้อความจากอินเทอร์เน็ตถูกวาดเป็น HTML

### 2.4 สิ่งที่ป้องกันได้ vs สิ่งที่ป้องกันไม่ได้ (ซื่อสัตย์ ไม่ใช่โฆษณา)

**ป้องกันได้:**
- หน้าต่างปลั๊กอินไม่เคยได้รับ `preload.js` เลย — เข้าถึง `window.api.*`
  ไม่ได้เด็ดขาด (เป็นข้อเท็จจริงเชิงโครงสร้าง ไม่ใช่การเช็คแบบ runtime ที่ bypass
  ได้)
- แตะตารางของปลั๊กอินอื่นหรือของแอปหลักไม่ได้ — ทุกคำสั่ง `pluginApi.table.*`
  resolve ownership จาก**ตัวหน้าต่างที่เรียกเอง** (`BrowserWindow.
  fromWebContents`) ไม่ใช่จาก argument ที่ปลั๊กอินส่งมา
- รัน SQL เองไม่ได้เลย — ไม่มี raw-SQL passthrough ใน `pluginApi.*` แม้แต่จุดเดียว

**ป้องกันไม่ได้ (ยอมรับเป็นข้อจำกัดที่รู้อยู่แล้ว ไม่ใช่สิ่งที่ระบบนี้อ้างว่าแก้ได้):**
- **ไม่มี OS-level Chromium sandbox จริง** — `main.js` มี
  `app.commandLine.appendSwitch('no-sandbox')` ตั้งไว้ทั้งโปรเซส (เพื่อความ
  เข้ากันได้กับ portable build) ตั้งแต่ก่อนฟีเจอร์นี้จะมีอยู่ — ทุกหน้าต่างในแอป
  รวมถึงหน้าต่างปลั๊กอินได้รับผลกระทบนี้เหมือนกันหมด Electron ไม่รองรับการ
  เปิด sandbox กลับเฉพาะบางหน้าต่างหลังตั้ง flag นี้ไปแล้ว การตั้ง
  `sandbox: true` ใน webPreferences ของหน้าต่างปลั๊กอินจึงใกล้เคียง no-op
  ในตอนนี้ — ยังคงตั้งไว้เผื่ออนาคตถ้า flag นี้ถูกทบทวนใหม่ ไม่ใช่การันตีการป้องกัน
  จริงวันนี้
- JS ของปลั๊กอินที่เป็นอันตรายยังรันอยู่ใน V8/Electron process เดียวกัน
  และอาจพยายามโจมตีระดับ engine (เช่น prototype pollution) ได้ — ความเสี่ยง
  แบบเดียวกับที่ตัวแอปหลักเองก็มีอยู่แล้ว ไม่ใช่สิ่งที่ฟีเจอร์นี้เพิ่มขึ้นมาใหม่
- โค้ดจาก repo ถูก**เชื่อถือทันทีที่ติดตั้ง ไม่มีการตรวจสอบหรือ code review/
  signing ใดๆ** — พรีวิวใน v4.2.0 เป็นแค่การ**แจ้งให้ทราบ** ว่าจะติดตั้งไฟล์และ
  ตารางอะไรบ้าง ไม่ได้ตรวจว่าโค้ดข้างในทำอะไร ไม่มีการป้องกัน supply-chain ใดๆ

### 2.5 การดาวน์โหลด — ไม่มี zip, ไม่มี dependency ใหม่

ดึงทีละไฟล์ผ่าน raw URL ของแต่ละโฮสต์ (ไม่ใช่ Contents API เพราะ raw คืน bytes
ตรง ไม่ต้อง decode base64 ซ้อน) buffer แล้ว `fs.writeFileSync` ตรงตามแพทเทิร์นเดิม
ที่ `drive.js` ใช้อยู่แล้ว:

```
github → https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{path}
gitlab → https://gitlab.com/{namespace}/{project}/-/raw/{ref}/{path}
```

ทุก segment ผ่าน `encodeURIComponent` แยกชิ้น (namespace ของ GitLab มี `/` ได้
จึงต้อง split ก่อน encode ไม่งั้น `/` จะกลายเป็น `%2F` แล้ว URL พัง)

ไม่มี octokit, ไม่มี zip/tar library ใหม่, ไม่มี git binary (`unzipper` ที่มีอยู่ใน
node_modules เป็นแค่ transitive dev dependency ของ electron-builder เอง ใช้ตอน
runtime ไม่ได้และไม่ควรพึ่งพา) — แอปนี้มี runtime dependency เดียวคือ
`node-sqlite3-wasm` และฟีเจอร์นี้ไม่เพิ่มตัวที่สอง

### 2.6 การเปลี่ยนชื่อ v4.1 → v4.2 (extension → plugin)

การเปลี่ยนชื่อกินลึกถึงชั้นฐานข้อมูลและดิสก์ ทั้งสองฝั่ง migrate อัตโนมัติตอนเปิด
แอปครั้งแรกหลังอัปเดต และเป็น idempotent:

| ของเดิม (≤ v4.1) | ของใหม่ (v4.2+) |
|---|---|
| `src/db/extension.js` | `src/db/plugin.js` (+ `src/db/plugin-manifest.js`) |
| `src/renderer/extension.js` | `src/renderer/plugin.js` |
| `preload-ext.js` | `preload-plugin.js` |
| IPC `extension:*` | `plugin:*` (+ ช่องใหม่ `plugin:preview`) |
| IPC `extapi:table:*` | `pluginapi:table:*` |
| `window.extApi` | `window.pluginApi` (`extApi` ยังอยู่เป็น alias) |
| ตาราง `extension` / คอลัมน์ `ext_key` | `plugin` / `plugin_key` (+ คอลัมน์ใหม่ `repo_host`) |
| ตาราง `extension_table` / `extension_ref` | `plugin_table` / `plugin_ref` |
| ตารางของแต่ละตัว `ext_<id>_<name>` | `plg_<id>_<name>` |
| โฟลเดอร์ `<dataRoot>/extensions/` | `<dataRoot>/plugins/` |

- **ฝั่ง DB**: `migratePluginV42(db)` ใน `src/db/schema/migrations.js` — ต่างจาก
  migration อื่นตรงที่ **รันก่อน `db.exec(DDL_SQL)`** ใน `schema/init.js` ไม่งั้น
  `CREATE TABLE IF NOT EXISTS plugin` จะสร้างตารางเปล่าขึ้นมาข้างๆ ข้อมูลเก่า
  และต้องอยู่ใน `parts[]` ของ `schemaStamp()` ด้วย ไม่งั้น DB เดิมจะข้าม `initDB`
  ทั้งก้อนแล้วไม่เคย migrate เลย (พลาดแบบไม่มี error ให้เห็น)
- **ฝั่งดิสก์**: `migratePluginDir()` ใน `src/db/plugin.js` เรียกครั้งเดียวจาก
  `main.js` ตอน `app.whenReady()` — ย้าย `extensions/` → `plugins/` ถ้ายังไม่เคยย้าย
- **ปลั๊กอินเก่าไม่ต้องแก้อะไร**: `window.extApi` ยังใช้ได้ และชื่อไฟล์
  `dracondex-extension.json` ยังหาเจอ

### 2.7 การทดสอบ

1. **Manifest validator + URL parser** (`validateManifest`, `parseRepoUrl`,
   `rawUrl`) — เป็น pure function ใน `src/db/plugin-manifest.js` ไม่พึ่ง Electron
   เลย มีเทสต์จริงที่ `test/plugin-url.test.mjs` (`node --test 'test/*.test.mjs'`)
   ครอบคลุมลิงก์ทุกรูปแบบใน §1.1, ลิงก์ที่ต้องปฏิเสธ (โฮสต์อื่น, path traversal,
   percent-encoding, ช่องว่าง) และ fixture manifest ที่ต้องไม่ผ่าน (id ผิดรูปแบบ,
   column type ผิด, ชื่อ column สงวนไว้, มี SQL metacharacter, path traversal ใน
   `files`, ตาราง/คอลัมน์เกิน limit)
2. **migratePluginV42** — ทดสอบด้วยฐานข้อมูลรูปแบบ v4.1 จริง: แถวใน `extension`
   ย้ายมาครบ, `ext_*` ถูก rename เป็น `plg_*` พร้อมข้อมูลข้างใน, `repo_host`
   ถูก backfill, FK `ON DELETE CASCADE` ยังทำงาน, รันซ้ำแล้วไม่เปลี่ยนอะไร
3. **เส้นทางอัปเกรดเต็ม** — data dir ที่มีทั้ง DB v4.1 และโฟลเดอร์ `extensions/`
   แล้วบูต `database.js` จริง: `pluginList()` คืนปลั๊กอินเดิม, `pluginApiQuery`
   อ่านข้อมูลในตารางที่ถูก rename ได้, ไฟล์ย้ายไป `plugins/` และ path ที่
   `main.js` ใช้ `loadFile` ยังชี้ถูก
4. **preview/install** — ตรวจว่า `rawUrl` ของทั้ง GitHub และ GitLab ยิงไปโดน
   ไฟล์จริงบนเน็ตได้ (HTTP 200) และ repo จริงที่ไม่มี manifest คืน `no_manifest`
   (ไม่ใช่ `network`) จากนั้นทดสอบ install เต็มเส้นด้วย fetch ที่ stub เป็น repo
   ปลอม: preview ไม่เขียนอะไรลงดิสก์/DB, install เขียนไฟล์ (รวมไฟล์ในโฟลเดอร์ย่อย)
   + สร้างแถวและตาราง, ติดตั้งซ้ำถูกปฏิเสธ, uninstall ลบครบทั้งไฟล์/แถว/ตาราง
5. **pluginApi ownership** — เรียกตารางของตัวเอง (ผ่าน), ตารางที่ไม่มีอยู่และ
   ตารางของปลั๊กอินอื่น (ถูกปฏิเสธด้วย "not an owned table"), คอลัมน์ที่ไม่ได้
   ประกาศไว้ (ถูกปฏิเสธด้วย "unknown column")
6. **UI** — ยืนยันผ่าน `run-dracondex` (web-driver) ว่าหน้า Setting → ปลั๊กอิน
   แสดงช่อง URL ช่องเดียว + ปุ่มตรวจสอบ และการ์ดพรีวิว escape ชื่อปลั๊กอินที่มี
   HTML แฝงมา (`<img src=x onerror=...>` ออกมาเป็นข้อความ ไม่ใช่ element)
7. การติดตั้งจาก repo สาธารณะจริงที่มี `dracondex-plugin.json` (network เต็มรูปแบบ
   ตั้งแต่ต้นจนจบ) ยังต้องตรวจสอบด้วยมือ — สภาพแวดล้อม CI ไม่มี repo แบบนั้นให้ยิง
