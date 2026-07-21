> สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
---
> หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-----
### part 1
- [ ] hub
    - [ ] 1.nexus nest guideline -> ขยับให้ตรงกับicon 'v'
    - [ ] 2.hub page header -> เมื่อเปิดแต่ละpage เพิ่มfeatureในการresizable page view
    - [ ] 3.context menu -> ในcontext menu เมื่อกดright clickที่บนmoduleที่มีbuilder-ของตัวเอง เพื่อbutton 
        - [ ] open in new window
        - [ ] open in new pane >
            - left, right, top, bottom (layout ref from current pane in work)
    - [ ] 4.sage hut header page -> เพราะไม่มีiconเหมือนnexus nest กับimport dock ทำให้ขนาดheaderไม่เท่ากับขนาดheaderอื่นในhub
    - [ ] 5.nexus nest -> list, ที่มีเครื่องหมาย 'v' หรือ '+' จากการเป็นparent จะทำให้เครื่องหมาย ตรงกับiconของmoduleในลำดับเดียวกัน ทำให้สับสนสำหรับผู้ใช้ ขยับพื้นที่paddingของmoduleที่ไม่มีchild ให้เท่ากับmodule ที่มีchildเพื่อให้iconของmoduleที่อยู่ในลำดับที่เท่ากัน
  
### part 2 
- [ ] builder
    - [ ] 1.builder tab -> แทนที่circle icon ด้วย iconจากmoduleนั้นๆ
    - [ ] 2.builder tab -> module type name, เปลี่ยนสีให้ลดความสว่างลง และอาจจะลดขนาดลงเพื่อให้ user focus เป็นsecondary และให้User focusที่ ชื่อของmoduleเป็นหลัก
    - [ ] 3.builder tab -> module type name, ให้ref จากswitch menu บนhubด้วยหาก กำลังtoggle module type เป็น icon mode อยู่ให้แสดง module type บน tab เป็นiconด้วยเช่นกัน
    - [ ] 4.builder tab -> icon ของmodule บน tab ไม่ว่าจะอยู่ในmode ย่อหรือขยาย ให้ใช้สีของmoduleนั้น
    - [ ] 5.builder tab -> เมื่อcursorชี้ไปที่builder tab ให้แสดงปุ่มclose tabขึ้นมาก่อนเป็นอันดับแรกในmode ย่อtab
  
### part 3
- [ ] status bar
    - [ ] 1.status a bar ยังแสดงข้อมูลผิด module majorกับminor
- [ ] setting
    - [ ] 1.theme div box -> ให้แสดงผลheight ของbox แค่ 4 listต่อครั้ง
    - [ ] 2.preferences page -> สร้าง modeless window แบบ sidebar navigation layout โดยมี sidebar menuดังนี้
        - [ ] Theme color -> แสดงชุดtheme เป็นgrid box โดยมีภาพmockup UIของthemeนั้นๆแสดงอยู่, custom them grid เป็นbox ที่มีเครื่องหมาย '+' ตรงกลางbox 
            - [ ] เปลี่ยน custom theme modal ให้เปลี่ยนไปใช้modeless window, เพิ่ม text ในcolor preview และอื่นๆที่แสดงสีได้
            - [ ] theme list เพิ่มให้สามารถduplicate themeได้ โดยเมื่อduplicateมาจากstandard จะสามารถeditได้
            - [ ] custom theme, เพิ่มระบบ gradiant color 
        - [ ] Langauges -> list box ที่มีภาษาให้เลือก
            - [ ] module name modeอยู่ด้านใต้ list boxให้เลือก
            - [ ] แสดง word preview ที่จะเปลี่ยนไป ทั้งmodule และคำทั่วไป
        - [ ] UI size -> ขนาด UI, ขนาด Text
            - [ ] เพิ่อปุ่มปรับแต่งเพิ่มเติม เป็นActive button เมื่อกดจะแสดงการประแต่งUIแบบAdvanced
    
### part 4
- [ ] import
    - [ ] dbเก่าจะชื่อว่า novel-manager.db และ dracondex.db เพิ่มให้สามารถนำเข้ามาในApp ผ่านimportได้ 
    - [ ] dbที่importเข้ามาในNexusnest จะแปลงข้อมูลต่อไปนี้เข้ามา
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
- [ ] 5.1. Project"Manager" Module
- [ ] 5.2. Category"Classifier" Module
- [ ] 5.3. Description"Inspector" Module
- [ ] 5.4. Map"Locator" Module
- [ ] 5.5. Timeline"Chronicler" Module
- [ ] 5.6. Story"Narrator" Module
- [ ] 5.7. Book"Author" Module
- [ ] 5.8. Chat"Scribe" Module
- [ ] 5.9. Graph"Designer" Module
- [ ] 5.10. Relation"Connector" Module
- [ ] 5.11. Analys"Viewer"
- [ ] 5.12. Doc"Drafter"
- [ ] 5.13. Drawing"Sketcher"
-----


       
