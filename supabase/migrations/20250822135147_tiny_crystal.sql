/*
  # Sistema de Autenticação Administrativa

  1. Novas Tabelas
    - `admin_users`
      - `id` (uuid, chave primária)
      - `email` (text, único)
      - `password_hash` (text)
      - `full_name` (text)
      - `is_active` (boolean, padrão true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela admin_users
    - Adicionar políticas para gerenciamento de admins
    - Criar usuário admin padrão com senha criptografada

  3. Funções
    - Função de hash de senha usando pgcrypto
    - Função de autenticação de admin
*/

-- Habilitar extensão pgcrypto para hash de senhas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar tabela admin_users
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

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);
CREATE INDEX IF NOT EXISTS admin_users_is_active_idx ON admin_users(is_active);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at em admin_users
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para hash de senhas
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar senhas
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN crypt(password, hash) = hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para autenticar admin
CREATE OR REPLACE FUNCTION authenticate_admin(email_input text, password_input text)
RETURNS json AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  result json;
BEGIN
  -- Buscar usuário admin
  SELECT * INTO admin_record
  FROM admin_users
  WHERE admin_users.email = email_input AND admin_users.is_active = true;

  -- Verificar se usuário existe e senha está correta
  IF admin_record.id IS NOT NULL AND verify_password(password_input, admin_record.password_hash) THEN
    -- Atualizar último login
    UPDATE admin_users 
    SET last_login = now(), updated_at = now()
    WHERE admin_users.id = admin_record.id;

    -- Retornar dados do admin
    SELECT json_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'full_name', admin_record.full_name,
      'last_login', now()
    ) INTO result;
    
    RETURN result;
  ELSE
    -- Retornar null para credenciais inválidas
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir usuário admin padrão
INSERT INTO admin_users (email, password_hash, full_name)
VALUES (
  'admin@admin.com',
  hash_password('Admin1234'),
  'Administrador do Sistema'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = hash_password('Admin1234'),
  full_name = 'Administrador do Sistema',
  is_active = true,
  updated_at = now();

-- Políticas RLS para tabela admin_users
CREATE POLICY "Admins podem visualizar todos os usuários admin"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem inserir usuários admin"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins podem atualizar usuários admin"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Conceder permissões necessárias
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_admin TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password TO authenticated;
GRANT EXECUTE ON FUNCTION verify_password TO authenticated;