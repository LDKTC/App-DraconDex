-
สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
-

-----
part 1 Function Edit
-
	-ปุ่ม พับpanel เปิดpanel บนleftpanelสามารถนำออกได้เลย เพราะมีปุ่มtoggle leftpanel แล้ว
    -แก้ไขlayout บนhub
        1.class ph nexus-vault-head ควรจะอยู่ด้านล่างสุดของleft panel
        *เพิ่มระบบ nexus switcher ที่เมื่อกดที่ชื่อnexusนั้น ที่อยู่ด้านล่างสุด จะแสดงdropdown menuขึ้นเหนือชื่อnexusนั้น โดยจะแสดงnexus listทั้งหมดที่มี เมื่อกดที่nexusใดสักอันหนึ่งที่อยู่ในlist จะเปิดnew window โดยwindowนั้นจะเปิดnexus ที่ได้เลือกไ้ว (ระบบWorkspace switcher)
        2.hubที่toggle offอยู่จะถูกเลื่อนลงมาด้านล่าง จนชิดHubอันล่าง แต่หากเป็นhubที่อยู่ล่างสุดอย่างimport dock จะเลื่อนลงไปจนกว่าจะถึงด้านบนของnexus-vault-head ที่อยู่ด้านล่างสุด
        **ระบบพับและเปิดContainer ref จาก Visual studio code
        3.
-
-----


