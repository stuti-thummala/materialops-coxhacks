import 'package:flutter/material.dart';

import '../theme/app_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/header_bits.dart';
import '../widgets/worker_bottom_nav.dart';

/// Lightweight on-brand placeholder for the Map / More tabs so the bottom nav
/// is fully navigable. The detailed Recovery Zones Map (Screen 5) can be built
/// out here later.
class PlaceholderScreen extends StatelessWidget {
  const PlaceholderScreen({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.activeIndex,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final int activeIndex;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OpsColors.navy,
      bottomNavigationBar: WorkerBottomNav(activeIndex: activeIndex),
      body: Column(
        children: [
          Container(
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
                  children: [
                    Expanded(
                      child: Text(title,
                          style: AppFonts.display(
                              size: 24,
                              weight: FontWeight.w700,
                              color: Colors.white)),
                    ),
                    const NotificationBell(count: 2),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                color: OpsColors.bg,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: OpsColors.softGreen,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Icon(icon, size: 34, color: OpsColors.green),
                    ),
                    const SizedBox(height: 16),
                    Text(title,
                        style: AppFonts.display(
                            size: 18, weight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 40),
                      child: Text(subtitle,
                          textAlign: TextAlign.center,
                          style: AppFonts.body(
                              size: 13, color: OpsColors.muted)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
