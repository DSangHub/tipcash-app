const menu = [
  { id: "tiramisu", name: "Tiramisu", note: "Kitchen can still fire this", price: 12 },
  { id: "espresso", name: "Espresso martini", note: "House favorite", price: 14 },
  { id: "olives", name: "Warm olives + bread", note: "Shareable", price: 9 },
];

const state = {
  step: "pay",
  picked: [],
  tip: 12,
  custom: "",
  method: "apple",
  member: false,
  book: null,
  showMenu: false,
};

function addon() {
  return menu.filter((i) => state.picked.includes(i.id)).reduce((s, i) => s + i.price, 0);
}
function tipAmt() {
  return state.custom ? Number(state.custom) || 0 : state.tip;
}
function offerPct() {
  return tipAmt() >= 10 || state.picked.length ? 8 : 5;
}
function methodLabel() {
  return { apple: "Apple Pay", venmo: "Venmo", card: "Card" }[state.method];
}

function render() {
  const root = document.getElementById("flow");
  if (state.step === "pay") {
    root.innerHTML = `
      <div class="who">Alex · Patio · 8 seconds</div>
      <h2>Tip Alex. One tap.</h2>
      <p class="muted">No app to download. House check stays on the official bill.</p>
      <div class="tips">${[5, 8, 12, 20]
        .map((n) => `<button class="tip-btn ${!state.custom && state.tip === n ? "on" : ""}" data-n="${n}">$${n}</button>`)
        .join("")}</div>
      <input class="field" id="custom" inputmode="decimal" placeholder="Other amount" value="${state.custom}" />
      <p class="muted">Tip $${tipAmt()}${addon() ? " · extras $" + addon() : ""} · guest covers the small processing fee</p>
      <div class="who" style="margin-top:12px">Pay how you already pay</div>
      <div class="pay-methods">
        <button class="tip-btn ${state.method === "apple" ? "on" : ""}" data-m="apple">Apple Pay</button>
        <button class="tip-btn ${state.method === "venmo" ? "on" : ""}" data-m="venmo">Venmo</button>
        <button class="tip-btn ${state.method === "card" ? "on" : ""}" data-m="card">Card</button>
      </div>
      <button class="btn btn-copper btn-lg" style="margin-top:14px;width:100%" id="pay">Send $${tipAmt()} · ${methodLabel()}</button>
      <button class="btn" style="margin-top:8px;width:100%" id="toggleMenu">${state.showMenu ? "Hide extras" : "Add a last plate (optional)"}</button>
      ${
        state.showMenu
          ? `<div class="list" style="margin-top:10px">${menu
              .map(
                (i) => `<button class="menu-item ${state.picked.includes(i.id) ? "on" : ""}" data-id="${i.id}">
                  <span><b>${i.name}</b><div class="muted">${i.note}</div></span>$${i.price}
                </button>`
              )
              .join("")}</div>`
          : ""
      }`;
    root.querySelectorAll(".tip-btn[data-n]").forEach((btn) => {
      btn.onclick = () => {
        state.tip = Number(btn.dataset.n);
        state.custom = "";
        render();
      };
    });
    root.querySelectorAll(".tip-btn[data-m]").forEach((btn) => {
      btn.onclick = () => {
        state.method = btn.dataset.m;
        render();
      };
    });
    document.getElementById("custom").oninput = (e) => {
      state.custom = e.target.value;
      paintAside();
      const pay = document.getElementById("pay");
      pay.textContent = "Send $" + tipAmt() + " · " + methodLabel();
    };
    document.getElementById("toggleMenu").onclick = () => {
      state.showMenu = !state.showMenu;
      render();
    };
    root.querySelectorAll(".menu-item").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        state.picked = state.picked.includes(id) ? state.picked.filter((x) => x !== id) : [...state.picked, id];
        render();
      };
    });
    document.getElementById("pay").onclick = () => {
      if (tipAmt() <= 0 && addon() <= 0) return;
      state.step = "done";
      render();
    };
  } else {
    root.innerHTML = `
      <div class="banner"><small>Paid in one tap · ${methodLabel()}</small><strong>$${tipAmt()} to Alex</strong>${addon() ? "Plus extras $" + addon() + ". " : ""}${offerPct()}% off your next visit · use by Tuesday · min $25 · code ALEX-8F2</div>
      <p>Alex is paid. You did not open an app or wait on a check presenter.</p>
      ${
        state.member
          ? `<div class="card" style="background:#eaf3ee"><b>Member saved.</b><p class="muted">Next house that has not allowed TipCash can be asked once: “Do you allow TipCash to pay your servers?”</p></div>`
          : `<button class="btn btn-solid btn-lg" id="join">Save as a TipCash member</button>`
      }
      ${
        state.book
          ? `<div class="card" style="margin-top:12px;background:#eaf3ee" id="book"><b>Request sent to book Alex.</b><p class="muted">${state.book.party} guests · ${state.book.when}. 2 days’ notice. Not guaranteed on busy hours or weekends.</p></div>`
          : `<div class="card" style="margin-top:12px" id="book">
              <div class="who">Next visit</div>
              <h2>Book a table is convenient. For excellent service, book a server.</h2>
              <p class="muted">Ask for Alex again. The house can still say no if the floor is slammed.</p>
              <label class="muted" for="when">Night (2 days out or later)</label>
              <input class="field" id="when" type="date" />
              <label class="muted" for="party">Party size</label>
              <select class="field" id="party">
                <option value="1">1 — too small</option>
                <option value="2" selected>2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="6">6</option>
              </select>
              <button class="btn btn-copper btn-lg" id="bookBtn">Request Alex</button>
              <p class="muted" id="bookErr"></p>
            </div>`
      }
      <button class="btn" style="margin-top:10px" id="reset">Reset demo</button>`;
    const join = document.getElementById("join");
    if (join) join.onclick = () => { state.member = true; render(); };
    const bookBtn = document.getElementById("bookBtn");
    if (bookBtn) bookBtn.onclick = () => {
      const party = Number(document.getElementById("party").value);
      const when = document.getElementById("when").value;
      const err = document.getElementById("bookErr");
      const min = new Date();
      min.setDate(min.getDate() + 2);
      min.setHours(0, 0, 0, 0);
      if (!when) { err.textContent = "Pick a night at least 2 days out."; return; }
      if (new Date(when + "T12:00:00") < min) { err.textContent = "2 days’ notice required."; return; }
      if (party < 2) { err.textContent = "Minimum party of 2."; return; }
      const day = new Date(when + "T12:00:00").getDay();
      const weekend = day === 0 || day === 6;
      state.book = { party, when, note: weekend ? "Weekend request — house may decline." : "Weeknight request." };
      render();
    };
    document.getElementById("reset").onclick = () => {
      state.step = "pay";
      state.picked = [];
      state.tip = 12;
      state.custom = "";
      state.method = "apple";
      state.member = false;
      state.book = null;
      state.showMenu = false;
      render();
    };
  }
  paintAside();
}

function paintAside() {
  document.getElementById("addon").textContent = "$" + addon();
  document.getElementById("take").textContent = "$" + tipAmt();
  document.getElementById("offer").textContent = offerPct() + "% / 5 days";
  const method = document.getElementById("methodOut");
  if (method) method.textContent = methodLabel();
}

render();
