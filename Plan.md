***AI หลังจากทำเสร็จข้อไหนให้ลบออกจากlist โดยอัตโนมัติ และขยับลำดับให้ด้วย
-
สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
-

-----
part 1 architecture/UI
-
	Main v.3  การเปลี่ยนแปลงหลักที่ต้องการ  แก้ UI&Architec ใหม่ทั้งหมด โดยอ้างอิงจากของเก่ามาใช้
    -โครงสร้างแอพ-Architecture
		-hub"Nexus" nest สำหรับเก็บข้อมูลจากชุดDB
			Major module สร้างและแสดงอยู่ในlistของnest
			-Folder"Collector" สร้างไว้เพื่อจัดระเบียบข้อมูล
			-Project"Manager" จัดระเบียบข้อมูลเหมือนกัน แต่สามารถเปิดเพื่อดูเนื้อหาของที่อยู่ด้านในได้
			-Detail"Inspector" ไว้เขียนรายละเอียดเป็นnote เล็กๆน้อย
			-Category"Classifier" สร้างกลุ่มข้อมูลโดยมีtemplate เป็นแกนหลักของmodule และต้องเลือกประเภทข้อมูลที่จะสร้างจากด้านสร้างหนึ่ง category ต่อ 1
				-Object
				-Element
				-Charactor
			-Map"Locator"
				-Area
			-Timeline"Chronicle"
				-Event
			-TimeMap"Wanderer"
				-MapEvent
			-Story"Narrator"
				-Dialogue
			-Book"Author"
				-Chapter
			-Chat"Scribe"
				-note
			-Doc"Drafter"
			-Analys"Viewer"
			-Relation"Connector"
		-Analys"Sage Hut"
		-Import Dock
-----



