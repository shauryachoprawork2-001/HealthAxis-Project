import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@/api/axiosInstance'

export const fetchMyAppointments = createAsyncThunk('appointments/fetchMine', async (params = {}) => {
  const { data } = await axiosInstance.get('/appointments/my', { params })
  return data.data
})

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: { list: [], pagination: null, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyAppointments.pending, (s) => { s.loading = true })
     .addCase(fetchMyAppointments.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload?.content || []; s.pagination = payload })
     .addCase(fetchMyAppointments.rejected, (s) => { s.loading = false })
  }
})
export default appointmentSlice.reducer
