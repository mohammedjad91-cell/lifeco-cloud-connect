
CREATE TABLE IF NOT EXISTS public.work_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_no text UNIQUE NOT NULL DEFAULT ('PTW-' || to_char(now(),'YYMMDD') || '-' || substr(gen_random_uuid()::text,1,4)),
  permit_type text NOT NULL,
  plant_code text,
  location text,
  description text,
  hazards text,
  controls text,
  requested_by text,
  supervisor text,
  hse_officer text,
  status text NOT NULL DEFAULT 'pending_supervisor',
  supervisor_approved_at timestamptz,
  supervisor_approved_by text,
  hse_approved_at timestamptz,
  hse_approved_by text,
  rejected_reason text,
  start_at timestamptz,
  end_at timestamptz,
  workers_count int DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.work_permits TO authenticated, anon;
GRANT ALL ON public.work_permits TO service_role;
ALTER TABLE public.work_permits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open ptw" ON public.work_permits FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.safety_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_no text UNIQUE NOT NULL DEFAULT ('SI-' || to_char(now(),'YYMMDD') || '-' || substr(gen_random_uuid()::text,1,4)),
  entry_type text NOT NULL DEFAULT 'observation',
  severity text NOT NULL DEFAULT 'low',
  plant_code text,
  location text,
  description text,
  photo_url text,
  reported_by text,
  suggested_action text,
  corrective_action text,
  assigned_to text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.safety_incidents TO authenticated, anon;
GRANT ALL ON public.safety_incidents TO service_role;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open incidents" ON public.safety_incidents FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.ppe_issuances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  employee_name text NOT NULL,
  department text,
  ppe_type text NOT NULL,
  issued_at date NOT NULL DEFAULT current_date,
  replacement_due date,
  condition text DEFAULT 'good',
  status text DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.ppe_issuances TO authenticated, anon;
GRANT ALL ON public.ppe_issuances TO service_role;
ALTER TABLE public.ppe_issuances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open ppe" ON public.ppe_issuances FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.emergency_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_code text NOT NULL DEFAULT 'SITE',
  point_type text NOT NULL,
  label text NOT NULL,
  x_pct numeric NOT NULL,
  y_pct numeric NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.emergency_points TO authenticated, anon;
GRANT ALL ON public.emergency_points TO service_role;
ALTER TABLE public.emergency_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open emg" ON public.emergency_points FOR ALL USING (true) WITH CHECK (true);

-- Seed emergency map points for main site
INSERT INTO public.emergency_points (plant_code, point_type, label, x_pct, y_pct) VALUES
('SITE','exit','Main Gate Exit',5,50),
('SITE','exit','North Emergency Exit',50,5),
('SITE','exit','South Emergency Exit',50,95),
('SITE','assembly','Assembly Point A',20,30),
('SITE','assembly','Assembly Point B',80,70),
('SITE','extinguisher','Extinguisher AMM-1',30,40),
('SITE','extinguisher','Extinguisher UREA-1',60,60),
('SITE','extinguisher','Extinguisher N2 Plant',75,45),
('SITE','firstaid','First Aid Box A',25,55),
('SITE','firstaid','First Aid Box B',70,35),
('SITE','eyewash','Eye Wash Station Lab',45,75),
('SITE','alarm','Fire Alarm Central',50,50),
('SITE','phone','Emergency Phone Gate',10,55),
('SITE','phone','Emergency Phone Control Room',55,45);
