const RAILS_KEY = "tipcash.alex.rails";
const HOUSE_KEY = "tipcash.oak.house";

const DEFAULT_RAILS = {
  venmo: { on: true, handle: "@alex-oak" },
  zelle: { on: true, dest: "Alex M. · bank ••••4412" },
  stripe: { on: true, dest: "Checking ·••••4412" },
};

const DEFAULT_HOUSE = {
  payMode: "servers",
  bookServers: true,
  showAppQr: true,
};

function loadRails() {
  try {
    const raw = localStorage.getItem(RAILS_KEY);
    if (!raw) return { ...DEFAULT_RAILS };
    return { ...DEFAULT_RAILS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_RAILS };
  }
}

function saveRails(next) {
  localStorage.setItem(RAILS_KEY, JSON.stringify(next));
}

function loadHouse() {
  try {
    const raw = localStorage.getItem(HOUSE_KEY);
    if (!raw) return { ...DEFAULT_HOUSE };
    return { ...DEFAULT_HOUSE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_HOUSE };
  }
}

function saveHouse(next) {
  localStorage.setItem(HOUSE_KEY, JSON.stringify(next));
}

function stripeFee(amount) {
  return Math.round((Number(amount) * 0.029 + 0.3) * 100) / 100;
}

function connectPath(method, amount, rails) {
  const tip = Math.max(0, Number(amount) || 0);
  const linked = rails || loadRails();
  if (method === "venmo" && linked.venmo.on) {
    return {
      method: "Venmo",
      rail: "money-app",
      fee: 0,
      dest: "Venmo " + linked.venmo.handle,
      hops: ["Guest taps Venmo", "TipCash opens Venmo pay to " + linked.venmo.handle, "Alex’s Venmo"],
      note: "Peer-to-peer. No TipCash cut. Venmo’s own rules apply.",
      net: tip,
    };
  }
  if (method === "zelle" && linked.zelle.on) {
    return {
      method: "Zelle",
      rail: "money-app",
      fee: 0,
      dest: "Zelle · " + linked.zelle.dest,
      hops: ["Guest taps Zelle", "TipCash shows Alex’s Zelle name", "Guest bank → Alex’s bank"],
      note: "Bank-to-bank. No TipCash cut. Guest confirms in their own bank app.",
      net: tip,
    };
  }
  const fee = stripeFee(tip);
  return {
    method: method === "apple" ? "Apple Pay" : "Card",
    rail: "stripe",
    fee,
    dest: "Stripe → " + linked.stripe.dest,
    hops: ["Guest taps " + (method === "apple" ? "Apple Pay" : "card"), "Stripe charges the tip", "Fee " + fee.toFixed(2) + " then payout to Alex’s bank"],
    note: "Card / Apple Pay cannot hit Venmo or Zelle directly. Stripe takes ~2.9% + $0.30 from the tip, not the house check.",
    net: Math.max(0, Math.round((tip - fee) * 100) / 100),
  };
}

function availableGuestMethods(rails) {
  const linked = rails || loadRails();
  const methods = [];
  if (linked.venmo.on) methods.push({ id: "venmo", label: "Venmo", fee: false });
  if (linked.zelle.on) methods.push({ id: "zelle", label: "Zelle", fee: false });
  if (linked.stripe.on) {
    methods.push({ id: "apple", label: "Apple Pay", fee: true });
    methods.push({ id: "card", label: "Card", fee: true });
  }
  return methods;
}

function houseAllowsAppQr() {
  return !!loadHouse().showAppQr;
}

function shouldShowMoneyQr(method) {
  if (!houseAllowsAppQr()) return false;
  const rails = loadRails();
  if (method === "venmo") return !!rails.venmo.on;
  if (method === "zelle") return !!rails.zelle.on;
  return false;
}

function moneyQrPayload(method, amount) {
  const rails = loadRails();
  const tip = Math.max(0, Number(amount) || 0).toFixed(2);
  if (method === "venmo") {
    return "venmo://paycharge?txn=pay&recipients=" + encodeURIComponent((rails.venmo.handle || "").replace(/^@/, "")) + "&amount=" + tip + "&note=" + encodeURIComponent("Oak & Vine tip · Alex");
  }
  if (method === "zelle") {
    return "Zelle pay " + rails.zelle.dest + " · $" + tip + " · Oak & Vine · Alex";
  }
  return "TipCash $" + tip;
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function drawMoneyQr(canvas, payload) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const n = 25;
  const size = canvas.width;
  const cell = size / n;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  const seed = hashStr(String(payload || "tipcash"));
  function dark(x, y) {
    return (hashStr(payload + ":" + x + "," + y + ":" + seed) & 7) < 4;
  }
  function finder(ox, oy) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        ctx.fillStyle = edge || inner ? "#1c1712" : "#ffffff";
        ctx.fillRect((ox + x) * cell, (oy + y) * cell, Math.ceil(cell), Math.ceil(cell));
      }
    }
  }
  ctx.fillStyle = "#1c1712";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const inFinder = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
      if (inFinder) continue;
      if (dark(x, y)) ctx.fillRect(x * cell, y * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);
}
