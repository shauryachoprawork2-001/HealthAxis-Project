import { clsx } from 'clsx'
export const LoadingSpinner = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={clsx('animate-spin rounded-full border-2 border-current border-t-transparent text-primary-600', sizes[size], className)} />
  )
}

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading HealthAxis…</p>
    </div>
  </div>
)
