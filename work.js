const GEO_KEY = "tipcash.geo";
const WORKERS_KEY = "tipcash.workers";
const EATERY_KEY = "tipcash.eatery";
const INTERESTS_KEY = "tipcash.interests";

const DEFAULT_GEO = { zip: "95814", label: "Sacramento" };

const DEMO_WORKERS = [
  { id: "demo-alex", name: "Alex M.", zip: "95814", available: true, demo: true },
  { id: "demo-jordan", name: "Jordan K.", zip: "95816", available: true, demo: true },
  { id: "demo-sam", name: "Sam R.", zip: "95811", available: true, demo: true },
  { id: "demo-lee", name: "Lee P.", zip: "95691", available: false, demo: true },
];

function loadGeo() {
  try {
    const raw = localStorage.getItem(GEO_KEY);
    if (!raw) return { ...DEFAULT_GEO };
    return { ...DEFAULT_GEO, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_GEO };
  }
}

function saveGeo(next) {
  localStorage.setItem(GEO_KEY, JSON.stringify(next));
}

function loadWorkers() {
  try {
    const raw = localStorage.getItem(WORKERS_KEY);
    const mine = raw ? JSON.parse(raw) : [];
    return [...DEMO_WORKERS, ...mine];
  } catch {
    return [...DEMO_WORKERS];
  }
}

function saveMyWorker(profile) {
  const mine = [profile];
  localStorage.setItem(WORKERS_KEY, JSON.stringify(mine));
}

function loadMyWorker() {
  try {
    const raw = localStorage.getItem(WORKERS_KEY);
    const mine = raw ? JSON.parse(raw) : [];
    return mine[0] || null;
  } catch {
    return null;
  }
}

function loadEatery() {
  try {
    const raw = localStorage.getItem(EATERY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveEatery(next) {
  localStorage.setItem(EATERY_KEY, JSON.stringify(next));
}

function loadInterests() {
  try {
    const raw = localStorage.getItem(INTERESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInterest(entry) {
  const all = loadInterests();
  all.unshift(entry);
  localStorage.setItem(INTERESTS_KEY, JSON.stringify(all.slice(0, 40)));
}

function nearbyZip(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  return String(a).slice(0, 3) === String(b).slice(0, 3);
}

function availableNear(zip) {
  return loadWorkers().filter((w) => w.available && nearbyZip(w.zip, zip));
}

function paintGeoBadge() {
  const badge = document.getElementById("geoBadge");
  if (!badge) return;
  const geo = loadGeo();
  badge.textContent = "📍 " + geo.zip;
  badge.title = geo.label + " · click to set your zip";
}

function bindGeoBadge() {
  const badge = document.getElementById("geoBadge");
  if (!badge) return;
  paintGeoBadge();
  let panel = null;
  badge.onclick = (e) => {
    e.stopPropagation();
    if (panel) { panel.remove(); panel = null; return; }
    const geo = loadGeo();
    panel = document.createElement("div");
    panel.className = "geo-panel";
    panel.innerHTML = `<div class="who">Your location</div><p class="muted" style="margin:6px 0 8px">Zip only. Used to show workers available near you. No street address is stored.</p><input class="field" id="geoZip" inputmode="numeric" maxlength="5" placeholder="Zip code" value="${geo.zip}" /><input class="field" id="geoLabel" placeholder="City (optional)" value="${geo.label}" /><button class="btn btn-solid" style="width:100%" id="geoSave">Save location</button><p class="muted" id="geoNote" style="margin-top:8px"></p>`;
    badge.parentElement.appendChild(panel);
    document.getElementById("geoSave").onclick = () => {
      const zip = (document.getElementById("geoZip").value || "").replace(/\D/g, "").slice(0, 5);
      const label = document.getElementById("geoLabel").value.trim() || "Near you";
      if (zip.length !== 5) { document.getElementById("geoNote").textContent = "Enter a 5-digit zip."; return; }
      saveGeo({ zip, label });
      paintGeoBadge();
      panel.remove();
      panel = null;
      document.dispatchEvent(new CustomEvent("tipcash-geo"));
    };
  };
  document.addEventListener("click", () => { if (panel) { panel.remove(); panel = null; } });
}

document.addEventListener("DOMContentLoaded", () => { bindGeoBadge(); });
