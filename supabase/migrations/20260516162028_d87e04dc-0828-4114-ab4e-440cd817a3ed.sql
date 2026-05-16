
-- Field ops logs table (if missing) with dynamic_data + photo_url
CREATE TABLE IF NOT EXISTS public.field_ops_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department text NOT NULL,
  equipment_tag text NOT NULL,
  employee_id text,
  technician_name text,
  running_hours numeric,
  discharge_pressure numeric,
  temperature numeric,
  dynamic_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  photo_url text,
  notes text,
  recorded_by text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.field_ops_logs ADD COLUMN IF NOT EXISTS dynamic_data jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.field_ops_logs ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.field_ops_logs ADD COLUMN IF NOT EXISTS recorded_by text;
ALTER TABLE public.field_ops_logs ADD COLUMN IF NOT EXISTS technician_name text;

ALTER TABLE public.field_ops_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all read field_ops_logs" ON public.field_ops_logs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow all insert field_ops_logs" ON public.field_ops_logs FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow all update field_ops_logs" ON public.field_ops_logs FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Storage bucket for field ops photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('field-ops-photos', 'field-ops-photos', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Public read field-ops-photos" ON storage.objects FOR SELECT
    USING (bucket_id = 'field-ops-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone upload field-ops-photos" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'field-ops-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
