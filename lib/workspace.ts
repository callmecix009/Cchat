import { createSeed, emptyPolicies, type Policy, type Product, type Service } from '@/lib/demo';
import { ensureUserRow } from '@/lib/ensureUser';

export type Workspace = {
  isDemoOwner: boolean;
  products: Product[];
  services: Service[];
  policies: Policy;
};

export type Catalog = {
  products?: Product[];
  services?: Service[];
  lowStockThreshold?: number;
};

export async function getWorkspaceForClerkUser(clerkId: string): Promise<Workspace> {
  const user = await ensureUserRow(clerkId);
  if (!user) {
    return { isDemoOwner: false, products: [], services: [], policies: emptyPolicies() };
  }
  const catalog = (user.catalog ?? null) as Catalog | null;
  if (catalog?.products || catalog?.services) {
    return {
      isDemoOwner: user.isDemoOwner,
      products: catalog.products ?? [],
      services: catalog.services ?? [],
      policies: user.isDemoOwner ? createSeed().policies : emptyPolicies(),
    };
  }
  if (user.isDemoOwner) {
    const seed = createSeed();
    return { isDemoOwner: true, products: seed.products, services: seed.services, policies: seed.policies };
  }
  return { isDemoOwner: false, products: [], services: [], policies: emptyPolicies() };
}