CREATE TABLE IF NOT EXISTS public.maintenance_work_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number text UNIQUE NOT NULL,
    department_key text NOT NULL,
    plant_code text NOT NULL,
    area_name text,
    equipment_id uuid REFERENCES public.equipment_assets(id),
    equipment_tag text,
    permit_id uuid REFERENCES public.lifeco_digital_forms(id),
    permit_number text,
    description text NOT NULL,
    requested_by text NOT NULL,
    request_date timestamp with time zone DEFAULT now(),
    priority text DEFAULT 'NORMAL',
    status text DEFAULT 'PENDING',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_work_requests TO authenticated;
GRANT ALL ON public.maintenance_work_requests TO service_role;
ALTER TABLE public.maintenance_work_requests ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'maintenance_work_requests' 
        AND policyname = 'Allow authenticated full access to maintenance_work_requests'
    ) THEN
        CREATE POLICY "Allow authenticated full access to maintenance_work_requests"
        ON public.maintenance_work_requests
        FOR ALL
        TO authenticated
        USING (true);
    END IF;
END $$;
