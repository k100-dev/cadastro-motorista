@@ .. @@
 import React, { useState, useEffect } from 'react'
 import { useForm } from 'react-hook-form'
 import { useNavigate, Link } from 'react-router-dom'
 import { Eye, EyeOff, Loader2, Shield, Lock, Mail } from 'lucide-react'
 import { useAdminAuth } from '../../contexts/AdminAuthContext'
 
 interface AdminLoginFormData {
   email: string
   password: string
 }
 
 const AdminLogin: React.FC = () => {
   const [showPassword, setShowPassword] = useState(false)
   const { signIn, loading, isAuthenticated } = useAdminAuth()
   const navigate = useNavigate()
 
   const {
     register,
     handleSubmit,
     formState: { errors, isSubmitting },
-    setError
   } = useForm<AdminLoginFormData>()
 
-  // Redirect if already authenticated
+  // Redirecionar se já autenticado
   useEffect(() => {
     if (isAuthenticated) {
       navigate('/admin')
     }
   }, [isAuthenticated, navigate])
 
   const onSubmit = async (data: AdminLoginFormData) => {
-    // Clear any previous errors
-    setError('email', { message: '' })
-    setError('password', { message: '' })
-
     try {
       await signIn(data.email, data.password)
     } catch (error) {
-      // Error is handled in the auth context with toast
+      // Erro é tratado no contexto de autenticação com toast
       console.error('Login error:', error)
     }
   }
 
   return (
     <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-md w-full space-y-8">
         <div className="bg-white rounded-lg shadow-lg p-8">
-          {/* Header */}
+          {/* Cabeçalho */}
           <div className="text-center mb-8">
             <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4">
               <Shield className="w-8 h-8 text-white" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">
               Acesso Administrativo
             </h2>
             <p className="text-gray-600">
               Área restrita para administradores do sistema
             </p>
           </div>
 
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
-            {/* Email Field */}
+            {/* Campo E-mail */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 <Mail className="w-4 h-4 inline mr-1" />
                 E-mail
               </label>
               <input
                 type="email"
                 {...register('email', { 
                   required: 'E-mail é obrigatório',
                   pattern: {
                     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                     message: 'E-mail inválido'
                   }
                 })}
                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                   errors.email ? 'border-red-500' : 'border-gray-300'
                 }`}
                 placeholder="admin@admin.com"
                 disabled={isSubmitting || loading}
               />
               {errors.email && (
                 <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
               )}
             </div>
 
-            {/* Password Field */}
+            {/* Campo Senha */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 <Lock className="w-4 h-4 inline mr-1" />
                 Senha
               </label>
               <div className="relative">
                 <input
                   type={showPassword ? 'text' : 'password'}
                   {...register('password', { 
                     required: 'Senha é obrigatória'
                   })}
                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                     errors.password ? 'border-red-500' : 'border-gray-300'
                   }`}
-                  placeholder="admin123"
+                  placeholder="Admin1234"
                   disabled={isSubmitting || loading}
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
                   disabled={isSubmitting || loading}
                 >
                   {showPassword ? (
                     <EyeOff className="w-4 h-4 text-gray-400" />
                   ) : (
                     <Eye className="w-4 h-4 text-gray-400" />
                   )}
                 </button>
               </div>
               {errors.password && (
                 <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
               )}
             </div>
 
-            {/* Submit Button */}
+            {/* Botão Enviar */}
             <button
               type="submit"
               disabled={isSubmitting || loading}
               className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
             >
               {(isSubmitting || loading) && <Loader2 className="w-4 h-4 animate-spin" />}
               <span>{(isSubmitting || loading) ? 'Verificando...' : 'Acessar Dashboard'}</span>
             </button>
           </form>
 
-          {/* Default Credentials Info */}
+          {/* Informações das Credenciais Padrão */}
           <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
             <h4 className="text-sm font-semibold text-blue-800 mb-2">
               Credenciais Padrão:
             </h4>
             <div className="text-sm text-blue-700 space-y-1">
               <p><strong>E-mail:</strong> admin@admin.com</p>
-              <p><strong>Senha:</strong> admin123</p>
+              <p><strong>Senha:</strong> Admin1234</p>
             </div>
             <p className="text-xs text-blue-600 mt-2">
               Altere essas credenciais após o primeiro acesso.
             </p>
           </div>
 
-          {/* Back to Home */}
+          {/* Voltar para Início */}
           <div className="mt-6 text-center">
             <Link 
               to="/" 
               className="text-blue-600 hover:text-blue-700 text-sm"
             >
               ← Voltar para página inicial
             </Link>
           </div>
         </div>
       </div>
     </div>
   )
 }
 
 export default AdminLogin