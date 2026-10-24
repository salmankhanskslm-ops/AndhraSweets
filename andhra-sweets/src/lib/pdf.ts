import type { Bill, Settings } from "./store";
import { lineTotal } from "./store";

const rs = (n: number) => "Rs. " + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export async function makeBillPdf(bill: Bill, s: Settings): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(110, 15, 28);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold").setFontSize(16).text(s.businessName, 10, 12);
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text([s.phone, s.address].filter(Boolean).join("  |  ") || "Wholesale Sweets", 10, 19);
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.text(`Bill #${bill.number}`, 10, 38);
  doc.text(new Date(bill.date).toLocaleDateString("en-IN"), W - 10, 38, { align: "right" });
  doc.setFont("helvetica", "bold").text(`To: ${bill.shop.name}`, 10, 45);
  doc.setFont("helvetica", "normal");
  let y = 50;
  if (bill.shop.phone) { doc.text(bill.shop.phone, 10, y); y += 5; }
  y += 4;
  doc.setFillColor(245, 230, 200);
  doc.rect(8, y - 5, W - 16, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Item", 10, y); doc.text("Qty", 75, y, { align: "right" });
  doc.text("Rate", 100, y, { align: "right" }); doc.text("Amount", W - 10, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 8;
  for (const l of bill.lines) {
    if (y > 190) { doc.addPage(); y = 15; }
    doc.text(l.name, 10, y);
    doc.text(`${l.qty} ${l.unit}`, 75, y, { align: "right" });
    doc.text(rs(l.price), 100, y, { align: "right" });
    doc.text(rs(lineTotal(l)), W - 10, y, { align: "right" });
    y += 7;
  }
  doc.line(8, y - 3, W - 8, y - 3);
  doc.setFont("helvetica", "bold").setFontSize(12);
  doc.text("Total", 10, y + 4);
  doc.text(rs(bill.total), W - 10, y + 4, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
  doc.text("Thank you for your business!", W / 2, 202, { align: "center" });
  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function shareBlob(blob: Blob, filename: string, text: string) {
  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename, text }); return true; }
    catch (e) { if ((e as DOMException).name === "AbortError") return true; }
  }
  return false;
}
