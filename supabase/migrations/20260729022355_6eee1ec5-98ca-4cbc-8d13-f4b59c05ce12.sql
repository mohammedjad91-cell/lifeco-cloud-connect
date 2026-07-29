DROP POLICY IF EXISTS auth_insert_app_buckets ON storage.objects;
DROP POLICY IF EXISTS auth_read_app_buckets ON storage.objects;
DROP POLICY IF EXISTS auth_update_app_buckets ON storage.objects;
DROP POLICY IF EXISTS auth_delete_app_buckets ON storage.objects;

CREATE POLICY app_insert_app_buckets ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = ANY (ARRAY['field-ops-photos','digital-library']));
CREATE POLICY app_read_app_buckets ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = ANY (ARRAY['field-ops-photos','digital-library']));
CREATE POLICY app_update_app_buckets ON storage.objects FOR UPDATE TO anon, authenticated
  USING (bucket_id = ANY (ARRAY['field-ops-photos','digital-library']))
  WITH CHECK (bucket_id = ANY (ARRAY['field-ops-photos','digital-library']));
CREATE POLICY app_delete_app_buckets ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = ANY (ARRAY['field-ops-photos','digital-library']));