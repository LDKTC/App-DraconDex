import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// A read-only version-update notice, not an auto-updater — mirrors
/// electron/src/db/update.js (see docs/UPDATE.md). Reads this repo's latest
/// GitHub Release and offers it to the user; nothing here installs anything
/// or auto-downloads — "Download" just opens the release page in a browser.
class UpdateInfo {
  final String version;
  final String notes;
  final String url;
  const UpdateInfo({required this.version, required this.notes, required this.url});
}

class UpdateCheckResult {
  final bool available;
  final bool dismissed;
  final String current;
  final UpdateInfo? update;
  const UpdateCheckResult({required this.available, required this.dismissed, required this.current, this.update});
}

class UpdateService {
  // This app's own canonical repo — every install reads the SAME release
  // feed. FORKERS: a fork MUST edit this to its own repo, or the update
  // check reports the upstream project's releases.
  static const _repo = 'LDKTC/App-DraconDex';
  static const _releasesUrl = 'https://api.github.com/repos/$_repo/releases/latest';
  // Every URL this service is willing to open must start with this — pinning
  // the host alone isn't enough; the path prefix is what keeps a compromised
  // or unexpected API response from pointing anywhere else.
  static const releaseUrlPrefix = 'https://github.com/$_repo/releases';
  static const _notesMax = 4000;
  static const _seenKey = 'update_seen_version';

  static final RegExp _tagRe = RegExp(r'^\d+(\.\d+){0,3}$');

  /// The response is remote data, so every field is validated, never
  /// trusted: the version must look like a version, and the URL must live
  /// under this repo's own releases path. Returning null means "no update",
  /// the same path every other failure below takes. Public (not `_`-private)
  /// so tests can exercise it directly against real/malformed API payloads,
  /// same as electron/test/update-release.test.mjs does for the JS side.
  static UpdateInfo? parseRelease(Map<String, dynamic> json) {
    final rawTag = json['tag_name'] as String? ?? '';
    final version = rawTag.replaceFirst(RegExp('^v', caseSensitive: false), '').trim();
    if (!_tagRe.hasMatch(version)) return null;
    final htmlUrl = json['html_url'] as String? ?? '';
    final url = htmlUrl.startsWith('$releaseUrlPrefix/') ? htmlUrl : releaseUrlPrefix;
    final notes = json['body'] as String? ?? '';
    return UpdateInfo(version: version, notes: notes.length > _notesMax ? notes.substring(0, _notesMax) : notes, url: url);
  }

  static Future<UpdateInfo?> _fetchLatest(String currentVersion) async {
    try {
      // /releases/latest already excludes drafts and prereleases. The API
      // rejects requests without a User-Agent.
      final res = await http.get(
        Uri.parse(_releasesUrl),
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'DraconDex/$currentVersion',
        },
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode != 200) return null;
      return parseRelease(jsonDecode(res.body) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  static String _stripSuffix(String v) => v.split('-').first.split('+').first;
  static List<int> _parts(String v) => _stripSuffix(v).split('.').map((n) => int.tryParse(n) ?? 0).toList();

  static bool isNewerVersion(String remote, String local) {
    final r = _parts(remote), l = _parts(local);
    final len = r.length > l.length ? r.length : l.length;
    for (var i = 0; i < len; i++) {
      final rv = i < r.length ? r[i] : 0;
      final lv = i < l.length ? l[i] : 0;
      if (rv != lv) return rv > lv;
    }
    return false;
  }

  /// Never throws — network failure, a non-200, bad JSON, or a malformed
  /// release all fall through to "no update available", so an offline
  /// launch never shows an error.
  static Future<UpdateCheckResult> checkForUpdate() async {
    String current;
    try {
      current = (await PackageInfo.fromPlatform()).version;
    } catch (_) {
      current = '0.0.0';
    }
    final latest = await _fetchLatest(current);
    if (latest == null || !isNewerVersion(latest.version, current)) {
      return UpdateCheckResult(available: false, dismissed: false, current: current);
    }
    var dismissed = false;
    try {
      final prefs = await SharedPreferences.getInstance();
      dismissed = (prefs.getString(_seenKey) ?? '') == latest.version;
    } catch (_) {}
    return UpdateCheckResult(available: true, dismissed: dismissed, current: current, update: latest);
  }

  static Future<void> dismiss(String version) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_seenKey, version);
    } catch (_) {}
  }
}
