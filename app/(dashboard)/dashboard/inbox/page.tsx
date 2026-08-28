"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { initials, avColor, fmtDay, fmtClock, type Convo, type Product } from "@/lib/demo";

type Filter = "all" | "ai" | "hand" | "waiting" | "open";

const FILTER_LABELS: Record<Filter, string> = { all: "All", ai: "AI-handled", hand: "Handed-off", waiting: "Waiting", open: "Open" };

function statusBadge(c: Convo) {
  if (c.status === "waiting")
    return (
      <span className="badge b-amb">
        <span className="dot a" /> Waiting
      </span>
    );
  if (c.status === "closed") return <span className="badge b-mut">Closed</span>;
  return (
    <span className="badge b-grn">
      <span className="dot g" /> AI
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
        if (query) {
          const q = query.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.msgs.some((m) => (m.text || "").toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => b.t - a.t);
  }, [conversations, filter, query]);

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
    <div className="viewwrap max-w-[1240px] mx-auto">
      <div className="section-h">
        <div>
          <h2>Inbox</h2>
          <p>Every conversation, stored forever. Jump into any chat — the AI pauses instantly.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {wa ? (
            wa.connected && !wa.paused ? (
              <span className="badge b-grn">
                <span className="dot g" /> WhatsApp connected — replies delivered
              </span>
            ) : (
              <Link href="/settings" className="badge b-amb" title="Open Settings to connect">
                <span className="dot a" /> WhatsApp {wa.paused ? "paused" : "not connected"}
              </Link>
            )
          ) : null}
          <span className="badge b-grn">{conversations.filter((c) => c.status === "ai").length} AI handling</span>
          <span className="badge b-amb">{conversations.filter((c) => c.status === "waiting").length} waiting</span>
          <span className="badge b-mut">{conversations.filter((c) => c.status === "closed").length} closed</span>
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
              >
                <span className="av" style={{ background: avColor(c.name) }}>{initials(c.name)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nm">
                    {c.name}
                    <time>{fmtDay(c.t)}</time>
                  </div>
                  <div className="pv">{prevText(c)}</div>
                  <div className="meta">
                    {statusBadge(c)}
                    <span className={`badge ${c.lang === "sw" ? "b-grn" : "b-blu"}`}>{c.lang.toUpperCase()}</span>
                    {c.takeover && <span className="badge b-ink">You</span>}
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
                <span
                  className="av"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: avColor(open.name),
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {initials(open.name)}
                </span>
                <div className="who">
                  <b>{open.name}</b>
                  <span>{open.phone} · {open.lang.toUpperCase()} conversation</span>
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {statusBadge(open)}
                  {open.reason && (
                    <span className="badge b-red" title={open.reason}>
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
                    <button className="btn dark sm" onClick={() => takeOver(open.id)}>
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

              <div className="transcript">
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
                                    <span className="pth" style={{ background: p.cl }}>{p.emoji}</span>
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
                                <span className="pth" style={{ background: selProduct.cl }}>{selProduct.emoji}</span>
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