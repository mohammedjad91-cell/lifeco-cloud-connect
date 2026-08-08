UPDATE public.equipment_identity_cards 
SET 
  downstream = downstream || ', 4. 60-2003 → Nitrogen Generation (Status: Pending Equipment Identification)',
  description = description || E'\n\n[NITROGEN GENERATION DOWNSTREAM SERVICE]\nService: Nitrogen Generation\nStatus: Pending Equipment Identification\nNote: The downstream nitrogen-generation equipment/tag has not yet been identified from the available plant documentation. Do not create placeholder equipment.',
  updated_at = NOW()
WHERE equipment_tag = '60-2003';