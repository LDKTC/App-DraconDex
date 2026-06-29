*[multi/1] is this one can be multiple on one topic overhead
*[1/1] is this one can be only by one on topic overhead
*{link /:onselection} is made for user to choose what item from this directory to link with, and should be in the selected directory overhead (public will not force to select from directory overhead)
**database in the plan is in short form, create the detail reference from the exist data

DraconDex v2.2.0 -new module add 
   
    1.World modules call "Navigator"
            
        world modules database 
            -world_project
                -world description [multi/1]
                -novel link [multi/1]{link novel"Director"/project:onselection}
                -charactor [multi/1]
                    -world-novel linker [1/1]{link project/category/object:onselection}
                    -tag linker [multi/1]{link hashtag:onselection}
                -category [multi/1]
                    -world-novel linker [1/1]{link project/category:onselection}
                    -object [multi/1]
                        -symbol [1/1]
                        -tag linker [multi/1]{public link hashtag:onselection}
                -map [multi/1]
                    -world-novel linker [1/1]{link project/map:onselction}
                        -area linker [1/1]{link project/map/area:onselection}
                -map timeline [multi/1]
                    -map linker [1/1]{link world_project/map/:onselection}
                    -timeline [multi/1]
                        -object linker[multi/1]
                -tag linker [multi/1]{public link hashtag:onselection}
                
        novel link:select the novel project to this world project (multi project can link to one world)
        charactor:select one of category from each linked novel project to be charactor 
        map:link with the map in novel project,can edit area in this submodules
        map timeline:Select map on the map modules,create the timeline of object/charactor and  can place selected object/charactor on the map by showing the symbol.
        category:add the symbol select function and that object/charactor will show the symbol on list.use the same pattern as project_category.

DraconDex v2.3.0 -new module add

    2.Game module call "Hero"

        game module database
            -game project
                -game description [multi/1]
                -novel link [1/1]{link novel"Director"/project:onselection}
                -charactor [multi/1]
                    -game-novel linker [1/1]{link project/category/object:onselection}
                    -tag linker [multi/1]{link hashtag:onselection}
                -story [multi/1]
                    -story line [multi/1]
                    -dialogue [multi/1]
                -item [multi/1]
                    -object [multi/1]
                        -symbol [1/1]
                        -tag linker [multi/1]{public link hashtag:onselection}
                -game function [multi/1]
                    -function collection [multi/1]
                -tag linker [multi/1]{link hashtag:onselection}
        
        novel link:can add ref novel project to game project only one each, and able to read category from that novel project
        charactor:has collect stat attribute and custom levelup stat data collection (can modify depending on each game project likes novel project category) 
        game function:has collect fuction like combo attack depend on game, the data should have collect function_type and function_template that depend on each function custom data like condition and effect collecting
        item:the detail is a same like category
        story:can create dialogue node in graph like post-it that show the dialogue name and memo of that dialogue, can connect multi dialogue to create story routes like in VN game
        dialogue: one dialogue contained many charactor speaker and a pack of conversation.

DraconDex v2.4.0 -new module add

    3.Library module call "writer"

        library module database
            -series project
                -library description [multi/1]
                -series [multi/1]
                    -document book [multi/1]
                        -tag linker[multi/1]{public link hashtag:onselection}
                    -novel linker [1/1]{link novel"Director"/project:onselection}
                        -charactor [multi/1]{link project/category/object:onselection}
                        -object [multi/1]{link project/category/object:onselection}
                    -series description [multi/1]
                    -tag linker [multi/1]{public link hashtag:onselection}
                -world linker [multi/1][link world"navigator/project:onselection]
            -export (doc/pdf)
        
        project:collect the series in project
        series:collect all the book in the series
        book:is the document book to write down the story can use tool to tag charactor/object to the word in the story
        novel/world linker:connect to novel/world to use charactor/object to tag in the book

DraconDex v2.5.0 -new module add

    4.Analysis module call "sage"

        analysis module's submodule
            -analysis
                -data size
                    -data size in each module/submodule
                -object amount
                    -object amount in each module/submodule
                -Linker
                    -linker list from each module
                    -linker graph
                        -module
                        -project
                        -object
                        -tag
        
        linker list: display module list on leftpanel and after open the list show the link project lists in main area with the object/charator linked into detail
        linker graph: like the graph from obsidian app there are layer like project object tag that can open

