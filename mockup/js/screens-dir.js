import { SAMPLE, DIR_TRADES, PROS, proBySlug, TALK, VISITORS, company } from "./state.js";
import { esc, status, note, btn, link, field, choice, row, switchCtl, action, toast, simulate, copyText } from "./ui.js";

/* Directory screens. Structure follows the Dirstarter template we licensed, one to one:
   directory  → app/(web)/(home)/page.tsx: Hero (Intro) + ToolQuery (Filters, ToolList grid of ToolCard, Pagination)
   trades     → app/(web)/categories/(categories)/page.tsx: Breadcrumbs + Intro + TaxonomyList of Tile
   directory with a trade picked → app/(web)/categories/[slug]/page.tsx: Breadcrumbs + Intro + ToolQuery
   listing    → app/(web)/[slug]/page.tsx: Section.Content (sticky name row, description, ToolButton, content,
                categories, tags, prev/next Nav) + Section.Sidebar + RelatedTools
   The "Talk to their AI" doorman is the one thing Dirstarter doesn't have; it sits where ToolStatusAlert does. */

const pros = (s) => PROS.filter(p => !p.mine || s.page.listed);
const mark = (p) => `<span class="pmark" aria-hidden="true">${esc(p.name[0])}</span>`;
const checked = () => `<span class="verified"><svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="currentColor"/><path d="M3.6 6.2l1.6 1.6 3.2-3.4" stroke="var(--color-paper)" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>Owner checked</span>`;
const badge = (t, href) => href ? `<a class="badge" href="${esc(href)}">${esc(t)}</a>` : `<span class="badge">${esc(t)}</span>`;

// Header and footer stand in for Dirstarter's components/web/header.tsx and footer.tsx.
const dirTop = () => `<div class="dir-top"><a class="dir-top__logo" href="#/directory">Traque <span>directory</span></a><nav aria-label="Directory"><a href="#/directory">Pros</a><a href="#/trades">Trades</a></nav>${link("Add your business", "#/welcome", "btn btn--sm")}</div>`;
const dirFoot = () => `<footer class="dir-foot"><span>Independent, owner-run home-service pros. Sample listings.</span><a href="#/directory">Pros</a><a href="#/trades">Trades</a><a href="#/welcome">Traque</a></footer>`;
const crumbs = (items) => `<nav class="crumbs" aria-label="Where you are"><a href="#/directory">Home</a>${items.map(([t, h], i) => `<span aria-hidden="true">/</span>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}`).join("")}</nav>`;

// ToolCard: mark, name, verified badge, tagline, category badges. Plus our doorman link.
function card(p) {
  return `<article class="card">
    <div class="card__head">${mark(p)}<h3><a href="#/listing" data-action="pick" data-slug="${esc(p.slug)}">${esc(p.name)}</a></h3>${checked()}</div>
    <p class="card__tag">${esc(p.tagline)}</p>
    <div class="card__badges">${badge(p.trade)}${badge(p.town)}</div>
    <div class="card__foot"><a class="linkline" href="#/listing" data-action="pick" data-slug="${esc(p.slug)}">Talk to their AI</a></div>
  </article>`;
}

/* ---------- Directory home / trade page ---------- */
export const directory = {
  id: "directory", title: "Directory", addr: "traque.com/directory",
  render(s) {
    const d = s.dir; const q = d.q.trim().toLowerCase();
    let list = pros(s).filter(p => !d.trade || p.trade === d.trade).filter(p => !q || [p.name, p.trade, p.town, p.tagline, p.owner].join(" ").toLowerCase().includes(q));
    if (d.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    const tradePage = !!d.trade;
    return `<div class="dir">
      ${dirTop()}
      ${tradePage ? crumbs([["Trades", "#/trades"], [d.trade]]) : ""}
      <section class="intro ${tradePage ? "" : "intro--center"}">
        <h1>${tradePage ? `${esc(d.trade)} pros` : "Find a pro who owns the shop"}</h1>
        <p>${tradePage ? `Owner-run ${esc(d.trade.toLowerCase())} businesses near you. Each one answers its own phone, and each has an AI you can talk to first.` : "Local, owner-run home-service businesses. No chains, no call centers. Talk to a pro’s AI before you call."}</p>
      </section>
      <div class="filters">
        <label class="search"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><input class="input" type="search" aria-label="Search pros" placeholder="${tradePage ? `Search ${esc(d.trade.toLowerCase())} pros` : "Search by trade, town or name"}" data-bind="dir.q" data-rerender value="${esc(d.q)}">${d.q ? btn("Clear", "clear", { kind: "btn--quiet btn--sm" }) : ""}</label>
        <select class="select" aria-label="Sort" data-bind="dir.sort" data-rerender><option value="new" ${d.sort === "new" ? "selected" : ""}>Newest</option><option value="name" ${d.sort === "name" ? "selected" : ""}>A to Z</option></select>
        <select class="select" aria-label="Trade" data-bind="dir.trade" data-rerender><option value="">All trades</option>${DIR_TRADES.map(t => `<option ${d.trade === t ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>
      </div>
      ${list.length ? `<div class="cards">${list.map(card).join("")}</div>` : `<div class="empty"><p>No pros match that yet.</p>${btn("Clear the search", "reset", { kind: "btn--sm" })}</div>`}
      <nav class="pager" aria-label="Pages"><span aria-current="page">1</span><span class="muted">of 1</span></nav>
      ${s.page.listed ? "" : `<p class="small muted" style="margin-top: var(--space-lg)">Your business isn’t listed. <a href="#/page">Turn it on</a>.</p>`}
      ${dirFoot()}
    </div>`;
  },
  actions: {
    pick(s, el) { s.dir.pick = el.dataset.slug; s.talk.who = ""; },
    clear(s) { s.dir.q = ""; },
    reset(s) { s.dir = { ...s.dir, q: "", trade: "" }; },
  },
};

/* ---------- Trades (categories index) ---------- */
export const trades = {
  id: "trades", title: "Trades", addr: "traque.com/directory/trades",
  render(s) {
    const all = pros(s);
    return `<div class="dir">
      ${dirTop()}
      ${crumbs([["Trades"]])}
      <section class="intro"><h1>Trades</h1><p>Pick a trade to see the owner-run pros in it.</p></section>
      <ul class="tiles">${DIR_TRADES.map(t => { const n = all.filter(p => p.trade === t).length; return `<li><a class="tile" href="#/directory" data-action="trade" data-t="${esc(t)}"><span class="tile__title">${esc(t)}</span><span class="tile__rule" aria-hidden="true"></span><span class="tile__n">${n} pro${n === 1 ? "" : "s"}</span></a></li>`; }).join("")}</ul>
      ${dirFoot()}
    </div>`;
  },
  actions: { trade(s, el) { s.dir.trade = el.dataset.t; s.dir.q = ""; } },
};

/* ---------- Listing detail (public page) ---------- */
const fill = (t, p) => t.replace(/\{owner\}/g, p.owner.split(" ")[0]).replace(/\{biz\}/g, p.name);
function doorBox(s, p) {
  const who = s.talk.who;
  const lines = who ? TALK[who] : [];
  return `<section class="door" aria-labelledby="door-h">
    <h2 id="door-h">Talk to ${esc(p.name)}’s AI</h2>
    <p class="small muted">It asks who you are, answers what ${esc(p.owner.split(" ")[0])} allows, and books a visit or passes a note along. Sample conversation.</p>
    <div class="talk">
      <div class="msg msg--ai"><span>Hi, this is ${esc(p.name)}’s assistant. Who am I talking with?</span></div>
      <div class="who" role="radiogroup" aria-label="Who are you">${[["customer", "New customer"], ["vendor", "Vendor"], ["partner", "Partner"], ["other", "Other"]].map(([k, l]) => `<button type="button" role="radio" aria-checked="${who === k}" class="chip ${who === k ? "is-on" : ""}" data-action="who" data-who="${k}">${l}</button>`).join("")}</div>
      ${lines.map(([from, t]) => `<div class="msg msg--${from}"><span>${esc(fill(t, p))}</span></div>`).join("")}
    </div>
    <form class="talk__in" data-action="send"><input class="input" aria-label="Your message" placeholder="${who ? "Type a reply" : "Or just type"}"><button type="submit" class="btn btn--sm">Send</button></form>
    <div class="row row--plain" style="margin-top: var(--space-md)"><span class="row__body"><span class="row__title">Have your AI talk to ours</span><span class="row__sub mono">traque.com/ai/${esc(p.slug)}</span></span><span class="row__end">${btn("Copy", "copyai", { kind: "btn--sm", attrs: `data-slug="${esc(p.slug)}"` })}</span></div>
  </section>`;
}
function listingView(s, p, { owner = false } = {}) {
  const others = pros(s).filter(x => x.slug !== p.slug);
  const i = PROS.indexOf(p); const prev = PROS[(i - 1 + PROS.length) % PROS.length]; const nxt = PROS[(i + 1) % PROS.length];
  const first = p.owner.split(" ")[0];
  return `<div class="dir">
    ${dirTop()}
    ${crumbs([["Pros", "#/directory"], [p.name]])}
    <div class="listing">
      <div class="listing__main">
        <div class="listing__head">${mark(p)}<h1>${esc(p.name)}</h1>${checked()}</div>
        <p class="listing__tag">${esc(p.tagline)}</p>
        <div class="listing__cta">${link(`Text ${esc(SAMPLE.phone)}`, owner ? "#/page" : "#/listing", "btn btn--primary")}<span class="small muted">Texts answered by ${esc(first)} or his AI, usually within minutes.</span></div>
        ${doorBox(s, p)}
        <section class="about"><h2>About</h2>${p.about.map(t => `<p>${esc(t)}</p>`).join("")}<p><strong>Owner:</strong> ${esc(p.owner)} · <strong>Serves:</strong> ${esc(p.area)}</p></section>
        <section class="meta"><h2>Trade</h2><div class="card__badges">${badge(p.trade, "#/directory")}</div></section>
        <section class="meta"><h2>Tags</h2><div class="card__badges">${p.tags.map(t => badge("#" + t)).join("")}</div></section>
        <nav class="pn" aria-label="Other pros"><a href="#/listing" data-action="pick" data-slug="${esc(prev.slug)}">‹ ${esc(prev.name)}</a><a href="#/listing" data-action="pick" data-slug="${esc(nxt.slug)}">${esc(nxt.name)} ›</a></nav>
      </div>
      <aside class="listing__side">
        <div class="side-card"><h2>What was checked</h2><ul class="plain"><li><span class="mark">✓</span>${esc(p.checked.owner)}</li><li><span class="mark">✓</span>${esc(p.checked.place)}</li><li><span class="mark">✓</span>${esc(p.checked.license)}</li><li><span class="mark">✓</span>Not a franchise or investor-owned, by owner statement</li></ul><p class="xs muted">Checked means we looked. It isn’t a guarantee of the work.</p></div>
        <div class="side-card"><h2>More pros near ${esc(p.town.split(",")[0])}</h2><ul class="plain plain--inline">${others.slice(0, 4).map(x => `<li><a href="#/listing" data-action="pick" data-slug="${esc(x.slug)}">${esc(x.name)}</a> <span class="muted">· ${esc(x.trade)}</span></li>`).join("")}</ul></div>
      </aside>
    </div>
    ${dirFoot()}
  </div>`;
}
const talkActions = {
  who(s, el) { s.talk.who = el.dataset.who; },
  send() { toast("Sample conversation. Nothing is sent."); return false; },
  async copyai(s, el) { await copyText(`https://traque.com/ai/${el.dataset.slug}`, el); return false; },
  pick(s, el) { s.dir.pick = el.dataset.slug; s.talk.who = ""; },
};

export const listing = {
  id: "listing", title: "Listing", addr: (s) => `traque.com/${s.dir.pick}`,
  render(s) { return listingView(s, proBySlug(s.dir.pick)); },
  actions: talkActions,
};

export const page = {
  id: "page", title: "Your public page", addr: `traque.com/${SAMPLE.user}`,
  render(s) {
    const p = { ...PROS[0], name: s.biz.name, trade: s.biz.trade, town: s.biz.town };
    return `${note("", `<strong>This is what a visitor sees.</strong> Your doorman answers here. ${link("Doorman settings", "#/doorman", "linkline")}`)}
      ${listingView(s, p, { owner: true })}
      <div class="screen" style="padding-top: 0">${switchCtl("List me in the Traque directory", "page.listed", s.page.listed)}<p class="small muted">People looking for a ${esc(s.biz.trade.toLowerCase())} pro near ${esc(s.biz.town)} can find you.</p>
      ${action(btn(s.page.saved ? "Saved" : "Save", "save", { kind: "btn--primary", disabled: s.page.saved }), "", `<a class="linkline" href="#/directory">See the directory</a>`)}</div>`;
  },
  actions: { ...talkActions, async save(s, el) { await simulate(el, 600); s.page.saved = true; setTimeout(() => { s.page.saved = false; }, 2000); } },
};

/* ---------- Owner side: Your doorman (under More) ---------- */
export const doorman = {
  id: "doorman", title: "Your doorman", addr: "traque.com/more/doorman",
  render(s) {
    const d = s.door; const first = SAMPLE.owner.split(" ")[0];
    return `<div class="screen">
      <div class="head"><a class="back" href="#/more">‹ More</a><h1>Your doorman</h1><p>The AI on your public page. It asks who someone is, answers what you allow, and books or passes a note to you.</p></div>
      <div class="stack-lg">
        <section class="stack-sm"><h2>Who it talks to</h2><div class="choices" role="radiogroup" aria-label="Who it talks to">${choice("Customers only", "Vendors and others get your email address.", { action: "who", attrs: 'data-v="customers"', on: d.who === "customers" })}${choice("Customers and vendors", "Vendors get a polite note in your Friday summary.", { action: "who", attrs: 'data-v="both"', on: d.who === "both" })}${choice("Anyone", "Partners and other AIs too.", { action: "who", attrs: 'data-v="anyone"', on: d.who === "anyone" })}</div></section>
        <section class="stack-sm"><h2>What it can share</h2>${switchCtl("The visit price", "door.share.price", d.share.price)}${switchCtl("Where you work", "door.share.area", d.share.area)}${switchCtl("Open times, to book a visit", "door.share.times", d.share.times)}${switchCtl("Your cell number", "door.share.phone", d.share.phone)}<p class="small muted">It never shares customer names, addresses or your sign-ins.</p></section>
        <section class="stack-sm"><h2>What gets sent to you</h2><div class="choices" role="radiogroup" aria-label="What gets sent to you">${choice("Text me about bookings and quotes", "Everything else waits for the Friday summary.", { action: "send", attrs: 'data-v="quotes-now"', on: d.send === "quotes-now" })}${choice("Text me about everything", "", { action: "send", attrs: 'data-v="all"', on: d.send === "all" })}${choice("Just the Friday summary", "", { action: "send", attrs: 'data-v="weekly"', on: d.send === "weekly" })}</div></section>
        <section class="stack-sm"><h2>Recent visitors</h2><p class="small muted">Sample. Who came to your page and what they wanted.</p>
          <div class="rows">${VISITORS.map(v => `<div class="row"><span class="row__body"><span class="row__title">${esc(v.who)} · ${esc(v.wanted)}</span><span class="row__sub">${esc(v.result)}</span></span><span class="row__end"><span class="xs muted tabular">${esc(v.when)}</span></span></div>`).join("")}</div></section>
      </div>
      ${action(btn(d.saved ? "Saved" : "Save", "save", { kind: "btn--primary", disabled: d.saved }), "", `<a class="linkline" href="#/page">See your page</a>`)}
    </div>`;
  },
  actions: {
    who(s, el) { s.door.who = el.dataset.v; },
    send(s, el) { s.door.send = el.dataset.v; },
    async save(s, el) { await simulate(el, 600); s.door.saved = true; setTimeout(() => { s.door.saved = false; }, 2000); },
  },
};
