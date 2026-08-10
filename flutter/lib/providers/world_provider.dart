import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/world_model.dart';
import 'db_providers.dart';

/// The currently-selected world (Navigator equivalent of activeProjectProvider).
final activeWorldProvider = StateProvider<int?>((ref) => null);

final worldsProvider = FutureProvider<List<WorldModel>>((ref) async {
  final dao = ref.watch(worldDaoProvider);
  return dao.when(
    data: (d) => d.getWorlds(),
    loading: () => Future.value([]),
    error: (e, s) => Future.value([]),
  );
});

final worldProvider = FutureProvider.family<WorldModel?, int>((ref, id) async {
  final dao = ref.watch(worldDaoProvider);
  return dao.when(
    data: (d) => d.getWorld(id),
    loading: () => Future.value(null),
    error: (e, s) => Future.value(null),
  );
});

final worldNovelsProvider = FutureProvider.family<List<WorldNovelModel>, int>((ref, worldId) async {
  final dao = ref.watch(worldDaoProvider);
  return dao.when(
    data: (d) => d.getWorldNovels(worldId),
    loading: () => Future.value([]),
    error: (e, s) => Future.value([]),
  );
});

final worldCharactersProvider = FutureProvider.family<List<WorldCharacterModel>, int>((ref, worldId) async {
  final dao = ref.watch(worldDaoProvider);
  return dao.when(
    data: (d) => d.getWorldCharacters(worldId),
    loading: () => Future.value([]),
    error: (e, s) => Future.value([]),
  );
});

final worldCategoriesProvider = FutureProvider.family<List<WorldCategoryModel>, int>((ref, worldId) async {
  final dao = ref.watch(worldDaoProvider);
  return dao.when(
    data: (d) => d.getWorldCategories(worldId),
    loading: () => Future.value([]),
    error: (e, s) => Future.value([]),
  );
});

final worldMapsProvider = FutureProvider.family<List<WorldMapModel>, int>((ref, worldId) async {
  final dao = ref.watch(worldDaoProvider);
  return dao.when(
    data: (d) => d.getWorldMaps(worldId),
    loading: () => Future.value([]),
    error: (e, s) => Future.value([]),
  );
});

final worldTimelinesProvider = FutureProvider.family<List<WorldTimelineModel>, int>((ref, worldId) async {
  final dao = ref.watch(worldDaoProvider);
  return dao.when(
    data: (d) => d.getWorldTimelines(worldId),
    loading: () => Future.value([]),
    error: (e, s) => Future.value([]),
  );
});
