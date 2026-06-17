import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Priority of a recovery task / batch.
enum Priority { high, medium, low }

extension PriorityX on Priority {
  String get label => switch (this) {
        Priority.high => 'High',
        Priority.medium => 'Medium',
        Priority.low => 'Low',
      };

  Color get color => switch (this) {
        Priority.high => OpsColors.red,
        Priority.medium => OpsColors.amber,
        Priority.low => OpsColors.blue,
      };
}

/// Lifecycle state shown on the worker's task progress screen.
enum TaskStage { pickUp, verify, transport, dropOff, uploadProof }

extension TaskStageX on TaskStage {
  String get label => switch (this) {
        TaskStage.pickUp => 'Pick Up',
        TaskStage.verify => 'Verify Batch',
        TaskStage.transport => 'Transport',
        TaskStage.dropOff => 'Drop Off',
        TaskStage.uploadProof => 'Upload Proof',
      };
}

/// A recovery assignment delivered to the worker app.
class WorkerTask {
  const WorkerTask({
    required this.id,
    required this.title,
    required this.priority,
    required this.fromZone,
    required this.toZone,
    required this.batchId,
    this.eta,
    this.weight,
    this.distanceMiles,
    this.items,
    this.materialType,
    this.cta,
  });

  final String id;
  final String title;
  final Priority priority;
  final String fromZone;
  final String toZone;
  final String batchId;
  final String? eta;
  final String? weight;
  final double? distanceMiles;
  final int? items;
  final String? materialType;
  final String? cta;
}

/// Result returned by the on-device material classifier for a scanned item.
class MaterialDetection {
  const MaterialDetection({
    required this.detectedItem,
    required this.materialType,
    required this.condition,
    required this.reusePotential,
    required this.recommendedPath,
    required this.suggestedBatchId,
    required this.confidence,
    required this.source,
  });

  /// Human-friendly detected object, e.g. "Vinyl Banner".
  final String detectedItem;

  /// Underlying material, e.g. "PVC-coated polyester".
  final String materialType;

  /// "good" | "fair" | "poor".
  final String condition;

  /// "high" | "medium" | "low".
  final String reusePotential;

  /// "reuse" | "recycle" | "donate" | "waste".
  final String recommendedPath;

  /// Batch this item should be grouped into, e.g. "VB-104".
  final String suggestedBatchId;

  /// Model confidence 0..1.
  final double confidence;

  /// Where the result came from (real model vs. mock fallback).
  final DetectionSource source;

  int get confidencePct => (confidence * 100).round();

  MaterialDetection copyWith({
    String? detectedItem,
    String? materialType,
    String? condition,
    String? reusePotential,
    String? recommendedPath,
    String? suggestedBatchId,
    double? confidence,
    DetectionSource? source,
  }) {
    return MaterialDetection(
      detectedItem: detectedItem ?? this.detectedItem,
      materialType: materialType ?? this.materialType,
      condition: condition ?? this.condition,
      reusePotential: reusePotential ?? this.reusePotential,
      recommendedPath: recommendedPath ?? this.recommendedPath,
      suggestedBatchId: suggestedBatchId ?? this.suggestedBatchId,
      confidence: confidence ?? this.confidence,
      source: source ?? this.source,
    );
  }

  Map<String, dynamic> toJson() => {
        'detectedItem': detectedItem,
        'materialType': materialType,
        'condition': condition,
        'reusePotential': reusePotential,
        'recommendedPath': recommendedPath,
        'suggestedBatchId': suggestedBatchId,
        'confidence': confidence,
        'source': source.name,
      };

  factory MaterialDetection.fromJson(Map<String, dynamic> json) {
    return MaterialDetection(
      detectedItem: json['detectedItem'] as String? ?? 'Unknown Item',
      materialType: json['materialType'] as String? ?? 'Unknown',
      condition: json['condition'] as String? ?? 'fair',
      reusePotential: json['reusePotential'] as String? ?? 'medium',
      recommendedPath: json['recommendedPath'] as String? ?? 'recycle',
      suggestedBatchId: json['suggestedBatchId'] as String? ?? 'UNSORTED',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.0,
      source: DetectionSource.values.firstWhere(
        (s) => s.name == json['source'],
        orElse: () => DetectionSource.mock,
      ),
    );
  }
}

/// Indicates whether a detection came from the bundled TFLite model or the
/// built-in mock fallback (used when no model asset is available).
enum DetectionSource { model, mock }

/// A confirmed, persisted record of a single recovered item. Stores both the
/// raw model output and the worker-corrected output so corrections are
/// auditable, plus the batch assignment and an optional note.
class MaterialPassport {
  const MaterialPassport({
    required this.id,
    required this.original,
    required this.confirmed,
    required this.batchId,
    required this.createdAt,
    this.workerNote,
  });

  /// Stable id for this passport.
  final String id;

  /// The original, unedited model/mock detection.
  final MaterialDetection original;

  /// The worker-confirmed (possibly corrected) detection.
  final MaterialDetection confirmed;

  /// Batch this passport was grouped into.
  final String batchId;

  /// When the passport was recorded.
  final DateTime createdAt;

  /// Optional free-form worker note captured at confirmation time.
  final String? workerNote;

  /// True when the worker changed the detected item from the model output.
  bool get wasCorrected =>
      original.detectedItem.trim().toLowerCase() !=
      confirmed.detectedItem.trim().toLowerCase();

  Map<String, dynamic> toJson() => {
        'id': id,
        'original': original.toJson(),
        'confirmed': confirmed.toJson(),
        'batchId': batchId,
        'createdAt': createdAt.toIso8601String(),
        'workerNote': workerNote,
      };

  factory MaterialPassport.fromJson(Map<String, dynamic> json) {
    return MaterialPassport(
      id: json['id'] as String? ??
          DateTime.now().microsecondsSinceEpoch.toString(),
      original:
          MaterialDetection.fromJson(json['original'] as Map<String, dynamic>),
      confirmed:
          MaterialDetection.fromJson(json['confirmed'] as Map<String, dynamic>),
      batchId: json['batchId'] as String? ?? 'UNSORTED',
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
              DateTime.now(),
      workerNote: json['workerNote'] as String?,
    );
  }
}

/// Aggregated view of all passports grouped into a single batch, used for the
/// grouped-batches summary panel and batch reporting.
class MaterialBatchSummary {
  const MaterialBatchSummary({
    required this.batchId,
    required this.passportCount,
    required this.correctedCount,
    required this.materialTypes,
    required this.recoveryPaths,
    required this.lastUpdated,
  });

  final String batchId;
  final int passportCount;
  final int correctedCount;
  final List<String> materialTypes;
  final List<String> recoveryPaths;
  final DateTime lastUpdated;

  /// The dominant recovery path for the batch (first listed), used for badges.
  String get primaryPath =>
      recoveryPaths.isNotEmpty ? recoveryPaths.first : 'recycle';
}

/// A generated, backend-independent recovery plan for a batch.
class RecoveryPlan {
  const RecoveryPlan({
    required this.batchId,
    required this.destination,
    required this.bestPath,
    required this.steps,
  });

  final String batchId;
  final String destination;
  final String bestPath;
  final List<RecoveryPlanStep> steps;

  int get completedSteps =>
      steps.where((s) => s.state == RecoveryStepState.done).length;

  double get progress =>
      steps.isEmpty ? 0 : completedSteps / steps.length;
}

enum RecoveryStepState { done, active, pending }

class RecoveryPlanStep {
  const RecoveryPlanStep({
    required this.title,
    required this.detail,
    required this.state,
  });

  final String title;
  final String detail;
  final RecoveryStepState state;

  RecoveryPlanStep copyWith({RecoveryStepState? state}) => RecoveryPlanStep(
        title: title,
        detail: detail,
        state: state ?? this.state,
      );
}
