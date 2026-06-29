class RelationTypeModel {
  final int id;
  final String name;
  final int? colorId;
  final String? colorCode;
  final String updatedAt;

  const RelationTypeModel({
    required this.id,
    required this.name,
    this.colorId,
    this.colorCode,
    required this.updatedAt,
  });

  factory RelationTypeModel.fromMap(Map<String, dynamic> m) => RelationTypeModel(
        id: m['id'] as int,
        name: m['relation_name'] as String,
        colorId: m['color'] as int?,
        colorCode: m['color_code'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}

class RelationObObModel {
  final int id;
  final int relId;
  final String? relationName;
  final String? colorCode;
  final int? relationType;
  final int? colorId;
  final String fromName;
  final String fromCat;
  final String toName;
  final String toCat;

  const RelationObObModel({
    required this.id,
    required this.relId,
    this.relationName,
    this.colorCode,
    this.relationType,
    this.colorId,
    required this.fromName,
    required this.fromCat,
    required this.toName,
    required this.toCat,
  });

  factory RelationObObModel.fromMap(Map<String, dynamic> m) => RelationObObModel(
        id: m['id'] as int,
        relId: m['rel_id'] as int,
        relationName: m['relation_name'] as String?,
        colorCode: m['color_code'] as String?,
        relationType: m['relation_type'] as int?,
        colorId: m['color'] as int?,
        fromName: m['from_name'] as String,
        fromCat: m['from_cat'] as String,
        toName: m['to_name'] as String,
        toCat: m['to_cat'] as String,
      );
}

class RelationObTlModel {
  final int id;
  final int relId;
  final String? relationName;
  final String? colorCode;
  final int? relationType;
  final int? colorId;
  final String fromName;
  final String fromCat;
  final String toName;
  final String toTimeline;
  final int? sDay;
  final int? sMonth;
  final int? sYears;

  const RelationObTlModel({
    required this.id,
    required this.relId,
    this.relationName,
    this.colorCode,
    this.relationType,
    this.colorId,
    required this.fromName,
    required this.fromCat,
    required this.toName,
    required this.toTimeline,
    this.sDay,
    this.sMonth,
    this.sYears,
  });

  factory RelationObTlModel.fromMap(Map<String, dynamic> m) => RelationObTlModel(
        id: m['id'] as int,
        relId: m['rel_id'] as int,
        relationName: m['relation_name'] as String?,
        colorCode: m['color_code'] as String?,
        relationType: m['relation_type'] as int?,
        colorId: m['color'] as int?,
        fromName: m['from_name'] as String,
        fromCat: m['from_cat'] as String,
        toName: m['to_name'] as String,
        toTimeline: m['to_tl'] as String,
        sDay: m['s_day'] as int?,
        sMonth: m['s_month'] as int?,
        sYears: m['s_years'] as int?,
      );
}

class RelationTlTlModel {
  final int id;
  final int relId;
  final String? relationName;
  final String? colorCode;
  final int? relationType;
  final int? colorId;
  final String fromName;
  final String fromTimeline;
  final String toName;
  final String toTimeline;

  const RelationTlTlModel({
    required this.id,
    required this.relId,
    this.relationName,
    this.colorCode,
    this.relationType,
    this.colorId,
    required this.fromName,
    required this.fromTimeline,
    required this.toName,
    required this.toTimeline,
  });

  factory RelationTlTlModel.fromMap(Map<String, dynamic> m) => RelationTlTlModel(
        id: m['id'] as int,
        relId: m['rel_id'] as int,
        relationName: m['relation_name'] as String?,
        colorCode: m['color_code'] as String?,
        relationType: m['relation_type'] as int?,
        colorId: m['color'] as int?,
        fromName: m['from_name'] as String,
        fromTimeline: m['from_tl'] as String,
        toName: m['to_name'] as String,
        toTimeline: m['to_tl'] as String,
      );
}
