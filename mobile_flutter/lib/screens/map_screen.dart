import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/mock_data.dart';
import '../models/models.dart';
import '../theme/app_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/header_bits.dart';
import '../widgets/worker_bottom_nav.dart';

/// Screen 5 — Recovery Zones Map.
/// An interactive, annotated map of Mercedes-Benz Stadium showing the active
/// recovery zones for the post-event cleanup. Each pin is tied to a worker
/// task; tapping a pin reveals the task and lets the worker jump straight into
/// scanning or the task detail. Fully self-contained (no network/tiles).
class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  late final List<_Zone> _zones = _buildZones();
  int _selected = 0;

  List<_Zone> _buildZones() {
    // Anchor zones to the stadium graphic (normalized 0..1 coordinates) and
    // pair each with a real task from the shared mock data.
    const anchors = <Offset>[
      Offset(0.30, 0.40), // Stadium Bowl
      Offset(0.68, 0.34), // Home Depot Backyard
      Offset(0.52, 0.66), // Fan Plaza
      Offset(0.80, 0.74), // Parking / Logistics
    ];
    final zones = <_Zone>[];
    for (var i = 0; i < MockData.tasks.length && i < anchors.length; i++) {
      final t = MockData.tasks[i];
      zones.add(_Zone(task: t, pos: anchors[i]));
    }
    // A staging zone with no task to round out the map.
    zones.add(const _Zone.staging(
      name: 'Parking / Logistics',
      pos: Offset(0.80, 0.74),
    ));
    return zones;
  }

  Color _statusColor(_Zone z) {
    switch (z.priority) {
      case Priority.high:
        return OpsColors.red;
      case Priority.medium:
        return OpsColors.amber;
      case Priority.low:
        return OpsColors.blue;
      case null:
        return OpsColors.green;
    }
  }

  @override
  Widget build(BuildContext context) {
    final selected = _zones[_selected];
    return Scaffold(
      backgroundColor: OpsColors.navy,
      bottomNavigationBar: const WorkerBottomNav(activeIndex: 3),
      body: Column(
        children: [
          _MapHeader(activeCount: _zones.where((z) => z.task != null).length),
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                color: OpsColors.bg,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                children: [
                  _StadiumMap(
                    zones: _zones,
                    selected: _selected,
                    colorOf: _statusColor,
                    onTapZone: (i) => setState(() => _selected = i),
                  ),
                  const SizedBox(height: 14),
                  _Legend(),
                  const SizedBox(height: 16),
                  _SelectedZoneCard(
                    zone: selected,
                    color: _statusColor(selected),
                  ),
                  const SizedBox(height: 18),
                  Text('All zones',
                      style:
                          AppFonts.display(size: 15, weight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  for (var i = 0; i < _zones.length; i++) ...[
                    _ZoneRow(
                      zone: _zones[i],
                      color: _statusColor(_zones[i]),
                      selected: i == _selected,
                      onTap: () => setState(() => _selected = i),
                    ),
                    const SizedBox(height: 10),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Header matching the other tab headers.
class _MapHeader extends StatelessWidget {
  const _MapHeader({required this.activeCount});
  final int activeCount;

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
          padding: const EdgeInsets.fromLTRB(20, 12, 16, 18),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Recovery Zones',
                        style: AppFonts.display(
                            size: 24,
                            weight: FontWeight.w700,
                            color: Colors.white)),
                    const SizedBox(height: 2),
                    Text('Mercedes-Benz Stadium · Atlanta, GA',
                        style: AppFonts.body(
                            size: 12,
                            color: Colors.white.withValues(alpha: 0.6))),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: LiveStatusDot(label: '$activeCount active'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The interactive stadium graphic with tappable zone pins.
class _StadiumMap extends StatelessWidget {
  const _StadiumMap({
    required this.zones,
    required this.selected,
    required this.colorOf,
    required this.onTapZone,
  });

  final List<_Zone> zones;
  final int selected;
  final Color Function(_Zone) colorOf;
  final ValueChanged<int> onTapZone;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: AspectRatio(
        aspectRatio: 4 / 3,
        child: LayoutBuilder(
          builder: (context, constraints) {
            final w = constraints.maxWidth;
            final h = constraints.maxHeight;
            return Stack(
              children: [
                Positioned.fill(
                  child: CustomPaint(painter: _StadiumPainter()),
                ),
                for (var i = 0; i < zones.length; i++)
                  Positioned(
                    left: zones[i].pos.dx * w - 22,
                    top: zones[i].pos.dy * h - 44,
                    child: _ZonePin(
                      label: zones[i].shortName,
                      color: colorOf(zones[i]),
                      active: i == selected,
                      onTap: () => onTapZone(i),
                    ),
                  ),
                const Positioned(
                  left: 12,
                  top: 12,
                  child: _MapBadge(
                    icon: Icons.stadium_outlined,
                    label: 'Stadium Bowl',
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ZonePin extends StatelessWidget {
  const _ZonePin({
    required this.label,
    required this.color,
    required this.active,
    required this.onTap,
  });

  final String label;
  final Color color;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: active ? color : Colors.black.withValues(alpha: 0.55),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: color, width: active ? 0 : 1),
            ),
            child: Text(label,
                style: AppFonts.body(
                    size: 10,
                    weight: FontWeight.w700,
                    color: Colors.white)),
          ),
          AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            margin: const EdgeInsets.only(top: 2),
            width: active ? 20 : 14,
            height: active ? 20 : 14,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.6),
                  blurRadius: active ? 14 : 6,
                  spreadRadius: active ? 1 : 0,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MapBadge extends StatelessWidget {
  const _MapBadge({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.45),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 6),
          Text(label,
              style: AppFonts.body(
                  size: 11, weight: FontWeight.w600, color: Colors.white)),
        ],
      ),
    );
  }
}

class _Legend extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    Widget dot(Color c, String label) => Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(color: c, shape: BoxShape.circle),
            ),
            const SizedBox(width: 6),
            Text(label, style: AppFonts.body(size: 11, color: OpsColors.muted)),
          ],
        );
    return Wrap(
      spacing: 16,
      runSpacing: 8,
      children: [
        dot(OpsColors.red, 'High priority'),
        dot(OpsColors.amber, 'Medium'),
        dot(OpsColors.blue, 'Low'),
        dot(OpsColors.green, 'Staging'),
      ],
    );
  }
}

/// The detail card for the currently-selected zone, with quick actions.
class _SelectedZoneCard extends StatelessWidget {
  const _SelectedZoneCard({required this.zone, required this.color});
  final _Zone zone;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final task = zone.task;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: OpsColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: OpsColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                    task == null ? Icons.local_shipping_outlined : Icons.place,
                    color: color,
                    size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(zone.name,
                        style: AppFonts.display(
                            size: 16, weight: FontWeight.w700)),
                    Text(
                        task == null
                            ? 'Staging & logistics hub'
                            : '${task.items} items · ${task.weight}',
                        style:
                            AppFonts.body(size: 12, color: OpsColors.muted)),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(zone.priorityLabel,
                    style: AppFonts.body(
                        size: 11, weight: FontWeight.w700, color: color)),
              ),
            ],
          ),
          if (task != null) ...[
            const SizedBox(height: 14),
            Text(task.title,
                style: AppFonts.body(size: 14, weight: FontWeight.w600)),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.alt_route, size: 14, color: OpsColors.muted),
                const SizedBox(width: 6),
                Expanded(
                  child: Text('${task.fromZone}  →  ${task.toZone}',
                      style:
                          AppFonts.body(size: 12, color: OpsColors.muted)),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.schedule, size: 14, color: OpsColors.muted),
                const SizedBox(width: 6),
                Text('ETA ${task.eta} · ${task.distanceMiles} mi',
                    style: AppFonts.body(size: 12, color: OpsColors.muted)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () => context.go('/scan'),
                    style: FilledButton.styleFrom(
                      backgroundColor: OpsColors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.qr_code_scanner_rounded, size: 18),
                    label: Text('Scan here',
                        style: AppFonts.body(
                            size: 13,
                            weight: FontWeight.w600,
                            color: Colors.white)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => context.go('/progress/${task.id}'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: OpsColors.ink,
                      side: const BorderSide(color: OpsColors.border),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.assignment_outlined, size: 18),
                    label: Text('View task',
                        style: AppFonts.body(
                            size: 13, weight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ] else ...[
            const SizedBox(height: 12),
            Text(
                'Confirmed batches are consolidated here before partner pickup.',
                style: AppFonts.body(size: 13, color: OpsColors.muted)),
          ],
        ],
      ),
    );
  }
}

class _ZoneRow extends StatelessWidget {
  const _ZoneRow({
    required this.zone,
    required this.color,
    required this.selected,
    required this.onTap,
  });

  final _Zone zone;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: OpsColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? color : OpsColors.border,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(zone.name,
                      style:
                          AppFonts.body(size: 14, weight: FontWeight.w600)),
                  Text(
                      zone.task == null
                          ? 'Staging hub'
                          : zone.task!.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppFonts.body(size: 12, color: OpsColors.muted)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: OpsColors.muted),
          ],
        ),
      ),
    );
  }
}

/// Paints a stylized stadium: outer bowl, concourse ring, and green field.
class _StadiumPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;

    // Background gradient (aerial night view).
    canvas.drawRect(
      rect,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF16314A), Color(0xFF0B1F2C)],
        ).createShader(rect),
    );

    // Faint district grid.
    final grid = Paint()
      ..color = const Color(0xFF9FC3E6).withValues(alpha: 0.10)
      ..strokeWidth = 1;
    const step = 46.0;
    for (double x = 0; x <= size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), grid);
    }
    for (double y = 0; y <= size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grid);
    }

    final center = Offset(size.width * 0.5, size.height * 0.48);

    // Outer stadium bowl (rounded octagon look via concentric rings).
    final bowlRect = Rect.fromCenter(
      center: center,
      width: size.width * 0.78,
      height: size.height * 0.66,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(bowlRect, const Radius.circular(80)),
      Paint()
        ..color = const Color(0xFF1E3C57)
        ..style = PaintingStyle.fill,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(bowlRect, const Radius.circular(80)),
      Paint()
        ..color = OpsColors.green.withValues(alpha: 0.5)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );

    // Concourse ring.
    final concourse = bowlRect.deflate(size.width * 0.07);
    canvas.drawRRect(
      RRect.fromRectAndRadius(concourse, const Radius.circular(60)),
      Paint()
        ..color = const Color(0xFF274D6E)
        ..style = PaintingStyle.fill,
    );

    // The green field.
    final field = Rect.fromCenter(
      center: center,
      width: size.width * 0.40,
      height: size.height * 0.30,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(field, const Radius.circular(14)),
      Paint()..color = const Color(0xFF1F7A4D),
    );
    // Field midline + center circle.
    final line = Paint()
      ..color = Colors.white.withValues(alpha: 0.7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawLine(
      Offset(center.dx, field.top),
      Offset(center.dx, field.bottom),
      line,
    );
    canvas.drawCircle(center, field.height * 0.18, line);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// A recovery zone on the map, optionally tied to a worker task.
class _Zone {
  const _Zone({required WorkerTask this.task, required this.pos})
      : _stagingName = null;

  const _Zone.staging({required String name, required this.pos})
      : task = null,
        _stagingName = name;

  final WorkerTask? task;
  final Offset pos;
  final String? _stagingName;

  String get name => task?.fromZone ?? _stagingName ?? 'Zone';

  String get shortName {
    final n = name;
    return n.length <= 14 ? n : '${n.substring(0, 13)}…';
  }

  Priority? get priority => task?.priority;

  String get priorityLabel {
    switch (priority) {
      case Priority.high:
        return 'High';
      case Priority.medium:
        return 'Medium';
      case Priority.low:
        return 'Low';
      case null:
        return 'Staging';
    }
  }
}
