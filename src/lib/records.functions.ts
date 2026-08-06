import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const SUPABASE_URL = process.env['SUPABASE_URL'] || process.env['VITE_SUPABASE_URL'] || '';
  const SUPABASE_KEY = process.env['SUPABASE_PUBLISHABLE_KEY'] || process.env['VITE_SUPABASE_PUBLISHABLE_KEY'] || '';
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

export const getRecords = createServerFn({ method: "GET" })
  .handler(async () => {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("records")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Supabase error in getRecords:", error);
      throw new Error(error.message);
    }
    return data || [];
  });

export const updateRecord = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    id: z.string(),
    updates: z.record(z.any()),
    auditInfo: z.object({
      action: z.string(),
      changes: z.any()
    })
  }).parse(data))
  .handler(async ({ data }: { data: any }) => {
    const sb = getSupabase();
    const { id, updates, auditInfo } = data;
    
    const { error: updateError } = await sb
      .from("records")
      .update(updates)
      .eq("id", id);
      
    if (updateError) throw new Error(updateError.message);
    
    const { error: auditError } = await sb
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
  .validator((data: unknown) => z.object({ recordId: z.string().optional() }).parse(data || {}))
  .handler(async ({ data }: { data: any }) => {
    const sb = getSupabase();
    let query = sb
      .from("audit_logs")
      .select("*")
      .order("timestamp", { ascending: false });
    
    if (data?.recordId) {
      query = query.eq("record_id", data.recordId);
    }
    
    const { data: logs, error } = await query;
    if (error) {
      console.error("Supabase error in getAuditLogs:", error);
      throw new Error(error.message);
    }
    return logs || [];
  });
