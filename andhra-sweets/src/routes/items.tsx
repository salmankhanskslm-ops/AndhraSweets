import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useItems, uid } from "@/lib/store";

export const Route = createFileRoute("/items")({
  head: () => ({
    meta: [
      { title: "Items & Prices — Andhra Sweets" },
      { name: "description", content: "Manage the sweets you sell, their units and wholesale prices." },
      { property: "og:title", content: "Items & Prices — Andhra Sweets" },
      { property: "og:description", content: "Set sweets, units and wholesale prices." },
    ],
  }),
  component: Items,
});

function Items() {
  const [items, setItems] = useItems();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setItems([...items, { id: uid(), name: name.trim(), unit, price: Number(price), available: true }]);
    setName(""); setPrice("");
  };
  const update = (id: string, patch: object) => setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-primary">Items & Prices</h1>
      <form onSubmit={add} className="card-soft grid gap-3 p-4 sm:grid-cols-[1fr_7rem_8rem_auto]">
        <input className="field" placeholder="Sweet name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="field" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {["kg", "box", "piece", "tray", "packet"].map((u) => <option key={u}>{u}</option>)}
        </select>
        <input className="field" type="number" inputMode="decimal" placeholder="Price ₹" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button className="btn">Add</button>
      </form>

      <ul className="card-soft divide-y">
        {items.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center gap-3 p-4">
            <input className="field min-w-32 flex-1 font-semibold" value={i.name} onChange={(e) => update(i.id, { name: e.target.value })} />
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">₹</span>
              <input className="field !w-24" type="number" inputMode="decimal" value={i.price} onChange={(e) => update(i.id, { price: Number(e.target.value) })} />
              <span className="text-sm text-muted-foreground">/{i.unit}</span>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-primary" checked={i.available} onChange={(e) => update(i.id, { available: e.target.checked })} />
              In stock
            </label>
            <button aria-label="Delete" className="text-destructive" onClick={() => confirm(`Delete ${i.name}?`) && setItems(items.filter((x) => x.id !== i.id))}>
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {!items.length && <li className="p-6 text-center text-muted-foreground">No items yet.</li>}
      </ul>
    </div>
  );
}
