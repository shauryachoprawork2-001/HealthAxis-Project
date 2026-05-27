import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@/api/axiosInstance'

export const fetchEmergencyQueue = createAsyncThunk('emergency/fetchQueue', async () => {
  const { data } = await axiosInstance.get('/emergency/queue')
  return data.data
})

const emergencySlice = createSlice({
  name: 'emergency',
  initialState: { queue: [], loading: false, lastUpdated: null },
  reducers: {
    wsUpdateQueue: (state, { payload }) => {
      const idx = state.queue.findIndex(e => e.id === payload.id)
      if (idx >= 0) state.queue[idx] = payload
      else state.queue.unshift(payload)
      state.lastUpdated = new Date().toISOString()
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchEmergencyQueue.pending, (s) => { s.loading = true })
     .addCase(fetchEmergencyQueue.fulfilled, (s, { payload }) => { s.loading = false; s.queue = payload || [] })
     .addCase(fetchEmergencyQueue.rejected, (s) => { s.loading = false })
  }
})
export const { wsUpdateQueue } = emergencySlice.actions
export default emergencySlice.reducer
