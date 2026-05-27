import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@/api/axiosInstance'

export const fetchUnreadCount = createAsyncThunk('notifications/unreadCount', async () => {
  const { data } = await axiosInstance.get('/notifications/unread-count')
  return data.data.count
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {
    addNotification: (state, { payload }) => { state.list.unshift(payload); state.unreadCount += 1 },
    setUnreadCount: (state, { payload }) => { state.unreadCount = payload }
  },
  extraReducers: (b) => {
    b.addCase(fetchUnreadCount.fulfilled, (s, { payload }) => { s.unreadCount = payload })
  }
})
export const { addNotification, setUnreadCount } = notificationSlice.actions
export default notificationSlice.reducer
