@@ .. @@
 -- Function to authenticate admin users
+DROP FUNCTION IF EXISTS authenticate_admin(text, text);
+
 CREATE OR REPLACE FUNCTION authenticate_admin(email_input text, password_input text)
 RETURNS json AS $$