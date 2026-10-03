"use client";

import { useEffect, useState } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Icon } from "@/components/icons";
import CchatLogo from "@/components/branding/CchatLogo";

const TYPES = [
  "Duka / Shop",
  "Pharmacy",
  "Salon / Barber",
  "Food / Restaurant",
  "Electronics",
  "Fashion",
  "Services",
  "Other",
];

/** Shows the waitlist join form or the user's fetched queue position and total. */
export default function WaitlistPage() {
  const { user } = useUser();
  const [status, setStatus] = useState<{ joined: boolean; position: number | null; total: number; name?: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  /**
   * Refreshes status and prefills an empty name from Clerk before joining.
   * Request or JSON errors set loadError while preserving the previous status.
   */
  const load = async () => {
    setLoadError(false);
    try {
      const r = await fetch("/api/waitlist");
      if (!r.ok) throw new Error("status failed");
      const d = await r.json();
      setStatus(d);
      if (!d.joined && user) {
        setName((v) => v || [user.firstName, user.lastName].filter(Boolean).join(" "));
      }
    } catch {
      setLoadError(true);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /**
   * Submits the form unless already busy, then stores the successful response.
   * Unreadable JSON falls back to an empty object; HTTP and network failures set
   * a display error. Clears busy when the request attempt finishes.
   */
  const join = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, businessType: type, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.message || "Couldn't join. Please try again.");
        return;
      }
      setStatus(data);
    } catch {
      setErr("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCF9] flex flex-col items-center px-4 py-10 sm:py-16">
      <Link href="/" className="flex items-center gap-2.5 text-[#111] font-disp font-bold text-[18px]">
        <CchatLogo size={36} decorative />
        C-chat
      </Link>

      <div className="w-full max-w-[560px] mt-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E9E9E7] bg-[#F7F7F5] px-3 py-1.5 text-[12px] font-semibold text-[#6B6B6B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#149A5B] animate-pulse" /> Opening soon
          </span>
          <h1 className="font-disp font-extrabold tracking-tight text-[#111] text-[clamp(28px,5vw,40px)] leading-tight mt-4 text-balance">
            Get early access to C-chat
          </h1>
          <p className="text-[15px] text-[#6B6B6B] leading-relaxed mt-3 max-w-[460px] mx-auto">
            WhatsApp connection and payments are opening gradually. Join the waitlist and we&apos;ll
            activate your shop as soon as your slot is ready.
          </p>
        </div>

        <div className="card mt-8 p-5 sm:p-7">
          {status === null ? (
            loadError ? (
              <div className="text-center py-6">
                <p className="text-[14px] font-semibold text-[#111]">Couldn&apos;t load the waitlist.</p>
                <p className="text-[13px] text-[#6B6B6B] mt-1">Check your connection and try again.</p>
                <button className="btn pri sm mt-4" onClick={load}>
                  <Icon name="refresh" size={13} /> Retry
                </button>
              </div>
            ) : (
              <div aria-hidden="true">
                <span className="skel block h-5 w-40 mb-4" />
                <span className="skel block h-[42px] rounded-[8px] mb-3" />
                <span className="skel block h-[42px] rounded-[8px] mb-3" />
                <span className="skel block h-[42px] rounded-[8px]" />
              </div>
            )
          ) : status.joined ? (
            <div className="text-center py-2">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#E3F4E9] border border-[#BCE5CB] text-[#0E7A47]">
                <Icon name="check" size={24} />
              </span>
              <h2 className="font-disp font-bold text-[22px] text-[#111] mt-4">
                You&apos;re #{status.position} in line{status.name ? `, ${status.name.split(" ")[0]}` : ""}
              </h2>
              <p className="text-[14px] text-[#6B6B6B] mt-2 leading-relaxed">
                {status.total} {status.total === 1 ? "shop" : "shops"} waiting. We&apos;ll message you on
                WhatsApp the moment your slot opens — no need to check back.
              </p>
              <div className="flex flex-col gap-2.5 mt-6 text-left">
                {[
                  ["1", "We activate shops in order", "Your position is locked in."],
                  ["2", "We message you on WhatsApp", "Connection + payment setup takes a few minutes."],
                  ["3", "You start selling", "AI replies to customers day and night."],
                ].map(([n, t, d]) => (
                  <div key={n} className="flex gap-3 items-start bg-[#F7F7F5] border border-[#E9E9E7] rounded-[10px] px-3.5 py-3">
                    <span className="w-6 h-6 rounded-full bg-[#111] text-white text-[12px] font-bold grid place-items-center flex-none">{n}</span>
                    <span>
                      <b className="block text-[13.5px] text-[#111]">{t}</b>
                      <span className="block text-[12.5px] text-[#6B6B6B]">{d}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="wl-name">Your name</label>
                <input id="wl-name" className="inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Juma Hassan" autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="wl-phone">WhatsApp number</label>
                <input id="wl-phone" className="inp" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0757 123 456" inputMode="tel" autoComplete="tel" />
                <div className="hint">We&apos;ll message you here when your slot opens.</div>
              </div>
              <div className="field">
                <label htmlFor="wl-type">Business type</label>
                <select id="wl-type" className="inp" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">Choose…</option>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="wl-note">Anything we should know? <span className="font-normal">(optional)</span></label>
                <textarea id="wl-note" className="inp" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. I sell phones in Kariakoo" rows={2} />
              </div>
              {err && <p className="text-[13px] font-semibold text-red-500 mb-3">{err}</p>}
              <button className="btn pri wide" disabled={busy || !name.trim() || !phone.trim() || !type} onClick={join}>
                {busy ? "Joining…" : `Join the waitlist${status.total > 0 ? ` — ${status.total} ahead` : ""}`}
              </button>
              <p className="text-[12px] text-[#9B9B9B] text-center mt-3">Free to join · No payment today</p>
            </>
          )}
        </div>

        <p className="text-center text-[12.5px] text-[#9B9B9B] mt-6">
          Signed in{user?.primaryEmailAddress ? ` as ${user.primaryEmailAddress.emailAddress}` : ""} ·{" "}
          <SignOutButton>
            <button className="underline font-semibold">Use a different account</button>
          </SignOutButton>
        </p>
      </div>
    </div>
  );
}
