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
                    '{temperature_protections}',
                    '[
                      {"label": "Element 1 Outlet Warning", "value": "225 °C"},
                      {"label": "Element 1 Outlet Shutdown", "value": "235 °C"},
                      {"label": "Element 2 Outlet Warning", "value": "225 °C"},
                      {"label": "Element 2 Outlet Shutdown", "value": "235 °C"},
                      {"label": "Element 2 Inlet Warning", "value": "65 °C"},
                      {"label": "Element 2 Inlet Shutdown", "value": "70 °C"},
                      {"label": "Oil Temperature Warning", "value": "65 °C"},
                      {"label": "Oil Temperature Shutdown", "value": "70 °C"},
                      {"label": "M1 Temperature Warning", "value": "Pending Verification"},
                      {"label": "M1 Temperature Shutdown", "value": "Pending Verification"},
                      {"label": "M2 Temperature Warning", "value": "Pending Verification"},
                      {"label": "M2 Temperature Shutdown", "value": "Pending Verification"}
                    ]'::jsonb
                  ),
                  '{operational_notes}',
                  '"M1/M2 are not assumed to correspond to Element 1/2 until verified from the actual local/DCS display."'::jsonb
                ),
                '{pressure_protections}',
                '[
                  {"label": "Outlet Warning", "value": "14.0 bar(e)"},
                  {"label": "Outlet Shutdown", "value": "15.0 bar(e)"},
                  {"label": "High Pressure Safety Valve", "value": "11.0 bar(e)"}
                ]'::jsonb
              ),
              '{oil_protections}',
              '[
                {"label": "Oil Pressure Warning", "value": "1.3 bar(e)"},
                {"label": "Oil Pressure Shutdown", "value": "1.2 bar(e)"},
                {"label": "Oil Temperature Warning", "value": "65 °C"},
                {"label": "Oil Temperature Shutdown", "value": "70 °C"}
              ]'::jsonb
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