const menu = [
  { id: "tiramisu", name: "Tiramisu", note: "Kitchen can still fire this", price: 12 },
  { id: "espresso", name: "Espresso martini", note: "House favorite", price: 14 },
  { id: "olives", name: "Warm olives + bread", note: "Shareable", price: 9 },
];

const state = { step: "menu", picked: [], tip: 12, custom: "", member: false, book: null };

function addon() {
  return menu.filter((i) => state.picked.includes(i.id)).reduce((s, i) => s + i.price, 0);
}
function tipAmt() {
  return state.custom ? Number(state.custom) || 0 : state.tip;
}
function offerPct() {
  return tipAmt() >= 10 || state.picked.length ? 8 : 5;
}

function render() {
  const root = document.getElementById("flow");
  if (state.step === "menu") {
    root.innerHTML = `
      <div class="who">Alex · Patio</div>
      <h2>Still available tonight</h2>
      <p class="muted">Limited on purpose. The house 86s anything the kitchen cannot fire.</p>
      <div class="list">${menu
        .map(
          (i) => `<button class="menu-item ${state.picked.includes(i.id) ? "on" : ""}" data-id="${i.id}">
            <span><b>${i.name}</b><div class="muted">${i.note}</div></span>$${i.price}
          </button>`
        )
        .join("")}</div>
      <button class="btn btn-solid btn-lg" style="margin-top:14px" id="toTip">Continue to tip Alex</button>`;
    root.querySelectorAll(".menu-item").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        state.picked = state.picked.includes(id) ? state.picked.filter((x) => x !== id) : [...state.picked, id];
        render();
      };
    });
    document.getElementById("toTip").onclick = () => {
      state.step = "tip";
      render();
    };
  } else if (state.step === "tip") {
    root.innerHTML = `
      <div class="who">Direct to the server</div>
      <h2>How should they be thanked?</h2>
      <div class="tips">${[5, 8, 12, 20]
        .map((n) => `<button class="tip-btn ${!state.custom && state.tip === n ? "on" : ""}" data-n="${n}">$${n}</button>`)
        .join("")}</div>
      <input class="field" id="custom" placeholder="Custom amount" value="${state.custom}" />
      <p class="muted">Add-ons $${addon()} · Tip $${tipAmt()} · Guest pays processing on the tip</p>
      <button class="btn btn-copper btn-lg" id="pay">Pay · Apple Pay</button>`;
    root.querySelectorAll(".tip-btn").forEach((btn) => {
      btn.onclick = () => {
        state.tip = Number(btn.dataset.n);
        state.custom = "";
        render();
      };
    });
    document.getElementById("custom").oninput = (e) => {
      state.custom = e.target.value;
      paintAside();
    };
    document.getElementById("pay").onclick = () => {
      state.step = "done";
      render();
    };
  } else {
    root.innerHTML = `
      <div class="banner"><small>You’re in</small><strong>${offerPct()}% off your next visit</strong>Use by Tuesday · min $25 · code ALEX-8F2</div>
      <p>Alex gets the tip. The house gets a guest who already plans to come back.</p>
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
      min.setHours(0,0,0,0);
      if (!when) { err.textContent = "Pick a night at least 2 days out."; return; }
      if (new Date(when + "T12:00:00") < min) { err.textContent = "2 days’ notice required."; return; }
      if (party < 2) { err.textContent = "Minimum party of 2."; return; }
      const day = new Date(when + "T12:00:00").getDay();
      const weekend = day === 0 || day === 6;
      state.book = { party, when, note: weekend ? "Weekend request — house may decline." : "Weeknight request." };
      render();
    };
    document.getElementById("reset").onclick = () => {
      state.step = "menu";
      state.picked = [];
      state.tip = 12;
      state.custom = "";
      state.member = false;
      state.book = null;
      render();
    };
  }
  paintAside();
}

function paintAside() {
  document.getElementById("addon").textContent = "$" + addon();
  document.getElementById("take").textContent = "$" + tipAmt();
  document.getElementById("offer").textContent = offerPct() + "% / 5 days";
}

render();
