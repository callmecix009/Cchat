import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, settings, products as productsTable, services as servicesTable, policies as policiesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { emptyAi } from '@/lib/demo';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user.length) {
      return NextResponse.json({ answers: {}, dynLists: {}, onboarded: false });
    }
    const row = user[0];
    const onb = row.onboardingData as { answers?: Record<number, string | string[]>; dynLists?: Record<string, any> } | null;
    // Fetch existing catalog for pre-population if dynLists empty
    let dynLists = onb?.dynLists ?? null;
    if (!dynLists || Object.keys(dynLists).length === 0) {
      const prods = await db.select().from(productsTable).where(eq(productsTable.userId, row.id));
      const svcs = await db.select().from(servicesTable).where(eq(servicesTable.userId, row.id));
      if (prods.length || svcs.length) {
        dynLists = {};
        if (prods.length) {
          dynLists.prods = prods.map((p) => ({ n: p.name, pr: String(p.price), st: String(p.stock), cat: p.cat, emoji: p.emoji }));
        }
        if (svcs.length) {
          dynLists.svcs = svcs.map((s) => ({ n: s.name, d: s.desc, pr: String(s.price) }));
        }
      }
    }
    return NextResponse.json({
      answers: onb?.answers ?? {},
      dynLists: dynLists ?? {},
      onboarded: row.onboarded ?? false,
    });
  } catch (err) {
    console.error('Onboarding load error:', err);
    return NextResponse.json({ error: 'Load failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const answers = body?.answers ?? {};
  const dynLists = body?.dynLists ?? {};

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? '';
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
    const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber ?? null;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    const userIdField = existing.length ? existing[0].id : crypto.randomUUID();

    // 1. Upsert user row
    if (existing.length) {
      await db
        .update(users)
        .set({
          email,
          name,
          phone,
          onboarded: true,
          onboardingData: { answers, dynLists },
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, userId));
    } else {
      await db.insert(users).values({
        id: userIdField,
        clerkId: userId,
        email,
        name,
        phone,
        onboarded: true,
        onboardingData: { answers, dynLists },
        plan: 'free',
        subscriptionStatus: 'inactive',
      });
    }

    // 2. Build business info from onboarding answers
    const business = {
      name: typeof answers[1] === 'string' && answers[1].trim() ? answers[1].trim() : name || null,
      desc: typeof answers[2] === 'string' ? answers[2].trim() : '',
      city: typeof answers[3] === 'string' ? answers[3].trim() : '',
      shopType: typeof answers[4] === 'string' ? answers[4] : '',
      address: typeof answers[5] === 'string' ? answers[5].trim() : '',
      owner: typeof answers[8] === 'string' ? answers[8].trim() : name?.split(' ')[0] || null,
      slogan: typeof answers[12] === 'string' ? answers[12].trim() : '',
      phone: typeof answers[43] === 'string' ? answers[43].trim() : phone || null,
    };

    // 3. Build AI config from onboarding answers
    const aiConfig = buildAiConfig(answers);

    // 4. Build policies from onboarding answers
    const policyData = buildPolicies(answers);

    // 5. Upsert settings (business + AI config)
    const settingsRow = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userIdField))
      .limit(1);

    if (settingsRow.length) {
      const prev = (settingsRow[0].business as Record<string, unknown>) ?? {};
      await db
        .update(settings)
        .set({
          business: { ...prev, ...business },
          aiConfig,
          updatedAt: new Date(),
        })
        .where(eq(settings.userId, userIdField));
    } else {
      await db.insert(settings).values({
        id: crypto.randomUUID(),
        userId: userIdField,
        business,
        aiConfig,
      });
    }

    // 6. Upsert policies
    const polExisting = await db
      .select()
      .from(policiesTable)
      .where(eq(policiesTable.userId, userIdField))
      .limit(1);

    if (polExisting.length) {
      await db
        .update(policiesTable)
        .set({ ...policyData, updatedAt: new Date() })
        .where(eq(policiesTable.userId, userIdField));
    } else {
      await db.insert(policiesTable).values({
        userId: userIdField,
        ...policyData,
      });
    }

    // 7. Handle dynamic product/service lists from onboarding
    if (dynLists?.prods && Array.isArray(dynLists.prods) && dynLists.prods.length) {
      const prods = (dynLists.prods as any[]).filter((p) => p?.n?.trim());
      if (prods.length) {
        await db.delete(productsTable).where(eq(productsTable.userId, userIdField));
        await db.insert(productsTable).values(
          prods.map((p: any, i: number) => ({
            id: crypto.randomUUID(),
            userId: userIdField,
            name: String(p.n).trim().slice(0, 200),
            cat: String(p.cat ?? answers[30] ?? "").slice(0, 80),
            price: Math.max(0, Math.round(Number(p.pr) || 0)),
            stock: Math.max(0, Math.round(Number(p.st) || 0)),
            emoji: String(p.emoji ?? "📦").slice(0, 8),
            color: "#E3F4E9",
            keywords: String(p.n).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 12),
            sold: 0,
            hidden: false,
            sortOrder: i,
          }))
        );
      }
    }

    if (dynLists?.svcs && Array.isArray(dynLists.svcs) && dynLists.svcs.length) {
      const svcs = (dynLists.svcs as any[]).filter((s) => s?.n?.trim());
      if (svcs.length) {
        await db.delete(servicesTable).where(eq(servicesTable.userId, userIdField));
        await db.insert(servicesTable).values(
          svcs.map((s: any) => ({
            id: crypto.randomUUID(),
            userId: userIdField,
            name: String(s.n).trim().slice(0, 200),
            desc: String(s.d ?? "").slice(0, 600),
            price: Math.max(0, Math.round(Number(s.pr) || 0)),
            priceFrom: false,
            duration: String(s.dur ?? "1 hour").slice(0, 60),
            booking: true,
            warranty: "",
          }))
        );
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('Onboarding save error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}

function buildAiConfig(answers: Record<number, string | string[]>) {
  const ai = emptyAi();

  // Language mode (Q13)
  const lang = typeof answers[13] === 'string' ? answers[13] : '';
  if (lang === 'Swahili') ai.langMode = 'sw';
  else if (lang === 'English') ai.langMode = 'en';
  else ai.langMode = 'auto';

  // Greeting (Q15)
  const greet = typeof answers[15] === 'string' ? answers[15].trim() : '';
  if (greet) {
    ai.greetSw = greet;
    ai.greetEn = greet;
  }

  // Tone (Q16)
  const tone = typeof answers[16] === 'string' ? answers[16] : '';
  if (tone === 'Very respectful') ai.tone = 'formal';
  else if (tone === 'Friendly & casual') ai.tone = 'friendly';
  else if (tone === 'Playful') ai.tone = 'playful';

  // Emojis (Q17)
  const emoji = typeof answers[17] === 'string' ? answers[17] : '';
  if (emoji === 'No emojis') ai.emojis = false;
  else ai.emojis = true;

  // Local words (Q19) → trigKeywords
  const words = typeof answers[19] === 'string' ? answers[19] : '';
  if (words) ai.trigKeywords = words.split(/[,]+/).map((w: string) => w.trim()).filter(Boolean);

  // Bargaining (Q29) + max discount (Q30)
  const bargain = typeof answers[29] === 'string' ? answers[29] : '';
  ai.negotiable = bargain === 'Yes';
  const maxDisc = typeof answers[30] === 'string' ? Number(answers[30]) : 0;
  if (maxDisc > 0 && maxDisc <= 50) ai.maxDiscount = maxDisc;

  // Handoff triggers (Q60)
  const triggers = Array.isArray(answers[60]) ? answers[60] : typeof answers[60] === 'string' ? [answers[60]] : [];
  ai.trigHuman = triggers.some((t: string) => t.includes('Customer asks'));
  ai.trigNegotiation = triggers.some((t: string) => t.includes('Negotiation'));
  ai.trigAngry = triggers.some((t: string) => t.includes('Angry'));

  // Negotiation handling (Q61)
  const negHand = typeof answers[61] === 'string' ? answers[61] : '';
  if (negHand === 'Always hand over') ai.negotiable = false;

  // Offline message (Q63)
  const offline = typeof answers[63] === 'string' ? answers[63].trim() : '';
  if (offline) {
    ai.offlineMsgSw = offline;
    ai.offlineMsgEn = offline;
  }

  // Collect contact (Q64)
  const collect = typeof answers[64] === 'string' ? answers[64] : '';
  ai.collectContact = collect === 'Yes';

  // Notification (Q65)
  const notify = typeof answers[65] === 'string' ? answers[65] : '';
  ai.notifyHandoff = notify === 'Yes';

  // Brand voice (Q66)
  const voice = typeof answers[66] === 'string' ? answers[66].trim() : '';
  if (voice) ai.personality = voice;

  // Humor (Q67)
  const humor = typeof answers[67] === 'string' ? answers[67] : '';
  if (humor === 'Never') ai.tone = 'formal';

  // Follow-up questions (Q69)
  const followup = typeof answers[69] === 'string' ? answers[69] : '';
  ai.proactive = followup === 'Yes';

  // Upsell (Q70)
  const upsell = typeof answers[70] === 'string' ? answers[70] : '';
  ai.upsell = upsell === 'Yes';

  // Answer length (Q71)
  const len = typeof answers[71] === 'string' ? answers[71] : '';
  ai.answerLen = len === 'Detailed' ? 'long' : 'short';

  return ai;
}

function buildPolicies(answers: Record<number, string | string[]>) {
  const data: Record<string, unknown> = {};

  // Delivery mode (Q47)
  const deliv = typeof answers[47] === 'string' ? answers[47] : '';
  if (deliv.includes('free everywhere')) data.deliveryMode = 'free';
  else if (deliv.includes('No delivery')) data.deliveryMode = 'no';
  else data.deliveryMode = 'paid';

  // Free delivery threshold (Q49)
  const freeOver = typeof answers[49] === 'string' ? Number(answers[49]) : 500000;
  data.freeOver = Number.isFinite(freeOver) ? Math.max(0, freeOver) : 500000;

  // Payment methods (Q42)
  const payMethods = Array.isArray(answers[42]) ? answers[42] : typeof answers[42] === 'string' ? [answers[42]] : [];
  const mobileNum = typeof answers[43] === 'string' ? answers[43].trim() : '';
  data.payments = payMethods.map((m: string) => ({
    name: m,
    detail: m === 'M-Pesa' || m === 'Tigo Pesa' || m === 'Airtel Money' ? mobileNum : m === 'Cash' ? 'Pay at the shop' : '',
  }));

  // Deposit (Q44)
  const deposit = typeof answers[44] === 'string' ? answers[44] : '';
  if (deposit === 'Yes — 50%') data.deposits = '50% deposit required';
  else if (deposit === 'Yes — other') data.deposits = 'Deposit required';
  else data.deposits = '';

  // Receipts (Q45)
  const receipt = typeof answers[45] === 'string' ? answers[45] : '';
  data.receipts = receipt !== 'No';

  // Payment timing (Q46)
  const timing = typeof answers[46] === 'string' ? answers[46] : '';
  data.payTiming = timing || 'On pickup / on delivery';

  // Return days (Q53)
  const retDays = typeof answers[53] === 'string' ? Number(answers[53]) : 3;
  const retCond = typeof answers[54] === 'string' ? answers[54].trim() : '';
  data.returns = (Number.isFinite(retDays) ? retDays : 3) + ' days — ' + (retCond || 'original condition with receipt');

  // Refunds (Q55)
  const refund = typeof answers[55] === 'string' ? answers[55] : '';
  data.refunds = refund || 'Case by case';

  // Warranty (Q56, Q57)
  const warrantyText = typeof answers[56] === 'string' ? answers[56] : '';
  const warrantyExcl = typeof answers[57] === 'string' ? answers[57] : '';
  if (warrantyText) {
    const parts = warrantyText.split(/[·;,]+/).map((s: string) => s.trim()).filter(Boolean);
    data.warranty = parts.map((p: string) => {
      const match = p.match(/(.+?)\s+(\d+\s*\w+)/);
      return {
        cat: match ? match[1].trim() : p,
        dur: match ? match[2].trim() : '30 days',
        not: warrantyExcl || '',
      };
    });
  }

  // Business hours (from Q5 area text or defaults)
  data.hours = {
    mon: '08:00 – 18:00',
    tue: '08:00 – 18:00',
    wed: '08:00 – 18:00',
    thu: '08:00 – 18:00',
    fri: '08:00 – 18:00',
    sat: '09:00 – 14:00',
    sun: 'Closed',
  };

  // Custom rules (Q59)
  const custom = typeof answers[59] === 'string' ? answers[59].trim() : '';
  data.custom = custom ? custom.split(/[·;,]+/).map((s: string) => s.trim()).filter(Boolean) : [];

  // Out of stock behavior (Q32)
  const oos = typeof answers[32] === 'string' ? answers[32] : '';
  data.outOfStockBehavior = oos === 'Yes' ? 'both' : 'notify';

  data.restockDays = 7;

  return data;
}
