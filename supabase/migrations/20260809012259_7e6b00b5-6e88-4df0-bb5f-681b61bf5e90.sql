UPDATE public.equipment_identity_cards
SET protection_matrix = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    COALESCE(protection_matrix, '{}'::jsonb),
                    '{pressure_protections}',
                    '[
                      {"label": "Low Pressure Safety Valve", "value": "3.7 bar(e)"},
                      {"label": "High Pressure Safety Valve", "value": "11.0 bar(e)"},
                      {"label": "Compressor Outlet Pressure", "warning": "14.0 bar(e)", "shutdown": "15.0 bar(e)"}
                    ]'::jsonb
                  ),
                  '{temperature_protections}',
                  '[
                    {"label": "Element 1 Outlet Temperature", "warning": "225 °C", "shutdown": "235 °C"},
                    {"label": "Element 2 Outlet Temperature", "warning": "225 °C", "shutdown": "235 °C"},
                    {"label": "Element 2 Inlet Temperature", "warning": "65 °C", "shutdown": "70 °C"},
                    {"label": "Oil Temperature", "warning": "65 °C", "shutdown": "70 °C"}
                  ]'::jsonb
                ),
                '{oil_protections}',
                '[
                  {"label": "Oil Pressure", "warning": "1.3 bar(e)", "shutdown": "1.2 bar(e)"}
                ]'::jsonb
              ),
              '{motor_protections}',
              '[
                {"label": "M1 Temperature", "warning": "Pending Verification", "shutdown": "Pending Verification"},
                {"label": "M2 Temperature", "warning": "Pending Verification", "shutdown": "Pending Verification"}
              ]'::jsonb
            ),
            '{operational_notes}',
            '"M1/M2 are not assumed to correspond to Element 1/2 until verified from the actual local/DCS display."'::jsonb
          ),
          '{element_1_outlet_warning}', '"225 °C"'::jsonb
        ),
        '{element_1_outlet_shutdown}', '"235 °C"'::jsonb
      ),
      '{element_2_outlet_warning}', '"225 °C"'::jsonb
    ),
    '{element_2_outlet_shutdown}', '"235 °C"'::jsonb
  ),
  '{element_2_inlet_warning}', '"65 °C"'::jsonb
)
WHERE equipment_tag IN ('60-1001A', '60-1001B', '60-1001C');