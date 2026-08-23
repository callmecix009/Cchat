import { pgTable, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  plan: text('plan').default('free').notNull(),
  pesapalOrderTrackingId: text('pesapal_order_tracking_id'),
  pesapalMerchantRef: text('pesapal_merchant_ref'),
  subscriptionStatus: text('subscription_status').default('inactive').notNull(),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  subscriptionPlan: text('subscription_plan'),
  trialEndsAt: timestamp('trial_ends_at'),
  lastPaymentAt: timestamp('last_payment_at'),
  onboarded: boolean('onboarded').default(false).notNull(),
  isDemoOwner: boolean('is_demo_owner').default(false).notNull(),
  avatar: text('avatar'),
  onboardingData: jsonb('onboarding_data'),
  catalog: jsonb('catalog'),
  messagesUsed: integer('messages_used').default(0).notNull(),
  messagesLimit: integer('messages_limit').default(12000).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  contactName: text('contact_name'),
  contactPhone: text('contact_phone'),
  status: text('status').default('active').notNull(),
  outcome: text('outcome'),
  soldProduct: text('sold_product'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  aiHandled: boolean('ai_handled').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const commands = pgTable('commands', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  trigger: text('trigger').notNull(),
  response: text('response').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id),
  aiConfig: jsonb('ai_config'),
  business: jsonb('business'),
  logo: text('logo'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const whatsappConnections = pgTable('whatsapp_connections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token').notNull(),
  wabaId: text('waba_id').notNull(),
  phoneNumberId: text('phone_number_id').notNull(),
  displayPhoneNumber: text('display_phone_number').notNull(),
  businessName: text('business_name'),
  status: text('status').default('connected').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  cat: text('cat').default('').notNull(),
  price: integer('price').default(0).notNull(),
  stock: integer('stock').default(0).notNull(),
  emoji: text('emoji').default('📦').notNull(),
  color: text('color').default('#E3F4E9').notNull(),
  keywords: jsonb('keywords').$type<string[]>().default([]).notNull(),
  sold: integer('sold').default(0).notNull(),
  hidden: boolean('hidden').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  desc: text('desc').default('').notNull(),
  price: integer('price').default(0).notNull(),
  priceFrom: boolean('price_from').default(false).notNull(),
  duration: text('duration').default('').notNull(),
  booking: boolean('booking').default(false).notNull(),
  warranty: text('warranty').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const policies = pgTable('policies', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  deliveryMode: text('delivery_mode').default('paid').notNull(),
  freeOver: integer('free_over').default(0).notNull(),
  areas: jsonb('areas').$type<{ area: string; fee: number; time: string }[]>().default([]).notNull(),
  payments: jsonb('payments').$type<{ name: string; detail: string }[]>().default([]).notNull(),
  payTiming: text('pay_timing').default('').notNull(),
  deposits: text('deposits').default('').notNull(),
  receipts: boolean('receipts').default(true).notNull(),
  warranty: jsonb('warranty').$type<{ cat: string; dur: string; not: string }[]>().default([]).notNull(),
  returns: text('returns').default('').notNull(),
  refunds: text('refunds').default('').notNull(),
  hours: jsonb('hours').$type<Record<string, string>>().default({}).notNull(),
  outOfStockBehavior: text('out_of_stock_behavior').default('both').notNull(),
  restockDays: integer('restock_days').default(7).notNull(),
  custom: jsonb('custom').$type<string[]>().default([]).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(3).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sales = pgTable('sales', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: text('conversation_id'),
  productId: text('product_id'),
  productName: text('product_name').notNull(),
  qty: integer('qty').default(1).notNull(),
  unitPrice: integer('unit_price').default(0).notNull(),
  amount: integer('amount').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
