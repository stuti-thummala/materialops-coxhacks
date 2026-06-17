/// Web stub for passport persistence. `dart:io` and `path_provider` are not
/// available in the browser, so passports live only in memory for the current
/// session when running on web.
class PassportStorage {
  Future<String?> read() async => null;

  Future<void> write(String raw) async {}
}
