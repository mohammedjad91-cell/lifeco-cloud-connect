CREATE TYPE public.lifeco_form_type AS ENUM ('work_permit', 'electrical_permit', 'work_request');
CREATE TYPE public.lifeco_form_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'closed', 'cancelled');

CREATE TABLE public.lifeco_digital_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_type public.lifeco_form_type NOT NULL,
    form_number TEXT UNIQUE NOT NULL,
    status public.lifeco_form_status NOT NULL DEFAULT 'draft',
    department_key TEXT NOT NULL,
    plant_code TEXT NOT NULL,
    equipment_id UUID REFERENCES public.equipment_assets(id) ON DELETE SET NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    signatures JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by_name TEXT NOT NULL,
    created_by_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lifeco_digital_forms TO authenticated;
GRANT ALL ON public.lifeco_digital_forms TO service_role;
GRANT SELECT ON public.lifeco_digital_forms TO anon;

ALTER TABLE public.lifeco_digital_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read on lifeco_digital_forms" ON public.lifeco_digital_forms FOR SELECT USING (true);
CREATE POLICY "Allow all insert on lifeco_digital_forms" ON public.lifeco_digital_forms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on lifeco_digital_forms" ON public.lifeco_digital_forms FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on lifeco_digital_forms" ON public.lifeco_digital_forms FOR DELETE USING (true);

CREATE TABLE public.lifeco_form_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.lifeco_digital_forms(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.lifeco_form_attachments TO authenticated;
GRANT ALL ON public.lifeco_form_attachments TO service_role;
GRANT SELECT ON public.lifeco_form_attachments TO anon;

ALTER TABLE public.lifeco_form_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read on lifeco_form_attachments" ON public.lifeco_form_attachments FOR SELECT USING (true);
CREATE POLICY "Allow all insert on lifeco_form_attachments" ON public.lifeco_form_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all delete on lifeco_form_attachments" ON public.lifeco_form_attachments FOR DELETE USING (true);

CREATE INDEX idx_lifeco_forms_dept_plant ON public.lifeco_digital_forms(department_key, plant_code);
CREATE INDEX idx_lifeco_forms_equipment ON public.lifeco_digital_forms(equipment_id);
CREATE INDEX idx_lifeco_forms_status ON public.lifeco_digital_forms(status);