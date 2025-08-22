@@ .. @@
 import React, { useState, useEffect } from 'react'
 import { Search, Filter, Users, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
 import { supabase } from '../../lib/supabase'
 import { Database } from '../../lib/supabase'
+import { useAdminAuth } from '../../contexts/AdminAuthContext'
+import AdminLayout from './AdminLayout'
 import DriverModal from './DriverModal'
 import toast from 'react-hot-toast'
 
 type Driver = Database['public']['Tables']['drivers']['Row']
 type DriverPhoto = Database['public']['Tables']['driver_photos']['Row']
 
 interface DriverWithPhotos extends Driver {
   photos: DriverPhoto[]
 }
 
 const AdminDashboard: React.FC = () => {
+  const { user } = useAdminAuth()
   const [drivers, setDrivers] = useState<DriverWithPhotos[]>([])
   const [filteredDrivers, setFilteredDrivers] = useState<DriverWithPhotos[]>([])
   const [loading, setLoading] = useState(true)
   const [searchTerm, setSearchTerm] = useState('')
   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
   const [selectedDriver, setSelectedDriver] = useState<DriverWithPhotos | null>(null)
 
   useEffect(() => {
     fetchDrivers()
   }, [])
 
   useEffect(() => {
     filterDrivers()
   }, [drivers, searchTerm, statusFilter])
 
   const fetchDrivers = async () => {
     try {
       const { data: driversData, error: driversError } = await supabase
         .from('drivers')
         .select('*')
         .order('created_at', { ascending: false })
 
       if (driversError) throw driversError
 
       const driversWithPhotos = await Promise.all(
         driversData.map(async (driver) => {
           const { data: photos, error: photosError } = await supabase
             .from('driver_photos')
             .select('*')
             .eq('driver_id', driver.id)
 
           if (photosError) throw photosError
 
           return {
             ...driver,
             photos: photos || []
           }
         })
       )
 
       setDrivers(driversWithPhotos)
     } catch (error) {
       console.error('Error fetching drivers:', error)
       toast.error('Erro ao carregar dados dos motoristas')
     } finally {
       setLoading(false)
     }
   }
 
   const filterDrivers = () => {
     let filtered = drivers
 
     if (searchTerm) {
       filtered = filtered.filter(driver =>
         driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         driver.cpf.includes(searchTerm) ||
         driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         driver.company_name.toLowerCase().includes(searchTerm.toLowerCase())
       )
     }
 
     if (statusFilter !== 'all') {
       filtered = filtered.filter(driver => driver.status === statusFilter)
     }
 
     setFilteredDrivers(filtered)
   }
 
   const updateDriverStatus = async (driverId: string, status: 'approved' | 'rejected') => {
     try {
       const { error } = await supabase
         .from('drivers')
         .update({ status })
         .eq('id', driverId)
 
       if (error) throw error
 
       setDrivers(prevDrivers =>
         prevDrivers.map(driver =>
           driver.id === driverId ? { ...driver, status } : driver
         )
       )
 
       toast.success(`Motorista ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso!`)
     } catch (error) {
       console.error('Error updating driver status:', error)
       toast.error('Erro ao atualizar status do motorista')
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
         return <CheckCircle className="w-4 h-4" />
       case 'rejected':
         return <XCircle className="w-4 h-4" />
       default:
         return <Clock className="w-4 h-4" />
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
 
   const stats = {
     total: drivers.length,
     pending: drivers.filter(d => d.status === 'pending').length,
     approved: drivers.filter(d => d.status === 'approved').length,
     rejected: drivers.filter(d => d.status === 'rejected').length
   }
 
   if (loading) {
     return (
-      <div className="flex items-center justify-center min-h-64">
-        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
-      </div>
+      <AdminLayout>
+        <div className="flex items-center justify-center min-h-64">
+          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
+        </div>
+      </AdminLayout>
     )
   }
 
   return (
-    <div className="space-y-8">
-      {/* Header */}
-      <div>
-        <h1 className="text-2xl font-bold text-gray-900 mb-2">
-          Dashboard Administrativo
-        </h1>
-        <p className="text-gray-600">
-          Gerencie cadastros de motoristas e aprove registros
-        </p>
-      </div>
+    <AdminLayout>
+      <div className="space-y-8">
+        {/* Header */}
+        <div>
+          <h1 className="text-2xl font-bold text-gray-900 mb-2">
+            Dashboard Administrativo
+          </h1>
+          <p className="text-gray-600">
+            Gerencie cadastros de motoristas e aprove registros
+          </p>
+          {user && (
+            <div className="mt-2 text-sm text-gray-500">
+              Logado como: <span className="font-medium">{user.full_name}</span>
+            </div>
+          )}
+        </div>
 
-      {/* Stats Cards */}
-      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
-        <div className="bg-white rounded-lg shadow p-6">
-          <div className="flex items-center">
-            <div className="p-2 bg-blue-100 rounded-lg">
-              <Users className="w-6 h-6 text-blue-600" />
-            </div>
-            <div className="ml-4">
-              <h3 className="text-lg font-semibold text-gray-900">{stats.total}</h3>
-              <p className="text-gray-600">Total</p>
-            </div>
+        {/* Stats Cards */}
+        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
+          <div className="bg-white rounded-lg shadow p-6">
+            <div className="flex items-center">
+              <div className="p-2 bg-blue-100 rounded-lg">
+                <Users className="w-6 h-6 text-blue-600" />
+              </div>
+              <div className="ml-4">
+                <h3 className="text-lg font-semibold text-gray-900">{stats.total}</h3>
+                <p className="text-gray-600">Total</p>
+              </div>
+            </div>
           </div>
-        </div>
 
-        <div className="bg-white rounded-lg shadow p-6">
-          <div className="flex items-center">
-            <div className="p-2 bg-yellow-100 rounded-lg">
-              <Clock className="w-6 h-6 text-yellow-600" />
-            </div>
-            <div className="ml-4">
-              <h3 className="text-lg font-semibold text-gray-900">{stats.pending}</h3>
-              <p className="text-gray-600">Pendentes</p>
-            </div>
+          <div className="bg-white rounded-lg shadow p-6">
+            <div className="flex items-center">
+              <div className="p-2 bg-yellow-100 rounded-lg">
+                <Clock className="w-6 h-6 text-yellow-600" />
+              </div>
+              <div className="ml-4">
+                <h3 className="text-lg font-semibold text-gray-900">{stats.pending}</h3>
+                <p className="text-gray-600">Pendentes</p>
+              </div>
+            </div>
           </div>
-        </div>
 
-        <div className="bg-white rounded-lg shadow p-6">
-          <div className="flex items-center">
-            <div className="p-2 bg-green-100 rounded-lg">
-              <CheckCircle className="w-6 h-6 text-green-600" />
-            </div>
-            <div className="ml-4">
-              <h3 className="text-lg font-semibold text-gray-900">{stats.approved}</h3>
-              <p className="text-gray-600">Aprovados</p>
-            </div>
+          <div className="bg-white rounded-lg shadow p-6">
+            <div className="flex items-center">
+              <div className="p-2 bg-green-100 rounded-lg">
+                <CheckCircle className="w-6 h-6 text-green-600" />
+              </div>
+              <div className="ml-4">
+                <h3 className="text-lg font-semibold text-gray-900">{stats.approved}</h3>
+                <p className="text-gray-600">Aprovados</p>
+              </div>
+            </div>
           </div>
-        </div>
 
-        <div className="bg-white rounded-lg shadow p-6">
-          <div className="flex items-center">
-            <div className="p-2 bg-red-100 rounded-lg">
-              <XCircle className="w-6 h-6 text-red-600" />
-            </div>
-            <div className="ml-4">
-              <h3 className="text-lg font-semibold text-gray-900">{stats.rejected}</h3>
-              <p className="text-gray-600">Rejeitados</p>
-            </div>
+          <div className="bg-white rounded-lg shadow p-6">
+            <div className="flex items-center">
+              <div className="p-2 bg-red-100 rounded-lg">
+                <XCircle className="w-6 h-6 text-red-600" />
+              </div>
+              <div className="ml-4">
+                <h3 className="text-lg font-semibold text-gray-900">{stats.rejected}</h3>
+                <p className="text-gray-600">Rejeitados</p>
+              </div>
+            </div>
           </div>
         </div>
-      </div>
 
-      {/* Filters */}
-      <div className="bg-white rounded-lg shadow p-6">
-        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
-          <div className="flex-1 max-w-lg">
-            <div className="relative">
-              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
-              <input
-                type="text"
-                placeholder="Buscar por nome, CPF, email ou empresa..."
-                value={searchTerm}
-                onChange={(e) => setSearchTerm(e.target.value)}
-                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
-              />
+        {/* Filters */}
+        <div className="bg-white rounded-lg shadow p-6">
+          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
+            <div className="flex-1 max-w-lg">
+              <div className="relative">
+                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
+                <input
+                  type="text"
+                  placeholder="Buscar por nome, CPF, email ou empresa..."
+                  value={searchTerm}
+                  onChange={(e) => setSearchTerm(e.target.value)}
+                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
+                />
+              </div>
             </div>
-          </div>
 
-          <div className="flex items-center space-x-4">
-            <div className="flex items-center space-x-2">
-              <Filter className="w-4 h-4 text-gray-400" />
-              <select
-                value={statusFilter}
-                onChange={(e) => setStatusFilter(e.target.value as any)}
-                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
-              >
-                <option value="all">Todos</option>
-                <option value="pending">Pendentes</option>
-                <option value="approved">Aprovados</option>
-                <option value="rejected">Rejeitados</option>
-              </select>
+            <div className="flex items-center space-x-4">
+              <div className="flex items-center space-x-2">
+                <Filter className="w-4 h-4 text-gray-400" />
+                <select
+                  value={statusFilter}
+                  onChange={(e) => setStatusFilter(e.target.value as any)}
+                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
+                >
+                  <option value="all">Todos</option>
+                  <option value="pending">Pendentes</option>
+                  <option value="approved">Aprovados</option>
+                  <option value="rejected">Rejeitados</option>
+                </select>
+              </div>
             </div>
           </div>
         </div>
-      </div>
 
-      {/* Drivers Table */}
-      <div className="bg-white rounded-lg shadow overflow-hidden">
-        <div className="overflow-x-auto">
-          <table className="min-w-full divide-y divide-gray-200">
-            <thead className="bg-gray-50">
-              <tr>
-                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
-                  Motorista
-                </th>
-                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
-                  Empresa
-                </th>
-                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
-                  Status
-                </th>
-                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
-                  Data de Cadastro
-                </th>
-                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
-                  Ações
-                </th>
-              </tr>
-            </thead>
-            <tbody className="bg-white divide-y divide-gray-200">
-              {filteredDrivers.map((driver) => (
-                <tr key={driver.id} className="hover:bg-gray-50">
-                  <td className="px-6 py-4 whitespace-nowrap">
-                    <div>
-                      <div className="text-sm font-medium text-gray-900">
-                        {driver.full_name}
-                      </div>
-                      <div className="text-sm text-gray-500">
-                        {driver.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
-                      </div>
-                      <div className="text-sm text-gray-500">
-                        {driver.email}
-                      </div>
-                    </div>
-                  </td>
-                  <td className="px-6 py-4 whitespace-nowrap">
-                    <div className="text-sm text-gray-900">{driver.company_name}</div>
-                    <div className="text-sm text-gray-500">ID: {driver.company_id}</div>
-                  </td>
-                  <td className="px-6 py-4 whitespace-nowrap">
-                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
-                      {getStatusIcon(driver.status)}
-                      <span>{getStatusText(driver.status)}</span>
-                    </span>
-                  </td>
-                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
-                    {new Date(driver.created_at).toLocaleDateString('pt-BR')}
-                  </td>
-                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
-                    <div className="flex items-center space-x-3">
-                      <button
-                        onClick={() => setSelectedDriver(driver)}
-                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
-                      >
-                        <Eye className="w-4 h-4" />
-                        <span>Ver</span>
-                      </button>
-                      
-                      {driver.status === 'pending' && (
-                        <>
-                          <button
-                            onClick={() => updateDriverStatus(driver.id, 'approved')}
-                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
-                          >
-                            <CheckCircle className="w-4 h-4" />
-                            <span>Aprovar</span>
-                          </button>
-                          <button
-                            onClick={() => updateDriverStatus(driver.id, 'rejected')}
-                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
-                          >
-                            <XCircle className="w-4 h-4" />
-                            <span>Rejeitar</span>
-                          </button>
-                        </>
-                      )}
-                    </div>
-                  </td>
+        {/* Drivers Table */}
+        <div className="bg-white rounded-lg shadow overflow-hidden">
+          <div className="overflow-x-auto">
+            <table className="min-w-full divide-y divide-gray-200">
+              <thead className="bg-gray-50">
+                <tr>
+                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                    Motorista
+                  </th>
+                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                    Empresa
+                  </th>
+                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                    Status
+                  </th>
+                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                    Data de Cadastro
+                  </th>
+                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                    Ações
+                  </th>
                 </tr>
-              ))}
-            </tbody>
-          </table>
-        </div>
+              </thead>
+              <tbody className="bg-white divide-y divide-gray-200">
+                {filteredDrivers.map((driver) => (
+                  <tr key={driver.id} className="hover:bg-gray-50">
+                    <td className="px-6 py-4 whitespace-nowrap">
+                      <div>
+                        <div className="text-sm font-medium text-gray-900">
+                          {driver.full_name}
+                        </div>
+                        <div className="text-sm text-gray-500">
+                          {driver.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
+                        </div>
+                        <div className="text-sm text-gray-500">
+                          {driver.email}
+                        </div>
+                      </div>
+                    </td>
+                    <td className="px-6 py-4 whitespace-nowrap">
+                      <div className="text-sm text-gray-900">{driver.company_name}</div>
+                      <div className="text-sm text-gray-500">ID: {driver.company_id}</div>
+                    </td>
+                    <td className="px-6 py-4 whitespace-nowrap">
+                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
+                        {getStatusIcon(driver.status)}
+                        <span>{getStatusText(driver.status)}</span>
+                      </span>
+                    </td>
+                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
+                      {new Date(driver.created_at).toLocaleDateString('pt-BR')}
+                    </td>
+                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
+                      <div className="flex items-center space-x-3">
+                        <button
+                          onClick={() => setSelectedDriver(driver)}
+                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
+                        >
+                          <Eye className="w-4 h-4" />
+                          <span>Ver</span>
+                        </button>
+                        
+                        {driver.status === 'pending' && (
+                          <>
+                            <button
+                              onClick={() => updateDriverStatus(driver.id, 'approved')}
+                              className="text-green-600 hover:text-green-900 flex items-center space-x-1"
+                            >
+                              <CheckCircle className="w-4 h-4" />
+                              <span>Aprovar</span>
+                            </button>
+                            <button
+                              onClick={() => updateDriverStatus(driver.id, 'rejected')}
+                              className="text-red-600 hover:text-red-900 flex items-center space-x-1"
+                            >
+                              <XCircle className="w-4 h-4" />
+                              <span>Rejeitar</span>
+                            </button>
+                          </>
+                        )}
+                      </div>
+                    </td>
+                  </tr>
+                ))}
+              </tbody>
+            </table>
+          </div>
 
-        {filteredDrivers.length === 0 && (
-          <div className="text-center py-12">
-            <p className="text-gray-500">Nenhum motorista encontrado.</p>
+          {filteredDrivers.length === 0 && (
+            <div className="text-center py-12">
+              <p className="text-gray-500">Nenhum motorista encontrado.</p>
+            </div>
+          )}
+        </div>
+
+        {/* Driver Modal */}
+        {selectedDriver && (
+          <DriverModal
+            driver={selectedDriver}
+            onClose={() => setSelectedDriver(null)}
+            onStatusUpdate={updateDriverStatus}
+          />
+        )}
+      </div>
+    </AdminLayout>
+  )
+}
+
+export default AdminDashboard