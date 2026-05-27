import axios from 'axios'
import { store } from '@/redux/store'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hax_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — refresh token on 401
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token))
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      const refreshToken = localStorage.getItem('hax_refresh')
      if (!refreshToken) {
        store.dispatch({ type: 'auth/logout/fulfilled' })
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post('/api/auth/refresh', null, {
          headers: { 'X-Refresh-Token': refreshToken }
        })
        const newToken = data.data.accessToken
        localStorage.setItem('hax_token', newToken)
        localStorage.setItem('hax_refresh', data.data.refreshToken)
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return axiosInstance(originalRequest)
      } catch (err) {
        processQueue(err, null)
        store.dispatch({ type: 'auth/logout/fulfilled' })
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
