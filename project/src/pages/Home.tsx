import React from 'react'
import { Link } from 'react-router-dom'
import { Truck, UserPlus, Shield, Camera, Clock } from 'lucide-react'

const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mx-auto mb-6">
          <Truck className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Trackia - Sistema de Cadastro de Motoristas
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Simplifique o processo de registro e verificação de motoristas com nossa 
          plataforma segura e eficiente, desenvolvida especialmente para frotas.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Cadastrar como Motorista</span>
          </Link>
          
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          Como Funciona
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              1. Cadastro Completo
            </h3>
            <p className="text-gray-600">
              Preencha todos os seus dados pessoais e da empresa de forma simples e segura.
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <Camera className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              2. Captura de Fotos
            </h3>
            <p className="text-gray-600">
              Tire 3 fotos (perfil esquerdo, direito e frontal) para identificação usando sua câmera.
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              3. Aprovação
            </h3>
            <p className="text-gray-600">
              Aguarde a análise do gestor da frota que irá aprovar seu cadastro.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          Por que escolher a Trackia?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Segurança</h4>
            <p className="text-gray-600 text-sm">
              Dados protegidos com criptografia e armazenamento seguro
            </p>
          </div>
          
          <div className="text-center p-4">
            <Clock className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Rapidez</h4>
            <p className="text-gray-600 text-sm">
              Processo de cadastro otimizado em poucos minutos
            </p>
          </div>
          
          <div className="text-center p-4">
            <Camera className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Tecnologia</h4>
            <p className="text-gray-600 text-sm">
              Captura de fotos com tecnologia avançada
            </p>
          </div>
          
          <div className="text-center p-4">
            <Truck className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Especialização</h4>
            <p className="text-gray-600 text-sm">
              Focado especificamente em gestão de frotas
            </p>
          </div>
        </div>
      </div>

      {/* Admin Access */}
      <div className="bg-blue-50 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Área do Administrador
        </h3>
        <p className="text-gray-600 mb-6">
          Gestores de frota podem acessar o painel administrativo para gerenciar cadastros
        </p>
        <Link
          to="/admin-login"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Shield className="w-5 h-5" />
          <span>Acesso Administrativo</span>
        </Link>
      </div>
    </div>
  )
}

export default Home