import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient('https://esoacfqcwqkufrhnvoqi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzb2FjZnFjd3FrdWZyaG52b3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDE2ODEsImV4cCI6MjA3MTQxNzY4MX0.CzDVme5o9yyORIsSGxnR4nW5g7sOILk7FEfZDF-rxAk')

export type Database = {
  public: {
    Tables: {
      drivers: {
        Row: {
          id: string
          user_id: string
          full_name: string
          cpf: string
          company_name: string
          company_id: string
          phone: string
          email: string
          license_plate: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          cpf: string
          company_name: string
          company_id: string
          phone: string
          email: string
          license_plate?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          cpf?: string
          company_name?: string
          company_id?: string
          phone?: string
          email?: string
          license_plate?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      driver_photos: {
        Row: {
          id: string
          driver_id: string
          photo_type: 'left_profile' | 'right_profile' | 'front_face'
          photo_url: string
          created_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          photo_type: 'left_profile' | 'right_profile' | 'front_face'
          photo_url: string
          created_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          photo_type?: 'left_profile' | 'right_profile' | 'front_face'
          photo_url?: string
          created_at?: string
        }
      }
    }
  }
}