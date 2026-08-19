> สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
---
> หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-----
### Process 1
#### part 1 : nexus
- [x] module analys text ที่แสดง module หลักบนnexus, เปลี่ยนการแสดง major module แบบ "2" ที่เป็นเลขธรรมดา เป็น "2:144" โดยเลขด้านหลังเป็นจำนวนmodulทั้งหมดโดยรวม child major module ทั้งหมดในroot ของ nexusนั้น
#### part 2 : setting
- [x] plugin recommend, แสดงเฉพาะ repo ที่มี file .dracondex เท่านั้น และยกเว้น plugin template
- [ ] version auto updater, ไม่จำเป็นต้อง login แล้ว, เพิ่มpages ในsection appdata "versions" ด้านในจะดึงข้อมูลของ releases จาก draconDex repo
    - [ ] โดยอันแรกสุดของpage จะมีปุ่ม check version และปุ่ม install ที่ซ่อนเอาไว้ จนกว่าจะตรวจสอบ แล้วเจอversionใหม่กว่า
    - [ ] ด้านล่างปุ่ม update จะมี auto-version check checkbox, ที่จะตรวจสอบversion แอปให้อัตโนมัติเมื่อเปิด แอปทุกครั้ง และจะแสดงปุ่ม icon download เป็นสีเขียวบน title bar ด้านข้างsetting เมื่อตรวจสอบพบ versionใหม่
#### part 3 : hub
- [ ] sage toggle hub section head, ย้าย sage btn จากnav bar มาไว้ทีsage hub selection head และต้องสามารถใช้ได้จริงด้วย
- [ ] nexus title header, switch nexus btn, ให้นำออก เพราะตอนนี้มีระบบการเปลี่ยนnexus ด้วยการกดที่ชื่อ nexus แล้ว ทำให้ functionเกิดการซ้ำกัน
- [ ] เมื่อsection Head บน hub collapsedอยู่, section head นั้นจะถูก align bottom ไปติดกับ section head ที่อยู่orderถัดไปทันที
    - [ ] และเมื่อเป็น section head สุดท้ายในorder จะถูก align ที่ bottom ของ hub body ในทันที
    - [ ] section head order จะไม่มีทางถูกเปลี่ยน แม้ว่าจะมี section head collapseที่ orderอยู่ก่อน section head ที่เปิดอยู่, ลำดับ order ก็จะไม่ถูกเปลี่ยน เช่น importที่order อยู่ในลำดับที่ 3 ถูกเปิดอยู่ แต่ sageที่ orderในลำดับที่2 collapsedอยู่ ลำดับก็จะไม่มีการเปลี่ยน แต่ sageที่collapse ก็จะถูกดันขึ้นไปพร้อมกับ import และยังแสดงอยู่เหนือ import head แต่อยู่bottomของ nexus nest body ที่order 1 และกำลังเปิดอยู่
#### part 4 : navbar
- [x] เมื่อขยาย navbar จนแสดง label, เพิ่มให้แสดงlabel ของ btn ทั้งหมดบน nav sidebar
- [x] create module btn, นำออก เพราะสามารถสร้างmoduleได้บน nexus nest section 
#### part 5 : import dock
- [x] เมื่อเปิดfile ที่import, ไม่ต้องรีเซ็ต import section, ให้แสดง อยู่ที่จุดเดิมของลิสที่เลื่อนดู

### Process 2 
#### part 1 : nexus hub structure 
- [ ] Nav bar highlight bg remove only, only highlight bar displayed
    - [ ] Nav bar highlight bar, will show as hub displayed เช่นการที่เปิด Nexus nest จะแสดง highlight ที่ Nexus nest btn บน navbar
    - [ ] Nav bar highlight จะแสดงที่ฝั่ง ซ้ายของnavbar
- [ ] "เรียกดูตามประเภท" btn, เมื่อกด จะเปลี่ยนจากการแสดง lists บน builder มาเป็นlist บน hubแทน 
    - [ ] และเมื่อกดเปิด module ที่อยู่ใน hub ก็จะไม่เปลี่ยน hub กลับเป็น nexus nest, แต่จะยังใช้ browser by typesอยู่ 
    - [ ] เปลี่ยนชื่อ "เรียกดูตามประเภท" เป็น "ลิสโมดูล" เพื่อความสั้น และกระชับขึ้น
- [ ] เมื่อกดปุ่มบน navbar จะไม่เปลี่ยนตามปุ่มที่เปิดอีกต่อไปแล้ว จะเปลี่ยนเมื่อ เปิดmodule เท่านั้น
#### part 2 : legacy module structure
- [ ] import db views, legacy moduleจะไม่ถูกใช้อีกต่อไป และจะถูกนำออก, โดยlegacy module ทั้งหมดจะถูกแปลงเป็น Nexus module โดยจะconvert เป็น module ใน nexus nest
    - [ ] module convert จะเลือกconvert module และsubmoduleของlegacy ให้ matchกับ nexus nest moduleที่มีอยู่ทั้งหมด
    - [ ] import db views btn และbuilder ระบบทั้งหมดของ legacyจะถูกนำออกจากแอพ และไม่สามารถเปิดได้อีกต่อไป
- [ ] ถ้าผู้ใช้มีไฟล์ ในLegacy module, เมื่ออัพเดตมาเวอร์ชั่นนี้ จะถามผู้ใช้ด้วยpopup message ว่าจะexport เป็น.ddx เพื่อรอimport มา convert เป็น nexus หรือให้ auto convert ให้เลย
    - [ ] หากผู้ใช้เลือกauto convert, จะแสดงรายการเปรียบเทียบสองฝั่งว่า project และmodule จากlegacy จะกลายเป็นอะไรบ้างใน nexus nest, โดยจะแสดงเป็น lists ผู้ใช้เห็น
        - [ ] ระบบ แสดงconvert lists จะนำไปใช้กับระบบ import db ของแอพด้วยเช่นกัน

### Process 3
#### part 1 : major-minor module knowledge update
- [ ] ตอนนี้ major module ถูกใช้เรียก main tree module โดยมี child module เป็น minor module ที่ถูกเรียก
    - [ ] ตอนนี้ให้เปลี่ยนวิธีเรียกใหม่ เพราะเกิดความเข้าใจผิดมานาน ทำให้การสร้างfeature หรือfunctionต่างๆเกิดความคลาดเคลื่อนไปจากเป้าหมายที่ต้องการ
    - [ ] อันเก่า "Major module" ถูกใช้เรียก module หน้าสุด: อันใหม่ "Main module", อันใหม่ "Major module" จะใช้เรียก module ทุกอัน รวมถึงmoduleที่เป็น child ของ main module และตัวmain moduleเองก็เช่นกัน, อันใหม่ "Minor element" จะใช้เรียก element ย่อยของทุกmajor module เช่น object ของ classifier, area ของ locator, event ของ Chronicler, และของ major อื่นๆ
    - [ ] ปรับใช้ระบบชื่อนี้กับทุกส่วนของแอพ เพื่อให้ใช้มาตรฐานใหม่นี้ และจะได้ไม่เกิดความสับสน
#### part 2 : context menu
- [ ] เพิ่มmenu ปักหมุดใน context menu ของ major module ทุกอันโดนไม่สนว่าต้องเป็น main tree module หรือไม่
- [ ] เพิ่มsub menuให้กับ "move to" ของmajor module โดยจะแสดง menu ของmoduleที่สามารถย้ายไปได้ในทันที โดยไม่ต้องclick ก่อน
- [ ] menu create จะแสดงบนทุก major module
    - [ ] menu create จะสร้าง moduleใหม่ เป็น child ของmodule ที่เปิด context menu นั้นๆ
    - [ ] menu add minor module, นำออก เนื่องจากmenu create ได้ทำหน้าที่ในส่วนนั้นแทนแล้ว
    - [ ] menu collector module, ย้ายไปอยู่บน menu create และแสดง label ว่า "create folder" 
- [ ] เพิ่มmenu import module, และExport moduleด้านล่างของ menu create
- [ ] เพิ่มmenu edit module, เมื่อopen context menuที่moduleใด
    - [ ] นำปุ่มedit module, add minor module ออกจากmodule lists บนhub เมื่อfocus เพราะได้ย้ายเข้ามายังcontext menu แล้ว
- [ ] context create module lists ที่จะแสดงขึ้นเมื่อclick ที่ใดก็ได้บนhub, จะไม่แสดงอีกต่อไปแล้ว
- [ ] เพิ่มcontext menu เมื่อclick ขวาที่import folder or file บน import dock section, เพิ่มmenu delete import เพื่อตัดการเชื่อมต่อ import folder or file ที่มีอยู่จาก nexus นี้
- [ ] menu delete ของcontext menu ควรเป็นสีแดงเพื่อความชัดเจนในอันตรายนี้
-----
