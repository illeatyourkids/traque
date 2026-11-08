import { SAMPLE, LEARNED, SHARED_DOWN, SKILLS, company } from "./state.js";
import { zapierKey, zapierKeyActions } from "./screens.js";
import { esc, status, note, btn, link, field, choice, row, switchCtl, action, toast, simulate, copyText } from "./ui.js";

/* ---------- Your skills (writes itself) ---------- */
export const skills = {
  id: "skills", title: "Your skills", addr: "traque.com/skills",
  render(s) {
    const emp = company() && s.view !== "owner";
    const list = emp ? SKILLS.employee : SKILLS.owner;
    const who = emp ? "Mike R." : SAMPLE.owner;
    return `<div class="screen">
      <div class="head"><a class="back" href="#/done">‹ Home</a><h1>Your skills</h1><p>This page writes itself as ${emp ? "Mike uses" : "you use"} Traque. Nothing to fill in. Sample content.</p></div>
      <div class="rows">${list.map(k => `<div class="row"><span class="row__body"><span class="row__title">${esc(k.skill)}</span><span class="row__sub">${esc(k.how)}</span></span><span class="row__end"><span class="xs muted tabular">${esc(k.when)}</span></span></div>`).join("")}</div>
      <p class="small muted" style="margin-top: var(--space-lg)">${list.length} skill${list.length === 1 ? "" : "s"} so far. New ones show up here on their own. Customer names never do.</p>
      ${s.shareState === "open" ? `<div class="stack-sm" style="margin-top: var(--space-xl)"><h2>Share</h2><div class="choices">${choice("Copy a link", `traque.com/${esc(SAMPLE.user)}/skills`, { action: "copy" })}${choice("Send to a teammate", company() ? "They get it in their Traque." : "Needs the Company plan.", { action: "send", attrs: company() ? "" : 'aria-disabled="true"' })}</div></div>` : ""}
      ${s.shareState === "sent" ? `<div style="margin-top: var(--space-lg)">${note("green", "<strong>Sent (sample).</strong> Dana will see it in her Traque.")}</div>` : ""}
      ${s.shareState === "copied" ? `<div style="margin-top: var(--space-lg)">${note("green", "<strong>Link copied.</strong> Anyone with it sees the skills, not your customers.")}</div>` : ""}
      ${action(btn(s.shareState === "open" ? "Close" : "Share", "share", { kind: "btn--primary" }), "", `<span class="linkline muted">Shared as ${esc(who)}</span>`)}
    </div>`;
  },
  actions: {
    share(s) { s.shareState = s.shareState === "open" ? "" : "open"; },
    async copy(s, el) { await copyText(`https://traque.com/${SAMPLE.user}/skills`, el); s.shareState = "copied"; },
    async send(s, el) { if (!company()) return false; await simulate(el, 700); s.shareState = "sent"; },
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
        ${row("Your skills", "Writes itself as you work. Share it.", "", "#/skills")}
        ${row("What Traque knows", "Read or download what it’s learned.", "", "#/notes")}
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

export const notes = {
  id: "notes", title: "What Traque knows", addr: "traque.com/more/notes",
  render(s) {
    const co = company(); const emp = co && s.view !== "owner";
    const items = emp
      ? [["My notes", "Things I’ve written down on jobs. Mine only."], ["Today’s jobs", "What I’m on today."], ["How-to notes from the company", `${SHARED_DOWN.length} notes, kept up to date.`], ["What I’ve taught the company", `${LEARNED.filter(l => l.who === "Mike R." && !s.removed.includes(l.id)).length} lessons went up.`]]
      : [["Your business", `${esc(s.biz.name)} · ${esc(s.biz.trade)} · ${esc(s.biz.town)}`], ["Your reply", `“${esc(s.goal.reply.slice(0, 60))}…” after ${s.goal.wait} min`], ["What you’ve taught it", co ? `${LEARNED.filter(l => !s.removed.includes(l.id)).length} lessons from the team this week` : "3 lessons so far"], ["How-to notes", `${SHARED_DOWN.length} notes`]];
    return `<div class="screen">
      <div class="head">${back()}<h1>${emp ? "What Traque knows about my work" : "What Traque knows"}</h1><p>Plain files you can read any time. ${emp ? "Your customer details and sign-ins stay with you." : "Customer details and your sign-ins never leave your account."}</p></div>
      <div class="rows">${items.map(([t, sub]) => row(esc(t), sub, "", "")).join("")}</div>
      ${emp ? `<div class="stack-sm" style="margin-top: var(--space-xl)">${note("", "Renting, selling or copying the company’s know-how is managed by your company.")}</div>` : ""}
      ${s._dl ? `<div style="margin-top: var(--space-lg)">${note("green", "<strong>Copy ready (sample).</strong> A small zip of plain text files. No sign-ins inside.")}</div>` : ""}
      ${action(btn("Download a copy", "dl", { kind: "btn--primary" }))}
    </div>`;
  },
  actions: { async dl(s, el) { await simulate(el, 900); s._dl = true; } },
};

export const shared = {
  id: "shared", title: "Company connections", addr: "traque.com/more/company-connections",
  render(s) {
    if (!company()) return `<div class="screen"><div class="head">${back()}<h1>Company connections</h1></div>${note("", "This is for Company accounts.")}${action(link("Back", "#/more", "btn btn--primary"))}</div>`;
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
