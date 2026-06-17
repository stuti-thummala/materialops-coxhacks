# MaterialOps — Worker App (Flutter)

Field-operations mobile app for **post-event material recovery at
Mercedes-Benz Stadium** during FIFA World Cup 2026 Atlanta. Cleanup crews
receive recovery tasks, scan leftover materials with on-device computer vision,
and verify pickups — all in the warm-off-white + navy "ops" design system that
matches the MaterialOps desktop dashboard.

This is the Flutter port of the web worker app, with a real **computer-vision
material classifier** added.

## Screens

| Route          | Screen                    | Notes |
|----------------|---------------------------|-------|
| `/`            | Home / Worker Overview    | Greeting, today's progress donut, assigned tasks, impact summary |
| `/tasks`       | Task List                 | Filters, summary strip, priority-coded task cards |
| `/progress/:id`| Task Detail / In Progress | 5-step timeline, route card, proof-of-recovery, action bar |
| `/scan`        | **Scan & Group (CV)**     | Live camera + on-device detection, recognition results, grouping rationale |
| `/map`,`/more` | Placeholders              | On-brand stubs for Recovery Zones Map / More |

## Computer vision

The Scan & Group screen runs an **on-device TFLite image classifier** over live
camera frames (`lib/cv/material_classifier.dart`):

- Converts camera frames (YUV420 on Android, BGRA8888 on iOS) to RGB.
- Resizes to the model's input size, normalizes to `0..1`, runs the interpreter,
  applies softmax, and maps the top class to recovery guidance
  (`lib/cv/material_catalog.dart`): material type, reuse pathway, suggested batch.
- Inference is throttled (~1.4 fps) to stay responsive.

**No model bundled?** The app runs in **mock mode** automatically and shows a
realistic two-item detection scene, so the demo always works. Add a model at
`assets/models/material_classifier.tflite` (+ `labels.txt`) to enable real
inference — see [`assets/models/README.md`](assets/models/README.md).

## Getting started

> Requires the Flutter SDK (3.3+). Install: https://docs.flutter.dev/get-started/install

```bash
cd mobile_flutter

# Generate platform runners (android/ ios/ etc.) without touching lib/ or pubspec:
flutter create .

flutter pub get
flutter run
```

### Camera permissions

`flutter create .` generates the platform folders; add camera permissions:

- **iOS** — `ios/Runner/Info.plist`:
  ```xml
  <key>NSCameraUsageDescription</key>
  <string>Scan leftover event materials to group them into recovery batches.</string>
  ```
- **Android** — `android/app/src/main/AndroidManifest.xml`:
  ```xml
  <uses-permission android:name="android.permission.CAMERA" />
  ```
  and ensure `minSdkVersion` is at least `21` (`android/app/build.gradle`).

The camera gracefully degrades: on a simulator/emulator without a camera, the
scan screen shows a preview placeholder and the mock detections.

## Project layout

```
lib/
  main.dart                 App entry + providers
  router.dart               go_router routes
  theme/                    Ops palette + IBM Plex Sans / Space Grotesk fonts
  models/                   Domain models (tasks, detections)
  data/                     Mock task data
  state/                    AppState (Provider)
  cv/                       Computer-vision classifier + material catalog
  widgets/                  Shared UI (cards, pills, nav, header, route map)
  screens/                  Home, Tasks, Task detail, Scan & Group, placeholders
assets/models/              Drop-in TFLite model + labels
```

## Design system

- Background `#F4F1EA`, surface `#FFFDF7`, navy `#0D2533`, ink `#182026`.
- Accents: green `#1F9D66`, amber `#C9831A`, red `#C34A36`, blue `#2F6FDB`,
  purple `#7251B5`, with matching soft tint backgrounds.
- Body: **IBM Plex Sans**. Headings/values: **Space Grotesk** (via `google_fonts`).
