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
                    '{pressure}',
                    '{
                      "low_pressure_safety_valve": "3.7 bar(e)",
                      "high_pressure_safety_valve": "11.0 bar(e)",
                      "outlet_pressure_warning": "14.0 bar(e)",
                      "outlet_pressure_shutdown": "15.0 bar(e)"
                    }'::jsonb
                  ),
                  '{temperature}',
                  '{
                    "element_1_outlet": {"warning": "225 °C", "shutdown": "235 °C"},
                    "element_2_outlet": {"warning": "225 °C", "shutdown": "235 °C"},
                    "element_2_inlet": {"warning": "65 °C", "shutdown": "70 °C"},
                    "oil_temperature": {"warning": "65 °C", "shutdown": "70 °C"},
                    "m1_temperature": {"warning": "Pending Verification", "shutdown": "Pending Verification"},
                    "m2_temperature": {"warning": "Pending Verification", "shutdown": "Pending Verification"}
                  }'::jsonb
                ),
                '{oil}',
                '{
                  "shutdown_warning": "1.3 bar(e)",
                  "shutdown": "1.2 bar(e)"
                }'::jsonb
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
  ),
  '{element_2_inlet_shutdown}', '"70 °C"'::jsonb
)
WHERE equipment_tag IN ('60-1001A', '60-1001B', '60-1001C');