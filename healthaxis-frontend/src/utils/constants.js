export const ROLES = {
  ADMIN: 'ADMIN', DOCTOR: 'DOCTOR', NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST', PATIENT: 'PATIENT',
  ATTENDANT: 'ATTENDANT', ACCOMMODATION_MANAGER: 'ACCOMMODATION_MANAGER',
}

export const PRIORITY_CONFIG = {
  CRITICAL: { label: 'Critical', color: 'badge-critical', dot: 'bg-red-500', ring: 'ring-red-500' },
  HIGH:     { label: 'High',     color: 'badge-high',     dot: 'bg-orange-500', ring: 'ring-orange-500' },
  MEDIUM:   { label: 'Medium',   color: 'badge-medium',   dot: 'bg-yellow-500', ring: 'ring-yellow-500' },
  LOW:      { label: 'Low',      color: 'badge-low',      dot: 'bg-green-500',  ring: 'ring-green-500' },
}

export const APPOINTMENT_STATUS_CONFIG = {
  SCHEDULED:    { label: 'Scheduled',    color: 'bg-blue-100 text-blue-700' },
  CONFIRMED:    { label: 'Confirmed',    color: 'bg-green-100 text-green-700' },
  IN_PROGRESS:  { label: 'In Progress',  color: 'bg-purple-100 text-purple-700' },
  COMPLETED:    { label: 'Completed',    color: 'bg-slate-100 text-slate-700' },
  CANCELLED:    { label: 'Cancelled',    color: 'bg-red-100 text-red-700' },
  NO_SHOW:      { label: 'No Show',      color: 'bg-orange-100 text-orange-700' },
  RESCHEDULED:  { label: 'Rescheduled',  color: 'bg-yellow-100 text-yellow-700' },
}

export const BED_STATUS_CONFIG = {
  AVAILABLE:    { label: 'Available',    color: 'text-green-600',  bg: 'bg-green-100' },
  OCCUPIED:     { label: 'Occupied',     color: 'text-red-600',    bg: 'bg-red-100' },
  RESERVED:     { label: 'Reserved',     color: 'text-yellow-600', bg: 'bg-yellow-100' },
  MAINTENANCE:  { label: 'Maintenance',  color: 'text-slate-600',  bg: 'bg-slate-100' },
}
