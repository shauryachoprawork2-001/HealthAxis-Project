import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { FormField } from '@/components/ui/FormField'

const ROLE_INFO = {
  PATIENT:       { icon:'🧑', desc:'Access your appointments, health records & billing', color:'from-green-500 to-emerald-600' },
  DOCTOR:        { icon:'👨‍⚕️', desc:'Manage consultations, patient records & schedule', color:'from-blue-500 to-cyan-600' },
  NURSE:         { icon:'💉', desc:'Monitor beds, assist clinical operations', color:'from-teal-500 to-green-600' },
  RECEPTIONIST:  { icon:'📋', desc:'Handle appointments, billing & patient check-in', color:'from-yellow-500 to-orange-600' },
}

export default function RegisterPage() {
  const { register, loading, error, isAuthenticated, clearError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', confirmPassword:'', phoneNumber:'', role:'PATIENT' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1) // 2-step form

  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace:true }) }, [isAuthenticated])
  useEffect(() => () => clearError(), [])

  const validateStep1 = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = (ev) => {
    ev.preventDefault()
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const { confirmPassword, ...payload } = form
    const result = await register(payload)
    if (!result.error) navigate('/dashboard', { replace:true })
  }

  const ri = ROLE_INFO[form.role]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-primary-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12">
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-blue-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200 dark:shadow-primary-900">
            <span className="text-white font-black text-xl">H</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join HealthAxis today</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1,2].map(s => (
            <div key={s} className={`flex items-center gap-2 ${s < 2 ? 'flex-1' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mb-6 px-1">
          <span>Account Details</span><span>Role & Profile</span>
        </div>

        <div className="card p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form key="step1" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
                onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="First Name" required error={errors.firstName}>
                    <input className="input" value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} placeholder="Rahul" />
                  </FormField>
                  <FormField label="Last Name" required error={errors.lastName}>
                    <input className="input" value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} placeholder="Sharma" />
                  </FormField>
                </div>
                <FormField label="Email Address" required error={errors.email}>
                  <input type="email" className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@hospital.com" />
                </FormField>
                <FormField label="Phone Number" hint="Optional">
                  <input className="input" value={form.phoneNumber} onChange={e=>setForm(f=>({...f,phoneNumber:e.target.value}))} placeholder="+91 9876543210" />
                </FormField>
                <FormField label="Password" required error={errors.password}>
                  <div className="relative">
                    <input type={showPass?'text':'password'} className="input pr-10" value={form.password}
                      onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Min 8 characters" />
                    <button type="button" onClick={()=>setShowPass(s=>!s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{showPass?'🙈':'👁️'}</button>
                  </div>
                </FormField>
                <FormField label="Confirm Password" required error={errors.confirmPassword}>
                  <input type="password" className="input" value={form.confirmPassword}
                    onChange={e=>setForm(f=>({...f,confirmPassword:e.target.value}))} placeholder="Re-enter password" />
                </FormField>
                <button type="submit" className="btn-primary w-full mt-2">Continue →</button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Select Your Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ROLE_INFO).map(([role, info]) => (
                      <button key={role} type="button" onClick={() => setForm(f=>({...f,role}))}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === role ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                        <span className="text-xl block mb-1">{info.icon}</span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{role.charAt(0) + role.slice(1).toLowerCase()}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role info card */}
                <AnimatePresence mode="wait">
                  <motion.div key={form.role} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                    className={`rounded-xl bg-gradient-to-r ${ri.color} p-4 text-white`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ri.icon}</span>
                      <div>
                        <p className="font-bold">{form.role.charAt(0) + form.role.slice(1).toLowerCase()}</p>
                        <p className="text-xs opacity-90 mt-0.5">{ri.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
                      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                      <p className="text-sm text-red-700 dark:text-red-400">⚠️ {error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating…
                      </span>
                    ) : 'Create Account'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  )
}
