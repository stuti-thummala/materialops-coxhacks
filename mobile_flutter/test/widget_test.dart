// Basic smoke test for the MaterialOps worker app.

import 'package:flutter_test/flutter_test.dart';

import 'package:materialops_worker/main.dart';

void main() {
  testWidgets('App builds without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialOpsApp());
    await tester.pump();

    expect(find.byType(MaterialOpsApp), findsOneWidget);
  });
}
