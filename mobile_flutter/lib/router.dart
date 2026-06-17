import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'screens/home_screen.dart';
import 'screens/map_screen.dart';
import 'screens/placeholder_screen.dart';
import 'screens/scan_screen.dart';
import 'screens/task_detail_screen.dart';
import 'screens/tasks_screen.dart';

/// A page with no transition animation, used for the persistent bottom-nav
/// tabs so switching tabs swaps instantly instead of sliding like slides.
NoTransitionPage<void> _tab(Widget child) => NoTransitionPage(child: child);

/// App routes for the MaterialOps worker app.
final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      pageBuilder: (context, state) => _tab(const HomeScreen()),
    ),
    GoRoute(
      path: '/tasks',
      pageBuilder: (context, state) => _tab(const TasksScreen()),
    ),
    GoRoute(
      path: '/scan',
      pageBuilder: (context, state) => _tab(const ScanScreen()),
    ),
    GoRoute(
      path: '/progress/:id',
      builder: (context, state) =>
          TaskDetailScreen(taskId: state.pathParameters['id'] ?? 'T-2487'),
    ),
    GoRoute(
      path: '/map',
      pageBuilder: (context, state) => _tab(const MapScreen()),
    ),
    GoRoute(
      path: '/more',
      pageBuilder: (context, state) => _tab(const PlaceholderScreen(
        title: 'More',
        subtitle:
            'Recovery Assistant, Impact Summary, profile, and settings live '
            'here.',
        icon: Icons.more_horiz,
        activeIndex: 4,
      )),
    ),
  ],
);
