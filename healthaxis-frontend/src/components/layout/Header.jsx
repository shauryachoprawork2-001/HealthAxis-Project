import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '@/redux/slices/uiSlice'
import { useAuth } from '@/hooks/useAuth'
import { fetchUnreadCount } from '@/redux/slices/notificationSlice'
import { logout } from '@/redux/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axiosInstance from '@/api/axiosInstance'

export const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const theme = useSelector(s => s.ui.theme)
  const collapsed = useSelector(s => s.ui.sidebarCollapsed)
  const unreadCount = useSelector(s => s.notifications.unreadCount)

  const [showNotifs, setShowNotifs] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [notifs, setNotifs] = useState([])
  const notifRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    if (user) dispatch(fetchUnreadCount())
  }, [user])

  useEffect(() => {
    if (showNotifs) {
      axiosInstance.get('/notifications', { params:{ page:0, size:8 } })
        .then(r => setNotifs(r.data.data?.content || []))
        .catch(() => setNotifs([
          { id:'1', title:'Appointment Confirmed', message:'Your appointment with Dr. Arjun Mehta is confirmed for tomorrow at 10:30 AM', type:'APPOINTMENT_CONFIRMED', isRead:false, createdAt: new Date(Date.now()-1800000).toISOString() },
          { id:'2', title:'Payment Received', message:'Payment of ₹8,500 for invoice INV-A1B2C3D4 has been processed successfully', type:'PAYMENT_CONFIRMATION', isRead:false, createdAt: new Date(Date.now()-7200000).toISOString() },
          { id:'3', title:'Discharge Notice', message:'Patient Rahul Verma has been discharged from Bed GWA-003', type:'DISCHARGE_NOTICE', isRead:true, createdAt: new Date(Date.now()-86400000).toISOString() },
        ]))
    }
  }, [showNotifs])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await axiosInstance.post('/notifications/mark-all-read').catch(() => {})
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    dispatch(fetchUnreadCount())
  }

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso)
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
    return `${Math.floor(diff/86400000)}d ago`
  }

  const NOTIF_ICON = {
    APPOINTMENT_CONFIRMED:'📅', APPOINTMENT_CANCELLED:'❌', PAYMENT_CONFIRMATION:'💳',
    EMERGENCY_ALERT:'🚨', DISCHARGE_NOTICE:'🏥', BED_ASSIGNED:'🛏️', GENERAL:'ℹ️',
  }

  return (
    <header
      className="fixed top-0 right-0 z-20 h-16 flex items-center gap-3 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-300"
      style={{ left: collapsed ? 68 : 260 }}>

      <div className="flex-1">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
          {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button onClick={() => dispatch(toggleTheme())}
          className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => { setShowNotifs(s=>!s); setShowUser(false) }}
            className="relative w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
            <span className="text-base">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity:0, y:8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.97 }}
                className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Mark all read</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700">
                  {notifs.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400">No notifications</div>
                  ) : notifs.map(n => (
                    <div key={n.id} className={`px-4 py-3 flex gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <span className="text-xl flex-shrink-0 mt-0.5">{NOTIF_ICON[n.type] || '📢'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-snug ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-slate-300 dark:text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button onClick={() => { setShowUser(s=>!s); setShowNotifs(false) }}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-2 py-1.5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{user?.role}</p>
            </div>
            <span className="text-slate-300 text-xs">▾</span>
          </button>

          <AnimatePresence>
            {showUser && (
              <motion.div initial={{ opacity:0, y:8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.97 }}
                className="absolute right-0 top-11 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                </div>
                <div className="py-1">
                  {[
                    { label:'Dashboard', icon:'⬡', action: () => navigate('/dashboard') },
                    { label:'Settings',  icon:'⚙️', action: () => {} },
                  ].map(item => (
                    <button key={item.label} onClick={() => { item.action(); setShowUser(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 transition-colors">
                      <span>{item.icon}</span>{item.label}
                    </button>
                  ))}
                  <hr className="border-slate-100 dark:border-slate-700 my-1" />
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition-colors">
                    🚪 Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
