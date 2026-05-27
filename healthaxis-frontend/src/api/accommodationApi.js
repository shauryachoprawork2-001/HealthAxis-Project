import axiosInstance from './axiosInstance'

export const accommodationApi = {
  search: (params) => axiosInstance.get('/accommodations', { params }),
  getById: (id) => axiosInstance.get(`/accommodations/${id}`),
  book: (data) => axiosInstance.post('/relative-stays', data),
  getMyStays: (params) => axiosInstance.get('/relative-stays/my', { params }),
  cancelStay: (id) => axiosInstance.patch(`/relative-stays/${id}/cancel`),
  requestTransport: (data) => axiosInstance.post('/transport-requests', data),
}
