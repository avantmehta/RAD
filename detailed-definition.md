# Heartfood — Detailed Architecture Definition
**Architecture reference, owned by David (Master Architecture) — shared with the team since the schema and scoring logic are Avant's and Rohan's direct dependency.**
Companion to `team-strategy.md`. Fills in the concrete definitions behind the plan.

**Confirmed:** app name **Heartfood**, deploying to **Firebase Hosting** at [heartfood.web.app](https://heartfood.web.app), pilot dataset scoped to Greater Hartford.

---

## 1. The hybrid concept, defined

**What it is:** a single web page with a chat-style input on top and rich results below.

**The flow:**
1. User types (or taps a suggestion chip): *"I don't have a car, I'm near Park Street, I need food today"*
2. App parses three things: **where** (Park Street area), **how they travel** (no car → bus/walking), **when** (today, now-ish)
3. App filters the curated site list → ranks by **reachability** (travel time by their mode), not raw distance
4. Results render as cards: site name, type (pantry / mobile market / SNAP grocer), address, travel time by bus or on foot, today's hours, phone, and an **AI "likely open" score**
5. Tapping a card expands plain-language directions and a "call" link
6. Plain-language AI summary at top: *"3 places you can realistically reach today. The Park Street pantry is your best bet — open until 5, 12 minutes by bus."*

**Edge cases (define now, avoid demo-day surprises):**
- Nothing open now → show earliest open tomorrow + "plan ahead" framing
- Ambiguous location → ask one clarifying question, don't guess
- Missing hours data → still list the site, flagged "hours unverified," scored lower

**Tech sketch:** static single-page app (`public/index.html`, `style.css`, `app.js`, `sites.json`) deployed on **Firebase Hosting** (heartfood.web.app, site ID `heartfood` inside the `frndz28` project). Mobile-first UI — built for phone viewports first, chat-thread layout. No auth, no database — nothing that can fail at 4:55 PM.

**Front end / backend split (current division of labor):** Avant + Claude are building the front end now (`public/`) against a **local mock parser** so it works end-to-end with zero backend dependency. Rohan owns the real backend and will stitch it in when ready.

**The contract Rohan's backend must satisfy** (see `public/app.js`, function `parseInput`):
- **Endpoint:** `POST /api/parse`
- **Request body:** `{"text": "<raw user sentence>"}`
- **Response body:** `{"mode": "car" | "walk" | "transit" | "no_car" | "unknown", "location": "<free-text neighborhood/area, or null>", "when": "now" | "tomorrow"}`
- Don't call an LLM API directly from the browser (exposes the key) — route it through a **Firebase Cloud Function** (Hosting can rewrite `/api/**` to a function once it exists); still "no backend to maintain," just a stateless proxy.
- Swap-in plan: once the endpoint is live, flip `USE_MOCK_BACKEND = false` at the top of `public/app.js` — nothing else in the front end needs to change as long as the response shape matches.
- `public/sites.json` is currently mock/placeholder data (flagged in its `_meta` block) — Rohan's validated dataset drops in as a straight file replacement in the same schema (section 3 below).

---

## 2. User workflow — the journey map (David validates end-to-end; Avant builds it; Rohan's data feeds it)

**Primary persona:** Maria, Hartford resident, no car, kids home, needs food today after 3 PM. Phone-only, low patience for forms.

**Caseworker variant:** James at a Hartford nonprofit, helping 6 clients a week find food. Needs fast, trustworthy answers he can text to a client.

**Journey:**
| Step | User does | System does | Validation question |
|---|---|---|---|
| 1 | Opens page | Shows input + 2 example prompts | Would Maria know what to type? |
| 2 | Types need in own words | Parses location / transport / time; confirms back in one line | Does the confirmation read trustworthy? |
| 3 | Confirms or corrects | Ranks sites by reachability, scores open-now | Are the top 3 actually the right 3? |
| 4 | Picks a card | Shows directions, hours, phone | Could she act on this with just her phone? |
| 5 | — | Offers "text me this" style summary (even if just copyable) | Caseworker-usable? |

**Red-team script (run at the 2:30 checkpoint):** type 5 messy real-world inputs — typos, vague locations ("near downtown"), Spanish, "tomorrow morning," "I have a car." Anything that breaks or looks untrustworthy goes on the bug list.

---

## 3. Data schema (the 11 AM contract)

```json
{
  "id": "park-st-pantry-01",
  "name": "Park Street Pantry",
  "address": "123 Park St",
  "town": "Hartford",
  "type": "pantry",
  "phone": "860-555-0100",
  "hours": {
    "mon": ["09:00", "17:00"],
    "tue": ["09:00", "17:00"],
    "wed": null,
    "thu": ["09:00", "17:00"],
    "fri": ["09:00", "14:00"],
    "sat": null,
    "sun": null
  },
  "snap_accepted": false,
  "transit_notes": "CTtransit 41/47 stop at Park & Main, 2 min walk",
  "lat": 41.7578,
  "lng": -72.6734,
  "verified": "2026-09-30",
  "notes": "ID required; first-come first-served"
}
```

**Curation rules for Rohan:** ~25–40 sites, Greater Hartford (Hartford, East/West Hartford, New Britain, Manchester, Bloomfield). Every row must have name, address, town, type, and at least a phone OR hours — no row ships with neither. `null` hours = unverified, which the scoring handles honestly.

---

## 4. The "likely open now" score (the AI differentiator — David's design, reviewed with Rohan against real data)

**Inputs:** current day/time, the site's hours row, verification recency.

**Logic (v1 — explainable, judge-friendly):**
- **90–100:** open now per hours, verified recently → "Likely open"
- **60–89:** open now per hours but hours unverified or stale → "Probably open — call to confirm"
- **30–59:** hours missing entirely → "Hours unverified — call first"
- **0:** known closed today → filtered out of "today" results, shown under "tomorrow"

**The AI part:** an LLM does two jobs — (a) reconciles messy real-world hours text ("open weekdays 9–5, closed Wednesdays") into the structured schema during curation, and (b) generates the one-line plain-language rationale per result. That's the "meaningful, intentional AI use" the judges score.

---

## 5. Demo script (2 minutes, rehearsed)

- **0:00–0:20** — "Maria has no car and needs food today. Google Maps shows her pantries 8 miles away. 211 gives her a phone number. Neither tells her what she can *actually reach before closing*."
- **0:20–0:30** — Type the scenario live.
- **0:30–1:30** — Results appear: 3 reachable options ranked by bus/walk time, open-now scores, tap the top card → directions + hours + phone. Narrate *one* decision the system made ("it skipped the closer pantry — closed Wednesdays").
- **1:30–1:50** — "Distance-ranked vs. reachability-ranked — that's the difference between a list and an answer."
- **1:50–2:00** — Next step: expand towns, partner with 211/Foodshare for live hours.

**Q&A prep (2–3 min):** "Where's the data from?" (hand-curated today; Foodshare/USDA/CTtransit GTFS are the production sources) · "What about outside Hartford?" (scoped deliberately — the method scales) · "How do you keep hours fresh?" (that's the next-build item: 211 partnership + user reports).

---

## 6. Workstream task lists (concrete)

**Rohan (Data)** — done = `sites.json` with 25+ valid rows in the schema above, validated: no row missing both phone and hours.
**Avant (Front End)** — done = deployed page: chat input → parsed confirm → ranked cards + pins + directions, running on mock data by 1:00, real data by 2:30. Validate: works on a phone browser.
**David (Master Architecture)** — done = schema + scoring function defined and reviewed with Rohan by 1:00; front end ↔ data integration working end-to-end by 2:30; journey map signed off; 5-input red-team run at 2:30 with bug list; demo script rehearsed; deck ready by 4:00. Validate: would you trust this if your name were on it?

---

## 7. Checkpoint definitions

**1:00 PM — "Does it run?"** Scaffold live on screen with mock data. First 15 real rows reviewed. Story read-back (60 seconds). Kill list: anything unrealistic.
**2:30 PM — "Would a user trust it?"** Full dry run with real data, David's 5 messy inputs. Bug list only — feature freeze from here.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Data curation eats the day | Cap at 30 sites; phone-OR-hours minimum; mock data keeps build moving regardless |
| LLM API fails on stage | Pre-generate the demo scenario's outputs as fallback; live-typing is theater over a cached result if needed |
| Scope creep at 2 PM | Feature freeze at 2:30 |
| No dedicated research/narrative owner | Assign it explicitly at the 10:00 huddle so it doesn't fall through the cracks (see `team-strategy.md`) |
| Presenter undecided | Decide by 2:30; whoever presents rehearses twice, timed |
