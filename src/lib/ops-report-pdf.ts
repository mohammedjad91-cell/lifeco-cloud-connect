import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { OperationalReport, PlantKey } from "@/lib/ops-reports";
import { PLANTS, summarize } from "@/lib/ops-reports";

/** Executive handover PDF. English labels — jsPDF core fonts have no Arabic glyphs. */
export function exportReportsPdf(opts: {
  rows: OperationalReport[];
  plantKey: PlantKey | "ALL";
  from: string;
  to: string;
  periodLabel: string;
  /** Optional AI analysis (English — core PDF fonts have no Arabic glyphs). */
  aiSummary?: string;
}) {
  const { rows, plantKey, from, to, periodLabel, aiSummary } = opts;

  const doc = new jsPDF({ orientation: "landscape" });
  const W = doc.internal.pageSize.width;
  const s = summarize(rows);
  const plantName = plantKey === "ALL" ? "Ammonia & Urea Plants" : PLANTS[plantKey].nameEn;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 26, "F");
  doc.setTextColor(212, 175, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("LIFECO PMS 2026", 14, 13);
  doc.setFontSize(10);
  doc.setTextColor(225, 225, 225);
  doc.text("SUPERVISOR OPERATIONAL REPORT", 14, 21);
  doc.setFontSize(9);
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy HH:mm")}`, W - 14, 13, { align: "right" });
  doc.text(`${periodLabel}: ${from} to ${to}`, W - 14, 21, { align: "right" });

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(plantName, 14, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Total entries: ${s.total}    Routine: ${s.routine}    Non-routine: ${s.nonRoutine}    High/Critical: ${s.critical}    Approved: ${s.approved}`,
    14,
    46,
  );

  autoTable(doc, {
    startY: 54,
    head: [["#", "Date", "Plant", "Shift", "Period", "Category", "Title", "Equipment", "Severity", "Supervisor", "Status"]],
    body: rows.map((r, i) => [
      i + 1,
      r.report_date,
      r.plant_key === "AMMONIA" ? "Ammonia" : "Urea",
      r.shift,
      r.period_type,
      r.work_category === "routine" ? "Routine" : "NON-ROUTINE",
      (r.title ?? "").slice(0, 48),
      r.plant_code ?? r.equipment_tag ?? "-",
      r.severity.toUpperCase(),
      r.supervisor_name ?? "-",
      r.status,
    ]),
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: [212, 175, 55], fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 5 && String(data.cell.raw).includes("NON")) {
        data.cell.styles.textColor = [180, 30, 30];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // تفاصيل السجلات (الوصف الكامل) — جدول ثانٍ يمتد على عدة صفحات عند الحاجة
  const detailed = rows.filter((r) => (r.description ?? "").trim().length > 0);
  if (detailed.length) {
    autoTable(doc, {
      startY: ((doc as any).lastAutoTable?.finalY ?? 60) + 10,
      head: [["#", "Date", "Category", "Severity", "Title", "Details / Description"]],
      body: detailed.map((r, i) => [
        i + 1,
        r.report_date,
        r.work_category === "routine" ? "Routine" : "NON-ROUTINE",
        r.severity.toUpperCase(),
        r.title ?? "-",
        r.description ?? "-",
      ]),
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42], textColor: [212, 175, 55], fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 22 }, 2: { cellWidth: 26 }, 3: { cellWidth: 22 }, 4: { cellWidth: 55 } },
      margin: { left: 14, right: 14 },
    });
  }

  // شرح الذكاء الاصطناعي — يبدأ في صفحة جديدة ويمتد على عدة صفحات
  if (aiSummary && aiSummary.trim()) {
    doc.addPage();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, W, 20, "F");
    doc.setTextColor(212, 175, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("AI ANALYSIS & INTERPRETATION", 14, 13);

    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const H = doc.internal.pageSize.height;
    let y = 32;
    const lines = doc.splitTextToSize(aiSummary.replace(/\*\*/g, ""), W - 28) as string[];
    for (const line of lines) {
      if (y > H - 22) {
        doc.addPage();
        y = 22;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
      }
      doc.text(line, 14, y);
      y += 6;
    }
  }

  const pages = (doc as any).getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);

    const H = doc.internal.pageSize.height;
    doc.setDrawColor(212, 175, 55);
    doc.line(14, H - 14, W - 14, H - 14);
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text("LIFECO PMS 2026 — Confidential. Prepared by Eng. Mohamed Gadalla.", 14, H - 8);
    doc.text(`Page ${i} / ${pages}`, W - 14, H - 8, { align: "right" });
  }

  doc.save(`LIFECO_Ops_Report_${plantKey}_${from}_${to}.pdf`);
}
