-- First ensure the tag is correct in equipment_assets for the asset linked to 60-2202
UPDATE public.equipment_assets 
SET 
    tag = '60-2202',
    asset_name = 'Dryer',
    status = 'Pending Verification'
WHERE id = '3036b071-7074-4139-85fc-00d2d9661bbb';

-- Update equipment_identity_cards for 60-2202
UPDATE public.equipment_identity_cards 
SET 
    model = 'BD 1100 ZP',
    description = '[FUNCTION]
- Compressed Air Drying to achieve required Pressure Dew Point.
- Source: Atlas Copco Dryers BD 1100 ZP (Parts List No. 2930 1736 00 / DC 2012.06).

[PROCESS FLOW]
60-2002 Air Receiver → 60-2202 Dryer → 60-2003 Air Receiver

[VESSEL CONFIGURATION]
- Vessel Count: 2 (Vessel 1, Vessel 2)
- Note: Specific tag identification for Vessels is Pending Verification.

[EQUIPMENT COMPONENTS]
(Based on Parts List configuration)
- Pressure vessels
- Check valves
- Butterfly valves
- Valve actuators
- Valve position indicators
- Limit switches
- Solenoid valves
- Heater
- Blower
- Safety valves

[INSTRUMENTATION]
- Control panel / Elektronikon
- Pressure transducers
- Manometers
- Pressure regulator
- Pressure Dew Point control

[OPERATING FUNCTIONS]
- Drying: Pending Verification
- Regeneration: Pending Verification
- Vessel Switching: Pending Verification
- Cooling: Pending Verification
- Purge / Zero Purge: Pending Verification

[DRYING / REGENERATION STATUS]
- Active Vessel: Pending Verification
- Regenerating Vessel: Pending Verification
- Cycle Status: Pending Verification

[RUNNING DATA]
- Dew Point: Pending Verification
- Inlet Pressure: Pending Verification
- Outlet Pressure: Pending Verification
- Differential Pressure: Pending Verification
- Temperatures: Pending Verification

[OPERATING PROCEDURES]
- Start-up: Pending Verification / Operating Manual Required
- Normal Operation: Pending Verification / Operating Manual Required
- Shutdown: Pending Verification / Operating Manual Required

[ALARMS / TRIPS / INTERLOCKS]
- Alarms: Pending Verification
- Trips: Pending Verification
- Interlocks: Pending Verification
- Note: Safety Valves, Pressure Instrumentation, and Valve Position/Limit Switches are critical components for protection.

[MAINTENANCE]
- Maintenance Status: Pending Verification
- Operating Manual Required for detailed maintenance sequences.',
    protection_matrix = '{
        "protection": {
            "safety_valves": "Included (Parts List)",
            "pressure_instrumentation": "Included (Parts List)",
            "valve_position_switches": "Included (Parts List)",
            "limit_switches": "Included (Parts List)"
        },
        "monitoring": {
            "dew_point": "Pending Verification",
            "inlet_pressure": "Pending Verification",
            "outlet_pressure": "Pending Verification",
            "differential_pressure": "Pending Verification",
            "vessel_temperatures": "Pending Verification"
        }
    }'::jsonb,
    operating_control = '{
        "vessel_count": 2,
        "configuration": "Desiccant Dryer",
        "regeneration_type": "Pending Verification (Heated Blower Purge implied by model BD ZP)",
        "purge_type": "Pending Verification",
        "control_system": "Elektronikon"
    }'::jsonb,
    detailed_running_data = '{
        "components": [
            "Heater",
            "Blower",
            "Butterfly valves",
            "Check valves",
            "Solenoid valves"
        ]
    }'::jsonb,
    safety_notes = 'Safety Valves and Pressure Instrumentation are components of the system. Do not bypass interlocks. Operating Manual (SOP) is required for sequence verification.',
    upstream = '60-2002 Air Receiver',
    downstream = '60-2003 Air Receiver',
    updated_at = NOW()
WHERE asset_id = '3036b071-7074-4139-85fc-00d2d9661bbb';