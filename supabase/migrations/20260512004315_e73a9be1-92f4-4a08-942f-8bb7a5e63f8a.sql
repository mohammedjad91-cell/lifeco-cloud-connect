-- LIFECO PMS consolidated schema

-- operations_logs
CREATE TABLE public.operations_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department TEXT NOT NULL,
  unit_tag TEXT NOT NULL,
  value NUMERIC NOT NULL,
  employee_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.operations_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read operations_logs" ON public.operations_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert operations_logs" ON public.operations_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update operations_logs" ON public.operations_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete operations_logs" ON public.operations_logs FOR DELETE TO anon, authenticated USING (true);

-- lab_results
CREATE TABLE public.lab_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant TEXT NOT NULL,
  sample_type TEXT NOT NULL CHECK (sample_type IN ('daily','weekly')),
  parameter_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  technician_name TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read lab_results" ON public.lab_results FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert lab_results" ON public.lab_results FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update lab_results" ON public.lab_results FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete lab_results" ON public.lab_results FOR DELETE TO anon, authenticated USING (true);

-- locked_dates
CREATE TABLE public.locked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locked_date DATE NOT NULL UNIQUE,
  locked_by TEXT NOT NULL DEFAULT 'OPERATIONS',
  locked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.locked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read locked_dates" ON public.locked_dates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert locked_dates" ON public.locked_dates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all delete locked_dates" ON public.locked_dates FOR DELETE TO anon, authenticated USING (true);

-- activity_logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  department TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read activity_logs" ON public.activity_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert activity_logs" ON public.activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- department_pins
CREATE TABLE public.department_pins (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  pin TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.department_pins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read department_pins" ON public.department_pins FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all update department_pins" ON public.department_pins FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.department_pins (id, label, pin) VALUES
  ('AMM1', 'AMM 1', '1111'),
  ('AMM2', 'AMM 2', '2222'),
  ('NITROGEN', 'Nitrogen', '3333'),
  ('DEMIN1', 'DEMIN 1', '4444'),
  ('DEMIN2', 'DEMIN 2', '5555'),
  ('LABORATORY', 'Laboratory', '6666'),
  ('PLANTVIEW', 'Plant View', '7777'),
  ('OPERATIONS', 'Operations', '0000')
ON CONFLICT (id) DO NOTHING;

-- dynamic_fields
CREATE TABLE public.dynamic_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'number' CHECK (field_type IN ('number','text','dropdown')),
  dropdown_options JSONB DEFAULT '[]'::jsonb,
  department TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dynamic_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read dynamic_fields" ON public.dynamic_fields FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert dynamic_fields" ON public.dynamic_fields FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update dynamic_fields" ON public.dynamic_fields FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete dynamic_fields" ON public.dynamic_fields FOR DELETE TO anon, authenticated USING (true);

-- samples
CREATE TABLE public.samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_name TEXT NOT NULL,
  department TEXT NOT NULL,
  analysis_type TEXT NOT NULL DEFAULT 'routine',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','alert')),
  employee_id TEXT NOT NULL,
  technician_name TEXT NOT NULL,
  sample_date DATE NOT NULL DEFAULT CURRENT_DATE,
  dynamic_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read samples" ON public.samples FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert samples" ON public.samples FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update samples" ON public.samples FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete samples" ON public.samples FOR DELETE TO anon, authenticated USING (true);

-- realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.locked_dates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dynamic_fields;
ALTER PUBLICATION supabase_realtime ADD TABLE public.samples;