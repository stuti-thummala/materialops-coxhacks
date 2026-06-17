import '../models/models.dart';

/// Metadata describing how a recognized material class maps to recovery
/// guidance (material type, recommended path, target batch). Keyed by the
/// class label emitted by the on-device model / labels.txt.
class MaterialClass {
  const MaterialClass({
    required this.label,
    required this.detectedItem,
    required this.materialType,
    required this.reusePotential,
    required this.recommendedPath,
    required this.suggestedBatchId,
  });

  /// Raw class label (must match an entry in assets/models/labels.txt).
  final String label;
  final String detectedItem;
  final String materialType;
  final String reusePotential; // high | medium | low
  final String recommendedPath; // reuse | recycle | donate | waste
  final String suggestedBatchId;
}

/// Recovery catalog for the materials the worker app can sort at
/// Mercedes-Benz Stadium. The ordering here also defines the fallback class
/// order when no labels.txt ships with the model.
class MaterialCatalog {
  MaterialCatalog._();

  static const List<MaterialClass> classes = [
    MaterialClass(
      label: 'vinyl_banner',
      detectedItem: 'Vinyl Banner',
      materialType: 'PVC-coated polyester',
      reusePotential: 'high',
      recommendedPath: 'reuse',
      suggestedBatchId: 'VB-104',
    ),
    MaterialClass(
      label: 'reusable_cup',
      detectedItem: 'Reusable Cup',
      materialType: 'PP plastic',
      reusePotential: 'high',
      recommendedPath: 'reuse',
      suggestedBatchId: 'CU-091',
    ),
    MaterialClass(
      label: 'lanyard',
      detectedItem: 'Lanyard',
      materialType: 'Polyester',
      reusePotential: 'medium',
      recommendedPath: 'reuse',
      suggestedBatchId: 'LY-072',
    ),
    MaterialClass(
      label: 'foam_core_sign',
      detectedItem: 'Foam-Core Sign',
      materialType: 'Foam board',
      reusePotential: 'low',
      recommendedPath: 'recycle',
      suggestedBatchId: 'FS-058',
    ),
    MaterialClass(
      label: 'carpet_tile',
      detectedItem: 'Carpet Tile',
      materialType: 'Nylon carpet tile',
      reusePotential: 'medium',
      recommendedPath: 'recycle',
      suggestedBatchId: 'CT-033',
    ),
    MaterialClass(
      label: 'cardboard',
      detectedItem: 'Cardboard',
      materialType: 'Corrugated fiber',
      reusePotential: 'medium',
      recommendedPath: 'recycle',
      suggestedBatchId: 'CB-110',
    ),
    MaterialClass(
      label: 'pet_bottle',
      detectedItem: 'Water Bottle',
      materialType: 'PET plastic',
      reusePotential: 'medium',
      recommendedPath: 'recycle',
      suggestedBatchId: 'WB-210',
    ),
  ];

  static int get count => classes.length;

  static MaterialClass byIndex(int index) =>
      classes[index.clamp(0, classes.length - 1)];

  /// Look up a class by its raw label, falling back to the first class.
  static MaterialClass byLabel(String label) {
    for (final c in classes) {
      if (c.label == label) return c;
    }
    return classes.first;
  }

  /// Derive a coarse condition bucket from model confidence. Higher confidence
  /// generally co-occurs with cleaner, more clearly-reusable items.
  static String conditionForConfidence(double confidence) {
    if (confidence >= 0.85) return 'good';
    if (confidence >= 0.6) return 'fair';
    return 'poor';
  }

  static MaterialDetection toDetection({
    required MaterialClass materialClass,
    required double confidence,
    required DetectionSource source,
  }) {
    return MaterialDetection(
      detectedItem: materialClass.detectedItem,
      materialType: materialClass.materialType,
      condition: conditionForConfidence(confidence),
      reusePotential: materialClass.reusePotential,
      recommendedPath: materialClass.recommendedPath,
      suggestedBatchId: materialClass.suggestedBatchId,
      confidence: confidence,
      source: source,
    );
  }
}
