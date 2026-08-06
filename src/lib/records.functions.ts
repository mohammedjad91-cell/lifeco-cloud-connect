import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getRecords = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  });

export const updateRecord = createServerFn({ method: "POST" })
  .input(z.object({
    id: z.string(),
    updates: z.record(z.any()),
    auditInfo: z.object({
      action: z.string(),
      changes: z.any()
    })
  }))
  .handler(async ({ data }) => {
    const { id, updates, auditInfo } = data;
    
    const { error: updateError } = await supabase
      .from("records")
      .update(updates)
      .eq("id", id);
      
    if (updateError) throw new Error(updateError.message);
    
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
  .input(z.object({ recordId: z.string().optional() }))
  .handler(async ({ data }) => {
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("timestamp", { ascending: false });
    
    if (data.recordId) {
      query = query.eq("record_id", data.recordId);
    }
    
    const { data: logs, error } = await query;
    if (error) throw new Error(error.message);
    return logs;
  });
