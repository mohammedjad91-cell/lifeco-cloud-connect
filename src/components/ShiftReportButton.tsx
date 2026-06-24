import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getOperator } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

interface Props {
  department: string;
  date: Date;
}

export default function ShiftReportButton({ department, date }: Props) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setBusy(true);
    try {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);

      const [{ data: ops }, { data: field }, { data: activity }] = await Promise.all([
        supabase.from("operations_logs").select("*")
          .eq("department", department)
          .gte("timestamp", start.toISOString()).lte("timestamp", end.toISOString())
          .order("timestamp", { ascending: true }),
        supabase.from("field_ops_logs").select("*")
          .eq("department", department)
          .gte("timestamp", start.toISOString()).lte("timestamp", end.toISOString())
          .order("timestamp", { ascending: true }),
        supabase.from("activity_logs").select("*")
          .eq("department", department)
          .gte("created_at", start.toISOString()).lte("created_at", end.toISOString())
          .order("created_at", { ascending: true }),
      ]);

      const doc = new jsPDF({ orientation: "portrait" });
      const W = doc.internal.pageSize.width;

      // Branded header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, W, 28, "F");
      doc.setTextColor(212, 175, 55);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("LIFECO PMS 2026", 14, 14);
      doc.setFontSize(11);
      doc.setTextColor(220, 220, 220);
      doc.text("SHIFT REPORT", 14, 22);
      doc.setFontSize(9);
      doc.text(`Generated: ${format(new Date(), "dd MMM yyyy HH:mm")}`, W - 14, 14, { align: "right" });
      doc.text(`Shift Date: ${format(date, "dd MMM yyyy")}`, W - 14, 22, { align: "right" });

      // Personnel block
      const op = getOperator();
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Department", 14, 40);
      doc.text("Shift Operator", 80, 40);
      doc.text("Employee ID", 150, 40);
      doc.setFont("helvetica", "normal");
      doc.text(department, 14, 47);
      doc.text(op?.name ?? "—", 80, 47);
      doc.text(op?.employeeId ?? "—", 150, 47);

      // Summary
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.4);
      doc.line(14, 53, W - 14, 53);

      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, 62);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`• Operations log entries: ${ops?.length ?? 0}`, 16, 70);
      doc.text(`• Field operations rounds: ${field?.length ?? 0}`, 16, 76);
      doc.text(`• System activities recorded: ${activity?.length ?? 0}`, 16, 82);

      // Operations table
      autoTable(doc, {
        startY: 90,
        head: [["#", "Tag", "Value", "Employee", "Time"]],
        body: (ops ?? []).map((l: any, i: number) => [
          i + 1, l.unit_tag, l.value, l.employee_id ?? "—",
          format(new Date(l.timestamp), "HH:mm:ss"),
        ]),
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42], textColor: [212, 175, 55], fontSize: 10 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          doc.setFontSize(13);
          doc.setFont("helvetica", "bold");
          doc.text("Operations Log", 14, (doc as any).lastAutoTable?.startY ? (doc as any).lastAutoTable.startY - 4 : 90);
        },
      });

      // Field ops table
      let y = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Field Operations Rounds", 14, y);
      autoTable(doc, {
        startY: y + 4,
        head: [["#", "Equipment", "Pressure", "Temp", "Run Hrs", "Technician", "Notes"]],
        body: (field ?? []).map((r: any, i: number) => [
          i + 1, r.equipment_tag,
          r.discharge_pressure ?? "—",
          r.temperature ?? "—",
          r.running_hours ?? "—",
          r.technician_name ?? "—",
          (r.notes ?? "").slice(0, 60),
        ]),
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42], textColor: [212, 175, 55], fontSize: 10 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });

      // Footer on every page
      const pages = (doc as any).getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        const H = doc.internal.pageSize.height;
        doc.setDrawColor(212, 175, 55);
        doc.line(14, H - 16, W - 14, H - 16);
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        doc.text("LIFECO PMS 2026 — Confidential. Prepared by Eng. Mohammed Gadallah.", 14, H - 10);
        doc.text(`Page ${i} / ${pages}`, W - 14, H - 10, { align: "right" });
      }

      doc.save(`LIFECO_Shift_Report_${department}_${format(date, "yyyy-MM-dd")}.pdf`);
      toast({ title: "Shift report generated" });
    } catch (e: any) {
      toast({ title: "Report failed", description: String(e?.message ?? e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button onClick={generate} disabled={busy} className="gap-2">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Generate Shift Report (PDF)
    </Button>
  );
}
