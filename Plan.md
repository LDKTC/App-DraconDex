> สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
---
> หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-----
### part 1 version.4.0.0
#### Cloud Sync Function
- [ ] Supabase
    - [ ] เปลี่ยนระบบปัจจุบันที่ใช้Sync เป็นระบบToken Sync ที่จะสร้าง16digits token(xxxx-xxxx-xxxx-xxxx) ทุกครั้งที่ทำการSync
    - [ ] .ddx ที่sync จะมีขนาดไม่เกิน 20MB และมีอายุ 72ชม. หลังจากนั้นจะถูกล้างออก
    - [ ] เมื่อผุ้ใช้กรอก 16digits tokenในเครื่องอื่น จะทำการSyncกับSupabase เพื่อดึงเอาส่วนต่างมาลง
    - [ ] ให้ผู้ใช้เลือกครั้งละ 1 nexus ที่ต้องการupload
    - [ ] ผู้ใช้ต้องlogin googleก่อนเพื่อจะสามารถสร้างUploadได้, ให้Quota max 1 upload slot/account โดยจะมีหน้าต่างให้ผู้ใช้สามารถManaged Uploadได้ สามารถลบหรือsyncลงเครื่องที่ใช้อยู่ได้ทันทีหากใช้accountเดียวกันกับที่Upload
    - [ ] เพิ่มfunction locked password ที่ให้ผู้ใช้สามารถใส่password สำหรับการsync uploadได้ โดยเมื่อtokenถูกกรอกจากAccountอื่น จะต้องpassword หากผู้ใช้ใส่รหัสที่Tokenนั้น
- [ ] Google
    - [ ] ใช้ระบบbackupผ่าน google drive appdata folderของผู้ใช้
    - [ ] loginด้วยgoogle และเก็บเป็นข้อมูลlayout profileของผู้ใช้เอาไว้หากต้องการ
    - [ ] เก็บไฟล์ .ddx ด้วยหากผู้ใช้ต้องการ
- [ ] Firebase
    - [ ] เก็บversion update เมื่อผู้ใช้ที่ล็อคอินทำการเปิดแอพจะขึ้นให้ผู้ใช้สามารถเลือกว่าจะอัพเดตเป็นversionใหม่ได้
- [ ] Github
    - [ ] เพิ่มFeature สำหรับExtension download โดยสามารถดึงextension จากgithub มาที่แอพนี้ได้
#### Setting
- [ ] ในsetting window เพิ่ม section โดย 3pageเก่า จะกลายเป็นsection "UI preferences" 
- [ ] เพิ่มsection ใหม่ "Data"
    - [ ] เพิ่มpage "Account", ใช้เป็นหน้าLogin Google Account
    - [ ] เพิ่มpage "Backup" , แสดงการSync มีส่วนที่เป็นtoken sync และส่วนที่เป็นGoogle BackUp Appdata
- [ ] เพิ่มsection ใหม่ "Destop App" 
    - [ ]
#### New simple Layout
- [ ] 
----- 
