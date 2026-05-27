import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

const DEMO_USERS = [
  { label: 'Admin', email: 'admin@healthaxis.com', password: 'Admin@123', color: 'from-purple-600 to-indigo-700', icon: '⚡' },
  { label: 'Doctor', email: 'doctor@healthaxis.com', password: 'Doctor@123', color: 'from-blue-600 to-cyan-700', icon: '👨‍⚕️' },
  { label: 'Nurse', email: 'nurse@healthaxis.com', password: 'Nurse@123', color: 'from-teal-600 to-green-700', icon: '💉' },
  { label: 'Patient', email: 'patient@healthaxis.com', password: 'Patient@123', color: 'from-green-600 to-emerald-700', icon: '🧑' },
]

export default function LoginPage() {
  const { login, loading, error, isAuthenticated, clearError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [fillingDemo, setFillingDemo] = useState(null)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated])

  useEffect(() => () => clearError(), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form)
    if (!result.error) navigate('/dashboard', { replace: true })
  }

  const fillDemo = (u) => {
    setFillingDemo(u.label)
    setForm({ email: u.email, password: u.password })
    setTimeout(() => setFillingDemo(null), 800)
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left hero panel */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-blue-800 p-16 flex-col justify-between">
        {/* Background rings */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/10"
              style={{ width: `${250 + i * 150}px`, height: `${250 + i * 150}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>
        {/* Floating cards */}
        <div className="absolute right-12 top-1/3 flex flex-col gap-3">
          {[
            { label: 'Patients Managed', val: '1,842', icon: '👥' },
            { label: 'Appointments Today', val: '128', icon: '📅' },
            { label: 'Emergency Queue', val: '3 Active', icon: '🚨' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <span className="text-xl">{card.icon}</span>
                <div>
                  <p className="text-white font-bold text-lg leading-none">{card.val}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{card.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-8">
              <span className="text-white font-black text-2xl">H</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
              Health<span className="text-blue-300">Axis</span>
            </h1>
            <p className="text-xl text-blue-200 mt-3 font-light leading-relaxed max-w-sm">
              Enterprise healthcare operations for modern hospitals — real-time, clinical-grade, scalable.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { label: 'Hospitals', val: '3' },
            { label: 'Departments', val: '12' },
            { label: 'Bed Occupancy', val: 'Live' },
            { label: 'WebSocket', val: 'Real-time' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-2xl font-bold text-white">{s.val}</p>
              <p className="text-blue-200 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-200 dark:shadow-primary-900">
              <span className="text-white font-black text-xl">H</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">HealthAxis</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to your HealthAxis account</p>
          </div>

          {/* Demo login */}
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick demo login</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map(u => (
                <motion.button key={u.label} type="button" onClick={() => fillDemo(u)} whileTap={{ scale: 0.97 }}
                  className={`text-xs font-bold py-2.5 px-3 rounded-xl bg-gradient-to-r ${u.color} text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity relative overflow-hidden`}>
                  <span>{u.icon}</span>
                  {u.label}
                  <AnimatePresence>
                    {fillingDemo === u.label && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/20 flex items-center justify-center rounded-xl">
                        <span className="text-xs">✓</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">or sign in manually</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input" placeholder="you@hospital.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm transition-colors">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">⚠️ {error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Create account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
