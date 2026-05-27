import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@/api/axiosInstance'

export const fetchOccupancy = createAsyncThunk('occupancy/fetch', async (hospitalId) => {
  const { data } = await axiosInstance.get(`/analytics/occupancy/${hospitalId}`)
  return data.data
})

const occupancySlice = createSlice({
  name: 'occupancy',
  initialState: { data: null, loading: false },
  reducers: { wsUpdateOccupancy: (state, { payload }) => { state.data = { ...state.data, ...payload } } },
  extraReducers: (b) => {
    b.addCase(fetchOccupancy.fulfilled, (s, { payload }) => { s.data = payload; s.loading = false })
     .addCase(fetchOccupancy.pending, (s) => { s.loading = true })
  }
})
export const { wsUpdateOccupancy } = occupancySlice.actions
export default occupancySlice.reducer
