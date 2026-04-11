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
      users: {
        Row: {
          id: string
          telegram_id: string
          client_id: string
          name: string
          username: string | null
          phone: string | null
          lang: string
          history: string
          is_admin: boolean
          verification_code: string | null
          verification_expires: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          telegram_id: string
          client_id?: string
          name: string
          username?: string | null
          phone?: string | null
          lang?: string
          history?: string
          is_admin?: boolean
          verification_code?: string | null
          verification_expires?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          telegram_id?: string
          client_id?: string
          name?: string
          username?: string | null
          phone?: string | null
          lang?: string
          history?: string
          is_admin?: boolean
          verification_code?: string | null
          verification_expires?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          code: string
          status: string
          received_date: string | null
          intransit_date: string | null
          border_date: string | null
          warehouse_date: string | null
          delivered_date: string | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          status?: string
          received_date?: string | null
          intransit_date?: string | null
          border_date?: string | null
          warehouse_date?: string | null
          delivered_date?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          status?: string
          received_date?: string | null
          intransit_date?: string | null
          border_date?: string | null
          warehouse_date?: string | null
          delivered_date?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          track_code: string
          message: string
          status: string
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          track_code: string
          message: string
          status?: string
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          track_code?: string
          message?: string
          status?: string
          sent_at?: string | null
          created_at?: string
        }
      }
      broadcast_logs: {
        Row: {
          id: string
          admin_id: string
          message: string
          total_users: number
          sent_count: number
          status: string
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          admin_id: string
          message: string
          total_users: number
          sent_count?: number
          status?: string
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          admin_id?: string
          message?: string
          total_users?: number
          sent_count?: number
          status?: string
          created_at?: string
          completed_at?: string | null
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
