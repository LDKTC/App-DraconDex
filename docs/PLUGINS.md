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
  "entry": "electron/index.html", "files": ["electron/index.html", "app.js"],
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

### 1.5 Plugin panel — ปลั๊กอินที่ฝังตัวในหน้าต่างหลัก (v4.3.0)

ก่อน v4.3.0 ปลั๊กอินเปิดได้ทางเดียวคือหน้าต่างแยก ตั้งแต่ v4.3.0 ปลั๊กอิน
ประกาศ **panel** ใน manifest ได้ แล้วจะได้ปุ่มโผล่ข้างปุ่มเปิด/ปิด Module
Inspector — กดแล้วหน้าของปลั๊กอิน**เข้ามาแทนที่ Module Inspector dock**
(แพทเทิร์นเดียวกับ Version History panel)

- ปุ่มจะแสดง**เฉพาะตอนที่เปิดโมดูลอยู่** เพราะ panel เข้าไปแทน dock ของโมดูลนั้น
  ไม่มีโมดูลเปิด = ไม่มี dock ให้แทน
- panel เปิดได้ทีละอัน และ**ปิดเองเมื่อสลับโมดูล** (ไม่ค้างข้ามโมดูลเหมือน
  Version History panel ที่ยังมีบั๊กนั้นอยู่)
- panel ยัง resize/ยุบได้ด้วยปุ่มและที่จับเดิมของ Inspector
- **หน้า panel โดน reload ทุกครั้งที่หน้าต่างหลัก re-render** (เช่นแก้ tag,
  เพิ่ม attribute) เพราะ dock ถูกวาดใหม่ทั้งก้อน → **ปลั๊กอินต้องเก็บ state
  ลงตารางของตัวเองและ restore ตอนโหลด** อย่าเก็บไว้แค่ในตัวแปร

### 1.6 manifest v4.3.0 — `panels` และ `permissions`

ทั้งสองฟิลด์เป็น optional ปลั๊กอินที่เขียนก่อน v4.3.0 ใช้ได้เหมือนเดิมทุกอย่าง

```json
{
  "id": "myplugin", "name": "My Plugin", "version": "1.0.0",
  "entry": "electron/index.html",
  "files": ["electron/index.html", "panel.html", "app.js"],
  "panels": [
    { "id": "chat", "title": "My Chat", "icon": "💬", "entry": "panel.html" }
  ],
  "permissions": {
    "net": ["https://api.example.com"],
    "context": ["module"]
  }
}
```

- `panels`: ไม่เกิน 5 อัน
  - `id`: `^[a-z0-9_-]{1,24}$` ห้ามซ้ำ
  - `title`: ยาวไม่เกิน 40 ตัวอักษร (แสดงบนปุ่มและหัว panel)
  - `icon`: optional ไม่เกิน 8 ตัวอักษร (อีโมจิ) ไม่ใส่ = ใช้ไอคอนดีฟอลต์
  - `entry`: ไฟล์ `.html` และ**ต้องอยู่ใน `files`** — แอปดาวน์โหลดเฉพาะไฟล์ใน
    `files` เท่านั้น และ electron/main.js ปฏิเสธการฝัง `<webview>` ที่ชี้ไปไฟล์อื่น
- `permissions.net`: ไม่เกิน 10 รายการ ต้องเป็น **origin `https://` ล้วนๆ**
  (`https://api.example.com` ผ่าน แต่ `https://api.example.com/v1`,
  `http://…`, มี query/fragment/user:pass → ไม่ผ่าน) เหตุผลอยู่ใน §2.4
  - **ข้อยกเว้นเดียว (v4.4.0): `http://` บน loopback ที่ระบุ port ชัดเจน**
    (`http://localhost:11434`, `http://127.0.0.1:11434`, `http://[::1]:11434`)
    — เพิ่มมาเพื่อให้ปลั๊กอินประกาศ server โมเดลภาษาที่รันในเครื่อง (เช่น
    Ollama ที่ไม่มี https ให้ใช้) ได้ ต้องมี port เสมอ — `http://localhost`
    เฉยๆ ไม่ผ่าน เพราะเท่ากับขอสิทธิ์ port 80 ทั้งพอร์ต ไม่ใช่ service เดียวที่
    ตั้งใจจะประกาศ ส่วน `http://` บนโฮสต์อื่นที่ไม่ใช่ loopback ยังถูกปฏิเสธ
    เหมือนเดิมทุกกรณี — ทั้งเป็นการ downgrade เป็น plaintext และเปิดช่องทาง
    SSRF เข้า LAN ของผู้ใช้ ซึ่งผู้ใช้มองไม่เห็นจากแค่ manifest
- `permissions.context`: ตอนนี้รับค่าเดียวคือ `"module"` — ขออนุญาตรับข้อมูล
  ระบุตัวตนของโมดูลที่เปิดอยู่จากแอปหลัก (`moduleId`, `moduleName`, `kind`
  เท่านั้น ไม่มีเนื้อหา)

ทั้ง `panels` และ `permissions.net` **แสดงในการ์ดพรีวิวก่อนติดตั้ง** ผู้ใช้จึง
เห็นว่าปลั๊กอินจะฝังหน้าอะไรเข้ามาและจะยิงเน็ตไปที่ไหนบ้าง ก่อนกดยืนยัน

### 1.7 `window.pluginApi` เพิ่มเติมใน v4.3.0

```js
// เรียกเน็ต — เฉพาะ origin ที่ประกาศใน permissions.net เท่านั้น
await window.pluginApi.net.fetch(url, { method, headers, body })
//   → { ok, status, statusText, headers, body, truncated }
//   → { ok:false, code:'network'|'redirect_blocked', error }

// สตรีม (SSE) — คืนฟังก์ชัน abort()
const abort = await window.pluginApi.net.stream(url, init, {
  onChunk: (text) => {...},
  onEnd:   (res)  => {...},   // { ok, status } หรือ { ok:false, code, error }
});

// OAuth 2.0 + PKCE — แอปเปิด browser ของระบบและดักลิงก์ redirect กลับมาให้
// (หน้าเว็บของปลั๊กอินเปิด port รอเองไม่ได้) ปลั๊กอินเอา code+verifier ไป
// แลก token เองด้วย net.fetch — client secret จึงไม่ต้องผ่าน main process เลย
const { code, redirectUri, verifier, state } =
  await window.pluginApi.oauth.authorize({ authorizeUrl, clientId, scope, extraParams });

// คุยกับหน้าต่างหลัก (เฉพาะตอนรันเป็น panel)
window.pluginApi.panel.send({ type: 'getContext' });
const off = window.pluginApi.panel.onMessage((msg) => {
  if (msg.type === 'context') { /* { moduleId, moduleName, kind } หรือ null */ }
});
window.pluginApi.panel.close();   // ขอให้แอปหลักปิด panel นี้
```

ข้อจำกัดของ `net.*`: เฉพาะ `https`, method อยู่ในชุด
`GET/POST/PUT/PATCH/DELETE/HEAD`, header `Cookie`/`Host`/`Origin`/`Referer`
ถูกตัดทิ้ง, `body` ต้องเป็น string, timeout 120 วินาที, response ไม่เกิน 8MB
(เกินแล้วตัดพร้อมธง `truncated`), redirect ที่พาไป origin นอก allowlist ถูก
ปฏิเสธ และ**ไม่มี cookie jar** — `fetch` ในฝั่ง main ไม่แตะ session ของ Electron

### 1.8 Plugin dependencies — ติดตั้งปลั๊กอินอื่นไปด้วยกัน (v4.8.0)

ปลั๊กอินหนึ่งตัวประกาศได้ว่า "ต้องมีปลั๊กอินตัวอื่นติดตั้งอยู่ด้วย" ผ่าน
`dependencies` ใน manifest — เป็นลิงก์ repo แบบเดียวกับที่วางในช่องติดตั้ง
(§1.1 ทุกรูปแบบใช้ได้: `owner/repo` ย่อ, ลิงก์เต็ม, ระบุ branch ฯลฯ):

```json
{
  "id": "claude_chat", "name": "Claude Chat", "...": "...",
  "dependencies": ["https://github.com/LDKTC/DraconDex-Plugin-Native"]
}
```

- ไม่เกิน **5 รายการ** ห้ามซ้ำ repo กัน (`MAX_DEPENDENCIES` ใน `plugin-manifest.js`)
- พรีวิวก่อนติดตั้งจะโชว์บล็อก **"ติดตั้งมาด้วย"** แยกจาก panels/net — บอกชื่อ,
  `id` และว่าเครื่องนี้มีติดตั้งอยู่แล้วหรือยัง ก่อนผู้ใช้กดยืนยัน เหมือนกับ
  panels/net origins ใน §1.6
- กด **ยืนยันการติดตั้ง** ครั้งเดียว → แอปติดตั้ง dependency ที่ยังไม่มีให้ก่อน
  (ตัวที่มีอยู่แล้วข้ามเงียบๆ ไม่ error) แล้วค่อยติดตั้งปลั๊กอินที่ผู้ใช้ขอจริงๆ
  ทีหลัง — เป็นการ auto-install ผ่าน install flow เดิมทั้งหมด **ไม่มี** API ใหม่
  ให้ปลั๊กอินที่กำลังรันอยู่สั่งติดตั้งปลั๊กอินอื่นเองตอน runtime (นั่นจะเป็นการ
  เพิ่ม capability ให้หน้าต่างปลั๊กอินที่ sandbox ไม่ได้ตั้งใจให้มี)
- **ลึกแค่ชั้นเดียวโดยตั้งใจ** — ตัวติดตั้งไม่มองเข้าไปใน `dependencies` ของตัว
  dependency เอง ดังนั้น dependency chain ก่อตัวไม่ได้ และไม่มี cycle ให้ต้องกัน
- dependency ที่ resolve แล้วได้ `id` ซ้ำกับปลั๊กอินที่กำลังติดตั้งเองถูกปฏิเสธ
  (`a plugin cannot depend on its own id`) แทนที่จะเขียนทับกันเงียบๆ
- dependency ที่ล้มเหลว (resolve ไม่ได้, manifest ไม่ผ่าน, ดาวน์โหลดไม่สำเร็จ)
  ทำให้ **การติดตั้งทั้งก้อนหยุดก่อนที่ปลั๊กอินหลักจะถูกแตะเลย** — คืน
  `{ ok:false, code:'dependency_failed' }` ส่วน dependency ตัวก่อนหน้าที่ติดตั้ง
  สำเร็จไปแล้วจะ**ไม่ถูกถอนกลับ** (มันคือปลั๊กอินที่สมบูรณ์และใช้งานได้จริง
  ไม่ใช่สถานะค้างครึ่งๆ กลางๆ — ดู §2.1 ว่าทำไมถึงออกแบบแบบนี้)
- ตัวอย่างการใช้งานจริง: `DraconDex-Plugin-Claude`/`-Ollama`/`-Codex` ประกาศ
  `DraconDex-Plugin-Native` ("AI Native" — ปลั๊กอินคลังข้อมูล feature/tool ของ
  แอปแบบ public ให้ AI ปลั๊กอินตัวอื่นอ่าน) เป็น dependency ตัวเดียวกัน — ติดตั้ง
  AI chat ปลั๊กอินตัวไหนก่อนก็ได้ ตัวที่สอง/สามที่ติดตั้งตามมาจะเจอ AI Native
  ติดตั้งอยู่แล้วและข้ามไปเงียบๆ

---

## ส่วนที่ 2 — หลักการทำงาน + ข้อจำกัดด้านความปลอดภัย (สำหรับผู้พัฒนา)

### 2.1 สถาปัตยกรรม

```
Renderer (แอปหลัก, electron/src/renderer/plugin.js)        Plugin window (แยกต่างหาก)
   │ window.api.plugin.*  (preload.js)               │ window.pluginApi.table.*
   │ preview/install/list/uninstall/launch/stop        (preload-plugin.js —
   ▼                                                    ไม่มี window.api เลย)
Main process (electron/main.js)                            ▼
   │ createPluginWindow() — BrowserWindow ใหม่         pluginapi:table:* IPC
   │   ต่อปลั๊กอินที่รัน, preload: preload-plugin.js,    (raw ipcMain.handle,
   │   contextIsolation:true, nodeIntegration:false,     resolve pluginId จาก
   │   sandbox:true (ดู §2.4 ว่าทำไมนี่คือความ            BrowserWindow.
   │   ซื่อสัตย์ ไม่ใช่การอวดอ้าง)                        fromWebContents)
   ▼
electron/src/db/plugin.js       — resolveRepo/preview/install/uninstall (ไฟล์+DB),
                         pluginApiQuery/Insert/Update/Delete/GetSchema
                         (บังคับ ownership ทุกครั้ง)
electron/src/db/plugin-manifest.js — logic ล้วนๆ ไม่ require electron/db เลย:
                         validateManifest, parseRepoUrl, rawUrl
                         (แยกออกมาเพื่อให้ `node --test` เรียกตรงได้ —
                          test/plugin-url.test.mjs)
```

### 2.2 ทำไมต้องแยกระบบใหม่ทั้งหมด ไม่ใช้ของเดิม

`module.kind` มี SQL `CHECK` constraint บังคับ 15 ค่าตายตัว
(`electron/src/db/schema/ddl.js`) — SQLite ไม่รองรับการ `ALTER` constraint นี้ ปลั๊กอิน
จึงต้องมีตาราง/registry เป็นของตัวเอง (`plugin`, `plugin_table`) ไม่ใช่
kind ที่ 16

### 2.3 โมเดลความปลอดภัย — identifier whitelist

ไม่มี prepared-statement parameter ตัวไหน bind ชื่อ table/column ได้ (bind ได้
แค่ค่า value) — ดังนั้นทุก identifier ที่มาจากปลั๊กอิน (manifest's table/
column names) ต้องผ่าน regex whitelist ที่เข้มงวดก่อนถูกนำไปประกอบ SQL เสมอ
regex ทั้งชุดอยู่ใน `electron/src/db/plugin-manifest.js`:

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
(`pluginPreviewHtml` ใน `electron/src/renderer/plugin.js`) — นี่เป็นที่เดียวในแอปที่
ข้อความจากอินเทอร์เน็ตถูกวาดเป็น HTML

### 2.4 สิ่งที่ป้องกันได้ vs สิ่งที่ป้องกันไม่ได้ (ซื่อสัตย์ ไม่ใช่โฆษณา)

**ป้องกันได้:**
- หน้าต่างปลั๊กอินไม่เคยได้รับ `electron/preload.js` เลย — เข้าถึง `window.api.*`
  ไม่ได้เด็ดขาด (เป็นข้อเท็จจริงเชิงโครงสร้าง ไม่ใช่การเช็คแบบ runtime ที่ bypass
  ได้)
- แตะตารางของปลั๊กอินอื่นหรือของแอปหลักไม่ได้ — ทุกคำสั่ง `pluginApi.table.*`
  resolve ownership จาก**ตัว webContents ที่เรียกเอง** ไม่ใช่จาก argument ที่
  ปลั๊กอินส่งมา (v4.3.0: หา 2 ทางคือ `BrowserWindow.fromWebContents` สำหรับ
  หน้าต่างปลั๊กอิน และตาราง `pluginPanelContents` สำหรับ panel ที่ฝังอยู่ —
  ตารางหลังถูกเติมโดย `hardenWebviewAttach` ซึ่งตรวจ src มาแล้ว)
- รัน SQL เองไม่ได้เลย — ไม่มี raw-SQL passthrough ใน `pluginApi.*` แม้แต่จุดเดียว
- **panel ฝังหน้าอื่นไม่ได้** (v4.3.0) — `will-attach-webview` ใน `electron/main.js`
  ปฏิเสธการฝังทุกกรณีที่ src ไม่ใช่ไฟล์ `panels[].entry` ที่ปลั๊กอินซึ่งติดตั้ง
  แล้วประกาศไว้จริง เทียบ path ด้วย `path.relative` ไม่ใช่ prefix ของ string
  (กัน `<plugins>/foo-evil` ผ่านเพราะขึ้นต้นเหมือน `<plugins>/foo`) และ
  `webPreferences` ที่หน้าเว็บขอมาถูก**เขียนทับ ไม่ใช่ merge** — preload ถูก
  บังคับเป็น `electron/preload-plugin.js`, `nodeIntegration:false`, popup ถูกปิด และ
  navigate ออกนอกไฟล์ตัวเองถูกบล็อก

**ป้องกันไม่ได้ (ยอมรับเป็นข้อจำกัดที่รู้อยู่แล้ว ไม่ใช่สิ่งที่ระบบนี้อ้างว่าแก้ได้):**
- **ไม่มี OS-level Chromium sandbox จริง** — `electron/main.js` มี
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
- **`pluginApi.net.*` (v4.3.0) เพิ่มสิทธิ์ให้ปลั๊กอินจริง — ไม่ใช่แค่ความสะดวก**
  หน้าเว็บของปลั๊กอินยิงเน็ตเองได้อยู่แล้ว (มันคือหน้าเว็บ) แต่ CORS ห้ามมัน
  **อ่าน** response ข้าม origin การให้ main process ยิงแทนคือการปลดข้อห้ามนั้น
  ซึ่งเป็นการเพิ่ม capability ตรงๆ จึงบังคับ 3 อย่าง: (1) จำกัดเฉพาะ origin ที่
  ประกาศใน `permissions.net` และ**โชว์ในพรีวิวก่อนติดตั้ง** (2) เทียบแบบ origin
  ไม่ใช่ prefix — นี่คือเหตุผลที่ manifest ห้ามใส่ path ลงใน allowlist เพราะ
  prefix match จะทำให้ `https://api.example.com.evil.test` ผ่านได้ และ (3) ไม่มี
  cookie jar / จำกัด method / จำกัดขนาด / บล็อก redirect ออกนอก allowlist
  **สิ่งที่ยังป้องกันไม่ได้:** ถ้าผู้ใช้อนุมัติ origin ไหนไปแล้ว ปลั๊กอินส่งอะไร
  ไปที่นั่นก็ได้ — รวมถึงข้อมูลในตารางของตัวเอง ระบบนี้จำกัด**ปลายทาง** ไม่ได้
  จำกัด**เนื้อหา**
- **ข้อยกเว้น loopback http:// (v4.4.0) ก็เป็นการเพิ่มสิทธิ์จริง เช่นกัน — ไม่ใช่
  แค่ความสะดวก** request ที่ไปทาง `pluginApi.net.*` รันใน main process ดังนั้น
  ปลั๊กอินที่ได้รับสิทธิ์นี้เข้าถึง service บน loopback ได้ในแบบที่ sandbox ของ
  browser ปกติจะกันไว้ — รวมถึง loopback OAuth server ของแอปเอง (ตราบใดที่ port
  ไม่ตรงกัน) การบังคับให้ต้องระบุ port ชัดเจนทำให้แต่ละสิทธิ์ผูกกับ service
  เดียวที่ตั้งใจ ไม่ใช่ทุกอย่างที่ bind loopback และพรีวิวก่อนติดตั้งก็โชว์
  origin นี้เหมือน origin อื่นทุกประการ แต่ผู้ใช้ควรรู้ว่านี่คือสิทธิ์จริง
  ไม่ใช่แค่ "เข้าเครื่องตัวเอง เลยไม่เป็นไร"
- **ปลั๊กอินเก็บ credential เป็น plaintext** — ตารางของปลั๊กอินคือ SQLite ธรรมดา
  ไม่มี `safeStorage`/keytar ที่ไหนในแอปนี้ (`drive:clientSecret` ใน
  `app_setting` ก็เก็บแบบเดียวกัน) ปลั๊กอินที่เก็บ API key/token ต้องบอกผู้ใช้ตรงๆ

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
| `electron/src/db/extension.js` | `electron/src/db/plugin.js` (+ `electron/src/db/plugin-manifest.js`) |
| `electron/src/renderer/extension.js` | `electron/src/renderer/plugin.js` |
| `preload-ext.js` | `electron/preload-plugin.js` |
| IPC `extension:*` | `plugin:*` (+ ช่องใหม่ `plugin:preview`) |
| IPC `extapi:table:*` | `pluginapi:table:*` |
| `window.extApi` | `window.pluginApi` (`extApi` ยังอยู่เป็น alias) |
| ตาราง `extension` / คอลัมน์ `ext_key` | `plugin` / `plugin_key` (+ คอลัมน์ใหม่ `repo_host`) |
| ตาราง `extension_table` / `extension_ref` | `plugin_table` / `plugin_ref` |
| ตารางของแต่ละตัว `ext_<id>_<name>` | `plg_<id>_<name>` |
| โฟลเดอร์ `<dataRoot>/extensions/` | `<dataRoot>/plugins/` |

- **ฝั่ง DB**: `migratePluginV42(db)` ใน `electron/src/db/schema/migrations.js` — ต่างจาก
  migration อื่นตรงที่ **รันก่อน `db.exec(DDL_SQL)`** ใน `schema/init.js` ไม่งั้น
  `CREATE TABLE IF NOT EXISTS plugin` จะสร้างตารางเปล่าขึ้นมาข้างๆ ข้อมูลเก่า
  และต้องอยู่ใน `parts[]` ของ `schemaStamp()` ด้วย ไม่งั้น DB เดิมจะข้าม `initDB`
  ทั้งก้อนแล้วไม่เคย migrate เลย (พลาดแบบไม่มี error ให้เห็น)
- **ฝั่งดิสก์**: `migratePluginDir()` ใน `electron/src/db/plugin.js` เรียกครั้งเดียวจาก
  `electron/main.js` ตอน `app.whenReady()` — ย้าย `extensions/` → `plugins/` ถ้ายังไม่เคยย้าย
- **ปลั๊กอินเก่าไม่ต้องแก้อะไร**: `window.extApi` ยังใช้ได้ และชื่อไฟล์
  `dracondex-extension.json` ยังหาเจอ

### 2.7 การทดสอบ

1. **Manifest validator + URL parser** (`validateManifest`, `parseRepoUrl`,
   `rawUrl`) — เป็น pure function ใน `electron/src/db/plugin-manifest.js` ไม่พึ่ง Electron
   เลย มีเทสต์จริงที่ `test/plugin-url.test.mjs` (`node --test 'electron/test/*.test.mjs'`)
   ครอบคลุมลิงก์ทุกรูปแบบใน §1.1, ลิงก์ที่ต้องปฏิเสธ (โฮสต์อื่น, path traversal,
   percent-encoding, ช่องว่าง) และ fixture manifest ที่ต้องไม่ผ่าน (id ผิดรูปแบบ,
   column type ผิด, ชื่อ column สงวนไว้, มี SQL metacharacter, path traversal ใน
   `files`, ตาราง/คอลัมน์เกิน limit, `dependencies[]` ที่ไม่ใช่ URL ที่ parse ได้/
   เกิน `MAX_DEPENDENCIES`/ซ้ำ repo กัน — §1.8)
2. **migratePluginV42** — ทดสอบด้วยฐานข้อมูลรูปแบบ v4.1 จริง: แถวใน `extension`
   ย้ายมาครบ, `ext_*` ถูก rename เป็น `plg_*` พร้อมข้อมูลข้างใน, `repo_host`
   ถูก backfill, FK `ON DELETE CASCADE` ยังทำงาน, รันซ้ำแล้วไม่เปลี่ยนอะไร
3. **เส้นทางอัปเกรดเต็ม** — data dir ที่มีทั้ง DB v4.1 และโฟลเดอร์ `extensions/`
   แล้วบูต `electron/database.js` จริง: `pluginList()` คืนปลั๊กอินเดิม, `pluginApiQuery`
   อ่านข้อมูลในตารางที่ถูก rename ได้, ไฟล์ย้ายไป `plugins/` และ path ที่
   `electron/main.js` ใช้ `loadFile` ยังชี้ถูก
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
   `pluginInstall`/`pluginPreview` require `electron` ตรงๆ (ผ่าน `./core`) จึง
   เรียกจาก `node --test` ล้วนๆ ไม่ได้ **`dependencies[]` (§1.8) ตรวจแล้วด้วยมือ
   จริง (2026-08-12, `run-dracondex` web-driver)** ต่อ repo สาธารณะจริง 3 ตัว
   (`DraconDex-Plugin-Claude`/`-Ollama` ที่ branch ประกาศ `dependencies` ชี้ไป
   `DraconDex-Plugin-Native`): พรีวิวโชว์บล็อก "ติดตั้งมาด้วย" พร้อม
   `alreadyInstalled` ที่ถูกต้อง, ยืนยันครั้งเดียวติดตั้งทั้งคู่
   (`pluginList()` คืนทั้ง `claude_chat` และ dependency), ติดตั้งปลั๊กอิน AI ตัว
   ที่สอง (`ollama_chat`) แล้ว dependency ที่มีอยู่แล้วถูกข้ามจริง — ไม่มีแถวซ้ำ
   ไม่มี error
