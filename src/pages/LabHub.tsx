import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, FlaskConical, FileDown, TestTubes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReportBuilder from "@/components/ops/ReportBuilder";
import ReportFeed from "@/components/ops/ReportFeed";
import MetricCard from "@/components/ops/MetricCard";
import { useToast } from "@/hooks/use-toast";
import { exportReportsPdf } from "@/lib/ops-report-pdf";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABEL,
  LAB_TITLES,
  PERIOD_LABEL,
  PLANTS,
  fetchReports,
  periodRange,
  setReportStatus,
  summarize,
  type PeriodType,
  type PlantKey,
  type WorkCategory,
} from "@/lib/ops-reports";

export default function LabHub({ plantKey }: { plantKey: PlantKey }) {
  const plant = PLANTS[plantKey];
  const lab = LAB_TITLES[plantKey];
  const { toast } = useToast();
  const qc = useQueryClient();

  const [period, setPeriod] = useState<PeriodType>("daily");
  const [category, setCategory] = useState<WorkCategory | "ALL">("ALL");
  const [anchor, setAnchor] = useState(format(new Date(), "yyyy-MM-dd"));

  const range = useMemo(() => periodRange(period, new Date(anchor)), [period, anchor]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["ops-reports", "LAB", plantKey, range.from, range.to, category],
    queryFn: () => fetchReports({ section: "LAB", plantKey, from: range.from, to: range.to, category }),
  });

  const s = summarize(rows);

  const approve = async (id: string) => {
    await setReportStatus(id, "approved", true);
    await qc.invalidateQueries({ queryKey: ["ops-reports"] });
    toast({ title: "تم اعتماد تقرير المعمل" });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("rounded-xl border p-3", plant.ring, plant.chip)}>
            {plantKey === "AMMONIA" ? <FlaskConical className="h-6 w-6" /> : <TestTubes className="h-6 w-6" />}
          </span>
          <div>
            <h1 className={cn("text-2xl font-bold neon-text", plant.accent)}>{lab.name}</h1>
            <p className="text-xs text-muted-foreground">{lab.nameEn} — تقارير مشرف المعمل (يومي / أسبوعي / شهري)</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/lab-reports"><ArrowRight className="h-4 w-4" /> إدارة المعمل</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/lab">العينات والنتائج</Link>
          </Button>
          <ReportBuilder plantKey={plantKey} section="LAB" />
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <MetricCard label="إجمالي السجلات" value={s.total} loading={isLoading} />
        <MetricCard label={CATEGORY_LABEL.routine} value={s.routine} tone="ok" loading={isLoading} />
        <MetricCard label={CATEGORY_LABEL.non_routine} value={s.nonRoutine} tone="danger" loading={isLoading} />
        <MetricCard label="عالي / حرج" value={s.critical} tone="warn" loading={isLoading} />
        <MetricCard label="بانتظار الاعتماد" value={s.pending} loading={isLoading} />
      </section>

      <section className="glass-card mb-4 flex flex-wrap items-end gap-3 rounded-xl p-4">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
          <TabsList>
            <TabsTrigger value="daily">يومي</TabsTrigger>
            <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
            <TabsTrigger value="monthly">شهري</TabsTrigger>
          </TabsList>
        </Tabs>

        <Input dir="ltr" type="date" value={anchor} onChange={(e) => setAnchor(e.target.value)} className="w-40" />

        <Select value={category} onValueChange={(v) => setCategory(v as WorkCategory | "ALL")}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الأعمال</SelectItem>
            <SelectItem value="routine">{CATEGORY_LABEL.routine}</SelectItem>
            <SelectItem value="non_routine">{CATEGORY_LABEL.non_routine}</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground" dir="ltr">{range.from} → {range.to}</span>

        <div className="ms-auto flex flex-wrap items-center gap-2">
          <ReportAiSummary
            rows={rows}
            section="LAB"
            plantName={lab.name}
            periodLabel={`LAB ${PERIOD_LABEL[period]}`}
            from={range.from}
            to={range.to}
          />
          <Button
            variant="secondary"
            className="gap-2"
            disabled={!rows.length}
            onClick={() => exportReportsPdf({ rows, plantKey, from: range.from, to: range.to, periodLabel: `LAB ${PERIOD_LABEL[period]}` })}
          >
            <FileDown className="h-4 w-4" /> تصدير PDF
          </Button>
        </div>
      </section>


      <ReportFeed
        rows={rows}
        loading={isLoading}
        onApprove={(r) => approve(r.id)}
        emptyMessage={
          category === "non_routine"
            ? "لا توجد أعمال غير روتينية في المعمل خلال هذه الفترة."
            : "لا توجد تقارير معمل لهذه الفترة — ابدأ بإنشاء تقرير معمل."
        }
      />
    </div>
  );
}
