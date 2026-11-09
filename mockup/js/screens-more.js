import { SAMPLE, BRAIN, company } from "./state.js";
import { zapierKey, zapierKeyActions } from "./screens.js";
import { esc, status, note, btn, link, field, choice, row, switchCtl, action, toast, simulate, copyText } from "./ui.js";

/* ---------- Your brain: plain files in folders, written by what you do ---------- */
export const skills = {
  id: "skills", title: "Your brain", addr: "traque.com/brain",
  render(s) {
    const co = company(); const emp = co && s.view !== "owner";
    const folders = emp ? BRAIN.employee : co ? [...BRAIN.owner, ...BRAIN.company] : BRAIN.owner;
    const who = emp ? "Mike R." : SAMPLE.owner;
    const learners = co && !emp ? 1 + s.team.invites.length : 1;
    const count = folders.reduce((a, f) => a + f.files.length, 0);
    const tree = folders.map(f => { const open = !s.brainClosed.includes(f.name); return `<li class="tree__folder">
        <button type="button" class="tree__row tree__row--folder" data-action="fold" data-f="${esc(f.name)}" aria-expanded="${open}"><svg class="tree__chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><svg class="tree__icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 4.5A1.5 1.5 0 0 1 3 3h3.2l1.6 1.5H13a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg><span class="tree__name mono">${esc(f.name)}/</span><span class="tree__meta">${f.files.length} file${f.files.length === 1 ? "" : "s"}${f.private ? " · private" : f.readonly ? " · read-only" : ""}</span></button>
        ${open ? `<ul class="tree__files">${f.private || f.readonly ? `<li class="tree__note small muted">${esc(f.private || f.readonly)}</li>` : ""}${f.files.map(([n, d]) => `<li class="tree__row tree__row--file"><svg class="tree__icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 1.5h5.5L13 5v9.5H4z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M9.5 1.5V5H13" fill="none" stroke="currentColor" stroke-width="1.3"/></svg><span class="tree__name mono">${esc(n)}</span><span class="tree__meta tabular">${esc(d)}</span></li>`).join("")}</ul>` : ""}
      </li>`; }).join("");
    return `<div class="screen">
      <div class="head"><a class="back" href="#/done">‹ Home</a><h1>${emp ? "My brain" : co ? "The company brain" : "Your brain"}</h1><p>Learning since ${BRAIN.since}${co && !emp ? `, from ${learners} ${learners === 1 ? "person" : "people"}` : ""}. It writes itself from what ${emp ? "Mike does" : co ? "the team does" : "you do"}, as plain files you can open any time. Nothing to fill in. Sample.</p></div>
      <ul class="tree">${tree}</ul>
      <p class="small muted" style="margin-top: var(--space-lg)">${count} files. New ones show up on their own. Customer names and sign-ins never leave ${emp ? "Mike’s" : "your"} account.${emp ? " Renting, selling or copying is managed by your company." : ""}</p>
      ${s.shareState === "open" ? `<div class="stack-sm" style="margin-top: var(--space-xl)"><h2>Share</h2>${field("Invite by email", `<input class="input" id="sh-email" type="email" inputmode="email" autocomplete="off" data-bind="shareDraft" data-rerender value="${esc(s.shareDraft)}" placeholder="name@example.com">`, "They can read the skills/ and how-to/ folders. Never jobs/, customers or sign-ins.", "sh-email")}</div>` : ""}
      ${s.shareState === "sent" ? `<div style="margin-top: var(--space-lg)">${note("green", `<strong>Invite sent (sample).</strong> ${esc(s.shareTo)} can read your skills and how-to folders. Nothing was really sent.`)}</div>` : ""}
      ${s._dl ? `<div style="margin-top: var(--space-lg)">${note("green", "<strong>Copy ready (sample).</strong> A small zip of these files. No sign-ins inside.")}</div>` : ""}
      ${s.shareState === "open"
        ? action(btn("Send", "send", { kind: "btn--primary", disabled: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.shareDraft.trim()) }), "", btn("Cancel", "share", { kind: "btn--quiet btn--sm" }))
        : action(btn("Share", "share", { kind: "btn--primary" }), "", `${btn("Download a copy", "dl", { kind: "btn--quiet btn--sm" })}<span class="linkline muted">Shared as ${esc(who)}</span>`)}
    </div>`;
  },
  actions: {
    fold(s, el) { const f = el.dataset.f; s.brainClosed = s.brainClosed.includes(f) ? s.brainClosed.filter(x => x !== f) : [...s.brainClosed, f]; },
    share(s) { s.shareState = s.shareState === "open" ? "" : "open"; s._dl = false; },
    async send(s, el) { const to = s.shareDraft.trim(); if (!to) return false; await simulate(el, 700); s.shareTo = to; s.shareDraft = ""; s.shareState = "sent"; },
    async dl(s, el) { await simulate(el, 900); s._dl = true; s.shareState = ""; },
  },
};

const back = (to = "#/more", label = "More") => `<a class="back" href="${to}">‹ ${label}</a>`;

export const more = {
  id: "more", title: "More", addr: "traque.com/more",
  render(s) {
    const co = company();
    return `<div class="screen">
      <div class="head"><a class="back" href="#/done">‹ Home</a><h1>More</h1></div>
      <div class="rows">
        ${row("Plan", co ? "Company" : "Solo", "", "#/plan")}
        ${row(co ? "The company brain" : "Your brain", `Learning since ${BRAIN.since}. Plain files you can open, share or download.`, "", "#/skills")}
        ${row("Your public page", `traque.com/${esc(SAMPLE.user)}`, status(s.page.listed ? "on" : "off", s.page.listed ? "Listed" : "Not listed"), "#/page")}
        ${row("Your doorman", "The AI on your page. Who it talks to, what it shares.", "", "#/doorman")}
        ${row("Your calendar", s.cal.kind === "google" ? "Google" : "Outlook", status(s.cal.state), "#/calendar")}
        ${row("Build with Zapier", "Say what you want built, in plain words.", "", "#/other")}
        ${co ? row("Company services", "What the company pays for.", "", "#/services") : ""}
        ${co ? row("Company connections", "Set up once for the whole team.", "", "#/shared") : ""}
        ${co ? row("Look at it as", s.view === "owner" ? "Owner (you)" : "Mike R., tech", "", "#/viewas") : ""}
      </div>
      <p class="small muted" style="margin-top: var(--space-xl)">Prototype. Nothing here is live.</p>
    </div>`;
  },
  actions: {},
};

export const plan = {
  id: "plan", title: "Plan", addr: "traque.com/more/plan",
  render(s) {
    return `<div class="screen">
      <div class="head">${back()}<h1>Your plan</h1><p>Prices aren’t set yet. Switching keeps everything.</p></div>
      <div class="choices" role="radiogroup" aria-label="Plan">
        ${choice("Solo", "Just you and your phone. $ — a month.", { action: "pick", attrs: 'data-p="solo"', on: s.plan === "solo" })}
        ${choice("Company", "You and your team. Team view, company services, less per person. $ — a month.", { action: "pick", attrs: 'data-p="company"', on: s.plan === "company" })}
      </div>
      ${action(link("Done", "#/more", "btn btn--primary"))}
    </div>`;
  },
  actions: { pick(s, el) { s.plan = el.dataset.p; s.biz.team = s.plan === "company"; if (s.plan === "solo") s.view = "owner"; } },
};

export const shared = {
  id: "shared", title: "Company connections", addr: "traque.com/more/company-connections",
  render(s) {
    if (!company()) return `<div class="screen"><div class="head">${back()}<h1>Company connections</h1></div>${note("", "This is for Company accounts.")}${action(link("Back", "#/more", "btn btn--primary"))}</div>`;
    if (s.view !== "owner") return `<div class="screen"><div class="head">${back()}<h1>Company connections</h1><p>Managed by your company.</p></div>${note("", "Set up once by the owner. You use them without signing in to anything.")}${action(link("Back", "#/more", "btn btn--primary"))}</div>`;
    const d = s.sharedDraft;
    return `<div class="screen">
      <div class="head">${back()}<h1>Company connections</h1><p>Set up once. Everyone you choose gets it in their own Traque. They never see the company’s sign-in.</p></div>
      ${zapierKey(s)}
      <h2 style="margin-top: var(--space-xl)">Other connections</h2>
      <div class="rows">${s.shared.map(c => `<div class="row"><span class="row__body"><span class="row__title">${esc(c.name)}</span><span class="row__sub">${esc(c.does)} · for ${c.who.map(w => ({ owner: "owner", tech: "techs", office: "office" })[w]).join(", ")}${c.when ? ` · checked ${esc(c.when)}` : ""}</span></span><span class="row__end">${status(c.state)}${c.state === "waiting" ? btn("Check", "check", { kind: "btn--sm", attrs: `data-id="${c.id}"` }) : c.state === "connected" ? btn("Pause", "pause", { kind: "btn--quiet btn--sm", attrs: `data-id="${c.id}"` }) : btn("Resume", "pause", { kind: "btn--sm", attrs: `data-id="${c.id}"` })}</span></div>`).join("")}</div>
      ${s._add ? `<div class="stack" style="margin-top: var(--space-xl)">
        ${field("Name", `<input class="input" id="sh-name" data-bind="sharedDraft.name" data-rerender value="${esc(d.name)}" placeholder="e.g. Jobber">`, "", "sh-name")}
        ${field("Link from the provider", `<input class="input mono" id="sh-link" data-bind="sharedDraft.link" data-rerender value="${esc(d.link)}" placeholder="https://" inputmode="url">`, "Paste the link they gave you. Nothing is contacted until you press Check.", "sh-link")}
      </div>` : ""}
      <p class="small muted" style="margin-top: var(--space-xl)">“Waiting on you” means the provider hasn’t approved it yet. It says Connected only after a check from Traque works.</p>
      ${s._add ? action(btn("Add it", "add", { kind: "btn--primary", disabled: !d.name.trim() || !d.link.trim() }), "", btn("Cancel", "toggle", { kind: "btn--quiet btn--sm" })) : action(btn("Add a connection", "toggle", { kind: "btn--primary" }))}
    </div>`;
  },
  actions: {
    ...zapierKeyActions,
    toggle(s) { s._add = !s._add; },
    add(s) { const d = s.sharedDraft; if (!d.name.trim() || !d.link.trim()) return false; s.shared.push({ id: "s" + Date.now(), name: d.name.trim(), does: "Not set yet", who: ["owner", "tech", "office"], state: "waiting", when: null }); s.sharedDraft = { name: "", link: "" }; s._add = false; },
    async check(s, el) { const c = s.shared.find(x => x.id === el.dataset.id); await simulate(el, 1000); if (!c._once) { c._once = true; toast("Still waiting on the provider. Nothing connected yet."); return; } c.state = "connected"; c.when = "just now"; },
    pause(s, el) { const c = s.shared.find(x => x.id === el.dataset.id); c.state = c.state === "paused" ? "connected" : "paused"; },
  },
};

export const viewas = {
  id: "viewas", title: "Look at it as", addr: "traque.com/more/view",
  render(s) {
    return `<div class="screen">
      <div class="head">${back()}<h1>Look at it as</h1><p>See what a team member sees. Prototype only.</p></div>
      <div class="choices" role="radiogroup" aria-label="View as">${choice("Owner (you)", "", { action: "v", attrs: 'data-v="owner"', on: s.view === "owner" })}${choice("Mike R., tech", "Own notes, company how-to, no renting or selling.", { action: "v", attrs: 'data-v="employee"', on: s.view === "employee" })}</div>
      ${action(link("Done", "#/done", "btn btn--primary"))}
    </div>`;
  },
  actions: { v(s, el) { s.view = el.dataset.v; } },
};
