import { useState } from "react";
import { Sparkles, Loader2, FileDown } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { explainReports } from "@/lib/ops-ai.functions";
import { exportReportsPdf } from "@/lib/ops-report-pdf";
import type { OperationalReport, PlantKey, ReportSection } from "@/lib/ops-reports";

interface Props {
  rows: OperationalReport[];
  section: ReportSection;
  plantKey: PlantKey | "ALL";
  plantName: string;
  periodLabel: string;
  from: string;
  to: string;
}

/** زر «شرح التقارير بالذكاء الاصطناعي» + تصدير الشرح مع جداول التقارير في PDF واحد. */
export default function ReportAiSummary({ rows, section, plantKey, plantName, periodLabel, from, to }: Props) {
  const run = useServerFn(explainReports);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [textEn, setTextEn] = useState("");

  const generate = async () => {
    setLoading(true);
    setText(null);
    setTextEn("");
    try {
      const res = await run({
        data: {
          section,
          plantName,
          periodLabel,
          from,
          to,
          rows: rows.slice(0, 300).map((r) => ({
            report_date: r.report_date,
            shift: r.shift,
            work_category: r.work_category,
            severity: r.severity,
            status: r.status,
            title: r.title,
            description: r.description,
            equipment_tag: r.equipment_tag,
            supervisor_name: r.supervisor_name,
          })),
        },
      });
      setText(res.text);
      setTextEn(res.textEn || "");
    } catch {
      setText("تعذر توليد الشرح.");
    } finally {
      setLoading(false);
    }
  };

  const exportAll = () =>
    exportReportsPdf({
      rows,
      plantKey,
      from,
      to,
      periodLabel,
      aiSummary: textEn || text || undefined,
    });

  return (
    <>
      <Button variant="default" className="gap-2" disabled={!rows.length || loading} onClick={generate}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        شرح التقارير بالذكاء الاصطناعي
      </Button>

      {text && (
        <div className="glass-card mt-4 basis-full rounded-xl border p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="h-4 w-4" /> شرح تحليلي للتقارير
            </h3>
            <Button size="sm" variant="secondary" className="gap-2" onClick={exportAll}>
              <FileDown className="h-4 w-4" /> تصدير الشرح + الجداول PDF
            </Button>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{text}</p>
          <p className="mt-3 text-[11px] text-muted-foreground/70">
            ملاحظة: نص الشرح داخل ملف PDF يُطبع بالإنجليزية لأن خطوط PDF القياسية لا تدعم الحروف العربية.
          </p>
        </div>
      )}
    </>
  );
}
