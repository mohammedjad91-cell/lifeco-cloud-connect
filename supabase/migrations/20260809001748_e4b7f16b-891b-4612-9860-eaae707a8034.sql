UPDATE public.equipment_identity_cards
SET 
    description = '[FUNCTION]
- استقبال الهواء المضغوط من 60-1001A/B/C.
- تخزين الهواء كـBuffer.
- تغذية منظومة التجفيف 60-2201/60-2202.
- المساعدة في استقرار تدفق وضغط الهواء بين الضواغط والـDryers.

[PROCESS FLOW]
60-1001A/B/C → 60-2002 → 60-2201 / 60-2202

[OPERATING DATA]
- Operating Pressure: approximately 9.1 bar
- Capacity: Pending Verification
- Design Pressure: Pending Verification
- Operating Temperature: Pending Verification
- Safety Valve Setting: Pending Verification

[NORMAL OPERATION]
- يعمل الخزان كـBuffer/Receiver ولا يقوم بضغط الهواء بنفسه.
- يراقب المشغل استقرار الضغط، حالة الضواغط upstream، حالة الـDryers downstream، وأي Alarm أو Safety indication.

[ABNORMAL CONDITIONS]
Condition | Indication | Operator Action | Escalation
Pending Verification | Pending Verification | Pending Verification | Pending Verification

[SAFETY]
- لا يتم تجاوز Safety Valve.
- لا يتم تغيير Pressure Protection Settings بدون اعتماد.
- لا يتم عزل الخزان أثناء التشغيل إلا وفق إجراء معتمد.
- أي أعمال صيانة تتطلب عزل وضمان خلو الضغط وفق SOP الموقع.

[MAINTENANCE / INSPECTION]
- Inspection Date: Pending Verification
- Next Inspection: Pending Verification
- Thickness: Pending Verification
- Safety Valve Inspection: Pending Verification
- Drain Inspection: Pending Verification
- Maintenance Status: Pending Verification',
    protection_matrix = '{
        "monitoring": {
            "pressure": "Pending Verification",
            "temperature": "Pending Verification",
            "high_pressure_alarm": "Pending Verification",
            "low_pressure_alarm": "Pending Verification",
            "safety_valve_status": "Pending Verification",
            "drain_condensate_status": "Pending Verification",
            "inspection_status": "Pending Verification"
        }
    }'::jsonb,
    operating_control = '{
        "operating_pressure": "approximately 9.1 bar",
        "capacity": "Pending Verification",
        "design_pressure": "Pending Verification"
    }'::jsonb
WHERE equipment_tag = '60-2002';