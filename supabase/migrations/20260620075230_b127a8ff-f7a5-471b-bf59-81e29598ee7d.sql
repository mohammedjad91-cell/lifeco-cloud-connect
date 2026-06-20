
-- Drop permissive policies
DROP POLICY IF EXISTS "Allow all insert field_ops_logs" ON public.field_ops_logs;
DROP POLICY IF EXISTS "Allow all read field_ops_logs" ON public.field_ops_logs;
DROP POLICY IF EXISTS "Allow all update field_ops_logs" ON public.field_ops_logs;
DROP POLICY IF EXISTS "Allow all delete lab_results" ON public.lab_results;
DROP POLICY IF EXISTS "Allow all insert lab_results" ON public.lab_results;
DROP POLICY IF EXISTS "Allow all read lab_results" ON public.lab_results;
DROP POLICY IF EXISTS "Allow all update lab_results" ON public.lab_results;
DROP POLICY IF EXISTS "Allow all delete locked_dates" ON public.locked_dates;
DROP POLICY IF EXISTS "Allow all insert locked_dates" ON public.locked_dates;
DROP POLICY IF EXISTS "Allow all read locked_dates" ON public.locked_dates;
DROP POLICY IF EXISTS "Allow all delete operations_logs" ON public.operations_logs;
DROP POLICY IF EXISTS "Allow all insert operations_logs" ON public.operations_logs;
DROP POLICY IF EXISTS "Allow all read operations_logs" ON public.operations_logs;
DROP POLICY IF EXISTS "Allow all update operations_logs" ON public.operations_logs;
DROP POLICY IF EXISTS "Allow all insert activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow all read activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow all read department_pins" ON public.department_pins;
DROP POLICY IF EXISTS "Allow all update department_pins" ON public.department_pins;
DROP POLICY IF EXISTS "Allow all delete samples" ON public.samples;
DROP POLICY IF EXISTS "Allow all insert samples" ON public.samples;
DROP POLICY IF EXISTS "Allow all read samples" ON public.samples;
DROP POLICY IF EXISTS "Allow all update samples" ON public.samples;
DROP POLICY IF EXISTS "Allow all delete dynamic_fields" ON public.dynamic_fields;
DROP POLICY IF EXISTS "Allow all insert dynamic_fields" ON public.dynamic_fields;
DROP POLICY IF EXISTS "Allow all read dynamic_fields" ON public.dynamic_fields;
DROP POLICY IF EXISTS "Allow all update dynamic_fields" ON public.dynamic_fields;
DROP POLICY IF EXISTS "Allow all insert maintenance_records" ON public.maintenance_records;
DROP POLICY IF EXISTS "Allow all read maintenance_records" ON public.maintenance_records;
DROP POLICY IF EXISTS "Allow all delete equipment_assets" ON public.equipment_assets;
DROP POLICY IF EXISTS "Allow all insert equipment_assets" ON public.equipment_assets;
DROP POLICY IF EXISTS "Allow all read equipment_assets" ON public.equipment_assets;
DROP POLICY IF EXISTS "Allow all update equipment_assets" ON public.equipment_assets;

-- Revoke anon, grant authenticated + service_role
REVOKE ALL ON public.field_ops_logs, public.lab_results, public.locked_dates, public.operations_logs,
              public.activity_logs, public.department_pins, public.samples, public.dynamic_fields,
              public.maintenance_records, public.equipment_assets FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.field_ops_logs, public.lab_results, public.locked_dates, public.operations_logs,
  public.activity_logs, public.department_pins, public.samples, public.dynamic_fields,
  public.maintenance_records, public.equipment_assets
  TO authenticated;

GRANT ALL ON
  public.field_ops_logs, public.lab_results, public.locked_dates, public.operations_logs,
  public.activity_logs, public.department_pins, public.samples, public.dynamic_fields,
  public.maintenance_records, public.equipment_assets
  TO service_role;

-- Authenticated-only policies
CREATE POLICY "Authenticated full access field_ops_logs" ON public.field_ops_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access lab_results" ON public.lab_results
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read locked_dates" ON public.locked_dates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert locked_dates" ON public.locked_dates
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated delete locked_dates" ON public.locked_dates
  FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated full access operations_logs" ON public.operations_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read activity_logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert activity_logs" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated read department_pins" ON public.department_pins
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated update department_pins" ON public.department_pins
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access samples" ON public.samples
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access dynamic_fields" ON public.dynamic_fields
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read maintenance_records" ON public.maintenance_records
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert maintenance_records" ON public.maintenance_records
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated full access equipment_assets" ON public.equipment_assets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage: lock down field-ops-photos bucket policies
DROP POLICY IF EXISTS "Anyone upload field-ops-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read field-ops-photos" ON storage.objects;

CREATE POLICY "Authenticated read field-ops-photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'field-ops-photos');
CREATE POLICY "Authenticated upload field-ops-photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'field-ops-photos');
CREATE POLICY "Authenticated update field-ops-photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'field-ops-photos')
  WITH CHECK (bucket_id = 'field-ops-photos');
CREATE POLICY "Authenticated delete field-ops-photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'field-ops-photos');
