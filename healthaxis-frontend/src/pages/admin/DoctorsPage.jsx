import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import axiosInstance from '@/api/axiosInstance'
import { clsx } from 'clsx'

const SPECS = ['Cardiology','Neurology','Orthopedics','Pediatrics','Oncology','Emergency Medicine',
  'Dermatology','Radiology','Gynecology','Psychiatry','Ophthalmology','ENT','General Surgery','Urology']

export default function DoctorsPage() {
  const toast = useToast()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSpec, setFilterSpec] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showProfile, setShowProfile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [departments, setDepartments] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phoneNumber: '',
    licenseNumber: '', specialization: '', subSpecialization: '',
    qualification: '', yearsOfExperience: '', consultationFee: '', bio: '',
    departmentId: '', hospitalBranchId: ''
  })

  const load = useCallback(() => {
    setLoading(true)
    axiosInstance.get('/doctors', { params: { specialization: filterSpec || undefined, page, size: 12 } })
      .then(r => {
        setDoctors(r.data.data?.content || [])
        setTotalPages(r.data.data?.totalPages || 1)
      })
      .catch(() => setDoctors([
        { id:'1', user:{firstName:'Arjun',lastName:'Mehta',email:'arjun@healthaxis.com'}, licenseNumber:'LIC-001', specialization:'Cardiology', qualification:'MD, MBBS', yearsOfExperience:14, consultationFee:800, rating:4.8, totalReviews:312, available:true },
        { id:'2', user:{firstName:'Priya',lastName:'Sharma',email:'priya@healthaxis.com'}, licenseNumber:'LIC-002', specialization:'Neurology', qualification:'DM, MD', yearsOfExperience:11, consultationFee:1000, rating:4.6, totalReviews:208, available:true },
        { id:'3', user:{firstName:'Suresh',lastName:'Patel',email:'suresh@healthaxis.com'}, licenseNumber:'LIC-003', specialization:'Orthopedics', qualification:'MS Ortho', yearsOfExperience:9, consultationFee:700, rating:4.5, totalReviews:175, available:false },
        { id:'4', user:{firstName:'Ananya',lastName:'Nair',email:'ananya@healthaxis.com'}, licenseNumber:'LIC-004', specialization:'Pediatrics', qualification:'MD Peds', yearsOfExperience:7, consultationFee:600, rating:4.9, totalReviews:289, available:true },
        { id:'5', user:{firstName:'Vikram',lastName:'Singh',email:'vikram@healthaxis.com'}, licenseNumber:'LIC-005', specialization:'Oncology', qualification:'DM Onco', yearsOfExperience:16, consultationFee:1200, rating:4.7, totalReviews:156, available:true },
        { id:'6', user:{firstName:'Riya',lastName:'Bose',email:'riya@healthaxis.com'}, licenseNumber:'LIC-006', specialization:'Emergency Medicine', qualification:'MD Emergency', yearsOfExperience:6, consultationFee:500, rating:4.4, totalReviews:198, available:true },
      ]))
      .finally(() => setLoading(false))
  }, [filterSpec, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (showAdd) {
      axiosInstance.get('/hospitals').then(r => setHospitals(r.data.data?.content || [])).catch(() => {})
    }
  }, [showAdd])

  const handleHospitalChange = async (hospitalId) => {
    setForm(f => ({ ...f, hospitalBranchId: hospitalId, departmentId: '' }))
    if (!hospitalId) return
    try {
      const r = await axiosInstance.get(`/admin/hospitals/${hospitalId}/departments`)
      setDepartments(r.data.data || [])
    } catch { setDepartments([]) }
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters'
    if (!form.licenseNumber.trim()) e.licenseNumber = 'Required'
    if (!form.specialization) e.specialization = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await axiosInstance.post('/admin/doctors', {
        ...form,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : null,
        consultationFee: form.consultationFee ? parseFloat(form.consultationFee) : null,
        departmentId: form.departmentId || null,
        hospitalBranchId: form.hospitalBranchId || null,
      })
      toast('Doctor added successfully! 👨‍⚕️', 'success')
      setShowAdd(false)
      setForm({ firstName:'', lastName:'', email:'', password:'', phoneNumber:'', licenseNumber:'', specialization:'', subSpecialization:'', qualification:'', yearsOfExperience:'', consultationFee:'', bio:'', departmentId:'', hospitalBranchId:'' })
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add doctor', 'error')
    } finally { setSubmitting(false) }
  }

  const filtered = doctors.filter(d => {
    const name = `${d.user?.firstName} ${d.user?.lastName}`.toLowerCase()
    return (!search || name.includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase()))
  })

  const initials = (d) => `${d.user?.firstName?.[0] || ''}${d.user?.lastName?.[0] || ''}`

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {doctors.filter(d => d.available).length} available · {doctors.length} total
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Doctor</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input className="input max-w-xs" placeholder="Search by name or specialization…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input max-w-[220px]" value={filterSpec} onChange={e => { setFilterSpec(e.target.value); setPage(0) }}>
          <option value="">All Specializations</option>
          {SPECS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No doctors found" description="Try adjusting your search or add a new doctor." action={<button onClick={() => setShowAdd(true)} className="btn-primary">Add Doctor</button>} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="card-hover p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary-200 dark:shadow-primary-900">
                    <span className="text-white font-bold text-base">{initials(doc)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        Dr. {doc.user?.firstName} {doc.user?.lastName}
                      </h3>
                      <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', doc.available ? 'bg-green-500' : 'bg-slate-400')} />
                    </div>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-0.5">{doc.specialization}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{doc.qualification}</p>
                    <p className="text-xs text-slate-400 truncate">{doc.user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{doc.yearsOfExperience ?? '—'}y</p>
                    <p className="text-[10px] text-slate-400">Experience</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-2">
                    <p className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">⭐ {doc.rating ?? '—'}</p>
                    <p className="text-[10px] text-slate-400">{doc.totalReviews ?? 0} reviews</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2">
                    <p className="font-bold text-green-700 dark:text-green-400 text-sm">₹{doc.consultationFee ?? '—'}</p>
                    <p className="text-[10px] text-slate-400">Fee</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn-primary flex-1 text-xs py-2">Book Appointment</button>
                  <button onClick={() => setShowProfile(doc)} className="btn-secondary text-xs py-2 px-3">Profile</button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs py-2 px-4">← Prev</button>
              <span className="flex items-center text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs py-2 px-4">Next →</button>
            </div>
          )}
        </>
      )}

      {/* ── Add Doctor Modal ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="👨‍⚕️ Add New Doctor" size="xl">
        <form onSubmit={handleAdd} className="space-y-5">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300 font-medium">
            A new user account will be created automatically for this doctor with the DOCTOR role.
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Information</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required error={errors.firstName}>
              <input className="input" value={form.firstName} onChange={e => setForm(f=>({...f,firstName:e.target.value}))} placeholder="Arjun" />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName}>
              <input className="input" value={form.lastName} onChange={e => setForm(f=>({...f,lastName:e.target.value}))} placeholder="Mehta" />
            </FormField>
            <FormField label="Email Address" required error={errors.email}>
              <input type="email" className="input" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="arjun@healthaxis.com" />
            </FormField>
            <FormField label="Phone Number">
              <input className="input" value={form.phoneNumber} onChange={e => setForm(f=>({...f,phoneNumber:e.target.value}))} placeholder="+91 9876543210" />
            </FormField>
            <FormField label="Password" required error={errors.password} hint="Minimum 8 characters">
              <input type="password" className="input" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" />
            </FormField>
            <FormField label="License Number" required error={errors.licenseNumber}>
              <input className="input" value={form.licenseNumber} onChange={e => setForm(f=>({...f,licenseNumber:e.target.value}))} placeholder="LIC-00123" />
            </FormField>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Professional Details</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Specialization" required error={errors.specialization}>
              <select className="input" value={form.specialization} onChange={e => setForm(f=>({...f,specialization:e.target.value}))}>
                <option value="">Select specialization…</option>
                {SPECS.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Sub-Specialization">
              <input className="input" value={form.subSpecialization} onChange={e => setForm(f=>({...f,subSpecialization:e.target.value}))} placeholder="e.g. Interventional Cardiology" />
            </FormField>
            <FormField label="Qualification">
              <input className="input" value={form.qualification} onChange={e => setForm(f=>({...f,qualification:e.target.value}))} placeholder="MD, MBBS, DM…" />
            </FormField>
            <FormField label="Years of Experience">
              <input type="number" min="0" className="input" value={form.yearsOfExperience} onChange={e => setForm(f=>({...f,yearsOfExperience:e.target.value}))} placeholder="10" />
            </FormField>
            <FormField label="Consultation Fee (₹)">
              <input type="number" min="0" className="input" value={form.consultationFee} onChange={e => setForm(f=>({...f,consultationFee:e.target.value}))} placeholder="800" />
            </FormField>
            <FormField label="Hospital Branch">
              <select className="input" value={form.hospitalBranchId} onChange={e => handleHospitalChange(e.target.value)}>
                <option value="">Select hospital…</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </FormField>
            {departments.length > 0 && (
              <FormField label="Department">
                <select className="input" value={form.departmentId} onChange={e => setForm(f=>({...f,departmentId:e.target.value}))}>
                  <option value="">Select department…</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </FormField>
            )}
          </div>

          <FormField label="Bio / About">
            <textarea className="input resize-none" rows={3} value={form.bio}
              onChange={e => setForm(f=>({...f,bio:e.target.value}))}
              placeholder="Brief professional introduction…" />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Creating…' : 'Create Doctor Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Doctor Profile Modal ── */}
      <Modal open={!!showProfile} onClose={() => setShowProfile(null)} title="Doctor Profile" size="md">
        {showProfile && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-blue-600 flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-primary-900">
                <span className="text-white font-bold text-xl">{initials(showProfile)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dr. {showProfile.user?.firstName} {showProfile.user?.lastName}</h3>
                <p className="text-primary-600 dark:text-primary-400 font-semibold">{showProfile.specialization}</p>
                <p className="text-sm text-slate-400">{showProfile.qualification}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label:'Experience', val:`${showProfile.yearsOfExperience ?? '—'} yrs` },
                { label:'Rating', val:`⭐ ${showProfile.rating ?? '—'}` },
                { label:'Consult Fee', val:`₹${showProfile.consultationFee ?? '—'}` },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{s.val}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {showProfile.bio && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{showProfile.bio}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{showProfile.user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={clsx('w-2 h-2 rounded-full', showProfile.available ? 'bg-green-500' : 'bg-slate-400')} />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {showProfile.available ? 'Available for appointments' : 'Currently unavailable'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">License: {showProfile.licenseNumber}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
