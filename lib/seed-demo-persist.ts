import { db } from "@/lib/db";
import { users, settings, products as productsTable, services as servicesTable, policies as policiesTable, conversations, messages, sales as salesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSeed } from "@/lib/demo";

/**
 * Persists demo seed data as REAL DB rows for a demo user.
 * Idempotent: checks if products already exist for this user, skips if seeded.
 * Demo data then behaves exactly like real business data across all features.
 */
export async function ensureDemoSeeded(userId: string): Promise<void> {
  const existingProducts = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.userId, userId)).limit(1);
  if (existingProducts.length) {
    // Already seeded - ensure other tables are also seeded minimally (conversations)
    const existingConvos = await db.select({ id: conversations.id }).from(conversations).where(eq(conversations.userId, userId)).limit(1);
    if (existingConvos.length) return; // fully seeded
    // If products exist but convos don't, continue to seed convos/messages
  }

  const seed = createSeed();
  const now = new Date();

  // Use per-user prefixed IDs to avoid global PK collision when multiple demo users exist
  const prodId = (orig: string) => `demo_${userId.slice(0, 8)}_${orig}`;
  const svcId = (orig: string) => `demo_${userId.slice(0, 8)}_${orig}`;
  const convId = (orig: string) => `demo_${userId.slice(0, 8)}_${orig}`;

  try {
    // 1. Settings: business + aiConfig
    const existingSettings = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
    if (!existingSettings.length) {
      await db.insert(settings).values({
        id: crypto.randomUUID(),
        userId,
        business: {
          name: seed.business.name,
          desc: seed.business.desc,
          city: seed.business.city,
          owner: seed.business.owner,
          phone: seed.business.phone,
          slogan: seed.business.slogan,
        },
        aiConfig: seed.ai,
      }).onConflictDoNothing();
    } else {
      // Merge business/ai if missing
      const cur = existingSettings[0];
      const needsBusiness = !cur.business || !(cur.business as any)?.name;
      const needsAi = !cur.aiConfig;
      if (needsBusiness || needsAi) {
        await db.update(settings).set({
          business: needsBusiness ? {
            name: seed.business.name,
            desc: seed.business.desc,
            city: seed.business.city,
            owner: seed.business.owner,
            phone: seed.business.phone,
            slogan: seed.business.slogan,
          } : cur.business,
          aiConfig: needsAi ? seed.ai : cur.aiConfig,
          updatedAt: now,
        }).where(eq(settings.userId, userId));
      }
    }

    // 2. Policies
    const polExisting = await db.select().from(policiesTable).where(eq(policiesTable.userId, userId)).limit(1);
    if (!polExisting.length) {
      await db.insert(policiesTable).values({
        userId,
        deliveryMode: seed.policies.deliveryMode,
        freeOver: seed.policies.freeOver,
        areas: seed.policies.areas,
        payments: seed.policies.payments,
        payTiming: seed.policies.payTiming,
        deposits: seed.policies.deposits,
        receipts: seed.policies.receipts,
        warranty: seed.policies.warranty,
        returns: seed.policies.returns,
        refunds: seed.policies.refunds,
        hours: seed.policies.hours,
        outOfStockBehavior: seed.policies.outOfStockBehavior,
        restockDays: seed.policies.restockDays,
        custom: seed.policies.custom,
        lowStockThreshold: seed.lowStockThreshold,
      }).onConflictDoNothing();
    }

    // 3. Products - delete any existing demo-prefixed then insert seed
    if (!existingProducts.length) {
      await db.insert(productsTable).values(
        seed.products.map((p, i) => ({
          id: prodId(p.id),
          userId,
          name: p.name,
          cat: p.cat,
          price: p.price,
          stock: p.stock,
          emoji: p.emoji,
          color: p.cl,
          keywords: p.kw,
          sold: p.sold,
          hidden: p.hidden,
          sortOrder: i,
        }))
      ).onConflictDoNothing();
    }

    // 4. Services
    const existingSvcs = await db.select({ id: servicesTable.id }).from(servicesTable).where(eq(servicesTable.userId, userId)).limit(1);
    if (!existingSvcs.length) {
      await db.insert(servicesTable).values(
        seed.services.map((s) => ({
          id: svcId(s.id),
          userId,
          name: s.name,
          desc: s.desc,
          price: s.price,
          priceFrom: s.from,
          duration: s.dur,
          booking: s.booking,
          warranty: s.warranty,
        }))
      ).onConflictDoNothing();
    }

    // 5. Conversations + Messages
    const existingConvos = await db.select({ id: conversations.id }).from(conversations).where(eq(conversations.userId, userId)).limit(1);
    if (!existingConvos.length) {
      for (const c of seed.conversations) {
        const cid = convId(c.id);
        await db.insert(conversations).values({
          id: cid,
          userId,
          contactName: c.name,
          contactPhone: c.phone,
          status: c.status,
          outcome: c.outcome,
          soldProduct: c.soldProduct,
          createdAt: new Date(c.t),
        }).onConflictDoNothing();

        for (const m of c.msgs) {
          const role = m.from === "c" ? "customer" : m.from === "ai" ? "ai" : m.from === "me" ? "owner" : "sys";
          await db.insert(messages).values({
            id: crypto.randomUUID(),
            conversationId: cid,
            role,
            content: m.text,
            aiHandled: m.from === "ai",
            createdAt: new Date(m.t),
          }).onConflictDoNothing();
        }
      }
    }

    // 6. Sales (from salesToday)
    const existingSales = await db.select({ id: salesTable.id }).from(salesTable).where(eq(salesTable.userId, userId)).limit(1);
    if (!existingSales.length) {
      for (const s of seed.salesToday) {
        // Find product id for this sale's product name
        const prod = seed.products.find((p) => p.name === s.p);
        await db.insert(salesTable).values({
          id: crypto.randomUUID(),
          userId,
          conversationId: null,
          productId: prod ? prodId(prod.id) : null,
          productName: s.p,
          qty: 1,
          unitPrice: s.amt,
          amount: s.amt,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 6 + 1) * 3600000),
        }).onConflictDoNothing();
      }
    }

    // 7. OnboardingData - ensure onboarding shows populated values
    const userRow = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
    if (userRow && !userRow.onboarded) {
      const answers: Record<number, any> = {
        1: seed.business.name,
        2: seed.business.desc,
        3: seed.business.city,
        8: seed.business.owner,
        12: seed.business.slogan,
        13: "Mixed",
        16: "Friendly & casual",
        17: "Yes, moderately",
        21: "Phones, Accessories, Audio",
        42: ["M-Pesa", "Tigo Pesa", "Airtel Money", "Cash"],
        43: seed.business.phone + " — " + seed.business.owner.toUpperCase(),
        56: "Phones 12 months · Accessories 3 months · Repairs 30 days",
        66: seed.ai.personality,
      };
      const dynLists: any = {
        prods: seed.products.map((p) => ({ n: p.name, pr: String(p.price), st: String(p.stock), cat: p.cat })),
        svcs: seed.services.map((s) => ({ n: s.name, pr: String(s.price), d: s.desc })),
      };
      await db.update(users).set({
        onboarded: true,
        onboardingData: { answers, dynLists },
        updatedAt: now,
      }).where(eq(users.id, userId));
    } else if (userRow && userRow.onboarded && (!userRow.onboardingData || Object.keys(userRow.onboardingData as any).length === 0)) {
      // If already onboarded but data empty, fill minimally
      const answers: Record<number, any> = {
        1: seed.business.name,
        2: seed.business.desc,
        3: seed.business.city,
      };
      await db.update(users).set({
        onboardingData: { answers },
        updatedAt: now,
      }).where(eq(users.id, userId));
    }

    // Ensure trial active for demo
    const needsTrial = !userRow?.trialEndsAt || new Date(userRow.trialEndsAt).getTime() < Date.now();
    if (needsTrial) {
      await db.update(users).set({
        subscriptionStatus: 'trialing',
        trialEndsAt: new Date(Date.now() + 3 * 86400000),
        plan: 'trial',
        updatedAt: now,
      }).where(eq(users.id, userId));
    }

    console.log(`Demo seeded for user ${userId.slice(0,8)}`);
  } catch (e) {
    console.error("Demo seeding failed for", userId, e);
    // Don't throw - allow app to continue with whatever was seeded
  }
}
