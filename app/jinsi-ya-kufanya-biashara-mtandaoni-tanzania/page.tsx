import type { Metadata } from "next";
import Link from "next/link";
import CchatLogo from "@/components/branding/CchatLogo";

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
        text: "Bidhaa zinazouzwa zaidi ni: nguo na viatu, bidhaa za uzuri (skincare, makeup), vyakula vya nyumbani (vikaka, samosa, cakes), electronics (simu, headphones), na huduma za kidijitali (graphic design, writing).",
      },
    },
    {
      "@type": "Question",
      name: "Jinsi ya kutangaza biashara whatsapp bila ya kuchukizwa na watu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tumia WhatsApp Status badala ya kutuma ujumbe moja kwa moja kwa kila mtu. Kwenye Groups, toa thamani kwanza kabla ya kuuza. Usitume ujumbe mmoja kwa watu wengi ambao hawajakuruhusu (hii ni spam).",
      },
    },
    {
      "@type": "Question",
      name: "Ninahitaji kufungua account ya biashara mtandaoni ya benki?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kwa kuanzia, M-Pesa, Tigo Pesa, au Airtel Money inatosha. Lakini biashara yako ikikua, ni vizuri kufungua akaunti ya benki ya biashara (kama CRDB, NMB) ili kupata mikopo na kuonekana mtaalamu zaidi.",
      },
    },
    {
      "@type": "Question",
      name: "Jinsi ya kujiajiri mtandaoni kama huna ujuzi wowote?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Anza kwa kuuza bidhaa za watu wengine (dropshipping ya ndani). Hii inakufundisha marketing, customer service, na logistics bila kuhitaji mtaji.",
      },
    },
  ],
};

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Mwongozo Kamili wa Kufanya Biashara Mtandaoni Tanzania (2025/2026)",
  description: metadata.description as string,
  author: { "@type": "Organization", name: "C-chat" },
  publisher: { "@type": "Organization", name: "C-chat", logo: { "@type": "ImageObject", url: "https://cchat.site/images/c-chat-logo.png" } },
  datePublished: "2025-01-01",
  dateModified: "2026-09-17",
  mainEntityOfPage: "https://cchat.site/jinsi-ya-kufanya-biashara-mtandaoni-tanzania",
  inLanguage: "sw-TZ",
};

function TOC() {
  const items = [
    { href: "#sura-1", label: "1. Jinsi ya Kuanza Bila Mtaji" },
    { href: "#sura-2", label: "2. Kufungua Account ya Biashara" },
    { href: "#sura-3", label: "3. Kuuza Bidhaa Mtandaoni" },
    { href: "#sura-4", label: "4. Kutangaza Biashara" },
    { href: "#sura-5", label: "5. Kutangaza kwa WhatsApp" },
    { href: "#sura-6", label: "6. Kujiajiri Mtandaoni" },
    { href: "#sura-7", label: "7. Makosa ya Kuepuka" },
    { href: "#faq", label: "Maswali Yanayoulizwa Mara kwa Mara" },
  ];
  return (
    <nav aria-label="Yaliyomo" className="bg-[#F7F7F5] border border-[#E9E9E7] rounded-[16px] p-5">
      <p className="text-[11px] font-bold tracking-[.14em] uppercase text-[#9B9B9B] mb-3">Yaliyomo</p>
      <ol className="space-y-1.5 text-[13.5px] leading-[1.6]">
        {items.map((it) => (
          <li key={it.href}>
            <a href={it.href} className="text-[#111] hover:text-[#149A5B] hover:underline underline-offset-4">
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white text-[#111] font-body">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />

      {/* Top bar — public, no login */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-[10px] border-b border-[#E9E9E7]">
        <div className="mx-auto max-w-[1120px] px-[5vw] h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-disp font-[800] text-[18px] tracking-tight text-[#111]">
            <CchatLogo size={28} decorative className="shrink-0" /> C-chat
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/jinsi-ya-kufanya-biashara-mtandaoni-tanzania" className="hidden sm:inline text-[12px] font-semibold px-3 py-1.5 rounded-full bg-[#F7F7F5] border border-[#E9E9E7]">Mwongozo</Link>
            <Link href="/sign-up" className="inline-flex items-center justify-center px-4 py-1.5 rounded-[10px] bg-[#111] text-white text-[13px] font-semibold hover:bg-black">Anza Bure</Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[860px] px-[5vw] pt-6">
        <nav aria-label="Breadcrumb" className="text-[12.5px] text-[#9B9B9B]">
          <Link href="/" className="hover:text-[#111] hover:underline">Nyumbani</Link> <span className="mx-1">›</span>{" "}
          <span className="text-[#111] font-medium">Mwongozo wa Biashara Mtandaoni</span>
        </nav>
      </div>

      <main className="mx-auto max-w-[860px] px-[5vw] pb-16">
        {/* Hero */}
        <div className="pt-6 pb-8">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.14em] uppercase text-[#149A5B] bg-[#E3F4E9] border border-[#BCE5CB] px-2.5 py-1 rounded-full">Mwongozo Kamili · 2025/2026 · Bure</p>
          <h1 className="font-disp font-[800] tracking-[-.03em] leading-[1.02] text-[clamp(30px,5vw,44px)] mt-4 text-[#111] text-balance">
            Mwongozo Kamili wa Kufanya Biashara Mtandaoni Tanzania (2025/2026)
          </h1>
          <p className="text-[15px] leading-[1.7] text-[#6B6B6B] mt-4 max-w-[720px]">
            Jifunze jinsi ya kufanya biashara mtandaoni Tanzania, kujiajiri online bila mtaji, kufungua account ya biashara, kuuza bidhaa, na kutangaza biashara yako kwa WhatsApp na mitandao ya kijamii. Mwongozo kamili wa bure! Inafaa kwa wanaoanza — hata kama huna mtaji mkubwa.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4 text-[12px] text-[#6B6B6B]">
            <span className="inline-flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-[#111] text-white grid place-items-center text-[10px] font-bold">CC</span> C-chat · Dar es Salaam</span>
            <span className="w-1 h-1 rounded-full bg-[#E9E9E7]" />
            <time dateTime="2026-09-17">Imesasishwa: 17 Sept 2026</time>
            <span className="w-1 h-1 rounded-full bg-[#E9E9E7]" />
            <span>~14 min kusoma</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#sura-1" className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#149A5B] text-white text-[13px] font-semibold hover:bg-[#0E7A47]">Soma Mwongozo</a>
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-[#E9E9E7] bg-white text-[13px] font-semibold hover:bg-[#F7F7F5]">Fungua C-chat Bure →</Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8 items-start">
          <div className="hidden lg:block sticky top-[72px]"><TOC /></div>
          <article className="prose max-w-none prose-p:leading-[1.8] prose-p:text-[15px] prose-p:text-[#2B2B2B] prose-headings:font-disp prose-headings:tracking-tight prose-headings:text-[#111] prose-a:text-[#149A5B] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#111]">
            {/* Mobile TOC */}
            <div className="lg:hidden mb-8"><TOC /></div>

            <div className="not-prose bg-[#FCFCF9] border border-[#E9E9E7] rounded-[12px] p-4 mb-8 text-[13px] leading-[1.6] text-[#6B6B6B]">
              <b className="text-[#111]">Utajifunza:</b> jinsi ya kufanya biashara online free, kufungua account ya biashara, kuuza bidhaa, kutangaza biashara mtandaoni na kwa WhatsApp — hatua kwa hatua, kwa mifano ya Tanzania.
            </div>

            <h2 id="utangulizi" className="!mt-2">Utangulizi: Kwa Nini Biashara ya Mtandaoni?</h2>
            <p>
              Unajiuliza <b>jinsi ya kufanya biashara mtandaoni</b> lakini hujui pa kuanzia? Huenda umejikuta ukijiuliza kama inawezekana kweli <b>kujiajiri mtandaoni</b> bila ya kutegemea mshahara wa kazi za ofisi, au kama kuna njia ya kuanza <b>biashara za mtandaoni</b> hata kama huna mtaji mkubwa?
            </p>
            <p>
              Ukweli ni kwamba, katika kipindi cha miaka mitano iliyopita, <b>biashara ya mtandaoni Tanzania</b> imekua kwa kasi ya ajabu. Watu wengi sasa wanafanikiwa <b>kuuza bidhaa mtandaoni</b>, wanapata mapato ya kutosha kupitia <b>kujiajiri mtandaoni</b>, na hata wanajenga brand zao binafsi kwa kutumia simu zao za mkononi pekee.
            </p>
            <div className="not-prose my-6 rounded-[12px] border border-[#E9E9E7] bg-white p-4">
              <p className="text-[12px] font-bold tracking-[.08em] uppercase text-[#9B9B9B] mb-2">Katika mwongozo huu kamili, tutakufundisha hatua kwa hatua:</p>
              <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#111]">
                <li>Jinsi ya kufanya biashara online free (bila mtaji wowote)</li>
                <li>Jinsi ya kufungua account ya biashara mtandaoni kwenye mitandao yote muhimu</li>
                <li>Jinsi ya kuuza bidhaa mtandaoni kwa wateja wa Tanzania na nje ya nchi</li>
                <li>Jinsi ya kutangaza biashara mtandaoni bila ya kutumia fedha nyingi za matangazo</li>
                <li>Jinsi ya kutangaza biashara whatsapp kwa ufanisi wa juu</li>
              </ul>
            </div>
            <p><i>Karibu. Chukua kikombe chako cha chai, na tuanze safari hii ya kubadilisha maisha yako!</i></p>

            <div className="not-prose my-8 rounded-[16px] border border-[#E9E9E7] bg-[#111] text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold tracking-[.1em] uppercase text-white/60">Tip ya C-chat</p>
                <p className="text-[14px] leading-[1.5] mt-1 max-w-[520px]">Unataka AI ijibu wateja wako WhatsApp usiku na mchana kwa Kiswahili? C-chat inasoma bei, stock na sera zako — na kujibu papo hapo.</p>
              </div>
              <Link href="/sign-up" className="shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-[10px] bg-white text-[#111] text-[13px] font-semibold hover:bg-[#F7F7F5]">Jaribu Bure — siku 3 →</Link>
            </div>

            <h2 id="sura-1">SURA YA 1: Jinsi ya Kuanza Biashara ya Mtandaoni (Hata Bila Mtaji)</h2>
            <h3>Je, Unaweza Kufanya Biashara Online Free?</h3>
            <p><b>Ndiyo! Inawezekana kabisa.</b> Jinsi ya kufanya biashara online free inahusisha kutumia zana za bure zinazopatikana kwenye simu yako au kompyuta. Hapa kuna njia tatu bora za kuanza bila pesa:</p>
            <h4>1. Kuwa Mwakala wa Mauzo (Affiliate Marketing / Dropshipping ya Ndani)</h4>
            <p>Huhitaji kununua bidhaa. Unachukua picha za bidhaa kutoka kwa wauzaji wa Kariakoo, Karume, au maduka makubwa, kisha unazitangaza kwenye WhatsApp Status yako, Instagram, na Facebook Groups. Ukishaupata mteja, unamwelekeza au unanunua bidhaa hiyo na kumtuma, ukibaki na faida yako.</p>
            <h4>2. Kutoa Huduma za Kidijitali (Freelancing)</h4>
            <p>Ikiwa una ujuzi wa kuandika, kutengeneza picha (graphic design), kutengeneza video (video editing), au kutafsiri lugha, unaweza <b>kujiajiri mtandaoni</b> kwa kupata wateja kupitia mitandao ya kijamii au tovuti kama Fiverr na Upwork.</p>
            <h4>3. Kuuza Ujuzi Wako (Online Coaching/Consulting)</h4>
            <p>Je, wewe ni mwalimu? Mtaalamu wa lishe? Mfanyabiashara mwenye uzoefu? Unaweza kufungua makundi ya WhatsApp au Telegram ambapo watu wanakulipa kushiriki kwenye mafunzo yako ya mtandaoni.</p>
            <h3>Hatua za Kwanza Kabla ya Kuanza</h3>
            <p>Kabla ya kuanza rasmi, jibu maswali haya matatu:</p>
            <ul>
              <li><b>Ninakuza nini?</b> (Bidhaa au huduma gani?)</li>
              <li><b>Wateja wangu ni nani?</b> (Wanafunzi? Mama nyingi? Wafanyabiashara? Vijana?)</li>
              <li><b>Wateja wangu wako wapi mtandaoni?</b> (WhatsApp? Instagram? TikTok? Facebook Groups?)</li>
            </ul>
            <p>Majibu haya yatakuongoza kwenye kila hatua inayofuata.</p>

            <h2 id="sura-2">SURA YA 2: Jinsi ya Kufungua Account ya Biashara Mtandaoni</h2>
            <p>Ili kuonekana mtaalamu na kupata uaminifu wa wateja, unahitaji kuunda uwepo rasmi mtandaoni. Hapa kuna jinsi ya kufanya hivyo kwenye kila jukwaa muhimu:</p>
            <h3 id="whatsapp-business">2.1 Kufungua Akaunti ya WhatsApp Business</h3>
            <p><b>WhatsApp ndio chombo kinachotumika zaidi Tanzania.</b> Hatua:</p>
            <ol>
              <li>Pakua <b>WhatsApp Business</b> (si WhatsApp ya kawaida) kutoka Play Store au App Store.</li>
              <li>Weka jina la biashara yako (mfano: &quot;Mama Zawadi Fashions&quot;).</li>
              <li>Weka picha ya logo au picha nzuri ya biashara yako.</li>
              <li>Kwenye sehemu ya &quot;Business Description&quot;, andika kwa ufupi unachouza na jinsi ya kukupata.</li>
              <li>Tumia kipengele cha <b>Catalog</b> kupakia picha za bidhaa zako na bei.</li>
              <li>Weka <b>Auto-Reply</b> na <b>Away Message</b> ili wateja wapate majibu hata ukiwa haupo.</li>
            </ol>
            <div className="not-prose bg-[#E3F4E9] border border-[#BCE5CB] rounded-[12px] p-4 text-[13px] text-[#0F5132]">
              <b>C-chat inasaidia hapa:</b> C-chat inaunganisha Catalog yako na AI — bei na stock zikisabadilika, majibu ya WhatsApp yanabadilika papo hapo. <Link href="/sign-up" className="underline font-semibold">Anza bure</Link>.
            </div>
            <h3>2.2 Kufungua Ukurasa wa Instagram Business</h3>
            <ol>
              <li>Fungua Instagram → Settings → Account → Switch to Professional Account.</li>
              <li>Chagua &quot;Business&quot; kama aina ya akaunti.</li>
              <li>Unganisha ukurasa wako na Facebook Page yako.</li>
              <li>Weka bio yenye maneno muhimu (mfano: &quot;👗 Fashion Bora Tanzania | 📦 Tunapeleka Kila Mkoa | 📲 Order WhatsApp: 07XX-XXX-XXX&quot;).</li>
              <li>Anza kupakia picha na video za bidhaa zako kwa ubora wa juu.</li>
            </ol>
            <h3>2.3 Kufungua Facebook Page na Group</h3>
            <ol>
              <li>Kwenye Facebook, bonyeza &quot;Create Page&quot; → Chagua &quot;Business or Brand&quot;.</li>
              <li>Weka jina, picha, na cover photo.</li>
              <li>Anza kuchapisha (post) kila siku.</li>
              <li>Jiunge na Facebook Groups za biashara Tanzania (mfano: &quot;Wauzaji wa Mtandaoni Tanzania&quot;, &quot;Biashara za Mama Nyingi TZ&quot;).</li>
            </ol>
            <h3>2.4 Kufungua Akaunti ya TikTok kwa Biashara</h3>
            <ol>
              <li>Fungua TikTok → Profile → Settings → Manage Account → Switch to Business Account.</li>
              <li>Weka bio yenye link ya WhatsApp yako.</li>
              <li>Anza kuunda video fupi (15-60 sekunde) zikionyesha bidhaa zako, jinsi zinavyotumika, na maoni ya wateja.</li>
            </ol>

            <h2 id="sura-3">SURA YA 3: Jinsi ya Kuuza Bidhaa Mtandaoni</h2>
            <p>Kuunda akaunti ni hatua ya kwanza. <b>Jinsi ya kuuza bidhaa mtandaoni</b> kunahitaji mikakati ya kisaikolojia na ya kisoko. Hii ndio siri:</p>
            <h3>3.1 Picha na Video ni Mfalme</h3>
            <p>Wateja hawawezi kugusa bidhaa yako mtandaoni. Kwa hiyo, picha na video zako ndio &quot;macho&quot; yao.</p>
            <ul>
              <li>Tumia mwanga wa asili (karibu na dirisha) wakati wa kupiga picha.</li>
              <li>Piga video fupi za bidhaa zikioneshwa, zikifunguliwa, au zikitumika.</li>
              <li>Hakikisha picha zako ni clear na hazina background yenye machafuko.</li>
            </ul>
            <h3>3.2 Andika Maelezo Yanayovutia (Copywriting)</h3>
            <p>Badala ya kuandika tu &quot;Shati Tsh 15,000&quot;, andika hadithi:</p>
            <blockquote>&quot;Unatafuta shati la kuvalia kazini ambalo linaonekana la bei ya juu lakini ni Tsh 15,000 tu? Shati hili la cotton 100% linapatikana kwa rangi tatu. Tuma WhatsApp sasa kabla hazijaisha!&quot;</blockquote>
            <h3>3.3 Tumia Mbinu ya &quot;Urgency&quot; na &quot;Scarcity&quot;</h3>
            <ul>
              <li>&quot;Bidhaa hii zimebaki 5 tu!&quot;</li>
              <li>&quot;Ofer hii inaisha saa 6 usiku wa leo!&quot;</li>
              <li>&quot;Wateja 10 wa kwanza wanapata punguzo la 20%!&quot;</li>
            </ul>
            <h3>3.4 Toa Huduma Bora ya Wateja</h3>
            <ul>
              <li>Jibu ujumbe ndani ya dakika 5-15.</li>
              <li>Kuwa na adabu na subira.</li>
              <li>Mteja akishanunua, mwulize maoni yake baada ya siku 2-3.</li>
              <li>Mpe discount ya &quot;thank you&quot; kwa ununuzi ujao.</li>
            </ul>
            <h3>3.5 Malipo na Utoaji wa Bidhaa</h3>
            <p>Tumia M-Pesa, Tigo Pesa, Airtel Money, au HaloPesa kwa malipo rahisi. Kwa utoaji, tumia bodaboda za ndani, makampuni ya basi (kama mikoani), au huduma za usafirishaji kama Uber/Bolt kwa ndani ya jiji.</p>

            <h2 id="sura-4">SURA YA 4: Jinsi ya Kutangaza Biashara Mtandaoni</h2>
            <p>Hapa ndipo penye siri ya kupata wateja wengi. Jinsi ya kutangaza biashara mtandaoni inaweza kugawanywa katika njia mbili: za bure na za malipo.</p>
            <h3>4.1 Njia za BURE za Kutangaza (Zero Budget Marketing)</h3>
            <h4>a) WhatsApp Status na Groups</h4>
            <p>Chapisha kwenye WhatsApp Status yako kila siku (asubuhi, mchana, jioni). Jiunge na Link za Magroups / Link za magroup ya WhatsApp (WhatsApp Group Links) za biashara na uanze kushiriki. Pia, tumia Magroup ya WhatsApp ya udaku na za kijamii kufikia watu wengi (lakini kuwa na adabu, usifanye spam).</p>
            <h4>b) Hashtags kwenye Instagram na TikTok</h4>
            <p>Tumia hashtags zinazotafutwa Tanzania: #BiasharaMtandaoni #FashionsTanzania #UzuriWaKitanzania #MadeInTanzania #Kariakoo #DarEsSalaam</p>
            <h4>c) Ushirikiano na Wengine (Collaboration)</h4>
            <p>Mfikie mtu mwingine anayeuza bidhaa inayokamiliana na yako. Mfano: Ikiwa unaununa viatu, mshirikiane na mtu anayeununa nguo. Mnaweza kufanya &quot;Live&quot; pamoja au kuchapishana kwenye Stories.</p>
            <h4>d) Maoni ya Wateja (Testimonials)</h4>
            <p>Mteja akishakutumia ujumbe wa &quot;Asante, bidhaa nimeipenda!&quot;, chukua screenshot (funika jina lake kama hataki) na uchapishe kwenye Status yako. Hii inajenga uaminifu mkubwa.</p>
            <h3>4.2 Njia za Malipo (Paid Advertising)</h3>
            <h4>a) Facebook &amp; Instagram Ads</h4>
            <p>Hata kama una Tsh 5,000 tu kwa siku, unaweza kutumia Facebook Ads Manager kufikia watu maelfu. Weka target: Umri, mji (Dar, Arusha, Mwanza, Dodoma), na interests za wateja wako.</p>
            <h4>b) TikTok Promote</h4>
            <p>Tumia kipengele cha &quot;Promote&quot; kwenye TikTok kulipa ili video yako ifikie watu wengi zaidi. Hii inafanya kazi vizuri sana kwa bidhaa za fashion, uzuri, na chakula.</p>
            <h4>c) WhatsApp Broadcast Lists</h4>
            <p>Badala ya kuunda Group ambapo watu wanaweza kuondoka, tumia Broadcast List. Unaweza kutuma ujumbe mmoja kwa watu 256 kwa wakati mmoja, na kila mtu anaona kama umemtumia yeye peke yake.</p>

            <h2 id="sura-5">SURA YA 5: Jinsi ya Kutangaza Biashara WhatsApp (Mwongozo Maalum)</h2>
            <p>WhatsApp ni &quot;duka&quot; kubwa zaidi Tanzania. Hapa kuna mikakati ya kina ya jinsi ya kutangaza biashara whatsapp:</p>
            <h4>5.1 Tumia WhatsApp Business Features Zote</h4>
            <ul>
              <li><b>Catalog:</b> Weka picha zote za bidhaa, bei, na maelezo. Mteja anaweza kuangalia catalog yako bila hata kukutumia ujumbe.</li>
              <li><b>Labels:</b> Weka lebo kwa wateja wako (mfano: &quot;Mteja Mpya&quot;, &quot;Anadaiwa&quot;, &quot;Amenunua Leo&quot;, &quot;VIP&quot;). Hii inakusaidia kufuatilia na kutuma ofa maalum.</li>
              <li><b>Quick Replies:</b> Unda majibu ya haraka kwa maswali yanayoulizwa mara kwa mara (mfano: &quot;Bei gani?&quot;, &quot;Mkoani mnapeleka?&quot;, &quot;Njia za malipo ni zipi?&quot;).</li>
            </ul>
            <h4>5.2 Unda Ofa za Mwisho wa Wiki (Weekend Flash Sales)</h4>
            <p>Kila Ijumaa au Jumamosi, tuma ujumbe kwa Broadcast List yako: &quot;🔥 FLASH SALE YA WIKENDI! 🔥 Kila shati linalogharimu Tsh 20,000 leo ni Tsh 12,000 TU! Tuma &#39;NINATACA&#39; sasa hivi kabla saa 12 jioni. Bidhaa ni 10 tu!&quot;</p>
            <h4>5.3 Tumia Video Notes na Voice Notes</h4>
            <p>Wateja wa Tanzania wanapenda &quot;personal touch&quot;. Tuma voice note ya sekunde 30 ukimshukuru mteja kwa ununuzi, au tuma video note fupi ukionyesha bidhaa mpya iliyofika. Hii inajenga uhusiano wa karibu.</p>
            <h4>5.4 Kuunda Kikundi cha VIP kwa Wateja Wakubwa</h4>
            <p>Baada ya mteja kununua mara 2-3, mwalike kwenye Kikundi cha VIP cha WhatsApp. Kwenye kikundi hiki: Anapata ofa kabla ya wengine, punguzo la ziada, na majibu ya haraka. Hii inafanya mteja ahisi &quot;maalum&quot; na anakuwa mwaminifu kwako.</p>
            <h4>5.5 Matumizi ya GB WhatsApp / FM WhatsApp (Tahadhari)</h4>
            <p>Wafanyabiashara wengi hutafuta GB WhatsApp download / FM WhatsApp update kwa sababu zina features za ziada kama kuona Status bila kuonekana, kutuma faili kubwa, na kupanga messages. <b>HATA HIVYO,</b> kumbuka kuwa hizi si rasmi na WhatsApp inaweza kufunga namba yako. Tumia kwa tahadhari na usiweke taarifa za siri za wateja wako hapo.</p>

            <h2 id="sura-6">SURA YA 6: Jinsi ya Kujiajiri Mtandaoni (Kujiendeleza)</h2>
            <p>Jinsi ya kujiajiri mtandaoni si tu kuanza biashara, bali ni kubadilisha mtazamo wako wa maisha. Hapa kuna hatua za kuwa &quot;boss&quot; wako mwenyewe mtandaoni:</p>
            <ul>
              <li><b>Weka Malengo ya Kila Siku:</b> Leo nitachapisha posts 3, nitajibu wateja wote ndani ya dakika 10, nitatuma broadcast kwa wateja 50.</li>
              <li><b>Jifunze Kila Siku:</b> Tazama videos za YouTube kuhusu marketing, soma makala za biashara, fuata wafanyabiashara waliofanikiwa Tanzania.</li>
              <li><b>Rekodi Pesa Zako:</b> Tumia app rahisi (hata Excel) kurekodi kila shilingi inayoingia na kutoka. Hii ndio tofauti kati ya &quot;kucheza biashara&quot; na &quot;kufanya biashara halisi&quot;.</li>
              <li><b>Jenga Network:</b> Jiunge na makundi ya wafanyabiashara mtandaoni. Ushirikiano na wengine unaweza kukufungulia milango mikubwa.</li>
              <li><b>Usikate Tamaa:</b> Wiki za kwanza zinaweza kuwa ngumu. Mteja mmoja kwa wiki ni mwanzo. Mteja mmoja kwa siku ni mafanikio. Wateja kumi kwa siku ni uhuru wa kifedha.</li>
            </ul>

            <h2 id="sura-7">SURA YA 7: Makosa ya Kuiepuka Katika Biashara ya Mtandaoni</h2>
            <ul>
              <li><b>Kutojibu wateja kwa haraka:</b> Mteja anayetuma ujumbe na kukaa saa 6 bila jibu, ataenda kwa mwingine.</li>
              <li><b>Kuchapisha sana bila kuuza:</b> Hakikisha kila post ina &quot;Call to Action&quot; (mfano: &quot;Tuma WhatsApp sasa!&quot;, &quot;Bonyeza link kwenye bio!&quot;).</li>
              <li><b>Kutojua thamani ya bidhaa yako:</b> Usishindane kwa bei tu. Shindane kwa ubora, huduma, na uaminifu.</li>
              <li><b>Kupuuza maoni ya wateja:</b> Mteja akilalamika, msikilize na urekebishe. Maoni ya wateja ndiyo &quot;market research&quot; yako ya bure.</li>
              <li><b>Kutotumia VPN kwa masoko ya nje:</b> Ikiwa unataka kufikia wateja wa Kenya, Uganda, au hata Ulaya, tumia VPN ya bure / VPN bora ili kuona jinsi masoko ya kimataifa yanavyofanya kazi na kujifunza mbinu zao.</li>
            </ul>

            <h2 id="faq">MASWALI YANAYOULIZWA MARA KWA MARA (FAQ)</h2>
            <div className="not-prose space-y-3 mt-4">
              <details className="group bg-white border border-[#E9E9E7] rounded-[12px] p-4 open:bg-[#FCFCF9]">
                <summary className="list-none flex justify-between items-center gap-3 cursor-pointer font-semibold text-[15px] text-[#111]">Swali 1: Je, ninaweza kufanya biashara online free kabisa? <span className="shrink-0 w-6 h-6 rounded-full border border-[#E9E9E7] grid place-items-center text-[#6B6B6B] group-open:rotate-45 transition-transform">+</span></summary>
                <p className="text-[14px] leading-[1.7] text-[#6B6B6B] mt-3">Jibu: <b className="text-[#111]">Ndiyo.</b> Unaweza kuanza kwa kutumia WhatsApp Status yako, kujiunga na Facebook Groups za bure, na kutumia Instagram bila kulipa chochote. Utahitaji tu simu, intaneti, na bidii.</p>
              </details>
              <details className="group bg-white border border-[#E9E9E7] rounded-[12px] p-4 open:bg-[#FCFCF9]">
                <summary className="list-none flex justify-between items-center gap-3 cursor-pointer font-semibold text-[15px] text-[#111]">Swali 2: Ni bidhaa gani bora kuuza mtandaoni Tanzania? <span className="shrink-0 w-6 h-6 rounded-full border border-[#E9E9E7] grid place-items-center text-[#6B6B6B] group-open:rotate-45 transition-transform">+</span></summary>
                <p className="text-[14px] leading-[1.7] text-[#6B6B6B] mt-3">Bidhaa zinazouzwa zaidi ni: nguo na viatu, bidhaa za uzuri (skincare, makeup), vyakula vya nyumbani (vikaka, samosa, cakes), electronics (simu, headphones), na huduma za kidijitali (graphic design, writing).</p>
              </details>
              <details className="group bg-white border border-[#E9E9E7] rounded-[12px] p-4 open:bg-[#FCFCF9]">
                <summary className="list-none flex justify-between items-center gap-3 cursor-pointer font-semibold text-[15px] text-[#111]">Swali 3: Jinsi ya kutangaza biashara whatsapp bila ya kuchukizwa na watu? <span className="shrink-0 w-6 h-6 rounded-full border border-[#E9E9E7] grid place-items-center text-[#6B6B6B] group-open:rotate-45 transition-transform">+</span></summary>
                <p className="text-[14px] leading-[1.7] text-[#6B6B6B] mt-3">Tumia WhatsApp Status badala ya kutuma ujumbe moja kwa moja kwa kila mtu. Kwenye Groups, toa thamani kwanza (maelezo, ushauri) kabla ya kuuza. Usitume ujumbe mmoja kwa watu wengi ambao hawajakuruhusu (hii ni spam).</p>
              </details>
              <details className="group bg-white border border-[#E9E9E7] rounded-[12px] p-4 open:bg-[#FCFCF9]">
                <summary className="list-none flex justify-between items-center gap-3 cursor-pointer font-semibold text-[15px] text-[#111]">Swali 4: Ninahitaji kufungua account ya biashara mtandaoni ya benki? <span className="shrink-0 w-6 h-6 rounded-full border border-[#E9E9E7] grid place-items-center text-[#6B6B6B] group-open:rotate-45 transition-transform">+</span></summary>
                <p className="text-[14px] leading-[1.7] text-[#6B6B6B] mt-3">Kwa kuanzia, M-Pesa, Tigo Pesa, au Airtel Money inatosha. Lakini biashara yako ikikua, ni vizuri kufungua akaunti ya benki ya biashara (kama CRDB, NMB, au Tigo Pesa Business) ili kupata mikopo na kuonekana mtaalamu zaidi.</p>
              </details>
              <details className="group bg-white border border-[#E9E9E7] rounded-[12px] p-4 open:bg-[#FCFCF9]">
                <summary className="list-none flex justify-between items-center gap-3 cursor-pointer font-semibold text-[15px] text-[#111]">Swali 5: Jinsi ya kujiajiri mtandaoni kama huna ujuzi wowote? <span className="shrink-0 w-6 h-6 rounded-full border border-[#E9E9E7] grid place-items-center text-[#6B6B6B] group-open:rotate-45 transition-transform">+</span></summary>
                <p className="text-[14px] leading-[1.7] text-[#6B6B6B] mt-3">Anza kwa kuuza bidhaa za watu wengine (dropshipping ya ndani). Hii inakufundisha marketing, customer service, na logistics bila kuhitaji mtaji. Kadiri unavyojifunza, ndivyo unavyoweza kuanza biashara yako mwenyewe.</p>
              </details>
            </div>

            <h2>HITIMISHO: Anza LEO!</h2>
            <p>
              <b>Biashara za mtandaoni si ndoto, ni uhalisia unaotokea kila siku Tanzania.</b> Kila mtu mwenye simu ya mkononi ana fursa ya kubadilisha maisha yake.
            </p>
            <p>Usisubiri &quot;muda mzuri&quot; au &quot;mtaji mkubwa&quot;. Anza na ulichonacho. Anza leo. Fungua WhatsApp Business yako, piga picha ya bidhaa yako ya kwanza, weka kwenye Status yako, na subiri mteja wako wa kwanza.</p>
            <p><b>Kumbuka:</b> Safari ya maili elfu huanza kwa hatua moja. Na hatua yako ya kwanza ni kuanza.</p>
            <p className="text-[13px] text-[#9B9B9B]">📌 URL: /jinsi-ya-kufanya-biashara-mtandaoni-tanzania · Title: Jinsi ya Kufanya Biashara Mtandaoni Tanzania | Mwongozo Kamili 2025</p>

            <div className="not-prose mt-8 rounded-[16px] border border-[#149A5B] bg-[#F0FFF4] p-6 text-center">
              <h3 className="font-disp font-bold text-[18px] text-[#111]">Tayari kuanza biashara yako?</h3>
              <p className="text-[13px] text-[#6B6B6B] mt-1">C-chat inakusaidia kujibu wateja WhatsApp moja kwa moja — kwa Kiswahili. Siku 3 bure, bila kadi.</p>
              <Link href="/sign-up" className="mt-3 inline-flex items-center justify-center px-5 py-2.5 rounded-[10px] bg-[#149A5B] text-white text-[13px] font-semibold hover:bg-[#0E7A47]">Fungua C-chat Bure</Link>
              <p className="text-[11px] text-[#9B9B9B] mt-2">TZS 12,000/mo baada ya trial · Ghairi wakati wowote</p>
            </div>

            <div className="not-prose mt-6 flex flex-wrap gap-2 text-[12px]">
              <Link href="/" className="px-3 py-1.5 rounded-full bg-white border border-[#E9E9E7] hover:bg-[#F7F7F5]">← Rudi Nyumbani</Link>
              <Link href="/privacy" className="px-3 py-1.5 rounded-full bg-white border border-[#E9E9E7] hover:bg-[#F7F7F5]">Privacy</Link>
              <Link href="/terms" className="px-3 py-1.5 rounded-full bg-white border border-[#E9E9E7] hover:bg-[#F7F7F5]">Terms</Link>
            </div>
          </article>
        </div>
      </main>

      <footer className="border-t border-[#E9E9E7] bg-[#FCFCF9] py-8 mt-8">
        <div className="mx-auto max-w-[860px] px-[5vw] text-center text-[12px] text-[#9B9B9B]">
          <p>© 2026 C-chat · Mwongozo huu ni bure kwa wafanyabiashara wote Tanzania · Imeandikwa Dar es Salaam</p>
          <p className="mt-2">Maswali? <a href="mailto:chrispinmatiko@gmail.com" className="underline hover:text-[#111]">chrispinmatiko@gmail.com</a> · WhatsApp: <a href="tel:+255620184437" className="underline hover:text-[#111]">+255 620 184 437</a></p>
        </div>
      </footer>
    </div>
  );
}
