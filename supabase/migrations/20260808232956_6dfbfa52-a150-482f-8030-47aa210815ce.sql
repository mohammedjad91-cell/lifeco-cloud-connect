
ALTER TABLE public.equipment_identity_cards
ADD COLUMN IF NOT EXISTS protection_matrix JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS operating_control JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS detailed_running_data JSONB DEFAULT '{}'::jsonb;
