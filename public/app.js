// Heartfood — front-end logic
//
// Interaction model:
//   - PRIMARY input = tap buttons, one group per PROMPTS entry (commute
//     time, budget, ...more to come). Single-select per group.
//   - The text box is SECONDARY: it fills in anything the buttons don't
//     cover yet (location, transport mode today), and whenever it parses
//     a value for a field a button also controls, the typed value WINS —
//     it overrides whatever button was selected, and the button UI
//     updates to reflect the override.
//
// BACKEND CONTRACT (for Rohan): `parseInput(text)` turns a typed sentence
// into {mode, location, when, commute_time, budget}. Right now that's a
// local mock (MOCK_PARSER below). When the real backend is ready, replace
// the body of `parseInput` with a fetch to POST /api/parse returning the
// same shape — nothing else in this file needs to change. See
// detailed-definition.md for the full schema this reads from sites.json.

const USE_MOCK_BACKEND = true;

// ---- primary tap-based prompts (add more here as they're defined) ----
const PROMPTS = [
  {
    id: "commute_time",
    label: "Commute time",
    icon: "\u{23F1}\u{FE0F}",
    options: [
      { value: 10, label: "10 min", icon: "\u{1F3C3}" },
      { value: 20, label: "20 min", icon: "\u{1F6B6}" },
      { value: 40, label: "40 min", icon: "\u{1F68C}" },
      { value: 999, label: "40+ min", icon: "\u{1F553}" },
    ],
  },
  {
    id: "budget",
    label: "Budget",
    icon: "\u{1F4B5}",
    options: [
      { value: 5, label: "$5", icon: "\u{1F4B5}" },
      { value: 10, label: "$10", icon: "\u{1F4B5}\u{1F4B5}" },
      { value: 20, label: "$20", icon: "\u{1F4B5}\u{1F4B5}\u{1F4B5}" },
      { value: Infinity, label: "Flexible", icon: "\u{1F4B0}" },
    ],
  },
];

const NEIGHBORHOOD_CENTROIDS = {
  "frog hollow": [41.7578, -72.6934],
  "asylum hill": [41.7663, -72.6981],
  "north end": [41.7801, -72.6893],
  "south green": [41.7534, -72.6791],
  "west hartford center": [41.7621, -72.7420],
  "downtown": [41.7658, -72.6734],
  "barry square": [41.7423, -72.6798],
  "bloomfield": [41.8281, -72.7218],
  "manchester center": [41.7759, -72.5215],
  "elmwood": [41.7412, -72.7186],
  "sheldon charter oak": [41.7502, -72.6712],
  "east hartford center": [41.7637, -72.6126],
  "clay arsenal": [41.7789, -72.6771],
  "behind the rocks": [41.7481, -72.7038],
  "blue hills": [41.7912, -72.7062],
  "park street": [41.7578, -72.6934],
  "park st": [41.7578, -72.6934],
  "main st": [41.7658, -72.6734],
};
const DEFAULT_CENTROID = NEIGHBORHOOD_CENTROIDS["downtown"];

// Merged state: every field here can come from a button tap OR from typed
// text. `source[field]` tracks which one set it last, purely for the
// filter-button highlight — the state value itself is always "current
// truth" regardless of source, and the most recent input always wins.
const state = { commute_time: null, budget: null, mode: null, location: null, when: "now" };
const source = {};

let SITES = [];
let userCoords = null;

const statusEl = document.getElementById("status");
const filtersEl = document.getElementById("filters");
const resultsEl = document.getElementById("results");
const composer = document.getElementById("composer");
const input = document.getElementById("composer-input");
const locateBtn = document.getElementById("locate-btn");

init();

async function init() {
  renderFilters();
  renderResultsHint();

  try {
    const res = await fetch("sites.json");
    const data = await res.json();
    SITES = data.sites || [];
  } catch (err) {
    statusEl.textContent = "⚠️ Couldn't load sites.json — check the console.";
    console.error(err);
  }

  composer.addEventListener("submit", onSubmit);
  locateBtn.addEventListener("click", onLocate);
}

// ---- primary tap UI ----

function renderFilters() {
  filtersEl.innerHTML = "";
  PROMPTS.forEach((prompt) => {
    const group = document.createElement("div");
    group.className = "filter-group";
    group.dataset.promptId = prompt.id;

    const label = document.createElement("div");
    label.className = "filter-group-label";
    label.innerHTML = `<span>${prompt.icon} ${escapeHtml(prompt.label)}</span>`;
    group.appendChild(label);

    const options = document.createElement("div");
    options.className = "filter-options";
    prompt.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn";
      btn.dataset.value = String(opt.value);
      btn.innerHTML = `<span class="fb-icon">${opt.icon}</span><span>${escapeHtml(opt.label)}</span>`;
      btn.addEventListener("click", () => {
        state[prompt.id] = opt.value;
        source[prompt.id] = "button";
        syncFilterUI();
        maybeRunSearch();
      });
      options.appendChild(btn);
    });
    group.appendChild(options);
    filtersEl.appendChild(group);
  });
  syncFilterUI();
}

// Reflect current `state` values onto the buttons — including values that
// arrived via typed text overriding a button, so the UI never lies about
// what's actually being used to rank results.
function syncFilterUI() {
  PROMPTS.forEach((prompt) => {
    const group = filtersEl.querySelector(`[data-prompt-id="${prompt.id}"]`);
    if (!group) return;
    const label = group.querySelector(".filter-group-label");
    const current = state[prompt.id];
    const overrideTag = source[prompt.id] === "text" ? '<span class="filter-source">from your text</span>' : "";
    label.innerHTML = `<span>${prompt.icon} ${escapeHtml(prompt.label)}</span>${overrideTag}`;
    group.querySelectorAll(".filter-btn").forEach((btn) => {
      const val = parseFloat(btn.dataset.value);
      btn.classList.toggle("selected", current !== null && val === current);
    });
  });
}

function onLocate() {
  if (!navigator.geolocation) {
    statusEl.textContent = "⚠️ Geolocation isn't available on this device/browser.";
    return;
  }
  locateBtn.textContent = "\u{23F3}";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userCoords = [pos.coords.latitude, pos.coords.longitude];
      state.location = "current-location";
      source.location = "button";
      locateBtn.textContent = "\u{1F4CD}";
      statusEl.textContent = "\u{1F4CD} Using your current location.";
      maybeRunSearch();
    },
    () => {
      locateBtn.textContent = "\u{1F4CD}";
      statusEl.textContent = "⚠️ Couldn't get your location — try typing where you are instead.";
    },
    { timeout: 8000 }
  );
}

// ---- secondary text input: fills gaps, overrides on conflict ----

function onSubmit(e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  handleUserText(text);
}

async function handleUserText(text) {
  statusEl.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
  const parsed = await parseInput(text);

  // Text overrides: only touch fields the text actually spoke to.
  ["mode", "location", "when", "commute_time", "budget"].forEach((key) => {
    if (parsed[key] !== null && parsed[key] !== undefined) {
      state[key] = parsed[key];
      source[key] = "text";
      if (key === "location") userCoords = null; // typed location supersedes geolocation
    }
  });

  syncFilterUI();
  maybeRunSearch();
}

async function parseInput(text) {
  if (USE_MOCK_BACKEND) return MOCK_PARSER(text);
  const res = await fetch("/api/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

function MOCK_PARSER(text) {
  const lower = text.toLowerCase();

  let mode = null;
  if (/\bno car\b|\bwithout a car\b|don'?t have a car|can'?t drive/.test(lower)) mode = "no_car";
  else if (/\bbus\b|\btransit\b/.test(lower)) mode = "transit";
  else if (/\bwalk/.test(lower)) mode = "walk";
  else if (/\bi have a car\b|\bcar\b|\bdriv/.test(lower)) mode = "car";

  let location = null;
  for (const name of Object.keys(NEIGHBORHOOD_CENTROIDS)) {
    if (lower.includes(name)) { location = name; break; }
  }
  if (!location) {
    const nearMatch = lower.match(/near ([a-z0-9 .'-]+?)(?:[,.]|$| i | and |\bno\b)/);
    if (nearMatch) location = nearMatch[1].trim();
  }

  let when = null;
  if (/tomorrow/.test(lower)) when = "tomorrow";
  else if (/\bnow\b|\btoday\b/.test(lower)) when = "now";

  // "only have 10 minutes", "20 min", "40+ minutes", "half an hour"
  let commute_time = null;
  const minMatch = lower.match(/(\d+)\s*\+?\s*min/);
  if (minMatch) {
    const n = parseInt(minMatch[1], 10);
    commute_time = n <= 10 ? 10 : n <= 20 ? 20 : n <= 40 ? 40 : 999;
  } else if (/half\s+an?\s+hour/.test(lower)) {
    commute_time = 40;
  }

  // "$5", "five dollars", "any budget", "flexible"
  let budget = null;
  const dollarMatch = lower.match(/\$?\s*(\d+)\s*(dollars?|bucks?)?/) && lower.match(/\$(\d+)/);
  if (dollarMatch) {
    const n = parseInt(dollarMatch[1], 10);
    budget = n <= 5 ? 5 : n <= 10 ? 10 : n <= 20 ? 20 : Infinity;
  } else if (/\bany budget\b|\bflexible\b|\bno budget\b|\bwhatever it costs\b|\blarge budget\b/.test(lower)) {
    budget = Infinity;
  }

  return { mode, location, when, commute_time, budget };
}

// ---- geo + ranking ----

function resolveLocation() {
  if (userCoords) return userCoords;
  if (state.location && NEIGHBORHOOD_CENTROIDS[state.location]) return NEIGHBORHOOD_CENTROIDS[state.location];
  return null;
}

function haversineMiles(a, b) {
  const [lat1, lon1] = a, [lat2, lon2] = b;
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// v1 open-now confidence score — see detailed-definition.md section 4
function scoreOpenNow(site, now) {
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const day = dayKeys[now.getDay()];
  const hours = site.hours ? site.hours[day] : null;
  const hasAnyHours = site.hours && Object.values(site.hours).some(Boolean);

  if (!hours) {
    if (hasAnyHours) return { score: 0, label: "Closed today" };
    return { score: 40, label: "Hours unverified" };
  }

  const [openStr, closeStr] = hours;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = openStr.split(":").map(Number);
  const [ch, cm] = closeStr.split(":").map(Number);
  const isOpen = nowMin >= oh * 60 + om && nowMin < ch * 60 + cm;
  if (!isOpen) return { score: 0, label: "Closed now" };

  const daysSinceVerified = site.verified
    ? (now - new Date(site.verified)) / 86400000
    : Infinity;
  if (daysSinceVerified <= 14) return { score: 95, label: "Likely open" };
  if (daysSinceVerified <= 45) return { score: 70, label: "Probably open" };
  return { score: 55, label: "Hours stale" };
}

// v1 reachability — straight-line distance as a stand-in for real transit
// routing (GTFS) until that's wired in. Thresholds are placeholders.
function reachability(site, mode, distanceMiles) {
  if (mode === "car") {
    return { feasible: true, minutes: Math.round(distanceMiles * 2.5) + 3, note: "\u{1F697} by car" };
  }
  if (mode === "walk") {
    const feasible = distanceMiles <= 1.5;
    return {
      feasible,
      minutes: Math.round(distanceMiles * 20),
      note: feasible ? "\u{1F6B6} walkable" : "\u{1F6B6} too far to walk",
    };
  }
  // transit / no_car / unknown
  if (site.transit_notes) {
    return {
      feasible: distanceMiles <= 7,
      minutes: Math.round(distanceMiles * 6) + 10,
      note: "\u{1F68C} " + site.transit_notes,
    };
  }
  const feasible = distanceMiles <= 1.5;
  return {
    feasible,
    minutes: Math.round(distanceMiles * 20),
    note: feasible ? "\u{1F6B6} walkable (no transit info)" : "⚠️ no known transit",
  };
}

function rankSites(sites, opts) {
  const { mode, originCoords, now, commuteBudget, budget } = opts;
  return sites
    .map((site) => {
      const distance = haversineMiles(originCoords, [site.lat, site.lng]);
      const reach = reachability(site, mode, distance);
      const open = scoreOpenNow(site, now);
      const cost = site.estimated_cost ?? 0;
      const withinTime = commuteBudget == null || reach.minutes <= commuteBudget;
      const withinBudget = budget == null || budget === Infinity || cost <= budget;
      const isOpen = open.score > 0;
      return { site, distance, reach, open, cost, feasible: reach.feasible && withinTime && withinBudget && isOpen };
    })
    .sort((a, b) => {
      if (a.feasible !== b.feasible) return a.feasible ? -1 : 1;
      if (a.open.score !== b.open.score) return b.open.score - a.open.score;
      return a.reach.minutes - b.reach.minutes;
    });
}

// ---- orchestration ----

function maybeRunSearch() {
  const originCoords = resolveLocation();
  if (!originCoords) {
    renderResultsHint();
    return;
  }
  const mode = state.mode || "no_car"; // no mode-picker yet; assume the harder case until a button/text says otherwise
  const ranked = rankSites(SITES, {
    mode,
    originCoords,
    now: new Date(),
    commuteBudget: state.commute_time,
    budget: state.budget,
  });
  const top = ranked.filter((r) => r.feasible).slice(0, 5);
  const shown = top.length ? top : ranked.slice(0, 2);

  statusEl.textContent = summarize(shown, top.length > 0);
  renderResults(shown);
}

function summarize(results, hadFeasibleMatches) {
  if (!results.length) return "\u{1F937} Nothing in the current dataset — try a different area.";
  const best = results[0];
  const bits = [];
  if (state.commute_time) bits.push(`≤${state.commute_time === 999 ? "40+" : state.commute_time} min`);
  if (state.budget) bits.push(state.budget === Infinity ? "any budget" : `≤$${state.budget}`);
  const criteria = bits.length ? ` (${bits.join(", ")})` : "";
  const prefix = hadFeasibleMatches
    ? `✅ ${results.length} option${results.length === 1 ? "" : "s"} match${results.length === 1 ? "es" : ""}${criteria}. `
    : `⚠️ Nothing fits${criteria} exactly — closest options anyway: `;
  return `${prefix}Top pick: ${best.site.name}, ${best.reach.minutes} min, ${best.open.label.toLowerCase()}.`;
}

// ---- rendering ----

function renderResultsHint() {
  resultsEl.innerHTML = '<div class="results-hint">\u{1F4CD} Tap the locate button or tell me where you are to see options.</div>';
}

function renderResults(results) {
  resultsEl.innerHTML = "";
  results.forEach((r) => resultsEl.appendChild(renderCard(r)));
}

function renderCard(r) {
  const { site, reach, open, cost } = r;
  const card = document.createElement("div");
  card.className = "card";

  const badgeClass = open.score >= 90 ? "good" : open.score >= 30 ? "warn" : "bad";
  const typeMeta = {
    pantry: { label: "Pantry", icon: "\u{1F9FA}" },
    grocer: { label: "SNAP Grocer", icon: "\u{1F6D2}" },
    mobile_market: { label: "Mobile Market", icon: "\u{1F69A}" },
  }[site.type] || { label: site.type, icon: "\u{1F4CD}" };
  const costLabel = cost === 0 ? "\u{1F4B5} Free" : `\u{1F4B5} ~$${cost}`;

  card.innerHTML = `
    <div class="card-top">
      <div>
        <div class="card-name">${typeMeta.icon} ${escapeHtml(site.name)}</div>
        <div class="card-type">${escapeHtml(typeMeta.label)}${site.snap_accepted ? " · ✅ SNAP" : ""}</div>
      </div>
      <span class="badge ${badgeClass}">${escapeHtml(open.label)}</span>
    </div>
    <div class="card-meta">
      <span><strong>⏱️ ${reach.minutes} min</strong></span>
      <span>${escapeHtml(reach.note)}</span>
      <span>${costLabel}</span>
    </div>
    <div class="card-meta">
      <span>\u{1F4CD} ${escapeHtml(site.address)}, ${escapeHtml(site.town)}</span>
      ${site.phone ? `<span>\u{1F4DE} ${escapeHtml(site.phone)}</span>` : ""}
    </div>
    ${site.notes ? `<div class="card-note">\u{1F4AC} ${escapeHtml(site.notes)}</div>` : ""}
  `;
  return card;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
