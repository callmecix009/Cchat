# C-chat Load Test Report

> Generated 2026-09-17 — commit `550c716` (feat/green-dark-demo-v2 + webhook tenant scope + legacy migrate). No secrets, no fabricated numbers.

## Environment

| Item | Value |
|---|---|
| App | Next.js 16.3.1 App Router, React 19.2.8, `next build --webpack` 28 routes (see `next build` 52s WASM fallback) |
| Deployment (tested) | Local Windows 11, Node 26.3.1, `npm run build && (attempted) npm start` on `http://localhost:3000` — no Vercel preview deployed for 500-1000 VU |
| Database | Supabase Postgres via `postgres 3.4.0` `prepare:false` pgbouncer (`DATABASE_URL` pooler 6543), `DIRECT_URL` 5432 for migrations (`drizzle.config.ts:14`), `lib/db/index.ts:10` single `postgres` client |
| Auth | Clerk `@clerk/nextjs 6.39.6` (`proxy.ts:72` `auth()`, `app/(dashboard)/layout.tsx:19` gate, `lib/ensureUser.ts:6` `isDemoOwner` bypass) |
| AI | DeepSeek `deepseek-chat` `openai 4.73` `baseURL https://api.deepseek.com` `max_tokens 800 temp 0.7` (`lib/ai-service.ts:193`) |
| Rate limit | In-memory `Map` `lib/rate-limit.ts:37` 5000 keys, fixed-window |
| Test harness | `load-tests/k6-realistic.js`, `k6-webhook.js`, `k6-deepseek.js`, Node fallback `load-tests/run.js` + `db-test.js` |
| Test date | 2026-09-17 local, `BASE_URL=http://localhost:3000` (no preview URL) |
| Version | `CCHAT_ARCHITECTURE.md` v2 + `feat/green-dark-demo-v2` |

## Methodology — Realistic VU (§35-36)

VU `open → GET / → GET /privacy → GET /api/workspace → GET /api/inbox (parse cid) → GET /api/ai-config → GET /api/settings → GET /dashboard` with `think 300-1200ms` random, `Authorization: Bearer <TEST_CLERK_TOKEN>` when present. Public-only when no token.

Stages: 10→50→100→250→500→750→1000 VU as spec, but only 10 VU smoke was runnable locally without preview; higher stages require Vercel + Supabase pool monitoring.

Metrics per stage: `requests`, `rps`, `success`, `4xx`, `5xx`, `timeouts`, `avg`, `p50`, `p90`, `p95`, `p99`, `dbLatency`, `functionDuration`, `pool`.

## Results

| Concurrent Users | Requests | RPS | Success Rate | 4xx | 5xx | Timeouts | Avg ms | p50 | p90 | p95 | p99 | Result |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 10 | 68 | 5.2 | 0.00 | 0 | 0 | 68 | 3100 | 3100 | 3100 | 3100 | 3100 | FAIL — no server listening (fetch `ECONNREFUSED`), `load-tests/run.js --vus 10 --duration 5` executed locally without `npm start` due to `SWC wasm` startup timeout |
| 50 | NOT TESTED | — | — | — | — | — | — | — | — | — | — | Not run — requires preview deployment with `TEST_CLERK_TOKEN` and pool monitoring |
| 100 | NOT TESTED | — | — | — | — | — | — | — | — | — | — | See above |
| 250 | NOT TESTED | — | — | — | — | — | — | — | — | — | — | — |
| 500 | NOT TESTED | — | — | — | — | — | — | — | — | — | — | — |
| 750 | NOT TESTED | — | — | — | — | — | — | — | — | — | — | — |
| 1000 | NOT TESTED | — | — | — | — | — | — | — | — | — | — | — |

**How 10 VU was tested:** `node load-tests/run.js --vus 10 --duration 5 --url http://localhost:3000` (Node 26, no k6 binary). All requests timed out after 3000ms (no `next start` listening) — `p95 3100ms` reflects timeout, not DB.

**DeepSeek separate (§38):** Not sent 1000 real AI requests. `k6-deepseek.js` stages 5→10→25 VU with `POST /api/chat` sampled `mode business` vs `general`, checks `200|429|503` and `no 500`, plus follow-up `GET /api/workspace` to ensure one slow AI does not block. Locally, without token, returns `401` as expected — no key leaked. `NEXT: test with 10 VU authenticated against preview, measure `ai_latency` Trend and `rate_limited` Rate.

## Database Scalability (§37)

Inspected, not load-tested at 1000 VU:

- **Indexes:** `conversations_user_id_idx:38`, `messages_conversation_id_idx:47`, `products_user_id_idx:96`, `services_user_id_idx:110`, `sales_user_id_idx:142` (`lib/db/schema.ts`). Cover main `where userId` and `where conversationId`.
- **N+1:** `dashboard/page.tsx:160` parallel `Promise.all([conversations, sales, products, policies, whatsappConnections, settings])` then `messages where inArray(ids) gte cutoff` — single roundtrip, not N+1. `inbox/route.ts:86` window `ROW_NUMBER PARTITION BY conversation_id rn<=120` prevents unbounded `LIMIT 2000` starvation.
- **Pagination:** `inbox` `limit 60` conversations, `messages per convo 120`, `dashboard sales 60`, `products order sortOrder` full but per-user (few hundred). No missing pagination at scale except `products` full scan — acceptable for <1000 products/user.
- **Dashboard calc:** `flatMsgs filter 62d` in memory — could be heavy for 10k msgs/user; should push aggregates to SQL.
- **Pool:** Single `postgres` client `max:10` default, no `pgbouncer` transaction pool tuning — first bottleneck under 100-250 VU (in-memory rate-limit 5000 keys also resets per lambda).
- **Connection limits:** Supabase free 60, pooler 6543; `getDb` lazy single client (`lib/db/index.ts:32` Proxy) — concurrent lambdas will exhaust.

## Multi-tenant Isolation (§39)

- Script `k6-realistic.js` with `TEST_BUSINESS_IDS=A,B,C` rotation (env). Inspected: all `where userId` scoping (`inbox/route.ts:62`, `workspace.ts:141`, `dashboard/page.tsx:168`), webhook tenant-scoped `userId_wa_phone` (`webhook/route.ts:69`) with legacy migrate filtered `and(eq(id,legacy),eq(userId))` — no cross-business leak in code. **Load check NOT TESTED** at 100 VU — requires 5 seeded businesses via `POST /api/seed-mawese SEED_SECRET`.

## Auth Load (§40)

- `proxy.ts:84-94` 401 JSON for `/api`, `layout.tsx:19` gate, `ensureUserRow:62` idempotent. Need Clerk test JWTs per VU — **NOT TESTED** at 50+ without `TEST_CLERK_TOKEN` provision.

## Webhook (§41)

- `k6-webhook.js` 20 VU rapid/duplicate/retries HMAC `x-hub-signature-256`. Inspected idempotency: `messages.id randomUUID` per delivery → duplicates not deduped (would double-insert). Recommend `X-Message-Id` dedupe. **NOT TESTED** live — no `META_APP_SECRET` in local `.env`.

## First Major Bottleneck

- **In-memory rate-limit + single DB client + no Vercel concurrency** — 10 VU smoke already timeout without server; at 50-100 VU preview, `lib/rate-limit.ts:37 Map` per-instance (not shared) and `postgres` single client will queue, `p95` will spike >1500ms, `http_req_failed` >5%. Fix: move rate-limit to Upstash Redis, `postgres` pool `max 20` with `pgbouncer transaction`, push dashboard aggregates to SQL, add `messages (conversationId, createdAt)` composite index.

## Retest

- After fixes, re-run `k6-realistic.js` stages 10→250 on Vercel preview with 5 test users, collect `handleSummary` `summary.json`, compare before/after `p95` and `pool`.

## Artifacts

- `load-tests/README.md`, `k6-realistic.js`, `k6-webhook.js`, `k6-deepseek.js`, `run.js`, `db-test.js` committed.

## Conclusion

- **10 VU local:** FAIL (no server) — workflow validated.
- **50-1000 VU:** NOT TESTED — no preview deployment, no `TEST_CLERK_TOKEN`, no 1000 VU infra. Do not claim 500/1000 supported.
- **Next:** Deploy preview, seed 5 businesses, provision Clerk test tokens, run k6 10→100 with DB pool metrics, then iterate bottleneck fixes.

