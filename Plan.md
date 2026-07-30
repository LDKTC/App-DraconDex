> สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
---
> หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-----
### part 1 version.4.0.0
#### Cloud Sync Function
- [x] Supabase
    - [x] เปลี่ยนระบบปัจจุบันที่ใช้Sync เป็นระบบToken Sync ที่จะสร้าง16digits token(xxxx-xxxx-xxxx-xxxx) ทุกครั้งที่ทำการSync
    - [x] .ddx ที่sync จะมีขนาดไม่เกิน 10MB (account ปกติ) หรือ 20MB (account Pro, ได้ 3 slot/account — เปลี่ยนจากเดิมที่กำหนดไว้ 20MB ทุก account) และมีอายุ 72ชม. หลังจากนั้นจะถูกล้างออก
    - [x] เมื่อผุ้ใช้กรอก 16digits tokenในเครื่องอื่น จะทำการSyncกับSupabase เพื่อดึงเอาส่วนต่างมาลง
    - [x] ให้ผู้ใช้เลือกครั้งละ 1 nexus ที่ต้องการupload โดยจะเก็บข้อมูลบนNexusเท่านั้น และไม่เก็บversion saveของapp
    - [x] ผู้ใช้ต้องlogin googleก่อนเพื่อจะสามารถสร้างUploadได้, ให้Quota max 1 upload slot/account (3 slot สำหรับ Pro) โดยจะมีหน้าต่างให้ผู้ใช้สามารถManaged Uploadได้ สามารถลบหรือsyncลงเครื่องที่ใช้อยู่ได้ทันทีหากใช้accountเดียวกันกับที่Upload
    - [x] เพิ่มfunction locked password ที่ให้ผู้ใช้สามารถใส่password สำหรับการsync uploadได้ โดยเมื่อtokenถูกกรอกจากAccountอื่น จะต้องpassword หากผู้ใช้ใส่รหัสที่Tokenนั้น
- [x] Google
    - [x] ใช้ระบบbackupผ่าน google drive appdata folderของผู้ใช้
    - [x] loginด้วยgoogle และเก็บเป็นข้อมูลlayout profileของผู้ใช้เอาไว้หากต้องการ
    - [x] เก็บไฟล์ .ddx ด้วยหากผู้ใช้ต้องการ
- [x] Firebase
    - [x] เก็บversion update เมื่อผู้ใช้ที่ล็อคอินทำการเปิดแอพจะขึ้นให้ผู้ใช้สามารถเลือกว่าจะอัพเดตเป็นversionใหม่ได้ (ไม่ auto-update — แจ้งเตือน + เปิดหน้าดาวน์โหลดในเบราว์เซอร์เท่านั้น)
- [x] Github
    - [x] เพิ่มFeature สำหรับExtension download โดยสามารถดึงextension จากgithub มาที่แอพนี้ได้
        - extensionสามารถขยายข้อมูลtable ของตัวเองในdatabasedได้ (รันในหน้าต่างแยกที่ถูกจำกัดสิทธิ์ — sandboxed plugin runtime)
#### Setting
- [x] setting popup -> แสดงแค่ส่วนselected เปลี่ยนภาษา + button เลือกการแสดงผลชื่อmodule + ขนาด UI + ปุ่มเปิด setting window เท่านั้น เป็นDefault ของQuick setting
- [x] setting window -> เพิ่ม section เพื่อแบ่ง listของpageในsetting
    - [x] Workspace
        - Theme
        - [x] Text&Size -> รวบเปลี่ยนภาษา + ขนาดUi เข้าไปเป็นpage เดียวกัน
            - [x] ขนาด UI -> ขั้นสูง, เพิ่มให้ผุ้ใช้สามารถปรับขนาดของ Icon/Button/ขนาดtextในแต่ละส่วนได้ เช่น ส่วน left panel/Navbar/builder 
        - Tool toggle -> สามารถเลือกแสดงปุ่มที่แสดงบนจุดต่างๆของแอพได้เช่น 
            - [x] popup setting เรียกว่า quick setting 
                - theme, UI size, Selected language, Account status, user profile เป้นต้น
            - [x] nav sidebar เรียกว่า quick button
                - color, hashtag, import, export, เป้นต้น
            - [x] สิ่งที่แสดงที่status bar
    - [x] User
        - [x] Account -> แสดงหน้าสำหรับการLogin Accountที่นี่
            - [x] account type -> แสดงที่นี่ ว่าaccountนั้นคือใคร เช่น Pro-Paid หรือ Team-Subscriber และแสดงสิทธิ์ประโยชน์ที่นี่
        - [x] User profile -> layout slotของaccountที่เก็บไว้ในappdataของprofile สามารถเก็บกี่รูปแบบก็ได้
    - [x] Appdata
        - [x] TokenSync -> Token sync ของ supabase (ต้องLoginก่อนใช้) 
        - [x] Database -> แสดงlist nexusของผู้ใช้ที่มีอยู่ สามารถimport exportแยกnexusได้ รวมถึงสามารถแยกแต่ละmoduleได้เช่นกัน
        - [x] BackupData -> สามารถมาปรับsettingได้ โดยจะแสดงstatusการบันทึกและดึงข้อมูลจากgoogle appdata เป็นhistory โดยจะauto syncเมือเปิดแอพ และสามารถเปิดปิดauto backupได้ โดยจะauto saveทุก 1 ชั่วโมง และแสดงstatus ของdrive ผุ้ใช้ว่าไม่สามารถใช้งานได้ เมื่อdriveเต็ม และเตือนเมื่อdriveใกล้เต็ม
    - [x] Extension
        - [x] Extension -> มีlist extension ของ Officialให้เลือก และสามารถให้add browser มาจากgithubได้
        - [x] Extension setting (lists) -> เมื่อมีextension settingของextensionจะมาโผล่ที่นี่ 
### part 2 version.4.1.0
#### New Workspace 
- [ ] Adding new three Workspace style for app as for new, amataur, and expert user
    - [x] Standard workspace : "Wyvern" from featureplan.md
    - [ ] Studio workspace : "Drake" from current available workspace
    - [ ] Sandbox workspace : "Dragon" create as new workspace
        - [ ] สิ่งที่ต้องการ :
            - ไม่ซ้ำกับสอง workspace ก่อนหน้า 
            - ต้องการความอิสระของผู้ใช้
            - สามารถแสดงใช้ architecture ของ nexus nest แบบเดิม แต่แสดงผลให้ดูใช้งานได้ตรงตามผู้ใช้และมีความยืดหยุ่น
            - ไม่จำเป็นต้องหน้า window เดียว อาจจะทำเป็นbuilder แยกหน้ามาได้
            - หรืออาจจะทำเป็นBookshelf/Library style
            - แสดง tool ตามเดิม
- [ ] setting page add "workspace"
    - [ ] need apply button to reset the app and start up as chosen workspace
    - [ ] show example mockup for each workspace style
    - [ ] for every workspace style, use same setting window
----- 
