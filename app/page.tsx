"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CchatLogo from "@/components/branding/CchatLogo";
import Reveal from "@/components/reveal";
import { CrownIcon } from "@/components/premium";

function ChatIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ZapIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ArrowIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CheckIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function HandIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-4 0v6" />
      <path d="M14 10V4a2 2 0 0 0-4 0v7" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 13" />
    </svg>
  );
}

function GlobeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SparkIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

function ShieldIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CardIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function PlusIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

const FAQ_DATA = [
  ["Does C-chat read all my WhatsApp?", "No. C-chat only handles customer conversations that come through your business number. Your personal chats are not touched."],
  ["What if the AI doesn't know an answer?", "It tells the customer it will check, and passes the chat to you. If you're away, it asks for the customer's name and number so you can call back."],
  ["How do payments work?", "Your customers pay you directly — M-Pesa, Tigo Pesa, Airtel Money or cash. For your C-chat subscription, you pay TSh 12,000/month (or 115,200/year) after your 3-day free trial."],
  ["Can it really speak proper Swahili?", "Yes. Swahili is the main language of the AI, and you can teach it your own slang during setup. When a customer writes in English, it switches."],
  ["What do I need to start?", "A WhatsApp Business number and about ten minutes for setup. No hardware, no developers. Every new account starts with a free 3-day trial."],
  ["Is there a contract?", "No. TSh 12,000/month, or save 20% with the yearly plan. Cancel anytime."],
];

const PRICING_FEATURES = [
  "12,000 AI messages every month",
  "Your products, prices and stock, always current",
  "Swahili first, English automatic",
  "You take over any chat, any time",
  "Your rules for delivery, returns and warranties",
  "Every conversation kept in one inbox",
];

function MenuIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const TRUST_ITEMS = ["Duka la Simu Kariakoo", "Salon ya Mikocheni", "Fundi wa Vifaa", "Duka la Nguo Gongo la Mboto", "Hoteli Ndogo Sinza", "Duka la Vipuri Posta"];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#111] font-body selection:bg-[#E3F4E9] selection:text-[#0E7A47]">
      {/* NAVBAR — Notion: white blur, 1px border, height 56 */}
      <nav className={`notion-nav fixed top-0 left-0 right-0 z-[900] flex items-center gap-6 px-[5vw] h-[56px] transition-all ${scrolled ? "scrolled" : ""}`}>
        <Link href="/" className="flex items-center gap-[9px] font-disp font-[800] text-[18px] tracking-tight text-[#111]">
          <CchatLogo size={32} decorative className="shrink-0" />
          C-chat
        </Link>
        <div className="hidden lg:flex items-center gap-6 ml-8 text-[13.5px] font-medium text-[#6B6B6B]">
          <a href="#capture" className="hover:text-[#111] transition-colors">Product</a>
          <a href="#capture" className="hover:text-[#111] transition-colors">How it works</a>
          <a href="#languages" className="hover:text-[#111] transition-colors">Languages</a>
          <a href="#pricing" className="hover:text-[#111] transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-[#111] transition-colors">FAQ</a>
        </div>
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <Link href="/sign-in" className="text-[13.5px] font-medium text-[#6B6B6B] hover:text-[#111] px-3 py-2">Log in</Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 px-4 py-[8px] rounded-[10px] bg-[#111] text-white text-[13.5px] font-semibold hover:bg-black transition-colors shadow-[0_1px_2px_rgba(0,0,0,.08)]"
          >
            Get C-chat free
          </Link>
        </div>
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <Link
            href="/sign-up"
            className="lg:hidden inline-flex items-center justify-center px-3.5 py-[7px] rounded-[10px] bg-[#111] text-white text-[13px] font-semibold"
          >
            Get free
          </Link>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="lg:hidden w-9 h-9 grid place-items-center rounded-[10px] border border-[#E9E9E7] bg-white text-[#111]"
            aria-label="Toggle menu"
          >
            {mobileMenu ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[899] lg:hidden">
          <div className="absolute inset-0 bg-[#111]/20 backdrop-blur-[1px]" onClick={() => setMobileMenu(false)} />
          <div className="absolute top-[56px] left-0 right-0 bg-white border-b border-[#E9E9E7] px-[5vw] py-6 space-y-1 shadow-[0_12px_32px_rgba(0,0,0,.08)]">
            {[
              { href: "#capture", label: "How it works" },
              { href: "#automate", label: "Features" },
              { href: "#languages", label: "Languages" },
              { href: "#pricing", label: "Pricing" },
              { href: "#faq", label: "FAQ" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenu(false)}
                className="block rounded-[10px] px-3 py-3 text-[15px] font-medium text-[#111] hover:bg-[#F7F7F5]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex gap-3">
              <Link href="/sign-in" onClick={() => setMobileMenu(false)} className="flex-1 inline-flex justify-center rounded-[10px] border border-[#E9E9E7] bg-white py-3 text-[14px] font-semibold">Log in</Link>
              <Link href="/sign-up" onClick={() => setMobileMenu(false)} className="flex-1 inline-flex justify-center rounded-[10px] bg-[#149A5B] py-3 text-[14px] font-semibold text-white">Start free</Link>
            </div>
          </div>
        </div>
      )}

      {/* HERO — Notion: centered, white, pile visual, 88px offset for 56px nav */}
      <header className="relative bg-white pt-[88px] pb-10 md:pb-14 overflow-hidden">
        <div className="mx-auto max-w-[1120px] px-[5vw] text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E9E9E7] bg-[#F7F7F5] px-3 py-1.5 text-[12px] font-semibold text-[#6B6B6B] shadow-[0_1px_2px_rgba(0,0,0,.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#149A5B] animate-pulse" /> 3-day free trial · No card needed
            </div>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="font-disp font-[800] tracking-[-.03em] leading-[.95] md:leading-[.9] text-[clamp(36px,6vw,64px)] mt-6 text-[#111] text-balance">
              Where Tanzanian shops
              <br />
              <span className="font-[800]">and AI work together.</span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto max-w-[640px] mt-4 text-[16px] md:text-[18px] leading-[1.6] text-[#6B6B6B]">
              C-chat answers your customers on WhatsApp — day and night, in Swahili or English.
              <br className="hidden md:block" /> When a chat needs you, it comes straight to you.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="flex gap-3 mt-7 flex-wrap justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-[22px] py-[13px] rounded-[12px] bg-[#149A5B] text-white font-semibold text-[15px] hover:bg-[#0E7A47] transition-colors shadow-[0_6px_16px_-6px_rgba(20,154,91,.45)] min-h-[44px]"
              >
                Get C-chat free <ArrowIcon size={16} />
              </Link>
              <a
                href="#capture"
                className="inline-flex items-center gap-2 px-[22px] py-[13px] rounded-[12px] font-semibold text-[15px] border border-[#E9E9E7] bg-white text-[#111] hover:bg-[#F7F7F5] transition-colors min-h-[44px]"
              >
                See how it works
              </a>
            </div>
            <div className="mt-4 text-[12.5px] font-medium text-[#9B9B9B]">TSh 12,000/mo · Save 20% yearly · Cancel anytime · Built for Tanzania</div>
          </Reveal>

          {/* HERO pile — main + floating pin like Notion */}
          <Reveal delay={180}>
            <div className="relative mx-auto max-w-[960px] mt-10 md:mt-12">
              <div className="notion-frame hero-img overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/landing/hero.webp"
                  alt="C-chat hero preview — WhatsApp conversations and dashboard"
                  width={1376}
                  height={768}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* floating capture pin */}
              <div className="hidden md:flex notion-pin absolute -bottom-5 -right-3 items-center gap-3 px-3.5 py-3 rotate-[0.8deg]">
                <div className="w-9 h-9 rounded-[10px] bg-[#E3F4E9] text-[#0E7A47] grid place-items-center">
                  <ZapIcon size={16} />
                </div>
                <div className="text-left leading-none">
                  <div className="text-[13px] font-bold text-[#111]">Jibu la haraka</div>
                  <div className="text-[11.5px] text-[#6B6B6B]">“Zimebaki 2 — delivery leo”</div>
                </div>
                <span className="ml-2 w-2 h-2 rounded-full bg-[#149A5B] animate-pulse" />
              </div>
              <div className="hidden lg:flex notion-pin absolute -left-3 top-10 items-center gap-2.5 px-3 py-2.5 -rotate-[0.6deg]">
                <span className="w-7 h-7 rounded-full bg-[#111] text-white grid place-items-center text-[11px] font-bold">SW</span>
                <div className="text-left leading-none">
                  <div className="text-[12.5px] font-semibold text-[#111]">Swahili kwanza</div>
                  <div className="text-[11px] text-[#6B6B6B]">English auto</div>
                </div>
              </div>
            </div>
          </Reveal>
          <p className="mt-4 text-[11px] text-[#9B9B9B]">Preview — your products, chats and delivery rules in one place.</p>
        </div>
      </header>

      {/* TRUST MARQUEE — Notion Forbes bar */}
      <div className="border-y border-[#F1F1EF] bg-[#FCFCF9] py-5">
        <div className="mx-auto max-w-[1120px] px-[5vw]">
          <p className="text-center text-[11px] font-bold tracking-[.14em] uppercase text-[#9B9B9B] mb-4">Trusted by shops across Dar es Salaam</p>
          <div className="marquee">
            <div className="marquee-track">
              {[...TRUST_ITEMS, ...TRUST_ITEMS].map((t, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6B6B6B] whitespace-nowrap">
                  <span className="w-6 h-6 rounded-full bg-white border border-[#E9E9E7] grid place-items-center text-[10px]">✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 1 — CAPTURE */}
      <section id="capture" className="bg-white py-16 md:py-24 px-[5vw] border-t border-[#F1F1EF]">
        <div className="mx-auto max-w-[1120px] grid lg:grid-cols-[460px_1fr] gap-10 lg:gap-14 items-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[.12em] uppercase text-[#9B9B9B]">
              <span className="w-6 h-[1px] bg-[#E9E9E7]" /> Capture knowledge
            </div>
            <h2 className="font-disp font-[700] tracking-[-.02em] leading-[1.05] text-[clamp(28px,3.2vw,38px)] mt-3 text-[#111]">
              Bring everything into one place.
            </h2>
            <p className="text-[#6B6B6B] text-[16px] leading-[1.6] mt-3">
              Tell C-chat about your products, prices, stock and delivery rules once — in your own words. Change a price and every customer hears the new one.
            </p>
            <a href="#pricing" className="inline-flex items-center gap-1.5 mt-5 text-[14px] font-semibold text-[#111] hover:text-[#149A5B] transition-colors">
              Set up in 10 minutes <ArrowIcon size={14} />
            </a>
            <div className="flex flex-wrap gap-2 mt-6">
              {["10-minute setup", "Products & prices", "Delivery & policies"].map((t) => (
                <span key={t} className="inline-flex items-center rounded-full border border-[#E9E9E7] bg-[#F7F7F5] px-3 py-1.5 text-[12px] font-semibold text-[#111]">{t}</span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative">
              <div className="notion-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/landing/capture-desktop.webp" alt="C-chat catalog — products, prices and stock" width={1376} height={768} loading="lazy" decoding="async" className="w-full h-auto object-cover" />
              </div>
              <div className="hidden md:flex notion-pin absolute -bottom-4 -left-4 items-center gap-3 px-3 py-3">
                <div className="w-9 h-9 rounded-[9px] bg-[#111] text-white grid place-items-center text-[13px]">📦</div>
                <div className="leading-none">
                  <div className="text-[13px] font-bold text-[#111]">3 iPhones in stock</div>
                  <div className="text-[11px] text-[#6B6B6B]">Live → “Zimebaki 2 tu”</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURE 2 — FIND */}
      <section id="find" className="bg-[#FCFCF9] py-16 md:py-24 px-[5vw] border-y border-[#F1F1EF]">
        <div className="mx-auto max-w-[1120px] grid lg:grid-cols-[1fr_460px] gap-10 lg:gap-14 items-center">
          <Reveal className="lg:order-2">
            <div className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[.12em] uppercase text-[#9B9B9B]">
              <span className="w-6 h-[1px] bg-[#E9E9E7]" /> Find answers
            </div>
            <h2 className="font-disp font-[700] tracking-[-.02em] leading-[1.05] text-[clamp(28px,3.2vw,38px)] mt-3 text-[#111]">
              Get answers, instantly — in Swahili.
            </h2>
            <p className="text-[#6B6B6B] text-[16px] leading-[1.6] mt-3">
              Price? Stock? Delivery to Mikocheni? Your AI answers right away, with your real data. If it doesn’t know, it says so and passes the chat to you.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E9E9E7] px-3 py-1.5 text-[12px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-[#149A5B]" /> Always up-to-date</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E9E9E7] px-3 py-1.5 text-[12px] font-semibold">Doesn’t make things up</span>
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:order-1">
            <div className="relative">
              <div className="notion-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/landing/find-inbox.webp" alt="C-chat inbox — finding answers in Swahili and English" width={1376} height={768} loading="lazy" decoding="async" className="w-full h-auto object-cover" />
              </div>
              <div className="hidden md:flex notion-pin absolute -bottom-4 -right-4 items-center gap-2 px-3 py-2.5 rotate-[0.6deg]">
                <span className="w-2 h-2 rounded-full bg-[#149A5B]" />
                <span className="text-[12px] font-semibold text-[#111]">“Kuna iPhone 13?” → 0.8s</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURE 3 — AUTOMATE */}
      <section id="automate" className="bg-white py-16 md:py-24 px-[5vw] border-b border-[#F1F1EF]">
        <div className="mx-auto max-w-[1120px] grid lg:grid-cols-[460px_1fr] gap-10 lg:gap-14 items-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[.12em] uppercase text-[#9B9B9B]">
              <span className="w-6 h-[1px] bg-[#E9E9E7]" /> Automate busywork
            </div>
            <h2 className="font-disp font-[700] tracking-[-.02em] leading-[1.05] text-[clamp(28px,3.2vw,38px)] mt-3 text-[#111]">
              Keep work moving 24/7 — you step in when it matters.
            </h2>
            <p className="text-[#6B6B6B] text-[16px] leading-[1.6] mt-3">
              Every chat lands in one inbox. When a customer needs a person — hard negotiation, “let me talk to owner” — the AI steps aside and tells you why.
            </p>
            <ul className="mt-5 space-y-2 text-[14px] text-[#111]">
              <li className="flex gap-2"><CheckIcon size={14} /> One inbox, full history</li>
              <li className="flex gap-2"><CheckIcon size={14} /> You get alerted</li>
              <li className="flex gap-2"><CheckIcon size={14} /> AI waits until you’re done</li>
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative">
              <div className="notion-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/landing/desktop-dashboard.webp" alt="C-chat dashboard — automating busywork" width={1376} height={768} loading="lazy" decoding="async" className="w-full h-auto object-cover" />
              </div>
              <div className="hidden md:flex notion-pin absolute -bottom-4 -left-4 flex-col items-start gap-1 px-3.5 py-3 min-w-[220px]">
                <span className="text-[11px] font-bold tracking-wide uppercase text-[#9B9B9B]">Handover</span>
                <span className="text-[13px] font-semibold text-[#111]">“Customer wants to negotiate”</span>
                <span className="text-[11px] text-[#6B6B6B]">AI paused — your turn</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIAL — Notion quote style */}
      <section className="bg-[#F7F7F5] py-12 md:py-16 px-[5vw] border-y border-[#E9E9E7]">
        <div className="mx-auto max-w-[1120px] grid lg:grid-cols-[480px_1fr] gap-8 lg:gap-12 items-center">
          <Reveal>
            <div className="notion-frame p-0 bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/landing/testimonial.webp" alt="Tanzanian shop owner using C-chat" width={1200} height={896} loading="lazy" decoding="async" className="w-full h-auto object-cover" />
              <div className="flex items-center gap-3 px-4 py-3 border-t border-[#F1F1EF] bg-white">
                <div className="w-8 h-8 rounded-full bg-[#111] text-white grid place-items-center text-[11px] font-bold">AK</div>
                <div className="leading-none">
                  <div className="text-[13px] font-bold text-[#111]">Asha — Duka la Simu, Kariakoo</div>
                  <div className="text-[11.5px] text-[#6B6B6B]">40+ chats/day · Swahili & English</div>
                </div>
                <span className="ml-auto text-[11px] font-bold px-2 py-1 rounded-full bg-[#E3F4E9] text-[#0E7A47]">Verified</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="text-[11px] font-bold tracking-[.14em] uppercase text-[#9B9B9B] mb-3">Customer story</div>
            <blockquote className="font-disp font-[700] tracking-[-.02em] leading-[1.15] text-[28px] md:text-[32px] text-[#111]">
              “Before C-chat I was on WhatsApp all day. Now my AI answers in Swahili — I only step in when it matters.”
            </blockquote>
            <div className="mt-6 flex items-center gap-3 text-[13px] text-[#6B6B6B]">
              <span className="w-8 h-[1px] bg-[#E9E9E7]" /> 3-day free trial · No developers · Built in Dar es Salaam
            </div>
            <div className="mt-6 flex gap-2">
              <span className="inline-flex items-center rounded-full border border-[#E9E9E7] bg-white px-3 py-1.5 text-[12px] font-semibold">⭐ 4.9 · from 200+ shops</span>
              <span className="inline-flex items-center rounded-full border border-[#E9E9E7] bg-white px-3 py-1.5 text-[12px] font-semibold">💬 WhatsApp Business ready</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TRUST STRIP — using trust-pricing image as Notion “automate” visual */}
      <section className="bg-white py-12 md:py-16 px-[5vw] border-b border-[#F1F1EF]">
        <div className="mx-auto max-w-[1120px] grid lg:grid-cols-[1fr_480px] gap-8 items-center">
          <Reveal>
            <h3 className="font-disp font-[700] text-[26px] leading-[1.15] tracking-tight text-[#111]">Your money stays yours.</h3>
            <p className="text-[#6B6B6B] text-[14.5px] leading-[1.6] mt-3">Customers pay you directly — <b className="text-[#111] font-semibold">M-Pesa, Tigo Pesa, Airtel Money, cash</b>. C-chat never holds a payment. You only pay your subscription: <b className="text-[#111]">TSh 12,000/mo</b>.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold">
              <span className="px-3 py-1.5 rounded-full bg-[#F7F7F5] border border-[#E9E9E7]">M-Pesa</span>
              <span className="px-3 py-1.5 rounded-full bg-[#F7F7F5] border border-[#E9E9E7]">Tigo Pesa</span>
              <span className="px-3 py-1.5 rounded-full bg-[#F7F7F5] border border-[#E9E9E7]">Airtel Money</span>
              <span className="px-3 py-1.5 rounded-full bg-[#E3F4E9] border border-[#BCE5CB] text-[#0E7A47]">Cash</span>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="notion-frame p-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/landing/trust-pricing.webp" alt="Trusted payments — M-Pesa, Tigo Pesa, cash" width={1376} height={768} loading="lazy" decoding="async" className="w-full h-auto object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS — keep 3-step idea but Notion-clean (light) */}
      <section className="bg-[#FCFCF9] py-16 md:py-20 px-[5vw] border-b border-[#F1F1EF]" id="how">
        <div className="mx-auto max-w-[1120px]">
          <div className="max-w-[640px] mx-auto text-center mb-10">
            <div className="text-[11px] font-bold tracking-[.14em] uppercase text-[#9B9B9B]">How it works</div>
            <h2 className="font-disp font-[700] tracking-[-.02em] leading-[1.05] text-[clamp(26px,3vw,36px)] mt-2 text-[#111]">Set it up once. It works every day.</h2>
            <p className="text-[#6B6B6B] mt-3">No developers. No new hardware. About ten minutes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-[1000px] mx-auto">
            {[
              { n: "01", title: "Tell it about your business", desc: "Products, prices, services and delivery rules — once, in your own words.", icon: <SparkIcon size={18} /> },
              { n: "02", title: "It answers your customers", desc: "Swahili or English, day and night. If it doesn’t know, it passes to you.", icon: <ChatIcon size={18} /> },
              { n: "03", title: "You take over when it matters", desc: "One inbox. AI steps aside, tells you why — you reply, then it continues.", icon: <HandIcon size={18} /> },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="bg-white border border-[#E9E9E7] rounded-[16px] p-6 h-full hover:shadow-[0_8px_24px_rgba(0,0,0,.06)] transition-shadow">
                  <div className="w-9 h-9 rounded-[10px] bg-[#111] text-white grid place-items-center mb-4 text-[12px] font-bold">{s.n}</div>
                  <div className="w-9 h-9 rounded-[10px] bg-[#F7F7F5] border border-[#E9E9E7] grid place-items-center mb-3 text-[#6B6B6B]">{s.icon}</div>
                  <h3 className="font-disp font-[600] text-[16px] text-[#111]">{s.title}</h3>
                  <p className="text-[13.5px] leading-[1.6] text-[#6B6B6B] mt-2">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES — keep bento but on Notion light */}
      <section className="bg-white py-16 md:py-20 px-[5vw] border-b border-[#F1F1EF]" id="features">
        <div className="max-w-[1120px] mx-auto">
          <div className="max-w-[640px] mb-8">
            <div className="text-[11px] font-bold tracking-[.14em] uppercase text-[#9B9B9B]">Features</div>
            <h2 className="font-disp font-[700] tracking-[-.02em] leading-[1.05] text-[clamp(26px,3vw,36px)] mt-2 text-[#111]">Everything you need to handle your customers.</h2>
          </div>
          <div className="grid grid-cols-12 gap-3">
            <Reveal className="col-span-12 lg:col-span-7">
              <div className="bg-[#FCFCF9] border border-[#E9E9E7] rounded-[16px] p-6 h-full">
                <div className="w-9 h-9 rounded-[10px] bg-white border border-[#E9E9E7] grid place-items-center mb-3 text-[#111]"><ZapIcon size={16} /></div>
                <h3 className="font-disp font-[600] text-[16px] text-[#111]">Keep your AI up to date</h3>
                <p className="text-[#6B6B6B] text-[13.5px] leading-[1.6] mt-1">Update once — every customer hears the new price or stock.</p>
                <div className="flex items-center gap-2 mt-4 flex-wrap text-[12px] font-semibold">
                  <span className="px-3 py-1.5 rounded-full bg-white border border-[#E9E9E7]">3 iPhones in stock</span>
                  <span className="text-[#9B9B9B]">→</span>
                  <span className="px-3 py-1.5 rounded-full bg-white border border-[#E9E9E7]">“Kuna iPhone 13?”</span>
                  <span className="text-[#9B9B9B]">→</span>
                  <span className="px-3 py-1.5 rounded-full bg-[#111] text-white">“Zimebaki 2 tu”</span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80} className="col-span-12 lg:col-span-5">
              <div className="bg-[#FCFCF9] border border-[#E9E9E7] rounded-[16px] p-6 h-full">
                <div className="w-9 h-9 rounded-[10px] bg-white border border-[#E9E9E7] grid place-items-center mb-3"><HandIcon size={16} /></div>
                <h3 className="font-disp font-[600] text-[16px] text-[#111]">You take over when it matters</h3>
                <p className="text-[#6B6B6B] text-[13.5px] leading-[1.6] mt-1">“Let me talk to the owner” — AI steps aside, tells you why. You reply, it waits.</p>
              </div>
            </Reveal>
            <Reveal className="col-span-12 lg:col-span-4">
              <div className="bg-[#FCFCF9] border border-[#E9E9E7] rounded-[16px] p-6 h-full">
                <div className="w-9 h-9 rounded-[10px] bg-white border border-[#E9E9E7] grid place-items-center mb-3"><GlobeIcon size={16} /></div>
                <h3 className="font-disp font-[600] text-[16px] text-[#111]">Swahili. And English.</h3>
                <p className="text-[#6B6B6B] text-[13.5px] mt-1">Customer writes English → whole chat switches. No restart.</p>
              </div>
            </Reveal>
            <Reveal delay={80} className="col-span-12 lg:col-span-4">
              <div className="bg-[#FCFCF9] border border-[#E9E9E7] rounded-[16px] p-6 h-full">
                <div className="w-9 h-9 rounded-[10px] bg-white border border-[#E9E9E7] grid place-items-center mb-3"><SparkIcon size={16} /></div>
                <h3 className="font-disp font-[600] text-[16px] text-[#111]">It helps you sell</h3>
                <p className="text-[#6B6B6B] text-[13.5px] mt-1">Answers buying questions and suggests extras — case with phone, booking repair.</p>
              </div>
            </Reveal>
            <Reveal delay={160} className="col-span-12 lg:col-span-4">
              <div className="bg-[#FCFCF9] border border-[#E9E9E7] rounded-[16px] p-6 h-full">
                <div className="w-9 h-9 rounded-[10px] bg-white border border-[#E9E9E7] grid place-items-center mb-3"><ShieldIcon size={16} /></div>
                <h3 className="font-disp font-[600] text-[16px] text-[#111]">Your rules, kept</h3>
                <p className="text-[#6B6B6B] text-[13.5px] mt-1">Delivery fees, warranty, returns — repeated exactly as you wrote them.</p>
              </div>
            </Reveal>
            <Reveal className="col-span-12 lg:col-span-5">
              <div className="bg-[#FCFCF9] border border-[#E9E9E7] rounded-[16px] p-6 h-full">
                <div className="w-9 h-9 rounded-[10px] bg-white border border-[#E9E9E7] grid place-items-center mb-3"><ChatIcon size={16} /></div>
                <h3 className="font-disp font-[600] text-[16px] text-[#111]">Every chat in one inbox</h3>
                <p className="text-[#6B6B6B] text-[13.5px] mt-1">Search by name, number or word. Open any chat where it left off.</p>
              </div>
            </Reveal>
            <Reveal delay={80} className="col-span-12 lg:col-span-7">
              <div className="bg-[#FCFCF9] border border-[#E9E9E7] rounded-[16px] p-6 h-full">
                <div className="w-9 h-9 rounded-[10px] bg-white border border-[#E9E9E7] grid place-items-center mb-3"><CardIcon size={16} /></div>
                <h3 className="font-disp font-[600] text-[16px] text-[#111]">Your money stays yours</h3>
                <p className="text-[#6B6B6B] text-[13.5px] mt-1">Customers pay you directly — M-Pesa, Tigo Pesa, Airtel Money, cash. C-chat only charges your subscription.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* LANGUAGES — keep dark id but soften to Notion warm */}
      <section className="bg-[#111] text-[#F7F7F5] py-16 md:py-20 px-[5vw]" id="languages">
        <div className="max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="max-w-[640px] mb-6">
              <div className="text-[11px] font-bold tracking-[.14em] uppercase text-[#9B9B9B] mb-2">Lugha / Language</div>
              <h2 className="font-disp font-[700] tracking-[-.02em] leading-[1.05] text-[clamp(28px,3.2vw,38px)] text-white">
                Swahili kwanza.<br />English automatically.
              </h2>
              <p className="text-[#9B9B9B] mt-3 text-[15px] leading-relaxed">
                Customers write the way they talk. The AI answers in kind — even when they switch mid-chat.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { n: "SW", title: "Swahili comes first", desc: "Everyday Swahili — not stiff robot Swahili. Teach it your own slang in setup." },
                { n: "EN", title: "English is automatic", desc: "If the customer writes in English, the whole conversation switches over." },
                { n: "1", title: "Or pick one language", desc: "Want Swahili only? One setting does it." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-[30px] h-[30px] rounded-[9px] bg-white/10 text-white font-mono font-bold text-[12px] grid place-items-center flex-none border border-white/10">
                    {item.n}
                  </span>
                  <div>
                    <h4 className="text-[14.5px] font-semibold text-white">{item.title}</h4>
                    <p className="text-[#9B9B9B] text-[13px] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Reveal delay={120}>
            <div className="bg-[#F7F7F5] rounded-[16px] p-4 flex flex-col gap-2.5 border border-[#E9E9E7] shadow-[0_8px_32px_rgba(0,0,0,.18)]">
              <span className="max-w-[80%] bg-white px-3 py-2 rounded-[12px] rounded-tl-[4px] text-[14px] leading-[1.4] shadow-[0_1px_2px_rgba(0,0,0,.06)] border border-[#F1F1EF] self-start text-[#111]">
                Habari! iPhone 11 iko na bei gani? <time className="block text-right text-[10px] text-[#9B9B9B] mt-1 font-mono">10:02</time>
              </span>
              <span className="max-w-[80%] bg-[#111] px-3 py-2 rounded-[12px] rounded-tr-[4px] text-[14px] leading-[1.4] shadow-[0_1px_2px_rgba(0,0,0,.12)] self-end text-white">
                Habari boss! iPhone 11 64GB — TZS 720,000, tuna 3. <time className="block text-right text-[10px] text-white/60 mt-1 font-mono">10:02</time>
              </span>
              <span className="max-w-[80%] bg-white px-3 py-2 rounded-[12px] rounded-tl-[4px] text-[14px] leading-[1.4] shadow-[0_1px_2px_rgba(0,0,0,.06)] border border-[#F1F1EF] self-start text-[#111]">
                Actually, can you deliver to Mikocheni? <time className="block text-right text-[10px] text-[#9B9B9B] mt-1 font-mono">10:03</time>
              </span>
              <span className="self-center text-[11px] font-bold tracking-[.06em] uppercase text-[#111] bg-white rounded-full px-3.5 py-1.5 border border-[#E9E9E7] shadow-[0_1px_3px_rgba(0,0,0,.08)]">
                ⇄ switches to English instantly
              </span>
              <span className="max-w-[80%] bg-[#111] px-3 py-2 rounded-[12px] rounded-tr-[4px] text-[14px] leading-[1.4] shadow-[0_1px_2px_rgba(0,0,0,.12)] self-end text-white">
                Of course! Mikocheni delivery is TZS 7,000, within 2–4 hours <time className="block text-right text-[10px] text-white/60 mt-1 font-mono">10:03</time>
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRICING — structure kept (section 7 per your note) but Notion borders */}
      <section className="bg-white text-[#111] py-16 md:py-20 px-[5vw] border-t border-[#F1F1EF]" id="pricing">
        <div className="max-w-[1100px] mx-auto">
          <Reveal>
            <div className="border border-[#E9E9E7] rounded-[16px] overflow-hidden bg-[#F1F1EF] grid grid-cols-1 gap-[1px] md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-8 md:col-span-2 lg:col-span-1 flex flex-col justify-center">
                <p className="mb-4 text-[#9B9B9B] text-[11px] font-bold uppercase tracking-[.14em]">Pricing</p>
                <h2 className="font-disp font-[700] text-[30px] leading-[1.05] tracking-tight text-[#111]">
                  One plan.<br />Everything included.
                </h2>
                <p className="mt-3 text-[#6B6B6B] text-[13.5px] leading-relaxed max-w-[280px]">
                  Start with 3 days free. No card needed.
                </p>
              </div>

              <div className="relative flex flex-col bg-white shadow-[inset_0_0_0_1.5px_#149A5B]">
                <span className="absolute top-0 right-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-b-[8px] bg-[#149A5B] text-white text-[10.5px] font-bold uppercase tracking-wide">
                  Free trial
                </span>
                <div className="p-8 flex flex-col flex-1">
                  <p className="mb-4 text-[#9B9B9B] text-[11px] font-bold uppercase tracking-wide">Free Trial</p>
                  <div className="mb-1 flex items-baseline gap-2">
                    <h3 className="font-disp font-[700] text-[34px] leading-none tracking-tight text-[#111]">3</h3>
                    <span className="text-[#6B6B6B] text-[12px]">days free</span>
                  </div>
                  <p className="mb-6 text-[#6B6B6B] text-[13px]">Everything included. No card required.</p>
                  <Link href="/sign-up" className="btn wide pri mt-auto justify-center">Start free trial</Link>
                </div>
              </div>

              <div className="relative flex flex-col bg-white">
                <div className="p-8 flex flex-col flex-1">
                  <p className="mb-4 text-[#9B9B9B] text-[11px] font-bold uppercase tracking-wide">Premium</p>
                  <div className="mb-1 flex items-baseline gap-2">
                    <h3 className="font-disp font-[700] text-[34px] leading-none tracking-tight text-[#111]">12,000</h3>
                    <span className="text-[#6B6B6B] text-[12px]">TSh / month</span>
                  </div>
                  <p className="mb-6 text-[#6B6B6B] text-[13px]">Everything included, billed monthly. Cancel anytime.</p>
                  <Link href="/sign-up" className="btn wide ghost mt-auto justify-center border-[#E9E9E7]">Get started</Link>
                </div>
              </div>

              <div className="relative flex flex-col bg-white">
                <span className="absolute top-0 right-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-b-[8px] bg-[#FCF0D8] text-[#9A6A06] text-[10.5px] font-bold uppercase tracking-wide border border-[#EFD9A8] border-t-0">
                  <CrownIcon className="w-3 h-3" /> Save 20%
                </span>
                <div className="p-8 flex flex-col flex-1">
                  <p className="mb-4 text-[#9B9B9B] text-[11px] font-bold uppercase tracking-wide">Extra Premium</p>
                  <div className="mb-1 flex items-baseline gap-2">
                    <h3 className="font-disp font-[700] text-[34px] leading-none tracking-tight text-[#111]">115,200</h3>
                    <span className="text-[#6B6B6B] text-[12px]">TSh / year</span>
                  </div>
                  <p className="mb-6 text-[#6B6B6B] text-[13px]">Same everything, billed once a year. Two months free.</p>
                  <Link href="/sign-up" className="btn wide ghost mt-auto justify-center border-[#E9E9E7]">Choose yearly</Link>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ul className="list-none mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5 max-w-[820px] mx-auto">
              {PRICING_FEATURES.map((f, i) => (
                <li key={i} className="flex gap-2.5 items-start text-[13.5px] text-[#111]">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#E3F4E9] text-[#0E7A47] grid place-items-center flex-none"><CheckIcon size={12} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-[12.5px] text-[#6B6B6B] text-center mt-6 leading-relaxed max-w-[540px] mx-auto">
              Every new account starts with a <b className="text-[#111]">3-day free trial</b>. Pay with M-Pesa, Tigo Pesa, Airtel Money or card. C-chat <b className="text-[#111]">never</b> processes your customers&apos; payments.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ — notion light */}
      <section className="bg-[#F7F7F5] text-[#111] py-16 md:py-20 px-[5vw] border-y border-[#E9E9E7]" id="faq">
        <div className="max-w-[1120px] mx-auto">
          <div className="mx-auto mb-8 max-w-[640px] text-center">
            <div className="text-[11px] font-bold tracking-[.14em] uppercase text-[#9B9B9B] mb-2">FAQ</div>
            <h2 className="font-disp font-[700] tracking-[-.02em] leading-[1.05] text-[clamp(28px,3.2vw,36px)] text-[#111]">
              Questions? Answers.
            </h2>
          </div>
          <div className="max-w-[760px] mx-auto bg-white border border-[#E9E9E7] rounded-[16px] divide-y divide-[#F1F1EF] overflow-hidden">
            {FAQ_DATA.map(([q, a], i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center gap-4 py-5 px-6 text-left hover:bg-[#FCFCF9] transition-colors"
                >
                  <span className="text-[15px] font-semibold font-disp text-[#111]">{q}</span>
                  <span className={`flex-none w-7 h-7 rounded-full border grid place-items-center transition-transform duration-200 ${openFaq === i ? "bg-[#111] text-white border-[#111] rotate-45" : "bg-white text-[#6B6B6B] border-[#E9E9E7]"}`}>
                    <PlusIcon size={14} />
                  </span>
                </button>
                <div className="overflow-hidden transition-[max-height] duration-300" style={{ maxHeight: openFaq === i ? "240px" : "0" }}>
                  <div className="px-6 pb-5 text-[#6B6B6B] text-[14px] leading-relaxed">{a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER — Notion light with C-chat ink */}
      <footer className="bg-white text-[#6B6B6B] pt-12 pb-8 px-[5vw] border-t border-[#E9E9E7]">
        <div className="max-w-[1120px] mx-auto grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 pb-8 border-b border-[#F1F1EF]">
          <div>
            <div className="flex items-center gap-2 font-disp font-[800] text-[18px] tracking-tight text-[#111] mb-3">
              <CchatLogo size={32} decorative className="shrink-0" />
              C-chat
            </div>
            <p className="text-[13.5px] max-w-[280px] leading-relaxed text-[#6B6B6B]">
              An AI assistant that answers your WhatsApp customers. Built in Dar es Salaam.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E9E9E7] bg-[#F7F7F5] px-3 py-1.5 text-[11px] font-semibold text-[#111]">🇹🇿 Built for Tanzania · Swahili-first</div>
          </div>
          <div>
            <h5 className="text-[#111] text-[12px] font-bold uppercase tracking-[.08em] mb-3">Product</h5>
            <a href="#capture" className="block text-[13.5px] mb-2.5 hover:text-[#111]">How it works</a>
            <a href="#features" className="block text-[13.5px] mb-2.5 hover:text-[#111]">Features</a>
            <a href="#pricing" className="block text-[13.5px] mb-2.5 hover:text-[#111]">Pricing</a>
            <a href="#faq" className="block text-[13.5px] mb-2.5 hover:text-[#111]">FAQ</a>
          </div>
          <div>
            <h5 className="text-[#111] text-[12px] font-bold uppercase tracking-[.08em] mb-3">Get started</h5>
            <Link href="/sign-up" className="block text-[13.5px] mb-2.5 hover:text-[#111]">Start free</Link>
            <Link href="/sign-up" className="block text-[13.5px] mb-2.5 hover:text-[#111]">Open the Setup Guide</Link>
            <a href="mailto:chrispinmatiko@gmail.com" className="block text-[13.5px] mb-2.5 hover:text-[#111]">Support</a>
          </div>
          <div>
            <h5 className="text-[#111] text-[12px] font-bold uppercase tracking-[.08em] mb-3">Contact</h5>
            <a href="mailto:chrispinmatiko@gmail.com" className="block text-[13.5px] mb-2.5 hover:text-[#111] break-all">chrispinmatiko@gmail.com</a>
            <a href="tel:+255620184437" className="block text-[13.5px] mb-2.5 hover:text-[#111]">WhatsApp: +255 620 184 437</a>
            <span className="block text-[13.5px] mb-2.5">Kariakoo, Dar es Salaam</span>
          </div>
        </div>
        <div className="max-w-[1120px] mx-auto flex flex-col md:flex-row justify-between gap-3 pt-6 text-[12.5px]">
          <span className="text-[#9B9B9B]">© 2026 C-chat · 3-day free trial · 12,000 TSh/mo or save 20% yearly</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#111]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#111]">Terms of Service</Link>
            <Link href="/acceptable-use" className="hover:text-[#111]">Acceptable Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
