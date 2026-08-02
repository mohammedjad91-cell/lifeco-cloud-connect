import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { ArrowRight, FlaskConical, TestTubes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABEL,
  LAB_TITLES,
  PLANTS,
  fetchReports,
  summarize,
  type PlantKey,
} from "@/lib/ops-reports";
import MetricCard from "@/components/ops/MetricCard";

const from = () => format(subDays(new Date(), 29), "yyyy-MM-dd");
const to = () => format(new Date(), "yyyy-MM-dd");

function LabCard({ plantKey }: { plantKey: PlantKey }) {
  const plant = PLANTS[plantKey];
  const lab = LAB_TITLES[plantKey];
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["ops-reports", "LAB", plantKey, "30d"],
    queryFn: () => fetchReports({ section: "LAB", plantKey, from: from(), to: to() }),
  });
  const s = summarize(rows);

  return (
    <div className={cn("glass-card rounded-2xl border p-5", plant.ring)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("rounded-xl border p-2.5", plant.chip)}>
            {plantKey === "AMMONIA" ? <FlaskConical className="h-5 w-5" /> : <TestTubes className="h-5 w-5" />}
          </span>
          <div>
            <h2 className={cn("text-lg font-bold neon-text", plant.accent)}>{lab.name}</h2>
            <p className="text-[11px] text-muted-foreground">{lab.nameEn} — آخر 30 يومًا</p>
          </div>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link to={plantKey === "AMMONIA" ? "/lab-reports/ammonia" : "/lab-reports/urea"}>فتح تقارير المعمل</Link>
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <MetricCard label="السجلات" value={s.total} loading={isLoading} />
        <MetricCard label={CATEGORY_LABEL.routine} value={s.routine} tone="ok" loading={isLoading} />
        <MetricCard label={CATEGORY_LABEL.non_routine} value={s.nonRoutine} tone="danger" loading={isLoading} />
        <MetricCard label="عالي/حرج" value={s.critical} tone="warn" loading={isLoading} />
      </div>
    </div>
  );
}

export default function LabReportsOverview() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold neon-text">إدارة المعمل — تقارير المشرفين</h1>
          <p className="text-xs text-muted-foreground">معمل الأمونيا ومعمل اليوريا، مقسمة بين العمل الروتيني وغير الروتيني</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/lab">العينات والنتائج</Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/"><ArrowRight className="h-4 w-4" /> الشاشة الرئيسية</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <LabCard plantKey="AMMONIA" />
        <LabCard plantKey="UREA" />
      </section>
    </div>
  );
}
