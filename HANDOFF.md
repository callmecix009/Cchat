# C-chat — Session Handoff (for next AI session)

> Read this first. Repo is clean on `main`. Last verified: 2026-09-13.

## 1. Project snapshot
- **What:** C-chat — AI WhatsApp agent for Tanzanian small business (Swahili/English). Next.js 16 App Router, React 19.2.8, Tailwind 4, Clerk auth, Supabase Postgres + Drizzle, DeepSeek (OpenAI-compatible), Pesapal (stub), Meta WhatsApp (Embedded Signup stub).
- **Prod:** `https://cchat.site` (Vercel, auto-deploys `main`). No `vercel.json`.
- **Repo:** `https://github.com/callmecix009/Cchat.git`, branch `main` = `origin/main` = `99ea0d5`.
- **Local:** `C:\Users\ABLEGOD\OneDrive\Desktop\cchat-app`, branch `main`, `git status` clean (only this file + `.gitignore` change pending at time of writing).

## 2. Where we left off (chronological, newest last)
1. `66447ce` Clerk deprecated props + React hook #310 fix.
2. `15bc226` Installed `ui-ux-pro-max-cli@2.15` (`uipro init --ai opencode`), created `design-system/c-chat/MASTER.md` (B2B Service + AI/Chatbot hybrid).
3. `934f738` Removed `Account & Security` (`UserProfile`) from `app/(dashboard)/settings/page.tsx` — Clerk `UserButton` avatar menu already covers it.
4. `c9e8d26` Hero polish + tab logo = app logo + font consolidation (Bricolage via `next/font`, remove `@import`).
5. `4842c2e` **AI Assistant = general chatbot** (ask anything). `lib/ai-service.ts` has `mode: "business" | "general"`; `/api/chat` accepts `mode`; agent page Assistant tab sends `mode:"general"`. Test tab stays business-scoped.
6. `9f642e0` + `daa0c50` Added `app/sitemap.ts` + `app/robots.ts`.
7. `86976a1` **Fixed "site could not be read"**: added `/sitemap`, `/robots`, `/icon`, `/apple-icon`, `/favicon.ico` to `proxy.ts isPublicRoute` + `xml|txt` to matcher exclusion; removed `/onboarding` from sitemap (blocked by robots).
8. `ceed557` → `99ea0d5` Tab logo: trimmed `public/images/c-chat-logo.png` (1536×1024 rect), transparent bg, tight padding, **kept original lime/pine colours** (user rejected greyscale black). Files: `app/icon.png` (512), `app/apple-icon.png` (180), `app/favicon.ico` (32, ICO-wrapped PNG).
9. Cleanup (this session): deleted stale `fix/signin-load-rate-limit` (local + remote, was `b8f8050`, fully merged); `.gitignore` now ignores `.opencode/` (skills reinstallable); wrote this file.

## 3. Key decisions / gotchas
- **Clerk:** Use `fallbackRedirectUrl` (NOT `afterSignInUrl`/`afterSignUpUrl`, deprecated). `app/layout.tsx:58` has `signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/onboarding"`. Sign-in page `fallbackRedirectUrl="/dashboard"`, sign-up `"/onboarding"`. Env uses `NEXT_PUBLIC_CLERK_SIGN_IN/UP_FALLBACK_REDIRECT_URL`.
- **Hook #310:** `components/dashboard-shell.tsx` had `useState`/`useEffect` after early return — fixed by moving hooks above `if (!accessChecked && !settings)`. Do not reintroduce hooks after returns.
- **Rate limit:** `lib/rate-limit.ts` in-memory fixed-window, `getClientIp` returns trusted `req.ip` only (null if missing, IP bucket skipped). Hard cap 5000 keys with oldest-eviction. 429 + `Retry-After` + `X-RateLimit-*`. Webhook `whsec_` base64-decoded before HMAC.
- **Hero:** `app/page.tsx:193-245` — `min-h-[560px] md:640 lg:680`, padding `96/12, 110/14, 130/20`, image focal `55% 28% / 62% / 72%`, single overlay (not double), `next/font` only (no CSS `@import`). `py-20` on sections is correct 8dp — hero was the problem, not sections.
- **Favicon:** Keep colours + transparent + tight. Regeneration scripts were temp files in `%LOCALAPPDATA%\Temp\opencode\gen_icons*.js` (not committed). To regenerate: trim + `fit:contain` transparent + ICO header (6+16 bytes + PNG).
- **Sitemap:** 7 public URLs only: `/`, `/privacy`, `/terms`, `/acceptable-use`, `/sign-in`, `/sign-up`, `/plan-selection`. Private `/dashboard/*`, `/settings`, `/billing`, `/api/*`, `/onboarding` excluded + disallowed in robots. Submit `https://cchat.site/sitemap.xml` in GSC.
- **`.opencode/`:** gitignored. Reinstall skill with `npm install -g ui-ux-pro-max-cli` then `uipro init --ai opencode`. Design tokens live in `design-system/c-chat/MASTER.md` (committed) + `app/globals.css` + `lib/brand.ts`.
- **Build quirk:** `@next/swc-win32-x64-msvc.node is not a valid Win32 application` warnings are harmless (falls back to WASM). Build still succeeds (~25 routes).

## 4. SEO / Search Console status
- Live (after Vercel deploys `main`): `https://cchat.site/sitemap.xml` (7 URLs), `https://cchat.site/robots.txt` (`Sitemap:` present).
- GSC steps for user: verify property (Domain TXT preferred, or URL-prefix meta `verification.google` in `app/layout.tsx`), Sitemaps → submit `sitemap.xml`, URL Inspection → Request Indexing for `/` + legal pages, monitor Pages 3–10 days. `site:cchat.site` expected 4h–48h after request; branded `cchat` 1–4 weeks.
- Missing (not blocking indexing, do next): `metadataBase`, `alternates.canonical`, `openGraph`, `twitter`, `robots index/follow`, `verification.google`, `viewport` export in `app/layout.tsx:24`; `robots:{index:false}` on `(dashboard)` layout; `app/opengraph-image.tsx` + `app/manifest.ts`; `www → non-www` redirect; convert `hero-robot.jpg` to WebP + `next/image`.

## 5. Env vars (Vercel Production + Preview, encrypted)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard`
- `DATABASE_URL` (Supabase pooler 6543 + `?pgbouncer=true`, `#` as `%23`), `DIRECT_URL` (5432), `CLERK_WEBHOOK_SECRET` (fail-closed in prod), `DEEPSEEK_API_KEY`, `PESAPAL_*`, `META_*` (empty until configured).
- `.env.local` is gitignored and contains live secrets — never commit. `git log -p -S sk_test` = 0 hits (clean).

## 6. How to run / verify
- `npm run dev` / `npm run build` (use `--webpack` per `package.json`; build log pattern: `✓ Compiled`, `23-27 static pages`, `ƒ Proxy`).
- Quick check: `git status`, `git log --oneline -8`, `git branch -a -vv`.
- Skill search (needs Python 3): `python .opencode/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system` (Windows: `python`, not `python3`). If skill missing, reinstall (see §3).

## 7. Open TODOs for next session (priority order)
1. GSC: verify + submit sitemap + request indexing (user-side, cannot do from repo).
2. `app/layout.tsx` SEO polish: `metadataBase`, `canonical`, `openGraph`, `twitter`, `verification`, `viewport`; add `robots noindex` to `(dashboard)` + `onboarding`.
3. Dashboard trust polish: replace product `emoji` thumbs with Lucide/Phosphor, tokenize trial banner (`bg-amb-bg`), fix `border-3` typo, hamburger 44px target.
4. `app/page.tsx`: replace hand-rolled icons with `components/icons.tsx` or `lucide-react`; `rounded-[16px]` → `12px`, `hover:-translate-y-[3px]` → `-2px`; FAQ `maxHeight 220px` → auto/reflow.
5. Create `design-system/c-chat/pages/landing.md` + `dashboard.md` overrides.
6. Optional: `hero-robot.jpg` → WebP + `next/image fill priority`; `app/manifest.ts`; `opengraph-image.tsx`.
7. Decide: delete `feat/ui-ux-pro-max` branch (currently identical to `main` at `99ea0d5`) to leave single-`main` workflow.

## 8. Commands cheat-sheet
- `git checkout main; git pull --ff-only; git log --oneline -5`
- `npm run build > $env:LOCALAPPDATA\Temp\opencode\build.log 2>&1`
- `npm install -g ui-ux-pro-max-cli; uipro init --ai opencode`
- `git push origin main`
