
-- Revert auth-only access: restore anon (public) access to operator tables and storage
DROP POLICY IF EXISTS "Authenticated full access field_ops_logs" ON public.field_ops_logs;
DROP POLICY IF EXISTS "Authenticated full access lab_results" ON public.lab_results;
DROP POLICY IF EXISTS "Authenticated read locked_dates" ON public.locked_dates;
DROP POLICY IF EXISTS "Authenticated insert locked_dates" ON public.locked_dates;
DROP POLICY IF EXISTS "Authenticated delete locked_dates" ON public.locked_dates;
DROP POLICY IF EXISTS "Authenticated full access operations_logs" ON public.operations_logs;
DROP POLICY IF EXISTS "Authenticated read activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated insert activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated read department_pins" ON public.department_pins;
DROP POLICY IF EXISTS "Authenticated update department_pins" ON public.department_pins;
DROP POLICY IF EXISTS "Authenticated full access samples" ON public.samples;
DROP POLICY IF EXISTS "Authenticated full access dynamic_fields" ON public.dynamic_fields;
DROP POLICY IF EXISTS "Authenticated read maintenance_records" ON public.maintenance_records;
DROP POLICY IF EXISTS "Authenticated insert maintenance_records" ON public.maintenance_records;
DROP POLICY IF EXISTS "Authenticated full access equipment_assets" ON public.equipment_assets;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.field_ops_logs, public.lab_results, public.locked_dates, public.operations_logs,
  public.activity_logs, public.department_pins, public.samples, public.dynamic_fields,
  public.maintenance_records, public.equipment_assets
  TO anon, authenticated;

CREATE POLICY "Allow all insert field_ops_logs" ON public.field_ops_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all read field_ops_logs" ON public.field_ops_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all update field_ops_logs" ON public.field_ops_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete lab_results" ON public.lab_results FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert lab_results" ON public.lab_results FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all read lab_results" ON public.lab_results FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all update lab_results" ON public.lab_results FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete locked_dates" ON public.locked_dates FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert locked_dates" ON public.locked_dates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all read locked_dates" ON public.locked_dates FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow all delete operations_logs" ON public.operations_logs FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert operations_logs" ON public.operations_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all read operations_logs" ON public.operations_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all update operations_logs" ON public.operations_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all insert activity_logs" ON public.activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all read activity_logs" ON public.activity_logs FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow all read department_pins" ON public.department_pins FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all update department_pins" ON public.department_pins FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete samples" ON public.samples FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert samples" ON public.samples FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all read samples" ON public.samples FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all update samples" ON public.samples FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete dynamic_fields" ON public.dynamic_fields FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert dynamic_fields" ON public.dynamic_fields FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all read dynamic_fields" ON public.dynamic_fields FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all update dynamic_fields" ON public.dynamic_fields FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all insert maintenance_records" ON public.maintenance_records FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all read maintenance_records" ON public.maintenance_records FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow all delete equipment_assets" ON public.equipment_assets FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert equipment_assets" ON public.equipment_assets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all read equipment_assets" ON public.equipment_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all update equipment_assets" ON public.equipment_assets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Storage: restore public access to field-ops-photos
DROP POLICY IF EXISTS "Authenticated read field-ops-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload field-ops-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update field-ops-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete field-ops-photos" ON storage.objects;

CREATE POLICY "Anyone upload field-ops-photos"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'field-ops-photos');
CREATE POLICY "Public read field-ops-photos"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'field-ops-photos');
