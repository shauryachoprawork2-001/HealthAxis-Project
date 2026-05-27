import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue', loading }) => {
  const colors = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-blue-600 dark:text-blue-400',   ring: 'ring-blue-100 dark:ring-blue-800' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600 dark:text-green-400', ring: 'ring-green-100 dark:ring-green-800' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20',     icon: 'text-red-600 dark:text-red-400',     ring: 'ring-red-100 dark:ring-red-800' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-100 dark:ring-purple-800' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-100 dark:ring-orange-800' },
  }
  const c = colors[color] || colors.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg mt-2 animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value ?? '—'}</p>
          )}
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          {trend != null && (
            <p className={clsx('text-xs font-semibold mt-2', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl ring-1', c.bg, c.ring)}>
            <Icon className={clsx('w-5 h-5', c.icon)} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
