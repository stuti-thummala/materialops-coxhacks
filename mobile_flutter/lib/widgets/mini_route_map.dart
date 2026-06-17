import 'package:flutter/material.dart';

import '../theme/app_fonts.dart';
import '../theme/app_theme.dart';

/// A compact stylized route map (navy canvas, faint grid, dashed green route
/// between two pins). Ported from the web `MiniRouteMap` using a CustomPainter.
class MiniRouteMap extends StatelessWidget {
  const MiniRouteMap({super.key, required this.start, required this.end});

  final String start;
  final String end;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        height: 160,
        decoration: BoxDecoration(
          border: Border.all(color: OpsColors.border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(painter: _RouteMapPainter()),
            ),
            Positioned(
              left: 8,
              bottom: 8,
              child: _MapChip(
                icon: Icons.place_rounded,
                label: start,
                color: OpsColors.green,
              ),
            ),
            Positioned(
              right: 8,
              top: 8,
              child: _MapChip(
                icon: Icons.flag_rounded,
                label: end,
                color: OpsColors.blue,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MapChip extends StatelessWidget {
  const _MapChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: OpsColors.surface.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: AppFonts.body(size: 12, weight: FontWeight.w600, color: color),
          ),
        ],
      ),
    );
  }
}

class _RouteMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Base gradient.
    final rect = Offset.zero & size;
    final bg = Paint()
      ..shader = const RadialGradient(
        colors: [Color(0xFF16314A), Color(0xFF0D2533)],
        radius: 0.9,
      ).createShader(rect);
    canvas.drawRect(rect, bg);

    // Faint street grid.
    final grid = Paint()
      ..color = const Color(0xFF9FC3E6).withValues(alpha: 0.14)
      ..strokeWidth = 1;
    const stepX = 50.0;
    for (double x = 0; x <= size.width; x += stepX) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), grid);
    }
    for (double y = 0; y <= size.height; y += stepX) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grid);
    }

    // Dashed route curve.
    final start = Offset(size.width * 0.15, size.height * 0.7);
    final end = Offset(size.width * 0.82, size.height * 0.3);
    final control1 = Offset(size.width * 0.35, size.height * 0.35);
    final control2 = Offset(size.width * 0.6, size.height * 0.9);
    final path = Path()
      ..moveTo(start.dx, start.dy)
      ..cubicTo(
        control1.dx,
        control1.dy,
        control2.dx,
        control2.dy,
        end.dx,
        end.dy,
      );

    final routePaint = Paint()
      ..color = OpsColors.green
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;
    _drawDashedPath(canvas, path, routePaint, dash: 6, gap: 6);

    // Endpoints.
    canvas.drawCircle(start, 6, Paint()..color = OpsColors.green);
    canvas.drawCircle(end, 6, Paint()..color = OpsColors.blue);
  }

  void _drawDashedPath(
    Canvas canvas,
    Path source,
    Paint paint, {
    required double dash,
    required double gap,
  }) {
    for (final metric in source.computeMetrics()) {
      double distance = 0;
      while (distance < metric.length) {
        final next = distance + dash;
        canvas.drawPath(
          metric.extractPath(distance, next.clamp(0, metric.length)),
          paint,
        );
        distance = next + gap;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
