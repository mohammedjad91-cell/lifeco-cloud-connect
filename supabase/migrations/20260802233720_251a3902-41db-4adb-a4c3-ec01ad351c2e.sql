ALTER TABLE public.operational_reports
  ADD COLUMN IF NOT EXISTS section text NOT NULL DEFAULT 'OPS';

ALTER TABLE public.operational_reports
  DROP CONSTRAINT IF EXISTS operational_reports_section_check;

ALTER TABLE public.operational_reports
  ADD CONSTRAINT operational_reports_section_check CHECK (section IN ('OPS','LAB'));

CREATE INDEX IF NOT EXISTS operational_reports_section_plant_date_idx
  ON public.operational_reports (section, plant_key, report_date DESC);