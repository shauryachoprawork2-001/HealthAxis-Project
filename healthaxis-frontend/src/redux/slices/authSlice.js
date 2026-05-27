import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@/api/axiosInstance'

const user = localStorage.getItem('hax_user')
  ? JSON.parse(localStorage.getItem('hax_user'))
  : null

const token = localStorage.getItem('hax_token') || null

// LOGIN
export const login = createAsyncThunk(
  'auth/login',
  async (creds, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        '/auth/login',
        creds
      )

      return data.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed'
      )
    }
  }
)

// REGISTER
export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        '/auth/register',
        payload
      )

      return data.data
    } catch (err) {
      console.error('REGISTER ERROR:', err)

      return rejectWithValue(
        err.response?.data?.message ||
        err.message ||
        'Registration failed'
      )
    }
  }
)

// LOGOUT
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch {}

    localStorage.removeItem('hax_token')
    localStorage.removeItem('hax_refresh')
    localStorage.removeItem('hax_user')
  }
)

const handleAuth = (state, { payload }) => {
  state.loading = false

  state.user = {
    id: payload.userId,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role,
  }

  state.token = payload.accessToken
  state.isAuthenticated = true
  state.error = null

  localStorage.setItem(
    'hax_token',
    payload.accessToken
  )

  localStorage.setItem(
    'hax_refresh',
    payload.refreshToken
  )

  localStorage.setItem(
    'hax_user',
    JSON.stringify(state.user)
  )
}

const authSlice = createSlice({
  name: 'auth',

  initialState: {
    user,
    token,
    loading: false,
    error: null,
    isAuthenticated: !!token,
  },

  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(login.fulfilled, handleAuth)

      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(register.fulfilled, handleAuth)

      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError } = authSlice.actions

export default authSlice.reducer