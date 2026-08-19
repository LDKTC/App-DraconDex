> สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
---
> หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-----
### Process 1
#### part 1 : nexus
- [ ] module analys text ที่แสดง module หลักบนnexus, เปลี่ยนการแสดง major module แบบ "2" ที่เป็นเลขธรรมดา เป็น "2:144" โดยเลขด้านหลังเป็นจำนวนmodulทั้งหมดโดยรวม child major ทั้งหมดในroot ของ nexusนั้น
#### part 2 : setting
- [x] plugin recommend, แสดงเฉพาะ repo ที่มี file .dracondex เท่านั้น และยกเว้น plugin template
- [ ] version auto updater, ไม่จำเป็นต้อง login แล้ว, เพิ่มpages ในsession appdata "versions" ด้านในจะดึงข้อมูลของ releases จาก draconDex repo
    - [ ] โดยอันแรกสุดของpage จะมีปุ่ม check version และปุ่ม install ที่ซ่อนเอาไว้ จนกว่าจะตรวจสอบ แล้วเจอversionใหม่กว่า
    - [ ] ด้านล่างปุ่ม update จะมี auto-version check checkbox, ที่จะตรวจสอบversion แอปให้อัตโนมัติเมื่อเปิด แอปทุกครั้ง และจะแสดงปุ่ม icon download เป็นสีเขียวบน title bar ด้านข้างsetting เมื่อตรวจสอบพบ versionใหม่

-----
