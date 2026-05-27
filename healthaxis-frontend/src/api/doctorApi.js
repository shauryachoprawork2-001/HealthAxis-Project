import axiosInstance from './axiosInstance'

export const doctorApi = {
  search: (params) => axiosInstance.get('/doctors', { params }),
  getById: (id) => axiosInstance.get(`/doctors/${id}`),
  getAvailableSlots: (doctorId, date) =>
    axiosInstance.get('/slots/available', { params: { doctorId, date } }),
  create: (data) => axiosInstance.post('/doctors', data),
  update: (id, data) => axiosInstance.put(`/doctors/${id}`, data),
  getSchedule: (doctorId) => axiosInstance.get(`/doctors/${doctorId}/schedule`),
  createSchedule: (doctorId, data) => axiosInstance.post(`/doctors/${doctorId}/schedule`, data),
  getMyProfile: () => axiosInstance.get('/doctors/me'),
}
