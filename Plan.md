> สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
---
> หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-----
### part 1
#### hub
- [x] 1.nexus nest guideline -> ขยับให้ตรงกับicon 'v'
- [x] 2.hub page header -> เมื่อเปิดแต่ละpage เพิ่มfeatureในการresizable page view
- [x] 3.context menu -> ในcontext menu เมื่อกดright clickที่บนmoduleที่มีbuilder-ของตัวเอง เพื่อbutton 
    - [x] open in new window
    - [x] open in new pane >
        - left, right, top, bottom (layout ref from current pane in work)
- [x] 4.sage hut header page -> เพราะไม่มีiconเหมือนnexus nest กับimport dock ทำให้ขนาดheaderไม่เท่ากับขนาดheaderอื่นในhub
- [x] 5.nexus nest -> list, ที่มีเครื่องหมาย 'v' หรือ '+' จากการเป็นparent จะทำให้เครื่องหมาย ตรงกับiconของmoduleในลำดับเดียวกัน ทำให้สับสนสำหรับผู้ใช้ ขยับพื้นที่paddingของmoduleที่ไม่มีchild ให้เท่ากับmodule ที่มีchildเพื่อให้iconของmoduleที่อยู่ในลำดับที่เท่ากัน
  
### part 2 
#### builder
- [x] 1.builder tab -> แทนที่circle icon ด้วย iconจากmoduleนั้นๆ
- [x] 2.builder tab -> module type name, เปลี่ยนสีให้ลดความสว่างลง และอาจจะลดขนาดลงเพื่อให้ user focus เป็นsecondary และให้User focusที่ ชื่อของmoduleเป็นหลัก
- [x] 3.builder tab -> module type name, ให้ref จากswitch menu บนhubด้วยหาก กำลังtoggle module type เป็น icon mode อยู่ให้แสดง module type บน tab เป็นiconด้วยเช่นกัน
- [x] 4.builder tab -> icon ของmodule บน tab ไม่ว่าจะอยู่ในmode ย่อหรือขยาย ให้ใช้สีของmoduleนั้น
- [x] 5.builder tab -> เมื่อcursorชี้ไปที่builder tab ให้แสดงปุ่มclose tabขึ้นมาก่อนเป็นอันดับแรกในmode ย่อtab
  
### part 3
#### status bar
- [x] 1.status a bar ยังแสดงข้อมูลผิด module majorกับminor
#### setting
- [x] 1.theme div box -> ให้แสดงผลheight ของbox แค่ 4 listต่อครั้ง
- [x] 2.preferences page -> สร้าง modeless window แบบ sidebar navigation layout โดยมี sidebar menuดังนี้
    - [x] Theme color -> แสดงชุดtheme เป็นgrid box โดยมีภาพmockup UIของthemeนั้นๆแสดงอยู่, custom them grid เป็นbox ที่มีเครื่องหมาย '+' ตรงกลางbox 
        - [x] เปลี่ยน custom theme modal ให้เปลี่ยนไปใช้modeless window, เพิ่ม text ในcolor preview และอื่นๆที่แสดงสีได้
        - [x] theme list เพิ่มให้สามารถduplicate themeได้ โดยเมื่อduplicateมาจากstandard จะสามารถeditได้
        - [x] custom theme, เพิ่มระบบ gradiant color 
    - [x] Langauges -> list box ที่มีภาษาให้เลือก
        - [x] module name modeอยู่ด้านใต้ list boxให้เลือก
        - [x] แสดง word preview ที่จะเปลี่ยนไป ทั้งmodule และคำทั่วไป
    - [x] UI size -> ขนาด UI, ขนาด Text
        - [x] เพิ่อปุ่มปรับแต่งเพิ่มเติม เป็นActive button เมื่อกดจะแสดงการประแต่งUIแบบAdvanced
    
### part 4
#### import
- [x] 1.dbเก่าจะชื่อว่า novel-manager.db และ dracondex.db เพิ่มให้สามารถนำเข้ามาในApp ผ่านimportได้ 
- [x] 2.dbที่importเข้ามาในNexusnest จะแปลงข้อมูลต่อไปนี้เข้ามา
    - [x] folder project -> collector
    - [x] module novel"Director" -> collector named "Director"
        - [x] project list -> manager
        - [x] category template attribute -> classifier template attribute
        - [x] category object -> classifier object
        - [x] module(director,naviagator,hero,writer) -> parent collector name as (director,navigatornhero,writer) *v.1.x.x จะมีเพียงdirectorที่ชื่อnovel
        - [x] colortag link(object,module,folder,etc. that had color) -> module color(object,module,folder,etc. that had color)
        - [x] timeline event(dd,mm,yy, h,min) -> chronicler event(dd,mm,yy, h,min) *use event date from timeline date table
        - [x] map area(x,y) -> locator area(x,y) *use location from map area
    - [x] module world"Navigator" -> collector named "Navigator"
        - [x] project list -> manager
        - [x] category charactor -> classifier charactor
        - [x] world origin category template -> classifier object template 
        - [x] world origin category -> classifier object
        - [x] map timeline event -> wanderer event *import link from db and link from locator
        - [x] map timeline object link -> wanderer event object locating *import link from charactor and category
    - [x] module game"Hero" -> collector named "Hero"
        - [x] project list -> manager
        - [x] category element template -> classifier object template
        - [x] category element -> classifier element
        - [x] charactor object -> classifier charactor
        - [x] story dialogue -> narrator dialogue
        - [x] story dialogue conversation -> narrator dialogue convesation
    - [x] module write"writer" -> collector named "Writer"
        - [x] project list -> manager
        - [x] writer series -> collector
        - [x] book -> author
        - [x] book chapter -> author chapter
        - [x] chat session -> scribe session

### part 5
#### Project"Manager" Module
#### Category"Classifier" Module
- [x] 1.ใช้Detail Viewเป็นDefault
- [x] 2.object/element/charactor สามารถเลือกเปลี่ยนIconได้
- [x] 3.classifier element -> levelable
    - [x] เพิ่มช่องแสดงlevelให้กับAttributeที่มีlevelable
    - [x] เพิ่มปุ่มเพิ่มlevelstep ของattribute สามารถกรอกเลเวลเองได้เช่น 3, 5, 999 ลงในช่องlevel
- [x] 4.classifier element -> condition
    - [x] เพิ่มช่องแสดงcondition กรอกเงื่อนไขสำหรับattribute
- [x] 5.classifier attribute -> เพิ่มให้สามารถเลือกการแสดงผลของattributeในclassifierได้โดยมีรูปแบบการแสดงดังนี้ โดยจะแสดงในdetail view
    - [x] Textbox, Default
    - [x] Text Area, 
    - [x] Date box, (dd/mm/yy, h:min)
- [x] 6.classifier relation view -> เพิ่มrelation listโดยแสดงด้านล่างGraphของrelation โดยrelation จะนับเป็นการlinkของobject/element/charactor
    - [x] เพิ่มปุ่มcreate relation โดยอยู่ที่มุมซ้ายด้านล่างของgraph, เมื่อเปิดจะมีmodalแสดงโดยจะแสดงข้อมูลให้เลือกดังนี้
        - insert boxสำหรับกรอกชื่อของrelation โดยมีระบบrecent useแสดงชื่อrelationที่ใช้ล่าสุด 3 ชื่อเป็นlist โดยจะsortตามตัวอักษรที่กำลังพิมพ์
        - object/element/charactor select box โดยมี 2 boxให้เลือก object/element/charactor โดยแสดงในrowเดียวกัน
        - เลือกสีสำหรับrelation line
#### Description"Inspector" Module
- [x] 1.เพิ่มการจัดระเบียบข้อมูลบนTextBoxด้วย การใส่Tab
- [x] 2.เพิ่มCtrl+z Ctrl+Shift+z UndoRedo บนหน้ากระดาษ
#### Map"Locator" Module
- [x] 1.ให้ชื่อareaบนgraph ขยับให้ตรงกับจุดตรงกลางของarea shape
- [x] 2.เพิ่มให้สามารถขยับ area ทั้งชิ้นพร้อมกันได้หาก ใช้tool ลากบนพื้นที่ของareaโดยตรง
#### Timeline"Chronicler" Module
- [x] 1.date บนgraphของoneline ไม่ต้องมีชื่อเดือนหรือปีที่เป็นDefaultที่แสดง ให้ใช้โดยอ้างอิงกับevent date 
    - ไม่ต้องแสดงชื่อเดือน ให้แสดงเลขเดือนแทน, เดือนdefault คือ 12 สามารถเพิ่มขึ้นได้หากevent เดือนที่มากกว่า 12
    - เลขปีสามารถติดลบได้ โดนแสดงก็ต่อเมื่อมีeventที่ปีติดลบ
- [x] 2.มีเพียง 1 timeline/ 1 chronicler โดยcompare viewจะแสดงtimeline ของChronicler นั้น และมีช่องให้เลือก Chroniclerอื่น เพื่อนำมาcompare กับchroniclerนี้
- [x] 3.เพิ่ม view ใหม่ "calendar" โดยจะแสดงหน้าต่างเป็นปฏิทิน และแสดงeventในตารางเวลา
    - เปิดให้ผู้ใช้สามารถตั้งค่าการแสดงผลได้เช่น 1 เดือนมีกี่วัน, 1 สัปดาห์มีกี่วัน, 1 ปีมีกี่เดือน และสามารถให้ผู้ใช้สามารถตั้งชื่อวัน/เดือน ได้
- [x] 4.สีที่เลือกบนmodal ของdownline ย้ายให้กดที่circleของevent listเพื่อเปิดicon selector popup โดยเพิ่มระบบiconให้กับeventสามารถเลือกใช้ได้ และจะแสดงขึ้นมาบนlist และgraph
#### Map-Timeline"Wanderer" Module
- [x] 1.select box ของ locator กับ chronicler ไม่ต้องแสดงlist "เลือกlocator" และ "เลือกchronicler"
- [x] 2.ทำให้Mapที่แสดงไม่สามารถแตะต้องarea ของmapได้ และให้tool linkของwanderer สามารถคลิกสร้างlinkผ่าน บนareaได้เลยโดยไม่แตะที่area 
- [x] 3.แสดงgraphของtimelineด้านใต้ของgraph map เป็นแบบoneline
- [x] 4.ระบบlinkที่สร้าง ไม่ใช่linkกับevent แต่ให้เลือกobject/element/charactor เพื่อมาlinkกับMapและDateของtimeline
    - ขั้นตอนการใช้งาน : ให้เลือกEventจากบนTimeline Graph และกดสร้างlinkลงบนmap objectก็จะแสดงเมื่อเลือกEventนั้นๆ
    - object/element/charactor ที่ใช้linkมาจากclassifierทั้งหมดในnexus แต่สามารถใช้filterเพื่อกรองของที่ต้องเอามาlinkได้ และfilter จะถูกบันทึกไว้ในWandererนั้น
- [x] 5.นำ view Map&Timelineออก, เพิ่มViewใหม่ "Area" แสดงArea Listด้านขวาของMap โดยมีGraph Timelineอยู่ด้านล่าง
    - Area list มีtoggle open/close dropdown listอีกที โดยlistแสดงการเก็บ linkของobject/element/charactor
    - Area list จะเปิดdropdown toggleเป็นOne at the timeเท่านั้น และเมื่อopenอยู่ MapะแสดงAreaนั้นและของที่อยู่ด้านในเท่านั้น
    - Area dropdown list มีปุ่มสำหรับAdd object/element/charactor โดยจะแสดงเฉพาะที่ถูกlinkกับwandererนี้เท่านั้น 
#### Story"Narrator" Module
- [x] 1.ทำให้guide word และ zoom overlayที่อยู่บนgraph กลายเป็นoverlay ที่ไม่ขยับเมื่อเลื่อนGraph
- [x] 2.เพิ่มให้ผู้พูดสามารถLinkกับObject/Element/Charactor ของClassifierได้หากต้องการ โดยสามารถfilter object/element/charactorได้ โดยจะบันทึกไว้ที่Narratorนั้นเลย
- [x] 3.notice textที่เขียนว่า "ให้เลือกtextปลายทาง" ให้ย้ายขั้นมาแสดงตรงกลางบนของgraph โดยslide inจากด้านบนแทน
- [x] 4.view ใหม่ "Dialogue" โดยจะแสดงListของDialogueทั้งหมดพร้อมปุ่ม Toggle open/close เพื่อเปิดdropdown boxที่มีdetail ของDialogueนั้น
    - โดยเพิ่มDescription ให้กับทุกDialogue โดยDescriptionจะแสดงบนnode ในboard viewด้วย
    - dialogue list ที่ด้านล่างชื่อdialogueจะแสดงจำนวนตัวละครในdialogueนั้น โดยจะนับที่ชื่อไม่ซ้ำ พร้อมแสดงจำนวนบทสนทนามีจำนวนกี่บรรทัด
#### Book"Author" Module
- [x] 1.เพิ่มการปรับตัวอักษรแบบพิเศษเช่น Bold, Underline, ตัวเอียง, ขีดฆ่า, ตัวลอย(รูปแบบยกกำลัง)
- [x] 2.เพิ่มการจัดเรียงหน้ากระดาษ Text Align, Left, Center, Right, Stretch, paragraph, เพิ่มตัวเว้นที่เช่น Tab
- [x] 3.เพิ่มให้สามารถจัดเรียงตอนได้แบบอิสระ สามารถขยับขึ้นลงได้
- [x] 4.สามารถตั้งเลขบท และชื่อด้านหน้าเองได้เช่น ตอนที่1.5 หรือ โน้ตตัวที่ 3/4 โดยระบบสร้างอัตโนมัติของบทต่อไป จะสร้างเรียงเป็น +1 จากเลขจำนวนเต็มด้านหน้าทศนิยมเสมอ เช่น 1.5 ตอนต่อไปคือ 2
- [x] 5.เพิ่มviewใหม่ "Book" โดยจะแสดงเนื้อหาเป็นหน้ากระดาษ แบบรวมทุกChapter โดย จะตัดเนื้อหาขึ้นหน้าใหม่ทันทีที่ขั้นchapterใหม่ หรือพิมพ์เกินหน้ากระดาษ
    - ด้านซ้ายแสดงchapterที่กำลังอ่านอยู่ในตอนนี้เป็นเหมือนTopic list
    - เพิ่มให้สามารถexportเป็นไฟล์docได้
#### Chat"Scribe" Module
- [x] 1.chat bubble บนChat view เพิ่มระบบfeatureให้ขยับซ้ายขวาได้ และสามารถเปลี่ยนสีของbubbleได้
- [x] 2.เพิ่มFeature ในการAdd linkขึ้นมา และส่งในchat เป็นBubbleได้
#### Graph"Designer" Module
- [x] 1.module linkเพิ่มระบบที่สามารถfilterได้
- [x] 2.เพิ่มเปลี่ยนscrollmouse เป็นZoomin/ZoomOut
- [x] 3.หัวลูกศรของของLineให้ชี้ไปที่ขอบของnode แทนที่จะเป็นแกนกลาง
#### Relation"Connector" Module
- [x] 1.เพิ่มระบบZoom graphด้วยscrollmouse
#### Analys"Viewer"
#### Doc"Drafter"
- [x] 1.เพิ่มการExportเป็นไฟล์txt/.mdได้
- [x] 2.functionอื่นๆที่ใช้ได้เช่น checkbox, partline, codebox, และอื่นๆของmdไฟล์
#### Drawing"Sketcher"

### part 6
#### module filter
- [ ] 1.แก้ไขระบบfilterของmoduleต่างๆ ให้เป็นระบบfilter คล้ายแบบapp obsidian ที่จะมีfilter ให้เลือกหลายประเภท และสามารถใส่ตัวกรองหลายชุดเพื่อแสดงสิ่งที่อยู่ในตัวกรองแบบunion โดยกรองที่จะใช้มี
    - ประเภทของmodule
    - childของmodule
    - hashtag
    - และอื่นๆ
    - โดยมีระบบกรองแบบระบุตัวกำหนดเช่น
    - is, is not, start with, ends with, contain และอื่นๆ
- [ ] 2.แก้ไขfilter modal เป็นการเปิดpopup แทน
#### modal
- [ ] 1.modalของtaglink เปลี่ยนเป็นpopup แทน
- [ ] 1.modal create module / description modal -> redo UI UXใหม่รู้สึกว่ายังไม่สวยพอ
-----


       
