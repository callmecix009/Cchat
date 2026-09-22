"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";

const DEFAULT_AI = {
  tone: "friendly",
  personality: "",
  emojis: true,
  answerLen: "short",
  langMode: "auto",
  greetSw: "Habari! Karibu kwenye duka letu. Nikusaidieje leo?",
  greetEn: "Hi there! Welcome to our shop. How can I help you today?",
  proactive: true,
  pushiness: 40,
  upsell: false,
  trigHuman: true,
  trigNegotiation: true,
  trigAngry: true,
  trigKeywords: "meneja, manager, simu, call",
  hoursFrom: "08:00",
  hoursTo: "19:00",
  handoffMsgSw: "Ngoja kidogo — namuunganisha na mwenye duka, atakujibu sasa hivi.",
  handoffMsgEn: "One moment — I'm connecting you with the owner, they'll reply right away.",
  offlineMsgSw: "Mwenye duka hayupo sasa. Acha namba yako, atakupigia simu akirudi.",
  collectContact: true,
  notifyHandoff: true,
  negotiable: true,
  maxDiscount: 10,
};



function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full border-[1.5px] font-semibold text-[13.5px] transition-all ${on ? "bg-dark text-white border-dark" : "bg-white border-[#E9E9E7] text-dark hover:border-[#111]"}`}
    >
      {children}
    </button>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative w-[42px] h-6 flex-none cursor-pointer">
      <input type="checkbox" className="opacity-0 w-0 h-0" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`absolute inset-0 rounded-full transition-all ${checked ? "bg-grn" : "bg-[#CBD5CC]"}`} />
      <span className={`absolute w-[18px] h-[18px] bg-white rounded-full transition-all top-[3px] shadow-[0_1px_3px_rgba(0,0,0,.25)] ${checked ? "left-[21px]" : "left-[3px]"}`} />
    </label>
  );
}

function Polsec({ icon, title, sub, children }: { icon: React.ReactNode; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-cborder rounded-[16px] p-5 mb-3.5">
      <h3 className="font-disp text-base flex items-center gap-2.5 mb-1 text-dark">
        <span className="text-[#111]">{icon}</span> {title}
      </h3>
      {sub && <p className="text-[12.5px] text-[#5D7064] mb-3.5">{sub}</p>}
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[12.5px] font-bold text-[#4A6154] mb-1.5 uppercase tracking-[.03em]">{label}</label>
      {children}
      {hint && <div className="text-xs text-[#5D7064] mt-1.5 font-medium normal-case">{hint}</div>}
    </div>
  );
}

const inpCls = "w-full px-3 py-2.5 border border-[#E9E9E7] rounded-lg bg-white text-[14px] focus:outline-none focus:border-[#111] focus:ring-2 focus:ring-[#111]/10/14 transition-all dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-[#EDEDED] dark:placeholder-[#7A7A7A] dark:focus:border-[#EDEDED]";

export default function AIConfigPage() {
  const [ai, setAi] = useState({ ...DEFAULT_AI });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/ai-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.ai) setAi({ ...DEFAULT_AI, ...data.ai });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const set = useCallback(<K extends keyof typeof DEFAULT_AI>(k: K, v: (typeof DEFAULT_AI)[K]) => {
    setAi((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="viewwrap max-w-[1240px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-disp font-bold tracking-tight text-dark">AI Configure</h1>
          <p className="text-sm text-muted">Shape how your agent thinks, talks and hands over.</p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/dashboard/agent" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] border border-[#E9E9E7] text-dark font-semibold text-sm bg-white hover:border-[#111] transition-colors">
            <Icon name="chat" size={14} /> Test in Chat Agent
          </Link>
          <button onClick={save} disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-grn text-white font-semibold text-sm hover:bg-grn-d transition-colors shadow-[0_6px_16px_-6px_rgba(20,154,91,.5)] disabled:opacity-60">
            <Icon name="check" size={15} /> {saved ? "Saved!" : saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {!loaded && <div className="text-center py-16 text-muted text-sm">Loading configuration...</div>}

      {loaded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div>
            <Polsec icon={<Icon name="spark" size={17} />} title="Tone & personality">
              <div className="flex flex-wrap gap-2 mb-3">
                {["friendly", "professional", "playful", "respectful"].map((t) => (
                  <Chip key={t} on={ai.tone === t} onClick={() => set("tone", t as typeof ai.tone)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Chip>
                ))}
              </div>
              <Field label="Free-text personality (optional)">
                <textarea className={inpCls} placeholder="Describe your brand voice…" value={ai.personality} onChange={(e) => set("personality", e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Use emojis">
                  <div className="flex items-center gap-2.5">
                    <Switch checked={ai.emojis} onChange={(v) => set("emojis", v)} />
                    <span className="text-[13.5px] font-medium">{ai.emojis ? "Yes" : "No"}</span>
                  </div>
                </Field>
                <Field label="Answer length">
                  <div className="flex flex-wrap gap-2">
                    <Chip on={ai.answerLen === "short"} onClick={() => set("answerLen", "short")}>WhatsApp-style</Chip>
                    <Chip on={ai.answerLen === "long"} onClick={() => set("answerLen", "long")}>Detailed</Chip>
                  </div>
                </Field>
              </div>
            </Polsec>

            <Polsec icon={<Icon name="globe" size={17} />} title="Language" sub="Swahili is primary. The AI auto-detects English and switches mid-conversation.">
              <div className="flex flex-wrap gap-2">
                <Chip on={ai.langMode === "auto"} onClick={() => set("langMode", "auto")}>Auto-detect — Swahili first</Chip>
                <Chip on={ai.langMode === "sw"} onClick={() => set("langMode", "sw")}>Force Swahili</Chip>
                <Chip on={ai.langMode === "en"} onClick={() => set("langMode", "en")}>Force English</Chip>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3.5">
                <Field label="Greeting · Swahili">
                  <textarea className={inpCls} value={ai.greetSw} onChange={(e) => set("greetSw", e.target.value)} />
                </Field>
                <Field label="Greeting · English">
                  <textarea className={inpCls} value={ai.greetEn} onChange={(e) => set("greetEn", e.target.value)} />
                </Field>
              </div>
            </Polsec>

            <Polsec icon={<Icon name="zap" size={17} />} title="Proactive conversation" sub="The AI doesn't just answer — it asks smart follow-ups (budget, model, colour, use case, urgency) to guide customers toward a sale or booking.">
              <div className="flex items-center gap-3 mb-3.5">
                <Switch checked={ai.proactive} onChange={(v) => set("proactive", v)} />
                <b className="text-[13.5px]">{ai.proactive ? "On — the AI guides the conversation" : "Off — answers only"}</b>
              </div>
              {ai.proactive && (
                <Field label={`How pushy?  ${ai.pushiness}%`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={ai.pushiness}
                    className="range"
                    style={{ "--fill": `${ai.pushiness}%` } as React.CSSProperties}
                    onChange={(e) => set("pushiness", Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[11px] text-[#5D7064] mt-1"><span>Gentle</span><span>Aggressive closer</span></div>
                </Field>
              )}
              <div className="flex items-center gap-3 border-t border-dashed border-cborder pt-3.5">
                <Switch checked={ai.upsell} onChange={(v) => set("upsell", v)} />
                <div>
                  <b className="text-[13.5px]">Upsell / cross-sell</b>
                  <div className="text-[12.5px] text-muted">e.g. suggest a case + protector with every phone.</div>
                </div>
              </div>
            </Polsec>
          </div>

          <div>
            <Polsec icon={<Icon name="hand" size={17} />} title="Handoff to human">
              <Field label="Triggers">
                <div className="grid gap-2.5">
                  {(
                    [
                      ["trigHuman", "Customer asks for the owner / a human"],
                      ["trigNegotiation", "Price negotiation beyond the allowed limit"],
                      ["trigAngry", "Angry customer detected"],
                    ] as const
                  ).map(([k, label]) => (
                    <label key={k} className="flex gap-2.5 items-center text-[13.5px] font-medium cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-grn" checked={ai[k]} onChange={(e) => set(k, e.target.checked)} />
                      {label}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Custom keywords (comma separated)">
                <input className={inpCls} value={ai.trigKeywords} onChange={(e) => set("trigKeywords", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="You're available from">
                  <input type="time" className={inpCls} value={ai.hoursFrom} onChange={(e) => set("hoursFrom", e.target.value)} />
                </Field>
                <Field label="Until">
                  <input type="time" className={inpCls} value={ai.hoursTo} onChange={(e) => set("hoursTo", e.target.value)} />
                </Field>
              </div>
              <Field label="When handing over, AI says (SW)">
                <textarea className={inpCls} value={ai.handoffMsgSw} onChange={(e) => set("handoffMsgSw", e.target.value)} />
              </Field>
              <Field label="When handing over, AI says (EN)">
                <textarea className={inpCls} value={ai.handoffMsgEn} onChange={(e) => set("handoffMsgEn", e.target.value)} />
              </Field>
              <Field label="When you're offline, AI promises…" hint='e.g. collect name + number, "the owner will call you back"'>
                <textarea className={inpCls} value={ai.offlineMsgSw} onChange={(e) => set("offlineMsgSw", e.target.value)} />
              </Field>
              <div className="grid gap-2.5">
                <label className="flex gap-2.5 items-center text-[13.5px] font-medium cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-grn" checked={ai.collectContact} onChange={(e) => set("collectContact", e.target.checked)} />
                  Collect customer name & number before handoff
                </label>
                <label className="flex gap-2.5 items-center text-[13.5px] font-medium cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-grn" checked={ai.notifyHandoff} onChange={(e) => set("notifyHandoff", e.target.checked)} />
                  Notify me on every handoff
                </label>
              </div>
            </Polsec>

            <Polsec icon={<Icon name="tag" size={17} />} title="Negotiation rule">
              <div className="flex flex-wrap gap-2 mb-3">
                <Chip on={ai.negotiable} onClick={() => set("negotiable", true)}>AI may discount up to a limit</Chip>
                <Chip on={!ai.negotiable} onClick={() => set("negotiable", false)}>AI never negotiates — always hand over</Chip>
              </div>
              {ai.negotiable && (
                <Field label={`Maximum discount  ${ai.maxDiscount}%`}>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={ai.maxDiscount}
                    className="range"
                    style={{ "--fill": `${(ai.maxDiscount / 30) * 100}%` } as React.CSSProperties}
                    onChange={(e) => set("maxDiscount", Number(e.target.value))}
                  />
                  <div className="text-xs text-[#5D7064] mt-1">Beyond this, the AI hands the chat to you.</div>
                </Field>
              )}
            </Polsec>

            <Polsec icon={<Icon name="alert" size={17} />} title="Unknown-answer rule">
              <div className="rulecard">
                <span className="flex-none"><Icon name="alert" size={16} /></span>
                <span>The AI <b>never invents prices or stock</b>. When unsure, it says it will check with you and hands the conversation over. This rule is always on and cannot be disabled — it protects your reputation.</span>
              </div>
            </Polsec>

            <div className="flex gap-2.5">
              <button onClick={save} disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-grn text-white font-semibold text-sm hover:bg-grn-d transition-colors shadow-[0_6px_16px_-6px_rgba(20,154,91,.5)] disabled:opacity-60">
                <Icon name="check" size={15} /> {saved ? "Saved!" : saving ? "Saving..." : "Save configuration"}
              </button>
              <Link href="/dashboard/agent"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-dark text-white font-semibold text-sm hover:bg-[#0C2417] transition-colors">
                <Icon name="chat" size={14} /> Test in Chat Agent
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}