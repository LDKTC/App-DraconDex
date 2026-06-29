class CategoryModel {
  final int id;
  final String name;
  final int projectId;
  final int? colorId;
  final String? colorCode;
  final String updatedAt;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.projectId,
    this.colorId,
    this.colorCode,
    required this.updatedAt,
  });

  factory CategoryModel.fromMap(Map<String, dynamic> m) => CategoryModel(
        id: m['id'] as int,
        name: m['category_name'] as String,
        projectId: m['project_id'] as int,
        colorId: m['color'] as int?,
        colorCode: m['color_code'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}

class TemplateModel {
  final int id;
  final int categoryId;
  final String description;
  final String attributeType;
  final int displayOrder;
  final String updatedAt;

  const TemplateModel({
    required this.id,
    required this.categoryId,
    required this.description,
    required this.attributeType,
    required this.displayOrder,
    required this.updatedAt,
  });

  factory TemplateModel.fromMap(Map<String, dynamic> m) => TemplateModel(
        id: m['id'] as int,
        categoryId: m['category_id'] as int,
        description: m['description'] as String,
        attributeType: m['attribute_type'] as String? ?? 'text',
        displayOrder: m['display_order'] as int? ?? 0,
        updatedAt: m['update_at'] as String? ?? '',
      );
}
