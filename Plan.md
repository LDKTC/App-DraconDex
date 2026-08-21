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
- [ ] navbar, เพิ่ม context menu feature สำหรับการtoggle btn quick menu ของhub, โดยมี lists module, sage, import dock โดย nexus nest เป็นhomeไม่สามารถ toggle offได้จึงไม่ต้องมี
- [ ] navbar, เมื่อresizing navbar magin/padding ของปุ่มจะไม่ขยายในแกน y 
- [ ] left panel, เมื่อresizing ยังคงกระตุกอยู่ ช่วยทำให้สามารถresizing ได้เลื่อนมากขึ้นที

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
#### part 1 : 
-----
