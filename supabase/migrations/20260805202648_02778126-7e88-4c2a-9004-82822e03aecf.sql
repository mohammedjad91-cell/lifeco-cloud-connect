CREATE TABLE public.general_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.general_information TO authenticated;
GRANT SELECT ON public.general_information TO anon;
GRANT ALL ON public.general_information TO service_role;

ALTER TABLE public.general_information ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to general_information"
ON public.general_information FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to manage general_information"
ON public.general_information FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Seed some initial data
INSERT INTO public.general_information (title, content, category, icon)
VALUES 
('LIFECO Overview', 'Libyan Norwegian Fertilizer Company (LIFECO) is a joint venture in the petrochemical industry.', 'Corporate', 'building'),
('Safety First', 'Always wear appropriate PPE (Personal Protective Equipment) when entering production areas.', 'Safety', 'shield'),
('Emergency Contacts', 'Control Room: 101, Medical: 102, Fire: 103', 'Emergency', 'phone'),
('Plant Status', 'Current production capacity is at 95%. Ammonia 1 is undergoing routine maintenance.', 'Operations', 'activity');