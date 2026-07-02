Hero module table list (DraconDex v2.6.0)
game_project {
id, codename, name, memo, color, update_at
}
game_novel_link {
id, game_id ref game_project, novel_id ref novel_project, update_at
Unique (game_id, novel_id)(game_id)(novel_id)
}
game_charactor {
id, game_id ref game_project, object_link ref game_cat_object, char_name, color, update_at
}
game_char_template {
id, game_id ref game_project, attribute_name, attribute_type (Text, Num, Textarea), levelable (true, false), update_at
}
game_char_attribute {
id, char_id ref game_charactor, template_id ref game_char_template, attribute_text, level int(false default 0), update_at
Unique(char_id, template_id, level)
}
game_collection {
id, game_id ref game_project, collection_name, color, update_at
}
game_col_template {
id, collection_id ref game_collection, attribute_name, attribute_type (Text, Num, Textarea), levelable (true, false), update_at
}
game_col_element {
id, collection_id ref game_collection, name, color, update_at
}
game_col_attribute {
id, element_id ref game_col_element, template_id ref game_col_template, level int (false default 0), attribut_text, update_at
unique(element_id, template_id, level)
}
game_char_element {
char_id ref game_charactor, element_id ref game_col_element, update_at
unique(game_id,element_id)
}
game_category {
game_id ref game_project, cat_id ref novel_category "query game_novel_link", update_at
unique(game_id, cat_id)
}
game_cat_object {
cat_id ref game_category, object_id ref novel_object "query game_category", update_at
}
game_story {
id, game_id ref game_project, story_name, color, update_at
}
game_dialogue {
id, story_id ref game_story, dialogue_name, memo, color, update_at
}
game_conversation {
id, dialogue_id ref game_dialogue, char_id ref game_charactor, talk_sentence, talk_order, update_at
unique(dialogue_id, talk_order)
}
game_storyline {
story_id ref game_story, dialogue_from ref game_dialogue, dialogue_to ref game_dialogue, color, update_at
unique(dialogue_from, dialogue_to)
}
game_project_hashtag {
game_id ref game_project, hashtag ref hashtag, update_at
unique(game_id, hashtag)
}
game_char_hashtag {
char_id ref game_charactor, hashtag ref hashtag, update_at
unique(char_id, hashtag)
}
game_element_hashtag {
element_id ref game_col_element, hashtag ref hashtag, update_at
unique(element_id, hashtag)
}

แทนที่ Module Hero ทั้งหมดทันที

Module Hero ใหม่ มีsubmodule button ที่จะแสดงบน Hero/nav-sidebar/ 1 button ต่อ 1 submodule
โดยมี submodule list ดังนี้
project (button เดียวกับ Hero/nav-sidebar/project lists เมื่อactive project จะทำให้จากเปิด project list เป็นเปิดหน้าmoduleต่อจากนี้){
    -Hero/leftpanel/Charactor Button เมื่อกดจะเปิด Hero/main area/charactor page ที่จะแสดงcharactor list
    -Hero/main area/charactor page จะมีlayout แบบ direc/project/main area
    -Hero/leftpanel/collection list button ที่จะแสดงList collection ทั้งหมดของProjectนี้
    -Hero/leftpanel/collection button เมื่อกดแล้วจะเปิด Hero/main area/collection page ที่จะแสดงelement list ทั้งหมดของcollectionนั้น
}
ืnovel link {
    -Hero/leftpanel/novel insert box ที่มี 1 ช่องให้เลือกใส่ 1 novel_project ต่อ 1 game_project
    -Hero/leftpanel/category list button ที่จะแสดงลิสcategory ทั้งหมดของnovel_projectที่เลือก
    -Hero/leftpanel/category button จะเปิด Hero/main area/object list ที่จะแสดงlistของobject ทั้งหมดจากcatนั้น
}
story {
    -Hero/leftpanel/Story list ที่จะแสดงList Story ที่มีอยู่ในgame_project นั้น
    -Hero/leftpanel/story button เมื่อกดจะเปิด -Hero/main area/story graphของStoryนั้น โดยในgraph จะแสดงDialogueเป็นnodeแบบnote ที่แสดงชื่อและMemoของDialogueนั้น และมีEdge ที่เชื่อมระหว่างdialogue โดยอ้างอิงgame storyline
    -Hero/main area/story graph/dialogue buttonเมื่อกดจะแสดงlistของconversationที่อยู่ในDialogueนั้นๆ โดยListจะแสดงที่ขวาของStory graph
    -Hero/main area/conversation list ในหนึ่งconversation จะต้องเลือกcharactor 1 ตัวที่มีในGame_projectนั้น และข้อความที่Charactorนั้นพูด
}
project hashtag {
    mirror ระบบและStyle จากProject tagของ direc/
}