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
- [ ] 1.dbเก่าจะชื่อว่า novel-manager.db และ dracondex.db เพิ่มให้สามารถนำเข้ามาในApp ผ่านimportได้ 
- [ ] 2.dbที่importเข้ามาในNexusnest จะแปลงข้อมูลต่อไปนี้เข้ามา
    - [ ] folder project -> collector
    - [ ] module novel"Director" -> collector named "Director"
        - [ ] project list -> manager
        - [ ] category template attribute -> classifier template attribute
        - [ ] category object -> classifier object
        - [ ] module(director,naviagator,hero,writer) -> parent collector name as (director,navigatornhero,writer) *v.1.x.x จะมีเพียงdirectorที่ชื่อnovel
        - [ ] colortag link(object,module,folder,etc. that had color) -> module color(object,module,folder,etc. that had color)
        - [ ] timeline event(dd,mm,yy, h,min) -> chronicler event(dd,mm,yy, h,min) *use event date from timeline date table
        - [ ] map area(x,y) -> locator area(x,y) *use location from map area
    - [ ] module world"Navigator" -> collector named "Navigator"
        - [ ] project list -> manager
        - [ ] category charactor -> classifier charactor
        - [ ] world origin category template -> classifier object template 
        - [ ] world origin category -> classifier object
        - [ ] map timeline event -> wanderer event *import link from db and link from locator
        - [ ] map timeline object link -> wanderer event object locating *import link from charactor and category
    - [ ] module game"Hero" -> collector named "Hero"
        - [ ] project list -> manager
        - [ ] category element template -> classifier object template
        - [ ] category element -> classifier element
        - [ ] charactor object -> classifier charactor
        - [ ] story dialogue -> narrator dialogue
        - [ ] story dialogue conversation -> narrator dialogue convesation
    - [ ] module write"writer" -> collector named "Writer"
        - [ ] project list -> manager
        - [ ] writer series -> collector
        - [ ] book -> author
        - [ ] book chapter -> author chapter
        - [ ] chat session -> scribe session

### part 5
#### Project"Manager" Module
- [ ] 1.
#### Category"Classifier" Module
- [ ] 1.ใช้Detail Viewเป็นDefault
- [ ] 2.object/element/charactor สามารถเลือกเปลี่ยนIconได้
- [ ] 3.classifier element -> levelable
    - [ ] เพิ่มช่องแสดงlevelให้กับAttributeที่มีlevelable
    - [ ] เพิ่มปุ่มเพิ่มlevelstep ของattribute สามารถกรอกเลเวลเองได้เช่น 3, 5, 999 ลงในช่องlevel
- [ ] 4.classifier element -> condition
    - [ ] เพิ่มช่องแสดงcondition กรอกเงื่อนไขสำหรับattribute
- [ ] 5.classifier attribute -> เพิ่มให้สามารถเลือกการแสดงผลได้โดยมีรูปแบบการแสดงดังนี้ โดยจะแสดงในdetail view
    - [ ] Textbox, Default
    - [ ] Text Area, 
    - [ ] Date box, (dd/mm/yy, h:min)
    - [ ] 
#### Description"Inspector" Module
- [ ] 1.เพิ่มการจัดระเบียบข้อมูลบนTextBoxด้วย การใส่Tab
- [ ] 2.เพิ่มCtrl+z Ctrl+Shift+z UndoRedo บนหน้ากระดาษ
#### Map"Locator" Module
#### Timeline"Chronicler" Module
#### Story"Narrator" Module
#### Book"Author" Module
#### Chat"Scribe" Module
#### Graph"Designer" Module
#### Relation"Connector" Module
#### Analys"Viewer"
#### Doc"Drafter"
#### Drawing"Sketcher"
-----


       
