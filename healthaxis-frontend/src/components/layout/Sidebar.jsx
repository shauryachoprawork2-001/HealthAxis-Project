import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useAuth } from '@/hooks/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import { setSidebarCollapsed } from '@/redux/slices/uiSlice'
import { logout } from '@/redux/slices/authSlice'

const NAV_BY_ROLE = {
  ADMIN: [
    { path:'/dashboard',     label:'Dashboard',       icon:'⬡' },
    { path:'/emergency',     label:'Emergency',        icon:'🚨', badge:true },
    { path:'/hospitals',     label:'Hospitals',        icon:'🏥' },
    { path:'/beds',          label:'Bed Management',   icon:'🛏️' },
    { path:'/doctors',       label:'Doctors',          icon:'👨‍⚕️' },
    { path:'/patients',      label:'Patients',         icon:'👥' },
    { path:'/appointments',  label:'Appointments',     icon:'📅' },
    { path:'/billing',       label:'Billing',          icon:'💳' },
    { path:'/accommodation', label:'MediStay',         icon:'🏨' },
    { path:'/analytics',     label:'Analytics',        icon:'📊' },
  ],
  DOCTOR: [
    { path:'/dashboard',    label:'Dashboard',      icon:'⬡' },
    { path:'/appointments', label:'Appointments',   icon:'📅' },
    { path:'/patients',     label:'My Patients',    icon:'👥' },
    { path:'/emergency',    label:'Emergency',       icon:'🚨', badge:true },
  ],
  NURSE: [
    { path:'/dashboard',  label:'Dashboard',      icon:'⬡' },
    { path:'/beds',       label:'Bed Management', icon:'🛏️' },
    { path:'/emergency',  label:'Emergency',       icon:'🚨', badge:true },
    { path:'/patients',   label:'Patients',        icon:'👥' },
  ],
  RECEPTIONIST: [
    { path:'/dashboard',     label:'Dashboard',     icon:'⬡' },
    { path:'/appointments',  label:'Appointments',  icon:'📅' },
    { path:'/emergency',     label:'Emergency',      icon:'🚨', badge:true },
    { path:'/billing',       label:'Billing',        icon:'💳' },
    { path:'/accommodation', label:'MediStay',       icon:'🏨' },
  ],
  PATIENT: [
    { path:'/dashboard',     label:'Dashboard',      icon:'⬡' },
    { path:'/appointments',  label:'My Appointments', icon:'📅' },
    { path:'/records',       label:'Health Records',  icon:'📋' },
    { path:'/billing',       label:'Billing',         icon:'💳' },
    { path:'/accommodation', label:'MediStay',        icon:'🏨' },
  ],
}

export const Sidebar = () => {
  const { user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const collapsed = useSelector(s => s.ui.sidebarCollapsed)
  const emergencyQueue = useSelector(s => s.emergency.queue)

  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.PATIENT
  const criticalCount = emergencyQueue.filter(e => ['CRITICAL','HIGH'].includes(e.priority) && ['WAITING','TRIAGED'].includes(e.status)).length

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ type:'spring', stiffness:300, damping:30 }}
      className="fixed left-0 top-0 h-full z-30 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-blue-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-200 dark:shadow-primary-900">
          <span className="text-white font-bold text-base">H</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.15 }}>
              <p className="font-bold text-slate-900 dark:text-white text-base leading-none">HealthAxis</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">Operations Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto scrollbar-hide">
        <div className="space-y-0.5">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              )}>
              <span className="text-base leading-none flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="flex-1 truncate">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && criticalCount > 0 && (
                <span className={clsx(
                  'flex-shrink-0 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse',
                  collapsed ? 'absolute top-1.5 right-1.5 w-4 h-4' : 'w-5 h-5'
                )}>
                  {criticalCount > 9 ? '9+' : criticalCount}
                </span>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-1 flex-shrink-0">
        <button onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          <span className="text-base">{collapsed ? '→' : '←'}</span>
          {!collapsed && <span>Collapse sidebar</span>}
        </button>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all">
          <span className="text-base flex-shrink-0">🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  )
}
