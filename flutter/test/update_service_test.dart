import 'package:flutter_test/flutter_test.dart';
import 'package:dracondex/data/services/update_service.dart';

void main() {
  group('UpdateService.parseRelease', () {
    test('parses a real-shaped payload', () {
      final info = UpdateService.parseRelease({
        'tag_name': 'v2.2.0',
        'html_url': 'https://github.com/LDKTC/App-DraconDex/releases/tag/v2.2.0',
        'body': 'Release notes here',
      });
      expect(info, isNotNull);
      expect(info!.version, '2.2.0');
      expect(info.url, 'https://github.com/LDKTC/App-DraconDex/releases/tag/v2.2.0');
      expect(info.notes, 'Release notes here');
    });

    test('strips a leading v regardless of case', () {
      final info = UpdateService.parseRelease({'tag_name': 'V3.0', 'html_url': '', 'body': ''});
      expect(info!.version, '3.0');
    });

    test('rejects a malformed tag', () {
      expect(UpdateService.parseRelease({'tag_name': 'not-a-version', 'html_url': '', 'body': ''}), isNull);
      expect(UpdateService.parseRelease({'tag_name': '', 'html_url': '', 'body': ''}), isNull);
    });

    test('falls back to the releases prefix when html_url points outside the repo', () {
      final info = UpdateService.parseRelease({
        'tag_name': 'v1.0.0',
        'html_url': 'https://github.com/evil/repo/releases/tag/v1.0.0',
        'body': '',
      });
      expect(info!.url, UpdateService.releaseUrlPrefix);
    });

    test('rejects a lookalike host smuggled past a naive prefix check', () {
      final info = UpdateService.parseRelease({
        'tag_name': 'v1.0.0',
        'html_url': 'https://github.com.evil.example/LDKTC/App-DraconDex/releases/tag/v1.0.0',
        'body': '',
      });
      expect(info!.url, UpdateService.releaseUrlPrefix);
    });

    test('truncates release notes to 4000 characters', () {
      final info = UpdateService.parseRelease({
        'tag_name': 'v1.0.0',
        'html_url': '',
        'body': 'x' * 5000,
      });
      expect(info!.notes.length, 4000);
    });
  });

  group('UpdateService.isNewerVersion', () {
    test('detects a newer patch/minor/major version', () {
      expect(UpdateService.isNewerVersion('2.2.1', '2.2.0'), isTrue);
      expect(UpdateService.isNewerVersion('2.3.0', '2.2.0'), isTrue);
      expect(UpdateService.isNewerVersion('3.0.0', '2.2.0'), isTrue);
    });

    test('is false for an equal or older version', () {
      expect(UpdateService.isNewerVersion('2.2.0', '2.2.0'), isFalse);
      expect(UpdateService.isNewerVersion('2.1.0', '2.2.0'), isFalse);
    });

    test('ignores Flutter build-number suffixes on the local version', () {
      // pubspec versions look like "2.2.0+2" — the +build part must not be
      // compared as if it were a fourth version segment.
      expect(UpdateService.isNewerVersion('2.2.0', '2.2.0+7'), isFalse);
      expect(UpdateService.isNewerVersion('2.3.0', '2.2.0+7'), isTrue);
    });

    test('ignores a -n prerelease suffix on the remote tag', () {
      expect(UpdateService.isNewerVersion('2.2.0-1', '2.1.0'), isTrue);
      expect(UpdateService.isNewerVersion('2.2.0-1', '2.2.0'), isFalse);
    });

    test('pads missing segments with zero', () {
      expect(UpdateService.isNewerVersion('2.2', '2.2.0'), isFalse);
      expect(UpdateService.isNewerVersion('2.2.1', '2.2'), isTrue);
    });
  });
}
