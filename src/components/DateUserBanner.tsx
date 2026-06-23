import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, User } from "lucide-react";
import { getOperator } from "@/lib/session";

export default function DateUserBanner() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const op = getOperator();

  return (
    <div className="glass-card px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-primary" />
        <span className="font-medium text-foreground">
          {format(now, "EEEE, dd MMM yyyy")}
        </span>
        <span className="text-muted-foreground font-mono">{format(now, "HH:mm:ss")}</span>
      </div>
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-primary" />
        <span className="text-foreground">
          {op ? <>Operator: <span className="font-semibold">{op.name}</span> <span className="text-muted-foreground">({op.employeeId})</span></> : <span className="text-muted-foreground">No operator identified</span>}
        </span>
      </div>
    </div>
  );
}
