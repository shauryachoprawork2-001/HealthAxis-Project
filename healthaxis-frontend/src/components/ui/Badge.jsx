import { clsx } from 'clsx'
import { PRIORITY_CONFIG, APPOINTMENT_STATUS_CONFIG } from '@/utils/constants'

export const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.LOW
  return (
    <span className={clsx('badge', cfg.color)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

export const AppointmentStatusBadge = ({ status }) => {
  const cfg = APPOINTMENT_STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-600' }
  return <span className={clsx('badge', cfg.color)}>{cfg.label}</span>
}

export const RoleBadge = ({ role }) => {
  const colors = {
    ADMIN: 'bg-purple-100 text-purple-700',
    DOCTOR: 'bg-blue-100 text-blue-700',
    NURSE: 'bg-teal-100 text-teal-700',
    RECEPTIONIST: 'bg-yellow-100 text-yellow-700',
    PATIENT: 'bg-green-100 text-green-700',
    ATTENDANT: 'bg-orange-100 text-orange-700',
  }
  return <span className={clsx('badge', colors[role] || 'bg-slate-100 text-slate-600')}>{role}</span>
}
