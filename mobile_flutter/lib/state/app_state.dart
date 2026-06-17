import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';

import '../models/models.dart';
import 'passport_storage.dart';

/// App-wide state for the worker flow: accepted/completed tasks, the running
/// scan count, and the persisted list of confirmed material passports. Mirrors
/// the web app's Zustand store, with on-device persistence for passports.
class AppState extends ChangeNotifier {
  AppState() {
    _load();
  }

  final Set<String> _acceptedTaskIds = <String>{};
  final Set<String> _completedTaskIds = <String>{};
  final List<MaterialPassport> _passports = <MaterialPassport>[];

  /// Number of plan steps marked complete per batch (overrides the generated
  /// default state so progress survives rebuilds).
  final Map<String, int> _completedPlanSteps = <String, int>{};

  int _scanCount = 0;
  MaterialDetection? _lastDetection;
  bool _loaded = false;

  bool get isLoaded => _loaded;
  bool isAccepted(String taskId) => _acceptedTaskIds.contains(taskId);
  bool isComplete(String taskId) => _completedTaskIds.contains(taskId);

  int get scanCount => _scanCount;
  MaterialDetection? get lastDetection => _lastDetection;

  List<MaterialPassport> get passports => List.unmodifiable(_passports);
  int get passportCount => _passports.length;

  void acceptTask(String taskId) {
    if (_acceptedTaskIds.add(taskId)) notifyListeners();
  }

  void completeTask(String taskId) {
    if (_completedTaskIds.add(taskId)) notifyListeners();
  }

  /// Update the latest detection preview without grouping it into a batch
  /// (used for the live camera result panel).
  void setPreviewDetection(MaterialDetection detection) {
    _lastDetection = detection;
    notifyListeners();
  }

  /// Confirm and persist a scanned item as a passport. [original] is the raw
  /// model output; [confirmed] is the worker-reviewed (possibly corrected)
  /// output. Returns the created passport.
  MaterialPassport recordPassport({
    required MaterialDetection original,
    required MaterialDetection confirmed,
    required String batchId,
    String? workerNote,
  }) {
    final passport = MaterialPassport(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      original: original,
      confirmed: confirmed,
      batchId: batchId,
      createdAt: DateTime.now(),
      workerNote: workerNote,
    );
    _passports.add(passport);
    _scanCount += 1;
    _lastDetection = confirmed;
    notifyListeners();
    unawaited(_save());
    return passport;
  }

  /// Convenience for the simple "add to batch" path: records a passport with no
  /// correction (confirmed == original) into the detection's suggested batch.
  void addScannedItem(MaterialDetection detection, {String? batchId}) {
    recordPassport(
      original: detection,
      confirmed: detection,
      batchId: batchId ?? detection.suggestedBatchId,
    );
  }

  /// Generate a unique batch id with the given prefix (e.g. "BATCH").
  String createNewBatchId([String prefix = 'BATCH']) {
    final stamp = DateTime.now();
    final seq =
        _passports.where((p) => p.batchId.startsWith(prefix)).length + 1;
    final mm = stamp.month.toString().padLeft(2, '0');
    final dd = stamp.day.toString().padLeft(2, '0');
    return '$prefix-$mm$dd-${seq.toString().padLeft(3, '0')}';
  }

  /// All distinct batch ids that have at least one passport.
  List<String> get batchIds {
    final ids = _passports.map((p) => p.batchId).toSet().toList();
    ids.sort();
    return ids;
  }

  int get batchCount => batchIds.length;

  /// Aggregated summaries for every batch with passports, newest first.
  List<MaterialBatchSummary> get batchSummaries {
    final byBatch = <String, List<MaterialPassport>>{};
    for (final p in _passports) {
      byBatch.putIfAbsent(p.batchId, () => []).add(p);
    }
    final summaries = byBatch.entries.map((entry) {
      final items = entry.value;
      final types = <String>{};
      final paths = <String>{};
      DateTime last = items.first.createdAt;
      var corrected = 0;
      for (final p in items) {
        types.add(p.confirmed.materialType);
        paths.add(p.confirmed.recommendedPath);
        if (p.wasCorrected) corrected += 1;
        if (p.createdAt.isAfter(last)) last = p.createdAt;
      }
      return MaterialBatchSummary(
        batchId: entry.key,
        passportCount: items.length,
        correctedCount: corrected,
        materialTypes: types.toList()..sort(),
        recoveryPaths: paths.toList()..sort(),
        lastUpdated: last,
      );
    }).toList();
    summaries.sort((a, b) => b.lastUpdated.compareTo(a.lastUpdated));
    return summaries;
  }

  List<MaterialPassport> passportsForBatch(String batchId) =>
      _passports.where((p) => p.batchId == batchId).toList();

  /// Build a structured recovery plan for a batch. Falls back to a generic
  /// plan for empty/unknown batches. Step completion can be advanced with
  /// [advancePlanStep].
  RecoveryPlan buildRecoveryPlanForBatch(String batchId) {
    final items = passportsForBatch(batchId);
    if (items.isEmpty) {
      return RecoveryPlan(
        batchId: batchId,
        destination: 'Pending assignment',
        bestPath: 'recycle',
        steps: _applyOverrides(batchId, const [
          RecoveryPlanStep(
            title: 'Scan & confirm items',
            detail: 'No items grouped into this batch yet.',
            state: RecoveryStepState.active,
          ),
          RecoveryPlanStep(
            title: 'Stage for pickup',
            detail: 'Group confirmed items at the zone staging point.',
            state: RecoveryStepState.pending,
          ),
          RecoveryPlanStep(
            title: 'Dispatch to partner',
            detail: 'Hand off to the assigned recovery partner.',
            state: RecoveryStepState.pending,
          ),
          RecoveryPlanStep(
            title: 'Capture proof',
            detail: 'Upload proof of drop-off to close the loop.',
            state: RecoveryStepState.pending,
          ),
        ]),
      );
    }

    final path = items.first.confirmed.recommendedPath;
    final destination = _destinationForPath(path);
    final typeCount = items.map((p) => p.confirmed.materialType).toSet().length;

    return RecoveryPlan(
      batchId: batchId,
      destination: destination,
      bestPath: path,
      steps: _applyOverrides(batchId, [
        RecoveryPlanStep(
          title: 'Confirm batch ($batchId)',
          detail: '${items.length} item${items.length == 1 ? '' : 's'} · '
              '$typeCount material type${typeCount == 1 ? '' : 's'}',
          state: RecoveryStepState.done,
        ),
        const RecoveryPlanStep(
          title: 'Stage at zone collection point',
          detail: 'Consolidate items and verify counts before transport.',
          state: RecoveryStepState.active,
        ),
        RecoveryPlanStep(
          title: 'Dispatch to $destination',
          detail: 'Best path: ${_pathLabel(path)}.',
          state: RecoveryStepState.pending,
        ),
        const RecoveryPlanStep(
          title: 'Capture proof of recovery',
          detail: 'Photograph drop-off and update chain of custody.',
          state: RecoveryStepState.pending,
        ),
      ]),
    );
  }

  /// Mark the plan step at [index] (and all before it) complete for a batch.
  void advancePlanStep(String batchId, int index) {
    final plan = buildRecoveryPlanForBatch(batchId);
    if (index < 0 || index >= plan.steps.length) return;
    _completedPlanSteps[batchId] = index + 1;
    notifyListeners();
  }

  List<RecoveryPlanStep> _applyOverrides(
      String batchId, List<RecoveryPlanStep> base) {
    final completed = _completedPlanSteps[batchId];
    if (completed == null) return base;
    return [
      for (var i = 0; i < base.length; i++)
        if (i < completed)
          base[i].copyWith(state: RecoveryStepState.done)
        else if (i == completed)
          base[i].copyWith(state: RecoveryStepState.active)
        else
          base[i].copyWith(state: RecoveryStepState.pending),
    ];
  }

  String _destinationForPath(String path) {
    switch (path.toLowerCase()) {
      case 'reuse':
      case 'clean & reuse':
      case 'wash & reuse':
        return 'ReUse Hub ATL';
      case 'donate':
        return 'Goodwill of North Georgia';
      case 'recycle':
        return 'Atlanta Recycling';
      default:
        return 'Recovery Partner';
    }
  }

  String _pathLabel(String path) {
    final p = path.toLowerCase();
    if (p.contains('reuse')) return 'Reuse';
    if (p.contains('donate')) return 'Donate';
    if (p.contains('recycle')) return 'Recycle';
    return path;
  }

  void resetScans() {
    _scanCount = 0;
    _lastDetection = null;
    notifyListeners();
  }

  // --- persistence ---------------------------------------------------------

  final PassportStorage _storage = PassportStorage();

  Future<void> _load() async {
    try {
      final raw = await _storage.read();
      if (raw != null && raw.isNotEmpty) {
        final list = (jsonDecode(raw) as List)
            .map((e) => MaterialPassport.fromJson(e as Map<String, dynamic>))
            .toList();
        _passports
          ..clear()
          ..addAll(list);
        _scanCount = _passports.length;
      }
    } catch (e) {
      debugPrint('AppState: failed to load passports ($e).');
    } finally {
      _loaded = true;
      notifyListeners();
    }
  }

  Future<void> _save() async {
    try {
      final raw = jsonEncode(_passports.map((p) => p.toJson()).toList());
      await _storage.write(raw);
    } catch (e) {
      debugPrint('AppState: failed to save passports ($e).');
    }
  }
}
