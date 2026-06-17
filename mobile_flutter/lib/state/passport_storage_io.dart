import 'dart:io';

import 'package:path_provider/path_provider.dart';

/// File-backed persistence for material passports on native platforms.
/// Reads/writes a single JSON document in the app support directory.
class PassportStorage {
  static const String _fileName = 'passports.json';

  Future<String?> read() async {
    try {
      final file = await _file();
      if (await file.exists()) {
        return await file.readAsString();
      }
    } catch (_) {
      // Unavailable or unreadable — caller falls back to empty state.
    }
    return null;
  }

  Future<void> write(String raw) async {
    try {
      final file = await _file();
      await file.writeAsString(raw);
    } catch (_) {
      // Best-effort persistence; ignore failures.
    }
  }

  Future<File> _file() async {
    final dir = await getApplicationSupportDirectory();
    return File('${dir.path}/$_fileName');
  }
}
