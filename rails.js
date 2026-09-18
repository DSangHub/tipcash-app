const RAILS_KEY = "tipcash.alex.rails";

const DEFAULT_RAILS = {
  venmo: { on: true, handle: "@alex-oak" },
  zelle: { on: true, dest: "Alex M. · bank ••••4412" },
  stripe: { on: true, dest: "Checking ·••••4412" },
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
