
UPDATE public.equipment_identity_cards
SET protection_matrix = '{
  "pressure": {
    "local_operating_pressure": "9.1 bar",
    "safety_valve_low_opening": "3.7 bar(e)",
    "safety_valve_high_opening": "11 bar(e)",
    "outlet_pressure_warning": {"factory": "14.0 bar(e)", "max": "17.0 bar(e)"},
    "outlet_pressure_shutdown": {"factory": "15.0 bar(e)", "max": "17.0 bar(e)"}
  },
  "temperature": {
    "element_1_outlet_warning": {"factory": "225°C", "max": "235°C"},
    "element_1_outlet_shutdown": {"factory": "235°C", "max": "235°C"},
    "element_2_outlet_warning": {"factory": "225°C", "max": "235°C"},
    "element_2_outlet_shutdown": {"factory": "235°C", "max": "235°C"},
    "element_2_inlet_warning": {"factory": "65°C", "max": "80°C"},
    "element_2_inlet_shutdown": {"factory": "70°C", "max": "80°C"}
  },
  "oil": {
    "pressure_shutdown_warning": {"factory": "1.3 bar(e)", "max": "1.9 bar(e)"},
    "pressure_shutdown": {"factory": "1.2 bar(e)", "max": "1.9 bar(e)"},
    "pressure_delay_start": "15 seconds",
    "pressure_delay_signal": "1 second",
    "temperature_warning": {"factory": "65°C", "max": "80°C"},
    "temperature_shutdown": {"factory": "70°C", "max": "80°C"},
    "temperature_delay_start": "70 seconds"
  },
  "motor_starter": {
    "yd_starter": {
      "overload_delay_start": "1 second",
      "overload_delay_signal": "1 second"
    },
    "dol_starter": {
      "overload_delay_start": "0 seconds",
      "overload_delay_signal": "0 seconds"
    },
    "starter_feedback": {
      "shutdown_delay_start": {"factory": "18 seconds"},
      "shutdown_delay_signal": {"factory": "2 seconds"}
    }
  },
  "electronic_drain": {
    "warning_delay_start": "15 seconds",
    "warning_delay_signal": "5 seconds"
  }
}'::jsonb,
operating_control = '{
  "loading_pressure": "Pending Verification",
  "unloading_pressure": "Pending Verification",
  "minimum_stop_time": "Pending Verification",
  "maximum_starts_per_hour": "Pending Verification",
  "current_status": "Pending Verification"
}'::jsonb,
detailed_running_data = '{
  "running_hours": "Pending Verification",
  "loaded_hours": "Pending Verification",
  "motor_starts": "Pending Verification",
  "regulator_hours": "Pending Verification",
  "load_cycles": "Pending Verification",
  "service_hours": "Pending Verification"
}'::jsonb
WHERE equipment_tag IN ('60-1001A', '60-1001B', '60-1001C');
