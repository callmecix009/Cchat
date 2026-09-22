"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { initials } from "@/lib/demo";
import { Icon } from "@/components/icons";
import { useTheme } from "@/components/theme-provider";
import LogoCropDialog from "@/components/logo-crop-dialog";

function Polsec({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-cborder rounded-[16px] p-5 mb-3.5">
      <h3 className="font-disp text-base flex items-center gap-2.5 mb-4 text-dark">
        <span className="text-[#111]">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[12.5px] font-bold text-muted mb-1.5 uppercase tracking-[.03em]">{label}</label>
      {children}
    </div>
  );
}

const inpCls = "w-full px-3 py-2.5 border border-[#E9E9E7] rounded-lg bg-white text-[14px] text-[#111] placeholder:text-[#9B9B9B] focus:outline-none focus:border-[#111] focus:ring-2 focus:ring-[#111]/10/14 transition-all dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-[#EDEDED] dark:placeholder-[#7A7A7A] dark:focus:border-[#EDEDED]";

function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const opts: Array<{ v: "light" | "dark" | "system"; label: string; desc: string; icon: React.ReactNode }> = [
    { v: "light", label: "Light", desc: "Bright, clean Notion-style", icon: <Icon name="sun" size={14} /> },
    { v: "dark", label: "Dark", desc: "Easy on the eyes at night", icon: <Icon name="moon" size={14} /> },
    { v: "system", label: "System", desc: "Follows your device", icon: <Icon name="monitor" size={14} /> },
  ];
  return (
    <Polsec icon={<Icon name="sun" size={14} />} title="Appearance">
      <p className="text-[13px] text-muted mb-3">Choose how C-chat looks on this device. System follows your OS preference.</p>
      <div className="grid grid-cols-3 gap-2">
        {opts.map((o) => (
          <button
            key={o.v}
            onClick={() => setTheme(o.v)}
            className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-[12px] border text-center transition-all ${theme === o.v ? "bg-[#111] text-white border-[#111] shadow-sm dark:bg-[#EDEDED] dark:text-[#0F0F0F] dark:border-[#EDEDED]" : "bg-white border-[#E9E9E7] text-[#111] hover:border-[#111] hover:bg-[#F7F7F5] dark:bg-[#1E1E1E] dark:border-[#2A2A2A] dark:text-[#EDEDED] dark:hover:border-[#EDEDED]"}`}
          >
            <span className={`w-8 h-8 rounded-full grid place-items-center ${theme === o.v ? "bg-white/15 dark:bg-black/10" : "bg-[#F7F7F5] dark:bg-[#1A1A1A]"}`}>{o.icon}</span>
            <span className="text-[13px] font-semibold">{o.label}</span>
            <span className={`text-[11px] leading-tight ${theme === o.v ? "text-white/70 dark:text-black/60" : "text-muted"}`}>{o.desc}</span>
            {theme === o.v && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#149A5B] dark:bg-[#16A56A]" />}
          </button>
        ))}
      </div>
      <p className="text-[11.5px] text-muted mt-3">Landing page stays light — this only affects your dashboard.</p>
    </Polsec>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const [biz, setBiz] = useState({
    name: "",
    desc: "",
    owner: "",
    city: "",
    phone: "",
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropMime, setCropMime] = useState<string>("image/png");
  const [connected, setConnected] = useState(false);
  const [waConnected, setWaConnected] = useState(false);
  const [waPaused, setWaPaused] = useState(false);
  const [waNumber, setWaNumber] = useState<string | null>(null);
  const [waBusinessName, setWaBusinessName] = useState<string | null>(null);
  const [waConnecting, setWaConnecting] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [billing, setBilling] = useState<{ status: string; plan: string | null; trialEndsAt: string | null; subscriptionExpiresAt: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.business) {
          setBiz({ ...data.business });
          setConnected(!!data.business.connected);
        } else if (user) {
          setBiz((prev) => ({
            ...prev,
            name: prev.name || "",
            phone: prev.phone || user.primaryPhoneNumber?.phoneNumber || "",
          }));
        }
        if (data) {
          setWaConnected(!!data.whatsappConnected);
          setWaPaused(!!data.whatsappPaused);
          setWaNumber(data.whatsappNumber || null);
          setWaBusinessName(data.whatsappBusinessName || null);
          setLogo(data.logo || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
    fetch("/api/billing")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) setBilling(data);
      })
      .catch(() => {});
  }, [user]);

  const set = useCallback((k: keyof typeof biz, v: string) => {
    setBiz((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  }, []);

  const pickLogo = (file: File | undefined | null) => {
    setLogoError(null);
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setLogoError("Please choose a PNG, JPG or WEBP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("The logo must be smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCropSrc(result);
      setCropMime(file.type);
    };
    reader.onerror = () => setLogoError("Couldn't read that file. Try again.");
    reader.readAsDataURL(file);
  };

  const saveAccount = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business: { ...biz, connected }, logo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLogoError(data?.message || "Couldn't save your business profile. Please try again.");
        return;
      }
      setSaved(true);
      window.dispatchEvent(new Event("seechat:business-updated"));
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      setLogoError("Network error while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const startWhatsAppConnect = async () => {
    setWaError(null);
    try {
      const res = await fetch("/api/whatsapp/config");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setWaError(d?.message || "WhatsApp connection isn't available right now — try again shortly.");
        return;
      }
      const { appId, configId } = await res.json();
      const win = window as any;
      if (!win.WhatsAppBusinessEmbeddedSignup) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://www.facebook.com/js/whatsapp_business_embedded_signup.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("script"));
          document.body.appendChild(s);
        });
      }
      win.WhatsAppBusinessEmbeddedSignup.init({
        clientId: appId,
        configId,
        onSuccess: async (authorizationCode: string) => {
          setWaConnecting(true);
          try {
            const res2 = await fetch("/api/whatsapp/connect", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ authorizationCode }),
            });
            const d2 = await res2.json().catch(() => ({}));
            if (!res2.ok) {
              setWaError(d2?.message || "WhatsApp couldn't be connected. Please try again.");
              return;
            }
            setWaConnected(true);
            setWaPaused(false);
            setWaNumber(d2?.displayPhoneNumber || null);
          } catch {
            setWaError("Network error while connecting WhatsApp. Please try again.");
          } finally {
            setWaConnecting(false);
          }
        },
        onError: (err: any) => {
          setWaError(err?.error_description || err?.error || "The WhatsApp popup couldn't complete. Please try again.");
        },
        onCancelled: () => {},
      });
    } catch {
      setWaError("Couldn't open the WhatsApp connection window. Please try again.");
    }
  };

  const disconnectWhatsApp = async () => {
    if (!window.confirm("Disconnect WhatsApp? Customer messages will stop arriving in this workspace.")) return;
    setWaError(null);
    try {
      await fetch("/api/whatsapp/disconnect", { method: "POST" });
      setWaConnected(false);
      setWaNumber(null);
      setWaBusinessName(null);
    } catch {
      setWaError("Couldn't disconnect WhatsApp. Please try again.");
    }
  };

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const in30 = new Date(Date.now() + 30 * 864e5).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div className="viewwrap max-w-[1240px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-disp font-bold tracking-tight text-dark">Settings</h1>
          <p className="text-sm text-muted">Your business, WhatsApp connection and subscription.</p>
        </div>
      </div>

      {!loaded && <div className="text-center py-16 text-muted text-sm">Loading settings...</div>}

      {loaded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div>
            <Polsec icon={<Icon name="store" size={17} />} title="Business Profile">
              <div className="flex gap-4 items-start mb-4 flex-wrap">
                {logo ? (
                  <button type="button" onClick={() => { setCropSrc(logo); setCropMime(logo.startsWith("data:image/png") ? "image/png" : logo.startsWith("data:image/webp") ? "image/webp" : "image/jpeg"); }} className="w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-cborder flex-none bg-white flex items-center justify-center p-0.5 hover:ring-[#111] transition-all" title="Adjust crop">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo} alt={biz.name || "Business logo"} className="w-full h-full object-cover rounded-[14px]" />
                  </button>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-dark text-lime2 flex items-center justify-center font-extrabold font-disp text-[22px] flex-none">
                    {biz.name.trim() ? initials(biz.name) : "?"}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border border-[#E9E9E7] bg-white text-[13px] font-semibold text-dark cursor-pointer hover:border-[#111] transition-colors"
                    >
                      <Icon name="edit" size={13} /> {logo ? "Change logo" : "Upload logo"}
                    </button>
                    {logo && (
                      <>
                        <button
                          onClick={() => { setCropSrc(logo); setCropMime(logo.startsWith("data:image/png") ? "image/png" : logo.startsWith("data:image/webp") ? "image/webp" : "image/jpeg"); }}
                          className="inline-flex items-center px-3.5 py-2 rounded-[10px] border border-[#E9E9E7] bg-white text-[13px] font-semibold text-dark hover:border-[#111] hover:bg-[#F7F7F5] transition-colors"
                        >
                          Adjust crop
                        </button>
                        <button
                          onClick={() => { setLogo(null); setLogoError(null); }}
                          className="inline-flex items-center px-3.5 py-2 rounded-[10px] border border-[#E3C7C7] bg-white text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                  <div className="text-[11.5px] text-muted mt-1.5">PNG, JPG or WEBP · max 2 MB · drag & zoom in crop editor · shown across your dashboard</div>
                  {logoError && <div className="text-[12px] font-semibold text-red-500 mt-1.5">{logoError}</div>}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      pickLogo(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
              <Field label="Business name">
                <input className={inpCls} value={biz.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Call Me Phones" />
              </Field>
              <Field label="One-line description">
                <input className={inpCls} value={biz.desc} onChange={(e) => set("desc", e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Owner">
                  <input className={inpCls} value={biz.owner} onChange={(e) => set("owner", e.target.value)} />
                </Field>
                <Field label="City / area">
                  <input className={inpCls} value={biz.city} onChange={(e) => set("city", e.target.value)} />
                </Field>
              </div>
              <Field label="WhatsApp number">
                <input className={inpCls} value={biz.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
              <div className="bg-[#F8FAF7] border border-cborder rounded-[10px] p-3.5 text-[12.5px] text-muted flex gap-2.5 items-start mb-4">
                <span className="text-[#111] flex-none"><Icon name="store" size={14} /></span>
                <span>
                  <b className="text-dark">Personal account: {(user?.firstName || "") + (user?.lastName ? " " + user.lastName : "")}</b>
                  <span className="block font-mono text-[11.5px]">{user?.primaryEmailAddress?.emailAddress || ""}</span>
                  <span className="block mt-1">Your personal name stays separate from your business name — changing one never changes the other.</span>
                </span>
              </div>
              <div className="flex gap-2.5 items-center border-t border-dashed border-cborder pt-3.5">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <b className="text-[14px]">WhatsApp connection</b>
                    {waConnected && !waPaused && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E3F4E9] border border-[#BCE5CB] text-[10.5px] font-bold text-[#0E7A47]"><span className="relative flex w-1.5 h-1.5"><span className="absolute inline-flex h-full w-full rounded-full bg-[#149A5B] opacity-60 animate-ping" /><span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#149A5B]" /></span> LIVE</span>
                    )}
                    {waConnected && waPaused && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E9E9E7] text-[10.5px] font-medium text-[#6B6B6B]"><span className="w-1.5 h-1.5 rounded-full bg-[#9B9B9B]" /> Paused</span>
                    )}
                  </div>
                  <div className="text-[12.5px] text-muted">
                    {waConnected && !waPaused
                      ? waNumber
                        ? `Connected — ${waNumber}${waBusinessName ? ` · ${waBusinessName}` : ""}`
                        : "Connected — replies are delivered through WhatsApp"
                      : waConnected && waPaused
                        ? "Paused — no replies going out until you resume"
                        : "Not connected — customer chats will arrive here automatically once connected"}
                  </div>
                </div>
                {waConnected ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConnected((v) => !v)}
                      className={`px-3.5 py-2 rounded-[10px] text-[12.5px] font-semibold transition-colors ${connected ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white" : "bg-[#111] text-white hover:bg-black"}`}
                    >
                      {connected ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={disconnectWhatsApp}
                      className="px-3.5 py-2 rounded-[10px] text-[12.5px] font-semibold transition-colors border border-[#E3C7C7] text-red-500 hover:bg-red-50"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startWhatsAppConnect}
                    disabled={waConnecting}
                    className="px-4 py-2 rounded-[10px] text-[12.5px] font-semibold transition-colors bg-[#111] text-white hover:bg-black disabled:opacity-60"
                  >
                    {waConnecting ? "Connecting…" : "Connect WhatsApp"}
                  </button>
                )}
              </div>
              {!waConnected && !waPaused && (
                <div className="mt-2.5 text-[12px] text-muted">
                  Connects your business WhatsApp number through Meta&apos;s official signup — no tokens or technical setup needed.
                </div>
              )}
              {waError && (
                <div className="mt-3 bg-[#FFF7F7] border border-[#F0C4C4] rounded-[10px] p-3.5 text-[12.5px] text-[#8E2F2F] leading-[1.6] flex items-start gap-2.5">
                  <Icon name="alert" size={15} />
                  <span>
                    {waError}{" "}
                    <button onClick={startWhatsAppConnect} className="font-bold underline" disabled={waConnecting}>
                      Retry
                    </button>
                  </span>
                </div>
              )}
              <button onClick={saveAccount} disabled={saving}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#149A5B] text-white font-semibold text-sm hover:bg-[#0E7A47] transition-colors shadow-[0_2px_8px_rgba(20,154,91,.2)] disabled:opacity-60">
                <Icon name="check" size={15} /> {saved ? "Saved!" : saving ? "Saving..." : "Save business profile"}
              </button>
            </Polsec>

            <Polsec icon={<Icon name="shield" size={17} />} title="Subscription">
              {(() => {
                if (!billing) return <div className="text-sm text-muted py-4">Loading subscription…</div>;
                const status = billing.status;
                const trialEnds = billing.trialEndsAt ? new Date(billing.trialEndsAt) : null;
                const trialDays = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / 86400000)) : 0;
                const exp = billing.subscriptionExpiresAt ? new Date(billing.subscriptionExpiresAt) : null;
                if (status === "trialing" && trialEnds) {
                  return (
                    <>
                      <div className="flex justify-between items-start gap-3 flex-wrap">
                        <div>
                          <div className="font-disp text-[22px] font-semibold tracking-tight text-[#111]">FREE TRIAL</div>
                          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#111] bg-white border border-[#E9E9E7] rounded-full px-2.5 py-1 mt-1">
                            <Icon name="clock" size={12} /> {trialDays} day{trialDays === 1 ? "" : "s"} remaining
                          </span>
                        </div>
                        <div className="text-right text-[12.5px] text-muted">
                          Ends on<br />
                          <b className="font-mono text-dark">{trialEnds.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</b>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <a href="/billing" className="inline-flex items-center px-4 py-2 rounded-[10px] bg-dark text-white text-[13px] font-semibold hover:bg-black transition-colors">View plans</a>
                        <a href="/plan-selection" className="inline-flex items-center px-4 py-2 rounded-[10px] border border-cborder text-[13px] font-semibold hover:border-[#111] transition-colors">Choose plan</a>
                      </div>
                    </>
                  );
                }
                if (status === "active" && billing.plan) {
                  const isYearly = billing.plan === "yearly" || billing.plan === "extra";
                  return (
                    <>
                      <div className="flex justify-between items-start gap-3 flex-wrap">
                        <div>
                          <div className="font-disp text-[22px] font-extrabold text-dark flex items-center gap-2">{isYearly ? "Yearly" : "Monthly"} <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#111] text-white text-[11px] font-bold">Premium</span> <span className="text-[14px] text-muted font-normal">{isYearly ? "TZS 115,200 / year" : "TZS 12,000 / month"}</span></div>
                          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#111] bg-white border border-[#E9E9E7] rounded-full px-2.5 py-1 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#111]" /> Active • Premium
                          </span>
                        </div>
                        {exp && (
                          <div className="text-right text-[12.5px] text-muted">
                            Renews<br />
                            <b className="font-mono text-dark">{exp.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</b>
                          </div>
                        )}
                      </div>
                      <div className="bg-[#F8FAF7] border border-cborder rounded-[10px] p-3.5 text-[13px] text-muted flex gap-2.5 items-start mt-3">
                        <span className="text-[#111] flex-none"><Icon name="shield" size={14} /></span>
                        <span>Your subscription is active. Manage billing at <a href="/billing" className="underline font-semibold">Billing</a>.</span>
                      </div>
                    </>
                  );
                }
                if (status === "expired") {
                  return (
                    <>
                      <div className="font-disp text-[22px] font-extrabold text-red-600">Trial ended</div>
                      <p className="text-[13px] text-muted mt-1">Your free trial has ended{trialEnds ? ` on ${trialEnds.toLocaleDateString("en-GB")}` : ""}. Choose a plan to continue using C-chat.</p>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <a href="/plan-selection" className="inline-flex items-center px-4 py-2 rounded-[10px] bg-[#111] text-white text-[13px] font-semibold hover:bg-black transition-colors">Choose a plan</a>
                        <a href="/billing" className="inline-flex items-center px-4 py-2 rounded-[10px] border border-cborder text-[13px] font-semibold">View plans</a>
                      </div>
                    </>
                  );
                }
                if (status === "canceled") {
                  return (
                    <>
                      <div className="font-disp text-[22px] font-extrabold text-dark">Canceled</div>
                      <p className="text-[13px] text-muted mt-1">Your subscription was canceled. You can reactivate at any time.</p>
                      <a href="/plan-selection" className="mt-3 inline-flex items-center px-4 py-2 rounded-[10px] bg-dark text-white text-[13px] font-semibold">Reactivate</a>
                    </>
                  );
                }
                // inactive / default
                return (
                  <>
                    <div className="font-disp text-[22px] font-extrabold text-dark">No active plan</div>
                    <p className="text-[13px] text-muted mt-1">Start your 3-day free trial — full access, no card required.</p>
                    <a href="/plan-selection" className="mt-3 inline-flex items-center px-4 py-2 rounded-[10px] bg-[#111] text-white text-[13px] font-semibold hover:bg-black transition-colors">Start free trial</a>
                  </>
                );
              })()}
              <div className="bg-[#F8FAF7] border border-cborder rounded-[10px] p-3.5 text-[13px] text-muted flex gap-2.5 items-start mt-4">
                <span className="text-amber-500 flex-none"><Icon name="alert" size={15} /></span>
                <span>Payment of this subscription is <b>managed externally</b>. C-chat processes no transactions inside the app — your customers&apos; M-Pesa, Tigo Pesa, Airtel Money and cash stay 100% between you and them.</span>
              </div>
            </Polsec>
          </div>

          <div>
            <AppearanceCard />
            <Polsec icon={<Icon name="gear" size={17} />} title="More settings">
              <div className="bg-[#F8FAF7] border border-cborder rounded-[10px] p-3.5 text-[12.5px] text-muted flex gap-2.5 items-start">
                <span className="text-[#111] flex-none"><Icon name="gear" size={14} /></span>
                <span>More workspace settings will live here soon.</span>
              </div>
            </Polsec>
          </div>
        </div>
      )}
      {cropSrc && (
        <LogoCropDialog
          imageSrc={cropSrc}
          mime={cropMime}
          onClose={() => setCropSrc(null)}
          onConfirm={(cropped) => {
            setLogo(cropped);
            setCropSrc(null);
            setLogoError(null);
          }}
        />
      )}
    </div>
  );
}