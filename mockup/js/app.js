import { get, save, reset, company } from "./state.js";
import { esc, toast } from "./ui.js";
import { welcome, ai, business, goal, calendar, phone, other, team, services, done, SETUP } from "./screens.js";
import { teamview, owner, rent, clone, sell } from "./screens-after.js";
import { more, plan, notes, shared, viewas, skills } from "./screens-more.js";
import { directory, trades, listing, page, doorman } from "./screens-dir.js";

const ORDER = [welcome, ai, business, goal, calendar, phone, other, team, services, done, skills, teamview, owner, rent, clone, sell, more, plan, notes, page, doorman, directory, trades, listing, shared, viewas];
const byId = Object.fromEntries(ORDER.map(x => [x.id, x]));
const root = document.getElementById("app");
const bar = document.getElementById("proto");

// Where each screen lives. Default is traque.com; setup steps mark themselves "ai" or "phone".
const WHERE = { ai: "Inside your AI", web: "On traque.com", phone: "On your phone" };
const whereOf = (scr) => scr.where || "web";

// Walkthrough index: the steps in order, then everything grouped by where it lives.
const index = {
  id: "index", title: "Walkthrough", addr: "prototype",
  render(s) {
    const steps = [["1", "ai"], ["2", "business"], ["3", "goal"], ["4", "calendar"], ["5", "phone"], ["6", "other"], ["7", "team"], ["8", "services"]];
    const stepNo = Object.fromEntries(steps.map(([n, id]) => [id, n]));
    const label = { ai: "Pick your AI", business: "Tell us your business", goal: "What you want it to do", calendar: "Connect your calendar", phone: "Connect your phone", other: "Build the rest with Zapier", team: "Add people to your team", services: "Company services (Company only)", welcome: "Home page", done: "You’re set (home after setup)", skills: "Your skills (writes itself)", teamview: "Team view", owner: "Owner only: rent, sell or copy", rent: "Rent it out", clone: "Copy to a new location", sell: "Sell or hand over", more: "More", plan: "Plan", notes: "What Traque knows", page: "Your public page", doorman: "Your doorman", shared: "Company connections (Company)", viewas: "Look at it as a team member (Company)", directory: "Directory home: search and browse", trades: "Directory: trades", listing: "Directory: a pro’s listing, with the doorman" };
    const addr = (id) => { const a = byId[id].addr; return typeof a === "function" ? a(s) : a; };
    const groups = [["ai", "Inside your AI", "Chat with ChatGPT, Claude or Gemini. Traque answers through its connection; the AI is the everyday interface."], ["web", "On traque.com", "A small website for sign-in, status, team, settings, keys and anything public."], ["phone", "On your phone", "The Traque app on Android, or the helper on a Mac for iPhone. This is what watches texts and calls."]];
    const item = (id) => `<li><a href="#/${id}"><span class="n">${stepNo[id] ? "Step " + stepNo[id] : "·"}</span><span class="t">${esc(label[id] || byId[id].title)}</span><span class="d">${esc(addr(id))}</span></a></li>`;
    const order = ORDER.map(x => x.id).filter(id => id !== "index");
    return `<div class="screen screen--wide">
      <div class="head"><span class="logo logo--lg" role="img" aria-label="Traque"></span><h1>Traque, simplified</h1><p>Click-through prototype for ${esc(s.biz.name)}. Nothing is live. Nothing is sent.</p>
        <div class="seg" role="tablist" aria-label="Plan">${["solo", "company"].map(k => `<button type="button" role="tab" aria-selected="${s.plan === k}" class="seg__btn ${s.plan === k ? "is-active" : ""}" data-action="plan" data-plan="${k}">${k === "solo" ? "Solo" : "Company"}</button>`).join("")}</div>
        <p class="small muted">Viewing as ${s.plan === "solo" ? "Solo: just the owner. Seven setup steps." : "Company: owner plus team. Eight setup steps, team view, company services."}</p>
      </div>
      <div class="stack-sm"><a class="btn btn--primary" href="#/welcome">Start at the beginning</a> <button type="button" class="btn btn--quiet" data-action="reset">Reset sample data</button></div>
      <h2 style="margin-top: var(--space-xl)">The eight steps, in order</h2>
      <ol class="index">${steps.map(([n, id]) => `<li><a href="#/${id}"><span class="n">${n}</span><span class="t">${esc(label[id])}</span><span class="where where--${whereOf(byId[id])}">${WHERE[whereOf(byId[id])]}</span></a></li>`).join("")}</ol>
      <h2 style="margin-top: var(--space-xl)">Every screen, by where it lives</h2>
      <div class="groups">${groups.map(([k, t, sub]) => `<section class="group"><h3><span class="where where--${k}">${t}</span></h3><p class="small muted">${sub}</p><ol class="index">${order.filter(id => whereOf(byId[id]) === k).map(item).join("")}</ol></section>`).join("")}</div>
      <p class="small muted" style="margin-top: var(--space-xl)">The map with reasons and handoffs is in <span class="mono">docs/traque-where-screens-live.md</span>.</p>
    </div>`;
  },
  actions: {
    plan(s, el) { s.plan = el.dataset.plan; s.biz.team = s.plan === "company"; if (s.plan === "solo") s.view = "owner"; },
    reset(s, el, ctx) { ctx.reset(); toast("Sample data reset."); },
  },
};
byId.index = index;
const ALL = [index, ...ORDER];

function current() { const id = (location.hash || "#/index").replace(/^#\/?/, "").split("?")[0] || "index"; return byId[id] || index; }
const ctx = { render, reset: () => { reset(); render(); } };

function render() {
  const s = get(); const scr = current();
  const i = ALL.indexOf(scr); const prev = ALL[i - 1], nxt = ALL[i + 1];
  const focusId = document.activeElement?.id; const sel = document.activeElement?.selectionStart;
  const where = whereOf(scr);
  bar.innerHTML = `<div class="proto__in"><span class="proto__label">Prototype</span>${scr.id === "index" ? "" : `<span class="proto__where proto__where--${where}">${WHERE[where]}</span>`}<span class="proto__title">${esc(scr.title)}</span>
    <a href="${prev ? `#/${prev.id}` : "#/index"}" aria-label="Previous" ${prev ? "" : 'aria-disabled="true"'}>‹</a>
    <label class="visually-hidden" for="jump">Jump to</label><select id="jump">${ALL.map(x => `<option value="${x.id}" ${x.id === scr.id ? "selected" : ""}>${esc(x.title)}</option>`).join("")}</select>
    <a href="${nxt ? `#/${nxt.id}` : "#/index"}" aria-label="Next" ${nxt ? "" : 'aria-disabled="true"'}>›</a></div>`;
  const PUBLIC = ["index", "welcome", "directory", "trades", "listing"];
  const addr = typeof scr.addr === "function" ? scr.addr(s) : scr.addr;
  if (where === "ai") {
    // A neutral chat frame. Traque's reply is the card; the AI itself is unbranded on purpose.
    const c = scr.chat || {};
    root.innerHTML = `<div class="chat">
      <header class="chat__top"><span class="chat__ai" aria-hidden="true"></span><span class="chat__name">Your AI</span><span class="chat__title">Traque — ${esc(s.biz.name)}</span><span class="chat__pin">Pinned</span></header>
      <div class="chat__log">
        ${c.you ? `<div class="cmsg cmsg--you"><span>${esc(c.you)}</span></div>` : ""}
        <div class="cmsg cmsg--ai"><span class="cmsg__who">Traque, through your AI</span>${c.say ? `<p class="cmsg__say">${esc(c.say)}</p>` : ""}<div class="cmsg__card">${scr.render(s)}</div></div>
      </div>
      <form class="chat__in" data-action="__say"><input class="input" aria-label="Message your AI" placeholder="Or just tell your AI what you want"><button type="submit" class="btn btn--sm">Send</button></form>
    </div>`;
  } else {
    const isApp = !PUBLIC.includes(scr.id) && where !== "phone";
    const top = isApp ? `<header class="top"><a href="#/done" aria-label="Traque home"><span class="logo"></span></a><nav class="top__right"><a href="#/more">More</a></nav></header>` : scr.id === "welcome" ? `<header class="top"><a href="#/welcome" aria-label="Traque"><span class="logo"></span></a><nav class="top__right"><a href="#/ai">Sign in</a></nav></header>` : where === "phone" ? `<header class="top top--phone"><span class="logo"></span><span class="small muted">Traque app</span></header>` : "";
    root.innerHTML = `${top}${addr && scr.id !== "index" ? `<div class="addr">${esc(addr)}</div>` : ""}${scr.render(s)}`;
  }
  document.title = `${scr.title} · Traque`;
  if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus({ preventScroll: true }); if (sel != null && typeof el.setSelectionRange === "function" && /^(text|search|url|tel|email|password)$/.test(el.type || "text")) { try { el.setSelectionRange(sel, sel); } catch (_) {} } } }
}

function setPath(o, path, v) { const p = path.split("."); for (let i = 0; i < p.length - 1; i++) { if (o[p[i]] == null || typeof o[p[i]] !== "object") o[p[i]] = {}; o = o[p[i]]; } o[p[p.length - 1]] = v; }
function bind(el) {
  const s = get(); const path = el.dataset.bind; if (!path) return;
  if (el.type === "checkbox") setPath(s, path, el.checked);
  else if (el.dataset.type === "number") setPath(s, path, Number(el.value));
  else setPath(s, path, el.value);
  save();
}
root.addEventListener("input", e => { const el = e.target; if (!el.dataset?.bind) return; bind(el); if (el.hasAttribute("data-rerender") && el.tagName !== "SELECT") render(); });
root.addEventListener("change", e => { const el = e.target; if (!el.dataset?.bind) return; bind(el); if (el.type === "checkbox" || el.type === "range" || el.tagName === "SELECT") render(); });
root.addEventListener("click", async e => {
  const el = e.target.closest("[data-action]"); if (!el || !root.contains(el)) return;
  const scr = current(); const fn = scr.actions?.[el.dataset.action]; if (!fn) return;
  if (el.tagName !== "A" && el.type !== "checkbox") e.preventDefault();
  const r = await fn.call(scr.actions, get(), el, ctx); save();
  // Links re-render through hashchange, unless they point at the screen we're already on.
  if (r !== false && (el.tagName !== "A" || el.getAttribute("href") === location.hash)) render();
});
root.addEventListener("submit", async e => {
  const form = e.target.closest("form[data-action]"); if (!form) return;
  e.preventDefault();
  if (form.dataset.action === "__say") { toast("Sample. In the real thing this goes to your AI, and Traque answers through it."); form.reset(); return; }
  const scr = current(); const fn = scr.actions?.[form.dataset.action]; if (!fn) return;
  const r = await fn.call(scr.actions, get(), form, ctx); save();
  if (r !== false) render();
});
bar.addEventListener("change", e => { if (e.target.id === "jump") location.hash = `#/${e.target.value}`; });
window.addEventListener("hashchange", () => { window.scrollTo({ top: 0 }); render(); });
render();
