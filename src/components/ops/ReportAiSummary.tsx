import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { explainReports } from "@/lib/ops-ai.functions";
import type { OperationalReport, ReportSection } from "@/lib/ops-reports";

interface Props {
  rows: OperationalReport[];
  section: ReportSection;
  plantName: string;
  periodLabel: string;
  from: string;
  to: string;
}

/** زر «شرح التقارير بالذكاء الاصطناعي» + لوحة عرض الشرح. */
export default function ReportAiSummary({ rows, section, plantName, periodLabel, from, to }: Props) {
  const run = useServerFn(explainReports);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setText(null);
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
    } catch {
      setText("تعذر توليد الشرح.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="default" className="gap-2" disabled={!rows.length || loading} onClick={generate}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        شرح التقارير بالذكاء الاصطناعي
      </Button>

      {text && (
        <div className="glass-card mt-4 basis-full rounded-xl border p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Sparkles className="h-4 w-4" /> شرح تحليلي للتقارير
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{text}</p>
        </div>
      )}
    </>
  );
}
