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
// into {mode, location, availability, commute_time, budget, food_type,
// payment_type} (any field not mentioned in the text should come back
// null). Right now that's a local mock (MOCK_PARSER below). When the real
// backend is ready, replace the body of `parseInput` with a fetch to
// POST /api/parse returning the same shape — nothing else in this file
// needs to change. See detailed-definition.md for the full schema this
// reads from sites.json.

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
  {
    id: "food_type",
    label: "Food type",
    icon: "\u{1F37D}\u{FE0F}",
    options: [
      { value: "fresh", label: "Fresh", icon: "\u{1F966}" },
      { value: "non_perishable", label: "Non-perishable", icon: "\u{1F96B}" },
      { value: "prepared", label: "Prepared meals", icon: "\u{1F371}" },
      { value: "any", label: "Other / any", icon: "❓" },
    ],
  },
  {
    id: "payment_type",
    label: "Payment",
    icon: "\u{1F4B3}",
    options: [
      { value: "cash", label: "Cash", icon: "\u{1F4B5}" },
      { value: "snap", label: "SNAP/EBT", icon: "\u{1F5F3}\u{FE0F}" },
      { value: "card", label: "Card", icon: "\u{1F4B3}" },
      { value: "wic", label: "WIC", icon: "\u{1F37C}" },
    ],
  },
  {
    id: "diet_type",
    label: "Diet type",
    icon: "\u{1F957}",
    options: [
      { value: "vegetarian", label: "Vegetarian", icon: "\u{1F96C}" },
      { value: "vegan", label: "Vegan", icon: "\u{1F331}" },
      { value: "keto", label: "Keto", icon: "\u{1F969}" },
      { value: "any", label: "No restriction", icon: "\u{1F37D}\u{FE0F}" },
    ],
  },
  {
    // Straight from the challenge brief's bonus line: "match hours of
    // operation to a person's schedule" — this is the user's own
    // availability, checked against each site's hours (see
    // AVAILABILITY_TIMES / scoreOpenNow below), not just literal right-now.
    id: "availability",
    label: "When can you go?",
    icon: "\u{1F5D3}\u{FE0F}",
    options: [
      { value: "now", label: "Right now", icon: "\u{23F0}" },
      { value: "afternoon", label: "This afternoon", icon: "☀️" },
      { value: "evening", label: "This evening", icon: "\u{1F306}" },
      { value: "tomorrow_am", label: "Tomorrow AM", icon: "\u{1F4C5}" },
    ],
  },
];

// Mutable, reorderable copy of PROMPTS that the criteria-customization
// panel operates on — PROMPTS itself stays the static "factory default"
// seed. Each entry gets a 1-5 `weight` (default 3/mid) used as a
// tie-breaker in ranking (see rankSites), and `custom: true` for anything
// the user adds through the "+" panel. This is scaffolding ahead of the
// team's real UI spec — built so a proper weighting/ordering model can
// drop in later without redoing the interaction plumbing.
const criteria = PROMPTS.map((p) => ({ ...p, weight: 3, custom: false }));

const AVAILABILITY_PHRASES = {
  now: "now",
  afternoon: "this afternoon",
  evening: "this evening",
  tomorrow_am: "tomorrow morning",
};
const AVAILABILITY_TIMES = {
  afternoon: [14, 0],
  evening: [18, 0],
  tomorrow_am: [10, 0],
};

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
const state = {
  commute_time: null, budget: null, mode: null, location: null,
  food_type: null, payment_type: null, availability: "now", diet_type: null,
};
const source = {};

let SITES = [];
let userCoords = null;

const statusEl = document.getElementById("status");
const filtersEl = document.getElementById("filters");
const resultsEl = document.getElementById("results");
const composer = document.getElementById("composer");
const input = document.getElementById("composer-input");
const locateBtn = document.getElementById("locate-btn");
const customizeBtn = document.getElementById("customize-btn");
const criteriaModal = document.getElementById("criteria-modal");
const criteriaListEl = document.getElementById("criteria-list");
const modalClose = document.getElementById("modal-close");
const modalDone = document.getElementById("modal-done");
const newCritLabel = document.getElementById("new-crit-label");
const newCritOptions = document.getElementById("new-crit-options");
const addCritBtn = document.getElementById("add-crit-btn");

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
  customizeBtn.addEventListener("click", openCriteriaModal);
  modalClose.addEventListener("click", closeCriteriaModal);
  modalDone.addEventListener("click", closeCriteriaModal);
  addCritBtn.addEventListener("click", addCustomCriterion);
}

// ---- primary tap UI ----

function renderFilters() {
  filtersEl.innerHTML = "";
  criteria.forEach((prompt) => {
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
  criteria.forEach((prompt) => {
    const group = filtersEl.querySelector(`[data-prompt-id="${prompt.id}"]`);
    if (!group) return;
    const label = group.querySelector(".filter-group-label");
    const current = state[prompt.id];
    const overrideTag = source[prompt.id] === "text" ? '<span class="filter-source">from your text</span>' : "";
    label.innerHTML = `<span>${prompt.icon} ${escapeHtml(prompt.label)}</span>${overrideTag}`;
    group.querySelectorAll(".filter-btn").forEach((btn) => {
      // String comparison so this works for numbers, strings, and Infinity
      // alike (dataset attributes are always strings anyway).
      btn.classList.toggle("selected", current !== null && String(current) === btn.dataset.value);
    });
  });
}

// ---- criteria customization panel ("+" button) ----

function openCriteriaModal() {
  renderCriteriaModal();
  criteriaModal.classList.remove("hidden");
  window.logHeartfoodEvent?.("criteria_panel_opened");
}

function closeCriteriaModal() {
  criteriaModal.classList.add("hidden");
}

function renderCriteriaModal() {
  criteriaListEl.innerHTML = "";
  criteria.forEach((c, i) => {
    const row = document.createElement("div");
    row.className = "criteria-row";

    const order = document.createElement("div");
    order.className = "crit-order";
    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.textContent = "▲";
    upBtn.disabled = i === 0;
    upBtn.addEventListener("click", () => moveCriterion(i, -1));
    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.textContent = "▼";
    downBtn.disabled = i === criteria.length - 1;
    downBtn.addEventListener("click", () => moveCriterion(i, 1));
    order.appendChild(upBtn);
    order.appendChild(downBtn);
    row.appendChild(order);

    const label = document.createElement("div");
    label.className = "crit-label";
    label.innerHTML = `${c.icon} ${escapeHtml(c.label)}${c.custom ? '<span class="crit-custom-tag">custom</span>' : ""}`;
    row.appendChild(label);

    const weights = document.createElement("div");
    weights.className = "crit-weights";
    for (let w = 1; w <= 5; w++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "crit-weight-dot" + (w <= c.weight ? " filled" : "");
      dot.setAttribute("aria-label", `Weight ${w}`);
      dot.addEventListener("click", () => {
        c.weight = w;
        renderCriteriaModal();
        maybeRunSearch();
      });
      weights.appendChild(dot);
    }
    row.appendChild(weights);

    if (c.custom) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "crit-remove";
      remove.setAttribute("aria-label", "Remove");
      remove.textContent = "\u{1F5D1}";
      remove.addEventListener("click", () => removeCriterion(c.id));
      row.appendChild(remove);
    }

    criteriaListEl.appendChild(row);
  });
}

function moveCriterion(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= criteria.length) return;
  [criteria[index], criteria[target]] = [criteria[target], criteria[index]];
  renderCriteriaModal();
  renderFilters();
}

function removeCriterion(id) {
  const idx = criteria.findIndex((c) => c.id === id);
  if (idx === -1) return;
  criteria.splice(idx, 1);
  delete state[id];
  delete source[id];
  renderCriteriaModal();
  renderFilters();
  maybeRunSearch();
}

function addCustomCriterion() {
  const label = newCritLabel.value.trim();
  if (!label) return;
  const optionLabels = newCritOptions.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  const options = (optionLabels.length ? optionLabels : ["Yes"]).map((l) => ({
    value: l.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    label: l,
    icon: "✨",
  }));
  criteria.push({
    id: `custom_${Date.now()}`,
    label,
    icon: "✨",
    options,
    weight: 3,
    custom: true,
  });
  newCritLabel.value = "";
  newCritOptions.value = "";
  renderCriteriaModal();
  renderFilters();
  window.logHeartfoodEvent?.("custom_criterion_added", { label });
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
      window.logHeartfoodEvent?.("locate_used");
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
  ["mode", "location", "availability", "commute_time", "budget", "food_type", "payment_type", "diet_type"].forEach((key) => {
    if (parsed[key] !== null && parsed[key] !== undefined) {
      state[key] = parsed[key];
      source[key] = "text";
      if (key === "location") userCoords = null; // typed location supersedes geolocation
    }
  });

  syncFilterUI();
  maybeRunSearch();
  window.logHeartfoodEvent?.("text_query_submitted");
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

  let availability = null;
  if (/tomorrow/.test(lower)) availability = "tomorrow_am";
  else if (/\bthis evening\b|\btonight\b/.test(lower)) availability = "evening";
  else if (/\bthis afternoon\b/.test(lower)) availability = "afternoon";
  else if (/\bnow\b|\btoday\b|\bright now\b/.test(lower)) availability = "now";

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

  let food_type = null;
  if (/\bfresh\b|\bproduce\b|\bvegetables?\b|\bfruit/.test(lower)) food_type = "fresh";
  else if (/non-?perishable|\bcanned\b|\bshelf.stable\b/.test(lower)) food_type = "non_perishable";
  else if (/\bprepared\b|\bhot meal/.test(lower)) food_type = "prepared";

  let payment_type = null;
  if (/\bsnap\b|\bebt\b/.test(lower)) payment_type = "snap";
  else if (/\bwic\b/.test(lower)) payment_type = "wic";
  else if (/\bcard\b|\bcredit\b|\bdebit\b/.test(lower)) payment_type = "card";
  else if (/\bcash\b/.test(lower)) payment_type = "cash";

  let diet_type = null;
  if (/\bvegan\b/.test(lower)) diet_type = "vegan";
  else if (/\bvegetarian\b/.test(lower)) diet_type = "vegetarian";
  else if (/\bketo\b/.test(lower)) diet_type = "keto";
  else if (/\bno (diet|dietary) restriction/.test(lower) || /\banything\b/.test(lower)) diet_type = "any";

  return { mode, location, availability, commute_time, budget, food_type, payment_type, diet_type };
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

// Turns the user's chosen availability slot into an actual reference
// moment (today at a fixed hour, or tomorrow morning) so hours get
// checked against WHEN THE USER CAN GO, not just this literal instant.
function resolveReferenceTime(availability) {
  if (!availability || availability === "now") return new Date();
  const ref = new Date();
  const [h, m] = AVAILABILITY_TIMES[availability] || [0, 0];
  if (availability === "tomorrow_am") ref.setDate(ref.getDate() + 1);
  ref.setHours(h, m, 0, 0);
  return ref;
}

// v1 open-now confidence score — see detailed-definition.md section 4.
// `refTime` is the moment to check hours against (see resolveReferenceTime);
// `phrase` is just for human-readable labels ("Likely open this evening").
function scoreOpenNow(site, refTime, phrase) {
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const day = dayKeys[refTime.getDay()];
  const hours = site.hours ? site.hours[day] : null;
  const hasAnyHours = site.hours && Object.values(site.hours).some(Boolean);

  if (!hours) {
    if (hasAnyHours) return { score: 0, label: `Closed ${phrase}` };
    return { score: 40, label: "Hours unverified" };
  }

  const [openStr, closeStr] = hours;
  const refMin = refTime.getHours() * 60 + refTime.getMinutes();
  const [oh, om] = openStr.split(":").map(Number);
  const [ch, cm] = closeStr.split(":").map(Number);
  const isOpen = refMin >= oh * 60 + om && refMin < ch * 60 + cm;
  if (!isOpen) return { score: 0, label: `Closed ${phrase}` };

  const daysSinceVerified = site.verified
    ? (refTime - new Date(site.verified)) / 86400000
    : Infinity;
  if (daysSinceVerified <= 14) return { score: 95, label: `Likely open ${phrase}` };
  if (daysSinceVerified <= 45) return { score: 70, label: `Probably open ${phrase}` };
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

function getWeight(id) {
  const c = criteria.find((x) => x.id === id);
  return c ? c.weight : 3;
}
const clamp01 = (n) => Math.max(0, Math.min(1, n));

function rankSites(sites, opts) {
  const { mode, originCoords, commuteBudget, budget, foodType, paymentType, availability, dietType } = opts;
  const refTime = resolveReferenceTime(availability);
  const phrase = AVAILABILITY_PHRASES[availability] || "now";

  // Weights only ever break ties AMONG sites that already pass every hard
  // filter below (reachable, in budget, open, right food/payment type) —
  // they can never make a closed or unreachable site outrank a valid one.
  // This is a simple v1 so the "+" weighting panel has something real to
  // do; the team's actual design spec may want a different formula.
  const wTime = getWeight("commute_time");
  const wBudget = getWeight("budget");
  const wOpen = getWeight("availability");
  const weightTotal = wTime + wBudget + wOpen;

  return sites
    .map((site) => {
      const distance = haversineMiles(originCoords, [site.lat, site.lng]);
      const reach = reachability(site, mode, distance);
      const open = scoreOpenNow(site, refTime, phrase);
      const cost = site.estimated_cost ?? 0;
      const withinTime = commuteBudget == null || reach.minutes <= commuteBudget;
      const withinBudget = budget == null || budget === Infinity || cost <= budget;
      const isOpen = open.score > 0;
      const matchesFoodType =
        !foodType || foodType === "any" || (site.food_types && site.food_types.includes(foodType));
      // Free sites need no payment method at all, so any payment preference is satisfied.
      const matchesPayment =
        !paymentType || cost === 0 || (site.payment_accepted && site.payment_accepted.includes(paymentType));
      const matchesDiet =
        !dietType || dietType === "any" || (site.diet_options && site.diet_options.includes(dietType));
      const feasible = reach.feasible && withinTime && withinBudget && isOpen && matchesFoodType && matchesPayment && matchesDiet;

      const timeCloseness = commuteBudget ? clamp01(1 - reach.minutes / commuteBudget) : 0.5;
      const budgetHeadroom = budget && budget !== Infinity ? clamp01(1 - cost / budget) : 0.5;
      const fitScore = weightTotal
        ? (wTime * timeCloseness + wBudget * budgetHeadroom + wOpen * (open.score / 100)) / weightTotal
        : 0;

      return { site, distance, reach, open, cost, feasible, fitScore };
    })
    .sort((a, b) => {
      if (a.feasible !== b.feasible) return a.feasible ? -1 : 1;
      if (a.feasible && Math.abs(a.fitScore - b.fitScore) > 0.001) return b.fitScore - a.fitScore;
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
    commuteBudget: state.commute_time,
    budget: state.budget,
    foodType: state.food_type,
    paymentType: state.payment_type,
    availability: state.availability,
    dietType: state.diet_type,
  });
  const top = ranked.filter((r) => r.feasible).slice(0, 5);
  const shown = top.length ? top : ranked.slice(0, 2);

  statusEl.textContent = summarize(shown, top.length > 0);
  renderResults(shown);
  window.logHeartfoodEvent?.("search_results_shown", { count: shown.length, had_exact_matches: top.length > 0 });
}

function summarize(results, hadFeasibleMatches) {
  if (!results.length) return "\u{1F937} Nothing in the current dataset — try a different area.";
  const best = results[0];
  const bits = [];
  if (state.commute_time) bits.push(`≤${state.commute_time === 999 ? "40+" : state.commute_time} min`);
  if (state.budget) bits.push(state.budget === Infinity ? "any budget" : `≤$${state.budget}`);
  if (state.food_type && state.food_type !== "any") bits.push(state.food_type.replace("_", "-"));
  if (state.payment_type) bits.push(state.payment_type.toUpperCase());
  if (state.diet_type && state.diet_type !== "any") bits.push(state.diet_type);
  if (state.availability && state.availability !== "now") bits.push(AVAILABILITY_PHRASES[state.availability]);
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

const FOOD_TYPE_ICON = { fresh: "\u{1F966}", non_perishable: "\u{1F96B}", prepared: "\u{1F371}" };
const PAYMENT_ICON = { cash: "\u{1F4B5}", card: "\u{1F4B3}", snap: "\u{1F5F3}️", wic: "\u{1F37C}" };
const DIET_ICON = { vegetarian: "\u{1F96C}", vegan: "\u{1F331}", keto: "\u{1F969}" };

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
    <div class="card-meta">
      ${(site.food_types || []).map((f) => `<span>${FOOD_TYPE_ICON[f] || "\u{1F374}"} ${escapeHtml(f.replace("_", "-"))}</span>`).join("")}
      ${(site.payment_accepted || []).map((p) => `<span>${PAYMENT_ICON[p] || "\u{1F4B3}"} ${p.toUpperCase()}</span>`).join("")}
      ${(site.diet_options || []).map((d) => `<span>${DIET_ICON[d] || "\u{1F957}"} ${escapeHtml(d)}</span>`).join("")}
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
