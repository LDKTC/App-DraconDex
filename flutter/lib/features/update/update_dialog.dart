import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../data/services/update_service.dart';

/// Shown once per new release: informs, never installs. "Download" opens the
/// GitHub release page in a browser; "Remind me later" just dismisses this
/// version (a newer release still prompts again). See docs/UPDATE.md.
class UpdateDialog extends StatelessWidget {
  final UpdateInfo update;
  const UpdateDialog({super.key, required this.update});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Update available: v${update.version}'),
      content: SizedBox(
        width: double.maxFinite,
        child: SingleChildScrollView(
          child: Text(update.notes.trim().isEmpty ? 'No release notes.' : update.notes.trim()),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () async {
            await UpdateService.dismiss(update.version);
            if (context.mounted) Navigator.of(context).pop();
          },
          child: const Text('Remind me later'),
        ),
        FilledButton(
          onPressed: () async {
            await _openDownload(update.url);
            if (context.mounted) Navigator.of(context).pop();
          },
          child: const Text('Download'),
        ),
      ],
    );
  }

  // The URL travels through this widget rather than being trusted outright —
  // re-check the prefix before handing it to the OS, the same defense in
  // depth as electron's openUpdateDownload().
  Future<void> _openDownload(String url) async {
    final ok = url == UpdateService.releaseUrlPrefix || url.startsWith('${UpdateService.releaseUrlPrefix}/');
    if (!ok) return;
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
