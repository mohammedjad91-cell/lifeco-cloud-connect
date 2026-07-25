
CREATE TABLE public.library_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  category text NOT NULL,
  plant_code text,
  equipment_id uuid,
  description text,
  storage_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_files TO anon, authenticated;
GRANT ALL ON public.library_files TO service_role;

ALTER TABLE public.library_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read library files" ON public.library_files FOR SELECT USING (true);
CREATE POLICY "Anyone can insert library files" ON public.library_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update library files" ON public.library_files FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete library files" ON public.library_files FOR DELETE USING (true);

CREATE POLICY "Anyone can read digital-library objects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'digital-library');
CREATE POLICY "Anyone can upload digital-library objects"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'digital-library');
CREATE POLICY "Anyone can update digital-library objects"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'digital-library');
CREATE POLICY "Anyone can delete digital-library objects"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'digital-library');
