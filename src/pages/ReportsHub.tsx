import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MetricCard from "@/components/ops/MetricCard";
import ReportFeed from "@/components/ops/ReportFeed";
import { useToast } from "@/hooks/use-toast";
import { exportReportsPdf } from "@/lib/ops-report-pdf";
import {
  CATEGORY_LABEL,
  PERIOD_LABEL,
  PLANTS,
  SHIFT_LABEL,
  fetchReports,
  periodRange,
  setReportStatus,
  summarize,
  type PeriodType,
  type PlantKey,
  type Shift,
  type WorkCategory,
} from "@/lib/ops-reports";

export default function ReportsHub() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [plantKey, setPlantKey] = useState<PlantKey | "ALL">("ALL");
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [category, setCategory] = useState<WorkCategory | "ALL">("ALL");
  const [shift, setShift] = useState<Shift | "ALL">("ALL");
  const [anchor, setAnchor] = useState(format(new Date(), "yyyy-MM-dd"));

  const range = useMemo(() => periodRange(period, new Date(anchor)), [period, anchor]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["ops-reports", "hub", plantKey, period, category, shift, range.from, range.to],
    queryFn: () => fetchReports({ plantKey, from: range.from, to: range.to, category, shift }),
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
        <div>
          <h1 className="text-2xl font-bold neon-text">مركز التقارير التشغيلية</h1>
          <p className="text-xs text-muted-foreground">تصفية حسب المصنع، الفترة، الوردية، وتصنيف العمل</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/ammonia">{PLANTS.AMMONIA.name}</Link></Button>
          <Button asChild variant="outline"><Link to="/urea">{PLANTS.UREA.name}</Link></Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/overview"><ArrowLeft className="h-4 w-4" /> النظرة العامة</Link>
          </Button>
        </div>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <MetricCard label="إجمالي السجلات" value={s.total} loading={isLoading} />
        <MetricCard label={CATEGORY_LABEL.routine} value={s.routine} tone="ok" loading={isLoading} />
        <MetricCard label={CATEGORY_LABEL.non_routine} value={s.nonRoutine} tone="danger" loading={isLoading} />
        <MetricCard label="عالي / حرج" value={s.critical} tone="warn" loading={isLoading} />
        <MetricCard label="معتمد" value={s.approved} loading={isLoading} />
      </section>

      <section className="glass-card mb-4 flex flex-wrap items-center gap-3 rounded-xl p-4">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
          <TabsList>
            <TabsTrigger value="daily">يومي</TabsTrigger>
            <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
            <TabsTrigger value="monthly">شهري</TabsTrigger>
          </TabsList>
        </Tabs>

        <Input dir="ltr" type="date" value={anchor} onChange={(e) => setAnchor(e.target.value)} className="w-40" />

        <Select value={plantKey} onValueChange={(v) => setPlantKey(v as PlantKey | "ALL")}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل المصانع</SelectItem>
            <SelectItem value="AMMONIA">{PLANTS.AMMONIA.name}</SelectItem>
            <SelectItem value="UREA">{PLANTS.UREA.name}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={(v) => setCategory(v as WorkCategory | "ALL")}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الأعمال</SelectItem>
            <SelectItem value="routine">{CATEGORY_LABEL.routine}</SelectItem>
            <SelectItem value="non_routine">{CATEGORY_LABEL.non_routine}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={shift} onValueChange={(v) => setShift(v as Shift | "ALL")}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الورديات</SelectItem>
            {(Object.keys(SHIFT_LABEL) as Shift[]).map((k) => (
              <SelectItem key={k} value={k}>{SHIFT_LABEL[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground" dir="ltr">{range.from} → {range.to}</span>

        <Button
          variant="secondary"
          className="ms-auto gap-2"
          disabled={!rows.length}
          onClick={() => exportReportsPdf({ rows, plantKey, from: range.from, to: range.to, periodLabel: PERIOD_LABEL[period] })}
        >
          <FileDown className="h-4 w-4" /> تصدير / طباعة PDF
        </Button>
      </section>

      <ReportFeed rows={rows} loading={isLoading} showPlant onApprove={(r) => approve(r.id)} />
    </div>
  );
}
