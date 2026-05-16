export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          department: string | null
          details: string | null
          id: string
        }
        Insert: {
          action: string
          created_at?: string
          department?: string | null
          details?: string | null
          id?: string
        }
        Update: {
          action?: string
          created_at?: string
          department?: string | null
          details?: string | null
          id?: string
        }
        Relationships: []
      }
      department_pins: {
        Row: {
          id: string
          label: string
          pin: string
          updated_at: string
        }
        Insert: {
          id: string
          label: string
          pin: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          pin?: string
          updated_at?: string
        }
        Relationships: []
      }
      dynamic_fields: {
        Row: {
          created_at: string
          department: string | null
          dropdown_options: Json | null
          field_label: string
          field_name: string
          field_type: string
          id: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          created_at?: string
          department?: string | null
          dropdown_options?: Json | null
          field_label: string
          field_name: string
          field_type?: string
          id?: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          created_at?: string
          department?: string | null
          dropdown_options?: Json | null
          field_label?: string
          field_name?: string
          field_type?: string
          id?: string
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      equipment_assets: {
        Row: {
          asset_code: string
          asset_name: string
          created_at: string
          department: string
          id: string
          is_custom: boolean
        }
        Insert: {
          asset_code: string
          asset_name: string
          created_at?: string
          department: string
          id?: string
          is_custom?: boolean
        }
        Update: {
          asset_code?: string
          asset_name?: string
          created_at?: string
          department?: string
          id?: string
          is_custom?: boolean
        }
        Relationships: []
      }
      field_ops_logs: {
        Row: {
          created_at: string
          department: string
          discharge_pressure: number | null
          dynamic_data: Json
          employee_id: string | null
          equipment_tag: string
          id: string
          notes: string | null
          photo_url: string | null
          recorded_by: string | null
          running_hours: number | null
          technician_name: string | null
          temperature: number | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          department: string
          discharge_pressure?: number | null
          dynamic_data?: Json
          employee_id?: string | null
          equipment_tag: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          recorded_by?: string | null
          running_hours?: number | null
          technician_name?: string | null
          temperature?: number | null
          timestamp?: string
        }
        Update: {
          created_at?: string
          department?: string
          discharge_pressure?: number | null
          dynamic_data?: Json
          employee_id?: string | null
          equipment_tag?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          recorded_by?: string | null
          running_hours?: number | null
          technician_name?: string | null
          temperature?: number | null
          timestamp?: string
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          parameter_name: string
          plant: string
          sample_type: string
          technician_name: string
          timestamp: string
          value: number
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          parameter_name: string
          plant: string
          sample_type: string
          technician_name: string
          timestamp?: string
          value: number
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          parameter_name?: string
          plant?: string
          sample_type?: string
          technician_name?: string
          timestamp?: string
          value?: number
        }
        Relationships: []
      }
      locked_dates: {
        Row: {
          id: string
          locked_at: string
          locked_by: string
          locked_date: string
        }
        Insert: {
          id?: string
          locked_at?: string
          locked_by?: string
          locked_date: string
        }
        Update: {
          id?: string
          locked_at?: string
          locked_by?: string
          locked_date?: string
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          asset_id: string
          id: string
          notes: string
          recorded_at: string
          recorded_by: string | null
        }
        Insert: {
          asset_id: string
          id?: string
          notes: string
          recorded_at?: string
          recorded_by?: string | null
        }
        Update: {
          asset_id?: string
          id?: string
          notes?: string
          recorded_at?: string
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "equipment_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      operations_logs: {
        Row: {
          created_at: string
          department: string
          employee_id: string | null
          id: string
          timestamp: string
          unit_tag: string
          value: number
        }
        Insert: {
          created_at?: string
          department: string
          employee_id?: string | null
          id?: string
          timestamp?: string
          unit_tag: string
          value: number
        }
        Update: {
          created_at?: string
          department?: string
          employee_id?: string | null
          id?: string
          timestamp?: string
          unit_tag?: string
          value?: number
        }
        Relationships: []
      }
      samples: {
        Row: {
          analysis_type: string
          created_at: string
          department: string
          dynamic_data: Json
          employee_id: string
          id: string
          notes: string | null
          sample_date: string
          sample_name: string
          status: string
          technician_name: string
          updated_at: string
        }
        Insert: {
          analysis_type?: string
          created_at?: string
          department: string
          dynamic_data?: Json
          employee_id: string
          id?: string
          notes?: string | null
          sample_date?: string
          sample_name: string
          status?: string
          technician_name: string
          updated_at?: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          department?: string
          dynamic_data?: Json
          employee_id?: string
          id?: string
          notes?: string | null
          sample_date?: string
          sample_name?: string
          status?: string
          technician_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
