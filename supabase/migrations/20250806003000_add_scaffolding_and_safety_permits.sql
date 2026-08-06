-- Add Scaffolding and Safety Valve permit types
ALTER TYPE public.lifeco_form_type ADD VALUE 'scaffolding_permit';
ALTER TYPE public.lifeco_form_type ADD VALUE 'safety_valve_permit';

-- Re-grant access (standard procedure for migrations changing types/tables)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lifeco_digital_forms TO authenticated;
GRANT ALL ON public.lifeco_digital_forms TO service_role;
