import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/i18n/app_localizations.dart';
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
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.moduleSettings)),
      body: ListView(
        children: [
          _SectionHeader(l10n.settingsAppearance),
          ListTile(
            title: Text(l10n.themeLabel),
            subtitle: Text(_themeName(l10n, settings.theme)),
            trailing: DropdownButton<AppThemeMode>(
              value: settings.theme,
              underline: const SizedBox(),
              items: AppThemeMode.values
                  .map((t) => DropdownMenuItem(value: t, child: Text(_themeName(l10n, t))))
                  .toList(),
              onChanged: (t) { if (t != null) notifier.setTheme(t); },
            ),
          ),
          ListTile(
            title: Text(l10n.uiScaleLabel),
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
          _SectionHeader(l10n.languageLabel),
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
          _SectionHeader(l10n.settingsData),
          ListTile(
            leading: const Icon(Icons.upload),
            title: Text(l10n.exportDbTitle),
            subtitle: Text(l10n.exportDbSubtitle),
            onTap: () => _export(context, l10n),
          ),
          ListTile(
            leading: const Icon(Icons.download),
            title: Text(l10n.importDbTitle),
            subtitle: Text(l10n.importDbSubtitle),
            onTap: () => _import(context, ref, l10n),
          ),
          const Divider(),
          _SectionHeader(l10n.settingsAbout),
          ListTile(
            title: Text(l10n.appName),
            subtitle: Text('${l10n.nexusSubtitle} · v${ref.watch(appVersionProvider).valueOrNull ?? '…'}'),
          ),
          ListTile(
            leading: const Icon(Icons.system_update_alt),
            title: Text(l10n.checkUpdatesTitle),
            subtitle: Text(l10n.checkUpdatesSubtitle),
            onTap: () => _checkForUpdates(context, ref, l10n),
          ),
        ],
      ),
    );
  }

  Future<void> _checkForUpdates(BuildContext context, WidgetRef ref, AppLocalizations l10n) async {
    ref.invalidate(updateCheckProvider);
    final result = await ref.read(updateCheckProvider.future);
    if (!context.mounted) return;
    if (result.available && result.update != null) {
      await showDialog(context: context, builder: (_) => UpdateDialog(update: result.update!));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${l10n.upToDateMessage} (v${result.current})')),
      );
    }
  }

  String _themeName(AppLocalizations l10n, AppThemeMode t) => switch (t) {
    AppThemeMode.midnight => l10n.themeMidnight,
    AppThemeMode.moonlight => l10n.themeMoonlight,
    AppThemeMode.daylight => l10n.themeDaylight,
  };

  Future<void> _export(BuildContext context, AppLocalizations l10n) async {
    try {
      final path = await ImportExportService.exportToShare();
      await Share.shareXFiles([XFile(path)], text: 'DraconDex backup');
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${l10n.exportFailedMessage} $e')));
      }
    }
  }

  Future<void> _import(BuildContext context, WidgetRef ref, AppLocalizations l10n) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['db'],
    );
    if (result == null || result.files.single.path == null) return;
    final path = result.files.single.path!;

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.importingMessage), duration: const Duration(seconds: 60)),
      );
    }

    try {
      final summary = await ImportExportService.importFromFile(path);
      if (context.mounted) {
        ScaffoldMessenger.of(context)
          ..clearSnackBars()
          ..showSnackBar(SnackBar(content: Text('${l10n.importCompleteMessage} $summary')));
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
          ..clearSnackBars()
          ..showSnackBar(SnackBar(content: Text('${l10n.importFailedMessage} $e')));
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
