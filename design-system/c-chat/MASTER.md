# C-chat — AI WhatsApp Agent for Small Business (Tanzania) — DESIGN SYSTEM
*Generated via UI/UX Pro Max v2.15 (B2B Service #5 + AI/Chatbot #18 hybrid)*
*Stack: Next.js 16 + Tailwind 4 + shadcn/ui + Instrument Sans / Bricolage Grotesque*
*Date: 2026-09-11 | Project: C-chat | Slug: c-chat*

> Source of Truth — read this before building any page. Page overrides in `pages/*.md` take precedence.

---

## 1. PATTERN — Feature-Rich Showcase + Interactive Demo + Social Proof

**Landing flow (conversion: trust-driven, B2B):**
1. Hero (value prop + WhatsApp demo bubble, CTA above fold)
2. How it works (3-step, 10-min setup)
3. Features — Bento Grid (6 cards, 8dp rhythm, hover lift)
4. Languages — Swahili/English live demo
5. Pricing — 3 plans (trial / monthly / yearly, 20% save)
6. FAQ + Trust footer (cchat.site)
*Dashboard:* Executive + Data-Dense hybrid – KPI cards (4–6), inbox split (340px + transcript), real-time notifications.
*CTA:* Above fold + repeated after testimonials, `Start free` primary, `Learn More` ghost.

**CTA:** `8px` focus ring, `cursor-pointer` on all clickables.

## 2. STYLE — Minimalism & Swiss Style + AI-Native UI + Soft UI Evolution

**Keywords:** clean grid (12-col), airy White #FFFFFF, subtle depth (soft shadow 0 6px 16px -10px), no neon/purple gradients, no harsh brutalism, no glassmorphism on reading surfaces.
**Best for:** B2B SaaS / AI platform for small business owners (low tech literacy, trust critical).
**Performance:** cost:low, Accessibility: risk:low, requires contrast 4.5:1, keyboard, visible-focus, reduced-motion.

**Do:**
- Grid-based layout, 12-16 cols, 8dp spacing scale (8/12/16/24/32/48)
- Subtle hover 200ms, transform translateY(-2px), shadow lift
- Rounded 12px cards, border 1px #E4EDE5, no hard brutalism
**Avoid (anti-patterns):**
- AI purple/pink gradients (skill: B2B + AI anti-pattern for B2B trust)
- Bright neon + harsh animations + Dark mode only + emoji as icons
- Overly dense dashboard (>8 widgets per view)

## 3. COLORS — Professional Trust + Growth Green (adapted from B2B Service #5)

Keep existing green brand (trust + nature) but align to 4.5:1:

| Token | Value | Usage |
|-------|-------|-------|
| `--grn` | #149A5B | Primary CTA, progress, `colorPrimary` Clerk |
| `--grn-d` | #0E7A47 | Hover, active |
| `--grn-bg` | #E3F4E9 | Subtle bg, badges |
| `--grn-br` | #BCE5CB | Borders |
| `--lime2` | #53E89B | Secondary accent (use sparingly, not text on white) |
| `--dark` | #17291E | Text, ink |
| `--mut` | #5D7064 | Secondary text (4.6:1 on bg) |
| `--mut2` | #8B9B8F | Tertiary (not body) |
| `--bg` | #F4F9F5 | Page background #F8FAFC aligned |
| `--line` | #E4EDE5 | Borders |
| `--line2` | #D2DCD1 | Input borders |
| `--white` | #FFFFFF | Cards |
| `--amb` | #B97708 | Warning |
| `--red` | #C74343 | Destructive |
| `--blu` | #0369A1 | Links, info (trust blue) |

**Contrast:** Body #17291E on #F4F9F5 = 15.8:1 ✓, muted #5D7064 on white = 5.2:1 ✓. Check gold #B97708 on white = 3.1:1 → use only for icons, not body.

## 4. TYPOGRAPHY — Friendly SaaS (Plus Jakarta Sans) adapted to existing stack

**Current stack keeps vibe coded but needs scale:**
- **Display/Heading:** `Bricolage Grotesque` 500-800, tight tracking (-0.025em), `clamp(36px,4.4vw,58px)` hero, `clamp(28px,3.4vw,42px)` sections
- **Body:** `Instrument Sans` 400-600, 16px base, 1.6 line-height, + `Plus Jakarta Sans` fallback for UI
- **Mono:** `Spline Sans Mono` 400, 12-13px for meta, timestamps
- **Scale:** 12px label (uppercase .08em), 13.5px muted, 14px body, 15.5px card title, 24px section H2, Hero 58px
- **Google Fonts:** Already loaded in `globals.css:1` – keep. Add `Plus Jakarta Sans` if needed via next/font.

**Mood:** Friendly, modern, approachable for small business owners (not techy Space Grotesk). Keeps existing Bricolage charm but tightens hierarchy.

## 5. KEY EFFECTS

- **Motion:** 200-250ms hover, 0.22s modal, 0.7s reveal (IntersectionObserver), respects `prefers-reduced-motion`
- **Shadows:** `--sh: 0 1px 2px rgba(14,32,22,.05), 0 6px 16px -10px rgba(14,32,22,.12)` ; `--sh-lg` on hover
- **Rhythm:** 8dp (8/16/24/32/48), border-radius 12px (r), 8px (rs), gap 14px grid
- **Focus:** `outline: 3px solid rgba(20,154,91,.14)` + border `var(--grn)` on `:focus-visible`

## 6. AVOID (Anti-patterns from B2B + AI)

- `AI purple/pink gradients` (#6366F1 → #EC4899) on B2B trust sections
- `Bright neon + Vibrant block` on pricing/billing (hurts trust)
- `Dark mode only` – keep light #F4F9F5, test dark separately
- `Emoji as structural icons` (current 📦) → use Lucide/Phosphor SVG

## 7. COMPONENT RULES (Next.js + Tailwind)

- **Buttons:** `btn.pri` green #149A5B, `btn.ghost` white + border, `cursor-pointer` everywhere, 44px min touch target, disabled 0.5 opacity + `pointer-events:none`
- **Cards:** `pcard` white, border #E4EDE5, radius 12px, hover lift -2px
- **Inputs:** 44px height, 10px padding, border #D2DCD1 → focus #149A5B + 3px ring
- **Chips/Badges:** `b-grn` `#E3F4E9` text #0E7A47, wrap, `+n` disclosure if overflow, not color-only
- **Dashboard:** Statgrid 4-6 KPIs, dashgrid `1.9fr 1fr`, inboxgrid `340px 1fr`, safe areas, sticky bars have content insets
- **Icons:** Lucide `@phosphor-icons/react` or `lucide-react`, 1.5px stroke, 17px consistent, `aria-hidden` if decorative

## 8. PRE-DELIVERY CHECKLIST

- [ ] No emojis as icons (SVG: Lucide/Phosphor)
- [ ] cursor-pointer on all clickable
- [ ] Interaction timing 200-250ms, respects reduced-motion
- [ ] Light text 4.5:1, large 3:1, focus visible, keyboard nav
- [ ] Text/chips reflow without clipping at 375px + 200% zoom
- [ ] Responsive: 375, 768, 1024, 1440 + landscape
- [ ] Touch targets ≥44pt, safe areas, scroll not hidden behind sticky

## 9. DIALS

- variance: 4 (balanced minimal, not brutalist)
- motion: 4 (subtle micro, not complex choreography)
- density: 5 (standard 16-64px, not dense dashboard yet)

---

*Next: `pages/landing.md` + `pages/dashboard.md` overrides will refine hero density and data-dense grids. Run `python .opencode/skills/ui-ux-pro-max/scripts/search.py "C-chat AI WhatsApp" --design-system --persist -p "c-chat" --page "landing"` to generate.*
