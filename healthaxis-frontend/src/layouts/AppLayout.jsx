import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export const AppLayout = () => {
  const collapsed = useSelector(s => s.ui.sidebarCollapsed)
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-dark">
      <Sidebar />
      <Header />
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? 68 : 260 }}
      >
        <div className="p-6 max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
