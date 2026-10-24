import { useEffect, useState, useCallback } from "react";

export type Item = { id: string; name: string; unit: string; price: number; available: boolean };
export type Shop = { id: string; name: string; phone: string; address: string };
export type BillLine = { itemId: string; name: string; unit: string; qty: number; price: number };
export type Bill = { id: string; number: number; date: string; shop: Shop; lines: BillLine[]; total: number };
export type Settings = { businessName: string; phone: string; address: string };

export const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_ITEMS: Item[] = [
  { id: "i1", name: "Kaju Katli", unit: "kg", price: 900, available: true },
  { id: "i2", name: "Motichoor Laddoo", unit: "kg", price: 420, available: true },
  { id: "i3", name: "Gulab Jamun", unit: "kg", price: 320, available: true },
  { id: "i4", name: "Soan Papdi", unit: "box", price: 150, available: true },
];
const DEFAULT_SHOPS: Shop[] = [{ id: "s1", name: "Sharma Sweets", phone: "", address: "" }];
const DEFAULT_SETTINGS: Settings = { businessName: "Andhra Sweets", phone: "", address: "" };
const LEGACY_NAMES = ["My Sweet Wholesale", "Mithai Wholesale", "Mithai Bills", ""];

function migrateSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } as Settings;
    const name = (parsed.businessName ?? "").trim();
    const next = LEGACY_NAMES.includes(name) ? { ...parsed, businessName: DEFAULT_SETTINGS.businessName } : parsed;
    if (JSON.stringify(next) !== JSON.stringify(parsed)) localStorage.setItem("mithai.settings", JSON.stringify(next));
    return next;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function useStored<T>(key: string, initial: T, migrate?: (raw: string | null) => T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (migrate) {
      setValue(migrate(raw));
    } else if (raw) {
      try { setValue(JSON.parse(raw)); } catch { /* ignore */ }
    }
    const onSync = (e: Event) => {
      if ((e as CustomEvent).detail === key) {
        const r = localStorage.getItem(key);
        if (r) setValue(JSON.parse(r));
      }
    };
    window.addEventListener("store-sync", onSync);
    return () => window.removeEventListener("store-sync", onSync);
  }, [key]);
  const save = useCallback(
    (next: T) => {
      setValue(next);
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("store-sync", { detail: key }));
    },
    [key],
  );
  return [value, save] as const;
}

export const useItems = () => useStored<Item[]>("mithai.items", DEFAULT_ITEMS);
export const useShops = () => useStored<Shop[]>("mithai.shops", DEFAULT_SHOPS);
export const useBills = () => useStored<Bill[]>("mithai.bills", []);
export const useSettings = () => useStored<Settings>("mithai.settings", DEFAULT_SETTINGS, migrateSettings);

export const lineTotal = (l: { qty: number; price: number }) => Math.round(l.qty * l.price * 100) / 100;
export const billTotal = (lines: { qty: number; price: number }[]) =>
  Math.round(lines.reduce((s, l) => s + lineTotal(l), 0) * 100) / 100;
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
