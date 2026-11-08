import { get, save, reset, company } from "./state.js";
import { esc, toast } from "./ui.js";
import { welcome, ai, business, goal, phone, other, team, services, done, SETUP } from "./screens.js";
import { teamview, owner, rent, clone, sell } from "./screens-after.js";
import { more, plan, notes, page, directory, shared, viewas, skills } from "./screens-more.js";

const ORDER = [welcome, ai, business, goal, phone, other, team, services, done, skills, teamview, owner, rent, clone, sell, more, plan, notes, page, directory, shared, viewas];
const byId = Object.fromEntries(ORDER.map(x => [x.id, x]));
const root = document.getElementById("app");
const bar = document.getElementById("proto");

// Walkthrough index: Justin’s eight steps, then what lives under More.
const index = {
  id: "index", title: "Walkthrough", addr: "prototype",
  render(s) {
    const steps = [["1", "ai", "Pick your AI"], ["2", "business", "Tell us your business"], ["3", "goal", "What you want it to do"], ["4", "phone", "Connect your phone"], ["5", "other", "Connect other services"], ["6", "team", "Add people to your team"], ["7", "services", "Company services (Company only)"], ["—", "done", "You’re set"], ["—", "skills", "Your skills (writes itself)"], ["7", "teamview", "Team view"], ["8", "owner", "Owner only: rent, sell or copy"]];
    const moreList = [["more", "More"], ["plan", "Plan"], ["notes", "What Traque knows"], ["page", "Your public page"], ["directory", "Directory"], ["shared", "Company connections (Company)"], ["viewas", "Look at it as a team member (Company)"]];
    return `<div class="screen">
      <div class="head"><span class="logo logo--lg" role="img" aria-label="Traque"></span><h1>Traque, simplified</h1><p>Click-through prototype for ${esc(s.biz.name)}. Nothing is live. Nothing is sent.</p>
        <div class="seg" role="tablist" aria-label="Plan">${["solo", "company"].map(k => `<button type="button" role="tab" aria-selected="${s.plan === k}" class="seg__btn ${s.plan === k ? "is-active" : ""}" data-action="plan" data-plan="${k}">${k === "solo" ? "Solo" : "Company"}</button>`).join("")}</div>
        <p class="small muted">Viewing as ${s.plan === "solo" ? "Solo: just the owner. Six setup steps." : "Company: owner plus team. Seven setup steps, team view, company services."}</p>
      </div>
      <div class="stack-sm"><a class="btn btn--primary" href="#/welcome">Start at the beginning</a> <button type="button" class="btn btn--quiet" data-action="reset">Reset sample data</button></div>
      <h2 style="margin-top: var(--space-xl)">The steps</h2>
      <ol class="index">${steps.map(([n, id, t]) => `<li><a href="#/${id}"><span class="n">${n}</span><span class="t">${esc(t)}</span><span class="d">${esc(byId[id].addr)}</span></a></li>`).join("")}</ol>
      <h2 style="margin-top: var(--space-xl)">Under More</h2>
      <ol class="index">${moreList.map(([id, t]) => `<li><a href="#/${id}"><span class="n">·</span><span class="t">${esc(t)}</span><span class="d">${esc(byId[id].addr)}</span></a></li>`).join("")}</ol>
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
  bar.innerHTML = `<div class="proto__in"><span class="proto__label">Prototype</span><span class="proto__title">${esc(scr.title)}</span>
    <a href="${prev ? `#/${prev.id}` : "#/index"}" aria-label="Previous" ${prev ? "" : 'aria-disabled="true"'}>‹</a>
    <label class="visually-hidden" for="jump">Jump to</label><select id="jump">${ALL.map(x => `<option value="${x.id}" ${x.id === scr.id ? "selected" : ""}>${esc(x.title)}</option>`).join("")}</select>
    <a href="${nxt ? `#/${nxt.id}` : "#/index"}" aria-label="Next" ${nxt ? "" : 'aria-disabled="true"'}>›</a></div>`;
  const isApp = scr.id !== "index" && scr.id !== "welcome";
  const top = isApp ? `<header class="top"><a href="#/done" aria-label="Traque home"><span class="logo"></span></a><nav class="top__right"><a href="#/more">More</a></nav></header>` : scr.id === "welcome" ? `<header class="top"><a href="#/welcome" aria-label="Traque"><span class="logo"></span></a><nav class="top__right"><a href="#/ai">Sign in</a></nav></header>` : "";
  root.innerHTML = `${top}${scr.addr && scr.id !== "index" ? `<div class="addr">${esc(scr.addr)}</div>` : ""}${scr.render(s)}`;
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
  if (r !== false && el.tagName !== "A") render();
});
bar.addEventListener("change", e => { if (e.target.id === "jump") location.hash = `#/${e.target.value}`; });
window.addEventListener("hashchange", () => { window.scrollTo({ top: 0 }); render(); });
render();
