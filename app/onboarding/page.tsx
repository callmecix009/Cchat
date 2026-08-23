"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CchatLogo from "@/components/branding/CchatLogo";

type FieldDef = [number, string, string, (string | string[] | null)?, (string[])?];
type StepDef = { t: string; d: string; f: FieldDef[] };

const ONB_STEPS: StepDef[] = [
  {t:'Business identity',d:'Who you are. The AI introduces you with this.',f:[
    [1,'text','What is your business name?','Kariakoo Phone Centre'],
    [2,'text','In one sentence, what does your business do?','Phones, accessories and expert repairs'],
    [3,'text','Which city or area do you operate in?','Kariakoo, Dar es Salaam'],
    [4,'radio','Do you have a physical shop, online only, or both?',null,['Physical shop','Online only','Both']],
    [5,'text','Address or a known landmark (if physical)','Msimbazi Street, next to Shadrack Pharmacy'],
    [8,'text',"Owner's name (the AI will mention you naturally)",'Juma Hassan'],
    [12,'text','Slogan or motto the AI can use','Simu safi, bei poa!']]},
  {t:'Customers & language',d:'How your customers talk — so the AI talks like them.',f:[
    [13,'select','What language do most customers write in?',null,['Swahili','English','Mixed']],
    [14,'radio','Should the AI start conversations in Swahili?',null,['Yes — Swahili first','No — English first']],
    [15,'area','How should the AI greet customers? (write your own or use the suggestion)',''],
    [16,'radio','How formal or casual should the AI sound?',null,['Very respectful','Friendly & casual','Playful']],
    [17,'radio','Should the AI use emojis?',null,['Yes, moderately','Yes, generously','No emojis']],
    [18,'radio','Address customers by name when known?',null,['Yes','No']],
    [19,'text','Local words, slang or phrases the AI should use','boss, mdau, poa, safi'],
    [20,'text','Words or topics the AI must NEVER use','']]},
  {t:'Products & stock',d:"What you sell. The AI quotes these live — to the last unit.",f:[
    [21,'text','Which categories of products do you sell?','Phones, Accessories, Audio'],
    [22,'num','Roughly how many different products?','13'],
    [25,'text','Which products are your best sellers?','Tecno Spark 10, Anker charger'],
    [26,'text','Which products are on promotion right now?',''],
    [27,'radio','Do prices change often?',null,['Rarely','Monthly','Weekly']],
    [28,'radio','Do you give bulk/wholesale discounts?',null,['Yes','No']],
    [29,'radio','Is bargaining allowed in your business?',null,['Yes','No']],
    [30,'num','If yes — maximum discount the AI may offer (%)','10'],
    [31,'area','What should the AI say when an item is out of stock?','Pole, imeisha — nikujulishe ikirudi au nikupe mbadala.'],
    [32,'radio','Suggest a similar product when one is unavailable?',null,['Yes','No']],
    [35,'text','Products the AI should NOT mention or sell (if any)','']]},
  {t:'Services',"d":"Things you do that aren't sellable products — repairs, installs, bookings.",f:[
    [36,'text','What services do you offer besides selling products?','Screen repair, software, battery, setup'],
    [38,'text','How long does each service typically take?','Most repairs 1–3 hours'],
    [39,'radio','Do services need an appointment/booking?',null,['Some do','All do','Walk-in only']],
    [40,'radio','Do repaired items get a warranty?',null,['Yes — 30 days','Yes — 90 days','No warranty']],
    [41,'text','What does the service warranty NOT cover?','New physical damage after repair']]},
  {t:'Payments',d:'Information only. Cchat never processes money — the AI simply tells customers your methods.',f:[
    [42,'check','Which payment methods do you accept?',null,['M-Pesa','Tigo Pesa','Airtel Money','Cash','Bank transfer','Cards']],
    [43,'text','Mobile money: which name/number should customers pay to?','0757 123 456 — JUMA HASSAN'],
    [44,'radio','Do you require a deposit for orders or repairs?',null,['Yes — 50%','Yes — other','No deposit']],
    [45,'radio','Do you issue receipts?',null,['Yes, always','Digital only','No']],
    [46,'radio','Is payment before or after delivery?',null,['On pickup / on delivery','Before delivery','After delivery']]]},
  {t:'Delivery & pickup',d:'Where you deliver, what it costs, and how long it takes.',f:[
    [47,'radio','Do you deliver?',null,['Yes — paid delivery','Yes — free everywhere','Only certain areas','No delivery']],
    [49,'num','Free delivery above which amount (TZS)? (0 = never free)','500000'],
    [50,'text','How long does delivery usually take?','2–4 hours within Dar'],
    [51,'text','Can customers pick up at the shop? Where exactly?','Yes — Msimbazi Street, Kariakoo'],
    [52,'radio','Who pays delivery if an item is returned under warranty?',null,['The business','The customer','Split']]]},
  {t:'Policies & warranty',d:'The rules the AI must never break.',f:[
    [53,'num','Return policy — how many days?','3'],
    [54,'text','Conditions a returned item must meet','Original condition, receipt, full packaging'],
    [55,'radio','Do you offer exchanges instead of refunds?',null,['Exchanges preferred','Refunds ok','Case by case']],
    [56,'text','Warranty per product category','Phones 12 months · Accessories 3 months · Repairs 30 days'],
    [57,'text','What voids the warranty?','Water damage, physical damage, opened seals'],
    [58,'text','What happens if a product arrives damaged?','Free replacement or full refund on the spot'],
    [59,'area','Any other house rules customers must know?','All prices include VAT']]},
  {t:'Handoff & availability',d:'When the AI must step aside and let you take over.',f:[
    [60,'check','When must the AI hand the chat to you?',null,['Customer asks for me','Negotiation past the limit','Angry customer','Big order (5+ items)','Custom keywords']],
    [61,'radio','Is price negotiation a handoff trigger, or can the AI handle it?',null,['AI handles up to my limit','Always hand over']],
    [63,'area',"What should the AI tell a customer when you're offline?",'Niachie jina na namba — Juma atakupigia simu akirudi.'],
    [64,'radio',"Collect the customer's name & number before handing over?",null,['Yes','No']],
    [65,'radio','Get a notification for every handoff?',null,['Yes','Only urgent ones']]]},
  {t:'AI personality & style',d:'The character of your agent.',f:[
    [66,'text','Describe your brand voice in three words','Warm, honest, fast'],
    [67,'radio','Should the AI use humor?',null,['A little','Often','Never']],
    [68,'text','How should the AI end conversations?','Karibu tena! 🙏'],
    [69,'radio','Ask follow-up questions to guide customers (budget, model, colour, use case)?',null,['Yes','No']],
    [70,'radio','Upsell / cross-sell (e.g. case with a phone)?',null,['Yes','No']],
    [71,'radio','How long should answers be?',null,['Short WhatsApp-style','Detailed']],
    [72,'area','How should the AI handle an angry customer?','Apologize sincerely, offer warranty help, hand over to me fast.'],
    [73,'area','How should the AI handle spam or prank messages?','One polite reply, then stop engaging.'],
    [74,'radio','Ask for a review or referral after a successful sale?',null,['Yes','No']]]},
  {t:'Common questions',d:"Teach the AI your top answers — and your red lines.",f:[
    [75,'area','The questions customers ask most — and the correct answer to each',''],
    [77,'text','Questions you hate getting (the AI will handle them gracefully)','"Mko online?" for the 50th time a day'],
    [78,'text','What must the AI never discuss?','Competitors, politics, personal life'],
    [79,'radio',"When the AI doesn't know an answer…",null,['Say it will check + hand over','Never guess (always)','Give closest estimate']],
    [80,'area','What does a perfect conversation look like to you?','Customer asks, AI answers with real stock, closes the sale or books the repair, polite goodbye.'],
    [81,'radio','The #1 result you want from this AI',null,['More sales','24/7 coverage','Fewer repetitive questions']]]},
];

function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ArrowLeft({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ZapIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [dynLists, setDynLists] = useState<Record<string, Record<string, string>[]>>({});

  const st = ONB_STEPS[step];
  const pct = Math.round((step / ONB_STEPS.length) * 100);

  const update = useCallback((q: number, val: string | string[]) => {
    setAnswers(prev => ({ ...prev, [q]: val }));
  }, []);

  const toggleChipMulti = useCallback((q: number, val: string) => {
    setAnswers(prev => {
      const cur = (prev[q] as string[]) || [];
      const next = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val];
      return { ...prev, [q]: next };
    });
  }, []);

  const addRow = useCallback((key: string, empty: Record<string, string>) => {
    setDynLists(prev => ({ ...prev, [key]: [...(prev[key] || []), empty] }));
  }, []);

  const removeRow = useCallback((key: string, idx: number) => {
    setDynLists(prev => {
      const arr = [...(prev[key] || [])];
      arr.splice(idx, 1);
      if (!arr.length) arr.push(key === 'prods' ? { n: '', pr: '', st: '' } : key === 'svcs' ? { n: '', d: '', pr: '' } : key === 'areas' ? { a: '', f: '' } : { q: '', a: '' });
      return { ...prev, [key]: arr };
    });
  }, []);

  const updateRow = useCallback((key: string, idx: number, field: string, val: string) => {
    setDynLists(prev => {
      const arr = [...(prev[key] || [])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, [key]: arr };
    });
  }, []);

  const goNext = () => {
    if (step < ONB_STEPS.length - 1) setStep(step + 1);
  };
  const goBack = () => { if (step > 0) setStep(step - 1); };

  const launch = async () => {
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, dynLists }),
      });
    } catch (e) {
      console.error('Save failed, continuing anyway', e);
    }
    router.push('/dashboard');
  };

  const renderField = (f: FieldDef, idx: number) => {
    const [q, type, label, phOrOpts, extraOpts] = f;
    const val = answers[q];
    const qtag = <span className="inline-block font-mono text-[10px] font-semibold text-grn-d bg-grn-bg rounded-[5px] px-[6px] py-[1px] mr-2 align-[2px]">Q{q}</span>;
    const wrapper = (inner: React.ReactNode) => (
      <div key={`q-${q}-${idx}`} className="mb-4">
        <label className="block text-[12.5px] font-bold text-muted mb-[6px] tracking-[.03em] uppercase">{qtag}{label}</label>
        {inner}
      </div>
    );

    switch (type) {
      case 'text':
        return wrapper(
          <input className="w-full px-3 py-[10px] border border-[#D2DCD1] rounded-[8px] bg-white transition-all focus:outline-none focus:border-grn focus:ring-2 focus:ring-grn/14 text-[14px]" value={(val as string) || ''} onChange={e => update(q, e.target.value)} placeholder={typeof phOrOpts === 'string' ? phOrOpts : ''} />
        );
      case 'num':
        return wrapper(
          <input className="w-full px-3 py-[10px] border border-[#D2DCD1] rounded-[8px] bg-white transition-all focus:outline-none focus:border-grn focus:ring-2 focus:ring-grn/14 text-[14px] max-w-[220px]" type="number" value={(val as string) || ''} onChange={e => update(q, e.target.value)} placeholder={typeof phOrOpts === 'string' ? phOrOpts : ''} />
        );
      case 'area':
        return wrapper(
          <textarea className="w-full px-3 py-[10px] border border-[#D2DCD1] rounded-[8px] bg-white transition-all focus:outline-none focus:border-grn focus:ring-2 focus:ring-grn/14 text-[14px] min-h-[74px] resize-y" value={(val as string) || ''} onChange={e => update(q, e.target.value)} placeholder={typeof phOrOpts === 'string' ? phOrOpts : ''} />
        );
      case 'select':
        return wrapper(
          <select className="w-full px-3 py-[10px] border border-[#D2DCD1] rounded-[8px] bg-white transition-all focus:outline-none focus:border-grn focus:ring-2 focus:ring-grn/14 text-[14px] max-w-[280px]" value={(val as string) || ''} onChange={e => update(q, e.target.value)}>
            <option value="">Select...</option>
            {(extraOpts || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case 'radio':
        return wrapper(
          <div className="flex flex-wrap gap-2">
            {(extraOpts || []).map(o => (
              <button key={o} type="button" onClick={() => update(q, o)}
                  className={`px-[14px] py-2 rounded-full border-[1.5px] font-semibold text-[13.5px] transition-all ${val === o ? 'bg-dark text-white border-dark' : 'bg-white border-[#D2DCD1] text-dark hover:border-grn'}`}>
                  {o}
                </button>
            ))}
          </div>
        );
      case 'check':
        return wrapper(
          <div className="flex flex-wrap gap-2">
            {((extraOpts || []) as string[]).map(o => {
              const selected = ((val as string[]) || []).includes(o);
              return (
                <button key={o} type="button" onClick={() => toggleChipMulti(q, o)}
                  className={`px-[14px] py-2 rounded-full border-[1.5px] font-semibold text-[13.5px] transition-all ${selected ? 'bg-dark text-white border-dark' : 'bg-white border-[#D2DCD1] text-dark hover:border-grn'}`}>
                  {o}
                </button>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-white px-[5vw] py-[34px]" style={{ background: 'linear-gradient(160deg,#071510 0%,#0C2417 60%,#0F2E1D 100%)' }}>
      {/* Header */}
      <div className="max-w-[780px] mx-auto mb-7 flex justify-between items-center gap-[14px] flex-wrap">
        <div className="flex items-center gap-[9px] font-disp font-[800] text-[21px] tracking-tight text-white">
          <CchatLogo size={32} decorative className="shrink-0" />
          Cchat
          <span className="text-[#8FAA99] font-medium text-[14px] ml-1">· Setup Guide</span>
        </div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-3 py-[6px] rounded-lg border border-[rgba(143,240,180,.3)] text-[#B9CDBF] text-[13px] font-semibold hover:border-lime hover:text-lime transition-colors bg-transparent">
          Skip — I&apos;ll do this later
        </Link>
      </div>

      {/* Progress */}
      <div className="max-w-[780px] mx-auto mb-2">
        <div className="h-2 bg-[rgba(255,255,255,.12)] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-[width] duration-[.45s]" style={{ width: `${Math.max(4, pct)}%`, background: 'linear-gradient(90deg,#149A5B,#53E89B)' }} />
        </div>
        <div className="flex justify-between text-[12px] text-[#9DB6A7] mt-[7px] font-mono">
          <span>Step {step + 1} of {ONB_STEPS.length} — {st.t}</span>
          <span>{st.f.length} questions</span>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-[780px] mx-auto mt-[18px] bg-[#F4F7F3] text-dark rounded-[20px] p-[34px] shadow-[0_40px_90px_-30px_rgba(0,0,0,.6)]">
        <h2 className="font-disp text-[26px] tracking-[-.01em]">{st.t}</h2>
        <p className="text-muted text-[14px] mt-[6px] mb-6">{st.d} Every answer is editable later in its own section.</p>

        {st.f.map((f, i) => renderField(f, i))}

        <div className="flex justify-between items-center mt-[26px] gap-3 flex-wrap">
          <button onClick={goBack} disabled={step === 0}
            className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[10px] border border-[#D2DCD1] text-dark font-semibold text-[14px] bg-white hover:border-grn transition-all disabled:opacity-40 disabled:pointer-events-none">
            <ArrowLeft /> Back
          </button>
          <div className="flex gap-[10px]">
            {step === ONB_STEPS.length - 1 ? (
              <button onClick={launch}
                className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[10px] bg-grn text-white font-semibold text-[14px] hover:bg-grn-d transition-all shadow-[0_6px_16px_-6px_rgba(20,154,91,.5)]">
                <ZapIcon /> Launch my AI agent
              </button>
            ) : (
              <button onClick={goNext}
                className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[10px] bg-grn text-white font-semibold text-[14px] hover:bg-grn-d transition-all shadow-[0_6px_16px_-6px_rgba(20,154,91,.5)]">
                Continue <ArrowRight />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-[#8FAA99] text-[12px] mt-5">81 quick answers build your AI&apos;s knowledge base · about 10 minutes · your data stays yours</p>
    </div>
  );
}
