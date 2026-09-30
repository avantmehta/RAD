# FoodReach CT — Human-Centered Design Brief

## The one-sentence idea

**We believe a food resource is only useful when a resident can reach it and get home within their real constraints, so we created FoodReach CT for Greater Hartford residents and caseworkers to rank food resources by complete-trip feasibility and explain what could make an impossible trip work.**

## Who it is for

### Primary user

A Greater Hartford resident who needs food assistance and must plan around a bus, walking tolerance, pantry hours, and a return deadline. The first pilot supports Hartford, East Hartford, West Hartford, Bloomfield, Wethersfield, and Newington.

### Secondary user

A caseworker, navigator, librarian, school family liaison, or 211 specialist helping someone compare options quickly.

### Audience size

Use a defensible statewide context and describe Greater Hartford as the pilot market. Feeding America's 2024 estimate reports **560,760 food-insecure Connecticut residents, or 15.3% of the state population**. Do not claim that all of them are FoodReach users. The pilot's addressable audience must be measured with local partner usage, Hartford-area food-insecurity estimates, and households without a vehicle.

### Jobs to be done

- Find a food resource that is open during the time available.
- Know whether the complete trip, including the return, fits.
- Avoid a wasted trip caused by stale hours, residency rules, or an unrealistic route.
- Understand why an option does not fit and what small change could make it work.
- Call, open directions, or save the trip plan without creating an account.

### What people do today

Residents often combine a pantry directory, individual program pages, phone calls, and a separate map or transit app. Those tools answer different pieces of the decision. A nearby pantry can still be unusable if it closes before the bus arrives, requires an appointment, or leaves no return trip.

### Pain being solved

FoodReach reduces uncertainty between “food exists nearby” and “this trip works for me today.” The emotional cost matters too: a failed trip consumes time, fare, energy, and trust.

## The user journey

| Stage | Resident action | Current pain | FoodReach opportunity |
|---|---|---|---|
| Need | Decide food is needed today | Stress and urgency | Start with plain language or four quick choices |
| Discover | Search directories and the web | Many lists, uneven hours | Show a small sourced local directory |
| Qualify | Check hours and eligibility | Rules live on separate pages | Put evidence, restrictions, and unknowns together |
| Plan | Compare bus, walking, or car | Distance is mistaken for feasibility | Calculate the complete outbound, pickup, and return window |
| Decide | Choose one place | False confidence from a “nearby” result | Rank candidates and show why each fits |
| Recover | Handle an option that does not fit | Dead end | Suggest the smallest useful change: leave earlier, return later, or try another day |
| Act | Travel or contact the provider | Service can change | Provide call-first, Google Maps, and saved-plan actions |

## What must be true

1. Pantry addresses, operating windows, appointment rules, and residency limits must be traceable to a named source.
2. The transit feed must match the service date being demonstrated.
3. The app must distinguish a published schedule from live open or stock status.
4. Every result must include the return trip and the resident's walking limit.
5. Program owners must have a practical way to report changes.
6. Residents must be able to understand the result on a phone, with large tap targets and plain language.

## The minimum successful product today

The hackathon MVP is successful when a user can select one of three Hartford landmarks, choose bus/walk/car, set a date, time window, and walking limit, then receive ranked round-trip candidates from 15 sourced Greater Hartford resources. If none fits, the product must explain why and propose at least one realistic change.

The demo should not claim arbitrary-address routing, live bus arrivals, live pantry stock, transfer routing, or confirmed opening. Those are later phases.

## Data used in the prototype

| Data | What FoodReach uses it for | Owner / source | Current limitation |
|---|---|---|---|
| Local pantry and distribution pages | Name, address, phone, published hours, restrictions, source link | Connecticut Foodshare and municipal/program websites | Web checked, not phone confirmed; hours can change |
| CTtransit static GTFS | Scheduled direct bus departures and returns | Connecticut Department of Transportation / CTtransit | Dated schedule; no live delays; direct routes only |
| U.S. Census geocoder | Coordinates for known addresses | U.S. Census Bureau | A coordinate does not prove the entrance or service location |
| Google Maps URL and embedded map | Destination context and handoff to familiar directions | Google Maps | Google calculates its own route; FoodReach ranking remains separate |
| Feeding America Map the Meal Gap 2024 | Statewide problem framing | Feeding America | Context data, not a trip-routing input |

### Good next data sources

- **USDA Food Access Research Atlas:** use census-tract income, vehicle-access, and supermarket-distance measures to prioritize outreach and future coverage. Do not use it to predict whether a pantry is open.
- **USDA SNAP Retailer Locator/data:** add SNAP-authorized grocers as a clearly labeled resource type.
- **CTtransit GTFS-Realtime:** add service alerts and live arrival context once the static planner is correct.
- **First-party provider updates:** let a pantry confirm today's hours, closure, appointment requirement, and stock category with a timestamp.

## Statistics safe to use in the pitch

Use the year and source every time:

- **2024 estimate:** 560,760 Connecticut residents were food insecure, representing **15.3%** of the population.
- **2024 estimate:** Connecticut's annual food-budget shortfall was **$423,778,000**.
- **2024 estimate:** Connecticut's average meal cost was **$3.98**.
- **Current Connecticut Foodshare homepage:** its network is described as **650+ food pantries, meal programs, and mobile distribution sites**, serving **25,260 households monthly** at mobile pantries. These homepage figures may represent a different reporting period from the latest annual report.
- **Connecticut Foodshare 2024–2025 annual report:** **493 agency partners** delivered 38M+ meals; 110+ mobile pantry sites delivered 5M+ meals and served an average **27,390 households monthly**. Use this set together because it shares a reporting period.

Do not put “8% / 71 food-desert tracts,” “59.1% have low access,” “57% below SNAP eligibility,” or demographic percentages on the final slide unless the team has the exact original table, definition, geography, and year. Feeding America's 2024 Connecticut page reports **52%**, not 57%, below the applicable SNAP threshold. Avoid mixing current estimates with 2019 USDA tract data as though they describe the same year.

## Assumptions and tests

| Rank | Critical assumption | Risk if false | Test today |
|---:|---|---|---|
| 1 | Published hours and restrictions are accurate enough to plan from | Residents make failed trips | Call five listed sites and record confirmed/changed/unknown |
| 2 | A round-trip answer is more useful than a nearest-distance list | Core value proposition is weak | Give five users both formats and ask which they would act on |
| 3 | Three landmarks are adequate for a stage demo | Users cannot relate the result to themselves | Ask each tester whether one landmark is a plausible starting point; record requested origins |
| 4 | A 20-minute pickup assumption is reasonable | Feasible trips are ranked incorrectly | Ask pantry staff for typical and high-demand visit durations |
| 5 | Direct buses cover enough MVP trips | Bus users see too few options | Compare top cases manually in Google Maps and count transfers required |
| 6 | Users understand “published hours, not guaranteed open” | Trust or safety is harmed | Ask testers to explain the result back in their own words |

### Five-minute user interview

Do not pitch first. Show the opening screen and ask:

1. “Imagine you need groceries today and have to be home by 2:00. What would you tap first?”
2. “What information would make you trust or reject this result?”
3. “Does ‘return included’ mean what you expect?”
4. “If no trip fits, which change would you consider: leaving earlier, returning later, another day, or another travel mode?”
5. “What is missing that would stop you from using this?”

Record the words the tester uses, the first tap, one confusion, and whether they would call or travel. Do not report an invented interview result.

## Confidence and risks

Confidence is high that the problem is real and that existing sources are fragmented. Confidence is moderate that the current ranking helps because the complete-trip constraint is concrete. Confidence is low on real-time opening, stock, wait duration, transfer routing, and arbitrary origins; the interface labels those gaps.

Top risks that could kill the product:

1. Stale hours or eligibility rules cause failed trips.
2. Direct-bus-only routing excludes useful trips or gives a misleading sense of coverage.
3. “Likely open” language is interpreted as live confirmation.
4. A provider has food listed but no stock when the resident arrives.
5. People who most need the service cannot access or comfortably use the digital interface.

## Definition of success

**User story:** As a Greater Hartford resident without reliable transportation, I want to see food resources that I can reach, use, and return from before my deadline, so that I do not waste a trip.

**Hackathon success:** A judge enters “I am at Union Station, taking the bus, and need to be back by 2,” sees ranked round-trip candidates with source evidence, then changes the window until no option fits and watches “What would make this work?” recover the plan. The judge can open the destination in Google Maps and inspect the underlying data.

**Top feature:** complete-trip feasibility plus the smallest-change recovery. Everything else supports that moment.

## Five-minute pitch

### 0:00–0:45 — Problem

“A directory can tell someone food exists. It cannot tell them whether they can reach it before closing and still get home. Feeding America estimates that 560,760 Connecticut residents experienced food insecurity in 2024. For a resident without a car, one wrong assumption about hours or the return bus can turn help into a failed trip.”

### 0:45–1:15 — Human opportunity

“We designed around one decision: where can I realistically get food today, using the transportation and time I actually have?”

### 1:15–3:15 — Demo

1. Start at Hartford Union Station.
2. Choose Bus, a 40-minute round-trip walking limit, and a return deadline.
3. Show ranked candidates and the complete leave/pickup/return timeline.
4. Open the source evidence and unknowns.
5. Tighten the deadline until no trip fits.
6. Use **What would make this work?** to recover the trip.
7. Open the destination in Google Maps.

### 3:15–4:05 — Data and technology

“FoodReach joins a hand-checked local resource directory with CTtransit schedule data. A deterministic planner enforces the opening window, travel, pickup, return, and walking limit. AI turns natural language into those structured constraints; it does not invent pantry facts or decide who is eligible.”

### 4:05–4:35 — Evidence of feasibility

“The pilot includes 15 sourced resources across six towns, three starting landmarks, and downloadable data. Every candidate exposes its source date and limitations.”

### 4:35–5:00 — Risks and next step

“Our biggest risk is stale operating information. The next step is to call five providers and test the flow with five residents or navigators. Then we add first-party confirmations, arbitrary origins, transfers, and real-time transit alerts.”

## Source links

- Feeding America, Map the Meal Gap 2024 — Connecticut: https://map.feedingamerica.org/county/2024/overall/connecticut
- Connecticut Foodshare homepage: https://www.ctfoodshare.org/
- Connecticut Foodshare 2024–2025 annual report: https://www.ctfoodshare.org/annual-report-2024-2025
- USDA Food Access Research Atlas: https://www.ers.usda.gov/data-products/food-access-research-atlas
- USDA Food Access Research Atlas downloads: https://www.ers.usda.gov/data-products/food-access-research-atlas/download-the-data
- CTtransit developer / GTFS page: https://www.cttransit.com/about/developers
