import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'
import { StatCard } from '@/components/ui/StatCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { useSelector, useDispatch } from 'react-redux'
import { fetchEmergencyQueue } from '@/redux/slices/emergencySlice'
import { fetchUnreadCount } from '@/redux/slices/notificationSlice'
import axiosInstance from '@/api/axiosInstance'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#3b82f6','#22c55e','#f97316','#ef4444','#a855f7']

const WEEK_APPTS = [
  { day:'Mon', appointments:48, emergency:5 },
  { day:'Tue', appointments:62, emergency:8 },
  { day:'Wed', appointments:55, emergency:3 },
  { day:'Thu', appointments:71, emergency:12 },
  { day:'Fri', appointments:83, emergency:7 },
  { day:'Sat', appointments:39, emergency:15 },
  { day:'Sun', appointments:24, emergency:9 },
]
const REVENUE = [
  { month:'Jan', r:420 },{ month:'Feb', r:510 },{ month:'Mar', r:480 },
  { month:'Apr', r:620 },{ month:'May', r:590 },{ month:'Jun', r:710 },
]
const DEPT_PIE = [
  { name:'Cardiology', value:28 },{ name:'Neurology', value:18 },
  { name:'Orthopedics', value:22 },{ name:'Pediatrics', value:15 },{ name:'Emergency', value:17 },
]

const QUICK_ACTIONS = [
  { label:'New Emergency', icon:'🚨', path:'/emergency', color:'bg-red-500 hover:bg-red-600' },
  { label:'Book Appointment', icon:'📅', path:'/appointments', color:'bg-blue-500 hover:bg-blue-600' },
  { label:'Add Doctor', icon:'👨‍⚕️', path:'/doctors', color:'bg-purple-500 hover:bg-purple-600' },
  { label:'Bed Allocation', icon:'🛏️', path:'/beds', color:'bg-green-500 hover:bg-green-600' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const emergencyQueue = useSelector(s => s.emergency.queue)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dispatch(fetchEmergencyQueue())
    dispatch(fetchUnreadCount())
    axiosInstance.get('/analytics/dashboard')
      .then(r => setStats(r.data.data))
      .catch(() => setStats({ totalPatients:1842, totalDoctors:124, activeAdmissions:87, emergencyQueueSize:3, revenueThisMonth:710000, revenueLastMonth:590000 }))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => n != null ? Number(n).toLocaleString('en-IN') : '—'
  const fmtCur = (n) => n != null ? `₹${(n/100000).toFixed(1)}L` : '—'
  const revTrend = stats?.revenueLastMonth > 0
    ? Math.round(((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100)
    : null

  const greet = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Good {greet}, {user?.firstName} — here's your hospital overview for{' '}
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
          </p>
        </div>
        {/* Emergency alert banner */}
        {emergencyQueue.filter(e => e.priority === 'CRITICAL').length > 0 && (
          <motion.button initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            onClick={() => navigate('/emergency')}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors animate-pulse">
            🚨 {emergencyQueue.filter(e=>e.priority==='CRITICAL').length} Critical
          </motion.button>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((a, i) => (
          <motion.button key={a.label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
            onClick={() => navigate(a.path)}
            className={`${a.color} text-white rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg`}>
            <span className="text-2xl block mb-2">{a.icon}</span>
            <span className="text-sm font-bold">{a.label}</span>
          </motion.button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title:'Total Patients',      value:fmt(stats?.totalPatients),    color:'blue',   subtitle:'Registered' },
          { title:'Active Doctors',      value:fmt(stats?.totalDoctors),     color:'green',  subtitle:'On staff' },
          { title:'Active Admissions',   value:fmt(stats?.activeAdmissions), color:'purple', subtitle:'Inpatients' },
          { title:'Emergency Queue',     value:fmt(stats?.emergencyQueueSize || emergencyQueue.length), color: (stats?.emergencyQueueSize || emergencyQueue.length) > 5 ? 'red' : 'orange', subtitle:'Awaiting triage' },
        ].map((s, i) => (
          <motion.div key={s.title} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
            <StatCard {...s} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
          <StatCard title="Revenue This Month" value={fmtCur(stats?.revenueThisMonth)} color="green" loading={loading} trend={revTrend} subtitle="Gross billing" />
        </motion.div>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}>
          <StatCard title="Occupancy Rate" value="73.4%" color="purple" loading={loading} subtitle="Across all wards" />
        </motion.div>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
          <StatCard title="Avg ER Wait Time" value="18 min" color="orange" loading={loading} subtitle="Emergency triage" />
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Appointment trend */}
        <motion.div className="card p-5 lg:col-span-2" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
          <h2 className="section-title mb-1">Appointment & Emergency Trend</h2>
          <p className="text-xs text-slate-400 mb-4">Last 7 days</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={WEEK_APPTS}>
              <defs>
                <linearGradient id="apptG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="emgG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', fontSize:12 }} />
              <Area type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={2} fill="url(#apptG)" name="Appointments" />
              <Area type="monotone" dataKey="emergency"    stroke="#ef4444" strokeWidth={2} fill="url(#emgG)"  name="Emergency" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Dept pie */}
        <motion.div className="card p-5" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}>
          <h2 className="section-title mb-1">Dept. Distribution</h2>
          <p className="text-xs text-slate-400 mb-4">Patients by department</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={DEPT_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {DEPT_PIE.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius:'10px', border:'none', fontSize:12 }} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize:11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Revenue bar */}
      <motion.div className="card p-5" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Monthly Revenue</h2>
            <p className="text-xs text-slate-400 mt-0.5">In ₹ Lakhs — January to June 2024</p>
          </div>
          <button onClick={() => navigate('/analytics')} className="btn-secondary text-xs py-1.5 px-3">Full Analytics →</button>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={REVENUE} barSize={40}>
            <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
            <Tooltip contentStyle={{ borderRadius:'12px', border:'none', fontSize:12 }} formatter={v => [`₹${v}L`, 'Revenue']} />
            <Bar dataKey="r" fill="#3b82f6" radius={[8,8,0,0]} name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Live Emergency Summary */}
      {emergencyQueue.length > 0 && (
        <motion.div className="card overflow-hidden" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }}>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="section-title">Live Emergency Queue</h2>
            </div>
            <button onClick={() => navigate('/emergency')} className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              View all →
            </button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {emergencyQueue.slice(0,3).map((e, i) => {
              const dotColor = { CRITICAL:'bg-red-500', HIGH:'bg-orange-500', MEDIUM:'bg-yellow-500', LOW:'bg-green-500' }
              return (
                <div key={e.id} className="px-5 py-3 flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor[e.priority]}`} />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{e.patientName}</span>
                    <span className="text-xs text-slate-400 ml-2">{e.chiefComplaint}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 font-mono">{e.emergencyNumber}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
