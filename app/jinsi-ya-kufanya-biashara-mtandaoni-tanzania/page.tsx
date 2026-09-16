import type { Metadata } from "next";
import Link from "next/link";
import CchatLogo from "@/components/branding/CchatLogo";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Jinsi ya Kufanya Biashara Mtandaoni Tanzania | Mwongozo Kamili 2025/2026",
  description:
    "Jifunze jinsi ya kufanya biashara mtandaoni Tanzania, kujiajiri online bila mtaji, kufungua account ya biashara, kuuza bidhaa, na kutangaza biashara yako kwa WhatsApp na mitandao ya kijamii. Mwongozo kamili wa bure!",
  keywords: [
    "jinsi ya kufanya biashara mtandaoni",
    "biashara mtandaoni Tanzania",
    "kujiajiri mtandaoni",
    "jinsi ya kufanya biashara online free",
    "jinsi ya kufungua account ya biashara mtandaoni",
    "jinsi ya kuuza bidhaa mtandaoni",
    "jinsi ya kutangaza biashara mtandaoni",
    "jinsi ya kutangaza biashara whatsapp",
    "biashara za mtandaoni",
    "kuuza mtandaoni Tanzania",
  ],
  alternates: { canonical: "https://cchat.site/jinsi-ya-kufanya-biashara-mtandaoni-tanzania" },
  openGraph: {
    title: "Mwongozo Kamili wa Kufanya Biashara Mtandaoni Tanzania (2025/2026)",
    description:
      "Jifunze jinsi ya kufanya biashara mtandaoni Tanzania — bila mtaji, kwa WhatsApp, Instagram, Facebook na TikTok. Mwongozo kamili wa bure!",
    url: "https://cchat.site/jinsi-ya-kufanya-biashara-mtandaoni-tanzania",
    type: "article",
    locale: "sw_TZ",
    siteName: "C-chat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jinsi ya Kufanya Biashara Mtandaoni Tanzania | Mwongozo Kamili 2025",
    description:
      "Mwongozo kamili wa biashara mtandaoni Tanzania — jinsi ya kuanza bila mtaji, kuuza, na kutangaza kwa WhatsApp.",
  },
  robots: { index: true, follow: true },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Je, ninaweza kufanya biashara online free kabisa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ndiyo. Unaweza kuanza kwa kutumia WhatsApp Status yako, kujiunga na Facebook Groups za bure, na kutumia Instagram bila kulipa chochote. Utahitaji tu simu, intaneti, na bidii.",
      },
    },
    {
      "@type": "Question",
      name: "Ni bidhaa gani bora kuuza mtandaoni Tanzania?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bidhaa zinazouzwa zaidi ni: nguo na viatu, bidhaa za uzuri (skincare, makeup), vyakula vya nyumbani, electronics (simu, headphones), na huduma za kidijitali.",
      },
    },
    {
      "@type": "Question",
      name: "Jinsi ya kutangaza biashara whatsapp bila ya kuchukizwa na watu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tumia WhatsApp Status badala ya kutuma ujumbe moja kwa moja kwa kila mtu. Kwenye Groups, toa thamani kwanza kabla ya kuuza.",
      },
    },
    {
      "@type": "Question",
      name: "Ninahitaji kufungua account ya biashara mtandaoni ya benki?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kwa kuanzia, M-Pesa, Tigo Pesa, au Airtel Money inatosha. Baadaye fungua akaunti ya biashara kwa CRDB au NMB kwa mikopo na kuonekana kitaalamu.",
      },
    },
    {
      "@type": "Question",
      name: "Jinsi ya kujiajiri mtandaoni kama huna ujuzi wowote?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Anza kwa kuuza bidhaa za watu wengine (dropshipping ya ndani). Inakufundisha marketing, huduma kwa wateja, na usafirishaji bila mtaji.",
      },
    },
  ],
};

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Mwongozo Kamili wa Kufanya Biashara Mtandaoni Tanzania (2025/2026)",
  description:
    "Mwongozo kamili wa biashara mtandaoni Tanzania — jinsi ya kuanza bila mtaji, kufungua account, kuuza na kutangaza kwa WhatsApp.",
  author: { "@type": "Organization", name: "C-chat" },
  publisher: { "@type": "Organization", name: "C-chat", logo: { "@type": "ImageObject", url: "https://cchat.site/images/c-chat-logo.png" } },
  datePublished: "2025-01-01",
  dateModified: "2026-09-17",
  mainEntityOfPage: "https://cchat.site/jinsi-ya-kufanya-biashara-mtandaoni-tanzania",
  inLanguage: "sw-TZ",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#FCFCF9] text-[#111] font-body antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-[10px] border-b border-[#E9E9E7]">
        <div className="mx-auto max-w-[1120px] px-[5vw] h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-disp font-[800] text-[18px] tracking-tight text-[#111]">
            <CchatLogo size={28} decorative className="shrink-0" /> C-chat
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[12px] font-medium text-[#6B6B6B]">Mwongozo wa Biashara Mtandao</span>
            <Link href="/sign-up" className="inline-flex items-center justify-center px-4 py-1.5 rounded-[10px] bg-[#111] text-white text-[13px] font-semibold hover:bg-black">Anza Bure</Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[860px] px-[5vw] pt-6">
        <nav aria-label="Breadcrumb" className="text-[12.5px] text-[#9B9B9B]">
          <Link href="/" className="hover:text-[#111] hover:underline">Nyumbani</Link> <span className="mx-1.5 text-[#E9E9E7]">/</span>{" "}
          <Link href="/jinsi-ya-kufanya-biashara-mtandaoni-tanzania" className="hover:text-[#111] hover:underline">Mwongozo</Link> <span className="mx-1.5 text-[#E9E9E7]">/</span>{" "}
          <span className="text-[#111] font-medium">Biashara Mtandaoni</span>
        </nav>
      </div>

      <main className="mx-auto max-w-[860px] px-[5vw] pb-16">
        {/* Hero — dominant H1 */}
        <div className="pt-8 pb-6 border-b border-[#E9E9E7]">
          <span className="inline-flex items-center text-[11px] font-bold tracking-[.14em] uppercase text-[#149A5B] bg-[#E3F4E9] border border-[#BCE5CB] px-2.5 py-1 rounded-full">Mwongozo Kamili · 2025/2026 · Bure</span>
          <h1 className="font-disp font-[800] tracking-[-.03em] leading-[1.05] text-[clamp(32px,5vw,44px)] mt-4 text-[#111]">
            Mwongozo Kamili wa Kufanya Biashara Mtandaoni Tanzania
          </h1>
          <p className="text-[15px] leading-[1.7] text-[#6B6B6B] mt-4 max-w-[700px]">
            Mwongozo huu unaeleza kwa ufupi jinsi ya kuanza biashara mtandaoni, kufungua akaunti rasmi, kuuza, na kutangaza kwa WhatsApp na mitandao ya kijamii. Umeandikwa kwa Kiswahili rahisi, kwa mifano ya Tanzania.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5 text-[12.5px] text-[#6B6B6B]">
            <span className="inline-flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#111] text-white grid place-items-center text-[10px] font-bold">CC</span> C-chat · Dar es Salaam</span>
            <span className="w-1 h-1 rounded-full bg-[#E9E9E7]" />
            <time dateTime="2026-09-17">17 Sept 2026</time>
            <span className="w-1 h-1 rounded-full bg-[#E9E9E7]" />
            <span>8–12 min</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-10 mt-8 items-start">
          {/* Sidebar TOC — sticky, scannable */}
          <aside className="hidden lg:block sticky top-[72px]">
            <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
              <p className="text-[11px] font-bold tracking-[.12em] uppercase text-[#9B9B9B] mb-3">Yaliyomo</p>
              <ol className="space-y-2 text-[13px] leading-[1.6]">
                <li><a href="#overview" className="text-[#111] hover:text-[#149A5B]">Overview</a></li>
                <li><a href="#kuanza" className="text-[#111] hover:text-[#149A5B]">1. Kuanza bila mtaji</a></li>
                <li><a href="#akaunti" className="text-[#111] hover:text-[#149A5B]">2. Kufungua akaunti</a></li>
                <li><a href="#kuuza" className="text-[#111] hover:text-[#149A5B]">3. Kuuza</a></li>
                <li><a href="#kutangaza" className="text-[#111] hover:text-[#149A5B]">4. Kutangaza</a></li>
                <li><a href="#whatsapp" className="text-[#111] hover:text-[#149A5B]">5. WhatsApp</a></li>
                <li><a href="#kujiajiri" className="text-[#111] hover:text-[#149A5B]">6. Kujiajiri &amp; makosa</a></li>
                <li><a href="#faq" className="text-[#111] hover:text-[#149A5B]">Maswali</a></li>
                <li><a href="#sheria" className="text-[#111] hover:text-[#149A5B] font-semibold">Sheria na faragha</a></li>
              </ol>
              <div className="mt-5 pt-5 border-t border-[#F1F1EF]">
                <Link href="/sign-up" className="w-full inline-flex justify-center items-center gap-2 px-3 py-2 rounded-[10px] bg-[#111] text-white text-[13px] font-semibold hover:bg-black">Fungua C-chat <Icon name="arrow" size={13} /></Link>
                <p className="text-[11px] text-[#9B9B9B] mt-2 text-center">Siku 3 bure · hakuna kadi</p>
              </div>
            </div>
          </aside>

          <article className="min-w-0">
            {/* Overview — What is this? */}
            <section id="overview" className="scroll-mt-24">
              <h2 className="font-disp font-[700] text-[22px] tracking-tight text-[#111]">Overview</h2>
              <p className="text-[14.5px] leading-[1.75] text-[#2B2B2B] mt-3">
                Mwongozo huu ni kwa mtu anayetaka kuanza au kukuza biashara mtandaoni Tanzania. Hautahitaji mtaji mkubwa wala ofisi.
              </p>
              <p className="text-[14.5px] leading-[1.75] text-[#6B6B6B] mt-3">
                Utajifunza kuchagua nini cha kuuza, wapi kuwauzia wateja, na jinsi ya kuwasiliana nao kwa WhatsApp na mitandao ya kijamii — kisha kuuza na kutangaza kwa njia za bure na za kulipia.
              </p>
              <div className="mt-5 bg-white border border-[#E9E9E7] rounded-[12px] p-4">
                <p className="text-[12px] font-bold tracking-[.08em] uppercase text-[#9B9B9B]">Utajifunza</p>
                <ul className="mt-2 grid sm:grid-cols-2 gap-2 text-[13px] leading-[1.6] text-[#111]">
                  <li className="flex gap-2"><Icon name="check" size={14} className="text-[#149A5B] mt-0.5 shrink-0" /> Kuanza bila mtaji</li>
                  <li className="flex gap-2"><Icon name="check" size={14} className="text-[#149A5B] mt-0.5 shrink-0" /> Kufungua akaunti rasmi</li>
                  <li className="flex gap-2"><Icon name="check" size={14} className="text-[#149A5B] mt-0.5 shrink-0" /> Kuuza kwa picha na maelezo sahihi</li>
                  <li className="flex gap-2"><Icon name="check" size={14} className="text-[#149A5B] mt-0.5 shrink-0" /> Kutangaza kwa WhatsApp</li>
                </ul>
              </div>
            </section>

            {/* How it works — short explanation */}
            <section className="mt-10">
              <h2 className="font-disp font-[700] text-[18px] text-[#111]">How it works</h2>
              <div className="mt-3 grid sm:grid-cols-3 gap-3">
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-4">
                  <span className="w-7 h-7 rounded-[8px] bg-[#111] text-white grid place-items-center text-[11px] font-bold">1</span>
                  <p className="text-[13px] font-semibold text-[#111] mt-2">Andaa msingi</p>
                  <p className="text-[12.5px] leading-[1.6] text-[#6B6B6B] mt-1">Chagua bidhaa/huduma na tambua wateja wako.</p>
                </div>
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-4">
                  <span className="w-7 h-7 rounded-[8px] bg-[#111] text-white grid place-items-center text-[11px] font-bold">2</span>
                  <p className="text-[13px] font-semibold text-[#111] mt-2">Fungua akaunti</p>
                  <p className="text-[12.5px] leading-[1.6] text-[#6B6B6B] mt-1">WhatsApp Business, Instagram, Facebook, TikTok.</p>
                </div>
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-4">
                  <span className="w-7 h-7 rounded-[8px] bg-[#111] text-white grid place-items-center text-[11px] font-bold">3</span>
                  <p className="text-[13px] font-semibold text-[#111] mt-2">Uza na tangaza</p>
                  <p className="text-[12.5px] leading-[1.6] text-[#6B6B6B] mt-1">Picha nzuri, maelezo mafupi, majibu ya haraka.</p>
                </div>
              </div>
            </section>

            {/* Sura 1 */}
            <span id="sura-1" className="block h-0 overflow-hidden" aria-hidden="true" />
            <section id="kuanza" className="mt-12 scroll-mt-24">
              <h2 className="font-disp font-[700] text-[22px] tracking-tight text-[#111]">1. Kuanza bila mtaji</h2>
              <p className="text-[14.5px] leading-[1.7] text-[#6B6B6B] mt-2">Huhitaji kununua bidhaa nyingi kuanza. Tumia zana za bure kwenye simu yako.</p>

              <div className="mt-5 grid gap-4">
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                  <h3 className="font-disp font-[600] text-[15px] text-[#111]">A. Mwakala wa mauzo</h3>
                  <p className="text-[13px] leading-[1.6] text-[#6B6B6B] mt-1">Chukua picha za bidhaa kutoka Kariakoo au Karume, tangaza kwenye Status na Groups. Mteja akipatikana, nunua na tuma — baki na faida.</p>
                </div>
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                  <h3 className="font-disp font-[600] text-[15px] text-[#111]">B. Huduma za kidijitali</h3>
                  <p className="text-[13px] leading-[1.6] text-[#6B6B6B] mt-1">Kuandika, kutengeneza picha au video, kutafsiri. Tafuta wateja kwenye mitandao au Fiverr/Upwork.</p>
                </div>
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                  <h3 className="font-disp font-[600] text-[15px] text-[#111]">C. Kuuza ujuzi</h3>
                  <p className="text-[13px] leading-[1.6] text-[#6B6B6B] mt-1">Mwalimu au mtaalamu? Fungua group ya WhatsApp/Telegram ya mafunzo ya kulipia.</p>
                </div>
              </div>

              <div className="mt-6 bg-[#FCFCF9] border border-[#E9E9E7] rounded-[12px] p-4">
                <h3 className="font-disp font-[600] text-[14px] text-[#111]">Hatua za kwanza</h3>
                <ol className="list-decimal pl-5 mt-2 space-y-1.5 text-[13px] leading-[1.6] text-[#2B2B2B]">
                  <li><b>Ninauza nini?</b> Bidhaa au huduma gani.</li>
                  <li><b>Wateja ni nani?</b> Wanafunzi, mama, wafanyabiashara, vijana.</li>
                  <li><b>Wako wapi?</b> WhatsApp, Instagram, TikTok, Facebook Groups.</li>
                </ol>
              </div>
            </section>

            {/* Sura 2 */}
            <span id="sura-2" className="block h-0 overflow-hidden" aria-hidden="true" />
            <section id="akaunti" className="mt-12 scroll-mt-24">
              <h2 className="font-disp font-[700] text-[22px] tracking-tight text-[#111]">2. Kufungua akaunti ya biashara</h2>
              <p className="text-[14.5px] leading-[1.7] text-[#6B6B6B] mt-2">Akaunti rasmi inaongeza uaminifu. Tumia majina na picha zinazofanana kila mahali.</p>

              <h3 className="font-disp font-[600] text-[16px] text-[#111] mt-6 flex items-center gap-2"><Icon name="whatsapp" size={16} className="text-[#25D366]" /> WhatsApp Business</h3>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-[13px] leading-[1.6] text-[#2B2B2B]">
                <li>Pakua <b>WhatsApp Business</b> kutoka Play Store/App Store.</li>
                <li>Weka jina la biashara, logo, na maelezo mafupi.</li>
                <li>Pakia <b>Catalog</b>: picha, bei na maelezo.</li>
                <li>Weka <b>Auto-reply</b> na <b>Away message</b>.</li>
              </ol>
              <div className="mt-3 rounded-[10px] bg-[#E3F4E9] border border-[#BCE5CB] px-3 py-2.5 text-[12.5px] leading-[1.6] text-[#0F5132]">
                <b>C-chat:</b> Catalog ukisabadilika, majibu ya AI hubadilika papo hapo. <Link href="/sign-up" className="underline font-semibold">Anza bure</Link>
              </div>

              <h3 className="font-disp font-[600] text-[16px] text-[#111] mt-6">Instagram Business</h3>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-[13px] leading-[1.6] text-[#2B2B2B]">
                <li>Instagram → Settings → Account → Switch to Professional → Business.</li>
                <li>Unganisha na Facebook Page.</li>
                <li>Weka bio fupi: huduma, mikoa unayotuma, namba ya WhatsApp.</li>
              </ol>

              <h3 className="font-disp font-[600] text-[16px] text-[#111] mt-6">Facebook Page na Group</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-[13px] leading-[1.6] text-[#2B2B2B]">
                <li>Create Page → Business or Brand → jina, cover, post kila siku.</li>
                <li>Jiunge na Groups: Wauzaji wa Mtandaoni Tanzania, Biashara za Mama Nyingi TZ.</li>
              </ul>

              <h3 className="font-disp font-[600] text-[16px] text-[#111] mt-6">TikTok Business</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-[13px] leading-[1.6] text-[#2B2B2B]">
                <li>Profile → Settings → Manage Account → Switch to Business.</li>
                <li>Weka bio na link ya WhatsApp. Chapisha video 15–60s za bidhaa na maoni ya wateja.</li>
              </ul>
            </section>

            {/* Sura 3 */}
            <span id="sura-3" className="block h-0 overflow-hidden" aria-hidden="true" />
            <section id="kuuza" className="mt-12 scroll-mt-24">
              <h2 className="font-disp font-[700] text-[22px] tracking-tight text-[#111]">3. Kuuza bidhaa mtandaoni</h2>
              <p className="text-[14.5px] leading-[1.7] text-[#6B6B6B] mt-2">Mteja hawezi kugusa bidhaa. Picha na maelezo ndivyo muuzaji wako.</p>

              <div className="mt-5 grid gap-4">
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                  <h3 className="font-disp font-[600] text-[14px] text-[#111]">Picha na video</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-[13px] leading-[1.6] text-[#2B2B2B]">
                    <li>Mwanga wa asili karibu na dirisha.</li>
                    <li>Video fupi 15–30s: bidhaa inafunguliwa au inatumika.</li>
                    <li>Background safi, picha kali.</li>
                  </ul>
                </div>
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                  <h3 className="font-disp font-[600] text-[14px] text-[#111]">Maelezo (copywriting)</h3>
                  <p className="text-[13px] leading-[1.6] text-[#6B6B6B] mt-1">Badala ya “Shati Tsh 15,000”, andika hali na faida, kisha wito wa kuchukua hatua.</p>
                  <blockquote className="mt-3 border-l-2 border-[#E9E9E7] pl-3 text-[13px] leading-[1.6] text-[#6B6B6B] italic">“Shati la cotton kwa ofisi — rangi 3, bei 15,000. Tuma WhatsApp kabla ya kuisha.”</blockquote>
                </div>
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                  <h3 className="font-disp font-[600] text-[14px] text-[#111]">Urgency na huduma</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-[13px] leading-[1.6] text-[#2B2B2B]">
                    <li>Onyesha upungufu: “Zimebaki 5 tu” au “Ofa inaisha leo saa 12 jioni”.</li>
                    <li>Jibu ndani ya dakika 5–15. Fuatilia baada ya siku 2–3 na punguzo la shukrani.</li>
                  </ul>
                </div>
              </div>
              <p className="text-[13px] leading-[1.6] text-[#6B6B6B] mt-4"><b className="text-[#111]">Malipo:</b> M-Pesa, Tigo Pesa, Airtel Money, HaloPesa. <b className="text-[#111]">Usafiri:</b> bodaboda, basi mikoani, au Bolt/Uber ndani ya jiji.</p>
            </section>

            {/* Sura 4 */}
            <span id="sura-4" className="block h-0 overflow-hidden" aria-hidden="true" />
            <section id="kutangaza" className="mt-12 scroll-mt-24">
              <h2 className="font-disp font-[700] text-[22px] tracking-tight text-[#111]">4. Kutangaza biashara</h2>
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                  <h3 className="font-disp font-[600] text-[14px] text-[#111]">Bure — Zero budget</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1.5 text-[13px] leading-[1.6] text-[#2B2B2B]">
                    <li><b>Status na Groups:</b> chapisha asubuhi/mchana/jioni. Jiunge na group links za biashara, usifanye spam.</li>
                    <li><b>Hashtags:</b> #BiasharaMtandaoni #MadeInTanzania #Kariakoo #DarEsSalaam.</li>
                    <li><b>Collaboration:</b> fanya Live pamoja na muuzaji wa bidhaa inayokamilishana.</li>
                    <li><b>Testimonials:</b> screenshot ya “Asante, nimeipenda” (ficha jina kama ajali).</li>
                  </ul>
                </div>
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                  <h3 className="font-disp font-[600] text-[14px] text-[#111]">Kulipia</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1.5 text-[13px] leading-[1.6] text-[#2B2B2B]">
                    <li><b>Facebook/Instagram Ads:</b> hata 5,000 kwa siku — target umri, mji, interest.</li>
                    <li><b>TikTok Promote:</b> inafaa kwa fashion, uzuri, chakula.</li>
                    <li><b>Broadcast List:</b> ujumbe 1 kwa watu 256, kila mtu anaona kama peke yake.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sura 5 */}
            <span id="sura-5" className="block h-0 overflow-hidden" aria-hidden="true" />
            <section id="whatsapp" className="mt-12 scroll-mt-24">
              <h2 className="font-disp font-[700] text-[22px] tracking-tight text-[#111]">5. Kutangaza kwa WhatsApp</h2>
              <p className="text-[14.5px] leading-[1.7] text-[#6B6B6B] mt-2">WhatsApp ndiyo duka kubwa. Tumia Features zote, usitume ovyo.</p>
              <div className="mt-5 bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                <ul className="space-y-3 text-[13px] leading-[1.6] text-[#2B2B2B]">
                  <li className="flex gap-3"><span className="w-6 h-6 rounded-[7px] bg-[#F7F7F5] border border-[#E9E9E7] grid place-items-center text-[11px] font-bold shrink-0">1</span><span><b>Catalog, Labels, Quick Replies:</b> panga bidhaa, weka lebo (Mpya, VIP), unda majibu ya “Bei gani?”, “Mnatuma mkoani?”.</span></li>
                  <li className="flex gap-3"><span className="w-6 h-6 rounded-[7px] bg-[#F7F7F5] border border-[#E9E9E7] grid place-items-center text-[11px] font-bold shrink-0">2</span><span><b>Flash sale ya wikendi:</b> tuma Ijumaa/Jumamosi kwa Broadcast. Mfano: “Shati 20,000 leo 12,000 — hadi saa 12 jioni, 10 tu.”</span></li>
                  <li className="flex gap-3"><span className="w-6 h-6 rounded-[7px] bg-[#F7F7F5] border border-[#E9E9E7] grid place-items-center text-[11px] font-bold shrink-0">3</span><span><b>Voice/Video notes:</b> sekunde 30 za shukrani au bidhaa mpya — inajenga uaminifu.</span></li>
                  <li className="flex gap-3"><span className="w-6 h-6 rounded-[7px] bg-[#F7F7F5] border border-[#E9E9E7] grid place-items-center text-[11px] font-bold shrink-0">4</span><span><b>VIP group:</b> wateja wa mara 2–3 — ofa mapema, punguzo, majibu haraka.</span></li>
                </ul>
                <div className="mt-4 rounded-[10px] bg-[#FFF7F7] border border-[#F0C4C4] px-3 py-2.5 text-[12.5px] leading-[1.6] text-[#8E2F2F]">
                  <b>Tahadhari:</b> GB WhatsApp / FM WhatsApp si rasmi — inaweza kufunga namba yako. Usihifadhi taarifa nyeti humo.
                </div>
              </div>
            </section>

            {/* Sura 6 & 7 */}
            <span id="sura-6" className="block h-0 overflow-hidden" aria-hidden="true" />
            <section id="kujiajiri" className="mt-12 scroll-mt-24">
              <h2 className="font-disp font-[700] text-[22px] tracking-tight text-[#111]">6. Kujiajiri na kuepuka makosa</h2>
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                  <h3 className="font-disp font-[600] text-[14px] text-[#111]">Mazoea ya kila siku</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-[13px] leading-[1.6] text-[#2B2B2B]">
                    <li>Weka malengo: posts 3, jibu ndani ya dk 10, broadcast kwa 50.</li>
                    <li>Jifunze kila siku — video za marketing, makala, wafanyabiashara wa Tanzania.</li>
                    <li>Rekodi pesa kwa Excel: ingizo na matumizi.</li>
                    <li>Jenga network — makundi ya biashara.</li>
                    <li>Usikate tamaa: 1 kwa wiki → 1 kwa siku → 10 kwa siku.</li>
                  </ul>
                </div>
                <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5">
                  <h3 className="font-disp font-[600] text-[14px] text-[#111]">Makosa ya kuepuka</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-[13px] leading-[1.6] text-[#2B2B2B]">
                    <li>Kuchelewa kujibu — saa 6 bila jibu = mteja ameenda.</li>
                    <li>Post bila wito: kila post iwe na “Tuma WhatsApp”.</li>
                    <li>Kushindana kwa bei tu — shindana kwa ubora na uaminifu.</li>
                    <li>Kupuuza maoni — ndiyo market research ya bure.</li>
                    <li>Kutotumia VPN kujifunza masoko ya Kenya/Uganda/Ulaya.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mt-12 scroll-mt-24">
              <h2 className="font-disp font-[700] text-[22px] tracking-tight text-[#111]">Maswali yanayoulizwa mara kwa mara</h2>
              <div className="mt-4 space-y-3">
                <details className="group bg-white border border-[#E9E9E7] rounded-[12px] p-4 open:bg-[#FCFCF9]">
                  <summary className="list-none flex justify-between items-center gap-3 cursor-pointer font-semibold text-[14px] text-[#111]">Je, ninaweza kufanya biashara online free kabisa? <span className="shrink-0 w-6 h-6 rounded-full border border-[#E9E9E7] grid place-items-center text-[#6B6B6B] group-open:rotate-45 transition-transform">+</span></summary>
                  <p className="text-[13px] leading-[1.7] text-[#6B6B6B] mt-3">Ndiyo. WhatsApp Status, Facebook Groups na Instagram ni bure. Unahitaji simu, intaneti na bidii tu.</p>
                </details>
                <details className="group bg-white border border-[#E9E9E7] rounded-[12px] p-4 open:bg-[#FCFCF9]">
                  <summary className="list-none flex justify-between items-center gap-3 cursor-pointer font-semibold text-[14px] text-[#111]">Ni bidhaa gani bora kuuza? <span className="shrink-0 w-6 h-6 rounded-full border border-[#E9E9E7] grid place-items-center text-[#6B6B6B] group-open:rotate-45 transition-transform">+</span></summary>
                  <p className="text-[13px] leading-[1.7] text-[#6B6B6B] mt-3">Nguo/viatu, uzuri, vyakula vya nyumbani, electronics na huduma za kidijitali.</p>
                </details>
                <details className="group bg-white border border-[#E9E9E7] rounded-[12px] p-4 open:bg-[#FCFCF9]">
                  <summary className="list-none flex justify-between items-center gap-3 cursor-pointer font-semibold text-[14px] text-[#111]">Jinsi ya kutangaza WhatsApp bila spam? <span className="shrink-0 w-6 h-6 rounded-full border border-[#E9E9E7] grid place-items-center text-[#6B6B6B] group-open:rotate-45 transition-transform">+</span></summary>
                  <p className="text-[13px] leading-[1.7] text-[#6B6B6B] mt-3">Tumia Status. Groups: toa thamani kwanza, kisha uza. Usitume kwa watu wasiokuruhusu.</p>
                </details>
                <details className="group bg-white border border-[#E9E9E7] rounded-[12px] p-4 open:bg-[#FCFCF9]">
                  <summary className="list-none flex justify-between items-center gap-3 cursor-pointer font-semibold text-[14px] text-[#111]">Nihitaji akaunti ya benki? <span className="shrink-0 w-6 h-6 rounded-full border border-[#E9E9E7] grid place-items-center text-[#6B6B6B] group-open:rotate-45 transition-transform">+</span></summary>
                  <p className="text-[13px] leading-[1.7] text-[#6B6B6B] mt-3">M-Pesa/Tigo Pesa/Airtel Money inatosha mwanzo. Ukikua, fungua akaunti ya biashara CRDB/NMB.</p>
                </details>
                <details className="group bg-white border border-[#E9E9E7] rounded-[12px] p-4 open:bg-[#FCFCF9]">
                  <summary className="list-none flex justify-between items-center gap-3 cursor-pointer font-semibold text-[14px] text-[#111]">Sina ujuzi — nitajiajiri vipi? <span className="shrink-0 w-6 h-6 rounded-full border border-[#E9E9E7] grid place-items-center text-[#6B6B6B] group-open:rotate-45 transition-transform">+</span></summary>
                  <p className="text-[13px] leading-[1.7] text-[#6B6B6B] mt-3">Anza kama mwakala wa mauzo. Inafundisha marketing na huduma bila mtaji.</p>
                </details>
              </div>
            </section>

            {/* Hitimisho */}
            <section className="mt-12">
              <h2 className="font-disp font-[700] text-[22px] tracking-tight text-[#111]">Anza leo</h2>
              <p className="text-[14.5px] leading-[1.7] text-[#2B2B2B] mt-3"><b>Biashara mtandaoni ni fursa ya kila siku Tanzania.</b> Anza na ulichonacho — WhatsApp Business, picha 1, Status 1.</p>
              <p className="text-[14.5px] leading-[1.7] text-[#6B6B6B] mt-2">Safari ya maili elfu huanza kwa hatua moja.</p>
              <div className="mt-6 rounded-[16px] border border-[#149A5B] bg-[#F0FFF4] p-6 text-center">
                <h3 className="font-disp font-bold text-[18px] text-[#111]">Tayari kuanza?</h3>
                <p className="text-[13px] text-[#6B6B6B] mt-1">C-chat hujibu WhatsApp kwa Kiswahili — bei na stock vikibadilika, majibu hubadilika.</p>
                <Link href="/sign-up" className="mt-3 inline-flex items-center justify-center px-5 py-2.5 rounded-[10px] bg-[#149A5B] text-white text-[13px] font-semibold hover:bg-[#0E7A47]">Fungua C-chat Bure</Link>
                <p className="text-[11px] text-[#9B9B9B] mt-2">TZS 15,000/mo baada ya trial · Ghairi wakati wowote</p>
              </div>
            </section>

            {/* Legal — central location for Terms/Privacy/Acceptable Use */}
            <section id="sheria" className="mt-14 scroll-mt-24 border-t border-[#E9E9E7] pt-10">
              <h2 className="font-disp font-[700] text-[20px] tracking-tight text-[#111]">Mwongozo wa Biashara Mtandao — Sheria na Faragha</h2>
              <p className="text-[13px] leading-[1.6] text-[#6B6B6B] mt-2">Hati zote za kisheria zipo hapa — mahali pamoja. Chagua hati hapa chini. Hii ndiyo source of truth; kurasa za zamani zinaelekeza hapa.</p>
              <div className="mt-4 grid gap-3">
                <a href="#terms" className="flex items-center justify-between gap-3 bg-white border border-[#E9E9E7] rounded-[12px] p-4 hover:border-[#111] hover:bg-[#F7F7F5]">
                  <span className="flex items-center gap-3"><span className="w-8 h-8 rounded-[9px] bg-[#F7F7F5] border border-[#E9E9E7] grid place-items-center"><Icon name="book" size={14} /></span><span><b className="text-[13px] text-[#111]">Terms of Service</b><span className="block text-[12px] text-[#6B6B6B]">Sheria za matumizi ya C-chat</span></span></span>
                  <Icon name="arrow" size={14} className="text-[#9B9B9B]" />
                </a>
                <a href="#privacy" className="flex items-center justify-between gap-3 bg-white border border-[#E9E9E7] rounded-[12px] p-4 hover:border-[#111] hover:bg-[#F7F7F5]">
                  <span className="flex items-center gap-3"><span className="w-8 h-8 rounded-[9px] bg-[#F7F7F5] border border-[#E9E9E7] grid place-items-center"><Icon name="shield" size={14} /></span><span><b className="text-[13px] text-[#111]">Privacy Policy</b><span className="block text-[12px] text-[#6B6B6B]">Jinsi tunavyokusanya na kulinda taarifa</span></span></span>
                  <Icon name="arrow" size={14} className="text-[#9B9B9B]" />
                </a>
                <a href="#acceptable-use" className="flex items-center justify-between gap-3 bg-white border border-[#E9E9E7] rounded-[12px] p-4 hover:border-[#111] hover:bg-[#F7F7F5]">
                  <span className="flex items-center gap-3"><span className="w-8 h-8 rounded-[9px] bg-[#F7F7F5] border border-[#E9E9E7] grid place-items-center"><Icon name="alert" size={14} /></span><span><b className="text-[13px] text-[#111]">Acceptable Use Policy</b><span className="block text-[12px] text-[#6B6B6B]">Matumizi yanayoruhusiwa na yaliyokatazwa</span></span></span>
                  <Icon name="arrow" size={14} className="text-[#9B9B9B]" />
                </a>
              </div>

              {/* Inline legal content — no duplicate routes */}
              <div className="mt-8 space-y-8">
                <article id="terms" className="scroll-mt-28 bg-white border border-[#E9E9E7] rounded-[16px] p-6">
                  <h3 className="font-disp font-[700] text-[18px] text-[#111]">Terms of Service</h3>
                  <p className="text-[12px] text-[#9B9B9B] mt-1">Last updated: 26 Aug 2026 · Inapatikana pia kwenye <Link href="/terms" className="underline hover:text-[#111]">/terms</Link> (inaelekeza hapa)</p>
                  <div className="prose prose-sm max-w-none mt-4 text-[13px] leading-[1.7] text-[#2B2B2B]">
                    <p><b>1. Introduction:</b> Kwa kutengeneza akaunti au kutumia C-chat, unakubali Terms hizi. Usipokubali, usitumie huduma.</p>
                    <p><b>2. Eligibility:</b> Lazima uwe na miaka 18+, taarifa sahihi, na uwe mwakilishi halali wa biashara.</p>
                    <p><b>3. Account:</b> Unawajibika kulinda akaunti yako na shughuli zote chini yake.</p>
                    <p><b>4. Service:</b> AI agent, inbox, catalog, sera, WhatsApp, analytics. Tunaweza kubadilisha vipengele kwa taarifa.</p>
                    <p><b>5. Data yako:</b> Unamiliki data yako. Unatupa leseni ya kuchakata tu kwa ajili ya huduma.</p>
                    <p><b>6. Acceptable Use:</b> Usitume spam/udanganyifu. Soma <a href="#acceptable-use" className="underline">Acceptable Use Policy</a>.</p>
                    <p><b>7. Fees:</b> Malipo ni 15,000/mo au 144,000/year (20% saving). Inajirudia kila mwezi/mwaka hadi ughairi. Kughairi = mwisho wa kipindi.</p>
                    <p><b>8. Intellectual Property:</b> C-chat, vipengele na muundo ni mali ya C-chat, inalindwa na hakimiliki na alama za biashara. Usinakili, kubadilisha au kufanya reverse-engineering bila ruhusa ya maandishi.</p>
                    <p><b>9. Third-Party Services:</b> Kuunganisha WhatsApp ni kwa sera za mtoa huduma husika (Meta). C-chat haiwajibiki kwa upatikanaji au utendaji wa huduma za nje.</p>
                    <p><b>10. Disclaimer:</b> Huduma inatolewa &quot;kama ilivyo&quot; bila dhamana — hatutoi dhamana ya kutokuwa na hitilafu au usalama kamili.</p>
                    <p><b>11. Liability:</b> Kwa kiwango cha juu kinachoruhusiwa na sheria, C-chat haiwajibiki kwa hasara zisizo za moja kwa moja au hasara ya faida/data. Dhima yetu ni kiwango ulicholipa miezi 12 iliyopita au $100.</p>
                    <p><b>12. Indemnification:</b> Unakubali kulinda C-chat dhidi ya madai kutokana na matumizi yako, ukiukaji wa Terms, sheria, au haki za wengine.</p>
                    <p><b>13. Termination:</b> Tunaweza kusitisha ufikiaji kwa tabia inayokiuka Terms; haki ya matumizi inaisha mara moja, data inahifadhiwa kulingana na Privacy Policy.</p>
                    <p><b>14. Governing Law:</b> Sheria ya Tanzania; mizozo katika mahakama za Tanzania isipokuwa imekubaliwa vingine kwa maandishi.</p>
                    <p><b>15. Amendments:</b> Tunaweza kusasisha Terms kwa taarifa ya email au ndani ya huduma; kuendelea kutumia ni kukubali mabadiliko.</p>
                    <p><b>16. Contact:</b> chrispinmatiko@gmail.com</p>
                  </div>
                </article>

                <article id="privacy" className="scroll-mt-28 bg-white border border-[#E9E9E7] rounded-[16px] p-6">
                  <h3 className="font-disp font-[700] text-[18px] text-[#111]">Privacy Policy</h3>
                  <p className="text-[12px] text-[#9B9B9B] mt-1">Last updated: 26 Aug 2026 · <Link href="/privacy" className="underline hover:text-[#111]">/privacy</Link> inaelekeza hapa</p>
                  <div className="prose prose-sm max-w-none mt-4 text-[13px] leading-[1.7] text-[#2B2B2B]">
                    <p><b>Tunachokusanya:</b> jina, email, simu; wasifu wa biashara, bidhaa/huduma na sera; majina/namba na ujumbe wa wateja; WhatsApp; Clerk auth; malipo (kupitia mtoa huduma, hatuhifadhi kadi); IP, browser, logs, cookies.</p>
                    <p><b>Matumizi:</b> akaunti, kutoa huduma, kuunganisha WhatsApp, AI replies, inbox, usimamizi wa bidhaa, malipo, usalama, na mawasiliano.</p>
                    <p><b>AI:</b> ujumbe na taarifa muhimu tu ndizo zinatumwa kwa AI provider. Hatutumii data yako kufundisha model za public.</p>
                    <p><b>Sharing:</b> hatuuzi data. Tunashiriki na hosting, DB, Clerk, malipo, AI, WhatsApp tu inapohitajika.</p>
                    <p><b>Haki zako (PDPA 2022 Tanzania):</b> kupata, kusahihisha, kufuta, kuondoa consent, kupinga, kulalamika — wasiliana: chrispinmatiko@gmail.com.</p>
                  </div>
                </article>

                <article id="acceptable-use" className="scroll-mt-28 bg-white border border-[#E9E9E7] rounded-[16px] p-6">
                  <h3 className="font-disp font-[700] text-[18px] text-[#111]">Acceptable Use Policy</h3>
                  <p className="text-[12px] text-[#9B9B9B] mt-1">Last updated: 26 Aug 2026 · <Link href="/acceptable-use" className="underline hover:text-[#111]">/acceptable-use</Link> inaelekeza hapa</p>
                  <div className="prose prose-sm max-w-none mt-4 text-[13px] leading-[1.7] text-[#2B2B2B]">
                    <p><b>Kanuni:</b> tumia kwa mujibu wa sheria za Tanzania, ulinzi wa data, na sera za WhatsApp.</p>
                    <p><b>Hairuhusiwi:</b> spam, phishing, udanganyifu, kujifanya mtu mwingine, maudhui ya chuki/hatari, malware, kupenya mfumo, kuzunguka rate-limit, resell bila ruhusa.</p>
                    <p><b>Ridhia ya wateja:</b> lazima uwe na consent, heshimu opt-out, toa taarifa sahihi za bidhaa/sera.</p>
                    <p><b>AI:</b> fuatilia majibu ya moja kwa moja na hakiki au sahihisha inapohitajika, usizalishe spam. Tunaweza kuzuia maudhui yanayokiuka.</p>
                    <p><b>Utekelezaji:</b> onyo, kusitisha muda, kufunga akaunti, kuripoti kwa mamlaka. Ripoti: chrispinmatiko@gmail.com.</p>
                  </div>
                </article>
              </div>
              <p className="text-[12px] text-[#9B9B9B] mt-4 text-center">Hati hizi ni kwa taarifa tu, si ushauri wa kisheria. Wasiliana na mwanasheria kwa ushauri mahususi.</p>
            </section>

            <div className="mt-8 flex flex-wrap gap-2 text-[12px]">
              <Link href="/" className="px-3 py-1.5 rounded-full bg-white border border-[#E9E9E7] hover:bg-[#F7F7F5]">← Nyumbani</Link>
              <a href="#overview" className="px-3 py-1.5 rounded-full bg-white border border-[#E9E9E7] hover:bg-[#F7F7F5]">Juu</a>
            </div>
          </article>
        </div>
      </main>

      <footer className="border-t border-[#E9E9E7] bg-white py-8 mt-8">
        <div className="mx-auto max-w-[860px] px-[5vw] text-center text-[12px] text-[#9B9B9B]">
          <p>© 2026 C-chat · Mwongozo huu ni bure · Imeandikwa Dar es Salaam</p>
          <p className="mt-2">Maswali? <a href="mailto:chrispinmatiko@gmail.com" className="underline hover:text-[#111]">chrispinmatiko@gmail.com</a> · WhatsApp: <a href="tel:+255620184437" className="underline hover:text-[#111]">+255 620 184 437</a></p>
          <p className="mt-2"><Link href="/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#sheria" className="underline hover:text-[#111]">Sheria na Faragha</Link> — <Link href="/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#terms" className="underline hover:text-[#111]">Terms</Link> · <Link href="/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#privacy" className="underline hover:text-[#111]">Privacy</Link> · <Link href="/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#acceptable-use" className="underline hover:text-[#111]">Acceptable Use</Link></p>
        </div>
      </footer>
    </div>
  );
}
