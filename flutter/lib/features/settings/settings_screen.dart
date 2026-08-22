import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../data/services/import_export_service.dart';
import '../../providers/update_provider.dart';
import '../update/update_dialog.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final notifier = ref.read(settingsProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          _SectionHeader('Appearance'),
          ListTile(
            title: const Text('Theme'),
            subtitle: Text(_themeName(settings.theme)),
            trailing: DropdownButton<AppThemeMode>(
              value: settings.theme,
              underline: const SizedBox(),
              items: AppThemeMode.values.map((t) => DropdownMenuItem(value: t, child: Text(_themeName(t)))).toList(),
              onChanged: (t) { if (t != null) notifier.setTheme(t); },
            ),
          ),
          ListTile(
            title: const Text('UI Scale'),
            subtitle: Slider(
              value: settings.uiScale,
              min: 0.5,
              max: 2.0,
              divisions: 15,
              label: '${(settings.uiScale * 100).round()}%',
              onChanged: (v) => notifier.setUiScale(v),
            ),
          ),
          const Divider(),
          _SectionHeader('Language'),
          RadioGroup<String>(
            groupValue: settings.locale.languageCode,
            onChanged: (v) { if (v != null) notifier.setLocale(Locale(v)); },
            child: Column(
              children: _supportedLocales.entries.map((e) => RadioListTile<String>(
                title: Text(e.value),
                value: e.key,
              )).toList(),
            ),
          ),
          const Divider(),
          _SectionHeader('Data'),
          ListTile(
            leading: const Icon(Icons.upload),
            title: const Text('Export Database'),
            subtitle: const Text('Share the .db file to transfer data to PC or another device'),
            onTap: () => _export(context),
          ),
          ListTile(
            leading: const Icon(Icons.download),
            title: const Text('Import Database'),
            subtitle: const Text('Merge data from a DraconDex .db file'),
            onTap: () => _import(context, ref),
          ),
          const Divider(),
          _SectionHeader('About'),
          ListTile(
            title: const Text('DraconDex'),
            subtitle: Text('Novel Manager — Flutter Edition · v${ref.watch(appVersionProvider).valueOrNull ?? '…'}'),
          ),
          ListTile(
            leading: const Icon(Icons.system_update_alt),
            title: const Text('Check for Updates'),
            subtitle: const Text('Looks at this project\'s GitHub Releases — never installs automatically'),
            onTap: () => _checkForUpdates(context, ref),
          ),
        ],
      ),
    );
  }

  Future<void> _checkForUpdates(BuildContext context, WidgetRef ref) async {
    ref.invalidate(updateCheckProvider);
    final result = await ref.read(updateCheckProvider.future);
    if (!context.mounted) return;
    if (result.available && result.update != null) {
      await showDialog(context: context, builder: (_) => UpdateDialog(update: result.update!));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('You\'re on the latest version (v${result.current}).')),
      );
    }
  }

  String _themeName(AppThemeMode t) => switch (t) {
    AppThemeMode.midnight => 'Midnight',
    AppThemeMode.moonlight => 'Moonlight',
    AppThemeMode.daylight => 'Daylight',
  };

  Future<void> _export(BuildContext context) async {
    try {
      final path = await ImportExportService.exportToShare();
      await Share.shareXFiles([XFile(path)], text: 'DraconDex backup');
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Export failed: $e')));
      }
    }
  }

  Future<void> _import(BuildContext context, WidgetRef ref) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['db'],
    );
    if (result == null || result.files.single.path == null) return;
    final path = result.files.single.path!;

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Importing…'), duration: Duration(seconds: 60)),
      );
    }

    try {
      final summary = await ImportExportService.importFromFile(path);
      if (context.mounted) {
        ScaffoldMessenger.of(context)
          ..clearSnackBars()
          ..showSnackBar(SnackBar(content: Text('Import complete: $summary')));
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
          ..clearSnackBars()
          ..showSnackBar(SnackBar(content: Text('Import failed: $e')));
      }
    }
  }

  static const _supportedLocales = {
    'en': 'English',
    'th': 'ภาษาไทย',
    'ja': '日本語',
    'ko': '한국어',
    'zh': '中文',
    'vi': 'Tiếng Việt',
    'id': 'Bahasa Indonesia',
    'es': 'Español',
    'pt': 'Português (Brasil)',
    'fr': 'Français',
    'de': 'Deutsch',
    'ru': 'Русский',
    'qd': '🐉 Draconic',
  };
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(title, style: Theme.of(context).textTheme.titleSmall?.copyWith(color: Theme.of(context).colorScheme.primary)),
    );
  }
}
