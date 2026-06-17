// Conditional export selecting the native file-backed passport storage on
// IO platforms and a no-op in-browser stub on web (where `dart:io` and
// `path_provider` are unavailable). Both expose the same `PassportStorage`
// surface used by `AppState`.
export 'passport_storage_io.dart'
    if (dart.library.js_interop) 'passport_storage_web.dart';
