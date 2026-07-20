-
สร้าง procress.md โดยสร้างตามลำดับการทำงานของplanที่สร้าง เพื่อการแบ่งช่วงการทำงาน
-
-
หลังจากทำเสร็จต้อง x checkbox ด้านล่าง
-
-----
part 1
- [ ] hub
    - [ ] 1.nexus nest guideline -> ขยับให้ตรงกับicon 'v'
    - [ ] 2.hub page header -> เมื่อเปิดแต่ละpage เพิ่มfeatureในการresizable page view
    - [ ] 3.context menu -> ในcontext menu เมื่อกดright clickที่บนmoduleที่มีbuilder-ของตัวเอง เพื่อbutton 
        - [ ] open in new window
        - [ ] open in new pane >
            - left, right, top, bottom (layout ref from current pane in work)
    - [ ] 4.sage hut header page -> เพราะไม่มีiconเหมือนnexus nest กับimport dock ทำให้ขนาดheaderไม่เท่ากับขนาดheaderอื่นในhub
part 2 
- [ ] builder
    - [ ] 1.builder tab -> แทนที่circle icon ด้วย iconจากmoduleนั้นๆ
    - [ ] 2.builder tab -> module type name, เปลี่ยนสีให้ลดความสว่างลง และอาจจะลดขนาดลงเพื่อให้ user focus เป็นsecondary และให้User focusที่ ชื่อของmoduleเป็นหลัก
    - [ ] 3.builder tab -> module type name, ให้ref จากswitch menu บนhubด้วยหาก กำลังtoggle module type เป็น icon mode อยู่ให้แสดง module type บน tab เป็นiconด้วยเช่นกัน
    - [ ] 4.builder tab -> icon ของmodule บน tab ไม่ว่าจะอยู่ในmode ย่อหรือขยาย ให้ใช้สีของmoduleนั้น
    - [ ] 5.builder tab -> เมื่อcursorชี้ไปที่builder tab ให้แสดงปุ่มclose tabขึ้นมาก่อนเป็นอันดับแรกในmode ย่อtab
part 3
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
-----


       
