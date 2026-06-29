import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/folder_model.dart';
import '../data/models/project_model.dart';
import 'db_providers.dart';

final foldersProvider = FutureProvider<List<FolderModel>>((ref) async {
  final dao = ref.watch(folderDaoProvider);
  return dao.when(
    data: (d) => d.getFolders(),
    loading: () => Future.value([]),
    error: (e, s) => Future.value([]),
  );
});

final projectsProvider = FutureProvider<List<ProjectModel>>((ref) async {
  final dao = ref.watch(projectDaoProvider);
  return dao.when(
    data: (d) => d.getProjects(),
    loading: () => Future.value([]),
    error: (e, s) => Future.value([]),
  );
});

final projectProvider = FutureProvider.family<ProjectModel?, int>((ref, id) async {
  final dao = ref.watch(projectDaoProvider);
  return dao.when(
    data: (d) => d.getProject(id),
    loading: () => Future.value(null),
    error: (e, s) => Future.value(null),
  );
});

final activeProjectProvider = StateProvider<int?>((ref) => null);
