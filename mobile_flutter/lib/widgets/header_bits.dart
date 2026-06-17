import 'package:flutter/material.dart';

import '../theme/app_fonts.dart';
import '../theme/app_theme.dart';

/// Notification bell with a small red count badge (used in navy headers).
class NotificationBell extends StatelessWidget {
  const NotificationBell({super.key, this.count = 2});

  final int count;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 40,
      height: 40,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Center(
            child: Icon(Icons.notifications_none_rounded,
                color: Colors.white.withValues(alpha: 0.92), size: 24),
          ),
          if (count > 0)
            Positioned(
              right: 4,
              top: 2,
              child: Container(
                padding: const EdgeInsets.all(4),
                constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                decoration: const BoxDecoration(
                  color: OpsColors.red,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '$count',
                  textAlign: TextAlign.center,
                  style: AppFonts.body(
                    size: 9,
                    weight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Small circular worker avatar with initials fallback.
class WorkerAvatar extends StatelessWidget {
  const WorkerAvatar({super.key, this.size = 40, this.initials = 'ST'});

  final double size;
  final String initials;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(
          colors: [OpsColors.green, OpsColors.blue],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Colors.white.withValues(alpha: 0.25), width: 2),
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: AppFonts.body(
          size: size * 0.34,
          weight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    );
  }
}

/// Live status pill: green dot + label, used in navy headers.
class LiveStatusDot extends StatelessWidget {
  const LiveStatusDot({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: const BoxDecoration(
            color: OpsColors.green,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: AppFonts.body(
            size: 12,
            weight: FontWeight.w500,
            color: Colors.white.withValues(alpha: 0.85),
          ),
        ),
      ],
    );
  }
}
