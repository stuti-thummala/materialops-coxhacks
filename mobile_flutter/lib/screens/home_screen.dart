import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/header_bits.dart';
import '../widgets/worker_bottom_nav.dart';

/// Screen 1 — Home / Worker Overview.
/// Recreates the worker home screenshot: navy header, greeting + weather,
/// today's progress donut, assigned tasks, and impact summary.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OpsColors.navy,
      bottomNavigationBar: const WorkerBottomNav(activeIndex: 0),
      body: Column(
        children: [
          const _HomeHeader(),
          Expanded(
            child: Container(
              decoration: const BoxDecoration(
                color: OpsColors.bg,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 22, 20, 28),
                children: const [
                  _Greeting(),
                  SizedBox(height: 18),
                  _ProgressCard(),
                  SizedBox(height: 22),
                  _AssignedTasksHeader(),
                  SizedBox(height: 12),
                  _TaskCard(
                    code: 'Recover VB-104',
                    material: 'Vinyl Banners',
                    zone: 'Zone C · South Plaza',
                    impact: 'High Impact',
                    impactColor: OpsColors.green,
                    statusLabel: 'Ready',
                    statusColor: OpsColors.green,
                    statusBg: OpsColors.softGreen,
                    cta: 'Start Task',
                    eta: 'Est. 20 min',
                    icon: Icons.flag_rounded,
                    iconBg: OpsColors.softGreen,
                    iconColor: OpsColors.green,
                    taskId: 'T-2487',
                  ),
                  SizedBox(height: 12),
                  _TaskCard(
                    code: 'Move RC-212',
                    material: 'Reusable Cups',
                    zone: 'Zone D · West Concourse',
                    impact: 'Medium Impact',
                    impactColor: OpsColors.blue,
                    statusLabel: 'In Progress',
                    statusColor: OpsColors.blue,
                    statusBg: OpsColors.softBlue,
                    cta: 'Resume',
                    eta: 'Est. 15 min',
                    icon: Icons.local_cafe_rounded,
                    iconBg: OpsColors.softBlue,
                    iconColor: OpsColors.blue,
                    taskId: 'T-2487',
                  ),
                  SizedBox(height: 12),
                  _TaskCard(
                    code: 'Inspect CT-415',
                    material: 'Carpet Tiles',
                    zone: 'Zone E · Service Area',
                    impact: 'Low Impact',
                    impactColor: OpsColors.purple,
                    statusLabel: 'Pending',
                    statusColor: OpsColors.purple,
                    statusBg: OpsColors.softPurple,
                    cta: 'Start Task',
                    eta: 'Est. 25 min',
                    icon: Icons.grid_view_rounded,
                    iconBg: OpsColors.softPurple,
                    iconColor: OpsColors.purple,
                    taskId: 'T-2487',
                  ),
                  SizedBox(height: 22),
                  _ImpactCard(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader();

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
          padding: const EdgeInsets.fromLTRB(20, 12, 16, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'MaterialOps',
                    style: AppFonts.display(
                      size: 22,
                      weight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const Spacer(),
                  const NotificationBell(count: 2),
                  const SizedBox(width: 10),
                  const WorkerAvatar(initials: 'ST'),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Icon(Icons.stadium_rounded,
                      size: 18, color: Colors.white.withValues(alpha: 0.7)),
                  const SizedBox(width: 8),
                  Text(
                    'Mercedes-Benz Stadium',
                    style: AppFonts.body(
                      size: 14,
                      weight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Padding(
                padding: const EdgeInsets.only(left: 26),
                child: Text(
                  'FIFA World Cup 2026™ Atlanta',
                  style: AppFonts.body(
                    size: 12,
                    color: Colors.white.withValues(alpha: 0.6),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              const Padding(
                padding: EdgeInsets.only(left: 26),
                child: LiveStatusDot(label: 'Post-Event Cleanup'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Greeting extends StatelessWidget {
  const _Greeting();

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Good morning, Stuti!',
                style: AppFonts.display(size: 24, weight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              Text(
                "Let's keep the stadium moving forward.",
                style: AppFonts.body(size: 14, color: OpsColors.muted),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: OpsColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: OpsColors.border),
          ),
          child: Row(
            children: [
              const Icon(Icons.wb_sunny_rounded, size: 18, color: OpsColors.amber),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('72°F',
                      style: AppFonts.body(size: 14, weight: FontWeight.w700)),
                  Text('Atlanta, GA',
                      style: AppFonts.body(size: 11, color: OpsColors.muted)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: OpsColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: OpsColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Today's Progress",
              style: AppFonts.display(size: 16, weight: FontWeight.w600)),
          const SizedBox(height: 16),
          Row(
            children: [
              const _ProgressDonut(percent: 0.68),
              const SizedBox(width: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    _ProgressStat(
                      icon: Icons.check_circle,
                      color: OpsColors.green,
                      value: '7',
                      label: 'Tasks Complete',
                    ),
                    SizedBox(height: 10),
                    _ProgressStat(
                      icon: Icons.info,
                      color: OpsColors.blue,
                      value: '3',
                      label: 'In Progress',
                    ),
                    SizedBox(height: 10),
                    _ProgressStat(
                      icon: Icons.radio_button_unchecked,
                      color: OpsColors.muted,
                      value: '2',
                      label: 'Remaining',
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Daily Goal',
                      style: AppFonts.body(size: 11, color: OpsColors.muted)),
                  Text('12 tasks',
                      style: AppFonts.display(size: 15, weight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  Text('End of Shift',
                      style: AppFonts.body(size: 11, color: OpsColors.muted)),
                  Text('8:00 PM',
                      style: AppFonts.display(size: 15, weight: FontWeight.w700)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProgressDonut extends StatelessWidget {
  const _ProgressDonut({required this.percent});

  final double percent;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 92,
      height: 92,
      child: CustomPaint(
        painter: _DonutPainter(percent),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('${(percent * 100).round()}%',
                  style: AppFonts.display(size: 20, weight: FontWeight.w700)),
              Text('Complete',
                  style: AppFonts.body(size: 10, color: OpsColors.muted)),
            ],
          ),
        ),
      ),
    );
  }
}

class _DonutPainter extends CustomPainter {
  _DonutPainter(this.percent);
  final double percent;

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final radius = (size.width / 2) - 6;
    const stroke = 9.0;

    final track = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..color = OpsColors.border;
    canvas.drawCircle(center, radius, track);

    final arc = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..color = OpsColors.green;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      2 * math.pi * percent,
      false,
      arc,
    );
  }

  @override
  bool shouldRepaint(covariant _DonutPainter old) => old.percent != percent;
}

class _ProgressStat extends StatelessWidget {
  const _ProgressStat({
    required this.icon,
    required this.color,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final Color color;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: color),
        const SizedBox(width: 8),
        Text(value, style: AppFonts.display(size: 15, weight: FontWeight.w700)),
        const SizedBox(width: 6),
        Flexible(
          child: Text(label,
              style: AppFonts.body(size: 12, color: OpsColors.muted),
              overflow: TextOverflow.ellipsis),
        ),
      ],
    );
  }
}

class _AssignedTasksHeader extends StatelessWidget {
  const _AssignedTasksHeader();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text('My Assigned Tasks',
            style: AppFonts.display(size: 17, weight: FontWeight.w600)),
        GestureDetector(
          onTap: () => context.go('/tasks'),
          child: Text('View all (12)',
              style: AppFonts.body(
                  size: 13, weight: FontWeight.w600, color: OpsColors.green)),
        ),
      ],
    );
  }
}

class _TaskCard extends StatelessWidget {
  const _TaskCard({
    required this.code,
    required this.material,
    required this.zone,
    required this.impact,
    required this.impactColor,
    required this.statusLabel,
    required this.statusColor,
    required this.statusBg,
    required this.cta,
    required this.eta,
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.taskId,
  });

  final String code;
  final String material;
  final String zone;
  final String impact;
  final Color impactColor;
  final String statusLabel;
  final Color statusColor;
  final Color statusBg;
  final String cta;
  final String eta;
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final String taskId;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: OpsColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: OpsColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(code,
                    style: AppFonts.display(size: 15, weight: FontWeight.w700)),
                Text(material,
                    style: AppFonts.body(size: 13, color: OpsColors.ink)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.place_outlined,
                        size: 13, color: OpsColors.muted),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(zone,
                          style:
                              AppFonts.body(size: 12, color: OpsColors.muted),
                          overflow: TextOverflow.ellipsis),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.eco_rounded, size: 13, color: impactColor),
                    const SizedBox(width: 4),
                    Text(impact,
                        style: AppFonts.body(
                            size: 12,
                            weight: FontWeight.w600,
                            color: impactColor)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(statusLabel,
                    style: AppFonts.body(
                        size: 11,
                        weight: FontWeight.w600,
                        color: statusColor)),
              ),
              const SizedBox(height: 10),
              GestureDetector(
                onTap: () => context.go('/progress/$taskId'),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                  decoration: BoxDecoration(
                    color: OpsColors.navy,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(cta,
                      style: AppFonts.body(
                          size: 13,
                          weight: FontWeight.w600,
                          color: Colors.white)),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(eta,
                      style: AppFonts.body(size: 11, color: OpsColors.muted)),
                  const SizedBox(width: 2),
                  const Icon(Icons.chevron_right,
                      size: 16, color: OpsColors.muted),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ImpactCard extends StatelessWidget {
  const _ImpactCard();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.eco_rounded, size: 18, color: OpsColors.green),
                const SizedBox(width: 6),
                Text('Your Impact Today',
                    style: AppFonts.display(size: 17, weight: FontWeight.w600)),
              ],
            ),
            Text('Updated 9:40 AM',
                style: AppFonts.body(size: 11, color: OpsColors.muted)),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          decoration: BoxDecoration(
            color: OpsColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: OpsColors.border),
          ),
          child: Row(
            children: const [
              _ImpactStat(
                icon: Icons.eco_rounded,
                color: OpsColors.green,
                value: '128',
                label: 'lbs material\nrecovered',
              ),
              _ImpactStat(
                icon: Icons.cloud_outlined,
                color: OpsColors.blue,
                value: '312',
                label: 'lbs CO₂\navoided',
              ),
              _ImpactStat(
                icon: Icons.groups_outlined,
                color: OpsColors.amber,
                value: '24',
                label: 'items diverted\nfrom landfill',
              ),
              _ImpactStat(
                icon: Icons.emoji_events_outlined,
                color: OpsColors.purple,
                value: '85',
                label: 'impact points\nearned',
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ImpactStat extends StatelessWidget {
  const _ImpactStat({
    required this.icon,
    required this.color,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final Color color;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 6),
          Text(value, style: AppFonts.display(size: 18, weight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
            style: AppFonts.body(size: 10, color: OpsColors.muted, height: 1.2),
          ),
        ],
      ),
    );
  }
}
