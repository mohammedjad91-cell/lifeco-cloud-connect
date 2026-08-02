import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string;
  hint?: string;
  loading?: boolean;
  tone?: "default" | "danger" | "ok" | "warn";
}

const TONE: Record<string, string> = {
  default: "text-foreground",
  danger: "text-red-300",
  ok: "text-emerald-300",
  warn: "text-amber-300",
};

export default function MetricCard({ label, value, hint, loading, tone = "default" }: Props) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className={cn("mt-1 text-3xl font-bold tabular-nums", TONE[tone])}>{value}</p>
      )}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
