DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND (qual ILIKE '%field-ops-photos%' OR with_check ILIKE '%field-ops-photos%'
        OR qual ILIKE '%digital-library%' OR with_check ILIKE '%digital-library%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "auth_read_app_buckets" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id IN ('field-ops-photos','digital-library'));

CREATE POLICY "auth_insert_app_buckets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('field-ops-photos','digital-library'));

CREATE POLICY "auth_update_app_buckets" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id IN ('field-ops-photos','digital-library'))
WITH CHECK (bucket_id IN ('field-ops-photos','digital-library'));

CREATE POLICY "auth_delete_app_buckets" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id IN ('field-ops-photos','digital-library'));