import axiosInstance from './axiosInstance'
export const emergencyApi = {
  create: (data) => axiosInstance.post('/emergency', data),
  getQueue: () => axiosInstance.get('/emergency/queue'),
  triage: (id, priority, notes) => axiosInstance.patch(`/emergency/${id}/triage`, null, { params: { priority, notes } }),
  assignDoctor: (id, doctorId) => axiosInstance.patch(`/emergency/${id}/assign-doctor`, null, { params: { doctorId } }),
  assignBed: (id, bedId) => axiosInstance.patch(`/emergency/${id}/assign-bed`, null, { params: { bedId } }),
}
