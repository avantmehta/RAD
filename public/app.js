// Heartfood — front-end logic
//
// BACKEND CONTRACT (for Rohan): this file calls `parseInput(text)` to turn a
// user's typed sentence into {mode, location, when}. Right now that's a
// local mock (MOCK_PARSER below). When the real backend is ready, replace
// the body of `parseInput` with:
//
//   const res = await fetch('/api/parse', {
//     method: 'POST',
//     headers: {'Content-Type': 'application/json'},
//     body: JSON.stringify({text}),
//   });
//   return res.json();
//
// ...as long as the response shape stays {mode, location, when}, nothing
// else in this file needs to change. See detailed-definition.md for the
// full schema this reads from sites.json.

const USE_MOCK_BACKEND = true;

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

let SITES = [];
let userCoords = null;

const thread = document.getElementById("thread");
const chipsEl = document.getElementById("chips");
const composer = document.getElementById("composer");
const input = document.getElementById("composer-input");
const locateBtn = document.getElementById("locate-btn");

init();

async function init() {
  addMessage("assistant",
    "Hi — I'm Heartfood. Tell me where you are and how you get around, " +
    "and I'll find food resources you can actually reach today."
  );
  renderChips([
    "I don't have a car, I'm near Park St",
    "I'm downtown, no car, need food now",
    "I have a car, near West Hartford Center",
  ]);

  try {
    const res = await fetch("sites.json");
    const data = await res.json();
    SITES = data.sites || [];
  } catch (err) {
    addMessage("system", "Couldn't load the site list (sites.json). Check the console.");
    console.error(err);
  }

  composer.addEventListener("submit", onSubmit);
  locateBtn.addEventListener("click", onLocate);
}

function renderChips(suggestions) {
  chipsEl.innerHTML = "";
  suggestions.forEach((text) => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.type = "button";
    btn.textContent = text;
    btn.addEventListener("click", () => {
      input.value = "";
      handleUserText(text);
    });
    chipsEl.appendChild(btn);
  });
}

function onSubmit(e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  handleUserText(text);
}

function onLocate() {
  if (!navigator.geolocation) {
    addMessage("system", "Geolocation isn't available on this device/browser.");
    return;
  }
  locateBtn.textContent = "…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userCoords = [pos.coords.latitude, pos.coords.longitude];
      locateBtn.textContent = "\u{1F4CD}";
      addMessage("system", "Using your current location for distances.");
    },
    () => {
      locateBtn.textContent = "\u{1F4CD}";
      addMessage("system", "Couldn't get your location — falling back to the area you type.");
    },
    { timeout: 8000 }
  );
}

async function handleUserText(text) {
  addMessage("user", text);
  const typingEl = addTyping();

  const parsed = await parseInput(text);
  typingEl.remove();

  const originCoords = userCoords || resolveLocation(parsed.location);
  const ranked = rankSites(SITES, parsed.mode, originCoords, new Date());
  const top = ranked.filter((r) => r.reach.feasible).slice(0, 3);
  const fallback = top.length ? [] : ranked.slice(0, 2);

  addMessage("assistant", summarize(parsed, top.length ? top : fallback, originCoords));
  renderResults(top.length ? top : fallback);
}

// ---- "backend" (mock today, real fetch later — see header comment) ----

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
  let mode = "unknown";
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

  let when = "now";
  if (/tomorrow/.test(lower)) when = "tomorrow";

  return { mode, location, when };
}

// ---- geo + ranking ----

function resolveLocation(locationText) {
  if (locationText && NEIGHBORHOOD_CENTROIDS[locationText]) {
    return NEIGHBORHOOD_CENTROIDS[locationText];
  }
  return DEFAULT_CENTROID;
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
    return { score: 40, label: "Hours unverified — call first" };
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
  if (daysSinceVerified <= 45) return { score: 70, label: "Probably open — call to confirm" };
  return { score: 55, label: "Hours stale — call to confirm" };
}

// v1 reachability — straight-line distance as a stand-in for real transit
// routing (GTFS) until that's wired in. Thresholds are placeholders.
function reachability(site, mode, distanceMiles) {
  if (mode === "car") {
    return { feasible: true, minutes: Math.round(distanceMiles * 2.5) + 3, note: "by car" };
  }
  if (mode === "walk") {
    const feasible = distanceMiles <= 1.2;
    return {
      feasible,
      minutes: Math.round(distanceMiles * 20),
      note: feasible ? "walkable" : "too far to walk (" + distanceMiles.toFixed(1) + " mi)",
    };
  }
  // transit / no_car / unknown
  if (site.transit_notes) {
    const feasible = distanceMiles <= 6;
    return {
      feasible,
      minutes: Math.round(distanceMiles * 6) + 10,
      note: site.transit_notes,
    };
  }
  const feasible = distanceMiles <= 1.2;
  return {
    feasible,
    minutes: Math.round(distanceMiles * 20),
    note: feasible ? "walkable (no transit info on file)" : "no known transit — may be hard to reach without a car",
  };
}

function rankSites(sites, mode, originCoords, now) {
  return sites
    .map((site) => {
      const distance = haversineMiles(originCoords, [site.lat, site.lng]);
      const reach = reachability(site, mode, distance);
      const open = scoreOpenNow(site, now);
      return { site, distance, reach, open };
    })
    .sort((a, b) => {
      if (a.reach.feasible !== b.reach.feasible) return a.reach.feasible ? -1 : 1;
      if (a.open.score !== b.open.score) return b.open.score - a.open.score;
      return a.reach.minutes - b.reach.minutes;
    });
}

// ---- rendering ----

function addMessage(role, text) {
  const el = document.createElement("div");
  el.className = "msg " + role;
  el.textContent = text;
  thread.appendChild(el);
  thread.scrollTop = thread.scrollHeight;
  return el;
}

function addTyping() {
  const el = document.createElement("div");
  el.className = "msg assistant";
  el.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
  thread.appendChild(el);
  thread.scrollTop = thread.scrollHeight;
  return el;
}

function summarize(parsed, results, originCoords) {
  if (!results.length) return "I couldn't find anything nearby in the current dataset — try a different neighborhood.";
  const usedFallback = !results[0].reach.feasible;
  const best = results[0];
  const modeLabel = { car: "by car", walk: "on foot", transit: "by bus", no_car: "by bus/on foot", unknown: "" }[parsed.mode] || "";
  const openPart = best.open.score >= 90 ? "open now" : best.open.label.toLowerCase();
  const prefix = usedFallback
    ? "Nothing's a clean match right now, but here's the closest option — "
    : `${results.filter((r) => r.reach.feasible).length} place${results.length === 1 ? "" : "s"} you can realistically reach today. `;
  return `${prefix}${best.site.name} is your best bet — ${openPart}, about ${best.reach.minutes} min ${modeLabel}.`;
}

function renderResults(results) {
  const wrap = document.createElement("div");
  wrap.className = "results";
  results.forEach((r) => wrap.appendChild(renderCard(r)));
  thread.appendChild(wrap);
  thread.scrollTop = thread.scrollHeight;
}

function renderCard(r) {
  const { site, reach, open } = r;
  const card = document.createElement("div");
  card.className = "card";

  const badgeClass = open.score >= 90 ? "good" : open.score >= 60 ? "warn" : open.score >= 30 ? "warn" : "bad";
  const typeLabel = { pantry: "Pantry", grocer: "SNAP Grocer", mobile_market: "Mobile Market" }[site.type] || site.type;

  card.innerHTML = `
    <div class="card-top">
      <div>
        <div class="card-name">${escapeHtml(site.name)}</div>
        <div class="card-type">${escapeHtml(typeLabel)}${site.snap_accepted ? " · SNAP accepted" : ""}</div>
      </div>
      <span class="badge ${badgeClass}">${escapeHtml(open.label)}</span>
    </div>
    <div class="card-meta">
      <span><strong>${reach.minutes} min</strong> ${escapeHtml(reach.note)}</span>
      <span>${escapeHtml(site.address)}, ${escapeHtml(site.town)}</span>
      ${site.phone ? `<span>${escapeHtml(site.phone)}</span>` : ""}
    </div>
    ${site.notes ? `<div class="card-note">${escapeHtml(site.notes)}</div>` : ""}
  `;
  return card;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
