import axios from 'axios'
import { store } from '@/redux/store'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hax_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Handle token refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
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
        const { data } = await axiosInstance.post(
          '/auth/refresh',
          null,
          {
            headers: {
              'X-Refresh-Token': refreshToken,
            },
          }
        )

        const newToken = data.data.accessToken
        const newRefresh = data.data.refreshToken

        localStorage.setItem('hax_token', newToken)
        localStorage.setItem('hax_refresh', newRefresh)

        axiosInstance.defaults.headers.common.Authorization =
          `Bearer ${newToken}`

        processQueue(null, newToken)

        originalRequest.headers.Authorization =
          `Bearer ${newToken}`

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