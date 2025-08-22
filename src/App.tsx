@@ .. @@
 import React from 'react'
 import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
 import { Toaster } from 'react-hot-toast'
 import { AuthProvider } from './contexts/AuthContext'
+import { AdminAuthProvider } from './contexts/AdminAuthContext'
 import Layout from './components/Layout/Layout'
 import ProtectedRoute from './components/Auth/ProtectedRoute'
+import ProtectedAdminRoute from './components/Admin/ProtectedAdminRoute'
 import Home from './pages/Home'
-import AdminLogin from './pages/AdminLogin'
+import AdminLogin from './components/Admin/AdminLogin'
 import LoginForm from './components/Forms/LoginForm'
 import DriverRegistrationForm from './components/Forms/DriverRegistrationForm'
 import DriverDashboard from './components/Dashboard/DriverDashboard'
 import AdminDashboard from './components/Admin/AdminDashboard'
 
 function App() {
   return (
-    <AuthProvider>
-      <Router>
-        <Layout>
-          <Routes>
-            <Route path="/" element={<Home />} />
-            <Route path="/login" element={<LoginForm />} />
-            <Route path="/admin-login" element={<AdminLogin />} />
-            <Route path="/register" element={<DriverRegistrationForm />} />
-            
-            <Route 
-              path="/dashboard" 
-              element={
-                <ProtectedRoute>
-                  <DriverDashboard />
-                </ProtectedRoute>
-              } 
-            />
-            
-            <Route 
-              path="/admin" 
-              element={
-                <ProtectedRoute adminOnly>
-                  <AdminDashboard />
-                </ProtectedRoute>
-              } 
-            />
-          </Routes>
-        </Layout>
-        
-        <Toaster
-          position="top-right"
-          toastOptions={{
-            duration: 4000,
-            style: {
-              background: '#363636',
-              color: '#fff',
-            },
-            success: {
-              duration: 3000,
-              style: {
-                background: '#10B981',
-              },
-            },
-            error: {
-              duration: 5000,
-              style: {
-                background: '#EF4444',
-              },
-            },
-          }}
-        />
-      </Router>
-    </AuthProvider>
+    <AdminAuthProvider>
+      <AuthProvider>
+        <Router>
+          <Routes>
+            {/* Public Routes */}
+            <Route path="/" element={<Layout><Home /></Layout>} />
+            <Route path="/login" element={<Layout><LoginForm /></Layout>} />
+            <Route path="/register" element={<Layout><DriverRegistrationForm /></Layout>} />
+            
+            {/* Admin Routes */}
+            <Route path="/admin-login" element={<AdminLogin />} />
+            <Route 
+              path="/admin" 
+              element={
+                <ProtectedAdminRoute>
+                  <AdminDashboard />
+                </ProtectedAdminRoute>
+              } 
+            />
+            
+            {/* Driver Protected Routes */}
+            <Route 
+              path="/dashboard" 
+              element={
+                <ProtectedRoute>
+                  <Layout><DriverDashboard /></Layout>
+                </ProtectedRoute>
+              } 
+            />
+          </Routes>
+          
+          <Toaster
+            position="top-right"
+            toastOptions={{
+              duration: 4000,
+              style: {
+                background: '#363636',
+                color: '#fff',
+              },
+              success: {
+                duration: 3000,
+                style: {
+                  background: '#10B981',
+                },
+              },
+              error: {
+                duration: 5000,
+                style: {
+                  background: '#EF4444',
+                },
+              },
+            }}
+          />
+        </Router>
+      </AuthProvider>
+    </AdminAuthProvider>
   )
 }