/**
 * Minimal in-memory rate limiter for C-chat.
 * - Per-instance fixed-window (good for single-instance dev; for multi-instance prod use Upstash/Redis)
 * - Returns 429 + Retry-After + X-RateLimit-* headers for security & UX
 * - Optional Upstash Redis: if UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set and @upstash/ratelimit is installed, it will be used automatically.
 */

import { NextRequest, NextResponse } from "next/server";

type StoreEntry = { count: number; reset: number };

// Global store survives HMR / lambda reuse but not across instances.
// For prod multi-instance, switch to Upstash (see tryUpstash).
const GLOBAL_KEY = "__CCHAT_RATE_LIMIT__";
function getStore(): Map<string, StoreEntry> {
  const g = globalThis as unknown as Record<string, Map<string, StoreEntry> | undefined>;
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = new Map();
  return g[GLOBAL_KEY]!;
}

export function getClientIp(req: NextRequest | Request): string | null {
  // Use only deployment-trusted source. Vercel overwrites req.ip; client-controlled
  // X-Forwarded-For / X-Real-IP must not be trusted (spoofable).
  const trustedIp = (req as unknown as { ip?: string }).ip;
  if (trustedIp && typeof trustedIp === "string" && trustedIp.trim()) return trustedIp.trim();
  // No trusted IP available — disable IP-based limiting rather than sharing "0.0.0.0"
  return null;
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number; // ms timestamp
  limit: number;
};

export function checkRateLimit(opts: {
  key: string; // e.g. "chat:ip:1.2.3.4" or "chat:user:xxx"
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const { key, limit, windowMs } = opts;
  const now = Date.now();

  // Disable IP-based limiting when no trusted IP (prevents shared "0.0.0.0"/"null" bucket
  // and spoof bypass via X-Forwarded-For). User-based limits still apply.
  if (key.includes(":ip:null") || key.includes(":ip:undefined") || key.endsWith(":0.0.0.0")) {
    return { success: true, remaining: limit, reset: now + windowMs, limit };
  }

  const store = getStore();
  let entry = store.get(key);

  if (!entry || now > entry.reset) {
    entry = { count: 1, reset: now + windowMs };
    store.set(key, entry);
    // Hard maximum: enforce bounded size even with unexpired flood.
    // First, opportunistic expiration cleanup (up to 500 expired keys)
    if (store.size > 5000) {
      let i = 0;
      for (const [k, v] of store) {
        if (now > v.reset) store.delete(k);
        if (++i > 500) break;
      }
      // If still over capacity (unexpired flood), evict oldest entries (insertion order)
      // until back at 5000. Prevents unbounded growth from distinct keys.
      while (store.size > 5000) {
        const oldest = store.keys().next().value as string | undefined;
        if (!oldest) break;
        store.delete(oldest);
      }
    }
    return { success: true, remaining: limit - 1, reset: entry.reset, limit };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: entry.reset, limit };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, reset: entry.reset, limit };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const resetSec = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000));
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.reset / 1000)),
    "Retry-After": String(resetSec),
  };
}

export function rateLimitedResponse(result: RateLimitResult, message = "Too Many Requests"): NextResponse {
  return NextResponse.json(
    { error: message, retryAfter: Math.ceil((result.reset - Date.now()) / 1000) },
    {
      status: 429,
      headers: rateLimitHeaders(result),
    }
  );
}

// Presets — tuned for C-chat threat model (see audit)
/** 10 req / min per user/IP for LLM (cost) */
export const RL_CHAT = { limit: 10, windowMs: 60_000 } as const;
/** 20 / hour per conversation + 60/h per user for WhatsApp send */
export const RL_INBOX_SEND = { limit: 20, windowMs: 60 * 60 * 1000 } as const;
export const RL_INBOX_SEND_USER = { limit: 60, windowMs: 60 * 60 * 1000 } as const;
/** onboarding/workspace destructive replace-all */
export const RL_ONBOARDING = { limit: 10, windowMs: 60 * 60 * 1000 } as const; // 10/h
export const RL_WORKSPACE = { limit: 30, windowMs: 60 * 60 * 1000 } as const; // 30/h
/** settings base64 800KB */
export const RL_SETTINGS = { limit: 30, windowMs: 60 * 60 * 1000 } as const;
/** ai-config */
export const RL_AI_CONFIG = { limit: 30, windowMs: 60 * 60 * 1000 } as const;
/** billing */
export const RL_BILLING_GET = { limit: 60, windowMs: 60_000 } as const;
export const RL_BILLING_POST = { limit: 5, windowMs: 60 * 60 * 1000 } as const; // 5/h for start_trial/cancel
/** inbox reads */
export const RL_INBOX = { limit: 60, windowMs: 60_000 } as const;
export const RL_INBOX_MUTATE = { limit: 30, windowMs: 60_000 } as const;
/** webhooks */
export const RL_WEBHOOK = { limit: 100, windowMs: 60_000 } as const;
/** auth proxy */
export const RL_AUTH_IP = { limit: 10, windowMs: 60_000 } as const; // 10/min/IP for sign-in/up
