import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#3b82f6','#22c55e','#f97316','#ef4444','#a855f7','#06b6d4']

const revenueMonthly = [
  { month:'Jan', revenue:420000, expenses:180000, profit:240000 },
  { month:'Feb', revenue:510000, expenses:200000, profit:310000 },
  { month:'Mar', revenue:480000, expenses:195000, profit:285000 },
  { month:'Apr', revenue:620000, expenses:220000, profit:400000 },
  { month:'May', revenue:590000, expenses:210000, profit:380000 },
  { month:'Jun', revenue:710000, expenses:240000, profit:470000 },
  { month:'Jul', revenue:680000, expenses:230000, profit:450000 },
]

const doctorUtilization = [
  { name:'Cardiology', utilization:87, patients:312 },
  { name:'Neurology', utilization:74, patients:208 },
  { name:'Orthopedics', utilization:65, patients:175 },
  { name:'Pediatrics', utilization:91, patients:289 },
  { name:'Emergency', utilization:95, patients:445 },
  { name:'Oncology', utilization:72, patients:156 },
]

const patientFlow = [
  { hour:'8am', admissions:8, discharges:2, emergency:3 },
  { hour:'10am', admissions:15, discharges:5, emergency:5 },
  { hour:'12pm', admissions:12, discharges:8, emergency:4 },
  { hour:'2pm', admissions:18, discharges:12, emergency:7 },
  { hour:'4pm', admissions:22, discharges:15, emergency:9 },
  { hour:'6pm', admissions:14, discharges:18, emergency:12 },
  { hour:'8pm', admissions:6, discharges:10, emergency:8 },
]

const radarData = [
  { metric:'Beds', A:87 }, { metric:'Staff', A:74 }, { metric:'Emergency', A:95 },
  { metric:'Revenue', A:82 }, { metric:'Satisfaction', A:91 }, { metric:'Efficiency', A:78 },
]

const paymentMix = [
  { name:'Cash', value:22 }, { name:'Card/UPI', value:38 }, { name:'Insurance', value:31 }, { name:'Other', value:9 },
]

const TABS = ['Overview', 'Revenue', 'Patients', 'Doctors']

export default function AnalyticsPage() {
  const [tab, setTab] = useState('Overview')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Analytics & Insights</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Enterprise-grade operations reporting</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Patient Flow */}
            <div className="card p-5">
              <h2 className="section-title mb-4">Today's Patient Flow</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={patientFlow}>
                  <defs>
                    <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="disGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="emgGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 12 }} />
                  <Area type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={2} fill="url(#admGrad)" name="Admissions" />
                  <Area type="monotone" dataKey="discharges" stroke="#22c55e" strokeWidth={2} fill="url(#disGrad)" name="Discharges" />
                  <Area type="monotone" dataKey="emergency" stroke="#ef4444" strokeWidth={2} fill="url(#emgGrad2)" name="Emergency" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Radar */}
            <div className="card p-5">
              <h2 className="section-title mb-4">Hospital Performance Score</h2>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Department utilization */}
            <div className="card p-5 lg:col-span-2">
              <h2 className="section-title mb-4">Department Utilization</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={doctorUtilization} layout="vertical" barSize={16}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', fontSize: 12 }} formatter={v => [`${v}%`, 'Utilization']} />
                  <Bar dataKey="utilization" radius={[0, 8, 8, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Mix */}
            <div className="card p-5">
              <h2 className="section-title mb-4">Payment Methods</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={paymentMix} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {paymentMix.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', fontSize: 12 }} formatter={v => [`${v}%`]} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'Revenue' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="card p-5">
            <h2 className="section-title mb-4">Revenue vs Expenses (Monthly)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueMonthly} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 12 }} formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`]} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[6,6,0,0]} barSize={24} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6,6,0,0]} barSize={24} />
                <Bar dataKey="profit" name="Profit" fill="#22c55e" radius={[6,6,0,0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {tab === 'Patients' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5">
          <h2 className="section-title mb-4">Patient Flow (Hourly)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={patientFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Admissions" />
              <Line type="monotone" dataKey="discharges" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Discharges" />
              <Line type="monotone" dataKey="emergency" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Emergency" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {tab === 'Doctors' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5">
          <h2 className="section-title mb-4">Doctor Utilization by Department</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={doctorUtilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 12 }} formatter={v => [`${v}%`, 'Utilization']} />
              <Bar dataKey="utilization" fill="#3b82f6" radius={[8,8,0,0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}
