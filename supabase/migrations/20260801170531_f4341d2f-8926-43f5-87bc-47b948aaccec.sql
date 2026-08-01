
INSERT INTO public.equipment_assets
 (department, asset_code, asset_name, tag, plant_code, location, manufacturer, install_year, status, criticality, running_hours, last_maintenance_at, next_maintenance_at, is_custom)
SELECT d.dept, v.code, v.name, v.code, v.plant, v.loc, v.mfr, v.yr, v.st, v.crit,
       (random()*60000)::int, now() - ((random()*50)::int || ' days')::interval, now() + ((random()*40+5)::int || ' days')::interval, false
FROM (VALUES ('AMMONIA')) d(dept),
(VALUES
 ('101-J','Synthesis Gas Compressor','AMM-1','Compressor House','Elliott',1978,'running','critical'),
 ('103-J','Ammonia Refrigeration Compressor','AMM-1','Refrigeration Bay','Elliott',1978,'running','critical'),
 ('105-D','Ammonia Converter','AMM-1','Synthesis Loop','Kellogg',1978,'running','critical'),
 ('101-B','Primary Reformer','AMM-1','Reforming Area','Kellogg',1978,'running','critical'),
 ('103-D','CO2 Absorber','AMM-1','CO2 Removal','Kellogg',1978,'running','high'),
 ('106-D','Methanator','AMM-1','Purification','Kellogg',1978,'running','high'),
 ('201-J','Synthesis Gas Compressor','AMM-2','Compressor House','Elliott',1980,'running','critical'),
 ('205-D','Ammonia Converter','AMM-2','Synthesis Loop','Kellogg',1980,'standby','critical'),
 ('201-B','Primary Reformer','AMM-2','Reforming Area','Kellogg',1980,'running','critical'),
 ('K-101A','PSA Air Compressor A','N2-1','N2 Compressor Room','Atlas Copco',2012,'running','critical'),
 ('K-101B','PSA Air Compressor B','N2-1','N2 Compressor Room','Atlas Copco',2012,'standby','high'),
 ('PSA-01','PSA Nitrogen Generation Skid','N2-1','PSA Skid','Parker',2012,'running','critical'),
 ('D-201','Air Dryer','N2-1','PSA Skid','Parker',2012,'running','medium'),
 ('P-301A','Demin Feed Pump A','DEMIN-1','Pump House','KSB',1985,'running','high'),
 ('P-301B','Demin Feed Pump B','DEMIN-1','Pump House','KSB',1985,'standby','medium'),
 ('MB-401','Mixed Bed Exchanger','DEMIN-2','Ion Exchange','Degremont',1985,'running','high')
) AS v(code,name,plant,loc,mfr,yr,st,crit)
WHERE NOT EXISTS (SELECT 1 FROM public.equipment_assets ea WHERE ea.asset_code = v.code AND ea.department = d.dept);

INSERT INTO public.equipment_assets
 (department, asset_code, asset_name, tag, plant_code, location, manufacturer, install_year, status, criticality, running_hours, last_maintenance_at, next_maintenance_at, is_custom)
SELECT v.dept, v.code, v.name, v.code, v.plant, v.loc, v.mfr, v.yr, v.st, v.crit,
       (random()*45000)::int, now() - ((random()*45)::int || ' days')::interval, now() + ((random()*40+5)::int || ' days')::interval, false
FROM (VALUES
 ('UREA','UR-101-J','CO2 Compressor','UREA-1','Compressor House','Nuovo Pignone',1979,'running','critical'),
 ('UREA','UR-R-101','Urea Reactor','UREA-1','Synthesis Tower','Snamprogetti',1979,'running','critical'),
 ('UREA','UR-E-105','Carbamate Condenser','UREA-1','Synthesis','Snamprogetti',1979,'running','high'),
 ('UREA','UR-PR-201','Prilling Tower Fan','UREA-1','Prilling Tower','Howden',1979,'running','high'),
 ('UREA','UR-BG-301','Bagging Line 1','UREA-2','Bagging Plant','Haver&Boecker',1995,'running','medium'),
 ('LAB','LAB-GC-01','Gas Chromatograph','LAB-1','Instrument Room','Agilent',2015,'running','high'),
 ('LAB','LAB-AA-02','Atomic Absorption Spectrometer','LAB-1','Instrument Room','PerkinElmer',2014,'running','medium'),
 ('LAB','LAB-TT-03','Auto Titrator','LAB-1','Wet Lab','Metrohm',2016,'running','medium'),
 ('MAINTENANCE','MNT-LT-01','Heavy Duty Lathe','MNT-WORKSHOP','Mechanical Workshop','Colchester',1980,'running','medium'),
 ('MAINTENANCE','MNT-WD-02','TIG Welding Machine','MNT-WORKSHOP','Welding Bay','Lincoln',2010,'running','medium'),
 ('MAINTENANCE','MNT-CR-03','Mobile Crane 50T','MNT-WORKSHOP','Yard','Liebherr',2008,'running','high'),
 ('MAINTENANCE','MNT-VB-04','Vibration Analyzer','MNT-EQ','Predictive Maint.','SKF',2018,'running','high'),
 ('SAFETY','HSE-FT-01','Fire Truck 1','HSE-1','Fire Station','Rosenbauer',2011,'running','critical'),
 ('SAFETY','HSE-GD-02','Gas Detection Panel','HSE-1','Control Room','Honeywell',2016,'running','critical'),
 ('SAFETY','HSE-SC-03','SCBA Compressor','HSE-1','Fire Station','Bauer',2013,'running','high'),
 ('MATERIALS','MAT-FL-01','Forklift 3T','MAT-1','Main Warehouse','Toyota',2015,'running','medium'),
 ('MATERIALS','MAT-SC-02','Barcode Scanner Station','MAT-1','Receiving Bay','Zebra',2019,'running','low'),
 ('TECHNICAL','TA-SV-01','Engineering Server','TA-1','IT Room','Dell',2020,'running','high'),
 ('TECHNICAL','TA-PL-02','A0 Plotter','TA-1','Drawing Office','HP',2018,'running','low')
) AS v(dept,code,name,plant,loc,mfr,yr,st,crit)
WHERE NOT EXISTS (SELECT 1 FROM public.equipment_assets ea WHERE ea.asset_code = v.code AND ea.department = v.dept);

INSERT INTO public.spare_parts (part_no, name, description, uom, stock_qty, min_qty, location)
SELECT v.* FROM (VALUES
 ('SP-1001','Mechanical Seal 101-J','Cartridge seal, API 682 Plan 11','EA',6,2,'WH-A-01'),
 ('SP-1002','Journal Bearing 103-J','Babbitt lined, split type','EA',4,2,'WH-A-02'),
 ('SP-1003','Reformer Burner Tip','Alloy 800H burner tip','EA',24,10,'WH-A-03'),
 ('SP-1004','Ammonia Catalyst KM1','Magnetite promoted, per drum','DRUM',12,4,'WH-B-01'),
 ('SP-1005','Methanation Catalyst','Nickel based','DRUM',8,3,'WH-B-02'),
 ('SP-1006','PSA Carbon Molecular Sieve','CMS for N2 PSA','KG',900,300,'WH-B-03'),
 ('SP-1007','Air Filter Element K-101','Inlet filter cartridge','EA',18,6,'WH-C-01'),
 ('SP-1008','Solenoid Valve 24VDC','PSA sequence valve','EA',10,4,'WH-C-02'),
 ('SP-1009','Cation Resin','Strong acid cation','L',1200,400,'WH-D-01'),
 ('SP-1010','Anion Resin','Strong base anion','L',1100,400,'WH-D-02'),
 ('SP-1011','Prilling Fan Belt','V-belt set','SET',9,3,'WH-E-01'),
 ('SP-1012','Urea Bagging Sealing Bar','Heat sealing element','EA',7,3,'WH-E-02'),
 ('SP-1013','Pressure Transmitter 0-250 bar','Rosemount 3051','EA',5,2,'WH-F-01'),
 ('SP-1014','Thermocouple Type K','Inconel sheath 6mm','EA',30,10,'WH-F-02'),
 ('SP-1015','Gasket Spiral Wound 6in','SS316 / graphite','EA',40,15,'WH-G-01'),
 ('SP-1016','SCBA Cylinder 6.8L','Composite 300 bar','EA',14,6,'WH-H-01'),
 ('SP-1017','Gas Detector Sensor NH3','Electrochemical 0-100 ppm','EA',12,5,'WH-H-02'),
 ('SP-1018','Fire Hose 2.5in x 30m','Nitrile lined','EA',20,8,'WH-H-03')
) AS v(part_no,name,description,uom,stock_qty,min_qty,location)
WHERE NOT EXISTS (SELECT 1 FROM public.spare_parts sp WHERE sp.part_no = v.part_no);

INSERT INTO public.maintenance_records
 (asset_id, notes, recorded_by, recorded_at, type, cost_parts, cost_labor, hours, technician, failure_cause)
SELECT ea.id,
  (ARRAY['فحص دوري واستبدال فلاتر الزيت','معايرة صمام الأمان وتوثيق النتيجة','تحليل الاهتزاز وتصحيح الاتزان','تنظيف المبادل الحراري وفحص الأنابيب','استبدال حشوة ميكانيكية بعد تسريب طفيف','شد وربط التوصيلات الكهربائية','تشحيم المحامل حسب جدول التشحيم','فحص بالموجات فوق الصوتية لسماكة الجسم'])[1+floor(random()*8)]
  ,(ARRAY['محمد جاد الله','أحمد الصادق','عمر بن سالم','خالد المبروك'])[1+floor(random()*4)]
  , now() - ((g*2 + floor(random()*2))::int || ' days')::interval
  ,(ARRAY['preventive','preventive','corrective','predictive'])[1+floor(random()*4)]
  ,round((random()*4200)::numeric,2), round((random()*1500)::numeric,2), round((random()*10+1)::numeric,1)
  ,(ARRAY['فريق الميكانيكا','فريق الكهرباء','فريق التحكم','فريق اللحام'])[1+floor(random()*4)]
  ,CASE WHEN random()<0.3 THEN (ARRAY['اهتراء طبيعي','تلوث الزيت','ارتفاع درجة الحرارة','خلل في المستشعر'])[1+floor(random()*4)] ELSE NULL END
FROM public.equipment_assets ea, generate_series(0,29) g
WHERE random() < 0.22;

INSERT INTO public.operations_logs (department, unit_tag, value, employee_id, timestamp)
SELECT v.dept, v.tag,
  round((v.base + (random()-0.5)*v.span)::numeric,2),
  (ARRAY['EMP-1021','EMP-1044','EMP-1077','EMP-1090'])[1+floor(random()*4)],
  now() - (d || ' days')::interval - (h || ' hours')::interval
FROM (VALUES
 ('AMMONIA','101-J DISCH PRESS (bar)',150,10),
 ('AMMONIA','105-D BED TEMP (C)',480,25),
 ('AMMONIA','101-B OUTLET TEMP (C)',800,20),
 ('AMMONIA','NH3 PRODUCTION (T/H)',42,4),
 ('AMMONIA','K-101A DISCH PRESS (bar)',8.5,0.6),
 ('AMMONIA','N2 PURITY (%)',99.95,0.05),
 ('AMMONIA','N2 FLOW (Nm3/h)',900,80),
 ('AMMONIA','DEMIN CONDUCTIVITY (uS/cm)',0.3,0.15),
 ('UREA','UR-R-101 PRESS (bar)',155,8),
 ('UREA','UREA PRODUCTION (T/H)',55,6),
 ('UREA','PRILL TOWER TEMP (C)',65,5)
) AS v(dept,tag,base,span), generate_series(0,59) d, generate_series(0,23,4) h
WHERE random() < 0.55;

INSERT INTO public.field_ops_logs
 (department, equipment_tag, employee_id, technician_name, running_hours, discharge_pressure, temperature, dynamic_data, notes, recorded_by, timestamp)
SELECT ea.department, ea.asset_code,
 (ARRAY['EMP-1021','EMP-1044','EMP-1077'])[1+floor(random()*3)],
 (ARRAY['محمد جاد الله','أحمد الصادق','عمر بن سالم'])[1+floor(random()*3)],
 (random()*60000)::int, round((random()*160)::numeric,2), round((random()*120+30)::numeric,2),
 jsonb_build_object('vibration_mm_s', round((random()*7)::numeric,2), 'oil_level', 'OK', 'noise', 'normal'),
 (ARRAY['التشغيل طبيعي','لوحظ اهتزاز خفيف - تحت المراقبة','تم التبليغ عن تسريب زيت طفيف','لا يوجد ملاحظات'])[1+floor(random()*4)],
 'ميدان', now() - ((g)::int || ' days')::interval - ((floor(random()*20))::int || ' hours')::interval
FROM public.equipment_assets ea, generate_series(0,59) g
WHERE random() < 0.12;

INSERT INTO public.samples (sample_name, department, analysis_type, status, employee_id, technician_name, sample_date, dynamic_data, notes)
SELECT v.name, 'LAB', v.atype,
 (ARRAY['completed','completed','completed','pending'])[1+floor(random()*4)],
 (ARRAY['EMP-2001','EMP-2002','EMP-2003'])[1+floor(random()*3)],
 (ARRAY['سالم الفيتوري','مريم بن عيسى','يوسف الشريف'])[1+floor(random()*3)],
 (now() - (d || ' days')::interval)::date,
 jsonb_build_object('ph', round((6.5+random()*2)::numeric,2), 'conductivity', round((random()*2)::numeric,3)),
 'تحليل روتيني'
FROM (VALUES
 ('ماء منزوع المعادن - DEMIN 1','Water Analysis'),
 ('ماء منزوع المعادن - DEMIN 2','Water Analysis'),
 ('غاز التخليق - AMM 1','Gas Analysis'),
 ('نيتروجين PSA','Gas Purity'),
 ('محلول الكاربامات - UREA','Chemical Analysis'),
 ('يوريا حبيبية','Product Quality'),
 ('زيت التشحيم 101-J','Oil Analysis')
) AS v(name,atype), generate_series(0,59,3) d
WHERE random() < 0.7;

INSERT INTO public.lab_results (plant, sample_type, parameter_name, value, technician_name, employee_id, timestamp)
SELECT v.plant, CASE WHEN d % 7 = 0 THEN 'weekly' ELSE 'daily' END, v.param, round((v.base + (random()-0.5)*v.span)::numeric,3),
 (ARRAY['سالم الفيتوري','مريم بن عيسى','يوسف الشريف'])[1+floor(random()*3)],
 (ARRAY['EMP-2001','EMP-2002','EMP-2003'])[1+floor(random()*3)],
 now() - (d || ' days')::interval
FROM (VALUES
 ('AMM-1','H2/N2 Ratio',3.0,0.15),
 ('AMM-1','CH4 Slip (%)',0.35,0.1),
 ('AMM-1','CO2 Slip (ppm)',900,200),
 ('N2-1','N2 Purity (%)',99.95,0.04),
 ('N2-1','O2 Content (ppm)',45,20),
 ('DEMIN-1','Conductivity (uS/cm)',0.3,0.15),
 ('DEMIN-1','Silica (ppb)',12,6),
 ('UREA-1','Biuret (%)',0.85,0.15),
 ('UREA-1','Moisture (%)',0.3,0.1)
) AS v(plant,param,base,span), generate_series(0,59) d
WHERE random() < 0.5;

INSERT INTO public.work_permits
 (permit_no, permit_type, plant_code, location, description, hazards, controls, requested_by, supervisor, hse_officer, status,
  supervisor_approved_at, supervisor_approved_by, hse_approved_at, hse_approved_by, start_at, end_at, workers_count, created_at)
SELECT 'PTW-' || to_char(now() - (d || ' days')::interval,'YYMMDD') || '-' || lpad((100+d)::text,3,'0'),
 (ARRAY['Hot Work','Confined Space','Work at Height','Excavation','Electrical Isolation'])[1+floor(random()*5)],
 (ARRAY['AMM-1','AMM-2','N2-1','UREA-1','DEMIN-1'])[1+floor(random()*5)],
 'منطقة العملية', 'أعمال صيانة مخططة', 'حرارة / غازات / ضغط', 'عزل ميكانيكي، تهوية، قياس غازات، مراقب حريق',
 'أحمد الصادق','خالد المبروك','سالم الهوني',
 (ARRAY['closed','closed','hse_approved','pending_supervisor'])[1+floor(random()*4)],
 now() - (d || ' days')::interval + interval '1 hour','خالد المبروك',
 now() - (d || ' days')::interval + interval '2 hour','سالم الهوني',
 now() - (d || ' days')::interval + interval '3 hour', now() - (d || ' days')::interval + interval '11 hour',
 2+floor(random()*8)::int, now() - (d || ' days')::interval
FROM generate_series(0,59) d WHERE random() < 0.8;

INSERT INTO public.safety_incidents
 (incident_no, entry_type, severity, plant_code, location, description, reported_by, suggested_action, corrective_action, assigned_to, status, created_at, closed_at)
SELECT 'INC-' || to_char(now() - (d || ' days')::interval,'YYMMDD') || '-' || lpad(d::text,2,'0'),
 (ARRAY['near_miss','unsafe_condition','unsafe_act','first_aid'])[1+floor(random()*4)],
 (ARRAY['low','low','medium','high'])[1+floor(random()*4)],
 (ARRAY['AMM-1','AMM-2','N2-1','UREA-1'])[1+floor(random()*4)],
 'ممر التشغيل',
 (ARRAY['تسريب زيت على الأرضية','غطاء حماية مفقود','عدم استخدام معدات الوقاية','انسكاب محلول كيميائي'])[1+floor(random()*4)],
 'مراقب السلامة','تنظيف فوري وتأمين المنطقة','تم التنفيذ وتوثيق الدرس المستفاد','فريق السلامة',
 (ARRAY['closed','closed','open'])[1+floor(random()*3)],
 now() - (d || ' days')::interval,
 CASE WHEN random()<0.7 THEN now() - (d || ' days')::interval + interval '2 days' ELSE NULL END
FROM generate_series(0,59,2) d;

INSERT INTO public.ppe_issuances (employee_id, employee_name, department, ppe_type, issued_at, replacement_due, condition, status, notes)
SELECT 'EMP-' || (1000+d)::text,
 (ARRAY['محمد جاد الله','أحمد الصادق','عمر بن سالم','خالد المبروك','سالم الهوني'])[1+floor(random()*5)],
 (ARRAY['AMMONIA','UREA','MAINTENANCE','LAB','SAFETY'])[1+floor(random()*5)],
 (ARRAY['Safety Helmet','Safety Shoes','Chemical Gloves','Face Shield','Full Body Harness','Respirator'])[1+floor(random()*6)],
 (now() - (d || ' days')::interval)::date, (now() + ((180-d) || ' days')::interval)::date,
 'good','issued','تسليم دوري'
FROM generate_series(0,59) d;
