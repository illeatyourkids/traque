const KEY = "traque-proto-v2";

export const SAMPLE = { owner: "Justin Tracy", business: "Tracy Heating & Air", town: "Warwick, NY", phone: "(845) 555-0142", user: "justin.tracy" };
export const AIS = { chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini" };
export const TRADES = ["Heating & air", "Plumbing", "Electrical", "Roofing", "Landscaping", "General contractor", "Other"];
export const GOALS = ["Stop losing jobs when I can’t pick up", "Get home at a reasonable hour", "Stop answering the same questions", "Let the office handle more"];
export const TEAM = [
  { who: "Justin Tracy", role: "Owner", handled: 22, reply: "4 min", booked: 5, used: "18.00", cap: "25.00", lookups: 14 },
  { who: "Mike R.", role: "Tech", handled: 15, reply: "11 min", booked: 3, used: "9.00", cap: "35.00", lookups: 6 },
  { who: "Dana L.", role: "Office", handled: 9, reply: "3 min", booked: 1, used: "0.00", cap: "35.00", lookups: 9 },
];
// What the company picked up from each person’s own notes. Automatic. Only the lesson travels.
export const LEARNED = [
  { id: "l1", who: "Mike R.", date: "Nov 7", text: "On mini-split no-cool calls, check the float switch first." },
  { id: "l2", who: "Dana L.", date: "Nov 6", text: "When someone asks for a price on the phone, say we do a $— visit first and it counts toward the repair." },
  { id: "l3", who: "Mike R.", date: "Nov 4", text: "Pine Island: allow 15 extra minutes. The bridge is closed weekdays till spring." },
];
export const SHARED_DOWN = ["How to answer a no-heat call", "After-hours text", "Price-question answer"];
export const PROCESSES = [
  { id: "after-hours", name: "After-hours text", ready: true },
  { id: "no-heat", name: "How to answer a no-heat call", ready: true },
  { id: "maint", name: "Spring and fall reminders", ready: false },
];
export const OTHER = [
  { id: "calendar", name: "Calendar", sub: "So Traque knows when you’re booked." },
  { id: "email", name: "Business email", sub: "Reads new inquiries. Never sends." },
  { id: "customers", name: "Customer list", sub: "Tells work numbers from personal ones." },
];
export const TOOLS = [
  { id: "cards", name: "thanks.io", sub: "Mailed thank-you cards after a job.", sample: false },
  { id: "reviews", name: "Review request texts", sub: "Ask a happy customer for a review.", sample: true },
  { id: "parts", name: "Parts lookup", sub: "Find a part number on the job.", sample: true },
];
// Skills and services Traque itself suggests. One tap adds one to your list; nothing is installed or connected by adding.
export const RECOMMENDED = [
  { id: "reminders", name: "Appointment reminders", sub: "Texts the customer the day before." },
  { id: "reviews", name: "Review request texts", sub: "Asks a happy customer for a review." },
  { id: "parts", name: "Parts lookup", sub: "Find a part number on the job." },
  { id: "mileage", name: "Mileage log", sub: "Keeps track of drives between jobs." },
];
// Each person’s skill file writes itself as they use Traque. Sample content; nothing to fill in.
export const SKILLS = {
  owner: [
    { when: "Nov 8", skill: "Answering no-heat calls", how: "You asked about the thermostat screen first on 6 calls. Traque now asks it for you." },
    { when: "Nov 6", skill: "Quoting a visit", how: "You said “the visit price counts toward the repair” 4 times. It’s in your reply now." },
    { when: "Nov 4", skill: "After-hours texts", how: "You replied to late texts the next morning by 8. Traque tells customers that." },
    { when: "Nov 2", skill: "Service area", how: "You turned down 2 jobs across the river. Traque knows not to book them." },
  ],
  employee: [
    { when: "Nov 7", skill: "Mini-split no-cool", how: "Mike checked the float switch first on 3 of 5 calls. Traque suggests it now." },
    { when: "Nov 4", skill: "Pine Island drive time", how: "Mike added 15 minutes to 3 Pine Island jobs. Traque pads them now." },
  ],
};
export const PAY = { match: "We match what they spend", amount: "We pay a set amount a month", suggest: "We just recommend it" };

export const defaults = () => ({
  plan: "solo",
  ai: "chatgpt",
  aiState: "not-connected",      // not-connected | waiting | connected
  biz: { name: SAMPLE.business, trade: "Heating & air", town: SAMPLE.town, team: false, count: 2 },
  goal: { picks: [GOALS[0]], text: "", reply: "Hi, it’s Justin at Tracy Heating & Air. I’m on a job. Text me what’s going on and I’ll get back to you soon.", wait: 10, missed: true, agreed: false },
  phone: { device: "android", step: 0, state: "not-connected", tested: false },   // steps: 0 install, 1 allow, 2 pair, 3 test
  other: { calendar: "not-connected", email: "not-connected", customers: "not-connected" },
  recTab: "traque",              // traque | company | mine
  added: [],                     // ids from RECOMMENDED (or company picks) the person tapped Add on
  coAdded: [],                   // Company services step: ids the company added from Traque’s list
  shareState: "",
  shared: [
    { id: "s1", name: "Jobber", does: "See customers and add job notes", who: ["owner", "tech", "office"], state: "connected", when: "Nov 7" },
    { id: "s2", name: "Parts supplier (sample)", does: "Look up parts", who: ["owner", "tech"], state: "waiting", when: null },
  ],
  sharedDraft: { name: "", link: "" },
  team: { invites: [{ who: "Mike R.", role: "Tech", state: "active" }, { who: "Dana L.", role: "Office", state: "active" }], draft: "", role: "tech", skipped: false },
  view: "owner",                 // owner | employee
  range: "week",
  removed: [],
  tools: { cards: { state: "connected", pay: "match", cap: "25" }, reviews: { state: "not-connected", pay: "amount", cap: "10" }, parts: { state: "not-connected", pay: "suggest", cap: "" } },
  rent: { process: "no-heat", shared: false },
  sell: { kind: "", prepared: false },
  clone: { name: "Tracy Heating & Air — Monroe", include: { "after-hours": true, "no-heat": true, maint: false }, done: false },
  page: { listed: false, saved: false },
  done: false,
});

let state = load();
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return merge(defaults(), JSON.parse(raw)); } catch (_) { /* ignore */ }
  return defaults();
}
function merge(base, over) {
  if (Array.isArray(base) || typeof base !== "object" || base === null) return over === undefined ? base : over;
  const out = { ...base }; for (const k of Object.keys(over || {})) out[k] = merge(base[k], over[k]); return out;
}
export function get() { return state; }
export function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* ignore */ } }
export function reset() { state = defaults(); save(); }
export const company = () => state.plan === "company";
