# C-chat — Session Handoff (for next AI session)

> Read this first. Repo has open PR `feat/notion-landing` → `main`. Last verified: 2026-09-14 (build 27 routes ok).

## 1. Project snapshot
- **What:** C-chat — AI WhatsApp agent for Tanzanian small business (Swahili/English). Next.js 16 App Router (webpack), React 19.2.8, Tailwind 4, Clerk auth, Supabase Postgres + Drizzle, DeepSeek (OpenAI-compatible), Pesapal (stub), Meta WhatsApp (Embedded Signup stub).
- **Prod:** `https://cchat.site` (Vercel, auto-deploys `main`). No `vercel.json`.
- **Repo:** `https://github.com/callmecix009/Cchat.git`, `origin/main` = `0f8c7a1`, PR branch `origin/feat/notion-landing` = `19d23cb` (5 commits ahead, PR #6 https://github.com/callmecix009/Cchat/pull/6).
- **Local:** `C:\Users\ABLEGOD\OneDrive\Desktop\cchat-app`, branch `feat/notion-landing`, `git status` clean, working tree on `19d23cb`.

## 2. Where we left off (chronological, newest last)
1. `66447ce` Clerk deprecated props + React hook #310 fix.
2. `15bc226` Installed `ui-ux-pro-max-cli@2.15` (`uipro init --ai opencode`), created `design-system/c-chat/MASTER.md` (B2B Service + AI/Chatbot hybrid).
3. `934f738` Removed `Account & Security` (`UserProfile`) from `app/(dashboard)/settings/page.tsx` — Clerk `UserButton` avatar menu already covers it.
4. `c9e8d26` Hero polish + tab logo = app logo + font consolidation (Bricolage via `next/font`).
5. `4842c2e` **AI Assistant = general chatbot** (`lib/ai-service.ts` `mode: "business"|"general"`; `/api/chat` accepts `mode`; agent page Assistant tab sends `mode:"general"`).
6. `9f642e0` + `daa0c50` Added `app/sitemap.ts` + `app/robots.ts`.
7. `86976a1` **Fixed "site could not be read"**: added `/sitemap`, `/robots`, `/icon`, `/apple-icon`, `/favicon.ico` to `proxy.ts isPublicRoute` + `xml|txt` to matcher exclusion; removed `/onboarding` from sitemap.
8. `ceed557` → `99ea0d5` Tab logo: trimmed `public/images/c-chat-logo.png` (1536×1024), transparent bg, tight padding, kept original lime/pine colours (user rejected greyscale).
9. `0f8c7a1` chore: session handoff + ignore `.opencode/` (skills reinstallable).
10. `2a634a7` **feat(landing): notion-inspired redesign with 6 images** — Notion audit (white #FFF / #FCFCF9, border #E9E9E7, centered hero 64px pile `public/images/landing/hero.webp` + 2 notion-pin floats, marquee trust, 3 stacked stories capture/find/automate, testimonial, shadows `0 8px 32px rgba(0,0,0,.06)`, reveal 16px 0.55s). Kept `app/page.tsx:1` FAQ/pricing structure as requested. Images webp via sharp 82 in `public/images/landing/*` (hero 47k, capture 26k, find 24k, desktop 30k, testimonial 106k, trust 40k); `.gitignore` now ignores `images2.0/` raw jfifs.
11. `2b53c38` **feat(app): notion light system** — propagated light tokens app-wide: `app/globals.css:3` `--line #E9E9E7 --background #FCFCF9 --foreground #111 --sh` flat, `btn` pri/dark `#111` flat, ghost `white/#E9E9E7`, `card` `12px` no shadow, `badge` neutral `#F7F7F5/#F1F1EF`, `components/dashboard-shell.tsx:328` light sidebar white + 56px blur header, `lib/brand.ts` `dark #111 surface #FCFCF9 border #E9E9E7`, sweep `#E4EDE5/#D2DCD1 → #E9E9E7` across billing/dashboard/ai/settings/onboarding/plan-selection/charts.
12. `fa3357d` **feat(app): redesign Dashboard, Inbox, Chatbot, Services — notion + intercom/crisp** — Services gap24 cards white 24px, Dashboard dark setup cards → white `ProgressRing #111`, Inbox neutral badges + single unread left border `2px #111` avatar 32px neutral, Agent `max-w 1120` phone #111 flat.
13. `ca22b1f` **feat(dashboard): reduce green inside app — black minimal dashboard** — charts `#149A5B → #111`, outcomeSlices `sold #111 waiting #9B9B9B`, delta neutral, shell WA dot #111, billing/settings green buttons → `#111` (landing green kept: hero `bg-[#149A5B]` + pricing free trial explicit green `app/page.tsx:645`).
14. `19d23cb` **fix(ui): cleanup onboarding + plan-selection + trial icon — light premium** — onboarding `app/onboarding/page.tsx:304` gradient `#071510→#0C2417` → `bg-[#FCFCF9]` white card border #E9E9E7, progress #111, buttons #111; plan-selection `app/plan-selection/page.tsx:185` gradient → same white + black primary CTA; trial icon `GoldCrown` (broken/amber) → `Icon name="clock"` (`components/icons.tsx:81`) in `dashboard-shell.tsx:368` sidebar, `billing/page.tsx:104` 52px badge, `settings/page.tsx:437` trial pill — premium gold kept for paid.

## 3. Key decisions / gotchas
- **Design system:** Landing is source of truth for Notion — `white #FFF` page, `bg-[#FCFCF9]` sections, `border #E9E9E7`, `shadow 0 8px 32px rgba(0,0,0,.06)`, `radius 16/12/8`, reveal `16px 0.55s cubic(.2,.7,.3,1)` `threshold 0.15` (`components/reveal.tsx:19`). App shell now matches: sidebar `white border #E9E9E7` (was `#0C2417`), header `h-14 bg-white/80 blur #E9E9E7`. Keep `.notion-frame/.notion-pin/.notion-nav/.marquee` in `app/globals.css:1201`.
- **Green policy:** Green `#149A5B` kept only for landing hero/pricing free trial tiny accents (`app/page.tsx:239` `bg-[#149A5B]`) and focus ring `rgba(20,154,91,.14)`. Inside app (`app/(dashboard)/**`) green replaced with `#111` black minimal — see `ca22b1f`. Do not reintroduce `bg-grn` inside dashboard.
- **Clerk:** Use `fallbackRedirectUrl` (NOT `afterSignInUrl`). `app/layout.tsx:58` has `signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/onboarding"`. Env uses `NEXT_PUBLIC_CLERK_SIGN_IN/UP_FALLBACK_REDIRECT_URL`.
- **Hook #310:** `components/dashboard-shell.tsx` hooks must stay above `if (!accessChecked && !settings)` early return. Do not reintroduce hooks after returns.
- **Rate limit:** `lib/rate-limit.ts` in-memory fixed-window, `getClientIp` trusted `req.ip` only, hard cap 5000 keys. Webhook `whsec_` base64-decoded.
- **Favicon:** Keep colours + transparent + tight. Regeneration scripts were temp files in `%LOCALAPPDATA%\Temp\opencode\gen_icons*.js` (not committed).
- **Sitemap:** 7 public URLs only: `/`, `/privacy`, `/terms`, `/acceptable-use`, `/sign-in`, `/sign-up`, `/plan-selection`. Private `/dashboard/*`, `/settings`, `/billing`, `/api/*`, `/onboarding` excluded + disallowed in robots. Submit `https://cchat.site/sitemap.xml` in GSC.
- **`.opencode/`:** gitignored. Reinstall `npm install -g ui-ux-pro-max-cli` then `uipro init --ai opencode`. Tokens live in `design-system/c-chat/MASTER.md` + `app/globals.css` + `lib/brand.ts`.
- **Build quirk:** `@next/swc-win32-x64-msvc.node is not a valid Win32 application` warnings are harmless (falls back to WASM). Build still succeeds (~27 routes). Use `npm run build -- --webpack` or `npx tsc --noEmit --skipLibCheck`.

## 4. SEO / Search Console status
- Live (after Vercel deploys `main`): `https://cchat.site/sitemap.xml` (7 URLs), `https://cchat.site/robots.txt` (`Sitemap:` present).
- GSC steps for user: verify property (Domain TXT preferred), Sitemaps → submit `sitemap.xml`, URL Inspection → Request Indexing for `/` + legal pages, monitor 3–10 days. `site:cchat.site` expected 4h–48h after request; branded `cchat` 1–4 weeks.
- Missing (not blocking indexing, do next after PR merge): `metadataBase`, `alternates.canonical`, `openGraph`, `twitter`, `robots index/follow`, `verification.google`, `viewport` export in `app/layout.tsx:24`; `robots:{index:false}` on `(dashboard)` layout; `app/opengraph-image.tsx` + `app/manifest.ts`; `www → non-www` redirect; convert remaining `hero-robot.jpg` usage already replaced by landing webp but keep fallback.

## 5. Env vars (Vercel Production + Preview, encrypted)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard`
- `DATABASE_URL` (Supabase pooler 6543 + `?pgbouncer=true`, `#` as `%23`), `DIRECT_URL` (5432), `CLERK_WEBHOOK_SECRET` (fail-closed in prod), `DEEPSEEK_API_KEY`, `PESAPAL_*`, `META_*` (empty until configured).
- `.env.local` is gitignored and contains live secrets — never commit. `git log -p -S sk_test` = 0 hits (clean).

## 6. How to run / verify
- `npm run dev` / `npm run build -- --webpack` (build log pattern: `✓ Compiled`, `27 static pages`, `ƒ Proxy`). Use `npx tsc --noEmit --skipLibCheck` for quick type check (Windows: `python` for skill search, not `python3`).
- Quick check: `git status`, `git log --oneline -8`, `git branch -a -vv` (PR branch `feat/notion-landing` = `19d23cb` ahead of `main` `0f8c7a1`).
- Skill search: `python .opencode/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system` (Windows: `python`).
- PR: https://github.com/callmecix009/Cchat/pull/6 — 5 commits, 25 files, 1075+ inserts. Merge via GitHub UI (Squash or Merge), then `git checkout main; git pull --ff-only; git branch -d feat/notion-landing; git push origin --delete feat/notion-landing` (optional cleanup). Vercel will auto-deploy `main` to `https://cchat.site`.

## 7. Open TODOs for next session (priority order)
1. **Merge PR #6** — user liked design, approved session switch. After merge, verify `https://cchat.site` renders new landing + light app (hard refresh, check onboarding white, plan-selection white, dashboard black minimal, inbox neutral, agent phone #111, services cards).
2. **Post-merge polish (optional, low priority):** `app/layout.tsx` SEO `metadataBase`/`openGraph`/`twitter`/`verification`/`viewport`; `(dashboard)` `robots noindex`; `app/manifest.ts`; convert any remaining `#E4EDE5` stray (now zero) — already swept.
3. **Deep redesigns if user wants more:** Chatbot streaming, Inbox right customer sidebar (Intercom/Crisp 3-col with `lib/demo.ts` contact meta), Dashboard analytics drill-down — currently light foundation done, deeper layout needs new data props (ask for reference before building).
4. Decide: delete `feat/ui-ux-pro-max` branch (currently identical to `main` at `0f8c7a1`) to leave single-`main` workflow.
5. GSC: verify + submit sitemap + request indexing (user-side).

## 8. Commands cheat-sheet
- `git checkout main; git pull --ff-only; git log --oneline -5`
- `git checkout feat/notion-landing; git log --oneline -5; git diff origin/main --stat`
- `npm run build -- --webpack > $env:LOCALAPPDATA\Temp\opencode\build.log 2>&1` (then `Get-Content ... -Tail 80`)
- `npx tsc --noEmit --skipLibCheck`
- `git push origin feat/notion-landing` (already pushed)
- `gh pr view 6 --web` (if `gh` installed) or open https://github.com/callmecix009/Cchat/pull/6

