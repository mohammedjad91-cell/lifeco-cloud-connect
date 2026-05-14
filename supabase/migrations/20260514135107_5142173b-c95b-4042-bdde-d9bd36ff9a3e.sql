
CREATE TABLE public.equipment_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department text NOT NULL,
  asset_code text NOT NULL,
  asset_name text NOT NULL,
  is_custom boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read equipment_assets" ON public.equipment_assets FOR SELECT USING (true);
CREATE POLICY "Allow all insert equipment_assets" ON public.equipment_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update equipment_assets" ON public.equipment_assets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete equipment_assets" ON public.equipment_assets FOR DELETE USING (true);

CREATE TABLE public.maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.equipment_assets(id) ON DELETE CASCADE,
  notes text NOT NULL,
  recorded_by text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read maintenance_records" ON public.maintenance_records FOR SELECT USING (true);
CREATE POLICY "Allow all insert maintenance_records" ON public.maintenance_records FOR INSERT WITH CHECK (true);

CREATE INDEX idx_equipment_assets_department ON public.equipment_assets(department);
CREATE INDEX idx_maintenance_records_asset_id ON public.maintenance_records(asset_id);

-- Seed official asset register
INSERT INTO public.equipment_assets (department, asset_code, asset_name, is_custom) VALUES
  ('AMM1', '101-J', 'Air Compressor', false),
  ('AMM1', '102-J', 'Feed Gas Compressor', false),
  ('AMM1', '103-J', 'Syn Gas Compressor', false),
  ('AMM1', '105-J', 'Refrigeration Compressor', false),
  ('AMM1', '104-J', 'Circulator', false),
  ('AMM1', 'H-101', 'Primary Reformer', false),
  ('AMM1', 'R-101', 'Secondary Reformer', false),
  ('AMM1', 'HTS', 'HTS Converter', false),
  ('AMM1', 'LTS', 'LTS Converter', false),
  ('AMM1', 'METH', 'Methanator', false),
  ('AMM1', 'R-501', 'Ammonia Converter', false),
  ('AMM2', '101-J', 'Air Compressor', false),
  ('AMM2', '102-J', 'Feed Gas Compressor', false),
  ('AMM2', '103-J', 'Syn Gas Compressor', false),
  ('AMM2', '105-J', 'Refrigeration Compressor', false),
  ('AMM2', '104-J', 'Circulator', false),
  ('AMM2', 'H-101', 'Primary Reformer', false),
  ('AMM2', 'R-101', 'Secondary Reformer', false),
  ('AMM2', 'HTS', 'HTS Converter', false),
  ('AMM2', 'LTS', 'LTS Converter', false),
  ('AMM2', 'METH', 'Methanator', false),
  ('AMM2', 'R-501', 'Ammonia Converter', false),
  ('DEMIN1', 'SWIP', 'Sea Water Intake Pumps', false),
  ('DEMIN1', 'BRP', 'Brine Recirculation Pumps', false),
  ('DEMIN1', 'D-1', 'Distiller D-1', false),
  ('DEMIN1', 'VE', 'Vacuum Ejectors', false),
  ('DEMIN2', 'SWIP', 'Sea Water Intake Pumps', false),
  ('DEMIN2', 'BRP', 'Brine Recirculation Pumps', false),
  ('DEMIN2', 'D-2', 'Distiller D-2', false),
  ('DEMIN2', 'VE', 'Vacuum Ejectors', false),
  ('NITROGEN', 'ZR-460', 'ZR 460 Air Compressor', false),
  ('NITROGEN', 'ADU', 'Air Dryer Units', false),
  ('NITROGEN', 'CB', 'Cold Box', false),
  ('NITROGEN', 'ET', 'Expansion Turbine', false),
  ('UTILITIES', 'SWIP', 'Sea Water Intake Pumps', false),
  ('UTILITIES', 'BRP', 'Brine Recirculation Pumps', false),
  ('UTILITIES', 'D-1', 'Distiller D-1', false),
  ('UTILITIES', 'D-2', 'Distiller D-2', false),
  ('UTILITIES', 'VE', 'Vacuum Ejectors', false);
