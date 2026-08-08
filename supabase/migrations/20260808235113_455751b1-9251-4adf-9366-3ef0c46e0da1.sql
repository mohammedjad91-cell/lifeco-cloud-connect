UPDATE public.equipment_identity_cards 
SET 
  description = description || E'\n\n[CRITICAL INSTRUMENT AIR SERVICE]\nSource: 60-2201 / 60-2202 → 60-2003\nCritical Consumers:\n- Ammonia Plant 1\n- Ammonia Plant 2\n- Ammonia Storage\nService: Instrument Air\nClassification: Critical Continuous Service\nOperating Principle: 60-2003 يستقبل الهواء المجفف ويعمل كـ Receiver/Buffer ثم يوزعه إلى مستهلكي Instrument Air.\nImportant Operating Rule: Instrument Air يجب أن يبقى متاحاً بشكل مستمر للمستهلكين الحرجين، ولا يتم اعتباره مساراً عادياً للفصل أثناء التشغيل.\nFailure Consequence: Loss of Instrument Air may affect ammonia plant operation and storage controls.',
  updated_at = NOW()
WHERE equipment_tag = '60-2003';