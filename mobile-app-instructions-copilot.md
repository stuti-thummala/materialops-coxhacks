Build the MaterialOps mobile app UI for post-event material recovery at Mercedes-Benz Stadium during FIFA World Cup 2026 Atlanta.

This app is used by cleanup crews, zone leads, and recovery workers after an event. It should feel like premium field-operations software, not a generic AI assistant app. The design should be clear enough for workers moving quickly on-site, but polished enough for a hackathon demo.

IMPORTANT DESIGN DIRECTION:
- Do not use a generic white SaaS app look.
- Do not use neon dark mode.
- Do not make it look like a chatbot-first app.
- The UI should feel like stadium logistics, recovery operations, and mobile task execution.
- Use the Mercedes-Benz Stadium context throughout the app.
- The mobile app should visually match the desktop dashboard: warm off-white workspace, dark navy header/footer, calm but meaningful colors.
- Use IBM Plex Sans for body text.
- Use Space Grotesk or a similar geometric font for headings.
- Make cards clean, structured, and operational.
- Avoid huge empty spacing.
- Avoid excessive rounded cards and generic AI sparkle icons.
- Use status indicators, timelines, task states, badges, maps, and proof-of-work flows.

COLOR PALETTE:
- Background: #F4F1EA
- Surface: #FFFDF7
- Ink/Text: #182026
- Muted text: #6D747C
- Border: #D8D2C6
- Navy: #0D2533
- Deep navy: #081923
- Green: #1F9D66
- Amber: #C9831A
- Red: #C34A36
- Blue: #2F6FDB
- Purple: #7251B5
- Soft green background: #E8F6EF
- Soft amber background: #FFF1D9
- Soft red background: #FBE7E3
- Soft blue background: #E8F0FF

APP NAME:
MaterialOps

CONTEXT:
Mercedes-Benz Stadium
FIFA World Cup 2026 Atlanta
Post-Event Recovery

MAIN USER:
A cleanup crew member named Alex who receives recovery tasks from the operations dashboard.

BOTTOM NAVIGATION:
Use a persistent bottom nav with 5 items:
1. Home
2. Tasks
3. Scan
4. Map
5. More

The Scan button should be centered and slightly larger, but not flashy. It should feel like a utility action button.

GLOBAL MOBILE HEADER STYLE:
Use a dark navy top area with:
- MaterialOps logo/name
- Mercedes-Benz Stadium
- FIFA World Cup 2026 Atlanta
- Post-Event Cleanup live status with green dot
- notification bell with badge
- small worker avatar

The main content should sit inside a large rounded-top warm off-white panel, similar to field app dashboards.

Build these screens:
1. Home / Worker Overview
2. Task List
3. Task Detail / In Progress
4. Scan & Group
5. Recovery Zones Map
6. Batch Detail
7. Recovery Assistant
8. Impact Summary
Screen 1: Home / Worker Overview
Create the Home screen for a MaterialOps crew worker.

Purpose:
This screen tells the worker what they need to do today and shows their current recovery impact.

Header:
- Dark navy background.
- MaterialOps logo at top left.
- Bell icon with red badge.
- Worker avatar.
- Text:
  MaterialOps
  Mercedes-Benz Stadium
  FIFA World Cup 2026 Atlanta
  Green dot: Post-Event Cleanup

Main card:
Title: Good morning, Alex.
Subtitle: Let’s keep the stadium recovery moving.

Weather pill:
- 72°F
- Atlanta, GA
- small sun icon

Progress card:
Title: Today’s Progress
Circular progress: 68% complete
Stats:
- 7 tasks complete
- 3 in progress
- 2 remaining
- Daily goal: 12 tasks
- End of shift: 8:00 PM

Assigned tasks section:
Title: My Assigned Tasks
Show 3 task cards:
1. Recover VB-104
   Material: Vinyl Banners
   Zone C · South Plaza
   Status: Ready
   Impact: High Impact
   Est. 20 min
   Button: Start Task

2. Move RC-212
   Material: Reusable Cups
   Zone D · West Concourse
   Status: In Progress
   Impact: Medium Impact
   Est. 15 min
   Button: Resume

3. Inspect CT-415
   Material: Carpet Tiles
   Zone E · Service Area
   Status: Pending
   Impact: Low Impact
   Est. 25 min
   Button: Start Task

Impact Today card:
- 128 lbs material recovered
- 312 lbs CO2e avoided
- 24 items diverted from landfill
- 85 impact points earned

Visual notes:
- Use large readable numbers.
- Use material-specific icons.
- Do not make this look gamified or childish.
- It should feel like a serious field worker app.
Screen 2: Task List
Create the Tasks screen.

Purpose:
Workers see all assigned, queued, and completed recovery tasks.

Header:
- Title: Tasks
- Subtitle: Assigned recovery work for Mercedes-Benz Stadium
- Filter chips:
  All
  Ready
  In Progress
  Pending
  Completed
- Sort dropdown: Priority

Top summary strip:
- Ready: 4
- In Progress: 3
- Overdue: 1
- Completed: 7

Task cards:
Each task card should show:
- Batch ID
- Material type
- Zone
- Destination
- Priority
- ETA / estimated time
- Status
- Action button

Example cards:
1. VB-104 Vinyl Banners
   Zone C · South Plaza
   Destination: Atlanta Graphics Reuse
   1,842 lbs
   High Impact
   Ready
   Button: Start

2. RC-212 Reusable Cups
   Zone D · West Concourse
   Destination: LoopBack Reuse Hub
   ~320 cups
   Medium Impact
   In Progress
   Button: Resume

3. CT-415 Carpet Tiles
   Zone E · Service Area
   Destination: EcoFloor Recycling
   980 sq ft
   Pending
   Button: Review

4. FS-118 Foam-core Signs
   Zone B · East Concourse
   Destination: PolyCycle Solutions
   Needs Review
   Button: Inspect

Bottom nav:
Home, Tasks, Scan, Map, More

Visual notes:
- Make this screen dense but readable.
- Use left color bars or small badges to show priority.
- Avoid generic task app styling. Add venue/zone context.
Screen 3: Task Detail / In Progress
Create the Task Detail screen for an active task.

Title:
Task in Progress

Task:
Recover VB-104 Vinyl Banners

Context:
Mercedes-Benz Stadium
Zone C · South Plaza
Task ID: T-2487
Status: In Progress

Top task summary card:
- Icon for vinyl banner
- Batch ID: VB-104
- Material: Vinyl Banners
- Zone: Zone C, South Plaza
- Destination Partner: Atlanta Graphics Reuse
- Priority: High
- Assigned: 9:15 AM
- Estimated completion: 20 min

Progress:
- Progress bar: 3 of 5 complete
- Show current step clearly

Task checklist:
1. Check in & review task details
   Completed · 9:02 AM

2. Locate VB-104 vinyl banners
   Completed · 9:05 AM

3. Recover VB-104 vinyl banners
   In Progress

4. Transport to destination staging area
   Pending

5. Upload proof photo and complete
   Pending

Route card:
Title: Route to Destination
Show small map preview with route line.
Destination:
Atlanta Graphics Reuse
8.2 mi · Atlanta, GA
ETA: 18 min
Button: Open Map

Proof of Recovery card:
- Upload before photo
- Upload after photo
- Required badge
- Description: “Take a clear photo of recovered material for verification.”

Bottom sticky action bar:
- Button 1: Mark Picked Up
- Button 2: Complete Task

Visual notes:
- This screen must be extremely clear for someone working on-site.
- Use stepper/timeline UI.
- Use strong hierarchy.
- Do not use AI sparkle icons.
- This is operational verification, not a chat app.
Screen 4: Scan & Group
Create the Scan & Group screen.

Purpose:
Worker scans materials using camera. The app detects material types, estimates quantity, and suggests grouping into recovery batches.

Header:
- Back button
- Title: Scan & Group
- Subtitle: Scan related materials to group into a batch
- Tips button

Camera preview:
Use a large camera-like rectangular preview.
Scene:
Back-of-house area at Mercedes-Benz Stadium with reusable cups stacked in bins and vinyl banners rolled or folded nearby.
Overlay bounding boxes:
- Reusable Cups
  Quantity: ~120 cups
  Material: Polypropylene
  Condition: Good
  Suggested batch: BATCH-RCU-0524

- Vinyl Banner
  Quantity: ~1 banner
  Material: PVC / Vinyl
  Condition: Good
  Suggested batch: BATCH-VIN-0524

Include:
- Scanning status chip with green dot
- Flash button
- Maybe small location tag: Zone C210 or South Plaza Storage

Recognition Results section:
Show 2 detected material cards:
1. Reusable Cups
   Estimated Quantity: ~120 cups
   Reuse Pathway: Wash & Reuse
   Suggested Batch ID: BATCH-RCU-0524

2. Vinyl Banner
   Estimated Quantity: ~1 banner
   Reuse Pathway: Clean & Reuse
   Suggested Batch ID: BATCH-VIN-0524

Grouping Explanation card:
Title: Why this grouping was suggested
Text:
“These items were found in the same location and share the same recovery zone. Grouping streamlines tracking, transport, and reuse reporting.”

Bottom actions:
- Add to Batch
- Create New Batch

Visual notes:
- This screen should feel more unique than a standard scanner.
- Make the detection labels crisp and useful.
- Avoid making it look like a random AR filter.
- The worker should understand exactly why the items are grouped.
Screen 5: Recovery Zones Map
Create the Recovery Zones Map mobile screen.

Purpose:
Worker sees the stadium recovery zones and activity status.

Header:
MaterialOps
Post-Event Recovery
Bell with alert badge

Screen title:
Recovery Zones
Mercedes-Benz Stadium · Atlanta, Georgia

Controls:
- Live View dropdown
- Filter chips:
  All Zones
  High Activity
  Medium
  Low
  Inactive

Main map:
Large annotated map centered on Mercedes-Benz Stadium.
Use the same stadium aerial image style from the desktop dashboard.
Overlay colored recovery zones:
- North Gate: High Activity
- West Entrance: Low
- Fan Plaza: Medium
- South Gate: Low
- Concourse: Medium
- Loading Dock: High Activity

Map controls:
- Zoom in
- Zoom out
- Layers
- Recenter

Live Ops Snapshot card:
- 12 pickups in progress
- 3 tasks overdue
- 8 new batches detected
- 24 active crew

Event info card:
FIFA World Cup 2026 Atlanta
Mercedes-Benz Stadium
Button: Event Info

Visual notes:
- The stadium map should be the hero.
- Make it feel like a control surface, not Google Maps pasted into an app.
- Use labels directly on the map.
Screen 6: Batch Detail
Create a Batch Detail screen.

Purpose:
Worker or zone lead reviews a grouped material batch.

Title:
Batch VB-104

Subtitle:
Vinyl Banners · Zone C · South Plaza

Top status:
Ready for Dispatch
High Impact

Batch summary:
- Material: PVC / Vinyl
- Estimated weight: 1,842 lbs
- Quantity: 42 banners
- Condition: Good
- Contamination risk: Low
- Reuse pathway: Clean & Reuse
- Destination: Atlanta Graphics Reuse
- CO2e avoided estimate: 428 kg

Photo strip:
Show 3 small thumbnails:
- rolled vinyl banners
- stacked signage
- proof image from scan

Batch groups:
1. Large banners
   18 items
   Good condition

2. Medium banners
   16 items
   Good condition

3. Damaged edges / trim
   8 items
   Needs review

Timeline:
- Scanned
- Grouped
- Assigned
- Picked up
- Delivered
Current stage: Assigned

Recommended action:
“Dispatch Crew 3 to recover VB-104 before vendor cleanup window closes.”

Buttons:
- Dispatch Crew
- View Destination
- Add Proof Photo
- Flag Issue

Visual notes:
- This should feel like an operational material passport.
- Do not make it look like an e-commerce product detail page.
Screen 7: Recovery Assistant
Create the Recovery Assistant screen.

Purpose:
A worker or operations lead can ask grounded questions about recovery tasks, zones, batches, and partners.

IMPORTANT:
The assistant should not look like a generic ChatGPT clone.
Make it feel like an embedded field operations assistant.

Header:
Recovery Assistant
Mercedes-Benz Stadium
Green dot: Connected to live ops data

Conversation examples:
Assistant:
“Hi Alex. I’m using live recovery data from Mercedes-Benz Stadium. What do you need help with?”

User:
“What should we prioritize right now?”

Assistant:
“Focus on Zone C first. It has 18.7 tons available, high-impact materials, and 3 batches ready for dispatch.”

Show embedded priority card:
1. Zone C · South Plaza · High Impact · 18.7 tons
2. Zone A · Plaza North · Medium Impact · 12.3 tons
3. Zone D · West Concourse · Ready to Dispatch · 7.1 tons

User:
“Where should vinyl banners go?”

Assistant:
“Vinyl banners should go to Atlanta Graphics Reuse, our preferred partner for reuse and refurbishment.”

Show partner card:
Atlanta Graphics Reuse
Reuse & Refurbishment Partner
8.2 mi · Atlanta, GA
Button: Dispatch Vinyl Banners

Bottom:
Current Priorities mini cards:
- Zone C High Impact
- Zone A Medium Impact
- Zone D Ready to Dispatch

Input bar:
Ask about materials, zones, partners...
Include microphone icon and attachment icon.

Visual notes:
- Make it assistant-like, but not just chat bubbles.
- Every answer should include an actionable card.
- Use dark navy only in header/bottom, not full neon dark mode.
Screen 8: Impact Summary
Create the Impact Summary mobile screen.

Purpose:
Worker sees their personal recovery contribution and the event-wide sustainability impact.

Header:
Impact Summary
Mercedes-Benz Stadium
FIFA World Cup 2026 Atlanta

Top card:
Your Impact Today
- 128 lbs material recovered
- 312 lbs CO2e avoided
- 24 items diverted from landfill
- 85 impact points earned

Event-wide impact:
- Total material recovered: 18.7 tons
- CO2e avoided: 41.3 metric tons
- Recovery rate: 76%
- Landfill diversion: 72.4%

Breakdown chart:
Use a clean bar or donut chart:
- Reusable cups
- Vinyl banners
- Cardboard
- Carpet tiles
- Food service items
- Mixed recycling

Recovery timeline:
- Event ended
- Scan started
- Batches grouped
- Crews dispatched
- Partner pickups
- Report generated

Impact receipt card:
Title: Verified Impact Receipt
Text:
“Your completed tasks contributed to the MaterialOps event recovery ledger.”
Button:
View Receipt

Visual notes:
- Do not over-gamify.
- This is proof-backed sustainability impact.
- Make it polished, credible, and easy to understand.
Component-level instructions
Use these reusable components across the mobile app:

1. StatusChip
Props:
- label
- status: ready | inProgress | pending | highImpact | mediumImpact | lowImpact | completed | overdue

2. TaskCard
Props:
- batchId
- title
- material
- zone
- destination
- impact
- eta
- status
- actionLabel

3. ZoneLabel
Props:
- zoneName
- activityStatus
- batchCount
- crewCount
- color

4. MaterialDetectionCard
Props:
- materialName
- quantity
- materialType
- condition
- pathway
- suggestedBatch

5. TimelineStep
Props:
- label
- time
- status

6. ImpactMetric
Props:
- label
- value
- unit
- icon
- change

7. PartnerCard
Props:
- name
- type
- distance
- location
- actionLabel
Interaction instructions
Add simple interactions:
- Tapping Start Task opens Task Detail.
- Tapping Scan opens Scan & Group.
- Tapping Add to Batch shows a confirmation toast: “Added to BATCH-VIN-0524.”
- Tapping Mark Picked Up changes task progress from 3/5 to 4/5.
- Tapping Complete Task shows a modal asking for proof photo if not uploaded.
- Tapping Recovery Zones opens the map screen.
- Tapping a zone opens a bottom sheet with:
  - zone name
  - activity status
  - batches ready
  - crews assigned
  - next recommended action
- Tapping Dispatch Vinyl Banners creates a task and shows confirmation.
Anti-generic instructions
Make this mobile UI feel specific to MaterialOps and Mercedes-Benz Stadium.

Avoid:
- Generic AI app layouts
- Purple-blue gradient overload
- Overused glassmorphism
- Sparkle icons everywhere
- Huge empty white areas
- Random motivational copy
- “AI magic” language
- Generic recycling app visuals
- ChatGPT-style assistant screens

Use:
- Venue names
- Zone names
- Material batch IDs
- Recovery partner names
- Task status
- Proof photos
- Route cards
- Recovery timelines
- Material quantities
- Operational language
- Clear worker actions
Final instruction to Copilot
Generate clean React Native or responsive mobile React components for these MaterialOps screens. Prioritize