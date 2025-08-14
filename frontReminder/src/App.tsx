/*
 * Medication Reminder - Frontend Application
 * Copyright (C) 2025 Francisco [Tu Apellido/Empresa]. All Rights Reserved.
 * 
 * This software is proprietary and confidential. Unauthorized copying, distribution,
 * modification, or use of this software is strictly prohibited without prior written
 * permission from the copyright holder.
 */

import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { Suspense } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks';

// Componentes de layout (no lazy, se necesitan inmediatamente)
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout';
import { PageLoader } from './components/LoadingSpinner';

// Lazy loading de páginas
const Analytics = React.lazy(() => import('./pages/Analytics/Analytics'));
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const MedicationForm = React.lazy(() => import('./pages/Medications/MedicationForm'));
const Medications = React.lazy(() => import('./pages/Medications/Medications'));
const Monitoring = React.lazy(() => import('./pages/Monitoring/Monitoring'));
const Notifications = React.lazy(() => import('./pages/Notifications/Notifications'));
const Profile = React.lazy(() => import('./pages/Profile/Profile'));
const Schedules = React.lazy(() => import('./pages/Schedules/Schedules'));
const Users = React.lazy(() => import('./pages/Users/Users'));

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente para rutas públicas (redirige si ya está autenticado)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={
                <PublicRoute>
                  <PublicLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Login />
                    </Suspense>
                  </PublicLayout>
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <PublicLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Register />
                    </Suspense>
                  </PublicLayout>
                </PublicRoute>
              } />

              {/* Rutas protegidas */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/medications" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Medications />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/medications/new" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <MedicationForm />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/medications/:id/edit" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <MedicationForm />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/schedules" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Schedules />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Notifications />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Analytics />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Profile />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/monitoring" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Monitoring />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Users />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Ruta por defecto */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Ruta 404 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Página no encontrada</p>
                    <a href="/dashboard" className="btn-primary">
                      Volver al Dashboard
                    </a>
                  </div>
                </div>
              } />
            </Routes>

            {/* Notificaciones toast */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
