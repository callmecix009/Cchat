"use client";

import { useDeferredValue, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import ProductThumb from "@/components/product-thumb";
import { initials, avColor, fmtDay, fmtClock, type Convo, type Product } from "@/lib/demo";

type Filter = "all" | "ai" | "hand" | "waiting" | "open";

const FILTER_LABELS: Record<Filter, string> = { all: "All", ai: "AI-handled", hand: "Handed-off", waiting: "Waiting", open: "Open" };

function statusBadge(c: Convo) {
  if (c.status === "waiting")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF9E7] border border-[#F5E6C8] text-[11px] font-medium text-[#8A6B2A]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E8A222]" /> Waiting
      </span>
    );
  if (c.status === "closed") return <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-[#E9E9E7] text-[11px] font-medium text-[#9B9B9B]">Closed</span>;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E9E9E7] text-[11px] font-medium text-[#111]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#111]" /> AI live
    </span>
  );
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Convo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobile, setMobile] = useState<"list" | "detail">("list");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<{ type: string; message: string } | null>(null);
  const [wa, setWa] = useState<{ connected: boolean; paused: boolean } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [saleOpen, setSaleOpen] = useState<string | null>(null);
  const [saleStep, setSaleStep] = useState<"ask" | "pick" | "qty">("ask");
  const [saleBusy, setSaleBusy] = useState(false);
  const [saleErr, setSaleErr] = useState<string | null>(null);
  const [selProduct, setSelProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState("1");
  const [freeText, setFreeText] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Run all independent fetches in parallel
    Promise.all([
      fetch("/api/inbox").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/settings").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/workspace").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([inboxData, settingsData, workspaceData]) => {
      const list: Convo[] = inboxData?.conversations ?? [];
      setConversations(list);
      setOpenId((prev) => prev && list.some((c) => c.id === prev) ? prev : list[0]?.id ?? null);
      if (settingsData) setWa({ connected: !!settingsData.whatsappConnected, paused: !!settingsData.whatsappPaused });
      if (workspaceData) setProducts(workspaceData.products ?? []);
    }).finally(() => setLoaded(true));
  }, []);

  const open = conversations.find((c) => c.id === openId) ?? null;
  const totalUnread = (conversations as any[]).reduce((s, c) => s + (c.unreadCount || 0), 0);

  // Mark conversation as read when opened
  useEffect(() => {
    if (!openId) return;
    const conv = conversations.find((c) => c.id === openId) as any;
    if (!conv || !(conv.unreadCount > 0)) return;
    // Optimistic local update
    setConversations((list) => list.map((c) => (c.id === openId ? { ...c, unreadCount: 0 } as any : c)));
    fetch("/api/inbox/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: openId }),
    }).catch(() => {});
  }, [openId]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [open?.msgs?.length, openId]);

  // Deferred so typing stays smooth while the full-text scan runs
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(() => {
    return conversations
      .filter((c) => {
        if (filter === "ai" && c.status !== "ai") return false;
        if (filter === "hand" && c.status !== "waiting") return false;
        if (filter === "waiting") {
          if (c.status === "closed") return false;
          const last = c.msgs[c.msgs.length - 1];
          if (!last || last.from !== "c") return false;
        }
        if (filter === "open" && c.status === "closed") return false;
        if (deferredQuery) {
          const q = deferredQuery.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.msgs.some((m) => (m.text || "").toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => b.t - a.t)
      .slice(0, 100);
  }, [conversations, filter, deferredQuery]);

  const update = (id: string, fn: (c: Convo) => Convo) => {
    setConversations((list) => list.map((c) => (c.id === id ? fn(c) : c)));
  };

  const takeOver = (id: string) => {
    update(id, (c) => ({
      ...c,
      takeover: true,
      status: "waiting",
      reason: c.reason || "Owner took over",
      msgs: [...c.msgs, { from: "sys", text: "Owner took over — AI paused", t: Date.now() }],
    }));
    fetch("/api/inbox/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, status: "waiting" }),
    }).catch(() => {});
  };
  const endTakeOver = (id: string) => {
    update(id, (c) => ({
      ...c,
      takeover: false,
      status: "ai",
      reason: null,
      msgs: [...c.msgs, { from: "sys", text: "AI resumed handling", t: Date.now() }],
    }));
    fetch("/api/inbox/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, status: "ai" }),
    }).catch(() => {});
  };
  const closeConvo = (id: string) => {
    update(id, (c) => ({
      ...c,
      status: "closed",
      takeover: false,
      msgs: [...c.msgs, { from: "sys", text: "Conversation closed", t: Date.now() }],
    }));
    fetch("/api/inbox/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, status: "closed" }),
    }).catch(() => {});
  };
  const reopenConvo = (id: string) => {
    update(id, (c) => ({ ...c, status: "ai" }));
    fetch("/api/inbox/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, status: "ai" }),
    }).catch(() => {});
  };
  const sendReply = async (id: string) => {
    const t = reply.trim();
    if (!t || sending) return;
    const c = conversations.find((x) => x.id === id);
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/inbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: id,
          text: t,
          contactName: c?.name,
          contactPhone: c?.phone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendError({
          type: data?.error || "failed",
          message: data?.message || "Message failed to send. Please try again.",
        });
        return;
      }
      setReply("");
      update(id, (c) => ({
        ...c,
        t: Date.now(),
        takeover: true,
        status: "waiting",
        msgs: [...c.msgs, { from: "me", text: t, t: Date.now() }],
      }));
    } catch {
      setSendError({ type: "failed", message: "Network error — the message was not sent. Check your connection and try again." });
    } finally {
      setSending(false);
    }
  };

  const submitOutcome = async (id: string, outcome: "sold" | "no", productId?: string, quantity?: number) => {
    if (saleBusy) return;
    const c = conversations.find((x) => x.id === id);
    const q = Math.floor(Number(quantity ?? 1));
    if (outcome === "sold" && productId && !(q >= 1)) {
      setSaleErr("Quantity must be at least 1.");
      return;
    }
    if (outcome === "sold" && productId && selProduct && q > selProduct.stock) {
      setSaleErr(`Only ${selProduct.stock} left in stock — lower the quantity.`);
      return;
    }
    setSaleBusy(true);
    setSaleErr(null);
    try {
      const res = await fetch("/api/inbox/outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: id,
          outcome,
          productId,
          quantity: q,
          productName: freeText.trim() || undefined,
          contactName: c?.name,
          contactPhone: c?.phone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaleErr(data?.message || "Couldn't log that. Please try again.");
        return;
      }
      update(id, (c) => ({
        ...c,
        outcome,
        soldProduct: outcome === "sold" ? (data?.soldProduct ?? null) : null,
      }));
      if (data?.product) {
        setProducts((list) =>
          list.map((p) =>
            p.id === data.product.id ? { ...p, stock: data.product.stock, sold: (p.sold ?? 0) + q } : p
          )
        );
      }
      setSaleOpen(null);
      setSaleStep("ask");
      setSelProduct(null);
      setQty("1");
      setFreeText("");
    } catch {
      setSaleErr("Network error — please try again.");
    } finally {
      setSaleBusy(false);
    }
  };

  const prevText = (c: Convo) => {
    const last = c.msgs[c.msgs.length - 1];
    if (!last) return "";
    return (last.from === "ai" ? "AI: " : last.from === "me" ? "You: " : "") + (last.text || "");
  };

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="flex items-center gap-2 font-disp text-[20px] font-semibold tracking-tight text-[#111]">
            Inbox
            {totalUnread > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#111] text-white text-[11px] font-bold leading-none">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
            {totalUnread > 0 && <span className="text-[12px] font-medium text-[#6B6B6B]">{totalUnread} unread</span>}
          </h2>
          <p className="text-[13px] text-[#6B6B6B] mt-1">Every conversation, stored forever. Jump into any chat — the AI pauses instantly.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
          {wa ? (
            wa.connected && !wa.paused ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E3F4E9] border border-[#BCE5CB] text-[11px] font-bold text-[#0E7A47]">
                <span className="relative flex w-2 h-2"><span className="absolute inline-flex h-full w-full rounded-full bg-[#149A5B] opacity-60 animate-ping" /><span className="relative inline-flex w-2 h-2 rounded-full bg-[#149A5B]" /></span> LIVE
              </span>
            ) : (
              <Link href="/settings" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F7F7F5] border border-[#E9E9E7] text-[11px] font-medium text-[#6B6B6B]" title="Open Settings to connect">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B9B9B]" /> WhatsApp {wa.paused ? "paused" : "not connected"}
              </Link>
            )
          ) : null}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-[#E9E9E7] text-[11px] font-medium text-[#6B6B6B]">{conversations.filter((c) => c.status === "ai").length} AI</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FEF9E7] border border-[#F5E6C8] text-[11px] font-medium text-[#8A6B2A]">{conversations.filter((c) => c.status === "waiting").length} waiting</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-[#E9E9E7] text-[11px] font-medium text-[#9B9B9B]">{conversations.filter((c) => c.status === "closed").length} closed</span>
        </div>
      </div>

      {loaded && conversations.length === 0 ? (
        <div className="card" style={{ padding: "46px 24px" }}>
          <div className="empty">
            <span className="ic-big"><Icon name="chat" size={26} /></span>
            <p style={{ marginBottom: 16 }}>
              No conversations yet. Connect WhatsApp and customer chats will appear here instantly.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/settings" className="btn pri">
                <Icon name="zap" size={15} /> Connect WhatsApp
              </Link>
              <Link href="/dashboard/agent" className="btn ghost">
                Try the agent tester first
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="inboxwrap">
          <div className="intoolbar">
            <div className="isearch">
              <input
                className="inp"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, number or keyword…"
              />
              <span style={{ position: "absolute", left: 11, top: 10, color: "var(--mut2)" }}>
                <Icon name="search" size={15} />
              </span>
            </div>
            <div className="ifilters">
              {(["all", "ai", "hand", "waiting", "open"] as Filter[]).map((f) => (
                <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

      <div className="inboxgrid">
        <div className={`ilist ${mobile === "detail" ? "hidden-m" : ""}`}>
          <ul>
            {filtered.length === 0 && (
              <div className="empty">
                <Icon name="search" size={26} />
                <p style={{ marginTop: 8 }}>No conversations match.</p>
              </div>
            )}
            {filtered.map((c) => (
              <li
                key={c.id}
                className={c.id === openId ? "on" : ""}
                onClick={() => {
                  setOpenId(c.id);
                  setMobile("detail");
                }}
                style={(c as any).unreadCount > 0 ? { borderLeft: "2px solid #111" } : undefined}
              >
                <span className="av">{initials(c.name)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nm">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate">{c.name}</span>
                      {(c as any).unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#111] text-white text-[10px] font-bold leading-none shrink-0">
                          {(c as any).unreadCount > 9 ? "9+" : (c as any).unreadCount}
                        </span>
                      )}
                    </span>
                    <time className="shrink-0">{fmtDay(c.t)}</time>
                  </div>
                  <div className="pv">
                    <span className="truncate">{prevText(c)}</span>
                  </div>
                  <div className="meta">
                    {statusBadge(c)}
                    <span className="text-[10px] font-medium tracking-wide uppercase text-[#9B9B9B] px-1.5">{c.lang.toUpperCase()}</span>
                    {c.takeover && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#111] text-white text-[10px] font-medium">You</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={`idetail ${mobile === "list" ? "hidden-m" : ""}`}>
          {!open ? (
            <div className="empty" style={{ margin: "auto" }}>
              <span className="ic-big"><Icon name="chat" size={24} /></span>
              <p>Select a conversation to read the full transcript.</p>
            </div>
          ) : (
            <>
              <div className="dhead">
                <button
                  className="btn ghost xs"
                  style={{ display: "flex" }}
                  onClick={() => setMobile("list")}
                >
                  <Icon name="arrow" size={13} />
                </button>
                <span className="w-9 h-9 rounded-full bg-[#F7F7F5] border border-[#E9E9E7] text-[#6B6B6B] grid place-items-center font-semibold text-[12px] flex-none">
                  {initials(open.name)}
                </span>
                <div className="who">
                  <b>{open.name}</b>
                  <span>{open.phone} · {open.lang.toUpperCase()} conversation</span>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  {statusBadge(open)}
                  {open.reason && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF9E7] border border-[#F5E6C8] text-[11px] font-medium text-[#8A6B2A]" title={open.reason}>
                      <Icon name="hand" size={11} /> {open.reason.slice(0, 26)}
                      {open.reason.length > 26 ? "…" : ""}
                    </span>
                  )}
                </div>
                <div className="acts">
                  {open.takeover ? (
                    <button className="btn pri sm" onClick={() => endTakeOver(open.id)}>
                      <Icon name="bot" size={13} /> End takeover — resume AI
                    </button>
                  ) : open.status !== "closed" ? (
                    <button className="btn grn sm" onClick={() => takeOver(open.id)}>
                      <Icon name="user" size={13} /> Take over
                    </button>
                  ) : null}
                  {open.status !== "closed" ? (
                    <button className="btn ghost sm" onClick={() => closeConvo(open.id)}>Close</button>
                  ) : (
                    <button className="btn ghost sm" onClick={() => reopenConvo(open.id)}>Reopen</button>
                  )}
                </div>
              </div>

              {open.takeover && (
                <div className="takebanner">
                  <Icon name="alert" size={14} /> AI is paused on this conversation — your replies go out directly. End takeover to hand it back.
                </div>
              )}

              <div className="transcript" ref={transcriptRef}>
                {open.msgs.length === 0 && (
                  <div className="sysline">No messages in this conversation yet.</div>
                )}
                {open.msgs.map((m, i) => {
                  if (m.from === "sys")
                    return (
                      <span className="handline" key={i}>
                        <Icon name="hand" size={13} /> {m.text} · {fmtClock(m.t)}
                      </span>
                    );
                  const side = m.from === "c" ? "c" : "a";
                  return (
                    <span className={`bub ${side}`} key={i}>
                      {m.text}
                      <time>
                        {fmtClock(m.t)}
                        {m.from === "ai" && <i className="who-tag">AI</i>}
                        {m.from === "me" && <i className="who-tag me">You</i>}
                      </time>
                    </span>
                  );
                })}
              </div>

              {open.status !== "waiting" && !open.takeover && (
                open.outcome ? (
                  <div className="inote">
                    <Icon name="check" size={14} />
                    {open.outcome === "sold" ? (
                      <>Sale logged — <b>{open.soldProduct || "product"}</b>. Stock was updated.</>
                    ) : (
                      <>No sale logged for this conversation.</>
                    )}
                  </div>
                ) : (
                  <div className="salebar">
                    <button
                      className="btn ghost xs"
                      style={{ flex: "none" }}
                      onClick={() => {
                        setSaleOpen(saleOpen === open.id ? null : open.id);
                        setSaleStep("ask");
                        setSaleErr(null);
                        setSelProduct(null);
                        setQty("1");
                      }}
                    >
                      <Icon name="tag" size={13} /> Did they buy?
                    </button>
                    {saleOpen === open.id && (
                      <div className="salecard">
                        {saleStep === "ask" ? (
                          <>
                            <span className="saleq">Did this customer buy or book anything?</span>
                            <button className="btn pri sm" disabled={saleBusy} onClick={() => setSaleStep("pick")}>
                              <Icon name="check" size={13} /> Yes, they bought
                            </button>
                            <button className="btn ghost sm" disabled={saleBusy} onClick={() => submitOutcome(open.id, "no")}>
                              No sale
                            </button>
                          </>
                        ) : saleStep === "pick" ? (
                          <>
                            <span className="saleq">Which product did they buy?</span>
                            {products.length ? (
                              <div className="saleprods">
                                {products.map((p) => (
                                  <button
                                    key={p.id}
                                    className="saleprod"
                                    disabled={saleBusy || p.stock === 0}
                                    onClick={() => {
                                      setSelProduct(p);
                                      setQty("1");
                                      setSaleErr(null);
                                      setSaleStep("qty");
                                    }}
                                  >
                                    <ProductThumb image={p.image} emoji={p.emoji} name={p.name} cl={p.cl} size={34} radius={8} />
                                    <span className="nm">{p.name}</span>
                                    <span className="st" style={{ color: p.stock === 0 ? "var(--red)" : "var(--mut2)" }}>
                                      {p.stock === 0 ? "out" : p.stock + " left"}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="saleprods" style={{ maxHeight: "none" }}>
                                <input
                                  className="inp"
                                  value={freeText}
                                  onChange={(e) => setFreeText(e.target.value)}
                                  placeholder="Product name…"
                                  autoFocus
                                />
                              </div>
                            )}
                            {!products.length && (
                              <button
                                className="btn pri sm"
                                disabled={saleBusy || !freeText.trim()}
                                onClick={() => submitOutcome(open.id, "sold")}
                              >
                                <Icon name="check" size={13} /> Log as sold
                              </button>
                            )}
                            <button className="btn ghost xs" disabled={saleBusy} onClick={() => setSaleStep("ask")}>
                              Back
                            </button>
                          </>
                        ) : (
                          selProduct && (
                            <>
                              <span className="saleq">How many {selProduct.name} did they buy?</span>
                              <div className="salepicked">
                                <ProductThumb image={selProduct.image} emoji={selProduct.emoji} name={selProduct.name} cl={selProduct.cl} size={30} radius={8} />
                                <span className="nm">{selProduct.name}</span>
                                <span className="st">{selProduct.stock} left in stock</span>
                              </div>
                              <div className="qtyrow">
                                <span className="ql">Quantity</span>
                                <div className="stepq">
                                  <button
                                    type="button"
                                    disabled={saleBusy || Number(qty) <= 1}
                                    onClick={() => setQty((v) => String(Math.max(1, Math.floor(Number(v) || 1) - 1)))}
                                  >
                                    −
                                  </button>
                                  <input
                                    value={qty}
                                    onChange={(e) => {
                                      const n = e.target.value.replace(/[^0-9]/g, "");
                                      setQty(n);
                                    }}
                                    onBlur={() => {
                                      const n = Math.floor(Number(qty));
                                      if (!Number.isFinite(n) || n < 1) setQty("1");
                                      else if (n > selProduct.stock) setQty(String(selProduct.stock));
                                    }}
                                    inputMode="numeric"
                                    aria-label="Quantity"
                                  />
                                  <button
                                    type="button"
                                    disabled={saleBusy || Number(qty) >= selProduct.stock}
                                    onClick={() => setQty((v) => String(Math.min(selProduct.stock, Math.max(1, Math.floor(Number(v) || 1) + 1))))}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <button
                                className="btn pri sm"
                                disabled={saleBusy}
                                onClick={() => submitOutcome(open.id, "sold", selProduct.id, Number(qty))}
                              >
                                <Icon name="check" size={13} /> Confirm purchase
                              </button>
                              <button className="btn ghost xs" disabled={saleBusy} onClick={() => setSaleStep("pick")}>
                                Back
                              </button>
                            </>
                          )
                        )}
                        {saleErr && <span className="saleerr">{saleErr}</span>}
                      </div>
                    )}
                  </div>
                )
              )}

              {open.status === "closed" ? (
                <div className="inote">
                  <Icon name="check" size={14} /> Conversation closed.
                  <button className="btn ghost xs" style={{ marginLeft: "auto" }} onClick={() => reopenConvo(open.id)}>Reopen</button>
                </div>
              ) : (
                <>
                  {sendError && (
                    <div className="inote fail">
                      <Icon name="alert" size={14} />
                      <span>
                        {sendError.message}{" "}
                        {sendError.type === "WHATSAPP_NOT_CONNECTED" && (
                          <Link href="/settings">Connect WhatsApp in Settings</Link>
                        )}
                        {sendError.type === "WHATSAPP_PAUSED" && (
                          <Link href="/settings">Open Settings</Link>
                        )}
                      </span>
                    </div>
                  )}
                  {open.takeover ? (
                    <div className="takebanner">
                      <Icon name="alert" size={14} /> AI is paused on this conversation — your replies go out directly. End takeover to hand it back.
                    </div>
                  ) : open.status === "waiting" ? (
                    <div className="inote">
                      <Icon name="alert" size={14} /> Waiting for you — the AI stopped here. Type below to reply as the owner.
                    </div>
                  ) : (
                    <div className="inote">
                      <Icon name="bot" size={14} /> The AI is handling this conversation live — sending a message takes it over instantly.
                    </div>
                  )}
                  <div className="composer">
                    <input
                      value={reply}
                      onChange={(e) => {
                        setReply(e.target.value);
                        if (sendError) setSendError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) sendReply(open.id);
                      }}
                      placeholder={open.takeover ? "Reply as the owner…" : "Type a message to take over…"}
                      disabled={sending}
                      autoFocus
                    />
                    <button
                      className="sendbtn"
                      onClick={() => sendReply(open.id)}
                      disabled={sending || !reply.trim()}
                      aria-label="Send message"
                    >
                      {sending ? (
                        <svg className="spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                          <path d="M21 12a9 9 0 1 1-6.2-8.56" />
                        </svg>
                      ) : (
                        <Icon name="send" size={17} />
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
        </div>
      )}
    </div>
  );
}