@@ .. @@
 import React, { useState, useEffect } from 'react'
 import { Search, Filter, Users, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
 import { supabase } from '../../lib/supabase'
 import { Database } from '../../lib/supabase'
+import { useAdminAuth } from '../../contexts/AdminAuthContext'
+import AdminLayout from './AdminLayout'
 import DriverModal from './DriverModal'
 import toast from 'react-hot-toast'
 
@@ .. @@
 
 const AdminDashboard: React.FC = () => {
+  const { user } = useAdminAuth()
   const [drivers, setDrivers] = useState<DriverWithPhotos[]>([])
@@ .. @@
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
+        {/* Stats Cards */}
+        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
@@ .. @@
-      </div>
+        </div>
 
-      {/* Filters */}
-      <div className="bg-white rounded-lg shadow p-6">
+        {/* Filters */}
+        <div className="bg-white rounded-lg shadow p-6">
@@ .. @@
-      </div>
+        </div>
 
-      {/* Drivers Table */}
-      <div className="bg-white rounded-lg shadow overflow-hidden">
+        {/* Drivers Table */}
+        <div className="bg-white rounded-lg shadow overflow-hidden">
@@ .. @@
-      </div>
+        </div>
 
-      {/* Driver Modal */}
-      {selectedDriver && (
-        <DriverModal
-          driver={selectedDriver}
-          onClose={() => setSelectedDriver(null)}
-          onStatusUpdate={updateDriverStatus}
-        />
-      )}
-    </div>
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
   )
 }