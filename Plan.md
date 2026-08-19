> สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
---
> หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-----
## procress 1, do clear after finished
### part 1 : UI style changes
- [x] btn,
    - [x] Btn, radius border 0, และpadding ให้เป็น 0 
    - [x] ปุ่ม Forward, Backward, เปลี่ยนให้เป็นicon ไม้ใช่emoji, ถ้าเป็นicon อยู่แล้วให้เปลี่ยนเป็น แบบone color
- [x] hub, 
    - [x] sage pages header, เพิ่มปุ่มปลอมๆหรือ icon ที่ไม่ใช่ btn เพื่อขยายขนาดheaderให้เท่ากับ pages header อื่น
    - [x] folder child guide line, ขยับมาทางซ้ายให้ตรงกับลูกศร v 
    - [x] hub lists div.li, border radius 0
### part 2 : builder changes
- [x] tab,
    - [x] เปลี่ยนระบบtab, จากระบบ open module open tab, เป็น open module changes tab, ระบบเพิ่มtabยังมีเหมือนเดิม
    - [x] pane separate btn, นำออก และนำมาใส่เป็นcontext menu เมื่อคลิกขวาแทน โดยรวมในmenu separate pane >
    - [x] เมื่อไม่มี tabบน tab bar หน้าmoduleที่ใช้จะเป็น none
### part 3 : setting 
- [x] changes on tap, 
    - [x] เมื่อclick selectedซักอัน, ในตอนนี้ ยังcheck selected อยู่ที่listsเก่า แม้ว่าpreferrencs จะเปลี่ยนแล้ว, ต้องการให้check selected แบบ real time
    - [x] ภาษาที่อยู่ setting ไม่เปลี่ยนตามภาษาที่เลือกใช้ในทันที, ทำให้เปลี่ยนทันที

## process 2, do clear after finished
### part 1 : Nav bar
- [x] btn, on active, เพิ่มการแสดงแถบสีhighlightด้านข้าง เพื่อให้รู้ว่าเป็น page ที่ active 
- [x] resizing feature, เมื่อขยายถึงจุดหนึ่ง ให้แสดง page name ของแต่ละbtn ตามด้านหลังชื่อ
- [x] ย้ายปุ่ม toggle hub จากบนtitle bar, ลงมาอยู่บนhub ด้านข้างช่องSearch, เมื่อ toggle hub off,app icon btn บน navbar จะเปลี่ยนเป้นปุ่มสำหรับ toggle on ทันที, และจะกลับเป็น icon เมื่อtoggle on อยู่
### part 2 : Setting 
- [ ] setting, เพิ่มpage "start up" แสดงอยู่ในsession "Workspace"
    - [ ] start up, เพิ่มsetting choice, auto open latest nexus หรือ open welcome screenแบบเดิม.
----- 
