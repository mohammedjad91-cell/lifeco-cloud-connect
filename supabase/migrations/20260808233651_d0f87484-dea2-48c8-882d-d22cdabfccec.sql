WITH dryers AS (
  INSERT INTO public.equipment_assets (
    asset_code, 
    asset_name, 
    department, 
    plant_code, 
    location, 
    status, 
    is_custom, 
    criticality
  ) VALUES 
  ('60-2201', 'Dryer', 'AMMONIA', 'N2-1', 'NITROGEN GENERATION', 'Pending Verification', false, 'Normal'),
  ('60-2202', 'Dryer', 'AMMONIA', 'N2-1', 'NITROGEN GENERATION', 'Pending Verification', false, 'Normal')
  RETURNING id, asset_code
)
INSERT INTO public.equipment_identity_cards (
  asset_id,
  equipment_tag,
  equipment_name,
  equipment_type,
  service,
  description,
  upstream,
  downstream,
  operating_control,
  protection_matrix,
  detailed_running_data,
  manufacturer,
  model,
  operating_status,
  capacity,
  design_limits,
  alarm,
  trip
) SELECT 
  id, 
  asset_code, 
  'Dryer', 
  'Dryer', 
  'Compressed Air', 
  'تجفيف الهواء المضغوط القادم من Air Receiver 60-2002 قبل دخوله إلى 60-2003.',
  '60-2002',
  '60-2003',
  jsonb_build_object(
    'vessel_count', 2,
    'vessel_1', 'Pending Verification',
    'vessel_2', 'Pending Verification',
    'dryer_type', 'Pending Verification',
    'active_vessel', 'Pending Verification',
    'regenerating_vessel', 'Pending Verification',
    'switching_status', 'Pending Verification'
  ),
  jsonb_build_object(
    'process_data', jsonb_build_object(
      'inlet_pressure', 'Pending Verification',
      'outlet_pressure', 'Pending Verification',
      'inlet_temperature', 'Pending Verification',
      'outlet_temperature', 'Pending Verification',
      'dew_point', 'Pending Verification',
      'differential_pressure', 'Pending Verification'
    )
  ),
  jsonb_build_object(
    'maintenance_status', 'Pending Verification'
  ),
  'Pending Verification',
  'Pending Verification',
  'Pending Verification',
  'Pending Verification',
  'Pending Verification',
  'Pending Verification',
  'Pending Verification'
FROM dryers;
