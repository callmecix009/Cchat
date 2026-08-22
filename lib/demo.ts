export type Product = {
  id: string;
  name: string;
  cat: string;
  price: number;
  stock: number;
  emoji: string;
  cl: string;
  kw: string[];
  sold: number;
  hidden: boolean;
};

export type Service = {
  id: string;
  name: string;
  desc: string;
  price: number;
  from: boolean;
  dur: string;
  booking: boolean;
  warranty: string;
};

export type ConvoMsg = { from: "c" | "ai" | "me" | "sys"; text: string; t: number };

export type Convo = {
  id: string;
  name: string;
  phone: string;
  lang: "sw" | "en";
  status: "ai" | "waiting" | "closed";
  t: number;
  msgs: ConvoMsg[];
  reason: string | null;
  takeover: boolean;
  greeted: boolean;
  outcome: "sold" | "no" | null;
  soldProduct: string | null;
};

export type Policy = {
  deliveryMode: "paid" | "free" | "no";
  areas: { area: string; fee: number; time: string }[];
  freeOver: number;
  payments: { name: string; detail: string }[];
  payTiming: string;
  deposits: string;
  receipts: boolean;
  warranty: { cat: string; dur: string; not: string }[];
  returns: string;
  refunds: string;
  hours: Record<string, string>;
  outOfStockBehavior: "both" | "suggest" | "notify";
  restockDays: number;
  custom: string[];
};

export type AiConfig = {
  tone: string;
  personality: string;
  greetSw: string;
  greetEn: string;
  langMode: "auto" | "sw" | "en";
  proactive: boolean;
  pushiness: number;
  upsell: boolean;
  trigHuman: boolean;
  trigNegotiation: boolean;
  trigAngry: boolean;
  trigKeywords: string[];
  hoursFrom: string;
  hoursTo: string;
  handoffMsgSw: string;
  handoffMsgEn: string;
  offlineMsgSw: string;
  offlineMsgEn: string;
  collectContact: boolean;
  notifyHandoff: boolean;
  negotiable: boolean;
  maxDiscount: number;
  answerLen: "short" | "long";
  emojis: boolean;
};

export type Activity = { type: string; txt: string; t: number; tone: string };

export type DemoState = {
  business: {
    name: string;
    desc: string;
    city: string;
    owner: string;
    phone: string;
    slogan: string;
  };
  products: Product[];
  services: Service[];
  policies: Policy;
  ai: AiConfig;
  conversations: Convo[];
  activity: Activity[];
  stats: { total: number; today: number; aiResolved: number; handedOff: number; swMsgs: number; enMsgs: number };
  msgsByDay: number[];
  salesToday: { p: string; amt: number }[];
  lowStockThreshold: number;
};

export const NOW = Date.now();
export const ago = (min: number) => NOW - min * 60000;

export const uid = () => "x" + Math.random().toString(36).slice(2, 9);
export const TZS = (n: number) => "TZS " + Number(n || 0).toLocaleString("en-US");
export const fmtClock = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
export const fmtT = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export function fmtDay(ts: number) {
  const d = new Date(ts);
  const t = new Date();
  const dd = (a: Date) => a.toDateString();
  if (dd(d) === dd(t)) return fmtT(ts);
  const y = new Date(t.getTime() - 864e5);
  if (dd(d) === dd(y)) return "Yesterday " + fmtT(ts);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " + fmtT(ts);
}
export function agoStr(ts: number) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "now";
  if (m < 60) return m + "m ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + "h ago";
  return Math.round(h / 24) + "d ago";
}
export const initials = (n: string) => {
  const words = (n || "")
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w));
  if (!words.length) return "?";
  const letters = words
    .map((w) => w.replace(/[^A-Za-z0-9]/g, "")[0] || "")
    .filter(Boolean);
  const two = letters.slice(0, 2).join("").toUpperCase();
  if (two.length >= 2) return two;
  const first = words[0].replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return first.slice(0, 2) || "?";
};
export const AVC = ["#149A5B", "#22688A", "#B97708", "#6A4FC0", "#C74343", "#0E7A47", "#8A5A2B"];
export const avColor = (n: string) => AVC[(n.charCodeAt(0) + n.length) % AVC.length];

export function createSeed(): DemoState {
  const P = (
    id: string,
    name: string,
    cat: string,
    price: number,
    stock: number,
    emoji: string,
    cl: string,
    kw: string[],
    sold: number
  ): Product => ({ id, name, cat, price, stock, emoji, cl, kw, sold, hidden: false });
  const products: Product[] = [
    P("p1", "iPhone 13 128GB", "Phones", 1450000, 3, "📱", "#E8F0FE", ["iphone", "13", "apple"], 4),
    P("p2", "iPhone 11 64GB", "Phones", 720000, 3, "📱", "#FDECEC", ["iphone", "11", "apple"], 7),
    P("p3", "Samsung Galaxy A54", "Phones", 890000, 7, "📱", "#E7F6EC", ["samsung", "galaxy", "a54"], 6),
    P("p4", "Samsung Galaxy A14", "Phones", 420000, 12, "📱", "#E7F6EC", ["samsung", "galaxy", "a14"], 9),
    P("p5", "Tecno Spark 10", "Phones", 285000, 15, "📱", "#FFF4DE", ["tecno", "spark"], 14),
    P("p6", "Tecno Camon 20", "Phones", 520000, 4, "📱", "#FFF4DE", ["tecno", "camon"], 5),
    P("p7", "Xiaomi Redmi 12", "Phones", 380000, 9, "📱", "#F3EDFB", ["xiaomi", "redmi"], 8),
    P("p8", "iPhone 14 Pro 256GB", "Phones", 2900000, 0, "📱", "#E8F0FE", ["iphone", "14", "pro", "apple"], 1),
    P("p9", "AirPods Pro 2", "Audio", 480000, 6, "🎧", "#E8F0FE", ["airpods", "earbuds"], 3),
    P("p10", "Anker Fast Charger 20W", "Accessories", 65000, 22, "🔌", "#E7F6EC", ["charger", "anker", "charging"], 19),
    P("p11", "iPhone 13 Silicone Case", "Accessories", 25000, 30, "🧴", "#FDECEC", ["case", "cover", "iphone"], 11),
    P("p12", "Tempered Glass Protector", "Accessories", 10000, 2, "🛡️", "#FFF4DE", ["protector", "glass", "screen"], 25),
    P("p13", "Power Bank 20000mAh", "Accessories", 95000, 8, "🔋", "#F3EDFB", ["power", "bank", "powerbank"], 10),
  ];
  const SV = (
    id: string,
    name: string,
    desc: string,
    price: number,
    from: boolean,
    dur: string,
    book: boolean,
    warr: string
  ): Service => ({ id, name, desc, price, from, dur, booking: book, warranty: warr });
  const services: Service[] = [
    SV("s1", "Screen Replacement — iPhone", "Original-quality screen fitting for all iPhone models. Tested before handover.", 120000, true, "~2 hours", true, "30 days on touch & display"),
    SV("s2", "Screen Replacement — Android", "Samsung, Tecno, Infinix, Xiaomi and more. Same-day for most models.", 60000, true, "1–3 hours", true, "30 days on touch & display"),
    SV("s3", "Software Installation & Flashing", "OS updates, unbricking, Google setup, app installation.", 30000, false, "~1 hour", false, "—"),
    SV("s4", "Battery Replacement", "Genuine-grade batteries with health check.", 45000, true, "~1 hour", true, "30 days"),
    SV("s5", "Data Transfer & Phone Setup", "Contacts, WhatsApp backup, photos moved safely to your new phone.", 15000, false, "~30 min", false, "—"),
    SV("s6", "Free Phone Diagnosis", "We check the fault and quote you before any repair. No charge.", 0, false, "~30 min", false, "—"),
  ];
  const conv = (
    id: string,
    name: string,
    phone: string,
    lang: "sw" | "en",
    status: "ai" | "waiting" | "closed",
    t0: number,
    msgs: ConvoMsg[],
    reason: string | null
  ): Convo => ({ id, name, phone, lang, status, t: t0, msgs, reason, takeover: false, greeted: true, outcome: null, soldProduct: null });
  const M = (from: "c" | "ai" | "sys", text: string, minAgo: number): ConvoMsg => ({ from, text, t: ago(minAgo) });
  const conversations: Convo[] = [
    conv("c1", "Amina Yusuph", "+255 712 334 201", "sw", "ai", ago(4), [
      M("c", "Habari, kuna iPhone 13? Bei gani?", 9),
      M("ai", "Habari Amina! 👋 Karibu Kariakoo Phone Centre. Ndiyo, tuna iPhone 13 128GB — TZS 1,450,000. Zimebaki 3 tu.", 8),
      M("ai", "Unaitumia kwa biashara au matumizi ya kawaida?", 8),
      M("c", "Ya biashara, napenda kupiga photos za bidhaa", 6),
      M("ai", "Safi kabisa! 128GB inatosha. Ukichukua leo tunakuongezea cover na glass protector bure 🎁", 5),
    ], null),
    conv("c2", "Baraka Mwaipopo", "+255 784 220 917", "sw", "waiting", ago(12), [
      M("c", "Habari boss, Tecno Spark 10 ngapi?", 18),
      M("ai", "Habari Baraka! Tecno Spark 10 iko TZS 285,000 — stock ipo vizuri. Unapenda rangi gani?", 17),
      M("c", "Punguza kidogo tu, niko na 230k", 14),
      { from: "sys", text: "Handoff → Juma · Customer asked to negotiate price", t: ago(13) },
      M("ai", "Sawa, nakupitishia Juma mwenyewe mzungumze bei. Subiri dakika chache 🙏", 13),
    ], "Customer asked to negotiate price"),
    conv("c3", "Neema Charles", "+255 765 800 122", "sw", "closed", ago(65), [
      M("c", "Simu yangu iPhone 11 screen imevunjika, mnaweza kurekebisha?", 70),
      M("ai", "Pole sana! Screen replacement ya iPhone inaanzia TZS 120,000, inachukua kama 2 hours. Tunaweka warranty ya siku 30.", 69),
      M("ai", "Unaweza ku-book leo? Tupo hadi 8 usiku.", 69),
      M("c", "Sawa nitakuja kesho asubuhi saa 4", 67),
      M("ai", "Perfect ✅ Kesho saa 4 asubuhi. Kumbuka deposit 50% inahitajika kwa booking ya repair.", 66),
      M("c", "Asante sana", 65),
      { from: "sys", text: "Resolved by AI · Booking created", t: ago(65) },
    ], null),
    conv("c4", "Joseph Kimaro", "+255 713 559 040", "sw", "closed", ago(130), [
      M("c", "Kuna iPhone 14 Pro?", 135),
      M("ai", "Kwa sasa iPhone 14 Pro imeisha 😔 Nikupe taarifa ikirudi? Au nikuonyeshe iPhone 13 128GB ambayo ipo karibu sana kwa bei nzuri?", 134),
      M("c", "Nijulishe tu ikirudi", 132),
      M("ai", "Sawa nimekuweka kwenye orodha ✅ Nitakutumia ujumbe mara tu ikifika. Asante kwa subira!", 131),
      { from: "sys", text: "Resolved by AI · Restock notify list", t: ago(130) },
    ], null),
    conv("c5", "Fatma Said", "+255 744 671 385", "sw", "closed", ago(190), [
      M("c", "Mnapeleka Mbezi? Delivery ngapi?", 195),
      M("ai", "Ndiyo tunaleta Mbezi! 🚚 Delivery ni TZS 10,000, inafika ndani ya 2–4 hours. Order zaidi ya TZS 500,000 delivery ni BURE.", 194),
      M("c", "Poa kabisa", 192),
      { from: "sys", text: "Resolved by AI", t: ago(190) },
    ], null),
    conv("c6", "Emmanuel Mushi", "+255 762 908 441", "en", "closed", ago(300), [
      M("c", "Hi, how much is the Samsung Galaxy A54?", 305),
      M("ai", "Hi Emmanuel! The Galaxy A54 is TZS 890,000 — we have 7 in stock. Would you prefer black or white?", 304),
      M("c", "Do you accept card payments?", 302),
      M("ai", "We accept M-Pesa, Tigo Pesa, Airtel Money and cash at the shop. No cards yet — sorry about that!", 301),
      { from: "sys", text: "Resolved by AI · English conversation", t: ago(300) },
    ], null),
    conv("c7", "Zubeda Ally", "+255 715 224 780", "sw", "waiting", ago(25), [
      M("c", "Simu niliyonunua wiki jana imeharibika! Screen inakatika yenyewe!", 30),
      M("ai", "Pole sana Zubeda 🙏 Simu yako bado iko ndani ya warranty ya miezi 12. Ilete dukani tuiangalie leo.", 29),
      M("c", "Hapana mnanisumbua! Nataka pesa zangu zirudishwe SASA hivi", 27),
      { from: "sys", text: "Handoff → Juma · Angry customer", t: ago(26) },
      M("ai", "Nakuelewa kabisa na naomba radhi. Nimemtaarifu Juma akuwasiliane nawe sasa hivi.", 26),
    ], "Angry customer"),
    conv("c8", "Halima John", "+255 719 300 657", "sw", "closed", ago(1500), [
      M("c", "Nalipaje kwa M-Pesa nikichukua Redmi 12?", 1505),
      M("ai", "Lipa kwa M-Pesa namba 0757 123 456 (JUMA HASSAN). Tukishapokea tunakutumia receipt papo hapo ✅", 1504),
      M("c", "Sawa nimetuma", 1501),
      M("ai", "Tumepokea 🎉 Asante Halima! Redmi 12 yako tayari — unakuja kuchukua au tukupelekee?", 1500),
      { from: "sys", text: "Resolved by AI · Sale TZS 380,000", t: ago(1500) },
    ], null),
  ];
  const A = (type: string, txt: string, min: number, tone = "sys"): Activity => ({ type, txt, t: ago(min), tone });
  const activity: Activity[] = [
    A("chat", "New conversation started — Amina Yusuph asked about iPhone 13", 4, "chat"),
    A("sale", "Sale · Tecno Spark 10 — TZS 285,000 (AI closed it)", 21, "sale"),
    A("hand", "Handoff to Juma — Baraka wants to negotiate price", 13, "hand"),
    A("sale", "Sale · Anker Fast Charger — TZS 65,000", 38, "sale"),
    A("ai", "AI resolved booking — Neema, screen replacement tomorrow 10:00", 65, "ai"),
    A("stock", "Low stock — Tempered Glass Protector (2 left)", 80, "stock"),
    A("hand", "Handoff to Juma — Zubeda is upset about a warranty claim", 26, "hand"),
    A("sale", "Sale · Xiaomi Redmi 12 — TZS 380,000 via M-Pesa", 120, "sale"),
    A("policy", "Delivery policy updated by Juma", 240, "policy"),
    A("sale", "Sale · Samsung Galaxy A14 — TZS 420,000", 300, "sale"),
    A("ai", "AI resolved 14 conversations yesterday", 1460, "ai"),
  ];
  return {
    business: {
      name: "Kariakoo Phone Centre",
      desc: "Phones, accessories and expert repairs in the heart of Kariakoo.",
      city: "Kariakoo, Dar es Salaam",
      owner: "Juma Hassan",
      phone: "+255 757 123 456",
      slogan: "Simu safi, bei poa!",
    },
    products,
    services,
    conversations,
    activity,
    policies: {
      deliveryMode: "paid",
      areas: [
        { area: "Kariakoo / City Centre", fee: 0, time: "1–2 hours" },
        { area: "Kinondoni / Mwenge", fee: 5000, time: "2–3 hours" },
        { area: "Masaki / Mikocheni", fee: 7000, time: "2–4 hours" },
        { area: "Ubungo", fee: 8000, time: "3–4 hours" },
        { area: "Mbezi / Tegeta", fee: 10000, time: "3–5 hours" },
      ],
      freeOver: 500000,
      payments: [
        { name: "M-Pesa", detail: "0757 123 456 — JUMA HASSAN" },
        { name: "Tigo Pesa", detail: "0714 999 222" },
        { name: "Airtel Money", detail: "0786 555 100" },
        { name: "Cash", detail: "Pay at the shop, Kariakoo" },
      ],
      payTiming: "Pay on pickup or on delivery",
      deposits: "50% deposit required for repair bookings",
      receipts: true,
      warranty: [
        { cat: "Smartphones", dur: "12 months", not: "Water damage, physical damage, opened seals" },
        { cat: "Accessories", dur: "3 months", not: "Misuse, cut cables" },
        { cat: "Repairs", dur: "30 days", not: "New damage after repair" },
      ],
      returns: "3 days in original condition with receipt and full packaging",
      refunds: "Exchanges preferred; refunds case by case",
      hours: {
        mon: "08:00 – 20:00",
        tue: "08:00 – 20:00",
        wed: "08:00 – 20:00",
        thu: "08:00 – 20:00",
        fri: "08:00 – 20:00",
        sat: "09:00 – 18:00",
        sun: "Closed",
      },
      outOfStockBehavior: "both",
      restockDays: 7,
      custom: ["All prices include VAT", "All phones are official Tanzania versions with valid IMEI"],
    },
    ai: {
      tone: "friendly",
      personality: "Warm street-smart Kariakoo energy. Calls customers \"boss\" or \"mdau\" occasionally. Never pushy.",
      greetSw: "Habari! 👋 Karibu Kariakoo Phone Centre — simu, accessories na matengenezo. Nikusaidieje leo?",
      greetEn: "Hi there! 👋 Welcome to Kariakoo Phone Centre — phones, accessories & repairs. How can I help today?",
      langMode: "auto",
      proactive: true,
      pushiness: 65,
      upsell: true,
      trigHuman: true,
      trigNegotiation: true,
      trigAngry: true,
      trigKeywords: ["mlipu", "boss wako", "manager"],
      hoursFrom: "08:00",
      hoursTo: "20:00",
      handoffMsgSw: "Sawa, nakupitishia Juma mwenyewe ahudumie. Subiri kidogo 🙏",
      handoffMsgEn: "Sure — let me bring Juma in to help you directly. One moment 🙏",
      offlineMsgSw: "Juma hayupo wakati huu. Niachie jina na namba yako — atakupigia simu akirudi.",
      offlineMsgEn: "Juma is away right now. Leave your name and number — he will call you back when he returns.",
      collectContact: true,
      notifyHandoff: true,
      negotiable: true,
      maxDiscount: 10,
      answerLen: "short",
      emojis: true,
    },
    stats: { total: 4382, today: 127, aiResolved: 312, handedOff: 27, swMsgs: 3418, enMsgs: 964 },
    msgsByDay: [86, 112, 98, 124, 131, 95, 142, 118, 127, 103, 139, 151, 121, 127],
    salesToday: [
      { p: "Tecno Spark 10", amt: 285000 },
      { p: "Anker Fast Charger", amt: 65000 },
      { p: "Xiaomi Redmi 12", amt: 380000 },
    ],
    lowStockThreshold: 3,
  };
}

export function emptyPolicies(): Policy {
  return {
    deliveryMode: "paid",
    areas: [],
    freeOver: 500000,
    payments: [],
    payTiming: "Pay on pickup or on delivery",
    deposits: "",
    receipts: true,
    warranty: [],
    returns: "",
    refunds: "",
    hours: {
      mon: "09:00 – 17:00",
      tue: "09:00 – 17:00",
      wed: "09:00 – 17:00",
      thu: "09:00 – 17:00",
      fri: "09:00 – 17:00",
      sat: "09:00 – 13:00",
      sun: "Closed",
    },
    outOfStockBehavior: "both",
    restockDays: 7,
    custom: [],
  };
}

export function emptyAi(): AiConfig {
  return {
    tone: "friendly",
    personality: "",
    greetSw: "Habari! 👋 Karibu kwenye duka letu. Nikusaidieje leo?",
    greetEn: "Hi there! 👋 Welcome to our shop. How can I help you today?",
    langMode: "auto",
    proactive: true,
    pushiness: 40,
    upsell: false,
    trigHuman: true,
    trigNegotiation: true,
    trigAngry: true,
    trigKeywords: ["meneja", "manager", "simu", "call"],
    hoursFrom: "08:00",
    hoursTo: "19:00",
    handoffMsgSw: "Ngoja kidogo — namuunganisha na mwenye duka, atakujibu sasa hivi.",
    handoffMsgEn: "One moment — I'm connecting you with the owner, they'll reply right away.",
    offlineMsgSw: "Mwenye duka hayupo sasa. Acha namba yako, atakupigia simu akirudi.",
    offlineMsgEn: "The owner is away right now. Leave your number and they'll call you back.",
    collectContact: true,
    notifyHandoff: true,
    negotiable: true,
    maxDiscount: 10,
    answerLen: "short",
    emojis: true,
  };
}

export function createEmptyState(): DemoState {
  return {
    business: { name: "", desc: "", city: "", owner: "", phone: "", slogan: "" },
    products: [],
    services: [],
    policies: emptyPolicies(),
    ai: emptyAi(),
    conversations: [],
    activity: [],
    stats: { total: 0, today: 0, aiResolved: 0, handedOff: 0, swMsgs: 0, enMsgs: 0 },
    msgsByDay: [],
    salesToday: [],
    lowStockThreshold: 3,
  };
}

const SWW = ["habari", "jambo", "karibu", "naomba", "nataka", "niko", "kuna", "ipo", "zipo", "bei", "gani", "ngapi", "shilingi", "poa", "sawa", "asante", "sana", "vipi", "mna", "wapi", "lini", "leo", "kesho", "siku", "usafirishaji", "mpesa", "pesa", "simu", "punguza", "mwisho", "ndio", "hapana", "tafadhali", "hii", "hiyo", "kwa", "nani", "sasa", "hivi", "boss", "mkuu", "niaje", "mambo", "shukrani", "chukua", "nipe", "muda", "saa", "fungua", "warranty?", "na", "ya", "za", "je"];
const ENW = ["hello", "hi", "hey", "thanks", "thank", "please", "price", "much", "have", "stock", "delivery", "deliver", "pay", "when", "what", "how", "does", "you", "the", "is", "are", "can", "want", "need", "cost", "warranty", "repair", "good", "morning", "do", "available"];

export function detectLang(text: string, state: DemoState): "sw" | "en" {
  const t = " " + text.toLowerCase().replace(/[?!.,]/g, "") + " ";
  let sw = 0;
  let en = 0;
  SWW.forEach((w) => {
    if (t.includes(" " + w)) sw++;
  });
  ENW.forEach((w) => {
    if (new RegExp("\\b" + w + "\\b").test(t)) en++;
  });
  if (state.ai.langMode === "sw") return "sw";
  if (state.ai.langMode === "en") return "en";
  return en > sw ? "en" : "sw";
}

function findProducts(t: string, state: DemoState) {
  t = t.toLowerCase();
  return state.products.filter((p) => {
    if (p.hidden) return false;
    const toks = p.name.toLowerCase().split(/[\s\-\/]+/).filter((x) => x.length > 1);
    const need = toks.length >= 3 ? 2 : 1;
    const hits = toks.filter((tok) => t.includes(tok)).length;
    const kw = (p.kw || []).some((k) => t.includes(k));
    return hits >= need || kw;
  });
}

function findServices(t: string, state: DemoState) {
  t = t.toLowerCase();
  const map: Record<string, string[]> = {
    screen: ["s1", "s2"],
    skrini: ["s1", "s2"],
    software: ["s3"],
    flash: ["s3"],
    battery: ["s4"],
    betri: ["s4"],
    data: ["s5"],
    backup: ["s5"],
    diagnos: ["s6"],
    check: ["s6"],
    rekebisha: ["s1", "s2", "s3", "s4"],
    repair: ["s1", "s2", "s3", "s4"],
  };
  const ids = new Set<string>();
  Object.keys(map).forEach((k) => {
    if (t.includes(k)) map[k].forEach((i) => ids.add(i));
  });
  return state.services.filter((s) => ids.has(s.id));
}

export type AgentReply = { out: string[]; fx: { handoff?: string; sale?: string } };

export function agentBrain(text: string, lang: "sw" | "en", state: DemoState): AgentReply {
  const t = text.toLowerCase();
  const SW = lang === "sw";
  const out: string[] = [];
  const fx: { handoff?: string; sale?: string } = {};
  const say = (m: string) => out.push(m);
  const prods = findProducts(t, state);
  const svcs = findServices(t, state);
  const hand = (reason: string) => {
    fx.handoff = reason;
  };
  const ownerFirst = state.business.owner.split(" ")[0];

  if (/owner|human|binadamu|real person|manager|juma|mmiliki|nakuomba wewe|juma hash/.test(t) && state.ai.trigHuman) {
    say(SW ? "Sawa, " + ownerFirst + " atakupatia msaada wa moja kwa moja." : "Sure — " + ownerFirst + " will help you personally.");
    hand("Customer asked for a human");
    return { out, fx };
  }
  if (/fraud|scam|cheat|stole|polisi|police|mbaya sana|worst|mchei|mla rusha|useless|stupid/.test(t) && state.ai.trigAngry) {
    say(SW ? "Naomba radhi kabisa kwa usumbufu huu 🙏 Hili nitalishughulikia haraka." : "I sincerely apologise for the trouble 🙏 I will make sure this is handled right away.");
    say(SW ? state.ai.offlineMsgSw : state.ai.offlineMsgEn);
    hand("Angry customer");
    return { out, fx };
  }
  if (!prods.length && !svcs.length && /^(habari|jambo|hello|hi|hey|mambo|niaje|good (morning|afternoon|evening)|yo|hujambo)[\s!.,]*$/.test(t.trim())) {
    say(SW ? "Habari boss! 👋 Karibu " + state.business.name + ". Nikusaidieje — simu, accessories au matengenezo?" : "Hi there! 👋 Welcome to " + state.business.name + ". How can I help — phones, accessories or repairs?");
    return { out, fx };
  }
  if (/punguza|discount|bei ya mwisho|last price|cheaper|nafasi|deal|bei ndogo/.test(t)) {
    if (!state.ai.negotiable) {
      say(SW ? "Samahani, bei zetu ni za mwisho — lakini nitakupitishia " + ownerFirst + " labda mtazungumza." : "Sorry, our prices are fixed — but let me bring " + ownerFirst + ", maybe you can talk it over.");
      hand("Price negotiation — AI not allowed");
      return { out, fx };
    }
    if (prods.length) {
      const p = prods[0];
      const d = Math.round(p.price * (1 - state.ai.maxDiscount / 100));
      say(SW ? "Nidhie tu " + state.ai.maxDiscount + "% — " + p.name + " inakuja " + TZS(d) + " badala ya " + TZS(p.price) + ". Deal? 🤝" : "The best I can do is " + state.ai.maxDiscount + "% off — " + p.name + " at " + TZS(d) + " instead of " + TZS(p.price) + ". Deal? 🤝");
    } else {
      say(SW ? "Nidhie tu kidogo — niambie bidhaa gani haswa nikupatie bei ya mwisho." : "I can only shave a little off — tell me exactly which item and I'll give you the final price.");
    }
    return { out, fx };
  }
  if (/nitachukua|nachukua|i will take|i'll take|nununue|na order|nataka kununua|niandike|nipatie moja/.test(t)) {
    const p = prods[0];
    if (!p) {
      say(SW ? "Sawa! Niambie bidhaa gani ili nikuandikie order." : "Great! Tell me which item so I can set up the order.");
      return { out, fx };
    }
    if (p.stock <= 0) {
      say(SW ? "Pole — " + p.name + " imeisha kwa sasa. Nikujulishe ikirudi (kawaida ndani ya siku " + state.policies.restockDays + ")?"
        : "Sorry — " + p.name + " is out of stock right now. Shall I notify you when it returns (usually within " + state.policies.restockDays + " days)?");
      return { out, fx };
    }
    fx.sale = p.id;
    say(SW ? "Hongera! 🎉 Nimeandika order: " + p.name + " — " + TZS(p.price) + ". Zimebaki " + (p.stock - 1) + " tu."
      : "Congrats! 🎉 Order noted: " + p.name + " — " + TZS(p.price) + ". Only " + (p.stock - 1) + " left now.");
    const mp = state.policies.payments[0];
    say(SW ? "Malipo kwa " + mp.name + ": " + mp.detail + ". " + state.policies.payTiming + ". Tunakupa receipt ✅"
      : "Pay via " + mp.name + ": " + mp.detail + ". " + state.policies.payTiming + ". You get a receipt ✅");
    if (state.ai.upsell) {
      const add = state.products.find((x) => x.cat === "Accessories" && x.stock > 0);
      if (add) say(SW ? "Ukitaka nikuongezee " + add.name + " (" + TZS(add.price) + ") — sema tu! 👌"
        : "Want me to add " + add.name + " (" + TZS(add.price) + ") to the order? Just say the word! 👌");
    }
    return { out, fx };
  }
  if (/kuna|do you have|ipo|zipo|stock|available|una |bado/.test(t) || prods.length) {
    if (prods.length) {
      const p = prods[0];
      if (p.stock === 0) {
        say(SW ? "Pole, " + p.name + " imeisha kwa sasa 😔" : "Sorry, the " + p.name + " is out of stock right now 😔");
        if (state.policies.outOfStockBehavior !== "notify") {
          const alt = state.products.find((x) => x.cat === p.cat && x.stock > 0 && x.id !== p.id);
          if (alt) say(SW ? "Lakini nina " + alt.name + " — " + TZS(alt.price) + ", na zipo " + alt.stock + ". Nikuletee maelezo?"
            : "But I do have the " + alt.name + " — " + TZS(alt.price) + ", " + alt.stock + " in stock. Want the details?");
        }
        if (state.policies.outOfStockBehavior !== "suggest") {
          say(SW ? "Au nikuweke kwenye orodha — nitakutaarifu tu ikirudi (siku ~" + state.policies.restockDays + ")."
            : "Or I can put you on the list — I'll message you the moment it's back (~" + state.policies.restockDays + " days).");
        }
      } else {
        say(SW ? "Ndiyo! " + p.name + " zipo " + p.stock + " leo. Bei ni " + TZS(p.price) + "."
          : "Yes! We have " + p.stock + " × " + p.name + " today. Price is " + TZS(p.price) + ".");
        if (p.stock <= state.lowStockThreshold) say(SW ? "Zimebaki chache tu (" + p.stock + ") — ukipenda usiache 😅"
          : "Only " + p.stock + " left — don't sleep on it 😅");
        if (state.ai.proactive && state.ai.pushiness > 30)
          say(SW ? "Unaitumia kwa nini hasa — biashara, shule au matumizi ya kawaida? Nikusaidie kuchagua vizuri."
            : "What will you mainly use it for — business, school or everyday use? Let me help you pick the right one.");
      }
      return { out, fx };
    }
  }
  if (svcs.length || /repair|screen|skrini|software|battery|betri|diagnos|kurekebisha|matengenezo/.test(t)) {
    const s = svcs[0] || state.services[0];
    say(SW ? `${s.name}: ${s.price === 0 ? "BURE" : "inaanzia " + TZS(s.price)}. Muda: ${s.dur}.${s.warranty !== "—" ? " Warranty: " + s.warranty + "." : ""}`
      : `${s.name}: ${s.price === 0 ? "FREE" : "from " + TZS(s.price)}. Turnaround: ${s.dur}.${s.warranty !== "—" ? " Warranty: " + s.warranty + "." : ""}`);
    if (s.booking) say(SW ? "Inahitaji booking — " + state.policies.deposits + ". Nikuwekee nafasi leo? 📅"
      : "This one needs a booking — " + state.policies.deposits + ". Shall I reserve a slot for you? 📅");
    else if (state.ai.proactive) say(SW ? "Simu yako ni model gani? Niangalie parts zake sasa hivi."
      : "Which model is your phone? Let me check part availability right now.");
    return { out, fx };
  }
  if (/deliver|usafirishaji|delivery|mleta|kuleta|kupeleka|ship|fee|mnapeleka/.test(t)) {
    if (state.policies.deliveryMode === "no") {
      say(SW ? "Hatufanyi delivery — lakini unaweza kuchukua dukani " + state.business.city + "."
        : "We don't deliver — but you can pick up at our shop in " + state.business.city + ".");
      return { out, fx };
    }
    const a = state.policies.areas.map((x) => `${x.area}: ${x.fee === 0 ? "BURE" : TZS(x.fee)} (${x.time})`).join(" · ");
    say(SW ? "Tunaleta! 🚚 " + a : "We deliver! 🚚 " + a);
    say(SW ? "Order zaidi ya " + TZS(state.policies.freeOver) + " — delivery BURE. Unakaa wapi?"
      : "Orders over " + TZS(state.policies.freeOver) + " ship FREE. Which area are you in?");
    return { out, fx };
  }
  if (/mpesa|m-pesa|tigo|airtel|malipo|pay|cash|how to pay|namba ya kulipa|card/.test(t)) {
    say(SW ? "Tunapokea: " + state.policies.payments.map((p) => p.name).join(", ") + "."
      : "We accept: " + state.policies.payments.map((p) => p.name).join(", ") + ".");
    const mm = state.policies.payments[0];
    say(SW ? mm.name + ": " + mm.detail + ". " + state.policies.payTiming + (state.policies.receipts ? " — receipt unapewa mara moja ✅" : "")
      : mm.name + ": " + mm.detail + ". " + state.policies.payTiming + (state.policies.receipts ? " — you get a receipt instantly ✅" : ""));
    say(SW ? "Kumbuka: sitaki malipo yoyote ndani ya chat hii — lipa tu kwa njia hizi rasmi."
      : "Reminder: never pay inside this chat — only via these official methods.");
    return { out, fx };
  }
  if (/open|hours|fungua|address|wapi|location|mko wapi|saa ngapi/.test(t)) {
    const h = state.policies.hours;
    say(SW ? "Tupo " + state.business.city + ". Mon–Fri " + h.mon + ", Sat " + h.sat + ", Jumapili: " + h.sun + "."
      : "Find us in " + state.business.city + ". Mon–Fri " + h.mon + ", Sat " + h.sat + ", Sunday: " + h.sun + ".");
    if (state.ai.proactive) say(SW ? "Ukinishindia kufika, naweza kukupangia delivery 🚚"
      : "If you can't make it, I can arrange delivery instead 🚚");
    return { out, fx };
  }
  if (/warranty|garanty|dhamana|return|exchange|badilisha|rudisha|refund/.test(t)) {
    say(SW ? "Warranty zetu: " + state.policies.warranty.map((w) => w.cat + " " + w.dur).join(" · ") + "."
      : "Our warranties: " + state.policies.warranty.map((w) => w.cat + " " + w.dur).join(" · ") + ".");
    say(SW ? "Returns: " + state.policies.returns + ". " + state.policies.refunds + "."
      : "Returns: " + state.policies.returns + ". " + state.policies.refunds + ".");
    return { out, fx };
  }
  if (prods.length) {
    const p = prods[0];
    say(SW ? `${p.name} — ${TZS(p.price)}. ${p.stock > 0 ? "Zipo " + p.stock + " sasa hivi." : "Imeisha kwa sasa."}`
      : `The ${p.name} is ${TZS(p.price)}. ${p.stock > 0 ? p.stock + " in stock right now." : "Currently out of stock."}`);
    if (state.ai.upsell && p.cat === "Phones" && state.ai.proactive) {
      const c = state.products.find((x) => x.name.includes("Case") && x.stock > 0);
      const glass = state.products.find((z) => z.kw.includes("protector"));
      if (c && glass) say(SW ? "Ukitaka cover na glass, ziko " + TZS(c.price + glass.price) + " kwa bundle. 👌"
        : "Bundle a case + glass for just " + TZS(c.price + glass.price) + " — worth it. 👌");
    }
    return { out, fx };
  }
  if (/asante|thanks|shukrani|thank you|poa sana|cool|sawa asante/.test(t)) {
    say(SW ? "Karibu sana! 🙌 Ukihitaji chochote, niko hapa 24/7." : "You're welcome! 🙌 I'm here 24/7 if you need anything.");
    return { out, fx };
  }
  if (/kwa heri|bye|goodnight|lala salama/.test(t)) {
    say(SW ? "Kwa heri! 👋 Karibu tena " + state.business.name + "." : "Goodbye! 👋 Come back soon.");
    return { out, fx };
  }
  say(SW ? "Swali zuri! Siwezi kukuhakikishia jibu sahihi kwa hili — nampa " + ownerFirst + " akujibu mwenyewe. 🙏"
    : "Good question! I don't want to guess on this one — let me hand you to " + ownerFirst + " for the exact answer. 🙏");
  hand("Unknown question — AI not sure");
  return { out, fx };
}

export function ownerBrain(q: string, state: DemoState): string[] {
  const t = q.toLowerCase();
  const top = [...state.products].sort((a, b) => b.sold - a.sold)[0];
  const low = state.products.filter((p) => p.stock > 0 && p.stock <= state.lowStockThreshold);
  const out = state.products.filter((p) => p.stock === 0);
  const rev = state.salesToday.reduce((s, x) => s + x.amt, 0);
  if (/sold the most|best sell|top product|kinauwa/.test(t))
    return [
      "This week's star is the " + top.name + " — " + top.sold + " units sold at " + TZS(top.price) + " each.",
      "Runners-up: " + [...state.products].sort((a, b) => b.sold - a.sold).slice(1, 3).map((p) => p.name + " (" + p.sold + ")").join(", ") + ". Want me to push these in conversations?",
    ];
  if (/asking|questions today|wauliza/.test(t))
    return [
      "Today customers asked mostly about: iPhone 13 pricing, screen repairs, and delivery to Mbezi.",
      state.stats.today + " messages so far — " + Math.round((state.stats.swMsgs / (state.stats.swMsgs + state.stats.enMsgs)) * 100) + "% in Swahili. Two handoffs are waiting for you.",
    ];
  if (/summar.*yesterday|yesterday|jana/.test(t))
    return [
      "Yesterday: 151 messages across 38 conversations. The AI resolved 33 and handed you 5.",
      "Top topics: Tecno prices (9), repair bookings (7), M-Pesa payments (6). 2 sales closed, worth TZS 665,000.",
    ];
  if (/stock|low|out of|krasi/.test(t))
    return [
      "Stock check: " + out.length + " item(s) out — " + (out.map((p) => p.name).join(", ") || "none") + ".",
      low.length ? "Running low: " + low.map((p) => p.name + " (" + p.stock + " left)").join(", ") + ". Want me to draft restock reminders?" : "Everything else is healthy.",
    ];
  if (/revenue|sales|money|pesa|mapato/.test(t))
    return [
      "Today so far: " + state.salesToday.length + " sales totalling " + TZS(rev) + ".",
      state.salesToday.map((s) => "• " + s.p + " — " + TZS(s.amt)).join(" "),
      "All payments went through your own methods (M-Pesa/cash) — I only guided customers.",
    ];
  if (/handoff|hand over|waiting/.test(t)) {
    const w = state.conversations.filter((c) => c.status === "waiting");
    return [
      w.length + " conversation(s) waiting for you: " + (w.map((c) => c.name + " (" + c.reason + ")").join(" · ") || "none") + ".",
      "Open the Inbox to take over — the AI pauses instantly on any chat you enter.",
    ];
  }
  return [
    'I can report on sales, stock, customers and handoffs. Try asking: "Which product sold the most this week?", "Summarize yesterday\'s chats", or "What are customers asking today?"',
  ];
}