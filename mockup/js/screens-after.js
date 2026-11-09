import { SAMPLE, TEAM, PROCESSES, company } from "./state.js";
import { esc, status, note, btn, link, field, choice, row, action, toast, simulate } from "./ui.js";

const back = (to = "#/done", label = "Home") => `<a class="back" href="${to}">‹ ${label}</a>`;

/* ---------- 7 · Team view ---------- */
export const teamview = {
  id: "teamview", title: "Team view", addr: "traque.com/team",
  render(s) {
    const co = company();
    const people = co ? TEAM : [TEAM[0]];
    const learners = 1 + s.team.invites.length;
    const mult = s.range === "week" ? 1 : 4;
    const total = people.reduce((a, p) => a + p.handled * mult, 0);
    return `<div class="screen">
      <div class="head">${back()}<h1>Team view</h1><p>${co ? "Who handled what. Sample numbers." : "Just you for now. Sample numbers."}</p></div>
      <div class="seg" role="tablist" aria-label="Range">${[["week", "This week"], ["month", "This month"]].map(([k, l]) => `<button type="button" role="tab" aria-selected="${s.range === k}" class="seg__btn ${s.range === k ? "is-active" : ""}" data-action="range" data-range="${k}">${l}</button>`).join("")}</div>
      <div class="nums" style="margin-top: var(--space-lg)">
        <div class="num"><span class="num__v tabular">${total}</span><span class="num__l">calls and texts handled</span></div>
        <div class="num"><span class="num__v tabular">${people.reduce((a, p) => a + p.booked * mult, 0)}</span><span class="num__l">jobs booked</span></div>
        <div class="num"><span class="num__v">${co ? "6 min" : "4 min"}</span><span class="num__l">usual time to reply</span></div>
      </div>
      <section class="stack-sm" style="margin-top: var(--space-xl)"><h2>By person</h2>
        <div class="rows">${people.map(p => row(`${esc(p.who)} <span class="muted small">· ${esc(p.role)}</span>`, `${p.handled * mult} handled · ${p.booked * mult} booked · replies in ${esc(p.reply)}${co ? ` · $${esc(p.used)} of $${esc(p.cap)} in company credit` : ""}<div class="bar" style="margin-top: var(--space-xs)"><span style="width: ${Math.round((p.handled / 22) * 100)}%"></span></div>`)).join("")}</div>
      </section>
      ${co ? `<section class="stack-sm" style="margin-top: var(--space-xl)"><h2>The company brain</h2>
        <div class="row row--plain"><span class="row__body"><span class="row__title">Learning from ${learners} ${learners === 1 ? "person" : "people"}, since Nov 2.</span><span class="row__sub">It picks things up from what each person does and keeps them as plain files. Customer details and sign-ins stay with the person. ${link("Open the brain", "#/skills", "linkline")}</span></span><span class="row__end">${status("on", "Learning")}</span></div>
      </section>`
      : `<section class="stack-sm" style="margin-top: var(--space-xl)">${note("", `With <strong>Company</strong>, each person has their own Traque, and what they learn on the job flows up here on its own. Price not set yet.`)}</section>`}
      ${co ? action(link("Add a person", "#/team", "btn btn--primary")) : action(btn("Switch to Company", "company", { kind: "btn--primary" }))}
    </div>`;
  },
  actions: {
    range(s, el) { s.range = el.dataset.range; },
    company(s) { s.plan = "company"; s.biz.team = true; },
  },
};

/* ---------- 8 · Owner only: rent, sell or copy ---------- */
export const owner = {
  id: "owner", title: "Rent, sell or copy", addr: "traque.com/owner",
  render(s) {
    if (s.view !== "owner") return `<div class="screen"><div class="head">${back()}<h1>Managed by your company</h1><p>Only the owner can rent, sell or copy the company’s know-how.</p></div>${action(link("Back", "#/done", "btn btn--primary"))}</div>`;
    return `<div class="screen">
      <div class="head">${back()}<h1>Your know-how is yours.</h1><p>Everything Traque learned about ${esc(s.biz.name)}: how you answer, what you ask, what you’ve taught it. ${company() ? "Owner only. " : ""}Customer names, numbers and your sign-ins never go with it.</p></div>
      <div class="choices">
        ${choice("Rent out a how-to", "Another business pays monthly to use one of your processes.", { href: "#/rent", chev: true })}
        ${choice("Copy to a new location", "Start a second shop with the same how-to notes.", { href: "#/clone", chev: true })}
        ${choice("Sell or hand over", "License it, or hand it all over with the business.", { href: "#/sell", chev: true })}
      </div>
      <p class="small muted" style="margin-top: var(--space-xl)">Money and legal terms are placeholders. Nothing is listed or charged.</p>
    </div>`;
  },
  actions: {},
};

const goes = `<div class="two"><div><h3>What goes</h3><ul class="plain"><li><span class="mark">✓</span>The steps and the questions to ask</li><li><span class="mark">✓</span>Your text templates, blanks instead of names</li></ul></div><div><h3>What stays here</h3><ul class="plain"><li><span class="mark mark--no">–</span>Customer names and numbers</li><li><span class="mark mark--no">–</span>Your prices and hours</li><li><span class="mark mark--no">–</span>Your sign-ins and your phone</li></ul></div></div>`;

export const rent = {
  id: "rent", title: "Rent out a how-to", addr: "traque.com/owner/rent",
  render(s) {
    const p = PROCESSES.find(x => x.id === s.rent.process);
    return `<div class="screen">
      <div class="head">${back("#/owner", "Back")}<h1>Rent out a how-to</h1><p>Pick one. Another business subscribes and fills in their own hours, numbers and customers.</p></div>
      <div class="choices" role="radiogroup" aria-label="Which how-to">${PROCESSES.map(x => choice(x.name, x.ready ? "" : "Not finished yet", { action: "pick", attrs: `data-p="${x.id}"`, on: s.rent.process === x.id })).join("")}</div>
      <div class="stack" style="margin-top: var(--space-xl)">${goes}
        ${field("Price a month", `<div class="prefix" style="max-width: 12rem"><span>$</span><input class="input tabular" id="rent-price" value="—" readonly aria-describedby="rent-help"></div>`, `<span id="rent-help">Not set. Traque takes a share; the share is a placeholder too.</span>`, "rent-price")}
        ${s.rent.shared ? note("green", `<strong>Listed (sample).</strong> “${esc(p.name)}” is available to rent. You can take it down any time.`) : ""}
      </div>
      ${s.rent.shared ? action(btn("Take it down", "unshare", { kind: "btn--primary" })) : action(btn("Rent it out", "share", { kind: "btn--primary", disabled: !p.ready }), p.ready ? "" : "Finish this how-to first.")}
    </div>`;
  },
  actions: { pick(s, el) { s.rent.process = el.dataset.p; s.rent.shared = false; }, async share(s, el) { await simulate(el, 900); s.rent.shared = true; }, unshare(s) { s.rent.shared = false; } },
};

export const clone = {
  id: "clone", title: "Copy to a new location", addr: "traque.com/owner/copy",
  render(s) {
    const c = s.clone; const n = Object.values(c.include).filter(Boolean).length;
    return `<div class="screen">
      <div class="head">${back("#/owner", "Back")}<h1>Copy to a new location</h1><p>The new shop starts with your how-to notes and keeps learning. It stays linked to this one, so what either shop learns, both get. It gets its own phone, prices and customers.</p></div>
      <div class="stack">
        ${field("Name of the new location", `<input class="input" id="cl-name" data-bind="clone.name" data-rerender value="${esc(c.name)}">`, "", "cl-name")}
        <div class="field"><span class="field__label">Which how-to notes</span><div class="choices">${PROCESSES.map(p => choice(p.name, p.ready ? "" : "Not finished. Copies as a draft.", { action: "tog", attrs: `data-p="${p.id}"`, on: !!c.include[p.id] })).join("")}</div></div>
        <div class="two"><div><h3>What goes</h3><ul class="plain"><li><span class="mark">✓</span>The how-to notes you pick</li><li><span class="mark">✓</span>Your text templates, blanks instead of names</li><li><span class="mark">✓</span>The link back: both shops keep learning together</li></ul></div><div><h3>What stays here</h3><ul class="plain"><li><span class="mark mark--no">–</span>Customer names and numbers</li><li><span class="mark mark--no">–</span>Your prices, hours and phone</li><li><span class="mark mark--no">–</span>Your sign-ins and your people</li></ul></div></div>
        ${c.done ? note("green", `<strong>Copied (sample).</strong> ${esc(c.name)} has its own Traque with ${n} how-to note${n === 1 ? "" : "s"}, linked to this one. New lessons flow both ways from here on.`) : ""}
      </div>
      ${c.done ? action(btn("Copy another", "again", { kind: "btn--primary" })) : action(btn("Make the copy", "go", { kind: "btn--primary", disabled: !c.name.trim() || n === 0 }), "Price for a second location: $ — (not set).")}
    </div>`;
  },
  actions: { tog(s, el) { s.clone.include[el.dataset.p] = !s.clone.include[el.dataset.p]; s.clone.done = false; }, async go(s, el) { await simulate(el, 1200); s.clone.done = true; }, again(s) { s.clone.done = false; } },
};

export const sell = {
  id: "sell", title: "Sell or hand over", addr: "traque.com/owner/sell",
  render(s) {
    const k = s.sell.kind;
    return `<div class="screen">
      <div class="head">${back("#/owner", "Back")}<h1>Sell or hand over</h1><p>Three different things. Pick one and we’ll prepare a package you look over first.</p></div>
      <div class="choices" role="radiogroup" aria-label="What kind">
        ${choice("License it", "They use your how-to notes. You still own them.", { action: "kind", attrs: 'data-k="license"', on: k === "license" })}
        ${choice("Hand it over", "The how-to notes become theirs. You keep your customers.", { action: "kind", attrs: 'data-k="transfer"', on: k === "transfer" })}
        ${choice("Sell with the business", "Everything, including customers, when you sell the company.", { action: "kind", attrs: 'data-k="business"', on: k === "business" })}
      </div>
      <div class="stack" style="margin-top: var(--space-xl)">
        ${k === "business" ? `<div class="two"><div><h3>What goes</h3><ul class="plain"><li><span class="mark">✓</span>How-to notes</li><li><span class="mark">✓</span>Customers and job history</li><li><span class="mark">✓</span>Your business number</li></ul></div><div><h3>What stays</h3><ul class="plain"><li><span class="mark mark--no">–</span>Your sign-ins. The buyer signs in fresh.</li></ul></div></div>` : goes}
        ${s.sell.prepared ? note("green", `<strong>Package ready (sample).</strong> Look it over, then send it to the other side. Nothing has moved yet.`) : ""}
      </div>
      ${action(btn(s.sell.prepared ? "Prepared" : "Prepare the package", "prep", { kind: "btn--primary", disabled: !k || s.sell.prepared }), "Price and terms: placeholders. A lawyer’s job, not Traque’s.")}
    </div>`;
  },
  actions: { kind(s, el) { s.sell.kind = el.dataset.k; s.sell.prepared = false; }, async prep(s, el) { await simulate(el, 1000); s.sell.prepared = true; } },
};
