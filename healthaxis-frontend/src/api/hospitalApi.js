import axiosInstance from './axiosInstance'
export const hospitalApi = {
  list: (params) => axiosInstance.get('/hospitals', { params }),
  get: (id) => axiosInstance.get(`/hospitals/${id}`),
  getOccupancy: (id) => axiosInstance.get(`/analytics/occupancy/${id}`),
}
