export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lawyer_profiles: {
        Row: {
          id: string
          full_name: string
          enrollment_number: string
          state_bar_council: string
          practice_start_year: number
          courts_of_practice: string[]
          areas_of_specialization: string[]
          experience_years: number
          fee_consultation: number
          fee_hourly: number
          fee_case_based: number
          id_proof_url: string | null
          enrollment_certificate_url: string | null
          verification_status: string
          office_address: string | null
          alternate_contact: string | null
          profile_image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          enrollment_number: string
          state_bar_council: string
          practice_start_year: number
          courts_of_practice?: string[]
          areas_of_specialization?: string[]
          experience_years?: number
          fee_consultation?: number
          fee_hourly?: number
          fee_case_based?: number
          id_proof_url?: string | null
          enrollment_certificate_url?: string | null
          verification_status?: string
          office_address?: string | null
          alternate_contact?: string | null
          profile_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          enrollment_number?: string
          state_bar_council?: string
          practice_start_year?: number
          courts_of_practice?: string[]
          areas_of_specialization?: string[]
          experience_years?: number
          fee_consultation?: number
          fee_hourly?: number
          fee_case_based?: number
          id_proof_url?: string | null
          enrollment_certificate_url?: string | null
          verification_status?: string
          office_address?: string | null
          alternate_contact?: string | null
          profile_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          client_id: string | null
          lawyer_id: string | null
          case_title: string
          case_category: string
          case_subtype: string | null
          court_type: string | null
          case_number: string | null
          case_description: string | null
          status: string
          priority: string
          proposed_fee: number | null
          agreed_fee: number | null
          payment_status: string
          progress_percentage: number
          next_hearing_date: string | null
          created_at: string
          updated_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          lawyer_id?: string | null
          case_title: string
          case_category: string
          case_subtype?: string | null
          court_type?: string | null
          case_number?: string | null
          case_description?: string | null
          status?: string
          priority?: string
          proposed_fee?: number | null
          agreed_fee?: number | null
          payment_status?: string
          progress_percentage?: number
          next_hearing_date?: string | null
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          lawyer_id?: string | null
          case_title?: string
          case_category?: string
          case_subtype?: string | null
          court_type?: string | null
          case_number?: string | null
          case_description?: string | null
          status?: string
          priority?: string
          proposed_fee?: number | null
          agreed_fee?: number | null
          payment_status?: string
          progress_percentage?: number
          next_hearing_date?: string | null
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
      }
      case_documents: {
        Row: {
          id: string
          case_id: string | null
          uploaded_by: string | null
          document_name: string
          document_url: string
          document_type: string
          file_size: number | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          uploaded_by?: string | null
          document_name: string
          document_url: string
          document_type?: string
          file_size?: number | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          uploaded_by?: string | null
          document_name?: string
          document_url?: string
          document_type?: string
          file_size?: number | null
          uploaded_at?: string
        }
      }
      case_timeline: {
        Row: {
          id: string
          case_id: string | null
          milestone_type: string
          title: string
          description: string | null
          scheduled_date: string | null
          completed_date: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          milestone_type: string
          title: string
          description?: string | null
          scheduled_date?: string | null
          completed_date?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          milestone_type?: string
          title?: string
          description?: string | null
          scheduled_date?: string | null
          completed_date?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          case_id: string | null
          sender_id: string | null
          receiver_id: string | null
          message_type: string
          content: string
          file_url: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          sender_id?: string | null
          receiver_id?: string | null
          message_type?: string
          content: string
          file_url?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          sender_id?: string | null
          receiver_id?: string | null
          message_type?: string
          content?: string
          file_url?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          lawyer_id: string | null
          client_id: string | null
          case_id: string | null
          appointment_type: string
          scheduled_at: string
          duration_minutes: number
          status: string
          meeting_link: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lawyer_id?: string | null
          client_id?: string | null
          case_id?: string | null
          appointment_type?: string
          scheduled_at: string
          duration_minutes?: number
          status?: string
          meeting_link?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lawyer_id?: string | null
          client_id?: string | null
          case_id?: string | null
          appointment_type?: string
          scheduled_at?: string
          duration_minutes?: number
          status?: string
          meeting_link?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          case_id: string | null
          lawyer_id: string | null
          client_id: string | null
          amount: number
          payment_type: string
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          payment_method: string | null
          invoice_url: string | null
          transaction_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          lawyer_id?: string | null
          client_id?: string | null
          amount: number
          payment_type?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          payment_method?: string | null
          invoice_url?: string | null
          transaction_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          lawyer_id?: string | null
          client_id?: string | null
          amount?: number
          payment_type?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          payment_method?: string | null
          invoice_url?: string | null
          transaction_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          notification_type: string
          title: string
          message: string
          related_case_id: string | null
          is_read: boolean
          action_url: string | null
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          notification_type: string
          title: string
          message: string
          related_case_id?: string | null
          is_read?: boolean
          action_url?: string | null
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          notification_type?: string
          title?: string
          message?: string
          related_case_id?: string | null
          is_read?: boolean
          action_url?: string | null
          created_at?: string
          read_at?: string | null
        }
      }
      availability_schedule: {
        Row: {
          id: string
          lawyer_id: string | null
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lawyer_id?: string | null
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lawyer_id?: string | null
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      blocked_dates: {
        Row: {
          id: string
          lawyer_id: string | null
          blocked_date: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lawyer_id?: string | null
          blocked_date: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lawyer_id?: string | null
          blocked_date?: string
          reason?: string | null
          created_at?: string
        }
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
  }
}

