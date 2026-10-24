import { Link } from "@tanstack/react-router";
import { Receipt, Candy, Store, History, Download } from "lucide-react";
import { useSettings } from "@/lib/store";

const links = [
  { to: "/", label: "New Bill", icon: Receipt },
  { to: "/items", label: "Items & Prices", icon: Candy },
  { to: "/shops", label: "Shops", icon: Store },
  { to: "/bills", label: "Bills", icon: History },
  { to: "/install", label: "Get App", icon: Download },
] as const;

export function AppNav() {
  const [settings] = useSettings();
  return (
    <>
      <header className="sticky top-0 z-20 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/icon-192.png" alt="" width={32} height={32} className="rounded-lg" />
            <span className="font-display text-xl font-semibold">{settings.businessName || "Andhra Sweets"}</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="rounded-md px-3 py-1.5 text-sm opacity-80 hover:opacity-100"
                activeProps={{ className: "bg-gold text-accent-foreground !opacity-100" }} activeOptions={{ exact: true }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-card md:hidden">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground"
            activeProps={{ className: "!text-primary font-semibold" }} activeOptions={{ exact: true }}>
            <l.icon className="h-5 w-5" />
            {l.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </>
  );
}
