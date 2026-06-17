# MaterialOps — Product Overview

**Recovery Command Center for live-event material recovery.**
Built for Mercedes-Benz Stadium (Atlanta) during the FIFA World Cup 2026™, MaterialOps turns post-event cleanup into a measurable, auditable, sponsor-reportable sustainability operation.

The product is two connected apps sharing one domain model:

| App | Platform | Who uses it | What it's for |
|-----|----------|-------------|---------------|
| **Command Center (Web)** | Next.js 14 / React | Ops managers, sustainability leads, sponsors | Plan, dispatch, track, and report on material recovery across the venue |
| **Worker App (Mobile)** | Flutter (iOS/Android/Web) | Field crews | Scan materials on-device, group into batches, run task checklists, navigate zones |

---

## What the product does (in one paragraph)

Before an event, MaterialOps **forecasts** how much recoverable material each zone will generate. During and after the event, field workers **scan** items with their phone camera — on-device computer vision identifies the material, condition, and best recovery path, then **groups** items into batches. Ops managers **dispatch** crews and partner haulers against those batches, while every hand-off is recorded as a cryptographically **signed material passport**. The platform continuously calculates **environmental impact** (CO₂e avoided, water/energy saved, landfill diversion) using EPA WARM factors, and rolls it up into **sponsor ESG reports** and exportable post-event documentation.

---

# Part 1 — Web Command Center

A premium dark-themed operations dashboard. 17 routes, Zustand global state, deterministic offline AI agents.

## Core workflows

### Live operations
- **Dashboard** (`/dashboard`) — "Stadium Recovery Command": an interactive 8-zone live map, live ops signals panel, **Live Field Intake** (photos stream in from the mobile app in real time), a **Next Best Action** AI recommendation, and the active recovery board.
- **Command Center** (`/command`) — full-screen cinematic "live recovery command" with a CRT/terminal aesthetic, a 3D Mapbox stadium, an agent roster (SCOUT · vision, ROUTER · path optimization, DISPATCH · crew handoff), an animated live CO₂e counter, and a rotating venue-sustainability-facts carousel.

### Material batches
- **Batches** (`/batches`) — card grid of every material batch with items count, weight, value ($), recovery path, status pill, and source zone.
- **Batch detail** (`/batches/[id]`) — the full record for one batch:
  - **Material passport** (signed, auditable) with a grouped line-item table (e.g., "ATL banner 12× · 48 lbs", "Heineken banner 28× · 112 lbs")
  - **Chain-of-custody** progress: Collected → Transport → Received by Partner → Processed → Documentation
  - **Agent decisions** panel (5 AI agents with confidence scores) + a **reasoning trace** DAG
  - Actions: **Assign Crew**, **Public Passport** (`/passport/[id]`), **Auto-Dispatch** modal (human-in-the-loop approval)

### Dispatch & crews
- **Dispatch Center** (`/dispatch`) — select ready batches (multi-select) + crews, the right-hand plan panel auto-totals selected value and capacity, then **Dispatch** sends tasks to crews' phones ("Crews dispatched. Mobile tasks sent.").
- **Crews** (`/crews`) — every recovery crew with lead, status (available/assigned/in-progress/offline), current zone, capacity (lbs), and active task count.

### Zones & forecasting
- **Recovery Zones** (`/zones`) — interactive stadium map + per-zone cards (batch count, item count, estimated value). Six zones: Stadium Bowl, GWCC/Convention Campus, Centennial Olympic Park/Fan Plaza, State Farm Arena District, Home Depot Backyard, Parking/Logistics.
- **Pre-Event Forecast** (`/forecast`) — predict recoverable tonnage before kickoff. Adjustable **Event Type** (FIFA Match / Doubleheader / Concert / Convention), **Attendance** (20k–75k), **Temperature** (40–100°F), and **Rain %** sliders feed a deterministic model that outputs projected tons, diversion rate, crews to pre-stage, hotspot zone, peak window, and per-zone material breakdowns.

### Impact & reporting
- **Impact Report** (`/impact`) — headline KPIs (landfill diversion %, CO₂e avoided, total tons recovered, 100% chain-of-custody), a materials-by-category donut, verified partner destinations, and an environmental-equivalents grid (trees preserved, gallons of water saved, kWh saved).
- **Sponsor Impact** (`/sponsors`) — per-brand ESG / Scope-3 reporting. Pick a sponsor (Coca-Cola, adidas, Heineken, Bud Light, Mercedes-Benz Stadium); items are attributed by name matching; outputs branded items recovered, % diverted, CO₂e avoided, car-miles offset, a passport-backed line-item table, and a **Generate report (PDF)**.
- **Reports** (`/reports`) — export hub for Post-Event Impact, Crew Performance, Batch Recovery Log, and Partner Allocation reports (View + Export to PDF).
- **Partners** (`/partners`) — directory of verified recycler/reuse/logistics partners (ReUse Hub ATL, CupCycle ATL, Atlanta Recycling, Interface Flooring) with status and allocated material.

### Provenance & field capture
- **Public Passport** (`/passport/[id]`) — shareable, QR-coded, offline-verifiable signed record for sponsors/auditors.
- **Field capture pipeline** — mobile photo + GPS reports flow into the dashboard's Live Field Intake, drop a pin (with Street View) at the reporter's coordinates, and auto-generate a disposal/routing plan.

### Settings
- **Settings** (`/settings`) — toggles for Push Notifications, Live Map Updates, Crew Location Tracking, Dark Operations Theme, plus **Replay Onboarding**.

## The 5-agent decision engine

Each batch is evaluated by five deterministic, offline agents that vote on the best recovery path, then run as a DAG (not in isolation):

```
material ──┬──▶ reuse ───┐
           ├──▶ repair ──┼──▶ logistics ──▶ decision
           └──▶ donation ┘
```

1. **Material Agent** — classifies material type & proposes the primary path.
2. **Reuse Agent** — flags direct reuse when reuse score ≥ 0.55.
3. **Repair Agent** — flags when light refurbishment unlocks reuse.
4. **Logistics Agent** — gates feasibility (crew assigned? drop-off window?).
5. **Donation Agent** — surfaces donation opportunities for high-value reusables.

Output is an `AgentDecision` (summary, suggested path, confidence, signals, recommendations). The **Auto-Dispatch planner** then turns the winning decision into a concrete action plan: a pre-drafted **partner email**, booked **pickup window**, **crew** assignment, **route**, and an issued **signed passport** — surfaced for human approval.

## Built-in AI assistant
A streaming, offline, tool-using chat assistant (with voice via Web Speech API) is available on Batches, Partners, Crews, Impact, Reports, and Sponsors. It can answer questions like "What just came in from the field?" by calling local tools (field reports, batch lookups, impact math).

---

# Part 2 — Mobile Worker App

A field app for crews doing the actual recovery. Five tabs with an elevated central **Scan** button; tab switches are instant.

| Tab | Route | Purpose |
|-----|-------|---------|
| **Home** | `/` | Daily greeting, progress donut, assigned tasks, impact summary |
| **Tasks** | `/tasks` | Full task queue with status filters and quick-start |
| **Scan** | `/scan` | On-device material scanning + batch grouping (core feature) |
| **Map** | `/map` | Interactive recovery-zones stadium map |
| **More** | `/more` | Hub for assistant, impact, profile, settings |
| _Task detail_ | `/progress/:id` | Step-by-step task checklist + proof capture |

## Screen-by-screen

### Home (`/`)
Personalized greeting ("Good morning, Alex!"), a **Today's Progress** donut, assigned-task cards (batch code, material, zone, impact level, status, ETA, CTA like "Start Task"/"Resume"), and an **impact summary** card. Header shows the venue, "FIFA World Cup 2026™ Atlanta", and a live "Post-Event Cleanup" status.

### Tasks (`/tasks`)
Status **filter pills** (All / Ready / In Progress / Pending / Completed), **summary chips** (Ready · 4, In Progress · 3, Overdue · 1, Completed · 7), and task rows showing batch code, material, zone, destination partner, weight/quantity, status, and a Start/Resume/Review action.

### Scan & Group (`/scan`) — the core feature
- **Live camera preview** with colored bounding boxes over detected items (green = reuse/recycle, purple = high-value reuse), a quantity badge ("~120 cups"), and a confidence badge.
- **Capture & classify** button — runs on-device inference (or, in demo mode, simulates a realistic detection).
- **Grouping suggested** alert when multiple material types are seen.
- **Result cards** per detection: detected item, material type, condition, reuse potential, recommended path, suggested batch ID, confidence %, and source (Model vs Demo).
- **Review & confirm** sheet: override the detected material, accept/enter a batch ID, add a worker note, toggle "Create a new batch", and confirm — which mints a **material passport** and increments the scan count.

### Task detail (`/progress/:id`)
Status pill + task ID, header card (title, venue), a 3-column info card (zone · destination partner · priority), a **Task Progress** card with a 5-step checklist timeline (Check in → Locate → Recover → Transport → Confirm drop-off), a recovery-plan card (destination + best path), a mini **route map**, and a **Proof of Recovery** photo-capture card.

### Recovery Zones Map (`/map`)
A custom-painted Mercedes-Benz Stadium floor plan with **tappable zone pins** color-coded by priority (red/high, amber/medium, blue/low, green/staging), each tied to a real task. Tapping a pin opens a **selected-zone detail card** with **Scan here** (→ `/scan`) and **View task** (→ `/progress/:id`) actions, plus a full zones list and a legend.

### More (`/more`)
Hub placeholder pointing to the Recovery Assistant, Impact Summary, profile, and settings.

## On-device computer vision

The classifier runs in two modes:
- **Model mode** — when `assets/models/material_classifier.tflite` is bundled, it streams camera frames (throttled ~700ms, 224×224 RGB input) through a TFLite interpreter and maps the top class to enriched material metadata.
- **Demo mode (default)** — no model required; a deterministic mock scene (reusable cups + vinyl banner) plus a "Capture" button that returns a random catalog detection with realistic 82–98% confidence.

**Recognized materials:**

| Detected item | Material type | Reuse potential | Path | Batch |
|---------------|---------------|-----------------|------|-------|
| Vinyl Banner | PVC-coated polyester | high | reuse | VB-104 |
| Reusable Cup | PP plastic | high | reuse | CU-091 |
| Lanyard | Polyester | medium | reuse | LY-072 |
| Foam-Core Sign | Foam board | low | recycle | FS-058 |
| Carpet Tile | Nylon carpet tile | medium | recycle | CT-033 |
| Cardboard | Corrugated fiber | medium | recycle | CB-110 |

## State & persistence
Provider/ChangeNotifier `AppState` tracks accepted/completed tasks, scanned **passports** (original + worker-corrected, so corrections are auditable), per-batch recovery-plan progress, and scan count. Passports persist to device storage (iOS Documents, Android app dir, Web localStorage). It also generates per-batch recovery plans and batch summaries (item counts, material types, paths, last updated).

---

# Domain model (shared concepts)

- **RecoveryZone** — a venue area (6 zones) with batch/item counts and estimated value.
- **MaterialBatch** — grouped material with weight, value, best path, destination, status (ready → staging → assigned → in-transit → collected → delivered → verified), priority, contamination & reuse scores.
- **Crew** — a field team with a lead, status, current zone, and capacity (lbs).
- **RecoveryTask** — a pickup/delivery assignment linking batches, crews, zones, ETA, distance, and impact lbs.
- **ScanResult / MaterialDetection** — a vision detection (item, material type, condition, reuse potential, recommended path, suggested batch, confidence).
- **MaterialPassport** — a signed (ECDSA P-256 over SHA-256) custody record with line items, custody timeline, and WARM impact; publicly verifiable.
- **SpotReport** — a crowd-sourced field capture (photo + GPS + AI classification + auto disposal plan).
- **Recovery paths** — reuse, recycle, upcycle, donate, compost, landfill.

## Environmental impact engine (EPA WARM)
Impact is computed from material family + weight + recovery path, yielding CO₂e avoided (metric tons & lbs), energy (MMBtu), water saved (gal), and landfill volume avoided (cu yd). Sample factors: Cardboard 3.14 / 3.89 MTCO₂e per ton (recycle/reuse), Aluminum 8.14 / 9.1, PET 1.13 / 2.18, Carpet/Nylon 1.71 / 3.02, Organics 0.42. These feed the impact report, batch passports, and sponsor rollups.

---

# Capability summary

- **Forecast** recoverable material per zone from event type, attendance, and weather.
- **Scan & classify** materials on-device with computer vision; auto-suggest condition, path, and batch.
- **Group** items into auditable batches with cryptographically signed material passports.
- **Dispatch** crews and partner haulers with auto-generated, human-approved action plans.
- **Track** every task and hand-off through a 5-stage chain of custody.
- **Measure** environmental impact (CO₂e, water, energy, diversion) with EPA WARM.
- **Report** per-sponsor ESG / Scope-3 impact and exportable post-event documentation (PDF).
- **Operate live** via a real-time dashboard, 3D command center, and crowd-sourced field intake with Street View.
- All AI (5-agent decisions, dispatch planner, chat assistant) runs **deterministically and offline**.
