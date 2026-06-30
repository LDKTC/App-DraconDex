module plan v.2.5.2

    navigator module db

    world_project {
        id int prikey increment "date+count",
        codename text notnull unique ex."AAA",
        name text notnull,
        memo text,
        color int ref use_color.id 1/1,
        update_at text notnull "datetime(now)"
    }
    world_novel {
        id int prikey increment "date+count",
        world_id int ref world_project.id n/1,
        novel_id int ref project.id 1/1,
        update_at text notnull "datetime(now)",
        unique(world_id,novel_id)
    }
    world_charactor {
        id int prikey increment "date+count",
        world_id int ref world_project.id n/1,
        color int ref use_color.id n/1,
        symbol text
        update_at text notnull "datetime(now)"
    }
    world_charactor_category {
        id int prikey increment "date+count",
        world_id int ref world_project.id n/1,
        category_link int ref category.id 1/1 "query world_novel.novel_id",
        update_at text notnull "datetime(now)"
        unique(world_id,category_link)
    }
    world_charactor_link {
        id int prikey increment "date+count",
        charactor_id int ref world_charactor.id n/1,
        charactor_link int ref object.id 1/1 "query world_charactor_category.category_link",
        update_at text notnull "datetime(now)"
        unique(charactor_id,charactor_link)
    }
    world_category {
        id int prikey increment "date+count",
        world_id int ref world_project.id n/1,
        category_link int ref category.id 1/1 "query world_novel.novel_id"
        update_at text notnull "datetime(now)"
        unique(world_id,category_link)
    }
    world_object {
        id int prikey increment "date+count",
        category_id int ref world_category.id n/1,
        object_link ref object.id 1/1 "query world_category,.category_link",
        symbol text,
        update_at text notnull "datetime(now)"
        unique(category_id,object_link)
    }
    world_map {
        id int prikey increment "date+count",
        world_id int ref world_project.id n/1,
        map_link int ref map.id 1/1 "query world_novel.novel_id"
        update_at text notnull "datetime(now)"
        unique(world_id,map_link)
    }
    world_map_area {
        id int prikey increment "date+count",
        map_id int ref world_map.id n/1,
        area_link int ref map_area.id 1/1 "query world_map.map_link".
        color int ref use_color.id 1/1
        update_at text notnull "datetime(now)"
        unique(map_id,area_link)
    }
    world_map_point {
        id int prikey increment "date+count",
        area_id int ref world_map_area n/1,
        point_link int ref map_point.id 1/1 "query world_map_area.area_link",
        update_at text notnull "datetime(now)"
        unique(area_id,point_link)
    }
    world_timeline {
        id int prikey increment "date+count",
        name text notnull,
        map_id int ref world_map.id 1/1
        update_at text notnull "datetime(now)"
    }
    world_timeline_event {
        id int prikey increment "date+count",
        timeline_id int ref world_timeline.id n/1,
        date_id int ref world_timeline_date.id n/1,
        update_at text notnull "datetime(now)"
        unique(timeline_id,date_id)
    }
    world_timeline_date {
        id int prikey increment "date+count",
        day int notnull,
        month int notnull,
        year int notnull,
        hour int notnull "0"
        minute int notnull "0"
        update_at text notnull "datetime(now)"
        unique(day,month,year,hour,minute)
    }
    world_timeline_object {
        id int prikey increment "date+count",
        event_id int ref world_timeline_event.id n/1,
        object_id int ref world_object.id/world_charactor.id n/1,
        point_id int ref world_timeline_point.id n/1
        update_at text notnull "datetime(now)"
        unique(event_id,point_id)
    }
    world_timeline_point {
        id int prikey increment "date+count",
        x real notnull,
        y real notnull,
        update_at text notnull "datetime(now)"
    }
