/*
  # Trackia Driver Registration Schema

  1. New Tables
    - `drivers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `cpf` (text, unique)
      - `company_name` (text)
      - `company_id` (text)
      - `phone` (text)
      - `email` (text)
      - `license_plate` (text, optional)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `driver_photos`
      - `id` (uuid, primary key)
      - `driver_id` (uuid, references drivers)
      - `photo_type` (text: left_profile, right_profile, front_face)
      - `photo_url` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for drivers to manage their own data
    - Add policies for admins to manage all driver data
  
  3. Storage
    - Create storage bucket for driver photos
*/

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  cpf text UNIQUE NOT NULL,
  company_name text NOT NULL,
  company_id text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  license_plate text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create driver photos table
CREATE TABLE IF NOT EXISTS driver_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  photo_type text NOT NULL CHECK (photo_type IN ('left_profile', 'right_profile', 'front_face')),
  photo_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_photos ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for driver photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('driver-photos', 'driver-photos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for drivers table
CREATE POLICY "Drivers can view own data"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can insert own data"
  ON drivers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drivers can update own data"
  ON drivers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for admin users (assuming admin role is stored in auth.users metadata)
CREATE POLICY "Admins can view all drivers"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role')::text = 'admin' OR
    auth.uid() = user_id
  );

CREATE POLICY "Admins can update driver status"
  ON drivers
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- RLS Policies for driver_photos table
CREATE POLICY "Users can view own photos"
  ON driver_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM drivers 
      WHERE drivers.id = driver_photos.driver_id 
      AND (drivers.user_id = auth.uid() OR (auth.jwt()->>'role')::text = 'admin')
    )
  );

CREATE POLICY "Users can insert own photos"
  ON driver_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM drivers 
      WHERE drivers.id = driver_photos.driver_id 
      AND drivers.user_id = auth.uid()
    )
  );

-- Storage policies
CREATE POLICY "Users can upload own photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'driver-photos');

CREATE POLICY "Users can view own photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'driver-photos');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS drivers_user_id_idx ON drivers(user_id);
CREATE INDEX IF NOT EXISTS drivers_cpf_idx ON drivers(cpf);
CREATE INDEX IF NOT EXISTS drivers_status_idx ON drivers(status);
CREATE INDEX IF NOT EXISTS driver_photos_driver_id_idx ON driver_photos(driver_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();