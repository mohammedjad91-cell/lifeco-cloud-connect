CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_settings TO authenticated, anon;
GRANT ALL ON public.system_settings TO service_role;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open read system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "open write system_settings" ON public.system_settings;
CREATE POLICY "open read system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "open write system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.system_settings (key, value) VALUES
  ('branding', '{"company_name":"LIFECO","primary_color":"#3B82F6","accent_color":"#06B6D4","footer_text":"Prepared by Eng. Mohamed Gadalla"}'::jsonb),
  ('company', '{"company_name":"LIFECO","timezone":"Africa/Tripoli","date_format":"YYYY-MM-DD","file_upload_limit_mb":50,"language":"en"}'::jsonb)
ON CONFLICT (key) DO NOTHING;