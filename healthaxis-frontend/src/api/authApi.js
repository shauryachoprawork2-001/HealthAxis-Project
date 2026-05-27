import axiosInstance from './axiosInstance'
export const authApi = {
  login: (data) => axiosInstance.post('/auth/login', data),
  register: (data) => axiosInstance.post('/auth/register', data),
  refresh: (refreshToken) => axiosInstance.post('/auth/refresh', null, { headers: { 'X-Refresh-Token': refreshToken } }),
  logout: () => axiosInstance.post('/auth/logout'),
}
