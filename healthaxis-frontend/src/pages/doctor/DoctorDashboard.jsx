import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { StatCard } from '@/components/ui/StatCard'
import { AppointmentStatusBadge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import axiosInstance from '@/api/axiosInstance'

const weekData = [
  { day:'Mon', patients:12 }, { day:'Tue', patients:18 }, { day:'Wed', patients:14 },
  { day:'Thu', patients:21 }, { day:'Fri', patients:16 }, { day:'Sat', patients:8 },
]

export default function DoctorDashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const MOCK_APPTS = [
    { id:'1', appointmentNumber:'APT-A1B2C3D4', scheduledAt: new Date(Date.now() + 3600000).toISOString(), status:'CONFIRMED', reasonForVisit:'Follow-up cardiology', consultationType:'IN_PERSON', patient:{ user:{ firstName:'Rahul', lastName:'Verma' }, medicalRecordNumber:'MRN-A1B2' } },
    { id:'2', appointmentNumber:'APT-E5F6A7B8', scheduledAt: new Date(Date.now() + 5400000).toISOString(), status:'SCHEDULED', reasonForVisit:'Neurology consultation', consultationType:'VIDEO', patient:{ user:{ firstName:'Sneha', lastName:'Gupta' }, medicalRecordNumber:'MRN-E5F6' } },
    { id:'3', appointmentNumber:'APT-C9D0E1F2', scheduledAt: new Date(Date.now() + 9000000).toISOString(), status:'SCHEDULED', reasonForVisit:'Pediatric check-up', consultationType:'IN_PERSON', patient:{ user:{ firstName:'Divya', lastName:'Pillai' }, medicalRecordNumber:'MRN-C9D0' } },
    { id:'4', appointmentNumber:'APT-G3H4I5J6', scheduledAt: new Date(Date.now() - 7200000).toISOString(), status:'COMPLETED', reasonForVisit:'Annual check-up', consultationType:'IN_PERSON', patient:{ user:{ firstName:'Anil', lastName:'Kumar' }, medicalRecordNumber:'MRN-G3H4' } },
  ]

  useEffect(() => {
    axiosInstance.get('/appointments/doctor', { params:{ page:0, size:10 } })
      .then(r => setAppointments(r.data.data?.content?.length ? r.data.data.content : MOCK_APPTS))
      .catch(() => setAppointments(MOCK_APPTS))
      .finally(() => setLoading(false))
  }, [])

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      await axiosInstance.patch(`/appointments/${id}/status`, null, { params:{ status: newStatus } })
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
      toast(`Appointment marked as ${newStatus.toLowerCase()}`, 'success')
    } catch {
      toast('Failed to update status', 'error')
    } finally { setUpdatingId(null) }
  }

  const today   = appointments.filter(a => new Date(a.scheduledAt).toDateString() === new Date().toDateString())
  const upcoming = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
  const completed = appointments.filter(a => a.status === 'COMPLETED')

  const timeLabel = (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const diffMin = Math.round((d - now) / 60000)
    if (diffMin < 0) return `${Math.abs(diffMin)}m ago`
    if (diffMin < 60) return `in ${diffMin}m`
    return d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}>
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Dr. {user?.firstName} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title:"Today's Appointments", value:today.length,     color:'blue',   subtitle:'Scheduled today' },
          { title:'Upcoming',             value:upcoming.length,  color:'orange', subtitle:'Awaiting consultation' },
          { title:'Completed Today',      value:completed.length, color:'green',  subtitle:'Seen today' },
          { title:'Total Patients',       value:'312',            color:'purple', subtitle:'All-time' },
        ].map((s, i) => (
          <motion.div key={s.title} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Appointment list */}
        <div className="card lg:col-span-3">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="section-title">Today's Appointments</h2>
              <p className="text-xs text-slate-400 mt-0.5">{today.length} consultations scheduled</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : today.length === 0 ? (
            <EmptyState icon={() => <span className="text-4xl">📅</span>} title="No appointments today" description="You're all clear for today." />
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {today.sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)).map((apt, i) => (
                <motion.div key={apt.id} initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 + i*0.06 }}
                  className="px-5 py-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Time column */}
                  <div className="w-14 flex-shrink-0 text-center">
                    <p className="text-xs font-bold text-primary-600 dark:text-primary-400">
                      {new Date(apt.scheduledAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeLabel(apt.scheduledAt)}</p>
                  </div>

                  {/* Patient avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{apt.patient?.user?.firstName?.[0]}{apt.patient?.user?.lastName?.[0]}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                      </p>
                      <AppointmentStatusBadge status={apt.status} />
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
                        {apt.consultationType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{apt.reasonForVisit}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{apt.patient?.medicalRecordNumber}</p>
                  </div>

                  {/* Actions */}
                  {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button disabled={!!updatingId} onClick={() => handleStatusUpdate(apt.id, 'IN_PROGRESS')}
                        className="btn-primary text-xs py-1.5 px-2.5 disabled:opacity-50">
                        {updatingId === apt.id ? '…' : 'Start'}
                      </button>
                    </div>
                  )}
                  {apt.status === 'IN_PROGRESS' && (
                    <button disabled={!!updatingId} onClick={() => handleStatusUpdate(apt.id, 'COMPLETED')}
                      className="btn-secondary text-xs py-1.5 px-2.5 disabled:opacity-50 text-green-600 dark:text-green-400">
                      {updatingId === apt.id ? '…' : '✓ Complete'}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly chart */}
        <div className="card p-5 lg:col-span-2 flex flex-col">
          <h2 className="section-title mb-1">Weekly Patient Load</h2>
          <p className="text-xs text-slate-400 mb-4">Patients seen per day</p>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData} barSize={24}>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius:'10px', border:'none', fontSize:12 }} />
                <Bar dataKey="patients" fill="#3b82f6" radius={[6,6,0,0]} name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label:'This week', val:'89' },
              { label:'Satisfaction', val:'4.8 ⭐' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="font-bold text-slate-800 dark:text-slate-100">{s.val}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All upcoming */}
      {upcoming.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="section-title">Upcoming Appointments</h2>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {upcoming.filter(a => !today.find(t => t.id === a.id)).map((apt, i) => (
              <motion.div key={apt.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.05 }}
                className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{apt.patient?.user?.firstName?.[0]}{apt.patient?.user?.lastName?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{apt.reasonForVisit}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {new Date(apt.scheduledAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(apt.scheduledAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
                <AppointmentStatusBadge status={apt.status} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
