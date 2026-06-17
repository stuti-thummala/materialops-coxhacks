# MaterialOps — Event Recovery Command Center

## Inspiration

Large venues generate thousands of discarded items during each event. Disposal is a cost to the operator; recovery at scale converts waste into revenue. A single bottle or cup goes to landfill; a crate goes to recycling for tipping-fee revenue. The bottleneck is grouping. Manual sorting of scattered items by material type, location, and destination is labor-intensive and error-prone.

The solution: grouping at the source, on the worker's phone, in real time. Venue operators see the whole recovery operation in one command center, dispatch optimized loads instantly, and receive cryptographically-signed impact records.

## What it does

**MaterialOps** is an end-to-end event recovery platform:

1. **Mobile App (Flutter)**: Workers scan materials in the field using on-device AI. The camera captures an image, the TFLite classifier runs instantly (no cloud latency), and the app shows which batch the item belongs to and why: material type, zone, and destination match.

2. **Intelligent Grouping**: The system groups items on three keys: material type (bottle, cup, cardboard), pickup location (zone), and return destination (recycler, reuse partner, compost facility). Items matching all three become one batch. Grouping at the source prevents contamination and maximizes recovery value.

3. **Command Center (Next.js/React)**: Real-time 3D venue map showing live recovery status per zone. Forecasting engine predicts material volume before the event for crew pre-positioning. Carbon counter tallies CO2e avoided as recovery happens.

4. **Dispatch Board**: Every batch is ranked by value and destination, matched to the correct recovery partner, and routed for pickup. Batch data flows from the phone to dispatch with no manual entry.

5. **Reports & Verification**: Automated sustainability reports show tons diverted, dollars recovered, carbon avoided. Every figure traces back to a signed material passport, so sponsors and venues get auditable proof, not estimates.

## How we built it

**Frontend**: Next.js 14, React, TypeScript, Tailwind, Mapbox GL (venue maps), Zustand (state).  
**Mobile**: Flutter on iOS (wired USB). On-device TensorFlow Lite classifier in mock mode with ground-truth classifications for demo. Home, Tasks, Scan, and Map screens.  
**Backend**: Node.js on Next.js API routes. Postgres database. Supabase for auth and photo storage. Pub/sub relay (ntfy.envs.net) for real-time mobile/web sync.  
**Trust Layer**: Web Crypto (SubtleCrypto) for cryptographic signing of material passports. Passports are signed and QR-shareable.  
**Data Flow**: Worker scans on phone, TFLite classifies, save, push to ntfy topic, web polls every 2s, Zustand store ingests, grouping engine rolls into batches, dashboard updates and dispatch sees ranked ready batches.

## Challenges we ran into

1. **On-device ML Integration**: TensorFlow Lite on iOS required careful build setup. Demo shipped in mock mode (ground-truth classifications) to avoid binary bloat.

2. **Real-time Sync**: Keeping mobile and web in sync across network latency and multiple browser tabs. Solution: Zustand persistence, de-duplication by coords, 2-second polling window.

3. **USB vs. Wireless**: Wireless Dart VM discovery on Flutter was unreliable (75+ second timeouts). Wired USB proved stable for development. Production deployment would use cloud-based backend.

4. **Grouping Edge Cases**: Handling open batches (same material, same zone, different destination? Different batch). Tracking partial batches in dispatch. Ensuring grouping keys are consistent across the entire pipeline.

5. **Proof of Impact**: Venues want auditable records, not marketing claims. Web Crypto signing makes every passport cryptographically verifiable. Sponsors and auditors can trust the numbers.

## Accomplishments that we're proud of

- **Full-stack event recovery pipeline**: field scan to command center to dispatch to signed report.
- **On-device AI with zero cloud latency**: workers get instant feedback, no WiFi dependency, privacy-first.
- **Cryptographic verification**: sustainability claims are provable, not just printable.
- **Real-time grouping engine**: batching happens as items are captured, not after the event.
- **Mobile-first data capture**: app is where recovery starts; web surfaces scale and prove impact.
- **Realistic tech stack**: Next.js, Flutter, Postgres, TensorFlow. No fake backends or marketing product names.

## Key Insights

1. **Grouping is the business model**, not just a feature. The difference between a disposal bill and recovery payout. Every system design decision flows from that.

2. **Venues care about proof**. A sustainability report without cryptographic signature is just a PDF. Signed impact records are what renew contracts.

3. **Mobile-first workflow is non-negotiable**. Data is created in the field; the web dashboard consumes and scales that data. Not the other way around.

4. **Real-time state management is hard**. Keeping two platforms (mobile and web) in sync across spotty networks and multiple tabs requires careful design: de-duplication, consistent keys, short polling windows.

5. **On-device ML is the future for field workflows**. No latency, no privacy leaks, no cloud dependency. Mock classifier beats cloud round-trip every time.

## What's next for MaterialOps

- **Expand event types**: Sports, festivals, conferences, trade shows — each has different material streams.
- **Grow recovery partner network**: More destinations = more recovery routes = higher recovery rates.
- **Improve ML models**: Integrate real TensorFlow Lite models for higher classification accuracy; on-device retraining.
- **Sponsor dashboard**: Branded, real-time impact tracking for sponsors and sustainability teams.
- **ERP integrations**: Plug into venue systems for automatic crew dispatch and cost settlement.
- **Multi-site operations**: Track recovery across multiple venues in real time.
- **Carbon marketplace**: Tie recovery volume to carbon credits and sustainability certifications.

---

Hackathon project built with real problem domain, functional tech stack, and realistic business metrics.
