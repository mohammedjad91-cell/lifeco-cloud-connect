-- Clean demo data from operational tables
DELETE FROM public.operations_logs;
DELETE FROM public.field_ops_logs;
DELETE FROM public.lab_results;
DELETE FROM public.samples;
DELETE FROM public.maintenance_records;
DELETE FROM public.lifeco_digital_forms;
DELETE FROM public.activity_logs;
DELETE FROM public.material_issues;
DELETE FROM public.maintenance_work_requests;
DELETE FROM public.operational_reports;
DELETE FROM public.work_permits;
DELETE FROM public.safety_incidents;
DELETE FROM public.ppe_issuances;