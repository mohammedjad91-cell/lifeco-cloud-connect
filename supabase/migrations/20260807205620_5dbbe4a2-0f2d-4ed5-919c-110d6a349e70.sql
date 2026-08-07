CREATE TABLE public.equipment_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_tag TEXT NOT NULL,
    metric_key TEXT NOT NULL,
    min_value NUMERIC,
    max_value NUMERIC,
    severity TEXT DEFAULT 'warning',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(equipment_tag, metric_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_thresholds TO authenticated;
GRANT ALL ON public.equipment_thresholds TO service_role;

ALTER TABLE public.equipment_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated select" ON public.equipment_thresholds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.equipment_thresholds FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.equipment_thresholds FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON public.equipment_thresholds FOR DELETE TO authenticated USING (true);