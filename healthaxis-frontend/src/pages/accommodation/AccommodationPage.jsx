import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/api/axiosInstance'

const TYPE_LABEL = { PRIVATE_ROOM: 'Private Room', SHARED_ROOM: 'Shared Room', FAMILY_SUITE: 'Family Suite', BUDGET: 'Budget', DORMITORY: 'Dormitory' }
const TYPE_COLOR = {
  PRIVATE_ROOM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHARED_ROOM:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  FAMILY_SUITE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  BUDGET:       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const FALLBACK = [
  { id:'1', name:'MediStay Comfort Lodge', city:'New Delhi', distanceFromHospitalKm:0.8, type:'PRIVATE_ROOM', pricePerNight:1200, availableRooms:18, rating:4.2, amenities:'WiFi,AC,Breakfast,Laundry' },
  { id:'2', name:'Healing Haven Guest House', city:'New Delhi', distanceFromHospitalKm:1.2, type:'SHARED_ROOM', pricePerNight:650, availableRooms:12, rating:3.9, amenities:'WiFi,Meals,TV' },
  { id:'3', name:'CarersNest Family Suite', city:'New Delhi', distanceFromHospitalKm:0.5, type:'FAMILY_SUITE', pricePerNight:2500, availableRooms:4, rating:4.7, amenities:'WiFi,AC,Kitchen,TV,Parking' },
  { id:'4', name:'Budget MediRooms', city:'New Delhi', distanceFromHospitalKm:1.5, type:'BUDGET', pricePerNight:400, availableRooms:25, rating:3.5, amenities:'WiFi,Shared Bath' },
]

export default function AccommodationPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [maxPrice, setMaxPrice] = useState('')
  const [type, setType] = useState('')
  const [selected, setSelected] = useState(null)   // accommodation to book
  const [myStays, setMyStays] = useState([])
  const [showStays, setShowStays] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    relativeFirstName: '', relativeLastName: '', relativePhone: '',
    relativeEmail: '', relationToPatient: '', checkInDate: '', checkOutDate: '', specialRequests: ''
  })
  const [errors, setErrors] = useState({})

  const load = () => {
    setLoading(true)
    axiosInstance.get('/accommodations', { params: { maxPrice: maxPrice || undefined, type: type || undefined } })
      .then(r => setItems(r.data.data?.content?.length ? r.data.data.content : FALLBACK))
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [maxPrice, type])

  const nights = (form.checkInDate && form.checkOutDate)
    ? Math.max(0, (new Date(form.checkOutDate) - new Date(form.checkInDate)) / 86400000)
    : 0

  const validate = () => {
    const e = {}
    if (!form.relativeFirstName.trim()) e.relativeFirstName = 'Required'
    if (!form.relativeLastName.trim()) e.relativeLastName = 'Required'
    if (!form.relativePhone.trim()) e.relativePhone = 'Required'
    if (!form.checkInDate) e.checkInDate = 'Required'
    if (!form.checkOutDate) e.checkOutDate = 'Required'
    if (form.checkInDate && form.checkOutDate && new Date(form.checkOutDate) <= new Date(form.checkInDate))
      e.checkOutDate = 'Must be after check-in'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await axiosInstance.post('/relative-stays', {
        accommodationId: selected.id,
        ...form,
      })
      toast(`Stay booked at ${selected.name}! 🏨`, 'success')
      setSelected(null)
      setForm({ relativeFirstName:'', relativeLastName:'', relativePhone:'', relativeEmail:'', relationToPatient:'', checkInDate:'', checkOutDate:'', specialRequests:'' })
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Booking failed', 'error')
    } finally { setSubmitting(false) }
  }

  const loadMyStays = async () => {
    try {
      const r = await axiosInstance.get('/relative-stays/my')
      setMyStays(r.data.data || [])
    } catch {}
    setShowStays(true)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">MediStay Accommodations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Hospital-linked stays for patient relatives & caregivers</p>
        </div>
        <button onClick={loadMyStays} className="btn-secondary">My Stays</button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Room Type</label>
          <select className="input" value={type} onChange={e => setType(e.target.value)}>
            <option value="">All Types</option>
            <option value="PRIVATE_ROOM">Private Room</option>
            <option value="SHARED_ROOM">Shared Room</option>
            <option value="FAMILY_SUITE">Family Suite</option>
            <option value="BUDGET">Budget</option>
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Max Price / Night (₹)</label>
          <input type="number" className="input" placeholder="e.g. 1500" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
        <button onClick={load} className="btn-primary">Search</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : items.length === 0 ? (
        <EmptyState title="No accommodations found" description="Try adjusting your filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="card-hover overflow-hidden">
              {/* Hero */}
              <div className="h-36 bg-gradient-to-br from-blue-100 to-teal-50 dark:from-blue-900/30 dark:to-teal-900/20 relative flex items-center justify-center">
                <span className="text-6xl">🏨</span>
                <div className="absolute top-3 right-3">
                  <span className={`badge ${TYPE_COLOR[a.type] || 'bg-slate-100 text-slate-600'}`}>
                    {TYPE_LABEL[a.type] || a.type}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-slate-900 dark:text-white">{a.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  📍 {a.city} · {a.distanceFromHospitalKm} km from hospital
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.round(a.rating) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600'}`}>★</span>
                  ))}
                  <span className="text-xs text-slate-400 ml-1">{a.rating}</span>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {(a.amenities?.split(',') || []).map(am => (
                    <span key={am} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-full">{am.trim()}</span>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      ₹{Number(a.pricePerNight).toLocaleString('en-IN')}
                      <span className="text-xs text-slate-400 font-normal">/night</span>
                    </p>
                    <p className={`text-xs font-semibold mt-0.5 ${a.availableRooms > 5 ? 'text-green-600' : a.availableRooms > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                      {a.availableRooms > 0 ? `${a.availableRooms} rooms available` : 'Fully booked'}
                    </p>
                  </div>
                  <button
                    disabled={a.availableRooms === 0}
                    onClick={() => setSelected(a)}
                    className={a.availableRooms > 0 ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}>
                    {a.availableRooms > 0 ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Booking Modal ── */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Book — ${selected?.name}`} size="lg">
        {selected && (
          <form onSubmit={handleBook} className="space-y-5">
            {/* Summary card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center gap-4">
              <span className="text-3xl">🏨</span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{selected.name}</p>
                <p className="text-sm text-slate-500">{selected.distanceFromHospitalKm} km from hospital · ₹{Number(selected.pricePerNight).toLocaleString()}/night</p>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Relative / Caregiver Details</p>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" required error={errors.relativeFirstName}>
                <input className="input" value={form.relativeFirstName} onChange={e => setForm(f => ({...f, relativeFirstName: e.target.value}))} placeholder="Anita" />
              </FormField>
              <FormField label="Last Name" required error={errors.relativeLastName}>
                <input className="input" value={form.relativeLastName} onChange={e => setForm(f => ({...f, relativeLastName: e.target.value}))} placeholder="Sharma" />
              </FormField>
              <FormField label="Phone Number" required error={errors.relativePhone}>
                <input className="input" value={form.relativePhone} onChange={e => setForm(f => ({...f, relativePhone: e.target.value}))} placeholder="+91 9876543210" />
              </FormField>
              <FormField label="Email Address">
                <input type="email" className="input" value={form.relativeEmail} onChange={e => setForm(f => ({...f, relativeEmail: e.target.value}))} placeholder="anita@email.com" />
              </FormField>
            </div>

            <FormField label="Relation to Patient">
              <select className="input" value={form.relationToPatient} onChange={e => setForm(f => ({...f, relationToPatient: e.target.value}))}>
                <option value="">Select relation…</option>
                {['Spouse','Parent','Child','Sibling','Friend','Other'].map(r => <option key={r}>{r}</option>)}
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Check-In Date" required error={errors.checkInDate}>
                <input type="date" className="input" min={today} value={form.checkInDate}
                  onChange={e => setForm(f => ({...f, checkInDate: e.target.value}))} />
              </FormField>
              <FormField label="Check-Out Date" required error={errors.checkOutDate}>
                <input type="date" className="input" min={form.checkInDate || today} value={form.checkOutDate}
                  onChange={e => setForm(f => ({...f, checkOutDate: e.target.value}))} />
              </FormField>
            </div>

            {nights > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">{nights} night{nights > 1 ? 's' : ''} × ₹{Number(selected.pricePerNight).toLocaleString()}</span>
                <span className="font-bold text-green-700 dark:text-green-400 text-lg">₹{(nights * selected.pricePerNight).toLocaleString('en-IN')}</span>
              </div>
            )}

            <FormField label="Special Requests">
              <textarea className="input resize-none" rows={2} placeholder="Any special requirements, dietary needs…"
                value={form.specialRequests} onChange={e => setForm(f => ({...f, specialRequests: e.target.value}))} />
            </FormField>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Confirming…' : `Confirm Booking ${nights > 0 ? `· ₹${(nights * selected.pricePerNight).toLocaleString('en-IN')}` : ''}`}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── My Stays Modal ── */}
      <Modal open={showStays} onClose={() => setShowStays(false)} title="My Stays" size="md">
        {myStays.length === 0 ? (
          <EmptyState title="No stays booked" description="Book your first stay using the marketplace." />
        ) : (
          <div className="space-y-3">
            {myStays.map(stay => (
              <div key={stay.id} className="card p-4">
                <p className="font-semibold">{stay.accommodation?.name}</p>
                <p className="text-sm text-slate-400">{stay.checkInDate} → {stay.checkOutDate}</p>
                <p className="text-xs text-slate-400 mt-1">Status: {stay.status}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
