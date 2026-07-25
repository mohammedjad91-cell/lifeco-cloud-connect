import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DeptStats {
  plants: number;
  equipment: number;
  activeUsers: number;
  openTasks: number;
  status: "green" | "amber" | "red";
}

const EMPTY: DeptStats = { plants: 0, equipment: 0, activeUsers: 0, openTasks: 0, status: "green" };

/**
 * Loads counts once and buckets them by department.
 * Silent fallback to zeroes if tables are empty / unauthenticated.
 */
export function useHomeStats(deptIds: string[]) {
  const [stats, setStats] = useState<Record<string, DeptStats>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const base: Record<string, DeptStats> = {};
      deptIds.forEach((d) => (base[d] = { ...EMPTY }));

      try {
        const [{ data: plants }, { data: equip }, { data: reqs }, { data: fops }] = await Promise.all([
          supabase.from("plants").select("id, department_key"),
          supabase.from("equipment").select("id, area_id, areas!inner(plant_id, plants!inner(department_key))"),
          supabase.from("maintenance_requests").select("id, status, equipment_id, equipment:equipment_id(area_id, areas!inner(plant_id, plants!inner(department_key)))"),
          supabase.from("field_ops_logs").select("employee_id, department, created_at").gte("created_at", new Date(Date.now() - 86400_000).toISOString()),
        ]);

        (plants ?? []).forEach((p: any) => {
          const d = p.department_key?.toUpperCase();
          if (d && base[d]) base[d].plants += 1;
        });

        (equip ?? []).forEach((e: any) => {
          const d = e.areas?.plants?.department_key?.toUpperCase();
          if (d && base[d]) base[d].equipment += 1;
        });

        (reqs ?? []).forEach((r: any) => {
          if (r.status === "closed" || r.status === "completed") return;
          const d = r.equipment?.areas?.plants?.department_key?.toUpperCase();
          if (d && base[d]) base[d].openTasks += 1;
        });

        const usersByDept: Record<string, Set<string>> = {};
        (fops ?? []).forEach((f: any) => {
          const d = String(f.department || "").toUpperCase();
          if (!d || !base[d]) return;
          usersByDept[d] = usersByDept[d] || new Set();
          if (f.employee_id) usersByDept[d].add(f.employee_id);
        });
        Object.entries(usersByDept).forEach(([d, set]) => {
          if (base[d]) base[d].activeUsers = set.size;
        });

        Object.values(base).forEach((s) => {
          s.status = s.openTasks > 5 ? "red" : s.openTasks > 0 ? "amber" : "green";
        });
      } catch {
        /* offline / RLS — keep zeroes */
      }

      if (alive) setStats(base);
    })();
    return () => { alive = false; };
  }, [deptIds.join(",")]);

  return stats;
}
