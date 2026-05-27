import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import appointmentReducer from './slices/appointmentSlice'
import emergencyReducer from './slices/emergencySlice'
import notificationReducer from './slices/notificationSlice'
import occupancyReducer from './slices/occupancySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    appointments: appointmentReducer,
    emergency: emergencyReducer,
    notifications: notificationReducer,
    occupancy: occupancyReducer,
  },
})
