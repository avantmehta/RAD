# Hack for Humanity — Team Strategy
## Challenge 2: The Last Mile of Food Access

**Team RAD:** Rohan · Avant · David (team name = initials)
**Event:** Wed Sep 30, 2026 — UConn School of Business, 100 Constitution Plaza, Hartford
**Build window:** 10:30 AM–4:00 PM (5.5 hrs) · Submission 4–5 PM · Presentations 5–7 PM (5 min + 2–3 min Q&A)

---

## The strategy in one paragraph

Ruthless scoping wins one-day hackathons. We're building a **hybrid food-access finder for Greater Hartford: a web app with a conversational interface**. A resident or caseworker types "I don't have a car, I'm near Park Street, I need food today" and gets rich results — ranked option cards, a simple map, walking/transit directions, hours matched to right now, and an AI "likely open" confidence score. Chat in, rich web out: the best of both. Data is **hand-curated** (~25–40 Hartford-area sites), not scraped live. The differentiator isn't the map — it's the **transit/walking constraint** (the brief's core insight: the barrier is proximity + transit, not availability) plus the **AI open-now scoring**. One polished, demo-able slice beats a broad unfinished app.

---

## Five suggestions for meeting the challenge

1. **Scope to Greater Hartford with a hand-curated dataset.** Covering all of Connecticut in 5.5 hours means covering none of it well. 25–40 real sites around Hartford, verified hours and addresses, beats a statewide scraper that returns junk. Judges reward a working demo over ambition slides.

2. **Make the transit / no-car constraint the hero.** Anyone can Google "food pantry near me." Nobody gets "I don't have a car, it's 3 PM, where can I actually get to before closing." That constraint is the challenge brief's thesis — build the whole UX around it: car / bus / walking toggle, realistic travel, results ranked by *reachability*, not just distance.

3. **Ship the AI "likely open now" score.** The brief explicitly suggests predictive open/stocked scoring where hours data is inconsistent. It's the most original, most AI-native feature on the table and it demos beautifully ("2 of your 5 options are probably closed right now — here are the 3 I'd trust"). This is our AI-effectiveness differentiator for the judges.

4. **Demo it as a hybrid: chat in, rich web out.** A conversational input ("I'm near X, no car, need food today") feeding a web app that renders ranked cards, a map, and directions. Natural language is the brief's lead AI angle and the most compelling 2-minute stage demo; the web results make it feel like a real product, not a chatbot toy.

5. **Start the story thread at 10:30 AM, not 3 PM.** Judging weights research & evidence and presentation alongside the build. The narrative, the user persona, the "existing alternatives fall short because…" evidence, and the slide outline need to stay someone's explicit responsibility all day — not whoever's free at the end. With only 3 of us and no dedicated research lane (see below), this is the easiest thing to accidentally drop.

---

## Division of labor — three parallel workstreams

| Workstream | Owner | Plays to |
|---|---|---|
| **Front End** — build the chat input + rendered results (ranked cards, map, directions, "likely open" badges); wire it to the scoring logic; deploy; confirm it works on a phone browser | **Avant** | Front-end build |
| **Data** — curate the ~25–40 Hartford-area site dataset, validate every row against the agreed schema (no row missing both phone and hours), keep data quality honest | **Rohan** | Data validation |
| **Master Architecture** — own the system design end-to-end: the data schema, the reachability-ranking + "likely open now" scoring logic, how chat input maps to filters, the tech stack call, and the integration contract between Avant's front end and Rohan's data. Also the natural person to red-team the full pipeline and keep the demo narrative technically honest | **David** | Systems architecture, integration |

> **Note — no dedicated Research & Story lane this time.** The original 4-person version of this plan had someone owning problem evidence, competitive research, and slide narrative full-time. With 3 of us, that has to happen opportunistically: capture it together at the checkpoints below, and don't let it slide to 4:30 PM. Whoever has slack time (likely Avant once the front end is stable, or David once architecture is locked) should pick up the one-pager evidence and slide outline — decide who, explicitly, at the 10:00 huddle.

### The critical handoff: the data schema contract (agreed by 11:00 AM)
David defines the schema and the scoring logic; Rohan fills the schema with real, validated data; Avant builds the front end against the *exact* same schema using mock data from minute one. The schema is the interface — e.g. each site: `{name, address, type, phone, hours{...}, snap_accepted, transit_notes, lat, lng}`. Agree it in the 10:00–10:30 huddle, then no track blocks another. Integration = swapping mock data for Rohan's real data once it's validated.

### Other handoffs
- **Rohan → David (by ~1:00):** real, validated dataset → David reviews the scoring logic against it together with Rohan.
- **David → Avant (continuous, contract locked by 11:00):** schema + scoring function/API ready to wire in.
- **Avant → David (by ~2:30):** working prototype → David red-teams it as a Hartford resident with no car; bugs go back to Avant with repro steps.
- **David (continuous):** architecture and integration gut-checks — "would a caseworker trust this answer?", "does the handoff from chat to results actually work?" — kill unrealistic features early.

---

## Sequencing the day

| Time | What happens |
|---|---|
| 9:30–10:00 | Registration, 2nd floor. |
| 10:00–10:30 | **Team huddle (all three):** lock the concept above, pick the stack, agree the data schema, create the GitHub repo, start a group chat. Explicitly assign who covers research/narrative alongside their main lane. No one codes until the schema is agreed. |
| 10:30–11:00 | Schema locked. Rohan starts data gathering + validation; Avant scaffolds app + chat UI with mock data; David defines the scoring architecture, finalizes the schema, sets the integration contract. |
| 11:00–1:00 | **Parallel sprint 1:** data curation & validation · app scaffold · architecture/scoring logic built out. |
| 1:00–1:15 | **Checkpoint 1 (all):** live demo of the scaffold, review first 15 real data rows, quick story read-back. Kill or fix anything unrealistic. |
| 1:15–2:30 | **Parallel sprint 2 / integration:** real data wired in, open-now scoring connected, chat prompts tuned, slides started. |
| 2:30–2:45 | **Checkpoint 2 (all):** full end-to-end dry run *as the user*. David red-teams. Bug list only — no new features after this point. |
| 2:30–4:00 | Polish + presentation: finish slides and narrative together; fix the bug list; stress-test data edge cases (bad hours, missing phones). |
| 4:00–5:00 | Submit the project. **Rehearse the 5-minute presentation out loud, timed.** One presenter (see below). Prep 2–3 likely Q&A answers. |
| 5:00–7:00 | Presentations. 7:30 awards. |

**Rule: no new features after 2:30.** Only fixes that make the demo work.

---

## Methodology: contract-first parallel tracks

1. **Interfaces before implementation.** The data schema (David↔Rohan↔Avant) and the demo script (what we show on stage) are agreed before anyone builds. Everything else is replaceable; the interfaces aren't.
2. **Mock-data decoupling.** Avant never waits on Rohan. If real data is late, the demo still runs on mock data.
3. **Timeboxed sprints with live demos.** Two checkpoints, both with something running on screen. Status updates are demos, not descriptions.
4. **Red-team testing.** David (and whoever's free) attacks the prototype as a skeptical user. Every "a real person wouldn't trust this" becomes a fix or a cut.
5. **One decision log.** A single shared doc (or the group chat pinned message) records every scope decision — "we cut statewide coverage," "we cut user accounts." Prevents re-litigation at 3 PM.

### The 5-minute presentation (judges decide — not the audience)
- **Problem + user (45s):** the no-car Hartford resident; the barrier is proximity + transit, not availability.
- **Research + insight (45s):** what 211/Google Maps don't do; our evidence.
- **Solution + demo (2 min):** live typed conversation, one scenario, show the open-now score.
- **Impact + differentiation (1 min):** why reachability-ranked beats distance-ranked; who uses this Monday morning.
- **Next step (30s):** what we'd build/validate next.
- **One presenter.** Transitions between speakers eat the 5 minutes — decide who by 2:30.

---

## Collaboration tools & methods

- **GitHub repo** — [avantmehta/RAD](https://github.com/avantmehta/RAD). Everyone commits.
- **Shared Google Doc** — research notes, decision log, slide outline, demo script.
- **Group chat** — quick questions, checkpoint reminders, "blocked on X."
- **AI assistants for speed** — Claude Code / Copilot / Cursor for code; ChatGPT / Claude / Muse for research synthesis, data validation, and slide drafting. Free tiers and student offers are listed in the event's AI Tools & Resources doc.

---

## Day-of checklist (before 9:30)

- [ ] Laptop + charger, photo ID for check-in
- [ ] GitHub account ready
- [ ] Park: Constitution Plaza North (100 Kinsley St, follow arrows DOWN to levels 3/2/1) or South (109 Kinsley); overflow Morgan St Garage (55 Morgan St S)
- [ ] Registration is on the 2nd floor

## Remember
- **IP: the team owns 100%** of everything built. No forms, no claims.
- **Judges only** pick the winners; top 3 recognized, top vote-getter takes the prizes (including startup-accelerator mentoring if the team proceeds).
- UConn has free public WiFi + A/V. Photos will be taken (attendance = opt-in).
