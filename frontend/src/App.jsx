import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Login           from './pages/Login'
import Register        from './pages/Register'
import ForgotPassword  from './pages/ForgotPassword'
import Dashboard       from './pages/Dashboard'
import Upload          from './pages/Upload'
import Predictions     from './pages/Predictions'
import Forecast        from './pages/Forecast'
import Simulator       from './pages/Simulator'
import Recommendations from './pages/Recommendations'
import History         from './pages/History'
import Reports         from './pages/Reports'
import Profile         from './pages/Profile'
import AdminPanel      from './pages/AdminPanel'
import NotFound        from './pages/NotFound'

const Protected = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
)

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected */}
            <Route path="/dashboard"       element={<Protected><Dashboard /></Protected>} />
            <Route path="/upload"          element={<Protected roles={['admin','manager']}><Upload /></Protected>} />
            <Route path="/predictions"     element={<Protected><Predictions /></Protected>} />
            <Route path="/forecast"        element={<Protected><Forecast /></Protected>} />
            <Route path="/simulator"       element={<Protected roles={['admin','analyst']}><Simulator /></Protected>} />
            <Route path="/recommendations" element={<Protected><Recommendations /></Protected>} />
            <Route path="/history"         element={<Protected><History /></Protected>} />
            <Route path="/reports"         element={<Protected><Reports /></Protected>} />
            <Route path="/profile"         element={<Protected><Profile /></Protected>} />
            <Route path="/admin-panel"     element={<Protected roles={['admin']}><AdminPanel /></Protected>} />

            {/* Redirects */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}
