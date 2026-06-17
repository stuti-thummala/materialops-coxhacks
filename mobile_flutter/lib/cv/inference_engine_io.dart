import 'package:tflite_flutter/tflite_flutter.dart';

/// Native (FFI) inference engine backed by `tflite_flutter`.
///
/// Wraps a TFLite [Interpreter] so the rest of the app never imports
/// `tflite_flutter` directly — that keeps the FFI dependency out of the web
/// build (see `inference_engine_stub.dart`).
class InferenceEngine {
  InferenceEngine._(this._interpreter);

  final Interpreter _interpreter;

  /// Load a model from a bundled asset. Returns null if loading fails so the
  /// caller can fall back to mock mode.
  static Future<InferenceEngine?> fromAsset(String asset) async {
    try {
      final interpreter = await Interpreter.fromAsset(asset);
      return InferenceEngine._(interpreter);
    } catch (_) {
      return null;
    }
  }

  /// Shape of the model's primary input tensor, e.g. `[1, 224, 224, 3]`.
  List<int> get inputShape => _interpreter.getInputTensor(0).shape;

  /// Run inference for the given input/output buffers.
  void run(Object input, Object output) => _interpreter.run(input, output);

  void close() => _interpreter.close();
}
