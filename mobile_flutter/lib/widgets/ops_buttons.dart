import 'package:flutter/material.dart';

import '../theme/app_fonts.dart';
import '../theme/app_theme.dart';

/// Full-width ops primary action button (solid green) with optional leading
/// icon. Mirrors the web app's primary `GradientButton` after the retheme.
class OpsPrimaryButton extends StatelessWidget {
  const OpsPrimaryButton({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.expand = true,
  });

  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final button = FilledButton(
      onPressed: onPressed,
      style: FilledButton.styleFrom(
        backgroundColor: OpsColors.green,
        foregroundColor: Colors.white,
        disabledBackgroundColor: OpsColors.green.withValues(alpha: 0.5),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: AppFonts.body(
              size: 14,
              weight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          if (icon != null) ...[
            const SizedBox(width: 8),
            Icon(icon, size: 18),
          ],
        ],
      ),
    );

    return expand ? SizedBox(width: double.infinity, child: button) : button;
  }
}

/// Secondary (outline) ops button: white surface, hairline border, ink text.
class OpsSecondaryButton extends StatelessWidget {
  const OpsSecondaryButton({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.expand = true,
  });

  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final button = OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        backgroundColor: OpsColors.surface,
        foregroundColor: OpsColors.ink,
        side: const BorderSide(color: OpsColors.border),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 18),
            const SizedBox(width: 8),
          ],
          Text(
            label,
            style: AppFonts.body(
              size: 14,
              weight: FontWeight.w600,
              color: OpsColors.ink,
            ),
          ),
        ],
      ),
    );

    return expand ? SizedBox(width: double.infinity, child: button) : button;
  }
}
