> สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
---
> หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-----
### Process 4
#### part 1 : fixing
- [x] icon size fixing, หลังจากอัปเดตแอป เกิดการเปลี่ยนแปลงกับicon ของแอปและUI ส่วนต่างๆ
    - [x] navbar, label ที่ควรแสดงเมื่อขยายnavbarถึงระดับหนึ่งหายไป, ให้แสดงlabel เมื่อขยายnavbar ถึงระดับหนึ่ง
    - [x] navbar, pinned major module icon หายไป เพิ่มการแสดงicon ของmodule ที่ผู้ใช้เลือกใช้บนnavbar
    - [x] bug icon sizeที่มีขนาดใหญ่เกินทำ layout ในส่วนอื่นเละ และจัดแสดงไม่เหมือนเดิม
- [x] UI style, search box บน left panel, แสดงstyle ดังเดิมที่ไม่มีstyle เป็นinput box สีขาว, ตรวจสอบและแก้ให้กลับเป็นดังเดิม
#### part 2 : add and fix
- [x] navbar, เพิ่ม context menu feature สำหรับการtoggle btn quick menu ของhub, โดยมี lists module, sage, import dock โดย nexus nest เป็นhomeไม่สามารถ toggle offได้จึงไม่ต้องมี
- [x] navbar, เมื่อresizing navbar magin/padding ของปุ่มจะไม่ขยายในแกน y 
- [x] left panel, เมื่อresizing ยังคงกระตุกอยู่ ช่วยทำให้สามารถresizing ได้เลื่อนมากขึ้นที

### Procress 5
#### part 1 : setting
- [x] workspace style pages, เปลี่ยนชื่อเป็น "workspace" เฉยๆ
- [x] workspace pages, เพิ่มฟรเจอร์ในการปรับแต่งlayoutเช่น
    - [x] navbar, drake default vertical, wywern default horizontal, dragon default vertical
        - [x] vertical, แบบปัจจุบัน
        - [x] horizontal สร้างแนวนอนไว้ที่title
            - [x] สามารถเลือกได้ว่าจะแสดง label/icon/ทั้งคู่
#### part 2 : file database
- [x] export, ปัจจุบัน export nexus จะออกเป็น .ddx
    - [x] export module, จะสร้างไฟล์ชื่อ .mdx แทนเพื่อแยกความสับสน
- [x] import, เมื่อนำเข้า import .ddx .mdx จะต้องถามUserว่าจะimportเข้า nexusนี้ หรือ สร้าง nexus ใหม่

### Process 6
#### part 1 : feature & fixing
- [x] navbar pin feature, ควรจะ pinned major module ได้ด้วย, แต่ตอนนี้เมื่อกดpin ในcontext menu กลับไม่ขึ้น btn บน navbar
- [x] feature navbar resizing, btn magin/size ระหว่างแต่ละปุ่มที่ขยายขึ้นเมื่อresizing navbar, ปรับให้ไม่ขยายในแกนy สามารถขยายได้แค่ในแกน x เท่านั้น
    - [x] โดยการขยายในแกน x เท่านั้น, จะไม่ทำให้icon ของ btn เกิดการยืดใด
    - [x] เพิ่มใน setting pages "workspace", เป็น custom เพิ่มเติมของ vertical navbar เท่านั้น
- [x] horizontal navbar, ควรจะยืด จนสุดของขอบwindow ของapp ไม่ควรจะมีขนาดแค่ เท่ากับจำนวนรายชื่อของbtn บน bar
    - [x] ปรับให้ layout ของปุ่มบน navbar ใช้แบบเดียว และแบ่งsection แบบเดียวกับ vertical
    - [x] เพิ่มfeature resizingของ horizontal navbar โดยอ้างอิงจาก vertical navbar
- [x] pinned btn บน navbar, เมื่อกดควรจะ only one toggle open dropdown lists at the time หรือก็คือ lists module อื่นในhubถูกปิด จะเปิด focusหาlocate ที่moduleนั้นอยู่ และlists child ของmoduleนั้นเพียงเท่านั้น
    - [x] pinned module btn บน navbar, ไม่ควรในเพื่อ toggle on/off บนhub 
    - [x] ถ้า pinned module นั้นไม่ใช้module collection, จะทำการเปิด moduleนั้น builder ด้วยเช่นกัน
- [x] sliderของ app เมื่อมีcontentยาวกว่าขนาดจอ เป็นสีขาว, ช่วยปรับสีให้เข้า theme app    
#### part 2 : module
- [ ] เพิ่มหน้าtags ที่หายไปจากการลบ legacy, โดยปุ่มจะอยู่บน navbar เหมือนเดิม
    - [ ] tags pages จะแสดงบนหน้าmain area แบบเดียวกับ color โดยจะไม่มีtabbar ด้านบน
- [ ] เมื่อย้ายtabs ไปdock paneใหม่, module ที่ควรเปิดในpane เก่าก่อนที่tabจะถูกย้าย, ควรจะเป็น module ที่เหลืออยู่ในpaneนั้นที่เปิดก่อนหน้าในลำดับbackwards
    - [ ] หากpaneนั้นที่ถูกดึงtabไป ไม่เหลือ tabsอยู่อีกแล้ว ให้แสดงเป็นหน้าจอdefaultเพื่อรอการสร้างtabจากผู้ใช้
        - [ ] แต่หากเป็นกรณีClose tab จนไม่มีtabsในpaneแยกนั้นให้ปิดpaneนั้นเหมือนเดิม

### Process 7
#### part 1 : animating
- [ ] เพิ่มanimation ให้กับการtoggle ต่างๆทั้งหมดบนแอพ เช่น
    - [ ] toggle section บน hub
    - [ ] major module lists toggle
    - [ ] module inspector
- [ ] setting, workspace pages, เพิ่ม section ส่วนที่ถามเรื่องการแสดง animation ด้านล่างส่วนของ layout, default on
    - [ ] เพิ่ม การcustom แบบadvance ให้ปรับความไวของ animate โดยถามเป็นเวลาให้เลือก
#### part 2 : setting
- [ ] เมื่อเกิดการเปลี่ยนเแปลงภายในแอพจาก setting, หน้าsettingจะถูกresetกลับไปด้านบนสุดเสมอ, ทำให้แม้จะresetก็จะแสดงในจุดเดิม
- [ ] Text & sizing, 
-----
