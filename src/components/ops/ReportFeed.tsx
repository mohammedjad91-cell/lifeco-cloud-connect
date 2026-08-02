import { format } from "date-fns";
import { CalendarDays, ClipboardList, PenLine, ShieldAlert, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABEL,
  PERIOD_LABEL,
  PLANTS,
  SEVERITY_CLASS,
  SEVERITY_LABEL,
  SHIFT_LABEL,
  STATUS_LABEL,
  type OperationalReport,
} from "@/lib/ops-reports";

interface Props {
  rows: OperationalReport[];
  loading?: boolean;
  emptyMessage?: string;
  showPlant?: boolean;
  onApprove?: (r: OperationalReport) => void;
}

export default function ReportFeed({ rows, loading, emptyMessage, showPlant, onApprove }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="glass-card rounded-xl p-10 text-center">
        <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {emptyMessage ?? "لا توجد تقارير مسجلة لهذه الفترة أو التصنيف."}
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-3 border-s border-border/60 ps-4">
      {rows.map((r) => {
        const nonRoutine = r.work_category === "non_routine";
        return (
          <li key={r.id} className="relative">
            <span
              className={cn(
                "absolute -start-[21px] top-5 h-3 w-3 rounded-full border-2",
                nonRoutine ? "border-red-400 bg-red-500" : "border-emerald-400 bg-emerald-500",
              )}
            />
            <article
              className={cn(
                "glass-card rounded-xl p-4 transition-all",
                nonRoutine && "border-red-400/40 shadow-[0_0_28px_-12px_hsl(0_80%_60%/0.8)]",
              )}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {showPlant && (
                  <Badge variant="outline" className={PLANTS[r.plant_key].chip}>
                    {PLANTS[r.plant_key].name}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1",
                    nonRoutine
                      ? "border-red-400/60 bg-red-500/20 text-red-200"
                      : "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
                  )}
                >
                  {nonRoutine && <ShieldAlert className="h-3 w-3" />}
                  {CATEGORY_LABEL[r.work_category]}
                </Badge>
                <Badge variant="outline" className={SEVERITY_CLASS[r.severity]}>{SEVERITY_LABEL[r.severity]}</Badge>
                <Badge variant="secondary">{PERIOD_LABEL[r.period_type]}</Badge>
                <Badge variant="secondary">{SHIFT_LABEL[r.shift]}</Badge>
                <Badge variant="outline">{STATUS_LABEL[r.status]}</Badge>
                {r.plant_code && <Badge variant="outline" dir="ltr">{r.plant_code}</Badge>}
              </div>

              <h4 className="text-base font-semibold text-foreground">{r.title}</h4>

              {r.description && (
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
                  {r.description}
                </pre>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {format(new Date(r.report_date), "dd MMM yyyy")}
                </span>
                {r.equipment_tag && (
                  <span className="flex items-center gap-1" dir="ltr">
                    <PenLine className="h-3.5 w-3.5" /> {r.equipment_tag}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <UserCheck className={cn("h-3.5 w-3.5", r.signed && "text-emerald-400")} />
                  {r.supervisor_name ?? "—"} {r.signed ? "(موقّع)" : "(بدون توقيع)"}
                </span>
                {onApprove && r.status !== "approved" && (
                  <Button size="sm" variant="outline" className="ms-auto h-7" onClick={() => onApprove(r)}>
                    اعتماد
                  </Button>
                )}
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
