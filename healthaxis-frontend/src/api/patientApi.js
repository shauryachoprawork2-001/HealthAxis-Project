import axiosInstance from './axiosInstance'

export const patientApi = {
  getMe: () => axiosInstance.get('/patients/me'),
  update: (data) => axiosInstance.put('/patients/me', data),
  getAll: (params) => axiosInstance.get('/patients', { params }),
  getById: (id) => axiosInstance.get(`/patients/${id}`),
  getMedicalRecords: (params) => axiosInstance.get('/medical-records/my', { params }),
  getAdmissions: (params) => axiosInstance.get('/admissions/my', { params }),
}
