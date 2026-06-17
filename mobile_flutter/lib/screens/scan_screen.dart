import 'dart:async';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../cv/material_catalog.dart';
import '../cv/material_classifier.dart';
import '../data/recovery_bridge.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../theme/app_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/header_bits.dart';

/// Screen 4 — Scan & Group.
/// Live camera preview with on-device CV material detection, recognition
/// results, grouping rationale, and batch actions. Recreates the Scan & Group
/// screenshot. Uses the real camera + TFLite when available, and a deterministic
/// mock scene (reusable cups + vinyl banner) otherwise.
class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final MaterialClassifier _classifier = MaterialClassifier();

  CameraController? _camera;
  bool _cameraReady = false;
  bool _streaming = false;
  bool _busy = false;
  bool _scanning = false;
  DateTime _lastInference = DateTime.fromMillisecondsSinceEpoch(0);

  /// Detections currently shown. Empty until the worker taps Capture & Classify
  /// (or a live model surfaces a detection).
  List<ScanDetection> _detections = const [];

  /// Candidate labels for the correction picker (from labels.txt, falling back
  /// to the in-app catalog).
  List<String> _labels = const [];

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _classifier.load();
    _labels = await _loadLabels();
    await _initCamera();
    if (mounted) setState(() {});
  }

  Future<List<String>> _loadLabels() async {
    try {
      final raw = await rootBundle.loadString('assets/models/labels.txt');
      final labels = raw
          .split('\n')
          .map((l) => l.trim())
          .where((l) => l.isNotEmpty)
          .toList();
      if (labels.isNotEmpty) return labels;
    } catch (_) {
      // fall through to catalog labels
    }
    return MaterialCatalog.classes.map((c) => c.detectedItem).toList();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) return;
      final back = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => cameras.first,
      );
      final controller = CameraController(
        back,
        ResolutionPreset.medium,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.yuv420,
      );
      await controller.initialize();
      _camera = controller;
      _cameraReady = true;

      // Only stream frames into the model when a real model is loaded.
      if (_classifier.isModelLoaded) {
        await controller.startImageStream(_onFrame);
        _streaming = true;
      }
    } catch (e) {
      // Camera unavailable (e.g. simulator) — keep the mock scene + placeholder.
      _cameraReady = false;
    }
  }

  void _onFrame(CameraImage frame) {
    if (_busy) return;
    final now = DateTime.now();
    if (now.difference(_lastInference).inMilliseconds < 700) return;
    _lastInference = now;
    _busy = true;

    final result = _classifier.runOnFrame(frame);
    if (result != null && mounted) {
      // Surface the top live detection while keeping a stable overlay box.
      setState(() {
        _detections = [
          ScanDetection(
            detection: result,
            estimatedQuantity: _quantityFor(result),
            color: result.recommendedPath.toLowerCase().contains('reuse') &&
                    result.detectedItem.contains('Banner')
                ? ScanBoxColor.purple
                : ScanBoxColor.green,
            box: const NormBox(0.18, 0.28, 0.64, 0.5),
          ),
        ];
      });
      context.read<AppState>().setPreviewDetection(result);
    }
    _busy = false;
  }

  String _quantityFor(MaterialDetection d) {
    if (d.detectedItem.contains('Cup')) return '~120 cups';
    if (d.detectedItem.contains('Banner')) return '~1 banner';
    return '1 item';
  }

  /// Capture & classify the current view. Surfaces a fresh recognition so the
  /// Scan & Group screen feels responsive even in demo (no-model) mode.
  Future<void> _capture() async {
    if (_scanning) return;
    setState(() => _scanning = true);
    await Future<void>.delayed(const Duration(milliseconds: 650));
    if (!mounted) return;
    final detections = _classifier.mockSceneDetections();
    setState(() {
      _detections = detections;
      _scanning = false;
    });
    context.read<AppState>().setPreviewDetection(detections.first.detection);
  }

  @override
  void dispose() {
    if (_streaming) {
      _camera?.stopImageStream();
    }
    _camera?.dispose();
    _classifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasResults = _detections.isNotEmpty;
    final typesDetected = _detections
        .map((d) => d.detection.detectedItem)
        .toSet()
        .length;
    return Scaffold(
      backgroundColor: OpsColors.navy,
      body: Column(
        children: [
          const _ScanHeader(),
          Expanded(
            child: Container(
              decoration: const BoxDecoration(
                color: OpsColors.bg,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
                children: [
                  _TitleRow(),
                  const SizedBox(height: 14),
                  _CameraPreview(
                    controller: _cameraReady ? _camera : null,
                    detections: _detections,
                    scanning: _scanning,
                    onCapture: _capture,
                  ),
                  const SizedBox(height: 14),
                  if (hasResults) ...[
                    _GroupingSuggestedRow(
                      typesDetected: typesDetected,
                      itemsDetected: _detections.length,
                      groupName: _suggestedGroupName(),
                    ),
                    const SizedBox(height: 16),
                    _RecognitionHeader(count: _detections.length),
                    const SizedBox(height: 10),
                    for (final d in _detections) ...[
                      _ResultCard(detection: d),
                      const SizedBox(height: 10),
                    ],
                    const SizedBox(height: 4),
                    _GroupingRationale(),
                    const SizedBox(height: 16),
                  ],
                  const _GroupedBatchesPanel(),
                  if (hasResults) ...[
                    const SizedBox(height: 18),
                    _ActionRow(detections: _detections, labels: _labels),
                  ],
                  const SizedBox(height: 8),
                  _SourceNote(source: _classifier.source),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Biltmore is a new recovery area, so the assistant proposes spinning up a
  /// fresh batch rather than folding the capture into an existing one.
  String _suggestedGroupName() {
    return 'a new Biltmore batch';
  }
}

class _ScanHeader extends StatelessWidget {
  const _ScanHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [OpsColors.deepNavy, OpsColors.navy],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
          child: Column(
            children: [
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.menu, color: Colors.white),
                    onPressed: () {},
                  ),
                  const Spacer(),
                  const LiveStatusDot(label: 'Post-Event Recovery'),
                  const Spacer(),
                  const NotificationBell(count: 2),
                  const SizedBox(width: 8),
                  const WorkerAvatar(size: 34, initials: 'ST'),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const SizedBox(width: 4),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('MaterialOps',
                          style: AppFonts.display(
                              size: 20,
                              weight: FontWeight.w700,
                              color: Colors.white)),
                      Text('Mercedes-Benz Stadium',
                          style: AppFonts.body(
                              size: 12,
                              color: Colors.white.withValues(alpha: 0.6))),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TitleRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
          icon: const Icon(Icons.arrow_back, color: OpsColors.ink),
          onPressed: () => context.canPop() ? context.pop() : context.go('/'),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Scan & Group',
                  style: AppFonts.display(size: 20, weight: FontWeight.w700)),
              Text('Scan related materials to group into a batch',
                  style: AppFonts.body(size: 12, color: OpsColors.muted)),
            ],
          ),
        ),
        OutlinedButton.icon(
          onPressed: () {},
          style: OutlinedButton.styleFrom(
            foregroundColor: OpsColors.ink,
            side: const BorderSide(color: OpsColors.border),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10)),
          ),
          icon: const Icon(Icons.lightbulb_outline, size: 16),
          label: Text('Tips',
              style: AppFonts.body(size: 12, weight: FontWeight.w600)),
        ),
      ],
    );
  }
}

class _CameraPreview extends StatelessWidget {
  const _CameraPreview({
    required this.controller,
    required this.detections,
    required this.scanning,
    required this.onCapture,
  });

  final CameraController? controller;
  final List<ScanDetection> detections;
  final bool scanning;
  final VoidCallback onCapture;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: AspectRatio(
        aspectRatio: 4 / 3,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (controller != null && controller!.value.isInitialized)
              FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: controller!.value.previewSize?.height ?? 300,
                  height: controller!.value.previewSize?.width ?? 400,
                  child: CameraPreview(controller!),
                ),
              )
            else
              const _CameraPlaceholder(),

            // Detection label markers (no bounding squares).
            LayoutBuilder(
              builder: (context, constraints) {
                return Stack(
                  children: detections.map((d) {
                    return Positioned(
                      left: d.box.left * constraints.maxWidth,
                      top: d.box.top * constraints.maxHeight,
                      child: _DetectionMarker(
                        label: d.detection.detectedItem,
                        color: scanColorOf(d.color),
                      ),
                    );
                  }).toList(),
                );
              },
            ),

            // Scanning chip.
            Positioned(
              left: 12,
              top: 12,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                          color: OpsColors.green, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 6),
                    Text('Scanning',
                        style: AppFonts.body(
                            size: 12,
                            weight: FontWeight.w600,
                            color: Colors.white)),
                  ],
                ),
              ),
            ),

            // Flash chip.
            Positioned(
              right: 12,
              top: 12,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.bolt, size: 14, color: Colors.white),
                    const SizedBox(width: 4),
                    Text('Flash',
                        style: AppFonts.body(
                            size: 12,
                            weight: FontWeight.w600,
                            color: Colors.white)),
                  ],
                ),
              ),
            ),

            // Location tag.
            Positioned(
              left: 14,
              bottom: 12,
              child: Text('C210',
                  style: AppFonts.body(
                      size: 12,
                      weight: FontWeight.w700,
                      color: Colors.white.withValues(alpha: 0.85))),
            ),

            // Capture / classify button.
            Positioned(
              bottom: 12,
              left: 0,
              right: 0,
              child: Center(
                child: GestureDetector(
                  onTap: scanning ? null : onCapture,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 160),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 18, vertical: 10),
                    decoration: BoxDecoration(
                      color: scanning
                          ? Colors.black.withValues(alpha: 0.6)
                          : OpsColors.green,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: OpsColors.green.withValues(alpha: 0.4),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (scanning)
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        else
                          const Icon(Icons.center_focus_strong,
                              size: 18, color: Colors.white),
                        const SizedBox(width: 8),
                        Text(scanning ? 'Scanning…' : 'Capture & classify',
                            style: AppFonts.body(
                                size: 13,
                                weight: FontWeight.w700,
                                color: Colors.white)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CameraPlaceholder extends StatelessWidget {
  const _CameraPlaceholder();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1B2A33), Color(0xFF0E1A20)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.photo_camera_back_outlined,
                size: 36, color: Colors.white.withValues(alpha: 0.5)),
            const SizedBox(height: 8),
            Text('Camera preview',
                style: AppFonts.body(
                    size: 12, color: Colors.white.withValues(alpha: 0.5))),
          ],
        ),
      ),
    );
  }
}

/// Resolves a [ScanBoxColor] token to its theme color.
Color scanColorOf(ScanBoxColor c) {
  switch (c) {
    case ScanBoxColor.green:
      return OpsColors.green;
    case ScanBoxColor.purple:
      return OpsColors.purple;
    case ScanBoxColor.blue:
      return OpsColors.blue;
    case ScanBoxColor.amber:
      return OpsColors.amber;
  }
}

/// A floating label marker (dot + pill) placed over a detected item. Replaces
/// the old bounding-box square so only the label is shown.
class _DetectionMarker extends StatelessWidget {
  const _DetectionMarker({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.5),
                blurRadius: 8,
              ),
            ],
          ),
        ),
        const SizedBox(width: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(label,
              style: AppFonts.body(
                  size: 11, weight: FontWeight.w600, color: Colors.white)),
        ),
      ],
    );
  }
}

class _GroupingSuggestedRow extends StatelessWidget {
  const _GroupingSuggestedRow({
    required this.typesDetected,
    required this.itemsDetected,
    required this.groupName,
  });

  final int typesDetected;
  final int itemsDetected;
  final String groupName;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: OpsColors.softGreen,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: OpsColors.green, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('New batch suggested',
                    style:
                        AppFonts.body(size: 13, weight: FontWeight.w700)),
                Text(
                    'Biltmore is a new area — start $groupName '
                    'with $itemsDetected item'
                    '${itemsDetected == 1 ? '' : 's'} '
                    '($typesDetected type${typesDetected == 1 ? '' : 's'})',
                    style: AppFonts.body(size: 12, color: OpsColors.muted)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: OpsColors.muted),
        ],
      ),
    );
  }
}

class _RecognitionHeader extends StatelessWidget {
  const _RecognitionHeader({required this.count});
  final int count;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text('Recognition Results',
            style: AppFonts.display(size: 15, weight: FontWeight.w600)),
        Text('$count item${count == 1 ? '' : 's'} detected',
            style: AppFonts.body(
                size: 12, weight: FontWeight.w600, color: OpsColors.blue)),
      ],
    );
  }
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({required this.detection});
  final ScanDetection detection;

  @override
  Widget build(BuildContext context) {
    final color = scanColorOf(detection.color);
    final d = detection.detection;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: OpsColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: OpsColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: OpsColors.bg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: OpsColors.border),
                ),
                child: Icon(
                  d.detectedItem.contains('Cup')
                      ? Icons.local_cafe_rounded
                      : Icons.flag_rounded,
                  color: color,
                ),
              ),
              Positioned(
                left: 6,
                top: 6,
                child: Container(
                  width: 10,
                  height: 10,
                  decoration:
                      BoxDecoration(color: color, shape: BoxShape.circle),
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(d.detectedItem,
                    style:
                        AppFonts.display(size: 15, weight: FontWeight.w700)),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _MiniField(
                      label: 'Estimated Quantity',
                      value: detection.estimatedQuantity,
                    ),
                    _MiniField(
                      label: 'Reuse Pathway',
                      value: d.recommendedPath,
                    ),
                    _MiniField(
                      label: 'Suggested Batch ID',
                      value: d.suggestedBatchId,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: OpsColors.muted),
        ],
      ),
    );
  }
}

class _MiniField extends StatelessWidget {
  const _MiniField({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: AppFonts.body(size: 10, color: OpsColors.muted)),
          const SizedBox(height: 2),
          Text(value,
              style: AppFonts.body(size: 12, weight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _GroupingRationale extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: OpsColors.softBlue,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.auto_awesome, size: 18, color: OpsColors.blue),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Why this grouping was suggested',
                    style:
                        AppFonts.body(size: 13, weight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(
                  'These items were found in the same location and share the '
                  'same recovery zone. Grouping streamlines tracking, '
                  'transport, and reuse reporting.',
                  style: AppFonts.body(
                      size: 12, color: OpsColors.muted, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionRow extends StatelessWidget {
  const _ActionRow({required this.detections, required this.labels});
  final List<ScanDetection> detections;
  final List<String> labels;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: FilledButton.icon(
            onPressed: () => _openConfirmSheet(context, suggestedBatch: false),
            style: FilledButton.styleFrom(
              backgroundColor: OpsColors.navy,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.create_new_folder_outlined, size: 18),
            label: Text('Start New Batch',
                style: AppFonts.body(
                    size: 13,
                    weight: FontWeight.w600,
                    color: Colors.white)),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => _openConfirmSheet(context, suggestedBatch: true),
            style: OutlinedButton.styleFrom(
              foregroundColor: OpsColors.ink,
              backgroundColor: OpsColors.surface,
              side: const BorderSide(color: OpsColors.border),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.add, size: 18),
            label: Text('Add to Existing',
                style: AppFonts.body(size: 13, weight: FontWeight.w600)),
          ),
        ),
      ],
    );
  }

  void _openConfirmSheet(BuildContext context, {required bool suggestedBatch}) {
    if (detections.isEmpty) return;
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => _ConfirmScanSheet(
        detections: detections,
        labels: labels,
        useNewBatch: !suggestedBatch,
      ),
    );
  }
}

/// Bottom sheet that lets the worker review each detection, correct the
/// detected item label, choose a batch, and commit confirmed passports.
class _ConfirmScanSheet extends StatefulWidget {
  const _ConfirmScanSheet({
    required this.detections,
    required this.labels,
    required this.useNewBatch,
  });

  final List<ScanDetection> detections;
  final List<String> labels;
  final bool useNewBatch;

  @override
  State<_ConfirmScanSheet> createState() => _ConfirmScanSheetState();
}

class _ConfirmScanSheetState extends State<_ConfirmScanSheet> {
  late final List<TextEditingController> _controllers;
  late bool _newBatch;
  late final TextEditingController _noteController;

  @override
  void initState() {
    super.initState();
    _controllers = widget.detections
        .map((d) => TextEditingController(text: d.detection.detectedItem))
        .toList();
    _noteController = TextEditingController();
    _newBatch = widget.useNewBatch;
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    _noteController.dispose();
    super.dispose();
  }

  void _confirm() {
    final state = context.read<AppState>();
    var committed = 0;
    final recoveredItems = <String>[];
    for (var i = 0; i < widget.detections.length; i++) {
      final det = widget.detections[i];
      final corrected = _controllers[i].text.trim();
      final original = det.detection;
      final confirmed = corrected.isEmpty || corrected == original.detectedItem
          ? original
          : original.copyWith(detectedItem: corrected);
      final batchId = _newBatch
          ? state.createNewBatchId()
          : original.suggestedBatchId;
      state.recordPassport(
        original: original,
        confirmed: confirmed,
        batchId: batchId,
        workerNote:
            _noteController.text.trim().isEmpty ? null : _noteController.text.trim(),
      );
      recoveredItems.add(confirmed.detectedItem);
      committed += 1;
    }
    // Push each accepted recovery to the web command center so the maps,
    // glowing markers and panels light up live. Best-effort, non-blocking.
    for (final item in recoveredItems) {
      unawaited(postRecovery(item: item));
    }
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            '$committed passport${committed == 1 ? '' : 's'} saved'
            '${_newBatch ? ' to a new batch.' : '.'} Sent to command center.'),
        backgroundColor: OpsColors.navy,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        decoration: const BoxDecoration(
          color: OpsColors.bg,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: OpsColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text('Review & confirm',
                style: AppFonts.display(size: 18, weight: FontWeight.w700)),
            const SizedBox(height: 2),
            Text('Correct any mislabeled item before it joins a batch.',
                style: AppFonts.body(size: 12, color: OpsColors.muted)),
            const SizedBox(height: 16),
            Flexible(
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: widget.detections.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) {
                  final det = widget.detections[i].detection;
                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: OpsColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: OpsColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text('Model: ${det.detectedItem}',
                                style: AppFonts.body(
                                    size: 11, color: OpsColors.muted)),
                            const Spacer(),
                            Text('${det.confidencePct}%',
                                style: AppFonts.body(
                                    size: 11,
                                    weight: FontWeight.w600,
                                    color: OpsColors.blue)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _controllers[i],
                          style: AppFonts.body(
                              size: 14, weight: FontWeight.w600),
                          decoration: InputDecoration(
                            labelText: 'Detected item',
                            isDense: true,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide:
                                  const BorderSide(color: OpsColors.border),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide:
                                  const BorderSide(color: OpsColors.border),
                            ),
                          ),
                        ),
                        if (widget.labels.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: [
                              for (final label in widget.labels.take(6))
                                GestureDetector(
                                  onTap: () => setState(
                                      () => _controllers[i].text = label),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: OpsColors.bg,
                                      borderRadius: BorderRadius.circular(16),
                                      border:
                                          Border.all(color: OpsColors.border),
                                    ),
                                    child: Text(_pretty(label),
                                        style: AppFonts.body(size: 11)),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 14),
            Material(
              type: MaterialType.transparency,
              child: SwitchListTile.adaptive(
                contentPadding: EdgeInsets.zero,
                value: _newBatch,
                activeColor: OpsColors.green,
                onChanged: (v) => setState(() => _newBatch = v),
                title: Text('Create a new batch',
                    style: AppFonts.body(size: 14, weight: FontWeight.w600)),
                subtitle: Text(
                    _newBatch
                        ? 'Items get a fresh batch id.'
                        : 'Items join the suggested batch.',
                    style: AppFonts.body(size: 12, color: OpsColors.muted)),
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _noteController,
              style: AppFonts.body(size: 13),
              decoration: InputDecoration(
                labelText: 'Worker note (optional)',
                isDense: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: OpsColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: OpsColors.border),
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _confirm,
                style: FilledButton.styleFrom(
                  backgroundColor: OpsColors.green,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.check, size: 18),
                label: Text(
                    'Confirm ${widget.detections.length} item'
                    '${widget.detections.length == 1 ? '' : 's'}',
                    style: AppFonts.body(
                        size: 14,
                        weight: FontWeight.w600,
                        color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _pretty(String label) =>
      label.replaceAll('_', ' ').replaceAllMapped(
          RegExp(r'(^| )([a-z])'), (m) => '${m[1]}${m[2]!.toUpperCase()}');
}

/// Summary of batches built from saved passports, shown beneath the scan
/// results so the worker can see grouping accumulate in real time.
class _GroupedBatchesPanel extends StatelessWidget {
  const _GroupedBatchesPanel();

  @override
  Widget build(BuildContext context) {
    final summaries = context.watch<AppState>().batchSummaries;
    if (summaries.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Your batches',
                style: AppFonts.display(size: 15, weight: FontWeight.w600)),
            Text('${summaries.length} active',
                style: AppFonts.body(size: 12, color: OpsColors.muted)),
          ],
        ),
        const SizedBox(height: 10),
        for (final s in summaries) ...[
          GestureDetector(
            onTap: () => context.go('/progress/${s.batchId}'),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: OpsColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: OpsColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: OpsColors.softGreen,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.inventory_2_outlined,
                        color: OpsColors.green, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s.batchId,
                            style: AppFonts.display(
                                size: 14, weight: FontWeight.w700)),
                        Text(
                            '${s.passportCount} item'
                            '${s.passportCount == 1 ? '' : 's'} · '
                            '${s.materialTypes.length} type'
                            '${s.materialTypes.length == 1 ? '' : 's'}'
                            '${s.correctedCount > 0 ? ' · ${s.correctedCount} corrected' : ''}',
                            style: AppFonts.body(
                                size: 12, color: OpsColors.muted)),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: OpsColors.muted),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _SourceNote extends StatelessWidget {
  const _SourceNote({required this.source});
  final DetectionSource source;

  @override
  Widget build(BuildContext context) {
    final isModel = source == DetectionSource.model;
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(isModel ? Icons.memory : Icons.science_outlined,
            size: 13, color: OpsColors.muted),
        const SizedBox(width: 6),
        Text(
          isModel
              ? 'On-device model · live inference'
              : 'On-device demo · tap Capture to classify a sample',
          style: AppFonts.body(size: 11, color: OpsColors.muted),
        ),
      ],
    );
  }
}
