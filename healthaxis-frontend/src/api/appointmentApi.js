import axiosInstance from './axiosInstance'
export const appointmentApi = {
  book: (data) => axiosInstance.post('/appointments', data),
  getMyAppointments: (params) => axiosInstance.get('/appointments/my', { params }),
  getDoctorAppointments: (params) => axiosInstance.get('/appointments/doctor', { params }),
  cancel: (id, reason) => axiosInstance.patch(`/appointments/${id}/cancel`, null, { params: { reason } }),
  updateStatus: (id, status) => axiosInstance.patch(`/appointments/${id}/status`, null, { params: { status } }),
  getAvailableSlots: (doctorId, date) => axiosInstance.get('/consultation-slots/available', { params: { doctorId, date } }),
}
