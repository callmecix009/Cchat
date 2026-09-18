# C-chat — Session Handoff (for next AI session)

> Read this first. Repo has open work on `feat/green-dark-demo-v2` → `main`. Last verified: 2026-09-18 (build 28 routes ok, tsc clean). Operational mode: build (was plan, now build).

## 0. RESUME MARKER — "woke up" / "im back" = this topic
- If user says **"woke up"** or **"im back"**, they mean: continue **Mwongozo SEO + legal + pricing + icons + dark mode + fold button + i18n (Swahili/English)** thread. Current branch `feat/green-dark-demo-v2` @ `1778c81` (pushed, 8 commits ahead of `0c09f0f` baseline). Do NOT invent credentials.
- **Wake phrase:** "woke up" or "im back" → resume from HANDOFF.md, branch `feat/green-dark-demo-v2`, build verified.

## 1. Project snapshot
- **What:** C-chat — AI WhatsApp agent for Tanzanian small business (Swahili/English). Next.js 16 App Router (webpack), React 19.2.8, Tailwind 4, Clerk auth, Supabase Postgres + Drizzle, DeepSeek (OpenAI-compatible), Pesapal (stub), Meta WhatsApp (Embedded Signup stub).
- **Prod:** `https://cchat.site` (Vercel, auto-deploys `main`). No `vercel.json`.
- **Repo:** `https://github.com/callmecix009/Cchat.git`, `origin/main` = `0f8c7a1`, active `origin/feat/green-dark-demo-v2` = `1abca0c` (pushed). Other branch `origin/feat/notion-landing` = `19d23cb` (stale, 5 commits ahead of main but behind green-dark-demo-v2).
- **Local:** `C:\Users\ABLEGOD\OneDrive\Desktop\cchat-app`, branch `feat/green-dark-demo-v2`, working tree clean, `git status` clean.

## 2. Where we left off (chronological, newest last)
1. `0f8c7a1` chore: session handoff baseline (notion light, 27 routes)
2. `58f83de` **feat: react-icons full replace + brand icons, fix inbox unread count** — installed `react-icons@5.7.0`, `components/icons.tsx:1` now `fi/lu/fa6/si` MAP (grid→FiGrid, bot→LuBot etc, whatsapp→FaWhatsapp, visa etc), `components/dashboard-shell.tsx:25` ICONS deduped → `<Icon>`, landing/onboarding/ai/settings inline SVGs removed, brand chips in trust strip, `app/api/inbox/route.ts:100` added server-side `COUNT(*) where role='customer' and created_at > last_read_at` to fix bounded 120 preview undercount, `t s c` clean, `products.image` exists true (DB verified via pooler 6543/5432, drizzle-kit push applied)
3. `57abbba` **fix(a11y): onboarding remove-row aria-label** — `app/onboarding/page.tsx:313` `aria-label="Remove product"` and `:339` `Remove service`
4. `8f5e970` **feat(seo): Mwongozo Kamili public guide** — new `app/jinsi-ya-kufanya-biashara-mtandaoni-tanzania/page.tsx` (full Swahili 7 Sura, metadata canonical, openGraph, FAQ JSON-LD, Article JSON-LD), `proxy.ts:8` added public route, `app/sitemap.ts:13` added `.../jinsi...` priority 0.9 weekly, landing teaser `app/page.tsx:603` `id="mwongozo"` 6 cards href `#sura-1..6`, footer link, build 28 routes
5. `f4b1aac` **feat: rewrite Mwongozo docs, remove emoji, organize legal, fix Save20% icon, update pricing** — rewrote guide to professional SaaS docs (Overview/How it works/Step 1-3/Important/Need help), removed all decorative emoji (🔥 etc), added `id="sheria"` with 3 legal articles `id="terms"/"privacy"/"acceptable-use"` (condensed then expanded), made `app/privacy|terms|acceptable-use/page.tsx:1` redirect to `...#privacy` etc (central source), updated all footer nav `app/page.tsx:702` and `app/plan-selection/page.tsx:230` to `#privacy/#terms/#acceptable-use/#sheria` + `Mwongozo` link, fixed `Save 20%` `CrownIcon` → `Icon award` (`components/icons.tsx:52` `FiAward`), updated pricing `12,000→15,000` monthly, `115,200→144,000` yearly (15k*12*0.8), footnote `9,600→12,000`, `app/(dashboard)/billing/page.tsx:186` `15,000`/`144,000`, `components/dashboard-shell.tsx:350` `15,000`, `lib/db/schema.ts` messagesLimit 12000 NOT changed (not price)
6. `eadda59` **fix: restore sura anchors, expand Terms 8-16, clarify AI** — added `span id="sura-1"..sura-6` before each `section id="kuanza" etc` in guide (`app/jinsi...:216`), updated AI clause `hakiki kabla → fuatilia ... hakiki au sahihisha inapohitajika` (`app/jinsi...:474`), expanded Terms `8–16` to full provisions 8 Intellectual Property →16 Contact (`app/jinsi...:451`)
7. `5956084` **fix: Tabler crown for Save 20%** — replaced `Icon award` with exact SVG `M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4l4 -6` in `app/page.tsx:572` and `app/(dashboard)/billing/page.tsx:286` per user supplied code
8. `1abca0c` **feat: move fold toggle to top, light black-grid, dark unreadable** — moved `toggleNavCollapsed` from bottom `hidden md:flex p-2.5 justify-end` (`dashboard-shell.tsx:362`) to header `flex items-center px-2.5 pt-3` next to logo (`dashboard-shell.tsx:302`), with `md:flex-col` when collapsed; added light-mode black-grid `app/globals.css:97` for `.stat/.card/.svc/.polsec` etc `border 1.5px #111 shadow 0 2px 0 #111` (white-mode only, not landing, not dark); added dark overrides `text-[#2B2B2B] #E0E0E0` etc (`app/globals.css:1446`), fixed `dashboard-shell.tsx:350` pricing display; build 28/28 ok
9. `1778c81` **feat(i18n): add Swahili support with next-intl** — installed `next-intl`, created `messages/en.json` + `messages/sw.json` (500+ keys each), locale routing `app/[locale]/` with `layout.tsx`, `page.tsx`, `dashboard/page.tsx`, updated `proxy.ts` for locale prefix detection/redirects, added `i18n.ts`, `i18n-config.ts`, `components/i18n-provider.tsx`, updated `app/layout.tsx` Clerk redirects to `/en/...`, root `page.tsx` redirects to `/en`, build 28 routes + 2 locales

## 3. Key decisions / gotchas
- **Design system:** Notion light source: `white #FFF` page, `bg-[#FCFCF9]` sections, `border #E9E9E7`, `shadow 0 8px 32px rgba(0,0,0,.06)`, `radius 16/12/8`. App shell now light `white border #E9E9E7`. Keep `.notion-frame/.notion-pin/.notion-nav/.marquee` in `app/globals.css:1280`. Green `#149A5B` only for landing hero/free trial accents.
- **Icons:** `components/icons.tsx:52` is source of truth — `fi` Feather + `lu` Lucide + `fa6/si` brands, `award: FiAward`, `crown` tabler SVG used directly for Save 20% (not via Icon). Do not reintroduce `bg-grn` inside dashboard.
- **Pricing single source:** 15,000/mo, 144,000/year (20% off 180,000). Check `app/page.tsx:14` FAQ, `app/page.tsx:158` hero, `app/page.tsx:562` premium, `app/page.tsx:577` extra, `app/plan-selection/page.tsx:33,51`, `app/(dashboard)/billing/page.tsx:186,198,205`, `app/jinsi...:415` CTA. Messages limit 12,000 stays (not price).
- **Legal:** Central under `Mwongozo wa Biashara Mtandao` `app/jinsi...#sheria` with `#terms/#privacy/#acceptable-use`. Standalone `app/privacy|terms|acceptable-use/page.tsx` now redirect. Footer links point to `...#privacy` etc. Do not recreate separate complicated legal pages.
- **Onboarding black grid:** `app/onboarding/page.tsx:288` `border-[1.5px] border-[#111] shadow-[0_2px_0_#111]` — now applied to app cards via `app/globals.css` light overrides only. Dark mode uses `#2A2A2A` borders.
- **Dark mode:** Scoped to `.dashboard-theme.dark` / `html.dark` / `@media (prefers-color-scheme: dark)`. Added overrides for `text-[#2B2B2B]`, `text-[#5D7064]` etc. Test with `useTheme` `light|dark|system` in `components/theme-provider.tsx:111`. Landing stays light.
- **Foldable nav:** `components/dashboard-shell.tsx:302` header now contains toggle, bottom toggle removed. `navCollapsed` persisted via `cchat-nav-collapsed` localStorage. Sidebar `md:w-[64px]` icons-only.
- **DB:** `DATABASE_URL` pooler 6543 `?pgbouncer=true`, `DIRECT_URL` pooler 5432, both `postgres.udgrgccsffjdkpbwrfvg@aws-1-eu-west-1.pooler.supabase.com`, password `qxFH3jy2NNDLurAh` (no encoding needed). `drizzle-kit push` applied, `products.image` exists true. Vercel env must match if password reset.
- **Build quirk:** `@next/swc-win32-x64-msvc.node is not a valid Win32 application` warnings harmless, WASM fallback. Build 28 routes, `ƒ Proxy`.
- **i18n (Swahili/English):** `next-intl` with locale routing `app/[locale]/` (`en`, `sw`). Messages in `messages/en.json` + `messages/sw.json` (500+ keys each). `proxy.ts` handles locale prefix detection/redirects. `i18n.ts` server config, `i18n-config.ts` locale defs, `components/i18n-provider.tsx` client provider. Locale layout `app/[locale]/layout.tsx` wraps children in `I18nProvider`. Clerk redirects use `/en/...`. Root `/` → `/en`. To add language: add to `i18n-config.ts`, create `messages/{locale}.json`, rebuild.

## 4. SEO / Search Console status
- Live (after merge to `main`): `https://cchat.site/sitemap.xml` will include `.../jinsi-ya-kufanya-biashara-mtandaoni-tanzania` (priority 0.9 weekly) plus `/privacy /terms /acceptable-use` (redirect to `#terms` etc). `https://cchat.site/robots.txt` has `Sitemap:`.
- Guide is `○` static, public via `proxy.ts isPublicRoute`, `robots allow`. `metadata canonical` set.
- GSC steps: verify property, Sitemaps → submit `sitemap.xml`, URL Inspection → Request Indexing for `/` + guide, monitor 3–10 days. `site:cchat.site` 4h–48h.

## 5. Env vars (Vercel Production + Preview, encrypted)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard`
- `DATABASE_URL` (pooler 6543 `?pgbouncer=true`), `DIRECT_URL` (pooler 5432), `CLERK_WEBHOOK_SECRET`, `DEEPSEEK_API_KEY`, `PESAPAL_*`, `META_*` (empty until configured).
- `.env.local` gitignored, live secrets never commit.

## 6. How to run / verify
- `npm run dev` / `npm run build -- --webpack` (expect `✓ Compiled`, `28 static pages`, `ƒ Proxy`). `npx tsc --noEmit --skipLibCheck`
- Quick check: `git status`, `git log --oneline -8`, `git branch -a -vv` (current `feat/green-dark-demo-v2` `1778c81` ahead of `main` `0f8c7a1`)
- PR for this work is `feat/green-dark-demo-v2` → `main` (not yet created as PR #? existing PR #6 is `feat/notion-landing` stale). Create new PR for `feat/green-dark-demo-v2` when ready to merge. Vercel auto-deploys `main`.
- Test public guide: `npm run dev` → `http://localhost:3000/jinsi-ya-kufanya-biashara-mtandaoni-tanzania` no login, landing `#mwongozo` cards link to `#sura-1..6` scroll correctly, dark toggle via Settings → Appearance → Dark (check unreadable words fixed, black-grid only in light)
- Test i18n: `http://localhost:3000/en/dashboard` and `http://localhost:3000/sw/dashboard` — all UI text in English/Swahili. Root `/` redirects to `/en`. Locale prefix auto-added by `proxy.ts`.

## 7. Open TODOs for next session (priority order)
1. **Merge PR `feat/green-dark-demo-v2`** — create PR `feat/green-dark-demo-v2` → `main` (or update existing), merge via GitHub UI (Squash), then `git checkout main; git pull --ff-only; git branch -d feat/green-dark-demo-v2; git push origin --delete feat/green-dark-demo-v2` optional. Verify `https://cchat.site` renders landing mwongozo section, guide public, pricing 15k/144k, Save 20% crown tabler, fold toggle top, black-grid light only, dark readable.
2. **Post-merge polish (low priority):** `app/layout.tsx` SEO `metadataBase`/`openGraph`/`twitter`/`verification`/`viewport`; `(dashboard)` `robots noindex`; `app/manifest.ts`; clean any remaining `#E4EDE5` stray.
3. **If user wants more onboarding black-grid everywhere:** The light black-grid currently covers `.card/.stat/.svc/.polsec/.sidecard/.inboxgrid/.intoolbar/.phone/.ptable`. If user wants it on *every* app code, extend to `.collapsible-card`, `.rulecard`, `.sale*` etc in `app/globals.css`.
4. **Decide branch cleanup:** Delete `feat/notion-landing` (`c2314c3`) and `feat/ui-ux-pro-max` (`0f8c7a1`) after merge to leave single-`main`.
5. **GSC:** submit updated `sitemap.xml` + Request Indexing for guide URL.
6. **i18n polish (low priority):** Add locale switcher in Settings/navbar, persist locale in cookie/localStorage, add more languages (e.g., French for DRC), ensure all dashboard pages use `useTranslations()` for dynamic content.

## 8. Commands cheat-sheet
- `git checkout feat/green-dark-demo-v2; git log --oneline -8; git status --short`
- `git diff origin/main --stat`
- `npm run build -- --webpack > $env:LOCALAPPDATA\Temp\opencode\build.log 2>&1` (then `Get-Content ... -Tail 80`)
- `npx tsc --noEmit --skipLibCheck`
- `git push origin feat/green-dark-demo-v2` (already pushed `1778c81`)
- `gh pr create --base main --head feat/green-dark-demo-v2 --title "feat: mwongozo docs + pricing 15k + icons + dark + fold + i18n"` (if `gh` installed)
