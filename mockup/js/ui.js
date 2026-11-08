export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Status words a contractor would use. Each has a word and a shape; colour is never the only signal.
const STATUS = {
  "not-connected": { label: "Not connected", tone: "", icon: '<circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  "waiting": { label: "Waiting on you", tone: "amber", icon: '<circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 3.5V6l1.8 1.2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>' },
  "testing": { label: "Still testing", tone: "amber", icon: '<circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>' },
  "connected": { label: "Connected", tone: "green", icon: '<circle cx="6" cy="6" r="5" fill="currentColor"/><path d="M3.6 6.2l1.6 1.6 3.2-3.4" stroke="var(--color-paper)" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
  "fix": { label: "Needs a fix", tone: "amber", icon: '<path d="M6 1.5L11 10.5H1z" fill="currentColor"/>' },
  "paused": { label: "Paused", tone: "", icon: '<rect x="2.5" y="2" width="2.5" height="8" fill="currentColor"/><rect x="7" y="2" width="2.5" height="8" fill="currentColor"/>' },
  "on": { label: "On", tone: "green", icon: '<circle cx="6" cy="6" r="5" fill="currentColor"/>' },
  "off": { label: "Off", tone: "", icon: '<circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  "active": { label: "Active", tone: "green", icon: '<circle cx="6" cy="6" r="5" fill="currentColor"/>' },
  "invited": { label: "Invited", tone: "amber", icon: '<circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 3.5V6l1.8 1.2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>' },
  "sample": { label: "Sample", tone: "", icon: '<rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 1.5"/>' },
};
export function status(key, label) {
  const s = STATUS[key] || STATUS["not-connected"];
  return `<span class="status ${s.tone ? "status--" + s.tone : ""}"><svg viewBox="0 0 12 12" aria-hidden="true">${s.icon}</svg>${esc(label || s.label)}</span>`;
}

export function note(tone, html) {
  const icon = tone === "green" ? '<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 8.2l2 2 4-4.4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    : tone === "amber" ? '<path d="M8 2L15 14H1z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 6.5v3.2M8 12h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
    : '<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4.5M8 4.8h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
  return `<div class="note-box ${tone ? "note-box--" + tone : ""}"><svg viewBox="0 0 16 16" aria-hidden="true">${icon}</svg><p>${html}</p></div>`;
}

export function btn(label, action, { kind = "", attrs = "", disabled = false } = {}) {
  return `<button type="button" class="btn ${kind}" data-action="${esc(action)}" ${attrs} ${disabled ? "disabled" : ""}><span class="btn__label">${label}</span></button>`;
}
export function link(label, hash, kind = "btn") { return `<a class="${kind}" href="${esc(hash)}">${label}</a>`; }
export function field(label, control, help = "", id = "") {
  return `<div class="field">${label ? `<label ${id ? `for="${id}"` : ""}>${esc(label)}</label>` : ""}${control}<div class="field__help">${help}</div></div>`;
}
export function choice(title, sub, { action, attrs = "", on = false, href = "", chev = false } = {}) {
  const inner = `${href ? "" : `<span class="choice__mark" aria-hidden="true"></span>`}<span class="choice__body"><span class="choice__title">${esc(title)}</span>${sub ? `<span class="choice__sub">${sub}</span>` : ""}</span>${chev ? `<svg class="chev" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>` : ""}`;
  if (href) return `<a class="choice choice--link" href="${esc(href)}">${inner}</a>`;
  return `<button type="button" role="radio" aria-checked="${on}" class="choice" data-action="${esc(action)}" ${attrs}>${inner}</button>`;
}
export function row(title, sub, end = "", href = "") {
  const inner = `<span class="row__body"><span class="row__title">${title}</span>${sub ? `<span class="row__sub">${sub}</span>` : ""}</span><span class="row__end">${end}${href ? `<svg class="chev" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>` : ""}</span>`;
  return href ? `<a class="row" href="${esc(href)}">${inner}</a>` : `<div class="row">${inner}</div>`;
}
export function switchCtl(label, bind, checked) {
  return `<label class="switch"><span class="switch__label">${esc(label)}</span><input type="checkbox" data-bind="${esc(bind)}" ${checked ? "checked" : ""}><span class="switch__track" aria-hidden="true"></span></label>`;
}
// One primary button per screen, pinned to the bottom on phones.
export function action(primary, note = "", secondary = "") {
  return `<div class="action"><div class="action__in">${primary}${secondary}${note ? `<span class="note">${note}</span>` : ""}</div></div>`;
}
export function toast(msg, { action: label, onAction } = {}) {
  let host = document.querySelector(".toasts");
  if (!host) { host = document.createElement("div"); host.className = "toasts"; host.setAttribute("aria-live", "polite"); document.body.appendChild(host); }
  const el = document.createElement("div"); el.className = "toast";
  el.innerHTML = `<span>${esc(msg)}</span>${label ? `<button type="button">${esc(label)}</button>` : ""}`;
  if (label) el.querySelector("button").addEventListener("click", () => { onAction?.(); el.remove(); });
  host.appendChild(el); setTimeout(() => el.remove(), 5000);
}
export async function copyText(text, button) {
  try { await navigator.clipboard.writeText(text); } catch (_) { /* label still flips */ }
  if (button) { button.dataset.state = "copied"; setTimeout(() => delete button.dataset.state, 2500); }
}
export function simulate(button, ms = 900) { if (button) button.dataset.state = "loading"; return new Promise(r => setTimeout(r, ms)); }
