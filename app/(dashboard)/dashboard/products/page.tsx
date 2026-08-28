"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { TZS, uid, type Product } from "@/lib/demo";

const CHIP_COLORS = ["#E8F0FE", "#E7F6EC", "#FFF4DE", "#FDECEC", "#F3EDFB"];

function pStatus(p: Product, threshold: number): [string, string] {
  if (p.stock === 0) return ["Out of stock", "b-red"];
  if (p.stock <= threshold) return ["Low stock", "b-amb"];
  return ["In stock", "b-grn"];
}

type ModalState =
  | { open: false }
  | {
      open: true;
      id: string | null;
      name: string;
      price: string;
      stock: string;
      cat: string;
      emoji: string;
      kw: string;
    };

const emptyModal: ModalState = { open: false };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [threshold, setThreshold] = useState(3);
  const [behavior, setBehavior] = useState<"both" | "suggest" | "notify">("both");
  const [modal, setModal] = useState<ModalState>(emptyModal);

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d) => {
        if (d) {
          setProducts(d.products ?? []);
          if (d.policies?.outOfStockBehavior) setBehavior(d.policies.outOfStockBehavior);
          if (typeof d.lowStockThreshold === "number") setThreshold(d.lowStockThreshold);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const cats = useMemo(() => [...new Set(products.map((p) => p.cat))], [products]);

  const list = products.filter(
    (p) => (cat === "all" || p.cat === cat) && p.name.toLowerCase().includes(query.toLowerCase())
  );

  const openEdit = (id: string | null) => {
    const p = id ? products.find((x) => x.id === id) : null;
    setModal({
      open: true,
      id,
      name: p?.name ?? "",
      price: p ? String(p.price) : "",
      stock: p ? String(p.stock) : "0",
      cat: p?.cat ?? "",
      emoji: p?.emoji ?? "📦",
      kw: (p?.kw ?? []).join(", "),
    });
  };

  const persist = (list: Product[]) => {
    fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: list,
        lowStockThreshold: threshold,
        policies: { outOfStockBehavior: behavior },
      }),
    }).catch(() => {});
  };

  const save = () => {
    if (!modal.open) return;
    const name = modal.name.trim();
    const price = Number(modal.price);
    if (!name || !price) return;
    const data = {
      name,
      price,
      stock: Math.max(0, Number(modal.stock) || 0),
      cat: modal.cat.trim() || "General",
      emoji: modal.emoji || "📦",
      kw: modal.kw
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean),
    };
    let next: Product[];
    if (modal.id) {
      next = products.map((p) => (p.id === modal.id ? { ...p, ...data } : p));
    } else {
      next = [
        { id: uid(), sold: 0, hidden: false, ...data, cl: CHIP_COLORS[Math.floor(Math.random() * CHIP_COLORS.length)] },
        ...products,
      ];
    }
    setProducts(next);
    persist(next);
    setModal(emptyModal);
  };

  const del = (id: string) => {
    if (!window.confirm("Delete this product? It will disappear from the AI immediately.")) return;
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    persist(next);
  };

  const dup = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const next = [{ ...p, id: uid(), name: p.name + " (copy)", sold: 0 }, ...products];
    setProducts(next);
    persist(next);
  };

  const stockStep = (id: string, d: number) => {
    const next = products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + d) } : p));
    setProducts(next);
    persist(next);
  };

  return (
    <div className="viewwrap max-w-[1240px] mx-auto">
      <div className="section-h">
        <div>
          <h2>Products</h2>
          <p>
            Every change here reaches the AI <b>instantly</b> — the agent always quotes live stock and prices.
          </p>
        </div>
        <button className="btn pri" onClick={() => openEdit(null)}>
          <Icon name="plus" size={15} /> Add product
        </button>
      </div>

      <div className="pcard" style={{ marginBottom: 14, display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="field" style={{ flex: 1, minWidth: 170, margin: 0 }}>
          <label>Search</label>
          <input className="inp" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Category</label>
          <select className="inp" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">All categories</option>
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Low-stock threshold</label>
          <input
            className="inp"
            type="number"
            min={1}
            style={{ width: 90 }}
            value={threshold}
            onChange={(e) => {
              const t = Math.max(1, Number(e.target.value) || 1);
              setThreshold(t);
              clearTimeout((window as any).__thresholdTimer);
              (window as any).__thresholdTimer = setTimeout(() => {
                fetch("/api/workspace", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ products, lowStockThreshold: t, policies: { outOfStockBehavior: behavior } }),
                }).catch(() => {});
              }, 500);
            }}
          />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>When out of stock, AI should…</label>
          <select className="inp" value={behavior} onChange={(e) => {
            const v = e.target.value as typeof behavior;
            setBehavior(v);
            fetch("/api/workspace", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ products, lowStockThreshold: threshold, policies: { outOfStockBehavior: v } }),
            }).catch(() => {});
          }}>
            <option value="both">Suggest alternatives + offer restock notify</option>
            <option value="suggest">Suggest alternatives only</option>
            <option value="notify">Offer to notify when back</option>
          </select>
        </div>
      </div>

      {!loaded ? (
        <div className="card">
          <div className="empty">
            <p>Loading your catalog…</p>
          </div>
        </div>
      ) : list.length ? (
        <div style={{ overflowX: "auto" }}>
          <table className="ptable">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const st = pStatus(p, threshold);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                        <span className="pth" style={{ background: p.cl }}>{p.emoji}</span>
                        <div>
                          <b style={{ fontSize: 13.5 }}>{p.name}</b>
                          <div style={{ fontSize: 11, color: "var(--mut2)" }} className="mono">{p.sold} sold</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge b-mut">{p.cat}</span>
                    </td>
                    <td className="mono" style={{ fontWeight: 600 }}>{TZS(p.price)}</td>
                    <td>
                      <span className="stepq">
                        <button onClick={() => stockStep(p.id, -1)} aria-label="minus"><Icon name="minus" size={12} /></button>
                        <b>{p.stock}</b>
                        <button onClick={() => stockStep(p.id, 1)} aria-label="plus"><Icon name="plus" size={12} /></button>
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${st[1]}`}>{st[0]}</span>
                    </td>
                    <td>
                      <div className="rowacts">
                        <button title="Edit" onClick={() => openEdit(p.id)}><Icon name="edit" size={14} /></button>
                        <button title="Duplicate" onClick={() => dup(p.id)}><Icon name="copy" size={14} /></button>
                        <button className="del" title="Delete" onClick={() => del(p.id)}><Icon name="trash" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty">
            <span className="ic-big"><Icon name="box" size={24} /></span>
            <p style={{ marginBottom: 14 }}>
              {query || cat !== "all"
                ? "No products found for this filter."
                : "Your catalog is empty. Add your first product and the AI will instantly know its price and stock."}
            </p>
            <button
              className="btn pri"
              onClick={() => (query || cat !== "all" ? (setQuery(""), setCat("all")) : openEdit(null))}
            >
              <Icon name="plus" size={14} /> {query || cat !== "all" ? "Clear filters" : "Add your first product"}
            </button>
          </div>
        </div>
      )}

      {modal.open && (
        <div id="modalRoot" style={{ position: "static" }}>
          <div className="mback" onClick={() => setModal(emptyModal)} />
          <div className="mpanel">
            <div className="mhead">
              <h3>{modal.id ? "Edit product" : "Add product"}</h3>
              <button className="mx" onClick={() => setModal(emptyModal)} aria-label="Close">
                <Icon name="x" size={17} />
              </button>
            </div>
            <div className="mbody">
              <div className="field">
                <label>Name</label>
                <input className="inp" placeholder="e.g. Samsung Galaxy A35" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} />
              </div>
              <div className="grid2">
                <div className="field">
                  <label>Price (TZS)</label>
                  <input className="inp" type="number" value={modal.price} onChange={(e) => setModal({ ...modal, price: e.target.value })} />
                </div>
                <div className="field">
                  <label>Stock</label>
                  <input className="inp" type="number" value={modal.stock} onChange={(e) => setModal({ ...modal, stock: e.target.value })} />
                </div>
              </div>
              <div className="grid2">
                <div className="field">
                  <label>Category</label>
                  <input className="inp" placeholder="Phones / Accessories…" value={modal.cat} onChange={(e) => setModal({ ...modal, cat: e.target.value })} />
                </div>
                <div className="field">
                  <label>Emoji / icon</label>
                  <input className="inp" maxLength={4} value={modal.emoji} onChange={(e) => setModal({ ...modal, emoji: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Keywords the AI should recognise (comma separated)</label>
                <input className="inp" placeholder="e.g. samsung, a35, galaxy" value={modal.kw} onChange={(e) => setModal({ ...modal, kw: e.target.value })} />
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