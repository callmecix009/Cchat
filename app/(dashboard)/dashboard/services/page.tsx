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
    <div className="mx-auto max-w-[1120px]">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-disp text-[20px] font-semibold tracking-tight text-[#111]">Services</h2>
          <p className="text-[13px] text-[#6B6B6B] mt-1">Offerings that aren&apos;t products — the AI can explain, quote and book these on WhatsApp.</p>
        </div>
        <button className="btn pri shrink-0" onClick={() => openEdit(null)}>
          <Icon name="plus" size={14} /> Add service
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {!loaded ? (
          <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-12 text-center">
            <p className="text-[13px] text-[#6B6B6B]">Loading your services…</p>
          </div>
        ) : services.length ? (
          services.map((s) => (
            <div key={s.id} className="bg-white border border-[#E9E9E7] rounded-[12px] p-6 flex flex-col">
              <div className="w-9 h-9 rounded-[10px] bg-[#F7F7F5] border border-[#E9E9E7] text-[#6B6B6B] grid place-items-center mb-3">
                <Icon name="wrench" size={16} />
              </div>
              <h4 className="font-disp text-[15px] font-semibold text-[#111] leading-tight">{s.name}</h4>
              <p className="text-[13px] text-[#6B6B6B] mt-1.5 line-clamp-2 min-h-[38px]">{s.desc || "No description"}</p>
              <div className="mt-4 space-y-0 divide-y divide-[#F1F1EF] border-t border-[#F1F1EF]">
                <div className="flex justify-between py-2 text-[12.5px]">
                  <span className="text-[#9B9B9B]">Price</span>
                  <b className="font-mono text-[#111]">{s.price === 0 ? "FREE" : (s.from ? "from " : "") + TZS(s.price)}</b>
                </div>
                <div className="flex justify-between py-2 text-[12.5px]">
                  <span className="text-[#9B9B9B]">Duration</span>
                  <b className="text-[#111]">{s.dur}</b>
                </div>
                <div className="flex justify-between py-2 text-[12.5px]">
                  <span className="text-[#9B9B9B]">Booking</span>
                  <b className="text-[#111]">{s.booking ? "Required" : "Walk-in ok"}</b>
                </div>
                <div className="flex justify-between py-2 text-[12.5px]">
                  <span className="text-[#9B9B9B]">Warranty</span>
                  <b className="text-[#111]">{s.warranty}</b>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn ghost sm flex-1 justify-center" onClick={() => openEdit(s.id)}>
                  <Icon name="edit" size={13} /> Edit
                </button>
                <button className="w-9 h-9 grid place-items-center rounded-[8px] border border-[#E9E9E7] bg-white text-[#9B9B9B] hover:bg-[#F7F7F5] hover:text-[#111] hover:border-[#E9E9E7] transition-colors" onClick={() => del(s.id)} aria-label="Delete">
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-10 text-center sm:col-span-2 lg:col-span-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F7F7F5] border border-[#E9E9E7] grid place-items-center mx-auto mb-3 text-[#9B9B9B]"><Icon name="wrench" size={18} /></div>
            <p className="text-[13px] text-[#6B6B6B] max-w-[420px] mx-auto">
              No services yet. Add one and the AI will be able to quote and book it on WhatsApp.
            </p>
          </div>
        )}
        <button onClick={() => openEdit(null)} className="bg-[#F7F7F5] border border-dashed border-[#E9E9E7] rounded-[12px] min-h-[232px] grid place-items-center p-6 hover:bg-white hover:border-[#111] transition-colors group">
          <span className="text-center">
            <span className="w-10 h-10 rounded-[10px] bg-white border border-[#E9E9E7] grid place-items-center mx-auto mb-3 text-[#6B6B6B] group-hover:border-[#111] group-hover:text-[#111] transition-colors">
              <Icon name="plus" size={16} />
            </span>
            <span className="text-[13px] font-medium text-[#6B6B6B] group-hover:text-[#111]">Add a service</span>
          </span>
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