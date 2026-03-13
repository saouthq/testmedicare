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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          arrived_at: string | null
          created_at: string
          created_by: string | null
          date: string
          doctor_id: string | null
          doctor_name: string
          duration: number
          end_time: string
          id: string
          insurance: string | null
          internal_note: string | null
          is_new: boolean | null
          motif: string | null
          notes: string | null
          paid_amount: number | null
          patient_avatar: string | null
          patient_id: number | null
          patient_name: string
          payment_status: string | null
          phone: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          tags: Json | null
          teleconsultation: boolean | null
          type: Database["public"]["Enums"]["appointment_type"]
          updated_at: string
          wait_time: number | null
        }
        Insert: {
          arrived_at?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          doctor_id?: string | null
          doctor_name?: string
          duration?: number
          end_time: string
          id?: string
          insurance?: string | null
          internal_note?: string | null
          is_new?: boolean | null
          motif?: string | null
          notes?: string | null
          paid_amount?: number | null
          patient_avatar?: string | null
          patient_id?: number | null
          patient_name: string
          payment_status?: string | null
          phone?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          tags?: Json | null
          teleconsultation?: boolean | null
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
          wait_time?: number | null
        }
        Update: {
          arrived_at?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          doctor_id?: string | null
          doctor_name?: string
          duration?: number
          end_time?: string
          id?: string
          insurance?: string | null
          internal_note?: string | null
          is_new?: boolean | null
          motif?: string | null
          notes?: string | null
          paid_amount?: number | null
          patient_avatar?: string | null
          patient_id?: number | null
          patient_name?: string
          payment_status?: string | null
          phone?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          tags?: Json | null
          teleconsultation?: boolean | null
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
          wait_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_slots: {
        Row: {
          created_at: string
          date: string
          doctor_id: string
          doctor_name: string | null
          duration: number
          id: string
          reason: string | null
          recurring: boolean | null
          recurring_days: Json | null
          start_time: string
        }
        Insert: {
          created_at?: string
          date: string
          doctor_id: string
          doctor_name?: string | null
          duration?: number
          id?: string
          reason?: string | null
          recurring?: boolean | null
          recurring_days?: Json | null
          start_time: string
        }
        Update: {
          created_at?: string
          date?: string
          doctor_id?: string
          doctor_name?: string | null
          duration?: number
          id?: string
          reason?: string | null
          recurring?: boolean | null
          recurring_days?: Json | null
          start_time?: string
        }
        Relationships: []
      }
      doctor_availability: {
        Row: {
          active: boolean | null
          break_end: string | null
          break_start: string | null
          day_name: string
          doctor_id: string
          end_time: string
          id: string
          slot_duration: number | null
          start_time: string
        }
        Insert: {
          active?: boolean | null
          break_end?: string | null
          break_start?: string | null
          day_name: string
          doctor_id: string
          end_time?: string
          id?: string
          slot_duration?: number | null
          start_time?: string
        }
        Update: {
          active?: boolean | null
          break_end?: string | null
          break_start?: string | null
          day_name?: string
          doctor_id?: string
          end_time?: string
          id?: string
          slot_duration?: number | null
          start_time?: string
        }
        Relationships: []
      }
      doctor_leaves: {
        Row: {
          affected_appointments: number | null
          created_at: string
          doctor_id: string
          doctor_name: string | null
          end_date: string
          id: number
          motif: string | null
          notify_patients: boolean | null
          replacement_doctor: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          type: Database["public"]["Enums"]["leave_type"]
        }
        Insert: {
          affected_appointments?: number | null
          created_at?: string
          doctor_id: string
          doctor_name?: string | null
          end_date: string
          id?: number
          motif?: string | null
          notify_patients?: boolean | null
          replacement_doctor?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          type?: Database["public"]["Enums"]["leave_type"]
        }
        Update: {
          affected_appointments?: number | null
          created_at?: string
          doctor_id?: string
          doctor_name?: string | null
          end_date?: string
          id?: number
          motif?: string | null
          notify_patients?: boolean | null
          replacement_doctor?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          type?: Database["public"]["Enums"]["leave_type"]
        }
        Relationships: []
      }
      lab_demands: {
        Row: {
          amount: string | null
          assurance: string | null
          created_at: string
          date: string
          doctor_id: string
          examens: Json
          id: string
          lab_id: string | null
          notes: string | null
          num_assurance: string | null
          patient_avatar: string | null
          patient_dob: string | null
          patient_id: number | null
          patient_name: string
          pdfs: Json
          prescriber_name: string
          priority: Database["public"]["Enums"]["lab_priority"]
          results_url: string | null
          status: Database["public"]["Enums"]["lab_demand_status"]
          updated_at: string
        }
        Insert: {
          amount?: string | null
          assurance?: string | null
          created_at?: string
          date?: string
          doctor_id: string
          examens?: Json
          id?: string
          lab_id?: string | null
          notes?: string | null
          num_assurance?: string | null
          patient_avatar?: string | null
          patient_dob?: string | null
          patient_id?: number | null
          patient_name?: string
          pdfs?: Json
          prescriber_name?: string
          priority?: Database["public"]["Enums"]["lab_priority"]
          results_url?: string | null
          status?: Database["public"]["Enums"]["lab_demand_status"]
          updated_at?: string
        }
        Update: {
          amount?: string | null
          assurance?: string | null
          created_at?: string
          date?: string
          doctor_id?: string
          examens?: Json
          id?: string
          lab_id?: string | null
          notes?: string | null
          num_assurance?: string | null
          patient_avatar?: string | null
          patient_dob?: string | null
          patient_id?: number | null
          patient_name?: string
          pdfs?: Json
          prescriber_name?: string
          priority?: Database["public"]["Enums"]["lab_priority"]
          results_url?: string | null
          status?: Database["public"]["Enums"]["lab_demand_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_demands_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          allergies: Json | null
          antecedents: Json | null
          avatar: string | null
          balance: number | null
          blood_type: string | null
          created_at: string
          dob: string | null
          email: string | null
          first_name: string
          gouvernorat: string | null
          id: number
          insurance: string | null
          insurance_number: string | null
          last_name: string
          notes: string | null
          phone: string | null
          treating_doctor_id: string | null
          treating_doctor_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          allergies?: Json | null
          antecedents?: Json | null
          avatar?: string | null
          balance?: number | null
          blood_type?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          first_name?: string
          gouvernorat?: string | null
          id?: number
          insurance?: string | null
          insurance_number?: string | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          treating_doctor_id?: string | null
          treating_doctor_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          allergies?: Json | null
          antecedents?: Json | null
          avatar?: string | null
          balance?: number | null
          blood_type?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          first_name?: string
          gouvernorat?: string | null
          id?: number
          insurance?: string | null
          insurance_number?: string | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          treating_doctor_id?: string | null
          treating_doctor_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pharmacy_prescriptions: {
        Row: {
          assurance: string | null
          comment: string | null
          created_at: string
          date: string
          doctor_name: string
          id: string
          items: Json
          patient_avatar: string | null
          patient_name: string
          patient_phone: string | null
          pharmacy_id: string | null
          pickup_time: string | null
          prescription_id: string | null
          status: Database["public"]["Enums"]["pharmacy_rx_status"]
          total: string | null
          updated_at: string
          urgent: boolean | null
        }
        Insert: {
          assurance?: string | null
          comment?: string | null
          created_at?: string
          date?: string
          doctor_name?: string
          id?: string
          items?: Json
          patient_avatar?: string | null
          patient_name?: string
          patient_phone?: string | null
          pharmacy_id?: string | null
          pickup_time?: string | null
          prescription_id?: string | null
          status?: Database["public"]["Enums"]["pharmacy_rx_status"]
          total?: string | null
          updated_at?: string
          urgent?: boolean | null
        }
        Update: {
          assurance?: string | null
          comment?: string | null
          created_at?: string
          date?: string
          doctor_name?: string
          id?: string
          items?: Json
          patient_avatar?: string | null
          patient_name?: string
          patient_phone?: string | null
          pharmacy_id?: string | null
          pickup_time?: string | null
          prescription_id?: string | null
          status?: Database["public"]["Enums"]["pharmacy_rx_status"]
          total?: string | null
          updated_at?: string
          urgent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_prescriptions_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          assurance: string | null
          created_at: string
          date: string
          doctor_id: string
          doctor_name: string
          id: string
          items: Json
          patient_id: number | null
          patient_name: string
          pharmacy: string | null
          sent: boolean | null
          status: Database["public"]["Enums"]["prescription_status"]
          total: string
          updated_at: string
        }
        Insert: {
          assurance?: string | null
          created_at?: string
          date?: string
          doctor_id: string
          doctor_name?: string
          id?: string
          items?: Json
          patient_id?: number | null
          patient_name?: string
          pharmacy?: string | null
          sent?: boolean | null
          status?: Database["public"]["Enums"]["prescription_status"]
          total?: string
          updated_at?: string
        }
        Update: {
          assurance?: string | null
          created_at?: string
          date?: string
          doctor_id?: string
          doctor_name?: string
          id?: string
          items?: Json
          patient_id?: number | null
          patient_name?: string
          pharmacy?: string | null
          sent?: boolean | null
          status?: Database["public"]["Enums"]["prescription_status"]
          total?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assurance_number: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string
          gouvernorat: string | null
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          assurance_number?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          gouvernorat?: string | null
          id: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          assurance_number?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          gouvernorat?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tarifs: {
        Row: {
          active: boolean | null
          code: string
          conventionne: boolean | null
          created_at: string
          doctor_id: string
          duration: number | null
          id: number
          name: string
          price: number
        }
        Insert: {
          active?: boolean | null
          code: string
          conventionne?: boolean | null
          created_at?: string
          doctor_id: string
          duration?: number | null
          id?: number
          name: string
          price?: number
        }
        Update: {
          active?: boolean | null
          code?: string
          conventionne?: boolean | null
          created_at?: string
          doctor_id?: string
          duration?: number | null
          id?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "patient"
        | "doctor"
        | "pharmacy"
        | "laboratory"
        | "secretary"
        | "admin"
        | "hospital"
        | "clinic"
      appointment_status:
        | "pending"
        | "confirmed"
        | "arrived"
        | "in_waiting"
        | "in_progress"
        | "done"
        | "cancelled"
        | "absent"
      appointment_type:
        | "consultation"
        | "suivi"
        | "premiere_visite"
        | "controle"
        | "teleconsultation"
        | "urgence"
      lab_demand_status:
        | "received"
        | "in_progress"
        | "results_ready"
        | "transmitted"
      lab_priority: "normal" | "urgent"
      leave_status: "upcoming" | "active" | "past"
      leave_type: "conge" | "formation" | "maladie" | "personnel"
      pharmacy_rx_status:
        | "received"
        | "preparing"
        | "ready_pickup"
        | "dispensed"
        | "unavailable"
        | "cancelled"
      prescription_status: "active" | "expired"
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
        "patient",
        "doctor",
        "pharmacy",
        "laboratory",
        "secretary",
        "admin",
        "hospital",
        "clinic",
      ],
      appointment_status: [
        "pending",
        "confirmed",
        "arrived",
        "in_waiting",
        "in_progress",
        "done",
        "cancelled",
        "absent",
      ],
      appointment_type: [
        "consultation",
        "suivi",
        "premiere_visite",
        "controle",
        "teleconsultation",
        "urgence",
      ],
      lab_demand_status: [
        "received",
        "in_progress",
        "results_ready",
        "transmitted",
      ],
      lab_priority: ["normal", "urgent"],
      leave_status: ["upcoming", "active", "past"],
      leave_type: ["conge", "formation", "maladie", "personnel"],
      pharmacy_rx_status: [
        "received",
        "preparing",
        "ready_pickup",
        "dispensed",
        "unavailable",
        "cancelled",
      ],
      prescription_status: ["active", "expired"],
    },
  },
} as const
