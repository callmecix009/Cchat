"use client";

import { useState } from "react";
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
  ["Does Cchat read all my WhatsApp?", "No. Cchat only handles customer conversations that come through your business number. Your personal chats are not touched."],
  ["What if the AI doesn't know an answer?", "It tells the customer it will check, and passes the chat to you. If you're away, it asks for the customer's name and number so you can call back."],
  ["How do payments work?", "Your customers pay you directly — M-Pesa, Tigo Pesa, Airtel Money or cash. For your Cchat subscription, you pay TSh 12,000/month (or 115,200/year) after your 3-day free trial."],
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

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen font-body text-dark">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-[900] flex items-center gap-6 px-[5vw] py-4 bg-[#081811]/95 backdrop-blur-sm border-b border-[rgba(143,240,180,.08)] transition-all">
        <div className="flex items-center gap-[9px] font-disp font-[800] text-[21px] tracking-tight text-white">
          <CchatLogo size={32} decorative className="shrink-0" />
          Cchat
        </div>
        <div className="hidden md:flex items-center gap-6 ml-auto text-[14px] font-medium text-[#B9CDBF]">
          <a href="#how" className="hover:text-lime transition-colors">How it works</a>
          <a href="#features" className="hover:text-lime transition-colors">Features</a>
          <a href="#languages" className="hover:text-lime transition-colors">Languages</a>
          <a href="#pricing" className="hover:text-lime transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-lime transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3 ml-auto md:ml-0">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-3 py-[6px] rounded-lg bg-lime2 text-[#06170D] text-[13px] font-semibold hover:bg-[#6ff0a8] transition-colors"
          >
            Start free
          </Link>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden text-white p-1 -mr-1"
            aria-label="Toggle menu"
          >
            {mobileMenu ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[899] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenu(false)} />
          <div className="absolute top-[61px] left-0 right-0 bg-[#081811] border-b border-[rgba(143,240,180,.15)] px-[5vw] py-6 space-y-4">
            {[
              { href: "#how", label: "How it works" },
              { href: "#features", label: "Features" },
              { href: "#languages", label: "Languages" },
              { href: "#pricing", label: "Pricing" },
              { href: "#faq", label: "FAQ" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenu(false)}
                className="block text-[16px] font-medium text-[#B9CDBF] hover:text-lime transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* HERO */}
      <header className="relative min-h-[680px] overflow-hidden bg-[#081811] text-[#EAF4EE]">
        {/* BACKGROUND LAYER — the actual robot image fills the hero */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-robot.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="hero-img absolute inset-0 h-full w-full object-cover object-[72%_center]"
        />
        {/* readability gradient — left side dark for text, robot stays visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#081811] via-[#081811]/80 to-[#081811]/5" />
        <div className="absolute inset-0 bg-[#081811]/70 lg:hidden" />

        {/* CONTENT LAYER — everything on the left */}
        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1200px] items-center px-[5vw] pt-[130px] pb-[80px]">
          <div className="max-w-[620px] text-center mx-auto lg:mx-0 lg:text-left">
            <span className="inline-flex items-center gap-2 text-[12.5px] font-bold tracking-[.14em] uppercase text-lime border border-[rgba(143,240,180,.3)] px-[14px] py-[6px] rounded-full bg-[rgba(143,240,180,.08)]">
              <ZapIcon size={13} /> AI — your super agent for small business
            </span>
            <h1 className="font-disp font-[800] tracking-[-.025em] mt-5 mb-[18px] leading-[1.04] text-[clamp(36px,4.4vw,58px)]">
              Turn every conversation <em className="not-italic text-lime2 relative">
                into a customer.
                <span className="absolute left-0 right-0 bottom-1 h-[10px] bg-[rgba(83,232,155,.18)] -z-10 rounded-[3px]" />
              </em>
            </h1>
            <p className="text-[#C6D8CB] text-[16.5px] max-w-[540px] mx-auto lg:mx-0 leading-[1.6]">
              Cchat answers your customers on WhatsApp — day and night, in Swahili or English.
              When a chat needs you, it comes straight to you.
            </p>
            <div className="flex gap-3 mt-[26px] mb-5 flex-wrap justify-center lg:justify-start">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-[22px] py-[13px] rounded-[10px] bg-lime2 text-[#06170D] font-semibold text-[15px] hover:bg-[#6ff0a8] transition-all hover:-translate-y-[1px]"
              >
                Start Now <ArrowIcon size={16} />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 px-[22px] py-[13px] rounded-[10px] font-semibold text-[15px] border border-[rgba(143,240,180,.35)] text-[#EAF4EE] bg-transparent hover:border-lime hover:text-lime transition-all hover:-translate-y-[1px]"
              >
                Learn More
              </a>
            </div>
            <div className="flex gap-[18px] flex-wrap justify-center lg:justify-start text-[#A8C2B1] text-[13px] font-medium">
              <span className="flex items-center gap-[6px]"><CheckIcon /> Built for Tanzania</span>
              <span className="flex items-center gap-[6px]"><CheckIcon /> Swahili-first</span>
              <span className="flex items-center gap-[6px]"><CheckIcon /> You stay in control</span>
            </div>
            <div className="text-[12.5px] text-lime font-semibold mt-4">3-day free trial · TSh 12,000/mo · save 20% yearly · cancel anytime</div>
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section className="bg-surface text-dark py-[86px] px-[5vw]" id="how">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="max-w-[640px] mb-[44px]">
              <div className="text-[12px] font-[800] tracking-[.16em] uppercase text-grn-d mb-[10px]">How it works</div>
              <h2 className="font-disp font-[800] tracking-[-.02em] leading-[1.1] text-[clamp(28px,3.4vw,42px)]">
                Set it up once. It works every day.
              </h2>
              <p className="text-muted mt-3 text-[16px]">No developers. No new hardware. About ten minutes of setup.</p>
            </div>
            <div className="flex flex-col max-w-[720px]">
              {[
                {
                  num: 1,
                  title: "Tell it about your business",
                  desc: "Answer a few simple questions about your products, prices, services and delivery rules. You do this once, in your own words.",
                  tags: ["10-minute setup", "Products & prices", "Delivery & policies"],
                  tagIcons: [null, null, null],
                },
                {
                  num: 2,
                  title: "It answers your customers",
                  desc: "Questions about price, stock or delivery get answered right away — in Swahili or English, at any hour. If it doesn't know something, it says so and passes the chat to you.",
                  tags: ["Always up to date", "Swahili-first", "Doesn't make things up"],
                  tagIcons: [null, null, null],
                },
                {
                  num: 3,
                  title: "You take over when it matters",
                  desc: "Every chat shows up in your inbox. When a customer needs a person, the AI steps aside and tells you why. Reply yourself, then let it continue.",
                  tags: ["One inbox", "You get alerted", "Full chat history"],
                  tagIcons: [null, null, null],
                },
              ].map((step, i) => (
                <Reveal key={i} delay={i * 90}>
                  <div className="grid grid-cols-[64px_1fr] gap-[22px] relative pb-10">
                    {i < 2 && (
                      <div className="absolute left-[31px] top-16 bottom-2 w-[2px]" style={{ background: "repeating-linear-gradient(to bottom, #BCE5CB 0 6px, transparent 6px 12px)" }} />
                    )}
                    <div className="w-[62px] h-[62px] rounded-[18px] bg-[#081811] text-lime2 font-disp text-[24px] font-[800] flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(11,27,18,.4)]">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-disp text-[21px] mb-[6px]">{step.title}</h3>
                      <p className="text-muted max-w-[560px]">{step.desc}</p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {step.tags.map((t, j) => (
                          <span key={j} className="text-[12px] font-semibold bg-white border border-[#D2DCD1] rounded-full px-3 py-[5px] text-grn-d flex items-center gap-[5px]">
                            {step.tagIcons[j]} {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* RIGHT — the actual vertical image, reveals on scroll */}
          <Reveal delay={150} className="hidden lg:block">
            <div className="relative w-full max-w-[420px] mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/how-it-works.jpg"
                alt="Business owner using Cchat"
                width={768}
                height={1376}
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-contain"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  el.parentElement?.style.setProperty("display", "none");
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-[#EDF2EC] text-dark py-[86px] px-[5vw]" id="features">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[640px] mb-[44px]">
            <div className="text-[12px] font-[800] tracking-[.16em] uppercase text-grn-d mb-[10px]">Features</div>
            <h2 className="font-disp font-[800] tracking-[-.02em] leading-[1.1] text-[clamp(28px,3.4vw,42px)]">
              Everything you need to handle your customers.
            </h2>
          </div>
          <div className="grid grid-cols-12 gap-[14px]">
            <Reveal className="col-span-12 lg:col-span-7">
              <div className="bg-white border border-[#E3E9E1] rounded-[16px] p-6 h-full hover:-translate-y-[3px] hover:shadow-[0_2px_4px_rgba(14,32,22,.06),0_12px_32px_-14px_rgba(14,32,22,.18)] transition-all relative overflow-hidden">
                <div className="w-10 h-[40px] rounded-[11px] bg-grn-bg text-grn-d flex items-center justify-center mb-[14px]">
                  <ZapIcon size={20} />
                </div>
                <h3 className="font-disp text-[17.5px] mb-[6px]">Keep your AI up to date</h3>
                <p className="text-muted text-[13.5px] leading-[1.55]">Update your products, prices and stock in Cchat, and your AI uses the latest information when talking to customers. Change a price once — every customer hears the new one.</p>
                <div className="flex items-center gap-[10px] mt-[18px] flex-wrap">
                  <span className="bg-surface border border-[#E3E9E1] rounded-[10px] px-[13px] py-[9px] text-[12.5px] font-semibold flex items-center gap-[7px]">3 iPhones in stock</span>
                  <span className="text-[#8B9B8F]"><ArrowIcon size={15} /></span>
                  <span className="bg-surface border border-[#E3E9E1] rounded-[10px] px-[13px] py-[9px] text-[12.5px] font-semibold">One sells...</span>
                  <span className="text-[#8B9B8F]"><ArrowIcon size={15} /></span>
                  <span className="bg-surface border border-[#E3E9E1] rounded-[10px] px-[13px] py-[9px] text-[12.5px] font-semibold">&ldquo;Kuna iPhone 13?&rdquo;</span>
                  <span className="text-[#8B9B8F]"><ArrowIcon size={15} /></span>
                  <span className="bg-grn-bg border border-grn-br rounded-[10px] px-[13px] py-[9px] text-[12.5px] font-semibold text-grn-d">&ldquo;Zimebaki 2 tu&rdquo;</span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80} className="col-span-12 lg:col-span-5">
              <div className="bg-white border border-[#E3E9E1] rounded-[16px] p-6 h-full hover:-translate-y-[3px] hover:shadow-[0_2px_4px_rgba(14,32,22,.06),0_12px_32px_-14px_rgba(14,32,22,.18)] transition-all relative overflow-hidden">
                <div className="w-10 h-[40px] rounded-[11px] bg-grn-bg text-grn-d flex items-center justify-center mb-[14px]">
                  <HandIcon size={20} />
                </div>
                <h3 className="font-disp text-[17.5px] mb-[6px]">You take over when it matters</h3>
                <p className="text-muted text-[13.5px] leading-[1.55]">Some chats need a person — a hard negotiation, an angry customer, &ldquo;let me talk to the owner&rdquo;. The AI steps aside and tells you why. You reply, and it waits until you&apos;re done.</p>
              </div>
            </Reveal>
            <Reveal delay={0} className="col-span-12 lg:col-span-4">
              <div className="bg-white border border-[#E3E9E1] rounded-[16px] p-6 h-full hover:-translate-y-[3px] hover:shadow-[0_2px_4px_rgba(14,32,22,.06),0_12px_32px_-14px_rgba(14,32,22,.18)] transition-all relative overflow-hidden">
                <div className="w-10 h-[40px] rounded-[11px] bg-grn-bg text-grn-d flex items-center justify-center mb-[14px]">
                  <GlobeIcon size={20} />
                </div>
                <h3 className="font-disp text-[17.5px] mb-[6px]">Speaks Swahili. And English.</h3>
                <p className="text-muted text-[13.5px] leading-[1.55]">Most customers get replies in Swahili. If someone writes in English, the AI switches — no restart, no confusion.</p>
              </div>
            </Reveal>
            <Reveal delay={80} className="col-span-12 lg:col-span-4">
              <div className="bg-white border border-[#E3E9E1] rounded-[16px] p-6 h-full hover:-translate-y-[3px] hover:shadow-[0_2px_4px_rgba(14,32,22,.06),0_12px_32px_-14px_rgba(14,32,22,.18)] transition-all relative overflow-hidden">
                <div className="w-10 h-[40px] rounded-[11px] bg-grn-bg text-grn-d flex items-center justify-center mb-[14px]">
                  <SparkIcon size={20} />
                </div>
                <h3 className="font-disp text-[17.5px] mb-[6px]">It helps you sell</h3>
                <p className="text-muted text-[13.5px] leading-[1.55]">It answers the questions buyers ask before they buy — and it can suggest extras, like a case with a phone, or take booking requests for repairs.</p>
              </div>
            </Reveal>
            <Reveal delay={160} className="col-span-12 lg:col-span-4">
              <div className="bg-white border border-[#E3E9E1] rounded-[16px] p-6 h-full hover:-translate-y-[3px] hover:shadow-[0_2px_4px_rgba(14,32,22,.06),0_12px_32px_-14px_rgba(14,32,22,.18)] transition-all relative overflow-hidden">
                <div className="w-10 h-[40px] rounded-[11px] bg-grn-bg text-grn-d flex items-center justify-center mb-[14px]">
                  <ShieldIcon size={20} />
                </div>
                <h3 className="font-disp text-[17.5px] mb-[6px]">Your rules, kept</h3>
                <p className="text-muted text-[13.5px] leading-[1.55]">Write your delivery fees, warranty terms and return rules once. The AI repeats them to customers the way you wrote them — no invented promises.</p>
              </div>
            </Reveal>
            <Reveal delay={0} className="col-span-12 lg:col-span-5">
              <div className="bg-white border border-[#E3E9E1] rounded-[16px] p-6 h-full hover:-translate-y-[3px] hover:shadow-[0_2px_4px_rgba(14,32,22,.06),0_12px_32px_-14px_rgba(14,32,22,.18)] transition-all relative overflow-hidden">
                <div className="w-10 h-[40px] rounded-[11px] bg-grn-bg text-grn-d flex items-center justify-center mb-[14px]">
                  <ChatIcon size={20} />
                </div>
                <h3 className="font-disp text-[17.5px] mb-[6px]">Every chat in one inbox</h3>
                <p className="text-muted text-[13.5px] leading-[1.55]">All your customer conversations in one place, searchable by name, number or word. Open any chat and pick up where it left off.</p>
              </div>
            </Reveal>
            <Reveal delay={80} className="col-span-12 lg:col-span-7">
              <div className="bg-white border border-[#E3E9E1] rounded-[16px] p-6 h-full hover:-translate-y-[3px] hover:shadow-[0_2px_4px_rgba(14,32,22,.06),0_12px_32px_-14px_rgba(14,32,22,.18)] transition-all relative overflow-hidden">
                <div className="w-10 h-[40px] rounded-[11px] bg-grn-bg text-grn-d flex items-center justify-center mb-[14px]">
                  <CardIcon size={20} />
                </div>
                <h3 className="font-disp text-[17.5px] mb-[6px]">Your money stays yours</h3>
                <p className="text-muted text-[13.5px] leading-[1.55]">
                  Customers pay you the way they always have — <b className="text-dark">M-Pesa, Tigo Pesa, Airtel Money, cash</b>. Cchat never processes or holds a payment.
                  You only pay your Cchat subscription: TSh 12,000/month.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* LANGUAGES */}
      <section className="bg-[#081811] text-[#EAF4EE] py-[86px] px-[5vw]" id="languages">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="max-w-[640px] mb-[26px]">
              <div className="text-[12px] font-[800] tracking-[.16em] uppercase text-lime2 mb-[10px]">Lugha / Language</div>
              <h2 className="font-disp font-[800] tracking-[-.02em] leading-[1.1] text-[clamp(28px,3.4vw,42px)]">
                Swahili kwanza.<br />English automatically.
              </h2>
              <p className="text-[#9DB6A7] mt-3 text-[16px]">
                Your customers just write the way they talk. The AI answers in kind — even when they switch languages mid-chat.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { n: "SW", title: "Swahili comes first", desc: "Natural, everyday Swahili — not stiff, robot Swahili. Teach it your own slang during setup." },
                { n: "EN", title: "English is automatic", desc: "If the customer writes in English, the whole conversation switches over." },
                { n: "1", title: "Or pick one language", desc: "Want Swahili only? One setting does it." },
              ].map((item, i) => (
                <div key={i} className="flex gap-[14px] items-start">
                  <span className="w-[30px] h-[30px] rounded-[9px] bg-[rgba(83,232,155,.14)] text-lime2 font-mono font-bold text-[13px] flex items-center justify-center flex-none">
                    {item.n}
                  </span>
                  <div>
                    <h4 className="text-[15.5px]">{item.title}</h4>
                    <p className="text-[#9DB6A7] text-[13.5px]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Reveal delay={120}>
            <div className="bg-[#EFE7DB] rounded-[18px] p-[22px] flex flex-col gap-[9px] shadow-[0_2px_4px_rgba(14,32,22,.06),0_12px_32px_-14px_rgba(14,32,22,.18)]">
              <span className="max-w-[80%] bg-white px-[11px] py-[7px] rounded-[11px] rounded-tl-[3px] text-[14px] leading-[1.4] shadow-[0_1px_1px_rgba(0,0,0,.09)] self-start text-dark">
                Habari! iPhone 11 iko na bei gani? <time className="block text-right text-[9px] text-black/38 mt-[2px]">10:02</time>
              </span>
              <span className="max-w-[80%] bg-[#D9FDD3] px-[11px] py-[7px] rounded-[11px] rounded-tr-[3px] text-[14px] leading-[1.4] shadow-[0_1px_1px_rgba(0,0,0,.09)] self-end text-dark">
                Habari boss! iPhone 11 64GB — TZS 720,000, tuna 3. <time className="block text-right text-[9px] text-black/38 mt-[2px]">10:02</time>
              </span>
              <span className="max-w-[80%] bg-white px-[11px] py-[7px] rounded-[11px] rounded-tl-[3px] text-[14px] leading-[1.4] shadow-[0_1px_1px_rgba(0,0,0,.09)] self-start text-dark">
                Actually, can you deliver to Mikocheni? <time className="block text-right text-[9px] text-black/38 mt-[2px]">10:03</time>
              </span>
              <span className="self-center text-[10.5px] font-[800] tracking-[.1em] uppercase text-grn-d bg-white rounded-full px-[14px] py-1 shadow-[0_1px_3px_rgba(0,0,0,.1)]">
                ⇄ switches to English instantly
              </span>
              <span className="max-w-[80%] bg-[#D9FDD3] px-[11px] py-[7px] rounded-[11px] rounded-tr-[3px] text-[14px] leading-[1.4] shadow-[0_1px_1px_rgba(0,0,0,.09)] self-end text-dark">
                Of course! Mikocheni delivery is TZS 7,000, within 2–4 hours <time className="block text-right text-[9px] text-black/38 mt-[2px]">10:03</time>
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-surface text-dark py-[86px] px-[5vw]" id="pricing">
        <div className="max-w-[1100px] mx-auto">
          <Reveal>
            <div className="border border-cborder rounded-[20px] overflow-hidden bg-[#E4EDE5] grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-8 md:col-span-2 lg:col-span-1 flex flex-col justify-center">
                <p className="mb-5 text-muted text-[12px] font-bold uppercase tracking-wider">Pricing</p>
                <h2 className="font-disp font-extrabold text-[32px] leading-[1.08] tracking-tight text-dark">
                  One plan.<br />Everything included.
                </h2>
                <p className="mt-3 text-muted text-[13.5px] leading-relaxed max-w-[300px]">
                  Start with 3 days free. No card needed.
                </p>
              </div>

              <div className="relative flex flex-col bg-white shadow-[inset_0_0_0_2px_#149A5B]">
                <span className="absolute top-0 right-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-b-[8px] bg-grn text-white text-[10.5px] font-extrabold uppercase tracking-wider">
                  Free trial
                </span>
                <div className="p-8 border-b border-[#BCE5CB] flex flex-col flex-1">
                  <p className="mb-5 text-muted text-[12px] font-bold uppercase tracking-wider">Free Trial</p>
                  <div className="mb-1 flex items-baseline gap-2">
                    <h3 className="font-disp font-extrabold text-[38px] leading-none tracking-tight text-dark">3</h3>
                    <span className="text-muted text-[12px]">days free</span>
                  </div>
                  <p className="mb-7 text-muted text-[13px]">Everything included. No card required.</p>
                  <Link href="/sign-up" className="btn wide pri mt-auto justify-center">Start free trial</Link>
                </div>
              </div>

              <div className="relative flex flex-col bg-white">
                <div className="p-8 border-b border-[#EEF2ED] flex flex-col flex-1">
                  <p className="mb-5 text-muted text-[12px] font-bold uppercase tracking-wider">Premium</p>
                  <div className="mb-1.5 flex items-baseline gap-2">
                    <h3 className="font-disp font-extrabold text-[38px] leading-none tracking-tight text-dark">12,000</h3>
                    <span className="text-muted text-[12px]">TSh / month</span>
                  </div>
                  <p className="mb-7 text-muted text-[13px]">Everything included, billed monthly. Cancel anytime.</p>
                  <Link href="/sign-up" className="btn wide ghost mt-auto justify-center">Get started</Link>
                </div>
              </div>

              <div className="relative flex flex-col bg-white">
                <span className="absolute top-0 right-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-b-[8px] bg-amb-bg text-amber-600 text-[10.5px] font-extrabold uppercase tracking-wider">
                  <CrownIcon className="w-3 h-3" /> Save 20%
                </span>
                <div className="p-8 border-b border-[#EEF2ED] flex flex-col flex-1">
                  <p className="mb-5 text-muted text-[12px] font-bold uppercase tracking-wider">Extra Premium</p>
                  <div className="mb-1 flex items-baseline gap-2">
                    <h3 className="font-disp font-extrabold text-[38px] leading-none tracking-tight text-dark">115,200</h3>
                    <span className="text-muted text-[12px]">TSh / year</span>
                  </div>
                  <p className="mb-7 text-muted text-[13px]">Same everything, billed once a year. Works out to two months free.</p>
                  <Link href="/sign-up" className="btn wide ghost mt-auto justify-center">Choose yearly</Link>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ul className="list-none mt-9 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5 max-w-[820px] mx-auto">
              {PRICING_FEATURES.map((f, i) => (
                <li key={i} className="flex gap-[10px] items-start text-[13.5px] text-dark">
                  <CheckIcon size={15} />
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-[12.5px] text-muted text-center mt-7 leading-[1.6] max-w-[540px] mx-auto">
              Every new account starts with a <b className="text-dark">3-day free trial</b>. Pay with M-Pesa, Tigo Pesa,
              Airtel Money or card. Cchat <b className="text-dark">never</b> processes your customers&apos; payments.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#EDF2EC] text-dark py-[86px] px-[5vw]" id="faq">
        <div className="max-w-[1200px] mx-auto">
          <div className="mx-auto mb-10 max-w-[640px] text-center">
            <div className="text-[12px] font-[800] tracking-[.16em] uppercase text-grn-d mb-[10px]">FAQ</div>
            <h2 className="font-disp font-[800] tracking-[-.02em] leading-[1.1] text-[clamp(28px,3.4vw,42px)]">
              Questions? Answers.
            </h2>
          </div>
          <div className="max-w-[760px] mx-auto">
            {FAQ_DATA.map(([q, a], i) => (
              <div key={i} className={`border-b border-[#D2DCD1] ${openFaq === i ? "open" : ""}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center gap-[14px] py-[19px] px-1 text-left text-[16px] font-semibold font-disp"
                >
                  {q}
                  <span className={`flex-none text-grn-d transition-transform duration-[.25s] ${openFaq === i ? "rotate-45" : ""}`}>
                    <PlusIcon size={17} />
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-[max-height] duration-300 text-muted text-[14.5px] leading-[1.65]"
                  style={{ maxHeight: openFaq === i ? "220px" : "0" }}
                >
                  <div className="px-1 pb-5">{a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050F0A] text-[#8FAA99] pt-14 pb-[30px] px-[5vw]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-9 pb-9 border-b border-[rgba(143,240,180,.1)]">
          <div>
            <div className="flex items-center gap-[9px] font-disp font-[800] text-[21px] tracking-tight mb-[14px]">
              <CchatLogo size={32} decorative className="shrink-0" />
              Cchat
            </div>
            <p className="text-[13.5px] max-w-[280px] leading-[1.6]">
              An AI assistant that answers your WhatsApp customers. Built in Dar es Salaam.
            </p>
          </div>
          <div>
            <h5 className="text-[#EAF4EE] text-[13px] uppercase tracking-[.1em] mb-[14px]">Product</h5>
            <a href="#how" className="block text-[13.5px] mb-[9px] hover:text-lime transition-colors">How it works</a>
            <a href="#features" className="block text-[13.5px] mb-[9px] hover:text-lime transition-colors">Features</a>
            <a href="#pricing" className="block text-[13.5px] mb-[9px] hover:text-lime transition-colors">Pricing</a>
            <a href="#faq" className="block text-[13.5px] mb-[9px] hover:text-lime transition-colors">FAQ</a>
          </div>
          <div>
            <h5 className="text-[#EAF4EE] text-[13px] uppercase tracking-[.1em] mb-[14px]">Get started</h5>
            <Link href="/sign-up" className="block text-[13.5px] mb-[9px] hover:text-lime transition-colors">Start free</Link>
            <Link href="/sign-up" className="block text-[13.5px] mb-[9px] hover:text-lime transition-colors">Open the Setup Guide</Link>
          </div>
          <div>
            <h5 className="text-[#EAF4EE] text-[13px] uppercase tracking-[.1em] mb-[14px]">Contact</h5>
            <a href="mailto:chrispinmatiko@gmail.com" className="block text-[13.5px] mb-[9px] hover:text-lime transition-colors">chrispinmatiko@gmail.com</a>
            <a href="tel:+255620184437" className="block text-[13.5px] mb-[9px] hover:text-lime transition-colors">WhatsApp: +255 620 184 437</a>
            <span className="block text-[13.5px] mb-[9px]">Kariakoo, Dar es Salaam</span>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto flex justify-between gap-3 pt-[22px] text-[12.5px] flex-wrap">
          <span>© 2026 Cchat · 3-day free trial · 12,000 TSh/mo or save 20% yearly</span>
          <span>Cchat never processes customer payments.</span>
        </div>
      </footer>
    </div>
  );
}
