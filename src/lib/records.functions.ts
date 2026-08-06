import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getRecords = createServerFn({ method: "GET" })
  .handler(async () => {
    // @ts-ignore - Dynamic table access before type generation
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  });

export const updateRecord = createServerFn({ method: "POST" })
  .inputValidator((data: any) => z.object({
    id: z.string(),
    updates: z.record(z.any()),
    auditInfo: z.object({
      action: z.string(),
      changes: z.any()
    })
  }).parse(data))
  .handler(async ({ data }) => {
    const { id, updates, auditInfo } = data;
    
    // @ts-ignore
    const { error: updateError } = await supabase
      .from("records")
      .update(updates)
      .eq("id", id);
      
    if (updateError) throw new Error(updateError.message);
    
    // @ts-ignore
    const { error: auditError } = await supabase
      .from("audit_logs")
      .insert({
        record_id: id,
        action: auditInfo.action,
        changes: auditInfo.changes
      });
      
    if (auditError) console.error("Audit log failed:", auditError);
    
    return { success: true };
  });

export const getAuditLogs = createServerFn({ method: "GET" })
  .inputValidator((data: any) => z.object({ recordId: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    // @ts-ignore
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("timestamp", { ascending: false });
    
    if (data.recordId) {
      // @ts-ignore
      query = query.eq("record_id", data.recordId);
    }
    
    const { data: logs, error } = await query;
    if (error) throw new Error(error.message);
    return logs;
  });
