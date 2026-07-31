# DraconDex — Doc Changelog

บันทึกทุกครั้งที่ Claude แก้โค้ดแล้วมีผลต่อพฤติกรรมของระบบ — เขียนโดยสกิล
`write-docs` (`.claude/skills/write-docs/`) แต่ละรายการอ้างอิง commit/ช่วงเวลา
พร้อมสรุปว่า **เปลี่ยนอะไร**, **ทำไม**, และ **ต้องแก้ doc ไหนบ้าง**

รูปแบบต่อรายการ:

```
## YYYY-MM-DD — หัวข้อสั้น ๆ
- commit: <sha หรือ "uncommitted">
- ไฟล์ที่แก้: path/to/file.js, path/to/other.js
- อะไรเปลี่ยน: ...
- ทำไม: ...
- Doc ที่อัปเดต: docs/SYSTEMS.md §X, docs/FILES.md §Y (หรือ "ไม่กระทบ doc")
```

รายการใหม่เพิ่มไว้ **บนสุด** (ใหม่ไปเก่า)

---

## 2026-07-31 — Part 2 v4.1.0 (จบรอบ): Workspace Styles — Dragon + Setting page, ครบทั้ง 3 style
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/dragon.js` (ใหม่ — ทั้งฟีเจอร์ Dragon),
  `src/renderer/core/workspace-style.js` (ใหม่ — Setting window → Workspace
  → หน้า "Workspace Style"), `css/workspace.css` (เพิ่ม
  `body[data-workspace="dragon"]`/`.dragon-board`/`.dragon-card`/`.wsp-*`),
  `index.html` (script tag `dragon.js`/`workspace-style.js` ใหม่),
  `src/renderer/core/state.js` (`S.dragonBrowsePath`/
  `S.settingPendingWorkspace` ใหม่, `loadUiSettings()` เพิ่ม `dragonLayout`),
  `src/renderer/core/views.js` (`renderNexusHome()` เพิ่ม branch
  `workspaceStyle==='dragon'`, `runBuilderMounts()` เรียก
  `mountDragonBoard()`), `src/renderer/builder.js` (3 guard เดิมที่เช็กแค่
  `==='wyvern'` ขยายเป็น `!=='drake'` ให้ Dragon ได้ no-tab/no-split/no-
  drag-split แบบเดียวกันโดยไม่ก็อปโค้ดซ้ำ), `src/renderer/hub/menus.js`
  (guard "เปิดใน pane ใหม่" ขยายแบบเดียวกัน), `src/renderer/core/
  setting-window.js` (`SETTING_GROUPS.workspace` เพิ่ม `'style'`),
  `src/renderer/hub/kinds.js`/`src/renderer/core/nexus.js` (clear
  `S.dragonBrowsePath` ทุกจุดที่ clear `wyvernBrowsePath` อยู่แล้ว),
  `src/renderer/i18n.js` (คีย์ใหม่ `settingPageWorkspaceStyle`/
  `workspaceStyleDrakeDesc`/`workspaceStyleWyvernDesc`/
  `workspaceStyleDragonDesc`/`settingWorkspaceApply`/
  `settingWorkspaceApplyConfirm` ครบ 18 locale), `Plan.md` (ติ๊ก 3 checkbox
  ที่เหลือของ #New Workspace ทั้งหมด)
- อะไรเปลี่ยน: เพิ่ม **Dragon** — workspace style ที่ 3 (expert/sandbox,
  ทิศทางที่ตกลงกับผู้ใช้คือ "freeform spatial canvas") คงปุ่มเครื่องมือ
  nav-sidebar ปกติไว้ (ต่างจาก Wyvern ที่ซ่อนหมด) แต่แทน left-panel Nest
  tree + split-pane Builder ด้วยบอร์ดที่ลากจัดวางการ์ด module ได้อิสระ —
  ตำแหน่งเก็บ client-only ใน `S.settings.dragonLayout` (ตัดสินใจไม่ทำ DB
  table ใหม่แบบ `designer_node` เพราะไม่มีใครขอ sync ข้ามเครื่อง) ใช้กลไก
  drill-down เดียวกับ Wyvern (`S.dragonBrowsePath`) สำหรับเจาะเข้า module
  kind `collector` ที่ไม่มีหน้า detail ของตัวเอง แต่ render แต่ละระดับเป็น
  บอร์ดลากอิสระแทน grid ตายตัว ไม่มี edge ให้ผู้ใช้ลากวาดเอง (ความสัมพันธ์
  parent/child มาจาก module tree อยู่แล้ว) เพิ่มหน้า Setting window ใหม่
  "Workspace Style" (3 mockup card วาดด้วย CSS ไม่ใช้รูป, เลือกแล้วต้องกด
  "Apply & Restart" เพราะสลับ chrome ต้องรีบูตหน้า ไม่ใช่ apply สดแบบ
  theme/language) — ทำให้ทั้ง 3 style (Drake/Wyvern/Dragon) เลือกได้จริงเป็น
  ครั้งแรก ก่อนหน้านี้มีแค่ query param `?workspace=` เท่านั้น
- ทำไม: Plan.md ส่วน `### part 2 version.4.1.0 #### New Workspace` — Wyvern
  เสร็จไปแล้วรอบก่อน เหลือ Drake ให้เลือกได้จริง/Dragon/หน้า Setting
  "workspace" ที่ยังไม่ทำ รอบนี้ปิดครบทั้ง 3 checkbox ที่เหลือ
- Doc ที่อัปเดต: docs/SYSTEMS.md §Workspace Styles (ขยายเป็น Wyvern/Drake/
  Dragon ครบ 3 style), docs/FILES.md §Workspace Styles (ตารางไฟล์ใหม่ +
  ไฟล์เดิมที่แตะ)

## 2026-07-31 — Part 2 v4.1.0 (เริ่มแรก): Workspace Styles — Wyvern
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/wyvern.js` (ใหม่), `css/workspace.css` (ใหม่),
  `index.html` (splash script อ่าน `?workspace=`, `#workspace-toolbar` div,
  script/link tag ใหม่), `src/renderer/core/state.js`
  (`WORKSPACE_STYLE_OPTIONS`, `loadUiSettings()` เพิ่ม `workspaceStyle`/
  `wyvernToolbarOrientation`, `S.wyvernBrowsePath`/`S.importDockPage` ใหม่),
  `src/renderer/core/boot.js` (`applyWorkspaceStyle()` ใหม่), `src/renderer/
  core/views.js` (`renderNexusHome()` branch ใหม่, `buildBuilderPageHtml()`
  เพิ่ม `importDockPage`), `src/renderer/builder.js` (`builderNavigate()`/
  `builderPaneHeadHtml()`/`onBodyDrop()` เพิ่ม guard เฉพาะ Wyvern),
  `src/renderer/hub/menus.js` (ซ่อน "เปิดใน pane ใหม่" ใน Wyvern),
  `src/renderer/hub/sections.js` (`goToImportDockPage()`/
  `buildImportDockPageHtml()` ใหม่), `src/renderer/hub/kinds.js`,
  `src/renderer/hub/open.js`, `src/renderer/core/nexus.js`, `src/renderer/
  mod/{fileviewer,item,sagehut}.js` (clear `S.importDockPage` ที่จุดเดิม),
  `src/renderer/i18n.js` (คีย์ `wyvernViewSet` ใหม่ครบ 18 locale), `Plan.md`
  (ติ๊ก "Standard workspace: Wyvern")
- อะไรเปลี่ยน: เพิ่ม workspace style ใหม่ **Wyvern** (newcomer/simple —
  toolbar แนวตั้ง + drill-down browsing แทน left-panel tree, ไม่มี split
  pane, ไม่ auto-tab) เลือกได้ผ่าน `S.settings.workspaceStyle`/`?workspace=`
  — ยังไม่มี UI จริงให้กด (รอ Setting window "workspace" page รอบถัดไป)
  Drake (ค่าเริ่มต้น) ยืนยันแล้วว่าไม่มี regression จากการเพิ่ม guard นี้
- ทำไม: Plan.md ส่วน `### part 2 version.4.1.0 #### New Workspace` — 1 ใน 3
  workspace style ที่ต้องการ, สเปกจาก `featureplan.md` ที่เขียนไว้ก่อนหน้า
- Doc ที่อัปเดต: docs/SYSTEMS.md §Workspace Styles — Wyvern (ใหม่),
  docs/FILES.md §Workspace Styles (ใหม่)

## 2026-07-30 — Part 1 v4.0.0: Setting (Quick Setting popup + Setting window เต็มรูปแบบ)
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/core/settings.js` (ตัด `renderSettingsMenu()`
  เหลือ 4 อย่าง, ลบ `PREFS_SECTIONS`/`openPreferencesPanel`/`prefsBodyHtml`/
  theme-grid/language-preview/ui-size-advanced ทั้งหมด), `src/renderer/core/
  setting-window.js` (ใหม่ — เชลล์ Setting window 2 ชั้น + หน้า
  Theme/Text&Size), `src/renderer/core/tool-toggle.js` (ใหม่ — หน้า Tool
  toggle + `applyNavToggles()`), `src/renderer/core/account.js` (ใหม่ — หน้า
  Account/User profile), `src/renderer/core/db-transfer.js` (ใหม่ — หน้า
  Database), `src/db/db-transfer.js` (ใหม่ — export/import ระดับ
  nexus/module), `src/db/sync.js` (`serializeVault` เพิ่ม param `moduleIds`,
  `collectModuleSubtreeIds` ใหม่, แยก `applySnapshotCore` ออกจาก
  `applySnapshot` แล้วเพิ่ม `importModuleSnapshot` ใหม่), `src/db/drive.js`
  (layout-slot ops ใหม่ 4 ตัว + `driveGetBackupLog()`), `src/renderer/
  drive.js` (`prefsBackupSectionHtml`→`settingBackupPageHtml` + ประวัติการ
  สำรองข้อมูล), `src/renderer/extension.js`
  (`prefsExtensionSectionHtml`→`settingExtensionPageHtml` + ปุ่ม Stop + หน้า
  Extension setting), `src/renderer/sync.js` (`settingTokenSyncPageHtml`
  ใหม่), `src/renderer/core/state.js` (`loadUiSettings()` เพิ่ม default
  `quickExtras`/`navToggles`/`statusToggles`), `src/renderer/core/boot.js`
  (`applyNavToggles()`/`applyAreaScales()`), `src/renderer/core/router.js`
  (`updateStatusBar()` gate ด้วย `statusToggles`), `main.js`/`preload.js`
  (`db:export/importNexusFile`/`export/importModuleFile`,
  `drive:listLayoutSlots`/`saveLayoutSlot`/`restoreLayoutSlot`/
  `deleteLayoutSlot`/`getBackupLog`), `database.js`, `index.html` (script tag
  4 ไฟล์ใหม่), `css/nav-hub.css` (`.tool-toggle-hidden`), `css/
  components.css` (`.setting-shell`/`.setting-sidebar`/`.setting-nav-*`),
  `src/renderer/i18n.js` (คีย์ `setting*` ใหม่ 51 คีย์ครบ 18 locale),
  `test/module-transfer.test.mjs` (ใหม่), `Plan.md` (ติ๊ก checkbox หมวด
  Setting ทั้งหมด)
- อะไรเปลี่ยน: Quick Setting popup ตัดเหลือแค่ 4 อย่างตาม Plan.md (ภาษา/
  name-mode/ขนาด UI/ปุ่มเปิดการตั้งค่า) แทนที่ Preferences panel เดิมด้วย
  Setting window เต็มรูปแบบ 2 ชั้น (Workspace/User/Appdata/Extension × หน้า
  ย่อย) — Tool toggle คุมว่าอะไรโชว์กลับมาที่ popup/nav sidebar/status bar
  ได้ Account/User profile ใหม่ (layout slot หลายอันเก็บใน Drive appdata
  แยกไฟล์จาก auto-backup) Database ใหม่ (export/import ทั้งระดับ nexus และ
  ระดับ module เดี่ยว reuse snapshot format จาก Token Sync)
- ทำไม: Plan.md ส่วน `#### Setting` (Part 1 v4.0.0) — Cloud Sync Function
  เสร็จแล้วก่อนหน้านี้ Setting เป็นรายการถัดไปที่ยังไม่ทำ
- Doc ที่อัปเดต: docs/SYSTEMS.md §Setting Window (ใหม่) + แก้อ้างอิง
  Preferences panel เดิมในหัวข้อ Google Drive Backup, docs/FILES.md
  §Setting Window (ใหม่) + แก้แถว `sync.js`/`drive.js` + แก้ "ไฟล์เดิมที่แตะ"
  ของ Drive/Extension, docs/DRIVE.md (§1.3b layout slot ใหม่, §2.5 แก้),
  docs/EXTENSIONS.md (§1.2 ปุ่ม Stop, §1.2b Extension setting ใหม่)

## 2026-07-30 — Part 1 v4.0.0: Cloud Sync Function — Github (sandboxed extensions)
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/extension.js` (ใหม่), `preload-ext.js` (ใหม่, repo root),
  `src/db/schema/ddl.js` (ตาราง `extension`/`extension_table`), `main.js`
  (createExtensionWindow, extensionWindows map, `extension:*` +
  `extapi:table:*` IPC), `preload.js` (`extension:*` เท่านั้น — ไม่แตะ
  `extApi`), `database.js`, `src/renderer/extension.js` (ใหม่),
  `src/renderer/core/settings.js` (`PREFS_SECTIONS` +`'extension'`),
  `package.json` (`build.files` +`preload-ext.js`), `src/renderer/i18n.js`
  (18 locale), `.claude/skills/dracondex-file-arch/check-arch.mjs`
  (`ROOT_FILES` +`preload-ext.js`)
- อะไรเปลี่ยน: เพิ่มระบบดาวน์โหลด "extension" จาก GitHub repo (ต้องมี
  `dracondex-extension.json` manifest ที่ root) — แต่ละ extension ประกาศตาราง
  ฐานข้อมูลของตัวเอง (`ext_<id>_<name>`, คอลัมน์ TEXT/INTEGER/REAL เท่านั้น)
  และรันในหน้าต่าง `BrowserWindow` แยกต่างหากที่ได้ preload คนละไฟล์
  (`preload-ext.js`) ไม่มี `window.api` เลย — เข้าถึงข้อมูลได้แค่ผ่าน
  `window.extApi.table.*` ที่ผูก ownership กับตัวหน้าต่างเอง (ไม่ใช่จาก argument)
  ก่อนรัน SQL ทุกครั้ง ไม่มี raw-SQL passthrough ใดๆ; ระบุ identifier
  whitelist ใหม่ทั้งหมด (ไม่มี pattern เดิมให้ใช้ซ้ำ) เพราะไม่มี prepared-
  statement parameter ตัวไหน bind ชื่อ table/column ได้
- ทำไม: Plan.md part 1 v4.0.0 "Cloud Sync Function > Github" ระบุให้ดาวน์โหลด
  extension จาก GitHub ที่ขยายตาราง database ของตัวเองได้ — ผู้ใช้เลือกทำแบบ
  sandboxed plugin runtime จริงจัง (ไม่ใช่ stub, ไม่ใช่รันแบบเต็มสิทธิ์) หลังจาก
  พบว่า `contextIsolation` ของหน้าต่างหลักป้องกันแค่การเข้าถึง Node/Electron
  โดยตรง ไม่ได้ sandbox สคริปต์หนึ่งจากอีกสคริปต์ในหน้าเดียวกัน — extension ที่
  โหลดแบบไม่แยกหน้าต่างจะมีสิทธิ์เท่ากับตัวแอปเอง (อ่าน/เขียน/ลบได้ทุก Nexus)
- ข้อจำกัดที่ยอมรับไว้ (ไม่ใช่สิ่งที่ plan นี้อ้างว่าแก้): ไม่มี OS-level Chromium
  sandbox จริง เพราะ `main.js` ตั้ง `--no-sandbox` ทั้งโปรเซสไว้ก่อนหน้านี้แล้ว
  (เพื่อ portable build) — ทุกหน้าต่างรวมถึงหน้าต่าง extension ได้รับผลกระทบ
  เหมือนกัน; ไม่มีการตรวจสอบ/code review โค้ดจาก GitHub ก่อนติดตั้ง
- Doc ที่อัปเดต: docs/EXTENSIONS.md (ใหม่ทั้งไฟล์)

---

## 2026-07-30 — Part 1 v4.0.0: Cloud Sync Function — Firebase (version notice)
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/update.js` (ใหม่), `main.js`, `preload.js`,
  `database.js`, `src/renderer/update.js` (ใหม่),
  `src/renderer/core/boot.js`, `index.html`, `src/renderer/i18n.js`
  (18 locale)
- อะไรเปลี่ยน: เพิ่มการแจ้งเตือนเมื่อมีเวอร์ชันใหม่ — อ่านเอกสาร Firestore
  สาธารณะ 1 ชิ้น (`public_config/latest_version`, ไม่ต้องใช้ credential)
  เทียบเวอร์ชันแบบง่าย (ตัด `-n` suffix ก่อนเทียบ) ให้เฉพาะผู้ใช้ที่ login เข้า
  Cloud Sync (Supabase) หรือ Google Drive Backup อย่างใดอย่างหนึ่ง — **ไม่ใช่
  auto-updater** ไม่มีการติดตั้งอัตโนมัติ แค่แจ้งเตือน + ปุ่มเปิดหน้าดาวน์โหลด
  ในเบราว์เซอร์; จำ "เวอร์ชันที่เพิ่งเตือนไปแล้ว" ไว้ไม่ให้เตือนซ้ำ
- ทำไม: Plan.md part 1 v4.0.0 "Cloud Sync Function > Firebase" ระบุสเปกนี้
  ตรงๆ — ขอบเขตจำกัดเฉพาะแจ้งเตือน+ลิงก์ดาวน์โหลดตามที่ผู้ใช้ยืนยัน เพราะแอปนี้
  ไม่มี publish/release pipeline อยู่แล้ว (ไม่มี electron-updater, ไม่มี
  GitHub Releases/tag ใช้งานจริง)
- Doc ที่อัปเดต: docs/UPDATE.md (ใหม่ทั้งไฟล์)

---

## 2026-07-30 — Part 1 v4.0.0: Cloud Sync Function — Google Drive Backup
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/oauth-loopback.js` (ใหม่, ดึงออกจาก `sync.js`),
  `src/db/drive.js` (ใหม่), `src/db/drive-devserver.js` (ใหม่),
  `src/db/sync.js` (refactor ใช้ helper ร่วม, ไม่เปลี่ยนพฤติกรรม), `main.js`,
  `preload.js`, `database.js`, `index.html`, `src/renderer/drive.js` (ใหม่),
  `src/renderer/core/settings.js`, `src/renderer/core/boot.js`,
  `css/builder.css`, `src/renderer/i18n.js` (18 locale)
- อะไรเปลี่ยน: เพิ่มฟีเจอร์สำรองข้อมูลผ่าน Google Drive appdata folder — สำรอง
  "layout profile" (ธีม/ภาษา/ขนาด UI จาก localStorage) และ/หรือไฟล์ฐานข้อมูล
  .ddx (reuse `exportDatabaseTo`/`importDatabaseMerge` เดิมทั้งหมด) แบบ opt-in
  อิสระต่อกัน; login Google **แยกอิสระ** จาก Cloud Sync (Supabase) — คุย
  Google โดยตรง ไม่ผ่าน Supabase relay; auto-backup ทุก 1 ชั่วโมง (timer อยู่
  ฝั่ง renderer); แถบสถานะพื้นที่ Drive เตือน/บล็อกเมื่อใกล้เต็ม/เต็ม; เพิ่มแท็บ
  "สำรองข้อมูล" ใหม่ใน Preferences panel เดิม (ไม่ได้สร้าง Settings Window
  เต็มรูปแบบ — ส่วนนั้นยังไม่ทำในรอบนี้)
- ทำไม: Plan.md part 1 v4.0.0 "Cloud Sync Function > Google" ระบุสเปกนี้ตรงๆ
  (backup ผ่าน Drive appdata, layout profile, .ddx, ทั้งคู่ "หากผู้ใช้ต้องการ")
  — ขอบเขตจำกัดเฉพาะ Google Drive ตามที่ผู้ใช้ยืนยัน (Firebase update-check /
  GitHub extension เป็นแผนแยกในอนาคต); เลือก login แยกจาก Supabase เพราะวิจัย
  พบว่า Supabase Auth ไม่รีเฟรช provider token ให้เอง ทำให้การ bundle เข้ากับ
  login เดิมไม่ได้ประหยัดอะไรแต่กลับบังคับผู้ใช้ Cloud Sync ทุกคนยินยอมสิทธิ์
  Drive ที่ไม่ได้ขอ
- Doc ที่อัปเดต: docs/DRIVE.md (ใหม่ทั้งไฟล์), docs/SYSTEMS.md §Cloud Sync —
  Google Drive Backup, docs/FILES.md §Google Drive Backup

---

## 2026-07-30 — Part 1 v4.0.0: Cloud Sync → Token Sync (Supabase)
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/sync.js`, `src/db/sync-devserver.js`,
  `supabase/migrations/20260730000000_dracondex_token_sync.sql` (ใหม่),
  `src/renderer/sync.js`, `main.js`, `preload.js`, `css/builder.css`,
  `src/renderer/i18n.js` (18 locale)
- อะไรเปลี่ยน: แทนที่ระบบคีย์เข้าถึงถาวรเดิม (access-key prototype, v3.8.0)
  ด้วยระบบโทเคน 16 หลักที่สร้างใหม่ทุกครั้งที่ push; เพิ่ม login Google
  ผ่าน Supabase Auth (PKCE + loopback redirect) เป็นเงื่อนไขก่อนอัปโหลดได้;
  เพิ่ม quota ช่องอัปโหลดตาม tier บัญชี (`sync_account.tier`: free 1 ช่อง/
  10MB, pro 3 ช่อง/20MB — ระหว่างทำแผนผู้ใช้เปลี่ยนสเปกจาก "20MB ทุกบัญชี"
  เป็นสองระดับนี้กลางคัน); เพิ่มรหัสผ่านต่อช่องอัปโหลด (ไม่บังคับ, แฮชด้วย
  `pgcrypto`, ข้ามได้เมื่อบัญชีที่ดึงตรงกับบัญชีที่อัปโหลด, ผิด 8 ครั้งล็อก
  15 นาที); เพิ่มวันหมดอายุ 72 ชม.ต่อช่อง (ตรวจแบบ check-on-read); ยกเลิก
  โมเดล owner/read-key เดิมทั้งหมด (ตาราง `sync_key` + RPC ที่เกี่ยวข้องถูก
  drop) เพราะบัญชี Google ทำหน้าที่ยืนยันตัวตนแทน
- ทำไม: Plan.md part 1 v4.0.0 "Cloud Sync Function > Supabase" ระบุสเปกนี้
  ตรง ๆ (โทเคนใหม่ทุกครั้ง, ขนาด/อายุจำกัด, ต้อง login ก่อนอัปโหลด, quota
  ต่อบัญชี, รหัสผ่านล็อก) — ขอบเขตจำกัดเฉพาะ Supabase ตามที่ผู้ใช้ยืนยัน
  (Google Drive backup/Firebase update-check/GitHub extension เป็นแผนแยก
  ในอนาคต)
- Doc ที่อัปเดต: docs/SYNC.md (เขียนใหม่ทั้งไฟล์), docs/SYSTEMS.md
  §Cloud Sync, docs/FILES.md §Cloud Sync (Supabase)

---

## 2026-07-26 — Part 1 (Plan ใหม่): Re-architecture แยกไฟล์ + สกิล dracondex-file-arch
- commit: d0b74d6, 81c3a12, 4884e87, bd51eb4
- ไฟล์ที่แก้: `style.css` → `css/` 14 ไฟล์, `src/renderer/core.js` → `core/` 12 ไฟล์,
  `src/db/core.js` → `conn.js` + `schema/` 5 ไฟล์ + `import-merge.js` + façade,
  `src/renderer/hub.js` → `hub/` 7 ไฟล์, `navigator.js` → `navigator/` 9 ไฟล์,
  `hero.js` → `hero/` 6 ไฟล์, `index.html`, `package.json`,
  `src/renderer/{map,relation,mod/viewer}.js`, `test/onboarding-tour.test.mjs`,
  `.claude/skills/dracondex-module-style/check.mjs`,
  `.claude/skills/dracondex-file-arch/` (ใหม่)
- อะไรเปลี่ยน:
  - แยกไฟล์ใหญ่ 6 ไฟล์ (3159/2642/2532/1807/1301/1088 บรรทัด) ตามเกณฑ์ใน
    `Plan.md` **ทุกไฟล์ใหม่เป็นการตัดช่วงบรรทัดต่อเนื่องแบบคำต่อคำ** และเรียง
    ลำดับโหลดตามเดิม → ต่อกลับได้ byte ต่อ byte (พิสูจน์ด้วยสคริปต์) ลำดับ
    cascade ของ CSS และลำดับ evaluate ของ classic script จึงไม่เปลี่ยน
  - `src/db/core.js` เหลือเป็น façade re-export 5 ชื่อเดิม (ไฟล์อื่น ~29 ไฟล์
    ที่ `require('./core')` ไม่ต้องแก้), `initDB()` → `initDB(db)`,
    แก้ byte NUL/`\x01` จริงในซอร์สเป็น escape (git เคยมองไฟล์นี้เป็น binary),
    CRLF → LF
  - `navigator/` + `hero/` โหลดแบบกลุ่มผ่าน `LAZY_GROUPS` + `loadGroup()`
    (`core/views.js`) เพราะ `<script>` ที่แทรกทีหลังเป็น async ไม่มีลำดับ
  - สกิลใหม่ `dracondex-file-arch` (SKILL.md + `check-arch.mjs`): รายงานแถบ
    ขนาดไฟล์ตาม Plan.md + สัญญาณ "หลายหน้าที่", และ **error** เมื่อ wiring พัง
    (ไฟล์ renderer ที่ไม่มีใครโหลด, ชื่อ top-level ซ้ำข้ามไฟล์, CSS ที่ไม่ถูก
    `<link>` / `url()` ที่ลืม `../`, `build.files` ไม่ครอบคลุม, ไฟล์ db ที่
    `database.js` เข้าไม่ถึง)
  - `check.mjs` เดิมถูกชี้ไปที่ layout ใหม่ (รวม `css/*.css`, รวม
    `core/*.js`, และ **เดินโฟลเดอร์แบบ recursive** — เดิมข้าม `mod/` ทั้งหมด
    จึงเป็นเหตุผลที่ warning ขยับ 31 → 55 โดยไม่ใช่โค้ดใหม่)
- บั๊กที่เจอและแก้ระหว่างทาง (ทั้งหมดมีอยู่ก่อนแล้ว ยกเว้นข้อแรก):
  - `url('Image/…')` ใน CSS ที่ย้ายเข้า `css/` กลายเป็น 404 (url อ้างจากตัวไฟล์
    CSS ไม่ใช่จาก `index.html`) — แก้เป็น `../Image/…` ทั้ง 33 จุด
  - `flattenModuleTree` ถูกประกาศ**คนละแบบ** ใน `hub/menus.js` (recursive, 3
    args) กับ `mod/viewer.js` (flat, 0 args) — viewer โหลดทีหลังจึงชนะ ทำให้
    เมนู "ย้ายไปยัง…" ของ Nest row โยน TypeError (ยืนยันจริงในแอปก่อน/หลังแก้);
    เปลี่ยนชื่อฝั่ง viewer เป็น `flattenModulesForFilter`
  - `ensureKonva` ถูกก็อปทั้งก้อนไว้ทั้ง `map.js` และ `relation.js` ทั้งที่มี
    อีก 4 โมดูล lazy เรียกใช้ — ย้ายไปไว้ที่เดียวแบบ eager ใน `core/views.js`
  - `autoExpand` ซ้ำใน `map.js` (ไม่มีใครเรียก — dead code) กับ `timeline.js`
- ทำไม: `Plan.md` part 1 — ไฟล์ใหญ่หลายไฟล์ถือหลายหน้าที่พร้อมกัน หาโค้ดยาก
  และแก้ทีหนึ่งเสี่ยงชนกันเอง; ต้องมีตัวตรวจถาวรกันไม่ให้ย้อนกลับไปโตแบบเดิม
- Doc ที่อัปเดต: docs/FILES.md (§Re-architecture ใหม่ + ตัวชี้ที่ core/navigator/
  hero), docs/Architec.md §1.2/§ชั้นระบบ/§4, docs/SYSTEMS.md (path ธีม +
  openImportDbHub), CLAUDE.md (repo layout, ตารางสกิล, คำสั่งตรวจ)

## 2026-07-26 — Part 2: backend efficiency (ผิวสัมผัส IPC + call site ฝั่ง renderer)
- commit: uncommitted
- ไฟล์ที่แก้: `main.js`, `preload.js`, `src/db/module.js`,
  `src/db/classifier.js`, `src/db/sage.js`, `src/db/wiki.js`,
  `src/renderer/core.js`, `src/renderer/hub.js`, `src/renderer/inspector.js`,
  `src/renderer/mod/classifier.js`, `src/renderer/mod/manager.js`,
  `src/renderer/mod/sagehut.js`, `src/renderer/mod/fileviewer.js`
- อะไรเปลี่ยน:
  - **#2.1 batch IPC** — `classifier:getObjectsFull` รวม object+template+
    attribute+private template ของทั้งโมดูลเป็นคำเรียกเดียว (เดิม 4+2N โดย N =
    จำนวน object: `getAttrs`+`getObjectTemplates` ต่อ object) และประกอบ
    `attrMap`/`conditionMap`/`privateTemplates` ให้เสร็จฝั่ง db;
    `module:getInspector` รวม 4 read ของ Inspector เป็นก้อนเดียว (คีย์
    `{attrs,tags,links,ui}` เท่าเดิม เพราะมีที่อื่นอ่าน/แก้ `S.inspectorData`
    ตรงๆ); `module:getAttrCounts` นับ attribute ของ Minor ทุกตัวด้วย GROUP BY
    เดียว (เดิม Manager ดึง attribute เต็มของลูกทุกตัวมาเพื่ออ่าน `.length`)
  - **#2.2 `ddx-file://`** — display image ชี้ `<img src>` ไป protocol ตรงๆ
    (0 IPC) แทน base64 ผ่าน bridge; handler พก **row id ไม่ใช่ path** และเสิร์ฟ
    เฉพาะ row ที่เป็นรูปจริง (ไฟล์ import ไม่ถูกคัดลอกเข้า data dir จึงไม่มี
    prefix ให้ sandbox); ทางสำรอง `<img onerror>` รวมเป็น `importdock:readFiles`
    ครั้งเดียวสำหรับ renderer ที่ไม่มี protocol
  - **#2.3 Sage Hut** — ดึงเฉพาะ payload ที่แท็บนั้นใช้ + memo ต่อ nexus
    (`S.sageHutCache`); ยุบ query `LENGTH(description)` ต่อโมดูลที่ `prepare()`
    ซ้ำใน loop เข้าไปเป็นคอลัมน์ของคิวรีรายชื่อโมดูลที่ดึงอยู่แล้ว
  - **#2.4 `wiki.js`** — `rebuildWikiIndex`/`resolveDanglingLinks` ห่อ
    transaction เดียว (เดิม R แถว = R BEGIN/COMMIT); memo `resolveWikiName`
    เฉพาะช่วง bulk; `resolveEntityKeys` เปลี่ยนเป็น `IN` ต่อ entity type
    (arity คงที่ 64 + pad ด้วย id ซ้ำ เพื่อไม่ให้ statement cache แตกเป็นหลายรูป)
    โดยยังรักษาลำดับ input ที่ UI ใช้แสดง backlink
  - **#2.5 nest render storm** — `module:getNestItems` คืน content item ของทุก
    โมดูลในวอลต์ในคำเรียกเดียว (แถวบางเฉพาะคอลัมน์ที่ `nameOf` ใช้) เติมเข้า
    `S.nestItems` ตั้งแต่ตอนโหลด tree ทั้งใน `reloadModuleTree`, boot wave และ
    `selectNexus` — จึงไม่มี lazy fetch + full re-render ทีละโมดูลอีก;
    `scheduleNestRender()` รวบ re-render จาก path async เป็นครั้งเดียวต่อ
    microtask; `module:getItemCounts`/`getContentItemCounts`/`S.moduleItemCounts`
    ถูกลบเพราะนับจาก `.length` ได้แล้ว
- ทำไม: part 1 แก้ชั้นข้อมูลไปแล้ว แต่ renderer ยังยิงหนึ่ง IPC round-trip ต่อ
  หนึ่งแถวในหลาย hot path — แต่ละ round-trip เสียทั้ง structured-clone hop และ
  lock cycle ของ statement ฝั่ง main. วัดจริงด้วยการ hook `ipcMain` แล้วขับแอป
  บนวอลต์ตัวอย่างเดียวกันก่อน/หลัง: โหลด nest tree 10 IPC + 6 render → 2 + 1,
  เปิด classifier 12 object 34 → 6, คลิกครบ 4 แท็บ Sage Hut 12 → 3, รูป display
  image K รูป K → 0, สร้าง/ลบ object 35 IPC → 7
- แถมที่แก้ระหว่างทาง (บั๊กจริง ไม่ใช่แค่ perf): `S.displayImageData` ไม่เคยถูก
  ล้าง (จุด invalidate ล้างแต่ `S.displayImageCache`) ทำให้รูปที่ถูกแทนที่บน
  ดิสก์ค้างทั้ง session + blob สะสม; และ guard `if (protocol)` ใน `main.js`
  เพราะ web-driver harness โหลดไฟล์นี้โดย stub Electron shell ทิ้ง — ถ้าไม่ guard
  เครื่องมือ verify ทั้งตัวจะพังทันที
- Doc ที่อัปเดต: docs/SYSTEMS.md §2c, §10 (หัวข้อใหม่ "ประสิทธิภาพ IPC" +
  "รูป display image ผ่าน ddx-file://"), docs/FILES.md (main.js, src/db/module.js,
  classifier.js, sage.js, wiki.js, src/renderer/hub.js, inspector.js,
  mod/sagehut.js, mod/fileviewer.js)

## 2026-07-25 — หน้า Loading (boot splash) + progress bar ตอนเปิดแอพ
- commit: uncommitted
- ไฟล์ที่แก้: `index.html`, `style.css`, `src/renderer/core.js`,
  `src/renderer/search.js`
- อะไรเปลี่ยน:
  - **`index.html`** — เพิ่ม `#splash` (logo + `#splash-track`/`#splash-fill` +
    `#splash-pct`) เป็นบล็อกแรกใน `<body>` พร้อม inline `<script>` ที่ (ก) ตั้ง
    `body[data-theme]` จาก `localStorage` ทันทีก่อนเฟรมแรก (ข) นิยาม
    `window.__splash` = `set(pct)`/`finish()` + watchdog 20 วิ; แทรก
    `__splash.set(N)` คั่นระหว่าง `<script src>` ที่ 15/35/50/55%
  - **`style.css`** — บล็อก `#splash*` ใหม่ (วางถัดจาก `.busy-veil`) ใช้ token
    ล้วน: `--bg`, `--raised`, `var(--button, var(--accent))`, `--t3`, `--rs`,
    `--sp-7`, `--fs-xs`; `z-index:2000` เหนือทุก overlay (สูงสุดเดิมคือ
    `#guide-overlay` ที่ 1200); มี `prefers-reduced-motion` ปิด transition
  - **`core.js`** — `__splash?.set()` 4 จุดใน `init()` (60/80/88/95) แล้ว
    `finish()` ท้ายสุดหลัง `bindSearch()`
  - **`search.js`** — `init()` → `init().catch(...)` เรียก `finish()` เมื่อ throw
  - logo ใช้คลาส `.brand-img` เดิมซ้ำ จึงได้ภาพสลับตามธีมทั้ง 32 ธีมฟรี
    ไม่ต้องเพิ่มไฟล์ภาพใหม่ และไม่มีข้อความแปลภาษาบน splash เลย (มีแค่ logo/
    แถบ/ตัวเลข %) จึงไม่ต้องเพิ่ม key ใน 18 locale
- ทำไม: เปิดแอพแล้วเห็นจอดำนิ่งหลายวินาที แยกไม่ออกว่าค้างหรือกำลังโหลด —
  ต้นเหตุคือหน้าต่างโผล่ทันที (ไม่มี `show:false`/`ready-to-show`) แต่กว่า
  `<script src>` 30 ตัว (~700KB) จะ parse ครบและ `init()` จะเปิด SQLite +
  รัน migration เสร็จ ก็กินเวลาจริง; ผู้ใช้ธีมสว่างยังโดนจอวาบดำเพิ่มเพราะ
  `applyUiSettings()` (ตัวตั้งธีม) รันหลังโหลด JS ครบแล้วเท่านั้น
- ตรวจสอบแล้ว (ขับแอพจริงด้วย `run-dracondex`): splash เรนเดอร์กลางจอถูกต้อง
  และถูก `remove()` ออกจาก DOM หลังโหลดเสร็จ (`getElementById('splash')` → `null`);
  ธีม `daylight` — พิสูจน์แยกว่า inline bootstrap เป็นตัวตั้งธีมจริง โดยปิด
  บรรทัด `data-theme` ใน `applyUiSettings()` ชั่วคราวแล้วยังได้พื้น `#f4f6fb`
  + logo สลับเป็น `WhiteIn.png`; ทดสอบให้ `init()` throw กลางคัน → splash ยัง
  ถูกปลดและหน้าจอคลิกได้; `check.mjs` = 0 error และไม่มี warning ใหม่
- Doc ที่อัปเดต: docs/SYSTEMS.md §10 (หัวข้อใหม่ "หน้า Loading ตอนเปิดแอพ"),
  docs/FILES.md (index.html, search.js)

## 2026-07-25 — UI/UX pass: แก้ข้อบกพร่องการโต้ตอบ + วางระบบ design token / ตัวอักษรไทย
- commit: uncommitted
- ไฟล์ที่แก้: `style.css`, `src/renderer/core.js`, `src/renderer/search.js`,
  `src/renderer/quickswitch.js`, `src/renderer/hub.js`, `src/renderer/i18n.js`,
  `main.js`, `preload.js`, `index.html`, + 15 ไฟล์ renderer ที่โดน `--fsc` sweep
- อะไรเปลี่ยน:
  - **Part 1 — ข้อบกพร่องการโต้ตอบ**
    - `toast()`: map `'error'→'err'`, `'success'→'ok'` — 20 จุดที่ส่ง `'error'`
      ไม่เคยตรงกฎ CSS ไหนเลย ข้อความ error จึงแสดงเป็นสีเทาแยกจาก success ไม่ออก;
      `#toast` เพิ่ม `role=status`/`aria-live`
    - `bindModalEscape()`: modal หลักปิดด้วย Escape ได้แล้ว (เป็น overlay เดียว
      ในแอปที่ไม่มี) มี guard กัน `#confirm-overlay`/`#qs-overlay`/`#guide-overlay`
      และกัน welcome modal ที่บังคับให้เลือก; `openModal()` โฟกัส field แรกให้เอง
    - **บั๊กที่เจอตอนทดสอบจริง**: `uiConfirm` ไม่ได้ `stopPropagation()` ทำให้กด
      Escape ครั้งเดียวปิดทั้ง confirm และ modal ข้างล่าง (เพราะ `finish()` ลบ
      overlay ทันที guard เลยมองไม่เห็น) — แก้ที่ต้นเหตุให้เหมือน guide/quickswitch
    - `uiPrompt()` แทน native `prompt()` ที่ `importCustomPalette` (บั๊ก renderer
      ค้างแบบเดียวกับที่ `uiConfirm` เกิดมาแก้) — สร้างบน `#confirm-overlay`
      เพราะ `#modal-overlay` z-index 100 ต่ำกว่า `.floating-panel` 150
    - ใส่ `uiConfirm()` ให้การลบ 7 จุดที่เดิมลบทันที (ยกเว้นเครื่องมือ delete
      บนแผนที่ ที่คลิกเดียวลบโดยตั้งใจ)
    - ช่องค้นหา sidebar: เมื่อมี Nexus เปิดอยู่ให้ส่งต่อ `openQuickSwitcher(seed)`
      แทน — เดิมเขียนทับ `#left-panel-inner` ซึ่ง**คือ Nexus Nest tree** พิมพ์
      ค้นหาทีเดียวต้นไม้โมดูลหายทั้งแถบ และยังค้นไม่เจอโมดูล v3 เลย;
      placeholder เพิ่ม `(Ctrl+P)` (Quick Switcher เดิมไม่มีทางเข้าที่มองเห็นได้)
    - เมนูเฟืองเพิ่มหมวด "ช่วยเหลือ": ตารางคีย์ลัด + เล่นทัวร์ซ้ำ
    - empty state ของ Nest/kind-browser มีปุ่มสร้าง Major module แล้ว
    - `setBusy()` + `.busy-veil` ที่ `openModuleNode`, `chooseImportAsNexusNest`
    - แยก IPC `db:importFileMerge` → `db:pickImportFile` + `db:importMergeFile`
      เพื่อให้ถามยืนยัน**หลัง**เลือกไฟล์ได้จริง (เดิมช่องเดียว merge จบไปแล้ว)
  - **Part 2 — ระบบภาพ (surgical, หน้าตาเดิม)**
    - `:root` เพิ่ม `--fsc` (ถูกอ้าง 300+ ครั้งแต่ไม่เคยประกาศ), token สเกลใหม่
      (`--sp-*`, `--fs-*`, `--lh-*`, `--shadow-*`, `--mono`) สำหรับโค้ดใหม่
      **ไม่ retrofit** px เดิม ~2,200 จุด; ลบ `--bg3` ที่ไม่มีใครใช้
    - แทน `box-shadow` ที่ซ้ำเป๊ะ 12 จุดด้วย token (เว้น 4 จุดที่ค่าใกล้แต่ไม่ตรง
      — รวมเข้าไปจะเป็นการเปลี่ยนหน้าตา)
    - `--on-accent`/`--on-button`/`--on-danger`: แทน `#fff` ที่ hardcode 28 จุด
      (ค่า default `#fff` → คำนวณแล้วเหมือนเดิมทุกธีม) แล้ว override เป็น
      `--ink-dark` ใน 15 ธีม (accent) / 12 ธีม (button) ตาม WCAG 3:1;
      2 จุดเป็น**บั๊กจริง** (ตัวอักษรขาวบนพื้น `var(--hover)` มองไม่เห็นใน 8 ธีมสว่าง);
      ลบแพตช์เฉพาะจุดของ `blueEclipse` ที่ซ้ำซ้อนแล้ว
    - ตัวอักษรไทย: เพิ่ม `'Leelawadee UI', Tahoma` ต่อจาก `'Segoe UI'`,
      เปลี่ยน `word-break:break-word` → `overflow-wrap:break-word` 4 จุด
      (ตัวแรกเท่ากับ `anywhere` ซึ่งปิดตัวตัดคำไทยของ ICU → ตัดกลางพยางค์)
    - ลบ compat CSS ที่ไม่มีใครใช้ 12 คลาส + บล็อกที่นิยามซ้ำคำต่อคำ
    - sweep `font-size:Npx` แบบ inline 126 จุดใน 16 ไฟล์ →
      `calc(Npx * var(--fsc,1))` เดิมไม่ขยายตามสเกลฟอนต์เลย
- ทำไม: ผู้ใช้ขอ "improve my UI/UX" — เลือกทำ UX ก่อนแล้วค่อยงานภาพ, แบบ
  surgical (แก้เฉพาะที่ผิดจริง ไม่จัดหน้าตาใหม่), รวมงานตัวอักษรไทยด้วย
- ตรวจสอบ: `check.mjs` คง 0 error / 31 warning (เท่า baseline) ตลอดทุกขั้น;
  รันแอปจริงผ่าน `run-dracondex` ยืนยันทีละข้อ — Escape ซ้อนชั้น, toast แดงจริง
  (`rgb(239,68,68)`), tree ไม่หายตอนค้นหา, และวัด contrast ที่คำนวณจริงครบ 32 ธีม
  (**ไม่มีธีมไหนต่ำกว่า 3:1 แล้ว**; แย่สุด 1.61→3.19 ปุ่ม, 1.67→3.53 nav)
  พร้อมทดสอบสเกลฟอนต์ 80/100/130%
- Doc ที่อัปเดต: docs/SYSTEMS.md §4.6, §10 (ธีม + 2 หัวข้อใหม่), §11;
  docs/FILES.md (style.css, preload.js, core.js)

## 2026-07-24 — Plan.md part5 เสร็จสมบูรณ์: Designer link-filter/scroll-zoom/arrow-trim, Connector scroll-zoom, Drafter export + toolbar
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/mod/designer.js`, `src/renderer/mod/connector.js`, `src/renderer/mod/drafter.js`, `src/renderer/mdeditor.js`, `main.js`, `preload.js`, `src/renderer/i18n.js`, `Plan.md`
- อะไรเปลี่ยน:
  - **Designer**: scroll-wheel ซูมตรงๆ ไม่ต้องกด Ctrl แล้ว (ลบ `ctrlKey` gate); node-edge arrow trim เดิมใช้ radius เดา (`rA/rB` hardcode) ทำให้ node ที่ label ยาวมี gap ระหว่างเส้นกับขอบ node — แก้เป็นวัดขนาดจริงจาก DOM (`data-node` attr ใหม่บน node div + `dgBoundaryPoint()` คำนวณจุดตัดขอบจริง: ellipse formula สำหรับ circle, rectangle-ray intersection สำหรับ box/diamond/pin/text) พร้อมแก้บั๊กลำดับเรียก `drawEdges()` เดิมที่ถูกเรียกก่อน node DOM element จะถูกสร้าง (ใช้ได้เพราะ radius เดิมไม่พึ่ง DOM เลย แต่จะพังทันทีถ้าไม่ย้ายมาเรียกหลัง node loop); เพิ่ม type-filter สำหรับ module-link picker (`designerLinkFilter` ใน module_ui, มิเรอร์ pattern เดียวกับ Narrator's `narratorLinkFilter`)
  - **Connector**: scroll-wheel ซูมตรงๆ เช่นกัน (ลบ `ctrlKey` gate); hint text เดิมใช้ `narratorPanHint` ร่วมกับ Narrator (ซึ่งยังคง Ctrl-gated) — แยกเป็น `connectorPanHint` ของตัวเองแทนที่จะแก้ key ที่ใช้ร่วมกัน
  - **Drafter**: ปุ่ม Export ใหม่เขียนไฟล์ .md/.txt ตรงๆ (`drafter:exportFile` IPC, โมเดลจาก `author:exportDoc` แต่เขียน string ธรรมดาไม่ต้องห่อ HTML) — save dialog มี filter group ทั้ง Markdown/.md และ Text/.txt ให้เลือกในตัว; เพิ่ม 3 ปุ่ม toolbar shortcut (checkbox/hr/code-block) ใน `FMT_ACTIONS` ที่ใช้ร่วมกับ editor อื่นๆ (แต่ปัจจุบันมีแค่ Drafter ที่เปิด `toolbar:true`) — `mdRender()` รองรับ syntax พวกนี้อยู่แล้ว ไม่ได้แก้ rendering
  - เพิ่ม i18n key ใหม่ `connectorPanHint`, `narratorLinkFilter`(ใช้ซ้ำ), `exportFile` ครบ 18 locale, แก้ `designerHint` ให้ตรงกับพฤติกรรมใหม่ (ไม่มี "Ctrl+" แล้ว)
- ทำไม: `Plan.md` part5 หมวด Designer/Connector/Drafter (6 checklist items สุดท้าย) — ปิด part5 ครบทุกข้อ (part6 ยังเหลืองานอยู่)
- Doc ที่อัปเดต: `docs/FILES.md` (`mod/designer.js`, `mod/connector.js`, `mod/drafter.js` — เพิ่มแถวใหม่ที่หายไปเดิม, `mdeditor.js` section เพิ่ม FMT_ACTIONS ใหม่); `docs/SYSTEMS.md` **ไม่แตะ** — v3 module kinds เหล่านี้ยังไม่มี section เฉพาะเหมือนเดิม (gap ที่ระบุไว้แล้วใน `CLAUDE.md`)

## 2026-07-24 — Plan.md part5: Locator area-drag/centroid fix, Chronicler compare-by-module/calendar/event-icon, Wanderer link redesign + Area view
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/map.js`, `src/renderer/timeline.js`, `src/renderer/mod/chronicler.js`, `src/renderer/mod/wanderer.js`, `src/renderer/inspector.js`, `src/renderer/core.js`, `src/db/core.js`, `src/db/timeline.js`, `src/db/wanderer.js`, `main.js`, `preload.js`, `style.css`, `Plan.md`
- อะไรเปลี่ยน:
  - **Locator (L1/L2)**: area label เดิมใช้ vertex-average เป็น centroid (เอียงไปทางขอบที่มี point เยอะ) — เปลี่ยนเป็น shoelace-formula area-weighted centroid บน hull จริง (`polygonCentroid()` ใหม่ใน `map.js`); เพิ่ม whole-area drag — ลากในพื้นที่ fill (ไม่ใช่แค่ vertex dot) ย้ายทั้งชิ้น โดย poly เป็น `draggable` ใหม่ อ่าน delta จาก `poly.position()` แต่ละ tick แล้วเลื่อนทุกจุดใน `pts` พร้อมกัน
  - **Chronicler (C1-C4)**: ruler ของ oneline view เปลี่ยนจากชื่อเดือน (`Jan`/`Feb`) เป็นเลขเดือนล้วน; จำกัด 1 timeline line/module (ปุ่ม add line ซ่อนเมื่อมี line แล้ว), Compare view เปลี่ยนจากเลือก line อื่นในโมดูลเดียวกัน เป็นเลือก **chronicler module อื่น** ในทรี (ใช้ `modulesOfKind()` ตัวใหม่ที่ hoist ไปไว้ที่ `core.js` แทนการก็อปจาก `wanderer.js` เดิม เพราะ `chronicler.js` โหลดก่อน `wanderer.js` ใน `index.html`); เพิ่ม view ใหม่ `calendar` (ปฏิทิน raw year/month/day, ตั้งค่า days/week·days/month·months/year·ชื่อวัน-เดือนได้ผ่าน `module_ui.calendarConfig` JSON — เหมือน pattern `filterDef` เดิม); คลิก dot ของ event เปิด icon-picker popup (`openChroniclerEventIconPopup`, ก็อปจาก `hub.js`'s `openModuleIconPopup` — คนละอันกับ classifier ที่มีแค่ inline form ไม่มี popup) แทน color swatch เดิมในฟอร์ม — เพิ่มคอลัมน์ `timeline_event.icon TEXT` (additive) + `updateEventIcon(id,icon,color)`
  - **Wanderer (W1-W5)**: เอา placeholder "เลือก Locator"/"เลือก Chronicler" ออกจาก select; area บนแผนที่กลายเป็น terrain เฉย ๆ ไม่ react ต่อคลิก/vertex dot ไม่ render อีกต่อไป (กัน `S.mapAreaId` ซึ่งเป็น global ข้าม kind รั่วไปโผล่ที่ Locator), คลิกบน area shape ตรง ๆ ในโหมด placing เปิด modal สร้าง link ได้เลย (พร้อม `areaId` ที่คลิกโดนถูก capture อัตโนมัติ — ต้องเพิ่ม `areaId: area.id` ให้ Konva.Line ของ poly ด้วย ไม่งั้น area_ref จะว่างเสมอ); ระบบ link เปลี่ยนจาก label ข้อความอิสระ+ผูก event เป็นเลือก **vault entity ใดก็ได้** (`api.wiki.quickIndex`/`resolveKeys` — ครอบคลุมกว่าที่คิดไว้ตอนแรก ไม่ใช่แค่ classifier object/element/character แต่รวม module/chapter/note/ฯลฯ ด้วย) ผูกกับ event (วันที่) — คอลัมน์ใหม่ `map_event.linker_key TEXT` (additive, `label` เดิมยังอยู่แต่เลิกอ่าน/เขียน); เอา view `dual` ออก เพิ่ม view `area` ใหม่ (Map + Area List ข้างกัน + oneline timeline ด้านล่าง, เปิดได้ทีละ area ผ่าน `S.wandererData.openAreaId`)
  - **บั๊กที่เจอระหว่างตรวจสอบสดผ่าน `run-dracondex`**: `mountWandererBoard()` เรียก `buildChroniclerOneLineHtml()` (เป็น `async function`) โดยไม่มี `await` มาตั้งแต่เดิม — เรนเดอร์ literal string `"[object Promise]"` แทน SVG จริงมาตลอด (เพิ่งโผล่ชัดตอนต้องเทสต์ view `area` ใหม่); และ `inspector.js`'s view-label fallback ของ `wanderer` ยังเป็น `'Dual'` ค้างอยู่ — แก้เป็น `'Area'` ให้ตรงกับ `WANDERER_VIEWS[0]` ใหม่
- ทำไม: `Plan.md` part5 หมวด Locator/Chronicler/Wanderer (11 checklist items) — งานตามที่ user ระบุไว้ใน Plan
- Doc ที่อัปเดต: `docs/FILES.md` (`src/db/wanderer.js`, `src/db/timeline.js`, `src/db/core.js`, `src/renderer/map.js`, `src/renderer/timeline.js`, `src/renderer/mod/chronicler.js`, `src/renderer/mod/locator.js`, `src/renderer/mod/wanderer.js` — บรรทัด/ฟังก์ชัน/คอลัมน์ใหม่); `docs/SYSTEMS.md` **ไม่แตะ** — v3 module kinds (locator/chronicler/wanderer) ยังไม่มี section เฉพาะเลย ตามที่ระบุไว้แล้วใน `CLAUDE.md` §"Known rough edges" (gap เดิมก่อนรอบนี้ ใหญ่กว่า scope ของงานที่ทำวันนี้)

## 2026-07-22 — แก้ Hub 5 จุด: guideline/icon alignment, resizable page view, context menu open-in-new-window/pane, Sage Hut header icon (Plan.md Part 1)
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/hub.js`, `src/renderer/core.js`, `src/renderer/mod/sagehut.js`, `src/renderer/mod/fileviewer.js`, `src/renderer/i18n.js`, `style.css`, `Plan.md`
- อะไรเปลี่ยน:
  - **#1+#5 Nest tree — guideline กับ icon column ไม่ตรงกัน**: `buildNestRow`/`buildNestItemRow` เดิมปล่อย chevron เป็น string ว่างเมื่อแถวไม่มี child (ไม่ใช่ placeholder) ทำให้ `.kicon` เลื่อนซ้ายกว่าแถวข้างเคียงที่มี chevron จริง — เพิ่ม `<span class="tree-chev-spacer">` ขนาดเท่า `.tree-chev` (9×9px) แทนที่ string ว่าง แก้ `.li.indentN::after` guideline ให้คำนวณตำแหน่งจากจุดกึ่งกลาง chevron จริง (`paddingLeft(N)+4.5`) แทนค่าคงที่เดิม (`paddingLeft(N)-6`) ที่ไม่ตรงกับตำแหน่งจริงของ chevron เลย
    - **บั๊กที่เจอระหว่างตรวจสอบสด (live-verified ผ่าน `run-dracondex`'s `web-driver.mjs`)**: `.tree-chev{width:9px;height:9px}` ถูก `.icon{width:1em;height:1em}` (ทีหลังในไฟล์ specificity เท่ากัน) ทับค่าจริงโดยไม่รู้ตัว — วัดจาก `getBoundingClientRect()` สด พบ chevron จริงกว้างเกิน spacer ~4.5px ทำให้เลขคำนวณ alignment ผิดไปด้วย แก้ด้วย compound selector `.icon.tree-chev{...}` (specificity สูงกว่า `.icon` เฉย ๆ แน่นอน ไม่พึ่ง source order) ยืนยันซ้ำหลังแก้: chevron/spacer ทั้งคู่ 9px ตรงกันเป๊ะทุก indent depth
  - **#2 Hub page — resizable page view**: หน้า Sage Hut/Import Dock file-preview/Kind Browser (ไม่มี resize lever เดิมเหมือน Module Detail ที่มี `#inspector-resize` อยู่แล้ว) ห่อด้วย `wrapPageView()` ใหม่ (`hub.js`) ให้ resize handle (`#page-view-resize`, reuse `.panel-resize-handle`) — `startPageViewResize`/`S.pageViewWidth` (`core.js`) ตาม pattern เดียวกับ `startLeftPanelResize`/`startInspectorResize` เดิม clamp 480px–ความกว้าง pane จริง persist ผ่าน localStorage
  - **#3 Context menu — "เปิดในหน้าต่างใหม่"/"เปิดใน Pane ใหม่ ▸"**: เพิ่มใน `buildModuleContextMenuHtml` เฉพาะ module ที่ `kind !== 'collector'` (มี Builder page เอง) — `openModuleInNewWindow` (เรียก `api.window.openBuilderTab` เดิมตรง ๆ), `openModuleInNewPane`/`openPaneDirectionSubmenu`/`buildPaneDirectionListHtml` (submenu ซ้าย/ขวา/บน/ล่าง reuse hover-submenu pattern เดียวกับ "Create" submenu เดิม, เรียก `builderSplitPane`+`builderFocusPane` เดิมตรง ๆ) — ไม่ต้องแก้ main.js/preload.js เลย ทุกอย่าง wire ไว้แล้วจาก Builder pop-out/split-pane เดิม
  - **#4 Sage Hut header ไม่มี icon**: `buildSageHutHtml`'s `<h2>` เพิ่ม `display:flex;align-items:center;gap:8px` + `<span class="kicon">${I.sage}</span>` (icon เดิมที่ใช้กับ Sage Hut builder-tab badge อยู่แล้ว) ให้ header สูงเท่า Nexus Nest module detail header
- ทำไม: `Plan.md` Part 1 (5 checklist items) — งานปรับแต่ง Hub เล็ก ๆ ตามที่ user เขียนไว้
- Doc ที่อัปเดต: `docs/FILES.md` (`hub.js`/`mod/sagehut.js`/`mod/fileviewer.js`/`core.js` renderer section — เลขบรรทัด+ฟังก์ชันใหม่); `docs/SYSTEMS.md` **ไม่แตะ** — ยังไม่มี section เฉพาะของ v3 Hub/Builder system เลย (gap เดิมที่ถูก flag ไว้ตั้งแต่รอบก่อน ๆ ใน `procress.md`, ยังคงเป็น scope ที่ใหญ่กว่ารอบนี้)

## 2026-07-20 — Import DB: รองรับไฟล์ .db เก่ามาก (v1.x/v2.x), แก้ icon ค้าง, ปิดช่อง write (Plan part2)
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/core.js`, `src/renderer/core.js`, `preload.js`
- อะไรเปลี่ยน:
  - **แก้ bug บล็อกทั้งหมด**: ไฟล์ตัวอย่างจริงใน `old_db_data/` (v1.1.0,
    v1.2.2) เป็น WAL journal mode แต่ไม่มี `-wal` sidecar แนบมา —
    `node-sqlite3-wasm` ล่มทันทีตอน `importDatabaseMerge` เปิดอ่าน (reproduce
    แล้วตรง ๆ ด้วย scratch copy) เพิ่ม `forceLegacyJournalMode()` (ดึงมาจาก
    logic เดิมใน `getDB()`) แล้วให้ `importDatabaseMerge` คัดลอกไฟล์ที่เลือกไป
    temp ก่อนเสมอ (ไม่แตะไฟล์ต้นฉบับ), copy `-wal`/`-shm` มาด้วยถ้ามี, ไม่งั้น
    patch header แทน แล้วค่อยเปิดอ่านจาก temp — ลบ temp ทิ้งหลัง merge เสร็จ
    (finally block, ครอบ `source.close()` ด้วย)
  - **แก้ bug column-mismatch**: `relation_type` merge block เดิม
    `SELECT relation_name, color FROM relation_type` แบบ unconditional — ไฟล์
    v1.1.0 ไม่มีคอลัมน์ `color` เลย ทำให้ transaction ทั้งก้อน rollback (ไม่ใช่
    แค่แถว relation_type) เพิ่ม `hasColumn` guard เหมือน pattern เดิมที่ใช้กับ
    `timeline_event.story`/`hashtag.tag_color`
  - **แก้ bug icon ค้าง**: `openImportDbHub()` ไม่เคยเคลียร์
    `S.activeModuleNode` หรือเรียก `renderModuleRail()` — module v3 ที่ pin
    ไว้แล้วเปิดอยู่ก่อนหน้าจะค้าง `.active` ในแถบ nav ทั้งที่กำลังดู Director
    legacy panel อยู่ เพิ่มทั้งสองบรรทัดตาม pattern เดียวกับ
    `selectNexus`/`closeNexus`
  - **ปิดช่อง write**: `IMPORT_DB_READONLY_NS` (preload.js) ไม่มี `folder`
    (project-folder CRUD ของ Director) มาก่อน — สามารถสร้าง/แก้/ลบโฟลเดอร์ได้
    ทั้งที่อยู่ใน Import DB read-only mode เพิ่ม `folder` เข้า set
  - Verify ทั้งหมดด้วย `run-dracondex`'s `web-driver.mjs`: import ไฟล์
    v1.1.0/v1.2.2 จริงสำเร็จทั้งคู่ (unit-test `importDatabaseMerge` ตรง ๆ ผ่าน
    stub `electron`), migrate เข้า Nexus Nest ได้ module tree จริงจาก
    v1.1.0 (120 projects), เข้า Import DB mode แล้ว icon ไม่ค้าง, และยืนยันว่า
    `folder.create`/`project.create` ถูก reject ขณะ read ยังทำงานปกติ
- ทำไม: ผู้ใช้มี DraconDex เวอร์ชันเก่าเก็บเป็น branch บน GitHub
  (`v.2.1.1-dracondex`, `v.2.7.3-dracondex`) และไฟล์ตัวอย่าง v1.1.0/v1.2.2 —
  ต้องการให้ main เวอร์ชันล่าสุด import ไฟล์เก่าเหล่านั้นได้ แล้วเลือกได้ว่าจะ
  เปิดแบบ read-only (Import DB) หรือ merge เข้า Nexus Nest จริง — โครงสร้าง
  ทั้งสองทางเลือกมีอยู่แล้ว (v.3.11.0) ปัญหาคือไฟล์เก่าจริงยัง import ไม่ผ่าน
- Doc ที่อัปเดต: `docs/SYSTEMS.md` §Import/Export DB, `docs/CHANGELOG.md`
  (รายการนี้)

## 2026-07-20 — Nexus Nest tree: แก้ hover ขยาย box, rename autofocus, guide line ชิด icon (Plan part1)
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/hub.js`, `style.css`,
  `.claude/skills/run-dracondex/web-driver.mjs`
- อะไรเปลี่ยน:
  - **แก้ bug #1**: `.li:hover .acts{display:flex}` เผยปุ่ม `.btn-i` ขนาด
    28px ซึ่งสูงกว่าความสูงปกติของแถว (~22px) — เพราะ `.li` เป็น
    `display:flex;align-items:center` ไม่มี height คงที่ จึงยืดตัวสูงขึ้นทุกครั้งที่
    hover แถวใน Nest tree แทนที่จะแค่ไฮไลต์ เพิ่ม `.li .acts .btn-i{width:18px;
    height:18px}` ให้พอดีกับความสูงเดิม ไม่ยืด
  - **เพิ่ม #2**: `quickCreateModule()` (สร้าง module ใหม่แล้วเข้าโหมด rename
    อัตโนมัติ) ไม่เคย `.focus()/.select()` input ต่างจาก `startRenameModule()`
    (double-click เพื่อ rename เดิม) ที่ทำอยู่แล้ว — ดึง logic นั้นออกเป็นฟังก์ชัน
    ร่วม `focusRenameInput(id)` แล้วเรียกจากทั้งสองจุด ทำให้ module ที่เพิ่งสร้าง
    ได้ cursor + select-all guideword name ทันที พิมพ์ทับได้เลย
  - **ตรวจสอบ #3**: click นอก input ระหว่าง rename มีอยู่แล้ว (blur handler +
    `body.renaming-lock` CSS lock) — ทดสอบจริงผ่าน `run-dracondex` แล้วยืนยันว่า
    บันทึกชื่อและออกจากโหมดถูกต้อง ไม่ต้องแก้โค้ด
  - **แก้ #4**: เส้น guide line ของ nest tree (`.li.indentN::after`) เคยอยู่ที่
    `background-position` เท่ากับ `padding-left` ของแถวพอดี (26/42/58/74/90px)
    ทำให้แนบชิด icon จนดูเหมือนทับกัน ขยับออกมา 6px (20/36/52/68/84px) ให้มีช่องว่างเล็กน้อย
  - เพิ่มเครื่องมือ `web-driver.mjs`: stub `BrowserWindow.fromWebContents`,
    `ipcRenderer.on`, และคำสั่ง `hover` ที่ยังขาดอยู่ — แอปเดิมบูตไม่ผ่านใน
    web-driver เพราะ `window:getId` handler อ่าน `event.sender` จาก event ที่
    เป็น `null`
- ทำไม: ผู้ใช้รายงานว่าแถวใน Nest tree "ขยาย" เวลา hover, module ใหม่ต้องคลิก
  ก่อนถึงจะพิมพ์ชื่อได้, และเส้นแนวตั้งบอกลำดับชั้นไปชนกับ icon หลังจาก commit
  ก่อนหน้าขยับตำแหน่งเข้ามาใกล้เกินไป
- Doc ที่อัปเดต: `docs/CHANGELOG.md` (รายการนี้) — ไม่กระทบโครงสร้างใน
  `docs/SYSTEMS.md`/`docs/FILES.md` (การแก้เป็น CSS/behavior เล็กน้อยในฟังก์ชัน
  เดิมที่มีอยู่แล้ว)

## 2026-07-20 — ลดขั้นตอนเริ่มสร้าง Nexus
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/core.js`, `src/renderer/i18n.js`, `style.css`,
  `test/onboarding-tour.test.mjs`
- อะไรเปลี่ยน: ปุ่มสร้าง Nexus ใน welcome เปิดฟอร์มโดยตรง; เพิ่ม checkbox
  เลือกเปิด coach-mark หลังสร้าง และแก้ CSS ของ checkbox ใน form ไม่ให้ยืดเต็มบรรทัด
- ทำไม: ลด modal ซ้อนและคำถามที่ไม่อธิบายผลลัพธ์ แต่ยังคงให้ผู้ใช้เลือกทัวร์ได้
- Doc ที่อัปเดต: `docs/SYSTEMS.md` §2, `docs/FILES.md` core.js

## 2026-07-18 — Chronicler: แก้ bug zoom ของ Oneline view + เพิ่ม event inspector แบบ autosave (Plan part3)
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/mod/chronicler.js`, `src/renderer/timeline.js`,
  `src/renderer/modals.js`, `style.css`
- อะไรเปลี่ยน:
  - **แก้ bug #1**: ใน Oneline view เดิม เมื่อ zoom (wheel) กราฟ,
    `updateTimelineGraphX()` reposition เฉพาะจุด `[data-event-dot]`
    เท่านั้น — เส้น tick connector กับ text ชื่อ/วันที่ของแต่ละ event
    ไม่มี `data-*` attribute ใด ๆ เลยจึงค้างอยู่ตำแหน่งเดิม ทำให้จุดวงกลม
    เลื่อนหนีจาก label ของตัวเอง เพิ่ม `data-event-tick`/
    `data-event-label`/`data-event-date` (คีย์ `data-start-ts` เดียวกับจุด)
    แล้วให้ `updateTimelineGraphX()` reposition ทั้งกลุ่มพร้อมกัน
  - **เพิ่ม event inspector**: คลิกจุด event บนกราฟ (Oneline) หรือแถวใน
    event list (Downline) ไม่เปิด modal เดิมอีกต่อไป — เรียก
    `toggleChroniclerInspector(tlid, evId)` แสดงแผง inspector inline
    แก้ไขได้ (ชื่อ/วันเริ่ม-สิ้นสุด/สี/story) แบบ autosave (onchange +
    delegated click สำหรับ color picker) แทน — Oneline แสดงใต้กราฟ,
    Downline แสดงเป็น dropdown ใต้แถวที่กด
  - **เปิดได้ทีละอัน**: เก็บ event ที่เปิดอยู่เป็นค่าเดียว
    `chroniclerData.inspectorEventId` (ไม่ใช่ Set) — เปิดอันใหม่จะปิด
    อันเก่าอัตโนมัติ เพราะ `colorPicker()` ใช้ id ซ้ำ (`#sel-color`,
    `#cpicker-grid`, …) เปิดพร้อมกันสองอันจะชนกัน
  - `dateInputsHTML()` (modals.js) เพิ่ม param เสริม `onchangeFn` (default
    `''`, backward-compatible) สำหรับผูก autosave กับ input วันที่
  - CSS ใหม่: `.chr-insp-row`, `.chr-insp-body` (style.css)
- ทำไม: ตาม Plan.md part3 #1/#2/#2.1/#2.2 ที่ user กำหนด
- ตรวจสอบ: ขับแอปจริงผ่าน run-dracondex driver — สร้าง module kind
  chronicler + timeline + 5 events ช่วงปี 1000-2000, ยืนยัน zoom ไม่ทำให้
  tick/label หลุดจากจุดแล้ว (ภาพก่อน/หลัง), เปิด/แก้/ปิด inspector ทั้ง
  Oneline และ Downline สำเร็จพร้อม toast บันทึก + ยืนยันข้อมูลจริงใน DB
  ผ่าน `eval window.api.timeline.getEvents(...)`, ยืนยันเปิดได้ทีละแถวใน
  Downline (querySelectorAll('.chr-insp-row.open') เหลืออันเดียวเสมอ);
  `check.mjs` ไม่มี warning ใหม่จากไฟล์ที่แก้
- Doc ที่อัปเดต: docs/CHANGELOG.md (รายการนี้) — ไม่กระทบ
  docs/SYSTEMS.md/docs/FILES.md/docs/Architec.md เพราะ mapping
  kind↔file↔IPC เดิมไม่เปลี่ยน มีแค่พฤติกรรมภายใน chronicler.js/
  timeline.js ที่แก้

---

## 2026-07-17 — Cloud Sync: แยก backend ตามชนิด build (Supabase จริงเฉพาะ build ติดตั้ง, dev ใช้เซิร์ฟเวอร์ต้นแบบในเครื่อง)
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/sync-devserver.js` (ใหม่), `src/db/sync.js`,
  `src/renderer/sync.js`, `src/renderer/i18n.js`, `docs/SYNC.md`
- อะไรเปลี่ยน:
  - build ติดตั้ง/portable (`app.isPackaged`) ใช้ Supabase จริงตามเดิม;
    build dev (`npm start`/driver) ถูกปักหมุดไปที่เซิร์ฟเวอร์ต้นแบบ
    in-process ตัวใหม่ (`sync-devserver.js`) — endpoint/auth/error body
    เหมือน migration ทุกอย่าง, loopback + port สุ่ม, state เก็บเป็น
    `dev-sync-server.json` ในโฟลเดอร์ข้อมูล dev
  - โหมด dev ไม่อ่าน/ไม่ต้องตั้ง `sync:url`/`sync:anonKey` — หน้าต่างซิงก์
    ข้ามหน้าตั้งค่าเซิร์ฟเวอร์ ซ่อนปุ่มตั้งค่า และแสดงป้าย "เวอร์ชัน dev"
    (i18n คีย์ใหม่ `syncDevServer` ครบ 18 locale)
- ทำไม: ตามที่ user กำหนด — sync จริงใช้กับตัวติดตั้งเท่านั้น ส่วนเวอร์ชัน
  dev ให้มี prototype sync ทดสอบ flow ได้ครบโดยไม่ต้องมีโปรเจกต์ Supabase
- ตรวจสอบ: E2E dev-mode ผ่าน web-driver — server เริ่มเอง, push→link→pull
  ครบ, สถานะ/ป้าย dev แสดงถูก (screenshot), ไฟล์ state ถูกเขียน; check.mjs
  0 warning ใหม่
- Doc ที่อัปเดต: docs/SYNC.md (ตาราง build mode + ไดอะแกรม §2.1),
  docs/FILES.md (แถว sync-devserver.js)

## 2026-07-17 — Cloud Sync (Supabase) prototype: ซิงก์ Nexus vault + คีย์เข้าถึง
- commit: uncommitted
- ไฟล์ที่แก้: `src/db/sync.js` (ใหม่), `src/renderer/sync.js` (ใหม่),
  `supabase/migrations/20260717000000_dracondex_sync_prototype.sql` (ใหม่),
  `docs/SYNC.md` (ใหม่), `main.js`, `preload.js`, `database.js`, `index.html`,
  `src/renderer/core.js`, `src/renderer/i18n.js`, `style.css`
- อะไรเปลี่ยน:
  - ฟีเจอร์ซิงก์ vault ขึ้น Supabase แบบ snapshot ทั้งก้อน (last-write-wins):
    ปุ่ม ☁ ใน vault-head เปิดหน้าต่างซิงก์ 3 สถานะ (ตั้งค่าเซิร์ฟเวอร์ /
    Push ครั้งแรก+เชื่อมด้วยคีย์ / เชื่อมแล้ว Push-Pull-สร้างคีย์-ยกเลิก)
  - คีย์เข้าถึงรูปแบบ `Xxxx-Xxxx-Xxxx-Xxxx` (4 กลุ่ม × 4 alphanumeric)
    สร้างฝั่งเครื่อง แสดงครั้งเดียว เซิร์ฟเวอร์เก็บ sha-256; role
    owner (push+pull) / read (pull อย่างเดียว)
  - ฝั่งเซิร์ฟเวอร์เป็น migration SQL ไฟล์เดียว: ตาราง `sync_vault`/`sync_key`
    RLS ล็อกไม่มี policy + RPC SECURITY DEFINER 5 ตัวเป็นทางเข้าเดียว
  - `src/db/sync.js`: serializeVault (lookup FK → natural key),
    applySnapshot (wipe-and-rebuild + id remap ใน transaction แล้ว rebuild
    wiki index), fetch ทั้งหมดอยู่ main process — จุดแรกของแอปที่มี network call
  - i18n เพิ่ม 41 คีย์ `sync*` ครบ 18 locale; CSS block `.sync-*`
- ทำไม: ต้นแบบ (prototype) แชร์/สำรอง vault ข้ามเครื่องผ่านคลาวด์ ตามแผน
  ที่ user กำหนด — จำกัดขอบเขตไว้ที่ snapshot sync ไม่มี merge/conflict UI
- ตรวจสอบ: `check.mjs` ผ่าน (0 warning ใหม่, i18n parity ครบ), E2E ผ่าน
  web-driver + mock RPC (push→link→pull ครบ, id remap ถูก, read key ถูกกัน
  push, คีย์ผิดถูกปฏิเสธ) — migration จริงยังไม่ได้ apply ขึ้น Supabase
  (user เลือกข้ามการใช้ MCP; รัน SQL เองได้ตาม docs/SYNC.md §1.1)
- Doc ที่อัปเดต: docs/SYNC.md (ใหม่ทั้งไฟล์), docs/SYSTEMS.md §10 (หัวข้อ
  Cloud Sync), docs/FILES.md (ตาราง "Cloud Sync — ไฟล์ใหม่")

## 2026-07-17 — Nexus Nest hub: reparent drag-drop, Create submenu, home button, hub scroll fixes
- commit: uncommitted
- ไฟล์ที่แก้: `src/renderer/hub.js`, `src/renderer/builder.js`,
  `src/renderer/core.js`, `style.css`, `.claude/skills/run-dracondex/web-driver.mjs`,
  `Plan.md`
- อะไรเปลี่ยน:
  - `onNestDrop` (hub.js) เอาข้อจำกัด `isLockedToParent` ออก — โมดูลที่มี
    parent อยู่แล้วเคยลาก reorder ได้แค่ในกลุ่มพี่น้องเดิม ตอนนี้ลากออกไป
    top-level หรือไปเป็นลูกของโมดูลอื่นได้เหมือน top-level module (กันแค่
    ลากเข้า subtree ตัวเอง ผ่าน `isSelfOrDescendant` เดิม)
  - `buildModuleContextMenuHtml` (hub.js): เปลี่ยน kind-list แบนราบบนสุดเมนู
    (เฉพาะ Major module) เป็นปุ่ม "Create" เดียวที่เปิด hover submenu แทน
    (`openCreateSubmenu`/`positionSubmenuNear`/`scheduleCtxSubmenuClose`,
    CSS ใหม่ `.kli-submenu-parent`/`.kli-arrow`/`.ctx-submenu`)
  - เพิ่มปุ่ม home บน nav rail (`goToNexusNestHub`, ไอคอนใหม่ `I.home` ใน
    core.js) กลับไปหน้า welcome ของ Hub จากตรงไหนก็ได้ — ต่างจาก
    `#nav-logo-btn` ที่ "return" เฉพาะตอนอยู่ในโมดูลเดิมแบบเต็มหน้า
    (`S.activeModule`) ไม่ครอบคลุม v3 module node ที่โฟกัสอยู่ใน Builder
  - **บั๊ก**: เปิด legacy view (เช่น Scribe, หรือ Nexus picker ตอนยังไม่มี
    nexus) แล้วกลับมา Nexus home จะเห็น pane ของ view เดิมค้างอยู่ใต้
    Builder pane ปิดไม่ได้ — root cause: `pruneStaleLayoutElements`
    (builder.js) กวาดแค่ `.bpane`/`.bsplit` ที่ stale จาก layout tree เดิม
    ไม่เคยกวาด child อื่นของ `#main-inner` ที่ legacy view เขียนทับ
    `innerHTML` ตรงๆ ทิ้งไว้ — แก้โดยกวาด child ที่ไม่ใช่
    `.bpane`/`.bsplit` ออกทุกครั้งก่อน re-render grid
  - Hub accordion (Nest/Sage Hut/Import Dock) แต่ละ section ได้ scrollbar
    ของตัวเอง — `#hub-body` เป็น flex column, `.acc-body` ที่เปิดอยู่ได้
    `flex:1 1 0;overflow-y:auto` แชร์พื้นที่เท่าๆ กัน แทนที่จะ scroll รวม
    กันเป็นหน้าเดียวผ่าน `#left-panel-inner` เหมือนเดิม (ลำดับ section เอง
    ตรวจสอบซ้ำแล้วว่าถูกต้องอยู่แล้วจาก fix รอบก่อน ไม่ได้แก้เพิ่ม)
  - `web-driver.mjs`: พอร์ต `dragto`/`rclick` มาจาก `driver.mjs` (mouse
    down/move/up จริง ไม่ใช่ synthetic dispatchEvent) — ต้องใช้ยืนยัน
    drag-reparent กับ context-menu submenu ข้างต้นตอน Electron binary
    โหลดไม่ได้ใน sandbox นี้
- ทำไม: `Plan.md` รอบใหม่ (แยกจาก "Plan.md rollout complete" รอบก่อน) ขอ
  ฟีเจอร์/บั๊กฟิกซ์ 6 อย่างนี้บน Nexus Nest hub
- Doc ที่อัปเดต: `docs/Architec.md` §1.2 (Hub) และ §1.4 (Builder),
  `docs/FILES.md` (แถว `hub.js`/`builder.js`/`web-driver.mjs`) —
  `docs/SYSTEMS.md` ยังไม่มีหัวข้อ v3 Hub/Builder เลย (ช่องว่างเดิมจากรอบ
  ก่อน ไม่ใช่งานรอบนี้ ยังไม่ได้ backfill)

## 2026-07-16 — เอกสารสถาปัตยกรรม v3 module system (Architec.md rewrite)
- commit: 17be1d6..f3fe2f9 (ครอบคลุม 93a4187, 5aeb175, และก่อนหน้า — "Phase 1"
  ถึง "Phase 24" + "Part 1"/"Part 2" ทั้งหมด, git log เต็มอยู่ใน
  `.claude/skills/write-docs/docs-diff.sh` output ของรอบนี้), doc เอง: uncommitted
- ไฟล์ที่แก้: `docs/Architec.md` (เขียนใหม่ทั้งไฟล์), `docs/FILES.md`
  (เพิ่มหัวข้อ "v3 Module System — ไฟล์ใหม่"), `docs/SYSTEMS.md` (เพิ่ม
  หมายเหตุชี้ไป Architec.md ในหัวไฟล์และย่อหน้าเปิด) — **ไม่มีการแก้โค้ดแอป**
  ในรอบนี้ เป็นการซิงก์เอกสารให้ตรงกับโค้ดที่เปลี่ยนไปแล้วในรอบก่อนหน้า
- อะไรเปลี่ยน (ในแอป, สำรวจย้อนหลัง — ไม่ใช่งานที่ทำรอบนี้): เพิ่มระบบ
  "v3 module system" ทั้งชุดอยู่ข้างๆ 7 โมดูลเดิมแบบ additive — Nexus
  module tree แบบ generic (ตาราง `module`, ซ้อนได้ไม่จำกัดชั้น, 15 kind:
  collector/manager/inspector/classifier/locator/chronicler/wanderer/
  narrator/author/scribe/drafter/viewer/connector/sketcher/designer),
  Hub (nest tree + accordion Nest/Sage Hut/Import Dock + pin + context
  menu), Builder (split-pane 1/2/4 พร้อมประวัติต่อ pane), Module Inspector
  (แอตทริบิวต์/แท็ก/ลิงก์/version history), Icon picker, Import Dock,
  legacy migration (`migrate_v3.js` — ไม่แตะข้อมูลเดิม), Artisan เปลี่ยนจาก
  one-shot template เป็น wizard ประกอบ module v3 ทีละหน้า, ปุ่ม nav rail
  ของ Director/Navigator/Hero/Writer ถูกซ่อน (เข้าถึงผ่าน Artisan/migrate
  เท่านั้น) ส่วน Scribe/Sage/Artisan ยังเป็นปุ่มปกติ; โค้ด/DB/IPC เดิมของ
  ทั้ง 7 โมดูลไม่ถูกลบหรือแก้ ยังทำงานได้ครบ
- ทำไม: ผู้ใช้ขอ "update architec in doc" — `docs/Architec.md` เดิมอ้างอิง
  โค้ด ณ 2026-07-07 ก่อนรอบ v3 ทั้งหมด ทำให้ตกยุคไป 24 phase; `procress.md`
  เองก็ทิ้งธงไว้ว่า `docs/SYSTEMS.md`/`docs/FILES.md` ไม่ครอบคลุม v3 เลย
- ขอบเขตของรอบนี้: `docs/Architec.md` ได้รับการเขียนใหม่แบบละเอียด (kind
  ↔ ไฟล์ ↔ IPC ครบทุกตัว, สำรวจโค้ดจริงทุกไฟล์ที่เกี่ยวข้อง); `docs/FILES.md`
  และ `docs/SYSTEMS.md` ได้แค่หมายเหตุชี้ทาง + ตารางไฟล์ใหม่ระดับสรุป — ยัง
  **ไม่ได้** ขยายทุกหัวข้อพฤติกรรม (§3–§9 ของ SYSTEMS.md) ให้ครอบคลุม v3
  แบบละเอียดเท่าโมดูลเดิม เพราะเป็นงานใหญ่เกินขอบเขตคำขอนี้ (24 phase) และ
  ต้องรันแอปจริงยืนยันพฤติกรรมทีละ kind ตามหลักของสกิลนี้ — ทิ้งเป็นงาน
  ต่อยอดถ้าต้องการ
- ทดสอบ: อ่านโค้ดจริงทุกไฟล์ที่อ้างถึงใน Architec.md (schema ใน core.js,
  module.js, migrate_v3.js, hub.js, builder.js, inspector.js, mod/*.js
  ทุกไฟล์, IPC ใน main.js/preload.js) ไม่ได้รันแอปยืนยัน UI เพราะเป็นงาน
  เอกสารเชิงโครงสร้างไม่ใช่พฤติกรรม
- Doc ที่อัปเดต: docs/Architec.md (เขียนใหม่ทั้งไฟล์), docs/FILES.md
  (หัวข้อใหม่ก่อน src/db/), docs/SYSTEMS.md (หมายเหตุหัวไฟล์)

---

## 2026-07-05 — Obsidian-like rework: Nexus vault, Scribe, Wikilink/Backlinks, IDE shell, Quick switcher, Graph view
- commit: 167782c, bab5474, ddccdd7, 5426685, 17be1d6 + งาน hardening เป็น uncommitted
- ไฟล์ที่แก้/เพิ่ม: `src/db/core.js` (schema+migration v2.8+import-merge), `src/db/nexus.js` `src/db/scribe.js` `src/db/wiki.js` (ใหม่), `src/db/director.js` `src/db/navigator.js` `src/db/hero.js` `src/db/writer.js` (nexus scoping + wiki hooks), `main.js` `preload.js` `database.js` (namespace ใหม่ `nexus:` `note:` `wiki:`), `index.html` (script tag ใหม่, ปุ่ม rail Explorer/Scribe, `#status-bar`), `src/renderer/core.js` (nexus home 2 ระดับ, openEntityByKey, explorer/status bar/shortcuts), `src/renderer/markdown.js` `src/renderer/mdeditor.js` `src/renderer/scribe.js` `src/renderer/explorer.js` `src/renderer/quickswitch.js` (ใหม่), `src/renderer/director.js` `src/renderer/writer.js` `src/renderer/sage.js` `src/renderer/relation.js` `src/renderer/map.js` `src/renderer/modals.js` (ปรับ), `src/renderer/i18n.js` (+~65 key × 18 ภาษา), `style.css`, `vendor/` (ใหม่ — d3.min.js, konva.min.js), `.claude/skills/run-dracondex/web-driver.mjs` (ใหม่)
- อะไรเปลี่ยน:
  1. **Nexus vault** — ตาราง `nexus` + `nexus_ref` ใน 4 ตาราง project-root, migration adopt ข้อมูลเก่าเข้า vault เริ่มต้นอัตโนมัติ, หน้า home เป็น vault picker → การ์ด 7 โมดูล, ทุกโมดูล scope ตาม vault ที่เปิด
  2. **Scribe** — โมดูลโน้ต markdown ใหม่ (note_folder ซ้อนได้ + note unique ต่อ vault), parser markdown เขียนเอง, editor กลาง (`createMarkdownEditor`) มี autosave/preview/backlinks/`[[` autocomplete
  3. **Wikilink + Backlinks** — ตาราง `wiki_link` index `[[Name]]` ที่ resolve ตอน save (ลำดับ precedence ตายตัว), `openEntityByKey` เป็นจุดเดียวที่นำทางไป entity, อัปเกรดโน้ตของ Director object และ chapter ของ Writer ให้รองรับ wikilink/preview
  4. **IDE shell** — explorer tree รวมทุกโมดูล, status bar, shortcut (Ctrl+P/E/N/W/Tab)
  5. **Quick switcher (Ctrl+P)** — fuzzy subsequence search ข้าม entity ทั้ง vault
  6. **Graph view** — `wiki:getGraph` ต่อยอด `buildSageGraph` เดิมของ Sage ให้ Scribe ใช้ร่วมกัน (opts ใหม่แบบ backward-compatible)
  7. **Hardening** — vendor D3/Konva ไว้ใน repo (CDN เหลือเป็น fallback), ขยาย import-merge ให้รวม nexus/note + rebuild wiki index, rename safety (เขียนทับ `[[ชื่อเก่า]]`→`[[ใหม่]]` ในทุก source ที่อ้างถึง + auto-resolve ลิงก์ค้างเมื่อสร้าง entity ชื่อตรงกัน)
- ทำไม: ผู้ใช้ขอให้ DraconDex มีความสามารถแบบ Obsidian — vault, IDE-like UI,
  markdown editor, wikilink/backlinks, graph, quick switcher — ตามแผนที่วางไว้ที่
  `/root/.claude/plans/obsidian-tingly-dusk.md`
- ทดสอบ: ทุก phase ผ่าน `.claude/skills/run-dracondex/web-driver.mjs` (Electron
  binary โหลดไม่ได้ใน sandbox นี้ — proxy บล็อก GitHub releases) รวมถึง DB-layer
  harness แยกสำหรับ migration/CRUD/wiki-resolve/import-merge
- Doc ที่อัปเดต: docs/SYSTEMS.md §2 (Nexus ขยาย), §2b–§2d (ใหม่: Scribe, Wikilink,
  IDE shell), §3/§7/§10 (Director note, Writer chapter, vendor libs, import-merge),
  docs/FILES.md (root files, src/db/, src/renderer/ ทั้งหมด)

---

## 2026-07-04 — เขียน doc ระบบ + รายไฟล์ครั้งแรก, สร้างสกิล write-docs
- commit: ff258d6 (ฐานที่ใช้สำรวจ) + งานเอกสารเป็น uncommitted
- ไฟล์ที่แก้/เพิ่ม: `docs/SYSTEMS.md` (ใหม่), `docs/FILES.md` (ใหม่), `docs/CHANGELOG.md` (ใหม่),
  `.claude/skills/write-docs/` (ใหม่ — SKILL.md, docs-diff.sh, mark-synced.sh)
- อะไรเปลี่ยน: ไม่มีการแก้โค้ดแอป — เป็นการสำรวจโค้ดทั้งหมด (main.js, preload.js,
  database.js, src/db/*.js ทั้ง 12 ไฟล์, src/renderer/*.js ทั้ง 14 ไฟล์) แล้วรันแอปจริง
  ผ่าน `.claude/skills/run-dracondex/driver.mjs` ไล่ทดสอบทั้ง 6 โมดูล เพื่อยืนยัน
  พฤติกรรมก่อนเขียนลง doc
- ทำไม: ผู้ใช้ขอเอกสารอธิบายการทำงานของแต่ละระบบและแต่ละไฟล์ ทั้งเก่าและใหม่ ให้ตรงกับ
  โค้ดจริง (memory ของโปรเจกต์ที่มีอยู่เดิมอ้างเวอร์ชัน/ไฟล์ที่เก่าไปแล้ว)
- Doc ที่อัปเดต: สร้างใหม่ทั้งหมด (SYSTEMS.md, FILES.md, CHANGELOG.md) — เป็น baseline
  ให้รายการถัดไปอ้างอิง diff จากจุดนี้
- บั๊กที่พบระหว่างทดสอบ (บันทึกไว้ใน SYSTEMS.md §11 ด้วย): crash แฝงใน
  `openObjectModal()` เมื่อไม่มี category (modals.js:159), auto-translate
  ทับชื่อข้อมูลผู้ใช้ที่ตรงกับ i18n key, ข้อความ UI ภาษาไทยตกหล่นบางจุดใน
  Navigator/Sage
