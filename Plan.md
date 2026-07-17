-
สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
-
-
หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-
-----
part 1
- [ ] 1.builder pane -> เมื่อย้ายtabกลับจากpaneที่splitออกไป ตัวpane ไม่ได้ถูกปิดไป -> แก้เป็นให้ปิดเมื่อไม่มีtabหลงเหลือในpaneนั้นแล้ว
    - [ ] 1.1.Bugs:เมื่อกดปิดbuilder pane ที่ยังมีbuilder tabเหลืออยู่ tab นั้นจะถูกส่งกลับมายังmain paneที่ยังเปิดอยู่ แต่เมื่อกดเปิดtabนั้นในmain pane ระบบจะสร้างเป็นnew builder windowขึ้นมาแทน ซึ่งไม่ใช่ทางที่ถูกต้อง. มีทางเลือกการแก้ไขให้ ให้เลือกอันที่เหมาะสมที่สุด
        - ให้ใช้การปิดtabนั้นทันทีที่ปิดpane ที่มีtabนั้นเปิดอยู่
        - ส่งtabนั้นกลับมาและให้สามารถเปิดในpaneนั้นโดยไม่สร้างเป็นnew window
- [ ] 2.builder new window tab -> เมื่อย้ายtab จากwindowใหม่ เพิ่มระบบให้รองรับการย้ายกลับมายังmain windowด้วย
    - [ ] 2.1.builder new window tab -> แก้แบบเดียวกับข้อ 1. แต่คราวนี้แก้ที่new window เมื่อขยายออกมาแล้วลากtabกลับไปยังmain window หากในbuilder window นั้นไม่มีtabเหลืออยู่จะให้ปิดอัตโนมัติ
- [ ] 3.builder tab bar -> แก้ระบบการย้ายtab โดยให้ล็อคtabไว้กับtab bar และเมื่อลากtabให้ใช้การslideผ่านtabอื่นๆแทน. และจะสามารถย้ายออกtab barที่ถูกล็อคได้ก็ต่อเมื่อลากเมาส์โดยhold click tabที่กำลังย้ายออกมานอกtab barในระยะหนึ่ง
    - reference -> chrome tab slider ?หากมีfunctionหรือfeatureที่มีก่อนแล้วให้ใช้แบบที่เขามีได้เลย
part 2
- [ ] 1.nav sidebar -> remove feature explorer เก่า ที่จะแสดงการอ้างอิง list moduleต่างๆ จากโครงสร้างdbเก่า โดยให้เปลี่ยนมาเป็นการใช้เพื่อแสดงและคัดแยกmodule ตามแต่ละประเภทที่มีอยู่ใน nexus นั้นๆแทน นับทุกmodule
- [ ] 2.builder tab bar -> split pane button ให้ย้ายไปที่อื่นที่เหมาะสมกว่าเพราะผู้ใช้จะสับสนเมื่อใช้ปุ่มtoggle module inspector
    - [ ] 2.1.เปลี่ยนicon module inspector toggle ให้เป็นแบบhub toggle แบบกลับด้าน
part 3
- [ ] 1.chronicler module -> oneline view, zoom function มีbugเกิดขึ้น เมื่อzoomin การแสดงผลnode circle จะขลาดเคลื่อนกับnode event
- [ ] 2.chronicler module -> oneline view, เพิ่ม event inspectorเข้าไปด้วย โดยจะแสดงeventที่กดเลือกบนgraph, inspector จะอยู่ด้านล่างของgraph
    - [ ] 2.1.downline view, เพิ่มinspectorของevent โดยแสดงเมื่อทีevent listใดๆ บนฝั่งขวา และแสดงเป็นdropdown inspector page ที่มีข้อมูลของevent และสามารถแก้ไขได้แบบautosave
    - [ ] 2.2.downline view, inspector dropdown เปิดเป็น one at the time, เมื่อมีอันไหนเปิดอันอื่นๆก็จะปิดพับขึ้นทันที
part 4
- [ ] 1.Ui ของdropdown list selection box ที่เป็นสีขาวทุกอันในapp เปลี่ยนUIให้เข้ากับ UI อื่นในแอพ เช่นการเปลี่ยนสีเข้ากับTheme
-----


       