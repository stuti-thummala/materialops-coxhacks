import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_fonts.dart';
import '../theme/app_theme.dart';

/// Persistent 5-item bottom navigation with a centered, slightly elevated green
/// Scan button. Matches the worker app screenshots:
/// Home · Tasks · (Scan) · Map · More.
class WorkerBottomNav extends StatelessWidget {
  const WorkerBottomNav({super.key, required this.activeIndex});

  /// 0 Home · 1 Tasks · 2 Scan · 3 Map · 4 More
  final int activeIndex;

  void _go(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/');
      case 1:
        context.go('/tasks');
      case 2:
        context.go('/scan');
      case 3:
        context.go('/map');
      case 4:
        context.go('/more');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: OpsColors.navy,
        border: Border(top: BorderSide(color: Color(0x14FFFFFF))),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: [
              _NavTab(
                icon: Icons.home_outlined,
                label: 'Home',
                active: activeIndex == 0,
                onTap: () => _go(context, 0),
              ),
              _NavTab(
                icon: Icons.assignment_outlined,
                label: 'Tasks',
                active: activeIndex == 1,
                onTap: () => _go(context, 1),
              ),
              _ScanTab(
                active: activeIndex == 2,
                onTap: () => _go(context, 2),
              ),
              _NavTab(
                icon: Icons.map_outlined,
                label: 'Map',
                active: activeIndex == 3,
                onTap: () => _go(context, 3),
              ),
              _NavTab(
                icon: Icons.more_horiz,
                label: 'More',
                active: activeIndex == 4,
                onTap: () => _go(context, 4),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavTab extends StatelessWidget {
  const _NavTab({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = active ? OpsColors.green : Colors.white.withValues(alpha: 0.55);
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 22, color: color),
            const SizedBox(height: 3),
            Text(
              label,
              style: AppFonts.body(size: 10, weight: FontWeight.w600, color: color),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScanTab extends StatelessWidget {
  const _ScanTab({required this.active, required this.onTap});

  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Center(
        child: GestureDetector(
          onTap: onTap,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 48,
                width: 48,
                decoration: BoxDecoration(
                  color: OpsColors.green,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withValues(alpha: 0.18), width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: OpsColors.green.withValues(alpha: 0.45),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(Icons.qr_code_scanner_rounded,
                    color: Colors.white, size: 24),
              ),
              const SizedBox(height: 2),
              Text(
                'Scan',
                style: AppFonts.body(
                  size: 10,
                  weight: FontWeight.w600,
                  color: active ? OpsColors.green : Colors.white.withValues(alpha: 0.7),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
