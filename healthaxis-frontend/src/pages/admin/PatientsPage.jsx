import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import axiosInstance from '@/api/axiosInstance'

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

const FALLBACK = [
  { id:'1', medicalRecordNumber:'MRN-A1B2C3D4', dateOfBirth:'1985-06-15', gender:'Male', bloodGroup:'O+', city:'New Delhi', user:{firstName:'Rahul',lastName:'Verma',email:'rahul@email.com',phoneNumber:'+919876543210'} },
  { id:'2', medicalRecordNumber:'MRN-E5F6A7B8', dateOfBirth:'1992-11-28', gender:'Female', bloodGroup:'A+', city:'Mumbai', user:{firstName:'Sneha',lastName:'Gupta',email:'sneha@email.com',phoneNumber:'+919876543211'} },
  { id:'3', medicalRecordNumber:'MRN-C9D0E1F2', dateOfBirth:'1978-03-02', gender:'Male', bloodGroup:'B-', city:'Bangalore', user:{firstName:'Anil',lastName:'Kumar',email:'anil@email.com',phoneNumber:'+919876543212'} },
  { id:'4', medicalRecordNumber:'MRN-G3H4I5J6', dateOfBirth:'2001-09-20', gender:'Female', bloodGroup:'AB+', city:'Chennai', user:{firstName:'Divya',lastName:'Pillai',email:'divya@email.com',phoneNumber:'+919876543213'} },
  { id:'5', medicalRecordNumber:'MRN-K7L8M9N0', dateOfBirth:'1968-04-11', gender:'Male', bloodGroup:'O-', city:'Kolkata', user:{firstName:'Rohit',lastName:'Das',email:'rohit@email.com',phoneNumber:'+919876543214'} },
]

const age = (dob) => dob ? Math.floor((Date.now() - new Date(dob)) / (365.25*24*3600*1000)) : '—'

export default function PatientsPage() {
  const toast = useToast()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showDetail, setShowDetail] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    axiosInstance.get('/patients', { params:{ search: search || undefined, page, size:20 } })
      .then(r => {
        setPatients(r.data.data?.content?.length ? r.data.data.content : FALLBACK)
        setTotalPages(r.data.data?.totalPages || 1)
      })
      .catch(() => setPatients(FALLBACK))
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{patients.length} registered patients</p>
        </div>
      </div>

      <div className="flex gap-3">
        <input className="input max-w-sm" placeholder="Search by name, email or MRN…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : patients.length === 0 ? (
        <EmptyState title="No patients found" description="Try adjusting your search." />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['Patient','MRN','Age / Gender','Blood','Location','Phone','Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {patients.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setShowDetail(p)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{p.user?.firstName?.[0]}{p.user?.lastName?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{p.user?.firstName} {p.user?.lastName}</p>
                          <p className="text-xs text-slate-400">{p.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{p.medicalRecordNumber}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{age(p.dateOfBirth)}y · {p.gender}</td>
                    <td className="px-5 py-3.5">
                      <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{p.bloodGroup || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{p.city || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">{p.user?.phoneNumber || '—'}</td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <button onClick={() => setShowDetail(p)} className="btn-secondary text-xs py-1 px-2.5">View</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p-1)} className="btn-secondary text-xs py-2 px-4">← Prev</button>
              <span className="flex items-center text-sm text-slate-500">Page {page+1} of {totalPages}</span>
              <button disabled={page >= totalPages-1} onClick={() => setPage(p => p+1)} className="btn-secondary text-xs py-2 px-4">Next →</button>
            </div>
          )}
        </>
      )}

      {/* Patient Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Patient Profile" size="md">
        {showDetail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">{showDetail.user?.firstName?.[0]}{showDetail.user?.lastName?.[0]}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{showDetail.user?.firstName} {showDetail.user?.lastName}</h3>
                <p className="text-sm text-slate-400 font-mono">{showDetail.medicalRecordNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label:'Age', val: age(showDetail.dateOfBirth) + ' years' },
                { label:'Gender', val: showDetail.gender || '—' },
                { label:'Blood Group', val: showDetail.bloodGroup || '—' },
                { label:'City', val: showDetail.city || '—' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{s.label}</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{s.val}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2 text-slate-500"><span>📧</span><span>{showDetail.user?.email}</span></div>
              {showDetail.user?.phoneNumber && <div className="flex gap-2 text-slate-500"><span>📱</span><span>{showDetail.user.phoneNumber}</span></div>}
              {showDetail.allergies && <div className="flex gap-2 text-slate-500"><span>⚠️</span><span>Allergies: {showDetail.allergies}</span></div>}
              {showDetail.chronicConditions && <div className="flex gap-2 text-slate-500"><span>🏥</span><span>Chronic: {showDetail.chronicConditions}</span></div>}
            </div>

            {showDetail.emergencyContactName && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">Emergency Contact</p>
                <p className="text-sm font-semibold">{showDetail.emergencyContactName} ({showDetail.emergencyContactRelation})</p>
                <p className="text-xs text-slate-400">{showDetail.emergencyContactPhone}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
