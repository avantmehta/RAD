# Hack for Humanity — Team Strategy
## Challenge 2: The Last Mile of Food Access

**Team:** Crossby Dessalines · Adriel Allen · Rohan Vibhuti · Dave Ripper
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

5. **Start the story thread at 10:30 AM, not 3 PM.** Judging weights research & evidence and presentation alongside the build. The narrative, the user persona, the "existing alternatives fall short because…" evidence, and the slide outline get a dedicated owner from minute one — not whoever's free at the end.

---

## Division of labor — four parallel workstreams

| Workstream | Owner | Plays to |
|---|---|---|
| **A. Data** — curate the pantry dataset, define the JSON schema, build the open-now scoring logic | **Adriel** (Data Science, Vibe Coding) | Data science |
| **B. Build** — scaffold the app + chat UI against the schema with mock data, deploy | **Rohan** (SWE, UX Design, Data Science) | Engineering + UX |
| **C. Research & story** — existing alternatives, user persona, problem statement, evidence, slide draft | **Crossby** (Market Research, Domain, Vibe Coding) | Research + domain |
| **D. Integration, workflow & QA** — define the user workflow end-to-end, integration-test data→app handoffs, validate the dataset (SQL), red-team the demo as the user, own the 5-min presentation | **Dave** (Domain Expertise — 20 yrs radiology IT systems implementation: integrations, workflow design, troubleshooting, SQL, vendor management; not a coder) | Systems integration |

> Dave's background is the team's QA department: he's spent 20 years making systems actually work in the real world — defining workflows with departments, integrating vendors, troubleshooting, SQL data work. That's exactly what a hackathon prototype needs between "it runs on my laptop" and "a judge trusts it live."

### The critical handoff: the data schema contract (agreed by 11:00 AM)
Adriel and Rohan work **fully in parallel** because Rohan builds against mock data in the *exact* schema Adriel is filling with real data. The schema is the interface — e.g. each site: `{name, address, type, phone, hours{...}, snap_accepted, transit_notes, lat, lng}`. Agree it in the 10:00–10:30 huddle, then neither track blocks the other. Integration = swapping mock for real.

### Other handoffs
- **Crossby → Dave (by ~2:30):** narrative + slide outline → Dave turns it into the final 5-min deck and rehearses.
- **Rohan → Dave (by ~2:30):** working prototype → Dave red-teams it as a Hartford resident with no car; bugs go back to Rohan with repro steps.
- **Adriel → Rohan (by ~1:00):** real dataset → Rohan wires it in; scoring logic reviewed together at checkpoint 1.
- **Dave → all (continuous):** workflow and integration gut-checks — "would a caseworker trust this answer?", "does the handoff from chat to results actually work?" — kill unrealistic features early. Dave is also the dataset validator (SQL) and the demo-script owner.

---

## Sequencing the day

| Time | What happens |
|---|---|
| 9:30–10:00 | Registration, 2nd floor. Find each other. |
| 10:00–10:30 | **Team huddle (all four — first contact):** 10 min intros, then lock the concept above, pick the stack (recommend: web app + chat UI on Replit), agree the data schema, create the GitHub repo, start a group chat. No one codes until the schema is agreed. *(Send the plan to the team beforehand — draft email below — so the huddle is 10 minutes, not 30.)* |
| 10:30–11:00 | Schema locked. Adriel starts data gathering; Rohan scaffolds app + chat UI with mock data; Crossby starts research (211 CT, Foodshare, what exists today and where it fails); Dave defines the user persona + "would a caseworker trust this" criteria. |
| 11:00–1:00 | **Parallel sprint 1:** data curation · app scaffold · research + story draft · Dave validates direction. |
| 1:00–1:15 | **Checkpoint 1 (all):** live demo of the scaffold, review first 15 real data rows, story read-back. Kill or fix anything unrealistic. |
| 1:15–2:30 | **Parallel sprint 2 / integration:** real data wired in, open-now scoring connected, chat prompts tuned, slides started. |
| 2:30–2:45 | **Checkpoint 2 (all):** full end-to-end dry run *as the user*. Dave red-teams. Bug list only — no new features after this point. |
| 2:30–4:00 | Polish + presentation: Crossby + Dave finish slides; Rohan fixes the bug list; Adriel stress-tests data edge cases (bad hours, missing phones). |
| 4:00–5:00 | Submit the project. **Rehearse the 5-minute presentation out loud, timed.** One presenter (see below). Prep 2–3 likely Q&A answers. |
| 5:00–7:00 | Presentations. 7:30 awards. |

**Rule: no new features after 2:30.** Only fixes that make the demo work.

---

## Methodology: contract-first parallel tracks

1. **Interfaces before implementation.** The data schema (Adriel↔Rohan) and the demo script (what we show on stage) are agreed before anyone builds. Everything else is replaceable; the interfaces aren't.
2. **Mock-data decoupling.** The builder never waits on the data person. If real data is late, the demo still runs.
3. **Timeboxed sprints with live demos.** Two checkpoints, both with something running on screen. Status updates are demos, not descriptions.
4. **Red-team testing by the domain experts.** Dave + Crossby attack the prototype as skeptical users. Every "a real person wouldn't trust this" becomes a fix or a cut.
5. **One decision log.** A single shared doc (or the group chat pinned message) records every scope decision — "we cut statewide coverage," "we cut user accounts." Prevents re-litigation at 3 PM.

### The 5-minute presentation (judges decide — not the audience)
- **Problem + user (45s):** the no-car Hartford resident; the barrier is proximity + transit, not availability.
- **Research + insight (45s):** what 211/Google Maps don't do; our evidence.
- **Solution + demo (2 min):** live typed conversation, one scenario, show the open-now score.
- **Impact + differentiation (1 min):** why reachability-ranked beats distance-ranked; who uses this Monday morning.
- **Next step (30s):** what we'd build/validate next.
- **One presenter.** Transitions between speakers eat the 5 minutes — the guide says so explicitly. Dave or Crossby; decide by 2:30.

---

## Collaboration tools & methods

- **GitHub repo** — created in the 10:00 huddle (guide: set up accounts before arriving). Rohan owns merges; everyone commits.
- **Replit** — strong hackathon option: multiplayer editing + instant deploy, no environment setup. (Muse has it connected — Dave can ask for help here during the day.)
- **Shared Google Doc** — research notes, decision log, slide outline, demo script. Crossby owns it.
- **Group chat** — move off the email thread at 10 AM (text group / Discord / Slack). Quick questions, checkpoint reminders, "blocked on X."
- **AI assistants for speed** — Copilot / Cursor / Claude Code for code; ChatGPT / Claude for research synthesis and slide drafting. The guide lists free tiers and student offers.
- **Muse (me)** — Dave can ping me all day: research lookups, debugging help, data validation, slide review, rehearsal timing.

---

## Day-of checklist (before 9:30)

- [ ] Laptop + charger, photo ID for check-in
- [ ] GitHub account ready
- [ ] Reply-all intro to the team (if not done) — or just find them at registration
- [ ] Park: Constitution Plaza North (100 Kinsley St, follow arrows DOWN to levels 3/2/1) or South (109 Kinsley); overflow Morgan St Garage (55 Morgan St S)
- [ ] Registration is on the 2nd floor

## Remember
- **IP: the team owns 100%** of everything built. No forms, no claims.
- **Judges only** pick the winners; top 3 recognized, top vote-getter takes the prizes (including startup-accelerator mentoring if the team proceeds).
- UConn has free public WiFi + A/V. Photos will be taken (attendance = opt-in).
