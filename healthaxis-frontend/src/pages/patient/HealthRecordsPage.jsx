import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import axiosInstance from '@/api/axiosInstance'

const RECORD_CFG = {
  CONSULTATION:     { icon:'👨‍⚕️', label:'Consultation',     bg:'bg-blue-50 dark:bg-blue-900/20',    border:'border-blue-200 dark:border-blue-800',   badge:'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  LAB:              { icon:'🔬', label:'Lab Report',          bg:'bg-green-50 dark:bg-green-900/20',  border:'border-green-200 dark:border-green-800', badge:'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  IMAGING:          { icon:'🩻', label:'Imaging',             bg:'bg-purple-50 dark:bg-purple-900/20',border:'border-purple-200 dark:border-purple-800',badge:'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
  DISCHARGE_SUMMARY:{ icon:'📋', label:'Discharge Summary',   bg:'bg-orange-50 dark:bg-orange-900/20',border:'border-orange-200 dark:border-orange-800',badge:'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
}

const FALLBACK = [
  { id:'1', recordType:'CONSULTATION', visitDate:'2024-02-14', diagnosis:'Seasonal Influenza — Type A', prescription:'Paracetamol 500mg × 3 daily, Oseltamivir 75mg × 2 daily for 5 days, Rest and hydration', doctor:{ user:{ firstName:'Arjun', lastName:'Mehta' } }, followUpInstructions:'Follow up in 7 days if fever persists beyond 38.5°C' },
  { id:'2', recordType:'LAB', visitDate:'2024-02-05', diagnosis:'Complete Blood Count (CBC)', labResults:'Haemoglobin: 13.2 g/dL ✓\nWBC: 7,800 /µL ✓\nPlatelets: 2.4L /µL ✓\nAll values within normal reference range.', doctor:{ user:{ firstName:'Priya', lastName:'Sharma' } } },
  { id:'3', recordType:'IMAGING', visitDate:'2024-01-20', diagnosis:'Chest X-Ray — PA View', imagingResults:'No active pulmonary lesions detected. Heart size normal (CTR 0.44). Both costophrenic angles clear. Trachea central. No pleural effusion.', doctor:{ user:{ firstName:'Vikram', lastName:'Singh' } } },
  { id:'4', recordType:'DISCHARGE_SUMMARY', visitDate:'2024-01-10', diagnosis:'Appendicitis — Post-operative', prescription:'Amoxicillin-Clavulanate 625mg × 2 daily for 7 days\nIbuprofen 400mg SOS for pain', doctor:{ user:{ firstName:'Suresh', lastName:'Patel' } }, treatmentPlan:'Laparoscopic appendectomy performed successfully on 2024-01-08. Uneventful recovery. Suture removal after 10 days.', followUpInstructions:'Avoid heavy lifting for 2 weeks. Suture removal at nearest clinic on Day 10.' },
]

export default function HealthRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    axiosInstance.get('/medical-records/my')
      .then(r => setRecords(r.data.data?.content?.length ? r.data.data.content : FALLBACK))
      .catch(() => setRecords(FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filterType ? records.filter(r => r.recordType === filterType) : records

  const stats = [
    { label:'Total Records', val:records.length },
    { label:'Consultations', val:records.filter(r=>r.recordType==='CONSULTATION').length },
    { label:'Lab Reports', val:records.filter(r=>r.recordType==='LAB').length },
    { label:'Imaging', val:records.filter(r=>r.recordType==='IMAGING').length },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Health Records</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your complete medical history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
            className="card p-4 text-center">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{s.val}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType('')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${!filterType ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>
          All
        </button>
        {Object.entries(RECORD_CFG).map(([k, v]) => (
          <button key={k} onClick={() => setFilterType(filterType === k ? '' : k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 ${filterType === k ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>
            <span>{v.icon}</span>{v.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={() => <span className="text-5xl">📋</span>} title="No records found" description="Your health records will appear here." />
      ) : (
        <div className="space-y-4">
          {filtered.map((rec, i) => {
            const cfg = RECORD_CFG[rec.recordType] || RECORD_CFG.CONSULTATION
            return (
              <motion.div key={rec.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                onClick={() => setSelected(rec)} className={`rounded-2xl border ${cfg.bg} ${cfg.border} p-5 cursor-pointer hover:shadow-md transition-shadow`}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{rec.diagnosis}</span>
                      <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Dr. {rec.doctor?.user?.firstName} {rec.doctor?.user?.lastName} ·{' '}
                      {new Date(rec.visitDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                    </p>
                    {rec.prescription && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1">💊 {rec.prescription.split('\n')[0]}</p>
                    )}
                    {rec.labResults && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1">🔬 {rec.labResults.split('\n')[0]}</p>
                    )}
                    {rec.imagingResults && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1">🩻 {rec.imagingResults.split('\n')[0]}</p>
                    )}
                    {rec.followUpInstructions && (
                      <p className="text-xs text-slate-400 mt-1.5 italic">📌 {rec.followUpInstructions}</p>
                    )}
                  </div>
                  <span className="text-slate-300 dark:text-slate-600 text-sm flex-shrink-0">›</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Record Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Medical Record" size="lg">
        {selected && (() => {
          const cfg = RECORD_CFG[selected.recordType] || RECORD_CFG.CONSULTATION
          return (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${cfg.bg} ${cfg.border} border flex items-center justify-center text-3xl flex-shrink-0`}>{cfg.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selected.diagnosis}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Dr. {selected.doctor?.user?.firstName} {selected.doctor?.user?.lastName} ·{' '}
                    {new Date(selected.visitDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                  </p>
                  <span className={`badge mt-2 ${cfg.badge}`}>{cfg.label}</span>
                </div>
              </div>

              {selected.prescription && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">💊 Prescription</p>
                  <pre className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{selected.prescription}</pre>
                </div>
              )}
              {selected.labResults && (
                <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4">
                  <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">🔬 Lab Results</p>
                  <pre className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{selected.labResults}</pre>
                </div>
              )}
              {selected.imagingResults && (
                <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-4">
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">🩻 Imaging Report</p>
                  <pre className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{selected.imagingResults}</pre>
                </div>
              )}
              {selected.treatmentPlan && (
                <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-4">
                  <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">🏥 Treatment Plan</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{selected.treatmentPlan}</p>
                </div>
              )}
              {selected.followUpInstructions && (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📌 Follow-up Instructions</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 italic">{selected.followUpInstructions}</p>
                </div>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
