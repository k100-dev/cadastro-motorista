import React, { useState, useEffect } from 'react'
import { User, Phone, Mail, Building, Truck, Camera, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Database } from '../../lib/supabase'

type Driver = Database['public']['Tables']['drivers']['Row']
type DriverPhoto = Database['public']['Tables']['driver_photos']['Row']

const DriverDashboard: React.FC = () => {
  const { user } = useAuth()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [photos, setPhotos] = useState<DriverPhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDriverData()
    }
  }, [user])

  const fetchDriverData = async () => {
    try {
      if (!user) return

      // Fetch driver data
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (driverError) throw driverError

      setDriver(driverData)

      // Fetch photos
      const { data: photosData, error: photosError } = await supabase
        .from('driver_photos')
        .select('*')
        .eq('driver_id', driverData.id)

      if (photosError) throw photosError

      setPhotos(photosData)
    } catch (error) {
      console.error('Error fetching driver data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />
      case 'rejected':
        return <XCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado'
      case 'rejected':
        return 'Rejeitado'
      default:
        return 'Aguardando Aprovação'
    }
  }

  const photoTypeLabels = {
    left_profile: 'Perfil Esquerdo',
    right_profile: 'Perfil Direito',
    front_face: 'Frente'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nenhum registro de motorista encontrado.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Meu Perfil de Motorista
          </h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(driver.status)}`}>
            {getStatusIcon(driver.status)}
            <span className="font-medium">{getStatusText(driver.status)}</span>
          </div>
        </div>
        
        {driver.status === 'pending' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              <strong>Seu cadastro está em análise.</strong> Em breve você receberá um email com o resultado da aprovação.
            </p>
          </div>
        )}
        
        {driver.status === 'approved' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">
              <strong>Parabéns!</strong> Seu cadastro foi aprovado. Você já pode utilizar os serviços da Trackia.
            </p>
          </div>
        )}
        
        {driver.status === 'rejected' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">
              <strong>Cadastro rejeitado.</strong> Entre em contato com o administrador para mais informações.
            </p>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Dados Pessoais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Nome Completo</label>
            <p className="text-gray-900 font-medium">{driver.full_name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">CPF</label>
            <p className="text-gray-900 font-medium">
              {driver.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">
              <Phone className="w-4 h-4 inline mr-1" />
              Telefone
            </label>
            <p className="text-gray-900 font-medium">
              {driver.phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <p className="text-gray-900 font-medium">{driver.email}</p>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Dados da Empresa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Nome da Empresa</label>
            <p className="text-gray-900 font-medium">{driver.company_name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">ID da Empresa</label>
            <p className="text-gray-900 font-medium">{driver.company_id}</p>
          </div>
          
          {driver.license_plate && (
            <div>
              <label className="block text-sm font-medium text-gray-500">
                <Truck className="w-4 h-4 inline mr-1" />
                Placa do Veículo
              </label>
              <p className="text-gray-900 font-medium">{driver.license_plate}</p>
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Fotos de Identificação
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="text-center">
              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img
                  src={photo.photo_url}
                  alt={photoTypeLabels[photo.photo_type]}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium text-gray-700">
                {photoTypeLabels[photo.photo_type]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Date */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Cadastro realizado em {new Date(driver.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard