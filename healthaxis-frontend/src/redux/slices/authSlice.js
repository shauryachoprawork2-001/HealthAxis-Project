import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@/api/axiosInstance'

const user = localStorage.getItem('hax_user') ? JSON.parse(localStorage.getItem('hax_user')) : null
const token = localStorage.getItem('hax_token') || null

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/auth/login', creds)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/auth/register', payload)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await axiosInstance.post('/auth/logout') } catch {}
  localStorage.removeItem('hax_token')
  localStorage.removeItem('hax_refresh')
  localStorage.removeItem('hax_user')
})

const handleAuth = (state, { payload }) => {
  state.loading = false
  state.user = { id: payload.userId, email: payload.email, firstName: payload.firstName, lastName: payload.lastName, role: payload.role }
  state.token = payload.accessToken
  state.isAuthenticated = true
  state.error = null
  localStorage.setItem('hax_token', payload.accessToken)
  localStorage.setItem('hax_refresh', payload.refreshToken)
  localStorage.setItem('hax_user', JSON.stringify(state.user))
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { user, token, loading: false, error: null, isAuthenticated: !!token },
  reducers: { clearError: (s) => { s.error = null } },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.loading = true; s.error = null })
     .addCase(login.fulfilled, handleAuth)
     .addCase(login.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
     .addCase(register.pending, (s) => { s.loading = true; s.error = null })
     .addCase(register.fulfilled, handleAuth)
     .addCase(register.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
     .addCase(logout.fulfilled, (s) => { s.user = null; s.token = null; s.isAuthenticated = false })
  }
})
export const { clearError } = authSlice.actions
export default authSlice.reducer
