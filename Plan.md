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
			Major module '-' สามารถสร้างและจะแสดงอยู่ในlistของnest สามารถย้ายวางได้อิสระ
			Minor module '=' ที่อยู่ใต้Major จะต้องอยู่ด้านใต้ของmajorตัวเองเท่านั้นไม่สามารถย้ายข้ามกันได้
			module detail '+' ระบุเพิ่มเติมเพื่อขยายข้อมูลของmodule
			module UI ':' รเพื่อระบุความต้องการUIที่ต้องการแสดง
			-Folder"Collector" สร้างไว้เพื่อจัดระเบียบข้อมูล
			-Project"Manager" จัดระเบียบข้อมูลเหมือนกัน แต่สามารถเปิดเพื่อดูเนื้อหาของที่อยู่ด้านในได้
			-Detail"Inspector" ไว้เขียนรายละเอียดเป็นnote เล็กๆน้อย
			-Category"Classifier" สร้างกลุ่มข้อมูลโดยมีtemplate เป็นแกนหลักของmodule และต้องเลือกประเภทข้อมูลที่จะสร้างจากด้านล่างหนึ่งประเภทต่อcategoryที่สร้าง
				=Object สามารถใช้สร้างAttributeจากtemplateได้ เป็นDefaultของcategory
				=Element สร้างAttribute templatecแบบobject แต่ที่ไม่เหมือนกันคือ มีปุ่มให้เลือกว่าattribute จะLevelable และจะมีconditionได้หรือไม่
				=Charactor สร้างAttribute template แบบObject แต่ที่แตกต่างคือสามารถสร้างcustom AttributeเฉพาะของCharactorนั้นเพียง objectเดียวได้
			-Map"Locator" สร้างพื้นที่Graphเพื่อสร้างmapping โดยกราฟมีBG pattern เพื่อให้ผู้ใช้สามารถกะระยะได้
				=Area พื้นที่ที่จะถูกวางในMap โดยใช้การ locate x,y
			-Timeline"Chronicler" สร้างgraphเส้นตรง เพื่อสร้างtimemapping แสดงจุดที่event เกิดบนtimelineนั้น
				=Event เป็น node overlay ที่จะถูกระบุอยู่บนgraph timeline และเก็บค่า date(d/m/y,h:min)
			-TimeMap"Wanderer" เป็นการผสมผสานของMap และTimeline จะแสดงเป็นกราฟคู่
				=MapEvent สร้างโดยการเลือก MapและTimelineที่มัอยู่ก่อนแล้วมาอย่างละหนึ่งเพื่อใช้อ้างอิงในMapEvent และจากนั้นก็สร้างLink ItemมาวางบนMap โดยเลือกeventเพื่อเลือกเวลาในการแสดง 
			-Story"Narrator" การสร้างระบบRouteของเนื้อเรื่อง โดยมีGraph board
				=Dialogue nodeที่จะถูกวางบนgraph board เพื่อสร้างRouteเนื้อเรื่อง จะมีConversation ที่บันทึกเอาไว้
			-Book"Author" หนังสือที่จะเก็บเนื้อเรื่องนิยายเหลือเนื้อหาเอาไว้
				=Chapter แบ่งตอนของเนื้อในหลังสือเพื่อไม่ให้ยาวเกินไป
			-Chat"Scribe" หน้าchatที่มีหน้าที่เพื่อnote แบบพิมพ์เป็นแชต
				=note หนึ่งSessionของchat จดข้อความเป็นBubblesข้อความ
			-Doc"Drafter" กระดาษเปล่าคล้าย.md ใช้จดข้อมูลทั่วไป
			-Analys"Viewer" moduleเพื่อแสดงผลของlistที่filterเอาไว้
			-Relation"Connector" moduleเพื่อแสดงgraph relationของlistที่filterไว้
		-Analys"Sage Hut" สำหรับดูanalysข้อมูลทั้งหมดในแอพ
		-Import Dock เปิดImportจากfolderที่สร้างเอาไว้แบบVaultของObsidian โดยสามารถImportพวกรูปภาพ/ไฟล์เอกสารเพื่อlinkกับlistในnestได้
-----

-----
part Claude
-
	สรุปแผนจาก progress.md (ออกแบบ UI v3 อ้างอิง Obsidian+VSCode — ยังไม่เริ่มโค้ด)
	-Dynamic module toolbar เปลี่ยน nav-sidebar จากปุ่ม module ตายตัว เป็น toolbar สร้าง Major module ใหม่ + icon แถบที่เพิ่มอัตโนมัติ
	-Hub panel shell ทำ accordion 3 ส่วนใน left-panel: Nexus nest / Sage Hut / Import Dock
	-Nexus nest section ต้นไม้ Major/Minor ลากจัดลำดับ Major ได้ Minor ล็อกอยู่ใต้ Major ตัวเอง
	-Module detail(+) และ module UI(:) inspector panel แบบ properties panel ของ Obsidian
	-Category"Classifier" เลือกประเภท Object/Element/Character ตอนสร้าง category
	-Folder"Collector"/Project"Manager"/Detail"Inspector" โมดูลจัดระเบียบข้อมูลเบาๆ
	-Map"Locator" กราฟพื้นที่มี BG grid วาง Area ด้วย x,y
	-Timeline"Chronicler" กราฟเส้นตรงวาง Event ตาม date/time
	-TimeMap"Wanderer" รวม Map+Timeline เป็นกราฟคู่ ผูกด้วย MapEvent
	-Story"Narrator" กระดาน graph วาง Dialogue node เก็บ Conversation
	-Book"Author" หนังสือ/Chapter ใช้ markdown editor เดิม
	-Chat"Scribe" หน้า chat bubble แบบ note (ชื่อชนกับ Scribe เดิม — ดู open question ใน progress.md)
	-Doc"Drafter" กระดาษเปล่า markdown (ใช้ editor ตัวเดียวกับ Scribe ปัจจุบัน)
	-Analys"Viewer"/Relation"Connector" แสดงผล list ที่ filter ไว้ และกราฟความสัมพันธ์
	-Sage Hut section ย้ายเข้า hub panel accordion แทนปุ่ม nav-rail เดิม
	-Import Dock section import ไฟล์แบบ Obsidian vault แล้ว link เข้า nest
	-Artisan template migration ย้าย Director/Navigator/Hero/Writer เป็น template ใน Artisan ใช้ตอนสร้าง Major module ใหม่ผ่าน Classifier
	-เอกสารฉบับเต็ม: progress.md (root) + mockup HTML (Claude Artifact)
-----


