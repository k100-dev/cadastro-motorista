// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export type Database = {
  public: {
    Tables: {
      drivers: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          cpf: string;
          company_name: string;
          company_id: string;
          phone: string;
          email: string;
          license_plate: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          cpf: string;
          company_name: string;
          company_id: string;
          phone: string;
          email: string;
          license_plate?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          cpf?: string;
          company_name?: string;
          company_id?: string;
          phone?: string;
          email?: string;
          license_plate?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      driver_photos: {
        Row: {
          id: string;
          driver_id: string;
          photo_type: 'left_profile' | 'right_profile' | 'front_face';
          photo_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          photo_type: 'left_profile' | 'right_profile' | 'front_face';
          photo_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          photo_type?: 'left_profile' | 'right_profile' | 'front_face';
          photo_url?: string;
          created_at?: string;
        };
      };
    };
  };
};
