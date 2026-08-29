import { emptyPolicies, type Policy, type Product, type Service } from '@/lib/demo';
import { ensureUserRow } from '@/lib/ensureUser';
import { db } from '@/lib/db';
import { users as usersTable, products as productsTable, services as servicesTable, policies as policiesTable } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export type Workspace = {
  isDemoOwner: boolean;
  products: Product[];
  services: Service[];
  policies: Policy;
  lowStockThreshold: number;
};

export type Catalog = {
  products?: Product[];
  services?: Service[];
  lowStockThreshold?: number;
};

function rowToProduct(r: typeof productsTable.$inferSelect): Product {
  return {
    id: r.id,
    name: r.name,
    cat: r.cat,
    price: r.price,
    stock: r.stock,
    emoji: r.emoji,
    cl: r.color,
    kw: Array.isArray(r.keywords) ? r.keywords : [],
    sold: r.sold,
    hidden: r.hidden,
  };
}

function rowToService(r: typeof servicesTable.$inferSelect): Service {
  return {
    id: r.id,
    name: r.name,
    desc: r.desc,
    price: r.price,
    from: r.priceFrom,
    dur: r.duration,
    booking: r.booking,
    warranty: r.warranty,
  };
}

function policyRowToPolicy(
  r: typeof policiesTable.$inferSelect
): Policy {
  return {
    deliveryMode: r.deliveryMode as Policy['deliveryMode'],
    areas: Array.isArray(r.areas) ? r.areas : [],
    freeOver: r.freeOver,
    payments: Array.isArray(r.payments) ? r.payments : [],
    payTiming: r.payTiming,
    deposits: r.deposits,
    receipts: r.receipts,
    warranty: Array.isArray(r.warranty) ? r.warranty : [],
    returns: r.returns,
    refunds: r.refunds,
    hours: r.hours ?? {},
    outOfStockBehavior: r.outOfStockBehavior as Policy['outOfStockBehavior'],
    restockDays: r.restockDays,
    custom: Array.isArray(r.custom) ? r.custom : [],
  };
}

async function migrateLegacyCatalog(userId: string, catalog: Catalog | null) {
  if (!catalog) return;
  const prods = Array.isArray(catalog.products) ? catalog.products : [];
  const svcs = Array.isArray(catalog.services) ? catalog.services : [];
  if (prods.length) {
    await db.insert(productsTable).values(
      prods.map((p, i) => ({
        id: p.id || crypto.randomUUID(),
        userId,
        name: p.name,
        cat: p.cat ?? '',
        price: Math.round(p.price ?? 0),
        stock: Math.round(p.stock ?? 0),
        emoji: p.emoji ?? '📦',
        color: p.cl ?? '#E3F4E9',
        keywords: Array.isArray(p.kw) ? p.kw : [],
        sold: p.sold ?? 0,
        hidden: !!p.hidden,
        sortOrder: i,
      }))
    ).onConflictDoNothing();
  }
  if (svcs.length) {
    await db.insert(servicesTable).values(
      svcs.map((s) => ({
        id: s.id || crypto.randomUUID(),
        userId,
        name: s.name,
        desc: s.desc ?? '',
        price: Math.round(s.price ?? 0),
        priceFrom: !!s.from,
        duration: s.dur ?? '',
        booking: !!s.booking,
        warranty: s.warranty ?? '',
      }))
    ).onConflictDoNothing();
  }
  if (typeof catalog.lowStockThreshold === 'number') {
    await db
      .insert(policiesTable)
      .values({ userId, lowStockThreshold: Math.max(1, Math.round(catalog.lowStockThreshold)) })
      .onConflictDoNothing();
  }
  // clear the JSON blob after migration so this runs only once
  await db.update(usersTable).set({ catalog: null }).where(eq(usersTable.id, userId));
}

export async function getWorkspaceForClerkUser(clerkId: string): Promise<Workspace> {
  const user = await ensureUserRow(clerkId);
  if (!user) {
    return { isDemoOwner: false, products: [], services: [], policies: emptyPolicies(), lowStockThreshold: 3 };
  }

  if (user.isDemoOwner) {
    // Persist demo seed as real DB rows on first access, then fall through to normal DB load
    try {
      const { ensureDemoSeeded } = await import("@/lib/seed-demo-persist");
      await ensureDemoSeeded(user.id);
    } catch (e) {
      console.error("Demo seeding from workspace failed:", e);
    }
    // Don't return virtual seed - fall through to load real persisted data
    // But keep isDemoOwner flag for UI; data will now come from DB
  }

  let productRows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.userId, user.id))
    .orderBy(asc(productsTable.sortOrder));
  let serviceRows = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.userId, user.id));

  // one-time migration from the old JSON blob
  const legacy = (user.catalog ?? null) as Catalog | null;
  if (!productRows.length && !serviceRows.length && legacy && (legacy.products?.length || legacy.services?.length)) {
    try {
      await migrateLegacyCatalog(user.id, legacy);
      productRows = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.userId, user.id))
        .orderBy(asc(productsTable.sortOrder));
      serviceRows = await db.select().from(servicesTable).where(eq(servicesTable.userId, user.id));
    } catch (err) {
      console.error('Legacy catalog migration failed:', err);
    }
  }

  let polRow = (
    await db.select().from(policiesTable).where(eq(policiesTable.userId, user.id)).limit(1)
  )[0];
  if (!polRow) {
    polRow = (
      await db.insert(policiesTable).values({ userId: user.id }).onConflictDoNothing().returning()
    )[0];
    if (!polRow) {
      polRow = (
        await db.select().from(policiesTable).where(eq(policiesTable.userId, user.id)).limit(1)
      )[0];
    }
  }

  return {
    isDemoOwner: !!user.isDemoOwner,
    products: productRows.map(rowToProduct),
    services: serviceRows.map(rowToService),
    policies: polRow ? policyRowToPolicy(polRow) : emptyPolicies(),
    lowStockThreshold: polRow?.lowStockThreshold ?? 3,
  };
}
