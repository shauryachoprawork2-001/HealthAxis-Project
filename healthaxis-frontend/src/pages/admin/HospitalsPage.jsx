import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import axiosInstance from '@/api/axiosInstance'

const FALLBACK = [
  { id:'1', name:'HealthAxis Central Hospital', city:'New Delhi', state:'Delhi', branchCode:'HAX-CENTRAL', totalBeds:500, icuBeds:50, emergencyBeds:30, active:true, email:'central@healthaxis.com' },
  { id:'2', name:'HealthAxis North Campus', city:'Mumbai', state:'Maharashtra', branchCode:'HAX-NORTH', totalBeds:350, icuBeds:35, emergencyBeds:20, active:true, email:'north@healthaxis.com' },
  { id:'3', name:'HealthAxis South Wing', city:'Bangalore', state:'Karnataka', branchCode:'HAX-SOUTH', totalBeds:280, icuBeds:28, emergencyBeds:15, active:true, email:'south@healthaxis.com' },
]

export default function HospitalsPage() {
  const toast = useToast()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name:'', branchCode:'', address:'', city:'', state:'', country:'India',
    pinCode:'', phoneNumber:'', email:'', website:'',
    totalBeds:'', icuBeds:'', emergencyBeds:'',
    latitude:'', longitude:'', description:''
  })

  const load = useCallback(() => {
    setLoading(true)
    axiosInstance.get('/hospitals', { params: { search: search || undefined } })
      .then(r => setHospitals(r.data.data?.content?.length ? r.data.data.content : FALLBACK))
      .catch(() => setHospitals(FALLBACK))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => { load() }, [load])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.branchCode.trim()) e.branchCode = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await axiosInstance.post('/admin/hospitals', {
        ...form,
        totalBeds: form.totalBeds ? parseInt(form.totalBeds) : null,
        icuBeds: form.icuBeds ? parseInt(form.icuBeds) : null,
        emergencyBeds: form.emergencyBeds ? parseInt(form.emergencyBeds) : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      })
      toast('Hospital branch created! 🏥', 'success')
      setShowAdd(false)
      setForm({ name:'', branchCode:'', address:'', city:'', state:'', country:'India', pinCode:'', phoneNumber:'', email:'', website:'', totalBeds:'', icuBeds:'', emergencyBeds:'', latitude:'', longitude:'', description:'' })
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create hospital', 'error')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Hospital Branches</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{hospitals.length} branches registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Branch</button>
      </div>

      <input className="input max-w-sm" placeholder="Search hospitals by name or city…"
        value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : hospitals.length === 0 ? (
        <EmptyState title="No hospitals found" action={<button onClick={() => setShowAdd(true)} className="btn-primary">Add Branch</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {hospitals.map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card-hover p-5 cursor-pointer" onClick={() => setShowDetail(h)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">🏥</div>
                <span className={`badge ${h.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                  {h.active ? '● Active' : '● Inactive'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{h.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{h.city}{h.state ? `, ${h.state}` : ''}</p>
              <p className="text-xs font-mono text-slate-400 mt-1">{h.branchCode}</p>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { label: 'Total Beds', val: h.totalBeds ?? '—', bg: 'bg-slate-50 dark:bg-slate-700/50', text: 'text-slate-800 dark:text-slate-100' },
                  { label: 'ICU Beds', val: h.icuBeds ?? '—', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' },
                  { label: 'ER Beds', val: h.emergencyBeds ?? '—', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-2 text-center`}>
                    <p className={`text-lg font-bold ${s.text}`}>{s.val}</p>
                    <p className="text-[10px] text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Hospital Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="🏥 Add Hospital Branch" size="xl">
        <form onSubmit={handleAdd} className="space-y-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basic Information</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Hospital Name" required error={errors.name}>
              <input className="input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="HealthAxis West Wing" />
            </FormField>
            <FormField label="Branch Code" required error={errors.branchCode} hint="Unique identifier e.g. HAX-WEST">
              <input className="input" value={form.branchCode} onChange={e => setForm(f=>({...f,branchCode:e.target.value.toUpperCase()}))} placeholder="HAX-WEST" />
            </FormField>
            <div className="col-span-2">
              <FormField label="Address" required error={errors.address}>
                <input className="input" value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} placeholder="Street, Sector, Locality" />
              </FormField>
            </div>
            <FormField label="City" required error={errors.city}>
              <input className="input" value={form.city} onChange={e => setForm(f=>({...f,city:e.target.value}))} placeholder="New Delhi" />
            </FormField>
            <FormField label="State">
              <input className="input" value={form.state} onChange={e => setForm(f=>({...f,state:e.target.value}))} placeholder="Delhi" />
            </FormField>
            <FormField label="Country">
              <input className="input" value={form.country} onChange={e => setForm(f=>({...f,country:e.target.value}))} />
            </FormField>
            <FormField label="PIN Code">
              <input className="input" value={form.pinCode} onChange={e => setForm(f=>({...f,pinCode:e.target.value}))} placeholder="110001" />
            </FormField>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone Number">
              <input className="input" value={form.phoneNumber} onChange={e => setForm(f=>({...f,phoneNumber:e.target.value}))} placeholder="+91 11 1234 5678" />
            </FormField>
            <FormField label="Email">
              <input type="email" className="input" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="branch@healthaxis.com" />
            </FormField>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Capacity</p>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Total Beds">
              <input type="number" min="0" className="input" value={form.totalBeds} onChange={e => setForm(f=>({...f,totalBeds:e.target.value}))} placeholder="500" />
            </FormField>
            <FormField label="ICU Beds">
              <input type="number" min="0" className="input" value={form.icuBeds} onChange={e => setForm(f=>({...f,icuBeds:e.target.value}))} placeholder="50" />
            </FormField>
            <FormField label="Emergency Beds">
              <input type="number" min="0" className="input" value={form.emergencyBeds} onChange={e => setForm(f=>({...f,emergencyBeds:e.target.value}))} placeholder="30" />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea className="input resize-none" rows={2} value={form.description}
              onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="About this hospital branch…" />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Creating…' : 'Create Branch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Hospital Details" size="md">
        {showDetail && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl">🏥</div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{showDetail.name}</h3>
                <p className="text-sm text-slate-500">{showDetail.city}{showDetail.state ? `, ${showDetail.state}` : ''}</p>
                <p className="text-xs font-mono text-slate-400">{showDetail.branchCode}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:'Total Beds', val:showDetail.totalBeds },
                { label:'ICU Beds', val:showDetail.icuBeds },
                { label:'ER Beds', val:showDetail.emergencyBeds },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{s.val ?? '—'}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
            {showDetail.email && <p className="text-sm text-slate-500">📧 {showDetail.email}</p>}
            {showDetail.description && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{showDetail.description}</p>}
          </div>
        )}
      </Modal>
    </div>
  )
}
