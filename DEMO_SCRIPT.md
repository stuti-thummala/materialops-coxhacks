# MaterialOps — Demo Script, Tech Stack & Architecture

> One stop shop for organizing disposal & recovery logistics for massive events.
> Value order you are selling: **scale → grouping → sustainability + cost → ROI → (proof via passports).**
>
> **The one-liner:** *Every ton we group instead of dump is a ton that doesn't go to landfill and a haul the venue doesn't pay for. Sustainability and cost cutting are the same line item — we move it.*

---

## Tech Stack (this part is REAL — say it straight)

**Frontend — Web Command Center**
- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for the ops design system
- **Zustand** for live client state (the field-intake/grouping store)
- **Mapbox GL JS** for the 3D stadium command center; **Google Street View** embed for on-site field views
- **qrcode.react** for shareable passport QR codes
- **Web Crypto (ECDSA P-256 / SHA-256)** for signing & verifying material passports

**Mobile — Field Worker App**
- **Flutter / Dart** (iOS + Android from one codebase)
- **camera** plugin for live capture
- **TFLite (tflite_flutter)** for on-device material classification (runs offline; mock mode when no model is shipped)
- **go_router** for navigation, **provider** for state
- **path_provider** for local passport persistence

**Real-time bridge (phone → web)**
- Lightweight **pub/sub relay** so the phone and the web command center sync over outbound HTTPS only (no inbound firewall holes). Topic-based; the web polls, the phone publishes on each confirmed recovery.

**Backend / Data Platform** — see below.

---

## Backend Software (the real architecture)

The backend is plain, real, and easy to defend — no invented product name.

- **API layer** — Node running on **Next.js API routes** (the `/api/*` handlers). Ingests every field capture, owns batches, dispatch, and reporting.
- **Classification** — on-device **TFLite** model on the phone does the live material classification; the server stores the result and can re-run inference for audit.
- **Grouping** — the **grouping logic** keys every item on **material × location/zone × return destination** and folds matches into a single recoverable batch.
- **Dispatch** — ranking + partner-matching (value, priority, destination → the right recovery partner).
- **Passports / chain-of-custody** — each passport is signed with **Web Crypto (ECDSA P-256)** and publicly verifiable.
- **Reporting** — the ROI/impact aggregation (tons diverted, dollars recovered, CO₂e/water/energy avoided, per-sponsor attribution).

**Data layer:** PostgreSQL (operational data), object storage (capture photos), and a lightweight **pub/sub channel** so the phone and the command center stay in sync in real time. In the current demo build, state lives in the **Zustand store** with the phone→web relay; the production target is the Postgres-backed API above.

> If asked "what's the backend?": *"Node on Next.js API routes, Postgres, object storage for photos, and a pub/sub channel keeping the phone and command center in sync."* Real answer, no hand-waving.

---

## Why this is huge: sustainability + cost cutting (memorize this — it's the pitch)

These are not two benefits. They are **the same mechanism**: grouping material into routable batches at the source.

**Sustainability**
- Every grouped batch is a **diversion from landfill** — measured in tons, not vibes.
- On-device + server classification captures **CO₂e, water, and energy avoided** for each batch, so the venue can prove it hit zero-waste targets.
- Forecasting pre-positions crews, so material is recovered **before it's contaminated** (a wet, mixed pile is landfill; a clean grouped batch is a recyclable/reusable asset).
- Reuse beats recycle: passports keep high-value items (banners, cups, lanyards) **in circulation** instead of shredded.

**Cost cutting (same actions, the money side)**
- **Hauling is priced by the ton to landfill.** Every ton we divert is a tipping fee the venue never pays.
- Grouping turns scattered trash into **sellable commodity loads** — recovered material becomes revenue, not a disposal line.
- Dispatch ranks by value and matches partners automatically, so **trucks run full and high-value loads move first** — fewer trips, lower labor, no idle crews.
- Forecasting kills the two biggest event-ops costs: **overstaffing and emergency cleanup.** You staff to the predicted load, not the worst case.
- The ROI report turns all of this into a **per-event, per-sponsor dollar figure** — the number that re-books the contract.

**The closer:** *Landfill is the most expensive and least sustainable option on the table. MaterialOps makes the cheap thing and the green thing the exact same thing.*

---

## THE SCRIPT (read aloud — **bold = stage direction**, plain = spoken)

**[Don't open anything yet. Look at them.]**

"When you run a 70,000-person event, waste isn't a recycling problem. It's a logistics problem at massive scale. Hundreds of tons, dozens of material types, crews, trucks, partners, all on a deadline. Today that's run on radios, spreadsheets, and guesswork — and almost all of it ends up in a landfill the venue pays by the ton to fill.

MaterialOps flips that. It sees every material the moment it's spotted, groups it into recoverable batches automatically, routes it to the right partner, and hands the venue a dollar-and-carbon ROI report at the end. Here's the part that matters: the green move and the cheap move are the same move. Every ton we divert is a ton out of landfill *and* a haul they never pay for. One stop shop for event recovery at scale."

---

### 1. Command Center — mission control
**[Open `/command`.]**

"This is mission control for the entire venue. Every glowing line is material in motion — spotted, grouped, and routed live.

Before doors even open, we forecast how much waste each zone will produce, from attendance, event type, and weather, so crews are pre-positioned instead of reacting. As recovery happens, we tally the carbon avoided in real time.

The 3D view isn't decoration. At this scale, the value is one screen that replaces ten radios and a whiteboard. It's the difference between running the event and chasing it."

---

### 2. Grouping — the engine
**[Go to `/dashboard`. Have a capture ready to land.]**

"Here's the engine that makes the whole thing work: grouping.

A stadium doesn't produce 'one banner.' It produces thousands of scattered items, and recovery only pays off when the right things are batched together. The system groups on three things: what the material is, where it was picked up, and where it's supposed to be returned. Same material, same location, same destination — that's one batch.

Watch.

**[Show the field capture landing. Point at Live Field Intake + Live Ops Signals flipping to 'Updated just now.']**

A scan just came in from the field. The system didn't log four loose items. It matched them by material, by zone, and by return destination, and rolled them into one recoverable batch — classified, weighed, valued, and stamped with a passport.

That batching is what turns trash into a sellable, routable asset. A clean grouped batch is recyclable or reusable revenue; the same items left scattered get contaminated and go to landfill at a cost. Multiply it across a full stadium, and grouping is the entire difference between a disposal bill and a recovery payout — and between filling a landfill and proving zero-waste."

---

### 3. Dispatch & Partners — the logistics brain
**[Go to `/dispatch`.]**

"Once material is grouped, it has to move. The dispatch board ranks every ready batch by value, priority, and destination, and matches it to the right recovery partner automatically. The highest-value loads go first, and nothing sits.

**[Point at the new Biltmore field batch slotted into the ranked list.]**

That brand-new source I just scanned in the field already shows up here, scored and slotted. Nobody had to phone it in."

---

### 4. ROI Reports — the business case
**[Go to `/reports`, then `/sponsors`.]**

"And this is what gets the operator re-hired. At the end, the venue and its sponsors don't want a vibe. They want numbers.

MaterialOps generates the ROI report automatically: tons diverted, dollars recovered, carbon avoided, water and energy saved, and it attributes the impact per sponsor brand.

Every diverted ton on this report is two wins on one line: tipping fees the venue never paid, and landfill they never filled. Sustainability and cost cutting print as the same number. This is the artifact that justifies the contract — it proves the event hit its zero-waste targets, and it gives every sponsor a branded, printable sustainability result. That's what gets the operator re-booked and the sponsors paying again."

---

### 5. Mobile App — where the data is born
**[Pick up the phone. Screen 1 — Home.]**

"Now here's where the data is born — the field side.

This is the worker's view: their greeting, today's progress, and their assigned recovery tasks — recover the vinyl banners, move the reusable cups — each with its zone, ETA, and impact. Their whole shift, prioritized for them."

**[Tap to Tasks — Screen 2.]**

"The full task list and live status: what's ready, what's in progress, what's done."

**[Tap to Scan & Group — Screen 3. Point the camera at the Biltmore material.]**

"And this is the money screen. The worker points the camera at the material, and on-device AI classifies it instantly. The app immediately tells them which batch it belongs to and why — same material, same location, same return destination. If any of those don't match an open batch, it suggests starting a new one.

Grouping happens right here, at the source, in their hand.

**[Tap Capture & Classify, then Review & confirm → save.]**

I'll scan this recovery at the Biltmore Innovation Center… confirm… and it's saved and sent straight to the command center."

**[Tap to Map — Screen 4.]**

"The worker gets the same live venue picture — zones, pins, 'scan here' — so they're routed efficiently too."

---

### 6. Passport — the proof layer (NOT the pitch)
**[Open the passport for that scan — `/passport/[id]`.]**

"Remember that scan I just did on the phone? It already produced this — a signed material passport. Cryptographically verifiable, QR-shareable, with full chain of custody from the moment it was spotted to its final destination.

This is why the ROI numbers can't be hand-waved. Every dollar and every kilo of carbon traces back to a verifiable passport. That's the difference between a sustainability claim and a sustainability receipt."

---

### Closing
**[Look up from the screen.]**

"So that's MaterialOps. One platform: forecast the load, group the materials, dispatch the logistics, and hand over an ROI report the venue and its sponsors can take to the bank — every number backed by a verifiable passport.

Landfill is the most expensive and least sustainable option on the table. We make the cheap thing and the green thing the exact same thing. One stop shop for running event recovery at scale."

---

## Cheat-sheet (route order)

1. **Problem + scale** — no screen. *Landfill is paid by the ton; today it's run on guesswork.*
2. **`/command`** — situational awareness; justify 3D = one screen replaces ten radios.
3. **`/dashboard`** — **GROUPING** (material × location × destination). Spend time here. *Grouping = the cheap thing and the green thing are the same thing.*
4. **`/dispatch`** — ranks + routes batches to partners; trucks run full, high-value first.
5. **`/reports` + `/sponsors`** — **ROI** in $, tons, CO₂e, per-sponsor. *Every diverted ton = tipping fee saved + landfill avoided.*
6. **Phone:** Home → Tasks → Scan (Biltmore capture) → Map.
7. **`/passport/[id]`** — proof layer backing the ROI. Close.

**The two-sentence close:** *Landfill is the most expensive and least sustainable option on the table. MaterialOps makes the cheap thing and the green thing the exact same thing.*

**Tech stack (real):** Next.js/React/TS, Tailwind, Zustand, Mapbox GL, Web Crypto passports · Flutter/Dart + on-device TFLite · pub/sub relay.
**Backend (real):** Node on Next.js API routes · Postgres · object storage for photos · pub/sub sync. *(Grouping keys on material × location × destination.)*
