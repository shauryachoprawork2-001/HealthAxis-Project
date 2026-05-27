import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchEmergencyQueue } from '@/redux/slices/emergencySlice'
import { PriorityBadge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { useToast } from '@/components/ui/Toast'
import axiosInstance from '@/api/axiosInstance'
import { clsx } from 'clsx'

const PRIORITY_STRIP = {
  CRITICAL: 'border-l-4 border-red-500 bg-red-50/80 dark:bg-red-900/10',
  HIGH:     'border-l-4 border-orange-500 bg-orange-50/80 dark:bg-orange-900/10',
  MEDIUM:   'border-l-4 border-yellow-400 bg-yellow-50/80 dark:bg-yellow-900/10',
  LOW:      'border-l-4 border-green-500 bg-green-50/80 dark:bg-green-900/10',
}

export default function EmergencyDashboard() {
  const dispatch = useDispatch()
  const { queue, loading, lastUpdated } = useSelector(s => s.emergency)
  const toast = useToast()

  const [showForm, setShowForm] = useState(false)
  const [showTriage, setShowTriage] = useState(null)
  const [showAssign, setShowAssign] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [beds, setBeds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const [hospitals, setHospitals] = useState([])
  const [form, setForm] = useState({
    patientName:'', patientAge:'', patientGender:'Male',
    priority:'HIGH', chiefComplaint:'', vitalSigns:'',
    hospitalBranchId:'', ambulanceRequired:false
  })

  const [triageForm, setTriageForm] = useState({ priority:'HIGH', notes:'' })
  const [assignForm, setAssignForm] = useState({ doctorId:'', bedId:'' })

  useEffect(() => {
    dispatch(fetchEmergencyQueue())
    const interval = setInterval(() => dispatch(fetchEmergencyQueue()), 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    axiosInstance.get('/hospitals').then(r => setHospitals(r.data.data?.content || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (showAssign) {
      axiosInstance.get('/doctors', { params:{ available:true, size:50 } }).then(r => setDoctors(r.data.data?.content || [])).catch(() => {})
    }
  }, [showAssign])

  const sorted = [...queue].sort((a,b) => ['CRITICAL','HIGH','MEDIUM','LOW'].indexOf(a.priority) - ['CRITICAL','HIGH','MEDIUM','LOW'].indexOf(b.priority))

  const validate = () => {
    const e = {}
    if (!form.patientName.trim()) e.patientName = 'Patient name required'
    if (!form.chiefComplaint.trim()) e.chiefComplaint = 'Chief complaint required'
    if (!form.hospitalBranchId) e.hospitalBranchId = 'Select a hospital'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await axiosInstance.post('/emergency', form)
      toast('Emergency request created! 🚨', 'success')
      setShowForm(false)
      setForm({ patientName:'', patientAge:'', patientGender:'Male', priority:'HIGH', chiefComplaint:'', vitalSigns:'', hospitalBranchId:'', ambulanceRequired:false })
      dispatch(fetchEmergencyQueue())
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create emergency', 'error')
    } finally { setSubmitting(false) }
  }

  const handleTriage = async () => {
    setSubmitting(true)
    try {
      await axiosInstance.patch(`/emergency/${showTriage.id}/triage`, null, {
        params: { priority: triageForm.priority, notes: triageForm.notes || undefined }
      })
      toast('Triage updated', 'success')
      setShowTriage(null)
      dispatch(fetchEmergencyQueue())
    } catch (err) {
      toast(err.response?.data?.message || 'Triage update failed', 'error')
    } finally { setSubmitting(false) }
  }

  const handleAssignDoctor = async () => {
    if (!assignForm.doctorId) { toast('Select a doctor', 'warning'); return }
    setSubmitting(true)
    try {
      await axiosInstance.patch(`/emergency/${showAssign.id}/assign-doctor`, null, { params:{ doctorId: assignForm.doctorId } })
      toast('Doctor assigned', 'success')
      setShowAssign(null)
      dispatch(fetchEmergencyQueue())
    } catch (err) {
      toast(err.response?.data?.message || 'Assignment failed', 'error')
    } finally { setSubmitting(false) }
  }

  const criticalCount = queue.filter(e => e.priority === 'CRITICAL').length
  const highCount = queue.filter(e => e.priority === 'HIGH').length
  const waitingCount = queue.filter(e => e.status === 'WAITING' || e.status === 'TRIAGED').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span className={clsx('w-2.5 h-2.5 rounded-full', criticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500')} />
            Emergency Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live · {lastUpdated ? `Last updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Loading…'} · Auto-refreshes every 15s
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-danger">+ New Emergency</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Active Queue', val:waitingCount, bg:'bg-slate-100 dark:bg-slate-800', text:'text-slate-900 dark:text-white' },
          { label:'🔴 Critical', val:criticalCount, bg:'bg-red-100 dark:bg-red-900/30', text:'text-red-700 dark:text-red-400' },
          { label:'🟠 High', val:highCount, bg:'bg-orange-100 dark:bg-orange-900/30', text:'text-orange-700 dark:text-orange-400' },
          { label:'Total Today', val:queue.length, bg:'bg-blue-100 dark:bg-blue-900/30', text:'text-blue-700 dark:text-blue-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.val}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="section-title">Active Patients</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {loading && <LoadingSpinner size="sm" />}
            <span>{queue.length} in queue</span>
          </div>
        </div>

        {loading && queue.length === 0 ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : queue.length === 0 ? (
          <EmptyState icon={() => <span className="text-5xl">✅</span>} title="Queue is clear" description="All patients have been attended to." />
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            <AnimatePresence initial={false}>
              {sorted.map((item, idx) => (
                <motion.div key={item.id}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}
                  transition={{ delay: idx * 0.04 }}
                  className={clsx('px-5 py-4 transition-all', PRIORITY_STRIP[item.priority])}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-sm font-bold text-slate-500">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white">{item.patientName}</span>
                        {item.patientAge && <span className="text-xs text-slate-500">{item.patientAge}y · {item.patientGender}</span>}
                        <PriorityBadge priority={item.priority} />
                        <span className="badge bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200">{item.status}</span>
                        {item.ambulanceRequired && <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">🚑 Ambulance</span>}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{item.chiefComplaint}</p>
                      {item.vitalSigns && <p className="text-xs text-slate-400 mt-0.5">Vitals: {item.vitalSigns}</p>}
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                        {item.assignedDoctor && <span>👨‍⚕️ Dr. {item.assignedDoctor.user?.lastName}</span>}
                        {item.assignedBed && <span>🛏️ {item.assignedBed.bedNumber}</span>}
                        {item.triageTime && <span>⏰ {new Date(item.triageTime).toLocaleTimeString()}</span>}
                        <span className="font-mono">#{item.emergencyNumber}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { setShowTriage(item); setTriageForm({ priority: item.priority, notes:'' }) }}
                        className="btn-secondary text-xs py-1.5 px-3">Triage</button>
                      <button onClick={() => { setShowAssign(item); setAssignForm({ doctorId:'', bedId:'' }) }}
                        className="btn-primary text-xs py-1.5 px-3">Assign</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── New Emergency Modal ── */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="🚨 New Emergency Request" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Patient Name" required error={errors.patientName}>
              <input className="input" value={form.patientName} onChange={e => setForm(f=>({...f,patientName:e.target.value}))} placeholder="Full name" />
            </FormField>
            <FormField label="Age">
              <input className="input" value={form.patientAge} onChange={e => setForm(f=>({...f,patientAge:e.target.value}))} placeholder="e.g. 45" />
            </FormField>
            <FormField label="Gender">
              <select className="input" value={form.patientGender} onChange={e => setForm(f=>({...f,patientGender:e.target.value}))}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </FormField>
            <FormField label="Priority" required>
              <select className="input" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                <option value="CRITICAL">🔴 Critical</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">🟢 Low</option>
              </select>
            </FormField>
          </div>

          <FormField label="Hospital Branch" required error={errors.hospitalBranchId}>
            <select className="input" value={form.hospitalBranchId} onChange={e => setForm(f=>({...f,hospitalBranchId:e.target.value}))}>
              <option value="">Select hospital…</option>
              {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </FormField>

          <FormField label="Chief Complaint" required error={errors.chiefComplaint}>
            <textarea className="input resize-none" rows={2} value={form.chiefComplaint}
              onChange={e => setForm(f=>({...f,chiefComplaint:e.target.value}))} placeholder="Describe the emergency…" />
          </FormField>

          <FormField label="Vital Signs" hint="Optional — BP, HR, SpO2, Temp…">
            <input className="input" value={form.vitalSigns} onChange={e => setForm(f=>({...f,vitalSigns:e.target.value}))} placeholder="BP: 140/90, HR: 110, SpO2: 94%" />
          </FormField>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.ambulanceRequired} onChange={e => setForm(f=>({...f,ambulanceRequired:e.target.checked}))}
              className="w-4 h-4 rounded text-primary-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ambulance Required</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-danger flex-1">
              {submitting ? 'Creating…' : 'Create Emergency'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Triage Modal ── */}
      <Modal open={!!showTriage} onClose={() => setShowTriage(null)} title="🏥 Update Triage" size="sm">
        <div className="space-y-4">
          <FormField label="Update Priority">
            <select className="input" value={triageForm.priority} onChange={e => setTriageForm(f=>({...f,priority:e.target.value}))}>
              <option value="CRITICAL">🔴 Critical</option>
              <option value="HIGH">🟠 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>
          </FormField>
          <FormField label="Triage Notes">
            <textarea className="input resize-none" rows={3} value={triageForm.notes}
              onChange={e => setTriageForm(f=>({...f,notes:e.target.value}))} placeholder="Clinical observations…" />
          </FormField>
          <div className="flex gap-3">
            <button onClick={() => setShowTriage(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleTriage} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Updating…' : 'Update Triage'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Assign Modal ── */}
      <Modal open={!!showAssign} onClose={() => setShowAssign(null)} title="👨‍⚕️ Assign Doctor" size="sm">
        <div className="space-y-4">
          <FormField label="Select Doctor">
            <select className="input" value={assignForm.doctorId} onChange={e => setAssignForm(f=>({...f,doctorId:e.target.value}))}>
              <option value="">Choose doctor…</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.user?.firstName} {d.user?.lastName} — {d.specialization}</option>
              ))}
            </select>
          </FormField>
          <div className="flex gap-3">
            <button onClick={() => setShowAssign(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAssignDoctor} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Assigning…' : 'Assign Doctor'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
