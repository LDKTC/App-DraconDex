import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'core/providers/settings_provider.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

class DraconDexApp extends ConsumerWidget {
  const DraconDexApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);

    final themeData = switch (settings.theme) {
      AppThemeMode.midnight => AppTheme.midnight,
      AppThemeMode.moonlight => AppTheme.moonlight,
      AppThemeMode.daylight => AppTheme.daylight,
    };

    return MediaQuery(
      data: MediaQueryData.fromView(View.of(context)).copyWith(
        textScaler: TextScaler.linear(settings.uiScale),
      ),
      child: MaterialApp.router(
        title: 'DraconDex',
        theme: themeData,
        routerConfig: appRouter,
        locale: settings.locale,
        supportedLocales: const [
          Locale('en'),
          Locale('th'),
          Locale('ja'),
          Locale('ko'),
          Locale('zh'),
        ],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
      ),
    );
  }
}
