class ProjectModel {
  final int id;
  final String? codename;
  final String name;
  final String? memo;
  final int? folderId;
  final int? colorId;
  final String? colorCode;
  final String updatedAt;

  const ProjectModel({
    required this.id,
    this.codename,
    required this.name,
    this.memo,
    this.folderId,
    this.colorId,
    this.colorCode,
    required this.updatedAt,
  });

  factory ProjectModel.fromMap(Map<String, dynamic> m) => ProjectModel(
        id: m['id'] as int,
        codename: m['codename'] as String?,
        name: m['name'] as String,
        memo: m['project_memo'] as String?,
        folderId: m['folder_id'] as int?,
        colorId: m['project_color'] as int?,
        colorCode: m['color_code'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}

class ProjectDescModel {
  final int id;
  final int projectId;
  final String? attributeName;
  final String? attributeText;
  final String updatedAt;

  const ProjectDescModel({
    required this.id,
    required this.projectId,
    this.attributeName,
    this.attributeText,
    required this.updatedAt,
  });

  factory ProjectDescModel.fromMap(Map<String, dynamic> m) => ProjectDescModel(
        id: m['id'] as int,
        projectId: m['project_id'] as int,
        attributeName: m['attribute_name'] as String?,
        attributeText: m['attribute_text'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}
