DO $$
DECLARE
    comp_tags text[] := ARRAY['60-1001A', '60-1001B', '60-1001C'];
    tag text;
BEGIN
    FOREACH tag IN ARRAY comp_tags LOOP
        UPDATE public.equipment_identity_cards
        SET 
            description = '[EQUIPMENT FUNCTION]
- Compressor
- Service: Compressed Air
- وظيفته توفير الهواء المضغوط للـAir Receiver 60-2002.

[OPERATING FLOW]
Upstream: Air Intake → Compressor
Downstream: Compressor → 60-2002

[NORMAL OPERATING DATA]
- Operating discharge pressure: approximately 9.1 bar
- Running Hours: Pending Verification
- Loaded Hours: Pending Verification
- Motor Starts: Pending Verification
- Load Cycles: Pending Verification
- Current Load/Unload Status: Pending Verification

[LOAD / UNLOAD OPERATION]
- Loading
- Unloading
- Minimum Stop Time
- Maximum Starts
- Current State: Pending Verification

[START-UP PROCEDURE]
Status: Pending Verification
Manual/DCS field verification required before start-up sequence.

[NORMAL OPERATION]
Monitoring Items:
- Discharge Pressure
- Element Temperatures
- Oil Pressure
- Oil Temperature
- Load/Unload Status
- Running Hours
- Alarms/Trips

[ABNORMAL OPERATION]
Condition | Indication | Immediate Operator Action | Escalation
Pending Verification | Pending Verification | Pending Verification | Pending Verification

[SHUTDOWN]
- Normal Shutdown: Pending Verification
- Emergency Shutdown: Pending Verification
Compressor Operating Manual/SOP verification required.

[SAFETY]
- لا يتم تجاوز Interlock أو Trip.
- لا يتم تغيير Protection Setpoints بدون صلاحية واعتماد.
- لا يتم اعتبار قيم الكتاب بديلة عن إعدادات الموقع الفعلية.

[MAINTENANCE / HOURS]
- Running Hours
- Loaded Hours
- Motor Starts
- Load Cycles
- Service Hours
- Service Schedule: Pending Verification',
            protection_matrix = '{
                "pressure": {
                    "low_pressure_safety_valve": "3.7 bar(e)",
                    "high_pressure_safety_valve": "11 bar(e)",
                    "outlet_pressure_warning": "14.0 bar(e)",
                    "outlet_pressure_shutdown": "15.0 bar(e)",
                    "notes": "Values are Protection/Settings, not Normal Operating Pressure."
                },
                "temperature": {
                    "element_1_outlet": {"warning": "225°C", "shutdown": "235°C"},
                    "element_2_outlet": {"warning": "225°C", "shutdown": "235°C"},
                    "element_2_inlet": {"warning": "65°C", "shutdown": "70°C"},
                    "oil_temperature": {"warning": "65°C", "shutdown": "70°C"},
                    "m1_temperature": "Pending Verification",
                    "m2_temperature": "Pending Verification",
                    "notes": "M1/M2 are not Element 1/2 until verified."
                },
                "oil": {
                    "shutdown_warning": "1.3 bar(e)",
                    "shutdown": "1.2 bar(e)",
                    "start_delay": "15 sec",
                    "signal_delay": "1 sec"
                },
                "motor_starter": {
                    "starter_type": "Pending Verification (YD / DOL)",
                    "notes": "Verify actual starter type from site documentation."
                },
                "alarms_trips": {
                    "categories": ["Warning", "Shutdown Warning", "Shutdown / Trip", "Emergency Stop", "Sensor Failure", "Service Warning"]
                }
            }'::jsonb,
            operating_control = '{
                "load_status": "Pending Verification",
                "min_stop_time": "Pending Verification",
                "max_starts": "Pending Verification",
                "current_state": "Pending Verification"
            }'::jsonb,
            detailed_running_data = '{
                "running_hours": "Pending Verification",
                "loaded_hours": "Pending Verification",
                "motor_starts": "Pending Verification",
                "load_cycles": "Pending Verification",
                "service_hours": "Pending Verification"
            }'::jsonb
        WHERE equipment_tag = tag;
    END LOOP;
END $$;