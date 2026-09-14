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
    // Extended catalog for rich demo — mawesemakelele@gmail.com gets full showcase
    P("p14", "iPhone 15 128GB", "Phones", 2150000, 5, "📱", "#E8F0FE", ["iphone", "15", "apple"], 3),
    P("p15", "iPhone 12 64GB", "Phones", 980000, 2, "📱", "#FDECEC", ["iphone", "12", "apple"], 6),
    P("p16", "Samsung Galaxy S23", "Phones", 1650000, 4, "📱", "#E7F6EC", ["samsung", "galaxy", "s23"], 5),
    P("p17", "Samsung Galaxy A34", "Phones", 620000, 9, "📱", "#E7F6EC", ["samsung", "a34"], 8),
    P("p18", "Samsung Galaxy A24", "Phones", 480000, 11, "📱", "#E7F6EC", ["samsung", "a24"], 7),
    P("p19", "Tecno Spark 10 Pro", "Phones", 340000, 6, "📱", "#FFF4DE", ["tecno", "spark", "pro"], 9),
    P("p20", "Tecno Pop 7", "Phones", 195000, 18, "📱", "#FFF4DE", ["tecno", "pop"], 12),
    P("p21", "Infinix Hot 30", "Phones", 310000, 13, "📱", "#FFF4DE", ["infinix", "hot"], 10),
    P("p22", "Infinix Note 30", "Phones", 540000, 7, "📱", "#FFF4DE", ["infinix", "note"], 6),
    P("p23", "Xiaomi Poco X5", "Phones", 520000, 8, "📱", "#F3EDFB", ["xiaomi", "poco", "x5"], 7),
    P("p24", "Redmi Note 12", "Phones", 450000, 10, "📱", "#F3EDFB", ["redmi", "note", "12"], 9),
    P("p25", "Itel A58", "Phones", 165000, 20, "📱", "#FFF4DE", ["itel", "a58"], 15),
    P("p26", "Nokia 105", "Phones", 55000, 25, "📱", "#E7F6EC", ["nokia", "105"], 20),
    P("p27", "Sony WH-1000XM5", "Audio", 650000, 3, "🎧", "#E8F0FE", ["sony", "wh"], 2),
    P("p28", "Oraimo FreePods 3", "Audio", 75000, 14, "🎧", "#FFF4DE", ["oraimo", "freepods"], 11),
    P("p29", "JBL Go 3 Speaker", "Audio", 120000, 6, "🔊", "#E7F6EC", ["jbl", "speaker"], 4),
    P("p30", "USB-C Cable 2m", "Accessories", 12000, 40, "🔌", "#E7F6EC", ["cable", "usb"], 28),
    P("p31", "Fast Car Charger", "Accessories", 35000, 18, "🚗", "#FFF4DE", ["car", "charger"], 13),
    P("p32", "Memory Card 64GB", "Accessories", 25000, 30, "💾", "#F3EDFB", ["memory", "sd", "card"], 19),
    P("p33", "Phone Stand Metal", "Accessories", 15000, 22, "📱", "#E8F0FE", ["stand", "holder"], 8),
    P("p34", "Wireless Mouse", "Accessories", 30000, 15, "🖱️", "#E7F6EC", ["mouse", "wireless"], 6),
    P("p35", "Bluetooth Keyboard", "Accessories", 55000, 9, "⌨️", "#FDECEC", ["keyboard", "bluetooth"], 5),
    P("p36", "Smart Watch T800", "Accessories", 85000, 7, "⌚", "#FFF4DE", ["watch", "smart"], 9),
    P("p37", "Selfie Stick Tripod", "Accessories", 28000, 16, "🤳", "#F3EDFB", ["selfie", "tripod"], 7),
    P("p38", "Earpods Lightning", "Audio", 35000, 12, "🎧", "#FDECEC", ["earpods", "lightning"], 10),
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
    SV("s7", "Water Damage Repair", "Deep cleaning + board repair for water-damaged phones. Success rate 85%.", 40000, true, "2–4 hours", true, "14 days"),
    SV("s8", "Camera Lens Repair", "Blurry photos? We replace lens & calibrate focus. All models.", 35000, false, "~1 hour", false, "30 days"),
    SV("s9", "Charging Port Repair", "Fix loose or non-charging ports. Includes cleaning & part replacement.", 25000, false, "~45 min", true, "30 days"),
    SV("s10", "Phone Unlocking", "Network unlock, FRP bypass, iCloud advice — legal & safe.", 20000, false, "~30 min", false, "—"),
    SV("s11", "Back Cover Replacement", "Cracked back? New glass or plastic cover with precision fitting.", 30000, false, "~1 hour", false, "30 days"),
    SV("s12", "Speaker & Mic Repair", "Low sound or mic not working? Speaker/mic module replacement.", 20000, false, "~45 min", false, "30 days"),
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
    conv("c9", "Rehema Joseph", "+255 718 442 991", "sw", "ai", ago(18), [
      M("c", "Habari, Samsung A54 iko na bei gani?", 22),
      M("ai", "Habari Rehema! Samsung A54 — TZS 890,000, tuna 7. Unapendelea rangi gani?", 21),
      M("c", "Nicheki pia Tecno Camon 20", 19),
      M("ai", "Tecno Camon 20 — TZS 520,000, zimebaki 4. Iko na camera kali sana 🔥", 18),
    ], null),
    conv("c10", "Musa Hamis", "+255 767 201 334", "sw", "waiting", ago(35), [
      M("c", "Nataka iPhone 15 lakini bei ni kubwa sana, mnapunguza?", 40),
      M("ai", "Musa boss, iPhone 15 ni TZS 2,150,000 — tuna 5 tu. Nidhie 10% hadi TZS 1,935,000 🤝", 39),
      M("c", "Bado juu, nataka 1.7m", 37),
      { from: "sys", text: "Handoff → Juma · Price negotiation beyond limit", t: ago(36) },
      M("ai", "Nakuelewa, nimemtafuta Juma aongee nawe moja kwa moja 🙏", 36),
    ], "Price negotiation beyond limit"),
    conv("c11", "Grace Mwakibete", "+255 713 889 201", "en", "ai", ago(50), [
      M("c", "Hi, do you have iPhone 15? How much?", 55),
      M("ai", "Hi Grace! Yes, iPhone 15 128GB — TZS 2,150,000, 5 in stock. Want a free case included?", 54),
      M("c", "Sounds good, can I pay on delivery?", 52),
      M("ai", "Yes! Pay on delivery via M-Pesa or cash. Which area are you in? 🚚", 51),
    ], null),
    conv("c12", "Peter Mushi", "+255 754 331 772", "sw", "closed", ago(90), [
      M("c", "Natafuta Infinix Hot 30, iko?", 95),
      M("ai", "Ndiyo Peter! Infinix Hot 30 — TZS 310,000, tuna 13. Unaitaka leo?", 94),
      M("c", "Sawa, naomba moja, nalipaje?", 92),
      M("ai", "M-Pesa 0757 123 456 — JUMA HASSAN. Tutahifadhi moja kwako ✅", 91),
      { from: "sys", text: "Resolved by AI · Sale TZS 310,000", t: ago(90) },
    ], null),
    conv("c13", "Salma Ally", "+255 766 554 009", "sw", "waiting", ago(65), [
      M("c", "Simu yangu imeanguka majini! Mnaweza kuitengeneza?", 70),
      M("ai", "Pole sana Salma 😟 Tunafanya Water Damage Repair — TZS 40,000, 2–4 hours. Ilete haraka kabla board haijaoza.", 69),
      M("c", "Sawa nakuja sasa hivi na mtoto wangu pia simu yake inachemka", 67),
      { from: "sys", text: "Handoff → Juma · Urgent water damage + extra request", t: ago(66) },
    ], "Urgent water damage"),
    conv("c14", "Jafari Komba", "+255 719 887 334", "sw", "ai", ago(120), [
      M("c", "Kuna power bank 20000mAh?", 125),
      M("ai", "Ndiyo Jafari! Power Bank 20000mAh — TZS 95,000, tuna 8. Inachaji simu mara 4-5! 🔋", 124),
      M("c", "Poa, na charger ya gari mnayo?", 122),
      M("ai", "Ndiyo! Fast Car Charger — TZS 35,000. Nikuletee zote mbili? 🚗", 121),
    ], null),
    conv("c15", "Leila Hassan", "+255 712 009 882", "en", "closed", ago(200), [
      M("c", "Hello, I need a Samsung A34 for my son", 205),
      M("ai", "Hi Leila! Samsung A34 — TZS 620,000, 9 in stock. Great for school & gaming 🎮", 204),
      M("c", "Great, I'll send my husband to pick it up tomorrow", 202),
      M("ai", "Perfect! We'll reserve one under Leila until tomorrow 6pm ✅", 201),
      { from: "sys", text: "Resolved by AI · Reserved", t: ago(200) },
    ], null),
    conv("c16", "Hassan Ally", "+255 755 223 441", "sw", "ai", ago(75), [
      M("c", "Habari, nataka kununua Redmi Note 12 mbili", 80),
      M("ai", "Habari Hassan! Redmi Note 12 — TZS 450,000 moja, mbili ni TZS 900,000. Zimebaki 10 🔥", 79),
      M("c", "Sawa, nitatuma pesa jioni", 77),
      M("ai", "Sawa boss, tutazihifadhi mbili kwako hadi jioni ✅", 76),
    ], null),
    conv("c17", "Neema Kweka", "+255 767 445 201", "sw", "waiting", ago(42), [
      M("c", "Habari, mliniahidi simu yangu irekebishwe jana na bado hamjanipigia!", 47),
      M("ai", "Pole sana Neema 🙏 Naomba radhi kwa kuchelewa. Simu yako iko stage gani?", 46),
      M("c", "Mnanichelewesha sana, nataka kuongea na manager wenu sasa!", 44),
      { from: "sys", text: "Handoff → Juma · Customer escalated", t: ago(43) },
    ], "Customer escalated"),
    conv("c18", "David Mwakyusa", "+255 714 667 890", "en", "ai", ago(95), [
      M("c", "Do you offer phone unlocking? My Samsung is locked", 100),
      M("ai", "Yes David! Phone Unlocking — TZS 20,000, ~30 min, safe & legal 🔓", 99),
      M("c", "Can I bring it now?", 97),
      M("ai", "Yes, bring it to Kariakoo — we're open till 8pm! 🕗", 96),
    ], null),
    conv("c19", "Asha Salum", "+255 718 990 102", "sw", "closed", ago(310), [
      M("c", "Kuna iPhone 12?", 315),
      M("ai", "Ndiyo Asha! iPhone 12 64GB — TZS 980,000, zimebaki 2. Bei poa sana!", 314),
      M("c", "Naomba moja kesho", 312),
      M("ai", "Sawa, tutaihifadhi moja kwako kesho ✅", 311),
      { from: "sys", text: "Resolved by AI · Reserved", t: ago(310) },
    ], null),
    conv("c20", "Kelvin John", "+255 765 334 221", "sw", "ai", ago(55), [
      M("c", "Habari, smart watch mnayo?", 60),
      M("ai", "Ndiyo Kelvin! Smart Watch T800 — TZS 85,000, tuna 7. Inapima mapigo na steps ⌚", 59),
      M("c", "Inafanya kazi na iPhone?", 57),
      M("ai", "Ndiyo! Inafanya na iPhone na Android — Bluetooth tu 📲", 56),
    ], null),
  ];

  // Generate 30 more diverse conversations programmatically for massive demo
  const extraNames = [
    ["Aisha Omar", "+255 712 445 901"], ["Yusufu Bakari", "+255 713 556 712"], ["Mariam Juma", "+255 714 667 823"], ["Idi Seif", "+255 715 778 934"], ["Zainabu Mussa", "+255 716 889 045"],
    ["Hamis Said", "+255 717 990 156"], ["Fatma H.", "+255 718 001 267"], ["Juma K.", "+255 719 112 378"], ["Rehema S.", "+255 754 223 489"], ["Baraka T.", "+255 755 334 590"],
    ["Neema P.", "+255 756 445 601"], ["Amina K.", "+255 757 556 712"], ["Musa J.", "+255 758 667 823"], ["Salma R.", "+255 759 778 934"], ["David P.", "+255 760 889 045"],
    ["Grace L.", "+255 762 990 156"], ["Peter N.", "+255 763 001 267"], ["Salum K.", "+255 764 112 378"], ["Halima M.", "+255 765 223 489"], ["Emmanuel K.", "+255 766 334 590"],
    ["Zubeda S.", "+255 767 445 601"], ["Leila A.", "+255 768 556 712"], ["Hassan M.", "+255 769 667 823"], ["Kelvin T.", "+255 771 778 934"], ["Asha B.", "+255 772 889 045"],
    ["Mwajuma K.", "+255 773 990 156"], ["Seif Omar", "+255 774 001 267"], ["Tatu Said", "+255 775 112 378"], ["Omari J.", "+255 776 223 489"], ["Nancy K.", "+255 777 334 590"],
  ];
  const productSamples = [
    ["Infinix Note 30", "TZS 540,000"], ["Tecno Spark 10", "TZS 285,000"], ["Samsung A24", "TZS 480,000"], ["Redmi Note 12", "TZS 450,000"], ["AirPods Pro 2", "TZS 480,000"],
    ["Smart Watch", "TZS 85,000"], ["Power Bank", "TZS 95,000"], ["Tempered Glass", "TZS 10,000"], ["Charger", "TZS 65,000"], ["iPhone 13", "TZS 1,450,000"],
  ];
  const extraConvos: Convo[] = extraNames.map((pair, idx) => {
    const [name, phone] = pair;
    const isSw = idx % 3 !== 0;
    const statuses: Array<"ai" | "waiting" | "closed"> = ["ai", "waiting", "closed", "ai", "closed", "ai"];
    const status = statuses[idx % statuses.length];
    const prod = productSamples[idx % productSamples.length];
    const minsAgo = 400 + idx * 47 + Math.floor(Math.random() * 200);
    const baseT = ago(minsAgo);
    const msgs: ConvoMsg[] = [];
    if (status === "waiting") {
      msgs.push({ from: "c", text: isSw ? `Habari, ${prod[0]} iko? Bei gani?` : `Hi, do you have ${prod[0]}?`, t: ago(minsAgo + 5) });
      msgs.push({ from: "ai", text: isSw ? `Ndiyo! ${prod[0]} — ${prod[1]}, stock ipo. Nikusaidieje?` : `Yes! ${prod[0]} — ${prod[1]}, in stock. How can I help?`, t: ago(minsAgo + 4) });
      msgs.push({ from: "c", text: isSw ? `Nataka kuongea na mmiliki, bei imezidi` : `I want to talk to the owner, price is high`, t: ago(minsAgo + 2) });
      msgs.push({ from: "sys", text: "Handoff → Juma · Customer requested owner", t: ago(minsAgo + 1) });
      return conv(`cx${10 + idx}`, name, phone, isSw ? "sw" : "en", status, baseT, msgs, "Requested owner");
    } else if (status === "closed") {
      const sold = idx % 2 === 0;
      msgs.push({ from: "c", text: isSw ? `Habari, ${prod[0]} bado ipo?` : `Hi, is ${prod[0]} available?`, t: ago(minsAgo + 10) });
      msgs.push({ from: "ai", text: isSw ? `Ndiyo! ${prod[0]} — ${prod[1]} ✅` : `Yes! ${prod[0]} — ${prod[1]} ✅`, t: ago(minsAgo + 9) });
      msgs.push({ from: "c", text: isSw ? `Sawa, nakuja kesho` : `Okay, coming tomorrow`, t: ago(minsAgo + 7) });
      msgs.push({ from: "sys", text: sold ? `Resolved by AI · Sale ${prod[1]}` : "Resolved by AI", t: ago(minsAgo) });
      const c = conv(`cx${10 + idx}`, name, phone, isSw ? "sw" : "en", status, baseT, msgs, null);
      if (sold) { c.outcome = "sold"; c.soldProduct = prod[0]; }
      return c;
    } else {
      msgs.push({ from: "c", text: isSw ? `Habari, ${prod[0]} bei gani?` : `Hi, how much is ${prod[0]}?`, t: ago(minsAgo + 5) });
      msgs.push({ from: "ai", text: isSw ? `${prod[0]} — ${prod[1]}, tuna stock. Unaitaka lini?` : `${prod[0]} — ${prod[1]}, we have stock. When do you want it?`, t: ago(minsAgo + 4) });
      if (idx % 4 === 0) msgs.push({ from: "c", text: isSw ? `Nalipaje? M-Pesa?` : `How to pay? M-Pesa?`, t: ago(minsAgo + 2) });
      return conv(`cx${10 + idx}`, name, phone, isSw ? "sw" : "en", status, baseT, msgs, null);
    }
  });
  conversations.push(...extraConvos);
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
    stats: { total: 8420, today: 342, aiResolved: 892, handedOff: 67, swMsgs: 6218, enMsgs: 2202 },
    msgsByDay: [142, 188, 165, 210, 195, 178, 220, 205, 198, 230, 215, 342, 189, 201],
    salesToday: [
      { p: "Tecno Spark 10", amt: 285000 },
      { p: "Anker Fast Charger", amt: 65000 },
      { p: "Xiaomi Redmi 12", amt: 380000 },
      { p: "iPhone 15 128GB", amt: 2150000 },
      { p: "Samsung Galaxy S23", amt: 1650000 },
      { p: "Infinix Hot 30", amt: 310000 },
      { p: "Smart Watch T800", amt: 85000 },
      { p: "Oraimo FreePods 3", amt: 75000 },
      { p: "Power Bank 20000mAh", amt: 95000 },
      { p: "Sony WH-1000XM5", amt: 650000 },
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