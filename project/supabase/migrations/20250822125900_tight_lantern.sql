/*
  # Admin Authentication System

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `full_name` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp)

  2. Security
    - Enable RLS on admin_users table
    - Add policies for admin management
    - Create default admin user with hashed password

  3. Functions
    - Password hashing function using pgcrypto
    - Admin authentication function
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);
CREATE INDEX IF NOT EXISTS admin_users_is_active_idx ON admin_users(is_active);

-- Create updated_at trigger for admin_users
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate admin
CREATE OR REPLACE FUNCTION authenticate_admin(email_input text, password_input text)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  last_login timestamptz
) AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
BEGIN
  -- Get admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE email = email_input AND is_active = true;

  -- Check if user exists and password is correct
  IF admin_record.id IS NOT NULL AND verify_password(password_input, admin_record.password_hash) THEN
    -- Update last login
    UPDATE admin_users 
    SET last_login = now() 
    WHERE admin_users.id = admin_record.id;

    -- Return admin data
    RETURN QUERY
    SELECT admin_record.id, admin_record.email, admin_record.full_name, now();
  ELSE
    -- Return empty result for invalid credentials
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin user
INSERT INTO admin_users (email, password_hash, full_name)
VALUES (
  'admin@admin.com',
  hash_password('admin123'),
  'Administrador Padrão'
) ON CONFLICT (email) DO NOTHING;

-- RLS Policies for admin_users table
CREATE POLICY "Admins can view all admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert admin users"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update admin users"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_admin TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password TO authenticated;
GRANT EXECUTE ON FUNCTION verify_password TO authenticated;