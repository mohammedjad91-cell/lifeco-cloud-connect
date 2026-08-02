import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { ArrowLeft, Beaker, ClipboardList, Flame, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import MetricCard from "@/components/ops/MetricCard";
import ReportFeed from "@/components/ops/ReportFeed";
import { cn } from "@/lib/utils";
import { PLANTS, fetchReports, summarize, type PlantKey } from "@/lib/ops-reports";

const from = () => format(subDays(new Date(), 29), "yyyy-MM-dd");
const to = () => format(new Date(), "yyyy-MM-dd");

function PlantPanel({ plantKey }: { plantKey: PlantKey }) {
  const p = PLANTS[plantKey];
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["ops-reports", plantKey, "overview-30d"],
    queryFn: () => fetchReports({ plantKey, from: from(), to: to() }),
  });
  const s = summarize(rows);

  return (
    <section className={cn("glass-card rounded-2xl border p-5", p.ring)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("rounded-xl border p-2.5", p.chip)}>
            {plantKey === "AMMONIA" ? <Flame className="h-5 w-5" /> : <Beaker className="h-5 w-5" />}
          </span>
          <div>
            <h2 className={cn("text-xl font-bold", p.accent)}>{p.name}</h2>
            <p className="text-[11px] text-muted-foreground">{p.nameEn} — آخر 30 يومًا</p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={plantKey === "AMMONIA" ? "/ammonia" : "/urea"}>فتح المركز</Link>
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="السجلات" value={s.total} loading={isLoading} />
        <MetricCard label="روتيني" value={s.routine} tone="ok" loading={isLoading} />
        <MetricCard label="غير روتيني" value={s.nonRoutine} tone="danger" loading={isLoading} />
        <MetricCard label="عالي/حرج" value={s.critical} tone="warn" loading={isLoading} />
      </div>

      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <ShieldAlert className="h-4 w-4" /> أحدث الأحداث غير الروتينية
      </h3>
      <ReportFeed
        rows={rows.filter((r) => r.work_category === "non_routine").slice(0, 3)}
        loading={isLoading}
        emptyMessage="لا توجد أحداث غير روتينية في آخر 30 يومًا."
      />
    </section>
  );
}

export default function OpsOverview() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold neon-text">لوحة النظرة العامة — الأمونيا واليوريا</h1>
          <p className="text-xs text-muted-foreground">حالة تشغيلية موحّدة وتقارير المشرفين لكل مصنع على حدة</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/reports"><ClipboardList className="h-4 w-4" /> مركز التقارير</Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> الشاشة الرئيسية</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-2">
        <PlantPanel plantKey="AMMONIA" />
        <PlantPanel plantKey="UREA" />
      </div>
    </div>
  );
}
