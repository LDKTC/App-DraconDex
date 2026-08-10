class FolderModel {
  final int id;
  final String name;
  final String? memo;
  final int? colorId;
  final String? colorCode;
  final String updatedAt;

  const FolderModel({
    required this.id,
    required this.name,
    this.memo,
    this.colorId,
    this.colorCode,
    required this.updatedAt,
  });

  factory FolderModel.fromMap(Map<String, dynamic> m) => FolderModel(
        id: m['id'] as int,
        name: m['name'] as String,
        memo: m['folder_memo'] as String?,
        colorId: m['folder_color'] as int?,
        colorCode: m['color_code'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}
