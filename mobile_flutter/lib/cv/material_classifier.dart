import 'dart:math' as math;

import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:image/image.dart' as img;

import '../models/models.dart';
import 'inference_engine.dart';
import 'material_catalog.dart';

/// On-device computer-vision material classifier.
///
/// When a TFLite model + labels ship in `assets/models/`, this runs real
/// inference on live camera frames to identify the material in view. When no
/// model is bundled (the default during development), it transparently falls
/// back to a deterministic mock so the Scan & Group screen is fully demoable.
///
/// Drop a trained classifier at:
///   assets/models/material_classifier.tflite
///   assets/models/labels.txt        (one class label per line)
/// and the app automatically switches from mock to real inference.
class MaterialClassifier {
  MaterialClassifier();

  static const String _modelAsset = 'assets/models/material_classifier.tflite';
  static const String _labelsAsset = 'assets/models/labels.txt';

  InferenceEngine? _interpreter;
  List<String> _labels = const [];
  int _inputSize = 224;
  bool _loaded = false;
  bool get isModelLoaded => _interpreter != null;
  bool get isReady => _loaded;

  /// Detection source currently in effect.
  DetectionSource get source =>
      isModelLoaded ? DetectionSource.model : DetectionSource.mock;

  /// Attempt to load the TFLite model + labels. Safe to call once at startup;
  /// failures are swallowed so the app keeps working in mock mode.
  Future<void> load() async {
    if (_loaded) return;
    try {
      final interpreter = await InferenceEngine.fromAsset(_modelAsset);
      if (interpreter == null) {
        // No model bundled / unsupported platform (e.g. web) — mock mode.
        _interpreter = null;
        debugPrint('MaterialClassifier: running in MOCK mode (no model).');
        return;
      }
      final inputShape = interpreter.inputShape;
      // Expected input shape: [1, H, W, 3].
      if (inputShape.length == 4) {
        _inputSize = inputShape[1];
      }
      _interpreter = interpreter;
      _labels = await _loadLabels();
      debugPrint('MaterialClassifier: model loaded '
          '(input $_inputSize, ${_labels.length} labels).');
    } catch (e) {
      // No model bundled (or load failed) — run in mock mode.
      _interpreter = null;
      debugPrint('MaterialClassifier: running in MOCK mode ($e).');
    } finally {
      _loaded = true;
    }
  }

  Future<List<String>> _loadLabels() async {
    try {
      final raw = await rootBundle.loadString(_labelsAsset);
      return raw
          .split('\n')
          .map((l) => l.trim())
          .where((l) => l.isNotEmpty)
          .toList();
    } catch (_) {
      // Fall back to the catalog ordering.
      return MaterialCatalog.classes.map((c) => c.label).toList();
    }
  }

  /// Run inference on a single live camera frame. Returns a [MaterialDetection]
  /// or null if the frame could not be processed (caller may show mock).
  MaterialDetection? runOnFrame(CameraImage frame) {
    final interpreter = _interpreter;
    if (interpreter == null) return null;

    try {
      final rgb = _cameraImageToRgb(frame);
      if (rgb == null) return null;
      final resized =
          img.copyResize(rgb, width: _inputSize, height: _inputSize);

      final input = _imageToInput(resized);
      final outputLength =
          math.max(_labels.length, MaterialCatalog.count);
      final output = [List<double>.filled(outputLength, 0.0)];

      interpreter.run(input, output);

      final scores = _softmax(List<double>.from(output[0]));
      final best = _argmax(scores);
      final confidence = scores[best];

      final materialClass = best < _labels.length
          ? MaterialCatalog.byLabel(_labels[best])
          : MaterialCatalog.byIndex(best);

      return MaterialCatalog.toDetection(
        materialClass: materialClass,
        confidence: confidence,
        source: DetectionSource.model,
      );
    } catch (e) {
      debugPrint('MaterialClassifier.runOnFrame error: $e');
      return null;
    }
  }

  /// Deterministic mock detections used when no model is bundled. Hardcoded for
  /// the live demo scene: two lanyards, a water bottle, and a plastic cup. The
  /// marker positions are re-randomized on every call so each capture lands the
  /// labels in a fresh spot.
  List<ScanDetection> mockSceneDetections() {
    NormBox randomPoint() {
      // Keep markers inside a comfortable margin of the preview.
      final left = 0.08 + _rng.nextDouble() * 0.7;
      final top = 0.12 + _rng.nextDouble() * 0.68;
      return NormBox(left, top, 0.0, 0.0);
    }

    return [
      ScanDetection(
        detection: const MaterialDetection(
          detectedItem: 'Lanyard',
          materialType: 'Polyester',
          condition: 'good',
          reusePotential: 'medium',
          recommendedPath: 'Reuse',
          suggestedBatchId: 'LY-072',
          confidence: 0.94,
          source: DetectionSource.mock,
        ),
        estimatedQuantity: '2 lanyards',
        color: ScanBoxColor.purple,
        box: randomPoint(),
      ),
      ScanDetection(
        detection: const MaterialDetection(
          detectedItem: 'Lanyard',
          materialType: 'Polyester',
          condition: 'good',
          reusePotential: 'medium',
          recommendedPath: 'Reuse',
          suggestedBatchId: 'LY-072',
          confidence: 0.91,
          source: DetectionSource.mock,
        ),
        estimatedQuantity: '2 lanyards',
        color: ScanBoxColor.purple,
        box: randomPoint(),
      ),
      ScanDetection(
        detection: const MaterialDetection(
          detectedItem: 'Water Bottle',
          materialType: 'PET plastic',
          condition: 'good',
          reusePotential: 'medium',
          recommendedPath: 'Recycle',
          suggestedBatchId: 'WB-210',
          confidence: 0.92,
          source: DetectionSource.mock,
        ),
        estimatedQuantity: '1 bottle',
        color: ScanBoxColor.blue,
        box: randomPoint(),
      ),
      ScanDetection(
        detection: const MaterialDetection(
          detectedItem: 'Plastic Cup',
          materialType: 'PP plastic',
          condition: 'good',
          reusePotential: 'high',
          recommendedPath: 'Reuse',
          suggestedBatchId: 'CU-091',
          confidence: 0.9,
          source: DetectionSource.mock,
        ),
        estimatedQuantity: '1 cup',
        color: ScanBoxColor.amber,
        box: randomPoint(),
      ),
    ];
  }

  void dispose() {
    _interpreter?.close();
    _interpreter = null;
  }

  final math.Random _rng = math.Random();

  /// Simulate a single fresh detection for demo mode (no bundled model). Picks
  /// a material from the catalog with a realistic confidence and bounding box
  /// so the Scan & Group screen behaves like a live capture.
  ScanDetection simulatedCapture() {
    final cls = MaterialCatalog.classes[_rng.nextInt(MaterialCatalog.count)];
    final confidence = 0.82 + _rng.nextDouble() * 0.16;
    final detection = MaterialCatalog.toDetection(
      materialClass: cls,
      confidence: confidence,
      source: DetectionSource.mock,
    );
    final reusePath = cls.recommendedPath.toLowerCase() == 'reuse';
    final left = 0.10 + _rng.nextDouble() * 0.12;
    final top = 0.22 + _rng.nextDouble() * 0.14;
    return ScanDetection(
      detection: detection,
      estimatedQuantity: _quantityForItem(cls.detectedItem),
      color: reusePath ? ScanBoxColor.purple : ScanBoxColor.green,
      box: NormBox(left, top, 0.55, 0.5),
    );
  }

  String _quantityForItem(String item) {
    if (item.contains('Cup')) return '~120 cups';
    if (item.contains('Banner')) return '~1 banner';
    if (item.contains('Carpet')) return '~40 tiles';
    if (item.contains('Cardboard')) return '~15 boxes';
    if (item.contains('Lanyard')) return '~60 lanyards';
    if (item.contains('Sign')) return '~8 signs';
    return '1 item';
  }

  // --- image helpers -------------------------------------------------------

  /// Build a normalized float input tensor [1, size, size, 3] in 0..1.
  List<List<List<List<double>>>> _imageToInput(img.Image image) {
    return [
      List.generate(
        image.height,
        (y) => List.generate(
          image.width,
          (x) {
            final p = image.getPixel(x, y);
            return [p.r / 255.0, p.g / 255.0, p.b / 255.0];
          },
        ),
      ),
    ];
  }

  /// Convert a [CameraImage] (YUV420 on Android, BGRA8888 on iOS) to an RGB
  /// [img.Image].
  img.Image? _cameraImageToRgb(CameraImage image) {
    switch (image.format.group) {
      case ImageFormatGroup.yuv420:
        return _yuv420ToImage(image);
      case ImageFormatGroup.bgra8888:
        return _bgra8888ToImage(image);
      default:
        return null;
    }
  }

  img.Image _bgra8888ToImage(CameraImage image) {
    return img.Image.fromBytes(
      width: image.width,
      height: image.height,
      bytes: image.planes[0].bytes.buffer,
      order: img.ChannelOrder.bgra,
    );
  }

  img.Image _yuv420ToImage(CameraImage image) {
    final width = image.width;
    final height = image.height;
    final out = img.Image(width: width, height: height);

    final yPlane = image.planes[0];
    final uPlane = image.planes[1];
    final vPlane = image.planes[2];
    final uvRowStride = uPlane.bytesPerRow;
    final uvPixelStride = uPlane.bytesPerPixel ?? 1;

    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        final yIndex = y * yPlane.bytesPerRow + x;
        final uvIndex =
            (y >> 1) * uvRowStride + (x >> 1) * uvPixelStride;

        final yp = yPlane.bytes[yIndex];
        final up = uPlane.bytes[uvIndex];
        final vp = vPlane.bytes[uvIndex];

        // YUV -> RGB (BT.601).
        int r = (yp + 1.402 * (vp - 128)).round();
        int g =
            (yp - 0.344136 * (up - 128) - 0.714136 * (vp - 128)).round();
        int b = (yp + 1.772 * (up - 128)).round();

        out.setPixelRgb(
          x,
          y,
          r.clamp(0, 255),
          g.clamp(0, 255),
          b.clamp(0, 255),
        );
      }
    }
    return out;
  }

  List<double> _softmax(List<double> logits) {
    final maxLogit = logits.reduce(math.max);
    final exps = logits.map((l) => math.exp(l - maxLogit)).toList();
    final sum = exps.reduce((a, b) => a + b);
    if (sum == 0) return logits;
    return exps.map((e) => e / sum).toList();
  }

  int _argmax(List<double> values) {
    var best = 0;
    for (var i = 1; i < values.length; i++) {
      if (values[i] > values[best]) best = i;
    }
    return best;
  }
}

/// A single detected item in the scan scene, with its overlay box + metadata.
class ScanDetection {
  const ScanDetection({
    required this.detection,
    required this.estimatedQuantity,
    required this.color,
    required this.box,
  });

  final MaterialDetection detection;
  final String estimatedQuantity;
  final ScanBoxColor color;

  /// Normalized box within the camera preview (0..1 coordinates).
  final NormBox box;
}

enum ScanBoxColor { green, purple, blue, amber }

/// Minimal normalized rectangle (kept independent of dart:ui to avoid a name
/// clash with Flutter's [Rect]).
class NormBox {
  const NormBox(this.left, this.top, this.width, this.height);
  final double left;
  final double top;
  final double width;
  final double height;
}
