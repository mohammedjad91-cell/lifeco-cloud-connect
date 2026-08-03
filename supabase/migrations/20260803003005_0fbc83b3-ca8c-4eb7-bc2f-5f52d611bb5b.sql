CREATE TABLE public.lab_chemicals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  category text NOT NULL DEFAULT 'reagent',
  concentration text,
  manufacturer text,
  qty numeric NOT NULL DEFAULT 0,
  uom text NOT NULL DEFAULT 'L',
  location text,
  batch_no text,
  received_at date,
  expiry_date date,
  min_qty numeric NOT NULL DEFAULT 0,
  hazard text,
  notes text,
  recorded_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_chemicals TO anon, authenticated;
GRANT ALL ON public.lab_chemicals TO service_role;

ALTER TABLE public.lab_chemicals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read lab_chemicals" ON public.lab_chemicals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert lab_chemicals" ON public.lab_chemicals FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update lab_chemicals" ON public.lab_chemicals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete lab_chemicals" ON public.lab_chemicals FOR DELETE TO anon, authenticated USING (true);

CREATE TRIGGER update_lab_chemicals_updated_at BEFORE UPDATE ON public.lab_chemicals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();