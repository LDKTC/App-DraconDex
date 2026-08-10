> สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
---
> หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-----
### part 1 : user manual test
#### fix part UI
- [x] ปุ่ม hub toggle btn,
    - [x] ถูกบังหลังจากการกด toggle hub, โดนบังโดย Title ของbuilderที่ขยับมาบัง
    - [x] แก้, เมื่อtoggle off hub ย้ายขยับ toggle btn slide ไปทับ icon บน title แบบแทนที่
- [x] Nav side bar,
    - [x] icon&btn แน่นไปหมด, แก้โดยการ ลดขนาด btn และ เพิ่ม magin ระหว่าง nav bar กับ btn
    - [x] btnของ nav side bar ใช้ widthเป็น % และheight:auto เพื่อรองรับการเพิ่มresizeable feature,
    - [x] เพิ่ม feature resizeable navbar พร้อมhandle
### part 2 : setting part
#### setting window
- [ ] text and sizing,
    - [ ] sizing advance, ที่size input เพื่ม slider ในแถวเดียวกันกับinput โดยใช้อัตราส่วน slide:input box เป็น 5:1 โดยจะแสดงผลเหมือนกันทั้งสองส่วน
    - [ ] max version, ย้ายออกมาแสดงด้านนอก โดยต่อท้ายจากส่วน advance btn
    - [ ] module name, แสดง module type name lists เป็น dual compare lists แสดงทุกชื่อของmodule, lists box height สูงสุด 4-5 lists ตามขนาดwindow ที่กำลังเปิดอยู่
- [ ] tools switch, 
    - [ ] btn, toggle switch จะเปลี่ยน จะแสดงตัวอย่างการแสดงผลบนส่วนต่างๆที่อ้างอิงถึง
- [ ] session head,
    - [ ] open lists ของpagesทั้งหมดใต้แต่ละsession โดยไม่ต้องพับ, session name lists ที่เป็นbtn เปลี่ยนเป็นtext เปล่าได้เลย
- [ ] plugin,
    - [ ] แสดง lists plugin DraconDex เป็น default ที่มาจาก @LDKTC ให้สามารถdownloads ได้ทันที, ยกเว้น repo template
----- 
