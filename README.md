# MaterialOps

Event material recovery operations platform. A Next.js operations dashboard plus
a Flutter field-worker app that turn post-event waste into traceable, recoverable
material batches.

## Repository layout

```
src/                     Next.js 14 web app (ops dashboard + mobile web views)
  app/                   Routes (dashboard, batches, crews, dispatch, impact, zones, ...)
  components/            UI, layout, dashboard, batches, assistant components
  lib/                   Mock data, types, formatters, agents, assistant logic
  store/                 Zustand store (useMaterialOpsStore)
mobile_flutter/          Flutter field-worker app (scan, tasks, recovery plans)
  lib/                   models, state (provider/AppState), screens, widgets, cv
ml/                      CV model training script (build_material_model.py)
```

## Web app

Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Recharts.

### Setup & run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (type-checked)
```

### Key features

- **Ops dashboard** — data-driven recovery board with zone filtering and
  priority/weight/value sorting; live top-strip metrics derived from batch and
  task data (recovered tonnage, reuse rate, active pickups, batch count).
- **Batch detail & material passport** — per-batch passport, grouped item
  breakdown, chain of custody, and priority reasoning, all driven by the batch
  record.
- **AI agents** (`src/lib/agents.ts`) — five deterministic agents (Material,
  Reuse, Repair, Logistics, Donation) that emit a shared `AgentDecision` schema
  (summary, suggested path, confidence, signals, recommendations). Surfaced on
  the batch detail page via `AgentDecisions`.
- **Assistant** (`src/lib/assistant.ts` + `AssistantPanel`) — a rule-based chat
  assistant available on every page that answers questions about batches, zones,
  recovery paths, crews, and overall impact using the in-app data. No external
  LLM required; works offline.

## Flutter app

The field-worker app lets crews scan material, confirm/correct AI detections,
group items into batches (creating **material passports**), and follow generated
**recovery plans**.

### Key features

- `MaterialPassport`, `MaterialBatchSummary`, `RecoveryPlan` models with JSON
  serialization.
- `AppState` (provider) persists passports to disk (`passports.json` via
  `path_provider`) and derives batch summaries and recovery plans.
- Scan screen: confirm/correct detections, assign to an existing or new batch,
  add a worker note, and view grouped batches.
- Task detail: per-batch recovery plan card with step progress.

### Setup & run

> Requires the Flutter SDK (not bundled). Install from
> https://docs.flutter.dev/get-started/install, then:

```bash
cd mobile_flutter
flutter create .          # generate platform folders (first run only)
flutter pub get
flutter analyze
flutter run
```

The app runs in **mock detection mode** until a TFLite model is present at
`mobile_flutter/assets/models/material_classifier.tflite`. See `ml/` for the
training script.

## ML / CV model

`ml/build_material_model.py` trains a MobileNetV2-based classifier (6 classes,
224×224) and exports a `.tflite` model into the Flutter assets folder. Requires
TensorFlow (`pip install tensorflow`).


