# C-chat Architecture — Technical Report

> Generated 2026-09-17 — describes the **actual current codebase** at `C:\Users\ABLEGOD\OneDrive\Desktop\cchat-app` on branch `feat/green-dark-demo-v2` (≈ `1abca0c` ahead of `main`). No secrets are included. Line numbers are 1-indexed.

---

## 1. Product Overview

**What C-chat is.** C-chat is a Swahili-first WhatsApp business assistant for Tanzanian micro-retailers (phone shops, accessories, small duka). The AI answers customers 24/7 using the owner's **live** products, services, and shop rules, hands over to the owner on triggers, and keeps every conversation in one inbox. It is *not* a generic chatbot playground — every answer is grounded in the business's own data or the AI says it will check with the owner.

**Who it is for.** Solo owners and small teams who sell via WhatsApp (`+255`), have a catalog on their phone, and need to reply in Swahili/English without hiring staff.

**Problem it solves.** Customers ask the same questions (“Bei gani iPhone 13? Mnaleta Mbezi?”), owners are offline, stock/prices change daily, and WhatsApp chats are scattered across phones. C-chat centralizes chats, keeps stock/prices authoritative, and drafts replies instantly while preserving the owner’s ability to take over.

**Main capabilities (as implemented)**
- Onboarding wizard → business profile + catalog seed (`app/onboarding/page.tsx:12-374`)
- Products/Services/Policies CRUD (`app/(dashboard)/dashboard/products|services|policies/page.tsx`)
- AI Configure — tone, language, handoff, negotiation, hours (`app/(dashboard)/dashboard/ai/page.tsx`)
- Test Agent — three tabs (Test customer / Owner mode / General assistant) (`app/(dashboard)/dashboard/agent/page.tsx:54-407`)
- Inbox — list/detail, filters, take-over, sale logging (`app/(dashboard)/dashboard/inbox/page.tsx:28-691`)
- Dashboard — stats, volume/handling charts, Running out, setup checklist (`app/(dashboard)/dashboard/page.tsx:116-486`)
- WhatsApp Embedded Signup + webhook ingest (`lib/whatsapp.ts:30-169`, `app/api/whatsapp/*`)
- Subscription/trial gate (`app/(dashboard)/layout.tsx:19`, `lib/db/schema.ts:8-16`)

---

## 2. Technology Stack

| Layer | Actual choice | Evidence |
|---|---|---|
| Framework | **Next.js 16.3.1** App Router, React 19.2.8 | `package.json:26,29` `next dev --webpack` |
| Language | **TypeScript 5** `strict true`, `jsx react-jsx`, path `@/*` | `tsconfig.json:7,14,21` |
| Styling | **Tailwind CSS 4** via `@import "tailwindcss"` + `postcss.config.mjs:3` `@tailwindcss/postcss`; **no `tailwind.config.*`**; CSS variables + `@theme inline` (`app/globals.css:1,190-216`); `clsx` + `tailwind-merge` `lib/utils.ts:4` | `package.json:33,36,43` |
| Auth | **Clerk** `@clerk/nextjs ^6.39.6` (`ClerkProvider` `app/layout.tsx:56`, `clerkMiddleware` `proxy.ts:1`) | `package.json:19-23` |
| DB | **Supabase Postgres** via **Drizzle ORM 0.38** + `postgres 3.4.0` with `prepare: false` (pGbouncer). Direct URL for migrations | `drizzle.config.ts:3-14`, `lib/db/index.ts:10`, `lib/db/schema.ts:1-142` |
| AI | **DeepSeek `deepseek-chat`** via **OpenAI SDK 4.73** `baseURL https://api.deepseek.com` (`lib/ai-service.ts:16`) | `package.json:27`, `lib/ai-config.ts:7` |
| Charts | **recharts 3.10.1** | `package.json:32` |
| Icons | **react-icons 5.7.0** + custom inline SVGs (Tabler crown `M12 6l4 6l5 -4...`) | `components/icons.tsx:46`, `app/page.tsx:572` |
| Image crop | **react-easy-crop 5.4.1** for business logo 1:1 crop | `package.json` (added), `components/logo-crop-dialog.tsx:4` |
| Hosting | Vercel assumed (`.vercel` gitignored, `next.config.ts:6` `optimizePackageImports`) | `next.config.ts:1-16` |
| Webhooks | **Svix-style HMAC** for Clerk (`app/api/webhooks/clerk/route.ts:37-50`), **HMAC SHA256** for Meta (`lib/whatsapp.ts:156-165`) |  |
| Rate limit | In-memory `Map` fixed-window (`lib/rate-limit.ts:37-126`) |  |

`node_modules/next/dist/docs` is the authoritative guide for App Router conventions per `AGENTS.md`.

---

## 3. Repository Structure

```
cchat-app/
├── app/
│   ├── layout.tsx           # RootLayout, fonts (Bricolage/Instrument/Spline), ClerkProvider, ThemeScript
│   ├── globals.css          # 1920+ lines: vars, dark theme, components, black-grid, overrides
│   ├── page.tsx             # Landing (711 lines) — hero, pricing 15k/144k, mwongozo, FAQ
│   ├── (auth)/sign-in|sign-up/[[...]]/page.tsx
│   ├── (dashboard)/layout.tsx # Auth + subscription gate → DashboardShell
│   │   └── dashboard/page.tsx # Analytics + stock + checklist (force-dynamic)
│   │   └── dashboard/[inbox|agent|ai|products|services|policies]/page.tsx
│   │   └── billing/page.tsx, settings/page.tsx, plan-selection/page.tsx
│   ├── onboarding/page.tsx  # 10-step wizard, dyn products/services
│   ├── api/
│   │   ├── chat/route.ts, onboarding/route.ts, workspace/route.ts, settings/route.ts
│   │   ├── ai-config/route.ts, inbox/*, billing/route.ts, whatsapp/*, webhooks/clerk/route.ts
│   ├── sitemap.ts, robots.ts, icon.png, favicon.ico
├── components/
│   ├── dashboard-shell.tsx  # Nav 9 items, collapse, LIVE chip, toasts, polling
│   ├── dashboard/stats.tsx, charts.tsx, collapsible-card.tsx, product-thumb.tsx
│   ├── premium.tsx, plan-badges.tsx, premium-indicator.tsx, logo-crop-dialog.tsx
│   ├── branding/CchatLogo.tsx, icons.tsx, theme-provider.tsx (148 lines), ui/card.tsx|badge.tsx
├── lib/
│   ├── db/schema.ts (142 lines, 10 tables), db/index.ts, db/ensure-columns.ts
│   ├── ai-service.ts (216 lines), ai-config.ts, brand.ts, demo.ts (867 lines),
│   ├── ensureUser.ts, product-image.ts, whatsapp.ts (169 lines), workspace.ts (188 lines),
│   ├── rate-limit.ts, seed-demo-persist.ts (277 lines), pesapal-config.ts, utils.ts
├── drizzle/                 # 0001_*.sql, meta/
├── public/images/           # c-chat-logo.png, landing/*.webp
├── drizzle.config.ts, next.config.ts, postcss.config.mjs, tsconfig.json, proxy.ts
├── CCHAT_ARCHITECTURE.md    # this file
├── .env.example (33 lines), .env.local (gitignored)
```

Only documented folders/files exist; no `tailwind.config.*`, `vercel.json`, or `supabase-js` client.

---

## 4. Authentication Architecture

```
Sign Up → Clerk (pk_test/sk_test) → @clerk/nextjs → proxy.ts:72 auth() → ensureUserRow(clerkId)
                ↓                                 ↓
          Clerk webhook (Svix)              app/(dashboard)/layout.tsx:19 subscription gate
                ↓                                 ↓
            users row                         DashboardShell (UserButton)
```

- **Provider:** Clerk (`app/layout.tsx:31` `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `proxy.ts:61` `CLERK_SECRET_KEY`). `ClerkProvider` wraps app (`app/layout.tsx:56-64`) with fallback error UI if `pk` missing (`:36-54`).
- **Middleware:** `proxy.ts:5-21` `isPublicRoute` whitelists `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/privacy`, `/terms`, `/acceptable-use`, `/jinsi-ya...`, `/sitemap`, `/robots`, `/api/webhooks*`, `/api/whatsapp/webhook`. `isAuthRoute` redirects logged-in to `/dashboard` (`:74-82`). `isApiRoute` returns 401 JSON not redirect (`:89-91`). Handles `jwk kid mismatch` by clearing `__session` (`:95-118`).
- **User row:** `lib/ensureUser.ts:6-62` `clerkClient().users.getUser(clerkId)` fetches email/name/phone, creates `users` with `id randomUUID`, `clerkId unique`, `plan free`, `subscriptionStatus inactive`, `isDemoOwner` if email in `DEMO_EMAILS` (`:6-11`).
- **Webhook sync:** `app/api/webhooks/clerk/route.ts:37-68` verifies `svix-id/timestamp/signature` (5 min window), handles `user.created/updated/deleted` (`:91-127`). In `NODE_ENV !== production` bypasses if secret empty (`:18`).

Business isolation: every `userId` FK (`conversations`, `products`, `services`, `policies`, `whatsapp_connections`, `sales`) references `users.id`.

---

## 5. Onboarding Architecture

`app/onboarding/page.tsx:12-91` `ONB_STEPS` 10 steps, `answers: Record<number,string|string[]>` + `dynLists` for variable rows.

Flow:

```
Open /onboarding (client, fetch GET /api/onboarding → users.onboardingData.answers + dynLists)
↓
Steps 1-8: business name, description, city, phone, products (dyn), services (dyn), policies, AI personality
↓
POST /api/onboarding { answers, products, services, policies, ai }
↓
Workspace writes:
  users.onboardingData = { answers, ... } jsonb  (lib/db/schema.ts:20)
  products/services seeded from dynLists (legacy path now via /api/workspace)
  policies row created (deliveryMode, areas, payments, etc)
  settings.aiConfig merged from ai answers
  users.onboarded = true (if all required Q answered)
↓
Redirect → /plan-selection if trial not started, else /dashboard (app/onboarding/page.tsx:103-130)
```

`lib/seed-demo-persist.ts:11` `ensureDemoSeeded` also seeds demo if `isDemoOwner` on first dashboard load. `lib/workspace.ts:71-117` `migrateLegacyCatalog` migrates old `users.catalog` JSON to `products`/`services` tables for backward compat.

---

## 6. Business Data Model

```mermaid
erDiagram
  USERS ||--o| SETTINGS : "1-1 per clerk user"
  USERS ||--o{ CONVERSATIONS : "1-n"
  USERS ||--o{ PRODUCTS : "1-n"
  USERS ||--o{ SERVICES : "1-n"
  USERS ||--o| POLICIES : "1-1 (PK=userId)"
  USERS ||--o| WHATSAPP_CONNECTIONS : "1-1"
  USERS ||--o{ SALES : "1-n"
  CONVERSATIONS ||--o{ MESSAGES : "1-n"
  SALES }o--|| PRODUCTS : "optional productId"
  SALES }o--|| CONVERSATIONS : "optional conversationId"

  USERS {
    text id PK
    text clerkId unique
    text email
    text plan
    text subscriptionStatus inactive|trialing|active|expired|canceled
    timestamp trialEndsAt
    timestamp subscriptionExpiresAt
    boolean onboarded
    boolean isDemoOwner
    text avatar
    jsonb onboardingData
    jsonb catalog legacy
  }
  SETTINGS {
    text id PK
    text userId unique FK
    jsonb business name/desc/city/phone/owner
    text logo base64 data-url
    jsonb aiConfig
  }
```

Key relationships (`lib/db/schema.ts`):

- `users.id PK`, `users.clerkId unique`, indexes on `conversations.user_id`, `messages.conversation_id`, `products.user_id`, `services.user_id`, `sales.user_id`.
- `settings.userId unique` → `users.id`; `whatsapp_connections.userId unique cascade`; `policies.userId PK cascade`; `products/services` cascade on user delete.

---

## 7. Products

- **Storage:** `products` table (`lib/db/schema.ts:80-96`) per-user: `id PK`, `userId FK cascade`, `name`, `cat default ''`, `price int`, `stock int`, `emoji 📦`, `image text nullable` (added via `ensure-columns.ts:11` `ADD COLUMN IF NOT EXISTS`), `color #E3F4E9`, `keywords jsonb string[]`, `sold int`, `hidden bool`, `sortOrder int`.
- **Image handling:** `lib/product-image.ts:5-55` validates `png/jpeg/webp` 4 MB, downscales to `512` via canvas JPEG 0.82 (fills white for transparency). Business logo uses `components/logo-crop-dialog.tsx:12-52` with `react-easy-crop` 1:1, output `512-1024` high-quality, preserves PNG transparency, JPEG 0.92 white fill.
- **Retrieval:** `lib/workspace.ts:141-149` `getWorkspaceForClerkUser` parallel selects `products where userId` ordered `sortOrder`; also `app/api/workspace/route.ts:GET` returns `{products, services, policies, lowStockThreshold}`. Dashboard aggregates `catalogProducts` (`app/(dashboard)/dashboard/page.tsx:173-209`) and `lowStock = stock <= threshold` (`:332`).
- **Edit:** `app/(dashboard)/dashboard/products/page.tsx:64-161` modal with `name/price/stock/cat/image/keywords`; `processProductImage` for photos; `persist(list, keepImageFor)` `POST /api/workspace` with `products` array (photos omitted unless `keepImageFor`); server keeps stored photos for omitted `image` fields. Threshold & `outOfStockBehavior` (`both|suggest|notify`) stored in `policies`.
- **Purchase:** Inbox sale flow (`app/(dashboard)/dashboard/inbox/page.tsx:207-262`) `POST /api/inbox/outcome` with `productId/qty` → `sales` row + `products.stock` decrement + `sold` increment; stock check `q > stock` error (`:215`).

---

## 8. Inbox

- **Storage:** `conversations` (`id PK`, `userId FK`, `contactName`, `contactPhone`, `status default active|ai|waiting|closed`, `outcome sold|no`, `soldProduct`, `lastReadAt`) + `messages` (`id PK`, `conversationId FK`, `role c|ai|owner|me|sys`, `content`, `aiHandled bool`, `createdAt`). `sales` logs purchases.
- **Loading:** `app/api/inbox/route.ts:GET` fetches user's conversations + messages + `unreadCount` via `COUNT(*)` where `createdAt > lastReadAt` (fixed inbox unread bug). Client `fetch /api/inbox` (`app/(dashboard)/dashboard/inbox/page.tsx:52`) + polling 45s in `dashboard-shell.tsx:238-260` for badge.
- **Unread:** Per-conversation `unreadCount`; list left-border `2px solid #111` when `>0` (`inbox/page.tsx:360`) → dark ` #EDEDED` (`app/globals.css:1772`). Opening triggers `POST /api/inbox/read` (`:68-79`) optimistic `unreadCount=0`.
- **Selection:** `openId` state + `mobile list/detail` toggle (`inbox/page.tsx:34,52-58`), `transcriptRef` auto-scroll.
- **Sending:** `sendReply` (`:167-205`) `POST /api/inbox/send {conversationId,text,contactName,contactPhone}` → creates `messages` (`role me`), sets `status waiting`, `takeover true`. If WhatsApp connected, `lib/whatsapp.ts:129-154` `sendWhatsAppText` via Graph API. Errors `WHATSAPP_NOT_CONNECTED|PAUSED` surface `inote fail` with link to `/settings` (`:625-631`).
- **Real channels:** WhatsApp webhook `POST /api/whatsapp/webhook` creates tenant-scoped `` `${userId}_wa_<phone>` `` conversation + `customer` messages (`app/api/whatsapp/webhook/route.ts:69-104`). Others TBD.

---

## 9. Chat / Test Agent

`app/(dashboard)/dashboard/agent/page.tsx:54-407` client, three tabs:

- **Test customer** (`tab=test`) — simulates customer writing in Swahili/English. `detectLang` (`lib/demo.ts:604`) picks `sw|en`. History `testConvo.msgs.filter sys → {role user/assistant}` → `POST /api/chat {messages, mode: business}` → `pushReplies` typing animation (`:105-123`). Takeover pause (`takebanner`) when owner replies.
- **Owner mode** (`tab=owner`) — local `ownerBrain(text, state)` (`lib/demo.ts:825-867`) rule-based; no API.
- **AI Assistant** (`tab=assistant`) — `mode: general` (`lib/ai-service.ts:168-177`) generic prompt, not business-limited.

UI: `phone` frame (`app/globals.css:698-850`) with `ph` header, `pbody #F9F9F7` dark `#0F0F0F`, `bub.c` white→dark ` #242424` `#EDEDED` border `#2E2E2E`, `bub.a` black `#111`→dark green `#12261C` `#EDEDED` border `#1E4D30` (no white frames in dark), `hintchips`, `composer` (`input #F7F7F5` dark `#1A1A1A`). Sidebar `sidecard` shows `Agent brain — live inputs` (products/services count, language, tone, discount).

---

## 10. DeepSeek Architecture

```
Chat UI (agent/page.tsx:188,147 fetch /api/chat)
  ↓ POST {messages: last20×2000chars, mode business|general}
API /api/chat/route.ts:8-60 (nodejs, RL_CHAT 10/min IP+user)
  ↓ auth() → chatWithAI(userId, trimmed, {mode})
lib/ai-service.ts:179-210
  ↓ loadBusinessContext(userId) queries users/settings/products/services/policies + onboarding fallback
  ↓ buildSystemPrompt(ctx): business name/desc/city/owner/phone + aiConfig (personality/tone/lang/emojis/answerLen/negotiable/upsell) + PRODUCTS/SERVICES/POLICIES + RULES (never invent prices)
    or buildGeneralSystemPrompt() for mode general
  ↓ getClient() → OpenAI({baseURL:"https://api.deepseek.com", apiKey: DEEPSEEK_API_KEY}) :16
  ↓ openai.chat.completions.create({model:"deepseek-chat", messages:[system,...trimmed], max_tokens:800, temperature:0.7}) :193-201
  ↓ {reply} or error DEEPSEEK_NOT_CONFIGURED → 503
UI pushReplies
```

Files: `lib/ai-config.ts:7` key validation (trimmed ≠ `sk-...` placeholder), `lib/ai-service.ts:35-177` context builders, `app/api/chat/route.ts` rate-limit `RL_CHAT` (`lib/rate-limit.ts:106`).

**Fallback:** `lib/demo.ts:659-823` `agentBrain` rule engine (human/angry/negotiation/stock/service/delivery) used when LLM unavailable.

**DO NOT expose `DEEPSEEK_API_KEY`.**

---

## 11. AI Context / Business Memory

Source of truth is **DB**, not hard-coded files:

- **Business:** `settings.business` jsonb (`name, desc, city, phone, owner, connected`) fallback `users.onboardingData.answers[1,2,3,8,43]` (`lib/ai-service.ts:42-55`).
- **Products:** `products` where `userId`, `hidden=false`, with `price, stock, cat, keywords` (`:57-62`), listed as `PRODUCTS` lines `stock` in prompt (`:124-130`).
- **Services:** `services` (`:63-66`) listed as `SERVICES`.
- **Policies:** `policies` row (`:67-72`) → `deliveryMode/freeOver/areas/payments/warranty/hours/custom/outOfStockBehavior/restockDays` rendered (`:132-150`).
- **AI config:** `settings.aiConfig` jsonb (`lib/demo.ts:60-85` `AiConfig` tone/personality/greetSwEn/langMode/proactive/pushiness/upsell/trigHuman/Negotiation/Angry/keywords/negotiable/maxDiscount/answerLen/emojis) defaults `emptyAi` (`:559-586`) overridden via `POST /api/ai-config` (`app/(dashboard)/dashboard/ai/page.tsx:102-117`).
- **Context assembly:** `loadBusinessContext` parallel selects + `migrateLegacyCatalog` (`lib/workspace.ts:71-117`), then `buildSystemPrompt` concatenates with `IMPORTANT RULES` (no hallucination, handoff, never share keys) (`lib/ai-service.ts:90-164`).

---

## 12. Subscription / Trial Architecture

Schema `users` (`lib/db/schema.ts:8-16`): `plan free`, `subscriptionStatus inactive|trialing|active|expired|canceled`, `subscriptionPlan`, `subscriptionExpiresAt`, `trialEndsAt`, `lastPaymentAt`.

- **Trial:** `POST /api/billing {action:start_trial}` sets `status trialing`, `trialEndsAt = now+3d` (`app/(dashboard)/billing/page.tsx:62-75` `startTrial`). Trial banner `dashboard-shell.tsx:388-396` shows `Free trial: {d} left`.
- **Expiration:** `app/(dashboard)/layout.tsx:19` gate redirects to `/plan-selection` if `!isDemoOwner` and status `expired/inactive/canceled`. `proxy.ts` does not gate billing — layout does.
- **Subscribe:** `POST /api/billing {action:subscribe, plan: monthly|yearly}` sets `status active`, `plan`, `expiresAt +30/365d` (`billing/page.tsx:77-96`). Prices `15,000` / `144,000` (`Save 20%` vs `180,000`) shown in `billing/page.tsx:184-207` and `app/page.tsx:558-583`.
- **Access control:** Client `dashboard-shell.tsx:96-126` also checks `/api/billing` and redirects if `expired|inactive|canceled` unless on allowlist (`/plan-selection`, `/settings`, etc). **CURRENTLY functional** as local state — no payment verification yet.
- **Billing page:** Shows `Free Trial · Xd left / Premium / Extra Premium` via `planBadgeInfo` (`components/premium.tsx:42-58`) + `GoldCrown`.

Future: Pesapal will set `active` after verified callback; currently `subscribe` is mock (no money moves).

---

## 13. Payment Architecture

**CURRENT:** **Not connected.** `lib/pesapal-config.ts:21-38` reads `PESAPAL_CONSUMER_KEY/SECRET/ENVIRONMENT/CALLBACK_URL`; `isPesapalConfigured` checks all present. `.env.example:23-27` shows keys, but `.env.local` has sandbox keys without callback; no API route calls Pesapal. `HANDOFF.md` notes pricing but no transaction code. Inbox sale logs are **internal** (`sales` table) — “Your customers' money never touches C-chat” (`app/(dashboard)/billing/page.tsx:223`, `settings/page.tsx:496`).

**FUTURE integration points** (not implemented):

- `app/api/billing/route.ts` → Pesapal `SubmitOrderRequest` → redirect to `redirect_url` → `GET /api/pesapal/callback?OrderTrackingId` → verify `GetTransactionStatus` → update `users.subscriptionStatus/ExpiresAt/lastPaymentAt`.
- Webhook `POST /api/pesapal/ipn` HMAC verify → same.
- Env: `PESAPAL_CALLBACK_URL` must be public (`https://cchat.site/api/pesapal/callback`).

**Do not pretend integration exists.**

---

## 14. WhatsApp Architecture

- **Current status:** Embedded Signup **implemented**, webhook ingest **implemented**, sending **implemented**, but **requires Meta env** to go live. `lib/whatsapp.ts:6-10` `isEmbeddedSignupConfigured()` checks `META_APP_ID/SECRET/CONFIG_ID/WEBHOOK_VERIFY_TOKEN` (all commented in `.env.local:30-33`).
- **Connect:** `app/(dashboard)/settings/page.tsx:198-251` loads `GET /api/whatsapp/config` (`app/api/whatsapp/config/route.ts:28` returns `{appId,configId}` or `503 NOT_CONFIGURED`), loads `https://www.facebook.com/js/whatsapp_business_embedded_signup.js`, `WhatsAppBusinessEmbeddedSignup.init({clientId,configId,onSuccess:authorizationCode → POST /api/whatsapp/connect})`. `POST /api/whatsapp/connect/route.ts:108` `exchangeAuthCode(code)` → OAuth `oauth/access_token` → `fb_exchange_token` long token → `debug_token` fallback for `wabaId` → `GET /{wabaId}/phone_numbers` → upsert `whatsapp_connections {userId, accessToken, wabaId, phoneNumberId, displayPhoneNumber, businessName, status:connected}`.
- **Status UI:** Green `LIVE` with pulse dot `bg-[#149A5B] animate-ping` when `whatsappConnected && !waPaused` (`components/dashboard-shell.tsx:426-434` header, `app/(dashboard)/dashboard/inbox/page.tsx:287-290`, `app/(dashboard)/settings/page.tsx:334-337` chip). Grey `Paused` / `Connect WhatsApp` otherwise. Uses `settings.whatsappConnected` from `fetch /api/settings` (`dashboard-shell.tsx:68-87`).
- **Disconnect:** `POST /api/whatsapp/disconnect/route.ts:40` delete where `userId`.
- **Webhook:** `GET /api/whatsapp/webhook/route.ts:14-27` verifies `hub.mode=subscribe & hub.verify_token === META_WEBHOOK_VERIFY_TOKEN → challenge`; `POST :29-113` verifies `x-hub-signature-256` via `verifyMetaSignature` (`lib/whatsapp.ts:156-165` timingSafeEqual), loops `entry.changes`, looks up `whatsappConnections where phoneNumberId`, creates tenant-scoped `` `${userId}_wa_<normalizedPhone>` `` conversation (`conn[0].userId` scope) with lookups/updates filtered by both `id` and `userId` (`route.ts:69-86`), then inserts `messages` with that `conversationId`.
- **Sending:** `sendWhatsAppText(accessToken, phoneNumberId, to, text)` (`lib/whatsapp.ts:129-154`) `POST /{phoneNumberId}/messages {messaging_product:whatsapp, to, type:text, text:{body}}` called from `app/api/inbox/send/route.ts`.
- **Planned not yet:** template messages, media, delivery receipts, status `connecting|pending|error` (currently only `connected`/`paused`), multi-number support.

---

## 15. Database

Drizzle + Postgres (`lib/db/schema.ts:1-142`, `drizzle.config.ts:10-14` `DIRECT_URL` for push, `DATABASE_URL` pooler `prepare:false` for app `lib/db/index.ts:10`).

| Table | Purpose | Key fields | Notes |
|---|---|---|---|
| `users` | Clerk-synced accounts | `id, clerkId unique, email, plan free, subscriptionStatus inactive, trialEndsAt, onboarded, isDemoOwner, avatar, onboardingData jsonb, catalog jsonb legacy, messagesUsed/Limit 0/12000` | `ensureUser.ts` creates |
| `conversations` | Chat threads | `id, userId FK idx, contactName/Phone, status active/ai/waiting/closed, outcome sold/no, lastReadAt` | `` `${userId}_wa_<phone>` `` tenant-scoped for WA |
| `messages` | Transcript | `id, conversationId FK idx, role c/ai/owner/me/sys, content, aiHandled, createdAt` | `aiHandled` for handling bars |
| `commands` | Legacy triggers | `id, userId, trigger, response` | Unused in UI |
| `settings` | Business + logo + AI | `id, userId unique, business jsonb, logo text base64, aiConfig jsonb` | `logo` 800k limit |
| `whatsapp_connections` | WA Business | `id, userId unique cascade, accessToken, wabaId, phoneNumberId, displayPhoneNumber, status connected` | One per user |
| `products` | Catalog | `id, userId FK idx, name, cat, price, stock, emoji, image text, color, keywords jsonb, sold, hidden, sortOrder` | `image` added via ensure-columns |
| `services` | Services | `id, userId FK idx, name, desc, price, priceFrom, duration, booking, warranty` |  |
| `policies` | Shop rules | `userId PK cascade, deliveryMode paid, freeOver, areas {area,fee,time}[], payments {name,detail}[], warranty[] , returns/refunds, hours {}, outOfStockBehavior both, lowStockThreshold 3` | Single row per user |
| `sales` | Sales log | `id, userId FK idx, conversationId?, productId?, productName, qty, unitPrice, amount` | Dashboard revenue30 |

Migrations: `drizzle/meta/_journal.json` version 7, `0001_volatile_shadowcat.sql` applied via `drizzle-kit push`.

---

## 16. API Routes

| Route | Method | Auth | Purpose | Data | Side Effects |
|---|---|---|---|---|---|
| `/api/chat` | POST | Clerk + RL IP 10/min + user 10/min | DeepSeek chat | `{messages:20×2000, mode:business\|general}` | Calls `chatWithAI`, returns `{reply}` or `503 DEEPSEEK_NOT_CONFIGURED` (`app/api/chat/route.ts:8-60`) |
| `/api/onboarding` | GET/POST | Clerk, RL 10/h | Wizard state | `GET → {answers, products, services, policies, ai} / POST → same` | Writes `users.onboardingData, products, services, policies, settings.aiConfig, users.onboarded` |
| `/api/workspace` | GET/POST | Clerk | Catalog + policies | `GET → {products, services, policies, lowStockThreshold} / POST → {products[], lowStockThreshold, policies:{outOfStockBehavior}}` | Replaces `products/services/policies` rows, migrates legacy |
| `/api/settings` | GET/POST | Clerk, RL 10/min | Business + WA status + logo/avatar | `GET → {business, logo, avatar, whatsappConnected, whatsappPaused, planStatus...} / POST → {business, logo, avatar}` | Validates base64 `png\|jpeg\|webp` 800k (`:99-110`), upserts `settings` |
| `/api/ai-config` | GET/POST | Clerk | AI behaviour | `GET → {ai} / POST → {ai}` | Writes `settings.aiConfig` |
| `/api/inbox` | GET | Clerk, RL 20/h | Conversations + unread | → `{conversations: [{msgs, unreadCount}]}` | COUNT where `createdAt>lastReadAt` |
| `/api/inbox/send` | POST | Clerk, RL user 60/h + IP 20/h | Owner reply | `{conversationId,text,contactName,contactPhone}` | Insert `messages me`, `status waiting`, `takeover`, `sendWhatsAppText` if connected else `WHATSAPP_NOT_CONNECTED` |
| `/api/inbox/read` | POST | Clerk | Mark read | `{conversationId}` | Sets `conversations.lastReadAt=now` |
| `/api/inbox/status` | POST | Clerk | Takeover/close | `{conversationId,status:ai\|waiting\|closed}` | Update `conversations.status`, push `sys` message |
| `/api/inbox/outcome` | POST | Clerk | Log sale | `{conversationId,outcome:sold\|no,productId,qty,productName}` | Insert `sales`, decrement `products.stock`, inc `sold`, set `conversations.outcome` |
| `/api/billing` | GET/POST | Clerk, RL | Trial/subscription | `GET→{status,plan,trialEndsAt,subscriptionExpiresAt} / POST {action:start_trial\|subscribe\|cancel, plan}` | Writes `users.subscriptionStatus/trialEndsAt/subscriptionExpiresAt` |
| `/api/whatsapp/config` | GET | Clerk | Embed IDs | → `{appId,configId}` or `503 NOT_CONFIGURED` | None |
| `/api/whatsapp/connect` | POST | Clerk IP10/min user5/min | Exchange code | `{authorizationCode}` | `exchangeAuthCode` → upsert `whatsapp_connections` |
| `/api/whatsapp/disconnect` | POST | Clerk | Unlink | — | Delete `whatsapp_connections` |
| `/api/whatsapp/webhook` | GET/POST | `META_WEBHOOK_VERIFY_TOKEN` + HMAC `x-hub-signature-256` + `verifyMetaSignature` | WA ingest | `GET ?hub.challenge / POST entry.changes[].value.messages[]` | Creates tenant-scoped `` `${userId}_wa_<phone>` `` convo (filtered by `id`+`userId`) + `messages customer` |
| `/api/webhooks/clerk` | POST | Svix HMAC `CLERK_WEBHOOK_SECRET` | User sync | `user.created/updated/deleted` | Insert/update/delete `users` |
| `/api/seed-mawese` | POST | `SEED_SECRET=cchat-seed-2026` | Demo seed | — | `ensureDemoSeeded` |

Rate limits via `lib/rate-limit.ts:106-126` (`RL_CHAT`, `RL_INBOX_SEND`, `RL_ONBOARDING`, etc). All `app/api` need CORS preflight (`proxy.ts:45-59`).

---

## 17. Server vs Client

| Operation | Server | Client | Reason |
|---|---|---|---|
| `auth()` Clerk verify, DB writes, AI calls, webhook HMAC, Pesapal secret | ✅ `app/api/*`, `app/(dashboard)/dashboard/page.tsx:117` (force-dynamic) | ❌ | Secrets, isolation, validation |
| Onboarding wizard, product/services CRUD, inbox list/detail state, chat tabs, logo crop UI, theme toggle | ❌ | ✅ `app/onboarding/page.tsx`, `products/page.tsx:32`, `inbox/page.tsx:28`, `agent/page.tsx:54`, `settings/page.tsx:61`, `logo-crop-dialog.tsx:12` | Interactivity, optimistic updates |
| `ThemeProvider` anti-flash inline script | Head (`app/layout.tsx:59`) | ✅ `components/theme-provider.tsx:15-18` localStorage `cchat-theme`, `matchMedia` | Persist + system sync |
| Rate limit re-check | ✅ `lib/rate-limit.ts` in-memory (not edge) | — | Requires shared memory; resets on deploy |
| WhatsApp Graph API calls | ✅ `lib/whatsapp.ts` server-only (uses `META_APP_SECRET`) | ❌ | Tokens never `NEXT_PUBLIC` |
| DeepSeek | ✅ `lib/ai-service.ts` server-only (`DEEPSEEK_API_KEY`) | ❌ | Key never leaves server |
| `next/font` Bricolage etc | ✅ `app/layout.tsx:7-23` | — | SSR optimization |

`proxy.ts` (Next 16 `proxy` not `middleware`) runs at edge before both; `app/(dashboard)/layout.tsx:19` does server auth gate.

---

## 18. Security

- **Auth:** Clerk session JWT, `proxy.ts:72 auth()`, `await auth().protect` for non-public routes; `app/api/*` return `401 {error}` not redirect for API.
- **Authorization / isolation:** All DB queries add `where userId = userRow.id` after `ensureUserRow(clerkId)` (`workspace.ts:141`, `dashboard/page.tsx:160-178`).
- **Validation:** `settings` logo/avatar regex `^data:image\/(png|jpeg|webp);base64,...` + 800k (`app/api/settings/route.ts:99-110`); `product-image.ts:9-17` 4 MB; `chat` trims to 20 msgs ×2000 chars (`app/api/chat/route.ts:41-44`); `onboarding` validates answers via `ONB_STEPS`.
- **Secrets:** `DEEPSEEK_API_KEY`, `CLERK_SECRET_KEY`, `META_*`, `PESAPAL_*` server-only. `ThemeScript` inline anti-flash has no secrets. `.env.local` gitignored except `!.env.example` (` .gitignore:35`).
- **Webhook verify:** Clerk Svix `whsec_` decode + 5 min window (`app/api/webhooks/clerk/route.ts:37-50` fail-closed in prod `:14-15`); Meta `verifyMetaSignature` `createHmac sha256 timingSafeEqual` (`lib/whatsapp.ts:156-165`).
- **Rate & CORS:** `proxy.ts:26-59` preflight mirrors origin, `lib/rate-limit.ts:21-28` `getClientIp` uses only trusted `req.ip` (ignores `X-Forwarded-For` spoof).
- **Exposure:** No API key or `DATABASE_URL` is logged; `seed-real.js:2` uses `DIRECT_URL` locally only.

---

## 19. Environment Variables (names only)

| Name | Purpose | Required | Where |
|---|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key | Yes prod | `app/layout.tsx:31`, `proxy.ts` |
| `CLERK_SECRET_KEY` | Clerk server verify | Yes (503 if missing in `proxy.ts:61`) | `proxy.ts:61` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | No (default) | `.env.example:4` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | No | `:5` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/dashboard` | No | `:6` `app/layout.tsx:62` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/dashboard` | No | `:7` |
| `DATABASE_URL` | Pool port 6543 `?pgbouncer=true` | Yes | `lib/db/index.ts:10`, `seed` |
| `DIRECT_URL` | Direct 5432 for migrations | Yes | `drizzle.config.ts:14` |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` Svix | No dev (bypass `:18`), yes prod | `app/api/webhooks/clerk/route.ts:10` |
| `DEEPSEEK_API_KEY` | `sk-...` DeepSeek | Optional (503 if missing) | `lib/ai-config.ts:7` |
| `PESAPAL_CONSUMER_KEY` | Pesapal auth | No (future) | `lib/pesapal-config.ts:21` |
| `PESAPAL_CONSUMER_SECRET` | Pesapal secret | No | `:22` |
| `PESAPAL_ENVIRONMENT` | `sandbox\|live` | No (default sandbox) | `:23` |
| `PESAPAL_CALLBACK_URL` | Public callback | No | `:24` |
| `META_APP_ID` | WA embed app | No (503 if missing) | `lib/whatsapp.ts:7` |
| `META_APP_SECRET` | WA OAuth | No | `:8` |
| `META_CONFIG_ID` | WA config | No | `:9` |
| `META_WEBHOOK_VERIFY_TOKEN` | `hub.verify_token` | No | `:10`, `app/api/whatsapp/webhook/route.ts:23` |
| `SEED_SECRET` | Demo seed guard | No (default `cchat-seed-2026`) | `app/api/seed-mawese/route.ts:16` |

Never commit real values; use `.env.local` (gitignored) and Vercel env dashboard.

---

## 20. Main User Flows

**New User**

```
Sign up (Clerk) → ensureUserRow → users {plan free, inactive} → redirect /onboarding
→ Steps 1-8 + dyn products/services → POST /api/onboarding → onboarded true
→ /plan-selection (PLANS: trial Free 3d / monthly 15k / yearly 144k) :9-66
→ Start Free Trial → POST /api/billing start_trial → trialing 3d
→ /dashboard (checklist 4: Q answered, shop name, products, WA) → Checklist done 4/4 → progress 100%
```

**Returning User**

```
Sign in → auth() → ensureUserRow → fetch /api/billing → if trialing/active → /dashboard → ThemeProvider hydrates → DashboardShell loads /api/settings + polls /api/inbox 45s
```

**Expired Trial**

```
Sign in → /api/billing status expired (trialEndsAt < now) → DashboardShell checkAccess → router.push("/plan-selection") (allowlisted)
→ Choose plan → subscribe mock → status active → /dashboard
```

**Customer Message (Connected)**

```
WhatsApp → Graph webhook POST /api/whatsapp/webhook (HMAC verifyMetaSignature) → lookup whatsapp_connections by phoneNumberId → upsert tenant-scoped conversations id=`${userId}_wa_<phone>` (lookup/update filtered by id+userId) status ai → insert messages with scoped conversationId → dashboard-shell poll shows toast “New message from X” (45s) → Inbox unreadCount +1 → Inbox open → AI drafts? (manual send via /api/chat)
```

**Product Purchase (Owner logs)**

```
Inbox open → “Did they buy?” → salebar pick product → qty step → POST /api/inbox/outcome {productId,qty} → sales row + products.stock-- + sold++ + conversations.outcome sold → Dashboard revenue30 recalculates → low-stock toast if 0/low
```

---

## 21. Error Handling

| Area | Current handling |
|---|---|
| Auth | `proxy.ts:95-118` catches `kid mismatch` → clear `__session` redirect `/sign-in`; `app/(dashboard)/layout.tsx:19` redirect if `!userId`; API returns `401 JSON` for `/api` |
| DB | `dashboard/page.tsx:122-248` try/catch logs `DB error on dashboard`, returns empty aggregates not crash; `ensureProductImageColumn` try/catch; `ensureDemoSeeded` catch logs but does not block |
| AI | `app/api/chat/route.ts:48-57` maps `DEEPSEEK_NOT_CONFIGURED → 503 {AI not configured}`, else `500`; client shows “Add DEEPSEEK_API_KEY” in `agent/page.tsx:155-161` |
| API validate | `settings/logo 400 INVALID_LOGO`, `chat 400 messages required`, `whatsapp/connect 400 NO_WABA/NO_PHONE 502`, `webhook 403 invalid signature` |
| Missing data | Onboarding `data[1] \|\| bizSettings.name` fallback “Set up your business”; dashboard shows “No goods yet” / “Everything is healthy” (`:433-438`); Inbox empty card with CTA (`inbox/page.tsx:303-319`) |
| Expired trial | `dashboard-shell.tsx:106 isBlocked` + `app/(dashboard)/layout.tsx:19` redirect to `/plan-selection`; demo owner bypass |
| Payment fail | No real payment → no fail path; `settings/page.tsx:411-494` shows `expired/canceled/inactive` states as text |
| WhatsApp errs | `settings/page.tsx:202-249` surfaces `waError` + Retry, `inote fail` with `Connect WhatsApp in Settings` link; `connect` 503 `NOT_CONFIGURED` if env missing (`app/api/whatsapp/config/route.ts`); `disconnect` confirm dialog |
| Rate limit | `lib/rate-limit.ts:37-82` fixed-window 5000 keys, eviction, returns `429` with `rateLimitHeaders` in `proxy.ts:26-44` |

---

## 22. Known Problems

- **Out-of-stock behavior** was single-select `both|suggest|notify` but UI copy still says “AI will offer alternatives or notify list” — server respects value but agent prompt not yet branching on it.
- **Pesapal trailing comma** not relevant — payment not wired; subscription is mock `status active` without charge.
- **Inbox status enum** mixes `active/ai/waiting/closed` (`lib/db/schema.ts:33` default `active` vs `demo.ts` `ai|waiting|closed`) — queries use `status !== closed` to cope.
- **Rate limit** in-memory → resets on redeploy, not shared across lambdas.
- **Volume chart** IDs `cchatVolGrad` static → duplicate IDs if multiple charts on same page (only one used).
- **Logo base64** in `settings.logo text` 800k cap can be hit by uncropped 2 MB uploads — crop mitigates (now 512-1024 square ≈ 150-300k).
- **Dark divide** previously missed `divide-[#F1F1EF]` and `bg-[#E9E9E7]` — fixed via `app/globals.css:1525-1545`.
- **Chat time** on light bubble was `rgba(233,255,237,.62)` invisible on light bubble in dark — fixed to `rgba(237,237,237,.55)` for both dark bubbles.

---

## 23. Future Work

### CURRENTLY WORKING
- Auth + onboarding + catalog + policies + AI config + settings/logo/avatar + dashboard analytics + inbox + test agent + trial/sub mock + WA embed + webhook + rate-limit + dark/light theme + black grid + logo crop + premium crowns + LIVE chip.

### PARTIALLY IMPLEMENTED
- **WhatsApp:** connect + ingest + send work, but status enum only `connected`, no `connecting|error|pending`; phone fetch assumes single number per WABA; no media/template support.
- **Subscription:** `active` is mocked without payment verification; `billing/page.tsx:77-96` fakes expiry locally.
- **Stock alerts:** global toasts poll `workspace` 45s (`dashboard-shell.tsx:184-221`), but not web-push.
- **AI notConfigured** fallback uses `agentBrain` only for owner mode; test/assistant require DeepSeek.

### NOT YET IMPLEMENTED
- **Pesapal** transaction → callback → verify → grant; IPN handler; yearly/monthly price sync (currently `settings/page.tsx:425` still shows `115,200/12,000` vs `144,000/15,000` in billing—needs unify).
- **Multi-shop** / team roles (only single `userId` scope).
- **Customer-initiated media**, **read receipts**, **typing indicators** on WA.
- **Search** full-text on products (`products/page.tsx:60` is client filter only).

### FUTURE
- **Pesapal live** + receipt PDFs, proration, cancel flow.
- **WA Business verification** + multiple numbers + template catalog.
- **Analytics:** revenue per product, handoff rate, avg reply time (scaffold `ReplyLine` exists but unused).
- **PWA / offline** inbox queue.
- **Image CDN** (replace base64 with object storage for logos/product photos).

---

*End of report — inspect `app/**`, `components/**`, `lib/**`, `proxy.ts`, `app/globals.css` for primary evidence. No secrets disclosed.*

