CREATE TABLE public.lab_samples (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id text UNIQUE NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    time time NOT NULL DEFAULT CURRENT_TIME,
    laboratory text NOT NULL,
    plant_source text NOT NULL,
    sampling_point text,
    sample_type text NOT NULL,
    analysis_required text[],
    status text NOT NULL DEFAULT 'Pending Sampling',
    operator_analyst text NOT NULL,
    employee_id text,
    remarks text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.lab_analysis_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id uuid REFERENCES public.lab_samples(id) ON DELETE CASCADE,
    parameter text NOT NULL,
    result text,
    unit text,
    method text,
    spec_limit text,
    status text DEFAULT 'Pending Verification',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.lab_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_analysis_results ENABLE ROW LEVEL SECURITY;

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_samples TO authenticated;
GRANT ALL ON public.lab_samples TO service_role;
GRANT SELECT ON public.lab_samples TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_analysis_results TO authenticated;
GRANT ALL ON public.lab_analysis_results TO service_role;
GRANT SELECT ON public.lab_analysis_results TO anon;

-- POLICIES
CREATE POLICY "Allow all authenticated for lab_samples" ON public.lab_samples FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read for lab_samples" ON public.lab_samples FOR SELECT TO anon USING (true);

CREATE POLICY "Allow all authenticated for lab_analysis_results" ON public.lab_analysis_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read for lab_analysis_results" ON public.lab_analysis_results FOR SELECT TO anon USING (true);
