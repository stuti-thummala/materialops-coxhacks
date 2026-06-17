import '../models/models.dart';

/// Static seed data mirroring the web app's mock tasks so the worker app is
/// fully demoable offline.
class MockData {
  MockData._();

  static const List<WorkerTask> tasks = [
    WorkerTask(
      id: 'T-24781',
      title: 'Recover VB-104 Vinyl Banners',
      priority: Priority.high,
      fromZone: 'Stadium Bowl',
      toZone: 'Parking / Logistics',
      batchId: 'VB-104',
      eta: '2:45 PM',
      weight: '320 lbs',
      distanceMiles: 1.2,
      items: 12,
      materialType: 'Reusable',
      cta: 'Start Task',
    ),
    WorkerTask(
      id: 'T-24782',
      title: 'Move CU-091 Reusable Cups',
      priority: Priority.medium,
      fromZone: 'Home Depot Backyard',
      toZone: 'CupCycle ATL',
      batchId: 'CU-091',
      eta: '3:15 PM',
      weight: '285 lbs',
      distanceMiles: 2.1,
      items: 2450,
      materialType: 'Reusable',
    ),
    WorkerTask(
      id: 'T-24783',
      title: 'Verify CT-033 Carpet Tiles',
      priority: Priority.low,
      fromZone: 'Fan Plaza',
      toZone: 'Interface Flooring',
      batchId: 'CT-033',
      eta: '3:30 PM',
      weight: '2,480 lbs',
      distanceMiles: 3.4,
      items: 1860,
      materialType: 'Recyclable',
    ),
  ];

  static WorkerTask? taskById(String id) {
    for (final t in tasks) {
      if (t.id == id) return t;
    }
    return null;
  }

  /// Task steps shown on the task detail screen.
  static const List<String> taskSteps = [
    'Check in at Stadium Bowl',
    'Locate and Recover Batch VB-104',
    'Transport to Reuse Destination',
    'Check in & Complete',
  ];
}
