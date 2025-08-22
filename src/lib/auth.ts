import jwt from 'jsonwebtoken'

// JWT Secret - In production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'trackia-admin-secret-key-2024'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  last_login?: string
}

export interface AuthToken {
  token: string
  user: AdminUser
  expiresAt: number
}

// Generate JWT token
export const generateToken = (user: AdminUser): AuthToken => {
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      exp: Math.floor(expiresAt / 1000)
    },
    JWT_SECRET
  )

  return {
    token,
    user,
    expiresAt
  }
}

// Verify JWT token
export const verifyToken = (token: string): AdminUser | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    return {
      id: decoded.id,
      email: decoded.email,
      full_name: decoded.full_name,
      last_login: decoded.last_login
    }
  } catch (error) {
    return null
  }
}

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.exp) return true
    
    return Date.now() >= decoded.exp * 1000
  } catch {
    return true
  }
}

// Storage helpers
export const saveAuthToken = (authData: AuthToken): void => {
  localStorage.setItem('admin_auth', JSON.stringify(authData))
}

export const getAuthToken = (): AuthToken | null => {
  try {
    const stored = localStorage.getItem('admin_auth')
    if (!stored) return null
    
    const authData = JSON.parse(stored) as AuthToken
    
    // Check if token is expired
    if (isTokenExpired(authData.token)) {
      removeAuthToken()
      return null
    }
    
    return authData
  } catch {
    removeAuthToken()
    return null
  }
}

export const removeAuthToken = (): void => {
  localStorage.removeItem('admin_auth')
}

export const getCurrentUser = (): AdminUser | null => {
  const authData = getAuthToken()
  return authData ? authData.user : null
}