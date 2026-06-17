import 'package:flutter/material.dart';

import '../theme/app_fonts.dart';

/// Small uppercase status/priority chip, ported from the web `StatusPill`.
/// Tinted background + matching border and text in a single accent color.
class StatusPill extends StatelessWidget {
  const StatusPill({
    super.key,
    required this.label,
    required this.color,
  });

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.30)),
      ),
      child: Text(
        label.toUpperCase(),
        style: AppFonts.body(
          size: 11,
          weight: FontWeight.w600,
          color: color,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}
