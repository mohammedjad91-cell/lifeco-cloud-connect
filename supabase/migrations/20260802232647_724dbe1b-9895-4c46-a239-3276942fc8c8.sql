CREATE TABLE public.operational_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_key text NOT NULL CHECK (plant_key IN ('AMMONIA','UREA')),
  plant_code text,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  shift text NOT NULL DEFAULT 'morning' CHECK (shift IN ('morning','evening','night')),
  period_type text NOT NULL DEFAULT 'daily' CHECK (period_type IN ('daily','weekly','monthly')),
  work_category text NOT NULL DEFAULT 'routine' CHECK (work_category IN ('routine','non_routine')),
  title text NOT NULL,
  description text,
  equipment_tag text,
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  supervisor_name text,
  signed boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.operational_reports TO anon;
GRANT SELECT, INSERT, UPDATE ON public.operational_reports TO authenticated;
GRANT ALL ON public.operational_reports TO service_role;

ALTER TABLE public.operational_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports are viewable by everyone"
  ON public.operational_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can create reports"
  ON public.operational_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reports"
  ON public.operational_reports FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX operational_reports_plant_date_idx
  ON public.operational_reports (plant_key, report_date DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_operational_reports_updated_at
  BEFORE UPDATE ON public.operational_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();