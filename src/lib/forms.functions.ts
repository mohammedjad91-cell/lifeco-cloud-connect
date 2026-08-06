import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getFormHistory = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    department_key: z.string().optional(),
    plant_code: z.string().optional(),
    status: z.string().optional(),
    form_type: z.string().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabase
      .from("lifeco_digital_forms")
      .select(`
        *,
        equipment:equipment_assets(asset_code, asset_name)
      `)
      .order("created_at", { ascending: false });

    if (data.department_key) query = query.eq("department_key", data.department_key);
    if (data.plant_code) query = query.eq("plant_code", data.plant_code);
    if (data.status) query = query.eq("status", data.status as any);
    if (data.form_type) query = query.eq("form_type", data.form_type as any);

    const { data: forms, error } = await query;
    if (error) throw error;
    return forms;
  });

export const saveForm = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    id: z.string().optional(),
    form_type: z.enum(['work_permit', 'electrical_permit', 'work_request', 'scaffolding_permit', 'safety_valve_permit']),
    status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'closed', 'cancelled']),
    department_key: z.string(),
    plant_code: z.string(),
    equipment_id: z.string().uuid().optional().nullable(),
    form_data: z.record(z.any()),
    created_by_name: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    
    if (id) {
      const { data: updated, error } = await supabase
        .from("lifeco_digital_forms")
        .update({
          ...rest,
          form_type: rest.form_type as any,
          status: rest.status as any,
          updated_at: new Date().toISOString(),
          submitted_at: data.status === 'submitted' ? new Date().toISOString() : undefined
        } as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    } else {
      // Generate form number
      const prefixMap: Record<string, string> = {
        'work_permit': 'WP',
        'electrical_permit': 'EP',
        'work_request': 'WR',
        'scaffolding_permit': 'SP',
        'safety_valve_permit': 'SV'
      };
      const prefix = prefixMap[data.form_type] || 'FRM';
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from("lifeco_digital_forms")
        .select('*', { count: 'exact', head: true })
        .eq("form_type", data.form_type);
      
      const formNumber = `${prefix}-${year}-${((count || 0) + 1).toString().padStart(4, '0')}`;

      const { data: inserted, error } = await supabase
        .from("lifeco_digital_forms")
        .insert({
          ...rest,
          form_number: formNumber,
        })
        .select()
        .single();
      if (error) throw error;
      return inserted;
    }
  });

export const getFormById = createServerFn({ method: "GET" })
  .inputValidator((data) => z.string().parse(data))
  .handler(async ({ data: id }) => {
    const { data: form, error } = await supabase
      .from("lifeco_digital_forms")
      .select(`
        *,
        equipment:equipment_assets(asset_code, asset_name),
        attachments:lifeco_form_attachments(*)
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return form;
  });
