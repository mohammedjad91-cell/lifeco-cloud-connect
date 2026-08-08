-- Update downstream connections and safety notes for 60-2003
UPDATE public.equipment_identity_cards 
SET 
  downstream = '1. 60-2003 → Ammonia Plant 1 (Service: Instrument Air, Critical: YES), 2. 60-2003 → Ammonia Plant 2 (Service: Instrument Air, Critical: YES), 3. 60-2003 → Ammonia Storage (Service: Instrument Air, Critical: YES)',
  safety_notes = 'Instrument Air is a Critical Continuous Service. Loss of Instrument Air may affect ammonia plant operation and storage controls. Connection shall remain continuously available and shall not be treated as a normal isolatable service.',
  updated_at = NOW()
WHERE equipment_tag = '60-2003';