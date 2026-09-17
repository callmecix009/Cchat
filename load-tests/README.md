# C-chat Load Tests

Realistic concurrent traffic for Next.js 16 + Supabase Postgres + Clerk + DeepSeek.

## Deployment architecture (tested)
- **App:** Next.js 16 App Router (`next build --webpack`), `proxy.ts` Clerk middleware, `lib/rate-limit.ts` in-memory fixed-window, `lib/db/index.ts` `postgres` `prepare:false` pgbouncer (`DATABASE_URL` pooler 6543)
- **DB:** Supabase Postgres via Drizzle, indexes `conversations_user_id_idx`, `messages_conversation_id_idx`, `products_user_id_idx`, `services_user_id_idx`, `sales_user_id_idx`
- **Auth:** Clerk `@clerk/nextjs 6.39.6` (`proxy.ts` `clerkMiddleware`, `app/(dashboard)/layout.tsx` gate)
- **AI:** DeepSeek `deepseek-chat` via `openai 4.73` `baseURL https://api.deepseek.com` (`lib/ai-service.ts:193` `max_tokens 800 temp 0.7`)
- **Local:** `npm run dev --webpack` or `npm run build && npm start`, `k6` or `autocannon` from this dir. Set `BASE_URL` and `TEST_CLERK_TOKEN` for authenticated flows.

## Prerequisites
- Install k6: https://k6.io/docs/getting-started/installation/ or `npm i -g artillery` or `npm i -D autocannon`
- For authenticated tests, create test businesses via `POST /api/seed-mawese` with `SEED_SECRET=cchat-seed-2026` or use Clerk test users, export `TEST_CLERK_TOKEN` (Clerk `__session` JWT) and `TEST_BUSINESS_IDS=A,B,C`.

## Quick start
```bash
# smoke 10 VU (public only, no auth needed)
npx k6 run k6-realistic.js --vus 10 --duration 30s
# or Node fallback (no k6 binary)
node run.js --vus 50 --duration 20s --url http://localhost:3000
# webhook idempotency
npx k6 run k6-webhook.js
# DeepSeek isolated (controlled)
npx k6 run k6-deepseek.js --vus 10
```

## Scenarios
- `k6-realistic.js` — realistic VU: open `/`, `/privacy`, `/sitemap.xml`, `GET /api/workspace`, `GET /api/inbox`, `GET /dashboard`, `GET /api/ai-config`, `GET /api/settings` with think 1-3s, variation.
- `k6-webhook.js` — `POST /api/whatsapp/webhook` HMAC, rapid/duplicate/retries.
- `k6-deepseek.js` — `POST /api/chat` isolated, measures AI latency, rate-limit, timeout.
- `multi-tenant` — same realistic script with `TEST_BUSINESS_IDS` rotation, asserts isolation.

## Metrics collected
- `http_reqs`, `http_req_failed`, `http_req_duration p50/p90/p95/p99`, `checks`, `iterations`, `vus`, `data_received`, plus custom `db_latency` (from `x-db-duration` header if added), `ai_latency`.

## Notes
- Authenticated routes require `Authorization: Bearer <Clerk JWT>` — do not hardcode secrets, use env.
- Do not run 1000 real AI requests; deepseek test is sampled.
- For 500-1000 VU, run against Vercel preview with Supabase pool 10-20, monitor `pg_stat_activity`.
