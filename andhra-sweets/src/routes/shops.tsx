import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useShops, useSettings, uid } from "@/lib/store";

export const Route = createFileRoute("/shops")({
  head: () => ({
    meta: [
      { title: "Shops — Andhra Sweets" },
      { name: "description", content: "Manage buyer shops and your own business details for bills." },
      { property: "og:title", content: "Shops — Andhra Sweets" },
      { property: "og:description", content: "Manage buyer shops and business details." },
    ],
  }),
  component: Shops,
});

function Shops() {
  const [shops, setShops] = useShops();
  const [settings, setSettings] = useSettings();
  const [f, setF] = useState({ name: "", phone: "", address: "" });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    setShops([...shops, { id: uid(), ...f, name: f.name.trim() }]);
    setF({ name: "", phone: "", address: "" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-primary">Buyer Shops</h1>
      <form onSubmit={add} className="card-soft grid gap-3 p-4 sm:grid-cols-3">
        <input className="field" placeholder="Shop name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="field" placeholder="WhatsApp number (e.g. 9198…)" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input className="field" placeholder="Address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
        <button className="btn sm:col-span-3">Add shop</button>
      </form>
      <ul className="card-soft divide-y">
        {shops.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-muted-foreground">{[s.phone, s.address].filter(Boolean).join(" · ") || "—"}</p>
            </div>
            <button aria-label="Delete" className="text-destructive" onClick={() => confirm(`Delete ${s.name}?`) && setShops(shops.filter((x) => x.id !== s.id))}>
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {!shops.length && <li className="p-6 text-center text-muted-foreground">No shops yet.</li>}
      </ul>

      <h2 className="text-2xl font-semibold text-primary">Your business (printed on bills)</h2>
      <div className="card-soft grid gap-3 p-4 sm:grid-cols-3">
        <input className="field" placeholder="Business name" value={settings.businessName} onChange={(e) => setSettings({ ...settings, businessName: e.target.value })} />
        <input className="field" placeholder="Phone" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
        <input className="field" placeholder="Address" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
      </div>
    </div>
  );
}
