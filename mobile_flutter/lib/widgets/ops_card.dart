import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// A flat ops-styled card: white surface, hairline border, rounded corners.
/// The Flutter equivalent of the web app's `GlassCard` (post-retheme).
class OpsCard extends StatelessWidget {
  const OpsCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.color = OpsColors.surface,
    this.borderColor = OpsColors.border,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color color;
  final Color borderColor;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: child,
    );

    if (onTap == null) return card;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: card,
      ),
    );
  }
}
