const menu = [
  { id: "tiramisu", name: "Tiramisu", note: "Kitchen can still fire this", price: 12 },
  { id: "espresso", name: "Espresso martini", note: "House favorite", price: 14 },
  { id: "olives", name: "Warm olives + bread", note: "Shareable", price: 9 },
];

const state = { step: "menu", picked: [], tip: 12, custom: "", member: false };

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
      <button class="btn" style="margin-top:10px" id="reset">Reset demo</button>`;
    const join = document.getElementById("join");
    if (join) join.onclick = () => { state.member = true; render(); };
    document.getElementById("reset").onclick = () => {
      state.step = "menu";
      state.picked = [];
      state.tip = 12;
      state.custom = "";
      state.member = false;
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
