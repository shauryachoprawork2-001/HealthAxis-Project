import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchMyAppointments } from '@/redux/slices/appointmentSlice'
import { AppointmentStatusBadge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { useToast } from '@/components/ui/Toast'
import axiosInstance from '@/api/axiosInstance'

export default function AppointmentsPage() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.appointments)
  const toast = useToast()

  const [showBook, setShowBook] = useState(false)
  const [showCancel, setShowCancel] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Booking form state
  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState({
    doctorId: '', hospitalBranchId: '', scheduledAt: '', consultationSlotId: '',
    reasonForVisit: '', symptoms: '', consultationType: 'IN_PERSON', slotDate: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => { dispatch(fetchMyAppointments()) }, [])

  useEffect(() => {
    if (showBook) {
      axiosInstance.get('/hospitals').then(r => setHospitals(r.data.data?.content || [])).catch(() => {})
      axiosInstance.get('/doctors', { params: { available: true } }).then(r => setDoctors(r.data.data?.content || [])).catch(() => {})
    }
  }, [showBook])

  const fetchSlots = useCallback(async () => {
    if (!form.doctorId || !form.slotDate) return
    setLoadingSlots(true)
    setSlots([])
    try {
      const r = await axiosInstance.get(`/doctors/${form.doctorId}/slots`, { params: { date: form.slotDate } })
      setSlots(r.data.data || [])
    } catch {
      // fallback: generate mock slots for demo
      const base = new Date(`${form.slotDate}T09:00:00`)
      const mockSlots = Array.from({ length: 8 }, (_, i) => {
        const d = new Date(base.getTime() + i * 30 * 60000)
        return { id: `mock-${i}`, slotDateTime: d.toISOString(), available: i % 3 !== 2 }
      })
      setSlots(mockSlots)
    } finally { setLoadingSlots(false) }
  }, [form.doctorId, form.slotDate])

  useEffect(() => { fetchSlots() }, [form.doctorId, form.slotDate])

  const validate = () => {
    const e = {}
    if (!form.doctorId) e.doctorId = 'Please select a doctor'
    if (!form.hospitalBranchId) e.hospitalBranchId = 'Please select a hospital'
    if (!form.scheduledAt && !form.consultationSlotId) e.scheduledAt = 'Please select a time slot'
    if (!form.reasonForVisit.trim()) e.reasonForVisit = 'Please provide a reason for visit'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        doctorId: form.doctorId,
        hospitalBranchId: form.hospitalBranchId,
        scheduledAt: form.consultationSlotId
          ? slots.find(s => s.id === form.consultationSlotId)?.slotDateTime
          : form.scheduledAt,
        consultationSlotId: form.consultationSlotId || null,
        reasonForVisit: form.reasonForVisit,
        symptoms: form.symptoms,
        consultationType: form.consultationType,
      }
      await axiosInstance.post('/appointments', payload)
      toast('Appointment booked successfully! 🎉', 'success')
      setShowBook(false)
      setForm({ doctorId:'', hospitalBranchId:'', scheduledAt:'', consultationSlotId:'', reasonForVisit:'', symptoms:'', consultationType:'IN_PERSON', slotDate:'' })
      dispatch(fetchMyAppointments())
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to book appointment', 'error')
    } finally { setSubmitting(false) }
  }

  const handleCancel = async () => {
    if (!showCancel) return
    setSubmitting(true)
    try {
      await axiosInstance.patch(`/appointments/${showCancel}/cancel`, null, { params: { reason: cancelReason } })
      toast('Appointment cancelled', 'info')
      setShowCancel(null)
      setCancelReason('')
      dispatch(fetchMyAppointments())
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to cancel appointment', 'error')
    } finally { setSubmitting(false) }
  }

  const appointments = list

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Appointments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage and track your consultations</p>
        </div>
        <button onClick={() => setShowBook(true)} className="btn-primary">+ Book Appointment</button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: appointments.length, color: 'text-slate-900 dark:text-white' },
          { label: 'Upcoming', value: appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length, color: 'text-blue-600' },
          { label: 'Completed', value: appointments.filter(a => a.status === 'COMPLETED').length, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={() => <span className="text-5xl">📅</span>}
          title="No appointments yet"
          description="Book your first appointment with a specialist today."
          action={<button onClick={() => setShowBook(true)} className="btn-primary">Book Appointment</button>}
        />
      ) : (
        <div className="space-y-3">
          {appointments.map((apt, i) => (
            <motion.div key={apt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 text-2xl">📅</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{apt.doctor?.specialization}</span>
                    <AppointmentStatusBadge status={apt.status} />
                    <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {apt.consultationType}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{apt.reasonForVisit}</p>
                  {apt.symptoms && <p className="text-xs text-slate-400 mt-0.5">Symptoms: {apt.symptoms}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>📍 {apt.hospitalBranch?.name}</span>
                    <span>🕐 {new Date(apt.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span className="font-mono">#{apt.appointmentNumber}</span>
                  </div>
                </div>
                {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                  <button onClick={() => setShowCancel(apt.id)}
                    className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0">Cancel</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Book Appointment Modal ── */}
      <Modal open={showBook} onClose={() => setShowBook(false)} title="📅 Book Appointment" size="lg">
        <form onSubmit={handleBook} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Hospital Branch" required error={errors.hospitalBranchId}>
              <select className="input" value={form.hospitalBranchId}
                onChange={e => setForm(f => ({ ...f, hospitalBranchId: e.target.value }))}>
                <option value="">Select hospital…</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </FormField>

            <FormField label="Consultation Type" required>
              <select className="input" value={form.consultationType}
                onChange={e => setForm(f => ({ ...f, consultationType: e.target.value }))}>
                <option value="IN_PERSON">🏥 In-Person</option>
                <option value="VIDEO">📹 Video Call</option>
                <option value="PHONE">📞 Phone</option>
              </select>
            </FormField>
          </div>

          <FormField label="Select Doctor" required error={errors.doctorId}>
            <select className="input" value={form.doctorId}
              onChange={e => setForm(f => ({ ...f, doctorId: e.target.value, consultationSlotId: '' }))}>
              <option value="">Choose a doctor…</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  Dr. {d.user?.firstName} {d.user?.lastName} — {d.specialization} (₹{d.consultationFee})
                </option>
              ))}
            </select>
          </FormField>

          {form.doctorId && (
            <FormField label="Preferred Date" required>
              <input type="date" className="input" value={form.slotDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, slotDate: e.target.value, consultationSlotId: '' }))} />
            </FormField>
          )}

          {form.slotDate && (
            <FormField label="Available Time Slots" required error={errors.scheduledAt}>
              {loadingSlots ? (
                <div className="flex items-center gap-2 py-3 text-sm text-slate-400">
                  <LoadingSpinner size="sm" /> Loading slots…
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">No slots available on this date.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button key={slot.id} type="button"
                      disabled={!slot.available}
                      onClick={() => setForm(f => ({ ...f, consultationSlotId: slot.id, scheduledAt: slot.slotDateTime }))}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        !slot.available
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed border-transparent'
                          : form.consultationSlotId === slot.id
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-primary-400'
                      }`}>
                      {new Date(slot.slotDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  ))}
                </div>
              )}
            </FormField>
          )}

          <FormField label="Reason for Visit" required error={errors.reasonForVisit}>
            <input className="input" placeholder="e.g. Annual check-up, follow-up after surgery…"
              value={form.reasonForVisit} onChange={e => setForm(f => ({ ...f, reasonForVisit: e.target.value }))} />
          </FormField>

          <FormField label="Symptoms" hint="Optional — helps the doctor prepare">
            <textarea className="input resize-none" rows={2} placeholder="Describe any symptoms you're experiencing…"
              value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowBook(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Booking…' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Cancel Modal ── */}
      <Modal open={!!showCancel} onClose={() => setShowCancel(null)} title="Cancel Appointment" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </p>
          <FormField label="Reason for cancellation">
            <textarea className="input resize-none" rows={3} placeholder="Optional — let the doctor know why…"
              value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
          </FormField>
          <div className="flex gap-3">
            <button onClick={() => setShowCancel(null)} className="btn-secondary flex-1">Keep Appointment</button>
            <button onClick={handleCancel} disabled={submitting} className="btn-danger flex-1">
              {submitting ? 'Cancelling…' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
