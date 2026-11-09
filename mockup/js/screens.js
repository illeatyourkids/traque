import { SAMPLE, AIS, TRADES, GOALS, ASKS, askById, understand, TOOLS, PAY, RECOMMENDED, company } from "./state.js";
import { esc, status, note, btn, link, field, choice, row, switchCtl, action, toast, copyText, simulate } from "./ui.js";

const STARTER = `Add Traque in your AI's settings, allow it, then say "set up Traque for my business".`;

// Setup is seven steps on Solo, eight on Company (company services is Company-only).
// Order: business review first, then calendar (on its own, not through Zapier), then the phone, then "build the rest" with Zapier.
export const SETUP = (s) => company() ? ["ai", "business", "goal", "calendar", "phone", "other", "team", "services"] : ["ai", "business", "goal", "calendar", "phone", "other", "team"];

/* The company’s one Zapier account. Shown under Company services and More › Company connections.
   The key field is a masked placeholder; the typed value is never stored, only that one was saved. */
export function zapierKey(s) {
  const z = s.coZap;
  return `<section class="stack-sm">
    <div class="row row--plain"><span class="row__body"><span class="row__title">Your company’s Zapier</span><span class="row__sub">One account for the whole team. They use it without ever seeing the key.</span></span><span class="row__end">${status(z.state)}</span></div>
    ${z.saved
      ? note("green", `<strong>Key saved and checked.</strong> Everyone on the team connects through it now. ${btn("Replace the key", "zapreplace", { kind: "btn--quiet btn--sm" })}`)
      : `<div class="prefix"><input class="input mono" id="zap-key" type="password" autocomplete="off" aria-label="Zapier key" placeholder="••••••••••••••••" style="flex: 1 1 8rem">${btn("Save", "zapsave", { kind: "btn--sm", attrs: 'data-for="zap-key"' })}</div>
         <p class="small muted">Paste the key from your Zapier account. We check it once, then keep it locked away. ${btn("Don’t have Zapier? Get an account", "zapget", { kind: "btn--quiet btn--sm" })}</p>`}
  </section>`;
}
export const zapierKeyActions = {
  async zapsave(s, el) {
    const input = document.getElementById(el.dataset.for);
    if (!input || !input.value.trim()) { toast("Paste your Zapier key first."); return false; }
    input.value = "";
    await simulate(el, 1100);
    s.coZap = { saved: true, state: "connected" };
    toast("Key checked with Zapier. The team can use it now.");
  },
  zapreplace(s) { s.coZap = { saved: false, state: "not-connected" }; if (s.zap.stage === "connected") s.zap.stage = "review"; },
  zapget() { toast("Would open zapier.com to make an account. Not in this sample."); return false; },
};
export function stepOf(s, id) { const list = SETUP(s); const i = list.indexOf(id); return i < 0 ? null : { n: i + 1, of: list.length, prev: list[i - 1], next: list[i + 1] || "done" }; }

// Steps that happen inside the owner's AI chat. They have no Back link: in a chat you just say "go back".
export const IN_AI = ["business", "goal", "calendar", "other"];
function head(s, id, title, lead) {
  const st = stepOf(s, id); const inAI = IN_AI.includes(id);
  return `<div class="head">
    ${st ? `${inAI ? "" : `<a class="back" href="#/${st.prev || "welcome"}">‹ Back</a>`}<span class="stepcount">Step ${st.n} of ${st.of}</span>` : `<a class="back" href="#/done">‹ Back</a>`}
    <h1>${title}</h1>${lead ? `<p>${lead}</p>` : ""}
  </div>`;
}
const next = (s, id) => `#/${stepOf(s, id)?.next || "done"}`;

/* ---------- 0 · Welcome ---------- */
export const welcome = {
  id: "welcome", title: "Welcome", addr: "traque.com", where: "web",
  render(s) {
    return `<div class="home">
      <section class="hero">
        <h1>Miss a call on a job. Traque texts them back.</h1>
        <div class="hero__side">
          <p>In your words, from your own number. Set up by talking to the AI you already use.</p>
          <div class="hero__cta">${link("Get started", "#/ai", "btn btn--primary")}<span class="small muted">Nothing goes out until you send yourself a test.</span></div>
        </div>
      </section>
      <section class="hsec"><h2>How it works</h2>
        <ol class="steps"><li><span class="n">1</span>Pick your AI and tell it about your business.</li><li><span class="n">2</span>Connect your calendar and phone. Send yourself a test.</li><li><span class="n">3</span>Say what else you want built. Zapier connects it.</li><li><span class="n">4</span>Add your team if you have one.</li></ol>
      </section>
      <section class="hsec" id="plans"><h2>Two plans</h2>
        <div class="plans">
          <div class="plan ${s.plan === "solo" ? "plan--pick" : ""}"><h3>Solo</h3><p class="small">Just you and your phone.</p><div class="plan__price">$ — <small>a month · price not set</small></div>${btn(s.plan === "solo" ? "Selected" : "Choose Solo", "plan", { kind: "btn--sm", attrs: 'data-plan="solo"', disabled: s.plan === "solo" })}</div>
          <div class="plan ${s.plan === "company" ? "plan--pick" : ""}"><h3>Company</h3><p class="small">You and the people who answer with you. Less per person.</p><div class="plan__price">$ — <small>a month · price not set</small></div>${btn(s.plan === "company" ? "Selected" : "Choose Company", "plan", { kind: "btn--sm btn--primary", attrs: 'data-plan="company"', disabled: s.plan === "company" })}</div>
        </div>
      </section>
      <footer class="foot"><span>Traque</span><span>${esc(SAMPLE.town)}</span><a href="#/directory">Find a pro</a><span>Sample data. Nothing is sent.</span></footer>
    </div>`;
  },
  actions: { plan(s, el) { s.plan = el.dataset.plan; s.biz.team = s.plan === "company"; } },
};

/* ---------- 1 · Pick your AI ---------- */
export const ai = {
  id: "ai", title: "Pick your AI", addr: "traque.com/start", where: "web",
  render(s) {
    const st = s.aiState;
    return `<div class="screen">
      ${head(s, "ai", "Pick your AI", "Traque works inside the AI you already use.")}
      <div class="choices" role="radiogroup" aria-label="Your AI">${Object.entries(AIS).map(([k, n]) => choice(n, "", { action: "pick", attrs: `data-ai="${k}"`, on: s.ai === k })).join("")}</div>
      <div class="stack" style="margin-top: var(--space-xl)">
        <div class="row row--plain"><span class="row__body"><span class="row__title">Traque in ${esc(AIS[s.ai])}</span></span><span class="row__end">${status(st)}</span></div>
        ${st === "waiting" ? note("amber", `<strong>Waiting on you.</strong> ${esc(AIS[s.ai])} opened. Approve Traque there, then come back and press <strong>Check</strong>.`) : ""}
        ${st === "connected" ? note("green", `<strong>Connected.</strong> ${esc(AIS[s.ai])} can talk to Traque now.`) : ""}
        <p class="linkline muted">Can’t open it from here? ${btn("Copy the starter message", "copy", { kind: "btn--quiet btn--sm" })}</p>
      </div>
      ${st === "connected" ? action(link("Next", next(s, "ai"), "btn btn--primary"))
        : st === "waiting" ? action(btn("Check", "check", { kind: "btn--primary" }), "", `<a class="linkline" href="${next(s, "ai")}">Skip for now</a>`)
        : action(btn(`Open in ${esc(AIS[s.ai])}`, "open", { kind: "btn--primary" }), "Opening it doesn’t connect anything. You approve it there.")}
    </div>`;
  },
  actions: {
    pick(s, el) { s.ai = el.dataset.ai; s.aiState = "not-connected"; },
    async open(s, el) { await simulate(el, 600); s.aiState = "waiting"; },
    async check(s, el) { await simulate(el, 900); s.aiState = "connected"; },
    async copy(s, el) { await copyText(STARTER, el); return false; },
  },
};

/* ---------- 2 · Tell us your business ---------- */
export const business = {
  id: "business", title: "Tell us your business", where: "ai", chat: { you: "Set up Traque for my business.", say: "Glad to. A few quick things about the shop first." },
  render(s) {
    const b = s.biz;
    return `<div class="screen">
      ${head(s, "business", "Tell us your business", "Short answers are fine.")}
      <div class="stack">
        ${field("Business name", `<input class="input" id="bz-name" data-bind="biz.name" value="${esc(b.name)}" autocomplete="organization">`, "", "bz-name")}
        ${field("What you do", `<select class="select" id="bz-trade" data-bind="biz.trade">${TRADES.map(t => `<option ${b.trade === t ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`, "", "bz-trade")}
        ${field("Town", `<input class="input" id="bz-town" data-bind="biz.town" value="${esc(b.town)}" autocomplete="address-level2">`, "", "bz-town")}
        <div class="field"><span class="field__label">Who answers calls and texts?</span>
          <div class="choices">${choice("Just me", "", { action: "team", attrs: 'data-v="0"', on: !b.team })}${choice("Me and other people", b.team ? `${b.count} other${b.count === 1 ? "" : "s"}` : "", { action: "team", attrs: 'data-v="1"', on: b.team })}</div>
          ${b.team ? `<input class="range" type="range" min="1" max="10" aria-label="How many others" data-bind="biz.count" data-type="number" data-rerender value="${b.count}">` : ""}
          <div class="field__help">${b.team && s.plan === "solo" ? `Other people answering fits the <strong>Company</strong> plan. ${btn("Switch to Company", "company", { kind: "btn--quiet btn--sm" })}` : b.team ? "You’re on Company. Each of them gets their own sign-in." : "You’re on Solo."}</div>
        </div>
      </div>
      ${action(link("Next", next(s, "business"), "btn btn--primary"), "You can change any of this later.")}
    </div>`;
  },
  actions: {
    team(s, el) { s.biz.team = el.dataset.v === "1"; },
    company(s) { s.plan = "company"; },
  },
};

/* ---------- 3 · Why you’re using Traque ---------- */
export const goal = {
  id: "goal", title: "What you want it to do", where: "ai", chat: { you: "That’s the shop.", say: "Saved. Now, what should Traque do for you?" },
  render(s) {
    const g = s.goal;
    return `<div class="screen">
      ${head(s, "goal", "What do you want Traque to do?", "Pick what fits. Add your own words if you like.")}
      <div class="choices">${GOALS.map(x => choice(x, "", { action: "pick", attrs: `data-g="${esc(x)}"`, on: g.picks.includes(x) })).join("")}</div>
      <div class="stack" style="margin-top: var(--space-xl)">
        ${field("Anything else?", `<textarea class="textarea" id="g-text" data-bind="goal.text" rows="2" placeholder="In your own words">${esc(g.text)}</textarea>`, "", "g-text")}
        ${field("What should it text when you can’t answer?", `<textarea class="textarea" id="g-reply" data-bind="goal.reply" rows="3">${esc(g.reply)}</textarea>`, `Sent after <strong>${g.wait} minutes</strong> with no answer from you.`, "g-reply")}
        <input class="range" type="range" min="2" max="30" step="1" aria-label="Minutes to wait" data-bind="goal.wait" data-type="number" data-rerender value="${g.wait}">
        ${switchCtl("Also text back when I miss a call", "goal.missed", g.missed)}
      </div>
      ${action(link("Next", next(s, "goal"), "btn btn--primary"), "Nothing is sent until you test it on your phone.")}
    </div>`;
  },
  actions: { pick(s, el) { const g = el.dataset.g; const i = s.goal.picks.indexOf(g); if (i >= 0) s.goal.picks.splice(i, 1); else s.goal.picks.push(g); } },
};

/* ---------- 4 · Connect your calendar ---------- */
export const calendar = {
  id: "calendar", title: "Connect your calendar", where: "ai", chat: { you: "Next.", say: "Let’s connect your calendar, so I know when you’re booked. You sign in with Google or Outlook in a new tab; I only read it." },
  render(s) {
    const c = s.cal; const name = c.kind === "google" ? "Google Calendar" : "Outlook calendar";
    return `<div class="screen">
      ${head(s, "calendar", "Connect your calendar", "So Traque knows when you’re booked. It only reads. It never adds or moves anything.")}
      <div class="choices" role="radiogroup" aria-label="Which calendar">${choice("Google", "", { action: "kind", attrs: 'data-k="google"', on: c.kind === "google" })}${choice("Outlook", "", { action: "kind", attrs: 'data-k="outlook"', on: c.kind === "outlook" })}</div>
      <div class="stack" style="margin-top: var(--space-xl)">
        <div class="row row--plain"><span class="row__body"><span class="row__title">${esc(name)}</span></span><span class="row__end">${status(c.state)}</span></div>
        ${c.state === "waiting" ? note("amber", `<strong>Waiting on you.</strong> ${esc(name)} opened in a new tab (sample). Say yes there, then come back and press <strong>Check</strong>.`) : ""}
        ${c.state === "connected" ? note("green", `<strong>Connected.</strong> Traque can see when you’re busy. Checked just now.`) : ""}
      </div>
      ${c.state === "connected" ? action(link("Next", next(s, "calendar"), "btn btn--primary"), "", btn("Disconnect", "off", { kind: "btn--quiet btn--sm" }))
        : c.state === "waiting" ? action(btn("Check", "check", { kind: "btn--primary" }), "It says Connected only once our check works.", `<a class="linkline" href="${next(s, "calendar")}">Do this later</a>`)
        : action(btn(`Connect ${c.kind === "google" ? "Google" : "Outlook"}`, "on", { kind: "btn--primary" }), "You sign in with them, not with us.", `<a class="linkline" href="${next(s, "calendar")}">Do this later</a>`)}
    </div>`;
  },
  actions: {
    kind(s, el) { s.cal.kind = el.dataset.k; s.cal.state = "not-connected"; },
    async on(s, el) { await simulate(el, 600); s.cal.state = "waiting"; },
    async check(s, el) { await simulate(el, 900); s.cal.state = "connected"; },
    off(s) { s.cal.state = "not-connected"; },
  },
};

/* ---------- 5 · Connect your phone ---------- */
export const phone = {
  id: "phone", title: "Connect your phone", addr: "Traque app · Android (or the Mac helper for iPhone)", where: "phone",
  render(s) {
    const p = s.phone; const android = p.device === "android";
    const steps = android
      ? [["Install the Traque app", "From the Play Store, on this phone."], ["Allow texts and calls", "Android asks twice. Say yes both times."], ["Pair it", p.step >= 2 ? `Type this code in the app: <span class="code">${SAMPLE.phone.slice(-4)}‑7</span>` : "You’ll get a short code to type in."], ["Send yourself a test", "Traque texts your number. You’ll see it arrive."]]
      : [["Install the helper on your Mac", "iPhone needs a Mac that stays on. Still testing."], ["Allow Messages", "On the Mac, in System Settings."], ["Pair it", p.step >= 2 ? `Type this code in the helper: <span class="code">${SAMPLE.phone.slice(-4)}‑7</span>` : "You’ll get a short code to type in."], ["Send yourself a test", "Traque texts your number. You’ll see it arrive."]];
    const labels = android ? ["I installed it", "I allowed it", "Check pairing", "Send a test text"] : ["I installed it", "I allowed it", "Check pairing", "Send a test text"];
    const stateRow = `<div class="row row--plain"><span class="row__body"><span class="row__title">Your phone · ${esc(SAMPLE.phone)}</span><span class="row__sub">Your number stays with your carrier.</span></span><span class="row__end">${status(p.tested ? "connected" : p.state === "connected" ? "waiting" : !android ? "testing" : p.state)}</span></div>`;
    return `<div class="screen">
      ${head(s, "phone", "Connect your phone", "Traque watches for missed work texts and calls on this phone.")}
      <div class="choices" role="radiogroup" aria-label="Which phone">${choice("Android", "", { action: "device", attrs: 'data-d="android"', on: android })}${choice("iPhone", "Needs a Mac. Still testing.", { action: "device", attrs: 'data-d="iphone"', on: !android })}</div>
      <div class="stack" style="margin-top: var(--space-xl)">
        ${stateRow}
        <ol class="steps">${steps.map(([t, sub], i) => `<li style="${i > p.step ? "opacity: .5" : ""}"><span class="n">${i < p.step || (i === 3 && p.tested) ? "✓" : i + 1}</span><span><strong>${t}</strong><br><span class="small muted">${sub}</span></span></li>`).join("")}</ol>
        ${p.tested ? note("green", `<strong>Got it.</strong> The test text arrived. Traque is on for ${esc(s.biz.name)}.`) : p.step === 3 ? note("", `This one real text goes to <strong>your</strong> number only.`) : ""}
      </div>
      ${p.tested ? action(link("Next", next(s, "phone"), "btn btn--primary"))
        : action(btn(labels[p.step], "step", { kind: "btn--primary" }), p.step === 2 ? "We check from our side. It only says Connected once the check passes." : "", `<a class="linkline" href="${next(s, "phone")}">Do this later</a>`)}
    </div>`;
  },
  actions: {
    device(s, el) { s.phone.device = el.dataset.d; s.phone.step = 0; s.phone.state = "not-connected"; s.phone.tested = false; },
    async step(s, el) {
      const p = s.phone;
      if (p.step === 2) { await simulate(el, 1100); p.state = "connected"; p.step = 3; return; }
      if (p.step === 3) { await simulate(el, 1300); p.tested = true; return; }
      await simulate(el, 500); p.step += 1;
    },
  },
};

/* ---------- 6 · Build the rest with Zapier ---------- */
const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const inText = (s, id) => { const a = askById(id); return !!a && s.zap.text.toLowerCase().includes(a.say.toLowerCase()); };
export const other = {
  id: "other", title: "Build the rest with Zapier", where: "ai", chat: { you: "Build the rest.", say: "Tell me what you want connected, in your own words. I’ll set it up through Zapier and read back exactly what it’s allowed to do before anything is on." },
  render(s) {
    const co = company(); const emp = co && s.view !== "owner"; const z = s.zap;
    const tab = !co && s.recTab === "company" ? "traque" : s.recTab;
    const coIds = co ? [...new Set(["jobber", ...TOOLS.map(t => t.id), ...s.coAdded])] : [];
    const coRecs = coIds.map(id => { const a = askById(id); if (!a) return null; const pay = s.tools[id]?.pay; return { id, name: a.name, sub: id === "jobber" ? "Your company already connected it." : !pay || pay === "suggest" ? "Your company suggests it. You pay." : pay === "match" ? "Your company matches what you spend." : "Your company pays up to a set amount." }; }).filter(Boolean);
    const mine = s.added.map(id => { const a = askById(id); return a && { id, name: a.name, sub: a.does }; }).filter(Boolean);
    const list = tab === "traque" ? RECOMMENDED : tab === "company" ? coRecs : mine;
    const addRow = (r) => { const on = inText(s, r.id); return `<div class="row"><span class="row__body"><span class="row__title">${esc(r.name)}</span><span class="row__sub">${esc(r.sub)}</span></span><span class="row__end">${on ? `${status("on", "In your words")}${btn("Take out", "unadd", { kind: "btn--quiet btn--sm", attrs: `data-id="${r.id}"` })}` : btn("Add", "add", { kind: "btn--sm", attrs: `data-id="${r.id}"` })}</span></div>`; };
    const got = understand(z.text);
    const zapState = co ? s.coZap.state : z.stage === "connected" ? "connected" : z.stage === "waiting" ? "waiting" : "not-connected";
    const zapRow = `<div class="row row--plain"><span class="row__body"><span class="row__title">${co ? "Uses your company’s Zapier" : "Zapier"}</span><span class="row__sub">${co ? "Nothing to sign in to. Your company set it up once." : "Zapier is what reaches your other apps. You sign in to it once."}</span></span><span class="row__end">${status(zapState)}</span></div>`;
    const summary = (done) => `<div class="stack-sm"><h2>${done ? "What it can do now" : "Here’s what it will be allowed to do"}</h2>
      <div class="rows">${got.map(a => `<div class="row"><span class="row__body"><span class="row__title">${esc(a.name)}</span><span class="row__sub">${esc(a.does)}</span></span><span class="row__end">${status(done ? "connected" : "not-connected", done ? "Connected" : "Not yet")}</span></div>`).join("")}</div>
      <p class="small muted">Nothing else. If it isn’t on this list, Traque can’t do it.</p></div>`;

    let body, act;
    if (z.stage === "edit") {
      body = `<div class="stack">
        ${field("What should Traque be able to do?", `<textarea class="textarea" id="zap-text" data-bind="zap.text" data-rerender rows="3" placeholder="Like: let it read new inquiries in my business email and text customers from Jobber.">${esc(z.text)}</textarea>`, "Plain words are fine. Traque and Zapier build it and read back what they understood before anything is allowed.", "zap-text")}
        ${zapRow}
      </div>
      <div class="stack-sm" style="margin-top: var(--space-xl)">
        <h2>Ideas, recommended by</h2>
        <div class="seg" role="tablist" aria-label="Recommended by">${[["traque", "Traque"], ...(co ? [["company", "Your company"]] : []), ["mine", `You${mine.length ? ` (${mine.length})` : ""}`]].map(([k, l]) => `<button type="button" role="tab" aria-selected="${tab === k}" class="seg__btn ${tab === k ? "is-active" : ""}" data-action="tab" data-tab="${k}">${l}</button>`).join("")}</div>
        <p class="small muted">${tab === "traque" ? "A short list for your trade. One tap adds it to your words above. Nothing is connected by adding." : tab === "company" ? `What ${esc(s.biz.name)} suggests or pays toward.` : "What you’ve added so far."}</p>
        <div class="rows">${list.length ? list.map(addRow).join("") : `<div class="row"><span class="row__body"><span class="row__sub">${tab === "mine" ? "Nothing yet. Add one from the other lists, or just type." : "Nothing here yet."}</span></span></div>`}</div>
      </div>`;
      act = action(btn("Build it", "build", { kind: "btn--primary", disabled: !z.text.trim() }), "", `<a class="linkline" href="${next(s, "other")}">Skip for now</a>`);
    } else if (z.stage === "review") {
      body = `<div class="stack">
        <div class="row row--plain"><span class="row__body"><span class="row__title">You said</span><span class="row__sub">“${esc(z.text)}”</span></span></div>
        ${got.length ? summary(false) : note("amber", "<strong>Traque didn’t catch an app in that.</strong> Name the app, like Jobber or QuickBooks, and try again.")}
        ${zapRow}
      </div>`;
      act = got.length ? action(btn("Looks right", "ok", { kind: "btn--primary" }), co ? "" : "Zapier opens next so you can allow it there.", btn("Change", "change", { kind: "btn--quiet btn--sm" })) : action(btn("Change", "change", { kind: "btn--primary" }));
    } else if (z.stage === "waiting") {
      body = `<div class="stack">
        ${summary(false)}
        ${zapRow}
        ${co ? note("amber", emp ? `<strong>Waiting on your company’s Zapier.</strong> Ask ${esc(SAMPLE.owner)} to add the key. This gets built as soon as it’s in.` : `<strong>Waiting on your company’s Zapier key.</strong> Add it once under Company services (step ${SETUP(s).indexOf("services") + 1}) or More › Company connections. This gets built as soon as it’s in.`)
            : note("amber", `<strong>Waiting on you.</strong> Zapier opened in a new tab (sample). Sign in there and allow Traque, then come back and press <strong>Check</strong>. ${btn("Don’t have Zapier? Get an account", "zapget", { kind: "btn--quiet btn--sm" })}`)}
      </div>`;
      act = co ? action(link("Next", next(s, "other"), "btn btn--primary"), "", btn("Change", "change", { kind: "btn--quiet btn--sm" }))
               : action(btn("Check", "check", { kind: "btn--primary" }), "It says Connected only once our check works.", btn("Change", "change", { kind: "btn--quiet btn--sm" }));
    } else {
      body = `<div class="stack">
        ${note("green", `<strong>Built.</strong> Zapier connected it and our check worked.`)}
        ${summary(true)}
        ${zapRow}
      </div>`;
      act = action(link("Next", next(s, "other"), "btn btn--primary"), "", btn("Change", "change", { kind: "btn--quiet btn--sm" }));
    }
    return `<div class="screen">
      ${head(s, "other", "Build the rest with Zapier", "Tell us what you want, in plain words. Traque and Zapier build it.")}
      ${body}${act}
    </div>`;
  },
  actions: {
    tab(s, el) { s.recTab = el.dataset.tab; },
    add(s, el) {
      const a = askById(el.dataset.id); if (!a || inText(s, a.id)) return;
      const t = s.zap.text.trim().replace(/\.\s*$/, "");
      s.zap.text = t ? `${t}, ${a.say}.` : `Let it ${a.say}.`;
      if (!s.added.includes(a.id)) s.added.push(a.id);
    },
    unadd(s, el) {
      const a = askById(el.dataset.id); if (!a) return;
      s.zap.text = s.zap.text.replace(new RegExp(`(,\\s*|\\s+and\\s+)?${escRe(a.say)}`, "i"), "").replace(/^Let it\s*\.?\s*$/i, "").replace(/,\s*\./, ".").trim();
      s.added = s.added.filter(x => x !== a.id);
    },
    async build(s, el) { if (!s.zap.text.trim()) return false; await simulate(el, 1200); s.zap.stage = "review"; },
    async ok(s, el) {
      if (company()) { if (s.coZap.state === "connected") { await simulate(el, 1100); s.zap.stage = "connected"; } else { s.zap.stage = "waiting"; } return; }
      await simulate(el, 600); s.zap.stage = "waiting"; toast("Zapier opened in a new tab (sample). Allow Traque there, then press Check.");
    },
    async check(s, el) { await simulate(el, 1000); s.zap.stage = "connected"; },
    change(s) { s.zap.stage = "edit"; },
    zapget: zapierKeyActions.zapget,
  },
};

/* ---------- 7 · Add people to your team ---------- */
export const team = {
  id: "team", title: "Add people to your team", addr: "traque.com/start/team", where: "web",
  render(s) {
    const t = s.team; const co = company();
    return `<div class="screen">
      ${head(s, "team", "Add people to your team", co ? "Each person gets their own sign-in. They never see yours." : "Solo is just you. Add people by switching to Company.")}
      ${co ? `<div class="stack">
        ${field("Their phone or email", `<input class="input" id="inv" data-bind="team.draft" data-rerender value="${esc(t.draft)}" placeholder="(845) 555-0100" autocomplete="off">`, "", "inv")}
        <div class="choices" role="radiogroup" aria-label="Role">${choice("Tech", "Sees today’s jobs and the how-to notes.", { action: "role", attrs: 'data-r="tech"', on: t.role === "tech" })}${choice("Office", "Sees all customers and jobs.", { action: "role", attrs: 'data-r="office"', on: t.role === "office" })}</div>
        <div class="rows" style="margin-top: var(--space-lg)">${row(esc(SAMPLE.owner), "Owner · you", status("active"))}${t.invites.map((p, i) => row(esc(p.who), p.role, `${status(p.state)}${btn("Remove", "remove", { kind: "btn--quiet btn--sm", attrs: `data-i="${i}"` })}`)).join("")}</div>
      </div>
      ${action(btn("Send invite", "invite", { kind: "btn--primary", disabled: !t.draft.trim() }), "", `<a class="linkline" href="${next(s, "team")}">${t.invites.length ? "Next" : "Skip, it’s just me for now"}</a>`)}`
      : `<div class="stack">
        <div class="rows">${row(esc(SAMPLE.owner), "Owner · you", status("active"))}</div>
        ${note("", `<strong>Company</strong> adds sign-ins for the people who answer with you, a team view, and a lower price per person. Price not set yet.`)}
      </div>
      ${action(btn("Switch to Company", "company", { kind: "btn--primary" }), "", `<a class="linkline" href="${next(s, "team")}">Keep it just me</a>`)}`}
    </div>`;
  },
  actions: {
    role(s, el) { s.team.role = el.dataset.r; },
    invite(s) { const d = s.team.draft.trim(); if (!d) return false; s.team.invites.push({ who: d, role: s.team.role === "tech" ? "Tech" : "Office", state: "invited" }); s.team.draft = ""; },
    remove(s, el) { s.team.invites.splice(Number(el.dataset.i), 1); },
    company(s) { s.plan = "company"; s.biz.team = true; },
  },
};

/* ---------- 8 (Company) · Company services ---------- */
export const services = {
  id: "services", title: "Company services", addr: "traque.com/start/company-services", where: "web",
  render(s) {
    if (!company()) return `<div class="screen">${head(s, null, "Company services", "This step is for Company accounts.")}${note("", "On Solo you pay for your own tools. Switch to Company under More to set up services for a team.")}${action(link("Back", "#/done", "btn btn--primary"))}</div>`;
    return `<div class="screen">
      ${head(s, "services", "Company services", "One Zapier account for the company. Then connect each service once for the whole team and say how you’ll handle the cost.")}
      ${zapierKey(s)}
      <div class="stack-lg" style="margin-top: var(--space-xl)">${[...TOOLS, ...RECOMMENDED.filter(r => s.coAdded.includes(r.id) && !TOOLS.some(t => t.id === r.id)).map(r => ({ ...r, sample: true }))].map(t => { const c = s.tools[t.id] || { state: "not-connected", pay: "suggest", cap: "" }; return `<section class="stack-sm">
        <div class="row row--plain"><span class="row__body"><span class="row__title">${esc(t.name)} ${t.sample ? status("sample") : ""}</span><span class="row__sub">${esc(t.sub)}</span></span><span class="row__end">${status(c.state)}${c.state === "connected" ? "" : c.state === "waiting" ? btn("Check", "check", { kind: "btn--sm", attrs: `data-id="${t.id}"` }) : btn("Connect", "on", { kind: "btn--sm", attrs: `data-id="${t.id}"` })}</span></div>
        <div class="choices" role="radiogroup" aria-label="How you’ll pay for ${esc(t.name)}">${Object.entries(PAY).map(([k, l]) => choice(l, k === "match" ? "We pay for it. Dollar for dollar, up to a limit." : k === "amount" ? "We pay for it. Up to a set amount per person." : "They see it. They pay.", { action: "pay", attrs: `data-id="${t.id}" data-pay="${k}"`, on: c.pay === k })).join("")}</div>
        ${c.pay !== "suggest" ? `<div class="prefix" style="max-width: 16rem"><span>${c.pay === "match" ? "Up to $" : "$"}</span><input class="input tabular" style="width: 5rem; flex: none" aria-label="Amount per person per month" inputmode="decimal" data-bind="tools.${t.id}.cap" value="${esc(c.cap)}"><span class="small muted" style="padding-inline: 0 var(--space-md)">a month each</span></div>` : ""}
      </section>`; }).join("")}</div>
      <section class="stack-sm" style="margin-top: var(--space-xl)">
        <h2>Recommended by Traque</h2>
        <p class="small muted">A short list for your trade. Tap Add to put one on the company list above. Nothing is connected by adding.</p>
        <div class="rows">${RECOMMENDED.filter(r => !TOOLS.some(t => t.id === r.id)).map(r => { const on = s.coAdded.includes(r.id); return `<div class="row"><span class="row__body"><span class="row__title">${esc(r.name)}</span><span class="row__sub">${esc(r.sub)}</span></span><span class="row__end">${on ? `${status("not-connected", "On the list")}${btn("Remove", "counadd", { kind: "btn--quiet btn--sm", attrs: `data-id="${r.id}"` })}` : btn("Add", "coadd", { kind: "btn--sm", attrs: `data-id="${r.id}"` })}</span></div>`; }).join("")}</div>
      </section>
      <p class="small muted" style="margin-top: var(--space-xl)">Amounts are placeholders. thanks.io is a real service we haven’t connected yet. The others are samples.</p>
      ${action(link("Next", next(s, "services"), "btn btn--primary"), "You can change any of this under More.")}
    </div>`;
  },
  actions: {
    ...zapierKeyActions,
    pay(s, el) { s.tools[el.dataset.id].pay = el.dataset.pay; },
    coadd(s, el) { const id = el.dataset.id; if (!s.coAdded.includes(id)) s.coAdded.push(id); if (!s.tools[id]) s.tools[id] = { state: "not-connected", pay: "suggest", cap: "" }; },
    counadd(s, el) { s.coAdded = s.coAdded.filter(x => x !== el.dataset.id); delete s.tools[el.dataset.id]; },
    async on(s, el) { await simulate(el, 600); s.tools[el.dataset.id].state = "waiting"; },
    async check(s, el) { await simulate(el, 900); s.tools[el.dataset.id].state = "connected"; },
  },
};

/* ---------- Done ---------- */
export const done = {
  id: "done", title: "You’re set", addr: "traque.com/home", where: "web",
  render(s) {
    const on = s.phone.tested;
    return `<div class="screen">
      <div class="head"><h1>${on ? "Traque is on." : "Almost there."}</h1><p>${on ? `Missed work texts and calls get your reply after ${s.goal.wait} minutes.` : "Finish connecting your phone to turn it on."}</p></div>
      <div class="rows">
        ${row("Your phone", on ? `Connected · ${esc(SAMPLE.phone)}` : "Not connected yet", status(on ? "on" : "off"), "#/phone")}
        ${row("Open in your AI", `The pinned conversation “Traque — ${esc(s.biz.name)}”. Ask or change anything there.`, "", "#/goal")}
        ${row("Your skills", "Builds itself as you work.", "", "#/skills")}
        ${row("Team view", company() ? "Who handled what, and what the team learned." : "Just you for now.", "", "#/teamview")}
        ${row("Your public page", s.page.listed ? "Listed in the directory. Your doorman answers there." : "Not listed yet.", "", "#/page")}
        ${row("Rent, sell or copy your know-how", s.view === "owner" ? "Owner only." : "Managed by your company.", "", "#/owner")}
        ${row("More", "Plan, your public page, what Traque knows, and settings.", "", "#/more")}
      </div>
      ${action(link(on ? "Open team view" : "Connect your phone", on ? "#/teamview" : "#/phone", "btn btn--primary"))}
    </div>`;
  },
  actions: {},
};
