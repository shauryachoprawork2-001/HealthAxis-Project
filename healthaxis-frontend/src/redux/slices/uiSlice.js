import { createSlice } from '@reduxjs/toolkit'
const theme = localStorage.getItem('hax_theme') || 'light'
if (theme === 'dark') document.documentElement.classList.add('dark')

const uiSlice = createSlice({
  name: 'ui',
  initialState: { theme, sidebarOpen: true, sidebarCollapsed: false },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('hax_theme', state.theme)
      document.documentElement.classList.toggle('dark', state.theme === 'dark')
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebarCollapsed: (state, { payload }) => { state.sidebarCollapsed = payload },
  }
})
export const { toggleTheme, toggleSidebar, setSidebarCollapsed } = uiSlice.actions
export default uiSlice.reducer
