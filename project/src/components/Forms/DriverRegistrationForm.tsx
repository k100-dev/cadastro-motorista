import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import PhotoCapture, { PhotoType } from '../PhotoCapture/PhotoCapture'
import toast from 'react-hot-toast'

interface RegistrationFormData {
  fullName: string
  cpf: string
  companyName: string
  companyId: string
  phone: string
  email: string
  licensePlate?: string
  password: string
  confirmPassword: string
}

const DriverRegistrationForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [photos, setPhotos] = useState<{ [key in PhotoType]?: File }>({})
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegistrationFormData>()

  const password = watch('password')

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
  }

  const uploadPhotos = async (driverId: string): Promise<void> => {
    const uploadPromises = Object.entries(photos).map(async ([photoType, file]) => {
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${driverId}/${photoType}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('driver-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw new Error(`Erro ao fazer upload da foto ${photoType}: ${uploadError.message}`)
      }

      const { data: urlData } = supabase.storage
        .from('driver-photos')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('driver_photos')
        .insert({
          driver_id: driverId,
          photo_type: photoType as PhotoType,
          photo_url: urlData.publicUrl
        })

      if (dbError) {
        throw new Error(`Erro ao salvar referência da foto ${photoType}: ${dbError.message}`)
      }
    })

    await Promise.all(uploadPromises)
  }

  const onSubmit = async (data: RegistrationFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (Object.keys(photos).length < 3) {
      toast.error('Por favor, capture todas as 3 fotos obrigatórias')
      return
    }

    setIsLoading(true)

    try {
      // Create auth user
      await signUp(data.email, data.password, {
        full_name: data.fullName
      })

      // Get the newly created user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('Erro ao obter dados do usuário')
      }

      // Create driver record
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .insert({
          user_id: user.id,
          full_name: data.fullName,
          cpf: data.cpf.replace(/\D/g, ''),
          company_name: data.companyName,
          company_id: data.companyId,
          phone: data.phone.replace(/\D/g, ''),
          email: data.email,
          license_plate: data.licensePlate || null
        })
        .select()
        .single()

      if (driverError) {
        throw new Error(`Erro ao salvar dados do motorista: ${driverError.message}`)
      }

      // Upload photos
      await uploadPhotos(driverData.id)

      toast.success('Cadastro realizado com sucesso! Aguarde aprovação.')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Erro no cadastro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cadastro de Motorista
          </h2>
          <p className="text-gray-600">
            Preencha todos os dados obrigatórios e capture as fotos para identificação
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dados Pessoais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  {...register('fullName', { required: 'Nome é obrigatório' })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite seu nome completo"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  {...register('cpf', { 
                    required: 'CPF é obrigatório',
                    pattern: {
                      value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                      message: 'CPF deve ter o formato 000.000.000-00'
                    }
                  })}
                  maxLength={14}
                  onChange={(e) => {
                    e.target.value = formatCPF(e.target.value)
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cpf ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="000.000.000-00"
                />
                {errors.cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="text"
                  {...register('phone', { 
                    required: 'Telefone é obrigatório',
                    minLength: { value: 14, message: 'Telefone deve ter pelo menos 10 dígitos' }
                  })}
                  onChange={(e) => {
                    e.target.value = formatPhone(e.target.value)
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dados da Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  {...register('companyName', { required: 'Nome da empresa é obrigatório' })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.companyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nome da sua empresa"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID da Empresa *
                </label>
                <input
                  type="text"
                  {...register('companyId', { required: 'ID da empresa é obrigatório' })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.companyId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ID ou código da empresa"
                />
                {errors.companyId && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyId.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa do Veículo
                </label>
                <input
                  type="text"
                  {...register('licensePlate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC-1234 (opcional)"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Senha de Acesso
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Senha é obrigatória',
                      minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', { 
                      required: 'Confirmação de senha é obrigatória',
                      validate: value => value === password || 'As senhas não coincidem'
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirme sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Photo Capture Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <PhotoCapture photos={photos} onPhotosChange={setPhotos} />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading || Object.keys(photos).length < 3}
              className="px-8 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isLoading ? 'Processando...' : 'Finalizar Cadastro'}
              </span>
            </button>
            
            {Object.keys(photos).length < 3 && (
              <p className="text-red-500 text-sm mt-2">
                Capture todas as 3 fotos antes de finalizar o cadastro
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default DriverRegistrationForm