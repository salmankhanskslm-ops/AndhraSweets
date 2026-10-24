import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, FileDown, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useItems, useShops, useBills, useSettings, uid, lineTotal, billTotal, inr, type BillLine, type Bill } from "@/lib/store";
import { makeBillPdf, downloadBlob, shareBlob } from "@/lib/pdf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "New Bill — Andhra Sweets" },
      { name: "description", content: "Create wholesale sweet bills for buyer shops, download as PDF and share." },
      { property: "og:title", content: "New Bill — Andhra Sweets" },
      { property: "og:description", content: "Create wholesale sweet bills and share them with buyers." },
    ],
  }),
  component: NewBill,
});

function NewBill() {
  const [items] = useItems();
  const [shops] = useShops();
  const [bills, setBills] = useBills();
  const [settings] = useSettings();
  const [shopId, setShopId] = useState("");
  const [lines, setLines] = useState<BillLine[]>([]);
  const [pick, setPick] = useState("");
  const [saved, setSaved] = useState<{ bill: Bill; blob: Blob } | null>(null);

  const available = items.filter((i) => i.available);
  const shop = shops.find((s) => s.id === shopId);
  const total = billTotal(lines);

  const addItem = (id: string) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    if (lines.some((l) => l.itemId === id)) { toast("Already in bill"); return; }
    setLines([...lines, { itemId: it.id, name: it.name, unit: it.unit, qty: 1, price: it.price }]);
    setPick("");
    setSaved(null);
  };
  const update = (id: string, patch: Partial<BillLine>) => {
    setLines(lines.map((l) => (l.itemId === id ? { ...l, ...patch } : l)));
    setSaved(null);
  };

  const finish = async () => {
    if (!shop) { toast.error("Select a shop"); return; }
    const valid = lines.filter((l) => l.qty > 0);
    if (!valid.length) { toast.error("Add at least one item"); return; }
    const number = (bills[0]?.number ?? 0) + 1;
    const bill: Bill = { id: uid(), number, date: new Date().toISOString(), shop, lines: valid, total: billTotal(valid) };
    const blob = await makeBillPdf(bill, settings);
    setBills([bill, ...bills]);
    setSaved({ bill, blob });
    toast.success(`Bill #${number} saved`);
  };

  const fname = saved ? `Bill-${saved.bill.number}-${saved.bill.shop.name.replace(/\s+/g, "_")}.pdf` : "";
  const reset = () => { setLines([]); setShopId(""); setSaved(null); };

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-primary">New Bill</h1>

      <section className="card-soft space-y-2 p-4">
        <label className="text-sm font-semibold">Buyer shop</label>
        {shops.length ? (
          <select className="field" value={shopId} onChange={(e) => { setShopId(e.target.value); setSaved(null); }}>
            <option value="">Select shop…</option>
            {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        ) : (
          <p className="text-sm text-muted-foreground">No shops yet. <Link to="/shops" className="text-primary underline">Add a shop</Link></p>
        )}
      </section>

      <section className="card-soft space-y-3 p-4">
        <label className="text-sm font-semibold">Add sweets</label>
        <select className="field" value={pick} onChange={(e) => addItem(e.target.value)}>
          <option value="">+ Choose item…</option>
          {available.map((i) => <option key={i.id} value={i.id}>{i.name} — {inr(i.price)}/{i.unit}</option>)}
        </select>

        {lines.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No items added yet.</p>}
        <ul className="divide-y">
          {lines.map((l) => (
            <li key={l.itemId} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-32 flex-1">
                <p className="font-semibold">{l.name}</p>
                <p className="text-xs text-muted-foreground">{inr(l.price)} / {l.unit}</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="btn btn-ghost !p-2" aria-label="Less" onClick={() => update(l.itemId, { qty: Math.max(0, l.qty - 1) })}><Minus className="h-4 w-4" /></button>
                <input type="number" inputMode="decimal" min={0} step="0.5" className="field !w-20 text-center" value={l.qty}
                  onChange={(e) => update(l.itemId, { qty: Number(e.target.value) })} />
                <button className="btn btn-ghost !p-2" aria-label="More" onClick={() => update(l.itemId, { qty: l.qty + 1 })}><Plus className="h-4 w-4" /></button>
              </div>
              <p className="w-24 text-right font-semibold">{inr(lineTotal(l))}</p>
              <button aria-label="Remove" className="text-destructive" onClick={() => { setLines(lines.filter((x) => x.itemId !== l.itemId)); setSaved(null); }}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-soft sticky bottom-20 flex flex-wrap items-center justify-between gap-3 p-4 md:bottom-4">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-display text-3xl font-semibold text-primary">{inr(total)}</p>
        </div>
        {!saved ? (
          <button className="btn btn-gold" onClick={finish}>Save bill</button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={() => downloadBlob(saved.blob, fname)}><FileDown className="h-4 w-4" />Download</button>
            <button className="btn btn-gold" onClick={async () => {
              const ok = await shareBlob(saved.blob, fname, `Bill #${saved.bill.number} — ${inr(saved.bill.total)}`);
              if (!ok) {
                downloadBlob(saved.blob, fname);
                const msg = encodeURIComponent(`Hello ${saved.bill.shop.name}, your bill #${saved.bill.number} total is ${inr(saved.bill.total)}. PDF attached.`);
                const phone = saved.bill.shop.phone.replace(/\D/g, "");
                window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
              }
            }}><Share2 className="h-4 w-4" />Send</button>
            <button className="btn btn-ghost" onClick={reset}>New</button>
          </div>
        )}
      </section>
    </div>
  );
}
