
ALTER TABLE public.equipment_assets
  ADD COLUMN IF NOT EXISTS tag text,
  ADD COLUMN IF NOT EXISTS plant_code text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS manufacturer text,
  ADD COLUMN IF NOT EXISTS install_year int,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'running',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS criticality text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS running_hours int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_maintenance_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_maintenance_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_equipment_assets_plant ON public.equipment_assets(plant_code);
CREATE INDEX IF NOT EXISTS idx_equipment_assets_status ON public.equipment_assets(status);

ALTER TABLE public.maintenance_records
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'corrective',
  ADD COLUMN IF NOT EXISTS cost_parts numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_labor numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hours numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS technician text,
  ADD COLUMN IF NOT EXISTS failure_cause text,
  ADD COLUMN IF NOT EXISTS before_photo text,
  ADD COLUMN IF NOT EXISTS after_photo text;
