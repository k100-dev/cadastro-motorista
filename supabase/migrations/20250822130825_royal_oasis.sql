/*
  # Fix Admin Authentication System

  1. New Tables
    - `admin_users` table for administrator accounts
    - Secure password hashing with bcrypt
    - Default admin user creation

  2. Security Functions
    - Password hashing function using pgcrypto
    - Authentication function for login validation
    - Proper indexing for performance

  3. Default Admin User
    - Email: admin@admin.com
    - Password: admin123 (hashed)
    - Active by default
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

-- Create policies for admin_users
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

-- Create indexes
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);
CREATE INDEX IF NOT EXISTS admin_users_is_active_idx ON admin_users(is_active);

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
  RETURN crypt(password, hash) = hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate admin users
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
  -- Find the admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE admin_users.email = email_input
    AND admin_users.is_active = true;

  -- Check if user exists and password is correct
  IF admin_record.id IS NOT NULL AND verify_password(password_input, admin_record.password_hash) THEN
    -- Update last login
    UPDATE admin_users
    SET last_login = now(),
        updated_at = now()
    WHERE admin_users.id = admin_record.id;

    -- Return user data
    RETURN QUERY
    SELECT 
      admin_record.id,
      admin_record.email,
      admin_record.full_name,
      now() as last_login;
  ELSE
    -- Return empty result for invalid credentials
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO admin_users (email, password_hash, full_name)
VALUES (
  'admin@admin.com',
  hash_password('admin123'),
  'Administrador do Sistema'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = hash_password('admin123'),
  full_name = 'Administrador do Sistema',
  is_active = true,
  updated_at = now();