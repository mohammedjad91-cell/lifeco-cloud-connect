import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateDailyReport } from "@/lib/report.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, FileDown, Loader2, Share2, Mail } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { getOperator, getStamp } from "@/lib/session";

interface Props {
  department: string;
  date: Date;
}

export default function DailyReportGenerator({ department, date }: Props) {
  const { toast } = useToast();
  const generate = useServerFn(generateDailyReport);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const run = async () => {
    setBusy(true);
    try {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const op = getOperator();
      const stamp = getStamp(op);

      const [opsRes, labRes] = await Promise.all([
        supabase.from("operations_logs").select("unit_tag,value,timestamp,employee_id")
          .eq("department", department)
          .gte("timestamp", start.toISOString()).lte("timestamp", end.toISOString()),
        supabase.from("lab_results").select("parameter_name,value,sample_type,technician_name,timestamp")
          .eq("plant", department)
          .gte("timestamp", start.toISOString()).lte("timestamp", end.toISOString()),
      ]);

      const result = await generate({
        data: {
          department,
          date: format(date, "EEEE, dd MMM yyyy"),
          operator: stamp.user,
          opsLogs: (opsRes.data || []) as any,
          labResults: (labRes.data || []) as any,
          maintenance: [],
        },
      });
      setDraft(result.draft);

      if (result.error) {
        toast({ title: "AI returned an error", variant: "destructive" });
      } else {
        toast({ title: "تم إنشاء التقرير", description: "يمكنك الآن مشاركته عبر واتساب أو الإيميل." });
      }
    } catch (e) {
      toast({ title: "Failed to generate", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const cleanPhone = (p: string) => p.replace(/[^\d]/g, "");

  const shareWhatsApp = () => {
    if (!draft) return;
    const num = cleanPhone(phone);
    const text = encodeURIComponent(draft);
    const url = num
      ? `https://wa.me/${num}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  const shareEmail = () => {
    if (!draft) return;
    const subject = encodeURIComponent(`LIFECO Daily Report — ${department} — ${format(date, "dd MMM yyyy")}`);
    const body = encodeURIComponent(draft);
    const to = email.trim();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
  };

  const exportPdf = () => {
    const op = getOperator();
    const stamp = getStamp(op);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`LIFECO PMS 2026 — Daily Report (${department})`, 14, 18);
    doc.setFontSize(10);
    doc.text(`${stamp.day}, ${stamp.date} — Operator: ${stamp.user}`, 14, 26);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(draft || "(empty)", 180);
    doc.text(lines, 14, 36);
    doc.save(`LIFECO_DailyReport_${department}_${format(date, "yyyyMMdd")}.pdf`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold neon-text flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> Smart Daily Report
        </h3>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={run} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate
          </Button>
          <Button variant="outline" onClick={exportPdf} disabled={!draft} className="gap-1.5">
            <FileDown className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex gap-2">
          <Input
            dir="ltr"
            placeholder="رقم واتساب مع رمز الدولة (مثال: 966555555555)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button variant="secondary" onClick={shareWhatsApp} disabled={!draft} className="gap-1.5 shrink-0">
            <Share2 className="w-4 h-4" /> واتساب
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            dir="ltr"
            type="email"
            placeholder="بريد المستلم (Gmail)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button variant="secondary" onClick={shareEmail} disabled={!draft} className="gap-1.5 shrink-0">
            <Mail className="w-4 h-4" /> Gmail
          </Button>
        </div>
      </div>

      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={16}
        placeholder="اضغط Generate لإنشاء التقرير، ثم أدخل رقم الواتساب أو البريد وشاركه."
        className="font-mono text-xs"
      />
    </div>
  );
}
