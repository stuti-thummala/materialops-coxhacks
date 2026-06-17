// Conditional export that selects the real (FFI-backed) inference engine on
// native platforms and a no-op stub on web, where `dart:ffi` /
// `tflite_flutter` are unavailable. The rest of the app depends only on the
// `InferenceEngine` surface defined identically in both implementations.
export 'inference_engine_io.dart'
    if (dart.library.js_interop) 'inference_engine_stub.dart';
