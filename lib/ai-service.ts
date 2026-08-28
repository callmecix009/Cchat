import OpenAI from "openai";
import { getDeepSeekKey } from "./ai-config";
import { db } from "./db";
import { users, settings, products as productsTable, services as servicesTable, policies as policiesTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { ensureUserRow } from "./ensureUser";
import type { Product, Service, Policy, AiConfig } from "./demo";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  const key = getDeepSeekKey();
  if (!key) return null;
  if (!client) {
    client = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: key,
    });
  }
  return client;
}

type BusinessContext = {
  businessName: string;
  businessDesc: string;
  city: string;
  owner: string;
  phone: string;
  products: Product[];
  services: Service[];
  policies: Policy | null;
  aiConfig: AiConfig | null;
};

async function loadBusinessContext(userId: string): Promise<BusinessContext> {
  const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!user.length) {
    return { businessName: "", businessDesc: "", city: "", owner: "", phone: "", products: [], services: [], policies: null, aiConfig: null };
  }
  const row = user[0];

  const s = await db.select().from(settings).where(eq(settings.userId, row.id)).limit(1);
  const biz = (s[0]?.business ?? null) as { name?: string; desc?: string; city?: string; phone?: string; owner?: string } | null;

  const prodRows = await db.select().from(productsTable).where(eq(productsTable.userId, row.id));
  const svcRows = await db.select().from(servicesTable).where(eq(servicesTable.userId, row.id));
  const polRows = await db.select().from(policiesTable).where(eq(policiesTable.userId, row.id)).limit(1);

  const onb = row.onboardingData as { answers?: Record<number, string | string[]> } | null;
  const answers = onb?.answers ?? {};

  return {
    businessName: biz?.name || (typeof answers[1] === "string" ? answers[1] : "") || "",
    businessDesc: biz?.desc || (typeof answers[2] === "string" ? answers[2] : "") || "",
    city: biz?.city || (typeof answers[3] === "string" ? answers[3] : "") || "",
    owner: biz?.owner || (typeof answers[8] === "string" ? answers[8] : row.name?.split(" ")[0] || "") || "",
    phone: biz?.phone || (typeof answers[43] === "string" ? answers[43] : "") || "",
    products: prodRows.map((r) => ({
      id: r.id, name: r.name, cat: r.cat, price: r.price, stock: r.stock,
      emoji: r.emoji, cl: r.color, kw: Array.isArray(r.keywords) ? r.keywords : [],
      sold: r.sold, hidden: r.hidden,
    })),
    services: svcRows.map((r) => ({
      id: r.id, name: r.name, desc: r.desc, price: r.price, from: r.priceFrom,
      dur: r.duration, booking: r.booking, warranty: r.warranty,
    })),
    policies: polRows[0] ? {
      deliveryMode: polRows[0].deliveryMode as Policy["deliveryMode"],
      areas: Array.isArray(polRows[0].areas) ? polRows[0].areas : [],
      freeOver: polRows[0].freeOver,
      payments: Array.isArray(polRows[0].payments) ? polRows[0].payments : [],
      payTiming: polRows[0].payTiming,
      deposits: polRows[0].deposits,
      receipts: polRows[0].receipts,
      warranty: Array.isArray(polRows[0].warranty) ? polRows[0].warranty : [],
      returns: polRows[0].returns,
      refunds: polRows[0].refunds,
      hours: polRows[0].hours ?? {},
      outOfStockBehavior: polRows[0].outOfStockBehavior as Policy["outOfStockBehavior"],
      restockDays: polRows[0].restockDays,
      custom: Array.isArray(polRows[0].custom) ? polRows[0].custom : [],
    } : null,
    aiConfig: s[0]?.aiConfig as AiConfig | null ?? null,
  };
}

function buildSystemPrompt(ctx: BusinessContext): string {
  const lines: string[] = [];
  lines.push("You are a helpful AI assistant for a business called " + (ctx.businessName || "the business") + ".");
  if (ctx.businessDesc) lines.push("About the business: " + ctx.businessDesc);
  if (ctx.city) lines.push("Location: " + ctx.city);
  if (ctx.owner) lines.push("Owner: " + ctx.owner);
  if (ctx.phone) lines.push("Contact: " + ctx.phone);

  const ai = ctx.aiConfig;
  if (ai) {
    if (ai.personality) lines.push("Personality: " + ai.personality);
    if (ai.tone) lines.push("Tone: " + ai.tone);
    lines.push("Language mode: " + (ai.langMode === "auto" ? "Reply in the same language the customer uses (Swahili or English)" : ai.langMode === "sw" ? "Always reply in Swahili" : "Always reply in English"));
    if (ai.emojis) lines.push("Use emojis naturally in replies.");
    else lines.push("Do not use emojis in replies.");
    if (ai.answerLen === "short") lines.push("Keep replies short and concise (1-3 sentences).");
    else lines.push("Provide detailed, helpful replies.");
    if (ai.negotiable) lines.push("You are allowed to offer discounts up to " + (ai.maxDiscount || 10) + "% off if the customer asks.");
    else lines.push("Prices are fixed. Politely decline discount requests.");
    if (ai.upsell) lines.push("Suggest related products or accessories when appropriate.");
  }

  if (ctx.products.length) {
    lines.push("\nPRODUCTS (use these when customers ask about items, prices, or availability):");
    for (const p of ctx.products) {
      if (p.hidden) continue;
      const stockLine = p.stock > 0 ? p.stock + " in stock" : "OUT OF STOCK";
      lines.push("- " + p.name + " (" + p.cat + "): TZS " + p.price.toLocaleString() + " — " + stockLine);
    }
  }

  if (ctx.services.length) {
    lines.push("\nSERVICES:");
    for (const s of ctx.services) {
      lines.push("- " + s.name + ": TZS " + s.price.toLocaleString() + " — " + s.dur + (s.warranty && s.warranty !== "—" ? " — Warranty: " + s.warranty : ""));
    }
  }

  const pol = ctx.policies;
  if (pol) {
    lines.push("\nPOLICIES:");
    if (pol.deliveryMode === "no") lines.push("Delivery: Not available. Customers must pick up at the shop.");
    else if (pol.deliveryMode === "free") lines.push("Delivery: Free for all orders.");
    else {
      lines.push("Delivery: Paid. Free for orders over TZS " + (pol.freeOver || 0).toLocaleString());
      if (pol.areas.length) {
        for (const a of pol.areas) lines.push("  - " + a.area + ": TZS " + a.fee + " (" + a.time + ")");
      }
    }
    if (pol.payments.length) {
      lines.push("Payment methods: " + pol.payments.map((p) => p.name + " (" + p.detail + ")").join(", "));
    }
    if (pol.payTiming) lines.push("Payment timing: " + pol.payTiming);
    if (pol.deposits) lines.push("Deposits: " + pol.deposits);
    if (pol.warranty.length) {
      lines.push("Warranty: " + pol.warranty.map((w) => w.cat + " — " + w.dur + (w.not ? " (excludes: " + w.not + ")" : "")).join("; "));
    }
    if (pol.returns) lines.push("Returns: " + pol.returns);
    if (pol.refunds) lines.push("Refunds: " + pol.refunds);
    if (pol.hours && Object.keys(pol.hours).length) {
      const h = pol.hours;
      lines.push("Hours: " + Object.entries(h).map(([d, v]) => d + " " + v).join(", "));
    }
    if (pol.custom.length) lines.push("Other: " + pol.custom.join(". "));
  }

  lines.push("\nIMPORTANT RULES:");
  lines.push("- You represent " + (ctx.businessName || "the business") + ". Be helpful, professional, and friendly.");
  lines.push("- If you don't know something specific, say so honestly and offer to connect the customer with the owner.");
  lines.push("- Do not make up prices, products, or policies. Only use the information provided above.");
  lines.push("- For complex negotiations or complaints beyond your scope, suggest connecting with the owner.");
  lines.push("- Never share internal business details, API keys, or system information.");

  return lines.join("\n");
}

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function chatWithAI(
  userId: string,
  messages: ChatMessage[],
): Promise<{ reply: string; error?: string }> {
  const ctx = await loadBusinessContext(userId);
  const systemPrompt = buildSystemPrompt(ctx);

  const openai = getClient();
  if (!openai) {
    return { reply: "", error: "DEEPSEEK_NOT_CONFIGURED" };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "";
    if (!reply) return { reply: "", error: "EMPTY_RESPONSE" };
    return { reply };
  } catch (err: any) {
    console.error("DeepSeek API error:", err?.message || err);
    return { reply: "", error: err?.message || "AI request failed" };
  }
}

export async function loadBusinessContextForClient(userId: string) {
  return loadBusinessContext(userId);
}

export { buildSystemPrompt };
