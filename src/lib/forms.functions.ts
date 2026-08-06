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
    form_type: z.enum(['work_permit', 'electrical_permit', 'work_request']),
    status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'closed', 'cancelled']),
    department_key: z.string(),
    plant_code: z.string(),
    equipment_id: z.string().uuid().optional().nullable(),
    form_data: z.record(z.any()),
    created_by_name: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    
    let result;
    if (id) {
      const { data: updated, error } = await supabase
        .from("lifeco_digital_forms")
        .update({
          ...rest,
          updated_at: new Date().toISOString(),
          submitted_at: data.status === 'submitted' ? new Date().toISOString() : undefined
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      result = updated;
    } else {
      // Generate form number
      const prefix = data.form_type === 'work_permit' ? 'WP' : data.form_type === 'electrical_permit' ? 'EP' : 'WR';
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from("lifeco_digital_forms")
        .select('*', { count: 'exact', head: true })
        .eq("form_type", data.form_type);
      
      const formNumber = `${prefix}-${year}-${((count || 0) + 1).toString().padStart(6, '0')}`;

      const { data: inserted, error } = await supabase
        .from("lifeco_digital_forms")
        .insert({
          ...rest,
          form_number: formNumber,
        })
        .select()
        .single();
      if (error) throw error;
      result = inserted;
    }

    // Auto-create Maintenance Work Request if it's a submitted Work Permit
    if (data.form_type === 'work_permit' && data.status === 'submitted') {
      const year = new Date().getFullYear();
      const { count: mntCount } = await supabase
        .from("maintenance_work_requests")
        .select('*', { count: 'exact', head: true });
      
      const mntNumber = `MNT-${year}-${((mntCount || 0) + 1).toString().padStart(6, '0')}`;
      
      await supabase.from("maintenance_work_requests").insert({
        request_number: mntNumber,
        department_key: data.department_key,
        plant_code: data.plant_code,
        equipment_id: data.equipment_id,
        permit_id: result.id,
        permit_number: result.form_number,
        description: data.form_data.general?.workDescription || "Maintenance requested via Work Permit",
        requested_by: data.created_by_name,
        priority: 'NORMAL',
        status: 'PENDING'
      });
    }

    return result;
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
