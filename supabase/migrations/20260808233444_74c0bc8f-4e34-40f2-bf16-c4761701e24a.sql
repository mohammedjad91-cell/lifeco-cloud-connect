WITH new_asset AS (
  INSERT INTO public.equipment_assets (
    asset_code, 
    asset_name, 
    department, 
    plant_code, 
    location, 
    status, 
    is_custom, 
    criticality,
    manufacturer
  ) VALUES (
    '60-2002', 
    'Air Receiver', 
    'AMMONIA', 
    'N2-1', 
    'NITROGEN GENERATION', 
    'Pending Verification', 
    false, 
    'Normal',
    'Pending Verification'
  ) RETURNING id, asset_code
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
  normal_operating_range,
  capacity,
  design_limits,
  alarm,
  trip,
  m1_temperature,
  m2_temperature,
  manufacturer,
  model,
  operating_status
) SELECT 
  id, 
  asset_code, 
  'Air Receiver', 
  'Air Receiver', 
  'Compressed Air', 
  'خزان استقبال وتخزين للهواء المضغوط يعمل كـBuffer بين الضواغط 60-1001A/B/C ومنظومة الـDryers، ويساعد على استقرار إمداد الهواء للمرحلة التالية.',
  '- 60-1001A
- 60-1001B
- 60-1001C',
  '- 60-2201
- 60-2202',
  '9.1 bar (Field Verification Required)',
  'Pending Verification',
  'Design Pressure: Pending Verification',
  'Pending Verification',
  'Pending Verification',
  'Pending Verification',
  'Pending Verification',
  'Pending Verification',
  'Pending Verification',
  'Pending Verification'
FROM new_asset;
