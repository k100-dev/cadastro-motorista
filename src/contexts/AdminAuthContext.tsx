@@ .. @@
 import React, { createContext, useContext, useEffect, useState } from 'react'
 import { supabase } from '../lib/supabase'
 import toast from 'react-hot-toast'
 
 interface AdminUser {
   id: string
   email: string
   full_name: string
   last_login?: string
 }
 
 interface AuthToken {
   token: string
   user: AdminUser
   expiresAt: number
 }
 
 interface AdminAuthContextType {
   user: AdminUser | null
   loading: boolean
   signIn: (email: string, password: string) => Promise<void>
   signOut: () => void
   isAuthenticated: boolean
 }
 
-// Simple JWT implementation for admin auth
+// Implementação JWT simples para autenticação admin
 const generateToken = (user: AdminUser): AuthToken => {
-  const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
+  const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 horas
   const token = btoa(JSON.stringify({ ...user, exp: expiresAt }))
   
   return {
     token,
     user,
     expiresAt
   }
 }
 
 const saveAuthToken = (authData: AuthToken): void => {
   localStorage.setItem('admin_auth', JSON.stringify(authData))
 }
 
 const getAuthToken = (): AuthToken | null => {
   try {
     const stored = localStorage.getItem('admin_auth')
     if (!stored) return null
     
     const authData = JSON.parse(stored) as AuthToken
     
-    // Check if token is expired
+    // Verificar se o token expirou
     if (Date.now() >= authData.expiresAt) {
       localStorage.removeItem('admin_auth')
       return null
     }
     
     return authData
   } catch {
     localStorage.removeItem('admin_auth')
     return null
   }
 }
 
 const removeAuthToken = (): void => {
   localStorage.removeItem('admin_auth')
 }
 
 const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)
 
 export const useAdminAuth = () => {
   const context = useContext(AdminAuthContext)
   if (context === undefined) {
     throw new Error('useAdminAuth deve ser usado dentro de um AdminAuthProvider')
   }
   return context
 }
 
 export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [user, setUser] = useState<AdminUser | null>(null)
   const [loading, setLoading] = useState(true)
 
   useEffect(() => {
-    // Check for existing auth token on mount
+    // Verificar token de autenticação existente na inicialização
     const authData = getAuthToken()
     if (authData) {
       setUser(authData.user)
     }
     setLoading(false)
   }, [])
 
   const signIn = async (email: string, password: string) => {
     try {
       setLoading(true)
 
-      // Validate input
+      // Validar entrada
       if (!email.trim() || !password.trim()) {
         throw new Error('Preencha todos os campos')
       }
 
-      // Call the authenticate_admin function
+      // Chamar a função authenticate_admin
       const { data, error } = await supabase.rpc('authenticate_admin', {
         email_input: email,
         password_input: password
       })
 
       if (error) {
         console.error('Erro RPC Supabase:', error)
         throw new Error('Usuário ou senha inválidos')
       }
 
-      if (!data || data.length === 0) {
+      if (!data) {
         throw new Error('Usuário ou senha inválidos')
       }
 
       const adminUser: AdminUser = {
         id: data.id,
         email: data.email,
         full_name: data.full_name,
         last_login: data.last_login
       }
 
-      // Generate and save JWT token
+      // Gerar e salvar token JWT
       const authToken = generateToken(adminUser)
       saveAuthToken(authToken)
       setUser(adminUser)
 
-      toast.success('Login realizado com sucesso!')
+      toast.success('Login realizado com sucesso!')
     } catch (error: any) {
       const errorMessage = error.message || 'Erro ao fazer login'
       toast.error(errorMessage)
       throw error
     } finally {
       setLoading(false)
     }
   }
 
   const signOut = () => {
     removeAuthToken()
     setUser(null)
-    toast.success('Logout realizado com sucesso!')
+    toast.success('Logout realizado com sucesso!')
   }
 
   const value = {
     user,
     loading,
     signIn,
     signOut,
     isAuthenticated: !!user,
   }
 
   return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
 }