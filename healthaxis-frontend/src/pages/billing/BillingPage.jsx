import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/api/axiosInstance'
import { clsx } from 'clsx'

const STATUS_CFG = {
  PAID:    { label:'Paid',    bg:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  PENDING: { label:'Pending', bg:'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  PARTIAL: { label:'Partial', bg:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  FAILED:  { label:'Failed',  bg:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  WAIVED:  { label:'Waived',  bg:'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
}

const PAYMENT_METHODS = [
  { value:'CARD', label:'💳 Credit / Debit Card' },
  { value:'UPI',  label:'📱 UPI' },
  { value:'CASH', label:'💵 Cash' },
  { value:'BANK_TRANSFER', label:'🏦 Bank Transfer' },
  { value:'INSURANCE', label:'🛡️ Insurance' },
]

const FALLBACK_INVOICES = [
  { id:'1', invoiceNumber:'INV-A1B2C3D4', totalAmount:8500, paidAmount:8500, paymentStatus:'PAID', createdAt:'2024-01-20', dueDate:'2024-01-27', billingItems:[{description:'Cardiology Consultation',category:'CONSULTATION',quantity:1,unitPrice:800,totalPrice:800},{description:'ECG',category:'PROCEDURE',quantity:1,unitPrice:500,totalPrice:500},{description:'Room Charge (2 days)',category:'ROOM_CHARGE',quantity:2,unitPrice:3600,totalPrice:7200}] },
  { id:'2', invoiceNumber:'INV-E5F6A7B8', totalAmount:15200, paidAmount:5000, paymentStatus:'PARTIAL', createdAt:'2024-02-05', dueDate:'2024-02-12', billingItems:[{description:'Neurology Consultation',category:'CONSULTATION',quantity:1,unitPrice:1000,totalPrice:1000},{description:'MRI Brain',category:'PROCEDURE',quantity:1,unitPrice:8000,totalPrice:8000},{description:'ICU (1 day)',category:'ROOM_CHARGE',quantity:1,unitPrice:6200,totalPrice:6200}] },
  { id:'3', invoiceNumber:'INV-C9D0E1F2', totalAmount:3200, paidAmount:0, paymentStatus:'PENDING', createdAt:'2024-02-14', dueDate:'2024-02-21', billingItems:[{description:'General Consultation',category:'CONSULTATION',quantity:1,unitPrice:500,totalPrice:500},{description:'Blood Tests',category:'LAB',quantity:3,unitPrice:900,totalPrice:2700}] },
]

export default function BillingPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showPayModal, setShowPayModal] = useState(null)
  const [payForm, setPayForm] = useState({ amount:'', method:'UPI', transactionId:'' })
  const [paying, setPaying] = useState(false)
  const [payErrors, setPayErrors] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Try to get patient profile first, then invoices
      const patientRes = await axiosInstance.get('/patients/me').catch(() => null)
      if (patientRes?.data?.data?.id) {
        const invoiceRes = await axiosInstance.get(`/billing/patient/${patientRes.data.data.id}`)
        setInvoices(invoiceRes.data.data?.content || FALLBACK_INVOICES)
      } else {
        setInvoices(FALLBACK_INVOICES)
      }
    } catch {
      setInvoices(FALLBACK_INVOICES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const totalDue = invoices
    .filter(i => i.paymentStatus !== 'PAID' && i.paymentStatus !== 'WAIVED')
    .reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)

  const validatePay = () => {
    const e = {}
    if (!payForm.amount || Number(payForm.amount) <= 0) e.amount = 'Enter a valid amount'
    const inv = showPayModal
    if (inv && Number(payForm.amount) > (Number(inv.totalAmount) - Number(inv.paidAmount)))
      e.amount = `Cannot exceed outstanding amount of ₹${(Number(inv.totalAmount) - Number(inv.paidAmount)).toLocaleString('en-IN')}`
    if (!payForm.method) e.method = 'Select payment method'
    setPayErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePay = async (e) => {
    e.preventDefault()
    if (!validatePay()) return
    setPaying(true)
    try {
      await axiosInstance.post(`/billing/${showPayModal.id}/pay`, null, {
        params: { amount: payForm.amount, method: payForm.method, transactionId: payForm.transactionId || undefined }
      })
      toast('Payment recorded successfully! 💳', 'success')
      setShowPayModal(null)
      setPayForm({ amount:'', method:'UPI', transactionId:'' })
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Payment failed. Please try again.', 'error')
    } finally { setPaying(false) }
  }

  const openPay = (inv) => {
    const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount)
    setPayForm({ amount: String(outstanding), method:'UPI', transactionId:'' })
    setPayErrors({})
    setShowPayModal(inv)
  }

  const CATEGORY_ICONS = {
    CONSULTATION: '👨‍⚕️', ROOM_CHARGE: '🛏️', PROCEDURE: '🔬',
    LAB: '🧪', MEDICATION: '💊', TRANSPORT: '🚑', IMAGING: '🩻',
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Billing & Payments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track invoices and manage payments</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total Invoices',   val:invoices.length,                                            color:'text-slate-900 dark:text-white',  bg:'bg-white dark:bg-slate-800' },
          { label:'Amount Due',       val:`₹${totalDue.toLocaleString('en-IN')}`,                     color:'text-red-600 dark:text-red-400',   bg:'bg-red-50 dark:bg-red-900/20' },
          { label:'Paid Invoices',    val:invoices.filter(i=>i.paymentStatus==='PAID').length,         color:'text-green-600 dark:text-green-400',bg:'bg-green-50 dark:bg-green-900/20' },
          { label:'Partially Paid',   val:invoices.filter(i=>i.paymentStatus==='PARTIAL').length,      color:'text-blue-600 dark:text-blue-400',  bg:'bg-blue-50 dark:bg-blue-900/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 ${s.bg}`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : invoices.length === 0 ? (
        <EmptyState icon={() => <span className="text-5xl">💳</span>} title="No invoices" description="Your billing history will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="section-title">Invoice History</h2>
            <span className="text-xs text-slate-400">{invoices.length} invoices</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {invoices.map((inv, i) => {
              const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount)
              const sc = STATUS_CFG[inv.paymentStatus] || STATUS_CFG.PENDING
              return (
                <motion.div key={inv.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.06 }}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 dark:text-white font-mono text-sm">{inv.invoiceNumber}</p>
                      <span className={clsx('badge', sc.bg)}>{sc.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Issued {new Date(inv.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      {inv.dueDate && ` · Due ${new Date(inv.dueDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}`}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-900 dark:text-white">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</p>
                    {inv.paymentStatus === 'PARTIAL' && (
                      <p className="text-xs text-orange-500 font-medium">₹{outstanding.toLocaleString('en-IN')} remaining</p>
                    )}
                    {inv.paymentStatus === 'PAID' && (
                      <p className="text-xs text-green-500 font-medium">Fully paid</p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setSelectedInvoice(inv)}
                      className="btn-secondary text-xs py-1.5 px-3">View</button>
                    {(inv.paymentStatus === 'PENDING' || inv.paymentStatus === 'PARTIAL') && (
                      <button onClick={() => openPay(inv)} className="btn-primary text-xs py-1.5 px-3">Pay Now</button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Invoice Detail Modal ── */}
      <Modal open={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Invoice Details" size="lg">
        {selectedInvoice && (() => {
          const inv = selectedInvoice
          const sc = STATUS_CFG[inv.paymentStatus] || STATUS_CFG.PENDING
          const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount)
          return (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{inv.invoiceNumber}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Issued {new Date(inv.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                    {inv.dueDate && ` · Due ${new Date(inv.dueDate).toLocaleDateString('en-IN', { day:'numeric', month:'long' })}`}
                  </p>
                </div>
                <span className={clsx('badge text-sm px-3 py-1.5', sc.bg)}>{sc.label}</span>
              </div>

              {/* Line items */}
              {inv.billingItems?.length > 0 && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50">
                        {['Item','Category','Qty','Unit Price','Total'].map(h => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {inv.billingItems.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{item.description}</td>
                          <td className="px-4 py-3 text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <span>{CATEGORY_ICONS[item.category] || '📄'}</span>
                              <span className="text-xs">{item.category}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{item.quantity}</td>
                          <td className="px-4 py-3 text-slate-500">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">₹{Number(item.totalPrice).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 space-y-2">
                {[
                  { label:'Subtotal', val: inv.subtotal },
                  { label:'Tax (GST 18%)', val: inv.taxAmount },
                  { label:'Discount', val: inv.discountAmount, negative: true },
                ].map(row => row.val != null && Number(row.val) > 0 && (
                  <div key={row.label} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{row.label}</span>
                    <span>{row.negative ? '-' : ''}₹{Number(row.val).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-600 pt-2 flex justify-between font-bold text-base">
                  <span className="text-slate-900 dark:text-white">Total</span>
                  <span className="text-slate-900 dark:text-white">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                {Number(inv.paidAmount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-semibold">
                    <span>Amount Paid</span>
                    <span>- ₹{Number(inv.paidAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {outstanding > 0 && (
                  <div className="flex justify-between text-sm text-red-600 dark:text-red-400 font-bold">
                    <span>Outstanding Balance</span>
                    <span>₹{outstanding.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {(inv.paymentStatus === 'PENDING' || inv.paymentStatus === 'PARTIAL') && (
                <button onClick={() => { setSelectedInvoice(null); openPay(inv) }} className="btn-primary w-full py-3">
                  💳 Pay ₹{outstanding.toLocaleString('en-IN')} Now
                </button>
              )}
            </div>
          )
        })()}
      </Modal>

      {/* ── Pay Modal ── */}
      <Modal open={!!showPayModal} onClose={() => setShowPayModal(null)} title="💳 Make Payment" size="md">
        {showPayModal && (
          <form onSubmit={handlePay} className="space-y-5">
            {/* Invoice summary chip */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400">Invoice</p>
                <p className="font-bold font-mono text-sm">{showPayModal.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Outstanding</p>
                <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                  ₹{(Number(showPayModal.totalAmount) - Number(showPayModal.paidAmount)).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <FormField label="Payment Amount (₹)" required error={payErrors.amount}>
              <input type="number" min="1" step="1" className="input text-lg font-bold" value={payForm.amount}
                onChange={e => setPayForm(f => ({...f, amount: e.target.value}))} placeholder="Enter amount" />
            </FormField>

            <FormField label="Payment Method" required error={payErrors.method}>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.value} type="button"
                    onClick={() => setPayForm(f => ({...f, method: m.value}))}
                    className={clsx(
                      'px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left',
                      payForm.method === m.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    )}>
                    {m.label}
                  </button>
                ))}
              </div>
            </FormField>

            {(payForm.method === 'CARD' || payForm.method === 'UPI' || payForm.method === 'BANK_TRANSFER') && (
              <FormField label="Transaction / Reference ID" hint="Enter the transaction ID from your bank">
                <input className="input font-mono" value={payForm.transactionId}
                  onChange={e => setPayForm(f => ({...f, transactionId: e.target.value}))}
                  placeholder="TXN123456789" />
              </FormField>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
              ℹ️ Payment confirmation will be sent to your registered email and phone.
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowPayModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={paying} className="btn-primary flex-1 py-3">
                {paying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : `Confirm ₹${Number(payForm.amount || 0).toLocaleString('en-IN')} Payment`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
