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
      admin_config: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
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
      cabinet_members: {
        Row: {
          cabinet_id: string
          created_at: string
          id: string
          joined_at: string | null
          last_login: string | null
          permissions: Json | null
          role: string
          status: string
          user_email: string | null
          user_id: string
          user_name: string
          user_phone: string | null
        }
        Insert: {
          cabinet_id: string
          created_at?: string
          id?: string
          joined_at?: string | null
          last_login?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          user_email?: string | null
          user_id: string
          user_name?: string
          user_phone?: string | null
        }
        Update: {
          cabinet_id?: string
          created_at?: string
          id?: string
          joined_at?: string | null
          last_login?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          user_email?: string | null
          user_id?: string
          user_name?: string
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cabinet_members_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets"
            referencedColumns: ["id"]
          },
        ]
      }
      cabinets: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      call_log: {
        Row: {
          call_type: string
          caller: string
          created_at: string
          date: string | null
          doctor_id: string
          duration: string | null
          follow_up: string | null
          handled: boolean | null
          id: number
          motif: string | null
          note: string | null
          phone: string | null
          priority: boolean | null
          time: string | null
        }
        Insert: {
          call_type?: string
          caller?: string
          created_at?: string
          date?: string | null
          doctor_id: string
          duration?: string | null
          follow_up?: string | null
          handled?: boolean | null
          id?: never
          motif?: string | null
          note?: string | null
          phone?: string | null
          priority?: boolean | null
          time?: string | null
        }
        Update: {
          call_type?: string
          caller?: string
          created_at?: string
          date?: string | null
          doctor_id?: string
          duration?: string | null
          follow_up?: string | null
          handled?: boolean | null
          id?: never
          motif?: string | null
          note?: string | null
          phone?: string | null
          priority?: boolean | null
          time?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          open_rate: number | null
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string | null
          target: string | null
          type: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          open_rate?: number | null
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string | null
          target?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          open_rate?: number | null
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string | null
          target?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          sender_name: string | null
          text: string
          thread_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          sender_name?: string | null
          text?: string
          thread_id: string
        }
        Update: {
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          sender_name?: string | null
          text?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          accepts_messages: boolean | null
          category: string | null
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          participant_a_avatar: string | null
          participant_a_id: string
          participant_a_name: string
          participant_a_role: string | null
          participant_b_avatar: string | null
          participant_b_id: string
          participant_b_name: string
          participant_b_role: string | null
          unread_a: number | null
          unread_b: number | null
        }
        Insert: {
          accepts_messages?: boolean | null
          category?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          participant_a_avatar?: string | null
          participant_a_id?: string
          participant_a_name?: string
          participant_a_role?: string | null
          participant_b_avatar?: string | null
          participant_b_id?: string
          participant_b_name?: string
          participant_b_role?: string | null
          unread_a?: number | null
          unread_b?: number | null
        }
        Update: {
          accepts_messages?: boolean | null
          category?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          participant_a_avatar?: string | null
          participant_a_id?: string
          participant_a_name?: string
          participant_a_role?: string | null
          participant_b_avatar?: string | null
          participant_b_id?: string
          participant_b_name?: string
          participant_b_role?: string | null
          unread_a?: number | null
          unread_b?: number | null
        }
        Relationships: []
      }
      clinics_directory: {
        Row: {
          address: string | null
          city: string
          created_at: string
          doctors_count: number | null
          email: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          rating: number | null
          services: Json | null
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          city?: string
          created_at?: string
          doctors_count?: number | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          services?: Json | null
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          doctors_count?: number | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          services?: Json | null
          verified?: boolean | null
        }
        Relationships: []
      }
      consultation_vitals: {
        Row: {
          consultation_id: string
          created_at: string
          id: number
          label: string
          unit: string | null
          value: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          id?: never
          label?: string
          unit?: string | null
          value?: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          id?: never
          label?: string
          unit?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_vitals_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          appointment_id: string | null
          care_plan: string | null
          conclusion: string | null
          created_at: string
          date: string
          diagnosis: string | null
          doctor_id: string
          doctor_name: string
          duration_minutes: number | null
          examination: string | null
          id: string
          motif: string | null
          notes: string | null
          patient_id: number | null
          patient_name: string
          specialty: string | null
          status: string
          symptoms: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          care_plan?: string | null
          conclusion?: string | null
          created_at?: string
          date?: string
          diagnosis?: string | null
          doctor_id: string
          doctor_name?: string
          duration_minutes?: number | null
          examination?: string | null
          id?: string
          motif?: string | null
          notes?: string | null
          patient_id?: number | null
          patient_name?: string
          specialty?: string | null
          status?: string
          symptoms?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          care_plan?: string | null
          conclusion?: string | null
          created_at?: string
          date?: string
          diagnosis?: string | null
          doctor_id?: string
          doctor_name?: string
          duration_minutes?: number | null
          examination?: string | null
          id?: string
          motif?: string | null
          notes?: string | null
          patient_id?: number | null
          patient_name?: string
          specialty?: string | null
          status?: string
          symptoms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
      doctor_documents: {
        Row: {
          category: string
          content: string | null
          created_at: string
          doctor_id: string
          id: number
          last_used: string | null
          name: string
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          doctor_id: string
          id?: never
          last_used?: string | null
          name?: string
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          doctor_id?: string
          id?: never
          last_used?: string | null
          name?: string
          usage_count?: number | null
          variables?: Json | null
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
      doctor_protocols: {
        Row: {
          created_at: string
          description: string | null
          doctor_id: string
          duration: string | null
          examens: Json | null
          favorite: boolean | null
          id: number
          is_template: boolean | null
          last_used: string | null
          meds: Json | null
          name: string
          specialty: string | null
          steps: Json | null
          type: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          doctor_id: string
          duration?: string | null
          examens?: Json | null
          favorite?: boolean | null
          id?: never
          is_template?: boolean | null
          last_used?: string | null
          meds?: Json | null
          name?: string
          specialty?: string | null
          steps?: Json | null
          type?: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          doctor_id?: string
          duration?: string | null
          examens?: Json | null
          favorite?: boolean | null
          id?: never
          is_template?: boolean | null
          last_used?: string | null
          meds?: Json | null
          name?: string
          specialty?: string | null
          steps?: Json | null
          type?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      doctors_directory: {
        Row: {
          accepts_new_patients: boolean | null
          address: string | null
          bio: string | null
          city: string
          consultation_price: number | null
          created_at: string
          id: string
          languages: string[] | null
          lat: number | null
          lng: number | null
          phone: string | null
          photo_url: string | null
          rating: number | null
          specialty: string
          teleconsultation: boolean | null
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          accepts_new_patients?: boolean | null
          address?: string | null
          bio?: string | null
          city?: string
          consultation_price?: number | null
          created_at?: string
          id: string
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          specialty?: string
          teleconsultation?: boolean | null
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          accepts_new_patients?: boolean | null
          address?: string | null
          bio?: string | null
          city?: string
          consultation_price?: number | null
          created_at?: string
          id?: string
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          specialty?: string
          teleconsultation?: boolean | null
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_directory_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_doctors: {
        Row: {
          accepts_messages: boolean | null
          avatar: string | null
          created_at: string
          doctor_id: string
          doctor_name: string
          id: number
          patient_user_id: string
          specialty: string | null
        }
        Insert: {
          accepts_messages?: boolean | null
          avatar?: string | null
          created_at?: string
          doctor_id: string
          doctor_name?: string
          id?: never
          patient_user_id: string
          specialty?: string | null
        }
        Update: {
          accepts_messages?: boolean | null
          avatar?: string | null
          created_at?: string
          doctor_id?: string
          doctor_name?: string
          id?: never
          patient_user_id?: string
          specialty?: string | null
        }
        Relationships: []
      }
      health_records: {
        Row: {
          created_at: string
          data: Json
          date: string | null
          id: number
          patient_user_id: string
          record_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          date?: string | null
          id?: never
          patient_user_id: string
          record_type?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          date?: string | null
          id?: never
          patient_user_id?: string
          record_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hospitals_directory: {
        Row: {
          address: string | null
          beds_count: number | null
          city: string
          created_at: string
          departments: Json | null
          email: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          rating: number | null
          type: string | null
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          beds_count?: number | null
          city?: string
          created_at?: string
          departments?: Json | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          type?: string | null
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          beds_count?: number | null
          city?: string
          created_at?: string
          departments?: Json | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          type?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          assurance: string | null
          created_at: string
          created_by: string | null
          date: string
          doctor_id: string | null
          doctor_name: string
          id: string
          patient_avatar: string | null
          patient_id: number | null
          patient_name: string
          payment: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          assurance?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          doctor_id?: string | null
          doctor_name?: string
          id?: string
          patient_avatar?: string | null
          patient_id?: number | null
          patient_name?: string
          payment?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          assurance?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          doctor_id?: string | null
          doctor_name?: string
          id?: string
          patient_avatar?: string | null
          patient_id?: number | null
          patient_name?: string
          payment?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
      medicines: {
        Row: {
          category: string | null
          created_at: string
          dci: string | null
          description: string | null
          form: string | null
          id: string
          lab: string | null
          name: string
          photo_url: string | null
          price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          dci?: string | null
          description?: string | null
          form?: string | null
          id?: string
          lab?: string | null
          name?: string
          photo_url?: string | null
          price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          dci?: string | null
          description?: string | null
          form?: string | null
          id?: string
          lab?: string | null
          name?: string
          photo_url?: string | null
          price?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_link: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          target_role: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_link?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          target_role?: string
          title?: string
          type?: string
          user_id: string
        }
        Update: {
          action_link?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          target_role?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          members_count: number | null
          name: string
          phone: string | null
          status: string
          subscription_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          members_count?: number | null
          name?: string
          phone?: string | null
          status?: string
          subscription_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          members_count?: number | null
          name?: string
          phone?: string | null
          status?: string
          subscription_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          verified: boolean
        }
        Insert: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone: string
          verified?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          verified?: boolean
        }
        Relationships: []
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
      pharmacies_directory: {
        Row: {
          address: string | null
          city: string
          created_at: string
          guard_date: string | null
          id: string
          is_guard: boolean | null
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          photo_url: string | null
          rating: number | null
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          city?: string
          created_at?: string
          guard_date?: string | null
          id?: string
          is_guard?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          guard_date?: string | null
          id?: string
          is_guard?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          verified?: boolean | null
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
      pharmacy_stock: {
        Row: {
          category: string
          created_at: string
          expiry: string | null
          id: number
          name: string
          pharmacy_id: string
          price: string
          quantity: number
          status: string
          supplier: string | null
          threshold: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          expiry?: string | null
          id?: never
          name?: string
          pharmacy_id: string
          price?: string
          quantity?: number
          status?: string
          supplier?: string | null
          threshold?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          expiry?: string | null
          id?: never
          name?: string
          pharmacy_id?: string
          price?: string
          quantity?: number
          status?: string
          supplier?: string | null
          threshold?: number
          updated_at?: string
        }
        Relationships: []
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
      promotions: {
        Row: {
          auto_apply: boolean | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          new_doctors_only: boolean | null
          notes: string | null
          promo_code: string | null
          require_code: boolean | null
          require_signup_during_period: boolean | null
          start_date: string | null
          status: string
          target: string | null
          type: string
          updated_at: string
          usage_count: number | null
          value: number
        }
        Insert: {
          auto_apply?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          new_doctors_only?: boolean | null
          notes?: string | null
          promo_code?: string | null
          require_code?: boolean | null
          require_signup_during_period?: boolean | null
          start_date?: string | null
          status?: string
          target?: string | null
          type?: string
          updated_at?: string
          usage_count?: number | null
          value?: number
        }
        Update: {
          auto_apply?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          new_doctors_only?: boolean | null
          notes?: string | null
          promo_code?: string | null
          require_code?: boolean | null
          require_signup_during_period?: boolean | null
          start_date?: string | null
          status?: string
          target?: string | null
          type?: string
          updated_at?: string
          usage_count?: number | null
          value?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string | null
          created_at: string
          doctor_id: string | null
          doctor_name: string
          id: string
          patient_id: number | null
          patient_name: string
          rating: number
          text: string | null
          verified: boolean | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string | null
          doctor_name?: string
          id?: string
          patient_id?: number | null
          patient_name?: string
          rating?: number
          text?: string | null
          verified?: boolean | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string | null
          doctor_name?: string
          id?: string
          patient_id?: number | null
          patient_name?: string
          rating?: number
          text?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_log: {
        Row: {
          created_at: string
          doctor_id: string
          id: number
          message: string | null
          phone: string | null
          recipient: string
          sent_at: string | null
          sms_type: string | null
          status: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: never
          message?: string | null
          phone?: string | null
          recipient?: string
          sent_at?: string | null
          sms_type?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: never
          message?: string | null
          phone?: string | null
          recipient?: string
          sent_at?: string | null
          sms_type?: string | null
          status?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          activity: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          specialty: string | null
          status: string
          stripe_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          specialty?: string | null
          status?: string
          stripe_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          specialty?: string | null
          status?: string
          stripe_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          conversation: Json | null
          created_at: string
          id: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conversation?: Json | null
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conversation?: Json | null
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
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
      invoice_status: "paid" | "pending" | "overdue"
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
      invoice_status: ["paid", "pending", "overdue"],
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
