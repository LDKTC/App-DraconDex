-
สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
-
-
หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-
-----
part 1
- [ ] ปรับแก้hub
    - [ ] 1.import dock -> เพิ่มfeatureการลบimport content
    - [ ] 2.import dock -> import folder เพิ่มปุ่มการtoggleเก็บไฟล์เข้าในfolder เป็นDropdown list
    - [ ] 3.nexus nest -> ระบบการmove moduleยังใช้งานไม่ได้, สามารถจับลากได้แต่ไม่ขยับตามหลังจากปล่อย
part 2
- [ ] เพิ่มfeature
    - [ ] 1.เพิ่มfeature right click เพื่อเปิด context menuโดยแต่ละตำแหน่งที่คลิกจะได้menuที่ต่างกัน
        -click บน Nexus Hub -> มี module create list 
            -click บน major module -> มี module create list + minor module/element ถ้ามี + rename + duplicate + moveto + delete + pin toggle
            -click บน minor module -> มี rename + duplicate + moveto + delete
        -click บน Nav-sidebar -> button list toggle เลือกแสดง ปุ่มบน nav sidebar 
- [ ] แก้ไขfeature
    - [ ] 1.Nav-sidebarไม่ต้องมีmodule rail ให้เปลียนเป็นระบบpin moduleแทน
    - [ ] 2.Artisan -> ไม่ต้องมีmoduleเต็ม, ไม่ใช้อีกต่อไป
part 3
- [ ] แก้ไขBuilder
    - [ ] 1.builder tab, ปรับให้tabเป็นdockable tab ที่สามารถลากจัดลำดับการวางของtabบน Tab barได้ และในหน้าsplit tab สามารถทำให้ลากtabข้ามฝั่งได้
    - [ ] 2.เพิ่มปุ่ม button Toggle module inspector
-----


       