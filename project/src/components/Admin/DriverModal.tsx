import React from 'react'
import { X, CheckCircle, XCircle, User, Phone, Mail, Building, Truck, Camera } from 'lucide-react'
import { Database } from '../../lib/supabase'

type Driver = Database['public']['Tables']['drivers']['Row']
type DriverPhoto = Database['public']['Tables']['driver_photos']['Row']

interface DriverWithPhotos extends Driver {
  photos: DriverPhoto[]
}

interface DriverModalProps {
  driver: DriverWithPhotos
  onClose: () => void
  onStatusUpdate: (driverId: string, status: 'approved' | 'rejected') => void
}

const DriverModal: React.FC<DriverModalProps> = ({ driver, onClose, onStatusUpdate }) => {
  const photoTypeLabels = {
    left_profile: 'Perfil Esquerdo',
    right_profile: 'Perfil Direito',
    front_face: 'Frente'
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado'
      case 'rejected':
        return 'Rejeitado'
      default:
        return 'Pendente'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes do Motorista
            </h2>
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(driver.status)}`}>
              <span>{getStatusText(driver.status)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
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
          <div className="bg-gray-50 rounded-lg p-6">
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
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Fotos de Identificação
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {driver.photos.map((photo) => (
                <div key={photo.id} className="text-center">
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-2 border">
                    <img
                      src={photo.photo_url}
                      alt={photoTypeLabels[photo.photo_type]}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(photo.photo_url, '_blank')}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {photoTypeLabels[photo.photo_type]}
                  </p>
                </div>
              ))}
            </div>

            {driver.photos.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Nenhuma foto encontrada para este motorista.
              </p>
            )}
          </div>

          {/* Registration Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações de Cadastro
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Data de Cadastro</label>
                <p className="text-gray-900 font-medium">
                  {new Date(driver.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Última Atualização</label>
                <p className="text-gray-900 font-medium">
                  {new Date(driver.updated_at).toLocaleDateString('pt-BR', {
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
        </div>

        {/* Actions */}
        {driver.status === 'pending' && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  onStatusUpdate(driver.id, 'rejected')
                  onClose()
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Rejeitar</span>
              </button>
              <button
                onClick={() => {
                  onStatusUpdate(driver.id, 'approved')
                  onClose()
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aprovar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DriverModal