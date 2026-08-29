"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { emptyPolicies, type Policy } from "@/lib/demo";

const DAY_LABELS: Record<string, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

export default function PoliciesPage() {
  const [p, setP] = useState<Policy>(emptyPolicies());
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d) => {
        if (d?.policies) setP(d.policies);
      })
      .finally(() => setLoaded(true));
  }, []);

  const set = <K extends keyof Policy>(key: K, v: Policy[K]) => {
    setP((prev) => ({ ...prev, [key]: v }));
    setSaved(false);
  };
  const setAreas = (i: number, k: "area" | "fee" | "time", v: string | number) =>
    set("areas", p.areas.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
  const setPayments = (i: number, k: "name" | "detail", v: string) =>
    set("payments", p.payments.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
  const setWarranty = (i: number, k: "cat" | "dur" | "not", v: string) =>
    set("warranty", p.warranty.map((a, j) => (j === i ? { ...a, [k]: v } : a)));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policies: p }),
      });
      if (res.ok) {
        window.dispatchEvent(new Event("seechat:business-updated"));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert("Save failed — please try again.");
      }
    } catch {
      alert("Save failed — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="viewwrap max-w-[1240px] mx-auto">
      <div className="section-h">
        <div>
          <h2>Policies</h2>
          <p>The single source of truth the AI promises customers.</p>
        </div>
        <button className="btn pri" onClick={save} disabled={saving || !loaded}>
          <Icon name="check" size={15} /> {saved ? "Saved!" : saving ? "Saving…" : "Save policies"}
        </button>
      </div>

      <div className="notebar">
        <Icon name="zap" size={18} />
        <span>
          <b>These policies teach your AI what to promise customers.</b> Every save reaches the agent instantly — it will never promise delivery, refunds or warranties you haven&apos;t written here.
        </span>
      </div>

      <div className="polsec">
        <h3>
          <Icon name="truck" size={17} /> Delivery
        </h3>
        <div className="psub">Areas, fees and timing the AI quotes.</div>
        <div className="field">
          <label>Do you deliver?</label>
          <div className="chipset">
            {(
              [
                ["paid", "Yes — paid delivery"],
                ["free", "Yes — free everywhere"],
                ["no", "No delivery"],
              ] as const
            ).map((o) => (
              <button key={o[0]} className={`chip ${p.deliveryMode === o[0] ? "on" : ""}`} onClick={() => set("deliveryMode", o[0])}>
                {o[1]}
              </button>
            ))}
          </div>
        </div>
        {p.deliveryMode === "paid" && (
          <>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--mut)", textTransform: "uppercase", letterSpacing: ".03em" }}>
              Areas &amp; fees
            </label>
            <div>
              {p.areas.map((a, i) => (
                <div className="arearow" key={i}>
                  <input
                    className="inp"
                    value={a.area}
                    placeholder="Area"
                    onChange={(e) => setAreas(i, "area", e.target.value)}
                  />
                  <input
                    className="inp"
                    type="number"
                    value={a.fee}
                    placeholder="Fee TZS"
                    onChange={(e) => setAreas(i, "fee", Number(e.target.value))}
                  />
                  <input
                    className="inp"
                    value={a.time}
                    placeholder="Est. time"
                    onChange={(e) => setAreas(i, "time", e.target.value)}
                  />
                  <button className="rm" style={{ border: "none" }} onClick={() => set("areas", p.areas.filter((_, j) => j !== i))}>
                    <Icon name="x" size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button className="addrow" onClick={() => set("areas", [...p.areas, { area: "", fee: 5000, time: "2–3 hours" }])}>
              <Icon name="plus" size={13} /> Add area
            </button>
            <div className="field" style={{ marginTop: 12 }}>
              <label>Free delivery above (TZS)</label>
              <input
                className="inp"
                style={{ maxWidth: 220 }}
                type="number"
                value={p.freeOver}
                onChange={(e) => set("freeOver", Number(e.target.value))}
              />
            </div>
          </>
        )}
      </div>

      <div className="polsec">
        <h3>
          <Icon name="card" size={17} /> Payment methods
        </h3>
        <div className="psub">
          Listed so the AI can <b>communicate</b> them. C-chat never processes payments — money moves directly between you and your customer.
        </div>
        <div>
          {p.payments.map((pay, i) => (
            <div className="payrow" key={i}>
              <input
                className="inp"
                value={pay.name}
                placeholder="Method (e.g. M-Pesa)"
                onChange={(e) => setPayments(i, "name", e.target.value)}
              />
              <input
                className="inp"
                value={pay.detail}
                placeholder="Name / number customers pay to"
                onChange={(e) => setPayments(i, "detail", e.target.value)}
              />
              <button className="rm" style={{ border: "none" }} onClick={() => set("payments", p.payments.filter((_, j) => j !== i))}>
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
        <button className="addrow" onClick={() => set("payments", [...p.payments, { name: "", detail: "" }])}>
          <Icon name="plus" size={13} /> Add method
        </button>
        <div className="grid2" style={{ marginTop: 12 }}>
          <div className="field">
            <label>Payment timing</label>
            <select className="inp" value={p.payTiming} onChange={(e) => set("payTiming", e.target.value)}>
              <option>Pay on pickup or on delivery</option>
              <option>Full payment before delivery</option>
              <option>Pay after delivery</option>
            </select>
          </div>
          <div className="field">
            <label>Receipts</label>
            <div className="chipset">
              {["Yes, always", "Digital only", "No receipts"].map((o) => (
                <button
                  key={o}
                  className={`chip ${p.receipts === o.startsWith("Yes") ? "on" : ""}`}
                  onClick={() => set("receipts", o.startsWith("Yes"))}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="field">
          <label>Deposits rule</label>
          <input
            className="inp"
            value={p.deposits}
            placeholder="e.g. 50% deposit for repair bookings"
            onChange={(e) => set("deposits", e.target.value)}
          />
        </div>
      </div>

      <div className="polsec">
        <h3>
          <Icon name="shield" size={17} /> Warranty
        </h3>
        <div className="psub">Per category — duration and what it does NOT cover.</div>
        {p.warranty.map((w, i) => (
          <div className="grid3" style={{ marginBottom: 8 }} key={i}>
            <input className="inp" value={w.cat} placeholder="Category" onChange={(e) => setWarranty(i, "cat", e.target.value)} />
            <input className="inp" value={w.dur} placeholder="Duration" onChange={(e) => setWarranty(i, "dur", e.target.value)} />
            <input className="inp" value={w.not} placeholder="NOT covered" onChange={(e) => setWarranty(i, "not", e.target.value)} />
          </div>
        ))}
        <button className="addrow" onClick={() => set("warranty", [...p.warranty, { cat: "", dur: "", not: "" }])}>
          <Icon name="plus" size={13} /> Add category
        </button>
      </div>

      <div className="polsec">
        <h3>
          <Icon name="refresh" size={17} /> Returns &amp; exchanges
        </h3>
        <div className="field">
          <label>Return policy</label>
          <textarea className="inp" value={p.returns} onChange={(e) => set("returns", e.target.value)} />
        </div>
        <div className="field">
          <label>Refunds vs exchanges</label>
          <input className="inp" value={p.refunds} onChange={(e) => set("refunds", e.target.value)} />
        </div>
      </div>

      <div className="polsec">
        <h3>
          <Icon name="clock" size={17} /> Business hours
        </h3>
        <div className="grid2">
          {Object.keys(p.hours).map((k) => (
            <div className="field" style={{ marginBottom: 8 }} key={k}>
              <label style={{ textTransform: "capitalize" }}>{DAY_LABELS[k]}</label>
              <input
                className="inp"
                value={p.hours[k]}
                placeholder="e.g. 08:00 – 20:00 or Closed"
                onChange={(e) => set("hours", { ...p.hours, [k]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="polsec">
        <h3>
          <Icon name="book" size={17} /> Custom rules
        </h3>
        <div className="psub">Anything else the AI must know.</div>
        {p.custom.map((c, i) => (
          <div className="dynrow" key={i}>
            <input className="inp" value={c} onChange={(e) => set("custom", p.custom.map((x, j) => (j === i ? e.target.value : x)))} />
            <button className="rm" onClick={() => set("custom", p.custom.filter((_, j) => j !== i))}>
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
        <button className="addrow" onClick={() => set("custom", [...p.custom, ""])}>
          <Icon name="plus" size={13} /> Add rule
        </button>
      </div>
    </div>
  );
}