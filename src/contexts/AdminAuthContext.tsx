import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AdminUser, AuthToken, generateToken, getAuthToken, removeAuthToken, saveAuthToken } from '../lib/auth'
import toast from 'react-hot-toast'

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  isAuthenticated: boolean
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
    // Check for existing auth token on mount
    const authData = getAuthToken()
    if (authData) {
      setUser(authData.user)
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Call the authenticate_admin function
      const { data, error } = await supabase.rpc('authenticate_admin', {
        email_input: email,
        password_input: password
      })

      if (error) {
        throw new Error('Erro interno do servidor')
      }

      if (!data || data.length === 0) {
        throw new Error('Usuário ou senha inválidos')
      }

      const adminUser: AdminUser = {
        id: data[0].id,
        email: data[0].email,
        full_name: data[0].full_name,
        last_login: data[0].last_login
      }

      // Generate and save JWT token
      const authToken = generateToken(adminUser)
      saveAuthToken(authToken)
      setUser(adminUser)

      toast.success('Login realizado com sucesso!')
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
    toast.success('Logout realizado com sucesso!')
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