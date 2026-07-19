-
สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
-
-
หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-
-----
part 1
- [x] hub
    - [x] 1.minor module -> icon ชิดกับguidelineเกินไป ขยับออกมาเล็กน้อย
    - [x] 2.nexus nest header -> เพิ่ม option menu เมื่อคลิกจะเปิดเป็นpopupmenu
        - [x] menu 1.switch toggle เพื่อเปิดปิดการแสดงminor module
        - [x] menu 2.switch toggle module icon เปิดปิด icon ด้านหน้าmodule
        - [x] menu 3.switch module signature mode, 2 mode name และ icon.
            - mode name จะแสดงชื่อmoduleด้านหลังของชื่อของ module บนnest, default
            - mode icon จะแสดงicon ปรับจำmodule แทนที่ของชื่อmoduleด้านหลังชื่อ module บนnest
    - [x] 3.nexus nest list -> module list, ปุ่มdragable ด้านหน้าให้นำออกเพราะไม่จำเป็นต้องใช้, เพราะสามารถdrag ด้วยการลากบนbuttonได้เลย
    - [x] 4.nexus nest list -> major module list, เพิ่มเงื่อนไขหากในmodule ไหนมี minor moduleอยู่เพียงอย่างเดียวโดยไม่มีmajor moduleเป็นchild ให้เปลี่ยนiconตัวขยาย จาก '>' เป็น '+' และตัวเปิดจาก '∨' เป็น '-'
- [x] style.css
    - [x] 1.div-hub body -> ให้ชิดขอบdiv left panel innerไปเลย, อาจจะมีpadding 1px
        - [x] 1.module list button -> ไม่ต้องมีborder, ไม่ต้องมีmagin, ลดpadding top-bottom เหลือ 1-2px
        - [x] 2.div acc-head -> ลดpaddingลงเหลือ 1-2px
        - ปรับให้คล้ายกับ vS code explorer
    - [x] 2.div left-inner foot -> div.ph nexus vault head, ลดขนาด padding เหลิอ 1-2px, ไม่มี magin 
    - [x] 3.div search bar -> ลด padding เป็น 1-2px, เอาmaginออก
    - [x] 4.nav navside bar -> ลด padding เป็น 1-2px, เอาmagin left-right ของbuttonออก
part 2
- [ ] hub page
    - [ ] 1.เรียกดูตามประเภท บนhubให้ย้ายไปเปิดเป็นhubใหม่ผ่าน button บนnavsidebar
    - [ ] 2.นำเข้าข้อมูลเดิม บนhubให้นำออก และเปลี่ยนเป็นการนำเข้าโดยจะแปลงมาเป็นmodule ใหม่บนnexus nest, เพิ่ม modal ถามผู้ใช้หากนำเข้า db ของ v.2/v.1 ว่าจะนำเข้าเป็นnexus nest หรือเป็น import db (v.3.10+ สกุลไฟล์ของnexus nest จะเปลี่ยนเป็น .ddx หลังpart 3)
        - [ ] หากน้ำเข้าเป็น import db, เพิ่ม navsidebar button เพื่อเปิดhubของ novel manager โดยเฉพาะโดยแสดงแยกเป็น moduleเหมือนเดิม, director/navigator/hero/writer/scribe
            - หากมี import db ตัวเดิมอยู่แล้วจะupdateข้อมูลของdbนั้นแทน
            - import db สามารถviewได้อย่างเดียว
        - [ ] หากนำเข้าเป็น nexus nest, ให้นำเข้ามาเป็น collector แยกตามmodule, director/navigator/hero/writer/scribe, โดยด้านในจะแปลง projectเป็น manager, และด้านในmanagerจะแปลงsubmodule เป็นmajor moduleต่างๆ
            - novel"director" 
                - description จะเปลี่ยนเป็น inspector, 1des/1ins module
                - category จะเปลี่ยนเป็นclassifier, 1cat/1class module
                    - objectจะแปลงเป็น minor module object ในclassifier
                - timeline จะเปลี่ยนเป็นchronicler, 1time/1chro module
                    - event จะเปลี่ยนเป็น minor module eventในchronicler
                - map จะเปลี่ยนเป็นlocator, 1map/1lo module
                    - area จะเปลี่ยนเป็น minor module eventในlocator
                - relation จะเปลี่ยนเป็น connector พร้อมfilter classifier ที่อยู่ใน collectorของdirector
            - moduleอื่นๆ ก็ทำในรูปแบบเดียวกับdirector
part 3
- [ ] 1.เปลี่ยนไฟล์dbของapp หลังจากversionปัจจุบัน เป็นสกุล .ddx
-----


       
