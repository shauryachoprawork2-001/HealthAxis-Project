import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '@/redux/slices/uiSlice'
export const useTheme = () => {
  const dispatch = useDispatch()
  const theme = useSelector(s => s.ui.theme)
  return { theme, toggleTheme: () => dispatch(toggleTheme()), isDark: theme === 'dark' }
}
