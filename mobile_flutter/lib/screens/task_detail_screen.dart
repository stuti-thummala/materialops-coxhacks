import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../state/app_state.dart';
import '../theme/app_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/mini_route_map.dart';

/// Screen 3 — Task Detail / In Progress.
/// Recreates the "Task in Progress" screenshot for VB-104 vinyl banners.
class TaskDetailScreen extends StatelessWidget {
  const TaskDetailScreen({super.key, required this.taskId});

  final String taskId;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final complete = state.isComplete(taskId);

    return Scaffold(
      backgroundColor: OpsColors.bg,
      appBar: AppBar(
        backgroundColor: OpsColors.bg,
        surfaceTintColor: OpsColors.bg,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: OpsColors.ink),
          onPressed: () => context.canPop() ? context.pop() : context.go('/'),
        ),
        title: Text('Task in Progress',
            style: AppFonts.display(size: 17, weight: FontWeight.w600)),
        actions: const [
          Icon(Icons.more_vert, color: OpsColors.ink),
          SizedBox(width: 12),
        ],
      ),
      bottomNavigationBar: _ActionBar(taskId: taskId, complete: complete),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _Pill(
                label: complete ? 'Complete' : 'In Progress',
                color: complete ? OpsColors.green : OpsColors.green,
                bg: OpsColors.softGreen,
                dot: true,
              ),
              Text('Task ID: T-2487',
                  style: AppFonts.body(size: 12, color: OpsColors.muted)),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: OpsColors.softPurple,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.flag_rounded,
                    color: OpsColors.purple, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Recover VB-104 Vinyl Banners',
                        style:
                            AppFonts.display(size: 19, weight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text('Mercedes-Benz Stadium',
                        style: AppFonts.body(size: 13, color: OpsColors.muted)),
                    Text('Atlanta, Georgia',
                        style: AppFonts.body(size: 13, color: OpsColors.muted)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _InfoCard(),
          const SizedBox(height: 16),
          _ProgressCard(complete: complete),
          const SizedBox(height: 16),
          _RecoveryPlanCard(batchId: taskId),
          const SizedBox(height: 16),
          _RouteCard(),
          const SizedBox(height: 16),
          _ProofCard(),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({
    required this.label,
    required this.color,
    required this.bg,
    this.dot = false,
  });

  final String label;
  final Color color;
  final Color bg;
  final bool dot;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (dot) ...[
            Container(
              width: 7,
              height: 7,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 6),
          ],
          Text(label,
              style: AppFonts.body(
                  size: 12, weight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: OpsColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: OpsColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Zone',
                    style: AppFonts.body(size: 11, color: OpsColors.muted)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                          color: OpsColors.green, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 6),
                    Text('Zone C',
                        style:
                            AppFonts.body(size: 14, weight: FontWeight.w600)),
                  ],
                ),
                Text('South Plaza',
                    style: AppFonts.body(size: 12, color: OpsColors.muted)),
              ],
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Destination Partner',
                    style: AppFonts.body(size: 11, color: OpsColors.muted)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.diamond_outlined,
                        size: 14, color: OpsColors.blue),
                    const SizedBox(width: 6),
                    Text('Partner Group',
                        style:
                            AppFonts.body(size: 14, weight: FontWeight.w600)),
                  ],
                ),
                Text('Atlanta',
                    style: AppFonts.body(size: 12, color: OpsColors.muted)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Priority',
                  style: AppFonts.body(size: 11, color: OpsColors.muted)),
              const SizedBox(height: 6),
              const _Pill(
                label: 'Medium',
                color: OpsColors.amber,
                bg: OpsColors.softAmber,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard({required this.complete});
  final bool complete;

  @override
  Widget build(BuildContext context) {
    final steps = <_Step>[
      const _Step('Check in & review task details', 'Completed · 9:02 AM',
          _StepState.done),
      const _Step('Locate VB-104 vinyl banners', 'Completed · 9:05 AM',
          _StepState.done),
      _Step('Recover VB-104 vinyl banners', complete ? 'Completed' : 'In Progress',
          complete ? _StepState.done : _StepState.active),
      _Step('Transport to Partner Group', complete ? 'Completed' : 'Pending',
          complete ? _StepState.done : _StepState.pending),
      _Step('Confirm drop-off & complete', complete ? 'Completed' : 'Pending',
          complete ? _StepState.done : _StepState.pending),
    ];
    final doneCount = steps.where((s) => s.state == _StepState.done).length;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: OpsColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: OpsColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Task Progress',
                  style: AppFonts.display(size: 15, weight: FontWeight.w600)),
              Text('$doneCount of 5 complete',
                  style: AppFonts.body(size: 12, color: OpsColors.muted)),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: doneCount / 5,
              minHeight: 6,
              backgroundColor: OpsColors.border,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(OpsColors.green),
            ),
          ),
          const SizedBox(height: 14),
          for (var i = 0; i < steps.length; i++)
            _StepRow(step: steps[i], isLast: i == steps.length - 1),
        ],
      ),
    );
  }
}

enum _StepState { done, active, pending }

class _Step {
  const _Step(this.title, this.subtitle, this.state);
  final String title;
  final String subtitle;
  final _StepState state;
}

class _StepRow extends StatelessWidget {
  const _StepRow({required this.step, required this.isLast});
  final _Step step;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    Widget marker;
    switch (step.state) {
      case _StepState.done:
        marker = Container(
          width: 24,
          height: 24,
          decoration: const BoxDecoration(
              color: OpsColors.green, shape: BoxShape.circle),
          child: const Icon(Icons.check, size: 15, color: Colors.white),
        );
      case _StepState.active:
        marker = Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: OpsColors.green, width: 2.5),
          ),
        );
      case _StepState.pending:
        marker = Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: OpsColors.border, width: 2),
          ),
          alignment: Alignment.center,
          child: Text(
            isLast ? '5' : '4',
            style: AppFonts.body(size: 11, color: OpsColors.muted),
          ),
        );
    }

    final subColor = step.state == _StepState.active
        ? OpsColors.green
        : OpsColors.muted;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          marker,
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(step.title,
                    style:
                        AppFonts.body(size: 14, weight: FontWeight.w600)),
                Text(step.subtitle,
                    style: AppFonts.body(size: 12, color: subColor)),
              ],
            ),
          ),
          const Icon(Icons.expand_more, size: 18, color: OpsColors.muted),
        ],
      ),
    );
  }
}

class _RecoveryPlanCard extends StatelessWidget {
  const _RecoveryPlanCard({required this.batchId});
  final String batchId;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final plan = state.buildRecoveryPlanForBatch(batchId);
    final nextIndex =
        plan.steps.indexWhere((s) => s.state != RecoveryStepState.done);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: OpsColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: OpsColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome, size: 18, color: OpsColors.blue),
              const SizedBox(width: 8),
              Text('Recovery Plan',
                  style: AppFonts.display(size: 15, weight: FontWeight.w600)),
              const Spacer(),
              Text('${plan.completedSteps}/${plan.steps.length}',
                  style: AppFonts.body(size: 12, color: OpsColors.muted)),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _PlanChip(
                  icon: Icons.local_shipping_outlined,
                  label: plan.destination),
              const SizedBox(width: 8),
              _PlanChip(
                  icon: Icons.eco_outlined,
                  label: _pathLabel(plan.bestPath)),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: plan.progress,
              minHeight: 6,
              backgroundColor: OpsColors.border,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(OpsColors.blue),
            ),
          ),
          const SizedBox(height: 14),
          for (var i = 0; i < plan.steps.length; i++)
            _PlanStepRow(step: plan.steps[i]),
          if (nextIndex != -1) ...[
            const SizedBox(height: 6),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => state.advancePlanStep(batchId, nextIndex),
                style: OutlinedButton.styleFrom(
                  foregroundColor: OpsColors.ink,
                  side: const BorderSide(color: OpsColors.border),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.task_alt, size: 16),
                label: Text('Mark "${plan.steps[nextIndex].title}" done',
                    style: AppFonts.body(size: 12, weight: FontWeight.w600)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _pathLabel(String path) {
    final p = path.toLowerCase();
    if (p.contains('reuse')) return 'Reuse';
    if (p.contains('donate')) return 'Donate';
    if (p.contains('recycle')) return 'Recycle';
    return path;
  }
}

class _PlanChip extends StatelessWidget {
  const _PlanChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: OpsColors.softBlue,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: OpsColors.blue),
          const SizedBox(width: 5),
          Text(label,
              style: AppFonts.body(
                  size: 11, weight: FontWeight.w600, color: OpsColors.blue)),
        ],
      ),
    );
  }
}

class _PlanStepRow extends StatelessWidget {
  const _PlanStepRow({required this.step});
  final RecoveryPlanStep step;

  @override
  Widget build(BuildContext context) {
    Widget marker;
    switch (step.state) {
      case RecoveryStepState.done:
        marker = Container(
          width: 22,
          height: 22,
          decoration: const BoxDecoration(
              color: OpsColors.blue, shape: BoxShape.circle),
          child: const Icon(Icons.check, size: 14, color: Colors.white),
        );
      case RecoveryStepState.active:
        marker = Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: OpsColors.blue, width: 2.5),
          ),
        );
      case RecoveryStepState.pending:
        marker = Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: OpsColors.border, width: 2),
          ),
        );
    }
    final subColor = step.state == RecoveryStepState.active
        ? OpsColors.blue
        : OpsColors.muted;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          marker,
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(step.title,
                    style: AppFonts.body(size: 14, weight: FontWeight.w600)),
                Text(step.detail,
                    style: AppFonts.body(size: 12, color: subColor)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RouteCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: OpsColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: OpsColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Route to Partner Group',
              style: AppFonts.display(size: 15, weight: FontWeight.w600)),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(
                width: 96,
                child: MiniRouteMap(
                    start: 'Zone C', end: 'Partner'),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.place_rounded,
                            size: 15, color: OpsColors.ink),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text('Partner Group – Atlanta',
                              style: AppFonts.body(
                                  size: 13, weight: FontWeight.w600)),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 21, top: 2),
                      child: Text('12.4 mi · 18 min',
                          style: AppFonts.body(
                              size: 12, color: OpsColors.muted)),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.schedule,
                            size: 15, color: OpsColors.ink),
                        const SizedBox(width: 6),
                        Text('Est. arrival',
                            style: AppFonts.body(
                                size: 13, weight: FontWeight.w600)),
                        const SizedBox(width: 6),
                        Text('9:36 AM',
                            style: AppFonts.body(
                                size: 12, color: OpsColors.muted)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        foregroundColor: OpsColors.ink,
                        side: const BorderSide(color: OpsColors.border),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.open_in_new, size: 15),
                      label: Text('Open Map',
                          style: AppFonts.body(
                              size: 12, weight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProofCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Proof of Recovery',
                style: AppFonts.display(size: 15, weight: FontWeight.w600)),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
              decoration: BoxDecoration(
                color: OpsColors.softBlue,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text('Required',
                  style: AppFonts.body(
                      size: 11,
                      weight: FontWeight.w600,
                      color: OpsColors.blue)),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: OpsColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: OpsColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: OpsColors.softGreen,
                  borderRadius: BorderRadius.circular(10),
                ),
                child:
                    const Icon(Icons.camera_alt_outlined, color: OpsColors.green),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Add photo of recovered VB-104 banners',
                        style: AppFonts.body(
                            size: 13, weight: FontWeight.w600)),
                    Text('Take a clear photo for verification',
                        style: AppFonts.body(
                            size: 12, color: OpsColors.muted)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  width: 44,
                  height: 44,
                  color: OpsColors.border,
                  child: const Icon(Icons.image_outlined,
                      color: OpsColors.muted, size: 20),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ActionBar extends StatelessWidget {
  const _ActionBar({required this.taskId, required this.complete});
  final String taskId;
  final bool complete;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: OpsColors.bg,
        border: Border(top: BorderSide(color: OpsColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    foregroundColor: OpsColors.ink,
                    backgroundColor: OpsColors.surface,
                    side: const BorderSide(color: OpsColors.border),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.inventory_2_outlined, size: 18),
                  label: Text('Mark Picked Up',
                      style: AppFonts.body(
                          size: 13, weight: FontWeight.w600)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton.icon(
                  onPressed: () {
                    context.read<AppState>().completeTask(taskId);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content:
                            Text('Task complete. Chain of custody updated.'),
                        backgroundColor: OpsColors.navy,
                      ),
                    );
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: OpsColors.navy,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: Icon(
                      complete ? Icons.check_circle : Icons.check_circle_outline,
                      size: 18),
                  label: Text(complete ? 'Completed' : 'Complete Task',
                      style: AppFonts.body(
                          size: 13,
                          weight: FontWeight.w600,
                          color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
