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
// Things people ask for in plain words. `say` is the phrase a tap adds to their sentence; `does` is what
// Traque reads back as the plain-language summary; `match` is how we spot it in what they typed.
export const ASKS = [
  { id: "email", name: "Business email", say: "read new inquiries in my business email", does: "Read new inquiries in your business email. It never sends email.", match: /\b(e-?mail|gmail|inbox|inquir)/i },
  { id: "customers", name: "Customer list", say: "see my customer list", does: "See your customer list, so it can tell a work number from a personal one.", match: /customer list|contacts/i },
  { id: "jobber", name: "Jobber", say: "text customers from Jobber", does: "See customers and jobs in Jobber, and text those customers from your number.", match: /jobber|housecall|servicetitan/i },
  { id: "texting", name: "Texting", say: "text customers back", does: "Text customers back from your number, in your words.", match: /\btext/i },
  { id: "reminders", name: "Appointment reminders", say: "text appointment reminders the day before", does: "Text each customer a reminder the day before their appointment.", match: /remind/i },
  { id: "reviews", name: "Review request texts", say: "ask happy customers for a review", does: "After a finished job, text the customer once to ask for a review.", match: /review/i },
  { id: "parts", name: "Parts lookup", say: "look up part numbers", does: "Look up part numbers at your supplier. It never orders.", match: /\bparts?\b/i },
  { id: "mileage", name: "Mileage log", say: "log my drives between jobs", does: "Keep a log of drives between jobs.", match: /mileage|drives?\b/i },
  { id: "cards", name: "thanks.io", say: "send a thank-you card after a job through thanks.io", does: "After a finished job, send one mailed thank-you card through thanks.io.", match: /thank|card/i },
  { id: "quickbooks", name: "QuickBooks", say: "see unpaid invoices in QuickBooks", does: "See which invoices are unpaid in QuickBooks. It never changes them.", match: /quickbooks|invoice/i },
];
export const askById = (id) => ASKS.find(a => a.id === id);
// Plain-language read-back of what someone typed. Nothing is granted here; it only says what it understood.
export function understand(text) {
  const got = ASKS.filter(a => a.match.test(text || ""));
  // Jobber already covers texting its customers, so don't list texting twice.
  return got.some(a => a.id === "jobber") ? got.filter(a => a.id !== "texting") : got;
}
export const TOOLS = [
  { id: "cards", name: "thanks.io", sub: "Mailed thank-you cards after a job.", sample: false },
  { id: "reviews", name: "Review request texts", sub: "Ask a happy customer for a review.", sample: true },
  { id: "parts", name: "Parts lookup", sub: "Find a part number on the job.", sample: true },
];
// Skills and services Traque itself suggests. One tap adds the phrase to your sentence; nothing is installed or connected by adding.
export const RECOMMENDED = [
  { id: "email", name: "Business email", sub: "Reads new inquiries. Never sends." },
  { id: "customers", name: "Customer list", sub: "Tells work numbers from personal ones." },
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
// Directory sample data. Owner-run, one-location home-service businesses. All sample.
export const DIR_TRADES = ["Heating & air", "Plumbing", "Electrical", "Appliance repair", "Garage door repair", "Roofing", "Pest control", "Septic"];
export const PROS = [
  { slug: SAMPLE.user, name: SAMPLE.business, owner: SAMPLE.owner, trade: "Heating & air", town: SAMPLE.town, area: "Warwick, Florida, Goshen, Monroe and Pine Island", tagline: "Furnaces, heat pumps and AC, fixed by the owner.", about: ["Justin has run the shop since 2014 and still goes on every call. One truck, one phone, no call center.", "Visits are a set price and count toward the repair. If a unit can be fixed, it gets fixed; replacement is the last answer, not the first."], tags: ["furnaces", "heat-pumps", "ac-repair"], checked: { owner: "Owner statement, Nov 2026", place: "One location, Warwick", license: "NY HVAC license on file (sample)" }, mine: true },
  { slug: "maria.delgado", name: "Delgado Electric", owner: "Maria Delgado", trade: "Electrical", town: "Goshen, NY", area: "Goshen, Chester and Warwick", tagline: "Panels, troubleshooting and EV chargers.", about: ["Maria is a master electrician with 20 years in Orange County. She answers her own phone.", "Clear written estimates before work starts. Extra work is approved by you first."], tags: ["panels", "ev-chargers", "troubleshooting"], checked: { owner: "Owner statement, Oct 2026", place: "One location, Goshen", license: "NY electrical license on file (sample)" } },
  { slug: "tom.kowalski", name: "Kowalski Plumbing", owner: "Tom Kowalski", trade: "Plumbing", town: "Monroe, NY", area: "Monroe, Harriman and Warwick", tagline: "Leaks, drains and water heaters, same week.", about: ["Tom and his son run two vans out of Monroe. Family owned since 1998.", "Water heater swaps are quoted flat. Drain calls are by the hour, told up front."], tags: ["water-heaters", "drains", "leaks"], checked: { owner: "Owner statement, Oct 2026", place: "One location, Monroe", license: "NY plumbing license on file (sample)" } },
  { slug: "ridgeline.roofing", name: "Ridgeline Roofing", owner: "Dave Okafor", trade: "Roofing", town: "Chester, NY", area: "Chester, Goshen and Warwick", tagline: "Leak repairs first. Replacement only when it’s time.", about: ["Dave climbs every roof himself before quoting. Photos come with every estimate."], tags: ["leaks", "repairs", "replacement"], checked: { owner: "Owner statement, Sep 2026", place: "One location, Chester", license: "Insurance on file (sample)" } },
  { slug: "hv.appliance", name: "Hudson Valley Appliance Repair", owner: "Priya Nair", trade: "Appliance repair", town: "Chester, NY", area: "Orange County", tagline: "Fridges, washers, dryers and dishwashers.", about: ["Priya fixes what others say to replace. Parts quoted before she orders."], tags: ["refrigerators", "washers", "dishwashers"], checked: { owner: "Owner statement, Nov 2026", place: "One location, Chester", license: "Insurance on file (sample)" } },
  { slug: "clearwater.septic", name: "Clearwater Septic", owner: "Ray Thompson", trade: "Septic", town: "Goshen, NY", area: "Goshen, Florida and Pine Island", tagline: "Pumping, repairs and inspections.", about: ["Ray has pumped tanks in Orange County for 30 years. He tells you when you don’t need him yet."], tags: ["pumping", "inspections"], checked: { owner: "Owner statement, Aug 2026", place: "One location, Goshen", license: "NY septic license on file (sample)" } },
  { slug: "pine.island.doors", name: "Pine Island Garage Doors", owner: "Sam Alvarez", trade: "Garage door repair", town: "Pine Island, NY", area: "Pine Island, Warwick and Florida", tagline: "Springs, openers and doors.", about: ["Sam stocks springs on the truck, so most calls are one visit."], tags: ["springs", "openers"], checked: { owner: "Owner statement, Oct 2026", place: "One location, Pine Island", license: "Insurance on file (sample)" } },
];
export const proBySlug = (slug) => PROS.find(p => p.slug === slug) || PROS[0];
// Sample doorman conversations. Visitor picks who they are; the AI answers what the owner allows and books or hands off.
export const TALK = {
  customer: [["them", "New customer. My furnace is 18 years old and short-cycling. What would a quote run?"], ["ai", "{owner} does a $— visit first, and it counts toward the repair or a new unit. He’s in Warwick on Tuesday. 9 am or 1 pm?"], ["them", "Tuesday 9."], ["ai", "Booked: Tuesday 9 am, furnace quote. {owner} gets a text now. What’s the street, and a name for him?"]],
  vendor: [["them", "I’m with a parts distributor. We’d like to set {owner} up on a trade account."], ["ai", "Thanks. {owner} doesn’t take vendor calls on the job. I’ll put your name and one line in his Friday summary. What should it say?"], ["them", "Hudson Valley Supply, 10% off the first order, ask for Lena."], ["ai", "Got it. It goes in Friday’s summary. If he’s interested he’ll reach out. Nothing else goes through today."]],
  partner: [["them", "I’m a realtor in Warwick. I’d like to send clients your way for inspections."], ["ai", "Good to hear. {owner} handles partner setups himself. I’ve sent him your note; expect a text within a day or two."]],
  other: [["them", "I’m someone’s AI. Does {biz} take new customers in Florida, NY?"], ["ai", "Yes. Florida is in the service area. For a visit, say what the problem is and I can offer times."]],
};
export const VISITORS = [
  { when: "Nov 8", who: "New customer", wanted: "Furnace quote", result: "Booked Tue 9 am" },
  { when: "Nov 7", who: "Vendor", wanted: "Parts trade account", result: "In Friday’s summary" },
  { when: "Nov 7", who: "New customer", wanted: "Do you cover Pine Island?", result: "Answered: yes" },
  { when: "Nov 5", who: "Partner", wanted: "Realtor referral setup", result: "Sent to you" },
  { when: "Nov 4", who: "Someone’s AI", wanted: "Open times this week", result: "Answered" },
];
export const PAY = { match: "We match what they spend", amount: "We pay a set amount a month", suggest: "We just recommend it" };

export const defaults = () => ({
  plan: "solo",
  ai: "chatgpt",
  aiState: "not-connected",      // not-connected | waiting | connected
  biz: { name: SAMPLE.business, trade: "Heating & air", town: SAMPLE.town, team: false, count: 2 },
  goal: { picks: [GOALS[0]], text: "", reply: "Hi, it’s Justin at Tracy Heating & Air. I’m on a job. Text me what’s going on and I’ll get back to you soon.", wait: 10, missed: true, agreed: false },
  phone: { device: "android", step: 0, state: "not-connected", tested: false },   // steps: 0 install, 1 allow, 2 pair, 3 test
  // Calendar is its own step, not through Zapier.
  cal: { kind: "google", state: "not-connected" },   // kind: google | outlook
  // Other services run through Zapier. The person says what they want in words; Traque reads back what it understood.
  zap: { text: "", stage: "edit", allowed: [] },   // stage: edit | review | waiting | connected
  // Company plan: the company owns one Zapier account. The owner saves its key once; the team uses it without seeing it.
  // The key itself is never kept in this prototype, only whether one was saved.
  coZap: { saved: false, state: "not-connected" },
  recTab: "traque",              // traque | company | mine
  added: [],                     // ids from ASKS the person tapped Add on
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
  dir: { q: "", trade: "", sort: "new", pick: SAMPLE.user },
  talk: { who: "" },              // "" | customer | vendor | partner | other
  door: { who: "both", share: { price: true, area: true, times: true, phone: false }, send: "quotes-now", saved: false },
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
