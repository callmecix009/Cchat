"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import {
  createEmptyState,
  agentBrain,
  ownerBrain,
  detectLang,
  type ConvoMsg,
  type DemoState,
} from "@/lib/demo";

type ConvoState = { msgs: ConvoMsg[]; takeover: boolean; lang?: "sw" | "en" };

const HINTS = [
  "Kuna iPhone 13?",
  "Bei ya Galaxy A54?",
  "Nitachukua Tecno Spark 10",
  "Punguza bei kidogo",
  "Mnaleta Mbezi?",
  "Nalipaje kwa M-Pesa?",
  "Screen ya simu imevunjika",
  "Naomba kuongea na mmiliki",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function bubbleMsgs(msgs: ConvoMsg[], ownerFirst: string) {
  if (!msgs.length) return null;
  return (
    <>
      <span className="daysep">Today</span>
      {msgs.map((m, i) => {
        if (m.from === "sys")
          return (
            <span className="handline" key={i}>
              <Icon name="hand" size={13} /> {m.text}
            </span>
          );
        const side = m.from === "c" ? "c" : "a";
        return (
          <span className={`bub ${side}`} key={i}>
            {m.text}
            <time>{new Date(m.t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}</time>
          </span>
        );
      })}
    </>
  );
}

export default function ChatAgentPage() {
  const [state, setState] = useState<DemoState>(() => createEmptyState());
  const stateRef = useRef(state);
  stateRef.current = state;

  const [tab, setTab] = useState<"test" | "owner">("test");
  const [testConvo, setTestConvo] = useState<ConvoState>({ msgs: [], takeover: false });
  const [ownerConvo, setOwnerConvo] = useState<ConvoState>({ msgs: [], takeover: false });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setToast(null), 4200);
    timers.current.push(t);
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, [toast]);

  useEffect(() => {
    Promise.all([
      fetch("/api/workspace").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/ai-config").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/settings").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([wsData, aiData, settingsData]) => {
      setState((prev) => {
        const next = { ...prev };
        if (wsData) {
          next.products = wsData.products ?? [];
          next.services = wsData.services ?? [];
          next.policies = wsData.policies ?? prev.policies;
        }
        if (aiData?.ai) {
          next.ai = {
            ...prev.ai,
            ...aiData.ai,
            trigKeywords: Array.isArray(aiData.ai.trigKeywords) ? aiData.ai.trigKeywords : prev.ai.trigKeywords,
          };
        }
        if (settingsData?.business) {
          next.business = { ...prev.business, ...settingsData.business };
        }
        return next;
      });
    });
  }, []);

  const pushReplies = useCallback((replies: string[], target: "test" | "owner") => {
    setTyping(true);
    const push = (i: number) => {
      if (i >= replies.length) {
        setTyping(false);
        return;
      }
      const msg: ConvoMsg = { from: "ai", text: replies[i], t: Date.now() };
      if (target === "owner") setOwnerConvo((c) => ({ ...c, msgs: [...c.msgs, msg] }));
      else setTestConvo((c) => ({ ...c, msgs: [...c.msgs, msg] }));
      if (i < replies.length - 1) {
        timers.current.push(setTimeout(() => push(i + 1), 700 + Math.random() * 500));
      } else {
        timers.current.push(setTimeout(() => setTyping(false), 400));
      }
    };
    timers.current.push(setTimeout(() => push(0), 800 + Math.random() * 600));
  }, []);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setInput("");
    const st = stateRef.current;
    const ownerFirst = st.business.owner.split(" ")[0];

    if (tab === "owner") {
      setOwnerConvo((c) => ({ ...c, msgs: [...c.msgs, { from: "c", text: t, t: Date.now() }] }));
      pushReplies(ownerBrain(t, st), "owner");
      return;
    }

    const c = testConvo;
    if (c.takeover) {
      setTestConvo((prev) => ({ ...prev, msgs: [...prev.msgs, { from: "me", text: t, t: Date.now() }] }));
      return;
    }
    const lang = detectLang(t, st);
    setTestConvo((prev) => ({ ...prev, lang, msgs: [...prev.msgs, { from: "c", text: t, t: Date.now() }] }));
    const r = agentBrain(t, lang, st);
    if (r.fx.handoff) {
      setTestConvo((prev) => ({
        ...prev,
        takeover: true,
        msgs: [...prev.msgs, { from: "sys", text: "Handoff → " + ownerFirst + " · " + r.fx.handoff, t: Date.now() }],
      }));
      pushReplies([...r.out, "…"], "test");
      setToast("Handoff in test chat — " + r.fx.handoff + " — you are now replying");
    } else {
      pushReplies(r.out, "test");
    }
  };

  const endTakeover = () => {
    setTestConvo((prev) => ({
      takeover: false,
      msgs: [...prev.msgs, { from: "sys", text: "AI resumed on this chat", t: Date.now() }],
    }));
  };

  const reset = () => setTestConvo({ msgs: [], takeover: false });

  const isOwner = tab === "owner";
  const convo = isOwner ? ownerConvo : testConvo;
  const body = isOwner ? ownerConvo.msgs : testConvo.msgs;
  const placeholder = isOwner
    ? "Ask about your business… e.g. “Summarize yesterday’s chats”"
    : testConvo.takeover
      ? "Reply as the owner…"
      : "Andika kama mteja… e.g. “Kuna iPhone 13?”";

  const ai = state.ai;
  const swPct = Math.round((state.stats.swMsgs / (state.stats.swMsgs + state.stats.enMsgs)) * 100);
  const max = Math.max(...state.msgsByDay) * 1.18;
  const bw = 620 / state.msgsByDay.length;

  return (
    <div className="viewwrap max-w-[1240px] mx-auto">
      <div className="section-h">
        <div>
          <h2>Chat Agent</h2>
          <p>Verify exactly how your AI talks — before your customers ever meet it.</p>
        </div>
      </div>

      <div className="agent-tabs">
        <button className={`atab ${tab === "test" ? "on" : ""}`} onClick={() => setTab("test")}>
          <Icon name="chat" size={16} /> Test the agent <span className="td">· behaves exactly like live</span>
        </button>
        <button className={`atab ${tab === "owner" ? "on" : ""}`} onClick={() => setTab("owner")}>
          <Icon name="user" size={16} /> Owner mode <span className="td">· your business assistant</span>
        </button>
      </div>

      <div className="agentgrid">
        <div className="phone">
          <div className="ph">
            <span className="avatar">{isOwner ? "👤" : "🧪"}</span>
            <div>
              <div className="nm">{isOwner ? "You ↔ your AI assistant" : "Test customer"}</div>
              <div className="st">{isOwner ? "Answers with your real business data" : "Simulated — using live products, services & policies"}</div>
            </div>
            <span style={{ marginLeft: "auto" }}>
              {!isOwner && (
                <button className="btn xs" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={reset}>
                  <Icon name="refresh" size={12} /> Reset
                </button>
              )}
            </span>
          </div>

          {tab === "test" && testConvo.takeover && (
            <div className="takebanner">
              <Icon name="user" size={15} /> You are replying now — the AI is paused on this test chat.
              <button className="btn xs" style={{ background: "#fff", color: "#7A5205", marginLeft: "auto" }} onClick={endTakeover}>
                Resume AI
              </button>
            </div>
          )}

          <div className="pbody">
            {body.length === 0 ? (
              <>
                <span className="daysep">Today</span>
                {isOwner ? (
                  <span className="bub a" style={{ maxWidth: "85%" }}>
                    Habari {state.business.owner.split(" ")[0]}! 👋 I&apos;m your business assistant. Ask me anything about your shop — sales, stock, customers, handoffs.
                  </span>
                ) : (
                  <>
                    <span className="bub a" style={{ maxWidth: "85%" }}>{ai.greetSw}</span>
                    <span className="sysline">This simulator uses your LIVE catalog, services, policies and AI settings.</span>
                  </>
                )}
              </>
            ) : (
              bubbleMsgs(body, state.business.owner.split(" ")[0])
            )}
            {typing && (
              <span className="bub a typing">
                <i /><i /><i />
              </span>
            )}
          </div>

          {tab === "test" && !testConvo.takeover && (
            <div className="hintchips">
              {HINTS.map((h) => (
                <button key={h} onClick={() => setInput(h)}>{h}</button>
              ))}
            </div>
          )}

          <div className="composer">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder={placeholder}
            />
            <button className="sendbtn" onClick={send} aria-label="Send">
              <Icon name="send" size={17} />
            </button>
          </div>
        </div>

        <div>
          <div className="sidecard">
            <h4>
              <Icon name="zap" size={15} /> Agent brain — live inputs
            </h4>
            <div className="krow"><span>Products known</span><b>{state.products.filter((p) => !p.hidden).length}</b></div>
            <div className="krow"><span>Services known</span><b>{state.services.length}</b></div>
            <div className="krow"><span>Policy sections</span><b>7</b></div>
            <div className="krow"><span>Language</span><b>{ai.langMode === "auto" ? "Auto (SW first)" : ai.langMode.toUpperCase()}</b></div>
            <div className="krow"><span>Tone</span><b style={{ textTransform: "capitalize" }}>{ai.tone}</b></div>
            <div className="krow"><span>Max discount</span><b>{ai.negotiable ? ai.maxDiscount + "%" : "never"}</b></div>
            <div className="krow"><span>Proactive follow-ups</span><b>{ai.proactive ? "On · " + ai.pushiness + "%" : "Off"}</b></div>
            <div className="krow"><span>Upsell</span><b>{ai.upsell ? "On" : "Off"}</b></div>
          </div>

          <div className="sidecard">
            <h4>
              <Icon name="alert" size={15} /> Handoff triggers armed
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                ["Asks for human", ai.trigHuman],
                ["Negotiation > " + ai.maxDiscount + "%", ai.trigNegotiation],
                ["Angry customer", ai.trigAngry],
                ["Keywords (" + ai.trigKeywords.length + ")", ai.trigKeywords.length > 0],
              ].map(([label, on]) =>
                on ? (
                  <span className="badge b-grn" key={label as string}>
                    <Icon name="check" size={11} /> {label}
                  </span>
                ) : (
                  <span className="badge b-mut" key={label as string}>{label}</span>
                )
              )}
            </div>
          </div>

          <div className="sidecard">
            <h4>
              <Icon name="edit" size={15} /> Change behaviour
            </h4>
            <p style={{ fontSize: 12.5, color: "var(--mut)", marginBottom: 10 }}>
              Anything the agent gets wrong here, fix it in AI Configure or Policies — changes apply instantly.
            </p>
            <Link href="/dashboard/ai" className="btn ghost sm wide">
              <Icon name="sliders" size={14} /> Open AI Configure
            </Link>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast warn" style={{ position: "fixed", top: 74, right: 18, zIndex: 4000 }}>
          <span className="ti"><Icon name="alert" size={17} /></span>
          <div><b>Handoff in test chat</b><span>{toast}</span></div>
        </div>
      )}
    </div>
  );
}