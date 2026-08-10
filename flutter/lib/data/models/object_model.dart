class ObjectModel {
  final int id;
  final String name;
  final int projectId;
  final int categoryId;
  final int? colorId;
  final String? colorCode;
  final String? note;
  final String updatedAt;
  final String? categoryName;

  const ObjectModel({
    required this.id,
    required this.name,
    required this.projectId,
    required this.categoryId,
    this.colorId,
    this.colorCode,
    this.note,
    required this.updatedAt,
    this.categoryName,
  });

  factory ObjectModel.fromMap(Map<String, dynamic> m) => ObjectModel(
        id: m['id'] as int,
        name: m['name'] as String,
        projectId: m['project_id'] as int,
        categoryId: m['category_id'] as int,
        colorId: m['color'] as int?,
        colorCode: m['color_code'] as String?,
        note: m['note'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
        categoryName: m['category_name'] as String?,
      );
}

class ObjectAttributeModel {
  final int id;
  final String description;
  final String attributeType;
  final String? attributeValue;

  const ObjectAttributeModel({
    required this.id,
    required this.description,
    required this.attributeType,
    this.attributeValue,
  });

  factory ObjectAttributeModel.fromMap(Map<String, dynamic> m) => ObjectAttributeModel(
        id: m['id'] as int,
        description: m['description'] as String,
        attributeType: m['attribute_type'] as String? ?? 'text',
        attributeValue: m['attribute_value'] as String?,
      );
}
