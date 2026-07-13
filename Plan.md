-
สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
-
-
หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-
-----
part 2
- [ ] เพิ่มfeature
    - [ ] 1.เพิ่มfeature right click เพื่อเปิด context menuโดยแต่ละตำแหน่งที่คลิกจะได้menuที่ต่างกัน
        -click บน Nexus Hub -> มี module create list 
            -click บน major module -> มี module create list + minor module/element ถ้ามี + rename + duplicate + moveto + delete + pin toggle
            -click บน minor module -> มี rename + duplicate + moveto + delete
        -click บน Nav-sidebar -> button list toggle เลือกแสดง ปุ่มบน nav sidebar 
    - [ ] 2.Artisan ->เมื่อผู้ใช้เลือก templateได้แล้ว จะแสดงModalเป็นstep เพื่อให้ผู้ใช้ตั้งค่า module แต่ละส่วนเอง
        -โดยจะเริ่มต้นที่ manager modal จากนั้นจะเปิดmodal ของแต่ละmodule ตามtemplateที่เลือก โดยให้สามารชื่อเลือกสีiconได้เอง
    - [ ] 3.icon import -> เพิ่มระบบให้ผู้ใช้สามารถCropรูปให้เป็นวงกลม และจะแสดงผลภาพนั้นเป็นiconได้ โดยสามารถเลือกimportรูปได้เอง
- [ ] แก้ไขfeature
    - [ ] 1.Nav-sidebarไม่ต้องมีmodule rail ให้เปลียนเป็นระบบpin moduleแทน
    - [ ] 2.Artisan -> ไม่ต้องมีmoduleเต็ม, ไม่ใช้อีกต่อไป
    - [ ] 3.icon popup -> ขยายpopup แสดงผลครบถ้วน หรือไม่ก็ปรับ div ส่วน icon collection ให้มีvertical slider ทำให้สามารถเลื่อนลงในแนวตั้งได้
    - [ ] 4.icon popup -> ย้ายPreviewขึ้นด้านบนของoverlay และเอาSearch box ออก
part 3
- [ ] แก้ไขBuilder
    - [ ] 1.builder tab, ปรับให้tabเป็นdockable tab ที่สามารถลากจัดลำดับการวางของtabบน Tab barได้ และในหน้าsplit tab สามารถทำให้ลากtabข้ามฝั่งได้
    - [ ] 2.เพิ่มปุ่ม button Toggle module inspector
-----


       