/// Web stub for the inference engine. `tflite_flutter` relies on `dart:ffi`,
/// which is unavailable on web, so this implementation always reports "no
/// model" and the app runs entirely in mock-detection mode in the browser.
class InferenceEngine {
  InferenceEngine._();

  /// Always returns null on web — no on-device model is available.
  static Future<InferenceEngine?> fromAsset(String asset) async => null;

  /// Default ImageNet-style input shape; never actually used on web.
  List<int> get inputShape => const [1, 224, 224, 3];

  void run(Object input, Object output) {}

  void close() {}
}
