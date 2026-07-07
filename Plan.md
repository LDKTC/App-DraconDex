***AI หลังจากทำเสร็จข้อไหนให้ลบออกจากlist โดยอัตโนมัติ และขยับลำดับให้ด้วย
-
สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
-

-----
part 1 architecture/UI
-
	Main v.3  การเปลี่ยนแปลงหลักที่ต้องการ  แก้ UI&Architec ใหม่ทั้งหมด โดยอ้างอิงจากของเก่ามาใช้
    -Nexus เก็บข้อมูลแบบ Creative IDE โดยมีพื้นที่Explorer แบบอิสระที่ผู้ใช้สามารถจัดระเบียบข้อมูลเองได้เช่นการ สร้างfolderอิสระ และย้ายprojectจากต่างmodulesเข้ามารวมกันในfolderเดียวกันได้  
	-ตอนสร้าง nexus ต้องเลือกfolderจากdirectoryเพื่อมาเก็บไฟล์ของnexus โดยประกอบด้วย
		-.dracondex ใช้เพื่อยืนยันข้อมูลว่าพื้นที่นี่เป้นที่ทำงานของDracondex
		-"nexus name".db เก็บข้อมูลหลักจากแอพ
		-import/ folder สำหรับเก็บข้อมูลอื่นๆที่importหรือสร้างขึ้น นอกเหนือจากDb เช่น *เฉพาะเวอร์ชั่นInstallexeเท่านั้น เวอร์ชั่นPortable จะใช้เป็นการอ้างอิงจุดเก็บไฟล์แทน
			-ไฟล์รูปภาพ Jpeg,Jpg,PNG,WebP,Avif หรือไฟล์รูปภาพต่างๆ
			-ไฟล์เอกสาร PDF,.md,.txt,หรือตระกูลcodeต่างๆ
	-ในแต่ละproject จะแสดงiconของmodule นั้นๆ ไว้ที่ด้านหน้าของชื่อprojectนั้นๆเพื่อแสดงให้รู้ว่าprojectนั้นมาจากmoduleไหน โดยIcon จะเปลี่ยนสีตาม colorของProjectนั้นที่เลือก
	-ในแต่ละproject list สามารถสร้างsubmodule elementขึ้นมาโดยอ้างอิงจากsubmoduleของmoduleนั้นๆ ด้านในจะเป็นลิสที่แสดงsubmodule ของprojectนั้นๆ และยังแสดงทุกsubmoudule-elementอยู่ในlistแบบรวมกัน ผุ้ใช้สามารถสร้างfolder เพื่ิอจัดระเบียบsubmoduleได้ 
	-ปรับStyleหน้าWindow โดยต้องมีส่วนต่อไปนี่
		-title bar/ ส่วนหัวของแอพโดยจะมี
			-Icon app
			-nest toggle/
			-tab bar/ แสดงtabของmain area
				*หากมีmain area 2จะแยกtabระหว่างmain area1 และmain area2
				*tabสามารถย้ายได้อิสระโดยสามารถเลือกดได้ว่าจะย้ายไปmain areaไหน ดึงออกมาเป้นwindow เดี่ยวที่มีแต่main area
			-window style button/
				-overlay popup/ แสดงขึ้นโดยมีสไตล์ให้เลือก
					-default/
						-title bar ด้านบนสุด
						-tools bar แสดงicon อยู่ริมซ้ายสุดของwindow
						-nest อยู่ริมซ้ายถัดออกมาจากtools bar
						-main area 1 อยู่ถัดมาด้านซ้ายของNexus
						-main area 2 อยู่ด้านข้างmain area 1 *เปิดใช้งานได้หากต้องการ
					-watchroom/
						-title bar ด้านบนสุด
						-tools bar แสดงชื่อfunction เป็นแนวนอนอยูใต้title bar
						-nexus nest อยู่ริมซ้ายสุดของwindow
						-main area 1 อยู่ถัดมาทางขวาของNexus 
							-มีtab เป็นแนวตั้งอยู่ทางด้านซ้ายของmain area
						-main area 2 อยู่ขวาถัดต่อมาจากmain area1 หากต้องการจะเปิด
						-main area 3&4 อยู่ด้านใต้main area1&2 ถ้าเปิด
			-main area 2 toggle/ ใช้เปิดปิดmain area 2
			-button set/ปุ่มใช้งานทั่วไป
				-minimal button/
				-toggle fullscreen window/
				-close app/
		-tools bar/ ส่วนnav-sidebar โดยจะมีtoolดังนี้
			-open nexus nest/ ใช้เปิดnexus nestที่่nest ในกรณีที่ใช้Nest เปิดอันอื่นอยู่
			-open sage hut/ เปิดหน้าsage hut บนnest และจะแสดงsubmodule listสำหรับ
			-open import warehouse/
			-create folder/
			-create director project/
			-create navigator project/
			-create hero project/
			-create writer project/
			-create scribe/
			-open artisan/ เปิดoverlay popup ของArtisan เพื่อเลือกสร้างprojectจาก
			-import file menu/
			-export file menu/
		-nest/ แสดงข้อมูลในpanel ที่เก็บlistข้อมูล
		-main area/ พื้นที่หลักในการทำงานของApp
	-แก้โครงสร้างArchitecture moduleใหม่โดยเปลี่ยนตามนี้
		-Nexus ใช้เกิบข้อมูลของproject เป็นไฟล์ (Public/Project/List) *Publicสร้างที่ไหนก็ได้ **Projectต้องอยู่ในProjectเท่านั้น ***Listต้องอยู่ในกับListเป็น เป็นพวกของระบุเช่นสีหรือTag
			-Folder"Collector"/(Public) ไว้เก็บข้อมูลของProject จากแต่ละModule รวมถึงสามารถใช้จัดระเบียบSubmoduleหรือelementได้เช่นกัน
			-Tag/(List) สามารถติดHashtagให้กับfolder/Project/submodule/elementได้ หนึ่งlistสามารถมีได้หลายTag
			-Color/(List) สามารถใส่สีให้กับFolder/Project/Submodule/elementได้ หนึ่งlist/1สี
			-Icon/(List) สามารถเลือกIcon สำหรับแสดงที่หน้าชื่อได้ โดยIconจะเปลี่ยนสีตามที่listนั้นใช้งาน 1list/1Icon
			-Link/(List) เชื่อมต่อโดยมีฝั่งใดฝั่งหนึ่งอ้างอิงIDของอีกฝั่ง
			-Novel"Director"/(Public) 

-----

-----
part 2 UI/UX (ไม่ต้องทำ)
-
	0.ต้องการปรับโครงสร้างUIและUXของAppคล้ายIDE รูปแบบคล้ายๆ obsidian+vscode
	1.Artisan Module Nav-Bar/Button ในแต่ละModuleไม่ต้องแสดงbutton หลังจากที่ACtive project ของModuleนั้นๆแล้ว
	2.Title bar/tab เพิ่มระบบให้สามารถเลื่อนขยับTabซ้ายขวาได้แบบChromeและแอพBrowserอื่น
	3.Direc/Map/Area List ย้ายให้มาอยู่ด้านขวาของMap Graph พร้อมปุ่มในการOpen/Close List tab
	4.Nexus/leftpanel แสดงListของProjectทั้งหมดที่อยู่ในNexusนั้นโดยไม่ต้องแยกประเภทModule โดยแยกประเภทของProjectด้วยIconจากแต่ละโมดูล
	5.Nexus/project list/สร้างFolderของแต่ละNexusแยกกัน
	6.แต่ละNexusจะแยกข้อมูลกันอย่างสมบูรณ์ รวมถึงtag และ relationType
	7.เมื่อสร้างNexusจะเลือกFolderจากexplorer ในเครื่องที่ต้องการใช้เป็นตำแหน่งนั้นเป็น Nexus อาจจุะสร้างไฟล์ .dracondex เพื่อตรวจสอบว่าเป็นNexusจริง และใน.dracondex
	8.Direc/timeline/event list/Text area ให้ย้ายเข้าไปอยู่ในกล่องเดียวกันกับEvent และช่องObject relation Listให้ย้ายมาด้านในEvent List
	9.Direc/timeline/event list เพิ่มปุ่มสำหรับopen/close แต่ละlist โดยเมื่อปิดอยู่จะแสดงข้อมูลจากText area แบบย่อและไม่สามารถแก้ไขได้ เมื่อเปิดจะแสดงText Area ที่สามารถเขียนข้อมูลได้ปกติ พร้อมrelation listของeventนั้นด้วย
	10.Direc/timeline/main area เพิ่มปุ่มที่จะปรับมุมมอง โดยมี 2 แบบ แบบGraph คือรูปแบบในปัจจุบัน อีกอันคือแบบevent list โดยจะมีหน้าEvent detail อยู่ฝั่งขวาและevent listอยู่ฝั่งซ้าย แบบหน้าobject cat 
	11.Direc/Map/graph backgroundเพิ่มgridหรือdot pattern เพื่อให้ผู้ใช้สามารถกะระยะทางของพื้นที่ได้คร่าวๆ
	12.navi/world cat/object list การเชื่อมต่อกับtag แบบdirec/object 
	13.navi/char-cat/char list เพิ่มการแสดงการเชื่อมต่อกับtagที่กำลังเชื่อมต่อกัน แบบDirec/object list
	14.object||อะไรก็ตามที่ใช้Symbolให้เปลี่ยนมาใช้ Minimal Iconแทน พร้อมเปลี่ยนการเก็บข้อมูลเป็นชื่อiconที่จะแสดง
	15.navi/char-cat/char create modal/ช่องใส่symbol ให้ใช้เป็นicon collection แบบmodal symbol collectionที่หลังจากนี้จะถูกเปลี่ยนเป็น icon collectionแทน
	16.navi/map-timeline/leftpanel ให้แสดงmapทั้งหมดของNovelที่เชื่อมต่อกับworldนี้เป็นlistลงมา พร้อมปุ่มopen/closeที่เมื่อกดจะแสดงtimeline listที่ที่ใช้mapนั้นอ้างอิงอยู่ในmap listนั้น
	17.direc/project list ทำให้สามารถขยับย้ายproject listวางในFolderอื่นเพื่อเปลี่ยนfolderได้
-----

