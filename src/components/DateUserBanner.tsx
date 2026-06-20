import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, User, LogOut } from "lucide-react";
import { getOperator, clearOperator } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function DateUserBanner() {
  const [now, setNow] = useState(new Date());
  const queryClient = useQueryClient();
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const op = getOperator();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    clearOperator();
    try { sessionStorage.removeItem("lifeco_dept"); } catch { /* noop */ }
    await supabase.auth.signOut();
  };

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
        <Button size="sm" variant="outline" onClick={handleSignOut} className="gap-1.5 h-7 ml-2">
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </Button>
      </div>
    </div>
  );
}
