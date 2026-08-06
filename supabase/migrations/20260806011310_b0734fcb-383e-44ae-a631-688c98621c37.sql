-- Create custom types
DO $$ BEGIN
    CREATE TYPE public.record_status AS ENUM ('active', 'pending', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.record_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create records table
CREATE TABLE IF NOT EXISTS public.records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status public.record_status DEFAULT 'active' NOT NULL,
    priority public.record_priority DEFAULT 'medium' NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES public.records(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    changes JSONB NOT NULL,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.records TO authenticated;
GRANT ALL ON public.records TO service_role;
GRANT SELECT ON public.records TO anon;

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
GRANT SELECT ON public.audit_logs TO anon;

-- Policies
CREATE POLICY "Users can read all records" ON public.records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert records" ON public.records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own records or if authenticated" ON public.records FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read all audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_records_updated_at
    BEFORE UPDATE ON public.records
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Seed some sample data
INSERT INTO public.records (title, category, status, priority, description, metadata)
VALUES 
('Nitrogen Plant Maintenance', 'Operations', 'active', 'high', 'Quarterly compressor service', '{"location": "Section A", "technician": "Eng. Mohamed"}'),
('Safety Valve Calibration', 'Safety', 'pending', 'critical', 'Annual calibration for SV-101', '{"valve_tag": "SV-101", "last_test": "2025-08-01"}'),
('Ammonia Storage Log', 'Logistics', 'active', 'medium', 'Daily storage volume tracking', '{"tank_id": "T-501", "current_level": "85%"}');