-- Update equipment_assets status for 60-2003
UPDATE public.equipment_assets 
SET 
    status = 'Pending Verification'
WHERE tag = '60-2003';

-- Update equipment_identity_cards for 60-2003
UPDATE public.equipment_identity_cards 
SET 
    description = '[FUNCTION]
- Air Receiver / Buffer for dried compressed air.
- Receives air from 60-2201 / 60-2202.
- Acts as a distribution vessel for Instrument Air and Nitrogen Generation.

[PROCESS FLOW]
60-2201 / 60-2202 → 60-2003
↓
┌─────────────────┴──────────────────┐
↓                                    ↓
INSTRUMENT AIR               NITROGEN GENERATION
(Critical Continuous)        (Pending Equipment ID)
├── Ammonia Plant 1
├── Ammonia Plant 2
└── Ammonia Storage

[CRITICAL INSTRUMENT AIR SERVICE]
Classification: Critical Continuous Service
Critical Consumers:
- Ammonia Plant 1
- Ammonia Plant 2
- Ammonia Storage

[OPERATING RULES & CONSEQUENCES]
- Rule: Instrument Air is a critical continuous service and must remain available for critical consumers.
- Rule: Connections shall not be treated as normal isolatable services during operation.
- Consequence: Loss of Instrument Air may affect ammonia plant operation and storage controls.

[NORMAL OPERATION]
- 60-2003 receives dried air and acts as a buffer.
- Continuous distribution to critical consumers is the primary priority.

[ABNORMAL OPERATION]
- Low Pressure / Deviation: Pending Verification / Operating Manual Required.
- Emergency Sequences: Pending Verification.

[MONITORING DATA]
- Receiver Pressure: Pending Verification
- Operating Status: Pending Verification
- Upstream Dryer Status: Pending Verification
- Instrument Air Availability: YES (Continuous Monitoring Required)
- Critical Consumer Status: Pending Verification
- Nitrogen Generation Status: Pending Equipment Identification

[SAFETY]
- No isolation of Instrument Air to critical consumers without an approved procedure.
- No bypassing of Interlocks or Protection systems.
- No modification of Setpoints without authorized approval.

[MAINTENANCE / INSPECTION]
- Inspection Date: Pending Verification
- Next Inspection: Pending Verification
- Thickness: Pending Verification
- Safety Valve Inspection: Pending Verification
- Maintenance Status: Pending Verification',
    protection_matrix = '{
        "critical_service": {
            "instrument_air": "Critical Continuous",
            "safety_rule": "No isolation without approved procedure"
        },
        "alarms": "Pending Verification",
        "trips": "Pending Verification",
        "interlocks": "Pending Verification"
    }'::jsonb,
    operating_control = '{
        "upstream": ["60-2201", "60-2202"],
        "downstream": {
            "instrument_air": ["Ammonia Plant 1", "Ammonia Plant 2", "Ammonia Storage"],
            "nitrogen_generation": "Pending Equipment Identification"
        },
        "service_classification": "Critical Continuous Buffer"
    }'::jsonb,
    detailed_running_data = '{
        "monitoring_points": [
            "Receiver Pressure",
            "Upstream Dryer Status",
            "Instrument Air Availability",
            "Critical Consumer Supply"
        ]
    }'::jsonb,
    updated_at = NOW()
WHERE asset_id = '3d485734-77a0-4c2f-b618-4cba18658e59';