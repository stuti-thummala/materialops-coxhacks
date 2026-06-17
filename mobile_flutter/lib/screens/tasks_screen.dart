import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/header_bits.dart';
import '../widgets/worker_bottom_nav.dart';

/// Screen 2 — Task List. Assigned, queued, and completed recovery work.
class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  int _filter = 0;
  static const _filters = ['All', 'Ready', 'In Progress', 'Pending', 'Completed'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OpsColors.navy,
      bottomNavigationBar: const WorkerBottomNav(activeIndex: 1),
      body: Column(
        children: [
          _Header(),
          Expanded(
            child: Container(
              decoration: const BoxDecoration(
                color: OpsColors.bg,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
                children: [
                  SizedBox(
                    height: 34,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _filters.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, i) {
                        final active = i == _filter;
                        return GestureDetector(
                          onTap: () => setState(() => _filter = i),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 7),
                            decoration: BoxDecoration(
                              color: active
                                  ? OpsColors.navy
                                  : OpsColors.surface,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: OpsColors.border),
                            ),
                            child: Text(
                              _filters[i],
                              style: AppFonts.body(
                                size: 12,
                                weight: FontWeight.w600,
                                color: active ? Colors.white : OpsColors.ink,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: const [
                      _SummaryChip(label: 'Ready', value: '4', color: OpsColors.green),
                      SizedBox(width: 8),
                      _SummaryChip(label: 'In Progress', value: '3', color: OpsColors.blue),
                      SizedBox(width: 8),
                      _SummaryChip(label: 'Overdue', value: '1', color: OpsColors.red),
                      SizedBox(width: 8),
                      _SummaryChip(label: 'Completed', value: '7', color: OpsColors.muted),
                    ],
                  ),
                  const SizedBox(height: 18),
                  const _TaskRow(
                    batch: 'VB-104',
                    material: 'Vinyl Banners',
                    zone: 'Zone C · South Plaza',
                    destination: 'Atlanta Graphics Reuse',
                    detail: '1,842 lbs · High Impact',
                    status: 'Ready',
                    statusColor: OpsColors.green,
                    statusBg: OpsColors.softGreen,
                    cta: 'Start',
                    accent: OpsColors.green,
                  ),
                  const SizedBox(height: 12),
                  const _TaskRow(
                    batch: 'RC-212',
                    material: 'Reusable Cups',
                    zone: 'Zone D · West Concourse',
                    destination: 'LoopBack Reuse Hub',
                    detail: '~320 cups · Medium Impact',
                    status: 'In Progress',
                    statusColor: OpsColors.blue,
                    statusBg: OpsColors.softBlue,
                    cta: 'Resume',
                    accent: OpsColors.blue,
                  ),
                  const SizedBox(height: 12),
                  const _TaskRow(
                    batch: 'CT-415',
                    material: 'Carpet Tiles',
                    zone: 'Zone E · Service Area',
                    destination: 'EcoFloor Recycling',
                    detail: '980 sq ft',
                    status: 'Pending',
                    statusColor: OpsColors.purple,
                    statusBg: OpsColors.softPurple,
                    cta: 'Review',
                    accent: OpsColors.purple,
                  ),
                  const SizedBox(height: 12),
                  const _TaskRow(
                    batch: 'FS-118',
                    material: 'Foam-core Signs',
                    zone: 'Zone B · East Concourse',
                    destination: 'PolyCycle Solutions',
                    detail: 'Needs Review',
                    status: 'Review',
                    statusColor: OpsColors.amber,
                    statusBg: OpsColors.softAmber,
                    cta: 'Inspect',
                    accent: OpsColors.amber,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
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
                    Text('Tasks',
                        style: AppFonts.display(
                            size: 24,
                            weight: FontWeight.w700,
                            color: Colors.white)),
                    const SizedBox(height: 2),
                    Text('Assigned recovery work · Mercedes-Benz Stadium',
                        style: AppFonts.body(
                            size: 12,
                            color: Colors.white.withValues(alpha: 0.6))),
                  ],
                ),
              ),
              const NotificationBell(count: 2),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryChip extends StatelessWidget {
  const _SummaryChip(
      {required this.label, required this.value, required this.color});
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: OpsColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: OpsColors.border),
        ),
        child: Column(
          children: [
            Text(value,
                style: AppFonts.display(
                    size: 18, weight: FontWeight.w700, color: color)),
            Text(label,
                textAlign: TextAlign.center,
                style: AppFonts.body(size: 10, color: OpsColors.muted)),
          ],
        ),
      ),
    );
  }
}

class _TaskRow extends StatelessWidget {
  const _TaskRow({
    required this.batch,
    required this.material,
    required this.zone,
    required this.destination,
    required this.detail,
    required this.status,
    required this.statusColor,
    required this.statusBg,
    required this.cta,
    required this.accent,
  });

  final String batch;
  final String material;
  final String zone;
  final String destination;
  final String detail;
  final String status;
  final Color statusColor;
  final Color statusBg;
  final String cta;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go('/progress/T-2487'),
      child: Container(
        decoration: BoxDecoration(
          color: OpsColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: OpsColors.border),
        ),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                width: 4,
                decoration: BoxDecoration(
                  color: accent,
                  borderRadius: const BorderRadius.horizontal(
                      left: Radius.circular(14)),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text('$batch  ',
                              style: AppFonts.display(
                                  size: 15, weight: FontWeight.w700)),
                          Expanded(
                            child: Text(material,
                                style: AppFonts.body(
                                    size: 14, weight: FontWeight.w600)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 9, vertical: 4),
                            decoration: BoxDecoration(
                              color: statusBg,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(status,
                                style: AppFonts.body(
                                    size: 11,
                                    weight: FontWeight.w600,
                                    color: statusColor)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.place_outlined,
                              size: 13, color: OpsColors.muted),
                          const SizedBox(width: 4),
                          Text(zone,
                              style: AppFonts.body(
                                  size: 12, color: OpsColors.muted)),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.local_shipping_outlined,
                              size: 13, color: OpsColors.muted),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(destination,
                                style: AppFonts.body(
                                    size: 12, color: OpsColors.muted),
                                overflow: TextOverflow.ellipsis),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(detail,
                              style: AppFonts.body(
                                  size: 12, weight: FontWeight.w600)),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: OpsColors.navy,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(cta,
                                style: AppFonts.body(
                                    size: 12,
                                    weight: FontWeight.w600,
                                    color: Colors.white)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
