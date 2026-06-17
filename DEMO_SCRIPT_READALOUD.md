MaterialOps — Demo Script

Read the plain text out loud. Lines in [brackets] are cues for you, not spoken.


VALUE PROPOSITION (say first)

MaterialOps is one platform to run waste recovery for large events. It forecasts how much waste each zone will produce, classifies every material the moment a worker scans it, groups scattered items into recoverable batches, routes each batch to the right partner, and produces a verified dollar-and-carbon report at the end.

The core idea: keeping material out of the landfill is the cheapest option and the most sustainable option at the same time. Every ton diverted is a haul the venue doesn't pay for and a ton that isn't buried. Sustainability and cost savings are the same number.


1. MOBILE APP — WHERE DATA IS BORN
[Pick up the phone. Screen 1 — Home.]

Recovery starts in the field, in the worker's hand.

- Home: worker greeting, today's progress, and assigned recovery tasks, each with zone, ETA, and impact.

[Tap to Tasks — Screen 2.]

- Tasks: full task list with live status — ready, in progress, done.

[Tap to Scan — Screen 3. Point the camera at the Biltmore material.]

- Scan: the worker points the camera at the material and on-device AI classifies it instantly, offline. The app immediately shows which batch it belongs to and why — same material, same location, same destination. If it doesn't match an open batch, it suggests starting a new one. Grouping happens at the source.

[Tap Capture and Classify, then Review and confirm, then save.]

I'll scan this recovery at the Biltmore Innovation Center, confirm, and it's sent straight to the command center.

[Tap to Map — Screen 4.]

- Map: the same live venue map — zones, pins, scan-here points — so workers are routed efficiently.


2. DASHBOARD — GROUPING ENGINE
[Go to /dashboard. The scan you just took lands here.]

That scan from the phone arrives here in real time. This is the core feature: grouping.

A stadium produces thousands of scattered items. Recovery only pays off when the right items are batched together. The system groups on three keys: material type, pickup location, and return destination. Items matching all three become one batch.

[Point at Live Field Intake and Live Ops Signals updating to "Updated just now."]

- Live Field Intake: the capture I just made appears here. The items were matched by material, zone, and destination and rolled into one batch — classified, weighed, valued, and assigned a passport.
- Live Ops Signals: the activity feed updates in real time as captures land.
- Zone map: each of the venue's zones shows its live recovery status.
- Next Best Action: an AI recommendation for the highest-impact next move.

A grouped batch is recyclable or reusable revenue. The same items left loose get contaminated and go to landfill at a cost. Grouping is the difference between a disposal bill and a recovery payout.


3. COMMAND CENTER
[Open /command.]

Zoom out to the whole venue, rendered in 3D.

- Forecasting: before the event starts, it predicts waste volume per zone from attendance, event type, and weather, so crews are pre-positioned. This cuts overstaffing and emergency cleanup, the two largest variable costs.
- Live tracking: every material being spotted, grouped, and routed is shown in real time — including the batch I just scanned.
- Carbon counter: CO2e avoided is tallied live as recovery happens.

One screen replaces radios and spreadsheets for venue-wide coordination.


4. DISPATCH
[Go to /dispatch.]

Once material is grouped, it has to move. The dispatch board ranks every ready batch and routes it.

- Ranking: each batch is scored by value, priority, and destination. Highest-value loads go first.
- Partner matching: each batch is matched automatically to the correct recovery partner for that material and destination.
- Live intake: the batch just scanned in the field already appears here, scored and slotted, with no manual entry.

Result: full trucks, fewer trips, less labor, no idle crews.


5. REPORTS AND SPONSORS
[Go to /reports, then /sponsors.]

This is the output that justifies the contract. It is generated automatically.

- Reports: tons diverted, dollars recovered, carbon avoided, water saved, energy saved.
- Sponsor attribution: impact is broken out per sponsor brand, as a branded, printable sustainability result.
- Verification: every figure traces back to a signed passport, so the numbers are auditable, not estimated.

Each diverted ton on this report is both tipping fees the venue avoided and landfill they didn't fill. This is what gets the operator re-hired and sponsors paying again.


6. PASSPORT
[Open the passport for that scan — /passport/[id].]

The scan I made on the phone produced a material passport.

- Signed and cryptographically verifiable.
- QR-shareable.
- Full chain of custody, from the moment it was spotted to its final destination.

This is the proof layer. Every dollar and every kilogram of carbon in the report traces back to one of these. That is the difference between a sustainability claim and a verifiable record.


CLOSING
[Look up.]

MaterialOps: forecast the load, classify and group the materials, dispatch the logistics, and deliver a verified ROI report — every number backed by a passport. Landfill is the most expensive and least sustainable option. We make the cheap option and the green option the same option.


TECH STACK
[If asked.]

Frontend: Next.js, React, TypeScript, Tailwind, Mapbox GL for the 3D view, Zustand for live state.
Mobile: Flutter with an on-device TensorFlow Lite model for classification, so it works offline.
Backend: Node on Next.js API routes, Postgres with Prisma, Supabase for auth and photo storage, pub/sub for real-time sync between phone and command center.
Trust: material passports signed with the Web Crypto API. Deployed on Vercel.
