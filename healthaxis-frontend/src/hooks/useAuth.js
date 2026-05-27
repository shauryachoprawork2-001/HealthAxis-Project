import { useSelector, useDispatch } from 'react-redux'
import { login, logout, register, clearError } from '@/redux/slices/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, token, loading, error, isAuthenticated } = useSelector(s => s.auth)
  return {
    user, token, loading, error, isAuthenticated,
    login: (creds) => dispatch(login(creds)),
    register: (data) => dispatch(register(data)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
    isAdmin: user?.role === 'ADMIN',
    isDoctor: user?.role === 'DOCTOR',
    isPatient: user?.role === 'PATIENT',
    isNurse: user?.role === 'NURSE',
    isReceptionist: user?.role === 'RECEPTIONIST',
  }
}
