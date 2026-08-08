-- 1. Correct status of compressors to 'Pending Verification'
UPDATE public.equipment_assets 
SET status = 'Pending Verification'
WHERE tag IN ('60-1001A', '60-1001B', '60-1001C');

-- 2. Create Equipment Identity Cards table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.equipment_identity_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.equipment_assets(id) ON DELETE CASCADE,
    equipment_tag TEXT DEFAULT 'Pending Verification',
    equipment_name TEXT DEFAULT 'Pending Verification',
    equipment_type TEXT DEFAULT 'Pending Verification',
    service TEXT DEFAULT 'Pending Verification',
    manufacturer TEXT DEFAULT 'Pending Verification',
    model TEXT DEFAULT 'Pending Verification',
    capacity TEXT DEFAULT 'Pending Verification',
    suction_pressure TEXT DEFAULT 'Pending Verification',
    discharge_pressure TEXT DEFAULT 'Pending Verification',
    m1_temperature TEXT DEFAULT 'Pending Verification',
    m2_temperature TEXT DEFAULT 'Pending Verification',
    running_hours TEXT DEFAULT 'Pending Verification',
    operating_status TEXT DEFAULT 'Pending Verification',
    loading_unloading_status TEXT DEFAULT 'Pending Verification',
    alarm TEXT DEFAULT 'Pending Verification',
    trip TEXT DEFAULT 'Pending Verification',
    interlock TEXT DEFAULT 'Pending Verification',
    normal_operating_range TEXT DEFAULT 'Pending Verification',
    design_limits TEXT DEFAULT 'Pending Verification',
    upstream TEXT DEFAULT 'Pending Verification',
    downstream TEXT DEFAULT 'Pending Verification',
    description TEXT DEFAULT 'Pending Verification',
    safety_notes TEXT DEFAULT 'Pending Verification',
    maintenance_notes TEXT DEFAULT 'Pending Verification',
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- GRANT permissions
GRANT ALL ON public.equipment_identity_cards TO authenticated;
GRANT ALL ON public.equipment_identity_cards TO service_role;
GRANT SELECT ON public.equipment_identity_cards TO anon;

-- ENABLE RLS
ALTER TABLE public.equipment_identity_cards ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY
CREATE POLICY "Allow all to select identity cards" ON public.equipment_identity_cards FOR SELECT USING (true);
CREATE POLICY "Allow all to insert identity cards" ON public.equipment_identity_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update identity cards" ON public.equipment_identity_cards FOR UPDATE USING (true);
CREATE POLICY "Allow all to delete identity cards" ON public.equipment_identity_cards FOR DELETE USING (true);

-- 3. Add Identity Card for each compressor
INSERT INTO public.equipment_identity_cards (asset_id, equipment_tag, equipment_name, equipment_type)
SELECT id, tag, asset_name, 'Compressor'
FROM public.equipment_assets
WHERE tag IN ('60-1001A', '60-1001B', '60-1001C')
ON CONFLICT DO NOTHING;
