
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM (
    'super_developer','administrator','department_manager','plant_manager',
    'engineer','technician','operator','viewer'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.mreq_status AS ENUM (
    'draft','pending','approved','in_progress','done','rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  department_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, department_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated, anon;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open user_roles" ON public.user_roles;
CREATE POLICY "open user_roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.has_role(_uid uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = _role);
$$;

CREATE TABLE IF NOT EXISTS public.plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_key text NOT NULL,
  name text NOT NULL,
  code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plants TO authenticated, anon;
GRANT ALL ON public.plants TO service_role;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open plants" ON public.plants;
CREATE POLICY "open plants" ON public.plants FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.areas TO authenticated, anon;
GRANT ALL ON public.areas TO service_role;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open areas" ON public.areas;
CREATE POLICY "open areas" ON public.areas FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  tag text NOT NULL,
  name text NOT NULL,
  type text,
  description text,
  criticality text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO authenticated, anon;
GRANT ALL ON public.equipment TO service_role;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open equipment" ON public.equipment;
CREATE POLICY "open equipment" ON public.equipment FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.equipment_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  kind text NOT NULL,
  url text NOT NULL,
  label text,
  uploaded_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_docs TO authenticated, anon;
GRANT ALL ON public.equipment_docs TO service_role;
ALTER TABLE public.equipment_docs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open equipment_docs" ON public.equipment_docs;
CREATE POLICY "open equipment_docs" ON public.equipment_docs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.spare_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_no text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  uom text DEFAULT 'ea',
  stock_qty numeric NOT NULL DEFAULT 0,
  min_qty numeric NOT NULL DEFAULT 0,
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spare_parts TO authenticated, anon;
GRANT ALL ON public.spare_parts TO service_role;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open spare_parts" ON public.spare_parts;
CREATE POLICY "open spare_parts" ON public.spare_parts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.equipment_spares (
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  spare_id uuid NOT NULL REFERENCES public.spare_parts(id) ON DELETE CASCADE,
  qty_required numeric NOT NULL DEFAULT 1,
  PRIMARY KEY (equipment_id, spare_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_spares TO authenticated, anon;
GRANT ALL ON public.equipment_spares TO service_role;
ALTER TABLE public.equipment_spares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open equipment_spares" ON public.equipment_spares;
CREATE POLICY "open equipment_spares" ON public.equipment_spares FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  requested_by text,
  status public.mreq_status NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'normal',
  title text NOT NULL,
  description text,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_requests TO authenticated, anon;
GRANT ALL ON public.maintenance_requests TO service_role;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open mreq" ON public.maintenance_requests;
CREATE POLICY "open mreq" ON public.maintenance_requests FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.maintenance_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.maintenance_requests(id) ON DELETE CASCADE,
  executed_by text,
  notes text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_executions TO authenticated, anon;
GRANT ALL ON public.maintenance_executions TO service_role;
ALTER TABLE public.maintenance_executions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open mexec" ON public.maintenance_executions;
CREATE POLICY "open mexec" ON public.maintenance_executions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.execution_spares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL REFERENCES public.maintenance_executions(id) ON DELETE CASCADE,
  spare_id uuid NOT NULL REFERENCES public.spare_parts(id),
  qty_used numeric NOT NULL DEFAULT 1
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.execution_spares TO authenticated, anon;
GRANT ALL ON public.execution_spares TO service_role;
ALTER TABLE public.execution_spares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open exec_spares" ON public.execution_spares;
CREATE POLICY "open exec_spares" ON public.execution_spares FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.execution_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL REFERENCES public.maintenance_executions(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.execution_photos TO authenticated, anon;
GRANT ALL ON public.execution_photos TO service_role;
ALTER TABLE public.execution_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open exec_photos" ON public.execution_photos;
CREATE POLICY "open exec_photos" ON public.execution_photos FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.material_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  spare_id uuid NOT NULL REFERENCES public.spare_parts(id),
  qty numeric NOT NULL,
  issued_by text,
  issued_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_issues TO authenticated, anon;
GRANT ALL ON public.material_issues TO service_role;
ALTER TABLE public.material_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open mat_issues" ON public.material_issues;
CREATE POLICY "open mat_issues" ON public.material_issues FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.decrement_stock_on_issue()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.spare_parts SET stock_qty = stock_qty - NEW.qty WHERE id = NEW.spare_id;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_dec_stock ON public.material_issues;
CREATE TRIGGER trg_dec_stock AFTER INSERT ON public.material_issues
FOR EACH ROW EXECUTE FUNCTION public.decrement_stock_on_issue();

DELETE FROM public.department_pins;
INSERT INTO public.department_pins (id, label, pin) VALUES
  (gen_random_uuid(), 'AMMONIA', '1001'),
  (gen_random_uuid(), 'UREA',    '1002'),
  (gen_random_uuid(), 'LAB',     '1003'),
  (gen_random_uuid(), 'MAINTENANCE', '1004'),
  (gen_random_uuid(), 'WAREHOUSE', '1005');

DO $seed$
DECLARE
  p_amm uuid; p_urea uuid; p_lab uuid; p_maint uuid; p_wh uuid;
  a_ref uuid; a_syn uuid; a_ut uuid; a_prill uuid; a_qc uuid; a_ws uuid; a_store uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.plants LIMIT 1) THEN RETURN; END IF;

  INSERT INTO public.plants (department_key, name, code) VALUES ('AMMONIA','Ammonia Plant 1','AMM-1') RETURNING id INTO p_amm;
  INSERT INTO public.plants (department_key, name, code) VALUES ('UREA','Urea Plant 1','UREA-1') RETURNING id INTO p_urea;
  INSERT INTO public.plants (department_key, name, code) VALUES ('LAB','Central Laboratory','LAB-1') RETURNING id INTO p_lab;
  INSERT INTO public.plants (department_key, name, code) VALUES ('MAINTENANCE','Mechanical Workshop','MW-1') RETURNING id INTO p_maint;
  INSERT INTO public.plants (department_key, name, code) VALUES ('WAREHOUSE','Main Warehouse','WH-1') RETURNING id INTO p_wh;

  INSERT INTO public.areas (plant_id, name, code) VALUES (p_amm,'Reforming','REF') RETURNING id INTO a_ref;
  INSERT INTO public.areas (plant_id, name, code) VALUES (p_amm,'Synthesis','SYN') RETURNING id INTO a_syn;
  INSERT INTO public.areas (plant_id, name, code) VALUES (p_amm,'Utilities','UT')  RETURNING id INTO a_ut;
  INSERT INTO public.areas (plant_id, name, code) VALUES (p_urea,'Prilling Tower','PT') RETURNING id INTO a_prill;
  INSERT INTO public.areas (plant_id, name, code) VALUES (p_lab,'Quality Control','QC') RETURNING id INTO a_qc;
  INSERT INTO public.areas (plant_id, name, code) VALUES (p_maint,'Workshop Floor','WS') RETURNING id INTO a_ws;
  INSERT INTO public.areas (plant_id, name, code) VALUES (p_wh,'Main Store','MS') RETURNING id INTO a_store;

  INSERT INTO public.equipment (area_id, tag, name, type, criticality) VALUES
    (a_ref,'R-501','Primary Reformer','Reactor','A'),
    (a_ref,'E-502','Feed Preheater','Heat Exchanger','B'),
    (a_syn,'K-601','Syn Gas Compressor','Compressor','A'),
    (a_syn,'V-620','Ammonia Separator','Vessel','A'),
    (a_ut,'P-701','Boiler Feedwater Pump','Pump','B'),
    (a_ut,'B-710','HP Steam Boiler','Boiler','A'),
    (a_prill,'PT-801','Prilling Head','Rotating Equipment','A'),
    (a_prill,'K-810','Air Blower','Fan','B'),
    (a_qc,'GC-901','Gas Chromatograph','Analyzer','B'),
    (a_ws,'W-101','Lathe Machine','Tool','C'),
    (a_store,'RCK-01','Storage Rack 01','Rack','C');

  INSERT INTO public.spare_parts (part_no, name, uom, stock_qty, min_qty, location) VALUES
    ('BRG-6205','Bearing 6205','ea',24,10,'A-01-03'),
    ('SEAL-M25','Mechanical Seal M25','ea',8,4,'A-02-05'),
    ('VLV-2IN','2-inch Ball Valve','ea',15,6,'B-03-01'),
    ('GKT-DN80','Gasket DN80','ea',60,20,'B-04-02'),
    ('BLT-M12','Bolt M12x50','ea',300,100,'C-01-01'),
    ('OIL-ISO46','Lube Oil ISO 46','L',400,150,'D-05'),
    ('FLT-AIR-10','Air Filter 10 micron','ea',12,5,'A-05-04'),
    ('BLT-M16','Bolt M16x80','ea',180,80,'C-01-02'),
    ('PMP-IMPL','Pump Impeller','ea',3,2,'A-06-01'),
    ('CBL-4C','Cable 4C x 2.5','m',500,200,'E-01');
END $seed$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_requests;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.spare_parts;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
