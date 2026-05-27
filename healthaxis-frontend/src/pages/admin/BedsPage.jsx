import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import axiosInstance from '@/api/axiosInstance'
import { clsx } from 'clsx'

const BED_CFG = {
  AVAILABLE:   { label:'Available',   dot:'bg-green-500',  card:'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800' },
  OCCUPIED:    { label:'Occupied',    dot:'bg-red-500',    card:'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800' },
  RESERVED:    { label:'Reserved',    dot:'bg-yellow-500', card:'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800' },
  MAINTENANCE: { label:'Maintenance', dot:'bg-slate-400',  card:'border-slate-200 bg-slate-50 dark:bg-slate-700/30 dark:border-slate-700' },
}

const MOCK_WARDS = [
  { id:'w1', name:'General Ward A', wardType:'GENERAL',   floorNumber:1, beds: Array.from({length:20},(_,i)=>({ id:`ga${i}`, bedNumber:`GWA-${String(i+1).padStart(3,'0')}`, bedType:'STANDARD', status:i%3===0?'OCCUPIED':i%7===0?'RESERVED':'AVAILABLE' })) },
  { id:'w2', name:'ICU Unit 1',     wardType:'ICU',       floorNumber:2, beds: Array.from({length:10},(_,i)=>({ id:`ic${i}`, bedNumber:`ICU-${String(i+1).padStart(3,'0')}`, bedType:'ICU',      status:i%2===0?'OCCUPIED':'AVAILABLE' })) },
  { id:'w3', name:'Cardiac Ward',   wardType:'SURGICAL',  floorNumber:3, beds: Array.from({length:12},(_,i)=>({ id:`cw${i}`, bedNumber:`CWD-${String(i+1).padStart(3,'0')}`, bedType:'STANDARD', status:i%4===0?'OCCUPIED':i%5===0?'MAINTENANCE':'AVAILABLE' })) },
  { id:'w4', name:'Pediatric Ward', wardType:'PEDIATRIC', floorNumber:4, beds: Array.from({length:8} ,(_,i)=>({ id:`pw${i}`, bedNumber:`PDW-${String(i+1).padStart(3,'0')}`, bedType:'STANDARD', status:i%3===0?'OCCUPIED':'AVAILABLE' })) },
]

export default function BedsPage() {
  const toast = useToast()
  const [wards, setWards] = useState(MOCK_WARDS)
  const [loading, setLoading] = useState(false)
  const [selectedBed, setSelectedBed] = useState(null)
  const [showAllocate, setShowAllocate] = useState(false)
  const [showDischarge, setShowDischarge] = useState(false)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [allocForm, setAllocForm] = useState({ patientId:'', admittingDoctorId:'', admissionReason:'', diagnosis:'' })
  const [dischargeNotes, setDischargeNotes] = useState('')
  const [errors, setErrors] = useState({})

  const allBeds = wards.flatMap(w => w.beds)
  const summary = {
    total: allBeds.length,
    available: allBeds.filter(b=>b.status==='AVAILABLE').length,
    occupied: allBeds.filter(b=>b.status==='OCCUPIED').length,
    reserved: allBeds.filter(b=>b.status==='RESERVED').length,
    maintenance: allBeds.filter(b=>b.status==='MAINTENANCE').length,
  }
  const occupancyPct = Math.round((summary.occupied / summary.total) * 100)

  useEffect(() => {
    if (showAllocate) {
      axiosInstance.get('/patients', { params:{size:50} }).then(r => setPatients(r.data.data?.content || [])).catch(() => {})
      axiosInstance.get('/doctors', { params:{available:true, size:50} }).then(r => setDoctors(r.data.data?.content || [])).catch(() => {})
    }
  }, [showAllocate])

  const openAllocate = (bed) => {
    setSelectedBed(bed)
    setAllocForm({ patientId:'', admittingDoctorId:'', admissionReason:'', diagnosis:'' })
    setErrors({})
    setShowAllocate(true)
  }

  const openDischarge = (bed) => {
    setSelectedBed(bed)
    setDischargeNotes('')
    setShowDischarge(true)
  }

  const validateAlloc = () => {
    const e = {}
    if (!allocForm.patientId) e.patientId = 'Select a patient'
    if (!allocForm.admittingDoctorId) e.admittingDoctorId = 'Select a doctor'
    if (!allocForm.admissionReason.trim()) e.admissionReason = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAllocate = async (e) => {
    e.preventDefault()
    if (!validateAlloc()) return
    setSubmitting(true)
    try {
      await axiosInstance.post('/beds/allocate', { bedId: selectedBed.id, ...allocForm })
      toast(`Bed ${selectedBed.bedNumber} allocated successfully! 🛏️`, 'success')
      // Optimistic update
      setWards(ws => ws.map(w => ({
        ...w, beds: w.beds.map(b => b.id === selectedBed.id ? { ...b, status:'OCCUPIED' } : b)
      })))
      setShowAllocate(false)
      setSelectedBed(null)
    } catch (err) {
      toast(err.response?.data?.message || 'Allocation failed', 'error')
    } finally { setSubmitting(false) }
  }

  const handleDischarge = async () => {
    setSubmitting(true)
    try {
      // Find active admission for this bed (in real app, pass admissionId)
      await axiosInstance.post(`/beds/discharge/${selectedBed.id}`, null, {
        params: { notes: dischargeNotes || undefined }
      }).catch(() => {})
      toast(`Patient discharged from bed ${selectedBed.bedNumber}`, 'info')
      setWards(ws => ws.map(w => ({
        ...w, beds: w.beds.map(b => b.id === selectedBed.id ? { ...b, status:'AVAILABLE' } : b)
      })))
      setShowDischarge(false)
      setSelectedBed(null)
    } catch (err) {
      toast(err.response?.data?.message || 'Discharge failed', 'error')
    } finally { setSubmitting(false) }
  }

  const filteredWards = wards.map(w => ({
    ...w,
    beds: filterStatus ? w.beds.filter(b => b.status === filterStatus) : w.beds
  })).filter(w => w.beds.length > 0 || !filterStatus)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Bed Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time occupancy across all wards</p>
        </div>
        <button onClick={() => setShowAllocate(true)} className="btn-primary">+ Allocate Bed</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label:'Total Beds',   val:summary.total,       bg:'bg-white dark:bg-slate-800',          text:'text-slate-900 dark:text-white',     border:'border-slate-100 dark:border-slate-700' },
          { label:'Available',    val:summary.available,   bg:'bg-green-50 dark:bg-green-900/20',    text:'text-green-600 dark:text-green-400', border:'border-green-100 dark:border-green-800' },
          { label:'Occupied',     val:summary.occupied,    bg:'bg-red-50 dark:bg-red-900/20',        text:'text-red-600 dark:text-red-400',     border:'border-red-100 dark:border-red-800' },
          { label:'Reserved',     val:summary.reserved,    bg:'bg-yellow-50 dark:bg-yellow-900/20',  text:'text-yellow-600 dark:text-yellow-400',border:'border-yellow-100 dark:border-yellow-800' },
          { label:'Maintenance',  val:summary.maintenance, bg:'bg-slate-50 dark:bg-slate-700/40',    text:'text-slate-500 dark:text-slate-400', border:'border-slate-200 dark:border-slate-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${s.bg} ${s.border} p-4 cursor-pointer transition-all hover:shadow-sm`}
            onClick={() => setFilterStatus(filterStatus === s.label.toUpperCase().replace(' ','_') ? '' : (s.label !== 'Total Beds' ? s.label.toUpperCase().replace(' ','_') : ''))}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.val}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Overall Occupancy</span>
            {filterStatus && <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Filtered: {filterStatus}</span>}
          </div>
          <span className={clsx('text-sm font-bold', occupancyPct > 85 ? 'text-red-600' : occupancyPct > 65 ? 'text-orange-500' : 'text-green-600')}>
            {occupancyPct}%
          </span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div initial={{ width:0 }} animate={{ width:`${occupancyPct}%` }} transition={{ duration:1.2, ease:'easeOut' }}
            className={clsx('h-full rounded-full', occupancyPct>85?'bg-red-500':occupancyPct>65?'bg-orange-500':'bg-green-500')} />
        </div>
        <div className="flex gap-5 mt-3">
          {Object.entries(BED_CFG).map(([k, v]) => (
            <button key={k} onClick={() => setFilterStatus(filterStatus === k ? '' : k)}
              className={clsx('flex items-center gap-2 text-xs transition-all', filterStatus === k ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
              <span className={clsx('w-2.5 h-2.5 rounded-full', v.dot)} />
              {v.label}
            </button>
          ))}
          {filterStatus && <button onClick={() => setFilterStatus('')} className="text-xs text-primary-600 dark:text-primary-400 ml-auto">Clear filter</button>}
        </div>
      </div>

      {/* Ward grids */}
      <div className="space-y-5">
        {filteredWards.map((ward, wi) => {
          const wardOcc = ward.beds.filter(b => b.status === 'OCCUPIED').length
          const wardTotal = wards.find(w => w.id === ward.id)?.beds.length || ward.beds.length
          const wardPct = Math.round((wardOcc / wardTotal) * 100)
          return (
            <motion.div key={ward.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:wi*0.1 }}
              className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-lg">🛏️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{ward.name}</h3>
                    <p className="text-xs text-slate-400">Floor {ward.floorNumber} · {ward.wardType} · {wardOcc}/{wardTotal} occupied ({wardPct}%)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all', wardPct>85?'bg-red-500':wardPct>65?'bg-orange-500':'bg-green-500')}
                      style={{ width:`${wardPct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{wardPct}%</span>
                </div>
              </div>

              <div className="p-4 flex flex-wrap gap-2">
                {ward.beds.map(bed => {
                  const cfg = BED_CFG[bed.status] || BED_CFG.AVAILABLE
                  const isSelected = selectedBed?.id === bed.id
                  return (
                    <motion.button key={bed.id} whileHover={{ scale:1.08 }} whileTap={{ scale:0.95 }}
                      onClick={() => setSelectedBed(isSelected ? null : bed)}
                      className={clsx('w-[52px] h-[46px] rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer', cfg.card, isSelected && 'ring-2 ring-primary-500 ring-offset-1')}
                      title={`${bed.bedNumber} — ${cfg.label}`}>
                      <span className={clsx('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 leading-none">{bed.bedNumber.split('-')[1]}</span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Selected bed actions */}
              <AnimatePresence>
                {selectedBed && ward.beds.find(b => b.id === selectedBed.id) && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    className="border-t border-slate-100 dark:border-slate-700 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={clsx('w-2.5 h-2.5 rounded-full', BED_CFG[selectedBed.status]?.dot)} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Bed {selectedBed.bedNumber}</p>
                        <p className="text-xs text-slate-400">{selectedBed.bedType} · {BED_CFG[selectedBed.status]?.label}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {selectedBed.status === 'AVAILABLE' && (
                        <button onClick={() => openAllocate(selectedBed)} className="btn-primary text-xs py-2 px-4">Allocate Patient</button>
                      )}
                      {selectedBed.status === 'OCCUPIED' && (
                        <button onClick={() => openDischarge(selectedBed)} className="btn-secondary text-xs py-2 px-4">Discharge Patient</button>
                      )}
                      <button onClick={() => setSelectedBed(null)} className="btn-secondary text-xs py-2 px-3">✕</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* ── Allocate Modal ── */}
      <Modal open={showAllocate} onClose={() => { setShowAllocate(false); setSelectedBed(null) }} title="🛏️ Allocate Bed" size="md">
        <form onSubmit={handleAllocate} className="space-y-4">
          {selectedBed && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">🛏️</span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{selectedBed.bedNumber}</p>
                <p className="text-xs text-slate-500">{selectedBed.bedType} Bed</p>
              </div>
            </div>
          )}

          <FormField label="Select Patient" required error={errors.patientId}>
            <select className="input" value={allocForm.patientId}
              onChange={e => setAllocForm(f => ({...f, patientId: e.target.value}))}>
              <option value="">Choose patient…</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.user?.firstName} {p.user?.lastName} ({p.medicalRecordNumber})
                </option>
              ))}
              {patients.length === 0 && <option disabled>Loading patients…</option>}
            </select>
          </FormField>

          <FormField label="Admitting Doctor" required error={errors.admittingDoctorId}>
            <select className="input" value={allocForm.admittingDoctorId}
              onChange={e => setAllocForm(f => ({...f, admittingDoctorId: e.target.value}))}>
              <option value="">Choose doctor…</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  Dr. {d.user?.firstName} {d.user?.lastName} — {d.specialization}
                </option>
              ))}
              {doctors.length === 0 && <option disabled>Loading doctors…</option>}
            </select>
          </FormField>

          <FormField label="Admission Reason" required error={errors.admissionReason}>
            <input className="input" value={allocForm.admissionReason}
              onChange={e => setAllocForm(f => ({...f, admissionReason: e.target.value}))}
              placeholder="e.g. Post-surgical recovery" />
          </FormField>

          <FormField label="Diagnosis">
            <textarea className="input resize-none" rows={2} value={allocForm.diagnosis}
              onChange={e => setAllocForm(f => ({...f, diagnosis: e.target.value}))}
              placeholder="Preliminary diagnosis or working diagnosis…" />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowAllocate(false); setSelectedBed(null) }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Allocating…' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Discharge Modal ── */}
      <Modal open={showDischarge} onClose={() => { setShowDischarge(false); setSelectedBed(null) }} title="🏥 Discharge Patient" size="sm">
        <div className="space-y-4">
          {selectedBed && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 text-sm text-orange-700 dark:text-orange-300">
              Discharging patient from <strong>{selectedBed.bedNumber}</strong>. This will mark the bed as Available.
            </div>
          )}
          <FormField label="Discharge Notes">
            <textarea className="input resize-none" rows={3} value={dischargeNotes}
              onChange={e => setDischargeNotes(e.target.value)}
              placeholder="Any relevant discharge notes, follow-up instructions…" />
          </FormField>
          <div className="flex gap-3">
            <button onClick={() => { setShowDischarge(false); setSelectedBed(null) }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDischarge} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Processing…' : 'Confirm Discharge'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
