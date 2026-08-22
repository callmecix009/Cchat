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
