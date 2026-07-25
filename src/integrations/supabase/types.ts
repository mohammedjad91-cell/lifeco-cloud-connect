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
      areas: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          plant_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          plant_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          plant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
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
      emergency_points: {
        Row: {
          created_at: string
          id: string
          label: string
          notes: string | null
          plant_code: string
          point_type: string
          x_pct: number
          y_pct: number
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          notes?: string | null
          plant_code?: string
          point_type: string
          x_pct: number
          y_pct: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          notes?: string | null
          plant_code?: string
          point_type?: string
          x_pct?: number
          y_pct?: number
        }
        Relationships: []
      }
      equipment: {
        Row: {
          area_id: string
          created_at: string
          criticality: string | null
          description: string | null
          id: string
          name: string
          tag: string
          type: string | null
        }
        Insert: {
          area_id: string
          created_at?: string
          criticality?: string | null
          description?: string | null
          id?: string
          name: string
          tag: string
          type?: string | null
        }
        Update: {
          area_id?: string
          created_at?: string
          criticality?: string | null
          description?: string | null
          id?: string
          name?: string
          tag?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_assets: {
        Row: {
          asset_code: string
          asset_name: string
          created_at: string
          criticality: string
          department: string
          id: string
          image_url: string | null
          install_year: number | null
          is_custom: boolean
          last_maintenance_at: string | null
          location: string | null
          manufacturer: string | null
          next_maintenance_at: string | null
          plant_code: string | null
          running_hours: number
          status: string
          tag: string | null
        }
        Insert: {
          asset_code: string
          asset_name: string
          created_at?: string
          criticality?: string
          department: string
          id?: string
          image_url?: string | null
          install_year?: number | null
          is_custom?: boolean
          last_maintenance_at?: string | null
          location?: string | null
          manufacturer?: string | null
          next_maintenance_at?: string | null
          plant_code?: string | null
          running_hours?: number
          status?: string
          tag?: string | null
        }
        Update: {
          asset_code?: string
          asset_name?: string
          created_at?: string
          criticality?: string
          department?: string
          id?: string
          image_url?: string | null
          install_year?: number | null
          is_custom?: boolean
          last_maintenance_at?: string | null
          location?: string | null
          manufacturer?: string | null
          next_maintenance_at?: string | null
          plant_code?: string | null
          running_hours?: number
          status?: string
          tag?: string | null
        }
        Relationships: []
      }
      equipment_docs: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          kind: string
          label: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          kind: string
          label?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          kind?: string
          label?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_docs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_spares: {
        Row: {
          equipment_id: string
          qty_required: number
          spare_id: string
        }
        Insert: {
          equipment_id: string
          qty_required?: number
          spare_id: string
        }
        Update: {
          equipment_id?: string
          qty_required?: number
          spare_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_spares_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_spares_spare_id_fkey"
            columns: ["spare_id"]
            isOneToOne: false
            referencedRelation: "spare_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_photos: {
        Row: {
          caption: string | null
          created_at: string
          execution_id: string
          id: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          execution_id: string
          id?: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          execution_id?: string
          id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_photos_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "maintenance_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_spares: {
        Row: {
          execution_id: string
          id: string
          qty_used: number
          spare_id: string
        }
        Insert: {
          execution_id: string
          id?: string
          qty_used?: number
          spare_id: string
        }
        Update: {
          execution_id?: string
          id?: string
          qty_used?: number
          spare_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_spares_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "maintenance_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_spares_spare_id_fkey"
            columns: ["spare_id"]
            isOneToOne: false
            referencedRelation: "spare_parts"
            referencedColumns: ["id"]
          },
        ]
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
          pdf_url: string | null
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
          pdf_url?: string | null
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
          pdf_url?: string | null
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
      maintenance_executions: {
        Row: {
          ended_at: string | null
          executed_by: string | null
          id: string
          notes: string | null
          request_id: string
          started_at: string
        }
        Insert: {
          ended_at?: string | null
          executed_by?: string | null
          id?: string
          notes?: string | null
          request_id: string
          started_at?: string
        }
        Update: {
          ended_at?: string | null
          executed_by?: string | null
          id?: string
          notes?: string | null
          request_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_executions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          after_photo: string | null
          asset_id: string
          before_photo: string | null
          cost_labor: number
          cost_parts: number
          failure_cause: string | null
          hours: number
          id: string
          notes: string
          recorded_at: string
          recorded_by: string | null
          technician: string | null
          type: string
        }
        Insert: {
          after_photo?: string | null
          asset_id: string
          before_photo?: string | null
          cost_labor?: number
          cost_parts?: number
          failure_cause?: string | null
          hours?: number
          id?: string
          notes: string
          recorded_at?: string
          recorded_by?: string | null
          technician?: string | null
          type?: string
        }
        Update: {
          after_photo?: string | null
          asset_id?: string
          before_photo?: string | null
          cost_labor?: number
          cost_parts?: number
          failure_cause?: string | null
          hours?: number
          id?: string
          notes?: string
          recorded_at?: string
          recorded_by?: string | null
          technician?: string | null
          type?: string
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
      maintenance_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          equipment_id: string
          id: string
          priority: string
          requested_by: string | null
          status: Database["public"]["Enums"]["mreq_status"]
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          equipment_id: string
          id?: string
          priority?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["mreq_status"]
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: string
          id?: string
          priority?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["mreq_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      material_issues: {
        Row: {
          id: string
          issued_at: string
          issued_by: string | null
          qty: number
          request_id: string | null
          spare_id: string
        }
        Insert: {
          id?: string
          issued_at?: string
          issued_by?: string | null
          qty: number
          request_id?: string | null
          spare_id: string
        }
        Update: {
          id?: string
          issued_at?: string
          issued_by?: string | null
          qty?: number
          request_id?: string | null
          spare_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_issues_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_issues_spare_id_fkey"
            columns: ["spare_id"]
            isOneToOne: false
            referencedRelation: "spare_parts"
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
      plants: {
        Row: {
          code: string | null
          created_at: string
          department_key: string
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          department_key: string
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          department_key?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ppe_issuances: {
        Row: {
          condition: string | null
          created_at: string
          department: string | null
          employee_id: string
          employee_name: string
          id: string
          issued_at: string
          notes: string | null
          ppe_type: string
          replacement_due: string | null
          status: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string
          department?: string | null
          employee_id: string
          employee_name: string
          id?: string
          issued_at?: string
          notes?: string | null
          ppe_type: string
          replacement_due?: string | null
          status?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string
          department?: string | null
          employee_id?: string
          employee_name?: string
          id?: string
          issued_at?: string
          notes?: string | null
          ppe_type?: string
          replacement_due?: string | null
          status?: string | null
        }
        Relationships: []
      }
      safety_incidents: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          corrective_action: string | null
          created_at: string
          description: string | null
          entry_type: string
          id: string
          incident_no: string
          location: string | null
          photo_url: string | null
          plant_code: string | null
          reported_by: string | null
          severity: string
          status: string
          suggested_action: string | null
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          corrective_action?: string | null
          created_at?: string
          description?: string | null
          entry_type?: string
          id?: string
          incident_no?: string
          location?: string | null
          photo_url?: string | null
          plant_code?: string | null
          reported_by?: string | null
          severity?: string
          status?: string
          suggested_action?: string | null
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          corrective_action?: string | null
          created_at?: string
          description?: string | null
          entry_type?: string
          id?: string
          incident_no?: string
          location?: string | null
          photo_url?: string | null
          plant_code?: string | null
          reported_by?: string | null
          severity?: string
          status?: string
          suggested_action?: string | null
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
      spare_parts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          min_qty: number
          name: string
          part_no: string
          stock_qty: number
          uom: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          min_qty?: number
          name: string
          part_no: string
          stock_qty?: number
          uom?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          min_qty?: number
          name?: string
          part_no?: string
          stock_qty?: number
          uom?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          department_key: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          department_key?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          department_key?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_permits: {
        Row: {
          closed_at: string | null
          controls: string | null
          created_at: string
          description: string | null
          end_at: string | null
          hazards: string | null
          hse_approved_at: string | null
          hse_approved_by: string | null
          hse_officer: string | null
          id: string
          location: string | null
          permit_no: string
          permit_type: string
          plant_code: string | null
          rejected_reason: string | null
          requested_by: string | null
          start_at: string | null
          status: string
          supervisor: string | null
          supervisor_approved_at: string | null
          supervisor_approved_by: string | null
          workers_count: number | null
        }
        Insert: {
          closed_at?: string | null
          controls?: string | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          hazards?: string | null
          hse_approved_at?: string | null
          hse_approved_by?: string | null
          hse_officer?: string | null
          id?: string
          location?: string | null
          permit_no?: string
          permit_type: string
          plant_code?: string | null
          rejected_reason?: string | null
          requested_by?: string | null
          start_at?: string | null
          status?: string
          supervisor?: string | null
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          workers_count?: number | null
        }
        Update: {
          closed_at?: string | null
          controls?: string | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          hazards?: string | null
          hse_approved_at?: string | null
          hse_approved_by?: string | null
          hse_officer?: string | null
          id?: string
          location?: string | null
          permit_no?: string
          permit_type?: string
          plant_code?: string | null
          rejected_reason?: string | null
          requested_by?: string | null
          start_at?: string | null
          status?: string
          supervisor?: string | null
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          workers_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"]; _uid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_developer"
        | "administrator"
        | "department_manager"
        | "plant_manager"
        | "engineer"
        | "technician"
        | "operator"
        | "viewer"
      mreq_status:
        | "draft"
        | "pending"
        | "approved"
        | "in_progress"
        | "done"
        | "rejected"
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
    Enums: {
      app_role: [
        "super_developer",
        "administrator",
        "department_manager",
        "plant_manager",
        "engineer",
        "technician",
        "operator",
        "viewer",
      ],
      mreq_status: [
        "draft",
        "pending",
        "approved",
        "in_progress",
        "done",
        "rejected",
      ],
    },
  },
} as const
