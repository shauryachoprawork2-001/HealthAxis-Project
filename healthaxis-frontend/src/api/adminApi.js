import axiosInstance from './axiosInstance'

export const adminApi = {
  createDoctor: (data) => axiosInstance.post('/admin/doctors', data),
  createUser: (data) => axiosInstance.post('/admin/users', data),
  createHospital: (data) => axiosInstance.post('/admin/hospitals', data),
  createWard: (data) => axiosInstance.post('/admin/wards', data),
  getDashboard: () => axiosInstance.get('/analytics/dashboard'),
}
