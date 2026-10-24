import { createFileRoute } from "@tanstack/react-router";
import { FileDown, Trash2 } from "lucide-react";
import { useBills, useSettings, inr } from "@/lib/store";
import { makeBillPdf, downloadBlob } from "@/lib/pdf";

export const Route = createFileRoute("/bills")({
  head: () => ({
    meta: [
      { title: "Past Bills — Andhra Sweets" },
      { name: "description", content: "See and re-download all saved wholesale bills." },
      { property: "og:title", content: "Past Bills — Andhra Sweets" },
      { property: "og:description", content: "See and re-download saved bills." },
    ],
  }),
  component: Bills,
});

function Bills() {
  const [bills, setBills] = useBills();
  const [settings] = useSettings();
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-primary">Past Bills</h1>
      <ul className="card-soft divide-y">
        {bills.map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">#{b.number} · {b.shop.name}</p>
              <p className="text-sm text-muted-foreground">{new Date(b.date).toLocaleString("en-IN")} · {b.lines.length} items</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{inr(b.total)}</span>
              <button aria-label="Download" className="btn btn-ghost !p-2" onClick={async () => downloadBlob(await makeBillPdf(b, settings), `Bill-${b.number}.pdf`)}>
                <FileDown className="h-4 w-4" />
              </button>
              <button aria-label="Delete" className="text-destructive" onClick={() => confirm("Delete this bill?") && setBills(bills.filter((x) => x.id !== b.id))}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {!bills.length && <li className="p-6 text-center text-muted-foreground">No bills yet.</li>}
      </ul>
    </div>
  );
}
