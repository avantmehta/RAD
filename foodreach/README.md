# FoodReach CT — Greater Hartford pilot

A runnable web app with 15 hand-curated resources in Hartford, East Hartford, West Hartford, Bloomfield, Wethersfield and Newington.

## Start

Requires Node 22.13+ and npm. From this directory:

```sh
npm ci
node --env-file=../../.env.local scripts/run-framework.mjs dev
```

Open http://127.0.0.1:3000. Never commit, bundle, share, or expose an API key in browser code. On another computer or Vercel, securely configure `OPENAI_API_KEY`; the manual planner works when the AI key is absent.

## Deploy to Vercel

Import `https://github.com/avantmehta/RAD`, set the project root directory to `foodreach`, keep the detected Next.js settings, and deploy. Add `OPENAI_API_KEY` as an encrypted Vercel environment variable only if the natural-language input should be enabled.

## Implemented

- Three landmark origins, bus/walking/car selection, date, departure and return deadline.
- Total round-trip walking cap and editable pickup duration.
- Fifteen real resources with linked evidence, web-check dates, monthly recurrence, split opening windows, residency and appointment notes.
- CTtransit direct-bus journey search using calendar service dates and exceptions, board/alight restrictions, separate outbound and return journeys, and a three-minute boarding buffer.
- Alternative departure/return dates and times when no candidate fits.
- Destination map, external route-check link, call links and downloadable trip plan.
- Server-side OpenAI structured extraction; results are reviewed before searching. Graceful manual fallback.
- Read-only browser WebMCP result tool when supported.
- Consent-based current location for walking and driving. Bus trips snap to the nearest supported landmark and disclose that approximation.
- Filterable resource directory with food type, appointment, document, language, accessibility and verification information.
- Local provider-status demo; a simulated cancellation removes that resource from planner candidates on the same device.
- Printable English/Spanish resource card.

## Data and limitations

`public/data/resources.csv` is the editable research export; runtime uses `resources.json`. Regenerate both together when editing the source dataset. `origins.json` records Census address-geocoding provenance. `transit.json` contains the compact CTtransit journeys and calendar.

Web research checked September 30, 2026. None of these sites was phone-confirmed. Regular published hours are not date-specific operational confirmation. Holiday closures, food availability, appointment availability and queues remain unknown.

The direct-bus feed was downloaded from https://www.cttransit.com/sites/default/files/gtfs/googlect_transit.zip. Hartford calendar covers August 30, 2026–January 9, 2027, subject to per-service exceptions. Out-of-coverage services are rejected. Refresh the feed rather than extending dates.

Walking estimates use 1.35 × straight-line distance / 70 metres per minute. Candidate bus access stops are within 650 metres straight-line. This is NOT pedestrian street routing: bridges, barriers, crossings, gradients and accessibility may invalidate an estimate. Driving estimates use a distance factor, 24 km/h and parking allowance, not live roads/traffic. The UI calls these candidates and requires a separate route check. Bus transfers, real-time delays, wheelchair accessibility, fares and maximum carry weight are not modeled.

The origin is also the return destination. The planner is same-day only. It checks a subset of possible journeys and does not establish that no food or alternate route exists.

## Hours confidence

This version displays source quality and conflicts; it does not invent a calibrated probability of being open or stocked. MANNA has inconsistent morning cutoffs across two official pages; we use the earlier cutoff and flag the conflict. Bloomfield's published evening suspension is preserved. Missing pickup hours remain unknown. Predictive open/stocked scoring is not implemented; it requires observational data and validation.

## AI status

The created key was tested through the server-side integration. The API returned HTTP 429; inspect the visible error for quota versus rate limiting. No successful live AI extraction is claimed. Manual fields and planner remain functional. No key is embedded in the client bundle. Cloud deployment additionally needs a securely configured OPENAI_API_KEY secret; no secret has been uploaded to Sites.

## Validation

`npx tsc --noEmit` checks types. Planner checks cover real round-trip output, walking limits, monthly recurrence, expired feed dates, service exceptions, residency and alternative windows. Browser verification covers actual result rendering and deadline changes. This is a hackathon pilot, not a validated public routing service.

## Next useful work

1. Phone-confirm the first five resources, including actual intake cutoffs and appointment rules.
2. Replace approximate pedestrian legs with street routing and add transfers.
3. Resolve API quota, test extraction on ambiguous resident messages, and securely configure any hosted secret.
4. Expand to 25–40 resources only with source provenance and freshness review.
5. Pilot with residents and caseworkers; measure unsuccessful-trip avoidance and time to an actionable plan.

The interview and provider-call items are validation work for the team. They are not represented as completed research in this prototype. Full arbitrary-address transit routing, transfers and live arrivals remain next-phase features.
