import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, Beaker, FileDown, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReportBuilder from "@/components/ops/ReportBuilder";
import ReportFeed from "@/components/ops/ReportFeed";
import MetricCard from "@/components/ops/MetricCard";
import ReportAiSummary from "@/components/ops/ReportAiSummary";

import { useToast } from "@/hooks/use-toast";
import { exportReportsPdf } from "@/lib/ops-report-pdf";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABEL,
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

export default function PlantHub({ plantKey }: { plantKey: PlantKey }) {
  const plant = PLANTS[plantKey];
  const { toast } = useToast();
  const qc = useQueryClient();

  const [period, setPeriod] = useState<PeriodType>("daily");
  const [category, setCategory] = useState<WorkCategory | "ALL">("ALL");
  const [anchor, setAnchor] = useState(format(new Date(), "yyyy-MM-dd"));

  const range = useMemo(() => periodRange(period, new Date(anchor)), [period, anchor]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["ops-reports", plantKey, range.from, range.to, category],
    queryFn: () => fetchReports({ plantKey, from: range.from, to: range.to, category }),
  });

  const s = summarize(rows);

  const approve = async (id: string) => {
    await setReportStatus(id, "approved", true);
    await qc.invalidateQueries({ queryKey: ["ops-reports"] });
    toast({ title: "تم اعتماد التقرير" });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("rounded-xl border p-3", plant.ring, plant.chip)}>
            {plantKey === "AMMONIA" ? <Flame className="h-6 w-6" /> : <Beaker className="h-6 w-6" />}
          </span>
          <div>
            <h1 className={cn("text-2xl font-bold neon-text", plant.accent)}>{plant.name}</h1>
            <p className="text-xs text-muted-foreground">{plant.nameEn} — مركز التشغيل وتقارير المشرفين</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/overview"><ArrowRight className="h-4 w-4" /> النظرة العامة</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/reports">مركز التقارير</Link>
          </Button>
          <ReportBuilder plantKey={plantKey} />
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
            section="OPS"
            plantKey={plantKey}

            plantName={PLANTS[plantKey].name}
            periodLabel={PERIOD_LABEL[period]}
            from={range.from}
            to={range.to}
          />
          <Button
            variant="secondary"
            className="gap-2"
            disabled={!rows.length}
            onClick={() => exportReportsPdf({ rows, plantKey, from: range.from, to: range.to, periodLabel: PERIOD_LABEL[period] })}
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
            ? "لا توجد أعمال غير روتينية مسجلة في هذه الفترة."
            : "لا توجد تقارير مسجلة لهذه الفترة — ابدأ بإنشاء تقرير وردية."
        }
      />
    </div>
  );
}
