"use client";

import { useDeferredValue, useEffect, useMemo, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import ProductThumb from "@/components/product-thumb";
import { InboxSkeleton } from "@/components/skeletons";
import { initials, fmtDay, fmtClock, type Convo, type Product } from "@/lib/demo";

type Filter = "all" | "ai" | "human" | "unread" | "closed";
type UiState = "ai" | "human" | "waiting" | "closed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI Handled" },
  { id: "human", label: "Human" },
  { id: "unread", label: "Unread" },
  { id: "closed", label: "Closed" },
];

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😎", "🤔",
  "😅", "😭", "😡", "🥳", "😇", "😴", "🤗", "🙌",
  "👍", "👎", "🙏", "👏", "💪", "👌", "🤝", "👀",
  "🔥", "🎉", "✅", "❌", "❓", "❗", "💯", "⭐",
  "❤️", "💔", "🎁", "💰", "📱", "🚚", "📦", "🏪",
];

function lastMsg(c: Convo) {
  return c.msgs.length ? c.msgs[c.msgs.length - 1] : null;
}

function activityT(c: Convo) {
  const l = lastMsg(c);
  return Math.max(c.t || 0, l?.t || 0);
}

/** Presentation layer — derives friendly UI state from existing status + takeover. No DB change. */
function uiState(c: Convo): UiState {
  if (c.status === "closed") return "closed";
  if (c.takeover) return "human";
  if (c.status === "waiting") {
    const l = lastMsg(c);
    if (l && l.from === "c") return "waiting";
    return "human";
  }
  return "ai";
}

function statePill(s: UiState) {
  if (s === "waiting")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full bg-[#FEF9E7] border border-[#F5E6C8] text-[10.5px] font-semibold text-[#8A6B2A] whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E8A222]" /> Needs reply
      </span>
    );
  if (s === "closed")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full bg-white border border-[#E9E9E7] text-[10.5px] font-semibold text-[#9B9B9B] whitespace-nowrap">
        Closed
      </span>
    );
  if (s === "human")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full bg-white border border-[#E9E9E7] text-[10.5px] font-semibold text-[#111] whitespace-nowrap">
        <Icon name="user" size={10} /> Human
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full bg-white border border-[#E9E9E7] text-[10.5px] font-semibold text-[#111] whitespace-nowrap">
      <Icon name="bot" size={10} /> AI Agent
    </span>
  );
}

function dayLabel(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, now)) return "Today";
  const y = new Date(now.getTime() - 864e5);
  if (sameDay(d, y)) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function dayKey(ts: number) {
  return new Date(ts).toDateString();
}

function langLabel(l: string) {
  return l === "sw" ? "Swahili" : l === "en" ? "English" : (l || "—").toUpperCase();
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
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attach, setAttach] = useState<{ file: File; preview: string } | null>(null);
  const [wa, setWa] = useState<{ connected: boolean; paused: boolean } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [saleOpen, setSaleOpen] = useState<string | null>(null);
  const [saleStep, setSaleStep] = useState<"ask" | "pick" | "qty">("ask");
  const [saleBusy, setSaleBusy] = useState(false);
  const [saleErr, setSaleErr] = useState<string | null>(null);
  const [selProduct, setSelProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState("1");
  const [freeText, setFreeText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactTab, setContactTab] = useState<"Details" | "Products" | "Services" | "Notes">("Details");
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [activityOpen, setActivityOpen] = useState(true);
  const [saleSectionOpen, setSaleSectionOpen] = useState(false);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const atBottomRef = useRef(true);
  const openIdRef = useRef<string | null>(null);
  openIdRef.current = openId;

  const loadAll = useCallback(async (silent = false) => {
    try {
      const [inboxRes, settingsRes, workspaceRes] = await Promise.all([
        fetch("/api/inbox").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/settings").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/workspace").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      const inboxList = inboxRes?.conversations;
      if (Array.isArray(inboxList)) {
        const list: Convo[] = inboxList;
        setConversations((prev) => {
          // Preserve optimistic takeover flags across silent polls (server always returns takeover:false)
          if (!silent || prev.length === 0) return list;
          const prevMap = new Map(prev.map((c) => [c.id, c]));
          return list.map((c) => {
            const p = prevMap.get(c.id);
            if (p && p.takeover && c.status === "waiting") return { ...c, takeover: true, reason: p.reason };
            return c;
          });
        });
        setOpenId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0]?.id ?? prev ?? null));
      }
      if (settingsRes) setWa({ connected: !!settingsRes.whatsappConnected, paused: !!settingsRes.whatsappPaused });
      if (workspaceRes) setProducts(workspaceRes.products ?? []);
    } finally {
      if (!silent) setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAll(false);
  }, [loadAll]);

  // Light realtime polling — same GET /api/inbox contract, no extra data loaded.
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      loadAll(true);
    }, 10000);
    return () => clearInterval(id);
  }, [loaded, loadAll]);

  const open = conversations.find((c) => c.id === openId) ?? null;
  const openState: UiState | null = open ? uiState(open) : null;
  const totalUnread = (conversations as any[]).reduce((s, c) => s + (c.unreadCount || 0), 0);

  // Mark conversation as read when opened — preserved architecture.
  useEffect(() => {
    if (!openId) return;
    const conv = conversations.find((c) => c.id === openId) as any;
    if (!conv || !(conv.unreadCount > 0)) return;
    setConversations((list) => list.map((c) => (c.id === openId ? { ...c, unreadCount: 0 } as any : c)));
    fetch("/api/inbox/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: openId }),
    })
      .then(() => window.dispatchEvent(new Event("inbox:read")))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const scrollToBottom = useCallback((instant = false) => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: instant ? "auto" : "smooth" });
    setShowNewMsg(false);
  }, []);

  // When opening a conversation: scroll to newest, keep composer visible.
  useEffect(() => {
    atBottomRef.current = true;
    setShowNewMsg(false);
    setEmojiOpen(false);
    setAttach((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return null;
    });
    // Wait for render, then jump to bottom
    const t = requestAnimationFrame(() => {
      if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    });
    return () => cancelAnimationFrame(t);
  }, [openId]);

  // Track scroll: if user reads older messages, don't force-scroll; show "New messages".
  const onTranscriptScroll = useCallback(() => {
    const el = transcriptRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
    atBottomRef.current = nearBottom;
    if (nearBottom) setShowNewMsg(false);
  }, []);

  const prevMsgCountRef = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!open) return;
    const prev = prevMsgCountRef.current[open.id] ?? open.msgs.length;
    if (open.msgs.length > prev) {
      if (atBottomRef.current) {
        requestAnimationFrame(() => {
          if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        });
      } else {
        setShowNewMsg(true);
      }
    }
    prevMsgCountRef.current[open.id] = open.msgs.length;
  }, [open?.msgs.length, open?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Deferred so typing stays smooth while the full-text scan runs
  const deferredQuery = useDeferredValue(query);

  const counts = useMemo(() => {
    const unread = conversations.filter((c) => (c as any).unreadCount > 0).length;
    return {
      all: conversations.length,
      ai: conversations.filter((c) => c.status === "ai").length,
      human: conversations.filter((c) => uiState(c) === "human" || uiState(c) === "waiting").length,
      unread,
      closed: conversations.filter((c) => c.status === "closed").length,
    };
  }, [conversations]);

  const filtered = useMemo(() => {
    return conversations
      .filter((c) => {
        const st = uiState(c);
        if (filter === "ai" && c.status !== "ai") return false;
        if (filter === "human" && !(st === "human" || st === "waiting")) return false;
        if (filter === "unread" && !((c as any).unreadCount > 0)) return false;
        if (filter === "closed" && c.status !== "closed") return false;
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
      .sort((a, b) => activityT(b) - activityT(a))
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
    setMenuOpen(false);
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
    setMenuOpen(false);
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
    setMenuOpen(false);
    fetch("/api/inbox/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, status: "closed" }),
    }).catch(() => {});
  };
  const reopenConvo = (id: string) => {
    update(id, (c) => ({ ...c, status: "ai" }));
    setMenuOpen(false);
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
      atBottomRef.current = true;
      update(id, (cc) => ({
        ...cc,
        t: Date.now(),
        takeover: true,
        status: "waiting",
        msgs: [...cc.msgs, { from: "me", text: t, t: Date.now() }],
      }));
      requestAnimationFrame(() => {
        if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      });
    } catch {
      setSendError({ type: "failed", message: "Network error — the message was not sent. Check your connection and try again." });
    } finally {
      setSending(false);
    }
  };

  const insertEmoji = (e: string) => {
    const el = taRef.current;
    const start = el?.selectionStart ?? reply.length;
    const end = el?.selectionEnd ?? reply.length;
    setReply(reply.slice(0, start) + e + reply.slice(end));
    if (sendError) setSendError(null);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = start + e.length;
      el.setSelectionRange(pos, pos);
      el.style.height = "auto";
      el.style.height = Math.min(110, el.scrollHeight) + "px";
    });
  };

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
      setSendError({ type: "INVALID_TYPE", message: "Only JPG, PNG or WebP images are supported." });
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      setSendError({ type: "INVALID_SIZE", message: "Image must be smaller than 4 MB." });
      return;
    }
    setAttach((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return { file: f, preview: URL.createObjectURL(f) };
    });
    setSendError(null);
  };

  const clearAttach = () => {
    setAttach((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const sendImage = async (id: string) => {
    if (!attach || sending) return;
    const c = conversations.find((x) => x.id === id);
    const caption = reply.trim();
    setSending(true);
    setSendError(null);
    try {
      const fd = new FormData();
      fd.append("conversationId", id);
      fd.append("caption", caption);
      if (c?.name) fd.append("contactName", c.name);
      if (c?.phone) fd.append("contactPhone", c.phone);
      fd.append("file", attach.file);
      const res = await fetch("/api/inbox/image", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendError({
          type: data?.error || "failed",
          message: data?.message || "Image failed to send. Please try again.",
        });
        return;
      }
      const text = caption ? `[image] ${caption}` : "[image]";
      setReply("");
      clearAttach();
      atBottomRef.current = true;
      update(id, (cc) => ({
        ...cc,
        t: Date.now(),
        takeover: true,
        status: "waiting",
        msgs: [...cc.msgs, { from: "me", text, t: Date.now() }],
      }));
      requestAnimationFrame(() => {
        if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      });
    } catch {
      setSendError({ type: "failed", message: "Network error — the image was not sent. Check your connection and try again." });
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
      if (data?.alreadyLogged) {
        update(id, (cc) => ({ ...cc, outcome: (cc.outcome ?? outcome) as "sold" | "no", soldProduct: data?.soldProduct ?? cc.soldProduct }));
        setSaleOpen(null);
        return;
      }
      update(id, (cc) => ({
        ...cc,
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
    if (last.from === "sys") return last.text || "";
    return (last.from === "ai" ? "AI: " : last.from === "me" ? "You: " : "") + (last.text || "");
  };

  const recentActivity = useMemo(() => {
    if (!open) return [];
    return [...open.msgs].slice(-6).reverse().map((m, i) => {
      if (m.from === "sys") return { label: m.text, sub: null as string | null, t: m.t, k: `s${i}` };
      if (m.from === "c") return { label: "Customer message", sub: (m.text || "").slice(0, 80), t: m.t, k: `c${i}` };
      if (m.from === "ai") return { label: "AI Agent replied", sub: (m.text || "").slice(0, 80), t: m.t, k: `a${i}` };
      return { label: "You replied", sub: (m.text || "").slice(0, 80), t: m.t, k: `m${i}` };
    });
  }, [open]);

  const msgStats = useMemo(() => {
    if (!open) return null;
    return {
      total: open.msgs.length,
      customer: open.msgs.filter((m) => m.from === "c").length,
      ai: open.msgs.filter((m) => m.from === "ai").length,
      human: open.msgs.filter((m) => m.from === "me").length,
    };
  }, [open]);

  const resetSale = (id: string) => {
    setSaleOpen(saleOpen === id ? null : id);
    setSaleStep("ask");
    setSaleErr(null);
    setSelProduct(null);
    setQty("1");
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full">
      {!loaded ? (
        <InboxSkeleton />
      ) : conversations.length === 0 ? (
        <div className="flex-1 min-h-0 overflow-auto p-4 sm:p-6">
        <div className="card mx-auto max-w-[560px]" style={{ padding: "46px 24px" }}>
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
        </div>
      ) : (
        <div className="inbox-pro bg-white overflow-hidden flex flex-1 min-h-0">
          {/* ============ LEFT: conversation list ============ */}
          <aside className={`w-full md:w-[300px] lg:w-[310px] flex-none flex-col border-r border-[#E9E9E7] bg-white min-h-0 ${mobile === "detail" ? "hidden md:flex" : "flex"}`}>
            <div className="flex-none p-3 border-b border-[#E9E9E7]">
              <div className="flex gap-2">
                <button
                  className="btn ghost xs !px-2 flex-none md:hidden"
                  onClick={() => window.dispatchEvent(new Event("cchat:open-nav"))}
                  aria-label="Open menu"
                >
                  <Icon name="menu" size={15} />
                </button>
                <div className="relative flex-1 min-w-0">
                  <input
                    className="inp !pl-9 !py-2 !text-[13px]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, phone number or message..."
                    aria-label="Search conversations"
                  />
                  <span className="absolute left-3 top-[9px] text-[#9B9B9B]">
                    <Icon name="search" size={14} />
                  </span>
                </div>
                <button className="btn ghost xs !px-2.5 flex-none" title="Filters" aria-label="Filters">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                </button>
              </div>
              <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-0.5" role="tablist" aria-label="Conversation filters">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[11.5px] font-semibold whitespace-nowrap border transition-colors flex-none ${filter === f.id ? "bg-[#111] text-white border-[#111]" : "bg-white text-[#6B6B6B] border-[#E9E9E7] hover:border-[#111] hover:text-[#111]"}`}
                  >
                    {f.label}
                    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${filter === f.id ? "bg-white/20 text-white" : "bg-[#F1F1EF] text-[#6B6B6B]"}`}>
                      {counts[f.id]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto min-h-0 divide-y divide-[#F1F1EF]">
              {filtered.length === 0 && (
                <div className="empty !py-10">
                  <Icon name="search" size={24} />
                  <p className="!mt-2 text-[13px]">No conversations match.</p>
                </div>
              )}
              {filtered.map((c) => {
                const unread = (c as any).unreadCount > 0 ? (c as any).unreadCount : 0;
                const st = uiState(c);
                const active = c.id === openId;
                return (
                  <li
                    key={c.id}
                    onClick={() => {
                      setOpenId(c.id);
                      setMobile("detail");
                      setMenuOpen(false);
                    }}
                    className={`flex gap-2.5 px-3 py-2.5 cursor-pointer transition-colors items-start ${active ? "bg-[#F1F1EF] border-l-2 border-l-[#111]" : "hover:bg-[#F7F7F5] border-l-2 border-l-transparent"}`}
                  >
                    <span className="w-10 h-10 rounded-full bg-[#F1F1EF] border border-[#E9E9E7] text-[#6B6B6B] grid place-items-center font-bold text-[14px] flex-none">
                      {initials(c.name).slice(0, 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className={`truncate text-[13.5px] leading-tight ${unread ? "font-bold text-[#111]" : "font-semibold text-[#111]"}`}>{c.name}</span>
                        <time className="ml-auto flex-none text-[10.5px] text-[#9B9B9B] font-mono">{fmtDay(c.t && c.msgs.length ? activityT(c) : c.t).split(" ").slice(0, 2).join(" ")}</time>
                      </div>
                      <div className="flex items-center gap-2 min-w-0 mt-0.5">
                        <span className={`flex-1 min-w-0 truncate text-[12.5px] leading-snug ${unread ? "text-[#111] font-medium" : "text-[#6B6B6B]"}`}>{prevText(c)}</span>
                        {unread > 0 && (
                          <span className="flex-none inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#111] text-white text-[10px] font-bold leading-none">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {statePill(st)}
                        {c.takeover && <span className="inline-flex items-center px-1.5 py-[2px] rounded-full bg-[#111] text-white text-[9.5px] font-bold">You</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* ============ CENTER: active conversation ============ */}
          <section className={`flex-1 min-w-0 flex-col bg-white min-h-0 ${mobile === "list" ? "hidden md:flex" : "flex"}`}>
            {!open ? (
              <div className="empty m-auto">
                <span className="ic-big"><Icon name="chat" size={24} /></span>
                <p>Select a conversation to read the full transcript.</p>
              </div>
            ) : (
              <>
                <header className="flex-none border-b border-[#E9E9E7] bg-white px-3 sm:px-4 py-2.5 flex items-center gap-2.5 min-w-0">
                  <button className="btn ghost xs md:!hidden flex-none" onClick={() => setMobile("list")} aria-label="Back to list">
                    <Icon name="arrow" size={13} />
                  </button>
                  <span className="w-10 h-10 rounded-full bg-[#F1F1EF] border border-[#E9E9E7] text-[#6B6B6B] grid place-items-center font-bold text-[14px] flex-none">
                    {initials(open.name).slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <b className="truncate text-[14px] text-[#111]">{open.name}</b>
                    </div>
                    <div className="flex items-center gap-2 min-w-0 mt-0.5">
                      <span className="truncate text-[11.5px] text-[#9B9B9B] font-mono">{open.phone}</span>
                      <span className="hidden sm:inline-flex flex-none">
                        {openState === "ai" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-[#F7F7F5] border border-[#E9E9E7] text-[10.5px] font-semibold text-[#6B6B6B]"><Icon name="bot" size={10} /> AI Agent · Handling</span>
                        ) : openState === "human" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-[#111] text-white text-[10.5px] font-semibold"><Icon name="user" size={10} /> You · Handling</span>
                        ) : openState === "waiting" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-[#FEF9E7] border border-[#F5E6C8] text-[10.5px] font-semibold text-[#8A6B2A]"><span className="w-1.5 h-1.5 rounded-full bg-[#E8A222]" /> Needs reply</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-[2px] rounded-full bg-white border border-[#E9E9E7] text-[10.5px] font-semibold text-[#9B9B9B]">Closed</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex-none flex items-center gap-1.5">
                    {openState === "ai" ? (
                      <button className="btn dark sm !py-1.5 !px-3.5 !text-[12px]" onClick={() => takeOver(open.id)}>Take over</button>
                    ) : openState === "human" || openState === "waiting" ? (
                      <button className="btn ghost sm !py-1.5 !px-3.5 !text-[12px]" onClick={() => endTakeOver(open.id)}><Icon name="bot" size={13} /> Return to AI</button>
                    ) : (
                      <button className="btn ghost sm !py-1.5 !px-3.5 !text-[12px]" onClick={() => reopenConvo(open.id)}>Reopen</button>
                    )}
                    <button className="xl:!hidden btn ghost xs !px-2" onClick={() => setContactOpen(true)} aria-label="Contact details">
                      <Icon name="user" size={14} />
                    </button>
                    <div className="relative">
                      <button className="btn ghost xs !px-2" onClick={() => setMenuOpen((v) => !v)} aria-label="Conversation actions">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" /></svg>
                      </button>
                      {menuOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                          <div className="absolute right-0 top-9 z-40 w-44 bg-white border border-[#E9E9E7] rounded-[10px] shadow-lg p-1">
                            {open.status !== "closed" ? (
                              <button className="w-full text-left px-3 py-2 text-[13px] rounded-[7px] hover:bg-[#F7F7F5]" onClick={() => closeConvo(open.id)}>Close conversation</button>
                            ) : (
                              <button className="w-full text-left px-3 py-2 text-[13px] rounded-[7px] hover:bg-[#F7F7F5]" onClick={() => reopenConvo(open.id)}>Reopen conversation</button>
                            )}
                            <button className="w-full text-left px-3 py-2 text-[13px] rounded-[7px] hover:bg-[#F7F7F5]" onClick={() => { setContactOpen(true); setMenuOpen(false); }}>View contact</button>
                            <button className="w-full text-left px-3 py-2 text-[13px] rounded-[7px] hover:bg-[#F7F7F5]" onClick={() => { resetSale(open.id); setMenuOpen(false); }}>Log sale / outcome</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </header>

                {open.takeover && open.status !== "closed" && (
                  <div className="takebanner flex-none">
                    <Icon name="alert" size={14} /> AI is paused — your replies go out directly. Return to AI to hand it back.
                  </div>
                )}

                <div ref={transcriptRef} onScroll={onTranscriptScroll} className="transcript flex-1 overflow-y-auto min-h-0 relative">
                  {open.msgs.length === 0 && <div className="sysline">No messages in this conversation yet.</div>}
                  {open.msgs.map((m, i) => {
                    const showDay = i === 0 || dayKey(m.t) !== dayKey(open.msgs[i - 1].t);
                    const prev = i > 0 ? open.msgs[i - 1] : null;
                    // Group consecutive same-side messages: sender label only on the first of a group
                    const newGroup = showDay || !prev || prev.from === "sys" || prev.from !== m.from;
                    if (m.from === "sys") {
                      const take = /took over|paused/i.test(m.text);
                      const resumed = /resumed/i.test(m.text);
                      return (
                        <span key={i} className="msg-group">
                          {showDay && <span className="mx-auto my-1 inline-flex self-center px-2.5 py-1 rounded-full bg-[#F1F1EF] text-[10.5px] font-semibold text-[#9B9B9B]">{dayLabel(m.t)}</span>}
                          <span className="mx-auto flex items-center gap-2 max-w-full px-3 py-1 rounded-full bg-[#F7F7F5] border border-[#E9E9E7] text-[11.5px] font-medium text-[#6B6B6B] self-center whitespace-nowrap overflow-hidden">
                            <span className="truncate">{take ? "You took over this conversation" : resumed ? "AI resumed handling this conversation" : m.text}</span>
                          </span>
                        </span>
                      );
                    }
                    const incoming = m.from === "c";
                    const isAI = m.from === "ai";
                    return (
                      <span key={i} className={`flex flex-col min-w-0 ${incoming ? "items-start" : "items-end"}${newGroup ? " msg-group" : ""}`}>
                        {showDay && <span className="mx-auto my-1 inline-flex self-center px-2.5 py-1 rounded-full bg-[#F1F1EF] text-[10.5px] font-semibold text-[#9B9B9B]">{dayLabel(m.t)}</span>}
                        <span className={`msg-bub ${incoming ? "msg-in" : "msg-out"}`}>
                          {!incoming && newGroup && (
                            <span className="msg-meta">
                              <Icon name={isAI ? "bot" : "user"} size={11} />
                              {isAI ? "AI Agent" : "You"}
                            </span>
                          )}
                          {incoming && newGroup && (
                            <span className="msg-meta-in">
                              <span className="w-5 h-5 rounded-full bg-[#F1F1EF] border border-[#E9E9E7] grid place-items-center text-[9px] font-bold text-[#6B6B6B] flex-none">{initials(open.name).slice(0, 1)}</span>
                              {open.name.split(" ")[0]}
                            </span>
                          )}
                          <span className="msg-text">{m.text}</span>
                          <time className="msg-time">
                            {fmtClock(m.t)}
                            {!incoming && (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><polyline points="20 6 9 17 4 12" /></svg>
                            )}
                          </time>
                        </span>
                      </span>
                    );
                  })}

                  {/* Did they buy? — natural conversation action */}
                  {open.status !== "closed" && !open.outcome && (
                    <div className="mx-auto w-full max-w-[520px] bg-white border border-[#E9E9E7] rounded-[12px] p-3.5 mt-1">
                      <div className="flex items-start gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-[#F1F1EF] border border-[#E9E9E7] grid place-items-center flex-none"><Icon name="tag" size={14} /></span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-[#111]">Did they buy?</p>
                          <p className="text-[12px] text-[#6B6B6B]">Log sale or outcome for this conversation.</p>
                        </div>
                      </div>
                      {saleOpen !== open.id ? (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <button className="btn dark sm justify-center" onClick={() => { resetSale(open.id); setSaleStep("pick"); }}>Yes, log a sale</button>
                          <button className="btn ghost sm justify-center" disabled={saleBusy} onClick={() => submitOutcome(open.id, "no")}>No sale</button>
                        </div>
                      ) : (
                        <div className="mt-3 border-t border-[#F1F1EF] pt-3">
                          {saleStep === "ask" && (
                            <div className="grid grid-cols-2 gap-2">
                              <button className="btn dark sm justify-center" disabled={saleBusy} onClick={() => setSaleStep("pick")}>Yes, they bought</button>
                              <button className="btn ghost sm justify-center" disabled={saleBusy} onClick={() => submitOutcome(open.id, "no")}>No sale</button>
                            </div>
                          )}
                          {saleStep === "pick" && (
                            <>
                              <p className="text-[12.5px] font-bold text-[#111] mb-2">Which product did they buy?</p>
                              {products.length ? (
                                <div className="max-h-[168px] overflow-auto flex flex-col gap-1">
                                  {products.map((p) => (
                                    <button
                                      key={p.id}
                                      className="saleprod"
                                      disabled={saleBusy || p.stock === 0}
                                      onClick={() => { setSelProduct(p); setQty("1"); setSaleErr(null); setSaleStep("qty"); }}
                                    >
                                      <ProductThumb image={p.image} emoji={p.emoji} name={p.name} cl={p.cl} size={32} radius={8} />
                                      <span className="nm">{p.name}</span>
                                      <span className="st" style={{ color: p.stock === 0 ? "var(--red)" : "var(--mut2)" }}>{p.stock === 0 ? "out" : `${p.stock} left`}</span>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <input className="inp" value={freeText} onChange={(e) => setFreeText(e.target.value)} placeholder="Product name…" autoFocus />
                              )}
                              {!products.length && (
                                <button className="btn dark sm mt-2" disabled={saleBusy || !freeText.trim()} onClick={() => submitOutcome(open.id, "sold")}>
                                  Log as sold
                                </button>
                              )}
                              <button className="btn ghost xs mt-2" disabled={saleBusy} onClick={() => setSaleStep("ask")}>Back</button>
                            </>
                          )}
                          {saleStep === "qty" && selProduct && (
                            <>
                              <p className="text-[12.5px] font-bold text-[#111]">How many {selProduct.name} did they buy?</p>
                              <div className="salepicked mt-2">
                                <ProductThumb image={selProduct.image} emoji={selProduct.emoji} name={selProduct.name} cl={selProduct.cl} size={30} radius={8} />
                                <span className="nm">{selProduct.name}</span>
                                <span className="st">{selProduct.stock} left in stock</span>
                              </div>
                              <div className="qtyrow mt-2">
                                <span className="ql">Quantity</span>
                                <div className="stepq">
                                  <button type="button" disabled={saleBusy || Number(qty) <= 1} onClick={() => setQty((v) => String(Math.max(1, Math.floor(Number(v) || 1) - 1)))}>−</button>
                                  <input value={qty} onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ""))} onBlur={() => { const n = Math.floor(Number(qty)); if (!Number.isFinite(n) || n < 1) setQty("1"); else if (n > selProduct.stock) setQty(String(selProduct.stock)); }} inputMode="numeric" aria-label="Quantity" />
                                  <button type="button" disabled={saleBusy || Number(qty) >= selProduct.stock} onClick={() => setQty((v) => String(Math.min(selProduct.stock, Math.max(1, Math.floor(Number(v) || 1) + 1))))}>+</button>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button className="btn dark sm flex-1 justify-center" disabled={saleBusy} onClick={() => submitOutcome(open.id, "sold", selProduct.id, Number(qty))}>Confirm purchase</button>
                                <button className="btn ghost xs" disabled={saleBusy} onClick={() => setSaleStep("pick")}>Back</button>
                              </div>
                            </>
                          )}
                          {saleErr && <span className="saleerr mt-2 block">{saleErr}</span>}
                        </div>
                      )}
                    </div>
                  )}
                  {open.outcome && (
                    <div className="mx-auto w-full max-w-[520px] bg-[#F7F7F5] border border-[#E9E9E7] rounded-[12px] px-3.5 py-2.5 flex items-center gap-2 text-[12.5px] text-[#6B6B6B]">
                      <Icon name="check" size={14} />
                      {open.outcome === "sold" ? (<>Sale logged — <b className="text-[#111]">{open.soldProduct || "product"}</b>. Stock was updated.</>) : (<>No sale logged for this conversation.</>)}
                    </div>
                  )}
                  {showNewMsg && (
                    <button onClick={() => scrollToBottom()} className="sticky bottom-2 self-center px-3 py-1.5 rounded-full bg-[#111] text-white text-[12px] font-semibold shadow-lg">New messages ↓</button>
                  )}
                </div>

                {open.status === "closed" ? (
                  <div className="inote flex-none">
                    <Icon name="check" size={14} /> Conversation closed.
                    <button className="btn ghost xs ml-auto" onClick={() => reopenConvo(open.id)}>Reopen</button>
                  </div>
                ) : (
                  <>
                    {sendError && (
                      <div className="inote fail flex-none">
                        <Icon name="alert" size={14} />
                        <span>
                          {sendError.message}{" "}
                          {sendError.type === "WHATSAPP_NOT_CONNECTED" && <Link href="/settings">Connect WhatsApp in Settings</Link>}
                          {sendError.type === "WHATSAPP_PAUSED" && <Link href="/settings">Open Settings</Link>}
                        </span>
                      </div>
                    )}
                    {openState === "ai" && (
                      <div className="flex-none px-4 py-2 bg-[#F7F7F5] border-t border-[#E9E9E7] flex items-center gap-2 text-[12px] text-[#6B6B6B]">
                        <Icon name="bot" size={13} />
                        <span className="truncate"><b className="text-[#111]">AI Agent</b> is currently handling this conversation. Sending a message takes it over instantly.</span>
                        <button className="ml-auto flex-none text-[12px] font-bold underline" onClick={() => takeOver(open.id)}>Take over</button>
                      </div>
                    )}
                    <div className="flex-none relative">
                      {attach && (
                        <div className="attach-prev">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={attach.preview} alt="Attachment preview" />
                          <span className="truncate flex-1 min-w-0">{attach.file.name}</span>
                          <button onClick={clearAttach} aria-label="Remove attachment" className="attach-x">
                            <Icon name="x" size={13} />
                          </button>
                        </div>
                      )}
                    <div className="composer-pro flex-none">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        aria-label="Attach image"
                        onChange={(e) => {
                          pickFile(e.target.files?.[0] ?? null);
                          e.target.value = "";
                        }}
                      />
                      <button className="composer-icon" title="Attach image" aria-label="Attach image" disabled={sending} onClick={() => fileRef.current?.click()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                      </button>
                      <textarea
                        ref={taRef}
                        value={reply}
                        rows={1}
                        onChange={(e) => {
                          setReply(e.target.value);
                          if (sendError) setSendError(null);
                          e.target.style.height = "auto";
                          e.target.style.height = Math.min(110, e.target.scrollHeight) + "px";
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (attach) sendImage(open.id);
                            else sendReply(open.id);
                          }
                        }}
                        placeholder={attach ? "Add a caption..." : open.takeover || openState !== "ai" ? "Type a message..." : "Type a message to take over..."}
                        disabled={sending}
                        aria-label="Type a message"
                      />
                      <button className="composer-icon" title="Emoji" aria-label="Emoji" onClick={() => setEmojiOpen((v) => !v)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                      </button>
                      <button
                        className="composer-send"
                        onClick={() => (attach ? sendImage(open.id) : sendReply(open.id))}
                        disabled={sending || (!reply.trim() && !attach)}
                        aria-label="Send message"
                      >
                        {sending ? (
                          <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.56" /></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        )}
                      </button>
                    </div>
                      {emojiOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setEmojiOpen(false)} />
                          <div className="emoji-pop" role="dialog" aria-label="Emoji picker">
                            {EMOJIS.map((e) => (
                              <button key={e} type="button" onClick={() => insertEmoji(e)} aria-label={`Insert ${e}`}>
                                {e}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </section>

          {/* ============ RIGHT: contact panel (desktop) ============ */}
          <aside className="hidden xl:flex w-[300px] flex-none flex-col border-l border-[#E9E9E7] bg-white min-h-0 overflow-y-auto">
            <ContactPanel
              open={open}
              openState={openState}
              wa={wa}
              msgStats={msgStats}
              recentActivity={recentActivity}
              contactTab={contactTab}
              setContactTab={setContactTab}
              summaryOpen={summaryOpen}
              setSummaryOpen={setSummaryOpen}
              activityOpen={activityOpen}
              setActivityOpen={setActivityOpen}
              saleSectionOpen={saleSectionOpen}
              setSaleSectionOpen={setSaleSectionOpen}
              products={products}
              onTakeOver={() => open && takeOver(open.id)}
              onReturn={() => open && endTakeOver(open.id)}
              onClose={() => reopenConvo(open!.id)}
              onReopen={() => open && reopenConvo(open.id)}
              onLogSale={() => open && resetSale(open.id)}
              onClosePanel={() => {}}
              closable={false}
            />
          </aside>
        </div>
      )}

      {/* ============ RIGHT: contact drawer (tablet/mobile) ============ */}
      {contactOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden">
          <div className="absolute inset-0 bg-[#111]/20" onClick={() => setContactOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-[320px] max-w-[88vw] bg-white border-l border-[#E9E9E7] overflow-y-auto shadow-xl">
            <ContactPanel
              open={open}
              openState={openState}
              wa={wa}
              msgStats={msgStats}
              recentActivity={recentActivity}
              contactTab={contactTab}
              setContactTab={setContactTab}
              summaryOpen={summaryOpen}
              setSummaryOpen={setSummaryOpen}
              activityOpen={activityOpen}
              setActivityOpen={setActivityOpen}
              saleSectionOpen={saleSectionOpen}
              setSaleSectionOpen={setSaleSectionOpen}
              products={products}
              onTakeOver={() => open && takeOver(open.id)}
              onReturn={() => open && endTakeOver(open.id)}
              onClose={() => open && closeConvo(open.id)}
              onReopen={() => open && reopenConvo(open.id)}
              onLogSale={() => { if (open) { resetSale(open.id); setContactOpen(false); } }}
              onClosePanel={() => setContactOpen(false)}
              closable
            />
          </aside>
        </div>
      )}
    </div>
  );
}

function ContactPanel(props: {
  open: Convo | null;
  openState: UiState | null;
  wa: { connected: boolean; paused: boolean } | null;
  msgStats: { total: number; customer: number; ai: number; human: number } | null;
  recentActivity: { label: string; sub: string | null; t: number; k: string }[];
  contactTab: "Details" | "Products" | "Services" | "Notes";
  setContactTab: (t: "Details" | "Products" | "Services" | "Notes") => void;
  summaryOpen: boolean;
  setSummaryOpen: (v: boolean) => void;
  activityOpen: boolean;
  setActivityOpen: (v: boolean) => void;
  saleSectionOpen: boolean;
  setSaleSectionOpen: (v: boolean) => void;
  products: Product[];
  onTakeOver: () => void;
  onReturn: () => void;
  onClose: () => void;
  onReopen: () => void;
  onLogSale: () => void;
  onClosePanel: () => void;
  closable: boolean;
}) {
  const { open, openState, wa, msgStats, recentActivity } = props;
  if (!open) {
    return (
      <div className="p-5 text-[13px] text-[#6B6B6B]">
        <p className="font-bold text-[#111] text-[14px] mb-1">Contact Details</p>
        Select a conversation to see customer context.
      </div>
    );
  }
  const handling = openState === "ai" ? "AI Agent · Handling" : openState === "human" ? "You · Handling" : openState === "waiting" ? "Needs reply" : "Closed";
  return (
    <div className="min-h-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9E9E7] sticky top-0 bg-white z-10">
        <b className="text-[13.5px] text-[#111]">Contact Details</b>
        {props.closable && (
          <button className="btn ghost xs !px-2" onClick={props.onClosePanel} aria-label="Close panel"><Icon name="x" size={14} /></button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <span className="w-14 h-14 rounded-full bg-[#F1F1EF] border border-[#E9E9E7] grid place-items-center font-bold text-[20px] text-[#111] flex-none">
            {initials(open.name).slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-[15px] text-[#111]">{open.name}</p>
            <p className="text-[12px] text-[#6B6B6B] font-mono truncate">{open.phone}</p>
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#0E7A47] mt-1">
              <span className="text-[#25D366]"><Icon name="whatsapp" size={14} /></span>
              {wa?.connected && !wa?.paused ? "WhatsApp Connected" : "WhatsApp not connected"}
            </p>
          </div>
        </div>

        <div className="mt-3 border border-[#E9E9E7] rounded-[10px] p-2.5 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#F1F1EF] grid place-items-center flex-none"><Icon name="bot" size={13} /></span>
          <span className="text-[12.5px] font-bold text-[#111]">{handling}</span>
          <span className="ml-auto">
            {openState === "ai" ? (
              <button className="btn ghost xs" onClick={props.onTakeOver}>Take over</button>
            ) : openState === "human" || openState === "waiting" ? (
              <button className="btn ghost xs" onClick={props.onReturn}>Return to AI</button>
            ) : (
              <button className="btn ghost xs" onClick={props.onReopen}>Reopen</button>
            )}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="border-r border-[#E9E9E7] pr-2">
            <p className="text-[10.5px] text-[#9B9B9B] font-medium">Assignment</p>
            <p className="text-[12px] font-bold text-[#111] flex items-center justify-center gap-1 mt-0.5"><Icon name="user" size={11} />{openState === "ai" ? "AI Agent" : openState === "closed" ? "—" : "You"}</p>
          </div>
          <div className="border-r border-[#E9E9E7] pr-2">
            <p className="text-[10.5px] text-[#9B9B9B] font-medium">Language</p>
            <p className="text-[12px] font-bold text-[#111] mt-0.5">{langLabel(open.lang)}</p>
          </div>
          <div>
            <p className="text-[10.5px] text-[#9B9B9B] font-medium">Status</p>
            <p className="text-[12px] font-bold text-[#111] mt-0.5">{open.status === "closed" ? "Closed" : "Open"}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4 border-b border-[#E9E9E7] text-[12.5px] font-semibold">
          {(["Details", "Products", "Services", "Notes"] as const).map((t) => (
            <button key={t} onClick={() => props.setContactTab(t)} className={`pb-2 -mb-px ${props.contactTab === t ? "text-[#111] border-b-2 border-b-[#111]" : "text-[#9B9B9B]"}`}>{t}</button>
          ))}
        </div>

        {props.contactTab === "Details" && (
          <>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] font-bold text-[#111]">Customer information</p>
                <button className="btn ghost xs" onClick={props.onLogSale}>Edit</button>
              </div>
              <dl className="mt-2 space-y-1.5 text-[12.5px]">
                <div className="flex justify-between gap-3"><dt className="text-[#9B9B9B]">Name</dt><dd className="font-semibold text-[#111] truncate">{open.name}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#9B9B9B]">Phone</dt><dd className="font-mono text-[#111] truncate">{open.phone}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#9B9B9B]">Language</dt><dd className="font-semibold text-[#111]">{langLabel(open.lang)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#9B9B9B]">Outcome</dt><dd className="font-semibold text-[#111]">{open.outcome === "sold" ? `Sold${open.soldProduct ? ` — ${open.soldProduct}` : ""}` : open.outcome === "no" ? "No sale" : "—"}</dd></div>
              </dl>
            </div>

            <button className="w-full mt-3 border border-[#E9E9E7] rounded-[10px] px-3 py-2.5 text-left" onClick={() => props.setSummaryOpen(!props.summaryOpen)}>
              <span className="flex items-center gap-2 text-[12.5px] font-bold text-[#111]">
                <span className="text-[#9B9B9B]">›</span> Conversation summary
                <span className="ml-auto text-[#9B9B9B]">{props.summaryOpen ? "▾" : "▸"}</span>
              </span>
              {props.summaryOpen && msgStats && (
                <span className="block mt-1.5 text-[12px] text-[#6B6B6B] leading-relaxed">
                  {msgStats.total} messages · {msgStats.customer} from customer · {msgStats.ai} from AI{msgStats.human ? ` · ${msgStats.human} from you` : ""}.
                  {open.outcome === "sold" ? ` Sale logged${open.soldProduct ? ` (${open.soldProduct})` : ""}.` : open.outcome === "no" ? " No sale." : " No outcome logged yet."}
                </span>
              )}
            </button>

            <button className="w-full mt-2 border border-[#E9E9E7] rounded-[10px] px-3 py-2.5 text-left" onClick={() => props.setActivityOpen(!props.activityOpen)}>
              <span className="flex items-center gap-2 text-[12.5px] font-bold text-[#111]">
                <span className="text-[#9B9B9B]">›</span> Recent activity
                <span className="ml-auto text-[#9B9B9B]">{props.activityOpen ? "▾" : "▸"}</span>
              </span>
            </button>
            {props.activityOpen && (
              <ul className="mt-2 space-y-2.5 px-1">
                {recentActivity.length === 0 && <li className="text-[12px] text-[#9B9B9B]">No activity yet.</li>}
                {recentActivity.map((a) => (
                  <li key={a.k} className="flex gap-2.5 text-[12px]">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-[#111] flex-none" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-[#111] truncate">{a.label}</span>
                        <time className="ml-auto flex-none font-mono text-[10px] text-[#9B9B9B]">{fmtClock(a.t)}</time>
                      </div>
                      {a.sub && <p className="truncate text-[#9B9B9B]">{a.sub}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button className="w-full mt-2 border border-[#E9E9E7] rounded-[10px] px-3 py-2.5 flex items-center gap-2 text-[12.5px] font-bold text-[#111]" onClick={() => props.setSaleSectionOpen(!props.saleSectionOpen)}>
              <Icon name="cart" size={13} /> Sales & Outcome
              <span className="ml-auto text-[#9B9B9B]">{props.saleSectionOpen ? "▾" : "▸"}</span>
            </button>
            {props.saleSectionOpen && (
              <div className="mt-2 border border-[#E9E9E7] rounded-[10px] p-3 text-[12.5px]">
                {open.outcome ? (
                  <p className="text-[#6B6B6B]">{open.outcome === "sold" ? (<>Sale logged — <b className="text-[#111]">{open.soldProduct || "product"}</b>.</>) : "No sale logged."}</p>
                ) : (
                  <>
                    <p className="font-bold text-[#111]">Did they buy?</p>
                    <button className="btn dark sm w-full justify-center mt-2" onClick={props.onLogSale}>Yes, log a sale</button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {props.contactTab === "Products" && (
          <div className="mt-3 space-y-1.5 max-h-[300px] overflow-auto">
            {props.products.length === 0 && <p className="text-[12.5px] text-[#9B9B9B]">No products in workspace.</p>}
            {props.products.slice(0, 30).map((p) => (
              <div key={p.id} className="flex items-center gap-2 border border-[#F1F1EF] rounded-[8px] px-2 py-1.5">
                <ProductThumb image={p.image} emoji={p.emoji} name={p.name} cl={p.cl} size={28} radius={7} />
                <span className="flex-1 min-w-0 truncate text-[12.5px] font-semibold text-[#111]">{p.name}</span>
                <span className="text-[11px] font-mono text-[#9B9B9B] flex-none">{p.stock === 0 ? "out" : `${p.stock} left`}</span>
              </div>
            ))}
          </div>
        )}
        {props.contactTab === "Services" && (
          <p className="mt-3 text-[12.5px] text-[#9B9B9B]">Services live under Shop rules — ask the AI about repairs, delivery and payments.</p>
        )}
        {props.contactTab === "Notes" && (
          <p className="mt-3 text-[12.5px] text-[#9B9B9B]">Internal timeline events (takeover, resume, close) appear in the conversation thread.</p>
        )}
      </div>
    </div>
  );
}
