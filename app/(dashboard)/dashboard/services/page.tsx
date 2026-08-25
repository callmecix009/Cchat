"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { TZS, uid, type Service } from "@/lib/demo";

type ModalState =
  | { open: false }
  | {
      open: true;
      id: string | null;
      name: string;
      desc: string;
      price: string;
      from: boolean;
      dur: string;
      booking: boolean;
      warranty: string;
    };

const emptyModal: ModalState = { open: false };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState<ModalState>(emptyModal);

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d) => {
        if (d) setServices(d.services ?? []);
      })
      .finally(() => setLoaded(true));
  }, []);

  const openEdit = (id: string | null) => {
    const s = id ? services.find((x) => x.id === id) : null;
    setModal({
      open: true,
      id,
      name: s?.name ?? "",
      desc: s?.desc ?? "",
      price: s ? String(s.price) : "",
      from: s?.from ?? false,
      dur: s?.dur ?? "",
      booking: s?.booking ?? false,
      warranty: s?.warranty ?? "—",
    });
  };

  const persist = (list: Service[]) => {
    fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ services: list }),
    }).catch(() => {});
  };

  const save = () => {
    if (!modal.open) return;
    const name = modal.name.trim();
    if (!name) return;
    const data = {
      name,
      desc: modal.desc.trim(),
      price: Number(modal.price) || 0,
      from: modal.from,
      dur: modal.dur || "—",
      booking: modal.booking,
      warranty: modal.warranty || "—",
    };
    let next: Service[];
    if (modal.id) {
      next = services.map((s) => (s.id === modal.id ? { ...s, ...data } : s));
    } else {
      next = [...services, { id: uid(), ...data }];
    }
    setServices(next);
    persist(next);
    setModal(emptyModal);
  };

  const del = (id: string) => {
    if (!window.confirm("Delete this service? The AI will stop offering it immediately.")) return;
    const next = services.filter((s) => s.id !== id);
    setServices(next);
    persist(next);
  };

  return (
    <div className="viewwrap max-w-[1240px] mx-auto">
      <div className="section-h">
        <div>
          <h2>Services</h2>
          <p>Offerings that aren&apos;t sellable products. The AI can explain, quote and book these.</p>
        </div>
        <button className="btn pri" onClick={() => openEdit(null)}>
          <Icon name="plus" size={15} /> Add service
        </button>
      </div>

      <div className="svcgrid">
        {!loaded ? (
          <div className="card">
            <div className="empty">
              <p>Loading your services…</p>
            </div>
          </div>
        ) : services.length ? (
          services.map((s) => (
            <div className="svc" key={s.id}>
              <div className="si"><Icon name="wrench" size={19} /></div>
              <h4>{s.name}</h4>
              <div className="desc">{s.desc}</div>
              <div className="row">
                <span>Price</span>
                <b>{s.price === 0 ? "FREE" : (s.from ? "from " : "") + TZS(s.price)}</b>
              </div>
              <div className="row">
                <span>Duration</span>
                <b>{s.dur}</b>
              </div>
              <div className="row">
                <span>Booking</span>
                <b>{s.booking ? "Required" : "Walk-in ok"}</b>
              </div>
              <div className="row">
                <span>Warranty</span>
                <b>{s.warranty}</b>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 13 }}>
                <button className="btn ghost sm" onClick={() => openEdit(s.id)}>
                  <Icon name="edit" size={13} /> Edit
                </button>
                <button className="btn danger sm" onClick={() => del(s.id)}>
                  <Icon name="trash" size={13} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="empty">
              <span className="ic-big"><Icon name="wrench" size={24} /></span>
              <p style={{ marginBottom: 14 }}>
                No services yet. Add one and the AI will be able to quote and book it on WhatsApp.
              </p>
            </div>
          </div>
        )}
        <button className="addtile" onClick={() => openEdit(null)}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--grn-bg)",
              color: "var(--grn-d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="plus" size={20} />
          </span>
          Add a service
        </button>
      </div>

      {modal.open && (
        <div id="modalRoot" style={{ position: "static" }}>
          <div className="mback" onClick={() => setModal(emptyModal)} />
          <div className="mpanel wide">
            <div className="mhead">
              <h3>{modal.id ? "Edit service" : "Add service"}</h3>
              <button className="mx" onClick={() => setModal(emptyModal)} aria-label="Close">
                <Icon name="x" size={17} />
              </button>
            </div>
            <div className="mbody">
              <div className="field">
                <label>Name</label>
                <input className="inp" placeholder="e.g. Screen replacement" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea className="inp" value={modal.desc} onChange={(e) => setModal({ ...modal, desc: e.target.value })} />
              </div>
              <div className="grid3">
                <div className="field">
                  <label>Price (TZS)</label>
                  <input className="inp" type="number" value={modal.price} onChange={(e) => setModal({ ...modal, price: e.target.value })} />
                </div>
                <div className="field">
                  <label>&nbsp;</label>
                  <label className="switch" style={{ marginTop: 8 }}>
                    <input type="checkbox" checked={modal.from} onChange={(e) => setModal({ ...modal, from: e.target.checked })} />
                    <span className="tr"></span>
                  </label>
                  <div className="hint">&quot;from&quot; price</div>
                </div>
                <div className="field">
                  <label>Duration</label>
                  <input className="inp" placeholder="~1 hour" value={modal.dur} onChange={(e) => setModal({ ...modal, dur: e.target.value })} />
                </div>
              </div>
              <div className="grid2">
                <div className="field">
                  <label>Requires booking</label>
                  <label className="switch">
                    <input type="checkbox" checked={modal.booking} onChange={(e) => setModal({ ...modal, booking: e.target.checked })} />
                    <span className="tr"></span>
                  </label>
                </div>
                <div className="field">
                  <label>Warranty note</label>
                  <input className="inp" value={modal.warranty} onChange={(e) => setModal({ ...modal, warranty: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn ghost" onClick={() => setModal(emptyModal)}>Cancel</button>
              <button className="btn pri" onClick={save}>
                <Icon name="check" size={14} /> Save &amp; sync to AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}