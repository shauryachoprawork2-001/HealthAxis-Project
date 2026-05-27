import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/layouts/AppLayout'
import { useEffect } from 'react'
import { wsService } from '@/services/websocketService'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import HospitalsPage from '@/pages/admin/HospitalsPage'
import DoctorsPage from '@/pages/admin/DoctorsPage'
import PatientsPage from '@/pages/admin/PatientsPage'
import BedsPage from '@/pages/admin/BedsPage'
import AnalyticsPage from '@/pages/admin/AnalyticsPage'
import DoctorDashboard from '@/pages/doctor/DoctorDashboard'
import AppointmentsPage from '@/pages/patient/AppointmentsPage'
import HealthRecordsPage from '@/pages/patient/HealthRecordsPage'
import EmergencyDashboard from '@/pages/emergency/EmergencyDashboard'
import BillingPage from '@/pages/billing/BillingPage'
import AccommodationPage from '@/pages/accommodation/AccommodationPage'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return children
}

const DashboardRedirect = () => {
  const { user } = useAuth()
  if (user?.role === 'DOCTOR') return <DoctorDashboard />
  return <AdminDashboard />
}

export default function App() {
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      wsService.connect(user.id)
      return () => wsService.disconnect()
    }
  }, [isAuthenticated, user?.id])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardRedirect />} />
        <Route path="hospitals" element={<ProtectedRoute roles={['ADMIN','RECEPTIONIST','DOCTOR','NURSE']}><HospitalsPage /></ProtectedRoute>} />
        <Route path="doctors" element={<ProtectedRoute roles={['ADMIN','RECEPTIONIST']}><DoctorsPage /></ProtectedRoute>} />
        <Route path="patients" element={<ProtectedRoute roles={['ADMIN','DOCTOR','NURSE','RECEPTIONIST']}><PatientsPage /></ProtectedRoute>} />
        <Route path="beds" element={<ProtectedRoute roles={['ADMIN','NURSE','RECEPTIONIST']}><BedsPage /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute roles={['ADMIN']}><AnalyticsPage /></ProtectedRoute>} />
        <Route path="emergency" element={<ProtectedRoute roles={['ADMIN','DOCTOR','NURSE','RECEPTIONIST']}><EmergencyDashboard /></ProtectedRoute>} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="records" element={<ProtectedRoute roles={['PATIENT','DOCTOR','ADMIN']}><HealthRecordsPage /></ProtectedRoute>} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="accommodation" element={<AccommodationPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
